"""Tests for Phase 5: the kept-set filter, RAW+JPEG pairing, and incrementality.

Three of these carry the step.

`test_only_published_files_become_tiles` is the hole nobody owned: `photo` used
to be `INSERT ... SELECT sha256 FROM file` with no predicate, so a file in state
`excluded` or `pending` became a grid tile.

`test_incremental_work_is_proportional_to_the_batch` is the "adding a folder is
fast" requirement, stated in rows read rather than seconds: 100 new photos into a
30,000-photo catalog must cost the batch, not the corpus.

`test_extend_matches_a_rebuild` is what makes the first two safe together -- the
incremental path is only worth having if it lands on the grouping a rebuild
would.

Everything runs against a temporary database pair. No media, no config.toml.
"""

from __future__ import annotations

import hashlib
import sqlite3

import pytest

from archive.pipeline.capture_time import SORT_KEY_UNDATED
from archive.pipeline.group import (
    NEAR_BAND_BITS,
    NEAR_BANDS,
    NEAR_MAX_DISTANCE,
    Components,
    GroupRefused,
    Kept,
    Work,
    distance,
    extend,
    pair_key,
    rebuild,
)

EXIF = "exif:DateTimeOriginal"


def sha_of(seed: str) -> str:
    return hashlib.sha256(seed.encode()).hexdigest()


def phash_of(seed: str) -> int:
    """A 64-bit value that spreads across the bands the way a real pHash does.

    A counter would not: 0..29,999 all share their top 48 bits, which puts the
    whole corpus in three chunks and measures the wrong thing. Signed, because
    that is how SQLite stores a 64-bit integer and how `features.phash` arrives.
    """
    return int.from_bytes(hashlib.sha256(seed.encode()).digest()[:8], "big", signed=True)


def add(
    conn: sqlite3.Connection,
    seed: str,
    *,
    paths: tuple[str, ...] = (),
    ext: str = ".jpg",
    kind: str = "image",
    state: str = "published",
    width: int | None = 4000,
    height: int | None = 3000,
    size: int = 1000,
    taken_at: str | None = "2019-07-04T12:00:00",
    taken_src: str | None = EXIF,
    phash: int | None = None,
) -> str:
    """One `file` row in the tile-eligible state, plus the paths it is known by."""
    sha256 = sha_of(seed)
    conn.execute(
        "INSERT INTO file (sha256, size, ext, kind, width, height, taken_at, taken_src, "
        "phash, state, feature_ver) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '{}')",
        (sha256, size, ext, kind, width, height, taken_at, taken_src, phash, state),
    )
    for relative in paths:
        conn.execute(
            "INSERT INTO origin (path, root, ext, size, sha256, seen_at) "
            "VALUES (?, 'r', ?, ?, ?, 'now')",
            ("G:\\photos\\" + relative, ext, size, sha256),
        )
    return sha256


def lumix(conn: sqlite3.Connection, number: int, *, directory: str = "lumix\\108_PANA") -> tuple:
    """One Lumix actuation: `P108xxxx.JPG` beside `P108xxxx.RW2`, same second."""
    stem = f"P108{number:04d}"
    taken = f"2019-07-04T12:{number % 60:02d}:00"
    return (
        add(
            conn,
            f"{stem}.jpg",
            paths=(f"{directory}\\{stem}.JPG",),
            ext=".jpg",
            kind="image",
            width=4592,
            height=3448,
            size=5_000_000,
            taken_at=taken,
        ),
        add(
            conn,
            f"{stem}.rw2",
            paths=(f"{directory}\\{stem}.RW2",),
            ext=".rw2",
            kind="raw_image",
            width=4608,
            height=3456,
            size=20_000_000,
            taken_at=taken,
        ),
    )


def tiles(conn: sqlite3.Connection) -> set[str]:
    return {row[0] for row in conn.execute("SELECT rep_sha256 FROM photo")}


def members_of(conn: sqlite3.Connection, rep: str) -> set[str]:
    return {
        row[0]
        for row in conn.execute(
            "SELECT m.sha256 FROM photo_member m JOIN photo p ON p.id = m.photo_id "
            "WHERE p.rep_sha256 = ?",
            (rep,),
        )
    }


def grouping(conn: sqlite3.Connection) -> set[frozenset[str]]:
    """The grouping alone, with no dependence on which id a tile happens to hold."""
    found: dict[int, set[str]] = {}
    for sha256, photo_id in conn.execute("SELECT sha256, photo_id FROM photo_member"):
        found.setdefault(photo_id, set()).add(sha256)
    return {frozenset(members) for members in found.values()}


