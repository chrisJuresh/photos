"""The PreToolUse guard that keeps two writers out of one checkout.

The hook itself lives in `.claude/hooks/` rather than the package, because it is
agent infrastructure and not part of the website. That puts it outside the import
path, so it is loaded by file here.
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
HOOK = ROOT / ".claude" / "hooks" / "concurrent_writer_guard.py"

_spec = importlib.util.spec_from_file_location("concurrent_writer_guard", HOOK)
guard = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(guard)


@pytest.mark.parametrize(
    "command",
    [
        "git commit -m 'x'",
        "git add photolib/grid.py",
        "git switch 4-substrate-route",
        "git reset --hard HEAD~1",
        "git stash",
        "git rebase origin/main",
        "git branch -D 6-stack-cover",
        "python -m pytest tests -q && git commit -m x",
    ],
)
def test_mutating_git_commands_are_targets(command: str) -> None:
    assert guard.git_targets(command) == [None]


@pytest.mark.parametrize(
    "command",
    [
        "git status --short",
        "git log --oneline",
        "git worktree add ../photos-6 -b 6-stack-cover main",
        "git branch -vv",
        "git diff --stat",
        "git stash list",
        "git stash show -p",
        "python -m pytest tests -q",
        "npm run build",
    ],
)
def test_reads_and_worktree_creation_are_not_targets(command: str) -> None:
    assert guard.git_targets(command) == []


def test_dash_c_names_the_target_directory() -> None:
    assert guard.git_targets("git -C /abs/photos-6 commit -m x") == ["/abs/photos-6"]


def test_unexpanded_variable_falls_back_to_the_session_directory() -> None:
    """A textual parse cannot evaluate `$W`, so the call is judged where it runs."""
    assert guard.git_targets('git -C "$W" commit -m x') == ["$W"]
    assert guard.git_targets("cd ../photos-6; git commit -m x") == [None]


def test_each_segment_of_a_chain_is_read(tmp_path: Path) -> None:
    assert guard.git_targets("git add . && git -C /other commit -m x") == [None, "/other"]


@pytest.mark.parametrize(
    "command",
    ["git stash", "git stash push -m wip", "git stash save", "npm run build && git stash"],
)
def test_a_stash_push_is_recognised_wherever_it_runs(command: str) -> None:
    """`refs/stash` is one stack, so the tree the push runs in does not matter."""
    assert guard.stash_pushes(command)


@pytest.mark.parametrize("command", ["git stash list", "git stash show", "git commit -m x"])
def test_reading_the_stash_stack_is_not_a_push(command: str) -> None:
    assert not guard.stash_pushes(command)


def test_paths_inside_the_main_checkout_are_guarded(tmp_path: Path) -> None:
    main = tmp_path / "photos"
    assert guard.in_main_checkout(main / "photolib" / "grid.py", main)
    assert guard.in_main_checkout(main, main)


def test_worktrees_and_outside_paths_are_not_guarded(tmp_path: Path) -> None:
    main = tmp_path / "photos"
    assert not guard.in_main_checkout(main / ".claude" / "worktrees" / "6" / "grid.py", main)
    assert not guard.in_main_checkout(tmp_path / "photos-6" / "grid.py", main)


def test_file_tools_are_judged_by_file_path(tmp_path: Path) -> None:
    paths = guard.guarded_paths("Edit", {"file_path": str(tmp_path / "a.py")}, tmp_path)
    assert paths == [tmp_path / "a.py"]


def test_shell_tools_without_a_git_mutation_write_nothing_we_can_see(tmp_path: Path) -> None:
    assert guard.guarded_paths("Bash", {"command": "git status"}, tmp_path) == []


def test_read_only_tools_are_never_guarded(tmp_path: Path) -> None:
    assert guard.guarded_paths("Read", {"file_path": str(tmp_path / "a.py")}, tmp_path) == []
    assert guard.guarded_paths("Grep", {"pattern": "x"}, tmp_path) == []


def claim(registry: Path, session: str, tree: Path, **fields: object) -> None:
    registry.mkdir(parents=True, exist_ok=True)
    body = {"session_id": session, "tree": str(tree), "last_write_at": 1000.0, "claimed_at": 1000.0}
    (registry / f"{session}.json").write_text(json.dumps({**body, **fields}), encoding="utf-8")


def test_a_reading_session_stays_live_on_its_transcript(tmp_path: Path) -> None:
    """Twenty-five minutes of reading is not a dead session, and the transcript says so."""
    transcript = tmp_path / "transcript.jsonl"
    transcript.write_text("{}", encoding="utf-8")
    stale_write = transcript.stat().st_mtime - (guard.LIVE_TTL_SECONDS * 2)
    seen = guard.live_at(
        {"last_write_at": stale_write, "transcript_path": str(transcript)},
    )
    assert seen == pytest.approx(transcript.stat().st_mtime)


def test_a_missing_transcript_leaves_the_last_write_standing(tmp_path: Path) -> None:
    assert guard.live_at({"last_write_at": 1000.0, "transcript_path": str(tmp_path / "gone")}) == 1000.0


def test_a_claim_older_than_the_window_is_not_live(tmp_path: Path) -> None:
    registry = tmp_path / "claude-writers"
    claim(registry, "session-a", tmp_path / "photos")
    assert guard.live_claims(registry, 1000.0 + guard.LIVE_TTL_SECONDS + 1) == []


def test_the_oldest_live_claim_on_a_tree_holds_it(tmp_path: Path) -> None:
    registry = tmp_path / "claude-writers"
    main = tmp_path / "photos"
    claim(registry, "session-b", main, claimed_at=1500.0)
    claim(registry, "session-a", main, claimed_at=1000.0)
    claims = guard.live_claims(registry, 1600.0)
    assert guard.holds(claims, main)["session_id"] == "session-a"


def test_a_session_in_a_worktree_does_not_hold_the_main_checkout(tmp_path: Path) -> None:
    registry = tmp_path / "claude-writers"
    main = tmp_path / "photos"
    claim(registry, "session-a", tmp_path / "photos-6")
    claims = guard.live_claims(registry, 1000.0)
    assert claims  # it is live, and a `git stash` from it is still denied repo-wide
    assert guard.holds(claims, main) is None


def test_an_unreadable_claim_is_skipped_rather_than_believed(tmp_path: Path) -> None:
    registry = tmp_path / "claude-writers"
    claim(registry, "session-a", tmp_path / "photos")
    (registry / "session-b.json").write_text("{ not json", encoding="utf-8")
    assert [c["session_id"] for c in guard.live_claims(registry, 1000.0)] == ["session-a"]


def test_a_first_write_claims_the_tree(tmp_path: Path) -> None:
    registry = tmp_path / "claude-writers"
    guard.record(registry, {"session_id": "a", "tree": "t", "last_write_at": 1000.0}, 1000.0)
    written = json.loads((registry / "a.json").read_text(encoding="utf-8"))
    assert written["claimed_at"] == 1000.0


def test_writing_again_refreshes_without_resetting_seniority(tmp_path: Path) -> None:
    registry = tmp_path / "claude-writers"
    guard.record(registry, {"session_id": "a", "tree": "t", "last_write_at": 1000.0}, 1000.0)
    guard.record(registry, {"session_id": "a", "tree": "t", "last_write_at": 1200.0}, 1200.0)
    written = json.loads((registry / "a.json").read_text(encoding="utf-8"))
    assert written == {"session_id": "a", "tree": "t", "last_write_at": 1200.0, "claimed_at": 1000.0}


def test_a_session_returning_from_a_long_idle_restarts_its_clock(tmp_path: Path) -> None:
    """It cannot displace whoever took the tree while it was away."""
    registry = tmp_path / "claude-writers"
    guard.record(registry, {"session_id": "a", "tree": "t", "last_write_at": 1000.0}, 1000.0)
    later = 1000.0 + guard.LIVE_TTL_SECONDS + 1
    guard.record(registry, {"session_id": "a", "tree": "t", "last_write_at": later}, later)
    written = json.loads((registry / "a.json").read_text(encoding="utf-8"))
    assert written["claimed_at"] == later
