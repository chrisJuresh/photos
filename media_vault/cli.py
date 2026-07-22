from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Callable

from . import __version__
from .config import DEFAULT_INBOX_ROOT, ReviewConfig
from .core import (
    JsonlLogger,
    VaultRunLock,
    VaultLayout,
    assert_source_vault_separated,
    assert_source_read_policy,
    executable_path,
    json_text,
    new_run_id,
    run_host,
    tool_identity,
    utc_now,
)
from .db import ManifestDB
from .migrations import migrate_vault
from .relations import analyze_images, analyze_videos, pair_raw_jpeg
from .progress import watch_progress
from .scanner import scan_source
from .vault_ops import (
    calculate_capacity,
    export_manifest,
    import_assets,
    rebuild_recovery_index,
    sync_all_sidecars,
    validate_objects,
    write_report,
)


def _path(value: str) -> Path:
    return Path(value).absolute()


def _jsonable_args(args: argparse.Namespace) -> dict[str, Any]:
    return {
        key: str(value) if isinstance(value, Path) else value
        for key, value in vars(args).items()
        if not callable(value)
    }


def _immutability_check(source: Path, allow_unsafe_atime: bool) -> dict[str, Any]:
    del source  # The shared policy is filesystem-wide; retain the legacy call contract.
    return assert_source_read_policy(allow_unsafe_atime)


def _start_run(
    db: ManifestDB,
    run_id: str,
    command: str,
    vault: VaultLayout,
    args: argparse.Namespace,
    source: Path | None,
) -> None:
    db.execute(
        """INSERT INTO runs(
               run_id,command,status,started_at,source_root,vault_root,host,tool_version,arguments_json
           ) VALUES(?,?,?,?,?,?,?,?,?)""",
        (
            run_id, command, "running", utc_now(), str(source) if source else None, str(vault.root), run_host(),
            __version__, json_text(_jsonable_args(args)),
        ),
    )
    db.commit()


def _finish_run(db: ManifestDB, run_id: str, status: str, summary: dict[str, Any]) -> None:
    db.execute(
        "UPDATE runs SET status=?,completed_at=?,summary_json=? WHERE run_id=?",
        (status, utc_now(), json_text(summary), run_id),
    )
    db.commit()
    db.checkpoint()


def _recover_abandoned_runs(db: ManifestDB, next_command: str) -> list[str]:
    """Close stale run rows only after the single-writer lock is held."""
    rows = db.all("SELECT run_id,command,started_at FROM runs WHERE status='running' ORDER BY started_at")
    recovered: list[str] = []
    for row in rows:
        run_id = row["run_id"]
        db.execute(
            "UPDATE runs SET status='interrupted',completed_at=?,summary_json=? WHERE run_id=? AND status='running'",
            (
                utc_now(),
                json_text(
                    {
                        "reason": "writer process ended before the run was finalized",
                        "recovered_before_command": next_command,
                        "previous_command": row["command"],
                        "resumability": (
                            "committed transactions were retained; any transaction not committed by the previous "
                            "process was rolled back by SQLite"
                        ),
                    }
                ),
                run_id,
            ),
        )
        recovered.append(run_id)
    if recovered:
        db.commit()
    return recovered


def _resolve_tools(args: argparse.Namespace, *, need_exiftool: bool = False, need_ffmpeg: bool = False) -> tuple[Path | None, Path | None, Path | None]:
    exiftool = executable_path("exiftool", getattr(args, "exiftool", None))
    ffprobe = executable_path("ffprobe", getattr(args, "ffprobe", None))
    ffmpeg = executable_path("ffmpeg", getattr(args, "ffmpeg", None))
    if need_exiftool and exiftool is None:
        raise RuntimeError("ExifTool is required for discovery and metadata extraction but was not found")
    if need_ffmpeg and ffmpeg is None:
        raise RuntimeError("FFmpeg is required for video relationship analysis but was not found")
    return exiftool, ffprobe, ffmpeg


