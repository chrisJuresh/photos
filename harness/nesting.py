"""What the nesting rule would do to the grid, and whether a looser clustering helps.

[#56](https://github.com/chrisJuresh/photos/issues/56) specifies the rule and has
not landed. Priced against the shipped grid it splits stacks the reader is asking
to be **bigger**: in the thirteen-frame run of
[#88](https://github.com/chrisJuresh/photos/issues/88) twelve faces cluster to one
person and one clusters to its own, same human, same run -- so the rule reads two
groups where there is one and takes the stack apart. That is not the rule being
wrong. It is the clustering under it disagreeing with itself, and this report is
what says whether a looser threshold fixes enough of it to be worth moving.

## The column that did not exist

`harness.floor` and `harness.recluster` both price a knob against the reader's
answers, and neither could ask what the rule would actually do, because the rule
reads a *frame's people* and both of them stop at a person's boxes. So the subject
here is a count over stacks: **the stacks the nesting rule would split where every
frame holds somebody.** Nothing new is stored to produce it -- a clustering of the
stored vectors, each frame's people at `photolib.people.FLOOR`, the walk read from
`stack_member` at `photolib.browse.STACK_SETTING`, and then the rule asked.

**The qualifier is what makes it the right subject.** A stack that splits because
some of its frames hold nobody is the rule firing as designed, and no clustering
moves it: presence is a body's answer and not a face's. A stack where *every* frame
holds somebody and no member's people contain the rest is the clustering handing one
human two names, or two humans one -- and that is the only part of the split count a
threshold can reach.

**It is a ceiling on what a clustering could buy and not a count of clustering
errors.** Some of those stacks hold two people who really did come and go, and there
the rule is working. What separates them is the sweep itself: a stack that still
splits where the population has collapsed to a fraction of itself was never the
clustering's doing.

**The nobody clause is deliberately not simulated.** ADR 0004 reads presence off
bodies so that the back of a head still counts, and no value of this threshold
changes a single body row. Counting it here would put a fixed number inside a sweep
and flatter every value equally.

## Downwards, which is the direction nothing has swept

`harness.recluster` swept this threshold and found 0.363 stands, but **upwards
only**: its question was whether a tighter cut takes the `two-people` clusters
apart, and a lower value merges more. The direction that rejoins one human is
looser, so the finding that the knob is the wrong one had evidence for one
direction. This sweep runs both ways from where it stands, and the standing row is
first and says whether it reproduces the stored assignment, which is its own check
that it is pricing the clustering the pass performs.

## The two things it counts, kept apart

**Stacks bought back** is the failure being fixed: subjects that no longer split.
**Friends contested** is the reader's own answers landing together -- a person they
judged sharing a cluster with another person they judged, so that one verdict now
has to stand for two answers.

They are reported apart and never totalled -- `harness.floor`'s rule, for its
reason -- and the recommendation is made from the exchange between them.

**Two friends merging is not by itself an error, and the report says so rather than
scoring it as one.** The reader answered *friend* about each cluster separately;
neither answer claims the two are different individuals, and the case this whole
report is about is exactly two clusters of one human. So the contested count is what
a move puts in question, not a count of mistakes, and the sharper form -- a friend
and a stranger inside one person, where the two answers cannot both stand -- is
counted on its own.

    python -m harness.nesting

**It is the measurement and never the pass.** Both connections are opened read-only,
no population is written, `photolib.people.FLOOR` and `photolib.browse.STACK_SETTING`
are read and never copied, and the clustering is `photolib.people.cluster` itself so
that what is priced is what a pass would write. It reads the catalog and
`labels.sqlite3`, both on the NVMe, opens no substrate and never touches `G:`.

Clustering gets slower as the threshold falls, because a lower value merges more and
complete linkage's queue grows with it: measured at eleven minutes of CPU over eleven
clusterings -- nine of the 8,037 faces and two of the 5,826 reaching the cut -- of
which the two loosest are seven.
"""

from __future__ import annotations

import argparse
import sys
import time
from collections.abc import Mapping, Sequence
from dataclasses import dataclass

import numpy as np

from harness import label, people, screen
from harness.recluster import FLAGGED, PROVISIONAL, STANDING, above, held
from harness.recluster import reaching as persons_at_floor
from photolib import candidates
from photolib.browse import STACK_SETTING
from photolib.config import load
from photolib.people import CUT, MODEL, NO_CUT, VERSION, cluster, name, reaching, vectors

