"""Phase 0: the `G:\\photos` inventory, reconciled against restic.

`PLAN.md` § "Phase 0" in full. Five phases, each a separate subcommand so the
long ones can be resumed across evenings and the cheap decisive ones run first:

    a  establish   ~19 min  scandir walk + `restic ls`, reconciled
    b  fail fast   ~15 min  hash a ~20 GB cluster sample and the drifted files,
                            compare against the repo. THE checkpoint.
    c  inventory   ~4.4 h   hash every file, write `origin`. The product.
    d  verify      ~5.3 h   `restic check` + full per-file `dump --archive tar`
    e  top-up      ~3 min   back up the 36 files that drifted since 2026-07-18

Everything except `e` is read-only against `photos_root`, and `e` does not touch
`photos_root` at all -- it writes to the restic repository.

Intermediate state lives in a work database (`--work-db`, default
`<catalog dir>\\phase0.sqlite3`) rather than in memory, which is what makes `c`
resumable and lets `d` restart per subtree. Nothing in it is authoritative: the
deliverable is `origin` in the catalog, written by `c`.

Two things here are pure logic that fails silently at scale, and both are under
test in `tests/test_inventory.py` rather than trusted: `is_reparse_point`, which
decides whether 8,052 unopenable WSL symlinks are counted as zero-byte files;
and `classify_disagreement`, which decides whether a hash difference is the
expected drift or the one finding that stops the run.
"""

from __future__ import annotations

import argparse
import collections
import hashlib
import json
import os
import sqlite3
import subprocess
import sys
import tarfile
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path

from photolib import restic_repo
from photolib.adopt_mediavault import open_manifest, path_root
from photolib.config import Config, load
from photolib.db import connect

SNAPSHOT = "ce88f697"

# `restic backup` for e7d60189 finished at this local time. A file whose mtime is
# later than this was written after the backup read it, which makes a hash
# disagreement expected rather than alarming.
BACKUP_ENDED = datetime(2026, 7, 18, 10, 28, 35).astimezone()
BACKUP_ENDED_NS = int(BACKUP_ENDED.timestamp() * 1_000_000_000)

# FILE_ATTRIBUTE_REPARSE_POINT. `DirEntry.is_symlink()` only recognises
# IO_REPARSE_TAG_SYMLINK and returns False for the 8,052 WSL symlinks here
# (tag 0xa000001d), which then look like openable zero-byte files and are not.
FILE_ATTRIBUTE_REPARSE_POINT = 0x400

BIG_FILE_BYTES = 1 << 20  # the regime split: >1 MiB reads sequentially, below it seeks
BIG_WORKERS = 4  # 94.4 MB/s measured; 16 workers is slower, not faster
SMALL_WORKERS = 40  # 400.8 files/s measured, against 105.8 at one
READ_CHUNK = 1 << 20

EMPTY_SHA256 = hashlib.sha256().hexdigest()

PROGRESS_SECONDS = 60
INSERT_BATCH = 5000

# Phase B's cluster sample. Directory-order clusters, not scattered files: a
# per-file `restic dump` pays 1.6-2.2 s of index load each, and random-order
# reads cost 13x on the small regime.
SAMPLE_BYTES = 20 * 10**9


# --- pure logic, tested --------------------------------------------------------


def is_reparse_point(st_file_attributes: int) -> bool:
    """True for an NTFS reparse point, whatever its tag.

    The classification the whole walk rests on. WSL symlinks, junctions and
    real symlinks all set this bit; `is_file()`/`is_symlink()` disagree with
    each other about which of those they admit, and both are wrong here.
    """
    return bool(st_file_attributes & FILE_ATTRIBUTE_REPARSE_POINT)


def classify_disagreement(
    *,
    hashes_agree: bool,
    disk_size: int,
    snapshot_size: int,
    disk_mtime_ns: int,
    backup_ended_ns: int = BACKUP_ENDED_NS,
) -> str:
    """One of `agree`, `changed_size`, `changed_mtime`, `hard_stop`.

    A hash difference means one of two very different things and the gate turns
    on telling them apart. If the size differs, or the mtime postdates the
    backup, the file changed after restic read it: expected, benign, log and
    re-back-up. If size *and* mtime both match and the bytes do not, then either
    something was edited in place with its mtime preserved or the repository
    holds bytes it should not -- and that is the one hard stop.
    """
    if hashes_agree:
        return "agree"
    if disk_size != snapshot_size:
        return "changed_size"
    if disk_mtime_ns > backup_ended_ns:
        return "changed_mtime"
    return "hard_stop"


def absolute(photos_root: Path, rel: str) -> str:
    """`photos_root` + `rel`, joined as text.

    Not `photos_root / rel`: `pathlib` normalises, and this string is the join
    key against `origin.path` as `adopt_mediavault` recorded it. A normalisation
    that silently rewrote one side would turn the adopted-hash cross-check into
    a comparison of nothing.
    """
    return f"{photos_root}\\{rel}"


def rel_from_snapshot_path(snapshot_path: str, photos_root: Path) -> str | None:
    """`/G/photos/a/b.jpg` -> `a\\b.jpg`, or None if outside the photos root.

    restic reports POSIX-separated paths rooted at the snapshot's single root
    entry (`G` here). The join key on both sides is the path relative to
    `photos_root`, so neither separator convention leaks into the comparison.
    """
    parts = [part for part in snapshot_path.split("/") if part]
    prefix = [part for part in photos_root.as_posix().replace(":", "").split("/") if part]
    if [part.lower() for part in parts[: len(prefix)]] != [part.lower() for part in prefix]:
        return None
    return "\\".join(parts[len(prefix) :])


# --- the work database ---------------------------------------------------------

_WORK_SCHEMA = """
CREATE TABLE IF NOT EXISTS disk (
  rel       TEXT PRIMARY KEY,
  size      INTEGER NOT NULL,
  mtime_ns  INTEGER NOT NULL,
  reparse   INTEGER NOT NULL,
  sha256    TEXT,
  nlink     INTEGER,
  file_id   TEXT,
  error     TEXT
);
CREATE INDEX IF NOT EXISTS disk_size ON disk(size);
CREATE TABLE IF NOT EXISTS snap (
  rel       TEXT PRIMARY KEY,
  size      INTEGER NOT NULL,
  mtime     TEXT,
  node_type TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS repo_hash (
  rel       TEXT PRIMARY KEY,
  sha256    TEXT NOT NULL,
  size      INTEGER NOT NULL,
  subtree   TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS subtree (
  name      TEXT PRIMARY KEY,
  state     TEXT NOT NULL,
  files     INTEGER, bytes INTEGER, elapsed_s REAL,
  agree     INTEGER, changed_size INTEGER, changed_mtime INTEGER, hard_stop INTEGER,
  missing   INTEGER
);
CREATE TABLE IF NOT EXISTS note (key TEXT PRIMARY KEY, value TEXT NOT NULL);
"""


