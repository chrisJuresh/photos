"""What the fingerprint screen rejected, matched anyway -- ADR 0003's last open number.

`harness.screen` prices a looser screen from the stored cosine and stops there, on
a reasoning ADR 0003 recorded and this module exists to finish: a recovered pair
only helps if its Match then clears the reader's strictness, and nothing knew what
those Matches were. At strictness 20 that reasoning held and the ADR recommended
leaving the screen at 0.40. At a much looser strictness it stops holding, so the
question is live again and the only way to answer it is to compute the number.

So this is the measurement. Every pair the reader kept together that carries no
Match row **because the screen rejected it** is matched directly through
`matches.match` over its two substrates, and the scores are reported: the
distribution, and how many of them clear a strictness.

**It writes nothing, and that is a fact about the code rather than a promise.**
Both connections are opened read-only, no pass is run, and nothing is inserted into
`candidate_pair` or `pair_match`. The screen constant stays frozen at 0.40 and
`photolib.candidates.refuse_if_rethresholded` -- borrowed whole through
`harness.screen`, never weakened -- is untouched. Acting on what this returns means
re-running the candidates pass and the match pass, which is a ticket of its own.

    python -m harness.rejected

It reads `labels.sqlite3`, the catalog and the substrate tree, all three on the
NVMe, and never opens `G:`. Unlike `harness.screen` it does decode photographs, so
it is the slow one of the two: a few hundred pairs at the rate `photolib.matches`
measured. Its output is ADR 0003's answer to its own open question, which a person
writes down.

**A pair is counted once**, `harness.screen`'s way and not `harness.calibrate`'s:
whether two frames agree geometrically is one fact about two frames, and the rounds
partition a run differently, so counting a pair once per answer would weight this by
how often the sampler returned to a run.
"""

from __future__ import annotations

import argparse
import sys
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from harness import calibrate, label, screen
from photolib import candidates, matches, membership
from photolib.candidates import SCREEN
from photolib.config import load, substrate_path
from photolib.fingerprints import MODEL, VERSION


@dataclass(frozen=True)
class Scored:
    """One pair the screen rejected, with the Match it would have earned.

    `points` is None where a substrate would not decode. That is the same hole
    `harness.screen` names as `substrate_missing` one stage later, and it is kept
    apart from a Match of zero for `photolib.matches`' reason: a pair nothing could
    look at is not a pair that was looked at and disagreed.
    """

    early: str
    late: str
    cosine: float
    points: int | None
    unreadable: str | None = None


def describe(sha256: str, substrate_root: Path) -> tuple[matches.Features | None, str | None]:
    """One frame's points, or why its substrate would not give them up.

    `photolib.matches`' own boundary, borrowed rather than written a second time:
    it is the one place this repository reads a substrate off the filesystem, and
    two copies of it would be two answers to "what does an undecodable frame do".
    """
    return matches._describe(substrate_path(substrate_root, sha256))


def score(pairs: Sequence[screen.Reach], substrate_root: Path) -> list[Scored]:
    """Match every rejected pair over its substrates, in the order given.

    A frame is described once per pair rather than once per fan-out, which
    `photolib.matches` is careful about and this is not: a few hundred pairs is a
    couple of minutes either way, and the caching that makes the pass fast is the
    part of it that would have to be copied rather than borrowed.
    """
    scored: list[Scored] = []
    for pair in pairs:
        early, early_why = describe(pair.early, substrate_root)
        late, late_why = describe(pair.late, substrate_root)
        readable = early is not None and late is not None
        scored.append(
            Scored(
                early=pair.early,
                late=pair.late,
                cosine=pair.cosine if pair.cosine is not None else 0.0,
                points=matches.agree(early, late) if readable else None,
                unreadable=None if readable else (early_why or late_why),
            )
        )
    return scored


def clearing(scored: Sequence[Scored], strictness: int) -> list[Scored]:
    """The rejected pairs whose Match reaches a strictness -- what buying them back buys."""
    return [one for one in scored if one.points is not None and one.points >= strictness]


def distribution(scored: Sequence[Scored]) -> str:
    """The shape of what the screen threw away, in `photolib.matches`' own terms."""
    points = [one.points for one in scored if one.points is not None]
    if not points:
        return "nothing decoded"
    quartiles = np.percentile(np.asarray(points), (25, 50, 75)).astype(int)
    return (
        f"median {quartiles[1]:,}, quartiles {quartiles[0]:,}/{quartiles[2]:,}, "
        f"best {max(points):,}, {sum(1 for count in points if count == 0):,} agreeing on none"
    )


