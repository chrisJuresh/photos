"""Phase 4: give every kept object a vault name, then destroy the other name.

The bytes never move. A promotion is `CreateHardLinkW` followed by `DeleteFileW`,
so the surviving vault name points at the same extent Phase 2a hashed. What
Phase 4 destroys is *directory entries* -- 38,376 MediaVault names whose bytes
survive under the vault, and 107,658 excluded objects whose bytes do not survive
at all. That second number is the majority of the run and the only delete path in
the system apart from `G:\\photos` at the Gate.

The mechanism is proven and is not the dangerous part. SPIKE B established that
the hardlink needs no privilege, creates no reparse point, fails loudly at
winerror 17 across volumes without creating anything, and that a first-name
unlink is O(1) in file size; 6,000 full promotions ran clean. The *ordering* is
what has destroyed data, twice:

* A link-all-then-unlink-all batch deleted an object whose link had failed
  because its vault name already existed from an interrupted run. The survivor
  has the right name, `nlink 1`, an ordinary directory listing and the wrong
  bytes. So promotion here is per object, state-classified immediately before
  every action, and there is no pass that deletes from a list.
* `ERROR_ALREADY_EXISTS (183)` was read as "already linked, proceed to unlink" --
  the only reading that makes a 146k-object run resumable -- and it permanently
  destroyed the only copy of a file. 183 is returned identically for "the target
  is my own hardlink", "the target is an unrelated file", and a case-only
  collision on NTFS. Nothing here branches on it: it re-enters the classifier.

Two more things the obvious implementation gets wrong.

`FILE_ATTRIBUTE_READONLY` lives in the shared MFT record, not in the directory
entry, so setting it on the new name sets it on the old one and NTFS then refuses
to unlink *either*, at `ERROR_ACCESS_DENIED (5)`. Read-only is therefore set only
after the MediaVault name is gone and the survivor is back to `nlink == 1` -- and
never when the unlink did not succeed, because that mutates the repair error from
32 to 5 and makes the surviving object undeletable by a repair pass written to
retry on 32. This is `v1`'s `F06` one layer down: a crash that leaves two names on
one mutable inode.

`st_nlink == 2` is one extent with two names, not two copies. It reads like
redundancy and is its opposite, so this module reports objects per second and
never bytes per second: summing logical sizes would double-count every promotion.

Identity, never name existence, decides "already promoted". A completed promotion
is metadata-identical to an ordinary unrelated file, so `os.path.exists` is not a
valid predicate anywhere in here. The record of what happened is the
`promotion` row, written *before* the syscall, plus the append-only JSONL log of
every delete.

`os.link` and `os.remove` are CPython's thin wrappers over `CreateHardLinkW` and
`DeleteFileW` and they preserve `OSError.winerror`, so the syscalls are the ones
SPIKE B measured with one fewer ctypes signature to get wrong. Verification is
`os.stat`, which on Windows *is* `GetFileInformationByHandle` -- and when it has
to fall back to `FindFirstFileW` for a file it cannot open it reports
`st_ino == 0` and `st_nlink == 0`, which is why "index != 0" is the assertion that
catches a degraded read rather than trusting one.

Budget ~1.3 hours. The NTFS work is ~2 ms per object, but cold metadata on the
real object store measured 31.3 ms mean / 297 ms p95 / 811 ms max, and one
`os.remove` took 3,081 ms under contention. Nothing else may touch `G:` while
this runs -- and `F:` is the same physical disk. Every Python reader in this
project blocks the unlink, because CPython's `open()` does not pass
`FILE_SHARE_DELETE`; so does an Explorer window left open on the object.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import sqlite3
import stat
import sys
import time
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

from photolib import db, migrate, reveal, triage
from photolib.adopt_mediavault import object_index
from photolib.config import Config, load
from photolib.origins import FILENAME as ORIGINS_FILENAME

LOCK_NAME = "promote.lock"
UNLINK_LOG_NAME = "promote-unlink.log"

# One free-space assertion per batch, and one commit boundary per batch.
BATCH = 500
# A hardlink costs ~410 B into an existing directory; a 25 MiB copy costs
# 26,775,552 B. G: has 1.75 TiB free, so a full 420 GB degradation to copy
# completes with 1.3 TB to spare and raises nothing else -- this is the only
# check that would notice.
FREE_PER_LINK = 256 * 1024
FREE_SLACK = 1 << 20

# Real object paths max 148 chars and 369-char paths work unprefixed on this
# volume, so a bound is asserted instead of adding `\\?\` ceremony. A promoted
# name is `<vault_root>\<aa>\<bb>\<64 hex><ext>`, which is 96 chars at the
# longest extension this corpus holds.
MAX_TARGET_CHARS = 200

# Contention measured at 0.5%, all of it recovered on the first 20 ms retry. The
# tail is generous because one os.remove took 3,081 ms; after this the object is
# left half-linked and recorded, never forced.
DELETE_BACKOFF_MS = (20, 40, 80, 160, 320, 640, 1280, 2560)

SHARING_VIOLATION = 32
ACCESS_DENIED = 5

HASH_CHUNK = 8 << 20
PROGRESS_SECONDS = 60
SAMPLE_STATS = 500

# A vault target name is data-derived, so its shape is validated at the boundary
# rather than trusted. 60 distinct extensions in this corpus, one of them empty.
EXT_OK = re.compile(r"^(\.[A-Za-z0-9_+\-]{1,16})?$")
SHA_OK = re.compile(r"^[0-9a-f]{64}$")
SHARD = re.compile(r"^[0-9a-f]{2}$")

# The three populations, and the ledger's `intent` values.
PROMOTE, UNLINK, STAGE_RENAME = "promote", "unlink", "stage_rename"

# The classifier's answers. S0 and S1 are actionable; the rest are not.
S0, S1, COLLISION, AMBIGUOUS, ABSENT = "S0", "S1", "collision", "ambiguous", "absent"


class PromoteRefused(RuntimeError):
    """Raised instead of acting. Whatever it names, nothing was destroyed."""


# --- one process, one lock file ----------------------------------------------


class RunLock:
    """An advisory lock naming the process that holds it.

    Same shape as `phase2a.RunLock`: a killed run leaves the file behind, so a
    stale lock is detected by asking whether its PID is alive rather than by
    trusting the file's existence.
    """

    def __init__(self, path: Path) -> None:
        self.path = path

    def __enter__(self) -> RunLock:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        try:
            handle = os.open(self.path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        except FileExistsError:
            pid = self.path.read_text(encoding="ascii").strip()
            if pid.isdigit() and _alive(int(pid)):
                raise PromoteRefused(
                    f"another run holds {self.path} (pid {pid}). One process, one lock file."
                ) from None
            self.path.unlink(missing_ok=True)
            handle = os.open(self.path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.write(handle, str(os.getpid()).encode("ascii"))
        os.close(handle)
        return self

    def __exit__(self, *exc: object) -> None:
        self.path.unlink(missing_ok=True)


def _alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except (OSError, PermissionError) as exc:
        return isinstance(exc, PermissionError)
    return True


# --- the append-only delete log ----------------------------------------------


class UnlinkLog:
    """Every delete this module performs, one self-contained JSON object a line.

    Append-only. Never truncated and never rotated by this program: it is the
    record of an irreversible act, and JSONL rather than a bespoke format for the
    same reason `origins.jsonl` is -- it has to stay readable with a text editor
    by someone who does not have this repository.

    `flush` per line so a kill loses nothing already returned from a syscall;
    `fsync` per batch rather than per line, which is the difference between ~50 s
    and ~0.5 s of the run spent in the NVMe's cache flush.
    """

    def __init__(self, path: Path) -> None:
        self.path = path
        self.handle = None
        self.written = 0

    def __enter__(self) -> UnlinkLog:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.handle = open(self.path, "a", encoding="utf-8", newline="\n")
        return self

    def __exit__(self, *exc: object) -> None:
        if self.handle is not None:
            self.sync()
            self.handle.close()
            self.handle = None

    def write(self, **fields) -> None:
        line = json.dumps({"at": _now(), **fields}, ensure_ascii=False)
        self.handle.write(line + "\n")
        self.handle.flush()
        self.written += 1

    def sync(self) -> None:
        if self.handle is not None:
            os.fsync(self.handle.fileno())


def _now() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


class Progress:
    """Objects per second and an ETA on a 60-second tick, so a run can be left.

    Deliberately no MB/s: a promotion moves no bytes, and reporting the logical
    size of a hardlinked extent as throughput is the `st_nlink == 2` trap wearing
    a progress bar.
    """

    def __init__(self, label: str, total: int) -> None:
        self.label = label
        self.total = total
        self.done = 0
        self.started = self.announced = time.perf_counter()

    def step(self) -> None:
        self.done += 1
        now = time.perf_counter()
        if now - self.announced < PROGRESS_SECONDS:
            return
        self.announced = now
        self.report()

    def report(self) -> None:
        elapsed = max(time.perf_counter() - self.started, 1e-6)
        share = self.done / max(self.total, 1)
        eta = (elapsed / share - elapsed) if share > 0 else 0.0
        print(
            f"  {self.label:<13}{self.done:>7,}/{self.total:,}  {_hms(elapsed)} elapsed"
            f"  {self.done / elapsed:6.1f}/s  {share * 100:5.1f}%  ETA {_hms(eta)}",
            flush=True,
        )


def _hms(seconds: float) -> str:
    seconds = int(max(seconds, 0))
    return f"{seconds // 3600}h{seconds % 3600 // 60:02d}m{seconds % 60:02d}s"


# --- what to do, per object ---------------------------------------------------


@dataclass(frozen=True, slots=True)
class Job:
    """One object and the single thing that is to happen to it."""

    sha256: str
    ext: str
    size: int
    state: str  # 'read' -- a MediaVault object -- or 'staged' -- a staged copy
    relpath: str  # where the bytes are now, relative to `source_root`
    intent: str
    decided_by: str | None  # which rule excluded it; None for a kept object


def source_root(config: Config, state: str) -> Path:
    """The root `Job.relpath` is relative to.

    A staged copy's path is vault-relative and a MediaVault object's is
    MediaVault-relative. The two roots are different directories, which is the
    same distinction `phase2b._source_path` carries.
    """
    return config.vault_root if state == "staged" else config.mediavault_root


def containment_root(config: Config, state: str) -> Path:
    """The one root a delete must be proven inside. Never a set of roots."""
    return config.staging_root if state == "staged" else config.mediavault_root / "objects"


def object_path(vault_root: Path, sha256: str, ext: str) -> Path:
    """`<vault_root>\\<aa>\\<bb>\\<sha256><ext>`, per `PLAN.md` § "Storage layout".

    Collision-free by construction, case-insensitively included: `sha256` is
    `file`'s primary key and lowercase hex, so no two targets can differ only by
    case. The extension is real so Explorer can open the file; 2,422 objects in
    this corpus have none and get a bare digest.
    """
    return vault_root / sha256[:2] / sha256[2:4] / f"{sha256}{ext}"


_WORKLIST_TAIL = """SELECT f.sha256, f.ext, f.size, f.state, f.vault_relpath,
       coalesce(CASE o.decision WHEN 'include' THEN 1 WHEN 'exclude' THEN 0 END, per.kept) AS kept,
       o.decision, per.decider
  FROM file f
  JOIN per ON per.sha256 = f.sha256
  LEFT JOIN state.triage_override o ON o.sha256 = f.sha256
 WHERE f.vault_relpath IS NOT NULL
 ORDER BY f.sha256"""


def worklist(
    conn: sqlite3.Connection, rules: list[triage.Rule] | None = None
) -> tuple[list[Job], dict[str, int]]:
    """Every object with a vault copy, as `(jobs still to do, counts by outcome)`.

    The verdict is `triage`'s own, so this can never disagree with the number the
    UI printed, and `winner` gives the rule that decided each row rather than
    only whether it survived. A file is kept when *any* of its paths is kept --
    the bytes are identical, so one surviving copy is enough -- and for an
    excluded file every path is excluded, which is what makes `min(winner)` a
    sound name for the rule that killed it.

    Rows already in state `published` or `excluded` are counted as done and never
    returned: they are the resume path, and their `vault_relpath` no longer means
    what an unfinished row's means.

    Order is `sha256`, which is simultaneously object-tree order and vault-tree
    order -- MediaVault shards on the digest's first four hex characters and so
    does the vault -- so one reader follows the head down both trees instead of
    seeking across them.
    """
    rules = triage.load_rules(conn) if rules is None else rules
    if not rules:
        raise PromoteRefused(
            "the saved rule set is empty: nothing is explicitly excluded, so nothing may be "
            "unlinked"
        )
    by_position = {rule.position: rule for rule in rules}
    verdict = triage.verdict_expression(rules)
    sql = verdict.query(
        f"""scored AS (
      SELECT g.sha256 AS sha256, {verdict.winner} AS w
      FROM origin g
      JOIN triage_path tp ON tp.origin_id = g.id
      JOIN triage_bucket k ON k.id = tp.bucket_id
      {verdict.join}
    )""",
        f"""per AS (
      SELECT sha256, max({verdict.kept_of('w')}) AS kept, min(w) AS decider
      FROM scored
      GROUP BY sha256
    )""",
        tail=_WORKLIST_TAIL,
    )
    rows = conn.execute(sql, [*verdict.dir_params, *verdict.winner_params]).fetchall()

    total = conn.execute("SELECT count(*) FROM file WHERE vault_relpath IS NOT NULL").fetchone()[0]
    if len(rows) != total:
        raise PromoteRefused(
            f"{total - len(rows):,} of {total:,} objects have no triage verdict at all "
            "(no origin path). An object with no verdict is neither kept nor excluded, "
            "and must not be acted on"
        )

    jobs: list[Job] = []
    counts = {
        "objects": total,
        "promote": 0,
        "unlink": 0,
        "stage_rename": 0,
        "already_promoted": 0,
        # From its own query, not from the rows above: a finished unlink clears
        # `vault_relpath` -- there is no vault path for bytes that are gone -- and
        # the row therefore drops out of a worklist scoped to objects that have one.
        "already_unlinked": conn.execute(
            "SELECT count(*) FROM file WHERE state = 'excluded'"
        ).fetchone()[0],
    }
    for sha256, ext, size, state, relpath, kept, override, decider in rows:
        if not SHA_OK.match(sha256):
            raise PromoteRefused(f"{sha256!r} is not a lowercase 64-char digest")
        if not EXT_OK.match(ext or ""):
            raise PromoteRefused(f"{sha256} carries extension {ext!r}, which is not a safe name")
        if state == "published":
            counts["already_promoted"] += 1
            continue
        if state == "excluded":
            # Only reachable if a relpath outlived its bytes, which `finish` writes
            # atomically to prevent. Counted above, and never acted on again.
            continue
        if state not in ("read", "staged"):
            raise PromoteRefused(f"{sha256} is in state {state!r}, which Phase 4 has no rule for")

        if kept:
            intent = STAGE_RENAME if state == "staged" else PROMOTE
            decided_by = None
        else:
            intent = UNLINK
            decided_by = _decided_by(override, decider, by_position)
            if decided_by is None:
                raise PromoteRefused(
                    f"{sha256} is excluded but no rule and no override accounts for it "
                    f"(winning position {decider!r}). Nothing is unlinked without a named reason"
                )
        counts[intent] += 1
        jobs.append(Job(sha256, ext or "", size, state, relpath, intent, decided_by))
    return jobs, counts


def _decided_by(override: str | None, decider: int | None, by_position: dict) -> str | None:
    """The reason an object is excluded, as a string for the log.

    An override beats every rule, so it is named first and without consulting the
    positions -- an overridden file's rules-alone winner is frequently "kept",
    which is exactly the disagreement the override exists to express.
    """
    if override == "exclude":
        return "override"
    rule = by_position.get(decider)
    if rule is None or rule.decision != "exclude":
        return None
    return f"rule {rule.rule_id} seq {rule.seq} {triage.describe(rule.predicate)}"


# --- identity ----------------------------------------------------------------


@dataclass(frozen=True, slots=True)
class Ident:
    """What `GetFileInformationByHandle` says about one name."""

    dev: int  # volume serial
    index: int  # 128-bit NTFS file index; 0 means os.stat could not open the file
    nlink: int
    size: int
    readonly: bool
    reparse: bool

    @property
    def key(self) -> str:
        """`(volume serial, file index)` as text. SQLite's INTEGER is 64 signed."""
        return f"{self.dev}:{self.index}"


