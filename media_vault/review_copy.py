from __future__ import annotations

import contextlib
import hashlib
import json
import os
import statistics
import time
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Callable, Iterable, Sequence

from . import __version__
from .config import ReviewConfig
from .core import (
    HASH_ALGORITHM_VERSIONS,
    FullHashes,
    VaultLayout,
    VaultRunLock,
    assert_source_read_policy,
    byte_compare,
    disk_usage_for,
    hash_file,
    is_within,
    json_text,
    new_run_id,
    run_host,
    source_file_id,
    source_root_id,
    stable_id,
    utc_now,
)
from .db import SCHEMA_VERSION, ManifestDB
from .review_imports import INCLUDABLE_CLASSIFICATIONS
from .vault_ops import _copy_and_hash, _mark_destination, sync_asset_sidecar


ETA_CONFIDENCE_LABELS = frozenset({"learning", "low", "medium", "high"})
COPY_TERMINAL_STATUSES = frozenset({"verified", "excluded", "not_applicable", "skipped"})
LEGACY_METRIC_FIELDS = (
    "discovered_count",
    "processed_count",
    "skipped_count",
    "failed_count",
    "duplicate_count",
    "paired_count",
    "scanned_bytes",
    "transferred_bytes",
    "verified_bytes",
    "current_throughput_bps",
    "ewma_throughput_bps",
    "eta_seconds",
    "eta_confidence",
    "observed_read_bps",
    "observed_write_bps",
    "queue_depth",
    "busy_workers",
    "total_workers",
    "metadata_progress",
    "thumbnail_progress",
    "indexing_progress",
    "source_free_bytes",
    "destination_free_bytes",
)


class ApprovalConflictError(RuntimeError):
    """The manifest changed after the approval snapshot was created."""


class JobClaimError(RuntimeError):
    """A worker tried to act without the current durable lease."""


class _PauseRequested(Exception):
    pass


class _CancelRequested(Exception):
    pass


@dataclass(frozen=True)
class ApprovalResult:
    approval_id: str
    batch_id: str
    batch_revision: int
    decision_fingerprint: str
    included_count: int
    eligible_count: int
    excluded_count: int
    duplicate_count: int
    sidecar_count: int
    corrupt_count: int
    projected_copy_bytes: int
    destination_free_bytes: int
    sufficient_free_space: bool


@dataclass(frozen=True)
class JobClaim:
    job_id: str
    batch_id: str
    approval_id: str
    attempt: int
    claim_token: str
    worker_id: str
    lease_expires_at: str


@dataclass(frozen=True)
class CopyRunResult:
    job_id: str
    batch_id: str
    status: str
    processed_count: int
    copied_count: int
    skipped_count: int
    failed_count: int
    duplicate_count: int
    transferred_bytes: int
    verified_bytes: int


@dataclass(frozen=True)
class EtaEstimate:
    current_throughput_bps: float | None
    ewma_throughput_bps: float | None
    eta_seconds: float | None
    confidence: str


def estimate_eta(rates: Sequence[float], remaining_bytes: int) -> EtaEstimate:
    positive = [float(rate) for rate in rates if rate > 0]
    if not positive:
        return EtaEstimate(None, None, None, "learning")
    ewma = positive[0]
    for rate in positive[1:]:
        ewma = 0.3 * rate + 0.7 * ewma
    count = len(positive)
    if count < 3:
        confidence = "learning"
    else:
        mean = statistics.fmean(positive)
        coefficient = statistics.pstdev(positive) / mean if mean else float("inf")
        if count < 5 or coefficient > 0.50:
            confidence = "low"
        elif count < 10 or coefficient > 0.20:
            confidence = "medium"
        else:
            confidence = "high"
    eta = remaining_bytes / ewma if remaining_bytes > 0 and ewma > 0 else 0.0
    return EtaEstimate(positive[-1], ewma, eta, confidence)