# --- the filter --------------------------------------------------------------


def test_only_published_files_become_tiles(conn: sqlite3.Connection) -> None:
    """A file in state 'excluded' or 'pending' is never a tile. The whole hole."""
    kept = add(conn, "kept", paths=("dcim\\IMG_0001.JPG",))
    excluded = add(conn, "junk", paths=("node_modules\\a.js",), state="excluded", ext=".js")
    pending = add(conn, "unseen", paths=("elsewhere\\b.png",), state="pending", ext=".png")

    rebuild(conn)

    assert tiles(conn) == {kept}
    reps = {row[0] for row in conn.execute("SELECT sha256 FROM photo_member")}
    assert excluded not in reps
    assert pending not in reps


def test_rebuild_refuses_an_empty_kept_set(conn: sqlite3.Connection) -> None:
    """Nothing published means Phase 4 has not run, not that the grid is empty."""
    add(conn, "junk", paths=("node_modules\\a.js",), state="excluded", ext=".js")
    with pytest.raises(GroupRefused):
        rebuild(conn)


def test_rebuild_replaces_a_stale_photo_table(conn: sqlite3.Connection) -> None:
    """The 146,034 rows on record today are one per file, and go."""
    kept = add(conn, "kept", paths=("dcim\\IMG_0001.JPG",))
    stale = add(conn, "stale", paths=("x\\y.js",), state="excluded", ext=".js")
    conn.execute("INSERT INTO photo (id, rep_sha256, sort_key) VALUES (9, ?, 'z')", (stale,))

    report = rebuild(conn)

    assert report.stale_tiles == 1
    assert tiles(conn) == {kept}


# --- RAW+JPEG pairing ---------------------------------------------------------


def test_raw_and_jpeg_on_one_stem_collapse_to_one_tile(conn: sqlite3.Connection) -> None:
    jpeg, raw = lumix(conn, 96)
    report = rebuild(conn)

    assert report.kept_files == 2
    assert report.tiles == 1
    assert report.collapsed == 1
    assert tiles(conn) == {raw}  # more pixels, more bytes
    assert members_of(conn, raw) == {jpeg, raw}


def test_the_same_stem_in_a_different_directory_is_a_different_photo(
    conn: sqlite3.Connection,
) -> None:
    """`(directory, stem)`, not stem. Two cards both number their frames from 1."""
    add(conn, "a", paths=("card1\\P1080096.JPG",), ext=".jpg")
    add(conn, "b", paths=("card2\\P1080096.RW2",), ext=".rw2", kind="raw_image")
    assert rebuild(conn).tiles == 2


def test_two_jpegs_on_one_stem_are_not_a_pair(conn: sqlite3.Connection) -> None:
    """Pairing is RAW+JPEG. Two stills sharing a stem are two photographs."""
    add(conn, "a", paths=("dir\\IMG_1.jpg",), ext=".jpg")
    add(conn, "b", paths=("dir\\IMG_1.jpeg",), ext=".jpeg")
    assert rebuild(conn).tiles == 2


def test_disagreeing_exif_refuses_the_pair(conn: sqlite3.Connection) -> None:
    """A shared stem is evidence; a four-hour gap says it is a name collision."""
    add(conn, "a", paths=("dir\\DSC0001.JPG",), ext=".jpg", taken_at="2019-07-04T12:00:00")
    add(
        conn,
        "b",
        paths=("dir\\DSC0001.ARW",),
        ext=".arw",
        kind="raw_image",
        taken_at="2019-07-04T16:00:00",
    )
    report = rebuild(conn)
    assert report.mixed_buckets == 1
    assert report.refused_by_exif == 1
    assert report.tiles == 2


def test_a_missing_exif_date_does_not_refuse_the_pair(conn: sqlite3.Connection) -> None:
    """Corroboration can only refuse. Absent evidence is not contrary evidence."""
    add(conn, "a", paths=("dir\\DSC0001.JPG",), ext=".jpg", taken_at=None, taken_src="none")
    add(conn, "b", paths=("dir\\DSC0001.ARW",), ext=".arw", kind="raw_image")
    assert rebuild(conn).tiles == 1


def test_an_mtime_date_is_not_exif_corroboration(conn: sqlite3.Connection) -> None:
    """`mtime` on this corpus is a copy date up to 26 years late. It cannot refuse."""
    add(
        conn,
        "a",
        paths=("dir\\DSC0001.JPG",),
        ext=".jpg",
        taken_at="2026-01-01T00:00:00",
        taken_src="mtime",
    )
    add(conn, "b", paths=("dir\\DSC0001.ARW",), ext=".arw", kind="raw_image")
    assert rebuild(conn).tiles == 1


