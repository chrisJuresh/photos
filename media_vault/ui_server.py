from __future__ import annotations

import contextlib
import json
import os
import shutil
import sqlite3
import threading
import webbrowser
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from . import __version__
from .core import VaultLayout, process_is_alive


UI_API_VERSION = 1
UI_ROOT = Path(__file__).with_name("ui")


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def _json_or_value(value: Any) -> Any:
    if not isinstance(value, str):
        return value
    stripped = value.strip()
    if not stripped or stripped[0] not in "[{":
        return value
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        return value


def _row(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return {key: _json_or_value(row[key]) for key in row.keys()}


def _rows(rows: list[sqlite3.Row]) -> list[dict[str, Any]]:
    return [_row(row) or {} for row in rows]


def _path_within(candidate: Path, parent: Path) -> bool:
    try:
        left = os.path.normcase(str(candidate.absolute()))
        right = os.path.normcase(str(parent.absolute()))
        return os.path.commonpath((left, right)) == right
    except ValueError:
        return False


def _writer_state(layout: VaultLayout) -> dict[str, Any]:
    lock = layout.state / "active-writer.lock"
    try:
        record = json.loads(lock.read_text(encoding="utf-8"))
        record["alive"] = process_is_alive(int(record.get("pid", -1)))
        return record
    except (OSError, ValueError, json.JSONDecodeError):
        return {"alive": False, "command": None}


def _latest_progress(layout: VaultLayout) -> dict[str, Any] | None:
    progress_dir = layout.state / "progress"
    try:
        paths = list(progress_dir.glob("run_*.json"))
        if not paths:
            return None
        latest = max(paths, key=lambda path: path.stat().st_mtime_ns)
        record = json.loads(latest.read_text(encoding="utf-8"))
        record["snapshot_path"] = str(latest)
        return record
    except (OSError, json.JSONDecodeError):
        return None


def _latest_log_activity(layout: VaultLayout, progress: dict[str, Any] | None) -> dict[str, Any] | None:
    if not progress or not progress.get("run_id"):
        return None
    path = layout.logs / f"{progress['run_id']}.jsonl"
    try:
        modified = datetime.fromtimestamp(path.stat().st_mtime, timezone.utc)
        return {"updated_at": modified.isoformat(timespec="seconds").replace("+00:00", "Z")}
    except OSError:
        return None


def _known_immutable_roots(layout: VaultLayout) -> tuple[Path, ...]:
    if not layout.database.is_file():
        return ()
    uri = f"file:{layout.database.as_posix()}?mode=ro"
    try:
        conn = sqlite3.connect(uri, uri=True, timeout=3)
        conn.execute("PRAGMA query_only=ON")
        tables = {
            row[0]
            for row in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('source_roots','import_batches')"
            ).fetchall()
        }
        values: set[str] = set()
        if "source_roots" in tables:
            values.update(row[0] for row in conn.execute("SELECT path_text FROM source_roots").fetchall())
        if "import_batches" in tables:
            values.update(
                value
                for row in conn.execute("SELECT inbox_root_text,batch_root_text FROM import_batches").fetchall()
                for value in row
            )
        return tuple(Path(value) for value in sorted(values))
    except sqlite3.Error as exc:
        raise ValueError(f"Cannot validate dashboard storage boundaries: {exc}") from exc
    finally:
        if "conn" in locals():
            conn.close()


@dataclass(frozen=True)
class DashboardState:
    layout: VaultLayout
    cache_root: Path
    derivative_root: Path

    @property
    def previews(self) -> Path:
        return self.cache_root / "previews"

    @contextlib.contextmanager
    def db(self) -> Iterator[sqlite3.Connection]:
        if not self.layout.database.exists():
            raise HTTPException(status_code=503, detail="Manifest database is not initialized")
        uri = f"file:{self.layout.database.as_posix()}?mode=ro"
        try:
            conn = sqlite3.connect(uri, uri=True, timeout=3)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA query_only=ON")
            conn.execute("PRAGMA busy_timeout=3000")
            conn.execute("PRAGMA temp_store=MEMORY")
            yield conn
        except sqlite3.Error as exc:
            raise HTTPException(status_code=503, detail=f"Manifest is busy: {exc}") from exc
        finally:
            if "conn" in locals():
                conn.close()


