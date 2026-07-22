from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Iterable

from .config import ReviewConfig
from .core import VaultLayout, VaultRunLock, json_text, stable_id, utc_now
from .db import SCHEMA_VERSION, ManifestDB


STAGE7_JOB_KINDS = frozenset({"library_catalog_materialize", "library_view_materialize"})
LIBRARY_SORT_FIELDS = frozenset(
    {
        "capture_time",
        "import_time",
        "filename",
        "favourite",
        "rejected",
        "rating",
        "quality",
        "width",
        "height",
        "size",
        "camera",
        "lens",
        "exposure",
        "similarity",
        "random",
    }
)
LIBRARY_FACETS = frozenset({"media_kind", "format", "camera", "lens", "folder"})
ORGANIZATION_FILTER_KINDS = frozenset({"calendar", "folder", "camera", "lens", "map"})
DEFAULT_RANDOM_SEED = "media-vault-default"

LIBRARY_SORT_SQL = {
    "capture_time": "e.capture_sort_text COLLATE BINARY",
    "import_time": "e.import_sort_text COLLATE BINARY",
    "filename": "e.filename_text COLLATE BINARY",
    "favourite": "s.favourite",
    "rejected": "s.rejected",
    "rating": "s.rating",
    "quality": "e.quality_sort",
    "width": "COALESCE(e.width,-1)",
    "height": "COALESCE(e.height,-1)",
    "size": "e.size_bytes",
    "camera": "COALESCE(e.camera_model,'') COLLATE BINARY",
    "lens": "COALESCE(e.lens_model,'') COLLATE BINARY",
    "exposure": "e.exposure_sort",
    "similarity": "e.similarity_key COLLATE BINARY",
    "random": "e.random_key COLLATE BINARY",
}

LIBRARY_SORT_INDEX = {
    "capture_time": "idx_photo_entities_capture",
    "import_time": "idx_photo_entities_import",
    "filename": "idx_photo_entities_filename",
    "quality": "idx_photo_entities_quality",
    "width": "idx_photo_entities_dimensions",
    "height": "idx_photo_entities_height",
    "size": "idx_photo_entities_size",
    "camera": "idx_photo_entities_camera",
    "lens": "idx_photo_entities_lens",
    "exposure": "idx_photo_entities_exposure",
    "similarity": "idx_photo_entities_similarity",
    "random": "idx_photo_entities_random",
}


def normalize_library_query(
    *,
    media_kinds: Iterable[str] = (),
    formats: Iterable[str] = (),
    cameras: Iterable[str] = (),
    lenses: Iterable[str] = (),
    folders: Iterable[str] = (),
    favourite: bool | None = None,
    rejected: bool | None = False,
    rating_min: int = 0,
    rating_max: int = 5,
    search: str | None = None,
    sorts: Iterable[tuple[str, str]] = (("capture_time", "desc"),),
    random_seed: str = DEFAULT_RANDOM_SEED,
    organization_kind: str | None = None,
    organization_key: str | None = None,
    stack_profile_id: str | None = None,
) -> dict[str, Any]:
    def values(items: Iterable[str], label: str) -> list[str]:
        result = sorted({str(item).strip() for item in items if str(item).strip()})
        if len(result) > 20 or any(len(item) > 160 for item in result):
            raise ValueError(f"Library {label} filters exceed the bounded contract")
        return result

    normalized_sorts = tuple((field.strip(), direction.strip().lower()) for field, direction in sorts)
    if not normalized_sorts or len(normalized_sorts) > 3:
        raise ValueError("Library sorts must contain between one and three fields")
    if len({field for field, _direction in normalized_sorts}) != len(normalized_sorts):
        raise ValueError("Library sort fields may not be repeated")
    for field, direction in normalized_sorts:
        if field not in LIBRARY_SORT_FIELDS or direction not in {"asc", "desc"}:
            raise ValueError("Unsupported library sort field or direction")
    if not 0 <= rating_min <= 5 or not 0 <= rating_max <= 5 or rating_min > rating_max:
        raise ValueError("Rating bounds must be between zero and five")
    normalized_search = (search or "").strip()
    if len(normalized_search) > 256:
        raise ValueError("Library search is limited to 256 characters")
    seed = random_seed.strip()
    if not seed or len(seed) > 64:
        raise ValueError("Random seed must contain between one and 64 characters")
    normalized_organization_kind = (organization_kind or "").strip()
    normalized_organization_key = (organization_key or "").strip()
    if bool(normalized_organization_kind) != bool(normalized_organization_key):
        raise ValueError("Organization kind and key must be supplied together")
    if normalized_organization_kind and normalized_organization_kind not in ORGANIZATION_FILTER_KINDS:
        raise ValueError("Unsupported organization filter kind")
    if len(normalized_organization_key) > 200:
        raise ValueError("Organization filter keys are limited to 200 characters")
    normalized_stack_profile_id = (stack_profile_id or "").strip()
    if len(normalized_stack_profile_id) > 160:
        raise ValueError("Stack profile identifiers are limited to 160 characters")
    return {
        "media_kinds": values(media_kinds, "media-kind"),
        "formats": values(formats, "format"),
        "cameras": values(cameras, "camera"),
        "lenses": values(lenses, "lens"),
        "folders": values(folders, "folder"),
        "favourite": favourite,
        "rejected": rejected,
        "rating_min": rating_min,
        "rating_max": rating_max,
        "search": normalized_search,
        "sorts": [{"field": field, "direction": direction} for field, direction in normalized_sorts],
        "random_seed": seed,
        "organization_kind": normalized_organization_kind,
        "organization_key": normalized_organization_key,
        "stack_profile_id": normalized_stack_profile_id,
    }


