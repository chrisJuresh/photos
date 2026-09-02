"""The answer to "is it any good", and the two numbers the grid inherits.

`docs/adr/0003-stack-on-verified-match.md` leaves three things unsettled and says
the labelling harness will settle them: the reader's **strictness** -- the
threshold on the Match -- whether **complete linkage** needs softening to
"matches most members", and how tight the fingerprint screen can be. This module
answers the first two by replaying the reader's own answers against every setting
and saying how well each one reproduces what they said.

**Four rules are replayed and not one, because ticket 88 says the Match is the
wrong question.** It has a hard noise floor at exactly 4 -- a RANSAC homography
cannot return fewer than four inliers, 117,744 pairs score exactly that, and all
three of the runs the reader reported as wrongly split live in the band 4 to 9,
where the Match has no resolving power at all. So the sweep now runs over the
Match against strictness (the control, and what the grid draws), the fingerprint
cosine against a floor with the Match unused, either of the two as a second way in,
and the noise floor itself priced explicitly. They are **scored apart and never
pooled into one ranking**, and the one that comes back is the control: what the
grid draws is not moved from here. No new pass was needed for any of it -- ADR
0003 stored the cosine per candidate rather than reduced to a verdict so that "a
number chosen later must be a re-read of these rows rather than another pass".

**This report can refute a rule and it cannot confirm one, and it says so in its
own output.** The sets these answers were drawn from were banded on the Match, so
they under-represent exactly the disagreement a fingerprint rule turns on, and none
of the reader's three failing runs is among them. A rule that scores badly here
contradicts answers the reader really gave. A rule that scores well has been shown
not to break what the Match already got right, on a sample drawn to be easy for the
Match. See `caveat`, which prints the share of the disagreement these answers reach
at all, and `Bias`, which counts it.

**Precision and recall are reported apart and never blended.** They are not
equally important here: the reader's binding constraint is precision -- *never
open a stack and see two unrelated photographs* -- and recall is best-effort
under it. A single score would hide exactly the trade the setting is being chosen
for. So precision is a **floor** a setting clears before its recall is allowed to
speak, and never a ranking: ordering on precision alone hands back the corner of
the sweep, where a setting stacks almost nothing and is therefore almost never
wrong. `choose` is that floor and `frontier` is the trade it was drawn across.

**Where the floor sits is the reader's call and it has moved once.** It stood at
95% while the grid had never been browsed; the reader then browsed the result,
reported seeing no wrongly stacked photographs at all, and reported that the
pre-stacking grouping was better. Both halves say the same thing -- the floor was
far above where they want it and the recall it was paid for is the whole
complaint -- so it is 85% now. See `PRECISION`, which carries the reasoning beside
the number so that nobody restores 95% on the original argument.

**A rate is not the whole of a mistake, so the worst single case is scored too.**
False merges concentrate: the reader's worst five answers of sixty held nearly
half of them. A wrong frame in a stack of twelve is a shrug and a stack of nine
holding four unrelated photographs is what this report exists to prevent, so
among the settings within a hair of the best recall the one whose errors
*scatter* wins. See `Tally.concentration` for the count and `HAIR` for why a hair
is a tolerance rather than an equality -- an exact tie between two thresholds
never happens, so a tie-break that waits for one never fires.

**Both counting conventions are printed and neither is chosen.** A pair is the
unit a threshold works in, and counting one per answer weights a run by how often
the sampler returned to it while counting one per pair weights a long burst
quadratically. They disagree, the disagreement is the shape of the evidence, and
hiding either behind the other would be the report picking which. See `Counts`.

**A label is evidence about the frames that were on screen when it was given,
and about nothing else.** `harness.label` shows a candidate stack with what
surrounds it and the reader widens that view as far as they like, but they never
see the whole run -- the runs ADR 0003's fence admits reach 1,435 frames. So
`accept` means *the frames I was shown are right* and never *this stack is
complete*, and a strictness that pulls in a frame the reader never saw is not
contradicting them. Every comparison here is scoped to `members` union
`surrounding`, which is the column `harness.label` stores for this. Scored
naively, the frames outside that scope would measure the width of the harness's
window rather than the threshold, and would push the report towards a stricter
setting than the labels justify.

**The frame past the end of the run is evidence about the fence, not the
threshold.** It is drawn always -- it is the reader's check that the run ended
because the shooting ended -- and ADR 0003's window rules it out of the stack at
every strictness. Counting it would be a constant penalty on a question the
setting does not answer, so it is separated out and reported as what it is.

**Confident labels are reported apart from the not-sure ones.** The reader asked
for their answers not to be taken as certainty; the way to honour that is to
report accuracy over the labels they were sure about and to treat the grey band
as expected rather than as something to fit to. A not-sure answer with no marks
reads as the stack as drawn, so the grey block is context and never a target.

**A setting that scores badly is diagnosable.** Every setting names the labelled
cases it gets wrong and the pair that bound each one, rather than only counting
them.

**The rounds are scored apart, and the newest one is the evidence.** Pooling them
would let a check recommend the thing it is checking, and an agreement between
two rounds would then be arithmetic rather than a finding -- that much has not
moved. What has moved is which round chooses. It used to be the earliest, on the
reasoning that every later round is a check on what the first one settled. Rounds
one and two were answered against a 95% floor and a stricter question than the one
now being asked, so they can no longer be the source of the choice: the newest
round is, and they are replayed as checks on it. The inversion is deliberate and
this paragraph is where it is recorded. Round two keeps its own job either way --
its sets are drawn where a *chain* crosses a boundary the settled rule drew, so it
is still the only round that can price the rule ADR 0003 declined by argument. See
`rounds`, `check` and `chained`.

**A set the reader answered two ways is scored against nothing.** Since ticket 90
a re-ask no longer overwrites the answer it is checking, so one set can carry two
rounds' answers -- and where those contradict, every rule is right about the pair
once and wrong about it once whichever way it goes. Including them would add the
same count to every setting's errors, move no ranking, and pull every precision
toward a floor that is a real threshold, so they are named and counted nowhere.
What the re-asked sets do settle is the number the floor has never had beside it:
how often the reader reproduces their own answer. The floor has moved twice and a
rule reproducing them at 97% reads differently depending on whether they reproduce
themselves at 99% or at 80%. See `contested` and `repeats`.

**A quarter of the newest round is held back, so the pick checks itself.** The
round is partitioned by a stable hash of the answer's own key -- not a random
draw, so two runs over one labels file agree and re-running cannot quietly re-roll
until the answer is liked -- into a three-quarter *choosing* slice and a
one-quarter *checking* slice. The setting comes from the choosing slice; it is
then replayed against the checking slice, which never voted on it, and a pick that
fails its own check is printed as failing rather than silently re-chosen. That is
the confirmation a second sitting used to provide. See `partition` and `holdout`.

**Too few answers is a refusal and never a number.** A choosing slice under
`ENOUGH` answers is a short sitting rather than a measurement, and the honest
output is to say how many there were and choose nothing.

    python -m harness.calibrate

It reads the catalog and `labels.sqlite3`, both on the NVMe, opens no substrate
and never touches `G:`. Every question about the cosine is answered from the stored
`candidate_pair.screen` and never from `verdict`, which is `screen >= 0.40` frozen
at the moment the pass ran, and `photolib.candidates.refuse_if_rethresholded` is
borrowed whole rather than weakened -- pricing a threshold on those numbers means
nothing if the rows on the disk were decided somewhere else. Nothing here moves
`SCREEN`. It writes no label and no report -- its output is a
recommendation for `docs/adr/0003-stack-on-verified-match.md`, which a person
writes down. The only thing it can change in the labels file is what
`harness.label._carry_over` would have done anyway -- the round-one stamp, and the
re-keying that lets a set carry a second answer -- because it opens that file
through the same `store`: reading answers whose round is not recorded yet is what
would otherwise be impossible. No answer is written, revised or dropped. It stays
here as long as the harness does, which is for good: every round of labelling wants
replaying, not only the first two.
"""

from __future__ import annotations

import argparse
import hashlib
import sqlite3
import sys
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass, field

from harness import label
from harness.label import Agree, Cosines, Joins, Points, agreement, either, resemblance
from photolib import candidates, fingerprints, matches
from photolib.config import load

# The strictness the *grid* ships, read for `bias` alone -- the line the two
# measures are asked to contradict each other about has to be the one actually
# drawn. Deliberately not `harness.label.STRICTNESS`, which is the sampler's 20 and
# is a different number on purpose: the bands round three was drawn in are cut
# around it and re-pointing it is round four's business.
from photolib.membership import STRICTNESS

# The strictness values a run sweeps. Dense where the two populations
# `photolib.matches` measured overlap -- pairs a second or less apart have a
# median Match of 283 against a median of 5 beyond two minutes, so everything
# arguable is under 30 -- and coarse above it, where a set of frames either
# agrees plainly or does not agree at all.
SWEEP = (1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 60, 100)

# The cosine floors a run sweeps, for the two rules that read the fingerprint.
#
# Dense between 0.60 and 0.95 because that is where the arguable pairs are: the
# cosine is bimodal with a genuine valley -- 813,227 of this catalog's candidates
# sit in the 0.00 bucket, a trough of 26,441 at 0.75, rising again to 40,551 at
# 0.90 -- and the three runs the reader reported as wrongly split have least
# adjacent cosines of 0.620, 0.843 and 0.938, so a threshold that decides them at
# all decides them in here. Coarse below, where a floor stacks whole runs.
#
# **0.30 is deliberately under `photolib.candidates.SCREEN` and is not a move of
# it.** A pair below 0.40 carries no Match row, so a cosine rule reaching one is
# reaching evidence the geometry never saw -- `harness.rejected` measured 297 such
# pairs among the reader's kept pairs and found 134 of them would clear strictness
# 10. That row is here so the report says what including them buys rather than
# assuming it away; the screen itself is frozen and the refusal below guards it.
COSINES = (0.30, 0.40, 0.50, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95)

# The Match's noise floor, priced explicitly whatever `--strictness` says.
#
# A RANSAC homography cannot return fewer than four inliers, so four is not a low
# score -- it is the lowest score there is. 117,744 of this catalog's pairs score
# exactly 4, the largest bucket in `pair_match`, and 1, 2 and 3 hold 15,062 between
# them. All three of the reader's failing runs sit in the band 4 to 9. So the
# expectation that a strictness of 4 is catastrophic is an assertion, and this
# constant is what turns it into a number: the rule is priced here whether or not
# the sweep happens to contain the value.
NOISE_FLOOR = 4

# The two thresholds the caveat's disagreement is counted at, and neither is a
# rule: `HIGH_COSINE` is where the fingerprint plainly says one picture, and the
# Match side is the grid's own shipped strictness, so the count says how often the
# two measures contradict each other about the line the grid is actually drawn at.
# `LOW_COSINE` is the mirror -- the direction nothing has ever asked about.
HIGH_COSINE = 0.85
LOW_COSINE = 0.60