def test_pairing_is_transitive_across_copies(conn: sqlite3.Connection) -> None:
    """One JPEG copied beside two different RAWs makes one component, not two."""
    jpeg = add(conn, "j", paths=("c1\\P1.JPG", "c2\\P1.JPG"), ext=".jpg")
    first = add(conn, "r1", paths=("c1\\P1.RW2",), ext=".rw2", kind="raw_image")
    second = add(conn, "r2", paths=("c2\\P1.RW2",), ext=".rw2", kind="raw_image")
    rebuild(conn)
    assert grouping(conn) == {frozenset({jpeg, first, second})}


# --- representative and sort_key ----------------------------------------------


def test_representative_prefers_pixels_then_bytes_then_exif(conn: sqlite3.Connection) -> None:
    small = add(conn, "s", paths=("d\\A.JPG",), ext=".jpg", width=100, height=100)
    large = add(conn, "l", paths=("d\\A.RW2",), ext=".rw2", kind="raw_image", width=400, height=400)
    rebuild(conn)
    assert tiles(conn) == {large}
    assert members_of(conn, large) == {small, large}


def test_unedited_beats_edited() -> None:
    """Editedness outranks pixel count, which is what "beats" has to mean."""
    edited = Kept("a" * 64, 9_000_000, ".jpg", "image", 4000, 4000, None, None, None, 1, 1)
    plain = Kept("b" * 64, 1, ".rw2", "raw_image", 100, 100, None, None, None, 1, 0)
    assert edited.edited and not plain.edited
    assert max([edited, plain], key=lambda file: file.rank) is plain


def test_one_clean_name_is_enough_to_be_unedited(conn: sqlite3.Connection) -> None:
    add(conn, "a", paths=("d\\A-edited.JPG", "backup\\A.JPG"))
    add(conn, "b", paths=("d\\B-edited.JPG",))
    assert rebuild(conn).edited_files == 1


def test_an_edit_marker_is_a_whole_token(conn: sqlite3.Connection) -> None:
    """`credit` is not an edit and `Reddit` is not a retouch."""
    add(conn, "a", paths=("d\\bank credit statement.jpg",))
    add(conn, "b", paths=("d\\Reddit screenshot.jpg",))
    assert rebuild(conn).edited_files == 0


def test_sort_key_is_the_earliest_capture_time_in_the_group(conn: sqlite3.Connection) -> None:
    add(conn, "a", paths=("d\\A.JPG",), ext=".jpg", taken_at="2019-07-04T12:00:01")
    add(conn, "b", paths=("d\\A.RW2",), ext=".rw2", kind="raw_image", taken_at="2019-07-04T12:00:00")
    rebuild(conn)
    assert conn.execute("SELECT sort_key FROM photo").fetchone()[0] == "2019-07-04T12:00:00"


def test_sort_key_is_never_a_rank(conn: sqlite3.Connection) -> None:
    """Every key is a timestamp or the sentinel -- never a position in a list."""
    add(conn, "a", paths=("d\\A.JPG",), taken_at="2019-07-04T12:00:00")
    add(conn, "b", paths=("d\\B.JPG",), taken_at=None, taken_src="none")
    rebuild(conn)
    keys = sorted(row[0] for row in conn.execute("SELECT sort_key FROM photo"))
    assert keys == [SORT_KEY_UNDATED, "2019-07-04T12:00:00"]


def test_keyset_paging_is_totally_ordered(conn: sqlite3.Connection) -> None:
    """(sort_key, id) is unique, so a keyset page can never repeat or skip a tile."""
    for number in range(20):
        lumix(conn, number)
    rebuild(conn)
    pairs = conn.execute("SELECT sort_key, id FROM photo").fetchall()
    assert len(set(pairs)) == len(pairs)

    walked, cursor = [], None
    while True:
        page = conn.execute(
            "SELECT sort_key, id FROM photo "
            + ("WHERE (sort_key, id) < (?, ?) " if cursor else "")
            + "ORDER BY sort_key DESC, id DESC LIMIT 3",
            cursor or (),
        ).fetchall()
        if not page:
            break
        walked.extend(page)
        cursor = page[-1]
    assert walked == sorted(pairs, key=lambda pair: (pair[0], pair[1]), reverse=True)


def test_rebuild_is_idempotent(conn: sqlite3.Connection) -> None:
    for number in range(10):
        lumix(conn, number)
    rebuild(conn)
    first = conn.execute("SELECT id, rep_sha256, sort_key FROM photo ORDER BY id").fetchall()
    rebuild(conn)
    assert (
        conn.execute("SELECT id, rep_sha256, sort_key FROM photo ORDER BY id").fetchall() == first
    )


