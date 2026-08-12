"""Synthetic catalogs for the grid tests and the benchmark.

No real media and no path from config.toml. Thumbnails come from a base64
constant rather than a committed file: .gitignore excludes every raster format,
which is the correct constraint here rather than something to work around with
`git add -f`.

The sort_key distribution matters more than the row count. Paging cost is
entirely about ties — the real catalog holds 146,034 rows over 27,076 distinct
keys with a largest tie of 9,143 — so a uniform distribution would exercise the
one thing keyset paging is easy at and skip the one thing it is hard at.
"""

from __future__ import annotations

import base64
import hashlib
import json
import random
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

from photolib import browse, migrate
from photolib.config import substrate_path, thumb_path

# A 2x2 lossless WebP. Small enough to write thousands of, real enough that the
# browser performs an actual decode.
TINY_WEBP = base64.b64decode(
    "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=="
)

UNDATED = "-"


def sha_of(seed: str) -> str:
    """A stable 64-char hex string. Reads as a hash without pretending to be one."""
    return hashlib.sha256(seed.encode()).hexdigest()


def insert(
    conn: sqlite3.Connection,
    rows: list[tuple[int, str, str, str, int | None, int | None, bytes | None]],
) -> None:
    """Insert (photo_id, sha, kind, sort_key, width, height, thumbhash) rows."""
    conn.execute("BEGIN")
    conn.executemany(
        "INSERT INTO file (sha256, size, ext, kind, width, height, thumbhash, "
        "vault_relpath, state, feature_ver) "
        "VALUES (?, 1, '.jpg', ?, ?, ?, ?, ?, 'adopted', 'test')",
        [
            (sha, kind, width, height, thumbhash, f"objects\\{sha[:2]}\\{sha}.blob")
            for _, sha, kind, _, width, height, thumbhash in rows
        ],
    )
    conn.executemany(
        "INSERT INTO photo (id, rep_sha256, sort_key) VALUES (?, ?, ?)",
        [(photo_id, sha, sort_key) for photo_id, sha, _, sort_key, _, _, _ in rows],
    )
    conn.execute("COMMIT")


def corpus(
    catalog_db: Path,
    state_db: Path,
    *,
    count: int = 1_000,
    tie: int = 0,
    seed: int = 20260801,
) -> list[tuple[int, str, str, str, int | None, int | None, bytes | None]]:
    """A migrated pair holding `count` still photos, `tie` of them on one key.

    Returns the rows it inserted, so a test can compute the expected ordering
    from the source rather than from the endpoint under test.
    """
    migrate.apply(catalog_db, state_db)
    rng = random.Random(seed)
    shapes = [(4000, 3000), (3000, 4000), (1920, 1080), (1080, 1920), (2000, 2000)]

    rows = []
    for index in range(count):
        if index < tie:
            sort_key = "2019-07-04T11:22:33"
        else:
            sort_key = f"20{20 + index % 6:02d}-{1 + index % 12:02d}-{1 + index % 28:02d}T00:00:00"
        width, height = shapes[index % len(shapes)]
        rows.append(
            (
                index + 1,
                sha_of(f"photo-{seed}-{index}"),
                "raw_image" if index % 9 == 0 else "image",
                sort_key,
                width,
                height,
                None,
            )
        )
    rng.shuffle(rows)
    rows = [(index + 1, *rest[1:]) for index, rest in enumerate(rows)]

    conn = sqlite3.connect(catalog_db)
    try:
        insert(conn, rows)
    finally:
        conn.close()
    return rows


