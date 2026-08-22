"""The prominence floor, measured against the reader's own answers.

ADR 0004 says somebody counts only above some share of the frame and that **the
value is measured rather than picked**. `photolib.people.FLOOR` is provisional at
0.10 and every box's share is stored, so the measurement is a re-read of those
rows -- which is what `harness.floor` is, and what is asserted here.

The report has one question and it is allowed to answer no: *does a floor separate
the friends from the strangers at all?* A proxy that does not work is abandoned
rather than tuned, so the case that matters most here is the overlapping one --
given two populations that interleave, the report must say no floor separates them
and must not hand back the least-bad value as though it were an answer.

`tests/test_calibration.py` is the prior art. Everything here is over synthetic
verdicts and shares: no database, no photograph, no model.
"""

from __future__ import annotations

import ast
from pathlib import Path

from harness import floor, people
from photolib.people import FLOOR


def sha_of(seed: str) -> str:
    return f"{abs(hash(seed)):064x}"[:64]


A, B, C, D, E, F = (sha_of(letter) for letter in "abcdef")

ANNE = f"{A}:0"
BEN = f"{B}:0"
CARA = f"{C}:0"
DAN = f"{D}:0"


def stacked(*groups: tuple[str, ...]) -> dict[str, str]:
    return {frame: group[0] for group in groups for frame in group}


# --- the two populations ------------------------------------------------------


def test_the_shares_are_split_by_what_the_reader_said() -> None:
    """Friends and strangers apart and never blended, which is user story 15: a
    pooled distribution cannot show a separation or the absence of one."""
    seen = floor.populations(
        {ANNE: "friend", BEN: "stranger"},
        {ANNE: [(A, 0, 0.4)], BEN: [(A, 1, 0.05)]},
    )

    assert [one.share for one in seen["friend"]] == [0.4]
    assert [one.share for one in seen["stranger"]] == [0.05]


def test_a_cluster_the_reader_could_not_make_out_is_evidence_about_neither() -> None:
    """`unsure` is an answer about the reader's eyes and `two-people` is a report
    about the clustering. Neither is a judgement about a person, so neither belongs
    in a distribution of persons' box shares."""
    seen = floor.populations(
        {ANNE: "unsure", BEN: "two-people", CARA: "friend"},
        {ANNE: [(A, 0, 0.4)], BEN: [(B, 0, 0.4)], CARA: [(C, 0, 0.4)]},
    )

    assert [one.person for one in seen["friend"]] == [CARA]
    assert seen["stranger"] == []


def test_an_unjudged_person_is_not_evidence_either() -> None:
    """The friend default is how the *rule* reads silence. It is not the reader
    saying a person is a friend, so it cannot be counted as their answer here."""
    seen = floor.populations({}, {ANNE: [(A, 0, 0.4)]})

    assert seen["friend"] == [] and seen["stranger"] == []


def test_every_appearance_counts_and_not_every_person() -> None:
    """The floor is applied per box -- a box counts as somebody when it clears the
    share -- so the population it is chosen from is boxes. A friend photographed
    forty times is forty appearances and one verdict."""
    seen = floor.populations({ANNE: "friend"}, {ANNE: [(A, 0, 0.5), (B, 0, 0.2)]})

    assert sorted(one.share for one in seen["friend"]) == [0.2, 0.5]


# --- whether a floor separates them at all ------------------------------------


def test_two_cleanly_separated_populations_get_a_floor_between_them() -> None:
    separating = floor.separates([0.30, 0.40, 0.55], [0.02, 0.05, 0.08])

    assert separating is not None
    assert 0.08 < separating <= 0.30


def test_overlapping_populations_get_no_floor_rather_than_the_least_bad() -> None:
    """The finding this report exists to be able to return. A stranger can be
    large and close and a friend small and distant, so the proxy may simply not
    work -- and a least-bad value handed back here would be that failure dressed
    as an answer."""
    assert floor.separates([0.30, 0.04], [0.02, 0.35]) is None


def test_a_stranger_exactly_at_a_friend_share_is_not_separated() -> None:
    """A floor counts a box at or above it, so the two populations touching at one
    value means no floor can put them on opposite sides of itself."""
    assert floor.separates([0.20], [0.20]) is None


