"""Tests for the labelling harness's sampling, and for where its answers go.

Deliberately narrow: what is under test is what the reader can do and what gets
stored, never how the sampler walks its rows. That is the pure functions over Match
scores that decide which sets the reader is shown -- which band each one is drawn
as one of, which round is asking, and what a chain would have walked into each
stack -- the draw that hands them over one at a time, and the one thing a reader
would lose if it were wrong, which is an answer already given.

Nothing here starts a server or reads a substrate, and nothing opens a path from
config.toml. Scores are integers written in the test, so every expectation below is
arithmetic against `STRICTNESS` rather than an opinion about a photograph; the draw's
tests run against a temporary catalog they build themselves.
"""

from __future__ import annotations

import sqlite3
from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path

import pytest

from harness import label
from harness.label import STRICTNESS, Question
from photolib import matches, membership


def sha_of(seed: str) -> str:
    """A 64-hex string that reads as a hash without being one."""
    return (seed * 64)[:64]


A, B, C, D, E, F, G = (sha_of(seed) for seed in "abcdefg")

HIGH = STRICTNESS + 40  # agreed on plainly
LOW = 0  # nothing agreed at all
NEAR = STRICTNESS - 1  # the grey band, one point below the line


def scores(**pairs: int) -> dict[tuple[str, str], int]:
    """`{"ab": 60}` as `{(sha a, sha b): 60}` -- two-letter keys, in run order."""
    return {(sha_of(early), sha_of(late)): points for (early, late), points in pairs.items()}


def agreed(
    points: dict[tuple[str, str], int], strictness: int = membership.STRICTNESS
) -> label.Agree:
    """Those scores as the seam the walk asks through: whether two frames agree.

    `label.agreement` and never a comparison spelled out here -- the predicate is
    the grid's, and a test written against a copy of it would assert about the copy.
    The default is the *grid's* strictness and not this file's, which is what `link`
    used to fall back to; the two have been the same number and are not now. Every
    score below is plainly over both lines or plainly under them, so which one is in
    force only matters where a test names it.
    """
    return label.agreement(points, strictness)


# --- forming the stack the reader is shown -----------------------------------


def test_frames_that_agree_are_one_stack() -> None:
    assert label.link([A, B], agreed(scores(ab=HIGH))) == [[A, B]]


def test_frames_that_agree_on_nothing_are_two_stacks() -> None:
    assert label.link([A, B], agreed(scores(ab=LOW))) == [[A], [B]]


def test_a_pair_at_the_strictness_holds() -> None:
    """Strictness is a floor and not an exclusive bound, as `browse.py`'s window is.

    Named rather than left to `link`'s default, which is the *grid's* strictness and
    not the harness's -- the two have been the same number and are not now."""
    assert label.link([A, B], agreed(scores(ab=STRICTNESS), STRICTNESS)) == [[A, B]]
    assert label.link([A, B], agreed(scores(ab=STRICTNESS - 1), STRICTNESS)) == [[A], [B]]


def test_linkage_that_wants_more_than_a_neighbour_starts_a_new_stack() -> None:
    """ADR 0003's argument: every pair inside a stack must match, not merely each
    frame and its predecessor. C agrees with B and not with A, so it does not join.

    The rule is named because it is the subject: `link`'s default follows whatever
    the labels last settled, and what this asserts is what a rule does and not which
    rule is current."""
    points = scores(ab=HIGH, bc=HIGH, ac=LOW)

    assert label.link([A, B, C], agreed(points), joins=label.complete) == [[A, B], [C]]
    assert label.link([A, B, C], agreed(points), joins=label.LINKAGE["majority"]) == [
        [A, B],
        [C],
    ]


def test_a_pair_with_no_row_is_read_as_agreeing_on_nothing() -> None:
    """The screen rejected it or a substrate was missing. Either way the harness
    has no evidence the two frames are one picture, and draws them apart."""
    assert label.link([A, B], agreed({})) == [[A], [B]]


def test_matches_most_members_lets_in_a_frame_complete_linkage_keeps_out() -> None:
    """The softening ADR 0003 left open and its labels chose. Strictly most, so a
    frame agreeing with half a stack does not join: a tie is not most."""
    points = scores(ab=HIGH, bc=HIGH, ac=LOW)

    joined = scores(ad=HIGH, bd=HIGH, cd=LOW)

    assert label.majority([A, B], C, agreed(points, STRICTNESS)) is False  # one of two
    assert label.majority([A, B, C], D, agreed(joined, STRICTNESS)) is True
    assert label.neighbour([A, B], C, agreed(points, STRICTNESS)) is True  # only B decides


# --- which sets are worth the reader's evening -------------------------------


def shot(run: list[str], every: int = 2) -> list[tuple[str, int]]:
    """A run as the enumeration hands it over: each frame with when it was taken."""
    return [(sha, index * every) for index, sha in enumerate(run)]


def ask(run: list[str], points: dict, camera: str | None = "Lumix") -> list[Question]:
    return label.questions([(camera, shot(run))], points)


def one(run: list[str], points: dict, camera: str | None = "Lumix") -> Question:
    asked = ask(run, points, camera)
    assert len(asked) == 1, asked
    return asked[0]


def names(near) -> list[str]:
    """The shas of a run of neighbours, dropping the gaps."""
    return [sha for sha, _gap in near]


def test_a_stack_is_shown_with_the_frame_before_and_after_it() -> None:
    asked = one([A, B, C, D], scores(bc=HIGH))

    assert asked.members == (B, C)
    assert asked.nearest() == (A, D)


def test_a_stack_at_the_end_of_a_run_has_no_frame_after_it() -> None:
    asked = one([A, B], scores(ab=HIGH))

    assert asked.members == (A, B)
    assert asked.nearest() == (None, None)
    assert (asked.before, asked.after) == ((), ())


def test_the_run_is_carried_outwards_from_the_stack_nearest_frame_first() -> None:
    """The reader widens the view when the answer turns on what is past the edge,
    and that has to be a local move -- so the frames ride with the set."""
    asked = one([A, B, C, D, E, F], scores(cd=HIGH))

    assert asked.members == (C, D)
    assert names(asked.before) == [B, A]
    assert names(asked.after) == [E, F]


