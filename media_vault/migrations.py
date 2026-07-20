from __future__ import annotations

import contextlib
import hashlib
import os
import sqlite3
import tempfile
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Sequence
from urllib.parse import quote

from .core import VaultLayout, VaultRunLock, disk_usage_for, is_within
from .db import (
    MIGRATIONS,
    SCHEMA_VERSION,
    Migration,
    SchemaError,
    apply_migrations,
    initialize_manifest_connection,
    read_schema_version,
    validate_manifest_connection,
)


MIGRATION_FREE_SPACE_MARGIN_BYTES = 16 * 1024 * 1024
MIGRATION_FREE_SPACE_MARGIN_RATIO = 0.05


class InsufficientMigrationSpaceError(RuntimeError):
    """The verified backup cannot be created with the available free space."""


@dataclass(frozen=True)
class MigrationBackup:
    path: str
    size_bytes: int
    sha256: str
    schema_version: int
    integrity_check: str
    foreign_key_issues: int


@dataclass(frozen=True)
class MigrationResult:
    database: str
    previous_version: int | None
    schema_version: int
    applied_migrations: tuple[int, ...]
    backup: MigrationBackup | None
    already_current: bool
    validation: dict[str, int | str]

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


def _readonly_uri(path: Path) -> str:
    return f"file:{quote(path.resolve().as_posix(), safe='/:')}?mode=ro"


