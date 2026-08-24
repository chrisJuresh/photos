"""Friend or stranger, once per person -- the harness's second mode.

`docs/adr/0004-people-veto-a-stack.md` decides a stack by nesting: a stack needs
one member whose people contain every other member's people, and where the Match
proposes one with no such member it is split until every part has one. Applied to
every person a detector finds, **that rule is destructive**. A tourist wanders
behind the reader and appears in frames three and four of a nine-frame burst, and
those two frames leave the stack; a stranger the reader never noticed breaks their
burst into three.

The obvious guard is a prominence floor -- somebody counts only above some share
of the frame -- and `photolib.people.FLOOR` is exactly that, provisional at 0.10.
But **prominence is a proxy for the thing rather than the thing.** What the reader
asked to distinguish, in their own words, is *a stranger versus a person I wanted
to photograph*, and that is a judgement about intent: a stranger can be large and
close, a friend small and distant. A threshold fitted to per-appearance boxes would
encode the proxy permanently.

So the primary evidence is the reader's own answer, and this module collects it.
One question per person -- **friend** or **stranger** -- and it holds everywhere
that person appears. `harness.floor` is the other half: it reads these answers
against the stored box shares and says whether a floor separates the two
populations at all, which demotes the floor to a cheap pre-filter or abandons it.

**Nothing here applies anything.** No stack moves, no cover moves, and
`photolib/` is untouched -- this module reads the people tables and writes only to
`labels.sqlite3`. The rule that reads a verdict is a ticket of its own.

## What the reader is asked, and in what order

Two thousand persons at the default threshold, so *once per person* has to mean
once per person **worth asking about**. `splits` is what decides that, and it is
the stack sampler's least-decisive draw pointed at a different population: for
each person, the number of stacks they appear in *some* frames of and not others.

A person in every frame of every stack they touch scores zero -- whichever way the
reader answers, every frame gains or loses them together and the nesting rule draws
the stack exactly as it did. Those are never asked about. A person in three frames
of a nine-frame burst is the whole question, and the highest scorer is the person
whose verdict splits the most stacks.

**The floor decides which of a person's frames the splits are counted over.** A
face under `photolib.people.FLOOR` is in no frame's people, so a person whose every
box is under it cannot move a stack whichever way the reader answers -- and a count
over every face asked about them anyway: 1,731 questions where 279 could change
something, which is a third of a sitting spent on sub-floor noise. `frames` is
where that filter lives, because it is what `splits` counts over. It is not a
pruning of the queue and can also fill it: somebody in all three frames of a stack
and large in only one is a frame's people set that differs across it, which is the
whole question.

**Only the splits read the floor.** The montage is drawn from every face -- a small
face is still something to recognise somebody by -- and so is `rank`'s tie-break,
which counts how much the reader has to recognise them by and is therefore a count
of what is drawn.

It is **a pure function over stored numbers** -- two mappings, no database and no
photograph -- so the order the reader is asked in is an assertion rather than a
browsing session.

## An unjudged person is a friend

The default is `counts`', not the table's: `verdicts` returns the rows there are
and an unjudged person is simply absent from it. That difference is the point. A
row saying friend is the reader's answer; no row is nobody's, and a table that
could not tell them apart would report silence as a judgement.

What the *reader* of the table does with the absence is count the person, which is
what makes stopping early safe: **the grid at zero answers is the grid the people
rule produces on its own**, and every answer the reader gives moves it from there
rather than repairing it. `unsure` and `two-people` fall the same way -- neither is
the claim *this person was never photographed*, and only that claim takes somebody
out of a frame.

## A cluster that is obviously two people

The fourth answer, and it is a report about the clustering rather than about a
person. It does not feed the floor and it does not feed the rule; it exists so that
a clustering failure is visible instead of being forced into a judgement about
somebody. Acting on it -- splitting the cluster -- is a ticket of its own, and
`harness.floor` counts them so that the count is what justifies one.

**It opens nothing.** Every function here takes a connection, so where the catalog
and the labels file are is `harness.label`'s business and this module's containment
is a fact about what it can name: `state.sqlite3` appears nowhere in it, there is no
`ATTACH`, and no path under `G:` is constructible from anything it holds. The
substrates the montage is drawn from are served by the same `/d/<sha256>.webp` route
the stack mode uses, off the tree on the NVMe.
"""

