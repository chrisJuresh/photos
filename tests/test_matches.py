"""Tests for the geometric check and the Match it produces.

The seam is `match(frame_a, frame_b)`, which takes two images rather than two
sha256s, so everything here is asserted over pictures this file draws -- the prior
art is `tests/test_features.py`, which asserts on `pixel_features` over arrays it
constructs. The two habits ADR 0003 says the library is made of are what the first
section is: an exposure bracket changes brightness while the geometry stays put,
and a handheld reposition moves the geometry while the subject stays the same.

The rest runs against a temporary catalog+state pair and a substrate tree of real
webps, and none of it opens a path from config.toml.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

import cv2
import numpy as np
import pytest
from PIL import Image

from photolib import matches
from photolib.candidates import CandidatesRefused, catalog
from photolib.config import Config, substrate_path
from photolib.fingerprints import MODEL, VERSION as SCREEN_VERSION
from photolib.matches import (
    METHOD,
    NEEDED,
    VERSION,
    MatchesRefused,
    Work,
    check_all,
    chunks,
    features,
    match,
    matched,
    read,
    worklist,
)

WIDTH, HEIGHT = 384, 288
OTHER_METHOD = "disk_lightglue"


def blobs(seed: int, count: int = 90, width: int = WIDTH, height: int = HEIGHT) -> np.ndarray:
    """A photograph's worth of structure without a photograph.

    Gaussian blobs at a spread of radii, because that is what a scale-space
    detector has anything to find: uniform noise gives SIFT no stable extremum
    and a flat wall gives it nothing at all, and neither would test the thing
    this module does to real frames.
    """
    rng = np.random.default_rng(seed)
    ys, xs = np.mgrid[0:height, 0:width].astype(np.float32)
    frame = np.full((height, width), 40.0, dtype=np.float32)
    for _ in range(count):
        centre_x, centre_y = rng.uniform(0, width), rng.uniform(0, height)
        radius = rng.uniform(4, 20)
        frame += rng.uniform(60, 200) * np.exp(
            -(((xs - centre_x) ** 2 + (ys - centre_y) ** 2) / (2 * radius**2))
        )
    return np.clip(frame, 0, 255).astype(np.uint8)


def exposed(frame: np.ndarray, stops: float) -> np.ndarray:
    """The same scene one bracket step away: brightness moves, geometry does not."""
    return np.clip(frame.astype(np.float32) * 2.0**stops, 0, 255).astype(np.uint8)


def repositioned(frame: np.ndarray, dx: int = 6, dy: int = 4, degrees: float = 0.0) -> np.ndarray:
    """The same scene after a handheld nudge between presses."""
    centre = (frame.shape[1] / 2, frame.shape[0] / 2)
    transform = cv2.getRotationMatrix2D(centre, degrees, 1.0)
    transform[0, 2] += dx
    transform[1, 2] += dy
    return cv2.warpAffine(frame, transform, (frame.shape[1], frame.shape[0]))


# --- the seam ----------------------------------------------------------------

STRONG = 20  # points. Well above the four a homography is fitted from.


def test_a_frame_matches_itself() -> None:
    frame = blobs(1)

    assert match(frame, frame) >= STRONG


def test_a_copy_at_a_different_exposure_matches() -> None:
    """The bracket. ADR 0003's first habit, and the one the stored perceptual hash
    could not survive: a two-stop change moves every pixel and no point."""
    frame = blobs(2)

    assert match(frame, exposed(frame, -1.5)) >= STRONG


def test_a_copy_shifted_by_a_few_pixels_matches() -> None:
    """The handheld reposition. ADR 0003's second habit."""
    frame = blobs(3)

    assert match(frame, repositioned(frame)) >= STRONG


def test_a_copy_nudged_and_turned_slightly_still_matches() -> None:
    """A reposition is rarely a pure translation, and the transform fitted is a
    homography rather than an offset for exactly that reason."""
    frame = blobs(4)

    assert match(frame, repositioned(frame, degrees=2.0)) >= STRONG


