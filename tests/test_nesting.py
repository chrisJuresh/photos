"""The nesting rule priced against the clustering under it.

`harness.nesting` is the third report of the shape `harness.floor` set: a knob, the
reader's own answers, and permission to conclude that the knob does not work. What
is new is the subject. The other two price a threshold against boxes and verdicts;
this one prices it against **what ADR 0004's rule would do to the grid** -- the
stacks it would split where every frame holds somebody, which is the part of the
split count a clustering can move at all.

So the cases that matter most here are the rule itself -- the reader's worked
example, verbatim, as ADR 0004 says it must be -- and the report's ability to say
*no looser threshold helps* rather than hand back the value that splits fewest.

`tests/test_recluster.py` is the prior art. Everything here is over synthetic
assignments, shares and stacks: no database, no photograph, no model.
"""

from __future__ import annotations

import ast
from pathlib import Path

import numpy as np

from harness import nesting
from photolib.browse import STACK_SETTING
from photolib.people import FLOOR, THRESHOLD


def sha_of(seed: str) -> str:
    return f"{abs(hash(seed)):064x}"[:64]


# Frames, and the persons in them. A face is named by its frame and its place in
# it, which is `photolib.people.name`.
F1, F2, F3, F4, F5 = (sha_of(f"frame{n}") for n in range(1, 6))
A, B, C, D, E, G = (f"person-{letter}" for letter in "abcdef")


# --- the rule -------------------------------------------------------------------


def test_the_readers_worked_example_nests() -> None:
    """ADR 0004, verbatim: `{A,B,C,D}` contains `{A,B,C}` and `{A,B}`, so the three
    are one stack, and the rule asks nothing more of them than that."""
    assert nesting.nests(
        [frozenset({A, B, C, D}), frozenset({A, B, C}), frozenset({A, B})]
    )


def test_two_frames_with_no_frame_showing_everybody_do_not_nest() -> None:
    """`{A,B}` and `{A,C}` with no `{A,B,C}` present: there is no frame worth
    drawing as the cover of one stack, so there is no stack."""
    assert not nesting.nests([frozenset({A, B}), frozenset({A, C})])


def test_it_is_subset_of_the_cover_and_not_a_strict_chain() -> None:
    """The members need not contain one another, only all fit inside one of them."""
    assert nesting.nests(
        [frozenset({A, B}), frozenset({A, C}), frozenset({A, B, C})]
    )


def test_the_worked_examples_five_photographs_split_and_its_three_do_not() -> None:
    """ADR 0004 says the reader's five-photo example has to stay checkable against
    the rule, and this is it as a question about stacks: the Match proposing all five
    as one is a split, and the three that nest are not."""
    five = [
        frozenset({A, B, C, D}),
        frozenset({A, B, C}),
        frozenset({A, B}),
        frozenset({A, B, E}),
        frozenset({B, G}),
    ]

    assert not nesting.nests(five)
    assert nesting.nests(five[:3])


def test_a_frame_holding_nobody_nests_into_anything() -> None:
    """The empty set is a subset of everything, so a frame with nobody read in it
    never causes a failure by itself. ADR 0004's nobody clause is what would keep it
    out, and that is a body's answer rather than this clustering's."""
    assert nesting.nests([frozenset({A, B}), frozenset()])


# --- each frame's people --------------------------------------------------------


def test_a_frames_people_are_the_persons_whose_faces_reach_the_floor() -> None:
    faces = {A: frozenset({f"{F1}:0", f"{F2}:0"}), B: frozenset({f"{F1}:1"})}
    frames = {f"{F1}:0": F1, f"{F2}:0": F2, f"{F1}:1": F1}

    assert nesting.peopled(faces, frames) == {
        F1: frozenset({A, B}),
        F2: frozenset({A}),
    }


def test_a_frame_whose_every_face_is_under_the_floor_is_simply_absent() -> None:
    """`splits` reads the absence as the empty set -- nobody was read there -- which
    is what keeps the floor applied in one place for both this report and
    `harness.recluster`."""
    faces = nesting.above(
        {A: frozenset({f"{F1}:0"})}, {f"{F1}:0": 0.01}, FLOOR
    )

    assert nesting.peopled(faces, {f"{F1}:0": F1}) == {}


