"""The answer to "is it any good", and the two numbers the grid inherits.

`docs/adr/0003-stack-on-verified-match.md` leaves three things unsettled and says
the labelling harness will settle them: the reader's **strictness** -- the
threshold on the Match -- whether **complete linkage** needs softening to
"matches most members", and how tight the fingerprint screen can be. This module
answers the first two by replaying the reader's own answers against every setting
and saying how well each one reproduces what they said.

**Precision and recall are reported apart and never blended.** They are not
equally important here: the reader's binding constraint is precision -- *never
open a stack and see two unrelated photographs* -- and recall is best-effort
under it. A single score would hide exactly the trade the setting is being chosen
for. So precision is a **floor** a setting clears before its recall is allowed to
speak, and never a ranking: ordering on precision alone hands back the corner of
the sweep, where a setting stacks almost nothing and is therefore almost never
wrong. `choose` is that floor and `frontier` is the trade it was drawn across.

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

**The rounds are scored apart.** ADR 0003 asks for two, and the second is a check
rather than more of the first: the earliest round's labels are the evidence a
setting is chosen from, and every later round is replayed against that choice
without voting on it. Pooling them would let the check recommend the thing it is
checking, and an agreement between the two would then be arithmetic rather than a
finding. Round two is also drawn where a *chain* crosses a boundary the settled
rule drew -- the population round one held none of -- so it is the round that can
finally price the rule ADR 0003 declined by argument. See `rounds` and `check`.

    python -m harness.calibrate

It reads the catalog and `labels.sqlite3`, both on the NVMe, opens no substrate
and never touches `G:`. It writes no label and no report -- its output is a
recommendation for `docs/adr/0003-stack-on-verified-match.md`, which a person
writes down. The one thing it can put in the labels file is the round-one stamp
`harness.label._carry_over` would have written anyway, because it opens that file
through the same `store`: reading answers whose round is not recorded yet is what
would otherwise be impossible. It goes with the rest of `harness/` when the grid
ticket lands.
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
from collections.abc import Iterable, Sequence
from dataclasses import dataclass, field

from harness import label
from harness.label import Joins, Points
from photolib import candidates, matches
from photolib.config import load

# The strictness values a run sweeps. Dense where the two populations
# `photolib.matches` measured overlap -- pairs a second or less apart have a
# median Match of 283 against a median of 5 beyond two minutes, so everything
# arguable is under 30 -- and coarse above it, where a set of frames either
# agrees plainly or does not agree at all.
SWEEP = (1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 60, 100)

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
PRECISION = 0.95


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


def confident(cases: Iterable[Case]) -> list[Case]:
    return [subject for subject in cases if subject.confident]


def grey(cases: Iterable[Case]) -> list[Case]:
    return [subject for subject in cases if not subject.confident]


def rounds(cases: Iterable[Case]) -> dict[int, list[Case]]:
    """The labels by the round that asked for them, earliest first.

    **The split is the whole of ADR 0003's second round.** The earliest round is
    the evidence: its labels are what the sweep is scored over and what `choose`
    picks a setting from. Every later round is a *check* on that pick, and a check
    that was pooled into the evidence would be voting for the thing it is
    checking -- the setting would be recommended partly by the labels drawn to
    test it, and an agreement between the two would be arithmetic rather than a
    finding.

    Earliest and not "round 1", so a labels file holding only a later round still
    has evidence to be read from and says which round it is.
    """
    split: dict[int, list[Case]] = {}
    for subject in cases:
        split.setdefault(subject.round, []).append(subject)
    return dict(sorted(split.items()))


# --- scoring a setting --------------------------------------------------------


@dataclass(frozen=True)
class Setting:
    strictness: int
    linkage: str


@dataclass(frozen=True)
class Wrong:
    """One pair a setting got wrong, and the evidence it got it wrong from."""

    kind: str  # "wrongly together" or "missed"
    early: str
    late: str
    points: int


@dataclass
class Tally:
    """What one setting did to the labels it was replayed against.

    Three counts and never a fourth: the pair both the reader and the setting
    left apart is the overwhelming majority and reporting it would flatter every
    setting equally. Precision and recall are the two questions asked of these
    three, and they are kept apart -- see the module docstring.
    """

    together: int = 0  # the reader kept them together and so did the setting
    wrongly_together: int = 0  # the setting stacked what the reader pushed out
    missed: int = 0  # the reader kept them together and the setting did not
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

    def note(self, subject: Case, entry: Wrong) -> None:
        self.wrong.setdefault(subject.name, []).append(entry)


def placed(
    run: Sequence[str], points: Points, strictness: int, joins: Joins
) -> dict[str, int]:
    """Which stack each frame of a run lands in, at one setting.

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
        for index, stack in enumerate(label.link(run, points, strictness, joins))
        for sha256 in stack
    }


