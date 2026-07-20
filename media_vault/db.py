from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Iterable, Sequence

from . import __version__
from .core import utc_now


BASE_SCHEMA_VERSION = 2
SCHEMA_VERSION = 3
SUPPORTED_SCHEMA_VERSIONS = frozenset({BASE_SCHEMA_VERSION, SCHEMA_VERSION})


SCHEMA_V2 = r"""
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS schema_info (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS runs (
    run_id TEXT PRIMARY KEY,
    command TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    source_root TEXT,
    vault_root TEXT NOT NULL,
    host TEXT NOT NULL,
    tool_version TEXT NOT NULL,
    arguments_json TEXT NOT NULL,
    summary_json TEXT
);

CREATE TABLE IF NOT EXISTS source_roots (
    source_root_id TEXT PRIMARY KEY,
    path_text TEXT NOT NULL COLLATE BINARY,
    first_seen_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    last_complete_run_id TEXT,
    UNIQUE(path_text)
);

CREATE TABLE IF NOT EXISTS scan_summaries (
    run_id TEXT PRIMARY KEY REFERENCES runs(run_id),
    source_root_id TEXT NOT NULL REFERENCES source_roots(source_root_id),
    traversal_complete INTEGER NOT NULL,
    current_media_file_count INTEGER NOT NULL,
    current_media_bytes INTEGER NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scan_summaries_root
    ON scan_summaries(source_root_id, run_id);

CREATE TABLE IF NOT EXISTS source_files (
    source_file_id TEXT PRIMARY KEY,
    source_root_id TEXT NOT NULL REFERENCES source_roots(source_root_id),
    path_text TEXT NOT NULL COLLATE BINARY,
    relative_path_text TEXT NOT NULL COLLATE BINARY,
    first_seen_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    last_seen_run_id TEXT NOT NULL,
    present INTEGER NOT NULL DEFAULT 1,
    size_bytes INTEGER,
    mtime_ns INTEGER,
    ctime_ns INTEGER,
    device_id TEXT,
    file_id TEXT,
    current_version_id INTEGER,
    discovery_status TEXT NOT NULL,
    media_kind TEXT,
    asset_id TEXT,
    last_error TEXT,
    UNIQUE(source_root_id, path_text)
);

CREATE INDEX IF NOT EXISTS idx_source_files_root_seen
    ON source_files(source_root_id, last_seen_run_id);
CREATE INDEX IF NOT EXISTS idx_source_files_asset
    ON source_files(asset_id);

CREATE TABLE IF NOT EXISTS source_versions (
    source_version_id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_file_id TEXT NOT NULL REFERENCES source_files(source_file_id),
    observed_run_id TEXT NOT NULL REFERENCES runs(run_id),
    observed_at TEXT NOT NULL,
    superseded_at TEXT,
    size_bytes INTEGER,
    mtime_ns INTEGER,
    ctime_ns INTEGER,
    device_id TEXT,
    file_id TEXT,
    extension_text TEXT COLLATE BINARY,
    discovery_status TEXT NOT NULL,
    discovery_basis TEXT,
    media_kind TEXT,
    mime_type TEXT,
    detected_format TEXT,
    extension_mismatch INTEGER NOT NULL DEFAULT 0,
    asset_id TEXT,
    hash_status TEXT,
    metadata_status TEXT,
    metadata_json TEXT,
    normalized_metadata_json TEXT,
    warnings_json TEXT,
    error_text TEXT
);

CREATE INDEX IF NOT EXISTS idx_source_versions_file
    ON source_versions(source_file_id, source_version_id);
CREATE INDEX IF NOT EXISTS idx_source_versions_asset
    ON source_versions(asset_id);

CREATE TABLE IF NOT EXISTS exact_groups (
    exact_group_id TEXT PRIMARY KEY,
    size_bytes INTEGER NOT NULL,
    sha256 TEXT NOT NULL,
    blake3 TEXT NOT NULL,
    sha512 TEXT NOT NULL,
    collision_discriminator TEXT NOT NULL DEFAULT '',
    verification_method TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(size_bytes, sha256, blake3, sha512, collision_discriminator)
);

CREATE TABLE IF NOT EXISTS assets (
    asset_id TEXT PRIMARY KEY,
    exact_group_id TEXT NOT NULL REFERENCES exact_groups(exact_group_id),
    size_bytes INTEGER NOT NULL,
    sha256 TEXT NOT NULL,
    blake3 TEXT NOT NULL,
    sha512 TEXT NOT NULL,
    collision_discriminator TEXT NOT NULL DEFAULT '',
    hash_algorithm_versions_json TEXT NOT NULL,
    media_kind TEXT NOT NULL,
    mime_type TEXT,
    detected_format TEXT,
    preferred_extension TEXT,
    decoded_pixel_sha256 TEXT,
    perceptual_hash TEXT,
    video_frame_fingerprint TEXT,
    decoded_video_sha256 TEXT,
    decoded_audio_sha256 TEXT,
    width INTEGER,
    height INTEGER,
    duration_seconds REAL,
    camera_make TEXT,
    camera_model TEXT,
    camera_serial TEXT,
    lens_model TEXT,
    capture_time_text TEXT,
    capture_time_source TEXT,
    orientation_text TEXT,
    video_codec TEXT,
    audio_codec TEXT,
    metadata_json TEXT,
    object_relpath TEXT NOT NULL COLLATE BINARY,
    object_status TEXT NOT NULL DEFAULT 'missing',
    object_verified_at TEXT,
    created_run_id TEXT NOT NULL REFERENCES runs(run_id),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    warnings_json TEXT,
    UNIQUE(size_bytes, sha256, blake3, sha512, collision_discriminator)
);

CREATE INDEX IF NOT EXISTS idx_assets_hashes
    ON assets(size_bytes, sha256, blake3, sha512);
CREATE INDEX IF NOT EXISTS idx_assets_capture
    ON assets(capture_time_text, camera_model);

CREATE TABLE IF NOT EXISTS asset_sources (
    asset_id TEXT NOT NULL REFERENCES assets(asset_id),
    source_version_id INTEGER NOT NULL REFERENCES source_versions(source_version_id),
    exact_verification_method TEXT NOT NULL,
    exact_verified_at TEXT NOT NULL,
    is_initial_representative INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY(asset_id, source_version_id)
);

CREATE TABLE IF NOT EXISTS destinations (
    destination_id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL REFERENCES assets(asset_id),
    path_text TEXT NOT NULL COLLATE BINARY,
    status TEXT NOT NULL,
    size_bytes INTEGER,
    sha256 TEXT,
    blake3 TEXT,
    sha512 TEXT,
    copied_from_source_version_id INTEGER REFERENCES source_versions(source_version_id),
    copy_started_at TEXT,
    verified_at TEXT,
    last_validation_run_id TEXT REFERENCES runs(run_id),
    error_text TEXT,
    UNIQUE(asset_id, path_text)
);

CREATE TABLE IF NOT EXISTS relationships (
    relationship_id TEXT PRIMARY KEY,
    left_asset_id TEXT NOT NULL REFERENCES assets(asset_id),
    right_asset_id TEXT NOT NULL REFERENCES assets(asset_id),
    relationship_type TEXT NOT NULL,
    method TEXT NOT NULL,
    confidence_label TEXT NOT NULL,
    confidence_score REAL NOT NULL,
    evidence_json TEXT NOT NULL,
    created_run_id TEXT NOT NULL REFERENCES runs(run_id),
    created_at TEXT NOT NULL,
    UNIQUE(left_asset_id, right_asset_id, relationship_type, method)
);

CREATE INDEX IF NOT EXISTS idx_relationships_left ON relationships(left_asset_id);
CREATE INDEX IF NOT EXISTS idx_relationships_right ON relationships(right_asset_id);

CREATE TABLE IF NOT EXISTS raw_jpeg_groups (
    raw_jpeg_group_id TEXT PRIMARY KEY,
    anchor_raw_asset_id TEXT NOT NULL REFERENCES assets(asset_id),
    confidence_label TEXT NOT NULL,
    confidence_score REAL NOT NULL,
    evidence_json TEXT NOT NULL,
    created_run_id TEXT NOT NULL REFERENCES runs(run_id),
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS raw_jpeg_members (
    raw_jpeg_group_id TEXT NOT NULL REFERENCES raw_jpeg_groups(raw_jpeg_group_id),
    asset_id TEXT NOT NULL REFERENCES assets(asset_id),
    role TEXT NOT NULL,
    confidence_label TEXT NOT NULL,
    confidence_score REAL NOT NULL,
    evidence_json TEXT NOT NULL,
    ambiguous INTEGER NOT NULL DEFAULT 0,
    alternative_group_ids_json TEXT,
    PRIMARY KEY(raw_jpeg_group_id, asset_id)
);

CREATE TABLE IF NOT EXISTS warnings (
    warning_id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id TEXT NOT NULL REFERENCES runs(run_id),
    source_file_id TEXT REFERENCES source_files(source_file_id),
    asset_id TEXT REFERENCES assets(asset_id),
    severity TEXT NOT NULL,
    code TEXT NOT NULL,
    message TEXT NOT NULL,
    evidence_json TEXT,
    created_at TEXT NOT NULL
);
"""

