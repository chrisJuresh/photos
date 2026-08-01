"""Imports MediaVault's cheap outputs: path history into `origin`, assets and
extended metadata into `file`.

This reads v1's *data*; it never imports or runs v1's code. The manifest is
opened read-only through a `file:` URI with `mode=ro&immutable=1`, so a stray
write raises rather than taking a lock on 6.97 GB of someone else's database,
and the read leaves not even a `-shm` behind. See `open_manifest`.

Nothing is adopted on the strength of a database row. The objects tree is
enumerated once into a set, and an asset whose object file is absent is counted
and skipped rather than imported.

Only `asset_extended_metadata` is read. `asset_features` holds *relative*
judgements that only mean anything when every value comes from one
implementation, so quality scalars, pHash and ThumbHash are left NULL for a
later step to compute from the derivatives. `assets.width/height` is not adopted
either -- it holds at least five different quantities and disagrees with the
orientation-corrected dimensions for 4,415 assets -- so width and height come
from `asset_extended_metadata`.

The exiftool readings the manifest carries are *not* laid out under `meta_root`
by default -- writing 146,034 gzip files measured 4-8/s sustained on this volume,
which is hours rather than the minutes this import costs. `--meta` does it, and
is resumable. The readings are also a curated ~32-tag subset rather than full
`exiftool -a -G` output, so the step that generates the real sidecars has to run
regardless.

Re-running changes nothing. `file` rows are inserted once and never updated, so
a completed row is left alone; `origin` rows merge monotonically towards the
earliest observed mtime, which makes the sidecar walk restartable without
holding 251,087 rows uncommitted. A re-run still re-reads the sidecars: the
catalog records no progress cursor, and adding a table for one is not in scope.
"""

from __future__ import annotations

import argparse
import gzip
import json
import os
import re
import sqlite3
import sys
import time
from collections.abc import Iterator
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path

from photolib import db, migrate
from photolib.config import Config, load

# Adopted metadata all comes from one analyzer version, recorded per feature so a
# later step can add its own keys without invalidating this one.
FEATURE_VER = {"meta": "mediavault:extended-metadata-v1"}

READ_WORKERS = 32  # measured on the USB HDD: 41 files/s serial, 86 at 32 threads
WALK_WORKERS = 32  # and 101 entries/s serial, 394 at 32 threads, listing shards
WRITE_WORKERS = 16  # and 128 files/s serial, 880 at 16 threads, writing sidecars
SIDECAR_CHUNK = 4096
INSERT_BATCH = 20_000
PROGRESS_SECONDS = 30


class AdoptRefused(RuntimeError):
    """Raised before anything is written. Nothing was imported."""


# --- reading MediaVault ------------------------------------------------------


def open_manifest(path: Path) -> sqlite3.Connection:
    """The MediaVault manifest, read-only. Never migrated, never write-locked.

    `immutable=1` alongside `mode=ro` is what makes the read leave no trace. The
    manifest is a WAL database, and `mode=ro` on its own still creates or
    rewrites the 32 KB `-shm` alongside it -- a write into v1's state directory
    on every run. `immutable` skips the WAL machinery entirely, which is only
    sound while the `-wal` holds nothing the main file lacks, so an unspent WAL
    is a refusal rather than a silently stale read.
    """
    if not path.is_file():
        raise AdoptRefused(f"MediaVault manifest not found: {path}")
    wal = path.with_name(path.name + "-wal")
    if wal.is_file() and wal.stat().st_size:
        raise AdoptRefused(
            f"{wal.name} holds {wal.stat().st_size} unspent bytes: a reader cannot checkpoint it "
            "and reading the main file alone would be stale"
        )
    return sqlite3.connect(f"{path.as_uri()}?mode=ro&immutable=1", uri=True)