def _run_mutating_manifest_command(
    args: argparse.Namespace,
    command: str,
    action: Callable[[ManifestDB, VaultLayout, str, JsonlLogger], dict[str, Any]],
    *,
    source: Path | None = None,
) -> int:
    vault = VaultLayout(args.vault)
    if source is not None:
        assert_source_vault_separated(source, vault.root)
    vault.create()
    with VaultRunLock(vault.state, command):
        db = ManifestDB(vault.database)
        recovered_runs = _recover_abandoned_runs(db, command)
        run_id = new_run_id()
        _start_run(db, run_id, command, vault, args, source)
        log_path = vault.logs / f"{run_id}.jsonl"
        summary: dict[str, Any]
        try:
            with JsonlLogger(log_path, run_id) as logger:
                logger.emit("info", "run_started", command=command, arguments=_jsonable_args(args))
                if recovered_runs:
                    logger.emit("warning", "abandoned_runs_recovered", run_ids=recovered_runs)
                summary = action(db, vault, run_id, logger)
                report_path = write_report(
                    vault,
                    run_id,
                    {
                        "report_schema": "immutable-media-vault.run-report",
                        "report_schema_version": 1,
                        "run_id": run_id,
                        "command": command,
                        "status": "completed",
                        "generated_at": utc_now(),
                        "summary": summary,
                        "log_path": str(log_path),
                        "database_path": str(vault.database),
                    },
                )
                summary["report_path"] = str(report_path)
                summary["run_id"] = run_id
                logger.emit("info", "run_completed", summary=summary)
            _finish_run(db, run_id, "completed", summary)
            print(json.dumps(summary, ensure_ascii=False, sort_keys=True, indent=2))
            return 0
        except Exception as exc:
            summary = {"run_id": run_id, "error": f"{type(exc).__name__}: {exc}", "log_path": str(log_path)}
            _finish_run(db, run_id, "failed", summary)
            print(json.dumps(summary, ensure_ascii=False, indent=2), file=sys.stderr)
            return 1
        finally:
            db.close()


def command_preflight(args: argparse.Namespace) -> int:
    source = args.source
    exiftool, ffprobe, ffmpeg = _resolve_tools(args, need_exiftool=True)

    def action(db: ManifestDB, vault: VaultLayout, run_id: str, logger: JsonlLogger) -> dict[str, Any]:
        atime = _immutability_check(source, args.allow_unsafe_atime)
        tools = tool_identity(exiftool, ffprobe, ffmpeg)
        logger.emit("info", "source_immutability_guard", source=str(source), last_access_policy=atime)
        scan = scan_source(
            db, vault, source, run_id, logger, exiftool, ffprobe,
            force_rehash=args.force_rehash, batch_size=args.metadata_batch_size,
        )
        capacity = calculate_capacity(db, vault)
        logger.emit("info", "capacity_calculated", capacity=capacity)
        return {
            "mode": "report-only; no media objects copied",
            "source_immutability_guard": atime,
            "tools": tools,
            "scan": scan,
            "capacity": capacity,
            "deferred": [
                "RAW/JPEG pairing and non-exact relationship analysis (run analyze after import)",
                "sidecar and JSONL/CSV export generation (run export, or produced after import)",
            ],
        }

    return _run_mutating_manifest_command(args, "preflight", action, source=source)


def command_finalize_preflight(args: argparse.Namespace) -> int:
    """Publish capacity from the latest completed scan without touching its source."""

    def action(db: ManifestDB, vault: VaultLayout, run_id: str, logger: JsonlLogger) -> dict[str, Any]:
        roots = [
            dict(row)
            for row in db.all(
                """SELECT path_text,last_complete_run_id,last_seen_at
                   FROM source_roots WHERE last_complete_run_id IS NOT NULL
                   ORDER BY path_text COLLATE BINARY"""
            )
        ]
        if not roots:
            raise RuntimeError("No completed source scan is available; run preflight first")
        capacity = calculate_capacity(db, vault)
        logger.emit("info", "capacity_calculated_from_completed_scan", scan_roots=roots, capacity=capacity)
        return {
            "mode": "capacity-only recovery; no source access, rescan, relationship analysis, export, or media copy",
            "scan_basis": roots,
            "capacity": capacity,
        }

    return _run_mutating_manifest_command(args, "finalize-preflight", action)


