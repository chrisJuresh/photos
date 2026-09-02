"""The PreToolUse guard that keeps every change in its own worktree.

The hook itself lives in `.claude/hooks/` rather than the package, because it is
agent infrastructure and not part of the website. That puts it outside the import
path, so it is loaded by file here.

Its predecessor asked *who else is in this tree* and denied only what a second
writer would break. This one asks nothing: the main checkout is never written to,
so the tests below are about the boundary rather than about arbitration.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
HOOK = ROOT / ".claude" / "hooks" / "worktree-guard.py"

_spec = importlib.util.spec_from_file_location("worktree_guard", HOOK)
guard = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(guard)


# ------------------------------------------------------------------------ fixtures


@pytest.fixture
def repo(tmp_path: Path) -> Path:
    """A main checkout with `.git` as a directory, and `development` configured."""
    git_dir = tmp_path / "repo" / ".git"
    git_dir.mkdir(parents=True)
    (git_dir / "HEAD").write_text("ref: refs/heads/development\n", encoding="utf-8")
    claude = tmp_path / "repo" / ".claude"
    claude.mkdir()
    (claude / "worktree-per-change.json").write_text(
        json.dumps({"integrationBranch": "development"}), encoding="utf-8"
    )
    return tmp_path / "repo"


def worktree(repo: Path, name: str, branch: str) -> Path:
    """A linked worktree, with `.git` as a *file* — which is the whole test."""
    tree = repo / ".claude" / "worktrees" / name
    tree.mkdir(parents=True)
    git_dir = repo / ".git" / "worktrees" / name
    git_dir.mkdir(parents=True)
    (git_dir / "HEAD").write_text(f"ref: refs/heads/{branch}\n", encoding="utf-8")
    (git_dir / "commondir").write_text("../..\n", encoding="utf-8")
    (tree / ".git").write_text(f"gitdir: {git_dir}\n", encoding="utf-8")
    return tree


def decide(cwd: Path, tool: str, tool_input: dict) -> str:
    result = subprocess.run(
        [sys.executable, "-S", str(HOOK)],
        input=json.dumps(
            {
                "session_id": "t",
                "hook_event_name": "PreToolUse",
                "cwd": str(cwd),
                "tool_name": tool,
                "tool_input": tool_input,
            }
        ),
        capture_output=True,
        text=True,
    )
    if not result.stdout.strip():
        return "allow"
    body = json.loads(result.stdout)
    return (body.get("hookSpecificOutput") or {}).get("permissionDecision", "allow")


# --------------------------------------------------------------------------- unit


def test_a_main_checkout_is_told_apart_by_git_being_a_directory(repo: Path) -> None:
    _tree, _git_dir, linked = guard.find_tree(repo)
    assert linked is False


def test_a_worktree_is_told_apart_by_git_being_a_file(repo: Path) -> None:
    tree = worktree(repo, "topic", "a-topic")
    _tree, _git_dir, linked = guard.find_tree(tree)
    assert linked is True


def test_the_shared_git_dir_is_found_through_commondir(repo: Path) -> None:
    tree = worktree(repo, "topic", "a-topic")
    _tree, git_dir, _linked = guard.find_tree(tree)
    assert guard.common_git_dir(git_dir) == repo / ".git"


def test_the_integration_branch_comes_from_the_committed_config(repo: Path) -> None:
    assert guard.integration_branch(repo) == "development"


@pytest.mark.parametrize(
    "key,path",
    [
        ("guard", Path(".claude") / "hooks" / "worktree-guard.py"),
        ("owner", Path(".claude") / "hooks" / "worktree-owner.py"),
        ("land", Path(".claude") / "scripts" / "land.py"),
    ],
)
def test_a_committed_copy_is_still_the_file_its_record_describes(key: str, path: Path) -> None:
    """A copied hook is a fork the moment upstream moves, and a stale one looks fine.

    `.claude/worktree-per-change.json` names the upstream commit each copy came from and
    hashes the file itself. Only the offline half of that is checkable here — is the
    committed file still what the record says — and it is the half that catches a hook
    edited in place and a resync that forgot to write itself down. Whether upstream has
    moved on since needs a clone, and this suite has no business fetching one.

    It covers all three vendored files rather than the guard alone. The guard is the one
    that denies, so it was the one gated first, but an ungated copy is ungated whatever
    it does: `worktree-owner.py` denies too, and `land.py` pushes and merges. A record
    written for a file nothing checks is the same as no record.

    The digest is over LF-normalised bytes, which is what git stores: the record crosses
    machines and the line endings on disk do not.
    """
    record = json.loads((ROOT / ".claude" / "worktree-per-change.json").read_text(encoding="utf-8"))
    normalised = (ROOT / path).read_bytes().replace(b"\r\n", b"\n")
    assert hashlib.sha256(normalised).hexdigest() == record[key]["sha256"]


@pytest.mark.parametrize(
    "command,expected",
    [
        ("git commit -m 'x'", [("commit", ["-m", "x"], None)]),
        ("echo hi && git stash push", [("stash", ["push"], None)]),
        ("gh pr merge --squash", []),
        ("git status", [("status", [], None)]),
    ],
)
def test_git_calls_are_read_out_of_a_shell_command(command: str, expected: list) -> None:
    assert guard.git_calls(command) == expected


@pytest.mark.parametrize(
    "command,where",
    [
        ("git -C /somewhere switch main", "/somewhere"),
        ("cd ../other-repo && git add -A", "../other-repo"),
        ('git -C "$W" commit -m x', None),
    ],
)
def test_a_git_call_is_read_for_the_tree_it_names(command: str, where: str | None) -> None:
    """`-C` and a leading `cd` say which tree a call lands in; a variable says nothing.

    The rules are judged against that tree, which is what lets a call reaching into
    another repository pass and one reaching back into this main checkout be denied.
    An unreadable path reads as None — the session's own tree — because the guard
    never runs a shell to find out what `$W` was.
    """
    (_subcommand, _args, named), = guard.git_calls(command)
    assert named == where


# ---------------------------------------------------------------------- decisions


@pytest.mark.parametrize("path", ["photolib/grid.py", "README.md", "ui/src/app.ts"])
def test_the_main_checkout_refuses_every_file_write(repo: Path, path: str) -> None:
    assert decide(repo, "Write", {"file_path": str(repo / path)}) == "deny"


@pytest.mark.parametrize(
    "command",
    ["git commit -m 'x'", "git add photolib/grid.py", "git switch 4-substrate-route", "git reset --hard HEAD~1"],
)
def test_the_main_checkout_refuses_git_calls_that_write(repo: Path, command: str) -> None:
    assert decide(repo, "Bash", {"command": command}) == "deny"


@pytest.mark.parametrize(
    "command",
    ["git status", "git log --oneline", "git fetch origin", "gh pr list",
     "git worktree add .claude/worktrees/x -b x origin/development"],
)
def test_the_main_checkout_still_reads_and_still_makes_worktrees(repo: Path, command: str) -> None:
    assert decide(repo, "Bash", {"command": command}) == "allow"


def test_a_worktree_on_its_own_branch_is_where_work_happens(repo: Path) -> None:
    tree = worktree(repo, "topic", "a-topic")
    assert decide(tree, "Write", {"file_path": str(tree / "photolib/grid.py")}) == "allow"
    assert decide(tree, "Bash", {"command": "git commit -m 'x'"}) == "allow"


def test_a_worktree_sitting_on_development_refuses_writes(repo: Path) -> None:
    tree = worktree(repo, "onbase", "development")
    assert decide(tree, "Write", {"file_path": str(tree / "photolib/grid.py")}) == "deny"


def test_a_merged_worktree_is_spent(repo: Path) -> None:
    tree = worktree(repo, "topic", "a-topic")
    assert decide(tree, "Write", {"file_path": str(tree / "a.py")}) == "allow"
    assert decide(tree, "Bash", {"command": "gh pr merge --squash"}) == "allow"
    assert decide(tree, "Write", {"file_path": str(tree / "a.py")}) == "deny"


def test_the_spent_marker_lives_in_the_shared_git_dir_not_the_working_tree(repo: Path) -> None:
    tree = worktree(repo, "topic", "a-topic")
    decide(tree, "Bash", {"command": "gh pr merge"})
    assert (repo / ".git" / "claude-worktree-gate" / "spent" / "topic.json").is_file()
    assert not (tree / ".claude").exists()


@pytest.mark.parametrize("command", ["git stash", "git stash push -m wip"])
def test_a_stash_push_is_refused_from_a_worktree_too(repo: Path, command: str) -> None:
    tree = worktree(repo, "topic", "a-topic")
    assert decide(tree, "Bash", {"command": command}) == "deny"


@pytest.mark.parametrize("command", ["git stash list", "git stash show"])
def test_reading_the_stash_stack_is_not_a_push(repo: Path, command: str) -> None:
    tree = worktree(repo, "topic", "a-topic")
    assert decide(tree, "Bash", {"command": command}) == "allow"


def test_read_only_tools_are_never_guarded(repo: Path) -> None:
    assert decide(repo, "Read", {"file_path": str(repo / "photolib/grid.py")}) == "allow"
    assert decide(repo, "Grep", {"pattern": "x"}) == "allow"


def test_a_write_outside_the_repository_is_not_the_repositorys_business(repo: Path, tmp_path: Path) -> None:
    assert decide(repo, "Write", {"file_path": str(tmp_path / "scratch.txt")}) == "allow"


def test_it_fails_open_outside_a_git_repository(tmp_path: Path) -> None:
    assert decide(tmp_path, "Write", {"file_path": str(tmp_path / "a.txt")}) == "allow"