def shard_entries(base: Path, workers: int) -> Iterator[tuple[str, str, os.DirEntry]]:
    """Every entry of a `<2 hex>/<2 hex>/` tree, as (shard, inner, entry).

    One thread per top-level shard. Listing this volume serially measured 101
    entries/s -- 24 minutes for 146,034 -- because the cost is per-directory
    latency rather than bandwidth; 32 threads measured 394/s on cold shards.
    Nothing is read here, only listed, so this is not the concurrent-reader
    pattern the plan rules out for bulk media passes.
    """
    if not base.is_dir():
        raise AdoptRefused(f"MediaVault shard tree not found: {base}")

    def leaves(shard: os.DirEntry) -> list[tuple[str, str, os.DirEntry]]:
        found = []
        for inner in os.scandir(shard.path):
            if inner.is_dir():
                found.extend((shard.name, inner.name, entry) for entry in os.scandir(inner.path))
        return found

    shards = sorted((e for e in os.scandir(base) if e.is_dir()), key=lambda e: e.name)
    with ThreadPoolExecutor(max(min(workers, len(shards)), 1)) as pool:
        for batch in pool.map(leaves, shards):
            yield from batch


def object_index(mediavault_root: Path, *, workers: int = WALK_WORKERS) -> set[str]:
    """Every object file present, keyed the way `assets.object_relpath` spells it.

    One enumeration of 65,536 directories, which the volume answers far faster
    than 146,034 individual cold stats at 31 ms each would.
    """
    base = mediavault_root / "objects" / "sha256"
    return {
        f"objects\\sha256\\{shard}\\{inner}\\{entry.name}"
        for shard, inner, entry in shard_entries(base, workers)
    }


def sidecar_paths(records_root: Path, *, workers: int = WALK_WORKERS) -> list[str]:
    """Every asset sidecar, shard by shard so reads follow the tree."""
    return [entry.path for _, _, entry in shard_entries(records_root / "assets", workers)]


# --- shaping the values we keep ---------------------------------------------


def camera_name(make: str | None, model: str | None) -> str | None:
    """One display string. Most models already carry the make; some do not."""
    make = (make or "").strip()
    model = (model or "").strip()
    if not model:
        return make or None
    if not make or model.casefold().startswith(make.casefold()):
        return model
    return f"{make} {model}"


_CTIME = re.compile(r"[A-Za-z]{3} ([A-Za-z]{3}) +(\d{1,2}) (\d{2}):(\d{2}):(\d{2}) (\d{4})")
_MONTHS = {
    name: number
    for number, name in enumerate(
        ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"), 1
    )
}


def capture_iso(text: str | None) -> str | None:
    """EXIF `2021:12:01 09:06:42` as ISO 8601 local time, or None.

    `DateTimeOriginal` carries no offset and is treated as authoritative local
    time -- refusing it for lacking a timezone is what left v1 with 6,451 dated
    assets out of 38,767 that had a date. Any offset present is dropped rather
    than stored; `file.taken_offset` carries it from migration 003 on.

    Two minority spellings are accepted alongside the canonical one, because
    rejecting them demotes a real capture date to the mtime tier and the mtime
    on this corpus is a copy date up to 26 years later:

      `2020:07:17 10:36-07:00`     seconds omitted -- taken as :00
      `Tue Jan 17 15:45:20 2012`   ctime(3), which some muxers write

    `['8/1/96', '4:59 PM']` is a leaked Python list repr and stays rejected: its
    day and month are genuinely ambiguous, so there is no reading to prefer.

    A seconds field that is present but invalid is a rejection, not a fall
    through to the minutes reading: `2020:07:17 10:36:99` must not publish
    10:36:00.
    """
    if not text:
        return None
    text = text.strip()
    # ctime first, and on the raw text: normalising the ISO 'T' separator to a
    # space would eat the 'T' of 'Tue'. Matched against an explicit month table
    # rather than strptime's %a/%b, which read the process's LC_TIME -- a
    # setlocale call anywhere else would otherwise push these back to the mtime
    # tier and restore a twelve-year error without touching this file.
    ctime = _CTIME.fullmatch(text)
    if ctime and ctime[1] in _MONTHS:
        try:
            return datetime(
                int(ctime[6]), _MONTHS[ctime[1]], *(int(g) for g in ctime.group(2, 3, 4, 5))
            ).strftime("%Y-%m-%dT%H:%M:%S")
        except ValueError:
            return None
    stamp = text.replace("T", " ")
    date, _, rest = stamp.partition(" ")
    date = date.replace(":", "-", 2)
    clock = rest[:8]
    for pattern, size in (("%Y-%m-%d %H:%M:%S", 8), ("%Y-%m-%d %H:%M", 5)):
        if size == 5 and rest[5:6] == ":":
            break  # a seconds field is there and it did not parse
        try:
            datetime.strptime(f"{date} {rest[:size]}", pattern)
        except ValueError:
            continue
        clock = rest[:size] if size == 8 else f"{rest[:size]}:00"
        return f"{date}T{clock}"
    return None