def test_nothing_to_separate_is_not_a_separation() -> None:
    """One population empty is no evidence rather than perfect evidence, and a
    report that returned a floor from it would be recommending a value nobody's
    answers had spoken about."""
    assert floor.separates([0.3], []) is None
    assert floor.separates([], [0.02]) is None


# --- what each candidate floor gets wrong -------------------------------------


def stranger_at(*shares: float) -> tuple[dict[str, str], dict[str, list]]:
    return ({BEN: "stranger"}, {BEN: [(B, index, s) for index, s in enumerate(shares)]})


def test_a_friend_below_the_floor_is_wrongly_left_out() -> None:
    """The error that costs a merge: the reader photographed this person and the
    floor says they are not in the frame, so the frame's people shrink and it nests
    where it should not."""
    seen = floor.populations({ANNE: "friend"}, {ANNE: [(A, 0, 0.05)]})

    missed, admitted = floor.wrong(0.10, seen)

    assert [one.person for one in missed] == [ANNE]
    assert admitted == []


def test_a_stranger_at_or_above_the_floor_is_wrongly_let_in() -> None:
    """The error that costs a split, which is the destructive direction and the
    whole reason this ticket exists."""
    given, shares = stranger_at(0.25)
    seen = floor.populations(given, shares)

    missed, admitted = floor.wrong(0.10, seen)

    assert missed == []
    assert [one.person for one in admitted] == [BEN]


def test_a_floor_names_the_persons_it_gets_wrong_and_not_only_a_count() -> None:
    """User story 18: a bad value is diagnosable rather than merely scored."""
    seen = floor.populations(
        {ANNE: "friend", BEN: "stranger", CARA: "friend"},
        {ANNE: [(A, 0, 0.02)], BEN: [(B, 0, 0.40)], CARA: [(C, 0, 0.60)]},
    )

    missed, admitted = floor.wrong(0.10, seen)

    assert {one.person for one in missed} == {ANNE}
    assert {one.person for one in admitted} == {BEN}


def test_a_floor_of_zero_lets_everybody_in() -> None:
    seen = floor.populations(
        {ANNE: "friend", BEN: "stranger"},
        {ANNE: [(A, 0, 0.02)], BEN: [(B, 0, 0.02)]},
    )

    missed, admitted = floor.wrong(0.0, seen)

    assert missed == []
    assert [one.person for one in admitted] == [BEN]


# --- what a floor would do to the stacks --------------------------------------

# One nine-frame burst. `ANNE` is in every frame of it and `BEN` wanders through
# three, which is the destructive case the ticket was written about.
BURST = tuple(sha_of(f"burst{index}") for index in range(9))


def test_a_floor_that_changes_no_frames_people_changes_no_stack() -> None:
    shares = {frame: {ANNE: 0.40} for frame in BURST}

    assert floor.changed(shares, stacked(BURST), set(), 0.10, against=0.20) == []


def test_a_floor_that_drops_a_wanderer_out_of_three_frames_changes_that_stack() -> None:
    """The number priced in the thing it affects, which is user story 17: not how
    many boxes moved but how many stacks the reader would see differently."""
    shares = {frame: {ANNE: 0.40} for frame in BURST}
    for frame in BURST[2:5]:
        shares[frame] = {ANNE: 0.40, BEN: 0.06}

    assert floor.changed(shares, stacked(BURST), set(), 0.10, against=0.02) == [BURST[0]]


def test_the_count_is_stacks_and_not_frames() -> None:
    """Three frames of one burst changed is one stack changed. A count of frames
    would price a nine-frame burst as though it were nine questions."""
    shares = {frame: {ANNE: 0.40} for frame in BURST}
    for frame in BURST[2:5]:
        shares[frame] = {ANNE: 0.40, BEN: 0.06}
    shares[E] = {CARA: 0.06}
    shares[F] = {CARA: 0.40}

    moved = floor.changed(shares, stacked(BURST, (E, F)), set(), 0.10, against=0.02)

    assert sorted(moved) == sorted([BURST[0], E])


def test_a_stranger_is_out_of_every_frame_whatever_the_floor_says() -> None:
    """The verdict is the primary evidence and the floor is a pre-filter in front
    of it, so a person the reader has marked as a stranger cannot be let back in by
    lowering the floor -- there is nothing left for it to change."""
    shares = {frame: {ANNE: 0.40} for frame in BURST}
    for frame in BURST[2:5]:
        shares[frame] = {ANNE: 0.40, BEN: 0.06}

    assert floor.changed(shares, stacked(BURST), {BEN}, 0.10, against=0.02) == []


