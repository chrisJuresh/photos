"""The screen where twelve anecdotes become a few hundred judgements.

**This is scaffolding with a stated end of life.** `docs/adr/0003-stack-on-verified-match.md`
leaves the reader's *strictness* -- the threshold on the Match -- unsettled on
purpose, and says how it will be settled: a labelling harness, thrown away
afterwards, showing candidate stacks with the frame before and after each one and
recording merge / split / **not sure**. This is that harness. It is not part of
the shipped website, nothing in `photolib/` imports it, no route of
`photolib.grid` reaches it, and it is expected to be deleted whole once the grid
ticket lands.

It shows one candidate stack at a time **with its neighbours**, which is what
lets a single screen answer both of the reader's complaints at once: *does this
stack hold something that does not belong*, and *is it missing something that
should be here*. Accepting the stack as drawn is one keystroke, because that is
the common case and it should cost almost nothing. Clicking a member says it does
not belong; clicking a neighbour says it should have been included. **Not sure**
is a first-class answer and not a skip -- the reader has said outright that some
of these are grey, and a grey area recorded as grey is worth more than a forced
verdict.

Which sets it shows is the point of it, and it is not the same question twice.
**ADR 0003 asks for two rounds and they are two runs of this module**, saying on
the command line which round they are:

*Round one* drew at a provisional line, and every set was chosen for how little
the Match committed to it, so the reader's evening landed where it moved the real
threshold most. Its answers settled the line: strictness 20 with *matches most
members*.

*Round two* draws at that settled setting -- `DEFAULT_LINKAGE` is what the labels
chose, not what the ADR argued from -- and goes looking for the one population
round one could not price. Round one's five long drags are 79% of the pairs the
reader kept together and hold not one frame they pushed out, so those labels
cannot price a *chaining* rule's failure: a chain that walks a whole run into one
stack scores perfectly on them. So the sets are ranked by how many frames single
linkage would drag across a boundary the settled rule drew -- see
`Question.chain` -- which is where a pan or a walk between subjects shows up,
whichever side of the stack it happens on. The reader is not told which
sets those are, because telling them would prime the rejection the round exists to
observe.

Either way the sample is spread over the cameras, so a threshold calibrated on
the body the operator shoots most does not quietly misbehave on the other four,
and a set an earlier round already answered is not asked again.

Answers go to a `labels.sqlite3` of the harness's own, beside the catalog on the
NVMe. **Never `state.sqlite3`**: that holds irreplaceable triage decisions and has
its own snapshot and restore machinery, and these labels are disposable
calibration data that will be re-derived if the descriptor changes. It is not a
migrated database either, for the same reason -- a disposable table has no
business in the shipped schema, so this module creates its own and `*.sqlite3` in
`.gitignore` is what keeps it out of git. The reader's *answers* are the
exception to all of that disposability, because an evening of them cannot be
re-derived from anything: when this module changes the shape it writes, it
carries them forward rather than asking for the file to be moved aside. See
`_carry_over`.

Frames are served from the same 1536px substrate tree the grid's overlay draws
from, so what the reader judges is what the grid will draw. It reads the catalog
and the substrates, both on the NVMe, and never opens `G:`.

    python -m harness.label --open

Stopping it loses nothing: every answer is committed as it is given, the sample
is deterministic, and an answer already given comes back with its set so it can
be revised rather than repeated.
"""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
import threading
from collections.abc import Container, Iterable, Sequence
from dataclasses import dataclass, replace
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from photolib import candidates, matches
from photolib.config import load, substrate_path

# The rule itself, which is not the harness's to own: `photolib.membership`
# materialises the assignment and this harness judges it, so the walk both of them
# read has to be one walk and it has to be the one that outlives this directory.
# Imported by name rather than reached through the module so that `label.link` and
# `label.LINKAGE` go on meaning what they have always meant here.
from photolib.membership import (  # noqa: F401 -- re-exported for `harness.calibrate`
    LINKAGE,
    Joins,
    Points,
    complete,
    link,
    majority,
    match,
    neighbour,
)

# The line the sets are drawn at. It was **not** the answer this harness exists to
# find when round one asked -- it was a place to stand while asking, and every set
# was chosen for sitting near it rather than for being on one side of it.
#
# 20 because that is where the two populations `photolib.matches` measured start
# to separate: pairs a second or less apart score a median of 283 and 94% of them
# reach 20 or more, against a median of 5 beyond two minutes. Round one's answers
# left it where it stood, so for round two the same number is the setting under
# test rather than a guess, and `--strictness` is how a later round moves it.
STRICTNESS = 20

# The rule the sets are cut with. `complete` is what ADR 0003 argued from and
# `majority` is what its labels chose, so this is a finding and not a preference:
# at strictness 20 "matches most members" beat complete linkage on precision and
# recall at once, because 224 of the pairs the reader kept together carry no Match
# row at all and complete linkage cannot express a burst holding one.
#
# It is the default so that a bare run is round two -- ADR 0003 asks the second
# round to draw at the setting the first one settled -- and `--linkage` is how a
# round says otherwise.
DEFAULT_LINKAGE = "majority"

# Which round this is. Round one is recorded and its answers are carried forward
# (see `_carry_over`), so the bare run is the second of ADR 0003's two and there
# is no third. It rides with every answer because round two's agreement is a
# *check* on the setting round one chose and must never be pooled into the
# evidence for it -- `harness.calibrate` is what keeps them apart.
ROUND = 2

