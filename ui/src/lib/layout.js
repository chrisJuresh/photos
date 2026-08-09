// Justified-row layout. Pure functions over plain arrays, moved unchanged from
// the step 6 grid client -- they are the part of it that was measured, and
// nothing about triage gives a reason to touch them.
//
// The one thing that makes the sheet feel instant is that layout never waits
// for pixels. Every tile's box comes from width/height carried in the page
// JSON, so rows are placed before a single image is requested and nothing moves
// when one arrives.

export const GAP = 4;
export const TARGET_H = 220; // rows close once they fall to this height
export const MAX_H = 340; // ...but the final ragged row must not become a billboard

// The strip a stacked tile draws its card edges in, above its photograph. It is
// a constant: a deck that grew with the stack would make a fifty-frame set
// absurd, and — more importantly — the row's tiles share a box height, so the
// band cannot be given to the stacked ones alone. See
// `docs/adr/0002-decks-rise-into-the-row-gap.md`.
export const DECK_H = 12;

// Between rows, so there is room for the strip above every one of them. The gap
// *within* a row is `GAP`, unchanged: a deck rises, it does not spread. Splitting
// the one constant into two is what buys the alignment, at the cost of a few
// percent of vertical density.
export const ROW_GAP = GAP + DECK_H;

// Card edges, at most. Past a handful of frames the only true statement a tile
// can make is "many", and six edges say it.
export const DECK_MAX = 6;
const DECK_STEP = 5; // horizontal taper per card, px...
const DECK_TAPER = 0.025; // ...capped at this fraction of the tile's width
const DECK_FADE = 9; // per card, in percent of opacity

export function aspect(item) {
  // Null dimensions are the common case in triage, not the rare one: 641,764
  // files have never had their bytes read. A square box is the honest default
  // and it is also what the grid used for the tiles that have no thumbnail.
  if (!item.w || !item.h || item.w <= 0 || item.h <= 0) return 1;
  return Math.min(Math.max(item.w / item.h, 0.2), 5);
}

// Greedy justified packing, append-only. A row is committed only once it is
// full — the trailing partial row waits for the next page — so rows[k] never
// changes after being pushed and nothing already on screen can move. That is
// the whole of "no layout shift"; there is no measuring step anywhere.
export function packRows(source, from, avail, atEnd, emit) {
  let start = from;
  while (start < source.length) {
    let end = start;
    let sum = 0;
    let height = Infinity;
    while (end < source.length) {
      sum += aspect(source[end]);
      end++;
      height = (avail - GAP * (end - start - 1)) / sum;
      if (height <= TARGET_H) break;
    }
    if (height > TARGET_H && !atEnd) break; // incomplete: hold it back
    emit(start, end, Math.round(Math.min(height, MAX_H)));
    start = end;
  }
  return start;
}

// The other half of `packRows`. That one solves the row equation for the height
// every tile shares; this one solves it for each tile's width and walks the row
// left to right accumulating the gaps. Together they are one equation, and it
// lives here rather than in the renderer so that anything needing to know where
// a tile is drawn -- a hit-test against tiles that are not mounted, say -- gets
// the same answer the renderer got, by construction rather than by agreement.
//
// Plain data in, plain data out: `row` is one of the {top, height, from, to}
// records `packRows` emitted, `items` the array it packed, `avail` the canvas
// width it was packed against. Returns one {index, x, w} per tile in the row.
//
// (`Overlay.svelte` packs the fanned-out sheet with a third solution of the same
// relation -- fixed box, height gives -- which is the dual problem and stays
// where it is.)
export function rowBoxes(row, items, avail) {
  const boxes = [];
  let x = 0;
  for (let i = row.from; i < row.to; i++) {
    // The last tile takes the remainder, so a row is exactly `avail` wide and
    // rounding never accumulates into a ragged right edge.
    const last = i === row.to - 1;
    const w = last ? avail - x : Math.round(aspect(items[i]) * row.height);
    boxes.push({ index: i, x, w });
    x += w + GAP;
  }
  return boxes;
}

