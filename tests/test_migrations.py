from __future__ import annotations

import hashlib
import json
import os
import sqlite3
from pathlib import Path
from types import SimpleNamespace

import pytest

import media_vault.migrations as migration_module
from media_vault.cli import main
from media_vault.config import RequestBudgets, ReviewConfig, WorkerLimits
from media_vault.core import VaultLayout
from media_vault.db import (
    SCHEMA_VERSION,
    ManifestDB,
    Migration,
    MigrationRequiredError,
    SchemaError,
    initialize_manifest_connection,
    read_schema_version,
    validate_manifest_connection,
)
from media_vault.migrations import InsufficientMigrationSpaceError, migrate_vault


STAGE8_TABLES = {
    "calendar_buckets",
    "calendar_bucket_items",
    "folder_hierarchy_nodes",
    "folder_hierarchy_items",
    "equipment_rollups",
    "equipment_rollup_items",
    "map_entity_locations",
    "map_unknown_location_items",
    "map_clusters",
    "map_cluster_items",
}

STAGE9_TABLES = {
    "stack_feature_inputs",
    "stack_candidate_edges",
    "stack_profiles",
    "stacks",
    "stack_members",
    "stack_cover_events",
}

STAGE10_TABLES = {
    "junk_signals",
    "junk_profiles",
    "junk_effective_results",
    "junk_feedback",
}


def _snapshot(root: Path) -> dict[str, tuple[int, int, int, int, str]]:
    result: dict[str, tuple[int, int, int, int, str]] = {}
    for path in sorted(item for item in root.rglob("*") if item.is_file()):
        stat = path.stat()
        result[str(path.relative_to(root))] = (
            stat.st_size,
            stat.st_mtime_ns,
            stat.st_ctime_ns,
            stat.st_mode,
            hashlib.sha256(path.read_bytes()).hexdigest(),
        )
    return result


@pytest.fixture
def protected_layout(tmp_path: Path):
    source = tmp_path / "immutable-source"
    source.mkdir()
    (source / "source.bin").write_bytes(b"immutable source bytes")
    layout = VaultLayout(tmp_path / "vault")
    canonical = layout.objects / "sha256" / "aa" / "bb" / "canonical.blob"
    canonical.parent.mkdir(parents=True)
    canonical.write_bytes(b"immutable canonical bytes")
    before_source = _snapshot(source)
    before_objects = _snapshot(layout.objects)
    yield layout
    assert _snapshot(source) == before_source
    assert _snapshot(layout.objects) == before_objects


def _create_v2(layout: VaultLayout) -> None:
    layout.state.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(layout.database)
    try:
        conn.execute("PRAGMA foreign_keys=ON")
        initialize_manifest_connection(conn, target_version=2)
        conn.execute("PRAGMA journal_mode=WAL")
    finally:
        conn.close()


def _create_v3(layout: VaultLayout) -> None:
    layout.state.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(layout.database)
    try:
        conn.execute("PRAGMA foreign_keys=ON")
        initialize_manifest_connection(conn, target_version=3)
        conn.execute("PRAGMA journal_mode=WAL")
    finally:
        conn.close()


def _create_v4(layout: VaultLayout) -> None:
    layout.state.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(layout.database)
    try:
        conn.execute("PRAGMA foreign_keys=ON")
        initialize_manifest_connection(conn, target_version=4)
        conn.execute("PRAGMA journal_mode=WAL")
    finally:
        conn.close()


def _create_v5(layout: VaultLayout) -> None:
    layout.state.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(layout.database)
    try:
        conn.execute("PRAGMA foreign_keys=ON")
        initialize_manifest_connection(conn, target_version=5)
        conn.execute("PRAGMA journal_mode=WAL")
    finally:
        conn.close()


def _create_v6(layout: VaultLayout) -> None:
    layout.state.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(layout.database)
    try:
        conn.execute("PRAGMA foreign_keys=ON")
        initialize_manifest_connection(conn, target_version=6)
        conn.execute("PRAGMA journal_mode=WAL")
    finally:
        conn.close()


def _create_v7(layout: VaultLayout) -> None:
    layout.state.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(layout.database)
    try:
        conn.execute("PRAGMA foreign_keys=ON")
        initialize_manifest_connection(conn, target_version=7)
        conn.execute("PRAGMA journal_mode=WAL")
    finally:
        conn.close()


