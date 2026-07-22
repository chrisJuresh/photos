from __future__ import annotations

import hashlib
import io
import json
import shutil
import sqlite3
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from media_vault.config import ReviewConfig, WorkerLimits
from media_vault.core import VaultLayout, hash_stream, stable_id, utc_now
from media_vault.db import ManifestDB, initialize_manifest_connection
from media_vault.migrations import migrate_vault
from media_vault.review_api import create_review_app
from media_vault.review_backfill import (
    STAGE11_JOB_KINDS,
    audit_release_state,
    control_vault_backfill,
    current_backfill,
    estimate_backfill_eta,
    ensure_vault_backfill,
    recover_interrupted_stage11_jobs,
    run_vault_backfill_job,
)
from media_vault.review_runtime import run_worker_loop
from media_vault.vault_ops import export_manifest, rebuild_recovery_index, sync_all_sidecars


def _snapshot(root: Path) -> dict[str, tuple[int, int, int, int, str]]:
    result: dict[str, tuple[int, int, int, int, str]] = {}
    for path in sorted(item for item in root.rglob("*") if item.is_file()):
        stat = path.stat()
        result[str(path.relative_to(root))] = (
            stat.st_size,
            stat.st_mtime_ns,
            stat.st_ctime_ns,
            stat.st_mode,
            hashlib.sha256(path.read_bytes()).hexdigest(),
        )
    return result


def _image_bytes() -> bytes:
    output = io.BytesIO()
    image = Image.new("RGB", (96, 72), (35, 90, 140))
    try:
        image.save(output, format="PNG")
    finally:
        image.close()
    return output.getvalue()


def _seed_v2(layout: VaultLayout, source: Path) -> str:
    layout.create()
    content = _image_bytes()
    source_file = source / "Unicode-Δ" / ("long-" + "x" * 20) / ("prepared-" + "x" * 20 + "-雪.png")
    source_file.parent.mkdir(parents=True)
    source_file.write_bytes(content)
    hashes = hash_stream(io.BytesIO(content))
    object_path = layout.root / hashes.object_relpath
    object_path.parent.mkdir(parents=True, exist_ok=True)
    object_path.write_bytes(content)
    conn = sqlite3.connect(layout.database)
    conn.row_factory = sqlite3.Row
    initialize_manifest_connection(conn, target_version=2)
    now = utc_now()
    run_id = "legacy-import-run"
    source_root_id = stable_id("sr1", str(source))
    source_file_id = stable_id("sf1", source_root_id, str(source_file))
    conn.execute(
        """INSERT INTO runs(
               run_id,command,status,started_at,completed_at,source_root,vault_root,host,tool_version,
               arguments_json,summary_json
           ) VALUES(?,'import','completed',?,?,?,?,?,'test','{}',?)""",
        (run_id, now, now, str(source), str(layout.root), "test", json.dumps({"copied": 1})),
    )
    conn.execute(
        "INSERT INTO source_roots VALUES(?,?,?,?,?)",
        (source_root_id, str(source), now, now, run_id),
    )
    conn.execute(
        """INSERT INTO source_files(
               source_file_id,source_root_id,path_text,relative_path_text,first_seen_at,last_seen_at,
               last_seen_run_id,present,size_bytes,mtime_ns,ctime_ns,current_version_id,discovery_status,
               media_kind,asset_id
           ) VALUES(?,?,?,?,?,?,?,1,?,?,?,NULL,'media','image',?)""",
        (
            source_file_id,
            source_root_id,
            str(source_file),
            str(source_file.relative_to(source)),
            now,
            now,
            run_id,
            len(content),
            source_file.stat().st_mtime_ns,
            source_file.stat().st_ctime_ns,
            hashes.asset_id,
        ),
    )
    cursor = conn.execute(
        """INSERT INTO source_versions(
               source_file_id,observed_run_id,observed_at,size_bytes,mtime_ns,ctime_ns,extension_text,
               discovery_status,discovery_basis,media_kind,mime_type,detected_format,asset_id,hash_status,
               metadata_status,metadata_json,normalized_metadata_json,warnings_json
           ) VALUES(?,?,?,?,?,? ,'.png','media','synthetic','image','image/png','PNG',?,'verified',
                    'ready','{}','{}','[]')""",
        (
            source_file_id,
            run_id,
            now,
            len(content),
            source_file.stat().st_mtime_ns,
            source_file.stat().st_ctime_ns,
            hashes.asset_id,
        ),
    )
    version_id = int(cursor.lastrowid)
    conn.execute("UPDATE source_files SET current_version_id=? WHERE source_file_id=?", (version_id, source_file_id))
    conn.execute(
        """INSERT INTO exact_groups(
               exact_group_id,size_bytes,sha256,blake3,sha512,verification_method,created_at
           ) VALUES(?,?,?,?,?,'synthetic',?)""",
        (hashes.exact_group_id, *hashes.identity_key, now),
    )
    conn.execute(
        """INSERT INTO assets(
               asset_id,exact_group_id,size_bytes,sha256,blake3,sha512,hash_algorithm_versions_json,
               media_kind,mime_type,detected_format,preferred_extension,width,height,camera_make,camera_model,
               lens_model,capture_time_text,capture_time_source,metadata_json,object_relpath,object_status,
               object_verified_at,created_run_id,created_at,updated_at,warnings_json
           ) VALUES(?,?,?,?,?,?,'{}','image','image/png','PNG','.png',96,72,'Synthetic','Unicode Camera',
                    'Release Lens','2026-07-22T10:00:00Z','synthetic','{}',?,'verified',?,?,?,?,'[]')""",
        (
            hashes.asset_id,
            hashes.exact_group_id,
            *hashes.identity_key,
            hashes.object_relpath,
            now,
            run_id,
            now,
            now,
        ),
    )
    conn.execute(
        "INSERT INTO asset_sources VALUES(?,?,?, ?,1)",
        (hashes.asset_id, version_id, "synthetic", now),
    )
    conn.execute(
        """INSERT INTO destinations(
               destination_id,asset_id,path_text,status,size_bytes,sha256,blake3,sha512,
               copied_from_source_version_id,copy_started_at,verified_at,last_validation_run_id
           ) VALUES(?,?,?,'verified',?,?,?,?,?,?,?,?)""",
        (
            stable_id("dst1", hashes.asset_id, str(object_path)),
            hashes.asset_id,
            str(object_path),
            *hashes.identity_key,
            version_id,
            now,
            now,
            run_id,
        ),
    )
    conn.commit()
    conn.close()
    return hashes.asset_id


