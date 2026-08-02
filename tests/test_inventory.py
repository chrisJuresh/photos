"""The two pieces of Phase 0 that fail silently and fail at scale.

Neither is tested for coverage's sake. `is_reparse_point` decides whether 8,052
unopenable WSL symlinks are counted as zero-byte files and then generate 8,052
open errors; `classify_disagreement` decides whether a hash difference is
expected drift or the single finding the deletion gate exists to catch. Getting
either backwards costs ten hours of I/O or, worse, does not.

Tag `0xa000001d` cannot easily be created in a test on this machine, so the
*predicate* is tested against stubbed `st_file_attributes` values rather than
the filesystem. That is the thing that can be wrong; `os.stat` is not.
"""

from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace

import pytest

from photolib.inventory import (
    BACKUP_ENDED_NS,
    FILE_ATTRIBUTE_REPARSE_POINT,
    classify_disagreement,
    is_reparse_point,
    rel_from_snapshot_path,
    snapshot_node,
    _tar_rel,
)

# Windows attribute bits that a real entry carries alongside the one that matters.
FILE_ATTRIBUTE_ARCHIVE = 0x20
FILE_ATTRIBUTE_DIRECTORY = 0x10
FILE_ATTRIBUTE_HIDDEN = 0x2


class TestReparseClassification:
    def test_ordinary_file_is_not_a_reparse_point(self):
        assert not is_reparse_point(FILE_ATTRIBUTE_ARCHIVE)

    def test_zero_attributes_is_not_a_reparse_point(self):
        assert not is_reparse_point(0)

    def test_the_bit_alone_is_enough(self):
        assert is_reparse_point(FILE_ATTRIBUTE_REPARSE_POINT)

    def test_wsl_symlink_shape_is_excluded(self):
        """An LX symlink: archive bit set, reparse bit set, st_size 0.

        This is the one that matters. The 8,052 of these report `is_file()`
        True and `is_symlink()` False, so a classifier built on either counts
        them as openable zero-byte files. The predicate must exclude them.
        """
        attributes = FILE_ATTRIBUTE_ARCHIVE | FILE_ATTRIBUTE_REPARSE_POINT
        assert is_reparse_point(attributes)

    def test_a_genuine_zero_byte_file_is_kept(self):
        """Same st_size, no reparse bit -- one of the 11,608 that keep rows."""
        assert not is_reparse_point(FILE_ATTRIBUTE_ARCHIVE | FILE_ATTRIBUTE_HIDDEN)

    def test_directory_junction_is_a_reparse_point_too(self):
        assert is_reparse_point(FILE_ATTRIBUTE_DIRECTORY | FILE_ATTRIBUTE_REPARSE_POINT)

    def test_neighbouring_bits_do_not_trigger_it(self):
        """0x200 and 0x800 sit either side of 0x400 and mean something else."""
        assert not is_reparse_point(0x200 | 0x800)


class TestDisagreementClassifier:
    BEFORE = BACKUP_ENDED_NS - 86_400 * 10**9
    AFTER = BACKUP_ENDED_NS + 1

    def test_matching_hashes_agree(self):
        assert (
            classify_disagreement(
                hashes_agree=True, disk_size=100, snapshot_size=100, disk_mtime_ns=self.BEFORE
            )
            == "agree"
        )

    def test_size_change_is_benign(self):
        """One of the 6 grown git files. Log it, re-back-up, do not stop."""
        assert (
            classify_disagreement(
                hashes_agree=False, disk_size=120, snapshot_size=100, disk_mtime_ns=self.BEFORE
            )
            == "changed_size"
        )

    def test_mtime_after_the_backup_is_benign(self):
        """One of the 9. Written after restic read it, so a difference is expected."""
        assert (
            classify_disagreement(
                hashes_agree=False, disk_size=100, snapshot_size=100, disk_mtime_ns=self.AFTER
            )
            == "changed_mtime"
        )

    def test_same_size_same_mtime_different_bytes_is_the_hard_stop(self):
        """SPIKE A's shape. The only stop, and the reason the gate exists."""
        assert (
            classify_disagreement(
                hashes_agree=False, disk_size=41, snapshot_size=41, disk_mtime_ns=self.BEFORE
            )
            == "hard_stop"
        )

    def test_mtime_exactly_at_the_backup_end_is_not_excused(self):
        """The boundary is `after`, not `at`: a file written during the window
        was read by the backup and must not be waved through."""
        assert (
            classify_disagreement(
                hashes_agree=False,
                disk_size=41,
                snapshot_size=41,
                disk_mtime_ns=BACKUP_ENDED_NS,
            )
            == "hard_stop"
        )

    def test_size_change_wins_over_a_post_backup_mtime(self):
        """Both benign; the bucket names them by the stronger evidence."""
        assert (
            classify_disagreement(
                hashes_agree=False, disk_size=120, snapshot_size=100, disk_mtime_ns=self.AFTER
            )
            == "changed_size"
        )

    def test_agreement_is_never_a_stop_whatever_the_metadata(self):
        assert (
            classify_disagreement(
                hashes_agree=True, disk_size=120, snapshot_size=100, disk_mtime_ns=self.AFTER
            )
            == "agree"
        )


class TestPathMapping:
    ROOT = Path("G:/photos")

    def test_snapshot_path_becomes_a_relative_windows_path(self):
        assert rel_from_snapshot_path("/G/photos/lumix/DCIM/P1.RW2", self.ROOT) == (
            "lumix\\DCIM\\P1.RW2"
        )

    def test_path_outside_the_photos_root_is_rejected(self):
        assert rel_from_snapshot_path("/G/other/thing.jpg", self.ROOT) is None

    def test_dump_node_has_no_leading_slash(self):
        """`/`, `.` and `/photos` all fail with `path "\\\\C:" not found in
        snapshot`; the bare root-entry form is the one restic accepts."""
        config = SimpleNamespace(photos_root=self.ROOT)
        assert snapshot_node(config, "lumix") == "G/photos/lumix"
        assert snapshot_node(config, "") == "G/photos"
        assert snapshot_node(config, "lumix\\DCIM") == "G/photos/lumix/DCIM"

    def test_tar_member_is_a_full_snapshot_path(self):
        """Measured against restic 0.19.1: `dump --archive tar` names every
        member by its full snapshot path, not relative to the dumped node."""
        assert _tar_rel("G/photos/lumix/DCIM/P1.RW2", self.ROOT) == "lumix\\DCIM\\P1.RW2"

    def test_tar_member_at_the_root_keeps_its_bare_name(self):
        assert _tar_rel("G/photos/.lock", self.ROOT) == ".lock"

    def test_tar_member_outside_the_photos_root_is_a_fault_not_a_skip(self):
        assert _tar_rel("G/other/thing.jpg", self.ROOT) is None