def _prepared_preview(
    state: DashboardState,
    conn: sqlite3.Connection,
    asset_id: str,
) -> tuple[Path | None, str | None, str]:
    asset = conn.execute("SELECT 1 FROM assets WHERE asset_id=?", (asset_id,)).fetchone()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    table = conn.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name='derivatives'"
    ).fetchone()
    states: list[str] = []
    if table is not None:
        rows = conn.execute(
            """SELECT status,mime_type,checksum_sha256,byte_size,file_mtime_ns,relative_path_text,long_edge
               FROM derivatives WHERE subject_type='asset' AND subject_id=? AND is_current=1
                 AND derivative_kind IN ('thumbnail','detail')
               ORDER BY CASE WHEN long_edge=1536 THEN 0 WHEN long_edge=768 THEN 1
                             WHEN long_edge=2560 THEN 2 ELSE 3 END,derivative_id""",
            (asset_id,),
        ).fetchall()
        for row in rows:
            states.append(str(row["status"]))
            if (
                row["status"] != "ready"
                or not row["relative_path_text"]
                or not row["checksum_sha256"]
                or row["byte_size"] is None
                or row["file_mtime_ns"] is None
            ):
                continue
            path = state.derivative_root / Path(row["relative_path_text"])
            if (
                _path_within(path, state.derivative_root)
                and path.is_file()
                and path.stat().st_size == int(row["byte_size"])
                and path.stat().st_mtime_ns == int(row["file_mtime_ns"])
            ):
                return path, row["mime_type"] or "image/webp", "ready"
    legacy = state.previews / f"{asset_id}.jpg"
    if legacy.is_file():
        return legacy, "image/jpeg", "ready_legacy_cache"
    if any(value in {"queued", "processing"} for value in states):
        return None, None, "preparing"
    return None, None, "unavailable"


