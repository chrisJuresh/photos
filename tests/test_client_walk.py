"""`step` — which tile an arrow lands on from inside the overlay.

Stepping is tile to tile, so the whole of it is arithmetic over two numbers the
sheet already reports. Asserted here rather than through the browser because the
cases that matter are the ends of the view: the first tile, the last one,
and the last one *read* while more is still coming — which a browser test would
have to manufacture a paging boundary to reach.
"""

from __future__ import annotations

from client_js import call, needs_node

WALK = "ui/src/lib/walk.js"


def step(at: int, delta: int, loaded: int, exhausted: bool):
    return call(WALK, "step", at, delta, loaded, exhausted)


@needs_node
def test_stepping_forward_lands_on_the_next_tile():
    assert step(3, 1, 500, False) == 4


@needs_node
def test_stepping_back_lands_on_the_previous_tile():
    assert step(3, -1, 500, False) == 2


@needs_node
def test_the_first_tile_has_nothing_before_it():
    """The true start of the view, whether or not the rest has been read."""
    assert step(0, -1, 500, False) is None
    assert step(0, -1, 500, True) is None


@needs_node
def test_the_last_tile_of_an_exhausted_view_has_nothing_after_it():
    """`exhausted` is what makes the last loaded tile the last tile there is."""
    assert step(499, 1, 500, True) is None


@needs_node
def test_stepping_past_the_last_loaded_tile_still_lands():
    """There is a tile there; it has only not been read yet, and the sheet pages
    for it. Stopping here is what the ticket calls stopping dead."""
    assert step(499, 1, 500, False) == 500


@needs_node
def test_a_view_of_one_has_no_step_in_either_direction():
    assert step(0, -1, 1, True) is None
    assert step(0, 1, 1, True) is None


@needs_node
def test_an_empty_view_steps_nowhere():
    """Nothing can be open over an empty sheet, but the arithmetic still has to
    answer rather than hand back an index into nothing."""
    assert step(0, 1, 0, True) is None
