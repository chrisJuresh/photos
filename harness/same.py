"""Are these two clusters one human? -- the harness's third mode.

The harness could already ask two questions and neither of them is this one. Stack
mode asks about a frame: *does this one belong in this stack*. People mode asks
about a person: *did you photograph them, or did they wander in*. Neither can ask
whether two of the names the clustering produced are the same individual, and that
is the question **53 of the 94 stacks** in
[#88](https://github.com/chrisJuresh/photos/issues/88) turn on: every frame holds
somebody, and one human was handed two names, so no member's people contain every
other member's and ADR 0004's nesting rule cuts the stack the reader is asking to
be made bigger.

**It exists to make a loosening measurable.** `harness.recluster` swept the person
threshold upward and concluded the knob was the wrong one, and it could only ever
conclude that: the evidence it had was `two-people`, which marks a cluster holding
**two** humans and says nothing at all about one human split in two. So a downward
move could be scored on the damage it does -- answered friends fragmenting -- and
never on the good. These verdicts are the other side, and `scored` below is what
reads them: **humans correctly rejoined, and humans wrongly merged, apart and never
totalled**, which is `harness.floor`'s rule and `harness.recluster`'s.

## What the reader is asked, and how it is drawn

Two montages side by side, one person each, drawn from the frames their faces were
found in -- people mode's montage kept whole rather than a second way of drawing a
person invented beside it. **The frames and not face crops**, for people mode's
reason: `migrations/012_people.sql` stores a face's share of the frame's height and
its embedding and no box, so there is nothing stored to crop from, and the caption
saying which face of the frame this is and how tall it was is the whole of what can
honestly be drawn around it.

**Three answers and deliberately not four.** Same person, different people, and not
sure -- which is an answer here exactly as it is in both other modes, and not a
skip. A fourth verdict for *cannot tell from these frames* was considered and left
out: nothing would read it that does not read `unsure`, and a verdict nothing reads
is worse than three that are read.

**The similarity between the two clusters is never shown.** It is stored on every
face and it would prime the reader towards the answer the clustering already gave,
which is the same reason the stack mode withholds which band a set was drawn from.
`harness.recluster` computes it from the vectors when it needs it.

## Which pairs are eligible, and the blind spot that buys

**The pairs that meet inside a stack the nesting rule would split**, and not the
pairs whose embeddings are close. All pairs of clusters is two million questions,
so something has to cut it down, and screening by embedding distance is the obvious
cut: it is also the one that would make this mode unable to say anything a threshold
sweep cannot already say, because the pairs it admits are exactly the pairs the
clustering nearly merged. A reader answering *same person* about those confirms a
loosening that was already the leading candidate; they could never contradict one.

So the cut is structural instead. `moving` walks the stacks at the grid's own
setting, keeps the ones whose members' people sets do not nest, and asks about the
pairs that are why: some frame holds one and not the other, and some other frame
holds the other and not the one. That is the population #88 counted -- roughly a
hundred stacks -- so it is a sitting or two rather than a lifetime, and it is drawn
from the thing being fixed rather than from the knob being considered. A pair whose
two clusters are far apart in embedding space and which the reader calls one human
is then evidence that the **threshold is the wrong knob**, which is a finding the
distance screen could not produce.

**The blind spot is the honest one.** A human split in two who never lands both
names inside one broken stack is never asked about -- but merging them would move no
stack either way, which is `harness.people.order`'s own principle and the reason
stopping early is safe there. What this population genuinely cannot see is a human
split across *different* stacks, days apart: those two names are the same individual
and nothing here will ask. That is a real limit on what a verdict count means and it
is stated rather than designed around, because the rule this feeds is a rule about
stacks and a merge that moves no stack changes no grid.

## Read at the grid's setting; answered about neither

**The queue reads `browse.STACK_SETTING`** through `harness.people.membership`, for
its reason there: the stacks a merge would change are counted so that a verdict is
priced against the grid the reader is actually looking at, and reading another
setting's assignment would spend a sitting on stacks nobody sees.

**The verdict is not keyed on it.** *These two names are one human* is a fact about
the photographs and not about how the grid happens to be cut -- move the strictness
and the answer is still true. So the setting decides which pairs are worth asking
about and never what an answer means, and `same_person` carries the clustering and
the two persons and nothing else. The clustering it must carry, for
`person_verdict`'s reason: a person is named by its least face, so re-clustering at
another threshold or over the faces reaching another size hands the same name to a
different set of faces, and an answer about one population must not silently stand
for another.

## What it opens

Every function here takes a connection, so where the catalog and the labels file are
is `harness.label`'s business -- `state.sqlite3` appears nowhere in this module,
there is no `ATTACH`, and no path under `G:` is constructible from anything it
holds. The montage is served by the same `/d/<sha256>.webp` route off the substrate
tree on the NVMe that both other modes draw from.
"""

