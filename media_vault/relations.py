from __future__ import annotations

import hashlib
import math
import re
import subprocess
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable

import imagehash
from PIL import Image, ImageOps

from .core import JsonlLogger, VaultLayout, json_text, stable_id, utc_now
from .db import ManifestDB


def _asset_path(db: ManifestDB, vault: VaultLayout, asset_id: str) -> Path | None:
    row = db.one("SELECT object_relpath,object_status FROM assets WHERE asset_id=?", (asset_id,))
    if row and row["object_status"] == "verified":
        path = vault.root / Path(row["object_relpath"])
        if path.is_file():
            return path
    rows = db.all(
        """SELECT sf.path_text FROM asset_sources aus
           JOIN source_versions sv ON sv.source_version_id=aus.source_version_id
           JOIN source_files sf ON sf.source_file_id=sv.source_file_id
           WHERE aus.asset_id=? AND sf.present=1
           ORDER BY aus.is_initial_representative DESC,sv.source_version_id""",
        (asset_id,),
    )
    for source in rows:
        path = Path(source["path_text"])
        if path.is_file():
            return path
    return None


def _relationship(
    db: ManifestDB,
    run_id: str,
    left: str,
    right: str,
    relationship_type: str,
    method: str,
    label: str,
    score: float,
    evidence: dict[str, Any],
) -> None:
    if left == right:
        return
    left, right = sorted((left, right))
    relationship_id = stable_id("rel1", left, right, relationship_type, method)
    db.execute(
        """INSERT INTO relationships(
               relationship_id,left_asset_id,right_asset_id,relationship_type,method,confidence_label,
               confidence_score,evidence_json,created_run_id,created_at
           ) VALUES(?,?,?,?,?,?,?,?,?,?)
           ON CONFLICT(left_asset_id,right_asset_id,relationship_type,method) DO UPDATE SET
               confidence_label=excluded.confidence_label,confidence_score=excluded.confidence_score,
               evidence_json=excluded.evidence_json,created_run_id=excluded.created_run_id,
               created_at=excluded.created_at""",
        (
            relationship_id, left, right, relationship_type, method, label, score, json_text(evidence),
            run_id, utc_now(),
        ),
    )


