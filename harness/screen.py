"""What a looser fingerprint screen would buy, and what it would cost.

`docs/adr/0003-stack-on-verified-match.md` left "whether the embedding screen can
be tightened enough to skip geometry on most pairs" open, and the labels answered
the opposite question: at 0.40 the screen already costs a share of the pairs the
reader kept together, and that is a floor on recall no strictness lifts and no
linkage routes around. This module prices the change worth measuring -- loosening
it -- and prices it rather than performing it.

**A measurement and never a pass.** It reads the catalog and `labels.sqlite3`,
both on the NVMe, opens no substrate and never touches `G:`; the triage state has
no name here at all, and both connections are opened read-only, so writing
nothing is a fact about the code rather than a promise. Re-running
`photolib.matches` at a looser screen is the operator's decision, made afterwards
and with this table in hand.

    python -m harness.screen

**Every question is answered from the stored cosine and never from the stored
verdict.** `candidate_pair.verdict` is `screen >= 0.40` frozen at the moment the
pass ran, and `photolib.candidates.refuse_if_rethresholded` is what stops it going
quietly stale. So this module borrows that refusal whole -- pricing a move away
from 0.40 means nothing if the rows on the disk were decided somewhere else -- and
reads `screen` for everything else. Nothing here moves `SCREEN`, and a sweep that
read the verdict would answer at 0.40 while appearing to sweep.

**Why a kept pair carries no Match row is split, because the fixes differ.** The
screen rejecting a pair is a screen question and the only one a looser value
answers. A pair that survived the screen and still carries no Match is a hole in
the derivative tree -- `photolib.matches` skips a pair whose substrate it cannot
read and leaves no row rather than a zero -- and so is a pair whose frame was
never fingerprinted, which is the same hole one stage earlier. A pair holding a
video is neither: nothing fingerprints one and ticket 29 puts it out of scope.

The cost of the pass a looser screen would ask for is **estimated from the rates
already measured** and not by running anything. Both are the figures CLAUDE.md
records for the pass as it ran, so both include the per-frame decode a pass pays
whether it matches one pair off a frame or twenty; loosening the screen mostly
adds pairs to frames already being described, so the time is an upper bound.

It goes with the rest of `harness/` when the grid ticket lands. Its output is
ADR 0003's "What is still deliberately not settled here", which a person writes
down.
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from pathlib import Path

from harness import calibrate, label
from photolib import candidates, matches
from photolib.candidates import SCREEN
from photolib.config import load
from photolib.fingerprints import MODEL, VERSION

# The screen values a run prices. Loose end first, because the question the
# labels raised is what loosening buys; 0.45 and 0.50 are there to say what
# tightening would have cost, which is the question ADR 0003 asked and the labels
# turned round.
SWEEP = (0.10, 0.15, 0.20, 0.25, 0.30, 0.35, SCREEN, 0.45, 0.50)

# Measured, not assumed: `photolib.matches` over this catalog checked 564,323
# pairs in 32m47s. A pass's time is dominated by describing frames rather than by
# matching pairs, so this rate carries the decode of the frames those pairs sat
# on and is an upper bound on the marginal pair.
PAIRS_PER_SECOND = 287.0

# Also measured: `pair_match` grew the catalog from 2,517 MB to 2,631 MB over
# 566,522 rows, which is 211 bytes a row including the index the primary key is.
BYTES_PER_PAIR = 211

Pair = tuple[str, str]

# Why one pair the reader kept together carries no Match row. Only the first is
# bought back by moving the screen; the middle two are holes in the derivative
# tree, which is the split this ticket exists to make.
REASONS = {
    "matched": "carry a Match row already",
    "screened_out": "were rejected by the screen -- the only ones a looser value buys back",
    "substrate_missing": "survived the screen and carry no Match: a substrate the pass could"
    " not read",
    "unfingerprinted": "hold a frame with no fingerprint: the same hole one stage earlier",
    "video": "hold a video, which nothing fingerprints and ticket 29 puts out of scope",
    "uncandidated": "are no candidate at all, although both frames are fingerprinted",
}

# The two above that name a frame rather than a pair: a hole in the derivative
# tree cannot go quiet, so the frames are printed and not merely counted.
HOLES = ("substrate_missing", "unfingerprinted")


# --- what the catalog says about a pair ---------------------------------------


@dataclass(frozen=True)
class Seen:
    """What the catalog holds about the pairs it was asked about, and no more.

    Read for the labelled pairs alone rather than whole: the catalog holds 3.6M
    candidates and the reader kept a few thousand pairs together.
    """

    cosines: dict[Pair, float]  # the screen's evidence, for the pairs that are candidates
    matched: frozenset[Pair]  # the pairs carrying a Match row
    fingerprinted: frozenset[str]  # the frames the fingerprint pass reached
    videos: frozenset[str]  # the frames nothing fingerprints on purpose

    def cosine(self, early: str, late: str) -> float | None:
        """The pair's screen, whichever way round it was named.

        The labels order a pair by the run and the enumeration by (camera,
        sort_key, sha256), so this asks both ways rather than assuming they agree.
        """
        found = self.cosines.get((early, late))
        return self.cosines.get((late, early)) if found is None else found

    def has_match(self, early: str, late: str) -> bool:
        return (early, late) in self.matched or (late, early) in self.matched


@dataclass(frozen=True)
class Reach:
    """One pair the reader kept together, and what stands between it and a Match."""

    early: str
    late: str
    cause: str
    cosine: float | None

    def reached_at(self, threshold: float) -> bool:
        """Whether this pair would carry a Match row at `threshold`.

        One rule for both directions, which is the point: a pair is reached when
        its cosine clears the screen, so loosening buys back a rejected pair and
        tightening loses one already matched. The rows a tighter screen would
        never have asked for are still on the disk, but a value has to be read as
        what it decides rather than as what happens to be stored under it.

        That a recovered pair could then be matched is not an assumption: a
        candidate row exists only where both frames carried a fingerprint, and a
        fingerprint comes from a substrate.
        """
        if self.cause not in ("matched", "screened_out") or self.cosine is None:
            return False
        return self.cosine >= threshold


def reach(pair: Pair, found: Seen) -> Reach:
    """Why one kept pair does or does not carry a Match row.

    The order matters in one place: a video is never fingerprinted, so it is
    named as a video rather than as a hole in a tree that owes it nothing.
    """
    early, late = pair
    cosine = found.cosine(early, late)
    if found.has_match(early, late):
        cause = "matched"
    elif cosine is not None:
        cause = "substrate_missing" if cosine >= SCREEN else "screened_out"
    elif early in found.videos or late in found.videos:
        cause = "video"
    elif early not in found.fingerprinted or late not in found.fingerprinted:
        cause = "unfingerprinted"
    else:
        cause = "uncandidated"
    return Reach(early=early, late=late, cause=cause, cosine=cosine)


def reaches(pairs: Iterable[Pair], found: Seen) -> list[Reach]:
    return [reach(pair, found) for pair in pairs]


def reached(found: Sequence[Reach], threshold: float) -> int:
    """How many of the reader's kept pairs would carry a Match row at `threshold`."""
    return sum(1 for one in found if one.reached_at(threshold))


