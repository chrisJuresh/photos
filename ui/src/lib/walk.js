// Where an arrow lands when the overlay is open.
//
// The overlay steps tile to tile and never frame to frame: it already draws all
// of a tile's frames at once, so "next" is the next tile in the current sort
// whatever its stack size — the one meaning that holds on a stack of fifty and
// on a tile that stands alone. That leaves stepping as arithmetic over the two
// facts the sheet already reports: how many tiles it has read, and whether that
// is all of them. It lives here, apart from the DOM, so both ends of a view
// can be asserted without a browser.

/**
 * The tile an arrow lands on, or null at the true ends of the view.
 *
 * `at` is the tile the overlay is showing, `delta` -1 or 1, `loaded` how many
 * tiles the sheet has paged in, `exhausted` whether that is the whole answer.
 *
 * A step past the loaded end still lands: there is a tile there, it has only
 * not been read yet, and the sheet pages for it. What `exhausted` decides is
 * whether that is true — it is the difference between the last tile read and
 * the last tile there is.
 *
 * @param {number} at
 * @param {number} delta
 * @param {number} loaded
 * @param {boolean} exhausted
 * @returns {number | null}
 */
export function step(at, delta, loaded, exhausted) {
  const next = at + delta;
  if (next < 0) return null;
  if (next >= loaded && exhausted) return null;
  return next;
}
