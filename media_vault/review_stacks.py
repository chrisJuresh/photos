from __future__ import annotations

import hashlib
import json
import math
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

import numpy as np
from PIL import Image

from .config import ReviewConfig
from .core import VaultLayout, VaultRunLock, is_within, json_text, stable_id, utc_now
from .db import SCHEMA_VERSION, ManifestDB
from .review_library import current_catalog


STAGE9_JOB_KINDS = frozenset({"stack_profile_materialize"})
MAX_CANDIDATES_PER_ENTITY = 48
MAX_TIME_PROXIMITY_SECONDS = 86_400
STACK_COVER_METHOD = "transparent-stack-cover-v1"

DEFAULT_STACK_SETTINGS: dict[str, Any] = {
    "similarity": 0.72,
    "time_proximity_seconds": 300,
    "raw_jpeg_pairing_confidence": 0.8,
    "exposure_preference": "neutral",
    "sharpness_limit": 0.55,
    "motion_preference": "freeze",
    "order_direction": "asc",
}


def normalize_stack_settings(
    *,
    similarity: float = 0.72,
    time_proximity_seconds: int = 300,
    raw_jpeg_pairing_confidence: float = 0.8,
    exposure_preference: str = "neutral",
    sharpness_limit: float = 0.55,
    motion_preference: str = "freeze",
    order_direction: str = "asc",
) -> dict[str, Any]:
    if not 0.3 <= similarity <= 0.98:
        raise ValueError("Stack similarity must be between 0.30 and 0.98")
    if not 0 <= time_proximity_seconds <= MAX_TIME_PROXIMITY_SECONDS:
        raise ValueError("Stack time proximity must be between zero and 86,400 seconds")
    if not 0 <= raw_jpeg_pairing_confidence <= 1:
        raise ValueError("RAW/JPEG pairing confidence must be between zero and one")
    if exposure_preference not in {"darker", "neutral", "brighter"}:
        raise ValueError("Unsupported Stack exposure preference")
    if not 0 <= sharpness_limit <= 1:
        raise ValueError("Stack sharpness limit must be between zero and one")
    if motion_preference not in {"freeze", "intentional_blur"}:
        raise ValueError("Unsupported Stack motion preference")
    if order_direction not in {"asc", "desc"}:
        raise ValueError("Unsupported Stack order direction")
    return {
        "similarity": round(float(similarity), 4),
        "time_proximity_seconds": int(time_proximity_seconds),
        "raw_jpeg_pairing_confidence": round(float(raw_jpeg_pairing_confidence), 4),
        "exposure_preference": exposure_preference,
        "sharpness_limit": round(float(sharpness_limit), 4),
        "motion_preference": motion_preference,
        "order_direction": order_direction,
    }


def stack_settings_sha256(settings: dict[str, Any]) -> str:
    return hashlib.sha256(json_text(settings).encode("utf-8")).hexdigest()


def _profile_row(db: Any, profile_id: str) -> dict[str, Any] | None:
    row = db.one("SELECT * FROM stack_profiles WHERE profile_id=?", (profile_id,))
    return None if row is None else dict(row)


def current_ready_stack_profile(
    db: Any,
    *,
    catalog_generation: int,
    profile_id: str | None = None,
) -> dict[str, Any] | None:
    if profile_id:
        row = db.one(
            """SELECT * FROM stack_profiles WHERE profile_id=? AND catalog_generation=?
                 AND is_current=1 AND status='ready'""",
            (profile_id, catalog_generation),
        )
    else:
        row = db.one(
            """SELECT * FROM stack_profiles WHERE catalog_generation=? AND is_current=1 AND status='ready'
                 ORDER BY is_default DESC,completed_at DESC,profile_id LIMIT 1""",
            (catalog_generation,),
        )
    return None if row is None else dict(row)


def _enqueue_profile_job(db: Any, profile_id: str, job_id: str, catalog_generation: int) -> None:
    now = utc_now()
    db.execute(
        """INSERT INTO background_jobs(
               job_id,job_kind,subject_type,subject_id,phase,status,attempt,created_at,heartbeat_at,
               progress_json,priority,max_attempts,control_state,queued_at,updated_at
           ) VALUES(?,'stack_profile_materialize','stack_profile',?,'stack_profile_materialize',
                    'queued',0,?,?,?,25,3,'run',?,?) ON CONFLICT(job_id) DO NOTHING""",
        (
            job_id,
            profile_id,
            now,
            now,
            json_text({"profile_id": profile_id, "catalog_generation": catalog_generation}),
            now,
            now,
        ),
    )


def ensure_stack_profile(
    db: Any,
    config: ReviewConfig,
    *,
    name: str,
    settings: dict[str, Any],
    is_default: bool = False,
    replaces_profile_id: str | None = None,
) -> dict[str, Any]:
    normalized_name = name.strip()
    if not normalized_name or len(normalized_name) > 120:
        raise ValueError("Stack profile names must contain between one and 120 characters")
    catalog = current_catalog(db)
    if catalog is None:
        raise ValueError("The logical-photo catalog must be ready before Stack materialization")
    catalog_generation = int(catalog["source_generation"])
    settings_hash = stack_settings_sha256(settings)
    profile_version = config.analyzer_versions.stack_profile
    feature_version = config.analyzer_versions.stack_features
    existing = db.one(
        """SELECT * FROM stack_profiles WHERE settings_sha256=? AND catalog_generation=?
             AND analyzer_version=? AND feature_analyzer_version=?""",
        (settings_hash, catalog_generation, profile_version, feature_version),
    )
    if existing is not None:
        return dict(existing)
    profile_id = stable_id(
        "sp1",
        settings_hash,
        catalog_generation,
        profile_version,
        feature_version,
    )
    job_id = stable_id("job1", "stack_profile_materialize", profile_id)
    _enqueue_profile_job(db, profile_id, job_id, catalog_generation)
    now = utc_now()
    db.execute(
        """INSERT INTO stack_profiles(
               profile_id,name,settings_sha256,settings_json,catalog_generation,analyzer_version,
               feature_analyzer_version,status,is_default,is_current,replaces_profile_id,job_id,
               created_at,updated_at
           ) VALUES(?,?,?,?,?,?,?,'queued',?,1,?,?,?,?)""",
        (
            profile_id,
            normalized_name,
            settings_hash,
            json_text(settings),
            catalog_generation,
            profile_version,
            feature_version,
            int(is_default),
            replaces_profile_id,
            job_id,
            now,
            now,
        ),
    )
    return dict(db.one("SELECT * FROM stack_profiles WHERE profile_id=?", (profile_id,)))


