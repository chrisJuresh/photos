"""Tests for the 384px thumbnail adoption.

Each test builds a synthetic MediaVault under tmp_path -- a manifest holding
only the columns this module reads, and a derivative tree of small byte strings
that are not images and do not need to be. Nothing here opens a path from
config.toml.
"""

from __future__ import annotations

import hashlib
import sqlite3
from pathlib import Path

import pytest

from photolib.thumbnails import LONG_EDGE, copy_all, present, thumb_path, worklist

MANIFEST_SCHEMA = """
CREATE TABLE assets (
  asset_id TEXT PRIMARY KEY, sha256 TEXT NOT NULL, preferred_extension TEXT
);
CREATE TABLE derivatives (
  derivative_id TEXT PRIMARY KEY, asset_id TEXT NOT NULL, long_edge INTEGER NOT NULL,
  is_current INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL,
  relative_path_text TEXT, checksum_sha256 TEXT, byte_size INTEGER
);
"""


def sha_of(seed: str) -> str:
    """A 64-hex string that reads as a hash without being one."""
    return (seed * 64)[:64]


class Vault:
    """A synthetic MediaVault: manifest rows plus a derivative tree."""

    def __init__(self, root: Path) -> None:
        self.root = root
        self.derivatives = root / "derivatives"
        self.conn = sqlite3.connect(":memory:")
        self.conn.executescript(MANIFEST_SCHEMA)
        self.serial = 0

    def add(
        self,
        sha256: str,
        payload: bytes = b"webp-bytes",
        *,
        ext: str = ".jpg",
        long_edge: int = LONG_EDGE,
        status: str = "ready",
        on_disk: bool = True,
        checksum: str | None = None,
        is_current: int = 1,
    ) -> str:
        self.serial += 1
        asset_id = f"a1_{sha256}"
        if self.serial == 1 or not self.conn.execute(
            "SELECT 1 FROM assets WHERE asset_id = ?", (asset_id,)
        ).fetchone():
            self.conn.execute("INSERT INTO assets VALUES (?, ?, ?)", (asset_id, sha256, ext))
        relpath = None
        if status == "ready":
            digest = hashlib.sha256(payload).hexdigest()
            relpath = f"vault\\_{digest[0]}\\{digest[1:3]}\\d1_{digest}.webp"
            if on_disk:
                target = self.derivatives / relpath.replace("\\", "/")
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(payload)
            checksum = checksum or digest
        self.conn.execute(
            "INSERT INTO derivatives VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                f"d_{self.serial}", asset_id, long_edge, is_current, status,
                relpath, checksum, len(payload) if status == "ready" else None,
            ),
        )
        self.conn.commit()
        return asset_id


@pytest.fixture
def vault(tmp_path: Path) -> Vault:
    return Vault(tmp_path / "MediaVault")


@pytest.fixture
def thumbs(tmp_path: Path) -> Path:
    return tmp_path / "thumb"


def run(vault: Vault, thumbs: Path, **kwargs) -> dict:
    todo, _ = worklist(vault.conn)
    return copy_all(todo, vault.derivatives, thumbs, workers=4, **kwargs)


def test_thumb_path_is_one_shard_level(tmp_path: Path) -> None:
    sha256 = sha_of("ab")
    assert thumb_path(tmp_path, sha256) == tmp_path / sha256[:2] / f"{sha256}.webp"


def test_copies_and_verifies(vault: Vault, thumbs: Path) -> None:
    sha256 = sha_of("1")
    vault.add(sha256, b"one")
    result = run(vault, thumbs)

    assert (result["copied"], result["absent"], result["mismatch"]) == (1, 0, 0)
    assert result["bytes"] == 3
    assert thumb_path(thumbs, sha256).read_bytes() == b"one"


def test_only_the_384_tier_is_read(vault: Vault, thumbs: Path) -> None:
    vault.add(sha_of("1"), b"grid")
    vault.add(sha_of("2"), b"substrate", long_edge=1536)
    vault.add(sha_of("3"), b"detail", long_edge=2560)

    todo, _ = worklist(vault.conn)
    assert [item[1] for item in todo] == [sha_of("1")]