# How many sets one round is worth. ADR 0003 asks for two rounds of about thirty,
# and they are two *runs* of this harness rather than sixty sets in one sitting:
# the second is "drawn after re-running with the first round's answers", so the
# line has moved by then and the sample it draws is a different one. `--sets`,
# `--strictness`, `--linkage` and `--round` are how the second round says so.
SETS = 30

# How many frames either side of a stack the reader may look at, and how many
# they are shown before asking.
#
# One each side is what ADR 0003 specifies and it is not enough on its own: the
# frame beyond the neighbour is often a plausible member too, and a reader who
# cannot see it cannot say so. Measured over this catalog, of the 4,368 candidate
# stacks 46% have no frame outside with any claim at all -- but the sets a round
# samples are the *least decisive* ones by construction, and there only 27% do.
#
# There is also no width that settles it: three each side covers 43% of a round's
# sets and eight covers little more, because the runs this fence admits reach
# 1,435 frames. So the width is the reader's to choose per set. One each side is
# the default because the common case is a stack with nothing arguable beside it
# and it should cost nothing to confirm; `CONTEXT` is as far as the widening key
# goes.
#
# The extra frames are chosen by position in the run and captioned with the gap,
# never by the Match: a bracket end blown out past having any texture left scores
# nothing and is exactly the member ADR 0003 expects to be missed, so choosing
# context by the Match would hide the failure the reader is here to find.
#
# **There is no ceiling.** Eight was the first one and the reader hit it; sixty
# was the second and they hit that too, which is the answer to whether a number
# picked here can be the right one. A long burst of the same subject is still
# the same subject sixty frames out, and "where does this end" cannot be
# answered from inside the part that looks alike.
#
# The reason a ceiling looked necessary was cost, and measuring it took the
# argument away: the whole run either side of every set a round samples is 3,808
# frames in total, about 316 KB of shas over the loopback, against 85 KB at
# sixty. That buys widening with no round trip and no limit to explain.
#
# What bounds the view now is the room on screen, which is the reader's own
# judgement and visible to them while they make it. `harness/page.js` lays the
# frames out at a floor size and lets the box scroll rather than shrinking them
# away to nothing.
CONTEXT = None
SHOWN = 1

# A bound on the request field rather than on the view: `shown` arrives from a
# client and indexes a slice, so it is checked for being a sane positive number
# and nothing more. Asking for more than there is returns what there is.
MOST = 100_000

DEFAULT_PORT = 8771  # the grid is on 8770 and this is not the grid

LABELS = "labels.sqlite3"  # beside the catalog, which is where the NVMe is named

STATIC_DIR = Path(__file__).resolve().parent

Capture = tuple[str, int]  # a frame, and when it was taken
Run = tuple[str | None, list[Capture]]  # a camera, and its consecutive captures
Near = tuple[str, int]  # a frame outside the stack, and its gap from the edge


# --- forming the sets ---------------------------------------------------------


@dataclass(frozen=True)
class Question:
    """One candidate stack, what surrounds it, and how little the Match commits.

    `before` and `after` run **outwards from the stack**, nearest frame first,
    and carry the seconds between each frame and the edge of the stack it sits
    beside. The gap is carried because it is what tells the reader whether a
    frame outside is plausible at all -- two seconds is another press of the
    shutter and forty minutes is somewhere else -- and because it is the fence
    ADR 0003 keeps, made visible.
    """

    camera: str | None
    members: tuple[str, ...]
    before: tuple[Near, ...]
    after: tuple[Near, ...]
    margin: int  # points between the weakest evidence and `STRICTNESS`
    # How many frames of the run single linkage would keep with a member of this
    # stack that this stack does not hold, and zero where the two rules agree
    # about every boundary around it. **This is what round two is for.**
    #
    # ADR 0003 declines neighbour linkage on an argument rather than on a
    # measurement, because round one's labels cannot price it: a chain that walks
    # a whole run into one stack scores perfectly on sets that hold no frame the
    # reader pushed out. The sets where it *would* go wrong are the ones where it
    # crosses a boundary the settled rule drew -- across a pan, or a walk between
    # subjects -- and this counts how many frames it drags across. `spread` ranks
    # on it, so the sampler seeks that population rather than hoping the margin
    # lands on it.
    #
    # Counted against the *frames* and not the pairs, and over **every** member's
    # chain rather than the first member's: single linkage can break inside a
    # stack the softening held together and go on chaining from a later member,
    # which is precisely where "matches most members" earns its keep, so anchoring
    # on one frame would score the sharpest cases zero. Either side of the stack
    # counts, because a chain crossing the boundary before it is the same failure
    # as one crossing the boundary after.
    #
    # Those extra frames are already on screen as neighbours, so the reader prices
    # the chain by answering the question they were always answering -- and they
    # are never told which sets these are, because that would prime the rejection
    # the round exists to observe.
    chain: int = 0
    # The first frame this camera took *outside* the run, each side, with the
    # seconds to it -- or None where the library itself ends.
    #
    # It is drawn always, however narrow the view, and it is the reader's check
    # on the two things the harness otherwise asks them to take on trust: that
    # the run ended because the shooting ended, and that the clock is telling the
    # truth. A frame 23 hours away that is plainly the same photograph is a wrong
    # timestamp, and nothing else in this screen could show that. It is drawn
    # apart from the run because it is not a candidate -- ADR 0003's fence makes
    # the window necessary, so this frame cannot join the stack -- but the reader
    # may still say it belongs, and that answer is evidence about the fence
    # rather than about the threshold.
    outside: tuple[Near | None, Near | None] = (None, None)

    def nearest(self) -> tuple[str | None, str | None]:
        """The frame each side of the stack, which is where the margin is decided."""
        return (
            self.before[0][0] if self.before else None,
            self.after[0][0] if self.after else None,
        )

    def surrounding(self, shown: int) -> list[str]:
        """The frames outside the stack the reader was actually shown.

        The two beyond the run are always among them, because they are always
        drawn -- see `outside`.
        """
        return (
            [sha for sha, _ in self.before[:shown]]
            + [sha for sha, _ in self.after[:shown]]
            + [near[0] for near in self.outside if near is not None]
        )