# The precision a setting has to reach before its recall is allowed to speak.
#
# The reader's constraint is *never* open a stack and see two unrelated
# photographs, and **no setting reaches it on these labels** -- the report prints
# the strongest pair they pushed out, and where that pair scores hundreds of
# points no threshold separates it. So "never" cannot be the floor and a number
# has to be chosen instead. This one is a default and not a finding: it is the
# point at which a wrongly stacked pair stops being an anecdote, and the whole
# frontier is printed beside it so the choice is visible rather than buried.
# `--precision` moves it.
#
# **It stood at 0.95 and moved to 0.85, and the reason is written here so that
# nobody restores it on the argument it was first set by.** 0.95 was chosen before
# the grid had ever been browsed at any setting, from the constraint alone. The
# reader then browsed what it shipped -- strictness 20, matches most members -- and
# reported two things: that they saw no wrongly stacked photographs at all, and
# that the grouping before anything was stacked was better. Those are one finding
# said twice. A floor no wrong merge ever reaches is a floor set above the
# evidence, and everything it was paid for came out of recall, which is the
# complaint. So the floor is where a wrong merge starts being visible rather than
# where it stops being conceivable, and the reader's own tie-break stands behind
# it: they would rather over-merge than over-split.
PRECISION = 0.85

# One answer in four of the newest round is held back from the choice and scored
# against it afterwards. Four because the choosing slice has to stay the larger
# part by a long way -- it is the evidence, and a check is only worth having if
# what it checks was decided properly first.
HOLDBACK = 4

# How close two settings' recall has to be before the one whose errors scatter
# wins -- "within a hair", in the ticket's words.
#
# A tolerance and not an equality, because recall is a continuous score and an
# exact tie between two thresholds never happens: a tie-break that only fires on
# equality is a tie-break that never fires. The size is read off the report's own
# evidence line. Recall is measured over the pairs of a few dozen answers and
# **the five longest sets are around 90% of them**, so the third figure of a recall
# is a fact about which bursts the sampler dealt rather than about the threshold.
# One point is inside that; a worst case four times another's is not.
HAIR = 0.01

# The confident answers a choosing slice needs before it may choose at all.
#
# Twenty, because the evidence block prints why: the five longest sets carry most
# of the pairs a round keeps together, so under twenty answers the sweep is
# settled by a handful of bursts and the recommendation describes them rather than
# the library. Rounds one and two were thirty each and round three ran to ninety.
# A sitting shorter than this is a sitting, and the honest output is to say so.
ENOUGH = 20


# All three rules are `harness.label`'s own, so the rule this report calls a name
# is the rule the harness draws with under that name rather than a second copy of
# it. Round two is drawn against `neighbour` in particular -- see `Question.chain`
# -- and a report that scored a different chain from the one the sampler sought
# would price the wrong thing.
LINKAGE = label.LINKAGE


# --- reading a label ----------------------------------------------------------


@dataclass(frozen=True)
class Case:
    """One answer, read as a statement about the frames that were on screen.

    `belong` and `apart` are that statement: the frames of the scope the reader
    placed inside the stack, and the frames of it they placed outside. Together
    they are `members` union `surrounding` and nothing else -- see the module
    docstring for why the scope is drawn there and not wider.

    `beyond_in` and `beyond_out` are the frames of the scope that sit outside the
    run, which is only ever the frame past each end of it. They are held apart
    from the two above because no strictness can reach them: the fence decides
    them, so an answer about one is evidence about the window's value.
    """

    members: tuple[str, ...]
    camera: str | None
    verdict: str
    run: tuple[str, ...]
    belong: frozenset[str]
    apart: frozenset[str]
    beyond_in: frozenset[str]
    beyond_out: frozenset[str]
    # Which of ADR 0003's rounds asked. The report never pools them: the earliest
    # round is the evidence a setting is chosen from and every later one is a check
    # on that choice, and a check that voted would be checking itself.
    round: int = 1

    @property
    def confident(self) -> bool:
        return self.verdict != "unsure"

    @property
    def name(self) -> str:
        """Enough to find the set again without printing a photograph."""
        return f"{self.camera or '(unnamed)'} {self.members[0][:8]} x{len(self.members)}"


def case(answer: dict, run: Sequence[str]) -> Case:
    """What one row of `labels.sqlite3` says, against the run it was drawn from."""
    members = tuple(answer["members"])
    belong = (set(members) - set(answer["evicted"])) | set(answer["included"])
    apart = (set(members) | set(answer["surrounding"])) - belong
    inside = set(run)
    return Case(
        members=members,
        camera=answer["camera"],
        verdict=answer["verdict"],
        run=tuple(run),
        belong=frozenset(belong & inside),
        apart=frozenset(apart & inside),
        beyond_in=frozenset(belong - inside),
        beyond_out=frozenset(apart - inside),
        round=answer["round"],
    )


def pairs(subject: Case) -> list[tuple[str, str, bool]]:
    """Every pair this label is evidence about, in run order, with what it says.

    Two frames the reader kept together should stack; a frame they kept and a
    frame they pushed out should not. **Two frames they both pushed out are not
    here at all**: the reader said neither joins *this* stack, and whether the
    two of them are one stack between themselves is a question they were never
    asked. Counting that pair either way would invent an answer.
    """
    at = {sha256: index for index, sha256 in enumerate(subject.run)}
    belong = sorted(subject.belong, key=at.__getitem__)
    apart = sorted(subject.apart, key=at.__getitem__)
    together = [
        (early, late, True)
        for index, early in enumerate(belong)
        for late in belong[index + 1 :]
    ]
    split = sorted(
        (
            (member, outside) if at[member] < at[outside] else (outside, member)
            for member in belong
            for outside in apart
        ),
        key=lambda pair: (at[pair[0]], at[pair[1]]),
    )
    return together + [(early, late, False) for early, late in split]


def filed(subject: Case) -> str:
    """The set this answer is about, as `harness.label` keys it.

    Half of that key: the round is the other half, which is why two answers can
    share this and be two answers rather than one read twice.
    """
    return label.key(subject.members)


def confident(cases: Iterable[Case]) -> list[Case]:
    return [subject for subject in cases if subject.confident]


def grey(cases: Iterable[Case]) -> list[Case]:
    return [subject for subject in cases if not subject.confident]


def rounds(cases: Iterable[Case]) -> dict[int, list[Case]]:
    """The labels by the round that asked for them, earliest first.

    **The split is what keeps a check from voting on what it checks.** One round
    is the evidence -- its labels are what the sweep is scored over and what
    `choose` picks a setting from -- and every other round is a *check* on that
    pick. A round pooled into the evidence would be recommending the setting it
    was drawn to test, and an agreement between the two would then be arithmetic
    rather than a finding.

    **The newest round is the evidence and the earlier ones are the checks**, which
    is the way round the report used to run it. See the module docstring: rounds
    one and two were answered under a 95% floor, against a stricter question than
    the one now being asked, so they cannot be what settles the answer to this one.

    Sorted rather than keyed on a fixed number, so a labels file holding one round
    still has evidence to be read from and says which round it is.
    """
    split: dict[int, list[Case]] = {}
    for subject in cases:
        split.setdefault(subject.round, []).append(subject)
    return dict(sorted(split.items()))


def held_back(subject: Case) -> bool:
    """Whether this answer is in the checking slice rather than the choosing one.

    **A stable hash of the answer's own key and never a random draw.** The key is
    what `harness.label` files the answer under -- the frames of the stack as it
    was drawn -- so the partition is a property of the label and survives every
    re-run: a report cannot be run again until the slice it drew happens to agree
    with it. `hashlib` and not `hash`, which is salted per process and would make
    two runs in one afternoon disagree.

    A run's answers land on both sides, which is deliberate: the slice is over
    answers because an answer is the unit the reader gave and the unit `choose`
    scores. It is not a claim that the two slices are independent photographs.
    """
    digest = hashlib.sha256(filed(subject).encode()).digest()
    return int.from_bytes(digest[:8], "big") % HOLDBACK == 0


def partition(subjects: Iterable[Case]) -> tuple[list[Case], list[Case]]:
    """One round as `(choosing, checking)` -- three quarters and one, deterministically."""
    ordered = list(subjects)
    return (
        [subject for subject in ordered if not held_back(subject)],
        [subject for subject in ordered if held_back(subject)],
    )


# --- a set the reader has answered twice --------------------------------------


def statements(subject: Case) -> dict[tuple[str, str], bool]:
    """Every pair this label places, as a lookup: kept together, or pushed apart."""
    return {(early, late): same for early, late, same in pairs(subject)}


def disagree(one: Case, other: Case) -> list[tuple[str, str]]:
    """The pairs two answers about one set place differently.

    **Only the pairs both of them place**, which is what makes this a
    contradiction rather than a difference. A re-ask can be answered with the view
    widened further than the first time, and the frames only the second answer saw
    are not something the first one denied -- scoring them as disagreement would
    measure how far the reader scrolled. See the module docstring on scope.
    """
    mine, theirs = statements(one), statements(other)
    return sorted(pair for pair in mine.keys() & theirs.keys() if mine[pair] != theirs[pair])


def asked_again(read: Iterable[Case]) -> dict[str, list[Case]]:
    """Every set carrying an answer from more than one round, earliest round first.

    Answers about one set, and never one answer read twice: `harness.label` keys on
    the set *and* the round, so two entries here are two sittings. Before ticket 90
    the second overwrote the first and this could only ever be empty.
    """
    found: dict[str, list[Case]] = {}
    for subject in read:
        found.setdefault(filed(subject), []).append(subject)
    return {
        members: sorted(about, key=lambda subject: subject.round)
        for members, about in found.items()
        if len(about) > 1
    }


def contested(read: Iterable[Case]) -> dict[str, list[Case]]:
    """The re-asked sets whose answers contradict each other.

    **A contested set is scored against no setting**, and that is this module's
    answer to the question ticket 90 left open. The reasoning is arithmetic rather
    than taste: for a pair the reader kept together in one round and pushed apart in
    another, every rule is right about it once and wrong about it once, whichever
    way the rule goes. So including contested sets adds the same count to every
    setting's errors -- no ranking moves, and the only thing that changes is that
    every precision is dragged toward a floor that is a real threshold. Evidence
    that cannot discriminate and can disqualify is worth less than nothing.

    The alternatives were priced and both hide something. Scoring the most recent
    answer buys a verdict with a preference for recency that nothing here supports.
    Scoring both is the arithmetic above, stated as a ceiling on every rule at once
    -- which is a real finding, and it is `repeats` that reports it, without letting
    it into the sweep.

    Set aside everywhere and not per round: the rounds are scored apart, so a
    contested set is never double-counted inside one population, but each round on
    its own would still be scoring a set whose truth is not known.
    """
    return {
        members: given
        for members, given in asked_again(read).items()
        if any(
            disagree(one, other)
            for index, one in enumerate(given)
            for other in given[index + 1 :]
        )
    }


# --- scoring a setting --------------------------------------------------------