def analyze_images(
    db: ManifestDB,
    vault: VaultLayout,
    run_id: str,
    logger: JsonlLogger,
    *,
    max_pixels: int = 100_000_000,
    phash_distance: int = 6,
) -> dict[str, int]:
    Image.MAX_IMAGE_PIXELS = max_pixels
    rows = db.all(
        "SELECT asset_id,decoded_pixel_sha256,perceptual_hash,width,height FROM assets "
        "WHERE media_kind='image' OR media_kind='raw_image' ORDER BY asset_id"
    )
    counters = {"image_assets": len(rows), "analyzed": 0, "skipped": 0, "errors": 0, "relationships": 0}
    for row in rows:
        if row["decoded_pixel_sha256"] and row["perceptual_hash"]:
            continue
        path = _asset_path(db, vault, row["asset_id"])
        if path is None:
            counters["skipped"] += 1
            continue
        try:
            with Image.open(path) as opened:
                pixels = int(opened.width) * int(opened.height)
                if pixels > max_pixels:
                    raise ValueError(f"Decoded image has {pixels} pixels, above safety limit {max_pixels}")
                oriented = ImageOps.exif_transpose(opened)
                canonical = oriented.convert("RGBA" if "A" in oriented.getbands() else "RGB")
                header = f"decoded-pixels-v1\0{canonical.mode}\0{canonical.width}\0{canonical.height}\0".encode("ascii")
                hasher = hashlib.sha256()
                hasher.update(header)
                hasher.update(canonical.tobytes())
                digest = hasher.hexdigest()
                phash = str(imagehash.phash(canonical.convert("RGB"), hash_size=8))
                db.execute(
                    """UPDATE assets SET decoded_pixel_sha256=?,perceptual_hash=?,width=COALESCE(width,?),
                       height=COALESCE(height,?),updated_at=? WHERE asset_id=?""",
                    (digest, phash, canonical.width, canonical.height, utc_now(), row["asset_id"]),
                )
                counters["analyzed"] += 1
        except Exception as exc:
            counters["errors"] += 1
            db.add_warning(
                run_id, "warning", "image_decode_analysis_failed",
                "Image was retained but decoded-pixel/perceptual analysis failed.", utc_now(),
                asset_id=row["asset_id"], evidence={"path": str(path), "error": f"{type(exc).__name__}: {exc}"},
            )
        if (counters["analyzed"] + counters["errors"]) % 100 == 0:
            db.commit()
            logger.emit("info", "image_analysis_progress", **counters)
    db.commit()

    analyzed = db.all(
        "SELECT asset_id,decoded_pixel_sha256,perceptual_hash,width,height FROM assets "
        "WHERE decoded_pixel_sha256 IS NOT NULL AND perceptual_hash IS NOT NULL ORDER BY asset_id"
    )
    pixel_groups: dict[str, list[Any]] = defaultdict(list)
    for row in analyzed:
        pixel_groups[row["decoded_pixel_sha256"]].append(row)
    for digest, members in pixel_groups.items():
        if len(members) < 2:
            continue
        for index, left in enumerate(members):
            for right in members[index + 1 :]:
                _relationship(
                    db, run_id, left["asset_id"], right["asset_id"], "identical_decoded_pixels",
                    "pillow_exif_transpose_rgba_or_rgb_sha256_v1", "high", 0.99,
                    {
                        "decoded_pixel_sha256": digest,
                        "dimensions": [left["width"], left["height"]],
                        "note": "Decoded pixels match; file bytes and metadata/encoding differ and are preserved.",
                    },
                )
                counters["relationships"] += 1

    # BK-tree gives scalable Hamming-radius lookup without treating the perceptual
    # hash as exact identity.
    tree: dict[str, Any] | None = None

    def add(node: dict[str, Any] | None, value: int, row: Any) -> dict[str, Any]:
        if node is None:
            return {"value": value, "rows": [row], "children": {}}
        distance = (node["value"] ^ value).bit_count()
        if distance == 0:
            node["rows"].append(row)
        else:
            node["children"][distance] = add(node["children"].get(distance), value, row)
        return node

    def query(node: dict[str, Any] | None, value: int, radius: int) -> Iterable[Any]:
        if node is None:
            return []
        distance = (node["value"] ^ value).bit_count()
        found = list(node["rows"]) if distance <= radius else []
        for edge, child in node["children"].items():
            if distance - radius <= edge <= distance + radius:
                found.extend(query(child, value, radius))
        return found

    for row in analyzed:
        value = int(row["perceptual_hash"], 16)
        for other in query(tree, value, phash_distance):
            if row["decoded_pixel_sha256"] == other["decoded_pixel_sha256"]:
                continue
            distance = (value ^ int(other["perceptual_hash"], 16)).bit_count()
            lw, lh, rw, rh = row["width"], row["height"], other["width"], other["height"]
            aspect_delta = None
            if lw and lh and rw and rh:
                aspect_delta = abs((lw / lh) - (rw / rh)) / max(lw / lh, rw / rh)
                if aspect_delta > 0.15:
                    continue
            score = max(0.50, 0.98 - distance * 0.06 - (aspect_delta or 0.0))
            label = "high" if distance <= 2 else "medium" if distance <= 4 else "low"
            _relationship(
                db, run_id, row["asset_id"], other["asset_id"], "visually_similar_image",
                "pillow_phash64_hamming_v1", label, score,
                {
                    "phash_left": row["perceptual_hash"], "phash_right": other["perceptual_hash"],
                    "hamming_distance": distance, "threshold": phash_distance,
                    "aspect_ratio_relative_delta": aspect_delta,
                    "note": "Perceptual evidence only; never used for automatic deduplication.",
                },
            )
            counters["relationships"] += 1
        tree = add(tree, value, row)
    db.commit()
    logger.emit("info", "image_analysis_complete", **counters)
    return counters


