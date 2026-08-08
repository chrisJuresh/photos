"""Tests for the 1536px substrate adoption.

Each test builds a synthetic pair of source trees under tmp_path -- a manifest
holding only the columns this module reads over v1's `derivatives` tree, and a
`deriv_root` shard tree of small byte strings that are not images and do not
need to be. Nothing here opens a path from config.toml.
"""

from __future__ import annotations

import hashlib
import sqlite3
from pathlib import Path

import pytest

from photolib.config import substrate_path
from photolib.substrates import (
    LONG_EDGE,
    SubstratesRefused,
    copy_all,
    deriv_index,
    open_manifest,
    present,
    tile_shas,
    worklist,
)

MANIFEST_SCHEMA = """
CREATE TABLE assets (
  asset_id TEXT PRIMARY KEY, sha256 TEXT NOT NULL
);
CREATE TABLE derivatives (
  derivative_id TEXT PRIMARY KEY, asset_id TEXT NOT NULL, long_edge INTEGER NOT NULL,
  is_current INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL,
  relative_path_text TEXT, checksum_sha256 TEXT
);
"""


def sha_of(seed: str) -> str:
    """A 64-hex string that reads as a hash without being one."""
    return (seed * 64)[:64]


class Trees:
    """The two source trees a substrate can come from, plus the manifest."""

    def __init__(self, root: Path) -> None:
        self.mediavault = root / "MediaVault" / "derivatives"
        self.deriv = root / "vault" / "deriv"
        self.conn = sqlite3.connect(":memory:")
        self.conn.executescript(MANIFEST_SCHEMA)
        self.serial = 0

    def add_manifest(
        self,
        sha256: str,
        payload: bytes = b"substrate-bytes",
        *,
        long_edge: int = LONG_EDGE,
        status: str = "ready",
        on_disk: bool = True,
        checksum: str | None = None,
        is_current: int = 1,
    ) -> None:
        """One v1 derivative row, and by default the file it points at."""
        self.serial += 1
        asset_id = f"a1_{sha256}"
        if not self.conn.execute(
            "SELECT 1 FROM assets WHERE asset_id = ?", (asset_id,)
        ).fetchone():
            self.conn.execute("INSERT INTO assets VALUES (?, ?)", (asset_id, sha256))
        relpath = None
        if status == "ready":
            digest = hashlib.sha256(payload).hexdigest()
            relpath = f"vault\\_{digest[0]}\\{digest[1:3]}\\d1_{digest}.webp"
            if on_disk:
                target = self.mediavault / relpath.replace("\\", "/")
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(payload)
            checksum = checksum or digest
        self.conn.execute(
            "INSERT INTO derivatives VALUES (?, ?, ?, ?, ?, ?, ?)",
            (f"d_{self.serial}", asset_id, long_edge, is_current, status, relpath, checksum),
        )
        self.conn.commit()

    def add_deriv(self, sha256: str, payload: bytes = b"repaired") -> Path:
        """One substrate Phase 2a or 2b wrote, at `<aa>\\<bb>\\<sha256>.webp`."""
        target = self.deriv / sha256[:2] / sha256[2:4] / f"{sha256}.webp"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(payload)
        return target

    def worklist(self, wanted: set[str]):
        return worklist(self.conn, wanted, self.mediavault, self.deriv)


@pytest.fixture
def trees(tmp_path: Path) -> Trees:
    return Trees(tmp_path)


@pytest.fixture
def substrates(tmp_path: Path) -> Path:
    return tmp_path / "substrate"


# --- the path helper ---------------------------------------------------------


def test_substrate_path_is_one_shard_level(tmp_path: Path) -> None:
    sha256 = sha_of("ab")
    assert substrate_path(tmp_path, sha256) == tmp_path / sha256[:2] / f"{sha256}.webp"


# --- resolving the two trees -------------------------------------------------


def test_copies_and_verifies_a_mediavault_substrate(trees: Trees, substrates: Path) -> None:
    sha256 = sha_of("1")
    trees.add_manifest(sha256, b"one")
    todo, counts = trees.worklist({sha256})
    result = copy_all(todo, substrates, workers=4)

    assert (counts["mediavault"], counts["deriv"], counts["no_substrate"]) == (1, 0, 0)
    assert (result["copied"], result["unverified"], result["mismatch"]) == (1, 0, 0)
    assert substrate_path(substrates, sha256).read_bytes() == b"one"


