"""Read-only access to the restic repository named in config.toml.

Every function here builds its own argv, and every one of them carries
``--no-lock``: restic's default for a *read* command is still to write a lock
file into the repository, and this repository is the thing being verified. The
one command that deliberately omits ``--no-lock`` is ``backup``, which is a
write and needs the lock; it lives in `inventory.py` behind an explicit flag.

The password never appears here. `config.restic_password_command` is handed to
restic as ``--password-command`` and restic runs it itself, so the secret never
reaches this process, a command line, or a log line.

Subprocess output is decoded with an explicit ``encoding="utf-8"``. Python's
Windows default is the ANSI codepage, which rewrites non-ASCII path bytes into
different, valid-looking names and raises nothing -- 896 non-ASCII names in this
corpus are exposed to that.
"""

from __future__ import annotations

import json
import subprocess
from collections.abc import Iterator
from pathlib import Path

from photolib.config import Config

# restic emits one JSON document per line for `ls --json`; a 1.7M-node stream is
# read incrementally rather than buffered.
_LS_BUFFER = 1 << 20


def base_argv(config: Config) -> list[str]:
    """`restic --repo ... --password-command ...` with no subcommand yet."""
    return [
        "restic",
        "--repo",
        str(config.restic_repo),
        "--password-command",
        config.restic_password_command,
    ]


def read_argv(config: Config, *args: str) -> list[str]:
    """A read command. `--no-lock` is not optional and not a parameter."""
    return base_argv(config) + ["--no-lock", *args]


def _run(argv: list[str]) -> str:
    done = subprocess.run(
        argv,
        capture_output=True,
        encoding="utf-8",
        errors="strict",
        check=False,
    )
    if done.returncode != 0:
        raise RuntimeError(f"{argv[:2]} exited {done.returncode}: {done.stderr.strip()[:2000]}")
    return done.stdout


def cat_config(config: Config) -> dict:
    """The repository's own config document: version and chunker polynomial."""
    return json.loads(_run(read_argv(config, "cat", "config")))


def snapshots(config: Config) -> list[dict]:
    """Every snapshot. An `original` key on any of them means `restic copy` ran."""
    return json.loads(_run(read_argv(config, "snapshots", "--json")))


def ls_nodes(config: Config, snapshot: str) -> Iterator[dict]:
    """Stream `ls --json --long --recursive`, yielding node documents only.

    The first document is the snapshot header, not a node; it is skipped by
    `message_type`, never by position.
    """
    argv = read_argv(config, "ls", "--json", "--long", "--recursive", snapshot)
    proc = subprocess.Popen(
        argv,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        encoding="utf-8",
        errors="strict",
        bufsize=_LS_BUFFER,
    )
    try:
        for line in proc.stdout:
            if not line.strip():
                continue
            document = json.loads(line)
            if document.get("message_type") == "node" or "struct_type" in document:
                if document.get("struct_type") == "snapshot":
                    continue
                yield document
    finally:
        if proc.stdout is not None:
            proc.stdout.close()
        stderr = proc.stderr.read() if proc.stderr is not None else ""
        if proc.stderr is not None:
            proc.stderr.close()
        code = proc.wait()
        if code != 0:
            raise RuntimeError(f"restic ls exited {code}: {stderr.strip()[:2000]}")


def dump_tar(config: Config, snapshot: str, subtree: str) -> subprocess.Popen:
    """`dump --archive tar` for one subtree, as a binary stdout pipe.

    `subtree` is a bare root-entry-relative path with **no leading slash**:
    this snapshot's single root entry is `G`, so `G/photos/<name>` works while
    `/`, `.` and `/photos` all fail with the misleading
    `path "\\\\C:" not found in snapshot`.
    """
    argv = read_argv(config, "dump", "--archive", "tar", snapshot, subtree)
    return subprocess.Popen(argv, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def dump_file(config: Config, snapshot: str, path: str) -> bytes:
    """One file's bytes, straight from the repository. For small files only."""
    argv = read_argv(config, "dump", snapshot, path)
    done = subprocess.run(argv, capture_output=True, check=False)
    if done.returncode != 0:
        message = done.stderr.decode("utf-8", "replace").strip()[:2000]
        raise RuntimeError(f"restic dump {path!r} exited {done.returncode}: {message}")
    return done.stdout