from __future__ import annotations

import sqlite3
from collections import Counter
from collections.abc import Collection, Iterable, Mapping, Sequence
from dataclasses import dataclass, replace
from itertools import combinations

from harness import people
from harness.people import Clustering, Face
from photolib.people import FLOOR, NO_CUT

# The three things the reader can say. `unsure` is an answer and not a skip --
# `harness.people.VERDICTS`' own distinction and `harness.label.VERDICTS`' before
# it -- and there is deliberately no fourth. See the module docstring.
VERDICTS = ("same", "different", "unsure")

# The two that are evidence about a clustering. `unsure` is the reader saying they
# could not tell, which is a fact about the montage rather than about the humans in
# it, so it belongs in neither column of `scored`.
JUDGED = ("same", "different")


@dataclass(frozen=True)
class Pair:
    """Two persons, what merging them would change, and what to draw.

    `one` and `other` are ordered by name, which is what makes the pair a key: the
    reader is asked about an unordered pair of clusters and *(P, Q)* and *(Q, P)*
    are the same question. `pairing` is where that ordering is imposed.

    `stacks` is why they are being asked about -- how many stacks the rule would
    split today that merging these two would change -- and `faces` is the two
    montages, each person's own faces, most prominent first.
    """

    one: str
    other: str
    stacks: int
    faces: tuple[tuple[Face, ...], tuple[Face, ...]] = ((), ())

    @property
    def key(self) -> tuple[str, str]:
        """The pair as it is stored and as an answer is filed against it."""
        return (self.one, self.other)


def pairing(one: str, other: str) -> tuple[str, str]:
    """Two person names as a key: the lesser first.

    One place, because the table's own `CHECK (one < other)` is the same rule and a
    caller that ordered them differently would be refused rather than quietly
    filing a second row about the same two clusters.
    """
    return (one, other) if one < other else (other, one)


# --- the rule the queue is drawn from ------------------------------------------


def nests(sets: Iterable[Collection[str]]) -> bool:
    """ADR 0004's nesting rule: does one member's people hold every other's?

    *A stack needs one member whose people are a superset of every other member's
    people.* Not a chain among themselves -- `{A,B}`, `{A,C}` and `{A,B,C}` are one
    stack because all three fit inside the third -- so this is *some cover contains
    everybody* and never *the sets are totally ordered*.

    **The nobody clause is not here.** ADR 0004's other clause -- a frame with
    nobody in it never joins a frame with somebody -- is answered by `frame_body`
    and no merge of two persons can change it, so a queue drawn from it would be a
    queue of questions whose answer moves nothing. #88 counted the two apart for
    the same reason: 41 stacks are the nobody clause firing as designed and **53**
    are a clustering disagreement, and the 53 are this mode's subject.

    Pure over sets of names, which is what lets the rule the whole queue rests on
    be asserted against the ADR's own worked example rather than against a
    database.
    """
    held = [frozenset(one) for one in sets]
    return any(all(other <= cover for other in held) for cover in held)


def gathered(
    peopled: Mapping[str, Collection[str]], stacks: Mapping[str, str]
) -> dict[str, list[frozenset[str]]]:
    """Each stack's members' people sets, one entry per member frame.

    A frame with no people is an empty set and not an absence: the empty set nests
    inside everything, so it never breaks a stack on its own, and dropping it would
    make a stack of one peopled frame and nine empty ones look like a stack of one.
    """
    held: dict[str, list[frozenset[str]]] = {}
    for frame, stack in stacks.items():
        held.setdefault(stack, []).append(frozenset(peopled.get(frame, ())))
    return held


