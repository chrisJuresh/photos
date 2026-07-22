from __future__ import annotations

import hashlib
import io
import sqlite3
from pathlib import Path

from fastapi.testclient import TestClient

from media_vault.config import ReviewConfig
from media_vault.core import VaultLayout, hash_stream, utc_now
from media_vault.db import ManifestDB
from media_vault.review_api import ApplicationStateStore, LibraryCursor, create_review_app
from media_vault.review_library import normalize_library_query, recover_interrupted_stage7_jobs
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
    index: int,
    *,
    media_kind: str = "image",
    detected_format: str = "JPEG",
) -> tuple[str, Path]:
    content = f"immutable-media-{index}".encode()
    hashes = hash_stream(io.BytesIO(content))
    object_path = layout.root / hashes.object_relpath
    object_path.parent.mkdir(parents=True, exist_ok=True)
    object_path.write_bytes(content)
    source_path = source_root / f"folder-{index % 2}" / f"asset-{index}.jpg"
    source_path.parent.mkdir(parents=True, exist_ok=True)
    source_path.write_bytes(content)
    now = utc_now()
    run_id = f"library-run-{index}"
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
               media_kind,mime_type,detected_format,preferred_extension,perceptual_hash,width,height,
               camera_make,camera_model,lens_model,capture_time_text,capture_time_source,object_relpath,
               object_status,object_verified_at,created_run_id,created_at,updated_at,metadata_json
           ) VALUES(?,?,?,?,?,?,'{}',?,'image/jpeg',?,'.jpg',?,1600,1200,'Synthetic','Camera A',
                    'Lens A',?,'synthetic',?,'verified',?,?,?,?,'{}')""",
        (
            hashes.asset_id,
            hashes.exact_group_id,
            *hashes.identity_key,
            media_kind,
            detected_format,
            f"phash-{index:04d}",
            f"2026-07-{index + 1:02d}T12:00:00Z",
            hashes.object_relpath,
            now,
            run_id,
            now,
            now,
        ),
    )
    source_file_id = f"source-file-{index}"
    db.execute(
        """INSERT INTO source_files(
               source_file_id,source_root_id,path_text,relative_path_text,first_seen_at,last_seen_at,
               last_seen_run_id,present,size_bytes,mtime_ns,ctime_ns,discovery_status,media_kind,asset_id
           ) VALUES(?,'library-source',?,?,?,?,?,1,?,?,?,'ready',?,?)""",
        (
            source_file_id,
            str(source_path),
            str(source_path.relative_to(source_root)),
            now,
            now,
            run_id,
            len(content),
            source_path.stat().st_mtime_ns,
            source_path.stat().st_ctime_ns,
            media_kind,
            hashes.asset_id,
        ),
    )
    db.execute(
        """INSERT INTO asset_extended_metadata(
               metadata_id,asset_id,analyzer_version,input_identity,status,is_current,display_source_asset_id,
               capture_time_text,capture_time_source,camera_make,camera_model,lens_model,iso_value,
               aperture_f_number,exposure_time_seconds,focal_length_mm,width,height,import_time_text,
               edit_history_json,source_folder_evidence_json,raw_metadata_json,warnings_json,created_at,updated_at
           ) VALUES(?,?, 'metadata-v1',?,'ready',1,?,?, 'synthetic','Synthetic','Camera A','Lens A',
                    100,2.8,0.01,35,1600,1200,?,'[]','[]','{}','[]',?,?)""",
        (
            f"metadata-{index}",
            hashes.asset_id,
            f"input-{index}",
            hashes.asset_id,
            f"2026-07-{index + 1:02d}T12:00:00Z",
            now,
            now,
            now,
        ),
    )
    db.execute(
        """INSERT INTO asset_features(
               feature_id,asset_id,analyzer_version,input_identity,status,is_current,display_source_asset_id,
               width,height,sharpness_score,underexposure_score,overexposure_score,composite_quality_score,
               cover_ranking_inputs_json,evidence_json,created_at,updated_at
           ) VALUES(?,?,'features-v1',?,'ready',1,?,1600,1200,?,?,?,?,'{}','{}',?,?)""",
        (
            f"feature-{index}",
            hashes.asset_id,
            f"input-{index}",
            hashes.asset_id,
            0.7 + index / 100,
            index / 100,
            index / 200,
            0.8 + index / 100,
            now,
            now,
        ),
    )
    derivative = layout.root.parent / "derivatives" / "library" / f"asset-{index}.webp"
    derivative.parent.mkdir(parents=True, exist_ok=True)
    derivative.write_bytes(f"persisted-derivative-{index}".encode())
    derivative_stat = derivative.stat()
    db.execute(
        """INSERT INTO derivatives(
               derivative_id,subject_type,subject_id,asset_id,derivative_kind,representation_kind,long_edge,
               analyzer_version,input_identity,status,is_current,width,height,mime_type,checksum_sha256,
               byte_size,file_mtime_ns,relative_path_text,created_at,completed_at,updated_at
           ) VALUES(?,'asset',?,?,'thumbnail','image',384,'vault-derivative-v1',?,'ready',1,384,288,
                    'image/webp',?,?,?,?,?,?,?)""",
        (
            f"derivative-{index}",
            hashes.asset_id,
            hashes.asset_id,
            f"input-{index}",
            hashlib.sha256(derivative.read_bytes()).hexdigest(),
            derivative_stat.st_size,
            derivative_stat.st_mtime_ns,
            str(derivative.relative_to(layout.root.parent / "derivatives")),
            now,
            now,
            now,
        ),
    )
    return hashes.asset_id, source_path


def _library_fixture(tmp_path: Path) -> tuple[ReviewConfig, Path, list[str], Path]:
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    source_root = tmp_path / "immutable-source"
    source_root.mkdir()
    db = ManifestDB(layout.database)
    now = utc_now()
    db.execute(
        """INSERT INTO source_roots(source_root_id,path_text,first_seen_at,last_seen_at)
           VALUES('library-source',?,?,?)""",
        (str(source_root), now, now),
    )
    assets = [
        _insert_asset(db, layout, source_root, 0, media_kind="raw_image", detected_format="DNG")[0],
        _insert_asset(db, layout, source_root, 1)[0],
        _insert_asset(db, layout, source_root, 2)[0],
        _insert_asset(db, layout, source_root, 3, media_kind="video", detected_format="MP4")[0],
    ]
    # The RAW entity deliberately displays the accepted non-RAW companion's persisted representation.
    db.execute(
        "UPDATE asset_extended_metadata SET display_source_asset_id=? WHERE asset_id=?",
        (assets[1], assets[0]),
    )
    db.execute(
        """INSERT INTO raw_jpeg_groups(
               raw_jpeg_group_id,anchor_raw_asset_id,confidence_label,confidence_score,evidence_json,created_run_id,created_at
           ) VALUES('raw-group',?,'high',0.95,'{}','library-run-0',?)""",
        (assets[0], now),
    )
    db.executemany(
        """INSERT INTO raw_jpeg_members(
               raw_jpeg_group_id,asset_id,role,confidence_label,confidence_score,evidence_json,ambiguous
           ) VALUES('raw-group',?,?,'high',0.95,'{}',0)""",
        ((assets[0], "raw_anchor"), (assets[1], "jpeg_companion")),
    )
    db.commit()
    db.close()
    static = tmp_path / "static"
    static.mkdir()
    (static / "index.html").write_text("<!doctype html><title>Review</title>", encoding="utf-8")
    config = ReviewConfig(
        vault_root=layout.root,
        inbox_root=tmp_path / "inbox",
        derivative_root=tmp_path / "derivatives",
    )
    return config, static, assets, source_root


def test_library_catalog_api_actions_inspector_and_immutability(tmp_path: Path) -> None:
    config, static, assets, source_root = _library_fixture(tmp_path)
    layout = VaultLayout(config.vault_root)
    opened: list[Path] = []
    client = TestClient(
        create_review_app(config, static_root=static, folder_opener=opened.append),
        base_url="http://127.0.0.1",
    )
    source_before = _snapshot(source_root)
    objects_before = _snapshot(layout.objects)

    preparing = client.get("/api/v1/library?limit=2")
    assert preparing.status_code == 202, preparing.text
    catalog_job = preparing.json()["job"]["id"]
    assert run_worker_loop(config, once=True).last_job_id == catalog_job

    first = client.get("/api/v1/library?limit=2")
    assert first.status_code == 200
    body = first.json()
    assert len(body["data"]["items"]) == 2
    assert body["page"]["next_cursor"]
    all_entities = client.get("/api/v1/library?limit=10").json()["data"]["items"]
    assert len(all_entities) == 3
    raw_entity = next(item for item in all_entities if item["anchor_asset_id"] == assets[0])
    assert raw_entity["display_asset_id"] == assets[1]
    assert raw_entity["counts"]["members"] == 2
    assert raw_entity["indicators"] == {"has_raw_companion": True, "stack_member_count": 0}
    assert raw_entity["derivatives"][0]["url"].endswith("/derivatives/384")
    derivative = client.get(raw_entity["derivatives"][0]["url"])
    assert derivative.status_code == 200
    assert derivative.content == b"persisted-derivative-1"

    facets = client.get("/api/v1/library/facets/media_kind?limit=10").json()["data"]
    assert sum(item["count"] for item in facets) == 3
    detail = client.get(f"/api/v1/library/entities/{raw_entity['id']}")
    assert detail.status_code == 200
    detail_body = detail.json()
    assert len(detail_body["data"]["members"]) == 2
    assert detail_body["data"]["sources"]
    assert detail_body["data"]["stacks"] == []
    assert {item["field"] for item in detail_body["unavailable"]} == {"junk_explanations"}

    generation = body["meta"]["generation"]
    state = raw_entity["state"]
    mutation = {
        "generation": generation,
        "states": [
            {
                "entity_id": raw_entity["id"],
                "expected_revision": state["revision"],
                "favourite": True,
                "rejected": True,
                "rating": 4,
            }
        ],
    }
    updated = client.put("/api/v1/library/state", headers=_headers("library-state-1"), json=mutation)
    assert updated.status_code == 200
    assert updated.json()["data"]["media_mutation"] == "none"
    current_generation = updated.json()["meta"]["generation"]
    replayed = client.put("/api/v1/library/state", headers=_headers("library-state-1"), json=mutation)
    assert replayed.status_code == 200
    assert replayed.json() == updated.json()
    assert raw_entity["id"] not in {
        item["id"] for item in client.get("/api/v1/library?limit=10").json()["data"]["items"]
    }
    included = client.get("/api/v1/library?limit=10&rejected=include").json()["data"]["items"]
    persisted = next(item for item in included if item["id"] == raw_entity["id"])
    assert persisted["state"] == {"favourite": True, "rejected": True, "rating": 4, "revision": 2}
    stale = client.put("/api/v1/library/state", headers=_headers("library-state-stale"), json=mutation)
    assert stale.status_code == 409
    assert stale.json()["error"]["code"] == "stale_generation"

    materializing = client.get(
        "/api/v1/library?limit=10&rejected=include&sort=rating:desc&sort=filename:asc"
    )
    assert materializing.status_code == 202
    assert run_worker_loop(config, once=True).last_job_id == materializing.json()["job"]["id"]
    ready_view = client.get(
        "/api/v1/library?limit=10&rejected=include&sort=rating:desc&sort=filename:asc"
    )
    assert ready_view.status_code == 200
    assert ready_view.json()["data"]["view"]["status"] == "ready"

    # A metadata change cannot reuse an arbitrary view ordered by the old state generation.
    other = next(item for item in included if item["id"] != raw_entity["id"])
    second_update = client.put(
        "/api/v1/library/state",
        headers=_headers("library-state-2"),
        json={
            "generation": current_generation,
            "states": [
                {
                    "entity_id": other["id"],
                    "expected_revision": other["state"]["revision"],
                    "favourite": True,
                    "rejected": other["state"]["rejected"],
                    "rating": other["state"]["rating"],
                }
            ],
        },
    )
    assert second_update.status_code == 200
    current_generation = second_update.json()["meta"]["generation"]
    rematerializing = client.get(
        "/api/v1/library?limit=10&rejected=include&sort=rating:desc&sort=filename:asc"
    )
    assert rematerializing.status_code == 202
    assert rematerializing.json()["job"]["id"] != materializing.json()["job"]["id"]
    assert run_worker_loop(config, once=True).last_job_id == rematerializing.json()["job"]["id"]

    invalid_open = client.post(
        f"/api/v1/library/entities/{raw_entity['id']}/open-folder",
        headers=_headers("open-invalid"),
        json={"generation": current_generation, "path": "C:\\arbitrary"},
    )
    assert invalid_open.status_code == 422
    opened_response = client.post(
        f"/api/v1/library/entities/{raw_entity['id']}/open-folder",
        headers=_headers("open-valid"),
        json={"generation": current_generation},
    )
    assert opened_response.status_code == 200
    assert opened == [source_root / "folder-1" / "asset-1.jpg"]

    refresh = client.post(
        "/api/v1/library/prepare",
        headers=_headers("library-refresh"),
        json={"generation": current_generation, "refresh": True},
    )
    assert refresh.status_code == 202
    interrupted_job = refresh.json()["job"]["id"]
    with sqlite3.connect(layout.database) as conn:
        conn.execute(
            "UPDATE background_jobs SET status='running',attempt=1 WHERE job_id=?",
            (interrupted_job,),
        )
        conn.execute(
            "UPDATE materialized_views SET status='building' WHERE job_id=?",
            (interrupted_job,),
        )
    assert recover_interrupted_stage7_jobs(config) == (interrupted_job,)
    with sqlite3.connect(layout.database) as conn:
        assert conn.execute(
            "SELECT status FROM background_jobs WHERE job_id=?",
            (interrupted_job,),
        ).fetchone() == ("queued",)
    assert run_worker_loop(config, once=True).last_job_id == refresh.json()["job"]["id"]
    refreshed_response = client.get("/api/v1/library?limit=10&rejected=include").json()
    refreshed = refreshed_response["data"]["items"]
    assert {item["id"] for item in refreshed} == {item["id"] for item in included}
    refreshed_raw = next(item for item in refreshed if item["id"] == raw_entity["id"])
    assert refreshed_raw["state"]["rating"] == 4

    retry_refresh = client.post(
        "/api/v1/library/prepare",
        headers=_headers("library-refresh-retry"),
        json={"generation": refreshed_response["meta"]["generation"], "refresh": True},
    )
    assert retry_refresh.status_code == 202
    retry_job = retry_refresh.json()["job"]["id"]
    with sqlite3.connect(layout.database) as conn:
        conn.execute(
            "UPDATE materialized_views SET view_kind='synthetic_failure' WHERE job_id=?",
            (retry_job,),
        )
    failed_attempt = run_worker_loop(config, once=True)
    assert failed_attempt.failed == 1
    with sqlite3.connect(layout.database) as conn:
        assert conn.execute(
            "SELECT status,attempt FROM background_jobs WHERE job_id=?",
            (retry_job,),
        ).fetchone() == ("queued", 1)
        conn.execute(
            "UPDATE materialized_views SET view_kind='library_catalog' WHERE job_id=?",
            (retry_job,),
        )
    retried = run_worker_loop(config, once=True)
    assert retried.completed == 1
    assert retried.last_job_id == retry_job

    restarted = TestClient(
        create_review_app(config, static_root=static, folder_opener=opened.append),
        base_url="http://127.0.0.1",
    )
    restart_detail = restarted.get(f"/api/v1/library/entities/{raw_entity['id']}").json()["data"]
    assert restart_detail["entity"]["state"]["rating"] == 4
    assert restart_detail["state_events"][0]["action"] == "set_state"
    assert _snapshot(source_root) == source_before
    assert _snapshot(layout.objects) == objects_before


def test_library_common_query_plan_and_generated_scale(tmp_path: Path) -> None:
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    db = ManifestDB(layout.database)
    db.close()
    conn = sqlite3.connect(layout.database)
    try:
        conn.execute("PRAGMA foreign_keys=OFF")
        now = utc_now()
        conn.execute(
            """INSERT INTO background_jobs(
                   job_id,job_kind,subject_type,subject_id,phase,status,attempt,created_at,priority,
                   max_attempts,control_state,queued_at,updated_at
               ) VALUES('large-catalog-job','library_catalog_materialize','materialized_view','large-catalog',
                        'complete','completed',1,?,30,3,'run',?,?)""",
            (now, now, now),
        )
        conn.execute(
            """INSERT INTO materialized_views(
                   view_id,view_kind,query_sha256,query_json,source_generation,analyzer_version,status,
                   is_current,job_id,item_count,created_at,updated_at,completed_at
               ) VALUES('large-catalog','library_catalog','catalog','{}',1,'materialized-view-v1','ready',
                        1,'large-catalog-job',146034,?,?,?)""",
            (now, now, now),
        )
        entity_sql = """INSERT INTO photo_entities(
              entity_id,anchor_asset_id,display_asset_id,entity_kind,media_kind,filename_text,
              capture_sort_text,import_sort_text,size_bytes,quality_sort,exposure_sort,random_key,
              catalog_generation,is_current,created_at,updated_at
          ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1,1,?,?)"""
        state_sql = """INSERT INTO photo_user_state(
              entity_id,favourite,rejected,rating,revision,created_at,updated_at
          ) VALUES(?,0,0,0,1,?,?)"""
        for start in range(0, 146_034, 2_000):
            stop = min(start + 2_000, 146_034)
            entities = []
            states = []
            for index in range(start, stop):
                entity_id = f"pe1_large_{index:06d}"
                asset_id = f"asset_large_{index:06d}"
                entities.append(
                    (
                        entity_id,
                        asset_id,
                        asset_id,
                        "standalone",
                        "image",
                        f"asset-{index:06d}.jpg",
                        f"2026-07-{(index % 28) + 1:02d}T12:00:00Z",
                        now,
                        index + 1,
                        float(index % 100) / 100,
                        0.0,
                        hashlib.sha256(entity_id.encode()).hexdigest(),
                        now,
                        now,
                    )
                )
                states.append((entity_id, now, now))
            conn.executemany(entity_sql, entities)
            conn.executemany(state_sql, states)
            conn.commit()
    finally:
        conn.close()

    config = ReviewConfig(
        vault_root=layout.root,
        inbox_root=tmp_path / "inbox",
        derivative_root=tmp_path / "derivatives",
    )
    store = ApplicationStateStore(config)
    for field in (
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
    ):
        for direction in ("asc", "desc"):
            plan = "\n".join(
                store.library_query_plan(normalize_library_query(sorts=((field, direction),)))
            )
            assert "USE TEMP B-TREE" not in plan, (field, direction, plan)
    query = normalize_library_query()
    plan = "\n".join(store.library_query_plan(query))
    assert "idx_photo_entities_capture" in plan
    generation, page, cursor, preparing = store.library_page(limit=120, cursor=None, query=query)
    assert generation == 0
    assert preparing is None
    assert len(page["items"]) == 120
    assert cursor is not None
    decoded_cursor = LibraryCursor.decode(cursor)
    seek_plan = "\n".join(store.library_query_plan(query, cursor=decoded_cursor))
    assert "idx_photo_entities_capture" in seek_plan
    assert "USE TEMP B-TREE" not in seek_plan
    _generation, second_page, _next_cursor, preparing = store.library_page(
        limit=120,
        cursor=decoded_cursor,
        query=query,
    )
    assert preparing is None
    assert len(second_page["items"]) == 120
    assert {item["id"] for item in page["items"]}.isdisjoint(
        item["id"] for item in second_page["items"]
    )
