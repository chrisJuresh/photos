"""Reads the stored Matches as membership: which stack each tile belongs to.

`docs/adr/0003-stack-on-verified-match.md` decides a stack by a verified pairwise
match, fenced by the clock. `photolib.candidates` enumerated the pairs the fence
admits and screened them, `photolib.matches` gave every survivor a Match, and
`harness.calibrate` settled what to do with those counts: **strictness 20 with
"matches most members"**. This module is the reading -- one row per tile saying
which stack it is in, at the setting that decided it.

**Membership is stored rather than derived per query because it is a property of
the photographs and not of the view.** Today `photolib.browse` cuts runs at query
time over whatever the filters select, so narrowing the view splits a stack in
two. Once membership is written a filter can only remove frames from a stack,
which is ADR 0003's load-bearing consequence and what the next ticket delivers.
Nothing on screen changes in this pass: the grid goes on drawing what it draws.

**The walk is the one the labels were replayed against.** `link` and the three
rules under `LINKAGE` live here and `harness.label` imports them, which is the
whole of the argument that ADR 0003's "What the labels settled" describes what the
grid will draw rather than something adjacent to it: the rule is one rule and not
two copies that agree today. They are on this side of the seam because the harness
is deleted when the grid ticket lands and the arrow between them points one way.

**The setting is part of the key and never a column beside it**, the relationship
008's vectors and 010's Matches already have with the model and the method that
produced them: a change of strictness, of linkage or of the window adds a
population rather than overwriting one, so moving one is visible in the table
instead of mixed into it. The window is nonetheless not offered as a flag -- it is
the fence the Match rows were computed behind, and a walk at any other value would
be reading pairs nothing ever checked.

**A pair with no Match row is read as no agreement and never as a match.** That is
`match`'s doing and it is the one place this pass is deliberately less careful than
`photolib.matches`, which keeps "the screen rejected it" and "checked and agreed on
nothing" apart: absent evidence and no agreement come to the same drawing, so a
stack is never invented out of a pair nobody looked at. The pass counts those pairs
and names the frames a *survivor* with no Match row touches, because that one is a
hole rather than a design -- ADR 0003 prices it at 6.0% of the pairs the reader kept
together.

A tile the filesystem dated is in no stack at all, for `photolib.browse`'s reason:
a copy date is not when the photograph was taken, so such a tile can be nobody's
neighbour. A video gets a stack and it is always its own -- nothing fingerprints
one, so nothing verifies one -- and it does not break the run around it, exactly as
an mtime-dated frame does not in `browse.py`.

It reads the catalog on the NVMe and nothing else: no substrate, no `G:`, and not
`state.sqlite3`, which is not even attached. Resumable and idempotent in
`photolib.candidates`' shape: the work already done is one query, a transaction
holds whole runs so an interruption costs at most the run in flight, and a second
run of a complete pass writes nothing and says so. Filling a hole -- a substrate
adopted and `photolib.matches` re-run -- is the one change a re-run does not pick
up, because the resume key is the frame and every frame is already placed; the
report says what to delete when it finds one.
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
import time
from collections.abc import Callable, Container, Sequence
from dataclasses import dataclass

from photolib import candidates, fingerprints, matches
from photolib.config import Config, load

# The reader's strictness: the Match at or above which two frames are the same
# photograph. Settled by the labelling harness and recorded in ADR 0003's "What the
# labels settled" -- 96.0% precision and 34.2% recall over round one's thirty sets,
# confirmed by round two at 96.5% on sets drawn to break the rule below. It is a
# threshold on the Match and never on the fingerprint's cosine, which is
# `photolib.candidates.SCREEN`.
STRICTNESS = 20

# The linkage the same labels settled: "matches most members". ADR 0003 argued from
# complete linkage and its own measurement overruled that -- 224 of the pairs the
# reader kept together carry no Match row at all, and complete linkage cannot
# express a burst holding one, so at 42 frames its named failure is not the lesser
# evil it was accepted as. `neighbour` was measured and rejected rather than feared:
# on round two's chain-crossing sets it scores 88.8% precision against this rule's
# 96.5%.
DEFAULT_LINKAGE = "majority"

PROGRESS_SECONDS = 30


class MembershipRefused(RuntimeError):
    """Raised before anything is stored. Nothing was written."""


# --- the rule ----------------------------------------------------------------

Points = dict[tuple[str, str], int]
# Whether a frame joins the stack in hand: the linkage rule, as a value. `link`
# takes one so that a report can replay the labels against every rule ADR 0003
# left open without a second copy of the walk.
Joins = Callable[[Sequence[str], str, Points, int], bool]


def match(points: Points, a: str, b: str) -> int:
    """The Match between two frames, or zero where there is no row.

    A pair with no row is a pair with no evidence -- the screen rejected it, or a
    substrate it needed was missing. `photolib.matches` is careful to keep those
    two apart from a checked zero and this is not: what a stack rests on is
    evidence that two frames are one picture, and absent evidence and no agreement
    come to the same drawing.

    Either order, because a run's order is the enumeration's order and a caller
    should not have to reproduce it to ask a question about two frames.
    """
    found = points.get((a, b))
    return points.get((b, a), 0) if found is None else found


def complete(holding: Sequence[str], frame: str, points: Points, strictness: int) -> bool:
    """ADR 0003's linkage: a frame joins only if it agrees with all of the stack.

    Named rather than inlined because `harness.calibrate` replays the labels
    against this rule and against the softer ones, and the rule it calls complete
    linkage has to be this one and not a second copy of it.
    """
    return all(match(points, member, frame) >= strictness for member in holding)


def majority(holding: Sequence[str], frame: str, points: Points, strictness: int) -> bool:
    """"Matches most members" -- the softening ADR 0003 left open, and its answer.

    Strictly most, so a frame that agrees with half of a stack does not join it: a
    tie is not most, and precision is the constraint that breaks ties here.
    """
    agreed = sum(1 for member in holding if match(points, member, frame) >= strictness)
    return agreed * 2 > len(holding)


def neighbour(holding: Sequence[str], frame: str, points: Points, strictness: int) -> bool:
    """Single linkage along the run: a frame joins if it agrees with the one before.

    The weakest rule there is, and the one ADR 0003 rejected -- first by argument
    and then on round two's labels, which were drawn where a chain crosses a
    boundary the settled rule drew and found it six points under the precision
    floor.
    """
    return match(points, holding[-1], frame) >= strictness


# The linkage rules as values, in the order a report reads them: the rule ADR 0003
# argued from, the one its labels chose, and the one they rejected.
LINKAGE: dict[str, Joins] = {
    "complete": complete,
    "majority": majority,
    "neighbour": neighbour,
}


def link(
    run: Sequence[str],
    points: Points,
    strictness: int = STRICTNESS,
    joins: Joins = complete,
) -> list[list[str]]:
    """One run cut into stacks, by `joins` at `strictness`.

    The rule is `complete` unless a caller says otherwise, because that is the rule
    ADR 0003 argued from and the one the softenings are read against. Every caller
    that draws or replays a round passes the round's own rule, and this pass passes
    the settled one.

    The walk is forward and greedy whichever rule is in force, which is what
    `photolib.browse` does with the window: a frame the walk consumed early can
    agree with every member of the stack it was placed before, and that split is a
    coin toss the labelling harness scored as one.
    """
    stacks: list[list[str]] = []
    holding: list[str] = []
    for frame in run:
        if holding and joins(holding, frame, points, strictness):
            holding.append(frame)
        else:
            if holding:
                stacks.append(holding)
            holding = [frame]
    if holding:
        stacks.append(holding)
    return stacks


# --- the assignment ----------------------------------------------------------

Placement = list[tuple[str, str]]  # a run's frames, each with the stack it lands in

_POINTS = "SELECT sha_early, sha_late, points FROM pair_match WHERE method = ? AND version = ?"

_ANY_MATCH = "SELECT 1 FROM pair_match WHERE method = ? AND version = ? LIMIT 1"

_PLACED = """
SELECT sha256 FROM stack_member
WHERE method = ? AND version = ? AND strictness = ? AND linkage = ? AND ceiling = ?
"""

_INSERT = """
INSERT OR REPLACE INTO stack_member
  (method, version, strictness, linkage, ceiling, sha256, stack) VALUES (?, ?, ?, ?, ?, ?, ?)