# Kept as an import-compatible name for code that treats this as the core
# legacy table definition. Existing databases are never re-executed through it.
SCHEMA = SCHEMA_V2


class SchemaError(RuntimeError):
    """The manifest schema is missing, invalid, or unsupported."""


class MigrationRequiredError(SchemaError):
    """A feature requires an explicit manifest migration."""


@dataclass(frozen=True)
class Migration:
    version: int
    name: str
    apply: Callable[[sqlite3.Connection], None]


def _add_migration_history(conn: sqlite3.Connection) -> None:
    conn.execute(
        """CREATE TABLE schema_migrations (
               version INTEGER PRIMARY KEY,
               name TEXT NOT NULL,
               applied_at TEXT NOT NULL,
               tool_version TEXT NOT NULL
           )"""
    )


MIGRATIONS: tuple[Migration, ...] = (
    Migration(3, "stage_1_ordered_migration_framework", _add_migration_history),
)


def _ordered_migrations(migrations: Sequence[Migration] = MIGRATIONS) -> tuple[Migration, ...]:
    ordered = tuple(sorted(migrations, key=lambda item: item.version))
    versions = [item.version for item in ordered]
    if versions != list(range(BASE_SCHEMA_VERSION + 1, SCHEMA_VERSION + 1)):
        raise SchemaError(
            "Migration registry must contain one ordered migration for every schema version "
            f"from {BASE_SCHEMA_VERSION + 1} through {SCHEMA_VERSION}; found {versions}"
        )
    return ordered


