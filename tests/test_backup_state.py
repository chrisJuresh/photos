"""Snapshots of state.sqlite3 are verified, refuse to sit beside their source, and
never overwrite an existing snapshot.
"""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

import pytest

from conftest import table_names

from photolib import backup_state

STAMP = datetime(2026, 8, 1, 22, 30, 15, tzinfo=timezone.utc)


def _add_rule(state_db: Path, predicate: str) -> None:
    conn = sqlite3.connect(state_db)
    try:
        conn.execute(
            "INSERT INTO triage_rule (seq, predicate, decision, created_at) VALUES (?, ?, ?, ?)",
            (1, predicate, "exclude", "2026-08-01T00:00:00Z"),
        )
        conn.commit()
    finally:
        conn.close()


def test_snapshot_carries_the_schema_and_the_decisions(migrated, tmp_path):
    _, state_db = migrated
    _add_rule(state_db, "path LIKE '%node_modules%'")

    target = backup_state.snapshot(
        state_db, tmp_path / "backups", now=STAMP, require_distinct_volume=False
    )

    assert target.name == "state-20260801T223015Z.sqlite3"
    assert table_names(target) >= {"triage_rule", "triage_override", "schema_version"}
    assert backup_state._counts(target) == backup_state._counts(state_db)
    assert backup_state._counts(target)["triage_rule"] == 1


def test_snapshot_does_not_disturb_the_source(migrated, tmp_path):
    _, state_db = migrated
    _add_rule(state_db, "ext = '.svg'")
    before = backup_state._counts(state_db)

    backup_state.snapshot(
        state_db, tmp_path / "backups", now=STAMP, require_distinct_volume=False
    )

    assert backup_state._counts(state_db) == before
    _add_rule(state_db, "ext = '.ts'")  # still writable afterwards
    assert backup_state._counts(state_db)["triage_rule"] == 2


def test_a_later_snapshot_sees_a_later_decision(migrated, tmp_path):
    _, state_db = migrated
    root = tmp_path / "backups"
    first = backup_state.snapshot(
        state_db, root, now=STAMP, require_distinct_volume=False
    )
    _add_rule(state_db, "ext = '.svg'")
    second = backup_state.snapshot(
        state_db,
        root,
        now=STAMP.replace(hour=23),
        require_distinct_volume=False,
    )

    assert first != second
    assert backup_state._counts(first)["triage_rule"] == 0
    assert backup_state._counts(second)["triage_rule"] == 1


def test_refuses_a_snapshot_on_the_source_volume(migrated, tmp_path):
    """A backup beside its source survives nothing that would destroy the source."""
    _, state_db = migrated
    with pytest.raises(ValueError, match="same volume"):
        backup_state.snapshot(state_db, tmp_path / "backups", now=STAMP)


def test_refuses_to_overwrite_an_existing_snapshot(migrated, tmp_path):
    _, state_db = migrated
    root = tmp_path / "backups"
    backup_state.snapshot(state_db, root, now=STAMP, require_distinct_volume=False)
    with pytest.raises(FileExistsError):
        backup_state.snapshot(state_db, root, now=STAMP, require_distinct_volume=False)


def test_missing_source_is_an_error_not_an_empty_snapshot(tmp_path):
    with pytest.raises(FileNotFoundError):
        backup_state.snapshot(
            tmp_path / "absent.sqlite3",
            tmp_path / "backups",
            now=STAMP,
            require_distinct_volume=False,
        )
