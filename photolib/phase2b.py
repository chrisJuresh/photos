"""Phase 2b: the gap fill, and the only step that reads the photos root.

Read-only against `G:\\photos`. Nothing there is written, moved, renamed or
deleted; the one write outside the catalog is a *copy* into
`G:\\vault\\.staging\\`, plus the derivatives on `G:\\vault\\deriv` and `E:`.

Two populations, and this is deliberately one pipeline with two entry points
rather than two pipelines:

**1 -- the recoverable preprocessing failures.** 1,659 MediaVault assets whose
v1 derivative is an `error` row and whose format this build can now decode:
1,476 by video extension, 146 `.dng`, 37 still images. They are read from the
*MediaVault object*, which is already local and was re-hashed against its own
filename in Phase 2a, so there is no second verification read here. v1 failed
all of them because it had neither ffmpeg nor libraw -- every video and every
DNG failed, which is a decoder gap and not an interrupted run.

  **1,252 of the 1,659 decoded; 407 did not, and 406 of those are under 50 KB.**
  The single failure above that is one `.dng` holding 5.2 MB where its own
  header declares a 25 MB frame -- truncated, and reported rather than patched.
  Of the rest, **295 are TypeScript source files named `.mts`**: their first
  bytes are `export `, `import ` and `/**`, and they are the same v1
  extension-table error as the 18,789 `.ts` counted as video, under a second
  extension nobody checked. The remaining ~110 are empty or truncated media
  stubs -- a 0-byte `.png`, a 3-byte `.jpg`, RIFF and EBML headers with nothing
  behind them. None of the 407 is a decoder this build is missing, and every one
  of them is excluded by the rule set in any case.

**2 -- the inventory gap.** Everything Phase 0 found with no MediaVault asset
*and* that survives the triage rule set. Those are staged out of `G:\\photos`
into `G:\\vault\\.staging\\` -- copied, re-hashed against `origin.sha256`, and
only then decoded -- after which they join population 1's pipeline exactly.

  **On this corpus that worklist is empty.** Under the 391-rule set every one
  of the 38,376 surviving files is already a MediaVault object, and the 641,764
  never-read `file` rows are excluded to the last one. That is the measurement
  the plan asked for in place of the mythical 8,052-file gap, and it is a
  property of the rule set rather than of this code: change triage, re-run, and
  the same pass stages whatever newly survives.

**One decode per file.** From the single pixel array come all of: the 1536px
WebP substrate on `deriv_root`, the 384px WebP grid tile on `thumb_root`,
ThumbHash, pHash, dHash and the 18 quality scalars. The hashes and scalars are
computed from the *substrate* array and not from the native one, because Phase
2a computed its 103,207 off a 1536px derivative and a cover ranker comparing the
two inside one stack would be comparing incompatible measurements.

**Three decode paths, and `feature_ver` records which one ran.**

* *video* -- one ffmpeg poster frame. `thumbnail=N` picks a representative frame
  out of the first N rather than trusting frame zero, which is black far more
  often than not; unlike `-ss` it needs no duration probe and works on a clip
  shorter than a second. `scale` runs *before* it, which is what bounds the
  filter graph's buffer -- see `POSTER_FRAMES`, and the 101 4K videos that
  taught it.
* *raw* -- the embedded preview when it is big enough to make the substrate, a
  half-size demosaic when it is not. The plan's rule is "extract the embedded
  preview, never decode sensor data", and its premise is a cost one: ~50 ms
  against 1-3 s. Neither half of that premise holds for this corpus's DNG. The
  preview these 146 Galaxy S8 files carry is a 504x376 bitmap -- a substrate
  built from it would be a third of the size in each direction and would score
  `thumbnail_likelihood` 0.21 on every one of them -- while a half-size demosaic
  measures **0.102 s** and yields 2016x1512, comfortably over the substrate. So
  the preference is stated as a threshold rather than as a format,
  `RAW_PREVIEW_MIN_EDGE`, and the path taken is recorded per file.
* *still* -- a normal decode, EXIF orientation applied, truncation tolerated and
  flagged.

**Bounds.** Every decode runs inside `photolib.decode`, under the parent's
wall-clock timeout, the output cap and the Windows job-object memory cap. The
ffmpeg subprocess carries a second, shorter wall-clock timeout of its own, so
the inner bound normally fires first and the pool's is the backstop for a worker
that wedged somewhere else; its output is one frame, scaled to at most
`POSTER_EDGE`, and checked against the cap on return. exiftool is one
`-stay_open` process for the whole run, and each round trip through it carries
its own deadline and byte cap. `F55` and `F56` are the same underlying problem
seen from two sides, and `F55` is a hang rather than a crash, which is worse.

Idempotent and restartable at row granularity: a file is done when
`file.quality` is not NULL, staging is done when `file.state = 'staged'`, and
both derivatives are on disk before either is recorded. One process, one lock
file. No job ledger and no leases -- nothing here is enqueued by an HTTP request.
"""

from __future__ import annotations

import argparse
import collections
import hashlib
import io
import json
import os
import shutil
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path

from photolib import db, decode, features, migrate, triage
from photolib.adopt_mediavault import open_manifest
from photolib.config import Config, load
from photolib.phase2a import LOCK_NAME as PHASE2A_LOCK
from photolib.phase2a import Progress, RunLock, _hms, deriv_path
from photolib.thumbnails import thumb_path

SUBSTRATE_EDGE = 1536  # the working substrate, written to deriv_root
GRID_EDGE = 384  # the grid tile on the NVMe; what /t/<sha>.webp serves
WEBP_QUALITY = 90  # matches Phase 2a's repair and MediaVault's own encode

# ffmpeg emits the poster at the source's own size up to this bound, so the
# pixels the substrate is built from are the real frame rather than something
# ffmpeg already resampled. 2560 is above every frame in this corpus (the
# largest is 1920x1080), which is what makes the recorded dimensions native; a
# frame that had to be scaled records none. It also bounds one frame at
# 2560*2560*3 = 19.7 MB, well under the pool's 64 MB output cap.
POSTER_EDGE = 2560
# ffmpeg's `thumbnail` filter picks one representative frame out of N -- and
# buffers all N to do it. At 100 frames of 3840x2160 yuv420p that is 1.24 GB,
# which is over the worker's 1 GiB job-object cap, so ffmpeg allocated nothing
# and wrote nothing: 101 perfectly good `.mp4` up to 1.8 GB failed on the first
# full run with "Nothing was written into output file", every one of them 4K.
# The cap was right and the filter graph was wrong.
#
# The fix is the filter *order*, not a bigger cap or a smaller N: `scale` runs
# first, so the buffer is N frames at POSTER_EDGE whatever the source
# resolution -- 30 * 2560*2560*1.5 = 295 MB worst case, a bound tied to a
# constant in this file rather than to what a stranger's camera recorded. N
# drops to 30 because the extra scaling is per buffered frame.
POSTER_FRAMES = 30

