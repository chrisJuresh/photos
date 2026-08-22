"""The harness's second mode: friend or stranger, once per person.

ADR 0004's people rule says a frame joins a stack only if its people fit inside
the cover's people, and applied to every face a detector finds that rule is
destructive -- a tourist who wanders through frames three and four of a
nine-frame burst breaks it into three. The guard is the reader saying which
persons they actually photographed, once each.

What is asserted here is what the reader can say, what gets stored, and the order
they are asked in. **Never how the page draws a montage**: the ordering is a pure
function over two mappings, and the verdicts are a table, so both are assertions
rather than a browsing session. `tests/test_label_harness.py` is the prior art and
this file keeps its shape.

Nothing here starts a server, reads a substrate, loads a model, or opens a path
from `config.toml`.
"""

from __future__ import annotations

import ast
import sqlite3
from pathlib import Path

import pytest

from harness import people
from photolib import browse
from photolib.people import MODEL, THRESHOLD, VERSION


def opened(path: Path) -> sqlite3.Connection:
    """A labels connection the way the harness opens one: autocommit.

    `harness.label.store`'s own `isolation_level=None`, spelled out rather than
    called so that `ensure` is shown creating the table on a bare file.
    """
    return sqlite3.connect(path, isolation_level=None)


def sha_of(seed: str) -> str:
    """A frame's name, the length and alphabet the real ones have."""
    return f"{abs(hash(seed)):064x}"[:64]


A, B, C, D, E, F, G, H = (sha_of(letter) for letter in "abcdefgh")

# One person, named the way `photolib.people.name` names them: their least face.
ANNE = f"{A}:0"
BEN = f"{B}:0"
CARA = f"{C}:0"


def stacked(*groups: tuple[str, ...]) -> dict[str, str]:
    """Frames to the stack holding them, each named by its first member."""
    return {frame: group[0] for group in groups for frame in group}


# --- how much an answer would change ------------------------------------------


def test_a_person_in_every_frame_of_the_one_stack_they_touch_changes_nothing() -> None:
    """The zero case, and the reason the list can be stopped: whichever way the
    reader answers, every frame of that stack gains or loses them together, so the
    nesting rule draws it exactly as it did before."""
    scored = people.splits({ANNE: (A, B, C)}, stacked((A, B, C)))

    assert scored == {ANNE: 0}


def test_a_person_in_some_frames_of_a_stack_and_not_others_is_the_whole_question() -> None:
    scored = people.splits({ANNE: (A, B)}, stacked((A, B, C)))

    assert scored == {ANNE: 1}


def test_a_person_splitting_four_stacks_outranks_one_splitting_one() -> None:
    scored = people.splits(
        {ANNE: (A, C, E, G), BEN: (A,)},
        stacked((A, B), (C, D), (E, F), (G, H)),
    )

    assert scored == {ANNE: 4, BEN: 1}


def test_a_frame_in_no_stack_is_not_a_stack_a_verdict_could_split() -> None:
    """Membership gives a row to every EXIF-dated published tile and none to a tile
    the filesystem dated. A face in one of those is evidence about nothing here."""
    scored = people.splits({ANNE: (A, E)}, stacked((A, B, C)))

    assert scored == {ANNE: 1}


def test_a_person_in_a_stack_of_one_frame_changes_nothing_there() -> None:
    """A frame that shot alone still gets a stack of its own, and one frame of one
    is every frame of it."""
    scored = people.splits({ANNE: (A,)}, stacked((A,)))

    assert scored == {ANNE: 0}


def test_two_faces_of_one_person_in_one_frame_are_one_appearance_in_it() -> None:
    """A clustering that put two faces of one frame in one person has said that
    person is in that frame, once."""
    scored = people.splits({ANNE: (A, A, B)}, stacked((A, B, C)))

    assert scored == {ANNE: 1}


# --- the order the reader is asked in -----------------------------------------


def test_the_person_who_splits_the_most_stacks_comes_first() -> None:
    asked = people.order(
        {ANNE: (A,), BEN: (A, C, E), CARA: (A, C)},
        stacked((A, B), (C, D), (E, F)),
    )

    assert [one.person for one in asked] == [BEN, CARA, ANNE]


def test_a_person_who_changes_nothing_is_never_asked_about() -> None:
    """The list is what the reader's time buys something on, so a person whose
    verdict cannot move a stack is not in it at all."""
    asked = people.order({ANNE: (A, B, C), BEN: (A,)}, stacked((A, B, C)))

    assert [one.person for one in asked] == [BEN]


