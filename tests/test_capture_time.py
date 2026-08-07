"""Tests for the capture-time chain.

The centrepiece is `test_reconciliation_identity`: the `taken_src` buckets sum to
the adopted file count, AND the 'none' bucket equals the count of files with no
date source computed from the source columns alone. v1 reported 113,718 unknown
against 107,267 with no source and never put the two numbers in the same
expression; the 6,451 difference was exactly the set that HAD resolved.

Every test runs against a temporary database pair. Nothing here opens a path
from config.toml and no real media is involved.
"""

from __future__ import annotations

import sqlite3
from datetime import datetime

import pytest

from photolib.adopt_mediavault import capture_iso
from photolib.capture_time import (
    FILENAME_RULE,
    coverage,
    filename_date,
    mask,
    mtime_date,
    normalise_offset,
    resolve,
    shapes,
    unresolvable,
)

CEILING = datetime(2026, 8, 2)


def sha_of(seed: str) -> str:
    """A 64-hex string that reads as a hash without being one."""
    return (seed * 64)[:64]


def add(conn: sqlite3.Connection, seed: str, *, taken_at=None, taken_src=None, paths=()) -> str:
    """One `file` row and its `origin` rows. `paths` are (relative, mtime_ns)."""
    sha256 = sha_of(seed)
    conn.execute(
        "INSERT INTO file (sha256, size, ext, kind, taken_at, taken_src, state, feature_ver) "
        "VALUES (?, 1, 'jpg', 'image', ?, ?, 'adopted', '{}')",
        (sha256, taken_at, taken_src),
    )
    for relative, mtime_ns in paths:
        conn.execute(
            "INSERT INTO origin (path, root, ext, size, mtime_ns, sha256, seen_at) "
            "VALUES (?, 'r', 'jpg', 1, ?, ?, 'now')",
            ("G:\\photos\\" + relative, mtime_ns, sha256),
        )
    return sha256


# 2021-12-06 21:02:01 local, as whole nanoseconds.
MTIME_2021 = int(datetime(2021, 12, 6, 21, 2, 1).timestamp()) * 1_000_000_000
MTIME_1970 = 0


def corpus(conn: sqlite3.Connection) -> None:
    """One file per chain outcome, plus the cases that must NOT resolve."""
    add(conn, "a", taken_at="2019-07-04T12:00:00", taken_src="exif:DateTimeOriginal",
        paths=[("dcim\\IMG_0001.JPG", MTIME_2021)])
    add(conn, "b", taken_at="2019-07-05T12:00:00", taken_src="exif:CreateDate",
        paths=[("dcim\\IMG_0002.JPG", MTIME_2021)])
    add(conn, "c", taken_at="2019-07-06T12:00:00", taken_src="exif:DateCreated",
        paths=[("dcim\\IMG_0003.JPG", MTIME_2021)])
    # filename beats mtime
    add(conn, "d", paths=[("cam\\20211206_210201.jpg", MTIME_2021)])
    # mtime only: a Lumix sequence number is not a date
    add(conn, "e", paths=[("dcim\\108_PANA\\P1080096.RW2", MTIME_2021)])
    # no source at all: epoch-zero mtime is implausible and the name has no date
    add(conn, "f", paths=[("junk\\P1080097.RW2", MTIME_1970)])
    # a backup directory date must not resolve anything
    add(conn, "g", paths=[("photos-backup-14-03-2023\\DSC00641.JPG", MTIME_1970)])


def test_reconciliation_identity(conn: sqlite3.Connection) -> None:
    """Both halves. Neither is computed from `photo`."""
    corpus(conn)
    resolve(conn, ceiling=CEILING)

    adopted = conn.execute("SELECT count(*) FROM file").fetchone()[0]
    buckets = dict(coverage(conn))

    assert sum(buckets.values()) == adopted

    none_bucket = buckets.get("none", 0)
    assert none_bucket == unresolvable(conn, CEILING)
    assert none_bucket == 2  # 'f' and 'g'


def test_reconciliation_identity_holds_with_no_origins(conn: sqlite3.Connection) -> None:
    """A file with no path at all has no source, and both halves still agree."""
    add(conn, "z")
    resolve(conn, ceiling=CEILING)
    buckets = dict(coverage(conn))
    assert sum(buckets.values()) == 1
    assert buckets["none"] == unresolvable(conn, CEILING) == 1


