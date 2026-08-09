"""Tests for the labelling harness's sampling, and for where its answers go.

The harness is scaffolding with a stated end of life, so this file is
deliberately narrow: what is under test is the part ticket 33 says is worth
testing -- the pure functions over Match scores that decide which sets the
reader is shown -- plus the one thing a reader would lose if it were wrong,
which is an answer already given.

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


def test_only_so_much_of_the_run_is_carried() -> None:
    """A run this fence admits reaches 1,435 frames, and the widening key stops
    long before that."""
    run = [sha_of(str(n)) for n in range(30)]
    asked = label.questions(
        [("Lumix", shot(run))],
        {(run[14], run[15]): HIGH},
        context=3,
    )

    assert len(asked) == 1
    assert len(asked[0].before) == 3
    assert len(asked[0].after) == 3


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


# --- spreading the reader's time -----------------------------------------


def asking(camera: str, margin: int, seed: str) -> Question:
    return Question(
        camera=camera, members=(sha_of(seed),), before=(), after=(), margin=margin
    )


def test_the_least_decisive_sets_come_first() -> None:
    late = asking("Lumix", 9, "a")
    early = asking("Lumix", 1, "b")

    assert label.spread([late, early], 2) == [early, late]


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


def given(conn, **marks) -> None:
    label.record(
        conn, ASKED, **{"shown": 1, "evicted": (), "included": (), "unsure": False, **marks}
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


def test_an_answer_records_which_frames_outside_the_stack_were_on_screen() -> None:
    """Ticket 34 turns on this: `accept` says the frames the reader was shown are
    right, and never that the stack is complete. A strictness that pulls in a
    frame they never saw is not contradicting them."""
    conn = label.store(Path(":memory:"))
    try:
        label.record(conn, ASKED, shown=1, evicted=(), included=(), unsure=False)
        narrow = label.answers(conn)[label.key((A, B))]["surrounding"]
        label.record(conn, ASKED, shown=2, evicted=(), included=(), unsure=False)
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


def test_a_labels_file_from_before_the_view_could_widen_is_refused(tmp_path: Path) -> None:
    """It records one neighbour each side, which is a different claim from what
    was on screen. There is no migration machinery here on purpose, so this says
    what is at stake rather than quietly rewriting the reader's answers."""
    path = tmp_path / "labels.sqlite3"
    old = sqlite3.connect(path)
    old.execute(
        "CREATE TABLE answer (members TEXT PRIMARY KEY, camera TEXT, before_sha TEXT,"
        " after_sha TEXT, margin INTEGER, verdict TEXT, evicted TEXT, included TEXT)"
    )
    old.execute("INSERT INTO answer VALUES ('x', 'Lumix', NULL, NULL, 1, 'accept', '[]', '[]')")
    old.commit()
    old.close()

    with pytest.raises(label.LabelsRefused, match="1 answer"):
        label.store(path)