def test_a_deriv_root_substrate_is_copied_unverified(trees: Trees, substrates: Path) -> None:
    sha256 = sha_of("1")
    trees.add_deriv(sha256, b"upright")
    todo, counts = trees.worklist({sha256})
    result = copy_all(todo, substrates, workers=4)

    assert (counts["deriv"], counts["mediavault"]) == (1, 0)
    assert todo[0].checksum is None
    # Counted apart from the verified ones -- the manifest has nothing to check
    # this against, and the report must not imply otherwise.
    assert (result["copied"], result["unverified"]) == (0, 1)
    assert substrate_path(substrates, sha256).read_bytes() == b"upright"


def test_deriv_root_wins_where_both_trees_hold_one(trees: Trees, substrates: Path) -> None:
    """v1's is the wrongly-rotated file Phase 2a rewrote; the rewrite wins."""
    sha256 = sha_of("1")
    trees.add_manifest(sha256, b"rotated-wrong")
    trees.add_deriv(sha256, b"upright")
    todo, counts = trees.worklist({sha256})
    copy_all(todo, substrates, workers=4)

    assert (counts["deriv"], counts["mediavault"]) == (1, 0)
    assert substrate_path(substrates, sha256).read_bytes() == b"upright"


def test_a_tile_with_no_substrate_anywhere_is_counted_not_fatal(trees: Trees) -> None:
    present_sha, orphan = sha_of("1"), sha_of("2")
    trees.add_manifest(present_sha, b"one")
    todo, counts = trees.worklist({present_sha, orphan})

    assert [source.sha256 for source in todo] == [present_sha]
    assert counts["no_substrate"] == 1


def test_only_tiles_are_copied(trees: Trees, substrates: Path) -> None:
    """A RAW+JPEG group's other members are never drawn at this size."""
    tile, member = sha_of("1"), sha_of("2")
    trees.add_manifest(tile, b"tile")
    trees.add_manifest(member, b"member")
    trees.add_deriv(sha_of("3"), b"not-a-tile")
    todo, counts = trees.worklist({tile})

    assert [source.sha256 for source in todo] == [tile]
    assert counts["tiles"] == 1


def test_only_the_1536_tier_is_read(trees: Trees) -> None:
    grid, substrate, detail = sha_of("1"), sha_of("2"), sha_of("3")
    trees.add_manifest(grid, b"grid", long_edge=384)
    trees.add_manifest(substrate, b"substrate")
    trees.add_manifest(detail, b"detail", long_edge=2560)
    todo, _ = trees.worklist({grid, substrate, detail})

    assert [source.sha256 for source in todo] == [substrate]


def test_superseded_rows_are_ignored(trees: Trees) -> None:
    sha256 = sha_of("1")
    trees.add_manifest(sha256, b"stale", is_current=0)
    todo, counts = trees.worklist({sha256})

    assert (todo, counts["unusable"], counts["no_substrate"]) == ([], 0, 1)


def test_error_rows_are_counted_not_copied(trees: Trees, substrates: Path) -> None:
    ok, failed = sha_of("1"), sha_of("2")
    trees.add_manifest(ok, b"ok")
    trees.add_manifest(failed, status="error")
    todo, counts = trees.worklist({ok, failed})
    result = copy_all(todo, substrates, workers=4)

    assert (counts["unusable"], counts["no_substrate"]) == (1, 1)
    assert result["copied"] == 1
    assert not substrate_path(substrates, failed).exists()


def test_a_ready_row_with_no_checksum_is_refused(trees: Trees) -> None:
    """Outside deriv_root there is no reason for a substrate to arrive
    without something to check it against, so this is a refusal rather than
    an unverified copy."""
    sha256 = sha_of("1")
    trees.add_manifest(sha256, b"unchecksummed")
    trees.conn.execute("UPDATE derivatives SET checksum_sha256 = NULL")
    todo, counts = trees.worklist({sha256})

    assert (todo, counts["unusable"], counts["no_substrate"]) == ([], 1, 1)


def test_worklist_is_ordered_by_source_path(trees: Trees) -> None:
    wanted = set()
    for seed in ("1", "2", "3", "4"):
        trees.add_manifest(sha_of(seed), f"payload-{seed}".encode())
        wanted.add(sha_of(seed))
    trees.add_deriv(sha_of("5"), b"repaired")
    wanted.add(sha_of("5"))
    todo, _ = trees.worklist(wanted)

    assert [str(source.path) for source in todo] == sorted(str(s.path) for s in todo)


