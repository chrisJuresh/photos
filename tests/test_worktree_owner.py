"""The second hook: one worktree, one session.

`worktree-guard.py` isolates *changes* and says nothing about *sessions*. Two agents in
one worktree pass every check it makes — the tree is linked, it is not on the integration
branch, its PR has not merged — and what they collide over is build output, a port, and
each other's uncommitted edits, none of which raises an error.

So this file is about a different question from `test_worktree_guard.py`'s: not *may work
happen in this tree* but *is this tree yours*. The two hooks own separate state and
compose, which is why they are separate files here as they are upstream.

The hook is loaded by path, like the guard, because `.claude/hooks/` is agent
infrastructure rather than part of the website and sits outside the import path.
"""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import time
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
HOOK = ROOT / ".claude" / "hooks" / "worktree-owner.py"

_spec = importlib.util.spec_from_file_location("worktree_owner", HOOK)
owner = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(owner)

MINE = "session-mine"
THEIRS = "session-theirs"


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
        json.dumps({"integrationBranch": "development", "sessionOwnership": True}),
        encoding="utf-8",
    )
    return tmp_path / "repo"


def worktree(repo: Path, name: str, branch: str) -> Path:
    """A linked worktree, registered the way git registers one.

    The `gitdir` file in the register is what `report` walks, so it is written here even
    though the denial path does not read it.
    """
    tree = repo / ".claude" / "worktrees" / name
    tree.mkdir(parents=True)
    git_dir = repo / ".git" / "worktrees" / name
    git_dir.mkdir(parents=True)
    (git_dir / "HEAD").write_text(f"ref: refs/heads/{branch}\n", encoding="utf-8")
    (git_dir / "commondir").write_text("../..\n", encoding="utf-8")
    (git_dir / "gitdir").write_text(f"{tree / '.git'}\n", encoding="utf-8")
    (tree / ".git").write_text(f"gitdir: {git_dir}\n", encoding="utf-8")
    return tree


def claimed_by(repo: Path, tree: Path, session: str, *, age: float = 0.0) -> Path:
    """Put a claim on `tree` for `session`, `age` seconds stale.

    Written with no transcript on purpose: liveness then falls back to `last_seen`,
    which is a number this test can set. Pointing it at a real file would make the
    assertion depend on that file's mtime instead.
    """
    path = owner.claim_file(repo / ".git", tree)
    path.parent.mkdir(parents=True, exist_ok=True)
    now = time.time()
    path.write_text(
        json.dumps(
            {
                "tree": str(tree),
                "session": session,
                "transcript": "",
                "claimed_at": now - age,
                "last_seen": now - age,
            }
        ),
        encoding="utf-8",
    )
    return path


def decide(cwd: Path, tool: str, tool_input: dict, session: str = MINE) -> str:
    result = subprocess.run(
        [sys.executable, "-S", str(HOOK)],
        input=json.dumps(
            {
                "session_id": session,
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


def write_to(tree: Path) -> dict:
    return {"file_path": str(tree / "notes.md"), "content": "x"}


# --------------------------------------------------------------------------- claiming


def test_sitting_in_a_worktree_claims_it(repo: Path) -> None:
    tree = worktree(repo, "topic", "a-topic")
    assert decide(tree, "Write", write_to(tree)) == "allow"
    claim = owner.read_claim(owner.claim_file(repo / ".git", tree))
    assert claim is not None and claim["session"] == MINE


def test_a_read_claims_it_too(repo: Path) -> None:
    """Presence is the signal, not writing.

    A session that spends its first twenty minutes reading its own tree has to hold it,
    or the tree is still free for someone else to take and then hold against its owner.
    """
    tree = worktree(repo, "topic", "a-topic")
    assert decide(tree, "Read", {"file_path": str(tree / "notes.md")}) == "allow"
    assert owner.read_claim(owner.claim_file(repo / ".git", tree)) is not None


def test_the_claim_lives_in_the_shared_git_dir_not_the_working_tree(repo: Path) -> None:
    """`.claude/` is checked out separately in every worktree, so state cannot live there."""
    tree = worktree(repo, "topic", "a-topic")
    decide(tree, "Write", write_to(tree))
    assert owner.claim_file(repo / ".git", tree).is_file()
    assert not (tree / ".claude" / "worktrees").exists()


def test_the_owner_keeps_writing_in_its_own_tree(repo: Path) -> None:
    tree = worktree(repo, "topic", "a-topic")
    claimed_by(repo, tree, MINE)
    assert decide(tree, "Write", write_to(tree)) == "allow"


# ------------------------------------------------------------------------- refusing


def test_a_second_session_is_denied_the_tree_someone_holds(repo: Path) -> None:
    tree = worktree(repo, "topic", "a-topic")
    claimed_by(repo, tree, THEIRS)
    assert decide(tree, "Write", write_to(tree)) == "deny"


def test_a_write_carried_into_another_session_tree_is_denied_from_outside_it(repo: Path) -> None:
    """Judged by what the call names, not by where the session sits.

    A file tool carrying an absolute path into another tree is the exact shape of the
    collision this hook exists for, and the session doing it is sitting somewhere else.
    """
    mine = worktree(repo, "mine", "my-topic")
    theirs = worktree(repo, "theirs", "their-topic")
    claimed_by(repo, theirs, THEIRS)
    assert decide(mine, "Write", write_to(theirs)) == "deny"


def test_reading_another_sessions_tree_stays_allowed(repo: Path) -> None:
    """A hook that refused this is a hook someone turns off.

    Comparing two branches on disk is ordinary work; after it is turned off nothing is
    enforced at all, so the read has to keep working.
    """
    mine = worktree(repo, "mine", "my-topic")
    theirs = worktree(repo, "theirs", "their-topic")
    claimed_by(repo, theirs, THEIRS)
    assert decide(mine, "Read", {"file_path": str(theirs / "notes.md")}) == "allow"


def test_a_lapsed_claim_is_there_for_the_taking(repo: Path) -> None:
    """A claim lapses; it does not lock. A killed session must not hold a tree forever."""
    tree = worktree(repo, "topic", "a-topic")
    claimed_by(repo, tree, THEIRS, age=owner.DEFAULT_TTL + 60)
    assert decide(tree, "Write", write_to(tree)) == "allow"
    claim = owner.read_claim(owner.claim_file(repo / ".git", tree))
    assert claim is not None and claim["session"] == MINE


def test_the_main_checkout_is_not_this_hooks_business(repo: Path) -> None:
    """Whether anything may be written there is the guard's question, not this one."""
    assert decide(repo, "Write", {"file_path": str(repo / "notes.md"), "content": "x"}) == "allow"


def test_it_fails_open_outside_a_git_repository(tmp_path: Path) -> None:
    loose = tmp_path / "loose"
    loose.mkdir()
    assert decide(loose, "Write", {"file_path": str(loose / "notes.md"), "content": "x"}) == "allow"
