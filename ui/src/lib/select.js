// Select mode's data: which tiles the reader has selected, and what a report of
// them says.
//
// The grid is being reported as grouping wrongly, and this is the instrument for
// saying which runs. So what leaves here is not a flat list of photograph ids —
// it is the ids *as the grid grouped them*, under a line naming the conditions
// they were grouped under. The grouping is the claim; a list of ids without it
// is half the evidence, and without the window it costs a round trip to ask.
//
// Pure functions over plain arrays and objects, so `tests/test_client_select.py`
// drives them through the node adapter rather than through a browser.

/**
 * What one selected tile stands for: the stack's key and every photograph in it.
 *
 * `m` is the page's own answer to what a stack holds, and it is absent on a
 * stack of one and on every tile while stacking is off — the same shape
 * `App.svelte`'s `activate` opens the overlay from. The key is the cover's id
 * because that is what the tile is drawn as, and so what a recycled tile has to
 * look its tickbox up by.
 */
export function stackOf(item) {
  return { key: item.id, ids: (item.m ?? [item]).map((frame) => frame.id) };
}

/**
 * Select the stack if it is not selected, deselect it if it is. A new array
 * every time: `$state` does not proxy deeply enough for a mutation to repaint
 * the tickboxes, and reassignment is what makes them redraw.
 *
 * An array and not an object keyed by id, because JS iterates integer-like keys
 * in ascending numeric order — which would quietly reorder a report away from
 * the order the reader clicked in, and the order is part of what they saw.
 */
export function toggle(selected, stack) {
  const without = selected.filter((entry) => entry.key !== stack.key);
  return without.length === selected.length ? [...selected, stack] : without;
}

/**
 * One verdict applied to a run of stacks: the marquee's, and shift-click's.
 *
 * `adding` is fixed before the run is known — by the state of the tile the drag
 * pressed on, or by the state of the tile the shift-click landed on — so this
 * takes it rather than deciding it per stack. A box whose meaning changed under
 * the hand as it grew would be unusable.
 *
 * Additive in both directions: it adds or removes what it was handed and leaves
 * everything else exactly where it was. The reader sweeps several separate runs
 * scattered down the sheet to send in one message, so a drag that cleared the
 * previous sweep would be exactly wrong; clearing is the button that says so.
 *
 * A new array as `toggle` returns one, and for the same reason. The drag
 * re-applies this to the snapshot it took at the start on every pointer move,
 * which is what makes a tile the box has moved back off revert.
 */
export function sweep(selected, stacks, adding) {
  if (!adding) {
    const swept = new Set(stacks.map((stack) => stack.key));
    return selected.filter((entry) => !swept.has(entry.key));
  }
  const held = new Set(selected.map((entry) => entry.key));
  return [...selected, ...stacks.filter((stack) => !held.has(stack.key))];
}

/** How many stacks are selected, and how many photographs they hold. */
export function tally(selected) {
  return {
    stacks: selected.length,
    photos: selected.reduce((sum, entry) => sum + entry.ids.length, 0),
  };
}

/**
 * What was on screen, in one line. `query` is `{stacking, sort, filters}` —
 * the grid's own state, unchanged.
 *
 * Dimensions in name order so two reports of one view are one string.
 * A dimension with nothing filtered on never reaches the grid's query and does
 * not reach this either.
 */
export function conditions(query) {
  // The setting rides with the mode, and only while stacking is on: which
  // assignment the grid was reading is what makes a set of groups mean anything,
  // and a reader who never moved a knob was looking at the default, which the two
  // nulls say more honestly than a number copied out of the server would.
  const stack = query.stacking.on
    ? "on" +
      (query.stacking.strictness === null && query.stacking.linkage === null
        ? ""
        : ` strictness=${query.stacking.strictness} linkage=${query.stacking.linkage}`)
    : "off";
  const filters = Object.entries(query.filters)
    .filter(([, values]) => values.length > 0)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([name, values]) => name + ":" + values.join("|"));
  return `stack=${stack} sort=${query.sort} filters=${filters.length ? filters.join(",") : "none"}`;
}

/** The conditions line, then the selected ids grouped as the grid grouped them. */
export function shareText(query, selected) {
  const stacks = selected.map((entry) => "[" + entry.ids.join(",") + "]").join(",");
  return conditions(query) + "\n" + stacks;
}