def test_superseded_rows_are_ignored(vault: Vault, thumbs: Path) -> None:
    vault.add(sha_of("1"), b"stale", is_current=0)
    todo, not_ready = worklist(vault.conn)
    assert (todo, not_ready) == ([], 0)


def test_error_rows_are_counted_not_copied(vault: Vault, thumbs: Path) -> None:
    vault.add(sha_of("1"), b"ok")
    vault.add(sha_of("2"), status="error")
    vault.add(sha_of("3"), status="error")

    todo, not_ready = worklist(vault.conn)
    assert not_ready == 2
    result = copy_all(todo, vault.derivatives, thumbs, workers=4)
    assert result["copied"] == 1
    # Nothing was generated for the failures.
    assert not thumb_path(thumbs, sha_of("2")).exists()


def test_absent_file_is_not_a_mismatch(vault: Vault, thumbs: Path) -> None:
    vault.add(sha_of("1"), b"gone", on_disk=False)
    result = run(vault, thumbs)

    assert (result["copied"], result["absent"], result["mismatch"]) == (0, 1, 0)
    assert not thumb_path(thumbs, sha_of("1")).exists()


def test_checksum_mismatch_is_refused_and_reported(vault: Vault, thumbs: Path) -> None:
    sha256 = sha_of("1")
    vault.add(sha256, b"tampered", checksum=sha_of("f"))
    result = run(vault, thumbs)

    assert (result["copied"], result["absent"], result["mismatch"]) == (0, 0, 1)
    assert result["bytes"] == 0
    assert result["mismatched"][0][0] == sha256
    # The unverified bytes never reach the NVMe, not even as a .part.
    assert not thumb_path(thumbs, sha256).exists()
    assert list(thumbs.rglob("*.part")) == []


def test_rerun_copies_only_what_is_absent(vault: Vault, thumbs: Path) -> None:
    vault.add(sha_of("1"), b"one")
    vault.add(sha_of("2"), b"two")
    assert run(vault, thumbs)["copied"] == 2

    ready, _ = worklist(vault.conn)
    already = present(thumbs)
    assert already == {sha_of("1"), sha_of("2")}

    todo = [item for item in ready if item[1] not in already]
    assert todo == []

    # And with one thumbnail removed, exactly that one comes back.
    thumb_path(thumbs, sha_of("1")).unlink()
    todo = [item for item in ready if item[1] not in present(thumbs)]
    result = copy_all(todo, vault.derivatives, thumbs, workers=4)
    assert result["copied"] == 1
    assert thumb_path(thumbs, sha_of("1")).read_bytes() == b"one"


def test_extension_tally_counts_arw(vault: Vault, thumbs: Path) -> None:
    vault.add(sha_of("1"), b"raw-embedded", ext=".arw")
    vault.add(sha_of("2"), b"raw-embedded-2", ext=".ARW")
    vault.add(sha_of("3"), b"jpeg", ext=".jpg")
    result = run(vault, thumbs)

    assert result["by_ext"][".arw"] == 2
    assert result["by_ext"][".jpg"] == 1


def test_present_ignores_a_stray_partial(vault: Vault, thumbs: Path) -> None:
    sha256 = sha_of("1")
    vault.add(sha256, b"one")
    run(vault, thumbs)
    stray = thumb_path(thumbs, sha_of("2"))
    stray.parent.mkdir(parents=True, exist_ok=True)
    stray.with_name(stray.name + ".part").write_bytes(b"half")

    assert present(thumbs) == {sha256}


def test_worklist_is_ordered_by_source_path(vault: Vault, thumbs: Path) -> None:
    for seed in ("1", "2", "3", "4"):
        vault.add(sha_of(seed), f"payload-{seed}".encode())
    todo, _ = worklist(vault.conn)
    assert [item[0] for item in todo] == sorted(item[0] for item in todo)