from __future__ import annotations

import sqlite3
from collections import Counter
from collections.abc import Collection, Iterable, Mapping, Sequence
from dataclasses import dataclass, field

from photolib.browse import STACK_SETTING
from photolib.people import CUT, FLOOR, MODEL, THRESHOLD, VERSION

# The four things the reader can say. Three answers and a report: `friend` and
# `stranger` are the judgement ADR 0004 asks for, `unsure` is a cluster they could
# not make out -- an answer rather than a skip, `harness.label.VERDICTS`' own
# distinction -- and `two-people` says the clustering failed here.
VERDICTS = ("friend", "stranger", "unsure", "two-people")

# What an unjudged person counts as. See the module docstring: it is named here so
# that the one place applying it is `counts`, and so that "stopping early is safe"
# has something to point at.
DEFAULT = "friend"

# The two answers that are evidence about the prominence floor. `unsure` is not a
# judgement about a person and `two-people` is not about a person at all, so
# neither belongs in a distribution of friends' and strangers' box shares.
JUDGED = ("friend", "stranger")


@dataclass(frozen=True)
class Clustering:
    """Which population of persons a verdict is about.

    `face_person`'s key, carried whole: a person is named by its least face, and
    re-clustering at another threshold produces a different set of faces that can
    perfectly well be handed the same name. So the verdict is keyed on the
    clustering as well as the person -- `stack_member`'s discipline one layer up --
    and a person under a threshold nobody has answered about reads as unjudged
    rather than inheriting an answer about different faces.

    `cut` is the fourth column of that key and is here for the same reason: a
    population clustered over the faces reaching one size is not the population
    clustered over another, so a report that read both would be describing two
    clusterings as one. It is **not** part of `person_verdict`'s key below, and that
    asymmetry is deliberate: the answers the reader has already given carry across a
    cut so that a sitting is not spent twice, which is the whole reason
    `harness.recluster` could price one from labels given before it existed. It also
    means a second answer about a same-named cluster at another cut *replaces* the
    first, and the reports read the uncut population -- so
    [#78](https://github.com/chrisJuresh/photos/issues/78) keys the verdict by the
    cut and reads the uncut one as a default, and it comes before the next sitting.
    """

    model: str = MODEL
    version: str = VERSION
    threshold: float = THRESHOLD
    cut: float = CUT


@dataclass(frozen=True)
class Face:
    """One face of one person: where it was found, and how big it was.

    `share` is the box's height over the frame's, which is every stored fact about
    where the face is -- `migrations/012_people.sql` keeps no coordinates. So it is
    what orders a montage and what a caption can say, and a *crop* is not something
    this harness can draw at all.
    """

    sha256: str
    idx: int
    share: float


@dataclass(frozen=True)
class Person:
    """One question: a person, what their answer would change, and what to draw.

    `splits` is why they are being asked about and `faces` is what the reader
    recognises them by, most prominent first.
    """

    person: str
    splits: int
    faces: tuple[Face, ...] = field(default_factory=tuple)

    @property
    def frames(self) -> tuple[str, ...]:
        """The frames their faces were found in, each once, in the order drawn."""
        seen: dict[str, None] = {}
        for face in self.faces:
            seen.setdefault(face.sha256, None)
        return tuple(seen)


def counts(given: str | None) -> bool:
    """Whether a person counts towards a frame's people.

    ADR 0004: *a stranger never counts* -- they are excluded from every frame's
    people, marked once per person and not once per appearance. That is the only
    answer which takes somebody out of a frame, and None -- unjudged -- is not it.

    This is the one place the friend default lives, and it lives in the reader of
    the table rather than in the table. See the module docstring.
    """
    return given != "stranger"


# --- how much an answer would change ------------------------------------------


