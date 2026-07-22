from __future__ import annotations

import base64
import hashlib
import json
import re
import sqlite3
import subprocess
import threading
import time
import uuid
import webbrowser
from contextlib import contextmanager
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Callable, Iterator, Literal

from fastapi import FastAPI, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field, field_validator
from starlette.middleware.trustedhost import TrustedHostMiddleware

from . import __version__
from .config import ReviewConfig
from .core import VaultLayout, is_within, json_text, stable_id, utc_now
from .db import SCHEMA_VERSION, SchemaError, read_schema_version
from .review_copy import ApprovalConflictError, BackgroundJobService, ReviewedImportService
from .review_backfill import control_vault_backfill, current_backfill, ensure_vault_backfill
from .review_imports import DecisionConflictError, DecisionRequest, ImportManifestService
from .review_junk import (
    JUNK_REASONS,
    current_ready_junk_profile,
    enqueue_calibration_if_ready,
    ensure_default_junk_profile,
    ensure_junk_profile,
    normalize_junk_settings,
)
from .review_library import (
    LIBRARY_FACETS,
    LIBRARY_SORT_FIELDS,
    LIBRARY_SORT_INDEX,
    LIBRARY_SORT_SQL,
    current_catalog,
    ensure_catalog_job,
    ensure_library_view,
    is_common_library_query,
    library_query_sha256,
    normalize_library_query,
)
from .review_organization import (
    ensure_organization_job,
    current_organization_rollup,
    organization_query_sha256,
)
from .review_stacks import (
    current_ready_stack_profile,
    ensure_default_stack_profile,
    ensure_stack_profile,
    normalize_stack_settings,
)
from .review_stage6 import (
    MANIFEST_SORT_FIELDS,
    ensure_manifest_view,
    enqueue_job,
    is_common_manifest_query,
    normalize_manifest_query,
)


REVIEW_API_VERSION = "v1"
REVIEW_UI_ROOT = Path(__file__).with_name("review_ui_dist")
_PREFERENCE_KEY = re.compile(r"^[a-z][a-z0-9_.-]{0,63}$")
_IDEMPOTENCY_KEY = re.compile(r"^[\x21-\x7e]{1,128}$")


class ApiProblem(RuntimeError):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        *,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or {}


class MutationModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    generation: int = Field(ge=0)


class PreferenceMutation(MutationModel):
    revision: int = Field(ge=0)
    value: Any


class SavedViewCreate(MutationModel):
    name: str = Field(min_length=1, max_length=120)
    route: str = Field(min_length=1, max_length=256)
    state: dict[str, Any] = Field(default_factory=dict)

    @field_validator("name")
    @classmethod
    def normalized_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("name must contain visible text")
        return normalized

    @field_validator("route")
    @classmethod
    def local_route(cls, value: str) -> str:
        if not value.startswith("/") or value.startswith("//") or "://" in value:
            raise ValueError("route must be a same-origin application path")
        return value


class SavedViewUpdate(SavedViewCreate):
    revision: int = Field(ge=1)


class RevisionMutation(MutationModel):
    revision: int = Field(ge=1)


class ImportDiscoveryMutation(MutationModel):
    reuse_unchanged: bool = False


class ImportDecisionEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")

    item_id: str = Field(min_length=1, max_length=160)
    decision: Literal["include", "exclude"]
    expected_revision: int = Field(ge=0)
    reason: str | None = Field(default=None, max_length=500)


class ImportDecisionMutation(MutationModel):
    batch_revision: int = Field(ge=0)
    decisions: list[ImportDecisionEntry] = Field(min_length=1, max_length=500)


class ImportControlMutation(MutationModel):
    action: Literal["pause", "resume", "cancel"]


class ImportPreflightMutation(MutationModel):
    batch_revision: int = Field(ge=0)


class ImportApprovalMutation(MutationModel):
    batch_revision: int = Field(ge=0)
    preflight_job_id: str = Field(min_length=1, max_length=160)
    confirm: Literal[True]


class ImportExecuteMutation(MutationModel):
    approval_id: str = Field(min_length=1, max_length=160)
    execute: Literal[True]


class LibraryPrepareMutation(MutationModel):
    refresh: Literal[True] = True


class OrganizationPrepareMutation(MutationModel):
    refresh: bool = False


class BackfillMutation(MutationModel):
    action: Literal["start", "pause", "resume"]
    restart: bool = False


class LibraryStateEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")

    entity_id: str = Field(min_length=1, max_length=160)
    expected_revision: int = Field(ge=1)
    favourite: bool
    rejected: bool
    rating: int = Field(ge=0, le=5)


class LibraryStateMutation(MutationModel):
    states: list[LibraryStateEntry] = Field(min_length=1, max_length=500)


class LibraryOpenMutation(MutationModel):
    pass


class StackProfileSettingsModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    similarity: float = Field(ge=0.3, le=0.98)
    time_proximity_seconds: int = Field(ge=0, le=86_400)
    raw_jpeg_pairing_confidence: float = Field(ge=0, le=1)
    exposure_preference: Literal["darker", "neutral", "brighter"]
    sharpness_limit: float = Field(ge=0, le=1)
    motion_preference: Literal["freeze", "intentional_blur"]
    order_direction: Literal["asc", "desc"]


class StackProfileCreateMutation(MutationModel):
    name: str = Field(min_length=1, max_length=120)
    settings: StackProfileSettingsModel
    replaces_profile_id: str | None = Field(default=None, max_length=160)

    @field_validator("name")
    @classmethod
    def normalized_profile_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("name must contain visible text")
        return normalized


class StackCoverMutation(MutationModel):
    revision: int = Field(ge=1)
    cover_entity_id: str = Field(min_length=1, max_length=160)


class JunkProfileSettingsModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    confidence_threshold: float = Field(ge=0, le=1)
    enabled_reasons: list[str] = Field(min_length=1, max_length=len(JUNK_REASONS))
    minimum_agreement: int = Field(ge=1, le=len(JUNK_REASONS))
    protect_favourites: bool


class JunkProfileCreateMutation(MutationModel):
    name: str = Field(min_length=1, max_length=120)
    settings: JunkProfileSettingsModel
    replaces_profile_id: str | None = Field(default=None, max_length=160)

    @field_validator("name")
    @classmethod
    def normalized_junk_profile_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("name must contain visible text")
        return normalized


class JunkFeedbackMutation(MutationModel):
    entity_id: str = Field(min_length=1, max_length=160)
    feedback_kind: Literal["false_positive", "false_negative"]
    comment: str | None = Field(default=None, max_length=500)


class BulkRejectEntry(BaseModel):
    model_config = ConfigDict(extra="forbid")

    entity_id: str = Field(min_length=1, max_length=160)
    expected_revision: int = Field(ge=1)


class BulkRejectMutation(MutationModel):
    entities: list[BulkRejectEntry] = Field(min_length=1, max_length=500)
    confirm: Literal[True]
    confirm_favourites: bool = False
    confirm_large_selection: bool = False


class StackRejectRestMutation(MutationModel):
    stack_revision: int = Field(ge=1)
    confirm: Literal[True]
    confirm_favourites: bool = False
    confirm_large_selection: bool = False


class BulkUndoMutation(MutationModel):
    action_id: str = Field(min_length=1, max_length=128)


@dataclass(frozen=True)
class SavedViewCursor:
    updated_at: str
    saved_view_id: str

    def encode(self) -> str:
        raw = json_text({"v": 1, "updated_at": self.updated_at, "saved_view_id": self.saved_view_id})
        return base64.urlsafe_b64encode(raw.encode("utf-8")).decode("ascii").rstrip("=")

    @classmethod
    def decode(cls, value: str) -> SavedViewCursor:
        try:
            padding = "=" * (-len(value) % 4)
            payload = json.loads(base64.urlsafe_b64decode(value + padding).decode("utf-8"))
            if set(payload) != {"v", "updated_at", "saved_view_id"} or payload["v"] != 1:
                raise ValueError
            updated_at = payload["updated_at"]
            saved_view_id = payload["saved_view_id"]
            if not isinstance(updated_at, str) or not isinstance(saved_view_id, str):
                raise ValueError
            if not updated_at or not saved_view_id:
                raise ValueError
            return cls(updated_at, saved_view_id)
        except (ValueError, TypeError, KeyError, json.JSONDecodeError) as exc:
            raise ApiProblem(400, "bad_cursor", "The saved-view cursor is invalid or unsupported") from exc


@dataclass(frozen=True)
class ImportCursor:
    kind: str
    values: tuple[Any, ...]

    def encode(self) -> str:
        raw = json_text({"v": 1, "kind": self.kind, "values": list(self.values)})
        return base64.urlsafe_b64encode(raw.encode("utf-8")).decode("ascii").rstrip("=")

    @classmethod
    def decode(cls, value: str, *, expected_kind: str | None = None) -> ImportCursor:
        try:
            padding = "=" * (-len(value) % 4)
            payload = json.loads(base64.urlsafe_b64decode(value + padding).decode("utf-8"))
            if set(payload) != {"v", "kind", "values"} or payload["v"] != 1:
                raise ValueError
            if (expected_kind is not None and payload["kind"] != expected_kind) or not isinstance(payload["values"], list):
                raise ValueError
            if any(not isinstance(item, (str, int, float)) for item in payload["values"]):
                raise ValueError
            if not isinstance(payload["kind"], str):
                raise ValueError
            return cls(payload["kind"], tuple(payload["values"]))
        except (ValueError, TypeError, KeyError, json.JSONDecodeError) as exc:
            raise ApiProblem(400, "bad_cursor", "The import cursor is invalid for this result set") from exc


@dataclass(frozen=True)
class LibraryCursor:
    kind: str
    query_sha256: str
    values: tuple[Any, ...]

    def encode(self) -> str:
        raw = json_text(
            {"v": 1, "kind": self.kind, "query_sha256": self.query_sha256, "values": list(self.values)}
        )
        return base64.urlsafe_b64encode(raw.encode("utf-8")).decode("ascii").rstrip("=")

    @classmethod
    def decode(
        cls,
        value: str,
        *,
        expected_kind: str | None = None,
        expected_query_sha256: str | None = None,
    ) -> LibraryCursor:
        try:
            padding = "=" * (-len(value) % 4)
            payload = json.loads(base64.urlsafe_b64decode(value + padding).decode("utf-8"))
            if set(payload) != {"v", "kind", "query_sha256", "values"} or payload["v"] != 1:
                raise ValueError
            if not isinstance(payload["kind"], str) or not isinstance(payload["query_sha256"], str):
                raise ValueError
            if not isinstance(payload["values"], list) or any(
                item is not None and not isinstance(item, (str, int, float)) for item in payload["values"]
            ):
                raise ValueError
            if expected_kind is not None and payload["kind"] != expected_kind:
                raise ValueError
            if expected_query_sha256 is not None and payload["query_sha256"] != expected_query_sha256:
                raise ValueError
            return cls(payload["kind"], payload["query_sha256"], tuple(payload["values"]))
        except (ValueError, TypeError, KeyError, json.JSONDecodeError) as exc:
            raise ApiProblem(400, "bad_cursor", "The library cursor is invalid for this result set") from exc


def _decode_json(value: str, *, field: str) -> Any:
    try:
        return json.loads(value)
    except json.JSONDecodeError as exc:
        raise ApiProblem(500, "stored_state_invalid", f"Stored {field} JSON is invalid") from exc


