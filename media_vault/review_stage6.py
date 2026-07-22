from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Iterable

from .config import ReviewConfig
from .core import VaultLayout, VaultRunLock, json_text, stable_id, utc_now
from .db import SCHEMA_VERSION, ManifestDB
from .review_copy import ReviewedImportService
from .review_imports import DECISIONS, ENTRY_KINDS, MANIFEST_CLASSIFICATIONS


STAGE6_JOB_KINDS = frozenset(
    {
        "inbox_scan",
        "import_manifest_materialize",
        "import_approval_preflight",
        "reviewed_execute",
    }
)
MANIFEST_OUTCOMES = frozenset(
    {
        "pending",
        "new_asset",
        "exact_match",
        "batch_exact_duplicate",
        "approved",
        "copied",
        "verified",
        "duplicate",
        "excluded",
        "skipped",
        "not_applicable",
        "failed",
    }
)
MANIFEST_SORT_FIELDS = frozenset(
    {"relative_path", "classification", "decision", "outcome", "size", "copy_status"}
)
_SORT_SQL = {
    "relative_path": "relative_path_text COLLATE BINARY",
    "classification": "classification COLLATE BINARY",
    "decision": "effective_decision COLLATE BINARY",
    "outcome": "COALESCE(copy_outcome,match_outcome,'') COLLATE BINARY",
    "size": "COALESCE(stat_size_bytes,-1)",
    "copy_status": "COALESCE(copy_status,'') COLLATE BINARY",
}


def normalize_manifest_query(
    *,
    classifications: Iterable[str] = (),
    decisions: Iterable[str] = (),
    entry_kinds: Iterable[str] = (),
    outcomes: Iterable[str] = (),
    search: str | None = None,
    sorts: Iterable[tuple[str, str]] = (("relative_path", "asc"),),
) -> dict[str, Any]:
    normalized_classifications = tuple(sorted(set(classifications)))
    normalized_decisions = tuple(sorted(set(decisions)))
    normalized_entry_kinds = tuple(sorted(set(entry_kinds)))
    normalized_outcomes = tuple(sorted(set(outcomes)))
    normalized_sorts = tuple((field.strip(), direction.strip().lower()) for field, direction in sorts)
    if set(normalized_classifications) - MANIFEST_CLASSIFICATIONS:
        raise ValueError("Unsupported manifest classification filter")
    if set(normalized_decisions) - DECISIONS:
        raise ValueError("Unsupported manifest decision filter")
    if set(normalized_entry_kinds) - ENTRY_KINDS:
        raise ValueError("Unsupported manifest entry-kind filter")
    if set(normalized_outcomes) - MANIFEST_OUTCOMES:
        raise ValueError("Unsupported manifest outcome filter")
    if not normalized_sorts or len(normalized_sorts) > 3:
        raise ValueError("Manifest sorts must contain between one and three fields")
    if len({field for field, _direction in normalized_sorts}) != len(normalized_sorts):
        raise ValueError("Manifest sort fields may not be repeated")
    for field, direction in normalized_sorts:
        if field not in MANIFEST_SORT_FIELDS or direction not in {"asc", "desc"}:
            raise ValueError("Unsupported manifest sort field or direction")
    normalized_search = (search or "").strip()
    if len(normalized_search) > 256:
        raise ValueError("Manifest path search is limited to 256 characters")
    return {
        "classifications": list(normalized_classifications),
        "decisions": list(normalized_decisions),
        "entry_kinds": list(normalized_entry_kinds),
        "outcomes": list(normalized_outcomes),
        "search": normalized_search,
        "sorts": [{"field": field, "direction": direction} for field, direction in normalized_sorts],
    }


def is_common_manifest_query(query: dict[str, Any]) -> bool:
    filter_groups = sum(bool(query[name]) for name in ("classifications", "decisions", "entry_kinds"))
    return (
        not query["search"]
        and not query["outcomes"]
        and query["sorts"] == [{"field": "relative_path", "direction": "asc"}]
        and filter_groups <= 1
    )