def identity(path: Path) -> Ident | None:
    """`Ident` for `path`, or None when the name does not exist."""
    try:
        st = os.stat(path)
    except FileNotFoundError:
        return None
    attributes = st.st_file_attributes
    return Ident(
        st.st_dev,
        st.st_ino,
        st.st_nlink,
        st.st_size,
        bool(attributes & stat.FILE_ATTRIBUTE_READONLY),
        bool(attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT),
    )


def classify(source: Ident | None, target: Ident | None) -> str:
    """Which of the five states one object is in. This *is* the resume path.

    An index of 0 is `os.stat` having fallen back to `FindFirstFileW`, so identity
    cannot be established and the pair is treated as a collision rather than as a
    match -- two unopenable files would otherwise compare equal at index 0.
    """
    if source is not None and target is None:
        return S0
    if source is not None and target is not None:
        same = source.index != 0 and (source.dev, source.index) == (target.dev, target.index)
        return S1 if same else COLLISION
    if target is not None:
        return AMBIGUOUS
    return ABSENT


def sha256_of(path: Path) -> str:
    """SHA-256 of one file, read once, streamed."""
    digest = hashlib.sha256()
    with open(path, "rb", buffering=0) as handle:
        while chunk := handle.read(HASH_CHUNK):
            digest.update(chunk)
    return digest.hexdigest()