# --- what the rule would do to the grid -----------------------------------------


def test_a_stack_with_no_member_holding_the_rest_splits() -> None:
    split = nesting.splits(
        {"one": [F1, F2]}, {F1: frozenset({A, B}), F2: frozenset({A, C})}
    )

    assert split.stacks == ("one",)
    assert split.everybody == ("one",)
    assert split.frames == 2


def test_a_split_stack_holding_a_frame_with_nobody_is_not_in_the_subject() -> None:
    """The qualifier that takes the nobody clause out of the measurement: what is
    left in `everybody` is the clustering disagreeing with itself."""
    split = nesting.splits(
        {"one": [F1, F2, F3]},
        {F1: frozenset({A}), F2: frozenset({B})},
    )

    assert split.stacks == ("one",)
    assert split.everybody == ()


def test_a_stack_of_one_frame_is_never_a_question() -> None:
    """The rule only ever splits, so a stack with nothing to split from cannot be
    made worse or better by any clustering."""
    split = nesting.splits({"one": [F1]}, {F1: frozenset({A})})

    assert split.stacks == ()
    assert split.frames == 0


def test_the_frames_are_counted_over_the_split_stacks_and_not_the_subject() -> None:
    """#88 quotes the frame count beside the stack count, and it is the figure that
    says how much of the grid the rule is holding apart."""
    split = nesting.splits(
        {"one": [F1, F2], "two": [F3, F4, F5], "three": [F1, F2]},
        {
            F1: frozenset({A, B}),
            F2: frozenset({A, C}),
            F3: frozenset({A, B}),
            F4: frozenset({A}),
            F5: frozenset({A, B}),
        },
    )

    assert split.stacks == ("one", "three")
    assert split.frames == 4


def test_the_stacks_holding_nobody_are_counted_apart() -> None:
    """The scale the report leads with: the rule is a no-op wherever nobody was
    read, so a rate over every stack would say nothing about anything."""
    members = {"one": [F1, F2], "two": [F3, F4], "three": [F5]}

    assert nesting.holding(members, {F1: frozenset({A})}) == 1


# --- what a looser clustering joined --------------------------------------------


def test_a_person_drawing_faces_from_two_standing_persons_is_a_join() -> None:
    groups = nesting.joined(
        {A: frozenset({f"{F1}:0"}), B: frozenset({f"{F2}:0"})},
        {f"{F1}:0": "merged", f"{F2}:0": "merged"},
    )

    assert groups == {"merged": frozenset({A, B})}


def test_a_clustering_that_moved_nothing_joined_nothing() -> None:
    faces = {A: frozenset({f"{F1}:0"}), B: frozenset({f"{F2}:0"})}

    assert nesting.joined(faces, {f"{F1}:0": A, f"{F2}:0": B}) == {}


# --- what a join contests -------------------------------------------------------


def test_two_judged_friends_in_one_person_are_contested_and_not_opposed() -> None:
    """The reader answered *friend* about each cluster separately and neither answer
    claims the two are different individuals -- the case this report is about is
    exactly two clusters of one human. So the count is what a move puts in question,
    never a count of mistakes."""
    contested = nesting.contest(
        {"merged": frozenset({A, B})}, {A: "friend", B: "friend"}
    )

    assert contested.friends == (A, B)
    assert contested.opposed == ()


def test_a_friend_and_a_stranger_in_one_person_are_opposed() -> None:
    """The sharper form: the reader said one is somebody they photographed and the
    other is not, and one verdict cannot stand for both."""
    contested = nesting.contest(
        {"merged": frozenset({A, B})}, {A: "friend", B: "stranger"}
    )

    assert contested.opposed == ("merged",)
    assert contested.friends == (A,)


def test_a_flagged_cluster_that_absorbed_a_judged_person_is_counted() -> None:
    """A cluster already reported as two people taking in a third is the known
    failure getting worse, which is a cost of loosening and never a fix."""
    contested = nesting.contest(
        {"merged": frozenset({A, B})}, {A: nesting.FLAGGED, B: "friend"}
    )

    assert contested.flagged == (A,)
    assert contested.friends == (B,)


