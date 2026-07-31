from __future__ import annotations

import contextlib
import csv
import hashlib
import json
import os
import sqlite3
import tempfile
import time
import uuid
from pathlib import Path
from typing import Any

from blake3 import blake3

from .core import (
    FullHashes,
    JsonlLogger,
    VaultLayout,
    atomic_write_json,
    byte_compare,
    disk_usage_for,
    hash_file,
    human_bytes,
    json_text,
    stable_id,
    utc_now,
)
from .db import ManifestDB


SIDECAR_SCHEMA_VERSION = 1


def calculate_capacity(db: ManifestDB, vault: VaultLayout) -> dict[str, Any]:
    source_totals = db.one(
        """SELECT COUNT(*) AS root_count,
                  COALESCE(SUM(ss.current_media_file_count),0) AS source_count,
                  COALESCE(SUM(ss.current_media_bytes),0) AS source_bytes
           FROM source_roots sr
           JOIN scan_summaries ss ON ss.run_id=sr.last_complete_run_id
           WHERE ss.traversal_complete=1"""
    )
    # exact_groups is the compact, one-row-per-distinct-byte-sequence ledger.
    # Avoid scanning `assets`, whose rows contain potentially large metadata JSON.
    asset_totals = db.one(
        """SELECT COUNT(*) AS asset_count,COALESCE(SUM(size_bytes),0) AS asset_bytes,
                  COALESCE(MAX(size_bytes),0) AS largest
           FROM exact_groups"""
    )
    verified = db.one(
        """SELECT COUNT(*) AS asset_count,COALESCE(SUM(size_bytes),0) AS asset_bytes
           FROM (
               SELECT asset_id,MAX(size_bytes) AS size_bytes
               FROM destinations WHERE status='verified' GROUP BY asset_id
           )"""
    )
    usage = disk_usage_for(vault.root)
    missing_count = max(int(asset_totals["asset_count"]) - int(verified["asset_count"]), 0)
    missing_bytes = max(int(asset_totals["asset_bytes"]) - int(verified["asset_bytes"]), 0)
    # Working-state growth, future SQLite WAL, logs, and filesystem allocation
    # overhead are not predictable exactly. Reserve the greater of 10 GiB or 5%.
    safety_margin = max(10 * 1024**3, int(missing_bytes * 0.05))
    required_with_margin = missing_bytes + safety_margin
    has_persisted_source_totals = int(source_totals["root_count"]) > 0
    conservative_source_bytes = int(source_totals["source_bytes"]) if has_persisted_source_totals else None
    source_count = int(source_totals["source_count"]) if has_persisted_source_totals else None
    dedupe_savings = (
        max(conservative_source_bytes - int(asset_totals["asset_bytes"]), 0)
        if conservative_source_bytes is not None
        else None
    )
    return {
        "source_media_file_count": source_count,
        "source_media_bytes_upper_bound": conservative_source_bytes,
        "unique_exact_asset_count": int(asset_totals["asset_count"]),
        "unique_exact_asset_bytes": int(asset_totals["asset_bytes"]),
        "verified_destination_asset_count": int(verified["asset_count"]),
        "remaining_asset_count": missing_count,
        "remaining_object_bytes": missing_bytes,
        # This is a safe upper bound if the largest object was already copied.
        "largest_remaining_object_bytes": int(asset_totals["largest"]),
        "exact_deduplication_savings_bytes": dedupe_savings,
        "safety_margin_bytes": safety_margin,
        "required_free_bytes_with_margin": required_with_margin,
        "destination_total_bytes": usage.total,
        "destination_used_bytes": usage.used,
        "destination_free_bytes": usage.free,
        "sufficient_free_space": usage.free >= required_with_margin,
        "human": {
            "source_media_upper_bound": (
                human_bytes(conservative_source_bytes)
                if conservative_source_bytes is not None
                else "unavailable from legacy scan; not needed for sufficiency decision"
            ),
            "unique_exact_assets": human_bytes(int(asset_totals["asset_bytes"])),
            "remaining_objects": human_bytes(missing_bytes),
            "exact_dedupe_savings": (
                human_bytes(dedupe_savings)
                if dedupe_savings is not None
                else "unavailable from legacy scan"
            ),
            "safety_margin": human_bytes(safety_margin),
            "required_with_margin": human_bytes(required_with_margin),
            "destination_free": human_bytes(usage.free),
        },
        "calculation_version": "capacity-v1",
        "notes": [
            "Upper bound sums every currently discovered media source, including exact duplicates.",
            "Required object bytes count one object per byte-verified exact-content asset and subtract already verified objects.",
            "Safety margin is max(10 GiB, 5% of remaining object bytes) for logs, SQLite/WAL growth, allocation rounding, and recovery headroom.",
            "Near-duplicate, decoded-media, and RAW/JPEG relationships never reduce required space.",
            "Largest remaining object is a conservative upper bound derived from all exact groups.",
            (
                "The completed scan predates persisted scan totals; source upper-bound and savings statistics are null. "
                "The required-space decision remains exact because it is computed from every retained full-hash group."
                if not has_persisted_source_totals
                else "Source totals came from the durable summary of each root's latest complete traversal."
            ),
        ],
    }


