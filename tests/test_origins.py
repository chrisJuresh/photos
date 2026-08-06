"""origins.jsonl carries every distinct file, is append-only, and verifies."""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path

import pytest

from photolib import origins

EXCLUDED = "a" * 64  # a hash triage would drop; it must still be exported
KEPT = "b" * 64
NON_ASCII = "G:\\photos\\cámara\\naïve\u00a0shot.jpg"


def _seed(conn: sqlite3.Connection) -> None:
    conn.executemany(
        "INSERT INTO file (sha256, size, ext, taken_at, taken_src, state, feature_ver) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            (EXCLUDED, 11, ".png", None, None, "pending", "{}"),
            (KEPT, 22, ".jpg", "2019-08-11T14:02:07", "exif:DateTimeOriginal", "read", "{}"),
        ],
    )
    conn.executemany(
        "INSERT INTO origin (path, root, ext, size, sha256, seen_at) VALUES (?, ?, ?, ?, ?, ?)",
        [
            ("G:\\photos\\r\\b.png", "r", ".png", 11, EXCLUDED, "2026-08-06"),
            ("G:\\photos\\r\\a.png", "r", ".png", 11, EXCLUDED, "2026-08-06"),
            ("G:\\photos\\r\\one.jpg", "r", ".jpg", 22, KEPT, "2026-08-06"),
            (NON_ASCII, "cámara", ".jpg", 22, KEPT, "2026-08-06"),
        ],
    )


def _lines(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]


@pytest.fixture
def seeded(conn):
    _seed(conn)
    return conn


def test_exports_every_distinct_file_including_the_excluded(seeded, tmp_path):
    """The whole point: a wrongly excluded file is not in the kept set."""
    path = tmp_path / "origins.jsonl"
    result = origins.export(seeded, path)

    assert result == {"considered": 2, "written": 2, "appended": 0}
    assert {record["sha256"] for record in _lines(path)} == {EXCLUDED, KEPT}


def test_a_line_is_self_contained_and_holds_every_path(seeded, tmp_path):
    path = tmp_path / "origins.jsonl"
    origins.export(seeded, path)

    by_hash = {record["sha256"]: record for record in _lines(path)}
    assert by_hash[KEPT] == {
        "sha256": KEPT,
        "ext": ".jpg",
        "size": 22,
        "taken_at": "2019-08-11T14:02:07",
        "taken_src": "exif:DateTimeOriginal",
        "paths": sorted(["G:\\photos\\r\\one.jpg", NON_ASCII]),
    }
    assert by_hash[EXCLUDED]["taken_at"] is None
    assert by_hash[EXCLUDED]["paths"] == ["G:\\photos\\r\\a.png", "G:\\photos\\r\\b.png"]


def test_first_export_is_sorted_by_sha256(seeded, tmp_path):
    path = tmp_path / "origins.jsonl"
    origins.export(seeded, path)

    hashes = [record["sha256"] for record in _lines(path)]
    assert hashes == sorted(hashes)


def test_non_ascii_paths_survive_as_characters_not_escapes(seeded, tmp_path):
    path = tmp_path / "origins.jsonl"
    origins.export(seeded, path)
    assert "cámara" in path.read_text(encoding="utf-8")


def test_re_export_of_an_unchanged_catalog_appends_nothing(seeded, tmp_path):
    path = tmp_path / "origins.jsonl"
    origins.export(seeded, path)
    before = path.read_bytes()

    result = origins.export(seeded, path)

    assert result == {"considered": 2, "written": 0, "appended": 0}
    assert path.read_bytes() == before


def test_a_new_path_appends_a_line_and_rewrites_nothing(seeded, tmp_path):
    path = tmp_path / "origins.jsonl"
    origins.export(seeded, path)
    before = path.read_bytes()
    seeded.execute(
        "INSERT INTO origin (path, root, ext, size, sha256, seen_at) VALUES (?, ?, ?, ?, ?, ?)",
        ("G:\\photos\\later\\two.jpg", "later", ".jpg", 22, KEPT, "2026-09-01"),
    )

    result = origins.export(seeded, path)

    assert result["written"] == 1 and result["appended"] == 1
    assert path.read_bytes().startswith(before)
    assert _lines(path)[-1]["paths"] == sorted(
        ["G:\\photos\\r\\one.jpg", NON_ASCII, "G:\\photos\\later\\two.jpg"]
    )


