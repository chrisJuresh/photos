from __future__ import annotations

import json
import sys
import threading
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from .config import ReviewConfig
from .core import VaultLayout, VaultRunLock
from .db import SCHEMA_VERSION, ManifestDB
from .preprocess import PreprocessingService, run_preprocessing_job
from .review_backfill import (
    STAGE11_JOB_KINDS,
    control_vault_backfill,
    ensure_vault_backfill,
    recover_interrupted_stage11_jobs,
    run_stage11_job,
)
from .review_copy import run_reviewed_copy_job
from .review_imports import discover_review_manifests
from .review_junk import STAGE10_JOB_KINDS, recover_interrupted_stage10_jobs, run_stage10_job
from .review_library import STAGE7_JOB_KINDS, recover_interrupted_stage7_jobs, run_stage7_job
from .review_organization import STAGE8_JOB_KINDS, recover_interrupted_stage8_jobs, run_stage8_job
from .review_stacks import STAGE9_JOB_KINDS, recover_interrupted_stage9_jobs, run_stage9_job
from .review_stage6 import STAGE6_JOB_KINDS, run_stage6_job


SUPPORTED_WORKER_JOB_KINDS = frozenset(
    {
        "reviewed_copy",
        "review_preview",
        "asset_preprocess",
        *STAGE6_JOB_KINDS,
        *STAGE7_JOB_KINDS,
        *STAGE8_JOB_KINDS,
        *STAGE9_JOB_KINDS,
        *STAGE10_JOB_KINDS,
        *STAGE11_JOB_KINDS,
    }
)
PREPROCESS_JOB_KINDS = frozenset({"review_preview", "asset_preprocess"})


@dataclass(frozen=True)
class WorkerSummary:
    processed: int
    completed: int
    failed: int
    idle: bool
    last_job_id: str | None


def _next_job(config: ReviewConfig, allowed_kinds: frozenset[str]) -> tuple[str, str] | None:
    layout = VaultLayout(config.vault_root)
    if not layout.database.is_file():
        raise RuntimeError("The vault manifest is not initialized")
    db = ManifestDB(
        layout.database,
        required_schema_version=SCHEMA_VERSION,
        feature_name="review background worker",
    )
    try:
        placeholders = ",".join("?" for _ in allowed_kinds)
        row = db.one(
            f"""SELECT job_id,job_kind FROM background_jobs
                 WHERE job_kind IN ({placeholders}) AND status='queued' AND control_state='run'
                   AND (retry_not_before_at IS NULL OR retry_not_before_at<=strftime('%Y-%m-%dT%H:%M:%SZ','now'))
                 ORDER BY priority DESC,created_at,job_id LIMIT 1""",
            tuple(sorted(allowed_kinds)),
        )
        return None if row is None else (str(row["job_id"]), str(row["job_kind"]))
    finally:
        db.close()