# --- the ledger ---------------------------------------------------------------

_UPSERT = """
INSERT INTO promotion (sha256, intent, object_relpath, vault_relpath, size, decided_by,
                       status, file_index, detail, started_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(sha256) DO UPDATE SET
  intent = excluded.intent, object_relpath = excluded.object_relpath,
  vault_relpath = excluded.vault_relpath, decided_by = excluded.decided_by,
  status = excluded.status, file_index = excluded.file_index,
  detail = excluded.detail, updated_at = excluded.updated_at
"""


def record(
    conn: sqlite3.Connection,
    job: Job,
    status: str,
    *,
    vault_relpath: str | None = None,
    file_index: str | None = None,
    detail: str | None = None,
) -> None:
    """Write the ledger row and commit it on its own.

    Committed *before* the syscall it describes. `G:` carries no active USN
    journal, so a row written afterwards would leave a killed run's last object
    indistinguishable from an untouched one -- and step 16's in-flight scoping is
    only sound because every attempt has a row here first.
    """
    now = _now()
    conn.execute("BEGIN IMMEDIATE")
    conn.execute(
        _UPSERT,
        (job.sha256, job.intent, job.relpath, vault_relpath, job.size, job.decided_by,
         status, file_index, detail, now, now),
    )
    conn.execute("COMMIT")