# One burst: a three-frame bracket, a second body shooting through it, and a
# lone frame half a minute later. That is the shape the real corpus's 3/6/9/12
# spine is made of, and the second body is what proves a stack belongs to one
# camera rather than to one moment.
#
# The two readings are what the cover rule ranks on, and both sets are chosen so
# that a wrong rule draws a visibly different tile. Cam A is a real bracket --
# three exposures, and its *brightest* frame is its sharpest -- so plain
# sharpest, brightest, and first-in-the-page's-order each name a different frame
# from the middle-exposure one. Cam B's two frames share an exposure, which is
# the case the rule degrades to plain sharpest for, and the sharper of them is
# the older, so first-in-order cannot pass for that either.
#
# (camera, seconds into the burst, taken_src, stack, luminance, sharpness)
BURST_PLAN = (
    ("Cam A", 0, "exif:DateTimeOriginal", "bracket", 0.20, 0.40),
    ("Cam A", 1, "exif:DateTimeOriginal", "bracket", 0.50, 0.70),
    ("Cam A", 2, "exif:DateTimeOriginal", "bracket", 0.80, 0.95),
    ("Cam B", 0, "exif:DateTimeOriginal", "second body", 0.50, 0.60),
    ("Cam B", 1, "exif:DateTimeOriginal", "second body", 0.50, 0.30),
    ("Cam C", 30, "exif:DateTimeOriginal", "lone", 0.50, 0.10),
)

# Every seventh burst also carries a frame `capture_time` dated from mtime --
# same body, chronologically inside the bracket. `photolib.membership` places no
# such frame, because a copy date is not when the photograph was taken, so it
# reaches the grid as a stack of one and must not split the bracket around it. It
# is also the sharpest frame in the burst, so a cover rule that read past a
# stack's own members would draw it.
GUESSED = ("Cam A", 1, "mtime", "guessed", 0.65, 0.99)

# The 16 bins `archive/pipeline/features.py` cuts the 0-1 luma into.
BINS = 16

# Where the bracket's over-exposed frame sits in the plan, and which bursts had
# its quality pass fail. Phase 2b persists a failure as `{"error": ...}` and no
# scalars at all, so that frame cannot be ranked -- and it is the sharpest of
# its bracket, so a rule that read a missing scalar as a low one, or as no
# obstacle, would draw it. Not the first burst, which is the one the readable
# bracket is demonstrated on.
BRIGHTEST = 2
FAILED = json.dumps({"error": "decode failed"})


def brightest_failed(group: int) -> bool:
    """Whether this burst's over-exposed frame has no quality scalars at all."""
    return group % 5 == 3


def quality(luminance: float, sharpness: float) -> str:
    """The `file.quality` JSON of a frame, holding what the cover rule reads.

    The whole histogram's mass sits in the bin `luminance` falls in, so the mean
    it yields is that bin's midpoint: the ordering is exact and the value is
    quantised to 1/16, which is all a corpus for a ranking needs. Two frames
    given the same luminance therefore read as exactly the same exposure, which
    is the case that matters.
    """
    histogram = [0.0] * BINS
    histogram[min(int(luminance * BINS), BINS - 1)] = 1.0
    return json.dumps({"luminance_histogram": histogram, "sharpness": sharpness})


# Bursts are an hour apart, which is the fence's own ceiling, so no two of them
# are in one run and the expected grouping is a property of the plan alone.
BURST_SPACING = 3600
BURST_START = "2025-05-01T12:00:00"