# Below this the embedded RAW preview cannot make a substrate and the half-size
# demosaic runs instead. See the module docstring: 504x376 against 1536.
RAW_PREVIEW_MIN_EDGE = SUBSTRATE_EDGE

# Phase 2a decoded 1536px derivatives, so `decode.MAX_PIXELS` of 32M was, in its
# own words, "far above" what it would meet. This step decodes *originals*, and
# the corpus holds three stitched panoramas of 91, 141 and 147 megapixels that
# the inherited cap refused. 160M covers them with headroom at ~480 MB of RGB,
# comfortably inside the worker's 1 GiB job-object cap -- which is the bound
# that actually matters, and which stays exactly where it was. Raising a pixel
# count is not the same as removing a memory limit.
#
# Video and raw keep the inherited cap: a poster frame is at most POSTER_EDGE
# squared and a half-size demosaic of this corpus's largest raw is 12M.
STILL_MAX_PIXELS = 160_000_000

FFMPEG_TIMEOUT_S = 60.0  # the inner bound; the pool's is the backstop
DECODE_TIMEOUT_S = 120.0  # generous: a 1.8 GB .mp4 poster measured 2.6 s
EXIFTOOL_TIMEOUT_S = 30.0
EXIFTOOL_MAX_BYTES = 4 << 20

# One head on a USB HDD, so the image pass is the shape Phase 2a pass C
# measured: a couple of readers feeding twelve decoders.
#
# Video is *not* that shape, and this is the one place `PLAN.md`'s "more readers
# is slower, not faster" does not hold. ffmpeg is both the reader and the
# decoder, but a poster frame reads the head of a file and stops -- 445 videos
# decoded 702 MB out of 4.6 GB of container -- so the cost is process startup
# and CPU, not bandwidth. Measured over the same 445-file sample:
#
#     2 workers   1.65 files/s      8 workers  10.67 files/s
#     4 workers   5.10 files/s     12 workers  12.77 files/s
#
# which is very nearly linear and settles the number at twelve. It is a
# statement about poster frames specifically: anything that read whole videos
# would be back on the bandwidth curve.
READERS = 2
DECODERS = 12
VIDEO_WORKERS = 12
STAGE_READERS = 2

COMMIT_ROWS = 200
HASH_CHUNK = 8 << 20
LOCK_NAME = "phase2b.lock"

VIDEO_EXT = frozenset(
    {".mp4", ".mts", ".mkv", ".avi", ".mov", ".webm", ".m4v", ".h264", ".h265", ".ogg"}
)
RAW_EXT = frozenset({".dng"})
STILL_EXT = frozenset({".jpg", ".jpeg", ".png"})
DECODABLE = VIDEO_EXT | RAW_EXT | STILL_EXT

WORKER_MODULE = __spec__.name if __spec__ else __name__


class Phase2bRefused(RuntimeError):
    """Raised before anything is read or written. Nothing happened."""


# --- the external tools ------------------------------------------------------


def _tool(name: str, env_var: str) -> str:
    """An absolute path to `name`, from the environment or from PATH.

    Resolved once, in the parent, and handed to the workers, so a worker never
    searches PATH -- and never its own working directory, which is the other
    half of `F50`.
    """
    found = os.environ.get(env_var) or shutil.which(name)
    if not found or not Path(found).is_file():
        raise Phase2bRefused(f"{name} was not found; set {env_var} to its absolute path")
    return str(Path(found).resolve())


# --- what has to be done -----------------------------------------------------


@dataclass(frozen=True, slots=True)
class Item:
    """One file to decode, and the local copy it will be decoded from."""

    sha256: str
    ext: str
    source: str  # absolute path to the MediaVault object or the staged copy
    staged: bool  # True when it came from the photos root, not from MediaVault

    @property
    def path_kind(self) -> str:
        if self.ext in VIDEO_EXT:
            return "video"
        return "raw" if self.ext in RAW_EXT else "still"


def _source_path(config: Config, state: str, vault_relpath: str) -> str:
    """Where a `file` row's bytes actually are.

    `vault_relpath` is relative to MediaVault for an adopted object and to the
    vault for a staged copy or a promoted one. Step 14 moved the objects, so
    `published` joins `staged` on the vault side while `read` stays on
    MediaVault's -- and the 23 kept files carrying an `{"error": ...}` quality
    stub are reachable by `--retry-errors` after promotion only because of this.
    """
    root = config.mediavault_root if state == "read" else config.vault_root
    return str(root / vault_relpath)


def worklist(conn, config: Config, *, exts: frozenset[str] = DECODABLE) -> list[Item]:
    """Every file with no features, a decoder for its format, and local bytes.

    Driven off `file.quality IS NULL`, which is the same idempotence key Phase
    2a used and the reason a killed run resumes with no bookkeeping of its own.
    """
    rows = conn.execute(
        "SELECT sha256, lower(ext), state, vault_relpath FROM file "
        "WHERE quality IS NULL AND vault_relpath IS NOT NULL "
        "AND state IN ('read', 'staged', 'published') ORDER BY sha256"
    ).fetchall()
    return [
        Item(sha256, ext, _source_path(config, state, relpath), state == "staged")
        for sha256, ext, state, relpath in rows
        if ext in exts
    ]


def gap_worklist(conn, rules: list[triage.Rule] | None = None) -> list[tuple[str, str, int]]:
    """`(sha256, path, size)` for every kept file whose bytes have never been read.

    Population 2. The verdict is `triage`'s own, generated in one place so this
    can never disagree with the number the UI printed. A file is kept when *any*
    of its paths is kept -- the bytes are identical, so one surviving copy is
    enough -- and `min(path)` picks the name to read for the same reason.
    """
    rules = triage.load_rules(conn) if rules is None else rules
    verdict = triage.verdict_expression(rules)
    sql = verdict.query(
        f"""per AS (
      SELECT g.sha256 AS sha256, max({verdict.kept}) AS kept, min(g.path) AS path
      FROM origin g
      JOIN triage_path tp ON tp.origin_id = g.id
      JOIN triage_bucket k ON k.id = tp.bucket_id
      {verdict.join}
      GROUP BY g.sha256
    )""",
        tail="""SELECT per.sha256, per.path, f.size
      FROM per
      JOIN file f ON f.sha256 = per.sha256
      LEFT JOIN state.triage_override o ON o.sha256 = per.sha256
      WHERE f.state = 'pending'
        AND coalesce(CASE o.decision WHEN 'include' THEN 1 WHEN 'exclude' THEN 0 END,
                     per.kept) = 1
      ORDER BY per.path""",
    )
    return conn.execute(sql, verdict.params).fetchall()