def _rows(db: ManifestDB, sql: str, params: tuple[Any, ...]) -> list[dict[str, Any]]:
    return [dict(row) for row in db.all(sql, params)]


def asset_record(db: ManifestDB, vault: VaultLayout, asset_id: str) -> dict[str, Any]:
    asset_row = db.one("SELECT * FROM assets WHERE asset_id=?", (asset_id,))
    if asset_row is None:
        raise KeyError(asset_id)
    asset = dict(asset_row)
    sources = _rows(
        db,
        """SELECT sf.source_file_id,sf.source_root_id,sf.path_text,sf.relative_path_text,sf.first_seen_at,
                  sf.last_seen_at,sf.present,sv.*,aus.exact_verification_method,aus.exact_verified_at,
                  aus.is_initial_representative
           FROM asset_sources aus
           JOIN source_versions sv ON sv.source_version_id=aus.source_version_id
           JOIN source_files sf ON sf.source_file_id=sv.source_file_id
           WHERE aus.asset_id=? ORDER BY sv.source_version_id""",
        (asset_id,),
    )
    destinations = _rows(db, "SELECT * FROM destinations WHERE asset_id=? ORDER BY path_text", (asset_id,))
    relationships = _rows(
        db,
        """SELECT r.*,ru.status AS origin_run_status,
                  CASE WHEN ru.status='completed' THEN 1 ELSE 0 END AS authoritative
           FROM relationships r JOIN runs ru ON ru.run_id=r.created_run_id
           WHERE r.left_asset_id=? OR r.right_asset_id=? ORDER BY r.relationship_id""",
        (asset_id, asset_id),
    )
    raw_groups = _rows(
        db,
        """SELECT g.*,ru.status AS origin_run_status,
                  CASE WHEN ru.status='completed' THEN 1 ELSE 0 END AS authoritative,
                  m.role,m.confidence_label AS member_confidence_label,
                  m.confidence_score AS member_confidence_score,m.evidence_json AS member_evidence_json,
                  m.ambiguous,m.alternative_group_ids_json
           FROM raw_jpeg_members m JOIN raw_jpeg_groups g USING(raw_jpeg_group_id)
           JOIN runs ru ON ru.run_id=g.created_run_id
           WHERE m.asset_id=? ORDER BY g.raw_jpeg_group_id""",
        (asset_id,),
    )
    warnings = _rows(db, "SELECT * FROM warnings WHERE asset_id=? ORDER BY warning_id", (asset_id,))
    canonical = str(vault.root / Path(asset["object_relpath"]))
    return {
        "record_schema": "immutable-media-vault.asset",
        "record_schema_version": SIDECAR_SCHEMA_VERSION,
        "generated_at": utc_now(),
        "asset_id": asset_id,
        "canonical_destination_filepath": canonical,
        "asset": asset,
        "source_locations_and_history": sources,
        "destinations": destinations,
        "relationships": relationships,
        "raw_jpeg_groups": raw_groups,
        "warnings": warnings,
    }


def sidecar_path(vault: VaultLayout, asset_id: str) -> Path:
    digest = hashlib.sha256(asset_id.encode("utf-8")).hexdigest()
    return vault.records / digest[:2] / digest[2:4] / f"{asset_id}.json"


def sync_asset_sidecar(db: ManifestDB, vault: VaultLayout, asset_id: str) -> Path:
    target = sidecar_path(vault, asset_id)
    atomic_write_json(target, asset_record(db, vault, asset_id), vault.temp)
    return target


