"""Shared fixtures. Every test runs against a temporary database pair, never
against the paths in config.toml.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

import pytest

from photolib import db, migrate


@pytest.fixture
def pair(tmp_path: Path) -> tuple[Path, Path]:
    """An unmigrated catalog + state pair."""
    return tmp_path / "catalog.sqlite3", tmp_path / "state.sqlite3"


@pytest.fixture
def migrated(pair: tuple[Path, Path]) -> tuple[Path, Path]:
    """The same pair, at the current schema version."""
    migrate.apply(*pair)
    return pair


@pytest.fixture
def conn(migrated: tuple[Path, Path]):
    connection = db.connect(*migrated)
    yield connection
    connection.close()


def file_version(path: Path) -> int:
    """The version recorded in one database file, read on its own."""
    connection = sqlite3.connect(path)
    try:
        table = connection.execute(
            "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='schema_version'"
        ).fetchone()[0]
        if not table:
            return 0
        return connection.execute("SELECT coalesce(max(version), 0) FROM schema_version").fetchone()[0]
    finally:
        connection.close()


def table_names(path: Path) -> set[str]:
    """Every table in one database file, read on its own."""
    connection = sqlite3.connect(path)
    try:
        return {
            row[0]
            for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")
        }
    finally:
        connection.close()