def test_two_unrelated_textures_do_not_match() -> None:
    """Turning the camera to face something else. The precision constraint: never
    open a stack and see two unrelated photographs."""
    assert match(blobs(5), blobs(6)) < NEEDED


def test_the_match_is_symmetric_enough_to_be_one_number() -> None:
    """The table stores one row per pair, ordered by capture and not by which
    frame is easier to describe, so the two directions must agree closely."""
    a, b = blobs(7), repositioned(blobs(7), degrees=1.0)

    forward, backward = match(a, b), match(b, a)
    assert min(forward, backward) >= STRONG
    assert abs(forward - backward) <= max(forward, backward) * 0.2


def test_a_frame_with_no_texture_left_matches_nothing() -> None:
    """The named failure: a bracket end blown out past having any texture left.
    ADR 0003 accepts the consequence -- one true stack drawn as two -- and this is
    the fixture that would show it becoming common enough to escalate."""
    frame = blobs(8)
    blown = exposed(frame, 3.0)

    assert len(features(blown)) < NEEDED
    assert match(frame, blown) == 0


def test_a_blank_frame_is_a_match_of_zero_and_not_a_crash() -> None:
    """`agree` is reached with no descriptors at all whenever a substrate is a
    plain sky, so the floor has to be a number rather than an exception."""
    blank = np.full((HEIGHT, WIDTH), 128, dtype=np.uint8)

    assert (len(features(blank)), match(blank, blank)) == (0, 0)


def test_a_colour_frame_is_matched_on_its_structure() -> None:
    """`read` hands over grayscale, but the seam takes whatever a test draws."""
    gray = blobs(9)
    colour = np.repeat(gray[:, :, None], 3, axis=2)

    assert match(colour, repositioned(colour)) >= STRONG


# --- reading a substrate -----------------------------------------------------


def test_a_substrate_is_read_down_to_the_detector_s_side(tmp_path: Path) -> None:
    path = tmp_path / "wide.webp"
    Image.fromarray(blobs(10, width=2048, height=1365)).save(path, "WEBP", quality=95)

    frame = read(path)

    assert (frame.ndim, max(frame.shape)) == (2, matches.SIDE)


def test_a_substrate_smaller_than_the_side_is_not_enlarged(tmp_path: Path) -> None:
    path = tmp_path / "small.webp"
    Image.fromarray(blobs(11)).save(path, "WEBP", quality=95)

    assert read(path).shape == (HEIGHT, WIDTH)


# --- the corpus --------------------------------------------------------------


def sha_of(seed: str) -> str:
    """A 64-hex string that reads as a hash without being one."""
    return (seed * 64)[:64]


class Corpus:
    """Candidate pairs over a substrate tree of real, distinguishable frames."""

    def __init__(self, conn, root: Path) -> None:
        self.conn = conn
        self.substrates = root / "substrate"
        self.next_id = 0

    def add(
        self,
        seed: str,
        second: int,
        *,
        texture: int | None = None,
        substrate: bool = True,
        camera: str | None = "Lumix",
    ) -> str:
        """One tile at `second` seconds past the hour, and the frame it draws."""
        sha256 = sha_of(seed)
        self.conn.execute(
            "INSERT INTO file (sha256, size, ext, kind, state, feature_ver, camera, taken_src)"
            " VALUES (?, 1, '.jpg', 'image', 'published', '{}', ?, 'exif:DateTimeOriginal')",
            (sha256, camera),
        )
        self.next_id += 1
        self.conn.execute(
            "INSERT INTO photo (id, rep_sha256, sort_key) VALUES (?, ?, ?)",
            (self.next_id, sha256, f"2021-06-01T12:00:{second:02d}"),
        )
        if substrate:
            self.write_substrate(sha256, self.next_id if texture is None else texture)
        self.conn.commit()
        return sha256

    def write_substrate(self, sha256: str, texture: int = 1) -> Path:
        """A real webp, so the detector runs rather than being stubbed around."""
        target = substrate_path(self.substrates, sha256)
        target.parent.mkdir(parents=True, exist_ok=True)
        Image.fromarray(blobs(texture)).save(target, "WEBP", quality=95)
        return target

    def candidate(self, early: str, late: str, *, verdict: str = "survivor") -> None:
        self.conn.execute(
            "INSERT OR REPLACE INTO candidate_pair"
            " (model, version, sha_early, sha_late, screen, verdict) VALUES (?, ?, ?, ?, ?, ?)",
            (MODEL, SCREEN_VERSION, early, late, 0.9, verdict),
        )
        self.conn.commit()

    def survivors(self, *shas: str) -> None:
        """Every pair of a run, the way complete linkage enumerates one."""
        for index, early in enumerate(shas):
            for late in shas[index + 1 :]:
                self.candidate(early, late)

    def work(self, **kwargs) -> Work:
        return worklist(self.conn, self.substrates, **kwargs)

    def check(self, todo=None, **kwargs) -> dict:
        return check_all(
            self.conn, self.work().todo if todo is None else todo, self.substrates, **kwargs
        )

    def rows(self) -> list[tuple[str, str, int]]:
        return self.conn.execute(
            "SELECT sha_early, sha_late, points FROM pair_match ORDER BY sha_early, sha_late"
        ).fetchall()

    def pairs(self) -> set[tuple[str, str]]:
        return {(early, late) for early, late, _ in self.rows()}


