from __future__ import annotations

import hashlib
import json
import sqlite3
from pathlib import Path

from fastapi.testclient import TestClient

from media_vault.config import RequestBudgets, ReviewConfig
from media_vault.core import VaultLayout, utc_now
from media_vault.db import SCHEMA_VERSION, ManifestDB, initialize_manifest_connection
from media_vault.review_api import (
    ApplicationStateStore,
    SavedViewCursor,
    create_review_app,
)
from media_vault.ui_server import create_dashboard_app


ORIGIN = "http://127.0.0.1:8766"


def _snapshot(root: Path) -> dict[str, tuple[int, int, int, int, str]]:
    values: dict[str, tuple[int, int, int, int, str]] = {}
    for path in sorted(item for item in root.rglob("*") if item.is_file()):
        stat = path.stat()
        values[str(path.relative_to(root))] = (
            stat.st_size,
            stat.st_mtime_ns,
            stat.st_ctime_ns,
            stat.st_mode,
            hashlib.sha256(path.read_bytes()).hexdigest(),
        )
    return values


def _foundation(
    tmp_path: Path,
    *,
    budgets: RequestBudgets | None = None,
) -> tuple[VaultLayout, ReviewConfig, Path, Path, Path]:
    source = tmp_path / "synthetic-immutable-source"
    source.mkdir()
    (source / "source.bin").write_bytes(b"synthetic immutable source")
    inbox = tmp_path / "synthetic-inbox"
    inbox.mkdir()
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    canonical = layout.objects / "sha256" / "aa" / "bb" / "canonical.blob"
    canonical.parent.mkdir(parents=True)
    canonical.write_bytes(b"synthetic immutable canonical object")
    db = ManifestDB(layout.database)
    db.close()
    static = tmp_path / "review-static"
    (static / "_app").mkdir(parents=True)
    (static / "index.html").write_text(
        "<!doctype html><title>Review shell</title><main>Review shell</main>"
        "<script>globalThis.reviewShellReady=true;</script>",
        encoding="utf-8",
    )
    (static / "_app" / "entry.js").write_text("export {};", encoding="utf-8")
    config = ReviewConfig(
        vault_root=layout.root,
        inbox_root=inbox,
        request_budgets=budgets or RequestBudgets(default_page_size=2, max_page_size=10),
    )
    config.assert_source_separated(source)
    return layout, config, static, source, layout.objects


def _client(config: ReviewConfig, static: Path) -> TestClient:
    return TestClient(create_review_app(config, static_root=static), base_url=ORIGIN)


def _mutation_headers(key: str) -> dict[str, str]:
    return {
        "Origin": ORIGIN,
        "Content-Type": "application/json",
        "Idempotency-Key": key,
    }


def test_review_app_is_separate_local_and_security_bounded(tmp_path: Path) -> None:
    layout, config, static, source, objects = _foundation(tmp_path)
    source_before = _snapshot(source)
    objects_before = _snapshot(objects)

    with _client(config, static) as client:
        root = client.get("/")
        assert root.status_code == 200
        assert "Review shell" in root.text
        assert client.get("/_app/entry.js").status_code == 200
        assert client.get("/static/app.js").status_code == 404
        system = client.get("/api/v1/system")
        assert system.status_code == 200
        assert system.json()["data"] == {
            "service": "media-vault-review-ui",
            "tool_version": "1.0.0",
            "schema_version": SCHEMA_VERSION,
            "generation": 0,
            "local_only": True,
        }
        assert system.json()["meta"]["api_version"] == "v1"
        csp = system.headers["Content-Security-Policy"]
        assert "default-src 'self'" in csp
        assert "connect-src 'self'" in csp
        assert "'sha256-" in csp
        assert "'unsafe-inline'" not in csp
        assert "http:" not in csp and "https:" not in csp
        assert "access-control-allow-origin" not in system.headers

        missing_origin = client.put(
            "/api/v1/preferences/appearance",
            headers={"Content-Type": "application/json", "Idempotency-Key": "missing-origin"},
            json={"generation": 0, "revision": 0, "value": {"theme": "dark"}},
        )
        assert missing_origin.status_code == 403
        assert missing_origin.json()["error"]["code"] == "origin_rejected"
        wrong_type = client.put(
            "/api/v1/preferences/appearance",
            headers={"Origin": ORIGIN, "Content-Type": "text/plain", "Idempotency-Key": "wrong-type"},
            content=b"{}",
        )
        assert wrong_type.status_code == 415
        assert wrong_type.json()["error"]["code"] == "json_required"
        rejected_host = client.get("http://example.test/api/v1/system")
        assert rejected_host.status_code == 400
        assert rejected_host.json()["error"]["code"] == "host_rejected"

    dashboard = create_dashboard_app(layout.root, tmp_path / "legacy-cache")
    with TestClient(dashboard) as legacy:
        assert legacy.get("/api/health").status_code == 200
        assert legacy.get("/api/v1/system").status_code == 404
    assert _snapshot(source) == source_before
    assert _snapshot(objects) == objects_before