def moving(
    peopled: Mapping[str, Collection[str]], stacks: Mapping[str, str]
) -> dict[tuple[str, str], int]:
    """Every pair worth asking about, and how many stacks merging it would change.

    A stack counts for a pair when **the rule splits it today** and **the two
    persons are why it is torn**: some member holds one and not the other, and some
    other member holds the other and not the one. Those two frames are incomparable
    on this pair, and merging the two names makes them comparable -- which is the
    only shape where an answer moves anything.

    A pair present in a stack that already nests scores nothing there, because
    merging two persons can only ever *help*: the merge is a monotone image of every
    member's people set, so a cover that contained everything before contains
    everything after, and a stack the rule leaves whole stays whole. A pair where
    one name appears and the other does not scores nothing either -- that merge is a
    rename.

    **It is not the count of stacks the merge would make nest**, and the difference
    is deliberate. A stack torn three ways by one human under three names is
    repaired by no single merge, so a stricter measure would score all three pairs
    zero and the queue would never ask about the case #88 is most worried about.
    This counts what the merge *changes* about a stack the rule is splitting, which
    is `harness.floor`'s posture towards the same unimplemented rule: the tightest
    honest measure there is until #56 lands.

    Pure over two mappings -- no database, no photograph and no vector -- so the
    order the reader is asked in is an assertion rather than a browsing session,
    which is `harness.people.splits`' own arrangement.
    """
    counted: Counter[tuple[str, str]] = Counter()
    for members in gathered(peopled, stacks).values():
        if nests(members):
            continue
        here = sorted(set().union(*members))
        for one, other in combinations(here, 2):
            if any(one in held and other not in held for held in members) and any(
                other in held and one not in held for held in members
            ):
                counted[(one, other)] += 1
    return dict(counted)


# --- the order the reader is asked in ------------------------------------------


def rank(pair: Pair) -> tuple:
    """What makes a pair worth the reader's time, most first.

    **The stacks lead**, `harness.people.rank`'s reason: the number is how many
    stacks the answer moves, so ordering on it is what makes stopping early a choice
    rather than a loss.

    **The thinner montage breaks the tie**, which is that rank's tie-break made
    honest about there being two of them. A pair is only as answerable as its
    poorer side: eleven faces against one is a guess whatever the eleven show, so
    the pair whose *lesser* montage is largest comes first.

    Ties break on the two names last, so the order is total and deterministic. A
    reader who stops and comes back has to be shown the same list in the same order
    for the counter to mean anything.
    """
    return (-pair.stacks, -min(len(side) for side in pair.faces), pair.one, pair.other)


def order(
    peopled: Mapping[str, Collection[str]],
    stacks: Mapping[str, str],
    boxes: Mapping[str, Iterable[tuple[str, int, float]]] | None = None,
) -> list[Pair]:
    """The pairs worth asking about, in the order to ask them.

    `boxes` is each person's own faces, `(sha256, idx, share)`, and is what the two
    montages are drawn from -- **their own**, because two persons in one frame have
    two different faces in it and a montage assembled from the frames alone would
    draw the reader somebody else. Optional for `harness.people.order`'s reason: the
    ordering of pairs turns on how many faces there are and not on how big they
    were, so the pure tests of the order need not construct it.
    """
    held = boxes or {}

    def montage(person: str) -> tuple[Face, ...]:
        return tuple(
            sorted(
                (Face(sha256, idx, share) for sha256, idx, share in held.get(person, ())),
                key=lambda face: (-face.share, face.sha256, face.idx),
            )
        )

    asked = [
        Pair(one=one, other=other, stacks=count, faces=(montage(one), montage(other)))
        for (one, other), count in moving(peopled, stacks).items()
    ]
    return sorted(asked, key=rank)


def progress(
    asked: Sequence[Pair], given: Mapping[tuple[str, str], str]
) -> tuple[int, int]:
    """How many pairs the reader has judged, and how many more would change anything.

    `harness.people.progress`' two numbers and its reasoning: the first counts every
    answer in the file at this clustering, because a pair that has dropped off the
    queue -- the grid re-stacked since, a stack no longer split -- is still an
    evening the reader spent, and the second counts only what is left to buy.
    """
    return len(given), sum(1 for pair in asked if pair.key not in given)


# --- where the answers go ------------------------------------------------------

# Not a migration, `harness.people.SCHEMA`'s reason: a table nothing shipped reads
# has no business in the shipped schema, so the harness that owns it creates it. It
# lives in `labels.sqlite3` beside the stack answers and the person verdicts -- one
# page to run and one database to keep -- and `harness.label.store` creates all
# three.
#
# **Keyed on both clusters and on the clustering.** The four clustering columns are
# `face_person`'s own key and they are here for `person_verdict`'s reason: a person
# is named by its least face, so re-clustering at another threshold, or over the
# faces reaching another size, can hand the same name to a different set of faces.
# An answer about one population is not an answer about another and a key that could
# not tell them apart would inherit judgements silently.
#
# **The stack setting is not in the key**, deliberately. Whether two clusters are one
# human is a fact about the photographs; which stacks that would move is a fact about
# how the grid is cut. The setting decides which pairs are worth asking about and
# never what an answer means. See the module docstring.
#
# `CHECK (one < other)` because the pair is unordered: the reader is asked about two
# clusters and not about a direction, so a caller that filed both orders would be
# storing one answer twice. `pairing` is the one place that ordering is imposed and
# the check is what makes it a fact about the table rather than a convention.
#
# One row per pair per clustering, replaced on a revision rather than appended to:
# the reader said one thing about these two, latterly. A misclick is not permanent
# and a history of misclicks is not evidence about anybody.
SCHEMA = f"""
CREATE TABLE IF NOT EXISTS same_person (
  model       TEXT NOT NULL,      -- the detector's identity, `face_person`'s own
  version     TEXT NOT NULL,
  threshold   REAL NOT NULL,      -- the cosine the faces were clustered at
  cut         REAL NOT NULL,      -- the share a face had to reach to be clustered
  one         TEXT NOT NULL,      -- '<sha256>:<idx>' of the lesser cluster's least face
  other       TEXT NOT NULL,      -- and of the greater's
  verdict     TEXT NOT NULL CHECK (verdict IN ({', '.join(f"'{v}'" for v in VERDICTS)})),
  answered_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (model, version, threshold, cut, one, other),
  CHECK (one < other)
)
"""