def _create_v8(layout: VaultLayout) -> None:
    layout.state.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(layout.database)
    try:
        conn.execute("PRAGMA foreign_keys=ON")
        initialize_manifest_connection(conn, target_version=8)
        conn.execute("PRAGMA journal_mode=WAL")
    finally:
        conn.close()


def _create_v9(layout: VaultLayout) -> None:
    layout.state.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(layout.database)
    try:
        conn.execute("PRAGMA foreign_keys=ON")
        initialize_manifest_connection(conn, target_version=9)
        conn.execute("PRAGMA journal_mode=WAL")
    finally:
        conn.close()


def _create_v10(layout: VaultLayout) -> None:
    layout.state.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(layout.database)
    try:
        conn.execute("PRAGMA foreign_keys=ON")
        initialize_manifest_connection(conn, target_version=10)
        conn.execute("PRAGMA journal_mode=WAL")
    finally:
        conn.close()


def _create_v11(layout: VaultLayout) -> None:
    layout.state.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(layout.database)
    try:
        conn.execute("PRAGMA foreign_keys=ON")
        initialize_manifest_connection(conn, target_version=11)
        conn.execute("PRAGMA journal_mode=WAL")
    finally:
        conn.close()


def _read_version(path: Path) -> int:
    conn = sqlite3.connect(path)
    try:
        return read_schema_version(conn)
    finally:
        conn.close()