# --- near-duplicates: stored, and collapsing nothing ---------------------------


def test_near_duplicates_are_stored_and_do_not_collapse_tiles(conn: sqlite3.Connection) -> None:
    """Burst frames group in `near_dup` and stay separate photographs in `photo`."""
    base = 0x0123456789ABCDEF
    add(conn, "a", paths=("d\\A.JPG",), phash=base)
    add(conn, "b", paths=("d\\B.JPG",), phash=base ^ 0b111)  # distance 3
    add(conn, "c", paths=("d\\C.JPG",), phash=~base)  # the far side of the hash

    report = rebuild(conn)

    assert report.tiles == 3
    assert report.near_groups == 1
    assert report.near_files == 2
    groups = dict(conn.execute("SELECT sha256, group_id FROM near_dup"))
    assert groups[sha_of("a")] == groups[sha_of("b")]
    assert sha_of("c") not in groups


def test_a_file_with_no_neighbour_has_no_near_dup_row(conn: sqlite3.Connection) -> None:
    add(conn, "a", paths=("d\\A.JPG",), phash=0x0123456789ABCDEF)
    rebuild(conn)
    assert conn.execute("SELECT count(*) FROM near_dup").fetchone()[0] == 0


def test_distance_handles_the_sign_bit(conn: sqlite3.Connection) -> None:
    """SQLite stores a 64-bit hash signed. `-1` and `0` differ in 64 bits, not one."""
    assert distance(-1, 0) == 64
    assert distance(-1, -2) == 1


# --- the incremental guarantee -------------------------------------------------


def test_extend_forms_its_own_tile(conn: sqlite3.Connection) -> None:
    lumix(conn, 1)
    rebuild(conn)
    fresh = add(conn, "new", paths=("other\\NEW.JPG",))
    extend(conn, [fresh])
    assert members_of(conn, fresh) == {fresh}


def test_extend_joins_an_existing_tile(conn: sqlite3.Connection) -> None:
    jpeg, raw = lumix(conn, 1)
    rebuild(conn)
    before = conn.execute("SELECT id FROM photo").fetchone()[0]

    second = add(
        conn,
        "extra",
        paths=("lumix\\108_PANA\\P1080001.jpeg",),
        ext=".jpeg",
        width=100,
        height=100,
        size=1,
        taken_at="2019-07-04T12:01:00",
    )
    extend(conn, [second])

    assert conn.execute("SELECT count(*) FROM photo").fetchone()[0] == 1
    assert members_of(conn, raw) == {jpeg, raw, second}
    assert conn.execute("SELECT id FROM photo").fetchone()[0] == before


def test_extend_merges_two_tiles(conn: sqlite3.Connection) -> None:
    """A JPEG that lands beside two already-separate RAWs makes them one photograph."""
    first = add(conn, "r1", paths=("c1\\P1.RW2",), ext=".rw2", kind="raw_image")
    second = add(conn, "r2", paths=("c2\\P1.RW2",), ext=".rw2", kind="raw_image")
    rebuild(conn)
    assert conn.execute("SELECT count(*) FROM photo").fetchone()[0] == 2

    bridge = add(conn, "j", paths=("c1\\P1.JPG", "c2\\P1.JPG"), ext=".jpg")
    extend(conn, [bridge])

    assert conn.execute("SELECT count(*) FROM photo").fetchone()[0] == 1
    assert grouping(conn) == {frozenset({first, second, bridge})}


def test_extend_matches_a_rebuild(conn: sqlite3.Connection) -> None:
    """The incremental path lands on the grouping the whole-corpus build would."""
    for number in range(30):
        lumix(conn, number)
    rebuild(conn)

    # 5 is a second JPEG beside an existing pair and joins it; 30 and 31 are new
    # actuations. All three carry hashes within Hamming 3 of one another, so the
    # near-duplicate grouping is exercised too.
    fresh = [
        add(
            conn,
            f"late{number}",
            paths=(f"lumix\\108_PANA\\P108{number:04d}.jpeg",),
            ext=".jpeg",
            width=100,
            height=100,
            size=1,
            taken_at=f"2019-07-04T12:{number % 60:02d}:00",
            phash=0x0F0F0F0F0F0F0F0F ^ bit,
        )
        for number, bit in ((5, 0), (30, 1), (31, 2))
    ]
    extend(conn, fresh)
    incremental = grouping(conn)
    near_incremental = {
        frozenset(row[0] for row in conn.execute("SELECT sha256 FROM near_dup WHERE group_id = ?", (g,)))
        for (g,) in conn.execute("SELECT DISTINCT group_id FROM near_dup")
    }

    rebuild(conn)
    assert grouping(conn) == incremental
    assert {
        frozenset(row[0] for row in conn.execute("SELECT sha256 FROM near_dup WHERE group_id = ?", (g,)))
        for (g,) in conn.execute("SELECT DISTINCT group_id FROM near_dup")
    } == near_incremental


