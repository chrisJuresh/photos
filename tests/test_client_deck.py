"""`deck` — the card edges a tile draws when it stands for a stack.

The whole of the deck's geometry is one pure function of two numbers: how many
frames the stack holds, and how wide the tile is. It is asserted here rather
than through the browser because saturation is the interesting part and the
interesting sizes are rare on screen — a fifty-frame stack is one row of one
query, and the arithmetic that keeps it from becoming a wedge should not have to
be found by scrolling to it.

Card 0 is the one nearest the photograph; the last is the deepest. `top` is
measured down from the top of the strip, so the deepest card is always at 0 and
the strip's height never depends on the stack's size.
"""

from __future__ import annotations

import pytest

from client_js import call, needs_node

LAYOUT = "ui/src/lib/layout.js"
DECK_H = 12  # layout.js's, restated so the expected tops below are arithmetic
DECK_MAX = 6


def deck(size, width=300):
    return call(LAYOUT, "deck", size, width)


@needs_node
@pytest.mark.parametrize("size", [0, 1])
def test_a_tile_that_is_its_own_only_frame_draws_no_cards(size: int):
    """Size 1 is most of a stacked page and every tile of an unstacked one. No
    strip, no edges, and nothing to hide when a pooled tile is recycled onto it."""
    assert deck(size) == []


@needs_node
def test_stacking_off_draws_no_cards():
    """With stacking off the payload carries no `n` at all, so the renderer hands
    this `undefined`. That is a stack of one by another name, not an error."""
    assert deck(None) == []


@needs_node
def test_two_frames_are_one_card_filling_the_strip():
    """One card behind the photograph, and it occupies the whole strip: the strip
    is a constant height and a deck of two has nothing to share it with."""
    assert deck(2) == [{"top": 0, "inset": 5, "opacity": 1}]


@needs_node
def test_three_frames_are_two_cards_sharing_the_strip():
    """Each further frame is another edge in the same space, so the pitch halves
    rather than the strip growing. The taper is one step per card, and the second
    card is fainter than the first."""
    assert deck(3) == [
        {"top": 6, "inset": 5, "opacity": 1},
        {"top": 0, "inset": 10, "opacity": 0.91},
    ]


@needs_node
def test_the_edges_saturate_at_six():
    """Seven frames is where the ceiling is reached: six edges, packed two pixels
    apart in the same twelve-pixel strip. Past a handful the only true statement
    is "many", and this is what says it."""
    cards = deck(7)
    assert [card["top"] for card in cards] == [10, 8, 6, 4, 2, 0]
    assert [card["inset"] for card in cards] == [5, 10, 15, 20, 25, 30]
    assert [card["opacity"] for card in cards] == [1, 0.91, 0.82, 0.73, 0.64, 0.55]


@needs_node
def test_a_very_large_stack_draws_exactly_what_the_boundary_draws():
    """Fifty frames and eight frames are the same deck. The count belongs in the
    overlay; a tile that grew with it would be a chart."""
    assert deck(50) == deck(7)
    assert deck(8) == deck(7)
    assert len(deck(50)) == DECK_MAX


@needs_node
def test_the_strip_is_the_same_height_at_every_size():
    """The deepest card starts at the top of the strip whatever the size is, which
    is what keeps the row gap a constant and the photographs aligned."""
    for size in (2, 3, 4, 7, 50):
        assert deck(size)[-1]["top"] == 0
        assert deck(size)[0]["top"] < DECK_H


@needs_node
def test_the_taper_is_capped_on_a_narrow_tile():
    """A fifty-frame stack on a narrow portrait tile keeps six edges, but the
    horizontal step shrinks with the tile so the deepest card is still most of the
    tile's width — a stack, not a wedge."""
    cards = deck(50, 80)
    assert [card["inset"] for card in cards] == [2, 4, 6, 8, 10, 12]
    assert 80 - 2 * cards[-1]["inset"] > 80 * 0.6


@needs_node
def test_a_wide_tile_does_not_taper_without_limit():
    """The step is capped from above as well: on a 1440px last-row tile the deck
    is the same few pixels of taper it is everywhere else."""
    assert [card["inset"] for card in deck(50, 1440)] == [5, 10, 15, 20, 25, 30]