def _request_digest(value: BaseModel) -> str:
    payload = json_text(value.model_dump(mode="json")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _request_id(request: Request) -> str:
    value = getattr(request.state, "request_id", None)
    return str(value or uuid.uuid4().hex)


def _envelope(
    request: Request,
    *,
    generation: int | None,
    data: Any = None,
    page: dict[str, Any] | None = None,
    job: dict[str, Any] | None = None,
    unavailable: list[dict[str, str]] | None = None,
    error: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "meta": {
            "api_version": REVIEW_API_VERSION,
            "schema_version": SCHEMA_VERSION,
            "generation": generation,
            "request_id": _request_id(request),
        },
        "data": data,
        "page": page,
        "job": job,
        "unavailable": unavailable or [],
        "error": error,
    }


def _problem_response(request: Request, problem: ApiProblem) -> JSONResponse:
    return JSONResponse(
        status_code=problem.status_code,
        content=_envelope(
            request,
            generation=None,
            error={"code": problem.code, "message": problem.message, "details": problem.details},
        ),
    )


class _ConnectionManifestDB:
    """Duck-typed ManifestDB facade over the API's bounded SQLite connection."""

    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn
        self.schema_version = read_schema_version(conn)

    def require_schema(self, required_version: int, *, feature_name: str = "requested feature") -> None:
        if self.schema_version != required_version:
            raise ApiProblem(
                503,
                "migration_required",
                f"{feature_name} requires manifest schema {required_version}; found {self.schema_version}",
            )

    def execute(self, sql: str, parameters: Iterator[Any] | tuple[Any, ...] | list[Any] = ()) -> sqlite3.Cursor:
        return self.conn.execute(sql, tuple(parameters))

    def executemany(self, sql: str, parameters: Any) -> sqlite3.Cursor:
        return self.conn.executemany(sql, parameters)

    def one(self, sql: str, parameters: Iterator[Any] | tuple[Any, ...] | list[Any] = ()) -> sqlite3.Row | None:
        return self.execute(sql, parameters).fetchone()

    def all(self, sql: str, parameters: Iterator[Any] | tuple[Any, ...] | list[Any] = ()) -> list[sqlite3.Row]:
        return self.execute(sql, parameters).fetchall()

    def commit(self) -> None:
        self.conn.commit()


def _open_in_explorer(path: Path) -> None:
    arguments = ["explorer.exe", f"/select,{path}"]
    subprocess.Popen(arguments, close_fds=True)  # noqa: S603


class ApplicationStateStore:
    """Small SQLite-authoritative state used by the Stage 5 application shell."""

    def __init__(self, config: ReviewConfig, *, folder_opener: Callable[[Path], None] | None = None) -> None:
        self.config = config
        self.layout = VaultLayout(config.vault_root)
        self.folder_opener = folder_opener or _open_in_explorer

    @contextmanager
    def connection(self) -> Iterator[sqlite3.Connection]:
        if not self.layout.database.is_file():
            raise ApiProblem(503, "manifest_uninitialized", "The vault manifest has not been initialized")
        try:
            conn = sqlite3.connect(
                self.layout.database,
                timeout=max(1.0, self.config.request_budgets.query_timeout_ms / 1000),
            )
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA foreign_keys=ON")
            conn.execute(f"PRAGMA busy_timeout={self.config.request_budgets.query_timeout_ms}")
            conn.execute("PRAGMA temp_store=MEMORY")
            deadline = time.monotonic() + self.config.request_budgets.query_timeout_ms / 1000
            conn.set_progress_handler(lambda: int(time.monotonic() > deadline), 1_000)
            version = read_schema_version(conn)
            if version < SCHEMA_VERSION:
                raise ApiProblem(
                    503,
                    "migration_required",
                    f"Review UI requires manifest schema {SCHEMA_VERSION}; found {version}",
                    details={"found": version, "required": SCHEMA_VERSION, "command": "media-vault migrate --vault <path>"},
                )
            if version > SCHEMA_VERSION:
                raise ApiProblem(
                    503,
                    "schema_unsupported",
                    f"Review UI supports manifest schema {SCHEMA_VERSION}; found newer schema {version}",
                    details={"found": version, "supported": SCHEMA_VERSION},
                )
            yield conn
        except ApiProblem:
            raise
        except sqlite3.OperationalError as exc:
            if "interrupted" in str(exc).lower():
                raise ApiProblem(
                    503,
                    "query_budget_exceeded",
                    "The request exceeded its bounded SQLite query budget",
                ) from exc
            raise ApiProblem(503, "manifest_unavailable", f"The vault manifest is unavailable: {exc}") from exc
        except (sqlite3.Error, SchemaError) as exc:
            raise ApiProblem(503, "manifest_unavailable", f"The vault manifest is unavailable: {exc}") from exc
        finally:
            if "conn" in locals():
                if conn.in_transaction:
                    conn.rollback()
                conn.close()

    @staticmethod
    def generation(conn: sqlite3.Connection) -> int:
        row = conn.execute(
            "SELECT generation FROM review_application_state WHERE state_id=1"
        ).fetchone()
        if row is None:
            raise ApiProblem(500, "application_state_missing", "Review application state is missing")
        return int(row["generation"])

    @staticmethod
    def _advance_generation(conn: sqlite3.Connection) -> int:
        now = utc_now()
        conn.execute(
            "UPDATE review_application_state SET generation=generation+1,updated_at=? WHERE state_id=1",
            (now,),
        )
        return ApplicationStateStore.generation(conn)

    @staticmethod
    def _require_generation(conn: sqlite3.Connection, expected: int) -> int:
        current = ApplicationStateStore.generation(conn)
        if expected != current:
            raise ApiProblem(
                409,
                "stale_generation",
                "Application state changed; reload before applying this update",
                details={"expected": expected, "current": current},
            )
        return current

    @staticmethod
    def _replay(
        conn: sqlite3.Connection,
        scope: str,
        key: str,
        digest: str,
    ) -> tuple[int, dict[str, Any]] | None:
        row = conn.execute(
            """SELECT request_sha256,response_status,response_json
                 FROM api_idempotency_records WHERE scope=? AND idempotency_key=?""",
            (scope, key),
        ).fetchone()
        if row is None:
            return None
        if row["request_sha256"] != digest:
            raise ApiProblem(
                409,
                "idempotency_conflict",
                "This idempotency key was already used with a different request",
            )
        return int(row["response_status"]), _decode_json(row["response_json"], field="idempotency response")

    @staticmethod
    def _record_replay(
        conn: sqlite3.Connection,
        scope: str,
        key: str,
        digest: str,
        status: int,
        response: dict[str, Any],
    ) -> None:
        conn.execute(
            """INSERT INTO api_idempotency_records(
                   scope,idempotency_key,request_sha256,response_status,response_json,created_at
               ) VALUES(?,?,?,?,?,?)""",
            (scope, key, digest, status, json_text(response), utc_now()),
        )

    def system(self) -> tuple[int, dict[str, Any]]:
        with self.connection() as conn:
            generation = self.generation(conn)
            return generation, {
                "service": "media-vault-review-ui",
                "tool_version": __version__,
                "schema_version": SCHEMA_VERSION,
                "generation": generation,
                "local_only": True,
            }

    def preferences(self) -> tuple[int, list[dict[str, Any]]]:
        with self.connection() as conn:
            rows = conn.execute(
                """SELECT preference_key,value_json,revision,created_at,updated_at
                     FROM user_preferences ORDER BY preference_key"""
            ).fetchall()
            return self.generation(conn), [
                {
                    "key": row["preference_key"],
                    "value": _decode_json(row["value_json"], field="preference"),
                    "revision": int(row["revision"]),
                    "created_at": row["created_at"],
                    "updated_at": row["updated_at"],
                }
                for row in rows
            ]

    def put_preference(
        self,
        request: Request,
        key: str,
        mutation: PreferenceMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        if not _PREFERENCE_KEY.fullmatch(key):
            raise ApiProblem(400, "invalid_preference_key", "Preference key is invalid")
        scope = f"PUT:/api/v1/preferences/{key}"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            row = conn.execute(
                "SELECT revision,created_at FROM user_preferences WHERE preference_key=?",
                (key,),
            ).fetchone()
            current_revision = int(row["revision"]) if row else 0
            if mutation.revision != current_revision:
                raise ApiProblem(
                    409,
                    "stale_revision",
                    "Preference revision changed; reload before applying this update",
                    details={"expected": mutation.revision, "current": current_revision},
                )
            now = utc_now()
            next_revision = current_revision + 1
            conn.execute(
                """INSERT INTO user_preferences(
                       preference_key,value_json,revision,created_at,updated_at
                   ) VALUES(?,?,?,?,?) ON CONFLICT(preference_key) DO UPDATE SET
                       value_json=excluded.value_json,revision=excluded.revision,updated_at=excluded.updated_at""",
                (key, json_text(mutation.value), next_revision, row["created_at"] if row else now, now),
            )
            generation = self._advance_generation(conn)
            result = _envelope(
                request,
                generation=generation,
                data={"key": key, "value": mutation.value, "revision": next_revision, "updated_at": now},
            )
            self._record_replay(conn, scope, idempotency_key, digest, 200, result)
            conn.commit()
            return 200, result

    def saved_views(
        self,
        *,
        limit: int,
        cursor: SavedViewCursor | None,
    ) -> tuple[int, list[dict[str, Any]], str | None]:
        clauses = ["deleted_at IS NULL"]
        params: list[Any] = []
        if cursor is not None:
            clauses.append("(updated_at<? OR (updated_at=? AND saved_view_id<?))")
            params.extend((cursor.updated_at, cursor.updated_at, cursor.saved_view_id))
        params.append(limit + 1)
        with self.connection() as conn:
            rows = conn.execute(
                """SELECT saved_view_id,name,route,state_json,revision,created_at,updated_at
                     FROM saved_views WHERE """
                + " AND ".join(clauses)
                + " ORDER BY updated_at DESC,saved_view_id DESC LIMIT ?",
                params,
            ).fetchall()
            generation = self.generation(conn)
        has_more = len(rows) > limit
        rows = rows[:limit]
        values = [self._saved_view(row) for row in rows]
        next_cursor = None
        if has_more and rows:
            next_cursor = SavedViewCursor(rows[-1]["updated_at"], rows[-1]["saved_view_id"]).encode()
        return generation, values, next_cursor

    @staticmethod
    def _saved_view(row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["saved_view_id"],
            "name": row["name"],
            "route": row["route"],
            "state": _decode_json(row["state_json"], field="saved view"),
            "revision": int(row["revision"]),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }

    def create_saved_view(
        self,
        request: Request,
        mutation: SavedViewCreate,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = "POST:/api/v1/saved-views"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            now = utc_now()
            view_id = f"sv1_{uuid.uuid4().hex}"
            conn.execute(
                """INSERT INTO saved_views(
                       saved_view_id,name,route,state_json,revision,created_at,updated_at
                   ) VALUES(?,?,?,?,1,?,?)""",
                (view_id, mutation.name, mutation.route, json_text(mutation.state), now, now),
            )
            generation = self._advance_generation(conn)
            row = conn.execute("SELECT * FROM saved_views WHERE saved_view_id=?", (view_id,)).fetchone()
            assert row is not None
            result = _envelope(request, generation=generation, data=self._saved_view(row))
            self._record_replay(conn, scope, idempotency_key, digest, 201, result)
            conn.commit()
            return 201, result

    def update_saved_view(
        self,
        request: Request,
        view_id: str,
        mutation: SavedViewUpdate,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = f"PUT:/api/v1/saved-views/{view_id}"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            row = conn.execute(
                "SELECT revision FROM saved_views WHERE saved_view_id=? AND deleted_at IS NULL",
                (view_id,),
            ).fetchone()
            if row is None:
                raise ApiProblem(404, "saved_view_not_found", "Saved view was not found")
            current_revision = int(row["revision"])
            if mutation.revision != current_revision:
                raise ApiProblem(
                    409,
                    "stale_revision",
                    "Saved-view revision changed; reload before applying this update",
                    details={"expected": mutation.revision, "current": current_revision},
                )
            now = utc_now()
            conn.execute(
                """UPDATE saved_views SET name=?,route=?,state_json=?,revision=revision+1,updated_at=?
                     WHERE saved_view_id=?""",
                (mutation.name, mutation.route, json_text(mutation.state), now, view_id),
            )
            generation = self._advance_generation(conn)
            updated = conn.execute("SELECT * FROM saved_views WHERE saved_view_id=?", (view_id,)).fetchone()
            assert updated is not None
            result = _envelope(request, generation=generation, data=self._saved_view(updated))
            self._record_replay(conn, scope, idempotency_key, digest, 200, result)
            conn.commit()
            return 200, result

    def delete_saved_view(
        self,
        request: Request,
        view_id: str,
        mutation: RevisionMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = f"DELETE:/api/v1/saved-views/{view_id}"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            row = conn.execute(
                "SELECT revision FROM saved_views WHERE saved_view_id=? AND deleted_at IS NULL",
                (view_id,),
            ).fetchone()
            if row is None:
                raise ApiProblem(404, "saved_view_not_found", "Saved view was not found")
            current_revision = int(row["revision"])
            if mutation.revision != current_revision:
                raise ApiProblem(
                    409,
                    "stale_revision",
                    "Saved-view revision changed; reload before applying this update",
                    details={"expected": mutation.revision, "current": current_revision},
                )
            now = utc_now()
            conn.execute(
                """UPDATE saved_views SET deleted_at=?,updated_at=?,revision=revision+1
                     WHERE saved_view_id=?""",
                (now, now, view_id),
            )
            generation = self._advance_generation(conn)
            result = _envelope(
                request,
                generation=generation,
                data={"id": view_id, "deleted": True, "revision": current_revision + 1},
            )
            self._record_replay(conn, scope, idempotency_key, digest, 200, result)
            conn.commit()
            return 200, result

    def job(self, job_id: str) -> tuple[int, dict[str, Any], list[dict[str, str]]]:
        with self.connection() as conn:
            row = conn.execute(
                """SELECT job_id,job_kind,subject_type,subject_id,phase,status,attempt,max_attempts,
                          control_state,created_at,queued_at,started_at,heartbeat_at,completed_at,
                          updated_at,progress_json,error_text
                     FROM background_jobs WHERE job_id=?""",
                (job_id,),
            ).fetchone()
            if row is None:
                raise ApiProblem(404, "job_not_found", "Background job was not found")
            progress = _decode_json(row["progress_json"], field="job progress") if row["progress_json"] else {}
            unavailable: list[dict[str, str]] = []
            if isinstance(progress, dict):
                for field, value in progress.items():
                    if isinstance(value, dict) and value.get("value") is None and value.get("reason"):
                        unavailable.append({"field": str(field), "reason": str(value["reason"])})
            return self.generation(conn), {
                "id": row["job_id"],
                "kind": row["job_kind"],
                "subject": {"type": row["subject_type"], "id": row["subject_id"]},
                "phase": row["phase"],
                "status": row["status"],
                "attempt": int(row["attempt"]),
                "max_attempts": int(row["max_attempts"]),
                "control_state": row["control_state"],
                "progress": progress,
                "error": {"message": row["error_text"]} if row["error_text"] else None,
                "timestamps": {
                    "created_at": row["created_at"],
                    "queued_at": row["queued_at"],
                    "started_at": row["started_at"],
                    "heartbeat_at": row["heartbeat_at"],
                    "completed_at": row["completed_at"],
                    "updated_at": row["updated_at"],
                },
            }, unavailable

    def backfill(self) -> tuple[int, dict[str, Any]]:
        with self.connection() as conn:
            return self.generation(conn), current_backfill(_ConnectionManifestDB(conn))

    def control_backfill(
        self,
        request: Request,
        mutation: BackfillMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = "POST:/api/v1/backfill/control"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            db = _ConnectionManifestDB(conn)
            try:
                if mutation.action == "start":
                    value = ensure_vault_backfill(db, self.config, restart=mutation.restart)
                else:
                    value = control_vault_backfill(db, mutation.action)
            except (KeyError, ValueError) as exc:
                raise ApiProblem(409, "backfill_control_conflict", str(exc)) from exc
            generation = self._advance_generation(conn)
            status = 200 if value["status"] == "completed" else 202
            result = _envelope(
                request,
                generation=generation,
                data=value,
                job={"id": value["id"], "status": value["status"], "phase": value["phase"]},
            )
            self._record_replay(conn, scope, idempotency_key, digest, status, result)
            conn.commit()
            return status, result

    @staticmethod
    def _library_view_value(row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["view_id"],
            "kind": row["view_kind"],
            "status": row["status"],
            "job_id": row["job_id"],
            "source_generation": int(row["source_generation"]),
            "state_generation": int(row["state_generation"]),
            "item_count": int(row["item_count"]),
            "error": row["error_text"],
        }

    @staticmethod
    def _library_entity_value(
        row: sqlite3.Row,
        derivatives: list[dict[str, Any]],
        stack: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        return {
            "id": row["entity_id"],
            "anchor_asset_id": row["anchor_asset_id"],
            "display_asset_id": row["display_asset_id"],
            "entity_kind": row["entity_kind"],
            "media_kind": row["media_kind"],
            "format": row["format_text"],
            "filename": row["filename_text"],
            "primary_path": row["primary_path_text"],
            "folder": row["folder_text"],
            "capture": {
                "time": row["capture_time_text"],
                "source": row["capture_time_source"],
                "ambiguous": bool(row["capture_time_ambiguous"]),
            },
            "import_time": row["import_time_text"],
            "equipment": {
                "camera_make": row["camera_make"],
                "camera_model": row["camera_model"],
                "lens_model": row["lens_model"],
            },
            "exposure": {
                "iso": row["iso_value"],
                "aperture": row["aperture_f_number"],
                "time_seconds": row["exposure_time_seconds"],
                "focal_length_mm": row["focal_length_mm"],
                "compensation_ev": row["exposure_compensation_ev"],
                "severity": row["exposure_score"],
            },
            "dimensions": {"width": row["width"], "height": row["height"]},
            "size_bytes": int(row["size_bytes"]),
            "quality": row["quality_score"],
            "counts": {
                "members": int(row["member_count"]),
                "raw_members": int(row["raw_member_count"]),
                "source_occurrences": int(row["source_occurrence_count"]),
                "exact_duplicates": int(row["exact_duplicate_count"]),
                "near_duplicates": int(row["near_duplicate_count"]),
            },
            "state": {
                "favourite": bool(row["favourite"]),
                "rejected": bool(row["rejected"]),
                "rating": int(row["rating"]),
                "revision": int(row["state_revision"]),
            },
            "indicators": {
                "has_raw_companion": bool(row["has_raw_companion"]),
                "stack_member_count": int(stack["member_count"]) if stack else 0,
            },
            "derivatives": derivatives,
            "stack": stack,
        }

    @staticmethod
    def _derivatives_for_entities(
        conn: sqlite3.Connection,
        rows: list[sqlite3.Row],
    ) -> dict[str, list[dict[str, Any]]]:
        if not rows:
            return {}
        entity_by_asset = {str(row["display_asset_id"]): str(row["entity_id"]) for row in rows}
        asset_ids = list(entity_by_asset)
        placeholders = ",".join("?" for _value in asset_ids)
        derivatives = conn.execute(
            f"""SELECT asset_id,long_edge,derivative_kind,width,height,mime_type,status,error_code,error_text
                  FROM derivatives WHERE asset_id IN ({placeholders}) AND is_current=1
                    AND derivative_kind IN ('thumbnail','detail')
                  ORDER BY asset_id,long_edge,derivative_id""",
            asset_ids,
        ).fetchall()
        result: dict[str, list[dict[str, Any]]] = {str(row["entity_id"]): [] for row in rows}
        for derivative in derivatives:
            entity_id = entity_by_asset[str(derivative["asset_id"])]
            edge = int(derivative["long_edge"])
            result[entity_id].append(
                {
                    "long_edge": edge,
                    "kind": derivative["derivative_kind"],
                    "width": derivative["width"],
                    "height": derivative["height"],
                    "mime_type": derivative["mime_type"],
                    "status": derivative["status"],
                    "error": derivative["error_text"] or derivative["error_code"],
                    "url": (
                        f"/api/v1/library/entities/{entity_id}/derivatives/{edge}"
                        if derivative["status"] == "ready"
                        else None
                    ),
                }
            )
        return result

    @staticmethod
    def _stacks_for_entities(
        conn: sqlite3.Connection,
        rows: list[sqlite3.Row],
        profile_id: str | None,
    ) -> dict[str, dict[str, Any]]:
        if not rows or not profile_id:
            return {}
        entity_ids = [str(row["entity_id"]) for row in rows]
        values = conn.execute(
            """SELECT s.profile_id,s.stack_id,s.member_count,s.cover_entity_id,
                      s.ranked_cover_entity_id,s.cover_override_entity_id,s.cover_explanation,
                      s.cover_method_version,s.cover_evidence_json,s.revision,m.entity_id,m.ordinal AS member_ordinal
                 FROM stack_members m JOIN stacks s USING(profile_id,stack_id)
                 WHERE s.profile_id=? AND m.entity_id IN ("""
            + ",".join("?" for _value in entity_ids)
            + ")",
            (profile_id, *entity_ids),
        ).fetchall()
        return {
            str(row["entity_id"]): {
                "profile_id": row["profile_id"],
                "id": row["stack_id"],
                "member_count": int(row["member_count"]),
                "cover_entity_id": row["cover_entity_id"],
                "ranked_cover_entity_id": row["ranked_cover_entity_id"],
                "cover_override_entity_id": row["cover_override_entity_id"],
                "cover_explanation": row["cover_explanation"],
                "cover_method_version": row["cover_method_version"],
                "cover_evidence": _decode_json(row["cover_evidence_json"], field="Stack cover evidence"),
                "revision": int(row["revision"]),
                "is_cover": row["entity_id"] == row["cover_entity_id"],
                "member_ordinal": int(row["member_ordinal"]),
            }
            for row in values
        }

    @staticmethod
    def _stack_profile_value(row: sqlite3.Row | dict[str, Any]) -> dict[str, Any]:
        return {
            "id": row["profile_id"],
            "name": row["name"],
            "settings": _decode_json(str(row["settings_json"]), field="Stack profile settings"),
            "settings_sha256": row["settings_sha256"],
            "catalog_generation": int(row["catalog_generation"]),
            "analyzer_version": row["analyzer_version"],
            "feature_analyzer_version": row["feature_analyzer_version"],
            "status": row["status"],
            "is_default": bool(row["is_default"]),
            "is_current": bool(row["is_current"]),
            "replaces_profile_id": row["replaces_profile_id"],
            "job_id": row["job_id"],
            "stack_count": int(row["stack_count"]),
            "member_count": int(row["member_count"]),
            "candidate_edge_count": int(row["candidate_edge_count"]),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
            "completed_at": row["completed_at"],
            "error": row["error_text"],
        }

    @staticmethod
    def _junk_profile_value(row: sqlite3.Row | dict[str, Any]) -> dict[str, Any]:
        return {
            "id": row["profile_id"],
            "name": row["name"],
            "settings": _decode_json(str(row["settings_json"]), field="junk profile settings"),
            "settings_sha256": row["settings_sha256"],
            "catalog_generation": int(row["catalog_generation"]),
            "analyzer_version": row["analyzer_version"],
            "signal_analyzer_version": row["signal_analyzer_version"],
            "calibration_version": row["calibration_version"],
            "status": row["status"],
            "is_default": bool(row["is_default"]),
            "is_current": bool(row["is_current"]),
            "replaces_profile_id": row["replaces_profile_id"],
            "calibration_parent_profile_id": row["calibration_parent_profile_id"],
            "job_id": row["job_id"],
            "result_count": int(row["result_count"]),
            "effectively_hidden_count": int(row["effectively_hidden_count"]),
            "favourite_protected_count": int(row["favourite_protected_count"]),
            "feedback_count": int(row["feedback_count"]),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
            "completed_at": row["completed_at"],
            "error": row["error_text"],
        }

    @staticmethod
    def _library_common_sql(
        query: dict[str, Any],
        catalog_generation: int,
        cursor: LibraryCursor | None,
        limit: int,
    ) -> tuple[str, tuple[Any, ...]]:
        sort = query["sorts"][0]
        field = sort["field"]
        direction = sort["direction"].upper()
        expression = LIBRARY_SORT_SQL[field]
        entity_expression = "s.entity_id" if field in {"favourite", "rejected", "rating"} else "e.entity_id"
        clauses = ["e.is_current=1", "e.catalog_generation=?"]
        parameters: list[Any] = [catalog_generation]
        for column, values in (
            ("e.media_kind", query["media_kinds"]),
            ("e.format_text", query["formats"]),
            ("e.camera_model", query["cameras"]),
            ("e.lens_model", query["lenses"]),
            ("e.folder_text", query["folders"]),
        ):
            if values:
                clauses.append(f"{column} IN ({','.join('?' for _value in values)})")
                parameters.extend(values)
        if query["favourite"] is not None:
            clauses.append("s.favourite=?")
            parameters.append(int(query["favourite"]))
        if query["rejected"] is not None:
            clauses.append("s.rejected=?")
            parameters.append(int(query["rejected"]))
        if query["rating_min"]:
            clauses.append("s.rating>=?")
            parameters.append(query["rating_min"])
        if query["rating_max"] < 5:
            clauses.append("s.rating<=?")
            parameters.append(query["rating_max"])
        if cursor is not None:
            if len(cursor.values) != 2:
                raise ApiProblem(400, "bad_cursor", "The library cursor has the wrong key shape")
            comparator = ">" if direction == "ASC" else "<"
            clauses.append(f"({expression},{entity_expression}){comparator}(?,?)")
            parameters.extend((cursor.values[0], cursor.values[1]))
        if field in {"favourite", "rejected", "rating"}:
            index = {
                "favourite": "idx_photo_user_state_favourite",
                "rejected": "idx_photo_user_state_rejected",
                "rating": "idx_photo_user_state_rating",
            }[field]
            source = f"photo_user_state s INDEXED BY {index} JOIN photo_entities e USING(entity_id)"
        else:
            index = LIBRARY_SORT_INDEX[field]
            if field == "capture_time" and query["media_kinds"]:
                index = "idx_photo_entities_media_capture"
            elif field == "capture_time" and query["formats"]:
                index = "idx_photo_entities_format_capture"
            elif field == "capture_time" and query["folders"]:
                index = "idx_photo_entities_folder_capture"
            source = f"photo_entities e INDEXED BY {index} JOIN photo_user_state s USING(entity_id)"
        sql = (
            f"SELECT e.*,s.favourite,s.rejected,s.rating,s.revision AS state_revision,{expression} AS sort_value "
            f"FROM {source} WHERE {' AND '.join(clauses)} "
            f"ORDER BY sort_value {direction},{entity_expression} {direction} LIMIT ?"
        )
        parameters.append(limit + 1)
        return sql, tuple(parameters)

    def library_page(
        self,
        *,
        limit: int,
        cursor: LibraryCursor | None,
        query: dict[str, Any],
    ) -> tuple[int, dict[str, Any], str | None, dict[str, Any] | None]:
        query_hash = library_query_sha256(query)
        if cursor is not None and cursor.query_sha256 != query_hash:
            raise ApiProblem(400, "bad_cursor", "The library cursor belongs to a different query")
        with self.connection() as conn:
            db = _ConnectionManifestDB(conn)
            catalog = current_catalog(db)
            if catalog is None:
                conn.execute("BEGIN IMMEDIATE")
                preparing = ensure_catalog_job(db, self.config)
                conn.commit()
                generation = self.generation(conn)
                return generation, {"items": [], "query": query, "catalog": None}, None, preparing
            catalog_generation = int(catalog["source_generation"])
            stack_profile_id = str(query.get("stack_profile_id") or "")
            if stack_profile_id and current_ready_stack_profile(
                db,
                catalog_generation=catalog_generation,
                profile_id=stack_profile_id,
            ) is None:
                raise ApiProblem(
                    425,
                    "stack_profile_not_ready",
                    "The selected persisted Stack profile is not ready for this library catalog",
                )
            if query.get("organization_kind") and current_organization_rollup(
                db,
                catalog_generation=catalog_generation,
            ) is None:
                conn.execute("BEGIN IMMEDIATE")
                preparing = ensure_organization_job(db, self.config)
                conn.commit()
                return (
                    self.generation(conn),
                    {"items": [], "query": query, "catalog": self._library_view_value(catalog)},
                    None,
                    preparing,
                )
            if is_common_library_query(query):
                if cursor is not None and cursor.kind != "library_common":
                    raise ApiProblem(400, "bad_cursor", "The library cursor has the wrong result kind")
                sql, parameters = self._library_common_sql(query, catalog_generation, cursor, limit)
                rows = conn.execute(sql, parameters).fetchall()
                view = None
                cursor_kind = "library_common"
            else:
                conn.execute("BEGIN IMMEDIATE")
                view = ensure_library_view(
                    db,
                    self.config,
                    catalog_generation=catalog_generation,
                    state_generation=self.generation(conn),
                    query=query,
                )
                conn.commit()
                if view["status"] != "ready":
                    return (
                        self.generation(conn),
                        {"items": [], "query": query, "catalog": self._library_view_value(catalog)},
                        None,
                        view,
                    )
                if cursor is not None and cursor.kind != "library_view":
                    raise ApiProblem(400, "bad_cursor", "The library cursor has the wrong result kind")
                ordinal = int(cursor.values[0]) if cursor is not None and len(cursor.values) == 1 else -1
                rows = conn.execute(
                    """SELECT e.*,s.favourite,s.rejected,s.rating,s.revision AS state_revision,
                              i.ordinal AS sort_value
                         FROM materialized_view_items i JOIN photo_entities e USING(entity_id)
                         JOIN photo_user_state s USING(entity_id)
                         WHERE i.view_id=? AND i.ordinal>? ORDER BY i.ordinal LIMIT ?""",
                    (view["view_id"], ordinal, limit + 1),
                ).fetchall()
                cursor_kind = "library_view"
            generation = self.generation(conn)
            has_more = len(rows) > limit
            rows = rows[:limit]
            derivatives = self._derivatives_for_entities(conn, rows)
            stacks = self._stacks_for_entities(conn, rows, stack_profile_id or None)
            items = [
                self._library_entity_value(
                    row,
                    derivatives.get(str(row["entity_id"]), []),
                    stacks.get(str(row["entity_id"])),
                )
                for row in rows
            ]
            next_cursor = None
            if has_more and rows:
                last = rows[-1]
                values = (int(last["sort_value"]),) if cursor_kind == "library_view" else (
                    last["sort_value"],
                    last["entity_id"],
                )
                next_cursor = LibraryCursor(cursor_kind, query_hash, values).encode()
            return (
                generation,
                {
                    "items": items,
                    "query": query,
                    "catalog": self._library_view_value(catalog),
                    "view": None if view is None else self._library_view_value(view),
                },
                next_cursor,
                None,
            )

    def library_facets(
        self,
        facet_name: str,
        *,
        limit: int,
        cursor: LibraryCursor | None,
    ) -> tuple[int, list[dict[str, Any]], str | None]:
        if facet_name not in LIBRARY_FACETS:
            raise ApiProblem(400, "invalid_library_facet", "The library facet is unsupported")
        query_hash = hashlib.sha256(f"facet:{facet_name}".encode()).hexdigest()
        if cursor is not None and (cursor.kind != "library_facet" or cursor.query_sha256 != query_hash):
            raise ApiProblem(400, "bad_cursor", "The facet cursor belongs to a different result set")
        with self.connection() as conn:
            catalog = current_catalog(_ConnectionManifestDB(conn))
            if catalog is None:
                raise ApiProblem(425, "library_preparing", "The persisted library catalog is not ready")
            clauses = ["catalog_generation=?", "facet_name=?"]
            parameters: list[Any] = [int(catalog["source_generation"]), facet_name]
            if cursor is not None:
                if len(cursor.values) != 2:
                    raise ApiProblem(400, "bad_cursor", "The facet cursor has the wrong key shape")
                clauses.append("(entity_count<? OR (entity_count=? AND value_key>?))")
                parameters.extend((cursor.values[0], cursor.values[0], cursor.values[1]))
            parameters.append(limit + 1)
            rows = conn.execute(
                """SELECT value_key,display_value,entity_count FROM facet_rollups WHERE """
                + " AND ".join(clauses)
                + " ORDER BY entity_count DESC,value_key LIMIT ?",
                parameters,
            ).fetchall()
            generation = self.generation(conn)
        has_more = len(rows) > limit
        rows = rows[:limit]
        values = [
            {"key": row["value_key"], "label": row["display_value"], "count": int(row["entity_count"])}
            for row in rows
        ]
        next_cursor = None
        if has_more and rows:
            next_cursor = LibraryCursor(
                "library_facet",
                query_hash,
                (int(rows[-1]["entity_count"]), rows[-1]["value_key"]),
            ).encode()
        return generation, values, next_cursor

    def library_detail(
        self,
        entity_id: str,
    ) -> tuple[int, dict[str, Any], list[dict[str, str]]]:
        with self.connection() as conn:
            entity = conn.execute(
                """SELECT e.*,s.favourite,s.rejected,s.rating,s.revision AS state_revision
                     FROM photo_entities e JOIN photo_user_state s USING(entity_id)
                     WHERE e.entity_id=? AND e.is_current=1""",
                (entity_id,),
            ).fetchone()
            if entity is None:
                raise ApiProblem(404, "library_entity_not_found", "The library entity was not found")
            derivatives = self._derivatives_for_entities(conn, [entity]).get(entity_id, [])
            members = conn.execute(
                """SELECT m.role,m.is_display,m.confidence_label,m.confidence_score,m.evidence_json,a.*
                     FROM photo_entity_members m JOIN assets a USING(asset_id)
                     WHERE m.entity_id=? ORDER BY m.is_display DESC,m.role,a.asset_id LIMIT 500""",
                (entity_id,),
            ).fetchall()
            asset_ids = [str(row["asset_id"]) for row in members]
            placeholders = ",".join("?" for _value in asset_ids)
            sources = conn.execute(
                f"""SELECT asset_id,source_file_id,path_text,relative_path_text,present,size_bytes,mtime_ns,
                           ctime_ns,discovery_status,last_error,last_seen_at
                      FROM source_files WHERE asset_id IN ({placeholders})
                      ORDER BY present DESC,path_text COLLATE BINARY LIMIT 500""",
                asset_ids,
            ).fetchall()
            destinations = conn.execute(
                f"""SELECT * FROM destinations WHERE asset_id IN ({placeholders})
                      ORDER BY status,path_text COLLATE BINARY LIMIT 500""",
                asset_ids,
            ).fetchall()
            relationships = conn.execute(
                f"""SELECT * FROM relationships WHERE left_asset_id IN ({placeholders})
                       OR right_asset_id IN ({placeholders}) ORDER BY created_at,relationship_id LIMIT 500""",
                (*asset_ids, *asset_ids),
            ).fetchall()
            raw_groups = conn.execute(
                f"""SELECT g.*,m.asset_id,m.role,m.confidence_label AS member_confidence_label,
                           m.confidence_score AS member_confidence_score,m.evidence_json AS member_evidence_json,
                           m.ambiguous,m.alternative_group_ids_json
                      FROM raw_jpeg_groups g JOIN raw_jpeg_members m USING(raw_jpeg_group_id)
                     WHERE m.asset_id IN ({placeholders}) ORDER BY g.raw_jpeg_group_id,m.asset_id LIMIT 500""",
                asset_ids,
            ).fetchall()
            warnings = conn.execute(
                f"""SELECT warning_id,asset_id,severity,code,message,evidence_json,created_at
                      FROM warnings WHERE asset_id IN ({placeholders}) ORDER BY warning_id DESC LIMIT 500""",
                asset_ids,
            ).fetchall()
            metadata = conn.execute(
                f"""SELECT * FROM asset_extended_metadata WHERE asset_id IN ({placeholders}) AND is_current=1
                      ORDER BY asset_id,updated_at DESC""",
                asset_ids,
            ).fetchall()
            features = conn.execute(
                f"""SELECT * FROM asset_features WHERE asset_id IN ({placeholders}) AND is_current=1
                      ORDER BY asset_id,updated_at DESC""",
                asset_ids,
            ).fetchall()
            events = conn.execute(
                """SELECT event_id,action,before_json,after_json,undo_of_event_id,created_at
                     FROM photo_user_state_events WHERE entity_id=? ORDER BY event_id DESC LIMIT 100""",
                (entity_id,),
            ).fetchall()
            stack_profile = current_ready_stack_profile(
                _ConnectionManifestDB(conn),
                catalog_generation=int(entity["catalog_generation"]),
            )
            stack_profile_id = str(stack_profile["profile_id"]) if stack_profile else None
            stack_value = self._stacks_for_entities(conn, [entity], stack_profile_id).get(entity_id)
            stack_memberships = (
                conn.execute(
                    """SELECT p.profile_id,p.name,p.settings_json,s.stack_id,s.ordinal AS stack_ordinal,
                              s.member_count,s.ranked_cover_entity_id,s.cover_entity_id,
                              s.cover_override_entity_id,s.cover_explanation,s.cover_method_version,
                              s.cover_evidence_json,s.revision,m.ordinal AS member_ordinal,m.rank_score,
                              m.rank_evidence_json,m.is_cover,m.is_override
                         FROM stack_members m JOIN stacks s USING(profile_id,stack_id)
                         JOIN stack_profiles p USING(profile_id)
                         WHERE m.entity_id=? AND p.is_current=1 AND p.status='ready'
                         ORDER BY p.is_default DESC,p.completed_at DESC,p.profile_id LIMIT 100""",
                    (entity_id,),
                ).fetchall()
            )
            stack_events = (
                conn.execute(
                    """SELECT event_id,profile_id,stack_id,before_cover_entity_id,after_cover_entity_id,created_at
                         FROM stack_cover_events WHERE (profile_id,stack_id) IN (
                           SELECT profile_id,stack_id FROM stack_members WHERE entity_id=?
                         ) ORDER BY event_id DESC LIMIT 100""",
                    (entity_id,),
                ).fetchall()
            )
            junk_profile = current_ready_junk_profile(
                _ConnectionManifestDB(conn),
                catalog_generation=int(entity["catalog_generation"]),
            )
            junk_result = None
            junk_signals: list[sqlite3.Row] = []
            if junk_profile is not None:
                junk_result = conn.execute(
                    """SELECT * FROM junk_effective_results WHERE profile_id=? AND entity_id=?""",
                    (junk_profile["profile_id"], entity_id),
                ).fetchone()
                junk_signals = conn.execute(
                    """SELECT reason,confidence,threshold,method_version,status,evidence_json,
                              better_alternative_entity_id,error_text
                         FROM junk_signals WHERE catalog_generation=? AND entity_id=?
                           AND method_version=? AND is_current=1
                         ORDER BY confidence DESC,reason""",
                    (
                        int(entity["catalog_generation"]),
                        entity_id,
                        junk_profile["signal_analyzer_version"],
                    ),
                ).fetchall()
            generation = self.generation(conn)

        def decoded(rows: list[sqlite3.Row]) -> list[dict[str, Any]]:
            values = []
            for row in rows:
                item = dict(row)
                for key, value in tuple(item.items()):
                    if key.endswith("_json") and isinstance(value, str):
                        item[key.removesuffix("_json")] = _decode_json(value, field=key)
                        del item[key]
                values.append(item)
            return values

        junk_value = None
        if junk_profile is not None:
            junk_value = {
                "profile": self._junk_profile_value(junk_profile),
                "result": None if junk_result is None else decoded([junk_result])[0],
                "signals": decoded(junk_signals),
            }
        data = {
            "entity": self._library_entity_value(entity, derivatives, stack_value),
            "members": decoded(members),
            "sources": decoded(sources),
            "destinations": decoded(destinations),
            "relationships": decoded(relationships),
            "raw_jpeg_evidence": decoded(raw_groups),
            "warnings": decoded(warnings),
            "metadata": decoded(metadata),
            "features": decoded(features),
            "state_events": decoded(events),
            "stacks": decoded(stack_memberships),
            "stack_cover_events": decoded(stack_events),
            "junk": junk_value,
            "placeholders": {
                "stacks": "Persisted Stack membership and cover evidence are available above",
                "junk": (
                    "Persisted junk evidence is available above"
                    if junk_value is not None
                    else "No ready junk profile is available"
                ),
            },
        }
        unavailable = [] if junk_value is not None else [
            {"field": "junk_explanations", "reason": "A persisted junk profile has not completed"},
        ]
        return generation, data, unavailable

    def library_derivative(self, entity_id: str, long_edge: int) -> tuple[Path, str]:
        with self.connection() as conn:
            row = conn.execute(
                """SELECT d.relative_path_text,d.mime_type,d.byte_size,d.file_mtime_ns
                     FROM photo_entities e JOIN derivatives d ON d.asset_id=e.display_asset_id
                     WHERE e.entity_id=? AND e.is_current=1 AND d.is_current=1 AND d.status='ready'
                       AND d.long_edge=? AND d.derivative_kind IN ('thumbnail','detail')
                     ORDER BY CASE d.derivative_kind WHEN 'thumbnail' THEN 0 ELSE 1 END,d.derivative_id LIMIT 1""",
                (entity_id, long_edge),
            ).fetchone()
            if row is None or not row["relative_path_text"]:
                raise ApiProblem(425, "derivative_not_ready", "The persisted derivative is not ready")
        path = self.config.derivative_root / Path(row["relative_path_text"])
        if not is_within(path, self.config.derivative_root) or not path.is_file():
            raise ApiProblem(409, "derivative_missing", "The certified derivative file is unavailable")
        stat = path.stat()
        if stat.st_size != int(row["byte_size"] or -1) or stat.st_mtime_ns != int(row["file_mtime_ns"] or -1):
            raise ApiProblem(409, "derivative_changed", "The derivative no longer matches its persisted certificate")
        return path, str(row["mime_type"] or "image/webp")

    def prepare_library(
        self,
        request: Request,
        mutation: LibraryPrepareMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = "POST:/api/v1/library/prepare"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            view = ensure_catalog_job(_ConnectionManifestDB(conn), self.config, force=True)
            generation = self._advance_generation(conn)
            result = _envelope(
                request,
                generation=generation,
                data=self._library_view_value(view),
                job={"id": view["job_id"], "status": view["status"], "phase": "library_catalog_materialize"},
            )
            self._record_replay(conn, scope, idempotency_key, digest, 202, result)
            conn.commit()
            return 202, result

    def stack_profiles(
        self,
        *,
        limit: int,
        cursor: LibraryCursor | None,
    ) -> tuple[int, list[dict[str, Any]], str | None]:
        query_hash = hashlib.sha256(b"stack-profiles-v1").hexdigest()
        if cursor is not None and (cursor.kind != "stack_profiles" or cursor.query_sha256 != query_hash):
            raise ApiProblem(400, "bad_cursor", "The Stack-profile cursor belongs to a different result set")
        with self.connection() as conn:
            catalog = current_catalog(_ConnectionManifestDB(conn))
            if catalog is None:
                raise ApiProblem(425, "library_preparing", "The persisted library catalog is not ready")
            clauses = ["catalog_generation=?", "is_current=1"]
            parameters: list[Any] = [int(catalog["source_generation"])]
            if cursor is not None:
                if len(cursor.values) != 2:
                    raise ApiProblem(400, "bad_cursor", "The Stack-profile cursor has the wrong key shape")
                clauses.append("(updated_at,profile_id)<(?,?)")
                parameters.extend(cursor.values)
            parameters.append(limit + 1)
            rows = conn.execute(
                "SELECT * FROM stack_profiles WHERE "
                + " AND ".join(clauses)
                + " ORDER BY updated_at DESC,profile_id DESC LIMIT ?",
                parameters,
            ).fetchall()
            generation = self.generation(conn)
        has_more = len(rows) > limit
        rows = rows[:limit]
        next_cursor = None
        if has_more and rows:
            next_cursor = LibraryCursor(
                "stack_profiles",
                query_hash,
                (rows[-1]["updated_at"], rows[-1]["profile_id"]),
            ).encode()
        return generation, [self._stack_profile_value(row) for row in rows], next_cursor

    def stack_status(self, profile_id: str | None = None) -> tuple[int, dict[str, Any]]:
        with self.connection() as conn:
            db = _ConnectionManifestDB(conn)
            catalog = current_catalog(db)
            if catalog is None:
                raise ApiProblem(425, "library_preparing", "The persisted library catalog is not ready")
            generation = int(catalog["source_generation"])
            if profile_id:
                row = conn.execute(
                    "SELECT * FROM stack_profiles WHERE profile_id=? AND catalog_generation=? AND is_current=1",
                    (profile_id, generation),
                ).fetchone()
                if row is None:
                    raise ApiProblem(404, "stack_profile_not_found", "The Stack profile was not found")
            else:
                row = conn.execute(
                    """SELECT * FROM stack_profiles WHERE catalog_generation=? AND is_current=1
                         ORDER BY is_default DESC,completed_at DESC,created_at,profile_id LIMIT 1""",
                    (generation,),
                ).fetchone()
                if row is None:
                    conn.execute("BEGIN IMMEDIATE")
                    created = ensure_default_stack_profile(db, self.config)
                    conn.commit()
                    row = conn.execute(
                        "SELECT * FROM stack_profiles WHERE profile_id=?",
                        (created["profile_id"],),
                    ).fetchone()
            assert row is not None
            return self.generation(conn), self._stack_profile_value(row)

    def create_stack_profile(
        self,
        request: Request,
        mutation: StackProfileCreateMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = "POST:/api/v1/stacks/profiles"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            if mutation.replaces_profile_id:
                replaced = conn.execute(
                    "SELECT 1 FROM stack_profiles WHERE profile_id=? AND is_current=1",
                    (mutation.replaces_profile_id,),
                ).fetchone()
                if replaced is None:
                    raise ApiProblem(404, "stack_profile_not_found", "The replaced Stack profile was not found")
            try:
                settings = normalize_stack_settings(**mutation.settings.model_dump())
                profile = ensure_stack_profile(
                    _ConnectionManifestDB(conn),
                    self.config,
                    name=mutation.name,
                    settings=settings,
                    replaces_profile_id=mutation.replaces_profile_id,
                )
            except ValueError as exc:
                raise ApiProblem(409, "stack_profile_unavailable", str(exc)) from exc
            generation = self._advance_generation(conn)
            data = self._stack_profile_value(profile)
            result = _envelope(
                request,
                generation=generation,
                data=data,
                job={"id": data["job_id"], "status": data["status"], "phase": "stack_profile_materialize"},
            )
            status = 200 if data["status"] == "ready" else 202
            self._record_replay(conn, scope, idempotency_key, digest, status, result)
            conn.commit()
            return status, result

    def stack_page(
        self,
        profile_id: str,
        *,
        limit: int,
        cursor: LibraryCursor | None,
    ) -> tuple[int, dict[str, Any], str | None, dict[str, Any] | None]:
        query_hash = hashlib.sha256(f"stack-page:{profile_id}".encode()).hexdigest()
        if cursor is not None and (cursor.kind != "stack_page" or cursor.query_sha256 != query_hash):
            raise ApiProblem(400, "bad_cursor", "The Stack cursor belongs to a different profile")
        with self.connection() as conn:
            catalog = current_catalog(_ConnectionManifestDB(conn))
            if catalog is None:
                raise ApiProblem(425, "library_preparing", "The persisted library catalog is not ready")
            profile = conn.execute(
                "SELECT * FROM stack_profiles WHERE profile_id=? AND catalog_generation=? AND is_current=1",
                (profile_id, int(catalog["source_generation"])),
            ).fetchone()
            if profile is None:
                raise ApiProblem(404, "stack_profile_not_found", "The Stack profile was not found")
            generation = self.generation(conn)
            profile_value = self._stack_profile_value(profile)
            if profile["status"] != "ready":
                return generation, {"profile": profile_value, "items": []}, None, dict(profile)
            ordinal = -1
            stack_id = ""
            if cursor is not None:
                if len(cursor.values) != 2:
                    raise ApiProblem(400, "bad_cursor", "The Stack cursor has the wrong key shape")
                ordinal = int(cursor.values[0])
                stack_id = str(cursor.values[1])
            rows = conn.execute(
                """SELECT s.*,e.*,us.favourite,us.rejected,us.rating,us.revision AS state_revision
                     FROM stacks s JOIN photo_entities e ON e.entity_id=s.cover_entity_id
                     JOIN photo_user_state us ON us.entity_id=e.entity_id
                     WHERE s.profile_id=? AND (s.ordinal,s.stack_id)>(?,?)
                     ORDER BY s.ordinal,s.stack_id LIMIT ?""",
                (profile_id, ordinal, stack_id, limit + 1),
            ).fetchall()
            has_more = len(rows) > limit
            rows = rows[:limit]
            derivatives = self._derivatives_for_entities(conn, rows)
            stack_values = self._stacks_for_entities(conn, rows, profile_id)
            items = [
                {
                    "stack": stack_values[str(row["entity_id"])],
                    "cover": self._library_entity_value(
                        row,
                        derivatives.get(str(row["entity_id"]), []),
                        stack_values.get(str(row["entity_id"])),
                    ),
                }
                for row in rows
            ]
        next_cursor = None
        if has_more and rows:
            next_cursor = LibraryCursor(
                "stack_page",
                query_hash,
                (int(rows[-1]["ordinal"]), rows[-1]["stack_id"]),
            ).encode()
        return generation, {"profile": profile_value, "items": items}, next_cursor, None

    def stack_detail(self, profile_id: str, stack_id: str) -> tuple[int, dict[str, Any]]:
        with self.connection() as conn:
            catalog = current_catalog(_ConnectionManifestDB(conn))
            if catalog is None:
                raise ApiProblem(425, "library_preparing", "The persisted library catalog is not ready")
            profile = conn.execute(
                """SELECT * FROM stack_profiles WHERE profile_id=? AND catalog_generation=?
                     AND is_current=1 AND status='ready'""",
                (profile_id, int(catalog["source_generation"])),
            ).fetchone()
            if profile is None:
                raise ApiProblem(425, "stack_profile_not_ready", "The selected Stack profile is not ready")
            stack = conn.execute(
                "SELECT * FROM stacks WHERE profile_id=? AND stack_id=?",
                (profile_id, stack_id),
            ).fetchone()
            if stack is None:
                raise ApiProblem(404, "stack_not_found", "The Stack was not found")
            rows = conn.execute(
                """SELECT e.*,us.favourite,us.rejected,us.rating,us.revision AS state_revision,
                          m.ordinal AS stack_member_ordinal,m.rank_score,m.rank_evidence_json,m.is_cover,m.is_override
                     FROM stack_members m JOIN photo_entities e USING(entity_id)
                     JOIN photo_user_state us USING(entity_id)
                     WHERE m.profile_id=? AND m.stack_id=? ORDER BY m.ordinal,m.entity_id LIMIT 500""",
                (profile_id, stack_id),
            ).fetchall()
            derivatives = self._derivatives_for_entities(conn, rows)
            stack_values = self._stacks_for_entities(conn, rows, profile_id)
            members = []
            for row in rows:
                entity_id = str(row["entity_id"])
                members.append(
                    {
                        "entity": self._library_entity_value(
                            row,
                            derivatives.get(entity_id, []),
                            stack_values.get(entity_id),
                        ),
                        "ordinal": int(row["stack_member_ordinal"]),
                        "rank_score": float(row["rank_score"]),
                        "rank_evidence": _decode_json(row["rank_evidence_json"], field="Stack member rank evidence"),
                        "is_cover": bool(row["is_cover"]),
                        "is_override": bool(row["is_override"]),
                    }
                )
            events = conn.execute(
                """SELECT event_id,before_cover_entity_id,after_cover_entity_id,created_at
                     FROM stack_cover_events WHERE profile_id=? AND stack_id=? ORDER BY event_id DESC LIMIT 100""",
                (profile_id, stack_id),
            ).fetchall()
            return self.generation(conn), {
                "profile": self._stack_profile_value(profile),
                "stack": self._stacks_for_entities(conn, [next(row for row in rows if row["entity_id"] == stack["cover_entity_id"])], profile_id)[str(stack["cover_entity_id"])],
                "members": members,
                "cover_events": [dict(row) for row in events],
            }

    def update_stack_cover(
        self,
        request: Request,
        profile_id: str,
        stack_id: str,
        mutation: StackCoverMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = f"PUT:/api/v1/stacks/{profile_id}/{stack_id}/cover"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            catalog = current_catalog(_ConnectionManifestDB(conn))
            if catalog is None:
                raise ApiProblem(425, "library_preparing", "The persisted library catalog is not ready")
            stack = conn.execute(
                """SELECT s.* FROM stacks s JOIN stack_profiles p USING(profile_id)
                     WHERE s.profile_id=? AND s.stack_id=? AND p.catalog_generation=?
                       AND p.is_current=1 AND p.status='ready'""",
                (profile_id, stack_id, int(catalog["source_generation"])),
            ).fetchone()
            if stack is None:
                raise ApiProblem(404, "stack_not_found", "The ready Stack was not found")
            if int(stack["revision"]) != mutation.revision:
                raise ApiProblem(
                    409,
                    "stale_revision",
                    "The Stack cover changed; reload before applying an override",
                    details={"expected": mutation.revision, "current": int(stack["revision"])},
                )
            member = conn.execute(
                "SELECT 1 FROM stack_members WHERE profile_id=? AND stack_id=? AND entity_id=?",
                (profile_id, stack_id, mutation.cover_entity_id),
            ).fetchone()
            if member is None:
                raise ApiProblem(409, "invalid_stack_cover", "A Stack cover must be one of its persisted members")
            before = str(stack["cover_entity_id"])
            override = None if mutation.cover_entity_id == stack["ranked_cover_entity_id"] else mutation.cover_entity_id
            evidence = _decode_json(stack["cover_evidence_json"], field="Stack cover evidence")
            explanation = (
                str(evidence.get("ranked_explanation") or stack["cover_explanation"])
                if override is None
                else f"Manual metadata-only cover override selected {mutation.cover_entity_id}; the persisted ranked cover remains {stack['ranked_cover_entity_id']}."
            )
            evidence = {**evidence, "override_entity_id": override, "ranked_cover_entity_id": stack["ranked_cover_entity_id"]}
            now = utc_now()
            conn.execute(
                """UPDATE stacks SET cover_entity_id=?,cover_override_entity_id=?,cover_explanation=?,
                       cover_evidence_json=?,revision=revision+1,updated_at=? WHERE profile_id=? AND stack_id=?""",
                (
                    mutation.cover_entity_id,
                    override,
                    explanation,
                    json_text(evidence),
                    now,
                    profile_id,
                    stack_id,
                ),
            )
            conn.execute(
                """UPDATE stack_members SET is_cover=CASE WHEN entity_id=? THEN 1 ELSE 0 END,
                       is_override=CASE WHEN entity_id=? AND ? IS NOT NULL THEN 1 ELSE 0 END
                     WHERE profile_id=? AND stack_id=?""",
                (mutation.cover_entity_id, mutation.cover_entity_id, override, profile_id, stack_id),
            )
            conn.execute(
                """INSERT INTO stack_cover_events(
                       profile_id,stack_id,before_cover_entity_id,after_cover_entity_id,idempotency_key,created_at
                   ) VALUES(?,?,?,?,?,?)""",
                (profile_id, stack_id, before, mutation.cover_entity_id, idempotency_key, now),
            )
            generation = self._advance_generation(conn)
            updated = conn.execute(
                "SELECT * FROM stacks WHERE profile_id=? AND stack_id=?",
                (profile_id, stack_id),
            ).fetchone()
            assert updated is not None
            result = _envelope(
                request,
                generation=generation,
                data={
                    "profile_id": profile_id,
                    "stack_id": stack_id,
                    "cover_entity_id": updated["cover_entity_id"],
                    "ranked_cover_entity_id": updated["ranked_cover_entity_id"],
                    "cover_override_entity_id": updated["cover_override_entity_id"],
                    "cover_explanation": updated["cover_explanation"],
                    "revision": int(updated["revision"]),
                    "media_mutation": "none",
                },
            )
            self._record_replay(conn, scope, idempotency_key, digest, 200, result)
            conn.commit()
            return 200, result

    def junk_profiles(
        self,
        *,
        limit: int,
        cursor: LibraryCursor | None,
    ) -> tuple[int, list[dict[str, Any]], str | None]:
        query_hash = hashlib.sha256(b"junk-profiles-v1").hexdigest()
        if cursor is not None and (cursor.kind != "junk_profiles" or cursor.query_sha256 != query_hash):
            raise ApiProblem(400, "bad_cursor", "The junk-profile cursor belongs to a different result set")
        with self.connection() as conn:
            catalog = current_catalog(_ConnectionManifestDB(conn))
            if catalog is None:
                raise ApiProblem(425, "library_preparing", "The persisted library catalog is not ready")
            clauses = ["catalog_generation=?", "is_current=1"]
            parameters: list[Any] = [int(catalog["source_generation"])]
            if cursor is not None:
                if len(cursor.values) != 2:
                    raise ApiProblem(400, "bad_cursor", "The junk-profile cursor has the wrong key shape")
                clauses.append("(updated_at,profile_id)<(?,?)")
                parameters.extend(cursor.values)
            parameters.append(limit + 1)
            rows = conn.execute(
                "SELECT * FROM junk_profiles WHERE "
                + " AND ".join(clauses)
                + " ORDER BY updated_at DESC,profile_id DESC LIMIT ?",
                parameters,
            ).fetchall()
            generation = self.generation(conn)
        has_more = len(rows) > limit
        rows = rows[:limit]
        next_cursor = None
        if has_more and rows:
            next_cursor = LibraryCursor(
                "junk_profiles",
                query_hash,
                (rows[-1]["updated_at"], rows[-1]["profile_id"]),
            ).encode()
        return generation, [self._junk_profile_value(row) for row in rows], next_cursor

    def junk_status(self, profile_id: str | None = None) -> tuple[int, dict[str, Any]]:
        with self.connection() as conn:
            db = _ConnectionManifestDB(conn)
            catalog = current_catalog(db)
            if catalog is None:
                raise ApiProblem(425, "library_preparing", "The persisted library catalog is not ready")
            catalog_generation = int(catalog["source_generation"])
            if profile_id:
                row = conn.execute(
                    """SELECT * FROM junk_profiles WHERE profile_id=? AND catalog_generation=? AND is_current=1""",
                    (profile_id, catalog_generation),
                ).fetchone()
                if row is None:
                    raise ApiProblem(404, "junk_profile_not_found", "The junk profile was not found")
            else:
                row = conn.execute(
                    """SELECT * FROM junk_profiles WHERE catalog_generation=? AND is_current=1
                         ORDER BY is_default DESC,completed_at DESC,created_at,profile_id LIMIT 1""",
                    (catalog_generation,),
                ).fetchone()
                if row is None:
                    conn.execute("BEGIN IMMEDIATE")
                    created = ensure_default_junk_profile(db, self.config)
                    conn.commit()
                    row = conn.execute(
                        "SELECT * FROM junk_profiles WHERE profile_id=?",
                        (created["profile_id"],),
                    ).fetchone()
            assert row is not None
            return self.generation(conn), self._junk_profile_value(row)

    def create_junk_profile(
        self,
        request: Request,
        mutation: JunkProfileCreateMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = "POST:/api/v1/junk/profiles"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            if mutation.replaces_profile_id:
                replaced = conn.execute(
                    "SELECT 1 FROM junk_profiles WHERE profile_id=? AND is_current=1",
                    (mutation.replaces_profile_id,),
                ).fetchone()
                if replaced is None:
                    raise ApiProblem(404, "junk_profile_not_found", "The replaced junk profile was not found")
            try:
                settings = normalize_junk_settings(**mutation.settings.model_dump())
                profile = ensure_junk_profile(
                    _ConnectionManifestDB(conn),
                    self.config,
                    name=mutation.name,
                    settings=settings,
                    replaces_profile_id=mutation.replaces_profile_id,
                )
            except ValueError as exc:
                raise ApiProblem(409, "junk_profile_unavailable", str(exc)) from exc
            generation = self._advance_generation(conn)
            data = self._junk_profile_value(profile)
            result = _envelope(
                request,
                generation=generation,
                data=data,
                job={"id": data["job_id"], "status": data["status"], "phase": "junk_profile_materialize"},
            )
            status = 200 if data["status"] == "ready" else 202
            self._record_replay(conn, scope, idempotency_key, digest, status, result)
            conn.commit()
            return status, result

    def junk_page(
        self,
        profile_id: str,
        *,
        hidden_only: bool,
        limit: int,
        cursor: LibraryCursor | None,
    ) -> tuple[int, dict[str, Any], str | None, dict[str, Any] | None]:
        query_hash = hashlib.sha256(
            json_text({"profile_id": profile_id, "hidden_only": hidden_only}).encode("utf-8")
        ).hexdigest()
        if cursor is not None and (cursor.kind != "junk_results" or cursor.query_sha256 != query_hash):
            raise ApiProblem(400, "bad_cursor", "The junk-result cursor belongs to a different profile")
        with self.connection() as conn:
            catalog = current_catalog(_ConnectionManifestDB(conn))
            if catalog is None:
                raise ApiProblem(425, "library_preparing", "The persisted library catalog is not ready")
            profile = conn.execute(
                """SELECT * FROM junk_profiles WHERE profile_id=? AND catalog_generation=? AND is_current=1""",
                (profile_id, int(catalog["source_generation"])),
            ).fetchone()
            if profile is None:
                raise ApiProblem(404, "junk_profile_not_found", "The junk profile was not found")
            generation = self.generation(conn)
            profile_value = self._junk_profile_value(profile)
            if profile["status"] != "ready":
                return generation, {"profile": profile_value, "items": []}, None, dict(profile)
            clauses = ["r.profile_id=?"]
            parameters: list[Any] = [profile_id]
            if hidden_only:
                clauses.append("r.effective_hidden=1")
            if cursor is not None:
                if len(cursor.values) != 2:
                    raise ApiProblem(400, "bad_cursor", "The junk-result cursor has the wrong key shape")
                clauses.append("(r.ordinal,r.entity_id)>(?,?)")
                parameters.extend((int(cursor.values[0]), str(cursor.values[1])))
            parameters.append(limit + 1)
            rows = conn.execute(
                """SELECT r.*,e.*,s.favourite,s.rejected,s.rating,s.revision AS state_revision
                     FROM junk_effective_results r INDEXED BY idx_junk_results_hidden_page
                     JOIN photo_entities e USING(entity_id) JOIN photo_user_state s USING(entity_id)
                     WHERE """
                + " AND ".join(clauses)
                + " ORDER BY r.ordinal,r.entity_id LIMIT ?",
                parameters,
            ).fetchall()
            has_more = len(rows) > limit
            rows = rows[:limit]
            derivatives = self._derivatives_for_entities(conn, rows)
            alternative_ids = sorted(
                {str(row["better_alternative_entity_id"]) for row in rows if row["better_alternative_entity_id"]}
            )
            alternative_rows = (
                conn.execute(
                    """SELECT e.*,s.favourite,s.rejected,s.rating,s.revision AS state_revision
                         FROM photo_entities e JOIN photo_user_state s USING(entity_id)
                         WHERE e.is_current=1 AND e.entity_id IN ("""
                    + ",".join("?" for _ in alternative_ids)
                    + ") ORDER BY e.entity_id",
                    alternative_ids,
                ).fetchall()
                if alternative_ids
                else []
            )
            alternative_derivatives = self._derivatives_for_entities(conn, alternative_rows)
            alternatives = {
                str(row["entity_id"]): self._library_entity_value(
                    row,
                    alternative_derivatives.get(str(row["entity_id"]), []),
                )
                for row in alternative_rows
            }
            items = []
            for row in rows:
                entity_id = str(row["entity_id"])
                items.append(
                    {
                        "entity": self._library_entity_value(
                            row,
                            derivatives.get(entity_id, []),
                        ),
                        "ordinal": int(row["ordinal"]),
                        "effective_hidden": bool(row["effective_hidden"]),
                        "favourite_protected": bool(row["favourite_protected"]),
                        "agreement_count": int(row["agreement_count"]),
                        "reasons": _decode_json(row["reasons_json"], field="junk result reasons"),
                        "explanation": row["explanation_text"],
                        "better_alternative_entity_id": row["better_alternative_entity_id"],
                        "better_alternative": alternatives.get(
                            str(row["better_alternative_entity_id"] or "")
                        ),
                    }
                )
        next_cursor = None
        if has_more and rows:
            next_cursor = LibraryCursor(
                "junk_results",
                query_hash,
                (int(rows[-1]["ordinal"]), rows[-1]["entity_id"]),
            ).encode()
        return generation, {"profile": profile_value, "items": items}, next_cursor, None

    def junk_detail(self, profile_id: str, entity_id: str) -> tuple[int, dict[str, Any]]:
        with self.connection() as conn:
            profile = conn.execute(
                "SELECT * FROM junk_profiles WHERE profile_id=? AND is_current=1 AND status='ready'",
                (profile_id,),
            ).fetchone()
            if profile is None:
                raise ApiProblem(425, "junk_profile_not_ready", "The selected junk profile is not ready")
            result = conn.execute(
                "SELECT * FROM junk_effective_results WHERE profile_id=? AND entity_id=?",
                (profile_id, entity_id),
            ).fetchone()
            if result is None:
                raise ApiProblem(404, "junk_result_not_found", "The junk result was not found")
            signals = conn.execute(
                """SELECT reason,confidence,threshold,method_version,status,evidence_json,
                          better_alternative_entity_id,error_text
                     FROM junk_signals WHERE catalog_generation=? AND entity_id=?
                       AND method_version=? AND is_current=1
                     ORDER BY confidence DESC,reason""",
                (profile["catalog_generation"], entity_id, profile["signal_analyzer_version"]),
            ).fetchall()
            feedback = conn.execute(
                """SELECT feedback_id,feedback_kind,signal_snapshot_json,comment_text,calibration_job_id,
                          applied_profile_id,created_at FROM junk_feedback
                     WHERE profile_id=? AND entity_id=? ORDER BY feedback_id DESC LIMIT 100""",
                (profile_id, entity_id),
            ).fetchall()
            return self.generation(conn), {
                "profile": self._junk_profile_value(profile),
                "result": {
                    **dict(result),
                    "effective_hidden": bool(result["effective_hidden"]),
                    "favourite_protected": bool(result["favourite_protected"]),
                    "reasons": _decode_json(result["reasons_json"], field="junk result reasons"),
                },
                "signals": [
                    {
                        **dict(row),
                        "evidence": _decode_json(row["evidence_json"], field="junk signal evidence"),
                    }
                    for row in signals
                ],
                "feedback": [
                    {
                        **dict(row),
                        "signal_snapshot": _decode_json(
                            row["signal_snapshot_json"], field="junk feedback snapshot"
                        ),
                    }
                    for row in feedback
                ],
            }

    def record_junk_feedback(
        self,
        request: Request,
        profile_id: str,
        mutation: JunkFeedbackMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = f"POST:/api/v1/junk/{profile_id}/feedback"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            profile = conn.execute(
                "SELECT * FROM junk_profiles WHERE profile_id=? AND is_current=1 AND status='ready'",
                (profile_id,),
            ).fetchone()
            if profile is None:
                raise ApiProblem(425, "junk_profile_not_ready", "The selected junk profile is not ready")
            result_row = conn.execute(
                "SELECT reasons_json FROM junk_effective_results WHERE profile_id=? AND entity_id=?",
                (profile_id, mutation.entity_id),
            ).fetchone()
            if result_row is None:
                raise ApiProblem(404, "junk_result_not_found", "The junk result was not found")
            signal_rows = conn.execute(
                """SELECT reason,confidence,threshold,method_version,input_identity,status,
                          evidence_json,better_alternative_entity_id,error_text
                     FROM junk_signals WHERE catalog_generation=? AND entity_id=?
                       AND method_version=? AND is_current=1 ORDER BY reason""",
                (
                    profile["catalog_generation"],
                    mutation.entity_id,
                    profile["signal_analyzer_version"],
                ),
            ).fetchall()
            signal_snapshot = {
                "effective_result_reasons": _decode_json(
                    result_row["reasons_json"], field="junk result reasons"
                ),
                "signals": [
                    {
                        **dict(row),
                        "evidence": _decode_json(row["evidence_json"], field="junk signal evidence"),
                    }
                    for row in signal_rows
                ],
            }
            now = utc_now()
            cursor = conn.execute(
                """INSERT INTO junk_feedback(
                       profile_id,entity_id,feedback_kind,signal_snapshot_json,comment_text,idempotency_key,created_at
                   ) VALUES(?,?,?,?,?,?,?)""",
                (
                    profile_id,
                    mutation.entity_id,
                    mutation.feedback_kind,
                    json_text(signal_snapshot),
                    mutation.comment,
                    idempotency_key,
                    now,
                ),
            )
            conn.execute(
                "UPDATE junk_profiles SET feedback_count=feedback_count+1,updated_at=? WHERE profile_id=?",
                (now, profile_id),
            )
            calibration_job_id = enqueue_calibration_if_ready(_ConnectionManifestDB(conn), profile_id)
            generation = self._advance_generation(conn)
            result = _envelope(
                request,
                generation=generation,
                data={
                    "feedback_id": int(cursor.lastrowid),
                    "profile_id": profile_id,
                    "entity_id": mutation.entity_id,
                    "feedback_kind": mutation.feedback_kind,
                    "calibration_job_id": calibration_job_id,
                    "media_mutation": "none",
                },
                job=(
                    None
                    if calibration_job_id is None
                    else {"id": calibration_job_id, "status": "queued", "phase": "junk_profile_calibrate"}
                ),
            )
            self._record_replay(conn, scope, idempotency_key, digest, 201, result)
            conn.commit()
            return 201, result

    @staticmethod
    def _reject_selection(
        conn: sqlite3.Connection,
        *,
        entity_ids: list[str],
        expected_revisions: dict[str, int] | None,
        action: str,
        action_id: str,
        confirm_favourites: bool,
        confirm_large_selection: bool,
    ) -> list[dict[str, Any]]:
        if len(entity_ids) > 100 and not confirm_large_selection:
            raise ApiProblem(
                409,
                "large_selection_confirmation_required",
                "Rejecting more than 100 entities requires explicit large-selection confirmation",
                details={"count": len(entity_ids)},
            )
        rows = conn.execute(
            """SELECT s.* FROM photo_user_state s JOIN photo_entities e USING(entity_id)
                 WHERE e.is_current=1 AND s.entity_id IN ("""
            + ",".join("?" for _ in entity_ids)
            + ") ORDER BY s.entity_id",
            entity_ids,
        ).fetchall()
        if len(rows) != len(entity_ids):
            raise ApiProblem(404, "library_entity_not_found", "One or more selected library entities were not found")
        favourites = [str(row["entity_id"]) for row in rows if row["favourite"]]
        if favourites and not confirm_favourites:
            raise ApiProblem(
                409,
                "favourite_confirmation_required",
                "Rejecting favourites requires explicit confirmation; favourite metadata will be preserved",
                details={"entity_ids": favourites, "count": len(favourites)},
            )
        now = utc_now()
        changed: list[dict[str, Any]] = []
        for row in rows:
            entity_id = str(row["entity_id"])
            if expected_revisions is not None and expected_revisions[entity_id] != int(row["revision"]):
                raise ApiProblem(
                    409,
                    "stale_revision",
                    "Library state changed; reload before applying this bulk rejection",
                    details={"entity_id": entity_id, "current": int(row["revision"])},
                )
            before = {
                "favourite": bool(row["favourite"]),
                "rejected": bool(row["rejected"]),
                "rating": int(row["rating"]),
                "revision": int(row["revision"]),
            }
            after = {**before, "rejected": True, "revision": int(row["revision"]) + 1}
            conn.execute(
                """UPDATE photo_user_state SET rejected=1,revision=?,updated_at=? WHERE entity_id=?""",
                (after["revision"], now, entity_id),
            )
            event = conn.execute(
                """INSERT INTO photo_user_state_events(
                       entity_id,action,before_json,after_json,idempotency_key,created_at
                   ) VALUES(?,?,?,?,?,?)""",
                (entity_id, action, json_text(before), json_text(after), action_id, now),
            )
            changed.append({"entity_id": entity_id, **after, "event_id": int(event.lastrowid)})
        return changed

    def bulk_reject(
        self,
        request: Request,
        mutation: BulkRejectMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = "POST:/api/v1/library/bulk-reject"
        digest = _request_digest(mutation)
        entity_ids = [item.entity_id for item in mutation.entities]
        if len(set(entity_ids)) != len(entity_ids):
            raise ApiProblem(400, "duplicate_library_entity", "Each selected entity may appear only once")
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            action_id = stable_id("bra1", "bulk_reject", idempotency_key)
            changed = self._reject_selection(
                conn,
                entity_ids=entity_ids,
                expected_revisions={item.entity_id: item.expected_revision for item in mutation.entities},
                action="bulk_reject",
                action_id=action_id,
                confirm_favourites=mutation.confirm_favourites,
                confirm_large_selection=mutation.confirm_large_selection,
            )
            generation = self._advance_generation(conn)
            result = _envelope(
                request,
                generation=generation,
                data={
                    "action_id": action_id,
                    "states": changed,
                    "favourites_preserved": True,
                    "undoable": True,
                    "media_mutation": "none",
                },
            )
            self._record_replay(conn, scope, idempotency_key, digest, 200, result)
            conn.commit()
            return 200, result

    def reject_stack_rest(
        self,
        request: Request,
        profile_id: str,
        stack_id: str,
        mutation: StackRejectRestMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = f"POST:/api/v1/stacks/{profile_id}/{stack_id}/reject-rest"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            stack = conn.execute(
                """SELECT s.* FROM stacks s JOIN stack_profiles p USING(profile_id)
                     WHERE s.profile_id=? AND s.stack_id=? AND p.is_current=1 AND p.status='ready'""",
                (profile_id, stack_id),
            ).fetchone()
            if stack is None:
                raise ApiProblem(404, "stack_not_found", "The ready Stack was not found")
            if int(stack["revision"]) != mutation.stack_revision:
                raise ApiProblem(
                    409,
                    "stale_revision",
                    "The Stack changed; reload before rejecting its remaining members",
                    details={"current": int(stack["revision"])},
                )
            rows = conn.execute(
                """SELECT entity_id FROM stack_members WHERE profile_id=? AND stack_id=?
                     AND entity_id<>? ORDER BY ordinal,entity_id LIMIT 501""",
                (profile_id, stack_id, stack["cover_entity_id"]),
            ).fetchall()
            if len(rows) > 499:
                raise ApiProblem(
                    409,
                    "stack_too_large",
                    "This Stack exceeds the 499-member bounded reject-rest limit",
                )
            entity_ids = [str(row["entity_id"]) for row in rows]
            if not entity_ids:
                raise ApiProblem(409, "stack_has_no_remaining_members", "The Stack has no other members to reject")
            action_id = stable_id("bra1", "reject_stack_rest", profile_id, stack_id, idempotency_key)
            changed = self._reject_selection(
                conn,
                entity_ids=entity_ids,
                expected_revisions=None,
                action="reject_stack_rest",
                action_id=action_id,
                confirm_favourites=mutation.confirm_favourites,
                confirm_large_selection=mutation.confirm_large_selection,
            )
            generation = self._advance_generation(conn)
            result = _envelope(
                request,
                generation=generation,
                data={
                    "action_id": action_id,
                    "profile_id": profile_id,
                    "stack_id": stack_id,
                    "preserved_cover_entity_id": stack["cover_entity_id"],
                    "states": changed,
                    "favourites_preserved": True,
                    "undoable": True,
                    "media_mutation": "none",
                },
            )
            self._record_replay(conn, scope, idempotency_key, digest, 200, result)
            conn.commit()
            return 200, result

    def undo_bulk_reject(
        self,
        request: Request,
        mutation: BulkUndoMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = "POST:/api/v1/library/bulk-reject/undo"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            events = conn.execute(
                """SELECT * FROM photo_user_state_events WHERE idempotency_key=?
                     AND action IN ('bulk_reject','reject_stack_rest') ORDER BY event_id""",
                (mutation.action_id,),
            ).fetchall()
            if not events:
                raise ApiProblem(404, "bulk_action_not_found", "The bulk rejection action was not found")
            event_ids = [int(row["event_id"]) for row in events]
            undone = conn.execute(
                "SELECT 1 FROM photo_user_state_events WHERE undo_of_event_id IN ("
                + ",".join("?" for _ in event_ids)
                + ") LIMIT 1",
                event_ids,
            ).fetchone()
            if undone is not None:
                raise ApiProblem(409, "bulk_action_already_undone", "This bulk rejection was already undone")
            now = utc_now()
            restored: list[dict[str, Any]] = []
            for event in events:
                before = _decode_json(event["before_json"], field="bulk state before")
                after = _decode_json(event["after_json"], field="bulk state after")
                state = conn.execute(
                    "SELECT * FROM photo_user_state WHERE entity_id=?",
                    (event["entity_id"],),
                ).fetchone()
                if state is None or int(state["revision"]) != int(after["revision"]):
                    raise ApiProblem(
                        409,
                        "stale_revision",
                        "A rejected entity changed after the bulk action; reload before undoing",
                        details={"entity_id": event["entity_id"]},
                    )
                revision = int(state["revision"]) + 1
                restored_state = {
                    "favourite": bool(before["favourite"]),
                    "rejected": bool(before["rejected"]),
                    "rating": int(before["rating"]),
                    "revision": revision,
                }
                conn.execute(
                    """UPDATE photo_user_state SET favourite=?,rejected=?,rating=?,revision=?,updated_at=?
                         WHERE entity_id=?""",
                    (
                        int(restored_state["favourite"]),
                        int(restored_state["rejected"]),
                        restored_state["rating"],
                        revision,
                        now,
                        event["entity_id"],
                    ),
                )
                conn.execute(
                    """INSERT INTO photo_user_state_events(
                           entity_id,action,before_json,after_json,idempotency_key,undo_of_event_id,created_at
                       ) VALUES(?,'undo_bulk_reject',?,?,?,?,?)""",
                    (
                        event["entity_id"],
                        json_text(after),
                        json_text(restored_state),
                        idempotency_key,
                        event["event_id"],
                        now,
                    ),
                )
                restored.append({"entity_id": event["entity_id"], **restored_state})
            generation = self._advance_generation(conn)
            result = _envelope(
                request,
                generation=generation,
                data={
                    "action_id": mutation.action_id,
                    "states": restored,
                    "undone": True,
                    "media_mutation": "none",
                },
            )
            self._record_replay(conn, scope, idempotency_key, digest, 200, result)
            conn.commit()
            return 200, result

    def organization_status(self) -> tuple[int, dict[str, Any]]:
        with self.connection() as conn:
            db = _ConnectionManifestDB(conn)
            catalog = current_catalog(db)
            if catalog is None:
                raise ApiProblem(
                    425,
                    "library_preparing",
                    "The logical-photo catalog must be prepared before alternate organization views",
                )
            view = current_organization_rollup(
                db,
                catalog_generation=int(catalog["source_generation"]),
            )
            if view is None:
                conn.execute("BEGIN IMMEDIATE")
                view = ensure_organization_job(db, self.config)
                conn.commit()
            generation = self.generation(conn)
            progress_row = conn.execute(
                "SELECT progress_json FROM background_jobs WHERE job_id=?",
                (view["job_id"],),
            ).fetchone()
        progress = (
            _decode_json(progress_row["progress_json"], field="organization progress")
            if progress_row is not None and progress_row["progress_json"]
            else {}
        )
        return generation, {**self._library_view_value(view), "progress": progress}

    def prepare_organization(
        self,
        request: Request,
        mutation: OrganizationPrepareMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = "POST:/api/v1/organize/prepare"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            if current_catalog(_ConnectionManifestDB(conn)) is None:
                raise ApiProblem(409, "library_not_ready", "Prepare the logical-photo catalog first")
            view = ensure_organization_job(
                _ConnectionManifestDB(conn),
                self.config,
                force=mutation.refresh,
            )
            generation = self._advance_generation(conn)
            result = _envelope(
                request,
                generation=generation,
                data=self._library_view_value(view),
                job={"id": view["job_id"], "status": view["status"], "phase": view["view_kind"]},
            )
            self._record_replay(conn, scope, idempotency_key, digest, 202, result)
            conn.commit()
            return 202, result

    @staticmethod
    def _organization_cursor(
        cursor: LibraryCursor | None,
        *,
        kind: str,
        query_hash: str,
        size: int,
    ) -> tuple[Any, ...] | None:
        if cursor is None:
            return None
        if cursor.kind != kind or cursor.query_sha256 != query_hash or len(cursor.values) != size:
            raise ApiProblem(400, "bad_cursor", "The organization cursor is invalid for this result set")
        return cursor.values

    @staticmethod
    def _page_cursor(
        rows: list[sqlite3.Row],
        *,
        limit: int,
        kind: str,
        query_hash: str,
        values: Callable[[sqlite3.Row], tuple[Any, ...]],
    ) -> tuple[list[sqlite3.Row], str | None]:
        has_more = len(rows) > limit
        page = rows[:limit]
        next_cursor = None
        if has_more and page:
            next_cursor = LibraryCursor(kind, query_hash, values(page[-1])).encode()
        return page, next_cursor

    def _require_organization_view(self, conn: sqlite3.Connection) -> dict[str, Any]:
        catalog = current_catalog(_ConnectionManifestDB(conn))
        if catalog is None:
            raise ApiProblem(425, "library_preparing", "The logical-photo catalog is not ready")
        view = current_organization_rollup(
            _ConnectionManifestDB(conn),
            catalog_generation=int(catalog["source_generation"]),
        )
        if view is None:
            raise ApiProblem(425, "organization_preparing", "Persisted organization rollups are not ready")
        return view

    def organization_calendar(
        self,
        *,
        limit: int,
        cursor: LibraryCursor | None,
        year: int | None,
        month: int | None,
    ) -> tuple[int, list[dict[str, Any]], str | None]:
        if month is not None and year is None:
            raise ApiProblem(400, "invalid_calendar_filter", "A calendar month requires a year")
        query = {"kind": "calendar", "year": year, "month": month}
        query_hash = organization_query_sha256(query)
        cursor_values = self._organization_cursor(
            cursor,
            kind="organization_calendar",
            query_hash=query_hash,
            size=2,
        )
        with self.connection() as conn:
            view = self._require_organization_view(conn)
            clauses = ["catalog_generation=?"]
            parameters: list[Any] = [int(view["source_generation"])]
            if year is not None:
                clauses.append("(year=? OR bucket_kind IN ('unknown','ambiguous'))")
                parameters.append(year)
            if month is not None:
                clauses.append("(month=? OR bucket_kind IN ('unknown','ambiguous'))")
                parameters.append(month)
            if cursor_values is not None:
                clauses.append("(sort_order,bucket_key)>(?,?)")
                parameters.extend(cursor_values)
            parameters.append(limit + 1)
            rows = conn.execute(
                """SELECT bucket_key,bucket_kind,capture_date,year,month,day,display_value,
                          entity_count,sort_order FROM calendar_buckets WHERE """
                + " AND ".join(clauses)
                + " ORDER BY sort_order,bucket_key LIMIT ?",
                parameters,
            ).fetchall()
            generation = self.generation(conn)
        page, next_cursor = self._page_cursor(
            rows,
            limit=limit,
            kind="organization_calendar",
            query_hash=query_hash,
            values=lambda row: (int(row["sort_order"]), row["bucket_key"]),
        )
        return generation, [
            {
                "key": row["bucket_key"],
                "kind": row["bucket_kind"],
                "date": row["capture_date"],
                "year": row["year"],
                "month": row["month"],
                "day": row["day"],
                "label": row["display_value"],
                "count": int(row["entity_count"]),
                "library_filter": {"kind": "calendar", "key": row["bucket_key"]},
            }
            for row in page
        ], next_cursor

    def organization_folders(
        self,
        *,
        limit: int,
        cursor: LibraryCursor | None,
        parent_id: str | None,
    ) -> tuple[int, list[dict[str, Any]], str | None]:
        query = {"kind": "folders", "parent_id": parent_id}
        query_hash = organization_query_sha256(query)
        cursor_values = self._organization_cursor(
            cursor,
            kind="organization_folders",
            query_hash=query_hash,
            size=2,
        )
        with self.connection() as conn:
            view = self._require_organization_view(conn)
            clauses = ["catalog_generation=?", "parent_node_id IS ?"]
            parameters: list[Any] = [int(view["source_generation"]), parent_id]
            if cursor_values is not None:
                clauses.append("(display_value,node_id)>(?,?)")
                parameters.extend(cursor_values)
            parameters.append(limit + 1)
            rows = conn.execute(
                """SELECT node_id,source_root_id,parent_node_id,relative_path_text,display_value,depth,
                          direct_entity_count,logical_entity_count,direct_source_occurrence_count,
                          source_occurrence_count
                     FROM folder_hierarchy_nodes WHERE """
                + " AND ".join(clauses)
                + " ORDER BY display_value COLLATE BINARY,node_id LIMIT ?",
                parameters,
            ).fetchall()
            generation = self.generation(conn)
        page, next_cursor = self._page_cursor(
            rows,
            limit=limit,
            kind="organization_folders",
            query_hash=query_hash,
            values=lambda row: (row["display_value"], row["node_id"]),
        )
        return generation, [
            {
                "id": row["node_id"],
                "source_root_id": row["source_root_id"],
                "parent_id": row["parent_node_id"],
                "relative_path": row["relative_path_text"],
                "label": row["display_value"],
                "depth": int(row["depth"]),
                "counts": {
                    "direct_logical": int(row["direct_entity_count"]),
                    "logical": int(row["logical_entity_count"]),
                    "direct_occurrences": int(row["direct_source_occurrence_count"]),
                    "occurrences": int(row["source_occurrence_count"]),
                },
                "library_filter": {"kind": "folder", "key": row["node_id"]},
            }
            for row in page
        ], next_cursor

    def organization_equipment(
        self,
        equipment_kind: str,
        *,
        limit: int,
        cursor: LibraryCursor | None,
    ) -> tuple[int, list[dict[str, Any]], str | None]:
        if equipment_kind not in {"camera", "lens"}:
            raise ApiProblem(400, "invalid_equipment_kind", "Equipment kind must be camera or lens")
        query_hash = organization_query_sha256({"kind": "equipment", "equipment_kind": equipment_kind})
        cursor_values = self._organization_cursor(
            cursor,
            kind="organization_equipment",
            query_hash=query_hash,
            size=2,
        )
        with self.connection() as conn:
            view = self._require_organization_view(conn)
            clauses = ["catalog_generation=?", "equipment_kind=?"]
            parameters: list[Any] = [int(view["source_generation"]), equipment_kind]
            if cursor_values is not None:
                clauses.append("(entity_count<? OR (entity_count=? AND value_key>?))")
                parameters.extend((cursor_values[0], cursor_values[0], cursor_values[1]))
            parameters.append(limit + 1)
            rows = conn.execute(
                """SELECT value_key,display_value,raw_values_json,entity_count
                     FROM equipment_rollups WHERE """
                + " AND ".join(clauses)
                + " ORDER BY entity_count DESC,value_key LIMIT ?",
                parameters,
            ).fetchall()
            generation = self.generation(conn)
        page, next_cursor = self._page_cursor(
            rows,
            limit=limit,
            kind="organization_equipment",
            query_hash=query_hash,
            values=lambda row: (int(row["entity_count"]), row["value_key"]),
        )
        return generation, [
            {
                "key": row["value_key"],
                "label": row["display_value"],
                "raw_values": _decode_json(row["raw_values_json"], field="equipment raw values"),
                "count": int(row["entity_count"]),
                "library_filter": {"kind": equipment_kind, "key": row["value_key"]},
            }
            for row in page
        ], next_cursor

    def organization_map(
        self,
        *,
        zoom: int,
        south: float,
        north: float,
        west: float,
        east: float,
        limit: int,
        cursor: LibraryCursor | None,
    ) -> tuple[int, dict[str, Any], str | None]:
        if south > north:
            raise ApiProblem(400, "invalid_map_bounds", "Map south must not exceed north")
        query = {"kind": "map", "zoom": zoom, "south": south, "north": north, "west": west, "east": east}
        query_hash = organization_query_sha256(query)
        cursor_values = self._organization_cursor(
            cursor,
            kind="organization_map",
            query_hash=query_hash,
            size=3,
        )
        with self.connection() as conn:
            view = self._require_organization_view(conn)
            clauses = ["catalog_generation=?", "zoom_level=?", "center_latitude BETWEEN ? AND ?"]
            parameters: list[Any] = [int(view["source_generation"]), zoom, south, north]
            if west <= east:
                clauses.append("center_longitude BETWEEN ? AND ?")
            else:
                clauses.append("(center_longitude>=? OR center_longitude<=?)")
            parameters.extend((west, east))
            if cursor_values is not None:
                clauses.append("(center_latitude,center_longitude,cluster_id)>(?,?,?)")
                parameters.extend(cursor_values)
            parameters.append(limit + 1)
            rows = conn.execute(
                """SELECT cluster_id,zoom_level,geohash_prefix,center_latitude,center_longitude,
                          min_latitude,max_latitude,min_longitude,max_longitude,entity_count
                     FROM map_clusters WHERE """
                + " AND ".join(clauses)
                + " ORDER BY center_latitude,center_longitude,cluster_id LIMIT ?",
                parameters,
            ).fetchall()
            job = conn.execute(
                "SELECT progress_json FROM background_jobs WHERE job_id=?",
                (view["job_id"],),
            ).fetchone()
            generation = self.generation(conn)
        page, next_cursor = self._page_cursor(
            rows,
            limit=limit,
            kind="organization_map",
            query_hash=query_hash,
            values=lambda row: (row["center_latitude"], row["center_longitude"], row["cluster_id"]),
        )
        progress = _decode_json(job["progress_json"], field="organization progress") if job else {}
        return generation, {
            "clusters": [
                {
                    "id": row["cluster_id"],
                    "zoom": int(row["zoom_level"]),
                    "geohash": row["geohash_prefix"],
                    "center": {"latitude": row["center_latitude"], "longitude": row["center_longitude"]},
                    "bounds": {
                        "south": row["min_latitude"],
                        "north": row["max_latitude"],
                        "west": row["min_longitude"],
                        "east": row["max_longitude"],
                    },
                    "count": int(row["entity_count"]),
                    "library_filter": {"kind": "map", "key": row["cluster_id"]},
                }
                for row in page
            ],
            "unknown_location_count": int(progress.get("unknown_location_count", 0)),
            "unknown_location_filter": {"kind": "map", "key": "unknown"},
            "viewport": {"zoom": zoom, "south": south, "north": north, "west": west, "east": east},
        }, next_cursor

    def update_library_state(
        self,
        request: Request,
        mutation: LibraryStateMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = "PUT:/api/v1/library/state"
        digest = _request_digest(mutation)
        entity_ids = [item.entity_id for item in mutation.states]
        if len(set(entity_ids)) != len(entity_ids):
            raise ApiProblem(400, "duplicate_library_entity", "Each library entity may appear only once")
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            now = utc_now()
            changed: list[dict[str, Any]] = []
            for item in mutation.states:
                row = conn.execute(
                    """SELECT s.* FROM photo_user_state s JOIN photo_entities e USING(entity_id)
                         WHERE s.entity_id=? AND e.is_current=1""",
                    (item.entity_id,),
                ).fetchone()
                if row is None:
                    raise ApiProblem(404, "library_entity_not_found", "A selected library entity was not found")
                if int(row["revision"]) != item.expected_revision:
                    raise ApiProblem(
                        409,
                        "stale_revision",
                        "Library state changed; reload before applying this update",
                        details={"entity_id": item.entity_id, "current": int(row["revision"])},
                    )
                before = {
                    "favourite": bool(row["favourite"]),
                    "rejected": bool(row["rejected"]),
                    "rating": int(row["rating"]),
                    "revision": int(row["revision"]),
                }
                after = {
                    "favourite": item.favourite,
                    "rejected": item.rejected,
                    "rating": item.rating,
                    "revision": int(row["revision"]) + 1,
                }
                conn.execute(
                    """UPDATE photo_user_state SET favourite=?,rejected=?,rating=?,revision=?,updated_at=?
                         WHERE entity_id=?""",
                    (
                        int(item.favourite),
                        int(item.rejected),
                        item.rating,
                        after["revision"],
                        now,
                        item.entity_id,
                    ),
                )
                conn.execute(
                    """INSERT INTO photo_user_state_events(
                           entity_id,action,before_json,after_json,idempotency_key,created_at
                       ) VALUES(?,'set_state',?,?,?,?)""",
                    (item.entity_id, json_text(before), json_text(after), idempotency_key, now),
                )
                if before["favourite"] != after["favourite"]:
                    self._refresh_junk_favourite_state(
                        conn,
                        entity_id=item.entity_id,
                        favourite=bool(after["favourite"]),
                    )
                changed.append({"entity_id": item.entity_id, **after})
            generation = self._advance_generation(conn)
            result = _envelope(request, generation=generation, data={"states": changed, "media_mutation": "none"})
            self._record_replay(conn, scope, idempotency_key, digest, 200, result)
            conn.commit()
            return 200, result

    @staticmethod
    def _refresh_junk_favourite_state(
        conn: sqlite3.Connection,
        *,
        entity_id: str,
        favourite: bool,
    ) -> None:
        rows = conn.execute(
            """SELECT r.profile_id,r.effective_hidden,r.favourite_protected,r.agreement_count,
                      r.explanation_text,p.settings_json
                 FROM junk_effective_results r JOIN junk_profiles p USING(profile_id)
                 WHERE r.entity_id=? AND p.is_current=1 AND p.status='ready'""",
            (entity_id,),
        ).fetchall()
        prefix = "Not hidden because this favourite is protected. "
        for row in rows:
            settings = _decode_json(row["settings_json"], field="junk profile settings")
            qualifies = int(row["agreement_count"]) >= int(settings["minimum_agreement"])
            protected = favourite and bool(settings["protect_favourites"]) and qualifies
            hidden = qualifies and not protected
            explanation = str(row["explanation_text"])
            base_explanation = explanation.removeprefix(prefix)
            explanation = prefix + base_explanation if protected else base_explanation
            conn.execute(
                """UPDATE junk_effective_results SET effective_hidden=?,favourite_protected=?,
                       explanation_text=? WHERE profile_id=? AND entity_id=?""",
                (int(hidden), int(protected), explanation, row["profile_id"], entity_id),
            )
            conn.execute(
                """UPDATE junk_profiles SET effectively_hidden_count=effectively_hidden_count+?,
                       favourite_protected_count=favourite_protected_count+?,updated_at=?
                     WHERE profile_id=?""",
                (
                    int(hidden) - int(row["effective_hidden"]),
                    int(protected) - int(row["favourite_protected"]),
                    utc_now(),
                    row["profile_id"],
                ),
            )

    def open_library_folder(
        self,
        request: Request,
        entity_id: str,
        mutation: LibraryOpenMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = f"POST:/api/v1/library/entities/{entity_id}/open-folder"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            generation = self._require_generation(conn, mutation.generation)
            row = conn.execute(
                """SELECT sf.path_text FROM photo_entities e JOIN photo_entity_members m USING(entity_id)
                     JOIN source_files sf ON sf.asset_id=m.asset_id
                     WHERE e.entity_id=? AND e.is_current=1 AND sf.present=1
                     ORDER BY m.is_display DESC,sf.path_text COLLATE BINARY LIMIT 1""",
                (entity_id,),
            ).fetchone()
            if row is None:
                row = conn.execute(
                    """SELECT d.path_text FROM photo_entities e JOIN photo_entity_members m USING(entity_id)
                         JOIN destinations d ON d.asset_id=m.asset_id
                         WHERE e.entity_id=? AND e.is_current=1 AND d.status IN ('ready','verified')
                         ORDER BY m.is_display DESC,d.path_text COLLATE BINARY LIMIT 1""",
                    (entity_id,),
                ).fetchone()
            if row is None:
                exists = conn.execute(
                    "SELECT 1 FROM photo_entities WHERE entity_id=? AND is_current=1",
                    (entity_id,),
                ).fetchone()
                if exists is None:
                    raise ApiProblem(404, "library_entity_not_found", "The library entity was not found")
                raise ApiProblem(409, "present_path_unavailable", "No stored present path is available")
            path = Path(str(row["path_text"]))
            try:
                self.folder_opener(path)
            except OSError as exc:
                raise ApiProblem(
                    503,
                    "folder_open_failed",
                    f"Windows Explorer could not open the stored path: {exc}",
                ) from exc
            result = _envelope(
                request,
                generation=generation,
                data={"entity_id": entity_id, "opened": True, "path_source": "stored_present_path"},
            )
            self._record_replay(conn, scope, idempotency_key, digest, 200, result)
            conn.commit()
        return 200, result

    def library_query_plan(
        self,
        query: dict[str, Any],
        *,
        cursor: LibraryCursor | None = None,
    ) -> tuple[str, ...]:
        if not is_common_library_query(query):
            raise ValueError("Query-plan inspection applies only to common immediate library views")
        with self.connection() as conn:
            catalog = current_catalog(_ConnectionManifestDB(conn))
            if catalog is None:
                raise ValueError("Library catalog is not ready")
            sql, parameters = self._library_common_sql(
                query,
                int(catalog["source_generation"]),
                cursor,
                50,
            )
            return tuple(str(row[3]) for row in conn.execute("EXPLAIN QUERY PLAN " + sql, parameters))

    @staticmethod
    def _batch_value(row: sqlite3.Row) -> dict[str, Any]:
        latest_metrics = _decode_json(row["latest_metrics_json"], field="import metrics")
        return {
            "id": row["batch_id"],
            "name": row["batch_name"],
            "status": row["status"],
            "revision": int(row["revision"]),
            "discovery_generation": int(row["discovery_generation"]),
            "traversal_complete": bool(row["traversal_complete"]),
            "counts": {
                "discovered": int(row["discovered_item_count"]),
                "files": int(row["file_count"]),
                "folders": int(row["folder_count"]),
                "other": int(row["other_count"]),
                "included": int(row["included_count"]),
                "excluded": int(row["excluded_count"]),
                "not_applicable": int(row["not_applicable_count"]),
                "exact_matches": int(row["exact_match_count"]),
                "errors": int(row["error_count"]),
                "processed": int(row["processed_count"]),
                "copied": int(row["copied_count"]),
                "skipped": int(row["skipped_count"]),
                "failed": int(row["failed_count"]),
                "duplicates": int(row["duplicate_count"]),
            },
            "bytes": {
                "total": int(row["total_bytes"]),
                "transferred": int(row["transferred_bytes"]),
                "verified": int(row["verified_bytes"]),
            },
            "classifications": _decode_json(row["classification_counts_json"], field="classification counts"),
            "match_outcomes": _decode_json(row["match_outcome_counts_json"], field="match counts"),
            "latest_metrics": latest_metrics,
            "current_job_id": row["current_job_id"],
            "active_approval_id": row["active_approval_id"],
            "last_error": row["last_error_text"],
            "timestamps": {
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
                "review_ready_at": row["review_ready_at"],
                "approved_at": row["approved_at"],
                "execute_authorized_at": row["execute_authorized_at"],
                "copy_started_at": row["copy_started_at"],
                "copy_completed_at": row["copy_completed_at"],
            },
        }

    def imports(
        self,
        *,
        limit: int,
        cursor: ImportCursor | None,
        statuses: tuple[str, ...],
    ) -> tuple[int, list[dict[str, Any]], str | None]:
        allowed = {
            "discovering", "hashing", "matching", "preparing_previews", "awaiting_review",
            "copying", "verifying", "indexing", "thumbnailing", "complete", "paused",
            "cancelled", "failed", "interrupted",
        }
        if set(statuses) - allowed:
            raise ApiProblem(400, "invalid_import_filter", "One or more import status filters are unsupported")
        clauses: list[str] = []
        parameters: list[Any] = []
        if statuses:
            clauses.append(f"status IN ({','.join('?' for _value in statuses)})")
            parameters.extend(statuses)
        if cursor is not None:
            if len(cursor.values) != 2:
                raise ApiProblem(400, "bad_cursor", "The import history cursor is incomplete")
            clauses.append("(updated_at<? OR (updated_at=? AND batch_id<?))")
            parameters.extend((cursor.values[0], cursor.values[0], cursor.values[1]))
        where = " WHERE " + " AND ".join(clauses) if clauses else ""
        parameters.append(limit + 1)
        with self.connection() as conn:
            rows = conn.execute(
                "SELECT * FROM import_batches" + where + " ORDER BY updated_at DESC,batch_id DESC LIMIT ?",
                parameters,
            ).fetchall()
            generation = self.generation(conn)
        has_more = len(rows) > limit
        rows = rows[:limit]
        next_cursor = None
        if has_more and rows:
            next_cursor = ImportCursor("import_history", (rows[-1]["updated_at"], rows[-1]["batch_id"])).encode()
        return generation, [self._batch_value(row) for row in rows], next_cursor

    def import_detail(self, batch_id: str) -> tuple[int, dict[str, Any], list[dict[str, str]]]:
        with self.connection() as conn:
            row = conn.execute("SELECT * FROM import_batches WHERE batch_id=?", (batch_id,)).fetchone()
            if row is None:
                raise ApiProblem(404, "import_not_found", "Import batch was not found")
            approval = conn.execute(
                """SELECT approval_id,status,summary_json,approved_at,execute_authorized_at
                     FROM import_batch_approvals WHERE batch_id=? ORDER BY approved_at DESC,approval_id DESC LIMIT 1""",
                (batch_id,),
            ).fetchone()
            preflight = conn.execute(
                """SELECT job_id,status,progress_json,error_text FROM background_jobs
                     WHERE job_kind='import_approval_preflight' AND subject_type='import_batch'
                       AND subject_id=? ORDER BY created_at DESC,job_id DESC LIMIT 1""",
                (batch_id,),
            ).fetchone()
            job = None
            if row["current_job_id"]:
                job_row = conn.execute(
                    "SELECT job_id,status,phase,control_state FROM background_jobs WHERE job_id=?",
                    (row["current_job_id"],),
                ).fetchone()
                if job_row is not None:
                    job = dict(job_row)
            value = self._batch_value(row)
            value["approval"] = None if approval is None else {
                "id": approval["approval_id"],
                "status": approval["status"],
                "summary": _decode_json(approval["summary_json"], field="approval summary"),
                "approved_at": approval["approved_at"],
                "execute_authorized_at": approval["execute_authorized_at"],
            }
            value["preflight_job"] = None
            if preflight is not None:
                progress = _decode_json(preflight["progress_json"], field="approval preflight")
                if int(progress.get("batch_revision", -1)) == int(row["revision"]):
                    value["preflight_job"] = {
                        "id": preflight["job_id"],
                        "status": preflight["status"],
                        "progress": progress,
                        "error": {"message": preflight["error_text"]} if preflight["error_text"] else None,
                    }
            value["job"] = job
            unavailable = [
                {"field": str(field), "reason": str(metric["reason"])}
                for field, metric in value["latest_metrics"].items()
                if isinstance(metric, dict) and metric.get("value") is None and metric.get("reason")
            ]
            return self.generation(conn), value, unavailable

    def import_folders(
        self,
        batch_id: str,
        *,
        limit: int,
        cursor: ImportCursor | None,
    ) -> tuple[int, list[dict[str, Any]], str | None]:
        clauses = ["batch_id=?"]
        parameters: list[Any] = [batch_id]
        if cursor is not None:
            if len(cursor.values) != 1:
                raise ApiProblem(400, "bad_cursor", "The folder cursor is incomplete")
            clauses.append("relative_path_text>?")
            parameters.append(cursor.values[0])
        parameters.append(limit + 1)
        with self.connection() as conn:
            if conn.execute("SELECT 1 FROM import_batches WHERE batch_id=?", (batch_id,)).fetchone() is None:
                raise ApiProblem(404, "import_not_found", "Import batch was not found")
            rows = conn.execute(
                "SELECT * FROM import_folder_progress WHERE " + " AND ".join(clauses)
                + " ORDER BY relative_path_text COLLATE BINARY LIMIT ?",
                parameters,
            ).fetchall()
            generation = self.generation(conn)
        has_more = len(rows) > limit
        rows = rows[:limit]
        values: list[dict[str, Any]] = []
        for row in rows:
            value = dict(row)
            value["classification_counts"] = _decode_json(value.pop("classification_counts_json"), field="folder counts")
            value["match_outcome_counts"] = _decode_json(value.pop("match_outcome_counts_json"), field="folder matches")
            value["warnings"] = _decode_json(value.pop("warnings_json"), field="folder warnings")
            value["recently_completed"] = _decode_json(value.pop("recently_completed_json"), field="recent folders")
            values.append(value)
        next_cursor = ImportCursor("import_folders", (rows[-1]["relative_path_text"],)).encode() if has_more and rows else None
        return generation, values, next_cursor

    def _import_stream(
        self,
        table: str,
        id_column: str,
        batch_id: str,
        *,
        limit: int,
        cursor: ImportCursor | None,
        extra_clause: str = "",
        extra_parameters: tuple[Any, ...] = (),
    ) -> tuple[int, list[dict[str, Any]], str | None]:
        if table not in {"import_progress_samples", "import_events", "import_errors"}:
            raise ValueError("Unsupported import stream")
        parameters: list[Any] = [batch_id, *extra_parameters]
        cursor_clause = ""
        if cursor is not None:
            if len(cursor.values) != 1:
                raise ApiProblem(400, "bad_cursor", "The import stream cursor is incomplete")
            cursor_clause = f" AND {id_column}<?"
            parameters.append(cursor.values[0])
        parameters.append(limit + 1)
        with self.connection() as conn:
            if conn.execute("SELECT 1 FROM import_batches WHERE batch_id=?", (batch_id,)).fetchone() is None:
                raise ApiProblem(404, "import_not_found", "Import batch was not found")
            rows = conn.execute(
                f"SELECT * FROM {table} WHERE batch_id=?{extra_clause}{cursor_clause} "
                f"ORDER BY {id_column} DESC LIMIT ?",
                parameters,
            ).fetchall()
            generation = self.generation(conn)
        has_more = len(rows) > limit
        rows = rows[:limit]
        values = [dict(row) for row in rows]
        for value in values:
            for key in tuple(value):
                if key.endswith("_json") and value[key] is not None:
                    value[key[:-5]] = _decode_json(value.pop(key), field=key)
        next_cursor = ImportCursor(table, (rows[-1][id_column],)).encode() if has_more and rows else None
        return generation, values, next_cursor

    @staticmethod
    def _manifest_item(row: sqlite3.Row, batch_id: str) -> dict[str, Any]:
        preview_status = row["preview_status"] or "missing"
        preview: dict[str, Any] = {"status": preview_status, "url": None, "error": row["preview_error"]}
        if (
            preview_status == "ready"
            and row["preview_relative_path"]
            and row["preview_byte_size"] is not None
            and row["preview_mtime_ns"] is not None
        ):
            preview["url"] = f"/api/v1/imports/{batch_id}/items/{row['item_id']}/preview"
        elif preview_status in {"queued", "processing", "building"}:
            preview["status"] = "preparing"
        elif preview_status == "missing":
            preview["status"] = "unavailable"
        return {
            "id": row["item_id"],
            "relative_path": row["relative_path_text"],
            "path": row["path_text"],
            "entry_kind": row["entry_kind"],
            "classification": row["classification"],
            "media_kind": row["media_kind"],
            "size_bytes": row["stat_size_bytes"],
            "extension": row["extension_text"],
            "signature_kind": row["signature_kind"],
            "mime_type": row["mime_type"],
            "detected_format": row["detected_format"],
            "unusual_extension": bool(row["unusual_extension"]),
            "warnings": _decode_json(row["warnings_json"], field="manifest warnings"),
            "error": row["error_text"],
            "hash_status": row["hash_status"],
            "match_outcome": row["match_outcome"],
            "copy_status": row["copy_status"],
            "copy_outcome": row["copy_outcome"],
            "proposed_decision": row["proposed_decision"],
            "effective_decision": row["effective_decision"],
            "decision_revision": int(row["decision_revision"]),
            "associated_sidecar_of_item_id": row["associated_sidecar_of_item_id"],
            "preview": preview,
        }

    @staticmethod
    def _manifest_select(source: str) -> str:
        return f"""SELECT i.*,
                          d.status AS preview_status,d.relative_path_text AS preview_relative_path,
                          d.mime_type AS preview_mime_type,d.byte_size AS preview_byte_size,
                          d.file_mtime_ns AS preview_mtime_ns,d.error_text AS preview_error,
                          {source}
                     FROM import_items i
                     LEFT JOIN derivatives d ON d.derivative_id=(
                         SELECT derivative_id FROM derivatives candidate
                          WHERE candidate.import_item_id=i.item_id AND candidate.is_current=1
                            AND candidate.derivative_kind='review_preview'
                          ORDER BY candidate.updated_at DESC,candidate.derivative_id DESC LIMIT 1
                     )"""

    def import_manifest(
        self,
        batch_id: str,
        *,
        limit: int,
        cursor: ImportCursor | None,
        query: dict[str, Any],
    ) -> tuple[int, list[dict[str, Any]], str | None, dict[str, Any] | None]:
        with self.connection() as conn:
            batch = conn.execute("SELECT revision FROM import_batches WHERE batch_id=?", (batch_id,)).fetchone()
            if batch is None:
                raise ApiProblem(404, "import_not_found", "Import batch was not found")
            generation = self.generation(conn)
            if is_common_manifest_query(query):
                clauses = ["i.batch_id=?", "i.present=1"]
                parameters: list[Any] = [batch_id]
                for column, values in (
                    ("classification", query["classifications"]),
                    ("effective_decision", query["decisions"]),
                    ("entry_kind", query["entry_kinds"]),
                ):
                    if values:
                        clauses.append(f"i.{column} IN ({','.join('?' for _value in values)})")
                        parameters.extend(values)
                if cursor is not None:
                    if cursor.kind != "manifest_direct" or len(cursor.values) != 2:
                        raise ApiProblem(400, "bad_cursor", "The manifest cursor does not match the current view")
                    clauses.append("(i.relative_path_text,i.item_id)>(?,?)")
                    parameters.extend(cursor.values)
                parameters.append(limit + 1)
                rows = conn.execute(
                    self._manifest_select("0 AS _ordinal") + " WHERE " + " AND ".join(clauses)
                    + " ORDER BY i.relative_path_text COLLATE BINARY,i.item_id LIMIT ?",
                    parameters,
                ).fetchall()
                kind = "manifest_direct"
            else:
                db = _ConnectionManifestDB(conn)
                view = ensure_manifest_view(
                    db,
                    self.config,
                    batch_id=batch_id,
                    batch_revision=int(batch["revision"]),
                    query=query,
                )
                conn.commit()
                if view["status"] != "ready":
                    return generation, [], None, {
                        "id": view["view_id"],
                        "status": view["status"],
                        "job_id": view["job_id"],
                        "error": view["error_text"],
                    }
                after = -1
                if cursor is not None:
                    if cursor.kind != "manifest_materialized" or len(cursor.values) != 2 or cursor.values[0] != view["view_id"]:
                        raise ApiProblem(400, "bad_cursor", "The manifest cursor does not match the prepared view")
                    after = int(cursor.values[1])
                rows = conn.execute(
                    self._manifest_select("vi.ordinal AS _ordinal")
                    + " JOIN import_manifest_view_items vi ON vi.item_id=i.item_id"
                    + " WHERE vi.view_id=? AND vi.ordinal>? ORDER BY vi.ordinal LIMIT ?",
                    (view["view_id"], after, limit + 1),
                ).fetchall()
                kind = "manifest_materialized"
            has_more = len(rows) > limit
            rows = rows[:limit]
            next_cursor = None
            if has_more and rows:
                if kind == "manifest_direct":
                    next_cursor = ImportCursor(kind, (rows[-1]["relative_path_text"], rows[-1]["item_id"])).encode()
                else:
                    next_cursor = ImportCursor(kind, (view["view_id"], int(rows[-1]["_ordinal"]))).encode()
            return generation, [self._manifest_item(row, batch_id) for row in rows], next_cursor, None

    def import_preview(self, batch_id: str, item_id: str) -> tuple[Path, str]:
        with self.connection() as conn:
            row = conn.execute(
                """SELECT d.status,d.relative_path_text,d.mime_type,d.byte_size,d.file_mtime_ns
                     FROM import_items i JOIN derivatives d ON d.import_item_id=i.item_id
                    WHERE i.batch_id=? AND i.item_id=? AND i.present=1 AND d.is_current=1
                      AND d.derivative_kind='review_preview'
                    ORDER BY d.updated_at DESC,d.derivative_id DESC LIMIT 1""",
                (batch_id, item_id),
            ).fetchone()
        if row is None:
            raise ApiProblem(404, "preview_unavailable", "No persisted review preview is available")
        if row["status"] != "ready":
            status = 425 if row["status"] in {"queued", "processing"} else 404
            raise ApiProblem(status, "preview_preparing" if status == 425 else "preview_unavailable", "Review preview is not ready")
        if not row["relative_path_text"] or row["byte_size"] is None or row["file_mtime_ns"] is None:
            raise ApiProblem(404, "preview_unavailable", "The persisted review preview is incomplete")
        root = self.config.derivative_root.absolute()
        path = (root / Path(row["relative_path_text"])).absolute()
        try:
            path.relative_to(root)
        except ValueError as exc:
            raise ApiProblem(500, "preview_path_invalid", "The persisted preview path is outside derivative storage") from exc
        if not path.is_file():
            raise ApiProblem(404, "preview_unavailable", "The persisted review preview file is unavailable")
        stat = path.stat()
        if stat.st_size != int(row["byte_size"]) or stat.st_mtime_ns != int(row["file_mtime_ns"]):
            raise ApiProblem(409, "preview_stale", "The persisted review preview certification is stale")
        return path, str(row["mime_type"] or "image/webp")

    def enqueue_discovery(
        self,
        request: Request,
        mutation: ImportDiscoveryMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = "POST:/api/v1/imports/discover"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            job_id = enqueue_job(
                _ConnectionManifestDB(conn),
                job_kind="inbox_scan",
                subject_type="inbox",
                subject_id=str(self.config.inbox_root),
                progress={"reuse_unchanged": mutation.reuse_unchanged},
                priority=90,
            )
            generation = self._advance_generation(conn)
            result = _envelope(
                request,
                generation=generation,
                data={"job_id": job_id, "media_publication": "none; discovery and preview enqueue only"},
                job={"id": job_id, "status": "queued", "phase": "inbox_scan"},
            )
            self._record_replay(conn, scope, idempotency_key, digest, 202, result)
            conn.commit()
            return 202, result

    def set_import_decisions(
        self,
        request: Request,
        batch_id: str,
        mutation: ImportDecisionMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = f"PUT:/api/v1/imports/{batch_id}/decisions"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            batch = conn.execute("SELECT revision FROM import_batches WHERE batch_id=?", (batch_id,)).fetchone()
            if batch is None:
                raise ApiProblem(404, "import_not_found", "Import batch was not found")
            if int(batch["revision"]) != mutation.batch_revision:
                raise ApiProblem(409, "stale_revision", "Import decisions changed; reload before updating")
            item_ids = [item.item_id for item in mutation.decisions]
            if len(set(item_ids)) != len(item_ids):
                raise ApiProblem(422, "duplicate_decision_item", "Each item may appear only once per decision request")
            placeholders = ",".join("?" for _item in item_ids)
            rows = conn.execute(
                f"SELECT * FROM import_items WHERE batch_id=? AND item_id IN ({placeholders}) AND present=1",
                (batch_id, *item_ids),
            ).fetchall()
            by_id = {row["item_id"]: row for row in rows}
            for item in mutation.decisions:
                row = by_id.get(item.item_id)
                if row is None:
                    raise ApiProblem(404, "import_item_not_found", f"Import item {item.item_id} was not found")
                if int(row["decision_revision"]) != item.expected_revision:
                    raise ApiProblem(409, "stale_revision", f"Decision for {item.item_id} changed; reload before updating")
            service = ImportManifestService(_ConnectionManifestDB(conn), self.config)
            results = []
            try:
                for item in mutation.decisions:
                    value = service.set_decision(
                        DecisionRequest(
                            item_id=item.item_id,
                            decision=item.decision,
                            reason=item.reason,
                            expected_revision=item.expected_revision,
                        )
                    )
                    results.append(asdict(value))
            except DecisionConflictError as exc:
                raise ApiProblem(409, "stale_revision", str(exc)) from exc
            generation = self._advance_generation(conn)
            result = _envelope(request, generation=generation, data={"decisions": results})
            self._record_replay(conn, scope, idempotency_key, digest, 200, result)
            conn.commit()
            return 200, result

    def enqueue_preflight(
        self,
        request: Request,
        batch_id: str,
        mutation: ImportPreflightMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = f"POST:/api/v1/imports/{batch_id}/approval-preflight"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            batch = conn.execute("SELECT revision FROM import_batches WHERE batch_id=?", (batch_id,)).fetchone()
            if batch is None:
                raise ApiProblem(404, "import_not_found", "Import batch was not found")
            if int(batch["revision"]) != mutation.batch_revision:
                raise ApiProblem(409, "stale_revision", "Import decisions changed; reload before approval")
            job_id = enqueue_job(
                _ConnectionManifestDB(conn),
                job_kind="import_approval_preflight",
                subject_type="import_batch",
                subject_id=batch_id,
                progress={"batch_revision": mutation.batch_revision},
                priority=80,
            )
            generation = self._advance_generation(conn)
            result = _envelope(
                request,
                generation=generation,
                data={"job_id": job_id},
                job={"id": job_id, "status": "queued", "phase": "import_approval_preflight"},
            )
            self._record_replay(conn, scope, idempotency_key, digest, 202, result)
            conn.commit()
            return 202, result

    def approve_import(
        self,
        request: Request,
        batch_id: str,
        mutation: ImportApprovalMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = f"POST:/api/v1/imports/{batch_id}/approve"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            job = conn.execute(
                "SELECT * FROM background_jobs WHERE job_id=? AND job_kind='import_approval_preflight'",
                (mutation.preflight_job_id,),
            ).fetchone()
            if job is None or job["subject_id"] != batch_id:
                raise ApiProblem(404, "approval_preflight_not_found", "Approval preflight was not found")
            if job["status"] != "completed":
                raise ApiProblem(409, "approval_preflight_incomplete", "Approval capacity preflight is not complete")
            preflight = _decode_json(job["progress_json"], field="approval preflight")
            if int(preflight.get("batch_revision", -1)) != mutation.batch_revision:
                raise ApiProblem(409, "stale_revision", "Approval preflight no longer matches the import decisions")
            try:
                approval = ReviewedImportService(
                    _ConnectionManifestDB(conn),
                    self.layout,
                    self.config,
                ).approve_batch(
                    batch_id,
                    expected_revision=mutation.batch_revision,
                    destination_free_bytes=int(preflight["summary"]["destination_free_bytes"]),
                )
            except (ApprovalConflictError, ValueError) as exc:
                raise ApiProblem(409, "approval_conflict", str(exc)) from exc
            generation = self._advance_generation(conn)
            result = _envelope(request, generation=generation, data=asdict(approval))
            self._record_replay(conn, scope, idempotency_key, digest, 200, result)
            conn.commit()
            return 200, result

    def enqueue_execute(
        self,
        request: Request,
        batch_id: str,
        mutation: ImportExecuteMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = f"POST:/api/v1/imports/{batch_id}/execute"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            approval = conn.execute(
                "SELECT * FROM import_batch_approvals WHERE approval_id=? AND batch_id=?",
                (mutation.approval_id, batch_id),
            ).fetchone()
            if approval is None:
                raise ApiProblem(404, "approval_not_found", "Import approval was not found")
            job_id = stable_id("job1", "reviewed_execute", mutation.approval_id)
            enqueue_job(
                _ConnectionManifestDB(conn),
                job_kind="reviewed_execute",
                subject_type="import_approval",
                subject_id=mutation.approval_id,
                progress={"approval_id": mutation.approval_id, "batch_id": batch_id, "actor": "local_user"},
                priority=95,
                job_id=job_id,
            )
            generation = self._advance_generation(conn)
            result = _envelope(
                request,
                generation=generation,
                data={"job_id": job_id, "approval_id": mutation.approval_id},
                job={"id": job_id, "status": "queued", "phase": "reviewed_execute"},
            )
            self._record_replay(conn, scope, idempotency_key, digest, 202, result)
            conn.commit()
            return 202, result

    def control_import(
        self,
        request: Request,
        batch_id: str,
        mutation: ImportControlMutation,
        idempotency_key: str,
    ) -> tuple[int, dict[str, Any]]:
        scope = f"POST:/api/v1/imports/{batch_id}/control"
        digest = _request_digest(mutation)
        with self.connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            replay = self._replay(conn, scope, idempotency_key, digest)
            if replay is not None:
                conn.rollback()
                return replay
            self._require_generation(conn, mutation.generation)
            batch = conn.execute("SELECT current_job_id FROM import_batches WHERE batch_id=?", (batch_id,)).fetchone()
            if batch is None:
                raise ApiProblem(404, "import_not_found", "Import batch was not found")
            if not batch["current_job_id"]:
                raise ApiProblem(409, "import_job_missing", "This import has no active copy job")
            jobs = BackgroundJobService(_ConnectionManifestDB(conn))
            try:
                if mutation.action == "pause":
                    state = jobs.request_pause(batch["current_job_id"])
                elif mutation.action == "resume":
                    jobs.resume(batch["current_job_id"])
                    state = "run"
                else:
                    state = jobs.request_cancel(batch["current_job_id"])
            except (KeyError, ValueError) as exc:
                raise ApiProblem(409, "import_control_conflict", str(exc)) from exc
            generation = self._advance_generation(conn)
            result = _envelope(
                request,
                generation=generation,
                data={"job_id": batch["current_job_id"], "action": mutation.action, "control_state": state},
            )
            self._record_replay(conn, scope, idempotency_key, digest, 200, result)
            conn.commit()
            return 200, result

    def compare_imports(self, batch_ids: tuple[str, ...]) -> tuple[int, list[dict[str, Any]]]:
        if not 2 <= len(batch_ids) <= 8 or len(set(batch_ids)) != len(batch_ids):
            raise ApiProblem(400, "invalid_comparison", "Choose between two and eight distinct import batches")
        placeholders = ",".join("?" for _batch in batch_ids)
        with self.connection() as conn:
            rows = conn.execute(
                f"SELECT * FROM import_batches WHERE batch_id IN ({placeholders})",
                batch_ids,
            ).fetchall()
            generation = self.generation(conn)
        by_id = {row["batch_id"]: row for row in rows}
        missing = [batch_id for batch_id in batch_ids if batch_id not in by_id]
        if missing:
            raise ApiProblem(404, "import_not_found", "One or more comparison imports were not found", details={"ids": missing})
        return generation, [self._batch_value(by_id[batch_id]) for batch_id in batch_ids]

    def import_history_query_plan(self, cursor: ImportCursor) -> tuple[str, ...]:
        with self.connection() as conn:
            rows = conn.execute(
                """EXPLAIN QUERY PLAN SELECT batch_id FROM import_batches
                     WHERE (updated_at<? OR (updated_at=? AND batch_id<?))
                     ORDER BY updated_at DESC,batch_id DESC LIMIT 101""",
                (cursor.values[0], cursor.values[0], cursor.values[1]),
            ).fetchall()
            return tuple(str(row[3]) for row in rows)

    def saved_view_query_plan(self, cursor: SavedViewCursor) -> tuple[str, ...]:
        with self.connection() as conn:
            rows = conn.execute(
                """EXPLAIN QUERY PLAN SELECT saved_view_id FROM saved_views
                     WHERE deleted_at IS NULL AND
                           (updated_at<? OR (updated_at=? AND saved_view_id<?))
                     ORDER BY updated_at DESC,saved_view_id DESC LIMIT 101""",
                (cursor.updated_at, cursor.updated_at, cursor.saved_view_id),
            ).fetchall()
            return tuple(str(row[3]) for row in rows)


def _idempotency_key(request: Request) -> str:
    key = request.headers.get("Idempotency-Key", "")
    if not _IDEMPOTENCY_KEY.fullmatch(key):
        raise ApiProblem(
            400,
            "idempotency_key_required",
            "A printable Idempotency-Key header of 1 to 128 characters is required",
        )
    return key


def _static_script_hashes(static_root: Path) -> tuple[str, ...]:
    hashes: set[str] = set()
    if not static_root.is_dir():
        return ()
    pattern = re.compile(r"<script(?:\s[^>]*)?>(.*?)</script>", re.IGNORECASE | re.DOTALL)
    for path in static_root.rglob("*.html"):
        try:
            html = path.read_text(encoding="utf-8")
        except OSError:
            continue
        for script in pattern.findall(html):
            if not script:
                continue
            digest = base64.b64encode(hashlib.sha256(script.encode("utf-8")).digest()).decode("ascii")
            hashes.add(f"'sha256-{digest}'")
    return tuple(sorted(hashes))


def _security_headers(response: Response, script_hashes: tuple[str, ...]) -> None:
    script_sources = " ".join(("'self'", *script_hashes))
    style_values = (
        "display: contents",
        "position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); "
        "overflow: hidden; white-space: nowrap; width: 1px; height: 1px",
    )
    style_hashes = " ".join(
        f"'sha256-{base64.b64encode(hashlib.sha256(value.encode('utf-8')).digest()).decode('ascii')}'"
        for value in style_values
    )
    response.headers["Content-Security-Policy"] = (
        f"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src {script_sources}; "
        f"style-src-attr 'unsafe-hashes' {style_hashes}; "
        "connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; "
        "frame-ancestors 'none'; form-action 'self'"
    )
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"


def create_review_app(
    config: ReviewConfig,
    *,
    static_root: Path | None = None,
    folder_opener: Callable[[Path], None] | None = None,
) -> FastAPI:
    static = (static_root or REVIEW_UI_ROOT).absolute()
    script_hashes = _static_script_hashes(static)
    store = ApplicationStateStore(config, folder_opener=folder_opener)
    app = FastAPI(
        title="Immutable Media Vault Review API",
        version=__version__,
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )
    app.state.review_config = config
    app.state.application_store = store
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["127.0.0.1", "localhost", "[::1]", "::1"],
    )

    @app.exception_handler(ApiProblem)
    async def api_problem_handler(request: Request, exc: ApiProblem) -> JSONResponse:
        return _problem_response(request, exc)

    @app.exception_handler(RequestValidationError)
    async def validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        errors = [
            {
                "type": str(error.get("type", "validation_error")),
                "location": [str(part) for part in error.get("loc", ())],
                "message": str(error.get("msg", "Invalid value")),
            }
            for error in exc.errors()
        ]
        problem = ApiProblem(
            422,
            "validation_error",
            "The request did not match the API contract",
            details={"errors": errors},
        )
        return _problem_response(request, problem)

    @app.exception_handler(Exception)
    async def unexpected_error_handler(request: Request, _exc: Exception) -> JSONResponse:
        return _problem_response(
            request,
            ApiProblem(500, "internal_error", "The review service could not complete the request"),
        )

    @app.middleware("http")
    async def review_security(request: Request, call_next: Any) -> Response:
        request.state.request_id = uuid.uuid4().hex
        response: Response
        if request.url.hostname not in {"127.0.0.1", "localhost", "::1"}:
            response = _problem_response(
                request,
                ApiProblem(400, "host_rejected", "The review application accepts localhost requests only"),
            )
            _security_headers(response, script_hashes)
            return response
        if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
            origin = request.headers.get("origin")
            expected_origin = f"{request.url.scheme}://{request.headers.get('host', '')}".rstrip("/")
            if not origin or origin.rstrip("/").lower() != expected_origin.lower():
                response = _problem_response(
                    request,
                    ApiProblem(403, "origin_rejected", "Mutation requests must come from the same origin"),
                )
                _security_headers(response, script_hashes)
                return response
            content_type = request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
            if content_type != "application/json":
                response = _problem_response(
                    request,
                    ApiProblem(415, "json_required", "Mutation requests must use application/json"),
                )
                _security_headers(response, script_hashes)
                return response
            maximum = config.request_budgets.max_json_payload_bytes
            try:
                content_length = int(request.headers.get("content-length", "0"))
            except ValueError:
                content_length = maximum + 1
            if content_length > maximum:
                response = _problem_response(
                    request,
                    ApiProblem(413, "payload_too_large", f"JSON payload exceeds the {maximum}-byte limit"),
                )
                _security_headers(response, script_hashes)
                return response
            body = await request.body()
            if len(body) > maximum:
                response = _problem_response(
                    request,
                    ApiProblem(413, "payload_too_large", f"JSON payload exceeds the {maximum}-byte limit"),
                )
                _security_headers(response, script_hashes)
                return response

            delivered = False

            async def replay_body() -> dict[str, Any]:
                nonlocal delivered
                if delivered:
                    return {"type": "http.request", "body": b"", "more_body": False}
                delivered = True
                return {"type": "http.request", "body": body, "more_body": False}

            request = Request(request.scope, replay_body)
            request.state.request_id = request.scope.get("state", {}).get("request_id", uuid.uuid4().hex)
        response = await call_next(request)
        _security_headers(response, script_hashes)
        if (
            request.url.path.startswith("/api/v1/imports/")
            and request.url.path.endswith("/preview")
        ) or (
            request.url.path.startswith("/api/v1/library/entities/")
            and "/derivatives/" in request.url.path
        ):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        elif request.url.path.startswith("/api/v1/"):
            response.headers["Cache-Control"] = "no-store"
        elif request.url.path.startswith("/_app/immutable/"):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        else:
            response.headers["Cache-Control"] = "no-cache"
        return response

    @app.get("/api/v1/system")
    def system(request: Request) -> dict[str, Any]:
        generation, data = store.system()
        return _envelope(request, generation=generation, data=data)

    @app.get("/api/v1/preferences")
    def preferences(request: Request) -> dict[str, Any]:
        generation, data = store.preferences()
        return _envelope(request, generation=generation, data=data)

    @app.put("/api/v1/preferences/{key}")
    def put_preference(request: Request, key: str, mutation: PreferenceMutation) -> JSONResponse:
        status, result = store.put_preference(request, key, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.get("/api/v1/saved-views")
    def saved_views(
        request: Request,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
    ) -> dict[str, Any]:
        decoded = SavedViewCursor.decode(cursor) if cursor else None
        generation, data, next_cursor = store.saved_views(limit=limit, cursor=decoded)
        return _envelope(
            request,
            generation=generation,
            data=data,
            page={"limit": limit, "next_cursor": next_cursor},
        )

    @app.post("/api/v1/saved-views")
    def create_saved_view(request: Request, mutation: SavedViewCreate) -> JSONResponse:
        status, result = store.create_saved_view(request, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.put("/api/v1/saved-views/{view_id}")
    def update_saved_view(request: Request, view_id: str, mutation: SavedViewUpdate) -> JSONResponse:
        status, result = store.update_saved_view(
            request,
            view_id,
            mutation,
            _idempotency_key(request),
        )
        return JSONResponse(status_code=status, content=result)

    @app.delete("/api/v1/saved-views/{view_id}")
    def delete_saved_view(request: Request, view_id: str, mutation: RevisionMutation) -> JSONResponse:
        status, result = store.delete_saved_view(
            request,
            view_id,
            mutation,
            _idempotency_key(request),
        )
        return JSONResponse(status_code=status, content=result)

    @app.get("/api/v1/jobs/{job_id}")
    def job(request: Request, job_id: str) -> dict[str, Any]:
        generation, data, unavailable = store.job(job_id)
        return _envelope(
            request,
            generation=generation,
            data=data,
            job={"id": data["id"], "status": data["status"], "phase": data["phase"]},
            unavailable=unavailable,
        )

    @app.get("/api/v1/backfill")
    def backfill(request: Request) -> dict[str, Any]:
        generation, data = store.backfill()
        return _envelope(
            request,
            generation=generation,
            data=data,
            job=(
                {"id": data["id"], "status": data["status"], "phase": data["phase"]}
                if data["id"]
                else None
            ),
        )

    @app.post("/api/v1/backfill/control")
    def control_backfill_route(request: Request, mutation: BackfillMutation) -> JSONResponse:
        status, result = store.control_backfill(request, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.get("/api/v1/imports")
    def imports(
        request: Request,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
        status: list[str] | None = Query(default=None),
    ) -> dict[str, Any]:
        decoded = ImportCursor.decode(cursor, expected_kind="import_history") if cursor else None
        generation, data, next_cursor = store.imports(
            limit=limit,
            cursor=decoded,
            statuses=tuple(status or ()),
        )
        return _envelope(request, generation=generation, data=data, page={"limit": limit, "next_cursor": next_cursor})

    @app.post("/api/v1/imports/discover")
    def discover_imports(request: Request, mutation: ImportDiscoveryMutation) -> JSONResponse:
        status, result = store.enqueue_discovery(request, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.get("/api/v1/imports/compare")
    def compare_imports(request: Request, batch_id: list[str] = Query()) -> dict[str, Any]:
        generation, data = store.compare_imports(tuple(batch_id))
        return _envelope(request, generation=generation, data=data)

    @app.get("/api/v1/imports/{batch_id}")
    def import_detail(request: Request, batch_id: str) -> dict[str, Any]:
        generation, data, unavailable = store.import_detail(batch_id)
        return _envelope(request, generation=generation, data=data, unavailable=unavailable)

    @app.get("/api/v1/imports/{batch_id}/folders")
    def import_folders(
        request: Request,
        batch_id: str,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
    ) -> dict[str, Any]:
        decoded = ImportCursor.decode(cursor, expected_kind="import_folders") if cursor else None
        generation, data, next_cursor = store.import_folders(batch_id, limit=limit, cursor=decoded)
        return _envelope(request, generation=generation, data=data, page={"limit": limit, "next_cursor": next_cursor})

    @app.get("/api/v1/imports/{batch_id}/samples")
    def import_samples(
        request: Request,
        batch_id: str,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
    ) -> dict[str, Any]:
        decoded = ImportCursor.decode(cursor, expected_kind="import_progress_samples") if cursor else None
        generation, data, next_cursor = store._import_stream(
            "import_progress_samples", "sample_id", batch_id, limit=limit, cursor=decoded
        )
        return _envelope(request, generation=generation, data=data, page={"limit": limit, "next_cursor": next_cursor})

    @app.get("/api/v1/imports/{batch_id}/events")
    def import_events(
        request: Request,
        batch_id: str,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
        level: str | None = Query(default=None, max_length=20),
        event_type: str | None = Query(default=None, max_length=80),
    ) -> dict[str, Any]:
        decoded = ImportCursor.decode(cursor, expected_kind="import_events") if cursor else None
        clauses = ""
        parameters: list[Any] = []
        if level:
            clauses += " AND level=?"
            parameters.append(level)
        if event_type:
            clauses += " AND event_type=?"
            parameters.append(event_type)
        generation, data, next_cursor = store._import_stream(
            "import_events",
            "event_id",
            batch_id,
            limit=limit,
            cursor=decoded,
            extra_clause=clauses,
            extra_parameters=tuple(parameters),
        )
        return _envelope(request, generation=generation, data=data, page={"limit": limit, "next_cursor": next_cursor})

    @app.get("/api/v1/imports/{batch_id}/errors")
    def import_errors(
        request: Request,
        batch_id: str,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
        unresolved_only: bool = False,
    ) -> dict[str, Any]:
        decoded = ImportCursor.decode(cursor, expected_kind="import_errors") if cursor else None
        generation, data, next_cursor = store._import_stream(
            "import_errors",
            "error_id",
            batch_id,
            limit=limit,
            cursor=decoded,
            extra_clause=" AND resolved_at IS NULL" if unresolved_only else "",
        )
        return _envelope(request, generation=generation, data=data, page={"limit": limit, "next_cursor": next_cursor})

    @app.get("/api/v1/imports/{batch_id}/manifest", response_model=None)
    def import_manifest(
        request: Request,
        batch_id: str,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
        classification: list[str] | None = Query(default=None),
        decision: list[str] | None = Query(default=None),
        entry_kind: list[str] | None = Query(default=None),
        outcome: list[str] | None = Query(default=None),
        search: str | None = Query(default=None, max_length=256),
        sort: list[str] | None = Query(default=None),
    ) -> Any:
        parsed_sorts: list[tuple[str, str]] = []
        for value in sort or ["relative_path:asc"]:
            try:
                field, direction = value.split(":", 1)
            except ValueError as exc:
                raise ApiProblem(400, "invalid_manifest_sort", "Manifest sorts use field:direction") from exc
            if field not in MANIFEST_SORT_FIELDS:
                raise ApiProblem(400, "invalid_manifest_sort", "Manifest sort field is unsupported")
            parsed_sorts.append((field, direction))
        try:
            query = normalize_manifest_query(
                classifications=classification or (),
                decisions=decision or (),
                entry_kinds=entry_kind or (),
                outcomes=outcome or (),
                search=search,
                sorts=parsed_sorts,
            )
        except ValueError as exc:
            raise ApiProblem(400, "invalid_manifest_query", str(exc)) from exc
        decoded = ImportCursor.decode(cursor) if cursor else None
        generation, data, next_cursor, preparing = store.import_manifest(
            batch_id,
            limit=limit,
            cursor=decoded,
            query=query,
        )
        if preparing is not None:
            result = _envelope(
                request,
                generation=generation,
                data={"items": [], "view": preparing, "query": query},
                page={"limit": limit, "next_cursor": None},
                job={
                    "id": preparing["job_id"],
                    "status": preparing["status"],
                    "phase": "import_manifest_materialize",
                },
            )
            return JSONResponse(status_code=202 if preparing["status"] != "error" else 409, content=result)
        return _envelope(
            request,
            generation=generation,
            data={"items": data, "view": None, "query": query},
            page={"limit": limit, "next_cursor": next_cursor},
        )

    @app.get("/api/v1/imports/{batch_id}/items/{item_id}/preview")
    def import_preview(batch_id: str, item_id: str) -> FileResponse:
        path, media_type = store.import_preview(batch_id, item_id)
        return FileResponse(
            path,
            media_type=media_type,
            headers={"Cache-Control": "public, max-age=31536000, immutable"},
        )

    @app.put("/api/v1/imports/{batch_id}/decisions")
    def set_import_decisions(
        request: Request,
        batch_id: str,
        mutation: ImportDecisionMutation,
    ) -> JSONResponse:
        status, result = store.set_import_decisions(request, batch_id, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.post("/api/v1/imports/{batch_id}/approval-preflight")
    def approval_preflight(
        request: Request,
        batch_id: str,
        mutation: ImportPreflightMutation,
    ) -> JSONResponse:
        status, result = store.enqueue_preflight(request, batch_id, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.post("/api/v1/imports/{batch_id}/approve")
    def approve_import(
        request: Request,
        batch_id: str,
        mutation: ImportApprovalMutation,
    ) -> JSONResponse:
        status, result = store.approve_import(request, batch_id, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.post("/api/v1/imports/{batch_id}/execute")
    def execute_import(
        request: Request,
        batch_id: str,
        mutation: ImportExecuteMutation,
    ) -> JSONResponse:
        status, result = store.enqueue_execute(request, batch_id, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.post("/api/v1/imports/{batch_id}/control")
    def control_import(
        request: Request,
        batch_id: str,
        mutation: ImportControlMutation,
    ) -> JSONResponse:
        status, result = store.control_import(request, batch_id, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.get("/api/v1/library", response_model=None)
    def library(
        request: Request,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
        media_kind: list[str] | None = Query(default=None),
        format: list[str] | None = Query(default=None),
        camera: list[str] | None = Query(default=None),
        lens: list[str] | None = Query(default=None),
        folder: list[str] | None = Query(default=None),
        favourite: bool | None = None,
        rejected: Literal["hide", "only", "include"] = "hide",
        rating_min: int = Query(0, ge=0, le=5),
        rating_max: int = Query(5, ge=0, le=5),
        search: str | None = Query(default=None, max_length=256),
        sort: list[str] | None = Query(default=None),
        random_seed: str = Query("media-vault-default", min_length=1, max_length=64),
        organization_kind: str | None = Query(default=None, max_length=16),
        organization_key: str | None = Query(default=None, max_length=200),
        stack_profile_id: str | None = Query(default=None, max_length=160),
    ) -> Any:
        parsed_sorts: list[tuple[str, str]] = []
        for value in sort or ["capture_time:desc"]:
            try:
                field, direction = value.split(":", 1)
            except ValueError as exc:
                raise ApiProblem(400, "invalid_library_sort", "Library sorts use field:direction") from exc
            if field not in LIBRARY_SORT_FIELDS:
                raise ApiProblem(400, "invalid_library_sort", "Library sort field is unsupported")
            parsed_sorts.append((field, direction))
        try:
            query = normalize_library_query(
                media_kinds=media_kind or (),
                formats=format or (),
                cameras=camera or (),
                lenses=lens or (),
                folders=folder or (),
                favourite=favourite,
                rejected={"hide": False, "only": True, "include": None}[rejected],
                rating_min=rating_min,
                rating_max=rating_max,
                search=search,
                sorts=parsed_sorts,
                random_seed=random_seed,
                organization_kind=organization_kind,
                organization_key=organization_key,
                stack_profile_id=stack_profile_id,
            )
        except ValueError as exc:
            raise ApiProblem(400, "invalid_library_query", str(exc)) from exc
        query_hash = library_query_sha256(query)
        decoded = LibraryCursor.decode(cursor, expected_query_sha256=query_hash) if cursor else None
        generation, data, next_cursor, preparing = store.library_page(
            limit=limit,
            cursor=decoded,
            query=query,
        )
        if preparing is not None:
            result = _envelope(
                request,
                generation=generation,
                data={**data, "view": store._library_view_value(preparing)},
                page={"limit": limit, "next_cursor": None},
                job={
                    "id": preparing["job_id"],
                    "status": preparing["status"],
                    "phase": preparing["view_kind"],
                },
            )
            return JSONResponse(status_code=202 if preparing["status"] != "error" else 409, content=result)
        return _envelope(
            request,
            generation=generation,
            data=data,
            page={"limit": limit, "next_cursor": next_cursor},
        )

    @app.post("/api/v1/library/prepare")
    def prepare_library(request: Request, mutation: LibraryPrepareMutation) -> JSONResponse:
        status, result = store.prepare_library(request, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.get("/api/v1/library/facets/{facet_name}")
    def library_facets(
        request: Request,
        facet_name: str,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
    ) -> dict[str, Any]:
        decoded = LibraryCursor.decode(cursor, expected_kind="library_facet") if cursor else None
        generation, data, next_cursor = store.library_facets(
            facet_name,
            limit=limit,
            cursor=decoded,
        )
        return _envelope(
            request,
            generation=generation,
            data=data,
            page={"limit": limit, "next_cursor": next_cursor},
        )

    @app.get("/api/v1/library/entities/{entity_id}")
    def library_detail(request: Request, entity_id: str) -> dict[str, Any]:
        generation, data, unavailable = store.library_detail(entity_id)
        return _envelope(request, generation=generation, data=data, unavailable=unavailable)

    @app.get("/api/v1/library/entities/{entity_id}/derivatives/{long_edge}")
    def library_derivative(entity_id: str, long_edge: int) -> FileResponse:
        if long_edge not in {192, 384, 768, 1536, 2560}:
            raise ApiProblem(400, "invalid_derivative_size", "The requested derivative size is unsupported")
        path, media_type = store.library_derivative(entity_id, long_edge)
        return FileResponse(
            path,
            media_type=media_type,
            headers={"Cache-Control": "public, max-age=31536000, immutable"},
        )

    @app.put("/api/v1/library/state")
    def update_library_state(request: Request, mutation: LibraryStateMutation) -> JSONResponse:
        status, result = store.update_library_state(request, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.post("/api/v1/library/bulk-reject")
    def bulk_reject(request: Request, mutation: BulkRejectMutation) -> JSONResponse:
        status, result = store.bulk_reject(request, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.post("/api/v1/library/bulk-reject/undo")
    def undo_bulk_reject(request: Request, mutation: BulkUndoMutation) -> JSONResponse:
        status, result = store.undo_bulk_reject(request, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.post("/api/v1/library/entities/{entity_id}/open-folder")
    def open_library_folder(
        request: Request,
        entity_id: str,
        mutation: LibraryOpenMutation,
    ) -> JSONResponse:
        status, result = store.open_library_folder(
            request,
            entity_id,
            mutation,
            _idempotency_key(request),
        )
        return JSONResponse(status_code=status, content=result)

    @app.get("/api/v1/stacks/profiles")
    def stack_profiles(
        request: Request,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
    ) -> dict[str, Any]:
        decoded = LibraryCursor.decode(cursor, expected_kind="stack_profiles") if cursor else None
        generation, data, next_cursor = store.stack_profiles(limit=limit, cursor=decoded)
        return _envelope(
            request,
            generation=generation,
            data=data,
            page={"limit": limit, "next_cursor": next_cursor},
        )

    @app.post("/api/v1/stacks/profiles")
    def create_stack_profile(request: Request, mutation: StackProfileCreateMutation) -> JSONResponse:
        status, result = store.create_stack_profile(request, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.get("/api/v1/stacks/status")
    def stack_status(request: Request, profile_id: str | None = Query(default=None, max_length=160)) -> JSONResponse:
        generation, data = store.stack_status(profile_id)
        status = 200 if data["status"] == "ready" else 409 if data["status"] == "error" else 202
        return JSONResponse(
            status_code=status,
            content=_envelope(
                request,
                generation=generation,
                data=data,
                job={"id": data["job_id"], "status": data["status"], "phase": "stack_profile_materialize"},
            ),
        )

    @app.get("/api/v1/stacks/{profile_id}", response_model=None)
    def stack_page(
        request: Request,
        profile_id: str,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
    ) -> Any:
        decoded = LibraryCursor.decode(cursor, expected_kind="stack_page") if cursor else None
        generation, data, next_cursor, preparing = store.stack_page(
            profile_id,
            limit=limit,
            cursor=decoded,
        )
        if preparing is not None:
            profile = store._stack_profile_value(preparing)
            return JSONResponse(
                status_code=409 if profile["status"] == "error" else 202,
                content=_envelope(
                    request,
                    generation=generation,
                    data=data,
                    page={"limit": limit, "next_cursor": None},
                    job={"id": profile["job_id"], "status": profile["status"], "phase": "stack_profile_materialize"},
                ),
            )
        return _envelope(
            request,
            generation=generation,
            data=data,
            page={"limit": limit, "next_cursor": next_cursor},
        )

    @app.get("/api/v1/stacks/{profile_id}/{stack_id}")
    def stack_detail(request: Request, profile_id: str, stack_id: str) -> dict[str, Any]:
        generation, data = store.stack_detail(profile_id, stack_id)
        return _envelope(request, generation=generation, data=data)

    @app.put("/api/v1/stacks/{profile_id}/{stack_id}/cover")
    def update_stack_cover(
        request: Request,
        profile_id: str,
        stack_id: str,
        mutation: StackCoverMutation,
    ) -> JSONResponse:
        status, result = store.update_stack_cover(
            request,
            profile_id,
            stack_id,
            mutation,
            _idempotency_key(request),
        )
        return JSONResponse(status_code=status, content=result)

    @app.post("/api/v1/stacks/{profile_id}/{stack_id}/reject-rest")
    def reject_stack_rest(
        request: Request,
        profile_id: str,
        stack_id: str,
        mutation: StackRejectRestMutation,
    ) -> JSONResponse:
        status, result = store.reject_stack_rest(
            request,
            profile_id,
            stack_id,
            mutation,
            _idempotency_key(request),
        )
        return JSONResponse(status_code=status, content=result)

    @app.get("/api/v1/junk/profiles")
    def junk_profiles(
        request: Request,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
    ) -> dict[str, Any]:
        decoded = LibraryCursor.decode(cursor, expected_kind="junk_profiles") if cursor else None
        generation, data, next_cursor = store.junk_profiles(limit=limit, cursor=decoded)
        return _envelope(
            request,
            generation=generation,
            data=data,
            page={"limit": limit, "next_cursor": next_cursor},
        )

    @app.post("/api/v1/junk/profiles")
    def create_junk_profile(request: Request, mutation: JunkProfileCreateMutation) -> JSONResponse:
        status, result = store.create_junk_profile(request, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.get("/api/v1/junk/status")
    def junk_status(request: Request, profile_id: str | None = Query(default=None, max_length=160)) -> JSONResponse:
        generation, data = store.junk_status(profile_id)
        status = 200 if data["status"] == "ready" else 409 if data["status"] == "error" else 202
        return JSONResponse(
            status_code=status,
            content=_envelope(
                request,
                generation=generation,
                data=data,
                job={"id": data["job_id"], "status": data["status"], "phase": "junk_profile_materialize"},
            ),
        )

    @app.get("/api/v1/junk/{profile_id}", response_model=None)
    def junk_page(
        request: Request,
        profile_id: str,
        hidden_only: bool = True,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
    ) -> Any:
        decoded = LibraryCursor.decode(cursor, expected_kind="junk_results") if cursor else None
        generation, data, next_cursor, preparing = store.junk_page(
            profile_id,
            hidden_only=hidden_only,
            limit=limit,
            cursor=decoded,
        )
        if preparing is not None:
            profile = store._junk_profile_value(preparing)
            return JSONResponse(
                status_code=409 if profile["status"] == "error" else 202,
                content=_envelope(
                    request,
                    generation=generation,
                    data=data,
                    page={"limit": limit, "next_cursor": None},
                    job={"id": profile["job_id"], "status": profile["status"], "phase": "junk_profile_materialize"},
                ),
            )
        return _envelope(
            request,
            generation=generation,
            data=data,
            page={"limit": limit, "next_cursor": next_cursor},
        )

    @app.get("/api/v1/junk/{profile_id}/entities/{entity_id}")
    def junk_detail(request: Request, profile_id: str, entity_id: str) -> dict[str, Any]:
        generation, data = store.junk_detail(profile_id, entity_id)
        return _envelope(request, generation=generation, data=data)

    @app.post("/api/v1/junk/{profile_id}/feedback")
    def record_junk_feedback(
        request: Request,
        profile_id: str,
        mutation: JunkFeedbackMutation,
    ) -> JSONResponse:
        status, result = store.record_junk_feedback(
            request,
            profile_id,
            mutation,
            _idempotency_key(request),
        )
        return JSONResponse(status_code=status, content=result)

    @app.get("/api/v1/organize/status")
    def organization_status(request: Request) -> JSONResponse:
        generation, data = store.organization_status()
        status = 200 if data["status"] == "ready" else 202
        return JSONResponse(
            status_code=status,
            content=_envelope(
                request,
                generation=generation,
                data=data,
                job={"id": data["job_id"], "status": data["status"], "phase": data["kind"]},
            ),
        )

    @app.post("/api/v1/organize/prepare")
    def prepare_organization(request: Request, mutation: OrganizationPrepareMutation) -> JSONResponse:
        status, result = store.prepare_organization(request, mutation, _idempotency_key(request))
        return JSONResponse(status_code=status, content=result)

    @app.get("/api/v1/organize/calendar")
    def organization_calendar(
        request: Request,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
        year: int | None = Query(default=None, ge=1, le=9999),
        month: int | None = Query(default=None, ge=1, le=12),
    ) -> dict[str, Any]:
        decoded = LibraryCursor.decode(cursor, expected_kind="organization_calendar") if cursor else None
        generation, data, next_cursor = store.organization_calendar(
            limit=limit,
            cursor=decoded,
            year=year,
            month=month,
        )
        return _envelope(request, generation=generation, data=data, page={"limit": limit, "next_cursor": next_cursor})

    @app.get("/api/v1/organize/folders")
    def organization_folders(
        request: Request,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
        parent_id: str | None = Query(default=None, max_length=160),
    ) -> dict[str, Any]:
        decoded = LibraryCursor.decode(cursor, expected_kind="organization_folders") if cursor else None
        generation, data, next_cursor = store.organization_folders(
            limit=limit,
            cursor=decoded,
            parent_id=parent_id,
        )
        return _envelope(request, generation=generation, data=data, page={"limit": limit, "next_cursor": next_cursor})

    @app.get("/api/v1/organize/equipment/{equipment_kind}")
    def organization_equipment(
        request: Request,
        equipment_kind: str,
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
    ) -> dict[str, Any]:
        decoded = LibraryCursor.decode(cursor, expected_kind="organization_equipment") if cursor else None
        generation, data, next_cursor = store.organization_equipment(
            equipment_kind,
            limit=limit,
            cursor=decoded,
        )
        return _envelope(request, generation=generation, data=data, page={"limit": limit, "next_cursor": next_cursor})

    @app.get("/api/v1/organize/map")
    def organization_map(
        request: Request,
        zoom: int = Query(1, ge=0, le=18),
        south: float = Query(-90, ge=-90, le=90),
        north: float = Query(90, ge=-90, le=90),
        west: float = Query(-180, ge=-180, le=180),
        east: float = Query(180, ge=-180, le=180),
        limit: int = Query(config.request_budgets.default_page_size, ge=1, le=config.request_budgets.max_page_size),
        cursor: str | None = None,
    ) -> dict[str, Any]:
        decoded = LibraryCursor.decode(cursor, expected_kind="organization_map") if cursor else None
        generation, data, next_cursor = store.organization_map(
            zoom=zoom,
            south=south,
            north=north,
            west=west,
            east=east,
            limit=limit,
            cursor=decoded,
        )
        return _envelope(request, generation=generation, data=data, page={"limit": limit, "next_cursor": next_cursor})

    @app.api_route(
        "/api/v1/{unknown_path:path}",
        methods=["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"],
    )
    def unknown_api_route(unknown_path: str) -> None:
        raise ApiProblem(
            404,
            "api_route_not_found",
            "The requested review API route does not exist",
            details={"path": f"/api/v1/{unknown_path}"},
        )

    if static.is_dir() and (static / "index.html").is_file():
        app.mount("/", StaticFiles(directory=static, html=True), name="review-ui-static")
    else:
        @app.get("/")
        def missing_static(request: Request) -> JSONResponse:
            return JSONResponse(
                status_code=503,
                content=_envelope(
                    request,
                    generation=None,
                    error={
                        "code": "static_build_missing",
                        "message": "The review UI production build is unavailable",
                        "details": {"expected_root": str(static)},
                    },
                ),
            )

    return app


def serve_review_app(
    config: ReviewConfig,
    *,
    open_browser: bool = True,
    run_worker: bool = True,
    exiftool: Path | None = None,
    ffprobe: Path | None = None,
    ffmpeg: Path | None = None,
) -> None:
    if config.review_host not in {"127.0.0.1", "localhost", "::1"}:
        raise ValueError("The review application may bind only to localhost")
    import uvicorn

    if not REVIEW_UI_ROOT.is_dir() or not (REVIEW_UI_ROOT / "index.html").is_file():
        raise RuntimeError("The review UI production build is missing; run the locked frontend build first")
    ApplicationStateStore(config).system()
    stop_event = threading.Event()
    worker_thread: threading.Thread | None = None
    if run_worker:
        from .review_runtime import run_worker_loop

        worker_thread = threading.Thread(
            target=run_worker_loop,
            args=(config,),
            kwargs={
                "stop_event": stop_event,
                "exiftool": exiftool,
                "ffprobe": ffprobe,
                "ffmpeg": ffmpeg,
            },
            name="media-vault-review-worker",
            daemon=True,
        )
        worker_thread.start()
    app = create_review_app(config)
    display_host = "[::1]" if config.review_host == "::1" else config.review_host
    url = f"http://{display_host}:{config.review_port}/"
    print(f"Media Vault review application: {url}")
    print("Press Ctrl+C to stop the application. Background jobs stop at their next safe boundary.")
    if open_browser:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        uvicorn.run(
            app,
            host=config.review_host,
            port=config.review_port,
            log_level="info",
            access_log=False,
        )
    finally:
        stop_event.set()
        if worker_thread is not None:
            worker_thread.join(timeout=5)
