from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from typing import Any, Iterable

from .config import ReviewConfig
from .core import VaultLayout, VaultRunLock, json_text, stable_id, utc_now
from .db import SCHEMA_VERSION, ManifestDB
from .review_library import current_catalog


STAGE10_JOB_KINDS = frozenset({"junk_profile_materialize", "junk_profile_calibrate"})
JUNK_SIGNAL_METHOD = "transparent-junk-signals-v1"
JUNK_PROFILE_METHOD = "explainable-junk-profile-v1"
MINIMUM_CALIBRATION_FEEDBACK = 20

JUNK_REASONS: tuple[str, ...] = (
    "extreme_blur",
    "camera_shake",
    "focus_deficit",
    "severe_underexposure",
    "severe_overexposure",
    "highlight_clipping",
    "near_black_frame",
    "possible_obstruction_or_accidental_frame",
    "screenshot_or_downloaded_graphic_likelihood",
    "tiny_or_low_resolution",
    "corruption_or_incomplete_decode",
    "exact_duplicate",
    "near_duplicate_with_better_alternative",
    "test_chart_or_calibration_likelihood",
    "blank_scan",
    "severe_compression_damage",
    "thumbnail_rather_than_original",
)

REASON_LABELS = {
    "extreme_blur": "extreme blur",
    "camera_shake": "camera shake",
    "focus_deficit": "focus deficit",
    "severe_underexposure": "severe underexposure",
    "severe_overexposure": "severe overexposure",
    "highlight_clipping": "highlight clipping",
    "near_black_frame": "near-black frame",
    "possible_obstruction_or_accidental_frame": "possible obstruction or accidental frame",
    "screenshot_or_downloaded_graphic_likelihood": "screenshot or downloaded graphic likelihood",
    "tiny_or_low_resolution": "tiny or low resolution",
    "corruption_or_incomplete_decode": "corruption or incomplete decode",
    "exact_duplicate": "exact duplicate evidence",
    "near_duplicate_with_better_alternative": "near duplicate with a better alternative",
    "test_chart_or_calibration_likelihood": "test chart or calibration likelihood",
    "blank_scan": "blank scan",
    "severe_compression_damage": "severe compression damage",
    "thumbnail_rather_than_original": "thumbnail rather than original likelihood",
}

DEFAULT_JUNK_SETTINGS: dict[str, Any] = {
    "confidence_threshold": 0.72,
    "enabled_reasons": list(JUNK_REASONS),
    "minimum_agreement": 2,
    "protect_favourites": True,
}

_METHOD_THRESHOLDS = {
    "extreme_blur": 0.82,
    "camera_shake": 0.78,
    "focus_deficit": 0.78,
    "severe_underexposure": 0.80,
    "severe_overexposure": 0.80,
    "highlight_clipping": 0.72,
    "near_black_frame": 0.85,
    "possible_obstruction_or_accidental_frame": 0.82,
    "screenshot_or_downloaded_graphic_likelihood": 0.75,
    "tiny_or_low_resolution": 0.80,
    "corruption_or_incomplete_decode": 0.50,
    "exact_duplicate": 0.95,
    "near_duplicate_with_better_alternative": 0.78,
    "test_chart_or_calibration_likelihood": 0.78,
    "blank_scan": 0.82,
    "severe_compression_damage": 0.80,
    "thumbnail_rather_than_original": 0.80,
}


def _clamp(value: float | int | None) -> float:
    if value is None:
        return 0.0
    return max(0.0, min(1.0, float(value)))


def normalize_junk_settings(
    *,
    confidence_threshold: float = 0.72,
    enabled_reasons: Iterable[str] = JUNK_REASONS,
    minimum_agreement: int = 2,
    protect_favourites: bool = True,
) -> dict[str, Any]:
    threshold = round(float(confidence_threshold), 4)
    if not 0.0 <= threshold <= 1.0:
        raise ValueError("Junk confidence threshold must be between zero and one")
    reasons = tuple(sorted(set(str(value).strip() for value in enabled_reasons)))
    if not reasons or set(reasons) - set(JUNK_REASONS):
        raise ValueError("Enabled junk reasons must be a non-empty subset of the approved registry")
    agreement = int(minimum_agreement)
    if not 1 <= agreement <= len(reasons):
        raise ValueError("Minimum junk-signal agreement must fit the enabled reason count")
    return {
        "confidence_threshold": threshold,
        "enabled_reasons": list(reasons),
        "minimum_agreement": agreement,
        "protect_favourites": bool(protect_favourites),
    }