def test_exif_is_never_overwritten(conn: sqlite3.Connection) -> None:
    """A local time with no offset is a resolved date, not an ambiguous one.

    v1's failure in one assertion: an mtime beside a DateTimeOriginal must not
    replace it, and the EXIF tier must survive a re-run untouched.
    """
    corpus(conn)
    resolve(conn, ceiling=CEILING)
    resolve(conn, ceiling=CEILING)
    row = conn.execute(
        "SELECT taken_at, taken_src FROM file WHERE sha256 = ?", (sha_of("a"),)
    ).fetchone()
    assert row == ("2019-07-04T12:00:00", "exif:DateTimeOriginal")


def test_offset_is_optional(conn: sqlite3.Connection) -> None:
    """An EXIF date with no recorded offset is still resolved, with a NULL offset."""
    corpus(conn)
    resolve(conn, offsets={sha_of("b"): "+01:00"}, ceiling=CEILING)
    rows = dict(
        conn.execute("SELECT sha256, taken_offset FROM file WHERE taken_src LIKE 'exif:%'")
    )
    assert rows[sha_of("a")] is None
    assert rows[sha_of("b")] == "+01:00"
    assert conn.execute(
        "SELECT count(*) FROM file WHERE taken_src LIKE 'exif:%' AND taken_at IS NULL"
    ).fetchone()[0] == 0


def test_a_recovered_reading_beats_mtime(conn: sqlite3.Connection) -> None:
    """A capture time step 3 could not parse must not be left as a copy date.

    File 'e' has only a Lumix sequence name and a 2021 mtime; the manifest holds
    a 2010 CreateDate for it in a spelling step 3 rejected. The 2010 date wins.
    """
    corpus(conn)
    resolve(conn, recovered={sha_of("e"): ("2010-08-30T12:09:46", "CreateDate")}, ceiling=CEILING)
    assert conn.execute(
        "SELECT taken_at, taken_src FROM file WHERE sha256 = ?", (sha_of("e"),)
    ).fetchone() == ("2010-08-30T12:09:46", "exif:CreateDate")
    assert dict(coverage(conn))["none"] == unresolvable(conn, CEILING)


def test_a_recovered_reading_never_overwrites_an_adopted_one(conn: sqlite3.Connection) -> None:
    corpus(conn)
    resolve(conn, recovered={sha_of("a"): ("1999-01-01T00:00:00", "CreateDate")}, ceiling=CEILING)
    assert conn.execute(
        "SELECT taken_at FROM file WHERE sha256 = ?", (sha_of("a"),)
    ).fetchone()[0] == "2019-07-04T12:00:00"


@pytest.mark.parametrize(
    "text, expected",
    [
        ("2021:12:01 09:06:42", "2021-12-01T09:06:42"),      # the canonical spelling
        ("2019-05-02 01:14:42", "2019-05-02T01:14:42"),      # dashes, not colons
        ("2021:12:01 09:06:42+01:00", "2021-12-01T09:06:42"),  # offset dropped, date kept
        ("2020:07:17 10:36-07:00", "2020-07-17T10:36:00"),   # seconds omitted
        ("Tue Jan 17 15:45:20 2012", "2012-01-17T15:45:20"),  # ctime(3)
        ("Mon Aug 30 12:09:46 2010", "2010-08-30T12:09:46"),
        ("0000:00:00 00:00:00", None),                        # the EXIF null placeholder
        ("['8/1/96', '4:59 PM']", None),                      # ambiguous day/month
        ("2020:07:17 10:36:99", None),      # a bad seconds field is not a HH:MM reading
        ("Tue Xxx 17 15:45:20 2012", None),                   # not a month
        ("Tue Jan 32 15:45:20 2012", None),                   # not a day
        ("", None),
        (None, None),
    ],
)
def test_capture_iso(text: str | None, expected: str | None) -> None:
    assert capture_iso(text) == expected


def test_chain_order(conn: sqlite3.Connection) -> None:
    corpus(conn)
    resolve(conn, ceiling=CEILING)
    got = dict(conn.execute("SELECT sha256, taken_src FROM file"))
    assert got[sha_of("d")] == "filename"
    assert got[sha_of("e")] == "mtime"
    assert got[sha_of("f")] == "none"


def test_filename_wins_the_earliest_across_origins(conn: sqlite3.Connection) -> None:
    """Order-independent: two copies, two names, the earlier date every time."""
    add(conn, "m", paths=[("b\\20211206_210201.jpg", MTIME_2021),
                          ("a\\20190704_123456.jpg", MTIME_2021)])
    resolve(conn, ceiling=CEILING)
    assert conn.execute("SELECT taken_at FROM file WHERE sha256 = ?", (sha_of("m"),)).fetchone()[0] \
        == "2019-07-04T12:34:56"


