"""Tests for the candidate enumeration and the cheap screen.

Every test runs against a temporary catalog+state pair and vectors it constructs
itself, so nothing here loads DINOv2 or opens the network -- what is under test is
which pairs the fence admits, which of them can be screened, and what a re-run
does, rather than a model's opinion of a photograph. Nothing here opens a path
from config.toml.

Vectors are built from an angle -- two dimensions of `DIM` and zeros after -- so
the cosine of two frames is the cosine of the angle between them and every screen
expected in this file is arithmetic rather than a magic number.
"""

from __future__ import annotations

import math
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pytest

from photolib import browse, candidates
from photolib.candidates import (
    CandidatesRefused,
    Work,
    catalog,
    count,
    fanouts,
    population,
    refuse_if_busy,
    refuse_if_rethresholded,
    runs,
    screen_all,
    screened,
    worklist,
)
from photolib.config import Config
from photolib.fingerprints import DIM, MODEL, VERSION, to_blob
from photolib.grid import DEFAULT_KINDS

BASE = datetime(2021, 6, 1, 12, 0, 0)
EXIF = "exif:DateTimeOriginal"
OTHER_MODEL = "dinov2_vitl14"


def sha_of(seed: str) -> str:
    """A 64-hex string that reads as a hash without being one."""
    return (seed * 64)[:64]


def unit(angle: float) -> np.ndarray:
    """A unit vector at `angle` in the first two dimensions, zero in the rest."""
    vector = np.zeros(DIM, dtype=np.float32)
    vector[0], vector[1] = math.cos(angle), math.sin(angle)
    return vector


class Corpus:
    """A catalog of tiles placed in time, each with a fingerprint by default."""

    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn
        self.next_id = 0

    def add(
        self,
        seed: str,
        second: int,
        *,
        camera: str | None = "Lumix",
        kind: str | None = "image",
        taken_src: str = EXIF,
        angle: float = 0.0,
        vector: bool = True,
    ) -> str:
        """One tile, `second` seconds after the corpus's base capture time."""
        sha256 = sha_of(seed)
        self.conn.execute(
            "INSERT INTO file (sha256, size, ext, kind, state, feature_ver, camera, taken_src)"
            " VALUES (?, 1, '.jpg', ?, 'published', '{}', ?, ?)",
            (sha256, kind, camera, taken_src),
        )
        self.next_id += 1
        self.conn.execute(
            "INSERT INTO photo (id, rep_sha256, sort_key) VALUES (?, ?, ?)",
            (self.next_id, sha256, (BASE + timedelta(seconds=second)).isoformat()),
        )
        if vector:
            self.fingerprint(sha256, angle=angle)
        self.conn.commit()
        return sha256

    def fingerprint(self, sha256: str, *, model: str = MODEL, angle: float = 0.0) -> None:
        self.conn.execute(
            "INSERT INTO fingerprint (model, version, sha256, vector) VALUES (?, ?, ?, ?)",
            (model, VERSION, sha256, to_blob(unit(angle))),
        )
        self.conn.commit()

    def frames(self) -> list[tuple]:
        return population(self.conn)

    def plan(self, **kwargs) -> tuple[Work, candidates.Vectors]:
        return worklist(self.conn, **kwargs)

    def work(self, **kwargs) -> Work:
        return self.plan(**kwargs)[0]

    def screen(
        self, *, ceiling: int = candidates.CEILING, model: str = MODEL, **kwargs
    ) -> dict:
        work, stored = worklist(self.conn, ceiling=ceiling, model=model)
        return screen_all(self.conn, work.todo, stored, model=model, **kwargs)

    def rows(self) -> list[tuple[str, str, float, str]]:
        return self.conn.execute(
            "SELECT sha_early, sha_late, screen, verdict FROM candidate_pair"
            " ORDER BY sha_early, sha_late"
        ).fetchall()

    def stored_pairs(self) -> set[tuple[str, str]]:
        return {(early, late) for early, late, _, _ in self.rows()}


@pytest.fixture
def corpus(conn) -> Corpus:
    return Corpus(conn)


def pairs_of(frames, ceiling: int) -> set[tuple[str, str]]:
    return {(early, late) for early, later in fanouts(frames, ceiling) for late in later}


# --- the window fence --------------------------------------------------------


def test_two_captures_inside_the_window_are_a_candidate(corpus: Corpus) -> None:
    a = corpus.add("1", 0)
    b = corpus.add("2", 3)

    assert pairs_of(corpus.frames(), 4) == {(a, b)}