def splits(
    appearances: Mapping[str, Collection[str]], stacks: Mapping[str, str]
) -> dict[str, int]:
    """For each person, the stacks their verdict could split.

    A stack counts when the person is in **some** of its frames and not all of
    them: that is the only shape where the answer changes what the nesting rule
    draws. Present in every frame, and the frames gain or lose them together;
    present in none, and the rule never looks at them there.

    `stacks` maps a frame to the stack holding it, which is `stack_member` read at
    one setting. A frame with no entry is in no stack -- membership gives a row to
    every EXIF-dated published tile and none to a tile the filesystem dated -- and
    a face in one of those is evidence about nothing here.

    Pure over two mappings, which is what makes the order the reader is asked in
    assertable without a database or a photograph. **Which frames a person has here
    is `frames`' business**, and it hands over the ones whose face reaches the
    prominence floor, that being the population the nesting rule reads.
    """
    held = Counter(stacks.values())
    return {
        person: sum(
            1
            for stack, count in Counter(
                stacks[frame] for frame in set(frames) if frame in stacks
            ).items()
            if count < held[stack]
        )
        for person, frames in appearances.items()
    }


def rank(one: Person) -> tuple:
    """What makes a person worth the reader's time, most first.

    **The splits lead**, because that is the whole reason to ask: the number is how
    many stacks the answer moves, so ordering on it is what makes stopping early a
    choice rather than a loss.

    **How many faces breaks the tie**, because it is how much the reader has to
    recognise them by. Two persons who each split two stacks are equally worth
    asking about and are not equally answerable -- one is a montage of seven faces
    and the other is a guess from one bad crop -- so the answerable one comes
    first.

    Ties break on the name last, so the order is total and deterministic. Answers
    are keyed on the person, and a reader who stops and comes back has to be shown
    the same list in the same order for the counter to mean anything.
    """
    return (-one.splits, -len(one.faces), one.person)


def order(
    appearances: Mapping[str, Collection[str]],
    stacks: Mapping[str, str],
    boxes: Mapping[str, Iterable[tuple[str, int, float]]] | None = None,
) -> list[Person]:
    """The persons worth asking about, in the order to ask them.

    **A person who changes nothing is not in the list at all**, rather than being
    at the end of it: the list is what the reader's time buys something on, and a
    tail of two thousand questions that move no stack is a tail that makes the
    counter meaningless.

    `boxes` is each person's own faces, `(sha256, idx, share)`, and is what the
    montage is drawn from. **Their own**, because two persons in one frame have two
    different faces in it, and a montage assembled from "every face of every frame
    this person appears in" would draw the reader somebody else.

    It is optional because the ordering of *persons* does not turn on it -- the tie
    breaks on how many faces there are and not on how big they were -- so the pure
    tests of the order need not construct it. Without it a frame stands for one
    face at index 0, which is a montage of the frames it was handed at unknown
    shares; `asking` hands over `frames`, so those are the above-floor ones and the
    montage a reader sees is `boxes`' every face.
    """
    scored = splits(appearances, stacks)
    held = boxes or {}
    asked = [
        Person(
            person=person,
            splits=scored[person],
            faces=tuple(
                sorted(
                    (
                        Face(sha256, idx, share)
                        for sha256, idx, share in held.get(
                            person, [(frame, 0, 0.0) for frame in appearances[person]]
                        )
                    ),
                    key=lambda face: (-face.share, face.sha256, face.idx),
                )
            ),
        )
        for person in appearances
        if scored[person]
    ]
    return sorted(asked, key=rank)


def progress(
    asked: Sequence[Person], given: Mapping[str, str]
) -> tuple[int, int]:
    """How many the reader has judged, and how many more would change anything.

    Two numbers because the reader asked for two, and the second is the one that
    says when stopping is free: it counts only the persons still in `asked`, which
    is the persons whose verdict could move a stack.

    The first counts every answer in the file at this clustering and not only the
    ones about persons still being asked about. A re-clustering, or a stack setting
    moved since, can leave a judged person off the list; what they said is still an
    answer they gave and a counter that lost it would be reporting their evening
    back to them wrongly.
    """
    return len(given), sum(1 for one in asked if one.person not in given)


