"""Copies the 1536px substrates onto the NVMe, from the two trees that hold them.

The grid draws a tile from the 384px thumbnail. A stack's overlay cannot: the
cover rule picks the sharpest frame of the middle-exposure third, and 384px is
too small to show the difference it chose on. The 1536px tier already exists,
produced by v1 and by Phase 2a/2b, but only on the USB HDD, where a frame
measured 40 ms against 9 ms for a thumbnail on E:. This module is that tier's
adoption and nothing else. It decodes nothing, encodes nothing, and creates no
substrate that does not already exist.

**Two source trees, one destination.** Most substrates are v1's, under
`<mediavault_root>\\derivatives` at the relpath the manifest records, in v1's
sharded `d1_` layout. The rest are ours, written by Phase 2a's ARW repair and
Phase 2b to `<deriv_root>\\<aa>\\<bb>\\<sha256>.webp`. `deriv_root` is looked
at first and wins: where both trees hold a substrate for one tile, v1's is the
wrongly-rotated file that Phase 2a rewrote, and the manifest still describes
v1's bytes.

That is also why verification is asymmetric, and it is the one place this pass
differs from `archive/pipeline/thumbnails.py`. A substrate read from MediaVault
is hashed and compared against the `checksum_sha256` the manifest records for
it, and a byte that does not verify is counted as a mismatch and never copied.
A substrate read from `deriv_root` has no manifest checksum -- the manifest
describes the file it replaced -- so there is nothing to compare it against and
it is copied on the strength of being the tier's current file, counted
separately so the report never implies a check that did not happen.

Only tiles are copied: one substrate per `photo.rep_sha256`, which is the frame
the grid and the overlay actually draw. The other members of a RAW+JPEG group
are never rendered at this size, and copying them would cost the disk for
nothing.

Re-running copies only what is absent. The substrate tree is enumerated once
and every sha256 already present is skipped, so an interrupted pass resumes
rather than repeating; each file is written to a `.part` beside its target and
renamed, so an interruption cannot leave a truncated substrate that the next
run would mistake for a finished one.

The worklist, the single enumeration of what is already on disk, the `.part`
write and the report are `archive/pipeline/thumbnails.py` at a different tier:
that module adopted the 384px one and this is deliberately the same shape, so
the two read alike and a reader who knows one knows the other.

Nothing else may touch `G:` while this runs, Explorer windows included.
"""

from __future__ import annotations

import argparse
import collections
import hashlib
import os
import sqlite3
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import NamedTuple

from photolib import db
from photolib.config import Config, load, substrate_path

LONG_EDGE = 1536  # the stack overlay's frame. 384 is thumb_root's, and adopted.
READ_WORKERS = 32
PROGRESS_SECONDS = 30

# `relative_path_text` is relative to this, not to mediavault_root.
DERIVATIVE_SUBDIR = "derivatives"


class SubstratesRefused(RuntimeError):
    """Raised before anything is copied. Nothing was written."""


class Source(NamedTuple):
    """One substrate to place. `checksum` is None for the `deriv_root` tree."""

    sha256: str
    path: Path
    checksum: str | None


# --- reading MediaVault ------------------------------------------------------


def open_manifest(path: Path) -> sqlite3.Connection:
    """The MediaVault manifest, read-only. Never migrated, never write-locked.

    A copy of `archive.pipeline.adopt_mediavault.open_manifest` rather than an
    import of it: `photolib` is the website and `archive/pipeline` is the
    finished build, and that arrow only ever points one way.

    `immutable=1` alongside `mode=ro` is what makes the read leave no trace. The
    manifest is a WAL database, and `mode=ro` on its own still creates or
    rewrites the 32 KB `-shm` alongside it -- a write into v1's state directory
    on every run. `immutable` skips the WAL machinery entirely, which is only
    sound while the `-wal` holds nothing the main file lacks, so an unspent WAL
    is a refusal rather than a silently stale read.
    """
    if not path.is_file():
        raise SubstratesRefused(f"MediaVault manifest not found: {path}")
    wal = path.with_name(path.name + "-wal")
    if wal.is_file() and wal.stat().st_size:
        raise SubstratesRefused(
            f"{wal.name} holds {wal.stat().st_size} unspent bytes: a reader cannot checkpoint it "
            "and reading the main file alone would be stale"
        )
    return sqlite3.connect(f"{path.as_uri()}?mode=ro&immutable=1", uri=True)


# --- what to copy ------------------------------------------------------------

_TILES_QUERY = "SELECT rep_sha256 FROM photo"

_DERIVATIVE_QUERY = """
SELECT asset_id, status, relative_path_text, checksum_sha256
FROM derivatives WHERE long_edge = ? AND is_current = 1
"""