def sync_all_sidecars(db: ManifestDB, vault: VaultLayout, logger: JsonlLogger | None = None) -> int:
    count = 0
    for row in db.all("SELECT asset_id FROM assets ORDER BY asset_id"):
        sync_asset_sidecar(db, vault, row["asset_id"])
        count += 1
        if logger and count % 250 == 0:
            logger.emit("info", "sidecar_progress", records=count)
    return count


def write_report(vault: VaultLayout, run_id: str, report: dict[str, Any]) -> Path:
    target = vault.reports / f"{run_id}.json"
    atomic_write_json(target, report, vault.temp)
    return target


def _copy_and_hash(source: Path, target: Path) -> FullHashes:
    h256 = hashlib.sha256()
    h512 = hashlib.sha512()
    hb3 = blake3()
    size = 0
    with source.open("rb", buffering=0) as src, target.open("xb", buffering=0) as dst:
        while block := src.read(8 * 1024 * 1024):
            dst.write(block)
            size += len(block)
            h256.update(block)
            h512.update(block)
            hb3.update(block)
        dst.flush()
        os.fsync(dst.fileno())
    return FullHashes(size, h256.hexdigest(), hb3.hexdigest(), h512.hexdigest())


def _expected(row: Any) -> FullHashes:
    return FullHashes(int(row["size_bytes"]), row["sha256"], row["blake3"], row["sha512"])


def _source_for_asset(db: ManifestDB, asset_id: str) -> tuple[Path, int] | None:
    rows = db.all(
        """SELECT sf.path_text,sv.source_version_id FROM asset_sources aus
           JOIN source_versions sv ON sv.source_version_id=aus.source_version_id
           JOIN source_files sf ON sf.source_file_id=sv.source_file_id
           WHERE aus.asset_id=? AND sf.present=1
           ORDER BY aus.is_initial_representative DESC,sv.source_version_id""",
        (asset_id,),
    )
    for row in rows:
        path = Path(row["path_text"])
        if path.is_file():
            return path, int(row["source_version_id"])
    return None


def _mark_destination(
    db: ManifestDB,
    run_id: str,
    asset: Any,
    final: Path,
    status: str,
    *,
    source_version_id: int | None,
    error: str | None = None,
) -> None:
    now = utc_now()
    destination_id = stable_id("dst1", asset["asset_id"], str(final))
    db.execute(
        """INSERT INTO destinations(
               destination_id,asset_id,path_text,status,size_bytes,sha256,blake3,sha512,
               copied_from_source_version_id,copy_started_at,verified_at,last_validation_run_id,error_text
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
           ON CONFLICT(asset_id,path_text) DO UPDATE SET
               status=excluded.status,size_bytes=excluded.size_bytes,sha256=excluded.sha256,
               blake3=excluded.blake3,sha512=excluded.sha512,
               copied_from_source_version_id=COALESCE(excluded.copied_from_source_version_id,destinations.copied_from_source_version_id),
               verified_at=excluded.verified_at,last_validation_run_id=excluded.last_validation_run_id,error_text=excluded.error_text""",
        (
            destination_id, asset["asset_id"], str(final), status,
            asset["size_bytes"] if status == "verified" else None,
            asset["sha256"] if status == "verified" else None,
            asset["blake3"] if status == "verified" else None,
            asset["sha512"] if status == "verified" else None,
            source_version_id, now, now if status == "verified" else None, run_id, error,
        ),
    )
    db.execute(
        "UPDATE assets SET object_status=?,object_verified_at=?,updated_at=? WHERE asset_id=?",
        (status, now if status == "verified" else None, now, asset["asset_id"]),
    )