def open_work(path: Path) -> sqlite3.Connection:
    """The phase's own scratch database. Regenerable, never committed."""
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path, isolation_level=None)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA synchronous = NORMAL")
    conn.executescript(_WORK_SCHEMA)
    return conn


def _note(conn: sqlite3.Connection, key: str, value) -> None:
    conn.execute(
        "INSERT INTO note (key, value) VALUES (?, ?) "
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (key, json.dumps(value)),
    )


class Progress:
    """One line every `PROGRESS_SECONDS`, with elapsed and throughput."""

    def __init__(self, label: str, total: int, total_bytes: int = 0):
        self.label = label
        self.total = total
        self.total_bytes = total_bytes
        self.done = 0
        self.bytes = 0
        self.started = self.announced = time.perf_counter()

    def step(self, byte_count: int = 0) -> None:
        self.done += 1
        self.bytes += byte_count
        now = time.perf_counter()
        if now - self.announced < PROGRESS_SECONDS:
            return
        self.announced = now
        elapsed = now - self.started
        share = f"{self.done:>9,}/{self.total:,}"
        rate = f"{self.done / elapsed:>7,.0f}/s"
        gb = f"{self.bytes / 1e9:>8.1f} GB  {self.bytes / elapsed / 1e6:>6.1f} MB/s"
        eta = ""
        if self.done:
            remaining = (self.total - self.done) * elapsed / self.done
            eta = f"  eta {int(remaining) // 3600}h{int(remaining) % 3600 // 60:02d}m"
        print(
            f"  {self.label:<9}{share}  {int(elapsed) // 60:>4}m{int(elapsed) % 60:02d}s"
            f"  {rate}  {gb}{eta}",
            flush=True,
        )

    def summary(self) -> str:
        elapsed = max(time.perf_counter() - self.started, 1e-6)
        return (
            f"{self.done:,} in {int(elapsed) // 3600}h{int(elapsed) % 3600 // 60:02d}m"
            f"{int(elapsed) % 60:02d}s, {self.done / elapsed:,.0f}/s, "
            f"{self.bytes / 1e9:.1f} GB at {self.bytes / elapsed / 1e6:.1f} MB/s"
        )


# --- Phase A: establish --------------------------------------------------------


def walk_disk(photos_root: Path) -> tuple[list[tuple], dict]:
    """Metadata-only `os.scandir` of the whole tree, in directory order.

    Returns `(rows, counts)` where a row is `(rel, size, mtime_ns, reparse)`.
    No file is opened: this pass exists so Phase C can partition by size, and
    so the two size regimes do not put 44 readers on one head at once.

    Reparse points are recorded and never descended into or opened. A stat
    error is counted and reported rather than swallowed -- "could not stat" is
    not "not there".
    """
    rows: list[tuple] = []
    counts = collections.Counter()
    base = len(str(photos_root)) + 1
    stack = [str(photos_root)]
    progress = Progress("walk", 0)
    while stack:
        current = stack.pop()
        try:
            entries = list(os.scandir(current))
        except OSError as error:
            counts["dir_errors"] += 1
            print(f"  walk     cannot list {current}: {error}", flush=True)
            continue
        for entry in entries:
            try:
                stat = entry.stat(follow_symlinks=False)
            except OSError:
                counts["stat_errors"] += 1
                continue
            reparse = is_reparse_point(getattr(stat, "st_file_attributes", 0))
            if reparse:
                counts["reparse"] += 1
                rows.append((entry.path[base:], 0, stat.st_mtime_ns, 1))
                progress.total += 1
                progress.step()
                continue
            if entry.is_dir(follow_symlinks=False):
                counts["dirs"] += 1
                stack.append(entry.path)
                continue
            counts["files"] += 1
            counts["bytes"] += stat.st_size
            if stat.st_size == 0:
                counts["zero"] += 1
            elif stat.st_size > BIG_FILE_BYTES:
                counts["big"] += 1
            else:
                counts["small"] += 1
            rows.append((entry.path[base:], stat.st_size, stat.st_mtime_ns, 0))
            progress.total += 1
            progress.step()
    counts["elapsed_s"] = int(time.perf_counter() - progress.started)
    return rows, dict(counts)


def load_snapshot(config: Config, work: sqlite3.Connection, snapshot: str) -> dict:
    """`restic ls --json --long --recursive` into `snap`. Never for identity.

    `type == "file"` is an explicit allowlist, not `not dir`: junctions appear
    as `type: "symlink"`, and `size` is absent on zero-byte *and* symlink nodes.
    """
    photos_root = config.photos_root
    counts = collections.Counter()
    batch: list[tuple] = []
    progress = Progress("ls", 0)
    work.execute("BEGIN")
    for node in restic_repo.ls_nodes(config, snapshot):
        node_type = node.get("type")
        counts[f"node_{node_type}"] += 1
        progress.total += 1
        progress.step()
        if node_type != "file":
            continue
        rel = rel_from_snapshot_path(node.get("path", ""), photos_root)
        if rel is None:
            counts["outside_photos_root"] += 1
            continue
        if "\ufffd" in rel:
            counts["replacement_char"] += 1
        size = node.get("size", 0)
        counts["files"] += 1
        counts["bytes"] += size
        batch.append((rel, size, node.get("mtime"), node_type))
        if len(batch) >= INSERT_BATCH:
            work.executemany("INSERT OR REPLACE INTO snap VALUES (?,?,?,?)", batch)
            batch.clear()
    work.executemany("INSERT OR REPLACE INTO snap VALUES (?,?,?,?)", batch)
    work.execute("COMMIT")
    counts["elapsed_s"] = int(time.perf_counter() - progress.started)
    return dict(counts)


def reconcile_paths(work: sqlite3.Connection) -> dict:
    """A2 against A3: one-sided paths, size disagreements, post-backup mtimes."""
    only_disk = work.execute(
        "SELECT d.rel, d.size, d.mtime_ns FROM disk d LEFT JOIN snap s USING (rel) "
        "WHERE s.rel IS NULL AND d.reparse = 0 ORDER BY d.rel"
    ).fetchall()
    only_disk_reparse = work.execute(
        "SELECT count(*) FROM disk d LEFT JOIN snap s USING (rel) "
        "WHERE s.rel IS NULL AND d.reparse = 1"
    ).fetchone()[0]
    only_snap = work.execute(
        "SELECT s.rel, s.size FROM snap s LEFT JOIN disk d USING (rel) "
        "WHERE d.rel IS NULL ORDER BY s.rel"
    ).fetchall()
    size_differs = work.execute(
        "SELECT rel, d.size, s.size FROM disk d JOIN snap s USING (rel) "
        "WHERE d.reparse = 0 AND d.size != s.size ORDER BY rel"
    ).fetchall()
    after_backup = work.execute(
        "SELECT rel, size, mtime_ns FROM disk WHERE reparse = 0 AND mtime_ns > ? ORDER BY rel",
        (BACKUP_ENDED_NS,),
    ).fetchall()
    return {
        "only_disk": only_disk,
        "only_disk_reparse": only_disk_reparse,
        "only_snap": only_snap,
        "size_differs": size_differs,
        "after_backup": after_backup,
    }


