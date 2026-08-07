from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from datetime import date
from typing import Any

from .config import ReviewConfig
from .core import VaultLayout, VaultRunLock, json_text, stable_id, utc_now
from .db import SCHEMA_VERSION, ManifestDB
from .review_library import current_catalog


STAGE8_JOB_KINDS = frozenset({"organization_rollups_materialize"})
MAP_ZOOM_LEVELS = tuple(range(19))
_GEOHASH_ALPHABET = "0123456789bcdefghjkmnpqrstuvwxyz"
_CAPTURE_DATE = re.compile(r"^(\d{4}-\d{2}-\d{2})")


def organization_query_sha256(value: dict[str, Any]) -> str:
    return hashlib.sha256(json_text(value).encode("utf-8")).hexdigest()


def current_organization_rollup(db: Any, *, catalog_generation: int | None = None) -> dict[str, Any] | None:
    parameters: tuple[Any, ...] = ()
    generation_clause = ""
    if catalog_generation is not None:
        generation_clause = " AND source_generation=?"
        parameters = (catalog_generation,)
    row = db.one(
        """SELECT * FROM materialized_views
             WHERE view_kind='organization_rollups' AND is_current=1 AND status='ready'"""
        + generation_clause
        + " ORDER BY source_generation DESC,view_id DESC LIMIT 1",
        parameters,
    )
    return None if row is None else dict(row)


def _enqueue_job(db: Any, *, view_id: str, job_id: str, generation: int) -> None:
    now = utc_now()
    db.execute(
        """INSERT INTO background_jobs(
               job_id,job_kind,subject_type,subject_id,phase,status,attempt,created_at,
               heartbeat_at,progress_json,priority,max_attempts,control_state,queued_at,updated_at
           ) VALUES(?,'organization_rollups_materialize','materialized_view',?,
                    'organization_rollups_materialize','queued',0,?,?,?,?,3,'run',?,?)
           ON CONFLICT(job_id) DO UPDATE SET status='queued',phase='organization_rollups_materialize',
               completed_at=NULL,error_text=NULL,control_state='run',queued_at=excluded.queued_at,
               heartbeat_at=excluded.heartbeat_at,updated_at=excluded.updated_at,
               progress_json=excluded.progress_json""",
        (
            job_id,
            view_id,
            now,
            now,
            json_text({"view_id": view_id, "catalog_generation": generation}),
            25,
            now,
            now,
        ),
    )


def ensure_organization_job(db: Any, config: ReviewConfig, *, force: bool = False) -> dict[str, Any]:
    catalog = current_catalog(db)
    if catalog is None:
        raise ValueError("The logical-photo catalog must be ready before organization views can be prepared")
    generation = int(catalog["source_generation"])
    version = config.analyzer_versions.materialized_view
    query = {"organization": "calendar-folder-equipment-map", "catalog_generation": generation}
    query_hash = organization_query_sha256(query)
    row = db.one(
        """SELECT * FROM materialized_views
             WHERE view_kind='organization_rollups' AND query_sha256=? AND source_generation=?
               AND state_generation=0 AND analyzer_version=?""",
        (query_hash, generation, version),
    )
    if row is not None:
        if force and row["status"] not in {"queued", "building"}:
            _enqueue_job(db, view_id=str(row["view_id"]), job_id=str(row["job_id"]), generation=generation)
            db.execute(
                """UPDATE materialized_views SET status='queued',is_current=1,item_count=0,
                       updated_at=?,completed_at=NULL,error_text=NULL WHERE view_id=?""",
                (utc_now(), row["view_id"]),
            )
            row = db.one("SELECT * FROM materialized_views WHERE view_id=?", (row["view_id"],))
        return dict(row)
    view_id = stable_id("mv1", "organization_rollups", generation, version)
    job_id = stable_id("job1", "organization_rollups_materialize", view_id)
    _enqueue_job(db, view_id=view_id, job_id=job_id, generation=generation)
    now = utc_now()
    db.execute(
        """INSERT INTO materialized_views(
               view_id,view_kind,query_sha256,query_json,source_generation,state_generation,
               analyzer_version,status,is_current,job_id,created_at,updated_at
           ) VALUES(?,?,?,?,?,0,?,'queued',1,?,?,?)""",
        (view_id, "organization_rollups", query_hash, json_text(query), generation, version, job_id, now, now),
    )
    return dict(db.one("SELECT * FROM materialized_views WHERE view_id=?", (view_id,)))


