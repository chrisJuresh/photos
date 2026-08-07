from __future__ import annotations

import hashlib
import json
from dataclasses import asdict
from pathlib import Path

from media_vault.cli import build_parser, main
from media_vault.config import ReviewConfig
from media_vault.core import VaultLayout
from media_vault.db import ManifestDB
from media_vault.review_backfill import control_vault_backfill, current_backfill, ensure_vault_backfill
from media_vault.review_runtime import WorkerSummary, preprocess_vault


def _snapshot(root: Path) -> dict[str, tuple[int, int, int, int, str]]:
    result: dict[str, tuple[int, int, int, int, str]] = {}
    for path in sorted(item for item in root.rglob("*") if item.is_file()):
        stat = path.stat()
        result[str(path.relative_to(root))] = (
            stat.st_size,
            stat.st_mtime_ns,
            stat.st_ctime_ns,
            stat.st_mode,
            hashlib.sha256(path.read_bytes()).hexdigest(),
        )
    return result


def test_stage5_cli_parser_keeps_review_commands_separate(tmp_path: Path) -> None:
    parser = build_parser()
    vault = tmp_path / "vault"
    inbox = tmp_path / "inbox"

    review = parser.parse_args(["review-ui", "--vault", str(vault), "--inbox", str(inbox), "--no-open", "--no-worker"])
    assert review.command == "review-ui"
    assert review.port == 8766
    assert review.open_browser is False
    assert review.run_worker is False
    assert review.func.__name__ == "command_review_ui"

    worker = parser.parse_args(["worker", "--vault", str(vault), "--inbox", str(inbox), "--once"])
    assert worker.command == "worker"
    assert worker.once is True
    assert worker.func.__name__ == "command_worker"

    preprocess = parser.parse_args(["preprocess", "--vault", str(vault), "--backfill"])
    assert preprocess.command == "preprocess"
    assert preprocess.backfill is True

    scan = parser.parse_args(["inbox-scan", "--vault", str(vault), "--inbox", str(inbox)])
    assert scan.command == "inbox-scan"
    assert scan.func.__name__ == "command_inbox_scan"

    legacy = parser.parse_args(["ui", "--vault", str(vault), "--no-open"])
    assert legacy.command == "ui"
    assert legacy.port == 8765
    assert legacy.func.__name__ == "command_ui"


def test_worker_once_is_idle_without_media_access(
    tmp_path: Path,
    capsys,
) -> None:
    source = tmp_path / "synthetic-source"
    source.mkdir()
    (source / "source.bin").write_bytes(b"immutable source")
    inbox = tmp_path / "inbox"
    inbox.mkdir()
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    canonical = layout.objects / "sha256" / "aa" / "canonical.blob"
    canonical.parent.mkdir(parents=True)
    canonical.write_bytes(b"immutable canonical")
    db = ManifestDB(layout.database)
    db.close()
    source_before = _snapshot(source)
    objects_before = _snapshot(layout.objects)

    assert main(
        [
            "worker",
            "--vault",
            str(layout.root),
            "--inbox",
            str(inbox),
            "--once",
        ]
    ) == 0
    result = json.loads(capsys.readouterr().out)
    assert result == asdict(WorkerSummary(0, 0, 0, True, None))
    assert _snapshot(source) == source_before
    assert _snapshot(layout.objects) == objects_before


def test_command_adapters_pass_typed_configuration_without_running_servers(
    tmp_path: Path,
    monkeypatch,
    capsys,
) -> None:
    vault = tmp_path / "vault"
    inbox = tmp_path / "inbox"
    inbox.mkdir()
    calls: dict[str, object] = {}

    def fake_serve(config, **kwargs):
        calls["review"] = (config, kwargs)

    def fake_scan(config, **kwargs):
        calls["scan"] = (config, kwargs)
        return {"batches": [], "preview_jobs": {}, "media_publication": "none"}

    def fake_preprocess(config, **kwargs):
        calls["preprocess"] = (config, kwargs)
        return {"backfill": False, "enqueued_job_ids": [], "worker": asdict(WorkerSummary(0, 0, 0, True, None))}

    monkeypatch.setattr("media_vault.review_api.serve_review_app", fake_serve)
    monkeypatch.setattr("media_vault.review_runtime.scan_inbox", fake_scan)
    monkeypatch.setattr("media_vault.review_runtime.preprocess_vault", fake_preprocess)

    assert main(["review-ui", "--vault", str(vault), "--inbox", str(inbox), "--no-open", "--no-worker"]) == 0
    assert main(["inbox-scan", "--vault", str(vault), "--inbox", str(inbox)]) == 0
    capsys.readouterr()
    assert main(["preprocess", "--vault", str(vault), "--inbox", str(inbox)]) == 0
    capsys.readouterr()

    review_config, review_kwargs = calls["review"]
    assert review_config.review_port == 8766
    assert review_config.inbox_root == inbox.absolute()
    assert review_kwargs["open_browser"] is False
    assert review_kwargs["run_worker"] is False
    assert calls["scan"][0].vault_root == vault.absolute()
    assert calls["preprocess"][0].derivative_root == (vault / "derivatives").absolute()


def test_backfill_preprocess_command_resumes_persisted_pause(tmp_path: Path, monkeypatch) -> None:
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    config = ReviewConfig(vault_root=layout.root, inbox_root=tmp_path / "inbox")
    db = ManifestDB(layout.database)
    state = ensure_vault_backfill(db, config)
    paused = control_vault_backfill(db, "pause")
    db.commit()
    db.close()
    assert paused["status"] == "paused"

    monkeypatch.setattr(
        "media_vault.review_runtime.run_worker_loop",
        lambda *_args, **_kwargs: WorkerSummary(0, 0, 0, True, None),
    )
    result = preprocess_vault(config, backfill=True)
    assert result["backfill_job_id"] == state["id"]

    db = ManifestDB(layout.database)
    resumed = current_backfill(db)
    db.close()
    assert resumed["status"] == "queued"
    assert resumed["control_state"] == "run"


def test_one_click_live_launcher_uses_one_worker_and_existing_resume_surface() -> None:
    launcher = Path(__file__).parents[1] / "Resume Live Vault Backfill.cmd"
    text = launcher.read_text(encoding="utf-8")
    assert 'review-ui --vault "G:\\MediaVault"' in text
    assert "--no-worker" in text
    assert 'preprocess --vault "G:\\MediaVault"' in text
    assert "--backfill" in text
    assert " migrate " not in text.lower()