def test_min_mtime_across_all_origins(conn: sqlite3.Connection) -> None:
    """Never the latest: many origins per file is what makes this tier work."""
    later = int(datetime(2024, 1, 1).timestamp()) * 1_000_000_000
    add(conn, "n", paths=[("copy2024\\P1.RW2", later), ("copy2021\\P1.RW2", MTIME_2021)])
    resolve(conn, ceiling=CEILING)
    assert conn.execute(
        "SELECT taken_at FROM file WHERE sha256 = ?", (sha_of("n"),)
    ).fetchone()[0].startswith("2021-12-06")


def test_resolve_never_writes_photo(conn: sqlite3.Connection) -> None:
    """The hole this module used to be: an unfiltered `INSERT ... SELECT FROM file`.

    `photo` is Phase 5's, built from the triage-kept set. Re-running the capture
    chain must not put a tile in the grid for every distinct byte sequence in the
    catalog -- which is what it did, and why 787,798 `file` rows would have become
    787,798 tiles. See `tests/test_group.py` for what does build it.
    """
    corpus(conn)
    conn.execute(
        "INSERT INTO photo (id, rep_sha256, sort_key) VALUES (1, ?, '2019-07-04T12:00:00')",
        (sha_of("a"),),
    )
    resolve(conn, ceiling=CEILING)
    assert conn.execute("SELECT count(*) FROM photo").fetchone()[0] == 1


def test_resolve_is_idempotent(conn: sqlite3.Connection) -> None:
    corpus(conn)
    resolve(conn, ceiling=CEILING)
    first = conn.execute("SELECT sha256, taken_at, taken_src FROM file ORDER BY sha256").fetchall()
    resolve(conn, ceiling=CEILING)
    assert conn.execute(
        "SELECT sha256, taken_at, taken_src FROM file ORDER BY sha256"
    ).fetchall() == first


def test_shape_counts_sum_to_the_row_count(conn: sqlite3.Connection) -> None:
    """The coverage proof: every path lands in exactly one bucket."""
    corpus(conn)
    counted = shapes(conn)
    assert sum(counted.values()) == conn.execute("SELECT count(*) FROM origin").fetchone()[0]


@pytest.mark.parametrize(
    "text, expected",
    [
        ("IMG_20190704_123456.jpg", "IMG_D8_D6.jpg"),
        ("P1080096.RW2", "PD7.RWD1"),
        ("2019-07-04\\IMG_1234.jpg", "D4-D2-D2\\IMG_D4.jpg"),
        ("no digits here.png", "no digits here.png"),
    ],
)
def test_mask(text: str, expected: str) -> None:
    assert mask(text) == expected


@pytest.mark.parametrize(
    "relative, expected",
    [
        ("cam\\20211206_210201.jpg", "2021-12-06T21:02:01"),
        ("cam\\IMG_20190704_123456.jpg", "2019-07-04T12:34:56"),
        ("cam\\Screenshot_20190704-123456_Gallery.jpg", "2019-07-04T12:34:56"),
        # the date is in the directory, and that directory is a backup date
        ("photos-backup-14-03-2023\\DSC00641.JPG", None),
        ("dcim\\108_PANA\\P1080096.RW2", None),       # a Lumix sequence number
        ("shots\\1920x1080.png", None),               # a resolution
        ("thumbs\\1000000010.jpg", None),             # an Android thumbnail id
        ("cam\\19800704_123456.jpg", None),           # before 1990
        ("cam\\20991231_235959.jpg", None),           # in the future
        ("cam\\20190732_123456.jpg", None),           # no 32nd of July
        ("cam\\120190704_1234567.jpg", None),         # a longer run is not a date
    ],
)
def test_filename_date(relative: str, expected: str | None) -> None:
    got = filename_date(relative, CEILING)
    assert (got.strftime("%Y-%m-%dT%H:%M:%S") if got else None) == expected


def test_filename_rule_needs_a_time(conn: sqlite3.Connection) -> None:
    """The date-only variant was rejected: its marginal hits are ids, not dates."""
    assert FILENAME_RULE.search("20140812-alaska-vacation-15.jpg") is None


def test_mtime_rejects_the_implausible() -> None:
    assert mtime_date(MTIME_1970, CEILING) is None
    resolved = mtime_date(MTIME_2021, CEILING)
    assert resolved is not None
    stamp, offset = resolved
    assert stamp.strftime("%Y-%m-%d") == "2021-12-06"
    assert normalise_offset(offset) == offset


@pytest.mark.parametrize(
    "text, expected",
    [("Z", "+00:00"), ("+0200", "+02:00"), ("+01:00", "+01:00"),
     ("-07:00", "-07:00"), ("", None), (None, None), ("nonsense", None)],
)
def test_normalise_offset(text: str | None, expected: str | None) -> None:
    assert normalise_offset(text) == expected
