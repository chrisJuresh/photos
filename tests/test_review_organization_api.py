from __future__ import annotations

import hashlib
import io
import sqlite3
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import media_vault.review_organization as organization_module
from media_vault.config import ReviewConfig
from media_vault.core import VaultLayout, hash_stream, utc_now
from media_vault.db import ManifestDB
from media_vault.review_api import ApplicationStateStore, create_review_app
from media_vault.review_library import STAGE7_JOB_KINDS, ensure_catalog_job, run_stage7_job
from media_vault.review_organization import (
    STAGE8_JOB_KINDS,
    geohash_encode,
    recover_interrupted_stage8_jobs,
    zoom_geohash_precision,
)
from media_vault.review_runtime import run_worker_loop


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


def _headers(key: str) -> dict[str, str]:
    return {
        "Origin": "http://127.0.0.1",
        "Content-Type": "application/json",
        "Idempotency-Key": key,
    }


def _insert_asset(
    db: ManifestDB,
    layout: VaultLayout,
    source_root: Path,
    source_root_id: str,
    index: int,
    *,
    relative_path: str,
    capture_time: str | None,
    ambiguous: bool = False,
    camera_make: str | None = None,
    camera_model: str | None = None,
    lens_model: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
) -> str:
    content = f"immutable-organization-media-{index}".encode()
    hashes = hash_stream(io.BytesIO(content))
    object_path = layout.root / hashes.object_relpath
    object_path.parent.mkdir(parents=True, exist_ok=True)
    object_path.write_bytes(content)
    source_path = source_root / Path(relative_path)
    source_path.parent.mkdir(parents=True, exist_ok=True)
    source_path.write_bytes(content)
    now = utc_now()
    run_id = f"organization-run-{index}"
    db.execute(
        """INSERT INTO runs(
               run_id,command,status,started_at,completed_at,vault_root,host,tool_version,arguments_json
           ) VALUES(?,'synthetic','completed',?,?,?,?,?,'{}')""",
        (run_id, now, now, str(layout.root), "test", "test"),
    )
    db.execute(
        """INSERT INTO exact_groups(
               exact_group_id,size_bytes,sha256,blake3,sha512,verification_method,created_at
           ) VALUES(?,?,?,?,?,'synthetic_fixture',?)""",
        (hashes.exact_group_id, *hashes.identity_key, now),
    )
    db.execute(
        """INSERT INTO assets(
               asset_id,exact_group_id,size_bytes,sha256,blake3,sha512,hash_algorithm_versions_json,
               media_kind,mime_type,detected_format,preferred_extension,width,height,camera_make,camera_model,
               lens_model,capture_time_text,capture_time_source,object_relpath,object_status,object_verified_at,
               created_run_id,created_at,updated_at,metadata_json
           ) VALUES(?,?,?,?,?,?,'{}','image','image/jpeg','JPEG','.jpg',1600,1200,?,?,?,?,
                    'synthetic',?,'verified',?,?,?,?,'{}')""",
        (
            hashes.asset_id,
            hashes.exact_group_id,
            *hashes.identity_key,
            camera_make,
            camera_model,
            lens_model,
            capture_time,
            hashes.object_relpath,
            now,
            run_id,
            now,
            now,
        ),
    )
    db.execute(
        """INSERT INTO source_files(
               source_file_id,source_root_id,path_text,relative_path_text,first_seen_at,last_seen_at,
               last_seen_run_id,present,size_bytes,mtime_ns,ctime_ns,discovery_status,media_kind,asset_id
           ) VALUES(?,?,?,?,?,?,?,1,?,?,?,'ready','image',?)""",
        (
            f"source-file-{index}",
            source_root_id,
            str(source_path),
            relative_path,
            now,
            now,
            run_id,
            len(content),
            source_path.stat().st_mtime_ns,
            source_path.stat().st_ctime_ns,
            hashes.asset_id,
        ),
    )
    db.execute(
        """INSERT INTO asset_extended_metadata(
               metadata_id,asset_id,analyzer_version,input_identity,status,is_current,display_source_asset_id,
               capture_time_text,capture_time_source,capture_time_ambiguous,gps_latitude,gps_longitude,
               camera_make,camera_model,lens_model,width,height,import_time_text,edit_history_json,
               source_folder_evidence_json,raw_metadata_json,warnings_json,created_at,updated_at
           ) VALUES(?,?,'metadata-v1',?,'ready',1,?,?,'synthetic',?,?,?,?,?,?,1600,1200,?,
                    '[]','[]','{}','[]',?,?)""",
        (
            f"metadata-{index}",
            hashes.asset_id,
            f"input-{index}",
            hashes.asset_id,
            capture_time,
            int(ambiguous),
            latitude,
            longitude,
            camera_make,
            camera_model,
            lens_model,
            now,
            now,
            now,
        ),
    )
    db.execute(
        """INSERT INTO asset_features(
               feature_id,asset_id,analyzer_version,input_identity,status,is_current,display_source_asset_id,
               width,height,composite_quality_score,cover_ranking_inputs_json,evidence_json,created_at,updated_at
           ) VALUES(?,?,'features-v1',?,'ready',1,?,1600,1200,0.8,'{}','{}',?,?)""",
        (f"feature-{index}", hashes.asset_id, f"input-{index}", hashes.asset_id, now, now),
    )
    return hashes.asset_id