def test_the_whole_run_is_carried_by_default() -> None:
    """No ceiling: eight was one and the reader hit it, sixty was the next and
    they hit that too. The whole run rides with the set, which measured over a
    round's thirty sets is 3,808 frames and about 316 KB."""
    run = [sha_of(str(n)) for n in range(30)]
    asked = label.questions([("Lumix", shot(run))], {(run[14], run[15]): HIGH})

    assert len(asked) == 1
    assert len(asked[0].before) == 14  # everything before the stack
    assert len(asked[0].after) == 14  # and everything after it


def test_a_ceiling_can_still_be_asked_for() -> None:
    run = [sha_of(str(n)) for n in range(30)]
    asked = label.questions(
        [("Lumix", shot(run))], {(run[14], run[15]): HIGH}, context=3
    )

    assert (len(asked[0].before), len(asked[0].after)) == (3, 3)


def test_each_frame_outside_carries_its_gap_from_the_stack() -> None:
    """Two seconds is another press of the shutter and forty minutes is somewhere
    else, and the reader cannot tell those apart from the photograph alone."""
    asked = label.questions(
        [("Lumix", [(A, 0), (B, 10), (C, 12), (D, 300)])], scores(bc=HIGH)
    )[0]

    assert asked.before == ((A, 10),)   # 10s before the stack begins
    assert asked.after == ((D, 288),)   # 288s after it ends


def test_a_lone_frame_is_not_a_stack_and_is_not_shown() -> None:
    """CONTEXT.md: a stack is the same photograph taken more than once. A frame
    that matched nothing is still drawn as a neighbour of the stack beside it."""
    asked = ask([A, B, C], scores(bc=HIGH))

    assert [question.members for question in asked] == [(B, C)]


def test_the_margin_is_how_far_the_weakest_evidence_sits_from_the_line() -> None:
    """A stack held together by a pair one point above strictness is one point
    from being drawn as two, which is the whole reason to ask about it."""
    asked = one([A, B, C], scores(ab=HIGH, bc=STRICTNESS + 1, ac=HIGH))

    assert asked.margin == 1


def test_a_neighbour_that_nearly_joined_makes_the_set_indecisive() -> None:
    """The reader's second complaint -- is it missing something that should be
    here -- so a frame left just outside counts against the margin exactly as a
    frame let just inside does."""
    asked = one([A, B, C], scores(bc=HIGH, ab=NEAR, ac=NEAR))

    assert asked.members == (B, C)
    assert asked.margin == 1


def test_a_neighbour_is_judged_on_its_weakest_pair_and_not_its_best() -> None:
    """Complete linkage is what it would have had to satisfy, so the pair that
    kept it out is the binding one."""
    asked = one([A, B, C], scores(bc=HIGH, ab=NEAR, ac=LOW))

    assert asked.margin == STRICTNESS - LOW


def test_only_the_nearest_frame_either_side_decides_the_margin() -> None:
    """The margin is about *this* boundary. A frame further out is its own
    boundary with its own question, and letting it move this number would rank
    the set by an argument the reader is not being shown."""
    near = one([A, B, C], scores(bc=HIGH, ab=NEAR, ac=NEAR))
    far = one([A, B, C, D], scores(cd=HIGH, bc=NEAR, bd=NEAR, ab=LOW, ac=LOW, ad=LOW))

    assert near.margin == 1
    assert far.margin == 1  # A is two away and does not enter it


def test_a_neighbour_that_agrees_with_every_member_is_a_coin_toss() -> None:
    """The walk is forward, so B is consumed by the stack before this one and can
    still agree with all of it. Nothing about the Match justifies that split, so
    the margin bottoms out rather than going negative."""
    asked = ask([A, B, C, D], scores(ab=HIGH, ac=LOW, ad=LOW, bc=HIGH, bd=HIGH, cd=HIGH))

    assert [question.members for question in asked] == [(A, B), (C, D)]
    assert asked[1].nearest()[0] == B
    assert asked[1].margin == 0


def test_a_stack_nothing_borders_and_nothing_strains_is_decisive() -> None:
    asked = one([A, B], scores(ab=HIGH))

    assert asked.margin == HIGH - STRICTNESS


# --- round two: drawing at the settled rule, and pricing the chain ------------


def test_the_sets_are_drawn_under_the_rule_the_labels_settled() -> None:
    """ADR 0003 argued from complete linkage and its labels chose "matches most
    members", so a bare draw is round two's. D agrees with two of the three
    members and joins; complete linkage would leave it out over the pair it
    disagrees with."""
    points = scores(ab=HIGH, ac=HIGH, bc=HIGH, ad=LOW, bd=HIGH, cd=HIGH)

    assert label.link([A, B, C, D], agreed(points), joins=label.complete) == [[A, B, C], [D]]
    assert one([A, B, C, D], points).members == (A, B, C, D)


def test_a_chain_that_reaches_past_the_stack_is_counted() -> None:
    """Round two's question, and the one round one could not ask: where would a
    chain of frames each like its predecessor walk a stack through a scene change
    that the settled rule stops at. E is like D and like nothing else, so single
    linkage takes it and "matches most members" does not."""
    asked = one(
        [A, B, C, D, E],
        scores(ab=HIGH, ac=HIGH, ad=HIGH, bc=HIGH, bd=HIGH, cd=HIGH, de=HIGH),
    )

    assert asked.members == (A, B, C, D)
    assert asked.chain == 1  # E, which the chain would have walked into it


def test_a_stack_a_chain_would_draw_the_same_way_has_no_chain_to_price() -> None:
    assert one([A, B, C], scores(bc=HIGH)).chain == 0