def path_root(relative_path: str) -> str:
    """The first path segment under `G:\\photos`, or '' for a top-level file."""
    head, sep, _ = relative_path.partition("\\")
    return head if sep else ""


# --- writing the meta sidecars ----------------------------------------------


def meta_path(meta_root: Path, sha256: str) -> Path:
    return meta_root / sha256[:2] / sha256[2:4] / f"{sha256}.json.gz"


def write_meta(
    meta_root: Path, readings: list[tuple[str, str]], *, workers: int = WRITE_WORKERS
) -> dict[str, int]:
    """v1's per-asset exiftool reading, gzipped, one file per object.

    Off by default -- see `--meta`. 146,034 small files is not a cheap write on
    this volume: 1,500 of them measured 880/s at 16 threads, but that fits
    entirely in the OS write cache, and the sustained rate once the cache has to
    flush measured 4-8/s, which is 5-10 hours of USB-HDD head time. The step
    this belongs to is one already paying for a G: pass.

    Resumable and idempotent when it does run: the tree is enumerated once and
    sidecars already present are skipped, rather than 146,034 cold stats at
    31 ms each. Sorted by sha256 so the shard directories are created in order.
    """
    already = set()
    if meta_root.is_dir():
        already = {
            entry.name.partition(".")[0] for _, _, entry in shard_entries(meta_root, workers)
        }
    todo = sorted(item for item in readings if item[0] not in already)

    def one(item: tuple[str, str]) -> None:
        target = meta_path(meta_root, item[0])
        target.parent.mkdir(parents=True, exist_ok=True)
        with gzip.open(target, "wb") as handle:
            handle.write(item[1].encode("utf-8"))

    started = announced = time.perf_counter()
    with ThreadPoolExecutor(workers) as pool:
        for done, _ in enumerate(pool.map(one, todo), 1):
            now = time.perf_counter()
            if now - announced >= PROGRESS_SECONDS:
                announced = now
                print(
                    f"  meta     {done:>7,}/{len(todo):,}  {done / (now - started):.0f}/s",
                    flush=True,
                )
    return {"written": len(todo), "already": len(readings) - len(todo)}


# --- the import passes ------------------------------------------------------

_ASSETS_QUERY = """
SELECT asset_id, sha256, size_bytes, preferred_extension, media_kind, object_relpath
FROM assets
"""

# Two sequential table scans joined in a dict, not one SQL join. Letting SQLite
# join these made it probe an index in a 6.97 GB file once per row -- one random
# seek on a drive measured at ~70 IOPS, which ran at 4-11 assets/s and would have
# taken most of a day. `is_current` is filtered here rather than in SQL so the
# scan cannot be turned back into an index probe.
_METADATA_QUERY = """
SELECT asset_id, is_current, width, height, capture_time_text, capture_time_source,
       camera_make, camera_model, lens_model, gps_latitude, gps_longitude, raw_metadata_json
FROM asset_extended_metadata
"""

_FILE_INSERT = """
INSERT INTO file (sha256, size, ext, kind, width, height, taken_at, taken_src,
                  camera, lens, gps_lat, gps_lon, vault_relpath, state, feature_ver)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'adopted', ?)
ON CONFLICT(sha256) DO NOTHING
"""