# --- population 2: stage out of the photos root ------------------------------


def staging_path(staging_root: Path, sha256: str) -> Path:
    """`<staging_root>\\<aa>\\<bb>\\<sha256>.blob`, content-addressed.

    Named by content and not by origin path, so a file that reaches the vault
    under twenty names is one staged copy, and step 14's promotion is a rename
    rather than a decision.
    """
    return staging_root / sha256[:2] / sha256[2:4] / f"{sha256}.blob"


def _copy_verified(source: Path, target: Path) -> tuple[str, int, Path]:
    """Copy `source` to a `.part` beside `target`, hashing the bytes as they pass.

    One read of the source, not two: the digest is taken from the same buffer
    that is written, so a file that changed between a hash and a copy cannot
    slip through the gap between them. The source is opened read-only and is
    never touched again.
    """
    target.parent.mkdir(parents=True, exist_ok=True)
    partial = target.with_name(target.name + ".part")
    digest = hashlib.sha256()
    total = 0
    with open(source, "rb", buffering=0) as reader, open(partial, "wb") as writer:
        while chunk := reader.read(HASH_CHUNK):
            digest.update(chunk)
            writer.write(chunk)
            total += len(chunk)
    return digest.hexdigest(), total, partial


def stage_gap(
    conn, config: Config, todo: list[tuple[str, str, int]], *, readers: int = STAGE_READERS
) -> dict:
    """Copy population 2 into staging, verifying every byte against `origin.sha256`.

    The photos root is opened read-only. A copy whose digest disagrees with the
    catalog is a hard error: the `.part` is removed, no `file` row moves, and the
    name is reported. Nothing is repaired in place and nothing under `G:\\photos`
    is written.

    `state = 'staged'` is set only once the verified bytes are in place under
    their final name, so a kill mid-copy leaves a `.part` and redoes the file.
    """
    if not todo:
        return {"staged": 0, "bytes": 0, "mismatched": [], "failed": [], "elapsed_s": 0.0}

    mismatched: list[str] = []
    failed: list[tuple[str, str]] = []
    rows: list[tuple] = []
    lock = threading.Lock()
    progress = Progress("stage", len(todo), float(sum(size or 0 for _, _, size in todo)))

    def stage_one(entry: tuple[str, str, int]) -> None:
        sha256, path, _size = entry
        target = staging_path(config.staging_root, sha256)
        partial = None
        try:
            digest, total, partial = _copy_verified(Path(path), target)
            if digest != sha256:
                partial.unlink(missing_ok=True)
                with lock:
                    mismatched.append(f"{sha256} read as {digest} from {path}")
                    progress.step()
                return
            os.replace(partial, target)
            relpath = str(target.relative_to(config.vault_root))
            with lock:
                rows.append((relpath, sha256))
                progress.step(total)
                if len(rows) >= COMMIT_ROWS:
                    _commit_staged(conn, rows)
        except Exception as exc:
            if partial is not None:
                partial.unlink(missing_ok=True)
            with lock:
                failed.append((sha256, f"{type(exc).__name__}: {exc}"))
                progress.step()

    with ThreadPoolExecutor(max(readers, 1)) as pool:
        list(pool.map(stage_one, todo))
    _commit_staged(conn, rows)
    progress.report()
    return {
        "staged": len(todo) - len(mismatched) - len(failed),
        "bytes": progress.bytes,
        "mismatched": mismatched,
        "failed": failed,
        "elapsed_s": time.perf_counter() - progress.started,
    }


def _commit_staged(conn, rows: list[tuple]) -> None:
    if not rows:
        return
    conn.execute("BEGIN")
    conn.executemany(
        "UPDATE file SET state = 'staged', vault_relpath = ? "
        "WHERE sha256 = ? AND state = 'pending'",
        rows,
    )
    conn.execute("COMMIT")
    rows.clear()


# --- the decode workers ------------------------------------------------------
#
# Module level so `photolib.decode`'s spawned workers can import them by name.
# Each returns everything derived from its one pixel array: the two encoded
# derivatives and every scalar. Returning the array itself would put a 20 MB
# pickle through the result queue per file and decide nothing.


def _poster_frame(ffmpeg: str, path: str, timeout_s: float) -> tuple[bytes, bool]:
    """One representative frame of a video, as an uncompressed BMP.

    BMP rather than PNG because the frame is decoded again immediately and a
    compress/decompress round trip buys nothing, and because its header carries
    the dimensions so nothing has to be told the frame size out of band.

    The `scale` expression never upscales: `min(POSTER_EDGE, iw)` on the long
    side and `-2` on the short one, so a 320x240 clip stays 320x240 and only
    something over the bound is resampled. `-2` keeps the result even, which
    several encoders require and which costs at most one pixel.

    `scale` precedes `thumbnail` deliberately -- see `POSTER_FRAMES`. It is what
    keeps the filter graph's buffer bounded by a constant in this file instead
    of by the source resolution.
    """
    scale = (
        f"scale='if(gt(a,1),min({POSTER_EDGE},iw),-2)':"
        f"'if(gt(a,1),-2,min({POSTER_EDGE},ih))'"
    )
    command = [
        ffmpeg, "-nostdin", "-hide_banner", "-loglevel", "error",
        "-i", path,
        "-map", "0:v:0",
        "-frames:v", "1",
        "-vf", f"{scale},thumbnail={POSTER_FRAMES}",
        "-f", "image2", "-c:v", "bmp", "pipe:1",
    ]
    done = subprocess.run(
        command, capture_output=True, timeout=timeout_s,
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
    )
    if not done.stdout:
        said = done.stderr.decode("utf-8", "replace").strip().splitlines()
        raise ValueError(f"ffmpeg produced no frame: {said[-1] if said else done.returncode}")
    # A non-zero exit that still produced a frame is a partial decode, which is
    # evidence worth recording rather than a reason to throw the pixels away.
    return done.stdout, done.returncode != 0


def _apply_flip(image, flip: int):
    """libraw's `flip` code, applied to a preview it handed back unrotated.

    `postprocess` consults the flip itself; `extract_thumb` does not, and
    returns the thumbnail exactly as the camera stored it. 0 is upright, and 3,
    5 and 6 are 180, 90 CW and 90 CCW. Anything else is left alone rather than
    guessed at.
    """
    from PIL import Image

    turn = {3: Image.ROTATE_180, 5: Image.ROTATE_270, 6: Image.ROTATE_90}.get(flip)
    return image.transpose(turn) if turn else image


