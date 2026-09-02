"""The harness's third mode: are these two clusters one human?

ADR 0004's nesting rule splits a stack whose members' people do not all fit inside
one member's, and #88 found that 53 of the 94 stacks it would split hold somebody in
every frame -- one human handed two names by the clustering. Neither of the other
two modes can ask about that: the stack mode asks about a frame and the people mode
asks about a person, and this asks about a *pair* of persons.

What is asserted here is the rule the queue is drawn from, the order the reader is
asked in, what gets stored, and what a clustering scores against the answers.
**Never how the page draws two montages**: the queue is a pure function over two
mappings and the verdicts are a table, so both are assertions rather than a browsing
session. `tests/test_person_harness.py` is the prior art and this file keeps its
shape.

Nothing here starts a server, reads a substrate, loads a model, or opens a path from
`config.toml`.
"""

from __future__ import annotations

import ast
import sqlite3
from pathlib import Path

import pytest

from harness import same
from photolib import browse
from photolib.people import CUT, FLOOR, MODEL, NO_CUT, THRESHOLD, VERSION


def opened(path: Path) -> sqlite3.Connection:
    """A labels connection the way the harness opens one: autocommit."""
    return sqlite3.connect(path, isolation_level=None)


def sha_of(seed: str) -> str:
    """A frame's name, the length and alphabet the real ones have."""
    return f"{abs(hash(seed)):064x}"[:64]


A, B, C, D, E, F = (sha_of(letter) for letter in "abcdef")

# Persons, named the way `photolib.people.name` names them: their least face. The
# letters are chosen so the names sort in this order, because a pair is keyed on the
# lesser name first and a test that could not say which is which would be asserting
# nothing.
ANNE, BEN, CARA = sorted((f"{A}:0", f"{B}:0", f"{C}:0"))


def stacked(*groups: tuple[str, ...]) -> dict[str, str]:
    """Frames to the stack holding them, each named by its first member."""
    return {frame: group[0] for group in groups for frame in group}


# --- the rule the queue is drawn from -----------------------------------------


def test_a_stack_whose_frames_all_hold_the_same_person_nests() -> None:
    assert same.nests([{ANNE}, {ANNE}, {ANNE}])


def test_the_readers_own_worked_example_nests_and_its_two_outliers_do_not() -> None:
    """ADR 0004 records the example verbatim so the rule stays checkable against
    it: `{A,B,C,D}` contains `{A,B,C}` and `{A,B}` and contains neither `{A,B,E}`
    nor `{B,F}`."""
    assert same.nests([{"A", "B", "C", "D"}, {"A", "B", "C"}, {"A", "B"}])
    assert not same.nests([{"A", "B", "C", "D"}, {"A", "B", "E"}])
    assert not same.nests([{"A", "B", "C", "D"}, {"B", "F"}])


def test_the_members_need_not_form_a_chain_only_all_fit_inside_one() -> None:
    """`{A,B}`, `{A,C}` and `{A,B,C}` are one stack; `{A,B}` and `{A,C}` alone are
    two, there being no frame that shows everybody."""
    assert same.nests([{"A", "B"}, {"A", "C"}, {"A", "B", "C"}])
    assert not same.nests([{"A", "B"}, {"A", "C"}])


def test_a_frame_holding_nobody_never_breaks_the_nesting_on_its_own() -> None:
    """The empty set nests inside everything. ADR 0004's other clause -- a frame
    with nobody never joins a frame with somebody -- is answered by bodies and no
    merge of two persons can change it, so it is not this rule."""
    assert same.nests([set(), {ANNE}, {ANNE}])


def test_the_case_the_mode_exists_for_does_not_nest() -> None:
    """#88's thirteen-frame run: twelve faces one person, one frame its own. Same
    human, and the rule as specified splits the stack the reader wants bigger."""
    assert not same.nests([{ANNE}, {ANNE}, {BEN}])


# --- how much an answer would change ------------------------------------------