def finish(
    conn: sqlite3.Connection,
    job: Job,
    *,
    state: str,
    vault_relpath: str | None,
    file_index: str | None,
    detail: str | None = None,
) -> None:
    """Mark one object done: the ledger row and the `file` row, one transaction.

    The DB row is the record, not the directory listing.
    """
    now = _now()
    conn.execute("BEGIN IMMEDIATE")
    updated = conn.execute(
        "UPDATE promotion SET status = 'done', vault_relpath = ?, file_index = ?, "
        "detail = ?, updated_at = ? WHERE sha256 = ?",
        (vault_relpath, file_index, detail, now, job.sha256),
    ).rowcount
    if updated != 1:
        # `finish` always follows a `record`. A missing row means an intent was
        # never written, and the whole point of the intent is that it comes first.
        conn.execute("ROLLBACK")
        raise PromoteRefused(f"{job.sha256}: finished with no intent row in the ledger")
    conn.execute(
        "UPDATE file SET state = ?, vault_relpath = ? WHERE sha256 = ?",
        (state, vault_relpath, job.sha256),
    )
    conn.execute("COMMIT")


# --- the primitives every branch shares ---------------------------------------


def clear_readonly(path: Path, ident: Ident | None) -> None:
    """Drop `FILE_ATTRIBUTE_READONLY` if it is set. Idempotent.

    A no-op on all 12,036 objects sampled -- they are Archive-only -- and present
    anyway, because it is what makes the repair pass able to recover a name whose
    read-only bit got set while the unlink was still blocked.
    """
    if ident is not None and ident.readonly:
        os.chmod(path, stat.S_IWRITE)


def delete_with_backoff(path: Path) -> int | None:
    """`DeleteFileW` with bounded backoff. Returns None on success, else winerror.

    Retries on 32 (another handle is open: every Python reader in this project
    blocks the unlink, since CPython's `open()` does not pass FILE_SHARE_DELETE)
    and on 5, which is what NTFS returns for a read-only file and is the state a
    half-finished earlier attempt can leave behind.
    """
    last = None
    for delay_ms in (0, *DELETE_BACKOFF_MS):
        if delay_ms:
            time.sleep(delay_ms / 1000)
        try:
            os.remove(path)
            return None
        except FileNotFoundError:
            return None
        except OSError as exc:
            if exc.winerror not in (SHARING_VIOLATION, ACCESS_DENIED):
                raise
            last = exc.winerror
    return last


def assert_linked(source: Path, target: Path, expected_size: int) -> Ident:
    """Prove the two names are one file before anything is deleted.

    Any failure here aborts *this object* with its MediaVault name intact, which
    is the whole reason the link and the unlink are not two passes.
    """
    left, right = identity(source), identity(target)
    if left is None or right is None:
        raise LinkUnproven(f"one name vanished between link and check: {source}, {target}")
    if left.index == 0 or right.index == 0:
        raise LinkUnproven("file index 0: os.stat could not open the file to identify it")
    if (left.dev, left.index) != (right.dev, right.index):
        raise LinkUnproven(
            f"different files: {left.key} vs {right.key} -- the target is not this object"
        )
    if left.nlink != 2 or right.nlink != 2:
        raise LinkUnproven(f"nlink {left.nlink}/{right.nlink}, expected 2 on both names")
    if left.size != right.size or left.size != expected_size:
        raise LinkUnproven(f"size {left.size}/{right.size}, expected {expected_size}")
    if left.reparse or right.reparse:
        raise LinkUnproven("reparse point set: this is not a plain hardlink")
    return right


class LinkUnproven(RuntimeError):
    """The two names were not proven to be one file. Nothing has been deleted."""


def prove_inside(config: Config, job: Job) -> Path:
    """The real, existing path `job` names, proven inside its one root.

    Reduced to `reveal.resolve`, which realpaths with `strict=True` -- so 8.3
    names, case, junctions and symlinks all resolve -- and compares by
    `os.path.samestat` rather than by string, so `objects` against
    `objects_evil` cannot pass. There is one root per resolution, never a set:
    a set of roots tried in turn is how `F05` and `F13` happened.
    """
    try:
        return reveal.resolve(
            job.relpath, source_root(config, job.state), containment_root(config, job.state)
        )
    except reveal.RevealRefused as exc:
        raise PromoteRefused(
            f"{job.sha256}: {job.relpath!r} is not provably inside "
            f"{containment_root(config, job.state)} ({exc})"
        ) from None


# --- promoting one object -----------------------------------------------------


