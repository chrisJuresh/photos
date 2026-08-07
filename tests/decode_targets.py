"""Worker targets for the `archive.pipeline.decode` tests.

Importable by name from a spawned process, which is what the pool requires: it
is given a `module:function` string rather than a pickled callable.
"""

from __future__ import annotations

import time


def echo(payload: bytes, max_pixels: int) -> bytes:
    return payload + b"!"


def boom(payload: bytes, max_pixels: int) -> bytes:
    raise ValueError("this one is corrupt")


def hang(payload: bytes, max_pixels: int) -> bytes:
    """The F55 shape: not a crash, a decode that simply never returns."""
    time.sleep(600)
    return payload


def oversized(payload: bytes, max_pixels: int) -> bytes:
    return b"x" * (1 << 22)


def greedy(payload: bytes, max_pixels: int) -> bytes:
    """Allocate past any sane cap, to prove the cap actually bites."""
    hoard = [bytearray(64 << 20) for _ in range(16)]
    return bytes(len(hoard))
