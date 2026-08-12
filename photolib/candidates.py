"""Enumerates every pair of frames that could be one stack, and screens each cheaply.

`docs/adr/0003-stack-on-verified-match.md` decides a stack by a verified match
between two frames and keeps the clock only as a fence. This module is that fence
and the cheap half of the verdict: one row per **candidate** -- a pair of frames the
fence admits -- carrying the cosine of the two fingerprints `photolib.fingerprints`
stored and a verdict saying whether the pair is worth looking at properly. Nothing
reads these rows yet and no tile looks different after a pass.

**A candidate is a pair of frames inside one run** -- a run being a stretch of
consecutive captures from one camera whose every gap is at or below the ceiling.
Complete linkage is why it is every pair and not merely the adjacent ones: a stack
is a clique, so a frame owes a verdict against every other member of its run and
not only against its predecessor.

The population is every EXIF-dated tile, per camera, in capture order -- the cut the
grid's own stacking was once a second reading of, and now the only one there is: the
grid draws `photolib.membership`'s rows and no longer looks at the clock at all.
The reader's own filters are deliberately *not* applied:
kind, camera and year narrow a view, and ADR 0003 makes membership a property of the
photographs, so a filter shrinks a stack and never changes who is in it. That is why
a video sits in this population although the grid hides one by default, and why the
count below is over every EXIF-dated tile rather than over a default page's worth.

**The ceiling is 3600s and is a build-time commitment**, not a preference: it decides
how many candidates exist at all. Measured over this catalog there are 3,634,381 of
them at 3600s, against 2,193,828 at 900s and 307,750 at 60s, which is ADR 0003's own
table and the check on this enumeration. `--counts` prints it.

The screen is a cosine between two L2-normalised fingerprints, so it is a dot
product. It is **stored per candidate rather than reduced to a yes-or-no**, because
the fingerprint's own threshold is the thing ADR 0003 left unsettled -- the labels
priced it afterwards, from these rows rather than from another pass, and the ADR's
"What is still deliberately not settled here" is where that landed. It is not the
reader's **strictness**, which `CONTEXT.md` defines as a threshold on the Match and
never on the fingerprint.

A frame with no fingerprint cannot be screened and its pairs get no row. Two
populations arrive here without one, and they are different facts: a **video**, which
nothing fingerprints and which ticket 29 puts out of scope, and a **photograph whose
substrate is missing**, which is a hole in the derivative tree. The first is counted,
the second is named.

It reads the catalog on the NVMe and nothing else -- no substrate, no `G:`, and not
`state.sqlite3`, which is not even attached.

Resumable and idempotent in `photolib.fingerprints`' shape: the work already done is
one query rather than 3.6M probes, a transaction holds whole frames' fan-outs so an
interruption costs at most the batch in flight, and a second run of a finished pass
writes nothing and says so.
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
import time
from collections.abc import Iterable, Iterator, Sequence
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from photolib.config import Config, load
from photolib.fingerprints import MODEL, VERSION, from_blob

CEILING = 3600  # seconds. See the module docstring: a commitment, not a preference.

# Where a tile sits in time, and whether the fence can admit it at all. These lived
# in `photolib.browse` while the grid cut runs at query time and the promise worth
# keeping was that this population agreed with the grid's own SQL; the grid reads
# stored membership now, so the fence is the one place left where the clock decides
# anything and this is where it belongs.
#
# `capture_time` writes whole seconds, so `unixepoch` is exact where the spec's
# `julianday(...) * 86400.0` carries ~2e-5 s of float noise: it reads a gap of
# exactly four seconds as 4.0000185, which is over a window of 4 and would drop the
# commonest bracket interval there is. A tile fails the test two ways -- a date
# `capture_time` guessed from mtime or from a filename, because a copy date is not
# when the photograph was taken, and the '-' sentinel an undated photo sorts on,
# which `unixepoch` returns NULL for.
SECONDS = "unixepoch(p.sort_key)"
STACKABLE = f"substr(f.taken_src, 1, 5) = 'exif:' AND {SECONDS} IS NOT NULL"

# The cosine at or above which a candidate survives the screen and earns a
# geometric check.
#
# Chosen from the whole candidate set, measured: of the 15,759 candidates a second
# or less apart -- overwhelmingly bracket and burst frames, so very largely the same
# picture -- the median cosine is 0.965 and the 1st percentile is 0.535, while the
# 3.6M candidates as a whole sit at a median of 0.145. There is no gap between the
# two populations, only a long overlap, so this is a recall choice and not a
# discovered boundary: **0.40 keeps 99.45% of the candidates a second or less apart
# and rejects 84.4% of the candidate set**, leaving 566,522 survivors for the
# geometric stage. 0.30 keeps 99.64% and leaves 894,016; 0.50 keeps 99.20% and
# leaves 367,526.
#
# It is set loose on purpose. High recall is what the fingerprint is for and the
# precision comes from the stage after it. ADR 0003 left "whether the embedding
# screen can be tightened enough to skip geometry on most pairs" open, and the labels
# answered it against tightening and recommended leaving this value here. Every
# cosine is stored, which is what let that question be a query over these rows rather
# than another pass -- and moving this constant is checked rather than assumed: see
# `refuse_if_rethresholded`.
SCREEN = 0.40

BATCH = 100_000  # pairs per transaction, rounded up to a whole fan-out
PROGRESS_SECONDS = 30


class CandidatesRefused(RuntimeError):
    """Raised before anything is stored. Nothing was written."""


# --- the population ----------------------------------------------------------

# Every tile the fence could admit, in the order a run is read in. DISTINCT for
# `fingerprints.photograph_shas`' reason -- nothing in the schema stops two tiles
# naming one frame -- so a frame recorded twice at one instant is read once rather
# than compared with itself.
#
# The order is (camera, sort_key, sha256) rather than (camera, sort_key, id), which
# is what the grid's own grouping used while it had one. Both cut runs in the same
# places -- two captures sharing a second have a gap of zero however they are
# ordered, and the gap to the frame outside the tie depends on the timestamps and not
# on the order within it -- but sha256 is decided by the bytes, so
# `archive.pipeline.group` reassigning every id cannot flip which of two frames this
# pass calls the earlier one, and it is why a stack is named by a sha256.
_POPULATION = f"""
SELECT DISTINCT f.camera, {SECONDS} AS secs, f.kind, p.rep_sha256
FROM photo AS p
JOIN file AS f ON f.sha256 = p.rep_sha256
WHERE {STACKABLE}
ORDER BY f.camera, p.sort_key, p.rep_sha256
"""

_FINGERPRINTS = "SELECT sha256, vector FROM fingerprint WHERE model = ? AND version = ?"

_ANY_FINGERPRINT = "SELECT 1 FROM fingerprint WHERE model = ? AND version = ? LIMIT 1"

# The name and the tally, because a frame is done when it carries every pair it is
# owed rather than merely some.
_SCREENED = """
SELECT sha_early, count(*) FROM candidate_pair
WHERE model = ? AND version = ? GROUP BY sha_early
"""

_RETHRESHOLDED = """
SELECT count(*) FROM candidate_pair
WHERE model = ? AND version = ? AND (screen >= ?) IS NOT (verdict = 'survivor')
"""

_INSERT = """
INSERT OR REPLACE INTO candidate_pair
  (model, version, sha_early, sha_late, screen, verdict) VALUES (?, ?, ?, ?, ?, ?)
