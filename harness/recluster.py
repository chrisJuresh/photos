"""What a tighter clustering is worth, priced against the answers the reader gave.

`docs/adr/0004-people-veto-a-stack.md` gave the reader a fourth answer -- `two-people`,
*this cluster is obviously two individuals* -- so that a clustering failure would be
**visible** instead of being forced into a judgement about somebody. One sitting later
that column is the evidence it was put there to produce: **69 of the 202 persons
answered came back flagged**, a third of everything the reader was shown, and every one
of them is a question they cannot answer as asked.

**This is the measurement that decides what to do about it, and it is not the pass.**
`face` holds the embedding and `face_person` the assignment, keyed by the threshold and the
size cut, so another value of either is another population and re-clustering re-detects
nothing -- which is
what makes the threshold a knob rather than a rebuild. Every row here is read from the
stored vectors and the clustering is `photolib.people.cluster` itself, imported rather
than reproduced, so what is priced is what a pass would write. **Nothing is written**:
both connections are opened read-only and no threshold is moved, which is
`harness.floor`'s and `harness.screen`'s posture kept whole.

**The threshold is a similarity and the first sweep therefore runs upwards.**
`face_person`'s threshold is the cosine at or above which two faces are one person, so a
*lower* value merges more and a *higher* one merges less. Ticket 71 asks for "a sweep of
thresholds below 0.363", which is the direction that would make *that* failure worse; the
first sweep runs from the standing value up, because coming apart is what it measures.

**And a second sweep runs downwards, on evidence that did not exist when the first was
written.** `two-people` marks a cluster holding two humans and says nothing at all about
one human split in two, so a loosening could only ever be scored on the damage it does --
which is how this report came to conclude the knob was the wrong one. The harness's third
mode collects the other side: the reader looking at two clusters and saying whether they
are one human, over the pairs torn across a stack ADR 0004's nesting rule would split.
`harness.same.scored` reads those answers and the table below prices every looser value
against them, **rejoined and wrongly merged apart and never totalled** -- the same rule
the two counts above obey, for the same reason. It runs only when there are answers to
run it on, so a reader who has never opened that mode pays nothing for it.

## The two things it counts, kept apart

**A flagged cluster coming apart** is the failure being fixed. **A judged friend coming
apart** is the reader's own answer being contradicted: they have said that cluster is one
individual, and one individual reading as two persons is a frame's people set that no
longer nests, which is a stack split wrongly. So the two counts are reported apart and
never totalled -- `harness.floor`'s rule, for its reason -- and the recommendation is
made from the exchange between them: **a threshold is worth moving to when it takes more
flagged clusters apart than it breaks answered friends**, and where none does the
recommendation is to change nothing.

## Measured where the rule can feel it

A face under `photolib.people.FLOOR` is in no frame's people, so a person made only of
such faces cannot move a stack whatever any clustering says about them. The sweep is
therefore reported twice -- over every judged cluster, which is the population the reader
was shown, and over **the clusters that reach the floor**, which is the population the
nesting rule reads -- and the recommendation is made from the second. A report that
counted all 69 equally would price a failure the grid cannot feel.

## The other knob, answered with numbers and not taken

Ticket 71 asks whether the small detections should be dropped by a size cut rather than
re-clustered, and says changing the detector is not its business. So the last table
prices a cut on the *stored share* -- `FLOOR`'s kind of number and not the detector's --
by clustering only the faces that reach it. It was a measurement and not a proposal, and
the proposal it lost to is ticket 74: `photolib.people.CUT` is that column of
`face_person`'s key and `reaching` is this predicate, read from there rather than kept
here. So the table still prices every value the pass could be pointed at, and the row it
recommends is the one the pass now stands at.

    python -m harness.recluster

It reads the catalog and `labels.sqlite3`, both on the NVMe, opens no substrate and never
touches `G:`. It clusters, which is a matrix multiply over 8,000 vectors once per row of
each table, so it takes a minute or two of CPU and no disk to speak of.
"""

from __future__ import annotations

import argparse
import sys
import time
from collections.abc import Collection, Iterable, Mapping, Sequence
from dataclasses import dataclass

import numpy as np

