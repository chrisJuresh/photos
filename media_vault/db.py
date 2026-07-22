from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Iterable, Sequence

from . import __version__
from .core import utc_now


BASE_SCHEMA_VERSION = 2
SCHEMA_VERSION = 12
SUPPORTED_SCHEMA_VERSIONS = frozenset(range(BASE_SCHEMA_VERSION, SCHEMA_VERSION + 1))


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


def _add_review_import_manifest(conn: sqlite3.Connection) -> None:
    statements = (
        """CREATE TABLE import_batches (
               batch_id TEXT PRIMARY KEY,
               inbox_root_text TEXT NOT NULL COLLATE BINARY,
               batch_root_text TEXT NOT NULL COLLATE BINARY,
               batch_name TEXT NOT NULL COLLATE BINARY,
               status TEXT NOT NULL,
               discovery_generation INTEGER NOT NULL DEFAULT 0,
               revision INTEGER NOT NULL DEFAULT 0,
               traversal_complete INTEGER NOT NULL DEFAULT 0,
               discovered_item_count INTEGER NOT NULL DEFAULT 0,
               file_count INTEGER NOT NULL DEFAULT 0,
               folder_count INTEGER NOT NULL DEFAULT 0,
               other_count INTEGER NOT NULL DEFAULT 0,
               total_bytes INTEGER NOT NULL DEFAULT 0,
               included_count INTEGER NOT NULL DEFAULT 0,
               excluded_count INTEGER NOT NULL DEFAULT 0,
               not_applicable_count INTEGER NOT NULL DEFAULT 0,
               exact_match_count INTEGER NOT NULL DEFAULT 0,
               error_count INTEGER NOT NULL DEFAULT 0,
               classification_counts_json TEXT NOT NULL DEFAULT '{}',
               match_outcome_counts_json TEXT NOT NULL DEFAULT '{}',
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL,
               review_ready_at TEXT,
               last_error_text TEXT,
               UNIQUE(inbox_root_text, batch_root_text)
           )""",
        """CREATE TABLE background_jobs (
               job_id TEXT PRIMARY KEY,
               job_kind TEXT NOT NULL,
               subject_type TEXT NOT NULL,
               subject_id TEXT NOT NULL,
               phase TEXT NOT NULL,
               status TEXT NOT NULL,
               attempt INTEGER NOT NULL DEFAULT 1,
               created_at TEXT NOT NULL,
               started_at TEXT,
               heartbeat_at TEXT,
               completed_at TEXT,
               progress_json TEXT,
               error_text TEXT
           )""",
        """CREATE INDEX idx_background_jobs_subject
               ON background_jobs(subject_type, subject_id, created_at)""",
        """CREATE TABLE import_items (
               item_id TEXT PRIMARY KEY,
               batch_id TEXT NOT NULL REFERENCES import_batches(batch_id),
               relative_path_text TEXT NOT NULL COLLATE BINARY,
               path_text TEXT NOT NULL COLLATE BINARY,
               parent_relative_path_text TEXT COLLATE BINARY,
               entry_kind TEXT NOT NULL,
               present INTEGER NOT NULL DEFAULT 1,
               first_seen_at TEXT NOT NULL,
               last_seen_at TEXT NOT NULL,
               last_seen_generation INTEGER NOT NULL,
               stat_size_bytes INTEGER,
               stat_mtime_ns INTEGER,
               stat_ctime_ns INTEGER,
               stat_device_id TEXT,
               stat_file_id TEXT,
               stat_mode INTEGER,
               stat_attributes INTEGER,
               current_observation_id TEXT,
               classification TEXT NOT NULL DEFAULT 'pending',
               media_kind TEXT,
               extension_text TEXT COLLATE BINARY,
               signature_kind TEXT,
               mime_type TEXT,
               detected_format TEXT,
               discovery_basis TEXT,
               classification_evidence_json TEXT NOT NULL DEFAULT '{}',
               unusual_extension INTEGER NOT NULL DEFAULT 0,
               warnings_json TEXT NOT NULL DEFAULT '[]',
               error_text TEXT,
               hash_status TEXT NOT NULL DEFAULT 'pending',
               hashed_size_bytes INTEGER,
               sha256 TEXT,
               blake3 TEXT,
               sha512 TEXT,
               match_outcome TEXT NOT NULL DEFAULT 'pending',
               match_method TEXT,
               matched_asset_id TEXT REFERENCES assets(asset_id),
               matched_item_id TEXT REFERENCES import_items(item_id),
               raw_jpeg_candidate_json TEXT NOT NULL DEFAULT '[]',
               associated_sidecar_of_item_id TEXT REFERENCES import_items(item_id),
               association_evidence_json TEXT NOT NULL DEFAULT '{}',
               proposed_decision TEXT NOT NULL DEFAULT 'pending',
               proposed_reason TEXT,
               effective_decision TEXT NOT NULL DEFAULT 'pending',
               decision_revision INTEGER NOT NULL DEFAULT 0,
               UNIQUE(batch_id, relative_path_text, entry_kind)
           )""",
        """CREATE INDEX idx_import_items_manifest
               ON import_items(batch_id, present, relative_path_text COLLATE BINARY, item_id)""",
        """CREATE INDEX idx_import_items_classification
               ON import_items(batch_id, present, classification, relative_path_text COLLATE BINARY, item_id)""",
        """CREATE INDEX idx_import_items_decision
               ON import_items(batch_id, present, effective_decision, relative_path_text COLLATE BINARY, item_id)""",
        """CREATE INDEX idx_import_items_hashes
               ON import_items(batch_id, hashed_size_bytes, sha256, blake3, sha512)""",
        """CREATE TABLE import_item_observations (
               observation_id TEXT PRIMARY KEY,
               item_id TEXT NOT NULL REFERENCES import_items(item_id),
               observed_generation INTEGER NOT NULL,
               observed_at TEXT NOT NULL,
               fingerprint TEXT NOT NULL,
               stat_snapshot_json TEXT NOT NULL,
               classification TEXT NOT NULL,
               classification_evidence_json TEXT NOT NULL,
               warnings_json TEXT NOT NULL,
               error_text TEXT,
               hash_status TEXT NOT NULL,
               hashes_json TEXT,
               match_outcome TEXT NOT NULL,
               match_evidence_json TEXT NOT NULL,
               relationship_evidence_json TEXT NOT NULL,
               proposed_decision TEXT NOT NULL,
               proposed_reason TEXT,
               UNIQUE(item_id, fingerprint)
           )""",
        """CREATE INDEX idx_import_item_observations_item
               ON import_item_observations(item_id, observed_at, observation_id)""",
        """CREATE TABLE import_item_decisions (
               decision_id INTEGER PRIMARY KEY AUTOINCREMENT,
               batch_id TEXT NOT NULL REFERENCES import_batches(batch_id),
               item_id TEXT NOT NULL REFERENCES import_items(item_id),
               revision INTEGER NOT NULL,
               decision TEXT NOT NULL,
               reason TEXT,
               actor TEXT NOT NULL,
               created_at TEXT NOT NULL,
               supersedes_decision_id INTEGER REFERENCES import_item_decisions(decision_id),
               UNIQUE(item_id, revision)
           )""",
        """CREATE INDEX idx_import_item_decisions_batch
               ON import_item_decisions(batch_id, item_id, revision)""",
        """CREATE TABLE import_folder_progress (
               batch_id TEXT NOT NULL REFERENCES import_batches(batch_id),
               folder_item_id TEXT NOT NULL REFERENCES import_items(item_id),
               relative_path_text TEXT NOT NULL COLLATE BINARY,
               parent_relative_path_text TEXT COLLATE BINARY,
               phase TEXT NOT NULL,
               direct_item_count INTEGER NOT NULL DEFAULT 0,
               subtree_item_count INTEGER NOT NULL DEFAULT 0,
               subtree_file_count INTEGER NOT NULL DEFAULT 0,
               subtree_folder_count INTEGER NOT NULL DEFAULT 0,
               subtree_other_count INTEGER NOT NULL DEFAULT 0,
               subtree_bytes INTEGER NOT NULL DEFAULT 0,
               included_count INTEGER NOT NULL DEFAULT 0,
               excluded_count INTEGER NOT NULL DEFAULT 0,
               not_applicable_count INTEGER NOT NULL DEFAULT 0,
               error_count INTEGER NOT NULL DEFAULT 0,
               classification_counts_json TEXT NOT NULL DEFAULT '{}',
               match_outcome_counts_json TEXT NOT NULL DEFAULT '{}',
               discovery_generation INTEGER NOT NULL,
               updated_at TEXT NOT NULL,
               warnings_json TEXT NOT NULL DEFAULT '[]',
               error_text TEXT,
               PRIMARY KEY(batch_id, relative_path_text)
           )""",
        """CREATE INDEX idx_import_folder_progress_batch
               ON import_folder_progress(batch_id, relative_path_text COLLATE BINARY)""",
    )
    for statement in statements:
        conn.execute(statement)