# The candidate thresholds, and **not a knob** -- `harness.screen`'s reasoning, and
# `harness.recluster`'s. The standing value is first so that the table's first row
# is the population the reader was shown and the check below has something to be a
# check of; the rest run loosest first, because loosening is the direction this
# report exists to price and the tight end is the question `harness.recluster`
# already answered.
SWEEP = (STANDING, 0.10, 0.20, 0.25, 0.30, 0.32, 0.34, 0.40, 0.45)

# Where the reader's answers came from, and the only population in the catalog: the
# clusters made before `photolib.people.CUT` existed. `harness.floor` and
# `harness.recluster` read it by name for the same reason -- every verdict was given
# about it -- and the cut is priced beside the sweep rather than inside it.
POPULATION = NO_CUT


@dataclass(frozen=True)
class Split:
    """What the nesting rule would do to one clustering's grid.

    `stacks` is every multi-frame stack with no member whose people contain every
    other member's, and `everybody` is the subset where each frame holds somebody --
    the part a threshold can reach. Both are names rather than counts, because a
    count says a value is wrong and the stacks behind it say which photographs.

    `frames` is how many frames the split stacks hold between them, which is the
    figure #88 quotes beside the stack count and the one that says how much of the
    grid is at stake.
    """

    stacks: tuple[str, ...]
    everybody: tuple[str, ...]
    frames: int


@dataclass(frozen=True)
class Contested:
    """What one clustering puts in question, over the persons the reader judged.

    Three lists and never a total. `friends` is the judged friends sharing a person
    with another judged person: their answer now has to stand for somebody else's
    too. `opposed` is the sharper form -- one person holding both a friend and a
    stranger, where the two answers cannot both be true of it. `flagged` is the
    clusters already reported as two people that have absorbed another judged
    person, which is the known failure getting worse.
    """

    friends: tuple[str, ...]
    opposed: tuple[str, ...]
    flagged: tuple[str, ...]


@dataclass(frozen=True)
class Row:
    """One threshold's answer: what the rule would do and what it would contest.

    The cost is carried twice, which is `harness.recluster`'s two tables in two
    columns: `contested` is over every judged cluster, the population the reader was
    shown, and `at_floor` is over the ones carrying a box that reaches
    `photolib.people.FLOOR`, the population the nesting rule reads. A judged person
    whose every box is under the floor is in no frame's people, so no clustering of
    them moves a stack whatever it does to their verdict -- and a cost counted only
    the first way would price answers the grid cannot feel.
    """

    threshold: float
    persons: int
    split: Split
    contested: Contested
    at_floor: Contested
    bought: tuple[str, ...]
    lost: tuple[str, ...]
    joins: int


# --- the rule, asked ------------------------------------------------------------


def nests(sets: Sequence[frozenset[str]]) -> bool:
    """Whether one member's people contain every other member's.

    ADR 0004's rule and the whole of what a clustering can move: **subset of the
    cover and not a strict chain**, so `{A,B}`, `{A,C}` and `{A,B,C}` nest and
    `{A,B}` with `{A,C}` alone do not.

    The empty set is a subset of everything, so a frame holding nobody never causes
    a failure by itself. That is deliberate and it is why the subject below is
    qualified: ADR 0004's nobody clause -- *a frame with nobody in it never joins a
    frame with somebody* -- is answered by the body detector, and no threshold here
    moves a body row.

    Pure over people sets: no image, no database, no model, which is what makes the
    reader's worked example an assertion rather than a browsing session.
    """
    return any(all(other <= one for other in sets) for one in sets)


def peopled(
    faces_of: Mapping[str, frozenset[str]], frames: Mapping[str, str]
) -> dict[str, frozenset[str]]:
    """Each frame's people, from a clustering already narrowed to the floor.

    `faces_of` is `harness.recluster.above`'s output -- each person's faces that
    reach `photolib.people.FLOOR` -- so the floor is applied in one place for both
    reports and they cannot come to disagree about what it admits. `frames` is each
    face's frame, which is `photolib.people.name` read the other way and is built
    once from the catalog rather than parsed out of a key here.

    A frame with no face reaching the floor is simply absent, and `splits` reads the
    absence as the empty set: nobody was read there, which nests into anything.
    """
    where: dict[str, set[str]] = {}
    for person, group in faces_of.items():
        for face in group:
            if face in frames:
                where.setdefault(frames[face], set()).add(person)
    return {frame: frozenset(who) for frame, who in where.items()}