from harness import label, people, same, screen
from harness.people import JUDGED
from photolib import candidates
from photolib.config import load
from photolib.people import (
    CUT,
    FLOOR,
    MODEL,
    NO_CUT,
    THRESHOLD,
    VERSION,
    cluster,
    name,
    reaching,
    vectors,
)

# Read from `photolib.people` and never copied, for `harness.floor.PROVISIONAL`'s
# reason: the report prices a move away from where the pass stands, so it has to
# read where the pass stands.
STANDING = THRESHOLD
PROVISIONAL = FLOOR

# The candidate thresholds, and **not a knob** -- `harness.screen`'s reasoning. The
# first is the standing value, so the table's first row is the population the reader
# was shown and every count below it is a count of a move away from that. Upwards
# from there, because the threshold is a similarity: see the module docstring.
SWEEP = (STANDING, 0.40, 0.425, 0.45, 0.475, 0.50, 0.55, 0.60)

# The candidate thresholds below where it stands, and not a knob either. The
# standing value is first and is the control: these pairs are two persons in the
# population they were drawn from, so a clustering that reproduces it must rejoin
# nothing and merge nothing. Downwards from there, because the threshold is a
# similarity and rejoining is what is being measured -- `SWEEP`'s reasoning turned
# round, on evidence `SWEEP` did not have.
LOOSENING = (STANDING, 0.34, 0.32, 0.30, 0.28, 0.25)

# The candidate size cuts, in shares of the frame's height. Zero is *no cut*, which
# is the standing population again; `photolib.people.CUT` is the value this table
# recommended and the pass now stands at; and the last is the prominence floor itself
# -- the value at which the clustering would read exactly the faces the rule does.
# Sorted and deduplicated rather than written out, because two of the six are read
# from `photolib.people` and a later move of either would otherwise price one value
# twice and print the table out of the order a reader scans it in.
CUTS = tuple(sorted({0.0, CUT, 0.03, 0.04, 0.05, PROVISIONAL}))

# The flagged clusters are the subject: they are the only ones anybody has said
# anything about, and a sweep scored over every person would be a report about
# cluster counts rather than about the failure.
FLAGGED = "two-people"


@dataclass(frozen=True)
class Came:
    """What one clustering did to one population of clusters.

    Three outcomes and not two, because a cut and a threshold fail differently. A
    cluster that **came apart** is what was wanted; one still **whole** is the
    failure surviving; one **gone** has no face left at all, which is not one person
    and not a question either -- counting it as whole would report a cut as having
    failed exactly where it worked.

    `parts` is how many persons the ones that came apart became, in total: user
    story 1 asks into how many, because a cluster that is really four passers-by is
    answerable when it becomes four and not when it becomes two.
    """

    apart: tuple[str, ...]
    whole: tuple[str, ...]
    gone: tuple[str, ...]
    parts: int

    @property
    def subjects(self) -> int:
        return len(self.apart) + len(self.whole) + len(self.gone)


@dataclass(frozen=True)
class Row:
    """One threshold's answer, over one population of subjects."""

    threshold: float
    persons: int
    flagged: Came
    friends: Came
    crossings: int


@dataclass(frozen=True)
class Cut:
    """One size cut's answer, at the standing threshold."""

    value: float
    faces: int
    persons: int
    flagged: Came
    friends: Came
    dropped: int


@dataclass(frozen=True)
class Looser:
    """One looser threshold's answer, scored against the pair verdicts.

    `persons` rides along because it is what says how large a move this is: a value
    that halves the population is a different proposition from one that merges four
    clusters, whatever it buys.
    """

    threshold: float
    persons: int
    joined: same.Rejoining


@dataclass(frozen=True)
class Subject:
    """One judged cluster: what the reader said, its boxes, and what it can move.

    `touches` is the stacks the verdict could split counted over every face of the
    person and `reach` the same counted over the faces that clear the floor. Both,
    because the gap between them is how much of the flagged clusters' apparent
    damage the rule can actually feel.
    """

    person: str
    verdict: str
    shares: tuple[float, ...]
    touches: int
    reach: int


# --- what a clustering holds ---------------------------------------------------