def _add_reviewed_copy_telemetry(conn: sqlite3.Connection) -> None:
    batch_columns = (
        "ALTER TABLE import_batches ADD COLUMN active_approval_id TEXT",
        "ALTER TABLE import_batches ADD COLUMN current_job_id TEXT",
        "ALTER TABLE import_batches ADD COLUMN approved_at TEXT",
        "ALTER TABLE import_batches ADD COLUMN execute_authorized_at TEXT",
        "ALTER TABLE import_batches ADD COLUMN copy_started_at TEXT",
        "ALTER TABLE import_batches ADD COLUMN copy_completed_at TEXT",
        "ALTER TABLE import_batches ADD COLUMN processed_count INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_batches ADD COLUMN copied_count INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_batches ADD COLUMN skipped_count INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_batches ADD COLUMN failed_count INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_batches ADD COLUMN duplicate_count INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_batches ADD COLUMN transferred_bytes INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_batches ADD COLUMN verified_bytes INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_batches ADD COLUMN latest_metrics_json TEXT NOT NULL DEFAULT '{}'",
        "ALTER TABLE import_batches ADD COLUMN last_progress_sample_at TEXT",
    )
    item_columns = (
        "ALTER TABLE import_items ADD COLUMN approved_approval_id TEXT",
        "ALTER TABLE import_items ADD COLUMN copy_status TEXT NOT NULL DEFAULT 'not_approved'",
        "ALTER TABLE import_items ADD COLUMN copy_outcome TEXT",
        "ALTER TABLE import_items ADD COLUMN copy_attempts INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_items ADD COLUMN copied_asset_id TEXT REFERENCES assets(asset_id)",
        "ALTER TABLE import_items ADD COLUMN copied_source_version_id INTEGER REFERENCES source_versions(source_version_id)",
        "ALTER TABLE import_items ADD COLUMN destination_id TEXT REFERENCES destinations(destination_id)",
        "ALTER TABLE import_items ADD COLUMN bytes_transferred INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_items ADD COLUMN bytes_verified INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_items ADD COLUMN copy_started_at TEXT",
        "ALTER TABLE import_items ADD COLUMN copy_verified_at TEXT",
        "ALTER TABLE import_items ADD COLUMN copy_completed_at TEXT",
        "ALTER TABLE import_items ADD COLUMN copy_error_code TEXT",
        "ALTER TABLE import_items ADD COLUMN copy_error_text TEXT",
    )
    folder_columns = (
        "ALTER TABLE import_folder_progress ADD COLUMN processed_count INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_folder_progress ADD COLUMN copied_count INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_folder_progress ADD COLUMN verified_count INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_folder_progress ADD COLUMN skipped_count INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_folder_progress ADD COLUMN failed_count INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_folder_progress ADD COLUMN duplicate_count INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_folder_progress ADD COLUMN transferred_bytes INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_folder_progress ADD COLUMN verified_bytes INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_folder_progress ADD COLUMN remaining_bytes INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE import_folder_progress ADD COLUMN current_item_id TEXT",
        "ALTER TABLE import_folder_progress ADD COLUMN recently_completed_json TEXT NOT NULL DEFAULT '[]'",
    )
    job_columns = (
        "ALTER TABLE background_jobs ADD COLUMN priority INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE background_jobs ADD COLUMN max_attempts INTEGER NOT NULL DEFAULT 3",
        "ALTER TABLE background_jobs ADD COLUMN claim_token TEXT",
        "ALTER TABLE background_jobs ADD COLUMN claimed_by TEXT",
        "ALTER TABLE background_jobs ADD COLUMN lease_expires_at TEXT",
        "ALTER TABLE background_jobs ADD COLUMN control_state TEXT NOT NULL DEFAULT 'run'",
        "ALTER TABLE background_jobs ADD COLUMN queued_at TEXT",
        "ALTER TABLE background_jobs ADD COLUMN updated_at TEXT",
        "ALTER TABLE background_jobs ADD COLUMN retry_not_before_at TEXT",
        "ALTER TABLE background_jobs ADD COLUMN run_id TEXT REFERENCES runs(run_id)",
    )
    for statement in (*batch_columns, *item_columns, *folder_columns, *job_columns):
        conn.execute(statement)

    statements = (
        """CREATE TABLE import_batch_approvals (
               approval_id TEXT PRIMARY KEY,
               batch_id TEXT NOT NULL REFERENCES import_batches(batch_id),
               batch_revision INTEGER NOT NULL,
               discovery_generation INTEGER NOT NULL,
               decision_fingerprint TEXT NOT NULL,
               status TEXT NOT NULL,
               summary_json TEXT NOT NULL,
               actor TEXT NOT NULL,
               approved_at TEXT NOT NULL,
               execute_authorized_at TEXT,
               execute_actor TEXT,
               consumed_at TEXT,
               invalidated_at TEXT,
               invalidation_reason TEXT
           )""",
        """CREATE INDEX idx_import_batch_approvals_batch
               ON import_batch_approvals(batch_id, approved_at, approval_id)""",
        """CREATE TABLE import_approval_items (
               approval_id TEXT NOT NULL REFERENCES import_batch_approvals(approval_id),
               item_id TEXT NOT NULL REFERENCES import_items(item_id),
               observation_id TEXT,
               decision TEXT NOT NULL,
               copy_eligible INTEGER NOT NULL,
               skip_reason TEXT,
               classification TEXT NOT NULL,
               size_bytes INTEGER,
               sha256 TEXT,
               blake3 TEXT,
               sha512 TEXT,
               PRIMARY KEY(approval_id, item_id)
           )""",
        """CREATE INDEX idx_import_approval_items_eligible
               ON import_approval_items(approval_id, copy_eligible, item_id)""",
        """CREATE TABLE background_job_attempts (
               job_id TEXT NOT NULL REFERENCES background_jobs(job_id),
               attempt INTEGER NOT NULL,
               claim_token TEXT NOT NULL,
               worker_id TEXT NOT NULL,
               status TEXT NOT NULL,
               started_at TEXT NOT NULL,
               heartbeat_at TEXT NOT NULL,
               completed_at TEXT,
               error_text TEXT,
               retryable INTEGER,
               PRIMARY KEY(job_id, attempt)
           )""",
        """CREATE INDEX idx_background_jobs_claim
               ON background_jobs(status, priority DESC, created_at, job_id)""",
        """CREATE TABLE import_item_copy_attempts (
               job_id TEXT NOT NULL REFERENCES background_jobs(job_id),
               item_id TEXT NOT NULL REFERENCES import_items(item_id),
               attempt INTEGER NOT NULL,
               status TEXT NOT NULL,
               started_at TEXT NOT NULL,
               completed_at TEXT,
               source_snapshot_json TEXT NOT NULL,
               temp_path_text TEXT,
               destination_path_text TEXT,
               bytes_transferred INTEGER NOT NULL DEFAULT 0,
               bytes_verified INTEGER NOT NULL DEFAULT 0,
               error_code TEXT,
               error_text TEXT,
               PRIMARY KEY(job_id, item_id, attempt)
           )""",
        """CREATE TABLE import_progress_samples (
               sample_id INTEGER PRIMARY KEY AUTOINCREMENT,
               batch_id TEXT NOT NULL REFERENCES import_batches(batch_id),
               job_id TEXT REFERENCES background_jobs(job_id),
               recorded_at TEXT NOT NULL,
               phase TEXT NOT NULL,
               status TEXT NOT NULL,
               discovered_count INTEGER NOT NULL,
               processed_count INTEGER NOT NULL,
               skipped_count INTEGER NOT NULL,
               failed_count INTEGER NOT NULL,
               duplicate_count INTEGER NOT NULL,
               paired_count INTEGER NOT NULL,
               remaining_count INTEGER NOT NULL,
               scanned_bytes INTEGER NOT NULL,
               transferred_bytes INTEGER NOT NULL,
               verified_bytes INTEGER NOT NULL,
               remaining_bytes INTEGER NOT NULL,
               current_throughput_bps REAL,
               ewma_throughput_bps REAL,
               eta_seconds REAL,
               eta_confidence TEXT NOT NULL,
               observed_read_bps REAL,
               observed_write_bps REAL,
               queue_depth INTEGER NOT NULL,
               busy_workers INTEGER NOT NULL,
               total_workers INTEGER NOT NULL,
               current_item_id TEXT,
               current_path_text TEXT,
               current_folder_text TEXT,
               source_free_bytes INTEGER,
               destination_free_bytes INTEGER,
               storage_consumed_bytes INTEGER NOT NULL,
               projected_final_bytes INTEGER NOT NULL,
               metrics_json TEXT NOT NULL
           )""",
        """CREATE INDEX idx_import_progress_samples_batch
               ON import_progress_samples(batch_id, sample_id)""",
        """CREATE TABLE import_events (
               event_id INTEGER PRIMARY KEY AUTOINCREMENT,
               batch_id TEXT NOT NULL REFERENCES import_batches(batch_id),
               job_id TEXT REFERENCES background_jobs(job_id),
               item_id TEXT REFERENCES import_items(item_id),
               folder_relative_path_text TEXT,
               occurred_at TEXT NOT NULL,
               level TEXT NOT NULL,
               event_type TEXT NOT NULL,
               phase TEXT NOT NULL,
               message TEXT NOT NULL,
               evidence_json TEXT NOT NULL
           )""",
        """CREATE INDEX idx_import_events_batch
               ON import_events(batch_id, event_id)""",
        """CREATE TABLE import_errors (
               error_id INTEGER PRIMARY KEY AUTOINCREMENT,
               batch_id TEXT NOT NULL REFERENCES import_batches(batch_id),
               job_id TEXT REFERENCES background_jobs(job_id),
               item_id TEXT REFERENCES import_items(item_id),
               folder_relative_path_text TEXT,
               occurred_at TEXT NOT NULL,
               phase TEXT NOT NULL,
               code TEXT NOT NULL,
               cause_text TEXT NOT NULL,
               context_json TEXT NOT NULL,
               retryable INTEGER NOT NULL,
               suggested_resolution TEXT NOT NULL,
               resolved_at TEXT,
               resolution_json TEXT
           )""",
        """CREATE INDEX idx_import_errors_batch
               ON import_errors(batch_id, resolved_at, error_id)""",
        """CREATE TABLE legacy_import_history (
               legacy_history_id TEXT PRIMARY KEY,
               run_id TEXT NOT NULL UNIQUE REFERENCES runs(run_id),
               status TEXT NOT NULL,
               started_at TEXT NOT NULL,
               completed_at TEXT,
               source_root_text TEXT,
               summary_json TEXT NOT NULL,
               metrics_json TEXT NOT NULL,
               unavailable_metrics_json TEXT NOT NULL,
               evidence_sources_json TEXT NOT NULL,
               legacy_reason TEXT NOT NULL,
               backfilled_at TEXT NOT NULL
           )""",
        """CREATE INDEX idx_import_items_copy_status
               ON import_items(batch_id, copy_status, relative_path_text COLLATE BINARY, item_id)""",
    )
    for statement in statements:
        conn.execute(statement)