# Order-independent merge towards the earliest mtime. Step 4 resolves undated
# photos by min(mtime_ns), so a later observation of the same path must never
# win -- that would bias those dates forward. Written as an upsert rather than a
# pre-collapse so the walk commits as it goes and a re-run keeps the minimum it
# already stored.
_ORIGIN_INSERT = """
INSERT INTO origin (path, root, ext, size, mtime_ns, sha256, seen_at)
VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(path) DO UPDATE SET
  ext = excluded.ext, size = excluded.size,
  mtime_ns = excluded.mtime_ns, seen_at = excluded.seen_at
WHERE excluded.mtime_ns IS NOT NULL
  AND (origin.mtime_ns IS NULL OR excluded.mtime_ns < origin.mtime_ns)
"""


def adopt_assets(
    conn: sqlite3.Connection,
    manifest: sqlite3.Connection,
    present: set[str],
) -> tuple[dict[str, int], list[tuple[str, str]]]:
    """Insert one `file` row per asset whose object file is on disk.

    Returns the counts and every adoptable asset's exiftool reading, for
    `write_meta` to lay out afterwards. The readings cover assets that were
    already in `file` as well as new ones, so a run that was killed during the
    sidecar write finishes the job on its next pass.
    """
    known = {row[0] for row in conn.execute("SELECT sha256 FROM file")}
    counts = dict.fromkeys(
        ("assets", "missing_object", "inserted", "already", "unparsed_time", "no_metadata"), 0
    )

    started = time.perf_counter()
    eligible: dict[str, tuple] = {}
    for asset_id, sha256, size, ext, kind, relpath in manifest.execute(_ASSETS_QUERY):
        counts["assets"] += 1
        if relpath not in present:
            counts["missing_object"] += 1
            continue
        eligible[asset_id] = (sha256, size, ext or "", kind, relpath)
        if sha256 in known:
            counts["already"] += 1
    print(
        f"assets    {counts['assets']:,} manifest rows read in "
        f"{time.perf_counter() - started:.0f}s, {len(eligible) - counts['already']:,} to adopt",
        flush=True,
    )

    conn.execute("BEGIN")
    announced = time.perf_counter()
    readings: list[tuple[str, str]] = []

    def insert(asset: tuple, metadata: tuple | None) -> None:
        sha256, size, ext, kind, relpath = asset
        width = height = taken_at = taken_src = camera = lens = lat = lon = None
        if metadata is not None:
            width, height, capture_text, capture_source, make, model, lens, lat, lon = metadata
            taken_at = capture_iso(capture_text)
            if capture_text and taken_at is None:
                counts["unparsed_time"] += 1
            # 'exif' is the tier step 4's fallback chain compares against; the
            # tag after it is the reading that produced the value.
            taken_src = f"exif:{capture_source}" if taken_at and capture_source else None
            camera = camera_name(make, model)
        conn.execute(
            _FILE_INSERT,
            (sha256, size, ext, kind, width, height, taken_at, taken_src,
             camera, lens, lat, lon, relpath, json.dumps(FEATURE_VER)),
        )
        if sha256 not in known:
            counts["inserted"] += 1

    for row in manifest.execute(_METADATA_QUERY):
        if not row[1]:  # superseded metadata, not the current reading
            continue
        asset = eligible.pop(row[0], None)
        if asset is None:
            continue
        readings.append((asset[0], row[11]))
        insert(asset, row[2:11])
        now = time.perf_counter()
        if now - announced >= PROGRESS_SECONDS:
            announced = now
            print(
                f"  metadata {len(readings):>7,}  {len(readings) / (now - started):.0f}/s",
                flush=True,
            )

    # An adoptable object with no current metadata row still gets a `file` row.
    # Dropping it would lose a photo that is provably on disk.
    for asset in eligible.values():
        counts["no_metadata"] += 1
        insert(asset, None)
    conn.execute("COMMIT")
    return counts, readings