def test_payload_limit_and_validation_use_common_error_envelope(tmp_path: Path) -> None:
    budgets = RequestBudgets(default_page_size=1, max_page_size=2, max_json_payload_bytes=80)
    _layout, config, static, source, objects = _foundation(tmp_path, budgets=budgets)
    source_before = _snapshot(source)
    objects_before = _snapshot(objects)

    with _client(config, static) as client:
        too_large = client.put(
            "/api/v1/preferences/appearance",
            headers=_mutation_headers("payload-large"),
            content=json.dumps({"generation": 0, "revision": 0, "value": "x" * 200}),
        )
        assert too_large.status_code == 413
        assert too_large.json()["error"]["code"] == "payload_too_large"
        invalid = client.put(
            "/api/v1/preferences/appearance",
            headers=_mutation_headers("payload-invalid"),
            json={"generation": -1, "revision": 0, "value": {}},
        )
        assert invalid.status_code == 422
        assert invalid.json()["error"]["code"] == "validation_error"
        invalid_name = client.post(
            "/api/v1/saved-views",
            headers=_mutation_headers("invalid-name"),
            json={"generation": 0, "name": "   ", "route": "/", "state": {}},
        )
        assert invalid_name.status_code == 422
        assert invalid_name.json()["error"]["details"]["errors"][0]["message"] == (
            "Value error, name must contain visible text"
        )
        missing_route = client.get("/api/v1/not-a-route")
        assert missing_route.status_code == 404
        assert missing_route.json()["error"]["code"] == "api_route_not_found"

    assert _snapshot(source) == source_before
    assert _snapshot(objects) == objects_before


def test_preferences_persist_with_generation_revision_and_idempotency(tmp_path: Path) -> None:
    _layout, config, static, source, objects = _foundation(tmp_path)
    source_before = _snapshot(source)
    objects_before = _snapshot(objects)
    payload = {"generation": 0, "revision": 0, "value": {"theme": "dark", "density": "compact"}}

    with _client(config, static) as client:
        first = client.put(
            "/api/v1/preferences/appearance",
            headers=_mutation_headers("appearance-first"),
            json=payload,
        )
        assert first.status_code == 200
        assert first.json()["meta"]["generation"] == 1
        assert first.json()["data"]["revision"] == 1
        replay = client.put(
            "/api/v1/preferences/appearance",
            headers=_mutation_headers("appearance-first"),
            json=payload,
        )
        assert replay.json() == first.json()
        conflict = client.put(
            "/api/v1/preferences/appearance",
            headers=_mutation_headers("appearance-first"),
            json={**payload, "value": {"theme": "light"}},
        )
        assert conflict.status_code == 409
        assert conflict.json()["error"]["code"] == "idempotency_conflict"

    with _client(config, static) as restarted:
        persisted = restarted.get("/api/v1/preferences").json()
        assert persisted["meta"]["generation"] == 1
        assert persisted["data"][0]["value"] == {"density": "compact", "theme": "dark"}
        stale_generation = restarted.put(
            "/api/v1/preferences/appearance",
            headers=_mutation_headers("appearance-stale-generation"),
            json={"generation": 0, "revision": 1, "value": {"theme": "light"}},
        )
        assert stale_generation.status_code == 409
        assert stale_generation.json()["error"]["code"] == "stale_generation"
        stale_revision = restarted.put(
            "/api/v1/preferences/appearance",
            headers=_mutation_headers("appearance-stale-revision"),
            json={"generation": 1, "revision": 0, "value": {"theme": "light"}},
        )
        assert stale_revision.status_code == 409
        assert stale_revision.json()["error"]["code"] == "stale_revision"

    assert _snapshot(source) == source_before
    assert _snapshot(objects) == objects_before


