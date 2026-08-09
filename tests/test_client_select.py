"""The select mode's two pure parts: the mark/unmark reducer and the share
string.

Both are pure functions of plain data so they can be asserted here rather than
through the browser, which is the whole reason the node adapter exists. The
share string is the one the reader pastes into a bug report, so its shape is a
contract with a human being: a conditions line that says which grouping was on
screen, and the marked ids grouped the way the grid grouped them.
"""

from __future__ import annotations

from client_js import call, needs_node

SELECT = "ui/src/lib/select.js"


def query(on=True, window=10, sort="newest", filters=None):
    return {"stacking": {"on": on, "window": window}, "sort": sort, "filters": filters or {}}


def group(key, ids):
    return {"key": key, "ids": ids}


# --------------------------------------------------------------- the reducer


@needs_node
def test_a_tile_carries_the_whole_stack():
    """`m` is the page's own answer to what a stack holds, so a cover marks every
    member. The key stays the cover's id — that is what the tile is drawn as and
    what the tickbox has to be looked up by."""
    item = {"id": 1240, "m": [{"id": 1240}, {"id": 1241}, {"id": 1242}]}
    assert call(SELECT, "groupOf", item) == {"key": 1240, "ids": [1240, 1241, 1242]}


@needs_node
def test_a_tile_with_no_members_stands_for_itself():
    """A stack of one and every tile with stacking off arrive without `m`, and a
    tile already carries an id — the same rule the overlay opens by."""
    assert call(SELECT, "groupOf", {"id": 77}) == {"key": 77, "ids": [77]}


@needs_node
def test_marking_appends_and_unmarking_removes():
    marks = call(SELECT, "toggle", [], group(1, [1, 2]))
    assert marks == [group(1, [1, 2])]
    marks = call(SELECT, "toggle", marks, group(9, [9]))
    assert marks == [group(1, [1, 2]), group(9, [9])]
    assert call(SELECT, "toggle", marks, group(1, [1, 2])) == [group(9, [9])]


@needs_node
def test_the_marked_set_keeps_the_order_it_was_marked_in():
    """An array and not an object keyed by id: JS iterates integer-like keys in
    ascending numeric order, which would silently reorder a report away from
    what was on screen. Marking newest-first and reading it back has to give the
    order the reader clicked in."""
    marks = []
    for key in (9000, 12, 4400):
        marks = call(SELECT, "toggle", marks, group(key, [key]))
    assert [entry["key"] for entry in marks] == [9000, 12, 4400]


@needs_node
def test_the_reducer_does_not_touch_what_it_was_given():
    """A new array every time, because `$state` does not proxy into one deeply
    enough for a mutation to redraw the tickboxes."""
    before = [group(1, [1])]
    call(SELECT, "toggle", before, group(2, [2]))
    assert before == [group(1, [1])]


@needs_node
def test_the_tally_is_stacks_and_the_photographs_in_them():
    marks = [group(1, [1, 2, 3]), group(9, [9]), group(20, [20, 21])]
    assert call(SELECT, "tally", marks) == {"stacks": 3, "photos": 6}
    assert call(SELECT, "tally", []) == {"stacks": 0, "photos": 0}


# --------------------------------------------------------------- the string


@needs_node
def test_the_share_string_is_the_conditions_then_the_groups():
    """The example in the ticket, exactly."""
    marks = [group(1234, [1234, 1235, 1236]), group(1240, [1240]), group(1251, [1251, 1252])]
    assert call(SELECT, "shareText", query(), marks) == (
        "stack=10s sort=newest filters=none\n"
        "[1234,1235,1236],[1240],[1251,1252]"
    )


@needs_node
def test_the_conditions_say_when_stacking_is_off():
    """A run that failed to merge at 4s is a different finding from one that
    failed at 10s, and a run reported with stacking off is not a finding about
    grouping at all — so the line has to distinguish all three."""
    assert call(SELECT, "conditions", query(on=False, window=10)) == (
        "stack=off sort=newest filters=none"
    )


@needs_node
def test_the_window_is_only_reported_while_stacking_is_on():
    assert call(SELECT, "conditions", query(window=4)) == "stack=4s sort=newest filters=none"


@needs_node
def test_the_sort_is_whatever_the_query_carries():
    assert call(SELECT, "conditions", query(sort="oldest")).startswith("stack=10s sort=oldest")


@needs_node
def test_the_active_filters_are_named_with_their_values():
    """Dimensions in name order, so two reports of the same selection are the
    same string. Empty dimensions are the ones nobody touched and do not reach
    the query, so they do not reach this either."""
    line = call(
        SELECT,
        "conditions",
        query(filters={"camera": ["ILCE-7M3", "X100V"], "kind": ["raw_image"], "year": []}),
    )
    assert line == "stack=10s sort=newest filters=camera:ILCE-7M3|X100V,kind:raw_image"
