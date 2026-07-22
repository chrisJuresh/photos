from __future__ import annotations

import sys
import warnings
from pathlib import Path

from PIL import Image, ImageOps


def main(argv: list[str] | None = None) -> int:
    values = list(sys.argv[1:] if argv is None else argv)
    if len(values) != 3:
        print("usage: python -m media_vault._decode_worker <source> <output> <max-pixels>", file=sys.stderr)
        return 2
    source = Path(values[0])
    output = Path(values[1])
    max_pixels = int(values[2])
    if max_pixels < 1:
        print("max-pixels must be positive", file=sys.stderr)
        return 2
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(source) as opened:
                pixels = int(opened.width) * int(opened.height)
                if pixels > max_pixels:
                    raise RuntimeError(f"Decode pixel limit exceeded: {pixels} > {max_pixels}")
                oriented = ImageOps.exif_transpose(opened).convert("RGB")
                oriented.save(output, format="PNG", optimize=False)
                oriented.close()
        return 0
    except Exception as exc:
        print(f"{type(exc).__name__}: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
