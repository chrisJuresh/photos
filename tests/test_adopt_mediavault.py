"""Tests for the MediaVault import.

Every test builds a synthetic MediaVault under tmp_path -- a manifest with the
columns the import reads, an objects tree, and record sidecars. Nothing here
opens a path from config.toml, and no real media is involved.
"""

from __future__ import annotations

import gzip
import json
import sqlite3
from pathlib import Path

import pytest

from photolib import db
from archive.pipeline.adopt_mediavault import (
    AdoptRefused,
    adopt_assets,
    camera_name,
    capture_iso,
    import_origins,
    meta_path,
    object_index,
    open_manifest,
    path_root,
    sidecar_paths,
    write_meta,
)

MANIFEST_SCHEMA = """
CREATE TABLE assets (
  asset_id TEXT PRIMARY KEY, sha256 TEXT NOT NULL, size_bytes INTEGER NOT NULL,
  preferred_extension TEXT, media_kind TEXT NOT NULL, object_relpath TEXT NOT NULL
);
CREATE TABLE asset_extended_metadata (
  asset_id TEXT PRIMARY KEY, is_current INTEGER NOT NULL DEFAULT 1,
  width INTEGER, height INTEGER, capture_time_text TEXT, capture_time_source TEXT,
  capture_time_ambiguous INTEGER NOT NULL DEFAULT 0,
  camera_make TEXT, camera_model TEXT, lens_model TEXT,
  gps_latitude REAL, gps_longitude REAL,
  raw_metadata_json TEXT NOT NULL DEFAULT '{}'
);
"""


def sha_of(seed: str) -> str:
    """A 64-hex string that reads as a hash without being one."""
    return (seed * 64)[:64]


class Vault:
    """A synthetic MediaVault: manifest, objects tree, record sidecars."""

    def __init__(self, root: Path) -> None:
        self.root = root
        self.manifest_path = root / "state" / "manifest.sqlite3"
        self.manifest_path.parent.mkdir(parents=True)
        self.conn = sqlite3.connect(self.manifest_path)
        self.conn.executescript(MANIFEST_SCHEMA)

    def add_asset(
        self,
        asset_id: str,
        sha256: str,
        *,
        with_object: bool = True,
        kind: str = "image",
        ext: str = ".jpg",
        size: int = 1024,
        raw_metadata: dict | None = None,
        with_metadata: bool = True,
        **metadata: object,
    ) -> str:
        relpath = f"objects\\sha256\\{sha256[:2]}\\{sha256[2:4]}\\{sha256}_x_y_{size}.blob"
        if with_object:
            target = self.root / relpath.replace("\\", "/")
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(b"")
        self.conn.execute(
            "INSERT INTO assets VALUES (?, ?, ?, ?, ?, ?)",
            (asset_id, sha256, size, ext, kind, relpath),
        )
        if with_metadata:
            columns = {"asset_id": asset_id, "raw_metadata_json": json.dumps(raw_metadata or {})}
            columns.update(metadata)
            names = ", ".join(columns)
            marks = ", ".join("?" * len(columns))
            self.conn.execute(
                f"INSERT INTO asset_extended_metadata ({names}) VALUES ({marks})",
                tuple(columns.values()),
            )
        self.conn.commit()
        return relpath

    def add_sidecar(self, asset_id: str, sha256: str, observations: list[dict]) -> Path:
        target = self.root / "records" / "assets" / sha256[:2] / sha256[2:4] / f"{asset_id}.json"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(
            json.dumps({"asset": {"sha256": sha256}, "source_locations_and_history": observations}),
            encoding="utf-8",
        )
        return target


def observation(relative: str, *, mtime_ns: int, size: int = 1024, ext: str = ".jpg") -> dict:
    return {
        "path_text": f"G:\\photos\\{relative}",
        "relative_path_text": relative,
        "extension_text": ext,
        "size_bytes": size,
        "mtime_ns": mtime_ns,
        "first_seen_at": "2026-07-19T21:16:58Z",
    }


