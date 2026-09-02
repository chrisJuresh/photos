"""Reads the stored Matches as membership: which stack each tile belongs to.

`docs/adr/0003-stack-on-verified-match.md` decides a stack by a verified pairwise
match, fenced by the clock. `photolib.candidates` enumerated the pairs the fence
admits and screened them, `photolib.matches` gave every survivor a Match, and
`harness.calibrate` settled what to do with those counts: **strictness 20 with
"matches most members"**. This module is the reading -- one row per tile saying
which stack it is in, at the setting that decided it.

**Membership is stored rather than derived per query because it is a property of
the photographs and not of the view.** `photolib.browse` joins this table at
`browse.STACK_SETTING` -- the six key columns below, spelled out there because a
website should not import OpenCV to learn them, and asserted equal in
`tests/test_membership.py` -- so a filter can only remove frames from a stack,
which is ADR 0003's load-bearing consequence. Until this pass has run there is
nothing to join, and the grid draws every tile as its own stack.

**The walk is the one the labels were replayed against.** `link`, the three rules
under `LINKAGE` and `agreement` -- the predicate they ask their question through --
live here and `harness.label` imports them, which is the whole of the argument that
ADR 0003's "What the labels settled" describes what the grid will draw rather than
something adjacent to it: the rule is one rule and not two copies that agree today.
They are on this side of the seam because the harness is deleted when the grid
ticket lands and the arrow between them points one way.

**What a stack rests on is a value and not a threshold spelled out three times.**
`agreement` answers *do these two frames agree?* and the linkage rules take that
answer without knowing what it is made of, so the evidence is one decision with one
name rather than an implicit seam inside `complete`, `majority` and `neighbour`
alike. Today the answer is the Match against the reader's strictness and nothing a
reader can see turns on the seam existing; what it buys is that moving the evidence
-- ADR 0003 leaves the fingerprint's own threshold unsettled -- is another `Agree`
and never another walk.

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

**Who is in the frames is a veto on the walk and never a grouping key.**
`docs/adr/0004-people-veto-a-stack.md` is the other half of a stack now: a stack
needs one member whose people contain every other member's, and where the Match
proposed one with no such member it is split until every part has one. `regroup`
below is the whole of that rule -- one pure function over people sets, no image, no
database and no model -- and it is applied after `link` and before anything is
stored, which is `011_stack_member.sql`'s argument kept whole: the grid reads the
answer and no query re-derives it. It can only ever split. A frame's own people are
`peopled`'s business and are read at the floor the reader's answers left standing,
minus the persons they marked as strangers; the clustering all of that came from is
part of the key, so a grouping made with people and one made without are two
populations and never one.

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
from collections.abc import Callable, Collection, Container, Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path

from photolib import candidates, fingerprints, matches, people
from photolib.config import Config, load

# The reader's strictness: the Match at or above which two frames are the same
# photograph. Settled by the labelling harness and recorded in ADR 0003's "What the
# labels settled". It is a threshold on the Match and never on the fingerprint's
# cosine, which is `photolib.candidates.SCREEN`.
#
# **It was 20 and is 10, because the floor it was chosen under moved.** 20 was the
# best recall clearing a 95% precision floor on round one. The reader then browsed
# that grid and reported both that they never saw two unrelated photographs in one
# stack and that the grouping before any of this was better -- which says the floor
# was above the evidence and the recall it cost is the whole complaint. Round three
# was labelled to answer the looser question and `harness.calibrate` re-ran the
# sweep under an 85% floor: 97.0% precision and 93.2% recall on the choosing slice,
# 90.2% on the quarter held back from it.
STRICTNESS = 10

# The linkage those labels settled, and it moved with the floor: the **chain**, a
# frame joining the stack when it agrees with the frame before it.
#
# ADR 0003 argued from complete linkage, round one's labels overruled that in favour
# of "matches most members", and round three's overrule it again. `neighbour` was
# never feared here -- it was measured and rejected, at 88.8% precision on round
# two's chain-crossing sets against `majority`'s 96.5%, which failed a 95% floor.
# Under 85% it clears: 88.2% on those same sets and 86.0% on round one's, both
# scored at the strictness above. The rule did not change and the floor did.
DEFAULT_LINKAGE = "neighbour"

# What the people column says when the walk read nobody: *no people rule applied*.
# A real value of the column rather than a stand-in for one -- it names the grid the
# reader had before ADR 0004's veto landed, which stays in the table so that the
# change is something they can see rather than be told about.
NO_PEOPLE = "none"

PROGRESS_SECONDS = 30

# The labels file, beside the catalog on the NVMe. **The one thing this package
# reads out of the harness's own database**, and it reads one column of one table:
# ADR 0004's *a stranger never counts* is the reader's judgement and there is
# nowhere else for it to live. Spelled out rather than imported from
# `harness.label`, which is the arrow this repository keeps one-way --
# `tests/test_membership.py` asserts the two spellings agree.
LABELS = "labels.sqlite3"


class MembershipRefused(RuntimeError):
    """Raised before anything is stored. Nothing was written."""


# --- the rule ----------------------------------------------------------------

Points = dict[tuple[str, str], int]
# **Whether two frames agree, as a value: the evidence a stack rests on.** Every
# linkage rule below asks exactly this question and none of them knows what the
# answer is made of, so there is one place where a stack's evidence is decided and
# a different answer is a different value rather than a second walk. Today it is
# always `agreement` -- the Match against the reader's strictness -- and the whole
# of this seam's first job is that nothing a reader can see changed when it
# appeared.
#
# **It is always asked in run order**: the member already in the stack first, the
# frame being considered second. So a predicate need not be symmetric, and what it
# may not assume is that its *evidence* is keyed that way round -- a `pair_match`
# row exists in one order only, which is why `match` looks both ways and why
# anything reading another table has to do the same.
Agree = Callable[[str, str], bool]
# Whether a frame joins the stack in hand: the linkage rule, as a value. `link`
# takes one so that a report can replay the labels against every rule ADR 0003
# left open without a second copy of the walk.
Joins = Callable[[Sequence[str], str, Agree], bool]


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


def agreement(points: Points, strictness: int = STRICTNESS) -> Agree:
    """The evidence the grid ships: the Match at or above the reader's strictness.

    The one `Agree` there is, and the reason this seam exists rather than the three
    rules below each spelling it out: what a stack rests on is a decision of its own,
    separable from how much of a stack a frame has to agree with, and until now the
    two were the same four lines written three times. Moving the evidence is
    therefore building another one of these -- ADR 0003 leaves the fingerprint's own
    threshold unsettled precisely so a rule over the stored cosine can be one -- and
    never another walk.

    Absent evidence reads as no agreement, which is `match`'s doing rather than this
    function's, and either order for the same reason it gives.
    """

    def agrees(early: str, late: str) -> bool:
        return match(points, early, late) >= strictness

    return agrees


def complete(holding: Sequence[str], frame: str, agree: Agree) -> bool:
    """ADR 0003's linkage: a frame joins only if it agrees with all of the stack.

    Named rather than inlined because `harness.calibrate` replays the labels
    against this rule and against the softer ones, and the rule it calls complete
    linkage has to be this one and not a second copy of it.
    """
    return all(agree(member, frame) for member in holding)


def majority(holding: Sequence[str], frame: str, agree: Agree) -> bool:
    """"Matches most members" -- the softening ADR 0003 left open, and its answer.

    Strictly most, so a frame that agrees with half of a stack does not join it: a
    tie is not most, and precision is the constraint that breaks ties here.
    """
    agreed = sum(1 for member in holding if agree(member, frame))
    return agreed * 2 > len(holding)


def neighbour(holding: Sequence[str], frame: str, agree: Agree) -> bool:
    """Single linkage along the run: a frame joins if it agrees with the one before.

    The weakest rule there is, and the one ADR 0003 rejected -- first by argument
    and then on round two's labels, which were drawn where a chain crosses a
    boundary the settled rule drew and found it six points under the precision
    floor.
    """
    return agree(holding[-1], frame)


# The linkage rules as values, in the order a report reads them: the rule ADR 0003
# argued from, the one its labels chose, and the one they rejected.
LINKAGE: dict[str, Joins] = {
    "complete": complete,
    "majority": majority,
    "neighbour": neighbour,
}


def link(
    run: Sequence[str],
    agree: Agree,
    joins: Joins = LINKAGE[DEFAULT_LINKAGE],
) -> list[list[str]]:
    """One run cut into stacks: by `joins`, over what `agree` says about a pair.

    **The two are separate arguments because they are separate decisions.** `agree`
    is what a stack rests on and `joins` is how much of one a frame has to satisfy;
    the walk between them is neither, and it is the same walk whichever pair the two
    make. `joins` keeps its default read off the settled setting rather than written
    out, so that a caller who says nothing gets the rule the labels chose and never
    the rule that was current when this line was typed; `agree` has none, because a
    predicate cannot be built without the Matches it reads and a default that
    silently agreed about nothing would draw a grid of one-frame stacks.

    The walk is forward and greedy whichever rule is in force, as the window grouping
    `photolib.browse` used to do was: a frame the walk consumed early can agree with
    every member of the stack it was placed before, and that split is a coin toss the
    labelling harness scored as one.
    """
    stacks: list[list[str]] = []
    holding: list[str] = []
    for frame in run:
        if holding and joins(holding, frame, agree):
            holding.append(frame)
        else:
            if holding:
                stacks.append(holding)
            holding = [frame]
    if holding:
        stacks.append(holding)
    return stacks


# --- the veto ----------------------------------------------------------------

# What a frame's people are, as `regroup` reads them. A frozen set of person names
# is what was read there; `None` is *the pass looked and nobody is in this frame*,
# which is the nobody clause's subject; and a frame **absent from the mapping** is
# one the people pass never reached, which is neither.
#
# The three are deliberately three. ADR 0004 runs two detectors precisely so that
# `None` and the empty set can differ: the empty set is somebody whose face could
# not be read, which nests into anything and keeps the frame in its burst, and
# `None` is a body detector's answer that there is nobody there at all. The absence
# is the third because a people pass that has not reached a frame must degrade to
# the grid without the rule for that frame rather than to a split.
Who = Mapping[str, frozenset[str] | None]

# What a frame with nobody in it, and a frame nobody looked at, both hold.
EMPTY: frozenset[str] = frozenset()


def identity(
    model: str = people.MODEL,
    version: str = people.VERSION,
    threshold: float = people.THRESHOLD,
    cut: float = people.CUT,
) -> str:
    """The name of the persons a walk read: `face_person`'s whole key, as one value.

    All four columns, because all four decide which persons a frame has -- the cut
    joined that key at migration 013 and a name holding three of them would be
    naming three of the four things that decided the answer.
    """
    return f"{model}/{version}/{threshold}/{cut}"


def clustering(named: str) -> tuple[str, str, float, float]:
    """One people identity back into the four columns it selects on."""
    model, version, threshold, cut = named.rsplit("/", 3)
    return model, version, float(threshold), float(cut)


PEOPLE = identity()


def regroup(members: Sequence[str], who: Who) -> list[list[str]]:
    """One Match-proposed stack, split until every part has a member holding the rest.

    ADR 0004's rule and the whole of it, pure over people sets: no image, no
    database and no model, so the reader's worked example is a test case verbatim.

    **Subset of the cover and not a strict chain.** A stack needs one member whose
    people contain every other member's; the members need not contain one another.
    So `{A,B}`, `{A,C}` and `{A,B,C}` are one stack and `{A,B}` with `{A,C}` alone
    are two -- there is no frame in the second case that shows everybody, so there
    is none worth drawing as a cover.

    **The greedy split.** Where there is no such member: take the frame with the
    most people, keep every frame whose people fit inside it, and run the rule again
    on what is left. `max` returns the first of equals and `members` is in capture
    order, so **ties are settled by capture order** and the answer never depends on
    the day it ran. The frame with the most people is a container whenever one
    exists -- a set containing every other is at least as large as all of them --
    so the loop needs no separate check for the stack that already nests.

    **A frame with nobody in it never joins a frame with somebody in it.** The
    reader's own extra clause, and it does not follow from nesting: the empty set is
    a subset of everything, so a landscape would otherwise disappear into the same
    landscape with a friend standing in it. The frames the pass reached and found
    nobody in leave together, in one part, before anything is nested -- their people
    sets are all empty, so nesting has nothing further to say about them.

    **A frame the pass never reached is exempt from both halves**: it nests into
    anything and it is never a reason to separate anybody, so an incomplete people
    pass degrades to the grid without the rule rather than to a split. Where a
    separation happens anyway it rides with the frames holding somebody, which is
    the side that cannot split it further.

    **It only ever splits.** What comes back is a partition of `members`, in capture
    order within each part, so a part is named by the same rule the walk's own
    stacks are.
    """
    reached = [frame for frame in members if frame in who]
    nobody = [frame for frame in reached if who[frame] is None]
    if not nobody or len(nobody) == len(reached):
        return _nest(members, who)
    absent = set(nobody)
    return [nobody] + _nest([frame for frame in members if frame not in absent], who)


def _nest(members: Sequence[str], who: Who) -> list[list[str]]:
    """The greedy split, over frames the nobody clause has already separated.

    `who.get(frame) or EMPTY` is the one reading of the mapping this half makes, and
    it flattens all three of `Who`'s states to what nests: a frame nobody was found
    in and a frame nobody looked at both hold no people, and no people is a subset
    of everything.
    """
    remaining, parts = list(members), []
    while remaining:
        held = max(remaining, key=lambda frame: len(who.get(frame) or EMPTY))
        cover = who.get(held) or EMPTY
        kept = [frame for frame in remaining if (who.get(frame) or EMPTY) <= cover]
        parts.append(kept)
        taken = set(kept)
        remaining = [frame for frame in remaining if frame not in taken]
    return parts


# --- the assignment ----------------------------------------------------------

_POINTS = "SELECT sha_early, sha_late, points FROM pair_match WHERE method = ? AND version = ?"

_ANY_MATCH = "SELECT 1 FROM pair_match WHERE method = ? AND version = ? LIMIT 1"

_PLACED = """
SELECT sha256 FROM stack_member
WHERE method = ? AND version = ? AND strictness = ? AND linkage = ? AND ceiling = ?
  AND people = ?