def test_two_captures_beyond_the_window_are_not(corpus: Corpus) -> None:
    corpus.add("1", 0)
    corpus.add("2", 5)

    assert pairs_of(corpus.frames(), 4) == set()


def test_the_window_is_a_ceiling_and_not_an_exclusive_bound(corpus: Corpus) -> None:
    """A gap of exactly the window stacks, which is why `browse.py` reads whole
    seconds with `unixepoch`: the float form reads four seconds as 4.0000185."""
    a = corpus.add("1", 0)
    b = corpus.add("2", 4)

    assert pairs_of(corpus.frames(), 4) == {(a, b)}
    assert pairs_of(corpus.frames(), 3) == set()


def test_a_run_yields_every_pair_and_not_only_the_adjacent_ones(corpus: Corpus) -> None:
    """Complete linkage is why: a stack is a clique, so the first and third frames
    of a run owe each other a verdict even though six seconds separate them."""
    a = corpus.add("1", 0)
    b = corpus.add("2", 3)
    c = corpus.add("3", 6)

    assert pairs_of(corpus.frames(), 4) == {(a, b), (b, c), (a, c)}


def test_the_gap_that_breaks_a_run_is_the_one_between_neighbours(corpus: Corpus) -> None:
    """The fence tests the chain, so a run reaches as far as its gaps let it: four
    frames three seconds apart are one run of four at a window of 4."""
    for seed, second in zip("1234", (0, 3, 6, 9)):
        corpus.add(seed, second)

    assert count(corpus.frames(), 4) == 6


def test_a_lone_capture_is_no_pair_at_all(corpus: Corpus) -> None:
    corpus.add("1", 0)

    assert (list(runs(corpus.frames(), 4)), count(corpus.frames(), 4)) == ([], 0)


def test_a_narrower_window_admits_fewer_pairs(corpus: Corpus) -> None:
    """The shape of ADR 0003's table -- 308k pairs at 60s against 3.63M at 3600s --
    on a corpus small enough to count by hand."""
    for seed, second in zip("1234", (0, 30, 300, 3000)):
        corpus.add(seed, second)
    frames = corpus.frames()

    assert [count(frames, bound) for bound in (4, 60, 900, 3600)] == [0, 1, 3, 6]


# --- who is in the population ------------------------------------------------


def test_a_tile_dated_from_mtime_is_never_a_candidate(corpus: Corpus) -> None:
    a = corpus.add("1", 0)
    b = corpus.add("2", 2)
    corpus.add("3", 1, taken_src="mtime")

    assert pairs_of(corpus.frames(), 4) == {(a, b)}


def test_a_tile_dated_from_a_filename_is_never_a_candidate(corpus: Corpus) -> None:
    """A copy date is not when the photograph was taken."""
    corpus.add("1", 0, taken_src="filename")
    corpus.add("2", 2, taken_src="filename")

    assert pairs_of(corpus.frames(), 4) == set()


def test_an_undated_tile_is_never_a_candidate(corpus: Corpus) -> None:
    """The '-' sentinel an undated photo sorts on, which `unixepoch` reads as NULL."""
    corpus.add("1", 0)
    corpus.conn.execute("UPDATE photo SET sort_key = '-' WHERE id = 1")
    corpus.add("2", 2)

    assert pairs_of(corpus.frames(), 4) == set()


def test_two_cameras_shooting_at_once_do_not_pair(corpus: Corpus) -> None:
    a = corpus.add("1", 0)
    b = corpus.add("2", 2)
    c = corpus.add("3", 1, camera="NEX-5N")
    d = corpus.add("4", 3, camera="NEX-5N")

    assert pairs_of(corpus.frames(), 4) == {(a, b), (c, d)}


def test_two_frames_from_a_body_that_recorded_no_name_still_pair(corpus: Corpus) -> None:
    """`browse.py` compares cameras with `IS` for this reason: two nameless frames
    are consecutive captures from one camera as far as this grouping can tell."""
    a = corpus.add("1", 0, camera=None)
    b = corpus.add("2", 2, camera=None)

    assert pairs_of(corpus.frames(), 4) == {(a, b)}


def test_the_earlier_capture_is_the_early_side_of_the_pair(corpus: Corpus) -> None:
    """`sha_early` is temporal and not lexicographic: the later frame sorts first
    here, and the pair is still stored the way the camera shot it."""
    early = corpus.add("f", 0)
    late = corpus.add("0", 2)

    assert late < early
    assert pairs_of(corpus.frames(), 4) == {(early, late)}


