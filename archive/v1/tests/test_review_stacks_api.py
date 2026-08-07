from __future__ import annotations

import hashlib
import io
import json
import sqlite3
from dataclasses import replace
from pathlib import Path

import numpy as np
from fastapi.testclient import TestClient
from PIL import Image

from media_vault.config import ReviewConfig
from media_vault.core import VaultLayout, hash_stream, utc_now
from media_vault.db import ManifestDB, validate_manifest_connection
from media_vault.review_api import create_review_app
from media_vault.review_runtime import run_worker_loop
from media_vault.review_stacks import (
    MAX_CANDIDATES_PER_ENTITY,
    _edge_score,
    _materialize_candidate_edges,
    _rank_cover,
    ensure_stack_profile,
    normalize_stack_settings,
    recover_interrupted_stage9_jobs,
    stack_candidate_query_plan,
)


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


def _pattern(kind: str) -> np.ndarray:
    y, x = np.indices((64, 64))
    if kind == "burst":
        value = ((x // 4 + y // 4) % 2) * 210 + 20
        return np.stack((value, np.roll(value, 1, axis=1), value), axis=2).astype(np.uint8)
    if kind == "burst-shifted":
        value = np.roll(((x // 4 + y // 4) % 2) * 210 + 20, 2, axis=1)
        return np.stack((value, value, np.roll(value, 1, axis=0)), axis=2).astype(np.uint8)
    if kind == "second":
        value = np.broadcast_to(np.linspace(10, 240, 64, dtype=np.uint8), (64, 64))
        return np.stack((value, np.flipud(value), value), axis=2)
    rng = np.random.default_rng(719)
    return rng.integers(0, 255, size=(64, 64, 3), dtype=np.uint8)


def _insert_entity(
    db: ManifestDB,
    layout: VaultLayout,
    config: ReviewConfig,
    source_root: Path,
    index: int,
    *,
    pattern: str,
    capture_second: int,
    filename_prefix: str,
    camera: str,
    edit_likelihood: float,
    sharpness: float,
    motion: float = 0.1,
) -> str:
    content = f"immutable-stack-media-{index}".encode()
    hashes = hash_stream(io.BytesIO(content))
    canonical = layout.root / hashes.object_relpath
    canonical.parent.mkdir(parents=True, exist_ok=True)
    canonical.write_bytes(content)
    source = source_root / f"{filename_prefix}-{index:04d}.jpg"
    source.write_bytes(content)
    now = utc_now()
    run_id = f"stack-run-{index}"
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
    capture = f"2026-07-21T12:{capture_second // 60:02d}:{capture_second % 60:02d}Z"
    db.execute(
        """INSERT INTO assets(
               asset_id,exact_group_id,size_bytes,sha256,blake3,sha512,hash_algorithm_versions_json,
               media_kind,mime_type,detected_format,preferred_extension,width,height,camera_make,
               camera_model,lens_model,capture_time_text,capture_time_source,object_relpath,object_status,
               object_verified_at,created_run_id,created_at,updated_at,metadata_json
           ) VALUES(?,?,?,?,?,?,'{}','image','image/jpeg','JPEG','.jpg',64,64,'Synthetic',?,
                    'Stack Lens',?,'synthetic',?,'verified',?,?,?,?,'{}')""",
        (
            hashes.asset_id,
            hashes.exact_group_id,
            *hashes.identity_key,
            camera,
            capture,
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
           ) VALUES(?, 'stack-source',?,?,?,?,?,1,?,?,?,'ready','image',?)""",
        (
            f"stack-source-{index}",
            str(source),
            source.name,
            now,
            now,
            run_id,
            len(content),
            source.stat().st_mtime_ns,
            source.stat().st_ctime_ns,
            hashes.asset_id,
        ),
    )
    db.execute(
        """INSERT INTO asset_extended_metadata(
               metadata_id,asset_id,analyzer_version,input_identity,status,is_current,display_source_asset_id,
               capture_time_text,capture_time_source,camera_make,camera_model,lens_model,width,height,
               edit_likelihood,edit_history_json,source_folder_evidence_json,raw_metadata_json,warnings_json,
               created_at,updated_at
           ) VALUES(?,?,'metadata-v1',?,'ready',1,?,?,'synthetic','Synthetic',?,'Stack Lens',64,64,?,
                    '[]','[]','{}','[]',?,?)""",
        (
            f"stack-metadata-{index}",
            hashes.asset_id,
            f"stack-input-{index}",
            hashes.asset_id,
            capture,
            camera,
            edit_likelihood,
            now,
            now,
        ),
    )
    db.execute(
        """INSERT INTO asset_features(
               feature_id,asset_id,analyzer_version,input_identity,status,is_current,display_source_asset_id,
               width,height,sharpness_score,motion_score,underexposure_score,overexposure_score,
               highlight_clipping_score,corruption_score,edit_likelihood,composite_quality_score,
               cover_ranking_inputs_json,evidence_json,created_at,updated_at
           ) VALUES(?,?,'features-v1',?,'ready',1,?,64,64,?,?,0.05,0.05,0.01,0,?,?,'{}','{}',?,?)""",
        (
            f"stack-feature-{index}",
            hashes.asset_id,
            f"stack-input-{index}",
            hashes.asset_id,
            sharpness,
            motion,
            edit_likelihood,
            sharpness,
            now,
            now,
        ),
    )
    derivative = config.derivative_root / "stack" / f"entity-{index}.webp"
    derivative.parent.mkdir(parents=True, exist_ok=True)
    image = Image.fromarray(_pattern(pattern), mode="RGB")
    try:
        image.save(derivative, format="WEBP", lossless=True)
    finally:
        image.close()
    derivative_stat = derivative.stat()
    db.execute(
        """INSERT INTO derivatives(
               derivative_id,subject_type,subject_id,asset_id,derivative_kind,representation_kind,long_edge,
               analyzer_version,input_identity,status,is_current,width,height,mime_type,checksum_sha256,
               byte_size,file_mtime_ns,relative_path_text,created_at,completed_at,updated_at
           ) VALUES(?,'asset',?,?,'thumbnail','image',384,'vault-derivative-v1',?,'ready',1,64,64,
                    'image/webp',?,?,?,?,?,?,?)""",
        (
            f"stack-derivative-{index}",
            hashes.asset_id,
            hashes.asset_id,
            f"stack-input-{index}",
            hashlib.sha256(derivative.read_bytes()).hexdigest(),
            derivative_stat.st_size,
            derivative_stat.st_mtime_ns,
            str(derivative.relative_to(config.derivative_root)),
            now,
            now,
            now,
        ),
    )
    entity_id = f"pe1_stack_{index:03d}"
    db.execute(
        """INSERT INTO photo_entities(
               entity_id,anchor_asset_id,display_asset_id,entity_kind,media_kind,format_text,filename_text,
               primary_path_text,folder_text,capture_time_text,capture_time_source,capture_sort_text,
               import_time_text,import_sort_text,camera_make,camera_model,lens_model,width,height,size_bytes,
               quality_score,quality_sort,exposure_score,exposure_sort,random_key,catalog_generation,is_current,
               created_at,updated_at
           ) VALUES(?,?,?,'standalone','image','JPEG',?,?,'',?,'synthetic',?,?,?,'Synthetic',?,
                    'Stack Lens',64,64,?, ?,?,0.05,0.05,?,1,1,?,?)""",
        (
            entity_id,
            hashes.asset_id,
            hashes.asset_id,
            source.name,
            str(source),
            capture,
            capture,
            now,
            now,
            camera,
            len(content),
            sharpness,
            sharpness,
            hashlib.sha256(entity_id.encode()).hexdigest(),
            now,
            now,
        ),
    )
    db.execute(
        """INSERT INTO photo_entity_members(entity_id,asset_id,role,is_display,confidence_score,evidence_json)
           VALUES(?,?,'standalone',1,1.0,'{}')""",
        (entity_id, hashes.asset_id),
    )
    db.execute(
        """INSERT INTO photo_user_state(entity_id,favourite,rejected,rating,revision,created_at,updated_at)
           VALUES(?,0,0,0,1,?,?)""",
        (entity_id, now, now),
    )
    return entity_id


def _fixture(tmp_path: Path) -> tuple[ReviewConfig, Path, list[str], Path, Path]:
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    config = ReviewConfig(
        vault_root=layout.root,
        inbox_root=tmp_path / "inbox",
        derivative_root=tmp_path / "derivatives",
    )
    source_root = tmp_path / "immutable-source"
    source_root.mkdir()
    db = ManifestDB(layout.database)
    now = utc_now()
    db.execute(
        "INSERT INTO source_roots(source_root_id,path_text,first_seen_at,last_seen_at) VALUES('stack-source',?,?,?)",
        (str(source_root), now, now),
    )
    db.execute(
        """INSERT INTO background_jobs(
               job_id,job_kind,subject_type,subject_id,phase,status,attempt,created_at,priority,max_attempts,
               control_state,queued_at,updated_at,completed_at
           ) VALUES('stack-catalog-job','library_catalog_materialize','materialized_view','stack-catalog',
                    'complete','completed',1,?,30,3,'run',?,?,?)""",
        (now, now, now, now),
    )
    db.execute(
        """INSERT INTO materialized_views(
               view_id,view_kind,query_sha256,query_json,source_generation,analyzer_version,status,is_current,
               job_id,item_count,created_at,updated_at,completed_at
           ) VALUES('stack-catalog','library_catalog','stack-catalog','{}',1,'materialized-view-v1','ready',1,
                    'stack-catalog-job',6,?,?,?)""",
        (now, now, now),
    )
    entities = [
        _insert_entity(db, layout, config, source_root, 0, pattern="burst", capture_second=0, filename_prefix="burst-a", camera="Camera A", edit_likelihood=0.95, sharpness=0.99),
        _insert_entity(db, layout, config, source_root, 1, pattern="burst", capture_second=8, filename_prefix="burst-a", camera="Camera A", edit_likelihood=0.0, sharpness=0.88),
        _insert_entity(db, layout, config, source_root, 2, pattern="burst-shifted", capture_second=16, filename_prefix="burst-a", camera="Camera A", edit_likelihood=0.0, sharpness=0.62),
        _insert_entity(db, layout, config, source_root, 3, pattern="unrelated", capture_second=12, filename_prefix="unrelated", camera="Camera B", edit_likelihood=0.0, sharpness=0.75),
        _insert_entity(db, layout, config, source_root, 4, pattern="second", capture_second=3600, filename_prefix="burst-b", camera="Camera A", edit_likelihood=0.0, sharpness=0.8),
        _insert_entity(db, layout, config, source_root, 5, pattern="second", capture_second=3610, filename_prefix="burst-b", camera="Camera A", edit_likelihood=0.0, sharpness=0.7),
    ]
    related_assets = db.all(
        "SELECT entity_id,anchor_asset_id FROM photo_entities WHERE entity_id IN (?,?) ORDER BY entity_id",
        entities[:2],
    )
    db.execute(
        """INSERT INTO relationships(
               relationship_id,left_asset_id,right_asset_id,relationship_type,method,confidence_label,
               confidence_score,evidence_json,created_run_id,created_at
           ) VALUES('stack-relationship',?,?,'near_duplicate','synthetic','high',0.86,'{}','stack-run-0',?)""",
        (related_assets[0]["anchor_asset_id"], related_assets[1]["anchor_asset_id"], now),
    )
    db.commit()
    db.close()
    static = tmp_path / "static"
    static.mkdir()
    (static / "index.html").write_text("<!doctype html><title>Review</title>", encoding="utf-8")
    return config, static, entities, source_root, layout.objects


def test_stack_profiles_group_rank_override_integrate_and_preserve_media(
    tmp_path: Path,
    monkeypatch,
) -> None:
    config, static, entities, source_root, objects_root = _fixture(tmp_path)
    layout = VaultLayout(config.vault_root)
    source_before = _snapshot(source_root)
    objects_before = _snapshot(objects_root)
    client = TestClient(create_review_app(config, static_root=static), base_url="http://127.0.0.1")

    monkeypatch.setattr("media_vault.review_stacks.Image.open", lambda *_args, **_kwargs: (_ for _ in ()).throw(AssertionError("HTTP media work")))
    queued = client.get("/api/v1/stacks/status")
    assert queued.status_code == 202
    default_profile_id = queued.json()["data"]["id"]
    default_job_id = queued.json()["job"]["id"]
    monkeypatch.undo()
    assert run_worker_loop(config, once=True).last_job_id == default_job_id

    ready = client.get("/api/v1/stacks/status")
    assert ready.status_code == 200
    default_profile = ready.json()["data"]
    assert default_profile["id"] == default_profile_id
    assert default_profile["status"] == "ready"
    assert default_profile["candidate_edge_count"] <= len(entities) * MAX_CANDIDATES_PER_ENTITY
    assert default_profile["stack_count"] < len(entities)
    default_page = client.get(f"/api/v1/stacks/{default_profile_id}?limit=20")
    assert default_page.status_code == 200
    assert len(default_page.json()["data"]["items"]) == default_profile["stack_count"]
    burst = next(
        item for item in default_page.json()["data"]["items"] if item["stack"]["member_count"] >= 3
    )
    assert burst["stack"]["cover_entity_id"] != entities[0]
    assert "unedited candidates were preferred" in burst["stack"]["cover_explanation"]
    burst_detail = client.get(f"/api/v1/stacks/{default_profile_id}/{burst['stack']['id']}").json()["data"]
    assert {item["entity"]["id"] for item in burst_detail["members"]} >= set(entities[:3])
    assert entities[3] not in {item["entity"]["id"] for item in burst_detail["members"]}
    with sqlite3.connect(layout.database) as conn:
        assert conn.execute(
            "SELECT COUNT(*) FROM stack_feature_inputs WHERE raw_jpeg_confidence IS NOT NULL"
        ).fetchone()[0] == 0
        relationship_score = conn.execute(
            """SELECT relationship_score FROM stack_candidate_edges
                 WHERE left_entity_id=? AND right_entity_id=?""",
            tuple(sorted(entities[:2])),
        ).fetchone()
        assert relationship_score == (0.86,)

    current_generation = ready.json()["meta"]["generation"]
    strict_settings = {
        "similarity": 0.98,
        "time_proximity_seconds": 0,
        "raw_jpeg_pairing_confidence": 0.9,
        "exposure_preference": "neutral",
        "sharpness_limit": 0.7,
        "motion_preference": "freeze",
        "order_direction": "asc",
    }
    strict = client.post(
        "/api/v1/stacks/profiles",
        headers=_headers("strict-profile"),
        json={"generation": current_generation, "name": "Strict frames", "settings": strict_settings},
    )
    assert strict.status_code == 202
    strict_profile_id = strict.json()["data"]["id"]
    assert client.get(f"/api/v1/stacks/{default_profile_id}?limit=20").status_code == 200
    assert run_worker_loop(config, once=True).last_job_id == strict.json()["job"]["id"]
    strict_ready = client.get(f"/api/v1/stacks/status?profile_id={strict_profile_id}").json()
    assert strict_ready["data"]["stack_count"] > default_profile["stack_count"]

    repeated = client.post(
        "/api/v1/stacks/profiles",
        headers=_headers("strict-profile-repeat"),
        json={
            "generation": strict_ready["meta"]["generation"],
            "name": "Same normalized strict settings",
            "settings": strict_settings,
        },
    )
    assert repeated.status_code == 200
    assert repeated.json()["data"]["id"] == strict_profile_id
    strict_stacks_first = client.get(f"/api/v1/stacks/{strict_profile_id}?limit=20").json()["data"]["items"]
    strict_stacks_second = client.get(f"/api/v1/stacks/{strict_profile_id}?limit=20").json()["data"]["items"]
    assert [item["stack"]["id"] for item in strict_stacks_first] == [
        item["stack"]["id"] for item in strict_stacks_second
    ]

    override_generation = repeated.json()["meta"]["generation"]
    overridden = client.put(
        f"/api/v1/stacks/{default_profile_id}/{burst['stack']['id']}/cover",
        headers=_headers("cover-override"),
        json={
            "generation": override_generation,
            "revision": burst["stack"]["revision"],
            "cover_entity_id": entities[0],
        },
    )
    assert overridden.status_code == 200
    assert overridden.json()["data"]["media_mutation"] == "none"
    assert overridden.json()["data"]["cover_override_entity_id"] == entities[0]
    replayed = client.put(
        f"/api/v1/stacks/{default_profile_id}/{burst['stack']['id']}/cover",
        headers=_headers("cover-override"),
        json={
            "generation": override_generation,
            "revision": burst["stack"]["revision"],
            "cover_entity_id": entities[0],
        },
    )
    assert replayed.json() == overridden.json()

    stack_library = client.get(
        f"/api/v1/library?stack_profile_id={default_profile_id}&sort=similarity:asc&limit=20"
    )
    assert stack_library.status_code == 202
    assert run_worker_loop(config, once=True).last_job_id == stack_library.json()["job"]["id"]
    stack_library_ready = client.get(
        f"/api/v1/library?stack_profile_id={default_profile_id}&sort=similarity:asc&limit=20"
    )
    assert stack_library_ready.status_code == 200
    library_items = stack_library_ready.json()["data"]["items"]
    assert len(library_items) == default_profile["stack_count"]
    assert all(item["stack"] and item["indicators"]["stack_member_count"] >= 1 for item in library_items)
    assert entities[0] in {item["id"] for item in library_items}
    inspector = client.get(f"/api/v1/library/entities/{entities[0]}").json()
    assert inspector["data"]["stacks"]
    assert {item["field"] for item in inspector["unavailable"]} == {"junk_explanations"}

    reset = client.put(
        f"/api/v1/stacks/{default_profile_id}/{burst['stack']['id']}/cover",
        headers=_headers("cover-reset"),
        json={
            "generation": stack_library_ready.json()["meta"]["generation"],
            "revision": overridden.json()["data"]["revision"],
            "cover_entity_id": burst["stack"]["ranked_cover_entity_id"],
        },
    )
    assert reset.status_code == 200
    assert reset.json()["data"]["cover_override_entity_id"] is None
    assert reset.json()["data"]["cover_explanation"] == burst["stack"]["cover_explanation"]

    latest_generation = reset.json()["meta"]["generation"]
    recovery = client.post(
        "/api/v1/stacks/profiles",
        headers=_headers("recovery-profile"),
        json={
            "generation": latest_generation,
            "name": "Recovery profile",
            "settings": {**strict_settings, "similarity": 0.61},
        },
    )
    recovery_job = recovery.json()["job"]["id"]
    with sqlite3.connect(layout.database) as conn:
        conn.execute("UPDATE background_jobs SET status='running',attempt=1 WHERE job_id=?", (recovery_job,))
        conn.execute("UPDATE stack_profiles SET status='building' WHERE job_id=?", (recovery_job,))
    assert recover_interrupted_stage9_jobs(config) == (recovery_job,)
    assert run_worker_loop(config, once=True).last_job_id == recovery_job

    versioned_config = replace(
        config,
        analyzer_versions=replace(config.analyzer_versions, stack_profile="stack-profile-v2"),
    )
    db = ManifestDB(layout.database)
    try:
        versioned = ensure_stack_profile(
            db,
            versioned_config,
            name="Versioned Stack profile",
            settings=normalize_stack_settings(**strict_settings),
        )
        db.commit()
    finally:
        db.close()
    assert versioned["profile_id"] != strict_profile_id
    assert run_worker_loop(versioned_config, once=True).last_job_id == versioned["job_id"]

    db = ManifestDB(layout.database)
    try:
        plan = stack_candidate_query_plan(
            db,
            catalog_generation=1,
            analyzer_version=config.analyzer_versions.stack_features,
        )
        assert any("idx_stack_inputs_phash_bucket" in value for value in plan)
        assert any("idx_stack_inputs_capture" in value for value in plan)
        assert validate_manifest_connection(db.conn)["foreign_key_issues"] == 0
        tables = {row["name"] for row in db.all("SELECT name FROM sqlite_master WHERE type='table'")}
        assert {"junk_signals", "junk_profiles", "junk_effective_results", "junk_feedback"} <= tables
        assert db.one("SELECT COUNT(*) AS count FROM junk_profiles")["count"] == 0
    finally:
        db.close()
    assert _snapshot(source_root) == source_before
    assert _snapshot(objects_root) == objects_before


def test_stack_boundary_evidence_and_cover_controls_are_deterministic() -> None:
    base_edge = {
        "phash_distance": 4,
        "dhash_distance": 4,
        "color_distance": 0.02,
        "aspect_delta": 0.0,
        "time_delta_seconds": 15.0,
        "equipment_match": 1.0,
        "filename_score": 0.0,
        "raw_pairing_score": 0.79,
        "relationship_score": 0.0,
    }
    permissive = normalize_stack_settings(time_proximity_seconds=30, raw_jpeg_pairing_confidence=0.75)
    strict = normalize_stack_settings(time_proximity_seconds=10, raw_jpeg_pairing_confidence=0.8)
    permissive_score, permissive_evidence = _edge_score(base_edge, permissive)
    strict_score, strict_evidence = _edge_score(base_edge, strict)
    assert permissive_score > strict_score
    assert permissive_evidence["time_score"] == 0.5
    assert strict_evidence["time_score"] == 0.0
    assert permissive_evidence["raw_pairing_score"] == 0.79
    assert strict_evidence["raw_pairing_score"] == 0.0

    def row(**overrides: float) -> dict[str, float | int]:
        return {
            "edit_likelihood": 0.0,
            "underexposure_score": 0.0,
            "overexposure_score": 0.0,
            "sharpness_score": 0.8,
            "motion_score": 0.2,
            "highlight_clipping_score": 0.0,
            "corruption_score": 0.0,
            "resolution_pixels": 24_000_000,
            **overrides,
        }

    exposure_rows = {
        "pe1_darker": row(underexposure_score=0.2, overexposure_score=0.0),
        "pe1_brighter": row(underexposure_score=0.0, overexposure_score=0.2),
    }
    filenames = {entity_id: f"{entity_id}.jpg" for entity_id in exposure_rows}
    darker = normalize_stack_settings(exposure_preference="darker")
    brighter = normalize_stack_settings(exposure_preference="brighter")
    assert _rank_cover(list(exposure_rows), exposure_rows, darker, filenames)[0] == "pe1_darker"
    assert _rank_cover(list(exposure_rows), exposure_rows, brighter, filenames)[0] == "pe1_brighter"

    motion_rows = {"pe1_freeze": row(motion_score=0.0), "pe1_blur": row(motion_score=1.0)}
    motion_names = {entity_id: f"{entity_id}.jpg" for entity_id in motion_rows}
    assert _rank_cover(
        list(motion_rows), motion_rows, normalize_stack_settings(motion_preference="freeze"), motion_names
    )[0] == "pe1_freeze"
    assert _rank_cover(
        list(motion_rows),
        motion_rows,
        normalize_stack_settings(motion_preference="intentional_blur"),
        motion_names,
    )[0] == "pe1_blur"

    edit_rows = {
        "pe1_edited": row(edit_likelihood=1.0, sharpness_score=1.0),
        "pe1_unedited": row(sharpness_score=0.1),
    }
    edit_names = {entity_id: f"{entity_id}.jpg" for entity_id in edit_rows}
    cover, _ranked, explanation, evidence = _rank_cover(
        list(edit_rows), edit_rows, normalize_stack_settings(), edit_names
    )
    assert cover == "pe1_unedited"
    assert "unedited candidates were preferred" in explanation
    assert evidence["edited_candidates_excluded"] is True

    tied = {"pe1_a": row(), "pe1_b": row()}
    tied_names = {entity_id: f"{entity_id}.jpg" for entity_id in tied}
    cover, _ranked, explanation, evidence = _rank_cover(list(tied), tied, normalize_stack_settings(), tied_names)
    assert cover == "pe1_a"
    assert "deterministic entity-ID tie-breaker" in explanation
    assert evidence["ranked_explanation"] == explanation


def test_stack_candidate_generation_has_linear_growth_bound(tmp_path: Path) -> None:
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    db = ManifestDB(layout.database)
    db.commit()
    db.execute("PRAGMA foreign_keys=OFF")
    now = utc_now()
    total = 2_000
    db.executemany(
        """INSERT INTO stack_feature_inputs(
               catalog_generation,entity_id,display_asset_id,analyzer_version,input_identity,status,
               phash_hex,dhash_hex,phash_bucket,dhash_bucket,color_histogram_json,aspect_ratio,
               capture_epoch_seconds,capture_bucket,camera_key,filename_key,relationship_count,
               evidence_json,created_at,updated_at,completed_at
           ) VALUES(1,?,?,'stack-features-v1',?,'ready',?,?,?,?,?,1.5,?,?,'camera','burst',0,'{}',?,?,?)""",
        (
            (
                f"scale-entity-{index:06d}",
                f"scale-asset-{index:06d}",
                f"scale-input-{index:06d}",
                f"{index % 64:016x}",
                f"{index % 128:016x}",
                f"{index % 64:04x}",
                f"{index % 128:04x}",
                json.dumps([0.25] * 12),
                float(index * 2),
                index // 150,
                now,
                now,
                now,
            )
            for index in range(total)
        ),
    )
    db.commit()
    edge_count = _materialize_candidate_edges(
        db,
        catalog_generation=1,
        analyzer_version="stack-features-v1",
    )
    assert edge_count <= total * MAX_CANDIDATES_PER_ENTITY
    assert edge_count < total * (total - 1) // 20
    plan = stack_candidate_query_plan(
        db,
        catalog_generation=1,
        analyzer_version="stack-features-v1",
    )
    assert any("idx_stack_inputs_phash_bucket" in value for value in plan)
    assert any("idx_stack_inputs_capture" in value for value in plan)
    assert all("SCAN stack_feature_inputs" not in value for value in plan)
    db.close()
