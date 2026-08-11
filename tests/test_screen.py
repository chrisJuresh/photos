"""Tests for the screen pricing -- what a looser fingerprint screen buys and costs.

The module under test is a **measurement and never a pass**, so what is tested is
the two things it could be quietly wrong about.

The first is **why a pair the reader kept together carries no Match row**. Three
answers look alike from a distance and have different fixes: the screen rejected
the pair, a substrate the derivative tree owes is missing, or the pair was never a
candidate at all. Only the first is bought back by moving the screen, so mixing
them up would price a change that cannot deliver what it promises.

The second is **that a screen value is answered from the stored cosine and never
from the stored verdict**. `candidate_pair.verdict` is frozen at 0.40 and
`photolib.candidates.refuse_if_rethresholded` exists to stop it going stale, so a
report that read it would answer every question at 0.40 while appearing to sweep.

Nothing here opens a substrate, a label file, or a path from `config.toml`. Cosines
and Match rows are written by the test, so every expectation is arithmetic.
"""

from __future__ import annotations

import sqlite3

import numpy as np
import pytest

from harness import calibrate, screen
from photolib import candidates
from photolib.fingerprints import DIM, MODEL, VERSION, to_blob
from photolib.matches import METHOD
from photolib.matches import VERSION as MATCH_VERSION


def sha_of(seed: str) -> str:
    """A 64-hex string that reads as a hash without being one."""
    return (seed * 64)[:64]


A, B, C, D = (sha_of(seed) for seed in "abcd")


def holding(
    *,
    cosines: dict | None = None,
    matched: tuple = (),
    fingerprinted: tuple = (A, B, C, D),
    videos: tuple = (),
) -> screen.Seen:
    """What the catalog says about a handful of pairs, written by hand."""
    return screen.Seen(
        cosines=dict(cosines or {}),
        matched=frozenset(matched),
        fingerprinted=frozenset(fingerprinted),
        videos=frozenset(videos),
    )


# --- why a kept pair carries no Match row -------------------------------------


def test_a_kept_pair_with_a_match_row_is_already_reached() -> None:
    found = screen.reach((A, B), holding(cosines={(A, B): 0.9}, matched=[(A, B)]))

    assert (found.cause, found.reached_at(screen.SCREEN)) == ("matched", True)


def test_a_kept_pair_the_screen_rejected_is_the_screens_own_cost() -> None:
    found = screen.reach((A, B), holding(cosines={(A, B): 0.31}))

    assert (found.cause, found.cosine) == ("screened_out", 0.31)


def test_a_survivor_with_no_match_row_is_a_missing_substrate() -> None:
    """`photolib.matches` skips a pair whose substrate it cannot read, and leaves
    no row rather than a zero. So a survivor with no Match is a hole in the tree
    and not a disagreement."""
    found = screen.reach((A, B), holding(cosines={(A, B): 0.88}))

    assert found.cause == "substrate_missing"


def test_a_frame_with_no_fingerprint_is_the_same_hole_one_stage_earlier() -> None:
    found = screen.reach((A, B), holding(fingerprinted=(A,)))

    assert found.cause == "unfingerprinted"


def test_a_kept_pair_holding_a_video_is_not_a_hole_at_all() -> None:
    """Nothing fingerprints a video and ticket 29 puts one out of scope, so a pair
    holding one is missing nothing the derivative tree owes it."""
    found = screen.reach((A, B), holding(fingerprinted=(A,), videos=(B,)))

    assert found.cause == "video"


def test_a_pair_of_fingerprinted_frames_that_is_no_candidate_is_named_as_neither() -> None:
    found = screen.reach((A, B), holding())

    assert found.cause == "uncandidated"


def test_a_pair_is_found_whichever_way_round_the_labels_name_it() -> None:
    """The labels order a pair by the run and the enumeration by (camera,
    sort_key, sha256), so the lookup asks both ways rather than assuming."""
    found = screen.reach((B, A), holding(cosines={(A, B): 0.31}))

    assert (found.cause, found.cosine) == ("screened_out", 0.31)


# --- what moving the screen buys ----------------------------------------------


def test_loosening_the_screen_reaches_exactly_the_rejected_pairs_above_it() -> None:
    rejected = screen.reach((A, B), holding(cosines={(A, B): 0.31}))

    assert [rejected.reached_at(value) for value in (0.40, 0.35, 0.31, 0.30)] == [
        False,
        False,
        True,
        True,
    ]