def splits(
    members: Mapping[str, Sequence[str]], who: Mapping[str, frozenset[str]]
) -> Split:
    """The stacks the rule would split, and the ones where every frame holds somebody.

    `members` is the walk read from `stack_member` -- each stack's frames -- and a
    stack of one frame is not a question: the rule only ever splits, so a stack with
    nothing to split from is never in either list.

    **Every frame holds somebody** means every member's people set is non-empty at
    the floor. It is the qualifier that takes ADR 0004's nobody clause out of the
    measurement, so what is left is what a clustering could change.
    """
    split, everybody, frames = [], [], 0
    for stack, group in sorted(members.items()):
        if len(group) < 2:
            continue
        sets = [who.get(frame, frozenset()) for frame in group]
        if nests(sets):
            continue
        split.append(stack)
        frames += len(group)
        if all(sets):
            everybody.append(stack)
    return Split(tuple(split), tuple(everybody), frames)


def holding(
    members: Mapping[str, Sequence[str]], who: Mapping[str, frozenset[str]]
) -> int:
    """The multi-frame stacks holding anybody at all, which is where the rule looks.

    Printed because it is the scale of everything below: on this catalog the rule is
    a no-op on nine stacks in ten, so whatever it costs or buys is concentrated in a
    small population and a rate over all of them would say nothing.
    """
    return sum(
        1
        for group in members.values()
        if len(group) > 1 and any(who.get(frame) for frame in group)
    )


# --- what a looser clustering joined --------------------------------------------


def joined(
    faces_of: Mapping[str, frozenset[str]], looser: Mapping[str, str]
) -> dict[str, frozenset[str]]:
    """Each of the looser clustering's persons that drew faces from more than one.

    `harness.recluster.crossed` asks this as a yes-or-no, because there it is a
    check that a tighter clustering is a refinement of the standing one and a
    crossing means the report's counts are not what they claim. Here a join is the
    thing being measured rather than a warning about it, so the standing persons
    themselves are returned: which answers have landed together is the whole of what
    the cost below reads.
    """
    standing_of = {face: person for person, group in faces_of.items() for face in group}
    drawn: dict[str, set[str]] = {}
    for face, person in looser.items():
        if face in standing_of:
            drawn.setdefault(person, set()).add(standing_of[face])
    return {
        person: frozenset(from_) for person, from_ in drawn.items() if len(from_) > 1
    }


def contest(
    groups: Mapping[str, frozenset[str]], given: Mapping[str, str]
) -> Contested:
    """What the joins put in question, over the answers the reader has given.

    An unjudged person joining anything costs nothing that can be counted here: the
    reader has said nothing about them, and `harness.people.DEFAULT` is what the
    rule reads instead. So only a join holding two judged persons is a cost, and it
    is a cost of a stated size -- one verdict now standing where two answers were
    given.
    """
    friends, opposed, flagged = set(), set(), set()
    for person, from_ in groups.items():
        judged = {one: given[one] for one in from_ if one in given}
        if len(judged) < 2:
            continue
        said = set(judged.values())
        if "friend" in said and "stranger" in said:
            opposed.add(person)
        friends |= {one for one, verdict in judged.items() if verdict == "friend"}
        flagged |= {one for one, verdict in judged.items() if verdict == FLAGGED}
    return Contested(
        tuple(sorted(friends)), tuple(sorted(opposed)), tuple(sorted(flagged))
    )


def measure(
    threshold: float,
    faces_of: Mapping[str, frozenset[str]],
    looser: Mapping[str, str],
    given: Mapping[str, str],
    members: Mapping[str, Sequence[str]],
    frames: Mapping[str, str],
    shares: Mapping[str, float],
    standing: Sequence[str] = (),
) -> Row:
    """One row of the sweep: what the rule would do here, and what it would contest.

    `standing` is the subject at the threshold the pass stands at, so that `bought`
    and `lost` are named stacks rather than a difference of two counts: a value that
    fixed four stacks and broke four would otherwise read as having done nothing.

    The cost is measured twice from one set of joins -- see `Row` -- and the floor
    that decides the second is applied by `harness.recluster`'s own functions, so
    this report and that one cannot come to disagree about which persons it admits.
    """
    split = splits(members, peopled(above(held(looser), shares), frames))
    groups = joined(faces_of, looser)
    subject = set(standing)
    reach = persons_at_floor(above(faces_of, shares))
    return Row(
        threshold=threshold,
        persons=len(set(looser.values())),
        split=split,
        contested=contest(groups, given),
        at_floor=contest(
            groups, {one: said for one, said in given.items() if one in reach}
        ),
        bought=tuple(sorted(subject - set(split.everybody))),
        lost=tuple(sorted(set(split.everybody) - subject)) if subject else (),
        joins=len(groups),
    )