def _raw_array(blob: bytes):
    """`(rgb, native_size, path)` for a raw file, never touching sensor data twice.

    The embedded preview when it can make the substrate, a half-size demosaic
    when it cannot. Both come back upright.
    """
    import numpy as np
    import rawpy
    from PIL import Image

    with rawpy.imread(io.BytesIO(blob)) as raw:
        sizes = raw.sizes
        native = (sizes.width, sizes.height)
        try:
            thumb = raw.extract_thumb()
        except (rawpy.LibRawError, AttributeError, ValueError):
            thumb = None
        if thumb is not None:
            if thumb.format == rawpy.ThumbFormat.JPEG:
                preview = Image.open(io.BytesIO(thumb.data))
                preview.load()
            else:
                preview = Image.fromarray(thumb.data)
            if max(preview.size) >= RAW_PREVIEW_MIN_EDGE:
                upright = _apply_flip(preview, sizes.flip).convert("RGB")
                return np.asarray(upright), native, "raw-preview"
        rgb = raw.postprocess(half_size=True, use_camera_wb=True, output_bps=8)
    return rgb, native, "raw-halfdemosaic"


def _derive(image, native: tuple[int, int] | None, source: str, incomplete: bool) -> dict:
    """Everything this build wants out of one pixel array.

    The substrate is produced first and every hash and scalar is computed from
    *it*, not from the native array: Phase 2a's 103,207 assets were measured off
    a 1536px derivative, and cover ranking compares members inside one stack.
    """
    import numpy as np
    from PIL import Image

    if not isinstance(image, Image.Image):
        image = Image.fromarray(image)
    if image.mode != "RGB":
        image = image.convert("RGB")

    # `image` is not read again, so it is resized in place rather than copied.
    # The copy was costing a second full-size buffer, which for a 147 megapixel
    # panorama is 441 MB and was enough on its own to trip the worker's memory
    # cap. `thumbnail` never upscales, so a small frame passes through untouched.
    substrate = image
    substrate.thumbnail((SUBSTRATE_EDGE, SUBSTRATE_EDGE), Image.LANCZOS)
    tile = substrate.copy()
    tile.thumbnail((GRID_EDGE, GRID_EDGE), Image.LANCZOS)

    substrate_webp = io.BytesIO()
    substrate.save(substrate_webp, format="WEBP", quality=WEBP_QUALITY, method=6)
    tile_webp = io.BytesIO()
    tile.save(tile_webp, format="WEBP", quality=WEBP_QUALITY, method=6)

    array = np.asarray(substrate)
    gray = substrate.convert("L")
    small = substrate.convert("RGBA")
    small.thumbnail((100, 100), Image.LANCZOS)
    return {
        "substrate": substrate_webp.getvalue(),
        "tile": tile_webp.getvalue(),
        "deriv_w": substrate.width,
        "deriv_h": substrate.height,
        "native_w": native[0] if native else None,
        "native_h": native[1] if native else None,
        "source": source,
        "phash": features.phash(
            np.asarray(gray.resize((features.HASH_SIDE,) * 2, Image.LANCZOS), dtype=np.float64)
        ),
        "dhash": features.dhash(np.asarray(gray.resize((9, 8), Image.LANCZOS), dtype=np.float64)),
        "thumbhash": features.thumbhash(np.asarray(small)),
        "quality": features.pixel_features(array, incomplete=incomplete),
    }


def decode_video(payload: tuple, max_pixels: int) -> dict:
    """Poster frame, then everything derived from it. Runs in a bounded worker."""
    from PIL import Image

    path, ffmpeg, timeout_s = payload
    frame, incomplete = _poster_frame(ffmpeg, path, timeout_s)
    if len(frame) > decode.MAX_OUTPUT_BYTES:
        raise ValueError(f"poster frame of {len(frame):,} bytes is over the cap")
    image = Image.open(io.BytesIO(frame))
    if image.width * image.height > max_pixels:
        raise ValueError(f"{image.width}x{image.height} exceeds the {max_pixels:,}-pixel cap")
    image.load()
    # A frame ffmpeg had to scale is no longer the source's own size, so it
    # records no dimensions rather than a resampled pair presented as native.
    native = None if max(image.size) >= POSTER_EDGE else image.size
    result = _derive(image, native, "poster:ffmpeg", incomplete)
    result["bytes_in"] = len(frame)
    return result


def decode_raw(payload: bytes, max_pixels: int) -> dict:
    """Embedded preview or half-size demosaic. Runs in a bounded worker."""
    rgb, native, source = _raw_array(payload)
    height, width = rgb.shape[:2]
    if width * height > max_pixels:
        raise ValueError(f"{width}x{height} exceeds the {max_pixels:,}-pixel cap")
    result = _derive(rgb, native, source, False)
    result["bytes_in"] = len(payload)
    return result


def _open_still(blob: bytes, max_pixels: int):
    """Open an encoded still, refusing an oversized one before its pixels load.

    Phase 2a's `_open_bounded` decodes 1536px derivatives and needs nothing more.
    This one opens *originals*, so it adds the step that makes a 147 megapixel
    JPEG affordable: `draft` asks libjpeg to scale in the DCT domain during
    decoding, at a power-of-two ratio, which costs one buffer instead of one
    buffer per magnitude of oversampling. The target is twice the substrate, so
    at least 2x oversampling always survives into the LANCZOS step -- the same
    `reducing_gap` Pillow's own `thumbnail` uses -- and a merely ordinary photo
    is unaffected.

    `draft` rewrites `size`, so the native dimensions are read first. It is a
    no-op for every format that is not JPEG.
    """
    from PIL import Image, ImageFile

    image = Image.open(io.BytesIO(blob))
    native = image.size
    if native[0] * native[1] > max_pixels:
        raise ValueError(f"{native[0]}x{native[1]} exceeds the {max_pixels:,}-pixel cap")
    image.draft("RGB", (SUBSTRATE_EDGE * 2, SUBSTRATE_EDGE * 2))
    try:
        image.load()
        return image, native, False
    except OSError:
        # A truncated file is decoded again with truncation tolerated and
        # flagged: a partial image is evidence worth recording, an exception is
        # not.
        previous = ImageFile.LOAD_TRUNCATED_IMAGES
        ImageFile.LOAD_TRUNCATED_IMAGES = True
        try:
            image = Image.open(io.BytesIO(blob))
            image.draft("RGB", (SUBSTRATE_EDGE * 2, SUBSTRATE_EDGE * 2))
            image.load()
            return image, native, True
        finally:
            ImageFile.LOAD_TRUNCATED_IMAGES = previous