"""

_INSERT = """
INSERT OR REPLACE INTO stack_member
  (method, version, strictness, linkage, ceiling, people, sha256, stack)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
"""

# Each frame the people pass examined, and the largest body it found there. One row
# per frame it looked at, `0` share included, which is what makes *checked and
# nobody here* a different fact from *never checked* -- and therefore what lets the
# nobody clause fire on the first and stay silent on the second.
_BODIES = "SELECT sha256, share FROM frame_body WHERE model = ? AND version = ?"

# Which persons were read in each frame, at one clustering and above the prominence
# floor. The floor is applied here rather than stored, `012_people.sql`'s whole
# discipline: a box records its share and nothing records whether the share was
# enough, so moving `photolib.people.FLOOR` moves what this returns and no row
# changes.
_PERSONS = """
SELECT fp.sha256, fp.person
FROM face_person AS fp
JOIN face AS f
  ON f.model = fp.model AND f.version = fp.version
 AND f.sha256 = fp.sha256 AND f.idx = fp.idx
WHERE fp.model = ? AND fp.version = ? AND fp.threshold = ? AND fp.cut = ?
  AND f.share >= ?
"""

# The persons the reader has said they never photographed, at one clustering. The
# rows there are and no default: an unjudged person is a friend, and that is
# `harness.people.counts`' reading of the absence rather than a row anybody wrote.
_STRANGERS = """
SELECT person FROM person_verdict
WHERE model = ? AND version = ? AND threshold = ? AND cut = ? AND verdict = 'stranger'
"""

# The two absences, each counted where it is recorded rather than derived by
# subtracting one total from another: a count that is arithmetic over two
# populations is a count that can go negative when one of them moves.
_SCREENED_OUT = """
SELECT count(*) FROM candidate_pair
WHERE model = ? AND version = ? AND verdict = 'screened_out'
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
    # Which persons the veto read, or `NO_PEOPLE` for a walk it was not applied to.
    # In the key for the reason the three above are: a change to it changes the
    # assignment, so it adds a population rather than overwriting one and no query
    # can compare a grouping made with people against one made without.
    people: str = PEOPLE
    method: str = matches.METHOD
    version: str = matches.VERSION

    @property
    def joins(self) -> Joins:
        return LINKAGE[self.linkage]

    @property
    def key(self) -> tuple:
        """The columns this setting's rows are keyed under, in the key's order."""
        return (
            self.method,
            self.version,
            self.strictness,
            self.linkage,
            self.ceiling,
            self.people,
        )


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