def ensure_default_stack_profile(db: Any, config: ReviewConfig) -> dict[str, Any]:
    return ensure_stack_profile(
        db,
        config,
        name="Default Stacks",
        settings=normalize_stack_settings(**DEFAULT_STACK_SETTINGS),
        is_default=True,
    )


def _mark_running(db: ManifestDB, job_id: str) -> dict[str, Any] | None:
    db.execute("BEGIN IMMEDIATE")
    row = db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,))
    if row is None:
        db.conn.rollback()
        raise KeyError(f"Unknown Stage 9 job: {job_id}")
    if row["status"] == "completed":
        db.conn.rollback()
        return dict(row)
    if row["job_kind"] not in STAGE9_JOB_KINDS or row["status"] not in {"queued", "failed", "interrupted"}:
        db.conn.rollback()
        return None
    now = utc_now()
    updated = db.execute(
        """UPDATE background_jobs SET status='running',attempt=attempt+1,phase='stack_inputs',
               started_at=COALESCE(started_at,?),heartbeat_at=?,updated_at=?,completed_at=NULL,error_text=NULL
             WHERE job_id=? AND status=? AND control_state='run'""",
        (now, now, now, job_id, row["status"]),
    )
    if updated.rowcount != 1:
        db.conn.rollback()
        return None
    db.execute(
        "UPDATE stack_profiles SET status='building',updated_at=?,error_text=NULL WHERE job_id=?",
        (now, job_id),
    )
    db.commit()
    return dict(db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,)))


def _job_phase(db: ManifestDB, job_id: str, phase: str, progress: dict[str, Any]) -> None:
    now = utc_now()
    db.execute(
        "UPDATE background_jobs SET phase=?,heartbeat_at=?,updated_at=?,progress_json=? WHERE job_id=?",
        (phase, now, now, json_text(progress), job_id),
    )
    db.commit()


def _complete_job(db: ManifestDB, job_id: str, progress: dict[str, Any]) -> None:
    now = utc_now()
    db.execute(
        """UPDATE background_jobs SET status='completed',phase='complete',completed_at=?,heartbeat_at=?,
               updated_at=?,progress_json=?,error_text=NULL WHERE job_id=?""",
        (now, now, now, json_text(progress), job_id),
    )


def _fail_job(db: ManifestDB, job_id: str, exc: BaseException) -> None:
    now = utc_now()
    error = f"{type(exc).__name__}: {exc}"
    row = db.one("SELECT attempt,max_attempts FROM background_jobs WHERE job_id=?", (job_id,))
    retry = row is not None and int(row["attempt"]) < int(row["max_attempts"])
    status = "queued" if retry else "failed"
    db.execute(
        """UPDATE background_jobs SET status=?,completed_at=?,heartbeat_at=?,updated_at=?,error_text=?,
               queued_at=CASE WHEN ? THEN ? ELSE queued_at END,claim_token=NULL,claimed_by=NULL,
               lease_expires_at=NULL WHERE job_id=?""",
        (status, None if retry else now, now, now, error, int(retry), now, job_id),
    )
    db.execute(
        "UPDATE stack_profiles SET status=?,updated_at=?,error_text=? WHERE job_id=?",
        ("queued" if retry else "error", now, error, job_id),
    )
    db.commit()


def recover_interrupted_stage9_jobs(config: ReviewConfig) -> tuple[str, ...]:
    layout = VaultLayout(config.vault_root)
    try:
        with VaultRunLock(layout.state, "stack-materialization-recovery"):
            db = ManifestDB(
                layout.database,
                required_schema_version=SCHEMA_VERSION,
                feature_name="Stack materialization recovery",
            )
            try:
                rows = db.all(
                    """SELECT job_id,attempt,max_attempts FROM background_jobs
                         WHERE job_kind='stack_profile_materialize' AND status='running' ORDER BY job_id"""
                )
                now = utc_now()
                recovered: list[str] = []
                for row in rows:
                    retry = int(row["attempt"]) < int(row["max_attempts"])
                    error = (
                        "Worker stopped before the terminal Stack commit; partial inputs and edges "
                        "remain hidden and will be deterministically replaced"
                    )
                    db.execute(
                        """UPDATE background_jobs SET status=?,completed_at=?,heartbeat_at=?,updated_at=?,
                               queued_at=CASE WHEN ? THEN ? ELSE queued_at END,error_text=?,claim_token=NULL,
                               claimed_by=NULL,lease_expires_at=NULL WHERE job_id=? AND status='running'""",
                        (
                            "queued" if retry else "failed",
                            None if retry else now,
                            now,
                            now,
                            int(retry),
                            now,
                            error,
                            row["job_id"],
                        ),
                    )
                    db.execute(
                        "UPDATE stack_profiles SET status=?,updated_at=?,error_text=? WHERE job_id=?",
                        ("queued" if retry else "error", now, error, row["job_id"]),
                    )
                    recovered.append(str(row["job_id"]))
                db.commit()
                return tuple(recovered)
            finally:
                db.close()
    except RuntimeError as exc:
        if "Another vault writer is active" in str(exc):
            return ()
        raise