def _margin(
    members: Sequence[str],
    neighbours: Iterable[str | None],
    points: Points,
    strictness: int,
) -> int:
    """How far the weakest thing this drawing rests on sits from the line.

    Two kinds of evidence and they are the reader's two complaints. A pair
    *inside* the stack barely above the line is a frame that may not belong; a
    neighbour *outside* it barely below is a frame that may be missing. Both are
    a distance from `strictness`, so the least decisive of them is one number.

    A neighbour is judged on its weakest pair against the stack, because complete
    linkage is what it would have had to satisfy. Floored at zero, so a neighbour
    that agrees with every member and was split off anyway -- which the forward
    walk can do -- reads as the coin toss it is rather than as a negative.

    The two terms are not on the same scale and cannot be: a Match runs upwards
    without a bound, so a member pair can sit hundreds of points above the line,
    while a neighbour can only be `strictness` below it. That asymmetry is the
    truth about the distances and not a skew, and it is invisible to the ordering
    -- it only ever separates sets that are decisive either way.
    """
    weakest = [
        match(points, early, late) - strictness
        for index, early in enumerate(members)
        for late in members[index + 1 :]
    ]
    weakest += [
        strictness - min(match(points, neighbour, member) for member in members)
        for neighbour in neighbours
        if neighbour is not None
    ]
    return max(min(weakest, default=0), 0)


def questions(
    runs: Iterable[Run],
    points: Points,
    strictness: int = STRICTNESS,
    context: int | None = CONTEXT,
    joins: Joins = LINKAGE[DEFAULT_LINKAGE],
) -> list[Question]:
    """Every candidate stack there is to ask about, with what surrounds it.

    A stack of one is not asked about -- CONTEXT.md has a stack be the same
    photograph taken more than once -- but it is still drawn, as a neighbour of
    whichever stack it borders. Which is the whole shape of the second complaint:
    the frame that should have been included is usually sitting right there.

    Up to `context` frames are carried each side rather than one -- the whole run
    when it is None, which is the default and what the reader gets -- so widening
    the view is a local move however far it goes. Only the nearest still decides
    the margin: the margin is about *this* boundary, and a frame five along is
    its own boundary with its own question.

    `joins` is the rule the stacks are cut with and it defaults to the one the
    labels chose, so a bare call draws round two. The run is cut a second time by
    single linkage -- never to draw anything, only to fill in `Question.chain`,
    which is why every member's chain group is looked up and not just the first's.
    """
    asked: list[Question] = []
    for camera, run in runs:
        shas = [sha for sha, _ in run]
        reach = len(shas) if context is None else context
        taken = dict(run)
        stacks = link(shas, points, strictness, joins)
        chained = [set(walked) for walked in link(shas, points, strictness, neighbour)]
        holds = {sha: index for index, walked in enumerate(chained) for sha in walked}
        at = 0
        for stack in stacks:
            first, last = at, at + len(stack) - 1
            at += len(stack)
            if len(stack) < 2:
                continue
            before = tuple(
                (shas[index], taken[shas[first]] - taken[shas[index]])
                for index in range(first - 1, max(first - reach - 1, -1), -1)
            )
            after = tuple(
                (shas[index], taken[shas[index]] - taken[shas[last]])
                for index in range(last + 1, min(last + reach + 1, len(shas)))
            )
            question = Question(
                camera=camera,
                members=tuple(stack),
                before=before,
                after=after,
                margin=0,
                chain=len(
                    set().union(*(chained[holds[member]] for member in stack))
                    - set(stack)
                ),
            )
            asked.append(
                replace(
                    question,
                    margin=_margin(stack, question.nearest(), points, strictness),
                )
            )
    return asked


def rank(question: Question) -> tuple:
    """What makes a set worth the reader's time, most first.

    **The chain leads and the margin breaks its ties**, which is round two's whole
    change to the sample. Round one ranked on the margin alone and that was right
    for the question it asked; it cannot ask this one, because the margin is a
    distance from the line and a chaining rule's failure is not -- a run single
    linkage walks straight through can sit hundreds of points clear of the line at
    every boundary it crosses.

    The margin also flattens under the rule the labels chose. `_margin` floors at
    zero, and a stack drawn by "matches most members" may hold a pair the Match
    rejected outright -- which is the whole point of the softening -- so a great
    many stacks now sit at zero and a ranking on the margin alone would order them
    by their shas. Leading on the chain puts a reason back in front of it.

    Ties break on the members last, so the order is total and deterministic:
    answers are keyed on the frames, and a reader who stops and comes back has to
    be shown the same sets in the same order for the counter to mean anything.
    """
    return (-question.chain, question.margin, question.members)


