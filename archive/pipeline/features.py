"""pHash, dHash, ThumbHash and v1's 18 quality scalars, from one decoded array.

Everything here is a pure function of pixels (plus, for two scalars, of metadata
readings that were already adopted). Nothing opens a file, nothing touches a
database, and nothing imports v1. `docs/preprocessing.md` supplied the *list* of
what to compute; the formulas below are this build's own and every constant in
them is written down rather than tuned in place.

**These are relative judgements, not readings.** They only mean anything when
every value in a comparison came from one implementation, which is why v1's
`asset_features` is not adopted -- see `PLAN.md` § "Phase 2a". Cover ranking
compares members *within* a stack, so a stack holding one v1 value and one of
these would rank on incompatible measurements.

The 18 scalars, matching v1's column set one for one:

| scalar | what it measures |
|---|---|
| `luminance_entropy`      | Shannon entropy of the 256-bin luma histogram, in bits (0-8) |
| `sharpness`              | variance of the 4-neighbour Laplacian of luma in [0,1]. Raw, unbounded |
| `focus_deficit`          | fraction of tiles whose local Laplacian variance is under an eighth of the sharpest tile's |
| `directional_shake`      | gradient-energy anisotropy, `|Ex-Ey| / (Ex+Ey)` |
| `motion`                 | `directional_shake * focus_deficit` -- directional blur, which is what motion evidence reduces to for a still |
| `underexposure`          | how far mean luma falls below mid-grey 0.18, as a fraction of it |
| `overexposure`           | how far mean luma rises above 0.82, as a fraction of the remaining range |
| `highlight_clipping`     | fraction of pixels whose brightest channel is >= 254/255 |
| `near_black`             | fraction of pixels at or below 2/255 luma |
| `blankness`              | fraction of tiles with luma standard deviation under 0.01 |
| `obstruction`            | fraction of *border* tiles that are both dark (< 0.08) and flat (< 0.02) -- a thumb over the lens |
| `low_information`        | fraction of tiles whose 32-bin luma entropy is under 1.5 bits |
| `blockiness`             | excess gradient on the 8x8 codec grid over the off-grid mean, clamped at zero |
| `corruption`             | fraction of the frame taken by contiguous constant-valued rows at the bottom -- the shape a truncated decode leaves |
| `incomplete_decode`      | 1 when the decoder had to tolerate truncation or returned a size other than the header's |
| `thumbnail_likelihood`   | how far the true long edge falls under 640 px |
| `edit_likelihood`        | from the adopted `software_text` and edit history, not from pixels |
| `composite_quality`      | the documented weighted combination at the foot of this module. Signed, not clamped |

`luminance_histogram` (16 bins) and `resolution_class` come out alongside them;
v1 carried both too, and neither is a scalar.

The tile grid is 16x16 *tiles*, not 16x16 pixels, so every tile-based scalar is
scale-free and a 192px derivative and a 2560px one are on the same footing.
"""

from __future__ import annotations

import base64
import math
import struct

import numpy as np

# Versions are per feature and carry the substrate, because sharpness off a
# 1620px embedded preview is not the same number as sharpness off a 5184px
# decode. The caller appends the substrate token; these are the algorithm halves.
PHASH_VER = "photolib-phash-v1"
DHASH_VER = "photolib-dhash-v1"
THUMBHASH_VER = "photolib-thumbhash-v1"
QUALITY_VER = "photolib-quality-v2"  # v2 unclamped the composite; see composite_quality

TILES = 16  # 16x16 tiles over the frame, whatever its pixel size
HASH_SIDE = 32  # pHash DCT input
LOW_FREQ = 8  # pHash keeps the top-left 8x8 of the DCT

# Sharpness is unbounded, so the composite needs a knee to fold it into [0,1].
# 0.34 is the 90th percentile RMS Laplacian measured over a 600-derivative
# sample of this corpus's own 1536px tier (p10 0.030, p50 0.115, p80 0.220,
# p90 0.344, p99 0.714). Putting the knee at the top decile rather than at the
# median is deliberate: at the median half the corpus saturates at 1.0 and the
# term stops discriminating exactly where ranking needs it to.
SHARP_KNEE = 0.34