_RECORD = """
INSERT OR REPLACE INTO same_person
  (model, version, threshold, cut, one, other, verdict)
VALUES (?, ?, ?, ?, ?, ?, ?)
"""

_VERDICTS = """
SELECT one, other, verdict FROM same_person
WHERE model = ? AND version = ? AND threshold = ? AND cut = ?
"""


def ensure(conn: sqlite3.Connection) -> None:
    """Create the pair table on a labels connection.

    A creation and no widening, because the table has never had another shape.
    `harness.people.ensure` is the idiom for when it does: rows are carried forward
    stamped with a real value of the new column rather than the file being refused,
    since the reader's answers are the one thing here that cannot be re-derived.
    """
    conn.execute(SCHEMA)


def record(
    conn: sqlite3.Connection,
    one: str,
    other: str,
    verdict: str,
    *,
    clustering: Clustering,
) -> None:
    """File one judgement about one pair, replacing whatever it said before.

    The clustering is not defaulted, `harness.people.record`'s reason: an answer that
    did not say which population of persons it was about would be a judgement about
    two names rather than about two clusters of faces.
    """
    lesser, greater = pairing(one, other)
    conn.execute(
        _RECORD,
        (
            clustering.model,
            clustering.version,
            clustering.threshold,
            clustering.cut,
            lesser,
            greater,
            verdict,
        ),
    )


def judged_yet(conn: sqlite3.Connection) -> bool:
    """Whether this labels file has a pair table at all.

    A file written before this mode existed holds `answer` and `person_verdict` and
    nothing else, and `ensure` cannot add the table to a connection opened read-only
    -- which is how `harness.recluster` opens it, deliberately, because that report
    writes nothing. So a reader who has three rounds of stack answers and a sitting
    of person verdicts is told which step is missing rather than shown `no such
    table`.
    """
    return bool(
        conn.execute(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'same_person'"
        ).fetchone()
    )


def verdicts(
    conn: sqlite3.Connection,
    clustering: Clustering,
    *,
    carried: Collection[str] = (),
) -> dict[tuple[str, str], str]:
    """Every judgement that stands about this clustering's pairs, by pair.

    The rows there are, and the uncut answers about the pairs **both** of whose
    clusters the cut left holding exactly the faces they had -- which is
    `harness.people.unchanged`, read the same way and needed on both sides here: a
    pair is a question about two clusters, so an answer carries only when neither of
    them has become a different set of faces. An answer given about this clustering
    wins over a carried one either way: it is the reader's latest word about these
    faces.

    A pair with no row is absent rather than defaulted. There is no `DEFAULT` in this
    module and deliberately no equivalent of `harness.people.counts`: an unjudged
    person is a friend because the rule has to draw *some* grid before the reader has
    answered anything, and an unjudged pair is simply a pair nothing has been said
    about -- the clustering's own answer stands, which is that they are two people.

    An older labels file has no table to read, and that is *no answers* rather than
    an error. `judged_yet` is how a caller tells that from a file with the table and
    no rows.
    """
    if not judged_yet(conn):
        return {}
    given = {
        (one, other): said
        for one, other, said in conn.execute(
            _VERDICTS,
            (
                clustering.model,
                clustering.version,
                clustering.threshold,
                clustering.cut,
            ),
        )
    }
    if clustering.cut == NO_CUT or not carried:
        return given
    intact = frozenset(carried)
    return {
        **{
            pair: said
            for pair, said in verdicts(conn, replace(clustering, cut=NO_CUT)).items()
            if set(pair) <= intact
        },
        **given,
    }


# --- what a clustering did to the answers --------------------------------------