def _parse_capture(value: str | None) -> datetime | None:
    if not value:
        return None
    candidate = value.strip().replace("Z", "+00:00")
    patterns = (
        "%Y:%m:%d %H:%M:%S.%f%z", "%Y:%m:%d %H:%M:%S%z", "%Y:%m:%d %H:%M:%S.%f",
        "%Y:%m:%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f%z", "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%d %H:%M:%S",
    )
    for pattern in patterns:
        try:
            return datetime.strptime(candidate, pattern)
        except ValueError:
            continue
    return None


_DERIVED_SUFFIX = re.compile(r"(?i)(?:[-_ ](?:edit(?:ed)?|developed|export|final|hdr|bw|mono|crop|retouch|copy|v\d+|\d+))+$")


def _stem_variants(path_text: str) -> tuple[str, str]:
    stem = Path(path_text).stem.casefold()
    return stem, _DERIVED_SUFFIX.sub("", stem)


def _pairing_source_paths(db: ManifestDB, asset_ids: list[str]) -> dict[str, list[str]]:
    """Fetch paths only for pairing assets, using the asset_sources PK index.

    Avoid a full multi-table scan of every source version.  Chunking stays below
    SQLite's conservative 999-bound-parameter limit and is especially important
    when the manifest lives on an HDD.
    """
    paths: dict[str, list[str]] = defaultdict(list)
    for offset in range(0, len(asset_ids), 800):
        chunk = asset_ids[offset : offset + 800]
        placeholders = ",".join("?" for _ in chunk)
        rows = db.all(
            f"""SELECT DISTINCT aus.asset_id,sf.path_text
                FROM asset_sources aus
                JOIN source_versions sv ON sv.source_version_id=aus.source_version_id
                JOIN source_files sf ON sf.source_file_id=sv.source_file_id
                WHERE aus.asset_id IN ({placeholders})
                ORDER BY aus.asset_id,sf.path_text COLLATE BINARY""",
            tuple(chunk),
        )
        for row in rows:
            paths[row["asset_id"]].append(row["path_text"])
    return paths


def _path_pairing_signals(paths: list[str]) -> tuple[set[str], set[str], set[str]]:
    exact_stems: set[str] = set()
    derived_stems: set[str] = set()
    directories: set[str] = set()
    for path_text in paths:
        exact, derived = _stem_variants(path_text)
        exact_stems.add(exact)
        derived_stems.add(derived)
        directories.add(str(Path(path_text).parent))
    return exact_stems, derived_stems, directories


def _capture_bucket(value: datetime | None) -> tuple[str, int] | None:
    if value is None:
        return None
    if value.tzinfo is not None and value.utcoffset() is not None:
        return "aware", math.floor(value.timestamp())
    epoch = datetime(1970, 1, 1)
    return "naive", math.floor((value - epoch).total_seconds())