"""

# The survivors with no Match row: the pairs the screen sent to the geometric stage
# that the geometric stage has no answer for. A hole rather than a design --
# `photolib.matches` could not read a substrate, or has not run yet -- which is why
# these are named where the pairs the screen itself rejected are only counted.
_UNCHECKED = """
SELECT sha_early, sha_late FROM candidate_pair AS c
WHERE model = ? AND version = ? AND verdict = 'survivor'
  AND NOT EXISTS (
    SELECT 1 FROM pair_match AS m
    WHERE m.method = ? AND m.version = ? AND m.sha_early = c.sha_early
      AND m.sha_late = c.sha_late
  )
"""


@dataclass(frozen=True)
class Setting:
    """What decided an assignment, which is what it is stored under."""

    strictness: int = STRICTNESS
    linkage: str = DEFAULT_LINKAGE
    ceiling: int = candidates.CEILING
    method: str = matches.METHOD
    version: str = matches.VERSION

    @property
    def joins(self) -> Joins:
        return LINKAGE[self.linkage]

    @property
    def key(self) -> tuple:
        """The columns this setting's rows are keyed under, in the key's order."""
        return (self.method, self.version, self.strictness, self.linkage, self.ceiling)


def points(conn: sqlite3.Connection, setting: Setting) -> Points:
    """Every Match one method has stored, read once.

    `sys.intern` because 566,522 rows name 22,580 frames: without it the same
    sha256 arrives as a fresh 64-character string on every row it appears in, and
    the dictionary costs several times what the Matches do.
    """
    return {
        (sys.intern(early), sys.intern(late)): count
        for early, late, count in conn.execute(_POINTS, (setting.method, setting.version))
    }


def placed(conn: sqlite3.Connection, setting: Setting) -> set[str]:
    """Every frame already assigned at one setting."""
    return {sha256 for (sha256,) in conn.execute(_PLACED, setting.key)}


def place(
    run: Sequence[str], videos: Container[str], stored: Points, setting: Setting
) -> Placement:
    """One run's frames, each with the stack it lands in.

    The walk is over the photographs of the run and the videos are placed alone,
    which is two of ADR 0003's rules at once: a video is not a candidate, so it
    joins nothing, and it does not break the run around it either -- the fence is
    cut over the whole population for exactly that reason, and `browse.py` already
    refuses to let a frame it cannot stack split the burst it sits inside.
    """
    stacks = link(
        [sha256 for sha256 in run if sha256 not in videos],
        stored,
        setting.strictness,
        setting.joins,
    )
    return [(sha256, stack[0]) for stack in stacks for sha256 in stack] + [
        (sha256, sha256) for sha256 in run if sha256 in videos
    ]


@dataclass(frozen=True)
class Unchecked:
    """The candidate pairs carrying no Match row, which are read as no agreement.

    `pairs` is every one of them, which is mostly the screen doing its job -- 84% of
    this catalog's candidates never earned a geometric check. `survivors` is the part
    of that which is a hole instead: the screen said look properly and nothing did.
    Those frames are named for `photolib.candidates.run`'s reason -- the point of
    saying so is that it cannot go quiet -- and they are the ceiling ADR 0003 prices
    at 6.0% of the pairs the reader kept together.
    """

    admitted: int
    pairs: int
    survivors: int
    frames: list[str]


def unchecked(
    conn: sqlite3.Connection, setting: Setting, admitted: int, matched: int
) -> Unchecked:
    """How much of the fence's pair set this walk has no evidence about."""
    absent = conn.execute(
        _UNCHECKED,
        (fingerprints.MODEL, fingerprints.VERSION, setting.method, setting.version),
    ).fetchall()
    return Unchecked(
        admitted=admitted,
        pairs=admitted - matched,
        survivors=len(absent),
        frames=sorted({sha256 for pair in absent for sha256 in pair}),
    )