def junk_settings_sha256(settings: dict[str, Any]) -> str:
    return hashlib.sha256(json_text(settings).encode("utf-8")).hexdigest()


def _enqueue_job(
    db: Any,
    *,
    job_id: str,
    job_kind: str,
    subject_type: str,
    subject_id: str,
    progress: dict[str, Any],
    priority: int = 25,
) -> None:
    now = utc_now()
    db.execute(
        """INSERT INTO background_jobs(
               job_id,job_kind,subject_type,subject_id,phase,status,attempt,created_at,priority,
               max_attempts,control_state,queued_at,updated_at,progress_json
           ) VALUES(?,?,?,?,?,'queued',0,?,?,3,'run',?,?,?)
           ON CONFLICT(job_id) DO NOTHING""",
        (
            job_id,
            job_kind,
            subject_type,
            subject_id,
            job_kind,
            now,
            priority,
            now,
            now,
            json_text(progress),
        ),
    )


def current_ready_junk_profile(
    db: Any,
    *,
    catalog_generation: int,
    profile_id: str | None = None,
) -> dict[str, Any] | None:
    if profile_id:
        row = db.one(
            """SELECT * FROM junk_profiles WHERE profile_id=? AND catalog_generation=?
                 AND is_current=1 AND status='ready'""",
            (profile_id, catalog_generation),
        )
    else:
        row = db.one(
            """SELECT * FROM junk_profiles WHERE catalog_generation=? AND is_current=1 AND status='ready'
                 ORDER BY is_default DESC,completed_at DESC,profile_id LIMIT 1""",
            (catalog_generation,),
        )
    return None if row is None else dict(row)


def ensure_junk_profile(
    db: Any,
    config: ReviewConfig,
    *,
    name: str,
    settings: dict[str, Any],
    is_default: bool = False,
    replaces_profile_id: str | None = None,
    calibration_parent_profile_id: str | None = None,
    calibration_version: str | None = None,
) -> dict[str, Any]:
    normalized_name = name.strip()
    if not 1 <= len(normalized_name) <= 120:
        raise ValueError("Junk profile names must contain between one and 120 characters")
    catalog = current_catalog(db)
    if catalog is None:
        raise ValueError("The persisted library catalog must be ready before junk materialization")
    catalog_generation = int(catalog["source_generation"])
    settings = normalize_junk_settings(**settings)
    settings_hash = junk_settings_sha256(settings)
    analyzer_version = config.analyzer_versions.junk_profile
    signal_version = config.analyzer_versions.junk_signals
    calibration = calibration_version or config.analyzer_versions.junk_calibration
    existing = db.one(
        """SELECT * FROM junk_profiles WHERE settings_sha256=? AND catalog_generation=?
             AND analyzer_version=? AND signal_analyzer_version=? AND calibration_version=?""",
        (settings_hash, catalog_generation, analyzer_version, signal_version, calibration),
    )
    if existing is not None:
        return dict(existing)
    profile_id = stable_id(
        "jp1", settings_hash, str(catalog_generation), analyzer_version, signal_version, calibration
    )
    job_id = stable_id("job1", "junk_profile_materialize", profile_id)
    _enqueue_job(
        db,
        job_id=job_id,
        job_kind="junk_profile_materialize",
        subject_type="junk_profile",
        subject_id=profile_id,
        progress={"profile_id": profile_id, "catalog_generation": catalog_generation},
    )
    now = utc_now()
    db.execute(
        """INSERT INTO junk_profiles(
               profile_id,name,settings_sha256,settings_json,catalog_generation,analyzer_version,
               signal_analyzer_version,calibration_version,status,is_default,is_current,
               replaces_profile_id,calibration_parent_profile_id,job_id,created_at,updated_at
           ) VALUES(?,?,?,?,?,?,?,?,'queued',?,1,?,?,?,?,?)""",
        (
            profile_id,
            normalized_name,
            settings_hash,
            json_text(settings),
            catalog_generation,
            analyzer_version,
            signal_version,
            calibration,
            int(is_default),
            replaces_profile_id,
            calibration_parent_profile_id,
            job_id,
            now,
            now,
        ),
    )
    return dict(db.one("SELECT * FROM junk_profiles WHERE profile_id=?", (profile_id,)))