def read_schema_version(conn: sqlite3.Connection) -> int:
    table = conn.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name='schema_info'"
    ).fetchone()
    if table is None:
        raise SchemaError("Manifest is missing schema_info; refusing to guess or rewrite its schema")
    row = conn.execute("SELECT value FROM schema_info WHERE key='schema_version'").fetchone()
    if row is None:
        raise SchemaError("Manifest is missing schema_info.schema_version")
    try:
        return int(row[0])
    except (TypeError, ValueError) as exc:
        raise SchemaError(f"Manifest schema version is invalid: {row[0]!r}") from exc


def validate_manifest_connection(
    conn: sqlite3.Connection,
    *,
    expected_version: int | None = None,
) -> dict[str, int | str]:
    version = read_schema_version(conn)
    if expected_version is not None and version != expected_version:
        raise SchemaError(f"Expected manifest schema {expected_version}, found {version}")
    integrity = [str(row[0]) for row in conn.execute("PRAGMA integrity_check").fetchall()]
    if integrity != ["ok"]:
        raise SchemaError(f"SQLite integrity_check failed: {integrity}")
    foreign_key_issues = conn.execute("PRAGMA foreign_key_check").fetchall()
    if foreign_key_issues:
        raise SchemaError(f"SQLite foreign_key_check failed with {len(foreign_key_issues)} issue(s)")
    return {"schema_version": version, "integrity_check": "ok", "foreign_key_issues": 0}


def apply_migrations(
    conn: sqlite3.Connection,
    *,
    target_version: int = SCHEMA_VERSION,
    migrations: Sequence[Migration] = MIGRATIONS,
) -> list[Migration]:
    current = read_schema_version(conn)
    if current < BASE_SCHEMA_VERSION or current > SCHEMA_VERSION:
        raise SchemaError(
            f"Unsupported manifest schema {current}; supported versions are "
            f"{BASE_SCHEMA_VERSION} through {SCHEMA_VERSION}"
        )
    if target_version < current or target_version > SCHEMA_VERSION:
        raise SchemaError(f"Cannot migrate schema {current} to unsupported target {target_version}")
    registry = _ordered_migrations(migrations)
    pending = [item for item in registry if current < item.version <= target_version]
    if not pending:
        return []

    conn.execute("BEGIN IMMEDIATE")
    try:
        for migration in pending:
            if migration.version != current + 1:
                raise SchemaError(
                    f"Migration registry gap: schema {current} cannot advance directly to {migration.version}"
                )
            migration.apply(conn)
            conn.execute(
                "INSERT INTO schema_migrations(version,name,applied_at,tool_version) VALUES(?,?,?,?)",
                (migration.version, migration.name, utc_now(), __version__),
            )
            conn.execute(
                "UPDATE schema_info SET value=? WHERE key='schema_version'",
                (str(migration.version),),
            )
            current = migration.version
        validate_manifest_connection(conn, expected_version=target_version)
        conn.commit()
    except BaseException:
        conn.rollback()
        raise
    return pending


