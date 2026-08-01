"""The reveal boundary: path containment, and the Windows command line.

Every test here runs against a temporary tree. Nothing opens a path from
config.toml and no test launches Explorer — the spawn seam records what would
have been issued.
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path

import pytest

from photolib.reveal import (
    RevealRefused,
    command_line,
    explorer_path,
    resolve,
    reveal,
)

EXPLORER = r"C:\Windows\explorer.exe"


@pytest.fixture
def tree(tmp_path: Path) -> tuple[Path, Path]:
    """A MediaVault-shaped tree: `objects` is the reveal root, its parent the base."""
    base = tmp_path / "MediaVault"
    root = base / "objects"
    (root / "aa").mkdir(parents=True)
    (root / "aa" / "photo.jpg").write_bytes(b"jpg")
    (base / "outside.txt").write_bytes(b"secret")
    (base / "objects_evil").mkdir()
    (base / "objects_evil" / "x.blob").write_bytes(b"not ours")
    (base / "elsewhere").mkdir()
    (base / "elsewhere" / "x.txt").write_bytes(b"not ours either")
    return base, root


class Recorder:
    """The spawn seam. Captures the command line without starting a process."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, str]] = []

    def __call__(self, command: str, executable: str) -> None:
        self.calls.append((command, executable))


# -- containment ---------------------------------------------------------


def test_contained_file_resolves(tree):
    base, root = tree
    assert resolve(r"objects\aa\photo.jpg", base, root) == Path(
        os.path.realpath(root / "aa" / "photo.jpg")
    )


def test_drive_qualified_relpath_is_refused(tree):
    """`root / absolute` silently discards root. F05 is that check missing."""
    base, root = tree
    # The behaviour the check exists for, asserted so it cannot quietly change.
    assert Path(base) / r"C:\Windows\notepad.exe" == Path(r"C:\Windows\notepad.exe")
    with pytest.raises(RevealRefused):
        resolve(r"C:\Windows\notepad.exe", base, root)


def test_unc_relpath_is_refused(tree):
    base, root = tree
    with pytest.raises(RevealRefused):
        resolve(r"\\server\share\x.blob", base, root)


def test_root_anchored_relpath_is_refused(tree):
    """`\\objects\\x` has a root, no drive, and is_absolute() is False on Windows.

    Checking is_absolute() alone would let this through, and the join would
    still throw the base away.
    """
    from pathlib import PureWindowsPath

    assert PureWindowsPath(r"\objects\x.blob").is_absolute() is False
    base, root = tree
    with pytest.raises(RevealRefused):
        resolve(r"\objects\aa\photo.jpg", base, root)


def test_dotdot_escape_is_refused(tree):
    """The target exists, so this proves containment is checked, not existence."""
    base, root = tree
    assert (base / "outside.txt").is_file()
    with pytest.raises(RevealRefused):
        resolve(r"objects\..\outside.txt", base, root)


def test_sibling_prefix_is_not_contained(tree):
    """`objects_evil` shares a string prefix with `objects` and is not inside it.

    A lexical startswith or commonpath check passes this. Identity does not.
    """
    base, root = tree
    with pytest.raises(RevealRefused):
        resolve(r"objects_evil\x.blob", base, root)


def test_junction_escape_is_refused(tree):
    """A reparse point inside the root that leaves it must resolve and refuse."""
    import _winapi

    base, root = tree
    link = root / "link"
    try:
        _winapi.CreateJunction(str(base / "elsewhere"), str(link))
    except (OSError, AttributeError) as exc:  # pragma: no cover - environment
        pytest.skip(f"cannot create a junction here: {exc}")
    assert (link / "x.txt").is_file()  # reachable by name...
    with pytest.raises(RevealRefused):  # ...and still outside the root
        resolve(r"objects\link\x.txt", base, root)


def test_missing_target_is_refused(tree):
    base, root = tree
    with pytest.raises(RevealRefused):
        resolve(r"objects\aa\absent.jpg", base, root)