def test_the_pair_that_tears_a_stack_is_asked_about() -> None:
    moved = same.moving({A: {ANNE}, B: {ANNE}, C: {BEN}}, stacked((A, B, C)))

    assert moved == {(ANNE, BEN): 1}


def test_a_stack_that_already_nests_asks_about_nobody() -> None:
    """Merging two persons is a monotone image of every member's people set, so a
    cover that held everything still holds it: a stack the rule leaves whole cannot
    be improved by any answer."""
    assert same.moving({A: {ANNE, BEN}, B: {ANNE}, C: {BEN}}, stacked((A, B, C))) == {}


def test_a_pair_only_one_of_which_is_in_the_stack_is_a_rename_and_not_a_question() -> None:
    """`CARA` tears the stack against `ANNE`; `BEN` is elsewhere entirely, so
    merging him with either changes nothing here."""
    moved = same.moving(
        {A: {ANNE}, B: {ANNE}, C: {CARA}, D: {BEN}},
        stacked((A, B, C), (D,)),
    )

    assert moved == {(ANNE, CARA): 1}


def test_a_pair_that_always_appears_together_changes_nothing() -> None:
    """Every frame holding one holds the other, so the merge is a rename and the
    stack is torn by something else."""
    moved = same.moving(
        {A: {ANNE, BEN}, B: {ANNE, BEN}, C: {CARA}}, stacked((A, B, C))
    )

    assert moved == {(ANNE, CARA): 1, (BEN, CARA): 1}


def test_a_stack_torn_three_ways_asks_about_all_three_pairs() -> None:
    """One human under three names is repaired by no single merge, so a measure of
    *would this merge make the stack nest* would score all three zero and never ask.
    What is counted is what the merge changes about a stack the rule is splitting."""
    moved = same.moving({A: {ANNE}, B: {BEN}, C: {CARA}}, stacked((A, B, C)))

    assert moved == {(ANNE, BEN): 1, (ANNE, CARA): 1, (BEN, CARA): 1}


def test_a_pair_that_tears_two_stacks_counts_twice() -> None:
    moved = same.moving(
        {A: {ANNE}, B: {BEN}, C: {ANNE}, D: {BEN}},
        stacked((A, B), (C, D)),
    )

    assert moved == {(ANNE, BEN): 2}


def test_a_frame_in_no_stack_is_not_a_stack_a_merge_could_change() -> None:
    """Membership gives a row to every EXIF-dated published tile and none to a tile
    the filesystem dated. A face in one of those is evidence about nothing here."""
    assert same.moving({A: {ANNE}, E: {BEN}}, stacked((A, B, C))) == {}


def test_the_pair_is_keyed_with_the_lesser_name_first() -> None:
    """The reader is asked about two clusters and not about a direction, so
    *(P, Q)* and *(Q, P)* have to be one question and one row."""
    moved = same.moving({A: {BEN}, B: {ANNE}}, stacked((A, B)))

    assert list(moved) == [(ANNE, BEN)]
    assert same.pairing(BEN, ANNE) == (ANNE, BEN) == same.pairing(ANNE, BEN)


# --- the order the reader is asked in -----------------------------------------


def boxed(**faces: int) -> dict[str, list[tuple[str, int, float]]]:
    """Each person's own faces, as `order` takes them -- one frame each, sized so
    the montage is the count the caller asked for."""
    return {
        person: [(sha_of(f"{person}-{n}"), 0, 0.5) for n in range(count)]
        for person, count in faces.items()
    }


def test_the_pair_that_tears_the_most_stacks_comes_first() -> None:
    asked = same.order(
        {A: {ANNE}, B: {BEN}, C: {ANNE}, D: {BEN}, E: {ANNE}, F: {CARA}},
        stacked((A, B), (C, D), (E, F)),
    )

    assert [(pair.key, pair.stacks) for pair in asked] == [
        ((ANNE, BEN), 2),
        ((ANNE, CARA), 1),
    ]


