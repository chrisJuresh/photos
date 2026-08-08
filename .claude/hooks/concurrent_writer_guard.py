"""Deny a write to the main checkout while another session is holding it.

`docs/agents/issue-tracker.md` says a second concurrent writer takes a worktree.
That rule was written on 2026-08-08 and broken the same evening, which is the
whole argument for this file: the sessions that collided had the rule available
and did not read it. A `PreToolUse` hook is read every time.

What it guards is narrow on purpose. Two writers in one checkout go wrong in
exactly two places — the index, where one session's commit sweeps up another's
half-finished files, and `HEAD`, where one session's checkout rewrites the files
another is mid-edit on. So the guard covers file edits landing in the main
checkout and the git subcommands that move the index or `HEAD`. It does not try
to catch a shell redirect into a file; that is a real hole, and a parser that
guessed at shell semantics would be a worse one.

The claim registry lives in the shared git directory rather than under
`.claude/`, because every worktree checks out its own `.claude/` and the whole
point is one registry across all of them.

It fails **open**. A missing repo, a payload that will not parse, a registry
written by a newer version — all of them allow the write. Blocking the only
writer in the tree over state the guard merely failed to read is the worse
error, and it is the error that makes someone delete the hook.

`PHOTOS_ALLOW_SHARED_CHECKOUT=1` turns it off.
"""

from __future__ import annotations

import json
import os
import re
import shlex
import subprocess
import sys
import time
from pathlib import Path

# A claim goes stale when its session stops writing. An hour is longer than the
# gap between two writes of a session that is actually working, and short enough
# that a finished session frees the tree without anyone tidying up. Expiry lets
# a *new* writer in, so erring long is the safe direction.
CLAIM_TTL_SECONDS = 60 * 60

# Tools whose writes land at a path we can read directly.
FILE_TOOLS = {"Edit", "Write", "NotebookEdit"}
SHELL_TOOLS = {"Bash", "PowerShell"}

# git subcommands that move the index, the working tree, or HEAD. `push` and
# `fetch` are absent: they touch the remote, not the tree two sessions share.
# `worktree` is absent because taking one is the remedy this guard recommends.
GIT_MUTATIONS = {
    "add",
    "am",
    "apply",
    "checkout",
    "cherry-pick",
    "clean",
    "commit",
    "merge",
    "mv",
    "rebase",
    "reset",
    "restore",
    "revert",
    "rm",
    "stash",
    "switch",
}

# `git branch` is only a mutation with one of these; a bare `git branch` lists.
BRANCH_MUTATIONS = {"-d", "-D", "-m", "-M", "-f", "--delete", "--move", "--force"}

_SEGMENT = re.compile(r"&&|\|\||[;\n|]")


def main_checkout(cwd: Path) -> Path | None:
    """The one checkout every worktree of this repo shares, or None."""
    result = subprocess.run(
        ["git", "rev-parse", "--path-format=absolute", "--git-common-dir"],
        cwd=cwd,
        capture_output=True,
        text=True,
        timeout=10,
    )
    if result.returncode != 0:
        return None
    common = Path(result.stdout.strip())
    # <root>/.git for a normal clone. A bare repo has no checkout to guard.
    if common.name != ".git":
        return None
    return common.parent


def in_main_checkout(path: Path, main: Path) -> bool:
    """True when `path` is in the main checkout and not in a worktree under it.

    Claude Code puts worktrees in `.claude/worktrees/` by default, which is
    *inside* the main checkout. Those paths are the remedy, not the offence.
    """
    try:
        resolved = path if path.is_absolute() else (main / path)
        resolved = Path(os.path.normpath(str(resolved)))
        if not resolved.is_relative_to(main):
            return False
        return not resolved.is_relative_to(main / ".claude" / "worktrees")
    except (OSError, ValueError):
        return False