@pytest.fixture
def vault(tmp_path: Path) -> Vault:
    return Vault(tmp_path / "MediaVault")


@pytest.fixture
def manifest(vault: Vault):
    vault.conn.close()
    connection = open_manifest(vault.manifest_path)
    yield connection
    connection.close()


# --- value shaping -----------------------------------------------------------


@pytest.mark.parametrize(
    "text,expected",
    [
        ("2021:12:01 09:06:42", "2021-12-01T09:06:42"),
        ("2021:12:01 09:06:42.285", "2021-12-01T09:06:42"),
        ("2021:12:01 09:06:42+01:00", "2021-12-01T09:06:42"),
        ("0000:00:00 00:00:00", None),
        ("not a time", None),
        ("", None),
        (None, None),
    ],
)
def test_capture_iso(text, expected):
    assert capture_iso(text) == expected


def test_capture_iso_ignores_the_ambiguous_flag():
    """v1 dated 6,451 of 38,767; the offset-less 32,316 are the whole difference."""
    assert capture_iso("2021:12:01 09:06:42") == "2021-12-01T09:06:42"


@pytest.mark.parametrize(
    "make,model,expected",
    [
        ("Panasonic", "DMC-GX80", "Panasonic DMC-GX80"),
        ("Canon", "Canon EOS 5D Mark IV", "Canon EOS 5D Mark IV"),
        ("samsung", "SM-A528B", "samsung SM-A528B"),
        ("BeFunky", None, "BeFunky"),
        (None, "SM-G950F", "SM-G950F"),
        (None, None, None),
    ],
)
def test_camera_name(make, model, expected):
    assert camera_name(make, model) == expected


@pytest.mark.parametrize(
    "relative,expected",
    [
        ("lumix f 7-15-26 sd\\DCIM\\P1080001.RW2", "lumix f 7-15-26 sd"),
        ("lumix f 7-15-26 sd\\P1080001.RW2", "lumix f 7-15-26 sd"),
        ("loose.jpg", ""),
    ],
)
def test_path_root(relative, expected):
    assert path_root(relative) == expected


# --- reading MediaVault ------------------------------------------------------


def test_open_manifest_refuses_a_missing_file(tmp_path: Path):
    with pytest.raises(AdoptRefused):
        open_manifest(tmp_path / "nope.sqlite3")


def test_manifest_is_read_only(vault: Vault, manifest: sqlite3.Connection):
    with pytest.raises(sqlite3.OperationalError):
        manifest.execute("CREATE TABLE scribble (x INTEGER)")


def test_open_manifest_leaves_no_shm_behind(vault: Vault):
    """mode=ro alone rewrites the -shm of a WAL database on every read."""
    vault.conn.execute("PRAGMA journal_mode = WAL")
    vault.conn.execute("CREATE TABLE probe (x INTEGER)")
    vault.conn.close()
    sqlite3.connect(vault.manifest_path).close()  # checkpoint and drop the sidecar files
    with open_manifest(vault.manifest_path) as manifest:
        assert manifest.execute("SELECT count(*) FROM probe").fetchone() == (0,)
    assert not vault.manifest_path.with_name("manifest.sqlite3-shm").exists()


def test_open_manifest_refuses_an_unspent_wal(vault: Vault):
    vault.conn.close()
    vault.manifest_path.with_name("manifest.sqlite3-wal").write_bytes(b"not empty")
    with pytest.raises(AdoptRefused, match="unspent"):
        open_manifest(vault.manifest_path)


def test_object_index_spells_relpaths_the_way_the_manifest_does(vault: Vault):
    relpath = vault.add_asset("a1", sha_of("a"))
    assert object_index(vault.root) == {relpath}


def test_object_index_refuses_a_missing_tree(tmp_path: Path):
    with pytest.raises(AdoptRefused):
        object_index(tmp_path / "empty")