"""

# `kind` is nullable in the schema, and the criterion is "not a video" rather than
# "is an image" -- `fingerprints` embeds a NULL-kind tile and so this screens one.
Frame = tuple[str | None, int, str | None, str]  # camera, seconds, kind, sha256
Fanout = tuple[str, list[str]]  # one frame, and every later frame it may pair with


def population(conn: sqlite3.Connection) -> list[Frame]:
    """Every EXIF-dated tile the fence could admit, in the order runs are cut in."""
    return conn.execute(_POPULATION).fetchall()


def runs(
    frames: Iterable[Frame], ceiling: int = CEILING, *, alone: bool = False
) -> Iterator[list[str]]:
    """The population cut into maximal runs, dropping runs of one.

    `None == None` here is deliberate: two frames from a body that recorded no name
    are still consecutive captures from one camera as far as this fence can tell.

    A run of one is dropped because it holds no pair, and `alone` keeps it because
    `photolib.membership` needs the other reading of the same cut: every tile gets a
    stack, and a frame that shot on its own is a stack of one.
    """
    least = 1 if alone else 2
    run: list[str] = []
    camera_before: str | None = None
    secs_before = 0
    for camera, secs, _kind, sha256 in frames:
        if run and camera == camera_before and secs - secs_before <= ceiling:
            run.append(sha256)
        else:
            if len(run) >= least:
                yield run
            run = [sha256]
        camera_before, secs_before = camera, secs
    if len(run) >= least:
        yield run


def fanouts(frames: Iterable[Frame], ceiling: int = CEILING) -> Iterator[Fanout]:
    """Each frame with every later frame of its run -- the enumeration unit.

    A frame's fan-out is also the resume unit: a transaction holds whole fan-outs,
    so a frame's tally in the table is either all of the pairs it heads or none.
    """
    for run in runs(frames, ceiling):
        for index, early in enumerate(run):
            if index + 1 < len(run):
                yield early, run[index + 1 :]


def count(frames: Iterable[Frame], ceiling: int = CEILING) -> int:
    """How many candidates the fence admits. ADR 0003's table is the check."""
    return sum(len(run) * (len(run) - 1) // 2 for run in runs(frames, ceiling))


# --- the fingerprints the screen reads ---------------------------------------


@dataclass(frozen=True)
class Vectors:
    """Every stored fingerprint as one matrix, and where each frame sits in it.

    A matrix rather than a vector each, because a frame's whole fan-out is screened
    as one product. 24k x 384 float32 is 37 MB, so the whole library fits.
    """

    row: dict[str, int]
    matrix: np.ndarray

    def __contains__(self, sha256: str) -> bool:
        return sha256 in self.row

    def __len__(self) -> int:
        return len(self.row)

    def cosines(self, early: str, later: Sequence[str]) -> np.ndarray:
        """One frame against every frame of its fan-out, as one product.

        `fingerprints` L2-normalises on the way in, so the cosine the screen wants
        is a dot product and nothing here has to normalise.
        """
        return self.matrix[[self.row[sha256] for sha256 in later]] @ self.matrix[self.row[early]]


def vectors(
    conn: sqlite3.Connection, *, model: str = MODEL, version: str = VERSION
) -> Vectors:
    """Every fingerprint one model has stored, read once."""
    rows = conn.execute(_FINGERPRINTS, (model, version)).fetchall()
    return Vectors(
        row={sha256: n for n, (sha256, _) in enumerate(rows)},
        matrix=(
            np.stack([from_blob(blob) for _, blob in rows])
            if rows
            else np.zeros((0, 0), dtype=np.float32)
        ),
    )


def screened(
    conn: sqlite3.Connection, *, model: str = MODEL, version: str = VERSION
) -> dict[str, int]:
    """Every frame whose fan-out is written, and how many pairs it carries.

    The tally and not merely the name, because a frame is done when it carries every
    pair it is owed. A partner that gains a fingerprint later -- a substrate filled
    in and `photolib.fingerprints` re-run -- adds a pair to a fan-out already
    written, and a worklist keyed on the name alone would never come back for it.
    """
    return dict(conn.execute(_SCREENED, (model, version)))


# --- what is left to do ------------------------------------------------------


@dataclass(frozen=True)
class Work:
    """What one pass has to do, and the facts the report is made of."""

    todo: list[Fanout]  # fan-outs still to write, in enumeration order
    tiles: int  # EXIF-dated tiles the fence could admit
    candidates: int  # pairs the fence admits -- ADR 0003's number
    screenable: int  # of those, the pairs with a fingerprint on both sides
    videos: int  # EXIF-dated video tiles, which nothing fingerprints
    unvectored: list[str]  # photographs with no fingerprint: a hole, so named


def worklist(
    conn: sqlite3.Connection,
    *,
    ceiling: int = CEILING,
    model: str = MODEL,
    version: str = VERSION,
) -> tuple[Work, Vectors]:
    """What this pass owes, with the fingerprints it will screen from.

    Runs are cut over the whole population rather than over the screenable part of
    it, which is what keeps a stack contiguous in capture order: a video sitting
    inside a burst neither joins a pair nor breaks the run around it, and neither
    does a frame the filesystem dated.
    """
    frames = population(conn)
    stored = vectors(conn, model=model, version=version)
    done = screened(conn, model=model, version=version)

    # Screenability is decided by the fingerprints alone. These two are what the
    # report says about the frames it finds none for: a video, which
    # `photolib.fingerprints` embeds none of, and a photograph whose vector is
    # missing, which is a hole and so is named rather than counted.
    videos = sum(1 for _, _, kind, _ in frames if kind == "video")
    unvectored = [
        sha256 for _, _, kind, sha256 in frames if sha256 not in stored and kind != "video"
    ]

    screenable = 0
    todo: list[Fanout] = []
    for early, later in fanouts(frames, ceiling):
        if early not in stored:
            continue
        partners = [sha256 for sha256 in later if sha256 in stored]
        screenable += len(partners)
        if partners and done.get(early, 0) < len(partners):
            todo.append((early, partners))

    work = Work(
        todo=todo,
        tiles=len(frames),
        candidates=count(frames, ceiling),
        screenable=screenable,
        videos=videos,
        unvectored=unvectored,
    )
    return work, stored


# --- the pass ----------------------------------------------------------------


def screen_all(
    conn: sqlite3.Connection,
    todo: Sequence[Fanout],
    stored: Vectors,
    *,
    model: str = MODEL,
    version: str = VERSION,
    threshold: float = SCREEN,
    batch: int = BATCH,
    progress_seconds: float = PROGRESS_SECONDS,
) -> dict:
    """Screen and store every pair in `todo`. Returns the tally and the timing.

    One transaction per batch of pairs, ending on a fan-out boundary, so an
    interruption costs the batch in flight and nothing before it.
    """
    written = survivors = 0
    rows: list[tuple] = []
    started = announced = time.perf_counter()
    owed = sum(len(later) for _, later in todo)

    for early, later in todo:
        cosines = stored.cosines(early, later)
        survivors += int((cosines >= threshold).sum())
        rows += [
            (
                model,
                version,
                early,
                late,
                float(cosine),
                "survivor" if cosine >= threshold else "screened_out",
            )
            for late, cosine in zip(later, cosines)
        ]
        if len(rows) >= max(batch, 1):
            written += _store(conn, rows)
            rows = []
            now = time.perf_counter()
            if now - announced >= progress_seconds:
                announced = now
                print(
                    f"  screen   {written:>9,}/{owed:,}  {written / (now - started):,.0f}/s",
                    flush=True,
                )
    if rows:
        written += _store(conn, rows)

    return {
        "written": written,
        "survivors": survivors,
        "elapsed_s": time.perf_counter() - started,
    }


def _store(conn: sqlite3.Connection, rows: Sequence[tuple]) -> int:
    conn.execute("BEGIN")
    conn.executemany(_INSERT, rows)
    conn.execute("COMMIT")
    return len(rows)


# --- the catalog, alone ------------------------------------------------------


def catalog(catalog_db: Path, *, read_only: bool = False) -> sqlite3.Connection:
    """A connection to the catalog and to nothing else.

    Deliberately not `photolib.db.connect`, for two reasons that point the same way.
    `state.sqlite3` holds irreplaceable triage decisions and this pass has no
    business reaching them, so the safest thing is that there be no name for them.
    And `BEGIN IMMEDIATE` takes the write lock on every attached database, so with
    state attached the refusal below would fire while the grid was saving a reject
    -- a triage write is not a writer holding the catalog.

    `timeout=0`, so a writer that does hold it is a refusal rather than a wait.
    """
    if read_only:
        return sqlite3.connect(f"{catalog_db.as_uri()}?mode=ro", uri=True, timeout=0)
    conn = sqlite3.connect(catalog_db, isolation_level=None, timeout=0)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def refuse_if_busy(conn: sqlite3.Connection) -> None:
    """Take the catalog's write lock and hand it straight back, or refuse.

    Invariant 6: exclusive maintenance does not run alongside a writer. It is a
    probe and not a hold -- the pass commits per batch afterwards, which is what
    makes it resumable, and holding the lock for the whole run would mean one
    transaction over 3.6M rows. So a writer that arrives *during* a pass surfaces
    as `sqlite3.OperationalError` from the batch it collides with rather than as
    this refusal, and the pass resumes where it reached. `photolib.migrate` can
    hold its lock throughout because a migration is seconds long and atomic.
    """
    try:
        conn.execute("BEGIN IMMEDIATE")
    except sqlite3.OperationalError as exc:
        raise CandidatesRefused(f"another writer holds the catalog: {exc}") from exc
    conn.execute("COMMIT")


def refuse_if_rethresholded(
    conn: sqlite3.Connection,
    threshold: float = SCREEN,
    *,
    model: str = MODEL,
    version: str = VERSION,
) -> None:
    """Refuse when the stored verdicts were decided at a different screen.

    `verdict` is this pass's record of what it decided and `screen` is the evidence
    it decided from, so the two can disagree exactly one way: `SCREEN` was moved
    after rows were written. A re-run would not repair them -- the resume key is the
    frame, and every frame is already done -- so without this check the table would
    go on answering at the old threshold for ever. Which is the one way a stored
    derived value goes quietly wrong, and the reason it is checked rather than
    trusted.
    """
    stale = conn.execute(_RETHRESHOLDED, (model, version, threshold)).fetchone()[0]
    if stale:
        raise CandidatesRefused(
            f"{stale:,} pairs carry a verdict decided at a screen other than {threshold}: "
            f"DELETE FROM candidate_pair WHERE model = '{model}' AND version = '{version}' "
            "and run again"
        )


# --- report ------------------------------------------------------------------

BOUNDS = (60, 300, 900, 3600)  # ADR 0003's table, the check on the enumeration


def counts(config: Config | None = None, bounds: Sequence[int] = BOUNDS) -> int:
    """Print how many candidates each bound admits, and write nothing.

    ADR 0003's table made runnable: 308k at 60s, 1.26M at 300s, 2.19M at 900s and
    3.63M at 3600s. A count that misses those is a bug in the enumeration.
    """
    config = config or load()
    conn = catalog(config.catalog_db, read_only=True)
    try:
        frames = population(conn)
    finally:
        conn.close()
    print(f"tiles     {len(frames):,} EXIF-dated tiles the fence could admit")
    for ceiling in bounds:
        print(f"{ceiling:>5}s    {count(frames, ceiling):>12,} candidates")
    return 0


def run(config: Config | None = None, *, limit: int | None = None) -> int:
    config = config or load()
    conn = catalog(config.catalog_db)
    try:
        refuse_if_busy(conn)
        # Both before the enumeration rather than after it: there is nothing to
        # screen with until the vectors exist, and neither refusal should cost a
        # walk over 3.6M pairs first.
        if conn.execute(_ANY_FINGERPRINT, (MODEL, VERSION)).fetchone() is None:
            raise CandidatesRefused(
                f"no fingerprints at {MODEL} version {VERSION}: "
                "run python -m photolib.fingerprints first"
            )
        refuse_if_rethresholded(conn)

        started = time.perf_counter()
        work, stored = worklist(conn)
        print(
            f"model     {MODEL} version {VERSION}, screen at {SCREEN} "
            f"({time.perf_counter() - started:.1f}s to plan)",
            flush=True,
        )
        print(f"window    {CEILING}s ceiling")
        print(f"tiles     {work.tiles:,} EXIF-dated tiles the fence could admit")
        print(f"pairs     {work.candidates:,} candidates, {work.screenable:,} screenable")
        print(f"videos    {work.videos:,} EXIF-dated video tiles, which nothing fingerprints")
        # Named rather than counted, and every one of them: a photograph with no
        # fingerprint is a hole in the derivative tree, and the whole point of
        # saying so is that it cannot go quiet.
        print(f"orphans   {len(work.unvectored):,} photographs with no fingerprint:")
        for sha256 in work.unvectored:
            print(f"          {sha256}")

        todo = work.todo if limit is None else work.todo[:limit]
        print(f"todo      {sum(len(later) for _, later in todo):,} pairs to screen")
        if not todo:
            print("\nnothing to do: every candidate already carries a screen")
            return 0

        result = screen_all(conn, todo, stored)
        elapsed = max(result["elapsed_s"], 1e-6)
        print(
            f"\nstored    {result['written']:,} pairs in "
            f"{int(elapsed) // 60}m{int(elapsed) % 60:02d}s, "
            f"{result['written'] / elapsed:,.0f}/s"
        )
        survivors = result["survivors"]
        share = survivors / result["written"] if result["written"] else 0.0
        print(f"survivors {survivors:,} ({share:.1%}), the rest screened out")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--counts",
        action="store_true",
        help="print how many candidates each of ADR 0003's bounds admits, and write nothing",
    )
    parser.add_argument("--limit", type=int, help="screen at most this many frames' fan-outs")
    args = parser.parse_args()
    try:
        sys.exit(counts() if args.counts else run(limit=args.limit))
    except CandidatesRefused as exc:
        sys.exit(f"refused: {exc}")