def test_the_more_seen_of_two_who_split_the_same_number_comes_first() -> None:
    """The tie-break is how much of them the reader has to recognise them by: a
    person with four faces is a montage and a person with one is a guess."""
    asked = people.order(
        {ANNE: (A,), BEN: (A, B, E, F)},
        stacked((A, B, C), (E, F, G)),
    )

    assert [(one.person, one.splits) for one in asked] == [(BEN, 2), (ANNE, 1)]


def test_the_order_is_total_so_a_reader_who_comes_back_sees_the_same_list() -> None:
    """Answers are keyed on the person, and the counter only means something if
    the same population comes back in the same sequence."""
    appearances = {ANNE: (A,), BEN: (C,), CARA: (E,)}
    stacks = stacked((A, B), (C, D), (E, F))

    once = [one.person for one in people.order(appearances, stacks)]
    backwards = dict(reversed(list(appearances.items())))
    again = [one.person for one in people.order(backwards, stacks)]

    assert once == again == sorted([ANNE, BEN, CARA])


def test_a_person_carries_the_frames_their_faces_were_found_in() -> None:
    """What the montage is drawn from, most prominent first -- the share is the
    only thing stored about where a face was, so it is the only thing that can
    order them."""
    asked = people.order(
        {ANNE: (A, B)},
        stacked((A, B, C)),
        boxes={ANNE: [(A, 0, 0.08), (B, 1, 0.31)]},
    )

    assert [(face.sha256, face.idx, face.share) for face in asked[0].faces] == [
        (B, 1, 0.31),
        (A, 0, 0.08),
    ]


def test_two_persons_in_one_frame_are_drawn_by_their_own_faces() -> None:
    """A montage assembled from every face of every frame a person appears in would
    draw the reader somebody else, which is the one way this screen could lie."""
    asked = people.order(
        {ANNE: (A,), BEN: (A,)},
        stacked((A, B)),
        boxes={ANNE: [(A, 0, 0.40)], BEN: [(A, 1, 0.05)]},
    )

    drawn = {one.person: [(face.idx, face.share) for face in one.faces] for one in asked}

    assert drawn == {ANNE: [(0, 0.40)], BEN: [(1, 0.05)]}


# --- what the reader can say --------------------------------------------------


def test_the_reader_says_one_of_four_things() -> None:
    assert people.VERDICTS == ("friend", "stranger", "unsure", "two-people")


def test_a_stranger_is_the_only_answer_that_takes_a_person_out_of_a_frame() -> None:
    """ADR 0004: a stranger is excluded from every frame's people. The other three
    are not that claim -- `unsure` is a cluster the reader could not make out and
    `two-people` is a report about the clustering."""
    assert not people.counts("stranger")
    assert people.counts("friend")
    assert people.counts("unsure")
    assert people.counts("two-people")


def test_an_unjudged_person_is_a_friend() -> None:
    """So stopping early is safe: the grid at zero answers is the grid the people
    rule produces on its own, and every answer the reader gives is a change from
    there rather than a repair of it."""
    assert people.counts(None)
    assert people.DEFAULT == "friend"


# --- where the answers go -----------------------------------------------------


HERE = people.Clustering(MODEL, VERSION, THRESHOLD)


@pytest.fixture
def labels(tmp_path: Path):
    conn = opened(tmp_path / "labels.sqlite3")
    people.ensure(conn)
    yield conn
    conn.close()


def test_a_verdict_stored_against_a_person_comes_back(labels) -> None:
    people.record(labels, ANNE, "friend", clustering=HERE)

    assert people.verdicts(labels, HERE) == {ANNE: "friend"}


def test_an_unjudged_person_reads_as_unjudged_and_not_as_a_friend(labels) -> None:
    """The friend default is the *reader* of this table's, applied by `counts`, and
    is deliberately not baked into it: a row that says friend and no row at all are
    different facts, and only one of them is the reader's."""
    people.record(labels, ANNE, "friend", clustering=HERE)

    given = people.verdicts(labels, HERE)

    assert BEN not in given
    assert people.counts(given.get(BEN))


