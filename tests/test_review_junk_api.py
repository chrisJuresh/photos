from __future__ import annotations

import sqlite3
from dataclasses import replace
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from media_vault.core import VaultLayout, utc_now
from media_vault.db import ManifestDB, validate_manifest_connection
from media_vault.review_api import ApiProblem, ApplicationStateStore, create_review_app
from media_vault.review_junk import (
    JUNK_REASONS,
    MINIMUM_CALIBRATION_FEEDBACK,
    ensure_junk_profile,
    junk_result_query_plan,
    normalize_junk_settings,
    recover_interrupted_stage10_jobs,
)
from media_vault.review_runtime import run_worker_loop
from test_review_stacks_api import _fixture, _headers, _snapshot


def _set_features(config, entities: list[str]) -> None:
    layout = VaultLayout(config.vault_root)
    db = ManifestDB(layout.database)
    try:
        assets = {
            str(row["entity_id"]): str(row["display_asset_id"])
            for row in db.all("SELECT entity_id,display_asset_id FROM photo_entities")
        }
        updates = {
            entities[0]: {
                "focus_deficit_score": 0.91,
                "underexposure_score": 0.94,
            },
            entities[1]: {
                "focus_deficit_score": 0.96,
                "directional_shake_score": 0.90,
                "underexposure_score": 0.88,
                "obstruction_score": 0.91,
            },
            entities[2]: {
                "focus_deficit_score": 0.86,
                "thumbnail_likelihood": 0.92,
                "resolution_class": "tiny",
            },
            entities[3]: {},
            entities[4]: {"focus_deficit_score": 0.96},
            entities[5]: {
                "corruption_score": 0.99,
                "incomplete_decode": 1,
                "blockiness_score": 0.94,
                "thumbnail_likelihood": 0.93,
                "overexposure_score": 0.91,
                "highlight_clipping_score": 0.92,
                "blankness_score": 0.95,
                "low_information_score": 0.90,
                "near_black_score": 0.90,
            },
        }
        for entity_id, values in updates.items():
            assignments = [f"{key}=?" for key in values]
            if assignments:
                db.execute(
                    "UPDATE asset_features SET " + ",".join(assignments) + " WHERE asset_id=?",
                    (*values.values(), assets[entity_id]),
                )
        db.execute("UPDATE photo_user_state SET favourite=1 WHERE entity_id=?", (entities[5],))
        db.execute(
            """UPDATE photo_entities SET near_duplicate_count=1 WHERE entity_id IN (?,?)""",
            tuple(entities[1:3]),
        )
        db.execute("UPDATE photo_entities SET exact_duplicate_count=1 WHERE entity_id=?", (entities[5],))
        db.execute("UPDATE photo_entities SET width=4000,height=3000")
        db.execute("UPDATE photo_entities SET width=120,height=90 WHERE entity_id=?", (entities[2],))
        db.execute(
            """UPDATE photo_entities SET filename_text='Screenshot-download.png',
                   primary_path_text='C:/synthetic/downloads/Screenshot-download.png',format_text='PNG',
                   width=4000,height=3000
                 WHERE entity_id=?""",
            (entities[3],),
        )
        db.execute(
            """UPDATE photo_entities SET filename_text='camera-test-chart.jpg',
                   primary_path_text='C:/synthetic/calibration/camera-test-chart.jpg',width=4000,height=3000
                 WHERE entity_id=?""",
            (entities[4],),
        )
        db.commit()
    finally:
        db.close()


def _run_default_stacks(client: TestClient, config) -> tuple[str, dict]:
    status = client.get("/api/v1/stacks/status")
    assert status.status_code == 202
    assert run_worker_loop(config, once=True).last_job_id == status.json()["job"]["id"]
    ready = client.get("/api/v1/stacks/status")
    assert ready.status_code == 200
    page = client.get(f"/api/v1/stacks/{ready.json()['data']['id']}?limit=20").json()["data"]["items"]
    burst = next(item for item in page if item["stack"]["member_count"] >= 3)
    return ready.json()["data"]["id"], burst