@pytest.fixture
def corpus(conn, tmp_path: Path) -> Corpus:
    return Corpus(conn, tmp_path)


# --- what gets checked -------------------------------------------------------


def test_every_survivor_carries_a_match(corpus: Corpus) -> None:
    a = corpus.add("1", 0, texture=1)
    b = corpus.add("2", 2, texture=1)
    c = corpus.add("3", 4, texture=2)
    corpus.survivors(a, b, c)
    corpus.check()

    assert corpus.pairs() == {(a, b), (a, c), (b, c)}


def test_two_frames_of_one_picture_agree_on_many_points(corpus: Corpus) -> None:
    a = corpus.add("1", 0, texture=1)
    b = corpus.add("2", 2, texture=1)
    corpus.survivors(a, b)
    corpus.check()

    ((_, _, points),) = corpus.rows()
    assert points >= STRONG


def test_two_frames_of_different_pictures_agree_on_almost_none(corpus: Corpus) -> None:
    a = corpus.add("1", 0, texture=1)
    b = corpus.add("2", 2, texture=2)
    corpus.survivors(a, b)
    corpus.check()

    ((_, _, points),) = corpus.rows()
    assert points < NEEDED


def test_a_screened_out_pair_is_never_checked(corpus: Corpus) -> None:
    """The screen's whole purpose: 84% of the candidates never reach the detector,
    and a re-run must not quietly walk them again."""
    a = corpus.add("1", 0, texture=1)
    b = corpus.add("2", 2, texture=1)
    corpus.candidate(a, b, verdict="screened_out")

    assert corpus.work().todo == []
    corpus.check()
    assert corpus.rows() == []


def test_a_pair_the_screen_never_saw_is_not_checked_either(corpus: Corpus) -> None:
    """The population is the candidate table and never the catalog: this pass does
    not re-enumerate, and a pair with no row upstream has no row here."""
    corpus.add("1", 0)
    corpus.add("2", 2)
    corpus.check()

    assert corpus.rows() == []


def test_the_match_records_the_method_that_produced_it(corpus: Corpus) -> None:
    a = corpus.add("1", 0)
    corpus.add("2", 2)
    corpus.survivors(a, sha_of("2"))
    corpus.check()

    assert corpus.conn.execute(
        "SELECT DISTINCT method, version FROM pair_match"
    ).fetchall() == [(METHOD, VERSION)]


def test_a_new_method_owes_itself_every_pair_again(corpus: Corpus) -> None:
    """010's reasoning: a change of detector adds a population rather than
    overwriting one, and the old counts stay readable as the old method's."""
    a = corpus.add("1", 0)
    b = corpus.add("2", 2)
    corpus.survivors(a, b)
    corpus.check()

    assert [early for early, _ in corpus.work(method=OTHER_METHOD).todo] == [a]
    corpus.check(corpus.work(method=OTHER_METHOD).todo, method=OTHER_METHOD)

    assert corpus.conn.execute(
        "SELECT method, count(*) FROM pair_match GROUP BY method ORDER BY method"
    ).fetchall() == [(OTHER_METHOD, 1), (METHOD, 1)]


