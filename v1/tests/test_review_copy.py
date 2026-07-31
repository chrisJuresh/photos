from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest
from PIL import Image

import media_vault.review_copy as copy_module
from media_vault.config import ReviewConfig
from media_vault.core import FullHashes, VaultLayout, hash_file, utc_now
from media_vault.db import ManifestDB
from media_vault.preprocess import PreprocessingService
from media_vault.review_copy import (
    ApprovalConflictError,
    ETA_CONFIDENCE_LABELS,
    LegacyImportHistoryService,
    ReviewedImportService,
    estimate_eta,
    run_reviewed_copy_job,
)
from media_vault.review_imports import (
    DecisionRequest,
    ImportDiscoveryService,
    ImportManifestService,
)


class SyntheticMetadataReader:
    def read_batch(self, paths: list[Path]) -> list[dict[str, Any]]:
        output: list[dict[str, Any]] = []
        for path in paths:
            if path.suffix.casefold() == ".png":
                output.append({"File:MIMEType": "image/png", "File:FileType": "PNG"})
            elif path.suffix.casefold() == ".jpg":
                output.append({"File:MIMEType": "image/jpeg", "File:FileType": "JPEG"})
            elif path.suffix.casefold() in {".xmp", ".txt"}:
                output.append({"File:MIMEType": "text/plain", "File:FileType": "TXT"})
            else:
                output.append({})
        return output


def _snapshot_tree(root: Path) -> dict[str, tuple[str, int, int, int, int, str | None]]:
    result: dict[str, tuple[str, int, int, int, int, str | None]] = {}
    for path in sorted(root.rglob("*")):
        stat = path.stat(follow_symlinks=False)
        digest = hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None
        result[str(path.relative_to(root))] = (
            "file" if path.is_file() else "directory",
            stat.st_size,
            stat.st_mtime_ns,
            stat.st_ctime_ns,
            int(getattr(stat, "st_file_attributes", 0)),
            digest,
        )
    return result


def _snapshot_file(path: Path) -> tuple[int, int, int, int, str]:
    stat = path.stat()
    return (
        stat.st_size,
        stat.st_mtime_ns,
        stat.st_ctime_ns,
        int(getattr(stat, "st_file_attributes", 0)),
        hashlib.sha256(path.read_bytes()).hexdigest(),
    )


def _make_png(path: Path, color: tuple[int, int, int]) -> None:
    Image.new("RGB", (9, 7), color).save(path)


def _insert_existing_asset(db: ManifestDB, layout: VaultLayout, content: bytes) -> tuple[FullHashes, Path]:
    object_path = layout.objects / "sha256" / "ee" / "ff" / "existing.blob"
    object_path.parent.mkdir(parents=True, exist_ok=True)
    object_path.write_bytes(content)
    hashes = hash_file(object_path)
    now = utc_now()
    db.execute(
        """INSERT INTO runs(
               run_id,command,status,started_at,completed_at,vault_root,host,tool_version,arguments_json
           ) VALUES(?,?,?,?,?,?,?,?,?)""",
        ("run-existing", "synthetic", "completed", now, now, str(layout.root), "test", "test", "{}"),
    )
    db.execute(
        """INSERT INTO exact_groups(
               exact_group_id,size_bytes,sha256,blake3,sha512,verification_method,created_at
           ) VALUES(?,?,?,?,?,?,?)""",
        (hashes.exact_group_id, *hashes.identity_key, "synthetic", now),
    )
    db.execute(
        """INSERT INTO assets(
               asset_id,exact_group_id,size_bytes,sha256,blake3,sha512,hash_algorithm_versions_json,
               media_kind,object_relpath,object_status,object_verified_at,created_run_id,created_at,updated_at
           ) VALUES(?,?,?,?,?,?,?,'image',?,'verified',?,'run-existing',?,?)""",
        (
            hashes.asset_id,
            hashes.exact_group_id,
            *hashes.identity_key,
            "{}",
            str(object_path.relative_to(layout.root)),
            now,
            now,
            now,
        ),
    )
    db.commit()
    return hashes, object_path


