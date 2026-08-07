from __future__ import annotations

import hashlib
import io
import json
import os
from pathlib import Path
from types import SimpleNamespace
from typing import Any

import pytest
from fastapi.testclient import TestClient
from PIL import Image

import media_vault.preprocess as preprocess_module
import media_vault.review_copy as copy_module
from media_vault.config import AnalyzerVersions, ReviewConfig
from media_vault.core import FullHashes, VaultLayout, hash_stream, is_within, utc_now
from media_vault.db import ManifestDB
from media_vault.preprocess import PreprocessLimits, PreprocessingService, run_preprocessing_job
from media_vault.review_copy import ReviewedImportService
from media_vault.review_imports import ImportDiscoveryService, ImportManifestService
from media_vault.ui_server import create_dashboard_app


class SyntheticMetadataReader:
    def read_batch(self, paths: list[Path]) -> list[dict[str, Any]]:
        return [
            {
                "EXIF:MIMEType": "image/jpeg",
                "EXIF:FileType": "JPEG",
                "EXIF:DateTimeOriginal": "2026:07:21 12:34:56",
                "EXIF:GPSLatitude": 51.5074,
                "EXIF:GPSLatitudeRef": "N",
                "EXIF:GPSLongitude": 0.1278,
                "EXIF:GPSLongitudeRef": "W",
                "EXIF:GPSHPositioningError": 4.5,
                "EXIF:Make": "Synthetic",
                "EXIF:Model": "Golden Camera",
                "EXIF:SerialNumber": "SYN-1",
                "EXIF:LensModel": "Numeric 35mm",
                "EXIF:ISO": 200,
                "EXIF:FNumber": 4.0,
                "EXIF:ExposureTime": "1/125",
                "EXIF:FocalLength": 35.0,
                "EXIF:ExposureCompensation": -0.3,
                "EXIF:Orientation": "Rotate 90 CW",
                "EXIF:Software": "Synthetic Editor",
                "EXIF:History": ["created", "exported"],
            }
            for _path in paths
        ]


class DiscoveryMetadataReader:
    def read_batch(self, paths: list[Path]) -> list[dict[str, Any]]:
        output: list[dict[str, Any]] = []
        for path in paths:
            if path.suffix.casefold() == ".png":
                output.append({"File:MIMEType": "image/png", "File:FileType": "PNG"})
            else:
                output.append({})
        return output


def _image_bytes(
    size: tuple[int, int],
    color: tuple[int, int, int],
    *,
    fmt: str = "PNG",
    orientation: int | None = None,
) -> bytes:
    output = io.BytesIO()
    image = Image.new("RGB", size, color)
    try:
        if orientation is None:
            image.save(output, format=fmt)
        else:
            exif = Image.Exif()
            exif[274] = orientation
            image.save(output, format=fmt, exif=exif)
    finally:
        image.close()
    return output.getvalue()


def _checker_bytes(size: tuple[int, int] = (32, 32)) -> bytes:
    image = Image.new("L", size)
    try:
        image.putdata([255 if (x + y) % 2 else 0 for y in range(size[1]) for x in range(size[0])])
        output = io.BytesIO()
        image.convert("RGB").save(output, format="PNG")
        return output.getvalue()
    finally:
        image.close()