def recommend(rows: Sequence[Row]) -> float | None:
    """The threshold to loosen to, or None for *change nothing*.

    **Worth moving to when it buys back more stacks than it contests friends**, and
    the tightest such value where several qualify, because a smaller move is a
    smaller change to the population -- `harness.recluster.recommend`'s rule with
    the direction turned round.

    What it buys is the stacks it stops splitting **net of the ones it starts**.
    Merging persons is a coarsening and a coarsening preserves supersets, so a
    looser value should never split a stack the standing one held together; netting
    them is the check that it did not, rather than the assumption, and it costs
    nothing where `lost` is empty.

    **The cost read is the one at the floor**, which is `harness.recluster`'s rule:
    a judged person whose every box is under `photolib.people.FLOOR` is in no frame's
    people, so no clustering of them moves a stack and counting them would price a
    contradiction the grid cannot feel.

    Only values below the standing one are in the running. A tighter threshold
    splits more and can only make this subject worse, and whether it is worth it for
    the other subject is the question `harness.recluster` already answered; a
    recommendation made here from an upward row would be answering it again with the
    wrong evidence.

    None where nothing qualifies, and that is a finding this report exists to be
    able to return rather than a failure to choose -- `harness.floor` and
    `harness.recluster` have each returned it.
    """
    qualifying = [
        one.threshold
        for one in rows
        if one.threshold < STANDING
        and len(one.bought) - len(one.lost) > len(one.at_floor.friends)
    ]
    return max(qualifying) if qualifying else None


# --- the report -----------------------------------------------------------------


def table(rows: Sequence[Row]) -> list[str]:
    """The sweep, as a table. The two counts stay in two columns."""
    lines = [
        "\nsweep     the rule at each clustering. `split` is the stacks with no member"
        " whose people contain every other member's; `everybody` is the ones where"
        " every frame holds somebody, which is the part a threshold can reach.",
        "          `contested` is the judged friends sharing a person with another"
        " judged person, over every judged cluster and then over the ones reaching"
        " the floor -- the population the rule reads. Never totalled with `bought`.",
        "            threshold   persons   split   everybody   bought   lost"
        "   contested   at the floor   opposed",
    ]
    for one in rows:
        here = " <- standing" if one.threshold == STANDING else ""
        lines.append(
            f"            {one.threshold:>9.3f}   {one.persons:>7,}"
            f"   {len(one.split.stacks):>5,}   {len(one.split.everybody):>9,}"
            f"   {len(one.bought):>6,}   {len(one.lost):>4,}"
            f"   {len(one.contested.friends):>9,}"
            f"   {len(one.at_floor.friends):>12,}"
            f"   {len(one.contested.opposed):>7,}{here}"
        )
    return lines


def named(stacks: Sequence[str], most: int = 6) -> list[str]:
    """Some of a population's stacks, and how many are not shown.

    `harness.floor.named`'s job one level up: the reader has a stack in mind and the
    only way to answer *does this move mine* is to print the names. A stack is named
    by its earliest member's sha256, which is what `photolib.membership` writes and
    what the grid groups on.
    """
    lines = [f"              {stack}" for stack in sorted(stacks)[:most]]
    if len(stacks) > most:
        lines.append(f"              and {len(stacks) - most} more")
    return lines