# --- what is left to do ------------------------------------------------------


@dataclass(frozen=True)
class Work:
    """What one pass has to do, and the facts the report is made of."""

    todo: list[list[str]]  # runs still to place, in capture order
    tiles: int  # EXIF-dated tiles, every one of which gets a stack
    runs: int  # the runs the fence cuts them into, a frame that shot alone included
    videos: int  # of those tiles, the ones nothing verifies: each its own stack
    unchecked: Unchecked


def worklist(conn: sqlite3.Connection, setting: Setting) -> tuple[Work, Points, set[str]]:
    """What this pass owes, with the Matches it will read and the frames to skip.

    A run is the resume unit because a run is what the rule is applied to: one
    transaction holds all of its rows, so a run is either wholly placed or wholly
    absent and the worklist is one query over the frames.
    """
    frames = candidates.population(conn)
    videos = {sha256 for _, _, kind, sha256 in frames if kind == "video"}
    cut = list(candidates.runs(frames, setting.ceiling, alone=True))
    done = placed(conn, setting)
    stored = points(conn, setting)
    return (
        Work(
            todo=[group for group in cut if any(sha256 not in done for sha256 in group)],
            tiles=len(frames),
            runs=len(cut),
            videos=len(videos),
            unchecked=unchecked(
                conn, setting, candidates.count(frames, setting.ceiling), len(stored)
            ),
        ),
        stored,
        videos,
    )


