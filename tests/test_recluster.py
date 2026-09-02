"""Re-clustering priced against the answers the reader could not give.

ADR 0004's fourth answer, `two-people`, was put there so a clustering failure would
be visible instead of being forced into a judgement about somebody, and a third of
the reader's first sitting came back flagged. `harness.recluster` is the measurement
that decides what to do about it: whether a tighter threshold takes those clusters
apart, and what it costs on the other side in friends the reader has already said
are one person.

The report has one question and, like `harness.floor`'s, it is allowed to answer no:
*does any threshold buy more of the failure than it breaks of the answers?* So the
case that matters most here is the one where both populations come apart together --
the report must say the knob does not work rather than hand back the value that
splits the most.

`tests/test_floor.py` is the prior art. Everything here is over synthetic
assignments and shares: no database, no photograph, no model.
"""

from __future__ import annotations

import ast
from pathlib import Path

import numpy as np

from harness import recluster, same
from photolib.people import FLOOR, THRESHOLD


def sha_of(seed: str) -> str:
    return f"{abs(hash(seed)):064x}"[:64]


A, B, C, D = (sha_of(letter) for letter in "abcd")

# A face is named by its frame and its place in it, which is `people.name`.
A0, A1, B0, B1, C0, D0 = f"{A}:0", f"{A}:1", f"{B}:0", f"{B}:1", f"{C}:0", f"{D}:0"


# --- what a clustering holds ---------------------------------------------------


def test_an_assignment_reads_as_each_persons_own_faces() -> None:
    """The seam every measurement here is over: a clustering is stored as a face's
    person and every question asked of it is about a person's faces."""
    assert recluster.held({A0: A0, B0: A0, C0: C0}) == {
        A0: frozenset({A0, B0}),
        C0: frozenset({C0}),
    }


def test_only_the_faces_that_reach_the_floor_are_the_ones_the_rule_reads() -> None:
    """A face under the floor is in no frame's people, so a person made only of
    them cannot change a stack whatever the clustering says about them."""
    faces = recluster.above(
        {A0: frozenset({A0, B0}), C0: frozenset({C0})},
        {A0: 0.4, B0: 0.01, C0: 0.02},
        0.10,
    )

    assert faces == {A0: frozenset({A0}), C0: frozenset()}
    assert recluster.reaching(faces) == {A0}


# --- what a tighter threshold did ----------------------------------------------


def test_a_cluster_whose_faces_land_in_two_persons_came_apart() -> None:
    came = recluster.came(
        {A0: frozenset({A0, B0})}, {A0: A0, B0: B0}, [A0]
    )

    assert came.apart == (A0,)
    assert came.whole == ()
    assert came.parts == 2


def test_a_cluster_still_one_person_is_whole_and_counted_as_no_parts() -> None:
    came = recluster.came({A0: frozenset({A0, B0})}, {A0: A0, B0: A0}, [A0])

    assert came.whole == (A0,)
    assert came.apart == ()
    assert came.parts == 0


def test_the_parts_are_the_persons_they_became_and_not_the_clusters_that_split() -> None:
    """User story 1 asks how many parts, not how many split: a cluster that is
    really four passers-by is answerable when it becomes four and not when it
    becomes two."""
    came = recluster.came(
        {A0: frozenset({A0, B0, C0}), B1: frozenset({B1, D0})},
        {A0: A0, B0: B0, C0: C0, B1: B1, D0: B1},
        [A0, B1],
    )

    assert came.apart == (A0,)
    assert came.parts == 3


def test_a_cluster_whose_every_face_was_dropped_is_gone_and_not_whole() -> None:
    """What a size cut does rather than what a threshold does. A cluster with no
    face left is not one person, it is no longer a question at all, and counting it
    as whole would report the cut as having failed where it has succeeded."""
    came = recluster.came({A0: frozenset({A0, B0})}, {C0: C0}, [A0])

    assert came.gone == (A0,)
    assert came.whole == ()
    assert came.apart == ()


def test_a_subject_that_is_not_in_the_clustering_at_all_is_gone() -> None:
    assert recluster.came({}, {A0: A0}, [B0]).gone == (B0,)


def test_the_subjects_are_named_in_a_stated_order() -> None:
    """Named and not merely counted, which is `harness.floor`'s rule: a count says
    a threshold is bad and the persons behind it say why. Sorted, so two runs of
    the report print the same list."""
    came = recluster.came(
        {C0: frozenset({C0, A1}), A0: frozenset({A0, B0})},
        {C0: C0, A1: A1, A0: A0, B0: B0},
        [C0, A0],
    )

    assert came.apart == tuple(sorted((A0, C0)))


# --- whether the tighter population is a refinement ----------------------------