def test_a_chain_that_breaks_inside_the_stack_and_walks_on_still_counts() -> None:
    """The sharpest case there is, and the one an anchor on the first member scores
    zero. D joins as two of three, which is the softening earning its keep; single
    linkage breaks at C and then chains E in from D. The chain does cross a
    boundary the settled rule drew, so the count has to see it."""
    points = scores(ab=HIGH, ac=HIGH, bc=HIGH, ad=HIGH, bd=HIGH, cd=LOW, de=HIGH)
    asked = one([A, B, C, D, E], points)

    assert asked.members == (A, B, C, D)
    assert label.link([A, B, C, D, E], agreed(points), joins=label.neighbour) == [
        [A, B, C],
        [D, E],
    ]
    assert asked.chain == 1  # E, chained on from D after the break at C


def test_a_chain_that_only_cuts_the_stack_up_prices_nothing() -> None:
    """The rules disagree the other way about: D joins as two of three and single
    linkage stops at the frame before it with nothing left to walk. Nothing crosses
    a boundary, so there is nothing for round two to price."""
    asked = one([A, B, C, D], scores(ab=HIGH, ac=HIGH, ad=HIGH, bc=HIGH, bd=HIGH, cd=LOW))

    assert asked.members == (A, B, C, D)
    assert asked.chain == 0


def test_a_chain_reaching_the_frames_before_the_stack_counts_too() -> None:
    """A boundary is a boundary whichever side of the stack it sits on: a chain that
    drags in what came before is the same failure as one that drags in what came
    after. D agrees with only one of the three frames before it, so the settled rule
    starts a stack there and the chain walks the whole run into one."""
    points = scores(ab=HIGH, ac=HIGH, bc=HIGH, ad=LOW, bd=LOW, cd=HIGH, de=HIGH)
    asked = ask([A, B, C, D, E], points)

    assert label.link([A, B, C, D, E], agreed(points), joins=label.neighbour) == [
        [A, B, C, D, E]
    ]
    assert [question.members for question in asked] == [(A, B, C), (D, E)]
    assert asked[0].chain == 2  # D and E, after it
    assert asked[1].chain == 3  # A, B and C, before it


def test_a_run_an_earlier_round_answered_about_is_not_asked_about_again() -> None:
    settled = Question(camera="Lumix", members=(A, B), before=(), after=(), margin=0)
    fresh = Question(camera="Lumix", members=(C, D), before=(), after=(), margin=0)

    assert label.unanswered([settled, fresh], {A}) == [fresh]


def test_the_run_is_excluded_and_not_the_stack_as_it_happened_to_be_drawn() -> None:
    """A later round draws from a different band, so it redraws the same run with the
    boundary a frame or two over. Keyed on the stack, a set key would let it re-ask
    about an evening the reader has already spent -- under a key they never saw."""
    grown = Question(camera="Lumix", members=(A, B, C), before=(), after=(), margin=0)
    beside = Question(camera="Lumix", members=(E, F), before=((C, 4),), after=(), margin=0)

    assert label.unanswered([grown], {A}) == []       # a member of it was answered
    assert label.unanswered([beside], {C}) == []      # so was a frame of its run
    assert label.unanswered([beside], {G}) == [beside]


def test_a_run_is_named_by_every_frame_a_set_carries_of_it() -> None:
    question = Question(
        camera="Lumix", members=(C, D), before=((B, 2), (A, 5)), after=((E, 3),), margin=0
    )

    assert question.run() == {A, B, C, D, E}


# --- spreading the reader's time -----------------------------------------


def asking(
    camera: str, margin: int, seed: str, chain: int = 0, deciding: int = 0
) -> Question:
    return Question(
        camera=camera,
        members=(sha_of(seed),),
        before=(),
        after=(),
        margin=margin,
        deciding=deciding,
        chain=chain,
    )


def test_the_least_decisive_sets_come_first() -> None:
    late = asking("Lumix", 9, "a")
    early = asking("Lumix", 1, "b")

    assert label.spread([late, early], 2) == [early, late]


def test_the_sets_a_chain_would_walk_through_come_before_them() -> None:
    """The margin cannot rank round two's question and that is why the chain leads
    it: a run single linkage walks straight through can sit hundreds of points clear
    of the line at every boundary it crosses, and the distance alone would rank it
    last."""
    walked = asking("Lumix", HIGH, "a", chain=3)
    indecisive = asking("Lumix", 0, "b")

    assert label.spread([indecisive, walked], 2) == [walked, indecisive]


def test_a_longer_walk_comes_before_a_shorter_one() -> None:
    far = asking("Lumix", 9, "a", chain=5)
    near = asking("Lumix", 0, "b", chain=1)

    assert label.spread([near, far], 2) == [far, near]


def test_the_camera_spread_survives_the_chain_leading_the_ranking() -> None:
    """A rule calibrated on the body the operator shoots most must not quietly
    misbehave on the other four, whichever question the round is asking."""
    lumix = [asking("Lumix", 0, seed, chain=walk) for walk, seed in zip((4, 3, 2), "abc")]
    sony = [asking("Sony", 0, "d", chain=1)]

    picked = label.spread([*lumix, *sony], 4)

    assert {question.camera for question in picked} == {"Lumix", "Sony"}
    assert picked[1] == sony[0]


def test_the_sample_spans_more_than_one_camera() -> None:
    """A threshold calibrated on the body the operator shoots most must not
    quietly misbehave on the other four, so a camera with only decisive sets
    still appears ahead of the main body's fifth-least-decisive one."""
    lumix = [asking("Lumix", margin, seed) for margin, seed in zip(range(4), "abcd")]
    sony = [asking("Sony", 8, "e")]

    picked = label.spread([*lumix, *sony], 4)

    assert {question.camera for question in picked} == {"Lumix", "Sony"}
    assert picked[1] == sony[0]


def test_a_camera_that_runs_out_does_not_hold_up_the_rest() -> None:
    lumix = [asking("Lumix", margin, seed) for margin, seed in zip(range(3), "abc")]
    sony = [asking("Sony", 0, "d")]

    picked = label.spread([*lumix, *sony], 4)

    assert len(picked) == 4
    assert picked[-1] == lumix[-1]


def test_asking_for_more_than_there_is_gives_what_there_is() -> None:
    assert len(label.spread([asking("Lumix", 0, "a")], 30)) == 1


