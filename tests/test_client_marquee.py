"""`tilesIn` — which tiles a rubber-band box covers.

The marquee sweeps tiles that are not mounted: about three viewports are in the
DOM at a time and the rest are pooled away, so hit-testing against elements
would answer for a fraction of what the box crosses. It hit-tests against the
geometry instead — the committed rows, the item array, and the canvas width
`packRows` packed them against — through the same `rowBoxes` walk the renderer
places tiles with. That sharing is the point: a marquee that disagreed with
where tiles are drawn is the worst failure this feature has.

Pure in, pure out, so it is asserted here rather than through a browser.

The fixture below is three rows of three squares at 668px, which is exactly
three 220px tiles and two 4px gaps. Every number in the expectations is
arithmetic from `GAP`, `DECK_H` and `ROW_GAP`.
"""

from __future__ import annotations

from client_js import call, needs_node

LAYOUT = "ui/src/lib/layout.js"

GAP = 4  # layout.js's, restated so the boxes below are readable as arithmetic
DECK_H = 12
ROW_GAP = GAP + DECK_H
H = 220
AVAIL = H * 3 + GAP * 2  # 668

# x: 0..220, 224..444, 448..668 in every row
ITEMS = [{"w": 100, "h": 100} for _ in range(9)]
ROWS = [
    {"top": DECK_H + r * (H + ROW_GAP), "height": H, "from": r * 3, "to": r * 3 + 3}
    for r in range(3)
]
# rows span y 12..232, 248..468, 484..704


def swept(left, top, right, bottom, rows=None, items=None, avail=AVAIL):
    rect = {"left": left, "top": top, "right": right, "bottom": bottom}
    return call(LAYOUT, "tilesIn", ROWS if rows is None else rows, items or ITEMS, avail, rect)


@needs_node
def test_a_box_over_one_tile_catches_that_tile():
    assert swept(10, 20, 50, 60) == [0]


@needs_node
def test_a_box_crossing_several_rows_catches_every_tile_it_touches():
    """From inside row 0's second tile down into row 2. The first column is left
    of the box in every row, so what comes back is two of three tiles per row —
    and in index order, which is the order the grid is sorted in."""
    assert swept(230, 100, 460, 500) == [1, 2, 4, 5, 7, 8]


@needs_node
def test_a_box_inside_the_gap_between_two_tiles_catches_nothing():
    """Tile 0 ends at 220 and tile 1 starts at 224. A box in those four pixels
    is over the canvas, not over a photograph."""
    assert swept(221, 20, 223, 60) == []


@needs_node
def test_a_box_inside_the_gap_between_two_rows_catches_nothing():
    """Row 0 ends at 232 and row 1 starts at 248 — the row gap, which is wider
    than the tile gap because a deck rises into it."""
    assert swept(0, 235, AVAIL, 245) == []


@needs_node
def test_a_box_past_the_last_packed_row_catches_nothing():
    """Below every row there is reserved height for pages not read yet, and no
    geometry at all. A box dragged into it is a box over nothing — not a box
    over the last row, which is what a row span found by search reports if its
    ends are not checked against the rows themselves."""
    assert swept(0, 800, AVAIL, 900) == []


@needs_node
def test_a_box_running_off_the_bottom_still_catches_the_last_row():
    assert swept(0, 600, AVAIL, 900) == [6, 7, 8]


@needs_node
def test_a_box_above_the_first_row_catches_nothing():
    """The sheet leaves `DECK_H` above row 0 so every row has the same room for
    a deck above it. Nothing is drawn in it."""
    assert swept(0, 0, AVAIL, 8) == []


@needs_node
def test_an_unpacked_sheet_catches_nothing():
    """Width 0 packs no rows — a tab that loaded while hidden — and a drag on it
    is a drag on an empty canvas."""
    assert swept(0, 0, 999, 999, rows=[]) == []


@needs_node
def test_the_box_touching_a_tile_edge_counts_as_touching_it():
    """Inclusive at both ends: a one-pixel box on a tile's last column is over
    that tile, and the reader cannot see which pixel they pressed."""
    assert swept(220, 20, 220, 60) == [0]
    assert swept(224, 20, 224, 60) == [1]


@needs_node
def test_a_zero_area_box_is_the_tile_under_the_pointer():
    """Drag start asks this question of the point alone: which tile is under the
    pointer, and therefore whether this drag marks or unmarks."""
    assert swept(500, 300, 500, 300) == [5]
    assert swept(500, 240, 500, 240) == []  # between the rows: empty canvas


@needs_node
def test_the_last_tile_of_a_row_reaches_the_right_edge():
    """`rowBoxes` hands the rounding remainder to the last tile, so the row is
    exactly `avail` wide. The hit-test inherits that by sharing the walk."""
    items = [{"w": 3, "h": 2}, {"w": 4, "h": 5}, {"w": 1, "h": 1}]
    rows = [{"top": 0, "height": 137, "from": 0, "to": 3}]
    assert swept(1439, 0, 1440, 100, rows=rows, items=items, avail=1440) == [2]
