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
    assert first.applied_migrations == (3,)
    assert first.backup is None
    assert first.validation == {"schema_version": 3, "integrity_check": "ok", "foreign_key_issues": 0}

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
    assert result.schema_version == 3
    assert result.applied_migrations == (3,)
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
        assert validate_manifest_connection(migrated, expected_version=3)["foreign_key_issues"] == 0
        row = migrated.execute("SELECT version,name FROM schema_migrations").fetchone()
        assert row == (3, "stage_1_ordered_migration_framework")
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
    assert output["schema_version"] == 3
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
            migrations=(Migration(3, "synthetic_failure", fail_after_ddl),),
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