def library_query_sha256(query: dict[str, Any]) -> str:
    return hashlib.sha256(json_text(query).encode("utf-8")).hexdigest()


def is_common_library_query(query: dict[str, Any]) -> bool:
    if query["search"] or query.get("organization_kind") or query.get("stack_profile_id") or len(query["sorts"]) != 1:
        return False
    field = query["sorts"][0]["field"]
    if field == "random" and query["random_seed"] != DEFAULT_RANDOM_SEED:
        return False
    exact_values = [query[name] for name in ("media_kinds", "formats", "cameras", "lenses", "folders")]
    exact_filters = sum(bool(values) for values in exact_values)
    if exact_filters == 0:
        return True
    return (
        exact_filters == 1
        and field == "capture_time"
        and all(len(values) <= 1 for values in exact_values)
        and not query["cameras"]
        and not query["lenses"]
    )


def current_catalog(db: Any) -> dict[str, Any] | None:
    row = db.one(
        """SELECT * FROM materialized_views
             WHERE view_kind='library_catalog' AND is_current=1 AND status='ready'
             ORDER BY source_generation DESC,view_id DESC LIMIT 1"""
    )
    return None if row is None else dict(row)


def _enqueue_job(
    db: Any,
    *,
    job_kind: str,
    subject_type: str,
    subject_id: str,
    progress: dict[str, Any],
    priority: int,
    job_id: str,
) -> None:
    if job_kind not in STAGE7_JOB_KINDS:
        raise ValueError(f"Unsupported Stage 7 job kind: {job_kind}")
    now = utc_now()
    db.execute(
        """INSERT INTO background_jobs(
               job_id,job_kind,subject_type,subject_id,phase,status,attempt,created_at,
               heartbeat_at,progress_json,priority,max_attempts,control_state,queued_at,updated_at
           ) VALUES(?,?,?,?,?,'queued',0,?,?,?,?,3,'run',?,?)
           ON CONFLICT(job_id) DO NOTHING""",
        (
            job_id,
            job_kind,
            subject_type,
            subject_id,
            job_kind,
            now,
            now,
            json_text(progress),
            priority,
            now,
            now,
        ),
    )


def ensure_catalog_job(db: Any, config: ReviewConfig, *, force: bool = False) -> dict[str, Any]:
    if not force:
        active = db.one(
            """SELECT * FROM materialized_views
                 WHERE view_kind='library_catalog' AND is_current=1
                   AND status IN ('queued','building','ready')
                 ORDER BY source_generation DESC,view_id DESC LIMIT 1"""
        )
        if active is not None:
            return dict(active)
    row = db.one(
        "SELECT COALESCE(MAX(source_generation),0) AS generation FROM materialized_views WHERE view_kind='library_catalog'"
    )
    generation = int(row["generation"]) + 1
    query = {"catalog": "logical-photo-entities", "generation": generation}
    query_hash = library_query_sha256(query)
    version = config.analyzer_versions.materialized_view
    view_id = stable_id("mv1", "library_catalog", generation, version)
    job_id = stable_id("job1", "library_catalog_materialize", view_id)
    _enqueue_job(
        db,
        job_kind="library_catalog_materialize",
        subject_type="materialized_view",
        subject_id=view_id,
        progress={"view_id": view_id, "catalog_generation": generation},
        priority=30,
        job_id=job_id,
    )
    now = utc_now()
    db.execute(
        """INSERT INTO materialized_views(
               view_id,view_kind,query_sha256,query_json,source_generation,analyzer_version,
               status,is_current,job_id,created_at,updated_at
           ) VALUES(?,?,?,?,?,?,'queued',1,?,?,?)""",
        (view_id, "library_catalog", query_hash, json_text(query), generation, version, job_id, now, now),
    )
    return dict(db.one("SELECT * FROM materialized_views WHERE view_id=?", (view_id,)))


