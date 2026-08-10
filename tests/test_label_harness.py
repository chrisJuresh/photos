"""Tests for the labelling harness's sampling, and for where its answers go.

The harness is scaffolding with a stated end of life, so this file is
deliberately narrow: what is under test is the part tickets 33 and 35 say is
worth testing -- the pure functions over Match scores that decide which sets the
reader is shown, including which round is asking and what a chain would have
walked into each stack -- plus the one thing a reader would lose if it were
wrong, which is an answer already given.

Nothing here starts a server, reads a substrate, or opens a path from
config.toml. Scores are integers written in the test, so every expectation
below is arithmetic against `STRICTNESS` rather than an opinion about a
photograph.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest

from harness import label
from harness.label import STRICTNESS, Question


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


# --- forming the stack the reader is shown -----------------------------------


def test_frames_that_agree_are_one_stack() -> None:
    assert label.link([A, B], scores(ab=HIGH)) == [[A, B]]


def test_frames_that_agree_on_nothing_are_two_stacks() -> None:
    assert label.link([A, B], scores(ab=LOW)) == [[A], [B]]


def test_a_pair_at_the_strictness_holds(   ) -> None:
    """Strictness is a floor and not an exclusive bound, as `browse.py`'s window is."""
    assert label.link([A, B], scores(ab=STRICTNESS)) == [[A, B]]
    assert label.link([A, B], scores(ab=STRICTNESS - 1)) == [[A], [B]]


def test_linkage_is_complete_so_one_disagreement_starts_a_new_stack() -> None:
    """ADR 0003: every pair inside a stack must match, not merely each frame and
    its predecessor. C agrees with B and not with A, so it does not join."""
    assert label.link([A, B, C], scores(ab=HIGH, bc=HIGH, ac=LOW)) == [[A, B], [C]]


def test_a_pair_with_no_row_is_read_as_agreeing_on_nothing() -> None:
    """The screen rejected it or a substrate was missing. Either way the harness
    has no evidence the two frames are one picture, and draws them apart."""
    assert label.link([A, B], {}) == [[A], [B]]