def held(assignment: Mapping[str, str]) -> dict[str, frozenset[str]]:
    """Each person's own faces, from an assignment of faces to persons.

    The seam every measurement here is over. A clustering is stored, and returned by
    `photolib.people.cluster`, as a face's person; every question asked of it below
    is about a person's faces.
    """
    faces: dict[str, set[str]] = {}
    for face, person in assignment.items():
        faces.setdefault(person, set()).add(face)
    return {person: frozenset(group) for person, group in faces.items()}


def above(
    faces_of: Mapping[str, frozenset[str]],
    shares: Mapping[str, float],
    floor: float = PROVISIONAL,
) -> dict[str, frozenset[str]]:
    """Each person's faces that reach the floor -- the only ones the rule reads.

    A box counts at or above the floor and not below it, which is
    `harness.floor.sets`' own `share >= value`, read here so the two cannot come to
    disagree about what the floor admits.
    """
    return {
        person: frozenset(
            face for face in group if shares.get(face, 0.0) >= floor
        )
        for person, group in faces_of.items()
    }


def reaching(faces_of: Mapping[str, frozenset[str]]) -> set[str]:
    """The persons with any face left, which after `above` is: any that reach it."""
    return {person for person, group in faces_of.items() if group}


# --- what a tighter clustering did ---------------------------------------------


def came(
    faces_of: Mapping[str, frozenset[str]],
    tighter: Mapping[str, str],
    subjects: Iterable[str],
) -> Came:
    """Where each subject's faces landed in another clustering.

    Pure over two clusterings and a list of names -- no vector, no database and no
    model -- which is what makes the reader's flagged clusters assertable as
    arithmetic rather than as a browsing session.
    """
    apart, whole, gone, parts = [], [], [], 0
    for person in sorted(subjects):
        landed = {
            tighter[face] for face in faces_of.get(person, frozenset()) if face in tighter
        }
        if not landed:
            gone.append(person)
        elif len(landed) > 1:
            apart.append(person)
            parts += len(landed)
        else:
            whole.append(person)
    return Came(tuple(apart), tuple(whole), tuple(gone), parts)


def crossed(
    faces_of: Mapping[str, frozenset[str]], tighter: Mapping[str, str]
) -> list[str]:
    """The tighter clustering's persons drawing faces from more than one standing one.

    Complete linkage builds a nested dendrogram, so raising the threshold should only
    ever split. This is the check that it did rather than the assumption: a crossing
    means the two clusterings are not one refining the other, and then a `parts`
    count is not the number it claims to be.
    """
    standing_of = {
        face: person for person, group in faces_of.items() for face in group
    }
    drawn: dict[str, set[str]] = {}
    for face, person in tighter.items():
        if face in standing_of:
            drawn.setdefault(person, set()).add(standing_of[face])
    return sorted(person for person, from_ in drawn.items() if len(from_) > 1)


def by_verdict(given: Mapping[str, str], verdict: str) -> set[str]:
    """The persons the reader gave one answer about."""
    return {person for person, said in given.items() if said == verdict}


def measure(
    threshold: float,
    faces_of: Mapping[str, frozenset[str]],
    tighter: Mapping[str, str],
    given: Mapping[str, str],
) -> Row:
    """One row of the sweep: what this clustering did to each judged population."""
    return Row(
        threshold=threshold,
        persons=len(set(tighter.values())),
        flagged=came(faces_of, tighter, by_verdict(given, FLAGGED)),
        friends=came(faces_of, tighter, by_verdict(given, "friend")),
        crossings=len(crossed(faces_of, tighter)),
    )


def recommend(rows: Sequence[Row]) -> float | None:
    """The threshold to move to, or None for *change nothing*.

    **Worth moving to when it takes more flagged clusters apart than it breaks
    answered friends**, and the loosest such value where several qualify, because a
    smaller move is a smaller change to the population.

    The standing value cannot qualify: nothing has come apart at it by definition --
    it is the threshold the flagged clusters were flagged at -- so it falls out of
    the running rather than being returned as a move.

    None where nothing qualifies, and that is the finding this report exists to be
    able to return rather than a failure to choose. A friend that came apart is the
    reader's own answer being contradicted; a value that does more of that than it
    fixes is not an improvement however many clusters it splits.
    """
    qualifying = [
        one.threshold
        for one in rows
        if one.threshold != STANDING
        and len(one.flagged.apart) > len(one.friends.apart)
    ]
    return min(qualifying) if qualifying else None


