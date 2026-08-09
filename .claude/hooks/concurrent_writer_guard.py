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

Plus one failure that survives a worktree, and is therefore judged repository-wide
rather than per tree: `refs/stash` is a single stack shared by every worktree, so
a `git stash` anywhere in the repository renumbers the entries every other tree's
`pop` and `drop` are counting from. The docs have asserted that hazard since the
rule was written; this holds it.

The claim registry lives in the shared git directory rather than under
`.claude/`, because every worktree checks out its own `.claude/` and the whole
point is one registry across all of them. It is one file per session, so two
sessions writing at the same instant cannot lose each other's update — which
would be an embarrassing way for a concurrency guard to fail.

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

# A session counts as live while either its last write or its transcript file is
# recent. The transcript is the better of the two: it moves on every turn, so a
# session that has spent twenty minutes reading still holds its claim, where a
# last-write-only signal hands the checkout away mid-task. Twenty minutes is
# longer than any gap inside a working session and short enough that a session
# killed rather than closed frees the tree without anyone tidying up. `SessionEnd`
# frees it immediately when the session exits cleanly.
LIVE_TTL_SECONDS = 20 * 60

# One file per session, named by session id, inside the shared git directory.
REGISTRY_DIRNAME = "claude-writers"

# Session ids name a file, so they are checked before being used as one.
SESSION_ID = re.compile(r"[A-Za-z0-9._-]{1,128}")

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

# `git stash` subcommands that only read the stack.
STASH_READS = {"list", "show"}

_SEGMENT = re.compile(r"&&|\|\||[;\n|]")


def trees(cwd: Path) -> tuple[Path, Path] | None:
    """(main checkout, this session's working tree), or None outside a repo."""
    result = subprocess.run(
        ["git", "rev-parse", "--path-format=absolute", "--git-common-dir", "--show-toplevel"],
        cwd=cwd,
        capture_output=True,
        text=True,
        timeout=10,
    )
    if result.returncode != 0:
        return None
    lines = result.stdout.splitlines()
    if len(lines) != 2:
        return None
    common, top = Path(lines[0].strip()), Path(lines[1].strip())
    # <root>/.git for a normal clone. A bare repo has no checkout to guard.
    if common.name != ".git":
        return None
    return common.parent, top


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


def git_calls(command: str) -> list[tuple[str, str | None, list[str]]]:
    """Every git invocation in a command line, as (subcommand, -C path, args).

    The `-C` read is textual and never expands a variable, so `git -C "$W" commit`
    reports the literal `$W` and is judged against the session's directory. That
    is the guard being conservative rather than clever: the cost is spelling a
    path out in full, and the alternative is trusting a shell expansion we cannot
    evaluate.
    """
    calls: list[tuple[str, str | None, list[str]]] = []
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
            calls.append((token, directory, rest[index + 1 :]))
            break
    return calls


def mutating(subcommand: str, args: list[str]) -> bool:
    """True when this git call moves the index, the working tree, or HEAD."""
    if subcommand == "branch":
        return any(flag in args for flag in BRANCH_MUTATIONS)
    if subcommand == "stash":
        return not stash_reads(args)
    return subcommand in GIT_MUTATIONS


def stash_reads(args: list[str]) -> bool:
    return bool(args) and args[0] in STASH_READS


def git_targets(command: str) -> list[str | None]:
    """Paths a command's mutating git calls act on. None means "wherever it runs"."""
    return [d for sub, d, args in git_calls(command) if mutating(sub, args)]


def stash_pushes(command: str) -> bool:
    """True when a command pushes onto `refs/stash`, wherever it runs.

    Judged repository-wide rather than per tree: the stack is one stack, so a
    push from a worktree renumbers a session in another worktree's entries and
    its later `pop` takes the wrong one. This is the one place a worktree looks
    like isolation and is not.
    """
    return any(sub == "stash" and not stash_reads(args) for sub, _, args in git_calls(command))


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


def live_at(claim: dict) -> float:
    """When this session was last known to be alive."""
    seen = claim.get("last_write_at")
    seen = float(seen) if isinstance(seen, (int, float)) else 0.0
    transcript = claim.get("transcript_path")
    if isinstance(transcript, str) and transcript:
        try:
            seen = max(seen, os.path.getmtime(transcript))
        except OSError:
            pass
    return seen