def run_worker_loop(
    config: ReviewConfig,
    *,
    stop_event: threading.Event | None = None,
    once: bool = False,
    exit_when_idle: bool = False,
    poll_interval: float = 2.0,
    worker_id: str = "review-worker",
    allow_unsafe_atime: bool = False,
    exiftool: Path | None = None,
    ffprobe: Path | None = None,
    ffmpeg: Path | None = None,
    allowed_kinds: frozenset[str] = SUPPORTED_WORKER_JOB_KINDS,
) -> WorkerSummary:
    if poll_interval <= 0:
        raise ValueError("poll_interval must be greater than zero")
    if not allowed_kinds or not allowed_kinds <= SUPPORTED_WORKER_JOB_KINDS:
        raise ValueError("allowed_kinds must be a non-empty subset of supported worker jobs")
    if allowed_kinds & STAGE7_JOB_KINDS:
        recover_interrupted_stage7_jobs(config)
    if allowed_kinds & STAGE8_JOB_KINDS:
        recover_interrupted_stage8_jobs(config)
    if allowed_kinds & STAGE9_JOB_KINDS:
        recover_interrupted_stage9_jobs(config)
    if allowed_kinds & STAGE10_JOB_KINDS:
        recover_interrupted_stage10_jobs(config)
    if allowed_kinds & STAGE11_JOB_KINDS:
        recover_interrupted_stage11_jobs(config)
    processed = completed = failed = 0
    last_job_id: str | None = None
    idle = False
    while stop_event is None or not stop_event.is_set():
        job = _next_job(config, allowed_kinds)
        if job is None:
            idle = True
            if once or exit_when_idle:
                break
            stop_event.wait(poll_interval) if stop_event is not None else threading.Event().wait(poll_interval)
            continue
        idle = False
        job_id, job_kind = job
        last_job_id = job_id
        processed += 1
        try:
            if job_kind == "reviewed_copy":
                run_reviewed_copy_job(
                    config,
                    job_id,
                    worker_id=worker_id,
                    allow_unsafe_atime=allow_unsafe_atime,
                )
            elif job_kind in PREPROCESS_JOB_KINDS:
                run_preprocessing_job(
                    config,
                    job_id,
                    exiftool=exiftool,
                    ffprobe=ffprobe,
                    ffmpeg=ffmpeg,
                    allow_unsafe_atime=allow_unsafe_atime,
                    worker_id=worker_id,
                )
            elif job_kind in STAGE6_JOB_KINDS:
                run_stage6_job(
                    config,
                    job_id,
                    job_kind,
                    exiftool=exiftool,
                    allow_unsafe_atime=allow_unsafe_atime,
                )
            elif job_kind in STAGE8_JOB_KINDS:
                run_stage8_job(config, job_id, job_kind)
            elif job_kind in STAGE9_JOB_KINDS:
                run_stage9_job(config, job_id, job_kind)
            elif job_kind in STAGE10_JOB_KINDS:
                run_stage10_job(config, job_id, job_kind)
            elif job_kind in STAGE11_JOB_KINDS:
                run_stage11_job(config, job_id, job_kind)
            else:
                run_stage7_job(config, job_id, job_kind)
            completed += 1
        except Exception as exc:
            failed += 1
            print(
                json.dumps(
                    {
                        "worker_error": f"{type(exc).__name__}: {exc}",
                        "job_id": job_id,
                        "job_kind": job_kind,
                    },
                    ensure_ascii=False,
                    sort_keys=True,
                ),
                file=sys.stderr,
            )
            if not once:
                stop_event.wait(poll_interval) if stop_event is not None else threading.Event().wait(poll_interval)
        if once:
            break
    return WorkerSummary(processed, completed, failed, idle, last_job_id)


def scan_inbox(
    config: ReviewConfig,
    *,
    exiftool: Path | None = None,
    allow_unsafe_atime: bool = False,
    reuse_unchanged: bool = False,
) -> dict[str, Any]:
    summaries = discover_review_manifests(
        config,
        exiftool=exiftool,
        allow_unsafe_atime=allow_unsafe_atime,
        reuse_unchanged=reuse_unchanged,
    )
    queued: dict[str, list[str]] = {}
    if summaries:
        layout = VaultLayout(config.vault_root)
        with VaultRunLock(layout.state, "review-preview-enqueue"):
            db = ManifestDB(
                layout.database,
                required_schema_version=SCHEMA_VERSION,
                feature_name="review preview enqueue",
            )
            try:
                service = PreprocessingService(
                    db,
                    layout,
                    config,
                    exiftool=exiftool,
                    allow_unsafe_atime=allow_unsafe_atime,
                )
                for summary in summaries:
                    queued[summary.batch_id] = list(
                        service.prepare_review_batch(summary.batch_id)
                    )
            finally:
                db.close()
    return {
        "batches": [asdict(summary) for summary in summaries],
        "preview_jobs": queued,
        "media_publication": "none; discovery and preview jobs only",
    }


def preprocess_vault(
    config: ReviewConfig,
    *,
    backfill: bool = False,
    exiftool: Path | None = None,
    ffprobe: Path | None = None,
    ffmpeg: Path | None = None,
    allow_unsafe_atime: bool = False,
    worker_id: str = "preprocess-command",
) -> dict[str, Any]:
    enqueued: list[str] = []
    backfill_job_id: str | None = None
    if backfill:
        layout = VaultLayout(config.vault_root)
        with VaultRunLock(layout.state, "release-backfill-enqueue"):
            db = ManifestDB(
                layout.database,
                required_schema_version=SCHEMA_VERSION,
                feature_name="release backfill enqueue",
            )
            try:
                backfill_job = ensure_vault_backfill(db, config)
                if backfill_job["status"] == "paused":
                    backfill_job = control_vault_backfill(db, "resume")
                backfill_job_id = str(backfill_job["id"])
                db.commit()
            finally:
                db.close()
    worker = run_worker_loop(
        config,
        once=False,
        exit_when_idle=True,
        worker_id=worker_id,
        allow_unsafe_atime=allow_unsafe_atime,
        exiftool=exiftool,
        ffprobe=ffprobe,
        ffmpeg=ffmpeg,
        allowed_kinds=SUPPORTED_WORKER_JOB_KINDS if backfill else PREPROCESS_JOB_KINDS,
    )
    return {
        "backfill": backfill,
        "backfill_job_id": backfill_job_id,
        "enqueued_job_ids": enqueued,
        "worker": asdict(worker),
    }
