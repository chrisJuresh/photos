// Whether the grid draws stacks — the frames verified to be the same photograph
// as one tile. Remembered between visits, beside the theme and by the same rules.
//
// Only this setting is remembered. The sort and the filters are not: they are what
// you are looking for right now, and a library that reopened three days later still
// filtered to one camera would be lying about what it holds. Stacking is not that —
// it is how you like the grid drawn.
//
// There is nothing else to remember. What used to sit beside it was the window, and
// membership is stored now: the gap that fences a stack is a build-time commitment
// and no longer a knob — see `docs/adr/0003-stack-on-verified-match.md`.

const KEY = "photos.stack";
const DEFAULT = { on: false };

/**
 * The remembered setting. localStorage is writable by anything on this origin
 * and survives a version of this app that wrote something else, so what comes
 * out of it is validated field by field rather than trusted — including the
 * `{on, window}` an older build of this app wrote, whose window is dropped.
 */
export function restore() {
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem(KEY) ?? "");
  } catch {
    return { ...DEFAULT };
  }
  if (stored === null || typeof stored !== "object") return { ...DEFAULT };
  return { on: stored.on === true };
}

/** Remember it. Called on every change; one field of JSON is not a cost. */
export function remember(state) {
  localStorage.setItem(KEY, JSON.stringify({ on: state.on }));
  return state;
}