# --- agreement with the grid -------------------------------------------------


EVERY_KIND = ("image", "raw_image", "video")


def test_the_runs_are_the_ones_the_grid_already_forms(corpus: Corpus) -> None:
    """The load-bearing agreement. `browse.stack_count_sql` counts stacks over this
    same population -- runs of the stackable tiles, plus one apiece for the tiles it
    excludes from stacking -- so the two numbers must match at any window.

    Every kind is passed, because a kind is the one filter of the grid's that this
    population does not apply: see the test below for why that is deliberate.
    """
    for seed, second in zip("12345", (0, 2, 9, 11, 400)):
        corpus.add(seed, second)
    corpus.add("6", 3, taken_src="mtime")
    corpus.add("7", 4, camera="NEX-5N")
    corpus.add("8", 5, camera=None)
    frames = corpus.frames()
    tiles = corpus.conn.execute("SELECT count(*) FROM photo").fetchone()[0]

    for window in (1, 2, 3, 4, 10):
        query = browse.parse({"stack": [str(window)]}, kinds=EVERY_KIND)
        sql, params = browse.stack_count_sql(query)
        grid = corpus.conn.execute(sql, params).fetchone()[0]

        grouped = list(runs(frames, window))
        alone = len(frames) - sum(len(run) for run in grouped)
        unstackable = tiles - len(frames)

        assert len(grouped) + alone + unstackable == grid, window


def test_the_fence_ignores_the_reader_s_filters(corpus: Corpus) -> None:
    """A frame the reader has filtered away is still in the population, so the fence
    cuts the same runs whatever is on screen. ADR 0003 makes membership a property of
    the photographs -- "filtering shrinks a stack and never splits it" -- and a fence
    that moved with the view would break that. The grid hides video by default
    (`grid.DEFAULT_KINDS`), and this population holds it regardless.
    """
    corpus.add("1", 0)
    corpus.add("2", 2)
    corpus.add("3", 4, kind="video", vector=False)

    hidden = browse.parse({"stack": ["4"]}, kinds=DEFAULT_KINDS)
    sql, params = browse.stack_count_sql(hidden)
    on_screen = corpus.conn.execute(sql, params).fetchone()[0]

    assert on_screen == 1  # two stills, one stack; the video is not in the view
    assert [len(run) for run in runs(corpus.frames(), 4)] == [3]


# --- the screen --------------------------------------------------------------


def test_every_candidate_carries_the_cosine_of_the_two_vectors(corpus: Corpus) -> None:
    a = corpus.add("1", 0, angle=0.0)
    b = corpus.add("2", 2, angle=math.pi / 3)
    corpus.screen()

    ((early, late, screen, _verdict),) = corpus.rows()
    assert (early, late) == (a, b)
    assert screen == pytest.approx(math.cos(math.pi / 3), abs=1e-6)


def test_a_pair_at_the_threshold_survives(corpus: Corpus) -> None:
    """The bound is inclusive, so two identical vectors survive a threshold of 1."""
    corpus.add("1", 0)
    corpus.add("2", 2)
    corpus.screen(threshold=1.0)

    assert [row[3] for row in corpus.rows()] == ["survivor"]


def test_a_pair_below_the_threshold_is_recorded_as_screened_out(corpus: Corpus) -> None:
    """A named state and not a zero: "never plausibly the same picture" has to stay
    distinguishable from "checked properly and disagreed"."""
    corpus.add("1", 0, angle=0.0)
    corpus.add("2", 2, angle=math.pi / 2)
    corpus.screen(threshold=0.6)

    ((_, _, screen, verdict),) = corpus.rows()
    assert (verdict, screen) == ("screened_out", pytest.approx(0.0, abs=1e-6))


def test_the_verdict_vocabulary_is_the_schema_s_and_not_a_convention(corpus: Corpus) -> None:
    sha256 = corpus.add("1", 0)

    with pytest.raises(sqlite3.IntegrityError):
        corpus.conn.execute(
            "INSERT INTO candidate_pair (model, version, sha_early, sha_late, screen, verdict)"
            " VALUES (?, ?, ?, ?, 1.0, 'maybe')",
            (MODEL, VERSION, sha256, sha256),
        )


