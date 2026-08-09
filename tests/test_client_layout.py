"""`rowBoxes` — where the grid draws each tile in a row.

This is the walk the renderer used to hold inline. It is asserted here rather
than through the browser because it is about to acquire a second caller: a
rubber-band hit-test has to say which tiles a drag covers without those tiles
being mounted, and a hit-test that disagrees with the renderer is the worst
failure that feature has. The two agree by sharing this function; these tests
say what it computes.
"""

from __future__ import annotations

import pytest

from client_js import call, needs_node

LAYOUT = "ui/src/lib/layout.js"
GAP = 4  # layout.js's, restated so the expected boxes below are arithmetic


def square(count: int) -> list[dict[str, int]]:
    return [{"w": 100, "h": 100} for _ in range(count)]


def boxes(items, height, avail, from_=0, to=None):
    row = {"top": 0, "height": height, "from": from_, "to": len(items) if to is None else to}
    return call(LAYOUT, "rowBoxes", row, items, avail)


@needs_node
def test_a_full_row_is_flush_to_both_edges():
    """Three square tiles at the height that exactly fills 668px. The row starts
    at the left edge and ends at the right one, with one gap between each pair."""
    result = boxes(square(3), 220, 220 * 3 + GAP * 2)
    assert result == [
        {"index": 0, "x": 0, "w": 220},
        {"index": 1, "x": 224, "w": 220},
        {"index": 2, "x": 448, "w": 220},
    ]


@needs_node
@pytest.mark.parametrize("avail", [1187, 1440, 1913])
def test_the_last_tile_absorbs_the_rounding(avail: int):
    """Each tile's width is rounded to a whole pixel, so a row of them lands
    somewhere near the right edge rather than on it. The last tile takes the
    remainder, which is what keeps the edge straight at every window width."""
    items = [{"w": 3, "h": 2}, {"w": 4, "h": 5}, {"w": 16, "h": 9}, {"w": 1, "h": 1}]
    result = boxes(items, 137, avail)
    assert result[0]["x"] == 0
    assert result[-1]["x"] + result[-1]["w"] == avail
    for before, after in zip(result, result[1:]):
        assert after["x"] == before["x"] + before["w"] + GAP


@needs_node
def test_the_ragged_last_row_still_reaches_the_right_edge():
    """The trailing row is packed at whatever height its tiles want, clamped to
    MAX_H so two leftover photos do not become a billboard. The clamp leaves the
    row short of the canvas, and the flush-right rule hands that shortfall to the
    last tile — so the final row of a query ends flush, with its last tile wider
    than its aspect ratio asks for. That is what the grid has always drawn."""
    result = boxes(square(2), 340, 1200)
    assert result == [
        {"index": 0, "x": 0, "w": 340},
        {"index": 1, "x": 344, "w": 856},
    ]


@needs_node
def test_a_single_tile_row_fills_the_width():
    """One tile is also the last tile, so it takes the whole row regardless of
    its aspect ratio — the case a portrait photo at the end of a query hits."""
    assert boxes([{"w": 2, "h": 3}], 340, 1440) == [{"index": 0, "x": 0, "w": 1440}]


@needs_node
def test_a_row_is_walked_from_its_own_offset():
    """Rows index into the whole item array, not into a slice of it, so a row in
    the middle of a page reports the indices its tiles actually have."""
    result = boxes(square(5), 100, 312, from_=2, to=5)
    assert [box["index"] for box in result] == [2, 3, 4]
    assert [box["x"] for box in result] == [0, 104, 208]


@needs_node
def test_the_adapter_reaches_any_named_export():
    """The seam is not `rowBoxes`-shaped. `aspect` is a second export with a
    different signature, and later tickets point the same adapter at the deck
    geometry, the marquee hit-test, the marking reducer and the share formatter."""
    assert call(LAYOUT, "aspect", {"w": 300, "h": 200}) == 1.5
    assert call(LAYOUT, "aspect", {"w": None, "h": None}) == 1