def test_the_same_person_under_another_clustering_reads_as_unjudged(labels) -> None:
    """`stack_member`'s discipline one layer up: re-clustering at another threshold
    is another set of faces, so a verdict about this person cannot be inherited by
    a person who merely shares its name."""
    people.record(labels, ANNE, "stranger", clustering=HERE)

    other = people.Clustering(MODEL, VERSION, 0.5)

    assert people.verdicts(labels, other) == {}
    assert people.verdicts(labels, HERE) == {ANNE: "stranger"}


def test_a_new_model_is_a_new_population_too(labels) -> None:
    people.record(labels, ANNE, "stranger", clustering=HERE)

    assert people.verdicts(labels, people.Clustering("other", VERSION, THRESHOLD)) == {}
    assert people.verdicts(labels, people.Clustering(MODEL, "2", THRESHOLD)) == {}


def test_an_answer_can_be_revised(labels) -> None:
    """A misclick is not permanent, and a revision is not a second row: the reader
    said one thing about this person, latterly."""
    people.record(labels, ANNE, "friend", clustering=HERE)
    people.record(labels, ANNE, "stranger", clustering=HERE)

    assert people.verdicts(labels, HERE) == {ANNE: "stranger"}


def test_an_answer_survives_the_harness_being_stopped(tmp_path: Path) -> None:
    path = tmp_path / "labels.sqlite3"
    conn = opened(path)
    people.ensure(conn)
    people.record(conn, ANNE, "friend", clustering=HERE)
    conn.close()

    reopened = opened(path)
    try:
        people.ensure(reopened)
        assert people.verdicts(reopened, HERE) == {ANNE: "friend"}
    finally:
        reopened.close()


def test_nothing_but_the_four_answers_can_be_filed(labels) -> None:
    with pytest.raises(sqlite3.IntegrityError):
        people.record(labels, ANNE, "acquaintance", clustering=HERE)


def test_a_labels_file_from_before_the_people_mode_reads_as_no_answers(
    tmp_path: Path,
) -> None:
    """Three rounds of stack answers and no verdict table is *nobody judged*, not
    an error. `harness.floor` opens this file read-only on purpose, so it cannot
    create the table, and a reader who has not opened the people mode yet must be
    told which step is missing rather than shown `no such table`."""
    path = tmp_path / "labels.sqlite3"
    old = opened(path)
    old.execute("CREATE TABLE answer (members TEXT PRIMARY KEY)")
    old.close()

    read_only = sqlite3.connect(f"{path.as_uri()}?mode=ro", uri=True)
    try:
        assert not people.judged_yet(read_only)
        assert people.verdicts(read_only, HERE) == {}
    finally:
        read_only.close()


def test_a_file_with_the_table_and_no_rows_is_a_different_fact(labels) -> None:
    """Both read as no answers, and only one of them means the reader has never had
    anywhere to put one -- which is why `judged_yet` is separate from `verdicts`."""
    assert people.judged_yet(labels)
    assert people.verdicts(labels, HERE) == {}


def test_the_stack_answers_and_the_person_answers_share_one_file(tmp_path: Path) -> None:
    """One page to run and one database to keep -- user story 21. `label.store` is
    what the harness opens, and both tables are there after it."""
    from harness import label

    conn = label.store(tmp_path / "labels.sqlite3")
    try:
        tables = {
            row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        }
    finally:
        conn.close()

    assert {"answer", "person_verdict"} <= tables


# --- how many are left worth asking about -------------------------------------


def test_the_count_says_how_many_are_judged_and_how_many_would_still_change_anything() -> None:
    """User story 6: knowing when stopping is free. The second number is over the
    persons whose verdict could move a stack, which is the list itself."""
    asked = people.order(
        {ANNE: (A,), BEN: (C,), CARA: (E,)},
        stacked((A, B), (C, D), (E, F)),
    )

    assert people.progress(asked, {ANNE: "friend"}) == (1, 2)


def test_a_person_who_changes_nothing_is_not_counted_as_left_to_do() -> None:
    asked = people.order({ANNE: (A,), BEN: (C, D)}, stacked((A, B), (C, D)))

    assert people.progress(asked, {}) == (0, 1)


def test_an_answer_about_a_person_no_longer_worth_asking_about_still_counts_as_given() -> None:
    """A re-clustering can leave a judged person off the list. What the reader
    said is still an answer they gave and the counter must not lose it."""
    asked = people.order({BEN: (C,)}, stacked((C, D)))

    assert people.progress(asked, {ANNE: "stranger", BEN: "friend"}) == (2, 0)