def test_a_moved_threshold_is_a_re_read_and_never_a_re_run(corpus: Corpus) -> None:
    """ADR 0003 makes strictness a reader-facing knob, which is only free if the
    score is stored: the survivors at 0.9 are a query over the rows written at 0.5.
    """
    corpus.add("1", 0, angle=0.0)
    corpus.add("2", 2, angle=math.acos(0.8))
    corpus.screen(threshold=0.5)

    tighter = corpus.conn.execute("SELECT count(*) FROM candidate_pair WHERE screen >= 0.9")
    assert tighter.fetchone()[0] == 0
    assert [row[3] for row in corpus.rows()] == ["survivor"]


# --- frames that cannot be screened ------------------------------------------


def test_a_video_is_counted_and_never_paired(corpus: Corpus) -> None:
    """Ticket 29 puts the video tiles out of scope, and they have no fingerprint to
    be screened with either."""
    a = corpus.add("1", 0)
    b = corpus.add("2", 4)
    corpus.add("3", 2, kind="video", vector=False)
    corpus.screen()

    work = corpus.work()
    assert (work.videos, work.unvectored) == (1, [])
    assert corpus.stored_pairs() == {(a, b)}


def test_a_photograph_with_no_fingerprint_is_named_and_never_paired(corpus: Corpus) -> None:
    """A hole in the derivative tree, so it is listed rather than counted."""
    a = corpus.add("1", 0)
    b = corpus.add("2", 4)
    orphan = corpus.add("3", 2, vector=False)
    corpus.screen()

    work = corpus.work()
    assert (work.videos, work.unvectored) == (0, [orphan])
    assert corpus.stored_pairs() == {(a, b)}


def test_an_unscreenable_frame_does_not_break_the_run_around_it(corpus: Corpus) -> None:
    """The fence is cut over the whole population, which is what makes it agree with
    the grid: a video inside a burst neither joins a pair nor splits the run, the
    way an mtime-dated frame does not in `browse.py`."""
    a = corpus.add("1", 0)
    corpus.add("2", 4, kind="video", vector=False)
    b = corpus.add("3", 8)
    corpus.screen(ceiling=4)

    assert count(corpus.frames(), 4) == 3
    assert corpus.stored_pairs() == {(a, b)}


def test_a_tile_whose_kind_was_never_determined_is_screened(corpus: Corpus) -> None:
    """"Not a video" is the criterion here as in `fingerprints`, which embeds a tile
    of no recorded kind rather than dropping it -- so this screens one."""
    a = corpus.add("1", 0, kind=None)
    b = corpus.add("2", 2, kind=None)
    corpus.screen()

    assert (corpus.work().videos, corpus.stored_pairs()) == (0, {(a, b)})


def test_the_pairs_a_missing_fingerprint_costs_are_reported(corpus: Corpus) -> None:
    corpus.add("1", 0)
    corpus.add("2", 2)
    corpus.add("3", 4, vector=False)
    work = corpus.work(ceiling=4)

    assert (work.candidates, work.screenable) == (3, 1)


# --- resume and idempotence --------------------------------------------------


def test_a_second_pass_of_a_finished_corpus_writes_nothing(corpus: Corpus) -> None:
    for seed, second in zip("123", (0, 2, 4)):
        corpus.add(seed, second)
    corpus.screen()
    before = corpus.rows()

    assert corpus.work().todo == []
    assert corpus.screen()["written"] == 0
    assert corpus.rows() == before


def test_an_interrupted_pass_resumes_where_it_reached(corpus: Corpus) -> None:
    for seed, second in zip("1234", (0, 2, 4, 6)):
        corpus.add(seed, second)
    work, stored = corpus.plan()
    every = {(early, late) for early, later in work.todo for late in later}

    # One fan-out lands; the pass then dies with the rest unwritten.
    screen_all(corpus.conn, work.todo[:1], stored)
    assert 0 < len(corpus.stored_pairs()) < len(every)

    resumed = corpus.work()
    assert [early for early, _ in resumed.todo] == [early for early, _ in work.todo[1:]]
    corpus.screen()
    assert corpus.stored_pairs() == every


