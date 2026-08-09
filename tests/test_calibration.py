"""Tests for the calibration report -- how a label is read, and how a setting is scored.

The report is the answer to "is it any good", so what is under test is the two
places it could be quietly wrong about the reader.

The first is **what a label says**. An answer is evidence about the frames that
were on screen when it was given and about nothing else, so the scope of every
comparison is `members` union `surrounding` and a frame the reader never saw
cannot become an error. The second is **which errors are which**: precision and
recall are the trade the setting is being chosen for, so they are never blended
and a false positive is never allowed to look like a false negative.

Nothing here starts a server, reads a substrate, or opens a path from
`config.toml`. Match scores are integers written in the test, so every
expectation is arithmetic against a strictness rather than an opinion about a
photograph.
"""

from __future__ import annotations

from harness import calibrate

STRICT = 20
HIGH = STRICT + 40  # agreed on plainly
LOW = 0  # nothing agreed at all


def sha_of(seed: str) -> str:
    """A 64-hex string that reads as a hash without being one."""
    return (seed * 64)[:64]


A, B, C, D, E, F = (sha_of(seed) for seed in "abcdef")


def scores(**pairs: int) -> dict[tuple[str, str], int]:
    """`{"ab": 60}` as `{(sha a, sha b): 60}` -- two-letter keys, in run order."""
    return {(sha_of(early), sha_of(late)): points for (early, late), points in pairs.items()}


def answer(
    members,
    *,
    surrounding=(),
    evicted=(),
    included=(),
    verdict="accept",
    camera="Lumix",
) -> dict:
    """One row of `labels.sqlite3`, in the shape `label.answers` hands it over."""
    return {
        "members": list(members),
        "camera": camera,
        "verdict": verdict,
        "evicted": list(evicted),
        "included": list(included),
        "surrounding": list(surrounding),
    }


# --- what one answer says -----------------------------------------------------


def test_accepting_the_stack_places_the_frames_shown_beside_it_outside() -> None:
    case = calibrate.case(answer([B, C], surrounding=[A, D]), (A, B, C, D))

    assert case.belong == {B, C}
    assert case.apart == {A, D}


def test_evicting_a_member_moves_it_out_of_the_stack() -> None:
    case = calibrate.case(answer([B, C, D], surrounding=[A], evicted=[D]), (A, B, C, D))

    assert case.belong == {B, C}
    assert case.apart == {A, D}


def test_including_a_neighbour_moves_it_into_the_stack() -> None:
    case = calibrate.case(answer([B, C], surrounding=[A, D], included=[D]), (A, B, C, D))

    assert case.belong == {B, C, D}
    assert case.apart == {A}


def test_a_frame_the_reader_never_saw_is_outside_the_scope_entirely() -> None:
    """The window is the harness's and not the reader's. Scoring `E` as one the
    reader placed outside would measure how far they had widened the view."""
    case = calibrate.case(answer([B, C], surrounding=[A, D]), (A, B, C, D, E))

    assert E not in case.belong and E not in case.apart


# --- which pairs a label is evidence about ------------------------------------


def test_two_frames_the_reader_kept_together_are_a_pair_that_should_stack() -> None:
    case = calibrate.case(answer([B, C]), (A, B, C, D))

    assert calibrate.pairs(case) == [(B, C, True)]


def test_a_frame_inside_and_a_frame_outside_are_a_pair_that_should_not() -> None:
    case = calibrate.case(answer([B, C], surrounding=[A]), (A, B, C))

    assert calibrate.pairs(case) == [(B, C, True), (A, B, False), (A, C, False)]


def test_two_frames_the_reader_placed_outside_say_nothing_about_each_other() -> None:
    """The reader said neither joins *this* stack. Whether the two of them are
    one stack between themselves is a question they were never asked."""
    case = calibrate.case(answer([B, C], surrounding=[A, D]), (A, B, C, D))

    assert (A, D, False) not in calibrate.pairs(case)
    assert (A, D, True) not in calibrate.pairs(case)


