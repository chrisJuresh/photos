from __future__ import annotations

import os
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Iterator

from .core import (
    HASH_ALGORITHM_VERSIONS,
    FullHashes,
    JsonlLogger,
    VaultLayout,
    atomic_write_json,
    byte_compare,
    file_is_reparse_or_symlink,
    hash_file,
    json_text,
    source_file_id,
    source_root_id,
    stable_id,
    utc_now,
)
from .db import ManifestDB
from .metadata import ExifToolReader, classify, ffprobe_metadata, last_suffix, normalize_metadata, signature_kind


@dataclass(frozen=True)
class Candidate:
    path: Path
    path_text: str
    relative_path_text: str
    source_file_id: str
    stat_size: int
    mtime_ns: int
    ctime_ns: int
    device_id: str
    file_id: str
    previous_version_id: int | None


def _same_snapshot(row: sqlite3.Row | None, st: os.stat_result) -> bool:
    if row is None or row["current_version_id"] is None:
        return False
    return (
        row["size_bytes"] == st.st_size
        and row["mtime_ns"] == st.st_mtime_ns
        and row["ctime_ns"] == st.st_ctime_ns
        and row["device_id"] == str(st.st_dev)
        and row["file_id"] == str(st.st_ino)
    )


def _walk_files(
    root: Path,
    on_warning: Callable[[str, str, dict[str, Any]], None],
) -> tuple[Iterator[os.DirEntry[str]], dict[str, bool]]:
    state = {"complete": True}

    def iterator() -> Iterator[os.DirEntry[str]]:
        stack = [root]
        while stack:
            directory = stack.pop()
            try:
                with os.scandir(directory) as entries:
                    materialized = list(entries)
            except OSError as exc:
                state["complete"] = False
                on_warning(
                    "directory_unreadable",
                    f"Could not enumerate directory: {directory}",
                    {"path": str(directory), "error": f"{type(exc).__name__}: {exc}"},
                )
                continue
            materialized.sort(key=lambda entry: entry.name)
            directories: list[Path] = []
            for entry in materialized:
                try:
                    if file_is_reparse_or_symlink(entry):
                        on_warning(
                            "reparse_point_skipped",
                            f"Skipped reparse point or symbolic link: {entry.path}",
                            {"path": entry.path},
                        )
                        continue
                    if entry.is_dir(follow_symlinks=False):
                        directories.append(Path(entry.path))
                    elif entry.is_file(follow_symlinks=False):
                        yield entry
                except OSError as exc:
                    state["complete"] = False
                    on_warning(
                        "entry_stat_failed",
                        f"Could not inspect directory entry: {entry.path}",
                        {"path": entry.path, "error": f"{type(exc).__name__}: {exc}"},
                    )
            stack.extend(reversed(directories))

    return iterator(), state


def _representative_for_asset(db: ManifestDB, asset_id: str, vault: VaultLayout, exclude_path: str) -> Path | None:
    asset = db.one("SELECT object_relpath,object_status FROM assets WHERE asset_id=?", (asset_id,))
    if asset and asset["object_status"] == "verified":
        object_path = vault.root / Path(asset["object_relpath"])
        if object_path.exists():
            return object_path
    rows = db.all(
        """SELECT sf.path_text
           FROM asset_sources aus
           JOIN source_versions sv ON sv.source_version_id=aus.source_version_id
           JOIN source_files sf ON sf.source_file_id=sv.source_file_id
           WHERE aus.asset_id=? AND sf.present=1 AND sf.path_text<>?
           ORDER BY aus.is_initial_representative DESC, sv.source_version_id""",
        (asset_id, exclude_path),
    )
    for row in rows:
        candidate = Path(row["path_text"])
        if candidate.is_file():
            return candidate
    return None


def _make_collision_identity(hashes: FullHashes, path: Path) -> tuple[str, str, str]:
    import hashlib

    h = hashlib.sha3_512()
    with path.open("rb", buffering=0) as handle:
        while block := handle.read(8 * 1024 * 1024):
            h.update(block)
    sha3 = h.hexdigest()
    asset_id = stable_id("a1c", *hashes.identity_key, sha3)
    group_id = stable_id("x1c", *hashes.identity_key, sha3)
    suffix = f"_{sha3[:16]}"
    return asset_id, group_id, suffix


