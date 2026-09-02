"""The screen where twelve anecdotes become a few hundred judgements.

**This is a standing tool.** It was written as scaffolding for the two rounds
`docs/adr/0003-stack-on-verified-match.md` asks for, and it outlived them: the reader
has since said that the setting those rounds settled is wrong for them, and that the
objective it was scored against is wrong too. What replaces either is not decided
here and is not decided in this module -- ADR 0003 records what the labels settled
and the ticket that recalibrates amends it. What this directory now knows is that
collecting the reader's taste is a recurring need rather than a one-off, so it keeps
a permanent home here. It is still not part of the shipped website -- nothing in
`photolib/` imports it and no route of `photolib.grid` reaches it, the same
one-way arrow `archive/pipeline/` has -- but the arrow is the whole of the
separation, and a later reader should not delete this directory on the reasoning
this docstring used to carry.

It shows one candidate stack at a time **with its neighbours**, which is what
lets a single screen answer both of the reader's complaints at once: *does this
stack hold something that does not belong*, and *is it missing something that
should be here*. Accepting the stack as drawn is one keystroke, because that is
the common case and it should cost almost nothing. Clicking a member says it does
not belong -- and one more keystroke says **why**, which is the reader's own three
reasons and the count four tickets downstream turn on; clicking a neighbour says
it should have been included. **Not sure** is a first-class answer and not a
skip -- the reader has said outright that some of these are grey, and a grey area
recorded as grey is worth more than a forced verdict.

Which sets it shows is the point of it, and it is not the same question twice.
**A round is one sitting, bounded by the reader stopping**, and `--round` says
which one it is:

*Round one* drew at a provisional line, and every set was chosen for how little
the Match committed to it, so the reader's evening landed where it moved the real
threshold most. Its answers settled the line: strictness 20 with *matches most
members*.

*Round two* drew at that settled setting and went looking for the one population
round one could not price -- the runs a chain would walk straight through, ranked
by `Question.chain`. It found neighbour linkage six points under the floor.

*Round three* asks whether the line is in the right place at all, which neither of
the first two samplers could: both drew from wherever the Match was least decisive
**around** the setting, so neither could show the reader a pair the line already
merges without argument, and neither could reach a pair no strictness reaches at
all. So the sets are drawn from **three bands** rather than from one population,
mixed rather than served in blocks. See `SHARES`.

Every round is spread over the cameras, so a threshold calibrated on the body the
operator shoots most does not quietly misbehave on the other four, and **a run an
earlier round has already answered about is not asked about again** -- by run and
not by set, because a stack redrawn a frame wider is the same evening's work seen
from a slightly different angle.

**Nothing is generated before the reader asks for it.** There is no pool and no
round size: the first set arrives on the first request, each one after it is a
query over numbers already in the catalog, and the reader stops after eight or
after two hundred as the time they have decides. See `Sitting`.

Answers go to a `labels.sqlite3` of the harness's own, beside the catalog on the
NVMe. **Never `state.sqlite3`**: that holds irreplaceable triage decisions and has
its own snapshot and restore machinery, and these labels are one experiment's
record rather than the vault's. It is not a migrated database either, for the same
reason -- a table nothing shipped reads has no business in the shipped schema, so
this module creates its own and `*.sqlite3` in `.gitignore` is what keeps it out of
git. The reader's answers are the one thing here that cannot be re-derived from
anything, so when this module changes the shape it writes it carries them forward
rather than asking for the file to be moved aside. See `_carry_over`.

Frames are served from the same 1536px substrate tree the grid's overlay draws
from, so what the reader judges is what the grid will draw. It reads the catalog
and the substrates, both on the NVMe, and never opens `G:`.

    python -m harness.label --open

Stopping it loses nothing: every answer is committed as it is given. **Revising one
is a move back through the sitting in hand** -- every set dealt tonight comes back
with what the reader said about it, and `h` is how they reach it. A new sitting deals
fresh sets rather than yesterday's over again, which is the trade `already` makes in
`main`: dealing forty answered sets before the first new one is the wrong way to
spend an evening, and a misclick is revised in the moment it is made.

**A later round asking the same question again does not overwrite the answer.**
Revising is bounded by the sitting because that is what revising means; being asked
again is a different act, and what the reader said in an earlier round stays exactly
where it is. So a sitting drawn to retest them on what they have already answered
cannot spend itself destroying the evidence it was run to check, and a set answered
two ways becomes a fact a report can read rather than a row that is gone. See
`SCHEMA` for the key that says so and `harness.calibrate.contested` for what is made
of it.
"""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
import threading
from collections.abc import Collection, Iterable, Sequence
from dataclasses import dataclass, field, replace
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from harness import people, same
from photolib import candidates, matches
from photolib.config import load, substrate_path