def strangers(labels_db: Path, named: str) -> frozenset[str]:
    """The persons the reader has said they never photographed, at one clustering.

    ADR 0004's *a stranger never counts*: somebody who appears in the reader's
    photographs without having been photographed is excluded from every frame's
    people, marked once per person rather than once per appearance.

    **The one read this package makes of the harness's own database**, and it is
    read-only, one column of one table, and tolerant of the file not being there.
    An absent labels file, a labels file written before the people mode existed, and
    a reader who has answered nothing are all *no strangers* -- which is the grid
    ADR 0004 says the rule produces on its own, so silence degrades to the rule
    rather than to an error.

    **Only the answers given about this clustering.** A verdict is keyed on the
    clustering for `harness.people`'s reason -- a person is named by its least face,
    so another threshold or another cut can hand the same name to a different set of
    faces -- and an answer about a different population is evidence rather than a
    judgement. So a reader who has answered about one clustering and runs the rule
    at another gets no strangers, and the report says the count so that it is
    visible rather than silent.
    """
    if not labels_db.exists():
        return EMPTY
    conn = sqlite3.connect(f"{labels_db.as_uri()}?mode=ro", uri=True)
    try:
        if not conn.execute(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'person_verdict'"
        ).fetchone():
            return EMPTY
        return frozenset(
            person for (person,) in conn.execute(_STRANGERS, clustering(named))
        )
    finally:
        conn.close()