def pair_raw_jpeg(db: ManifestDB, run_id: str, logger: JsonlLogger) -> dict[str, int]:
    raws = db.all("SELECT * FROM assets WHERE media_kind='raw_image' ORDER BY asset_id")
    jpegs = db.all(
        "SELECT * FROM assets WHERE media_kind='image' AND lower(preferred_extension) IN ('.jpg','.jpeg','.jpe','.jfif','.jif') ORDER BY asset_id"
    )
    counters = {
        "raw_assets": len(raws),
        "jpeg_assets": len(jpegs),
        "theoretical_all_pairs": len(raws) * len(jpegs),
        "candidate_pairs_evaluated": 0,
        "candidate_relationships": 0,
        "groups": 0,
    }
    accepted_by_jpeg: dict[str, list[tuple[str, float]]] = defaultdict(list)
    group_evidence: dict[tuple[str, str], dict[str, Any]] = {}

    logger.emit(
        "info",
        "raw_jpeg_pairing_started",
        candidate_generation="filename_stem_or_capture_time_window_v2",
        **counters,
    )
    all_paths = _pairing_source_paths(
        db,
        [row["asset_id"] for row in raws] + [row["asset_id"] for row in jpegs],
    )
    raw_paths = {row["asset_id"]: all_paths.get(row["asset_id"], []) for row in raws}
    jpeg_paths = {row["asset_id"]: all_paths.get(row["asset_id"], []) for row in jpegs}
    raw_path_signals = {asset_id: _path_pairing_signals(paths) for asset_id, paths in raw_paths.items()}
    jpeg_path_signals = {asset_id: _path_pairing_signals(paths) for asset_id, paths in jpeg_paths.items()}
    raw_times = {row["asset_id"]: _parse_capture(row["capture_time_text"]) for row in raws}
    jpeg_times = {row["asset_id"]: _parse_capture(row["capture_time_text"]) for row in jpegs}
    jpegs_by_id = {row["asset_id"]: row for row in jpegs}

    jpeg_exact_stem_index: dict[str, set[str]] = defaultdict(set)
    jpeg_derived_stem_index: dict[str, set[str]] = defaultdict(set)
    jpeg_time_index: dict[tuple[str, int], set[str]] = defaultdict(set)
    for jpeg in jpegs:
        jpeg_id = jpeg["asset_id"]
        exact_stems, derived_stems, _directories = jpeg_path_signals[jpeg_id]
        for stem in exact_stems:
            jpeg_exact_stem_index[stem].add(jpeg_id)
        for stem in derived_stems:
            jpeg_derived_stem_index[stem].add(jpeg_id)
        bucket = _capture_bucket(jpeg_times[jpeg_id])
        if bucket:
            jpeg_time_index[bucket].add(jpeg_id)

    for raw_index, raw in enumerate(raws, start=1):
        raw_id = raw["asset_id"]
        raw_time = raw_times[raw_id]
        raw_exact_stems, _raw_derived_stems, raw_directories = raw_path_signals[raw_id]
        candidate_ids: set[str] = set()
        for stem in raw_exact_stems:
            candidate_ids.update(jpeg_exact_stem_index.get(stem, ()))
            candidate_ids.update(jpeg_derived_stem_index.get(stem, ()))
        raw_bucket = _capture_bucket(raw_time)
        if raw_bucket:
            kind, second = raw_bucket
            for candidate_second in range(second - 61, second + 62):
                candidate_ids.update(jpeg_time_index.get((kind, candidate_second), ()))

        counters["candidate_pairs_evaluated"] += len(candidate_ids)
        for jpeg_id in sorted(candidate_ids):
            jpeg = jpegs_by_id[jpeg_id]
            jpeg_exact_stems, jpeg_derived_stems, jpeg_directories = jpeg_path_signals[jpeg_id]
            evidence: dict[str, Any] = {
                "rules_version": "raw-jpeg-v2",
                "candidate_generation": "filename_stem_or_capture_time_within_61_seconds",
                "signals": [],
            }
            score = 0.0
            exact_stem = bool(raw_exact_stems & jpeg_exact_stems)
            derived_stem = bool(raw_exact_stems & jpeg_derived_stems) and not exact_stem
            same_directory = bool(raw_directories & jpeg_directories)
            if exact_stem:
                score += 0.32
                evidence["signals"].append("casefolded_filename_stem_exact")
            elif derived_stem:
                score += 0.22
                evidence["signals"].append("jpeg_stem_has_recognized_edit_suffix")
            if same_directory:
                score += 0.08
                evidence["signals"].append("same_source_directory")

            jpeg_time = jpeg_times[jpeg_id]
            time_delta = None
            if raw_time and jpeg_time:
                try:
                    time_delta = abs((raw_time - jpeg_time).total_seconds())
                except TypeError:
                    time_delta = None
                if time_delta is not None:
                    evidence["capture_time_delta_seconds"] = time_delta
                    if time_delta <= 1.0:
                        score += 0.30
                        evidence["signals"].append("capture_time_within_1_second")
                    elif time_delta <= 2.0:
                        score += 0.24
                        evidence["signals"].append("capture_time_within_2_seconds")
                    elif time_delta <= 60.0:
                        score += 0.05
                        evidence["signals"].append("capture_time_within_60_seconds")

            serial_match = bool(raw["camera_serial"] and jpeg["camera_serial"] and str(raw["camera_serial"]).casefold() == str(jpeg["camera_serial"]).casefold())
            model_match = bool(raw["camera_model"] and jpeg["camera_model"] and str(raw["camera_model"]).casefold() == str(jpeg["camera_model"]).casefold())
            make_match = bool(raw["camera_make"] and jpeg["camera_make"] and str(raw["camera_make"]).casefold() == str(jpeg["camera_make"]).casefold())
            if serial_match:
                score += 0.24
                evidence["signals"].append("camera_serial_exact")
            elif model_match:
                score += 0.14
                evidence["signals"].append("camera_model_exact")
            elif make_match:
                score += 0.04
                evidence["signals"].append("camera_make_exact")

            aspect_delta = None
            if raw["width"] and raw["height"] and jpeg["width"] and jpeg["height"]:
                ra = raw["width"] / raw["height"]
                ja = jpeg["width"] / jpeg["height"]
                aspect_delta = abs(ra - ja) / max(ra, ja)
                evidence["aspect_ratio_relative_delta"] = aspect_delta
                if aspect_delta <= 0.01:
                    score += 0.10
                    evidence["signals"].append("aspect_ratio_within_1_percent")

            has_name = exact_stem or derived_stem
            strong_metadata = (time_delta is not None and time_delta <= 2.0 and (model_match or serial_match))
            accepted = score >= 0.68 and ((has_name and (strong_metadata or serial_match)) or (serial_match and time_delta is not None and time_delta <= 1.0))
            if not evidence["signals"] or (not has_name and score < 0.50):
                continue
            label = "high" if score >= 0.82 else "medium" if score >= 0.68 else "low"
            evidence["accepted_group_member"] = accepted
            evidence["raw_source_paths"] = raw_paths[raw["asset_id"]]
            evidence["jpeg_source_paths"] = jpeg_paths[jpeg["asset_id"]]
            _relationship(
                db, run_id, raw_id, jpeg_id, "raw_jpeg_candidate",
                "metadata_indexed_candidate_scoring_v2", label, min(score, 1.0), evidence,
            )
            counters["candidate_relationships"] += 1
            if accepted:
                accepted_by_jpeg[jpeg_id].append((raw_id, score))
                group_evidence[(raw_id, jpeg_id)] = evidence
        if raw_index % 250 == 0:
            db.commit()
            logger.emit(
                "info",
                "raw_jpeg_pairing_progress",
                raw_assets_processed=raw_index,
                **counters,
            )

    accepted_by_raw: dict[str, list[tuple[str, float]]] = defaultdict(list)
    for jpeg_id, candidates in accepted_by_jpeg.items():
        for raw_id, score in candidates:
            accepted_by_raw[raw_id].append((jpeg_id, score))
    for raw in raws:
        raw_id = raw["asset_id"]
        members = accepted_by_raw.get(raw_id, [])
        if not members:
            continue
        group_id = stable_id("rjg1", raw_id)
        group_score = max(score for _jpeg, score in members)
        group_label = "high" if group_score >= 0.82 else "medium"
        evidence = {
            "anchor": "raw_asset_id",
            "rules_version": "raw-jpeg-v2",
            "supports_one_to_many": True,
            "jpeg_member_count": len(members),
        }
        db.execute(
            """INSERT INTO raw_jpeg_groups(
                   raw_jpeg_group_id,anchor_raw_asset_id,confidence_label,confidence_score,evidence_json,
                   created_run_id,created_at
               ) VALUES(?,?,?,?,?,?,?) ON CONFLICT(raw_jpeg_group_id) DO UPDATE SET
                   confidence_label=excluded.confidence_label,confidence_score=excluded.confidence_score,
                   evidence_json=excluded.evidence_json,created_run_id=excluded.created_run_id,
                   created_at=excluded.created_at""",
            (group_id, raw_id, group_label, min(group_score, 1.0), json_text(evidence), run_id, utc_now()),
        )
        db.execute(
            """INSERT INTO raw_jpeg_members(
                   raw_jpeg_group_id,asset_id,role,confidence_label,confidence_score,evidence_json,ambiguous,
                   alternative_group_ids_json
               ) VALUES(?,?,?,?,?,?,0,'[]') ON CONFLICT(raw_jpeg_group_id,asset_id) DO NOTHING""",
            (group_id, raw_id, "raw_anchor", "high", 1.0, json_text({"anchor_raw_asset_id": raw_id})),
        )
        for jpeg_id, score in members:
            alternatives = [stable_id("rjg1", other_raw) for other_raw, _ in accepted_by_jpeg[jpeg_id] if other_raw != raw_id]
            ambiguous = bool(alternatives)
            member_label = "ambiguous" if ambiguous else "high" if score >= 0.82 else "medium"
            db.execute(
                """INSERT INTO raw_jpeg_members(
                       raw_jpeg_group_id,asset_id,role,confidence_label,confidence_score,evidence_json,ambiguous,
                       alternative_group_ids_json
                   ) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(raw_jpeg_group_id,asset_id) DO UPDATE SET
                       confidence_label=excluded.confidence_label,confidence_score=excluded.confidence_score,
                       evidence_json=excluded.evidence_json,ambiguous=excluded.ambiguous,
                       alternative_group_ids_json=excluded.alternative_group_ids_json""",
                (
                    group_id, jpeg_id, "jpeg_derivative_or_companion", member_label, min(score, 1.0),
                    json_text(group_evidence[(raw_id, jpeg_id)]), int(ambiguous), json_text(alternatives),
                ),
            )
        counters["groups"] += 1
    db.commit()
    logger.emit("info", "raw_jpeg_pairing_complete", **counters)
    return counters


