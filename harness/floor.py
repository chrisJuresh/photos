"""What the prominence floor is worth, priced against the reader's own answers.

`docs/adr/0004-people-veto-a-stack.md`: *a prominence floor exists and is measured,
not picked*. Somebody counts only above some share of the frame, or a person forty
metres away in the background of one frame of a bracket would split it -- and the
value is settled from the reader's friend-or-stranger answers rather than chosen.
`photolib.people.FLOOR` is provisional at 0.10 and every box's share is stored, so
settling it is a re-read of those rows. **This is that re-read.**

It is allowed to answer *no*, and that is the point of it. Prominence is a proxy
for the thing rather than the thing: a stranger can be large and close, a friend
small and distant. So the first question is not *what value* but *whether any value
separates the two populations at all*, and where none does the recommendation is to
leave the floor where it stands as a cheap pre-filter and let the verdict do the
work. A proxy that does not work is abandoned rather than tuned, and a report that
handed back the least-bad value would be that failure dressed as an answer.

What it prints, separately for the friends and the strangers:

- the distribution of their box shares, and the overlap between them
- whether any floor separates them, and which one
- every candidate floor's error counts -- friends it leaves out, strangers it lets
  in -- and **the persons each gets wrong**, so a bad value is diagnosable
- how many stacks each floor would change, so the number is priced in the thing it
  affects rather than in boxes

    python -m harness.floor

**It writes nothing, and that is a fact about the code rather than a promise.**
Both connections are opened read-only, `photolib.people.FLOOR` is read and never
moved, and no pass is run -- `harness.screen`'s posture, kept whole. Acting on what
this returns means editing one constant, which is a ticket of its own.

**A stack change is a change to what the rule reads, not a re-run of the rule.**
The nesting rule is not implemented -- ADR 0004's "What the pass records" says so
-- so what is counted here is the stacks holding a frame whose *people set* differs
between two floors. That is the input the rule turns on and it is the tightest
honest measure available before the rule lands; it is deliberately not called a
count of stacks split.

It reads the catalog and `labels.sqlite3`, both on the NVMe, opens no substrate,
never touches `G:`, and holds both connections read-only. The numbers are counts
rather than timings, so nothing here is a measurement of the disk.

**An appearance is counted once per box.** The floor is applied per box -- a box
counts as somebody when it clears the share -- so the population it is chosen from
is boxes, and a friend photographed forty times is forty appearances behind one
verdict. That is `harness.calibrate`'s per-answer counting turned the other way up
and it is right here for the reason it is wrong there: the thing being priced is a
threshold on a box.
"""

from __future__ import annotations

import argparse
import sys
from collections.abc import Collection, Iterable, Mapping, Sequence
from dataclasses import dataclass

import numpy as np

from harness import label, people, screen
from harness.people import JUDGED
from photolib import candidates
from photolib.config import load
from photolib.people import FLOOR, MODEL, THRESHOLD, VERSION

# Read from `photolib.people` and never copied, so the report cannot come to price
# a move away from a value the pass is not standing at. ADR 0004 calls that line
# the only one in the repository that reads the floor; this reads that line.
PROVISIONAL = FLOOR

# The candidate floors, and **not a knob**. `harness.screen`'s reasoning: every
# value is priced against the same stored shares, so a flag here could only let the
# report be asked a narrower question than the one it exists to answer. Two
# hundredths apart from nothing to half the frame's height, which brackets the
# provisional value by a factor of five either way -- a floor outside that range is
# either counting every detection or counting almost none.
SWEEP = tuple(round(step / 50, 2) for step in range(26))


@dataclass(frozen=True)
class Appearance:
    """One box the reader has judged the person in: whose, where, and how big.

    The person rides along with the share because naming what a floor gets wrong is
    half of what this report is for -- a count of errors says a value is bad and
    the persons behind it say why.
    """

    person: str
    sha256: str
    idx: int
    share: float


def excluded(given: Mapping[str, str]) -> set[str]:
    """The persons who are in no frame's people, whatever any floor says.

    `harness.people.counts` is the rule and this is it read over a whole mapping,
    so the report and the harness cannot come to disagree about what a stranger is.
    An unjudged person is absent from `given` and is therefore not here, which is
    the friend default.
    """
    return {person for person, verdict in given.items() if not people.counts(verdict)}