def replay(cases: Iterable[Case], points: Points, strictness: int, joins: Joins) -> Tally:
    """Score one setting against every label, naming what it got wrong."""
    tally = Tally()
    walked: dict[tuple[str, ...], dict[str, int]] = {}
    for subject in cases:
        at = walked.get(subject.run)
        if at is None:
            at = walked[subject.run] = placed(subject.run, points, strictness, joins)
        for early, late, same in pairs(subject):
            stacked = at[early] == at[late]
            if same and stacked:
                tally.together += 1
            elif same:
                tally.missed += 1
                tally.note(
                    subject, Wrong("missed", early, late, label.match(points, early, late))
                )
            elif stacked:
                tally.wrongly_together += 1
                tally.note(
                    subject,
                    Wrong("wrongly together", early, late, label.match(points, early, late)),
                )
    return tally


def sweep(
    cases: Sequence[Case],
    points: Points,
    strictnesses: Sequence[int] = SWEEP,
    linkages: Sequence[str] = tuple(LINKAGE),
) -> dict[Setting, Tally]:
    """Every setting, scored. The order is the order the table is printed in.

    `linkages` narrows which rules are in the running, which is how a decision to
    set one aside is made reproducible: a rule the labels cannot price is
    excluded by naming it on the command line rather than by arguing past the
    recommendation afterwards.
    """
    return {
        Setting(strictness, linkage): replay(cases, points, strictness, LINKAGE[linkage])
        for linkage in linkages
        for strictness in strictnesses
    }


def choose(scored: dict[Setting, Tally], floor: float = PRECISION) -> Setting | None:
    """The best recall among the settings that clear the precision floor.

    Precision is the binding constraint and recall is best-effort *under* it,
    which is a floor and not a ranking: ordering on precision alone hands back
    the corner of the sweep, where a setting stacks almost nothing and is
    therefore almost never wrong. So the floor decides who may answer and recall
    decides between them.

    A setting that stacked nothing has no precision and is never chosen -- it was
    not right, it was silent. Ties go to the **stricter** setting, because two
    settings the labels cannot tell apart are not equally safe on the frames
    nobody labelled, and then to complete linkage, because it is ADR 0003's
    default and a softening has to earn itself.

    Where nothing clears the floor there is no recommendation. Saying so is the
    honest answer and picking the least bad setting silently is not.
    """
    order = list(LINKAGE)
    clearing = [
        setting
        for setting, tally in scored.items()
        if tally.precision is not None and tally.precision >= floor
    ]

    def ranked(setting: Setting) -> tuple:
        tally = scored[setting]
        return (
            tally.recall if tally.recall is not None else -1.0,
            tally.precision,
            setting.strictness,
            -order.index(setting.linkage),
        )

    return max(clearing, key=ranked) if clearing else None


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
    """
    scoreable = {
        setting: tally for setting, tally in scored.items() if tally.precision is not None
    }
    return sorted(
        (
            setting
            for setting, tally in scoreable.items()
            if not any(beats(other, tally) for other in scoreable.values())
        ),
        key=lambda setting: -(scoreable[setting].recall or 0),
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


# --- the report ---------------------------------------------------------------


def percent(value: float | None) -> str:
    return "     --" if value is None else f"{value:7.1%}"


def table(scored: dict[Setting, Tally], total: int) -> list[str]:
    """Every setting, by pairs and by cases.

    Both counts, because they answer different questions and neither is the whole
    picture. A pair is the unit the threshold works in and the unit "two
    unrelated photographs in one stack" is about, but it counts a long burst
    quadratically -- the reader's five longest drags are 79% of the pairs they
    kept together. The case count is one vote each and cannot be dominated, and
    is coarse for exactly the same reason.
    """
    lines = [
        "  linkage    strictness   precision    recall    stacked   wrong   missed   cases wrong",
    ]
    for setting, tally in scored.items():
        lines.append(
            f"  {setting.linkage:<10} {setting.strictness:>10}   "
            f"{percent(tally.precision)}   {percent(tally.recall)}   "
            f"{tally.together:>8}   {tally.wrongly_together:>5}   {tally.missed:>6}   "
            f"{len(tally.wrong):>7}/{total}"
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
        lines.append(f"\n  {setting.linkage} at {setting.strictness}")
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


def chained(scored: dict[Setting, Tally], chosen: Setting) -> list[str]:
    """What a later round says about the rule ADR 0003 declined without measuring it.

    This is the comparison round two exists for. Round one recommended neighbour
    linkage and the ADR declined it on the evidence's shape rather than on its
    numbers: the runs where a chain does its work carried no frame the reader
    pushed out, so a chain that walks a whole run into one stack scored perfectly.
    Round two's sets are drawn where a chain crosses a boundary the settled rule
    drew, so here the chain can finally be wrong.
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


