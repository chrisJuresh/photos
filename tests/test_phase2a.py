"""Phase 2a against a synthetic MediaVault: the re-hash, the ARW repair, the
features, and the regression check.

No path from config.toml and no real media. The corpus is six assets chosen for
what they can catch: an orientation-3 ARW whose aspect is unchanged (invisible
to the predicate archive/PLAN.md warns against), an orientation-1 ARW that must be left
alone, and an `.rw2` that v1 already rotated correctly and this must not rotate
twice.
"""

from __future__ import annotations

import hashlib
import io
import json
import sqlite3
from pathlib import Path

import numpy as np
import pytest
from PIL import Image

from archive.pipeline import features, phase2a
from photolib import db
from photolib.config import Config
from photolib.config import thumb_path

# --- a MediaVault made of six assets -----------------------------------------

MANIFEST_SCHEMA = """
CREATE TABLE assets (
  asset_id TEXT, sha256 TEXT, size_bytes INTEGER, preferred_extension TEXT,
  media_kind TEXT, object_relpath TEXT, orientation_text TEXT, width INTEGER, height INTEGER
);
CREATE TABLE derivatives (
  asset_id TEXT, long_edge INTEGER, status TEXT, is_current INTEGER, width INTEGER,
  height INTEGER, representation_kind TEXT, relative_path_text TEXT, checksum_sha256 TEXT
);
CREATE TABLE asset_extended_metadata (
  asset_id TEXT, is_current INTEGER, width INTEGER, height INTEGER, orientation_text TEXT,
  software_text TEXT, edit_history_json TEXT
);
"""

# (name, extension, orientation, representation). The stored derivative for each
# is `upright` turned by the *inverse* of the repair, which is exactly what v1
# left behind for `.arw`; for `.jpg` and `.rw2` it is already upright.
CORPUS = [
    ("jpg-upright", ".jpg", "1", "image"),
    ("rw2-turned", ".rw2", "8", "raw_embedded"),
    ("arw-8", ".arw", "8", "raw_embedded"),
    ("arw-6", ".arw", "6", "raw_embedded"),
    ("arw-3", ".arw", "3", "raw_embedded"),
    ("arw-upright", ".arw", "1", "raw_embedded"),
]
INVERSE = {"8": Image.ROTATE_270, "6": Image.ROTATE_90, "3": Image.ROTATE_180}


