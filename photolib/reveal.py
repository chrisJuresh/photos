"""Resolves a stored vault path and selects it in Explorer.

This is the one place the system crosses out of itself and into the OS, and two
independent things go wrong here. Both have prior art in v1.

The first is containment. `F05` is `vault.root / Path(row["object_relpath"])`
with nothing re-proving the result is still inside the vault
(`v1/media_vault/vault_ops.py:367`); `F13` is four different containment
implementations coexisting, three of them lexical and therefore unsound. There
is exactly one implementation here, it resolves before it compares, and it
compares by file identity rather than by string.

The second is Windows-specific and is what v1 shipped at
`v1/media_vault/review_api.py:465`:

    subprocess.Popen(["explorer.exe", f"/select,{path}"])

`list2cmdline` quotes any argv element containing a space, so a path with a
space becomes the single token `"/select,G:\\a b\\c.jpg"`. Explorer does not use
the CRT parser: it sees a token whose first character is a quote, fails to
recognise a switch, and opens a default window instead of selecting anything.
Pre-quoting the path is worse, because `list2cmdline` then backslash-escapes the
inner quotes. There is no argv form that works, because Explorer takes one
command-line string.

So the command line is built here, with the quotes around the *path* and never
around the switch, and the module is passed separately as lpApplicationName so
`CreateProcess` never searches the working directory for `explorer.exe` — which
is the other half of `F50`.
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path, PureWindowsPath

SELECT_SWITCH = "/select,"


class RevealRefused(ValueError):
    """The path was not proven to sit inside the reveal root. Nothing spawned.

    The message names the reason for the log. It is never shown to the client:
    a refusal that echoes the path it refused hands back the one fact the check
    exists to withhold.
    """


def explorer_path() -> str:
    """`%SystemRoot%\\explorer.exe`, absolute.

    Never the bare name. `CreateProcess` resolves a bare name through a search
    order that includes the calling process's working directory, so an
    `explorer.exe` dropped beside the server would run instead of the shell.
    """
    system_root = os.environ.get("SystemRoot") or r"C:\Windows"
    path = os.path.join(system_root, "explorer.exe")
    if not os.path.isabs(path):
        raise RevealRefused(f"SystemRoot is not absolute: {system_root!r}")
    return path


def resolve(vault_relpath: str, mediavault_root: Path, reveal_root: Path) -> Path:
    """The real, existing file `vault_relpath` names, proven inside `reveal_root`.

    `mediavault_root` is what the relpath is relative to; `reveal_root` is the
    single root containment is proven against. They are not the same directory
    today — `vault_relpath` is `objects\\sha256\\...` relative to
    `G:\\MediaVault`, while the reveal root is `G:\\MediaVault\\objects` — and
    step 14 moves both together. There is one containment root, not a set: a set
    is how `F05` and `F13` happen.
    """
    if not vault_relpath or "\x00" in vault_relpath:
        raise RevealRefused("empty or NUL-bearing relpath")

    relative = PureWindowsPath(vault_relpath)
    if relative.drive or relative.root:
        # Path(r"G:\MediaVault") / r"C:\Windows\x" is WindowsPath("C:/Windows/x"):
        # __truediv__ discards the left operand for a drive-qualified or rooted
        # right operand, silently. Note `drive or root` and not is_absolute():
        # PureWindowsPath(r"\Windows\x") has a root, no drive, and is_absolute()
        # is False, while the join still throws the base away.
        raise RevealRefused(f"not a relative path: {vault_relpath!r}")

    # strict=True is not merely an existence check. It opens a handle, so 8.3
    # short names, case, junctions and symlinks all resolve. Non-strict realpath
    # falls back to lexical normalisation for anything it cannot open, which is
    # exactly the state an escape attempt produces.
    try:
        root = Path(os.path.realpath(reveal_root, strict=True))
    except OSError as exc:
        raise RevealRefused(f"reveal root does not resolve: {reveal_root}") from exc
    try:
        target = Path(os.path.realpath(Path(mediavault_root) / relative, strict=True))
    except OSError as exc:
        raise RevealRefused(f"cannot resolve: {vault_relpath!r}") from exc

    if not os.path.isfile(target):
        raise RevealRefused(f"not a regular file: {vault_relpath!r}")

    # Containment by identity, not by string. On Windows os.stat carries the
    # 128-bit file index in st_ino and the volume serial in st_dev, so samestat
    # is immune to case, to trailing separators, and to `objects` against
    # `objects_evil` — which a startswith or a commonpath comparison is not.
    root_stat = os.stat(root)
    for parent in target.parents:
        try:
            if os.path.samestat(os.stat(parent), root_stat):
                return target
        except OSError:
            break
    raise RevealRefused(f"outside reveal root: {vault_relpath!r}")


def command_line(target: Path, explorer: str) -> str:
    """The exact lpCommandLine. Quotes go around the path, never around the switch."""
    text = str(target)
    if '"' in text or '"' in explorer:
        # Win32 forbids a quote in a filename, so this is a corrupt row or a
        # path from somewhere else. There is no correct escaping for it here,
        # so there is no attempt at one — refusing keeps the quoting provably
        # lossless rather than usually fine.
        raise RevealRefused("path contains a quote")
    return f'"{explorer}" {SELECT_SWITCH}"{text}"'


def _popen(command: str, executable: str) -> None:
    """Spawn Explorer. No shell, and the module named separately.

    `args` is a str, so subprocess hands it to CreateProcess as lpCommandLine
    verbatim and `list2cmdline` is never called. `executable` becomes
    lpApplicationName, so the module comes from that absolute path with no
    search. `shell=True` would reintroduce cmd.exe metacharacters and is never
    used.
    """
    subprocess.Popen(command, executable=executable, close_fds=True)  # noqa: S603


def reveal(target: Path, *, explorer: str | None = None, spawn=_popen) -> str:
    """Select `target` in Explorer. Returns the command line that was issued.

    `spawn` is the test seam: a recorder captures the exact string without
    launching anything.
    """
    executable = explorer or explorer_path()
    command = command_line(target, executable)
    spawn(command, executable)
    return command