def command_init(args: argparse.Namespace) -> int:
    def action(db: ManifestDB, vault: VaultLayout, run_id: str, logger: JsonlLogger) -> dict[str, Any]:
        exiftool, ffprobe, ffmpeg = _resolve_tools(args)
        result = {
            "initialized": True,
            "vault": str(vault.root),
            "database": str(vault.database),
            "tools": tool_identity(exiftool, ffprobe, ffmpeg),
            "note": "No source path was accessed and no media object was copied.",
        }
        logger.emit("info", "vault_initialized", **result)
        return result

    return _run_mutating_manifest_command(args, "init", action)


def command_migrate(args: argparse.Namespace) -> int:
    result = migrate_vault(VaultLayout(args.vault))
    print(json.dumps(result.as_dict(), ensure_ascii=False, sort_keys=True, indent=2))
    return 0


def command_import(args: argparse.Namespace) -> int:
    source = args.source
    exiftool, ffprobe, ffmpeg = _resolve_tools(args, need_exiftool=True)

    def action(db: ManifestDB, vault: VaultLayout, run_id: str, logger: JsonlLogger) -> dict[str, Any]:
        if not args.execute:
            raise RuntimeError("Import is gated: add --execute after reviewing a successful preflight report")
        atime = _immutability_check(source, args.allow_unsafe_atime)
        scan = scan_source(
            db, vault, source, run_id, logger, exiftool, ffprobe,
            force_rehash=args.force_rehash, batch_size=args.metadata_batch_size,
        )
        capacity = calculate_capacity(db, vault)
        logger.emit("info", "capacity_before_copy", capacity=capacity)
        if not scan["traversal_complete"]:
            raise RuntimeError("Import refused because source traversal was incomplete")
        copied = import_assets(db, vault, run_id, logger)
        return {
            "source_immutability_guard": atime,
            "tools": tool_identity(exiftool, ffprobe, ffmpeg),
            "scan": scan,
            "capacity_before_copy": capacity,
            "import": copied,
            "deferred": [
                "RAW/JPEG and non-exact relationship analysis (run analyze)",
                "bulk authoritative JSONL and convenience CSV regeneration (run export)",
            ],
        }

    return _run_mutating_manifest_command(args, "import", action, source=source)


def command_analyze(args: argparse.Namespace) -> int:
    _exiftool, _ffprobe, ffmpeg = _resolve_tools(args, need_ffmpeg=False)

    def action(db: ManifestDB, vault: VaultLayout, run_id: str, logger: JsonlLogger) -> dict[str, Any]:
        images = analyze_images(
            db, vault, run_id, logger, max_pixels=args.max_analysis_pixels, phash_distance=args.phash_distance
        )
        videos: dict[str, Any] = {"skipped": "FFmpeg not found"}
        if ffmpeg is not None:
            videos = analyze_videos(db, vault, run_id, logger, ffmpeg, deep=args.deep_video)
        pairing = pair_raw_jpeg(db, run_id, logger)
        sidecars = sync_all_sidecars(db, vault, logger)
        exported = export_manifest(db, vault, run_id)
        return {"images": images, "videos": videos, "raw_jpeg_pairing": pairing, "sidecar_records": sidecars, "exports": exported}

    return _run_mutating_manifest_command(args, "analyze", action)


def command_validate(args: argparse.Namespace) -> int:
    def action(db: ManifestDB, vault: VaultLayout, run_id: str, logger: JsonlLogger) -> dict[str, Any]:
        result = validate_objects(db, vault, run_id, logger)
        sidecars = sync_all_sidecars(db, vault, logger)
        exported = export_manifest(db, vault, run_id)
        return {"validation": result, "sidecar_records": sidecars, "exports": exported}

    return _run_mutating_manifest_command(args, "validate", action)


def command_export(args: argparse.Namespace) -> int:
    def action(db: ManifestDB, vault: VaultLayout, run_id: str, logger: JsonlLogger) -> dict[str, Any]:
        sidecars = sync_all_sidecars(db, vault, logger)
        exported = export_manifest(db, vault, run_id)
        logger.emit("info", "export_complete", sidecars=sidecars, exported=exported)
        return {"sidecar_records": sidecars, "exports": exported}

    return _run_mutating_manifest_command(args, "export", action)