def upright(width: int = 96, height: int = 64) -> Image.Image:
    """A frame no rotation of which resembles any other.

    Deliberately asymmetric in both axes and in colour. A four-quadrant test
    card is not enough: its dHash is *identical* to its own 180 degree
    rotation, which would let the orientation-3 case pass on a mistake."""
    y, x = np.mgrid[0:height, 0:width]
    base = 40 + 90 * (x / width) + 50 * (y / height)
    base[: height // 3, : width // 3] = 250
    base[2 * height // 3 :, : width // 4] = 5
    array = np.repeat(base[:, :, None], 3, axis=2).astype(np.uint8)
    array[:, :, 1] = np.clip(array[:, :, 1] * 0.7, 0, 255)
    return Image.fromarray(array)


def brightest_quadrant(image: Image.Image) -> str:
    array = np.asarray(image.convert("L"), dtype=np.float64)
    height, width = array.shape
    means = {
        "tl": array[: height // 2, : width // 2].mean(),
        "tr": array[: height // 2, width // 2 :].mean(),
        "bl": array[height // 2 :, : width // 2].mean(),
        "br": array[height // 2 :, width // 2 :].mean(),
    }
    return max(means, key=means.get)


def _webp(image: Image.Image) -> bytes:
    out = io.BytesIO()
    image.save(out, format="WEBP", quality=95, method=0)
    return out.getvalue()


@pytest.fixture
def vault(tmp_path: Path, migrated: tuple[Path, Path]) -> tuple[Config, sqlite3.Connection, dict]:
    """A MediaVault, a migrated catalog holding its assets, and the corpus map."""
    root = tmp_path / "MediaVault"
    (root / "state").mkdir(parents=True)
    manifest_path = root / "state" / "manifest.sqlite3"
    manifest = sqlite3.connect(manifest_path)
    manifest.executescript(MANIFEST_SCHEMA)

    conn = db.connect(*migrated)
    corpus: dict[str, dict] = {}
    for index, (name, ext, orientation, representation) in enumerate(CORPUS):
        source = upright()
        stored = source.transpose(INVERSE[orientation]) if ext == ".arw" and orientation in INVERSE else source
        if ext == ".rw2" and orientation == "8":
            stored = source.transpose(Image.ROTATE_90)  # v1 got this one right
        payload = _webp(stored)
        object_bytes = f"object for {name}".encode() * 32
        sha256 = hashlib.sha256(object_bytes).hexdigest()
        relpath = f"objects\\sha256\\{sha256[:2]}\\{sha256[2:4]}\\{sha256}_b3_s5_{len(object_bytes)}.blob"
        target = root / relpath.replace("\\", "/")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(object_bytes)

        manifest.execute(
            "INSERT INTO assets VALUES (?,?,?,?,?,?,?,?,?)",
            (name, sha256, len(object_bytes), ext, "image", relpath, orientation, 1, 1),
        )
        corrected = (
            (stored.height, stored.width) if orientation in ("6", "8") else (stored.width, stored.height)
        )
        if ext == ".rw2":
            corrected = (stored.width, stored.height)  # already turned by v1
        manifest.execute(
            "INSERT INTO asset_extended_metadata VALUES (?,1,?,?,?,?,NULL)",
            (name, corrected[0], corrected[1], orientation, "Adobe Lightroom" if index == 0 else None),
        )
        deriv_paths = {}
        for edge in (phase2a.SUBSTRATE_EDGE, phase2a.GRID_EDGE):
            deriv_rel = f"{sha256[:2]}\\{sha256}_{edge}.webp"
            deriv_file = root / "derivatives" / deriv_rel.replace("\\", "/")
            deriv_file.parent.mkdir(parents=True, exist_ok=True)
            deriv_file.write_bytes(payload)
            deriv_paths[edge] = deriv_file
            manifest.execute(
                "INSERT INTO derivatives VALUES (?,?,'ready',1,?,?,?,?,?)",
                (name, edge, stored.width, stored.height, representation, deriv_rel,
                 hashlib.sha256(payload).hexdigest()),
            )
        conn.execute(
            "INSERT INTO file (sha256, size, ext, kind, width, height, vault_relpath, state,"
            " feature_ver) VALUES (?,?,?,'image',?,?,?, 'adopted', ?)",
            (sha256, len(object_bytes), ext, corrected[0], corrected[1], relpath,
             json.dumps({"meta": "mediavault:extended-metadata-v1"})),
        )
        corpus[name] = {
            "sha256": sha256, "ext": ext, "orientation": orientation,
            "object": target, "derivatives": deriv_paths, "stored": stored,
        }
    manifest.commit()
    manifest.close()

    config = Config(
        photos_root=tmp_path / "photos",
        restic_repo=tmp_path / "restic",
        mediavault_root=root,
        mediavault_manifest_db=manifest_path,
        vault_root=tmp_path / "vault",
        staging_root=tmp_path / "vault" / ".staging",
        deriv_root=tmp_path / "vault" / "deriv",
        meta_root=tmp_path / "vault" / "meta",
        thumb_root=tmp_path / "thumb",
        substrate_root=tmp_path / "substrate",
        catalog_db=migrated[0],
        state_db=migrated[1],
        backup_root=tmp_path / "backups",
        reveal_root=root / "objects",
        restic_password_command="true",
    )
    # Step 5's state: every 384px derivative already copied to the NVMe, .arw
    # included and rotated wrong, which is what this step replaces.
    for entry in corpus.values():
        target = thumb_path(config.thumb_root, entry["sha256"])
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(entry["derivatives"][phase2a.GRID_EDGE].read_bytes())
    yield config, conn, corpus
    conn.close()


def scanned(config: Config) -> tuple[dict, dict, dict]:
    from archive.pipeline.adopt_mediavault import open_manifest

    manifest = open_manifest(config.mediavault_manifest_db)
    try:
        assets = phase2a.scan_assets(manifest)
        metadata = phase2a.scan_metadata(manifest)
        derivatives, _ = phase2a.scan_derivatives(
            manifest, (phase2a.SUBSTRATE_EDGE, phase2a.GRID_EDGE, phase2a.DETAIL_EDGE)
        )
    finally:
        manifest.close()
    return assets, metadata, derivatives


# --- A: the object re-hash ---------------------------------------------------


def test_every_object_verifies_and_is_recorded_as_read(vault):
    config, conn, corpus = vault
    result = phase2a.rehash_objects(conn, config)
    assert result["mismatched"] == []
    assert result["read"] == len(corpus)
    assert conn.execute("SELECT count(*) FROM file WHERE state = 'read'").fetchone()[0] == len(corpus)


def test_a_re_run_reads_nothing(vault):
    config, conn, _ = vault
    phase2a.rehash_objects(conn, config)
    again = phase2a.rehash_objects(conn, config)
    assert again["read"] == 0 and again["bytes"] == 0


def test_a_tampered_object_is_a_hard_error_named_not_a_skip(vault):
    config, conn, corpus = vault
    victim = corpus["arw-8"]
    victim["object"].write_bytes(b"these are not the bytes the filename claims")
    result = phase2a.rehash_objects(conn, config)
    assert len(result["mismatched"]) == 1
    expected, actual, path = result["mismatched"][0]
    assert expected == victim["sha256"] and actual != expected and victim["sha256"] in path
    state = conn.execute(
        "SELECT state FROM file WHERE sha256 = ?", (victim["sha256"],)
    ).fetchone()[0]
    assert state == "adopted"  # never promoted, never repaired


def test_the_filename_states_its_size_too(vault):
    config, conn, corpus = vault
    victim = corpus["jpg-upright"]
    victim["object"].write_bytes(b"x" * 999)
    assert len(phase2a.rehash_objects(conn, config)["mismatched"]) == 1


# --- B: the ARW orientation repair -------------------------------------------


def test_the_repair_set_is_the_container_orientation_not_the_aspect(vault):
    config, _conn, corpus = vault
    assets, _, _ = scanned(config)
    chosen = {asset.sha256 for asset in phase2a.repair_set(assets).values()}
    assert chosen == {corpus[name]["sha256"] for name in ("arw-8", "arw-6", "arw-3")}
    # The orientation-3 ARW has the same aspect as an upright one, so an aspect
    # predicate would miss it. It is published upside down, not sideways.
    assert corpus["arw-3"]["stored"].size == upright().size
    assert corpus["arw-upright"]["sha256"] not in chosen
    assert corpus["rw2-turned"]["sha256"] not in chosen


def test_rotation_comes_from_the_container_tag(vault):
    assert phase2a.rotation_for("8") == 90
    assert phase2a.rotation_for("6") == 270
    assert phase2a.rotation_for("3") == 180
    assert phase2a.rotation_for("1") == 0
    assert phase2a.rotation_for(None) == 0


def test_the_repair_turns_each_one_the_right_way(vault):
    config, conn, corpus = vault
    assets, _, derivatives = scanned(config)
    result = phase2a.repair_arw(conn, config, assets, derivatives, decoders=2)
    assert result["assets"] == 3 and result["files"] == 6
    assert result["failed"] == [] and result["mismatch"] == []
    for name in ("arw-8", "arw-6", "arw-3"):
        sha256 = corpus[name]["sha256"]
        assert brightest_quadrant(Image.open(phase2a.deriv_path(config.deriv_root, sha256))) == "tl"
        assert brightest_quadrant(Image.open(thumb_path(config.thumb_root, sha256))) == "tl"


def test_the_repair_leaves_the_untouched_ones_alone(vault):
    config, conn, corpus = vault
    assets, _, derivatives = scanned(config)
    phase2a.repair_arw(conn, config, assets, derivatives, decoders=2)
    for name in ("arw-upright", "jpg-upright", "rw2-turned"):
        sha256 = corpus[name]["sha256"]
        assert not phase2a.deriv_path(config.deriv_root, sha256).exists()
        assert conn.execute(
            "SELECT deriv_rot FROM file WHERE sha256 = ?", (sha256,)
        ).fetchone()[0] is None


def test_mediavaults_own_derivatives_are_never_written(vault):
    """MediaVault is read-only until step 14, and every derivative in it is
    checksummed in the manifest -- rewriting one in place would turn a verified
    tree into checksum mismatches, the signal reserved for real corruption."""
    config, conn, corpus = vault
    before = {
        path: path.read_bytes()
        for entry in corpus.values()
        for path in entry["derivatives"].values()
    }
    assets, _, derivatives = scanned(config)
    phase2a.repair_arw(conn, config, assets, derivatives, decoders=2)
    assert {path: path.read_bytes() for path in before} == before


def test_the_repair_records_the_pre_rotation_raster_and_the_turn(vault):
    config, conn, corpus = vault
    assets, _, derivatives = scanned(config)
    phase2a.repair_arw(conn, config, assets, derivatives, decoders=2)
    row = conn.execute(
        "SELECT deriv_w, deriv_h, deriv_rot FROM file WHERE sha256 = ?",
        (corpus["arw-8"]["sha256"],),
    ).fetchone()
    stored = corpus["arw-8"]["stored"]
    assert row == (stored.width, stored.height, 90)


def test_the_repair_is_idempotent(vault):
    config, conn, _ = vault
    assets, _, derivatives = scanned(config)
    phase2a.repair_arw(conn, config, assets, derivatives, decoders=2)
    again = phase2a.repair_arw(conn, config, assets, derivatives, decoders=2)
    assert again["files"] == 0 and again["assets"] == 0


# --- C: the features ---------------------------------------------------------


def test_features_land_on_every_row_with_a_substrate(vault):
    config, conn, corpus = vault
    assets, metadata, derivatives = scanned(config)
    result = phase2a.compute_features(
        conn, config, assets, metadata, derivatives, readers=4, decoders=2
    )
    assert result["computed"] == len(corpus)
    assert result["errors"] == [] and result["mismatch"] == [] and result["timeouts"] == 0
    rows = conn.execute(
        "SELECT count(*) FROM file WHERE phash IS NOT NULL AND dhash IS NOT NULL"
        " AND thumbhash IS NOT NULL AND quality IS NOT NULL"
    ).fetchone()[0]
    assert rows == len(corpus)
    quality = json.loads(
        conn.execute(
            "SELECT quality FROM file WHERE sha256 = ?", (corpus["jpg-upright"]["sha256"],)
        ).fetchone()[0]
    )
    scalars = [key for key in quality if key not in ("luminance_histogram", "resolution_class")]
    assert len(scalars) == 18
    assert quality["edit_likelihood"] == 1.0  # from software_text, an adopted reading


def test_features_read_the_repaired_substrate(vault):
    """The whole ordering constraint of this step: B before C, or every ARW
    hash is computed from pixels that are 90 degrees out."""
    config, conn, corpus = vault
    assets, metadata, derivatives = scanned(config)
    phase2a.repair_arw(conn, config, assets, derivatives, decoders=2)
    phase2a.compute_features(conn, config, assets, metadata, derivatives, readers=4, decoders=2)

    reference = conn.execute(
        "SELECT dhash FROM file WHERE sha256 = ?", (corpus["jpg-upright"]["sha256"],)
    ).fetchone()[0]
    for name in ("arw-8", "arw-6", "arw-3"):
        row = conn.execute(
            "SELECT dhash, feature_ver FROM file WHERE sha256 = ?", (corpus[name]["sha256"],)
        ).fetchone()
        assert features.hamming(row[0], reference) <= 4, name
        version = json.loads(row[1])
        assert version["phash"].endswith(":raw-preview:repaired")
        assert version["meta"] == "mediavault:extended-metadata-v1"  # step 3's is kept


def test_an_unrepaired_arw_would_hash_as_something_else_entirely(vault):
    """Same corpus without pass B: the point of running the repair first."""
    config, conn, corpus = vault
    assets, metadata, derivatives = scanned(config)
    phase2a.compute_features(conn, config, assets, metadata, derivatives, readers=4, decoders=2)
    reference, wrong = (
        conn.execute("SELECT dhash FROM file WHERE sha256 = ?", (corpus[name]["sha256"],)).fetchone()[0]
        for name in ("jpg-upright", "arw-8")
    )
    assert features.hamming(reference, wrong) > 8


def test_a_checksum_mismatch_is_reported_and_nothing_is_computed_from_it(vault):
    config, conn, corpus = vault
    assets, metadata, derivatives = scanned(config)
    corpus["jpg-upright"]["derivatives"][phase2a.SUBSTRATE_EDGE].write_bytes(b"not the derivative")
    result = phase2a.compute_features(
        conn, config, assets, metadata, derivatives, readers=4, decoders=2
    )
    assert len(result["mismatch"]) == 1
    assert conn.execute(
        "SELECT phash FROM file WHERE sha256 = ?", (corpus["jpg-upright"]["sha256"],)
    ).fetchone()[0] is None


def test_the_composite_is_re_derivable_without_a_decode(vault):
    """The composite is a policy over the other seventeen scalars, so changing
    it must not cost a re-decode of 103,207 files."""
    config, conn, corpus = vault
    assets, metadata, derivatives = scanned(config)
    phase2a.compute_features(conn, config, assets, metadata, derivatives, readers=4, decoders=2)
    sha256 = corpus["jpg-upright"]["sha256"]
    conn.execute(
        "UPDATE file SET quality = json_set(quality, '$.composite_quality', 99.0)"
        " WHERE sha256 = ?",
        (sha256,),
    )
    result = phase2a.recompute_composite(conn)
    assert result["rows"] == len(corpus) and result["changed"] == 1
    quality, version = conn.execute(
        "SELECT quality, feature_ver FROM file WHERE sha256 = ?", (sha256,)
    ).fetchone()
    scalars = json.loads(quality)
    assert scalars["composite_quality"] == features.composite_quality(scalars)
    # the version moves, and the substrate token it carries survives
    assert json.loads(version)["quality"] == f"{features.QUALITY_VER}/deriv1536"


def test_recompute_skips_a_row_that_recorded_a_decode_error(vault):
    config, conn, corpus = vault
    assets, metadata, derivatives = scanned(config)
    corpus["jpg-upright"]["derivatives"][phase2a.SUBSTRATE_EDGE].write_bytes(b"not a derivative")
    phase2a.compute_features(conn, config, assets, metadata, derivatives, readers=4, decoders=2)
    result = phase2a.recompute_composite(conn)
    assert result["skipped"] == 1 and result["rows"] == len(corpus) - 1


def test_features_resume_and_do_not_recompute(vault):
    config, conn, _ = vault
    assets, metadata, derivatives = scanned(config)
    phase2a.compute_features(conn, config, assets, metadata, derivatives, readers=4, decoders=2)
    again = phase2a.compute_features(
        conn, config, assets, metadata, derivatives, readers=4, decoders=2
    )
    assert again["computed"] == 0


# --- E: the regression check --------------------------------------------------


def test_the_regression_check_passes_after_a_full_run(vault):
    config, conn, corpus = vault
    assets, metadata, derivatives = scanned(config)
    phase2a.rehash_objects(conn, config)
    phase2a.repair_arw(conn, config, assets, derivatives, decoders=2)
    phase2a.compute_features(conn, config, assets, metadata, derivatives, readers=4, decoders=2)

    report = phase2a.regression(conn, assets, metadata, derivatives)
    assert report["rotation_wrong"] == []
    assert report["dim_mismatch"] == []
    assert report["polarity_wrong"] == []
    assert set(report["by_orientation"]) == {"1", "3", "6", "8"}
    assert report["by_orientation"]["8"]["rotated 90"] == 1
    assert report["by_orientation"]["3"]["aspect-invisible"] == 1


def test_an_uncorrected_metadata_reading_is_named_not_counted_as_a_failure(vault):
    """The real corpus's `.arw` rows: asset_extended_metadata carries the raw
    embedded preview's dimensions, uncorrected, because v1 read them from the
    same preview whose missing Orientation tag caused the defect. It therefore
    cannot referee the published shape, and saying so is not the same as
    passing it."""
    config, conn, corpus = vault
    assets, metadata, derivatives = scanned(config)
    # Point the .arw readings at the stored preview's own shape, uncorrected,
    # which is what the real manifest holds: 1616x1080 landscape on a tag-8
    # asset whose display shape is portrait.
    for name in ("arw-8", "arw-6"):
        stored = corpus[name]["stored"]
        for asset_id, asset in assets.items():
            if asset.sha256 == corpus[name]["sha256"]:
                metadata[asset_id] = (stored.width, stored.height, *metadata[asset_id][2:])
    phase2a.repair_arw(conn, config, assets, derivatives, decoders=2)
    phase2a.compute_features(conn, config, assets, metadata, derivatives, readers=4, decoders=2)

    report = phase2a.regression(conn, assets, metadata, derivatives)
    assert report["rotation_wrong"] == []  # direction is still asserted
    assert report["polarity_wrong"] == []  # and this is not reported as one
    assert len(report["uncorrected"]) == 2
    assert all(" .arw " in line for line in report["uncorrected"])


def test_a_genuine_mis_rotation_is_still_a_polarity_failure(vault):
    """The uncorrected-reference branch must not become a way for a real wrong
    turn to escape. A derivative left unturned under a corrected reading is."""
    config, conn, corpus = vault
    assets, metadata, derivatives = scanned(config)
    phase2a.compute_features(conn, config, assets, metadata, derivatives, readers=4, decoders=2)
    report = phase2a.regression(conn, assets, metadata, derivatives)
    assert len(report["polarity_wrong"]) == 2  # the two transposing ARW, unturned
    assert report["uncorrected"] == []


def test_the_regression_check_names_a_derivative_that_was_not_turned(vault):
    """If pass B is skipped the check has to say so rather than pass quietly."""
    config, conn, _ = vault
    assets, metadata, derivatives = scanned(config)
    phase2a.compute_features(conn, config, assets, metadata, derivatives, readers=4, decoders=2)
    report = phase2a.regression(conn, assets, metadata, derivatives)
    assert len(report["rotation_wrong"]) == 3
    assert any("expected 180" in line for line in report["rotation_wrong"])


def test_the_arw_thumbnail_count_reconciles(vault):
    config, _conn, _ = vault
    assets, _, _ = scanned(config)
    tally = phase2a.arw_thumbnails(config, assets)
    assert tally["repaired"] + tally["untouched"] == tally["arw"] == tally["on_disk"] == 4


def test_the_detail_tier_gap_is_reported(vault):
    config, _conn, _ = vault
    _, _, derivatives = scanned(config)
    gap = phase2a.detail_gap(derivatives)
    assert gap["detail"] == 0 and gap["gap"] == gap["substrate"] == len(CORPUS)


# --- the boundaries this step must not cross ---------------------------------


def test_one_process_one_lock_file(tmp_path: Path):
    path = tmp_path / "phase2a.lock"
    with phase2a.RunLock(path):
        assert path.read_text() == str(__import__("os").getpid())
        with pytest.raises(phase2a.Phase2aRefused):
            with phase2a.RunLock(path):
                pass
    assert not path.exists()


def test_a_lock_left_by_a_dead_run_is_not_a_wall(tmp_path: Path):
    path = tmp_path / "phase2a.lock"
    path.write_text("999999999")  # a pid that cannot be running
    with phase2a.RunLock(path):
        assert path.read_text() == str(__import__("os").getpid())


def test_assets_width_and_height_are_never_read():
    """archive/PLAN.md's exception D. `assets.width/height` holds at least five
    different quantities and has the wrong polarity for about 52 assets, so the
    dimensions come from `asset_extended_metadata` or from re-measuring."""
    source = Path(phase2a.__file__).read_text(encoding="utf-8")
    statement = source.split("FROM assets")[0].rsplit("SELECT", 1)[-1]
    assert "width" not in statement and "height" not in statement


def test_no_v1_module_is_imported():
    for module in (phase2a, features, __import__("archive.pipeline.decode", fromlist=["x"])):
        source = Path(module.__file__).read_text(encoding="utf-8")
        assert "import v1" not in source and "from v1" not in source
