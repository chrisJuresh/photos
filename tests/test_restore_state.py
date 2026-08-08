"""Rolling `state.sqlite3` back to a snapshot, and the four refusals around it.

Every test works on a temporary pair and a temporary backup root. Nothing here
reads `config.toml`: `restore` takes the database it replaces as an argument,
and its safety snapshot is an injected callable for exactly that reason.
"""

from __future__ import annotations

import socket
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

import pytest

from archive.pipeline import backup_state
from photolib import restore_state
from photolib.restore_state import RestoreRefused, restore

STAMP = datetime(2026, 8, 1, 22, 30, 15, tzinfo=timezone.utc)


def add_rules(state_db: Path, count: int) -> None:
    conn = sqlite3.connect(state_db)
    try:
        conn.executemany(
            "INSERT INTO triage_rule (seq, predicate, decision, created_at) VALUES (?, ?, ?, ?)",
            [(n, f"ext = '.{n}'", "exclude", "2026-08-01T00:00:00Z") for n in range(count)],
        )
        conn.commit()
    finally:
        conn.close()


def rule_count(state_db: Path) -> int:
    conn = sqlite3.connect(f"{state_db.as_uri()}?mode=ro", uri=True)
    try:
        return conn.execute("SELECT count(*) FROM triage_rule").fetchone()[0]
    finally:
        conn.close()


@pytest.fixture
def closed_port() -> int:
    """A port nothing is listening on, so the server guard passes."""
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        return probe.getsockname()[1]


@pytest.fixture
def snapshot(migrated, tmp_path) -> Path:
    """A snapshot of three rules, taken before two more are added."""
    _, state_db = migrated
    add_rules(state_db, 3)
    target = backup_state.snapshot(
        state_db, tmp_path / "backups", now=STAMP, require_distinct_volume=False
    )
    add_rules(state_db, 2)
    return target


def test_restoring_puts_the_earlier_decisions_back(migrated, snapshot, closed_port):
    _, state_db = migrated
    assert rule_count(state_db) == 5

    restored = restore(snapshot, state_db, port=closed_port)

    assert restored["triage_rule"] == 3
    assert rule_count(state_db) == 3


def test_the_current_state_is_preserved_before_it_is_replaced(migrated, snapshot, closed_port):
    """Restoring the wrong snapshot is the mistake this module exists to fix."""
    _, state_db = migrated
    preserved = []

    restore(snapshot, state_db, port=closed_port, before=lambda: preserved.append(rule_count(state_db)))

    assert preserved == [5]  # taken while the five-rule state was still live


def test_a_stale_write_ahead_log_does_not_survive_the_swap(migrated, snapshot, closed_port):
    """A `-wal` beside the replaced file describes a database that has gone, and
    replaying it onto the restored one is corruption rather than an error."""
    _, state_db = migrated
    # A connection left in WAL mode with an unclean exit is what leaves one.
    conn = sqlite3.connect(state_db)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("INSERT INTO triage_rule (seq, predicate, decision, created_at) VALUES "
                 "(99, \"ext = '.x'\", 'exclude', '2026-08-01T00:00:00Z')")
    conn.commit()
    conn.close()
    state_db.with_name(state_db.name + "-wal").touch()

    restore(snapshot, state_db, port=closed_port)

    assert not state_db.with_name(state_db.name + "-wal").exists()
    assert not state_db.with_name(state_db.name + "-shm").exists()
    assert rule_count(state_db) == 3


def test_it_refuses_while_something_answers_on_the_grids_port(migrated, snapshot):
    _, state_db = migrated
    with socket.socket() as server:
        server.bind(("127.0.0.1", 0))
        server.listen(1)
        port = server.getsockname()[1]

        with pytest.raises(RestoreRefused, match="answering"):
            restore(snapshot, state_db, port=port)

    assert rule_count(state_db) == 5  # untouched


def test_it_refuses_while_another_connection_holds_the_database(migrated, snapshot, closed_port):
    _, state_db = migrated
    holder = sqlite3.connect(state_db, isolation_level=None)
    holder.execute("BEGIN EXCLUSIVE")
    try:
        with pytest.raises(RestoreRefused, match="in use"):
            restore(snapshot, state_db, port=closed_port)
    finally:
        holder.execute("ROLLBACK")
        holder.close()

    assert rule_count(state_db) == 5


def test_it_refuses_a_file_that_is_not_a_state_database(migrated, tmp_path, closed_port):
    _, state_db = migrated
    add_rules(state_db, 5)
    plausible = tmp_path / "state-20260801T000000Z.sqlite3"
    plausible.write_bytes(b"not a database at all")

    with pytest.raises(RestoreRefused):
        restore(plausible, state_db, port=closed_port)

    assert rule_count(state_db) == 5


def test_it_refuses_a_database_that_lost_the_decisions(migrated, tmp_path, closed_port):
    """A snapshot that opens and is empty of decisions is the failure worth
    catching: it would restore cleanly and silently lose the triage."""
    _, state_db = migrated
    add_rules(state_db, 5)
    hollow = tmp_path / "hollow.sqlite3"
    conn = sqlite3.connect(hollow)
    conn.execute("CREATE TABLE triage_rule (id INTEGER PRIMARY KEY)")
    conn.close()

    with pytest.raises(RestoreRefused, match="triage_override"):
        restore(hollow, state_db, port=closed_port)

    assert rule_count(state_db) == 5


def test_it_refuses_a_snapshot_that_is_not_there(migrated, tmp_path, closed_port):
    _, state_db = migrated

    with pytest.raises(RestoreRefused, match="no snapshot"):
        restore(tmp_path / "nothing.sqlite3", state_db, port=closed_port)


def test_it_refuses_to_restore_the_live_database_onto_itself(migrated, closed_port):
    _, state_db = migrated

    with pytest.raises(RestoreRefused, match="same file"):
        restore(state_db, state_db, port=closed_port)


def test_the_listing_is_newest_first(tmp_path):
    root = tmp_path / "backups"
    root.mkdir()
    for name in ("state-20260801T000000Z", "state-20260807T120000Z", "state-20260803T090000Z"):
        (root / f"{name}.sqlite3").touch()
    (root / "notes.txt").touch()

    found = [path.name for path in restore_state.snapshots(root)]

    assert found == [
        "state-20260807T120000Z.sqlite3",
        "state-20260803T090000Z.sqlite3",
        "state-20260801T000000Z.sqlite3",
    ]