def kept(cases: Iterable[calibrate.Case]) -> list[Pair]:
    """Every pair the reader kept together, over every answer they gave.

    `calibrate.pairs` decides what a label is evidence about and this takes the
    positive half of it: a pair they kept together is a pair the grid owes a
    Match, and a pair they pushed apart needs none to be drawn correctly.
    """
    return [
        (early, late)
        for subject in cases
        for early, late, same in calibrate.pairs(subject)
        if same
    ]


# --- what a value costs -------------------------------------------------------


@dataclass(frozen=True)
class Cost:
    """What matching a number of fresh pairs would take. Estimated, never run."""

    seconds: float
    bytes: int


def price(pairs: float) -> Cost:
    """The two measured rates, applied. See `PAIRS_PER_SECOND` for the bound."""
    return Cost(seconds=pairs / PAIRS_PER_SECOND, bytes=int(pairs) * BYTES_PER_PAIR)


@dataclass(frozen=True)
class Row:
    """One screen value, priced: what survives it, what it buys, what it costs."""

    threshold: float
    surviving: int  # candidates at or above this screen
    fresh: int  # of those, the pairs no Match row covers yet
    reached: int  # kept pairs that would carry a Match row
    cost: Cost


def row(threshold: float, *, surviving: int, matched_rows: int, found: Sequence[Reach]) -> Row:
    """Price one value.

    `fresh` is floored at zero rather than allowed to go negative: a tighter
    screen leaves a smaller table, and the rows it drops are already stored, so
    tightening asks for no pass at all.
    """
    fresh = max(surviving - matched_rows, 0)
    return Row(
        threshold=threshold,
        surviving=surviving,
        fresh=fresh,
        reached=reached(found, threshold),
        cost=price(fresh),
    )