def bursts(catalog_db: Path, state_db: Path, *, groups: int = 12) -> list[tuple]:
    """A migrated pair holding `groups` bursts, and the grouping they must yield.

    Returns (photo_id, sha, camera, sort_key, taken_src, stack, size, luminance,
    sharpness) per row, where `stack` names the set the row belongs to and the last
    two are what the cover rule ranks on -- both None for the frames whose quality
    pass failed. A test computes what it expects from that rather than from the
    endpoint it is testing.

    The grouping is *stored*, as it is in the real catalog: each named set becomes
    `stack_member` rows at `browse.STACK_SETTING`, keyed the way
    `photolib.membership` writes them, and the mtime-dated frame gets none. So the
    grid here reads the same table it reads live, and a test that narrows the view
    is asking the question ticket 41 is about.

    File sizes are scattered rather than ascending, so an alternate sort really
    does interleave the members of a stack -- which is the whole reason the
    non-time sorts cannot collapse runs as they page.
    """
    migrate.apply(catalog_db, state_db)
    start = datetime.fromisoformat(BURST_START)
    shapes = [(4000, 3000), (3000, 4000), (2000, 2000)]

    rows = []
    for group in range(groups):
        plan = list(BURST_PLAN) + ([GUESSED] if group % 7 == 0 else [])
        for index, (camera, offset, taken_src, stack, luminance, sharpness) in enumerate(plan):
            photo_id = len(rows) + 1
            when = start + timedelta(seconds=group * BURST_SPACING + offset)
            failed = index == BRIGHTEST and brightest_failed(group)
            rows.append(
                (
                    photo_id,
                    sha_of(f"burst-{photo_id}"),
                    camera,
                    when.strftime("%Y-%m-%dT%H:%M:%S"),
                    taken_src,
                    f"{group}:{stack}",
                    (photo_id * 37) % 997 + 1,
                    None if failed else luminance,
                    None if failed else sharpness,
                )
            )

    conn = sqlite3.connect(catalog_db)
    try:
        conn.execute("BEGIN")
        for photo_id, sha, camera, sort_key, taken_src, _, size, lum, sharp in rows:
            width, height = shapes[photo_id % len(shapes)]
            conn.execute(
                "INSERT INTO file (sha256, size, ext, kind, width, height, taken_at, "
                "taken_src, camera, quality, vault_relpath, state, feature_ver) "
                "VALUES (?, ?, '.jpg', 'image', ?, ?, ?, ?, ?, ?, ?, 'adopted', 'test')",
                (sha, size, width, height, sort_key, taken_src, camera,
                 FAILED if lum is None else quality(lum, sharp),
                 f"objects\\{sha[:2]}\\{sha}.blob"),
            )
            conn.execute(
                "INSERT INTO photo (id, rep_sha256, sort_key) VALUES (?, ?, ?)",
                (photo_id, sha, sort_key),
            )
        place(conn, rows)
        conn.execute("COMMIT")
    finally:
        conn.close()
    return rows


def place(conn: sqlite3.Connection, rows) -> None:
    """Store the grouping `rows` names, the way `photolib.membership` stores it.

    A frame the plan dated from the filesystem is left out entirely: membership never
    places one, and the grid draws such a tile as a stack of one on the strength of
    its absence.
    """
    stacks: dict[str, list[tuple]] = {}
    for _, sha, _, sort_key, taken_src, stack, *_rest in rows:
        if taken_src.startswith("exif:"):
            stacks.setdefault(stack, []).append((sort_key, sha))
    store_membership(
        conn, [[sha for _, sha in sorted(members)] for members in stacks.values()]
    )


def store_membership(conn: sqlite3.Connection, stacks, **knobs) -> None:
    """Write `stack_member` rows for each stack, earliest member first.

    The one place a test corpus says what the grid reads: the setting is
    `browse.STACK_SETTING`, which `photolib.membership` is asserted to agree with, and
    a stack is named by its earliest member's sha256 — read off the sequence rather
    than invented, exactly as the pass reads it off the run.

    `knobs` overrides part of that setting, so a corpus can hold a second population
    the way the real table does — two assignments of the same frames, each readable
    as its own setting's.
    """
    setting = {**browse.STACK_SETTING, **knobs}
    conn.executemany(
        "INSERT INTO stack_member (method, version, strictness, linkage, ceiling, "
        "sha256, stack) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            (*setting.values(), sha, members[0])
            for members in stacks
            for sha in members
        ],
    )


def expected_order(rows) -> list[int]:
    """The ids in the order the grid must return them, computed from the source."""
    return [row[0] for row in sorted(rows, key=lambda row: (row[3], row[0]), reverse=True)]


def write_thumbnails(thumb_root: Path, shas) -> int:
    """Materialise a thumbnail for each sha. Returns how many were written."""
    return _write_webp(thumb_path, thumb_root, shas)


def write_substrates(substrate_root: Path, shas) -> int:
    """Materialise a 1536px substrate for each sha. Returns how many were written.

    The bytes are the same 2x2 WebP a thumbnail gets: the tier a test is looking
    at is decided by which tree the file is in, not by its dimensions.
    """
    return _write_webp(substrate_path, substrate_root, shas)


def _write_webp(path_of, root: Path, shas) -> int:
    written = 0
    for sha in shas:
        path = path_of(root, sha)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(TINY_WEBP)
        written += 1
    return written