def test_a_repeated_sha256_unions_its_paths_on_read(seeded, tmp_path):
    """The log contract: later lines extend, they do not replace."""
    path = tmp_path / "origins.jsonl"
    origins.export(seeded, path)
    seeded.execute(
        "INSERT INTO origin (path, root, ext, size, sha256, seen_at) VALUES (?, ?, ?, ?, ?, ?)",
        ("G:\\photos\\later\\two.jpg", "later", ".jpg", 22, KEPT, "2026-09-01"),
    )
    origins.export(seeded, path)

    built = origins.reconstruct(path, tmp_path / "scratch.sqlite3")
    assert built["lines"] == 3 and built["paths"] == 5


def test_verification_diff_is_empty_for_a_faithful_export(seeded, tmp_path, migrated):
    catalog_db, _ = migrated
    path = tmp_path / "origins.jsonl"
    origins.export(seeded, path)
    origins.reconstruct(path, tmp_path / "scratch.sqlite3")

    result = origins.diff(tmp_path / "scratch.sqlite3", catalog_db)

    assert result["live_paths"] == 4
    assert result["missing_from_jsonl"] == 0
    assert result["not_in_origin"] == 0
    assert result["sha256_disagreements"] == 0


def test_verification_notices_a_dropped_path(seeded, tmp_path, migrated):
    """A truncated export must not verify clean -- that is the whole check."""
    catalog_db, _ = migrated
    path = tmp_path / "origins.jsonl"
    origins.export(seeded, path)
    kept = [line for line in path.read_text(encoding="utf-8").splitlines() if EXCLUDED not in line]
    path.write_text("\n".join(kept) + "\n", encoding="utf-8")
    origins.reconstruct(path, tmp_path / "scratch.sqlite3")

    result = origins.diff(tmp_path / "scratch.sqlite3", catalog_db)

    assert result["missing_from_jsonl"] == 2
    assert sorted(result["samples"]["missing"]) == [
        "G:\\photos\\r\\a.png",
        "G:\\photos\\r\\b.png",
    ]


def test_verification_notices_a_path_under_the_wrong_hash(seeded, tmp_path, migrated):
    catalog_db, _ = migrated
    path = tmp_path / "origins.jsonl"
    origins.export(seeded, path)
    path.write_text(
        path.read_text(encoding="utf-8").replace(KEPT, "c" * 64), encoding="utf-8"
    )
    origins.reconstruct(path, tmp_path / "scratch.sqlite3")

    assert origins.diff(tmp_path / "scratch.sqlite3", catalog_db)["sha256_disagreements"] == 2


def test_an_interrupted_first_export_leaves_no_file_to_append_to(seeded, tmp_path, monkeypatch):
    path = tmp_path / "origins.jsonl"
    monkeypatch.setattr(origins, "_line", lambda record: 1 / 0)

    with pytest.raises(ZeroDivisionError):
        origins.export(seeded, path)

    assert not path.exists()
    assert (tmp_path / "origins.jsonl.partial").exists()


def test_a_corrupt_line_is_an_error_not_a_silent_skip(tmp_path):
    path = tmp_path / "origins.jsonl"
    path.write_text('{"sha256": "x", "paths": []}\n{not json\n', encoding="utf-8")

    with pytest.raises(ValueError, match="origins.jsonl:2"):
        list(origins.read_jsonl(path))


def test_an_origin_row_with_no_file_row_is_refused(conn, tmp_path):
    conn.execute(
        "INSERT INTO origin (path, root, ext, size, sha256, seen_at) VALUES (?, ?, ?, ?, ?, ?)",
        ("G:\\photos\\orphan.jpg", "r", ".jpg", 1, KEPT, "2026-08-06"),
    )
    with pytest.raises(RuntimeError, match="no file row"):
        origins.export(conn, tmp_path / "origins.jsonl")