def _video_sample_fingerprint(ffmpeg: Path, path: Path, duration: float | None, frames: int = 12) -> str:
    interval = max((duration or 12.0) / max(frames - 1, 1), 0.1)
    vf = f"fps=1/{interval:.9f},scale=32:32:force_original_aspect_ratio=decrease,pad=32:32:(ow-iw)/2:(oh-ih)/2,format=gray"
    command = [
        str(ffmpeg), "-v", "error", "-i", str(path), "-map", "0:v:0", "-vf", vf,
        "-frames:v", str(frames), "-f", "rawvideo", "-pix_fmt", "gray", "pipe:1",
    ]
    proc = subprocess.run(command, capture_output=True, check=False, timeout=max(300, int((duration or 0) * 3)))
    if proc.returncode != 0 or not proc.stdout:
        raise RuntimeError(proc.stderr.decode("utf-8", "replace")[:1000] or "ffmpeg returned no video frames")
    frame_size = 32 * 32
    hashes: list[str] = []
    for offset in range(0, len(proc.stdout) - frame_size + 1, frame_size):
        image = Image.frombytes("L", (32, 32), proc.stdout[offset : offset + frame_size])
        hashes.append(str(imagehash.phash(image, hash_size=8)))
    return ":".join(hashes)


def _decoded_stream_hash(ffmpeg: Path, path: Path, stream: str) -> str | None:
    if stream == "video":
        command = [str(ffmpeg), "-v", "error", "-i", str(path), "-map", "0:v:0", "-f", "rawvideo", "-pix_fmt", "yuv444p", "pipe:1"]
    else:
        command = [str(ffmpeg), "-v", "error", "-i", str(path), "-map", "0:a:0?", "-f", "s16le", "-ac", "2", "-ar", "48000", "pipe:1"]
    proc = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    digest = hashlib.sha256()
    assert proc.stdout is not None
    while block := proc.stdout.read(8 * 1024 * 1024):
        digest.update(block)
    stderr = proc.stderr.read() if proc.stderr else b""
    returncode = proc.wait()
    if returncode != 0:
        if stream == "audio" and b"does not contain any stream" in stderr:
            return None
        raise RuntimeError(stderr.decode("utf-8", "replace")[:1000])
    return digest.hexdigest()


