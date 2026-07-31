from __future__ import annotations

import hashlib
import json
import statistics
from dataclasses import asdict
from datetime import datetime
from pathlib import Path
from typing import Any, Literal

from .config import ReviewConfig
from .core import VaultLayout, VaultRunLock, is_within, json_text, stable_id, utc_now
from .db import SCHEMA_VERSION, ManifestDB, validate_manifest_connection
from .preprocess import PreprocessingService
from .review_copy import LegacyImportHistoryService
from .review_junk import ensure_default_junk_profile
from .review_library import ensure_catalog_job
from .review_organization import ensure_organization_job
from .review_stacks import ensure_default_stack_profile


STAGE11_JOB_KINDS = frozenset({"vault_backfill"})
BACKFILL_VERSION = "release-backfill-v1"
BACKFILL_PRIORITY = 1
BACKFILL_PREPROCESS_PRIORITY = 5
_TERMINAL_JOB_STATUSES = frozenset({"completed", "failed", "cancelled"})
_BACKFILL_RATE_SAMPLE_LIMIT = 128


def _decode_progress(value: str | None) -> dict[str, Any]:
    if not value:
        return {}
    decoded = json.loads(value)
    if not isinstance(decoded, dict):
        raise ValueError("Backfill progress must be a JSON object")
    return decoded


def estimate_backfill_eta(durations: list[float], remaining_assets: int) -> dict[str, Any]:
    """Estimate active processing time from bounded persisted per-asset durations."""
    positive_rates = [1.0 / float(duration) for duration in durations if duration > 0]
    if not positive_rates:
        return {
            "asset_current_rate_per_second": None,
            "asset_ewma_rate_per_second": None,
            "eta_seconds": 0.0 if remaining_assets <= 0 else None,
            "eta_confidence": "learning",
        }
    ewma = positive_rates[0]
    for rate in positive_rates[1:]:
        ewma = 0.3 * rate + 0.7 * ewma
    count = len(positive_rates)
    if count < 3:
        confidence = "learning"
    else:
        mean = statistics.fmean(positive_rates)
        coefficient = statistics.pstdev(positive_rates) / mean if mean else float("inf")
        if count < 5 or coefficient > 0.50:
            confidence = "low"
        elif count < 10 or coefficient > 0.20:
            confidence = "medium"
        else:
            confidence = "high"
    return {
        "asset_current_rate_per_second": positive_rates[-1],
        "asset_ewma_rate_per_second": ewma,
        "eta_seconds": max(0, remaining_assets) / ewma,
        "eta_confidence": confidence,
    }


def _parse_timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _completed_child_durations(db: ManifestDB, progress: dict[str, Any]) -> list[float]:
    child_ids = tuple(str(value) for value in progress.get("active_job_ids", ()) if value)
    if not child_ids:
        return []
    placeholders = ",".join("?" for _ in child_ids)
    rows = db.all(
        f"""SELECT attempt.started_at,attempt.completed_at
                FROM background_jobs job
                JOIN background_job_attempts attempt
                  ON attempt.job_id=job.job_id AND attempt.attempt=job.attempt
               WHERE job.job_id IN ({placeholders}) AND job.status='completed'
                 AND attempt.started_at IS NOT NULL AND attempt.completed_at IS NOT NULL""",
        child_ids,
    )
    durations: list[float] = []
    for row in rows:
        duration = (_parse_timestamp(str(row["completed_at"])) - _parse_timestamp(str(row["started_at"]))).total_seconds()
        if duration > 0:
            durations.append(duration)
    return durations


def _update_backfill_eta(db: ManifestDB, progress: dict[str, Any]) -> None:
    new_durations = _completed_child_durations(db, progress)
    samples = [
        float(value)
        for value in progress.get("asset_duration_samples", ())
        if isinstance(value, (int, float)) and value > 0
    ]
    samples.extend(new_durations)
    progress["asset_duration_samples"] = samples[-_BACKFILL_RATE_SAMPLE_LIMIT:]
    progress["asset_timing_sample_count"] = int(progress.get("asset_timing_sample_count", 0)) + len(new_durations)
    total = int(progress.get("asset_total") or 0)
    processed = int(progress.get("asset_jobs_completed", 0)) + int(progress.get("asset_jobs_failed", 0))
    progress.update(estimate_backfill_eta(progress["asset_duration_samples"], total - processed))


