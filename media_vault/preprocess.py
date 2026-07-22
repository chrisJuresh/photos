from __future__ import annotations

import contextlib
import hashlib
import json
import math
import os
import re
import subprocess
import sys
import tempfile
import time
import uuid
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol

import numpy as np
from PIL import Image

from .config import ReviewConfig
from .core import (
    VaultLayout,
    VaultRunLock,
    assert_source_read_policy,
    is_within,
    json_text,
    stable_id,
    utc_now,
)
from .db import SCHEMA_VERSION, ManifestDB
from .metadata import ExifToolReader, ffprobe_metadata, normalize_metadata, tag_value


DERIVATIVE_EDGES = (192, 384, 768, 1536)
DETAIL_EDGE = 2560
REVIEW_EDGE = 384
PREPROCESS_JOB_KINDS = ("asset_preprocess", "review_preview")
REVIEWABLE_CLASSIFICATIONS = ("photo", "video", "raw", "corrupt", "unsupported")


class MetadataBatchReader(Protocol):
    def read_batch(self, paths: list[Path]) -> list[dict[str, Any]]: ...


ImageProvider = Callable[[Path], Image.Image]
FaultHook = Callable[[str, str], None]


class PreprocessError(RuntimeError):
    """A bounded preprocessing operation could not produce a trustworthy output."""


class PreprocessClaimError(RuntimeError):
    """A preprocessing worker does not own the current durable lease."""


@dataclass(frozen=True)
class PreprocessLimits:
    max_decode_pixels: int = 120_000_000
    max_source_bytes: int = 8 * 1024**3
    max_decode_seconds: float = 120.0
    subprocess_timeout_seconds: float = 180.0
    feature_long_edge: int = 1024

    def __post_init__(self) -> None:
        for name in ("max_decode_pixels", "max_source_bytes", "feature_long_edge"):
            if getattr(self, name) < 1:
                raise ValueError(f"{name} must be positive")
        for name in ("max_decode_seconds", "subprocess_timeout_seconds"):
            if getattr(self, name) <= 0:
                raise ValueError(f"{name} must be positive")


@dataclass(frozen=True)
class PreprocessClaim:
    job_id: str
    job_kind: str
    subject_type: str
    subject_id: str
    attempt: int
    claim_token: str
    worker_id: str


@dataclass(frozen=True)
class PreprocessResult:
    job_id: str
    subject_type: str
    subject_id: str
    ready_derivatives: int
    failed_derivatives: int
    metadata_status: str | None
    feature_status: str | None


@dataclass(frozen=True)
class _Representation:
    path: Path
    kind: str
    source_asset_id: str | None


def _json_load(value: str | None, default: Any) -> Any:
    if not value:
        return default
    try:
        return json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return default


def _clamp(value: float) -> float:
    return max(0.0, min(1.0, float(value)))


def _number(value: Any) -> float | None:
    if value in (None, ""):
        return None
    if isinstance(value, (int, float)):
        parsed = float(value)
        return parsed if math.isfinite(parsed) else None
    text = str(value).strip()
    fraction = re.match(r"^\s*(-?\d+(?:\.\d+)?)\s*/\s*(\d+(?:\.\d+)?)", text)
    if fraction:
        denominator = float(fraction.group(2))
        return float(fraction.group(1)) / denominator if denominator else None
    match = re.search(r"-?\d+(?:\.\d+)?", text)
    if not match:
        return None
    parsed = float(match.group(0))
    return parsed if math.isfinite(parsed) else None


def _signed_gps(value: Any, ref: Any) -> float | None:
    parsed = _number(value)
    if parsed is None:
        return None
    if str(ref or "").strip().upper() in {"S", "W"}:
        parsed = -abs(parsed)
    return parsed


def _sha256_file(path: Path) -> tuple[str, int]:
    digest = hashlib.sha256()
    size = 0
    with path.open("rb", buffering=0) as handle:
        while block := handle.read(1024 * 1024):
            digest.update(block)
            size += len(block)
    return digest.hexdigest(), size


def _orientation_candidates(metadata: dict[str, Any]) -> tuple[str, ...]:
    values: list[str] = []
    for name in (
        "DateTimeOriginal",
        "SubSecDateTimeOriginal",
        "CreateDate",
        "MediaCreateDate",
        "TrackCreateDate",
        "ContentCreateDate",
        "DateCreated",
    ):
        value = tag_value(metadata, (name,))
        if value not in (None, "") and str(value) not in values:
            values.append(str(value))
    return tuple(values)