# --- where the answers go -----------------------------------------------------

# Not a migration, for `harness.label.SCHEMA`'s reason: a table nothing shipped
# reads has no business in the shipped schema, so the harness that owns it creates
# it. It lives in `labels.sqlite3` beside the stack answers -- one page to run and
# one database to keep -- and `harness.label.store` is what creates both.
#
# **Keyed on the person and the clustering.** The three clustering columns are
# `face_person`'s own key and they are here for `stack_member`'s reason: a person
# is named by its least face, so re-clustering at another threshold can hand the
# same name to a different set of faces. Answering about one is not answering
# about the other, and a key that could not tell them apart would inherit
# judgements silently.
#
# **There is no verdict for "unjudged".** A person the reader has not reached has
# no row, and `counts` is what reads the absence as a friend. The two are different
# facts and only one of them is the reader's -- see the module docstring.
#
# One row per person per clustering, replaced on a revision rather than appended
# to: the reader said one thing about this person, latterly. A misclick is not
# permanent and a history of misclicks is not evidence about anybody.
#
# `person` is deliberately not the whole of the primary key's meaning and there is
# deliberately no `name` column. Naming a person is a later feature and this table
# is shaped so it could join one without disturbing anything; that is the whole of
# the accommodation made.
SCHEMA = f"""
CREATE TABLE IF NOT EXISTS person_verdict (
  model       TEXT NOT NULL,      -- the detector's identity, `face_person`'s own
  version     TEXT NOT NULL,
  threshold   REAL NOT NULL,      -- the cosine the faces were clustered at
  person      TEXT NOT NULL,      -- '<sha256>:<idx>' of the cluster's least face
  verdict     TEXT NOT NULL CHECK (verdict IN ({', '.join(f"'{v}'" for v in VERDICTS)})),
  answered_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (model, version, threshold, person)
)
"""

_RECORD = """
INSERT OR REPLACE INTO person_verdict (model, version, threshold, person, verdict)
VALUES (?, ?, ?, ?, ?)
"""

_VERDICTS = """
SELECT person, verdict FROM person_verdict
WHERE model = ? AND version = ? AND threshold = ?
"""


def ensure(conn: sqlite3.Connection) -> None:
    """Create the verdict table on a labels connection if it is not there yet.

    A function rather than a second `store`, because there is one labels file and
    one connection to it: `harness.label.store` opens it and calls this, so the
    harness has one open and both modes write through it.
    """
    conn.execute(SCHEMA)


def record(
    conn: sqlite3.Connection,
    person: str,
    verdict: str,
    *,
    clustering: Clustering,
) -> None:
    """File one judgement about one person, replacing whatever it said before.

    The clustering is not defaulted. A verdict that did not say which population of
    persons it was about would be a judgement about a name rather than about
    somebody, and there is no value it could take that would be right for every
    caller.
    """
    conn.execute(
        _RECORD,
        (
            clustering.model,
            clustering.version,
            clustering.threshold,
            person,
            verdict,
        ),
    )


def judged_yet(conn: sqlite3.Connection) -> bool:
    """Whether this labels file has a verdict table at all.

    A file written before the people mode existed holds `answer` and nothing else,
    and `ensure` cannot add the table to a connection opened read-only -- which is
    how `harness.floor` opens it, deliberately, because that report writes nothing.
    So a reader who has three rounds of stack answers and runs the floor report
    before ever opening the people mode needs to be told which step is missing,
    rather than shown `no such table`.
    """
    return bool(
        conn.execute(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'person_verdict'"
        ).fetchone()
    )