def peopled(
    conn: sqlite3.Connection, named: str, excluded: Collection[str] = ()
) -> dict[str, frozenset[str] | None]:
    """Each frame the people pass examined, against the people `regroup` reads.

    `Who`'s three states, assembled from the two tables ADR 0004 runs two detectors
    to fill. A frame the pass never examined is simply not here, which is the third.

    **Presence is a body's answer and identity is a face's**, so the two halves are
    read from `frame_body` and from `face_person` and neither stands in for the
    other: a frame holding a body above the floor and no readable face is somebody
    with no people, which nests into anything and stays in its burst.

    A frame whose only person the reader called a stranger falls back to its body,
    which is right rather than incidental: a stranger is still somebody standing
    there, so the frame is not *nobody* -- it simply has no people, and no people
    nests.

    The one place the two readings could contradict each other is a face above the
    floor in a frame whose largest body is under it, the detectors having disagreed.
    A frame holding a person holds somebody, so the persons win.
    """
    model, version, threshold, cut = clustering(named)
    persons: dict[str, set[str]] = {}
    for sha256, person in conn.execute(
        _PERSONS, (model, version, threshold, cut, people.FLOOR)
    ):
        if person not in excluded:
            persons.setdefault(sha256, set()).add(person)
    return {
        sha256: frozenset(persons[sha256])
        if sha256 in persons
        else (EMPTY if share >= people.FLOOR else None)
        for sha256, share in conn.execute(_BODIES, (model, version))
    }