def test_tightening_past_a_matched_pairs_screen_loses_it() -> None:
    """A value is read as what it decides and not as what happens to be stored
    under it: at 0.50 this pair would never have been checked, whatever rows a
    pass at 0.40 left behind."""
    matched = screen.reach((A, B), holding(cosines={(A, B): 0.45}, matched=[(A, B)]))

    assert [matched.reached_at(value) for value in (0.40, 0.50)] == [True, False]


def test_no_screen_value_reaches_a_pair_with_no_candidate_row() -> None:
    """The floor on recall this ticket exists to price: a missing substrate is not
    bought back by any screen, however loose."""
    hole = screen.reach((A, B), holding(fingerprinted=(A,)))

    assert [hole.reached_at(value) for value in (0.40, 0.05, -1.0)] == [False, False, False]


def test_the_reached_count_is_the_matched_pairs_plus_the_ones_recovered() -> None:
    found = screen.reaches(
        [(A, B), (B, C), (C, D)],
        holding(
            cosines={(A, B): 0.9, (B, C): 0.31}, matched=[(A, B)], fingerprinted=(A, B, C)
        ),
    )

    assert [screen.reached(found, value) for value in (0.40, 0.30)] == [1, 2]


# --- which pairs are asked about ----------------------------------------------


def answer(members, *, surrounding=(), evicted=(), included=()) -> dict:
    """One row of `labels.sqlite3`, in the shape `label.answers` hands it over."""
    return {
        "members": list(members),
        "camera": "Lumix",
        "verdict": "accept",
        "evicted": list(evicted),
        "included": list(included),
        "surrounding": list(surrounding),
    }


def test_a_pair_two_answers_agree_about_is_asked_about_once() -> None:
    """The two rounds partition one run under different linkage rules, so their
    sets overlap. The unit here is the pair, and counting it twice would weight
    the share this report prices by how often the sampler returned to a run."""
    run = (A, B, C)
    cases = [
        calibrate.case(answer([A, B]), run),
        calibrate.case(answer([A, B, C]), run),
    ]

    assert screen.kept(cases) == [(A, B), (A, C), (B, C)]


# --- what it would cost -------------------------------------------------------


def test_a_pass_is_priced_at_the_rate_the_last_one_measured() -> None:
    a_minute = int(screen.PAIRS_PER_SECOND * 60)
    cost = screen.price(a_minute)

    assert (round(cost.seconds), cost.bytes) == (60, a_minute * screen.BYTES_PER_PAIR)


def test_a_screen_that_lets_nothing_new_through_costs_nothing() -> None:
    cost = screen.price(0)

    assert (cost.seconds, cost.bytes) == (0.0, 0)


def test_tightening_the_screen_asks_for_no_new_work() -> None:
    """The rows are already stored, so a tighter screen is a smaller table and
    never a pass. Priced at zero rather than at a negative."""
    row = screen.row(0.50, surviving=300, matched_rows=500, found=[])

    assert (row.fresh, row.cost.seconds) == (0, 0.0)


def test_a_row_prices_only_the_pairs_that_are_not_already_matched() -> None:
    row = screen.row(0.30, surviving=900, matched_rows=500, found=[])

    assert row.fresh == 400


# --- read from the stored cosine, never from the stored verdict ----------------


class Catalog:
    """A catalog holding a few frames, their screens and their Matches."""

    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn
        self.next_id = 0

    def frame(self, sha256: str, *, kind: str = "image", vector: bool = True) -> str:
        self.conn.execute(
            "INSERT INTO file (sha256, size, ext, kind, state, feature_ver, camera, taken_src)"
            " VALUES (?, 1, '.jpg', ?, 'published', '{}', 'Lumix', 'exif:DateTimeOriginal')",
            (sha256, kind),
        )
        self.next_id += 1
        self.conn.execute(
            "INSERT INTO photo (id, rep_sha256, sort_key)"
            " VALUES (?, ?, '2021-06-01T12:00:00')",
            (self.next_id, sha256),
        )
        if vector:
            self.conn.execute(
                "INSERT INTO fingerprint (model, version, sha256, vector) VALUES (?, ?, ?, ?)",
                (MODEL, VERSION, sha256, to_blob(np.zeros(DIM, dtype=np.float32))),
            )
        self.conn.commit()
        return sha256

    def candidate(
        self, early: str, late: str, cosine: float, *, verdict: str | None = None
    ) -> None:
        self.conn.execute(
            "INSERT INTO candidate_pair (model, version, sha_early, sha_late, screen, verdict)"
            " VALUES (?, ?, ?, ?, ?, ?)",
            (
                MODEL,
                VERSION,
                early,
                late,
                cosine,
                verdict or ("survivor" if cosine >= screen.SCREEN else "screened_out"),
            ),
        )
        self.conn.commit()

    def match(self, early: str, late: str, points: int = 40) -> None:
        self.conn.execute(
            "INSERT INTO pair_match (method, version, sha_early, sha_late, points)"
            " VALUES (?, ?, ?, ?, ?)",
            (METHOD, MATCH_VERSION, early, late, points),
        )
        self.conn.commit()