def _fixture(tmp_path: Path) -> tuple[ReviewConfig, Path, dict[str, str], Path]:
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    protected_sources = tmp_path / "immutable-sources"
    source = protected_sources / "main"
    archive = protected_sources / "archive"
    source.mkdir(parents=True)
    archive.mkdir(parents=True)
    db = ManifestDB(layout.database)
    now = utc_now()
    db.executemany(
        """INSERT INTO source_roots(source_root_id,path_text,first_seen_at,last_seen_at)
           VALUES(?,?,?,?)""",
        (
            ("source-main", str(source), now, now),
            ("source-archive", str(archive), now, now),
        ),
    )
    assets = {
        "london": _insert_asset(
            db,
            layout,
            source,
            "source-main",
            0,
            relative_path="Trips/London/a.jpg",
            capture_time="2024-01-02T10:00:00Z",
            camera_make="Acme",
            camera_model="Acme Cam X",
            lens_model="Prime 50",
            latitude=51.5074,
            longitude=-0.1278,
        ),
        "west_antimeridian": _insert_asset(
            db,
            layout,
            source,
            "source-main",
            1,
            relative_path="Trips/Pacific/b.jpg",
            capture_time="2024-01-02T11:00:00Z",
            camera_make=" ACME ",
            camera_model="cam x",
            lens_model="Prime 50",
            latitude=1.0,
            longitude=-179.8,
        ),
        "east_antimeridian": _insert_asset(
            db,
            layout,
            source,
            "source-main",
            2,
            relative_path="Trips/Pacific/c.jpg",
            capture_time="2024-01-03T09:00:00Z",
            ambiguous=True,
            latitude=-1.0,
            longitude=179.8,
        ),
        "unknown": _insert_asset(
            db,
            layout,
            source,
            "source-main",
            3,
            relative_path="Loose/d.jpg",
            capture_time=None,
        ),
        "february": _insert_asset(
            db,
            layout,
            source,
            "source-main",
            4,
            relative_path="Trips/London/e.jpg",
            capture_time="2024-02-01T09:00:00Z",
            camera_make="Other",
            camera_model="Model Y",
            lens_model="Zoom 24-70",
            latitude=91.0,
            longitude=0.0,
        ),
    }
    # A second preserved source occurrence for the same stable logical photo.
    duplicate_path = archive / "Duplicates" / "b-copy.jpg"
    duplicate_path.parent.mkdir(parents=True)
    duplicate_path.write_bytes((source / "Trips" / "Pacific" / "b.jpg").read_bytes())
    duplicate_stat = duplicate_path.stat()
    db.execute(
        """INSERT INTO source_files(
               source_file_id,source_root_id,path_text,relative_path_text,first_seen_at,last_seen_at,
               last_seen_run_id,present,size_bytes,mtime_ns,ctime_ns,discovery_status,media_kind,asset_id
           ) VALUES('source-file-duplicate','source-archive',?,?,?,?,'organization-run-1',1,?,?,?,
                    'ready','image',?)""",
        (
            str(duplicate_path),
            "Duplicates/b-copy.jpg",
            now,
            now,
            duplicate_stat.st_size,
            duplicate_stat.st_mtime_ns,
            duplicate_stat.st_ctime_ns,
            assets["west_antimeridian"],
        ),
    )
    db.commit()
    static = tmp_path / "static"
    static.mkdir()
    (static / "index.html").write_text("<!doctype html><title>Review</title>", encoding="utf-8")
    config = ReviewConfig(
        vault_root=layout.root,
        inbox_root=tmp_path / "inbox",
        derivative_root=tmp_path / "derivatives",
    )
    catalog = ensure_catalog_job(db, config)
    db.commit()
    db.close()
    run_stage7_job(config, str(catalog["job_id"]), "library_catalog_materialize")
    return config, static, assets, protected_sources