def _job_value(row: Any | None) -> dict[str, Any]:
    if row is None:
        return {
            "id": None,
            "kind": "vault_backfill",
            "status": "not_started",
            "phase": "not_started",
            "control_state": "run",
            "progress": {
                "version": BACKFILL_VERSION,
                "message": "Backfill has not been prepared.",
            },
            "error": None,
        }
    return {
        "id": str(row["job_id"]),
        "kind": str(row["job_kind"]),
        "status": str(row["status"]),
        "phase": str(row["phase"]),
        "control_state": str(row["control_state"]),
        "progress": _decode_progress(row["progress_json"]),
        "error": str(row["error_text"]) if row["error_text"] else None,
    }


def current_backfill(db: Any) -> dict[str, Any]:
    row = db.one(
        """SELECT * FROM background_jobs WHERE job_kind='vault_backfill'
             ORDER BY created_at DESC,job_id DESC LIMIT 1"""
    )
    return _job_value(row)


def ensure_vault_backfill(db: Any, config: ReviewConfig, *, restart: bool = False) -> dict[str, Any]:
    db.require_schema(SCHEMA_VERSION, feature_name="release backfill")
    latest = db.one(
        """SELECT * FROM background_jobs WHERE job_kind='vault_backfill'
             ORDER BY created_at DESC,job_id DESC LIMIT 1"""
    )
    if latest is not None and latest["status"] not in _TERMINAL_JOB_STATUSES:
        return _job_value(latest)
    if latest is not None and latest["status"] == "completed" and not restart:
        return _job_value(latest)

    now = utc_now()
    job_id = stable_id(
        "job1",
        "vault_backfill",
        BACKFILL_VERSION,
        now,
        asdict(config.analyzer_versions),
    )
    progress = {
        "version": BACKFILL_VERSION,
        "phase": "inventory",
        "message": "Backfill is queued. No media work runs in this request.",
        "asset_total": None,
        "asset_cursor": "",
        "asset_jobs_enqueued": 0,
        "asset_jobs_completed": 0,
        "asset_jobs_failed": 0,
        "asset_outputs_unavailable": 0,
        "asset_duration_samples": [],
        "asset_timing_sample_count": 0,
        "asset_current_rate_per_second": None,
        "asset_ewma_rate_per_second": None,
        "eta_seconds": None,
        "eta_confidence": "learning",
        "eta_basis": "completed asset preprocessing attempts; active processing time only",
        "active_job_ids": [],
        "completed_phases": [],
        "throttle": {
            "asset_batch_size": config.workers.backfill_batch_size,
            "asset_job_priority": BACKFILL_PREPROCESS_PRIORITY,
            "reviewed_copy_priority": 100,
        },
    }
    db.execute(
        """INSERT INTO background_jobs(
               job_id,job_kind,subject_type,subject_id,phase,status,attempt,created_at,
               heartbeat_at,progress_json,priority,max_attempts,control_state,queued_at,updated_at
           ) VALUES(?,'vault_backfill','vault','current','inventory','queued',0,?,?,?,?,3,'run',?,?)""",
        (job_id, now, now, json_text(progress), BACKFILL_PRIORITY, now, now),
    )
    return current_backfill(db)


def control_vault_backfill(
    db: Any,
    action: Literal["pause", "resume"],
) -> dict[str, Any]:
    row = db.one(
        """SELECT * FROM background_jobs WHERE job_kind='vault_backfill'
             ORDER BY created_at DESC,job_id DESC LIMIT 1"""
    )
    if row is None:
        raise KeyError("No release backfill has been prepared")
    if row["status"] in _TERMINAL_JOB_STATUSES:
        raise ValueError(f"Backfill is {row['status']} and cannot be {action}d")
    progress = _decode_progress(row["progress_json"])
    child_ids = tuple(str(value) for value in progress.get("active_job_ids", ()) if value)
    now = utc_now()
    if action == "pause":
        db.execute(
            """UPDATE background_jobs SET status='paused',control_state='pause',updated_at=?,heartbeat_at=?
                 WHERE job_id=? AND status IN ('queued','running','paused')""",
            (now, now, row["job_id"]),
        )
        if child_ids:
            placeholders = ",".join("?" for _ in child_ids)
            db.execute(
                f"""UPDATE background_jobs SET control_state='pause',updated_at=?
                      WHERE job_id IN ({placeholders}) AND status IN ('queued','running')""",
                (now, *child_ids),
            )
    else:
        db.execute(
            """UPDATE background_jobs SET status='queued',control_state='run',queued_at=?,updated_at=?
                 WHERE job_id=? AND status IN ('paused','queued') AND control_state='pause'""",
            (now, now, row["job_id"]),
        )
        if child_ids:
            placeholders = ",".join("?" for _ in child_ids)
            db.execute(
                f"""UPDATE background_jobs SET control_state='run',queued_at=?,updated_at=?
                      WHERE job_id IN ({placeholders}) AND status='queued'""",
                (now, now, *child_ids),
            )
    return current_backfill(db)