def analyze_videos(
    db: ManifestDB,
    vault: VaultLayout,
    run_id: str,
    logger: JsonlLogger,
    ffmpeg: Path,
    *,
    deep: bool = False,
) -> dict[str, int]:
    rows = db.all("SELECT * FROM assets WHERE media_kind='video' ORDER BY asset_id")
    counters = {"video_assets": len(rows), "sampled": 0, "deep_decoded": 0, "errors": 0, "relationships": 0}
    for row in rows:
        if row["video_frame_fingerprint"] and (not deep or row["decoded_video_sha256"]):
            continue
        path = _asset_path(db, vault, row["asset_id"])
        if path is None:
            continue
        try:
            sample = row["video_frame_fingerprint"] or _video_sample_fingerprint(
                ffmpeg, path, row["duration_seconds"]
            )
            decoded_video = row["decoded_video_sha256"]
            decoded_audio = row["decoded_audio_sha256"]
            counters["sampled"] += int(not row["video_frame_fingerprint"])
            if deep:
                decoded_video = _decoded_stream_hash(ffmpeg, path, "video")
                decoded_audio = _decoded_stream_hash(ffmpeg, path, "audio")
                counters["deep_decoded"] += 1
            db.execute(
                "UPDATE assets SET video_frame_fingerprint=?,decoded_video_sha256=?,decoded_audio_sha256=?,updated_at=? WHERE asset_id=?",
                (sample, decoded_video, decoded_audio, utc_now(), row["asset_id"]),
            )
            db.commit()
        except Exception as exc:
            counters["errors"] += 1
            db.add_warning(
                run_id, "warning", "video_analysis_failed", "Video was retained but relationship analysis failed.",
                utc_now(), asset_id=row["asset_id"], evidence={"path": str(path), "error": f"{type(exc).__name__}: {exc}"},
            )
            db.commit()

    samples: dict[str, list[Any]] = defaultdict(list)
    deep_groups: dict[tuple[str, str], list[Any]] = defaultdict(list)
    for row in db.all("SELECT * FROM assets WHERE media_kind='video' AND video_frame_fingerprint IS NOT NULL ORDER BY asset_id"):
        samples[row["video_frame_fingerprint"]].append(row)
        if row["decoded_video_sha256"]:
            deep_groups[(row["decoded_video_sha256"], row["decoded_audio_sha256"] or "")].append(row)
    for fingerprint, members in samples.items():
        if len(members) < 2:
            continue
        for index, left in enumerate(members):
            for right in members[index + 1 :]:
                _relationship(
                    db, run_id, left["asset_id"], right["asset_id"], "visually_similar_video",
                    "ffmpeg_12_frame_phash_sequence_v1", "medium", 0.80,
                    {
                        "sampled_frame_count": len(fingerprint.split(":")),
                        "fingerprint_match": True,
                        "note": "Sampled perceptual evidence only; never used for automatic deduplication.",
                    },
                )
                counters["relationships"] += 1
    for (video_hash, audio_hash), members in deep_groups.items():
        if len(members) < 2:
            continue
        for index, left in enumerate(members):
            for right in members[index + 1 :]:
                _relationship(
                    db, run_id, left["asset_id"], right["asset_id"], "identical_decoded_primary_streams",
                    "ffmpeg_yuv444p_and_pcm_s16le_sha256_v1", "high", 0.995,
                    {
                        "decoded_video_sha256": video_hash, "decoded_audio_sha256": audio_hash or None,
                        "note": "Canonical decoded streams match; containers/metadata remain distinct and are preserved.",
                    },
                )
                counters["relationships"] += 1
    db.commit()
    logger.emit("info", "video_analysis_complete", deep=deep, **counters)
    return counters