MID_GREY = 0.18
OVER_POINT = 0.82
BLANK_STD = 0.01
DARK_TILE_MEAN = 0.08
FLAT_TILE_STD = 0.02
LOW_INFO_BITS = 1.5
THUMBNAIL_EDGE = 640


# --- perceptual hashes -------------------------------------------------------


def _dct_matrix(n: int) -> np.ndarray:
    """DCT-II basis, `D[k, x] = cos(pi (x + 1/2) k / n)`.

    Unnormalised on purpose: pHash only compares coefficients against their own
    median, so any positive per-row scaling cancels.
    """
    k = np.arange(n, dtype=np.float64)[:, None]
    x = np.arange(n, dtype=np.float64)[None, :]
    return np.cos(np.pi * (x + 0.5) * k / n)


_DCT = _dct_matrix(HASH_SIDE)


def _pack(bits: np.ndarray) -> int:
    """64 booleans, row-major and MSB first, as a signed 64-bit integer.

    SQLite's INTEGER is signed, so the top bit has to be allowed to wrap rather
    than overflow. `struct` does that reversibly; `int.from_bytes(signed=True)`
    on the same eight bytes recovers it.
    """
    value = 0
    for bit in bits.ravel():
        value = (value << 1) | int(bit)
    return struct.unpack("<q", struct.pack("<Q", value))[0]


def phash(gray32: np.ndarray) -> int:
    """Perceptual hash of a 32x32 luma array.

    The 2-D DCT's top-left 8x8 block, thresholded at the median of the 63
    coefficients that are not DC. DC is excluded from the median -- it carries
    overall brightness, which is exactly the thing a perceptual hash should not
    be sensitive to -- but it still contributes its own bit.
    """
    coef = (_DCT @ gray32.astype(np.float64) @ _DCT.T)[:LOW_FREQ, :LOW_FREQ]
    median = np.median(np.delete(coef.ravel(), 0))
    return _pack(coef > median)


def dhash(gray8x9: np.ndarray) -> int:
    """Difference hash of an 8-row, 9-column luma array: each pixel against its
    right neighbour, giving 8 x 8 comparisons."""
    return _pack(gray8x9[:, :-1] < gray8x9[:, 1:])


def hamming(a: int, b: int) -> int:
    """Bit distance between two packed hashes, over the unsigned bit patterns."""
    return ((a ^ b) & 0xFFFFFFFFFFFFFFFF).bit_count()


# --- ThumbHash ---------------------------------------------------------------
#
# Encoder for evanw/thumbhash, the format `thumbHashToDataURL` in
# `photolib/static/app.js` decodes. That decoder has never executed against a
# real hash -- `file.thumbhash` is NULL in every row until this step -- so
# `tests/test_features.py` runs the shipped function under node against hashes
# this encoder produced, rather than assuming the two halves agree.


def _basis(terms: int, size: int) -> np.ndarray:
    """`B[k, x] = cos(pi k (x + 1/2) / size)`, the cosine basis ThumbHash uses."""
    k = np.arange(terms, dtype=np.float64)[:, None]
    x = np.arange(size, dtype=np.float64)[None, :]
    return np.cos(np.pi / size * k * (x + 0.5))


def _encode_channel(channel: np.ndarray, nx: int, ny: int) -> tuple[float, list[float], float]:
    """DCT of one LPQA plane into a DC term and AC terms normalised into [0,1].

    The triangular `cx * ny < nx * (ny - cy)` bound is the format's, and has to
    match `thumbHashToDataURL`'s reader exactly or the nibbles desynchronise.
    """
    h, w = channel.shape
    fx = _basis(nx, w)
    fy = _basis(ny, h)
    dc = 0.0
    ac: list[float] = []
    scale = 0.0
    for cy in range(ny):
        cx = 0
        while cx * ny < nx * (ny - cy):
            f = float((channel * fx[cx][None, :] * fy[cy][:, None]).sum()) / (w * h)
            if cx or cy:
                ac.append(f)
                scale = max(scale, abs(f))
            else:
                dc = f
            cx += 1
    if scale:
        ac = [0.5 + 0.5 / scale * value for value in ac]
    return dc, ac, scale