def report(scored: Sequence[Scored], strictness: int) -> list[str]:
    """What the screen cost, at the strictness the grid is about to run.

    The sweep of strictnesses is deliberately not here. What ADR 0003 asked is
    whether these pairs would have agreed, and one threshold answers it; the rest
    of the distribution is printed, so a reader wanting another value can read it
    off rather than be handed a table that implies the screen has a dial.
    """
    undecodable = [one for one in scored if one.points is None]
    reached = clearing(scored, strictness)
    lines = [
        f"\nrejected  {len(scored):,} pairs the reader kept together that the screen"
        f" turned away at {SCREEN:.2f}",
        f"matched   {len(scored) - len(undecodable):,} of them decoded and were matched:"
        f" {distribution(scored)}",
    ]
    if undecodable:
        lines.append(
            f"          {len(undecodable):,} would not decode, which is a hole in the"
            " substrate tree and not the screen's doing:"
        )
        lines += [
            f"            {one.early} {one.late}  {one.unreadable}" for one in undecodable
        ]
    lines.append(
        f"\nclearing  {len(reached):,} of them reach strictness {strictness}, which is"
        " what loosening the screen would actually buy the grid"
    )
    if reached:
        lines.append("          the strongest, which is what a lost stack looks like:")
        for one in sorted(reached, key=lambda one: -(one.points or 0))[:10]:
            lines.append(
                f"            {one.early[:8]} {one.late[:8]}   {one.points:>5} points"
                f"   screened at {one.cosine:.3f}"
            )
        loosest = min(one.cosine for one in reached)
        lines.append(
            f"          a screen of {loosest:.3f} reaches every one of them --"
            f" `python -m harness.screen` is what prices that pass"
        )
    else:
        lines.append(
            "          so loosening the screen buys the grid nothing at this"
            " strictness: the pairs it rejected would not have agreed either."
        )
    return lines


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m harness.rejected", description=__doc__.splitlines()[0]
    )
    parser.add_argument(
        "--strictness",
        type=int,
        default=membership.STRICTNESS,
        help="the Match a recovered pair has to reach to be worth recovering --"
        " the setting the grid runs (default: %(default)s)",
    )
    args = parser.parse_args(argv)

    config = load()
    labels_db = config.catalog_db.parent / label.LABELS
    if not labels_db.exists():
        print(f"no labels at {labels_db}: run python -m harness.label first")
        return 1
    if not config.substrate_root.is_dir():
        print(f"no substrate tree at {config.substrate_root}: run python -m photolib.substrates")
        return 1

    labels = screen.labels_read_only(labels_db)
    try:
        answers = label.answers(labels)
    finally:
        labels.close()
    if not answers:
        print(f"no answers in {labels_db}: run python -m harness.label first")
        return 1

    conn = candidates.catalog(config.catalog_db, read_only=True)
    try:
        # Borrowed whole, never weakened: pricing a move away from 0.40 means
        # nothing if the rows on the disk were decided somewhere else.
        candidates.refuse_if_rethresholded(conn)
        frames = candidates.population(conn)
        cases, orphans = calibrate.cases(answers, candidates.runs(frames, candidates.CEILING))
        kept = screen.kept(cases)
        found = screen.reaches(kept, screen.seen(conn, kept))
    finally:
        conn.close()

    turned_away = [one for one in found if one.cause == "screened_out"]
    print(f"catalog   {config.catalog_db}")
    print(f"labels    {labels_db}")
    print(f"substrate {config.substrate_root}")
    print(f"screen    {MODEL} version {VERSION}, standing at {SCREEN:.2f} and not moved here")
    print(f"matches   {matches.METHOD} version {matches.VERSION}")
    print(f"kept      {len(kept):,} pairs the reader kept together, counted once each")
    if orphans:
        print(f"orphans   {len(orphans)} answers whose frames are in no run any more")
    if not turned_away:
        print("\nnothing to measure: the screen turned none of the kept pairs away")
        return 0
    print(*report(score(turned_away, config.substrate_root), args.strictness), sep="\n")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except candidates.CandidatesRefused as exc:
        sys.exit(f"refused: {exc}")