def promote_one(conn: sqlite3.Connection, config: Config, job: Job, log: UnlinkLog) -> str:
    """Link the vault name, then destroy the MediaVault one. Returns the outcome.

    The seven steps are in the one order that works, and the obvious order does
    not: read-only before the unlink deadlocks on every object.
    """
    source = source_root(config, job.state) / job.relpath
    target = object_path(config.vault_root, job.sha256, job.ext)
    target_relpath = str(target.relative_to(config.vault_root))
    if len(str(target)) > MAX_TARGET_CHARS:
        raise PromoteRefused(f"{target} is {len(str(target))} chars, over the {MAX_TARGET_CHARS} bound")

    state = classify(identity(source), identity(target))
    if state == COLLISION:
        record(conn, job, COLLISION, vault_relpath=target_relpath,
               detail="target name exists and is a different file")
        return COLLISION
    if state == AMBIGUOUS:
        return _resolve_ambiguous(conn, config, job, target, target_relpath)
    if state == ABSENT:
        raise PromoteRefused(
            f"{job.sha256}: neither {source} nor {target} exists. The object is gone and "
            "nothing here put it anywhere"
        )

    prove_inside(config, job)
    record(conn, job, "intent", vault_relpath=target_relpath)

    if state == S0:
        # 1. preconditions on the name we are about to duplicate.
        before = identity(source)
        if before.nlink != 1 or before.readonly or before.reparse:
            record(conn, job, "failed", vault_relpath=target_relpath,
                   detail=f"precondition: nlink={before.nlink} readonly={before.readonly} "
                          f"reparse={before.reparse}")
            raise PromoteRefused(
                f"{job.sha256}: object has nlink {before.nlink}, readonly {before.readonly}, "
                f"reparse {before.reparse}. The baseline is nlink 1 and Archive-only, so "
                "something else changed the store"
            )
        target.parent.mkdir(parents=True, exist_ok=True)
        parent = identity(target.parent)
        if parent.dev != before.dev:
            raise PromoteRefused(
                f"{job.sha256}: {target.parent} is on volume {parent.dev:#x} and the object on "
                f"{before.dev:#x}. A cross-volume link would fail at winerror 17 anyway"
            )
        # 2. the link. Any failure, 183 included, re-enters the classifier.
        try:
            os.link(source, target)
        except OSError as exc:
            record(conn, job, "failed", vault_relpath=target_relpath,
                   detail=f"link winerror {exc.winerror}: {exc.strerror}")
            again = classify(identity(source), identity(target))
            if again != S1:
                raise PromoteRefused(
                    f"{job.sha256}: link failed with winerror {exc.winerror} and the classifier "
                    f"then read {again}. Nothing was deleted"
                ) from None

    # 3. prove the two names are one file. Never inferred from the link returning.
    try:
        survivor = assert_linked(source, target, job.size)
    except LinkUnproven as exc:
        record(conn, job, "failed", vault_relpath=target_relpath, detail=str(exc))
        raise PromoteRefused(f"{job.sha256}: {exc}. MediaVault name intact") from None

    # 4-5. clear read-only on the shared record, then destroy the MediaVault name.
    clear_readonly(source, identity(source))
    failure = delete_with_backoff(source)
    if failure is not None:
        # 6 is not reached, and read-only stays clear: setting it now would turn
        # every later repair error from 32 into 5 and make the object undeletable.
        record(conn, job, "half_linked", vault_relpath=target_relpath,
               file_index=survivor.key, detail=f"unlink winerror {failure}")
        return "half_linked"

    # 6. only now is the survivor a single name, and only now may it be sealed.
    after = identity(target)
    if after is None or after.nlink != 1 or after.key != survivor.key or after.size != job.size:
        record(conn, job, "failed", vault_relpath=target_relpath, file_index=survivor.key,
               detail=f"post-unlink survivor {after}")
        raise PromoteRefused(
            f"{job.sha256}: after the unlink the survivor reads {after}, expected nlink 1 "
            f"at {survivor.key} and size {job.size}"
        )
    os.chmod(target, stat.S_IREAD)

    # 7. the record.
    finish(conn, job, state="published", vault_relpath=target_relpath, file_index=survivor.key)
    log.write(intent=PROMOTE, sha256=job.sha256, status="done", size=job.size,
              path=job.relpath, vault_relpath=target_relpath, decided_by=None)
    return "done"


def _resolve_ambiguous(
    conn: sqlite3.Connection, config: Config, job: Job, target: Path, target_relpath: str
) -> str:
    """Object gone, target present: hash the target rather than trust the name.

    A completed promotion whose ledger row never landed is metadata-identical to
    an unrelated file that happens to be named after a digest, so the only
    predicate that separates them is the bytes.
    """
    record(conn, job, "intent", vault_relpath=target_relpath)
    digest = sha256_of(target)
    if digest != job.sha256:
        record(conn, job, "failed", vault_relpath=target_relpath,
               detail=f"target hashes {digest}, object gone")
        raise PromoteRefused(
            f"{job.sha256}: the object is gone and {target} holds {digest}. Another file owns "
            "that name and this object has no copy left here"
        )
    survivor = identity(target)
    finish(conn, job, state="published", vault_relpath=target_relpath,
           file_index=survivor.key, detail="recovered: promoted by an earlier run")
    return "recovered"


# --- renaming one accepted staged copy ---------------------------------------


def stage_rename_one(conn: sqlite3.Connection, config: Config, job: Job, log: UnlinkLog) -> str:
    """Publish a staged copy by renaming it, with no-replace semantics.

    Empty on this corpus -- step 12 staged nothing, because population 2 turned
    out to be empty -- and kept because that is a property of the rule set and not
    of the code: one include rule over a folder outside MediaVault repopulates
    staging on the next step-12 run.

    If the target name exists, the bytes are hashed rather than assumed. NTFS is
    case-insensitive, so a case-only variant collides too, and `os.replace` would
    silently overwrite whatever is there -- which is why this never uses it.
    """
    source = prove_inside(config, job)
    target = object_path(config.vault_root, job.sha256, job.ext)
    target_relpath = str(target.relative_to(config.vault_root))
    record(conn, job, "intent", vault_relpath=target_relpath)
    target.parent.mkdir(parents=True, exist_ok=True)

    existing = identity(target)
    if existing is not None:
        digest = sha256_of(target)
        if digest != job.sha256:
            record(conn, job, COLLISION, vault_relpath=target_relpath,
                   detail=f"target hashes {digest}; staging kept")
            raise PromoteRefused(
                f"{job.sha256}: {target} already holds {digest}. A different object owns that "
                "name; the staged copy is untouched"
            )
        # Already published by an earlier run. Drop the staging copy, which is the
        # duplicate, and keep the published name.
        clear_readonly(source, identity(source))
        failure = delete_with_backoff(source)
        if failure is not None:
            record(conn, job, "blocked", vault_relpath=target_relpath,
                   detail=f"staging drop winerror {failure}")
            return "blocked"
        log.write(intent="staging_drop", sha256=job.sha256, status="done", size=job.size,
                  path=job.relpath, vault_relpath=target_relpath, decided_by=None)
        finish(conn, job, state="published", vault_relpath=target_relpath,
               file_index=existing.key, detail="recovered: target already published")
        return "recovered"

    os.rename(source, target)
    published = identity(target)
    if published is None or published.size != job.size:
        record(conn, job, "failed", vault_relpath=target_relpath, detail=f"post-rename {published}")
        raise PromoteRefused(f"{job.sha256}: after the rename {target} reads {published}")
    os.chmod(target, stat.S_IREAD)
    finish(conn, job, state="published", vault_relpath=target_relpath, file_index=published.key)
    return "done"


# --- unlinking one excluded object -------------------------------------------