def test_the_sample_is_the_same_one_every_time_the_harness_starts() -> None:
    """Answers are keyed on the frames, so a reader who stops and comes back has
    to be shown the same sets in the same order for the counter to mean anything."""
    tied = [asking("Lumix", 3, seed) for seed in "abc"]

    assert label.spread(tied, 3) == label.spread(list(reversed(tied)), 3)


# --- the three bands a round straddles ----------------------------------------

LOOSER = 12  # a Match a looser strictness would newly merge
HOLDS = 25  # one the shipped setting already merges
NOTHING = 0  # no row at all, which no strictness reaches


def banded(count: int, deciding: int, camera: str = "Lumix") -> list[Question]:
    """`count` sets whose drawing turns on a pair scoring `deciding`."""
    return [
        asking(camera, 0, f"{deciding}x{index}", deciding=deciding) for index in range(count)
    ]


def test_a_match_belongs_to_the_band_its_number_falls_in() -> None:
    """The boundaries, as `SHARES` states them. A pure function over one stored
    number, which is what makes the banding assertable without a photograph."""
    assert label.band(NOTHING) == "unreachable"
    assert label.band(4) == "unreachable"
    assert label.band(5) == "loosen"
    assert label.band(19) == "loosen"
    assert label.band(20) == "merged"
    assert label.band(40) == "merged"
    assert label.band(41) is None  # decisive, and therefore not a question


def test_a_draw_of_ten_straddles_the_dial_rather_than_sitting_on_it() -> None:
    """`SHARES` in the proportions it states, without the draw having been told that
    ten was coming: there is no round size to divide up."""
    pool = banded(5, LOOSER) + banded(5, HOLDS) + banded(5, NOTHING)

    picked = label.spread(pool, 10)

    assert Counter(question.band for question in picked) == {
        "loosen": 4,
        "merged": 4,
        "unreachable": 2,
    }


def test_the_bands_are_mixed_rather_than_served_in_blocks() -> None:
    """The reader must not spend their first hour on one kind of question: a round
    abandoned halfway through would otherwise be a round of one band."""
    pool = banded(4, LOOSER) + banded(4, HOLDS) + banded(2, NOTHING)

    assert [question.band for question in label.spread(pool, 10)] == [
        "loosen",
        "merged",
        "loosen",
        "merged",
        "unreachable",
        "loosen",
        "merged",
        "loosen",
        "merged",
        "unreachable",
    ]


def test_a_band_with_nothing_in_it_does_not_stall_the_draw() -> None:
    pool = banded(3, HOLDS) + banded(3, NOTHING)

    picked = label.spread(pool, 6)

    assert len(picked) == 6
    assert {question.band for question in picked} == {"merged", "unreachable"}


def test_a_draw_of_one_carries_on_the_weave_rather_than_restarting_it() -> None:
    """The sets are drawn one at a time, so the shares live in what has already been
    dealt. Restarting at the top would hand back the same band every request."""
    pool = banded(4, LOOSER) + banded(4, HOLDS)
    dealt: list[Question] = []

    for _ in range(4):
        picked = label.spread(pool, 1, drawn=dealt)
        pool.remove(picked[0])
        dealt += picked

    assert [question.band for question in dealt] == ["loosen", "merged", "loosen", "merged"]


def test_the_cameras_are_still_spread_inside_a_band() -> None:
    """A rule calibrated on the body the operator shoots most must not quietly
    misbehave on the other four, whichever band the set was drawn from."""
    pool = banded(3, HOLDS, "Lumix") + banded(3, HOLDS, "Sony")

    picked = label.spread(pool, 4)

    assert [question.camera for question in picked] == ["Lumix", "Sony", "Lumix", "Sony"]


def test_a_set_is_banded_by_the_pair_its_drawing_turns_on() -> None:
    """And never by its strongest pair. A burst of frames agreeing 300 apiece, held
    on to one pair of twelve by "matches most members", is a set the dial is arguing
    about -- and would be drawn as decisive if the best evidence spoke for it."""
    asked = one([A, B, C, D], scores(ab=300, ac=300, ad=300, bc=300, bd=300, cd=LOOSER))

    assert asked.members == (A, B, C, D)
    assert asked.deciding == LOOSER
    assert asked.band == "loosen"
    assert label.band(300) is None  # which the strongest pair would have made it


def test_a_neighbour_a_looser_dial_would_pull_in_puts_the_set_in_that_band() -> None:
    """The reader's actual question, and the band that answers it: would turning the
    dial down have brought in the frame they say is missing."""
    asked = one([A, B, C], scores(ab=300, ac=300, bc=LOOSER))

    assert asked.members == (A, B)
    assert (asked.deciding, asked.band) == (LOOSER, "loosen")


def test_a_set_held_together_at_the_line_is_one_the_setting_already_merges() -> None:
    """Without this band a round could only discover missing merges and never wrong
    ones, which would flatter every loosening."""
    asked = one([A, B], scores(ab=HOLDS))

    assert (asked.deciding, asked.band) == (HOLDS, "merged")


def test_a_set_resting_on_a_pair_with_no_match_row_is_one_no_dial_reaches() -> None:
    """"Matches most members" can hold a stack together over a pair the geometry
    never checked, and no strictness would have merged that pair. If the dial turns
    out not to be the answer, this band is the evidence for what is."""
    asked = one([A, B, C, D], scores(ab=300, ac=300, ad=300, bc=300, bd=300))

    assert asked.members == (A, B, C, D)
    assert (asked.deciding, asked.band) == (NOTHING, "unreachable")


def test_a_set_the_match_commits_to_is_not_a_question_and_is_not_drawn() -> None:
    asked = one([A, B], scores(ab=300))

    assert asked.band is None
    assert label.spread([asked], 5) == []


# --- drawing them one at a time -----------------------------------------------

BASE = datetime(2021, 6, 1, 12, 0, 0)
APART = 2  # seconds between the frames of a run, well inside the fence
AWAY = 7200  # seconds between runs, well outside it