# The rule itself, which is not the harness's to own: `photolib.membership`
# materialises the assignment and this harness judges it, so the walk both of them
# read has to be one walk and it has to be the shipped one -- what the reader judges
# has to be what the grid draws, or a round measures something adjacent to it.
# `agreement` is there for the same reason one layer down: the evidence a stack rests
# on is the grid's decision too, so a round asks about it through the predicate the
# pass builds rather than through a threshold of its own.
# Imported by name rather than reached through the module so that `label.link` and
# `label.LINKAGE` go on meaning what they have always meant here.
from photolib.membership import (  # noqa: F401 -- re-exported for `harness.calibrate`
    LINKAGE,
    Agree,
    Joins,
    Points,
    agreement,
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
# left it where it stood, and `--strictness` is how a round moves it.
#
# **It is deliberately not `photolib.membership.STRICTNESS` any more.** The two were
# the same number, on the reasoning below that a round draws at the setting the grid
# ships; the grid now ships 10, and this cannot simply follow it, because `LOOSEN`
# and `MERGED` are three bands cut *around* 20 and would be incoherent at any other
# value. Re-pointing the sampler means re-deriving those bands, which is round four's
# business and not this constant's.
STRICTNESS = 20

# The rule the sets are cut with. `complete` is what ADR 0003 argued from and
# `majority` is what its labels chose, so this is a finding and not a preference:
# at strictness 20 "matches most members" beat complete linkage on precision and
# recall at once, because 224 of the pairs the reader kept together carry no Match
# row at all and complete linkage cannot express a burst holding one.
#
# It was the default because a round draws at the setting the grid is shipping. The
# grid ships *the chain* now, and this stays where it is for `STRICTNESS`'s reason:
# the bands are cut around the pair, and moving half of it would draw a round nobody
# can read. `--linkage` is how a round says otherwise.
DEFAULT_LINKAGE = "majority"

# Which round this is. **A round is one sitting bounded by the reader stopping**,
# and not a planned population: rounds one and two were thirty sets each because
# ADR 0003 asked for that, and what the reader wants now is to label as many as
# they like and stop when the evening is over. So this is a number that rides with
# every answer and not a size.
#
# It rides with every answer because a later round's agreement is a *check* on the
# setting an earlier one chose and must never be pooled into the evidence for it --
# `harness.calibrate` is what keeps them apart, and it reads whatever number is in
# the column.
ROUND = 3

# The three populations a round straddles, and the share of the draw each one gets.
#
# Rounds one and two both drew from wherever the Match was least decisive *around*
# the setting in force. That is the right sample for moving a threshold and the
# wrong one for asking whether the threshold is in the right place: it can only
# ever show the reader the pairs the dial is already arguing about.
#
#   loosen (5-19)      Pairs a looser strictness would newly merge. **This is the
#                      band that answers the reader's actual question** -- would
#                      turning the dial down have fixed the complaint -- so it
#                      takes the largest share there is to take.
#   merged (20-40)     Pairs the shipped setting already merges. Without it a round
#                      can only discover *missing* merges and never wrong ones,
#                      which would flatter every loosening: a sampler that never
#                      shows what the dial got right cannot measure what it costs.
#                      So it takes the same share.
#   unreachable (<5)   No Match row at all, or a Match under five. No strictness
#                      reaches these, so they cannot price the dial -- they are
#                      here because if the dial turns out not to be the answer,
#                      this band is the evidence for what would be. A fifth,
#                      because it is insurance rather than the question.
#
# Above 40 is decisive and is not drawn at all: a pair the Match commits to that
# hard is not a question, whichever way the reader would answer it.
#
# The proportions are here rather than in the draw so that a later session can see
# they were chosen. They are shares and not counts, because there is no round size
# to divide up -- see `spread` for the weave that turns them into an order.
LOOSEN = (5, 19)
MERGED = (20, 40)
SHARES = {"loosen": 0.4, "merged": 0.4, "unreachable": 0.2}
BANDS = tuple(SHARES)

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
    # The Match of the pair this drawing turns on -- the least decisive piece of
    # evidence `_weakest` found, whichever side of the line it sits. It is the
    # number `band` reads, so it is what decides which of the three populations
    # this set is drawn as one of: a stack held together by a pair of 22 is a set
    # the shipped setting merges, and one whose nearest neighbour scores 12 is a
    # set a looser dial would newly merge.
    #
    # Zero by default, which reads as unreachable, because that is what a pair
    # with no Match row scores and a set assembled without one has no evidence
    # behind it either.
    deciding: int = 0
    # How many frames of the run single linkage would keep with a member of this
    # stack that this stack does not hold, and zero where the two rules agree
    # about every boundary around it. **This is what round two was for**, and it is
    # what `rank` still orders a band's sets by.
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

    @property
    def band(self) -> str | None:
        """Which of the three populations this set is drawn as one of, or None.

        None where the Match commits to the drawing too hard for the set to be a
        question at all. See `SHARES`.
        """
        return band(self.deciding)

    def run(self) -> set[str]:
        """Every frame of the run this stack sits in, as far as this set carries it.

        Which is the whole run when `context` is None, and that is the default and
        what the reader gets -- so this is the unit an earlier round's answers are
        excluded by. See `unanswered`.
        """
        return (
            set(self.members)
            | {sha for sha, _gap in self.before}
            | {sha for sha, _gap in self.after}
        )

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


def band(points: int) -> str | None:
    """Which population a Match belongs to, or None where it is not a question.

    A pure function over one stored number, which is what makes the banding
    assertable without a database or a photograph. See `SHARES` for why the
    boundaries are where they are; a pair with no Match row arrives here as the
    zero `match` reads it as, and lands in the band no strictness reaches.
    """
    if points < LOOSEN[0]:
        return "unreachable"
    if points <= LOOSEN[1]:
        return "loosen"
    if points <= MERGED[1]:
        return "merged"
    return None


def _weakest(
    members: Sequence[str],
    neighbours: Iterable[str | None],
    points: Points,
    strictness: int,
) -> tuple[int, int]:
    """How far the weakest thing this drawing rests on sits from the line, and its Match.

    Two kinds of evidence and they are the reader's two complaints. A pair
    *inside* the stack barely above the line is a frame that may not belong; a
    neighbour *outside* it barely below is a frame that may be missing. Both are
    a distance from `strictness`, so the least decisive of them is one number.

    A neighbour is judged on its weakest pair against the stack, because complete
    linkage is what it would have had to satisfy. The distance is floored at zero,
    so a neighbour that agrees with every member and was split off anyway -- which
    the forward walk can do -- reads as the coin toss it is rather than as a
    negative.

    The two terms are not on the same scale and cannot be: a Match runs upwards
    without a bound, so a member pair can sit hundreds of points above the line,
    while a neighbour can only be `strictness` below it. That asymmetry is the
    truth about the distances and not a skew, and it is invisible to the ordering
    -- it only ever separates sets that are decisive either way.

    The Match beside the distance is the *deciding* pair's, and it is deliberately
    the least decisive pair's and never the stack's strongest: a burst of forty
    identical frames scoring 300 apiece, held on to one pair of 12, is a set the
    dial is arguing about and would otherwise be drawn as decisive. A tie between
    two equally close pairs takes the lower Match, which is the more conservative
    of the two bands.
    """
    inside = [
        (match(points, early, late), 1)
        for index, early in enumerate(members)
        for late in members[index + 1 :]
    ]
    outside = [
        (min(match(points, neighbour, member) for member in members), -1)
        for neighbour in neighbours
        if neighbour is not None
    ]
    # A member pair counts upwards from the line and a neighbour downwards to it,
    # which is the whole of the sign.
    distance, deciding = min(
        ((sign * (found - strictness), found) for found, sign in inside + outside),
        default=(0, 0),
    )
    return max(distance, 0), deciding


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
    labels chose, so a bare call cuts the runs the way the grid draws them.
    `strictness` is two things and deliberately so: the predicate the cut asks
    through, built here by `agreement` exactly as `photolib.membership.place` builds
    it, and the line `_weakest` measures the margin from -- the second is a distance
    on the Match and stays one, because a band is a report about how decisive the
    Match was and never about how the frames were cut. The run is cut a second time
    by single linkage -- never to draw anything, only to fill in `Question.chain`,
    which is why every member's chain group is looked up and not just the first's.
    """
    asked: list[Question] = []
    agree = agreement(points, strictness)
    for camera, run in runs:
        shas = [sha for sha, _ in run]
        reach = len(shas) if context is None else context
        taken = dict(run)
        stacks = link(shas, agree, joins)
        chained = [set(walked) for walked in link(shas, agree, neighbour)]
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
            margin, deciding = _weakest(
                stack, question.nearest(), points, strictness
            )
            asked.append(replace(question, margin=margin, deciding=deciding))
    return asked


def rank(question: Question) -> tuple:
    """What makes a set worth the reader's time **within its band**, most first.

    **The chain leads and the margin breaks its ties**, which was round two's whole
    change to the sample. Round one ranked on the margin alone and that was right
    for the question it asked; it could not ask round two's, because the margin is a
    distance from the line and a chaining rule's failure is not -- a run single
    linkage walks straight through can sit hundreds of points clear of the line at
    every boundary it crosses.

    The margin also flattens under the rule the labels chose. `_weakest` floors it
    at zero, and a stack drawn by "matches most members" may hold a pair the Match
    rejected outright -- which is the whole point of the softening -- so a great
    many stacks sit at zero and a ranking on the margin alone would order them by
    their shas. Leading on the chain puts a reason back in front of it.

    **The band is deliberately not a term here.** A ranking that led on the band
    would sort the whole population into blocks and serve them that way, which is
    the one thing round three's sample must not do: an hour of nothing but
    unreachable pairs is an hour the reader spends before seeing the question the
    round is actually about, and a round abandoned halfway through would be a round
    of one band. So the band is the outer weave in `spread` and this is the order
    inside one.

    Ties break on the members last, so the order is total and deterministic:
    answers are keyed on the frames, and a reader who stops and comes back has to
    be shown the same sets in the same order for the counter to mean anything.
    """
    return (-question.chain, question.margin, question.members)


def unanswered(asked: Sequence[Question], already: Collection[str]) -> list[Question]:
    """The sets whose run holds none of `already` -- what no round has judged yet.

    **By run and not by set.** Keying on the stack as drawn was right while the
    rounds differed only in which rule cut them, and it is wrong now: a round that
    draws from a different band redraws the same run with a boundary a frame or two
    over, so a set key would let a new round re-ask about an evening the reader has
    already spent. What they said about that run was about those photographs, and
    asking again from a slightly different angle buys nothing.

    `already` is frames, then, and `answered_before` is where they come from. A run
    is dropped whole the moment any answer has touched any frame in it.
    """
    judged = set(already)
    return [question for question in asked if judged.isdisjoint(question.run())]


def spread(
    asked: Sequence[Question], wanted: int = 1, *, drawn: Sequence[Question] = ()
) -> list[Question]:
    """The sets worth asking about: bands woven together, each taken a camera at a time.

    Two interleavings over one ranked population, and `rank` decides what worth
    means inside each cell of it.

    **The bands are the outer weave**, in `SHARES`' proportions, so a round straddles
    the dial rather than sitting on it and the reader does not spend their first hour
    on one kind of question. The band whose turn it is, is the one whose next set is
    cheapest against its share -- which lands a draw of ten on four, four and two
    without any of them needing to know that ten was coming. That matters here more
    than it would elsewhere: there is no round size, so a rule that divided a total
    up would have nothing to divide.

    **The cameras are the inner one.** The operator shoots one body far more than the
    other four, so a straight ranking would hand back an evening of that body alone
    and calibrate a number that quietly misbehaves everywhere else. Within a band the
    turn goes to the camera that has given the fewest sets so far.

    `drawn` is what this sitting has already been dealt, so a draw of one continues
    the weave rather than restarting it at the top -- which would hand the same band
    and the same camera back on every request. Both counters read it, and it is the
    only state the weave has.

    Deterministic throughout: `rank` is a total order, and both ties -- between two
    bands equally owed and two cameras equally quiet -- break on the order the ranked
    list put them in, which is what a dict remembers about the keys it was given.
    """
    queues: dict[str | None, dict[str | None, list[Question]]] = {}
    for question in sorted(asked, key=rank):
        # A set above the top of the bands is not a question. See `SHARES`.
        if question.band is not None:
            queues.setdefault(question.band, {}).setdefault(question.camera, []).append(
                question
            )

    picked: list[Question] = []
    dealt = list(drawn)
    while len(picked) < wanted and queues:
        taken = [question.band for question in dealt]
        band = min(
            queues,
            key=lambda name: ((taken.count(name) + 1) / SHARES[name], BANDS.index(name)),
        )
        cameras = queues[band]
        quiet = [question.camera for question in dealt if question.band == band]
        camera = min(cameras, key=lambda name: (quiet.count(name), list(cameras).index(name)))

        picked.append(cameras[camera].pop(0))
        dealt.append(picked[-1])
        if not cameras[camera]:
            del cameras[camera]
        if not cameras:
            del queues[band]
    return picked


# How many frames of a run go into one indexed lookup. The runs this fence admits
# reach 1,435 frames and SQLite bounds how many parameters a statement may carry, so
# the query is chunked -- a real limit at a real boundary, and not a precaution.
BATCH = 500

# How many runs one draw will cut before answering with the sets it has. It is the
# bound that keeps a request short: without it, the first draw that wants a band the
# catalog barely holds would search every remaining run before answering.
#
# 60 because a populated band needs nothing like it and the worst case is still
# quick. Measured over this catalog: the first draw found all three bands in the first
# run it cut, twelve draws cut nineteen runs between them, and the one draw that had
# to cut fifteen of those took 0.058s -- so 60 is about a fifth of a second at the
# outside, against 1,223 runs unbounded. A band the search has not reached by then is
# not declared empty; `Sitting.draw` says what happens instead.
SEARCH = 60


def _walk_order(runs: Sequence[Run]) -> list[Run]:
    """Every run, in the order a sitting searches them for sets to ask about.

    A camera at a time in turn, so that the first few runs searched already hold
    more than one body: the sets are drawn on demand, and a walk that took the
    cameras in the order the population lists them would hand back an evening of
    the body the operator shoots most before it reached the others at all.

    Within one camera the order is the *shas'* and not the clock's, for the same
    reason one step further in: the runs of a camera in capture order are its
    earliest months first, and a sitting that stopped after thirty sets would have
    labelled one season. A sha is decided by the bytes, so the order is arbitrary
    about time and identical on every run of this harness -- which is what a reader
    who stops and comes back needs it to be.
    """
    queues: dict[str | None, list[Run]] = {}
    for run in sorted(runs, key=lambda run: run[1][0][0]):
        queues.setdefault(run[0], []).append(run)
    order: list[Run] = []
    while any(queues.values()):
        for queue in queues.values():
            if queue:
                order.append(queue.pop(0))
    return order


@dataclass
class Sitting:
    """The catalog's own shape, read once, and the sets drawn out of it one at a time.

    **There is no pool and no plan.** The reader asks for a set and gets one; asking
    again cuts as much of the catalog as answering that request needs and no more.
    That is what makes a round a sitting rather than a population: nothing has to
    decide up front how many sets the evening will hold, so eight is a round and two
    hundred is a round.

    What is read once is the catalog's *structure* -- which tiles there are, how the
    fence cuts them into runs, and what sits just past each end of a run. That is one
    query over the population `photolib.candidates` enumerates, so what this asks
    about is what that pass considered: the same cut, and a pair it never called a
    candidate is a pair with no Match here.

    What is read per draw is one run's Match rows, on the primary key of
    `pair_match`, for as many runs as the band whose turn it is takes to find --
    `SEARCH` of them at the outside. The 3.6M-row table is never loaded whole, which
    is the difference between a draw the reader waits for and one they do not.

    **This is cutting runs inside a request, and hard rule 4 is about media work.**
    The rule names ranking and grouping among the things that belong in a background
    process, and the reason it does is the failure `archive/v1-docs/invariants.md`
    records: a *website* handler that decoded, hashed or regrouped the library made
    the page hang and took the database's write lock with it. None of that is here. A
    draw opens no photograph, hashes nothing, copies nothing and never touches `G:`;
    it reads integers off an index, over a read-only connection, with `state.sqlite3`
    not even attached, and it is bounded -- measured at 13ms for the first set and
    under a millisecond after it. The escape the rule offers, "enqueue a job", has
    nothing to offer a single reader at a keyboard whose next set *is* the answer to
    the keystroke they just pressed: a job would be a queue with one item in it and a
    page waiting on it. So the draw stays in the request, and it stays small.

    `already` is the frames every earlier answer was about, and it is dropped before
    anything is banded -- so a run the reader has judged is never searched twice. It
    comes from the labels database, which this class is deliberately not given: the
    catalog is the only thing it opens.
    """

    conn: sqlite3.Connection
    order: list[Run]  # every run, in `_walk_order`'s order
    ends: dict[str, tuple[Near | None, Near | None]]  # by a run's first frame
    already: Collection[str]
    # The setting the sets are drawn at and the method they are read under. Required
    # rather than defaulted, because `sitting` states those defaults and two
    # statements of one default are one drift away from disagreeing.
    strictness: int
    linkage: str
    method: str
    version: str
    context: int | None
    at: int = 0  # how far through `order` the search has got
    # The sets cut so far and not yet dealt, and the ones dealt. Both grow with the
    # sitting and neither is generated ahead of it.
    pool: list[Question] = field(default_factory=list)
    drawn: list[Question] = field(default_factory=list)
    # The bands the runs have been searched through for, and which held nothing. A
    # band is reported dry once, to the console and never to the page: which band a
    # set came from is exactly the thing that would prime the reader, for round two's
    # reason -- being told a set is one no strictness reaches is being told what to
    # say about it.
    dry: set[str] = field(default_factory=set)

    def draw(self) -> Question | None:
        """One set to judge, or None when the catalog has no question left.

        Every band that still has something to give is searched for before the weave
        chooses between them, because otherwise the choice would be made over
        whichever bands the search happened to reach first and `SHARES` would
        describe the walk rather than the round.

        Searched for, but only `SEARCH` runs' worth per draw: **no single request
        pays for the whole catalog.** A band the search has not reached yet is left
        to the next draw rather than declared empty -- the cursor keeps its place, so
        the work is spread across draws instead of repeated -- and the weave answers
        from what is cut. That makes the shares approximate while a band is rare and
        exact once it is found, which is the right way round: the reader waiting is
        worse than a proportion arriving late.
        """
        searched = 0
        while (short := self._short()) and searched < SEARCH:
            if not self._search():
                # The runs are done, so a band with nothing cut has nothing at all.
                # Said once, because `dry` empties `_short` for good.
                for name in sorted(short):
                    self.dry.add(name)
                    print(f"the {name} band is exhausted -- drawing from the others")
                break
            searched += 1
        picked = spread(self.pool, 1, drawn=self.drawn)
        if not picked:
            return None
        self.pool.remove(picked[0])
        self.drawn.append(picked[0])
        return picked[0]

    def _short(self) -> set[str]:
        """The bands with nothing cut yet that the runs might still be holding."""
        held = {question.band for question in self.pool}
        return {name for name in BANDS if name not in held and name not in self.dry}

    def _search(self) -> bool:
        """Cut the next run into sets. False when there is no run left to cut."""
        if self.at >= len(self.order):
            return False
        camera, run = self.order[self.at]
        self.at += 1
        outside = self.ends[run[0][0]]
        asked = questions(
            [(camera, run)],
            self._points([sha256 for sha256, _secs in run]),
            self.strictness,
            self.context,
            LINKAGE[self.linkage],
        )
        self.pool.extend(
            replace(question, outside=outside)
            for question in unanswered(asked, self.already)
        )
        return True

    def _points(self, shas: Sequence[str]) -> Points:
        """One run's Match rows, off the primary key of `pair_match`.

        Every pair the enumeration made sits inside a run, so the pairs whose earlier
        frame is one of these frames are exactly this run's -- `candidate_pair` does
        not have to be read to know which they are, and a pair with no row here is a
        pair with no evidence, as `match` reads it.
        """
        found: Points = {}
        for start in range(0, len(shas), BATCH):
            batch = shas[start : start + BATCH]
            found.update(
                {
                    (early, late): count
                    for early, late, count in self.conn.execute(
                        "SELECT sha_early, sha_late, points FROM pair_match"
                        " WHERE method = ? AND version = ? AND sha_early IN"
                        f" ({', '.join('?' * len(batch))})",
                        (self.method, self.version, *batch),
                    )
                }
            )
        return found


def read_only(catalog_db: Path) -> sqlite3.Connection:
    """The catalog, read-only, and usable from the server's request threads.

    `photolib.candidates.catalog(read_only=True)` spelled out rather than called, for
    one flag it has no reason to carry: a draw happens inside a request thread now,
    because the reader asking for a set is what reads the catalog. `check_same_thread`
    is off for `store`'s reason -- there is one reader at one keyboard and every draw
    goes through `LabelServer`'s lock, which is what the lock is for.

    Everything else about it is that function's, deliberately: the state database has
    no name here, so "an experiment cannot reach the triage decisions" stays a fact
    about the code, and `timeout=0` makes a writer holding the catalog a refusal
    rather than a wait.
    """
    return sqlite3.connect(
        f"{catalog_db.as_uri()}?mode=ro", uri=True, timeout=0, check_same_thread=False
    )


def sitting(
    conn: sqlite3.Connection,
    *,
    strictness: int = STRICTNESS,
    linkage: str = DEFAULT_LINKAGE,
    already: Collection[str] = frozenset(),
    ceiling: int = candidates.CEILING,
    method: str = matches.METHOD,
    version: str = matches.VERSION,
    context: int | None = CONTEXT,
) -> Sitting:
    """A sitting over one catalog: its runs, and where each one ends."""
    frames = candidates.population(conn)
    camera_of = {sha256: camera for camera, _secs, _kind, sha256 in frames}
    taken = {sha256: secs for _camera, secs, _kind, sha256 in frames}
    runs = [
        (camera_of[run[0]], [(sha256, taken[sha256]) for sha256 in run])
        for run in candidates.runs(frames, ceiling)
    ]

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
    return Sitting(
        conn,
        _walk_order(runs),
        ends,
        already,
        strictness=strictness,
        linkage=linkage,
        method=method,
        version=version,
        context=context,
    )


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

    Half of what it is filed under: the round is the other half, and `SCHEMA` is
    where that decision is written down.
    """
    return ",".join(members)


# The three reasons a frame can be wrong in a stack, in the reader's own words:
# **different people**, **a different moment**, and **just not close enough**. They
# are three because the reader named three, and because one keystroke each is the
# most a reason can cost before recording it starts competing with labelling at all.
#
# The first of them is why the column exists: the reader's instinct is that people
# are the problem, four tickets downstream turn on whether that is true, and nothing
# in this table could tell "the wrong people are in it" from "this is a different
# photograph" until now. So the size of the people problem was unknowable, and it
# becomes a count.
#
# Nothing reads this yet. `harness.calibrate` ignores it on purpose -- a reason is
# not evidence about a threshold -- and the ticket that prices the people rule is
# what reads it.
REASONS = ("people", "moment", "close")

# Not a migration. A table nothing shipped reads has no business in the shipped
# schema, so this is created by the harness that owns it.
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
# **`round` says which round asked**, and it is the column `harness.calibrate`
# splits on: the earliest round's answers are the evidence a setting is chosen from
# and every later round's are a check on it, so pooling them would let the check vote
# for the thing it is checking.
#
# **It is half the primary key, so a re-ask cannot destroy the answer it checks.**
# The key was the members alone and `_RECORD` is an upsert, so a second answer about
# one set overwrote the first -- and the only thing standing between the reader and
# that was `answered_before`, which is a *sampling* rule and not a constraint. A
# sitting drawn to retest a hundred existing answers would have spent itself
# destroying the very evidence it was run to check.
#
# **The round and nothing finer**, which is a decision about what "again" means. A
# timestamp or an asking-id would let one sitting hold two answers about one set --
# and a sitting already does that, every time the reader presses `h`, goes back and
# fixes a misclick. Under a finer key that correction is a second row, and a slip of
# the finger reads afterwards as the reader contradicting themselves. So a revision
# inside the round replaces, a round is the unit of being asked again, and the
# carry-over costs nothing beyond re-keying: the column is already here and every
# answer already carries it. See `_rekeyed`.
#
# **`reasons` says why each evicted frame does not belong**, as a JSON object keyed
# by sha256 -- per frame and never per set, because a stack split for two different
# reasons is a fact about which frames, and a reason recorded against the set would
# throw that away. `evicted` keeps its own shape beside it, a plain array, so every
# answer rounds one and two wrote reads exactly as it always did.
#
# It is **nullable, and that is the point**: NULL is *reasons unknown*, which is
# every answer given before the column existed, and it is not the same fact as an
# empty object -- which is a reader who was asked and pressed nothing. A count of
# the people problem that read the first as the second would be counting silence as
# a denial.
#
# Both are last, and `round` is defaulted, because a database written before them
# gains them by `ALTER TABLE` -- which can only append -- and the migrated shape and
# the fresh one should be the same shape. `round`'s default is 1 for the same reason
# the column exists: every answer that predates it is round one's, since round one
# is all that had run. See `_carry_over`.
SCHEMA = f"""
CREATE TABLE IF NOT EXISTS answer (
  members     TEXT NOT NULL,     -- the stack as drawn, comma-joined. See `key`.
  camera      TEXT,
  surrounding TEXT NOT NULL,     -- JSON: the frames outside it the reader saw
  margin      INTEGER NOT NULL,
  verdict     TEXT NOT NULL CHECK (verdict IN ({', '.join(f"'{v}'" for v in VERDICTS)})),
  evicted     TEXT NOT NULL,     -- JSON: members the reader said do not belong
  included    TEXT NOT NULL,     -- JSON: neighbours the reader said should be in
  answered_at TEXT NOT NULL DEFAULT (datetime('now')),
  round       INTEGER NOT NULL DEFAULT 1,
  reasons     TEXT,              -- JSON: sha256 -> one of `REASONS`, or NULL
  PRIMARY KEY (members, round)
)
"""

# The key as it stood before a set could be answered twice, and what it is now.
# `_carry_over` compares the table's own key against `KEY` rather than looking for a
# column, because this widening adds none: the discriminator was already there and
# the file that needs rebuilding is the one that is not keyed on it.
KEY = ("members", "round")

_ROUND_COLUMN = "ALTER TABLE answer ADD COLUMN round INTEGER NOT NULL DEFAULT 1"

_REASONS_COLUMN = "ALTER TABLE answer ADD COLUMN reasons TEXT"

_RECORD = """
INSERT OR REPLACE INTO answer
  (members, camera, surrounding, margin, verdict, evicted, included, round, reasons)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
"""


_CARRY = """
INSERT INTO answer
  (members, camera, surrounding, margin, verdict, evicted, included, answered_at, round)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
"""

_REKEY = """
INSERT INTO answer
  (members, camera, surrounding, margin, verdict, evicted, included, answered_at,
   round, reasons)
SELECT members, camera, surrounding, margin, verdict, evicted, included, answered_at,
       round, reasons
FROM answer_before_the_re_ask
"""


def _keyed_on(conn: sqlite3.Connection) -> tuple[str, ...]:
    """The primary key of the answer table as it stands, in its own order.

    `PRAGMA table_info` numbers a key's columns from 1 in key order and gives every
    other column 0, so this is the stored key read back rather than inferred.
    """
    return tuple(
        name
        for _, name, _, _, _, position in sorted(
            conn.execute("PRAGMA table_info(answer)"), key=lambda row: row[5]
        )
        if position
    )


def _rekeyed(conn: sqlite3.Connection) -> str:
    """Re-key a table that could hold only one answer per set, keeping every row.

    Ticket 90's widening, and it is `people.ensure`'s move rather than a migration:
    SQLite cannot alter a primary key, so the table is renamed aside, created in the
    current shape and copied across whole. Nothing is stamped and nothing is
    defaulted -- every column the rows need already exists and the round they were
    given in is the round they keep.
    """
    conn.execute("BEGIN")
    conn.execute("ALTER TABLE answer RENAME TO answer_before_the_re_ask")
    conn.execute(SCHEMA)
    (older,) = conn.execute("SELECT count(*) FROM answer_before_the_re_ask").fetchone()
    conn.execute(_REKEY)
    conn.execute("DROP TABLE answer_before_the_re_ask")
    conn.execute("COMMIT")
    return (
        f"carried {older} answer(s) forward onto a key that keeps a re-ask beside the"
        " answer it is checking"
    )


def _carry_over(conn: sqlite3.Connection) -> str | None:
    """Bring answers written under an older shape of this table into the current one.

    Not a migration framework and not the start of one -- this converts the shapes
    this harness itself wrote, and it is **exact** every time. The oldest table
    stored `before_sha` and `after_sha`, which is precisely what was on screen when
    the view was one frame either side. The next stored no round, and every answer in
    it is round one's, because round one is all that had run when it was written. The
    next stored no reasons, and every answer in it has reasons *unknown* rather than
    absent, which is what a NULL column says on its own -- so the sixty answers
    rounds one and two hold are still evidence and are still not a denial that people
    are the problem. The last is keyed on the members alone and could hold one answer
    per set, and its rows carry across untouched: what widened is what the table can
    say next, not what it already says. See `_rekeyed`.

    More than one of those can be owed at once -- a file from before rounds existed
    is also a file keyed on the members alone -- so what comes back is every message
    the open earned, joined.

    The alternative was refusing and asking the reader to move the file aside,
    which is what this did first. That is the wrong trade: their answers are the
    one thing here that is not re-derivable, and making them handle a file to
    keep them is a cost with nothing on the other side of it.
    """
    columns = {row[1] for row in conn.execute("PRAGMA table_info(answer)")}
    if not columns:
        return None
    if "surrounding" in columns:
        # The current shape but for the columns appended to it since, each of which
        # every answer already in the table answers by existing: round one is all
        # that had run, and nothing asked why.
        gained = []
        if "round" not in columns:
            conn.execute(_ROUND_COLUMN)
            gained.append("round one")
        if "reasons" not in columns:
            conn.execute(_REASONS_COLUMN)
            gained.append("reasons unknown")
        carried = []
        if gained:
            (stamped,) = conn.execute("SELECT count(*) FROM answer").fetchone()
            carried.append(f"carried {stamped} answer(s) forward as {' and '.join(gained)}")
        # Last, because it is the shape the appended columns are part of: a table
        # that has just gained `round` is keyed on the members alone and is exactly
        # the file this rebuilds.
        if _keyed_on(conn) != KEY:
            carried.append(_rekeyed(conn))
        return "; ".join(carried) or None

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

    **Every mode's table**, because there is one labels file: the stack answers
    here, the person verdicts `harness.people` owns and the pair verdicts
    `harness.same` owns, created through this so the harness has one open and one
    thing to keep. The person table has a widening of its own -- ticket 78 put the
    cut in its key -- and it carries its rows forward the way `_carry_over` does, so
    both messages are printed from here. The pair table has never had another shape
    and so has nothing to say.
    """
    conn = sqlite3.connect(path, isolation_level=None, check_same_thread=False)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute(SCHEMA)
    same.ensure(conn)
    for carried in (people.ensure(conn), _carry_over(conn)):
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
    reasons: dict[str, str] | None = None,
) -> str:
    """File one answer, replacing whatever the reader said about it **this round**.

    Which is the whole of what the upsert may replace, and ticket 90 is why: a
    revision inside the sitting is the reader fixing a misclick and must overwrite,
    and an answer given in a later round is the reader being asked again and must
    not. The primary key is what tells the two apart -- see `SCHEMA`.

    The question rather than five of its fields, because reading the labels
    afterwards means asking how the verdicts fell across the grey band and across
    the bodies -- so what was asked is stored beside what was answered, and there
    is one place that decides which parts of it that is. `shown` is how far the
    reader had widened the view, and it is stored as the frames themselves: see
    `SCHEMA` for why that is the column ticket 34 turns on.

    `round` is the round in hand and is not defaulted, because an answer that did
    not say which round asked it cannot be told from the evidence it is meant to
    be checking.

    `reasons` is why each evicted frame does not belong, keyed by the frame. It
    defaults to None -- *unknown* -- rather than to an empty object, because that is
    what a caller that cannot collect them is saying, and the two are different
    facts. See `SCHEMA`.
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
            None if reasons is None else json.dumps(reasons),
        ),
    )
    return given