def _insert_or_find_asset(
    db: ManifestDB,
    vault: VaultLayout,
    run_id: str,
    candidate: Candidate,
    hashes: FullHashes,
    discovery: Any,
    metadata: dict[str, Any],
    normalized: dict[str, Any],
    now: str,
    logger: JsonlLogger,
) -> tuple[str, str, str, bool]:
    existing = db.one(
        "SELECT * FROM assets WHERE size_bytes=? AND sha256=? AND blake3=? AND sha512=?",
        hashes.identity_key,
    )
    initial = existing is None
    verification_method = "initial_full_sha256+sha512+blake3_v1"
    collision_suffix = ""
    if existing is not None:
        representative = _representative_for_asset(db, existing["asset_id"], vault, candidate.path_text)
        if representative is not None:
            if byte_compare(candidate.path, representative):
                return (
                    existing["asset_id"],
                    existing["exact_group_id"],
                    "size+sha256+sha512+blake3+byte_compare_v1",
                    False,
                )
            asset_id, group_id, collision_suffix = _make_collision_identity(hashes, candidate.path)
            verification_method = "critical_hash_collision_separated_by_sha3_512_and_byte_compare_v1"
            db.add_warning(
                run_id,
                "critical",
                "cryptographic_hash_collision",
                "All primary full-file hashes matched but byte comparison differed; content was kept separate.",
                now,
                source_file_id=candidate.source_file_id,
                asset_id=asset_id,
                evidence={"existing_asset_id": existing["asset_id"], "representative": str(representative)},
            )
            logger.emit(
                "critical", "cryptographic_hash_collision", path=candidate.path_text, existing_asset_id=existing["asset_id"]
            )
        else:
            # Three independent full-content hashes remain a reliable method when
            # the old representative is temporarily unavailable. Validation will
            # add a byte comparison as soon as either source/object is available.
            return (
                existing["asset_id"],
                existing["exact_group_id"],
                "size+sha256+sha512+blake3_full_content_v1",
                False,
            )
    else:
        asset_id = hashes.asset_id
        group_id = hashes.exact_group_id

    object_relpath = hashes.object_relpath
    if collision_suffix:
        object_path = Path(object_relpath)
        object_relpath = str(object_path.with_name(object_path.stem + collision_suffix + object_path.suffix))
    db.execute(
        """INSERT INTO exact_groups(
               exact_group_id,size_bytes,sha256,blake3,sha512,collision_discriminator,verification_method,created_at
           ) VALUES(?,?,?,?,?,?,?,?)""",
        (
            group_id, hashes.size_bytes, hashes.sha256, hashes.blake3, hashes.sha512,
            collision_suffix, verification_method, now,
        ),
    )
    db.execute(
        """INSERT INTO assets(
               asset_id,exact_group_id,size_bytes,sha256,blake3,sha512,collision_discriminator,hash_algorithm_versions_json,
               media_kind,mime_type,detected_format,preferred_extension,width,height,duration_seconds,
               camera_make,camera_model,camera_serial,lens_model,capture_time_text,capture_time_source,
               orientation_text,video_codec,audio_codec,metadata_json,object_relpath,object_status,
               created_run_id,created_at,updated_at,warnings_json
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'missing',?,?,?,?)""",
        (
            asset_id,
            group_id,
            hashes.size_bytes,
            hashes.sha256,
            hashes.blake3,
            hashes.sha512,
            collision_suffix,
            json_text(HASH_ALGORITHM_VERSIONS),
            discovery.media_kind,
            discovery.mime_type,
            discovery.detected_format,
            last_suffix(candidate.path),
            normalized.get("width"),
            normalized.get("height"),
            normalized.get("duration_seconds"),
            normalized.get("camera_make"),
            normalized.get("camera_model"),
            normalized.get("camera_serial"),
            normalized.get("lens_model"),
            normalized.get("capture_time_text"),
            normalized.get("capture_time_source"),
            str(normalized.get("orientation_text")) if normalized.get("orientation_text") is not None else None,
            normalized.get("video_codec"),
            normalized.get("audio_codec"),
            json_text(metadata),
            object_relpath,
            run_id,
            now,
            now,
            json_text(discovery.warnings + normalized.get("warnings", [])),
        ),
    )
    return asset_id, group_id, verification_method, initial