def git_targets(command: str) -> list[str | None]:
    """Paths a command's mutating git calls act on. None means "wherever it runs".

    The `-C` read is textual and never expands a variable, so `git -C "$W" commit`
    reports None and is judged against the session's directory. That is the guard
    being conservative rather than clever: the cost is spelling a path out in
    full, and the alternative is trusting a shell expansion we cannot evaluate.
    """
    targets: list[str | None] = []
    for segment in _SEGMENT.split(command):
        try:
            tokens = shlex.split(segment)
        except ValueError:
            tokens = segment.split()
        if not tokens:
            continue
        try:
            start = next(i for i, t in enumerate(tokens) if Path(t).name in {"git", "git.exe"})
        except StopIteration:
            continue

        rest = tokens[start + 1 :]
        directory: str | None = None
        subcommand = None
        index = 0
        while index < len(rest):
            token = rest[index]
            if token == "-C" and index + 1 < len(rest):
                directory = rest[index + 1]
                index += 2
                continue
            if token.startswith("-"):
                index += 1
                continue
            subcommand = token
            break

        if subcommand is None:
            continue
        if subcommand == "branch":
            if not any(flag in rest for flag in BRANCH_MUTATIONS):
                continue
        elif subcommand not in GIT_MUTATIONS:
            continue
        targets.append(directory)
    return targets


def guarded_paths(tool_name: str, tool_input: dict, cwd: Path) -> list[Path]:
    """Every path this tool call would write to, as far as the guard can tell."""
    if tool_name in FILE_TOOLS:
        target = tool_input.get("file_path")
        return [Path(target)] if isinstance(target, str) and target else []
    if tool_name in SHELL_TOOLS:
        command = tool_input.get("command")
        if not isinstance(command, str):
            return []
        return [cwd if t is None else Path(t) for t in git_targets(command)]
    return []


def arbitrate(registry: dict, session_id: str, now: float) -> tuple[bool, dict]:
    """Claim the checkout, keep it, or report that someone else holds it."""
    holder = registry.get("session_id")
    last = registry.get("last_write_at")
    fresh = isinstance(last, (int, float)) and (now - last) < CLAIM_TTL_SECONDS

    if holder and holder != session_id and fresh:
        return False, registry
    if holder == session_id:
        return True, {**registry, "last_write_at": now}
    return True, {"session_id": session_id, "claimed_at": now, "last_write_at": now}


def deny(reason: str) -> None:
    json.dump(
        {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": reason,
            }
        },
        sys.stdout,
    )


REASON = """\
Another session is already writing in the main checkout, so this write is \
denied rather than allowed to share an index with it. Take a worktree \
(docs/agents/issue-tracker.md, "Pick your tree"):

    git worktree add .claude/worktrees/<n> -b <n>-<short-slug> <base>

then enter it with EnterWorktree — not cd, which leaves this guard and every \
other session's check reading your old directory. Run git from inside it, or \
with the path spelled out literally: git -C <absolute-path>.

If this is wrong — the other session is gone and its claim has not expired — \
set PHOTOS_ALLOW_SHARED_CHECKOUT=1."""


def main() -> None:
    if os.environ.get("PHOTOS_ALLOW_SHARED_CHECKOUT") == "1":
        return

    payload = json.load(sys.stdin)
    session_id = payload.get("session_id")
    cwd = payload.get("cwd")
    if not session_id or not cwd:
        return

    main_path = main_checkout(Path(cwd))
    if main_path is None:
        return

    paths = guarded_paths(payload.get("tool_name", ""), payload.get("tool_input") or {}, Path(cwd))
    if not any(in_main_checkout(p, main_path) for p in paths):
        return

    registry_file = main_path / ".git" / "concurrent-writers.json"
    try:
        registry = json.loads(registry_file.read_text(encoding="utf-8"))
        if not isinstance(registry, dict):
            registry = {}
    except (OSError, ValueError):
        registry = {}

    allowed, updated = arbitrate(registry, session_id, time.time())
    if not allowed:
        deny(REASON)
        return

    try:
        registry_file.write_text(json.dumps(updated), encoding="utf-8")
    except OSError:
        pass


if __name__ == "__main__":
    try:
        main()
    except Exception:  # noqa: BLE001 — fail open, always.
        pass
    sys.exit(0)
