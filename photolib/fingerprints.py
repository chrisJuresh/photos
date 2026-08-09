"""Gives every published tile a visual fingerprint, read off the NVMe.

`docs/adr/0003-stack-on-verified-match.md` decides a stack by a verified match
between two frames, and puts a cheap screen in front of the expensive check. This
module is that screen's input and nothing else: it stores one embedding per tile
and changes nothing a reader can see. The grid does not read these vectors, and
no tile looks different after a pass.

The embedding is DINOv2 ViT-S/14 -- 384 dimensions from ~85 MB of weights that
`torch.hub` fetches once into its own cache and reuses from there afterwards. It
is chosen for recall rather than for precision: its job is to say "these two could
not possibly be the same picture" often enough that the geometric check runs on a
small fraction of the pairs, and the precision comes from that later stage.

**Every frame is squashed to 224x224 rather than centre-cropped.** The usual crop
keeps the model's training distribution and throws away half of a 3:2 frame, and
half a frame is half the evidence that two exposures show the same picture. Both
sides of a candidate pair are squashed the same way and every camera here shoots
a constant aspect, so the distortion cancels where it is compared.

Vectors are L2-normalised on the way in, so the cosine the match pass wants is a
dot product and no consumer has to remember to normalise.

The pass reads `substrate_root` and the catalog, both on the NVMe. **It never
opens a path under `G:`**, so it cannot collide with anything reading the vault
and it does not care whether the drive is even attached.

Resumable and idempotent, in the shape `photolib.substrates` established: the
work already done is one query rather than 24,306 probes, each batch commits as
it lands so an interruption costs at most one batch, and a second run of a
finished pass writes nothing and says so.
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
import time
from collections.abc import Callable, Iterator, Sequence
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image

from photolib import db
from photolib.config import Config, load, substrate_path
from photolib.substrates import present

MODEL = "dinov2_vits14"
VERSION = "1"
DIM = 384
SIDE = 224  # 16 patches of 14. The model's side must be a multiple of its patch.
BATCH = 64
DECODE_WORKERS = 16  # measured: 103/s at 8, 124/s at 16, 126/s at 24. Decode-bound.
PROGRESS_SECONDS = 30

# What DINOv2 was trained against. Not ours to choose.
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


class FingerprintsRefused(RuntimeError):
    """Raised before anything is stored. Nothing was written."""


# --- what to embed -----------------------------------------------------------

# `IS NOT` rather than `<>` so a tile whose kind was never determined is embedded
# rather than silently dropped: the criterion is "not a video", and NULL is not a
# video. Every published tile today is image, raw_image or video, and the raw ones
# are two thousand of them -- `kind = 'image'` would be the wrong filter.
_TILES_QUERY = """
SELECT photo.rep_sha256 FROM photo
JOIN file ON file.sha256 = photo.rep_sha256
WHERE file.state = 'published' AND file.kind IS NOT 'video'
ORDER BY photo.rep_sha256
"""

_STORED_QUERY = "SELECT sha256 FROM fingerprint WHERE model = ? AND version = ?"

_INSERT = """
INSERT OR REPLACE INTO fingerprint (model, version, sha256, vector) VALUES (?, ?, ?, ?)
"""


def tile_shas(conn: sqlite3.Connection) -> list[str]:
    """Every published tile's representative frame, videos excluded."""
    return [row[0] for row in conn.execute(_TILES_QUERY)]


def stored(conn: sqlite3.Connection, model: str = MODEL, version: str = VERSION) -> set[str]:
    """Every frame this model has already fingerprinted. One query, not N probes."""
    return {row[0] for row in conn.execute(_STORED_QUERY, (model, version))}


def worklist(
    conn: sqlite3.Connection,
    substrate_root: Path,
    *,
    model: str = MODEL,
    version: str = VERSION,
) -> tuple[list[str], list[str]]:
    """What is left to embed, and which tiles have no substrate to embed from.

    Both are returned rather than one being folded into the other, because they
    are different facts: the first shrinks to nothing as the pass runs, and the
    second is a hole in the derivative tree that stays and must keep being said.
    A tile already fingerprinted is neither, whatever the substrate tree holds
    now -- its vector exists and is not owed a second look.
    """
    done = stored(conn, model, version)
    on_disk = present(substrate_root)
    todo, missing = [], []
    for sha256 in tile_shas(conn):
        if sha256 in done:
            continue
        (todo if sha256 in on_disk else missing).append(sha256)
    return todo, missing


# --- the vector --------------------------------------------------------------


def to_blob(vector: np.ndarray) -> bytes:
    """One vector as stored: little-endian float32, in order."""
    return np.asarray(vector, dtype="<f4").tobytes()


def from_blob(blob: bytes) -> np.ndarray:
    """The inverse of `to_blob`, for whatever later reads these rows."""
    return np.frombuffer(blob, dtype="<f4")


def preprocess(path: Path) -> np.ndarray:
    """One substrate as the model wants it: normalised float32, channels first."""
    with Image.open(path) as image:
        frame = image.convert("RGB").resize((SIDE, SIDE), Image.BICUBIC)
    array = (np.asarray(frame, dtype=np.float32) / 255.0 - MEAN) / STD
    return array.transpose(2, 0, 1)


