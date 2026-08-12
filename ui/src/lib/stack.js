// How the grid draws stacks — the frames verified to be the same photograph as one
// tile. Whether it draws them at all, and which of the stored assignments it draws.
// Remembered between visits, beside the theme and by the same rules.
//
// Only this setting is remembered. The sort and the filters are not: they are what
// you are looking for right now, and a library that reopened three days later still
// filtered to one camera would be lying about what it holds. Stacking is not that —
// it is how you like the grid drawn.
//
// The two knobs are `strictness` — the reader's threshold on the Match — and
// `linkage`, how many members of a stack a frame has to clear it against. Both are
// null until the reader moves one, meaning "whichever the server is pointed at":
// their settled values are ADR 0003's and belong in `photolib.browse`, so nothing
// here writes a number down. There is deliberately no third knob. The window is the
// fence the stored Matches were computed behind, so an assignment at any other value
// would have been decided over pairs nothing ever checked — see
// `migrations/011_stack_member.sql` and `docs/adr/0003-stack-on-verified-match.md`.

const KEY = "photos.stack";
const DEFAULT = { on: false, strictness: null, linkage: null };

/**
 * The remembered setting. localStorage is writable by anything on this origin
 * and survives a version of this app that wrote something else, so what comes
 * out of it is validated field by field rather than trusted — including the
 * `{on, window}` an older build of this app wrote, whose window is dropped.
 *
 * A knob that is not a positive integer, or not a string, comes back null rather
 * than refused: the worst a bad one can do is open the grid at the default, and
 * `settle` drops even a well-formed one that names no assignment.
 */
export function restore() {
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem(KEY) ?? "");
  } catch {
    return { ...DEFAULT };
  }
  if (stored === null || typeof stored !== "object") return { ...DEFAULT };
  return {
    on: stored.on === true,
    strictness: Number.isInteger(stored.strictness) && stored.strictness >= 0
      ? stored.strictness
      : null,
    linkage: typeof stored.linkage === "string" && stored.linkage ? stored.linkage : null,
  };
}

/** Remember it. Called on every change; three fields of JSON are not a cost. */
export function remember(state) {
  localStorage.setItem(
    KEY,
    JSON.stringify({ on: state.on, strictness: state.strictness, linkage: state.linkage }),
  );
  return state;
}

/** Whether `offered` — what `/api/facets` says exists — holds this pairing. */
function holds(offered, setting) {
  return offered.some(
    (entry) =>
      entry.strictness === setting.strictness && entry.linkage === setting.linkage,
  );
}

/**
 * The remembered setting, dropped back to the default if it names an assignment
 * that is not there any more.
 *
 * A setting is a choice of which stored population to read, and the remembered one
 * outlives the table: a reader who ran the pass at another strictness, looked at it,
 * and later rebuilt the catalog would otherwise reopen the grid pointed at rows
 * nobody wrote — which the server refuses, so the grid would open on an error. The
 * server refusing is the backstop; this is why it is never reached.
 */
export function settle(stacking, offered) {
  if (stacking.strictness === null && stacking.linkage === null) return stacking;
  if (holds(offered, stacking)) return stacking;
  return { ...stacking, strictness: null, linkage: null };
}

/**
 * The setting a click on one knob asks for: the change, with the *other* knob
 * moved too if this pairing does not exist.
 *
 * Two settings existing does not make their four combinations exist, so a panel
 * that let the reader assemble a pair out of two lists could assemble one nobody
 * wrote. Moving the knob they touched and following with the other keeps every
 * proposal a setting somebody ran the pass at. `current` is resolved — no nulls —
 * because a click is a choice and the default is only a stand-in for not having
 * made one.
 *
 * `change` names one knob, and its value came out of `offered`, so the search below
 * has something to find.
 */
export function choose(offered, current, change) {
  const wanted = { ...current, ...change };
  if (holds(offered, wanted)) return wanted;
  const moved = "strictness" in change ? "strictness" : "linkage";
  const first = offered.find((entry) => entry[moved] === wanted[moved]);
  return { strictness: first.strictness, linkage: first.linkage };
}