def command_status(args: argparse.Namespace) -> int:
    vault = VaultLayout(args.vault)
    if not vault.database.exists():
        print(json.dumps({"initialized": False, "vault": str(vault.root)}, indent=2))
        return 0
    db = ManifestDB(vault.database)
    try:
        result = {
            "initialized": True,
            "vault": str(vault.root),
            "database": str(vault.database),
            "runs": [dict(row) for row in db.all("SELECT * FROM runs ORDER BY started_at DESC LIMIT 10")],
            "capacity": calculate_capacity(db, vault),
            "warning_counts": [
                dict(row) for row in db.all("SELECT severity,code,COUNT(*) AS count FROM warnings GROUP BY severity,code ORDER BY severity,code")
            ],
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    finally:
        db.close()


def command_progress(args: argparse.Namespace) -> int:
    vault = VaultLayout(args.vault)
    return watch_progress(vault.state, interval=args.interval, once=args.once)


def command_ui(args: argparse.Namespace) -> int:
    from .ui_server import serve_dashboard

    serve_dashboard(
        args.vault,
        host=args.host,
        port=args.port,
        cache_root=args.cache_root,
        derivative_root=args.derivative_root,
        open_browser=args.open_browser,
    )
    return 0


def _review_config(args: argparse.Namespace) -> ReviewConfig:
    return ReviewConfig(
        vault_root=args.vault,
        inbox_root=getattr(args, "inbox", DEFAULT_INBOX_ROOT),
        derivative_root=getattr(args, "derivative_root", None),
        review_host=getattr(args, "host", "127.0.0.1"),
        review_port=getattr(args, "port", 8766),
    )


def command_review_ui(args: argparse.Namespace) -> int:
    from .review_api import serve_review_app

    exiftool, ffprobe, ffmpeg = _resolve_tools(args)
    serve_review_app(
        _review_config(args),
        open_browser=args.open_browser,
        run_worker=args.run_worker,
        exiftool=exiftool,
        ffprobe=ffprobe,
        ffmpeg=ffmpeg,
    )
    return 0


def command_worker(args: argparse.Namespace) -> int:
    from dataclasses import asdict

    from .review_runtime import run_worker_loop

    exiftool, ffprobe, ffmpeg = _resolve_tools(args)
    result = run_worker_loop(
        _review_config(args),
        once=args.once,
        poll_interval=args.poll_interval,
        worker_id=args.worker_id,
        allow_unsafe_atime=args.allow_unsafe_atime,
        exiftool=exiftool,
        ffprobe=ffprobe,
        ffmpeg=ffmpeg,
    )
    print(json.dumps(asdict(result), ensure_ascii=False, sort_keys=True, indent=2))
    return 0 if result.failed == 0 else 1


def command_preprocess(args: argparse.Namespace) -> int:
    from .review_runtime import preprocess_vault

    exiftool, ffprobe, ffmpeg = _resolve_tools(args)
    result = preprocess_vault(
        _review_config(args),
        backfill=args.backfill,
        exiftool=exiftool,
        ffprobe=ffprobe,
        ffmpeg=ffmpeg,
        allow_unsafe_atime=args.allow_unsafe_atime,
    )
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2))
    return 0 if result["worker"]["failed"] == 0 else 1


def command_inbox_scan(args: argparse.Namespace) -> int:
    from .review_runtime import scan_inbox

    exiftool, _ffprobe, _ffmpeg = _resolve_tools(args)
    result = scan_inbox(
        _review_config(args),
        exiftool=exiftool,
        allow_unsafe_atime=args.allow_unsafe_atime,
        reuse_unchanged=args.reuse_unchanged,
    )
    print(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2))
    return 0


def command_rebuild_index(args: argparse.Namespace) -> int:
    vault = VaultLayout(args.vault)
    result = rebuild_recovery_index(vault, args.output)
    print(json.dumps({"output": str(args.output), **result}, ensure_ascii=False, indent=2))
    return 0