def test_a_tighter_threshold_that_only_splits_crosses_nothing() -> None:
    assert (
        recluster.crossed({A0: frozenset({A0, B0})}, {A0: A0, B0: B0}) == []
    )


def test_a_person_drawing_faces_from_two_standing_persons_is_a_crossing() -> None:
    """Complete linkage should give a nested dendrogram, so a tighter threshold
    should only ever split. This is the check that it did, rather than the
    assumption -- a crossing means the report is comparing two clusterings that are
    not one refining the other, and the parts counts would not mean what they say."""
    crossings = recluster.crossed(
        {A0: frozenset({A0}), B0: frozenset({B0})}, {A0: A0, B0: A0}
    )

    assert crossings == [A0]


# --- what the sweep recommends -------------------------------------------------


def row(threshold: float, apart: int, fragmented: int) -> recluster.Row:
    """One sweep row, with only the two counts the recommendation reads."""
    return recluster.Row(
        threshold=threshold,
        persons=0,
        flagged=recluster.Came(apart=("x",) * apart, whole=(), gone=(), parts=0),
        friends=recluster.Came(apart=("y",) * fragmented, whole=(), gone=(), parts=0),
        crossings=0,
    )


def test_a_threshold_that_takes_more_apart_than_it_breaks_is_recommended() -> None:
    assert (
        recluster.recommend(
            [row(recluster.STANDING, 0, 0), row(0.45, 8, 3), row(0.50, 9, 12)]
        )
        == 0.45
    )


def test_the_loosest_qualifying_threshold_wins() -> None:
    """A smaller move is a smaller change to the population, so where two values
    both buy more than they break the one nearer the standing value is the one to
    move to."""
    assert recluster.recommend([row(0.45, 8, 3), row(0.50, 9, 4)]) == 0.45


def test_a_knob_that_breaks_more_than_it_buys_everywhere_is_not_recommended() -> None:
    """The finding this report exists to be able to return. A friend that came
    apart is the reader's own answer being contradicted and a flagged cluster
    coming apart is the failure being fixed, so a value that does more of the first
    than the second is not an improvement however many clusters it splits."""
    assert recluster.recommend([row(0.45, 6, 22), row(0.50, 8, 32)]) is None


def test_the_standing_threshold_is_never_the_recommendation_to_move_to() -> None:
    """It splits nothing by definition -- it is what the flagged clusters were
    flagged at -- so it can never buy more than it breaks and must fall out of the
    running rather than be returned as a move."""
    assert recluster.recommend([row(recluster.STANDING, 0, 0)]) is None


# --- what a looser threshold rejoins -------------------------------------------
#
# The other side of the same knob, and the evidence the upward sweep did not have:
# `two-people` marks a cluster holding two humans and says nothing about one human
# split in two, so a loosening could only ever be scored on the damage it does.


def looser(threshold: float, rejoined: int, merged: int) -> recluster.Looser:
    """One row of the downward sweep, with only the two counts it is read on."""
    return recluster.Looser(
        threshold=threshold,
        persons=0,
        joined=same.Rejoining(
            rejoined=tuple((f"one{n}", f"other{n}") for n in range(rejoined)),
            merged=tuple((f"two{n}", f"more{n}") for n in range(merged)),
        ),
    )


def test_a_threshold_that_rejoins_more_than_it_merges_is_recommended() -> None:
    assert (
        recluster.loosen(
            [looser(recluster.STANDING, 0, 0), looser(0.32, 7, 2), looser(0.28, 9, 11)]
        )
        == 0.32
    )


def test_the_tightest_qualifying_looser_threshold_wins() -> None:
    """`recommend`'s "a smaller move is a smaller change to the population", in this
    direction: coming down from where it stands, the smallest move is the largest
    number."""
    assert recluster.loosen([looser(0.34, 7, 2), looser(0.28, 9, 3)]) == 0.34


def test_a_loosening_that_merges_more_than_it_rejoins_everywhere_is_not_recommended() -> None:
    """A human put back together is what a loosening buys and two humans collapsed
    is the reader's own answer being contradicted, so a value that does more of the
    second is not an improvement however many humans it rejoins."""
    assert recluster.loosen([looser(0.32, 3, 9), looser(0.28, 5, 20)]) is None


def test_the_standing_threshold_is_never_a_loosening_to_move_to() -> None:
    """By construction every judged pair is two persons there -- it is the
    population they were drawn from -- so it rejoins nothing."""
    assert recluster.loosen([looser(recluster.STANDING, 0, 0)]) is None


def test_the_downward_sweep_starts_where_the_threshold_stands_and_goes_down() -> None:
    assert recluster.LOOSENING[0] == recluster.STANDING
    assert all(value <= recluster.STANDING for value in recluster.LOOSENING)


# --- the report ----------------------------------------------------------------


