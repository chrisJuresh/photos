from __future__ import annotations

import json
import math
import os
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


RAW_EXTENSIONS = {
    ".3fr", ".ari", ".arw", ".bay", ".cap", ".cr2", ".cr3", ".crw", ".dcr", ".dcs",
    ".dng", ".drf", ".eip", ".erf", ".fff", ".gpr", ".iiq", ".k25", ".kdc", ".mdc",
    ".mef", ".mos", ".mrw", ".nef", ".nrw", ".obm", ".orf", ".pef", ".ptx", ".pxn",
    ".r3d", ".raf", ".raw", ".rw2", ".rwl", ".rwz", ".sr2", ".srf", ".srw", ".x3f",
}

IMAGE_EXTENSIONS = RAW_EXTENSIONS | {
    ".ai", ".apng", ".avif", ".bmp", ".bpg", ".cur", ".dcx", ".dds", ".dib", ".dicm",
    ".dcm", ".emf", ".eps", ".exr", ".fits", ".fit", ".flif", ".gif", ".hdr", ".heic",
    ".heif", ".ico", ".j2c", ".j2k", ".jfif", ".jif", ".jp2", ".jpc", ".jpe", ".jpeg",
    ".jpf", ".jpg", ".jpm", ".jpx", ".jxl", ".mng", ".pbm", ".pcx", ".pfm", ".pgm",
    ".pic", ".png", ".pnm", ".ppm", ".psb", ".psd", ".qoi", ".ras", ".sgi", ".svg",
    ".svgz", ".tga", ".tif", ".tiff", ".wdp", ".webp", ".wmf", ".xbm", ".xcf", ".xpm",
}

VIDEO_EXTENSIONS = {
    ".3g2", ".3gp", ".amv", ".asf", ".avi", ".braw", ".drc", ".dv", ".f4v", ".flv",
    ".gifv", ".gxf", ".h264", ".h265", ".hevc", ".m1v", ".m2t", ".m2ts", ".m2v",
    ".m4v", ".mkv", ".mov", ".mp2v", ".mp4", ".mpe", ".mpeg", ".mpg", ".mts", ".mxf",
    ".ogm", ".ogv", ".qt", ".rm", ".rmvb", ".roq", ".ts", ".vob", ".webm", ".wmv", ".y4m",
}

JPEG_EXTENSIONS = {".jpg", ".jpeg", ".jpe", ".jfif", ".jif"}

RAW_FORMATS = {
    "ARW", "CR2", "CR3", "DNG", "ERF", "FFF", "IIQ", "MEF", "MOS", "MRW", "NEF", "NRW",
    "ORF", "PEF", "RAF", "RAW", "RW2", "RWL", "SR2", "SRF", "SRW", "X3F",
}

FORMAT_EXTENSIONS = {
    "JPEG": JPEG_EXTENSIONS,
    "PNG": {".png", ".apng"},
    "GIF": {".gif"},
    "TIFF": {".tif", ".tiff"},
    "WEBP": {".webp"},
    "BMP": {".bmp", ".dib"},
    "HEIC": {".heic", ".heif"},
    "AVIF": {".avif"},
    "MOV": {".mov", ".qt"},
    "MP4": {".mp4", ".m4v"},
    "AVI": {".avi"},
    "MKV": {".mkv"},
}


def last_suffix(path: Path) -> str:
    return path.suffix.lower()


def signature_kind(path: Path) -> str | None:
    try:
        with path.open("rb", buffering=0) as handle:
            head = handle.read(64)
    except OSError:
        return None
    if head.startswith(b"\xff\xd8\xff"):
        return "image"
    if head.startswith(b"\x89PNG\r\n\x1a\n") or head.startswith((b"GIF87a", b"GIF89a")):
        return "image"
    if head.startswith((b"II*\x00", b"MM\x00*", b"BM", b"8BPS", b"\x00\x00\x01\x00")):
        return "image"
    if head.startswith(b"RIFF") and head[8:12] == b"WEBP":
        return "image"
    if head.startswith(b"RIFF") and head[8:12] in {b"AVI ", b"AVIX"}:
        return "video"
    if head.startswith(b"\x1aE\xdf\xa3"):
        return "video"
    if head.startswith((b"FLV", b"\x00\x00\x01\xba", b"\x00\x00\x01\xb3")):
        return "video"
    if len(head) >= 12 and head[4:8] == b"ftyp":
        brand = head[8:12]
        if brand in {b"avif", b"avis", b"heic", b"heix", b"hevc", b"hevx", b"mif1", b"msf1"}:
            return "image"
        return "video"
    if head.startswith(b"\x30\x26\xb2\x75\x8e\x66\xcf\x11"):
        return "video"
    return None


