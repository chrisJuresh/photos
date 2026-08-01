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
import random
import sqlite3
from pathlib import Path

from photolib import migrate
from photolib.thumbnails import thumb_path

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


def expected_order(rows) -> list[int]:
    """The ids in the order the grid must return them, computed from the source."""
    return [row[0] for row in sorted(rows, key=lambda row: (row[3], row[0]), reverse=True)]


def write_thumbnails(thumb_root: Path, shas) -> int:
    """Materialise a thumbnail for each sha. Returns how many were written."""
    written = 0
    for sha in shas:
        path = thumb_path(thumb_root, sha)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(TINY_WEBP)
        written += 1
    return written