def test_a_frame_that_gains_a_fingerprint_later_is_paired_after_all(corpus: Corpus) -> None:
    """The reason the worklist reads the tally and not just the name. Fill a missing
    substrate, re-run `fingerprints`, and the frames already screened owe a pair each
    against the newcomer -- a worklist keyed on the name alone would call them done.
    """
    a = corpus.add("1", 0)
    b = corpus.add("2", 2)
    late = corpus.add("3", 4, vector=False)
    corpus.screen()
    assert corpus.stored_pairs() == {(a, b)}

    corpus.fingerprint(late)
    corpus.screen()

    assert corpus.stored_pairs() == {(a, b), (a, late), (b, late)}


def test_a_transaction_holds_whole_fan_outs(corpus: Corpus, monkeypatch) -> None:
    """What makes the resume above exact: a frame's tally in the table is either all
    of the pairs it heads or none, so one query is the whole worklist."""
    for seed, second in zip("12345", (0, 2, 4, 6, 8)):
        corpus.add(seed, second)
    work, stored = corpus.plan()
    owed = {early: set(later) for early, later in work.todo}
    transactions: list[list[tuple]] = []
    store = candidates._store

    def spy(conn, rows):
        transactions.append(list(rows))
        return store(conn, rows)

    monkeypatch.setattr(candidates, "_store", spy)
    screen_all(corpus.conn, work.todo, stored, batch=1)

    assert len(transactions) == len(work.todo)
    for rows in transactions:
        heads = {row[2] for row in rows}
        assert {(row[2], row[3]) for row in rows} == {
            (head, late) for head in heads for late in owed[head]
        }


def test_a_frame_whose_partners_are_all_unscreenable_is_not_owed_work(corpus: Corpus) -> None:
    """Otherwise it would sit in the worklist forever, writing nothing each time and
    making a finished pass look unfinished."""
    corpus.add("1", 0)
    corpus.add("2", 2, vector=False)
    corpus.screen()

    assert corpus.work().todo == []


def test_screened_is_one_query_over_the_key(corpus: Corpus) -> None:
    a = corpus.add("1", 0)
    corpus.add("2", 2)
    corpus.screen()

    assert screened(corpus.conn) == {a: 1}
    assert screened(corpus.conn, model=OTHER_MODEL) == {}


def test_a_new_model_owes_itself_every_pair_again(corpus: Corpus) -> None:
    """008's reasoning, carried here: a change of model adds a population rather
    than overwriting one, and the old screens stay readable as the old model's."""
    a = corpus.add("1", 0)
    b = corpus.add("2", 2)
    corpus.screen()
    for sha256 in (a, b):
        corpus.fingerprint(sha256, model=OTHER_MODEL)

    assert [early for early, _ in corpus.work(model=OTHER_MODEL).todo] == [a]
    corpus.screen(model=OTHER_MODEL)

    assert corpus.conn.execute(
        "SELECT model, count(*) FROM candidate_pair GROUP BY model ORDER BY model"
    ).fetchall() == [(OTHER_MODEL, 1), (MODEL, 1)]


# --- refusals ----------------------------------------------------------------


def test_the_pass_refuses_while_a_writer_holds_the_catalog(migrated) -> None:
    """Invariant 6: exclusive maintenance does not run alongside a writer."""
    catalog_db, _ = migrated
    writer = catalog(catalog_db)
    reader = catalog(catalog_db)
    writer.execute("BEGIN IMMEDIATE")
    try:
        with pytest.raises(CandidatesRefused, match="another writer holds the catalog"):
            refuse_if_busy(reader)
    finally:
        writer.execute("ROLLBACK")
        writer.close()
        reader.close()


def test_the_pass_does_not_refuse_when_nobody_holds_it(migrated) -> None:
    conn = catalog(migrated[0])
    try:
        refuse_if_busy(conn)
    finally:
        conn.close()


def test_a_triage_write_is_not_a_writer_holding_the_catalog(migrated) -> None:
    """Why state is not attached: `BEGIN IMMEDIATE` takes the write lock on every
    attached database, so the grid saving a reject would otherwise read as a writer
    on the catalog and refuse a pass that never touches state."""
    catalog_db, state_db = migrated
    triage = sqlite3.connect(state_db, isolation_level=None)
    conn = catalog(catalog_db)
    triage.execute("BEGIN IMMEDIATE")
    try:
        refuse_if_busy(conn)
    finally:
        triage.execute("ROLLBACK")
        triage.close()
        conn.close()


