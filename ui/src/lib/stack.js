// Whether the grid collapses a run of consecutive captures into one tile, and
// how many seconds of gap still counts as one run. Remembered between visits,
// beside the theme and by the same rules.
//
// Only these two settings are remembered. The sort and the filters are not:
// they are what you are looking for right now, and a library that reopened
// three days later still filtered to one camera would be lying about what it
// holds. Stacking is not that — it is how you like the grid drawn.

const KEY = "photos.stack";
const DEFAULT = { on: false, window: 4 };

// The slider's range, which is also the server's: `photolib.browse` refuses a
// window outside it by name rather than clamping, so a value restored from
// storage has to be checked here before it can reach a query string.
export const MIN = 1;
export const MAX = 10;

/**
 * The remembered setting. localStorage is writable by anything on this origin
 * and survives a version of this app that wrote something else, so what comes
 * out of it is validated field by field rather than trusted — an unusable half
 * falls back to its default instead of taking the other half down with it.
 */
export function restore() {
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem(KEY) ?? "");
  } catch {
    return { ...DEFAULT };
  }
  if (stored === null || typeof stored !== "object") return { ...DEFAULT };
  const seconds = Number(stored.window);
  return {
    on: stored.on === true,
    window:
      Number.isInteger(seconds) && seconds >= MIN && seconds <= MAX
        ? seconds
        : DEFAULT.window,
  };
}

/** Remember it. Called on every change; two fields of JSON is not a cost. */
export function remember(state) {
  localStorage.setItem(KEY, JSON.stringify({ on: state.on, window: state.window }));
  return state;
}