def _headers(key: str) -> dict[str, str]:
    return {
        "Origin": "http://127.0.0.1",
        "Content-Type": "application/json",
        "Idempotency-Key": key,
    }


def test_copied_v2_full_backfill_is_resumable_immutable_and_release_auditable(tmp_path: Path) -> None:
    source = tmp_path / "immutable-source"
    source.mkdir()
    original = VaultLayout(tmp_path / "original-vault")
    asset_id = _seed_v2(original, source)
    source_before = _snapshot(source)
    original_objects_before = _snapshot(original.objects)

    copied = VaultLayout(tmp_path / "copied-vault")
    shutil.copytree(original.root, copied.root)
    copied_objects_before = _snapshot(copied.objects)
    migration = migrate_vault(copied)
    assert migration.previous_version == 2
    assert migration.schema_version == 12
    assert migration.backup is not None

    config = ReviewConfig(
        vault_root=copied.root,
        inbox_root=tmp_path / "synthetic-inbox",
        workers=WorkerLimits(backfill_batch_size=1),
    )
    db = ManifestDB(copied.database)
    backfill = ensure_vault_backfill(db, config)
    backfill_id = str(backfill["id"])
    db.commit()
    db.close()

    assert run_worker_loop(config, once=True).last_job_id == backfill_id
    db = ManifestDB(copied.database)
    state = current_backfill(db)
    child_id = state["progress"]["active_job_ids"][0]
    assert db.one("SELECT priority FROM background_jobs WHERE job_id=?", (child_id,))["priority"] == 5
    db.execute("UPDATE background_jobs SET status='running' WHERE job_id=?", (backfill_id,))
    db.commit()
    db.close()
    assert recover_interrupted_stage11_jobs(config) == (backfill_id,)

    db = ManifestDB(copied.database)
    paused = control_vault_backfill(db, "pause")
    db.commit()
    assert paused["status"] == "paused"
    db.close()
    assert run_worker_loop(config, once=True).idle is True
    db = ManifestDB(copied.database)
    resumed = control_vault_backfill(db, "resume")
    db.commit()
    assert resumed["status"] == "queued"
    db.close()

    for _index in range(40):
        worker = run_worker_loop(config, once=True)
        db = ManifestDB(copied.database)
        state = current_backfill(db)
        db.close()
        if state["status"] == "completed":
            break
        assert worker.failed == 0
    assert state["status"] == "completed"
    assert set(state["progress"]["completed_phases"]) == {
        "preprocessing",
        "catalog",
        "organization",
        "stacks",
        "junk",
        "legacy_history",
    }
    assert state["progress"]["asset_jobs_completed"] == 1
    assert state["progress"]["asset_timing_sample_count"] == 1
    assert state["progress"]["eta_seconds"] == 0
    assert state["progress"]["eta_confidence"] == "learning"
    assert state["progress"]["legacy_history_count"] == 1

    db = ManifestDB(copied.database)
    assert db.one("SELECT status FROM asset_extended_metadata WHERE asset_id=?", (asset_id,))["status"] == "ready"
    assert db.one("SELECT status FROM asset_features WHERE asset_id=?", (asset_id,))["status"] == "ready"
    assert db.one("SELECT status FROM materialized_views WHERE view_kind='library_catalog' AND is_current=1")[
        "status"
    ] == "ready"
    assert db.one("SELECT status FROM materialized_views WHERE view_kind='organization_rollups' AND is_current=1")[
        "status"
    ] == "ready"
    assert db.one("SELECT status FROM stack_profiles WHERE is_default=1 AND is_current=1")["status"] == "ready"
    assert db.one("SELECT status FROM junk_profiles WHERE is_default=1 AND is_current=1")["status"] == "ready"
    assert db.one("SELECT COUNT(*) AS count FROM legacy_import_history")["count"] == 1
    sync_count = sync_all_sidecars(db, copied)
    exported = export_manifest(db, copied, "legacy-import-run")
    db.close()
    assert sync_count == 1
    assert Path(exported["jsonl"]).is_file()

    recovery = tmp_path / "recovery.sqlite3"
    rebuilt = rebuild_recovery_index(copied, recovery)
    assert rebuilt["sidecars"] == 1
    assert rebuilt["verified_objects"] == 1
    audit = audit_release_state(config)
    assert audit["integrity_check"] == "ok"
    assert audit["foreign_key_issues"] == 0
    assert audit["ready_derivative_count"] >= 1
    assert audit["derivative_checksum_errors"] == []
    assert audit["stale_materialization_kinds"] == []
    assert audit["backfill"]["status"] == "completed"

    assert _snapshot(source) == source_before
    assert _snapshot(original.objects) == original_objects_before
    assert _snapshot(copied.objects) == copied_objects_before