def unanswered(asked: Sequence[Question], already: Container[str]) -> list[Question]:
    """The sets `already` does not hold -- what an earlier round has not settled.

    Keyed on the stack as drawn, so what is dropped is the same *question* and not
    merely an overlapping one: round two cuts the runs with a different rule, and a
    stack that has grown a frame since round one answered it is a claim the reader
    has not seen. `answered_before` is where the keys come from.

    Only earlier rounds, never the round in hand: an answer given in this round
    comes back with its set so it can be revised, which is what makes walking away
    mid-round free.
    """
    return [question for question in asked if key(question.members) not in already]


def spread(asked: Sequence[Question], wanted: int = SETS) -> list[Question]:
    """The sets worth asking about, taken a camera at a time.

    `rank` decides what worth means. Round-robin over the cameras is the other
    half of the ask: the operator shoots one body far more than the other four, so
    a straight ranking would hand back an evening of that body alone and calibrate
    a number that quietly misbehaves everywhere else.

    Deterministic -- `rank` is a total order, and the cameras are ordered by their
    own best set -- because answers are keyed on the frames and a reader who stops
    and comes back has to be shown the same sets in the same order for the counter
    to mean anything.

    The camera order is the order their best sets appear, which is what filling the
    queues from the ranked list already leaves behind: a dict remembers the order
    its keys arrived in. Sorting the cameras separately would mean naming which
    parts of `rank` decide it, and a fourth term added to `rank` later would
    silently stop being one of them.
    """
    queues: dict[str | None, list[Question]] = {}
    for question in sorted(asked, key=rank):
        queues.setdefault(question.camera, []).append(question)
    order = list(queues)

    picked: list[Question] = []
    while len(picked) < wanted and any(queues.values()):
        for camera in order:
            if queues[camera]:
                picked.append(queues[camera].pop(0))
                if len(picked) == wanted:
                    break
    return picked


def plan(
    conn: sqlite3.Connection,
    *,
    strictness: int = STRICTNESS,
    linkage: str = DEFAULT_LINKAGE,
    wanted: int = SETS,
    already: Container[str] = frozenset(),
    ceiling: int = candidates.CEILING,
    method: str = matches.METHOD,
    version: str = matches.VERSION,
) -> list[Question]:
    """The sets to ask about, read from the catalog and from nothing else.

    The population and the runs are `photolib.candidates`' own, so what this asks
    about is what that pass enumerated: the frames are cut into runs the same way
    and a pair it never considered a candidate is a pair with no Match here.

    `already` is what an earlier round settled and is dropped before the sample is
    taken, so a round of thirty is thirty *new* questions rather than thirty minus
    what the reader has seen. It comes from the labels database, which this
    function is deliberately not given: the catalog is the only thing it opens.
    """
    frames = candidates.population(conn)
    camera_of = {sha256: camera for camera, _secs, _kind, sha256 in frames}
    taken = {sha256: secs for _camera, secs, _kind, sha256 in frames}
    runs = [
        (camera_of[run[0]], [(sha256, taken[sha256]) for sha256 in run])
        for run in candidates.runs(frames, ceiling)
    ]
    points: Points = {
        (early, late): count
        for early, late, count in conn.execute(
            "SELECT sha_early, sha_late, points FROM pair_match WHERE method = ? AND version = ?",
            (method, version),
        )
    }
    asked = spread(
        unanswered(questions(runs, points, strictness, joins=LINKAGE[linkage]), already),
        wanted,
    )

    # The frame just past each end of every run. The run is where the context
    # stops, and from inside the harness a run that ended looks exactly like a
    # view that was capped -- which is what the reader read it as. Drawing the
    # frame beyond it, with the hours to it, tells those two apart and lets a
    # wrong timestamp show itself. It comes from the same population the runs
    # were cut out of, so it costs a lookup and no second pass.
    at = {sha256: index for index, (_c, _s, _k, sha256) in enumerate(frames)}
    ends = {}
    for camera, run in runs:
        first, last = at[run[0][0]], at[run[-1][0]]
        ends[run[0][0]] = (
            (frames[first - 1][3], frames[first][1] - frames[first - 1][1])
            if first > 0 and frames[first - 1][0] == camera
            else None,
            (frames[last + 1][3], frames[last + 1][1] - frames[last][1])
            if last + 1 < len(frames) and frames[last + 1][0] == camera
            else None,
        )
    heads = {sha256: run[0][0] for _camera, run in runs for sha256, _secs in run}
    return [
        replace(question, outside=ends[heads[question.members[0]]]) for question in asked
    ]


# --- what the reader answers --------------------------------------------------

VERDICTS = ("accept", "split", "merge", "both", "unsure")


def verdict(*, evicted: Sequence[str], included: Sequence[str], unsure: bool) -> str:
    """What a set of clicks and a keystroke amount to.

    Five answers rather than three, because a reader who both evicts a frame and
    pulls a neighbour in has said two things and `both` is what they said. Not
    sure outranks everything: it is the answer, not the absence of one, and a
    click the reader then decided they were unsure about must not survive as a
    verdict.
    """
    if unsure:
        return "unsure"
    if evicted and included:
        return "both"
    if evicted:
        return "split"
    if included:
        return "merge"
    return "accept"