# --- what a looser clustering rejoins ------------------------------------------


def loosen(rows: Sequence[Looser]) -> float | None:
    """The looser threshold to move to, or None for *change nothing*.

    **Worth moving to when it rejoins more humans the reader called one than it
    merges humans they called two**, which is `recommend`'s exchange pointed the
    other way: the two counts are different failures and neither cancels the other,
    so the recommendation is made from the trade between them and never from a total.

    The **tightest** such value where several qualify, which is `recommend`'s "a
    smaller move is a smaller change to the population" in this direction: coming
    down from the standing value, the smallest move is the largest number.

    The standing value cannot qualify: by construction every judged pair is two
    persons there -- that is the population they were drawn from -- so it rejoins
    nothing and falls out of the running rather than being returned as a move.

    None where nothing qualifies, and that is a finding rather than a failure to
    choose. `harness.floor` and this module's own upward sweep have both returned
    one, and a knob moved on evidence that does not support it costs the sitting
    twice.
    """
    qualifying = [
        one.threshold
        for one in rows
        if one.threshold != STANDING
        and len(one.joined.rejoined) > len(one.joined.merged)
    ]
    return max(qualifying) if qualifying else None


# --- the size cut, priced and now the pass's own -------------------------------


def dropped(
    faces_of: Mapping[str, frozenset[str]],
    subjects: Collection[str],
    surviving: Collection[str],
) -> int:
    """How many of one population's faces a cut takes away.

    Counted in faces and not in persons because that is what a cut costs the
    *montage*: a friend with six faces and two left is still one question, drawn
    from less.
    """
    return sum(
        1
        for person in subjects
        for face in faces_of.get(person, frozenset())
        if face not in surviving
    )


def price(
    value: float,
    faces_of: Mapping[str, frozenset[str]],
    tighter: Mapping[str, str],
    given: Mapping[str, str],
    surviving: Collection[str],
) -> Cut:
    """One row of the cut table: what dropping the small faces did."""
    return Cut(
        value=value,
        faces=len(surviving),
        persons=len(set(tighter.values())),
        flagged=came(faces_of, tighter, by_verdict(given, FLAGGED)),
        friends=came(faces_of, tighter, by_verdict(given, "friend")),
        dropped=dropped(faces_of, by_verdict(given, "friend"), surviving),
    )


# --- the report ----------------------------------------------------------------


def distribution(shares: Sequence[float]) -> str:
    """The shape of one population's box shares, in one line.

    `harness.floor.distribution`'s figures, over the same stored column, because the
    mechanism this report is about is a size: the flagged clusters' boxes are the
    strangers' size rather than the friends'.
    """
    if not shares:
        return "nothing judged"
    held_ = np.asarray(shares)
    quartiles = np.percentile(held_, (25, 50, 75))
    return (
        f"{len(held_):,} boxes, median {quartiles[1]:.3f},"
        f" quartiles {quartiles[0]:.3f}/{quartiles[2]:.3f},"
        f" from {held_.min():.3f} to {held_.max():.3f}"
    )


def table(rows: Sequence[Row], what: str) -> list[str]:
    """One sweep, as a table. The two counts stay in two columns."""
    lines = [
        f"\n{what}",
        "            threshold   persons   flagged apart   parts"
        "   friends apart   parts",
    ]
    for one in rows:
        here = " <- standing" if one.threshold == STANDING else ""
        lines.append(
            f"            {one.threshold:>9.3f}   {one.persons:>7,}"
            f"   {len(one.flagged.apart):>4,} of {one.flagged.subjects:<6,}"
            f"   {one.flagged.parts:>5,}"
            f"   {len(one.friends.apart):>4,} of {one.friends.subjects:<6,}"
            f"   {one.friends.parts:>5,}{here}"
        )
    return lines


def named(persons: Sequence[str], most: int = 8) -> list[str]:
    """Some of a population's persons, and how many are not shown.

    `harness.floor.named`'s job: a count says a value is wrong and the persons
    behind it say why. Sorted rather than ranked, because there is no *worst* here
    -- a cluster is one person or it is not.
    """
    lines = [f"              {person}" for person in sorted(persons)[:most]]
    if len(persons) > most:
        lines.append(f"              and {len(persons) - most} more")
    return lines