def test_sidecar_paths_finds_every_shard(vault: Vault):
    first = vault.add_sidecar("a1", sha_of("a"), [])
    second = vault.add_sidecar("a2", sha_of("b"), [])
    assert set(sidecar_paths(vault.root / "records")) == {str(first), str(second)}


# --- file rows ---------------------------------------------------------------


def test_adopts_metadata_and_leaves_the_subjective_scores_alone(vault: Vault, conn, tmp_path):
    sha = sha_of("a")
    relpath = vault.add_asset(
        "a1", sha, kind="raw_image", ext=".rw2", size=19572736,
        width=1440, height=1920, capture_time_text="2021:12:01 09:06:42",
        capture_time_source="DateTimeOriginal", capture_time_ambiguous=1,
        camera_make="Panasonic", camera_model="DMC-GX80",
        lens_model="LUMIX G 42.5/F1.7", gps_latitude=51.5, gps_longitude=-0.1,
    )
    vault.conn.close()
    with open_manifest(vault.manifest_path) as manifest:
        counts, readings = adopt_assets(conn, manifest, object_index(vault.root))

    assert counts == {
        "assets": 1, "missing_object": 0, "inserted": 1, "already": 0,
        "unparsed_time": 0, "no_metadata": 0,
    }
    assert [sha for sha, _ in readings] == [sha]
    row = conn.execute("SELECT * FROM file").fetchone()
    got = dict(zip([d[0] for d in conn.execute("SELECT * FROM file").description], row))
    assert got["sha256"] == sha
    assert (got["size"], got["ext"], got["kind"]) == (19572736, ".rw2", "raw_image")
    assert (got["width"], got["height"]) == (1440, 1920)
    assert got["taken_at"] == "2021-12-01T09:06:42"
    assert got["taken_src"] == "exif:DateTimeOriginal"
    assert got["camera"] == "Panasonic DMC-GX80"
    assert got["lens"] == "LUMIX G 42.5/F1.7"
    assert (got["gps_lat"], got["gps_lon"]) == (51.5, -0.1)
    assert got["vault_relpath"] == relpath
    assert got["state"] == "adopted"
    assert json.loads(got["feature_ver"]) == {"meta": "mediavault:extended-metadata-v1"}
    # asset_features holds relative judgements; a later step computes these.
    assert (got["phash"], got["dhash"], got["thumbhash"], got["quality"]) == (None,) * 4


def test_an_asset_with_no_object_file_is_counted_not_imported(vault: Vault, conn, tmp_path):
    vault.add_asset("a1", sha_of("a"), with_object=True)
    vault.add_asset("a2", sha_of("b"), with_object=False)
    vault.conn.close()
    with open_manifest(vault.manifest_path) as manifest:
        counts, readings = adopt_assets(conn, manifest, object_index(vault.root))

    assert (counts["assets"], counts["inserted"], counts["missing_object"]) == (2, 1, 1)
    assert [r[0] for r in conn.execute("SELECT sha256 FROM file")] == [sha_of("a")]
    assert [sha for sha, _ in readings] == [sha_of("a")]


def test_undated_assets_get_no_taken_src(vault: Vault, conn, tmp_path):
    vault.add_asset("a1", sha_of("a"))
    vault.conn.close()
    with open_manifest(vault.manifest_path) as manifest:
        adopt_assets(conn, manifest, object_index(vault.root))
    assert conn.execute("SELECT taken_at, taken_src FROM file").fetchone() == (None, None)


def test_an_unparsable_capture_time_is_counted(vault: Vault, conn, tmp_path):
    vault.add_asset("a1", sha_of("a"), capture_time_text="0000:00:00 00:00:00",
                    capture_time_source="DateTimeOriginal")
    vault.conn.close()
    with open_manifest(vault.manifest_path) as manifest:
        counts, _ = adopt_assets(conn, manifest, object_index(vault.root))
    assert counts["unparsed_time"] == 1
    assert conn.execute("SELECT taken_at FROM file").fetchone() == (None,)