def key(members: Sequence[str]) -> str:
    """What an answer is filed under: the stack it was about, as drawn.

    The frames and not a set number, because the sample moves when the
    provisional strictness does -- so an answer keyed on its position in a list
    would come back attached to a different photograph.
    """
    return ",".join(members)


# Not a migration. A disposable table has no business in the shipped schema, so
# this is created by the harness that owns it and goes when the harness does.
# `margin` and `camera` ride along with the answer because reading the labels
# afterwards means asking how the verdicts fell across the grey band and across
# the bodies, and neither question can be re-derived once the sample has moved.
#
# **`surrounding` is what makes an answer readable, and ticket 34 turns on it.**
# It is the frames outside the stack that were on screen when the answer was
# given -- so `accept` means "the frames I was shown are right" and never "this
# stack is complete". A strictness that pulls in a frame the reader never saw is
# not contradicting them, and a report that scored it as an error would be
# measuring the width of this window rather than the threshold.
#
# **`round` says which of ADR 0003's two rounds asked**, and it is the column
# `harness.calibrate` splits on: round one's answers are the evidence the setting
# was chosen from and round two's are a check on it, so pooling them would let the
# check vote for the thing it is checking.
#
# It is last, and defaulted, because a database written before rounds existed gains
# it by `ALTER TABLE` -- which can only append -- and the migrated shape and the
# fresh one should be the same shape. The default is 1 for the same reason: every
# answer that predates the column is round one's, since round one is all that had
# run. See `_carry_over`.
SCHEMA = f"""
CREATE TABLE IF NOT EXISTS answer (
  members     TEXT PRIMARY KEY,  -- the stack as drawn, comma-joined. See `key`.
  camera      TEXT,
  surrounding TEXT NOT NULL,     -- JSON: the frames outside it the reader saw
  margin      INTEGER NOT NULL,
  verdict     TEXT NOT NULL CHECK (verdict IN ({', '.join(f"'{v}'" for v in VERDICTS)})),
  evicted     TEXT NOT NULL,     -- JSON: members the reader said do not belong
  included    TEXT NOT NULL,     -- JSON: neighbours the reader said should be in
  answered_at TEXT NOT NULL DEFAULT (datetime('now')),
  round       INTEGER NOT NULL DEFAULT 1
)
"""

_ROUND_COLUMN = "ALTER TABLE answer ADD COLUMN round INTEGER NOT NULL DEFAULT 1"

_RECORD = """
INSERT OR REPLACE INTO answer
  (members, camera, surrounding, margin, verdict, evicted, included, round)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
"""


_CARRY = """
INSERT INTO answer
  (members, camera, surrounding, margin, verdict, evicted, included, answered_at, round)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
"""


def _carry_over(conn: sqlite3.Connection) -> str | None:
    """Bring answers written under an older shape of this table into the current one.

    Not a migration framework and not the start of one -- this converts the shapes
    this harness itself wrote, and goes with the directory. It is here because it
    is **exact** both times. The oldest table stored `before_sha` and `after_sha`,
    which is precisely what was on screen when the view was one frame either side.
    The next one stored no round, and every answer in it is round one's, because
    round one is all that had run when it was written -- so the reader keeps an
    evening of answers without re-labelling a set.

    The alternative was refusing and asking the reader to move the file aside,
    which is what this did first. That is the wrong trade: their answers are the
    one thing here that is not re-derivable, and making them handle a file to
    keep them is a cost with nothing on the other side of it.
    """
    columns = {row[1] for row in conn.execute("PRAGMA table_info(answer)")}
    if not columns:
        return None
    if "surrounding" in columns:
        # The current shape but for the round, which every answer already in it
        # answers by existing: round one is all that had run.
        if "round" in columns:
            return None
        conn.execute(_ROUND_COLUMN)
        (stamped,) = conn.execute("SELECT count(*) FROM answer").fetchone()
        return f"carried {stamped} answer(s) forward as round one"

    conn.execute("BEGIN")
    conn.execute("ALTER TABLE answer RENAME TO answer_before_widening")
    conn.execute(SCHEMA)
    older = conn.execute(
        "SELECT members, camera, before_sha, after_sha, margin, verdict, evicted,"
        " included, answered_at FROM answer_before_widening"
    ).fetchall()
    conn.executemany(
        _CARRY,
        [
            (
                members,
                camera,
                json.dumps([sha for sha in (before, after) if sha]),
                margin,
                given,
                evicted,
                included,
                when,
            )
            for members, camera, before, after, margin, given, evicted, included, when in older
        ],
    )
    conn.execute("DROP TABLE answer_before_widening")
    conn.execute("COMMIT")
    return (
        f"carried {len(older)} answer(s) forward as round one, from before the view"
        " could be widened"
    )


def store(path: Path) -> sqlite3.Connection:
    """The labels database, created if it is not there yet.

    Its own file and its own connection: the catalog is not attached and
    `state.sqlite3` has no name here at all, which is what makes "these labels
    never reach the triage decisions" a fact about the code.

    One connection shared across the server's threads rather than one per thread
    as `photolib.grid` has, because there is exactly one reader at one keyboard
    and every use of it goes through `LabelServer`'s lock. `check_same_thread` is
    off because that is what the lock is for.
    """
    conn = sqlite3.connect(path, isolation_level=None, check_same_thread=False)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute(SCHEMA)
    carried = _carry_over(conn)
    if carried:
        print(carried)
    return conn