def load_encoder(device: str | None = None) -> Callable[[np.ndarray], np.ndarray]:
    """DINOv2 ViT-S/14 as one callable over a preprocessed batch.

    `torch` and the weights are both deferred to here: nothing about the worklist,
    the schema or the report needs either, and a finished pass with nothing to do
    should not spend ten seconds loading a model to prove it.
    """
    import torch

    model = torch.hub.load("facebookresearch/dinov2", MODEL, verbose=False)
    device = device or ("cuda" if torch.cuda.is_available() else "cpu")
    model.eval().to(device)

    def encode(batch: np.ndarray) -> np.ndarray:
        with torch.inference_mode():
            vectors = model(torch.from_numpy(batch).to(device)).float().cpu().numpy()
        return vectors / np.linalg.norm(vectors, axis=1, keepdims=True)

    return encode


# --- the pass ----------------------------------------------------------------


def batches(todo: Sequence[str], size: int) -> Iterator[Sequence[str]]:
    for start in range(0, len(todo), size):
        yield todo[start : start + size]


def embed_all(
    conn: sqlite3.Connection,
    todo: Sequence[str],
    substrate_root: Path,
    encode: Callable[[np.ndarray], np.ndarray],
    *,
    model: str = MODEL,
    version: str = VERSION,
    batch: int = BATCH,
    workers: int = DECODE_WORKERS,
    progress_seconds: float = PROGRESS_SECONDS,
) -> dict:
    """Embed every frame in `todo` and store it. Returns the tally and the timings.

    One transaction per batch, so an interruption costs the batch in flight and
    nothing before it. A batch is decoded on a pool rather than one file at a
    time, because a 1536px webp costs more to decode than 224x224 costs to embed
    and a single-threaded decode would leave the GPU waiting on Pillow.
    """
    written = 0
    unreadable: list[tuple[str, str]] = []
    started = announced = time.perf_counter()

    with ThreadPoolExecutor(max(workers, 1)) as pool:
        for chunk in batches(todo, max(batch, 1)):
            paths = [substrate_path(substrate_root, sha256) for sha256 in chunk]
            frames, readable = [], []
            for sha256, frame in zip(chunk, pool.map(_decode, paths)):
                if isinstance(frame, str):
                    unreadable.append((sha256, frame))
                else:
                    readable.append(sha256)
                    frames.append(frame)
            if readable:
                vectors = encode(np.stack(frames))
                conn.execute("BEGIN")
                conn.executemany(
                    _INSERT,
                    [
                        (model, version, sha256, to_blob(vector))
                        for sha256, vector in zip(readable, vectors)
                    ],
                )
                conn.execute("COMMIT")
                written += len(readable)

            now = time.perf_counter()
            if now - announced >= progress_seconds:
                announced = now
                print(
                    f"  embed    {written:>7,}/{len(todo):,}  {written / (now - started):.0f}/s",
                    flush=True,
                )

    return {
        "written": written,
        "unreadable": unreadable,
        "elapsed_s": time.perf_counter() - started,
    }


def _decode(path: Path) -> np.ndarray | str:
    """`preprocess`, returning the reason as a string where the file will not open.

    A substrate that cannot be decoded is the one thing here that would otherwise
    end a twenty-minute pass irrecoverably: resuming re-reaches the same file and
    fails again, so it has to be survivable rather than fatal.
    """
    try:
        return preprocess(path)
    except (OSError, ValueError) as exc:
        return str(exc)


# --- report ------------------------------------------------------------------


def run(
    config: Config | None = None,
    *,
    encode: Callable[[np.ndarray], np.ndarray] | None = None,
    batch: int = BATCH,
    limit: int | None = None,
) -> int:
    config = config or load()
    if not config.substrate_root.is_dir():
        raise FingerprintsRefused(f"substrate tree not found: {config.substrate_root}")

    conn = db.connect(config.catalog_db, config.state_db)
    try:
        started = time.perf_counter()
        todo, missing = worklist(conn, config.substrate_root)
        print(
            f"model     {MODEL} version {VERSION}, {DIM} dimensions "
            f"({time.perf_counter() - started:.1f}s to plan)",
            flush=True,
        )
        print(f"substrate {config.substrate_root}")
        if limit is not None:
            todo = todo[:limit]
        print(f"todo      {len(todo):,} tiles to fingerprint")
        print(f"missing   {len(missing):,} tiles with no substrate, so no vector:")
        for sha256 in missing[:20]:
            print(f"          {sha256}")
        if len(missing) > 20:
            print(f"          ... and {len(missing) - 20:,} more")

        if not todo:
            print("\nnothing to do: every tile with a substrate already has a vector")
            return 0

        result = embed_all(conn, todo, config.substrate_root, encode or load_encoder(), batch=batch)

        elapsed = max(result["elapsed_s"], 1e-6)
        print(
            f"\nstored    {result['written']:,} vectors in "
            f"{int(elapsed) // 60}m{int(elapsed) % 60:02d}s, {result['written'] / elapsed:,.0f}/s"
        )
        print(f"unreadable {len(result['unreadable']):,} substrates that would not decode")
        for sha256, reason in result["unreadable"][:20]:
            print(f"          {sha256}  {reason}")

        total = len(stored(conn))
        print(f"\non file   {total:,} vectors at {MODEL} version {VERSION}")
        return 0 if not result["unreadable"] else 1
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--batch", type=int, default=BATCH)
    parser.add_argument(
        "--limit", type=int, help="fingerprint at most this many, for a throughput measurement"
    )
    args = parser.parse_args()
    try:
        sys.exit(run(batch=args.batch, limit=args.limit))
    except FingerprintsRefused as exc:
        sys.exit(f"refused: {exc}")