def manifest_query_sha256(query: dict[str, Any]) -> str:
    return hashlib.sha256(json_text(query).encode("utf-8")).hexdigest()


def enqueue_job(
    db: Any,
    *,
    job_kind: str,
    subject_type: str,
    subject_id: str,
    progress: dict[str, Any],
    priority: int,
    job_id: str | None = None,
) -> str:
    if job_kind not in STAGE6_JOB_KINDS:
        raise ValueError(f"Unsupported Stage 6 job kind: {job_kind}")
    now = utc_now()
    resolved_id = job_id or stable_id("job1", job_kind, subject_type, subject_id, now)
    db.execute(
        """INSERT INTO background_jobs(
               job_id,job_kind,subject_type,subject_id,phase,status,attempt,created_at,
               heartbeat_at,progress_json,priority,max_attempts,control_state,queued_at,updated_at
           ) VALUES(?,?,?,?,?,'queued',0,?,?,?,?,3,'run',?,?)
           ON CONFLICT(job_id) DO NOTHING""",
        (
            resolved_id,
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
    return resolved_id


def ensure_manifest_view(
    db: Any,
    config: ReviewConfig,
    *,
    batch_id: str,
    batch_revision: int,
    query: dict[str, Any],
) -> dict[str, Any]:
    query_hash = manifest_query_sha256(query)
    version = config.analyzer_versions.materialized_view
    row = db.one(
        """SELECT * FROM import_manifest_views
             WHERE batch_id=? AND batch_revision=? AND query_sha256=? AND analyzer_version=?""",
        (batch_id, batch_revision, query_hash, version),
    )
    if row is not None:
        return dict(row)
    now = utc_now()
    view_id = stable_id("imv1", batch_id, batch_revision, query_hash, version)
    job_id = stable_id("job1", "import_manifest_materialize", view_id)
    enqueue_job(
        db,
        job_kind="import_manifest_materialize",
        subject_type="import_manifest_view",
        subject_id=view_id,
        progress={"view_id": view_id, "batch_id": batch_id},
        priority=20,
        job_id=job_id,
    )
    db.execute(
        """INSERT INTO import_manifest_views(
               view_id,batch_id,batch_revision,query_sha256,query_json,analyzer_version,status,
               job_id,created_at,updated_at
           ) VALUES(?,?,?,?,?,?,'queued',?,?,?)""",
        (view_id, batch_id, batch_revision, query_hash, json_text(query), version, job_id, now, now),
    )
    return dict(
        db.one("SELECT * FROM import_manifest_views WHERE view_id=?", (view_id,))
    )


def _materialization_sql(query: dict[str, Any]) -> tuple[str, tuple[Any, ...]]:
    clauses = ["batch_id=?", "present=1"]
    parameters: list[Any] = []
    for column, values in (
        ("classification", query["classifications"]),
        ("effective_decision", query["decisions"]),
        ("entry_kind", query["entry_kinds"]),
    ):
        if values:
            clauses.append(f"{column} IN ({','.join('?' for _value in values)})")
            parameters.extend(values)
    if query["outcomes"]:
        clauses.append(
            f"COALESCE(copy_outcome,match_outcome,'') IN ({','.join('?' for _value in query['outcomes'])})"
        )
        parameters.extend(query["outcomes"])
    if query["search"]:
        clauses.append("instr(lower(relative_path_text),?)>0")
        parameters.append(query["search"].casefold())
    order = [f"{_SORT_SQL[item['field']]} {item['direction'].upper()}" for item in query["sorts"]]
    order.append("item_id ASC")
    return (
        "SELECT item_id," + ",".join(_SORT_SQL[item["field"]] for item in query["sorts"])
        + " FROM import_items WHERE " + " AND ".join(clauses) + " ORDER BY " + ",".join(order),
        tuple(parameters),
    )


def _mark_running(db: ManifestDB, job_id: str) -> dict[str, Any] | None:
    db.execute("BEGIN IMMEDIATE")
    row = db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,))
    if row is None:
        db.conn.rollback()
        raise KeyError(f"Unknown Stage 6 job: {job_id}")
    if row["status"] == "completed":
        db.conn.rollback()
        return dict(row)
    if row["status"] not in {"queued", "failed", "interrupted"}:
        db.conn.rollback()
        return None
    now = utc_now()
    updated = db.execute(
        """UPDATE background_jobs SET status='running',attempt=attempt+1,started_at=COALESCE(started_at,?),
               heartbeat_at=?,updated_at=?,completed_at=NULL,error_text=NULL
             WHERE job_id=? AND status=? AND control_state='run'""",
        (now, now, now, job_id, row["status"]),
    )
    if updated.rowcount != 1:
        db.conn.rollback()
        return None
    db.commit()
    return dict(db.one("SELECT * FROM background_jobs WHERE job_id=?", (job_id,)))


