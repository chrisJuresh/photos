from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .core import human_bytes, process_is_alive


def _parse_utc(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _elapsed_text(seconds: float) -> str:
    seconds = max(0, int(seconds))
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"


def _bar(tick: int, width: int = 24, segment: int = 6) -> str:
    travel = max(1, width - segment)
    phase = tick % (travel * 2)
    start = phase if phase <= travel else travel * 2 - phase
    cells = ["."] * width
    for index in range(start, min(start + segment, width)):
        cells[index] = "#"
    return "".join(cells)


def _determinate_bar(done: int, total: int, width: int = 24) -> str:
    filled = width if total <= 0 else min(width, max(0, round(width * done / total)))
    return "#" * filled + "." * (width - filled)


def _latest_progress(progress_dir: Path) -> dict[str, Any] | None:
    try:
        paths = list(progress_dir.glob("run_*.json"))
    except OSError:
        return None
    if not paths:
        return None
    latest = max(paths, key=lambda path: path.stat().st_mtime_ns)
    try:
        return json.loads(latest.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def _writer_state(lock_path: Path) -> tuple[bool, str]:
    try:
        record = json.loads(lock_path.read_text(encoding="utf-8"))
        alive = process_is_alive(int(record.get("pid", -1)))
        return alive, str(record.get("command", "writer"))
    except (OSError, ValueError, json.JSONDecodeError):
        return False, "none"


def _log_activity(state_dir: Path, progress: dict[str, Any]) -> datetime | None:
    run_id = progress.get("run_id")
    if not run_id:
        return None
    try:
        modified = (state_dir.parent / "logs" / f"{run_id}.jsonl").stat().st_mtime
        return datetime.fromtimestamp(modified, timezone.utc)
    except OSError:
        return None


def watch_progress(state_dir: Path, *, interval: float = 10.0, once: bool = False) -> int:
    progress_dir = state_dir / "progress"
    lock_path = state_dir / "active-writer.lock"
    previous: dict[str, Any] | None = None
    previous_at: float | None = None
    tick = 0
    while True:
        current = _latest_progress(progress_dir)
        writer_alive, writer_command = _writer_state(lock_path)
        if current is None:
            line = (
                f"[{_bar(tick)}] {writer_command} is starting; waiting for the first progress checkpoint"
                if writer_alive
                else "No active scanner or saved progress snapshot was found."
            )
            print("\r" + line, end="", flush=True)
            if once or not writer_alive:
                print()
                return 0
            tick += 1
            time.sleep(max(interval, 1.0))
            continue
        now_mono = time.monotonic()
        elapsed = (datetime.now(timezone.utc) - _parse_utc(current["updated_at"])).total_seconds()
        log_at = _log_activity(state_dir, current)
        log_elapsed = (datetime.now(timezone.utc) - log_at).total_seconds() if log_at else None
        rate = 0.0
        byte_rate = 0.0
        copy_asset_rate = 0.0
        copy_byte_rate = 0.0
        is_copy = current.get("copy_total_assets") is not None
        if (
            previous
            and previous_at is not None
            and current.get("enumerated_files") is not None
            and previous.get("enumerated_files") is not None
        ):
            delta = max(now_mono - previous_at, 0.001)
            rate = max(0, current["enumerated_files"] - previous["enumerated_files"]) / delta
            byte_rate = max(0, current["bytes_hashed"] - previous["bytes_hashed"]) / delta
        if is_copy and previous and previous_at is not None and previous.get("copy_assets_processed") is not None:
            delta = max(now_mono - previous_at, 0.001)
            copy_asset_rate = max(0, current["copy_assets_processed"] - previous["copy_assets_processed"]) / delta
            copy_byte_rate = max(0, current["copy_bytes_processed"] - previous["copy_bytes_processed"]) / delta
        state = "running" if writer_alive else "stopped"
        if is_copy:
            processed = int(current.get("copy_assets_processed", 0))
            total_assets = int(current.get("copy_total_assets", 0))
            processed_bytes = int(current.get("copy_bytes_processed", 0))
            total_bytes = int(current.get("copy_total_bytes", 0))
            percent = (processed_bytes / total_bytes * 100.0) if total_bytes else 100.0
            eta = ((total_bytes - processed_bytes) / copy_byte_rate) if copy_byte_rate > 0 else None
            detailed_line = (
                f"[{_determinate_bar(processed_bytes, total_bytes)}] {percent:6.2f}% | {state} | "
                f"snapshot age {_elapsed_text(elapsed)} | objects {processed:,}/{total_assets:,} | "
                f"verified {current.get('copy_assets_verified', 0):,} | "
                f"{human_bytes(processed_bytes)}/{human_bytes(total_bytes)} processed | "
                f"{copy_asset_rate:,.2f} objects/s | {human_bytes(copy_byte_rate)}/s | "
                f"ETA {_elapsed_text(eta) if eta is not None else 'learning'} | "
                f"errors {current.get('errors', 0):,} | stage {current['stage']}"
            )
        else:
            detailed_line = (
                f"[{_bar(tick)}] total unknown | {state} | snapshot age {_elapsed_text(elapsed)} | "
                f"log activity {_elapsed_text(log_elapsed) if log_elapsed is not None else 'unknown'} ago | "
                f"this pass {current['enumerated_files']:,} paths | reused {current['unchanged_files']:,} | "
                f"new/changed {current['changed_or_new_files']:,} | newly hashed media {current['media_files']:,} "
                f"({human_bytes(current['bytes_hashed'])}) | {rate:,.1f} paths/s | {human_bytes(byte_rate)}/s | "
                f"errors {current['errors']:,} | warnings {current['warnings']:,} | stage {current['stage']}"
            )
        terminal_width = 220
        try:
            import shutil

            terminal_width = shutil.get_terminal_size((220, 20)).columns
        except OSError:
            pass
        compact_line = (
            f"[{_determinate_bar(processed_bytes, total_bytes, 12)}] {'RUN' if writer_alive else 'STOP'} "
            f"{percent:5.1f}% {processed:,}/{total_assets:,} E{current.get('errors', 0):,} {current['stage']}"
            if is_copy
            else (
                f"[{_bar(tick, width=12, segment=3)}] {'RUN' if writer_alive else 'STOP'} "
                f"cp {_elapsed_text(elapsed)[3:]} act "
                f"{_elapsed_text(log_elapsed)[3:] if log_elapsed is not None else '--:--'} "
                f"P{current['enumerated_files']:,} R{current['unchanged_files']:,} "
                f"C{current['changed_or_new_files']:,} M{current['media_files']:,} "
                f"E{current['errors']:,} W{current['warnings']:,} {current['stage']}"
            )
        )
        line = detailed_line if terminal_width >= 190 else compact_line
        print("\r" + line[: max(20, terminal_width - 1)].ljust(max(20, terminal_width - 1)), end="", flush=True)
        if once or not writer_alive:
            print()
            return 0
        previous = current
        previous_at = now_mono
        tick += 1
        time.sleep(max(interval, 1.0))
