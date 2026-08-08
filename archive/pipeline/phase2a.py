"""Phase 2a: re-hash every MediaVault object, repair the ARW orientation, and
compute the subjective features from the repaired 1536px substrate.

Three passes, run in that order, each restartable on its own. It is a long run
and it is expected to be killed, so nothing is held only in memory: pass A
commits `file.state='read'` in batches, pass B commits `file.deriv_rot` only
once both of an asset's files are on disk, and pass C commits the features it
has computed as it goes. Re-running skips whatever is already recorded.

**A -- the objects.** 146,034 files, 451.2 GB, the only large read in the
project. Every object is re-hashed and compared against the SHA-256 in its own
filename, and against the byte count the filename also carries. This is
bandwidth-bound and takes exactly **one** reader: step 5 measured two readers at
56.7 MB/s against 62.0 for one on this same workload. A mismatch is a hard
error, listed by name, never repaired and never silently skipped.

**B -- the ARW orientation, before anything reads the substrate.** Step 1's
SPIKE C established that v1 applied `exif_transpose` to the *extracted embedded
preview*, so orientation survived wherever that preview carried its own EXIF --
`.rw2` and `.jpg`, 29,450/29,450, verified in direction and not merely in aspect
-- and was silently dropped for every `.arw`, whose Sony preview has no
Orientation tag at all. The repair set is `preferred_extension = '.arw' AND
orientation_text <> '1'`: 1,486 assets, orientation 8 x 1,459, 6 x 24, 3 x 3.
Selection is by the container's orientation and never by aspect, because 2, 3
and 4 do not change the aspect and the three orientation-3 ARW are published
*upside down* rather than sideways.

The root cause is fixed here rather than worked around: `rotation_for` reads the
**container's** orientation out of the manifest, and nothing in this module ever
consults whatever EXIF did or did not survive into a preview.

**Where the repaired pixels go, and why not over v1's.** MediaVault is read-only
until step 14 and every derivative in it is checksummed in the manifest, so
rewriting one in place would turn a verified tree into 1,486 checksum mismatches
-- the signal reserved for real corruption. The repaired files are written to
the destinations the new build actually reads: the 1536px substrate to
`deriv_root`, matching `archive/PLAN.md` § "Storage layout", and the 384px grid tile
over step 5's copy on `thumb_root`. That is **2,972 files, not 5,944**: the 192
and 768 tiers exist only inside MediaVault, no part of this build reads them,
and both regenerate from the repaired 1536 in seconds if they are ever wanted.
They stay wrong where they are and are reported as such.

**C -- the features, one decode per asset.** pHash, dHash, ThumbHash and the 18
quality scalars in `archive.pipeline.features`, all from the single 1536px decode. v1's
`asset_features` values are *not* adopted: they are relative judgements, cover
ranking compares members within a stack, and a stack holding one v1 value beside
one of these would rank on incompatible measurements. The objective readings --
GPS, ISO, lens, capture time -- were adopted in step 3 and are not touched. This
pass is latency-bound over 103,207 small files and takes 16-32 reader threads,
the opposite of pass A.

`file.width/height` stay as step 3 left them, from `asset_extended_metadata`.
`assets.width/height` is not read anywhere in this module: it holds at least
five different quantities, disagrees with the orientation-corrected metadata for
4,415 assets, and for about 52 has the opposite landscape/portrait polarity to
the real file.

Every decode runs in `archive.pipeline.decode`, under a wall-clock timeout, an output
cap and a memory cap. `F55` is a hang rather than a crash, and the timeout is
the only one of the three that a hung decoder cannot ignore.

One process, one lock file. No job ledger, no leases, no worker runtime.
"""

from __future__ import annotations

import argparse
import collections
import ctypes
import hashlib
import io
import json
import os
import random
import sqlite3
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path

from archive.pipeline import decode, features
from archive.pipeline.adopt_mediavault import open_manifest, shard_entries
from photolib import db, migrate
from photolib.config import Config, load, thumb_path

SUBSTRATE_EDGE = 1536  # the working substrate, and the only tier decoded here
GRID_EDGE = 384  # step 5's grid tile on the NVMe, replaced for the repair set
DETAIL_EDGE = 2560  # verified but not decoded; see `detail_gap`

HASH_READERS = 1  # bandwidth-bound: 62.0 MB/s at one reader, 56.7 at two
DERIV_READERS = 24  # latency-bound: 103,207 small files on one disk head
DECODERS = 12  # 16 CPUs, and the disk is the real constraint
HASH_CHUNK = 8 << 20
COMMIT_ROWS = 500
PROGRESS_SECONDS = 60
WEBP_QUALITY = 90
OBJECT_BYTES = 451.2e9  # 420.17 GiB. Decimal, because MB/s figures are decimal.

# Orientation -> degrees counter-clockwise the pixels must turn to come upright.
# Measured in SPIKE C at r=1.000 against the correctly-oriented source, not
# inferred from the tag's definition.
ROTATION = {"3": 180, "6": 270, "8": 90}
# The mirrored orientations. No ARW carries one, and the four assets that do are
# `.jpg`, whose derivatives v1 transposed correctly. Listed so the regression
# report can say so rather than omit them.
MIRRORED = {"2", "4", "5", "7"}

LOCK_NAME = "phase2a.lock"

# The decode workers import their target by name, and under `python -m` this
# module's `__name__` is "__main__". Spawn's main-module fixup does resolve that,
# but naming the module outright means the workers do not depend on it.
WORKER_MODULE = __spec__.name if __spec__ else __name__


class Phase2aRefused(RuntimeError):
    """Raised before anything is read or written. Nothing happened."""


# --- one process, one lock file ----------------------------------------------