def answers(conn: sqlite3.Connection, round: int | None = None) -> dict[tuple[str, int], dict]:
    """Every answer given, by the stack it was about **and the round that asked**.

    The mapping's key is the table's key, which is what keeps a re-ask from
    destroying the answer it is checking on the way out of the database as well as
    on the way in: a caller that indexed by the members alone would put two rounds'
    answers about one set back into one slot. See `SCHEMA`.

    `round` narrows it to one round, which is what the counter the reader is shown
    is about: how much of *this* sitting they have judged, and not how many evenings
    they have spent here. Narrowed, the members are unique again -- one round holds
    one answer per set -- but the key does not change shape with the argument.

    `reasons` comes back None where the column is NULL, which says the answer was
    given before there was anything to press -- and never `{}`, which says the reader
    was asked and pressed nothing.
    """
    return {
        (row[0], row[6]): {
            "members": row[0].split(","),
            "camera": row[1],
            "verdict": row[2],
            "evicted": json.loads(row[3]),
            "included": json.loads(row[4]),
            "surrounding": json.loads(row[5]),
            "round": row[6],
            "reasons": None if row[7] is None else json.loads(row[7]),
        }
        for row in conn.execute(
            "SELECT members, camera, verdict, evicted, included, surrounding, round,"
            " reasons FROM answer WHERE ?1 IS NULL OR round = ?1",
            (round,),
        )
    }