def _rows_for_ids(db: ManifestDB, sql: str, ids: list[str]) -> list[Any]:
    rows: list[Any] = []
    for start in range(0, len(ids), 400):
        chunk = ids[start : start + 400]
        if chunk:
            rows.extend(db.all(sql.format(placeholders=",".join("?" for _ in chunk)), chunk))
    return rows


def _capture_epoch(value: str | None) -> float | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.timestamp()
    except (ValueError, OverflowError):
        return None


def _normalized_filename(value: str) -> str:
    stem = Path(value).stem.casefold()
    stem = re.sub(r"\d+$", "", stem)
    return re.sub(r"[^a-z0-9]+", "", stem)[:80]


def _dct_matrix(size: int) -> np.ndarray:
    points = np.arange(size, dtype=np.float64)
    frequencies = points[:, None]
    matrix = np.cos((math.pi / size) * (points + 0.5) * frequencies)
    matrix[0, :] *= math.sqrt(1 / size)
    matrix[1:, :] *= math.sqrt(2 / size)
    return matrix


_DCT_32 = _dct_matrix(32)


def _bits_hex(bits: np.ndarray) -> str:
    value = 0
    for bit in bits.reshape(-1):
        value = (value << 1) | int(bool(bit))
    return f"{value:016x}"


def _visual_features(path: Path) -> tuple[str, str, list[float], int, int]:
    with Image.open(path) as opened:
        opened.load()
        rgb = opened.convert("RGB")
    try:
        gray32 = np.asarray(rgb.resize((32, 32), Image.Resampling.LANCZOS).convert("L"), dtype=np.float64)
        dct = _DCT_32 @ gray32 @ _DCT_32.T
        low = dct[:8, :8]
        median = float(np.median(low.reshape(-1)[1:]))
        phash = _bits_hex(low >= median)
        dhash_gray = np.asarray(rgb.resize((9, 8), Image.Resampling.LANCZOS).convert("L"), dtype=np.int16)
        dhash = _bits_hex(dhash_gray[:, 1:] >= dhash_gray[:, :-1])
        sample = np.asarray(rgb.resize((64, 64), Image.Resampling.LANCZOS), dtype=np.uint8)
        histogram: list[float] = []
        for channel in range(3):
            counts, _edges = np.histogram(sample[:, :, channel], bins=4, range=(0, 256))
            histogram.extend(round(float(value) / sample[:, :, channel].size, 8) for value in counts)
        return phash, dhash, histogram, rgb.width, rgb.height
    finally:
        rgb.close()