def _insert_asset(
    db: ManifestDB,
    layout: VaultLayout,
    content: bytes,
    *,
    media_kind: str = "image",
    mime_type: str = "image/png",
    detected_format: str = "PNG",
    extension: str = ".png",
) -> tuple[str, Path, FullHashes]:
    hashes = hash_stream(io.BytesIO(content))
    object_path = layout.root / hashes.object_relpath
    object_path.parent.mkdir(parents=True, exist_ok=True)
    object_path.write_bytes(content)
    now = utc_now()
    run_id = f"run-{hashes.asset_id}"
    db.execute(
        """INSERT OR IGNORE INTO runs(
               run_id,command,status,started_at,completed_at,vault_root,host,tool_version,arguments_json
           ) VALUES(?,?,'completed',?,?,?,?,?,?)""",
        (run_id, "synthetic", now, now, str(layout.root), "test", "test", "{}"),
    )
    db.execute(
        """INSERT OR IGNORE INTO exact_groups(
               exact_group_id,size_bytes,sha256,blake3,sha512,verification_method,created_at
           ) VALUES(?,?,?,?,?,?,?)""",
        (hashes.exact_group_id, *hashes.identity_key, "synthetic_fixture", now),
    )
    db.execute(
        """INSERT OR IGNORE INTO assets(
               asset_id,exact_group_id,size_bytes,sha256,blake3,sha512,hash_algorithm_versions_json,
               media_kind,mime_type,detected_format,preferred_extension,object_relpath,object_status,
               object_verified_at,created_run_id,created_at,updated_at,metadata_json
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            hashes.asset_id,
            hashes.exact_group_id,
            *hashes.identity_key,
            "{}",
            media_kind,
            mime_type,
            detected_format,
            extension,
            hashes.object_relpath,
            "verified",
            now,
            run_id,
            now,
            now,
            "{}",
        ),
    )
    db.commit()
    return hashes.asset_id, object_path, hashes


def _snapshot_file(path: Path) -> tuple[int, int, int, int, str]:
    stat = path.stat()
    return (
        stat.st_size,
        stat.st_mtime_ns,
        stat.st_ctime_ns,
        int(getattr(stat, "st_file_attributes", 0)),
        hashlib.sha256(path.read_bytes()).hexdigest(),
    )


def _snapshot_tree(root: Path) -> dict[str, tuple[str, int, int, int, int, str | None]]:
    result: dict[str, tuple[str, int, int, int, int, str | None]] = {}
    for path in sorted(root.rglob("*")):
        stat = path.stat(follow_symlinks=False)
        result[str(path.relative_to(root))] = (
            "file" if path.is_file() else "directory",
            stat.st_size,
            stat.st_mtime_ns,
            stat.st_ctime_ns,
            int(getattr(stat, "st_file_attributes", 0)),
            hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None,
        )
    return result


def _service(
    tmp_path: Path,
    *,
    metadata_reader: Any | None = None,
    raw_preview_provider: Any | None = None,
    video_poster_provider: Any | None = None,
    limits: PreprocessLimits | None = None,
    analyzer_versions: AnalyzerVersions | None = None,
):
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    db = ManifestDB(layout.database)
    config = ReviewConfig(
        vault_root=layout.root,
        inbox_root=tmp_path / "inbox",
        derivative_root=tmp_path / "generated-derivatives",
        analyzer_versions=analyzer_versions or AnalyzerVersions(),
    )
    service = PreprocessingService(
        db,
        layout,
        config,
        metadata_reader=metadata_reader,
        raw_preview_provider=raw_preview_provider,
        video_poster_provider=video_poster_provider,
        limits=limits,
        allow_unsafe_atime=True,
    )
    return db, layout, config, service


def test_asset_preprocessing_persists_oriented_derivatives_metadata_features_and_is_idempotent(
    tmp_path: Path,
) -> None:
    db, layout, config, service = _service(tmp_path, metadata_reader=SyntheticMetadataReader())
    asset_id, canonical, _hashes = _insert_asset(
        db,
        layout,
        _image_bytes((60, 40), (20, 80, 140), fmt="JPEG", orientation=6),
        mime_type="image/jpeg",
        detected_format="JPEG",
        extension=".jpg",
    )
    canonical_before = _snapshot_file(canonical)

    job_id = service.enqueue_asset(asset_id)
    first = service.run_job(job_id)
    assert first.ready_derivatives == 4
    assert first.failed_derivatives == 0
    assert first.metadata_status == "ready"
    assert first.feature_status == "ready"

    rows = db.all(
        "SELECT * FROM derivatives WHERE asset_id=? AND is_current=1 ORDER BY long_edge", (asset_id,)
    )
    assert [row["long_edge"] for row in rows] == [192, 384, 768, 1536]
    first_checksums = {}
    for row in rows:
        path = config.derivative_root / Path(row["relative_path_text"])
        assert path.is_file()
        assert is_within(path, config.derivative_root)
        assert not is_within(path, layout.objects)
        assert (row["width"], row["height"]) == (40, 60)
        assert row["mime_type"] == "image/webp"
        assert hashlib.sha256(path.read_bytes()).hexdigest() == row["checksum_sha256"]
        assert path.stat().st_size == row["byte_size"]
        first_checksums[row["long_edge"]] = row["checksum_sha256"]
    plan = db.all(
        """EXPLAIN QUERY PLAN SELECT status,mime_type,checksum_sha256,byte_size,file_mtime_ns,
                  relative_path_text,long_edge FROM derivatives
           WHERE subject_type='asset' AND subject_id=? AND is_current=1
             AND derivative_kind IN ('thumbnail','detail')""",
        (asset_id,),
    )
    plan_text = " ".join(str(row["detail"]) for row in plan)
    assert "idx_derivatives_ready_subject" in plan_text
    assert "SCAN derivatives" not in plan_text

    metadata = db.one(
        "SELECT * FROM asset_extended_metadata WHERE asset_id=? AND is_current=1", (asset_id,)
    )
    assert metadata is not None
    assert (metadata["width"], metadata["height"]) == (40, 60)
    assert metadata["capture_time_source"] == "DateTimeOriginal"
    assert metadata["gps_latitude"] == pytest.approx(51.5074)
    assert metadata["gps_longitude"] == pytest.approx(-0.1278)
    assert metadata["exposure_time_seconds"] == pytest.approx(1 / 125)
    assert metadata["edit_likelihood"] > 0
    assert json.loads(metadata["raw_metadata_json"])["EXIF:Model"] == "Golden Camera"

    features = db.one("SELECT * FROM asset_features WHERE asset_id=? AND is_current=1", (asset_id,))
    assert features is not None
    assert features["status"] == "ready"
    assert len(json.loads(features["luminance_histogram_json"])) == 32
    for name in (
        "luminance_entropy",
        "sharpness_score",
        "focus_deficit_score",
        "directional_shake_score",
        "motion_score",
        "underexposure_score",
        "overexposure_score",
        "highlight_clipping_score",
        "near_black_score",
        "blankness_score",
        "obstruction_score",
        "low_information_score",
        "blockiness_score",
        "corruption_score",
        "thumbnail_likelihood",
        "edit_likelihood",
        "composite_quality_score",
    ):
        assert 0 <= features[name] <= 1

    same_job = service.enqueue_asset(asset_id, force=True)
    assert same_job == job_id
    second = service.run_job(same_job)
    assert second.ready_derivatives == 4
    assert {
        row["long_edge"]: row["checksum_sha256"]
        for row in db.all(
            "SELECT long_edge,checksum_sha256 FROM derivatives WHERE asset_id=? AND is_current=1",
            (asset_id,),
        )
    } == first_checksums
    assert _snapshot_file(canonical) == canonical_before
    db.close()


def test_numeric_feature_golden_data_and_warranted_detail_derivative(tmp_path: Path) -> None:
    db, layout, _config, service = _service(tmp_path)
    black_id, black_object, _ = _insert_asset(db, layout, _image_bytes((32, 32), (0, 0, 0)))
    checker_id, checker_object, _ = _insert_asset(db, layout, _checker_bytes())
    detail_id, detail_object, _ = _insert_asset(db, layout, _image_bytes((2600, 10), (120, 130, 140)))
    before = {path: _snapshot_file(path) for path in (black_object, checker_object, detail_object)}

    for asset_id in (black_id, checker_id, detail_id):
        service.run_job(service.enqueue_asset(asset_id))

    black = db.one("SELECT * FROM asset_features WHERE asset_id=? AND is_current=1", (black_id,))
    checker = db.one("SELECT * FROM asset_features WHERE asset_id=? AND is_current=1", (checker_id,))
    assert black is not None and checker is not None
    assert json.loads(black["luminance_histogram_json"])[0] == 32 * 32
    assert black["luminance_entropy"] == pytest.approx(0.0)
    assert black["near_black_score"] == pytest.approx(1.0)
    assert black["blankness_score"] == pytest.approx(1.0)
    assert checker["sharpness_score"] > black["sharpness_score"]
    assert checker["luminance_entropy"] > black["luminance_entropy"]
    assert db.one(
        """SELECT COUNT(*) AS count FROM derivatives
           WHERE asset_id=? AND is_current=1 AND derivative_kind='detail' AND long_edge=2560
             AND status='ready'""",
        (detail_id,),
    )["count"] == 1
    assert {path: _snapshot_file(path) for path in before} == before
    db.close()


@pytest.mark.parametrize(
    ("content", "limits", "expected_fragment"),
    [
        (b"not an image", None, "Decode failed"),
        (_image_bytes((20, 20), (1, 2, 3)), PreprocessLimits(max_decode_pixels=100), "pixel limit"),
    ],
)
def test_corrupt_decode_and_resource_limits_persist_honest_errors(
    tmp_path: Path,
    content: bytes,
    limits: PreprocessLimits | None,
    expected_fragment: str,
) -> None:
    db, layout, _config, service = _service(tmp_path, limits=limits)
    asset_id, canonical, _ = _insert_asset(db, layout, content)
    before = _snapshot_file(canonical)

    result = service.run_job(service.enqueue_asset(asset_id))
    assert result.ready_derivatives == 0
    assert result.failed_derivatives == 4
    feature = db.one("SELECT * FROM asset_features WHERE asset_id=? AND is_current=1", (asset_id,))
    assert feature is not None
    assert feature["status"] == "error"
    assert feature["corruption_score"] == 1.0
    assert feature["incomplete_decode"] == 1
    assert expected_fragment.casefold() in feature["error_text"].casefold()
    assert db.one(
        "SELECT COUNT(*) AS count FROM derivatives WHERE asset_id=? AND status='error'", (asset_id,)
    )["count"] == 4
    assert _snapshot_file(canonical) == before
    db.close()


def test_decode_time_limit_is_persisted_without_touching_raw_object(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def raw_provider(_path: Path) -> Image.Image:
        return Image.new("RGB", (12, 8), (3, 4, 5))

    db, layout, _config, service = _service(
        tmp_path,
        raw_preview_provider=raw_provider,
        limits=PreprocessLimits(max_decode_seconds=0.1),
    )
    asset_id, canonical, _ = _insert_asset(
        db,
        layout,
        b"bounded raw payload",
        media_kind="raw_image",
        mime_type="image/x-raw",
        detected_format="RAW",
        extension=".raw",
    )
    before = _snapshot_file(canonical)
    values = iter((10.0, 11.0))
    monkeypatch.setattr(preprocess_module.time, "monotonic", lambda: next(values))

    result = service.run_job(service.enqueue_asset(asset_id))
    assert result.failed_derivatives == 4
    feature = db.one("SELECT * FROM asset_features WHERE asset_id=? AND is_current=1", (asset_id,))
    assert "time limit" in feature["error_text"].casefold()
    assert _snapshot_file(canonical) == before
    db.close()


def test_raw_companion_raw_fallback_and_video_poster_states(tmp_path: Path) -> None:
    def raw_provider(_path: Path) -> Image.Image:
        return Image.new("RGB", (18, 12), (100, 30, 20))

    def video_provider(_path: Path) -> Image.Image:
        return Image.new("RGB", (24, 14), (10, 160, 80))

    db, layout, _config, service = _service(
        tmp_path,
        raw_preview_provider=raw_provider,
        video_poster_provider=video_provider,
    )
    raw_id, raw_object, _ = _insert_asset(
        db,
        layout,
        b"synthetic raw bytes with no decodable payload",
        media_kind="raw_image",
        mime_type="image/x-raw",
        detected_format="CR3",
        extension=".cr3",
    )
    jpeg_id, jpeg_object, _ = _insert_asset(
        db,
        layout,
        _image_bytes((30, 20), (90, 80, 70), fmt="JPEG"),
        mime_type="image/jpeg",
        detected_format="JPEG",
        extension=".jpg",
    )
    standalone_raw_id, standalone_raw_object, _ = _insert_asset(
        db,
        layout,
        b"a different synthetic raw payload",
        media_kind="raw_image",
        mime_type="image/x-raw",
        detected_format="NEF",
        extension=".nef",
    )
    video_id, video_object, _ = _insert_asset(
        db,
        layout,
        b"synthetic video payload",
        media_kind="video",
        mime_type="video/mp4",
        detected_format="MP4",
        extension=".mp4",
    )
    now = utc_now()
    group_id = "rjg-synthetic"
    run_id = db.one("SELECT created_run_id FROM assets WHERE asset_id=?", (raw_id,))["created_run_id"]
    db.execute(
        """INSERT INTO raw_jpeg_groups(
               raw_jpeg_group_id,anchor_raw_asset_id,confidence_label,confidence_score,evidence_json,
               created_run_id,created_at
           ) VALUES(?,?,'high',0.95,'{}',?,?)""",
        (group_id, raw_id, run_id, now),
    )
    db.execute(
        """INSERT INTO raw_jpeg_members(
               raw_jpeg_group_id,asset_id,role,confidence_label,confidence_score,evidence_json,ambiguous
           ) VALUES(?,?,'raw_anchor','high',0.95,'{}',0)""",
        (group_id, raw_id),
    )
    db.execute(
        """INSERT INTO raw_jpeg_members(
               raw_jpeg_group_id,asset_id,role,confidence_label,confidence_score,evidence_json,ambiguous
           ) VALUES(?,?,'jpeg_companion','high',0.94,'{}',0)""",
        (group_id, jpeg_id),
    )
    db.commit()
    before = {
        path: _snapshot_file(path)
        for path in (raw_object, jpeg_object, standalone_raw_object, video_object)
    }

    for asset_id in (raw_id, standalone_raw_id, video_id):
        result = service.run_job(service.enqueue_asset(asset_id))
        assert result.ready_derivatives == 4

    companion_rows = db.all(
        "SELECT * FROM derivatives WHERE asset_id=? AND is_current=1", (raw_id,)
    )
    assert {row["representation_kind"] for row in companion_rows} == {"nonraw_companion"}
    assert {row["source_asset_id"] for row in companion_rows} == {jpeg_id}
    fallback_rows = db.all(
        "SELECT * FROM derivatives WHERE asset_id=? AND is_current=1", (standalone_raw_id,)
    )
    assert {row["representation_kind"] for row in fallback_rows} == {"raw_embedded"}
    assert {row["source_asset_id"] for row in fallback_rows} == {standalone_raw_id}
    video_rows = db.all("SELECT * FROM derivatives WHERE asset_id=? AND is_current=1", (video_id,))
    assert {row["representation_kind"] for row in video_rows} == {"video_poster"}
    assert {path: _snapshot_file(path) for path in before} == before
    db.close()


def test_atomic_rebuild_restart_and_analyzer_version_invalidation(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    db, layout, config, service = _service(tmp_path)
    asset_id, canonical, _ = _insert_asset(db, layout, _image_bytes((48, 30), (70, 90, 110)))
    before = _snapshot_file(canonical)
    service.run_job(service.enqueue_asset(asset_id))
    original = db.one(
        "SELECT * FROM derivatives WHERE asset_id=? AND long_edge=192 AND is_current=1", (asset_id,)
    )
    original_path = config.derivative_root / Path(original["relative_path_text"])
    original_bytes = original_path.read_bytes()
    real_replace = os.replace
    failed = False

    def fail_first_derivative_replace(source: str | os.PathLike[str], target: str | os.PathLike[str]) -> None:
        nonlocal failed
        if not failed and str(source).endswith(".partial"):
            failed = True
            raise OSError("synthetic atomic publication failure")
        real_replace(source, target)

    monkeypatch.setattr(preprocess_module.os, "replace", fail_first_derivative_replace)
    failed_result = service.run_job(service.enqueue_asset(asset_id, force=True))
    assert failed_result.failed_derivatives == 1
    assert original_path.read_bytes() == original_bytes
    monkeypatch.setattr(preprocess_module.os, "replace", real_replace)

    def interrupt_after_outputs(point: str, _job_id: str) -> None:
        if point == "after_derivatives":
            raise RuntimeError("synthetic restart boundary")

    retry_job = service.enqueue_asset(asset_id, force=True)
    with pytest.raises(RuntimeError, match="restart boundary"):
        service.run_job(retry_job, fault_hook=interrupt_after_outputs)
    assert db.one("SELECT status FROM background_jobs WHERE job_id=?", (retry_job,))["status"] == "queued"
    restarted = service.run_job(retry_job)
    assert restarted.failed_derivatives == 0

    versions = AnalyzerVersions(
        review_derivative="review-derivative-v2",
        vault_derivative="vault-derivative-v2",
        extended_metadata="extended-metadata-v2",
        quality_features="quality-features-v2",
        materialized_view="materialized-view-v1",
    )
    replacement_config = ReviewConfig(
        vault_root=layout.root,
        inbox_root=config.inbox_root,
        derivative_root=config.derivative_root,
        analyzer_versions=versions,
    )
    replacement = PreprocessingService(db, layout, replacement_config, allow_unsafe_atime=True)
    replacement.run_job(replacement.enqueue_asset(asset_id))
    assert db.one(
        "SELECT COUNT(*) AS count FROM derivatives WHERE asset_id=? AND status='stale' AND is_current=0",
        (asset_id,),
    )["count"] >= 4
    assert db.one(
        """SELECT COUNT(*) AS count FROM derivatives
           WHERE asset_id=? AND analyzer_version='vault-derivative-v2' AND status='ready' AND is_current=1""",
        (asset_id,),
    )["count"] == 4
    assert db.one(
        "SELECT status FROM asset_extended_metadata WHERE asset_id=? AND analyzer_version='extended-metadata-v1'",
        (asset_id,),
    )["status"] == "stale"
    assert db.one(
        "SELECT status FROM asset_features WHERE asset_id=? AND analyzer_version='quality-features-v1'",
        (asset_id,),
    )["status"] == "stale"
    assert _snapshot_file(canonical) == before
    assert not list(config.derivative_root.rglob("*.partial"))
    db.close()


def test_lock_owning_preprocess_entry_point_refuses_live_writer(tmp_path: Path) -> None:
    db, layout, config, service = _service(tmp_path)
    asset_id, canonical, _ = _insert_asset(db, layout, _image_bytes((22, 14), (40, 50, 60)))
    before = _snapshot_file(canonical)
    job_id = service.enqueue_asset(asset_id)
    db.close()
    lock = layout.state / "active-writer.lock"
    lock.write_text(
        json.dumps({"pid": os.getpid(), "token": "live", "command": "synthetic-writer"}),
        encoding="utf-8",
    )
    try:
        with pytest.raises(RuntimeError, match="Another vault writer is active"):
            run_preprocessing_job(config, job_id, allow_unsafe_atime=True)
    finally:
        lock.unlink()

    result = run_preprocessing_job(config, job_id, allow_unsafe_atime=True)
    assert result.ready_derivatives == 4
    assert _snapshot_file(canonical) == before


def test_review_previews_precede_approval_and_preserve_inbox_and_canonical_objects(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    inbox = tmp_path / "inbox"
    batch_root = inbox / "Batch A"
    batch_root.mkdir(parents=True)
    (batch_root / "review.png").write_bytes(_image_bytes((20, 12), (30, 60, 90)))
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    db = ManifestDB(layout.database)
    _asset_id, canonical, _ = _insert_asset(db, layout, _image_bytes((9, 7), (5, 6, 7)))
    config = ReviewConfig(
        vault_root=layout.root,
        inbox_root=inbox,
        derivative_root=tmp_path / "review-derivatives",
    )
    discovery = ImportDiscoveryService(
        db,
        layout,
        config,
        metadata_reader=DiscoveryMetadataReader(),
        allow_unsafe_atime=True,
    )
    batch = discovery.discover_batches()[0]
    summary = discovery.scan_batch(batch.batch_id)
    inbox_before = _snapshot_tree(inbox)
    canonical_before = _snapshot_file(canonical)
    preprocessor = PreprocessingService(
        db,
        layout,
        config,
        metadata_reader=DiscoveryMetadataReader(),
        allow_unsafe_atime=True,
    )
    jobs = preprocessor.prepare_review_batch(batch.batch_id)
    assert db.one("SELECT status FROM import_batches WHERE batch_id=?", (batch.batch_id,))["status"] == (
        "preparing_previews"
    )
    reviewed = ReviewedImportService(db, layout, config, allow_unsafe_atime=True)
    with pytest.raises(ValueError, match="review-ready"):
        reviewed.approve_batch(batch.batch_id, expected_revision=summary.revision)
    for job_id in jobs:
        result = preprocessor.run_job(job_id)
        assert result.ready_derivatives == 1
    readiness = preprocessor.review_batch_readiness(batch.batch_id)
    assert readiness == {"expected": 1, "ready": 1, "failed": 0, "pending": 0, "review_ready": True}
    summary = ImportManifestService(db, config).batch_summary(batch.batch_id)
    monkeypatch.setattr(
        copy_module,
        "disk_usage_for",
        lambda _path: SimpleNamespace(total=100 * 1024**3, used=1 * 1024**3, free=99 * 1024**3),
    )
    approval = reviewed.approve_batch(batch.batch_id, expected_revision=summary.revision)
    assert approval.included_count == 1
    row = db.one("SELECT * FROM derivatives WHERE import_item_id IS NOT NULL AND is_current=1")
    assert row["status"] == "ready"
    derivative = config.derivative_root / Path(row["relative_path_text"])
    assert is_within(derivative, config.derivative_root)
    assert not is_within(derivative, inbox)
    assert not is_within(derivative, layout.objects)
    assert _snapshot_tree(inbox) == inbox_before
    assert _snapshot_file(canonical) == canonical_before
    db.close()


def test_legacy_preview_http_path_only_serves_persisted_or_legacy_files_without_media_work(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    db, layout, config, service = _service(tmp_path)
    ready_id, canonical, _ = _insert_asset(db, layout, _image_bytes((28, 18), (20, 40, 60)))
    missing_id, missing_canonical, _ = _insert_asset(db, layout, _image_bytes((29, 19), (21, 41, 61)))
    legacy_id, legacy_canonical, _ = _insert_asset(db, layout, _image_bytes((30, 20), (22, 42, 62)))
    service.run_job(service.enqueue_asset(ready_id))
    pending_job = service.enqueue_asset(missing_id)
    db.close()
    database_before = layout.database.read_bytes()
    legacy_cache = tmp_path / "legacy-cache"
    (legacy_cache / "previews").mkdir(parents=True)
    (legacy_cache / "previews" / f"{legacy_id}.jpg").write_bytes(
        _image_bytes((30, 20), (22, 42, 62), fmt="JPEG")
    )

    def forbidden(*_args: Any, **_kwargs: Any) -> Any:
        raise AssertionError("HTTP preview handler attempted forbidden media work")

    real_path_open = Path.open
    protected = {canonical.absolute(), missing_canonical.absolute(), legacy_canonical.absolute()}

    def guard_path_open(path: Path, *args: Any, **kwargs: Any):
        if path.absolute() in protected:
            raise AssertionError("HTTP preview handler attempted to read canonical media")
        return real_path_open(path, *args, **kwargs)

    monkeypatch.setattr(Image, "open", forbidden)
    monkeypatch.setattr(preprocess_module.subprocess, "run", forbidden)
    monkeypatch.setattr(preprocess_module, "_sha256_file", forbidden)
    monkeypatch.setattr(Path, "open", guard_path_open)
    app = create_dashboard_app(
        layout.root,
        legacy_cache,
        derivative_root=config.derivative_root,
    )
    with TestClient(app) as client:
        ready = client.get(f"/api/assets/{ready_id}/preview")
        assert ready.status_code == 200
        assert ready.headers["content-type"] == "image/webp"
        assert ready.headers["cache-control"] == "public, max-age=31536000, immutable"
        detail = client.get(f"/api/assets/{ready_id}").json()
        assert detail["preview_state"] == "ready"
        pending = client.get(f"/api/assets/{missing_id}/preview")
        assert pending.status_code == 425
        assert pending.json()["preview_state"] == "preparing"
        legacy = client.get(f"/api/assets/{legacy_id}/preview")
        assert legacy.status_code == 200
        assert legacy.headers["content-type"] == "image/jpeg"
        legacy_detail = client.get(f"/api/assets/{legacy_id}").json()
        assert legacy_detail["preview_state"] == "ready_legacy_cache"
    assert layout.database.read_bytes() == database_before
    db_check = ManifestDB(layout.database)
    try:
        pending = db_check.one("SELECT status FROM background_jobs WHERE job_id=?", (pending_job,))
        assert pending["status"] == "queued"
    finally:
        db_check.close()