@dataclass(frozen=True)
class Cut:
    """One run's stacks, and what the veto did to the walk's own answer.

    `split` names the Match-proposed stacks the people rule took apart, by the name
    they had -- their earliest member's sha256 -- because a count says the rule
    fired and the names say which photographs, which is the difference between a
    surprising result and a diagnosable one. `moved` is the frames that left the
    stack they were proposed in: the part still holding the earliest member keeps
    the name, and everything else went somewhere new.
    """

    stacks: list[list[str]]
    split: list[str]
    moved: int


def place(
    run: Sequence[str],
    videos: Container[str],
    stored: Points,
    setting: Setting,
    who: Who | None = None,
) -> Cut:
    """One run cut into the stacks a setting draws, earliest member first.

    The walk is over the photographs of the run and the videos are placed alone,
    which is two of ADR 0003's rules at once: a video is not a candidate, so it
    joins nothing, and it does not break the run around it either -- the fence is
    cut over the whole population for exactly that reason, and `browse.py` already
    refuses to let a frame it cannot stack split the burst it sits inside. A video
    is out of the veto's way for the same reason it is out of the walk's: nothing
    looks for a person in one, so it has no people and its stack is always its own.

    The predicate is built here, from the setting, because a setting is what decides
    both halves of the rule: `agreement` reads its strictness and `joins` reads its
    linkage, and both are columns of the key these rows are stored under.

    `who` is ADR 0004's veto, applied to what the walk proposed and never to the
    walk itself -- `None` where the setting says no people rule was applied, which
    is the population the grid drew before this landed.
    """
    proposed = link(
        [sha256 for sha256 in run if sha256 not in videos],
        agreement(stored, setting.strictness),
        setting.joins,
    )
    stacks, split, moved = [], [], 0
    for stack in proposed:
        parts = [stack] if who is None else regroup(stack, who)
        if len(parts) > 1:
            split.append(stack[0])
            moved += len(stack) - len(
                next(part for part in parts if stack[0] in part)
            )
        stacks += parts
    return Cut(
        stacks + [[sha256] for sha256 in run if sha256 in videos], split, moved
    )