def _materialize_stack_inputs(
    db: ManifestDB,
    config: ReviewConfig,
    *,
    catalog_generation: int,
    analyzer_version: str,
) -> tuple[int, int]:
    cursor = db.execute(
        """SELECT * FROM photo_entities WHERE catalog_generation=? AND is_current=1 ORDER BY entity_id""",
        (catalog_generation,),
    )
    total = partial = 0
    while True:
        entities = cursor.fetchmany(500)
        if not entities:
            break
        anchor_ids = [str(row["anchor_asset_id"]) for row in entities]
        display_ids = [str(row["display_asset_id"]) for row in entities]
        metadata_rows = _rows_for_ids(
            db,
            """SELECT * FROM asset_extended_metadata WHERE asset_id IN ({placeholders}) AND is_current=1
                 ORDER BY updated_at DESC,metadata_id DESC""",
            anchor_ids,
        )
        feature_rows = _rows_for_ids(
            db,
            """SELECT * FROM asset_features WHERE asset_id IN ({placeholders}) AND is_current=1
                 ORDER BY updated_at DESC,feature_id DESC""",
            anchor_ids,
        )
        derivative_rows = _rows_for_ids(
            db,
            """SELECT * FROM derivatives WHERE asset_id IN ({placeholders}) AND is_current=1
                 AND status='ready' AND derivative_kind IN ('thumbnail','detail')
                 ORDER BY asset_id,long_edge DESC,derivative_id""",
            display_ids,
        )
        confidence_rows = db.all(
            """SELECT entity_id,MIN(COALESCE(confidence_score,1.0)) AS confidence
                 FROM photo_entity_members WHERE entity_id IN ("""
            + ",".join("?" for _ in entities)
            + ") GROUP BY entity_id",
            [row["entity_id"] for row in entities],
        )
        metadata: dict[str, Any] = {}
        features: dict[str, Any] = {}
        derivatives: dict[str, Any] = {}
        for row in metadata_rows:
            metadata.setdefault(str(row["asset_id"]), row)
        for row in feature_rows:
            features.setdefault(str(row["asset_id"]), row)
        for row in derivative_rows:
            derivatives.setdefault(str(row["asset_id"]), row)
        confidences = {str(row["entity_id"]): row["confidence"] for row in confidence_rows}
        now = utc_now()
        for entity in entities:
            entity_id = str(entity["entity_id"])
            anchor_id = str(entity["anchor_asset_id"])
            display_id = str(entity["display_asset_id"])
            meta = metadata.get(anchor_id)
            feature = features.get(anchor_id)
            derivative = derivatives.get(display_id)
            identity_payload = {
                "entity_id": entity_id,
                "display_asset_id": display_id,
                "catalog_generation": catalog_generation,
                "derivative": None
                if derivative is None
                else [derivative["checksum_sha256"], derivative["byte_size"], derivative["file_mtime_ns"]],
                "metadata": None if meta is None else [meta["metadata_id"], meta["input_identity"], meta["updated_at"]],
                "features": None
                if feature is None
                else [feature["feature_id"], feature["input_identity"], feature["updated_at"]],
                "analyzer_version": analyzer_version,
            }
            input_identity = hashlib.sha256(json_text(identity_payload).encode()).hexdigest()
            existing = db.one(
                """SELECT input_identity,status FROM stack_feature_inputs
                     WHERE catalog_generation=? AND entity_id=? AND analyzer_version=?""",
                (catalog_generation, entity_id, analyzer_version),
            )
            if existing is not None and existing["input_identity"] == input_identity and existing["status"] in {
                "ready",
                "partial",
            }:
                total += 1
                partial += int(existing["status"] == "partial")
                continue
            phash = dhash = None
            histogram: list[float] | None = None
            width = int(entity["width"] or 0)
            height = int(entity["height"] or 0)
            error: str | None = None
            evidence: dict[str, Any] = {
                "method": "persisted-derivative-perceptual-features-v1",
                "media_source": "certified prepared derivative",
                "canonical_media_read": False,
            }
            if derivative is None or not derivative["relative_path_text"]:
                error = "No certified prepared derivative is available for perceptual Stack inputs"
            else:
                path = config.derivative_root / Path(str(derivative["relative_path_text"]))
                try:
                    if not is_within(path, config.derivative_root) or not path.is_file():
                        raise ValueError("Prepared derivative path is missing or outside the derivative root")
                    stat = path.stat()
                    if stat.st_size != int(derivative["byte_size"] or -1) or stat.st_mtime_ns != int(
                        derivative["file_mtime_ns"] or -1
                    ):
                        raise ValueError("Prepared derivative no longer matches its persisted certificate")
                    phash, dhash, histogram, width, height = _visual_features(path)
                    evidence["derivative_id"] = derivative["derivative_id"]
                    evidence["derivative_checksum_sha256"] = derivative["checksum_sha256"]
                except Exception as exc:
                    error = f"{type(exc).__name__}: {exc}"
            capture_epoch = _capture_epoch(str(entity["capture_time_text"]) if entity["capture_time_text"] else None)
            status = "ready" if phash and dhash and histogram else "partial"
            db.execute(
                """INSERT INTO stack_feature_inputs(
                       catalog_generation,entity_id,display_asset_id,analyzer_version,input_identity,status,
                       phash_hex,dhash_hex,phash_bucket,dhash_bucket,color_histogram_json,aspect_ratio,
                       capture_epoch_seconds,capture_bucket,camera_key,filename_key,raw_jpeg_confidence,
                       relationship_count,edit_likelihood,sharpness_score,motion_score,underexposure_score,
                       overexposure_score,highlight_clipping_score,corruption_score,resolution_pixels,
                       evidence_json,error_text,created_at,updated_at,completed_at
                   ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                   ON CONFLICT(catalog_generation,entity_id,analyzer_version) DO UPDATE SET
                       display_asset_id=excluded.display_asset_id,input_identity=excluded.input_identity,
                       status=excluded.status,phash_hex=excluded.phash_hex,dhash_hex=excluded.dhash_hex,
                       phash_bucket=excluded.phash_bucket,dhash_bucket=excluded.dhash_bucket,
                       color_histogram_json=excluded.color_histogram_json,aspect_ratio=excluded.aspect_ratio,
                       capture_epoch_seconds=excluded.capture_epoch_seconds,capture_bucket=excluded.capture_bucket,
                       camera_key=excluded.camera_key,filename_key=excluded.filename_key,
                       raw_jpeg_confidence=excluded.raw_jpeg_confidence,
                       relationship_count=excluded.relationship_count,edit_likelihood=excluded.edit_likelihood,
                       sharpness_score=excluded.sharpness_score,motion_score=excluded.motion_score,
                       underexposure_score=excluded.underexposure_score,overexposure_score=excluded.overexposure_score,
                       highlight_clipping_score=excluded.highlight_clipping_score,
                       corruption_score=excluded.corruption_score,resolution_pixels=excluded.resolution_pixels,
                       evidence_json=excluded.evidence_json,error_text=excluded.error_text,
                       updated_at=excluded.updated_at,completed_at=excluded.completed_at""",
                (
                    catalog_generation,
                    entity_id,
                    display_id,
                    analyzer_version,
                    input_identity,
                    status,
                    phash,
                    dhash,
                    phash[:4] if phash else None,
                    dhash[:4] if dhash else None,
                    json_text(histogram) if histogram is not None else None,
                    (float(width) / height) if width > 0 and height > 0 else None,
                    capture_epoch,
                    int(capture_epoch // 300) if capture_epoch is not None else None,
                    str(entity["camera_model"] or "").strip().casefold(),
                    _normalized_filename(str(entity["filename_text"])),
                    confidences.get(entity_id) if entity["entity_kind"] == "raw_jpeg" else None,
                    int(entity["near_duplicate_count"] or 0),
                    feature["edit_likelihood"] if feature else None,
                    feature["sharpness_score"] if feature else None,
                    feature["motion_score"] if feature else None,
                    feature["underexposure_score"] if feature else None,
                    feature["overexposure_score"] if feature else None,
                    feature["highlight_clipping_score"] if feature else None,
                    feature["corruption_score"] if feature else None,
                    width * height if width > 0 and height > 0 else None,
                    json_text(evidence),
                    error,
                    now,
                    now,
                    now,
                ),
            )
            total += 1
            partial += int(status == "partial")
        db.commit()
    return total, partial


def _hamming(left: str | None, right: str | None) -> int | None:
    if not left or not right:
        return None
    try:
        return (int(left, 16) ^ int(right, 16)).bit_count()
    except ValueError:
        return None


def _color_distance(left: str | None, right: str | None) -> float | None:
    if not left or not right:
        return None
    try:
        left_values = json.loads(left)
        right_values = json.loads(right)
        if len(left_values) != len(right_values) or not left_values:
            return None
        return float(sum(abs(float(a) - float(b)) for a, b in zip(left_values, right_values, strict=True)) / len(left_values))
    except (TypeError, ValueError, json.JSONDecodeError):
        return None


def _candidate_ids(
    db: ManifestDB,
    row: Any,
    generation: int,
    version: str,
    relationship_ids: Iterable[str] = (),
) -> list[str]:
    entity_id = str(row["entity_id"])
    ordered: list[str] = []

    def add(rows: Iterable[Any]) -> None:
        for candidate in rows:
            value = str(candidate["entity_id"])
            if value not in ordered:
                ordered.append(value)

    add({"entity_id": value} for value in sorted(set(relationship_ids))[:16])
    if row["capture_epoch_seconds"] is not None:
        capture = float(row["capture_epoch_seconds"])
        add(
            db.all(
                """SELECT entity_id FROM stack_feature_inputs INDEXED BY idx_stack_inputs_capture
                     WHERE catalog_generation=? AND analyzer_version=? AND capture_epoch_seconds BETWEEN ? AND ?
                       AND entity_id>? AND (camera_key=? OR filename_key=?)
                     ORDER BY ABS(capture_epoch_seconds-?),entity_id LIMIT 16""",
                (
                    generation,
                    version,
                    capture - MAX_TIME_PROXIMITY_SECONDS,
                    capture + MAX_TIME_PROXIMITY_SECONDS,
                    entity_id,
                    row["camera_key"],
                    row["filename_key"],
                    capture,
                ),
            )
        )
    for column, index, value, limit in (
        ("phash_bucket", "idx_stack_inputs_phash_bucket", row["phash_bucket"], 16),
        ("dhash_bucket", "idx_stack_inputs_dhash_bucket", row["dhash_bucket"], 8),
        ("filename_key", "idx_stack_inputs_filename", row["filename_key"], 8),
    ):
        if value:
            add(
                db.all(
                    f"""SELECT entity_id FROM stack_feature_inputs INDEXED BY {index}
                         WHERE catalog_generation=? AND analyzer_version=? AND {column}=? AND entity_id>?
                         ORDER BY entity_id LIMIT ?""",
                    (generation, version, value, entity_id, limit),
                )
            )
    return ordered[:MAX_CANDIDATES_PER_ENTITY]


def _relationship_candidate_evidence(
    db: ManifestDB,
    catalog_generation: int,
) -> tuple[dict[str, list[str]], dict[tuple[str, str], float]]:
    cursor = db.execute(
        """SELECT lm.entity_id AS left_entity_id,rm.entity_id AS right_entity_id,r.confidence_score
             FROM relationships r
             JOIN photo_entity_members lm ON lm.asset_id=r.left_asset_id
             JOIN photo_entity_members rm ON rm.asset_id=r.right_asset_id
             JOIN photo_entities le ON le.entity_id=lm.entity_id
             JOIN photo_entities re ON re.entity_id=rm.entity_id
             WHERE le.catalog_generation=? AND le.is_current=1
               AND re.catalog_generation=? AND re.is_current=1 AND lm.entity_id<>rm.entity_id
             ORDER BY lm.entity_id,rm.entity_id,r.relationship_id""",
        (catalog_generation, catalog_generation),
    )
    scores: dict[tuple[str, str], float] = {}
    while True:
        rows = cursor.fetchmany(2_000)
        if not rows:
            break
        for row in rows:
            pair = tuple(sorted((str(row["left_entity_id"]), str(row["right_entity_id"]))))
            scores[pair] = max(scores.get(pair, 0.0), float(row["confidence_score"] or 0))
    by_left: dict[str, list[str]] = {}
    for left_id, right_id in sorted(scores):
        by_left.setdefault(left_id, []).append(right_id)
    return by_left, scores


def stack_candidate_query_plan(
    db: ManifestDB,
    *,
    catalog_generation: int,
    analyzer_version: str,
) -> tuple[str, ...]:
    row = db.one(
        """SELECT * FROM stack_feature_inputs WHERE catalog_generation=? AND analyzer_version=?
             ORDER BY entity_id LIMIT 1""",
        (catalog_generation, analyzer_version),
    )
    if row is None:
        return ()
    plans: list[str] = []
    for sql, parameters in (
        (
            """EXPLAIN QUERY PLAN SELECT entity_id FROM stack_feature_inputs INDEXED BY idx_stack_inputs_phash_bucket
                 WHERE catalog_generation=? AND analyzer_version=? AND phash_bucket=? AND entity_id>?
                 ORDER BY entity_id LIMIT 16""",
            (catalog_generation, analyzer_version, row["phash_bucket"], row["entity_id"]),
        ),
        (
            """EXPLAIN QUERY PLAN SELECT entity_id FROM stack_feature_inputs INDEXED BY idx_stack_inputs_capture
                 WHERE catalog_generation=? AND analyzer_version=? AND capture_epoch_seconds BETWEEN ? AND ?
                   AND entity_id>? ORDER BY capture_epoch_seconds,entity_id LIMIT 16""",
            (
                catalog_generation,
                analyzer_version,
                float(row["capture_epoch_seconds"] or 0) - MAX_TIME_PROXIMITY_SECONDS,
                float(row["capture_epoch_seconds"] or 0) + MAX_TIME_PROXIMITY_SECONDS,
                row["entity_id"],
            ),
        ),
    ):
        plans.extend(str(item[3]) for item in db.all(sql, parameters))
    return tuple(plans)


def _materialize_candidate_edges(
    db: ManifestDB,
    *,
    catalog_generation: int,
    analyzer_version: str,
) -> int:
    db.execute(
        "DELETE FROM stack_candidate_edges WHERE catalog_generation=? AND analyzer_version=?",
        (catalog_generation, analyzer_version),
    )
    rows = db.all(
        """SELECT * FROM stack_feature_inputs WHERE catalog_generation=? AND analyzer_version=?
             AND status IN ('ready','partial') ORDER BY entity_id""",
        (catalog_generation, analyzer_version),
    )
    by_id = {str(row["entity_id"]): row for row in rows}
    relationship_ids, relationship_scores = _relationship_candidate_evidence(db, catalog_generation)
    created = utc_now()
    pending: list[tuple[Any, ...]] = []
    count = 0
    for left in rows:
        left_id = str(left["entity_id"])
        for right_id in _candidate_ids(
            db,
            left,
            catalog_generation,
            analyzer_version,
            relationship_ids.get(left_id, ()),
        ):
            right = by_id.get(right_id)
            if right is None:
                continue
            time_delta = (
                abs(float(left["capture_epoch_seconds"]) - float(right["capture_epoch_seconds"]))
                if left["capture_epoch_seconds"] is not None and right["capture_epoch_seconds"] is not None
                else None
            )
            filename_left = str(left["filename_key"] or "")
            filename_right = str(right["filename_key"] or "")
            filename_score = 1.0 if filename_left and filename_left == filename_right else 0.0
            camera_left = str(left["camera_key"] or "")
            camera_right = str(right["camera_key"] or "")
            equipment = 1.0 if camera_left and camera_left == camera_right else 0.0
            raw_left = left["raw_jpeg_confidence"]
            raw_right = right["raw_jpeg_confidence"]
            raw_score = min(float(raw_left), float(raw_right)) if raw_left is not None and raw_right is not None else 0.0
            relationship_score = relationship_scores.get((left_id, right_id), 0.0)
            phash_distance = _hamming(left["phash_hex"], right["phash_hex"])
            dhash_distance = _hamming(left["dhash_hex"], right["dhash_hex"])
            color_distance = _color_distance(left["color_histogram_json"], right["color_histogram_json"])
            aspect_delta = (
                abs(math.log(max(1e-9, float(left["aspect_ratio"])) / max(1e-9, float(right["aspect_ratio"]))))
                if left["aspect_ratio"] is not None and right["aspect_ratio"] is not None
                else None
            )
            evidence = {
                "candidate_method": "bounded-indexed-locality-v1",
                "phash_bucket": left["phash_bucket"] if left["phash_bucket"] == right["phash_bucket"] else None,
                "dhash_bucket": left["dhash_bucket"] if left["dhash_bucket"] == right["dhash_bucket"] else None,
                "time_window_seconds": MAX_TIME_PROXIMITY_SECONDS,
            }
            pending.append(
                (
                    catalog_generation,
                    analyzer_version,
                    left_id,
                    right_id,
                    phash_distance,
                    dhash_distance,
                    color_distance,
                    aspect_delta,
                    time_delta,
                    equipment,
                    filename_score,
                    raw_score,
                    relationship_score,
                    json_text(evidence),
                    created,
                )
            )
            if len(pending) >= 1_000:
                db.executemany(
                    """INSERT OR IGNORE INTO stack_candidate_edges(
                           catalog_generation,analyzer_version,left_entity_id,right_entity_id,phash_distance,
                           dhash_distance,color_distance,aspect_delta,time_delta_seconds,equipment_match,
                           filename_score,raw_pairing_score,relationship_score,evidence_json,created_at
                       ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    pending,
                )
                count += len(pending)
                pending.clear()
                db.commit()
    if pending:
        db.executemany(
            """INSERT OR IGNORE INTO stack_candidate_edges(
                   catalog_generation,analyzer_version,left_entity_id,right_entity_id,phash_distance,
                   dhash_distance,color_distance,aspect_delta,time_delta_seconds,equipment_match,
                   filename_score,raw_pairing_score,relationship_score,evidence_json,created_at
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            pending,
        )
        count += len(pending)
    db.commit()
    row = db.one(
        "SELECT COUNT(*) AS count FROM stack_candidate_edges WHERE catalog_generation=? AND analyzer_version=?",
        (catalog_generation, analyzer_version),
    )
    return int(row["count"] if row else count)


def _edge_score(edge: Any, settings: dict[str, Any]) -> tuple[float, dict[str, Any]]:
    visual_parts: list[tuple[float, float]] = []
    if edge["phash_distance"] is not None:
        visual_parts.append((0.35, max(0.0, 1.0 - float(edge["phash_distance"]) / 64)))
    if edge["dhash_distance"] is not None:
        visual_parts.append((0.25, max(0.0, 1.0 - float(edge["dhash_distance"]) / 64)))
    if edge["color_distance"] is not None:
        visual_parts.append((0.20, max(0.0, 1.0 - float(edge["color_distance"]) * 4)))
    if edge["aspect_delta"] is not None:
        visual_parts.append((0.10, max(0.0, 1.0 - float(edge["aspect_delta"]) / math.log(4))))
    visual_weight = sum(weight for weight, _value in visual_parts)
    visual = sum(weight * value for weight, value in visual_parts) / visual_weight if visual_weight else 0.0
    proximity = int(settings["time_proximity_seconds"])
    time_delta = edge["time_delta_seconds"]
    time_score = (
        max(0.0, 1.0 - float(time_delta) / max(1, proximity))
        if time_delta is not None and proximity > 0 and float(time_delta) <= proximity
        else 0.0
    )
    raw = float(edge["raw_pairing_score"] or 0)
    raw_score = raw if raw >= float(settings["raw_jpeg_pairing_confidence"]) else 0.0
    score = min(
        1.0,
        visual * 0.72
        + time_score * 0.13
        + float(edge["equipment_match"] or 0) * 0.05
        + float(edge["filename_score"] or 0) * 0.05
        + float(edge["relationship_score"] or 0) * 0.03
        + raw_score * 0.02,
    )
    evidence = {
        "score": round(score, 8),
        "visual_similarity": round(visual, 8),
        "time_score": round(time_score, 8),
        "equipment_match": float(edge["equipment_match"] or 0),
        "filename_score": float(edge["filename_score"] or 0),
        "raw_pairing_score": raw_score,
        "relationship_score": float(edge["relationship_score"] or 0),
    }
    return score, evidence


class _UnionFind:
    def __init__(self, values: Iterable[str]) -> None:
        self.parent = {value: value for value in values}

    def find(self, value: str) -> str:
        parent = self.parent[value]
        while parent != self.parent[parent]:
            parent = self.parent[parent]
        while value != parent:
            next_value = self.parent[value]
            self.parent[value] = parent
            value = next_value
        return parent

    def union(self, left: str, right: str) -> None:
        left_root = self.find(left)
        right_root = self.find(right)
        if left_root == right_root:
            return
        low, high = sorted((left_root, right_root))
        self.parent[high] = low


def _ranking_values(row: Any, settings: dict[str, Any]) -> tuple[float, dict[str, Any]]:
    under = float(row["underexposure_score"] or 0)
    over = float(row["overexposure_score"] or 0)
    preference = settings["exposure_preference"]
    if preference == "darker":
        exposure = max(0.0, 1.0 - abs(under - 0.2) - over)
    elif preference == "brighter":
        exposure = max(0.0, 1.0 - abs(over - 0.2) - under)
    else:
        exposure = max(0.0, 1.0 - max(under, over))
    sharpness = float(row["sharpness_score"] or 0)
    sharpness_limit = float(settings["sharpness_limit"])
    sharpness_value = sharpness if sharpness >= sharpness_limit else sharpness * 0.2
    motion = float(row["motion_score"] or 0)
    motion_value = 1.0 - motion if settings["motion_preference"] == "freeze" else motion
    clipping = max(0.0, 1.0 - float(row["highlight_clipping_score"] or 0))
    corruption = max(0.0, 1.0 - float(row["corruption_score"] or 0))
    pixels = int(row["resolution_pixels"] or 0)
    resolution = min(1.0, math.log10(max(1, pixels)) / 8)
    score = (
        exposure * 0.25
        + sharpness_value * 0.25
        + motion_value * 0.15
        + clipping * 0.15
        + corruption * 0.15
        + resolution * 0.05
    )
    evidence = {
        "score": round(score, 8),
        "edited": float(row["edit_likelihood"] or 0) >= 0.5,
        "edit_likelihood": float(row["edit_likelihood"] or 0),
        "exposure_preference": preference,
        "exposure_score": round(exposure, 8),
        "sharpness": sharpness,
        "sharpness_limit": sharpness_limit,
        "sharpness_limit_met": sharpness >= sharpness_limit,
        "motion_preference": settings["motion_preference"],
        "motion_score": motion,
        "clipping_score": float(row["highlight_clipping_score"] or 0),
        "corruption_score": float(row["corruption_score"] or 0),
        "resolution_pixels": pixels,
    }
    return score, evidence


def _rank_cover(
    member_ids: list[str],
    inputs: dict[str, Any],
    settings: dict[str, Any],
    filenames: dict[str, str],
) -> tuple[str, dict[str, tuple[float, dict[str, Any]]], str, dict[str, Any]]:
    ranked = {entity_id: _ranking_values(inputs[entity_id], settings) for entity_id in member_ids}
    unedited = [entity_id for entity_id in member_ids if not ranked[entity_id][1]["edited"]]
    candidates = unedited or member_ids
    cover = sorted(candidates, key=lambda value: (-ranked[value][0], value))[0]
    score, evidence = ranked[cover]
    edit_clause = "unedited candidates were preferred" if unedited else "all candidates contained edit evidence"
    sharp_clause = "met" if evidence["sharpness_limit_met"] else "fell below"
    explanation = (
        f"Selected {filenames.get(cover, cover)} from {len(member_ids)} member(s); {edit_clause}; "
        f"{settings['exposure_preference']} exposure score {evidence['exposure_score']:.3f}; "
        f"sharpness {evidence['sharpness']:.3f} {sharp_clause} the {evidence['sharpness_limit']:.3f} limit; "
        f"{settings['motion_preference'].replace('_', ' ')} motion preference; deterministic entity-ID tie-breaker."
    )
    cover_evidence = {
        "method": STACK_COVER_METHOD,
        "ranked_explanation": explanation,
        "selected_score": round(score, 8),
        "edited_candidates_excluded": bool(unedited) and len(unedited) != len(member_ids),
        "candidate_count": len(candidates),
        "settings": settings,
        "selected_inputs": evidence,
    }
    return cover, ranked, explanation, cover_evidence


def _materialize_profile(
    db: ManifestDB,
    *,
    profile: Any,
    settings: dict[str, Any],
) -> tuple[int, int]:
    generation = int(profile["catalog_generation"])
    feature_version = str(profile["feature_analyzer_version"])
    input_rows = db.all(
        """SELECT i.*,e.filename_text FROM stack_feature_inputs i JOIN photo_entities e USING(entity_id)
             WHERE i.catalog_generation=? AND i.analyzer_version=? AND e.catalog_generation=? AND e.is_current=1
             ORDER BY i.entity_id""",
        (generation, feature_version, generation),
    )
    inputs = {str(row["entity_id"]): row for row in input_rows}
    filenames = {str(row["entity_id"]): str(row["filename_text"]) for row in input_rows}
    union = _UnionFind(inputs)
    cursor = db.execute(
        """SELECT * FROM stack_candidate_edges WHERE catalog_generation=? AND analyzer_version=?
             ORDER BY left_entity_id,right_entity_id""",
        (generation, feature_version),
    )
    while True:
        edges = cursor.fetchmany(2_000)
        if not edges:
            break
        for edge in edges:
            score, edge_evidence = _edge_score(edge, settings)
            time_delta = edge["time_delta_seconds"]
            within_time = (
                time_delta is not None
                and int(settings["time_proximity_seconds"]) > 0
                and float(time_delta) <= int(settings["time_proximity_seconds"])
            )
            visual_only = all(
                edge[name] is not None
                for name in ("phash_distance", "dhash_distance")
            ) and max(
                1.0 - float(edge["phash_distance"]) / 64,
                1.0 - float(edge["dhash_distance"]) / 64,
            ) >= max(float(settings["similarity"]), 0.9)
            threshold = float(settings["similarity"])
            if (within_time and score >= threshold) or (
                visual_only and float(edge_evidence["visual_similarity"]) >= threshold
            ):
                union.union(str(edge["left_entity_id"]), str(edge["right_entity_id"]))
    groups: dict[str, list[str]] = {}
    for entity_id in sorted(inputs):
        groups.setdefault(union.find(entity_id), []).append(entity_id)
    ordered_groups = list(groups.values())

    def group_order(members: list[str]) -> tuple[float, str]:
        captures = [float(inputs[item]["capture_epoch_seconds"]) for item in members if inputs[item]["capture_epoch_seconds"] is not None]
        return (min(captures) if captures else math.inf, min(members))

    ordered_groups.sort(key=group_order, reverse=settings["order_direction"] == "desc")
    profile_id = str(profile["profile_id"])
    db.execute("DELETE FROM stack_members WHERE profile_id=?", (profile_id,))
    db.execute("DELETE FROM stacks WHERE profile_id=?", (profile_id,))
    now = utc_now()
    member_total = 0
    for stack_ordinal, members in enumerate(ordered_groups):
        members.sort(key=lambda item: (inputs[item]["capture_epoch_seconds"] is None, inputs[item]["capture_epoch_seconds"] or 0, item))
        cover, ranked, explanation, cover_evidence = _rank_cover(members, inputs, settings, filenames)
        stack_id = stable_id("st1", profile["settings_sha256"], *sorted(members))
        db.execute(
            """INSERT INTO stacks(
                   profile_id,stack_id,ordinal,ranked_cover_entity_id,cover_entity_id,member_count,
                   cover_explanation,cover_method_version,cover_evidence_json,revision,created_at,updated_at
               ) VALUES(?,?,?,?,?,?,?,?,?,1,?,?)""",
            (
                profile_id,
                stack_id,
                stack_ordinal,
                cover,
                cover,
                len(members),
                explanation,
                STACK_COVER_METHOD,
                json_text(cover_evidence),
                now,
                now,
            ),
        )
        db.executemany(
            """INSERT INTO stack_members(
                   profile_id,stack_id,entity_id,ordinal,rank_score,rank_evidence_json,is_cover,is_override
               ) VALUES(?,?,?,?,?,?,?,0)""",
            (
                (
                    profile_id,
                    stack_id,
                    entity_id,
                    ordinal,
                    ranked[entity_id][0],
                    json_text(ranked[entity_id][1]),
                    int(entity_id == cover),
                )
                for ordinal, entity_id in enumerate(members)
            ),
        )
        member_total += len(members)
        if stack_ordinal and stack_ordinal % 1_000 == 0:
            db.commit()
    db.commit()
    return len(ordered_groups), member_total


def run_stack_profile_job(config: ReviewConfig, job_id: str) -> None:
    layout = VaultLayout(config.vault_root)
    with VaultRunLock(layout.state, "stack-profile-materialize"):
        db = ManifestDB(
            layout.database,
            required_schema_version=SCHEMA_VERSION,
            feature_name="Similarity Stack materialization",
        )
        try:
            job = _mark_running(db, job_id)
            if job is None or job["status"] == "completed":
                return
            profile = db.one("SELECT * FROM stack_profiles WHERE profile_id=?", (job["subject_id"],))
            if profile is None:
                raise KeyError(f"Unknown Stack profile: {job['subject_id']}")
            settings = json.loads(profile["settings_json"])
            generation = int(profile["catalog_generation"])
            feature_version = str(profile["feature_analyzer_version"])
            inputs, partial_inputs = _materialize_stack_inputs(
                db,
                config,
                catalog_generation=generation,
                analyzer_version=feature_version,
            )
            _job_phase(
                db,
                job_id,
                "stack_candidates",
                {"profile_id": profile["profile_id"], "input_count": inputs, "partial_input_count": partial_inputs},
            )
            edge_count = _materialize_candidate_edges(
                db,
                catalog_generation=generation,
                analyzer_version=feature_version,
            )
            _job_phase(
                db,
                job_id,
                "stack_grouping",
                {
                    "profile_id": profile["profile_id"],
                    "input_count": inputs,
                    "partial_input_count": partial_inputs,
                    "candidate_edge_count": edge_count,
                },
            )
            stack_count, member_count = _materialize_profile(db, profile=profile, settings=settings)
            now = utc_now()
            db.execute(
                """UPDATE stack_profiles SET status='ready',stack_count=?,member_count=?,candidate_edge_count=?,
                       updated_at=?,completed_at=?,error_text=NULL WHERE profile_id=?""",
                (stack_count, member_count, edge_count, now, now, profile["profile_id"]),
            )
            db.execute(
                """UPDATE stack_profiles SET is_current=0 WHERE profile_id<>?
                     AND (catalog_generation<>? OR analyzer_version<>? OR feature_analyzer_version<>?)""",
                (
                    profile["profile_id"],
                    generation,
                    profile["analyzer_version"],
                    feature_version,
                ),
            )
            if profile["is_default"]:
                db.execute(
                    "UPDATE stack_profiles SET is_default=0 WHERE profile_id<>? AND is_default=1",
                    (profile["profile_id"],),
                )
            db.execute(
                "UPDATE review_application_state SET generation=generation+1,updated_at=? WHERE state_id=1",
                (now,),
            )
            progress = {
                "profile_id": profile["profile_id"],
                "input_count": inputs,
                "partial_input_count": partial_inputs,
                "candidate_edge_count": edge_count,
                "stack_count": stack_count,
                "member_count": member_count,
                "candidate_growth_bound": MAX_CANDIDATES_PER_ENTITY,
            }
            _complete_job(db, job_id, progress)
            db.commit()
        except BaseException as exc:
            if db.conn.in_transaction:
                db.conn.rollback()
            _fail_job(db, job_id, exc)
            raise
        finally:
            db.close()


def run_stage9_job(config: ReviewConfig, job_id: str, job_kind: str) -> None:
    if job_kind == "stack_profile_materialize":
        run_stack_profile_job(config, job_id)
    else:
        raise ValueError(f"Unsupported Stage 9 job kind: {job_kind}")
