"""Tests for the fingerprint pass.

Every test runs against a temporary catalog+state pair and a synthetic substrate
tree of real but tiny webps, and none of them loads DINOv2 or opens the network:
the encoder is a seam, and what is under test here is the worklist, the resume,
the schema and the report rather than the model's opinion of a photograph.
Nothing here opens a path from config.toml.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pytest
from PIL import Image

from photolib import db, fingerprints
from photolib.config import Config, substrate_path
from photolib.fingerprints import (
    DIM,
    MODEL,
    SIDE,
    VERSION,
    FingerprintsRefused,
    embed_all,
    from_blob,
    photograph_shas,
    preprocess,
    stored,
    to_blob,
    worklist,
)


def sha_of(seed: str) -> str:
    """A 64-hex string that reads as a hash without being one."""
    return (seed * 64)[:64]


class Corpus:
    """A catalog of tiles, and the substrate tree they are drawn from."""

    def __init__(self, conn, root: Path) -> None:
        self.conn = conn
        self.substrates = root / "substrate"
        self.next_id = 0

    def add(
        self,
        seed: str,
        *,
        kind: str = "image",
        state: str = "published",
        substrate: bool = True,
        tile: bool = True,
    ) -> str:
        """One file, its tile, and by default the substrate the pass reads."""
        sha256 = sha_of(seed)
        self.conn.execute(
            "INSERT INTO file (sha256, size, ext, kind, state, feature_ver)"
            " VALUES (?, 1, '.jpg', ?, ?, '{}')",
            (sha256, kind, state),
        )
        if tile:
            self.next_id += 1
            self.conn.execute(
                "INSERT INTO photo (id, rep_sha256, sort_key) VALUES (?, ?, '2021-01-01T00:00:00')",
                (self.next_id, sha256),
            )
        if substrate:
            self.write_substrate(sha256)
        self.conn.commit()
        return sha256

    def write_substrate(self, sha256: str, size: tuple[int, int] = (60, 40)) -> Path:
        """A real webp, so `preprocess` is exercised rather than stubbed around."""
        target = substrate_path(self.substrates, sha256)
        target.parent.mkdir(parents=True, exist_ok=True)
        Image.new("RGB", size, (10, 120, 200)).save(target, "WEBP")
        return target

    def worklist(self, **kwargs) -> tuple[list[str], list[str]]:
        return worklist(self.conn, self.substrates, **kwargs)

    def embed(self, todo, encode=None, **kwargs) -> dict:
        return embed_all(self.conn, todo, self.substrates, encode or ones, **kwargs)

    def vectors(self) -> dict[str, np.ndarray]:
        return {
            row[0]: from_blob(row[1])
            for row in self.conn.execute("SELECT sha256, vector FROM fingerprint")
        }


def ones(batch: np.ndarray) -> np.ndarray:
    """A stand-in encoder: one distinct unit vector per frame, cheap and total."""
    vectors = np.zeros((len(batch), DIM), dtype=np.float32)
    vectors[:, 0] = 1.0
    return vectors


@pytest.fixture
def corpus(conn, tmp_path: Path) -> Corpus:
    return Corpus(conn, tmp_path)


# --- what gets embedded ------------------------------------------------------


def test_every_tile_with_a_substrate_is_fingerprinted(corpus: Corpus) -> None:
    shas = {corpus.add(seed) for seed in "123"}
    todo, missing = corpus.worklist()
    result = corpus.embed(todo)

    assert (set(todo), missing) == (shas, [])
    assert result["written"] == 3
    assert set(corpus.vectors()) == shas


def test_the_row_records_the_model_and_the_version(corpus: Corpus) -> None:
    sha256 = corpus.add("1")
    todo, _ = corpus.worklist()
    corpus.embed(todo)

    assert corpus.conn.execute(
        "SELECT model, version, sha256 FROM fingerprint"
    ).fetchall() == [(MODEL, VERSION, sha256)]


def test_a_new_model_re_embeds_and_leaves_the_old_rows_readable(corpus: Corpus) -> None:
    """A change of model is visible rather than mixed into one population: the
    old vectors stay, and the new model owes itself every tile again."""
    sha256 = corpus.add("1")
    corpus.embed(corpus.worklist()[0])

    todo, _ = corpus.worklist(model="dinov2_vitl14")
    assert todo == [sha256]
    corpus.embed(todo, model="dinov2_vitl14")

    assert corpus.conn.execute(
        "SELECT model, version FROM fingerprint ORDER BY model"
    ).fetchall() == [("dinov2_vitl14", VERSION), (MODEL, VERSION)]
    assert stored(corpus.conn) == {sha256}


def test_video_tiles_are_not_embedded(corpus: Corpus) -> None:
    photograph = corpus.add("1")
    corpus.add("2", kind="video")
    todo, missing = corpus.worklist()

    assert (todo, missing) == ([photograph], [])


def test_a_raw_tile_is_embedded(corpus: Corpus) -> None:
    """Two thousand tiles are `raw_image`. "Not a video" is the criterion, and
    "is an image" would have quietly dropped every one of them."""
    raw = corpus.add("1", kind="raw_image")

    assert corpus.worklist()[0] == [raw]


def test_a_file_that_is_not_a_tile_is_not_embedded(corpus: Corpus) -> None:
    """The other half of a RAW+JPEG pair has a substrate and is never drawn."""
    tile = corpus.add("1")
    corpus.add("2", tile=False)

    assert corpus.worklist()[0] == [tile]


def test_an_unpublished_tile_is_not_embedded(corpus: Corpus) -> None:
    published = corpus.add("1")
    corpus.add("2", state="excluded")

    assert corpus.worklist()[0] == [published]


# --- the two facts the worklist reports --------------------------------------


def test_a_tile_with_no_substrate_is_named_and_gets_no_vector(corpus: Corpus) -> None:
    have, orphan = corpus.add("1"), corpus.add("2", substrate=False)
    todo, missing = corpus.worklist()
    corpus.embed(todo)

    assert (todo, missing) == ([have], [orphan])
    assert orphan not in corpus.vectors()


def test_a_missing_substrate_keeps_being_reported_after_a_full_pass(corpus: Corpus) -> None:
    """The hole in the derivative tree does not go quiet once the pass finishes."""
    corpus.add("1")
    orphan = corpus.add("2", substrate=False)
    corpus.embed(corpus.worklist()[0])

    assert corpus.worklist() == ([], [orphan])


def test_a_second_pass_of_a_finished_corpus_has_nothing_to_do(corpus: Corpus) -> None:
    for seed in "123":
        corpus.add(seed)
    corpus.embed(corpus.worklist()[0])
    before = corpus.vectors()

    todo, missing = corpus.worklist()
    assert (todo, missing) == ([], [])
    assert corpus.embed(todo)["written"] == 0
    assert corpus.vectors().keys() == before.keys()


def test_an_interrupted_pass_resumes_where_it_reached(corpus: Corpus) -> None:
    shas = sorted(corpus.add(seed) for seed in "1234")
    todo, _ = corpus.worklist()

    # One batch of two lands; the pass then dies with the other two unwritten.
    corpus.embed(todo[:2], batch=2)

    resumed, _ = corpus.worklist()
    assert set(resumed) == set(shas) - set(todo[:2])
    corpus.embed(resumed)
    assert set(corpus.vectors()) == set(shas)


def test_a_lost_substrate_does_not_re_open_a_tile_already_done(corpus: Corpus) -> None:
    sha256 = corpus.add("1")
    corpus.embed(corpus.worklist()[0])
    substrate_path(corpus.substrates, sha256).unlink()

    assert corpus.worklist() == ([], [])


# --- decoding and the vector -------------------------------------------------


def test_preprocess_squashes_the_whole_frame_to_the_model_side(corpus: Corpus) -> None:
    """Squashed, not centre-cropped: half a 3:2 frame is half the evidence."""
    path = corpus.write_substrate(sha_of("1"), size=(300, 100))
    frame = preprocess(path)

    assert frame.shape == (3, SIDE, SIDE)
    assert frame.dtype == np.float32


def test_preprocess_normalises_against_the_model_s_statistics(corpus: Corpus) -> None:
    path = corpus.write_substrate(sha_of("1"))
    frame = preprocess(path)
    expected = (np.float32(10 / 255) - fingerprints.MEAN[0]) / fingerprints.STD[0]

    assert frame[0].mean() == pytest.approx(expected, abs=1e-3)


def test_a_vector_round_trips_as_little_endian_float32() -> None:
    vector = np.linspace(-1, 1, DIM, dtype=np.float32)
    blob = to_blob(vector)

    assert len(blob) == DIM * 4
    assert np.array_equal(from_blob(blob), vector)


def test_the_stored_vector_is_what_the_encoder_produced(corpus: Corpus) -> None:
    def ramp(batch: np.ndarray) -> np.ndarray:
        return np.tile(np.linspace(0, 1, DIM, dtype=np.float32), (len(batch), 1))

    sha256 = corpus.add("1")
    corpus.embed(corpus.worklist()[0], encode=ramp)

    assert np.array_equal(corpus.vectors()[sha256], np.linspace(0, 1, DIM, dtype=np.float32))


def test_a_substrate_that_will_not_decode_is_named_not_fatal(corpus: Corpus) -> None:
    """Otherwise a corrupt file ends the pass at the same tile on every resume."""
    good, corrupt = corpus.add("1"), corpus.add("2")
    substrate_path(corpus.substrates, corrupt).write_bytes(b"not a webp")
    result = corpus.embed(corpus.worklist()[0], batch=1)

    assert result["written"] == 1
    assert [sha256 for sha256, _ in result["unreadable"]] == [corrupt]
    assert set(corpus.vectors()) == {good}


def test_a_whole_batch_of_corrupt_substrates_writes_nothing(corpus: Corpus) -> None:
    """The encoder is never handed an empty stack, which numpy refuses."""
    for seed in "12":
        substrate_path(corpus.substrates, corpus.add(seed)).write_bytes(b"not a webp")
    result = corpus.embed(corpus.worklist()[0], batch=2)

    assert (result["written"], len(result["unreadable"])) == (0, 2)
    assert corpus.vectors() == {}


# --- the command -------------------------------------------------------------


def synthetic_config(tmp_path: Path, migrated: tuple[Path, Path]) -> Config:
    """A config whose every `G:` path points at something that does not exist.

    This is the "never opens a path under the vault" criterion made testable: a
    pass that touched any of them would fail here rather than pass quietly.
    """
    catalog, state = migrated
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
        thumb_root=tmp_path / "thumb",
        substrate_root=tmp_path / "substrate",
        catalog_db=catalog,
        state_db=state,
        backup_root=tmp_path / "backups",
        reveal_root=absent / "vault",
        restic_password_command="false",
    )


def test_run_stores_every_vector_without_opening_the_vault(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    shas = {corpus.add(seed) for seed in "123"}
    orphan = corpus.add("4", substrate=False)
    corpus.conn.close()

    assert fingerprints.run(synthetic_config(tmp_path, migrated), encode=ones) == 0

    report = capsys.readouterr().out
    assert "3 tiles to fingerprint" in report
    assert orphan in report  # named, not silently a tile with no vector

    conn = db.connect(*migrated)
    try:
        assert stored(conn) == shas
    finally:
        conn.close()


def test_run_says_so_when_there_is_nothing_to_do(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    """And gets there without loading the model: `encode` is left unset, so a
    pass that reached for one would raise rather than quietly download 85 MB."""
    corpus.add("1")
    corpus.embed(corpus.worklist()[0])
    corpus.conn.close()

    assert fingerprints.run(synthetic_config(tmp_path, migrated)) == 0
    assert "nothing to do" in capsys.readouterr().out


def test_run_reports_a_substrate_that_would_not_decode(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    corrupt = corpus.add("1")
    substrate_path(corpus.substrates, corrupt).write_bytes(b"not a webp")
    corpus.conn.close()

    assert fingerprints.run(synthetic_config(tmp_path, migrated), encode=ones) == 1
    assert corrupt in capsys.readouterr().out


def test_run_refuses_without_a_substrate_tree(tmp_path: Path, migrated) -> None:
    with pytest.raises(FingerprintsRefused, match="substrate tree not found"):
        fingerprints.run(synthetic_config(tmp_path, migrated))


def test_run_honours_a_limit(corpus: Corpus, tmp_path: Path, migrated) -> None:
    for seed in "123":
        corpus.add(seed)
    corpus.conn.close()

    assert fingerprints.run(synthetic_config(tmp_path, migrated), encode=ones, limit=2) == 0

    conn = db.connect(*migrated)
    try:
        assert len(stored(conn)) == 2
    finally:
        conn.close()


def test_run_names_every_missing_tile_rather_than_the_first_few(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    """A hole in the derivative tree is the thing that must not go quiet, so the
    list is not truncated however long it gets."""
    corpus.add("ff")
    orphans = {corpus.add(f"{n:02x}", substrate=False) for n in range(25)}
    corpus.conn.close()

    fingerprints.run(synthetic_config(tmp_path, migrated), encode=ones)

    report = capsys.readouterr().out
    assert all(orphan in report for orphan in orphans)
    assert "more" not in report


def test_two_tiles_naming_one_frame_are_fingerprinted_once(corpus: Corpus) -> None:
    """Nothing in the schema stops `photo.rep_sha256` repeating, and a duplicate
    would be counted twice in "how many it wrote"."""
    sha256 = corpus.add("1")
    corpus.conn.execute(
        "INSERT INTO photo (id, rep_sha256, sort_key) VALUES (99, ?, '2021-01-02T00:00:00')",
        (sha256,),
    )

    assert photograph_shas(corpus.conn) == [sha256]
    assert corpus.embed(corpus.worklist()[0])["written"] == 1


def test_photograph_shas_is_ordered(corpus: Corpus) -> None:
    """A stable order is what makes an interrupted pass resume rather than
    wander: the same tiles come back in the same sequence."""
    for seed in "3142":
        corpus.add(seed)

    assert photograph_shas(corpus.conn) == sorted(photograph_shas(corpus.conn))