def answered_before(conn: sqlite3.Connection, round: int) -> set[str]:
    """Every frame an earlier round's answers were about.

    **Frames and not set keys**, because what is not asked about again is the *run*
    and not the stack as it happened to be drawn -- see `unanswered`. The members of
    an answered set are enough to name its run: a run is dropped whole the moment any
    frame of it turns up here, and every member sits in the run the set was cut from.

    Earlier and not merely other, which is the difference between not asking a
    question twice and not letting the reader revise the answer they just gave.
    """
    return {
        sha256
        for row in conn.execute("SELECT members FROM answer WHERE round < ?", (round,))
        for sha256 in row[0].split(",")
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

# How many of a person's faces the montage draws before the reader asks for more.
# Enough to recognise somebody by rather than all of them: the largest cluster here
# holds 120 faces and a wall of 120 frames is not a montage, it is the library. The
# most prominent come first -- see `people.order` -- and `k` widens it with no
# ceiling, `harness.label`'s own answer to every ceiling it has picked being hit.
MONTAGE = 12

# Copied from `photolib.grid` rather than imported from it, because the arrow this
# package keeps points one way and a shared constant is a shared name: the shipped
# server must not hold anything this directory reaches for. The copy is small and is
# checked against the original whenever either moves.
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
        drawing: Sitting,
        labels,
        substrate_root,
        *,
        round: int = ROUND,
        strictness: int = STRICTNESS,
        linkage: str = DEFAULT_LINKAGE,
        persons: Sequence[people.Person] = (),
        pairs: Sequence[same.Pair] = (),
        clustering: people.Clustering | None = None,
        carried: Collection[str] = (),
    ):
        self.drawing = drawing
        # The sets this sitting has been dealt, which is the sampler's own list and
        # not a copy of it: a set is dealt by being drawn, and going back to revise
        # one is going back through this. Nothing ahead of it exists.
        self.dealt = drawing.drawn
        # Whether the catalog has been asked for a set and had none left. Held rather
        # than re-derived, because finding out costs a search of the runs.
        self.spent = False
        self.labels = labels
        self.substrate_root = substrate_root
        # The round in hand and the setting it is drawn at. Held here rather than
        # read off the module, so what the page says is what this run is doing:
        # `--strictness` used to move the sample without moving the number printed
        # beside it.
        self.round = round
        self.strictness = strictness
        self.linkage = linkage
        # The other mode. The persons worth asking about, ranked once at startup
        # and held, because the ranking is global -- how much a verdict changes is
        # counted across every stack -- so there is no set of it to draw lazily the
        # way a stack question is drawn. `clustering` is which population they are,
        # and it is what a verdict is filed under.
        self.persons = tuple(persons)
        self.clustering = clustering or people.Clustering()
        # The persons the cut did not change, which is what makes an answer given
        # about the uncut population an answer about these faces as well -- ticket
        # 78. A fact about the catalog and fixed for the life of the server, so it
        # is read once beside the ranking rather than on every request.
        self.carried = frozenset(carried)
        self.asked = {one.person: one for one in self.persons}
        # The third mode. Ranked once at startup beside the persons and for the same
        # reason: how many stacks a merge would change is counted across every stack,
        # so there is no part of that queue that could be computed later.
        self.pairs = tuple(pairs)
        self.paired = {pair.key: pair for pair in self.pairs}
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

    def deal(self) -> dict:
        """Draw one more set, and hand back the sitting with it on the end.

        Under the same lock as a write, because the draw reads the catalog and
        appends to the list every other request reads.
        """
        with self._lock:
            return self._deal()

    def payload(self) -> dict:
        """The sitting, dealing its first set if it has none.

        So opening the page is the first request and there is nothing behind it to
        wait for -- see `Sitting`, which is where "nothing before it is asked for"
        is arranged.
        """
        with self._lock:
            return self._deal() if not self.dealt else self._payload()

    def _deal(self) -> dict:
        if self.drawing.draw() is None:
            self.spent = True
        return self._payload()

    # --- the people mode ------------------------------------------------------

    def whom(self) -> dict:
        """The persons worth asking about, with what the reader has said so far."""
        with self._lock:
            return self._people()

    def decide(self, person: str, verdict: str) -> dict:
        """Record one verdict about one person and hand back the list it changed.

        One lock over the write and the read that follows it, `judge`'s reason: the
        counter the reader is shown is the count as of their own press.
        """
        with self._lock:
            people.record(self.labels, person, verdict, clustering=self.clustering)
            return self._people()

    def _people(self) -> dict:
        """Every person worth asking about, all at once.

        All of it rather than one at a time, which is the opposite of how a stack
        question is dealt and is right for the opposite reason. A stack question is
        drawn from the catalog and there is no next one until the reader asks; the
        person list is a ranking over the whole population and computing it at all
        means computing the end of it, so holding it back would buy nothing and
        would make going back to revise a request.

        The shares ride along because they are the only stored fact about where a
        face was -- `migrations/012_people.sql` keeps no box -- so they are what a
        caption can say, and the reader's check that the face being judged is the
        one they think it is.
        """
        given = people.verdicts(self.labels, self.clustering, carried=self.carried)
        # What the reader said about the uncut cluster of the same name, for the
        # persons the cut changed. Not an answer -- `given` already holds the ones
        # that are -- so it rides beside the verdict and never in it, and the page
        # says which it is showing.
        prior = people.priors(self.labels, self.clustering)
        judged, left = people.progress(self.persons, given)
        return {
            "persons": [
                {
                    "person": one.person,
                    "splits": one.splits,
                    "faces": [
                        {"sha": face.sha256, "idx": face.idx, "share": face.share}
                        for face in one.faces
                    ],
                    "answer": given.get(one.person),
                    "prior": None if one.person in given else prior.get(one.person),
                }
                for one in self.persons
            ],
            "montage": MONTAGE,
            "judged": judged,
            "left": left,
            "threshold": self.clustering.threshold,
            # And the cut, for the same reason: it is the other half of what a
            # verdict is filed under, and it is what a `prior` beside an unjudged
            # person is the far side of.
            "cut": self.clustering.cut,
            # What the splits were counted over, so the page can say which grid a
            # verdict is being priced against rather than implying every grid.
            "strictness": people.STACK_SETTING["strictness"],
            "linkage": people.STACK_SETTING["linkage"],
        }

    # --- the same-person mode -------------------------------------------------

    def which(self) -> dict:
        """The pairs worth asking about, with what the reader has said so far."""
        with self._lock:
            return self._pairs()

    def agree(self, one: str, other: str, verdict: str) -> dict:
        """Record one verdict about one pair and hand back the list it changed.

        One lock over the write and the read that follows it, `judge`'s reason: the
        counter the reader is shown is the count as of their own press.
        """
        with self._lock:
            same.record(self.labels, one, other, verdict, clustering=self.clustering)
            return self._pairs()

    def _pairs(self) -> dict:
        """Every pair worth asking about, all at once -- `_people`'s arrangement.

        Two montages per pair, and each side drawn from its own faces: two persons in
        one frame have two different faces in it, so a montage assembled from the
        frames alone would draw the reader somebody else.
        """
        given = same.verdicts(self.labels, self.clustering, carried=self.carried)
        judged, left = same.progress(self.pairs, given)
        return {
            "pairs": [
                {
                    "persons": list(pair.key),
                    "stacks": pair.stacks,
                    "faces": [
                        [
                            {"sha": face.sha256, "idx": face.idx, "share": face.share}
                            for face in side
                        ]
                        for side in pair.faces
                    ],
                    "answer": given.get(pair.key),
                }
                for pair in self.pairs
            ],
            "montage": MONTAGE,
            "judged": judged,
            "left": left,
            "threshold": self.clustering.threshold,
            "cut": self.clustering.cut,
            # What the queue was counted over, so the page can say which grid these
            # pairs were drawn against. The *verdict* is not about that grid -- two
            # clusters are one human or they are not -- and `harness.same` is where
            # that distinction is written down.
            "strictness": people.STACK_SETTING["strictness"],
            "linkage": people.STACK_SETTING["linkage"],
        }

    def _payload(self) -> dict:
        """Everything this sitting has been dealt, with what the reader said about it.

        All of it at once rather than the set in hand: going back to revise an answer
        is then a local move, and the sets are shas -- a long evening of them is a few
        tens of kilobytes.

        The answers are this round's, so the counter counts the round in hand rather
        than every evening the reader has spent here. An earlier round's are not
        drawable anyway: `unanswered` drops their runs before anything is banded.
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
                "answer": given.get((key(question.members), self.round)),
            }
            # Which band each set came from is deliberately not here. It is the one
            # thing that would prime the reader -- being told a set is one no
            # strictness reaches is being told what to say about it -- and round two
            # withheld which sets were its chain cases for the same reason.
            for question in self.dealt
        ]
        return {
            "sets": sets,
            "shown": SHOWN,
            "round": self.round,
            "strictness": self.strictness,
            "linkage": self.linkage,
            # How many answers the reader has given this round -- every answer in it
            # and not only tonight's, because the round is the population a report
            # scores and "roughly where am I" is a question about that. It is the
            # whole of the counter now: there is no round size, so there is no number
            # of sets left to be useful.
            "given": len(given),
            # Whether asking for another set is worth doing. False only once the
            # catalog has actually been asked and had nothing left.
            "more": not self.spent,
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
        elif path == "/api/persons":
            self._json(200, self.server.whom())
        elif path == "/api/pairs":
            self._json(200, self.server.which())
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
        path = self.path.partition("?")[0]
        if path == "/api/next":
            # A POST although it asks for something, because it moves the sitting on:
            # the set it draws is dealt, and the same origin gauntlet an answer goes
            # through is what should stand in front of that.
            if self._json_body() is None:
                return
            self._json(200, self.server.deal())
        elif path == "/api/answer":
            self._answer()
        elif path == "/api/person":
            self._verdict()
        elif path == "/api/pair":
            self._agreed()
        else:
            self.close_connection = True
            self._respond(404)

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
            (q for q in self.server.dealt if list(q.members) == members), None
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

        # Why each evicted frame does not belong, and only ever about a frame the
        # reader actually pushed out: a reason against a frame that is still in the
        # stack is not a fact about anything. Absent is *unknown* and an empty object
        # is *asked and nothing pressed*, so the difference survives the boundary --
        # a client that does not collect reasons stays as readable as rounds one and
        # two are.
        reasons = payload.get("reasons")
        if reasons is not None and (
            not isinstance(reasons, dict)
            or set(reasons) - set(marks["evicted"])
            or set(reasons.values()) - set(REASONS)
        ):
            self._json(400, {"error": "reasons"})
            return

        self._json(
            200,
            self.server.judge(
                question,
                shown=shown,
                evicted=marks["evicted"],
                included=marks["included"],
                unsure=unsure,
                reasons=reasons,
            ),
        )

    def _verdict(self) -> None:
        """Record one judgement about one person. The people mode's only write.

        The body names a person rather than describing one, `_answer`'s discipline:
        it is matched against the list this server is serving, so a verdict about
        somebody who is not being asked about -- a name off another clustering, or a
        person whose answer changes nothing -- is a 404 rather than a row.
        """
        payload = self._json_body()
        if payload is None:
            return
        person = payload.get("person")
        if not isinstance(person, str):
            self._json(400, {"error": "person"})
            return
        if person not in self.server.asked:
            self._json(404, {"error": "person"})
            return
        verdict = payload.get("verdict")
        if verdict not in people.VERDICTS:
            self._json(400, {"error": "verdict"})
            return
        self._json(200, self.server.decide(person, verdict))

    def _agreed(self) -> None:
        """Record one judgement about one pair. The same-person mode's only write.

        The body names a pair rather than describing one, `_verdict`'s discipline:
        the two names are matched against the queue this server is serving, so an
        answer about two clusters that are not being asked about -- names off another
        clustering, or a pair whose merge moves no stack -- is a 404 rather than a
        row. Either order names the same pair, because the reader is asked about two
        clusters and not about a direction.
        """
        payload = self._json_body()
        if payload is None:
            return
        persons = payload.get("persons")
        if (
            not isinstance(persons, list)
            or len(persons) != 2
            or not all(isinstance(person, str) for person in persons)
        ):
            self._json(400, {"error": "persons"})
            return
        pair = same.pairing(*persons)
        if pair not in self.server.paired:
            self._json(404, {"error": "persons"})
            return
        verdict = payload.get("verdict")
        if verdict not in same.VERDICTS:
            self._json(400, {"error": "verdict"})
            return
        self._json(200, self.server.agree(*pair, verdict))

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
        help="which round this sitting is (default %(default)s); an answer carries"
        " it, and a run an earlier round answered about is not asked about again",
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
    # Opened before the catalog, because the runs earlier rounds answered about are
    # dropped before anything is cut rather than after it.
    labels = store(labels_db)
    settled = answered_before(labels, args.round)
    given = answers(labels, args.round)
    # This round's own answers count too, and by run exactly as the earlier rounds
    # do. A sitting resumed tomorrow should deal fresh sets rather than yesterday's
    # over again; the ones dealt yesterday were answered, and revising an answer is
    # a move back through the sitting in hand.
    already = settled | {sha256 for entry in given.values() for sha256 in entry["members"]}
    conn = read_only(config.catalog_db)
    drawing = sitting(
        conn,
        strictness=args.strictness,
        linkage=args.linkage,
        already=already,
    )
    # The other mode's population, ranked once here rather than on request: the
    # ranking is over every stack, so there is no part of it that could be computed
    # later. It costs two queries whether or not the reader switches modes, and if
    # the people pass has not run it is empty rather than an error -- the page says
    # so, and the stack mode is untouched either way.
    clustering = people.Clustering()
    persons = people.asking(conn, clustering)
    # Which of them the cut left holding the faces they had, so that an answer given
    # about the uncut population is an answer here too -- ticket 78. Read once, with
    # the ranking, because the catalog does not change while the server is up.
    carried = people.unchanged(conn, clustering)
    # The third mode's queue, ranked here beside the persons and for its reason: how
    # many stacks a merge would change is counted across every stack at once. It is
    # drawn from the stacks the nesting rule would split rather than from the
    # embeddings -- see `harness.same` -- so it is empty, and the page says so, when
    # the people pass or the membership pass has not run.
    pairs = same.asking(conn, clustering)

    server = LabelServer(
        ("127.0.0.1", args.port),
        LabelHandler,
        drawing,
        labels,
        config.substrate_root,
        round=args.round,
        strictness=args.strictness,
        linkage=args.linkage,
        persons=persons,
        pairs=pairs,
        clustering=clustering,
        carried=carried,
    )
    url = f"http://127.0.0.1:{server.server_address[1]}/"
    print(f"labelling harness on {url}")
    print(f"  round           {args.round}, one sitting -- stop whenever you like")
    print(
        f"  setting         strictness {args.strictness}, {args.linkage} linkage,"
        f" {matches.METHOD}"
    )
    print(
        f"  sets            drawn one at a time from {len(drawing.order)} runs, in"
        f" bands of {', '.join(f'{name} {share:.0%}' for name, share in SHARES.items())}"
    )
    print(
        f"  context         {SHOWN} frame each side, widened with k up to the whole run"
    )
    print(f"  cameras         {len({camera for camera, _run in drawing.order})} bodies")
    print(f"  already judged  {len(already)} frames, and their runs are not asked about")
    print(f"  labels          {labels_db}")
    print(f"  substrates      {config.substrate_root}")
    print(f"  answers given   {len(given)} in this round")
    standing = people.verdicts(labels, clustering, carried=carried)
    judged, left = people.progress(persons, standing)
    print(
        f"  people mode     {len(persons)} persons whose verdict would move a stack,"
        f" {judged} judged, {left} left"
    )
    # The answers the carry could not make judgements of. A cluster the cut left
    # alone keeps its answer and is counted as judged above; one it changed holds
    # the older answer as a prior, which the page shows and the counter does not
    # count, so the number of them is worth saying out loud.
    prior = people.priors(labels, clustering)
    held = sum(
        1 for one in persons if one.person in prior and one.person not in standing
    )
    if held:
        print(
            f"                  {held} of them hold an answer about the uncut cluster"
            " of that name as a prior rather than as a judgement: the cut changed"
            " which faces they are"
        )
    if not persons:
        print(
            "                  nothing to judge there: either"
            " `python -m photolib.people` has not run, or"
            " `python -m photolib.membership` has not"
        )
    agreed = same.verdicts(labels, clustering, carried=carried)
    settled, outstanding = same.progress(pairs, agreed)
    print(
        f"  same-person     {len(pairs)} pairs of clusters torn across a stack the"
        f" nesting rule would split, {settled} judged, {outstanding} left"
    )
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
        # Held open for the life of the server, because a draw reads it: the catalog
        # is what the next set comes out of, and there is no next set until the reader
        # asks for one. Read-only throughout -- see `candidates.catalog`.
        conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