def test_an_asset_with_no_metadata_row_is_still_adopted(vault: Vault, conn, tmp_path):
    """The object is provably on disk; dropping it would lose a photo."""
    vault.add_asset("a1", sha_of("a"), with_metadata=False)
    vault.conn.close()
    with open_manifest(vault.manifest_path) as manifest:
        counts, readings = adopt_assets(conn, manifest, object_index(vault.root))

    assert (counts["inserted"], counts["no_metadata"]) == (1, 1)
    assert readings == []
    assert conn.execute("SELECT sha256, kind, taken_at, camera FROM file").fetchone() == (
        sha_of("a"), "image", None, None,
    )


def test_superseded_metadata_is_ignored(vault: Vault, conn, tmp_path):
    vault.add_asset("a1", sha_of("a"), is_current=0, capture_time_text="2019:01:01 00:00:00",
                    capture_time_source="DateTimeOriginal")
    vault.conn.close()
    with open_manifest(vault.manifest_path) as manifest:
        counts, _ = adopt_assets(conn, manifest, object_index(vault.root))

    assert (counts["inserted"], counts["no_metadata"]) == (1, 1)
    assert conn.execute("SELECT taken_at FROM file").fetchone() == (None,)


def test_adopt_is_idempotent(vault: Vault, conn, tmp_path):
    vault.add_asset("a1", sha_of("a"))
    vault.conn.close()
    with open_manifest(vault.manifest_path) as manifest:
        adopt_assets(conn, manifest, object_index(vault.root))
        before = conn.execute("SELECT * FROM file").fetchall()
        counts, _ = adopt_assets(conn, manifest, object_index(vault.root))

    assert (counts["inserted"], counts["already"]) == (0, 1)
    assert conn.execute("SELECT * FROM file").fetchall() == before


# --- meta sidecars -----------------------------------------------------------


def test_meta_sidecar_holds_the_exiftool_reading(vault: Vault, conn, tmp_path):
    sha = sha_of("a")
    reading = {"IFD0:Make": "Panasonic", "IFD0:Orientation": 8}
    vault.add_asset("a1", sha, raw_metadata=reading)
    vault.conn.close()
    with open_manifest(vault.manifest_path) as manifest:
        _, readings = adopt_assets(conn, manifest, object_index(vault.root))
    assert write_meta(tmp_path / "meta", readings, workers=2) == {"written": 1, "already": 0}

    target = meta_path(tmp_path / "meta", sha)
    assert target == tmp_path / "meta" / sha[:2] / sha[2:4] / f"{sha}.json.gz"
    with gzip.open(target, "rb") as handle:
        assert json.loads(handle.read()) == reading


def test_meta_skips_sidecars_already_on_disk(tmp_path: Path):
    """What makes a killed write pass resumable without 146,034 cold stats."""
    readings = [(sha_of(c), json.dumps({"n": c})) for c in "abc"]
    meta_root = tmp_path / "meta"
    assert write_meta(meta_root, readings[:1], workers=2) == {"written": 1, "already": 0}
    assert write_meta(meta_root, readings, workers=2) == {"written": 2, "already": 1}
    assert write_meta(meta_root, readings, workers=2) == {"written": 0, "already": 3}
    assert len(list(meta_root.rglob("*.json.gz"))) == 3


def test_meta_write_needs_no_pre_existing_root(tmp_path: Path):
    assert write_meta(tmp_path / "absent", [(sha_of("a"), "{}")], workers=2)["written"] == 1


# --- origin rows -------------------------------------------------------------


def adopt_one(vault: Vault, conn, asset_id: str, sha: str, **kwargs) -> None:
    vault.add_asset(asset_id, sha, **kwargs)
    vault.conn.commit()
    with open_manifest(vault.manifest_path) as manifest:
        adopt_assets(conn, manifest, object_index(vault.root))


