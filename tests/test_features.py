"""The perceptual hashes, the ThumbHash encoder, and the 18 quality scalars.

The ThumbHash test runs the decoder the client actually ships, under node,
rather than a Python re-implementation. `file.thumbhash` is NULL in every row
before this step, so that function has never executed and "the tiles look
plausible" would not be evidence that the two halves agree.

It reads `ui/src/lib/thumbhash.js`, the source, and not `photolib/static/bundle.js`,
the build output: the bundle is minified, so the harness could not find the
function by name in it, and a stale bundle would make this test pass against
code the browser is no longer running.
"""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import numpy as np
import pytest
from PIL import Image

from archive.pipeline import features

APP_JS = Path(__file__).resolve().parent.parent / "ui" / "src" / "lib" / "thumbhash.js"
HARNESS = Path(__file__).resolve().parent / "thumbhash_decode.js"


def quadrants(width: int = 96, height: int = 64) -> np.ndarray:
    """A deterministic four-colour image. Every quadrant is a different hue, so
    a decoder that transposes, mirrors or mis-scales is visible in the result."""
    image = np.zeros((height, width, 3), dtype=np.uint8)
    half_h, half_w = height // 2, width // 2
    image[:half_h, :half_w] = (200, 30, 30)
    image[:half_h, half_w:] = (30, 200, 30)
    image[half_h:, :half_w] = (30, 30, 200)
    image[half_h:, half_w:] = (220, 220, 40)
    return image


def gradient(width: int = 200, height: int = 120) -> np.ndarray:
    ramp = np.linspace(0, 255, width, dtype=np.float64)
    return np.repeat(np.tile(ramp, (height, 1))[:, :, None], 3, axis=2).astype(np.uint8)


def noise(width: int = 200, height: int = 120, seed: int = 7) -> np.ndarray:
    return np.random.default_rng(seed).integers(0, 256, (height, width, 3), dtype=np.uint8)