@pytest.fixture
def catalog(conn) -> Catalog:
    return Catalog(conn)


def test_survivors_are_counted_from_the_stored_cosine_and_not_the_stored_verdict(
    catalog: Catalog,
) -> None:
    """The whole measurement turns on this: `verdict` is frozen at 0.40, so a
    report reading it would answer every value in the sweep at 0.40."""
    for sha256 in (A, B, C):
        catalog.frame(sha256)
    catalog.candidate(A, B, 0.31)
    catalog.candidate(A, C, 0.55)
    catalog.candidate(B, C, 0.20)

    assert screen.surviving(catalog.conn, (0.60, 0.40, 0.30, 0.10)) == {
        0.60: 0,
        0.40: 1,
        0.30: 2,
        0.10: 3,
    }


def test_what_the_catalog_says_about_a_pair_is_read_from_the_catalog(catalog: Catalog) -> None:
    for sha256 in (A, B):
        catalog.frame(sha256)
    catalog.frame(C, vector=False)
    catalog.frame(D, kind="video", vector=False)
    catalog.candidate(A, B, 0.90)
    catalog.match(A, B)

    found = screen.seen(catalog.conn, [(A, B), (A, C), (A, D)])

    assert (found.cosines, found.matched) == ({(A, B): 0.90}, {(A, B)})
    assert (found.fingerprinted, found.videos) == ({A, B}, {D})


def test_a_measurement_refuses_a_table_whose_verdicts_were_decided_elsewhere(
    catalog: Catalog,
) -> None:
    """The refusal guarding the screen constant is borrowed whole rather than
    weakened: pricing a move away from 0.40 means nothing if the rows on the disk
    were decided at some other value."""
    for sha256 in (A, B):
        catalog.frame(sha256)
    catalog.candidate(A, B, 0.31, verdict="survivor")

    with pytest.raises(candidates.CandidatesRefused):
        screen.measure(catalog.conn, [(A, B)])


def test_a_measurement_writes_nothing(catalog: Catalog) -> None:
    for sha256 in (A, B):
        catalog.frame(sha256)
    catalog.candidate(A, B, 0.31)
    rows = "SELECT sha_early, sha_late, screen, verdict FROM candidate_pair"
    before = catalog.conn.execute(rows).fetchall()

    screen.measure(catalog.conn, [(A, B)], thresholds=(0.40, 0.30))

    matched = catalog.conn.execute("SELECT count(*) FROM pair_match").fetchone()[0]
    assert (catalog.conn.execute(rows).fetchall(), matched) == (before, 0)


def test_a_measurement_prices_every_value_it_was_asked_for(catalog: Catalog) -> None:
    """And the value that buys every rejected pair back, which is 0.31 here: the
    row the decision is actually between is not one the caller had to guess."""
    for sha256 in (A, B, C):
        catalog.frame(sha256)
    catalog.candidate(A, B, 0.31)
    catalog.candidate(A, C, 0.90)
    catalog.match(A, C)

    found, rows = screen.measure(catalog.conn, [(A, B), (A, C)], thresholds=(0.40, 0.30))

    assert [row.threshold for row in rows] == [0.30, 0.31, 0.40]
    assert [row.reached for row in rows] == [2, 2, 1]
    assert [row.fresh for row in rows] == [1, 1, 0]
    assert [one.cause for one in found] == ["screened_out", "matched"]


def test_the_value_that_buys_everything_back_is_the_weakest_pair_the_screen_lost() -> None:
    found = screen.reaches(
        [(A, B), (B, C)], holding(cosines={(A, B): 0.31, (B, C): 0.09})
    )

    assert screen.everything(found) == 0.09