def unlink_one(
    conn: sqlite3.Connection, config: Config, job: Job, log: UnlinkLog, excluded: set[str]
) -> str:
    """Destroy one excluded object. The most dangerous delete in the system.

    One object at a time through the same verify-gated shape, never a bulk pass
    over a list. Three independent proofs stand in front of the syscall, and all
    three are about *this* object rather than about the run:

    * the resolved real path is inside the MediaVault objects root or the staging
      root, by `reveal.resolve`'s identity comparison;
    * the digest is in the excluded set derived from the saved rule set in this
      process -- not "not in the kept set", which an empty rule set satisfies;
    * the file's own basename begins with that digest, which is independent of the
      DB row that named it and catches a mis-joined query.
    """
    if job.sha256 not in excluded:
        raise PromoteRefused(
            f"{job.sha256} is not in the excluded set. Nothing is unlinked that the rule set does "
            "not explicitly exclude"
        )
    if job.decided_by is None:
        raise PromoteRefused(f"{job.sha256} has no named reason for exclusion")

    source = source_root(config, job.state) / job.relpath
    ident = identity(source)
    if ident is None:
        return _recover_unlinked(conn, job, log)

    resolved = prove_inside(config, job)
    if not resolved.name.lower().startswith(job.sha256):
        raise PromoteRefused(
            f"{job.sha256}: {resolved.name!r} is not named after this digest. The row and the "
            "file disagree about which object this is"
        )

    record(conn, job, "intent")
    clear_readonly(resolved, ident)
    failure = delete_with_backoff(resolved)
    if failure is not None:
        record(conn, job, "blocked", detail=f"unlink winerror {failure}")
        log.write(intent=UNLINK, sha256=job.sha256, status="blocked", size=job.size,
                  path=job.relpath, decided_by=job.decided_by, winerror=failure)
        return "blocked"
    if identity(resolved) is not None:
        record(conn, job, "failed", detail="still present after a successful DeleteFileW")
        raise PromoteRefused(f"{job.sha256}: {resolved} still exists after the unlink returned")

    log.write(intent=UNLINK, sha256=job.sha256, status="done", size=job.size,
              path=job.relpath, decided_by=job.decided_by)
    finish(conn, job, state="excluded", vault_relpath=None, file_index=None)
    return "done"


def _recover_unlinked(conn: sqlite3.Connection, job: Job, log: UnlinkLog) -> str:
    """The object is already gone. Only a prior intent row makes that legitimate.

    This is the crash window between `DeleteFileW` returning and the ledger being
    updated. With an intent row it is a resume; without one, something outside
    this program deleted an object, and that stops the run.
    """
    row = conn.execute(
        "SELECT status FROM promotion WHERE sha256 = ? AND intent = ?", (job.sha256, UNLINK)
    ).fetchone()
    if row is None:
        raise PromoteRefused(
            f"{job.sha256}: the object is already absent and no intent row exists. Nothing here "
            "deleted it, so this run stops rather than recording it as done"
        )
    log.write(intent=UNLINK, sha256=job.sha256, status="done", size=job.size,
              path=job.relpath, decided_by=job.decided_by, recovered=True)
    finish(conn, job, state="excluded", vault_relpath=None, file_index=None,
           detail="recovered: unlinked by an earlier run before it could record it")
    return "recovered"


# --- the repair pass ----------------------------------------------------------


def repair(
    conn: sqlite3.Connection, config: Config, jobs: list[Job], log: UnlinkLog
) -> dict:
    """Finish the objects a blocked unlink left behind. Idempotent.

    Which objects need it comes from the ledger -- `G:` has no active USN journal,
    so there is no filesystem-side history to reconstruct intent from -- but *what
    may be done to them* comes from `jobs`, which is the current rule set's own
    verdict. A repair pass that took its unlink authority from its own earlier
    ledger row would delete on the strength of a decision nobody re-derived.

    Read-only is cleared on *either* name first and the delete retries on both 32
    and 5: a pass that retries only on 32 never recovers a name whose read-only bit
    was set while the unlink was still blocked, which is why nothing here ever sets
    it out of order in the first place.
    """
    blocked = {
        row[0]
        for row in conn.execute(
            "SELECT sha256 FROM promotion WHERE status IN ('half_linked', 'blocked')"
        )
    }
    excluded = {job.sha256 for job in jobs if job.intent == UNLINK}
    todo = [job for job in jobs if job.sha256 in blocked]
    outcome = {
        "rows": len(blocked),
        "repaired": 0,
        "still_blocked": 0,
        # A blocked row whose `file` row has already moved on was finished by a
        # later run; it is not work and it is not a failure.
        "settled": len(blocked) - len(todo),
    }
    if not todo:
        return outcome
    progress = Progress("repair", len(todo))
    for job in todo:
        source = source_root(config, job.state) / job.relpath
        target = object_path(config.vault_root, job.sha256, job.ext)
        clear_readonly(source, identity(source))
        clear_readonly(target, identity(target))
        result = (
            unlink_one(conn, config, job, log, excluded)
            if job.intent == UNLINK
            else promote_one(conn, config, job, log)
        )
        outcome["repaired" if result in ("done", "recovered") else "still_blocked"] += 1
        progress.step()
    progress.report()
    return outcome


# --- what the dry run measures ------------------------------------------------


def vault_object_index(vault_root: Path) -> set[str]:
    """Every canonical object already in the vault, as `<aa>\\<bb>\\<name>`.

    Only two-hex-character shards, which is what excludes `deriv`, `meta`,
    `.staging` and `origins.jsonl` by construction rather than by a name list.
    """
    found: set[str] = set()
    if not vault_root.is_dir():
        return found
    for shard in os.scandir(vault_root):
        if not shard.is_dir() or not SHARD.match(shard.name):
            continue
        for inner in os.scandir(shard.path):
            if not inner.is_dir() or not SHARD.match(inner.name):
                continue
            for entry in os.scandir(inner.path):
                found.add(f"{shard.name}\\{inner.name}\\{entry.name}")
    return found


def sample_baseline(config: Config, jobs: list[Job], limit: int = SAMPLE_STATS) -> dict:
    """`nlink`, read-only and reparse over a sample of the objects to be touched.

    The precondition is asserted per object at promotion time; this is here so the
    dry run reports whether the baseline the plan measured -- nlink 1,
    Archive-only, across 12,036 objects and 2,500 nlink samples -- still holds
    before an hour of deletes starts.
    """
    tally = {"sampled": 0, "nlink_1": 0, "nlink_other": 0, "readonly": 0, "reparse": 0,
             "absent": 0}
    for job in jobs[:limit]:
        ident = identity(source_root(config, job.state) / job.relpath)
        tally["sampled"] += 1
        if ident is None:
            tally["absent"] += 1
            continue
        tally["nlink_1" if ident.nlink == 1 else "nlink_other"] += 1
        tally["readonly"] += ident.readonly
        tally["reparse"] += ident.reparse
    return tally