def test_the_pair_whose_poorer_side_is_larger_breaks_the_tie() -> None:
    """A pair is only as answerable as its thinner montage: eleven faces against one
    is a guess whatever the eleven show."""
    asked = same.order(
        {A: {ANNE}, B: {BEN}, C: {ANNE}, D: {CARA}},
        stacked((A, B), (C, D)),
        boxed(**{ANNE: 6, BEN: 1, CARA: 4}),
    )

    assert [pair.key for pair in asked] == [(ANNE, CARA), (ANNE, BEN)]


def test_the_order_is_total_so_a_reader_who_comes_back_sees_the_same_list() -> None:
    asked = same.order({A: {ANNE}, B: {BEN}, C: {CARA}}, stacked((A, B, C)))

    assert [pair.key for pair in asked] == sorted(pair.key for pair in asked)


def test_each_side_of_a_pair_is_drawn_from_its_own_faces_most_prominent_first() -> None:
    """Two persons in one frame have two different faces in it, so a montage
    assembled from the frames alone would draw the reader somebody else."""
    asked = same.order(
        {A: {ANNE}, B: {BEN}},
        stacked((A, B)),
        {ANNE: [(A, 0, 0.2), (B, 1, 0.6)], BEN: [(B, 0, 0.4)]},
    )

    (pair,) = asked
    assert [(face.sha256, face.idx) for face in pair.faces[0]] == [(B, 1), (A, 0)]
    assert [(face.sha256, face.idx) for face in pair.faces[1]] == [(B, 0)]


# --- what the reader can say --------------------------------------------------


def test_the_reader_says_one_of_three_things() -> None:
    """A fourth verdict for *cannot tell from these frames* was left out: nothing
    would read it that does not read `unsure`."""
    assert same.VERDICTS == ("same", "different", "unsure")


def test_not_sure_is_evidence_about_neither_side() -> None:
    """It is the reader saying the montage did not let them tell, which is a fact
    about what was on screen and not about whether the two humans are one."""
    assert same.JUDGED == ("same", "different")


# --- where the answers go -----------------------------------------------------


HERE = same.Clustering(MODEL, VERSION, THRESHOLD, CUT)
UNCUT = same.Clustering(MODEL, VERSION, THRESHOLD, NO_CUT)


@pytest.fixture
def labels(tmp_path: Path):
    conn = opened(tmp_path / "labels.sqlite3")
    same.ensure(conn)
    yield conn
    conn.close()


def test_a_verdict_stored_against_a_pair_comes_back(labels) -> None:
    same.record(labels, ANNE, BEN, "same", clustering=HERE)

    assert same.verdicts(labels, HERE) == {(ANNE, BEN): "same"}


def test_the_two_orders_of_one_pair_are_one_answer(labels) -> None:
    same.record(labels, ANNE, BEN, "same", clustering=HERE)
    same.record(labels, BEN, ANNE, "different", clustering=HERE)

    assert same.verdicts(labels, HERE) == {(ANNE, BEN): "different"}


def test_the_table_refuses_a_pair_stored_the_wrong_way_round(labels) -> None:
    """`CHECK (one < other)` makes the ordering a fact about the table rather than a
    convention `pairing` is trusted to keep."""
    with pytest.raises(sqlite3.IntegrityError):
        labels.execute(
            "INSERT INTO same_person (model, version, threshold, cut, one, other,"
            " verdict) VALUES (?, ?, ?, ?, ?, ?, 'same')",
            (MODEL, VERSION, THRESHOLD, CUT, BEN, ANNE),
        )


def test_an_unjudged_pair_is_absent_and_not_defaulted(labels) -> None:
    """There is no equivalent of `harness.people.counts` here: the clustering's own
    answer stands for a pair nothing has been said about, which is that they are two
    people."""
    same.record(labels, ANNE, BEN, "same", clustering=HERE)

    assert (ANNE, CARA) not in same.verdicts(labels, HERE)


def test_the_same_pair_under_another_clustering_reads_as_unjudged(labels) -> None:
    """`person_verdict`'s discipline: a person is named by its least face, so
    re-clustering at another threshold is another set of faces and a verdict about
    these two cannot be inherited by two clusters that merely share their names."""
    same.record(labels, ANNE, BEN, "same", clustering=HERE)

    assert same.verdicts(labels, same.Clustering(MODEL, VERSION, 0.5, CUT)) == {}


