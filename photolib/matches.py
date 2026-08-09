"""Verifies the candidates the screen let through, and gives each one a Match.

`docs/adr/0003-stack-on-verified-match.md` decides a stack by a verified match
between two frames. `photolib.candidates` enumerated the pairs and screened them
cheaply; this module is the check that screening defends. For every survivor it
matches distinctive points between the two frames, fits them to a single
transform, and stores **the count of points that agree** -- the Match. Nothing
reads these counts yet and no tile looks different after a pass.

Geometry is the primary evidence because the operator's binding constraint is
precision -- never open a stack and see two unrelated photographs -- and "forty-one
points agree on one transform" is a harder claim than a cosine over a threshold.

**`match(frame_a, frame_b)` is the seam**, and it takes two images rather than two
sha256s, which is what makes the number testable over images built in a test file
rather than over photographs. It has to survive the two habits this library is
made of: an exposure bracket changes brightness and clipping while the geometry
stays put, and a handheld reposition moves the geometry a little while the subject
stays the same. Both keep a high Match; turning the camera to face something else
does not. `tests/test_matches.py` is where each of those is asserted.

The detector is SIFT from the installed OpenCV, capped at `KEYPOINTS` points per
frame, matched nearest-against-second-nearest with Lowe's ratio and fitted with
RANSAC to a homography. A homography rather than something looser because a
handheld reposition of a few centimetres is very nearly a rotation about the
camera's own centre, and a transform that explains more explains unrelated frames
too. Its named failure is a bracket end blown out past having any texture left,
which yields no keypoints and so a Match of zero; ADR 0003 accepts that as the
lesser evil -- one true stack drawn as two -- and learned local features are the
escalation if the fixture shows it happening often.

Frames are read at `SIDE` on the long edge rather than at the substrate's own
1536, which is where the pass's time goes: detection is a little over a hundred
milliseconds a frame at this size and the pairwise match is one.

The pass reads `substrate_root` and the catalog, both on the NVMe. **It never
opens a path under `G:`**, and it does not attach `state.sqlite3` -- see
`photolib.candidates.catalog` for why that is a deliberate absence rather than an
oversight.

Resumable and idempotent in `photolib.candidates`' shape: the work already done is
one query rather than half a million probes, a transaction holds whole frames'
fan-outs so an interruption costs at most the chunk in flight, a screened-out pair
is never re-checked because it is never selected, and a second run of a finished
pass writes nothing and says so.
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
import time
from collections import OrderedDict
from collections.abc import Iterator, Sequence
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

from photolib import candidates, fingerprints
from photolib.config import Config, load, substrate_path
from photolib.substrates import present

METHOD = "sift_ratio_homography"
VERSION = "1"

SIDE = 1024  # the long edge a substrate is read at. See the module docstring.
KEYPOINTS = 800  # per frame. Measured: 111 ms a frame to decode and describe.
RATIO = 0.75  # Lowe's, on nearest against second-nearest descriptor distance
REPROJECTION = 3.0  # px at SIDE, the RANSAC inlier bound
NEEDED = 4  # points a homography is fitted from, so the floor on a Match

# How many distinct frames one chunk may describe before it is committed, and how
# many descriptions are kept afterwards. Fan-outs are walked in capture order, so
# a chunk's frames are its neighbours in the run and the next chunk's are mostly
# the same ones -- which is the whole reason the order is capture and not sha256.
# At KEYPOINTS points a description is 400 KB, so these two bound the pass at
# about 230 MB.
FRAMES = 192
CACHE = 384
WORKERS = 12  # OpenCV and Pillow both drop the GIL, so these are real threads
PROGRESS_SECONDS = 30


class MatchesRefused(RuntimeError):
    """Raised before anything is stored. Nothing was written."""


# --- the seam ----------------------------------------------------------------


@dataclass(frozen=True)
class Features:
    """One frame's distinctive points, and what each of them looks like."""

    points: np.ndarray  # (N, 2) float32, in pixels
    descriptors: np.ndarray | None  # (N, 128) float32, None when there are none

    def __len__(self) -> int:
        return len(self.points)