def initialize_manifest_connection(
    conn: sqlite3.Connection,
    *,
    target_version: int = SCHEMA_VERSION,
) -> None:
    if target_version not in SUPPORTED_SCHEMA_VERSIONS:
        raise SchemaError(f"Unsupported initialization target: {target_version}")
    existing = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' LIMIT 1"
    ).fetchone()
    if existing is not None:
        raise SchemaError("Manifest initialization requires an empty database; refusing to rewrite existing schema")
    conn.executescript(SCHEMA_V2)
    conn.execute(
        "INSERT INTO schema_info(key,value) VALUES('schema_version',?) "
        "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        (str(BASE_SCHEMA_VERSION),),
    )
    conn.commit()
    if target_version > BASE_SCHEMA_VERSION:
        apply_migrations(conn, target_version=target_version)


class ManifestDB:
    def __init__(
        self,
        path: Path,
        *,
        required_schema_version: int | None = None,
        feature_name: str = "requested feature",
    ):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        initialize = not self.path.exists() or self.path.stat().st_size == 0
        self.conn = sqlite3.connect(path, timeout=60)
        try:
            self.conn.row_factory = sqlite3.Row
            self.conn.execute("PRAGMA journal_mode=WAL")
            self.conn.execute("PRAGMA synchronous=FULL")
            self.conn.execute("PRAGMA foreign_keys=ON")
            self.conn.execute("PRAGMA busy_timeout=60000")
            if initialize:
                initialize_manifest_connection(self.conn)
            self.schema_version = read_schema_version(self.conn)
            if self.schema_version not in SUPPORTED_SCHEMA_VERSIONS:
                raise SchemaError(
                    f"Unsupported manifest schema {self.schema_version}; supported versions are "
                    f"{BASE_SCHEMA_VERSION} and {SCHEMA_VERSION}"
                )
            if required_schema_version is not None:
                self.require_schema(required_schema_version, feature_name=feature_name)
        except BaseException:
            self.conn.close()
            raise

    def require_schema(self, required_version: int, *, feature_name: str = "requested feature") -> None:
        if self.schema_version < required_version:
            raise MigrationRequiredError(
                f"{feature_name} requires manifest schema {required_version}; found {self.schema_version}. "
                "Run `media-vault migrate --vault <path>` explicitly before using this feature."
            )
        if self.schema_version > required_version:
            raise SchemaError(
                f"{feature_name} supports manifest schema {required_version}; found newer schema "
                f"{self.schema_version}"
            )

    def close(self) -> None:
        # Closing must never turn an interrupted multi-step operation into a
        # committed partial result. Successful command paths commit explicitly.
        if self.conn.in_transaction:
            self.conn.rollback()
        self.conn.close()

    def execute(self, sql: str, parameters: Iterable[Any] = ()) -> sqlite3.Cursor:
        return self.conn.execute(sql, tuple(parameters))

    def executemany(self, sql: str, parameters: Iterable[Iterable[Any]]) -> sqlite3.Cursor:
        return self.conn.executemany(sql, parameters)

    def one(self, sql: str, parameters: Iterable[Any] = ()) -> sqlite3.Row | None:
        return self.execute(sql, parameters).fetchone()

    def all(self, sql: str, parameters: Iterable[Any] = ()) -> list[sqlite3.Row]:
        return self.execute(sql, parameters).fetchall()

    def commit(self) -> None:
        self.conn.commit()

    def checkpoint(self) -> None:
        self.conn.execute("PRAGMA wal_checkpoint(FULL)")

    def add_warning(
        self,
        run_id: str,
        severity: str,
        code: str,
        message: str,
        created_at: str,
        *,
        source_file_id: str | None = None,
        asset_id: str | None = None,
        evidence: dict[str, Any] | None = None,
    ) -> None:
        self.execute(
            """INSERT INTO warnings(
                   run_id,source_file_id,asset_id,severity,code,message,evidence_json,created_at
               ) VALUES(?,?,?,?,?,?,?,?)""",
            (
                run_id,
                source_file_id,
                asset_id,
                severity,
                code,
                message,
                json.dumps(evidence, ensure_ascii=False, sort_keys=True) if evidence else None,
                created_at,
            ),
        )