class Catalog:
    """Frames in time with the Matches between them written by hand.

    Enough of a catalog for `candidates.population` to cut runs out of, and no more:
    a Match is stated here rather than derived from a photograph, because what is
    under test is which sets a known set of numbers becomes.
    """

    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn
        self.next_id = 0

    def add(self, seed: str, second: int, camera: str = "Lumix") -> str:
        sha256 = sha_of(seed)
        self.conn.execute(
            "INSERT INTO file (sha256, size, ext, kind, state, feature_ver, camera,"
            " taken_src) VALUES (?, 1, '.jpg', 'image', 'published', '{}', ?,"
            " 'exif:DateTimeOriginal')",
            (sha256, camera),
        )
        self.next_id += 1
        self.conn.execute(
            "INSERT INTO photo (id, rep_sha256, sort_key) VALUES (?, ?, ?)",
            (self.next_id, sha256, (BASE + timedelta(seconds=second)).isoformat()),
        )
        self.conn.commit()
        return sha256

    def matched(self, early: str, late: str, points: int) -> None:
        self.conn.execute(
            "INSERT OR REPLACE INTO pair_match (method, version, sha_early, sha_late,"
            " points) VALUES (?, ?, ?, ?, ?)",
            (matches.METHOD, matches.VERSION, early, late, points),
        )
        self.conn.commit()


def straddling(corpus: Catalog, index: int, camera: str = "Lumix") -> list[str]:
    """One run holding a set in each of the three bands.

    Eight frames, four stacks of two. The first is held together at the line, so it
    is one the setting already merges; the second sits beside a frame a looser dial
    would pull in; the last two agree plainly and border frames the geometry never
    checked, which no dial reaches.
    """
    run = [
        corpus.add(f"{index}s{step}", index * AWAY + step * APART, camera)
        for step in range(8)
    ]
    a, b, c, d, e, f, g, h = run
    corpus.matched(a, b, HOLDS)
    corpus.matched(c, d, 300)
    corpus.matched(c, e, LOOSER)
    corpus.matched(d, e, LOOSER)
    corpus.matched(e, f, 300)
    corpus.matched(g, h, 300)
    return run


def reading(migrated: tuple[Path, Path], **knobs) -> label.Sitting:
    """A sitting over the catalog alone, read-only, with `state.sqlite3` not named."""
    return label.sitting(label.read_only(migrated[0]), **knobs)


@pytest.fixture
def catalog(conn: sqlite3.Connection) -> Catalog:
    return Catalog(conn)


def test_a_run_holds_a_set_in_each_band(catalog: Catalog, migrated) -> None:
    """The fixture the draws below rest on, asserted rather than assumed."""
    straddling(catalog, 0)

    drawing = reading(migrated)
    drawn = [question.band for question in iter(drawing.draw, None)]

    assert sorted(drawn) == ["loosen", "merged", "unreachable", "unreachable"]


def test_the_first_set_is_drawn_without_the_catalog_being_cut_whole(
    catalog: Catalog, migrated
) -> None:
    """No pool and no plan: the reader asks for a set and gets one, and the runs
    behind it are still uncut. Twelve here, and one is enough to answer with."""
    for index in range(12):
        straddling(catalog, index)

    drawing = reading(migrated)

    assert len(drawing.order) == 12
    assert drawing.draw() is not None
    assert drawing.at == 1


def test_two_requests_do_not_hand_back_the_same_set(catalog: Catalog, migrated) -> None:
    for index in range(4):
        straddling(catalog, index)

    drawing = reading(migrated)
    first, second = drawing.draw(), drawing.draw()

    assert first is not None and second is not None
    assert first.members != second.members


def test_a_run_an_earlier_round_answered_about_is_never_drawn(
    catalog: Catalog, migrated
) -> None:
    """Disjointness, by run: whatever the reader said about that run, they said it
    about those photographs, and a new round asking again from a slightly different
    angle buys nothing."""
    judged = straddling(catalog, 0)
    for index in range(1, 4):
        straddling(catalog, index)

    # One frame of it, and not one the sets were even drawn around.
    drawing = reading(migrated, already={judged[7]})
    drawn = list(iter(drawing.draw, None))

    assert drawn
    assert not any(question.run() & set(judged) for question in drawn)


def test_the_sets_are_drawn_from_more_than_one_camera(catalog: Catalog, migrated) -> None:
    """A setting calibrated on the body the operator shoots most must not quietly
    misbehave on the others, and the sitting may be four sets long."""
    straddling(catalog, 0, "Lumix")
    straddling(catalog, 1, "Lumix")
    straddling(catalog, 2, "Sony")

    drawing = reading(migrated)
    drawn = [drawing.draw() for _ in range(4)]

    assert {question.camera for question in drawn} == {"Lumix", "Sony"}


def test_the_draw_ends_when_the_catalog_has_no_question_left(
    catalog: Catalog, migrated
) -> None:
    straddling(catalog, 0)

    drawing = reading(migrated)
    while drawing.draw() is not None:
        pass

    assert drawing.draw() is None
    assert drawing.dry == set(label.BANDS)  # searched for, and none left


# --- what the reader's answer says --------------------------------------------


def test_accepting_the_stack_as_drawn_says_so() -> None:
    assert label.verdict(evicted=(), included=(), unsure=False) == "accept"


def test_clicking_a_frame_is_a_split_and_clicking_a_neighbour_is_a_merge() -> None:
    assert label.verdict(evicted=(A,), included=(), unsure=False) == "split"
    assert label.verdict(evicted=(), included=(B,), unsure=False) == "merge"
    assert label.verdict(evicted=(A,), included=(B,), unsure=False) == "both"


def test_not_sure_is_its_own_answer_and_outranks_any_marks() -> None:
    """A grey area recorded as grey is worth more than a forced verdict, so the
    key that says so is not overridden by a click the reader was unsure about."""
    assert label.verdict(evicted=(A,), included=(B,), unsure=True) == "unsure"


# --- where the answers go -----------------------------------------------------


@pytest.fixture
def answers(tmp_path: Path):
    conn = label.store(tmp_path / "labels.sqlite3")
    yield conn
    conn.close()


ASKED = Question(
    camera="Lumix", members=(A, B), before=(), after=((C, 3), (D, 9)), margin=2
)