class PreprocessingService:
    """Stage 4 durable media preprocessing.

    Source inbox files and canonical objects are read only. The only filesystem
    outputs are regenerable files below ``ReviewConfig.derivative_root``.
    Callers that execute jobs in production must hold ``VaultRunLock``; the
    lock-owning ``run_preprocessing_job`` entry point is provided below.
    """

    def __init__(
        self,
        db: ManifestDB,
        layout: VaultLayout,
        config: ReviewConfig,
        *,
        metadata_reader: MetadataBatchReader | None = None,
        exiftool: Path | None = None,
        ffprobe: Path | None = None,
        ffmpeg: Path | None = None,
        raw_preview_provider: ImageProvider | None = None,
        video_poster_provider: ImageProvider | None = None,
        limits: PreprocessLimits | None = None,
        allow_unsafe_atime: bool = False,
        lease_seconds: float = 30.0,
    ):
        db.require_schema(SCHEMA_VERSION, feature_name="preprocessing and persisted derivatives")
        if layout.root.absolute() != config.vault_root.absolute():
            raise ValueError("Review configuration vault_root must match the opened vault")
        if lease_seconds <= 0:
            raise ValueError("lease_seconds must be positive")
        self.db = db
        self.layout = layout
        self.config = config
        self.limits = limits or PreprocessLimits()
        self.allow_unsafe_atime = allow_unsafe_atime
        self.lease_seconds = lease_seconds
        self.ffprobe = ffprobe
        self.ffmpeg = ffmpeg
        self.exiftool = exiftool
        self.metadata_reader = metadata_reader
        if self.metadata_reader is None and exiftool is not None:
            self.metadata_reader = ExifToolReader(
                exiftool,
                self.layout.temp / "stage4-exiftool",
                timeout_seconds=self.limits.subprocess_timeout_seconds,
            )
        self.raw_preview_provider = raw_preview_provider or self._extract_raw_preview
        self.video_poster_provider = video_poster_provider or self._extract_video_poster
        self._validate_storage_boundaries()

    def _validate_storage_boundaries(self) -> None:
        derivative_root = self.config.derivative_root.absolute()
        if is_within(derivative_root, self.layout.objects) or is_within(self.layout.objects, derivative_root):
            raise ValueError("Derivative storage must not overlap canonical objects")
        if is_within(derivative_root, self.config.inbox_root) or is_within(
            self.config.inbox_root, derivative_root
        ):
            raise ValueError("Derivative storage must not overlap the immutable review inbox")

    def _asset(self, asset_id: str) -> Any:
        row = self.db.one("SELECT * FROM assets WHERE asset_id=?", (asset_id,))
        if row is None:
            raise KeyError(f"Unknown asset: {asset_id}")
        if row["object_status"] != "verified":
            raise ValueError(f"Asset {asset_id} has no verified canonical object")
        return row

    def _accepted_companion(self, raw_asset_id: str) -> Any | None:
        return self.db.one(
            """SELECT candidate.* FROM raw_jpeg_members anchor
               JOIN raw_jpeg_groups groups USING(raw_jpeg_group_id)
               JOIN runs origin ON origin.run_id=groups.created_run_id
               JOIN raw_jpeg_members companion USING(raw_jpeg_group_id)
               JOIN assets candidate ON candidate.asset_id=companion.asset_id
               WHERE anchor.asset_id=? AND anchor.role='raw_anchor'
                 AND companion.asset_id<>anchor.asset_id AND companion.ambiguous=0
                 AND companion.confidence_score>=0.8 AND groups.confidence_score>=0.8
                 AND origin.status='completed' AND candidate.media_kind<>'raw_image'
                 AND candidate.object_status='verified'
               ORDER BY companion.confidence_score DESC,candidate.asset_id LIMIT 1""",
            (raw_asset_id,),
        )

    def _asset_representation(self, asset: Any) -> _Representation:
        selected = asset
        kind = "image"
        if asset["media_kind"] == "raw_image":
            companion = self._accepted_companion(asset["asset_id"])
            if companion is not None:
                selected = companion
                kind = "nonraw_companion"
            else:
                kind = "raw_embedded"
        elif asset["media_kind"] == "video":
            kind = "video_poster"
        path = self.layout.root / Path(selected["object_relpath"])
        if not is_within(path, self.layout.objects) or not path.is_file():
            raise PreprocessError("Verified canonical object path is missing or outside canonical storage")
        if path.stat().st_size > self.limits.max_source_bytes:
            raise PreprocessError("Source exceeds the configured preprocessing byte limit")
        return _Representation(path, kind, selected["asset_id"])

    def _review_representation(self, item: Any) -> _Representation:
        batch = self.db.one("SELECT * FROM import_batches WHERE batch_id=?", (item["batch_id"],))
        if batch is None:
            raise KeyError(f"Unknown batch for review item {item['item_id']}")
        path = Path(item["path_text"])
        batch_root = Path(batch["batch_root_text"])
        if not is_within(path, batch_root) or not is_within(path, self.config.inbox_root):
            raise PreprocessError("Review item path is outside its immutable inbox batch")
        if not item["present"] or not path.is_file():
            raise PreprocessError("Review item is no longer present")
        stat = path.stat(follow_symlinks=False)
        if (
            stat.st_size != item["stat_size_bytes"]
            or stat.st_mtime_ns != item["stat_mtime_ns"]
            or stat.st_ctime_ns != item["stat_ctime_ns"]
        ):
            raise PreprocessError("Review item changed after discovery; rescan before preprocessing")
        if stat.st_size > self.limits.max_source_bytes:
            raise PreprocessError("Source exceeds the configured preprocessing byte limit")
        assert_source_read_policy(self.allow_unsafe_atime)
        if item["media_kind"] == "raw_image":
            kind = "raw_embedded"
        elif item["media_kind"] == "video":
            kind = "video_poster"
        else:
            kind = "review_source"
        return _Representation(path, kind, None)

    def _asset_input(self, asset: Any) -> tuple[str, _Representation]:
        representation = self._asset_representation(asset)
        source = self._asset(representation.source_asset_id or asset["asset_id"])
        identity = stable_id(
            "ppi1",
            asset["asset_id"],
            asset["sha256"],
            asset["blake3"],
            asset["sha512"],
            representation.kind,
            source["asset_id"],
            source["sha256"],
            source["blake3"],
            source["sha512"],
        )
        return identity, representation

    @staticmethod
    def _review_input(item: Any) -> str:
        return stable_id(
            "rpi1",
            item["item_id"],
            item["current_observation_id"],
            item["hashed_size_bytes"],
            item["sha256"],
            item["blake3"],
            item["sha512"],
        )

    def _upsert_derivative(
        self,
        *,
        subject_type: str,
        subject_id: str,
        asset_id: str | None,
        import_item_id: str | None,
        source_asset_id: str | None,
        source_observation_id: str | None,
        derivative_kind: str,
        representation_kind: str,
        long_edge: int,
        analyzer_version: str,
        input_identity: str,
        force: bool,
    ) -> str:
        now = utc_now()
        derivative_id = stable_id(
            "d1", subject_type, subject_id, derivative_kind, long_edge, analyzer_version, input_identity
        )
        self.db.execute(
            """UPDATE derivatives SET is_current=0,status='stale',updated_at=?
               WHERE subject_type=? AND subject_id=? AND derivative_kind=? AND long_edge=?
                 AND derivative_id<>? AND is_current=1""",
            (now, subject_type, subject_id, derivative_kind, long_edge, derivative_id),
        )
        self.db.execute(
            """INSERT INTO derivatives(
                   derivative_id,subject_type,subject_id,asset_id,import_item_id,source_asset_id,
                   source_observation_id,derivative_kind,representation_kind,long_edge,analyzer_version,
                   input_identity,status,is_current,created_at,updated_at
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,'queued',1,?,?)
               ON CONFLICT(derivative_id) DO UPDATE SET
                   is_current=1,source_asset_id=excluded.source_asset_id,
                   source_observation_id=excluded.source_observation_id,
                   representation_kind=excluded.representation_kind,
                   status=CASE WHEN ? THEN 'queued' ELSE derivatives.status END,
                   error_code=CASE WHEN ? THEN NULL ELSE derivatives.error_code END,
                   error_text=CASE WHEN ? THEN NULL ELSE derivatives.error_text END,
                   updated_at=excluded.updated_at""",
            (
                derivative_id,
                subject_type,
                subject_id,
                asset_id,
                import_item_id,
                source_asset_id,
                source_observation_id,
                derivative_kind,
                representation_kind,
                long_edge,
                analyzer_version,
                input_identity,
                now,
                now,
                int(force),
                int(force),
                int(force),
            ),
        )
        return derivative_id

    def _upsert_asset_state(
        self,
        table: str,
        id_column: str,
        prefix: str,
        asset_id: str,
        analyzer_version: str,
        input_identity: str,
        source_asset_id: str | None,
        *,
        force: bool,
    ) -> str:
        if table not in {"asset_extended_metadata", "asset_features"}:
            raise ValueError("Unexpected preprocessing state table")
        record_id = stable_id(prefix, asset_id, analyzer_version, input_identity)
        now = utc_now()
        self.db.execute(
            f"""UPDATE {table} SET is_current=0,status='stale',updated_at=?
                WHERE asset_id=? AND {id_column}<>? AND is_current=1""",
            (now, asset_id, record_id),
        )
        self.db.execute(
            f"""INSERT INTO {table}(
                    {id_column},asset_id,analyzer_version,input_identity,status,is_current,
                    display_source_asset_id,created_at,updated_at
                ) VALUES(?,?,?,?,'queued',1,?,?,?)
                ON CONFLICT({id_column}) DO UPDATE SET
                    is_current=1,display_source_asset_id=excluded.display_source_asset_id,
                    status=CASE WHEN ? THEN 'queued' ELSE {table}.status END,
                    error_code=CASE WHEN ? THEN NULL ELSE {table}.error_code END,
                    error_text=CASE WHEN ? THEN NULL ELSE {table}.error_text END,
                    updated_at=excluded.updated_at""",
            (
                record_id,
                asset_id,
                analyzer_version,
                input_identity,
                source_asset_id,
                now,
                now,
                int(force),
                int(force),
                int(force),
            ),
        )
        return record_id

    def _enqueue_job(
        self,
        *,
        job_id: str,
        job_kind: str,
        subject_type: str,
        subject_id: str,
        progress: dict[str, Any],
        force: bool,
        max_attempts: int,
        priority: int | None = None,
    ) -> None:
        if max_attempts < 1:
            raise ValueError("max_attempts must be at least 1")
        now = utc_now()
        row = self.db.one("SELECT status,attempt FROM background_jobs WHERE job_id=?", (job_id,))
        if row is None:
            self.db.execute(
                """INSERT INTO background_jobs(
                       job_id,job_kind,subject_type,subject_id,phase,status,attempt,created_at,
                       heartbeat_at,progress_json,priority,max_attempts,control_state,queued_at,updated_at
                   ) VALUES(?,?,?,?,?,'queued',0,?,?,?,?,?,'run',?,?)""",
                (
                    job_id,
                    job_kind,
                    subject_type,
                    subject_id,
                    "preparing_previews" if job_kind == "review_preview" else "preprocessing",
                    now,
                    now,
                    json_text(progress),
                    priority if priority is not None else 60 if job_kind == "review_preview" else 40,
                    max_attempts,
                    now,
                    now,
                ),
            )
        elif force or row["status"] in {"failed", "interrupted", "cancelled"}:
            retry_limit = int(row["attempt"]) + max_attempts
            self.db.execute(
                """UPDATE background_jobs SET status='queued',control_state='run',
                       claim_token=NULL,claimed_by=NULL,lease_expires_at=NULL,completed_at=NULL,
                       error_text=NULL,queued_at=?,updated_at=?,progress_json=?,max_attempts=? WHERE job_id=?""",
                (now, now, json_text(progress), retry_limit, job_id),
            )

    def enqueue_asset(
        self,
        asset_id: str,
        *,
        force: bool = False,
        max_attempts: int = 3,
        priority: int | None = None,
    ) -> str:
        asset = self._asset(asset_id)
        input_identity, representation = self._asset_input(asset)
        versions = self.config.analyzer_versions
        derivative_ids = [
            self._upsert_derivative(
                subject_type="asset",
                subject_id=asset_id,
                asset_id=asset_id,
                import_item_id=None,
                source_asset_id=representation.source_asset_id,
                source_observation_id=None,
                derivative_kind="thumbnail",
                representation_kind=representation.kind,
                long_edge=edge,
                analyzer_version=versions.vault_derivative,
                input_identity=input_identity,
                force=force,
            )
            for edge in DERIVATIVE_EDGES
        ]
        metadata_id = self._upsert_asset_state(
            "asset_extended_metadata",
            "metadata_id",
            "aem1",
            asset_id,
            versions.extended_metadata,
            input_identity,
            representation.source_asset_id,
            force=force,
        )
        feature_id = self._upsert_asset_state(
            "asset_features",
            "feature_id",
            "af1",
            asset_id,
            versions.quality_features,
            input_identity,
            representation.source_asset_id,
            force=force,
        )
        job_id = stable_id(
            "job1",
            "asset_preprocess",
            asset_id,
            input_identity,
            versions.vault_derivative,
            versions.extended_metadata,
            versions.quality_features,
        )
        self._enqueue_job(
            job_id=job_id,
            job_kind="asset_preprocess",
            subject_type="asset",
            subject_id=asset_id,
            progress={
                "input_identity": input_identity,
                "derivative_ids": derivative_ids,
                "metadata_id": metadata_id,
                "feature_id": feature_id,
            },
            force=force,
            max_attempts=max_attempts,
            priority=priority,
        )
        self.db.commit()
        return job_id

    def enqueue_review_item(self, item_id: str, *, force: bool = False, max_attempts: int = 3) -> str:
        item = self.db.one("SELECT * FROM import_items WHERE item_id=?", (item_id,))
        if item is None:
            raise KeyError(f"Unknown review item: {item_id}")
        if item["classification"] not in REVIEWABLE_CLASSIFICATIONS:
            raise ValueError(f"Review previews are not applicable to {item['classification']}")
        if item["hash_status"] != "verified" or not item["current_observation_id"]:
            raise ValueError("Review preview requires a verified, current discovery observation")
        input_identity = self._review_input(item)
        version = self.config.analyzer_versions.review_derivative
        representation = (
            "raw_embedded"
            if item["media_kind"] == "raw_image"
            else "video_poster"
            if item["media_kind"] == "video"
            else "review_source"
        )
        derivative_id = self._upsert_derivative(
            subject_type="import_item",
            subject_id=item_id,
            asset_id=None,
            import_item_id=item_id,
            source_asset_id=None,
            source_observation_id=item["current_observation_id"],
            derivative_kind="review_preview",
            representation_kind=representation,
            long_edge=REVIEW_EDGE,
            analyzer_version=version,
            input_identity=input_identity,
            force=force,
        )
        job_id = stable_id("job1", "review_preview", item_id, input_identity, version)
        self._enqueue_job(
            job_id=job_id,
            job_kind="review_preview",
            subject_type="import_item",
            subject_id=item_id,
            progress={
                "batch_id": item["batch_id"],
                "input_identity": input_identity,
                "derivative_ids": [derivative_id],
            },
            force=force,
            max_attempts=max_attempts,
        )
        self.db.commit()
        return job_id

    def prepare_review_batch(self, batch_id: str, *, force: bool = False) -> tuple[str, ...]:
        batch = self.db.one("SELECT * FROM import_batches WHERE batch_id=?", (batch_id,))
        if batch is None:
            raise KeyError(f"Unknown import batch: {batch_id}")
        if not batch["traversal_complete"]:
            raise ValueError("Review preview preparation requires complete discovery")
        rows = self.db.all(
            """SELECT * FROM import_items WHERE batch_id=? AND present=1 AND entry_kind='file'
                 AND effective_decision='include'
                 AND classification IN ('photo','video','raw','corrupt','unsupported')
               ORDER BY relative_path_text COLLATE BINARY,item_id""",
            (batch_id,),
        )
        jobs = tuple(self.enqueue_review_item(row["item_id"], force=force) for row in rows)
        now = utc_now()
        self.db.execute(
            """UPDATE import_batches SET status='preparing_previews',review_ready_at=NULL,
                   updated_at=?,last_error_text=NULL WHERE batch_id=?""",
            (now, batch_id),
        )
        self.db.execute(
            "UPDATE import_folder_progress SET phase='preparing_previews',updated_at=? WHERE batch_id=?",
            (now, batch_id),
        )
        self.db.commit()
        self._finalize_review_batch(batch_id)
        return jobs

    def review_batch_readiness(self, batch_id: str) -> dict[str, int | bool]:
        row = self.db.one(
            """SELECT COUNT(*) AS expected,
                      SUM(CASE WHEN d.status='ready' THEN 1 ELSE 0 END) AS ready,
                      SUM(CASE WHEN d.status='error' THEN 1 ELSE 0 END) AS failed,
                      SUM(CASE WHEN d.derivative_id IS NULL OR d.status NOT IN ('ready','error') THEN 1 ELSE 0 END)
                          AS pending
               FROM import_items i LEFT JOIN derivatives d
                 ON d.import_item_id=i.item_id AND d.is_current=1 AND d.derivative_kind='review_preview'
               WHERE i.batch_id=? AND i.present=1 AND i.entry_kind='file'
                 AND i.effective_decision='include'
                 AND i.classification IN ('photo','video','raw','corrupt','unsupported')""",
            (batch_id,),
        )
        assert row is not None
        values = {name: int(row[name] or 0) for name in ("expected", "ready", "failed", "pending")}
        return {**values, "review_ready": values["pending"] == 0}

    def _finalize_review_batch(self, batch_id: str) -> None:
        readiness = self.review_batch_readiness(batch_id)
        if not readiness["review_ready"]:
            return
        now = utc_now()
        self.db.execute(
            """UPDATE import_batches SET status='awaiting_review',review_ready_at=?,updated_at=?
               WHERE batch_id=? AND status='preparing_previews'""",
            (now, now, batch_id),
        )
        self.db.execute(
            "UPDATE import_folder_progress SET phase='awaiting_review',updated_at=? WHERE batch_id=?",
            (now, batch_id),
        )
        self.db.commit()

    def recover_expired_leases(self) -> tuple[str, ...]:
        now = utc_now()
        rows = self.db.all(
            """SELECT * FROM background_jobs WHERE job_kind IN ('asset_preprocess','review_preview')
                 AND status='running' AND lease_expires_at IS NOT NULL AND lease_expires_at<=?
               ORDER BY lease_expires_at,job_id""",
            (now,),
        )
        recovered: list[str] = []
        for row in rows:
            retry = int(row["attempt"]) < int(row["max_attempts"])
            self.db.execute(
                """UPDATE background_job_attempts SET status='interrupted',completed_at=?,error_text=?,retryable=?
                   WHERE job_id=? AND attempt=? AND status='running'""",
                (now, "Preprocessing worker lease expired", int(retry), row["job_id"], row["attempt"]),
            )
            self.db.execute(
                """UPDATE background_jobs SET status=?,claim_token=NULL,claimed_by=NULL,lease_expires_at=NULL,
                       heartbeat_at=?,updated_at=?,error_text=? WHERE job_id=?""",
                (
                    "queued" if retry else "failed",
                    now,
                    now,
                    "Preprocessing worker lease expired; committed outputs were retained",
                    row["job_id"],
                ),
            )
            recovered.append(row["job_id"])
        if rows:
            self.db.commit()
        return tuple(recovered)

    def _claim_row(self, row: Any, worker_id: str) -> PreprocessClaim:
        attempt = int(row["attempt"]) + 1
        if attempt > int(row["max_attempts"]):
            raise PreprocessClaimError(f"Job {row['job_id']} exhausted its retry attempts")
        token = uuid.uuid4().hex
        now = utc_now()
        lease_epoch = time.time() + self.lease_seconds
        lease = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(lease_epoch)) + "Z"
        cursor = self.db.execute(
            """UPDATE background_jobs SET status='running',attempt=?,claim_token=?,claimed_by=?,
                   lease_expires_at=?,started_at=COALESCE(started_at,?),heartbeat_at=?,updated_at=?,error_text=NULL
               WHERE job_id=? AND status='queued' AND control_state='run'""",
            (attempt, token, worker_id, lease, now, now, now, row["job_id"]),
        )
        if cursor.rowcount != 1:
            self.db.conn.rollback()
            raise PreprocessClaimError(f"Job {row['job_id']} is no longer claimable")
        self.db.execute(
            """INSERT INTO background_job_attempts(
                   job_id,attempt,claim_token,worker_id,status,started_at,heartbeat_at
               ) VALUES(?,?,?,?,'running',?,?)""",
            (row["job_id"], attempt, token, worker_id, now, now),
        )
        self.db.commit()
        return PreprocessClaim(
            row["job_id"], row["job_kind"], row["subject_type"], row["subject_id"], attempt, token, worker_id
        )

    def claim_job(self, job_id: str, worker_id: str) -> PreprocessClaim:
        self.recover_expired_leases()
        self.db.execute("BEGIN IMMEDIATE")
        row = self.db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,))
        if row is None:
            self.db.conn.rollback()
            raise KeyError(f"Unknown background job: {job_id}")
        if row["job_kind"] not in PREPROCESS_JOB_KINDS:
            self.db.conn.rollback()
            raise ValueError(f"Job {job_id} is not a preprocessing job")
        if row["status"] != "queued" or row["control_state"] != "run":
            self.db.conn.rollback()
            raise PreprocessClaimError(f"Job {job_id} is {row['status']} and cannot be claimed")
        return self._claim_row(row, worker_id)

    def claim_next(self, worker_id: str) -> PreprocessClaim | None:
        self.recover_expired_leases()
        self.db.execute("BEGIN IMMEDIATE")
        row = self.db.one(
            """SELECT * FROM background_jobs
               WHERE job_kind IN ('review_preview','asset_preprocess')
                 AND status='queued' AND control_state='run'
                 AND (retry_not_before_at IS NULL OR retry_not_before_at<=?)
               ORDER BY priority DESC,created_at,job_id LIMIT 1""",
            (utc_now(),),
        )
        if row is None:
            self.db.conn.rollback()
            return None
        return self._claim_row(row, worker_id)

    def _ensure_claim(self, claim: PreprocessClaim) -> None:
        row = self.db.one(
            "SELECT status,attempt,claim_token FROM background_jobs WHERE job_id=?", (claim.job_id,)
        )
        if (
            row is None
            or row["status"] != "running"
            or int(row["attempt"]) != claim.attempt
            or row["claim_token"] != claim.claim_token
        ):
            raise PreprocessClaimError(f"Worker lease is no longer current for {claim.job_id}")

    def _phase(self, claim: PreprocessClaim, phase: str, progress: dict[str, Any]) -> None:
        self._ensure_claim(claim)
        now = utc_now()
        self.db.execute(
            """UPDATE background_jobs SET phase=?,heartbeat_at=?,updated_at=?,progress_json=? WHERE job_id=?""",
            (phase, now, now, json_text(progress), claim.job_id),
        )
        self.db.execute(
            "UPDATE background_job_attempts SET heartbeat_at=? WHERE job_id=? AND attempt=?",
            (now, claim.job_id, claim.attempt),
        )
        self.db.commit()

    def _extract_raw_preview(self, source: Path) -> Image.Image:
        if self.exiftool is None:
            raise PreprocessError("ExifTool is unavailable for RAW embedded preview extraction")
        errors: list[str] = []
        for tag in ("-PreviewImage", "-JpgFromRaw", "-ThumbnailImage"):
            proc = subprocess.run(
                [str(self.exiftool), "-b", tag, str(source)],
                capture_output=True,
                check=False,
                timeout=self.limits.subprocess_timeout_seconds,
            )
            if proc.returncode == 0 and proc.stdout:
                if len(proc.stdout) > self.limits.max_source_bytes:
                    errors.append(f"{tag}: embedded image exceeds preprocessing byte limit")
                    continue
                temp_root = self.config.derivative_root / ".tmp"
                temp_root.mkdir(parents=True, exist_ok=True)
                fd, raw = tempfile.mkstemp(prefix="raw-preview-", suffix=".embedded", dir=temp_root)
                extracted = Path(raw)
                try:
                    with os.fdopen(fd, "wb") as handle:
                        handle.write(proc.stdout)
                        handle.flush()
                        os.fsync(handle.fileno())
                    return self._decode_file_in_subprocess(extracted)
                except Exception as exc:
                    errors.append(f"{tag}: {type(exc).__name__}: {exc}")
                finally:
                    with contextlib.suppress(FileNotFoundError):
                        extracted.unlink()
            else:
                errors.append(f"{tag}: no embedded image")
        raise PreprocessError("RAW embedded preview unavailable: " + "; ".join(errors))

    def _extract_video_poster(self, source: Path) -> Image.Image:
        if self.ffmpeg is None:
            raise PreprocessError("FFmpeg is unavailable for video poster extraction")
        temp_root = self.config.derivative_root / ".tmp"
        temp_root.mkdir(parents=True, exist_ok=True)
        fd, raw = tempfile.mkstemp(prefix="video-poster-", suffix=".png", dir=temp_root)
        os.close(fd)
        target = Path(raw)
        with contextlib.suppress(FileNotFoundError):
            target.unlink()
        try:
            proc = subprocess.run(
                [
                    str(self.ffmpeg),
                    "-v",
                    "error",
                    "-ss",
                    "1",
                    "-i",
                    str(source),
                    "-frames:v",
                    "1",
                    "-vf",
                    f"scale={self.limits.feature_long_edge}:{self.limits.feature_long_edge}:force_original_aspect_ratio=decrease",
                    "-y",
                    str(target),
                ],
                capture_output=True,
                check=False,
                timeout=self.limits.subprocess_timeout_seconds,
            )
            if proc.returncode != 0 or not target.is_file():
                detail = proc.stderr.decode("utf-8", "replace")[:1000]
                raise PreprocessError(detail or "FFmpeg produced no video poster")
            return self._decode_file_in_subprocess(target)
        finally:
            with contextlib.suppress(FileNotFoundError):
                target.unlink()

    def _decode_file_in_subprocess(self, source: Path) -> Image.Image:
        temp_root = self.config.derivative_root / ".tmp"
        temp_root.mkdir(parents=True, exist_ok=True)
        fd, raw = tempfile.mkstemp(prefix="decoded-", suffix=".png", dir=temp_root)
        os.close(fd)
        decoded = Path(raw)
        with contextlib.suppress(FileNotFoundError):
            decoded.unlink()
        try:
            try:
                proc = subprocess.run(
                    [
                        sys.executable,
                        "-m",
                        "media_vault._decode_worker",
                        str(source),
                        str(decoded),
                        str(self.limits.max_decode_pixels),
                    ],
                    capture_output=True,
                    check=False,
                    timeout=self.limits.max_decode_seconds,
                )
            except subprocess.TimeoutExpired as exc:
                raise PreprocessError(
                    f"Decode time limit exceeded: {self.limits.max_decode_seconds:.3f}s"
                ) from exc
            if proc.returncode != 0 or not decoded.is_file():
                detail = proc.stderr.decode("utf-8", "replace")[:1000]
                raise PreprocessError(f"Decode failed: {detail or 'isolated decoder produced no image'}")
            with Image.open(decoded) as opened:
                return opened.convert("RGB").copy()
        finally:
            with contextlib.suppress(FileNotFoundError):
                decoded.unlink()

    def _load_image(self, representation: _Representation) -> Image.Image:
        started = time.monotonic()
        try:
            if representation.kind == "raw_embedded":
                image = self.raw_preview_provider(representation.path)
            elif representation.kind == "video_poster":
                image = self.video_poster_provider(representation.path)
            else:
                image = self._decode_file_in_subprocess(representation.path)
            pixels = int(image.width) * int(image.height)
            if pixels > self.limits.max_decode_pixels:
                image.close()
                raise PreprocessError(f"Decode pixel limit exceeded: {pixels} > {self.limits.max_decode_pixels}")
            elapsed = time.monotonic() - started
            if elapsed > self.limits.max_decode_seconds:
                image.close()
                raise PreprocessError(
                    f"Decode time limit exceeded: {elapsed:.3f}s > {self.limits.max_decode_seconds:.3f}s"
                )
            return image
        except PreprocessError:
            raise
        except Exception as exc:
            raise PreprocessError(f"Decode failed: {type(exc).__name__}: {exc}") from exc

    def _derivative_relative_path(self, row: Any) -> Path:
        namespace = "review" if row["subject_type"] == "import_item" else "vault"
        leaf = f"{row['derivative_id']}.webp"
        return Path(namespace) / row["derivative_id"][2:4] / row["derivative_id"][4:6] / leaf

    def _publish_derivative(self, row: Any, source_image: Image.Image) -> tuple[int, int, str, int, int, str]:
        edge = int(row["long_edge"])
        image = source_image.copy()
        try:
            image.thumbnail((edge, edge), Image.Resampling.LANCZOS)
            relative = self._derivative_relative_path(row)
            target = self.config.derivative_root / relative
            if not is_within(target, self.config.derivative_root):
                raise PreprocessError("Generated derivative path escaped derivative storage")
            target.parent.mkdir(parents=True, exist_ok=True)
            temp_root = self.config.derivative_root / ".tmp"
            temp_root.mkdir(parents=True, exist_ok=True)
            fd, raw = tempfile.mkstemp(prefix=f"{row['derivative_id']}.", suffix=".partial", dir=temp_root)
            os.close(fd)
            temp = Path(raw)
            try:
                image.save(temp, format="WEBP", quality=92 if edge == DETAIL_EDGE else 84, method=6)
                with temp.open("rb+") as handle:
                    handle.flush()
                    os.fsync(handle.fileno())
                checksum, size = _sha256_file(temp)
                os.replace(temp, target)
                verified, verified_size = _sha256_file(target)
                if verified != checksum or verified_size != size:
                    raise PreprocessError("Published derivative checksum verification failed")
                return image.width, image.height, checksum, size, target.stat().st_mtime_ns, str(relative)
            finally:
                with contextlib.suppress(FileNotFoundError):
                    temp.unlink()
        finally:
            image.close()

    def _ready_derivative_valid(self, row: Any) -> bool:
        if row["status"] != "ready" or not row["relative_path_text"] or not row["checksum_sha256"]:
            return False
        path = self.config.derivative_root / Path(row["relative_path_text"])
        if not is_within(path, self.config.derivative_root) or not path.is_file():
            return False
        checksum, size = _sha256_file(path)
        return checksum == row["checksum_sha256"] and size == row["byte_size"]

    def _process_derivative(self, derivative_id: str, image: Image.Image | None, error: Exception | None) -> str:
        row = self.db.one("SELECT * FROM derivatives WHERE derivative_id=?", (derivative_id,))
        if row is None:
            raise KeyError(f"Unknown derivative: {derivative_id}")
        if error is None and self._ready_derivative_valid(row):
            return "ready"
        now = utc_now()
        self.db.execute(
            "UPDATE derivatives SET status='processing',started_at=?,updated_at=?,error_code=NULL,error_text=NULL WHERE derivative_id=?",
            (now, now, derivative_id),
        )
        self.db.commit()
        try:
            if error is not None:
                raise error
            assert image is not None
            width, height, checksum, size, file_mtime_ns, relative = self._publish_derivative(row, image)
            completed = utc_now()
            self.db.execute(
                """UPDATE derivatives SET status='ready',width=?,height=?,source_width=?,source_height=?,
                       mime_type='image/webp',checksum_sha256=?,byte_size=?,relative_path_text=?,
                       file_mtime_ns=?,error_code=NULL,error_text=NULL,completed_at=?,updated_at=?
                   WHERE derivative_id=?""",
                (
                    width,
                    height,
                    image.width,
                    image.height,
                    checksum,
                    size,
                    relative,
                    file_mtime_ns,
                    completed,
                    completed,
                    derivative_id,
                ),
            )
            self.db.commit()
            return "ready"
        except Exception as exc:
            failed = utc_now()
            self.db.execute(
                """UPDATE derivatives SET status='error',error_code='derivative_generation_failed',
                       error_text=?,completed_at=?,updated_at=? WHERE derivative_id=?""",
                (f"{type(exc).__name__}: {exc}", failed, failed, derivative_id),
            )
            self.db.commit()
            return "error"

    def _metadata_values(self, asset: Any, representation: _Representation) -> tuple[dict[str, Any], str | None]:
        raw = _json_load(asset["metadata_json"], {})
        error: str | None = None
        if self.metadata_reader is not None:
            try:
                values = self.metadata_reader.read_batch([representation.path])
                if len(values) != 1 or not isinstance(values[0], dict):
                    raise PreprocessError("Metadata reader did not return exactly one object")
                raw = {**raw, **values[0]}
            except Exception as exc:
                error = f"{type(exc).__name__}: {exc}"
        if asset["media_kind"] == "video":
            raw = {**raw, **ffprobe_metadata(self.ffprobe, representation.path)}
        metadata_error = tag_value(raw, ("Error",))
        if metadata_error:
            error = str(metadata_error)
        return raw, error

    def _edit_likelihood(self, raw: dict[str, Any], path: Path) -> tuple[float, list[str]]:
        evidence: list[str] = []
        software = tag_value(raw, ("Software", "CreatorTool", "ProcessingSoftware"))
        if software:
            evidence.append(f"software:{software}")
        name = path.stem.casefold()
        for marker in ("edit", "edited", "export", "final", "retouch", "developed"):
            if marker in name:
                evidence.append(f"filename:{marker}")
                break
        history = tag_value(raw, ("History", "DerivedFrom", "DocumentAncestors"))
        if history:
            evidence.append("metadata_edit_history")
        return _clamp(0.45 * bool(software) + 0.35 * any(v.startswith("filename:") for v in evidence) + 0.4 * bool(history)), evidence

    def _process_metadata(
        self,
        metadata_id: str,
        asset: Any,
        representation: _Representation,
        image: Image.Image | None,
    ) -> tuple[str, float]:
        row = self.db.one("SELECT * FROM asset_extended_metadata WHERE metadata_id=?", (metadata_id,))
        if row is None:
            raise KeyError(f"Unknown metadata output: {metadata_id}")
        if row["status"] == "ready":
            return "ready", float(row["edit_likelihood"] or 0.0)
        started = utc_now()
        self.db.execute(
            "UPDATE asset_extended_metadata SET status='processing',started_at=?,updated_at=? WHERE metadata_id=?",
            (started, started, metadata_id),
        )
        self.db.commit()
        raw, metadata_error = self._metadata_values(asset, representation)
        normalized = normalize_metadata(raw)
        capture_values = _orientation_candidates(raw)
        edit_likelihood, edit_history = self._edit_likelihood(raw, representation.path)
        source_rows = self.db.all(
            """SELECT sf.path_text FROM asset_sources aus
               JOIN source_versions sv ON sv.source_version_id=aus.source_version_id
               JOIN source_files sf ON sf.source_file_id=sv.source_file_id
               WHERE aus.asset_id=? ORDER BY sf.path_text COLLATE BINARY LIMIT 100""",
            (asset["asset_id"],),
        )
        warnings_list = list(normalized.get("warnings") or [])
        if metadata_error:
            warnings_list.append(metadata_error)
        gps_lat = _signed_gps(tag_value(raw, ("GPSLatitude",)), tag_value(raw, ("GPSLatitudeRef",)))
        gps_lon = _signed_gps(tag_value(raw, ("GPSLongitude",)), tag_value(raw, ("GPSLongitudeRef",)))
        completed = utc_now()
        status = "error" if metadata_error else "ready"
        width = image.width if image is not None else normalized.get("width") or asset["width"]
        height = image.height if image is not None else normalized.get("height") or asset["height"]
        self.db.execute(
            """UPDATE asset_extended_metadata SET status=?,capture_time_text=?,capture_time_source=?,
                   capture_time_ambiguous=?,gps_latitude=?,gps_longitude=?,gps_precision_meters=?,
                   camera_make=?,camera_model=?,camera_serial=?,lens_model=?,iso_value=?,aperture_f_number=?,
                   exposure_time_seconds=?,focal_length_mm=?,exposure_compensation_ev=?,width=?,height=?,
                   orientation_text=?,duration_seconds=?,video_codec=?,audio_codec=?,software_text=?,
                   edit_history_json=?,edit_likelihood=?,import_time_text=?,source_folder_evidence_json=?,
                   raw_metadata_json=?,warnings_json=?,error_code=?,error_text=?,completed_at=?,updated_at=?
               WHERE metadata_id=?""",
            (
                status,
                normalized.get("capture_time_text") or asset["capture_time_text"],
                normalized.get("capture_time_source") or asset["capture_time_source"],
                int(len(capture_values) > 1),
                gps_lat,
                gps_lon,
                _number(tag_value(raw, ("GPSHPositioningError", "GPSHorizontalAccuracy"))),
                normalized.get("camera_make") or asset["camera_make"],
                normalized.get("camera_model") or asset["camera_model"],
                normalized.get("camera_serial") or asset["camera_serial"],
                normalized.get("lens_model") or asset["lens_model"],
                _number(tag_value(raw, ("ISO", "ISOValue"))),
                _number(tag_value(raw, ("FNumber", "Aperture"))),
                _number(tag_value(raw, ("ExposureTime", "ShutterSpeed"))),
                _number(tag_value(raw, ("FocalLength",))),
                _number(tag_value(raw, ("ExposureCompensation", "ExposureCompensationValue"))),
                width,
                height,
                normalized.get("orientation_text") or asset["orientation_text"],
                normalized.get("duration_seconds") or asset["duration_seconds"],
                tag_value(raw, ("FFprobe:VideoCodec",)) or normalized.get("video_codec") or asset["video_codec"],
                tag_value(raw, ("FFprobe:AudioCodec",)) or normalized.get("audio_codec") or asset["audio_codec"],
                tag_value(raw, ("Software", "CreatorTool", "ProcessingSoftware")),
                json_text(edit_history),
                edit_likelihood,
                asset["created_at"],
                json_text([str(Path(source["path_text"]).parent) for source in source_rows]),
                json_text(raw),
                json_text(warnings_list),
                "metadata_extraction_failed" if metadata_error else None,
                metadata_error,
                completed,
                completed,
                metadata_id,
            ),
        )
        self.db.commit()
        return status, edit_likelihood

    def _feature_values(self, image: Image.Image, edit_likelihood: float) -> dict[str, Any]:
        sample = image.copy()
        try:
            sample.thumbnail((self.limits.feature_long_edge, self.limits.feature_long_edge), Image.Resampling.LANCZOS)
            gray = np.asarray(sample.convert("L"), dtype=np.float64) / 255.0
        finally:
            sample.close()
        counts, _edges = np.histogram(gray, bins=32, range=(0.0, 1.0))
        probabilities = counts.astype(np.float64) / max(1, int(counts.sum()))
        nonzero = probabilities[probabilities > 0]
        entropy = float(-(nonzero * np.log2(nonzero)).sum() / math.log2(32))
        gx = np.diff(gray, axis=1) if gray.shape[1] > 1 else np.zeros_like(gray)
        gy = np.diff(gray, axis=0) if gray.shape[0] > 1 else np.zeros_like(gray)
        grad_x = float(np.mean(np.abs(gx)))
        grad_y = float(np.mean(np.abs(gy)))
        sharpness = _clamp((grad_x + grad_y) * 7.5)
        directional = _clamp(abs(grad_x - grad_y) / max(1e-9, grad_x + grad_y))
        under = float(np.mean(gray <= 0.08))
        over = float(np.mean(gray >= 0.92))
        clipping = float(np.mean(gray >= 0.99))
        near_black = float(np.mean(gray <= 0.02))
        blankness = _clamp(1.0 - float(np.std(gray)) * 5.0)
        low_information = _clamp(1.0 - entropy)
        obstruction = _clamp(near_black * 0.65 + blankness * 0.35)
        block_samples: list[float] = []
        if gray.shape[1] > 8:
            boundaries = np.arange(8, gray.shape[1], 8)
            block_samples.append(float(np.mean(np.abs(gray[:, boundaries] - gray[:, boundaries - 1]))))
        if gray.shape[0] > 8:
            boundaries = np.arange(8, gray.shape[0], 8)
            block_samples.append(float(np.mean(np.abs(gray[boundaries, :] - gray[boundaries - 1, :]))))
        ordinary = max(1e-9, (grad_x + grad_y) / 2)
        blockiness = _clamp((sum(block_samples) / max(1, len(block_samples))) / ordinary - 1.0)
        pixels = image.width * image.height
        long_edge = max(image.width, image.height)
        resolution_class = (
            "tiny"
            if pixels < 250_000 or long_edge < 512
            else "small"
            if pixels < 2_000_000
            else "standard"
            if pixels < 12_000_000
            else "high"
        )
        thumbnail_likelihood = _clamp(
            (1.0 if long_edge < 512 else 0.5 if long_edge < 1024 else 0.0)
            + (0.3 if pixels < 500_000 else 0.0)
        )
        motion = _clamp((1.0 - sharpness) * (0.45 + directional * 0.55))
        focus_deficit = _clamp(1.0 - sharpness)
        exposure_penalty = _clamp(max(under, over) + clipping * 0.5)
        quality = _clamp(
            sharpness * 0.45
            + entropy * 0.25
            + (1.0 - exposure_penalty) * 0.2
            + (1.0 - blockiness) * 0.1
        )
        return {
            "width": image.width,
            "height": image.height,
            "luminance_histogram_json": json_text(counts.tolist()),
            "luminance_entropy": entropy,
            "sharpness_score": sharpness,
            "focus_deficit_score": focus_deficit,
            "directional_shake_score": directional,
            "motion_score": motion,
            "underexposure_score": under,
            "overexposure_score": over,
            "highlight_clipping_score": clipping,
            "near_black_score": near_black,
            "blankness_score": blankness,
            "obstruction_score": obstruction,
            "low_information_score": low_information,
            "blockiness_score": blockiness,
            "corruption_score": 0.0,
            "incomplete_decode": 0,
            "resolution_class": resolution_class,
            "thumbnail_likelihood": thumbnail_likelihood,
            "edit_likelihood": edit_likelihood,
            "composite_quality_score": quality,
            "cover_ranking_inputs_json": json_text(
                {
                    "sharpness": sharpness,
                    "motion": motion,
                    "underexposure": under,
                    "overexposure": over,
                    "highlight_clipping": clipping,
                    "corruption": 0.0,
                    "resolution_class": resolution_class,
                    "edit_likelihood": edit_likelihood,
                }
            ),
            "evidence_json": json_text(
                {
                    "method": "transparent-quality-primitives-v1",
                    "feature_sample_size": [int(gray.shape[1]), int(gray.shape[0])],
                    "histogram_bins": 32,
                    "normalization": "scores clamped to [0,1]",
                }
            ),
        }

    def _process_features(
        self,
        feature_id: str,
        image: Image.Image | None,
        image_error: Exception | None,
        edit_likelihood: float,
    ) -> str:
        row = self.db.one("SELECT * FROM asset_features WHERE feature_id=?", (feature_id,))
        if row is None:
            raise KeyError(f"Unknown feature output: {feature_id}")
        if row["status"] == "ready":
            return "ready"
        started = utc_now()
        self.db.execute(
            "UPDATE asset_features SET status='processing',started_at=?,updated_at=? WHERE feature_id=?",
            (started, started, feature_id),
        )
        self.db.commit()
        completed = utc_now()
        if image_error is not None or image is None:
            message = f"{type(image_error).__name__}: {image_error}" if image_error else "No decoded image"
            self.db.execute(
                """UPDATE asset_features SET status='error',corruption_score=1.0,incomplete_decode=1,
                       edit_likelihood=?,cover_ranking_inputs_json=?,evidence_json=?,
                       error_code='feature_decode_failed',error_text=?,completed_at=?,updated_at=?
                   WHERE feature_id=?""",
                (
                    edit_likelihood,
                    json_text({"corruption": 1.0, "edit_likelihood": edit_likelihood}),
                    json_text({"method": "transparent-quality-primitives-v1", "decode_error": message}),
                    message,
                    completed,
                    completed,
                    feature_id,
                ),
            )
            self.db.commit()
            return "error"
        values = self._feature_values(image, edit_likelihood)
        assignments = ",".join(f"{name}=?" for name in values)
        self.db.execute(
            f"""UPDATE asset_features SET status='ready',{assignments},error_code=NULL,error_text=NULL,
                    completed_at=?,updated_at=? WHERE feature_id=?""",
            (*values.values(), completed, completed, feature_id),
        )
        self.db.commit()
        return "ready"

    def _maybe_add_detail_derivative(
        self,
        asset_id: str,
        input_identity: str,
        representation: _Representation,
        image: Image.Image,
    ) -> str | None:
        if max(image.width, image.height) < DETAIL_EDGE:
            return None
        return self._upsert_derivative(
            subject_type="asset",
            subject_id=asset_id,
            asset_id=asset_id,
            import_item_id=None,
            source_asset_id=representation.source_asset_id,
            source_observation_id=None,
            derivative_kind="detail",
            representation_kind=representation.kind,
            long_edge=DETAIL_EDGE,
            analyzer_version=self.config.analyzer_versions.vault_derivative,
            input_identity=input_identity,
            force=False,
        )

    def _complete_claim(self, claim: PreprocessClaim, *, error_text: str | None = None) -> None:
        now = utc_now()
        self.db.execute(
            """UPDATE background_jobs SET status='completed',completed_at=?,heartbeat_at=?,updated_at=?,
                   claim_token=NULL,claimed_by=NULL,lease_expires_at=NULL,error_text=? WHERE job_id=?""",
            (now, now, now, error_text, claim.job_id),
        )
        self.db.execute(
            """UPDATE background_job_attempts SET status='completed',completed_at=?,heartbeat_at=?,
                   error_text=?,retryable=0 WHERE job_id=? AND attempt=?""",
            (now, now, error_text, claim.job_id, claim.attempt),
        )
        self.db.commit()

    def _interrupt_claim(self, claim: PreprocessClaim, exc: BaseException) -> None:
        now = utc_now()
        row = self.db.one("SELECT max_attempts FROM background_jobs WHERE job_id=?", (claim.job_id,))
        retry = row is not None and claim.attempt < int(row["max_attempts"])
        message = f"{type(exc).__name__}: {exc}"
        self.db.execute(
            """UPDATE background_job_attempts SET status='interrupted',completed_at=?,heartbeat_at=?,
                   error_text=?,retryable=? WHERE job_id=? AND attempt=?""",
            (now, now, message, int(retry), claim.job_id, claim.attempt),
        )
        self.db.execute(
            """UPDATE background_jobs SET status=?,completed_at=?,heartbeat_at=?,updated_at=?,
                   claim_token=NULL,claimed_by=NULL,lease_expires_at=NULL,error_text=? WHERE job_id=?""",
            ("queued" if retry else "failed", None if retry else now, now, now, message, claim.job_id),
        )
        self.db.commit()

    def run_claim(self, claim: PreprocessClaim, *, fault_hook: FaultHook | None = None) -> PreprocessResult:
        self._ensure_claim(claim)
        progress = _json_load(
            self.db.one("SELECT progress_json FROM background_jobs WHERE job_id=?", (claim.job_id,))[
                "progress_json"
            ],
            {},
        )
        image: Image.Image | None = None
        image_error: Exception | None = None
        metadata_status: str | None = None
        feature_status: str | None = None
        try:
            if fault_hook:
                fault_hook("before_source_resolve", claim.job_id)
            if claim.job_kind == "asset_preprocess":
                asset = self._asset(claim.subject_id)
                input_identity, representation = self._asset_input(asset)
            else:
                asset = None
                item = self.db.one("SELECT * FROM import_items WHERE item_id=?", (claim.subject_id,))
                if item is None:
                    raise KeyError(f"Unknown review item: {claim.subject_id}")
                input_identity = self._review_input(item)
                representation = self._review_representation(item)
            if progress.get("input_identity") != input_identity:
                raise PreprocessError("Queued preprocessing input is stale; enqueue the current observation")
            self._phase(claim, "decoding", progress)
            try:
                image = self._load_image(representation)
            except Exception as exc:
                image_error = exc
            if fault_hook:
                fault_hook("after_decode", claim.job_id)

            derivative_ids = list(progress.get("derivative_ids") or [])
            if asset is not None and image is not None:
                detail = self._maybe_add_detail_derivative(asset["asset_id"], input_identity, representation, image)
                if detail:
                    derivative_ids.append(detail)
                    progress["derivative_ids"] = derivative_ids
            self._phase(claim, "derivatives", progress)
            derivative_statuses = [
                self._process_derivative(derivative_id, image, image_error) for derivative_id in derivative_ids
            ]
            if fault_hook:
                fault_hook("after_derivatives", claim.job_id)

            if asset is not None:
                self._phase(claim, "metadata", progress)
                metadata_status, edit_likelihood = self._process_metadata(
                    progress["metadata_id"], asset, representation, image
                )
                self._phase(claim, "features", progress)
                feature_status = self._process_features(
                    progress["feature_id"], image, image_error, edit_likelihood
                )
            if fault_hook:
                fault_hook("before_job_commit", claim.job_id)
            ready = derivative_statuses.count("ready")
            failed = derivative_statuses.count("error")
            summary_error = (
                f"Persisted unavailable outputs: derivatives={failed}, metadata={metadata_status}, features={feature_status}"
                if failed or metadata_status == "error" or feature_status == "error"
                else None
            )
            self._complete_claim(claim, error_text=summary_error)
            if claim.job_kind == "review_preview":
                batch_id = progress.get("batch_id")
                if batch_id:
                    self._finalize_review_batch(batch_id)
            return PreprocessResult(
                claim.job_id,
                claim.subject_type,
                claim.subject_id,
                ready,
                failed,
                metadata_status,
                feature_status,
            )
        except BaseException as exc:
            self._interrupt_claim(claim, exc)
            raise
        finally:
            if image is not None:
                image.close()

    def run_job(
        self,
        job_id: str,
        *,
        worker_id: str = "preprocess-worker",
        fault_hook: FaultHook | None = None,
    ) -> PreprocessResult:
        claim = self.claim_job(job_id, worker_id)
        return self.run_claim(claim, fault_hook=fault_hook)

    def run_next(
        self,
        *,
        worker_id: str = "preprocess-worker",
        fault_hook: FaultHook | None = None,
    ) -> PreprocessResult | None:
        claim = self.claim_next(worker_id)
        return None if claim is None else self.run_claim(claim, fault_hook=fault_hook)