def _add_common_vault(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--vault", type=_path, required=True, help="Destination vault root; must not be inside source")


def _add_scan_options(parser: argparse.ArgumentParser) -> None:
    _add_common_vault(parser)
    parser.add_argument("--source", type=_path, required=True)
    parser.add_argument("--exiftool", help="Explicit ExifTool executable")
    parser.add_argument("--ffprobe", help="Explicit ffprobe executable")
    parser.add_argument("--ffmpeg", help="Explicit ffmpeg executable")
    parser.set_defaults(force_rehash=True)
    parser.add_argument("--force-rehash", dest="force_rehash", action="store_true", help="Rehash all media (the default)")
    parser.add_argument(
        "--reuse-unchanged-hashes", dest="force_rehash", action="store_false",
        help="Use size/mtime/ctime/file-ID snapshots for faster incremental scans; weaker against stealth changes",
    )
    parser.add_argument("--metadata-batch-size", type=int, default=64)
    parser.add_argument(
        "--allow-unsafe-atime", action="store_true", help=argparse.SUPPRESS
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="media-vault",
        description="Read-only-source, content-addressed image/video ingestion with audited exact deduplication.",
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)

    init = sub.add_parser("init", help="Create an empty vault and versioned database without accessing a source")
    _add_common_vault(init)
    init.add_argument("--exiftool", help="Explicit ExifTool executable")
    init.add_argument("--ffprobe", help="Explicit ffprobe executable")
    init.add_argument("--ffmpeg", help="Explicit ffmpeg executable")
    init.set_defaults(func=command_init)

    migrate = sub.add_parser(
        "migrate",
        help="Explicitly back up, migrate, and validate the manifest without accessing media",
    )
    _add_common_vault(migrate)
    migrate.set_defaults(func=command_migrate)

    preflight = sub.add_parser("preflight", help="Discover/hash/report capacity; never copy media objects")
    _add_scan_options(preflight)
    preflight.set_defaults(func=command_preflight)

    finalize = sub.add_parser(
        "finalize-preflight",
        help="Report capacity from the last completed scan without accessing or rescanning the source",
    )
    _add_common_vault(finalize)
    finalize.set_defaults(func=command_finalize_preflight)

    importer = sub.add_parser("import", help="Incremental scan then verified copy; requires --execute")
    _add_scan_options(importer)
    importer.add_argument("--execute", action="store_true", help="Authorize object copying after preflight review")
    importer.set_defaults(func=command_import)

    analyze = sub.add_parser("analyze", help="Record non-exact visual/decoded and RAW/JPEG relationships")
    _add_common_vault(analyze)
    analyze.add_argument("--ffmpeg", help="Explicit ffmpeg executable")
    analyze.add_argument("--max-analysis-pixels", type=int, default=100_000_000)
    analyze.add_argument("--phash-distance", type=int, default=6)
    analyze.add_argument("--deep-video", action="store_true", help="Hash full canonical decoded streams (very slow)")
    analyze.set_defaults(func=command_analyze)

    validate = sub.add_parser("validate", help="Rehash all destination objects and byte-compare available sources")
    _add_common_vault(validate)
    validate.set_defaults(func=command_validate)

    export = sub.add_parser("export", help="Regenerate sidecars, authoritative JSONL export, and convenience CSV")
    _add_common_vault(export)
    export.set_defaults(func=command_export)

    status = sub.add_parser("status", help="Show recent runs, capacity, and warning counts")
    _add_common_vault(status)
    status.set_defaults(func=command_status)

    progress = sub.add_parser(
        "progress", help="Show a live indeterminate bar from tiny atomic checkpoints; does not rescan source"
    )
    _add_common_vault(progress)
    progress.add_argument("--interval", type=float, default=10.0, help="Refresh interval in seconds (default: 10)")
    progress.add_argument("--once", action="store_true", help="Print one snapshot and exit")
    progress.set_defaults(func=command_progress)

    dashboard = sub.add_parser("ui", help="Open the strictly read-only localhost dashboard")
    _add_common_vault(dashboard)
    dashboard.add_argument("--host", default="127.0.0.1", choices=("127.0.0.1", "localhost", "::1"))
    dashboard.add_argument("--port", type=int, default=8765)
    dashboard.add_argument(
        "--cache-root", type=_path, default=Path.cwd() / ".ui-cache",
        help="Preview cache outside the source and vault (default: project .ui-cache)",
    )
    dashboard.add_argument(
        "--derivative-root",
        type=_path,
        help="Prepared derivative root (default: <vault>/derivatives)",
    )
    dashboard.add_argument("--no-open", dest="open_browser", action="store_false", help="Do not open a browser tab")
    dashboard.set_defaults(func=command_ui, open_browser=True)

    review_ui = sub.add_parser("review-ui", help="Open the separate localhost media review application")
    _add_common_vault(review_ui)
    review_ui.add_argument("--inbox", type=_path, default=DEFAULT_INBOX_ROOT)
    review_ui.add_argument("--derivative-root", type=_path, help="Prepared derivative root")
    review_ui.add_argument("--host", default="127.0.0.1", choices=("127.0.0.1", "localhost", "::1"))
    review_ui.add_argument("--port", type=int, default=8766)
    review_ui.add_argument("--exiftool", help="Explicit ExifTool executable for the optional local worker")
    review_ui.add_argument("--ffprobe", help="Explicit ffprobe executable for the optional local worker")
    review_ui.add_argument("--ffmpeg", help="Explicit ffmpeg executable for the optional local worker")
    review_ui.add_argument("--no-open", dest="open_browser", action="store_false", help="Do not open a browser tab")
    review_ui.add_argument("--no-worker", dest="run_worker", action="store_false", help="Do not run the local job worker")
    review_ui.set_defaults(func=command_review_ui, open_browser=True, run_worker=True)

    worker = sub.add_parser("worker", help="Run durable reviewed-copy and preprocessing jobs")
    _add_common_vault(worker)
    worker.add_argument("--inbox", type=_path, default=DEFAULT_INBOX_ROOT)
    worker.add_argument("--derivative-root", type=_path, help="Prepared derivative root")
    worker.add_argument("--exiftool", help="Explicit ExifTool executable")
    worker.add_argument("--ffprobe", help="Explicit ffprobe executable")
    worker.add_argument("--ffmpeg", help="Explicit ffmpeg executable")
    worker.add_argument("--worker-id", default="review-worker")
    worker.add_argument("--poll-interval", type=float, default=2.0)
    worker.add_argument("--once", action="store_true", help="Process at most one ready job and exit")
    worker.add_argument("--allow-unsafe-atime", action="store_true", help=argparse.SUPPRESS)
    worker.set_defaults(func=command_worker)

    preprocess = sub.add_parser("preprocess", help="Run queued derivative/metadata jobs")
    _add_common_vault(preprocess)
    preprocess.add_argument("--inbox", type=_path, default=DEFAULT_INBOX_ROOT)
    preprocess.add_argument("--derivative-root", type=_path, help="Prepared derivative root")
    preprocess.add_argument("--exiftool", help="Explicit ExifTool executable")
    preprocess.add_argument("--ffprobe", help="Explicit ffprobe executable")
    preprocess.add_argument("--ffmpeg", help="Explicit ffmpeg executable")
    preprocess.add_argument("--backfill", action="store_true", help="Enqueue every ready asset before running")
    preprocess.add_argument("--allow-unsafe-atime", action="store_true", help=argparse.SUPPRESS)
    preprocess.set_defaults(func=command_preprocess)

    inbox_scan = sub.add_parser("inbox-scan", help="Discover top-level inbox batches and enqueue review previews")
    _add_common_vault(inbox_scan)
    inbox_scan.add_argument("--inbox", type=_path, default=DEFAULT_INBOX_ROOT)
    inbox_scan.add_argument("--derivative-root", type=_path, help="Prepared derivative root")
    inbox_scan.add_argument("--exiftool", help="Explicit ExifTool executable")
    inbox_scan.add_argument("--reuse-unchanged", action="store_true", help="Reuse unchanged manifest observations")
    inbox_scan.add_argument("--allow-unsafe-atime", action="store_true", help=argparse.SUPPRESS)
    inbox_scan.set_defaults(func=command_inbox_scan)

    rebuild = sub.add_parser("rebuild-index", help="Build a new recovery SQLite index from sidecars and objects")
    _add_common_vault(rebuild)
    rebuild.add_argument("--output", type=_path, required=True)
    rebuild.set_defaults(func=command_rebuild_index)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return int(args.func(args))
    except KeyboardInterrupt:
        print("Interrupted; completed database transactions remain resumable.", file=sys.stderr)
        return 130
    except Exception as exc:
        print(f"{type(exc).__name__}: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
