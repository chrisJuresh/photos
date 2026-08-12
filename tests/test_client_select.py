"""The select mode's two pure parts: the select/deselect reducer and the share
string.

Both are pure functions of plain data so they can be asserted here rather than
through the browser, which is the whole reason the node adapter exists. The
share string is the one the reader pastes into a bug report, so its shape is a
contract with a human being: a conditions line that says which grouping was on
screen, and the selected ids grouped the way the grid grouped them.
"""

from __future__ import annotations

from client_js import call, needs_node

SELECT = "ui/src/lib/select.js"


def query(on=True, sort="newest", filters=None, strictness=None, linkage=None):
    return {
        "stacking": {"on": on, "strictness": strictness, "linkage": linkage},
        "sort": sort,
        "filters": filters or {},
    }


def stack(key, ids):
    return {"key": key, "ids": ids}


# --------------------------------------------------------------- the reducer


@needs_node
def test_a_tile_carries_the_whole_stack():
    """`m` is the page's own answer to what a stack holds, so a cover selects
    every member. The key is the stack's name and not the cover's id: the cover is
    resolved per query, so a pick keyed on one could not survive a filter."""
    item = {"id": 1240, "s": "cc", "k": "aa", "m": [{"id": 1240}, {"id": 1241}, {"id": 1242}]}
    assert call(SELECT, "stackOf", item) == {"key": "aa", "ids": [1240, 1241, 1242]}


@needs_node
def test_a_tile_with_no_members_stands_for_itself():
    """A stack of one and every tile with stacking off arrive without `m`, and a
    tile already carries an id — the same rule the overlay opens by."""
    assert call(SELECT, "stackOf", {"id": 77, "s": "bb", "k": "bb"}) == {
        "key": "bb",
        "ids": [77],
    }


@needs_node
def test_a_tile_with_no_name_is_named_by_its_own_hash():
    """Stacking off: the payload carries no `k` at all, because there a tile
    stands for itself and two frames of one stack are two tiles that must not
    share a handle. One rule for both settings of a switch the page does not
    mention, exactly as `m` is read."""
    assert call(SELECT, "nameOf", {"id": 77, "s": "bb"}) == "bb"
    assert call(SELECT, "stackOf", {"id": 77, "s": "bb"}) == {"key": "bb", "ids": [77]}
    assert call(SELECT, "nameOf", {"id": 77, "s": "bb", "k": "aa"}) == "aa"


@needs_node
def test_selecting_appends_and_deselecting_removes():
    selected = call(SELECT, "toggle", [], stack(1, [1, 2]))
    assert selected == [stack(1, [1, 2])]
    selected = call(SELECT, "toggle", selected, stack(9, [9]))
    assert selected == [stack(1, [1, 2]), stack(9, [9])]
    assert call(SELECT, "toggle", selected, stack(1, [1, 2])) == [stack(9, [9])]


@needs_node
def test_the_selected_set_keeps_the_order_it_was_picked_in():
    """An array and not a collection keyed by name: the report claims the order
    the reader clicked in, and reading it back out of a set or a map would recover
    the sheet's order instead — which is the one thing it is not claiming."""
    selected = []
    for key in ("ee", "aa", "cc"):
        selected = call(SELECT, "toggle", selected, stack(key, [1]))
    assert [entry["key"] for entry in selected] == ["ee", "aa", "cc"]


@needs_node
def test_the_reducer_does_not_touch_what_it_was_given():
    """A new array every time, because `$state` does not proxy into one deeply
    enough for a mutation to redraw the tickboxes."""
    before = [stack(1, [1])]
    call(SELECT, "toggle", before, stack(2, [2]))
    assert before == [stack(1, [1])]


@needs_node
def test_the_tally_is_stacks_and_the_photographs_in_them():
    selected = [stack(1, [1, 2, 3]), stack(9, [9]), stack(20, [20, 21])]
    assert call(SELECT, "tally", selected) == {"stacks": 3, "photos": 6}
    assert call(SELECT, "tally", []) == {"stacks": 0, "photos": 0}