def verdicts(conn: sqlite3.Connection, clustering: Clustering) -> dict[str, str]:
    """Every judgement given about this clustering's persons, by person.

    Only the rows there are. A person with no row is absent and not `friend`: see
    `counts`, which is where the absence is read.

    An older labels file has no table to read, and that is *no answers* rather than
    an error: the reader has not judged anybody because there was nowhere to record
    it. `judged_yet` is how a caller tells that from a file with the table and no
    rows, where it wants to say something different.
    """
    if not judged_yet(conn):
        return {}
    return {
        person: given
        for person, given in conn.execute(
            _VERDICTS, (clustering.model, clustering.version, clustering.threshold)
        )
    }


# --- what the catalog holds ---------------------------------------------------

_APPEARANCES = """
SELECT fp.person, fp.sha256, fp.idx, f.share
FROM face_person fp
JOIN face f
  ON f.model = fp.model AND f.version = fp.version
 AND f.sha256 = fp.sha256 AND f.idx = fp.idx
WHERE fp.model = ? AND fp.version = ? AND fp.threshold = ? AND fp.cut = ?
"""

_MEMBERSHIP = f"""
SELECT sha256, stack FROM stack_member
WHERE {' AND '.join(f'{column} = ?' for column in STACK_SETTING)}
"""


def found(conn: sqlite3.Connection, clustering: Clustering) -> dict[str, list[Face]]:
    """Every person's own faces: where each was found and how big it was.

    One join over `face_person` and `face`, and the person is the key because the
    face is the thing a person *is* -- a clustering is an assignment of faces, and
    both readers of this want it that way round. `order` counts splits over the
    frames and draws the montage from the boxes, and `harness.floor` prices a floor
    against the boxes of the persons the reader judged.

    Keyed by person rather than by frame for one further reason: a frame holding two
    persons holds two faces, and a mapping from frames to shares could not say which
    face was whose.
    """
    held: dict[str, list[Face]] = {}
    for person, sha256, idx, share in conn.execute(
        _APPEARANCES,
        (clustering.model, clustering.version, clustering.threshold, clustering.cut),
    ):
        held.setdefault(person, []).append(Face(sha256, idx, share))
    return held


def frames(held: Mapping[str, Sequence[Face]]) -> dict[str, list[str]]:
    """Each person's frames **at the floor**, which is what `splits` counts over.

    A face under `photolib.people.FLOOR` is in no frame's people, so the frames a
    split is counted over are the frames of the faces that reach it: that is the
    population the nesting rule reads, and the module docstring is where what a
    count over every face cost the reader is written down.

    A person whose every box is under it keeps their key and scores zero, and
    `order` already never asks about a zero. **The montage is not filtered** -- a
    small face is still something to recognise somebody by, and `boxes` hands over
    every face they have.

    The floor is read here and never copied, so moving that one line moves the queue
    and there is nothing to regenerate.
    """
    return {
        person: [face.sha256 for face in faces if face.share >= FLOOR]
        for person, faces in held.items()
    }


def boxes(
    held: Mapping[str, Sequence[Face]]
) -> dict[str, list[tuple[str, int, float]]]:
    """Each person's faces as plain tuples -- `order`'s and `populations`' input.

    One shape for both, so the montage and the floor report are reading the same
    boxes rather than two assemblies of them that could come to disagree.
    """
    return {
        person: [(face.sha256, face.idx, face.share) for face in faces]
        for person, faces in held.items()
    }


def membership(conn: sqlite3.Connection) -> dict[str, str]:
    """Each frame's stack, at the setting the grid draws.

    `browse.STACK_SETTING` and not a knob, for the reason it is not one there: the
    splits are counted over stacks, so reading another setting's assignment would
    price a verdict against a grid nobody is looking at.
    """
    return {
        sha256: stack
        for sha256, stack in conn.execute(_MEMBERSHIP, tuple(STACK_SETTING.values()))
    }


def asking(conn: sqlite3.Connection, clustering: Clustering) -> list[Person]:
    """The persons worth asking about, read off the catalog.

    Two queries and then the pure function, which is the split this module keeps
    everywhere: what the catalog holds is a read, and what the reader is asked is
    arithmetic over it.
    """
    held = found(conn, clustering)
    return order(frames(held), membership(conn), boxes(held))