# --- reading the catalog ------------------------------------------------------

_MATCHED_ROWS = "SELECT count(*) FROM pair_match WHERE method = ? AND version = ?"

_CANDIDATE = """
SELECT screen FROM candidate_pair
WHERE model = ? AND version = ? AND sha_early = ? AND sha_late = ?
"""

_MATCH = """
SELECT 1 FROM pair_match
WHERE method = ? AND version = ? AND sha_early = ? AND sha_late = ?
"""

_FINGERPRINTED = "SELECT sha256 FROM fingerprint WHERE model = ? AND version = ?"

CHUNK = 500  # frames per IN list, well under SQLite's variable limit


def _chunks(items: Sequence[str], size: int = CHUNK) -> Iterable[Sequence[str]]:
    for start in range(0, len(items), size):
        yield items[start : start + size]


def seen(
    conn: sqlite3.Connection,
    pairs: Sequence[Pair],
    *,
    model: str = MODEL,
    version: str = VERSION,
    method: str = matches.METHOD,
    match_version: str = matches.VERSION,
) -> Seen:
    """What the catalog holds about these pairs and the frames they name.

    Two indexed lookups a pair rather than a scan of the 3.6M-row table: both
    tables are keyed on (model, version, sha_early, sha_late), and the labels ask
    about a few thousand pairs.
    """
    cosines: dict[Pair, float] = {}
    matched: set[Pair] = set()
    for early, late in pairs:
        for a, b in ((early, late), (late, early)):
            found = conn.execute(_CANDIDATE, (model, version, a, b)).fetchone()
            if found is not None:
                cosines[(a, b)] = found[0]
            if conn.execute(_MATCH, (method, match_version, a, b)).fetchone() is not None:
                matched.add((a, b))

    frames = sorted({sha256 for pair in pairs for sha256 in pair})
    fingerprinted = {row[0] for row in conn.execute(_FINGERPRINTED, (model, version))}
    videos: set[str] = set()
    for chunk in _chunks(frames):
        marks = ",".join("?" * len(chunk))
        videos.update(
            sha256
            for sha256, kind in conn.execute(
                f"SELECT sha256, kind FROM file WHERE sha256 IN ({marks})", tuple(chunk)
            )
            if kind == "video"
        )
    return Seen(
        cosines=cosines,
        matched=frozenset(matched),
        fingerprinted=frozenset(fingerprinted & set(frames)),
        videos=frozenset(videos),
    )


def surviving(
    conn: sqlite3.Connection,
    thresholds: Sequence[float] = SWEEP,
    *,
    model: str = MODEL,
    version: str = VERSION,
) -> dict[float, int]:
    """How many candidates each value admits, counted from the stored cosine.

    One scan of the table answering every value at once, and `screen` rather than
    `verdict`: the verdict is frozen at 0.40, so reading it would answer the whole
    sweep at 0.40. See the module docstring.
    """
    if not thresholds:
        return {}
    sums = ", ".join("coalesce(sum(screen >= ?), 0)" for _ in thresholds)
    counted = conn.execute(
        f"SELECT {sums} FROM candidate_pair WHERE model = ? AND version = ?",
        (*thresholds, model, version),
    ).fetchone()
    return dict(zip(thresholds, counted))