def ensure_library_view(
    db: Any,
    config: ReviewConfig,
    *,
    catalog_generation: int,
    state_generation: int,
    query: dict[str, Any],
) -> dict[str, Any]:
    query_hash = library_query_sha256(query)
    version = config.analyzer_versions.materialized_view
    row = db.one(
        """SELECT * FROM materialized_views
             WHERE view_kind='library_query' AND query_sha256=? AND source_generation=?
               AND state_generation=? AND analyzer_version=?""",
        (query_hash, catalog_generation, state_generation, version),
    )
    if row is not None:
        return dict(row)
    view_id = stable_id("mv1", "library_query", catalog_generation, state_generation, query_hash, version)
    job_id = stable_id("job1", "library_view_materialize", view_id)
    _enqueue_job(
        db,
        job_kind="library_view_materialize",
        subject_type="materialized_view",
        subject_id=view_id,
        progress={
            "view_id": view_id,
            "catalog_generation": catalog_generation,
            "state_generation": state_generation,
        },
        priority=20,
        job_id=job_id,
    )
    now = utc_now()
    db.execute(
        """INSERT INTO materialized_views(
               view_id,view_kind,query_sha256,query_json,source_generation,state_generation,analyzer_version,
               status,is_current,job_id,created_at,updated_at
           ) VALUES(?,?,?,?,?,?,?,'queued',1,?,?,?)""",
        (
            view_id,
            "library_query",
            query_hash,
            json_text(query),
            catalog_generation,
            state_generation,
            version,
            job_id,
            now,
            now,
        ),
    )
    return dict(db.one("SELECT * FROM materialized_views WHERE view_id=?", (view_id,)))


def _mark_running(db: ManifestDB, job_id: str) -> dict[str, Any] | None:
    db.execute("BEGIN IMMEDIATE")
    row = db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,))
    if row is None:
        db.conn.rollback()
        raise KeyError(f"Unknown Stage 7 job: {job_id}")
    if row["status"] == "completed":
        db.conn.rollback()
        return dict(row)
    if row["status"] not in {"queued", "failed", "interrupted"}:
        db.conn.rollback()
        return None
    now = utc_now()
    updated = db.execute(
        """UPDATE background_jobs SET status='running',attempt=attempt+1,phase=?,
               started_at=COALESCE(started_at,?),heartbeat_at=?,updated_at=?,completed_at=NULL,error_text=NULL
             WHERE job_id=? AND status=? AND control_state='run'""",
        (row["job_kind"], now, now, now, job_id, row["status"]),
    )
    if updated.rowcount != 1:
        db.conn.rollback()
        return None
    db.execute(
        "UPDATE materialized_views SET status='building',updated_at=?,error_text=NULL WHERE job_id=?",
        (now, job_id),
    )
    db.commit()
    return dict(db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,)))


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
    job_status = "queued" if retry else "failed"
    view_status = "queued" if retry else "error"
    db.execute(
        """UPDATE background_jobs SET status=?,completed_at=?,heartbeat_at=?,updated_at=?,error_text=?,
               queued_at=CASE WHEN ? THEN ? ELSE queued_at END,
               claim_token=NULL,claimed_by=NULL,lease_expires_at=NULL
             WHERE job_id=?""",
        (job_status, None if retry else now, now, now, error, int(retry), now, job_id),
    )
    db.execute(
        "UPDATE materialized_views SET status=?,updated_at=?,error_text=? WHERE job_id=?",
        (view_status, now, error, job_id),
    )
    db.commit()