def features(frame: np.ndarray) -> Features:
    """The distinctive points of one image, described.

    Grayscale because SIFT is: colour would be thrown away inside the detector
    anyway, and an exposure bracket moves colour more than it moves structure.
    """
    gray = frame if frame.ndim == 2 else cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
    found, descriptors = cv2.SIFT_create(nfeatures=KEYPOINTS).detectAndCompute(gray, None)
    return Features(
        points=np.array([point.pt for point in found], dtype=np.float32).reshape(-1, 2),
        descriptors=descriptors,
    )


def agree(a: Features, b: Features) -> int:
    """How many of two frames' points agree on one transform. The Match.

    Two filters, and they reject different things. Lowe's ratio drops a point
    whose best partner is barely better than its second best, which is what a
    repeated texture -- railings, foliage, brickwork -- produces in quantity. The
    homography then drops whatever survives that but does not move the way the
    rest of the frame moved. What is left is the count.
    """
    if a.descriptors is None or b.descriptors is None:
        return 0
    if len(a) < NEEDED or len(b) < NEEDED:
        return 0

    nearest = cv2.BFMatcher(cv2.NORM_L2).knnMatch(a.descriptors, b.descriptors, k=2)
    kept = [
        best
        for best, second in (pair for pair in nearest if len(pair) == 2)
        if best.distance < RATIO * second.distance
    ]
    if len(kept) < NEEDED:
        return 0

    _, inliers = cv2.findHomography(
        a.points[[point.queryIdx for point in kept]],
        b.points[[point.trainIdx for point in kept]],
        cv2.RANSAC,
        REPROJECTION,
    )
    return 0 if inliers is None else int(inliers.sum())


def match(frame_a: np.ndarray, frame_b: np.ndarray) -> int:
    """The Match between two images: the count of points agreeing on a transform."""
    return agree(features(frame_a), features(frame_b))


def read(path: Path) -> np.ndarray:
    """One substrate as the detector wants it: grayscale, long edge `SIDE`.

    `thumbnail` only ever shrinks, so a substrate smaller than `SIDE` is read at
    its own size rather than enlarged into detail it does not have.
    """
    with Image.open(path) as image:
        frame = image.convert("L")
        frame.thumbnail((SIDE, SIDE), Image.BICUBIC)
        return np.asarray(frame)


def _describe(path: Path) -> tuple[Features | None, str | None]:
    """`read` and `features`, as `(description, reason it would not decode)`.

    One of the two is always None. This is the boundary the filesystem is read
    across, and a substrate that will not decode has to be survivable rather than
    fatal for `photolib.fingerprints._decode`'s reason: resuming re-reaches the
    same file and fails again.
    """
    try:
        return features(read(path)), None
    except (OSError, ValueError) as exc:
        return None, str(exc)


# --- what is left to do ------------------------------------------------------

Fanout = tuple[str, list[str]]  # one frame, and every later frame it owes a Match

_SURVIVORS = """
SELECT sha_early, sha_late FROM candidate_pair
WHERE model = ? AND version = ? AND verdict = 'survivor'
"""

_ANY_CANDIDATE = "SELECT 1 FROM candidate_pair WHERE model = ? AND version = ? LIMIT 1"

# The name and the tally, for `candidates.screened`'s reason: a frame is done when
# it carries every Match it is owed rather than merely some.
_MATCHED = """
SELECT sha_early, count(*) FROM pair_match
WHERE method = ? AND version = ? GROUP BY sha_early
"""

_INSERT = """
INSERT OR REPLACE INTO pair_match (method, version, sha_early, sha_late, points)
VALUES (?, ?, ?, ?, ?)
"""


def matched(
    conn: sqlite3.Connection, *, method: str = METHOD, version: str = VERSION
) -> dict[str, int]:
    """Every frame whose fan-out is checked, and how many Matches it carries."""
    return dict(conn.execute(_MATCHED, (method, version)))


@dataclass(frozen=True)
class Work:
    """What one pass has to do, and the facts the report is made of."""

    todo: list[Fanout]  # fan-outs still to check, in capture order
    survivors: int  # pairs the screen let through
    checkable: int  # of those, the pairs with a substrate on both sides
    substrateless: list[str]  # frames in a survivor pair with no substrate: named