def live_claims(registry: Path, now: float) -> list[dict]:
    """Every session still live anywhere in this repository, oldest claim first.

    Sorted by session id within a timestamp so that two sessions reading the
    registry at once agree on which of them holds the tree.
    """
    claims: list[dict] = []
    try:
        files = sorted(registry.glob("*.json"))
    except OSError:
        return []
    for path in files:
        try:
            claim = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if not isinstance(claim, dict) or not claim.get("session_id"):
            continue
        if now - live_at(claim) > LIVE_TTL_SECONDS:
            continue
        claims.append(claim)
    claims.sort(key=lambda c: (c.get("claimed_at") or 0, str(c.get("session_id"))))
    return claims


def holds(claims: list[dict], tree: Path) -> dict | None:
    """The session that owns `tree`: the oldest live claim writing in it."""
    return next((c for c in claims if c.get("tree") == str(tree)), None)


def record(registry: Path, claim: dict, now: float) -> None:
    """Note that this session is writing here. Best effort; never blocks a write."""
    path = registry / f"{claim['session_id']}.json"
    claimed_at = now
    try:
        previous = json.loads(path.read_text(encoding="utf-8"))
        # A claim that went stale and came back restarts its clock rather than
        # reclaiming seniority, so a session returning from a long idle cannot
        # displace whoever took the tree while it was away.
        if isinstance(previous, dict) and now - live_at(previous) <= LIVE_TTL_SECONDS:
            if isinstance(previous.get("claimed_at"), (int, float)):
                claimed_at = float(previous["claimed_at"])
    except (OSError, ValueError):
        pass
    try:
        registry.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({**claim, "claimed_at": claimed_at}), encoding="utf-8")
    except OSError:
        pass


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

REASON_STASH = """\
Denied: refs/stash is one stack for the whole repository, shared by every \
worktree, and another session is live in it. Your push renumbers that session's \
entries, so a later `git stash pop` or `git stash drop` in either takes the \
wrong one. This is the one place a worktree looks like isolation and is not.

Commit instead — a commit belongs to your branch and no stranger can pop it:

    git add <paths>
    git commit -m "wip"

If this is wrong — the other session is gone and its claim has not expired — \
set PHOTOS_ALLOW_SHARED_CHECKOUT=1."""


def notice(others: list[dict], main: Path) -> None:
    """Tell a starting session who is already here, so it can isolate first."""
    where = ", ".join(sorted({str(c.get("tree") or "?") for c in others}))
    json.dump(
        {
            "hookSpecificOutput": {
                "hookEventName": "SessionStart",
                "additionalContext": (
                    f"Another Claude session is already writing in this repository ({where}). "
                    "Before writing here, read the 'Pick your tree' table in "
                    "docs/agents/issue-tracker.md and take a worktree with EnterWorktree if it "
                    "applies. A write landing in the main checkout is denied while another "
                    f"session holds it ({main}), and `git stash` is denied from any tree while "
                    "another session is live, because refs/stash is shared by all of them."
                ),
            }
        },
        sys.stdout,
    )


def main() -> None:
    if os.environ.get("PHOTOS_ALLOW_SHARED_CHECKOUT") == "1":
        return

    payload = json.load(sys.stdin)
    session_id = payload.get("session_id")
    cwd = payload.get("cwd")
    if not isinstance(session_id, str) or not SESSION_ID.fullmatch(session_id) or not cwd:
        return

    located = trees(Path(cwd))
    if located is None:
        return
    main_path, session_tree = located
    registry = main_path / ".git" / REGISTRY_DIRNAME
    event = payload.get("hook_event_name")

    if event == "SessionEnd":
        try:
            (registry / f"{session_id}.json").unlink()
        except OSError:
            pass
        return

    now = time.time()
    claims = live_claims(registry, now)
    others = [c for c in claims if c.get("session_id") != session_id]

    if event == "SessionStart":
        if others:
            notice(others, main_path)
        return

    tool_input = payload.get("tool_input") or {}
    tool_name = payload.get("tool_name", "")
    paths = guarded_paths(tool_name, tool_input, Path(cwd))
    command = tool_input.get("command") if tool_name in SHELL_TOOLS else None
    stashing = stash_pushes(command) if isinstance(command, str) else False
    if not paths and not stashing:
        return

    if stashing and others:
        deny(REASON_STASH)
        return

    if any(in_main_checkout(p, main_path) for p in paths):
        holder = holds(claims, main_path)
        if holder is not None and holder.get("session_id") != session_id:
            deny(REASON)
            return

    record(
        registry,
        {
            "session_id": session_id,
            "tree": str(session_tree),
            "transcript_path": payload.get("transcript_path"),
            "last_write_at": now,
        },
        now,
    )


if __name__ == "__main__":
    try:
        main()
    except Exception:  # noqa: BLE001 — fail open, always.
        pass
    sys.exit(0)