def _connect_readonly(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(_readonly_uri(path), uri=True, timeout=60)
    conn.execute("PRAGMA query_only=ON")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA busy_timeout=60000")
    return conn


def _database_footprint(path: Path) -> int:
    return sum(
        candidate.stat().st_size
        for candidate in (path, Path(f"{path}-wal"), Path(f"{path}-shm"))
        if candidate.exists()
    )


def _required_backup_space(path: Path) -> int:
    footprint = max(_database_footprint(path), 1)
    return footprint + max(MIGRATION_FREE_SPACE_MARGIN_BYTES, int(footprint * MIGRATION_FREE_SPACE_MARGIN_RATIO))


def _fsync_file(path: Path) -> None:
    # Windows requires a writable handle for FlushFileBuffers/os.fsync even
    # though this operation does not change the file's contents.
    with path.open("r+b", buffering=0) as handle:
        os.fsync(handle.fileno())


def _publish_no_overwrite(temp_path: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    os.link(temp_path, target)
    temp_path.unlink()


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb", buffering=0) as handle:
        while block := handle.read(8 * 1024 * 1024):
            digest.update(block)
    return digest.hexdigest()


def _backup_database(layout: VaultLayout, version: int) -> MigrationBackup:
    layout.backups.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    target = layout.backups / f"manifest-v{version}-{timestamp}-{uuid.uuid4().hex[:12]}.sqlite3"
    fd, raw_temp = tempfile.mkstemp(prefix="manifest-backup-", suffix=".partial", dir=layout.backups)
    os.close(fd)
    temp = Path(raw_temp)
    try:
        source = _connect_readonly(layout.database)
        destination = sqlite3.connect(temp)
        try:
            source.backup(destination)
            destination.commit()
            validation = validate_manifest_connection(destination, expected_version=version)
            destination.execute("PRAGMA journal_mode=DELETE")
        finally:
            destination.close()
            source.close()
        _fsync_file(temp)
        _publish_no_overwrite(temp, target)
        return MigrationBackup(
            path=str(target),
            size_bytes=target.stat().st_size,
            sha256=_sha256_file(target),
            schema_version=version,
            integrity_check=str(validation["integrity_check"]),
            foreign_key_issues=int(validation["foreign_key_issues"]),
        )
    finally:
        with contextlib.suppress(FileNotFoundError):
            temp.unlink()


def _restore_backup(layout: VaultLayout, backup: MigrationBackup) -> None:
    backup_path = Path(backup.path)
    if not is_within(layout.database, layout.state) or not is_within(backup_path, layout.backups):
        raise RuntimeError("Refusing migration recovery outside the vault state/backup directories")
    source = _connect_readonly(backup_path)
    try:
        validate_manifest_connection(source, expected_version=backup.schema_version)
        destination = sqlite3.connect(layout.database, timeout=60)
        try:
            destination.execute("PRAGMA busy_timeout=60000")
            source.backup(destination)
            destination.commit()
            destination.execute("PRAGMA wal_checkpoint(FULL)").fetchall()
            validate_manifest_connection(destination, expected_version=backup.schema_version)
        finally:
            destination.close()
    finally:
        source.close()


def _initialize_fresh_database(layout: VaultLayout) -> MigrationResult:
    layout.temp.mkdir(parents=True, exist_ok=True)
    fd, raw_temp = tempfile.mkstemp(prefix="manifest-new-", suffix=".partial", dir=layout.temp)
    os.close(fd)
    temp = Path(raw_temp)
    try:
        conn = sqlite3.connect(temp)
        try:
            conn.execute("PRAGMA foreign_keys=ON")
            conn.execute("PRAGMA synchronous=FULL")
            initialize_manifest_connection(conn)
            validation = validate_manifest_connection(conn, expected_version=SCHEMA_VERSION)
            conn.execute("PRAGMA journal_mode=DELETE")
        finally:
            conn.close()
        _fsync_file(temp)
        _publish_no_overwrite(temp, layout.database)
    finally:
        with contextlib.suppress(FileNotFoundError):
            temp.unlink()
    return MigrationResult(
        database=str(layout.database),
        previous_version=None,
        schema_version=SCHEMA_VERSION,
        applied_migrations=tuple(item.version for item in MIGRATIONS),
        backup=None,
        already_current=False,
        validation=validation,
    )


def _migrate_locked(
    layout: VaultLayout,
    *,
    migrations: Sequence[Migration],
    disk_usage: Callable[[Path], Any],
    post_migration_validator: Callable[..., dict[str, int | str]],
) -> MigrationResult:
    layout.state.mkdir(parents=True, exist_ok=True)
    if not layout.database.exists():
        return _initialize_fresh_database(layout)

    before = _connect_readonly(layout.database)
    try:
        previous_version = read_schema_version(before)
        validation = validate_manifest_connection(before, expected_version=previous_version)
    finally:
        before.close()
    if previous_version == SCHEMA_VERSION:
        return MigrationResult(
            database=str(layout.database),
            previous_version=previous_version,
            schema_version=SCHEMA_VERSION,
            applied_migrations=(),
            backup=None,
            already_current=True,
            validation=validation,
        )
    if previous_version > SCHEMA_VERSION:
        raise SchemaError(
            f"Manifest schema {previous_version} is newer than this tool's supported schema {SCHEMA_VERSION}"
        )

    required = _required_backup_space(layout.database)
    available = int(disk_usage(layout.backups).free)
    if available < required:
        raise InsufficientMigrationSpaceError(
            f"Migration requires at least {required} free bytes for a verified backup; only {available} are available"
        )
    backup = _backup_database(layout, previous_version)

    applied: list[Migration] | None = None
    conn = sqlite3.connect(layout.database, timeout=60)
    try:
        conn.execute("PRAGMA foreign_keys=ON")
        conn.execute("PRAGMA synchronous=FULL")
        conn.execute("PRAGMA busy_timeout=60000")
        applied = apply_migrations(conn, migrations=migrations)
        conn.execute("PRAGMA wal_checkpoint(FULL)").fetchall()
    except BaseException:
        if applied is not None:
            conn.close()
            _restore_backup(layout, backup)
            conn = None
        raise
    finally:
        if conn is not None:
            conn.close()

    try:
        after = _connect_readonly(layout.database)
        try:
            final_validation = post_migration_validator(after, expected_version=SCHEMA_VERSION)
        finally:
            after.close()
    except Exception as exc:
        _restore_backup(layout, backup)
        raise RuntimeError(
            f"Post-migration validation failed and the verified schema-{previous_version} backup was restored: {exc}"
        ) from exc

    return MigrationResult(
        database=str(layout.database),
        previous_version=previous_version,
        schema_version=SCHEMA_VERSION,
        applied_migrations=tuple(item.version for item in applied),
        backup=backup,
        already_current=False,
        validation=final_validation,
    )


def migrate_vault(
    layout: VaultLayout,
    *,
    migrations: Sequence[Migration] = MIGRATIONS,
    disk_usage: Callable[[Path], Any] | None = None,
    post_migration_validator: Callable[..., dict[str, int | str]] = validate_manifest_connection,
) -> MigrationResult:
    usage = disk_usage or disk_usage_for
    with VaultRunLock(layout.state, "migrate"):
        return _migrate_locked(
            layout,
            migrations=migrations,
            disk_usage=usage,
            post_migration_validator=post_migration_validator,
        )