def worklist(
    conn: sqlite3.Connection,
    substrate_root: Path,
    *,
    model: str = fingerprints.MODEL,
    screen_version: str = fingerprints.VERSION,
    method: str = METHOD,
    version: str = VERSION,
) -> Work:
    """What this pass owes, in the order that makes describing a frame worth it.

    Fan-outs come back in capture order and not in sha256 order, which is the
    difference between describing a frame once and describing it once per pair:
    a survivor pair is always inside one run of consecutive captures, so walking
    the runs in the order they were shot keeps a frame's partners together.
    """
    order = {sha256: n for n, (_, _, _, sha256) in enumerate(candidates.population(conn))}
    on_disk = present(substrate_root)
    done = matched(conn, method=method, version=version)

    fanout: dict[str, list[str]] = {}
    survivors = 0
    wanted: set[str] = set()
    for early, late in conn.execute(_SURVIVORS, (model, screen_version)):
        survivors += 1
        wanted.update((early, late))
        if early in on_disk and late in on_disk:
            fanout.setdefault(early, []).append(late)

    def shot(sha256: str) -> int:
        return order.get(sha256, len(order))

    return Work(
        todo=[
            (early, sorted(later, key=shot))
            for early, later in sorted(fanout.items(), key=lambda item: shot(item[0]))
            if done.get(early, 0) < len(later)
        ],
        survivors=survivors,
        checkable=sum(len(later) for later in fanout.values()),
        substrateless=sorted(sha256 for sha256 in wanted if sha256 not in on_disk),
    )


# --- the pass ----------------------------------------------------------------


def chunks(todo: Sequence[Fanout], frames: int = FRAMES) -> Iterator[list[Fanout]]:
    """Fan-outs grouped into as much work as `frames` descriptions will cover.

    Bounded by frames rather than by pairs because a description is what costs
    memory, and always at least one fan-out, so a run longer than the bound is
    still checked rather than skipped.
    """
    chunk: list[Fanout] = []
    seen: set[str] = set()
    for early, later in todo:
        if chunk and len(seen | {early, *later}) > max(frames, 1):
            yield chunk
            chunk, seen = [], set()
        chunk.append((early, later))
        seen |= {early, *later}
    if chunk:
        yield chunk


def check_all(
    conn: sqlite3.Connection,
    todo: Sequence[Fanout],
    substrate_root: Path,
    *,
    method: str = METHOD,
    version: str = VERSION,
    frames: int = FRAMES,
    cache: int = CACHE,
    workers: int = WORKERS,
    progress_seconds: float = PROGRESS_SECONDS,
) -> dict:
    """Match every pair in `todo` and store the counts. Returns the tally.

    One transaction per chunk, ending on a fan-out boundary, so an interruption
    costs the chunk in flight and nothing before it. Each chunk describes the
    frames it needs and has not kept, then matches its pairs; both halves are run
    on a pool because OpenCV holds no lock either of them has to wait on.
    """
    described: OrderedDict[str, Features | None] = OrderedDict()
    unreadable: dict[str, str] = {}
    counts: list[int] = []
    written = 0
    started = announced = time.perf_counter()
    owed = sum(len(later) for _, later in todo)

    with ThreadPoolExecutor(max(workers, 1)) as pool:
        for chunk in chunks(todo, frames):
            wanted = {sha256 for early, later in chunk for sha256 in (early, *later)}
            fresh = [sha256 for sha256 in wanted if sha256 not in described]
            paths = [substrate_path(substrate_root, sha256) for sha256 in fresh]
            for sha256, (feature, reason) in zip(fresh, pool.map(_describe, paths)):
                described[sha256] = feature
                if reason is not None:
                    unreadable[sha256] = reason
            for sha256 in wanted:
                described.move_to_end(sha256)

            # A pair touching a substrate that would not decode gets no row: a
            # Match of zero means checked and disagreed, and this pair was not
            # checked. It stays in the worklist and is reported every run.
            pairs = [
                (early, late)
                for early, later in chunk
                for late in later
                if described[early] is not None and described[late] is not None
            ]
            points = list(
                pool.map(lambda pair: agree(described[pair[0]], described[pair[1]]), pairs)
            )
            counts += points
            written += _store(
                conn,
                [
                    (method, version, early, late, count)
                    for (early, late), count in zip(pairs, points)
                ],
            )

            while len(described) > max(cache, len(wanted)):
                described.popitem(last=False)

            now = time.perf_counter()
            if now - announced >= progress_seconds:
                announced = now
                print(
                    f"  match    {written:>9,}/{owed:,}  {written / (now - started):,.0f}/s",
                    flush=True,
                )

    return {
        "written": written,
        "points": counts,
        "unreadable": sorted(unreadable.items()),
        "elapsed_s": time.perf_counter() - started,
    }