def report(
    every: Sequence[Row],
    reads: Sequence[Row],
    subjects: Sequence[Subject],
    cuts: Sequence[Cut] = (),
    looser: Sequence[Looser] = (),
) -> list[str]:
    """What the answers say about re-clustering, and whether they say anything.

    The subject leads -- how big the flagged clusters' boxes are and how many of them
    reach the floor at all -- because those two numbers decide whether the sweep
    below is a choice or a curiosity.
    """
    flagged = [one for one in subjects if one.verdict == FLAGGED]
    friends = [one for one in subjects if one.verdict == "friend"]
    strangers = [one for one in subjects if one.verdict == "stranger"]
    lines = [
        f"flagged   {len(flagged):,} clusters the reader called two people",
        f"          {distribution([share for one in flagged for share in one.shares])}",
        f"friends   {distribution([share for one in friends for share in one.shares])}",
        f"strangers {distribution([share for one in strangers for share in one.shares])}",
    ]
    if not flagged:
        lines.append(
            "\nnothing to measure: no cluster has been called two people."
            " `python -m harness.label --open` in its people mode is where that"
            " happens."
        )
        return lines

    # Whether a box reaches the floor, and deliberately not whether the person has a
    # splittable stack: those are two different facts, and the one this line is about
    # is the floor. A cluster with a large box and no splittable stack is inside the
    # population the rule reads and changes nothing there yet.
    reach = [one for one in flagged if one.shares and max(one.shares) >= PROVISIONAL]
    lines += [
        f"\nfloor     {PROVISIONAL} of the frame's height, read here and not moved."
        f" {len(reach):,} of the {len(flagged):,} flagged clusters reach the floor,"
        f" so the rule can feel that many.",
        f"          their {sum(one.touches for one in flagged):,} stack-touches are"
        f" {sum(one.reach for one in flagged):,} counted over the boxes that reach it;"
        " the rest are already vetoed, whatever they hold.",
    ]
    if not reach:
        lines.append(
            "          every flagged cluster is under the floor, so no clustering of"
            " them changes a stack and there is nothing here to buy."
        )

    lines += table(
        every, "sweep     every judged cluster -- the population the reader was shown"
    )
    lines += table(
        reads,
        "sweep     the clusters that reach the floor -- the population the rule reads",
    )
    # Over `every` alone: `reads` measures the same clusterings against a narrower set
    # of subjects, so summing both would count one crossing twice.
    crossings = sum(one.crossings for one in every)
    if crossings:
        lines.append(
            f"\ncrossed   {crossings:,} persons draw faces from more than one standing"
            " person, so these clusterings are not one refining the other and the"
            " parts counts are not what they claim."
        )

    lines += _finding(reads)
    if reach:
        tightest = reads[-1]
        lines += [
            "\nowed      the flagged clusters that reach the floor and are still one"
            f" person at {tightest.threshold:.3f}, the tightest value swept:",
            *named(tightest.flagged.whole),
        ]
    lines += _cuts(cuts)
    lines += _looser(looser)
    return lines


def _finding(reads: Sequence[Row]) -> list[str]:
    """The recommendation, and its reason either way."""
    moving = recommend(reads)
    if moving is None:
        return [
            "\nfinding   **no threshold** takes more flagged clusters apart than it"
            " breaks friends the reader has answered. Both populations come apart"
            " together, so the knob does not separate a clustering failure from a"
            " person.",
            f"          the recommendation is to keep the threshold where it stands,"
            f" {STANDING}, and to write no new population: a re-cluster that"
            " contradicts more answers than it repairs has cost the sitting twice.",
        ]
    row = next(one for one in reads if one.threshold == moving)
    return [
        f"\nfinding   a threshold of {moving:.3f} **takes the flagged clusters apart**"
        f" faster than it breaks answered friends: {len(row.flagged.apart):,} of"
        f" {row.flagged.subjects:,} came apart against {len(row.friends.apart):,} of"
        f" {row.friends.subjects:,} friends.",
        f"          `python -m photolib.people --threshold {moving}` writes that"
        " population beside the standing one, and the harness asks about it fresh.",
    ]