def _mark_running(db: ManifestDB, job_id: str) -> dict[str, Any] | None:
    db.execute("BEGIN IMMEDIATE")
    row = db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,))
    if row is None or row["job_kind"] not in STAGE8_JOB_KINDS:
        db.conn.rollback()
        raise KeyError(f"Unknown Stage 8 job: {job_id}")
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
               queued_at=CASE WHEN ? THEN ? ELSE queued_at END,claim_token=NULL,claimed_by=NULL,
               lease_expires_at=NULL WHERE job_id=?""",
        (job_status, None if retry else now, now, now, error, int(retry), now, job_id),
    )
    db.execute(
        "UPDATE materialized_views SET status=?,updated_at=?,error_text=? WHERE job_id=?",
        (view_status, now, error, job_id),
    )
    db.commit()


def recover_interrupted_stage8_jobs(config: ReviewConfig) -> tuple[str, ...]:
    layout = VaultLayout(config.vault_root)
    try:
        with VaultRunLock(layout.state, "organization-materialization-recovery"):
            db = ManifestDB(
                layout.database,
                required_schema_version=SCHEMA_VERSION,
                feature_name="organization materialization recovery",
            )
            try:
                rows = db.all(
                    """SELECT job_id,attempt,max_attempts FROM background_jobs
                         WHERE job_kind='organization_rollups_materialize' AND status='running'
                         ORDER BY job_id"""
                )
                now = utc_now()
                recovered: list[str] = []
                for row in rows:
                    retry = int(row["attempt"]) < int(row["max_attempts"])
                    job_status = "queued" if retry else "failed"
                    view_status = "queued" if retry else "error"
                    error = "Worker stopped before the organization rollups became visible; persisted partial rows will be replaced"
                    db.execute(
                        """UPDATE background_jobs SET status=?,completed_at=?,heartbeat_at=?,updated_at=?,
                               queued_at=CASE WHEN ? THEN ? ELSE queued_at END,error_text=?,claim_token=NULL,
                               claimed_by=NULL,lease_expires_at=NULL WHERE job_id=? AND status='running'""",
                        (job_status, None if retry else now, now, now, int(retry), now, error, row["job_id"]),
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


def _capture_bucket(row: Any) -> tuple[str, str, str | None, int | None, int | None, int | None, str, int]:
    if bool(row["capture_time_ambiguous"]):
        return ("ambiguous", "ambiguous", None, None, None, None, "Ambiguous capture time", 99_999_998)
    text = str(row["capture_time_text"] or "")
    match = _CAPTURE_DATE.match(text)
    if match is None:
        return ("unknown", "unknown", None, None, None, None, "Unknown capture time", 99_999_999)
    try:
        value = date.fromisoformat(match.group(1))
    except ValueError:
        return ("unknown", "unknown", None, None, None, None, "Unknown capture time", 99_999_999)
    key = f"date:{value.isoformat()}"
    return (
        key,
        "date",
        value.isoformat(),
        value.year,
        value.month,
        value.day,
        value.strftime("%d %B %Y"),
        value.year * 10_000 + value.month * 100 + value.day,
    )


def _materialize_calendar(db: ManifestDB, generation: int, rows: list[Any], now: str) -> int:
    members: dict[str, list[str]] = defaultdict(list)
    buckets: dict[str, tuple[str, str | None, int | None, int | None, int | None, str, int]] = {}
    for row in rows:
        key, kind, capture_date, year, month, day, display, sort_order = _capture_bucket(row)
        members[key].append(str(row["entity_id"]))
        buckets[key] = (kind, capture_date, year, month, day, display, sort_order)
    db.executemany(
        """INSERT INTO calendar_buckets(
               catalog_generation,bucket_key,bucket_kind,capture_date,year,month,day,display_value,
               entity_count,sort_order,created_at
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
        (
            (generation, key, *buckets[key][:-1], len(entity_ids), buckets[key][-1], now)
            for key, entity_ids in sorted(members.items())
        ),
    )
    db.executemany(
        "INSERT INTO calendar_bucket_items(catalog_generation,bucket_key,entity_id) VALUES(?,?,?)",
        ((generation, key, entity_id) for key, entity_ids in members.items() for entity_id in sorted(set(entity_ids))),
    )
    return len(buckets)


def _folder_path(relative_path: str) -> str:
    normalized = relative_path.replace("\\", "/").strip("/")
    return normalized.rsplit("/", 1)[0] if "/" in normalized else ""


