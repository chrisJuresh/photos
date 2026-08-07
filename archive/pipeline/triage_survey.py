"""Builds the triage survey: the projection the rule engine actually reads.

Pure database work over `origin` and `file`, no I/O against any media root. It
derives five tables (`migrations/005_triage_survey.sql` says what each is for)
and then the rule engine never looks at `origin` again except to page a contact
sheet.

Why a projection exists at all, measured on the real 1,374,328-row corpus:

    twelve LIKE '%\\segment\\%' over origin.path        2,914 ms
    the same twelve over the 315,680 distinct dirs        548 ms
    the same twelve as triage_dir_segment index seeks       4 ms

and, separately, folding a verdict over every path costs ~470 ms no matter how
cheap the predicate is -- so the counting surface has to be smaller than the
path list. `triage_bucket` is one row per distinct *predicate tuple*: 1,374,328
paths collapse to ~440,000 buckets, and the aggregate lands in 79 ms.

Rebuild it whenever the catalog changes -- after `capture_time`, after the
dimension probe. It is a truncate-and-rewrite, not an incremental update, and
it holds no decisions: `state.sqlite3` is untouched, and dropping every row
here loses nothing that a re-run does not restore.
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
import time
from pathlib import Path

from photolib import db, migrate

TABLES = (
    "triage_path",
    "triage_bucket",
    "triage_segment",
    "triage_dir_segment",
    "triage_dir",
    "triage_ext",
    "triage_root",
)

# Paths are `G:\photos\<root>\...`; the two leading components are the same for
# every row and would be a segment matching the whole corpus.
SKIP_LEADING_SEGMENTS = 2


def split_dir(path: str) -> str:
    """The directory holding `path`. Backslash only -- these are NTFS paths."""
    head, sep, _ = path.rpartition("\\")
    return head if sep else path


def segments(dir_path: str) -> list[str]:
    """The directory names in `dir_path`, lowercased, drive and root dropped.

    Lowercased because NTFS is case-insensitive and `AppData` is written three
    ways across this corpus. Deduplicated because a segment repeating in one
    path -- `...\\node_modules\\x\\node_modules\\y` -- is one directory, and
    counting it twice would make the rollup lie.
    """
    parts = [p for p in dir_path.split("\\") if p]
    return sorted({p.lower() for p in parts[SKIP_LEADING_SEGMENTS:]})


def build(conn: sqlite3.Connection, *, progress=None) -> dict[str, int]:
    """Rewrite every survey table from `origin` and `file`. Returns row counts.

    One transaction: a half-built survey would silently under-count, and an
    under-count is the failure mode that looks like a successful triage.
    """
    say = progress or (lambda _message: None)

    started = time.perf_counter()
    files = {
        sha: (kind, width, height, max(width or 0, height or 0) or None, 1 if camera else 0)
        for sha, kind, width, height, camera in conn.execute(
            "SELECT sha256, kind, width, height, camera IS NOT NULL FROM file"
        )
    }
    say(f"file      {len(files):,} rows read ({time.perf_counter() - started:.1f}s)")

    started = time.perf_counter()
    dirs: dict[str, int] = {}
    exts: dict[str, int] = {}
    roots: dict[str, int] = {}
    buckets: dict[tuple, int] = {}
    bucket_rows: list[list] = []
    dir_segment: list[tuple[str, int]] = []
    paths: list[tuple[int, int]] = []
    # Segment rollup accumulated during the walk rather than as a later GROUP BY
    # over 2.9M rows joined to the buckets.
    seg_dirs: dict[str, int] = {}
    seg_paths: dict[str, list[int]] = {}

    for origin_id, path, root, ext, size, sha in conn.execute(
        "SELECT id, path, root, ext, size, sha256 FROM origin"
    ):
        directory = split_dir(path)
        dir_id = dirs.get(directory)
        if dir_id is None:
            dir_id = dirs[directory] = len(dirs) + 1
            for seg in segments(directory):
                dir_segment.append((seg, dir_id))
                seg_dirs[seg] = seg_dirs.get(seg, 0) + 1

        ext_key = (ext or "").lower()
        ext_id = exts.get(ext_key)
        if ext_id is None:
            ext_id = exts[ext_key] = len(exts) + 1
        root_key = (root or "").lower()
        root_id = roots.get(root_key)
        if root_id is None:
            root_id = roots[root_key] = len(roots) + 1

        kind, width, height, long_edge, camera = files.get(sha, (None, None, None, None, 0))
        key = (dir_id, root_id, ext_id, kind, width, height, long_edge, camera)
        bucket_id = buckets.get(key)
        if bucket_id is None:
            bucket_id = buckets[key] = len(buckets) + 1
            bucket_rows.append([bucket_id, *key, 0, 0])
        row = bucket_rows[bucket_id - 1]
        row[9] += 1
        row[10] += size
        paths.append((origin_id, bucket_id))

        for seg in segments(directory):
            tally = seg_paths.get(seg)
            if tally is None:
                tally = seg_paths[seg] = [0, 0]
            tally[0] += 1
            tally[1] += size
    say(
        f"walk      {len(paths):,} paths, {len(dirs):,} directories, "
        f"{len(buckets):,} buckets ({time.perf_counter() - started:.1f}s)"
    )

    started = time.perf_counter()
    conn.execute("BEGIN")
    for table in TABLES:
        conn.execute(f"DELETE FROM {table}")
    conn.executemany(
        "INSERT INTO triage_dir (id, path, path_key) VALUES (?, ?, ?)",
        ((dir_id, path, path.lower()) for path, dir_id in dirs.items()),
    )
    conn.executemany("INSERT INTO triage_dir_segment (seg, dir_id) VALUES (?, ?)", dir_segment)
    conn.executemany(
        "INSERT INTO triage_ext (id, ext) VALUES (?, ?)",
        ((ext_id, ext) for ext, ext_id in exts.items()),
    )
    conn.executemany(
        "INSERT INTO triage_root (id, root) VALUES (?, ?)",
        ((root_id, root) for root, root_id in roots.items()),
    )
    conn.executemany(
        "INSERT INTO triage_segment (seg, dirs, paths, bytes) VALUES (?, ?, ?, ?)",
        ((seg, seg_dirs[seg], count, size) for seg, (count, size) in seg_paths.items()),
    )
    conn.executemany(
        "INSERT INTO triage_bucket "
        "(id, dir_id, root_id, ext_id, kind, width, height, long_edge, camera, paths, bytes) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        bucket_rows,
    )
    conn.executemany("INSERT INTO triage_path (origin_id, bucket_id) VALUES (?, ?)", paths)
    conn.execute("COMMIT")
    say(f"write     committed ({time.perf_counter() - started:.1f}s)")

    return {
        "dirs": len(dirs),
        "dir_segments": len(dir_segment),
        "segments": len(seg_paths),
        "extensions": len(exts),
        "roots": len(roots),
        "buckets": len(buckets),
        "paths": len(paths),
    }


def run(catalog_db: Path | None = None, state_db: Path | None = None) -> int:
    conn = db.connect(catalog_db, state_db)
    try:
        if migrate.version(conn, "main") < 5:
            raise SystemExit("catalog schema is behind; run python -m photolib.migrate first")
        started = time.perf_counter()
        counts = build(conn, progress=lambda message: print(message, flush=True))
        elapsed = time.perf_counter() - started
        print(f"\nsurvey    rebuilt in {elapsed:.1f}s")
        for name, value in counts.items():
            print(f"  {name:<14}{value:>12,}")
        collapse = counts["paths"] / max(counts["buckets"], 1)
        print(
            f"\n          the counting surface is {counts['buckets']:,} buckets for "
            f"{counts['paths']:,} paths ({collapse:.1f}x)"
        )
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    argparse.ArgumentParser(description=__doc__.splitlines()[0]).parse_args()
    sys.exit(run())