def _cuts(cuts: Sequence[Cut]) -> list[str]:
    """The size cut priced, with what it is and is not stated plainly."""
    if not cuts:
        return []
    lines = [
        "\ncut       a size cut on the stored share instead of a tighter threshold,"
        f" clustered at {STANDING}. This is where `photolib.people.CUT` came from:"
        " the cut is a column of `face_person`'s key, so every row here is a"
        " population the pass can be pointed at.",
        "            cut     faces   persons   flagged gone   apart   whole"
        "   friend boxes dropped   friends apart",
    ]
    for one in cuts:
        lines.append(
            f"            {one.value:>4.2f}   {one.faces:>7,}   {one.persons:>7,}"
            f"   {len(one.flagged.gone):>12,}   {len(one.flagged.apart):>5,}"
            f"   {len(one.flagged.whole):>5,}   {one.dropped:>20,}"
            f"   {len(one.friends.apart):>13,}"
        )
    clean = [one for one in cuts if one.value and not one.dropped]
    if clean:
        best = max(clean, key=lambda one: one.value)
        lines.append(
            f"          {best.value:.2f} is the largest cut that drops no box of any"
            f" answered friend, and it takes {len(best.flagged.gone):,} flagged"
            f" clusters out of the population entirely and splits"
            f" {len(best.flagged.apart):,} more."
        )
        if best.friends.apart:
            # Said next to it because the two columns can disagree and the summary
            # line would otherwise read as though they could not: complete linkage's
            # merge order depends on every cluster, so dropping another person's
            # small faces can move where this one's joins are made.
            lines.append(
                f"          it still fragments {len(best.friends.apart):,} answered"
                " friend(s) with every box of theirs kept, which is the merge order"
                " moving rather than a box going missing."
            )
    return lines


def _looser(rows: Sequence[Looser]) -> list[str]:
    """The downward sweep, scored on the reader's own same-person answers.

    Absent rather than empty when nobody has answered any, because a table of zeroes
    over no subjects reads as a finding and is not one. What is printed instead says
    which step is missing, `harness.people.judged_yet`'s courtesy.
    """
    if not rows:
        return [
            "\nrejoining no pair of clusters has been called one human or two."
            " `python -m harness.label --open` in its same-person mode is where"
            " those answers come from, and without them a looser threshold can only"
            " be scored on the damage it does -- which is the one-sided evidence the"
            " sweep above concluded from.",
        ]
    control = rows[0].joined
    lines = [
        "\nrejoin    a looser clustering, scored against the pairs the reader judged."
        f" {control.same:,} were called one human and {control.different:,} two."
        " **The two columns are different failures and are never totalled**: a human"
        " put back together is what a loosening buys, and two humans collapsed is the"
        " reader's own answer being contradicted. The cost of a *tighter* value is the"
        " friends-apart column of the sweeps above; this is the other direction's.",
        "            threshold   persons   rejoined   wrongly merged",
    ]
    for one in rows:
        here = " <- standing" if one.threshold == STANDING else ""
        lines.append(
            f"            {one.threshold:>9.3f}   {one.persons:>7,}"
            f"   {len(one.joined.rejoined):>3,} of {control.same:<4,}"
            f"   {len(one.joined.merged):>5,} of {control.different:<6,}{here}"
        )
    if rows[0].joined.rejoined or rows[0].joined.merged:
        lines.append(
            "          the standing row moved a judged pair, which it cannot do if it"
            " is the population those pairs were drawn from: read the rows below it as"
            " describing a clustering this report does not have."
        )
    lines += _rejoining(rows)
    return lines


def _rejoining(rows: Sequence[Looser]) -> list[str]:
    """The downward sweep's recommendation, and its reason either way."""
    moving = loosen(rows)
    if moving is None:
        return [
            "\nfinding   **no looser threshold** rejoins more humans the reader called"
            " one than it merges humans they called two. The clustering does not"
            " separate the two on this axis either, so the threshold is not the knob"
            " that repairs the stacks the nesting rule splits.",
            f"          the recommendation is to keep the threshold where it stands,"
            f" {STANDING}, and to write no new population.",
        ]
    row = next(one for one in rows if one.threshold == moving)
    return [
        f"\nfinding   a threshold of {moving:.3f} **rejoins** more than it merges:"
        f" {len(row.joined.rejoined):,} of {row.joined.same:,} pairs the reader called"
        f" one human against {len(row.joined.merged):,} of {row.joined.different:,}"
        " they called two.",
        f"          `python -m photolib.people --threshold {moving}` writes that"
        " population beside the standing one, and the harness asks about it fresh --"
        " a person is named by its least face, so no answer here carries across.",
    ]


