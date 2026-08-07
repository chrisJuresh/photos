"""Step 16: the checks that would catch a promotion that recorded a lie.

Every test here first runs the real step 14 end to end over the six-object corpus
and then breaks exactly one thing, because the only interesting question about
this pass is whether it notices. A verifier that passes a corrupted vault is worse
than no verifier, so "it agrees with the ledger" is never the assertion -- the
bytes, the `nlink`, the attribute and the log are.

The fixtures come from `test_promote`: one synthetic MediaVault and one rule set,
defined once so the two files cannot disagree about what a promoted vault looks
like.
"""

from __future__ import annotations

import io
import json
import os
import stat
from pathlib import Path

import pytest
from test_promote import (  # noqa: F401 -- config and corpus are fixtures
    CORPUS,
    EXCLUDED,
    KEPT,
    config,
    content_of,
    corpus,
    digest_of,
    log_lines,
    object_relpath,
)

from archive.pipeline import promote, promote_verify
from photolib import db
from photolib.config import Config


@pytest.fixture
def promoted(corpus, config: Config):
    """The whole of step 14, run for real. Returns the published (sha, path) pairs."""
    corpus.close()
    phrase = f"PROMOTE {KEPT} UNLINK {EXCLUDED}\n"
    assert promote.run(config, execute_writes=True, stdin=io.StringIO(phrase)) == 0
    conn = db.connect(config.catalog_db, config.state_db)
    try:
        rows = [
            (sha256, config.vault_root / relpath)
            for sha256, relpath in conn.execute(
                "SELECT sha256, vault_relpath FROM file WHERE state = 'published'"
            )
        ]
    finally:
        conn.close()
    assert len(rows) == KEPT
    return rows


def writable(path: Path) -> Path:
    """Drop the seal step 14 set, so a test can corrupt what it needs to corrupt."""
    os.chmod(path, stat.S_IWRITE)
    return path


def rewrite_log(config: Config, lines: list[dict]) -> None:
    path = config.catalog_db.parent / promote.UNLINK_LOG_NAME
    path.write_text(
        "".join(json.dumps(line) + "\n" for line in lines), encoding="utf-8", newline="\n"
    )


def test_a_clean_promotion_verifies(promoted, config: Config, capsys):
    assert promote_verify.report(config) == 0
    printed = capsys.readouterr().out
    assert "PROMOTION VERIFIED" in printed
    assert f"verified      {KEPT:,} of {KEPT:,}" in printed
    # The orphaned tiles and substrates are reported, and are not a failure.
    assert "deliberate, not a failure" in printed


def test_wrong_bytes_under_the_right_name_are_caught(promoted, config: Config, capsys):
    """The exact survivor the batch-shaped promotion produced: right name, wrong bytes."""
    _, target = promoted[0]
    writable(target).write_bytes(b"the wrong bytes, at the right name")

    assert promote_verify.report(config) == 1
    printed = capsys.readouterr().out
    assert "MISMATCHED    1" in printed
    assert "NOT verified" in printed


def test_a_vanished_survivor_is_not_reported_as_work_still_to_do(
    promoted, config: Config, capsys
):
    """Missing and not-yet-promoted are different answers, and one is a destroyed file."""
    _, target = promoted[0]
    os.chmod(target, stat.S_IWRITE)
    os.remove(target)

    assert promote_verify.report(config) == 1
    printed = capsys.readouterr().out
    assert "MISSING       1" in printed
    assert "MISMATCHED    0" in printed
    assert f"verified      {KEPT - 1:,}" in printed


def test_a_half_promotion_is_listed_and_not_fixed(promoted, config: Config, capsys):
    """nlink 2 means the MediaVault name is still there. Step 16 never repairs it."""
    sha256, target = promoted[0]
    second = config.mediavault_root / object_relpath(sha256, target.stat().st_size)
    os.chmod(target, stat.S_IWRITE)
    os.link(target, second)

    assert promote_verify.report(config) == 1
    printed = capsys.readouterr().out
    assert "nlink != 1    1" in printed
    assert "for a promoted digest  1" in printed
    assert second.exists()  # still there afterwards: this pass writes nothing


def test_an_unsealed_survivor_is_reported(promoted, config: Config, capsys):
    _, target = promoted[0]
    os.chmod(target, stat.S_IWRITE)
    assert promote_verify.report(config) == 1
    assert "not read-only 1" in capsys.readouterr().out