def _complete_job(db: ManifestDB, job_id: str, progress: dict[str, Any]) -> None:
    now = utc_now()
    db.execute(
        """UPDATE background_jobs SET status='completed',completed_at=?,heartbeat_at=?,updated_at=?,
               progress_json=?,error_text=NULL WHERE job_id=?""",
        (now, now, now, json_text(progress), job_id),
    )
    db.commit()


def _fail_job(db: ManifestDB, job_id: str, exc: BaseException) -> None:
    now = utc_now()
    error = f"{type(exc).__name__}: {exc}"
    db.execute(
        """UPDATE background_jobs SET status='failed',completed_at=?,heartbeat_at=?,updated_at=?,error_text=?
             WHERE job_id=?""",
        (now, now, now, error, job_id),
    )
    db.commit()


def run_manifest_materialization_job(config: ReviewConfig, job_id: str) -> None:
    layout = VaultLayout(config.vault_root)
    with VaultRunLock(layout.state, "import-manifest-materialize"):
        db = ManifestDB(layout.database, required_schema_version=SCHEMA_VERSION, feature_name="import manifest view")
        try:
            job = _mark_running(db, job_id)
            if job is None or job["status"] == "completed":
                return
            view = db.one("SELECT * FROM import_manifest_views WHERE view_id=?", (job["subject_id"],))
            if view is None:
                raise KeyError(f"Unknown import manifest view: {job['subject_id']}")
            query = json.loads(view["query_json"])
            sql, parameters = _materialization_sql(query)
            db.execute("DELETE FROM import_manifest_view_items WHERE view_id=?", (view["view_id"],))
            db.execute(
                "UPDATE import_manifest_views SET status='building',updated_at=?,error_text=NULL WHERE view_id=?",
                (utc_now(), view["view_id"]),
            )
            cursor = db.execute(sql, (view["batch_id"], *parameters))
            ordinal = 0
            while True:
                rows = cursor.fetchmany(1_000)
                if not rows:
                    break
                values = []
                for row in rows:
                    sort_values = [row[index] for index in range(1, len(row))]
                    values.append((view["view_id"], ordinal, row["item_id"], json_text(sort_values)))
                    ordinal += 1
                db.executemany(
                    """INSERT INTO import_manifest_view_items(view_id,ordinal,item_id,sort_key_json)
                         VALUES(?,?,?,?)""",
                    values,
                )
                db.commit()
            now = utc_now()
            db.execute(
                """UPDATE import_manifest_views SET status='ready',item_count=?,updated_at=?,completed_at=?
                     WHERE view_id=?""",
                (ordinal, now, now, view["view_id"]),
            )
            _complete_job(db, job_id, {"view_id": view["view_id"], "item_count": ordinal})
        except BaseException as exc:
            if "view" in locals() and view is not None:
                db.execute(
                    "UPDATE import_manifest_views SET status='error',updated_at=?,error_text=? WHERE view_id=?",
                    (utc_now(), f"{type(exc).__name__}: {exc}", view["view_id"]),
                )
            _fail_job(db, job_id, exc)
            raise
        finally:
            db.close()