def record(
    conn: sqlite3.Connection,
    question: Question,
    *,
    shown: int,
    evicted: Sequence[str],
    included: Sequence[str],
    unsure: bool,
    round: int,
) -> str:
    """File one answer, replacing whatever the reader said about it before.

    The question rather than five of its fields, because reading the labels
    afterwards means asking how the verdicts fell across the grey band and across
    the bodies -- so what was asked is stored beside what was answered, and there
    is one place that decides which parts of it that is. `shown` is how far the
    reader had widened the view, and it is stored as the frames themselves: see
    `SCHEMA` for why that is the column ticket 34 turns on.

    `round` is the round in hand and is not defaulted, because an answer that did
    not say which round asked it cannot be told from the evidence it is meant to
    be checking.
    """
    given = verdict(evicted=evicted, included=included, unsure=unsure)
    conn.execute(
        _RECORD,
        (
            key(question.members),
            question.camera,
            json.dumps(question.surrounding(shown)),
            question.margin,
            given,
            json.dumps(list(evicted)),
            json.dumps(list(included)),
            round,
        ),
    )
    return given


def answers(conn: sqlite3.Connection, round: int | None = None) -> dict[str, dict]:
    """Every answer given, by the stack it was about.

    `round` narrows it to one round, which is what the counter the reader is shown
    is about: "how many more are useful" is a question about the round in hand and
    not about every evening they have spent here.
    """
    return {
        row[0]: {
            "members": row[0].split(","),
            "camera": row[1],
            "verdict": row[2],
            "evicted": json.loads(row[3]),
            "included": json.loads(row[4]),
            "surrounding": json.loads(row[5]),
            "round": row[6],
        }
        for row in conn.execute(
            "SELECT members, camera, verdict, evicted, included, surrounding, round"
            " FROM answer WHERE ?1 IS NULL OR round = ?1",
            (round,),
        )
    }


def answered_before(conn: sqlite3.Connection, round: int) -> set[str]:
    """The stacks an earlier round already settled, as `key` files them.

    Earlier and not merely other, which is the difference between not asking a
    question twice and not letting the reader revise the answer they just gave.
    """
    return {
        row[0]
        for row in conn.execute("SELECT members FROM answer WHERE round < ?", (round,))
    }


# --- the page -----------------------------------------------------------------

STATIC_ROUTES = {
    "/": ("page.html", "text/html; charset=utf-8"),
    "/page.css": ("page.css", "text/css; charset=utf-8"),
    "/page.js": ("page.js", "text/javascript; charset=utf-8"),
}

# 64 lowercase hex cannot traverse, cannot be absolute and cannot hold a
# separator, so the pattern is the containment proof. `photolib.grid` spells the
# same route the same way and for the same reason.
SUBSTRATE_ROUTE = re.compile(r"^/d/([0-9a-f]{64})\.webp$")

MAX_ANSWER_BODY = 8 * 1024

