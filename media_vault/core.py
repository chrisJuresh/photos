from __future__ import annotations

import contextlib
import hashlib
import json
import os
import platform
import shutil
import socket
import stat as statmod
import subprocess
import tempfile
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, BinaryIO

from blake3 import blake3

from . import __version__


HASH_ALGORITHM_VERSIONS = {
    "sha256": "FIPS 180-4 via Python hashlib",
    "sha512": "FIPS 180-4 via Python hashlib",
    "blake3": "BLAKE3 specification via blake3-python 1.0.9",
    "byte_compare": "media-vault chunk comparison v1",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def process_is_alive(pid: int) -> bool:
    """Return whether a PID exists without changing that process."""
    if pid <= 0:
        return False
    if os.name == "nt":
        import ctypes
        from ctypes import wintypes

        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        kernel32.OpenProcess.argtypes = (wintypes.DWORD, wintypes.BOOL, wintypes.DWORD)
        kernel32.OpenProcess.restype = wintypes.HANDLE
        kernel32.GetExitCodeProcess.argtypes = (wintypes.HANDLE, ctypes.POINTER(wintypes.DWORD))
        kernel32.GetExitCodeProcess.restype = wintypes.BOOL
        kernel32.CloseHandle.argtypes = (wintypes.HANDLE,)
        kernel32.CloseHandle.restype = wintypes.BOOL
        handle = kernel32.OpenProcess(0x1000, False, pid)  # PROCESS_QUERY_LIMITED_INFORMATION
        if not handle:
            return ctypes.get_last_error() == 5  # Access denied still proves the process exists.
        try:
            exit_code = wintypes.DWORD()
            return bool(kernel32.GetExitCodeProcess(handle, ctypes.byref(exit_code))) and exit_code.value == 259
        finally:
            kernel32.CloseHandle(handle)
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    except OSError:
        # Windows reports a missing PID as OSError(22, winerror=87), not
        # ProcessLookupError. Other non-permission OS errors mean not alive.
        return False


def json_text(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def stable_id(prefix: str, *parts: Any) -> str:
    payload = json_text(parts).encode("utf-8", "surrogatepass")
    return f"{prefix}_{hashlib.sha256(payload).hexdigest()}"


def source_root_id(path_text: str) -> str:
    return stable_id("sr1", path_text)


def source_file_id(root_id: str, path_text: str) -> str:
    return stable_id("sf1", root_id, path_text)


@dataclass(frozen=True)
class FullHashes:
    size_bytes: int
    sha256: str
    blake3: str
    sha512: str

    @property
    def identity_key(self) -> tuple[int, str, str, str]:
        return (self.size_bytes, self.sha256, self.blake3, self.sha512)

    @property
    def asset_id(self) -> str:
        return stable_id("a1", *self.identity_key)

    @property
    def exact_group_id(self) -> str:
        return stable_id("x1", *self.identity_key)

    @property
    def object_relpath(self) -> str:
        leaf = f"{self.sha256}_{self.blake3[:16]}_{self.sha512[:16]}_{self.size_bytes}.blob"
        return str(Path("objects") / "sha256" / self.sha256[:2] / self.sha256[2:4] / leaf)


def hash_stream(stream: BinaryIO, *, chunk_size: int = 8 * 1024 * 1024) -> FullHashes:
    h256 = hashlib.sha256()
    h512 = hashlib.sha512()
    hb3 = blake3()
    size = 0
    while True:
        block = stream.read(chunk_size)
        if not block:
            break
        size += len(block)
        h256.update(block)
        h512.update(block)
        hb3.update(block)
    return FullHashes(size, h256.hexdigest(), hb3.hexdigest(), h512.hexdigest())


def hash_file(path: Path, *, chunk_size: int = 8 * 1024 * 1024) -> FullHashes:
    with path.open("rb", buffering=0) as handle:
        return hash_stream(handle, chunk_size=chunk_size)


def byte_compare(left: Path, right: Path, *, chunk_size: int = 8 * 1024 * 1024) -> bool:
    try:
        if left.stat().st_size != right.stat().st_size:
            return False
        with left.open("rb", buffering=0) as lfh, right.open("rb", buffering=0) as rfh:
            while True:
                lb = lfh.read(chunk_size)
                rb = rfh.read(chunk_size)
                if lb != rb:
                    return False
                if not lb:
                    return True
    except OSError:
        return False


@dataclass(frozen=True)
class VaultLayout:
    root: Path

    @property
    def state(self) -> Path:
        return self.root / "state"

    @property
    def database(self) -> Path:
        return self.state / "manifest.sqlite3"

    @property
    def temp(self) -> Path:
        return self.state / "tmp"

    @property
    def conflicts(self) -> Path:
        return self.state / "conflicts"

    @property
    def backups(self) -> Path:
        return self.state / "backups"

    @property
    def logs(self) -> Path:
        return self.root / "logs"

    @property
    def reports(self) -> Path:
        return self.root / "reports"

    @property
    def records(self) -> Path:
        return self.root / "records" / "assets"

    @property
    def exports(self) -> Path:
        return self.root / "exports"

    @property
    def objects(self) -> Path:
        return self.root / "objects"

    def create(self) -> None:
        for path in (
            self.root,
            self.state,
            self.temp,
            self.conflicts,
            self.logs,
            self.reports,
            self.records,
            self.exports,
            self.objects,
        ):
            path.mkdir(parents=True, exist_ok=True)


def canonical_for_guard(path: Path) -> str:
    return os.path.normcase(os.path.abspath(os.path.realpath(path)))


def is_within(candidate: Path, parent: Path) -> bool:
    c = canonical_for_guard(candidate)
    p = canonical_for_guard(parent)
    try:
        return os.path.commonpath((c, p)) == p
    except ValueError:
        return False


def assert_source_vault_separated(source: Path, vault: Path) -> None:
    if not source.exists() or not source.is_dir():
        raise ValueError(f"Source directory does not exist: {source}")
    if is_within(vault, source):
        raise ValueError("Refusing to place the vault or state inside the immutable source tree")
    if is_within(source, vault):
        raise ValueError("Refusing to scan a source located inside the vault")


def windows_last_access_policy() -> dict[str, Any]:
    result: dict[str, Any] = {"platform": platform.system(), "safe": None, "raw": None}
    if os.name != "nt":
        result["note"] = "Non-Windows platform; use a no-atime mount or O_NOATIME policy as appropriate."
        return result
    try:
        proc = subprocess.run(
            ["fsutil", "behavior", "query", "disablelastaccess"],
            check=False,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=15,
        )
        raw = (proc.stdout + proc.stderr).strip()
        result["raw"] = raw
        # 1 = user-managed disabled; 3 = system-managed disabled.
        for value in ("0", "1", "2", "3"):
            if f"= {value}" in raw or f"= {value} " in raw:
                result["value"] = int(value)
                result["safe"] = value in {"1", "3"}
                break
        if result["safe"] is None:
            lowered = raw.lower()
            if "disabled" in lowered:
                result["safe"] = True
            elif "enabled" in lowered:
                result["safe"] = False
    except Exception as exc:  # pragma: no cover - platform/tool dependent
        result["error"] = f"{type(exc).__name__}: {exc}"
    return result


def disk_usage_for(path: Path) -> shutil._ntuple_diskusage:
    probe = path
    while not probe.exists() and probe.parent != probe:
        probe = probe.parent
    return shutil.disk_usage(probe)


def human_bytes(value: int | float) -> str:
    units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"]
    number = float(value)
    for unit in units:
        if abs(number) < 1024.0 or unit == units[-1]:
            return f"{number:.2f} {unit}"
        number /= 1024.0
    return f"{number:.2f} PiB"


class JsonlLogger:
    def __init__(self, path: Path, run_id: str):
        self.path = path
        self.run_id = run_id
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._handle = path.open("a", encoding="utf-8", newline="\n")

    def emit(self, level: str, event: str, **fields: Any) -> None:
        record = {"timestamp": utc_now(), "run_id": self.run_id, "level": level, "event": event, **fields}
        self._handle.write(json_text(record) + "\n")
        self._handle.flush()

    def close(self) -> None:
        self._handle.flush()
        os.fsync(self._handle.fileno())
        self._handle.close()

    def __enter__(self) -> "JsonlLogger":
        return self

    def __exit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        self.close()


class VaultRunLock:
    """Single-writer guard stored in vault state, with stale-PID recovery."""

    def __init__(self, state_dir: Path, command: str):
        self.path = state_dir / "active-writer.lock"
        self.command = command
        self.token = uuid.uuid4().hex
        self.acquired = False

    @staticmethod
    def _pid_alive(pid: int) -> bool:
        return process_is_alive(pid)

    def __enter__(self) -> "VaultRunLock":
        self.path.parent.mkdir(parents=True, exist_ok=True)
        record = {
            "pid": os.getpid(), "token": self.token, "command": self.command,
            "created_at": utc_now(), "host": socket.gethostname(),
        }
        for _attempt in range(2):
            try:
                fd = os.open(self.path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
                with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
                    handle.write(json_text(record) + "\n")
                    handle.flush()
                    os.fsync(handle.fileno())
                self.acquired = True
                return self
            except FileExistsError:
                try:
                    existing = json.loads(self.path.read_text(encoding="utf-8"))
                    pid = int(existing.get("pid", -1))
                except Exception:
                    existing = {"unreadable": True}
                    pid = -1
                if pid > 0 and self._pid_alive(pid):
                    raise RuntimeError(f"Another vault writer is active: {json_text(existing)}")
                # Only our own state lock is removed; media objects and source
                # entries are never involved in stale-lock recovery.
                with contextlib.suppress(FileNotFoundError):
                    self.path.unlink()
        raise RuntimeError(f"Could not acquire vault writer lock: {self.path}")

    def __exit__(self, exc_type: Any, exc: Any, tb: Any) -> None:
        if not self.acquired:
            return
        try:
            existing = json.loads(self.path.read_text(encoding="utf-8"))
            if existing.get("token") == self.token:
                self.path.unlink()
        except FileNotFoundError:
            pass


def new_run_id() -> str:
    return f"run_{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}_{uuid.uuid4().hex[:12]}"


def run_host() -> str:
    return f"{socket.gethostname()}|{platform.platform()}|python-{platform.python_version()}"


def atomic_write_json(path: Path, value: Any, temp_dir: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_dir.mkdir(parents=True, exist_ok=True)
    fd, raw_temp = tempfile.mkstemp(prefix="record-", suffix=".tmp", dir=temp_dir)
    temp = Path(raw_temp)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            json.dump(value, handle, ensure_ascii=False, sort_keys=True, indent=2)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        # On Windows os.rename refuses to replace an existing target. Sidecars are
        # mutable manifests, so use os.replace only for records, never media objects.
        # Windows can transiently deny replacement while antivirus or a reader
        # has the old snapshot open. Retry this metadata publication only; media
        # objects use the separate no-overwrite hard-link path.
        for attempt in range(20):
            try:
                os.replace(temp, path)
                break
            except PermissionError:
                if os.name != "nt" or attempt == 19:
                    raise
                import time

                time.sleep(0.025 * (attempt + 1))
    finally:
        with contextlib.suppress(FileNotFoundError):
            temp.unlink()


def file_is_reparse_or_symlink(entry: os.DirEntry[str]) -> bool:
    try:
        if entry.is_symlink():
            return True
        st = entry.stat(follow_symlinks=False)
        attrs = getattr(st, "st_file_attributes", 0)
        reparse = getattr(statmod, "FILE_ATTRIBUTE_REPARSE_POINT", 0x400)
        return bool(attrs & reparse)
    except OSError:
        return False


def executable_path(name: str, explicit: str | None = None) -> Path | None:
    if explicit:
        candidate = Path(explicit)
        return candidate if candidate.exists() else None
    found = shutil.which(name)
    if found:
        return Path(found)
    if name.lower() == "exiftool" and os.name == "nt":
        local = Path(os.environ.get("LOCALAPPDATA", "")) / "Programs" / "ExifTool" / "ExifTool.exe"
        if local.exists():
            return local
    return None


def tool_version(executable: Path | None, args: list[str]) -> str | None:
    if executable is None:
        return None
    try:
        proc = subprocess.run(
            [str(executable), *args], capture_output=True, text=True, errors="replace", timeout=15, check=False
        )
        return (proc.stdout or proc.stderr).splitlines()[0].strip()
    except Exception:
        return None


def tool_identity(exiftool: Path | None, ffprobe: Path | None, ffmpeg: Path | None) -> dict[str, Any]:
    return {
        "media_vault": __version__,
        "exiftool": tool_version(exiftool, ["-ver"]),
        "ffprobe": tool_version(ffprobe, ["-version"]),
        "ffmpeg": tool_version(ffmpeg, ["-version"]),
        "hash_algorithms": HASH_ALGORITHM_VERSIONS,
    }