def test_matches_most_members_lets_in_a_frame_complete_linkage_keeps_out() -> None:
    """The softening ADR 0003 left open and its labels chose. Strictly most, so a
    frame agreeing with half a stack does not join: a tie is not most."""
    points = scores(ab=HIGH, bc=HIGH, ac=LOW)

    assert label.majority([A, B], C, points, STRICTNESS) is False  # one of two
    assert label.majority([A, B, C], D, scores(ad=HIGH, bd=HIGH, cd=LOW), STRICTNESS) is True
    assert label.neighbour([A, B], C, points, STRICTNESS) is True  # only B decides


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

    assert label.link([A, B, C, D], points, joins=label.complete) == [[A, B, C], [D]]
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
    assert label.link([A, B, C, D, E], points, joins=label.neighbour) == [
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

    assert label.link([A, B, C, D, E], points, joins=label.neighbour) == [
        [A, B, C, D, E]
    ]
    assert [question.members for question in asked] == [(A, B, C), (D, E)]
    assert asked[0].chain == 2  # D and E, after it
    assert asked[1].chain == 3  # A, B and C, before it


def test_a_set_an_earlier_round_answered_is_not_asked_again() -> None:
    settled = Question(camera="Lumix", members=(A, B), before=(), after=(), margin=0)
    fresh = Question(camera="Lumix", members=(C, D), before=(), after=(), margin=0)

    assert label.unanswered([settled, fresh], {label.key(settled.members)}) == [fresh]


def test_a_stack_that_has_grown_a_frame_is_a_question_the_reader_has_not_seen() -> None:
    """The sets are keyed on the stack as drawn, and round two cuts the runs with a
    different rule. A stack that has gained a member is a different claim, so
    dropping it because it overlaps one already answered would drop the question."""
    grown = Question(camera="Lumix", members=(A, B, C), before=(), after=(), margin=0)

    assert label.unanswered([grown], {label.key((A, B))}) == [grown]


# --- spreading the reader's time -----------------------------------------


def asking(camera: str, margin: int, seed: str, chain: int = 0) -> Question:
    return Question(
        camera=camera,
        members=(sha_of(seed),),
        before=(),
        after=(),
        margin=margin,
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


def test_an_answer_survives_the_harness_being_stopped(tmp_path: Path) -> None:
    path = tmp_path / "labels.sqlite3"
    conn = label.store(path)
    given(conn)
    conn.close()

    reopened = label.store(path)
    try:
        assert label.answers(reopened)[label.key((A, B))]["verdict"] == "accept"
    finally:
        reopened.close()


def test_an_answer_can_be_revised(answers) -> None:
    given(answers)
    given(answers, evicted=(B,))

    stored = label.answers(answers)[label.key((A, B))]
    assert stored["verdict"] == "split"
    assert stored["evicted"] == [B]
    assert len(label.answers(answers)) == 1


def test_an_answer_records_the_stack_it_was_about() -> None:
    """The sample moves when the provisional strictness does, so an answer that
    did not say which frames it was about could not be read afterwards."""
    conn = label.store(Path(":memory:"))
    try:
        given(conn, included=(C,))
        stored = label.answers(conn)[label.key((A, B))]
    finally:
        conn.close()

    assert stored["members"] == [A, B]
    assert stored["included"] == [C]
    assert stored["camera"] == "Lumix"


def test_an_answer_records_which_round_asked_it(answers) -> None:
    """Round two's answers are a check on the setting round one chose, so an answer
    that did not say which round asked it could not be told from the evidence it is
    checking."""
    given(answers, round=2)

    assert label.answers(answers)[label.key((A, B))]["round"] == 2


def test_the_counter_reads_the_round_in_hand(answers) -> None:
    """"How many more are useful" is a question about this sitting, and an earlier
    round's answers are not in the sample at all."""
    given(answers, round=1)

    assert label.answers(answers, 2) == {}
    assert len(label.answers(answers, 1)) == 1
    assert len(label.answers(answers)) == 1  # every round, which is what the report reads


def test_only_an_earlier_round_keeps_a_set_out_of_the_sample(answers) -> None:
    """An answer given in the round in hand comes back with its set so it can be
    revised; a set an earlier round settled is a question already answered."""
    given(answers, round=1)
    label.record(answers, OTHER, shown=1, evicted=(), included=(), unsure=False, round=2)

    assert label.answered_before(answers, 2) == {label.key((A, B))}
    assert label.answered_before(answers, 1) == set()


def test_an_answer_records_which_frames_outside_the_stack_were_on_screen() -> None:
    """Ticket 34 turns on this: `accept` says the frames the reader was shown are
    right, and never that the stack is complete. A strictness that pulls in a
    frame they never saw is not contradicting them."""
    conn = label.store(Path(":memory:"))
    try:
        given(conn, shown=1)
        narrow = label.answers(conn)[label.key((A, B))]["surrounding"]
        given(conn, shown=2)
        wide = label.answers(conn)[label.key((A, B))]["surrounding"]
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

    assert carried[label.key((A, B))]["surrounding"] == [C, D]
    assert carried[label.key((A, B))]["verdict"] == "merge"
    assert carried[label.key((A, B))]["included"] == [C]
    assert carried[label.key((A, B))]["round"] == 1
    # Nothing either side of it, which is a real state and not a missing one.
    assert carried[label.key((D, E))]["surrounding"] == []
    assert carried[label.key((D, E))]["verdict"] == "accept"


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
        # And they are what round two will not ask again.
        settled = label.answered_before(conn, 2)
    finally:
        conn.close()

    assert carried[label.key((A, B))]["round"] == 1
    assert carried[label.key((A, B))]["surrounding"] == [C]
    assert settled == {label.key((A, B))}


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
        stored = label.answers(conn)
    finally:
        conn.close()

    assert stored[label.key((A, B))]["round"] == 1
    assert stored[label.key((C, D))]["round"] == 2


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

    assert carried[label.key((A, B))]["surrounding"] == [C]
    assert tables == {"answer"}