@dataclass(frozen=True)
class Setting:
    """One rule, as the report scores it: the thresholds it reads and the linkage.

    **Which rule this is, is which thresholds are present**, and there is no field
    saying so on purpose: a discriminator beside two optional numbers is the same
    fact twice and can be made to disagree with itself.

    | `strictness` | `cosine` | the rule |
    |---|---|---|
    | set | absent | the Match at or above strictness -- what the grid draws |
    | absent | set | the cosine at or above a floor, the Match unused |
    | set | set | either of them, which is strictly a loosening of the first |

    `strictness` stays the first positional field and `cosine` is added after the
    linkage, so `Setting(20, "complete")` goes on meaning exactly what it meant
    before ticket 93: the Match rule, which is the control every other rule is
    read against.
    """

    strictness: int | None
    linkage: str
    cosine: float | None = None

    @property
    def name(self) -> str:
        """The thresholds, in the order the rule reads them.

        A Match-only setting prints as its bare strictness, which is what it printed
        before there was anything else to print.
        """
        if self.cosine is None:
            return str(self.strictness)
        if self.strictness is None:
            return f"cosine {self.cosine:.2f}"
        return f"{self.strictness} or cosine {self.cosine:.2f}"


def describes(setting: Setting) -> str:
    """One setting in words, for the lines a reader reads instead of the table."""
    if setting.cosine is None:
        return f"{setting.linkage} linkage at strictness {setting.strictness}"
    if setting.strictness is None:
        return (
            f"{setting.linkage} linkage at cosine {setting.cosine:.2f},"
            " the Match unused"
        )
    return (
        f"{setting.linkage} linkage at strictness {setting.strictness}"
        f" or cosine {setting.cosine:.2f}"
    )


def rule(setting: Setting, points: Points, cosines: Cosines | None) -> Agree:
    """The predicate one setting asks its question through: the four rules, in one place.

    **Every rule this report prices is built here and nowhere else**, out of the
    seam `photolib.membership` owns. That is the whole argument that these numbers
    describe what the grid would draw: `agreement`, `resemblance` and `either` are
    the pass's own, the walk they are handed to is the pass's own, and what this
    function contributes is which of them a row of the table means. A rule spelled
    out here would be a rule the grid cannot be moved onto.

    A cosine threshold with no cosines read is a caller mistake rather than a rule
    that agrees about nothing, and it would show up as a refuted rule instead of as
    an error, so it is one.
    """
    match_rule = None if setting.strictness is None else agreement(points, setting.strictness)
    if setting.cosine is None:
        if match_rule is None:
            raise ValueError("a setting has to read the Match, the cosine, or both")
        return match_rule
    if cosines is None:
        raise ValueError(
            f"cosine {setting.cosine} asked for and no stored cosine was read"
        )
    resembles = resemblance(cosines, setting.cosine)
    return resembles if match_rule is None else either(match_rule, resembles)


@dataclass(frozen=True)
class Wrong:
    """One pair a setting got wrong, and the evidence it got it wrong from."""

    kind: str  # "wrongly together" or "missed"
    early: str
    late: str
    points: int


@dataclass
class Counts:
    """Three counts and never a fourth, and the two questions asked of them.

    The pair both the reader and the setting left apart is the overwhelming
    majority and reporting it would flatter every setting equally. Precision and
    recall are kept apart -- see the module docstring.
    """

    together: int = 0  # the reader kept them together and so did the setting
    wrongly_together: int = 0  # the setting stacked what the reader pushed out
    missed: int = 0  # the reader kept them together and the setting did not

    @property
    def precision(self) -> float | None:
        """Of the pairs this setting stacked, how many the reader agreed with.

        None rather than 1.0 when it stacked nothing: a setting that claims
        nothing was never wrong, and reading that as perfect would recommend it.
        """
        claimed = self.together + self.wrongly_together
        return self.together / claimed if claimed else None

    @property
    def recall(self) -> float | None:
        wanted = self.together + self.missed
        return self.together / wanted if wanted else None


@dataclass
class Tally:
    """What one setting did to the labels it was replayed against.

    **Counted twice, because the two conventions answer different questions and
    neither is the whole picture.** The three fields on the tally itself are
    *mentions*: one count per pair per answer, so a run two answers both reach
    into is counted twice and a pair carries the weight of how much evidence
    exists about it. `once` is the same three counts with each pair counted a
    single time however many answers mention it, so a long burst stops arriving
    quadratically and a pair is one fact about two frames. Measured over this
    catalog the two are 4,427 mentions of 3,727 pairs.

    The pick is made on mentions, which is what it has always been made on. `once`
    is printed beside it rather than substituted for it: the ticket asked for the
    quadratic weight to be *visible*, and a report that swapped one convention for
    the other would have hidden the same thing from the other side.
    """

    together: int = 0  # the reader kept them together and so did the setting
    wrongly_together: int = 0  # the setting stacked what the reader pushed out
    missed: int = 0  # the reader kept them together and the setting did not
    once: Counts = field(default_factory=Counts)
    wrong: dict[str, list[Wrong]] = field(default_factory=dict)

    @property
    def precision(self) -> float | None:
        """Of the pairs this setting stacked, how many the reader agreed with.

        None rather than 1.0 when it stacked nothing: a setting that claims
        nothing was never wrong, and reading that as perfect would recommend it.
        """
        claimed = self.together + self.wrongly_together
        return self.together / claimed if claimed else None

    @property
    def recall(self) -> float | None:
        wanted = self.together + self.missed
        return self.together / wanted if wanted else None

    @property
    def concentration(self) -> int:
        """The most wrongly stacked pairs this setting put into any single case.

        The rate says how often a setting is wrong and this says how badly it is
        wrong at its worst, which is a different question and the one the reader
        answered plainly: a wrong frame in a stack of twelve is a shrug, and a
        stack of nine holding four unrelated photographs is what the complaint was
        about. False merges concentrate -- the worst five answers of sixty held
        nearly half of them -- so a setting whose errors scatter is preferred to
        one that ties with it and buries them all in one stack. `choose` breaks
        ties on this.

        Wrongly stacked pairs only, and not the missed ones: a case that misses
        everything is a stack drawn small, which is the failure the reader is
        asking for less of.
        """
        return max(
            (
                sum(1 for entry in entries if entry.kind != "missed")
                for entries in self.wrong.values()
            ),
            default=0,
        )

    def note(self, subject: Case, entry: Wrong) -> None:
        self.wrong.setdefault(subject.name, []).append(entry)


def placed(run: Sequence[str], agree: Agree, joins: Joins) -> dict[str, int]:
    """Which stack each frame of a run lands in, at one setting.

    A setting is the pair of arguments and not one of them: `agree` is what the
    stacks rest on and `joins` is how much of a stack a frame has to satisfy. Both
    come in as values, so this replays what the grid draws and never a rule spelled
    out here to agree with it.

    **The whole run and not the scope**, which is the one place the harness's
    window deliberately does not bound things -- and it is the right way round.
    What is being predicted is what the *grid* would draw, and the grid has never
    heard of the reader's view: it walks the run. Cutting the walk down to the
    frames that were on screen would score a stack that nothing will ever draw.

    It cuts both ways and both are the truth rather than an artefact. A frame the
    walk consumed early is why a stack was drawn where it was, so dropping it
    would invent a merge. And an unseen frame that chains two seen ones into one
    stack is not a leak of the window either: the reader saw *those two*, said
    they do not belong together, and the grid would put them in one stack anyway
    -- which is exactly the complaint precision is counting.
    """
    return {
        sha256: index
        for index, stack in enumerate(label.link(run, agree, joins))
        for sha256 in stack
    }


def replay(cases: Iterable[Case], points: Points, agree: Agree, joins: Joins) -> Tally:
    """Score one setting against every label, naming what it got wrong.

    **`agree` arrives built and is never made here**, which is what keeps `sweep` the
    one place a rule is named. Taking a strictness and building the predicate from it
    would be this function deciding that agreement is a threshold on the Match, which
    is exactly the decision the seam took away from it.

    `points` arrives as well and is not that argument twice over. The predicate only
    ever says yes or no; the Match beside each mistake is how far off it was, which
    is a number about the pair rather than the question the walk asked of it. A rule
    that never reads the Match still reports one here, and that is what the column is
    for.

    Every pair is counted into both conventions at once -- see `Tally`. `seen`
    holds the pairs already counted into `once`, ordered by sha256 rather than by
    the run, because two answers drawn from one run can name the same two frames
    in either order and the deduplication has to see through that.
    """
    tally = Tally()
    walked: dict[tuple[str, ...], dict[str, int]] = {}
    seen: set[tuple[str, str]] = set()
    for subject in cases:
        at = walked.get(subject.run)
        if at is None:
            at = walked[subject.run] = placed(subject.run, agree, joins)
        for early, late, same in pairs(subject):
            stacked = at[early] == at[late]
            pair = (min(early, late), max(early, late))
            fresh = pair not in seen
            seen.add(pair)
            if same and stacked:
                tally.together += 1
                if fresh:
                    tally.once.together += 1
            elif same:
                tally.missed += 1
                if fresh:
                    tally.once.missed += 1
                tally.note(
                    subject, Wrong("missed", early, late, label.match(points, early, late))
                )
            elif stacked:
                tally.wrongly_together += 1
                if fresh:
                    tally.once.wrongly_together += 1
                tally.note(
                    subject,
                    Wrong("wrongly together", early, late, label.match(points, early, late)),
                )
    return tally


def sweep(
    cases: Sequence[Case],
    points: Points,
    strictnesses: Sequence[int | None] = SWEEP,
    linkages: Sequence[str] = tuple(LINKAGE),
    thresholds: Sequence[float | None] = (None,),
    cosines: Cosines | None = None,
) -> dict[Setting, Tally]:
    """Every setting, scored. The order is the order the table is printed in.

    `linkages` narrows which rules are in the running, which is how a decision to
    set one aside is made reproducible: a rule the labels cannot price is
    excluded by naming it on the command line rather than by arguing past the
    recommendation afterwards.

    `thresholds` is the cosine axis and defaults to the one value that means *no
    cosine at all*, so a call that says nothing about the fingerprint sweeps the
    Match rule exactly as it did before ticket 93. A rule reading the cosine and
    not the Match is a `strictnesses` of `(None,)`, which is why that sequence
    admits one.

    **A setting becomes a rule in `rule` and nowhere else.** This function decides
    which settings exist; what each one reads is one call away, so the four rules
    are four shapes of argument here rather than four branches inside the scoring.
    """
    return {
        setting: replay(
            cases, points, rule(setting, points, cosines), LINKAGE[setting.linkage]
        )
        for setting in (
            Setting(strictness, linkage, threshold)
            for linkage in linkages
            for threshold in thresholds
            for strictness in strictnesses
        )
    }