def import_assets(
    db: ManifestDB,
    vault: VaultLayout,
    run_id: str,
    logger: JsonlLogger,
) -> dict[str, Any]:
    capacity = calculate_capacity(db, vault)
    if not capacity["sufficient_free_space"]:
        raise RuntimeError(
            f"Insufficient free space: need {capacity['human']['required_with_margin']}, "
            f"have {capacity['human']['destination_free']}"
        )
    assets = db.all(
        """SELECT asset_id,size_bytes,sha256,blake3,sha512,object_relpath,object_status
           FROM assets WHERE object_status<>'verified' ORDER BY asset_id"""
    )
    copy_total_bytes = sum(int(asset["size_bytes"]) for asset in assets)
    counters: dict[str, Any] = {
        "candidate_assets": len(assets), "copied": 0, "existing_verified": 0, "errors": 0,
        "source_changed": 0, "bytes_copied": 0, "sidecar_errors": 0,
        "copy_assets_processed": 0, "copy_assets_verified": 0,
        "copy_bytes_processed": 0, "copy_bytes_verified": 0,
    }
    progress_path = vault.state / "progress" / f"{run_id}.json"
    progress_base: dict[str, Any] = {}
    try:
        progress_base = json.loads(progress_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        pass
    last_progress_at = 0.0

    def publish_progress(stage: str, *, force: bool = False) -> None:
        nonlocal last_progress_at
        now_mono = time.monotonic()
        if not force and now_mono - last_progress_at < 10.0:
            return
        atomic_write_json(
            progress_path,
            {
                **progress_base,
                "progress_schema": "immutable-media-vault.import-progress-v1",
                "run_id": run_id,
                "stage": stage,
                "updated_at": utc_now(),
                "copy_total_assets": len(assets),
                "copy_total_bytes": copy_total_bytes,
                **counters,
            },
            vault.temp,
        )
        last_progress_at = now_mono

    def record_processed(asset: Any, *, verified: bool) -> None:
        counters["copy_assets_processed"] += 1
        counters["copy_bytes_processed"] += int(asset["size_bytes"])
        if verified:
            counters["copy_assets_verified"] += 1
            counters["copy_bytes_verified"] += int(asset["size_bytes"])
        try:
            publish_progress("copying_verified_objects")
        except Exception as exc:
            logger.emit(
                "warning", "copy_progress_checkpoint_failed",
                error=f"{type(exc).__name__}: {exc}",
            )

    def sync_recovery_sidecar(asset_id: str) -> None:
        try:
            sync_asset_sidecar(db, vault, asset_id)
        except Exception as exc:
            counters["sidecar_errors"] += 1
            error = f"{type(exc).__name__}: {exc}"
            db.add_warning(
                run_id, "warning", "recovery_sidecar_write_failed",
                "The verified object remains valid; its recovery sidecar can be regenerated with export.",
                utc_now(), asset_id=asset_id, evidence={"error": error},
            )
            db.commit()
            logger.emit("warning", "recovery_sidecar_write_failed", asset_id=asset_id, error=error)

    publish_progress("copying_verified_objects", force=True)
    for asset in assets:
        expected = _expected(asset)
        final = vault.root / Path(asset["object_relpath"])
        final.parent.mkdir(parents=True, exist_ok=True)
        source_info = _source_for_asset(db, asset["asset_id"])
        if source_info is None:
            error = "No currently present source path is available for this asset"
            _mark_destination(db, run_id, asset, final, "source_unavailable", source_version_id=None, error=error)
            db.add_warning(run_id, "error", "source_unavailable", error, utc_now(), asset_id=asset["asset_id"])
            counters["errors"] += 1
            db.commit()
            record_processed(asset, verified=False)
            continue
        source, source_version_id = source_info
        try:
            if final.exists():
                actual = hash_file(final)
                if actual == expected and byte_compare(source, final):
                    _mark_destination(
                        db, run_id, asset, final, "verified", source_version_id=source_version_id
                    )
                    counters["existing_verified"] += 1
                    db.commit()
                    sync_recovery_sidecar(asset["asset_id"])
                    record_processed(asset, verified=True)
                    continue
                error = "Destination path already exists with unexpected bytes; it was not overwritten"
                _mark_destination(db, run_id, asset, final, "conflict", source_version_id=source_version_id, error=error)
                db.add_warning(
                    run_id, "critical", "destination_conflict", error, utc_now(), asset_id=asset["asset_id"],
                    evidence={"destination": str(final), "actual": actual.__dict__, "expected": expected.__dict__},
                )
                counters["errors"] += 1
                db.commit()
                record_processed(asset, verified=False)
                continue

            temp = vault.temp / f"{asset['asset_id']}.{run_id}.{uuid.uuid4().hex}.partial"
            copied = _copy_and_hash(source, temp)
            if copied != expected:
                counters["source_changed"] += 1
                raise RuntimeError("Source bytes differ from the preflight hashes; source will be rescanned on the next run")
            reopened = hash_file(temp)
            if reopened != expected:
                raise RuntimeError("Reopened temporary destination failed full hash verification")
            if not byte_compare(source, temp):
                raise RuntimeError("Byte-for-byte source/destination verification failed")
            try:
                # Atomic no-overwrite publication on the same filesystem. The
                # hard link fails if another process already created `final`.
                os.link(temp, final)
                temp.unlink()
            except FileExistsError:
                actual = hash_file(final)
                if actual != expected or not byte_compare(source, final):
                    conflict = vault.conflicts / f"{asset['asset_id']}.{run_id}.verified-candidate"
                    os.rename(temp, conflict)
                    raise RuntimeError(f"Destination race/conflict; verified candidate retained at {conflict}")
                temp.unlink()
            _mark_destination(db, run_id, asset, final, "verified", source_version_id=source_version_id)
            counters["copied"] += 1
            counters["bytes_copied"] += expected.size_bytes
            db.commit()
            sync_recovery_sidecar(asset["asset_id"])
            logger.emit(
                "info", "asset_copy_verified", asset_id=asset["asset_id"], source=str(source),
                destination=str(final), size_bytes=expected.size_bytes,
            )
            record_processed(asset, verified=True)
        except Exception as exc:
            counters["errors"] += 1
            error = f"{type(exc).__name__}: {exc}"
            with contextlib.suppress(NameError, FileNotFoundError):
                temp.unlink()
            _mark_destination(db, run_id, asset, final, "error", source_version_id=source_version_id, error=error)
            db.add_warning(
                run_id, "error", "copy_or_verification_failed", "Asset was not marked successful.", utc_now(),
                asset_id=asset["asset_id"], evidence={"source": str(source), "destination": str(final), "error": error},
            )
            db.commit()
            logger.emit("error", "copy_or_verification_failed", asset_id=asset["asset_id"], error=error)
            record_processed(asset, verified=False)
    counters["capacity_before_copy"] = capacity
    publish_progress("copy_complete", force=True)
    logger.emit("info", "import_complete", **counters)
    return counters


def validate_objects(
    db: ManifestDB,
    vault: VaultLayout,
    run_id: str,
    logger: JsonlLogger,
) -> dict[str, int]:
    rows = db.all("SELECT * FROM assets ORDER BY asset_id")
    counters = {"assets": len(rows), "verified": 0, "missing": 0, "mismatch": 0, "source_byte_compared": 0}
    for asset in rows:
        final = vault.root / Path(asset["object_relpath"])
        if not final.is_file():
            _mark_destination(db, run_id, asset, final, "missing", source_version_id=None, error="Object file missing")
            counters["missing"] += 1
            db.commit()
            continue
        actual = hash_file(final)
        expected = _expected(asset)
        source_info = _source_for_asset(db, asset["asset_id"])
        same_source = True
        source_version_id = None
        if source_info is not None:
            source, source_version_id = source_info
            same_source = byte_compare(source, final)
            counters["source_byte_compared"] += 1
        if actual == expected and same_source:
            _mark_destination(db, run_id, asset, final, "verified", source_version_id=source_version_id)
            counters["verified"] += 1
        else:
            error = "Full hashes or available source byte comparison did not match"
            _mark_destination(db, run_id, asset, final, "mismatch", source_version_id=source_version_id, error=error)
            db.add_warning(
                run_id, "critical", "destination_validation_mismatch", error, utc_now(), asset_id=asset["asset_id"],
                evidence={"actual": actual.__dict__, "expected": expected.__dict__, "source_byte_match": same_source},
            )
            counters["mismatch"] += 1
        db.commit()
        sync_asset_sidecar(db, vault, asset["asset_id"])
    logger.emit("info", "validation_complete", **counters)
    return counters


def export_manifest(db: ManifestDB, vault: VaultLayout, run_id: str) -> dict[str, str | int]:
    vault.exports.mkdir(parents=True, exist_ok=True)
    jsonl_target = vault.exports / "manifest.jsonl"
    csv_target = vault.exports / "assets.csv"
    fd, raw_temp = tempfile.mkstemp(prefix="manifest-", suffix=".jsonl.tmp", dir=vault.temp)
    count = 0
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            header = {
                "record_schema": "immutable-media-vault.manifest-header",
                "record_schema_version": SIDECAR_SCHEMA_VERSION,
                "sqlite_schema_version": db.schema_version,
                "generated_at": utc_now(),
                "run_id": run_id,
            }
            handle.write(json_text(header) + "\n")
            for row in db.all("SELECT asset_id FROM assets ORDER BY asset_id"):
                handle.write(json_text(asset_record(db, vault, row["asset_id"])) + "\n")
                count += 1
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(raw_temp, jsonl_target)
    finally:
        with contextlib.suppress(FileNotFoundError):
            Path(raw_temp).unlink()

    fd, raw_csv_temp = tempfile.mkstemp(prefix="assets-", suffix=".csv.tmp", dir=vault.temp)
    try:
        with os.fdopen(fd, "w", encoding="utf-8-sig", newline="") as handle:
            fields = [
                "asset_id", "exact_group_id", "size_bytes", "sha256", "blake3", "sha512", "media_kind",
                "mime_type", "detected_format", "width", "height", "duration_seconds", "capture_time_text",
                "camera_make", "camera_model", "object_status", "canonical_destination_filepath",
            ]
            writer = csv.DictWriter(handle, fieldnames=fields)
            writer.writeheader()
            for row in db.all("SELECT * FROM assets ORDER BY asset_id"):
                item = {key: row[key] for key in fields if key != "canonical_destination_filepath"}
                item["canonical_destination_filepath"] = str(vault.root / Path(row["object_relpath"]))
                writer.writerow(item)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(raw_csv_temp, csv_target)
    finally:
        with contextlib.suppress(FileNotFoundError):
            Path(raw_csv_temp).unlink()
    return {"asset_records": count, "jsonl": str(jsonl_target), "csv": str(csv_target)}


def rebuild_recovery_index(vault: VaultLayout, output: Path) -> dict[str, int]:
    if output.exists():
        raise FileExistsError(f"Refusing to overwrite recovery index: {output}")
    output.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(output)
    conn.executescript(
        """
        PRAGMA journal_mode=WAL;
        PRAGMA synchronous=FULL;
        CREATE TABLE recovery_info(key TEXT PRIMARY KEY,value TEXT NOT NULL);
        CREATE TABLE asset_records(
            asset_id TEXT PRIMARY KEY,record_json TEXT NOT NULL,sidecar_path TEXT NOT NULL,
            expected_object_path TEXT,expected_size INTEGER,expected_sha256 TEXT,expected_blake3 TEXT,
            expected_sha512 TEXT,object_status TEXT
        );
        CREATE TABLE issues(issue_id INTEGER PRIMARY KEY AUTOINCREMENT,severity TEXT,code TEXT,path TEXT,message TEXT);
        """
    )
    conn.execute("INSERT INTO recovery_info VALUES('schema','immutable-media-vault.recovery-index-v1')")
    counters = {"sidecars": 0, "verified_objects": 0, "missing_objects": 0, "mismatches": 0, "invalid_sidecars": 0}
    for path in sorted(vault.records.rglob("*.json")):
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
            asset = record["asset"]
            object_path = vault.root / Path(asset["object_relpath"])
            status = "missing"
            if object_path.is_file():
                actual = hash_file(object_path)
                expected = FullHashes(int(asset["size_bytes"]), asset["sha256"], asset["blake3"], asset["sha512"])
                status = "verified" if actual == expected else "mismatch"
                counters["verified_objects" if status == "verified" else "mismatches"] += 1
            else:
                counters["missing_objects"] += 1
            conn.execute(
                "INSERT INTO asset_records VALUES(?,?,?,?,?,?,?,?,?)",
                (
                    record["asset_id"], json_text(record), str(path), str(object_path), asset["size_bytes"],
                    asset["sha256"], asset["blake3"], asset["sha512"], status,
                ),
            )
            counters["sidecars"] += 1
        except Exception as exc:
            counters["invalid_sidecars"] += 1
            conn.execute(
                "INSERT INTO issues(severity,code,path,message) VALUES('error','invalid_sidecar',?,?)",
                (str(path), f"{type(exc).__name__}: {exc}"),
            )
        conn.commit()
    conn.execute("INSERT INTO recovery_info VALUES('completed_at',?)", (utc_now(),))
    conn.commit()
    conn.close()
    return counters
