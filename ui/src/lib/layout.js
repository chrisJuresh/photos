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