@dataclass(frozen=True)
class Rejoining:
    """What one clustering did to the pairs the reader judged.

    **Four fields and two findings**, kept apart and never totalled -- which is
    `harness.floor`'s rule and `harness.recluster`'s, for its reason: they are
    different failures with different fixes. `rejoined` is a human the reader says
    was split in two put back together, which is the good a loosening buys.
    `merged` is two humans the reader says are different collapsed into one, which
    is their own answer being contradicted and a stack that will hold two people.
    `split` and `apart` are the same two populations where the clustering did
    nothing, and they are here so a rate has a denominator.

    A pair whose faces are not in the clustering at all -- a cut dropped one side
    entirely -- lands in `split` or `apart`, because whatever else is true the two
    were not put together.
    """

    rejoined: tuple[tuple[str, str], ...] = ()
    split: tuple[tuple[str, str], ...] = ()
    merged: tuple[tuple[str, str], ...] = ()
    apart: tuple[tuple[str, str], ...] = ()

    @property
    def same(self) -> int:
        """How many pairs the reader called one human."""
        return len(self.rejoined) + len(self.split)

    @property
    def different(self) -> int:
        """How many pairs the reader called two."""
        return len(self.merged) + len(self.apart)


def landed(
    faces_of: Mapping[str, Collection[str]],
    assignment: Mapping[str, str],
    person: str,
) -> set[str]:
    """Which of another clustering's persons one standing person's faces fell into."""
    return {
        assignment[face] for face in faces_of.get(person, ()) if face in assignment
    }


def together(
    faces_of: Mapping[str, Collection[str]],
    assignment: Mapping[str, str],
    one: str,
    other: str,
) -> bool:
    """Whether a clustering puts any face of the two into one person.

    Any and not all, because the two clusterings need not be one refining the other
    -- `harness.recluster.crossed` is the check that they are, and this measurement
    should not assume what that one goes to the trouble of testing. Sharing a person
    is the claim being scored: the reader said these two names are one human, and a
    clustering that puts them under one name has agreed.
    """
    return bool(
        landed(faces_of, assignment, one) & landed(faces_of, assignment, other)
    )


def scored(
    given: Mapping[tuple[str, str], str],
    faces_of: Mapping[str, Collection[str]],
    assignment: Mapping[str, str],
) -> Rejoining:
    """One clustering, scored against the reader's answers -- both sides, apart.

    Pure over an assignment and a mapping of names, so what a threshold buys is
    arithmetic over stored rows rather than a browsing session, and
    `harness.recluster` calls it once per swept value.

    `unsure` is scored in neither column. It is the reader saying the montage did
    not let them tell, which is a fact about what was on screen and not about
    whether the two humans are one.
    """
    fell: dict[str, list[tuple[str, str]]] = {
        name: [] for name in ("rejoined", "split", "merged", "apart")
    }
    for pair, said in sorted(given.items()):
        if said not in JUDGED:
            continue
        joined = together(faces_of, assignment, *pair)
        if said == "same":
            fell["rejoined" if joined else "split"].append(pair)
        else:
            fell["merged" if joined else "apart"].append(pair)
    return Rejoining(**{name: tuple(found) for name, found in fell.items()})


# --- what the catalog holds ----------------------------------------------------


def peopled(held: Mapping[str, Sequence[Face]]) -> dict[str, set[str]]:
    """Each frame's people **at the floor** -- what the nesting rule reads.

    A face under `photolib.people.FLOOR` is in no frame's people, so it cannot tear a
    stack and no verdict about the person it belongs to would move one. That is
    `harness.people.frames` turned the other way up -- persons by frame rather than
    frames by person -- because the rule asks what is in a frame and the queue asks
    which frames a pair is torn across.

    The floor is read here and never copied, so moving that one line moves the queue
    and there is nothing to regenerate. **The montage is not filtered**: `boxes`
    hands over every face, because a small face is still something to recognise
    somebody by.
    """
    frames: dict[str, set[str]] = {}
    for person, faces in held.items():
        for face in faces:
            if face.share >= FLOOR:
                frames.setdefault(face.sha256, set()).add(person)
    return frames


def asking(conn: sqlite3.Connection, clustering: Clustering) -> list[Pair]:
    """The pairs worth asking about, read off the catalog.

    Two queries and then the pure function, `harness.people.asking`'s split: what the
    catalog holds is a read and what the reader is asked is arithmetic over it. Both
    reads are that module's own, so the two modes cannot come to disagree about which
    faces belong to whom or which frames are one stack.
    """
    held = people.found(conn, clustering)
    return order(peopled(held), people.membership(conn), people.boxes(held))