def choose(scored: dict[Setting, Tally], floor: float = PRECISION) -> Setting | None:
    """The best recall among the settings that clear the precision floor, then the
    least concentrated of everything within a hair of it.

    Precision is the binding constraint and recall is best-effort *under* it,
    which is a floor and not a ranking: ordering on precision alone hands back
    the corner of the sweep, where a setting stacks almost nothing and is
    therefore almost never wrong. So the floor decides who may answer and recall
    decides between them.

    A setting that stacked nothing has no precision and is never chosen -- it was
    not right, it was silent.

    **Recall ranks, and everything within a hair of the best recall is then
    separated on where its errors fell.** Two settings the labels can barely
    separate on recall are not equally good: the one that put fewer wrongly
    stacked pairs into its worst single case is, because that is the failure the
    reader can actually see -- a wrong frame in a stack of twelve is a shrug and a
    stack of nine holding four unrelated photographs is the complaint. See
    `Tally.concentration` for the count and `HAIR` for how wide "a hair" is and
    why it is a tolerance rather than an equality. Inside the band recall decides
    again, then the stricter setting -- the higher Match floor, then the higher
    cosine floor -- on the grounds that two settings the labels cannot tell apart
    are not equally safe on the frames nobody labelled, and then complete linkage,
    because it is ADR 0003's default and a softening has to earn itself.

    **One rule at a time and never a pooled ranking.** Every caller hands in the
    settings of a single rule, because the four rules are scored apart: a `choose`
    over all of them at once would return one winner and hide the comparison this
    report exists to print -- and on labels drawn in bands cut on the Match, it
    would hide it in the Match's favour.

    Precision does not rank even here. It is the floor and nothing else, and
    slipping it in as a tie-break would quietly restore the ordering the floor
    exists to replace.

    Where nothing clears the floor there is no recommendation. Saying so is the
    honest answer and picking the least bad setting silently is not.
    """
    order = list(LINKAGE)
    clearing = [
        setting
        for setting, tally in scored.items()
        if tally.precision is not None and tally.precision >= floor
    ]
    if not clearing:
        return None

    def recall(setting: Setting) -> float:
        return scored[setting].recall or 0.0

    best = max(recall(setting) for setting in clearing)
    band = [setting for setting in clearing if recall(setting) >= best - HAIR]
    return max(
        band,
        key=lambda setting: (
            -scored[setting].concentration,
            recall(setting),
            setting.strictness or 0,
            setting.cosine or 0.0,
            -order.index(setting.linkage),
        ),
    )


def beats(soft: Tally, strict: Tally) -> bool:
    """Whether one setting is better than another on both counts at once.

    Both, because a setting that buys recall with precision has not beaten
    anything -- it has made the trade this report exists to show, and choosing
    between those two is `choose`'s job and not this one's.
    """
    return (
        soft.precision is not None
        and strict.precision is not None
        and soft.precision >= strict.precision
        and (soft.recall or 0) >= (strict.recall or 0)
        and (soft.precision, soft.recall) != (strict.precision, strict.recall)
    )


def frontier(scored: dict[Setting, Tally]) -> list[Setting]:
    """The settings nothing else beats on both counts at once.

    The trade the report exists to show: every setting here buys recall with
    precision or the other way about, and everything not here is beaten on both.

    **One row per distinct result, because the frontier has to be readable.** Two
    settings scoring identically on every column printed are indistinguishable to
    the labels -- `beats` requires a difference, so neither dominates the other and
    both survive -- and a two-dimensional sweep produces them by the dozen: a cosine
    floor loose enough to stack a run on its own returns the same tally at every
    strictness above it, which is sixteen rows saying one thing. So a group is
    printed once, and the survivor kept is the strictest of it -- the higher Match
    floor, then the higher cosine floor -- which is `choose`'s tie-break and its
    reasoning: two settings the labels cannot tell apart are not equally safe on the
    frames nobody labelled.
    """
    scoreable = {
        setting: tally for setting, tally in scored.items() if tally.precision is not None
    }
    undominated = [
        setting
        for setting, tally in scoreable.items()
        if not any(beats(other, tally) for other in scoreable.values())
    ]
    kept: dict[tuple, Setting] = {}
    for setting in sorted(
        undominated, key=lambda one: (one.strictness or 0, one.cosine or 0.0)
    ):
        tally = scoreable[setting]
        kept[(tally.precision, tally.recall, tally.concentration)] = setting
    return sorted(
        kept.values(), key=lambda setting: -(scoreable[setting].recall or 0)
    )


# --- reading the labels and the catalog ---------------------------------------


def cases(answers: dict[str, dict], runs: Iterable[Sequence[str]]) -> tuple[list[Case], list[str]]:
    """Every answer paired with the run it was drawn from, and the ones with none.

    An answer whose frames are in no run is not dropped quietly: the labels are
    keyed on the frames and the runs come from the catalog, so a stack with no
    run means the catalog moved under the labels and the report has to say so.
    """
    home = {sha256: tuple(run) for run in runs for sha256 in run}
    read: list[Case] = []
    orphans: list[str] = []
    for answer in answers.values():
        run = home.get(answer["members"][0])
        if run is None:
            orphans.append(",".join(answer["members"]))
        else:
            read.append(case(answer, run))
    return read, orphans


def checked(
    conn: sqlite3.Connection,
    wanted: set[str],
    *,
    method: str = matches.METHOD,
    version: str = matches.VERSION,
) -> Points:
    """The Match of every checked pair inside the runs the labels sit in.

    Filtered rather than read whole: the catalog holds a Match for 566,522 pairs
    and the replay only ever asks about the runs the reader was shown.
    """
    return {
        (early, late): points
        for early, late, points in conn.execute(
            "SELECT sha_early, sha_late, points FROM pair_match WHERE method = ? AND version = ?",
            (method, version),
        )
        if early in wanted and late in wanted
    }


def screens(
    conn: sqlite3.Connection,
    wanted: set[str],
    floor: float = min(COSINES),
    *,
    model: str = fingerprints.MODEL,
    version: str = fingerprints.VERSION,
) -> Cosines:
    """The stored cosine of every candidate inside the runs the labels sit in.

    **`screen` and never `verdict`**, which is `harness.screen`'s rule borrowed
    whole: the verdict is `screen >= 0.40` frozen at the moment the pass ran, so a
    sweep that read it would answer every threshold at 0.40 while appearing to
    sweep. `candidates.refuse_if_rethresholded` is what stops those two drifting
    apart and `main` borrows that too.

    **Filtered twice, and the second filter is load-bearing.** The catalog holds a
    cosine for 3,632,211 candidates and 1,974,461 of them are inside the runs the
    reader was shown, which is more than this report needs to hold in memory at
    once: a pair whose cosine is under every value the sweep asks about is a pair
    no rule in the sweep agrees on, and dropping it reads as no agreement, which is
    the same answer. So `floor` is the least threshold that will be asked and
    defaults to the least in `COSINES` -- passing a threshold below what was read
    would answer it wrongly rather than expensively, which is why the two are the
    same constant and there is one call site.

    `sys.intern` for `photolib.membership.points`' reason: a few hundred thousand
    rows name a few thousand frames, and without it every row arrives as a fresh
    pair of 64-character strings.
    """
    return {
        (sys.intern(early), sys.intern(late)): screen
        for early, late, screen in conn.execute(
            "SELECT sha_early, sha_late, screen FROM candidate_pair"
            " WHERE model = ? AND version = ? AND screen >= ?",
            (model, version, floor),
        )
        if early in wanted and late in wanted
    }


# --- how much of the question the labels reach --------------------------------


@dataclass(frozen=True)
class Bias:
    """How much of the disagreement between the two measures the answers reach.

    The number the caveat below is made of, and it is counted rather than quoted:
    the pairs where the Match and the fingerprint contradict each other about the
    line the grid is drawn at, inside the runs the reader was actually shown, and
    how many of those any answer places at all. A share near zero is the caveat --
    the sample was drawn in bands cut on the Match, so it can say when a cosine rule
    breaks something the Match got right and it cannot say what a cosine rule would
    fix.
    """

    cosine_only: int  # cosine plainly agrees, the Match does not
    match_only: int  # the Match agrees, the cosine plainly does not
    placed: int  # of those two populations, the pairs an answer places
    labelled: int  # every pair the answers place, whatever the two measures say
    strictness: int  # the Match line the contradiction was counted at

    @property
    def disagreeing(self) -> int:
        return self.cosine_only + self.match_only

    @property
    def reached(self) -> float | None:
        """The share of the disagreement the answers place. None where there is none."""
        return self.placed / self.disagreeing if self.disagreeing else None


def bias(
    read: Sequence[Case],
    points: Points,
    cosines: Cosines,
    strictness: int = STRICTNESS,
) -> Bias:
    """Count the disagreement, and how much of it the labels place.

    Over the runs the labels sit in and never over the whole catalog, which is the
    tighter and more honest scope: what is being asked is whether *these answers*
    reach the disagreement, so counting pairs in runs no answer touches would
    flatter the denominator with pairs the reader was never going to be asked about.

    The Match side reads `photolib.membership.STRICTNESS` -- the strictness the grid
    ships -- so the count is about the line actually drawn rather than about a value
    of this report's choosing. The cosine side is `HIGH_COSINE` and `LOW_COSINE`,
    which are not rules and are never swept.
    """
    seen = {
        (min(early, late), max(early, late))
        for subject in read
        for early, late, _ in pairs(subject)
    }
    cosine_only: set[tuple[str, str]] = set()
    match_only: set[tuple[str, str]] = set()
    for (early, late), screen in cosines.items():
        agreed = label.match(points, early, late)
        if screen >= HIGH_COSINE and agreed < strictness:
            cosine_only.add((min(early, late), max(early, late)))
        elif screen < LOW_COSINE and agreed >= strictness:
            match_only.add((min(early, late), max(early, late)))
    return Bias(
        cosine_only=len(cosine_only),
        match_only=len(match_only),
        placed=len((cosine_only | match_only) & seen),
        labelled=len(seen),
        strictness=strictness,
    )


def caveat(measured: Bias) -> list[str]:
    """Why a good score here is weak evidence, in the report's own words.

    **This is an acceptance criterion of ticket 93 and not a nicety.** The rules
    below are scored against answers whose sets were drawn in bands cut on the
    Match, so the sample systematically under-represents exactly the disagreement
    the two fingerprint rules turn on, and none of the three runs the reader
    reported as wrongly split is among the answers at all. A reader of this output
    alone has to be able to tell that, without reading a ticket or a docstring, or
    the report is a good score waiting to be misread as a decision.

    The asymmetry is the point and it is not a hedge: refuting is cheap here and
    confirming is impossible. A rule that scores badly contradicts answers the
    reader really gave, whichever way the sample was drawn. A rule that scores well
    has been shown not to break what the Match already got right -- on a sample
    drawn to be easy for the Match.
    """
    lines = [
        "\ncaveat    **this report can refute a rule and it cannot confirm one.** That is"
        " a fact about the labels",
        "          and not about the rules. The sets these answers were drawn from were"
        " banded on the Match, so",
        "          they under-represent the pairs where the two measures disagree -- and"
        " that disagreement is",
        "          the whole of what a rule reading the fingerprint turns on.",
    ]
    if measured.reached is None:
        lines.append(
            "          Inside the runs these answers sit in, the two measures never"
            " contradict each other at all,"
        )
        lines.append(
            "          so these labels hold no evidence about the question either way."
        )
    else:
        lines += [
            f"          Inside the runs these answers sit in, {measured.cosine_only:,}"
            f" pairs reach cosine {HIGH_COSINE:.2f} with a Match",
            f"          under {measured.strictness}, and {measured.match_only:,}"
            f" the other way. The answers place {measured.placed:,}",
            f"          of those {measured.disagreeing:,}"
            f" -- {measured.reached:.1%} -- out of"
            f" {measured.labelled:,} labelled pairs in all.",
        ]
    lines += [
        "          None of the three runs the reader reported as wrongly split is among"
        " these answers.",
        "          So a rule that scores badly below is refuted: it contradicts answers"
        " the reader gave. A rule",
        "          that scores well has only been shown not to break what the Match"
        " already got right, on a",
        "          sample drawn to be easy for the Match. Confirming one needs a round"
        " drawn on the disagreement",
        "          itself, which is ticket 94. A ticket that reads a good score here as a"
        " decision has misread it.",
    ]
    return lines