def test_a_frame_in_no_stack_changes_no_stack() -> None:
    assert floor.changed({E: {ANNE: 0.06}}, {}, set(), 0.10, against=0.02) == []


def test_the_people_a_floor_admits_are_the_boxes_that_reach_it() -> None:
    """The seam `changed` is built on, asserted on its own: a box at the floor
    counts and a box below it does not."""
    seen = floor.sets({A: {ANNE: 0.10, BEN: 0.09}}, set(), 0.10)

    assert seen == {A: frozenset({ANNE})}


# --- the report ---------------------------------------------------------------


def test_a_separated_population_is_reported_as_separated() -> None:
    lines = "\n".join(
        floor.report(
            floor.populations(
                {ANNE: "friend", BEN: "stranger"},
                {ANNE: [(A, 0, 0.40)], BEN: [(B, 0, 0.03)]},
            ),
            {A: {ANNE: 0.40}, B: {BEN: 0.03}},
            stacked((A, B)),
            {BEN},
        )
    )

    assert "separates" in lines
    assert "no floor separates" not in lines


def test_an_overlapping_population_says_so_plainly_and_keeps_the_provisional_value() -> None:
    """User story 16, and the outcome the ticket was designed to survive: where the
    proxy does not work, the recommendation is to leave the floor where it is as a
    cheap pre-filter and let the verdict do the work."""
    lines = "\n".join(
        floor.report(
            floor.populations(
                {ANNE: "friend", BEN: "stranger", CARA: "friend", DAN: "stranger"},
                {
                    ANNE: [(A, 0, 0.40)],
                    BEN: [(B, 0, 0.50)],
                    CARA: [(C, 0, 0.03)],
                    DAN: [(D, 0, 0.02)],
                },
            ),
            {A: {ANNE: 0.40}, B: {BEN: 0.50}, C: {CARA: 0.03}, D: {DAN: 0.02}},
            stacked((A, B), (C, D)),
            {BEN, DAN},
        )
    )

    assert "no floor separates" in lines
    assert f"{FLOOR}" in lines


def test_the_report_counts_the_clusters_the_reader_called_two_people() -> None:
    """A clustering failure is reportable rather than silently answered, and the
    count is what would justify a ticket to act on it."""
    lines = "\n".join(
        floor.report(
            floor.populations(
                {ANNE: "two-people", BEN: "two-people", CARA: "friend"},
                {ANNE: [(A, 0, 0.4)], BEN: [(B, 0, 0.4)], CARA: [(C, 0, 0.4)]},
            ),
            {},
            {},
            set(),
            given={ANNE: "two-people", BEN: "two-people", CARA: "friend"},
        )
    )

    assert "2 the reader called two people" in lines
    # Named, not only counted: acting on a clustering failure means finding it.
    assert ANNE in lines and BEN in lines
    # And kept out of the floor's evidence -- one friend, no strangers.
    assert "no floor separates" in lines


def test_the_sweep_reaches_the_provisional_floor() -> None:
    """So the table always prices where the floor actually stands, which is the row
    every other row is being compared against."""
    assert FLOOR in floor.SWEEP


def test_no_answers_is_a_finding_rather_than_a_report() -> None:
    lines = "\n".join(floor.report({"friend": [], "stranger": []}, {}, {}, set()))

    assert "no" in lines.lower()


# --- what it reads, and what it does not --------------------------------------


def test_the_floor_report_never_names_the_state_database() -> None:
    tree = ast.parse(Path(floor.__file__).read_text(encoding="utf-8"))
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


def test_the_provisional_floor_is_read_and_never_moved() -> None:
    """The report prices a move and does not make one. `photolib.people.FLOOR` is
    the only line that reads the floor, and this module reads it rather than
    carrying a second copy that could come to disagree."""
    assert floor.PROVISIONAL is FLOOR


def test_only_a_stranger_is_left_out_of_a_frames_people() -> None:
    """The report's strangers and the harness's `counts` are one rule, not two."""
    assert floor.excluded({ANNE: "friend", BEN: "stranger", CARA: "unsure"}) == {BEN}
    assert all(people.counts(given) for given in ("friend", "unsure", "two-people"))