def test_directory_target_is_refused(tree):
    base, root = tree
    with pytest.raises(RevealRefused):
        resolve(r"objects\aa", base, root)


@pytest.mark.parametrize("relpath", ["", "\x00", "objects\\aa\\ph\x00oto.jpg"])
def test_empty_or_nul_relpath_is_refused(tree, relpath):
    base, root = tree
    with pytest.raises(RevealRefused):
        resolve(relpath, base, root)


# -- the command line ----------------------------------------------------


def test_command_line_for_a_path_containing_a_space():
    path = Path(r"G:\Media Vault\objects\a b\file.jpg")
    assert command_line(path, EXPLORER) == (
        r'"C:\Windows\explorer.exe" /select,"G:\Media Vault\objects\a b\file.jpg"'
    )


def test_command_line_for_a_path_containing_a_comma():
    path = Path(r"G:\MediaVault\objects\aa\pic,comma.jpg")
    assert command_line(path, EXPLORER) == (
        r'"C:\Windows\explorer.exe" /select,"G:\MediaVault\objects\aa\pic,comma.jpg"'
    )


def test_command_line_for_a_path_containing_both():
    path = Path(r"G:\Media Vault\objects\aa\both a,b.jpg")
    assert command_line(path, EXPLORER) == (
        r'"C:\Windows\explorer.exe" /select,"G:\Media Vault\objects\aa\both a,b.jpg"'
    )


def test_the_switch_is_never_inside_the_quotes():
    """Explorer needs /select, unquoted with the path quoted after it."""
    for name in (r"G:\a b\c.jpg", r"G:\a,b\c,d.jpg", r"G:\a b\c,d.jpg"):
        issued = command_line(Path(name), EXPLORER)
        assert issued.endswith(f'/select,"{name}"')
        assert '"/select,' not in issued


def test_is_not_the_v1_form():
    """v1 built this vector and list2cmdline quoted the whole switch token.

    `v1/media_vault/review_api.py:465` is `["explorer.exe", f"/select,{path}"]`.
    Explorer does not use the CRT parser, so a token beginning with a quote is
    not recognised as a switch and it opens a default window instead.
    """
    path = r"G:\Media Vault\objects\a b\file.jpg"
    v1_form = subprocess.list2cmdline(["explorer.exe", f"/select,{path}"])
    assert v1_form == f'explorer.exe "/select,{path}"'
    assert command_line(Path(path), EXPLORER) != v1_form


def test_quote_in_path_refuses_rather_than_misquotes():
    """Win32 forbids it, so this is a corrupt row — and there is no right escaping."""
    with pytest.raises(RevealRefused):
        command_line(Path('G:\\a"b\\c.jpg'), EXPLORER)


# -- the spawn -----------------------------------------------------------


def test_spawn_receives_an_absolute_explorer(monkeypatch):
    """A bare name would let CreateProcess find explorer.exe in the CWD. F50."""
    recorder = Recorder()
    monkeypatch.setattr(subprocess, "Popen", _forbidden)
    reveal(Path(r"G:\a b\c.jpg"), spawn=recorder)
    (command, executable) = recorder.calls[0]
    assert os.path.isabs(executable)
    assert executable.lower().endswith(r"\explorer.exe")
    assert command == f'"{executable}" /select,"G:\\a b\\c.jpg"'


def _forbidden(*args, **kwargs):  # pragma: no cover - only reached on failure
    raise AssertionError("subprocess.Popen must not run under test")


def test_explorer_path_honours_system_root(monkeypatch, tmp_path):
    monkeypatch.setenv("SystemRoot", str(tmp_path))
    assert explorer_path() == str(tmp_path / "explorer.exe")


def test_explorer_path_falls_back_to_an_absolute_path(monkeypatch):
    monkeypatch.delenv("SystemRoot", raising=False)
    assert os.path.isabs(explorer_path())