def _folder_ancestors(folder: str) -> tuple[str, ...]:
    if not folder:
        return ("",)
    parts = [part for part in folder.split("/") if part]
    return tuple(["", *("/".join(parts[:index]) for index in range(1, len(parts) + 1))])


def _materialize_folders(db: ManifestDB, generation: int, now: str) -> int:
    occurrences = db.all(
        """SELECT e.entity_id,sf.source_root_id,sr.path_text AS source_root_text,sf.relative_path_text
             FROM photo_entities e JOIN photo_entity_members m USING(entity_id)
             JOIN source_files sf ON sf.asset_id=m.asset_id
             JOIN source_roots sr USING(source_root_id)
             WHERE e.is_current=1 AND e.catalog_generation=?
             ORDER BY sf.source_root_id,sf.relative_path_text COLLATE BINARY,e.entity_id""",
        (generation,),
    )
    roots: dict[str, str] = {}
    direct_entities: dict[tuple[str, str], set[str]] = defaultdict(set)
    recursive_entities: dict[tuple[str, str], set[str]] = defaultdict(set)
    direct_occurrences: Counter[tuple[str, str]] = Counter()
    recursive_occurrences: Counter[tuple[str, str]] = Counter()
    member_occurrences: dict[tuple[str, str], Counter[str]] = defaultdict(Counter)
    for row in occurrences:
        root_id = str(row["source_root_id"])
        entity_id = str(row["entity_id"])
        roots[root_id] = str(row["source_root_text"])
        folder = _folder_path(str(row["relative_path_text"]))
        direct_key = (root_id, folder)
        direct_entities[direct_key].add(entity_id)
        direct_occurrences[direct_key] += 1
        for ancestor in _folder_ancestors(folder):
            key = (root_id, ancestor)
            recursive_entities[key].add(entity_id)
            recursive_occurrences[key] += 1
            member_occurrences[key][entity_id] += 1
    node_ids = {
        key: stable_id("fn1", generation, key[0], key[1])
        for key in recursive_entities
    }
    values = []
    for root_id, relative in sorted(recursive_entities):
        parent_relative = relative.rsplit("/", 1)[0] if "/" in relative else ""
        parent_id = None if relative == "" else node_ids[(root_id, parent_relative)]
        display = roots[root_id] if relative == "" else relative.rsplit("/", 1)[-1]
        key = (root_id, relative)
        values.append(
            (
                node_ids[key], generation, root_id, parent_id, relative, display,
                0 if relative == "" else relative.count("/") + 1,
                len(direct_entities[key]), len(recursive_entities[key]), direct_occurrences[key],
                recursive_occurrences[key], now,
            )
        )
    db.executemany(
        """INSERT INTO folder_hierarchy_nodes(
               node_id,catalog_generation,source_root_id,parent_node_id,relative_path_text,display_value,depth,
               direct_entity_count,logical_entity_count,direct_source_occurrence_count,source_occurrence_count,created_at
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",
        values,
    )
    db.executemany(
        "INSERT INTO folder_hierarchy_items(node_id,entity_id,source_occurrence_count) VALUES(?,?,?)",
        (
            (node_ids[key], entity_id, count)
            for key, counts in member_occurrences.items()
            for entity_id, count in sorted(counts.items())
        ),
    )
    return len(values)


def _normalized_text(value: str | None) -> str:
    return " ".join(unicodedata.normalize("NFKC", str(value or "")).split())


def _camera_value(make: str | None, model: str | None) -> str:
    make_text = _normalized_text(make)
    model_text = _normalized_text(model)
    if make_text and model_text.casefold().startswith(make_text.casefold()):
        return model_text
    return " ".join(part for part in (make_text, model_text) if part)


def _materialize_equipment(db: ManifestDB, generation: int, rows: list[Any], now: str) -> int:
    members: dict[tuple[str, str], set[str]] = defaultdict(set)
    displays: dict[tuple[str, str], set[str]] = defaultdict(set)
    raw_values: dict[tuple[str, str], set[str]] = defaultdict(set)
    for row in rows:
        values = {
            "camera": _camera_value(row["camera_make"], row["camera_model"]),
            "lens": _normalized_text(row["lens_model"]),
        }
        raws = {
            "camera": json_text({"make": row["camera_make"], "model": row["camera_model"]}),
            "lens": json_text({"lens": row["lens_model"]}),
        }
        for kind, display in values.items():
            key_value = display.casefold() if display else "unknown"
            key = (kind, key_value)
            members[key].add(str(row["entity_id"]))
            displays[key].add(display or "Unknown")
            raw_values[key].add(raws[kind])
    db.executemany(
        """INSERT INTO equipment_rollups(
               catalog_generation,equipment_kind,value_key,display_value,raw_values_json,entity_count,created_at
           ) VALUES(?,?,?,?,?,?,?)""",
        (
            (
                generation, kind, value_key, sorted(displays[(kind, value_key)], key=str.casefold)[0],
                json_text([json.loads(value) for value in sorted(raw_values[(kind, value_key)])]),
                len(entity_ids), now,
            )
            for (kind, value_key), entity_ids in sorted(members.items())
        ),
    )
    db.executemany(
        """INSERT INTO equipment_rollup_items(
               catalog_generation,equipment_kind,value_key,entity_id
           ) VALUES(?,?,?,?)""",
        (
            (generation, kind, value_key, entity_id)
            for (kind, value_key), entity_ids in members.items()
            for entity_id in sorted(entity_ids)
        ),
    )
    return len(members)


def geohash_encode(latitude: float, longitude: float, precision: int = 8) -> str:
    if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
        raise ValueError("Coordinates are outside valid latitude/longitude bounds")
    if not 1 <= precision <= 12:
        raise ValueError("Geohash precision must be between one and twelve")
    lat_range = [-90.0, 90.0]
    lon_range = [-180.0, 180.0]
    result: list[str] = []
    bits = 0
    bit_count = 0
    even = True
    while len(result) < precision:
        target = lon_range if even else lat_range
        value = longitude if even else latitude
        midpoint = (target[0] + target[1]) / 2
        bits = (bits << 1) | int(value >= midpoint)
        if value >= midpoint:
            target[0] = midpoint
        else:
            target[1] = midpoint
        even = not even
        bit_count += 1
        if bit_count == 5:
            result.append(_GEOHASH_ALPHABET[bits])
            bits = 0
            bit_count = 0
    return "".join(result)


def zoom_geohash_precision(zoom_level: int) -> int:
    if zoom_level not in MAP_ZOOM_LEVELS:
        raise ValueError("Map zoom must be between zero and eighteen")
    return min(8, 1 + zoom_level // 3)


def _materialize_map(db: ManifestDB, generation: int, rows: list[Any], now: str) -> tuple[int, int]:
    locations: list[tuple[str, float, float, str]] = []
    unknown_entity_ids: list[str] = []
    for row in rows:
        latitude = row["gps_latitude"]
        longitude = row["gps_longitude"]
        if latitude is None or longitude is None:
            unknown_entity_ids.append(str(row["entity_id"]))
            continue
        latitude_value = float(latitude)
        longitude_value = float(longitude)
        if not -90 <= latitude_value <= 90 or not -180 <= longitude_value <= 180:
            unknown_entity_ids.append(str(row["entity_id"]))
            continue
        locations.append(
            (str(row["entity_id"]), latitude_value, longitude_value, geohash_encode(latitude_value, longitude_value))
        )
    db.executemany(
        """INSERT INTO map_entity_locations(
               catalog_generation,entity_id,latitude,longitude,geohash_text
           ) VALUES(?,?,?,?,?)""",
        ((generation, *location) for location in locations),
    )
    db.executemany(
        "INSERT INTO map_unknown_location_items(catalog_generation,entity_id) VALUES(?,?)",
        ((generation, entity_id) for entity_id in sorted(unknown_entity_ids)),
    )
    cluster_count = 0
    for zoom in MAP_ZOOM_LEVELS:
        precision = zoom_geohash_precision(zoom)
        groups: dict[str, list[tuple[str, float, float, str]]] = defaultdict(list)
        for location in locations:
            groups[location[3][:precision]].append(location)
        cluster_values = []
        item_values = []
        for prefix, group in sorted(groups.items()):
            cluster_id = stable_id("mc1", generation, zoom, prefix)
            latitudes = [item[1] for item in group]
            longitudes = [item[2] for item in group]
            cluster_values.append(
                (
                    cluster_id, generation, zoom, prefix, sum(latitudes) / len(latitudes),
                    sum(longitudes) / len(longitudes), min(latitudes), max(latitudes),
                    min(longitudes), max(longitudes), len(group), now,
                )
            )
            item_values.extend((cluster_id, item[0]) for item in group)
        db.executemany(
            """INSERT INTO map_clusters(
                   cluster_id,catalog_generation,zoom_level,geohash_prefix,center_latitude,center_longitude,
                   min_latitude,max_latitude,min_longitude,max_longitude,entity_count,created_at
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",
            cluster_values,
        )
        db.executemany("INSERT INTO map_cluster_items(cluster_id,entity_id) VALUES(?,?)", item_values)
        cluster_count += len(cluster_values)
    return cluster_count, len(unknown_entity_ids)


def _clear_generation(db: ManifestDB, generation: int) -> None:
    db.execute(
        """DELETE FROM map_cluster_items WHERE cluster_id IN (
               SELECT cluster_id FROM map_clusters WHERE catalog_generation=?)""",
        (generation,),
    )
    db.execute("DELETE FROM map_clusters WHERE catalog_generation=?", (generation,))
    db.execute("DELETE FROM map_entity_locations WHERE catalog_generation=?", (generation,))
    db.execute("DELETE FROM map_unknown_location_items WHERE catalog_generation=?", (generation,))
    db.execute(
        """DELETE FROM folder_hierarchy_items WHERE node_id IN (
               SELECT node_id FROM folder_hierarchy_nodes WHERE catalog_generation=?)""",
        (generation,),
    )
    db.execute("DELETE FROM folder_hierarchy_nodes WHERE catalog_generation=?", (generation,))
    db.execute("DELETE FROM equipment_rollup_items WHERE catalog_generation=?", (generation,))
    db.execute("DELETE FROM equipment_rollups WHERE catalog_generation=?", (generation,))
    db.execute("DELETE FROM calendar_bucket_items WHERE catalog_generation=?", (generation,))
    db.execute("DELETE FROM calendar_buckets WHERE catalog_generation=?", (generation,))


def run_organization_rollup_job(config: ReviewConfig, job_id: str) -> None:
    layout = VaultLayout(config.vault_root)
    with VaultRunLock(layout.state, "organization-rollups-materialize"):
        db = ManifestDB(layout.database, required_schema_version=SCHEMA_VERSION, feature_name="organization rollups")
        try:
            job = _mark_running(db, job_id)
            if job is None or job["status"] == "completed":
                return
            view = db.one("SELECT * FROM materialized_views WHERE view_id=?", (job["subject_id"],))
            if view is None or view["view_kind"] != "organization_rollups":
                raise KeyError(f"Unknown organization rollup view: {job['subject_id']}")
            catalog = current_catalog(db)
            generation = int(view["source_generation"])
            if catalog is None or int(catalog["source_generation"]) != generation:
                raise RuntimeError("The organization job no longer matches the current logical-photo catalog")
            rows = db.all(
                """SELECT entity_id,capture_time_text,capture_time_ambiguous,camera_make,camera_model,
                          lens_model,gps_latitude,gps_longitude
                     FROM photo_entities WHERE is_current=1 AND catalog_generation=? ORDER BY entity_id""",
                (generation,),
            )
            now = utc_now()
            db.execute("BEGIN IMMEDIATE")
            _clear_generation(db, generation)
            calendar_count = _materialize_calendar(db, generation, rows, now)
            folder_count = _materialize_folders(db, generation, now)
            equipment_count = _materialize_equipment(db, generation, rows, now)
            map_cluster_count, unknown_locations = _materialize_map(db, generation, rows, now)
            item_count = calendar_count + folder_count + equipment_count + map_cluster_count
            progress = {
                "catalog_generation": generation,
                "entity_count": len(rows),
                "calendar_bucket_count": calendar_count,
                "folder_node_count": folder_count,
                "equipment_value_count": equipment_count,
                "map_cluster_count": map_cluster_count,
                "unknown_location_count": unknown_locations,
            }
            db.execute(
                "UPDATE materialized_views SET is_current=0 WHERE view_kind='organization_rollups' AND view_id<>?",
                (view["view_id"],),
            )
            db.execute(
                """UPDATE materialized_views SET status='ready',is_current=1,item_count=?,updated_at=?,
                       completed_at=?,error_text=NULL WHERE view_id=?""",
                (item_count, now, now, view["view_id"]),
            )
            db.execute(
                "UPDATE review_application_state SET generation=generation+1,updated_at=? WHERE state_id=1",
                (now,),
            )
            _complete_job(db, job_id, progress)
            db.commit()
        except BaseException as exc:
            if db.conn.in_transaction:
                db.conn.rollback()
            _fail_job(db, job_id, exc)
            raise
        finally:
            db.close()


def run_stage8_job(config: ReviewConfig, job_id: str, job_kind: str) -> None:
    if job_kind != "organization_rollups_materialize":
        raise ValueError(f"Unsupported Stage 8 job kind: {job_kind}")
    run_organization_rollup_job(config, job_id)