def report(
    rows: Sequence[Row],
    stacks: int,
    multi: int,
    anybody: int,
    cuts: Sequence[Row] = (),
) -> list[str]:
    """What the sweep says about the rule, and whether it says anything.

    The scale leads, because it decides whether everything under it is a change to
    the grid or a rounding error: the rule is a no-op on every stack holding nobody,
    and on this catalog that is most of them.
    """
    standing = rows[0]
    lines = [
        f"rule      {multi:,} of the {stacks:,} stacks hold more than one frame and are"
        f" the only ones the rule can split. {anybody:,} of those hold anybody at all"
        f" at the floor of {PROVISIONAL}, so it is a no-op on the other"
        f" {multi - anybody:,}.",
        f"          at the threshold the pass stands at it would split"
        f" {len(standing.split.stacks):,} of them, holding {standing.split.frames:,}"
        f" frames. {len(standing.split.everybody):,} of those splits are stacks where"
        " **every frame holds somebody**, and that is the subject of the sweep below:"
        " a ceiling on what any clustering could buy, rather than a count of"
        " clustering errors.",
        "          the rest hold a frame with nobody read in it, which nests into"
        " anything: they are the rule meeting a mixed run, and ADR 0004's nobody"
        " clause -- a body's answer, which no threshold here moves -- is deliberately"
        " not simulated.",
    ]
    if not standing.split.everybody:
        lines.append(
            "\nnothing to measure: no stack splits with every frame holding somebody,"
            " so there is no clustering failure here for a looser threshold to buy"
            " back."
        )
        return lines

    lines += table(rows)
    lines += _bought(rows)
    lines += _answers(rows)
    lines += _finding(rows)
    lines += _cut(cuts, standing)
    return lines


def _bought(rows: Sequence[Row]) -> list[str]:
    """Where each split stack turns, tightest value first.

    **What a value newly buys and not everything it has bought.** Each looser value
    recovers a superset of the one above it, so listing them whole would print the
    same stack five times and bury the line the reader is looking for: the question
    a name answers here is *at what value does mine stop splitting*, and that is the
    first row it appears in.
    """
    looser = sorted(
        (one for one in rows if one.threshold < STANDING and one.bought),
        key=lambda one: -one.threshold,
    )
    if not looser:
        return []
    lines = [
        "\nbought    where each split stack turns -- the value it stops splitting at,"
        " so a reader with a case in mind can find theirs:"
    ]
    seen: set[str] = set()
    for one in looser:
        fresh = set(one.bought) - seen
        seen |= set(one.bought)
        if fresh:
            lines.append(f"            {one.threshold:.3f}")
            lines += named(sorted(fresh))
    return lines


def _answers(rows: Sequence[Row]) -> list[str]:
    """What the reader's answers can and cannot say about a merge.

    **The one contradiction the labels could show is a friend and a stranger inside
    one person**, and this says whether any value produced one. It is worth printing
    either way, because zero here is not the same as *loosening is free*: the reader
    was never asked whether two clusters are the same human -- that answer does not
    exist in `person_verdict` -- so a merge of two friends is unpriced rather than
    priced at nothing, and the `friends contested` column is what a move puts in
    question and not a count of mistakes.
    """
    opposed = [one for one in rows if one.contested.opposed]
    lines = ["\nanswers   "]
    if opposed:
        first = max(opposed, key=lambda one: one.threshold)
        lines[0] += (
            f"the first value that puts a friend and a stranger inside one person is"
            f" {first.threshold:.3f}, where {len(first.contested.opposed):,} person(s)"
            " hold both. That is the one contradiction these answers can show, and"
            " below it the two verdicts cannot both stand."
        )
    else:
        lines[0] += (
            "**no value swept puts a friend and a stranger inside one person.** That"
            " is the one contradiction these answers can show, and none of them"
            " showed it."
        )
    lines.append(
        "          it is not the same as loosening being free. The reader was never"
        " asked whether two clusters are the same human -- `person_verdict` has no"
        " such answer -- so two friends merging is unpriced rather than priced at"
        " nothing, and `friends contested` counts answers put in question and not"
        " mistakes made."
    )
    return lines