def decode_still(payload: bytes, max_pixels: int) -> dict:
    """A normal decode, truncation tolerated and flagged. Runs in a bounded worker."""
    from PIL import ImageOps

    image, native, incomplete = _open_still(payload, max_pixels)
    # A JPEG carrying EXIF orientation has to be turned before anything is
    # measured off it. Unlike Phase 2a's `.arw` the tag is right here in the file
    # being decoded, so there is nothing to reconstruct.
    image = ImageOps.exif_transpose(image) or image
    result = _derive(image, native, "decode", incomplete)
    result["bytes_in"] = len(payload)
    return result


# --- exiftool, one process ---------------------------------------------------


class ExifTool:
    """One `-stay_open` process for the whole run, not one spawn per file.

    Only population 2 needs it: a MediaVault asset's readings were adopted into
    the manifest in step 3, and re-reading them off the object would be the same
    numbers at a thousand times the cost.

    Bounded like every other subprocess here. Each round trip carries a
    wall-clock deadline and a cap on how much may arrive before the `{ready}`
    sentinel; either one kills the process rather than waiting, and the caller
    gets nothing for that file instead of a hang.
    """

    TAGS = (
        "-j", "-n", "-Software", "-CreatorTool", "-HistoryAction",
        "-ImageWidth", "-ImageHeight",
    )

    def __init__(self, exiftool: str, *, timeout_s: float = EXIFTOOL_TIMEOUT_S) -> None:
        self.exiftool = exiftool
        self.timeout_s = timeout_s
        self.proc: subprocess.Popen | None = None
        self._serial = 0

    def __enter__(self) -> ExifTool:
        self.proc = subprocess.Popen(
            [self.exiftool, "-stay_open", "True", "-@", "-"],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        return self

    def __exit__(self, *exc: object) -> None:
        proc, self.proc = self.proc, None
        if proc is None:
            return
        try:
            proc.stdin.write(b"-stay_open\nFalse\n")
            proc.stdin.flush()
            proc.wait(timeout=5)
        except (OSError, ValueError, subprocess.TimeoutExpired):
            proc.kill()

    def read(self, path: str) -> dict:
        """The readings for one file, or `{}` if exiftool would not produce them."""
        proc = self.proc
        if proc is None:
            return {}
        self._serial += 1
        sentinel = f"{{ready{self._serial}}}".encode("ascii")
        block = "\n".join(
            ["-charset", "filename=UTF8", *self.TAGS, path, f"-execute{self._serial}"]
        )
        try:
            proc.stdin.write(block.encode("utf-8") + b"\n")
            proc.stdin.flush()
        except (OSError, ValueError):
            self.proc = None
            return {}

        deadline = time.monotonic() + self.timeout_s
        buffer = bytearray()
        while sentinel not in buffer:
            if time.monotonic() > deadline or len(buffer) > EXIFTOOL_MAX_BYTES:
                proc.kill()
                self.proc = None
                return {}
            line = proc.stdout.readline()
            if not line:
                self.proc = None
                return {}
            buffer += line
        text = buffer.split(sentinel)[0].decode("utf-8", "replace").strip()
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            return {}
        return parsed[0] if isinstance(parsed, list) and parsed else {}


def _metadata_from_exif(reading: dict) -> tuple[int | None, str | None, bool]:
    """`(long_edge, software_text, has_edit_history)` from one exiftool reading."""
    long_edge = max(reading.get("ImageWidth") or 0, reading.get("ImageHeight") or 0)
    software = reading.get("Software") or reading.get("CreatorTool")
    return (long_edge or None), (str(software) if software else None), bool(
        reading.get("HistoryAction")
    )


# --- persisting one result ---------------------------------------------------


def substrate_token(item: Item, source: str) -> str:
    """Which pixels produced the numbers. Recorded per feature in `feature_ver`.

    `deriv1536` is the tier and matches Phase 2a's, so the two runs' values sit
    in one comparison; what follows it is the decode path, which is exactly the
    distinction the plan asks be visible -- sharpness off a poster frame, off a
    vendor preview and off a demosaic are three different numbers.
    """
    token = f"deriv{SUBSTRATE_EDGE}:{source}"
    return f"{token}:staged" if item.staged else token


def _feature_ver(existing: str | None, token: str) -> str:
    """Merge this pass's per-feature versions into whatever earlier steps wrote."""
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


# `deriv_rot = 0` says this build turned nothing: unlike Phase 2a's ARW repair
# there is no pre-existing derivative here to rotate -- the substrate is
# produced upright from the source, so the applied rotation is zero by
# construction and `deriv_w/deriv_h` are the raster as written.
#
# `width`/`height` are filled only where nothing has measured them before, and
# `dims_src` moves with them in the same statement so the two can never
# disagree. The guard is on the pre-update `width`, which is what a bare column
# reference means on the right-hand side of an UPDATE.
_UPDATE = """
UPDATE file SET phash = ?, dhash = ?, thumbhash = ?, quality = ?, feature_ver = ?,
                deriv_w = ?, deriv_h = ?, deriv_rot = 0,
                width = coalesce(width, ?), height = coalesce(height, ?),
                dims_src = CASE WHEN width IS NULL AND ? IS NOT NULL THEN 'decode'
                                ELSE dims_src END
WHERE sha256 = ?
"""


def _place(target: Path, payload: bytes) -> None:
    """Write via a `.part` beside the target, so a kill cannot truncate it."""
    target.parent.mkdir(parents=True, exist_ok=True)
    partial = target.with_name(target.name + ".part")
    partial.write_bytes(payload)
    os.replace(partial, target)


def _commit(conn, rows: list[tuple]) -> None:
    if not rows:
        return
    conn.execute("BEGIN")
    conn.executemany(_UPDATE, rows)
    conn.execute("COMMIT")
    rows.clear()


class Sink:
    """Turns one worker result into two files on disk and one row in the catalog.

    Both derivatives are placed before the row is queued, so a kill between them
    leaves `quality` NULL and the file is simply redone. Rows commit in batches
    because a 1,647-file run killed at file 1,600 should not start again at one.
    """

    def __init__(self, conn, config: Config, versions: dict, metadata) -> None:
        self.conn = conn
        self.config = config
        self.versions = versions
        self.metadata = metadata
        self.rows: list[tuple] = []
        self.errors: list[tuple[str, str]] = []
        self.paths: collections.Counter = collections.Counter()
        self.bytes_out = 0

    def failed(self, item: Item, message: str) -> None:
        """Record a decode that produced nothing, so the run does not retry it.

        The row carries the error rather than staying NULL: a NULL is
        indistinguishable from "not attempted yet", and the 25 broken JPEGs of
        three and fifty-one bytes would otherwise be re-read on every run for
        ever. `--retry-errors` is what clears them.
        """
        self.errors.append((item.sha256, message))
        self.rows.append(
            (
                None, None, None, json.dumps({"error": message}),
                _feature_ver(self.versions.get(item.sha256), "none"),
                None, None, None, None, None, item.sha256,
            )
        )
        self._maybe_commit()

    def ok(self, item: Item, result: dict) -> None:
        _place(deriv_path(self.config.deriv_root, item.sha256), result["substrate"])
        _place(thumb_path(self.config.thumb_root, item.sha256), result["tile"])
        self.bytes_out += len(result["substrate"]) + len(result["tile"])

        long_edge, software, history = self.metadata(item, result)
        quality = dict(result["quality"])
        quality.update(features.metadata_features(long_edge, software, history))
        quality["composite_quality"] = features.composite_quality(quality)
        self.paths[result["source"]] += 1
        native_w, native_h = result["native_w"], result["native_h"]
        self.rows.append(
            (
                result["phash"], result["dhash"], result["thumbhash"],
                json.dumps(quality, sort_keys=True),
                _feature_ver(
                    self.versions.get(item.sha256), substrate_token(item, result["source"])
                ),
                result["deriv_w"], result["deriv_h"],
                native_w, native_h, native_w,
                item.sha256,
            )
        )
        self._maybe_commit()

    def _maybe_commit(self) -> None:
        if len(self.rows) >= COMMIT_ROWS:
            _commit(self.conn, self.rows)

    def flush(self) -> None:
        _commit(self.conn, self.rows)


# --- the two decode passes ---------------------------------------------------


def run_video(
    items: list[Item], sink: Sink, ffmpeg: str, *, workers: int,
    timeout_s: float = DECODE_TIMEOUT_S, ffmpeg_timeout_s: float = FFMPEG_TIMEOUT_S,
) -> dict:
    """ffmpeg is both the reader and the decoder, so its worker count is both.

    Twelve concurrent ffmpeg processes on one USB head is not twelve times one,
    which is why the default is far below the image pass's and why `bench`
    measures it rather than assuming it.

    Submission runs on its own threads: `BoundedPool.submit` blocks once
    `QUEUE_DEPTH` payloads are in flight, so a loop that submits everything
    before reading a result would wedge against a queue only this thread drains.
    """
    if not items:
        return {"done": 0, "failed": 0, "elapsed_s": 0.0, "timeouts": 0, "bytes": 0}
    failed = 0
    progress = Progress("video", len(items))
    with decode.BoundedPool(
        f"{WORKER_MODULE}:decode_video", workers=workers, timeout_s=timeout_s
    ) as pool:

        def pump(indexed: tuple[int, Item]) -> None:
            tid, item = indexed
            pool.submit(tid, (item.source, ffmpeg, ffmpeg_timeout_s))

        with ThreadPoolExecutor(2) as pumps:
            # Deliberately not drained: `map` submits eagerly, and draining it
            # here would block this thread behind pumps that are themselves
            # blocked on the pool's bounded input queue.
            pumps.map(pump, enumerate(items))
            for tid, status, result in pool.results(len(items)):
                item = items[tid]
                if status != "ok":
                    progress.step()
                    failed += 1
                    sink.failed(item, f"{status}: {result or ''}".strip())
                    continue
                progress.step(result["bytes_in"])
                sink.ok(item, result)
    sink.flush()
    progress.report()
    return {
        "done": len(items) - failed, "failed": failed,
        "elapsed_s": time.perf_counter() - progress.started,
        "timeouts": pool.timeouts, "bytes": progress.bytes,
    }


def run_images(
    items: list[Item], sink: Sink, *, readers: int, decoders: int,
    timeout_s: float = DECODE_TIMEOUT_S,
) -> dict:
    """Raw and still: reader threads pull bytes, bounded workers turn them to pixels.

    Split by target because a `BoundedPool` imports one function and `.dng` and
    `.jpg` do not decode the same way. The two halves run in sequence over the
    same reader count, so the disk sees one access pattern rather than two
    competing ones.
    """
    if not items:
        return {"done": 0, "failed": 0, "elapsed_s": 0.0, "timeouts": 0, "bytes": 0}
    groups = (
        ("decode_raw", decode.MAX_PIXELS, [i for i in items if i.path_kind == "raw"]),
        ("decode_still", STILL_MAX_PIXELS, [i for i in items if i.path_kind == "still"]),
    )
    progress = Progress("images", len(items))
    timeouts = failed = 0
    for target, max_pixels, group in groups:
        if not group:
            continue
        with decode.BoundedPool(
            f"{WORKER_MODULE}:{target}", workers=decoders, timeout_s=timeout_s,
            max_pixels=max_pixels,
        ) as pool:

            def pump(indexed: tuple[int, Item], pool=pool) -> None:
                """Every path out ends in a submit or a deliver -- a task that
                does neither is one `results` waits for forever."""
                tid, item = indexed
                try:
                    pool.submit(tid, Path(item.source).read_bytes())
                except Exception as exc:
                    pool.deliver(tid, "error", f"{type(exc).__name__}: {exc}")

            with ThreadPoolExecutor(max(readers, 1)) as pumps:
                pumps.map(pump, enumerate(group))
                for tid, status, result in pool.results(len(group)):
                    item = group[tid]
                    if status != "ok":
                        progress.step()
                        failed += 1
                        sink.failed(item, f"{status}: {result or ''}".strip())
                        continue
                    progress.step(result["bytes_in"])
                    sink.ok(item, result)
        timeouts += pool.timeouts
    sink.flush()
    progress.report()
    return {
        "done": len(items) - failed, "failed": failed,
        "elapsed_s": time.perf_counter() - progress.started,
        "timeouts": timeouts, "bytes": progress.bytes,
    }


# --- where the two non-pixel scalars come from -------------------------------


def metadata_source(conn, config: Config, items: list[Item]):
    """A callable giving `(long_edge, software_text, has_edit_history)` per item.

    Two of the eighteen scalars -- `thumbnail_likelihood` and `edit_likelihood`
    -- are not functions of pixels. For a MediaVault asset the readings were
    adopted in step 3 and come straight out of the manifest, which covers all
    1,647 of population 1. For a staged file nothing has ever read it, so
    exiftool does, through one `-stay_open` process.

    Returns the callable and a closer, because that process outlives any single
    call and has to be shut down even when the pass raises.
    """
    adopted: dict[str, tuple] = {}
    if any(not item.staged for item in items):
        manifest = open_manifest(config.mediavault_manifest_db)
        try:
            by_sha = dict(manifest.execute("SELECT sha256, asset_id FROM assets"))
            readings = {
                row[0]: (row[1], row[2], row[3], bool(row[4]))
                for row in manifest.execute(
                    "SELECT asset_id, width, height, software_text, edit_history_json"
                    " FROM asset_extended_metadata WHERE is_current = 1"
                )
            }
        finally:
            manifest.close()
        for item in items:
            reading = readings.get(by_sha.get(item.sha256))
            if reading is not None:
                adopted[item.sha256] = reading

    tool = ExifTool(_tool("exiftool", "PHOTOLIB_EXIFTOOL")).__enter__() if any(
        item.staged for item in items
    ) else None

    def measured(result: dict) -> int | None:
        """The decode's own long edge, which is the honest answer when no
        reading exists and the substrate's would be a floor rather than a fact."""
        return max(result.get("native_w") or 0, result.get("native_h") or 0) or None

    def lookup(item: Item, result: dict) -> tuple[int | None, str | None, bool]:
        if item.staged and tool is not None:
            long_edge, software, history = _metadata_from_exif(tool.read(item.source))
            return (long_edge or measured(result)), software, history
        reading = adopted.get(item.sha256)
        if reading is None:
            return measured(result), None, False
        width, height, software, history = reading
        return (max(width or 0, height or 0) or measured(result)), software, history

    def close() -> None:
        if tool is not None:
            tool.__exit__()

    return lookup, close


# --- the benchmark -----------------------------------------------------------


def benchmark(
    config: Config, count: int, *, decoders: int, video_workers: int, readers: int,
    timeout_s: float,
) -> None:
    """Measure both passes on a sample and project the run. Writes nothing.

    Nothing: no derivative is placed and no row is updated. The sample is spread
    evenly across each worklist rather than taken off its head, so one enormous
    directory cannot stand in for the corpus, and it is split between video and
    images in the proportion the real run will face.
    """
    conn = db.connect(config.catalog_db, config.state_db, read_only=True)
    try:
        items = worklist(conn, config)
    finally:
        conn.close()
    videos = [i for i in items if i.path_kind == "video"]
    images = [i for i in items if i.path_kind != "video"]
    print(
        f"worklist  {len(items):,} to decode -- {len(videos):,} video, "
        f"{len(images):,} raw/still",
        flush=True,
    )
    share = count / max(len(items), 1)

    for name, group in (("video", videos), ("images", images)):
        want = min(max(int(round(len(group) * share)), 0), len(group))
        if not want:
            print(f"\n{name:<9} nothing to sample")
            continue
        step = max(len(group) // want, 1)
        sample = group[::step][:want]
        started = time.perf_counter()
        ok = 0
        read_bytes = 0
        workers = video_workers if name == "video" else decoders

        if name == "video":
            ffmpeg = _tool("ffmpeg", "PHOTOLIB_FFMPEG")
            parts = [("decode_video", sample)]
        else:
            parts = [
                ("decode_raw", [i for i in sample if i.path_kind == "raw"]),
                ("decode_still", [i for i in sample if i.path_kind == "still"]),
            ]
        for target, part in parts:
            if not part:
                continue
            with decode.BoundedPool(
                f"{WORKER_MODULE}:{target}", workers=workers, timeout_s=timeout_s,
                max_pixels=STILL_MAX_PIXELS if target == "decode_still" else decode.MAX_PIXELS,
            ) as pool:

                def pump(indexed: tuple[int, Item], pool=pool, target=target) -> None:
                    tid, item = indexed
                    try:
                        if target == "decode_video":
                            pool.submit(tid, (item.source, ffmpeg, FFMPEG_TIMEOUT_S))
                        else:
                            pool.submit(tid, Path(item.source).read_bytes())
                    except Exception as exc:
                        pool.deliver(tid, "error", f"{type(exc).__name__}: {exc}")

                with ThreadPoolExecutor(max(readers, 1)) as pumps:
                    pumps.map(pump, enumerate(part))
                    for _tid, status, result in pool.results(len(part)):
                        ok += status == "ok"
                        read_bytes += result["bytes_in"] if status == "ok" else 0

        elapsed = max(time.perf_counter() - started, 1e-9)
        rate = len(sample) / elapsed
        print(
            f"\n{name:<9} {len(sample):,} of {len(group):,} at {workers} worker(s), "
            f"{read_bytes / 1e6:.0f} MB decoded in {_hms(elapsed)}"
            f"  ->  {rate:.2f} files/s, {ok} ok, {len(sample) - ok} failed"
        )
        print(f"   projection  {len(group):,} at {rate:.2f}/s = **{_hms(len(group) / rate)}**")


# --- report ------------------------------------------------------------------


def _print_pass(name: str, result: dict) -> None:
    elapsed = max(result["elapsed_s"], 1e-6)
    print(
        f"\n{name:<9} {result['done']:,} decoded in {_hms(elapsed)} "
        f"({result['done'] / elapsed:.2f}/s, {result['bytes'] / 1e6:.0f} MB decoded)"
    )
    print(f"          {result['timeouts']:,} decode timeouts, {result['failed']:,} failures")


def _print_stage(result: dict) -> None:
    elapsed = max(result["elapsed_s"], 1e-6)
    print(
        f"\nstage     {result['staged']:,} files copied into staging, "
        f"{result['bytes'] / 1e9:.2f} GB in {_hms(elapsed)} "
        f"({result['bytes'] / elapsed / 1e6:.1f} MB/s)"
    )
    for label, key in (("checksum", "mismatched"), ("failed", "failed")):
        if result[key]:
            print(f"  {label:<8}{len(result[key]):,}")
            for entry in result[key][:20]:
                print(f"          {entry}")


def _print_sink(sink: Sink) -> None:
    paths = ", ".join(f"{name} {count:,}" for name, count in sorted(sink.paths.items()))
    print(f"\npaths     {paths or 'none'}")
    print(
        f"          {sink.bytes_out / 1e6:.1f} MB of derivatives written at WebP "
        f"q{WEBP_QUALITY}, {SUBSTRATE_EDGE}px substrate and {GRID_EDGE}px tile"
    )
    if sink.errors:
        tally = collections.Counter(message.split(": ")[-1][:64] for _, message in sink.errors)
        print(f"\nerrors    {len(sink.errors):,} files recorded with a decode error")
        for message, count in tally.most_common(12):
            print(f"          {count:>6,}  {message}")


def residue(conn) -> list[tuple[str, int, bool]]:
    """`(ext, count, this build has a decoder)` for everything still featureless.

    Naming what is left beats leaving it absent, and the third column is what
    makes the list readable: `.svg` is 22,059 files with no decoder here and
    every one excluded by the rule set anyway, `.ts` is 18,789 TypeScript
    sources that were only ever counted as video by v1's extension table. A row
    that *does* carry a decoder is one this run did not reach -- under `--limit`,
    or after a kill -- and re-running takes it.
    """
    return [
        (ext, count, ext in DECODABLE)
        for ext, count in conn.execute(
            "SELECT lower(ext), count(*) FROM file WHERE quality IS NULL "
            "AND state IN ('read', 'staged', 'published') GROUP BY 1 ORDER BY 2 DESC"
        )
    ]


def clear_errors(conn) -> int:
    """Blank the rows a previous run recorded as failures, so they are retried.

    Scoped to what this module could actually redo. Phase 2a records its decode
    errors in the same shape, and clearing one of those here would take the row
    back to NULL without anything in this run's worklist to fill it -- a
    silently permanent regression rather than a retry.
    """
    placeholders = ", ".join("?" * len(DECODABLE))
    conn.execute("BEGIN")
    cursor = conn.execute(
        f"UPDATE file SET quality = NULL WHERE quality LIKE '%\"error\"%' "
        f"AND state IN ('read', 'staged', 'published') AND lower(ext) IN ({placeholders})",
        sorted(DECODABLE),
    )
    conn.execute("COMMIT")
    return cursor.rowcount


# --- driver ------------------------------------------------------------------


def run(
    config: Config | None = None,
    *,
    passes: str = "svi",
    readers: int = READERS,
    decoders: int = DECODERS,
    video_workers: int = VIDEO_WORKERS,
    timeout_s: float = DECODE_TIMEOUT_S,
    limit: int | None = None,
    retry_errors: bool = False,
) -> int:
    config = config or load()
    conn = db.connect(config.catalog_db, config.state_db)
    failures = 0
    try:
        if migrate.version(conn, "main") < 5:
            raise Phase2bRefused(
                "catalog is behind migration 005; run python -m photolib.migrate first"
            )
        if retry_errors:
            print(f"retry     {clear_errors(conn):,} previously-failed rows cleared", flush=True)

        if "s" in passes:
            started = time.perf_counter()
            todo = gap_worklist(conn)
            print(
                f"gap       {len(todo):,} kept files with no MediaVault asset "
                f"({time.perf_counter() - started:.0f}s, pure SQL)",
                flush=True,
            )
            if todo:
                result = stage_gap(conn, config, todo, readers=readers)
                _print_stage(result)
                failures += len(result["mismatched"]) + len(result["failed"])

        items = worklist(conn, config)
        if limit is not None:
            items = items[:limit]
        videos = [i for i in items if i.path_kind == "video"]
        images = [i for i in items if i.path_kind != "video"]
        by_ext = collections.Counter(i.ext for i in items)
        print(
            f"\nworklist  {len(items):,} files with no features and a decoder: "
            f"{len(videos):,} video, {len(images):,} raw/still; "
            f"{sum(1 for i in items if i.staged):,} staged, "
            f"{sum(1 for i in items if not i.staged):,} MediaVault objects",
            flush=True,
        )
        print(
            "          "
            + ", ".join(f"{ext or '(none)'} {count:,}" for ext, count in by_ext.most_common(12)),
            flush=True,
        )

        lookup, close = metadata_source(conn, config, items)
        sink = Sink(
            conn, config,
            dict(conn.execute("SELECT sha256, feature_ver FROM file WHERE quality IS NULL")),
            lookup,
        )
        try:
            if "v" in passes and videos:
                _print_pass(
                    "video",
                    run_video(
                        videos, sink, _tool("ffmpeg", "PHOTOLIB_FFMPEG"),
                        workers=video_workers, timeout_s=timeout_s,
                    ),
                )
            if "i" in passes and images:
                _print_pass(
                    "images",
                    run_images(
                        images, sink, readers=readers, decoders=decoders, timeout_s=timeout_s
                    ),
                )
        finally:
            sink.flush()
            close()
        _print_sink(sink)

        left = residue(conn)
        if left:
            remaining = sum(count for _, count, decodable in left if decodable)
            print(
                f"\nstill without features: {sum(c for _, c, _ in left):,} files, "
                f"{remaining:,} of them with a decoder here (re-run takes those; "
                "the rest have none, by design)"
            )
            for ext, count, decodable in left[:14]:
                mark = "decoder" if decodable else "-"
                print(f"          {ext or '(none)':<12}{count:>8,}  {mark}")
        return 1 if failures else 0
    finally:
        conn.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "passes", nargs="?", default="svi",
        help="any of s (stage the inventory gap out of the photos root), v (video "
        "poster frames), i (raw and still images); or 'bench'",
    )
    parser.add_argument("--n", type=int, default=500, help="bench sample size")
    parser.add_argument("--readers", type=int, default=READERS)
    parser.add_argument("--decoders", type=int, default=DECODERS)
    parser.add_argument("--video-workers", type=int, default=VIDEO_WORKERS)
    parser.add_argument("--timeout", type=float, default=DECODE_TIMEOUT_S)
    parser.add_argument("--limit", type=int, help="stop after this many, for a measurement")
    parser.add_argument(
        "--retry-errors", action="store_true", help="clear recorded decode errors and redo them"
    )
    args = parser.parse_args(argv)

    config = load()
    # Phase 2a and 2b write the same two derivative trees and the same `file`
    # rows. Refusing on the sibling's lock is how "one process" survives there
    # being two modules that could hold one.
    if (config.catalog_db.parent / PHASE2A_LOCK).exists():
        raise Phase2bRefused(f"{PHASE2A_LOCK} exists; a Phase 2a run may be in progress")
    with RunLock(config.catalog_db.parent / LOCK_NAME):
        if args.passes == "bench":
            benchmark(
                config, args.n, decoders=args.decoders, video_workers=args.video_workers,
                readers=args.readers, timeout_s=args.timeout,
            )
            return 0
        return run(
            config,
            passes=args.passes,
            readers=args.readers,
            decoders=args.decoders,
            video_workers=args.video_workers,
            timeout_s=args.timeout,
            limit=args.limit,
            retry_errors=args.retry_errors,
        )


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Phase2bRefused as exc:
        sys.exit(f"refused: {exc}")