def test_a_verdict_is_keyed_by_the_cut_it_was_given_at(labels) -> None:
    same.record(labels, ANNE, BEN, "same", clustering=UNCUT)

    assert same.verdicts(labels, HERE) == {}
    assert same.verdicts(labels, UNCUT) == {(ANNE, BEN): "same"}


def test_an_answer_carries_across_the_cut_when_neither_cluster_changed(labels) -> None:
    """A pair is a question about two clusters, so it carries only when both came
    through the cut holding exactly the faces they had -- and then a sitting is not
    spent twice for a column."""
    same.record(labels, ANNE, BEN, "same", clustering=UNCUT)

    assert same.verdicts(labels, HERE, carried=(ANNE, BEN)) == {(ANNE, BEN): "same"}


def test_an_answer_does_not_carry_when_one_side_became_other_faces(labels) -> None:
    same.record(labels, ANNE, BEN, "same", clustering=UNCUT)

    assert same.verdicts(labels, HERE, carried=(ANNE,)) == {}


def test_an_answer_given_here_wins_over_the_carried_one(labels) -> None:
    same.record(labels, ANNE, BEN, "same", clustering=UNCUT)
    same.record(labels, ANNE, BEN, "different", clustering=HERE)

    assert same.verdicts(labels, HERE, carried=(ANNE, BEN)) == {
        (ANNE, BEN): "different"
    }


def test_an_answer_can_be_revised(labels) -> None:
    same.record(labels, ANNE, BEN, "same", clustering=HERE)
    same.record(labels, ANNE, BEN, "unsure", clustering=HERE)

    assert same.verdicts(labels, HERE) == {(ANNE, BEN): "unsure"}


def test_nothing_but_the_three_answers_can_be_filed(labels) -> None:
    with pytest.raises(sqlite3.IntegrityError):
        same.record(labels, ANNE, BEN, "maybe", clustering=HERE)


def test_an_answer_survives_the_harness_being_stopped(tmp_path: Path) -> None:
    conn = opened(tmp_path / "labels.sqlite3")
    same.ensure(conn)
    same.record(conn, ANNE, BEN, "same", clustering=HERE)
    conn.close()

    again = opened(tmp_path / "labels.sqlite3")
    try:
        assert same.verdicts(again, HERE) == {(ANNE, BEN): "same"}
    finally:
        again.close()


def test_a_labels_file_from_before_this_mode_reads_as_no_answers(
    tmp_path: Path,
) -> None:
    """`harness.recluster` opens the labels read-only and cannot create the table,
    so a reader with three rounds of stack answers is told which step is missing
    rather than shown `no such table`."""
    conn = opened(tmp_path / "labels.sqlite3")
    try:
        assert not same.judged_yet(conn)
        assert same.verdicts(conn, HERE) == {}
    finally:
        conn.close()


def test_a_file_with_the_table_and_no_rows_is_a_different_fact(labels) -> None:
    assert same.judged_yet(labels)
    assert same.verdicts(labels, HERE) == {}


def test_all_three_modes_share_one_labels_file(tmp_path: Path) -> None:
    """One page to run and one database to keep: `harness.label.store` creates every
    table the harness writes."""
    from harness import label, people

    conn = label.store(tmp_path / "labels.sqlite3")
    try:
        same.record(conn, ANNE, BEN, "same", clustering=HERE)
        people.record(conn, ANNE, "friend", clustering=HERE)

        assert same.verdicts(conn, HERE) == {(ANNE, BEN): "same"}
        assert people.verdicts(conn, HERE) == {ANNE: "friend"}
    finally:
        conn.close()


# --- how many are left worth asking about -------------------------------------