def test_origin_records_every_path_ever_seen(vault: Vault, conn, tmp_path):
    sha = sha_of("a")
    adopt_one(vault, conn, "a1", sha)
    vault.add_sidecar("a1", sha, [
        observation("card\\DCIM\\one.jpg", mtime_ns=200),
        observation("backup\\copies\\one.jpg", mtime_ns=300),
    ])
    counts = import_origins(conn, vault.root / "records", {sha}, workers=2)

    assert (counts["observations"], counts["distinct_paths"], counts["conflicts"]) == (2, 2, 0)
    assert conn.execute("SELECT path, root, ext, size, mtime_ns, sha256 FROM origin"
                        " ORDER BY path").fetchall() == [
        ("G:\\photos\\backup\\copies\\one.jpg", "backup", ".jpg", 1024, 300, sha),
        ("G:\\photos\\card\\DCIM\\one.jpg", "card", ".jpg", 1024, 200, sha),
    ]
    assert conn.execute("SELECT count(*) FROM origin WHERE nlink IS NULL AND file_id IS NULL"
                        ).fetchone() == (2,)


def test_a_repeated_path_keeps_the_earliest_mtime(vault: Vault, conn, tmp_path):
    sha = sha_of("a")
    adopt_one(vault, conn, "a1", sha)
    vault.add_sidecar("a1", sha, [
        observation("card\\one.jpg", mtime_ns=900, size=1024),
        observation("card\\one.jpg", mtime_ns=100, size=2048),
    ])
    counts = import_origins(conn, vault.root / "records", {sha}, workers=2)

    assert (counts["observations"], counts["distinct_paths"]) == (2, 1)
    assert conn.execute("SELECT mtime_ns, size FROM origin").fetchall() == [(100, 2048)]


def test_the_earliest_mtime_wins_whatever_order_it_arrives_in(vault: Vault, conn, tmp_path):
    """The merge has to be order-independent: the sidecar walk is threaded."""
    sha = sha_of("a")
    adopt_one(vault, conn, "a1", sha)
    vault.add_sidecar("a1", sha, [
        observation("card\\one.jpg", mtime_ns=100),
        observation("card\\one.jpg", mtime_ns=900),
    ])
    import_origins(conn, vault.root / "records", {sha}, workers=2)
    assert conn.execute("SELECT mtime_ns FROM origin").fetchone() == (100,)


def test_origin_import_is_idempotent(vault: Vault, conn, tmp_path):
    sha = sha_of("a")
    adopt_one(vault, conn, "a1", sha)
    vault.add_sidecar("a1", sha, [
        observation("card\\one.jpg", mtime_ns=900),
        observation("card\\one.jpg", mtime_ns=100),
    ])
    import_origins(conn, vault.root / "records", {sha}, workers=2)
    before = conn.execute("SELECT * FROM origin").fetchall()
    import_origins(conn, vault.root / "records", {sha}, workers=2)
    assert conn.execute("SELECT * FROM origin").fetchall() == before


def test_paths_of_an_unadopted_asset_are_skipped(vault: Vault, conn, tmp_path):
    """No object on disk means no `file` row, so its paths carry no sha256 to point at."""
    adopted, orphan = sha_of("a"), sha_of("b")
    adopt_one(vault, conn, "a1", adopted)
    vault.add_asset("a2", orphan, with_object=False)
    vault.add_sidecar("a1", adopted, [observation("card\\one.jpg", mtime_ns=100)])
    vault.add_sidecar("a2", orphan, [observation("card\\two.jpg", mtime_ns=100)])

    counts = import_origins(conn, vault.root / "records", {adopted}, workers=2)
    assert (counts["sidecars"], counts["skipped_asset"], counts["observations"]) == (2, 1, 1)
    assert [r[0] for r in conn.execute("SELECT path FROM origin")] == ["G:\\photos\\card\\one.jpg"]