def _add_preprocessing_pipeline(conn: sqlite3.Connection) -> None:
    statements = (
        """CREATE TABLE derivatives (
               derivative_id TEXT PRIMARY KEY,
               subject_type TEXT NOT NULL,
               subject_id TEXT NOT NULL,
               asset_id TEXT REFERENCES assets(asset_id),
               import_item_id TEXT REFERENCES import_items(item_id),
               source_asset_id TEXT REFERENCES assets(asset_id),
               source_observation_id TEXT REFERENCES import_item_observations(observation_id),
               derivative_kind TEXT NOT NULL,
               representation_kind TEXT NOT NULL,
               long_edge INTEGER NOT NULL,
               analyzer_version TEXT NOT NULL,
               input_identity TEXT NOT NULL,
               status TEXT NOT NULL,
               is_current INTEGER NOT NULL DEFAULT 1,
               width INTEGER,
               height INTEGER,
               source_width INTEGER,
               source_height INTEGER,
               mime_type TEXT,
               checksum_sha256 TEXT,
               byte_size INTEGER,
               file_mtime_ns INTEGER,
               relative_path_text TEXT COLLATE BINARY,
               error_code TEXT,
               error_text TEXT,
               created_at TEXT NOT NULL,
               started_at TEXT,
               completed_at TEXT,
               updated_at TEXT NOT NULL,
               UNIQUE(subject_type, subject_id, derivative_kind, long_edge, analyzer_version, input_identity),
               CHECK((subject_type='asset' AND asset_id IS NOT NULL AND import_item_id IS NULL) OR
                     (subject_type='import_item' AND import_item_id IS NOT NULL AND asset_id IS NULL))
           )""",
        """CREATE INDEX idx_derivatives_ready_subject
               ON derivatives(subject_type, subject_id, is_current, status, long_edge, derivative_id)""",
        """CREATE INDEX idx_derivatives_asset_version
               ON derivatives(asset_id, analyzer_version, input_identity, status)""",
        """CREATE INDEX idx_derivatives_import_item_version
               ON derivatives(import_item_id, analyzer_version, input_identity, status)""",
        """CREATE TABLE asset_extended_metadata (
               metadata_id TEXT PRIMARY KEY,
               asset_id TEXT NOT NULL REFERENCES assets(asset_id),
               analyzer_version TEXT NOT NULL,
               input_identity TEXT NOT NULL,
               status TEXT NOT NULL,
               is_current INTEGER NOT NULL DEFAULT 1,
               display_source_asset_id TEXT REFERENCES assets(asset_id),
               capture_time_text TEXT,
               capture_time_source TEXT,
               capture_time_ambiguous INTEGER NOT NULL DEFAULT 0,
               gps_latitude REAL,
               gps_longitude REAL,
               gps_precision_meters REAL,
               camera_make TEXT,
               camera_model TEXT,
               camera_serial TEXT,
               lens_model TEXT,
               iso_value REAL,
               aperture_f_number REAL,
               exposure_time_seconds REAL,
               focal_length_mm REAL,
               exposure_compensation_ev REAL,
               width INTEGER,
               height INTEGER,
               orientation_text TEXT,
               duration_seconds REAL,
               video_codec TEXT,
               audio_codec TEXT,
               software_text TEXT,
               edit_history_json TEXT NOT NULL DEFAULT '[]',
               edit_likelihood REAL,
               import_time_text TEXT,
               source_folder_evidence_json TEXT NOT NULL DEFAULT '[]',
               raw_metadata_json TEXT NOT NULL DEFAULT '{}',
               warnings_json TEXT NOT NULL DEFAULT '[]',
               error_code TEXT,
               error_text TEXT,
               created_at TEXT NOT NULL,
               started_at TEXT,
               completed_at TEXT,
               updated_at TEXT NOT NULL,
               UNIQUE(asset_id, analyzer_version, input_identity)
           )""",
        """CREATE INDEX idx_asset_extended_metadata_current
               ON asset_extended_metadata(asset_id, is_current, status, analyzer_version)""",
        """CREATE TABLE asset_features (
               feature_id TEXT PRIMARY KEY,
               asset_id TEXT NOT NULL REFERENCES assets(asset_id),
               analyzer_version TEXT NOT NULL,
               input_identity TEXT NOT NULL,
               status TEXT NOT NULL,
               is_current INTEGER NOT NULL DEFAULT 1,
               display_source_asset_id TEXT REFERENCES assets(asset_id),
               width INTEGER,
               height INTEGER,
               luminance_histogram_json TEXT,
               luminance_entropy REAL,
               sharpness_score REAL,
               focus_deficit_score REAL,
               directional_shake_score REAL,
               motion_score REAL,
               underexposure_score REAL,
               overexposure_score REAL,
               highlight_clipping_score REAL,
               near_black_score REAL,
               blankness_score REAL,
               obstruction_score REAL,
               low_information_score REAL,
               blockiness_score REAL,
               corruption_score REAL,
               incomplete_decode INTEGER NOT NULL DEFAULT 0,
               resolution_class TEXT,
               thumbnail_likelihood REAL,
               edit_likelihood REAL,
               composite_quality_score REAL,
               cover_ranking_inputs_json TEXT NOT NULL DEFAULT '{}',
               evidence_json TEXT NOT NULL DEFAULT '{}',
               error_code TEXT,
               error_text TEXT,
               created_at TEXT NOT NULL,
               started_at TEXT,
               completed_at TEXT,
               updated_at TEXT NOT NULL,
               UNIQUE(asset_id, analyzer_version, input_identity)
           )""",
        """CREATE INDEX idx_asset_features_current
               ON asset_features(asset_id, is_current, status, analyzer_version)""",
        """CREATE INDEX idx_background_jobs_kind_claim
               ON background_jobs(job_kind, status, priority DESC, created_at, job_id)""",
    )
    for statement in statements:
        conn.execute(statement)