# --- the order the work is done in -------------------------------------------


def test_the_fan_outs_are_walked_in_capture_order(corpus: Corpus) -> None:
    """Load-bearing, and the reason `worklist` reads the population at all: a frame
    described once serves every pair it heads, and only capture order keeps a
    frame's partners together. Both seeds here sort the wrong way lexically."""
    late = corpus.add("f", 0)
    early = corpus.add("0", 2)
    third = corpus.add("a", 4)
    corpus.survivors(late, early, third)

    assert [head for head, _ in corpus.work().todo] == [late, early]
    assert corpus.work().todo[0][1] == [early, third]


def test_a_chunk_is_bounded_by_the_frames_it_describes() -> None:
    todo = [("a", ["b", "c"]), ("b", ["c"]), ("d", ["e"])]

    assert list(chunks(todo, frames=3)) == [[("a", ["b", "c"]), ("b", ["c"])], [("d", ["e"])]]


def test_a_fan_out_wider_than_the_bound_is_still_one_chunk() -> None:
    """Otherwise a long burst would be dropped rather than merely be expensive."""
    todo = [("a", ["b", "c", "d"])]

    assert list(chunks(todo, frames=2)) == [todo]


# --- frames with nothing to read ---------------------------------------------


def test_a_survivor_whose_substrate_is_missing_is_named_and_never_checked(
    corpus: Corpus,
) -> None:
    """A hole in the derivative tree, so it is listed rather than counted -- and a
    pair that could not be checked gets no row, because zero means checked."""
    a = corpus.add("1", 0)
    b = corpus.add("2", 2)
    hole = corpus.add("3", 4, substrate=False)
    corpus.survivors(a, b, hole)
    corpus.check()

    work = corpus.work()
    assert work.substrateless == [hole]
    assert (work.survivors, work.checkable) == (3, 1)
    assert corpus.pairs() == {(a, b)}


def test_a_substrate_that_will_not_decode_is_reported_and_costs_only_its_pairs(
    corpus: Corpus,
) -> None:
    """Survivable rather than fatal, for `fingerprints._decode`'s reason: resuming
    re-reaches the same file and fails again."""
    a = corpus.add("1", 0)
    b = corpus.add("2", 2)
    corrupt = corpus.add("3", 4)
    substrate_path(corpus.substrates, corrupt).write_bytes(b"not a webp")
    corpus.survivors(a, b, corrupt)

    result = corpus.check()

    assert [sha256 for sha256, _ in result["unreadable"]] == [corrupt]
    assert corpus.pairs() == {(a, b)}


def test_a_corrupt_substrate_leaves_a_pass_unfinished_rather_than_wrong(
    corpus: Corpus,
) -> None:
    """A fan-out is done when it carries every Match it is owed, so one partner
    that will not decode keeps its fan-out on the worklist for ever -- which is
    how the corruption keeps being reported, exactly as an undecodable substrate
    keeps being reported by `photolib.fingerprints`. The cost is that the run's
    readable pairs are checked again; what must not happen is their Match moving.
    """
    a = corpus.add("1", 0, texture=1)
    b = corpus.add("2", 2, texture=1)
    corrupt = corpus.add("3", 4)
    substrate_path(corpus.substrates, corrupt).write_bytes(b"not a webp")
    corpus.survivors(a, b, corrupt)
    corpus.check()
    before = corpus.rows()

    again = corpus.check()

    assert corpus.rows() == before
    assert [sha256 for sha256, _ in again["unreadable"]] == [corrupt]