def tag_value(metadata: dict[str, Any], names: Iterable[str]) -> Any:
    wanted = tuple(names)
    for name in wanted:
        if name in metadata and metadata[name] not in (None, ""):
            return metadata[name]
    for key, value in metadata.items():
        bare = key.rsplit(":", 1)[-1]
        if bare in wanted and value not in (None, ""):
            return value
    return None


def int_or_none(value: Any) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError, OverflowError):
        return None


def float_or_none(value: Any) -> float | None:
    try:
        parsed = float(value)
        return parsed if math.isfinite(parsed) else None
    except (TypeError, ValueError, OverflowError):
        return None


def normalize_metadata(metadata: dict[str, Any]) -> dict[str, Any]:
    width = int_or_none(tag_value(metadata, ("ImageWidth", "ExifImageWidth", "SourceImageWidth")))
    height = int_or_none(tag_value(metadata, ("ImageHeight", "ExifImageHeight", "SourceImageHeight")))
    capture_sources = (
        "DateTimeOriginal", "SubSecDateTimeOriginal", "CreateDate", "MediaCreateDate", "TrackCreateDate",
        "ContentCreateDate", "DateCreated",
    )
    capture = None
    capture_source = None
    for name in capture_sources:
        value = tag_value(metadata, (name,))
        if value not in (None, ""):
            capture = str(value)
            capture_source = name
            break
    warnings: list[str] = []
    warning = tag_value(metadata, ("Warning",))
    error = tag_value(metadata, ("Error",))
    if warning:
        warnings.append(str(warning))
    if error:
        warnings.append(str(error))
    return {
        "width": width,
        "height": height,
        "duration_seconds": float_or_none(tag_value(metadata, ("Duration", "MediaDuration", "TrackDuration"))),
        "camera_make": tag_value(metadata, ("Make", "CameraMake")),
        "camera_model": tag_value(metadata, ("Model", "CameraModelName", "CameraModel")),
        "camera_serial": tag_value(
            metadata, ("SerialNumber", "BodySerialNumber", "InternalSerialNumber", "CameraSerialNumber")
        ),
        "lens_model": tag_value(metadata, ("LensModel", "LensType", "LensID")),
        "capture_time_text": capture,
        "capture_time_source": capture_source,
        "orientation_text": tag_value(metadata, ("Orientation", "Rotation")),
        "video_codec": tag_value(metadata, ("VideoCodec", "CompressorID", "CompressorName", "CodecID")),
        "audio_codec": tag_value(metadata, ("AudioCodec", "AudioFormat", "AudioFormatVersion")),
        "warnings": warnings,
    }


@dataclass(frozen=True)
class Discovery:
    status: str
    basis: str
    media_kind: str | None
    mime_type: str | None
    detected_format: str | None
    extension_mismatch: bool
    warnings: list[str]


def classify(path: Path, metadata: dict[str, Any], sniffed: str | None) -> Discovery:
    ext = last_suffix(path)
    mime_raw = tag_value(metadata, ("MIMEType",))
    fmt_raw = tag_value(metadata, ("FileType",))
    mime = str(mime_raw) if mime_raw else None
    fmt = str(fmt_raw).upper() if fmt_raw else None
    warnings: list[str] = []
    error = tag_value(metadata, ("Error",))
    warning = tag_value(metadata, ("Warning",))
    if error:
        warnings.append(f"ExifTool error: {error}")
    if warning:
        warnings.append(f"ExifTool warning: {warning}")

    ext_kind = "raw_image" if ext in RAW_EXTENSIONS else "image" if ext in IMAGE_EXTENSIONS else "video" if ext in VIDEO_EXTENSIONS else None
    mime_kind = "image" if mime and mime.lower().startswith("image/") else "video" if mime and mime.lower().startswith("video/") else None
    if fmt in RAW_FORMATS:
        mime_kind = "raw_image"

    kind = mime_kind or ("image" if sniffed == "image" else "video" if sniffed == "video" else None) or ext_kind
    if kind == "image" and ext in RAW_EXTENSIONS:
        kind = "raw_image"
    if kind is None:
        return Discovery("non_media", "no_media_evidence", None, mime, fmt, False, warnings)

    bases: list[str] = []
    if mime_kind:
        bases.append("exiftool_mime")
    if fmt:
        bases.append("exiftool_format")
    if sniffed:
        bases.append("signature")
    if ext_kind:
        bases.append("extension")
    extension_mismatch = bool(ext_kind and mime_kind and ext_kind.replace("raw_", "") != mime_kind.replace("raw_", ""))
    detected_non_media = bool(ext_kind and mime and not mime.lower().startswith(("image/", "video/")))
    if detected_non_media:
        extension_mismatch = True
    if not extension_mismatch and ext_kind and sniffed:
        extension_mismatch = ext_kind.replace("raw_", "") != sniffed
    if not extension_mismatch and fmt in FORMAT_EXTENSIONS and ext:
        extension_mismatch = ext not in FORMAT_EXTENSIONS[fmt]
    if extension_mismatch:
        warnings.append(f"Extension {ext or '<none>'} disagrees with detected media kind")
    if detected_non_media:
        warnings.append("Media candidate retained from extension evidence although content detection reported a non-media type")
    if error and (ext_kind or sniffed):
        warnings.append("Media retained because extension/signature identifies it despite metadata failure")
    if ext_kind and not mime_kind and not fmt and not sniffed:
        warnings.append("Media candidate retained from extension evidence only; content may be unsupported, malformed, or corrupt")
    return Discovery("media", "+".join(bases) or "unknown", kind, mime, fmt, extension_mismatch, warnings)