@dataclass(frozen=True)
class Unchecked:
    """The candidate pairs carrying no Match row, which are read as no agreement.

    Two facts and not one, because the two absences are different. `screened_out` is
    mostly the screen doing its job -- 84% of this catalog's candidates never earned
    a geometric check, by design. `survivors` is the part that is a hole instead: the
    screen said look properly and nothing did, which is a substrate that would not
    decode or a `photolib.matches` pass that has not run. Those frames are named for
    `photolib.candidates.run`'s reason -- the point of saying so is that it cannot go
    quiet -- and they are the ceiling ADR 0003 prices at 6.0% of the pairs the reader
    kept together.
    """

    screened_out: int
    survivors: int
    frames: list[str]


def unchecked(conn: sqlite3.Connection, setting: Setting) -> Unchecked:
    """What the walk has no evidence about, counted where it is recorded."""
    screen = (fingerprints.MODEL, fingerprints.VERSION)
    absent = conn.execute(
        _UNCHECKED, (*screen, setting.method, setting.version)
    ).fetchall()
    return Unchecked(
        screened_out=conn.execute(_SCREENED_OUT, screen).fetchone()[0],
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
    pairs: int  # the pairs those runs hold -- ADR 0003's number, at this ceiling
    videos: int  # of those tiles, the ones nothing verifies: each its own stack
    unchecked: Unchecked
    # The photographs the people pass never examined, which the veto is exempt from
    # rather than suspicious of. Counted because an incomplete people pass is
    # otherwise invisible: the rule degrades to the grid without it, frame by frame,
    # and a grid that quietly stopped vetoing is the thing that must not go quiet.
    unpeopled: int = 0
    strangers: int = 0  # the persons the reader has excluded, at this clustering


def worklist(
    conn: sqlite3.Connection, setting: Setting, excluded: Collection[str] = ()
) -> tuple[Work, Points, set[str], Who | None]:
    """What this pass owes, with the Matches it will read and the frames to skip.

    A run is the resume unit because a run is what the rule is applied to: one
    transaction holds all of its rows, so a run is either wholly placed or wholly
    absent and the worklist is one query over the frames.

    The people the veto reads come back with them, or `None` where the setting says
    it was not applied. They are read once, here, for `points`' reason: the walk
    asks about every frame of every run and a query per frame would be the pass.
    """
    frames = candidates.population(conn)
    videos = {sha256 for _, _, kind, sha256 in frames if kind == "video"}
    cut = list(candidates.runs(frames, setting.ceiling, alone=True))
    done = placed(conn, setting)
    who = None if setting.people == NO_PEOPLE else peopled(conn, setting.people, excluded)
    return (
        Work(
            todo=[group for group in cut if any(sha256 not in done for sha256 in group)],
            tiles=len(frames),
            runs=len(cut),
            pairs=candidates.count(frames, setting.ceiling),
            videos=len(videos),
            unchecked=unchecked(conn, setting),
            unpeopled=0
            if who is None
            else sum(
                1
                for _, _, kind, sha256 in frames
                if kind != "video" and sha256 not in who
            ),
            strangers=len(excluded),
        ),
        points(conn, setting),
        videos,
        who,
    )


# --- the pass ----------------------------------------------------------------


def place_all(
    conn: sqlite3.Connection,
    todo: Sequence[Sequence[str]],
    videos: Container[str],
    stored: Points,
    setting: Setting,
    who: Who | None = None,
    *,
    progress_seconds: float = PROGRESS_SECONDS,
) -> dict:
    """Place every run in `todo` and store the assignment. Returns the tally.

    One transaction per run, so an interruption costs the run in flight and
    nothing before it.

    The veto's own tally rides along: how many of the walk's stacks it split, how
    many frames left the stack they were proposed in, and the name of every one of
    them. Named rather than counted for `unchecked`'s reason -- a count says the
    rule fired and the names say which photographs, and this is the number ADR 0004
    says it will be judged on.
    """
    written = 0
    sizes: list[int] = []
    split: list[str] = []
    moved = 0
    started = announced = time.perf_counter()
    owed = sum(len(group) for group in todo)

    for group in todo:
        cut = place(group, videos, stored, setting, who)
        stacks = cut.stacks
        sizes += (len(stack) for stack in stacks)
        split += cut.split
        moved += cut.moved
        written += _store(
            conn,
            [
                (*setting.key, sha256, stack[0])
                for stack in stacks
                for sha256 in stack
            ],
        )

        now = time.perf_counter()
        if now - announced >= progress_seconds:
            announced = now
            print(
                f"  place    {written:>9,}/{owed:,}  {written / (now - started):,.0f}/s",
                flush=True,
            )

    return {
        "written": written,
        "sizes": sizes,
        "split": split,
        "moved": moved,
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
        # The verdicts before the plan, because they decide what the plan reads: a
        # stranger is out of every frame's people, so a pass that read them
        # afterwards would have vetoed with a different set than it reports.
        excluded = (
            ()
            if setting.people == NO_PEOPLE
            else strangers(config.catalog_db.parent / LABELS, setting.people)
        )
        work, stored, videos, who = worklist(conn, setting, excluded)
        print(
            f"method    {setting.method} version {setting.version} "
            f"({time.perf_counter() - started:.1f}s to plan)",
            flush=True,
        )
        print(
            f"setting   strictness {setting.strictness}, {setting.linkage} linkage, "
            f"{setting.ceiling}s ceiling"
        )
        if who is None:
            print(f"people    {setting.people}: the walk ADR 0004's veto is not applied to")
        else:
            print(f"people    {setting.people} at a floor of {people.FLOOR}")
            print(
                f"          {sum(1 for held in who.values() if held is not None):,} of"
                f" {len(who):,} examined frames hold somebody and"
                f" {sum(1 for held in who.values() if held):,} hold a person;"
                f" {work.strangers:,} persons are excluded as strangers"
            )
            # An incomplete people pass degrades to the grid without the rule, frame
            # by frame, which is the right failure and the quiet one -- so it is
            # counted here rather than left to be noticed.
            print(
                f"          {work.unpeopled:,} photographs the people pass never"
                " examined, which the veto is exempt from"
            )
        print(f"tiles     {work.tiles:,} EXIF-dated tiles in {work.runs:,} runs")
        print(f"videos    {work.videos:,} of them videos, which nothing verifies")
        print(f"pairs     {work.pairs:,} the fence admits, {len(stored):,} carrying a Match")
        # Read as no agreement rather than as a match, so that no stack is invented
        # out of a pair nobody looked at. The survivors are the hole and are named.
        print(
            f"unchecked {work.unchecked.screened_out:,} pairs the screen rejected and "
            f"{work.unchecked.survivors:,} survivors with no Match row, read as no agreement:"
        )
        for sha256 in work.unchecked.frames:
            print(f"          {sha256}")
        if work.unchecked.frames:
            print(
                "          filling those is not a resume: DELETE FROM stack_member WHERE "
                f"strictness = {setting.strictness} AND linkage = '{setting.linkage}' "
                f"AND people = '{setting.people}' and run again"
            )

        todo = work.todo if limit is None else work.todo[:limit]
        print(f"todo      {sum(len(group) for group in todo):,} tiles to place")
        if not todo:
            print("\nnothing to do: every tile already has a stack at this setting")
            return 0

        result = place_all(conn, todo, videos, stored, setting, who)
        elapsed = max(result["elapsed_s"], 1e-6)
        print(
            f"\nplaced    {result['written']:,} tiles in "
            f"{int(elapsed) // 60}m{int(elapsed) % 60:02d}s, "
            f"{result['written'] / elapsed:,.0f}/s"
        )
        print(f"stacks    {shape(result['sizes'])}")
        if who is not None:
            # ADR 0004's "How it will be judged": the count says the veto fired and
            # the names say which photographs, so a surprising result is
            # diagnosable rather than merely visible.
            print(
                f"vetoed    {len(result['split']):,} of the walk's stacks split by who is"
                f" in them, {result['moved']:,} frames moved out of the stack they were"
                " proposed in:"
            )
            for sha256 in result["split"]:
                print(f"          {sha256}")
            print(
                "          a verdict answered since this ran is not a resume: DELETE FROM"
                f" stack_member WHERE people = '{setting.people}' AND strictness ="
                f" {setting.strictness} AND linkage = '{setting.linkage}' and run again"
            )
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
    parser.add_argument(
        "--no-people",
        action="store_true",
        help="walk without ADR 0004's veto, writing the population the grid drew"
        " before it landed. Another population and never an overwrite: the people"
        " identity is part of the key",
    )
    parser.add_argument("--limit", type=int, help="place at most this many runs")
    args = parser.parse_args(argv)
    # The ceiling is deliberately not here: it is the fence the Match rows were
    # computed behind, so a walk at another value would read pairs nothing checked.
    # The people identity is, because the veto is a rule and not a fence -- a caller
    # may want the walk without it, and what they get is the other population.
    return run(
        setting=Setting(
            strictness=args.strictness,
            linkage=args.linkage,
            people=NO_PEOPLE if args.no_people else PEOPLE,
        ),
        limit=args.limit,
    )


if __name__ == "__main__":
    try:
        sys.exit(main())
    except MembershipRefused as exc:
        sys.exit(f"refused: {exc}")