def subject(
    person: str, verdict: str, *shares: float, touches: int = 1, reach: int = 1
) -> recluster.Subject:
    return recluster.Subject(person, verdict, shares, touches, reach)


def flagged_and_friends() -> tuple[dict[str, frozenset[str]], dict[str, str]]:
    """One flagged cluster of two faces and one friend of two, all above the floor."""
    standing = {A0: frozenset({A0, B0}), C0: frozenset({C0, D0})}
    return standing, {A0: recluster.FLAGGED, C0: "friend"}


ANSWERED = [
    subject(A0, recluster.FLAGGED, 0.4, 0.4),
    subject(C0, "friend", 0.4, 0.4),
]


def test_a_working_knob_is_reported_as_one() -> None:
    standing, given = flagged_and_friends()
    rows = [
        recluster.measure(recluster.STANDING, standing, flat(standing), given),
        # The flagged cluster came apart and the friend did not.
        recluster.measure(0.45, standing, {A0: A0, B0: B0, C0: C0, D0: C0}, given),
    ]

    said = "\n".join(recluster.report(rows, rows, ANSWERED))

    assert "0.450 **takes the flagged clusters apart**" in said


def test_a_knob_that_does_not_work_says_so_and_keeps_the_standing_value() -> None:
    """`harness.floor`'s shape: where the measurement does not support a move the
    recommendation is to change nothing, stated plainly rather than as the
    least-bad value."""
    standing, given = flagged_and_friends()
    rows = [
        recluster.measure(recluster.STANDING, standing, flat(standing), given),
        # The friend came apart and the flagged cluster did not.
        recluster.measure(0.45, standing, {A0: A0, B0: A0, C0: C0, D0: D0}, given),
    ]

    said = "\n".join(recluster.report(rows, rows, ANSWERED))

    assert "**no threshold**" in said
    assert f"keep the threshold where it stands, {recluster.STANDING}" in said


def test_a_loosening_worth_taking_is_reported_as_one() -> None:
    standing, given = flagged_and_friends()
    rows = [recluster.measure(recluster.STANDING, standing, flat(standing), given)]

    said = "\n".join(
        recluster.report(
            rows,
            rows,
            ANSWERED,
            (),
            [looser(recluster.STANDING, 0, 0), looser(0.32, 6, 1)],
        )
    )

    assert "0.320 **rejoins**" in said


def test_a_loosening_that_does_not_work_says_so_and_keeps_the_standing_value() -> None:
    standing, given = flagged_and_friends()
    rows = [recluster.measure(recluster.STANDING, standing, flat(standing), given)]

    said = "\n".join(
        recluster.report(
            rows,
            rows,
            ANSWERED,
            (),
            [looser(recluster.STANDING, 0, 0), looser(0.32, 1, 6)],
        )
    )

    assert "**no looser threshold**" in said
    assert f"keep the threshold where it stands, {recluster.STANDING}" in said


def test_no_pair_answers_at_all_is_said_to_be_a_missing_step_and_not_a_finding() -> None:
    """A table of zeroes over no subjects reads as a finding and is not one, so the
    report says which step is missing instead -- and says why the sweep above could
    only ever conclude one way without it."""
    standing, given = flagged_and_friends()
    rows = [recluster.measure(recluster.STANDING, standing, flat(standing), given)]

    said = "\n".join(recluster.report(rows, rows, ANSWERED))

    assert "same-person mode" in said
    assert "**no looser threshold**" not in said


def test_the_two_counts_of_a_loosening_are_never_totalled() -> None:
    """`harness.floor`'s rule: a human put back together and two humans collapsed
    are different failures, so the table carries two columns and no sum."""
    standing, given = flagged_and_friends()
    rows = [recluster.measure(recluster.STANDING, standing, flat(standing), given)]

    said = "\n".join(
        recluster.report(
            rows, rows, ANSWERED, (), [looser(recluster.STANDING, 0, 0), looser(0.32, 6, 1)]
        )
    )

    assert "rejoined   wrongly merged" in said


def test_the_sweep_starts_where_the_threshold_stands() -> None:
    """So that the table's first row is the population the reader was shown, and
    every count in it is a count of a move away from that."""
    assert recluster.SWEEP[0] == recluster.STANDING
    assert all(value >= recluster.STANDING for value in recluster.SWEEP)


def test_the_report_says_how_far_the_flagged_clusters_reach() -> None:
    """The floor is what decides whether a flagged cluster can move a stack at all,
    so a report that counted all of them equally would price a failure the grid
    cannot feel."""
    standing, given = flagged_and_friends()
    rows = [recluster.measure(recluster.STANDING, standing, flat(standing), given)]
    answered = [
        subject(A0, recluster.FLAGGED, 0.01, 0.01, touches=9, reach=0),
        subject(C0, "friend", 0.4, 0.4),
    ]

    said = "\n".join(recluster.report(rows, rows, answered))

    assert "0 of the 1 flagged clusters reach the floor" in said
    assert "their 9 stack-touches are 0" in said
    assert "every flagged cluster is under the floor" in said