def _claim_backfill(db: ManifestDB, job_id: str) -> tuple[dict[str, Any], dict[str, Any]] | None:
    db.execute("BEGIN IMMEDIATE")
    row = db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,))
    if row is None or row["job_kind"] not in STAGE11_JOB_KINDS:
        db.conn.rollback()
        raise KeyError(f"Unknown Stage 11 backfill job: {job_id}")
    if row["status"] == "completed":
        db.conn.rollback()
        return None
    if row["status"] != "queued" or row["control_state"] != "run":
        db.conn.rollback()
        return None
    now = utc_now()
    attempt = int(row["attempt"]) + (1 if row["started_at"] is None else 0)
    updated = db.execute(
        """UPDATE background_jobs SET status='running',attempt=?,started_at=COALESCE(started_at,?),
               heartbeat_at=?,updated_at=?,error_text=NULL WHERE job_id=? AND status='queued' AND control_state='run'""",
        (attempt, now, now, now, job_id),
    )
    if updated.rowcount != 1:
        db.conn.rollback()
        return None
    db.commit()
    return dict(db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,))), _decode_progress(row["progress_json"])


def _active_children(db: ManifestDB, progress: dict[str, Any]) -> tuple[bool, int, int]:
    child_ids = tuple(str(value) for value in progress.get("active_job_ids", ()) if value)
    if not child_ids:
        return False, 0, 0
    placeholders = ",".join("?" for _ in child_ids)
    rows = db.all(
        f"SELECT job_id,status,error_text FROM background_jobs WHERE job_id IN ({placeholders})",
        child_ids,
    )
    if len(rows) != len(child_ids):
        raise RuntimeError("Backfill child-job evidence is incomplete")
    pending = any(row["status"] not in _TERMINAL_JOB_STATUSES for row in rows)
    failures = sum(row["status"] in {"failed", "cancelled"} for row in rows)
    unavailable = sum(row["status"] == "completed" and bool(row["error_text"]) for row in rows)
    return pending, failures, unavailable


def _set_child(progress: dict[str, Any], *, phase: str, job_id: str, message: str) -> None:
    progress["phase"] = phase
    progress["active_job_ids"] = [job_id]
    progress["message"] = message


def _finish_child_phase(db: ManifestDB, progress: dict[str, Any], phase: str) -> bool:
    pending, failures, unavailable = _active_children(db, progress)
    if pending:
        progress["message"] = f"Waiting for persisted {phase.replace('_', ' ')} work to finish."
        return False
    if failures:
        raise RuntimeError(f"The {phase.replace('_', ' ')} child job failed; inspect its persisted error")
    if unavailable:
        progress["asset_outputs_unavailable"] = int(progress.get("asset_outputs_unavailable", 0)) + unavailable
    progress["active_job_ids"] = []
    completed = list(progress.get("completed_phases", ()))
    if phase not in completed:
        completed.append(phase)
    progress["completed_phases"] = completed
    return True