def _setup_review_batch(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    inbox = tmp_path / "inbox"
    batch_root = inbox / "Batch A"
    vault_root = tmp_path / "vault"
    batch_root.mkdir(parents=True)
    layout = VaultLayout(vault_root)
    layout.create()
    db = ManifestDB(layout.database)

    existing_source = tmp_path / "existing-source.png"
    _make_png(existing_source, (90, 80, 70))
    existing_bytes = existing_source.read_bytes()
    _existing_hashes, existing_object = _insert_existing_asset(db, layout, existing_bytes)
    existing_source.unlink()

    _make_png(batch_root / "a.png", (10, 20, 30))
    (batch_root / "a.png.xmp").write_text("<xmp>synthetic sidecar</xmp>", encoding="utf-8")
    (batch_root / "duplicate-a.png").write_bytes((batch_root / "a.png").read_bytes())
    (batch_root / "duplicate-existing.png").write_bytes(existing_bytes)
    _make_png(batch_root / "excluded.png", (100, 110, 120))
    (batch_root / "notes.txt").write_text("unrelated", encoding="utf-8")

    config = ReviewConfig(vault_root=vault_root, inbox_root=inbox)
    discovery = ImportDiscoveryService(
        db,
        layout,
        config,
        metadata_reader=SyntheticMetadataReader(),
        allow_unsafe_atime=True,
    )
    batch = discovery.discover_batches()[0]
    summary = discovery.scan_batch(batch.batch_id)
    manifest = ImportManifestService(db, config)
    excluded = db.one(
        "SELECT item_id,decision_revision FROM import_items WHERE batch_id=? AND relative_path_text='excluded.png'",
        (batch.batch_id,),
    )
    assert excluded is not None
    manifest.set_decision(
        DecisionRequest(
            excluded["item_id"],
            "exclude",
            "synthetic exclusion",
            expected_revision=int(excluded["decision_revision"]),
        )
    )
    summary = manifest.batch_summary(batch.batch_id)
    preprocessor = PreprocessingService(
        db,
        layout,
        config,
        metadata_reader=SyntheticMetadataReader(),
        allow_unsafe_atime=True,
    )
    for job_id in preprocessor.prepare_review_batch(batch.batch_id):
        preprocessor.run_job(job_id, worker_id="synthetic-preview-worker")
    summary = manifest.batch_summary(batch.batch_id)
    assert summary.status == "awaiting_review"
    monkeypatch.setattr(
        copy_module,
        "disk_usage_for",
        lambda _path: SimpleNamespace(total=100 * 1024**3, used=1 * 1024**3, free=99 * 1024**3),
    )
    service = ReviewedImportService(db, layout, config, allow_unsafe_atime=True, lease_seconds=0.1)
    return db, layout, config, service, summary, batch_root, existing_object


def _approve_and_claim(service: ReviewedImportService, summary: Any):
    approval = service.approve_batch(summary.batch_id, expected_revision=summary.revision)
    job_id = service.authorize_execution(approval.approval_id, execute=True, max_attempts=10)
    claim = service.jobs.claim_job(job_id, "synthetic-worker")
    return approval, job_id, claim


def test_reviewed_copy_requires_two_gates_and_reconciles_history_and_immutability(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    db, layout, _config, service, summary, batch_root, existing_object = _setup_review_batch(
        tmp_path, monkeypatch
    )
    source_before = _snapshot_tree(batch_root)
    canonical_before = _snapshot_file(existing_object)
    object_count_before = len(list(layout.objects.rglob("*.blob")))

    approval = service.approve_batch(summary.batch_id, expected_revision=summary.revision)
    assert approval.included_count == 4
    assert approval.eligible_count == 4
    assert approval.excluded_count == 2
    assert approval.duplicate_count == 2
    assert approval.sidecar_count == 1
    assert approval.sufficient_free_space is True
    with pytest.raises(ValueError, match="explicit execute"):
        service.authorize_execution(approval.approval_id, execute=False)
    assert len(list(layout.objects.rglob("*.blob"))) == object_count_before

    monkeypatch.setattr(
        copy_module,
        "disk_usage_for",
        lambda _path: SimpleNamespace(total=100 * 1024**3, used=100 * 1024**3 - 1, free=1),
    )
    with pytest.raises(RuntimeError, match="free space changed"):
        service.authorize_execution(approval.approval_id, execute=True)
    monkeypatch.setattr(
        copy_module,
        "disk_usage_for",
        lambda _path: SimpleNamespace(total=100 * 1024**3, used=1 * 1024**3, free=99 * 1024**3),
    )

    job_id = service.authorize_execution(approval.approval_id, execute=True)
    claim = service.jobs.claim_job(job_id, "synthetic-worker")
    result = service.run_claim(claim)
    assert result.status == "complete", json.dumps(service.errors(summary.batch_id), indent=2)
    assert result.failed_count == 0
    assert result.copied_count == 2
    assert result.duplicate_count == 2
    assert result.skipped_count == 3  # excluded media, unrelated file, and structural batch folder
    assert result.transferred_bytes > 0
    assert result.verified_bytes > result.transferred_bytes

    assert _snapshot_tree(batch_root) == source_before
    assert _snapshot_file(existing_object) == canonical_before
    assert len(list(layout.objects.rglob("*.blob"))) == object_count_before + 2
    for row in db.all("SELECT * FROM assets WHERE object_status='verified'"):
        object_path = layout.root / row["object_relpath"]
        assert hash_file(object_path) == FullHashes(
            int(row["size_bytes"]), row["sha256"], row["blake3"], row["sha512"]
        )

    excluded = db.one(
        "SELECT * FROM import_items WHERE batch_id=? AND relative_path_text='excluded.png'",
        (summary.batch_id,),
    )
    unrelated = db.one(
        "SELECT * FROM import_items WHERE batch_id=? AND relative_path_text='notes.txt'",
        (summary.batch_id,),
    )
    assert excluded["copy_status"] == "excluded"
    assert excluded["copied_asset_id"] is None
    assert unrelated["copy_status"] == "excluded"
    assert unrelated["copied_asset_id"] is None

    batch = db.one("SELECT * FROM import_batches WHERE batch_id=?", (summary.batch_id,))
    root = db.one(
        "SELECT * FROM import_folder_progress WHERE batch_id=? AND relative_path_text='.'",
        (summary.batch_id,),
    )
    assert batch["status"] == "complete"
    assert root["processed_count"] == batch["processed_count"]
    assert root["verified_bytes"] == batch["verified_bytes"]
    samples = service.progress_samples(summary.batch_id)
    assert samples
    assert {sample["eta_confidence"] for sample in samples} <= ETA_CONFIDENCE_LABELS
    assert any(sample["phase"] == "verifying" for sample in samples)
    assert any(event["event_type"] == "copy_execute_authorized" for event in service.events(summary.batch_id))
    assert service.errors(summary.batch_id) == ()
    assert not list(layout.temp.glob("*.partial"))
    assert db.one("PRAGMA foreign_key_check") is None
    db.close()


def test_destination_conflict_is_recorded_without_overwrite(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    db, layout, _config, service, summary, batch_root, existing_object = _setup_review_batch(
        tmp_path, monkeypatch
    )
    source_before = _snapshot_tree(batch_root)
    canonical_before = _snapshot_file(existing_object)
    row = db.one(
        "SELECT * FROM import_items WHERE batch_id=? AND relative_path_text='a.png'",
        (summary.batch_id,),
    )
    expected = FullHashes(int(row["hashed_size_bytes"]), row["sha256"], row["blake3"], row["sha512"])
    conflict = layout.root / expected.object_relpath
    conflict.parent.mkdir(parents=True, exist_ok=True)
    conflict.write_bytes(b"synthetic conflicting canonical path")
    conflict_before = _snapshot_file(conflict)

    _approval, _job_id, claim = _approve_and_claim(service, summary)
    result = service.run_claim(claim)
    assert result.status == "failed"
    assert _snapshot_file(conflict) == conflict_before
    assert _snapshot_file(existing_object) == canonical_before
    assert _snapshot_tree(batch_root) == source_before
    errors = service.errors(summary.batch_id)
    assert any(error["code"] == "destination_conflict" and not error["retryable"] for error in errors)
    assert not list(layout.temp.glob("*.partial"))
    db.close()


def test_lock_owning_copy_entry_point_refuses_a_live_writer(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    db, layout, config, service, summary, batch_root, existing_object = _setup_review_batch(
        tmp_path, monkeypatch
    )
    source_before = _snapshot_tree(batch_root)
    canonical_before = _snapshot_file(existing_object)
    approval = service.approve_batch(summary.batch_id, expected_revision=summary.revision)
    job_id = service.authorize_execution(approval.approval_id, execute=True)
    db.close()

    lock = layout.state / "active-writer.lock"
    lock.write_text(
        json.dumps({"pid": os.getpid(), "token": "live-test", "command": "synthetic-writer"}),
        encoding="utf-8",
    )
    try:
        with pytest.raises(RuntimeError, match="Another vault writer is active"):
            run_reviewed_copy_job(config, job_id, allow_unsafe_atime=True)
    finally:
        lock.unlink()
    assert _snapshot_tree(batch_root) == source_before
    assert _snapshot_file(existing_object) == canonical_before

    result = run_reviewed_copy_job(config, job_id, allow_unsafe_atime=True)
    assert result.status == "complete"
    assert _snapshot_tree(batch_root) == source_before
    assert _snapshot_file(existing_object) == canonical_before


@pytest.mark.parametrize(
    "boundary",
    (
        "before_copy",
        "after_temp_created",
        "after_copy_fsync",
        "after_reopen_hash",
        "after_byte_compare",
        "after_publication",
        "after_telemetry_commit",
    ),
)
def test_fault_injection_restart_is_idempotent_at_every_publication_boundary(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    boundary: str,
) -> None:
    db, layout, _config, service, summary, batch_root, existing_object = _setup_review_batch(
        tmp_path, monkeypatch
    )
    source_before = _snapshot_tree(batch_root)
    canonical_before = _snapshot_file(existing_object)
    _approval, job_id, claim = _approve_and_claim(service, summary)
    raised = False

    def crash(current_boundary: str, _item_id: str | None) -> None:
        nonlocal raised
        if current_boundary == boundary and not raised:
            raised = True
            raise KeyboardInterrupt(f"synthetic crash at {boundary}")

    with pytest.raises(KeyboardInterrupt, match="synthetic crash"):
        service.run_claim(claim, fault_hook=crash)
    assert raised is True
    assert db.one("SELECT status FROM background_jobs WHERE job_id=?", (job_id,))["status"] == "interrupted"
    assert not list(layout.temp.glob("*.partial"))

    service.jobs.retry(job_id)
    resumed = service.jobs.claim_job(job_id, "restart-worker")
    result = service.run_claim(resumed)
    assert result.status == "complete"
    assert result.failed_count == 0
    assert _snapshot_tree(batch_root) == source_before
    assert _snapshot_file(existing_object) == canonical_before
    assert len(db.all("SELECT * FROM background_job_attempts WHERE job_id=?", (job_id,))) == 2
    assert len(list(layout.objects.rglob("*.blob"))) == 3
    assert not list(layout.temp.glob("*.partial"))
    assert db.one("PRAGMA foreign_key_check") is None
    db.close()


def test_pause_resume_cancel_and_reapproval_retain_verified_objects(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    pause_root = tmp_path / "pause"
    db, layout, _config, service, summary, batch_root, existing_object = _setup_review_batch(
        pause_root, monkeypatch
    )
    source_before = _snapshot_tree(batch_root)
    canonical_before = _snapshot_file(existing_object)
    _approval, job_id, claim = _approve_and_claim(service, summary)
    requested = False

    def pause_after_fsync(boundary: str, _item_id: str | None) -> None:
        nonlocal requested
        if boundary == "after_copy_fsync" and not requested:
            requested = True
            assert service.jobs.request_pause(job_id) == "running"

    paused = service.run_claim(claim, fault_hook=pause_after_fsync)
    assert paused.status == "paused", service.errors(summary.batch_id)
    assert not list(layout.temp.glob("*.partial"))
    service.jobs.resume(job_id)
    completed = service.run_claim(service.jobs.claim_job(job_id, "resume-worker"))
    assert completed.status == "complete"
    assert _snapshot_tree(batch_root) == source_before
    assert _snapshot_file(existing_object) == canonical_before
    db.close()

    cancel_root = tmp_path / "cancel"
    db, layout, _config, service, summary, batch_root, existing_object = _setup_review_batch(
        cancel_root, monkeypatch
    )
    source_before = _snapshot_tree(batch_root)
    canonical_before = _snapshot_file(existing_object)
    _approval, job_id, claim = _approve_and_claim(service, summary)
    requested = False

    def cancel_after_commit(boundary: str, _item_id: str | None) -> None:
        nonlocal requested
        if boundary == "after_telemetry_commit" and not requested:
            requested = True
            assert service.jobs.request_cancel(job_id) == "running"

    cancelled = service.run_claim(claim, fault_hook=cancel_after_commit)
    assert cancelled.status == "cancelled"
    verified_before_retry = {
        row["copied_asset_id"]
        for row in db.all(
            "SELECT copied_asset_id FROM import_items WHERE batch_id=? AND copy_status='verified'",
            (summary.batch_id,),
        )
    }
    assert verified_before_retry
    cancelled_summary = ImportManifestService(db, service.config).batch_summary(summary.batch_id)
    approval = service.approve_batch(summary.batch_id, expected_revision=cancelled_summary.revision)
    retry_job = service.authorize_execution(approval.approval_id, execute=True)
    finished = service.run_claim(service.jobs.claim_job(retry_job, "reapproval-worker"))
    assert finished.status == "complete"
    assert verified_before_retry <= {
        row["copied_asset_id"]
        for row in db.all(
            "SELECT copied_asset_id FROM import_items WHERE batch_id=? AND copy_status='verified'",
            (summary.batch_id,),
        )
    }
    assert _snapshot_tree(batch_root) == source_before
    assert _snapshot_file(existing_object) == canonical_before
    assert not list(layout.temp.glob("*.partial"))
    db.close()


def test_job_lease_recovery_retry_and_eta_confidence(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    db, _layout, _config, service, summary, _batch_root, _existing_object = _setup_review_batch(
        tmp_path, monkeypatch
    )
    _approval, job_id, first = _approve_and_claim(service, summary)
    db.execute(
        "UPDATE background_jobs SET lease_expires_at='2000-01-01T00:00:00.000000Z' WHERE job_id=?",
        (job_id,),
    )
    db.commit()
    assert service.jobs.recover_expired_leases() == (job_id,)
    second = service.jobs.claim_job(job_id, "recovered-worker")
    assert second.attempt == first.attempt + 1
    assert service.jobs.request_cancel(job_id) == "running"
    result = service.run_claim(second)
    assert result.status == "cancelled"
    details = tuple(
        row[3]
        for row in db.all(
            """EXPLAIN QUERY PLAN SELECT job_id FROM background_jobs
               WHERE status='queued' ORDER BY priority DESC,created_at,job_id LIMIT 1"""
        )
    )
    assert any("idx_background_jobs_claim" in detail for detail in details)

    assert estimate_eta([], 100).confidence == "learning"
    assert estimate_eta([10, 11], 100).confidence == "learning"
    assert estimate_eta([10, 30, 5], 100).confidence == "low"
    assert estimate_eta([10, 11, 10, 10, 11, 10], 100).confidence == "medium"
    high = estimate_eta([100, 101, 99, 100, 100, 101, 99, 100, 101, 99], 1000)
    assert high.confidence == "high"
    assert high.eta_seconds == pytest.approx(1000 / high.ewma_throughput_bps)
    db.close()


def test_approval_conflict_and_legacy_backfill_preserve_unknowns(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    db, layout, _config, service, summary, batch_root, existing_object = _setup_review_batch(
        tmp_path, monkeypatch
    )
    source_before = _snapshot_tree(batch_root)
    canonical_before = _snapshot_file(existing_object)
    approval = service.approve_batch(summary.batch_id, expected_revision=summary.revision)
    item = db.one(
        "SELECT item_id,decision_revision FROM import_items WHERE batch_id=? AND relative_path_text='a.png'",
        (summary.batch_id,),
    )
    ImportManifestService(db, service.config).set_decision(
        DecisionRequest(
            item["item_id"],
            "exclude",
            "changed after approval",
            expected_revision=int(item["decision_revision"]),
        )
    )
    with pytest.raises(ApprovalConflictError, match="changed after approval"):
        service.authorize_execution(approval.approval_id, execute=True)
    assert len(list(layout.objects.rglob("*.blob"))) == 1

    now = utc_now()
    db.execute(
        """INSERT INTO runs(
               run_id,command,status,started_at,completed_at,source_root,vault_root,host,tool_version,
               arguments_json,summary_json
           ) VALUES(?, 'import','completed',?,?,?,?,?,?,?,?)""",
        (
            "run-legacy",
            now,
            now,
            "X:\\legacy",
            str(layout.root),
            "test",
            "old",
            "{}",
            json.dumps({"import": {"copied": 2, "bytes_copied": 123}}),
        ),
    )
    db.commit()
    history = LegacyImportHistoryService(db, layout)
    assert history.backfill() == 1
    row = db.one("SELECT * FROM legacy_import_history WHERE run_id='run-legacy'")
    metrics = json.loads(row["metrics_json"])
    unavailable = json.loads(row["unavailable_metrics_json"])
    assert metrics["processed_count"] == 2
    assert metrics["transferred_bytes"] == 123
    assert unavailable["eta_seconds"] == "not recorded by this version"
    assert any(item["history_kind"] == "legacy_import" for item in history.history())
    assert any(item["history_kind"] == "reviewed_import" for item in history.history())
    assert _snapshot_tree(batch_root) == source_before
    assert _snapshot_file(existing_object) == canonical_before
    db.close()