def _store(conn: sqlite3.Connection, rows: Sequence[tuple]) -> int:
    if not rows:
        return 0
    conn.execute("BEGIN")
    conn.executemany(_INSERT, rows)
    conn.execute("COMMIT")
    return len(rows)


# --- report ------------------------------------------------------------------


def run(config: Config | None = None, *, limit: int | None = None) -> int:
    config = config or load()
    if not config.substrate_root.is_dir():
        raise MatchesRefused(f"substrate tree not found: {config.substrate_root}")

    conn = candidates.catalog(config.catalog_db)
    try:
        candidates.refuse_if_busy(conn)
        # Before the enumeration rather than after it, for `candidates.run`'s
        # reason: there is nothing to verify until the screen has run, and the
        # refusal should not cost a walk over the catalog first.
        screen = (fingerprints.MODEL, fingerprints.VERSION)
        if conn.execute(_ANY_CANDIDATE, screen).fetchone() is None:
            raise MatchesRefused(
                f"no candidate pairs at {screen[0]} version {screen[1]}: "
                "run python -m photolib.candidates first"
            )

        started = time.perf_counter()
        work = worklist(conn, config.substrate_root)
        print(
            f"method    {METHOD} version {VERSION}, {SIDE}px long edge, "
            f"up to {KEYPOINTS} points ({time.perf_counter() - started:.1f}s to plan)",
            flush=True,
        )
        print(f"substrate {config.substrate_root}")
        print(f"screen    {screen[0]} version {screen[1]}")
        print(f"pairs     {work.survivors:,} survivors, {work.checkable:,} checkable")
        # Named rather than counted, and every one of them, for
        # `candidates.run`'s reason: a survivor whose substrate is missing is a
        # hole in the derivative tree and the point of saying so is that it
        # cannot go quiet.
        print(f"holes     {len(work.substrateless):,} survivor frames with no substrate:")
        for sha256 in work.substrateless:
            print(f"          {sha256}")

        todo = work.todo if limit is None else work.todo[:limit]
        print(f"todo      {sum(len(later) for _, later in todo):,} pairs to check")
        if not todo:
            print("\nnothing to do: every survivor already carries a Match")
            return 0

        result = check_all(conn, todo, config.substrate_root)
        elapsed = max(result["elapsed_s"], 1e-6)
        print(
            f"\nstored    {result['written']:,} matches in "
            f"{int(elapsed) // 60}m{int(elapsed) % 60:02d}s, "
            f"{result['written'] / elapsed:,.0f}/s"
        )
        print(f"points    {_distribution(result['points'])}")
        print(f"corrupt   {len(result['unreadable']):,} substrates that would not decode")
        for sha256, reason in result["unreadable"]:
            print(f"          {sha256}  {reason}")
        return 0 if not result["unreadable"] else 1
    finally:
        conn.close()


def _distribution(points: Sequence[int]) -> str:
    """The shape of what this pass wrote, in one line.

    The quartiles and the floor, because the question the next ticket opens with
    is where a threshold on the Match would sit, and a median alone cannot say
    whether the survivors are two populations or one.
    """
    if not points:
        return "no pairs checked"
    quartiles = np.percentile(np.asarray(points), (25, 50, 75)).astype(int)
    zero = sum(1 for count in points if count == 0)
    return (
        f"median {quartiles[1]:,}, quartiles {quartiles[0]:,}/{quartiles[2]:,}, "
        f"{zero:,} pairs agreeing on none"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--limit", type=int, help="check at most this many frames' fan-outs")
    args = parser.parse_args()
    try:
        sys.exit(run(limit=args.limit))
    except MatchesRefused as exc:
        sys.exit(f"refused: {exc}")
