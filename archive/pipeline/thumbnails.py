"""Copies MediaVault's 384px WebP derivatives onto the NVMe as grid thumbnails.

`PLAN.md` § "Storage layout" puts the grid thumbnail at
`E:\\photolib\\thumb\\<aa>\\<sha256>.webp` -- *adopted from MediaVault, not
regenerated*. This module is that adoption and nothing else. It decodes nothing,
encodes nothing, and creates no thumbnail that does not already exist: the
42,827 assets whose 384px derivative errored in v1 stay without one, and are
step 12's problem.

Nothing is adopted on the strength of a database row. Every file is hashed and
compared against the `checksum_sha256` the manifest records for it before it is
accepted, which is the same rule Phase 2a applies to the objects themselves. A
byte that does not verify is not copied and is counted as a mismatch -- distinct
from a file that is simply absent, which is the expected shape of the error rows
and not a fault.

Concurrency runs the *other* way from the bulk media passes. 103,207 files
averaging 9.8 KB is latency-bound, not bandwidth-bound: step 3 measured this
volume at 41 small reads/s serial against 86/s at 32 threads, and listing shards
at 101/s against 394/s. One reader is right for step 9's 420 GB sequential hash
and wrong here. The writes land on the NVMe, where they are not the constraint.

Re-running copies only what is absent. The thumbnail tree is enumerated once and
every sha256 already present is skipped, so an interrupted pass resumes rather
than repeating; each file is written to a `.part` beside its target and renamed,
so an interruption cannot leave a truncated thumbnail that the next run would
mistake for a finished one.
"""

from __future__ import annotations

import argparse
import collections
import hashlib
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from photolib.adopt_mediavault import open_manifest
from photolib.config import Config, load

LONG_EDGE = 384  # the grid tile. The other four tiers belong to later steps.
READ_WORKERS = 32
PROGRESS_SECONDS = 30

# `relative_path_text` is relative to this, not to mediavault_root.
DERIVATIVE_SUBDIR = "derivatives"


def thumb_path(thumb_root: Path, sha256: str) -> Path:
    """`<thumb_root>\\<aa>\\<sha256>.webp` -- one shard level, not two.

    256 directories of ~400 files. The vault's two-level fan-out exists for
    hundreds of thousands of objects on a spinning disk; this tree is smaller
    and lives on NVMe, and `PLAN.md` spells it with one level.
    """
    return thumb_root / sha256[:2] / f"{sha256}.webp"


# --- what to copy ------------------------------------------------------------

_DERIVATIVE_QUERY = """
SELECT asset_id, status, relative_path_text, checksum_sha256, byte_size
FROM derivatives WHERE long_edge = ? AND is_current = 1
"""

# Two sequential scans joined in a dict rather than one SQL join, for the reason
# `adopt_mediavault` gives: letting SQLite join these probes an index inside a
# 6.97 GB file once per row, on a volume measured at ~70 IOPS.
_ASSETS_QUERY = "SELECT asset_id, sha256, preferred_extension FROM assets"


def worklist(manifest, long_edge: int = LONG_EDGE) -> tuple[list[tuple], int]:
    """Every ready derivative as `(source relpath, sha256, checksum, size, ext)`.

    Returns the list and the count of subjects whose derivative is not ready --
    v1's preprocessing failures, which have no file to copy and are expected.
    Sorted by source path so the reads walk the derivative tree in tree order
    rather than in asset order, which on a USB HDD is the difference between
    following the head and seeking against it.
    """
    identity = {
        asset_id: (sha256, (ext or "").lower())
        for asset_id, sha256, ext in manifest.execute(_ASSETS_QUERY)
    }
    ready: list[tuple] = []
    not_ready = 0
    for asset_id, status, relpath, checksum, size in manifest.execute(
        _DERIVATIVE_QUERY, (long_edge,)
    ):
        if status != "ready":
            not_ready += 1
            continue
        sha256, ext = identity[asset_id]
        ready.append((relpath, sha256, checksum, size, ext))
    ready.sort()
    return ready, not_ready


def present(thumb_root: Path) -> set[str]:
    """Every sha256 already on the NVMe. One enumeration, not 103,207 stats."""
    if not thumb_root.is_dir():
        return set()
    return {
        entry.name[:-5]
        for shard in os.scandir(thumb_root)
        if shard.is_dir()
        for entry in os.scandir(shard.path)
        if entry.name.endswith(".webp")
    }


# --- the copy ----------------------------------------------------------------


def copy_one(item: tuple, source_root: Path, thumb_root: Path) -> tuple[str, int]:
    """Verify one derivative and place it. Returns `(outcome, bytes accepted)`.

    The hash is computed over what was actually read, and the write happens only
    after it matches. `absent` is the expected outcome for a row whose file v1
    never wrote; `mismatch` means the manifest and the disk disagree about bytes
    that are both supposed to be there, which is a real problem and never copied.
    """
    relpath, sha256, checksum, _, _ = item
    try:
        payload = (source_root / relpath).read_bytes()
    except FileNotFoundError:
        return "absent", 0
    if hashlib.sha256(payload).hexdigest() != checksum:
        return "mismatch", 0
    target = thumb_path(thumb_root, sha256)
    partial = target.with_name(target.name + ".part")
    partial.write_bytes(payload)
    os.replace(partial, target)
    return "copied", len(payload)