def _add_review_application_foundation(conn: sqlite3.Connection) -> None:
    statements = (
        """CREATE TABLE review_application_state (
               state_id INTEGER PRIMARY KEY CHECK(state_id=1),
               generation INTEGER NOT NULL DEFAULT 0 CHECK(generation>=0),
               updated_at TEXT NOT NULL
           )""",
        """INSERT INTO review_application_state(state_id,generation,updated_at)
               VALUES(1,0,?)""",
        """CREATE TABLE user_preferences (
               preference_key TEXT PRIMARY KEY COLLATE BINARY,
               value_json TEXT NOT NULL,
               revision INTEGER NOT NULL CHECK(revision>=1),
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL
           )""",
        """CREATE INDEX idx_user_preferences_updated
               ON user_preferences(updated_at,preference_key)""",
        """CREATE TABLE saved_views (
               saved_view_id TEXT PRIMARY KEY,
               name TEXT NOT NULL COLLATE BINARY,
               route TEXT NOT NULL COLLATE BINARY,
               state_json TEXT NOT NULL,
               revision INTEGER NOT NULL CHECK(revision>=1),
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL,
               deleted_at TEXT
           )""",
        """CREATE INDEX idx_saved_views_active_page
               ON saved_views(deleted_at,updated_at DESC,saved_view_id DESC)""",
        """CREATE TABLE api_idempotency_records (
               scope TEXT NOT NULL COLLATE BINARY,
               idempotency_key TEXT NOT NULL COLLATE BINARY,
               request_sha256 TEXT NOT NULL,
               response_status INTEGER NOT NULL,
               response_json TEXT NOT NULL,
               created_at TEXT NOT NULL,
               PRIMARY KEY(scope,idempotency_key)
           )""",
        """CREATE INDEX idx_api_idempotency_created
               ON api_idempotency_records(created_at,scope,idempotency_key)""",
    )
    for statement in statements:
        if "VALUES(1,0,?)" in statement:
            conn.execute(statement, (utc_now(),))
        else:
            conn.execute(statement)