def test_a_blocked_unlink_left_behind_is_reported_as_one(promoted, config: Config, capsys):
    """An excluded object still on disk is a different problem from a half-promotion."""
    sha256 = next(
        digest_of(seed, times) for _, _, seed, times in CORPUS if seed.startswith("drop")
    )
    payload = next(
        content_of(seed, times) for _, _, seed, times in CORPUS if digest_of(seed, times) == sha256
    )
    resurrected = config.mediavault_root / object_relpath(sha256, len(payload))
    resurrected.parent.mkdir(parents=True, exist_ok=True)
    resurrected.write_bytes(payload)

    assert promote_verify.report(config) == 1
    printed = capsys.readouterr().out
    assert "for an excluded digest 1" in printed
    assert "for a promoted digest  0" in printed


def test_staging_emptiness_is_asserted_positively(promoted, config: Config, capsys):
    """Zero rows from a query that looked in the wrong place is identical to a pass."""
    stray = config.staging_root / "aa" / "bb" / "leftover.blob"
    stray.parent.mkdir(parents=True, exist_ok=True)
    stray.write_bytes(b"left in staging")

    assert promote_verify.report(config) == 1
    printed = capsys.readouterr().out
    assert "staging       present, 1 files" in printed


def test_a_destruction_nobody_recorded_is_caught(promoted, config: Config, capsys):
    lines = [line for line in log_lines(config) if line["intent"] != promote.UNLINK]
    rewrite_log(config, lines)

    assert promote_verify.report(config) == 1
    printed = capsys.readouterr().out
    assert f"excluded, not logged {EXCLUDED:,}" in printed


def test_a_delete_of_something_never_excluded_is_caught(promoted, config: Config, capsys):
    lines = log_lines(config)
    lines.append(
        {"at": "2026-08-07T00:00:00+00:00", "intent": promote.UNLINK, "sha256": "f" * 64,
         "status": "done", "size": 1, "path": "objects\\x", "decided_by": "rule 9 seq 9 x"}
    )
    rewrite_log(config, lines)

    assert promote_verify.report(config) == 1
    assert "logged, not excluded 1" in capsys.readouterr().out


def test_an_unlink_logged_without_a_reason_is_caught(promoted, config: Config, capsys):
    lines = log_lines(config)
    for line in lines:
        if line["intent"] == promote.UNLINK:
            line["decided_by"] = None
    rewrite_log(config, lines)

    assert promote_verify.report(config) == 1
    assert f"no rule named        {EXCLUDED:,}" in capsys.readouterr().out


def test_a_malformed_log_line_is_not_silently_skipped(promoted, config: Config, capsys):
    path = config.catalog_db.parent / promote.UNLINK_LOG_NAME
    with open(path, "a", encoding="utf-8", newline="\n") as handle:
        handle.write("{this is not json\n")

    assert promote_verify.report(config) == 1
    assert "malformed lines      1" in capsys.readouterr().out


def test_an_unfinished_promotion_blocks_the_gate(corpus, config: Config, capsys):
    """A run stopped part way through is not a pass, however clean the part is."""
    corpus.close()
    assert promote.run(
        config, execute_writes=True, limit=1, stdin=io.StringIO("PROMOTE 1 UNLINK 1\n")
    ) == 0

    assert promote_verify.report(config) == 1
    printed = capsys.readouterr().out
    assert "not yet done" in printed and "not yet promoted" in printed


def test_the_verifier_writes_nothing(promoted, config: Config):
    """Everything except the WAL sidecars a read-only connection still creates.

    Named rather than filtered loosely, the way `test_grid` names them: a
    mode=ro connection to a WAL database materialises `-shm` and an empty `-wal`
    and can write nothing else, which is the point of opening it that way.
    """

    def snapshot() -> dict[str, tuple[int, int]]:
        seen = {}
        for root in (config.vault_root, config.mediavault_root, config.catalog_db.parent):
            for path in sorted(root.rglob("*")):
                if path.is_file() and not path.name.endswith(("-wal", "-shm")):
                    info = path.stat()
                    seen[str(path)] = (info.st_size, info.st_mtime_ns)
        return seen

    before = snapshot()
    assert promote_verify.report(config) == 0
    assert snapshot() == before