class ExifToolReader:
    def __init__(self, executable: Path, temp_dir: Path):
        self.executable = executable
        self.temp_dir = temp_dir
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def read_batch(self, paths: list[Path]) -> list[dict[str, Any]]:
        if not paths:
            return []
        fd, raw_argfile = tempfile.mkstemp(prefix="exiftool-", suffix=".args", dir=self.temp_dir)
        argfile = Path(raw_argfile)
        try:
            with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
                for path in paths:
                    handle.write(str(path) + "\n")
            command = [
                str(self.executable),
                "-json", "-n", "-G1", "-struct", "-q", "-q", "-m", "-charset", "filename=UTF8",
                "-api", "largefilesupport=1",
                "-FileType", "-FileTypeExtension", "-MIMEType", "-ImageWidth", "-ImageHeight",
                "-ExifImageWidth", "-ExifImageHeight", "-SourceImageWidth", "-SourceImageHeight",
                "-DateTimeOriginal", "-SubSecDateTimeOriginal", "-CreateDate", "-MediaCreateDate",
                "-TrackCreateDate", "-ContentCreateDate", "-DateCreated", "-OffsetTimeOriginal",
                "-Make", "-Model", "-CameraModelName", "-SerialNumber", "-BodySerialNumber",
                "-InternalSerialNumber", "-CameraSerialNumber", "-LensModel", "-LensType", "-LensID",
                "-Orientation", "-Rotation", "-Duration", "-MediaDuration", "-TrackDuration",
                "-VideoCodec", "-CompressorID", "-CompressorName", "-CodecID", "-AudioCodec",
                "-AudioFormat", "-AudioFormatVersion", "-Warning", "-Error", "-@", str(argfile),
            ]
            proc = subprocess.run(
                command,
                check=False,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
            )
            try:
                values = json.loads(proc.stdout or "[]")
            except json.JSONDecodeError as exc:
                return [
                    {"File:SourceFile": str(path), "File:Error": f"ExifTool JSON parse error: {exc}; {proc.stderr[:500]}"}
                    for path in paths
                ]
            output: list[dict[str, Any]] = []
            for index, path in enumerate(paths):
                if index < len(values) and isinstance(values[index], dict):
                    output.append(values[index])
                else:
                    output.append({"File:SourceFile": str(path), "File:Error": "ExifTool omitted this file"})
            return output
        finally:
            try:
                argfile.unlink()
            except FileNotFoundError:
                pass


def ffprobe_metadata(executable: Path | None, path: Path) -> dict[str, Any]:
    if executable is None:
        return {}
    command = [
        str(executable), "-v", "error", "-show_entries",
        "format=format_name,duration:stream=index,codec_type,codec_name,width,height,duration,avg_frame_rate",
        "-of", "json", str(path),
    ]
    try:
        proc = subprocess.run(command, capture_output=True, check=False, timeout=120)
        if proc.returncode != 0:
            return {"ffprobe_error": proc.stderr.decode("utf-8", "replace")[:1000]}
        parsed = json.loads(proc.stdout.decode("utf-8", "replace"))
    except Exception as exc:
        return {"ffprobe_error": f"{type(exc).__name__}: {exc}"}
    result: dict[str, Any] = {"ffprobe": parsed}
    format_info = parsed.get("format", {})
    if format_info.get("format_name"):
        result["FFprobe:FormatName"] = format_info["format_name"]
    if format_info.get("duration"):
        result["FFprobe:Duration"] = format_info["duration"]
    for stream in parsed.get("streams", []):
        if stream.get("codec_type") == "video":
            result.setdefault("FFprobe:VideoCodec", stream.get("codec_name"))
            result.setdefault("FFprobe:ImageWidth", stream.get("width"))
            result.setdefault("FFprobe:ImageHeight", stream.get("height"))
        elif stream.get("codec_type") == "audio":
            result.setdefault("FFprobe:AudioCodec", stream.get("codec_name"))
    return result