# --- the pass ----------------------------------------------------------------


def place_all(
    conn: sqlite3.Connection,
    todo: Sequence[Sequence[str]],
    videos: Container[str],
    stored: Points,
    setting: Setting,
    *,
    progress_seconds: float = PROGRESS_SECONDS,
) -> dict:
    """Place every run in `todo` and store the assignment. Returns the tally.

    One transaction per run, so an interruption costs the run in flight and
    nothing before it.
    """
    written = 0
    sizes: list[int] = []
    started = announced = time.perf_counter()
    owed = sum(len(group) for group in todo)

    for group in todo:
        rows = place(group, videos, stored, setting)
        counted: dict[str, int] = {}
        for _, stack in rows:
            counted[stack] = counted.get(stack, 0) + 1
        sizes += counted.values()
        written += _store(conn, [(*setting.key, sha256, stack) for sha256, stack in rows])

        now = time.perf_counter()
        if now - announced >= progress_seconds:
            announced = now
            print(
                f"  place    {written:>9,}/{owed:,}  {written / (now - started):,.0f}/s",
                flush=True,
            )

    return {"written": written, "sizes": sizes, "elapsed_s": time.perf_counter() - started}


def _store(conn: sqlite3.Connection, rows: Sequence[tuple]) -> int:
    if not rows:
        return 0
    conn.execute("BEGIN")
    conn.executemany(_INSERT, rows)
    conn.execute("COMMIT")
    return len(rows)


# --- report ------------------------------------------------------------------


def shape(sizes: Sequence[int]) -> str:
    """What this pass drew, in one line: how many stacks, and how big.

    The count of stacks of more than one and the largest, because those are the two
    the grid will be judged on -- a pass that collapsed nothing and a pass that
    collapsed a whole run into one tile both look fine as a total.
    """
    if not sizes:
        return "no stack drawn"
    collapsed = [size for size in sizes if size > 1]
    return (
        f"{len(sizes):,} stacks, {len(collapsed):,} of more than one frame, "
        f"largest {max(sizes):,}, {sum(collapsed):,} tiles collapsed"
    )