def test_a_join_holding_one_judged_person_contests_nothing() -> None:
    """The reader has said nothing about the other cluster, and
    `harness.people.DEFAULT` is what the rule reads instead, so there is no answer
    to contradict."""
    contested = nesting.contest({"merged": frozenset({A, B})}, {A: "friend"})

    assert contested == nesting.Contested((), (), ())


# --- what the sweep recommends --------------------------------------------------


def row(threshold: float, bought: int, friends: int) -> nesting.Row:
    """One sweep row, with only the two counts the recommendation reads.

    The contested count is the one at the floor, which is what `recommend` reads:
    `harness.recluster`'s rule, because a judged person whose every box is under it
    is in no frame's people and no clustering of them moves a stack.
    """
    return nesting.Row(
        threshold=threshold,
        persons=0,
        split=nesting.Split((), (), 0),
        contested=nesting.Contested((), (), ()),
        at_floor=nesting.Contested(("f",) * friends, (), ()),
        bought=("s",) * bought,
        lost=(),
        joins=0,
    )


def test_a_threshold_that_buys_more_than_it_contests_is_recommended() -> None:
    assert (
        nesting.recommend(
            [row(nesting.STANDING, 0, 0), row(0.30, 8, 3), row(0.20, 9, 12)]
        )
        == 0.30
    )


def test_the_tightest_qualifying_threshold_wins() -> None:
    """Loosening is downward, so the value nearest the standing one is the largest:
    a smaller move is a smaller change to the population."""
    assert nesting.recommend([row(0.30, 8, 3), row(0.20, 9, 4)]) == 0.30


def test_a_knob_that_contests_more_than_it_buys_everywhere_is_not_recommended() -> None:
    """The finding this report exists to be able to return, which `harness.floor`
    and `harness.recluster` have each returned before it."""
    assert nesting.recommend([row(0.30, 2, 9), row(0.20, 4, 30)]) is None


def test_a_tighter_threshold_is_never_recommended_from_here() -> None:
    """It splits more and can only make this subject worse, and whether it is worth
    it for the other subject is what `harness.recluster` already answered."""
    assert nesting.recommend([row(0.45, 9, 0)]) is None


# --- the report -----------------------------------------------------------------


MEMBERS = {"one": [F1, F2], "two": [F3, F4]}
FRAMES = {f"{F1}:0": F1, f"{F2}:0": F2, f"{F3}:0": F3, f"{F4}:0": F4}
SHARES = {face: 0.4 for face in FRAMES}
# Two persons in one two-frame stack, so the stack splits: neither frame's people
# contain the other's.
STANDING_FACES = {A: frozenset({f"{F1}:0"}), B: frozenset({f"{F2}:0"})}
FLAT = {f"{F1}:0": A, f"{F2}:0": B}
MERGED = {f"{F1}:0": A, f"{F2}:0": A}


def measured(threshold: float, assignment: dict, given: dict, standing=()) -> nesting.Row:
    return nesting.measure(
        threshold, STANDING_FACES, assignment, given, MEMBERS, FRAMES, SHARES, standing
    )


def test_a_working_knob_is_reported_as_one() -> None:
    standing = measured(nesting.STANDING, FLAT, {})
    rows = [standing, measured(0.30, MERGED, {}, standing.split.everybody)]

    said = "\n".join(nesting.report(rows, 2, 2, 1))

    assert "0.300 **buys back more stacks than it contests answers**" in said
    assert "1 of the 1 split stacks stop splitting" in said