def test_a_frame_that_gains_a_substrate_later_is_checked_after_all(corpus: Corpus) -> None:
    """The reason the worklist reads the tally and not just the name: fill the hole
    and the frames already checked owe a Match each against the newcomer."""
    a = corpus.add("1", 0, texture=1)
    b = corpus.add("2", 2, texture=1)
    late = corpus.add("3", 4, substrate=False)
    corpus.survivors(a, b, late)
    corpus.check()
    assert corpus.pairs() == {(a, b)}

    corpus.write_substrate(late, texture=1)
    corpus.check()

    assert corpus.pairs() == {(a, b), (a, late), (b, late)}


# --- resume and idempotence --------------------------------------------------


def test_a_second_pass_of_a_finished_corpus_writes_nothing(corpus: Corpus) -> None:
    a = corpus.add("1", 0)
    b = corpus.add("2", 2)
    c = corpus.add("3", 4)
    corpus.survivors(a, b, c)
    corpus.check()
    before = corpus.rows()

    assert corpus.work().todo == []
    assert corpus.check()["written"] == 0
    assert corpus.rows() == before


def test_an_interrupted_pass_resumes_where_it_reached(corpus: Corpus) -> None:
    shas = [corpus.add(seed, second) for seed, second in zip("1234", (0, 2, 4, 6))]
    corpus.survivors(*shas)
    todo = corpus.work().todo
    every = {(early, late) for early, later in todo for late in later}

    # One fan-out lands; the pass then dies with the rest unwritten.
    corpus.check(todo[:1])
    assert 0 < len(corpus.pairs()) < len(every)

    assert [early for early, _ in corpus.work().todo] == [early for early, _ in todo[1:]]
    corpus.check()
    assert corpus.pairs() == every


def test_a_transaction_holds_whole_fan_outs(corpus: Corpus, monkeypatch) -> None:
    """What makes the resume above exact: a frame's tally in the table is either
    all of the Matches it heads or none, so one query is the whole worklist."""
    shas = [corpus.add(seed, second) for seed, second in zip("1234", (0, 2, 4, 6))]
    corpus.survivors(*shas)
    owed = {early: set(later) for early, later in corpus.work().todo}
    transactions: list[list[tuple]] = []
    store = matches._store

    def spy(conn, rows):
        transactions.append(list(rows))
        return store(conn, rows)

    monkeypatch.setattr(matches, "_store", spy)
    corpus.check(frames=2)

    assert len(transactions) == len(owed)
    for rows in transactions:
        heads = {row[2] for row in rows}
        assert {(row[2], row[3]) for row in rows} == {
            (head, late) for head in heads for late in owed[head]
        }


def test_matched_is_one_query_over_the_key(corpus: Corpus) -> None:
    a = corpus.add("1", 0)
    b = corpus.add("2", 2)
    corpus.survivors(a, b)
    corpus.check()

    assert matched(corpus.conn) == {a: 1}
    assert matched(corpus.conn, method=OTHER_METHOD) == {}


def test_a_description_is_reused_across_the_pairs_that_need_it(corpus: Corpus) -> None:
    """The pass is worth running only if this holds: four frames of one run are
    six pairs, and describing a frame once per pair would cost twelve descriptions
    where five will do."""
    shas = [corpus.add(seed, second) for seed, second in zip("1234", (0, 2, 4, 6))]
    corpus.survivors(*shas)
    described: list[Path] = []
    describe = matches._describe

    def spy(path: Path):
        described.append(path)
        return describe(path)

    with pytest.MonkeyPatch.context() as patch:
        patch.setattr(matches, "_describe", spy)
        corpus.check()

    assert len(corpus.rows()) == 6
    assert sorted(described) == sorted(set(described))
    assert len(described) == len(shas)


# --- refusals ----------------------------------------------------------------


def test_the_pass_refuses_while_a_writer_holds_the_catalog(
    corpus: Corpus, tmp_path: Path, migrated
) -> None:
    """Invariant 6, reached through `candidates.refuse_if_busy` rather than
    restated -- but surfacing as this module's own refusal, so the command line
    catches one type and a borrowed check is not a traceback."""
    corpus.add("1", 0)
    corpus.conn.close()
    writer = catalog(migrated[0])
    writer.execute("BEGIN IMMEDIATE")
    try:
        with pytest.raises(MatchesRefused, match="another writer holds the catalog"):
            matches.run(synthetic_config(tmp_path, migrated, corpus.substrates))
        assert not issubclass(MatchesRefused, CandidatesRefused)
    finally:
        writer.execute("ROLLBACK")
        writer.close()