# --- the report ---------------------------------------------------------------


def percent(value: float | None) -> str:
    return "     --" if value is None else f"{value:7.1%}"


def threshold(value: int | float | None) -> str:
    """One axis of a setting, or a dash where that rule reads nothing on it.

    A dash and never a zero: a strictness of 0 admits every pair the fence enumerated
    and a cosine of 0 admits two fingerprints at right angles, so both are settings a
    sweep could really hold and neither means *unused*.
    """
    if value is None:
        return "--"
    return str(value) if isinstance(value, int) else f"{value:.2f}"


def table(scored: dict[Setting, Tally], total: int) -> list[str]:
    """Every setting, under both counting conventions, with its worst single case.

    **Mentions and pairs are both printed and neither is chosen**, because they
    answer different questions and neither is the whole picture. A pair is the unit
    the threshold works in and the unit "two unrelated photographs in one stack" is
    about; counted once per answer it carries the weight of how much evidence there
    is about it, and counted once globally it stops a long burst arriving
    quadratically -- the reader's five longest drags are most of the pairs they kept
    together, and the evidence block above prints the round's own share rather than
    a figure written here. The case count is one vote each and cannot be dominated, and is
    coarse for exactly the same reason. `worst` is the concentration -- the most
    wrongly stacked pairs any single case carries -- which is what separates a
    setting whose errors scatter from one that buries them all in one stack.
    """
    lines = [
        "                                   ------------ per answer ------------"
        "   ----- per pair ----",
        "  linkage    strictness   cosine   precision    recall   wrong   missed   "
        "precision    recall   worst   cases wrong",
    ]
    for setting, tally in scored.items():
        lines.append(
            f"  {setting.linkage:<10} {threshold(setting.strictness):>10} "
            f"{threshold(setting.cosine):>8}   "
            f"{percent(tally.precision)}   {percent(tally.recall)}   "
            f"{tally.wrongly_together:>5}   {tally.missed:>6}   "
            f"{percent(tally.once.precision)}   {percent(tally.once.recall)}   "
            f"{tally.concentration:>5}   {len(tally.wrong):>7}/{total}"
        )
    return lines


def diagnosis(scored: dict[Setting, Tally]) -> list[str]:
    """Which labelled cases each setting gets wrong, and what bound each one.

    Every setting and every case it disagreed with, because a setting that scores
    badly is only useful if it is diagnosable. The pair named per case is the
    worst one: the missed pair with the least agreement, or the wrongly stacked
    pair with the most.
    """
    lines: list[str] = []
    for setting, tally in scored.items():
        lines.append(f"\n  {setting.linkage} at {setting.name}")
        if not tally.wrong:
            lines.append("    nothing -- it reproduces every label it was shown")
            continue
        for name, entries in sorted(tally.wrong.items()):
            missed = [entry for entry in entries if entry.kind == "missed"]
            stacked = [entry for entry in entries if entry.kind != "missed"]
            said = []
            if missed:
                worst = min(missed, key=lambda entry: entry.points)
                said.append(f"{len(missed)} missed, weakest at {worst.points} points")
            if stacked:
                worst = max(stacked, key=lambda entry: entry.points)
                said.append(f"{len(stacked)} wrongly stacked, strongest at {worst.points}")
            lines.append(f"    {name:<32} {'; '.join(said)}")
    return lines


def softening(scored: dict[Setting, Tally], strictness: int) -> list[str]:
    """Whether complete linkage needs softening, answered from the labels.

    ADR 0003 leaves it open -- "whether complete linkage needs softening to
    matches most members" -- and this is the comparison that closes it: the same
    strictness under all three rules, so a softer rule is read against the one it
    would replace and not against a different threshold.

    The verdict is domination on both counts and never a count of wrongly stacked
    pairs, because the rules do not stack the same number of pairs: a rule can
    stack twice as many and be wrong about a smaller share of them, which is a
    better rule and a bigger number.
    """
    lines = [
        f"\nlinkage at strictness {strictness} -- ADR 0003 leaves this open and the"
        " labels close it"
    ]
    for linkage in LINKAGE:
        tally = scored.get(Setting(strictness, linkage))
        if tally is None:
            continue
        lines.append(
            f"  {linkage:<10} precision {percent(tally.precision)}   "
            f"recall {percent(tally.recall)}   "
            f"{tally.wrongly_together} wrongly stacked of {tally.together + tally.wrongly_together}"
        )
    strict = scored.get(Setting(strictness, "complete"))
    if strict is None:
        return lines
    better = [
        linkage
        for linkage in LINKAGE
        if linkage != "complete"
        and Setting(strictness, linkage) in scored
        and beats(scored[Setting(strictness, linkage)], strict)
    ]
    if better:
        lines.append(
            f"  {' and '.join(better)} linkage {'beats' if len(better) == 1 else 'beat'}"
            " complete linkage on precision *and*"
            " recall here, so the labels say complete linkage needs softening: the"
            " reader's long bursts hold pairs that agree on nothing, and complete"
            " linkage cannot express a stack that has one."
        )
    else:
        lines.append(
            "  nothing softer beats complete linkage on both counts, so it stands:"
            " a softer rule here buys recall with precision, which is the constraint."
        )
    return lines


def noise_floor(
    subjects: Sequence[Case],
    points: Points,
    floor: float = PRECISION,
    linkages: Sequence[str] = tuple(LINKAGE),
    chosen: Setting | None = None,
) -> list[str]:
    """Strictness 4 priced explicitly, whatever `--strictness` happens to contain.

    **Because four is not a low Match, it is the lowest Match there is.** A RANSAC
    homography cannot return fewer than four inliers, so a pair scoring exactly 4
    is a pair the geometry could not say anything about -- 117,744 of this catalog's
    pairs are that pair, the largest bucket in `pair_match`, and 1, 2 and 3 hold
    15,062 between them. All three of the runs the reader reported as wrongly split
    live in the band 4 to 9, so a strictness of 4 merges all three and the belief
    that it does so at a catastrophic cost is exactly that: a belief. This section
    is where it becomes a number.

    Scored on its own rather than read off the sweep, so that narrowing the sweep
    cannot quietly drop it: the value is `NOISE_FLOOR` and never an entry of `SWEEP`
    that happens to coincide with it.
    """
    scored = sweep(subjects, points, (NOISE_FLOOR,), linkages)
    lines = [
        f"\nrule 4 -- the Match at or above {NOISE_FLOOR}, which is its noise floor"
        " rather than a low score",
        f"  a homography cannot return fewer than {NOISE_FLOOR} inliers, so this is the"
        " loosest question the Match can",
        "  be asked. It merges all three of the runs the reader reported as wrongly"
        " split, and what it costs",
        "  everywhere else is the assertion this section replaces:",
        *table(scored, len(subjects)),
    ]
    # At the linkage the control chose first, because that is the one the grid is
    # actually drawn with: "not catastrophic at some linkage" is a different claim
    # from "not catastrophic here", and the reader's grid only has the one.
    if chosen is not None:
        here = scored.get(Setting(NOISE_FLOOR, chosen.linkage))
        if here is not None:
            verdict = (
                "clears" if (here.precision or 0.0) >= floor else "falls under"
            )
            lines.append(
                f"  at {chosen.linkage} linkage, which is what the control chose, it"
                f" {verdict} the {floor:.0%} floor:"
                f" {percent(here.precision)} precision and {percent(here.recall)}"
                f" recall, worst case {here.concentration} wrongly stacked."
            )
    clearing = [
        setting
        for setting, tally in scored.items()
        if tally.precision is not None and tally.precision >= floor
    ]
    if not clearing:
        worst = max(
            (tally.precision for tally in scored.values() if tally.precision is not None),
            default=None,
        )
        lines.append(
            f"  and no linkage clears the floor at all -- the best precision the noise"
            f" floor reaches is {percent(worst)} -- so the expectation holds and this"
            " is the number behind it."
        )
    else:
        best = max(clearing, key=lambda setting: scored[setting].recall or 0.0)
        under = (
            "every rule in the running"
            if len(clearing) == len(scored)
            else f"{len(clearing)} of the {len(scored)} rules in the running"
        )
        lines.append(
            f"  it clears the floor under {under}, the best of them being"
            f" {describes(best)} at {percent(scored[best].precision)} precision and"
            f" {percent(scored[best].recall)} recall -- so what the noise floor costs"
            " is a question about the linkage and not only about the threshold."
        )
    return lines


def crossing(
    scored: dict[Setting, Tally],
    strictnesses: Sequence[int],
    thresholds: Sequence[float],
    linkage: str,
    floor: float = PRECISION,
) -> list[str]:
    """Rule 3's two thresholds as a surface, because a single pick hides the exchange.

    **A frontier and a table, and the table comes first.** The frontier is the
    honest object -- every point on it buys recall with precision or the other way
    about, and picking one would hide the rate at which the two thresholds trade --
    but a frontier of a dozen pairs of numbers is not something a reader can see the
    shape of. So the surface is printed as two matrices, recall over precision, and
    the frontier is printed under them as the short list of settings nothing else
    beats on both counts.

    One linkage, because rule 3 is the control pick with a second way in and the
    linkage is the half of that pick this rule is not asking about. A third axis
    here would be a table nobody reads and a population count in `stack_member`
    that multiplies for a question nobody asked.
    """
    lines = [
        f"\nrule 3's surface at {linkage} linkage -- rows are the cosine floor, columns"
        " the strictness",
        "  every cell is that pair of thresholds read as *either*, so no cell asks less"
        " of the labels than its",
        "  column does with no cosine at all: rule 3 is a loosening of rule 1. Both"
        " thresholds tighten away from",
        "  the top left. A cell of . stacked nothing, so it has no precision to report.",
    ]
    for reading in ("recall", "precision"):
        said = f" -- the floor is {floor:.0%}" if reading == "precision" else ""
        lines.append(f"\n  {reading}, %{said}")
        lines.append("  cosine  " + "".join(f"{value:>6}" for value in strictnesses))
        for one in thresholds:
            cells = []
            for strictness in strictnesses:
                tally = scored.get(Setting(strictness, linkage, one))
                value = None if tally is None else getattr(tally, reading)
                cells.append("     ." if value is None else f"{value * 100:6.1f}")
            lines.append(f"  {one:<6.2f}  " + "".join(cells))
    lines.append(
        "\n  the frontier -- every setting here buys recall with precision or the other"
        " way about"
    )
    for setting in frontier(scored):
        tally = scored[setting]
        lines.append(
            f"  {threshold(setting.strictness):>10} {threshold(setting.cosine):>8}   "
            f"precision {percent(tally.precision)}   recall {percent(tally.recall)}"
            f"   worst case {tally.concentration:>5}"
        )
    return lines