def test_deriv_index_ignores_a_stray_partial(trees: Trees) -> None:
    sha256 = sha_of("1")
    target = trees.add_deriv(sha256, b"upright")
    target.with_name(target.name + ".part").write_bytes(b"half")

    assert set(deriv_index(trees.deriv)) == {sha256}


def test_deriv_index_of_a_tree_that_does_not_exist(tmp_path: Path) -> None:
    assert deriv_index(tmp_path / "nothing") == {}


# --- the copy ----------------------------------------------------------------


def test_absent_file_is_not_a_mismatch(trees: Trees, substrates: Path) -> None:
    sha256 = sha_of("1")
    trees.add_manifest(sha256, b"gone", on_disk=False)
    todo, _ = trees.worklist({sha256})
    result = copy_all(todo, substrates, workers=4)

    assert (result["copied"], result["absent"], result["mismatch"]) == (0, 1, 0)
    assert not substrate_path(substrates, sha256).exists()


def test_checksum_mismatch_is_refused_and_reported(trees: Trees, substrates: Path) -> None:
    sha256 = sha_of("1")
    trees.add_manifest(sha256, b"tampered", checksum=sha_of("f"))
    todo, _ = trees.worklist({sha256})
    result = copy_all(todo, substrates, workers=4)

    assert (result["copied"], result["mismatch"], result["bytes"]) == (0, 1, 0)
    assert result["mismatched"][0][0] == sha256
    # The unverified bytes never reach the NVMe, not even as a .part.
    assert not substrate_path(substrates, sha256).exists()
    assert list(substrates.rglob("*.part")) == []


def test_rerun_copies_only_what_is_absent(trees: Trees, substrates: Path) -> None:
    one, two = sha_of("1"), sha_of("2")
    trees.add_manifest(one, b"one")
    trees.add_deriv(two, b"two")
    sources, _ = trees.worklist({one, two})
    assert copy_all(sources, substrates, workers=4)["bytes"] == 6

    already = present(substrates)
    assert already == {one, two}
    assert [source for source in sources if source.sha256 not in already] == []

    # And with one substrate removed, exactly that one comes back.
    substrate_path(substrates, one).unlink()
    todo = [source for source in sources if source.sha256 not in present(substrates)]
    result = copy_all(todo, substrates, workers=4)
    assert result["copied"] == 1
    assert substrate_path(substrates, one).read_bytes() == b"one"


def test_present_ignores_a_stray_partial(trees: Trees, substrates: Path) -> None:
    sha256 = sha_of("1")
    trees.add_manifest(sha256, b"one")
    todo, _ = trees.worklist({sha256})
    copy_all(todo, substrates, workers=4)
    stray = substrate_path(substrates, sha_of("2"))
    stray.parent.mkdir(parents=True, exist_ok=True)
    stray.with_name(stray.name + ".part").write_bytes(b"half")

    assert present(substrates) == {sha256}


def test_present_of_a_tree_that_does_not_exist(tmp_path: Path) -> None:
    assert present(tmp_path / "nothing") == set()


# --- reading the catalog and the manifest ------------------------------------


def test_tile_shas_reads_the_representative_frame(conn) -> None:
    conn.execute(
        "INSERT INTO file (sha256, size, ext, kind, state, feature_ver)"
        " VALUES (?, 1, '.jpg', 'image', 'published', '{}')",
        (sha_of("1"),),
    )
    conn.execute(
        "INSERT INTO photo (rep_sha256, sort_key) VALUES (?, '2021-01-01T00:00:00')",
        (sha_of("1"),),
    )

    assert tile_shas(conn) == {sha_of("1")}


def test_a_missing_manifest_is_refused(tmp_path: Path) -> None:
    with pytest.raises(SubstratesRefused, match="manifest not found"):
        open_manifest(tmp_path / "manifest.sqlite3")


def test_an_unspent_wal_is_refused(tmp_path: Path) -> None:
    path = tmp_path / "manifest.sqlite3"
    sqlite3.connect(path).close()
    path.with_name(path.name + "-wal").write_bytes(b"unspent")

    with pytest.raises(SubstratesRefused, match="unspent bytes"):
        open_manifest(path)