def phase_a(config: Config, work: sqlite3.Connection, snapshot: str) -> int:
    print("=== PHASE A: establish ===\n", flush=True)

    repo_config = restic_repo.cat_config(config)
    snaps = restic_repo.snapshots(config)
    copied = [s["short_id"] for s in snaps if "original" in s]
    print(
        f"A1 repo   version {repo_config.get('version')}, "
        f"chunker_polynomial {repo_config.get('chunker_polynomial')}"
    )
    for snap in snaps:
        print(
            f"          {snap['short_id']}  {snap['time'][:19]}  "
            f"parent={(snap.get('parent') or '')[:8] or '-'}  original={'YES' if 'original' in snap else 'no'}"
        )
    print(f"          snapshots carrying `original`: {len(copied)} -- {copied or 'none, no restic copy'}\n")
    _note(work, "repo_config", repo_config)

    print(f"A2 walk   {config.photos_root} (metadata only, no file is opened)", flush=True)
    rows, counts = walk_disk(config.photos_root)
    work.execute("BEGIN")
    work.execute("DELETE FROM disk")
    for start in range(0, len(rows), INSERT_BATCH):
        work.executemany(
            "INSERT INTO disk (rel, size, mtime_ns, reparse) VALUES (?,?,?,?)",
            rows[start : start + INSERT_BATCH],
        )
    work.execute("COMMIT")
    print(
        f"          {counts.get('files', 0):,} files, {counts.get('reparse', 0):,} reparse points, "
        f"{counts.get('dirs', 0):,} dirs, {counts.get('bytes', 0):,} bytes "
        f"in {counts['elapsed_s'] // 60}m{counts['elapsed_s'] % 60:02d}s"
    )
    print(
        f"          regimes: big {counts.get('big', 0):,}  small {counts.get('small', 0):,}  "
        f"zero {counts.get('zero', 0):,}"
    )
    print(
        f"          stat errors {counts.get('stat_errors', 0):,}, "
        f"dir errors {counts.get('dir_errors', 0):,}\n"
    )
    _note(work, "walk", counts)

    print(f"A3 ls     snapshot {snapshot}", flush=True)
    snap_counts = load_snapshot(config, work, snapshot)
    print(
        f"          {snap_counts.get('files', 0):,} file nodes, "
        f"{snap_counts.get('node_dir', 0):,} dirs, "
        f"{snap_counts.get('node_symlink', 0):,} symlinks, "
        f"{snap_counts.get('bytes', 0):,} bytes "
        f"in {snap_counts['elapsed_s'] // 60}m{snap_counts['elapsed_s'] % 60:02d}s"
    )
    print(
        f"          U+FFFD in path {snap_counts.get('replacement_char', 0):,}, "
        f"outside photos_root {snap_counts.get('outside_photos_root', 0):,}\n"
    )
    _note(work, "snapshot", snap_counts)

    print("A4 reconcile", flush=True)
    diff = reconcile_paths(work)
    print(f"          on disk, absent from snapshot : {len(diff['only_disk']):,} files")
    print(f"          (plus {diff['only_disk_reparse']:,} reparse points, correctly declined)")
    print(f"          in snapshot, absent from disk : {len(diff['only_snap']):,}")
    print(f"          size disagreements            : {len(diff['size_differs']):,}")
    print(f"          mtime after {BACKUP_ENDED:%Y-%m-%d %H:%M:%S} : {len(diff['after_backup']):,}")
    only_disk_bytes = sum(row[1] for row in diff["only_disk"])
    size_delta = sum(row[1] - row[2] for row in diff["size_differs"])
    disk_bytes = work.execute("SELECT sum(size) FROM disk WHERE reparse = 0").fetchone()[0] or 0
    snap_bytes = work.execute("SELECT sum(size) FROM snap").fetchone()[0] or 0
    print(f"\n          {disk_bytes:,} (disk) - {snap_bytes:,} (snapshot) = {disk_bytes - snap_bytes:,}")
    print(f"                     = {only_disk_bytes:,}  ({len(diff['only_disk']):,} new files)")
    print(f"                     + {size_delta:,}  ({len(diff['size_differs']):,} grown files)")
    closes = disk_bytes - snap_bytes == only_disk_bytes + size_delta
    print(f"          byte arithmetic closes: {'YES' if closes else 'NO'}\n")
    for label, rows_ in (
        ("only on disk", diff["only_disk"]),
        ("size differs", diff["size_differs"]),
        ("mtime after backup", diff["after_backup"]),
    ):
        print(f"          {label} ({len(rows_)}):")
        for row in rows_[:40]:
            print(f"            {row[0]}")
        if len(rows_) > 40:
            print(f"            ... {len(rows_) - 40} more")
    _note(
        work,
        "reconcile",
        {key: (value if isinstance(value, int) else len(value)) for key, value in diff.items()},
    )
    return 0


# --- hashing -------------------------------------------------------------------


class Hasher:
    """SHA-256 over an already-open handle, with identity metadata for free.

    `os.fstat` on the open descriptor gives `st_nlink` and the NTFS file ID
    without a second path resolution, so identity costs no extra I/O. When
    `nlink > 1` the digest is cached per file ID and reused: hardlinked names
    are one filesystem object and reading it twice buys nothing.
    """

    def __init__(self, root: Path):
        self.root = root
        self.lock = threading.Lock()
        self.by_file_id: dict[int, str] = {}
        self.reused = 0

    def hash_one(self, rel: str) -> tuple:
        """`(rel, sha256, nlink, file_id, bytes read, error)`."""
        try:
            fd = os.open(str(self.root / rel), os.O_RDONLY | getattr(os, "O_BINARY", 0))
        except OSError as error:
            return (rel, None, None, None, 0, f"open: {error.strerror or error}")
        try:
            stat = os.fstat(fd)
            file_id = stat.st_ino
            if stat.st_nlink > 1:
                with self.lock:
                    cached = self.by_file_id.get(file_id)
                if cached is not None:
                    with self.lock:
                        self.reused += 1
                    return (rel, cached, stat.st_nlink, file_id, 0, None)
            digest = hashlib.sha256()
            read = 0
            while True:
                block = os.read(fd, READ_CHUNK)
                if not block:
                    break
                digest.update(block)
                read += len(block)
            hexdigest = digest.hexdigest()
            if stat.st_nlink > 1:
                with self.lock:
                    self.by_file_id.setdefault(file_id, hexdigest)
            return (rel, hexdigest, stat.st_nlink, file_id, read, None)
        except OSError as error:
            return (rel, None, None, None, 0, f"read: {error.strerror or error}")
        finally:
            os.close(fd)


def _store_file_id(file_id: int | None) -> str | None:
    """NTFS file IDs carry a sequence number and can exceed SQLite's 64-bit int."""
    return None if file_id is None else str(file_id)