def check(number: int, subjects: Sequence[Case], points: Points, chosen: Setting) -> list[str]:
    """One later round, read as a check on the setting and never as evidence for it.

    The setting is not re-chosen here. What is asked is the narrower question a
    check can answer: does the setting the earlier round picked still reproduce
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
        f"\nround {number}, a check on {chosen.linkage} linkage at strictness"
        f" {chosen.strictness} -- scored apart and never pooled into the evidence above",
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
    lines += chained(scored, chosen)
    lines.append(
        "\nwhere each rule goes wrong on this round's labels, at the chosen strictness"
    )
    lines += diagnosis(scored)
    return lines


def report(
    read: Sequence[Case],
    points: Points,
    orphans: Sequence[str],
    strictnesses: Sequence[int] = SWEEP,
    floor: float = PRECISION,
    linkages: Sequence[str] = tuple(LINKAGE),
) -> Setting | None:
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

    # The earliest round is the evidence and every later one is a check on what it
    # chose. See `rounds` for why that is a split and not a preference.
    first, *later = split
    evidently = split[first]
    sure, band = confident(evidently), grey(evidently)
    print(f"\nround {first}, the evidence the setting is chosen from")
    print(*made_of(evidently, points), sep="\n")

    scored = sweep(sure, points, strictnesses, linkages)
    print("\nconfident labels")
    print(*table(scored, len(sure)), sep="\n")

    print("\nthe trade, which is the whole reason the two are never blended")
    for setting in frontier(scored):
        tally = scored[setting]
        print(
            f"  {setting.linkage:<10} {setting.strictness:>10}   "
            f"precision {percent(tally.precision)}   recall {percent(tally.recall)}"
        )

    chosen = choose(scored, floor)
    if chosen is None:
        print(
            f"\nchosen    nothing: no setting reaches {floor:.0%} precision on round"
            f" {first}'s labels, so there is no recommendation to make and nothing for a"
            " later round to check"
        )
        return None
    best = scored[chosen]
    print(
        f"\nchosen    {chosen.linkage} linkage at strictness {chosen.strictness}: "
        f"precision {percent(best.precision)}, recall {percent(best.recall)}, "
        f"{len(best.wrong)}/{len(sure)} cases wrong"
    )
    print(f"          the best recall of everything clearing a {floor:.0%} precision floor")
    print(*softening(scored, chosen.strictness), sep="\n")

    print("\nthe grey band, scored the same way and never fitted to")
    if band:
        print(*table(sweep(band, points, strictnesses, linkages), len(band)), sep="\n")
    else:
        print("  no answer was given as not sure")

    print("\nwhere each setting goes wrong, over the confident labels")
    print(*diagnosis(scored), sep="\n")

    for number in later:
        print(*check(number, split[number], points, chosen), sep="\n")
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
        frames = candidates.population(conn)
        read, orphans = cases(answers, candidates.runs(frames, candidates.CEILING))
        points = checked(conn, {sha256 for subject in read for sha256 in subject.run})
    finally:
        conn.close()

    print(f"catalog   {config.catalog_db}")
    print(f"labels    {labels_db}")
    print(
        f"window    {candidates.CEILING}s ceiling, {matches.METHOD} "
        f"version {matches.VERSION}\n"
    )
    report(read, points, orphans, strictnesses, args.precision, linkages)
    return 0


if __name__ == "__main__":
    sys.exit(main())