// The card edges a tile draws when it stands for a stack of `size` frames, at
// `width` pixels wide. Front to back: card 0 is the one nearest the photograph.
//
// `top` is measured down from the top of the strip and `inset` in from both of
// the tile's sides, so a card is the box `[inset, top]` to `[width - inset,
// DECK_H]` — every card reaching the photograph's top edge, nested, painted back
// to front, and only its topmost sliver visible. The strip is `DECK_H` at every
// size; a deeper stack packs more, thinner, tighter-spaced edges into it, which
// is what a thick deck actually looks like edge-on.
//
// `size` is the page's `n`, which is absent with stacking off — undefined is a
// stack of one by another name, and draws nothing.
export function deck(size, width) {
  const count = Math.min((size | 0) - 1, DECK_MAX);
  if (count < 1) return [];
  // Capped from both sides: `DECK_STEP` keeps a 1440px last-row tile from
  // splaying, the fraction keeps a narrow portrait tile from becoming a wedge.
  const step = Math.min(DECK_STEP, width * DECK_TAPER);
  const cards = [];
  for (let i = 1; i <= count; i++) {
    cards.push({
      top: Math.round((DECK_H * (count - i)) / count),
      inset: Math.round(i * step),
      // Integer percent, so the value lands on the decimal it reads as rather
      // than on whatever a chain of float multiplies leaves behind.
      opacity: (100 - (i - 1) * DECK_FADE) / 100,
    });
  }
  return cards;
}

// Which tiles a rubber-band box covers, as indices into `items`, in the order
// the grid is sorted in.
//
// The marquee cannot ask the DOM: about three viewports of tiles are mounted at
// a time and the rest are pooled away, so an element hit-test would answer for a
// fraction of what the box crosses. It asks the geometry instead — the committed
// rows, the items they packed, and the canvas width they were packed against —
// through the same `rowBoxes` walk the renderer places tiles with, which is what
// makes the box and the picture agree by construction.
//
// `rect` is {left, top, right, bottom} in canvas coordinates, already the right
// way round; the drag is what knows which of its two corners came first. Both
// ends are inclusive, because the reader cannot see which pixel they pressed.
//
// A tile is its photograph here, not its element: a stacked one stands `DECK_H`
// taller, into the row gap above it, and a box drawn in that gap is a box over
// the space between two rows in every other respect. Sweeping the deck would
// make the gap catch tiles for stacked rows and not for unstacked ones, which
// is a rule nobody could see.
//
// The row span comes from the same binary search the renderer windows with, so
// this is O(log rows + tiles in the box) rather than a walk of a sheet that
// reaches 686,351 entries. `visibleRows` clamps its answer into the array rather
// than reporting an empty span, so each end is checked against its own row here:
// a box dragged into the reserved height below the last packed row is over
// nothing, and clamping alone would call that the last row.
export function tilesIn(rows, items, avail, rect) {
  const span = visibleRows(rows, rect.top, rect.bottom);
  if (!span) return [];
  const hits = [];
  for (let r = span[0]; r <= span[1]; r++) {
    const row = rows[r];
    if (row.top > rect.bottom || row.top + row.height < rect.top) continue;
    for (const box of rowBoxes(row, items, avail)) {
      if (box.x <= rect.right && box.x + box.w >= rect.left) hits.push(box.index);
    }
  }
  return hits;
}

// First and last row index intersecting [top, bottom], by binary search.
export function visibleRows(source, top, bottom) {
  if (!source.length) return null;
  let lo = 0;
  let hi = source.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (source[mid].top + source[mid].height < top) lo = mid + 1;
    else hi = mid;
  }
  const first = lo;
  hi = source.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (source[mid].top <= bottom) lo = mid;
    else hi = mid - 1;
  }
  return [first, Math.max(first, lo)];
}