def test_the_count_says_how_many_are_judged_and_how_many_would_still_change_anything() -> None:
    asked = same.order({A: {ANNE}, B: {BEN}, C: {CARA}}, stacked((A, B, C)))

    assert same.progress(asked, {}) == (0, 3)
    assert same.progress(asked, {(ANNE, BEN): "same"}) == (1, 2)


def test_an_answer_about_a_pair_no_longer_worth_asking_about_still_counts_as_given() -> None:
    """A stack re-cut since, or a person re-clustered, can leave a judged pair off
    the list. What the reader said is still an evening they spent."""
    asked = same.order({A: {ANNE}, B: {BEN}}, stacked((A, B)))

    assert same.progress(asked, {(ANNE, CARA): "different"}) == (1, 1)


# --- what a clustering did to the answers -------------------------------------


FACES_OF = {ANNE: frozenset({f"{A}:0"}), BEN: frozenset({f"{B}:0"})}


def test_a_looser_clustering_that_joins_a_pair_the_reader_called_one_human_rejoins_it() -> None:
    landed = same.scored(
        {(ANNE, BEN): "same"}, FACES_OF, {f"{A}:0": ANNE, f"{B}:0": ANNE}
    )

    assert landed.rejoined == ((ANNE, BEN),)
    assert landed.split == ()
    assert landed.merged == ()


def test_the_same_clustering_scores_a_pair_the_reader_called_two_humans_as_merged() -> None:
    """The two counts are different failures and are never totalled: a human put
    back together is what a loosening buys, and two humans collapsed is the reader's
    own answer being contradicted."""
    landed = same.scored(
        {(ANNE, BEN): "different"}, FACES_OF, {f"{A}:0": ANNE, f"{B}:0": ANNE}
    )

    assert landed.merged == ((ANNE, BEN),)
    assert landed.rejoined == ()


def test_the_standing_clustering_rejoins_nothing_and_merges_nothing() -> None:
    """The control row: these pairs are two persons in the population they were
    drawn from, so a clustering that reproduces it can only score zero on both."""
    landed = same.scored(
        {(ANNE, BEN): "same", (ANNE, CARA): "different"},
        FACES_OF,
        {f"{A}:0": ANNE, f"{B}:0": BEN},
    )

    assert landed.rejoined == ()
    assert landed.merged == ()
    assert (landed.same, landed.different) == (1, 1)


def test_not_sure_is_scored_in_neither_column() -> None:
    landed = same.scored(
        {(ANNE, BEN): "unsure"}, FACES_OF, {f"{A}:0": ANNE, f"{B}:0": ANNE}
    )

    assert (landed.same, landed.different) == (0, 0)
    assert landed == same.Rejoining()


def test_a_pair_whose_faces_are_not_in_the_clustering_was_not_put_together() -> None:
    """A cut that dropped one side entirely: whatever else is true, the two were not
    joined."""
    landed = same.scored({(ANNE, BEN): "same"}, FACES_OF, {f"{A}:0": ANNE})

    assert landed.split == ((ANNE, BEN),)
    assert landed.rejoined == ()


# --- what the catalog hands back ----------------------------------------------


def published(conn: sqlite3.Connection, sha256: str) -> None:
    conn.execute(
        "INSERT INTO file (sha256, size, ext, kind, state, feature_ver)"
        " VALUES (?, 1, '.jpg', 'image', 'published', '{}')"
        " ON CONFLICT (sha256) DO NOTHING",
        (sha256,),
    )


def peopled_rows(
    conn: sqlite3.Connection, *rows: tuple[str, str, int, float], cut: float = CUT
) -> None:
    """Faces and their persons, at the clustering the harness reads."""
    for person, sha256, idx, share in rows:
        published(conn, sha256)
        conn.execute(
            "INSERT INTO face (model, version, sha256, idx, share, vector)"
            " VALUES (?, ?, ?, ?, ?, x'00')"
            " ON CONFLICT (model, version, sha256, idx) DO NOTHING",
            (MODEL, VERSION, sha256, idx, share),
        )
        conn.execute(
            "INSERT INTO face_person (model, version, threshold, cut, sha256, idx,"
            " person) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (MODEL, VERSION, THRESHOLD, cut, sha256, idx, person),
        )
    conn.commit()