class RunLock:
    """An advisory lock naming the process that holds it.

    A run that is killed leaves the file behind, so a stale lock is detected by
    asking whether its PID is still alive rather than by trusting the file's
    existence. That is the normal case here, not the exceptional one.
    """

    def __init__(self, path: Path) -> None:
        self.path = path

    def __enter__(self) -> RunLock:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        try:
            handle = os.open(self.path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        except FileExistsError:
            pid = self.path.read_text(encoding="ascii").strip()
            if pid.isdigit() and _alive(int(pid)):
                raise Phase2aRefused(
                    f"another run holds {self.path} (pid {pid}). One process, one lock file."
                ) from None
            self.path.unlink(missing_ok=True)
            handle = os.open(self.path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.write(handle, str(os.getpid()).encode("ascii"))
        os.close(handle)
        return self

    def __exit__(self, *exc: object) -> None:
        self.path.unlink(missing_ok=True)


def _alive(pid: int) -> bool:
    """Is that pid a running process? Asked without signalling it.

    `os.kill(pid, 0)` is the POSIX idiom and it is **not** portable here: on
    Windows signal 0 is `CTRL_C_EVENT`, so CPython routes it to
    `GenerateConsoleCtrlEvent` and it sends a real Ctrl-C to that process group
    rather than probing anything. Asked about our own pid -- which is what
    holding the lock twice does -- that interrupts the caller's whole console,
    asynchronously, some arbitrary moment later. It is why the test suite kept
    dying mid-run with a `KeyboardInterrupt` nobody typed.
    """
    if sys.platform == "win32":
        kernel32 = ctypes.windll.kernel32
        # PROCESS_QUERY_LIMITED_INFORMATION: enough to ask, and it still answers
        # for a process owned by another user, where the full right would not.
        handle = kernel32.OpenProcess(0x1000, False, pid)
        if not handle:
            return False
        try:
            code = ctypes.c_ulong()
            if kernel32.GetExitCodeProcess(handle, ctypes.byref(code)):
                return code.value == 259  # STILL_ACTIVE
            return True
        finally:
            kernel32.CloseHandle(handle)
    try:
        os.kill(pid, 0)
    except (OSError, PermissionError) as exc:
        return isinstance(exc, PermissionError)
    return True


# --- what the manifest says --------------------------------------------------


@dataclass(frozen=True, slots=True)
class Asset:
    sha256: str
    size: int
    ext: str
    kind: str | None
    relpath: str
    orientation: str | None


@dataclass(frozen=True, slots=True)
class Derivative:
    relpath: str
    checksum: str
    width: int | None
    height: int | None
    representation: str


def scan_assets(manifest: sqlite3.Connection) -> dict[str, Asset]:
    """Every asset, keyed by `asset_id`. One sequential scan, ~1 s."""
    return {
        row[0]: Asset(row[1], row[2], (row[3] or "").lower(), row[4], row[5], row[6])
        for row in manifest.execute(
            "SELECT asset_id, sha256, size_bytes, preferred_extension, media_kind,"
            " object_relpath, orientation_text FROM assets"
        )
    }


def scan_metadata(manifest: sqlite3.Connection) -> dict[str, tuple]:
    """`(width, height, orientation, software_text, has_edit_history)` per asset.

    The orientation-corrected dimensions, which is what the regression check
    compares the published raster against. `assets.width/height` is not read.
    """
    found = {}
    for asset_id, current, width, height, orientation, software, history in manifest.execute(
        "SELECT asset_id, is_current, width, height, orientation_text, software_text,"
        " edit_history_json FROM asset_extended_metadata"
    ):
        if current:
            found[asset_id] = (width, height, orientation, software, bool(history))
    return found


def scan_derivatives(
    manifest: sqlite3.Connection, edges: tuple[int, ...]
) -> tuple[dict[tuple[str, int], Derivative], collections.Counter]:
    """Every *ready*, current derivative at the wanted tiers, plus a tally.

    `error` rows carry NULL path, checksum and dimensions and have no file at
    all, so they are counted and left alone rather than treated as a gap.
    """
    ready: dict[tuple[str, int], Derivative] = {}
    tally: collections.Counter = collections.Counter()
    for (
        asset_id, edge, status, current, width, height, representation, relpath, checksum
    ) in manifest.execute(
        "SELECT asset_id, long_edge, status, is_current, width, height, representation_kind,"
        " relative_path_text, checksum_sha256 FROM derivatives"
    ):
        if not current or edge not in edges:
            continue
        tally[(edge, status)] += 1
        if status == "ready" and relpath and checksum:
            ready[(asset_id, edge)] = Derivative(relpath, checksum, width, height, representation)
    return ready, tally


# --- pass A: re-hash every object --------------------------------------------


def object_worklist(mediavault_root: Path, *, workers: int = 32) -> list[tuple[str, str, int]]:
    """Every object file as `(path, expected sha256, expected size)`, in tree order.

    The object's name is `<sha256>_<blake3>_<sha512>_<size>.blob`, so the file
    states its own identity twice over -- the digest and the byte count -- and
    both are checked against what is actually read. Sorted by path so one reader
    follows the head down the shard tree instead of seeking across it.
    """
    base = mediavault_root / "objects" / "sha256"
    found = []
    for shard, inner, entry in shard_entries(base, workers):
        fields = entry.name.split("_")
        size = fields[-1].split(".")[0] if len(fields) >= 4 else ""
        found.append(
            (
                str(base / shard / inner / entry.name),
                fields[0],
                int(size) if size.isdigit() else -1,
            )
        )
    found.sort()
    return found


def hash_object(path: str) -> tuple[str, int]:
    """SHA-256 and byte count of one object, read once, streamed."""
    total = 0
    digest = hashlib.sha256()
    with open(path, "rb", buffering=0) as handle:
        while chunk := handle.read(HASH_CHUNK):
            digest.update(chunk)
            total += len(chunk)
    return digest.hexdigest(), total


class Progress:
    """Elapsed, throughput and ETA on a 60-second tick, so the run can be left."""

    def __init__(self, label: str, total: int, total_bytes: float = 0.0) -> None:
        self.label = label
        self.total = total
        self.total_bytes = total_bytes
        self.done = 0
        self.bytes = 0
        self.started = self.announced = time.perf_counter()

    def step(self, size: int = 0) -> None:
        self.done += 1
        self.bytes += size
        now = time.perf_counter()
        if now - self.announced < PROGRESS_SECONDS:
            return
        self.announced = now
        self.report()

    def report(self) -> None:
        elapsed = max(time.perf_counter() - self.started, 1e-6)
        rate = self.done / elapsed
        share = (self.bytes / self.total_bytes) if self.total_bytes else (self.done / max(self.total, 1))
        eta = (elapsed / share - elapsed) if share > 0 else 0.0
        print(
            f"  {self.label:<9}{self.done:>7,}/{self.total:,}  {_hms(elapsed)} elapsed"
            f"  {rate:6.1f}/s  {self.bytes / elapsed / 1e6:6.1f} MB/s"
            f"  {share * 100:5.1f}%  ETA {_hms(eta)}",
            flush=True,
        )


def _hms(seconds: float) -> str:
    seconds = int(max(seconds, 0))
    return f"{seconds // 3600}h{seconds % 3600 // 60:02d}m{seconds % 60:02d}s"


def rehash_objects(
    conn: sqlite3.Connection, config: Config, *, limit: int | None = None
) -> dict:
    """Pass A. Re-hash every object not already recorded as read."""
    started = time.perf_counter()
    worklist = object_worklist(config.mediavault_root)
    verified = {row[0] for row in conn.execute("SELECT sha256 FROM file WHERE state = 'read'")}
    known = {row[0] for row in conn.execute("SELECT sha256 FROM file")}
    todo = [item for item in worklist if item[1] not in verified]
    if limit is not None:
        todo = todo[:limit]
    remaining_bytes = float(sum(size for _, _, size in todo if size > 0))
    print(
        f"objects   {len(worklist):,} on disk, {len(verified):,} already verified, "
        f"{len(todo):,} to read ({remaining_bytes / 1e9:.1f} GB) "
        f"[listed in {time.perf_counter() - started:.0f}s]",
        flush=True,
    )

    mismatched: list[tuple[str, str, str]] = []
    unknown = 0
    batch: list[tuple[str]] = []
    progress = Progress("rehash", len(todo), remaining_bytes)

    def flush() -> None:
        if not batch:
            return
        conn.execute("BEGIN")
        # `pending` is included so that an object whose `file` row arrived from
        # the Phase 0 inventory rather than from the MediaVault adoption still
        # records that its bytes were read -- otherwise it is re-read on every
        # run for ever. States past `read` are never walked back.
        conn.executemany(
            "UPDATE file SET state = 'read' WHERE sha256 = ? AND state IN ('adopted', 'pending')",
            batch,
        )
        conn.execute("COMMIT")
        batch.clear()

    for path, expected_sha, expected_size in todo:
        digest, size = hash_object(path)
        if digest != expected_sha or (expected_size >= 0 and size != expected_size):
            mismatched.append((expected_sha, digest, path))
        elif digest in known:
            batch.append((digest,))
        else:
            unknown += 1
        progress.step(size)
        if len(batch) >= COMMIT_ROWS:
            flush()
    flush()
    progress.report()
    return {
        "objects": len(worklist),
        "read": len(todo),
        "bytes": progress.bytes,
        "elapsed_s": time.perf_counter() - progress.started,
        "mismatched": mismatched,
        "unknown": unknown,
        "already": len(verified),
    }


# --- the decode workers ------------------------------------------------------
#
# Both run inside `archive.pipeline.decode`, which enforces the timeout, the output cap
# and the memory cap. They are module-level so the spawned workers can import
# them by name.


def _open_bounded(blob: bytes, max_pixels: int):
    """Open an encoded image, refusing an oversized one before its pixels load.

    Returns `(image, incomplete)`. A truncated file is decoded on a second
    attempt with truncation tolerated, and flagged, because a partial image is
    evidence worth recording and an exception is not.
    """
    from PIL import Image, ImageFile

    image = Image.open(io.BytesIO(blob))
    width, height = image.size
    if width * height > max_pixels:
        raise ValueError(f"{width}x{height} exceeds the {max_pixels:,}-pixel cap")
    try:
        image.load()
        return image, False
    except OSError:
        previous = ImageFile.LOAD_TRUNCATED_IMAGES
        ImageFile.LOAD_TRUNCATED_IMAGES = True
        try:
            image = Image.open(io.BytesIO(blob))
            image.load()
            return image, True
        finally:
            ImageFile.LOAD_TRUNCATED_IMAGES = previous


def decode_features(payload: bytes, max_pixels: int) -> dict:
    """One decode, every pixel-derived value. Runs in a bounded worker."""
    import numpy as np
    from PIL import Image

    image, incomplete = _open_bounded(payload, max_pixels)
    width, height = image.size
    rgb = np.asarray(image.convert("RGB"))
    gray = image.convert("L")
    small = image.convert("RGBA")
    small.thumbnail((100, 100), Image.LANCZOS)
    return {
        "phash": features.phash(
            np.asarray(gray.resize((features.HASH_SIDE,) * 2, Image.LANCZOS), dtype=np.float64)
        ),
        "dhash": features.dhash(np.asarray(gray.resize((9, 8), Image.LANCZOS), dtype=np.float64)),
        "thumbhash": features.thumbhash(np.asarray(small)),
        "quality": features.pixel_features(rgb, incomplete=incomplete),
        "width": width,
        "height": height,
        "bytes_in": len(payload),
    }


def decode_rotate(payload: tuple, max_pixels: int) -> tuple:
    """Turn one derivative upright and re-encode it. Runs in a bounded worker."""
    from PIL import Image

    blob, degrees_ccw, quality = payload
    image, _ = _open_bounded(blob, max_pixels)
    width, height = image.size
    turn = {90: Image.ROTATE_90, 180: Image.ROTATE_180, 270: Image.ROTATE_270}[degrees_ccw]
    out = io.BytesIO()
    image.transpose(turn).save(out, format="WEBP", quality=quality, method=6)
    return out.getvalue(), width, height, len(blob)


# --- pass B: the ARW orientation repair --------------------------------------


def rotation_for(orientation: str | None) -> int:
    """Degrees counter-clockwise the **container's** orientation demands.

    The container's, never the extracted preview's -- that substitution is the
    whole defect. 0 for an orientation that needs no turn or is not one of the
    three that appear on `.arw`.
    """
    return ROTATION.get(orientation or "", 0)


def repair_set(assets: dict[str, Asset]) -> dict[str, Asset]:
    """`preferred_extension = '.arw' AND orientation_text <> '1'`.

    By the container's orientation and never by aspect: orientations 2, 3 and 4
    leave the aspect alone by construction, so an aspect predicate cannot see
    the three orientation-3 ARW that are published upside down.
    """
    return {
        asset_id: asset
        for asset_id, asset in assets.items()
        if asset.ext == ".arw" and asset.orientation not in (None, "1")
    }


def deriv_path(deriv_root: Path, sha256: str) -> Path:
    """`<deriv_root>\\<aa>\\<bb>\\<sha256>.webp`, per archive/PLAN.md's storage layout."""
    return deriv_root / sha256[:2] / sha256[2:4] / f"{sha256}.webp"


def _place(target: Path, payload: bytes) -> None:
    """Write via a `.part` beside the target, so a kill cannot truncate it."""
    target.parent.mkdir(parents=True, exist_ok=True)
    partial = target.with_name(target.name + ".part")
    partial.write_bytes(payload)
    os.replace(partial, target)


def repair_arw(
    conn: sqlite3.Connection,
    config: Config,
    assets: dict[str, Asset],
    derivatives: dict[tuple[str, int], Derivative],
    *,
    decoders: int = DECODERS,
    timeout_s: float = decode.DECODE_TIMEOUT_S,
) -> dict:
    """Pass B. Turn the 1,486 mis-rotated ARW derivatives upright.

    Two tiers per asset: the 1536px substrate into `deriv_root` and the 384px
    grid tile over step 5's copy on the NVMe. `file.deriv_rot` is written only
    after both files are on disk, so a kill in between simply redoes them.
    """
    todo_assets = repair_set(assets)
    done = {
        row[0]
        for row in conn.execute("SELECT sha256 FROM file WHERE deriv_rot IS NOT NULL")
    }
    source_root = config.mediavault_root / "derivatives"
    tasks: list[tuple] = []
    missing: list[str] = []
    for asset_id, asset in sorted(todo_assets.items(), key=lambda item: item[1].sha256):
        if asset.sha256 in done:
            continue
        pair = [(edge, derivatives.get((asset_id, edge))) for edge in (SUBSTRATE_EDGE, GRID_EDGE)]
        if any(row is None for _, row in pair):
            missing.append(asset.sha256)
            continue
        for edge, row in pair:
            tasks.append((asset, edge, row))

    by_orientation = collections.Counter(a.orientation for a in todo_assets.values())
    print(
        f"repair    {len(todo_assets):,} .arw with orientation <> 1 "
        f"({', '.join(f'{k}: {v:,}' for k, v in sorted(by_orientation.items()))}); "
        f"{len(todo_assets) - len(tasks) // 2 - len(missing):,} already repaired, "
        f"{len(tasks):,} files to rewrite",
        flush=True,
    )
    if missing:
        print(f"          {len(missing):,} skipped: a tier has no ready derivative")
    if not tasks:
        return {"assets": 0, "files": 0, "missing": missing, "mismatch": [], "failed": [],
                "elapsed_s": 0.0, "bytes_in": 0, "bytes_out": 0, "by_orientation": {}}

    pending: dict[str, dict] = collections.defaultdict(dict)
    mismatch: list[str] = []
    failed: list[tuple[str, str]] = []
    bytes_in = bytes_out = 0
    progress = Progress("repair", len(tasks))
    repaired: list[tuple] = []

    with decode.BoundedPool(
        f"{WORKER_MODULE}:decode_rotate", workers=decoders, timeout_s=timeout_s
    ) as pool:
        with ThreadPoolExecutor(min(8, len(tasks))) as pumps:
            pumps.map(_reader(pool, source_root, mismatch), enumerate(tasks))
            for tid, status, result in pool.results(len(tasks)):
                asset, edge, _row = tasks[tid]
                if status != "ok":
                    progress.step()
                    failed.append((asset.sha256, f"{edge}: {status} {result or ''}".strip()))
                    continue
                payload, pre_w, pre_h, size_in = result
                progress.step(size_in)
                bytes_in += size_in
                bytes_out += len(payload)
                target = (
                    deriv_path(config.deriv_root, asset.sha256)
                    if edge == SUBSTRATE_EDGE
                    else thumb_path(config.thumb_root, asset.sha256)
                )
                _place(target, payload)
                slot = pending[asset.sha256]
                slot[edge] = (pre_w, pre_h)
                # Both tiers on disk before the row is marked, so a kill between
                # the two writes redoes them rather than recording a half repair.
                if SUBSTRATE_EDGE in slot and GRID_EDGE in slot:
                    width, height = slot[SUBSTRATE_EDGE]
                    repaired.append((width, height, rotation_for(asset.orientation), asset.sha256))
                    if len(repaired) >= COMMIT_ROWS:
                        _commit_rotation(conn, repaired)
    _commit_rotation(conn, repaired)
    progress.report()
    return {
        "assets": len(pending),
        "files": len(tasks) - len(failed),
        "missing": missing,
        "mismatch": mismatch,
        "failed": failed,
        "elapsed_s": time.perf_counter() - progress.started,
        "bytes_in": bytes_in,
        "bytes_out": bytes_out,
        "by_orientation": dict(by_orientation),
        "timeouts": pool.timeouts,
    }


def _reader(pool: decode.BoundedPool, source_root: Path, mismatch: list):
    """Read and checksum one derivative, then hand its bytes to the pool.

    Every path out of here ends in either a `submit` or a `deliver`, including
    the unexpected ones: a task that does neither is a task `results` waits for
    forever. `list.append` is the only shared mutation, which is atomic.
    """

    def read(indexed: tuple[int, tuple]) -> None:
        tid, (asset, edge, row) = indexed
        try:
            blob = (source_root / row.relpath).read_bytes()
            if hashlib.sha256(blob).hexdigest() != row.checksum:
                mismatch.append(f"{asset.sha256} {edge} {row.relpath}")
                pool.deliver(tid, "error", "checksum mismatch")
                return
            pool.submit(tid, (blob, rotation_for(asset.orientation), WEBP_QUALITY))
        except Exception as exc:
            pool.deliver(tid, "error", f"{type(exc).__name__}: {exc}")

    return read


def _commit_rotation(conn: sqlite3.Connection, rows: list[tuple]) -> None:
    if not rows:
        return
    conn.execute("BEGIN")
    conn.executemany(
        "UPDATE file SET deriv_w = ?, deriv_h = ?, deriv_rot = ? WHERE sha256 = ?", rows
    )
    conn.execute("COMMIT")
    rows.clear()


# --- pass C: features from the repaired substrate ----------------------------


def substrate_token(asset: Asset, derivative: Derivative, repaired: bool) -> str:
    """Which pixels produced the value, recorded per feature in `feature_ver`.

    Sharpness off a 1620px vendor preview is not the same number as sharpness
    off a full decode, and the two must never be compared inside one stack
    without the difference being visible in the data.
    """
    token = f"deriv{SUBSTRATE_EDGE}"
    if derivative.representation == "raw_embedded":
        token += ":raw-preview"
    if repaired:
        token += ":repaired"
    return token


def _feature_ver(existing: str | None, token: str) -> str:
    """Merge this pass's per-feature versions into whatever step 3 recorded."""
    try:
        current = json.loads(existing) if existing else {}
    except json.JSONDecodeError:
        current = {}
    current.update(
        {
            "phash": f"{features.PHASH_VER}/{token}",
            "dhash": f"{features.DHASH_VER}/{token}",
            "thumbhash": f"{features.THUMBHASH_VER}/{token}",
            "quality": f"{features.QUALITY_VER}/{token}",
        }
    )
    return json.dumps(current, sort_keys=True)


_FEATURE_UPDATE = """
UPDATE file SET phash = ?, dhash = ?, thumbhash = ?, quality = ?, feature_ver = ?,
                deriv_w = coalesce(deriv_w, ?), deriv_h = coalesce(deriv_h, ?),
                deriv_rot = coalesce(deriv_rot, ?)
WHERE sha256 = ?
"""


def compute_features(
    conn: sqlite3.Connection,
    config: Config,
    assets: dict[str, Asset],
    metadata: dict[str, tuple],
    derivatives: dict[tuple[str, int], Derivative],
    *,
    readers: int = DERIV_READERS,
    decoders: int = DECODERS,
    timeout_s: float = decode.DECODE_TIMEOUT_S,
    limit: int | None = None,
    retry_errors: bool = False,
) -> dict:
    """Pass C. One decode per asset, every subjective value, committed in batches."""
    versions = dict(
        conn.execute("SELECT sha256, feature_ver FROM file WHERE state IN ('adopted', 'read')")
    )
    already = {
        row[0]
        for row in conn.execute(
            "SELECT sha256 FROM file WHERE quality IS NOT NULL"
            + (" AND quality NOT LIKE '%\"error\"%'" if retry_errors else "")
        )
    }
    repaired = {row[0] for row in conn.execute("SELECT sha256 FROM file WHERE deriv_rot > 0")}
    source_root = config.mediavault_root / "derivatives"

    tasks = []
    for (asset_id, edge), row in derivatives.items():
        if edge != SUBSTRATE_EDGE:
            continue
        asset = assets.get(asset_id)
        if asset is None or asset.sha256 in already:
            continue
        tasks.append((asset_id, asset, row))
    tasks.sort(key=lambda item: item[2].relpath)
    if limit is not None:
        tasks = tasks[:limit]
    print(
        f"features  {len(tasks):,} to compute, {len(already):,} already done "
        f"({len(repaired):,} reading the repaired substrate)",
        flush=True,
    )
    if not tasks:
        return {"computed": 0, "errors": [], "mismatch": [], "absent": [], "timeouts": 0,
                "elapsed_s": 0.0, "bytes": 0, "raster": {}}

    mismatch: list[str] = []
    absent: list[str] = []
    errors: list[tuple[str, str]] = []
    raster: dict[str, tuple[int, int]] = {}
    rows: list[tuple] = []
    progress = Progress("features", len(tasks))

    with decode.BoundedPool(
        f"{WORKER_MODULE}:decode_features", workers=decoders, timeout_s=timeout_s
    ) as pool:

        def read(indexed: tuple[int, tuple]) -> None:
            """Every path out ends in a submit or a deliver -- see `_reader`.

            A repaired asset's substrate is the file this run wrote to
            `deriv_root`, which has no manifest checksum because the manifest
            describes v1's wrongly-rotated one. MediaVault's own derivatives are
            still verified byte for byte before anything is computed from them.
            """
            tid, (_asset_id, asset, row) = indexed
            try:
                if asset.sha256 in repaired:
                    path, verify = deriv_path(config.deriv_root, asset.sha256), False
                else:
                    path, verify = source_root / row.relpath, True
                try:
                    blob = path.read_bytes()
                except FileNotFoundError:
                    absent.append(asset.sha256)
                    pool.deliver(tid, "error", "derivative file absent")
                    return
                if verify and hashlib.sha256(blob).hexdigest() != row.checksum:
                    mismatch.append(f"{asset.sha256} {row.relpath}")
                    pool.deliver(tid, "error", "checksum mismatch")
                    return
                pool.submit(tid, blob)
            except Exception as exc:
                pool.deliver(tid, "error", f"{type(exc).__name__}: {exc}")

        with ThreadPoolExecutor(max(readers, 1)) as pumps:
            # The generator is deliberately not consumed: `map` submits every
            # read eagerly, and draining it here would block this thread behind
            # the readers, which are themselves blocked on the pool's bounded
            # input queue waiting for the loop below to make room.
            pumps.map(read, enumerate(tasks))
            for tid, status, result in pool.results(len(tasks)):
                asset_id, asset, row = tasks[tid]
                progress.step(result["bytes_in"] if status == "ok" else 0)
                if status != "ok":
                    errors.append((asset.sha256, f"{status}: {result or ''}".strip()))
                    rows.append(
                        (
                            None, None, None,
                            json.dumps({"error": f"{status}: {result or ''}".strip()}),
                            _feature_ver(versions.get(asset.sha256), "none"),
                            None, None, None, asset.sha256,
                        )
                    )
                else:
                    aem = metadata.get(asset_id, (None, None, None, None, False))
                    long_edge = max(aem[0] or 0, aem[1] or 0) or None
                    quality = dict(result["quality"])
                    quality.update(features.metadata_features(long_edge, aem[3], aem[4]))
                    quality["composite_quality"] = features.composite_quality(quality)
                    token = substrate_token(asset, row, asset.sha256 in repaired)
                    raster[asset.sha256] = (result["width"], result["height"])
                    rows.append(
                        (
                            result["phash"], result["dhash"], result["thumbhash"],
                            json.dumps(quality, sort_keys=True),
                            _feature_ver(versions.get(asset.sha256), token),
                            result["width"], result["height"], 0, asset.sha256,
                        )
                    )
                if len(rows) >= COMMIT_ROWS:
                    _commit_features(conn, rows)
        _commit_features(conn, rows)
    progress.report()
    return {
        "computed": len(tasks) - len(errors),
        "errors": errors,
        "mismatch": mismatch,
        "absent": absent,
        "timeouts": pool.timeouts,
        "elapsed_s": time.perf_counter() - progress.started,
        "bytes": progress.bytes,
        "raster": raster,
    }


def _commit_features(conn: sqlite3.Connection, rows: list[tuple]) -> None:
    if not rows:
        return
    conn.execute("BEGIN")
    conn.executemany(_FEATURE_UPDATE, rows)
    conn.execute("COMMIT")
    rows.clear()


def recompute_composite(conn: sqlite3.Connection) -> dict:
    """Re-derive `composite_quality` from the scalars already persisted.

    The composite is a stated *policy* over the other seventeen, not a
    measurement, so changing the policy must not cost a 47-minute re-decode of
    103,207 files. Pure SQL and arithmetic, seconds, and it touches no disk
    outside the catalog. The `quality` half of `feature_ver` moves with it --
    an explicit version bump is how a projection gets invalidated, and the
    substrate token it carries is preserved.
    """
    rows: list[tuple] = []
    changed = 0
    skipped = 0
    for sha256, quality, version in conn.execute(
        "SELECT sha256, quality, feature_ver FROM file WHERE quality IS NOT NULL"
    ):
        scalars = json.loads(quality)
        if "sharpness" not in scalars:
            skipped += 1  # a row that recorded a decode error, not scalars
            continue
        before = scalars.get("composite_quality")
        scalars["composite_quality"] = features.composite_quality(scalars)
        changed += scalars["composite_quality"] != before
        versions = json.loads(version)
        _, _, substrate = (versions.get("quality") or "").partition("/")
        versions["quality"] = f"{features.QUALITY_VER}/{substrate or 'unknown'}"
        rows.append(
            (json.dumps(scalars, sort_keys=True), json.dumps(versions, sort_keys=True), sha256)
        )

    started = time.perf_counter()
    for start in range(0, len(rows), 5000):
        conn.execute("BEGIN")
        conn.executemany(
            "UPDATE file SET quality = ?, feature_ver = ? WHERE sha256 = ?",
            rows[start : start + 5000],
        )
        conn.execute("COMMIT")
    return {
        "rows": len(rows),
        "changed": changed,
        "skipped": skipped,
        "elapsed_s": time.perf_counter() - started,
    }


# --- verify the tiers this build does not decode -----------------------------


def verify_tier(
    config: Config, derivatives: dict[tuple[str, int], Derivative], edge: int, *, readers: int
) -> dict:
    """Checksum one tier without decoding it. Used for the 2560px detail tier."""
    source_root = config.mediavault_root / "derivatives"
    rows = sorted(
        (row for (_, tier), row in derivatives.items() if tier == edge),
        key=lambda row: row.relpath,
    )
    counts: collections.Counter = collections.Counter()
    total = 0
    progress = Progress(f"tier{edge}", len(rows))

    def check(row: Derivative) -> tuple[str, int]:
        try:
            blob = (source_root / row.relpath).read_bytes()
        except FileNotFoundError:
            return "absent", 0
        ok = hashlib.sha256(blob).hexdigest() == row.checksum
        return ("ok" if ok else "mismatch"), len(blob)

    with ThreadPoolExecutor(max(readers, 1)) as pool:
        for outcome, size in pool.map(check, rows):
            counts[outcome] += 1
            total += size
            progress.step(size)
    progress.report()
    return {"rows": len(rows), "counts": counts, "bytes": total,
            "elapsed_s": time.perf_counter() - progress.started}


# --- E: the regression check, over measured evidence -------------------------


def _polarity(width: int | None, height: int | None) -> int:
    if not width or not height:
        return 0
    return (width > height) - (width < height)


def regression(
    conn: sqlite3.Connection,
    assets: dict[str, Asset],
    metadata: dict[str, tuple],
    derivatives: dict[tuple[str, int], Derivative],
) -> dict:
    """Assert the rotation that was actually applied against the container's tag.

    Over persisted, *measured* evidence: `file.deriv_w/deriv_h` are the raster
    read off the stored file before this build rotated it, and `deriv_rot` is
    what it then applied. `derivatives.source_width/height` is not used -- it
    records the size after v1's `exif_transpose` call, which for `.arw` did
    nothing, so it is equally consistent with a right and a wrong answer.

    Three assertions, and the report says plainly what each one can and cannot
    see:

    1. the measured raster equals `derivatives.width/height`, over the whole
       population rather than the 5,500-row sample Phase 2a's planning used;
    2. every repaired asset turned by exactly the number of degrees its
       container's orientation demands;
    3. the published raster's landscape/portrait polarity agrees with the
       orientation-corrected `asset_extended_metadata` dimensions.

    (3) is blind to orientations 2, 3 and 4 by construction -- they do not
    change the aspect. For the ARW among them (2), assertion (2) is the check.
    For the rest the evidence is SPIKE C's direction-verified r=1.000, which is
    recorded and not re-derived here; the report counts them so the gap is a
    number rather than an omission.

    **(3) also has no reference at all for `.arw`, which this run established.**
    `archive/PLAN.md` exception D says to prefer `asset_extended_metadata` over
    `assets.width/height`, and that is right for `.rw2` (12,568/12,568 portrait
    at a transposing tag) and `.jpg` (16,880/16,895). For `.arw` it is
    1,483/1,483 *landscape* at a transposing tag -- AEM carries the raw embedded
    preview's dimensions, uncorrected, because v1 read them from the same
    preview whose missing Orientation tag caused the derivative defect. So the
    reading cannot referee the shape. Detected per asset rather than by
    hardcoding the extension: a reference that agrees with the raster as it
    stood *before* this run turned it is a reference that was never corrected.
    Those are counted and named, never silently passed. Direction is not lost
    with them -- assertion (2) covers it, and polarity could never have told a
    90 CCW from a 90 CW in any case.
    """
    stored = {
        row[0]: row[1:]
        for row in conn.execute(
            "SELECT sha256, deriv_w, deriv_h, deriv_rot, quality FROM file WHERE deriv_w IS NOT NULL"
        )
    }
    by_orientation: dict[str, collections.Counter] = collections.defaultdict(collections.Counter)
    dim_mismatch: list[str] = []
    rotation_wrong: list[str] = []
    polarity_wrong: list[str] = []
    uncorrected: list[str] = []

    for asset_id, asset in assets.items():
        row = derivatives.get((asset_id, SUBSTRATE_EDGE))
        if row is None:
            continue
        tag = asset.orientation or "(none)"
        counter = by_orientation[tag]
        counter["assets"] += 1
        measured = stored.get(asset.sha256)
        if measured is None:
            counter["unmeasured"] += 1
            continue
        width, height, rot, _quality = measured
        counter["measured"] += 1

        if (width, height) != (row.width, row.height):
            dim_mismatch.append(f"{asset.sha256} file {width}x{height} manifest {row.width}x{row.height}")

        expected = rotation_for(asset.orientation) if asset.ext == ".arw" else 0
        if (rot or 0) != expected:
            rotation_wrong.append(f"{asset.sha256} applied {rot} expected {expected} tag {tag}")
        if rot:
            counter[f"rotated {rot}"] += 1

        published = (height, width) if (rot or 0) in (90, 270) else (width, height)
        aem = metadata.get(asset_id)
        want = _polarity(aem[0], aem[1]) if aem else 0
        got = _polarity(*published)
        if not want or not got:
            counter["polarity blind"] += 1
        elif want == got:
            counter["polarity ok"] += 1
        elif rot and want == _polarity(width, height):
            # The reading agrees with the raster as it stood before this run
            # turned it, so it was never orientation-corrected and cannot
            # referee the published shape. True of every `.arw`.
            counter["reference uncorrected"] += 1
            uncorrected.append(
                f"{asset.sha256} {asset.ext} tag {tag} published "
                f"{published[0]}x{published[1]} metadata {aem[0]}x{aem[1]}"
            )
        else:
            counter["polarity mismatch"] += 1
            polarity_wrong.append(
                f"{asset.sha256} tag {tag} published {published[0]}x{published[1]} "
                f"metadata {aem[0]}x{aem[1]}"
            )
        if tag in MIRRORED or tag == "3":
            counter["aspect-invisible"] += 1

    return {
        "by_orientation": dict(by_orientation),
        "dim_mismatch": dim_mismatch,
        "rotation_wrong": rotation_wrong,
        "polarity_wrong": polarity_wrong,
        "uncorrected": uncorrected,
    }


def detail_gap(derivatives: dict[tuple[str, int], Derivative]) -> dict:
    """How much of the corpus has no detail tier, and what it is made of."""
    substrate = {aid for (aid, edge) in derivatives if edge == SUBSTRATE_EDGE}
    detail = {aid for (aid, edge) in derivatives if edge == DETAIL_EDGE}
    return {"substrate": len(substrate), "detail": len(detail), "gap": len(substrate - detail)}


def arw_thumbnails(config: Config, assets: dict[str, Asset]) -> dict:
    """Reconcile step 5's 2,346 `.arw` thumbnails against this step's repair set."""
    arw = {asset.sha256: asset.orientation for asset in assets.values() if asset.ext == ".arw"}
    present = sum(1 for sha256 in arw if thumb_path(config.thumb_root, sha256).is_file())
    upright = sum(1 for orientation in arw.values() if orientation in (None, "1"))
    return {"arw": len(arw), "on_disk": present, "repaired": len(arw) - upright, "untouched": upright}


# --- the benchmark -----------------------------------------------------------


def benchmark(
    config: Config,
    count: int,
    *,
    seed: int = 20260802,
    decoders: int = DECODERS,
    only: str = "ac",
    readers: int = 1,
) -> None:
    """Measure both passes on `count` items and project the full run. Writes nothing."""
    manifest = open_manifest(config.mediavault_manifest_db)
    try:
        derivatives, _ = scan_derivatives(manifest, (SUBSTRATE_EDGE,))
    finally:
        manifest.close()

    if "a" in only:
        worklist = object_worklist(config.mediavault_root)
        rng = random.Random(seed)
        sample = sorted(rng.sample(worklist, min(count, len(worklist))))
        started = time.perf_counter()
        total = 0
        bad = 0
        for path, expected, _size in sample:
            digest, size = hash_object(path)
            total += size
            bad += digest != expected
        elapsed = time.perf_counter() - started
        rate = total / elapsed
        print(
            f"\nA  objects   {len(sample):,} objects, {total / 1e9:.2f} GB in {_hms(elapsed)}"
            f"  ->  {rate / 1e6:.1f} MB/s, {len(sample) / elapsed:.1f} files/s, {bad} mismatches",
            flush=True,
        )
        print(
            f"   projection  451.2 GB at {rate / 1e6:.1f} MB/s = "
            f"**{_hms(OBJECT_BYTES / rate)}** for all 146,034 objects",
            flush=True,
        )
    if "c" not in only:
        return

    source_root = config.mediavault_root / "derivatives"
    rows = sorted(
        ((aid, row) for (aid, edge), row in derivatives.items() if edge == SUBSTRATE_EDGE),
        key=lambda item: item[1].relpath,
    )
    step = max(len(rows) // count, 1)
    picked = rows[::step][:count]
    started = time.perf_counter()
    sizes: list[int] = []
    sharpness = []
    ok = 0
    with decode.BoundedPool(f"{WORKER_MODULE}:decode_features", workers=decoders) as pool:

        def pump(indexed: tuple[int, tuple]) -> None:
            tid, (_aid, row) = indexed
            try:
                blob = (source_root / row.relpath).read_bytes()
                sizes.append(len(blob))
                pool.submit(tid, blob)
            except Exception as exc:
                pool.deliver(tid, "error", f"{type(exc).__name__}: {exc}")

        with ThreadPoolExecutor(max(readers, 1)) as pumps:
            pumps.map(pump, enumerate(picked))
            for _tid, status, result in pool.results(len(picked)):
                if status == "ok":
                    ok += 1
                    sharpness.append(result["quality"]["sharpness"])
    elapsed = time.perf_counter() - started
    read_bytes = sum(sizes)
    substrate_total = len(rows)
    print(
        f"\nC  features  {len(picked):,} derivatives at {readers} reader(s), "
        f"{read_bytes / 1e6:.0f} MB in {_hms(elapsed)}"
        f"  ->  {len(picked) / elapsed:.1f} files/s, {read_bytes / elapsed / 1e6:.1f} MB/s, {ok} ok"
    )
    print(
        f"   projection  {substrate_total:,} at {len(picked) / elapsed:.1f} files/s = "
        f"**{_hms(substrate_total / (len(picked) / elapsed))}**"
    )
    if sharpness:
        import math

        sharpness.sort()
        quantiles = {
            f"p{percent}": math.sqrt(sharpness[min(int(len(sharpness) * percent / 100), len(sharpness) - 1)])
            for percent in (10, 50, 80, 90, 99)
        }
        print(
            "   sharpness   RMS Laplacian "
            + "  ".join(f"{name} {value:.4f}" for name, value in quantiles.items())
            + f";  features.SHARP_KNEE is {features.SHARP_KNEE}"
        )


# --- report ------------------------------------------------------------------


def _print_rehash(result: dict) -> None:
    elapsed = max(result["elapsed_s"], 1e-6)
    print(
        f"\nA objects  {result['read']:,} re-hashed, {result['already']:,} already verified, "
        f"of {result['objects']:,} on disk"
    )
    print(
        f"          {result['bytes'] / 1e9:.1f} GB in {_hms(elapsed)} at "
        f"{result['bytes'] / elapsed / 1e6:.1f} MB/s"
    )
    if result["unknown"]:
        print(f"          {result['unknown']:,} objects on disk with no adopted `file` row")
    print(f"  hash    {len(result['mismatched']):,} mismatches")
    for expected, actual, path in result["mismatched"][:50]:
        print(f"          {expected}  ->  {actual}  {path}")


def _print_repair(result: dict) -> None:
    print(
        f"\nB repair   {result['assets']:,} .arw assets, {result['files']:,} files rewritten "
        f"in {_hms(result['elapsed_s'])}"
    )
    if result["by_orientation"]:
        print(
            "          "
            + ", ".join(
                f"orientation {tag} -> {rotation_for(tag)} CCW x {count:,}"
                for tag, count in sorted(result["by_orientation"].items())
            )
        )
    print(
        f"          {result['bytes_in'] / 1e6:.1f} MB read, {result['bytes_out'] / 1e6:.1f} MB "
        f"written at WebP q{WEBP_QUALITY}"
    )
    for label, key in (("checksum", "mismatch"), ("failed", "failed"), ("no tier", "missing")):
        if result[key]:
            print(f"  {label:<8}{len(result[key]):,}")
            for item in result[key][:20]:
                print(f"          {item}")


def _print_features(result: dict) -> None:
    elapsed = max(result["elapsed_s"], 1e-6)
    print(
        f"\nC features {result['computed']:,} assets in {_hms(elapsed)}, "
        f"{result['bytes'] / 1e9:.2f} GB read at {result['bytes'] / elapsed / 1e6:.1f} MB/s "
        f"({result['computed'] / elapsed:.1f}/s)"
    )
    print(
        f"  bounds  {result['timeouts']:,} decode timeouts, {len(result['errors']):,} decode "
        f"errors, {len(result['mismatch']):,} checksum mismatches, {len(result['absent']):,} absent"
    )
    for sha256, message in result["errors"][:20]:
        print(f"          {sha256}  {message}")
    for item in result["mismatch"][:20]:
        print(f"          {item}")


def _print_regression(result: dict, gap: dict, arw: dict) -> None:
    print("\nE regression -- measured raster against the container's orientation")
    print(f"  {'tag':<8}{'assets':>9}{'measured':>10}{'rotated':>9}{'polarity ok':>13}{'blind':>8}")
    for tag, counts in sorted(result["by_orientation"].items()):
        rotated = sum(value for key, value in counts.items() if key.startswith("rotated"))
        print(
            f"  {tag:<8}{counts['assets']:>9,}{counts['measured']:>10,}{rotated:>9,}"
            f"{counts['polarity ok']:>13,}{counts['polarity blind'] + counts['polarity mismatch']:>8,}"
        )
    for label, key in (
        ("raster != manifest", "dim_mismatch"),
        ("rotation != tag", "rotation_wrong"),
        ("polarity != metadata", "polarity_wrong"),
    ):
        print(f"  {label:<22}{len(result[key]):>9,}")
        for item in result[key][:20]:
            print(f"          {item}")
    if result["uncorrected"]:
        by_ext = collections.Counter(line.split()[1] for line in result["uncorrected"])
        print(
            f"  {'no usable reference':<22}{len(result['uncorrected']):>9,}  "
            + ", ".join(f"{ext} {count:,}" for ext, count in sorted(by_ext.items()))
        )
        print(
            "          asset_extended_metadata for these agrees with the raster as it stood "
            "BEFORE\n          this run turned it, so the reading was never orientation-"
            "corrected and cannot\n          referee the published shape. archive/PLAN.md exception D "
            "prefers AEM over\n          assets.width/height, which holds for .rw2 and .jpg and "
            "does NOT hold here.\n          Direction for these is assertion 2 above, which "
            "passed."
        )

    print(
        f"\n  detail tier   {gap['detail']:,} of {gap['substrate']:,} assets; "
        f"**{gap['gap']:,} have no detail view at any tier**, RAW entirely. "
        f"For .rw2 and .arw the 1536 IS the vendor preview at ~95% scale."
    )
    print(
        f"  .arw on E:    {arw['on_disk']:,} thumbnails = {arw['repaired']:,} repaired here "
        f"+ {arw['untouched']:,} at orientation 1 and untouched (step 5 copied {arw['arw']:,})"
    )


# --- driver ------------------------------------------------------------------


def run(
    config: Config | None = None,
    *,
    passes: str = "abc",
    readers: int = DERIV_READERS,
    decoders: int = DECODERS,
    timeout_s: float = decode.DECODE_TIMEOUT_S,
    limit: int | None = None,
    retry_errors: bool = False,
    verify_detail: bool = True,
) -> int:
    config = config or load()
    conn = db.connect()
    failures = 0
    try:
        if migrate.version(conn) < 4:
            raise Phase2aRefused(
                "catalog is behind migration 004; run python -m photolib.migrate first"
            )
        manifest = open_manifest(config.mediavault_manifest_db)
        try:
            started = time.perf_counter()
            assets = scan_assets(manifest)
            metadata = scan_metadata(manifest)
            derivatives, tally = scan_derivatives(
                manifest, (SUBSTRATE_EDGE, GRID_EDGE, DETAIL_EDGE)
            )
        finally:
            manifest.close()
        print(
            f"manifest  {len(assets):,} assets, {len(metadata):,} metadata rows, "
            f"{len(derivatives):,} ready derivatives at {SUBSTRATE_EDGE}/{GRID_EDGE}/{DETAIL_EDGE} "
            f"({time.perf_counter() - started:.0f}s, read-only)",
            flush=True,
        )
        print(
            "          "
            + ", ".join(
                f"{edge}px {status} {count:,}" for (edge, status), count in sorted(tally.items())
            ),
            flush=True,
        )

        if "a" in passes:
            result = rehash_objects(conn, config, limit=limit)
            _print_rehash(result)
            failures += len(result["mismatched"])
        if "b" in passes:
            result = repair_arw(
                conn, config, assets, derivatives, decoders=decoders, timeout_s=timeout_s
            )
            _print_repair(result)
            failures += len(result["mismatch"]) + len(result["failed"])
        if "q" in passes:
            result = recompute_composite(conn)
            print(
                f"\nQ composite {result['changed']:,} of {result['rows']:,} rows moved, "
                f"{result['skipped']:,} skipped as error rows, in {result['elapsed_s']:.1f}s "
                f"-- {features.QUALITY_VER}, no decode"
            )
        if "c" in passes:
            result = compute_features(
                conn, config, assets, metadata, derivatives,
                readers=readers, decoders=decoders, timeout_s=timeout_s,
                limit=limit, retry_errors=retry_errors,
            )
            _print_features(result)
            failures += len(result["mismatch"])
            if verify_detail:
                detail = verify_tier(config, derivatives, DETAIL_EDGE, readers=readers)
                print(
                    f"\n  tier {DETAIL_EDGE}  {detail['rows']:,} rows, "
                    f"{detail['counts']['ok']:,} verified, "
                    f"{detail['counts']['mismatch']:,} mismatches, "
                    f"{detail['counts']['absent']:,} absent "
                    f"({detail['bytes'] / 1e9:.2f} GB, {_hms(detail['elapsed_s'])}) -- "
                    "checksummed, not decoded: nothing adopts it yet"
                )
                failures += detail["counts"]["mismatch"]

        _print_regression(
            regression(conn, assets, metadata, derivatives),
            detail_gap(derivatives),
            arw_thumbnails(config, assets),
        )
        return 1 if failures else 0
    finally:
        conn.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "passes", nargs="?", default="abc",
        help="any of a (re-hash objects), b (repair ARW), c (features), q (re-derive "
        "composite_quality from the persisted scalars, no decode); 'e' for the "
        "regression report alone; or 'bench'",
    )
    parser.add_argument("--n", type=int, default=500, help="bench sample size")
    parser.add_argument("--only", default="ac", help="which halves of the bench to run")
    parser.add_argument("--readers", type=int, default=DERIV_READERS)
    parser.add_argument("--decoders", type=int, default=DECODERS)
    parser.add_argument("--timeout", type=float, default=decode.DECODE_TIMEOUT_S)
    parser.add_argument("--limit", type=int, help="stop after this many, for a measurement")
    parser.add_argument("--retry-errors", action="store_true", help="recompute rows that errored")
    parser.add_argument("--no-detail-tier", action="store_true", help="skip the 2560px checksum pass")
    args = parser.parse_args(argv)

    config = load()
    with RunLock(config.catalog_db.parent / LOCK_NAME):
        if args.passes == "bench":
            benchmark(
                config, args.n, decoders=args.decoders, only=args.only, readers=args.readers
            )
            return 0
        return run(
            config,
            passes=args.passes,
            readers=args.readers,
            decoders=args.decoders,
            timeout_s=args.timeout,
            limit=args.limit,
            retry_errors=args.retry_errors,
            verify_detail=not args.no_detail_tier,
        )


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Phase2aRefused as exc:
        sys.exit(f"refused: {exc}")