def run_approval_preflight_job(config: ReviewConfig, job_id: str) -> None:
    layout = VaultLayout(config.vault_root)
    db = ManifestDB(layout.database, required_schema_version=SCHEMA_VERSION, feature_name="approval preflight")
    try:
        job = _mark_running(db, job_id)
        if job is None or job["status"] == "completed":
            return
        service = ReviewedImportService(db, layout, config)
        preflight = service.approval_preflight(str(job["subject_id"]))
        _complete_job(db, job_id, preflight)
    except BaseException as exc:
        _fail_job(db, job_id, exc)
        raise
    finally:
        db.close()


def run_reviewed_execute_job(config: ReviewConfig, job_id: str) -> None:
    layout = VaultLayout(config.vault_root)
    db = ManifestDB(layout.database, required_schema_version=SCHEMA_VERSION, feature_name="reviewed execute")
    try:
        job = _mark_running(db, job_id)
        if job is None or job["status"] == "completed":
            return
        progress = json.loads(job["progress_json"] or "{}")
        approval_id = str(progress["approval_id"])
        copy_job_id = ReviewedImportService(db, layout, config).authorize_execution(
            approval_id,
            execute=True,
            actor=str(progress.get("actor") or "local_user"),
        )
        _complete_job(db, job_id, {"approval_id": approval_id, "copy_job_id": copy_job_id})
    except BaseException as exc:
        _fail_job(db, job_id, exc)
        raise
    finally:
        db.close()


def run_inbox_scan_job(
    config: ReviewConfig,
    job_id: str,
    *,
    exiftool: Path | None = None,
    allow_unsafe_atime: bool = False,
) -> None:
    layout = VaultLayout(config.vault_root)
    db = ManifestDB(layout.database, required_schema_version=SCHEMA_VERSION, feature_name="inbox scan")
    try:
        job = _mark_running(db, job_id)
        if job is None or job["status"] == "completed":
            return
        progress = json.loads(job["progress_json"] or "{}")
    finally:
        db.close()
    try:
        from .review_runtime import scan_inbox

        result = scan_inbox(
            config,
            exiftool=exiftool,
            allow_unsafe_atime=allow_unsafe_atime,
            reuse_unchanged=bool(progress.get("reuse_unchanged")),
        )
        db = ManifestDB(layout.database, required_schema_version=SCHEMA_VERSION, feature_name="inbox scan")
        try:
            _complete_job(
                db,
                job_id,
                {
                    "batch_ids": [item["batch_id"] for item in result["batches"]],
                    "preview_jobs": result["preview_jobs"],
                    "media_publication": result["media_publication"],
                },
            )
        finally:
            db.close()
    except BaseException as exc:
        db = ManifestDB(layout.database, required_schema_version=SCHEMA_VERSION, feature_name="inbox scan")
        try:
            _fail_job(db, job_id, exc)
        finally:
            db.close()
        raise


def run_stage6_job(
    config: ReviewConfig,
    job_id: str,
    job_kind: str,
    *,
    exiftool: Path | None = None,
    allow_unsafe_atime: bool = False,
) -> None:
    if job_kind == "inbox_scan":
        run_inbox_scan_job(
            config,
            job_id,
            exiftool=exiftool,
            allow_unsafe_atime=allow_unsafe_atime,
        )
    elif job_kind == "import_manifest_materialize":
        run_manifest_materialization_job(config, job_id)
    elif job_kind == "import_approval_preflight":
        run_approval_preflight_job(config, job_id)
    elif job_kind == "reviewed_execute":
        run_reviewed_execute_job(config, job_id)
    else:
        raise ValueError(f"Unsupported Stage 6 job kind: {job_kind}")