def copy_all(
    todo: list[tuple],
    source_root: Path,
    thumb_root: Path,
    *,
    workers: int = READ_WORKERS,
    progress_seconds: float = PROGRESS_SECONDS,
) -> dict:
    """Copy every item in `todo`, verified. Returns the tally and the timings."""
    for shard in sorted({item[1][:2] for item in todo}):
        (thumb_root / shard).mkdir(parents=True, exist_ok=True)

    counts: collections.Counter = collections.Counter()
    by_ext: collections.Counter = collections.Counter()
    mismatched: list[tuple[str, str]] = []
    copied_bytes = 0
    started = announced = time.perf_counter()

    with ThreadPoolExecutor(max(workers, 1)) as pool:
        for done, (item, (outcome, size)) in enumerate(
            zip(todo, pool.map(lambda i: copy_one(i, source_root, thumb_root), todo)), 1
        ):
            counts[outcome] += 1
            copied_bytes += size
            if outcome == "copied":
                by_ext[item[4]] += 1
            elif outcome == "mismatch":
                mismatched.append((item[1], item[0]))
            now = time.perf_counter()
            if now - announced >= progress_seconds:
                announced = now
                print(
                    f"  thumbs   {done:>7,}/{len(todo):,}  {done / (now - started):.0f}/s"
                    f"  {copied_bytes / (now - started) / 1e6:.1f} MB/s",
                    flush=True,
                )

    elapsed = time.perf_counter() - started
    return {
        "copied": counts["copied"],
        "absent": counts["absent"],
        "mismatch": counts["mismatch"],
        "mismatched": mismatched,
        "bytes": copied_bytes,
        "elapsed_s": elapsed,
        "by_ext": by_ext,
    }


# --- report ------------------------------------------------------------------


def run(
    config: Config | None = None,
    *,
    workers: int = READ_WORKERS,
    limit: int | None = None,
) -> int:
    config = config or load()
    source_root = config.mediavault_root / DERIVATIVE_SUBDIR
    if not source_root.is_dir():
        raise SystemExit(f"derivative tree not found: {source_root}")

    manifest = open_manifest(config.mediavault_manifest_db)
    try:
        started = time.perf_counter()
        ready, not_ready = worklist(manifest)
    finally:
        manifest.close()
    print(
        f"manifest  {len(ready):,} ready {LONG_EDGE}px derivatives, {not_ready:,} not ready "
        f"({time.perf_counter() - started:.0f}s, read-only)",
        flush=True,
    )

    started = time.perf_counter()
    already = present(config.thumb_root)
    print(
        f"thumbs    {len(already):,} already under {config.thumb_root} "
        f"({time.perf_counter() - started:.1f}s)",
        flush=True,
    )

    todo = [item for item in ready if item[1] not in already]
    if limit is not None:
        todo = todo[:limit]
    print(f"todo      {len(todo):,} to copy, {len(ready) - len(todo):,} skipped\n", flush=True)

    result = copy_all(todo, source_root, config.thumb_root, workers=workers)

    elapsed = max(result["elapsed_s"], 1e-6)
    print(
        f"\ncopied    {result['copied']:,} thumbnails, {result['bytes'] / 1e9:.3f} GB "
        f"in {int(elapsed) // 60}m{int(elapsed) % 60:02d}s"
    )
    print(
        f"          {result['copied'] / elapsed:,.0f} files/s, "
        f"{result['bytes'] / elapsed / 1e6:.1f} MB/s"
    )
    print(f"missing   {not_ready:,} rows not ready, {result['absent']:,} ready rows with no file")
    print(f"mismatch  {result['mismatch']:,} checksum mismatches")
    for sha256, relpath in result["mismatched"][:20]:
        print(f"          {sha256}  {relpath}")

    print(f"\nby extension, copied this run")
    for ext, count in result["by_ext"].most_common(12):
        print(f"  {ext or '(none)':<10}{count:>9,}")
    arw = result["by_ext"].get(".arw", 0)
    print(f"\n.arw      {arw:,} copied this run; step 9 replaces the rotated ones")

    on_disk = len(present(config.thumb_root))
    print(f"on disk   {on_disk:,} thumbnails, of {len(ready):,} ready derivatives")
    return 0 if result["mismatch"] == 0 else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--workers", type=int, default=READ_WORKERS)
    parser.add_argument(
        "--limit", type=int, help="copy at most this many, for a throughput measurement"
    )
    args = parser.parse_args()
    sys.exit(run(workers=args.workers, limit=args.limit))