# --------------------------------------------------------------- the view moves


@needs_node
def test_a_narrowed_view_leaves_a_stack_selected_holding_less():
    """The ticket's own case. The filter removed a frame from a stack the reader
    had picked; the pick stands, because the name it is keyed on is a property of
    the photographs, and what it holds is re-read from the page that arrived."""
    before = [stack("aa", [1, 2, 3]), stack("bb", [9])]
    after = call(SELECT, "refresh", before, [stack("aa", [1, 3]), stack("cc", [40])])
    assert after == [stack("aa", [1, 3]), stack("bb", [9])]


@needs_node
def test_a_page_that_moved_nothing_leaves_the_set_alone():
    """Every page of the view flows through this. A page holding none of the picks
    — which is most of them — and a page holding one that has not changed both
    leave the set exactly as it was."""
    before = [stack("aa", [1, 2])]
    assert call(SELECT, "refresh", before, []) == before
    assert call(SELECT, "refresh", before, [stack("cc", [7])]) == before
    assert call(SELECT, "refresh", before, [stack("aa", [1, 2])]) == before


@needs_node
def test_a_stack_the_new_view_has_not_reached_keeps_what_it_held():
    """The sheet pages as the reader scrolls, so a pick further down the new view
    has not arrived yet. Dropping it would lose a pick to a scroll position;
    holding it is the honest reading, and the page that reaches it corrects it."""
    before = [stack("aa", [1, 2, 3])]
    assert call(SELECT, "refresh", before, [stack("zz", [50])]) == before


@needs_node
def test_a_sort_that_reorders_a_stacks_frames_moves_what_the_pick_holds():
    """`m` is the page's own order and the report claims it, so the ids follow the
    sort. Newest-first draws a burst the other way round from oldest-first, and the
    clipboard has to say which one was on screen."""
    before = [stack("aa", [1, 2, 3])]
    assert call(SELECT, "refresh", before, [stack("aa", [3, 2, 1])]) == [
        stack("aa", [3, 2, 1])
    ]


@needs_node
def test_a_widened_view_gives_a_stack_its_frames_back():
    before = [stack("aa", [1])]
    assert call(SELECT, "refresh", before, [stack("aa", [1, 2, 3])]) == [
        stack("aa", [1, 2, 3])
    ]


@needs_node
def test_the_grouping_is_the_mode_and_the_knobs_and_nothing_else():
    """What empties a selection. A filter or a sort changes the view and the marks
    still name stacks the grid still groups; the toggle and the two knobs change
    the grouping, and then they do not."""
    assert call(SELECT, "grouping", query()["stacking"]) == "on"
    assert call(SELECT, "grouping", query(on=False)["stacking"]) == "off"
    assert (
        call(SELECT, "grouping", query(strictness=40, linkage="complete")["stacking"])
        == "on strictness=40 linkage=complete"
    )
    # The sort and the filters are not in it, which is the whole point.
    assert call(SELECT, "grouping", query(sort="oldest", filters={"camera": ["X100V"]})[
        "stacking"
    ]) == call(SELECT, "grouping", query()["stacking"])


# ------------------------------------------------------------------ the sweep


@needs_node
def test_a_sweep_appends_what_it_caught_in_sheet_order():
    """The marquee and shift-click both land here. The order is the order the
    tiles are drawn in, which is the grid's current sort — the same claim a
    click-by-click report makes about the order the reader worked in."""
    selected = call(SELECT, "sweep", [], [stack(3, [3]), stack(7, [7, 8])], True)
    assert selected == [stack(3, [3]), stack(7, [7, 8])]


@needs_node
def test_a_sweep_over_something_already_selected_takes_it_once():
    """Two drags overlapping, or a shift-click back across a range: the second
    one must not put a second copy of a stack in the report."""
    before = [stack(3, [3]), stack(9, [9])]
    after = call(SELECT, "sweep", before, [stack(9, [9]), stack(12, [12])], True)
    assert after == [stack(3, [3]), stack(9, [9]), stack(12, [12])]


