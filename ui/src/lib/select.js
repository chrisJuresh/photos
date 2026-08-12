// Select mode's data: which tiles the reader has selected, and what a report of
// them says.
//
// The grid is being reported as grouping wrongly, and this is the instrument for
// saying which runs. So what leaves here is not a flat list of photograph ids —
// it is the ids *as the grid grouped them*, under a line naming the conditions
// they were grouped under. The grouping is the claim; a list of ids without it
// is half the evidence, and without the window it costs a round trip to ask.
//
// A pick is keyed on the stack's *name* and not on the cover that stands for it,
// which is what lets a set survive a filter or a sort: the name is a property of
// the photographs, the cover is a property of the view. What empties a set is
// `grouping` changing — the same string the report's conditions line carries.
//
// Pure functions over plain arrays and objects, so `tests/test_client_select.py`
// drives them through the node adapter rather than through a browser.

/**
 * The name of what a tile stands for.
 *
 * `k` is the stack's stored name — the earliest member's sha256, decided by
 * `photolib.membership` — and it is the one handle on a stack that a change of
 * view cannot move: the cover is resolved per query and the ids are reassigned
 * by every rebuild. It is absent while stacking is off, where a tile stands for
 * itself and its own hash is its name, so one rule covers both settings of the
 * switch exactly as `App.svelte`'s `framesOf` does.
 */
export function nameOf(item) {
  return item.k ?? item.s;
}

/**
 * What one selected tile stands for: the stack's name and every photograph in it.
 *
 * `m` is the page's own answer to what a stack holds, and it is absent on a
 * stack of one and on every tile while stacking is off — the same shape
 * `App.svelte`'s `activate` opens the overlay from.
 */
export function stackOf(item) {
  return { key: nameOf(item), ids: (item.m ?? [item]).map((frame) => frame.id) };
}

/**
 * The selected set, with each entry's ids taken from the view as it now stands.
 *
 * A name outlives a filter change; the photographs behind it do not, because a
 * filter removes frames from a stack. So a selection carried across one is still
 * the reader's picks, and what each pick *holds* is re-read from the page that
 * arrives — which is what keeps the count and the report describing the view
 * their conditions line names.
 *
 * A pick the new view has not shown keeps what it last held: the sheet pages as
 * the reader scrolls, so "further down this view" and "not in this view at all"
 * look identical until the view is exhausted, and dropping the second would take
 * the first with it — which is the surviving this exists for. Both are corrected
 * by the page that reaches them, and neither is invented.
 *
 * Order counts as a change, because `m` is the page's own order and the report
 * claims it: a sort that draws a stack's frames the other way round really has
 * moved what the pick holds.
 *
 * The same array back when nothing moved, because the sheet re-binds every
 * mounted tile whenever this identity changes and a page that touched no
 * selected stack is most of them.
 */
export function refresh(selected, stacks) {
  const fresh = new Map(stacks.map((stack) => [stack.key, stack.ids]));
  let moved = false;
  const next = selected.map((entry) => {
    const ids = fresh.get(entry.key);
    if (ids === undefined || sameFrames(entry.ids, ids)) return entry;
    moved = true;
    return { key: entry.key, ids };
  });
  return moved ? next : selected;
}

/** The same photographs in the same order — both halves of what a pick holds. */
function sameFrames(ids, others) {
  return ids.length === others.length && ids.every((id, at) => id === others[at]);
}

/**
 * Select the stack if it is not selected, deselect it if it is. A new array
 * every time: `$state` does not proxy deeply enough for a mutation to repaint
 * the tickboxes, and reassignment is what makes them redraw.
 *
 * An array and not a set or a map keyed by name: the order the reader clicked in
 * is part of what they saw, and the report says so — a collection that recovered
 * that order from anything but the clicks would be recovering the sheet's order,
 * which is the one thing the report is not claiming.
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
  const filters = Object.entries(query.filters)
    .filter(([, values]) => values.length > 0)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([name, values]) => name + ":" + values.join("|"));
  return `stack=${grouping(query.stacking)} sort=${query.sort} filters=${filters.length ? filters.join(",") : "none"}`;
}

/**
 * Which grouping is on screen, as one string.
 *
 * The setting rides with the mode, and only while stacking is on: which
 * assignment the grid was reading is what makes a set of groups mean anything,
 * and a reader who never moved a knob was looking at the default, which the two
 * nulls say more honestly than a number copied out of the server would.
 *
 * This is also what empties a selection. A filter or a sort changes the *view*
 * and the picks still name stacks the grid still groups; the toggle and the two
 * knobs change the *grouping*, and after one of those the stacks the picks named
 * do not exist. So the two questions — what was on screen, and whether a pick
 * still means anything — are one string rather than two lists of knobs kept in
 * step.
 */
export function grouping(stacking) {
  if (!stacking.on) return "off";
  return (
    "on" +
    (stacking.strictness === null && stacking.linkage === null
      ? ""
      : ` strictness=${stacking.strictness} linkage=${stacking.linkage}`)
  );
}

/** The conditions line, then the selected ids grouped as the grid grouped them. */
export function shareText(query, selected) {
  const stacks = selected.map((entry) => "[" + entry.ids.join(",") + "]").join(",");
  return conditions(query) + "\n" + stacks;
}