def orphan_derivatives(config: Config, doomed: set[str]) -> dict:
    """How many derivatives will belong to nothing once the excluded set is gone.

    Deliberately not deleted. Step 5 copied a 384px tile for all 146,034 assets
    and steps 9 and 12 wrote substrates, in both cases before triage had a verdict,
    so ~107,658 tiles and some substrates outlive their object. They are small,
    regenerable, on the NVMe, and nothing reads a tile for a `sha256` that is not a
    photo row. Counted here so step 16 cannot read them as a half-promotion;
    sweeping them is a separate decision.
    """
    tally = {"thumbs": 0, "substrates": 0}
    thumb_root = config.thumb_root
    if thumb_root.is_dir():
        for shard in os.scandir(thumb_root):
            if not shard.is_dir():
                continue
            for entry in os.scandir(shard.path):
                if entry.name.split(".")[0] in doomed:
                    tally["thumbs"] += 1
    deriv_root = config.deriv_root
    if deriv_root.is_dir():
        for shard in os.scandir(deriv_root):
            if not shard.is_dir():
                continue
            for inner in os.scandir(shard.path):
                if not inner.is_dir():
                    continue
                for entry in os.scandir(inner.path):
                    if entry.name.split(".")[0] in doomed:
                        tally["substrates"] += 1
    return tally


def per_rule(jobs: list[Job], top: int = 20) -> list[tuple[str, int]]:
    """What the unlink set is being destroyed by, most objects first."""
    tally: dict[str, int] = {}
    for job in jobs:
        if job.intent == UNLINK:
            tally[job.decided_by] = tally.get(job.decided_by, 0) + 1
    return sorted(tally.items(), key=lambda item: (-item[1], item[0]))[:top]


# --- the gates ----------------------------------------------------------------


def preflight(conn: sqlite3.Connection, config: Config) -> None:
    """Everything that must be true before an irreversible step may start.

    All of it is refusal, not repair. The `origins.jsonl` check is step 13b's gate
    restated in code: it is the only content-hash to original-path map, so
    without it a wrongly excluded photograph cannot be found in the off-site repo
    at all, and this step is the one that makes that the only route back.
    """
    if migrate.version(conn) < 6:
        raise PromoteRefused(
            "catalog is behind migration 006; run python -m photolib.migrate first"
        )
    origins = config.vault_root / ORIGINS_FILENAME
    try:
        size = origins.stat().st_size
    except OSError:
        raise PromoteRefused(
            f"{origins} does not exist. It is the only content-hash to original-path map, and "
            "Phase 4 must not run before it is on disk and off-device"
        ) from None
    if size == 0:
        raise PromoteRefused(f"{origins} is empty")
    objects_root = config.mediavault_root / "objects"
    if not objects_root.is_dir():
        raise PromoteRefused(f"{objects_root} is not a directory")
    config.vault_root.mkdir(parents=True, exist_ok=True)
    if identity(config.vault_root).dev != identity(objects_root).dev:
        raise PromoteRefused(
            f"{config.vault_root} and {objects_root} are on different volumes. A hardlink across "
            "volumes fails at winerror 17, so this is a copy waiting to happen"
        )


def confirm_phrase(counts: dict) -> str:
    """The phrase the operator must type to run the destructive pass.

    Built from the counts derived in *this* process, so a phrase copied out of an
    older run's output does not match and the run refuses.
    """
    return f"PROMOTE {counts['promote']} UNLINK {counts['unlink']}"


# --- the run ------------------------------------------------------------------


def _print_survey(config: Config, conn, jobs: list[Job], counts: dict, *, verbose: bool) -> None:
    rules = conn.execute("SELECT count(*) FROM state.triage_rule").fetchone()[0]
    overrides = conn.execute("SELECT count(*) FROM state.triage_override").fetchone()[0]
    promote = [job for job in jobs if job.intent == PROMOTE]
    unlink = [job for job in jobs if job.intent == UNLINK]
    staged = [job for job in jobs if job.intent == STAGE_RENAME]
    print(f"\nrule set        {rules:,} rules, {overrides:,} overrides")
    print(f"{'':16}{counts['objects']:,} objects carry a vault copy")
    print(
        f"\npromote from MediaVault  {len(promote):>9,}   "
        f"{sum(job.size for job in promote) / 1e9:9.1f} GB"
    )
    print(
        f"unlink as excluded       {len(unlink):>9,}   "
        f"{sum(job.size for job in unlink) / 1e9:9.1f} GB"
    )
    print(f"rename out of staging    {len(staged):>9,}")
    print(f"{'-' * 46}")
    print(f"MediaVault objects       {counts['objects']:>9,}")
    if counts["already_promoted"] or counts["already_unlinked"]:
        print(
            f"\nalready done             {counts['already_promoted']:,} promoted, "
            f"{counts['already_unlinked']:,} unlinked -- these are not in the numbers above"
        )

    started = time.perf_counter()
    on_disk = object_index(config.mediavault_root)
    recorded = {
        row[0]
        for row in conn.execute(
            "SELECT vault_relpath FROM file WHERE vault_relpath IS NOT NULL AND state = 'read'"
        )
    }
    print(
        f"\nobject tree     {len(on_disk):,} on disk, {len(recorded):,} recorded, "
        f"{len(on_disk - recorded):,} on disk only, {len(recorded - on_disk):,} recorded only "
        f"[{time.perf_counter() - started:.0f}s]"
    )
    in_vault = vault_object_index(config.vault_root)
    print(f"vault tree      {len(in_vault):,} canonical objects already present")
    all_staged = conn.execute("SELECT count(*) FROM file WHERE state = 'staged'").fetchone()[0]
    print(
        f"staging         {'absent' if not config.staging_root.exists() else 'present'}, "
        f"{all_staged:,} rows in state 'staged', {len(staged):,} of them kept"
    )

    expected = {object_path(config.vault_root, job.sha256, job.ext).relative_to(config.vault_root)
                for job in promote}
    collisions = {str(path) for path in expected} & in_vault
    print(
        f"classification  {len(promote) - len(collisions):,} S0 (target absent), "
        f"{len(collisions):,} target name already present"
    )
    print("                re-classified per object immediately before every action")

    sample = sample_baseline(config, jobs)
    print(
        f"baseline        {sample['sampled']:,} sampled: nlink 1 {sample['nlink_1']:,}, "
        f"nlink>1 {sample['nlink_other']:,}, read-only {sample['readonly']:,}, "
        f"reparse {sample['reparse']:,}, absent {sample['absent']:,}"
    )
    free = shutil.disk_usage(config.vault_root).free
    print(f"free space      {free:,} B, guard {FREE_PER_LINK:,} x promoted + {FREE_SLACK:,}")

    orphans = orphan_derivatives(config, {job.sha256 for job in unlink})
    print(
        f"orphans after   {orphans['thumbs']:,} thumbnails on the NVMe, "
        f"{orphans['substrates']:,} substrates -- left in place deliberately"
    )
    if verbose:
        print("\nwhat the unlink set is destroyed by, top 20:")
        for reason, count in per_rule(unlink):
            print(f"  {count:>8,}  {reason}")