# Two sequential scans joined in a dict rather than one SQL join, for the reason
# `archive/pipeline/adopt_mediavault.py` gives: letting SQLite join these probes
# an index inside a 6.97 GB file once per row, on a volume measured at ~70 IOPS.
_ASSETS_QUERY = "SELECT asset_id, sha256 FROM assets"


def tile_shas(conn: sqlite3.Connection) -> set[str]:
    """Every tile's representative frame -- the one the overlay draws."""
    return {row[0] for row in conn.execute(_TILES_QUERY)}


def deriv_index(deriv_root: Path) -> dict[str, Path]:
    """Every substrate under `deriv_root`, by sha256. One enumeration.

    Phase 2a and Phase 2b wrote this tree at `<aa>\\<bb>\\<sha256>.webp`. It
    holds a few thousand files against the manifest's hundred thousand rows, so
    it is listed whole and joined in memory rather than stat-ed per tile.
    """
    if not deriv_root.is_dir():
        return {}
    return {
        entry.name[:-5]: Path(entry.path)
        for shard in os.scandir(deriv_root)
        if shard.is_dir()
        for inner in os.scandir(shard.path)
        if inner.is_dir()
        for entry in os.scandir(inner.path)
        if entry.name.endswith(".webp")
    }


def worklist(
    manifest: sqlite3.Connection,
    wanted: set[str],
    source_root: Path,
    deriv_root: Path,
    long_edge: int = LONG_EDGE,
) -> tuple[list[Source], dict[str, int]]:
    """Resolve each wanted sha256 to the tree that holds its substrate.

    Returns the sources and a tally: how many came from each tree, how many
    manifest rows are unusable, and how many tiles have a substrate in neither
    tree. That last count is expected to be small and is not a failure -- it is
    a tile whose substrate v1 never produced and no later pass did either, and
    the overlay falls back to the thumbnail for it.

    A manifest row is unusable if it is not ready, records no path, or records
    no checksum. The last of those is skipped rather than copied unverified:
    outside `deriv_root` there is no reason for a substrate to arrive without
    something to check it against.

    Sorted by source path so the reads walk each tree in tree order rather than
    in tile order, which on a USB HDD is the difference between following the
    head and seeking against it.
    """
    local = deriv_index(deriv_root)
    identity = dict(manifest.execute(_ASSETS_QUERY))

    from_manifest: dict[str, Source] = {}
    unusable = 0
    for asset_id, status, relpath, checksum in manifest.execute(_DERIVATIVE_QUERY, (long_edge,)):
        sha256 = identity.get(asset_id)
        if sha256 is None or sha256 not in wanted or sha256 in local:
            continue
        if status != "ready" or not relpath or not checksum:
            unusable += 1
            continue
        from_manifest[sha256] = Source(sha256, source_root / relpath, checksum)

    from_deriv = [Source(sha256, path, None) for sha256, path in local.items() if sha256 in wanted]
    sources = sorted(from_deriv + list(from_manifest.values()), key=lambda s: str(s.path))
    counts = {
        "tiles": len(wanted),
        "deriv": len(from_deriv),
        "mediavault": len(from_manifest),
        "unusable": unusable,
        "no_substrate": len(wanted) - len(sources),
    }
    return sources, counts


def present(substrate_root: Path) -> set[str]:
    """Every sha256 already on the NVMe. One enumeration, not 24,534 stats."""
    if not substrate_root.is_dir():
        return set()
    return {
        entry.name[:-5]
        for shard in os.scandir(substrate_root)
        if shard.is_dir()
        for entry in os.scandir(shard.path)
        if entry.name.endswith(".webp")
    }


# --- the copy ----------------------------------------------------------------


def copy_one(source: Source, substrate_root: Path) -> tuple[str, int]:
    """Verify one substrate and place it. Returns `(outcome, bytes accepted)`.

    The hash is computed over what was actually read, and the write happens only
    after it matches, so a mismatch leaves nothing at the destination -- not
    even a `.part`. `absent` is a row whose file is not on disk; `mismatch`
    means the manifest and the disk disagree about bytes that are both supposed
    to be there, which is a real problem and never copied. A source with no
    recorded checksum -- the `deriv_root` tree -- has nothing to compare and is
    copied as `unverified`.
    """
    try:
        payload = source.path.read_bytes()
    except FileNotFoundError:
        return "absent", 0
    if source.checksum is None:
        outcome = "unverified"
    elif hashlib.sha256(payload).hexdigest() != source.checksum:
        return "mismatch", 0
    else:
        outcome = "copied"
    target = substrate_path(substrate_root, source.sha256)
    partial = target.with_name(target.name + ".part")
    partial.write_bytes(payload)
    os.replace(partial, target)
    return outcome, len(payload)