@dataclass(frozen=True)
class Priced:
    """One rule, and the best setting of it the labels allow -- or none at all.

    A rule with no setting is a **refuted** rule and that is the strong reading this
    report is allowed to make: nothing it can be set to reproduces the reader's own
    answers well enough to clear the floor. The other direction has no such word,
    which is what `caveat` is about.
    """

    name: str
    chosen: Setting | None
    tally: Tally | None


def priced(
    name: str, scored: dict[Setting, Tally], floor: float = PRECISION
) -> Priced:
    """One rule's own best setting, chosen inside that rule and never across rules."""
    chosen = choose(scored, floor)
    return Priced(name=name, chosen=chosen, tally=None if chosen is None else scored[chosen])


def together(
    rules: Sequence[Priced],
    control: Priced,
    measured: Bias,
    held: Mapping[str, Tally],
    floor: float = PRECISION,
) -> list[str]:
    """The four rules side by side, read against what the labels can actually say.

    **The comparison and never a choice.** Ticket 93 asks whether a fingerprint-based
    rule survives the reader's existing answers, and the answer it can return is a
    survival and not a decision: acting on it is ticket 95's, and the last lines here
    say so in the report's own words rather than leaving it to whoever opens the
    ticket. The prior going in was that rule 3 wins, on the reasoning that an OR
    cannot lose ground already held; a prior is not a finding, so what is printed is
    what the tallies say and the prior is not mentioned.

    **It is printed last, after every check, and that is the whole of why.** The
    choosing slice can only ever say that a rule reaches further and pays precision
    for it -- the trade -- and the held-back quarter is the one population here that
    can refute a fingerprint rule outright. A synthesis printed above it would hand a
    reader "rule 3 reaches further" and leave them to find the refutation eighty
    lines down. `held` is handed in rather than worked out here so that the verdicts
    this reads are the same tallies `holdout` printed and never a second scoring that
    could come to disagree with it.
    """
    lines = [
        "\nwhat the rules say together, which is the whole reason they are scored apart"
    ]
    for one in rules:
        if one.chosen is None or one.tally is None:
            lines.append(
                f"  {one.name:<7} refuted -- no setting of it reaches the"
                f" {floor:.0%} precision floor on these labels"
            )
            continue
        lines.append(
            f"  {one.name:<7} {describes(one.chosen)}:"
            f" precision {percent(one.tally.precision)},"
            f" recall {percent(one.tally.recall)},"
            f" worst case {one.tally.concentration}"
        )
    if control.tally is None or control.chosen is None:
        lines.append(
            "\n  the control is refuted, so there is no ground already held to compare"
            " against: what the grid draws"
        )
        lines.append(
            "  today does not clear the floor on the round that chose it, and that is the"
            " finding rather than any rule below it."
        )
        return lines
    better = [
        one
        for one in rules
        if one is not control and one.tally is not None and beats(one.tally, control.tally)
    ]
    # Identity and never equality: a `Priced` carries a whole `Tally`, and two rules
    # that happened to score the same would compare equal and drop each other.
    reaches = [
        one
        for one in rules
        if one is not control
        and one.tally is not None
        and (one.tally.recall or 0.0) > (control.tally.recall or 0.0)
        and not any(one is already for already in better)
    ]
    if better:
        listed = ", ".join(one.name for one in better)
        lines.append(
            f"\n  {listed} {'beats' if len(better) == 1 else 'beat'} the control on"
            " precision *and* recall at once, which is the"
        )
        lines.append(
            "  strongest thing these labels can say for a rule -- and it is still not a"
            " confirmation."
        )
    elif reaches:
        listed = ", ".join(one.name for one in reaches)
        one_of_them = len(reaches) == 1
        lines.append(
            f"\n  {listed} {'reaches' if one_of_them else 'reach'} further than the"
            f" control and {'pays' if one_of_them else 'pay'} precision for it,"
        )
        lines.append(
            "  which is the trade this report never blends: whether it is worth taking"
            " is a question about the floor."
        )
    else:
        lines.append(
            "\n  nothing beats the control and nothing reaches further than it, so these"
            " labels hold no case for"
        )
        lines.append(
            "  moving the grid. That is a real finding and it is the third time a report"
            " here has returned it."
        )
    lines += standing(rules, control, held, floor)
    lines.append(
        f"\n  read all of that against the caveat: {percent(measured.reached)} of the"
        f" {measured.disagreeing:,} disagreeing pairs in these"
    )
    lines.append(
        "  runs are placed by any answer at all, so a rule surviving here has survived a"
        " sample drawn to be"
    )
    lines.append(
        "  easy for the Match. Refuted means refuted; survived means not yet refuted."
    )
    return lines


def standing(
    rules: Sequence[Priced],
    control: Priced,
    held: Mapping[str, Tally],
    floor: float,
) -> list[str]:
    """What the held-back quarter leaves standing, which is the report's verdict.

    **A pick that failed a slice it never saw is refuted, and that outranks anything
    the choosing slice said for it.** The trade above is measured on the labels that
    chose the pick; this is measured on labels that had no part in choosing it, and a
    rule that contradicts those has contradicted answers the reader really gave. The
    bias runs the other way here and cannot be argued around: the checking slice is
    banded on the Match exactly as the choosing slice is, so it can refute a
    fingerprint rule and it still cannot confirm one.
    """
    if not held:
        return [
            "\n  the held-back quarter scored nothing, so no pick has been checked"
            " against labels that did not choose it."
        ]
    kept, lost = [], []
    for one in rules:
        tally = held.get(one.name)
        if tally is None or tally.precision is None:
            continue
        (kept if tally.precision >= floor else lost).append(one)
    if not lost:
        return [
            "\n  every pick also clears the floor on the quarter held back, so nothing"
            " here is refuted -- and, for",
            "  the caveat's reason, nothing here is confirmed either.",
        ]
    lines = [
        f"\n  on the quarter held back, {', '.join(one.name for one in lost)}"
        f" {'falls' if len(lost) == 1 else 'fall'} under the {floor:.0%} floor"
        f" -- the block above. A pick"
    ]
    lines.append(
        "  that fails a slice it never saw has contradicted answers the reader gave,"
        " which is a refutation and"
    )
    if kept:
        held_control = any(one is control for one in kept)
        lines.append(
            "  outranks the trade above. What these labels leave standing is"
            f" {', '.join(one.name for one in kept)}"
            + (
                ", which is the control."
                if len(kept) == 1 and held_control
                else ", the control among them."
                if held_control
                else " -- and not the control."
            )
        )
    else:
        lines.append(
            "  outranks the trade above. No pick survives it, the control included,"
            " which is a finding about the"
        )
        lines.append(
            "  choosing slice rather than about any rule: it did not have enough in it"
            " to settle this."
        )
    return lines


def fence(cases: Sequence[Case]) -> list[str]:
    """What the reader said about the frame past the end of the run.

    Not scored, because no strictness reaches it -- see the module docstring. It
    is reported because it is the one piece of evidence about the 3600s window
    the labels hold at all.
    """
    named = [subject for subject in cases if subject.beyond_in]
    checked = sum(len(subject.beyond_out) for subject in cases)
    lines = [
        f"\nthe fence, which no strictness reaches: {checked} frames past the end of a"
        " run were shown and left out,"
    ]
    if not named:
        lines.append(
            "  and none was called a member. The 3600s window is not what is losing"
            " frames here."
        )
    else:
        lines.append(f"  and {len(named)} were called members, which is the window's bill:")
        for subject in named:
            lines.append(f"    {subject.name}   {len(subject.beyond_in)} beyond the run")
    return lines


def repeats(read: Sequence[Case], contests: Mapping[str, Sequence[Case]]) -> list[str]:
    """What the sets answered more than once say -- about the reader, and about here.

    Two things, and the first is the one the precision floor has been missing. The
    floor has moved twice, 95% to 85%, and nothing has ever measured how repeatable
    the answers it is scored against are: a rule reproducing the reader at 97% means
    something different if the reader reproduces themselves at 99% than if they do
    at 80%. That rate is the ceiling the table below is read against.

    The second is which sets are set aside and why, in the report's own words rather
    than only in `contested`'s docstring -- a convention a reader has to open the
    source to find is one they will read the numbers without.

    `contests` is handed in rather than worked out here, so that the sets this names
    are the same objects the caller removes from the sweep and not a second
    computation that could come to disagree with it.
    """
    twice = asked_again(read)
    if not twice:
        return [
            "\nre-asked  no set carries an answer from more than one round, so there is"
            " no self-consistency rate to read the precision below against -- the floor"
            " has moved twice and how repeatable the answers under it are has never"
            " been measured. A round drawn to ask again is what settles that. Nothing"
            " is set aside here."
        ]
    steady = len(twice) - len(contests)
    lines = [
        f"\nre-asked  {len(twice)} set(s) carry an answer from more than one round, and"
        f" {steady} of them agree wherever both",
        "          answers place the same pair -- a self-consistency rate of"
        f" {steady / len(twice):.1%}, which is the ceiling every",
        "          precision below is read against. Over the shared pairs, since an"
        " answer given with the view",
        "          widened further is not denying a frame the earlier one never saw.",
    ]
    if not contests:
        lines.append(
            "          none of them contradicts, so every answer in the file is scored."
        )
        return lines
    lines += [
        f"          {len(contests)} of them contested, and none of those is scored"
        " against any setting at all. The reader",
        "          placed the same pair together in one round and apart in another, so"
        " every rule is right about it",
        "          once and wrong about it once: including them would add the same count"
        " to every setting's errors,",
        "          move no ranking, and drag every precision toward a floor that is a"
        " real threshold. Scoring only",
        "          the newest answer would buy a verdict with a preference for recency"
        " the labels do not support.",
        "          So they are named here and counted nowhere:",
    ]
    for given in contests.values():
        said = ", ".join(f"round {subject.round} {subject.verdict}" for subject in given)
        crossed = {
            pair
            for index, one in enumerate(given)
            for other in given[index + 1 :]
            for pair in disagree(one, other)
        }
        lines.append(
            f"            {given[0].name}   {said}   {len(crossed)} pair(s) placed both ways"
        )
    return lines