def populations(
    given: Mapping[str, str],
    shares: Mapping[str, Iterable[tuple[str, int, float]]],
) -> dict[str, list[Appearance]]:
    """The judged appearances, split by what the reader said -- friends and strangers.

    **Apart and never blended**, which is what lets the report show a separation or
    the absence of one. Only `friend` and `stranger` are in it: `unsure` is an
    answer about the reader's eyes rather than about a person, and `two-people` is a
    report about the clustering, so neither is evidence about where a floor goes.

    An unjudged person is not here either. The friend default is how the *rule*
    reads silence and it is not the reader saying anything, so counting it as their
    answer would be fitting the floor to the harness's own default.
    """
    seen: dict[str, list[Appearance]] = {verdict: [] for verdict in JUDGED}
    for person, boxes in shares.items():
        verdict = given.get(person)
        if verdict not in seen:
            continue
        seen[verdict] += [
            Appearance(person, sha256, idx, share) for sha256, idx, share in boxes
        ]
    return seen


def separates(friends: Sequence[float], strangers: Sequence[float]) -> float | None:
    """The floor that puts every friend above it and every stranger below, or None.

    A box counts at or above the floor, so separation means
    `max(stranger) < min(friend)` and the floor sits in that gap. The midpoint is
    returned because there is no reason within these answers to prefer either edge
    of it.

    **None where the populations overlap**, and None where either is empty. The
    first is the finding this report exists to be able to return; the second is no
    evidence rather than perfect evidence, and a value recommended from it would be
    a value nobody's answers had spoken about.
    """
    if not friends or not strangers:
        return None
    smallest_friend, largest_stranger = min(friends), max(strangers)
    if largest_stranger >= smallest_friend:
        return None
    return (largest_stranger + smallest_friend) / 2


def wrong(
    value: float, seen: Mapping[str, Sequence[Appearance]]
) -> tuple[list[Appearance], list[Appearance]]:
    """What one floor gets wrong: friends it leaves out, strangers it lets in.

    Two lists and never a total, because the two errors are not the same error.
    Leaving a friend out shrinks a frame's people, which nests more easily and so
    **merges**; letting a stranger in grows it, which **splits**. ADR 0004 leans
    towards merging everywhere, so a report that summed them would hide the only
    asymmetry the reader cares about.
    """
    missed = [one for one in seen["friend"] if one.share < value]
    admitted = [one for one in seen["stranger"] if one.share >= value]
    return missed, admitted


def sets(
    shares: Mapping[str, Mapping[str, float]],
    strangers: Collection[str],
    value: float,
) -> dict[str, frozenset[str]]:
    """Each frame's people at one floor: the boxes that reach it, strangers aside.

    The seam `changed` is built on, and the one place the floor is actually applied
    to anything. A box at the floor counts and a box below it does not, which is
    `photolib.people.FLOOR`'s own `share >= FLOOR`.
    """
    return {
        sha256: frozenset(
            person
            for person, share in held.items()
            if share >= value and person not in strangers
        )
        for sha256, held in shares.items()
    }


def changed(
    shares: Mapping[str, Mapping[str, float]],
    stacks: Mapping[str, str],
    strangers: Collection[str],
    value: float,
    *,
    against: float,
) -> list[str]:
    """The stacks holding a frame whose people differ between two floors.

    **Stacks and not frames**, because a stack is what the reader sees: three
    frames of one nine-frame burst changing is one tile drawn differently, and a
    count of frames would price that burst as though it were three questions.

    A frame in no stack is in no answer. Membership gives a row to every EXIF-dated
    published tile and none to a tile the filesystem dated, so a face in one of
    those changes nothing anybody is looking at.

    Not a count of stacks *split*: see the module docstring. What changes is the
    input the nesting rule reads, and the rule is not implemented yet.
    """
    now, before = sets(shares, strangers, value), sets(shares, strangers, against)
    return sorted(
        {
            stacks[sha256]
            for sha256 in shares
            if sha256 in stacks and now[sha256] != before[sha256]
        }
    )


def distribution(appearances: Sequence[Appearance]) -> str:
    """The shape of one population's box shares, in one line."""
    if not appearances:
        return "nothing judged"
    shares = np.asarray([one.share for one in appearances])
    quartiles = np.percentile(shares, (25, 50, 75))
    return (
        f"{len(appearances):,} boxes, median {quartiles[1]:.3f},"
        f" quartiles {quartiles[0]:.3f}/{quartiles[2]:.3f},"
        f" from {shares.min():.3f} to {shares.max():.3f}"
    )