def test_a_size_cut_that_costs_no_friend_box_is_named() -> None:
    """The other knob, answered with numbers: a cut that drops flagged faces and no
    answered friend's is the finding the threshold sweep could not produce."""
    standing, given = flagged_and_friends()
    cuts = [
        recluster.price(
            0.0, standing, flat(standing), given, standing[A0] | standing[C0]
        ),
        recluster.price(0.02, standing, {C0: C0, D0: C0}, given, {C0, D0}),
    ]
    rows = [recluster.measure(recluster.STANDING, standing, flat(standing), given)]

    said = "\n".join(recluster.report(rows, rows, ANSWERED, cuts))

    assert "0.02 is the largest cut that drops no box of any answered friend" in said
    assert "takes 1 flagged clusters out of the population entirely" in said
    assert "it still fragments" not in said


def test_a_cut_that_keeps_every_friend_box_and_still_splits_one_says_so() -> None:
    """Complete linkage's merge order depends on every cluster, so dropping another
    person's small faces can move where a friend's joins are made. The two columns
    can therefore disagree, and the summary line must not read as though they
    cannot."""
    standing, given = flagged_and_friends()
    cuts = [recluster.price(0.02, standing, {C0: C0, D0: D0}, given, {C0, D0})]
    rows = [recluster.measure(recluster.STANDING, standing, flat(standing), given)]

    said = "\n".join(recluster.report(rows, rows, ANSWERED, cuts))

    assert "drops no box of any answered friend" in said
    assert "it still fragments 1 answered friend(s) with every box of theirs kept" in said


def test_a_big_box_with_no_splittable_stack_still_reaches_the_floor() -> None:
    """Two different facts, and this line is about the floor. A cluster present in
    every frame of every stack it touches moves nothing whichever way it is
    clustered, but it is not *under the floor*, and saying so would misreport where
    the failure lives."""
    standing, given = flagged_and_friends()
    rows = [recluster.measure(recluster.STANDING, standing, flat(standing), given)]
    answered = [
        subject(A0, recluster.FLAGGED, 0.4, touches=0, reach=0),
        subject(C0, "friend", 0.4),
    ]

    said = "\n".join(recluster.report(rows, rows, answered))

    assert "1 of the 1 flagged clusters reach the floor" in said
    assert "under the floor" not in said


def test_a_crossing_is_counted_once_and_not_once_per_table() -> None:
    """Both tables measure the same clusterings against different subjects, so
    summing them would report twice the crossings there are -- in the one situation
    where the number is load-bearing."""
    standing, given = flagged_and_friends()
    rows = [recluster.measure(0.45, standing, {A0: A0, B0: A0, C0: A0, D0: A0}, given)]

    said = "\n".join(recluster.report(rows, rows, ANSWERED))

    assert rows[0].crossings == 1
    assert "crossed   1 persons draw faces" in said


def test_the_second_sweeps_subjects_are_only_the_clusters_that_reach_the_floor() -> None:
    """Otherwise a cluster with no above-floor face lands in `gone` and still counts
    towards the denominator, so a table headed *the clusters that reach the floor*
    would print a rate over the clusters that do not."""
    up = np.array([1.0, 0.0], dtype=np.float32)
    down = np.array([0.0, 1.0], dtype=np.float32)
    stored = {A0: up, B0: up, C0: down, D0: down}
    faces_of = {A0: frozenset({A0, B0}), C0: frozenset({C0, D0})}
    shares = {A0: 0.01, B0: 0.01, C0: 0.4, D0: 0.4}
    given = {A0: recluster.FLAGGED, C0: "friend"}

    every, reads = recluster.sweep(stored, faces_of, shares, given)

    assert every[0].flagged.subjects == 1
    assert reads[0].flagged.subjects == 0
    assert reads[0].friends.subjects == 1


def flat(faces_of: dict) -> dict[str, str]:
    """A person's faces back into a face's person -- `held` the other way."""
    return {face: person for person, faces in faces_of.items() for face in faces}


# --- what it reads, and what it does not ---------------------------------------


def test_the_recluster_report_never_names_the_state_database() -> None:
    tree = ast.parse(Path(recluster.__file__).read_text(encoding="utf-8"))
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


def test_the_standing_threshold_and_the_floor_are_read_and_never_copied() -> None:
    """The report prices a move away from where the pass stands, so it has to read
    where the pass stands rather than carry a second copy that could disagree."""
    assert recluster.STANDING is THRESHOLD
    assert recluster.PROVISIONAL is FLOOR