def test_backfill_api_is_persisted_idempotent_and_media_free(tmp_path: Path, monkeypatch) -> None:
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    db = ManifestDB(layout.database)
    db.close()
    config = ReviewConfig(vault_root=layout.root, inbox_root=tmp_path / "inbox")
    client = TestClient(create_review_app(config), base_url="http://127.0.0.1")

    initial = client.get("/api/v1/backfill")
    assert initial.status_code == 200
    assert initial.json()["data"]["status"] == "not_started"
    generation = initial.json()["meta"]["generation"]

    def forbidden(*_args, **_kwargs):
        raise AssertionError("HTTP backfill control must not open, decode, hash, or analyze media")

    monkeypatch.setattr(Path, "open", forbidden)
    started = client.post(
        "/api/v1/backfill/control",
        headers=_headers("backfill-start"),
        json={"generation": generation, "action": "start", "restart": False},
    )
    assert started.status_code == 202
    body = started.json()
    assert body["data"]["status"] == "queued"
    assert body["data"]["progress"]["asset_total"] is None
    replay = client.post(
        "/api/v1/backfill/control",
        headers=_headers("backfill-start"),
        json={"generation": generation, "action": "start", "restart": False},
    )
    assert replay.json() == body

    paused = client.post(
        "/api/v1/backfill/control",
        headers=_headers("backfill-pause"),
        json={"generation": body["meta"]["generation"], "action": "pause", "restart": False},
    )
    assert paused.status_code == 202
    assert paused.json()["data"]["status"] == "paused"
    resumed = client.post(
        "/api/v1/backfill/control",
        headers=_headers("backfill-resume"),
        json={
            "generation": paused.json()["meta"]["generation"],
            "action": "resume",
            "restart": False,
        },
    )
    assert resumed.status_code == 202
    assert resumed.json()["data"]["status"] == "queued"
    assert client.get(f"/api/v1/jobs/{body['data']['id']}").json()["data"]["kind"] == "vault_backfill"
    assert STAGE11_JOB_KINDS <= {"vault_backfill"}


def test_concurrent_pause_is_not_overwritten_by_coordinator_slice(tmp_path: Path, monkeypatch) -> None:
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    db = ManifestDB(layout.database)
    config = ReviewConfig(vault_root=layout.root, inbox_root=tmp_path / "inbox")
    state = ensure_vault_backfill(db, config)
    db.commit()
    db.close()

    def pause_during_slice(*_args, **_kwargs):
        other = ManifestDB(layout.database)
        now = utc_now()
        other.execute(
            """UPDATE background_jobs SET status='paused',control_state='pause',updated_at=?
                 WHERE job_id=?""",
            (now, state["id"]),
        )
        other.commit()
        other.close()
        return False

    monkeypatch.setattr("media_vault.review_backfill._advance_backfill", pause_during_slice)
    run_vault_backfill_job(config, state["id"])

    db = ManifestDB(layout.database)
    paused = current_backfill(db)
    assert paused["status"] == "paused"
    assert paused["control_state"] == "pause"
    resumed = control_vault_backfill(db, "resume")
    db.commit()
    assert resumed["status"] == "queued"
    assert resumed["control_state"] == "run"
    db.close()


def test_backfill_eta_uses_bounded_completed_asset_rates() -> None:
    learning = estimate_backfill_eta([10.0, 10.0], 100)
    assert learning["eta_seconds"] == pytest.approx(1000)
    assert learning["eta_confidence"] == "learning"

    stable = estimate_backfill_eta([10.0] * 10, 100)
    assert stable["asset_ewma_rate_per_second"] == pytest.approx(0.1)
    assert stable["eta_seconds"] == pytest.approx(1000)
    assert stable["eta_confidence"] == "high"