def hash_regime(
    work: sqlite3.Connection,
    root: Path,
    rows: list[tuple[str, int]],
    *,
    label: str,
    workers: int,
) -> dict:
    """Hash `rows` (rel, size) in the order given, writing results as they land."""
    hasher = Hasher(root)
    progress = Progress(label, len(rows), sum(size for _, size in rows))
    counts = collections.Counter()
    errors: list[tuple[str, str]] = []
    batch: list[tuple] = []

    def flush() -> None:
        work.execute("BEGIN")
        work.executemany(
            "UPDATE disk SET sha256=?, nlink=?, file_id=?, error=? WHERE rel=?", batch
        )
        work.execute("COMMIT")
        batch.clear()

    with ThreadPoolExecutor(max(workers, 1)) as pool:
        for rel, sha256, nlink, file_id, read, error in pool.map(
            hasher.hash_one, [rel for rel, _ in rows]
        ):
            if error is None:
                counts["hashed"] += 1
                if nlink and nlink > 1:
                    counts["nlink_gt_1"] += 1
            else:
                counts["errors"] += 1
                errors.append((rel, error))
            batch.append((sha256, nlink, _store_file_id(file_id), error, rel))
            progress.step(read)
            if len(batch) >= INSERT_BATCH:
                flush()
    flush()
    counts["reused_by_file_id"] = hasher.reused
    counts["elapsed_s"] = int(time.perf_counter() - progress.started)
    print(f"  {label:<9}done: {progress.summary()}", flush=True)
    return {"counts": dict(counts), "errors": errors}


def pending(work: sqlite3.Connection, *, big: bool | None = None) -> list[tuple[str, int]]:
    """Un-hashed, non-reparse rows in walk order. Re-running resumes here."""
    where = "reparse = 0 AND sha256 IS NULL AND error IS NULL"
    if big is True:
        where += f" AND size > {BIG_FILE_BYTES}"
    elif big is False:
        where += f" AND size <= {BIG_FILE_BYTES}"
    return work.execute(f"SELECT rel, size FROM disk WHERE {where} ORDER BY rowid").fetchall()


# --- Phase B: fail fast --------------------------------------------------------


def cluster_sample(
    work: sqlite3.Connection, target_bytes: int
) -> tuple[list[str], list[str], int]:
    """Directory-order clusters totalling ~`target_bytes`, spanning both regimes.

    Returns `(directories, rels, bytes)`. Whole directories, because the
    comparison side is a `restic dump` of a subtree and per-file dumps pay a
    1.6-2.2 s index load each. The picks alternate between the largest-by-bytes
    directory and the one densest in small files, so the sample spans both
    regimes rather than being 20 GB of one of them.
    """
    rows = work.execute(
        "SELECT rel, size FROM disk WHERE reparse = 0 ORDER BY rowid"
    ).fetchall()
    by_dir: dict[str, list[tuple[str, int]]] = collections.defaultdict(list)
    for rel, size in rows:
        by_dir[rel.rpartition("\\")[0]].append((rel, size))

    def stats(items):
        total = sum(size for _, size in items)
        big = sum(1 for _, size in items if size > BIG_FILE_BYTES)
        return total, big

    candidates = []
    for directory, items in by_dir.items():
        if not directory:
            continue
        total, big = stats(items)
        candidates.append((directory, len(items), total, big))

    # Two independent budgets, not one alternating loop. Sharing a budget lets
    # the first big-file directory swallow it whole and leave the small regime
    # with nothing, which is the half of the corpus where the 13x random-order
    # penalty and the reparse points live -- exactly the half worth sampling.
    chosen: set[str] = set()
    taken = 0
    ordered = (
        sorted(candidates, key=lambda c: -c[2]),  # by bytes
        sorted(candidates, key=lambda c: -(c[1] - c[3])),  # by small-file count
    )
    for queue in ordered:
        budget = target_bytes // 2
        here = 0
        for candidate in queue:
            if candidate[0] in chosen or candidate[2] == 0:
                continue
            # `here` being zero is what guarantees each regime contributes at
            # least one directory however lopsided its first candidate is.
            if here and here + candidate[2] > budget * 1.35:
                continue
            chosen.add(candidate[0])
            here += candidate[2]
            # Each pick is one more `restic dump`, and each of those loads the
            # index. A sample spread over hundreds of directories would spend
            # the whole checkpoint on startup.
            if here >= budget or len(chosen) >= 24:
                break
        taken += here
    rels = [rel for directory in chosen for rel, _ in by_dir[directory]]
    return sorted(chosen), rels, taken


def _tar_rel(member_name: str, photos_root: Path) -> str | None:
    """A tar member name from `dump --archive tar`, as a photos-root-relative path.

    Measured against restic 0.19.1: every member carries its **full snapshot
    path** with no leading slash -- `G/photos/<rel>` -- whichever subtree was
    dumped, not a path relative to the dumped node. Returns None for a member
    outside the photos root, which the caller treats as a fault rather than as
    a file to skip.
    """
    return rel_from_snapshot_path("/" + member_name.replace("\\", "/"), photos_root)


def subtree_rels(work: sqlite3.Connection, prefix: str) -> dict[str, int]:
    """Every disk file under one directory, as `{rel: size}`.

    Prefix-matched with `substr`, not `LIKE`: several of these directory names
    contain an underscore, which `LIKE` reads as a single-character wildcard.
    """
    head = prefix + "\\"
    return dict(
        work.execute(
            "SELECT rel, size FROM disk WHERE reparse = 0 AND substr(rel, 1, ?) = ?",
            (len(head), head),
        )
    )


def snapshot_node(config: Config, subtree_rel: str) -> str:
    """`G/photos/<subtree>` -- the bare, no-leading-slash form `dump` requires."""
    parts = [part for part in config.photos_root.as_posix().replace(":", "").split("/") if part]
    return "/".join(parts + subtree_rel.split("\\")) if subtree_rel else "/".join(parts)


def dump_and_hash(
    config: Config,
    snapshot: str,
    subtree_rel: str,
    *,
    progress: Progress | None = None,
):
    """Yield `(rel, sha256, size)` for every file in one subtree of the repo."""
    proc = restic_repo.dump_tar(config, snapshot, snapshot_node(config, subtree_rel))
    try:
        with tarfile.open(fileobj=proc.stdout, mode="r|", encoding="utf-8") as archive:
            for member in archive:
                if not member.isfile():
                    continue
                stream = archive.extractfile(member)
                digest = hashlib.sha256()
                read = 0
                while True:
                    block = stream.read(READ_CHUNK)
                    if not block:
                        break
                    digest.update(block)
                    read += len(block)
                rel = _tar_rel(member.name, config.photos_root)
                if rel is None:
                    raise RuntimeError(
                        f"tar member {member.name!r} is not under {config.photos_root}; "
                        "the member-name mapping is wrong and every comparison would be vacuous"
                    )
                if progress is not None:
                    progress.total = max(progress.total, progress.done + 1)
                    progress.step(read)
                yield rel, digest.hexdigest(), read
    finally:
        if proc.stdout is not None:
            proc.stdout.close()
        stderr = proc.stderr.read().decode("utf-8", "replace") if proc.stderr else ""
        if proc.stderr is not None:
            proc.stderr.close()
        code = proc.wait()
        if code != 0:
            raise RuntimeError(f"restic dump {subtree_rel!r} exited {code}: {stderr.strip()[:2000]}")