def test_a_knob_that_does_not_work_says_so_and_keeps_the_standing_value() -> None:
    """`harness.floor`'s shape: where the measurement does not support a move the
    recommendation is to change nothing, stated plainly rather than as the least-bad
    value, and it says what is left for #56."""
    standing = measured(nesting.STANDING, FLAT, {A: "friend", B: "friend"})
    rows = [
        standing,
        # The stack still splits and two answered friends have landed together.
        measured(
            0.30,
            {f"{F1}:0": A, f"{F2}:0": B, f"{F3}:0": A, f"{F4}:0": B},
            {A: "friend", B: "friend"},
            standing.split.everybody,
        ),
    ]

    said = "\n".join(nesting.report(rows, 2, 2, 1))

    assert "**no looser threshold**" in said
    assert f"keep the threshold where it stands, {nesting.STANDING}" in said
    assert "a guard on the rule, not a different clustering under it" in said


def test_the_one_contradiction_the_answers_can_show_is_reported_either_way() -> None:
    """Zero opposed is not *loosening is free*: the reader was never asked whether
    two clusters are the same human, so a merge of two friends is unpriced rather
    than priced at nothing, and the report has to say which."""
    standing = measured(nesting.STANDING, FLAT, {A: "friend", B: "stranger"})
    quiet = [standing, measured(0.30, FLAT, {A: "friend", B: "stranger"})]
    loud = [standing, measured(0.30, MERGED, {A: "friend", B: "stranger"})]

    assert "**no value swept puts a friend and a stranger inside one person.**" in (
        "\n".join(nesting.report(quiet, 2, 2, 1))
    )
    said = "\n".join(nesting.report(loud, 2, 2, 1))
    assert "the first value that puts a friend and a stranger inside one person" in said
    assert "unpriced rather than priced at nothing" in said


def test_the_bought_stacks_are_named_so_a_reader_can_find_their_case() -> None:
    """A count says a value helps and the stacks behind it say which photographs, so
    the reader with a run in mind can see where theirs turns."""
    standing = measured(nesting.STANDING, FLAT, {})
    rows = [standing, measured(0.30, MERGED, {}, standing.split.everybody)]

    said = "\n".join(nesting.report(rows, 2, 2, 1))

    assert "bought    where each split stack turns" in said
    assert "              one" in said


def test_a_stack_is_named_at_the_value_it_turns_and_not_again_below_it() -> None:
    """Each looser value recovers a superset of the one above it, so listing them
    whole would print the same stack at every row and bury the line the reader is
    looking for."""
    standing = measured(nesting.STANDING, FLAT, {})
    rows = [
        standing,
        measured(0.30, MERGED, {}, standing.split.everybody),
        measured(0.20, MERGED, {}, standing.split.everybody),
    ]

    said = "\n".join(nesting.report(rows, 2, 2, 1))

    assert said.count("              one") == 1
    assert "            0.300" in said


def test_the_report_leads_with_how_little_of_the_grid_the_rule_touches() -> None:
    rows = [measured(nesting.STANDING, FLAT, {})]

    said = "\n".join(nesting.report(rows, 7995, 3984, 346))

    assert "3,984 of the 7,995 stacks hold more than one frame" in said
    assert "346 of those hold anybody at all at the floor" in said
    assert "a no-op on the other 3,638" in said


def test_nothing_splitting_with_everybody_present_is_nothing_to_measure() -> None:
    """A sweep with no subject is not a sweep that found the threshold good."""
    rows = [
        nesting.measure(
            nesting.STANDING,
            STANDING_FACES,
            FLAT,
            {},
            {"one": [F1, F2]},
            {f"{F1}:0": F1},
            {f"{F1}:0": 0.4},
        )
    ]

    said = "\n".join(nesting.report(rows, 1, 1, 1))

    assert "nothing to measure" in said
    assert "threshold   persons   split" not in said


def test_the_cut_is_priced_beside_the_sweep_and_not_inside_it() -> None:
    """The catalog holds the uncut population and every answer was given about it,
    so the cut is a check that the sweep is not answering a different question."""
    standing = measured(nesting.STANDING, FLAT, {})
    cuts = [measured(nesting.STANDING, MERGED, {})]

    said = "\n".join(nesting.report([standing], 2, 2, 1, cuts))

    assert "moves the subject by -1 stacks at the standing threshold" in said