def run_preprocessing_job(
    config: ReviewConfig,
    job_id: str,
    *,
    metadata_reader: MetadataBatchReader | None = None,
    exiftool: Path | None = None,
    ffprobe: Path | None = None,
    ffmpeg: Path | None = None,
    raw_preview_provider: ImageProvider | None = None,
    video_poster_provider: ImageProvider | None = None,
    limits: PreprocessLimits | None = None,
    allow_unsafe_atime: bool = False,
    worker_id: str = "preprocess-worker",
) -> PreprocessResult:
    """Execute one durable Stage 4 job while holding the existing writer lock."""

    layout = VaultLayout(config.vault_root)
    layout.create()
    with VaultRunLock(layout.state, "preprocess"):
        db = ManifestDB(
            layout.database,
            required_schema_version=SCHEMA_VERSION,
            feature_name="preprocessing and persisted derivatives",
        )
        try:
            service = PreprocessingService(
                db,
                layout,
                config,
                metadata_reader=metadata_reader,
                exiftool=exiftool,
                ffprobe=ffprobe,
                ffmpeg=ffmpeg,
                raw_preview_provider=raw_preview_provider,
                video_poster_provider=video_poster_provider,
                limits=limits,
                allow_unsafe_atime=allow_unsafe_atime,
            )
            return service.run_job(job_id, worker_id=worker_id)
        finally:
            db.close()