def _extract(sidecar_path: str) -> tuple[str | None, list[tuple], int]:
    """One sidecar as (asset sha256, candidate origin rows, malformed count)."""
    with open(sidecar_path, "rb") as handle:
        record = json.loads(handle.read())
    asset = record.get("asset") or {}
    sha256 = asset.get("sha256")
    if not sha256:
        return None, [], 1
    rows = []
    for seen in record.get("source_locations_and_history") or []:
        path = seen.get("path_text")
        if not path:
            continue
        relative = seen.get("relative_path_text") or ""
        rows.append(
            (
                path,
                path_root(relative),
                seen.get("extension_text") or "",
                seen.get("size_bytes") or 0,
                seen.get("mtime_ns"),
                sha256,
                seen.get("first_seen_at") or seen.get("observed_at"),
            )
        )
    return sha256, rows, 0


def import_origins(
    conn: sqlite3.Connection,
    records_root: Path,
    adopted: set[str],
    *,
    workers: int = READ_WORKERS,
) -> dict[str, int]:
    """Read every sidecar and merge its path history into `origin`."""
    listed = time.perf_counter()
    paths = sidecar_paths(records_root, workers=workers)
    print(
        f"records   {len(paths):,} sidecars listed in {time.perf_counter() - listed:.0f}s",
        flush=True,
    )
    counts = dict.fromkeys(
        ("sidecars", "skipped_asset", "malformed", "observations", "conflicts", "no_root"), 0
    )
    # A sidecar with no observation timestamp of its own is dated by this run;
    # `origin.seen_at` is NOT NULL and an empty string would read as a real value.
    fallback_seen_at = datetime.now().astimezone().isoformat(timespec="seconds")
    owner: dict[str, str] = {}
    batch: list[tuple] = []
    started = time.perf_counter()
    announced = started

    def flush() -> None:
        conn.execute("BEGIN")
        conn.executemany(_ORIGIN_INSERT, batch)
        conn.execute("COMMIT")
        batch.clear()

    with ThreadPoolExecutor(workers) as pool:
        for start in range(0, len(paths), SIDECAR_CHUNK):
            for sha256, rows, malformed in pool.map(_extract, paths[start : start + SIDECAR_CHUNK]):
                counts["sidecars"] += 1
                counts["malformed"] += malformed
                if sha256 is None:
                    continue
                if sha256 not in adopted:
                    counts["skipped_asset"] += 1
                    continue
                for row in rows:
                    path = row[0]
                    if owner.setdefault(path, sha256) != sha256:
                        counts["conflicts"] += 1
                    if not row[1]:
                        counts["no_root"] += 1
                    counts["observations"] += 1
                    batch.append(row if row[6] else (*row[:6], fallback_seen_at))
                if len(batch) >= INSERT_BATCH:
                    flush()
            now = time.perf_counter()
            if now - announced >= PROGRESS_SECONDS:
                announced = now
                print(
                    f"  sidecars {counts['sidecars']:>7,}/{len(paths):,}"
                    f"  {counts['sidecars'] / (now - started):.0f}/s"
                    f"  {counts['observations']:>7,} observations",
                    flush=True,
                )
    if batch:
        flush()
    counts["distinct_paths"] = len(owner)
    counts["elapsed_s"] = int(time.perf_counter() - started)
    return counts


# --- report -----------------------------------------------------------------


def coverage(conn: sqlite3.Connection) -> dict[str, int]:
    return dict(
        conn.execute(
            """
            SELECT 'file', count(*) FROM file
            UNION ALL SELECT 'origin', (SELECT count(*) FROM origin)
            UNION ALL SELECT 'taken_at', (SELECT count(*) FROM file WHERE taken_at IS NOT NULL)
            UNION ALL SELECT 'camera', (SELECT count(*) FROM file WHERE camera IS NOT NULL)
            UNION ALL SELECT 'gps', (SELECT count(*) FROM file WHERE gps_lat IS NOT NULL)
            UNION ALL SELECT 'dims', (SELECT count(*) FROM file WHERE width IS NOT NULL)
            UNION ALL SELECT 'lens', (SELECT count(*) FROM file WHERE lens IS NOT NULL)
            """
        ).fetchall()
    )