def ensure_default_junk_profile(db: Any, config: ReviewConfig) -> dict[str, Any]:
    return ensure_junk_profile(
        db,
        config,
        name="Safe review",
        settings=normalize_junk_settings(**DEFAULT_JUNK_SETTINGS),
        is_default=True,
    )


def _mark_running(db: ManifestDB, job_id: str) -> dict[str, Any] | None:
    row = db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,))
    if row is None:
        raise KeyError(f"Unknown Stage 10 job: {job_id}")
    if row["status"] == "completed":
        return None
    if row["status"] not in {"queued", "retry"}:
        raise RuntimeError(f"Stage 10 job {job_id} is not claimable from {row['status']}")
    now = utc_now()
    db.execute(
        """UPDATE background_jobs SET status='running',attempt=attempt+1,phase=?,started_at=COALESCE(started_at,?),
               heartbeat_at=?,updated_at=?,error_text=NULL WHERE job_id=?""",
        (row["job_kind"], now, now, now, job_id),
    )
    if row["job_kind"] == "junk_profile_materialize":
        db.execute(
            "UPDATE junk_profiles SET status='building',updated_at=?,error_text=NULL WHERE job_id=?",
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
    db.commit()


def _fail_job(db: ManifestDB, job_id: str, exc: BaseException) -> None:
    row = db.one("SELECT attempt,max_attempts,job_kind FROM background_jobs WHERE job_id=?", (job_id,))
    if row is None:
        return
    retry = int(row["attempt"]) < int(row["max_attempts"])
    status = "queued" if retry else "failed"
    now = utc_now()
    error = f"{type(exc).__name__}: {exc}"
    db.execute(
        """UPDATE background_jobs SET status=?,completed_at=?,heartbeat_at=?,updated_at=?,error_text=?
             WHERE job_id=?""",
        (status, now if not retry else None, now, now, error, job_id),
    )
    if row["job_kind"] == "junk_profile_materialize":
        db.execute(
            "UPDATE junk_profiles SET status=?,updated_at=?,error_text=? WHERE job_id=?",
            ("queued" if retry else "error", now, error, job_id),
        )
    db.commit()


def recover_interrupted_stage10_jobs(config: ReviewConfig) -> tuple[str, ...]:
    layout = VaultLayout(config.vault_root)
    if not layout.database.is_file():
        return ()
    with VaultRunLock(layout.state, "junk-materialization-recovery"):
        db = ManifestDB(
            layout.database,
            required_schema_version=SCHEMA_VERSION,
            feature_name="junk materialization recovery",
        )
        try:
            rows = db.all(
                """SELECT job_id,job_kind,attempt,max_attempts FROM background_jobs
                     WHERE job_kind IN ('junk_profile_materialize','junk_profile_calibrate')
                       AND status='running' ORDER BY job_id"""
            )
            recovered: list[str] = []
            now = utc_now()
            for row in rows:
                retry = int(row["attempt"]) < int(row["max_attempts"])
                status = "queued" if retry else "failed"
                db.execute(
                    """UPDATE background_jobs SET status=?,completed_at=?,heartbeat_at=?,updated_at=?,
                           error_text='interrupted before durable completion' WHERE job_id=?""",
                    (status, now if not retry else None, now, now, row["job_id"]),
                )
                if row["job_kind"] == "junk_profile_materialize":
                    db.execute(
                        """UPDATE junk_profiles SET status=?,updated_at=?,
                               error_text='interrupted before durable completion' WHERE job_id=?""",
                        ("queued" if retry else "error", now, row["job_id"]),
                    )
                recovered.append(str(row["job_id"]))
            db.commit()
            return tuple(recovered)
        finally:
            db.close()


def _better_alternatives(db: ManifestDB, generation: int) -> dict[str, str]:
    rows = db.all(
        """SELECT m.entity_id,s.cover_entity_id,p.is_default,p.completed_at,p.profile_id
             FROM stack_members m JOIN stacks s USING(profile_id,stack_id)
             JOIN stack_profiles p USING(profile_id)
             WHERE p.catalog_generation=? AND p.is_current=1 AND p.status='ready'
               AND m.entity_id<>s.cover_entity_id
             ORDER BY p.is_default DESC,p.completed_at DESC,p.profile_id""",
        (generation,),
    )
    result: dict[str, str] = {}
    for row in rows:
        result.setdefault(str(row["entity_id"]), str(row["cover_entity_id"]))
    return result


def _signal_values(
    row: Any,
    *,
    better_entity_id: str | None,
    better_sharpness: float | None,
) -> dict[str, tuple[float, dict[str, Any], str | None]]:
    feature_status = str(row["feature_status"] or "missing")
    sharpness = _clamp(row["sharpness_score"])
    focus = _clamp(row["focus_deficit_score"])
    focus_better = better_entity_id if better_sharpness is not None and better_sharpness > sharpness + 0.05 else None
    if focus_better is None:
        focus = min(focus, 0.69)
    filename = str(row["filename_text"] or "").casefold()
    path_text = str(row["primary_path_text"] or "").casefold()
    graphic_markers = ("screenshot", "screen shot", "download", "wallpaper", "meme")
    chart_markers = ("testchart", "test-chart", "calibration", "colorchecker", "colourchecker", "chart")
    screenshot = 0.94 if any(value in filename or value in path_text for value in graphic_markers) else 0.0
    if str(row["format_text"] or "").upper() in {"PNG", "GIF"}:
        screenshot = max(screenshot, 0.45)
    chart = 0.92 if any(value in filename or value in path_text for value in chart_markers) else 0.0
    width = int(row["width"] or 0)
    height = int(row["height"] or 0)
    pixels = width * height
    low_resolution = 1.0 if pixels and pixels < 160_000 else 0.85 if pixels and pixels < 480_000 else 0.0
    incomplete = bool(row["incomplete_decode"])
    exact = 1.0 if int(row["exact_duplicate_count"] or 0) > 0 else 0.0
    near = 0.95 if better_entity_id and int(row["near_duplicate_count"] or 0) > 0 else 0.0
    base = {
        "feature_status": feature_status,
        "feature_id": row["feature_id"],
        "display_asset_id": row["display_asset_id"],
    }
    return {
        "extreme_blur": (
            _clamp(focus * 1.05) if focus_better is not None else min(focus, 0.69),
            {**base, "focus_deficit": focus, "sharper_related_frame": focus_better},
            focus_better,
        ),
        "camera_shake": (_clamp(row["directional_shake_score"]), {**base, "directional_shake": row["directional_shake_score"]}, better_entity_id),
        "focus_deficit": (focus, {**base, "sharper_related_frame": focus_better, "sharpness": sharpness, "better_sharpness": better_sharpness}, focus_better),
        "severe_underexposure": (_clamp(row["underexposure_score"]), {**base, "underexposure": row["underexposure_score"]}, better_entity_id),
        "severe_overexposure": (_clamp(row["overexposure_score"]), {**base, "overexposure": row["overexposure_score"]}, better_entity_id),
        "highlight_clipping": (_clamp(row["highlight_clipping_score"]), {**base, "highlight_clipping": row["highlight_clipping_score"]}, better_entity_id),
        "near_black_frame": (_clamp(row["near_black_score"]), {**base, "near_black": row["near_black_score"]}, better_entity_id),
        "possible_obstruction_or_accidental_frame": (_clamp(row["obstruction_score"]), {**base, "obstruction": row["obstruction_score"], "semantic_limit": "possible obstruction or accidental frame"}, better_entity_id),
        "screenshot_or_downloaded_graphic_likelihood": (screenshot, {**base, "filename_or_path_markers": [value for value in graphic_markers if value in filename or value in path_text], "format": row["format_text"]}, None),
        "tiny_or_low_resolution": (low_resolution, {**base, "width": width, "height": height, "pixels": pixels, "resolution_class": row["resolution_class"]}, better_entity_id),
        "corruption_or_incomplete_decode": (max(_clamp(row["corruption_score"]), float(incomplete)), {**base, "corruption": row["corruption_score"], "incomplete_decode": incomplete}, better_entity_id),
        "exact_duplicate": (exact, {**base, "exact_duplicate_count": int(row["exact_duplicate_count"] or 0), "logical_entity_note": "exact source occurrences already share this logical entity"}, None),
        "near_duplicate_with_better_alternative": (near, {**base, "near_duplicate_count": int(row["near_duplicate_count"] or 0), "better_alternative": better_entity_id}, better_entity_id),
        "test_chart_or_calibration_likelihood": (chart, {**base, "filename_or_path_markers": [value for value in chart_markers if value in filename or value in path_text], "requires_multiple_signals_in_default_profile": True}, None),
        "blank_scan": (_clamp(max(_clamp(row["blankness_score"]), _clamp(row["low_information_score"]))), {**base, "blankness": row["blankness_score"], "low_information": row["low_information_score"]}, better_entity_id),
        "severe_compression_damage": (_clamp(row["blockiness_score"]), {**base, "blockiness": row["blockiness_score"]}, better_entity_id),
        "thumbnail_rather_than_original": (_clamp(row["thumbnail_likelihood"]), {**base, "thumbnail_likelihood": row["thumbnail_likelihood"], "resolution_class": row["resolution_class"]}, better_entity_id),
    }


def _materialize_signals(
    db: ManifestDB,
    *,
    generation: int,
    analyzer_version: str,
) -> tuple[int, int]:
    rows = db.all(
        """SELECT e.*,f.feature_id,f.status AS feature_status,f.input_identity AS feature_input_identity,
                  f.sharpness_score,f.focus_deficit_score,f.directional_shake_score,f.motion_score,
                  f.underexposure_score,f.overexposure_score,f.highlight_clipping_score,f.near_black_score,
                  f.blankness_score,f.obstruction_score,f.low_information_score,f.blockiness_score,
                  f.corruption_score,f.incomplete_decode,f.resolution_class,f.thumbnail_likelihood
             FROM photo_entities e LEFT JOIN asset_features f ON f.feature_id=(
               SELECT feature_id FROM asset_features candidate WHERE candidate.asset_id=e.display_asset_id
                 AND candidate.is_current=1 ORDER BY candidate.updated_at DESC,candidate.feature_id DESC LIMIT 1
             )
             WHERE e.catalog_generation=? AND e.is_current=1 ORDER BY e.entity_id""",
        (generation,),
    )
    alternatives = _better_alternatives(db, generation)
    sharpness_by_entity = {str(row["entity_id"]): _clamp(row["sharpness_score"]) for row in rows}
    db.execute(
        "UPDATE junk_signals SET is_current=0 WHERE catalog_generation=? AND method_version=?",
        (generation, analyzer_version),
    )
    now = utc_now()
    signal_count = partial_count = 0
    for row in rows:
        entity_id = str(row["entity_id"])
        better = alternatives.get(entity_id)
        values = _signal_values(
            row,
            better_entity_id=better,
            better_sharpness=sharpness_by_entity.get(better or ""),
        )
        input_identity = stable_id(
            "jsi1",
            entity_id,
            str(row["feature_input_identity"] or "missing"),
            str(row["exact_duplicate_count"] or 0),
            str(row["near_duplicate_count"] or 0),
            str(better or ""),
        )
        status = "ready" if row["feature_status"] == "ready" else "partial"
        partial_count += int(status != "ready")
        for reason in JUNK_REASONS:
            confidence, evidence, better_for_reason = values[reason]
            signal_id = stable_id("js1", str(generation), entity_id, reason, analyzer_version, input_identity)
            db.execute(
                """INSERT INTO junk_signals(
                       signal_id,catalog_generation,entity_id,reason,confidence,threshold,method_version,
                       input_identity,status,is_current,evidence_json,better_alternative_entity_id,
                       error_text,created_at,updated_at
                   ) VALUES(?,?,?,?,?,?,?,?,?,1,?,?,?,?,?)
                   ON CONFLICT(catalog_generation,entity_id,reason,method_version,input_identity) DO UPDATE SET
                       confidence=excluded.confidence,threshold=excluded.threshold,status=excluded.status,
                       is_current=1,evidence_json=excluded.evidence_json,
                       better_alternative_entity_id=excluded.better_alternative_entity_id,
                       error_text=excluded.error_text,updated_at=excluded.updated_at""",
                (
                    signal_id,
                    generation,
                    entity_id,
                    reason,
                    round(confidence, 6),
                    _METHOD_THRESHOLDS[reason],
                    analyzer_version,
                    input_identity,
                    status,
                    json_text(evidence),
                    better_for_reason,
                    None if status == "ready" else "Stage 4 feature evidence is incomplete",
                    now,
                    now,
                ),
            )
            signal_count += 1
    return signal_count, partial_count


def _explanation(reasons: list[dict[str, Any]], better: str | None) -> str:
    if not reasons:
        return "Not hidden: no enabled persisted signal reaches this profile's confidence threshold."
    descriptions = [
        f"{REASON_LABELS[item['reason']]} confidence is {round(float(item['confidence']) * 100):d}%"
        for item in reasons[:3]
    ]
    suffix = f" A better alternative is {better}." if better else ""
    return "Hidden because " + "; and ".join(descriptions) + "." + suffix


def _materialize_results(db: ManifestDB, profile: Any, settings: dict[str, Any]) -> tuple[int, int, int]:
    generation = int(profile["catalog_generation"])
    signals = db.all(
        """SELECT * FROM junk_signals WHERE catalog_generation=? AND method_version=? AND is_current=1
             ORDER BY entity_id,confidence DESC,reason""",
        (generation, profile["signal_analyzer_version"]),
    )
    by_entity: dict[str, list[Any]] = defaultdict(list)
    for signal in signals:
        by_entity[str(signal["entity_id"])].append(signal)
    entities = db.all(
        """SELECT e.entity_id,s.favourite FROM photo_entities e JOIN photo_user_state s USING(entity_id)
             WHERE e.catalog_generation=? AND e.is_current=1 ORDER BY e.entity_id""",
        (generation,),
    )
    enabled = set(settings["enabled_reasons"])
    threshold = float(settings["confidence_threshold"])
    minimum = int(settings["minimum_agreement"])
    values: list[dict[str, Any]] = []
    for entity in entities:
        entity_id = str(entity["entity_id"])
        qualified = []
        for signal in by_entity.get(entity_id, []):
            if signal["reason"] not in enabled or float(signal["confidence"]) < threshold:
                continue
            qualified.append(
                {
                    "reason": signal["reason"],
                    "label": REASON_LABELS[str(signal["reason"])],
                    "confidence": float(signal["confidence"]),
                    "method_threshold": float(signal["threshold"]),
                    "method_version": signal["method_version"],
                    "evidence": json.loads(signal["evidence_json"]),
                    "better_alternative_entity_id": signal["better_alternative_entity_id"],
                }
            )
        qualified.sort(key=lambda item: (-item["confidence"], item["reason"]))
        favourite_protected = bool(entity["favourite"]) and bool(settings["protect_favourites"])
        hidden = len(qualified) >= minimum and not favourite_protected
        better = next(
            (str(item["better_alternative_entity_id"]) for item in qualified if item["better_alternative_entity_id"]),
            None,
        )
        explanation = _explanation(qualified, better)
        if favourite_protected and len(qualified) >= minimum:
            explanation = "Not hidden because this favourite is protected. " + explanation
        values.append(
            {
                "entity_id": entity_id,
                "hidden": hidden,
                "favourite_protected": favourite_protected and len(qualified) >= minimum,
                "reasons": qualified,
                "better": better,
                "explanation": explanation,
                "score": max((item["confidence"] for item in qualified), default=0.0),
            }
        )
    values.sort(key=lambda item: (not item["hidden"], -item["score"], item["entity_id"]))
    profile_id = str(profile["profile_id"])
    db.execute("DELETE FROM junk_effective_results WHERE profile_id=?", (profile_id,))
    now = utc_now()
    for ordinal, value in enumerate(values):
        db.execute(
            """INSERT INTO junk_effective_results(
                   profile_id,entity_id,ordinal,effective_hidden,favourite_protected,agreement_count,
                   reason_count,reasons_json,explanation_text,better_alternative_entity_id,created_at
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
            (
                profile_id,
                value["entity_id"],
                ordinal,
                int(value["hidden"]),
                int(value["favourite_protected"]),
                len(value["reasons"]),
                len(value["reasons"]),
                json_text(value["reasons"]),
                value["explanation"],
                value["better"],
                now,
            ),
        )
    return (
        len(values),
        sum(int(value["hidden"]) for value in values),
        sum(int(value["favourite_protected"]) for value in values),
    )


def run_junk_profile_job(config: ReviewConfig, job_id: str) -> None:
    layout = VaultLayout(config.vault_root)
    with VaultRunLock(layout.state, "junk-profile-materialize"):
        db = ManifestDB(
            layout.database,
            required_schema_version=SCHEMA_VERSION,
            feature_name="junk profile materialization",
        )
        try:
            job = _mark_running(db, job_id)
            if job is None:
                return
            profile = db.one("SELECT * FROM junk_profiles WHERE profile_id=?", (job["subject_id"],))
            if profile is None:
                raise KeyError(f"Unknown junk profile: {job['subject_id']}")
            settings = json.loads(profile["settings_json"])
            signal_count, partial_count = _materialize_signals(
                db,
                generation=int(profile["catalog_generation"]),
                analyzer_version=str(profile["signal_analyzer_version"]),
            )
            db.commit()
            _job_phase(
                db,
                job_id,
                "junk_signals",
                {"profile_id": profile["profile_id"], "signal_count": signal_count, "partial_entity_count": partial_count},
            )
            result_count, hidden_count, protected_count = _materialize_results(db, profile, settings)
            now = utc_now()
            db.execute(
                """UPDATE junk_profiles SET status='ready',result_count=?,effectively_hidden_count=?,
                       favourite_protected_count=?,updated_at=?,completed_at=?,error_text=NULL WHERE profile_id=?""",
                (result_count, hidden_count, protected_count, now, now, profile["profile_id"]),
            )
            if profile["is_default"]:
                db.execute(
                    """UPDATE junk_profiles SET is_default=0 WHERE profile_id<>? AND is_default=1
                         AND catalog_generation=?""",
                    (profile["profile_id"], profile["catalog_generation"]),
                )
            db.commit()
            _complete_job(
                db,
                job_id,
                {
                    "profile_id": profile["profile_id"],
                    "signal_count": signal_count,
                    "partial_entity_count": partial_count,
                    "result_count": result_count,
                    "effectively_hidden_count": hidden_count,
                    "favourite_protected_count": protected_count,
                    "media_mutation": "none",
                },
            )
        except BaseException as exc:
            _fail_job(db, job_id, exc)
            raise
        finally:
            db.close()


def enqueue_calibration_if_ready(db: Any, profile_id: str) -> str | None:
    rows = db.all(
        """SELECT feedback_id FROM junk_feedback WHERE profile_id=? AND calibration_job_id IS NULL
             ORDER BY feedback_id LIMIT ?""",
        (profile_id, MINIMUM_CALIBRATION_FEEDBACK),
    )
    if len(rows) < MINIMUM_CALIBRATION_FEEDBACK:
        return None
    feedback_ids = [int(row["feedback_id"]) for row in rows]
    job_id = stable_id("job1", "junk_profile_calibrate", profile_id, str(feedback_ids[-1]))
    _enqueue_job(
        db,
        job_id=job_id,
        job_kind="junk_profile_calibrate",
        subject_type="junk_profile",
        subject_id=profile_id,
        progress={"profile_id": profile_id, "feedback_ids": feedback_ids},
        priority=20,
    )
    db.execute(
        f"UPDATE junk_feedback SET calibration_job_id=? WHERE feedback_id IN ({','.join('?' for _ in feedback_ids)})",
        (job_id, *feedback_ids),
    )
    return job_id


def run_junk_calibration_job(config: ReviewConfig, job_id: str) -> None:
    layout = VaultLayout(config.vault_root)
    with VaultRunLock(layout.state, "junk-profile-calibrate"):
        db = ManifestDB(
            layout.database,
            required_schema_version=SCHEMA_VERSION,
            feature_name="junk feedback calibration",
        )
        try:
            job = _mark_running(db, job_id)
            if job is None:
                return
            progress = json.loads(job["progress_json"])
            feedback_ids = [int(value) for value in progress.get("feedback_ids", [])]
            if len(feedback_ids) < MINIMUM_CALIBRATION_FEEDBACK:
                raise RuntimeError("Calibration requires the persisted minimum feedback count")
            rows = db.all(
                f"SELECT * FROM junk_feedback WHERE feedback_id IN ({','.join('?' for _ in feedback_ids)}) ORDER BY feedback_id",
                feedback_ids,
            )
            profile = db.one("SELECT * FROM junk_profiles WHERE profile_id=?", (job["subject_id"],))
            if profile is None:
                raise KeyError(f"Unknown junk profile: {job['subject_id']}")
            settings = json.loads(profile["settings_json"])
            false_positives = sum(row["feedback_kind"] == "false_positive" for row in rows)
            false_negatives = sum(row["feedback_kind"] == "false_negative" for row in rows)
            delta = 0.05 if false_positives > false_negatives else -0.05 if false_negatives > false_positives else 0.0
            settings["confidence_threshold"] = round(
                max(0.0, min(1.0, float(settings["confidence_threshold"]) + delta)), 4
            )
            calibrated = ensure_junk_profile(
                db,
                config,
                name=f"{profile['name']} calibrated",
                settings=settings,
                replaces_profile_id=str(profile["profile_id"]),
                calibration_parent_profile_id=str(profile["profile_id"]),
                calibration_version=f"{config.analyzer_versions.junk_calibration}:{job_id}",
            )
            db.execute(
                f"UPDATE junk_feedback SET applied_profile_id=? WHERE feedback_id IN ({','.join('?' for _ in feedback_ids)})",
                (calibrated["profile_id"], *feedback_ids),
            )
            db.commit()
            _complete_job(
                db,
                job_id,
                {
                    "profile_id": profile["profile_id"],
                    "calibrated_profile_id": calibrated["profile_id"],
                    "materialization_job_id": calibrated["job_id"],
                    "feedback_count": len(rows),
                    "false_positive_count": false_positives,
                    "false_negative_count": false_negatives,
                    "threshold_delta": delta,
                },
            )
        except BaseException as exc:
            _fail_job(db, job_id, exc)
            raise
        finally:
            db.close()


def junk_result_query_plan(db: ManifestDB, profile_id: str) -> tuple[str, ...]:
    rows = db.all(
        """EXPLAIN QUERY PLAN SELECT entity_id FROM junk_effective_results
             INDEXED BY idx_junk_results_hidden_page
             WHERE profile_id=? AND effective_hidden=1 AND ordinal>? ORDER BY ordinal,entity_id LIMIT ?""",
        (profile_id, -1, 100),
    )
    return tuple(str(row[3]) for row in rows)


def run_stage10_job(config: ReviewConfig, job_id: str, job_kind: str) -> None:
    if job_kind == "junk_profile_materialize":
        run_junk_profile_job(config, job_id)
        return
    if job_kind == "junk_profile_calibrate":
        run_junk_calibration_job(config, job_id)
        return
    raise ValueError(f"Unsupported Stage 10 job kind: {job_kind}")