def execute(
    conn: sqlite3.Connection,
    config: Config,
    jobs: list[Job],
    log: UnlinkLog,
    *,
    usage=shutil.disk_usage,
) -> dict:
    """Do the work, one object at a time, checkpointed per object.

    Promotions first, then staged renames, then the excluded deletes: the
    dangerous half of the run happens only after every kept object already has its
    second name.
    """
    excluded = {job.sha256 for job in jobs if job.intent == UNLINK}
    ordered = (
        [job for job in jobs if job.intent == PROMOTE]
        + [job for job in jobs if job.intent == STAGE_RENAME]
        + [job for job in jobs if job.intent == UNLINK]
    )
    tally: dict[str, int] = {}
    progress = Progress("promote", len(ordered))
    freed_before = usage(config.vault_root).free

    for start in range(0, len(ordered), BATCH):
        batch = ordered[start : start + BATCH]
        free_before = usage(config.vault_root).free
        linked = 0
        for job in batch:
            if job.intent == PROMOTE:
                result = promote_one(conn, config, job, log)
                linked += result in ("done", "half_linked")
            elif job.intent == STAGE_RENAME:
                result = stage_rename_one(conn, config, job, log)
            else:
                result = unlink_one(conn, config, job, log, excluded)
            tally[f"{job.intent}:{result}"] = tally.get(f"{job.intent}:{result}", 0) + 1
            progress.step()
        log.sync()
        drop = free_before - usage(config.vault_root).free
        allowed = FREE_PER_LINK * linked + FREE_SLACK
        if drop > allowed:
            raise PromoteRefused(
                f"free space fell {drop:,} B over {len(batch):,} objects ({linked:,} linked), "
                f"more than the {allowed:,} B a hardlink can cost. A copy is happening, not a "
                "link -- stopped after this batch"
            )
    progress.report()
    tally["freed_bytes"] = freed_before - usage(config.vault_root).free
    tally["logged"] = log.written
    return tally


def run(
    config: Config | None = None,
    *,
    execute_writes: bool = False,
    limit: int | None = None,
    repair_only: bool = False,
    verbose: bool = True,
    stdin=None,
) -> int:
    config = config or load()
    # The pair named by this `config`, not by config.toml a second time: every
    # path this run touches has to come from one object, or a test points at a
    # temporary vault while writing to the real catalog.
    conn = db.connect(config.catalog_db, config.state_db)
    try:
        preflight(conn, config)
        rules = triage.load_rules(conn)
        jobs, counts = worklist(conn, rules)
        if limit is not None:
            kept = {PROMOTE: 0, STAGE_RENAME: 0, UNLINK: 0}
            bounded = []
            for job in jobs:
                if kept[job.intent] >= limit:
                    continue
                kept[job.intent] += 1
                bounded.append(job)
            jobs = bounded
        run_counts = {
            "objects": counts["objects"],
            "promote": sum(job.intent == PROMOTE for job in jobs),
            "unlink": sum(job.intent == UNLINK for job in jobs),
            "stage_rename": sum(job.intent == STAGE_RENAME for job in jobs),
            "already_promoted": counts["already_promoted"],
            "already_unlinked": counts["already_unlinked"],
        }

        if repair_only:
            with UnlinkLog(config.catalog_db.parent / UNLINK_LOG_NAME) as log:
                outcome = repair(conn, config, jobs, log)
            print(
                f"repair          {outcome['rows']:,} rows, {outcome['repaired']:,} finished, "
                f"{outcome['still_blocked']:,} still blocked, {outcome['settled']:,} already settled"
            )
            return 1 if outcome["still_blocked"] else 0

        _print_survey(config, conn, jobs, run_counts, verbose=verbose)

        if not execute_writes:
            print(
                "\nDRY RUN. Nothing was linked, renamed, unlinked or written -- no ledger row, "
                "no log file.\nTo execute, re-run with --execute and type, at the prompt:\n"
                f"    {confirm_phrase(run_counts)}"
            )
            return 0

        phrase = confirm_phrase(run_counts)
        print(
            f"\nThis destroys {run_counts['unlink']:,} objects permanently and unlinks "
            f"{run_counts['promote']:,} MediaVault names whose bytes survive in the vault."
            f"\nType exactly:  {phrase}"
        )
        typed = (stdin or sys.stdin).readline().strip()
        if typed != phrase:
            raise PromoteRefused(f"confirmation was {typed!r}, expected {phrase!r}. Nothing ran")

        with UnlinkLog(config.catalog_db.parent / UNLINK_LOG_NAME) as log:
            tally = execute(conn, config, jobs, log)
        print("\noutcome")
        for key in sorted(k for k in tally if ":" in k):
            print(f"  {key:<28}{tally[key]:,}")
        print(f"  {'freed on G:':<28}{tally['freed_bytes']:,} B")
        print(f"  {'log lines':<28}{tally['logged']:,}  {config.catalog_db.parent / UNLINK_LOG_NAME}")
        unfinished = conn.execute(
            "SELECT status, count(*) FROM promotion WHERE status <> 'done' GROUP BY 1"
        ).fetchall()
        if unfinished:
            print("  unfinished:", ", ".join(f"{status} {count:,}" for status, count in unfinished))
            print("  run --repair, then python -m photolib.promote_verify")
            return 1
        print("\nNothing is verified by this step. Run python -m photolib.promote_verify next.")
        return 0
    finally:
        conn.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m photolib.promote", description=__doc__.splitlines()[0]
    )
    parser.add_argument(
        "--execute", action="store_true",
        help="destroy names. Requires the printed phrase on stdin. Default is a dry run",
    )
    parser.add_argument(
        "--limit", type=int, help="act on at most N objects per population, for a rehearsal"
    )
    parser.add_argument(
        "--repair", action="store_true", help="finish objects a blocked unlink left half-linked"
    )
    parser.add_argument("--quiet", action="store_true", help="omit the per-rule breakdown")
    args = parser.parse_args(argv)

    config = load()
    with RunLock(config.catalog_db.parent / LOCK_NAME):
        return run(
            config,
            execute_writes=args.execute,
            limit=args.limit,
            repair_only=args.repair,
            verbose=not args.quiet,
        )


if __name__ == "__main__":
    try:
        sys.exit(main())
    except PromoteRefused as exc:
        sys.exit(f"refused: {exc}")
