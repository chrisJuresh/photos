"""The migration runner: applying, re-applying, and the two refusals."""

from __future__ import annotations

import shutil
import sqlite3
from pathlib import Path

import pytest

from conftest import file_version, table_names

from photolib import db, migrate

LATEST = 3


def test_applies_from_empty(pair):
    catalog, state = pair

    assert migrate.apply(catalog, state) == LATEST

    # The gate: version 2 in both files, each read on its own.
    assert file_version(catalog) == LATEST
    assert file_version(state) == LATEST
    assert table_names(catalog) == {"schema_version", "origin", "file", "photo"}
    assert table_names(state) == {"schema_version", "triage_rule", "triage_override"}


def test_creates_every_index(conn):
    indexes = {
        row[0]
        for row in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='index'"
            " UNION ALL SELECT name FROM state.sqlite_master WHERE type='index'"
        )
        if not row[0].startswith("sqlite_")
    }
    assert indexes == {"origin_sha", "origin_fid", "file_state", "file_phash", "photo_sort"}


def test_is_idempotent(pair):
    catalog, state = pair
    assert migrate.apply(catalog, state) == LATEST
    assert migrate.apply(catalog, state) == LATEST

    for path in pair:
        connection = sqlite3.connect(path)
        try:
            versions = [row[0] for row in connection.execute("SELECT version FROM schema_version ORDER BY version")]
        finally:
            connection.close()
        assert versions == list(range(1, LATEST + 1)), f"{path.name} re-applied a migration"


@pytest.mark.parametrize("locked", ["main", "state"])
def test_refuses_while_another_writer_holds_the_lock(pair, locked):
    """A second migration running concurrently holds exactly this: an open write
    transaction on one of the two files. Invariant 6 -- exclusive maintenance
    does not run alongside a writer."""
    catalog, state = pair
    holder = db.connect(catalog, state)
    try:
        holder.execute("BEGIN")
        holder.execute(f"CREATE TABLE {locked}.lock_probe (x)")  # write lock on that file only

        with pytest.raises(migrate.MigrationRefused, match="another writer holds the lock"):
            migrate.apply(catalog, state)
    finally:
        holder.rollback()
        holder.close()

    # Refused means refused: neither file was touched.
    assert file_version(catalog) == 0
    assert file_version(state) == 0
    assert table_names(catalog) == set()
    assert table_names(state) == set()


def test_a_refused_migration_leaves_the_sequence_resumable(pair, tmp_path):
    """One transaction per migration: a refusal partway through the sequence
    keeps everything already applied and applies nothing of what was refused."""
    catalog, state = pair
    only_first = tmp_path / "only_first"
    only_first.mkdir()
    shutil.copy(migrate.MIGRATIONS_DIR / "001_catalog.sql", only_first)
    assert migrate.apply(catalog, state, migrations_dir=only_first) == 1

    holder = db.connect(catalog, state)
    try:
        holder.execute("BEGIN")
        holder.execute("CREATE TABLE state.lock_probe (x)")
        with pytest.raises(migrate.MigrationRefused):
            migrate.apply(catalog, state)
    finally:
        holder.rollback()
        holder.close()

    assert file_version(state) == 1
    assert table_names(state) == {"schema_version"}
    assert table_names(catalog) == {"schema_version", "origin", "file", "photo"}

    assert migrate.apply(catalog, state) == LATEST
    assert table_names(state) == {"schema_version", "triage_rule", "triage_override"}


def test_refuses_a_database_ahead_of_the_files(pair, tmp_path):
    catalog, state = pair
    migrate.apply(catalog, state)

    older = tmp_path / "older_migrations"
    older.mkdir()
    shutil.copy(migrate.MIGRATIONS_DIR / "001_catalog.sql", older)

    with pytest.raises(migrate.MigrationRefused, match=f"record version {LATEST} but only 1"):
        migrate.apply(catalog, state, migrations_dir=older)


def test_refuses_gapped_numbering(tmp_path: Path):
    gapped = tmp_path / "gapped"
    gapped.mkdir()
    (gapped / "001_catalog.sql").write_text("")
    (gapped / "003_later.sql").write_text("")

    with pytest.raises(migrate.MigrationRefused, match="no gaps"):
        migrate.discover(gapped)