OTHER = Question(camera="Sony", members=(C, D), before=(), after=(), margin=0)


def given(conn, **marks) -> None:
    label.record(
        conn,
        ASKED,
        **{
            "shown": 1,
            "evicted": (),
            "included": (),
            "unsure": False,
            "round": label.ROUND,
            **marks,
        },
    )


def stored(conn, members=(A, B), round: int = label.ROUND) -> dict:
    """The one answer filed under this set in this round -- the table's own key."""
    return label.answers(conn)[label.key(members), round]


def test_an_answer_survives_the_harness_being_stopped(tmp_path: Path) -> None:
    path = tmp_path / "labels.sqlite3"
    conn = label.store(path)
    given(conn)
    conn.close()

    reopened = label.store(path)
    try:
        assert stored(reopened)["verdict"] == "accept"
    finally:
        reopened.close()


def test_an_answer_can_be_revised(answers) -> None:
    given(answers)
    given(answers, evicted=(B,))

    revised = stored(answers)
    assert revised["verdict"] == "split"
    assert revised["evicted"] == [B]
    assert len(label.answers(answers)) == 1


def test_an_answer_records_the_stack_it_was_about() -> None:
    """The sample moves when the provisional strictness does, so an answer that
    did not say which frames it was about could not be read afterwards."""
    conn = label.store(Path(":memory:"))
    try:
        given(conn, included=(C,))
        recorded = stored(conn)
    finally:
        conn.close()

    assert recorded["members"] == [A, B]
    assert recorded["included"] == [C]
    assert recorded["camera"] == "Lumix"


def test_this_sitting_is_stamped_as_round_three(answers) -> None:
    """The report scores a round apart from the rounds that chose the setting it is
    checking, so what this sitting writes has to say it is neither of them."""
    given(answers)

    assert label.ROUND == 3
    assert stored(answers)["round"] == 3
    assert len(label.answers(answers, 3)) == 1
    assert label.answers(answers, 2) == {}


def test_a_reason_says_why_the_frame_it_is_keyed_on_does_not_belong(answers) -> None:
    """The count four tickets downstream turn on: "the wrong people are in it" was
    indistinguishable from "this is a different photograph" until this column."""
    given(answers, evicted=(A,), reasons={A: "people"})

    recorded = stored(answers)
    assert recorded["evicted"] == [A]  # the shape rounds one and two wrote, unchanged
    assert recorded["reasons"] == {A: "people"}


def test_a_set_split_for_two_different_reasons_reads_as_such(answers) -> None:
    """Which is why the reasons are stored per frame and not per set."""
    given(answers, evicted=(A, B), reasons={A: "people", B: "close"})

    assert stored(answers)["reasons"] == {A: "people", B: "close"}


def test_an_answer_nobody_could_be_asked_why_about_reads_as_unknown(answers) -> None:
    """Not as "no reason given": rounds one and two hold sixty answers with nothing
    to press, and counting their silence as a denial would make the people problem
    look smaller than it is."""
    given(answers, evicted=(A,))

    assert stored(answers)["reasons"] is None


def test_a_reader_asked_and_pressing_nothing_is_a_different_fact(answers) -> None:
    given(answers, evicted=(A,), reasons={})

    assert stored(answers)["reasons"] == {}


def reasonless(path: Path, rows: list[tuple]) -> None:
    """A labels file in the shape written before an eviction could say why."""
    old = sqlite3.connect(path)
    old.execute(
        "CREATE TABLE answer (members TEXT PRIMARY KEY, camera TEXT, surrounding TEXT,"
        " margin INTEGER, verdict TEXT, evicted TEXT, included TEXT, answered_at TEXT,"
        " round INTEGER NOT NULL DEFAULT 1)"
    )
    old.executemany("INSERT INTO answer VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", rows)
    old.commit()
    old.close()


def test_an_answer_from_before_the_column_existed_still_reads(tmp_path: Path) -> None:
    """The sixty answers rounds one and two hold are what ADR 0003's findings are
    derived from, and this ticket must not touch them."""
    path = tmp_path / "labels.sqlite3"
    reasonless(
        path,
        [
            (label.key((A, B)), "Lumix", f'["{C}"]', 2, "split", f'["{B}"]', "[]",
             "2026-08-11", 2),
        ],
    )

    conn = label.store(path)
    try:
        carried = stored(conn, round=2)
        given(conn, evicted=(A,), reasons={A: "moment"})
        fresh = stored(conn)
    finally:
        conn.close()

    assert (carried["round"], carried["verdict"], carried["evicted"]) == (2, "split", [B])
    assert carried["reasons"] is None
    # And the column it gained is writable, so the round in hand records into it --
    # beside round two's answer about the same set rather than over the top of it.
    assert fresh["reasons"] == {A: "moment"}


def test_an_answer_records_which_round_asked_it(answers) -> None:
    """Round two's answers are a check on the setting round one chose, so an answer
    that did not say which round asked it could not be told from the evidence it is
    checking."""
    given(answers, round=2)

    assert stored(answers, round=2)["round"] == 2


def test_the_counter_reads_the_round_in_hand(answers) -> None:
    """"How many have I given" is a question about this sitting, and an earlier
    round's answers are not drawable at all."""
    given(answers, round=1)

    assert label.answers(answers, 2) == {}
    assert len(label.answers(answers, 1)) == 1
    assert len(label.answers(answers)) == 1  # every round, which is what the report reads


def test_a_later_round_asking_the_same_question_does_not_destroy_the_answer(
    answers,
) -> None:
    """Ticket 90, and the reason the round is half the key. The sampling rule that
    keeps an answered run out of a later draw is a sampling rule; a sitting drawn to
    retest the reader deliberately breaks it, and before this the retest overwrote
    the evidence it was run to check."""
    given(answers, round=1, evicted=(A,))
    given(answers, round=4)

    assert stored(answers, round=1)["verdict"] == "split"
    assert stored(answers, round=4)["verdict"] == "accept"
    assert len(label.answers(answers)) == 2