def _prepare_source_file(db: ManifestDB, candidate: Candidate, root_id: str, run_id: str, now: str) -> None:
    row = db.one("SELECT source_file_id FROM source_files WHERE source_file_id=?", (candidate.source_file_id,))
    if row is None:
        db.execute(
            """INSERT INTO source_files(
                   source_file_id,source_root_id,path_text,relative_path_text,first_seen_at,last_seen_at,
                   last_seen_run_id,present,size_bytes,mtime_ns,ctime_ns,device_id,file_id,discovery_status
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                candidate.source_file_id, root_id, candidate.path_text, candidate.relative_path_text, now, now,
                run_id, 1, candidate.stat_size, candidate.mtime_ns, candidate.ctime_ns, candidate.device_id,
                candidate.file_id, "pending",
            ),
        )
    elif candidate.previous_version_id is not None:
        db.execute(
            "UPDATE source_versions SET superseded_at=COALESCE(superseded_at,?) WHERE source_version_id=?",
            (now, candidate.previous_version_id),
        )


def _record_version(
    db: ManifestDB,
    root_id: str,
    run_id: str,
    candidate: Candidate,
    discovery: Any,
    metadata: dict[str, Any],
    normalized: dict[str, Any],
    asset_id: str | None,
    hash_status: str,
    metadata_status: str,
    error_text: str | None,
    verification_method: str | None,
    initial: bool,
    now: str,
) -> int:
    _prepare_source_file(db, candidate, root_id, run_id, now)
    cursor = db.execute(
        """INSERT INTO source_versions(
               source_file_id,observed_run_id,observed_at,size_bytes,mtime_ns,ctime_ns,device_id,file_id,
               extension_text,discovery_status,discovery_basis,media_kind,mime_type,detected_format,
               extension_mismatch,asset_id,hash_status,metadata_status,metadata_json,normalized_metadata_json,
               warnings_json,error_text
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            candidate.source_file_id, run_id, now, candidate.stat_size, candidate.mtime_ns, candidate.ctime_ns,
            candidate.device_id, candidate.file_id, last_suffix(candidate.path), discovery.status, discovery.basis,
            discovery.media_kind, discovery.mime_type, discovery.detected_format, int(discovery.extension_mismatch),
            asset_id, hash_status, metadata_status, json_text(metadata), json_text(normalized),
            json_text(discovery.warnings + normalized.get("warnings", [])), error_text,
        ),
    )
    version_id = int(cursor.lastrowid)
    db.execute(
        """UPDATE source_files SET
               relative_path_text=?,last_seen_at=?,last_seen_run_id=?,present=1,size_bytes=?,mtime_ns=?,ctime_ns=?,
               device_id=?,file_id=?,current_version_id=?,discovery_status=?,media_kind=?,asset_id=?,last_error=?
           WHERE source_file_id=?""",
        (
            candidate.relative_path_text, now, run_id, candidate.stat_size, candidate.mtime_ns, candidate.ctime_ns,
            candidate.device_id, candidate.file_id, version_id, discovery.status, discovery.media_kind, asset_id,
            error_text, candidate.source_file_id,
        ),
    )
    if asset_id and verification_method:
        db.execute(
            """INSERT INTO asset_sources(
                   asset_id,source_version_id,exact_verification_method,exact_verified_at,is_initial_representative
               ) VALUES(?,?,?,?,?)""",
            (asset_id, version_id, verification_method, now, int(initial)),
        )
    return version_id