# --- what the catalog hands back ----------------------------------------------
#
# The queries, over a migrated catalog with the rows written by hand. Which faces
# belong to whom and which frames are one stack are stated here rather than
# detected, because what is under test is the read and not the models.


def published(conn: sqlite3.Connection, sha256: str) -> None:
    """One published frame, which is what `face` and `stack_member` both point at."""
    conn.execute(
        "INSERT INTO file (sha256, size, ext, kind, state, feature_ver)"
        " VALUES (?, 1, '.jpg', 'image', 'published', '{}')"
        " ON CONFLICT (sha256) DO NOTHING",
        (sha256,),
    )


def peopled(conn: sqlite3.Connection, *rows: tuple[str, str, int, float]) -> None:
    """Faces and their persons, at the clustering the harness reads."""
    for person, sha256, idx, share in rows:
        published(conn, sha256)
        conn.execute(
            "INSERT INTO face (model, version, sha256, idx, share, vector)"
            " VALUES (?, ?, ?, ?, ?, x'00')",
            (MODEL, VERSION, sha256, idx, share),
        )
        conn.execute(
            "INSERT INTO face_person (model, version, threshold, sha256, idx, person)"
            " VALUES (?, ?, ?, ?, ?, ?)",
            (MODEL, VERSION, THRESHOLD, sha256, idx, person),
        )
    conn.commit()


def grouped(conn: sqlite3.Connection, *groups: tuple[str, ...]) -> None:
    """Stack membership at the setting the grid draws."""
    for group in groups:
        for sha256 in group:
            published(conn, sha256)
            conn.execute(
                "INSERT INTO stack_member (method, version, strictness, linkage,"
                " ceiling, sha256, stack) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (*people.STACK_SETTING.values(), sha256, group[0]),
            )
    conn.commit()


def test_the_catalog_hands_back_each_persons_own_faces(conn) -> None:
    peopled(conn, (ANNE, A, 0, 0.40), (BEN, A, 1, 0.05), (ANNE, B, 0, 0.38))

    held = people.found(conn, HERE)

    assert {person: len(faces) for person, faces in held.items()} == {ANNE: 2, BEN: 1}
    assert [(face.sha256, face.idx) for face in held[BEN]] == [(A, 1)]


def test_another_clustering_hands_back_nothing(conn) -> None:
    """The threshold is part of `face_person`'s key, so reading another value is
    reading a population nobody has clustered rather than this one."""
    peopled(conn, (ANNE, A, 0, 0.40))

    assert people.found(conn, people.Clustering(MODEL, VERSION, 0.9)) == {}


def test_the_stacks_come_back_at_the_setting_the_grid_draws(conn) -> None:
    grouped(conn, (A, B, C))

    assert people.membership(conn) == {A: A, B: A, C: A}


def test_the_list_the_reader_is_asked_is_read_off_the_catalog(conn) -> None:
    """End to end over the two queries and the pure function: `BEN` wanders through
    one frame of a stack of three and `ANNE` is in all of it, so only `BEN` is
    asked about."""
    peopled(
        conn,
        (ANNE, A, 0, 0.40),
        (ANNE, B, 0, 0.38),
        (ANNE, C, 0, 0.42),
        (BEN, B, 1, 0.06),
    )
    grouped(conn, (A, B, C))

    asked = people.asking(conn, HERE)

    assert [(one.person, one.splits) for one in asked] == [(BEN, 1)]
    assert [(face.sha256, face.idx) for face in asked[0].faces] == [(B, 1)]


# --- what it reads, and what it does not --------------------------------------


def test_the_setting_the_stacks_are_read_at_is_the_one_the_grid_draws() -> None:
    """The splits are counted over stacks, so which population of stacks matters:
    reading another setting's would price a verdict against a grid nobody sees."""
    assert people.STACK_SETTING == browse.STACK_SETTING


def spoken(module) -> set[str]:
    """Every string this module's *code* uses, its prose aside.

    Over the source rather than over a live connection, because the claim is about
    what the module can reach at all and not about what one call happened to touch.
    Docstrings are excluded because they are where the containment is explained --
    a file that says "`state.sqlite3` is never attached" would otherwise fail a
    test looking for the words.
    """
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


def test_the_person_mode_never_names_the_state_database() -> None:
    """The same containment every tool here obeys, as a fact about the source
    rather than a promise: triage decisions are not reachable from an experiment."""
    said = spoken(people)

    assert not [one for one in said if "state.sqlite3" in one]
    assert not [one for one in said if "ATTACH" in one.upper()]