def run(
    config: Config | None = None,
    *,
    setting: Setting | None = None,
    limit: int | None = None,
) -> int:
    config = config or load()
    setting = setting or Setting()
    conn = candidates.catalog(config.catalog_db)
    try:
        # The writer refusal is `candidates`' and is borrowed whole rather than
        # restated, but a caller should not have to know that: every way this pass
        # declines to run is one exception type.
        try:
            candidates.refuse_if_busy(conn)
        except candidates.CandidatesRefused as exc:
            raise MembershipRefused(str(exc)) from exc
        # Before the enumeration rather than after it, for `candidates.run`'s
        # reason: there is nothing to read until the Match pass has run, and the
        # refusal should not cost a walk over the catalog first.
        if conn.execute(_ANY_MATCH, (setting.method, setting.version)).fetchone() is None:
            raise MembershipRefused(
                f"no Matches at {setting.method} version {setting.version}: "
                "run python -m photolib.matches first"
            )

        started = time.perf_counter()
        work, stored, videos = worklist(conn, setting)
        print(
            f"method    {setting.method} version {setting.version} "
            f"({time.perf_counter() - started:.1f}s to plan)",
            flush=True,
        )
        print(
            f"setting   strictness {setting.strictness}, {setting.linkage} linkage, "
            f"{setting.ceiling}s ceiling"
        )
        print(f"tiles     {work.tiles:,} EXIF-dated tiles in {work.runs:,} runs")
        print(f"videos    {work.videos:,} of them videos, which nothing verifies")
        print(f"matches   {len(stored):,} Match rows read")
        # Read as no agreement rather than as a match, so that no stack is invented
        # out of a pair nobody looked at. The survivors are the hole and are named.
        print(
            f"unchecked {work.unchecked.pairs:,} of {work.unchecked.admitted:,} pairs the "
            "fence admits carry no Match row and are read as no agreement,"
        )
        print(f"          of which {work.unchecked.survivors:,} survived the screen:")
        for sha256 in work.unchecked.frames:
            print(f"          {sha256}")
        if work.unchecked.frames:
            print(
                "          filling those is not a resume: DELETE FROM stack_member WHERE "
                f"strictness = {setting.strictness} AND linkage = '{setting.linkage}' "
                "and run again"
            )

        todo = work.todo if limit is None else work.todo[:limit]
        print(f"todo      {sum(len(group) for group in todo):,} tiles to place")
        if not todo:
            print("\nnothing to do: every tile already has a stack at this setting")
            return 0

        result = place_all(conn, todo, videos, stored, setting)
        elapsed = max(result["elapsed_s"], 1e-6)
        print(
            f"\nplaced    {result['written']:,} tiles in "
            f"{int(elapsed) // 60}m{int(elapsed) % 60:02d}s, "
            f"{result['written'] / elapsed:,.0f}/s"
        )
        print(f"stacks    {shape(result['sizes'])}")
        return 0
    finally:
        conn.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m photolib.membership", description=__doc__.splitlines()[0]
    )
    parser.add_argument(
        "--strictness",
        type=int,
        default=STRICTNESS,
        help="the Match at or above which two frames are one photograph"
        " (default: %(default)s)",
    )
    parser.add_argument(
        "--linkage",
        choices=tuple(LINKAGE),
        default=DEFAULT_LINKAGE,
        help="how much of a stack a frame has to agree with to join it"
        " (default: %(default)s)",
    )
    parser.add_argument("--limit", type=int, help="place at most this many runs")
    args = parser.parse_args(argv)
    # The ceiling is deliberately not here: it is the fence the Match rows were
    # computed behind, so a walk at another value would read pairs nothing checked.
    return run(
        setting=Setting(strictness=args.strictness, linkage=args.linkage), limit=args.limit
    )


if __name__ == "__main__":
    try:
        sys.exit(main())
    except MembershipRefused as exc:
        sys.exit(f"refused: {exc}")