def _add_import_interface_materializations(conn: sqlite3.Connection) -> None:
    statements = (
        """CREATE TABLE import_manifest_views (
               view_id TEXT PRIMARY KEY,
               batch_id TEXT NOT NULL REFERENCES import_batches(batch_id),
               batch_revision INTEGER NOT NULL,
               query_sha256 TEXT NOT NULL,
               query_json TEXT NOT NULL,
               analyzer_version TEXT NOT NULL,
               status TEXT NOT NULL,
               job_id TEXT NOT NULL REFERENCES background_jobs(job_id),
               item_count INTEGER NOT NULL DEFAULT 0,
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL,
               completed_at TEXT,
               error_text TEXT,
               UNIQUE(batch_id,batch_revision,query_sha256,analyzer_version)
           )""",
        """CREATE INDEX idx_import_manifest_views_lookup
               ON import_manifest_views(batch_id,batch_revision,query_sha256,analyzer_version,status)""",
        """CREATE TABLE import_manifest_view_items (
               view_id TEXT NOT NULL REFERENCES import_manifest_views(view_id),
               ordinal INTEGER NOT NULL,
               item_id TEXT NOT NULL REFERENCES import_items(item_id),
               sort_key_json TEXT NOT NULL,
               PRIMARY KEY(view_id,ordinal),
               UNIQUE(view_id,item_id)
           )""",
        """CREATE INDEX idx_import_manifest_view_items_item
               ON import_manifest_view_items(view_id,item_id)""",
        """CREATE INDEX idx_import_batches_history_page
               ON import_batches(updated_at DESC,batch_id DESC)""",
        """CREATE INDEX idx_import_events_filtered_page
               ON import_events(batch_id,level,event_type,event_id DESC)""",
        """CREATE INDEX idx_import_errors_page
               ON import_errors(batch_id,resolved_at,error_id DESC)""",
    )
    for statement in statements:
        conn.execute(statement)


def _add_library_browser(conn: sqlite3.Connection) -> None:
    statements = (
        """CREATE TABLE photo_entities (
               entity_id TEXT PRIMARY KEY,
               anchor_asset_id TEXT NOT NULL UNIQUE REFERENCES assets(asset_id),
               display_asset_id TEXT NOT NULL REFERENCES assets(asset_id),
               entity_kind TEXT NOT NULL,
               media_kind TEXT NOT NULL,
               format_text TEXT NOT NULL DEFAULT '' COLLATE BINARY,
               filename_text TEXT NOT NULL DEFAULT '' COLLATE BINARY,
               primary_path_text TEXT COLLATE BINARY,
               folder_text TEXT NOT NULL DEFAULT '' COLLATE BINARY,
               capture_time_text TEXT,
               capture_time_source TEXT,
               capture_time_ambiguous INTEGER NOT NULL DEFAULT 0,
               capture_sort_text TEXT NOT NULL DEFAULT '' COLLATE BINARY,
               import_time_text TEXT,
               import_sort_text TEXT NOT NULL DEFAULT '' COLLATE BINARY,
               camera_make TEXT,
               camera_model TEXT,
               lens_model TEXT,
               iso_value REAL,
               aperture_f_number REAL,
               exposure_time_seconds REAL,
               focal_length_mm REAL,
               exposure_compensation_ev REAL,
               gps_latitude REAL,
               gps_longitude REAL,
               width INTEGER,
               height INTEGER,
               size_bytes INTEGER NOT NULL,
               quality_score REAL,
               quality_sort REAL NOT NULL DEFAULT -1,
               exposure_score REAL,
               exposure_sort REAL NOT NULL DEFAULT -1,
               similarity_key TEXT NOT NULL DEFAULT '' COLLATE BINARY,
               random_key TEXT NOT NULL COLLATE BINARY,
               member_count INTEGER NOT NULL DEFAULT 1,
               raw_member_count INTEGER NOT NULL DEFAULT 0,
               source_occurrence_count INTEGER NOT NULL DEFAULT 0,
               exact_duplicate_count INTEGER NOT NULL DEFAULT 0,
               near_duplicate_count INTEGER NOT NULL DEFAULT 0,
               has_raw_companion INTEGER NOT NULL DEFAULT 0,
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               is_current INTEGER NOT NULL DEFAULT 1,
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL
           )""",
        """CREATE INDEX idx_photo_entities_capture
               ON photo_entities(is_current,capture_sort_text DESC,entity_id DESC)""",
        """CREATE INDEX idx_photo_entities_import
               ON photo_entities(is_current,import_sort_text DESC,entity_id DESC)""",
        """CREATE INDEX idx_photo_entities_filename
               ON photo_entities(is_current,filename_text,entity_id)""",
        """CREATE INDEX idx_photo_entities_quality
               ON photo_entities(is_current,quality_sort DESC,entity_id DESC)""",
        """CREATE INDEX idx_photo_entities_dimensions
               ON photo_entities(is_current,COALESCE(width,-1) DESC,entity_id DESC)""",
        """CREATE INDEX idx_photo_entities_height
               ON photo_entities(is_current,COALESCE(height,-1) DESC,entity_id DESC)""",
        """CREATE INDEX idx_photo_entities_size
               ON photo_entities(is_current,size_bytes DESC,entity_id DESC)""",
        """CREATE INDEX idx_photo_entities_camera
               ON photo_entities(is_current,COALESCE(camera_model,'') COLLATE BINARY,entity_id)""",
        """CREATE INDEX idx_photo_entities_lens
               ON photo_entities(is_current,COALESCE(lens_model,'') COLLATE BINARY,entity_id)""",
        """CREATE INDEX idx_photo_entities_exposure
               ON photo_entities(is_current,exposure_sort,entity_id)""",
        """CREATE INDEX idx_photo_entities_similarity
               ON photo_entities(is_current,similarity_key,entity_id)""",
        """CREATE INDEX idx_photo_entities_random
               ON photo_entities(is_current,random_key,entity_id)""",
        """CREATE INDEX idx_photo_entities_media_capture
               ON photo_entities(is_current,media_kind,capture_sort_text DESC,entity_id DESC)""",
        """CREATE INDEX idx_photo_entities_format_capture
               ON photo_entities(is_current,format_text,capture_sort_text DESC,entity_id DESC)""",
        """CREATE INDEX idx_photo_entities_folder_capture
               ON photo_entities(is_current,folder_text,capture_sort_text DESC,entity_id DESC)""",
        """CREATE TABLE photo_entity_members (
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               asset_id TEXT NOT NULL REFERENCES assets(asset_id),
               role TEXT NOT NULL,
               is_display INTEGER NOT NULL DEFAULT 0,
               confidence_label TEXT,
               confidence_score REAL,
               evidence_json TEXT NOT NULL DEFAULT '{}',
               PRIMARY KEY(entity_id,asset_id)
           )""",
        """CREATE INDEX idx_photo_entity_members_asset
               ON photo_entity_members(asset_id,entity_id)""",
        """CREATE TABLE photo_user_state (
               entity_id TEXT PRIMARY KEY REFERENCES photo_entities(entity_id),
               favourite INTEGER NOT NULL DEFAULT 0,
               rejected INTEGER NOT NULL DEFAULT 0,
               rating INTEGER NOT NULL DEFAULT 0 CHECK(rating BETWEEN 0 AND 5),
               revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>=1),
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL
           )""",
        """CREATE INDEX idx_photo_user_state_favourite
               ON photo_user_state(rejected,favourite DESC,entity_id DESC)""",
        """CREATE INDEX idx_photo_user_state_rating
               ON photo_user_state(rejected,rating DESC,entity_id DESC)""",
        """CREATE INDEX idx_photo_user_state_rejected
               ON photo_user_state(rejected DESC,entity_id DESC)""",
        """CREATE TABLE photo_user_state_events (
               event_id INTEGER PRIMARY KEY AUTOINCREMENT,
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               action TEXT NOT NULL,
               before_json TEXT NOT NULL,
               after_json TEXT NOT NULL,
               idempotency_key TEXT NOT NULL COLLATE BINARY,
               undo_of_event_id INTEGER REFERENCES photo_user_state_events(event_id),
               created_at TEXT NOT NULL
           )""",
        """CREATE INDEX idx_photo_user_state_events_entity
               ON photo_user_state_events(entity_id,event_id DESC)""",
        """CREATE TABLE materialized_views (
               view_id TEXT PRIMARY KEY,
               view_kind TEXT NOT NULL,
               query_sha256 TEXT NOT NULL,
               query_json TEXT NOT NULL,
               source_generation INTEGER NOT NULL CHECK(source_generation>=1),
               state_generation INTEGER NOT NULL DEFAULT 0 CHECK(state_generation>=0),
               analyzer_version TEXT NOT NULL,
               status TEXT NOT NULL,
               is_current INTEGER NOT NULL DEFAULT 1,
               job_id TEXT NOT NULL REFERENCES background_jobs(job_id),
               item_count INTEGER NOT NULL DEFAULT 0,
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL,
               completed_at TEXT,
               error_text TEXT,
               UNIQUE(view_kind,query_sha256,source_generation,state_generation,analyzer_version)
           )""",
        """CREATE INDEX idx_materialized_views_ready
               ON materialized_views(view_kind,is_current,status,source_generation DESC,view_id)""",
        """CREATE TABLE materialized_view_items (
               view_id TEXT NOT NULL REFERENCES materialized_views(view_id),
               ordinal INTEGER NOT NULL,
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               sort_key_json TEXT NOT NULL,
               PRIMARY KEY(view_id,ordinal),
               UNIQUE(view_id,entity_id)
           )""",
        """CREATE INDEX idx_materialized_view_items_entity
               ON materialized_view_items(view_id,entity_id)""",
        """CREATE TABLE facet_rollups (
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               facet_name TEXT NOT NULL COLLATE BINARY,
               value_key TEXT NOT NULL COLLATE BINARY,
               display_value TEXT NOT NULL,
               entity_count INTEGER NOT NULL CHECK(entity_count>=0),
               sort_order INTEGER NOT NULL DEFAULT 0,
               created_at TEXT NOT NULL,
               PRIMARY KEY(catalog_generation,facet_name,value_key)
           )""",
        """CREATE INDEX idx_facet_rollups_page
               ON facet_rollups(catalog_generation,facet_name,entity_count DESC,value_key)""",
    )
    for statement in statements:
        conn.execute(statement)