def _advance_backfill(db: ManifestDB, layout: VaultLayout, config: ReviewConfig, progress: dict[str, Any]) -> bool:
    phase = str(progress.get("phase") or "inventory")
    if phase == "inventory":
        if progress.get("asset_total") is None:
            progress["asset_total"] = int(
                db.one("SELECT COUNT(*) AS count FROM assets WHERE object_status='verified'")["count"]
            )
        if progress.get("active_job_ids"):
            pending, failures, unavailable = _active_children(db, progress)
            if pending:
                progress["message"] = "Waiting for the current throttled preprocessing batch."
                return False
            batch_size = len(progress["active_job_ids"])
            progress["asset_jobs_completed"] = int(progress.get("asset_jobs_completed", 0)) + batch_size - failures
            progress["asset_jobs_failed"] = int(progress.get("asset_jobs_failed", 0)) + failures
            progress["asset_outputs_unavailable"] = int(progress.get("asset_outputs_unavailable", 0)) + unavailable
            _update_backfill_eta(db, progress)
            progress["active_job_ids"] = []

        rows = db.all(
            """SELECT asset_id FROM assets WHERE object_status='verified' AND asset_id>?
                 ORDER BY asset_id LIMIT ?""",
            (str(progress.get("asset_cursor") or ""), config.workers.backfill_batch_size),
        )
        if rows:
            service = PreprocessingService(db, layout, config)
            job_ids: list[str] = []
            for row in rows:
                job_ids.append(
                    service.enqueue_asset(
                        str(row["asset_id"]),
                        priority=BACKFILL_PREPROCESS_PRIORITY,
                    )
                )
            progress["asset_cursor"] = str(rows[-1]["asset_id"])
            progress["asset_jobs_enqueued"] = int(progress.get("asset_jobs_enqueued", 0)) + len(job_ids)
            progress["active_job_ids"] = job_ids
            progress["message"] = (
                f"Prepared {progress['asset_jobs_enqueued']} of {progress['asset_total']} assets in bounded batches."
            )
            return False
        progress["completed_phases"] = [*progress.get("completed_phases", ()), "preprocessing"]
        progress["phase"] = "catalog"
        progress["message"] = "All verified assets have durable preprocessing outcomes; preparing the catalog."
        phase = "catalog"

    if phase == "catalog":
        if progress.get("active_job_ids"):
            if not _finish_child_phase(db, progress, "catalog"):
                return False
            progress["phase"] = "organization"
            phase = "organization"
        else:
            view = ensure_catalog_job(db, config, force=True)
            _set_child(
                progress,
                phase="catalog",
                job_id=str(view["job_id"]),
                message="Materializing stable logical entities, facets, and common indexed views.",
            )
            db.commit()
            return False

    if phase == "organization":
        if progress.get("active_job_ids"):
            if not _finish_child_phase(db, progress, "organization"):
                return False
            progress["phase"] = "stacks"
            phase = "stacks"
        else:
            view = ensure_organization_job(db, config, force=True)
            _set_child(
                progress,
                phase="organization",
                job_id=str(view["job_id"]),
                message="Materializing calendar, folder, equipment, and private-map rollups.",
            )
            db.commit()
            return False

    if phase == "stacks":
        if progress.get("active_job_ids"):
            if not _finish_child_phase(db, progress, "stacks"):
                return False
            progress["phase"] = "junk"
            phase = "junk"
        else:
            profile = ensure_default_stack_profile(db, config)
            _set_child(
                progress,
                phase="stacks",
                job_id=str(profile["job_id"]),
                message="Materializing the transparent default Stack profile.",
            )
            db.commit()
            return False

    if phase == "junk":
        if progress.get("active_job_ids"):
            if not _finish_child_phase(db, progress, "junk"):
                return False
            progress["phase"] = "legacy_history"
            phase = "legacy_history"
        else:
            profile = ensure_default_junk_profile(db, config)
            _set_child(
                progress,
                phase="junk",
                job_id=str(profile["job_id"]),
                message="Materializing the explainable default junk profile without applying any action.",
            )
            db.commit()
            return False

    if phase == "legacy_history":
        progress["legacy_history_count"] = LegacyImportHistoryService(db, layout).backfill()
        progress["completed_phases"] = [*progress.get("completed_phases", ()), "legacy_history"]
        progress["phase"] = "complete"
        progress["active_job_ids"] = []
        progress["message"] = "Release backfill is complete; all outputs remain persisted and auditable."
        return True
    return phase == "complete"


def run_vault_backfill_job(config: ReviewConfig, job_id: str) -> None:
    layout = VaultLayout(config.vault_root)
    with VaultRunLock(layout.state, "release-backfill"):
        db = ManifestDB(layout.database, required_schema_version=SCHEMA_VERSION, feature_name="release backfill")
        try:
            claimed = _claim_backfill(db, job_id)
            if claimed is None:
                return
            _job, progress = claimed
            complete = _advance_backfill(db, layout, config, progress)
            now = utc_now()
            if complete:
                db.execute(
                    """UPDATE background_jobs SET phase='complete',status='completed',completed_at=?,
                           heartbeat_at=?,updated_at=?,progress_json=?,error_text=NULL WHERE job_id=?""",
                    (now, now, now, json_text(progress), job_id),
                )
            else:
                db.execute(
                    """UPDATE background_jobs SET phase=?,
                           status=CASE WHEN control_state='pause' THEN 'paused' ELSE 'queued' END,
                           queued_at=CASE WHEN control_state='pause' THEN queued_at ELSE ? END,
                           heartbeat_at=?,updated_at=?,
                           progress_json=?,error_text=NULL WHERE job_id=?""",
                    (progress["phase"], now, now, now, json_text(progress), job_id),
                )
            db.commit()
        except BaseException as exc:
            if db.conn.in_transaction:
                db.conn.rollback()
            now = utc_now()
            row = db.one("SELECT attempt,max_attempts FROM background_jobs WHERE job_id=?", (job_id,))
            retry = row is not None and int(row["attempt"]) < int(row["max_attempts"])
            db.execute(
                """UPDATE background_jobs SET status=?,completed_at=?,queued_at=CASE WHEN ? THEN ? ELSE queued_at END,
                       heartbeat_at=?,updated_at=?,error_text=? WHERE job_id=?""",
                (
                    "queued" if retry else "failed",
                    None if retry else now,
                    int(retry),
                    now,
                    now,
                    now,
                    f"{type(exc).__name__}: {exc}",
                    job_id,
                ),
            )
            db.commit()
            raise
        finally:
            db.close()