def evidence(read: Sequence[Case], points: Points) -> list[str]:
    """What the labels are made of, before any setting is scored against them.

    Three facts the table cannot say and would otherwise be read past. The
    reader's longest drags carry the positive evidence quadratically, so their
    share is stated. A pair with no Match at all was never checked -- the screen
    rejected it or a substrate was missing -- and no strictness reaches it, so it
    is a ceiling on recall and not a verdict on the threshold. And the strongest
    pair the reader pushed out is the ceiling on precision, for the same reason
    in the other direction.
    """
    kept, pushed, unchecked = [], [], 0
    weight: list[tuple[int, str]] = []
    for subject in read:
        held = 0
        for early, late, same in pairs(subject):
            if same and (early, late) not in points and (late, early) not in points:
                unchecked += 1
            held += same
            (kept if same else pushed).append(label.match(points, early, late))
        weight.append((held, subject.name))
    if not kept:
        return []
    weight = sorted(weight)[::-1][:5]
    share = sum(count for count, _ in weight) / len(kept)
    return [
        f"evidence  {len(kept)} pairs the reader kept together, {len(pushed)} they pushed"
        " apart",
        f"          the five longest sets are {share:.0%} of the pairs kept together: "
        + ", ".join(f"{name} ({count})" for count, name in weight),
        f"          {unchecked} kept pairs carry no Match row at all -- the screen"
        " rejected them or a substrate was missing, so no strictness reaches them",
        f"          {sum(1 for m in kept if m == 0) - unchecked} more were checked and"
        " agreed on nothing, which is the linkage's problem and not the screen's",
        f"          the strongest pair pushed apart scores {max(pushed, default=0)} points,"
        " which is where precision stops",
    ]


def made_of(subjects: Sequence[Case], points: Points) -> list[str]:
    """What one round's labels are made of, before any setting is scored on them.

    Per round and never pooled, for `rounds`' reason: the ceilings a round carries
    are facts about the sets *it* was dealt, and a round drawn to break a chaining
    rule is made of different sets from the round that chose the setting. Averaging
    the two would describe neither.
    """
    return [
        f"scope     {sum(len(pairs(subject)) for subject in subjects)} labelled pairs"
        f" over {len({subject.run for subject in subjects})} runs, each one inside the"
        " frames the reader was shown",
        *evidence(subjects, points),
        *fence(subjects),
    ]


def chained(
    scored: dict[Setting, Tally], chosen: Setting, floor: float = PRECISION
) -> list[str]:
    """What another round says about the rule ADR 0003 declined without measuring it.

    This is the comparison round two exists for. Round one recommended neighbour
    linkage and the ADR declined it on the evidence's shape rather than on its
    numbers: the runs where a chain does its work carried no frame the reader
    pushed out, so a chain that walks a whole run into one stack scored perfectly.
    Round two's sets are drawn where a chain crosses a boundary the settled rule
    drew, so here the chain can finally be wrong.

    **When the chain is itself what was chosen, the question changes shape.** There
    is no rule for it to beat -- it would be beating itself -- and asking whether it
    does would print a tautology. What these sets can still answer is the one that
    matters: on the population drawn to break it, does it clear the floor it was
    chosen under. So that is what is asked instead.
    """
    lines = [
        f"\nthe chain, at strictness {chosen.strictness} -- what these sets were drawn"
        " to price"
    ]
    for linkage in LINKAGE:
        tally = scored.get(Setting(chosen.strictness, linkage))
        if tally is None:
            continue
        lines.append(
            f"  {linkage:<10} precision {percent(tally.precision)}   "
            f"recall {percent(tally.recall)}   "
            f"{tally.wrongly_together} wrongly stacked of"
            f" {tally.together + tally.wrongly_together}"
        )
    chain, settled = (
        scored.get(Setting(chosen.strictness, "neighbour")),
        scored.get(chosen),
    )
    if chain is None or settled is None:
        return lines
    if chosen.linkage == "neighbour":
        if chain.precision is None:
            lines.append(
                "  the chain is the chosen rule and it stacked nothing here, so these"
                " sets neither confirm nor deny it."
            )
        elif chain.precision >= floor:
            lines.append(
                f"  the chain is the chosen rule, and on the sets drawn to break it it"
                f" holds {percent(chain.precision)} precision -- clear of the"
                f" {floor:.0%} floor. ADR 0003 declined it under a 95% floor, and this"
                " is where that declining is re-read rather than assumed: the rule did"
                " not change, the floor did."
            )
        else:
            lines.append(
                f"  the chain is the chosen rule and it falls to"
                f" {percent(chain.precision)} precision here, under the {floor:.0%}"
                " floor it was chosen to clear -- on the population drawn to break it."
                " That is a reason to set it aside with `--linkage`, and it is the"
                " measurement ADR 0003 declined it without."
            )
        return lines
    if beats(chain, settled):
        lines.append(
            f"  the chain still beats {chosen.linkage} linkage on both counts, on the"
            " sets drawn to break it. Round one could not price it and this round"
            " could: that is a reason to revisit the default rather than a tie."
        )
    else:
        lines.append(
            f"  the chain does not beat {chosen.linkage} linkage here, which is the"
            " measurement round one could not make: ADR 0003 declined it by argument"
            " and these sets were drawn where the argument said it would fail."
        )
    return lines


def check(
    number: int,
    subjects: Sequence[Case],
    points: Points,
    chosen: Setting,
    floor: float = PRECISION,
) -> list[str]:
    """One other round, read as a check on the setting and never as evidence for it.

    Other and not later: the newest round is what chooses now, so the rounds
    replayed here are the earlier ones -- see `rounds`. What they check is
    unchanged, and so is why they cannot vote: rounds one and two were answered
    under a stricter floor than the one being asked about, which makes them a
    check worth having and evidence that would answer the wrong question.

    The setting is not re-chosen here. What is asked is the narrower question a
    check can answer: does the setting the choosing slice picked still reproduce
    what the reader says, on sets it did not pick from -- and does the rule ADR
    0003 declined go wrong on sets drawn to make it.

    **Every rule names the cases it gets wrong here, not only the chosen one.**
    A count says a chain is worse; only the case says which run it walked out of,
    and on sets drawn where a chain crosses a boundary that run *is* the finding.

    **`--linkage` does not narrow this.** Narrowing the running says which rules
    may be *chosen*, and the rule a reader set aside is exactly the one round two
    exists to price -- the ADR's own recorded command excludes the chain, and a
    check that took that as licence not to score it would drop the round's whole
    point. So every rule in `LINKAGE` is scored here, at the one strictness that
    was chosen.
    """
    sure, band = confident(subjects), grey(subjects)
    lines = [
        f"\nround {number}, a check on {describes(chosen)}"
        " -- scored apart and never pooled into the evidence above",
        f"labels    {len(subjects)} answers -- {len(sure)} confident,"
        f" {len(band)} not sure",
        *made_of(subjects, points),
    ]
    if not sure:
        return [*lines, "\n  no confident answer in this round, so nothing to check with"]
    scored = sweep(sure, points, (chosen.strictness,), tuple(LINKAGE))
    held = scored[chosen]
    lines.append(
        f"\nheld      precision {percent(held.precision)}, recall"
        f" {percent(held.recall)}, {len(held.wrong)}/{len(sure)} cases wrong"
    )
    lines += chained(scored, chosen, floor)
    lines.append(
        "\nwhere each rule goes wrong on this round's labels, at the chosen strictness"
    )
    lines += diagnosis(scored)
    return lines


def checks(
    subjects: Sequence[Case],
    points: Points,
    picks: Sequence[Priced],
    cosines: Cosines | None = None,
) -> dict[str, Tally]:
    """Each rule's pick, scored on the slice of the round that never voted on it.

    Scored once and read twice -- `holdout` prints it and `standing` reads the
    verdict out of it -- because a second scoring of the same picks against the same
    labels is a second thing that can come to disagree with the first.
    """
    sure = confident(subjects)
    if not sure:
        return {}
    return {
        one.name: sweep(
            sure,
            points,
            (one.chosen.strictness,),
            (one.chosen.linkage,),
            (one.chosen.cosine,),
            cosines,
        )[one.chosen]
        for one in picks
        if one.chosen is not None
    }


def holdout(
    subjects: Sequence[Case],
    picks: Sequence[Priced],
    held: Mapping[str, Tally],
    floor: float,
) -> list[str]:
    """The quarter of the newest round held back, scored against picks it did not make.

    This is the confirmation a second sitting used to provide, taken out of the
    same round rather than out of another evening. The slice never entered the
    sweep, so the number it returns is a check and not an echo -- see `partition`
    for why the split is a hash of the answer's key and not a draw.

    **Every rule's pick and not only the control's.** The slice is the one
    population in this report that can refute a fingerprint rule without a fresh
    sitting: it is drawn from the same round, so it carries the same sampling bias
    and cannot confirm anything, but a pick that fails here has contradicted answers
    it never saw. Refuting is what these labels are for.

    **A pick that fails its check is printed as failing.** The report does not
    re-choose from the checking slice and then present that as the answer: the
    slice would stop being a check the moment it chose, and the failure is the
    finding. What failing means here is the same thing it means everywhere else in
    this report -- the precision floor -- and the concentration is printed beside
    it because a pick can clear the floor and still put every one of its mistakes
    into one stack.
    """
    sure = confident(subjects)
    lines = [
        f"\nthe held-back quarter of this round, {len(subjects)} answers"
        f" ({len(sure)} confident) that never entered the sweep"
    ]
    if not sure:
        return [*lines, "  no confident answer was held back, so the picks are unchecked"]
    scored: dict[Setting, Tally] = {}
    for one in picks:
        if one.chosen is None or one.name not in held:
            lines.append(
                f"  {one.name:<7} refuted on the choosing slice, so there is no pick to"
                " check"
            )
            continue
        tally = held[one.name]
        scored[one.chosen] = tally
        lines.append(
            f"  {one.name:<7} {describes(one.chosen)}:"
            f" precision {percent(tally.precision)}, recall {percent(tally.recall)},"
            f" worst case {tally.concentration} wrongly stacked,"
            f" {len(tally.wrong)}/{len(sure)} cases wrong"
        )
        if tally.precision is None:
            lines.append(
                "          it stacked nothing at all here, so the slice cannot confirm"
                " or deny it"
            )
        elif tally.precision >= floor:
            lines.append(
                f"          which clears the same {floor:.0%} floor it was chosen under,"
                " on labels that had no part in choosing it: the pick checks out."
            )
        else:
            lines.append(
                f"          which is under the {floor:.0%} floor it was chosen to clear."
                " **The pick fails its own check.** It is reported rather than"
                " re-chosen -- the slice would stop being a check the moment it picked"
                " -- and what it says is that the choosing slice did not have enough in"
                " it to settle this."
            )
    if not scored:
        return lines
    lines.append("\nwhere the picks go wrong on the held-back labels")
    lines += diagnosis(scored)
    return lines