def _add_alternate_organization_views(conn: sqlite3.Connection) -> None:
    statements = (
        """CREATE TABLE calendar_buckets (
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               bucket_key TEXT NOT NULL COLLATE BINARY,
               bucket_kind TEXT NOT NULL,
               capture_date TEXT COLLATE BINARY,
               year INTEGER,
               month INTEGER,
               day INTEGER,
               display_value TEXT NOT NULL,
               entity_count INTEGER NOT NULL CHECK(entity_count>=0),
               sort_order INTEGER NOT NULL,
               created_at TEXT NOT NULL,
               PRIMARY KEY(catalog_generation,bucket_key)
           )""",
        """CREATE INDEX idx_calendar_buckets_page
               ON calendar_buckets(catalog_generation,sort_order,bucket_key)""",
        """CREATE INDEX idx_calendar_buckets_month
               ON calendar_buckets(catalog_generation,year,month,sort_order,bucket_key)""",
        """CREATE TABLE calendar_bucket_items (
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               bucket_key TEXT NOT NULL COLLATE BINARY,
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               PRIMARY KEY(catalog_generation,bucket_key,entity_id),
               FOREIGN KEY(catalog_generation,bucket_key)
                   REFERENCES calendar_buckets(catalog_generation,bucket_key)
           )""",
        """CREATE INDEX idx_calendar_bucket_items_entity
               ON calendar_bucket_items(catalog_generation,entity_id,bucket_key)""",
        """CREATE TABLE folder_hierarchy_nodes (
               node_id TEXT PRIMARY KEY,
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               source_root_id TEXT NOT NULL REFERENCES source_roots(source_root_id),
               parent_node_id TEXT REFERENCES folder_hierarchy_nodes(node_id),
               relative_path_text TEXT NOT NULL COLLATE BINARY,
               display_value TEXT NOT NULL,
               depth INTEGER NOT NULL CHECK(depth>=0),
               direct_entity_count INTEGER NOT NULL CHECK(direct_entity_count>=0),
               logical_entity_count INTEGER NOT NULL CHECK(logical_entity_count>=0),
               direct_source_occurrence_count INTEGER NOT NULL CHECK(direct_source_occurrence_count>=0),
               source_occurrence_count INTEGER NOT NULL CHECK(source_occurrence_count>=0),
               created_at TEXT NOT NULL,
               UNIQUE(catalog_generation,source_root_id,relative_path_text)
           )""",
        """CREATE INDEX idx_folder_hierarchy_children
               ON folder_hierarchy_nodes(catalog_generation,parent_node_id,display_value,node_id)""",
        """CREATE TABLE folder_hierarchy_items (
               node_id TEXT NOT NULL REFERENCES folder_hierarchy_nodes(node_id),
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               source_occurrence_count INTEGER NOT NULL CHECK(source_occurrence_count>=1),
               PRIMARY KEY(node_id,entity_id)
           )""",
        """CREATE INDEX idx_folder_hierarchy_items_entity
               ON folder_hierarchy_items(entity_id,node_id)""",
        """CREATE TABLE equipment_rollups (
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               equipment_kind TEXT NOT NULL,
               value_key TEXT NOT NULL COLLATE BINARY,
               display_value TEXT NOT NULL,
               raw_values_json TEXT NOT NULL,
               entity_count INTEGER NOT NULL CHECK(entity_count>=0),
               created_at TEXT NOT NULL,
               PRIMARY KEY(catalog_generation,equipment_kind,value_key)
           )""",
        """CREATE INDEX idx_equipment_rollups_page
               ON equipment_rollups(catalog_generation,equipment_kind,entity_count DESC,value_key)""",
        """CREATE TABLE equipment_rollup_items (
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               equipment_kind TEXT NOT NULL,
               value_key TEXT NOT NULL COLLATE BINARY,
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               PRIMARY KEY(catalog_generation,equipment_kind,value_key,entity_id),
               FOREIGN KEY(catalog_generation,equipment_kind,value_key)
                   REFERENCES equipment_rollups(catalog_generation,equipment_kind,value_key)
           )""",
        """CREATE INDEX idx_equipment_rollup_items_entity
               ON equipment_rollup_items(catalog_generation,entity_id,equipment_kind,value_key)""",
        """CREATE TABLE map_entity_locations (
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               latitude REAL NOT NULL CHECK(latitude BETWEEN -90 AND 90),
               longitude REAL NOT NULL CHECK(longitude BETWEEN -180 AND 180),
               geohash_text TEXT NOT NULL COLLATE BINARY,
               PRIMARY KEY(catalog_generation,entity_id)
           )""",
        """CREATE INDEX idx_map_entity_locations_geohash
               ON map_entity_locations(catalog_generation,geohash_text,entity_id)""",
        """CREATE TABLE map_unknown_location_items (
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               PRIMARY KEY(catalog_generation,entity_id)
           )""",
        """CREATE INDEX idx_map_unknown_location_items_entity
               ON map_unknown_location_items(entity_id,catalog_generation)""",
        """CREATE TABLE map_clusters (
               cluster_id TEXT PRIMARY KEY,
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               zoom_level INTEGER NOT NULL CHECK(zoom_level BETWEEN 0 AND 18),
               geohash_prefix TEXT NOT NULL COLLATE BINARY,
               center_latitude REAL NOT NULL,
               center_longitude REAL NOT NULL,
               min_latitude REAL NOT NULL,
               max_latitude REAL NOT NULL,
               min_longitude REAL NOT NULL,
               max_longitude REAL NOT NULL,
               entity_count INTEGER NOT NULL CHECK(entity_count>=1),
               created_at TEXT NOT NULL,
               UNIQUE(catalog_generation,zoom_level,geohash_prefix)
           )""",
        """CREATE INDEX idx_map_clusters_viewport
               ON map_clusters(catalog_generation,zoom_level,center_latitude,center_longitude,cluster_id)""",
        """CREATE TABLE map_cluster_items (
               cluster_id TEXT NOT NULL REFERENCES map_clusters(cluster_id),
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               PRIMARY KEY(cluster_id,entity_id)
           )""",
        """CREATE INDEX idx_map_cluster_items_entity
               ON map_cluster_items(entity_id,cluster_id)""",
    )
    for statement in statements:
        conn.execute(statement)