def test_saved_view_keyset_paging_update_delete_and_bad_cursor(tmp_path: Path) -> None:
    _layout, config, static, source, objects = _foundation(tmp_path)
    source_before = _snapshot(source)
    objects_before = _snapshot(objects)
    generation = 0
    created: list[dict[str, object]] = []

    with _client(config, static) as client:
        for index in range(3):
            result = client.post(
                "/api/v1/saved-views",
                headers=_mutation_headers(f"view-create-{index}"),
                json={"generation": generation, "name": f"View {index}", "route": "/", "state": {"index": index}},
            )
            assert result.status_code == 201
            generation = result.json()["meta"]["generation"]
            created.append(result.json()["data"])

        first_page = client.get("/api/v1/saved-views?limit=2").json()
        assert len(first_page["data"]) == 2
        assert first_page["page"]["next_cursor"]
        second_page = client.get(
            "/api/v1/saved-views",
            params={"limit": 2, "cursor": first_page["page"]["next_cursor"]},
        ).json()
        assert len(second_page["data"]) == 1
        assert {item["id"] for item in first_page["data"] + second_page["data"]} == {
            item["id"] for item in created
        }
        bad = client.get("/api/v1/saved-views?cursor=not-a-cursor")
        assert bad.status_code == 400
        assert bad.json()["error"]["code"] == "bad_cursor"

        target = created[0]
        updated = client.put(
            f"/api/v1/saved-views/{target['id']}",
            headers=_mutation_headers("view-update"),
            json={
                "generation": generation,
                "revision": target["revision"],
                "name": "Updated view",
                "route": "/settings/",
                "state": {"panel": "display"},
            },
        )
        assert updated.status_code == 200
        generation = updated.json()["meta"]["generation"]
        assert updated.json()["data"]["revision"] == 2
        deleted = client.request(
            "DELETE",
            f"/api/v1/saved-views/{target['id']}",
            headers=_mutation_headers("view-delete"),
            json={"generation": generation, "revision": 2},
        )
        assert deleted.status_code == 200
        remaining = client.get("/api/v1/saved-views?limit=10").json()["data"]
        assert target["id"] not in {item["id"] for item in remaining}

    plan = ApplicationStateStore(config).saved_view_query_plan(
        SavedViewCursor(str(created[-1]["updated_at"]), str(created[-1]["id"]))
    )
    assert any("idx_saved_views_active_page" in detail for detail in plan)
    assert not any("USE TEMP B-TREE" in detail for detail in plan)
    assert _snapshot(source) == source_before
    assert _snapshot(objects) == objects_before


def test_job_error_and_unavailable_legacy_fields_are_typed(tmp_path: Path) -> None:
    layout, config, static, source, objects = _foundation(tmp_path)
    source_before = _snapshot(source)
    objects_before = _snapshot(objects)
    db = ManifestDB(layout.database)
    try:
        now = utc_now()
        db.execute(
            """INSERT INTO background_jobs(
                   job_id,job_kind,subject_type,subject_id,phase,status,attempt,created_at,
                   heartbeat_at,progress_json,error_text,priority,max_attempts,control_state,queued_at,updated_at
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                "job-error",
                "asset_preprocess",
                "asset",
                "missing-asset",
                "preprocessing",
                "failed",
                2,
                now,
                now,
                json.dumps({"legacy_rate": {"value": None, "reason": "not recorded by this version"}}),
                "Decoder unavailable",
                40,
                3,
                "run",
                now,
                now,
            ),
        )
        db.commit()
    finally:
        db.close()

    with _client(config, static) as client:
        result = client.get("/api/v1/jobs/job-error")
        assert result.status_code == 200
        body = result.json()
        assert body["job"] == {"id": "job-error", "status": "failed", "phase": "preprocessing"}
        assert body["data"]["error"] == {"message": "Decoder unavailable"}
        assert body["unavailable"] == [
            {"field": "legacy_rate", "reason": "not recorded by this version"}
        ]
        missing = client.get("/api/v1/jobs/unknown")
        assert missing.status_code == 404
        assert missing.json()["error"]["code"] == "job_not_found"
        imports = client.get("/api/v1/imports")
        assert imports.status_code == 200
        assert imports.json()["data"] == []
        library = client.get("/api/v1/library")
        assert library.status_code == 202
        assert library.json()["job"]["phase"] == "library_catalog"
        assert library.json()["data"]["items"] == []

    assert _snapshot(source) == source_before
    assert _snapshot(objects) == objects_before


def test_review_api_reports_explicit_migration_required_state(tmp_path: Path) -> None:
    layout = VaultLayout(tmp_path / "vault-v6")
    layout.state.mkdir(parents=True)
    conn = sqlite3.connect(layout.database)
    try:
        initialize_manifest_connection(conn, target_version=6)
    finally:
        conn.close()
    inbox = tmp_path / "inbox"
    inbox.mkdir()
    static = tmp_path / "static"
    static.mkdir()
    (static / "index.html").write_text("review", encoding="utf-8")
    config = ReviewConfig(vault_root=layout.root, inbox_root=inbox)

    with _client(config, static) as client:
        assert client.get("/").status_code == 200
        result = client.get("/api/v1/system")
        assert result.status_code == 503
        assert result.json()["error"]["code"] == "migration_required"
        assert result.json()["error"]["details"] == {
            "found": 6,
            "required": SCHEMA_VERSION,
            "command": "media-vault migrate --vault <path>",
        }