def test_a_path_claimed_by_two_assets_is_reported(vault: Vault, conn, tmp_path):
    """The manifest says this never happens; it is counted rather than assumed away."""
    first, second = sha_of("a"), sha_of("b")
    adopt_one(vault, conn, "a1", first)
    adopt_one(vault, conn, "a2", second)
    vault.add_sidecar("a1", first, [observation("card\\one.jpg", mtime_ns=100)])
    vault.add_sidecar("a2", second, [observation("card\\one.jpg", mtime_ns=100)])

    counts = import_origins(conn, vault.root / "records", {first, second}, workers=2)
    assert counts["conflicts"] == 1


def test_a_top_level_path_gets_an_empty_root(vault: Vault, conn, tmp_path):
    sha = sha_of("a")
    adopt_one(vault, conn, "a1", sha)
    vault.add_sidecar("a1", sha, [observation("loose.jpg", mtime_ns=100)])
    counts = import_origins(conn, vault.root / "records", {sha}, workers=2)
    assert counts["no_root"] == 1
    assert conn.execute("SELECT root FROM origin").fetchone() == ("",)


def test_a_sidecar_with_no_sha256_is_counted_malformed(vault: Vault, conn, tmp_path):
    target = vault.root / "records" / "assets" / "00" / "00" / "a1.json"
    target.parent.mkdir(parents=True)
    target.write_text(json.dumps({"asset": {}}), encoding="utf-8")
    counts = import_origins(conn, vault.root / "records", set(), workers=2)
    assert (counts["malformed"], counts["observations"]) == (1, 0)


def test_a_missing_seen_at_falls_back_to_the_run_time(vault: Vault, conn, tmp_path):
    sha = sha_of("a")
    adopt_one(vault, conn, "a1", sha)
    seen = observation("card\\one.jpg", mtime_ns=100)
    del seen["first_seen_at"]
    vault.add_sidecar("a1", sha, [seen])
    import_origins(conn, vault.root / "records", {sha}, workers=2)
    assert conn.execute("SELECT seen_at FROM origin").fetchone()[0].startswith("20")


def test_import_origins_refuses_a_missing_records_tree(vault: Vault, conn):
    with pytest.raises(AdoptRefused):
        import_origins(conn, vault.root / "records", set(), workers=2)


def test_nothing_is_written_to_the_manifest(vault: Vault, conn, tmp_path):
    sha = sha_of("a")
    adopt_one(vault, conn, "a1", sha)
    with sqlite3.connect(vault.manifest_path) as check:
        assert check.execute("SELECT count(*) FROM assets").fetchone() == (1,)
        assert not (vault.manifest_path.parent / "manifest.sqlite3-wal").exists()


def test_no_projection_tables_were_invented(migrated: tuple[Path, Path]):
    """archive/PLAN.md lists three catalog tables; the import adds none of its own.

    Migration 005 adds the triage survey, which is a derived projection rebuilt
    by `archive.pipeline.triage_survey`; 006 adds Phase 4's promotion ledger; 007 adds
    Phase 5's grouping, which is derived and rebuilt by `archive.pipeline.group`; 008 adds
    the fingerprints, re-derivable from the substrates by `photolib.fingerprints`; 009 adds
    the candidate pairs, re-derivable from those by `photolib.candidates`. None of
    them is ever written by this import, so all are named here rather than
    allowed in by a loosened assertion.
    """
    survey = {
        "triage_dir",
        "triage_dir_segment",
        "triage_segment",
        "triage_ext",
        "triage_root",
        "triage_bucket",
        "triage_path",
        "promotion",
        "photo_member",
        "pair_key",
        "near_dup",
        "near_band",
        "fingerprint",
        "candidate_pair",
    }
    connection = db.connect(*migrated)
    try:
        names = {
            row[0]
            for row in connection.execute(
                "SELECT name FROM main.sqlite_master WHERE type='table'"
            )
        }
    finally:
        connection.close()
    assert names == {"origin", "file", "photo", "schema_version"} | survey
