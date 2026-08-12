"""The two pure parts of the reader's stacking knobs.

A knob is a choice of which stored assignment the grid reads, so the only thing
either function has to get right is that the setting it hands over is one somebody
ran `python -m photolib.membership` at. `photolib.browse` refuses anything else,
which is the backstop; these are why it is never reached.

`localStorage` is not here — `restore` and `remember` are the browser's half and are
exercised in the browser. What is here is what happens to a remembered setting when
the table under it has changed.
"""

from __future__ import annotations

from client_js import call, needs_node

STACK = "ui/src/lib/stack.js"

# What `/api/facets` says exists. Two strictnesses, and deliberately not every
# pairing of the two values that appear: 40 was only ever run under complete.
OFFERED = [
    {"strictness": 20, "linkage": "majority"},
    {"strictness": 40, "linkage": "complete"},
]


def setting(strictness, linkage, on=True):
    return {"on": on, "strictness": strictness, "linkage": linkage}


# ------------------------------------------------------------------ settle


@needs_node
def test_a_setting_nobody_ran_the_pass_at_falls_back_to_the_default():
    """A remembered setting outlives the table: the reader who looked at another
    strictness and then rebuilt the catalog reopens the grid at the default rather
    than on the server's refusal."""
    assert call(STACK, "settle", setting(25, "neighbour"), OFFERED) == setting(None, None)


@needs_node
def test_a_setting_that_still_exists_is_kept():
    assert call(STACK, "settle", setting(40, "complete"), OFFERED) == setting(40, "complete")


@needs_node
def test_the_default_needs_no_population_to_survive_a_reload():
    """Nulls mean "whichever the server is pointed at", and the server serves that
    one whether or not a pass has written it — an empty table read as stacks of one
    is the documented no-op. So the default is never dropped, including when nothing
    is offered at all."""
    assert call(STACK, "settle", setting(None, None), []) == setting(None, None)
    assert call(STACK, "settle", setting(None, None), OFFERED) == setting(None, None)


@needs_node
def test_settling_leaves_the_toggle_alone():
    """The toggle is not a setting: turning stacking off is not the same as having
    no assignment to read."""
    assert call(STACK, "settle", setting(25, "neighbour", on=False), OFFERED)["on"] is False


# ------------------------------------------------------------------ choose


@needs_node
def test_moving_one_knob_keeps_the_other_where_the_pairing_exists():
    current = {"strictness": 20, "linkage": "majority"}
    offered = OFFERED + [{"strictness": 40, "linkage": "majority"}]
    assert call(STACK, "choose", offered, current, {"strictness": 40}) == {
        "strictness": 40,
        "linkage": "majority",
    }


@needs_node
def test_moving_one_knob_drags_the_other_rather_than_assembling_a_pairing():
    """The panel offers two lists and the table holds pairs, so a reader could
    otherwise assemble a setting nobody wrote. Asking for 40 — which only exists
    under complete — moves the linkage with it."""
    current = {"strictness": 20, "linkage": "majority"}
    assert call(STACK, "choose", OFFERED, current, {"strictness": 40}) == {
        "strictness": 40,
        "linkage": "complete",
    }


@needs_node
def test_the_knob_the_reader_touched_is_the_one_that_gets_what_it_asked_for():
    """Symmetric: asking for a linkage moves the strictness, and never the other way
    round, because the reader pressed the linkage."""
    current = {"strictness": 20, "linkage": "majority"}
    assert call(STACK, "choose", OFFERED, current, {"linkage": "complete"}) == {
        "strictness": 40,
        "linkage": "complete",
    }
