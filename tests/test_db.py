"""The connection: pragmas, a round trip through every table, and read-only."""

from __future__ import annotations

import sqlite3

import pytest

from photolib import db

ORIGIN = (
    r"G:\photos\lumix f 7-15-26 sd\DCIM\100_PANA\P1080096.RW2",
    "lumix f 7-15-26 sd",
    ".rw2",
    24_117_248,
    1_562_000_000_000_000_000,
    "a" * 64,
    1,
    281474976710700,
    "2026-08-01T00:00:00+00:00",
)
FILE = ("a" * 64, 24_117_248, ".rw2", "image", 4592, 3448, "2019-07-04T11:22:33", "exif",
        "DC-G9", "LUMIX G 12-60", 51.5, -0.12, 1234567890, 987654321, b"\x01\x02\x03",
        '{"sharpness": 0.5}', r"aa\bb\aaaa.rw2", "adopted", "phash=1")


def test_pragmas(conn):
    assert conn.execute("PRAGMA main.journal_mode").fetchone()[0] == "wal"
    assert conn.execute("PRAGMA state.journal_mode").fetchone()[0] == "wal"
    assert conn.execute("PRAGMA foreign_keys").fetchone()[0] == 1
    assert conn.execute("PRAGMA busy_timeout").fetchone()[0] == db.BUSY_TIMEOUT_MS


def test_round_trip_origin(conn):
    conn.execute(
        "INSERT INTO origin (path, root, ext, size, mtime_ns, sha256, nlink, file_id, seen_at)"
        " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ORIGIN,
    )
    row = conn.execute(
        "SELECT path, root, ext, size, mtime_ns, sha256, nlink, file_id, seen_at FROM origin"
    ).fetchone()
    assert row == ORIGIN


def test_round_trip_file(conn):
    conn.execute(f"INSERT INTO file VALUES ({', '.join('?' * len(FILE))})", FILE)
    assert conn.execute("SELECT * FROM file").fetchone() == FILE


def test_round_trip_photo(conn):
    conn.execute(f"INSERT INTO file VALUES ({', '.join('?' * len(FILE))})", FILE)
    conn.execute("INSERT INTO photo (rep_sha256, sort_key) VALUES (?, ?)", ("a" * 64, "2019-07-04T11:22:33"))
    assert conn.execute("SELECT rep_sha256, sort_key FROM photo").fetchone() == ("a" * 64, "2019-07-04T11:22:33")


def test_photo_requires_its_file(conn):
    """foreign_keys is on, not merely declared."""
    with pytest.raises(sqlite3.IntegrityError):
        conn.execute("INSERT INTO photo (rep_sha256, sort_key) VALUES (?, ?)", ("b" * 64, "2019-07-04"))


def test_round_trip_triage_rule(conn):
    rule = (1, 0, '{"column": "ext", "op": "in", "value": [".svg"]}', "exclude", "prefilter", "2026-08-01T00:00:00+00:00")
    conn.execute("INSERT INTO state.triage_rule VALUES (?, ?, ?, ?, ?, ?)", rule)
    assert conn.execute("SELECT * FROM state.triage_rule").fetchone() == rule


def test_round_trip_triage_override(conn):
    override = ("a" * 64, "include", "2026-08-01T00:00:00+00:00")
    conn.execute("INSERT INTO state.triage_override VALUES (?, ?, ?)", override)
    assert conn.execute("SELECT * FROM state.triage_override").fetchone() == override


def test_read_only_rejects_a_write(migrated):
    writer = db.connect(*migrated)
    writer.execute(f"INSERT INTO file VALUES ({', '.join('?' * len(FILE))})", FILE)
    writer.close()

    reader = db.connect(*migrated, read_only=True)
    try:
        assert reader.execute("SELECT count(*) FROM file").fetchone() == (1,)
        assert reader.execute("SELECT count(*) FROM state.triage_rule").fetchone() == (0,)

        with pytest.raises(sqlite3.OperationalError, match="readonly"):
            reader.execute("UPDATE file SET state = 'excluded'")
        with pytest.raises(sqlite3.OperationalError, match="readonly"):
            reader.execute("INSERT INTO state.triage_override VALUES ('x', 'include', 'now')")
        with pytest.raises(sqlite3.OperationalError, match="readonly"):
            reader.execute("CREATE TABLE sneaky (x)")
    finally:
        reader.close()