def report_choice(
    scored: dict[Setting, Tally],
    chosen: Setting,
    floor: float,
    cases_scored: int | None = None,
) -> None:
    """The chosen setting and, in one line, why it and not the one above it.

    **It is not always the best recall and the line must not say it is.** The
    tie-break hands back a setting a hair behind the top one whenever that one
    buries its mistakes in a single stack, and a reader comparing this line against
    the table has to be able to see that rather than conclude the table is wrong.
    So where the pick gave up recall, this names what it gave up and what it bought.
    """
    best = scored[chosen]
    scope = "" if cases_scored is None else f", {len(best.wrong)}/{cases_scored} cases wrong"
    print(
        f"\nchosen    {describes(chosen)}: "
        f"precision {percent(best.precision)}, recall {percent(best.recall)}, "
        f"worst case {best.concentration} wrongly stacked{scope}"
    )
    top = max(
        (
            tally.recall or 0.0
            for tally in scored.values()
            if tally.precision is not None and tally.precision >= floor
        ),
        default=0.0,
    )
    if best.recall is not None and best.recall < top:
        print(
            f"          not the best recall clearing the {floor:.0%} floor -- that is"
            f" {percent(top)} -- but within a hair of it and less concentrated:"
            f" {best.concentration} wrongly stacked in its worst case"
        )
    else:
        print(
            f"          the best recall of everything clearing a {floor:.0%} precision floor"
        )


def report(
    read: Sequence[Case],
    points: Points,
    cosines: Cosines,
    orphans: Sequence[str],
    strictnesses: Sequence[int] = SWEEP,
    floor: float = PRECISION,
    linkages: Sequence[str] = tuple(LINKAGE),
    thresholds: Sequence[float] = COSINES,
) -> Setting | None:
    """Every rule, scored apart, and the control returned.

    **The control is what comes back and never the winner of a comparison.** What
    the grid draws is the Match against strictness, `holdout` and `check` are
    checks on that pick, and ADR 0003 records it -- so the return value is that
    pick, whatever the two fingerprint rules turned out to score. Moving the grid
    is ticket 95's and the caveat says why the numbers alone are not enough to.
    """
    split = rounds(read)
    print(f"labels    {len(read)} answers over {len(split)} round(s):")
    for number, subjects in split.items():
        print(
            f"          round {number}   {len(subjects)} answers --"
            f" {len(confident(subjects))} confident,"
            f" {len(grey(subjects))} not sure"
        )
    if orphans:
        print(f"orphans   {len(orphans)} answers whose frames are in no run any more:")
        for members in orphans:
            print(f"          {members}")
    if not split:
        return None

    # Set aside before anything is scored, and before the round split, so that no
    # population -- the evidence, the quarter held back from it, or an earlier
    # round replayed as a check -- is scored against a set the reader answered two
    # ways. See `contested` for why that is the convention and what it costs.
    contests = contested(read)
    print(*repeats(read, contests), sep="\n")
    read = [subject for subject in read if filed(subject) not in contests]
    split = rounds(read)
    if not split:
        # Every answer in the file is contested, which the block above has just
        # named. There is nothing left to score and nothing further to say.
        return None

    # Counted once and printed twice: at the top, before any number, because a
    # reader of the output alone has to reach the tables already knowing what they
    # can and cannot settle -- and again in the synthesis at the very bottom.
    measured = bias(read, points, cosines)
    print(*caveat(measured), sep="\n")

    # The **newest** round is the evidence and every earlier one is a check on what
    # it chose -- see `rounds` for why the inversion, and the module docstring for
    # why it was deliberate. Three quarters of that round choose and the other
    # quarter checks the pick afterwards.
    *earlier, newest = split
    choosing, checking = partition(split[newest])
    sure, band = confident(choosing), grey(choosing)
    print(
        f"\nround {newest}, the evidence the setting is chosen from --"
        f" {len(choosing)} answers, with {len(checking)} of the round held back"
    )
    print(*made_of(choosing, points), sep="\n")

    if len(sure) < ENOUGH:
        print(
            f"\nchosen    nothing: {len(sure)} confident answers in round {newest}'s"
            f" choosing slice and {ENOUGH} is the least this report will choose from."
            " A sitting this short is settled by a handful of long bursts rather than"
            " by the library -- label more and run it again."
        )
        return None

    # Rule 1: the Match against strictness. The control, and the only rule whose
    # pick this function returns -- it is what the grid draws and what the checks
    # below are checks on.
    scored = sweep(sure, points, strictnesses, linkages)
    print("\nrule 1 -- the Match at or above strictness, which is what the grid draws")
    print(*table(scored, len(sure)), sep="\n")

    print("\nthe trade, which is the whole reason the two are never blended")
    for setting in frontier(scored):
        tally = scored[setting]
        print(
            f"  {setting.linkage:<10} {threshold(setting.strictness):>10}   "
            f"precision {percent(tally.precision)}   recall {percent(tally.recall)}"
            f"   worst case {tally.concentration:>5}"
        )

    chosen = choose(scored, floor)
    if chosen is None:
        print(
            f"\nchosen    nothing: no setting reaches {floor:.0%} precision on round"
            f" {newest}'s choosing slice, so there is no recommendation to make and"
            " nothing for the held-back quarter or an earlier round to check"
        )
    else:
        report_choice(scored, chosen, floor, len(sure))
        print(*softening(scored, chosen.strictness), sep="\n")
    control = Priced("rule 1", chosen, None if chosen is None else scored[chosen])

    # Rule 4: the noise floor, priced whether or not the sweep contains it.
    print(*noise_floor(sure, points, floor, linkages, chosen), sep="\n")

    # Rule 2: the cosine alone. A strictness of `None` is what says the Match is
    # unused -- see `Setting`.
    cosine_scored = sweep(sure, points, (None,), linkages, thresholds, cosines)
    print(
        "\nrule 2 -- the fingerprint cosine at or above a floor, the Match unused"
        f" ({len(thresholds)} values)"
    )
    print(*table(cosine_scored, len(sure)), sep="\n")
    resembles = priced("rule 2", cosine_scored, floor)
    if resembles.chosen is None:
        print(
            f"  nothing clears the {floor:.0%} floor, so these labels refute the cosine"
            " on its own at every value swept"
        )
    else:
        report_choice(cosine_scored, resembles.chosen, floor, len(sure))

    # Rule 3: either of them, at the linkage the control chose. Rule 3 is the
    # control with a second way in, so its linkage is the control's; with no
    # control there is nothing to loosen and the first rule in the running stands
    # in, which the line below says out loud rather than leaving to be inferred.
    crossed = chosen.linkage if chosen is not None else linkages[0]
    either_scored = sweep(sure, points, strictnesses, (crossed,), thresholds, cosines)
    print(
        "\nrule 3 -- the Match at or above strictness *or* the cosine at or above a"
        " floor: a second way in"
    )
    if chosen is None:
        print(
            f"  swept at {crossed} linkage because the control chose nothing to loosen,"
            " so the first rule in the running stands in"
        )
    print(*crossing(either_scored, strictnesses, thresholds, crossed, floor), sep="\n")
    both = priced("rule 3", either_scored, floor)
    if both.chosen is None:
        print(
            f"  nothing clears the {floor:.0%} floor, so these labels refute every pair"
            " of thresholds swept"
        )
    else:
        report_choice(either_scored, both.chosen, floor, len(sure))

    print("\nthe grey band, scored the same way and never fitted to")
    if band:
        print(*table(sweep(band, points, strictnesses, linkages), len(band)), sep="\n")
    else:
        print("  no answer was given as not sure")

    print("\nwhere each setting goes wrong, over the confident labels")
    print(*diagnosis(scored), sep="\n")

    rules = [control, resembles, both]
    held = checks(checking, points, rules, cosines)
    print(*holdout(checking, rules, held, floor), sep="\n")

    # Every other round, replayed against the control. Earlier and not later now:
    # rounds one and two answered a stricter question, so they check the pick
    # rather than make it. They check the control alone -- their sets were drawn
    # on the Match under a stricter floor still, so they are the population least
    # able to say anything about a rule that reads the fingerprint, and the
    # held-back quarter above is where those two picks are checked instead.
    if chosen is not None:
        for number in earlier:
            print(*check(number, split[number], points, chosen, floor), sep="\n")

    # Last, after every check: see `together` for why the synthesis cannot sit
    # above the one population that can refute a rule reading the fingerprint.
    print(*together(rules, control, measured, held, floor), sep="\n")
    return chosen


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m harness.calibrate", description=__doc__.splitlines()[0]
    )
    parser.add_argument(
        "--strictness",
        help="comma-separated Match thresholds to sweep (default: %(default)s)",
        default=",".join(str(value) for value in SWEEP),
    )
    parser.add_argument(
        "--precision",
        type=float,
        default=PRECISION,
        help="the precision floor a setting clears before its recall counts"
        " (default: %(default)s)",
    )
    parser.add_argument(
        "--linkage",
        default=",".join(LINKAGE),
        help="which linkage rules are in the running (default: %(default)s)",
    )
    args = parser.parse_args(argv)
    strictnesses = tuple(int(value) for value in args.strictness.split(","))
    linkages = tuple(name.strip() for name in args.linkage.split(","))
    unknown = [name for name in linkages if name not in LINKAGE]
    if unknown:
        print(f"no such linkage: {', '.join(unknown)} -- have {', '.join(LINKAGE)}")
        return 1

    config = load()
    labels_db = config.catalog_db.parent / label.LABELS
    if not labels_db.exists():
        print(f"no labels at {labels_db}: run python -m harness.label first")
        return 1

    labels = label.store(labels_db)
    try:
        answers = label.answers(labels)
    finally:
        labels.close()
    if not answers:
        print(f"no answers in {labels_db}: run python -m harness.label first")
        return 1

    # The ceiling is `photolib.candidates`' own and is not a knob here: it is the
    # fence the Match rows were computed behind, so cutting the runs at any other
    # value would replay the labels over pairs that were never checked.
    conn = candidates.catalog(config.catalog_db, read_only=True)
    try:
        # `harness.screen`'s refusal, borrowed whole rather than weakened: two of
        # the rules below are thresholds on `candidate_pair.screen`, and a table
        # whose verdicts were decided at some screen other than the frozen one
        # cannot be re-read at any threshold. Nothing here moves `SCREEN`.
        candidates.refuse_if_rethresholded(conn)
        frames = candidates.population(conn)
        read, orphans = cases(answers, candidates.runs(frames, candidates.CEILING))
        wanted = {sha256 for subject in read for sha256 in subject.run}
        points = checked(conn, wanted)
        cosines = screens(conn, wanted)
    finally:
        conn.close()

    print(f"catalog   {config.catalog_db}")
    print(f"labels    {labels_db}")
    print(
        f"window    {candidates.CEILING}s ceiling, {matches.METHOD} "
        f"version {matches.VERSION}"
    )
    print(
        f"screen    {fingerprints.MODEL} version {fingerprints.VERSION}, frozen at"
        f" {candidates.SCREEN:.2f}; {len(cosines):,} stored cosines read at"
        f" {min(COSINES):.2f} and above\n"
    )
    report(read, points, cosines, orphans, strictnesses, args.precision, linkages)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except candidates.CandidatesRefused as exc:
        sys.exit(f"refused: {exc}")