def test_migrate_fresh_database_and_repeat_safely(protected_layout: VaultLayout) -> None:
    first = migrate_vault(protected_layout)
    assert first.previous_version is None
    assert first.schema_version == SCHEMA_VERSION
    assert first.applied_migrations == (3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
    assert first.backup is None
    assert first.validation == {"schema_version": SCHEMA_VERSION, "integrity_check": "ok", "foreign_key_issues": 0}

    second = migrate_vault(protected_layout)
    assert second.already_current is True
    assert second.applied_migrations == ()
    assert second.backup is None
    assert not list(protected_layout.backups.glob("*.sqlite3"))


def test_initializer_refuses_to_rewrite_existing_schema(tmp_path: Path) -> None:
    database = tmp_path / "manifest.sqlite3"
    conn = sqlite3.connect(database)
    try:
        initialize_manifest_connection(conn)
        with pytest.raises(SchemaError, match="refusing to rewrite"):
            initialize_manifest_connection(conn, target_version=2)
        assert read_schema_version(conn) == SCHEMA_VERSION
    finally:
        conn.close()


def test_v2_opens_without_implicit_migration_and_review_features_refuse(
    protected_layout: VaultLayout,
) -> None:
    _create_v2(protected_layout)
    database_before = protected_layout.database.read_bytes()
    db = ManifestDB(protected_layout.database)
    try:
        assert db.schema_version == 2
        assert db.one("SELECT COUNT(*) AS count FROM runs")["count"] == 0
    finally:
        db.close()
    assert _read_version(protected_layout.database) == 2
    assert protected_layout.database.read_bytes() == database_before

    with pytest.raises(MigrationRequiredError, match="media-vault migrate"):
        ManifestDB(
            protected_layout.database,
            required_schema_version=SCHEMA_VERSION,
            feature_name="review UI",
        )


def test_representative_legacy_commands_keep_v2_schema(
    protected_layout: VaultLayout,
    capsys: pytest.CaptureFixture[str],
) -> None:
    _create_v2(protected_layout)
    assert main(["init", "--vault", str(protected_layout.root)]) == 0
    capsys.readouterr()
    assert _read_version(protected_layout.database) == 2
    assert main(["status", "--vault", str(protected_layout.root)]) == 0
    capsys.readouterr()
    assert _read_version(protected_layout.database) == 2


def test_v2_migration_creates_and_verifies_backup(protected_layout: VaultLayout) -> None:
    _create_v2(protected_layout)
    result = migrate_vault(protected_layout)

    assert result.previous_version == 2
    assert result.schema_version == SCHEMA_VERSION
    assert result.applied_migrations == (3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
    assert result.backup is not None
    backup = Path(result.backup.path)
    assert backup.is_file()
    assert result.backup.sha256 == hashlib.sha256(backup.read_bytes()).hexdigest()
    backup_conn = sqlite3.connect(backup)
    try:
        assert validate_manifest_connection(backup_conn, expected_version=2)["integrity_check"] == "ok"
    finally:
        backup_conn.close()

    migrated = sqlite3.connect(protected_layout.database)
    try:
        assert validate_manifest_connection(migrated, expected_version=SCHEMA_VERSION)["foreign_key_issues"] == 0
        rows = migrated.execute("SELECT version,name FROM schema_migrations ORDER BY version").fetchall()
        assert rows == [
            (3, "stage_1_ordered_migration_framework"),
            (4, "stage_2_review_import_manifest"),
            (5, "stage_3_reviewed_copy_telemetry"),
            (6, "stage_4_preprocessing_derivatives_features"),
            (7, "stage_5_review_application_foundation"),
            (8, "stage_6_import_interface_materializations"),
            (9, "stage_7_virtualized_library_browser"),
            (10, "stage_8_alternate_organization_views"),
            (11, "stage_9_similarity_stacks"),
            (12, "stage_10_explainable_junk_review"),
        ]
    finally:
        migrated.close()


def test_v3_copy_migrates_through_stage_2_to_stage_7_schema(protected_layout: VaultLayout) -> None:
    _create_v3(protected_layout)
    result = migrate_vault(protected_layout)

    assert result.previous_version == 3
    assert result.schema_version == SCHEMA_VERSION
    assert result.applied_migrations == (4, 5, 6, 7, 8, 9, 10, 11, 12)
    assert result.backup is not None
    backup = sqlite3.connect(result.backup.path)
    try:
        assert validate_manifest_connection(backup, expected_version=3)["integrity_check"] == "ok"
    finally:
        backup.close()
    migrated = sqlite3.connect(protected_layout.database)
    try:
        assert migrated.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='import_batches'"
        ).fetchone() == (1,)
        assert validate_manifest_connection(migrated, expected_version=SCHEMA_VERSION)["foreign_key_issues"] == 0
    finally:
        migrated.close()


def test_v4_copy_migrates_through_stage_3_to_stage_7_schema(protected_layout: VaultLayout) -> None:
    _create_v4(protected_layout)
    result = migrate_vault(protected_layout)

    assert result.previous_version == 4
    assert result.schema_version == SCHEMA_VERSION
    assert result.applied_migrations == (5, 6, 7, 8, 9, 10, 11, 12)
    assert result.backup is not None
    backup = sqlite3.connect(result.backup.path)
    try:
        assert validate_manifest_connection(backup, expected_version=4)["integrity_check"] == "ok"
    finally:
        backup.close()
    migrated = sqlite3.connect(protected_layout.database)
    try:
        required = {
            "import_batch_approvals",
            "import_approval_items",
            "background_job_attempts",
            "import_item_copy_attempts",
            "import_progress_samples",
            "import_events",
            "import_errors",
            "legacy_import_history",
            "derivatives",
            "asset_features",
            "asset_extended_metadata",
            "user_preferences",
            "saved_views",
            "review_application_state",
            "api_idempotency_records",
            "import_manifest_views",
            "import_manifest_view_items",
            "facet_rollups",
            "photo_entities",
            "photo_entity_members",
            "materialized_views",
            "materialized_view_items",
            "photo_user_state",
            "photo_user_state_events",
        } | STAGE8_TABLES | STAGE9_TABLES | STAGE10_TABLES
        tables = {
            row[0]
            for row in migrated.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        assert required <= tables
        assert STAGE10_TABLES <= tables
        assert validate_manifest_connection(migrated, expected_version=SCHEMA_VERSION)["foreign_key_issues"] == 0
    finally:
        migrated.close()


def test_v5_copy_migrates_through_stage_4_to_stage_7_schema(protected_layout: VaultLayout) -> None:
    _create_v5(protected_layout)
    result = migrate_vault(protected_layout)

    assert result.previous_version == 5
    assert result.schema_version == SCHEMA_VERSION
    assert result.applied_migrations == (6, 7, 8, 9, 10, 11, 12)
    assert result.backup is not None
    backup = sqlite3.connect(result.backup.path)
    try:
        assert validate_manifest_connection(backup, expected_version=5)["integrity_check"] == "ok"
    finally:
        backup.close()
    migrated = sqlite3.connect(protected_layout.database)
    try:
        tables = {
            row[0]
            for row in migrated.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        assert {
            "derivatives",
            "asset_features",
            "asset_extended_metadata",
            "user_preferences",
            "saved_views",
            "review_application_state",
            "api_idempotency_records",
            "import_manifest_views",
            "import_manifest_view_items",
            "facet_rollups",
            "photo_entities",
            "photo_entity_members",
            "materialized_views",
            "materialized_view_items",
            "photo_user_state",
            "photo_user_state_events",
        } | STAGE8_TABLES | STAGE9_TABLES | STAGE10_TABLES <= tables
        assert validate_manifest_connection(migrated, expected_version=SCHEMA_VERSION)["foreign_key_issues"] == 0
    finally:
        migrated.close()


def test_v6_copy_migrates_through_stage_5_to_stage_7_schema(protected_layout: VaultLayout) -> None:
    _create_v6(protected_layout)
    result = migrate_vault(protected_layout)

    assert result.previous_version == 6
    assert result.schema_version == SCHEMA_VERSION
    assert result.applied_migrations == (7, 8, 9, 10, 11, 12)
    assert result.backup is not None
    backup = sqlite3.connect(result.backup.path)
    try:
        assert validate_manifest_connection(backup, expected_version=6)["integrity_check"] == "ok"
    finally:
        backup.close()
    migrated = sqlite3.connect(protected_layout.database)
    try:
        tables = {
            row[0]
            for row in migrated.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        assert {
            "user_preferences",
            "saved_views",
            "review_application_state",
            "api_idempotency_records",
            "import_manifest_views",
            "import_manifest_view_items",
            "photo_entities",
            "photo_entity_members",
            "materialized_views",
            "materialized_view_items",
            "photo_user_state",
            "photo_user_state_events",
            "facet_rollups",
        } | STAGE8_TABLES | STAGE9_TABLES | STAGE10_TABLES <= tables
        assert validate_manifest_connection(migrated, expected_version=SCHEMA_VERSION)["foreign_key_issues"] == 0
    finally:
        migrated.close()


def test_v7_copy_migrates_through_stage_6_to_stage_7_schema(protected_layout: VaultLayout) -> None:
    _create_v7(protected_layout)
    result = migrate_vault(protected_layout)

    assert result.previous_version == 7
    assert result.schema_version == SCHEMA_VERSION
    assert result.applied_migrations == (8, 9, 10, 11, 12)
    assert result.backup is not None
    backup = sqlite3.connect(result.backup.path)
    try:
        assert validate_manifest_connection(backup, expected_version=7)["integrity_check"] == "ok"
    finally:
        backup.close()
    migrated = sqlite3.connect(protected_layout.database)
    try:
        tables = {
            row[0]
            for row in migrated.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        assert {
            "import_manifest_views",
            "import_manifest_view_items",
            "photo_entities",
            "photo_entity_members",
            "materialized_views",
            "materialized_view_items",
            "photo_user_state",
            "photo_user_state_events",
            "facet_rollups",
        } | STAGE8_TABLES | STAGE9_TABLES | STAGE10_TABLES <= tables
        assert validate_manifest_connection(migrated, expected_version=SCHEMA_VERSION)["foreign_key_issues"] == 0
    finally:
        migrated.close()


def test_v8_copy_migrates_through_stage_7_to_stage_8_schema(protected_layout: VaultLayout) -> None:
    _create_v8(protected_layout)
    result = migrate_vault(protected_layout)

    assert result.previous_version == 8
    assert result.schema_version == SCHEMA_VERSION
    assert result.applied_migrations == (9, 10, 11, 12)
    assert result.backup is not None
    backup = sqlite3.connect(result.backup.path)
    try:
        assert validate_manifest_connection(backup, expected_version=8)["integrity_check"] == "ok"
    finally:
        backup.close()
    migrated = sqlite3.connect(protected_layout.database)
    try:
        tables = {
            row[0]
            for row in migrated.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        }
        assert {
            "photo_entities",
            "photo_entity_members",
            "materialized_views",
            "materialized_view_items",
            "photo_user_state",
            "photo_user_state_events",
            "facet_rollups",
        } | STAGE8_TABLES <= tables
        indexes = {
            row[0]
            for row in migrated.execute("SELECT name FROM sqlite_master WHERE type='index'").fetchall()
        }
        assert {
            "idx_photo_entities_capture",
            "idx_photo_entities_import",
            "idx_photo_entities_filename",
            "idx_photo_entities_height",
            "idx_photo_user_state_favourite",
            "idx_photo_user_state_rejected",
            "idx_photo_user_state_rating",
            "idx_materialized_views_ready",
            "idx_materialized_view_items_entity",
            "idx_facet_rollups_page",
        } <= indexes
        materialized_columns = {
            row[1] for row in migrated.execute("PRAGMA table_info(materialized_views)").fetchall()
        }
        assert "state_generation" in materialized_columns
        assert "map_clusters" in tables
        assert STAGE9_TABLES <= tables
        assert STAGE10_TABLES <= tables
        assert validate_manifest_connection(migrated, expected_version=SCHEMA_VERSION)["foreign_key_issues"] == 0
    finally:
        migrated.close()


def test_v9_copy_migrates_through_stage_8_to_stage_9_schema(protected_layout: VaultLayout) -> None:
    _create_v9(protected_layout)
    result = migrate_vault(protected_layout)

    assert result.previous_version == 9
    assert result.schema_version == SCHEMA_VERSION
    assert result.applied_migrations == (10, 11, 12)
    assert result.backup is not None
    backup = sqlite3.connect(result.backup.path)
    try:
        assert validate_manifest_connection(backup, expected_version=9)["integrity_check"] == "ok"
    finally:
        backup.close()
    migrated = sqlite3.connect(protected_layout.database)
    try:
        tables = {
            row[0]
            for row in migrated.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        }
        assert STAGE8_TABLES <= tables
        indexes = {
            row[0]
            for row in migrated.execute("SELECT name FROM sqlite_master WHERE type='index'").fetchall()
        }
        assert {
            "idx_calendar_buckets_month",
            "idx_folder_hierarchy_children",
            "idx_equipment_rollups_page",
            "idx_map_clusters_viewport",
            "idx_map_cluster_items_entity",
        } <= indexes
        assert STAGE9_TABLES <= tables
        assert STAGE10_TABLES <= tables
        assert validate_manifest_connection(migrated, expected_version=SCHEMA_VERSION)["foreign_key_issues"] == 0
    finally:
        migrated.close()


def test_v10_copy_migrates_to_stage_9_schema(protected_layout: VaultLayout) -> None:
    _create_v10(protected_layout)
    result = migrate_vault(protected_layout)

    assert result.previous_version == 10
    assert result.schema_version == SCHEMA_VERSION
    assert result.applied_migrations == (11, 12)
    assert result.backup is not None
    backup = sqlite3.connect(result.backup.path)
    try:
        assert validate_manifest_connection(backup, expected_version=10)["integrity_check"] == "ok"
    finally:
        backup.close()
    migrated = sqlite3.connect(protected_layout.database)
    try:
        tables = {
            row[0]
            for row in migrated.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        }
        indexes = {
            row[0]
            for row in migrated.execute("SELECT name FROM sqlite_master WHERE type='index'").fetchall()
        }
        assert STAGE9_TABLES <= tables
        assert {
            "idx_stack_inputs_phash_bucket",
            "idx_stack_inputs_capture",
            "idx_stack_candidate_edges_left",
            "idx_stack_profiles_ready",
            "idx_stacks_page",
            "idx_stack_members_entity",
        } <= indexes
        assert STAGE10_TABLES <= tables
        assert validate_manifest_connection(migrated, expected_version=SCHEMA_VERSION)["foreign_key_issues"] == 0
    finally:
        migrated.close()


def test_v11_copy_migrates_to_stage_10_schema(protected_layout: VaultLayout) -> None:
    _create_v11(protected_layout)
    result = migrate_vault(protected_layout)

    assert result.previous_version == 11
    assert result.schema_version == SCHEMA_VERSION
    assert result.applied_migrations == (12,)
    assert result.backup is not None
    backup = sqlite3.connect(result.backup.path)
    try:
        assert validate_manifest_connection(backup, expected_version=11)["integrity_check"] == "ok"
    finally:
        backup.close()
    migrated = sqlite3.connect(protected_layout.database)
    try:
        tables = {
            row[0]
            for row in migrated.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        }
        indexes = {
            row[0]
            for row in migrated.execute("SELECT name FROM sqlite_master WHERE type='index'").fetchall()
        }
        assert STAGE10_TABLES <= tables
        assert {
            "idx_junk_signals_entity",
            "idx_junk_signals_reason_confidence",
            "idx_junk_profiles_ready",
            "idx_junk_results_hidden_page",
            "idx_junk_results_entity",
            "idx_junk_feedback_pending",
        } <= indexes
        assert validate_manifest_connection(migrated, expected_version=SCHEMA_VERSION)["foreign_key_issues"] == 0
    finally:
        migrated.close()


def test_migrate_cli_is_explicit_and_reports_result(
    protected_layout: VaultLayout,
    capsys: pytest.CaptureFixture[str],
) -> None:
    _create_v2(protected_layout)
    assert main(["migrate", "--vault", str(protected_layout.root)]) == 0
    output = json.loads(capsys.readouterr().out)
    assert output["previous_version"] == 2
    assert output["schema_version"] == SCHEMA_VERSION
    assert output["backup"]["integrity_check"] == "ok"


def test_migration_refuses_a_live_writer(protected_layout: VaultLayout) -> None:
    _create_v2(protected_layout)
    lock = protected_layout.state / "active-writer.lock"
    lock.write_text(
        json.dumps({"pid": os.getpid(), "token": "active", "command": "import"}),
        encoding="utf-8",
    )
    try:
        with pytest.raises(RuntimeError, match="Another vault writer is active"):
            migrate_vault(protected_layout)
        assert _read_version(protected_layout.database) == 2
        assert not list(protected_layout.backups.glob("*.sqlite3"))
    finally:
        lock.unlink()


def test_insufficient_backup_space_leaves_v2_usable(protected_layout: VaultLayout) -> None:
    _create_v2(protected_layout)
    before = protected_layout.database.read_bytes()
    with pytest.raises(InsufficientMigrationSpaceError, match="verified backup"):
        migrate_vault(protected_layout, disk_usage=lambda _path: SimpleNamespace(free=0))
    assert _read_version(protected_layout.database) == 2
    assert protected_layout.database.read_bytes() == before
    assert not list(protected_layout.backups.glob("*.sqlite3"))


def test_backup_failure_leaves_v2_usable(
    protected_layout: VaultLayout,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _create_v2(protected_layout)

    def fail_backup(_layout: VaultLayout, _version: int):
        raise OSError("synthetic backup failure")

    monkeypatch.setattr(migration_module, "_backup_database", fail_backup)
    with pytest.raises(OSError, match="synthetic backup failure"):
        migrate_vault(protected_layout)
    conn = sqlite3.connect(protected_layout.database)
    try:
        assert validate_manifest_connection(conn, expected_version=2)["integrity_check"] == "ok"
    finally:
        conn.close()


def test_backup_validation_failure_leaves_v2_usable(
    protected_layout: VaultLayout,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _create_v2(protected_layout)
    real_validator = migration_module.validate_manifest_connection
    calls = 0

    def fail_backup_validation(conn: sqlite3.Connection, *, expected_version: int | None = None):
        nonlocal calls
        calls += 1
        if calls == 2:
            raise SchemaError("synthetic backup integrity failure")
        return real_validator(conn, expected_version=expected_version)

    monkeypatch.setattr(migration_module, "validate_manifest_connection", fail_backup_validation)
    with pytest.raises(SchemaError, match="backup integrity failure"):
        migrate_vault(protected_layout)
    assert _read_version(protected_layout.database) == 2
    assert not list(protected_layout.backups.glob("*.sqlite3"))


@pytest.mark.parametrize("failure", [RuntimeError("synthetic failure"), KeyboardInterrupt()])
def test_failing_or_interrupted_migration_rolls_back(
    protected_layout: VaultLayout,
    failure: BaseException,
) -> None:
    _create_v2(protected_layout)

    def fail_after_ddl(conn: sqlite3.Connection) -> None:
        conn.execute("CREATE TABLE must_rollback(value TEXT)")
        raise failure

    with pytest.raises(type(failure), match="synthetic failure" if isinstance(failure, RuntimeError) else None):
        migrate_vault(
            protected_layout,
            migrations=(
                Migration(3, "synthetic_failure", fail_after_ddl),
                Migration(4, "unreached", lambda _conn: None),
                Migration(5, "unreached_stage_3", lambda _conn: None),
                Migration(6, "unreached_stage_4", lambda _conn: None),
                Migration(7, "unreached_stage_5", lambda _conn: None),
                Migration(8, "unreached_stage_6", lambda _conn: None),
                Migration(9, "unreached_stage_7", lambda _conn: None),
                Migration(10, "unreached_stage_8", lambda _conn: None),
                Migration(11, "unreached_stage_9", lambda _conn: None),
                Migration(12, "unreached_stage_10", lambda _conn: None),
            ),
        )

    conn = sqlite3.connect(protected_layout.database)
    try:
        assert validate_manifest_connection(conn, expected_version=2)["integrity_check"] == "ok"
        assert conn.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='must_rollback'"
        ).fetchone() is None
    finally:
        conn.close()


def test_foreign_key_failure_refuses_migration(protected_layout: VaultLayout) -> None:
    _create_v2(protected_layout)
    conn = sqlite3.connect(protected_layout.database)
    try:
        conn.execute("PRAGMA foreign_keys=OFF")
        conn.execute(
            "INSERT INTO scan_summaries VALUES(?,?,?,?,?,?)",
            ("missing-run", "missing-root", 1, 0, 0, "2026-07-21T00:00:00Z"),
        )
        conn.commit()
    finally:
        conn.close()

    with pytest.raises(SchemaError, match="foreign_key_check failed"):
        migrate_vault(protected_layout)
    assert _read_version(protected_layout.database) == 2
    assert not list(protected_layout.backups.glob("*.sqlite3"))


def test_post_migration_validation_failure_restores_verified_backup(
    protected_layout: VaultLayout,
) -> None:
    _create_v2(protected_layout)

    def fail_validation(_conn: sqlite3.Connection, *, expected_version: int | None = None):
        raise SchemaError(f"synthetic integrity failure at schema {expected_version}")

    with pytest.raises(RuntimeError, match="backup was restored"):
        migrate_vault(protected_layout, post_migration_validator=fail_validation)

    restored = sqlite3.connect(protected_layout.database)
    try:
        assert validate_manifest_connection(restored, expected_version=2)["integrity_check"] == "ok"
        assert restored.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='schema_migrations'"
        ).fetchone() is None
    finally:
        restored.close()


def test_review_config_defines_separate_typed_boundaries(tmp_path: Path) -> None:
    vault = tmp_path / "vault"
    inbox = tmp_path / "inbox"
    derivatives = tmp_path / "generated-derivatives"
    config = ReviewConfig(vault_root=vault, inbox_root=inbox, derivative_root=derivatives)

    assert config.review_port == 8766
    assert config.dashboard_port == 8765
    assert config.workers.media_io_workers == 1
    assert config.request_budgets.max_page_size == 500
    assert config.analyzer_versions.quality_features == "quality-features-v1"
    boundaries = config.storage_boundaries()
    assert boundaries["canonical_objects"]["mutability"] == "permanently immutable"
    assert boundaries["derivatives"]["mutability"] == "regenerable"
    config.assert_source_separated(tmp_path / "source")

    with pytest.raises(ValueError, match="inbox and vault"):
        ReviewConfig(vault_root=vault, inbox_root=vault / "inbox")
    with pytest.raises(ValueError, match="derivative root and canonical objects"):
        ReviewConfig(vault_root=vault, inbox_root=inbox, derivative_root=vault / "objects" / "derived")
    with pytest.raises(ValueError, match="review_port"):
        ReviewConfig(vault_root=vault, inbox_root=inbox, review_port=8765)
    with pytest.raises(ValueError, match="total_workers"):
        WorkerLimits(total_workers=0)
    with pytest.raises(ValueError, match="max_page_size"):
        RequestBudgets(default_page_size=10, max_page_size=5)