def test_revising_inside_the_sitting_still_replaces(answers) -> None:
    """The other half of the same decision: `h` goes back through the sets dealt
    tonight, and a misclick corrected there is one answer and not the reader
    contradicting themselves. Which is why the key stops at the round."""
    given(answers, round=4)
    given(answers, round=4, evicted=(B,))

    assert stored(answers, round=4)["verdict"] == "split"
    assert len(label.answers(answers)) == 1


def test_the_counter_counts_a_re_ask_once(answers) -> None:
    """The counter is the round in hand's, so an earlier round's answer about the
    same set is not one of tonight's -- with both of them in the file, which is what
    the count of every round says and the old shape could not have produced."""
    given(answers, round=1)
    given(answers, round=4)

    assert len(label.answers(answers, 4)) == 1
    assert len(label.answers(answers)) == 2


def test_only_an_earlier_round_keeps_a_run_out_of_the_draw(answers) -> None:
    """The frames an earlier round's answers were about, which is how a run is named
    -- and never the round in hand's, whose answers come back with their sets so they
    can be revised."""
    given(answers, round=1)
    label.record(answers, OTHER, shown=1, evicted=(), included=(), unsure=False, round=2)

    assert label.answered_before(answers, 2) == {A, B}
    assert label.answered_before(answers, 3) == {A, B, C, D}
    assert label.answered_before(answers, 1) == set()


def test_an_answer_records_which_frames_outside_the_stack_were_on_screen() -> None:
    """Ticket 34 turns on this: `accept` says the frames the reader was shown are
    right, and never that the stack is complete. A strictness that pulls in a
    frame they never saw is not contradicting them."""
    conn = label.store(Path(":memory:"))
    try:
        given(conn, shown=1)
        narrow = stored(conn)["surrounding"]
        given(conn, shown=2)
        wide = stored(conn)["surrounding"]
    finally:
        conn.close()

    assert narrow == [C]
    assert wide == [C, D]


def test_the_frames_on_screen_are_the_ones_the_view_was_widened_to() -> None:
    question = Question(
        camera="Lumix", members=(C, D), before=((B, 2), (A, 5)), after=((E, 3),), margin=0
    )

    assert question.surrounding(1) == [B, E]
    assert question.surrounding(2) == [B, A, E]
    assert question.surrounding(8) == [B, A, E]  # asking for more than there is


def test_the_frames_past_the_run_are_always_among_those_shown() -> None:
    """They are drawn however narrow the view is, so an answer is always partly
    about them -- including `accept`, which then says the frame a day away does
    not belong either. That is the reader's check on the clock."""
    question = Question(
        camera="Lumix",
        members=(C, D),
        before=((B, 2),),
        after=((E, 3),),
        margin=0,
        outside=((A, 84_439), (F, 86_398)),
    )

    assert question.surrounding(1) == [B, E, A, F]
    assert question.surrounding(99) == [B, E, A, F]


def test_a_run_at_the_edge_of_the_library_has_nothing_past_it() -> None:
    question = Question(
        camera="Lumix", members=(A, B), before=(), after=((C, 3),), margin=0,
        outside=(None, (D, 90_000)),
    )

    assert question.surrounding(1) == [C, D]


def older(path: Path, rows: list[tuple]) -> None:
    """A labels file in the shape written before the view could be widened."""
    old = sqlite3.connect(path)
    old.execute(
        "CREATE TABLE answer (members TEXT PRIMARY KEY, camera TEXT, before_sha TEXT,"
        " after_sha TEXT, margin INTEGER, verdict TEXT, evicted TEXT, included TEXT,"
        " answered_at TEXT)"
    )
    old.executemany("INSERT INTO answer VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", rows)
    old.commit()
    old.close()


def test_answers_from_before_the_view_could_widen_are_carried_over(tmp_path: Path) -> None:
    """Exact rather than a guess: the older table's two columns are precisely
    what was on screen when the view was one frame either side. The reader's
    answers are the one thing here that is not re-derivable, so they are not
    made to move a file to keep them."""
    path = tmp_path / "labels.sqlite3"
    older(
        path,
        [
            (label.key((A, B)), "Lumix", C, D, 2, "merge", "[]", f'["{C}"]', "2026-08-09"),
            (label.key((D, E)), "Sony", None, None, 7, "accept", "[]", "[]", "2026-08-09"),
        ],
    )

    conn = label.store(path)
    try:
        carried = label.answers(conn)
    finally:
        conn.close()

    assert carried[label.key((A, B)), 1]["surrounding"] == [C, D]
    assert carried[label.key((A, B)), 1]["verdict"] == "merge"
    assert carried[label.key((A, B)), 1]["included"] == [C]
    assert carried[label.key((A, B)), 1]["round"] == 1
    # Nothing either side of it, which is a real state and not a missing one.
    assert carried[label.key((D, E)), 1]["surrounding"] == []
    assert carried[label.key((D, E)), 1]["verdict"] == "accept"


def roundless(path: Path, rows: list[tuple]) -> None:
    """A labels file in the shape written before there was a second round to name."""
    old = sqlite3.connect(path)
    old.execute(
        "CREATE TABLE answer (members TEXT PRIMARY KEY, camera TEXT, surrounding TEXT,"
        " margin INTEGER, verdict TEXT, evicted TEXT, included TEXT, answered_at TEXT)"
    )
    old.executemany("INSERT INTO answer VALUES (?, ?, ?, ?, ?, ?, ?, ?)", rows)
    old.commit()
    old.close()


def test_answers_written_before_rounds_existed_are_round_one(tmp_path: Path) -> None:
    """Exact rather than a guess, like the widening carry-over: round one is all
    that had run when the column did not exist. So the reader is dealt round two
    without re-labelling an evening of sets to say which round they were."""
    path = tmp_path / "labels.sqlite3"
    roundless(
        path,
        [(label.key((A, B)), "Lumix", f'["{C}"]', 2, "accept", "[]", "[]", "2026-08-10")],
    )

    conn = label.store(path)
    try:
        carried = label.answers(conn)
        # And their run is what a later round will not ask about again.
        settled = label.answered_before(conn, 2)
    finally:
        conn.close()

    assert carried[label.key((A, B)), 1]["round"] == 1
    assert carried[label.key((A, B)), 1]["surrounding"] == [C]
    assert settled == {A, B}