def test_a_frame_beyond_the_run_is_evidence_about_the_fence_and_not_the_threshold() -> None:
    """The frame past the end of the run is drawn always and cannot join the
    stack at any strictness, so scoring it would be a constant penalty on a
    question the setting does not answer."""
    case = calibrate.case(
        answer([B, C], surrounding=[A, D, F], included=[F]), (A, B, C, D)
    )

    assert case.beyond_in == {F}
    assert [pair for pair in calibrate.pairs(case) if F in pair] == []


# --- the linkage rules --------------------------------------------------------


def test_complete_linkage_wants_every_member_to_agree() -> None:
    points = scores(ab=HIGH, ac=LOW, bc=HIGH)

    assert calibrate.LINKAGE["complete"]([A, B], C, points, STRICT) is False
    assert calibrate.LINKAGE["complete"]([B], C, points, STRICT) is True


def test_neighbour_linkage_wants_only_the_frame_before() -> None:
    points = scores(ab=HIGH, ac=LOW, bc=HIGH)

    assert calibrate.LINKAGE["neighbour"]([A, B], C, points, STRICT) is True


def test_majority_linkage_wants_most_of_the_stack() -> None:
    """ADR 0003's open question: whether complete linkage needs softening to
    "matches most members"."""
    points = scores(ad=HIGH, bd=HIGH, cd=LOW)

    assert calibrate.LINKAGE["majority"]([A, B, C], D, points, STRICT) is True
    assert calibrate.LINKAGE["majority"]([A], D, {}, STRICT) is False


# --- scoring a setting against the labels -------------------------------------


def replay(cases, points, strictness, linkage="complete"):
    return calibrate.replay(cases, points, strictness, calibrate.LINKAGE[linkage])


def test_a_setting_that_draws_what_the_reader_drew_is_right_about_everything() -> None:
    case = calibrate.case(answer([B, C], surrounding=[A, D]), (A, B, C, D))
    points = scores(ab=LOW, ac=LOW, ad=LOW, bc=HIGH, bd=LOW, cd=LOW)

    tally = replay([case], points, STRICT)

    assert (tally.together, tally.wrongly_together, tally.missed) == (1, 0, 0)
    assert tally.precision == 1.0 and tally.recall == 1.0
    assert tally.wrong == {}


def test_a_setting_too_strict_to_bridge_a_pair_misses_it() -> None:
    """The reader said these two frames are one picture and the Match agrees by
    less than the setting asks for. That is a recall failure and never a
    precision one."""
    case = calibrate.case(answer([B, C]), (A, B, C, D))
    points = scores(bc=STRICT - 1)

    tally = replay([case], points, STRICT)

    assert (tally.together, tally.missed) == (0, 1)
    assert tally.recall == 0.0
    assert tally.precision is None  # it claimed nothing, so it was never wrong


def test_a_setting_loose_enough_to_pull_in_a_frame_the_reader_rejected() -> None:
    """The binding constraint: never open a stack and see two unrelated
    photographs."""
    case = calibrate.case(answer([B, C], surrounding=[A]), (A, B, C))
    points = scores(ab=HIGH, ac=HIGH, bc=HIGH)

    tally = replay([case], points, STRICT)

    assert (tally.together, tally.wrongly_together) == (1, 2)
    assert tally.precision == 1 / 3
    assert tally.recall == 1.0


def test_a_setting_names_the_cases_it_gets_wrong() -> None:
    """A setting that scores badly has to be diagnosable, so the report carries
    which labelled stack disagreed and by how much rather than only a count."""
    case = calibrate.case(answer([B, C]), (A, B, C))
    points = scores(bc=STRICT - 5)

    tally = replay([case], points, STRICT)

    (wrong,) = tally.wrong[case.name]
    assert (wrong.kind, wrong.points) == ("missed", STRICT - 5)
    assert {wrong.early, wrong.late} == {B, C}


def test_the_walk_that_places_a_frame_is_the_whole_run_and_not_the_scope() -> None:
    """A frame the forward walk consumed early is why a stack was drawn where it
    was, so replaying only the frames on screen would answer a different
    question from the one the reader was asked."""
    case = calibrate.case(answer([C, D], surrounding=[B]), (A, B, C, D))
    points = scores(ab=HIGH, ac=LOW, ad=LOW, bc=HIGH, bd=HIGH, cd=HIGH)

    tally = replay([case], points, STRICT)

    # B agrees with both members and was still drawn apart, because A took it
    # first. The reader agreed with the split, so this setting is right.
    assert (tally.wrongly_together, tally.missed) == (0, 0)