def thumbhash(rgba: np.ndarray) -> bytes:
    """ThumbHash of an RGBA uint8 array, which must already fit in 100x100.

    Alpha is carried when the image has any, because the shipped decoder reads
    the has-alpha flag to size the luminance grid even though it renders opaque;
    emitting a hash whose header disagrees with its payload would be worse than
    an ignored alpha plane.
    """
    h, w = rgba.shape[:2]
    if w > 100 or h > 100:
        raise ValueError(f"{w}x{h} does not fit in 100x100")
    pixels = rgba.astype(np.float64) / 255.0
    alpha = pixels[:, :, 3]
    total_alpha = float(alpha.sum())
    if total_alpha:
        avg = (pixels[:, :, :3] * alpha[:, :, None]).sum(axis=(0, 1)) / total_alpha
    else:
        avg = np.zeros(3)

    has_alpha = total_alpha < w * h
    limit = 5 if has_alpha else 7
    lx = max(1, round(limit * w / max(w, h)))
    ly = max(1, round(limit * h / max(w, h)))

    composited = avg[None, None, :] * (1 - alpha[:, :, None]) + pixels[:, :, :3] * alpha[:, :, None]
    r, g, b = composited[:, :, 0], composited[:, :, 1], composited[:, :, 2]
    l_dc, l_ac, l_scale = _encode_channel((r + g + b) / 3, max(3, lx), max(3, ly))
    p_dc, p_ac, p_scale = _encode_channel((r + g) / 2 - b, 3, 3)
    q_dc, q_ac, q_scale = _encode_channel(r - g, 3, 3)
    a_dc, a_ac, a_scale = _encode_channel(alpha, 5, 5) if has_alpha else (0.0, [], 0.0)

    landscape = w > h
    header24 = (
        round(63 * l_dc)
        | (round(31.5 + 31.5 * p_dc) << 6)
        | (round(31.5 + 31.5 * q_dc) << 12)
        | (round(31 * l_scale) << 18)
        | (int(has_alpha) << 23)
    )
    header16 = (
        (max(3, ly) if landscape else max(3, lx))
        | (round(63 * p_scale) << 3)
        | (round(63 * q_scale) << 9)
        | (int(landscape) << 15)
    )
    out = bytearray(
        [header24 & 255, (header24 >> 8) & 255, header24 >> 16, header16 & 255, header16 >> 8]
    )
    if has_alpha:
        out.append(round(15 * a_dc) | (round(15 * a_scale) << 4))

    start = len(out)
    index = 0
    for plane in ([l_ac, p_ac, q_ac, a_ac] if has_alpha else [l_ac, p_ac, q_ac]):
        for value in plane:
            position = start + (index >> 1)
            while len(out) <= position:
                out.append(0)
            out[position] |= round(15 * value) << ((index & 1) << 2)
            index += 1
    return bytes(out)


def thumbhash_b64(hash_bytes: bytes) -> str:
    """What `/api/photos` puts in the `th` field."""
    return base64.b64encode(hash_bytes).decode("ascii")


# --- quality scalars ---------------------------------------------------------