def test_junk_profiles_feedback_bulk_reject_undo_and_immutability(
    tmp_path: Path,
) -> None:
    config, static, entities, source_root, objects_root = _fixture(tmp_path)
    _set_features(config, entities)
    source_before = _snapshot(source_root)
    objects_before = _snapshot(objects_root)
    client = TestClient(create_review_app(config, static_root=static), base_url="http://127.0.0.1")
    stack_profile_id, burst = _run_default_stacks(client, config)

    queued = client.get("/api/v1/junk/status")
    assert queued.status_code == 202
    profile_id = queued.json()["data"]["id"]
    job_id = queued.json()["job"]["id"]
    assert run_worker_loop(config, once=True).last_job_id == job_id
    ready = client.get("/api/v1/junk/status")
    assert ready.status_code == 200
    profile = ready.json()["data"]
    assert profile["id"] == profile_id
    assert profile["settings"]["minimum_agreement"] == 2
    assert profile["settings"]["protect_favourites"] is True
    assert profile["effectively_hidden_count"] >= 2
    assert profile["favourite_protected_count"] == 1

    page = client.get(f"/api/v1/junk/{profile_id}?hidden_only=true&limit=20")
    assert page.status_code == 200
    hidden = page.json()["data"]["items"]
    assert hidden
    assert all(item["effective_hidden"] and len(item["reasons"]) >= 2 for item in hidden)
    assert all(item["explanation"].startswith("Hidden because") for item in hidden)
    assert entities[5] not in {item["entity"]["id"] for item in hidden}

    all_results = client.get(f"/api/v1/junk/{profile_id}?hidden_only=false&limit=20").json()["data"]["items"]
    by_id = {item["entity"]["id"]: item for item in all_results}
    assert by_id[entities[0]]["agreement_count"] == 1
    assert by_id[entities[0]]["effective_hidden"] is False
    assert by_id[entities[5]]["favourite_protected"] is True
    assert by_id[entities[3]]["agreement_count"] == 1
    assert by_id[entities[3]]["effective_hidden"] is False
    assert by_id[entities[4]]["agreement_count"] == 1
    assert by_id[entities[4]]["effective_hidden"] is False
    assert any(by_id[entity_id]["better_alternative_entity_id"] for entity_id in entities[:3])
    compared = next(value for value in by_id.values() if value["better_alternative_entity_id"])
    assert compared["better_alternative"]["id"] == compared["better_alternative_entity_id"]

    detail = client.get(f"/api/v1/junk/{profile_id}/entities/{entities[1]}")
    assert detail.status_code == 200
    signals = detail.json()["data"]["signals"]
    assert {signal["reason"] for signal in signals} == set(JUNK_REASONS)
    assert all("method_version" in signal and "threshold" in signal and "evidence" in signal for signal in signals)
    signal_fixtures = {
        signal["reason"]: signal
        for entity_id in entities
        for signal in client.get(f"/api/v1/junk/{profile_id}/entities/{entity_id}").json()["data"]["signals"]
        if signal["confidence"] > 0
    }
    assert set(signal_fixtures) == set(JUNK_REASONS)
    shallow_focus = client.get(f"/api/v1/junk/{profile_id}/entities/{entities[4]}").json()["data"]["signals"]
    focus_signal = next(signal for signal in shallow_focus if signal["reason"] == "focus_deficit")
    assert focus_signal["confidence"] <= 0.69
    assert focus_signal["better_alternative_entity_id"] is None
    inspector = client.get(f"/api/v1/library/entities/{entities[1]}").json()
    assert inspector["data"]["junk"]["result"]["explanation_text"]
    assert inspector["unavailable"] == []

    generation = detail.json()["meta"]["generation"]
    custom = client.post(
        "/api/v1/junk/profiles",
        headers=_headers("custom-junk-profile"),
        json={
            "generation": generation,
            "name": "Shake-only preview",
            "settings": {
                "confidence_threshold": 0.8,
                "enabled_reasons": ["camera_shake"],
                "minimum_agreement": 1,
                "protect_favourites": False,
            },
            "replaces_profile_id": profile_id,
        },
    )
    assert custom.status_code == 202
    assert client.get(f"/api/v1/junk/{profile_id}?limit=20").status_code == 200
    assert run_worker_loop(config, once=True).last_job_id == custom.json()["job"]["id"]
    custom_ready = client.get(f"/api/v1/junk/status?profile_id={custom.json()['data']['id']}")
    assert custom_ready.status_code == 200
    assert custom_ready.json()["data"]["effectively_hidden_count"] >= 1

    generation = custom_ready.json()["meta"]["generation"]
    for index in range(MINIMUM_CALIBRATION_FEEDBACK):
        feedback = client.post(
            f"/api/v1/junk/{profile_id}/feedback",
            headers=_headers(f"junk-feedback-{index}"),
            json={
                "generation": generation,
                "entity_id": entities[1],
                "feedback_kind": "false_positive",
                "comment": "Synthetic calibration evidence",
            },
        )
        assert feedback.status_code == 201
        if index < MINIMUM_CALIBRATION_FEEDBACK - 1:
            assert feedback.json()["data"]["calibration_job_id"] is None
        generation = feedback.json()["meta"]["generation"]
    calibration_job = feedback.json()["data"]["calibration_job_id"]
    assert calibration_job
    feedback_audit = client.get(f"/api/v1/junk/{profile_id}/entities/{entities[1]}").json()["data"]["feedback"]
    assert len(feedback_audit[0]["signal_snapshot"]["signals"]) == len(JUNK_REASONS)
    assert all("input_identity" in value for value in feedback_audit[0]["signal_snapshot"]["signals"])
    assert run_worker_loop(config, once=True).last_job_id == calibration_job
    calibration_state = client.get(f"/api/v1/jobs/{calibration_job}").json()["data"]
    calibrated_profile_id = calibration_state["progress"]["calibrated_profile_id"]
    materialization_job_id = calibration_state["progress"]["materialization_job_id"]
    assert run_worker_loop(config, once=True).last_job_id == materialization_job_id
    profiles = client.get("/api/v1/junk/profiles?limit=100").json()["data"]
    calibrated = next(value for value in profiles if value["id"] == calibrated_profile_id)
    original = next(value for value in profiles if value["id"] == profile_id)
    assert calibrated["calibration_parent_profile_id"] == profile_id
    assert calibrated["settings"]["confidence_threshold"] == pytest.approx(
        original["settings"]["confidence_threshold"] + 0.05
    )
    assert original["status"] == "ready"

    hidden_entity = hidden[0]["entity"]
    generation = client.get("/api/v1/system").json()["meta"]["generation"]
    rejected = client.post(
        "/api/v1/library/bulk-reject",
        headers=_headers("bulk-reject-1"),
        json={
            "generation": generation,
            "entities": [{"entity_id": hidden_entity["id"], "expected_revision": hidden_entity["state"]["revision"]}],
            "confirm": True,
            "confirm_favourites": False,
            "confirm_large_selection": False,
        },
    )
    assert rejected.status_code == 200
    assert rejected.json()["data"]["media_mutation"] == "none"
    replay = client.post(
        "/api/v1/library/bulk-reject",
        headers=_headers("bulk-reject-1"),
        json={
            "generation": generation,
            "entities": [{"entity_id": hidden_entity["id"], "expected_revision": hidden_entity["state"]["revision"]}],
            "confirm": True,
            "confirm_favourites": False,
            "confirm_large_selection": False,
        },
    )
    assert replay.json() == rejected.json()
    undone = client.post(
        "/api/v1/library/bulk-reject/undo",
        headers=_headers("bulk-undo-1"),
        json={
            "generation": rejected.json()["meta"]["generation"],
            "action_id": rejected.json()["data"]["action_id"],
        },
    )
    assert undone.status_code == 200
    assert undone.json()["data"]["states"][0]["rejected"] is False
    conflict = client.post(
        "/api/v1/library/bulk-reject",
        headers=_headers("bulk-conflict"),
        json={
            "generation": undone.json()["meta"]["generation"],
            "entities": [{"entity_id": hidden_entity["id"], "expected_revision": hidden_entity["state"]["revision"]}],
            "confirm": True,
            "confirm_favourites": False,
            "confirm_large_selection": False,
        },
    )
    assert conflict.status_code == 409

    favourite_detail = client.get(f"/api/v1/library/entities/{entities[5]}").json()["data"]["entity"]
    favourite_refusal = client.post(
        "/api/v1/library/bulk-reject",
        headers=_headers("favourite-refusal"),
        json={
            "generation": undone.json()["meta"]["generation"],
            "entities": [{"entity_id": entities[5], "expected_revision": favourite_detail["state"]["revision"]}],
            "confirm": True,
            "confirm_favourites": False,
            "confirm_large_selection": False,
        },
    )
    assert favourite_refusal.status_code == 409
    confirmed = client.post(
        "/api/v1/library/bulk-reject",
        headers=_headers("favourite-confirmed"),
        json={
            "generation": undone.json()["meta"]["generation"],
            "entities": [{"entity_id": entities[5], "expected_revision": favourite_detail["state"]["revision"]}],
            "confirm": True,
            "confirm_favourites": True,
            "confirm_large_selection": False,
        },
    )
    assert confirmed.status_code == 200
    assert confirmed.json()["data"]["states"][0]["favourite"] is True

    current_generation = confirmed.json()["meta"]["generation"]
    stack_detail = client.get(f"/api/v1/stacks/{stack_profile_id}/{burst['stack']['id']}").json()["data"]
    reject_rest = client.post(
        f"/api/v1/stacks/{stack_profile_id}/{burst['stack']['id']}/reject-rest",
        headers=_headers("reject-stack-rest"),
        json={
            "generation": current_generation,
            "stack_revision": stack_detail["stack"]["revision"],
            "confirm": True,
            "confirm_favourites": True,
            "confirm_large_selection": False,
        },
    )
    assert reject_rest.status_code == 200
    assert reject_rest.json()["data"]["preserved_cover_entity_id"] == stack_detail["stack"]["cover_entity_id"]
    assert all(value["entity_id"] != stack_detail["stack"]["cover_entity_id"] for value in reject_rest.json()["data"]["states"])
    stack_undo = client.post(
        "/api/v1/library/bulk-reject/undo",
        headers=_headers("undo-stack-rest"),
        json={
            "generation": reject_rest.json()["meta"]["generation"],
            "action_id": reject_rest.json()["data"]["action_id"],
        },
    )
    assert stack_undo.status_code == 200

    current_entity = client.get(f"/api/v1/library/entities/{entities[1]}").json()["data"]["entity"]
    assert client.get(f"/api/v1/junk/{profile_id}/entities/{entities[1]}").json()["data"]["result"]["effective_hidden"]
    favourite = client.put(
        "/api/v1/library/state",
        headers=_headers("favourite-after-junk"),
        json={
            "generation": stack_undo.json()["meta"]["generation"],
            "states": [{
                "entity_id": entities[1],
                "expected_revision": current_entity["state"]["revision"],
                "favourite": True,
                "rejected": current_entity["state"]["rejected"],
                "rating": current_entity["state"]["rating"],
            }],
        },
    )
    assert favourite.status_code == 200
    protected_result = client.get(f"/api/v1/junk/{profile_id}/entities/{entities[1]}").json()["data"]["result"]
    assert protected_result["effective_hidden"] is False
    assert protected_result["favourite_protected"] is True
    unfavourite = client.put(
        "/api/v1/library/state",
        headers=_headers("unfavourite-after-junk"),
        json={
            "generation": favourite.json()["meta"]["generation"],
            "states": [{
                "entity_id": entities[1],
                "expected_revision": favourite.json()["data"]["states"][0]["revision"],
                "favourite": False,
                "rejected": current_entity["state"]["rejected"],
                "rating": current_entity["state"]["rating"],
            }],
        },
    )
    assert unfavourite.status_code == 200
    restored_result = client.get(f"/api/v1/junk/{profile_id}/entities/{entities[1]}").json()["data"]["result"]
    assert restored_result["effective_hidden"] is True
    assert restored_result["favourite_protected"] is False

    restarted = TestClient(create_review_app(config, static_root=static), base_url="http://127.0.0.1")
    assert restarted.get(f"/api/v1/junk/{profile_id}?limit=20").status_code == 200
    with sqlite3.connect(VaultLayout(config.vault_root).database) as conn:
        assert conn.execute(
            "SELECT COUNT(*) FROM photo_user_state_events WHERE undo_of_event_id IS NOT NULL"
        ).fetchone()[0] >= 2
    assert _snapshot(source_root) == source_before
    assert _snapshot(objects_root) == objects_before