def recover_interrupted_stage11_jobs(config: ReviewConfig) -> tuple[str, ...]:
    layout = VaultLayout(config.vault_root)
    with VaultRunLock(layout.state, "release-backfill-recovery"):
        db = ManifestDB(layout.database, required_schema_version=SCHEMA_VERSION, feature_name="release backfill recovery")
        try:
            rows = db.all(
                """SELECT job_id,attempt,max_attempts FROM background_jobs
                     WHERE job_kind='vault_backfill' AND status='running' ORDER BY job_id"""
            )
            now = utc_now()
            recovered: list[str] = []
            for row in rows:
                retry = int(row["attempt"]) < int(row["max_attempts"])
                db.execute(
                    """UPDATE background_jobs SET status=?,completed_at=?,queued_at=CASE WHEN ? THEN ? ELSE queued_at END,
                           heartbeat_at=?,updated_at=?,error_text=? WHERE job_id=? AND status='running'""",
                    (
                        "queued" if retry else "failed",
                        None if retry else now,
                        int(retry),
                        now,
                        now,
                        now,
                        "Backfill worker stopped; committed child outputs were retained and the coordinator is resumable",
                        row["job_id"],
                    ),
                )
                recovered.append(str(row["job_id"]))
            db.commit()
            return tuple(recovered)
        finally:
            db.close()


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb", buffering=0) as handle:
        while block := handle.read(8 * 1024 * 1024):
            digest.update(block)
    return digest.hexdigest()


def audit_release_state(config: ReviewConfig, *, verify_derivative_checksums: bool = True) -> dict[str, Any]:
    """Audit persisted release outputs without reading source or canonical media."""

    layout = VaultLayout(config.vault_root)
    db = ManifestDB(layout.database, required_schema_version=SCHEMA_VERSION, feature_name="release audit")
    try:
        validation = validate_manifest_connection(db.conn, expected_version=SCHEMA_VERSION)
        derivative_rows = db.all(
            """SELECT derivative_id,relative_path_text,checksum_sha256,byte_size FROM derivatives
                 WHERE status='ready' AND is_current=1 ORDER BY derivative_id"""
        )
        checksum_errors: list[str] = []
        if verify_derivative_checksums:
            for row in derivative_rows:
                path = config.derivative_root / str(row["relative_path_text"])
                if not is_within(path, config.derivative_root) or not path.is_file():
                    checksum_errors.append(str(row["derivative_id"]))
                    continue
                if path.stat().st_size != int(row["byte_size"] or -1) or _sha256_file(path) != row["checksum_sha256"]:
                    checksum_errors.append(str(row["derivative_id"]))
        current_catalog = db.one(
            """SELECT source_generation,status,item_count FROM materialized_views
                 WHERE view_kind='library_catalog' AND is_current=1 ORDER BY source_generation DESC LIMIT 1"""
        )
        generation = int(current_catalog["source_generation"]) if current_catalog else None
        materializations = {
            str(row["view_kind"]): {"status": str(row["status"]), "generation": int(row["source_generation"])}
            for row in db.all(
                """SELECT view_kind,status,source_generation FROM materialized_views WHERE is_current=1
                     ORDER BY view_kind,source_generation DESC"""
            )
        }
        stale_generations = [
            kind
            for kind, value in materializations.items()
            if generation is not None and kind != "library_query" and value["generation"] != generation
        ]
        return {
            "schema_version": SCHEMA_VERSION,
            "integrity_check": validation["integrity_check"],
            "foreign_key_issues": validation["foreign_key_issues"],
            "ready_derivative_count": len(derivative_rows),
            "derivative_checksum_errors": checksum_errors,
            "catalog_generation": generation,
            "catalog_item_count": int(current_catalog["item_count"]) if current_catalog else 0,
            "materializations": materializations,
            "stale_materialization_kinds": stale_generations,
            "backfill": current_backfill(db),
            "media_scope": "ready derivatives only; source and canonical media were not opened",
        }
    finally:
        db.close()


def run_stage11_job(config: ReviewConfig, job_id: str, job_kind: str) -> None:
    if job_kind == "vault_backfill":
        run_vault_backfill_job(config, job_id)
        return
    raise ValueError(f"Unsupported Stage 11 job kind: {job_kind}")
