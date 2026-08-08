"""The PreToolUse guard that keeps two writers out of one checkout.

The hook itself lives in `.claude/hooks/` rather than the package, because it is
agent infrastructure and not part of the website. That puts it outside the import
path, so it is loaded by file here.
"""

from __future__ import annotations

import importlib.util
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


def test_an_unclaimed_checkout_is_claimed_by_the_first_writer() -> None:
    allowed, updated = guard.arbitrate({}, "session-a", 1000.0)
    assert allowed
    assert updated["session_id"] == "session-a"


def test_the_holder_keeps_writing_and_refreshes_its_claim() -> None:
    registry = {"session_id": "session-a", "claimed_at": 1000.0, "last_write_at": 1000.0}
    allowed, updated = guard.arbitrate(registry, "session-a", 1500.0)
    assert allowed
    assert updated["last_write_at"] == 1500.0
    assert updated["claimed_at"] == 1000.0


def test_a_second_writer_is_denied_while_the_claim_is_fresh() -> None:
    registry = {"session_id": "session-a", "claimed_at": 1000.0, "last_write_at": 1000.0}
    allowed, updated = guard.arbitrate(registry, "session-b", 1000.0 + guard.CLAIM_TTL_SECONDS - 1)
    assert not allowed
    assert updated["session_id"] == "session-a"


def test_a_stale_claim_is_taken_over() -> None:
    """A session that stopped writing an hour ago has finished or died."""
    registry = {"session_id": "session-a", "claimed_at": 1000.0, "last_write_at": 1000.0}
    allowed, updated = guard.arbitrate(registry, "session-b", 1000.0 + guard.CLAIM_TTL_SECONDS + 1)
    assert allowed
    assert updated["session_id"] == "session-b"


def test_an_unreadable_registry_is_treated_as_unclaimed() -> None:
    allowed, updated = guard.arbitrate({"junk": True}, "session-a", 1000.0)
    assert allowed
    assert updated["session_id"] == "session-a"