def test_junk_recovery_versions_query_plan_and_bulk_safeguards(tmp_path: Path) -> None:
    config, static, entities, _source_root, _objects_root = _fixture(tmp_path)
    client = TestClient(create_review_app(config, static_root=static), base_url="http://127.0.0.1")
    _run_default_stacks(client, config)
    queued = client.get("/api/v1/junk/status").json()
    job_id = queued["job"]["id"]
    with sqlite3.connect(VaultLayout(config.vault_root).database) as conn:
        conn.execute("UPDATE background_jobs SET status='running',attempt=1 WHERE job_id=?", (job_id,))
        conn.execute("UPDATE junk_profiles SET status='building' WHERE job_id=?", (job_id,))
    assert recover_interrupted_stage10_jobs(config) == (job_id,)
    assert run_worker_loop(config, once=True).last_job_id == job_id

    db = ManifestDB(VaultLayout(config.vault_root).database)
    try:
        plan = junk_result_query_plan(db, queued["data"]["id"])
        assert any("idx_junk_results_hidden_page" in value for value in plan)
        assert db.one("SELECT COUNT(*) AS count FROM junk_signals")["count"] == len(entities) * len(JUNK_REASONS)
        assert validate_manifest_connection(db.conn)["foreign_key_issues"] == 0
    finally:
        db.close()

    with sqlite3.connect(VaultLayout(config.vault_root).database) as conn:
        display_asset_id = conn.execute(
            "SELECT display_asset_id FROM photo_entities WHERE entity_id=?",
            (entities[0],),
        ).fetchone()[0]
        conn.execute(
            "UPDATE asset_features SET input_identity='changed-feature-input' WHERE asset_id=? AND is_current=1",
            (display_asset_id,),
        )
    db = ManifestDB(VaultLayout(config.vault_root).database)
    try:
        refreshed = ensure_junk_profile(
            db,
            config,
            name="Refreshed input profile",
            settings=normalize_junk_settings(confidence_threshold=0.71),
        )
        db.commit()
    finally:
        db.close()
    assert run_worker_loop(config, once=True).last_job_id == refreshed["job_id"]
    with sqlite3.connect(VaultLayout(config.vault_root).database) as conn:
        assert conn.execute("SELECT COUNT(*) FROM junk_signals WHERE is_current=1").fetchone()[0] == len(entities) * len(JUNK_REASONS)
        assert conn.execute("SELECT COUNT(*) FROM junk_signals").fetchone()[0] == (len(entities) + 1) * len(JUNK_REASONS)

    versioned_config = replace(
        config,
        analyzer_versions=replace(
            config.analyzer_versions,
            junk_signals="junk-signals-v2",
            junk_profile="junk-profile-v2",
        ),
    )
    db = ManifestDB(VaultLayout(config.vault_root).database)
    try:
        versioned = ensure_junk_profile(
            db,
            versioned_config,
            name="Versioned junk profile",
            settings=normalize_junk_settings(),
        )
        db.commit()
    finally:
        db.close()
    assert versioned["profile_id"] != queued["data"]["id"]
    assert run_worker_loop(versioned_config, once=True).last_job_id == versioned["job_id"]
    versioned_client = TestClient(
        create_review_app(versioned_config, static_root=static),
        base_url="http://127.0.0.1",
    )
    original_signals = versioned_client.get(
        f"/api/v1/junk/{queued['data']['id']}/entities/{entities[0]}"
    ).json()["data"]["signals"]
    versioned_signals = versioned_client.get(
        f"/api/v1/junk/{versioned['profile_id']}/entities/{entities[0]}"
    ).json()["data"]["signals"]
    assert {signal["method_version"] for signal in original_signals} == {"junk-signals-v1"}
    assert {signal["method_version"] for signal in versioned_signals} == {"junk-signals-v2"}

    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    try:
        with pytest.raises(ApiProblem, match="more than 100"):
            ApplicationStateStore._reject_selection(
                conn,
                entity_ids=[f"entity-{index}" for index in range(101)],
                expected_revisions=None,
                action="bulk_reject",
                action_id="large",
                confirm_favourites=False,
                confirm_large_selection=False,
            )
    finally:
        conn.close()

    now = utc_now()
    assert now.endswith("Z")