def _add_similarity_stacks(conn: sqlite3.Connection) -> None:
    statements = (
        """CREATE TABLE stack_feature_inputs (
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               display_asset_id TEXT NOT NULL REFERENCES assets(asset_id),
               analyzer_version TEXT NOT NULL,
               input_identity TEXT NOT NULL,
               status TEXT NOT NULL,
               phash_hex TEXT,
               dhash_hex TEXT,
               phash_bucket TEXT COLLATE BINARY,
               dhash_bucket TEXT COLLATE BINARY,
               color_histogram_json TEXT,
               aspect_ratio REAL,
               capture_epoch_seconds REAL,
               capture_bucket INTEGER,
               camera_key TEXT NOT NULL DEFAULT '' COLLATE BINARY,
               filename_key TEXT NOT NULL DEFAULT '' COLLATE BINARY,
               raw_jpeg_confidence REAL,
               relationship_count INTEGER NOT NULL DEFAULT 0 CHECK(relationship_count>=0),
               edit_likelihood REAL,
               sharpness_score REAL,
               motion_score REAL,
               underexposure_score REAL,
               overexposure_score REAL,
               highlight_clipping_score REAL,
               corruption_score REAL,
               resolution_pixels INTEGER,
               evidence_json TEXT NOT NULL DEFAULT '{}',
               error_text TEXT,
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL,
               completed_at TEXT,
               PRIMARY KEY(catalog_generation,entity_id,analyzer_version)
           )""",
        """CREATE INDEX idx_stack_inputs_phash_bucket
               ON stack_feature_inputs(catalog_generation,analyzer_version,status,phash_bucket,entity_id)""",
        """CREATE INDEX idx_stack_inputs_dhash_bucket
               ON stack_feature_inputs(catalog_generation,analyzer_version,status,dhash_bucket,entity_id)""",
        """CREATE INDEX idx_stack_inputs_capture
               ON stack_feature_inputs(catalog_generation,analyzer_version,capture_epoch_seconds,entity_id)""",
        """CREATE INDEX idx_stack_inputs_filename
               ON stack_feature_inputs(catalog_generation,analyzer_version,filename_key,entity_id)""",
        """CREATE TABLE stack_candidate_edges (
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               analyzer_version TEXT NOT NULL,
               left_entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               right_entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               phash_distance INTEGER,
               dhash_distance INTEGER,
               color_distance REAL,
               aspect_delta REAL,
               time_delta_seconds REAL,
               equipment_match REAL NOT NULL DEFAULT 0,
               filename_score REAL NOT NULL DEFAULT 0,
               raw_pairing_score REAL NOT NULL DEFAULT 0,
               relationship_score REAL NOT NULL DEFAULT 0,
               evidence_json TEXT NOT NULL,
               created_at TEXT NOT NULL,
               PRIMARY KEY(catalog_generation,analyzer_version,left_entity_id,right_entity_id),
               CHECK(left_entity_id < right_entity_id)
           )""",
        """CREATE INDEX idx_stack_candidate_edges_left
               ON stack_candidate_edges(catalog_generation,analyzer_version,left_entity_id,right_entity_id)""",
        """CREATE INDEX idx_stack_candidate_edges_right
               ON stack_candidate_edges(catalog_generation,analyzer_version,right_entity_id,left_entity_id)""",
        """CREATE TABLE stack_profiles (
               profile_id TEXT PRIMARY KEY,
               name TEXT NOT NULL,
               settings_sha256 TEXT NOT NULL,
               settings_json TEXT NOT NULL,
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               analyzer_version TEXT NOT NULL,
               feature_analyzer_version TEXT NOT NULL,
               status TEXT NOT NULL,
               is_default INTEGER NOT NULL DEFAULT 0,
               is_current INTEGER NOT NULL DEFAULT 1,
               replaces_profile_id TEXT REFERENCES stack_profiles(profile_id),
               job_id TEXT NOT NULL REFERENCES background_jobs(job_id),
               stack_count INTEGER NOT NULL DEFAULT 0 CHECK(stack_count>=0),
               member_count INTEGER NOT NULL DEFAULT 0 CHECK(member_count>=0),
               candidate_edge_count INTEGER NOT NULL DEFAULT 0 CHECK(candidate_edge_count>=0),
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL,
               completed_at TEXT,
               error_text TEXT,
               UNIQUE(settings_sha256,catalog_generation,analyzer_version,feature_analyzer_version)
           )""",
        """CREATE INDEX idx_stack_profiles_page
               ON stack_profiles(is_current,status,is_default DESC,updated_at DESC,profile_id DESC)""",
        """CREATE INDEX idx_stack_profiles_ready
               ON stack_profiles(catalog_generation,is_current,status,completed_at DESC,profile_id)""",
        """CREATE TABLE stacks (
               profile_id TEXT NOT NULL REFERENCES stack_profiles(profile_id),
               stack_id TEXT NOT NULL,
               ordinal INTEGER NOT NULL CHECK(ordinal>=0),
               ranked_cover_entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               cover_entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               cover_override_entity_id TEXT REFERENCES photo_entities(entity_id),
               member_count INTEGER NOT NULL CHECK(member_count>=1),
               cover_explanation TEXT NOT NULL,
               cover_method_version TEXT NOT NULL,
               cover_evidence_json TEXT NOT NULL,
               revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>=1),
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL,
               PRIMARY KEY(profile_id,stack_id),
               UNIQUE(profile_id,ordinal)
           )""",
        """CREATE INDEX idx_stacks_page
               ON stacks(profile_id,ordinal,stack_id)""",
        """CREATE INDEX idx_stacks_cover
               ON stacks(profile_id,cover_entity_id,stack_id)""",
        """CREATE TABLE stack_members (
               profile_id TEXT NOT NULL,
               stack_id TEXT NOT NULL,
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               ordinal INTEGER NOT NULL CHECK(ordinal>=0),
               rank_score REAL NOT NULL,
               rank_evidence_json TEXT NOT NULL,
               is_cover INTEGER NOT NULL DEFAULT 0,
               is_override INTEGER NOT NULL DEFAULT 0,
               PRIMARY KEY(profile_id,stack_id,entity_id),
               UNIQUE(profile_id,entity_id),
               FOREIGN KEY(profile_id,stack_id) REFERENCES stacks(profile_id,stack_id)
           )""",
        """CREATE INDEX idx_stack_members_page
               ON stack_members(profile_id,stack_id,ordinal,entity_id)""",
        """CREATE INDEX idx_stack_members_entity
               ON stack_members(entity_id,profile_id,stack_id)""",
        """CREATE TABLE stack_cover_events (
               event_id INTEGER PRIMARY KEY AUTOINCREMENT,
               profile_id TEXT NOT NULL,
               stack_id TEXT NOT NULL,
               before_cover_entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               after_cover_entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               idempotency_key TEXT NOT NULL COLLATE BINARY,
               created_at TEXT NOT NULL,
               FOREIGN KEY(profile_id,stack_id) REFERENCES stacks(profile_id,stack_id)
           )""",
        """CREATE INDEX idx_stack_cover_events_stack
               ON stack_cover_events(profile_id,stack_id,event_id DESC)""",
    )
    for statement in statements:
        conn.execute(statement)