def _tile(plane: np.ndarray, n: int = TILES) -> tuple[np.ndarray, int]:
    """`plane` as `((n*n), pixels-per-tile)` plus the grid size actually used.

    The grid shrinks for a frame with fewer than `2n` pixels on a side, which
    the smaller tiers can produce; every tile scalar is a *fraction of tiles*,
    so a coarser grid changes the resolution of the answer and not its meaning.
    A tile is never one pixel: a single-pixel tile has zero variance by
    definition, and would read as blank however busy the frame is.
    """
    h, w = plane.shape
    n = max(1, min(n, h // 2, w // 2))
    th, tw = h // n, w // n
    cropped = plane[: th * n, : tw * n]
    return cropped.reshape(n, th, n, tw).swapaxes(1, 2).reshape(n * n, th * tw), n


def _entropy(counts: np.ndarray, axis: int = -1) -> np.ndarray:
    """Shannon entropy in bits of unnormalised counts."""
    total = counts.sum(axis=axis, keepdims=True)
    p = np.divide(counts, total, out=np.zeros_like(counts, dtype=np.float64), where=total > 0)
    log = np.zeros_like(p)
    np.log2(p, out=log, where=p > 0)
    return -(p * log).sum(axis=axis)


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return float(min(max(value, low), high))


def pixel_features(rgb: np.ndarray, *, incomplete: bool = False) -> dict:
    """The fourteen pixel-derived scalars plus the histogram, from one array.

    `rgb` is uint8 `(h, w, 3)`. One pass over the frame produces every tile
    statistic the scalars need; nothing here decodes or resizes.
    """
    luma = (
        0.2126 * rgb[:, :, 0].astype(np.float32)
        + 0.7152 * rgb[:, :, 1].astype(np.float32)
        + 0.0722 * rgb[:, :, 2].astype(np.float32)
    ) / 255.0
    h, w = luma.shape

    hist256 = np.bincount((luma * 255).astype(np.uint8).ravel(), minlength=256)
    hist16 = hist256.reshape(16, 16).sum(axis=1)

    if h >= 3 and w >= 3:
        laplacian = (
            -4 * luma[1:-1, 1:-1]
            + luma[:-2, 1:-1]
            + luma[2:, 1:-1]
            + luma[1:-1, :-2]
            + luma[1:-1, 2:]
        )
        sharpness = float(laplacian.var())
        tile_var = _tile(laplacian)[0].var(axis=1)
        best = float(tile_var.max())
        focus_deficit = float((tile_var < best / 8).mean()) if best > 0 else 1.0
    else:
        sharpness, focus_deficit = 0.0, 1.0

    gx = np.diff(luma, axis=1)
    gy = np.diff(luma, axis=0)
    ex = float((gx**2).mean()) if gx.size else 0.0
    ey = float((gy**2).mean()) if gy.size else 0.0
    shake = abs(ex - ey) / (ex + ey) if ex + ey > 0 else 0.0

    tiles, grid = _tile(luma)
    tile_mean = tiles.mean(axis=1)
    tile_std = tiles.std(axis=1)

    quantised = np.minimum((tiles * 32).astype(np.int32), 31)
    offsets = np.arange(tiles.shape[0], dtype=np.int32)[:, None] * 32
    tile_hist = np.bincount((offsets + quantised).ravel(), minlength=tiles.shape[0] * 32).reshape(
        tiles.shape[0], 32
    )
    tile_entropy = _entropy(tile_hist.astype(np.float64))

    border = np.zeros((grid, grid), bool)
    border[0, :] = border[-1, :] = border[:, 0] = border[:, -1] = True
    border = border.ravel()
    obstructed = (tile_mean < DARK_TILE_MEAN) & (tile_std < FLAT_TILE_STD) & border

    # Blockiness: gradient across the codec's 8x8 grid lines against everywhere
    # else. A ratio, so it does not care about contrast or resolution.
    def grid_excess(diff: np.ndarray, axis: int) -> float:
        length = diff.shape[axis]
        on_grid = (np.arange(length) % 8) == 7
        if on_grid.sum() == 0 or (~on_grid).sum() == 0:
            return 0.0
        magnitude = np.abs(diff)
        on = float(magnitude.take(np.flatnonzero(on_grid), axis=axis).mean())
        off = float(magnitude.take(np.flatnonzero(~on_grid), axis=axis).mean())
        return max(on / off - 1.0, 0.0) if off > 0 else 0.0

    blockiness = (grid_excess(gx, 1) + grid_excess(gy, 0)) / 2

    # A truncated decode leaves a run of identical constant rows at the bottom.
    # Counted from the bottom up, so a legitimately dark sky at the top is not it.
    constant = (luma.max(axis=1) - luma.min(axis=1)) < 1e-6
    if constant.all():
        trailing = h
    else:
        trailing = int(np.argmin(constant[::-1]))
    corruption = trailing / h if h else 0.0

    mean_luma = float(luma.mean())
    return {
        "luminance_histogram": [round(float(v) / max(hist16.sum(), 1), 5) for v in hist16],
        "luminance_entropy": round(float(_entropy(hist256.astype(np.float64))), 4),
        "sharpness": round(sharpness, 8),
        "focus_deficit": round(focus_deficit, 4),
        "directional_shake": round(_clamp(shake), 4),
        "motion": round(_clamp(shake) * focus_deficit, 4),
        "underexposure": round(_clamp((MID_GREY - mean_luma) / MID_GREY), 4),
        "overexposure": round(_clamp((mean_luma - OVER_POINT) / (1 - OVER_POINT)), 4),
        "highlight_clipping": round(float((rgb.max(axis=2) >= 254).mean()), 5),
        "near_black": round(float((luma <= 2 / 255).mean()), 5),
        "blankness": round(float((tile_std < BLANK_STD).mean()), 4),
        "obstruction": round(float(obstructed.sum() / max(border.sum(), 1)), 4),
        "low_information": round(float((tile_entropy < LOW_INFO_BITS).mean()), 4),
        "blockiness": round(_clamp(blockiness), 4),
        "corruption": round(corruption, 5),
        "incomplete_decode": int(incomplete),
    }


# Software strings that mean a human changed the pixels, matched case-folded as
# substrings. Camera firmware and phone build strings are deliberately absent:
# they say the file came off a device, not that it was edited.
_EDITORS = (
    "photoshop", "lightroom", "camera raw", "gimp", "snapseed", "picasa",
    "affinity", "capture one", "darktable", "rawtherapee", "luminar", "paint",
    "pixelmator", "acdsee", "photoscape", "ffmpeg", "handbrake", "imagemagick",
    "photos ", "photo editor", "instagram", "vsco", "facetune", "canva",
)


def resolution_class(long_edge: int | None) -> str:
    """Coarse bucket of the *true* long edge. `unknown` when it is not known."""
    if not long_edge:
        return "unknown"
    for edge, name in ((256, "icon"), (1024, "small"), (2048, "medium"), (4096, "large")):
        if long_edge < edge:
            return name
    return "huge"


def metadata_features(
    long_edge: int | None, software_text: str | None, has_edit_history: bool
) -> dict:
    """The two scalars that come from adopted readings rather than from pixels.

    `edit_likelihood` is a judgement and so is recomputed here; `software_text`
    and the edit history it reads are objective readings adopted in step 3.
    """
    folded = (software_text or "").casefold()
    if has_edit_history or any(name in folded for name in _EDITORS):
        edit = 1.0
    elif folded:
        edit = 0.5
    else:
        edit = 0.0
    return {
        "resolution_class": resolution_class(long_edge),
        "thumbnail_likelihood": round(
            _clamp((THUMBNAIL_EDGE - long_edge) / THUMBNAIL_EDGE) if long_edge else 0.0, 4
        ),
        "edit_likelihood": edit,
    }


def composite_quality(scalars: dict) -> float:
    """One deterministic number for ranking, from the scalars above.

    Weights are a stated policy, not a fit: focus dominates, information content
    helps, and each way an image can be unusable subtracts. Sharpness is folded
    through `SHARP_KNEE` because it is the one unbounded term.

    **Not clamped, and not a probability.** Roughly -0.75 to +0.60 on this
    corpus, higher being better. Clipping the foot to zero put 18,717 of 103,207
    assets on exactly 0.0 -- and a tie is the one answer a cover ranker cannot
    use, since it compares members *within* a stack and a stack of dark frames
    is precisely where the ordering still has to come out somewhere. A total
    order over a signed range costs nothing and keeps every comparison decidable.
    """
    sharp = _clamp(math.sqrt(max(scalars["sharpness"], 0.0)) / SHARP_KNEE)
    score = (
        0.45 * sharp
        + 0.15 * (scalars["luminance_entropy"] / 8)
        - 0.15 * scalars["blankness"]
        - 0.10 * scalars["low_information"]
        - 0.10 * max(scalars["underexposure"], scalars["overexposure"])
        - 0.10 * scalars["highlight_clipping"]
        - 0.10 * scalars["obstruction"]
        - 0.05 * scalars["blockiness"]
        - 0.20 * scalars["corruption"]
        - 0.20 * scalars["incomplete_decode"]
    )
    return round(score, 4)
