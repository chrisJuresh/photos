from __future__ import annotations

import hashlib
from pathlib import Path
from types import SimpleNamespace

from fastapi.testclient import TestClient

import media_vault.review_copy as review_copy_module
from media_vault.config import RequestBudgets, ReviewConfig
from media_vault.core import VaultLayout, hash_file, utc_now
from media_vault.db import ManifestDB
from media_vault.review_api import ApplicationStateStore, ImportCursor, create_review_app
from media_vault.review_copy import run_reviewed_copy_job
from media_vault.review_stage6 import run_stage6_job


ORIGIN = "http://127.0.0.1:8766"


def _file_evidence(path: Path) -> tuple[int, int, int, int, str]:
    stat = path.stat()
    return (
        stat.st_size,
        stat.st_mtime_ns,
        stat.st_ctime_ns,
        stat.st_mode,
        hashlib.sha256(path.read_bytes()).hexdigest(),
    )


def _headers(key: str) -> dict[str, str]:
    return {"Origin": ORIGIN, "Content-Type": "application/json", "Idempotency-Key": key}


def _seed_review_batch(tmp_path: Path) -> tuple[VaultLayout, ReviewConfig, Path, Path, str, tuple[str, str]]:
    inbox = tmp_path / "synthetic-inbox"
    batch_root = inbox / "camera-card"
    batch_root.mkdir(parents=True)
    excluded_source = batch_root / "exclude.jpg"
    included_source = batch_root / "include.jpg"
    excluded_source.write_bytes(b"synthetic excluded media payload")
    included_source.write_bytes(b"synthetic included media payload")

    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    canonical = layout.objects / "sha256" / "aa" / "bb" / "existing.blob"
    canonical.parent.mkdir(parents=True)
    canonical.write_bytes(b"pre-existing immutable canonical object")
    config = ReviewConfig(
        vault_root=layout.root,
        inbox_root=inbox,
        request_budgets=RequestBudgets(default_page_size=20, max_page_size=500),
    )
    db = ManifestDB(layout.database)
    try:
        now = utc_now()
        batch_id = "batch-stage6"
        root_id = "folder-root"
        db.execute(
            """INSERT INTO import_batches(
                   batch_id,inbox_root_text,batch_root_text,batch_name,status,discovery_generation,
                   revision,traversal_complete,discovered_item_count,file_count,folder_count,total_bytes,
                   included_count,classification_counts_json,match_outcome_counts_json,
                   created_at,updated_at,review_ready_at
               ) VALUES(?,?,?,?,?,1,0,1,3,2,1,?,2,?,?, ?,?,?)""",
            (
                batch_id,
                str(inbox),
                str(batch_root),
                "camera-card",
                "awaiting_review",
                excluded_source.stat().st_size + included_source.stat().st_size,
                '{"folder":1,"photo":2}',
                '{"new_asset":2,"not_applicable":1}',
                now,
                now,
                now,
            ),
        )
        db.execute(
            """INSERT INTO import_items(
                   item_id,batch_id,relative_path_text,path_text,parent_relative_path_text,entry_kind,
                   first_seen_at,last_seen_at,last_seen_generation,classification,proposed_decision,
                   effective_decision,hash_status,match_outcome
               ) VALUES(?,?,?,?,?,'folder',?,?,1,'folder','not_applicable','not_applicable','not_applicable','not_applicable')""",
            (root_id, batch_id, ".", str(batch_root), None, now, now),
        )
        item_ids: list[str] = []
        for index, source in enumerate((excluded_source, included_source), start=1):
            item_id = f"item-{index}"
            item_ids.append(item_id)
            stat = source.stat()
            hashes = hash_file(source)
            db.execute(
                """INSERT INTO import_items(
                       item_id,batch_id,relative_path_text,path_text,parent_relative_path_text,entry_kind,
                       first_seen_at,last_seen_at,last_seen_generation,stat_size_bytes,stat_mtime_ns,
                       stat_ctime_ns,stat_device_id,stat_file_id,stat_mode,stat_attributes,classification,
                       media_kind,extension_text,signature_kind,mime_type,detected_format,discovery_basis,
                       hash_status,hashed_size_bytes,sha256,blake3,sha512,match_outcome,proposed_decision,
                       effective_decision,copy_status
                   ) VALUES(?,?,?,?,?,'file',?,?,1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'verified',?,?,?,?,
                            'new_asset','include','include','not_approved')""",
                (
                    item_id,
                    batch_id,
                    source.name,
                    str(source),
                    ".",
                    now,
                    now,
                    stat.st_size,
                    stat.st_mtime_ns,
                    stat.st_ctime_ns,
                    str(stat.st_dev),
                    str(stat.st_ino),
                    stat.st_mode,
                    getattr(stat, "st_file_attributes", None),
                    "photo",
                    "photo",
                    ".jpg",
                    "jpeg",
                    "image/jpeg",
                    "JPEG",
                    "synthetic_fixture",
                    hashes.size_bytes,
                    hashes.sha256,
                    hashes.blake3,
                    hashes.sha512,
                ),
            )
            derivative = config.derivative_root / "review" / f"{item_id}.webp"
            derivative.parent.mkdir(parents=True, exist_ok=True)
            derivative.write_bytes(f"persisted derivative {item_id}".encode())
            derivative_stat = derivative.stat()
            db.execute(
                """INSERT INTO derivatives(
                       derivative_id,subject_type,subject_id,import_item_id,derivative_kind,
                       representation_kind,long_edge,analyzer_version,input_identity,status,is_current,
                       width,height,mime_type,checksum_sha256,byte_size,file_mtime_ns,relative_path_text,
                       created_at,started_at,completed_at,updated_at
                   ) VALUES(?, 'import_item', ?, ?, 'review_preview', 'source', 384, ?, ?, 'ready', 1,
                            32, 32, 'image/webp', ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    f"derivative-{item_id}",
                    item_id,
                    item_id,
                    config.analyzer_versions.review_derivative,
                    f"input-{item_id}",
                    hashlib.sha256(derivative.read_bytes()).hexdigest(),
                    derivative_stat.st_size,
                    derivative_stat.st_mtime_ns,
                    str(derivative.relative_to(config.derivative_root)),
                    now,
                    now,
                    now,
                    now,
                ),
            )
        db.execute(
            """INSERT INTO import_folder_progress(
                   batch_id,folder_item_id,relative_path_text,parent_relative_path_text,phase,
                   discovery_generation,direct_item_count,subtree_item_count,subtree_file_count,
                   subtree_folder_count,subtree_bytes,included_count,updated_at
               ) VALUES(?,?,?,?,'awaiting_review',1,3,3,2,1,?,2,?)""",
            (
                batch_id,
                root_id,
                ".",
                None,
                excluded_source.stat().st_size + included_source.stat().st_size,
                now,
            ),
        )
        db.execute(
            """INSERT INTO import_progress_samples(
                   batch_id,recorded_at,phase,status,discovered_count,processed_count,skipped_count,
                   failed_count,duplicate_count,paired_count,remaining_count,scanned_bytes,
                   transferred_bytes,verified_bytes,remaining_bytes,current_throughput_bps,
                   ewma_throughput_bps,eta_seconds,eta_confidence,observed_read_bps,
                   observed_write_bps,queue_depth,busy_workers,total_workers,storage_consumed_bytes,
                   projected_final_bytes,metrics_json
               ) VALUES(?,?, 'awaiting_review','ready',2,0,0,0,0,0,2,?,?,0,?,0,0,NULL,'learning',
                        NULL,NULL,0,0,1,0,?,'{}')""",
            (batch_id, now, excluded_source.stat().st_size + included_source.stat().st_size, 0,
             excluded_source.stat().st_size + included_source.stat().st_size,
             excluded_source.stat().st_size + included_source.stat().st_size),
        )
        db.execute(
            """INSERT INTO import_events(batch_id,occurred_at,level,event_type,phase,message,evidence_json)
               VALUES(?,?,'info','manifest_ready','awaiting_review','Manifest is ready','{}')""",
            (batch_id, now),
        )
        db.execute(
            """INSERT INTO import_errors(
                   batch_id,occurred_at,phase,code,cause_text,context_json,retryable,suggested_resolution
               ) VALUES(?,?,'matching','unusual_extension','Synthetic warning','{}',1,'Review the item')""",
            (batch_id, now),
        )
        db.commit()
    finally:
        db.close()
    static = tmp_path / "static"
    static.mkdir()
    (static / "index.html").write_text("review", encoding="utf-8")
    return layout, config, static, canonical, batch_id, (item_ids[0], item_ids[1])


def test_stage6_import_api_materialization_controls_and_verified_copy_are_immutable(
    tmp_path: Path,
    monkeypatch,
) -> None:
    layout, config, static, existing_canonical, batch_id, item_ids = _seed_review_batch(tmp_path)
    source_paths = tuple((config.inbox_root / "camera-card").glob("*.jpg"))
    source_before = {path.name: _file_evidence(path) for path in source_paths}
    canonical_before = _file_evidence(existing_canonical)
    def measured_space(_path: Path) -> SimpleNamespace:
        return SimpleNamespace(free=100 * 1024**3)

    monkeypatch.setattr(review_copy_module, "disk_usage_for", measured_space)

    with TestClient(create_review_app(config, static_root=static), base_url=ORIGIN) as client:
        history = client.get("/api/v1/imports?limit=20")
        assert history.status_code == 200
        assert history.json()["data"][0]["name"] == "camera-card"
        assert history.json()["data"][0]["counts"]["discovered"] == 3
        detail = client.get(f"/api/v1/imports/{batch_id}").json()["data"]
        assert detail["status"] == "awaiting_review"
        folder = client.get(f"/api/v1/imports/{batch_id}/folders").json()["data"][0]
        assert folder["relative_path_text"] == "."
        assert folder["subtree_item_count"] == detail["counts"]["discovered"] == 3
        assert client.get(f"/api/v1/imports/{batch_id}/samples").json()["data"][0]["eta_confidence"] == "learning"
        assert client.get(f"/api/v1/imports/{batch_id}/events").json()["data"][0]["event_type"] == "manifest_ready"
        assert client.get(f"/api/v1/imports/{batch_id}/errors").json()["data"][0]["retryable"] == 1

        direct = client.get(f"/api/v1/imports/{batch_id}/manifest?limit=20")
        assert direct.status_code == 200
        assert len(direct.json()["data"]["items"]) == folder["subtree_item_count"]
        preview = client.get(f"/api/v1/imports/{batch_id}/items/{item_ids[1]}/preview")
        assert preview.status_code == 200
        assert preview.headers["cache-control"] == "public, max-age=31536000, immutable"

        decision = client.put(
            f"/api/v1/imports/{batch_id}/decisions",
            headers=_headers("exclude-first"),
            json={
                "generation": 0,
                "batch_revision": 0,
                "decisions": [{"item_id": item_ids[0], "decision": "exclude", "expected_revision": 0}],
            },
        )
        assert decision.status_code == 200
        generation = decision.json()["meta"]["generation"]
        batch_revision = decision.json()["data"]["decisions"][0]["batch_revision"]

        arbitrary = client.get(
            f"/api/v1/imports/{batch_id}/manifest",
            params={"search": "include", "sort": "size:desc", "limit": 20},
        )
        assert arbitrary.status_code == 202
        view_job = arbitrary.json()["job"]["id"]
        run_stage6_job(config, view_job, "import_manifest_materialize")
        run_stage6_job(config, view_job, "import_manifest_materialize")
        assert client.get(f"/api/v1/jobs/{view_job}").json()["data"]["attempt"] == 1
        ready = client.get(
            f"/api/v1/imports/{batch_id}/manifest",
            params={"search": "include", "sort": "size:desc", "limit": 20},
        )
        assert ready.status_code == 200
        assert [item["id"] for item in ready.json()["data"]["items"]] == [item_ids[1]]

        preflight_response = client.post(
            f"/api/v1/imports/{batch_id}/approval-preflight",
            headers=_headers("preflight"),
            json={"generation": generation, "batch_revision": batch_revision},
        )
        assert preflight_response.status_code == 202
        generation = preflight_response.json()["meta"]["generation"]
        preflight_job = preflight_response.json()["job"]["id"]
        run_stage6_job(config, preflight_job, "import_approval_preflight")
        preflight = client.get(f"/api/v1/jobs/{preflight_job}").json()["data"]
        assert preflight["progress"]["summary"]["included_count"] == 1
        assert preflight["progress"]["summary"]["excluded_count"] == 1
        restored_preflight = client.get(f"/api/v1/imports/{batch_id}").json()["data"]["preflight_job"]
        assert restored_preflight["id"] == preflight_job
        assert restored_preflight["progress"]["summary"] == preflight["progress"]["summary"]

        def request_time_disk_usage_forbidden(_path: Path) -> None:
            raise AssertionError("HTTP approval/execute must consume persisted capacity evidence")

        monkeypatch.setattr(review_copy_module, "disk_usage_for", request_time_disk_usage_forbidden)

        approved = client.post(
            f"/api/v1/imports/{batch_id}/approve",
            headers=_headers("approve"),
            json={
                "generation": generation,
                "batch_revision": batch_revision,
                "preflight_job_id": preflight_job,
                "confirm": True,
            },
        )
        assert approved.status_code == 200
        generation = approved.json()["meta"]["generation"]
        approval_id = approved.json()["data"]["approval_id"]
        assert approved.json()["data"]["excluded_count"] == 1

        execute = client.post(
            f"/api/v1/imports/{batch_id}/execute",
            headers=_headers("execute"),
            json={"generation": generation, "approval_id": approval_id, "execute": True},
        )
        assert execute.status_code == 202
        generation = execute.json()["meta"]["generation"]
        execute_job = execute.json()["job"]["id"]
        monkeypatch.setattr(review_copy_module, "disk_usage_for", measured_space)
        run_stage6_job(config, execute_job, "reviewed_execute")
        copy_job = client.get(f"/api/v1/jobs/{execute_job}").json()["data"]["progress"]["copy_job_id"]

        paused = client.post(
            f"/api/v1/imports/{batch_id}/control",
            headers=_headers("pause"),
            json={"generation": generation, "action": "pause"},
        )
        assert paused.status_code == 200
        generation = paused.json()["meta"]["generation"]
        resumed = client.post(
            f"/api/v1/imports/{batch_id}/control",
            headers=_headers("resume"),
            json={"generation": generation, "action": "resume"},
        )
        assert resumed.status_code == 200

    result = run_reviewed_copy_job(config, copy_job, worker_id="stage6-test", allow_unsafe_atime=True)
    assert result.status == "complete"
    assert result.copied_count == 1
    assert result.verified_bytes == source_paths[1].stat().st_size
    assert {path.name: _file_evidence(path) for path in source_paths} == source_before
    assert _file_evidence(existing_canonical) == canonical_before
    assert len(list(layout.objects.rglob("*.blob"))) == 2

    plan = ApplicationStateStore(config).import_history_query_plan(
        ImportCursor("import_history", (utc_now(), "zzzz"))
    )
    assert any("idx_import_batches_history_page" in detail for detail in plan)
    assert not any("USE TEMP B-TREE" in detail for detail in plan)
    db = ManifestDB(layout.database)
    try:
        materialized_plan = tuple(
            str(row[3])
            for row in db.all(
                """EXPLAIN QUERY PLAN SELECT item_id FROM import_manifest_view_items
                     WHERE view_id=? AND ordinal>? ORDER BY ordinal LIMIT 101""",
                (ready.json()["data"]["view"] or arbitrary.json()["data"]["view"]["id"], -1),
            )
        )
        assert any("sqlite_autoindex_import_manifest_view_items_1" in detail for detail in materialized_plan)
        assert not any("USE TEMP B-TREE" in detail for detail in materialized_plan)
    finally:
        db.close()


def test_import_api_rejects_stale_decisions_bad_sorts_and_arbitrary_paths(tmp_path: Path) -> None:
    layout, config, static, _canonical, batch_id, item_ids = _seed_review_batch(tmp_path)
    db = ManifestDB(layout.database)
    try:
        now = utc_now()
        for suffix in ("b", "c"):
            root = config.inbox_root / f"extra-{suffix}"
            root.mkdir()
            db.execute(
                """INSERT INTO import_batches(
                       batch_id,inbox_root_text,batch_root_text,batch_name,status,created_at,updated_at
                   ) VALUES(?,?,?,?, 'complete',?,?)""",
                (f"batch-extra-{suffix}", str(config.inbox_root), str(root), f"extra-{suffix}", now, now),
            )
        db.commit()
    finally:
        db.close()
    with TestClient(create_review_app(config, static_root=static), base_url=ORIGIN) as client:
        first_page = client.get("/api/v1/imports?limit=2").json()
        assert len(first_page["data"]) == 2
        assert first_page["page"]["next_cursor"]
        second_page = client.get(
            "/api/v1/imports",
            params={"limit": 2, "cursor": first_page["page"]["next_cursor"]},
        ).json()
        assert len(second_page["data"]) == 1
        compared = client.get(
            "/api/v1/imports/compare",
            params=[("batch_id", "batch-extra-b"), ("batch_id", "batch-extra-c")],
        )
        assert compared.status_code == 200
        assert [item["name"] for item in compared.json()["data"]] == ["extra-b", "extra-c"]
        stale = client.put(
            f"/api/v1/imports/{batch_id}/decisions",
            headers=_headers("stale"),
            json={
                "generation": 0,
                "batch_revision": 99,
                "decisions": [{"item_id": item_ids[0], "decision": "exclude", "expected_revision": 0}],
            },
        )
        assert stale.status_code == 409
        assert stale.json()["error"]["code"] == "stale_revision"
        bad_sort = client.get(f"/api/v1/imports/{batch_id}/manifest?sort=secret_path:asc")
        assert bad_sort.status_code == 400
        assert bad_sort.json()["error"]["code"] == "invalid_manifest_sort"
        wrong_item = client.get(f"/api/v1/imports/{batch_id}/items/unknown/preview")
        assert wrong_item.status_code == 404
        assert wrong_item.json()["error"]["code"] == "preview_unavailable"


def test_discovery_endpoint_only_enqueues_background_scan_and_preserves_source(tmp_path: Path) -> None:
    inbox = tmp_path / "inbox"
    batch_root = inbox / "phone-drop"
    batch_root.mkdir(parents=True)
    source = batch_root / "notes.txt"
    source.write_text("synthetic non-media evidence", encoding="utf-8")
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    existing = layout.objects / "sha256" / "aa" / "bb" / "existing.blob"
    existing.parent.mkdir(parents=True)
    existing.write_bytes(b"existing canonical")
    db = ManifestDB(layout.database)
    db.close()
    config = ReviewConfig(vault_root=layout.root, inbox_root=inbox)
    static = tmp_path / "static"
    static.mkdir()
    (static / "index.html").write_text("review", encoding="utf-8")
    source_before = _file_evidence(source)
    canonical_before = _file_evidence(existing)

    with TestClient(create_review_app(config, static_root=static), base_url=ORIGIN) as client:
        queued = client.post(
            "/api/v1/imports/discover",
            headers=_headers("discover"),
            json={"generation": 0, "reuse_unchanged": True},
        )
        assert queued.status_code == 202
        job_id = queued.json()["job"]["id"]
        assert queued.json()["data"]["media_publication"].startswith("none")
        run_stage6_job(config, job_id, "inbox_scan", allow_unsafe_atime=True)
        state = client.get(f"/api/v1/jobs/{job_id}").json()["data"]
        assert state["status"] == "completed"
        history = client.get("/api/v1/imports").json()["data"]
        assert [batch["name"] for batch in history] == ["phone-drop"]

    assert _file_evidence(source) == source_before
    assert _file_evidence(existing) == canonical_before
    assert len(list(layout.objects.rglob("*.blob"))) == 1
