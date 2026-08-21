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
    round=1,
) -> dict:
    """One row of `labels.sqlite3`, in the shape `label.answers` hands it over."""
    return {
        "members": list(members),
        "camera": camera,
        "verdict": verdict,
        "evicted": list(evicted),
        "included": list(included),
        "surrounding": list(surrounding),
        "round": round,
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


# --- the two rounds -----------------------------------------------------------


def test_a_label_says_which_round_asked_it() -> None:
    case = calibrate.case(answer([B, C], round=2), (A, B, C))

    assert case.round == 2


def test_the_rounds_are_split_earliest_first_and_never_pooled() -> None:
    """ADR 0003's second round is a check on the setting the first one chose, and a
    check pooled into the evidence would be voting for the thing it is checking."""
    first = calibrate.case(answer([B, C], round=1), (A, B, C))
    second = calibrate.case(answer([A, B], round=2), (A, B, C))
    third = calibrate.case(answer([A, C], round=2), (A, B, C))

    split = calibrate.rounds([second, first, third])

    assert list(split) == [1, 2]
    assert [case.name for case in split[1]] == [first.name]
    assert len(split[2]) == 2


def test_a_labels_file_holding_only_a_later_round_still_has_evidence_in_it() -> None:
    """Earliest and not "round 1": a file that starts at round two says which round
    it is rather than reporting no evidence at all."""
    only = calibrate.case(answer([B, C], round=2), (A, B, C))

    assert list(calibrate.rounds([only])) == [2]


def test_the_check_prices_the_chain_even_when_the_run_set_it_aside() -> None:
    """`--linkage` says which rules may be chosen, and ADR 0003's own recorded
    command excludes the chain. A check that read that as licence not to score it
    would drop round two's whole point."""
    case = calibrate.case(answer([B, C], surrounding=[A, D], round=2), (A, B, C, D))
    points = scores(ab=LOW, ac=LOW, ad=LOW, bc=HIGH, bd=LOW, cd=HIGH)

    said = "\n".join(
        calibrate.check(2, [case], points, calibrate.Setting(STRICT, "majority"))
    )

    assert "neighbour" in said
    assert "does not beat majority linkage here" in said


def test_the_check_names_the_cases_each_rule_gets_wrong_and_not_only_the_chosen_one() -> None:
    """Counting the chain's mistakes says a chain is worse; naming them says which
    run it walked out of. Round two is drawn where a chain crosses a boundary, so
    the case it crosses in is the finding and the count is only its size.

    Here the chosen rule reproduces every label and only the chain is wrong, so a
    check that named the chosen rule's cases alone would name nothing at all."""
    case = calibrate.case(answer([B, C], surrounding=[A, D], round=2), (A, B, C, D))
    points = scores(ab=LOW, ac=LOW, ad=LOW, bc=HIGH, bd=LOW, cd=HIGH)

    said = "\n".join(
        calibrate.check(2, [case], points, calibrate.Setting(STRICT, "majority"))
    )
    chain = said.split(f"neighbour at {STRICT}")[-1]

    assert f"neighbour at {STRICT}" in said
    assert case.name in chain
    assert "2 wrongly stacked, strongest at" in chain
    assert "nothing -- it reproduces every label it was shown" in said


def test_the_chain_being_the_chosen_rule_is_asked_the_floor_and_not_a_tautology() -> None:
    """Under an 85% floor the chain can be what wins, and then "does the chain beat
    the chain" is not a question. What these sets can still answer is whether it
    clears the floor on the population drawn to break it."""
    case = calibrate.case(answer([B, C], surrounding=[A, D], round=1), (A, B, C, D))
    points = scores(ab=LOW, ac=LOW, ad=LOW, bc=HIGH, bd=LOW, cd=HIGH)
    scored = calibrate.sweep([case], points, (STRICT,), tuple(calibrate.LINKAGE))

    said = "\n".join(calibrate.chained(scored, calibrate.Setting(STRICT, "neighbour")))

    assert "the chain is the chosen rule" in said
    assert "does not beat" not in said
    # 1 pair kept and 2 wrongly stacked here, so it falls under any usable floor.
    assert "under the 85% floor it was chosen to clear" in said


def test_the_chain_is_priced_against_the_rule_the_setting_chose() -> None:
    """What round two exists for. On these labels the chain reaches a frame the
    reader pushed out and "matches most members" does not, so it no longer beats it
    -- which is the measurement round one could not make."""
    case = calibrate.case(answer([B, C], surrounding=[A, D]), (A, B, C, D))
    points = scores(ab=LOW, ac=LOW, ad=LOW, bc=HIGH, bd=LOW, cd=HIGH)
    chosen = calibrate.Setting(STRICT, "majority")
    scored = calibrate.sweep([case], points, (STRICT,), tuple(calibrate.LINKAGE))

    said = "\n".join(calibrate.chained(scored, chosen))

    assert scored[chosen].wrongly_together == 0
    assert scored[calibrate.Setting(STRICT, "neighbour")].wrongly_together == 2
    assert "does not beat majority linkage here" in said


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


# --- the floor, which moved ---------------------------------------------------


def test_the_floor_is_85_percent_and_lets_through_what_95_would_not() -> None:
    """The reader browsed the 95% result and reported both that they saw no wrong
    merges and that the previous grouping was better, which says the floor was set
    above the evidence and the recall it bought is the complaint. So a setting at
    90% precision now answers, and under the old floor it could not."""
    loose = calibrate.Tally(together=9, wrongly_together=1, missed=2)
    strict = calibrate.Tally(together=3, wrongly_together=0, missed=8)
    scored = {
        calibrate.Setting(5, "complete"): loose,
        calibrate.Setting(20, "complete"): strict,
    }

    assert calibrate.PRECISION == 0.85
    assert calibrate.choose(scored) == calibrate.Setting(5, "complete")
    assert calibrate.choose(scored, floor=0.95) == calibrate.Setting(20, "complete")


def test_the_worst_single_case_breaks_a_tie_towards_the_setting_that_scatters() -> None:
    """A wrong frame in a stack of twelve is a shrug and a stack of nine holding
    four unrelated photographs is what the complaint was about, so two settings
    the labels cannot separate on recall are separated on where the errors fell."""
    scattered = calibrate.Tally(
        together=18,
        wrongly_together=2,
        missed=0,
        wrong={
            "one": [calibrate.Wrong("wrongly together", A, B, 30)],
            "two": [calibrate.Wrong("wrongly together", C, D, 30)],
        },
    )
    concentrated = calibrate.Tally(
        together=18,
        wrongly_together=2,
        missed=0,
        wrong={
            "one": [
                calibrate.Wrong("wrongly together", A, B, 30),
                calibrate.Wrong("wrongly together", A, C, 30),
            ]
        },
    )

    assert scattered.concentration == 1
    assert concentrated.concentration == 2
    assert (scattered.precision, scattered.recall) == (
        concentrated.precision,
        concentrated.recall,
    )
    chosen = calibrate.choose(
        {
            calibrate.Setting(5, "complete"): scattered,
            calibrate.Setting(6, "complete"): concentrated,
        }
    )

    assert chosen == calibrate.Setting(5, "complete")


def test_a_hair_less_recall_still_loses_to_scattered_errors() -> None:
    """"Within a hair" and not "equal": recall is continuous, an exact tie between
    two thresholds never happens, and a tie-break waiting for one never fires. The
    band is `HAIR` wide because the five longest sets carry most of the pairs a
    round keeps together, so the third figure of a recall is which bursts the
    sampler dealt rather than the threshold."""
    greedy = calibrate.Tally(  # the best recall, and every error in one stack
        together=1000,
        wrongly_together=100,
        missed=5,
        wrong={"one": [calibrate.Wrong("wrongly together", A, B, 30)] * 100},
    )
    careful = calibrate.Tally(  # half a point behind, and its errors scattered
        together=995,
        wrongly_together=10,
        missed=10,
        wrong={
            str(index): [calibrate.Wrong("wrongly together", A, B, 30)]
            for index in range(10)
        },
    )
    scored = {
        calibrate.Setting(4, "majority"): greedy,
        calibrate.Setting(10, "majority"): careful,
    }

    assert greedy.recall > careful.recall
    assert greedy.recall - careful.recall < calibrate.HAIR
    assert calibrate.choose(scored) == calibrate.Setting(10, "majority")


def test_a_setting_further_than_a_hair_behind_does_not_get_to_argue() -> None:
    """The band is a tolerance and not a licence: recall still ranks, and a
    setting that gives up real recall for a tidier worst case has made the trade
    this report exists to show rather than won a tie-break."""
    best = calibrate.Tally(
        together=90,
        wrongly_together=9,
        missed=10,
        wrong={"one": [calibrate.Wrong("wrongly together", A, B, 30)] * 9},
    )
    timid = calibrate.Tally(together=50, wrongly_together=0, missed=50)

    chosen = calibrate.choose(
        {
            calibrate.Setting(4, "majority"): best,
            calibrate.Setting(30, "majority"): timid,
        }
    )

    assert best.recall - timid.recall > calibrate.HAIR
    assert chosen == calibrate.Setting(4, "majority")


def test_a_missed_pair_is_not_concentration() -> None:
    """A case that misses everything is a stack drawn small, which is the failure
    the reader is asking for less of rather than the one being counted here."""
    timid = calibrate.Tally(
        together=1,
        missed=3,
        wrong={"one": [calibrate.Wrong("missed", A, B, 3)] * 3},
    )

    assert timid.concentration == 0


# --- both counting conventions ------------------------------------------------


def test_a_pair_two_answers_mention_is_two_mentions_and_one_pair() -> None:
    """The two rounds partition a run differently and their sets overlap, so a
    long burst arrives quadratically under one convention and once under the
    other. Both are printed because neither is the whole picture."""
    run = (A, B, C, D)
    points = scores(ab=HIGH, ac=HIGH, ad=LOW, bc=HIGH, bd=LOW, cd=LOW)
    both = [
        calibrate.case(answer([A, B, C]), run),
        calibrate.case(answer([A, B, C], surrounding=[D]), run),
    ]

    tally = replay(both, points, STRICT)

    # Three pairs of the burst, mentioned by two answers each.
    assert tally.together == 6
    assert tally.once.together == 3
    assert tally.precision == tally.once.precision == 1.0


def test_the_table_prints_both_conventions_and_the_worst_case() -> None:
    case = calibrate.case(answer([B, C], surrounding=[A]), (A, B, C))
    points = scores(ab=HIGH, ac=HIGH, bc=HIGH)

    printed = "\n".join(
        calibrate.table(calibrate.sweep([case], points, (STRICT,), ("complete",)), 1)
    )

    assert "per answer" in printed and "per pair" in printed
    assert "worst" in printed


# --- the held-back quarter ----------------------------------------------------


def trio(index: int) -> tuple[str, str, str]:
    """Three frames of a run of their own, so no two answers share a photograph."""
    return tuple(sha_of(f"{index:02d}{letter}") for letter in "xyz")


def sitting(count: int, *, round: int = 3) -> list:
    """`count` answers, each one a two-frame stack with a neighbour beside it."""
    return [
        calibrate.case(
            answer([x, y], surrounding=[z], round=round), (x, y, z)
        )
        for x, y, z in (trio(index) for index in range(count))
    ]


def told(cases, *, wrong_in) -> dict:
    """Scores that draw every stack as the reader drew it, except where told not to.

    A case named in `wrong_in` gets a neighbour that agrees with both members, so
    every setting stacks a frame the reader pushed out. That is the poison: it is
    a precision failure and nothing else.
    """
    poisoned = {case.name for case in wrong_in}
    points: dict[tuple[str, str], int] = {}
    for case in cases:
        x, y, z = case.run
        points[(x, y)] = HIGH
        points[(x, z)] = points[(y, z)] = HIGH if case.name in poisoned else LOW
    return points


def test_the_held_back_slice_is_the_same_on_every_run() -> None:
    """A stable hash of the answer's own key, so re-running the report cannot
    quietly re-roll the slice until it agrees with the pick."""
    cases = sitting(40)

    first = calibrate.partition(cases)
    again = calibrate.partition(cases)

    assert [case.name for case in first[0]] == [case.name for case in again[0]]
    assert [case.name for case in first[1]] == [case.name for case in again[1]]
    assert first[0] and first[1]  # both slices exist at this size
    assert len(first[0]) + len(first[1]) == 40


def test_the_slice_turns_on_the_frames_and_not_on_what_the_reader_said() -> None:
    """The key is the stack as it was drawn. An answer moving from accept to split
    is the same question answered differently, not a different question."""
    x, y, z = trio(0)
    accepted = calibrate.case(answer([x, y], surrounding=[z]), (x, y, z))
    split = calibrate.case(
        answer([x, y], surrounding=[z], evicted=[y], verdict="split", camera="Nikon"),
        (x, y, z),
    )

    assert calibrate.held_back(accepted) == calibrate.held_back(split)


def test_the_pick_comes_from_the_choosing_slice_and_the_checking_slice_only_checks(
    capsys,
) -> None:
    """The confirmation a second sitting used to provide. The held-back quarter is
    poisoned here, so pooling it would drop precision under the floor and change
    the answer -- and the report still returns what the choosing slice said, and
    prints the check as a failure rather than re-choosing from it."""
    cases = sitting(40)
    choosing, checking = calibrate.partition(cases)
    points = told(cases, wrong_in=checking)

    chosen = calibrate.report(cases, points, [], strictnesses=(STRICT,))

    printed = capsys.readouterr().out
    assert chosen == calibrate.Setting(STRICT, "complete")
    assert calibrate.replay(choosing, points, STRICT, calibrate.LINKAGE["complete"]).precision == 1.0
    assert "held-back quarter" in printed
    assert "fails its own check" in printed


def test_a_pick_that_is_not_the_best_recall_says_so_and_says_what_beat_it(
    capsys,
) -> None:
    """The tie-break can hand back a setting a hair behind the top one, so the line
    under the pick must not claim it is the best recall -- a reader comparing that
    line against the table has to be able to see why it lost."""
    scored = {
        calibrate.Setting(4, "majority"): calibrate.Tally(
            together=1000,
            wrongly_together=100,
            missed=5,
            wrong={"one": [calibrate.Wrong("wrongly together", A, B, 30)] * 100},
        ),
        calibrate.Setting(10, "majority"): calibrate.Tally(
            together=995,
            wrongly_together=10,
            missed=10,
            wrong={
                str(index): [calibrate.Wrong("wrongly together", A, B, 30)]
                for index in range(10)
            },
        ),
    }
    chosen = calibrate.choose(scored)
    assert chosen == calibrate.Setting(10, "majority")

    calibrate.report_choice(scored, chosen, calibrate.PRECISION)
    printed = capsys.readouterr().out

    assert "not the best recall" in printed
    # What it gave up and what it bought: the top recall it is behind, and its own
    # worst case against the hundred-in-one-stack the top setting carries.
    assert "99.5%" in printed
    assert scored[calibrate.Setting(4, "majority")].concentration == 100
    assert "1 wrongly stacked in its worst case" in printed


def test_a_pick_the_held_back_quarter_agrees_with_is_printed_as_checking_out(
    capsys,
) -> None:
    cases = sitting(40)

    chosen = calibrate.report(cases, told(cases, wrong_in=[]), [], strictnesses=(STRICT,))

    assert chosen == calibrate.Setting(STRICT, "complete")
    assert "the pick checks out" in capsys.readouterr().out


# --- which round chooses ------------------------------------------------------


def test_the_newest_round_chooses_and_the_earlier_ones_are_replayed_as_checks(
    capsys,
) -> None:
    """Rounds one and two answered a stricter question under a 95% floor, so they
    can no longer be the source of the choice. They are replayed and never voted
    with -- here they are poisoned outright and the pick is unmoved."""
    newest = sitting(40, round=3)
    earlier = [
        calibrate.case(answer(case.members, surrounding=case.run[2:], round=1), case.run)
        for case in sitting(40)[:8]
    ]
    points = told(newest, wrong_in=[])

    chosen = calibrate.report([*earlier, *newest], points, [], strictnesses=(STRICT,))

    printed = capsys.readouterr().out
    assert chosen == calibrate.Setting(STRICT, "complete")
    assert "round 3, the evidence the setting is chosen from" in printed
    assert "round 1, a check on complete linkage" in printed


def test_too_few_answers_is_a_refusal_with_the_count_and_never_a_choice(capsys) -> None:
    """A sitting this short is settled by a handful of long bursts rather than by
    the library, so the honest output is to say how many there were."""
    cases = sitting(8)
    choosing, _ = calibrate.partition(cases)

    chosen = calibrate.report(cases, told(cases, wrong_in=[]), [], strictnesses=(STRICT,))

    printed = capsys.readouterr().out
    assert chosen is None
    assert f"{len(choosing)} confident answers" in printed
    assert f"{calibrate.ENOUGH} is the least this report will choose from" in printed