def _finding(rows: Sequence[Row]) -> list[str]:
    """The recommendation, and its reason either way."""
    moving = recommend(rows)
    loosest = min(rows, key=lambda one: one.threshold)
    standing = rows[0]
    if moving is None:
        return [
            "\nfinding   **no looser threshold** buys back more of the split stacks"
            " than it puts the reader's own answers in question.",
            f"          and the subject survives the knob: at {loosest.threshold:.3f},"
            f" where {standing.persons:,} persons become {loosest.persons:,},"
            f" {len(loosest.split.everybody):,} of the"
            f" {len(standing.split.everybody):,} still split, for"
            f" {len(loosest.at_floor.friends):,} friends contested at the floor.",
            f"          the recommendation is to keep the threshold where it stands,"
            f" {STANDING}, and to write no new population. What"
            " [#56](https://github.com/chrisJuresh/photos/issues/56) needs is a guard"
            " on the rule, not a different clustering under it.",
        ]
    row = next(one for one in rows if one.threshold == moving)
    return [
        f"\nfinding   a threshold of {moving:.3f} **buys back more stacks than it"
        f" contests answers**: {len(row.bought):,} of the"
        f" {len(standing.split.everybody):,} split stacks stop splitting, against"
        f" {len(row.at_floor.friends):,} judged friend(s) reaching the floor that now"
        " share a person with somebody else the reader judged.",
        f"          `python -m photolib.people --threshold {moving}` writes that"
        " population beside the standing one, and it is a population and not a move:"
        " the threshold is part of `face_person`'s key.",
    ]


def _cut(cuts: Sequence[Row], standing: Row) -> list[str]:
    """Whether the size cut changes the answer, priced rather than assumed.

    `photolib.people.CUT` is where the pass stands and the catalog does not hold
    that population yet, so the sweep above is over the uncut clusters -- the ones
    every answer in `labels.sqlite3` was given about. This is the check that the
    uncut population is not answering a different question from the one the pass
    would ask.
    """
    if not cuts:
        return []
    lines = [
        f"\ncut       the same subject over the faces reaching {CUT}, which is where"
        f" `photolib.people.CUT` stands. The sweep above is the uncut population,"
        " because that is the one the reader's answers were given about and the only"
        " one this catalog holds.",
        "            threshold   persons   split   everybody",
    ]
    for one in cuts:
        lines.append(
            f"            {one.threshold:>9.3f}   {one.persons:>7,}"
            f"   {len(one.split.stacks):>5,}   {len(one.split.everybody):>9,}"
        )
    at_standing = next(
        (one for one in cuts if one.threshold == STANDING), None
    )
    if at_standing is not None:
        moved = len(at_standing.split.everybody) - len(standing.split.everybody)
        lines.append(
            f"          the cut moves the subject by {moved:+,} stacks at the standing"
            + (
                " threshold, so the population is not what decides what this report"
                " returns."
                if not moved
                else " threshold, which is a move: the sweep above is the uncut"
                " population and this one would have to be swept in its own right"
                " before either is read as the answer."
            )
        )
    return lines


# --- running it -----------------------------------------------------------------


def sweep(
    stored: Mapping[str, np.ndarray],
    faces_of: Mapping[str, frozenset[str]],
    shares: Mapping[str, float],
    given: Mapping[str, str],
    members: Mapping[str, Sequence[str]],
    frames: Mapping[str, str],
) -> list[Row]:
    """Every candidate threshold, from one clustering each.

    The standing row is computed first and is what every other row's `bought` and
    `lost` are named against, so a value that fixed four stacks and broke four reads
    as what it is rather than as having changed nothing.
    """
    rows: list[Row] = []
    for value in SWEEP:
        started = time.perf_counter()
        looser = cluster(stored, value)
        rows.append(
            measure(
                value,
                faces_of,
                looser,
                given,
                members,
                frames,
                shares,
                rows[0].split.everybody if rows else (),
            )
        )
        print(
            f"          {value:.3f}  {rows[-1].persons:,} persons"
            f"  ({time.perf_counter() - started:.0f}s)",
            flush=True,
        )
    return rows


def cutting(
    stored: Mapping[str, np.ndarray],
    faces_of: Mapping[str, frozenset[str]],
    shares: Mapping[str, float],
    given: Mapping[str, str],
    members: Mapping[str, Sequence[str]],
    frames: Mapping[str, str],
) -> list[Row]:
    """The standing threshold and the loosest swept, over the faces reaching the cut.

    Two rows and not the whole sweep: the question is whether the cut moves the
    subject at all, and the two ends of the range answer it for the cost of two
    clusterings.
    """
    surviving = reaching(shares, CUT)
    kept = {face: vector for face, vector in stored.items() if face in surviving}
    rows = []
    for value in (STANDING, min(SWEEP)):
        started = time.perf_counter()
        rows.append(
            measure(
                value, faces_of, cluster(kept, value), given, members, frames, shares
            )
        )
        print(
            f"          {value:.3f}  {rows[-1].persons:,} persons"
            f"  ({time.perf_counter() - started:.0f}s)",
            flush=True,
        )
    return rows