def test_softening_the_linkage_can_recover_a_frame_complete_linkage_drops() -> None:
    case = calibrate.case(answer([B, C, D], camera="Lumix"), (B, C, D))
    points = scores(bc=HIGH, bd=LOW, cd=HIGH)

    strict = replay([case], points, STRICT, "complete")
    soft = replay([case], points, STRICT, "neighbour")

    assert strict.recall == 1 / 3
    assert soft.recall == 1.0


# --- the reader's certainty ---------------------------------------------------


def test_the_grey_band_is_scored_apart_from_the_labels_the_reader_was_sure_of() -> None:
    """The reader asked for their answers not to be taken as certainty, and the
    way to honour that is to report the two separately rather than to fit to the
    grey band."""
    sure = calibrate.case(answer([B, C]), (A, B, C, D))
    grey = calibrate.case(answer([A, D], verdict="unsure"), (A, D))

    assert sure.confident is True
    assert grey.confident is False
    assert [case.name for case in calibrate.confident([sure, grey])] == [sure.name]
    assert [case.name for case in calibrate.grey([sure, grey])] == [grey.name]


# --- choosing --------------------------------------------------------------


def test_precision_is_the_binding_constraint_and_recall_is_best_effort_under_it() -> None:
    exact = calibrate.Tally(together=1, wrongly_together=0, missed=1)
    greedy = calibrate.Tally(together=4, wrongly_together=1, missed=0)

    chosen = calibrate.choose(
        {
            calibrate.Setting(10, "complete"): greedy,
            calibrate.Setting(20, "complete"): exact,
        }
    )

    assert chosen == calibrate.Setting(20, "complete")


def test_a_tie_is_broken_towards_the_stricter_setting() -> None:
    """Two settings the labels cannot tell apart are not equally safe on the
    frames nobody labelled, and precision is the constraint that carries."""
    tally = calibrate.Tally(together=2, wrongly_together=0, missed=0)

    chosen = calibrate.choose(
        {calibrate.Setting(5, "complete"): tally, calibrate.Setting(12, "complete"): tally}
    )

    assert chosen == calibrate.Setting(12, "complete")


def test_recall_decides_between_the_settings_that_clear_the_floor() -> None:
    """Precision is a floor and not a ranking. Ordering on it alone hands back
    the corner of the sweep, where a setting stacks almost nothing and is
    therefore almost never wrong."""
    timid = calibrate.Tally(together=1, wrongly_together=0, missed=9)
    useful = calibrate.Tally(together=19, wrongly_together=1, missed=0)

    chosen = calibrate.choose(
        {
            calibrate.Setting(100, "complete"): timid,
            calibrate.Setting(20, "complete"): useful,
        },
        floor=0.95,
    )

    assert chosen == calibrate.Setting(20, "complete")


def test_no_setting_clearing_the_floor_is_no_recommendation() -> None:
    """Saying so is the honest answer; picking the least bad one silently is not."""
    poor = calibrate.Tally(together=8, wrongly_together=2, missed=0)

    assert calibrate.choose({calibrate.Setting(20, "complete"): poor}, floor=0.95) is None


def test_the_frontier_drops_a_setting_beaten_on_both_counts() -> None:
    better = calibrate.Setting(10, "complete")
    beaten = calibrate.Setting(30, "complete")

    front = calibrate.frontier(
        {
            better: calibrate.Tally(together=8, wrongly_together=0, missed=2),
            beaten: calibrate.Tally(together=4, wrongly_together=2, missed=6),
        }
    )

    assert front == [better]


def test_a_setting_that_claims_nothing_is_not_chosen() -> None:
    """Precision is undefined rather than perfect when a setting stacks nothing
    at all, and a report that read it as 100% would recommend the useless one."""
    silent = calibrate.Tally(together=0, wrongly_together=0, missed=3)
    useful = calibrate.Tally(together=2, wrongly_together=0, missed=1)

    chosen = calibrate.choose(
        {
            calibrate.Setting(90, "complete"): silent,
            calibrate.Setting(20, "complete"): useful,
        }
    )

    assert chosen == calibrate.Setting(20, "complete")