def named(appearances: Sequence[Appearance], most: int = 8) -> list[str]:
    """The persons a floor gets wrong, worst first, and how many are not shown.

    Worst is furthest from the floor's verdict about them, which is the share
    itself: the friend it left out most confidently and the stranger it let in most
    confidently are the two cases that say whether the value is wrong or merely
    imprecise.
    """
    by_person: dict[str, list[float]] = {}
    for one in appearances:
        by_person.setdefault(one.person, []).append(one.share)
    ordered = sorted(by_person.items(), key=lambda entry: -max(entry[1]))
    lines = [
        f"              {person[:8]}:{person.rsplit(':', 1)[1]}  {len(held)} box(es),"
        f" largest {max(held):.3f}"
        for person, held in ordered[:most]
    ]
    if len(ordered) > most:
        lines.append(f"              and {len(ordered) - most} more")
    return lines


def report(
    seen: Mapping[str, Sequence[Appearance]],
    shares: Mapping[str, Mapping[str, float]],
    stacks: Mapping[str, str],
    strangers: Collection[str],
    *,
    given: Mapping[str, str] | None = None,
) -> list[str]:
    """What the answers say about the floor, and whether they say anything.

    The separation question leads, because it is the one that decides whether the
    rest of the table is a choice or a curiosity. Where nothing separates them the
    recommendation is stated as a recommendation to change nothing, which is the
    outcome this report was designed to survive.
    """
    friends, others = seen["friend"], seen["stranger"]
    lines = []
    if given:
        confused = [person for person, verdict in given.items() if verdict == "two-people"]
        unsure = [person for person, verdict in given.items() if verdict == "unsure"]
        lines.append(
            f"clusters  {len(confused):,} the reader called two people,"
            f" {len(unsure):,} they could not make out"
        )
        if confused:
            lines.append(
                "          a clustering failure rather than a person, and not"
                " evidence about the floor:"
            )
            lines += [f"              {person}" for person in sorted(confused)]
    if not friends and not others:
        lines.append(
            "\nnothing to measure: no person has been judged a friend or a stranger."
            " `python -m harness.label --open` in its people mode is where that"
            " happens."
        )
        return lines

    lines += [
        f"\nfriends   {distribution(friends)}",
        f"strangers {distribution(others)}",
    ]
    separating = separates([one.share for one in friends], [one.share for one in others])
    if separating is None:
        lines.append(
            "\nfinding   **no floor separates them.** Prominence is a proxy for what"
            " the reader was asked and the two populations interleave, so no value"
            " sorts a stranger from a friend on size alone."
        )
        if friends and others:
            # Both directions, because they are two different failures and the
            # counts are not symmetric in the data: one big stranger drags the
            # first number up and says nothing about how many friends are small.
            small = min(one.share for one in friends)
            large = max(one.share for one in others)
            lines.append(
                f"          {sum(1 for one in others if one.share >= small):,}"
                f" stranger box(es) reach the smallest friend box ({small:.3f}), and"
                f" {sum(1 for one in friends if one.share <= large):,} friend box(es)"
                f" fall inside the largest stranger box ({large:.3f})."
            )
        else:
            lines.append(
                "          one of the two populations is empty, so there is nothing"
                " to separate rather than a clean separation."
            )
        lines.append(
            "          the recommendation is to keep the floor where it stands,"
            f" {PROVISIONAL}, as a cheap pre-filter, and let the friend-or-stranger"
            " verdict do the work."
        )
    else:
        lines += [
            f"\nfinding   a floor of {separating:.3f} **separates** them: every"
            " friend box reaches it and every stranger box falls short.",
            f"          the floor stands at {PROVISIONAL}, so moving it to"
            f" {separating:.3f} is the change these answers support.",
        ]

    lines += [
        "\nsweep     every candidate floor, against the answers and against the"
        f" stacks. `changed` is measured from {PROVISIONAL}, where the floor stands.",
        "            floor   friends out   strangers in   stacks changed",
    ]
    for value in SWEEP:
        missed, admitted = wrong(value, seen)
        moved = changed(shares, stacks, strangers, value, against=PROVISIONAL)
        here = " <- standing" if value == PROVISIONAL else ""
        lines.append(
            f"            {value:>5.2f}   {len(missed):>11,}   {len(admitted):>12,}"
            f"   {len(moved):>14,}{here}"
        )

    for value, why in _diagnose(seen, separating):
        missed, admitted = wrong(value, seen)
        lines.append(f"\n{why} {value:.3f}")
        if missed:
            lines.append(f"          {len(missed):,} friend box(es) left out:")
            lines += named(missed)
        if admitted:
            lines.append(f"          {len(admitted):,} stranger box(es) let in:")
            lines += named(admitted)
        if not missed and not admitted:
            lines.append("          gets none of the judged persons wrong.")
    return lines