def gray_arrays(array: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    image = Image.fromarray(array).convert("L")
    return (
        np.asarray(image.resize((features.HASH_SIDE,) * 2, Image.LANCZOS), dtype=np.float64),
        np.asarray(image.resize((9, 8), Image.LANCZOS), dtype=np.float64),
    )


# --- perceptual hashes -------------------------------------------------------


def test_hashes_are_stable_and_fit_a_signed_column():
    big, small = gray_arrays(noise())
    for value in (features.phash(big), features.dhash(small)):
        assert -(2**63) <= value < 2**63
        assert value == value  # deterministic, not seeded per call


def test_a_rotation_is_uncorrelated_from_its_own_original():
    """PLAN.md measured mean Hamming 31.3/64 between a derivative and its 90
    degree rotation -- indistinguishable from unrelated. A mis-rotated ARW can
    never match its correctly rotated sibling, which is why the repair is not
    cosmetic."""
    array = noise(seed=11)
    rotated = np.asarray(Image.fromarray(array).transpose(Image.ROTATE_90))
    upright_big, upright_small = gray_arrays(array)
    turned_big, turned_small = gray_arrays(rotated)
    assert features.hamming(features.phash(upright_big), features.phash(turned_big)) > 16
    assert features.hamming(features.dhash(upright_small), features.dhash(turned_small)) > 16


def test_a_re_encode_barely_moves_the_hash(tmp_path: Path):
    array = quadrants(256, 256)
    path = tmp_path / "q.webp"
    Image.fromarray(array).save(path, format="WEBP", quality=90)
    again = np.asarray(Image.open(path).convert("RGB"))
    a_big, a_small = gray_arrays(array)
    b_big, b_small = gray_arrays(again)
    assert features.hamming(features.phash(a_big), features.phash(b_big)) <= 2
    assert features.hamming(features.dhash(a_small), features.dhash(b_small)) <= 2


# --- ThumbHash ---------------------------------------------------------------


def decode_with_shipped_js(hash_bytes: bytes) -> tuple[int, int, np.ndarray]:
    result = subprocess.run(
        ["node", str(HARNESS), str(APP_JS), features.thumbhash_b64(hash_bytes)],
        capture_output=True,
        text=True,
        timeout=60,
        check=True,
        stdin=subprocess.DEVNULL,  # pytest's captured stdin is not a real handle on Windows
    )
    payload = json.loads(result.stdout)
    data = np.array(payload["data"], dtype=np.uint8).reshape(payload["h"], payload["w"], 4)
    return payload["w"], payload["h"], data


@pytest.mark.skipif(shutil.which("node") is None, reason="node is not installed")
def test_the_shipped_decoder_reproduces_what_the_encoder_saw():
    """Encode a known image, decode it with `thumbHashToDataURL` itself, and
    compare. A wrong decoder gives a wrong-coloured blur, which is exactly the
    failure nobody notices.

    Two things are asserted, because they fail in different ways. The average
    colour is the DC path and is arithmetic, so it is held tight. Which quadrant
    is which is the AC path, and a format that spends 5 bytes on a whole image
    rings badly at the hard edges of a four-colour test card -- so that half is
    asserted on the *dominant channel*, which is what a placeholder has to get
    right, rather than on absolute values."""
    source = quadrants(96, 64)
    thumb = Image.fromarray(source).convert("RGBA")
    thumb.thumbnail((100, 100), Image.LANCZOS)
    encoded = features.thumbhash(np.asarray(thumb))

    width, height, decoded = decode_with_shipped_js(encoded)
    assert width > height  # a landscape source must not come back portrait

    overall = decoded[:, :, :3].reshape(-1, 3).mean(axis=0)
    assert np.abs(overall - source.reshape(-1, 3).mean(axis=0)).max() < 20

    half_h, half_w = height // 2, width // 2
    corners = {
        "top-left": (slice(0, half_h), slice(0, half_w)),
        "top-right": (slice(0, half_h), slice(half_w, width)),
        "bottom-left": (slice(half_h, height), slice(0, half_w)),
        "bottom-right": (slice(half_h, height), slice(half_w, width)),
    }
    source_h, source_w = source.shape[:2]
    expected = {
        "top-left": source[: source_h // 2, : source_w // 2],
        "top-right": source[: source_h // 2, source_w // 2 :],
        "bottom-left": source[source_h // 2 :, : source_w // 2],
        "bottom-right": source[source_h // 2 :, source_w // 2 :],
    }
    means = {name: block.reshape(-1, 3).mean(axis=0) for name, block in expected.items()}
    for name, box in corners.items():
        got = decoded[box][:, :, :3].reshape(-1, 3).mean(axis=0)
        # Nearest source quadrant must be this quadrant. A transposed, mirrored
        # or channel-swapped decode fails here; ringing at the hard edges, which
        # the format cannot avoid, does not.
        nearest = min(means, key=lambda key: float(np.linalg.norm(got - means[key])))
        assert nearest == name, f"{name} decoded nearest to {nearest}: {got}"


@pytest.mark.skipif(shutil.which("node") is None, reason="node is not installed")
@pytest.mark.parametrize("colour", [(30, 90, 200), (210, 40, 70), (128, 128, 128)])
def test_the_dc_path_is_exact_arithmetic(colour: tuple[int, int, int]):
    """A flat field has no AC terms at all, so the round trip is the DC path on
    its own and the 6-bit quantisation is the only loss allowed."""
    source = np.zeros((64, 64, 4), dtype=np.uint8)
    source[:, :, :3] = colour
    source[:, :, 3] = 255
    _, _, decoded = decode_with_shipped_js(features.thumbhash(source))
    assert np.abs(decoded[:, :, :3].reshape(-1, 3).mean(axis=0) - colour).max() < 10


@pytest.mark.skipif(shutil.which("node") is None, reason="node is not installed")
def test_the_shipped_decoder_keeps_a_portrait_portrait():
    source = quadrants(64, 96)
    thumb = Image.fromarray(source).convert("RGBA")
    thumb.thumbnail((100, 100), Image.LANCZOS)
    width, height, _ = decode_with_shipped_js(features.thumbhash(np.asarray(thumb)))
    assert height > width


def test_thumbhash_is_small_and_refuses_a_full_size_image():
    thumb = Image.fromarray(quadrants(96, 64)).convert("RGBA")
    assert len(features.thumbhash(np.asarray(thumb))) < 40
    with pytest.raises(ValueError):
        features.thumbhash(np.zeros((200, 200, 4), dtype=np.uint8))


# --- quality scalars ---------------------------------------------------------


def test_the_eighteen_scalars_are_all_present_and_numeric():
    scalars = features.pixel_features(noise())
    scalars.update(features.metadata_features(4000, "Adobe Photoshop 24.0", False))
    scalars["composite_quality"] = features.composite_quality(scalars)
    numeric = {
        key: value
        for key, value in scalars.items()
        if key not in ("luminance_histogram", "resolution_class")
    }
    assert len(numeric) == 18, sorted(numeric)
    assert all(isinstance(value, (int, float)) for value in numeric.values())
    assert len(scalars["luminance_histogram"]) == 16
    assert abs(sum(scalars["luminance_histogram"]) - 1) < 1e-3


def test_noise_is_sharper_and_more_informative_than_a_flat_field():
    flat = features.pixel_features(np.full((120, 200, 3), 128, dtype=np.uint8))
    busy = features.pixel_features(noise())
    assert flat["sharpness"] < busy["sharpness"]
    assert flat["blankness"] == 1.0 and busy["blankness"] == 0.0
    assert flat["low_information"] == 1.0 and busy["low_information"] == 0.0
    assert flat["luminance_entropy"] < 1.0 < busy["luminance_entropy"]


@pytest.mark.parametrize("shape", [(1, 1), (2, 3), (8, 8), (16, 16), (31, 31)])
def test_a_frame_smaller_than_the_tile_grid_still_reads(shape):
    """The smaller tiers can be tiny. A one-pixel tile has zero variance by
    definition and would report a busy frame as blank, so the grid shrinks."""
    scalars = features.pixel_features(noise(shape[1], shape[0]))
    assert set(scalars) == set(features.pixel_features(noise()))
    if shape[0] > 1:
        assert scalars["blankness"] == 0.0 and scalars["low_information"] < 0.05


def test_exposure_and_clipping_read_the_right_way():
    dark = features.pixel_features(np.zeros((64, 64, 3), dtype=np.uint8))
    bright = features.pixel_features(np.full((64, 64, 3), 255, dtype=np.uint8))
    assert dark["underexposure"] == 1.0 and dark["near_black"] == 1.0
    assert bright["overexposure"] == 1.0 and bright["highlight_clipping"] == 1.0
    assert dark["overexposure"] == 0.0 and bright["underexposure"] == 0.0


def test_a_truncated_bottom_reads_as_corruption():
    array = noise(seed=3).copy()
    array[90:, :, :] = 128  # the grey band a half-decoded file leaves
    scalars = features.pixel_features(array)
    assert scalars["corruption"] == pytest.approx(30 / 120, abs=0.02)
    assert features.pixel_features(noise(seed=3))["corruption"] == 0.0


def test_a_covered_lens_reads_as_obstruction():
    array = noise(seed=5).copy()
    array[:, :, :] = np.minimum(array, 8)
    assert features.pixel_features(array)["obstruction"] == 1.0
    assert features.pixel_features(noise(seed=5))["obstruction"] == 0.0


def test_a_directional_blur_reads_as_shake():
    from PIL import ImageFilter

    base = Image.fromarray(noise(seed=9))
    smeared = np.asarray(
        base.resize((20, 120), Image.LANCZOS).resize((200, 120), Image.LANCZOS)
    )
    assert features.pixel_features(smeared)["directional_shake"] > 0.5
    assert features.pixel_features(noise(seed=9))["directional_shake"] < 0.2
    assert ImageFilter  # the import is the point of the smear, kept explicit


def test_edit_likelihood_reads_software_not_pixels():
    assert features.metadata_features(4000, None, False)["edit_likelihood"] == 0.0
    assert features.metadata_features(4000, "ILCE-6000 v3.20", False)["edit_likelihood"] == 0.5
    assert features.metadata_features(4000, "Adobe Lightroom 12", False)["edit_likelihood"] == 1.0
    assert features.metadata_features(4000, None, True)["edit_likelihood"] == 1.0


def test_resolution_class_and_thumbnail_likelihood():
    assert features.resolution_class(None) == "unknown"
    assert features.resolution_class(128) == "icon"
    assert features.resolution_class(1536) == "medium"
    assert features.resolution_class(6000) == "huge"
    assert features.metadata_features(160, None, False)["thumbnail_likelihood"] == 0.75
    assert features.metadata_features(4000, None, False)["thumbnail_likelihood"] == 0.0


def test_composite_quality_prefers_the_usable_image():
    good = features.pixel_features(noise(seed=21))
    good.update(features.metadata_features(4000, None, False))
    blank = features.pixel_features(np.full((120, 200, 3), 128, dtype=np.uint8))
    blank.update(features.metadata_features(4000, None, False))
    assert features.composite_quality(good) > features.composite_quality(blank)


def test_composite_quality_does_not_pile_bad_images_onto_one_value():
    """Clamping the foot to zero put 18,717 of 103,207 real assets on exactly
    0.0. A cover ranker compares members within a stack, so a stack of dark
    frames still has to come out in some order."""
    rng = np.random.default_rng(3)
    scores = []
    for texture in (0, 3, 8, 20, 50):
        array = np.clip(rng.normal(14, texture, (120, 200, 1)), 0, 255)
        scalars = features.pixel_features(array.repeat(3, axis=2).astype(np.uint8))
        scalars.update(features.metadata_features(4000, None, False))
        scores.append(features.composite_quality(scalars))
    # All five are dark enough that the old clamped form put them on 0.0.
    assert len(set(scores)) == len(scores), scores
    assert scores == sorted(scores), scores
    assert min(scores) < 0.0  # the range is signed, and that is the point