def _add_explainable_junk_review(conn: sqlite3.Connection) -> None:
    statements = (
        """CREATE TABLE junk_signals (
               signal_id TEXT PRIMARY KEY,
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               reason TEXT NOT NULL COLLATE BINARY,
               confidence REAL NOT NULL CHECK(confidence BETWEEN 0 AND 1),
               threshold REAL NOT NULL CHECK(threshold BETWEEN 0 AND 1),
               method_version TEXT NOT NULL,
               input_identity TEXT NOT NULL,
               status TEXT NOT NULL,
               is_current INTEGER NOT NULL DEFAULT 1,
               evidence_json TEXT NOT NULL,
               better_alternative_entity_id TEXT REFERENCES photo_entities(entity_id),
               error_text TEXT,
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL,
               UNIQUE(catalog_generation,entity_id,reason,method_version,input_identity)
           )""",
        """CREATE INDEX idx_junk_signals_entity
               ON junk_signals(catalog_generation,is_current,entity_id,reason)""",
        """CREATE INDEX idx_junk_signals_reason_confidence
               ON junk_signals(catalog_generation,is_current,reason,confidence DESC,entity_id)""",
        """CREATE TABLE junk_profiles (
               profile_id TEXT PRIMARY KEY,
               name TEXT NOT NULL,
               settings_sha256 TEXT NOT NULL,
               settings_json TEXT NOT NULL,
               catalog_generation INTEGER NOT NULL CHECK(catalog_generation>=1),
               analyzer_version TEXT NOT NULL,
               signal_analyzer_version TEXT NOT NULL,
               calibration_version TEXT NOT NULL,
               status TEXT NOT NULL,
               is_default INTEGER NOT NULL DEFAULT 0,
               is_current INTEGER NOT NULL DEFAULT 1,
               replaces_profile_id TEXT REFERENCES junk_profiles(profile_id),
               calibration_parent_profile_id TEXT REFERENCES junk_profiles(profile_id),
               job_id TEXT NOT NULL REFERENCES background_jobs(job_id),
               result_count INTEGER NOT NULL DEFAULT 0 CHECK(result_count>=0),
               effectively_hidden_count INTEGER NOT NULL DEFAULT 0 CHECK(effectively_hidden_count>=0),
               favourite_protected_count INTEGER NOT NULL DEFAULT 0 CHECK(favourite_protected_count>=0),
               feedback_count INTEGER NOT NULL DEFAULT 0 CHECK(feedback_count>=0),
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL,
               completed_at TEXT,
               error_text TEXT,
               UNIQUE(settings_sha256,catalog_generation,analyzer_version,signal_analyzer_version,calibration_version)
           )""",
        """CREATE INDEX idx_junk_profiles_page
               ON junk_profiles(is_current,status,is_default DESC,updated_at DESC,profile_id DESC)""",
        """CREATE INDEX idx_junk_profiles_ready
               ON junk_profiles(catalog_generation,is_current,status,completed_at DESC,profile_id)""",
        """CREATE TABLE junk_effective_results (
               profile_id TEXT NOT NULL REFERENCES junk_profiles(profile_id),
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               ordinal INTEGER NOT NULL CHECK(ordinal>=0),
               effective_hidden INTEGER NOT NULL DEFAULT 0,
               favourite_protected INTEGER NOT NULL DEFAULT 0,
               agreement_count INTEGER NOT NULL DEFAULT 0 CHECK(agreement_count>=0),
               reason_count INTEGER NOT NULL DEFAULT 0 CHECK(reason_count>=0),
               reasons_json TEXT NOT NULL,
               explanation_text TEXT NOT NULL,
               better_alternative_entity_id TEXT REFERENCES photo_entities(entity_id),
               created_at TEXT NOT NULL,
               PRIMARY KEY(profile_id,entity_id),
               UNIQUE(profile_id,ordinal)
           )""",
        """CREATE INDEX idx_junk_results_hidden_page
               ON junk_effective_results(profile_id,effective_hidden DESC,ordinal,entity_id)""",
        """CREATE INDEX idx_junk_results_entity
               ON junk_effective_results(entity_id,profile_id)""",
        """CREATE TABLE junk_feedback (
               feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
               profile_id TEXT NOT NULL REFERENCES junk_profiles(profile_id),
               entity_id TEXT NOT NULL REFERENCES photo_entities(entity_id),
               feedback_kind TEXT NOT NULL,
               signal_snapshot_json TEXT NOT NULL,
               comment_text TEXT,
               idempotency_key TEXT NOT NULL COLLATE BINARY,
               calibration_job_id TEXT REFERENCES background_jobs(job_id),
               applied_profile_id TEXT REFERENCES junk_profiles(profile_id),
               created_at TEXT NOT NULL,
               UNIQUE(profile_id,entity_id,feedback_kind,idempotency_key)
           )""",
        """CREATE INDEX idx_junk_feedback_profile
               ON junk_feedback(profile_id,feedback_id)""",
        """CREATE INDEX idx_junk_feedback_pending
               ON junk_feedback(profile_id,calibration_job_id,feedback_id)""",
    )
    for statement in statements:
        conn.execute(statement)


MIGRATIONS: tuple[Migration, ...] = (
    Migration(3, "stage_1_ordered_migration_framework", _add_migration_history),
    Migration(4, "stage_2_review_import_manifest", _add_review_import_manifest),
    Migration(5, "stage_3_reviewed_copy_telemetry", _add_reviewed_copy_telemetry),
    Migration(6, "stage_4_preprocessing_derivatives_features", _add_preprocessing_pipeline),
    Migration(7, "stage_5_review_application_foundation", _add_review_application_foundation),
    Migration(8, "stage_6_import_interface_materializations", _add_import_interface_materializations),
    Migration(9, "stage_7_virtualized_library_browser", _add_library_browser),
    Migration(10, "stage_8_alternate_organization_views", _add_alternate_organization_views),
    Migration(11, "stage_9_similarity_stacks", _add_similarity_stacks),
    Migration(12, "stage_10_explainable_junk_review", _add_explainable_junk_review),
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