def create_dashboard_app(
    vault: Path,
    cache_root: Path | None = None,
    *,
    derivative_root: Path | None = None,
) -> FastAPI:
    layout = VaultLayout(vault.absolute())
    cache = (cache_root or (Path.cwd() / ".ui-cache")).absolute()
    derivatives = (derivative_root or (layout.root / "derivatives")).absolute()
    if _path_within(cache, layout.root):
        raise ValueError("The dashboard cache must be outside the destination vault")
    if _path_within(derivatives, layout.objects) or _path_within(layout.objects, derivatives):
        raise ValueError("Prepared derivatives must remain separate from canonical objects")
    latest = _latest_progress(layout)
    immutable_roots = set(_known_immutable_roots(layout))
    if latest and latest.get("source"):
        immutable_roots.add(Path(latest["source"]))
    for immutable_root in immutable_roots:
        if _path_within(cache, immutable_root):
            raise ValueError("The dashboard cache must be outside every immutable source")
        if _path_within(derivatives, immutable_root) or _path_within(immutable_root, derivatives):
            raise ValueError("Prepared derivatives must remain separate from every immutable source")
    state = DashboardState(layout, cache, derivatives)
    app = FastAPI(
        title="Immutable Media Vault",
        version=__version__,
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )
    app.state.dashboard = state

    @app.middleware("http")
    async def read_only_and_headers(request: Request, call_next: Any) -> Response:
        if request.method not in {"GET", "HEAD", "OPTIONS"}:
            return JSONResponse({"detail": "Dashboard is strictly read-only"}, status_code=405)
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        if "Cache-Control" not in response.headers:
            response.headers["Cache-Control"] = (
                "no-store"
                if request.url.path.startswith("/api/") or request.url.path == "/"
                else "public, max-age=300"
            )
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; "
            "script-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'"
        )
        return response

    @app.get("/api/health")
    def health() -> dict[str, Any]:
        return {
            "ok": True,
            "read_only": True,
            "api_version": UI_API_VERSION,
            "tool_version": __version__,
            "vault": str(layout.root),
            "database_exists": layout.database.exists(),
            "server_time": _utc_now(),
        }

    @app.get("/api/live")
    def live() -> dict[str, Any]:
        usage = shutil.disk_usage(layout.root)
        progress = _latest_progress(layout)
        return {
            "writer": _writer_state(layout),
            "progress": progress,
            "activity": _latest_log_activity(layout, progress),
            "storage": {"total": usage.total, "used": usage.used, "free": usage.free},
            "server_time": _utc_now(),
        }

    @app.get("/api/runs")
    def runs(limit: int = Query(30, ge=1, le=200)) -> dict[str, Any]:
        with state.db() as conn:
            items = _rows(
                conn.execute(
                    """SELECT run_id,command,status,started_at,completed_at,source_root,vault_root,host,
                              tool_version,arguments_json,summary_json
                       FROM runs ORDER BY started_at DESC LIMIT ?""",
                    (limit,),
                ).fetchall()
            )
        return {"items": items}

    @app.get("/api/overview")
    def overview(allow_heavy: bool = False) -> dict[str, Any]:
        writer = _writer_state(layout)
        with state.db() as conn:
            schema = conn.execute("SELECT value FROM schema_info WHERE key='schema_version'").fetchone()
            light = {
                "schema_version": schema[0] if schema else None,
                "latest_run": _row(conn.execute("SELECT * FROM runs ORDER BY started_at DESC LIMIT 1").fetchone()),
            }
            if writer.get("alive") and not allow_heavy:
                return {"deferred": True, "reason": "Detailed aggregates are deferred while the scanner is active", **light}
            assets = conn.execute(
                "SELECT COUNT(*) AS count,COALESCE(SUM(size_bytes),0) AS bytes FROM assets"
            ).fetchone()
            kinds = _rows(
                conn.execute(
                    "SELECT media_kind AS label,COUNT(*) AS count,COALESCE(SUM(size_bytes),0) AS bytes "
                    "FROM assets GROUP BY media_kind ORDER BY bytes DESC"
                ).fetchall()
            )
            formats = _rows(
                conn.execute(
                    "SELECT COALESCE(detected_format,'Unknown') AS label,COUNT(*) AS count,"
                    "COALESCE(SUM(size_bytes),0) AS bytes FROM assets GROUP BY detected_format "
                    "ORDER BY count DESC LIMIT 20"
                ).fetchall()
            )
            objects = _rows(
                conn.execute("SELECT object_status AS label,COUNT(*) AS count FROM assets GROUP BY object_status").fetchall()
            )
            relationships = _rows(
                conn.execute(
                    """SELECT r.relationship_type AS label,COUNT(*) AS count
                       FROM relationships r JOIN runs ru ON ru.run_id=r.created_run_id
                       WHERE ru.status='completed'
                       GROUP BY r.relationship_type ORDER BY count DESC"""
                ).fetchall()
            )
            incomplete_relationships = conn.execute(
                """SELECT COUNT(*) FROM relationships r JOIN runs ru ON ru.run_id=r.created_run_id
                   WHERE ru.status<>'completed'"""
            ).fetchone()[0]
            warnings = _rows(
                conn.execute(
                    "SELECT severity AS label,COUNT(*) AS count FROM warnings GROUP BY severity ORDER BY count DESC"
                ).fetchall()
            )
            duplicate_counts = conn.execute(
                """SELECT COUNT(*) AS groups,COALESCE(SUM(source_count - 1),0) AS extra_sources
                   FROM (SELECT COUNT(*) AS source_count FROM asset_sources GROUP BY asset_id HAVING COUNT(*)>1)"""
            ).fetchone()
            return {
                **light,
                "deferred": False,
                "assets": _row(assets),
                "kinds": kinds,
                "formats": formats,
                "objects": objects,
                "relationships": relationships,
                "incomplete_relationships": incomplete_relationships,
                "warnings": warnings,
                "duplicate_groups": duplicate_counts["groups"],
                "duplicate_source_copies": duplicate_counts["extra_sources"],
                "raw_jpeg_groups": conn.execute("SELECT COUNT(*) FROM raw_jpeg_groups").fetchone()[0],
            }

    @app.get("/api/assets")
    def assets(
        limit: int = Query(50, ge=1, le=100),
        cursor: str | None = None,
        media_kind: str | None = None,
        object_status: str | None = None,
        prefix: str | None = Query(None, max_length=128),
    ) -> dict[str, Any]:
        clauses: list[str] = []
        params: list[Any] = []
        if cursor:
            clauses.append("asset_id>?")
            params.append(cursor)
        if media_kind:
            clauses.append("media_kind=?")
            params.append(media_kind)
        if object_status:
            clauses.append("object_status=?")
            params.append(object_status)
        if prefix:
            safe = prefix.replace("[", "[[]").replace("*", "[*]").replace("?", "[?]")
            clauses.append("(asset_id GLOB ? OR sha256 GLOB ? OR blake3 GLOB ?)")
            params.extend([safe + "*", safe + "*", safe + "*"])
        where = " WHERE " + " AND ".join(clauses) if clauses else ""
        sql = (
            "SELECT asset_id,exact_group_id,size_bytes,sha256,blake3,sha512,media_kind,mime_type,"
            "detected_format,preferred_extension,width,height,duration_seconds,camera_make,camera_model,"
            "capture_time_text,object_status,object_verified_at,created_at,warnings_json "
            f"FROM assets{where} ORDER BY asset_id LIMIT ?"
        )
        params.append(limit + 1)
        with state.db() as conn:
            values = _rows(conn.execute(sql, params).fetchall())
        has_more = len(values) > limit
        values = values[:limit]
        return {"items": values, "next_cursor": values[-1]["asset_id"] if has_more and values else None}

    @app.get("/api/sources")
    def sources(
        limit: int = Query(50, ge=1, le=100),
        cursor: str | None = None,
        media_kind: str | None = None,
        discovery_status: str | None = None,
        present: bool | None = None,
        prefix: str | None = Query(None, max_length=256),
    ) -> dict[str, Any]:
        clauses: list[str] = []
        params: list[Any] = []
        if cursor:
            clauses.append("source_file_id>?")
            params.append(cursor)
        if media_kind:
            clauses.append("media_kind=?")
            params.append(media_kind)
        if discovery_status:
            clauses.append("discovery_status=?")
            params.append(discovery_status)
        if present is not None:
            clauses.append("present=?")
            params.append(int(present))
        if prefix:
            safe = prefix.replace("[", "[[]").replace("*", "[*]").replace("?", "[?]")
            clauses.append("(source_file_id GLOB ? OR asset_id GLOB ? OR instr(path_text,?)>0)")
            params.extend((safe + "*", safe + "*", prefix))
        where = " WHERE " + " AND ".join(clauses) if clauses else ""
        params.append(limit + 1)
        with state.db() as conn:
            values = _rows(
                conn.execute(
                    "SELECT source_file_id,path_text,relative_path_text,present,size_bytes,mtime_ns,ctime_ns,"
                    "first_seen_at,last_seen_at,last_seen_run_id,discovery_status,media_kind,asset_id,last_error "
                    f"FROM source_files{where} ORDER BY source_file_id LIMIT ?",
                    params,
                ).fetchall()
            )
        has_more = len(values) > limit
        values = values[:limit]
        return {"items": values, "next_cursor": values[-1]["source_file_id"] if has_more and values else None}

    @app.get("/api/assets/{asset_id}")
    def asset_detail(asset_id: str) -> dict[str, Any]:
        with state.db() as conn:
            asset = conn.execute("SELECT * FROM assets WHERE asset_id=?", (asset_id,)).fetchone()
            if asset is None:
                raise HTTPException(status_code=404, detail="Asset not found")
            exact = conn.execute("SELECT * FROM exact_groups WHERE exact_group_id=?", (asset["exact_group_id"],)).fetchone()
            sources = conn.execute(
                """SELECT sf.source_file_id,sf.path_text,sf.relative_path_text,sf.present,sf.first_seen_at,
                          sf.last_seen_at,sv.source_version_id,sv.observed_run_id,sv.observed_at,sv.superseded_at,
                          sv.discovery_basis,sv.extension_mismatch,sv.hash_status,sv.metadata_status,
                          sv.normalized_metadata_json,sv.warnings_json,sv.error_text,
                          aus.exact_verification_method,aus.exact_verified_at,aus.is_initial_representative
                   FROM asset_sources aus
                   JOIN source_versions sv ON sv.source_version_id=aus.source_version_id
                   JOIN source_files sf ON sf.source_file_id=sv.source_file_id
                   WHERE aus.asset_id=? ORDER BY sf.path_text,sv.source_version_id DESC LIMIT 500""",
                (asset_id,),
            ).fetchall()
            destinations = conn.execute(
                "SELECT * FROM destinations WHERE asset_id=? ORDER BY path_text", (asset_id,)
            ).fetchall()
            relationships = conn.execute(
                """SELECT r.*,ru.status AS origin_run_status,
                          CASE WHEN ru.status='completed' THEN 1 ELSE 0 END AS authoritative
                   FROM relationships r JOIN runs ru ON ru.run_id=r.created_run_id
                   WHERE r.left_asset_id=? OR r.right_asset_id=?
                   ORDER BY r.confidence_score DESC,r.relationship_id LIMIT 500""",
                (asset_id, asset_id),
            ).fetchall()
            raw_groups = conn.execute(
                """SELECT g.*,ru.status AS origin_run_status,
                          CASE WHEN ru.status='completed' THEN 1 ELSE 0 END AS authoritative,
                          m.role,m.confidence_label AS member_confidence_label,
                          m.confidence_score AS member_confidence_score,m.evidence_json AS member_evidence_json,
                          m.ambiguous,m.alternative_group_ids_json
                   FROM raw_jpeg_members m JOIN raw_jpeg_groups g USING(raw_jpeg_group_id)
                   JOIN runs ru ON ru.run_id=g.created_run_id
                   WHERE m.asset_id=? ORDER BY g.raw_jpeg_group_id""",
                (asset_id,),
            ).fetchall()
            warnings = conn.execute(
                "SELECT * FROM warnings WHERE asset_id=? ORDER BY warning_id DESC LIMIT 500", (asset_id,)
            ).fetchall()
            _preview_path, _preview_mime, preview_state = _prepared_preview(state, conn, asset_id)
        return {
            "asset": _row(asset),
            "exact_group": _row(exact),
            "sources": _rows(sources),
            "destinations": _rows(destinations),
            "relationships": _rows(relationships),
            "raw_jpeg_groups": _rows(raw_groups),
            "warnings": _rows(warnings),
            "preview_url": f"/api/assets/{asset_id}/preview",
            "preview_state": preview_state,
        }

    @app.get("/api/assets/{asset_id}/preview")
    def asset_preview(asset_id: str) -> Response:
        with state.db() as conn:
            path, media_type, preview_state = _prepared_preview(state, conn, asset_id)
        if path is None:
            status = 425 if preview_state == "preparing" else 404
            return JSONResponse(
                status_code=status,
                content={
                    "detail": "Preview is being prepared" if status == 425 else "Preview is unavailable",
                    "preview_state": preview_state,
                },
            )
        return FileResponse(
            path,
            media_type=media_type,
            headers={"Cache-Control": "public, max-age=31536000, immutable"},
        )

    @app.get("/api/duplicates")
    def duplicates(limit: int = Query(50, ge=1, le=100), cursor: str | None = None) -> dict[str, Any]:
        cursor_clause = "WHERE aus.asset_id>?" if cursor else ""
        params: list[Any] = [cursor] if cursor else []
        params.append(limit + 1)
        sql = f"""
            WITH grouped AS (
                SELECT aus.asset_id,COUNT(*) AS source_count
                FROM asset_sources aus {cursor_clause}
                GROUP BY aus.asset_id HAVING COUNT(*)>1
                ORDER BY aus.asset_id LIMIT ?
            )
            SELECT g.source_count,a.asset_id,a.size_bytes,a.media_kind,a.detected_format,a.preferred_extension,
                   a.capture_time_text,a.object_status,a.sha256
            FROM grouped g JOIN assets a ON a.asset_id=g.asset_id ORDER BY a.asset_id
        """
        with state.db() as conn:
            values = _rows(conn.execute(sql, params).fetchall())
        has_more = len(values) > limit
        values = values[:limit]
        return {"items": values, "next_cursor": values[-1]["asset_id"] if has_more and values else None}

    @app.get("/api/relationships")
    def relationships(
        limit: int = Query(50, ge=1, le=100),
        cursor: str | None = None,
        relationship_type: str | None = None,
        confidence: str | None = None,
    ) -> dict[str, Any]:
        clauses: list[str] = []
        params: list[Any] = []
        if cursor:
            clauses.append("r.relationship_id>?")
            params.append(cursor)
        if relationship_type:
            clauses.append("r.relationship_type=?")
            params.append(relationship_type)
        if confidence:
            clauses.append("r.confidence_label=?")
            params.append(confidence)
        where = " WHERE " + " AND ".join(clauses) if clauses else ""
        params.append(limit + 1)
        sql = (
            "SELECT r.*,ru.status AS origin_run_status,"
            "CASE WHEN ru.status='completed' THEN 1 ELSE 0 END AS authoritative,"
            "la.media_kind AS left_kind,la.detected_format AS left_format,"
            "ra.media_kind AS right_kind,ra.detected_format AS right_format "
            "FROM relationships r JOIN assets la ON la.asset_id=r.left_asset_id "
            "JOIN assets ra ON ra.asset_id=r.right_asset_id "
            f"JOIN runs ru ON ru.run_id=r.created_run_id{where} "
            "ORDER BY r.relationship_id LIMIT ?"
        )
        with state.db() as conn:
            values = _rows(conn.execute(sql, params).fetchall())
        has_more = len(values) > limit
        values = values[:limit]
        return {"items": values, "next_cursor": values[-1]["relationship_id"] if has_more and values else None}

    @app.get("/api/raw-jpeg-groups")
    def raw_jpeg_groups(limit: int = Query(50, ge=1, le=100), cursor: str | None = None) -> dict[str, Any]:
        where = "WHERE g.raw_jpeg_group_id>?" if cursor else ""
        params: list[Any] = [cursor] if cursor else []
        params.append(limit + 1)
        sql = f"""
            SELECT g.*,ru.status AS origin_run_status,
                   CASE WHEN ru.status='completed' THEN 1 ELSE 0 END AS authoritative,
                   a.detected_format,a.capture_time_text,a.camera_make,a.camera_model,a.object_status,
                   COUNT(m.asset_id) AS member_count,SUM(m.ambiguous) AS ambiguous_members
            FROM raw_jpeg_groups g JOIN assets a ON a.asset_id=g.anchor_raw_asset_id
            JOIN runs ru ON ru.run_id=g.created_run_id
            LEFT JOIN raw_jpeg_members m USING(raw_jpeg_group_id) {where}
            GROUP BY g.raw_jpeg_group_id ORDER BY g.raw_jpeg_group_id LIMIT ?
        """
        with state.db() as conn:
            values = _rows(conn.execute(sql, params).fetchall())
        has_more = len(values) > limit
        values = values[:limit]
        return {"items": values, "next_cursor": values[-1]["raw_jpeg_group_id"] if has_more and values else None}

    @app.get("/api/raw-jpeg-groups/{group_id}")
    def raw_jpeg_group_detail(group_id: str) -> dict[str, Any]:
        with state.db() as conn:
            group = conn.execute(
                """SELECT g.*,ru.status AS origin_run_status,
                          CASE WHEN ru.status='completed' THEN 1 ELSE 0 END AS authoritative
                   FROM raw_jpeg_groups g JOIN runs ru ON ru.run_id=g.created_run_id
                   WHERE g.raw_jpeg_group_id=?""",
                (group_id,),
            ).fetchone()
            if group is None:
                raise HTTPException(status_code=404, detail="RAW/JPEG group not found")
            members = conn.execute(
                """SELECT m.*,a.media_kind,a.detected_format,a.size_bytes,a.capture_time_text,
                          a.camera_make,a.camera_model,a.width,a.height,a.object_status
                   FROM raw_jpeg_members m JOIN assets a ON a.asset_id=m.asset_id
                   WHERE m.raw_jpeg_group_id=? ORDER BY CASE m.role WHEN 'raw_anchor' THEN 0 ELSE 1 END,m.asset_id""",
                (group_id,),
            ).fetchall()
        return {"group": _row(group), "members": _rows(members)}

    @app.get("/api/warnings")
    def warnings(
        limit: int = Query(50, ge=1, le=100),
        cursor: int = Query(0, ge=0),
        severity: str | None = None,
        code: str | None = None,
    ) -> dict[str, Any]:
        clauses = ["w.warning_id>?"]
        params: list[Any] = [cursor]
        if severity:
            clauses.append("w.severity=?")
            params.append(severity)
        if code:
            clauses.append("w.code=?")
            params.append(code)
        params.append(limit + 1)
        sql = (
            "SELECT w.*,sf.path_text FROM warnings w LEFT JOIN source_files sf ON sf.source_file_id=w.source_file_id "
            f"WHERE {' AND '.join(clauses)} ORDER BY w.warning_id LIMIT ?"
        )
        with state.db() as conn:
            values = _rows(conn.execute(sql, params).fetchall())
        has_more = len(values) > limit
        values = values[:limit]
        return {"items": values, "next_cursor": values[-1]["warning_id"] if has_more and values else None}

    @app.get("/api/schema")
    def schema() -> dict[str, Any]:
        with state.db() as conn:
            version = conn.execute("SELECT value FROM schema_info WHERE key='schema_version'").fetchone()
            tables = [row[0] for row in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
            ).fetchall()]
        return {
            "schema_version": version[0] if version else None,
            "tables": tables,
            "authoritative_store": str(layout.database),
            "portable_export": str(layout.exports / "manifest.jsonl"),
            "asset_records": str(layout.records),
        }

    @app.get("/")
    def index() -> FileResponse:
        return FileResponse(UI_ROOT / "index.html", media_type="text/html")

    app.mount("/static", StaticFiles(directory=UI_ROOT), name="static")
    return app


def serve_dashboard(
    vault: Path,
    *,
    host: str = "127.0.0.1",
    port: int = 8765,
    cache_root: Path | None = None,
    derivative_root: Path | None = None,
    open_browser: bool = True,
) -> None:
    if host not in {"127.0.0.1", "localhost", "::1"}:
        raise ValueError("The read-only dashboard may bind only to localhost")
    import uvicorn

    app = create_dashboard_app(vault, cache_root, derivative_root=derivative_root)
    url = f"http://{host}:{port}/"
    print(f"Read-only Media Vault dashboard: {url}")
    print("Press Ctrl+C to stop the dashboard. This does not stop the scanner.")
    if open_browser:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    uvicorn.run(app, host=host, port=port, log_level="info", access_log=False)