def everything(found: Sequence[Reach]) -> float | None:
    """The screen that reaches every kept pair the standing one rejected.

    The weakest cosine among them, so nothing about the sweep decides it: it is
    read off the reader's own answers, and it is the value the whole question
    "should the screen be loosened at all" is asking about.
    """
    return min((one.cosine for one in found if one.cause == "screened_out"), default=None)


def measure(
    conn: sqlite3.Connection,
    pairs: Sequence[Pair],
    *,
    thresholds: Sequence[float] = SWEEP,
) -> tuple[list[Reach], list[Row]]:
    """Price every value in the sweep against the reader's kept pairs.

    The refusal comes first and is `photolib.candidates`' own: a table whose
    verdicts were decided at some other screen cannot price a move away from this
    one, and repairing it is a re-run rather than a re-read.

    The sweep always carries the value that buys every rejected pair back, priced
    beside the rest: it is the row the decision is actually between, and asking
    the reader to guess it and pass it in would make the report's own answer
    depend on the question having been asked well.
    """
    candidates.refuse_if_rethresholded(conn)
    found = reaches(pairs, seen(conn, pairs))
    buys_back = everything(found)
    if buys_back is not None:
        thresholds = sorted({*thresholds, buys_back})
    admits = surviving(conn, thresholds)
    matched_rows = conn.execute(
        _MATCHED_ROWS, (matches.METHOD, matches.VERSION)
    ).fetchone()[0]
    return found, [
        row(
            threshold,
            surviving=admits[threshold],
            matched_rows=matched_rows,
            found=found,
        )
        for threshold in thresholds
    ]


# --- the report ---------------------------------------------------------------


def duration(seconds: float) -> str:
    if seconds < 1:
        return "     --"
    hours, minutes = int(seconds) // 3600, int(seconds) % 3600 // 60
    return f"{hours}h{minutes:02d}m" if hours else f"{minutes}m"


def size(byte_count: int) -> str:
    return "     --" if not byte_count else f"{byte_count / 1024 / 1024:6,.0f}MB"


def attribution(found: Sequence[Reach]) -> list[str]:
    """The kept pairs, split by what stands between each one and a Match row.

    The frames of a hole are named and not merely counted, for
    `photolib.candidates.run`'s reason: a missing derivative is the one finding
    here that is somebody's job afterwards, and the point of saying so is that it
    cannot go quiet.
    """
    lines = [
        f"kept      {len(found):,} pairs the reader kept together, and what reaches them:"
    ]
    for cause, reason in REASONS.items():
        theirs = [one for one in found if one.cause == cause]
        # A hole is printed at zero as well, because "none" is this ticket's
        # finding rather than the absence of one: the screen's cost and the
        # derivative tree's are the two halves it exists to tell apart.
        if not theirs and cause not in HOLES:
            continue
        lines.append(f"          {len(theirs):>6,} {reason}")
        if cause == "screened_out":
            cosines = sorted(one.cosine or 0.0 for one in theirs)
            lines.append(
                f"                 their screens run from {cosines[0]:.3f} to"
                f" {cosines[-1]:.3f}, median {cosines[len(cosines) // 2]:.3f}"
            )
        if cause in HOLES:
            for sha256 in sorted({sha for one in theirs for sha in (one.early, one.late)}):
                lines.append(f"                 {sha256}")
    return lines


def table(rows: Sequence[Row], found: Sequence[Reach]) -> list[str]:
    """Every value priced, against the one standing.

    `recovered` is read against `SCREEN` and not against the loosest value in the
    sweep, because the decision on the table is a move away from what is on the
    disk now.
    """
    standing = reached(found, SCREEN)
    buys_back = everything(found)
    lines = [
        "  screen    surviving   fresh pairs   match time   catalog   kept pairs reached",
    ]
    for one in rows:
        mark = ""
        if one.threshold == SCREEN:
            mark = "  <- standing"
        elif one.threshold == buys_back:
            mark = "  <- buys every rejected pair back"
        share = one.reached / len(found) if found else 0.0
        lines.append(
            f"  {one.threshold:<6.3f} {one.surviving:>10,}   {one.fresh:>11,}   "
            f"{duration(one.cost.seconds):>9}   {size(one.cost.bytes)}   "
            f"{one.reached:>6,} ({share:5.1%}) {one.reached - standing:+,}{mark}"
        )
    return lines


