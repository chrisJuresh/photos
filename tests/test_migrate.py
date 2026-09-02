"""The migration runner: applying, re-applying, and the two refusals."""

from __future__ import annotations

import shutil
import sqlite3
from pathlib import Path

import pytest

from conftest import file_version, table_names

from photolib import db, migrate

LATEST = 14


def test_applies_from_empty(pair):
    catalog, state = pair

    assert migrate.apply(catalog, state) == LATEST

    # The gate: version 2 in both files, each read on its own.
    assert file_version(catalog) == LATEST
    assert file_version(state) == LATEST
    # The catalog holds the three product tables, the triage survey -- derived and
    # regenerable, so it belongs on this side -- Phase 4's promotion ledger, which
    # is machine-produced and would otherwise bloat the one irreplaceable file,
    # Phase 5's grouping, which is derived from all of them, the fingerprints the
    # match pass screens with, which are re-derivable from the substrates, the
    # candidate pairs it screens, which are re-derivable from those, the Matches it
    # verifies the survivors with, likewise, the stack each tile is assigned to,
    # which is a reading of those Matches at one setting, and who is in each frame,
    # which is re-derivable from the substrates as everything since 008 is.
    # Decisions stay in state, and migrations 005 to 012 add nothing there.
    assert table_names(catalog) == {
        "schema_version",
        "origin",
        "file",
        "photo",
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
        "pair_match",
        "stack_member",
        "frame_body",
        "face",
        "face_person",
    }
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
    assert indexes == {
        "origin_sha",
        "origin_fid",
        "file_state",
        "file_phash",
        "photo_sort",
        "triage_dir_key",
        "triage_dir_segment_i",
        "triage_bucket_dir",
        "triage_path_bucket",
        "promotion_status",
        "photo_member_photo",
        "pair_key_sha",
        "near_dup_group",
    }


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


def test_the_cut_carries_the_population_clustered_before_it_existed(pair, tmp_path):
    """013 grows `face_person`'s primary key by the size cut. The rows already
    there were clustered over every face there was, so they are stamped 0.0 --
    `photolib.people.NO_CUT`, a real value of the column -- and stay readable as
    the old cut's rather than being thrown away with the table they were in."""
    catalog, state = pair
    before = tmp_path / "before_the_cut"
    before.mkdir()
    for _, path in migrate.discover()[:12]:
        shutil.copy(path, before)
    assert migrate.apply(catalog, state, migrations_dir=before) == 12

    conn = db.connect(catalog, state)
    try:
        conn.execute(
            "INSERT INTO file (sha256, size, ext, kind, state, feature_ver)"
            " VALUES ('a', 1, '.jpg', 'image', 'published', '{}')"
        )
        conn.execute(
            "INSERT INTO face (model, version, sha256, idx, share, vector)"
            " VALUES ('m', '1', 'a', 0, 0.5, x'00')"
        )
        conn.execute(
            "INSERT INTO face_person (model, version, threshold, sha256, idx, person)"
            " VALUES ('m', '1', 0.363, 'a', 0, 'a:0')"
        )
        conn.commit()
    finally:
        conn.close()

    assert migrate.apply(catalog, state) == LATEST

    conn = db.connect(catalog, state)
    try:
        assert conn.execute(
            "SELECT threshold, cut, person FROM face_person"
        ).fetchall() == [(0.363, 0.0, "a:0")]
    finally:
        conn.close()


def test_the_people_column_carries_the_walk_that_had_no_veto(pair, tmp_path):
    """014 grows `stack_member`'s primary key by the people identity. The rows
    already there were walked before ADR 0004's veto existed, so they are stamped
    `'none'` -- `photolib.membership.NO_PEOPLE`, a real value of the column saying
    *no people rule applied* -- and stay readable as the grid the reader had."""
    catalog, state = pair
    before = tmp_path / "before_the_people"
    before.mkdir()
    for _, path in migrate.discover()[:13]:
        shutil.copy(path, before)
    assert migrate.apply(catalog, state, migrations_dir=before) == 13

    conn = db.connect(catalog, state)
    try:
        conn.execute(
            "INSERT INTO file (sha256, size, ext, kind, state, feature_ver)"
            " VALUES ('a', 1, '.jpg', 'image', 'published', '{}')"
        )
        conn.execute(
            "INSERT INTO stack_member"
            " (method, version, strictness, linkage, ceiling, sha256, stack)"
            " VALUES ('sift_ratio_homography', '1', 10, 'neighbour', 3600, 'a', 'a')"
        )
        conn.commit()
    finally:
        conn.close()

    assert migrate.apply(catalog, state) == LATEST

    conn = db.connect(catalog, state)
    try:
        assert conn.execute(
            "SELECT people, sha256, stack FROM stack_member"
        ).fetchall() == [("none", "a", "a")]
    finally:
        conn.close()


def test_refuses_gapped_numbering(tmp_path: Path):
    gapped = tmp_path / "gapped"
    gapped.mkdir()
    (gapped / "001_catalog.sql").write_text("")
    (gapped / "003_later.sql").write_text("")

    with pytest.raises(migrate.MigrationRefused, match="no gaps"):
        migrate.discover(gapped)