def test_organization_rollups_api_linked_library_and_immutability(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    config, static, assets, source = _fixture(tmp_path)
    layout = VaultLayout(config.vault_root)
    before_source = _snapshot(source)
    before_objects = _snapshot(layout.objects)
    client = TestClient(create_review_app(config, static_root=static), base_url="http://127.0.0.1")

    queued = client.get("/api/v1/organize/status")
    assert queued.status_code == 202, queued.text
    job_id = queued.json()["job"]["id"]
    worker = run_worker_loop(config, once=True, allowed_kinds=STAGE8_JOB_KINDS)
    assert worker.completed == 1
    assert worker.last_job_id == job_id

    status = client.get("/api/v1/organize/status")
    assert status.status_code == 200
    progress = status.json()["data"]["progress"]
    assert progress["entity_count"] == 5
    assert progress["unknown_location_count"] == 2

    # Prove request handlers read persisted rows rather than invoking materializers.
    monkeypatch.setattr(
        organization_module,
        "_materialize_calendar",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(AssertionError("request-time aggregation")),
    )
    calendar_response = client.get("/api/v1/organize/calendar?limit=20")
    assert calendar_response.status_code == 200
    buckets = {item["key"]: item for item in calendar_response.json()["data"]}
    assert buckets["date:2024-01-02"]["count"] == 2
    assert buckets["date:2024-02-01"]["count"] == 1
    assert buckets["ambiguous"]["count"] == 1
    assert buckets["unknown"]["count"] == 1

    january = client.get("/api/v1/organize/calendar?year=2024&month=1&limit=20")
    assert january.status_code == 200
    assert {item["key"] for item in january.json()["data"]} == {
        "date:2024-01-02",
        "ambiguous",
        "unknown",
    }

    roots = client.get("/api/v1/organize/folders?limit=20").json()["data"]
    assert len(roots) == 2
    main_root = next(item for item in roots if item["source_root_id"] == "source-main")
    archive_root = next(item for item in roots if item["source_root_id"] == "source-archive")
    assert main_root["counts"] == {
        "direct_logical": 0,
        "logical": 5,
        "direct_occurrences": 0,
        "occurrences": 5,
    }
    assert archive_root["counts"]["logical"] == 1
    assert archive_root["counts"]["occurrences"] == 1
    main_children = client.get(f"/api/v1/organize/folders?parent_id={main_root['id']}&limit=20").json()["data"]
    assert {item["label"] for item in main_children} == {"Loose", "Trips"}

    cameras = client.get("/api/v1/organize/equipment/camera?limit=20").json()["data"]
    camera_by_key = {item["key"]: item for item in cameras}
    assert camera_by_key["acme cam x"]["count"] == 2
    assert camera_by_key["unknown"]["count"] == 2
    assert camera_by_key["acme cam x"]["raw_values"] != []
    lenses = client.get("/api/v1/organize/equipment/lens?limit=20").json()["data"]
    assert {item["label"] for item in lenses} >= {"Prime 50", "Zoom 24-70", "Unknown"}

    antimeridian = client.get(
        "/api/v1/organize/map?zoom=18&south=-10&north=10&west=170&east=-170&limit=20"
    )
    assert antimeridian.status_code == 200
    clusters = antimeridian.json()["data"]["clusters"]
    assert sum(item["count"] for item in clusters) == 2
    assert {round(item["center"]["longitude"], 1) for item in clusters} == {-179.8, 179.8}
    assert antimeridian.json()["data"]["unknown_location_count"] == 2
    assert antimeridian.json()["data"]["unknown_location_filter"] == {"kind": "map", "key": "unknown"}

    unknown_link = client.get(
        "/api/v1/library?organization_kind=map&organization_key=unknown&limit=20"
    )
    assert unknown_link.status_code == 202
    run_worker_loop(config, once=True, allowed_kinds=STAGE7_JOB_KINDS)
    unknown_ready = client.get(
        "/api/v1/library?organization_kind=map&organization_key=unknown&limit=20"
    )
    assert {item["anchor_asset_id"] for item in unknown_ready.json()["data"]["items"]} == {
        assets["unknown"],
        assets["february"],
    }

    # A persisted alternate-view membership becomes a bounded background library view.
    linked = client.get(
        "/api/v1/library?organization_kind=calendar&organization_key=date%3A2024-01-02&limit=20"
    )
    assert linked.status_code == 202
    linked_job = linked.json()["job"]["id"]
    linked_worker = run_worker_loop(config, once=True, allowed_kinds=STAGE7_JOB_KINDS)
    assert linked_worker.completed == 1
    assert linked_worker.last_job_id == linked_job
    linked_ready = client.get(
        "/api/v1/library?organization_kind=calendar&organization_key=date%3A2024-01-02&limit=20"
    )
    assert linked_ready.status_code == 200
    assert {item["anchor_asset_id"] for item in linked_ready.json()["data"]["items"]} == {
        assets["london"],
        assets["west_antimeridian"],
    }

    # Entity metadata state remains shared with the primary library.
    selected = linked_ready.json()["data"]["items"][0]
    generation = linked_ready.json()["meta"]["generation"]
    changed = client.put(
        "/api/v1/library/state",
        headers=_headers("stage8-shared-state"),
        json={
            "generation": generation,
            "states": [
                {
                    "entity_id": selected["id"],
                    "expected_revision": selected["state"]["revision"],
                    "favourite": True,
                    "rejected": False,
                    "rating": 4,
                }
            ],
        },
    )
    assert changed.status_code == 200
    detail = client.get(f"/api/v1/library/entities/{selected['id']}").json()["data"]["entity"]
    assert detail["state"]["favourite"] is True
    assert detail["state"]["rating"] == 4

    # A forced deterministic rebuild retains all identity/count rows.
    monkeypatch.undo()
    with sqlite3.connect(layout.database) as conn:
        before_rows = conn.execute(
            "SELECT bucket_key,entity_count FROM calendar_buckets ORDER BY bucket_key"
        ).fetchall()
    generation = changed.json()["meta"]["generation"]
    refreshed = client.post(
        "/api/v1/organize/prepare",
        headers=_headers("stage8-refresh"),
        json={"generation": generation, "refresh": True},
    )
    assert refreshed.status_code == 202
    run_worker_loop(config, once=True, allowed_kinds=STAGE8_JOB_KINDS)
    with sqlite3.connect(layout.database) as conn:
        after_rows = conn.execute(
            "SELECT bucket_key,entity_count FROM calendar_buckets ORDER BY bucket_key"
        ).fetchall()
        assert before_rows == after_rows
        assert conn.execute("PRAGMA integrity_check").fetchone() == ("ok",)
        assert conn.execute("PRAGMA foreign_key_check").fetchall() == []

    assert _snapshot(source) == before_source
    assert _snapshot(layout.objects) == before_objects


def test_organization_query_plans_geohash_and_recovery(tmp_path: Path) -> None:
    config, _static, _assets, _source = _fixture(tmp_path)
    layout = VaultLayout(config.vault_root)
    store = ApplicationStateStore(config)
    generation, queued = store.organization_status()
    assert generation >= 0
    run_worker_loop(config, once=True, allowed_kinds=STAGE8_JOB_KINDS)

    with store.connection() as conn:
        catalog_generation = conn.execute(
            "SELECT source_generation FROM materialized_views WHERE view_kind='organization_rollups' AND status='ready'"
        ).fetchone()[0]
        plans = {
            "calendar": conn.execute(
                "EXPLAIN QUERY PLAN SELECT bucket_key FROM calendar_buckets WHERE catalog_generation=? AND year=? AND month=? ORDER BY sort_order,bucket_key LIMIT 20",
                (catalog_generation, 2024, 1),
            ).fetchall(),
            "folders": conn.execute(
                "EXPLAIN QUERY PLAN SELECT node_id FROM folder_hierarchy_nodes WHERE catalog_generation=? AND parent_node_id IS NULL ORDER BY display_value,node_id LIMIT 20",
                (catalog_generation,),
            ).fetchall(),
            "equipment": conn.execute(
                "EXPLAIN QUERY PLAN SELECT value_key FROM equipment_rollups WHERE catalog_generation=? AND equipment_kind='camera' ORDER BY entity_count DESC,value_key LIMIT 20",
                (catalog_generation,),
            ).fetchall(),
            "map": conn.execute(
                "EXPLAIN QUERY PLAN SELECT cluster_id FROM map_clusters WHERE catalog_generation=? AND zoom_level=? AND center_latitude BETWEEN ? AND ? ORDER BY center_latitude,center_longitude,cluster_id LIMIT 20",
                (catalog_generation, 6, -90, 90),
            ).fetchall(),
        }
    plan_text = {name: " ".join(str(row[3]) for row in rows) for name, rows in plans.items()}
    assert "idx_calendar_buckets_month" in plan_text["calendar"]
    assert "idx_folder_hierarchy_children" in plan_text["folders"]
    assert "idx_equipment_rollups_page" in plan_text["equipment"]
    assert "idx_map_clusters_viewport" in plan_text["map"]
    assert all("SCAN photo_entities" not in value for value in plan_text.values())

    assert geohash_encode(51.5074, -0.1278, 8) == "gcpvj0du"
    assert geohash_encode(0, 179.9, 8) != geohash_encode(0, -179.9, 8)
    assert [zoom_geohash_precision(value) for value in (0, 3, 6, 9, 12, 15, 18)] == [1, 2, 3, 4, 5, 6, 7]
    with pytest.raises(ValueError, match="bounds"):
        geohash_encode(91, 0)

    with sqlite3.connect(layout.database) as conn:
        conn.execute(
            "UPDATE background_jobs SET status='running' WHERE job_id=?",
            (queued["job_id"],),
        )
        conn.execute(
            "UPDATE materialized_views SET status='building' WHERE job_id=?",
            (queued["job_id"],),
        )
        conn.commit()
    assert recover_interrupted_stage8_jobs(config) == (queued["job_id"],)
    with sqlite3.connect(layout.database) as conn:
        status, view_status = conn.execute(
            """SELECT j.status,v.status FROM background_jobs j
                 JOIN materialized_views v USING(job_id) WHERE j.job_id=?""",
            (queued["job_id"],),
        ).fetchone()
    assert status == "queued"
    assert view_status == "queued"