def scan_source(
    db: ManifestDB,
    vault: VaultLayout,
    source: Path,
    run_id: str,
    logger: JsonlLogger,
    exiftool: Path,
    ffprobe: Path | None,
    *,
    force_rehash: bool = False,
    batch_size: int = 64,
) -> dict[str, Any]:
    source_text = str(source.absolute())
    root_id = source_root_id(source_text)
    started = utc_now()
    db.execute(
        """INSERT INTO source_roots(source_root_id,path_text,first_seen_at,last_seen_at)
           VALUES(?,?,?,?) ON CONFLICT(source_root_id) DO UPDATE SET last_seen_at=excluded.last_seen_at""",
        (root_id, source_text, started, started),
    )
    db.commit()
    counters: dict[str, Any] = {
        "enumerated_files": 0,
        "unchanged_files": 0,
        "changed_or_new_files": 0,
        "media_files": 0,
        "current_media_file_count": 0,
        "current_media_bytes": 0,
        "non_media_files": 0,
        "new_assets": 0,
        "exact_duplicate_sources": 0,
        "bytes_hashed": 0,
        "errors": 0,
        "warnings": 0,
    }

    progress_path = vault.state / "progress" / f"{run_id}.json"

    def persist_progress(stage: str) -> None:
        atomic_write_json(
            progress_path,
            {
                "progress_schema": "immutable-media-vault.scan-progress-v1",
                "run_id": run_id,
                "stage": stage,
                "source": source_text,
                "updated_at": utc_now(),
                **counters,
            },
            vault.temp,
        )

    persist_progress("enumerating_and_scanning")

    def warn(code: str, message: str, evidence: dict[str, Any]) -> None:
        counters["warnings"] += 1
        now = utc_now()
        db.add_warning(run_id, "warning", code, message, now, evidence=evidence)
        logger.emit("warning", code, message=message, evidence=evidence)
        db.commit()
        if counters["warnings"] % 100 == 0:
            persist_progress("enumerating_and_scanning")

    reader = ExifToolReader(exiftool, vault.temp)
    walk, traversal = _walk_files(source, warn)
    pending: list[Candidate] = []

    def process_pending() -> None:
        if not pending:
            return
        paths = [candidate.path for candidate in pending]
        metadata_items = reader.read_batch(paths)
        for candidate, metadata in zip(pending, metadata_items, strict=True):
            now = utc_now()
            sniffed = signature_kind(candidate.path)
            discovery = classify(candidate.path, metadata, sniffed)
            normalized = normalize_metadata(metadata)
            metadata_status = "error" if any(key.endswith(":Error") or key == "Error" for key in metadata) else "ok"
            if discovery.media_kind == "video" and (
                normalized.get("duration_seconds") is None or normalized.get("video_codec") is None
            ):
                extra = ffprobe_metadata(ffprobe, candidate.path)
                metadata.update(extra)
                normalized = normalize_metadata(metadata)
                if extra.get("ffprobe_error"):
                    discovery.warnings.append(str(extra["ffprobe_error"]))

            asset_id: str | None = None
            verification_method: str | None = None
            initial = False
            hash_status = "not_media"
            error_text: str | None = None
            if discovery.status == "media":
                counters["media_files"] += 1
                counters["current_media_file_count"] += 1
                counters["current_media_bytes"] += candidate.stat_size
                try:
                    hashes = hash_file(candidate.path)
                    post = candidate.path.stat()
                    if (
                        post.st_size != candidate.stat_size
                        or post.st_mtime_ns != candidate.mtime_ns
                        or post.st_ctime_ns != candidate.ctime_ns
                    ):
                        raise RuntimeError("Source changed while it was being hashed; result was not accepted")
                    counters["bytes_hashed"] += hashes.size_bytes
                    asset_id, _group_id, verification_method, initial = _insert_or_find_asset(
                        db, vault, run_id, candidate, hashes, discovery, metadata, normalized, now, logger
                    )
                    counters["new_assets" if initial else "exact_duplicate_sources"] += 1
                    hash_status = "verified"
                except Exception as exc:
                    counters["errors"] += 1
                    hash_status = "error"
                    error_text = f"{type(exc).__name__}: {exc}"
                    db.add_warning(
                        run_id, "error", "media_hash_failed", "Media candidate could not be fully hashed.", now,
                        evidence={"path": candidate.path_text, "error": error_text},
                    )
                    logger.emit("error", "media_hash_failed", path=candidate.path_text, error=error_text)
            else:
                counters["non_media_files"] += 1
            _record_version(
                db, root_id, run_id, candidate, discovery, metadata, normalized, asset_id, hash_status,
                metadata_status, error_text, verification_method, initial, now,
            )
            db.commit()
            if counters["changed_or_new_files"] % 250 == 0:
                logger.emit("info", "scan_progress", **counters)
                persist_progress("enumerating_and_scanning")
        pending.clear()

    for entry in walk:
        counters["enumerated_files"] += 1
        path = Path(entry.path)
        path_text = str(path)
        try:
            st = entry.stat(follow_symlinks=False)
        except OSError as exc:
            counters["errors"] += 1
            warn("file_stat_failed", f"Could not stat file: {path_text}", {"error": f"{type(exc).__name__}: {exc}"})
            continue
        sfid = source_file_id(root_id, path_text)
        previous = db.one("SELECT * FROM source_files WHERE source_file_id=?", (sfid,))
        if not force_rehash and _same_snapshot(previous, st):
            counters["unchanged_files"] += 1
            if previous["discovery_status"] == "media":
                counters["current_media_file_count"] += 1
                counters["current_media_bytes"] += st.st_size
            db.execute(
                "UPDATE source_files SET last_seen_at=?,last_seen_run_id=?,present=1 WHERE source_file_id=?",
                (utc_now(), run_id, sfid),
            )
            if counters["unchanged_files"] % 1000 == 0:
                db.commit()
                persist_progress("enumerating_and_scanning")
            continue
        counters["changed_or_new_files"] += 1
        try:
            relative = os.path.relpath(path_text, source_text)
        except ValueError:
            relative = path.name
        pending.append(
            Candidate(
                path=path,
                path_text=path_text,
                relative_path_text=relative,
                source_file_id=sfid,
                stat_size=st.st_size,
                mtime_ns=st.st_mtime_ns,
                ctime_ns=st.st_ctime_ns,
                device_id=str(st.st_dev),
                file_id=str(st.st_ino),
                previous_version_id=int(previous["current_version_id"]) if previous and previous["current_version_id"] else None,
            )
        )
        if len(pending) >= batch_size:
            process_pending()
    process_pending()

    if traversal["complete"]:
        db.execute(
            "UPDATE source_files SET present=0 WHERE source_root_id=? AND last_seen_run_id<>?",
            (root_id, run_id),
        )
        db.execute(
            "UPDATE source_roots SET last_seen_at=?,last_complete_run_id=? WHERE source_root_id=?",
            (utc_now(), run_id, root_id),
        )
    else:
        db.add_warning(
            run_id, "error", "incomplete_traversal",
            "Traversal was incomplete; unseen historical paths were not marked absent.", utc_now(),
        )
        counters["errors"] += 1
    db.commit()
    counters["traversal_complete"] = traversal["complete"]
    counters["source_root_id"] = root_id
    if traversal["complete"]:
        db.execute(
            """INSERT INTO scan_summaries(
                   run_id,source_root_id,traversal_complete,current_media_file_count,current_media_bytes,created_at
               ) VALUES(?,?,?,?,?,?)
               ON CONFLICT(run_id) DO UPDATE SET
                   traversal_complete=excluded.traversal_complete,
                   current_media_file_count=excluded.current_media_file_count,
                   current_media_bytes=excluded.current_media_bytes""",
            (
                run_id, root_id, 1, counters["current_media_file_count"],
                counters["current_media_bytes"], utc_now(),
            ),
        )
        db.commit()
    persist_progress("scan_complete")
    logger.emit("info", "scan_complete", **counters)
    return counters