def main(argv: list[str] | None = None) -> int:
    # No arguments and the sweep is not a knob -- `harness.screen`'s reason, and
    # `harness.recluster`'s: the report exists to answer whether a looser clustering
    # helps at all, and every flag would let it be asked something narrower.
    argparse.ArgumentParser(
        prog="python -m harness.nesting", description=__doc__.splitlines()[0]
    ).parse_args(argv)

    config = load()
    labels_db = config.catalog_db.parent / label.LABELS
    if not labels_db.exists():
        print(f"no labels at {labels_db}: run python -m harness.label first")
        return 1

    clustering = people.Clustering(MODEL, VERSION, STANDING, POPULATION)
    labels = screen.labels_read_only(labels_db)
    try:
        given = people.verdicts(labels, clustering)
    finally:
        labels.close()

    conn = candidates.catalog(config.catalog_db, read_only=True)
    try:
        stored = vectors(conn)
        held_by_person = people.found(conn, clustering)
        walk = people.membership(conn)
    finally:
        conn.close()

    if not held_by_person:
        print(
            f"no persons in {config.catalog_db} at {MODEL} version {VERSION},"
            f" threshold {STANDING}, cut {POPULATION}: run"
            f" python -m photolib.people --cut {POPULATION} first"
        )
        return 1
    if not walk:
        print(
            f"no stack assignment in {config.catalog_db} at {STACK_SETTING}: run"
            " python -m photolib.membership first. Without it every frame is its own"
            " stack, the rule has nothing to split, and there is nothing to price."
        )
        return 1

    faces_of = {
        person: frozenset(name(face.sha256, face.idx) for face in faces)
        for person, faces in held_by_person.items()
    }
    shares = {
        name(face.sha256, face.idx): face.share
        for faces in held_by_person.values()
        for face in faces
    }
    frames = {
        name(face.sha256, face.idx): face.sha256
        for faces in held_by_person.values()
        for face in faces
    }
    members: dict[str, list[str]] = {}
    for sha256, stack in walk.items():
        members.setdefault(stack, []).append(sha256)
    multi = sum(1 for group in members.values() if len(group) > 1)
    anybody = holding(members, peopled(above(faces_of, shares), frames))

    print(f"catalog     {config.catalog_db}")
    print(f"labels      {labels_db}")
    print(
        f"clustering  {MODEL} version {VERSION}, threshold {STANDING},"
        f" cut {POPULATION} -- {len(held_by_person):,} persons, {len(stored):,} faces"
    )
    print(f"floor       {PROVISIONAL} of the frame's height, read here and not moved")
    print(f"stacks      {len(members):,} at {STACK_SETTING}")
    print(f"judged      {len(given):,} persons the reader has answered about")
    # Not a refusal, which is where this differs from `harness.floor` and
    # `harness.recluster`: their whole subject is the answers, and this report's is a
    # count over stacks that needs none. Without answers the benefit is still
    # measured and only the cost columns are empty, which is worth saying rather than
    # printing zeros that read like a finding.
    if not given:
        print(
            "            nothing has been answered at this clustering, so the cost"
            " columns below are empty rather than zero. `python -m harness.label"
            " --open` in its people mode is where they come from."
        )
    print("sweeping    thresholds, loosest first, from where it stands:")
    rows = sweep(stored, faces_of, shares, given, members, frames)

    # The standing row's own check, and the reason the sweep starts there: a
    # clustering computed here at the stored threshold must be the stored
    # assignment, or every count below is describing something the pass does not do.
    # Equal person counts and no join between them is a bijection, so the two
    # partitions are the same one -- `harness.recluster`'s check by its other half.
    same = rows[0].persons == len(faces_of) and not rows[0].joins
    print(
        f"            the standing row {'reproduces' if same else 'DOES NOT reproduce'}"
        f" the stored assignment's {len(faces_of):,} persons"
    )
    print(f"cutting     the same subject over the faces reaching {CUT}:")
    cuts = cutting(stored, faces_of, shares, given, members, frames)
    print(
        *report(rows, len(members), multi, anybody, cuts),
        sep="\n",
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