def _parse_time(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _future_timestamp(seconds: float) -> str:
    return (
        datetime.now(timezone.utc) + timedelta(seconds=seconds)
    ).isoformat(timespec="microseconds").replace("+00:00", "Z")


def _json_load(value: str | None, default: Any) -> Any:
    if not value:
        return default
    try:
        return json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return default


def _source_snapshot(row: Any) -> dict[str, Any]:
    return {
        "size_bytes": row["stat_size_bytes"],
        "mtime_ns": row["stat_mtime_ns"],
        "ctime_ns": row["stat_ctime_ns"],
        "device_id": row["stat_device_id"],
        "file_id": row["stat_file_id"],
        "mode": row["stat_mode"],
        "file_attributes": row["stat_attributes"],
    }


def _same_source_snapshot(row: Any, path: Path) -> bool:
    stat = path.stat(follow_symlinks=False)
    return (
        int(stat.st_size) == int(row["stat_size_bytes"])
        and int(stat.st_mtime_ns) == int(row["stat_mtime_ns"])
        and int(stat.st_ctime_ns) == int(row["stat_ctime_ns"])
    )


def _event(
    db: ManifestDB,
    batch_id: str,
    event_type: str,
    phase: str,
    message: str,
    *,
    job_id: str | None = None,
    item_id: str | None = None,
    folder: str | None = None,
    level: str = "info",
    evidence: dict[str, Any] | None = None,
) -> None:
    db.execute(
        """INSERT INTO import_events(
               batch_id,job_id,item_id,folder_relative_path_text,occurred_at,level,event_type,phase,message,
               evidence_json
           ) VALUES(?,?,?,?,?,?,?,?,?,?)""",
        (
            batch_id,
            job_id,
            item_id,
            folder,
            utc_now(),
            level,
            event_type,
            phase,
            message,
            json_text(evidence or {}),
        ),
    )


def _error(
    db: ManifestDB,
    batch_id: str,
    code: str,
    cause: str,
    phase: str,
    suggested_resolution: str,
    *,
    retryable: bool,
    job_id: str | None = None,
    item_id: str | None = None,
    folder: str | None = None,
    context: dict[str, Any] | None = None,
) -> None:
    db.execute(
        """INSERT INTO import_errors(
               batch_id,job_id,item_id,folder_relative_path_text,occurred_at,phase,code,cause_text,
               context_json,retryable,suggested_resolution
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
        (
            batch_id,
            job_id,
            item_id,
            folder,
            utc_now(),
            phase,
            code,
            cause,
            json_text(context or {}),
            int(retryable),
            suggested_resolution,
        ),
    )


class BackgroundJobService:
    def __init__(self, db: ManifestDB, *, lease_seconds: float = 30.0):
        db.require_schema(SCHEMA_VERSION, feature_name="durable review jobs")
        if lease_seconds <= 0:
            raise ValueError("lease_seconds must be positive")
        self.db = db
        self.lease_seconds = lease_seconds

    def recover_expired_leases(self, *, now: str | None = None) -> tuple[str, ...]:
        threshold = now or utc_now()
        rows = self.db.all(
            """SELECT * FROM background_jobs
               WHERE job_kind='reviewed_copy' AND status='running'
                 AND lease_expires_at IS NOT NULL AND lease_expires_at<=?
               ORDER BY lease_expires_at,job_id""",
            (threshold,),
        )
        recovered: list[str] = []
        for row in rows:
            retry = int(row["attempt"]) < int(row["max_attempts"]) and row["control_state"] != "cancel_requested"
            status = "queued" if retry else "failed"
            error = "Worker lease expired; unfinished committed work was retained for restart recovery"
            self.db.execute(
                """UPDATE background_job_attempts SET status='interrupted',completed_at=?,error_text=?,retryable=?
                   WHERE job_id=? AND attempt=? AND status='running'""",
                (threshold, error, int(retry), row["job_id"], row["attempt"]),
            )
            self.db.execute(
                """UPDATE background_jobs SET status=?,phase='copying',claim_token=NULL,claimed_by=NULL,
                       lease_expires_at=NULL,heartbeat_at=?,updated_at=?,error_text=? WHERE job_id=?""",
                (status, threshold, threshold, error, row["job_id"]),
            )
            if row["subject_type"] == "import_batch":
                self.db.execute(
                    "UPDATE import_batches SET status='interrupted',updated_at=?,last_error_text=? WHERE batch_id=?",
                    (threshold, error, row["subject_id"]),
                )
                _event(
                    self.db,
                    row["subject_id"],
                    "job_lease_expired",
                    "copying",
                    error,
                    job_id=row["job_id"],
                    level="warning",
                    evidence={"retry_queued": retry, "attempt": int(row["attempt"])},
                )
            recovered.append(row["job_id"])
        if rows:
            self.db.commit()
        return tuple(recovered)

    def _claim_row(self, row: Any, worker_id: str) -> JobClaim:
        attempt = int(row["attempt"]) + 1
        if attempt > int(row["max_attempts"]):
            raise JobClaimError(f"Job {row['job_id']} exhausted its retry attempts")
        token = uuid.uuid4().hex
        now = utc_now()
        lease = _future_timestamp(self.lease_seconds)
        cursor = self.db.execute(
            """UPDATE background_jobs SET status='running',attempt=?,claim_token=?,claimed_by=?,
                   lease_expires_at=?,started_at=COALESCE(started_at,?),heartbeat_at=?,updated_at=?,error_text=NULL
               WHERE job_id=? AND status='queued' AND control_state='run'""",
            (attempt, token, worker_id, lease, now, now, now, row["job_id"]),
        )
        if cursor.rowcount != 1:
            self.db.conn.rollback()
            raise JobClaimError(f"Job {row['job_id']} is no longer claimable")
        self.db.execute(
            """INSERT INTO background_job_attempts(
                   job_id,attempt,claim_token,worker_id,status,started_at,heartbeat_at
               ) VALUES(?,?,?,?,'running',?,?)""",
            (row["job_id"], attempt, token, worker_id, now, now),
        )
        self.db.commit()
        progress = _json_load(row["progress_json"], {})
        return JobClaim(
            job_id=row["job_id"],
            batch_id=row["subject_id"],
            approval_id=str(progress["approval_id"]),
            attempt=attempt,
            claim_token=token,
            worker_id=worker_id,
            lease_expires_at=lease,
        )

    def claim_next(self, worker_id: str) -> JobClaim | None:
        self.recover_expired_leases()
        self.db.execute("BEGIN IMMEDIATE")
        row = self.db.one(
            """SELECT * FROM background_jobs
               WHERE job_kind='reviewed_copy' AND status='queued' AND control_state='run'
                 AND (retry_not_before_at IS NULL OR retry_not_before_at<=?)
               ORDER BY priority DESC,created_at,job_id LIMIT 1""",
            (utc_now(),),
        )
        if row is None:
            self.db.conn.rollback()
            return None
        return self._claim_row(row, worker_id)

    def claim_job(self, job_id: str, worker_id: str) -> JobClaim:
        self.recover_expired_leases()
        self.db.execute("BEGIN IMMEDIATE")
        row = self.db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,))
        if row is None:
            self.db.conn.rollback()
            raise KeyError(f"Unknown background job: {job_id}")
        if row["job_kind"] != "reviewed_copy":
            self.db.conn.rollback()
            raise ValueError(f"Job {job_id} is not a reviewed-copy job")
        if row["status"] != "queued" or row["control_state"] != "run":
            self.db.conn.rollback()
            raise JobClaimError(f"Job {job_id} is {row['status']} and cannot be claimed")
        return self._claim_row(row, worker_id)

    def heartbeat(self, claim: JobClaim, *, progress: dict[str, Any] | None = None) -> str:
        now = utc_now()
        lease = _future_timestamp(self.lease_seconds)
        cursor = self.db.execute(
            """UPDATE background_jobs SET heartbeat_at=?,lease_expires_at=?,updated_at=?,
                   progress_json=COALESCE(?,progress_json)
               WHERE job_id=? AND status='running' AND attempt=? AND claim_token=?""",
            (
                now,
                lease,
                now,
                json_text(progress) if progress is not None else None,
                claim.job_id,
                claim.attempt,
                claim.claim_token,
            ),
        )
        if cursor.rowcount != 1:
            self.db.conn.rollback()
            raise JobClaimError(f"Worker lease is no longer current for {claim.job_id}")
        self.db.execute(
            "UPDATE background_job_attempts SET heartbeat_at=? WHERE job_id=? AND attempt=? AND claim_token=?",
            (now, claim.job_id, claim.attempt, claim.claim_token),
        )
        self.db.commit()
        return lease

    def request_pause(self, job_id: str) -> str:
        row = self.db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,))
        if row is None:
            raise KeyError(job_id)
        if row["job_kind"] != "reviewed_copy":
            raise ValueError(f"Job {job_id} is not a reviewed-copy job")
        if row["status"] in {"completed", "cancelled", "failed"}:
            raise ValueError(f"Cannot pause a {row['status']} job")
        now = utc_now()
        if row["status"] == "running":
            status = "running"
            control = "pause_requested"
        else:
            status = "paused"
            control = "paused"
        self.db.execute(
            "UPDATE background_jobs SET status=?,control_state=?,updated_at=? WHERE job_id=?",
            (status, control, now, job_id),
        )
        if status == "paused":
            self.db.execute(
                "UPDATE import_batches SET status='paused',updated_at=? WHERE batch_id=?",
                (now, row["subject_id"]),
            )
        _event(self.db, row["subject_id"], "pause_requested", row["phase"], "Pause requested", job_id=job_id)
        self.db.commit()
        return status

    def resume(self, job_id: str) -> None:
        row = self.db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,))
        if row is None:
            raise KeyError(job_id)
        if row["job_kind"] != "reviewed_copy":
            raise ValueError(f"Job {job_id} is not a reviewed-copy job")
        if row["status"] != "paused":
            raise ValueError(f"Only a paused job can resume; found {row['status']}")
        now = utc_now()
        self.db.execute(
            """UPDATE background_jobs SET status='queued',control_state='run',claim_token=NULL,claimed_by=NULL,
                   lease_expires_at=NULL,queued_at=?,updated_at=? WHERE job_id=?""",
            (now, now, job_id),
        )
        self.db.execute(
            "UPDATE import_batches SET status='interrupted',updated_at=?,last_error_text=NULL WHERE batch_id=?",
            (now, row["subject_id"]),
        )
        _event(self.db, row["subject_id"], "job_resumed", "copying", "Paused job re-queued", job_id=job_id)
        self.db.commit()

    def request_cancel(self, job_id: str) -> str:
        row = self.db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,))
        if row is None:
            raise KeyError(job_id)
        if row["job_kind"] != "reviewed_copy":
            raise ValueError(f"Job {job_id} is not a reviewed-copy job")
        if row["status"] in {"completed", "cancelled"}:
            return row["status"]
        now = utc_now()
        if row["status"] == "running":
            status = "running"
            control = "cancel_requested"
        else:
            status = "cancelled"
            control = "cancelled"
        self.db.execute(
            "UPDATE background_jobs SET status=?,control_state=?,updated_at=?,completed_at=? WHERE job_id=?",
            (status, control, now, now if status == "cancelled" else None, job_id),
        )
        if status == "cancelled":
            self.db.execute(
                "UPDATE import_batches SET status='cancelled',updated_at=? WHERE batch_id=?",
                (now, row["subject_id"]),
            )
        _event(self.db, row["subject_id"], "cancel_requested", row["phase"], "Cancellation requested", job_id=job_id)
        self.db.commit()
        return status

    def retry(self, job_id: str) -> None:
        row = self.db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,))
        if row is None:
            raise KeyError(job_id)
        if row["job_kind"] != "reviewed_copy":
            raise ValueError(f"Job {job_id} is not a reviewed-copy job")
        if row["status"] not in {"failed", "interrupted"}:
            raise ValueError(f"Only failed or interrupted jobs can retry; found {row['status']}")
        if int(row["attempt"]) >= int(row["max_attempts"]):
            raise ValueError("Job retry limit has been reached")
        now = utc_now()
        self.db.execute(
            """UPDATE background_jobs SET status='queued',control_state='run',claim_token=NULL,claimed_by=NULL,
                   lease_expires_at=NULL,queued_at=?,updated_at=?,error_text=NULL WHERE job_id=?""",
            (now, now, job_id),
        )
        self.db.execute(
            "UPDATE import_batches SET status='interrupted',updated_at=?,last_error_text=NULL WHERE batch_id=?",
            (now, row["subject_id"]),
        )
        _event(
            self.db,
            row["subject_id"],
            "job_retry_queued",
            "copying",
            "Retry queued with prior attempt evidence retained",
            job_id=job_id,
            evidence={"completed_attempts": int(row["attempt"])},
        )
        self.db.commit()


class ReviewedImportService:
    """Headless Stage 3 approval, verified copy, control, telemetry, and history service.

    Filesystem-mutating execution must run while the caller holds ``VaultRunLock``.
    Source paths are opened read-only. Canonical objects are published once through
    an atomic no-overwrite link and are never modified, moved, renamed, or deleted.
    """

    def __init__(
        self,
        db: ManifestDB,
        layout: VaultLayout,
        config: ReviewConfig,
        *,
        allow_unsafe_atime: bool = False,
        lease_seconds: float = 30.0,
    ):
        db.require_schema(SCHEMA_VERSION, feature_name="reviewed import copying")
        if layout.root.absolute() != config.vault_root.absolute():
            raise ValueError("Review configuration vault_root must match the opened vault")
        self.db = db
        self.layout = layout
        self.config = config
        self.allow_unsafe_atime = allow_unsafe_atime
        self.jobs = BackgroundJobService(db, lease_seconds=lease_seconds)
        self._rates: dict[str, list[float]] = {}

    def _batch(self, batch_id: str) -> Any:
        row = self.db.one("SELECT * FROM import_batches WHERE batch_id=?", (batch_id,))
        if row is None:
            raise KeyError(f"Unknown import batch: {batch_id}")
        return row

    def _approval_rows(self, batch_id: str) -> tuple[list[Any], list[tuple[Any, bool, str | None]]]:
        rows = self.db.all(
            """SELECT * FROM import_items WHERE batch_id=? AND present=1
               ORDER BY relative_path_text COLLATE BINARY,item_id""",
            (batch_id,),
        )
        decisions = {row["item_id"]: row["effective_decision"] for row in rows}
        prepared: list[tuple[Any, bool, str | None]] = []
        for row in rows:
            eligible = False
            reason: str | None = None
            if row["entry_kind"] != "file" or row["effective_decision"] == "not_applicable":
                reason = "structural_or_not_applicable"
            elif row["effective_decision"] == "exclude":
                reason = "excluded_by_review"
            elif row["effective_decision"] != "include":
                raise ValueError(f"Item {row['item_id']} has no final include/exclude decision")
            elif row["classification"] not in INCLUDABLE_CLASSIFICATIONS:
                raise ValueError(f"Included item {row['item_id']} is not an approved media/sidecar classification")
            elif row["hash_status"] != "verified" or not all(
                row[name] for name in ("hashed_size_bytes", "sha256", "blake3", "sha512")
            ):
                raise ValueError(f"Included item {row['item_id']} has no verified full-file hash identity")
            elif row["classification"] == "sidecar" and decisions.get(row["associated_sidecar_of_item_id"]) != "include":
                reason = "associated_media_not_included"
            else:
                eligible = True
            prepared.append((row, eligible, reason))
        return rows, prepared

    @staticmethod
    def _fingerprint(prepared: Iterable[tuple[Any, bool, str | None]]) -> str:
        evidence = [
            (
                row["item_id"],
                row["current_observation_id"],
                row["effective_decision"],
                row["decision_revision"],
                bool(eligible),
                reason,
                row["hashed_size_bytes"],
                row["sha256"],
                row["blake3"],
                row["sha512"],
            )
            for row, eligible, reason in prepared
        ]
        return stable_id("iapf1", evidence)

    def _require_review_ready(self, batch: Any) -> None:
        if batch["status"] not in {"awaiting_review", "failed", "cancelled", "complete"}:
            raise ValueError(f"Batch must be review-ready before approval; found {batch['status']}")
        if not bool(batch["traversal_complete"]):
            raise ValueError("Batch approval is refused because inbox traversal was incomplete")
        preview_state = self.db.one(
            """SELECT COUNT(*) AS expected,
                      SUM(CASE WHEN d.status='ready' THEN 1 ELSE 0 END) AS ready,
                      SUM(CASE WHEN d.status='error' THEN 1 ELSE 0 END) AS unavailable,
                      SUM(CASE WHEN d.derivative_id IS NULL OR d.status NOT IN ('ready','error') THEN 1 ELSE 0 END)
                          AS pending
               FROM import_items i LEFT JOIN derivatives d
                 ON d.import_item_id=i.item_id AND d.is_current=1 AND d.derivative_kind='review_preview'
               WHERE i.batch_id=? AND i.present=1 AND i.entry_kind='file'
                 AND i.effective_decision='include'
                 AND i.classification IN ('photo','video','raw','corrupt','unsupported')""",
            (batch["batch_id"],),
        )
        assert preview_state is not None
        if int(preview_state["pending"] or 0):
            raise ValueError(
                "Batch review previews must reach a persisted ready or unavailable state before approval"
            )

    def _approval_summary(
        self,
        prepared: Iterable[tuple[Any, bool, str | None]],
        *,
        destination_free_bytes: int,
    ) -> dict[str, Any]:
        prepared_rows = list(prepared)
        eligible = [row for row, allowed, _reason in prepared_rows if allowed]
        unique_identities = {
            (row["hashed_size_bytes"], row["sha256"], row["blake3"], row["sha512"])
            for row in eligible
            if not (
                row["matched_asset_id"]
                and self.db.one(
                    "SELECT 1 FROM assets WHERE asset_id=? AND object_status='verified'",
                    (row["matched_asset_id"],),
                )
            )
        }
        projected = sum(int(identity[0]) for identity in unique_identities)
        required = projected + max(10 * 1024**3, int(projected * 0.05))
        duplicate_count = sum(
            row["match_outcome"] in {"exact_match", "batch_exact_duplicate"} for row in eligible
        )
        return {
            "included_count": sum(row["effective_decision"] == "include" for row, _ok, _why in prepared_rows),
            "eligible_count": len(eligible),
            "excluded_count": sum(row["effective_decision"] == "exclude" for row, _ok, _why in prepared_rows),
            "duplicate_count": duplicate_count,
            "sidecar_count": sum(row["classification"] == "sidecar" for row in eligible),
            "corrupt_count": sum(row["classification"] == "corrupt" for row in eligible),
            "unsupported_count": sum(row["classification"] == "unsupported" for row in eligible),
            "eligible_source_bytes": sum(int(row["hashed_size_bytes"]) for row in eligible),
            "projected_copy_bytes": projected,
            "destination_free_bytes": destination_free_bytes,
            "required_free_bytes_with_margin": required,
            "sufficient_free_space": destination_free_bytes >= required,
        }

    def approval_preflight(self, batch_id: str) -> dict[str, Any]:
        """Measure capacity outside HTTP execution and persist the exact review evidence in a job."""
        batch = self._batch(batch_id)
        self._require_review_ready(batch)
        _rows, prepared = self._approval_rows(batch_id)
        summary = self._approval_summary(
            prepared,
            destination_free_bytes=disk_usage_for(self.layout.root).free,
        )
        return {
            "batch_id": batch_id,
            "batch_revision": int(batch["revision"]),
            "discovery_generation": int(batch["discovery_generation"]),
            "decision_fingerprint": self._fingerprint(prepared),
            "summary": summary,
        }

    def approve_batch(
        self,
        batch_id: str,
        *,
        expected_revision: int,
        actor: str = "local_user",
        destination_free_bytes: int | None = None,
    ) -> ApprovalResult:
        batch = self._batch(batch_id)
        self._require_review_ready(batch)
        if int(batch["revision"]) != expected_revision:
            raise ApprovalConflictError(
                f"Batch revision changed: expected {expected_revision}, found {batch['revision']}"
            )
        _rows, prepared = self._approval_rows(batch_id)
        fingerprint = self._fingerprint(prepared)
        now = utc_now()
        approval_id = stable_id("iap1", batch_id, expected_revision, fingerprint, now)
        resolved_free_bytes = (
            disk_usage_for(self.layout.root).free
            if destination_free_bytes is None
            else int(destination_free_bytes)
        )
        summary = self._approval_summary(prepared, destination_free_bytes=resolved_free_bytes)
        projected = int(summary["projected_copy_bytes"])
        self.db.execute(
            """UPDATE import_batch_approvals SET status='invalidated',invalidated_at=?,invalidation_reason=?
               WHERE batch_id=? AND status IN ('approved','authorized') AND approval_id<>?""",
            (now, "A newer approval snapshot superseded this approval", batch_id, approval_id),
        )
        self.db.execute(
            """INSERT OR IGNORE INTO import_batch_approvals(
                   approval_id,batch_id,batch_revision,discovery_generation,decision_fingerprint,status,
                   summary_json,actor,approved_at
               ) VALUES(?,?,?,?,?,'approved',?,?,?)""",
            (
                approval_id,
                batch_id,
                expected_revision,
                int(batch["discovery_generation"]),
                fingerprint,
                json_text(summary),
                actor,
                now,
            ),
        )
        self.db.execute("DELETE FROM import_approval_items WHERE approval_id=?", (approval_id,))
        for row, allowed, reason in prepared:
            self.db.execute(
                """INSERT INTO import_approval_items(
                       approval_id,item_id,observation_id,decision,copy_eligible,skip_reason,classification,
                       size_bytes,sha256,blake3,sha512
                   ) VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    approval_id,
                    row["item_id"],
                    row["current_observation_id"],
                    row["effective_decision"],
                    int(allowed),
                    reason,
                    row["classification"],
                    row["hashed_size_bytes"],
                    row["sha256"],
                    row["blake3"],
                    row["sha512"],
                ),
            )
            if allowed:
                copy_status, outcome = "approved", None
            elif reason == "excluded_by_review":
                copy_status, outcome = "excluded", reason
            elif reason == "associated_media_not_included":
                copy_status, outcome = "skipped", reason
            else:
                copy_status, outcome = "not_applicable", reason
            self.db.execute(
                """UPDATE import_items SET approved_approval_id=?,copy_status=?,copy_outcome=?,
                       copy_error_code=NULL,copy_error_text=NULL WHERE item_id=?""",
                (approval_id, copy_status, outcome, row["item_id"]),
            )
        self.db.execute(
            """UPDATE import_batches SET active_approval_id=?,approved_at=?,current_job_id=NULL,
                   execute_authorized_at=NULL,updated_at=?,last_error_text=NULL WHERE batch_id=?""",
            (approval_id, now, now, batch_id),
        )
        _event(
            self.db,
            batch_id,
            "batch_approved",
            "awaiting_review",
            "Review decisions were snapshotted; copying still requires separate execute authorization",
            evidence={"approval_id": approval_id, **summary},
        )
        self.db.commit()
        return ApprovalResult(
            approval_id=approval_id,
            batch_id=batch_id,
            batch_revision=expected_revision,
            decision_fingerprint=fingerprint,
            included_count=int(summary["included_count"]),
            eligible_count=int(summary["eligible_count"]),
            excluded_count=int(summary["excluded_count"]),
            duplicate_count=int(summary["duplicate_count"]),
            sidecar_count=int(summary["sidecar_count"]),
            corrupt_count=int(summary["corrupt_count"]),
            projected_copy_bytes=projected,
            destination_free_bytes=resolved_free_bytes,
            sufficient_free_space=bool(summary["sufficient_free_space"]),
        )

    def authorize_execution(
        self,
        approval_id: str,
        *,
        execute: bool,
        actor: str = "local_user",
        max_attempts: int = 3,
    ) -> str:
        if execute is not True:
            raise ValueError("Reviewed copying is gated: explicit execute authorization is required")
        if max_attempts < 1:
            raise ValueError("max_attempts must be at least 1")
        approval = self.db.one("SELECT * FROM import_batch_approvals WHERE approval_id=?", (approval_id,))
        if approval is None:
            raise KeyError(f"Unknown approval: {approval_id}")
        if approval["status"] not in {"approved", "authorized"}:
            raise ApprovalConflictError(f"Approval is {approval['status']} and cannot authorize copying")
        batch = self._batch(approval["batch_id"])
        if batch["active_approval_id"] != approval_id or int(batch["revision"]) != int(approval["batch_revision"]):
            raise ApprovalConflictError("Manifest decisions changed after approval; create a new approval snapshot")
        _rows, prepared = self._approval_rows(batch["batch_id"])
        if self._fingerprint(prepared) != approval["decision_fingerprint"]:
            raise ApprovalConflictError("Manifest observations changed after approval; rescan and approve again")
        summary = _json_load(approval["summary_json"], {})
        if not summary.get("sufficient_free_space"):
            raise RuntimeError("Copy authorization refused because the approved capacity check failed")
        current_usage = disk_usage_for(self.layout.root)
        if current_usage.free < int(summary["required_free_bytes_with_margin"]):
            raise RuntimeError("Copy authorization refused because destination free space changed")
        job_id = stable_id("job1", "reviewed_copy", approval_id)
        now = utc_now()
        self.db.execute(
            """INSERT INTO background_jobs(
                   job_id,job_kind,subject_type,subject_id,phase,status,attempt,created_at,heartbeat_at,
                   progress_json,priority,max_attempts,control_state,queued_at,updated_at
               ) VALUES(?,?,?,?,'copying','queued',0,?,?,?,?,?,'run',?,?)
               ON CONFLICT(job_id) DO NOTHING""",
            (
                job_id,
                "reviewed_copy",
                "import_batch",
                batch["batch_id"],
                now,
                now,
                json_text({"approval_id": approval_id, "summary": summary}),
                100,
                max_attempts,
                now,
                now,
            ),
        )
        self.db.execute(
            """UPDATE import_batch_approvals SET status='authorized',execute_authorized_at=?,execute_actor=?
               WHERE approval_id=?""",
            (now, actor, approval_id),
        )
        self.db.execute(
            """UPDATE import_batches SET current_job_id=?,execute_authorized_at=?,updated_at=? WHERE batch_id=?""",
            (job_id, now, now, batch["batch_id"]),
        )
        _event(
            self.db,
            batch["batch_id"],
            "copy_execute_authorized",
            "awaiting_review",
            "Explicit execute authorization queued the reviewed-copy job",
            job_id=job_id,
            evidence={"approval_id": approval_id, "actor": actor},
        )
        self.db.commit()
        return job_id

    def _control_boundary(self, claim: JobClaim) -> None:
        row = self.db.one(
            "SELECT status,control_state,claim_token,attempt FROM background_jobs WHERE job_id=?",
            (claim.job_id,),
        )
        if row is None or row["claim_token"] != claim.claim_token or int(row["attempt"]) != claim.attempt:
            raise JobClaimError(f"Worker lease is no longer current for {claim.job_id}")
        if row["control_state"] == "pause_requested":
            raise _PauseRequested()
        if row["control_state"] == "cancel_requested":
            raise _CancelRequested()

    def _representative(self, asset: Any, *, exclude: Path) -> Path | None:
        if asset["object_status"] == "verified":
            candidate = self.layout.root / Path(asset["object_relpath"])
            if is_within(candidate, self.layout.objects) and candidate.is_file():
                return candidate
        for row in self.db.all(
            """SELECT sf.path_text FROM asset_sources aus
               JOIN source_versions sv ON sv.source_version_id=aus.source_version_id
               JOIN source_files sf ON sf.source_file_id=sv.source_file_id
               WHERE aus.asset_id=? AND sf.present=1 AND sf.path_text<>?
               ORDER BY aus.is_initial_representative DESC,sv.source_version_id""",
            (asset["asset_id"], str(exclude)),
        ):
            candidate = Path(row["path_text"])
            if candidate.is_file():
                return candidate
        return None

    @staticmethod
    def _sha3_identity(path: Path, hashes: FullHashes) -> tuple[str, str, str]:
        digest = hashlib.sha3_512()
        with path.open("rb", buffering=0) as handle:
            while block := handle.read(8 * 1024 * 1024):
                digest.update(block)
        value = digest.hexdigest()
        return (
            stable_id("a1c", *hashes.identity_key, value),
            stable_id("x1c", *hashes.identity_key, value),
            f"_{value[:16]}",
        )

    def _asset_for_item(self, row: Any, path: Path, run_id: str) -> tuple[Any, str]:
        hashes = FullHashes(
            int(row["hashed_size_bytes"]), row["sha256"], row["blake3"], row["sha512"]
        )
        candidates = self.db.all(
            """SELECT * FROM assets WHERE size_bytes=? AND sha256=? AND blake3=? AND sha512=?
               ORDER BY collision_discriminator,asset_id""",
            hashes.identity_key,
        )
        unavailable_candidate: Any | None = None
        for candidate in candidates:
            representative = self._representative(candidate, exclude=path)
            if representative is None:
                unavailable_candidate = unavailable_candidate or candidate
                continue
            if byte_compare(path, representative):
                return candidate, "size+sha256+blake3+sha512+byte_compare_v1"
        collision = bool(candidates and any(self._representative(candidate, exclude=path) for candidate in candidates))
        if candidates and not collision and row["match_outcome"] != "hash_collision_candidate":
            assert unavailable_candidate is not None
            return unavailable_candidate, "size+sha256+blake3+sha512_full_content_v1"
        if collision or row["match_outcome"] == "hash_collision_candidate":
            asset_id, group_id, discriminator = self._sha3_identity(path, hashes)
            existing = self.db.one("SELECT * FROM assets WHERE asset_id=?", (asset_id,))
            if existing is not None:
                return existing, "primary_hash_collision+sha3_512+byte_compare_v1"
            verification_method = "critical_hash_collision_separated_by_sha3_512_and_byte_compare_v1"
        else:
            asset_id, group_id, discriminator = hashes.asset_id, hashes.exact_group_id, ""
            verification_method = "initial_full_sha256+sha512+blake3_v1"
        now = utc_now()
        object_relpath = hashes.object_relpath
        if discriminator:
            object_path = Path(object_relpath)
            object_relpath = str(object_path.with_name(object_path.stem + discriminator + object_path.suffix))
        self.db.execute(
            """INSERT INTO exact_groups(
                   exact_group_id,size_bytes,sha256,blake3,sha512,collision_discriminator,
                   verification_method,created_at
               ) VALUES(?,?,?,?,?,?,?,?)""",
            (
                group_id,
                hashes.size_bytes,
                hashes.sha256,
                hashes.blake3,
                hashes.sha512,
                discriminator,
                verification_method,
                now,
            ),
        )
        self.db.execute(
            """INSERT INTO assets(
                   asset_id,exact_group_id,size_bytes,sha256,blake3,sha512,collision_discriminator,
                   hash_algorithm_versions_json,media_kind,mime_type,detected_format,preferred_extension,
                   metadata_json,object_relpath,object_status,created_run_id,created_at,updated_at,warnings_json
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,'missing',?,?,?,?)""",
            (
                asset_id,
                group_id,
                hashes.size_bytes,
                hashes.sha256,
                hashes.blake3,
                hashes.sha512,
                discriminator,
                json_text(HASH_ALGORITHM_VERSIONS),
                row["media_kind"] or row["classification"],
                row["mime_type"],
                row["detected_format"],
                row["extension_text"],
                "{}",
                object_relpath,
                run_id,
                now,
                now,
                row["warnings_json"],
            ),
        )
        created = self.db.one("SELECT * FROM assets WHERE asset_id=?", (asset_id,))
        assert created is not None
        return created, verification_method

    def _source_for_item(self, row: Any, asset: Any, method: str, run_id: str) -> int:
        if row["copied_source_version_id"] is not None:
            return int(row["copied_source_version_id"])
        batch = self._batch(row["batch_id"])
        root_text = batch["batch_root_text"]
        root_id = source_root_id(root_text)
        source_id = source_file_id(root_id, row["path_text"])
        now = utc_now()
        self.db.execute(
            """INSERT INTO source_roots(source_root_id,path_text,first_seen_at,last_seen_at)
               VALUES(?,?,?,?) ON CONFLICT(source_root_id) DO UPDATE SET last_seen_at=excluded.last_seen_at""",
            (root_id, root_text, now, now),
        )
        self.db.execute(
            """INSERT INTO source_files(
                   source_file_id,source_root_id,path_text,relative_path_text,first_seen_at,last_seen_at,
                   last_seen_run_id,present,size_bytes,mtime_ns,ctime_ns,device_id,file_id,discovery_status,
                   media_kind,asset_id
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
               ON CONFLICT(source_file_id) DO UPDATE SET last_seen_at=excluded.last_seen_at,
                   last_seen_run_id=excluded.last_seen_run_id,present=1,size_bytes=excluded.size_bytes,
                   mtime_ns=excluded.mtime_ns,ctime_ns=excluded.ctime_ns,device_id=excluded.device_id,
                   file_id=excluded.file_id,discovery_status=excluded.discovery_status,
                   media_kind=excluded.media_kind,asset_id=excluded.asset_id""",
            (
                source_id,
                root_id,
                row["path_text"],
                row["relative_path_text"],
                now,
                now,
                run_id,
                1,
                row["stat_size_bytes"],
                row["stat_mtime_ns"],
                row["stat_ctime_ns"],
                row["stat_device_id"],
                row["stat_file_id"],
                "media",
                row["media_kind"] or row["classification"],
                asset["asset_id"],
            ),
        )
        cursor = self.db.execute(
            """INSERT INTO source_versions(
                   source_file_id,observed_run_id,observed_at,size_bytes,mtime_ns,ctime_ns,device_id,file_id,
                   extension_text,discovery_status,discovery_basis,media_kind,mime_type,detected_format,
                   extension_mismatch,asset_id,hash_status,metadata_status,metadata_json,
                   normalized_metadata_json,warnings_json,error_text
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'deferred','{}','{}',?,?)""",
            (
                source_id,
                run_id,
                now,
                row["stat_size_bytes"],
                row["stat_mtime_ns"],
                row["stat_ctime_ns"],
                row["stat_device_id"],
                row["stat_file_id"],
                row["extension_text"],
                "media",
                row["discovery_basis"],
                row["media_kind"] or row["classification"],
                row["mime_type"],
                row["detected_format"],
                int(bool(_json_load(row["classification_evidence_json"], {}).get("extension_mismatch"))),
                asset["asset_id"],
                "verified",
                row["warnings_json"],
                row["error_text"],
            ),
        )
        version_id = int(cursor.lastrowid)
        self.db.execute(
            "UPDATE source_files SET current_version_id=? WHERE source_file_id=?",
            (version_id, source_id),
        )
        self.db.execute(
            """INSERT OR IGNORE INTO asset_sources(
                   asset_id,source_version_id,exact_verification_method,exact_verified_at,is_initial_representative
               ) VALUES(?,?,?,?,?)""",
            (asset["asset_id"], version_id, method, now, int(asset["created_run_id"] == run_id)),
        )
        self.db.execute(
            "UPDATE import_items SET copied_asset_id=?,copied_source_version_id=? WHERE item_id=?",
            (asset["asset_id"], version_id, row["item_id"]),
        )
        self.db.commit()
        return version_id

    def _job_run(self, claim: JobClaim) -> str:
        run_id = new_run_id()
        now = utc_now()
        batch = self._batch(claim.batch_id)
        self.db.execute(
            """INSERT INTO runs(
                   run_id,command,status,started_at,source_root,vault_root,host,tool_version,arguments_json
               ) VALUES(?,?,?,?,?,?,?,?,?)""",
            (
                run_id,
                "reviewed-import-copy",
                "running",
                now,
                batch["batch_root_text"],
                str(self.layout.root),
                run_host(),
                __version__,
                json_text(
                    {
                        "batch_id": claim.batch_id,
                        "approval_id": claim.approval_id,
                        "job_id": claim.job_id,
                        "attempt": claim.attempt,
                    }
                ),
            ),
        )
        self.db.execute("UPDATE background_jobs SET run_id=? WHERE job_id=?", (run_id, claim.job_id))
        self.db.commit()
        return run_id

    def _finish_run(self, run_id: str, status: str, summary: dict[str, Any]) -> None:
        self.db.execute(
            "UPDATE runs SET status=?,completed_at=?,summary_json=? WHERE run_id=?",
            (status, utc_now(), json_text(summary), run_id),
        )

    def _reconcile(self, batch_id: str, phase: str) -> dict[str, int]:
        rows = self.db.all(
            "SELECT * FROM import_items WHERE batch_id=? AND present=1 ORDER BY relative_path_text,item_id",
            (batch_id,),
        )
        values = {
            "processed_count": sum(row["copy_status"] in COPY_TERMINAL_STATUSES | {"failed"} for row in rows),
            "copied_count": sum(row["copy_outcome"] in {"copied_new", "copied_missing_exact_object"} for row in rows),
            "skipped_count": sum(row["copy_status"] in {"excluded", "not_applicable", "skipped"} for row in rows),
            "failed_count": sum(row["copy_status"] == "failed" for row in rows),
            "duplicate_count": sum(
                row["copy_status"] == "verified"
                and row["match_outcome"] in {"exact_match", "batch_exact_duplicate"}
                for row in rows
            ),
            "transferred_bytes": sum(int(row["bytes_transferred"] or 0) for row in rows),
            "verified_bytes": sum(int(row["bytes_verified"] or 0) for row in rows),
        }
        self.db.execute(
            """UPDATE import_batches SET processed_count=?,copied_count=?,skipped_count=?,failed_count=?,
                   duplicate_count=?,transferred_bytes=?,verified_bytes=?,updated_at=? WHERE batch_id=?""",
            (*values.values(), utc_now(), batch_id),
        )
        folder_rows = self.db.all(
            "SELECT relative_path_text FROM import_folder_progress WHERE batch_id=?",
            (batch_id,),
        )
        for folder_row in folder_rows:
            relative = folder_row["relative_path_text"]
            prefix = "" if relative == "." else relative + os.sep
            members = [
                row
                for row in rows
                if relative == "."
                or row["relative_path_text"] == relative
                or row["relative_path_text"].startswith(prefix)
            ]
            eligible_bytes = sum(
                int(row["hashed_size_bytes"] or 0)
                for row in members
                if row["approved_approval_id"] and row["copy_status"] in {"approved", "copying", "failed"}
            )
            recent = [
                row["relative_path_text"]
                for row in members
                if row["copy_completed_at"]
            ][-5:]
            self.db.execute(
                """UPDATE import_folder_progress SET phase=?,processed_count=?,copied_count=?,verified_count=?,
                       skipped_count=?,failed_count=?,duplicate_count=?,transferred_bytes=?,verified_bytes=?,
                       remaining_bytes=?,recently_completed_json=?,updated_at=?
                   WHERE batch_id=? AND relative_path_text=?""",
                (
                    phase,
                    sum(row["copy_status"] in COPY_TERMINAL_STATUSES | {"failed"} for row in members),
                    sum(row["copy_outcome"] in {"copied_new", "copied_missing_exact_object"} for row in members),
                    sum(row["copy_status"] == "verified" for row in members),
                    sum(row["copy_status"] in {"excluded", "not_applicable", "skipped"} for row in members),
                    sum(row["copy_status"] == "failed" for row in members),
                    sum(
                        row["copy_status"] == "verified"
                        and row["match_outcome"] in {"exact_match", "batch_exact_duplicate"}
                        for row in members
                    ),
                    sum(int(row["bytes_transferred"] or 0) for row in members),
                    sum(int(row["bytes_verified"] or 0) for row in members),
                    eligible_bytes,
                    json_text(recent),
                    utc_now(),
                    batch_id,
                    relative,
                ),
            )
        self.db.commit()
        return values

    def _sample(
        self,
        claim: JobClaim,
        phase: str,
        status: str,
        *,
        current: Any | None = None,
        rate: float | None = None,
        observed_read_bps: float | None = None,
        observed_write_bps: float | None = None,
    ) -> None:
        values = self._reconcile(claim.batch_id, phase)
        approval = self.db.one(
            "SELECT summary_json FROM import_batch_approvals WHERE approval_id=?",
            (claim.approval_id,),
        )
        summary = _json_load(approval["summary_json"], {}) if approval else {}
        eligible_count = int(summary.get("eligible_count", 0))
        eligible_source_bytes = int(summary.get("eligible_source_bytes", 0))
        projected_copy_bytes = int(summary.get("projected_copy_bytes", 0))
        verified_items = self.db.one(
            """SELECT COUNT(*) AS count,COALESCE(SUM(bytes_verified),0) AS bytes
               FROM import_items WHERE batch_id=? AND approved_approval_id=? AND copy_status='verified'""",
            (claim.batch_id, claim.approval_id),
        )
        assert verified_items is not None
        remaining_count = max(eligible_count - int(verified_items["count"]), 0)
        remaining_bytes = max(eligible_source_bytes - int(values["verified_bytes"]), 0)
        projected_remaining_bytes = max(projected_copy_bytes - int(values["transferred_bytes"]), 0)
        rates = self._rates.setdefault(claim.job_id, [])
        if rate is not None and rate > 0:
            rates.append(rate)
        estimate = estimate_eta(rates, remaining_bytes)
        queue = self.db.one(
            """SELECT SUM(status='queued') AS queued,SUM(status='running') AS busy
               FROM background_jobs WHERE job_kind='reviewed_copy'"""
        )
        root_usage = disk_usage_for(Path(self._batch(claim.batch_id)["batch_root_text"]))
        vault_usage = disk_usage_for(self.layout.root)
        paired_count = int(
            self.db.one(
                """SELECT COUNT(*) FROM import_items WHERE batch_id=? AND raw_jpeg_candidate_json<>'[]'
                   AND approved_approval_id=?""",
                (claim.batch_id, claim.approval_id),
            )[0]
        )
        exact_count = int(
            self.db.one(
                """SELECT COUNT(*) FROM import_items WHERE batch_id=?
                   AND match_outcome IN ('exact_match','batch_exact_duplicate')""",
                (claim.batch_id,),
            )[0]
        )
        warnings: list[dict[str, Any]] = []
        if vault_usage.free < remaining_bytes + 16 * 1024**2:
            warnings.append({"code": "low_destination_space", "remaining_bytes": remaining_bytes})
        metrics = {
            "classification_counts": _json_load(self._batch(claim.batch_id)["classification_counts_json"], {}),
            "exact_duplicate_count": exact_count,
            "visually_similar_duplicate_count": None,
            "visually_similar_duplicate_reason": "not recorded by this version",
            "raw_jpeg_pairing_rate": paired_count / eligible_count if eligible_count else 0.0,
            "metadata_progress": {"value": None, "reason": "deferred to Stage 4 preprocessing"},
            "thumbnail_progress": {"value": None, "reason": "deferred to Stage 4 derivatives"},
            "indexing_progress": {
                "processed": int(verified_items["count"]),
                "total": eligible_count,
            },
            "recently_completed_paths": [
                row["relative_path_text"]
                for row in self.db.all(
                    """SELECT relative_path_text FROM import_items WHERE batch_id=? AND copy_completed_at IS NOT NULL
                       ORDER BY copy_completed_at DESC,item_id LIMIT 5""",
                    (claim.batch_id,),
                )
            ],
            "warnings": warnings,
        }
        recorded = utc_now()
        self.db.execute(
            """INSERT INTO import_progress_samples(
                   batch_id,job_id,recorded_at,phase,status,discovered_count,processed_count,skipped_count,
                   failed_count,duplicate_count,paired_count,remaining_count,scanned_bytes,transferred_bytes,
                   verified_bytes,remaining_bytes,current_throughput_bps,ewma_throughput_bps,eta_seconds,
                   eta_confidence,observed_read_bps,observed_write_bps,queue_depth,busy_workers,total_workers,
                   current_item_id,current_path_text,current_folder_text,source_free_bytes,destination_free_bytes,
                   storage_consumed_bytes,projected_final_bytes,metrics_json
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                claim.batch_id,
                claim.job_id,
                recorded,
                phase,
                status,
                int(self._batch(claim.batch_id)["discovered_item_count"]),
                values["processed_count"],
                values["skipped_count"],
                values["failed_count"],
                values["duplicate_count"],
                paired_count,
                remaining_count,
                eligible_source_bytes,
                values["transferred_bytes"],
                values["verified_bytes"],
                remaining_bytes,
                estimate.current_throughput_bps,
                estimate.ewma_throughput_bps,
                estimate.eta_seconds,
                estimate.confidence,
                observed_read_bps,
                observed_write_bps,
                int(queue["queued"] or 0),
                int(queue["busy"] or 0),
                self.config.workers.total_workers,
                current["item_id"] if current else None,
                current["path_text"] if current else None,
                current["parent_relative_path_text"] if current else None,
                root_usage.free,
                vault_usage.free,
                values["transferred_bytes"],
                values["transferred_bytes"] + projected_remaining_bytes,
                json_text(metrics),
            ),
        )
        self.db.execute(
            """UPDATE import_batches SET latest_metrics_json=?,last_progress_sample_at=? WHERE batch_id=?""",
            (json_text(metrics), recorded, claim.batch_id),
        )
        self.db.commit()

    @staticmethod
    def _fault(hook: Callable[[str, str | None], None] | None, boundary: str, item_id: str | None) -> None:
        if hook:
            hook(boundary, item_id)

    def _cleanup_job_temps(self, job_id: str) -> None:
        for temp in self.layout.temp.glob(f"*.{job_id}.*.partial"):
            if is_within(temp, self.layout.temp):
                with contextlib.suppress(FileNotFoundError):
                    temp.unlink()

    def _copy_item(
        self,
        claim: JobClaim,
        row: Any,
        run_id: str,
        *,
        fault_hook: Callable[[str, str | None], None] | None,
    ) -> None:
        path = Path(row["path_text"])
        batch_root = Path(self._batch(claim.batch_id)["batch_root_text"])
        if not is_within(path, batch_root) or path.is_symlink() or not path.is_file():
            raise RuntimeError("Approved source path is absent, non-file, linked, or outside its immutable batch")
        if row["approved_approval_id"] != claim.approval_id:
            raise ApprovalConflictError("Item is not part of the claimed approval snapshot")
        approved = self.db.one(
            "SELECT * FROM import_approval_items WHERE approval_id=? AND item_id=?",
            (claim.approval_id, row["item_id"]),
        )
        if approved is None or not bool(approved["copy_eligible"]):
            raise ApprovalConflictError("Item is not eligible in the claimed approval snapshot")
        if approved["observation_id"] != row["current_observation_id"] or approved["decision"] != row["effective_decision"]:
            raise ApprovalConflictError("Item observation or decision changed after approval")
        if not _same_source_snapshot(row, path):
            raise RuntimeError("Inbox item changed after approval; copy was refused")
        expected = FullHashes(
            int(row["hashed_size_bytes"]), row["sha256"], row["blake3"], row["sha512"]
        )
        attempt = int(row["copy_attempts"]) + 1
        started = utc_now()
        self.db.execute(
            """INSERT INTO import_item_copy_attempts(
                   job_id,item_id,attempt,status,started_at,source_snapshot_json
               ) VALUES(?,?,?,'copying',?,?)""",
            (claim.job_id, row["item_id"], attempt, started, json_text(_source_snapshot(row))),
        )
        self.db.execute(
            """UPDATE import_items SET copy_status='copying',copy_attempts=?,copy_started_at=?,
                   copy_error_code=NULL,copy_error_text=NULL WHERE item_id=?""",
            (attempt, started, row["item_id"]),
        )
        _event(
            self.db,
            claim.batch_id,
            "item_copy_started",
            "copying",
            "Approved item copy started",
            job_id=claim.job_id,
            item_id=row["item_id"],
            folder=row["parent_relative_path_text"],
            evidence={"relative_path": row["relative_path_text"], "attempt": attempt},
        )
        self.db.commit()
        self._fault(fault_hook, "before_copy", row["item_id"])
        asset, verification_method = self._asset_for_item(row, path, run_id)
        source_version_id = self._source_for_item(row, asset, verification_method, run_id)
        final = self.layout.root / Path(asset["object_relpath"])
        if not is_within(final, self.layout.objects):
            raise RuntimeError("Canonical object path escaped the immutable object root")
        final.parent.mkdir(parents=True, exist_ok=True)
        self.db.execute(
            "UPDATE import_item_copy_attempts SET destination_path_text=? WHERE job_id=? AND item_id=? AND attempt=?",
            (str(final), claim.job_id, row["item_id"], attempt),
        )
        self.db.commit()
        copied_new = False
        temp: Path | None = None
        began = time.monotonic()
        if final.exists():
            actual = hash_file(final)
            if actual != expected or not byte_compare(path, final):
                _mark_destination(
                    self.db,
                    run_id,
                    asset,
                    final,
                    "conflict",
                    source_version_id=source_version_id,
                    error="Destination path exists with unexpected bytes; it was not overwritten",
                )
                self.db.commit()
                raise RuntimeError(
                    "Destination conflict: path exists with unexpected bytes; it was not overwritten"
                )
            outcome = "reused_verified_object"
        else:
            free = disk_usage_for(self.layout.root).free
            if free < expected.size_bytes + 16 * 1024**2:
                raise RuntimeError("Insufficient destination space at the item publication boundary")
            temp = self.layout.temp / f"{asset['asset_id']}.{claim.job_id}.{uuid.uuid4().hex}.partial"
            self.db.execute(
                "UPDATE import_item_copy_attempts SET temp_path_text=? WHERE job_id=? AND item_id=? AND attempt=?",
                (str(temp), claim.job_id, row["item_id"], attempt),
            )
            self.db.commit()
            self._fault(fault_hook, "after_temp_created", row["item_id"])
            copied = _copy_and_hash(path, temp)
            self._fault(fault_hook, "after_copy_fsync", row["item_id"])
            self._control_boundary(claim)
            if copied != expected or not _same_source_snapshot(row, path):
                raise RuntimeError("Inbox source changed while copying; unpublished work was abandoned")
            reopened = hash_file(temp)
            self._fault(fault_hook, "after_reopen_hash", row["item_id"])
            if reopened != expected:
                raise RuntimeError("Reopened temporary destination failed full hash verification")
            if not byte_compare(path, temp):
                raise RuntimeError("Byte-for-byte source/destination verification failed")
            self._fault(fault_hook, "after_byte_compare", row["item_id"])
            self._control_boundary(claim)
            try:
                os.link(temp, final)
            except FileExistsError:
                actual = hash_file(final)
                if actual != expected or not byte_compare(path, final):
                    conflict = self.layout.conflicts / f"{asset['asset_id']}.{claim.job_id}.verified-candidate"
                    os.rename(temp, conflict)
                    temp = None
                    raise RuntimeError(f"Destination race/conflict; verified candidate retained at {conflict}")
            self._fault(fault_hook, "after_publication", row["item_id"])
            with contextlib.suppress(FileNotFoundError):
                temp.unlink()
            temp = None
            copied_new = True
            outcome = "copied_missing_exact_object" if row["match_outcome"] == "exact_match" else "copied_new"
        duration = max(time.monotonic() - began, 1e-9)
        _mark_destination(
            self.db,
            run_id,
            asset,
            final,
            "verified",
            source_version_id=source_version_id,
        )
        destination_id = stable_id("dst1", asset["asset_id"], str(final))
        finished = utc_now()
        transferred = expected.size_bytes if copied_new else 0
        self.db.execute(
            """UPDATE import_items SET copy_status='verified',copy_outcome=?,destination_id=?,
                   bytes_transferred=?,bytes_verified=?,copy_verified_at=?,copy_completed_at=?,
                   copy_error_code=NULL,copy_error_text=NULL WHERE item_id=?""",
            (outcome, destination_id, transferred, expected.size_bytes, finished, finished, row["item_id"]),
        )
        self.db.execute(
            """UPDATE import_errors SET resolved_at=?,resolution_json=?
               WHERE batch_id=? AND item_id=? AND resolved_at IS NULL AND retryable=1""",
            (
                finished,
                json_text({"outcome": outcome, "asset_id": asset["asset_id"], "job_id": claim.job_id}),
                claim.batch_id,
                row["item_id"],
            ),
        )
        self.db.execute(
            """UPDATE import_item_copy_attempts SET status='verified',completed_at=?,bytes_transferred=?,
                   bytes_verified=?,temp_path_text=NULL WHERE job_id=? AND item_id=? AND attempt=?""",
            (
                finished,
                transferred,
                expected.size_bytes,
                claim.job_id,
                row["item_id"],
                attempt,
            ),
        )
        _event(
            self.db,
            claim.batch_id,
            "item_copy_verified",
            "verifying",
            "Canonical object passed full-hash and byte verification",
            job_id=claim.job_id,
            item_id=row["item_id"],
            folder=row["parent_relative_path_text"],
            evidence={
                "asset_id": asset["asset_id"],
                "outcome": outcome,
                "bytes_transferred": transferred,
                "bytes_verified": expected.size_bytes,
            },
        )
        self.db.commit()
        self._fault(fault_hook, "after_telemetry_commit", row["item_id"])
        try:
            sync_asset_sidecar(self.db, self.layout, asset["asset_id"])
        except Exception as exc:
            _event(
                self.db,
                claim.batch_id,
                "recovery_sidecar_write_failed",
                "indexing",
                "Verified canonical object remains valid; its recovery sidecar can be regenerated",
                job_id=claim.job_id,
                item_id=row["item_id"],
                level="warning",
                evidence={"error": f"{type(exc).__name__}: {exc}"},
            )
            self.db.commit()
        read_rate = expected.size_bytes / duration
        write_rate = transferred / duration if transferred else 0.0
        refreshed = self.db.one("SELECT * FROM import_items WHERE item_id=?", (row["item_id"],))
        assert refreshed is not None
        self._sample(
            claim,
            "verifying",
            "running",
            current=refreshed,
            rate=read_rate,
            observed_read_bps=read_rate,
            observed_write_bps=write_rate,
        )

    def _finish_job(self, claim: JobClaim, status: str, *, error_text: str | None = None) -> None:
        now = utc_now()
        self.db.execute(
            """UPDATE background_jobs SET status=?,control_state=?,completed_at=?,heartbeat_at=?,updated_at=?,
                   claim_token=NULL,claimed_by=NULL,lease_expires_at=NULL,error_text=? WHERE job_id=?""",
            (
                status,
                "paused" if status == "paused" else "cancelled" if status == "cancelled" else "run",
                now if status in {"completed", "failed", "cancelled"} else None,
                now,
                now,
                error_text,
                claim.job_id,
            ),
        )
        self.db.execute(
            """UPDATE background_job_attempts SET status=?,completed_at=?,heartbeat_at=?,error_text=?,retryable=?
               WHERE job_id=? AND attempt=?""",
            (
                status,
                now,
                now,
                error_text,
                int(status in {"failed", "interrupted"}),
                claim.job_id,
                claim.attempt,
            ),
        )

    def run_claim(
        self,
        claim: JobClaim,
        *,
        fault_hook: Callable[[str, str | None], None] | None = None,
    ) -> CopyRunResult:
        assert_source_read_policy(self.allow_unsafe_atime)
        job = self.db.one("SELECT * FROM background_jobs WHERE job_id=?", (claim.job_id,))
        if (
            job is None
            or job["status"] != "running"
            or job["claim_token"] != claim.claim_token
            or int(job["attempt"]) != claim.attempt
        ):
            raise JobClaimError(f"Worker does not hold the current lease for {claim.job_id}")
        batch = self._batch(claim.batch_id)
        if batch["active_approval_id"] != claim.approval_id:
            raise ApprovalConflictError("The claimed approval is no longer active")
        run_id = self._job_run(claim)
        now = utc_now()
        self.db.execute(
            """UPDATE import_batches SET status='copying',copy_started_at=COALESCE(copy_started_at,?),
                   updated_at=?,last_error_text=NULL WHERE batch_id=?""",
            (now, now, claim.batch_id),
        )
        self.db.execute(
            "UPDATE import_batch_approvals SET status='consumed',consumed_at=COALESCE(consumed_at,?) WHERE approval_id=?",
            (now, claim.approval_id),
        )
        _event(
            self.db,
            claim.batch_id,
            "copy_job_started",
            "copying",
            "Reviewed-copy worker claimed the durable job",
            job_id=claim.job_id,
            evidence={"attempt": claim.attempt, "worker_id": claim.worker_id},
        )
        self.db.commit()
        self._sample(claim, "copying", "running")
        try:
            rows = self.db.all(
                """SELECT ii.* FROM import_approval_items ai
                   JOIN import_items ii ON ii.item_id=ai.item_id
                   WHERE ai.approval_id=? AND ai.copy_eligible=1
                   ORDER BY ii.relative_path_text COLLATE BINARY,ii.item_id""",
                (claim.approval_id,),
            )
            for initial in rows:
                self._control_boundary(claim)
                row = self.db.one("SELECT * FROM import_items WHERE item_id=?", (initial["item_id"],))
                assert row is not None
                if row["copy_status"] == "verified":
                    if row["copied_asset_id"]:
                        with contextlib.suppress(Exception):
                            sync_asset_sidecar(self.db, self.layout, row["copied_asset_id"])
                    continue
                try:
                    self._copy_item(claim, row, run_id, fault_hook=fault_hook)
                except (_PauseRequested, _CancelRequested):
                    raise
                except Exception as exc:
                    self._cleanup_job_temps(claim.job_id)
                    failed = utc_now()
                    error_text = f"{type(exc).__name__}: {exc}"
                    code = (
                        "approval_conflict"
                        if isinstance(exc, ApprovalConflictError)
                        else "source_changed"
                        if "changed" in str(exc).casefold()
                        else "destination_conflict"
                        if "destination" in str(exc).casefold() and "conflict" in str(exc).casefold()
                        else "copy_or_verification_failed"
                    )
                    self.db.execute(
                        """UPDATE import_items SET copy_status='failed',copy_error_code=?,copy_error_text=?,
                               copy_completed_at=? WHERE item_id=?""",
                        (code, error_text, failed, row["item_id"]),
                    )
                    self.db.execute(
                        """UPDATE import_item_copy_attempts SET status='failed',completed_at=?,error_code=?,error_text=?
                           WHERE job_id=? AND item_id=? AND attempt=(
                               SELECT MAX(attempt) FROM import_item_copy_attempts WHERE job_id=? AND item_id=?
                           )""",
                        (
                            failed,
                            code,
                            error_text,
                            claim.job_id,
                            row["item_id"],
                            claim.job_id,
                            row["item_id"],
                        ),
                    )
                    _error(
                        self.db,
                        claim.batch_id,
                        code,
                        error_text,
                        "copying",
                        "Restore the approved source observation or resolve the destination conflict, then retry",
                        retryable=code not in {"approval_conflict", "destination_conflict"},
                        job_id=claim.job_id,
                        item_id=row["item_id"],
                        folder=row["parent_relative_path_text"],
                        context={"path": row["path_text"], "relative_path": row["relative_path_text"]},
                    )
                    _event(
                        self.db,
                        claim.batch_id,
                        "item_copy_failed",
                        "copying",
                        "Approved item was not marked successful",
                        job_id=claim.job_id,
                        item_id=row["item_id"],
                        folder=row["parent_relative_path_text"],
                        level="error",
                        evidence={"code": code, "error": error_text},
                    )
                    self.db.commit()
                    self._sample(claim, "copying", "running", current=row)
                self.jobs.heartbeat(
                    claim,
                    progress={"approval_id": claim.approval_id, "last_item_id": row["item_id"]},
                )
            self.db.execute(
                "UPDATE import_batches SET status='verifying',updated_at=? WHERE batch_id=?",
                (utc_now(), claim.batch_id),
            )
            self.db.execute(
                "UPDATE background_jobs SET phase='verifying',updated_at=? WHERE job_id=?",
                (utc_now(), claim.job_id),
            )
            self.db.commit()
            self._sample(claim, "verifying", "running")
            values = self._reconcile(claim.batch_id, "indexing")
            failed_count = values["failed_count"]
            final_status = "failed" if failed_count else "completed"
            batch_status = "failed" if failed_count else "complete"
            now = utc_now()
            self.db.execute(
                """UPDATE import_batches SET status=?,copy_completed_at=?,updated_at=?,last_error_text=?
                   WHERE batch_id=?""",
                (
                    batch_status,
                    now,
                    now,
                    f"{failed_count} approved item(s) failed; retry evidence was retained" if failed_count else None,
                    claim.batch_id,
                ),
            )
            self._finish_job(
                claim,
                final_status,
                error_text=f"{failed_count} approved item(s) failed" if failed_count else None,
            )
            _event(
                self.db,
                claim.batch_id,
                "copy_job_completed" if not failed_count else "copy_job_failed",
                "indexing",
                "Reviewed batch completed with fully reconciled outcomes"
                if not failed_count
                else "Reviewed batch retained failed outcomes and can be retried",
                job_id=claim.job_id,
                level="info" if not failed_count else "error",
                evidence=values,
            )
            self._finish_run(run_id, "completed" if not failed_count else "failed", values)
            self.db.commit()
            self._sample(claim, "complete" if not failed_count else "copying", final_status)
            return CopyRunResult(claim.job_id, claim.batch_id, batch_status, **values)
        except _PauseRequested:
            self._cleanup_job_temps(claim.job_id)
            self._finish_job(claim, "paused")
            self.db.execute(
                "UPDATE import_batches SET status='paused',updated_at=? WHERE batch_id=?",
                (utc_now(), claim.batch_id),
            )
            values = self._reconcile(claim.batch_id, "copying")
            self._finish_run(run_id, "interrupted", {**values, "reason": "paused"})
            _event(self.db, claim.batch_id, "copy_job_paused", "copying", "Copy paused at a safe boundary", job_id=claim.job_id)
            self.db.commit()
            return CopyRunResult(claim.job_id, claim.batch_id, "paused", **values)
        except _CancelRequested:
            self._cleanup_job_temps(claim.job_id)
            self._finish_job(claim, "cancelled")
            self.db.execute(
                "UPDATE import_batches SET status='cancelled',updated_at=? WHERE batch_id=?",
                (utc_now(), claim.batch_id),
            )
            values = self._reconcile(claim.batch_id, "copying")
            self._finish_run(run_id, "interrupted", {**values, "reason": "cancelled"})
            _event(
                self.db,
                claim.batch_id,
                "copy_job_cancelled",
                "copying",
                "Cancellation stopped future work; verified canonical objects were retained",
                job_id=claim.job_id,
            )
            self.db.commit()
            return CopyRunResult(claim.job_id, claim.batch_id, "cancelled", **values)
        except BaseException as exc:
            self._cleanup_job_temps(claim.job_id)
            error_text = f"{type(exc).__name__}: {exc}"
            self._finish_job(claim, "interrupted", error_text=error_text)
            self.db.execute(
                "UPDATE import_batches SET status='interrupted',updated_at=?,last_error_text=? WHERE batch_id=?",
                (utc_now(), error_text, claim.batch_id),
            )
            values = self._reconcile(claim.batch_id, "copying")
            self._finish_run(run_id, "interrupted", {**values, "error": error_text})
            _event(
                self.db,
                claim.batch_id,
                "copy_job_interrupted",
                "copying",
                "The job stopped unexpectedly; committed work was retained and retry evidence recorded",
                job_id=claim.job_id,
                level="error",
                evidence={"error": error_text},
            )
            self.db.commit()
            raise

    def progress_samples(self, batch_id: str, *, limit: int = 500) -> tuple[dict[str, Any], ...]:
        if not 1 <= limit <= self.config.request_budgets.max_page_size:
            raise ValueError("Progress sample limit exceeds the configured bounded page size")
        return tuple(
            dict(row)
            for row in self.db.all(
                "SELECT * FROM import_progress_samples WHERE batch_id=? ORDER BY sample_id DESC LIMIT ?",
                (batch_id, limit),
            )
        )

    def events(self, batch_id: str, *, limit: int = 500) -> tuple[dict[str, Any], ...]:
        if not 1 <= limit <= self.config.request_budgets.max_page_size:
            raise ValueError("Event limit exceeds the configured bounded page size")
        return tuple(
            dict(row)
            for row in self.db.all(
                "SELECT * FROM import_events WHERE batch_id=? ORDER BY event_id DESC LIMIT ?",
                (batch_id, limit),
            )
        )

    def errors(self, batch_id: str, *, limit: int = 500) -> tuple[dict[str, Any], ...]:
        if not 1 <= limit <= self.config.request_budgets.max_page_size:
            raise ValueError("Error limit exceeds the configured bounded page size")
        return tuple(
            dict(row)
            for row in self.db.all(
                "SELECT * FROM import_errors WHERE batch_id=? ORDER BY error_id DESC LIMIT ?",
                (batch_id, limit),
            )
        )


class LegacyImportHistoryService:
    """Backfill legacy import history only from already-persisted database/report/log evidence."""

    def __init__(self, db: ManifestDB, layout: VaultLayout):
        db.require_schema(SCHEMA_VERSION, feature_name="legacy import history")
        self.db = db
        self.layout = layout

    @staticmethod
    def _merge_recorded_metrics(target: dict[str, Any], value: Any) -> None:
        if not isinstance(value, dict):
            return
        aliases = {
            "copied": "processed_count",
            "errors": "failed_count",
            "bytes_copied": "transferred_bytes",
            "copy_bytes_verified": "verified_bytes",
            "copy_assets_processed": "processed_count",
            "copy_assets_verified": "processed_count",
        }
        for key, normalized in aliases.items():
            if key in value and value[key] is not None:
                target[normalized] = value[key]
        for nested in value.values():
            if isinstance(nested, dict):
                LegacyImportHistoryService._merge_recorded_metrics(target, nested)

    def backfill(self) -> int:
        count = 0
        for row in self.db.all(
            "SELECT * FROM runs WHERE command='import' ORDER BY started_at,run_id"
        ):
            evidence_sources = ["runs.summary_json"]
            summary = _json_load(row["summary_json"], {})
            metrics: dict[str, Any] = {}
            self._merge_recorded_metrics(metrics, summary)
            report_path = self.layout.reports / f"{row['run_id']}.json"
            if report_path.is_file():
                try:
                    report = json.loads(report_path.read_text(encoding="utf-8"))
                    evidence_sources.append(str(report_path))
                    self._merge_recorded_metrics(metrics, report)
                except (OSError, json.JSONDecodeError):
                    pass
            progress_path = self.layout.state / "progress" / f"{row['run_id']}.json"
            if progress_path.is_file():
                try:
                    progress = json.loads(progress_path.read_text(encoding="utf-8"))
                    evidence_sources.append(str(progress_path))
                    self._merge_recorded_metrics(metrics, progress)
                except (OSError, json.JSONDecodeError):
                    pass
            log_path = self.layout.logs / f"{row['run_id']}.jsonl"
            if log_path.is_file():
                try:
                    with log_path.open("r", encoding="utf-8") as handle:
                        for line in handle:
                            with contextlib.suppress(json.JSONDecodeError):
                                self._merge_recorded_metrics(metrics, json.loads(line))
                    evidence_sources.append(str(log_path))
                except OSError:
                    pass
            unavailable = {
                field: "not recorded by this version"
                for field in LEGACY_METRIC_FIELDS
                if field not in metrics
            }
            history_id = stable_id("lih1", row["run_id"])
            self.db.execute(
                """INSERT INTO legacy_import_history(
                       legacy_history_id,run_id,status,started_at,completed_at,source_root_text,summary_json,
                       metrics_json,unavailable_metrics_json,evidence_sources_json,legacy_reason,backfilled_at
                   ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
                   ON CONFLICT(run_id) DO UPDATE SET status=excluded.status,completed_at=excluded.completed_at,
                       summary_json=excluded.summary_json,metrics_json=excluded.metrics_json,
                       unavailable_metrics_json=excluded.unavailable_metrics_json,
                       evidence_sources_json=excluded.evidence_sources_json,backfilled_at=excluded.backfilled_at""",
                (
                    history_id,
                    row["run_id"],
                    row["status"],
                    row["started_at"],
                    row["completed_at"],
                    row["source_root"],
                    json_text(summary),
                    json_text(metrics),
                    json_text(unavailable),
                    json_text(evidence_sources),
                    "Legacy fields are populated only from retained run/report/progress/JSONL evidence",
                    utc_now(),
                ),
            )
            count += 1
        self.db.commit()
        return count

    def history(self, *, limit: int = 500) -> tuple[dict[str, Any], ...]:
        if not 1 <= limit <= 500:
            raise ValueError("History limit must be between 1 and 500")
        reviewed = [
            {
                "history_kind": "reviewed_import",
                **dict(row),
            }
            for row in self.db.all(
                """SELECT batch_id AS history_id,status,created_at AS started_at,copy_completed_at AS completed_at,
                          batch_root_text AS source_root_text,latest_metrics_json AS metrics_json
                   FROM import_batches ORDER BY created_at DESC,batch_id DESC LIMIT ?""",
                (limit,),
            )
        ]
        legacy = [
            {"history_kind": "legacy_import", **dict(row)}
            for row in self.db.all(
                "SELECT * FROM legacy_import_history ORDER BY started_at DESC,run_id DESC LIMIT ?",
                (limit,),
            )
        ]
        combined = reviewed + legacy
        combined.sort(key=lambda item: (str(item.get("started_at") or ""), str(item.get("history_id") or "")), reverse=True)
        return tuple(combined[:limit])


def run_reviewed_copy_job(
    config: ReviewConfig,
    job_id: str,
    *,
    worker_id: str = "local-worker",
    allow_unsafe_atime: bool = False,
    fault_hook: Callable[[str, str | None], None] | None = None,
) -> CopyRunResult:
    """Claim and run one reviewed-copy job under the existing single-writer guard."""
    layout = VaultLayout(config.vault_root)
    layout.create()
    with VaultRunLock(layout.state, "reviewed-import-copy"):
        db = ManifestDB(
            layout.database,
            required_schema_version=SCHEMA_VERSION,
            feature_name="reviewed import copying",
        )
        try:
            service = ReviewedImportService(
                db,
                layout,
                config,
                allow_unsafe_atime=allow_unsafe_atime,
            )
            claim = service.jobs.claim_job(job_id, worker_id)
            return service.run_claim(claim, fault_hook=fault_hook)
        finally:
            db.close()