def recovery(found: Sequence[Reach], rows: Sequence[Row]) -> list[str]:
    """What the whole of the screen's cost is, and what buying it back would take.

    Two numbers an operator can act on: the value that recovers every kept pair
    the screen rejected -- which is the loosest one it rejected, so nothing about
    the sweep decides it -- and the pairs no value recovers at all, which is the
    floor this ticket exists to name.
    """
    rejected = [one for one in found if one.cause == "screened_out"]
    floor = [one for one in found if one.cause in HOLES]
    lowest = everything(found)
    lines = []
    if lowest is None:
        lines.append(
            "\nrecovery  the screen rejected none of the pairs the reader kept together"
        )
    else:
        # `measure` always prices this value, which is why it is looked up rather
        # than searched for: the row the decision is between is never absent.
        priced = next(one for one in rows if one.threshold == lowest)
        lines.append(
            f"\nrecovery  a screen of {lowest:.3f} reaches every one of the"
            f" {len(rejected):,} kept pairs it rejected,"
        )
        lines.append(
            f"          which is {priced.fresh:,} fresh pairs to match:"
            f" {duration(priced.cost.seconds).strip()} and {size(priced.cost.bytes).strip()}"
        )
    lines.append(
        f"floor     {len(floor):,} kept pairs no screen reaches: a substrate the derivative"
        " tree owes and does not hold"
    )
    return lines


def report(found: Sequence[Reach], rows: Sequence[Row]) -> None:
    print(*attribution(found), sep="\n")
    print("\nwhat each screen value would cost, priced from the rates already measured")
    print(*table(rows, found), sep="\n")
    print(*recovery(found, rows), sep="\n")


def labels_read_only(path: Path) -> sqlite3.Connection:
    """The labels, opened read-only.

    Not `harness.label.store`, which creates the table it expects: this module
    writes nothing anywhere, and the cheapest way to keep that true of the one
    file holding the reader's own answers is to have no way to write it.
    """
    return sqlite3.connect(f"{path.as_uri()}?mode=ro", uri=True)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m harness.screen", description=__doc__.splitlines()[0]
    )
    parser.add_argument(
        "--screens",
        help="comma-separated screen values to price (default: %(default)s)",
        default=",".join(f"{value:g}" for value in SWEEP),
    )
    args = parser.parse_args(argv)
    thresholds = tuple(float(value) for value in args.screens.split(","))

    config = load()
    labels_db = config.catalog_db.parent / label.LABELS
    if not labels_db.exists():
        print(f"no labels at {labels_db}: run python -m harness.label first")
        return 1

    labels = labels_read_only(labels_db)
    try:
        answers = label.answers(labels)
    finally:
        labels.close()
    if not answers:
        print(f"no answers in {labels_db}: run python -m harness.label first")
        return 1

    conn = candidates.catalog(config.catalog_db, read_only=True)
    try:
        # The ceiling is `photolib.candidates`' own and is not a knob here, for
        # `harness.calibrate`'s reason: it is the fence the rows being priced were
        # computed behind.
        frames = candidates.population(conn)
        cases, orphans = calibrate.cases(answers, candidates.runs(frames, candidates.CEILING))
        print(f"catalog   {config.catalog_db}")
        print(f"labels    {labels_db}")
        print(f"screen    {MODEL} version {VERSION}, standing at {SCREEN:.2f}")
        print(f"matches   {matches.METHOD} version {matches.VERSION}")
        print(f"answers   {len(answers):,} answers over {len({c.run for c in cases})} runs")
        if orphans:
            print(f"orphans   {len(orphans)} answers whose frames are in no run any more")
        found, rows = measure(conn, kept(cases), thresholds=thresholds)
    finally:
        conn.close()

    report(found, rows)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except candidates.CandidatesRefused as exc:
        sys.exit(f"refused: {exc}")