def test_naming_the_round_happens_once_and_a_second_open_leaves_it_alone(
    tmp_path: Path,
) -> None:
    """The column is added once. A second open must not stamp round one over an
    answer given since -- which is the round in hand's whole evening."""
    path = tmp_path / "labels.sqlite3"
    roundless(
        path, [(label.key((A, B)), "Lumix", "[]", 2, "accept", "[]", "[]", "2026-08-10")]
    )

    first = label.store(path)
    label.record(first, OTHER, shown=1, evicted=(), included=(), unsure=False, round=2)
    first.close()

    conn = label.store(path)
    try:
        kept = label.answers(conn)
    finally:
        conn.close()

    assert kept[label.key((A, B)), 1]["round"] == 1
    assert kept[label.key((C, D)), 2]["round"] == 2


def one_per_set(path: Path, rows: list[tuple]) -> None:
    """A labels file in the shape written before a set could be answered twice."""
    old = sqlite3.connect(path)
    old.execute(
        "CREATE TABLE answer (members TEXT PRIMARY KEY, camera TEXT, surrounding TEXT,"
        " margin INTEGER, verdict TEXT, evicted TEXT, included TEXT, answered_at TEXT,"
        " round INTEGER NOT NULL DEFAULT 1, reasons TEXT)"
    )
    old.executemany("INSERT INTO answer VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", rows)
    old.commit()
    old.close()


ANSWERED = [
    (label.key((A, B)), "Lumix", f'["{C}"]', 2, "split", f'["{B}"]', "[]", "2026-08-11",
     2, None),
    (label.key((D, E)), "Sony", "[]", 7, "accept", "[]", "[]", "2026-08-11", 1, None),
]


def test_a_file_keyed_on_the_set_alone_is_re_keyed_and_keeps_every_answer(
    tmp_path: Path,
) -> None:
    """Ticket 90's widening. The reader's 153 answers are the one thing here that is
    not re-derivable, so they are carried across rather than asked to move aside --
    and nothing is stamped or defaulted, the round they were given in being the round
    they keep."""
    path = tmp_path / "labels.sqlite3"
    one_per_set(path, ANSWERED)

    conn = label.store(path)
    try:
        carried = label.answers(conn)
        when = dict(conn.execute("SELECT members, answered_at FROM answer"))
        tables = {
            row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        }
    finally:
        conn.close()

    assert len(carried) == len(ANSWERED)
    assert carried[label.key((A, B)), 2]["verdict"] == "split"
    assert carried[label.key((A, B)), 2]["evicted"] == [B]
    assert carried[label.key((A, B)), 2]["reasons"] is None  # still unknown, not none
    assert carried[label.key((D, E)), 1]["verdict"] == "accept"
    # When it was answered rides across too. The column has a default, so losing it
    # would stamp the reader's whole evening with the day of the upgrade in silence.
    assert when == {label.key((A, B)): "2026-08-11", label.key((D, E)): "2026-08-11"}
    assert tables == {"answer", "person_verdict", "same_person"}


def test_a_re_ask_against_the_old_shape_persists_once_it_has_been_re_keyed(
    tmp_path: Path,
) -> None:
    """The acceptance criterion read from the reader's side: the file they have is
    the old shape, and the sitting that retests them has to leave both answers in
    it."""
    path = tmp_path / "labels.sqlite3"
    one_per_set(path, ANSWERED)

    conn = label.store(path)
    try:
        given(conn, round=4)  # the same set (A, B), asked again
        both = label.answers(conn)
    finally:
        conn.close()

    assert both[label.key((A, B)), 2]["verdict"] == "split"
    assert both[label.key((A, B)), 4]["verdict"] == "accept"


def test_re_keying_happens_once_and_a_second_open_changes_nothing(tmp_path: Path) -> None:
    path = tmp_path / "labels.sqlite3"
    one_per_set(path, ANSWERED)

    label.store(path).close()
    conn = label.store(path)
    try:
        assert label.answers(conn)[label.key((A, B)), 2]["evicted"] == [B]
        assert label._keyed_on(conn) == label.KEY
        # The rebuild renames the old table aside and drops it, so a leftover copy
        # would show up here -- and a second rebuild would drop the first's rows.
        assert {
            row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        } == {"answer", "person_verdict", "same_person"}
    finally:
        conn.close()


def test_a_file_from_before_rounds_existed_is_stamped_and_re_keyed_at_once(
    tmp_path: Path, capsys
) -> None:
    """Two widenings are owed by one file, and it says both. A table that has just
    gained `round` is still keyed on the members alone, and a reader whose file was
    rebuilt under them should be told so rather than told only the last of it."""
    path = tmp_path / "labels.sqlite3"
    roundless(
        path,
        [(label.key((A, B)), "Lumix", f'["{C}"]', 2, "accept", "[]", "[]", "2026-08-10")],
    )

    conn = label.store(path)
    try:
        said = capsys.readouterr().out
        assert label.answers(conn)[label.key((A, B)), 1]["surrounding"] == [C]
        assert label._keyed_on(conn) == label.KEY
        given(conn, round=4)
        assert len(label.answers(conn)) == 2
    finally:
        conn.close()

    assert "as round one and reasons unknown" in said
    assert "onto a key that keeps a re-ask" in said


def test_carrying_over_happens_once_and_a_second_open_changes_nothing(tmp_path: Path) -> None:
    path = tmp_path / "labels.sqlite3"
    older(path, [(label.key((A, B)), "Lumix", C, None, 2, "accept", "[]", "[]", "2026-08-09")])

    label.store(path).close()
    conn = label.store(path)
    try:
        carried = label.answers(conn)
        tables = {
            row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        }
    finally:
        conn.close()

    assert carried[label.key((A, B)), 1]["surrounding"] == [C]
    # Every mode's table and nothing else: the widening renames the old `answer`
    # aside and drops it, so a leftover copy beside the real one would show up here.
    assert tables == {"answer", "person_verdict", "same_person"}