def test_the_pass_refuses_when_the_screen_has_moved_under_the_stored_verdicts(
    corpus: Corpus,
) -> None:
    """`verdict` is the one derived value in the table, and a re-run cannot repair it
    -- every frame is already done -- so a moved `SCREEN` has to be refused rather
    than answered at the old threshold for ever."""
    corpus.add("1", 0, angle=0.0)
    corpus.add("2", 2, angle=math.acos(0.8))
    corpus.screen(threshold=0.5)

    refuse_if_rethresholded(corpus.conn, 0.5)
    with pytest.raises(CandidatesRefused, match="verdict decided at a screen other than 0.9"):
        refuse_if_rethresholded(corpus.conn, 0.9)


def test_a_verdict_at_the_screen_in_force_is_not_a_refusal(corpus: Corpus) -> None:
    """Both sides of the comparison, so the check cannot pass by never firing."""
    corpus.add("1", 0, angle=0.0)
    corpus.add("2", 2, angle=math.pi / 2)
    corpus.add("3", 4, angle=0.0)
    corpus.screen(threshold=0.5)

    refuse_if_rethresholded(corpus.conn, 0.5)


def test_the_pass_refuses_before_the_fingerprints_exist(
    corpus: Corpus, tmp_path: Path, migrated
) -> None:
    corpus.add("1", 0, vector=False)
    corpus.add("2", 2, vector=False)
    corpus.conn.close()

    with pytest.raises(CandidatesRefused, match="no fingerprints"):
        candidates.run(synthetic_config(tmp_path, migrated))


# --- the command -------------------------------------------------------------


def synthetic_config(tmp_path: Path, migrated: tuple[Path, Path]) -> Config:
    """A config whose every path but the database pair points at nothing.

    This is the "never opens a path under the vault" criterion made testable: a
    pass that touched any of them would fail here rather than pass quietly. There
    is no substrate root either -- this pass reads vectors, not frames.
    """
    catalog_db, state_db = migrated
    absent = tmp_path / "no-such-drive"
    return Config(
        photos_root=absent / "photos",
        restic_repo=absent / "ResticPhotos",
        mediavault_root=absent / "MediaVault",
        mediavault_manifest_db=absent / "MediaVault" / "manifest.sqlite3",
        vault_root=absent / "vault",
        staging_root=absent / "vault" / ".staging",
        deriv_root=absent / "vault" / "deriv",
        meta_root=absent / "vault" / "meta",
        thumb_root=absent / "thumb",
        substrate_root=absent / "substrate",
        catalog_db=catalog_db,
        state_db=state_db,
        backup_root=absent / "backups",
        reveal_root=absent / "vault",
        restic_password_command="false",
    )


def stored_count(catalog_db: Path) -> int:
    conn = sqlite3.connect(catalog_db)
    try:
        return conn.execute("SELECT count(*) FROM candidate_pair").fetchone()[0]
    finally:
        conn.close()


def test_run_screens_every_pair_without_opening_the_vault(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    for seed, second in zip("123", (0, 2, 4)):
        corpus.add(seed, second)
    orphan = corpus.add("4", 6, vector=False)
    corpus.conn.close()

    assert candidates.run(synthetic_config(tmp_path, migrated)) == 0

    report = capsys.readouterr().out
    assert "3 pairs to screen" in report
    assert orphan in report  # named, not a frame that silently matches nothing
    assert stored_count(migrated[0]) == 3


def test_run_says_so_when_there_is_nothing_to_do(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    corpus.add("1", 0)
    corpus.add("2", 2)
    corpus.screen()
    corpus.conn.close()

    assert candidates.run(synthetic_config(tmp_path, migrated)) == 0
    assert "nothing to do" in capsys.readouterr().out


def test_run_honours_a_limit(corpus: Corpus, tmp_path: Path, migrated) -> None:
    for seed, second in zip("123", (0, 2, 4)):
        corpus.add(seed, second)
    corpus.conn.close()

    assert candidates.run(synthetic_config(tmp_path, migrated), limit=1) == 0
    assert stored_count(migrated[0]) == 2


def test_counts_prints_the_table_and_writes_nothing(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    """ADR 0003's table made runnable, which is how the enumeration is checked
    against the numbers the window value was chosen from."""
    for seed, second in zip("1234", (0, 30, 300, 3000)):
        corpus.add(seed, second)
    corpus.conn.close()

    assert candidates.counts(synthetic_config(tmp_path, migrated)) == 0

    report = capsys.readouterr().out
    assert "4 EXIF-dated tiles" in report
    assert all(f"{bound}s" in report for bound in candidates.BOUNDS)
    assert stored_count(migrated[0]) == 0