@needs_node
def test_a_deselecting_sweep_takes_only_what_it_swept():
    before = [stack(3, [3]), stack(9, [9]), stack(12, [12])]
    assert call(SELECT, "sweep", before, [stack(9, [9])], False) == [
        stack(3, [3]),
        stack(12, [12]),
    ]


@needs_node
def test_a_sweep_never_clears_picks_outside_the_box():
    """This is not a file manager. The reader sweeps several separate runs
    scattered down the sheet to send in one message, so a drag that destroyed
    the previous sweep would be exactly wrong — clearing is the button."""
    before = [stack(1, [1]), stack(2, [2])]
    assert call(SELECT, "sweep", before, [stack(50, [50])], True) == [
        stack(1, [1]),
        stack(2, [2]),
        stack(50, [50]),
    ]
    assert call(SELECT, "sweep", before, [stack(50, [50])], False) == before


@needs_node
def test_an_empty_sweep_changes_nothing():
    """Every drag starts as one: the box has no area until the pointer moves."""
    before = [stack(1, [1])]
    assert call(SELECT, "sweep", before, [], True) == before
    assert call(SELECT, "sweep", before, [], False) == before


@needs_node
def test_the_sweep_does_not_touch_what_it_was_given():
    """Applied to the same snapshot on every pointer move — a live preview is
    the drag's verdict re-applied to the set as it stood when the drag began, so
    a tile the box has moved back off reverts."""
    before = [stack(1, [1])]
    call(SELECT, "sweep", before, [stack(2, [2])], True)
    assert before == [stack(1, [1])]


# --------------------------------------------------------------- the string


@needs_node
def test_the_share_string_is_the_conditions_then_the_groups():
    """The example in the ticket, exactly."""
    selected = [stack(1234, [1234, 1235, 1236]), stack(1240, [1240]), stack(1251, [1251, 1252])]
    assert call(SELECT, "shareText", query(), selected) == (
        "stack=on sort=newest filters=none\n"
        "[1234,1235,1236],[1240],[1251,1252]"
    )


@needs_node
def test_the_conditions_say_when_stacking_is_off():
    """A set of runs reported with stacking off is not a finding about grouping at
    all, so the line has to say which mode was on screen. Nothing about the setting
    with it: there is no grouping for a strictness to have decided."""
    assert call(SELECT, "conditions", query(on=False, strictness=40, linkage="complete")) == (
        "stack=off sort=newest filters=none"
    )


@needs_node
def test_the_conditions_say_which_assignment_was_on_screen():
    """The knobs choose which stored assignment the grid reads, so a report of what
    the grid grouped has to say which one it was reading -- two settings group the
    same frames differently, and a set of groups from one is not evidence about the
    other. A reader who moved no knob was looking at the default, and the line says
    only `on`, because the number the default stands for is the server's."""
    assert call(SELECT, "conditions", query(strictness=40, linkage="complete")) == (
        "stack=on strictness=40 linkage=complete sort=newest filters=none"
    )
    assert call(SELECT, "conditions", query()) == "stack=on sort=newest filters=none"


@needs_node
def test_the_sort_is_whatever_the_query_carries():
    assert call(SELECT, "conditions", query(sort="oldest")).startswith("stack=on sort=oldest")


@needs_node
def test_the_active_filters_are_named_with_their_values():
    """Dimensions in name order, so two reports of the same view are the
    same string. Empty dimensions are the ones nobody touched and do not reach
    the query, so they do not reach this either."""
    line = call(
        SELECT,
        "conditions",
        query(filters={"camera": ["ILCE-7M3", "X100V"], "kind": ["raw_image"], "year": []}),
    )
    assert line == "stack=on sort=newest filters=camera:ILCE-7M3|X100V,kind:raw_image"