# Copied from `photolib.grid` rather than imported from it, and this is the one
# place that is the right way round: importing would leave the shipped server
# holding a name this directory uses, and deleting `harness/` has to leave
# nothing behind. The copy is small, it is checked against the original whenever
# either moves, and the whole of it goes at once.
SECURITY_HEADERS = (
    ("X-Content-Type-Options", "nosniff"),
    ("Referrer-Policy", "no-referrer"),
    ("X-Frame-Options", "DENY"),
    (
        "Content-Security-Policy",
        "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; "
        "connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    ),
)


class LabelServer(ThreadingHTTPServer):
    """Threaded for `photolib.grid.GridServer`'s reason: keep-alive plus one
    thread is a hang rather than a slowdown, and a set draws up to a dozen 1536px
    frames at once."""

    daemon_threads = True
    allow_reuse_address = False

    def __init__(
        self,
        address,
        handler,
        asked: list[Question],
        labels,
        substrate_root,
        *,
        round: int = ROUND,
        strictness: int = STRICTNESS,
        linkage: str = DEFAULT_LINKAGE,
    ):
        self.asked = asked
        self.labels = labels
        self.substrate_root = substrate_root
        # The round in hand and the setting it is drawn at. Held here rather than
        # read off the module, so what the page says is what this run is doing:
        # `--strictness` used to move the sample without moving the number printed
        # beside it.
        self.round = round
        self.strictness = strictness
        self.linkage = linkage
        # Every touch of the labels database goes through this, which is what
        # lets one connection serve threaded requests -- see `store`.
        self._lock = threading.Lock()
        super().__init__(address, handler)
        port = self.server_address[1]
        self.allowed_hosts = frozenset({f"127.0.0.1:{port}", f"localhost:{port}"})
        self.allowed_origins = frozenset(
            {f"http://127.0.0.1:{port}", f"http://localhost:{port}"}
        )

    def judge(self, question: Question, **marks) -> dict:
        """Record one answer and hand back the sample it changed.

        One lock over the write and the read that follows it, so the counter the
        reader is shown is the count as of their own click.
        """
        with self._lock:
            record(self.labels, question, round=self.round, **marks)
            return self._payload()

    def payload(self) -> dict:
        with self._lock:
            return self._payload()

    def _payload(self) -> dict:
        """The whole sample, with whatever the reader has already said about it.

        All of it at once: thirty sets of shas is a few tens of kilobytes, and
        sending it whole is what makes going back to revise an answer a local
        move rather than a round trip.

        The answers are this round's, so the counter counts the round in hand. An
        earlier round's answers are not in the sample anyway -- `unanswered` drops
        their sets before it is taken -- and saying so here as well is what keeps
        "how many more are useful" a question about this sitting.
        """
        given = answers(self.labels, self.round)
        sets = [
            {
                "members": list(question.members),
                # Nearest first, each with the seconds between it and the stack.
                # All of them ride with the set: widening the view is then a
                # local move, like going back to revise is.
                "before": [{"sha": sha, "gap": gap} for sha, gap in question.before],
                "after": [{"sha": sha, "gap": gap} for sha, gap in question.after],
                # Always sent and always drawn, whatever the view is widened
                # to: the frame past each end of the run is the reader's check
                # on the clock. See `Question.outside`.
                "outside": [
                    None if near is None else {"sha": near[0], "gap": near[1]}
                    for near in question.outside
                ],
                "camera": question.camera,
                "margin": question.margin,
                "answer": given.get(key(question.members)),
            }
            for question in self.asked
        ]
        return {
            "sets": sets,
            "shown": SHOWN,
            "round": self.round,
            "strictness": self.strictness,
            "linkage": self.linkage,
            "given": sum(1 for entry in sets if entry["answer"] is not None),
            # What is left to judge is what is left in the sample, which is
            # ADR 0003's round of thirty unless the catalog held fewer.
            "useful": len(sets),
        }


class LabelHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    timeout = 30
    server_version = "photolib-label-harness"
    sys_version = ""

    server: LabelServer

    def log_request(self, code="-", size="-") -> None:
        if isinstance(code, int) and code >= 400:
            self.log_message('"%s" %s', self.requestline, code)

    def _respond(self, status: int, body: bytes = b"", headers: tuple = ()) -> None:
        self.send_response(status)
        for name, value in SECURITY_HEADERS:
            self.send_header(name, value)
        for name, value in headers:
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD" and body:
            self.wfile.write(body)

    def _json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self._respond(status, body, (("Content-Type", "application/json"),))

    def _host_ok(self) -> bool:
        return (self.headers.get("Host") or "").strip().lower() in self.server.allowed_hosts

    def do_GET(self) -> None:
        if not self._host_ok():
            self._json(403, {"error": "host"})
            return
        path = self.path.partition("?")[0]
        substrate = SUBSTRATE_ROUTE.match(path)
        if path in STATIC_ROUTES:
            self._static(path)
        elif path == "/api/sets":
            self._json(200, self.server.payload())
        elif substrate:
            self._frame(substrate.group(1))
        else:
            self._respond(404)

    do_HEAD = do_GET

    def do_POST(self) -> None:
        if not self._host_ok():
            self.close_connection = True
            self._json(403, {"error": "host"})
            return
        if self.path.partition("?")[0] != "/api/answer":
            self.close_connection = True
            self._respond(404)
            return
        self._answer()

    def _static(self, route: str) -> None:
        name, content_type = STATIC_ROUTES[route]
        try:
            body = (STATIC_DIR / name).read_bytes()
        except OSError:
            self._respond(404)
            return
        self._respond(
            200, body, (("Content-Type", content_type), ("Cache-Control", "no-cache"))
        )

    def _frame(self, sha256: str) -> None:
        """One 1536px substrate, by content hash -- the tree the overlay draws from."""
        etag = f'"{sha256}"'
        if self.headers.get("If-None-Match") == etag:
            self._respond(304, b"", (("ETag", etag),))
            return
        try:
            body = substrate_path(self.server.substrate_root, sha256).read_bytes()
        except OSError:
            self._respond(404)
            return
        self._respond(
            200,
            body,
            (
                ("Content-Type", "image/webp"),
                ("Cache-Control", "private, max-age=31536000, immutable"),
                ("ETag", etag),
            ),
        )

    def _answer(self) -> None:
        """Record one judgement. The only write this process makes.

        The body names a stack rather than describing one: it is matched against
        the sample this server is serving, and an answer about anything else is a
        404. So the reader's marks are checked against the frames actually drawn
        -- a member that is not a member, or a neighbour that is not a neighbour,
        cannot be filed.
        """
        payload = self._json_body()
        if payload is None:
            return
        members = payload.get("members")
        if not isinstance(members, list) or not all(isinstance(sha, str) for sha in members):
            self._json(400, {"error": "members"})
            return
        question = next(
            (q for q in self.server.asked if list(q.members) == members), None
        )
        if question is None:
            self._json(404, {"error": "members"})
            return

        # How far the reader had widened the view. Everything else is checked
        # against it, so a frame that was off screen cannot be marked as one the
        # reader saw and judged.
        shown = payload.get("shown", SHOWN)
        if type(shown) is not int or not 1 <= shown <= MOST:
            self._json(400, {"error": "shown"})
            return

        marks = {}
        for field, allowed in (
            ("evicted", set(question.members)),
            ("included", set(question.surrounding(shown))),
        ):
            value = payload.get(field, [])
            if not isinstance(value, list) or not set(value) <= allowed:
                self._json(400, {"error": field})
                return
            marks[field] = value
        unsure = payload.get("unsure", False)
        if not isinstance(unsure, bool):
            self._json(400, {"error": "unsure"})
            return

        self._json(
            200,
            self.server.judge(
                question,
                shown=shown,
                evicted=marks["evicted"],
                included=marks["included"],
                unsure=unsure,
            ),
        )

    def _json_body(self) -> dict | None:
        """A validated JSON object body, or None having already answered.

        `photolib.grid._json_body`'s gauntlet, short: same origin, an explicit
        JSON content type so a cross-origin attempt needs a preflight there is no
        handler for, and a size budget checked before a byte is read.
        """
        origin = self.headers.get("Origin")
        if origin not in self.server.allowed_origins:
            self.close_connection = True
            self._json(403, {"error": "origin"})
            return None
        content_type = (self.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        if content_type != "application/json":
            self.close_connection = True
            self._json(415, {"error": "content-type"})
            return None
        if self.headers.get("Transfer-Encoding"):
            self.close_connection = True
            self._json(400, {"error": "body"})
            return None
        raw_length = self.headers.get("Content-Length")
        if raw_length is None or not raw_length.strip().isdigit():
            self.close_connection = True
            self._json(411, {"error": "body"})
            return None
        length = int(raw_length)
        if length > MAX_ANSWER_BODY:
            self.close_connection = True
            self._json(413, {"error": "body"})
            return None
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            self._json(400, {"error": "body"})
            return None
        if not isinstance(payload, dict):
            self._json(400, {"error": "body"})
            return None
        return payload


# --- running it ---------------------------------------------------------------


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m harness.label", description=__doc__)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--open", action="store_true", help="open a browser once bound")
    parser.add_argument(
        "--sets",
        type=int,
        default=SETS,
        help="how many sets one round samples (default 30, ADR 0003's round)",
    )
    parser.add_argument(
        "--strictness",
        type=int,
        default=STRICTNESS,
        help="the Match threshold the sets are drawn at (default %(default)s, what"
        " round one settled)",
    )
    parser.add_argument(
        "--linkage",
        choices=tuple(LINKAGE),
        default=DEFAULT_LINKAGE,
        help="the rule the stacks are cut with (default %(default)s, what round one"
        " settled)",
    )
    parser.add_argument(
        "--round",
        type=int,
        default=ROUND,
        help="which of ADR 0003's rounds this is (default %(default)s); an answer"
        " carries it, and a set an earlier round settled is not asked again",
    )
    args = parser.parse_args(argv)
    # The round is a number off a command line and it indexes the answers already
    # given, so it is checked at the boundary: a round below the first one would
    # settle nothing and file answers under a round no report looks for.
    if args.round < 1:
        print(f"--round is which round this is, counting from 1, not {args.round}")
        return 1

    config = load()
    labels_db = config.catalog_db.parent / LABELS
    # Opened before the catalog, because what an earlier round already settled is
    # dropped before the sample is taken rather than after it.
    labels = store(labels_db)
    settled = answered_before(labels, args.round)
    conn = candidates.catalog(config.catalog_db, read_only=True)
    try:
        asked = plan(
            conn,
            strictness=args.strictness,
            linkage=args.linkage,
            wanted=args.sets,
            already=settled,
        )
    finally:
        conn.close()
    if not asked:
        labels.close()
        print(
            f"nothing to judge: no candidate stack at strictness {args.strictness} under"
            f" {args.linkage} linkage that an earlier round has not already answered"
            f" ({len(settled)} of those). Run python -m photolib.matches first if the"
            " Match rows are missing."
        )
        return 1

    server = LabelServer(
        ("127.0.0.1", args.port),
        LabelHandler,
        asked,
        labels,
        config.substrate_root,
        round=args.round,
        strictness=args.strictness,
        linkage=args.linkage,
    )
    url = f"http://127.0.0.1:{server.server_address[1]}/"
    cameras = sorted({question.camera or "(unnamed)" for question in asked})
    chained = sum(1 for question in asked if question.chain)
    print(f"labelling harness on {url}  -- disposable, see the module docstring")
    print(f"  round           {args.round} of ADR 0003's two")
    print(
        f"  setting         strictness {args.strictness}, {args.linkage} linkage,"
        f" {matches.METHOD}"
    )
    print(
        f"  sets            {len(asked)} sampled, {chained} of them where a chain"
        " crosses a boundary this rule drew"
    )
    widest = max((max(len(q.before), len(q.after)) for q in asked), default=0)
    print(
        f"  context         {SHOWN} frame each side, widened with k up to the whole "
        f"run -- {widest} at the most here"
    )
    print(f"  cameras         {', '.join(cameras)}")
    # The extremes and not the ends of the list: the sample is ordered by the chain
    # first now, so the first set is no longer the least decisive one.
    margins = [question.margin for question in asked]
    print(f"  margins         {min(margins)} to {max(margins)} points from the line")
    print(f"  already settled {len(settled)} sets, by an earlier round, and not asked again")
    print(f"  labels          {labels_db}")
    print(f"  substrates      {config.substrate_root}")
    print(f"  answers given   {len(answers(labels, args.round))} in this round")
    if args.open:
        import webbrowser

        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
    finally:
        server.server_close()
        labels.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