def _diagnose(
    seen: Mapping[str, Sequence[Appearance]], separating: float | None
) -> list[tuple[float, str]]:
    """Which floors are worth naming persons for, and why that one.

    Not all twenty-six. Naming the persons is what makes a value diagnosable and
    printing them for every row would bury the rows that matter: where the floor
    stands, the value with the fewest errors, and -- where there is one -- the value
    that separates. Deduplicated, because those are often the same number.
    """
    fewest = min(SWEEP, key=lambda value: sum(len(side) for side in wrong(value, seen)))
    wanted = [
        (PROVISIONAL, "standing "),
        (fewest, "fewest   "),
    ]
    if separating is not None:
        wanted.append((separating, "separates"))
    named_once: list[tuple[float, str]] = []
    for value, why in wanted:
        if value not in {already for already, _ in named_once}:
            named_once.append((value, why))
    return named_once


# --- running it ---------------------------------------------------------------


def by_frame(
    held: Mapping[str, Sequence[people.Face]]
) -> dict[str, dict[str, float]]:
    """Every frame's persons and their box shares, which is what `sets` reads.

    Over every person and not only the judged ones, because a frame's people is the
    whole of what nests: what a floor does to a stack turns on every box in it, and
    the unjudged ones are friends by default and count.

    A frame with two boxes of one person keeps the larger. The question a floor
    answers is *is this person prominent in this frame*, and the largest box they
    have there answers it -- `frame_body`'s own narrowing, for the same reason.
    """
    frames: dict[str, dict[str, float]] = {}
    for person, faces in held.items():
        for face in faces:
            seen = frames.setdefault(face.sha256, {})
            seen[person] = max(seen.get(person, 0.0), face.share)
    return frames


def main(argv: list[str] | None = None) -> int:
    # No arguments, and the sweep is not a knob -- `harness.screen`'s reason, and
    # the same one: the report exists to answer whether a floor works at all, and
    # every flag would let it be asked something narrower.
    argparse.ArgumentParser(
        prog="python -m harness.floor", description=__doc__.splitlines()[0]
    ).parse_args(argv)

    config = load()
    labels_db = config.catalog_db.parent / label.LABELS
    if not labels_db.exists():
        print(f"no labels at {labels_db}: run python -m harness.label first")
        return 1

    clustering = people.Clustering(MODEL, VERSION, THRESHOLD)
    labels = screen.labels_read_only(labels_db)
    try:
        given = people.verdicts(labels, clustering)
    finally:
        labels.close()

    conn = candidates.catalog(config.catalog_db, read_only=True)
    try:
        held = people.found(conn, clustering)
        stacks = people.membership(conn)
    finally:
        conn.close()

    # Three ways there is nothing to measure, and they have three different fixes.
    # Saying "nobody has been judged" when the detector has not run points the
    # reader at the harness for a pass's absence.
    if not held:
        print(
            f"no persons in {config.catalog_db} at {MODEL} version {VERSION},"
            f" threshold {THRESHOLD}: run python -m photolib.people first"
        )
        return 1
    if not stacks:
        print(
            f"no stack assignment in {config.catalog_db} at {people.STACK_SETTING}:"
            " run python -m photolib.membership first. Without it every frame is its"
            " own stack, so no verdict could change one and there is nothing to price."
        )
        return 1

    faces = sum(len(one) for one in held.values())
    print(f"catalog     {config.catalog_db}")
    print(f"labels      {labels_db}")
    print(
        f"clustering  {MODEL} version {VERSION}, threshold {THRESHOLD}"
        f" -- {len(held):,} persons, {faces:,} faces"
    )
    print(f"floor       {PROVISIONAL} of the frame's height, read here and not moved")
    print(f"stacks      {len(set(stacks.values())):,} at {people.STACK_SETTING}")
    print(f"judged      {len(given):,} persons the reader has answered about")
    print(
        *report(
            populations(given, people.boxes(held)),
            by_frame(held),
            stacks,
            excluded(given),
            given=given,
        ),
        sep="\n",
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