# The whole-corpus rebuild reads, per file, its `file` row and its `origin` rows.
# The incremental path reads that plus the components it touches, and nothing
# else. 40 rows per new photo is generous for a corpus whose largest genuine
# component is a handful of files -- and it is three orders of magnitude below
# the corpus, which is the property being asserted.
ROWS_PER_NEW_PHOTO = 40


def test_incremental_work_is_proportional_to_the_batch(conn: sqlite3.Connection) -> None:
    """Adding 100 photos to a 30,000-photo catalog costs the 100, not the 30,100.

    This is the test that keeps "adding a folder is fast" true once features
    exist. It is stated in rows read rather than seconds, because a wall clock
    cannot tell a batch-sized pass from a corpus-sized one on a fast disk.
    """
    existing = [
        (
            sha_of(f"bulk{n}"),
            1000,
            ".jpg",
            "image",
            4000,
            3000,
            f"2019-07-04T12:00:{n % 60:02d}",
            EXIF,
            phash_of(f"bulk{n}"),
            "published",
            "{}",
        )
        for n in range(30_000)
    ]
    # One transaction: the connection autocommits, and 60,000 separate WAL
    # commits is a minute of fsync that has nothing to do with what is measured.
    conn.execute("BEGIN")
    conn.executemany(
        "INSERT INTO file (sha256, size, ext, kind, width, height, taken_at, taken_src, "
        "phash, state, feature_ver) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        existing,
    )
    conn.executemany(
        "INSERT INTO origin (path, root, ext, size, sha256, seen_at) "
        "VALUES (?, 'r', '.jpg', 1000, ?, 'now')",
        [(f"G:\\photos\\bulk\\{n}\\IMG_{n}.JPG", sha_of(f"bulk{n}")) for n in range(30_000)],
    )
    conn.execute("COMMIT")
    full = rebuild(conn)
    assert full.tiles == 30_000
    assert full.work.examined >= 60_000  # one `file` row and one `origin` row each

    conn.execute("BEGIN")
    fresh = [
        add(
            conn,
            f"fresh{n}",
            paths=(f"bulk\\{n}\\IMG_{n}.RW2",),
            ext=".rw2",
            kind="raw_image",
            width=100,
            height=100,
            size=1,
            taken_at=f"2019-07-04T12:00:{n % 60:02d}",
            phash=phash_of(f"fresh{n}"),
        )
        for n in range(100)
    ]
    conn.execute("COMMIT")
    work = extend(conn, fresh)

    assert work.examined <= len(fresh) * ROWS_PER_NEW_PHOTO
    assert work.examined < full.work.examined / 10
    # And it did the grouping, rather than being cheap by doing nothing.
    assert conn.execute("SELECT count(*) FROM photo").fetchone()[0] == 30_000


# --- the small pieces ----------------------------------------------------------


@pytest.mark.parametrize(
    "path, expected",
    [
        ("G:\\photos\\lumix\\DCIM\\P1080096.RW2", "g:\\photos\\lumix\\dcim\\p1080096"),
        ("G:\\photos\\a\\b.tar.gz", "g:\\photos\\a\\b.tar"),
        ("G:\\photos\\a\\.gitignore", "g:\\photos\\a\\.gitignore"),
        ("G:\\photos\\a\\noext", "g:\\photos\\a\\noext"),
    ],
)
def test_pair_key(path: str, expected: str) -> None:
    assert pair_key(path) == expected


def test_components_root_does_not_depend_on_edge_order() -> None:
    left, right = Components(), Components()
    left.union("a", "b")
    left.union("b", "c")
    right.union("c", "b")
    right.union("b", "a")
    assert left.groups() == right.groups()


def test_near_threshold_is_what_the_bands_can_prove() -> None:
    """N bands are complete only up to Hamming N-1, and must cover all 64 bits.

    Raising the threshold without adding bands starts missing pairs silently, so
    the pigeonhole argument is asserted rather than left in a comment.
    """
    assert NEAR_MAX_DISTANCE == NEAR_BANDS - 1
    assert NEAR_BANDS * NEAR_BAND_BITS == 64


def test_work_starts_at_zero() -> None:
    assert Work().examined == 0