def compare(work: sqlite3.Connection, rel: str, repo_sha: str) -> tuple[str, tuple]:
    """Classify one repo-vs-disk comparison. Returns `(bucket, detail)`."""
    row = work.execute(
        "SELECT d.size, d.mtime_ns, d.sha256, s.size FROM disk d "
        "LEFT JOIN snap s USING (rel) WHERE d.rel = ?",
        (rel,),
    ).fetchone()
    if row is None:
        return "not_on_disk", (rel, repo_sha)
    disk_size, mtime_ns, disk_sha, snap_size = row
    if disk_sha is None:
        return "not_hashed", (rel, repo_sha)
    bucket = classify_disagreement(
        hashes_agree=disk_sha == repo_sha,
        disk_size=disk_size,
        snapshot_size=snap_size if snap_size is not None else disk_size,
        disk_mtime_ns=mtime_ns,
    )
    return bucket, (rel, disk_sha, repo_sha, disk_size, snap_size, mtime_ns)


def phase_b(config: Config, work: sqlite3.Connection, snapshot: str) -> int:
    print("=== PHASE B: fail fast ===\n", flush=True)

    drifted = [
        row[0]
        for row in work.execute(
            "SELECT d.rel FROM disk d JOIN snap s USING (rel) "
            "WHERE d.reparse = 0 AND d.mtime_ns > ? ORDER BY d.rel",
            (BACKUP_ENDED_NS,),
        )
    ]
    subtrees, sample, sample_bytes = cluster_sample(work, SAMPLE_BYTES)
    print(
        f"B1 sample {len(sample):,} files / {sample_bytes / 1e9:.1f} GB across "
        f"{len(subtrees)} directories, plus {len(drifted)} files whose mtime postdates the backup"
    )
    for directory in subtrees:
        print(f"            {directory}")

    wanted = set(sample) | set(drifted)
    todo = [
        (rel, size)
        for rel, size in work.execute(
            "SELECT rel, size FROM disk WHERE reparse = 0 AND sha256 IS NULL ORDER BY rowid"
        )
        if rel in wanted
    ]
    if todo:
        big = [item for item in todo if item[1] > BIG_FILE_BYTES]
        small = [item for item in todo if item[1] <= BIG_FILE_BYTES]
        if big:
            hash_regime(work, config.photos_root, big, label="disk big", workers=BIG_WORKERS)
        if small:
            hash_regime(work, config.photos_root, small, label="disk small", workers=SMALL_WORKERS)
    else:
        print("          already hashed, reusing")

    print("\nB2 repo   dumping the same paths back out of the repository", flush=True)
    buckets: collections.Counter = collections.Counter()
    findings: list[tuple] = []
    seen: set[str] = set()

    for rel in drifted:
        payload = restic_repo.dump_file(config, snapshot, snapshot_node(config, rel))
        bucket, detail = compare(work, rel, hashlib.sha256(payload).hexdigest())
        buckets[bucket] += 1
        seen.add(rel)
        if bucket != "agree":
            findings.append((bucket, detail))

    # A cluster already compared by an earlier B run is not compared again: it
    # is tens of minutes of dump for an answer that is on record. The skipped
    # clusters are still counted below, so the verdict covers the whole sample
    # rather than only this run's part of it.
    sampled = {
        row[0]: row[1:]
        for row in work.execute(
            "SELECT name, agree, changed_size, changed_mtime, hard_stop, missing "
            "FROM subtree WHERE state = 'sampled'"
        )
    }
    sample_set = set(sample)
    for directory in subtrees:
        if directory in sampled:
            agree, changed_size, changed_mtime, hard_stop, missing = sampled[directory]
            buckets.update(
                {
                    "agree": agree,
                    "changed_size": changed_size,
                    "changed_mtime": changed_mtime,
                    "hard_stop": hard_stop,
                }
            )
            seen |= {rel for rel in subtree_rels(work, directory) if rel in sample_set}
            print(f"          {directory}: already compared, {agree:,} agreed", flush=True)
            continue
        expected = subtree_rels(work, directory)
        progress = Progress("dump", len(expected), sum(expected.values()))
        here: collections.Counter = collections.Counter()
        for rel, repo_sha, _ in dump_and_hash(config, snapshot, directory, progress=progress):
            if rel not in sample_set or rel in seen:
                continue
            seen.add(rel)
            bucket, detail = compare(work, rel, repo_sha)
            buckets[bucket] += 1
            here[bucket] += 1
            if bucket != "agree":
                findings.append((bucket, detail))
        work.execute(
            "INSERT OR REPLACE INTO subtree VALUES (?,?,?,?,?,?,?,?,?,?)",
            (
                directory, "sampled", progress.done, progress.bytes,
                time.perf_counter() - progress.started, here["agree"], here["changed_size"],
                here["changed_mtime"], here["hard_stop"], 0,
            ),
        )
        print(f"          {directory}: {progress.summary()}", flush=True)

    missing_from_repo = sorted((sample_set | set(drifted)) - seen)
    print("\nB3 verdict")
    if len(missing_from_repo) > max(len(sample_set) // 100, len(drifted)):
        print(
            f"          {len(missing_from_repo):,} of {len(sample_set) + len(drifted):,} sampled "
            "paths never appeared in the dump. Either the tar member names do not map onto "
            "disk paths or the repo does not hold them. Stopping before Phase C."
        )
        for rel in missing_from_repo[:20]:
            print(f"            {rel}")
        return 2
    for bucket, count in sorted(buckets.items()):
        print(f"          {bucket:<14}{count:>9,}")
    print(f"          {'never seen in repo':<14}{len(missing_from_repo):>9,}")
    for bucket, detail in findings[:40]:
        print(f"            {bucket}: {detail[0]}")
        if bucket == "hard_stop":
            print(f"              disk {detail[1]}  repo {detail[2]}  size {detail[3]}")
    for rel in missing_from_repo[:20]:
        print(f"            absent from repo: {rel}")

    if buckets["hard_stop"]:
        print(
            "\n*** HARD STOP: a file matches on size AND mtime but differs in hash. "
            "The repository does not contain what the catalogue would claim. "
            "Not continuing to Phase C. ***"
        )
        return 2
    print("\n          no same-size same-mtime disagreement. Phase C may proceed.")
    return 0


# --- Phase C: the inventory ----------------------------------------------------

_ORIGIN_INSERT = """
INSERT INTO origin (path, root, ext, size, mtime_ns, sha256, nlink, file_id, seen_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(path) DO UPDATE SET
  size    = excluded.size,
  nlink   = excluded.nlink,
  file_id = excluded.file_id,
  sha256  = COALESCE(origin.sha256, excluded.sha256),
  mtime_ns = CASE
    WHEN origin.mtime_ns IS NULL OR excluded.mtime_ns < origin.mtime_ns
    THEN excluded.mtime_ns ELSE origin.mtime_ns END
"""

_FILE_INSERT = """
INSERT INTO file (sha256, size, ext, state, feature_ver)
VALUES (?, ?, ?, 'pending', '{}')
ON CONFLICT(sha256) DO NOTHING
"""


def write_origin(work: sqlite3.Connection, catalog: sqlite3.Connection, photos_root: Path) -> dict:
    """`origin` for every hashed file, then `file` rows for anything new.

    An adopted `sha256` is compared, never overwritten. `COALESCE` keeps the
    existing value and the disagreement list is built first, so a disagreement
    aborts before a single row is written: replacing the adopted value would
    destroy the only evidence that v1 and this pass disagree.

    `mtime_ns` follows the same order-independent rule `adopt_mediavault` uses,
    keeping the *earliest* observation, because step 8 resolves undated photos
    by `min(mtime_ns)` and a later observation must not bias those dates
    forward.
    """
    adopted = {
        row[0]: row[1]
        for row in catalog.execute("SELECT path, sha256 FROM origin WHERE sha256 IS NOT NULL")
    }
    counts = collections.Counter()
    disagreements: list[tuple[str, str, str]] = []
    rows = work.execute(
        "SELECT rel, size, mtime_ns, sha256, nlink, file_id FROM disk "
        "WHERE reparse = 0 AND sha256 IS NOT NULL ORDER BY rowid"
    ).fetchall()
    for rel, _, _, sha256, _, _ in rows:
        recorded = adopted.get(absolute(photos_root, rel))
        if recorded is None:
            counts["new"] += 1
        elif recorded == sha256:
            counts["agreed_with_adopted"] += 1
        else:
            disagreements.append((rel, recorded, sha256))
    if disagreements:
        return {"counts": dict(counts), "disagreements": disagreements, "written": 0}

    # Adopted paths that this walk did not produce. Expected to be zero: all
    # 251,087 were cross-checked as present on disk. A non-zero count here with
    # `agreed_with_adopted` at zero would mean the two sides spell the same path
    # differently, which the row-count assert afterwards is what catches.
    constructed = {absolute(photos_root, rel) for rel, *_ in rows}
    counts["adopted_paths_not_on_disk"] = len(set(adopted) - constructed)
    expected_rows = len(rows) + counts["adopted_paths_not_on_disk"]

    seen_at = datetime.now().astimezone().isoformat(timespec="seconds")
    progress = Progress("origin", len(rows))
    batch: list[tuple] = []
    for rel, size, mtime_ns, sha256, nlink, file_id in rows:
        batch.append(
            (
                absolute(photos_root, rel),
                path_root(rel),
                os.path.splitext(rel)[1].lower(),
                size,
                mtime_ns,
                sha256,
                nlink,
                file_id,
                seen_at,
            )
        )
        progress.step()
        if len(batch) >= INSERT_BATCH:
            catalog.execute("BEGIN")
            catalog.executemany(_ORIGIN_INSERT, batch)
            catalog.execute("COMMIT")
            batch.clear()
    catalog.execute("BEGIN")
    catalog.executemany(_ORIGIN_INSERT, batch)
    catalog.execute("COMMIT")

    before = catalog.execute("SELECT count(*) FROM file").fetchone()[0]
    catalog.execute("BEGIN")
    catalog.execute(
        """
        INSERT INTO file (sha256, size, ext, state, feature_ver)
        SELECT o.sha256, min(o.size), min(o.ext), 'pending', '{}'
        FROM origin o LEFT JOIN file f ON f.sha256 = o.sha256
        WHERE o.sha256 IS NOT NULL AND f.sha256 IS NULL
        GROUP BY o.sha256
        """
    )
    catalog.execute("COMMIT")
    counts["file_rows_added"] = (
        catalog.execute("SELECT count(*) FROM file").fetchone()[0] - before
    )
    counts["expected_origin_rows"] = expected_rows
    return {"counts": dict(counts), "disagreements": [], "written": len(rows)}


def phase_c(config: Config, work: sqlite3.Connection) -> int:
    print("=== PHASE C: the inventory ===\n", flush=True)

    big = pending(work, big=True)
    print(
        f"C1 big    {len(big):,} files / {sum(size for _, size in big) / 1e9:.1f} GB, "
        f"{BIG_WORKERS} workers, directory order",
        flush=True,
    )
    big_result = hash_regime(
        work, config.photos_root, big, label="disk big", workers=BIG_WORKERS
    ) if big else {"counts": {}, "errors": []}

    small = pending(work, big=False)
    print(
        f"\nC2 small  {len(small):,} files / {sum(size for _, size in small) / 1e9:.1f} GB, "
        f"{SMALL_WORKERS} workers, directory order",
        flush=True,
    )
    small_result = hash_regime(
        work, config.photos_root, small, label="disk small", workers=SMALL_WORKERS
    ) if small else {"counts": {}, "errors": []}

    hashed, errors, nlink_gt_1 = work.execute(
        "SELECT count(sha256), count(error), coalesce(sum(nlink > 1), 0) "
        "FROM disk WHERE reparse = 0"
    ).fetchone()
    reparse = work.execute("SELECT count(*) FROM disk WHERE reparse = 1").fetchone()[0]
    distinct = work.execute(
        "SELECT count(DISTINCT sha256) FROM disk WHERE sha256 IS NOT NULL"
    ).fetchone()[0]
    print(f"\n          hashed {hashed:,}, errors {errors:,}, distinct sha256 {distinct:,}")
    print(
        f"          nlink > 1: {nlink_gt_1:,} files; "
        f"digests reused by file ID: "
        f"{big_result['counts'].get('reused_by_file_id', 0) + small_result['counts'].get('reused_by_file_id', 0):,}"
    )
    print(f"          reparse points skipped (never opened): {reparse:,}")
    for rel, error in (big_result["errors"] + small_result["errors"])[:20]:
        print(f"            error {rel}: {error}")
    if errors:
        print("\n*** files could not be read. That is NOT 'no duplicate found'. ***")

    print("\nC3 origin", flush=True)
    catalog = connect()
    try:
        result = write_origin(work, catalog, config.photos_root)
        if result["disagreements"]:
            print(
                f"\n*** {len(result['disagreements']):,} adopted sha256 values disagree with this "
                "pass. Nothing written. Both values, first 40: ***"
            )
            for rel, adopted_sha, fresh in result["disagreements"][:40]:
                print(f"            {rel}\n              adopted {adopted_sha}\n              fresh   {fresh}")
            return 2
        counts = result["counts"]
        print(f"          {result['written']:,} origin rows written")
        print(f"          new paths                 {counts.get('new', 0):,}")
        print(
            f"          agreed with adopted sha256 {counts.get('agreed_with_adopted', 0):,}"
            "  <- independent cross-check of v1's hashing, no disagreements"
        )
        origin_rows, distinct_paths = catalog.execute(
            "SELECT count(*), count(DISTINCT path) FROM origin"
        ).fetchone()
        pending_files = catalog.execute(
            "SELECT count(*) FROM file WHERE state = 'pending'"
        ).fetchone()[0]
        print(f"          origin rows {origin_rows:,}, distinct paths {distinct_paths:,}")
        print(
            f"          file rows added {counts.get('file_rows_added', 0):,}, "
            f"state='pending' now {pending_files:,}"
        )
        print(f"          adopted paths not on disk {counts.get('adopted_paths_not_on_disk', 0):,}")
        assert origin_rows == distinct_paths, "count(distinct path) != count(origin rows)"
        expected = counts.get("expected_origin_rows")
        if expected is not None and origin_rows != expected:
            print(
                f"\n*** origin holds {origin_rows:,} rows, expected {expected:,}. The two sides "
                "spell some paths differently, so the adopted-hash comparison did not compare "
                "what it claims. ***"
            )
            return 2
    finally:
        catalog.close()
    return 0


# --- Phase D: full verification ------------------------------------------------


def top_level_subtrees(work: sqlite3.Connection) -> tuple[list[str], list[str]]:
    """Directories directly under the photos root, plus any top-level files."""
    dirs: dict[str, int] = collections.Counter()
    loose: list[str] = []
    for rel, size in work.execute("SELECT rel, size FROM disk WHERE reparse = 0"):
        head, sep, _ = rel.partition("\\")
        if sep:
            dirs[head] += size
        else:
            loose.append(rel)
    return [name for name, _ in sorted(dirs.items(), key=lambda item: item[1])], sorted(loose)


def phase_d(config: Config, work: sqlite3.Connection, snapshot: str, *, read_data: bool) -> int:
    print("=== PHASE D: full per-file verification ===\n", flush=True)

    unhashed = work.execute(
        "SELECT count(*) FROM disk WHERE reparse = 0 AND sha256 IS NULL AND error IS NULL"
    ).fetchone()[0]
    if unhashed:
        print(f"*** {unhashed:,} disk files are not hashed yet. Run phase c first. ***")
        return 2

    # restic verifies each blob's plaintext hash against its ID when it loads
    # it, so D2's dump already reads and verifies every *referenced* data blob.
    # What plain `check` adds is unreferenced blobs and pack/index structure;
    # the 1/8 subset samples the packs. `--read-data` remains available for a
    # run that wants the full 436.18 GB re-read instead.
    passes = [[], ["--read-data"] if read_data else ["--read-data-subset=1/8"]]
    print(f"D1 check  restic check, then {passes[1][0]}", flush=True)
    started = time.perf_counter()
    for extra in passes:
        argv = restic_repo.read_argv(config, "check", *extra)
        print(f"          $ restic check {' '.join(extra)}", flush=True)
        code = _stream(argv)
        if code != 0:
            print(f"\n*** restic check {' '.join(extra)} exited {code}. Stopping. ***")
            return 2
    print(f"          check complete in {int(time.perf_counter() - started) // 60}m\n")

    subtrees, loose = top_level_subtrees(work)
    done = {
        row[0]
        for row in work.execute("SELECT name FROM subtree WHERE state = 'verified'")
    }
    print(f"D2 dump   {len(subtrees)} subtrees, {len(loose)} loose top-level files")
    print(f"          {len(done)} already verified, resuming with {len(subtrees) - len(done)}\n")

    totals: collections.Counter = collections.Counter()
    findings: list[tuple] = []
    for name in subtrees:
        if name in done:
            continue
        on_disk = subtree_rels(work, name)
        progress = Progress(name[:9], len(on_disk), sum(on_disk.values()))
        buckets: collections.Counter = collections.Counter()
        seen: set[str] = set()
        batch: list[tuple] = []
        for rel, repo_sha, size in dump_and_hash(config, snapshot, name, progress=progress):
            seen.add(rel)
            batch.append((rel, repo_sha, size, name))
            if len(batch) >= INSERT_BATCH:
                work.execute("BEGIN")
                work.executemany("INSERT OR REPLACE INTO repo_hash VALUES (?,?,?,?)", batch)
                work.execute("COMMIT")
                batch.clear()
            bucket, detail = compare(work, rel, repo_sha)
            buckets[bucket] += 1
            if bucket != "agree":
                findings.append((bucket, detail))
        work.execute("BEGIN")
        work.executemany("INSERT OR REPLACE INTO repo_hash VALUES (?,?,?,?)", batch)
        work.execute("COMMIT")
        missing = len(on_disk.keys() - seen)
        state = "verified" if not buckets["hard_stop"] else "hard_stop"
        work.execute(
            "INSERT OR REPLACE INTO subtree VALUES (?,?,?,?,?,?,?,?,?,?)",
            (
                name, state, progress.done, progress.bytes, time.perf_counter() - progress.started,
                buckets["agree"], buckets["changed_size"], buckets["changed_mtime"],
                buckets["hard_stop"], missing,
            ),
        )
        totals.update(buckets)
        totals["missing"] += missing
        print(
            f"  {name[:24]:<24} {progress.summary()}  agree {buckets['agree']:,}  "
            f"benign {buckets['changed_size'] + buckets['changed_mtime']:,}  "
            f"HARD STOP {buckets['hard_stop']:,}  not in repo {missing:,}",
            flush=True,
        )
        if buckets["hard_stop"]:
            print("\n*** HARD STOP in this subtree. Not continuing. ***")
            for bucket, detail in findings:
                if bucket == "hard_stop":
                    print(f"    {detail}")
            return 2

    for rel in loose:
        payload = restic_repo.dump_file(config, snapshot, snapshot_node(config, rel))
        bucket, detail = compare(work, rel, hashlib.sha256(payload).hexdigest())
        totals[bucket] += 1
        if bucket != "agree":
            findings.append((bucket, detail))

    print("\nD3 reconcile")
    return _phase_d_report(config, work, totals, findings)


def _stream(argv: list[str]) -> int:
    """Run a command, echoing its output as it goes. Used for `restic check`."""
    proc = subprocess.Popen(
        argv, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, encoding="utf-8", errors="replace"
    )
    for line in proc.stdout:
        print(f"          | {line.rstrip()}", flush=True)
    proc.stdout.close()
    return proc.wait()


def _phase_d_report(config, work, totals, findings) -> int:
    files_on_disk, files_hashed = work.execute(
        "SELECT count(*), count(sha256) FROM disk WHERE reparse = 0"
    ).fetchone()
    in_snapshot = work.execute("SELECT count(*) FROM snap").fetchone()[0]
    verified = work.execute("SELECT count(*) FROM repo_hash").fetchone()[0]
    print(f"          files_seen_on_disk      {files_on_disk:,}")
    print(f"          files_hashed_from_disk  {files_hashed:,}")
    print(f"          files_seen_in_snapshot  {in_snapshot:,}")
    print(f"          files_hashed_from_repo  {verified:,}")
    print(f"          disk - snapshot         {files_on_disk - in_snapshot:,} (expected 30)")

    catalog = connect(read_only=True)
    try:
        origin_rows, distinct_paths = catalog.execute(
            "SELECT count(*), count(DISTINCT path) FROM origin"
        ).fetchone()
    finally:
        catalog.close()
    print(f"          origin rows {origin_rows:,}, distinct paths {distinct_paths:,}")

    print("\n          buckets:")
    for bucket in ("agree", "changed_size", "changed_mtime", "hard_stop", "not_on_disk", "not_hashed"):
        print(f"            {bucket:<14}{totals.get(bucket, 0):>10,}")
    print(f"            {'not in repo':<14}{totals.get('missing', 0):>10,}")
    for bucket, detail in findings[:60]:
        print(f"            {bucket}: {detail[0]}")

    gaps = reconcile_manifest_gaps(config)
    print("\n          manifest gaps:")
    for line in gaps:
        print(f"            {line}")

    if totals.get("hard_stop"):
        print("\n*** HARD STOP. ***")
        return 2
    return 0


def reconcile_manifest_gaps(config: Config) -> list[str]:
    """The 737-row `asset_sources` gap and v1's 356 hash errors, demonstrated.

    Both authorise deleting 1.07 TB later, so each needs an outcome rather than
    a plausible explanation. Read-only against v1's manifest and the catalog.
    """
    lines: list[str] = []
    manifest = open_manifest(config.mediavault_manifest_db)
    catalog = connect(read_only=True)
    try:
        origin_paths = {row[0] for row in catalog.execute("SELECT path FROM origin")}
        source_rows = manifest.execute(
            "SELECT count(*), count(DISTINCT path_text) FROM asset_sources"
        ).fetchone()
        lines.append(
            f"asset_sources: {source_rows[0]:,} rows, {source_rows[1]:,} distinct path_text"
        )
        by_path: dict[str, set] = collections.defaultdict(set)
        for path, asset_id in manifest.execute("SELECT path_text, asset_id FROM asset_sources"):
            by_path[path].add(asset_id)
        multi = {path for path, ids in by_path.items() if len(ids) > 1}
        absent = [path for path in by_path if path not in origin_paths]
        lines.append(
            f"  paths claimed by >1 asset: {len(multi):,}; "
            f"rows beyond distinct paths: {source_rows[0] - source_rows[1]:,}"
        )
        lines.append(f"  asset_sources paths with no origin row: {len(absent):,}")
        for path in sorted(absent)[:10]:
            lines.append(f"    {path}")

        errors = manifest.execute(
            "SELECT path_text FROM source_versions WHERE hash_status = 'error'"
        ).fetchall()
        lines.append(f"v1 hash errors: {len(errors):,} source_versions rows")
        outcomes: collections.Counter = collections.Counter()
        for (path,) in errors:
            outcomes["hashed_this_pass" if path in origin_paths else "not_in_inventory"] += 1
        for outcome, count in outcomes.most_common():
            lines.append(f"  {outcome}: {count:,}")
    except sqlite3.Error as error:
        lines.append(f"manifest query failed: {error}")
    finally:
        manifest.close()
        catalog.close()
    return lines


# --- Phase E: the one write ----------------------------------------------------


def phase_e(config: Config, work: sqlite3.Connection, work_path: Path) -> int:
    print("=== PHASE E: top-up backup ===\n", flush=True)

    # Only Phase D's top-level rows count. Phase B also writes to `subtree`,
    # with state 'sampled' and a deep directory as its key, and a raw
    # `state != 'verified'` count would read those as unfinished work.
    subtrees, _ = top_level_subtrees(work)
    verified = {row[0] for row in work.execute("SELECT name FROM subtree WHERE state = 'verified'")}
    outstanding = [name for name in subtrees if name not in verified]
    if outstanding:
        print(
            f"*** Phase D is not complete: {len(subtrees) - len(outstanding)}/{len(subtrees)} "
            "subtrees verified. Not adding to a repository whose verification is unfinished. ***"
        )
        for name in outstanding:
            print(f"            unverified: {name}")
        return 2

    diff = reconcile_paths(work)
    paths = sorted(
        {row[0] for row in diff["only_disk"]} | {row[0] for row in diff["size_differs"]}
    )
    print(f"E1 top-up {len(paths)} files, derived from this run's own A4 reconciliation:")
    for rel in paths:
        print(f"            {rel}")
    total = sum(row[1] for row in diff["only_disk"]) + sum(
        row[1] for row in diff["size_differs"]
    )
    print(f"          {total:,} bytes\n")
    if not paths:
        print("          nothing to back up.")
        return 0

    listing = work_path.with_name("topup-files.txt")
    listing.write_text(
        "\n".join(str(config.photos_root / rel) for rel in paths) + "\n", encoding="utf-8"
    )
    argv = restic_repo.base_argv(config) + [
        "backup",
        "--files-from-verbatim",
        str(listing),
        "--tag",
        "phase0-topup",
    ]
    print(f"          $ restic backup --files-from-verbatim {listing.name} --tag phase0-topup")
    code = _stream(argv)
    listing.unlink(missing_ok=True)
    if code != 0:
        print(f"\n*** restic backup exited {code}. ***")
        return 2
    print(
        "\n          Two consequences:\n"
        "          1. This repository has now had a SECOND backup pass. `--force` is\n"
        "             MANDATORY for every pass after this one: SPIKE A's stale-blob-list\n"
        "             defect needs two reads of the same file, and until now there was one.\n"
        "          2. G:\\ResticPhotos was uploaded off-site BEFORE this top-up, so the\n"
        f"             remote copy is now stale by these {len(paths)} files. Re-sync the repo\n"
        "             (the new pack, index and snapshot files) or record the divergence."
    )
    return 0


# --- CLI -----------------------------------------------------------------------


def run(phase: str, *, work_db: Path | None = None, snapshot: str = SNAPSHOT, read_data: bool = False) -> int:
    config = load()
    work_path = work_db or config.catalog_db.parent / "phase0.sqlite3"
    work = open_work(work_path)
    print(f"work db   {work_path}\n", flush=True)
    try:
        if phase == "a":
            return phase_a(config, work, snapshot)
        if phase == "b":
            return phase_b(config, work, snapshot)
        if phase == "c":
            return phase_c(config, work)
        if phase == "d":
            return phase_d(config, work, snapshot, read_data=read_data)
        if phase == "e":
            return phase_e(config, work, work_path)
        raise SystemExit(f"unknown phase {phase!r}")
    finally:
        work.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("phase", choices=["a", "b", "c", "d", "e"])
    parser.add_argument("--work-db", type=Path)
    parser.add_argument("--snapshot", default=SNAPSHOT)
    parser.add_argument(
        "--read-data",
        action="store_true",
        help="phase d: run the full --read-data instead of the 1/8 subset",
    )
    args = parser.parse_args()
    sys.exit(run(args.phase, work_db=args.work_db, snapshot=args.snapshot, read_data=args.read_data))