def recover_interrupted_stage7_jobs(config: ReviewConfig) -> tuple[str, ...]:
    """Requeue orphaned Stage 7 work only while holding the single-writer guard."""
    layout = VaultLayout(config.vault_root)
    try:
        lock = VaultRunLock(layout.state, "library-materialization-recovery")
        with lock:
            db = ManifestDB(
                layout.database,
                required_schema_version=SCHEMA_VERSION,
                feature_name="library materialization recovery",
            )
            try:
                placeholders = ",".join("?" for _kind in STAGE7_JOB_KINDS)
                rows = db.all(
                    f"""SELECT job_id,attempt,max_attempts FROM background_jobs
                          WHERE job_kind IN ({placeholders}) AND status='running'
                          ORDER BY job_id""",
                    tuple(sorted(STAGE7_JOB_KINDS)),
                )
                now = utc_now()
                recovered: list[str] = []
                for row in rows:
                    retry = int(row["attempt"]) < int(row["max_attempts"])
                    job_status = "queued" if retry else "failed"
                    view_status = "queued" if retry else "error"
                    error = (
                        "Worker stopped before the terminal materialization commit; "
                        "partial view rows remain hidden and will be replaced on retry"
                    )
                    db.execute(
                        """UPDATE background_jobs SET status=?,completed_at=?,heartbeat_at=?,updated_at=?,
                               queued_at=CASE WHEN ? THEN ? ELSE queued_at END,error_text=?,claim_token=NULL,
                               claimed_by=NULL,lease_expires_at=NULL WHERE job_id=? AND status='running'""",
                        (
                            job_status,
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
                        "UPDATE materialized_views SET status=?,updated_at=?,error_text=? WHERE job_id=?",
                        (view_status, now, error, row["job_id"]),
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


def _accepted_groups(db: ManifestDB) -> tuple[dict[str, str], dict[str, list[dict[str, Any]]]]:
    rows = db.all(
        """SELECT g.raw_jpeg_group_id,g.anchor_raw_asset_id,g.confidence_label AS group_confidence_label,
                  g.confidence_score AS group_confidence_score,g.evidence_json AS group_evidence_json,
                  m.asset_id,m.role,m.confidence_label,m.confidence_score,m.evidence_json
             FROM raw_jpeg_groups g JOIN runs r ON r.run_id=g.created_run_id
             JOIN raw_jpeg_members m USING(raw_jpeg_group_id)
             JOIN assets a ON a.asset_id=m.asset_id
             WHERE r.status='completed' AND g.confidence_score>=0.8 AND m.ambiguous=0
               AND m.confidence_score>=0.8 AND a.object_status='verified'
             ORDER BY g.confidence_score DESC,m.confidence_score DESC,g.raw_jpeg_group_id,m.asset_id"""
    )
    member_anchor: dict[str, str] = {}
    groups: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        anchor = str(row["anchor_raw_asset_id"])
        asset_id = str(row["asset_id"])
        existing = member_anchor.get(asset_id)
        if existing is not None and existing != anchor:
            continue
        member_anchor[asset_id] = anchor
        groups.setdefault(anchor, []).append(dict(row))
    return member_anchor, groups


def _rows_for_ids(db: ManifestDB, sql: str, ids: list[str]) -> list[Any]:
    if not ids:
        return []
    rows: list[Any] = []
    for start in range(0, len(ids), 400):
        chunk = ids[start : start + 400]
        rows.extend(db.all(sql.format(placeholders=",".join("?" for _ in chunk)), chunk))
    return rows


def _catalog_entity_rows(db: ManifestDB, generation: int) -> tuple[int, int]:
    member_anchor, groups = _accepted_groups(db)
    grouped_ids = sorted(member_anchor)
    grouped_assets = {
        str(row["asset_id"]): dict(row)
        for row in _rows_for_ids(
            db,
            "SELECT * FROM assets WHERE asset_id IN ({placeholders}) AND object_status='verified'",
            grouped_ids,
        )
    }
    cursor = db.execute("SELECT * FROM assets WHERE object_status='verified' ORDER BY asset_id")
    entity_count = member_count = 0
    now = utc_now()
    while True:
        asset_rows = cursor.fetchmany(1_000)
        if not asset_rows:
            break
        anchors = [str(row["asset_id"]) for row in asset_rows if member_anchor.get(str(row["asset_id"]), str(row["asset_id"])) == str(row["asset_id"])]
        metadata_rows = _rows_for_ids(
            db,
            """SELECT * FROM asset_extended_metadata WHERE asset_id IN ({placeholders})
                 AND is_current=1 ORDER BY updated_at DESC,metadata_id DESC""",
            anchors,
        )
        feature_rows = _rows_for_ids(
            db,
            """SELECT * FROM asset_features WHERE asset_id IN ({placeholders})
                 AND is_current=1 ORDER BY updated_at DESC,feature_id DESC""",
            anchors,
        )
        source_rows = _rows_for_ids(
            db,
            """SELECT asset_id,path_text,relative_path_text,present FROM source_files
                 WHERE asset_id IN ({placeholders}) ORDER BY present DESC,path_text COLLATE BINARY""",
            anchors,
        )
        occurrence_rows = _rows_for_ids(
            db,
            """SELECT asset_id,COUNT(*) AS occurrence_count FROM source_files
                 WHERE asset_id IN ({placeholders}) GROUP BY asset_id""",
            sorted({member for anchor in anchors for member in [anchor, *[str(item["asset_id"]) for item in groups.get(anchor, [])]]}),
        )
        relationship_rows: list[Any] = []
        for start in range(0, len(anchors), 400):
            chunk = anchors[start : start + 400]
            placeholders = ",".join("?" for _ in chunk)
            relationship_rows.extend(
                db.all(
                    f"""SELECT asset_id,COUNT(*) AS relation_count FROM (
                           SELECT left_asset_id AS asset_id FROM relationships WHERE left_asset_id IN ({placeholders})
                           UNION ALL SELECT right_asset_id AS asset_id FROM relationships WHERE right_asset_id IN ({placeholders})
                       ) GROUP BY asset_id""",
                    (*chunk, *chunk),
                )
            )
        metadata = {}
        for row in metadata_rows:
            metadata.setdefault(str(row["asset_id"]), row)
        features = {}
        for row in feature_rows:
            features.setdefault(str(row["asset_id"]), row)
        sources = {}
        for row in source_rows:
            sources.setdefault(str(row["asset_id"]), row)
        occurrences = {str(row["asset_id"]): int(row["occurrence_count"]) for row in occurrence_rows}
        relations = {str(row["asset_id"]): int(row["relation_count"]) for row in relationship_rows}
        for asset in asset_rows:
            anchor_id = str(asset["asset_id"])
            if member_anchor.get(anchor_id, anchor_id) != anchor_id:
                continue
            accepted_members = groups.get(anchor_id, [])
            member_ids = sorted({anchor_id, *[str(item["asset_id"]) for item in accepted_members]})
            member_assets = [grouped_assets.get(member_id) for member_id in member_ids]
            member_assets = [item for item in member_assets if item is not None]
            if not member_assets:
                member_assets = [dict(asset)]
            meta = metadata.get(anchor_id)
            feature = features.get(anchor_id)
            display_asset_id = str(meta["display_source_asset_id"]) if meta and meta["display_source_asset_id"] else anchor_id
            if display_asset_id not in {str(item["asset_id"]) for item in member_assets}:
                display_asset_id = anchor_id
            primary = sources.get(anchor_id)
            primary_path = str(primary["path_text"]) if primary else None
            relative_path = str(primary["relative_path_text"]) if primary else str(asset["object_relpath"])
            relative = Path(relative_path)
            filename = relative.name
            folder = "" if str(relative.parent) == "." else str(relative.parent)
            capture_time = (meta["capture_time_text"] if meta else None) or asset["capture_time_text"]
            import_time = (meta["import_time_text"] if meta else None) or asset["created_at"]
            quality = feature["composite_quality_score"] if feature else None
            under = feature["underexposure_score"] if feature else None
            over = feature["overexposure_score"] if feature else None
            exposure = max(float(under or 0), float(over or 0)) if under is not None or over is not None else None
            entity_id = stable_id("pe1", anchor_id)
            total_size = sum(int(item["size_bytes"]) for item in member_assets)
            total_occurrences = sum(occurrences.get(str(item["asset_id"]), 0) for item in member_assets)
            raw_count = sum(str(item["media_kind"]) == "raw_image" for item in member_assets)
            values = (
                entity_id,
                anchor_id,
                display_asset_id,
                "raw_jpeg" if len(member_assets) > 1 and raw_count else "standalone",
                str(asset["media_kind"]),
                str(asset["detected_format"] or asset["mime_type"] or ""),
                filename,
                primary_path,
                folder,
                capture_time,
                meta["capture_time_source"] if meta else asset["capture_time_source"],
                int(meta["capture_time_ambiguous"] or 0) if meta else 0,
                str(capture_time or ""),
                import_time,
                str(import_time or ""),
                meta["camera_make"] if meta else asset["camera_make"],
                meta["camera_model"] if meta else asset["camera_model"],
                meta["lens_model"] if meta else asset["lens_model"],
                meta["iso_value"] if meta else None,
                meta["aperture_f_number"] if meta else None,
                meta["exposure_time_seconds"] if meta else None,
                meta["focal_length_mm"] if meta else None,
                meta["exposure_compensation_ev"] if meta else None,
                meta["gps_latitude"] if meta else None,
                meta["gps_longitude"] if meta else None,
                (meta["width"] if meta else None) or asset["width"],
                (meta["height"] if meta else None) or asset["height"],
                total_size,
                quality,
                float(quality) if quality is not None else -1.0,
                exposure,
                float(exposure) if exposure is not None else -1.0,
                str(asset["perceptual_hash"] or ""),
                hashlib.sha256(f"{DEFAULT_RANDOM_SEED}\0{entity_id}".encode()).hexdigest(),
                len(member_assets),
                raw_count,
                total_occurrences,
                max(0, total_occurrences - 1),
                relations.get(anchor_id, 0),
                int(raw_count > 0 and len(member_assets) > 1),
                generation,
                now,
                now,
            )
            db.execute(
                """INSERT INTO photo_entities(
                       entity_id,anchor_asset_id,display_asset_id,entity_kind,media_kind,format_text,
                       filename_text,primary_path_text,folder_text,capture_time_text,capture_time_source,
                       capture_time_ambiguous,capture_sort_text,import_time_text,import_sort_text,camera_make,
                       camera_model,lens_model,iso_value,aperture_f_number,exposure_time_seconds,focal_length_mm,
                       exposure_compensation_ev,gps_latitude,gps_longitude,width,height,size_bytes,quality_score,
                       quality_sort,exposure_score,exposure_sort,similarity_key,random_key,member_count,
                       raw_member_count,source_occurrence_count,exact_duplicate_count,near_duplicate_count,
                       has_raw_companion,catalog_generation,is_current,created_at,updated_at
                   ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,?,?)
                   ON CONFLICT(entity_id) DO UPDATE SET
                       anchor_asset_id=excluded.anchor_asset_id,display_asset_id=excluded.display_asset_id,
                       entity_kind=excluded.entity_kind,media_kind=excluded.media_kind,format_text=excluded.format_text,
                       filename_text=excluded.filename_text,primary_path_text=excluded.primary_path_text,
                       folder_text=excluded.folder_text,capture_time_text=excluded.capture_time_text,
                       capture_time_source=excluded.capture_time_source,capture_time_ambiguous=excluded.capture_time_ambiguous,
                       capture_sort_text=excluded.capture_sort_text,import_time_text=excluded.import_time_text,
                       import_sort_text=excluded.import_sort_text,camera_make=excluded.camera_make,
                       camera_model=excluded.camera_model,lens_model=excluded.lens_model,iso_value=excluded.iso_value,
                       aperture_f_number=excluded.aperture_f_number,exposure_time_seconds=excluded.exposure_time_seconds,
                       focal_length_mm=excluded.focal_length_mm,exposure_compensation_ev=excluded.exposure_compensation_ev,
                       gps_latitude=excluded.gps_latitude,gps_longitude=excluded.gps_longitude,width=excluded.width,
                       height=excluded.height,size_bytes=excluded.size_bytes,quality_score=excluded.quality_score,
                       quality_sort=excluded.quality_sort,exposure_score=excluded.exposure_score,
                       exposure_sort=excluded.exposure_sort,similarity_key=excluded.similarity_key,
                       random_key=excluded.random_key,member_count=excluded.member_count,
                       raw_member_count=excluded.raw_member_count,source_occurrence_count=excluded.source_occurrence_count,
                       exact_duplicate_count=excluded.exact_duplicate_count,near_duplicate_count=excluded.near_duplicate_count,
                       has_raw_companion=excluded.has_raw_companion,catalog_generation=excluded.catalog_generation,
                       updated_at=excluded.updated_at""",
                values,
            )
            db.execute("DELETE FROM photo_entity_members WHERE entity_id=?", (entity_id,))
            evidence_by_asset = {str(item["asset_id"]): item for item in accepted_members}
            member_values = []
            for member_asset in member_assets:
                member_id = str(member_asset["asset_id"])
                evidence = evidence_by_asset.get(member_id)
                member_values.append(
                    (
                        entity_id,
                        member_id,
                        str(evidence["role"]) if evidence else "standalone",
                        int(member_id == display_asset_id),
                        evidence["confidence_label"] if evidence else None,
                        evidence["confidence_score"] if evidence else None,
                        evidence["evidence_json"] if evidence else "{}",
                    )
                )
            db.executemany(
                """INSERT INTO photo_entity_members(
                       entity_id,asset_id,role,is_display,confidence_label,confidence_score,evidence_json
                   ) VALUES(?,?,?,?,?,?,?)""",
                member_values,
            )
            db.execute(
                """INSERT INTO photo_user_state(entity_id,favourite,rejected,rating,revision,created_at,updated_at)
                   VALUES(?,0,0,0,1,?,?) ON CONFLICT(entity_id) DO NOTHING""",
                (entity_id, now, now),
            )
            entity_count += 1
            member_count += len(member_assets)
    return entity_count, member_count


def _materialize_facets(db: ManifestDB, generation: int) -> None:
    db.execute("DELETE FROM facet_rollups WHERE catalog_generation=?", (generation,))
    now = utc_now()
    for facet_name, column in (
        ("media_kind", "media_kind"),
        ("format", "format_text"),
        ("camera", "camera_model"),
        ("lens", "lens_model"),
        ("folder", "folder_text"),
    ):
        rows = db.all(
            f"""SELECT COALESCE(NULLIF({column},''),'unknown') AS value_key,COUNT(*) AS entity_count
                  FROM photo_entities WHERE catalog_generation=? GROUP BY value_key""",
            (generation,),
        )
        db.executemany(
            """INSERT INTO facet_rollups(
                   catalog_generation,facet_name,value_key,display_value,entity_count,sort_order,created_at
               ) VALUES(?,?,?,?,?,?,?)""",
            (
                (
                    generation,
                    facet_name,
                    str(row["value_key"]),
                    "Unknown" if row["value_key"] == "unknown" else str(row["value_key"]),
                    int(row["entity_count"]),
                    0,
                    now,
                )
                for row in rows
            ),
        )


def run_library_catalog_job(config: ReviewConfig, job_id: str) -> None:
    layout = VaultLayout(config.vault_root)
    with VaultRunLock(layout.state, "library-catalog-materialize"):
        db = ManifestDB(layout.database, required_schema_version=SCHEMA_VERSION, feature_name="library catalog")
        try:
            job = _mark_running(db, job_id)
            if job is None or job["status"] == "completed":
                return
            view = db.one("SELECT * FROM materialized_views WHERE view_id=?", (job["subject_id"],))
            if view is None or view["view_kind"] != "library_catalog":
                raise KeyError(f"Unknown library catalog: {job['subject_id']}")
            generation = int(view["source_generation"])
            entities, members = _catalog_entity_rows(db, generation)
            db.execute(
                "UPDATE photo_entities SET is_current=CASE WHEN catalog_generation=? THEN 1 ELSE 0 END",
                (generation,),
            )
            _materialize_facets(db, generation)
            now = utc_now()
            db.execute(
                """UPDATE materialized_views SET is_current=0
                     WHERE view_kind='library_catalog' AND view_id<>?""",
                (view["view_id"],),
            )
            db.execute(
                """UPDATE materialized_views SET status='ready',is_current=1,item_count=?,updated_at=?,completed_at=?
                     WHERE view_id=?""",
                (entities, now, now, view["view_id"]),
            )
            db.execute(
                "UPDATE review_application_state SET generation=generation+1,updated_at=? WHERE state_id=1",
                (now,),
            )
            _complete_job(db, job_id, {"catalog_generation": generation, "entity_count": entities, "member_count": members})
            db.commit()
        except BaseException as exc:
            if db.conn.in_transaction:
                db.conn.rollback()
            _fail_job(db, job_id, exc)
            raise
        finally:
            db.close()


def _view_select(query: dict[str, Any], generation: int) -> tuple[str, tuple[Any, ...]]:
    clauses = ["e.is_current=1", "e.catalog_generation=?"]
    where_parameters: list[Any] = [generation]
    for column, values in (
        ("e.media_kind", query["media_kinds"]),
        ("e.format_text", query["formats"]),
        ("e.camera_model", query["cameras"]),
        ("e.lens_model", query["lenses"]),
        ("e.folder_text", query["folders"]),
    ):
        if values:
            clauses.append(f"{column} IN ({','.join('?' for _value in values)})")
            where_parameters.extend(values)
    if query["favourite"] is not None:
        clauses.append("s.favourite=?")
        where_parameters.append(int(query["favourite"]))
    if query["rejected"] is not None:
        clauses.append("s.rejected=?")
        where_parameters.append(int(query["rejected"]))
    if query["rating_min"]:
        clauses.append("s.rating>=?")
        where_parameters.append(query["rating_min"])
    if query["rating_max"] < 5:
        clauses.append("s.rating<=?")
        where_parameters.append(query["rating_max"])
    if query["search"]:
        clauses.append("instr(lower(e.filename_text || ' ' || COALESCE(e.primary_path_text,'')),?)>0")
        where_parameters.append(query["search"].casefold())
    source = "photo_entities e JOIN photo_user_state s USING(entity_id)"
    join_parameters: list[Any] = []
    organization_kind = query.get("organization_kind")
    organization_key = query.get("organization_key")
    stack_profile_id = query.get("stack_profile_id")
    if stack_profile_id:
        source += (
            " JOIN stacks stack_filter ON stack_filter.cover_entity_id=e.entity_id"
            " AND stack_filter.profile_id=?"
        )
        join_parameters.append(stack_profile_id)
    if organization_kind == "calendar":
        source += (
            " JOIN calendar_bucket_items oi ON oi.entity_id=e.entity_id"
            " AND oi.catalog_generation=? AND oi.bucket_key=?"
        )
        join_parameters.extend((generation, organization_key))
    elif organization_kind == "folder":
        source += (
            " JOIN folder_hierarchy_items oi ON oi.entity_id=e.entity_id"
            " JOIN folder_hierarchy_nodes organization_node ON organization_node.node_id=oi.node_id"
            " AND organization_node.catalog_generation=? AND organization_node.node_id=?"
        )
        join_parameters.extend((generation, organization_key))
    elif organization_kind in {"camera", "lens"}:
        source += (
            " JOIN equipment_rollup_items oi ON oi.entity_id=e.entity_id"
            " AND oi.catalog_generation=? AND oi.equipment_kind=? AND oi.value_key=?"
        )
        join_parameters.extend((generation, organization_kind, organization_key))
    elif organization_kind == "map":
        if organization_key == "unknown":
            source += (
                " JOIN map_unknown_location_items oi ON oi.entity_id=e.entity_id"
                " AND oi.catalog_generation=?"
            )
            join_parameters.append(generation)
        else:
            source += (
                " JOIN map_cluster_items oi ON oi.entity_id=e.entity_id"
                " JOIN map_clusters organization_cluster ON organization_cluster.cluster_id=oi.cluster_id"
                " AND organization_cluster.catalog_generation=? AND organization_cluster.cluster_id=?"
            )
            join_parameters.extend((generation, organization_key))
    select_expressions: list[str] = []
    order: list[str] = []
    select_parameters: list[Any] = []
    for index, item in enumerate(query["sorts"]):
        field = item["field"]
        expression = LIBRARY_SORT_SQL[field]
        if field == "similarity" and stack_profile_id:
            expression = "stack_filter.ordinal"
        if field == "random" and query["random_seed"] != DEFAULT_RANDOM_SEED:
            expression = "seeded_random(?,e.entity_id)"
            select_parameters.append(query["random_seed"])
        select_expressions.append(f"{expression} AS sort_{index}")
        order.append(f"sort_{index} {item['direction'].upper()}")
    order.append("e.entity_id ASC")
    return (
        "SELECT e.entity_id," + ",".join(select_expressions)
        + " FROM " + source + " WHERE "
        + " AND ".join(clauses) + " ORDER BY " + ",".join(order),
        tuple((*select_parameters, *join_parameters, *where_parameters)),
    )


def run_library_view_job(config: ReviewConfig, job_id: str) -> None:
    layout = VaultLayout(config.vault_root)
    with VaultRunLock(layout.state, "library-view-materialize"):
        db = ManifestDB(layout.database, required_schema_version=SCHEMA_VERSION, feature_name="library view")
        try:
            job = _mark_running(db, job_id)
            if job is None or job["status"] == "completed":
                return
            view = db.one("SELECT * FROM materialized_views WHERE view_id=?", (job["subject_id"],))
            if view is None or view["view_kind"] != "library_query":
                raise KeyError(f"Unknown library view: {job['subject_id']}")
            query = json.loads(view["query_json"])
            db.conn.create_function(
                "seeded_random",
                2,
                lambda seed, entity_id: hashlib.sha256(f"{seed}\0{entity_id}".encode()).hexdigest(),
                deterministic=True,
            )
            sql, parameters = _view_select(query, int(view["source_generation"]))
            db.execute("DELETE FROM materialized_view_items WHERE view_id=?", (view["view_id"],))
            cursor = db.execute(sql, parameters)
            ordinal = 0
            while True:
                rows = cursor.fetchmany(1_000)
                if not rows:
                    break
                db.executemany(
                    """INSERT INTO materialized_view_items(view_id,ordinal,entity_id,sort_key_json)
                         VALUES(?,?,?,?)""",
                    (
                        (view["view_id"], ordinal + offset, row["entity_id"], json_text(list(row)[1:]))
                        for offset, row in enumerate(rows)
                    ),
                )
                ordinal += len(rows)
                db.commit()
            now = utc_now()
            db.execute(
                """UPDATE materialized_views SET status='ready',item_count=?,updated_at=?,completed_at=?
                     WHERE view_id=?""",
                (ordinal, now, now, view["view_id"]),
            )
            _complete_job(db, job_id, {"view_id": view["view_id"], "item_count": ordinal})
            db.commit()
        except BaseException as exc:
            _fail_job(db, job_id, exc)
            raise
        finally:
            db.close()


def run_stage7_job(config: ReviewConfig, job_id: str, job_kind: str) -> None:
    if job_kind == "library_catalog_materialize":
        run_library_catalog_job(config, job_id)
    elif job_kind == "library_view_materialize":
        run_library_view_job(config, job_id)
    else:
        raise ValueError(f"Unsupported Stage 7 job kind: {job_kind}")