def grouped(conn: sqlite3.Connection, *groups: tuple[str, ...]) -> None:
    """Stack membership at the setting the grid draws."""
    from harness import people

    for group in groups:
        for sha256 in group:
            published(conn, sha256)
            conn.execute(
                "INSERT INTO stack_member (method, version, strictness, linkage,"
                " ceiling, people, sha256, stack) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (*people.STACK_SETTING.values(), sha256, group[0]),
            )
    conn.commit()


def test_the_queue_is_read_off_the_catalog(conn) -> None:
    peopled_rows(conn, (ANNE, A, 0, 0.40), (ANNE, B, 0, 0.38), (BEN, C, 0, 0.42))
    grouped(conn, (A, B, C))

    asked = same.asking(conn, HERE)

    assert [(pair.key, pair.stacks) for pair in asked] == [((ANNE, BEN), 1)]
    assert [face.sha256 for face in asked[0].faces[0]] == [A, B]


def test_another_clustering_hands_back_nothing(conn) -> None:
    peopled_rows(conn, (ANNE, A, 0, 0.40), (BEN, B, 0, 0.42))
    grouped(conn, (A, B))

    assert same.asking(conn, same.Clustering(MODEL, VERSION, 0.5, CUT)) == []


# --- the floor the nesting rule reads -----------------------------------------


def test_a_face_under_the_floor_is_in_no_frames_people() -> None:
    """A face under `photolib.people.FLOOR` cannot tear a stack, so no verdict about
    the person it belongs to would move one."""
    from harness.people import Face

    frames = same.peopled(
        {ANNE: [Face(A, 0, FLOOR), Face(B, 0, FLOOR / 2)]}
    )

    assert frames == {A: {ANNE}}


def test_a_pair_torn_only_by_a_sub_floor_face_is_never_asked_about(conn) -> None:
    peopled_rows(conn, (ANNE, A, 0, 0.40), (ANNE, B, 0, 0.38), (BEN, C, 0, 0.01))
    grouped(conn, (A, B, C))

    assert same.asking(conn, HERE) == []


def test_the_montage_still_holds_the_faces_under_the_floor(conn) -> None:
    """The floor decides who is in a frame's people; a small face is still something
    to recognise somebody by."""
    peopled_rows(
        conn,
        (ANNE, A, 0, 0.40),
        (ANNE, B, 0, 0.01),
        (ANNE, D, 0, 0.38),
        (BEN, C, 0, 0.42),
    )
    grouped(conn, (A, C, D))

    (pair,) = same.asking(conn, HERE)

    assert sorted(face.sha256 for face in pair.faces[0]) == sorted((A, B, D))


# --- what it reads, and what it does not --------------------------------------


def test_the_setting_the_stacks_are_read_at_is_the_one_the_grid_draws() -> None:
    """The stacks a merge would change are counted so a verdict is priced against
    the grid the reader is looking at."""
    from harness import people

    assert people.STACK_SETTING == browse.STACK_SETTING


def test_the_floor_the_queue_reads_is_the_one_the_nesting_rule_reads() -> None:
    """Read from the one line that holds it and never copied, so moving it moves the
    queue and nothing has to be regenerated."""
    assert same.FLOOR is FLOOR


def spoken(module) -> set[str]:
    """Every string this module's *code* uses, its prose aside."""
    tree = ast.parse(Path(module.__file__).read_text(encoding="utf-8"))
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
    return {
        node.value
        for node in ast.walk(tree)
        if isinstance(node, ast.Constant)
        and isinstance(node.value, str)
        and id(node) not in prose
    }


def test_the_pair_mode_never_names_the_state_database() -> None:
    """The same containment every tool here obeys, as a fact about the source rather
    than a promise: triage decisions are not reachable from an experiment."""
    said = spoken(same)

    assert not [one for one in said if "state.sqlite3" in one]
    assert not [one for one in said if "ATTACH" in one.upper()]
