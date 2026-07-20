from __future__ import annotations

import json
import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from media_vault.core import VaultLayout, process_is_alive
from media_vault.db import SCHEMA_VERSION, ManifestDB
from media_vault.ui_server import create_dashboard_app


def _synthetic_vault(root: Path) -> VaultLayout:
    layout = VaultLayout(root / "vault")
    layout.create()
    db = ManifestDB(layout.database)
    try:
        db.execute(
            """INSERT INTO runs(
                   run_id,command,status,started_at,completed_at,source_root,vault_root,host,
                   tool_version,arguments_json,summary_json
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
            (
                "run-test", "preflight", "completed", "2026-07-20T00:00:00Z", "2026-07-20T00:01:00Z",
                str(root / "immutable-source"), str(layout.root), "test-host", "1.0.0", "{}", "{}",
            ),
        )
        hashes = ("a" * 64, "b" * 64, "c" * 128)
        db.execute(
            """INSERT INTO exact_groups(
                   exact_group_id,size_bytes,sha256,blake3,sha512,verification_method,created_at
               ) VALUES(?,?,?,?,?,?,?)""",
            ("eg_test", 123, *hashes, "triple_hash_plus_full_byte_compare", "2026-07-20T00:00:30Z"),
        )
        db.execute(
            """INSERT INTO assets(
                   asset_id,exact_group_id,size_bytes,sha256,blake3,sha512,hash_algorithm_versions_json,
                   media_kind,mime_type,detected_format,preferred_extension,object_relpath,object_status,
                   created_run_id,created_at,updated_at
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                "asset_test", "eg_test", 123, *hashes, json.dumps({"sha256": "sha256"}), "image",
                "image/jpeg", "JPEG", ".jpg", "objects/aa/asset_test.jpg", "missing", "run-test",
                "2026-07-20T00:00:30Z", "2026-07-20T00:00:30Z",
            ),
        )
        db.commit()
    finally:
        db.close()
    return layout


def test_dashboard_is_read_only_and_serves_ui(tmp_path: Path) -> None:
    layout = _synthetic_vault(tmp_path)
    database_before = layout.database.read_bytes()
    app = create_dashboard_app(layout.root, tmp_path / "cache")

    with TestClient(app) as client:
        root = client.get("/")
        assert root.status_code == 200
        assert "Media Vault" in root.text
        assert client.get("/static/app.js").status_code == 200
        health = client.get("/api/health").json()
        assert health["read_only"] is True
        rejected = client.post("/api/health")
        assert rejected.status_code == 405
        assert rejected.json()["detail"] == "Dashboard is strictly read-only"

    assert layout.database.read_bytes() == database_before
    assert not (tmp_path / "cache").exists()


def test_dashboard_manifest_endpoints(tmp_path: Path) -> None:
    layout = _synthetic_vault(tmp_path)
    app = create_dashboard_app(layout.root, tmp_path / "cache")

    with TestClient(app) as client:
        overview = client.get("/api/overview").json()
        assert overview["deferred"] is False
        assert overview["assets"] == {"count": 1, "bytes": 123}
        assets = client.get("/api/assets").json()
        assert assets["items"][0]["asset_id"] == "asset_test"
        assert client.get("/api/sources").status_code == 200
        assert client.get("/api/duplicates").status_code == 200
        assert client.get("/api/relationships").status_code == 200
        assert client.get("/api/raw-jpeg-groups").status_code == 200
        assert client.get("/api/warnings").status_code == 200
        detail = client.get("/api/assets/asset_test").json()
        assert detail["asset"]["sha256"] == "a" * 64
        assert client.get("/api/runs").json()["items"][0]["run_id"] == "run-test"
        schema = client.get("/api/schema").json()
        assert schema["schema_version"] == str(SCHEMA_VERSION)
        assert "assets" in schema["tables"]


def test_dashboard_rejects_cache_inside_vault(tmp_path: Path) -> None:
    layout = _synthetic_vault(tmp_path)
    with pytest.raises(ValueError, match="outside the destination vault"):
        create_dashboard_app(layout.root, layout.root / "dashboard-cache")


def test_process_liveness_handles_windows_missing_pid_shape() -> None:
    assert process_is_alive(os.getpid()) is True
    assert process_is_alive(-1) is False