# --- running it ---------------------------------------------------------------


def subjects(
    given: Mapping[str, str],
    faces_of: Mapping[str, frozenset[str]],
    shares: Mapping[str, float],
    touches: Mapping[str, int],
    reach: Mapping[str, int],
) -> list[Subject]:
    """The judged clusters, assembled -- what the reader said and what it can move."""
    return [
        Subject(
            person=person,
            verdict=verdict,
            shares=tuple(
                sorted(
                    (shares[face] for face in faces_of.get(person, frozenset())),
                    reverse=True,
                )
            ),
            touches=touches.get(person, 0),
            reach=reach.get(person, 0),
        )
        for person, verdict in sorted(given.items())
        if verdict in (*JUDGED, FLAGGED)
    ]


def sweep(
    stored: Mapping[str, np.ndarray],
    faces_of: Mapping[str, frozenset[str]],
    shares: Mapping[str, float],
    given: Mapping[str, str],
) -> tuple[list[Row], list[Row]]:
    """Every candidate threshold, over both populations, from one clustering each.

    The same clustering answers both tables: what changes between them is which of a
    subject's faces are allowed to decide whether it came apart, and the floor is
    what decides that.
    """
    reads = above(faces_of, shares)
    # The second table's subjects are the persons with a face left, and not every
    # judged person: one with none would land in `gone` and still count towards the
    # denominator, which would print a split rate over 69 clusters under a heading
    # that says 16.
    reads_given = {
        person: verdict
        for person, verdict in given.items()
        if person in reaching(reads)
    }
    every_row, reading_row = [], []
    for value in SWEEP:
        started = time.perf_counter()
        tighter = cluster(stored, value)
        every_row.append(measure(value, faces_of, tighter, given))
        reading_row.append(measure(value, reads, tighter, reads_given))
        print(
            f"          {value:.3f}  {every_row[-1].persons:,} persons"
            f"  ({time.perf_counter() - started:.0f}s)",
            flush=True,
        )
    return every_row, reading_row


def rejoining(
    stored: Mapping[str, np.ndarray],
    faces_of: Mapping[str, frozenset[str]],
    pairs: Mapping[tuple[str, str], str],
) -> list[Looser]:
    """Every looser threshold, scored against the pairs the reader judged.

    `photolib.people.cluster` again and never a rule about what a looser value would
    do, `sweep`'s discipline: what is priced is what a pass would write.
    """
    priced = []
    for value in LOOSENING:
        started = time.perf_counter()
        looser = cluster(stored, value)
        priced.append(
            Looser(
                threshold=value,
                persons=len(set(looser.values())),
                joined=same.scored(pairs, faces_of, looser),
            )
        )
        print(
            f"          {value:.3f}  {priced[-1].persons:,} persons"
            f"  ({time.perf_counter() - started:.0f}s)",
            flush=True,
        )
    return priced


def cutting(
    stored: Mapping[str, np.ndarray],
    faces_of: Mapping[str, frozenset[str]],
    shares: Mapping[str, float],
    given: Mapping[str, str],
) -> list[Cut]:
    """Every candidate size cut, clustered at the standing threshold."""
    priced = []
    for value in CUTS:
        surviving = reaching(shares, value)
        tighter = cluster(
            {face: vector for face, vector in stored.items() if face in surviving},
            STANDING,
        )
        priced.append(price(value, faces_of, tighter, given, surviving))
        print(f"          {value:.2f}  {priced[-1].persons:,} persons", flush=True)
    return priced