def test_the_pass_refuses_before_the_screen_has_run(
    corpus: Corpus, tmp_path: Path, migrated
) -> None:
    corpus.add("1", 0)
    corpus.add("2", 2)
    corpus.conn.close()

    with pytest.raises(MatchesRefused, match="no candidate pairs"):
        matches.run(synthetic_config(tmp_path, migrated, corpus.substrates))


def test_the_pass_refuses_without_a_substrate_tree(
    corpus: Corpus, tmp_path: Path, migrated
) -> None:
    corpus.conn.close()

    with pytest.raises(MatchesRefused, match="substrate tree not found"):
        matches.run(synthetic_config(tmp_path, migrated, tmp_path / "no-such-tree"))


# --- the command -------------------------------------------------------------


def synthetic_config(tmp_path: Path, migrated: tuple[Path, Path], substrates: Path) -> Config:
    """A config whose every path but the databases and the substrate tree points at
    nothing, so a pass that opened one would fail here rather than pass quietly."""
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
        substrate_root=substrates,
        catalog_db=catalog_db,
        state_db=state_db,
        backup_root=absent / "backups",
        reveal_root=absent / "vault",
        restic_password_command="false",
    )


def stored_count(catalog_db: Path) -> int:
    conn = sqlite3.connect(catalog_db)
    try:
        return conn.execute("SELECT count(*) FROM pair_match").fetchone()[0]
    finally:
        conn.close()


def test_run_checks_every_survivor_without_opening_the_vault(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    a = corpus.add("1", 0)
    b = corpus.add("2", 2)
    hole = corpus.add("3", 4, substrate=False)
    corpus.survivors(a, b, hole)
    corpus.conn.close()

    assert matches.run(synthetic_config(tmp_path, migrated, corpus.substrates)) == 0

    report = capsys.readouterr().out
    assert "1 pairs to check" in report
    assert hole in report  # named, not a frame that silently matches nothing
    assert stored_count(migrated[0]) == 1


def test_run_says_so_when_there_is_nothing_to_do(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    a = corpus.add("1", 0)
    b = corpus.add("2", 2)
    corpus.survivors(a, b)
    corpus.check()
    corpus.conn.close()

    assert matches.run(synthetic_config(tmp_path, migrated, corpus.substrates)) == 0
    assert "nothing to do" in capsys.readouterr().out


def test_run_honours_a_limit(corpus: Corpus, tmp_path: Path, migrated) -> None:
    shas = [corpus.add(seed, second) for seed, second in zip("123", (0, 2, 4))]
    corpus.survivors(*shas)
    corpus.conn.close()

    assert matches.run(synthetic_config(tmp_path, migrated, corpus.substrates), limit=1) == 0
    assert stored_count(migrated[0]) == 2


def test_run_reports_the_shape_of_what_it_wrote(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    """The line the next ticket starts from: where a threshold on the Match would
    sit is a question about this distribution, not about any one pair."""
    a = corpus.add("1", 0, texture=1)
    b = corpus.add("2", 2, texture=1)
    c = corpus.add("3", 4, texture=2)
    corpus.survivors(a, b, c)
    corpus.conn.close()

    assert matches.run(synthetic_config(tmp_path, migrated, corpus.substrates)) == 0
    assert "pairs agreeing on none" in capsys.readouterr().out


def test_run_leaves_a_corrupt_substrate_as_a_non_zero_exit(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    a = corpus.add("1", 0)
    b = corpus.add("2", 2)
    substrate_path(corpus.substrates, b).write_bytes(b"not a webp")
    corpus.survivors(a, b)
    corpus.conn.close()

    assert matches.run(synthetic_config(tmp_path, migrated, corpus.substrates)) == 1
    assert "would not decode" in capsys.readouterr().out