def test_the_cost_is_counted_over_both_populations() -> None:
    """`harness.recluster`'s two tables in two columns, and its subject rule: the
    second is scored over the judged clusters that reach the floor. A person whose
    every box is under it is in no frame's people before the join or after, so the
    merge changes nothing the rule reads -- and a cost counted only the first way
    would price answers the grid cannot feel."""
    one = nesting.measure(
        0.30,
        STANDING_FACES,
        MERGED,
        {A: "friend", B: "friend"},
        MEMBERS,
        FRAMES,
        {f"{F1}:0": 0.4, f"{F2}:0": 0.01},
    )

    assert one.contested.friends == (A, B)
    assert one.at_floor.friends == ()


def test_a_stack_bought_and_a_stack_lost_are_two_columns() -> None:
    """A value that fixed one stack and broke another would otherwise read as having
    changed nothing."""
    standing = measured(nesting.STANDING, FLAT, {})
    other = nesting.measure(
        0.30,
        STANDING_FACES,
        FLAT,
        {},
        {"two": [F3, F4]},
        {f"{F3}:0": F3, f"{F4}:0": F4},
        {f"{F3}:0": 0.4, f"{F4}:0": 0.4},
        standing.split.everybody,
    )

    assert standing.split.everybody == ("one",)
    assert other.bought == ("one",)
    assert other.lost == ()


# --- what the sweep is, and what it reads ---------------------------------------


def test_the_sweep_starts_where_the_threshold_stands() -> None:
    """So the table's first row is the population the reader was shown, and the
    check below has something to be a check of."""
    assert nesting.SWEEP[0] == nesting.STANDING


def test_the_sweep_runs_below_the_standing_threshold_as_well_as_above() -> None:
    """`harness.recluster` swept upwards only, and the direction that rejoins one
    human read as two is looser. That the sweep goes both ways is this report's
    whole reason to exist."""
    assert [one for one in nesting.SWEEP if one < nesting.STANDING]
    assert [one for one in nesting.SWEEP if one > nesting.STANDING]


def test_a_sweep_of_one_clustering_gives_one_row_per_threshold() -> None:
    # Two vectors a cosine of 0.15 apart: one person only where the threshold is at
    # or below that, which of the values swept is the loosest one alone.
    apart = 0.15
    stored = {
        f"{F1}:0": np.array([1.0, 0.0], dtype=np.float32),
        f"{F2}:0": np.array([apart, (1 - apart**2) ** 0.5], dtype=np.float32),
    }

    rows = nesting.sweep(stored, STANDING_FACES, SHARES, {}, MEMBERS, FRAMES)

    assert len(rows) == len(nesting.SWEEP)
    assert rows[0].threshold == nesting.STANDING
    assert rows[0].persons == 2
    assert min(rows, key=lambda one: one.threshold).persons == 1
    assert [one.persons for one in rows if one.threshold == 0.20] == [2]


def test_the_standing_threshold_and_the_floor_are_read_and_never_copied() -> None:
    """The report prices a move away from where the pass stands, so it has to read
    where the pass stands rather than carry a second copy that could disagree."""
    assert nesting.STANDING is THRESHOLD
    assert nesting.PROVISIONAL is FLOOR


def test_the_walk_is_read_at_the_setting_the_website_draws() -> None:
    """A verdict priced against a grid nobody is looking at is priced against
    nothing, which is why `harness.people.membership` is not a knob either."""
    assert nesting.STACK_SETTING is STACK_SETTING


def test_the_nesting_report_never_names_the_state_database() -> None:
    tree = ast.parse(Path(nesting.__file__).read_text(encoding="utf-8"))
    holders = (ast.Module, ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)
    prose = {
        id(node.body[0].value)
        for node in ast.walk(tree)
        if isinstance(node, holders)
        and node.body
        and isinstance(node.body[0], ast.Expr)
        and isinstance(node.body[0].value, ast.Constant)
        and isinstance(node.body[0].value.value, str)
    }
    said = {
        node.value
        for node in ast.walk(tree)
        if isinstance(node, ast.Constant)
        and isinstance(node.value, str)
        and id(node) not in prose
    }

    assert not [one for one in said if "state.sqlite3" in one]
    assert not [one for one in said if "ATTACH" in one.upper()]