def copy_all(
    todo: list[Source],
    substrate_root: Path,
    *,
    workers: int = READ_WORKERS,
    progress_seconds: float = PROGRESS_SECONDS,
) -> dict:
    """Copy every source in `todo`. Returns the tally and the timings."""
    for shard in sorted({source.sha256[:2] for source in todo}):
        (substrate_root / shard).mkdir(parents=True, exist_ok=True)

    counts: collections.Counter = collections.Counter()
    mismatched: list[tuple[str, str]] = []
    copied_bytes = 0
    started = announced = time.perf_counter()

    with ThreadPoolExecutor(max(workers, 1)) as pool:
        for done, (source, (outcome, size)) in enumerate(
            zip(todo, pool.map(lambda s: copy_one(s, substrate_root), todo)), 1
        ):
            counts[outcome] += 1
            copied_bytes += size
            if outcome == "mismatch":
                mismatched.append((source.sha256, str(source.path)))
            now = time.perf_counter()
            if now - announced >= progress_seconds:
                announced = now
                print(
                    f"  subs     {done:>7,}/{len(todo):,}  {done / (now - started):.0f}/s"
                    f"  {copied_bytes / (now - started) / 1e6:.1f} MB/s",
                    flush=True,
                )

    return {
        "copied": counts["copied"],
        "unverified": counts["unverified"],
        "absent": counts["absent"],
        "mismatch": counts["mismatch"],
        "mismatched": mismatched,
        "bytes": copied_bytes,
        "elapsed_s": time.perf_counter() - started,
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
        raise SubstratesRefused(f"derivative tree not found: {source_root}")

    conn = db.connect(config.catalog_db, config.state_db, read_only=True)
    try:
        wanted = tile_shas(conn)
    finally:
        conn.close()

    started = time.perf_counter()
    manifest = open_manifest(config.mediavault_manifest_db)
    try:
        sources, counts = worklist(manifest, wanted, source_root, config.deriv_root)
    finally:
        manifest.close()
    print(
        f"tiles     {counts['tiles']:,} tiles, {len(sources):,} with a {LONG_EDGE}px substrate "
        f"({time.perf_counter() - started:.0f}s, read-only)",
        flush=True,
    )
    print(
        f"sources   {counts['mediavault']:,} from {source_root} (checksummed), "
        f"{counts['deriv']:,} from {config.deriv_root} (no manifest checksum)"
    )
    print(
        f"missing   {counts['no_substrate']:,} tiles with a substrate in neither tree, "
        f"{counts['unusable']:,} manifest rows not ready or unchecksummed",
        flush=True,
    )

    started = time.perf_counter()
    already = present(config.substrate_root)
    print(
        f"on disk   {len(already):,} already under {config.substrate_root} "
        f"({time.perf_counter() - started:.1f}s)",
        flush=True,
    )

    todo = [source for source in sources if source.sha256 not in already]
    if limit is not None:
        todo = todo[:limit]
    print(f"todo      {len(todo):,} to copy, {len(sources) - len(todo):,} skipped\n", flush=True)

    result = copy_all(todo, config.substrate_root, workers=workers)

    elapsed = max(result["elapsed_s"], 1e-6)
    placed = result["copied"] + result["unverified"]
    print(
        f"\nplaced    {placed:,} substrates, {result['bytes'] / 1e9:.3f} GB "
        f"in {int(elapsed) // 60}m{int(elapsed) % 60:02d}s"
    )
    print(
        f"          {result['copied']:,} verified against the manifest checksum, "
        f"{result['unverified']:,} from {config.deriv_root} with none recorded"
    )
    print(f"          {placed / elapsed:,.0f} files/s, {result['bytes'] / elapsed / 1e6:.1f} MB/s")
    print(f"absent    {result['absent']:,} rows whose file is not on disk")
    print(f"mismatch  {result['mismatch']:,} checksum mismatches")
    for sha256, path in result["mismatched"][:20]:
        print(f"          {sha256}  {path}")

    on_disk = len(present(config.substrate_root))
    print(f"\non disk   {on_disk:,} substrates, of {len(sources):,} tiles that have one")
    return 0 if result["mismatch"] == 0 else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--workers", type=int, default=READ_WORKERS)
    parser.add_argument(
        "--limit", type=int, help="copy at most this many, for a throughput measurement"
    )
    args = parser.parse_args()
    try:
        sys.exit(run(workers=args.workers, limit=args.limit))
    except SubstratesRefused as exc:
        sys.exit(f"refused: {exc}")