def _pct(part: int, whole: int) -> str:
    return f"{part:>9,} ({part / whole * 100:5.1f}%)" if whole else f"{part:>9,}"


def run(
    config: Config | None = None,
    *,
    workers: int = READ_WORKERS,
    write_sidecars: bool = False,
) -> int:
    config = config or load()
    manifest = open_manifest(config.mediavault_manifest_db)
    conn = db.connect()
    try:
        if migrate.version(conn) < 1:
            raise AdoptRefused("catalog is unmigrated; run python -m photolib.migrate first")

        print(f"manifest  {config.mediavault_manifest_db} (read-only)", flush=True)
        started = time.perf_counter()
        present = object_index(config.mediavault_root, workers=workers)
        print(
            f"objects   {len(present):,} files on disk in {time.perf_counter() - started:.0f}s",
            flush=True,
        )

        assets, readings = adopt_assets(conn, manifest, present)
        print(
            f"file      {assets['inserted']:,} inserted, {assets['already']:,} already present, "
            f"{assets['missing_object']:,} skipped for a missing object "
            f"(of {assets['assets']:,} manifest rows)",
            flush=True,
        )
        if assets["no_metadata"]:
            print(f"          {assets['no_metadata']:,} adopted with no current metadata row")

        if write_sidecars:
            started = time.perf_counter()
            meta = write_meta(config.meta_root, readings)
            print(
                f"meta      {meta['written']:,} sidecars written, {meta['already']:,} already "
                f"there, under {config.meta_root} in {time.perf_counter() - started:.0f}s",
                flush=True,
            )
        else:
            size = sum(len(raw) for _, raw in readings)
            print(
                f"meta      {len(readings):,} exiftool readings present in the manifest "
                f"({size / 1e6:.1f} MB), not written -- pass --meta"
            )

        adopted = {row[0] for row in conn.execute("SELECT sha256 FROM file")}
        origins = import_origins(conn, config.mediavault_root / "records", adopted, workers=workers)
        print(
            f"origin    {origins['observations']:,} observations over "
            f"{origins['distinct_paths']:,} distinct paths from {origins['sidecars']:,} sidecars "
            f"in {origins['elapsed_s'] // 60}m{origins['elapsed_s'] % 60:02d}s"
        )
        if origins["skipped_asset"]:
            print(f"          {origins['skipped_asset']:,} sidecars skipped: asset not adopted")
        if origins["conflicts"]:
            print(f"          {origins['conflicts']:,} paths resolving to more than one asset")
        if origins["no_root"] or origins["malformed"]:
            print(
                f"          {origins['no_root']:,} top-level paths (root ''), "
                f"{origins['malformed']:,} malformed sidecars"
            )
        if assets["unparsed_time"]:
            print(f"          {assets['unparsed_time']:,} capture times failed to parse")

        counts = coverage(conn)
        total = counts["file"]
        print(f"\ncatalog   {counts['file']:,} file rows, {counts['origin']:,} origin rows")
        for label in ("taken_at", "camera", "lens", "gps", "dims"):
            print(f"  {label:<9}{_pct(counts[label], total)}")
        return 0
    finally:
        conn.close()
        manifest.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--workers", type=int, default=READ_WORKERS)
    parser.add_argument(
        "--meta",
        action="store_true",
        help="also lay the exiftool readings out under meta_root as one gzip per object. "
        "5-10 h on the USB HDD at the measured sustained rate; resumable.",
    )
    args = parser.parse_args()
    try:
        sys.exit(run(workers=args.workers, write_sidecars=args.meta))
    except AdoptRefused as exc:
        sys.exit(f"refused: {exc}")