def main(argv: list[str] | None = None) -> int:
    # No arguments and neither sweep is a knob, `harness.screen`'s reason: the report
    # exists to answer whether a tighter clustering works at all, and every flag
    # would let it be asked something narrower.
    argparse.ArgumentParser(
        prog="python -m harness.recluster", description=__doc__.splitlines()[0]
    ).parse_args(argv)

    config = load()
    labels_db = config.catalog_db.parent / label.LABELS
    if not labels_db.exists():
        print(f"no labels at {labels_db}: run python -m harness.label first")
        return 1

    # `NO_CUT`, because the standing row of both tables has to reproduce the stored
    # assignment the reader answered about, and that one was clustered over every face
    # there was. A cut population read here would price cuts against a cut.
    clustering = people.Clustering(MODEL, VERSION, STANDING, NO_CUT)
    labels = screen.labels_read_only(labels_db)
    try:
        given = people.verdicts(labels, clustering)
        # The third mode's answers, about the same population and read the same way.
        # A labels file from before that mode existed has no table and reads as no
        # answers, which is what the read-only connection makes it: this report
        # creates nothing.
        pairs = same.verdicts(labels, clustering)
    finally:
        labels.close()

    conn = candidates.catalog(config.catalog_db, read_only=True)
    try:
        stored = vectors(conn)
        held_by_person = people.found(conn, clustering)
        stacks = people.membership(conn)
    finally:
        conn.close()

    if not held_by_person:
        print(
            f"no persons in {config.catalog_db} at {MODEL} version {VERSION},"
            f" threshold {STANDING}, cut {NO_CUT}: run"
            f" python -m photolib.people --cut {NO_CUT} first"
        )
        return 1
    if not given:
        print(
            f"no answers in {labels_db} about {MODEL} version {VERSION} at"
            f" {STANDING}: `python -m harness.label --open` in its people mode is"
            " where the flagged clusters come from, and without them there is no"
            " subject to measure."
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
    # The stacks a verdict could split, counted twice. `reach` is `people.frames`
    # and `people.splits` called as the harness calls them, so it is the queue
    # itself rather than a measurement standing beside it -- and `PROVISIONAL` is
    # `FLOOR`, which `tests/test_recluster.py` pins, so naming it below names the
    # floor that count was taken at. `frames_of` is the unfiltered contrast -- what
    # a sitting before ticket 73 was spent on -- which the queue line prints and
    # every `Subject` carries beside its `reach`.
    frames_of = {
        person: [face.sha256 for face in faces]
        for person, faces in held_by_person.items()
    }
    touches = people.splits(frames_of, stacks)
    reach = people.splits(people.frames(held_by_person), stacks)

    print(f"catalog     {config.catalog_db}")
    print(f"labels      {labels_db}")
    print(
        f"clustering  {MODEL} version {VERSION}, threshold {STANDING}, cut {NO_CUT}"
        f" -- {len(held_by_person):,} persons, {len(stored):,} faces"
    )
    print(f"judged      {len(given):,} persons the reader has answered about")
    # The queue both ways, because the gap is why the flagged clusters were asked
    # about at all. `people.frames` reads the floor now -- ticket 73 -- so the first
    # number is what the harness asks about and the second is what a sitting before
    # that read spent itself on.
    print(
        f"queue       {sum(1 for one in reach.values() if one):,} persons the harness"
        f" would ask about at the floor of {PROVISIONAL},"
        f" {sum(1 for one in touches.values() if one):,} counted over every face"
        " whatever its size"
    )
    print("sweeping    thresholds, upwards from where it stands:")
    every, reads = sweep(stored, faces_of, shares, given)

    # The standing row's own check, and the reason the sweep starts there: a
    # clustering computed here at the stored threshold must be the stored assignment,
    # or the whole table is describing a computation the pass does not do.
    standing = held(
        {face: person for person, group in faces_of.items() for face in group}
    )
    same = every[0].persons == len(standing) and not every[0].flagged.apart
    print(
        f"            the standing row {'reproduces' if same else 'DOES NOT reproduce'}"
        f" the stored assignment's {len(standing):,} persons"
    )
    print("cutting     the small boxes out, at the standing threshold:")
    cuts = cutting(stored, faces_of, shares, given)
    # Only where there is something to score. A reader who has never opened the
    # same-person mode pays nothing for a sweep that could only print zeroes, and the
    # report says which step is missing instead.
    looser: list[Looser] = []
    if pairs:
        print(
            f"rejoining   {len(pairs):,} judged pairs of clusters, at thresholds"
            " below where it stands:"
        )
        looser = rejoining(stored, faces_of, pairs)
    print(
        *report(
            every,
            reads,
            subjects(given, faces_of, shares, touches, reach),
            cuts,
            looser,
        ),
        sep="\n",
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
