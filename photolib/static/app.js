"use strict";
// The grid client. No framework, no bundler, no dependency.
//
// Three functions carry the design and are deliberately pure over plain arrays:
// packRows, visibleRows and fetchPage. Everything stateful is DOM writing, and
// all of it happens inside #canvas. That is the seam: a later component layer
// owns the page chrome and mounts this, rather than this being rewritten.
//
// The one thing that makes the grid feel instant is that layout never waits for
// pixels. Every tile's box comes from file.width/height carried in the page
// JSON, so rows are placed before a single image is requested and nothing moves
// when one arrives.

const GAP = 4;
const TARGET_H = 220;   // rows close once they fall to this height
const MAX_H = 340;      // ...but the final ragged row must not become a billboard
const PREFETCH_PX = 1000;
const PAGE = 500;

const params = new URLSearchParams(location.search);
const KIND = params.get("kind") || "image";
const DEBUG = params.get("debug") === "1";

const canvas = document.getElementById("canvas");
const sentinel = document.getElementById("sentinel");
const statusEl = document.getElementById("status");
const debugEl = document.getElementById("debug");

const items = [];          // {id, s, w, h, th} in page order, never reordered
const rows = [];           // {top, height, from, to} — immutable once pushed
const mounted = new Map(); // item index -> element
const pool = [];           // detached tiles, reused

let packed = 0;      // items consumed into rows
let nextTop = 0;     // y of the next row to commit
let cursor = null;   // the envelope's `next`, passed straight back
let exhausted = false;
let inflight = false;
let width = 0;
let firstPaint = null;

// ---------------------------------------------------------------- layout

function aspect(item) {
  // Null dimensions only ever occur on rows that have no thumbnail either, so
  // this fallback never applies to a tile that shows an image.
  if (!item.w || !item.h || item.w <= 0 || item.h <= 0) return 1;
  return Math.min(Math.max(item.w / item.h, 0.2), 5);
}

// Greedy justified packing, append-only. A row is committed only once it is
// full — the trailing partial row waits for the next page — so rows[k] never
// changes after being pushed and nothing already on screen can move. That is
// the whole of "no layout shift"; there is no measuring step anywhere.
function packRows(source, from, avail, atEnd, emit) {
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

function pack(atEnd) {
  // A tab that loads while hidden reports clientWidth 0. Packing against that
  // produces one tile per row at a height of a few pixels, and nothing later
  // corrects it, so hold off until a width exists — the ResizeObserver below
  // is what delivers one.
  if (width <= 0) return;
  packed = packRows(items, packed, width, atEnd, (from, to, height) => {
    rows.push({ top: nextTop, height, from, to });
    nextTop += height + GAP;
  });
  // The total height grows as pages arrive. It is deliberately NOT estimated
  // from a row count and a mean height: that buys a stable scrollbar and pays
  // with a scroll mapping that corrects itself under the reader.
  canvas.style.height = nextTop + "px";
  sentinel.style.top = Math.max(0, nextTop - 1) + "px";
}

// First and last row index intersecting [top, bottom], by binary search.
function visibleRows(source, top, bottom) {
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

// ---------------------------------------------------------------- tiles

function acquire() {
  const tile = pool.pop();
  if (tile) return tile;
  const el = document.createElement("div");
  el.className = "tile";
  const img = document.createElement("img");
  img.decoding = "async";
  // No loading="lazy": it layers the browser's own viewport heuristic on top of
  // our windowing, and the two disagree at the edges.
  img.addEventListener("load", () => {
    el.classList.add("loaded");
    if (firstPaint === null) {
      firstPaint = performance.now();
      performance.mark("grid:first-paint");
    }
  });
  img.addEventListener("error", () => el.classList.add("missing"));
  el.appendChild(img);
  return el;
}

function release(index, el) {
  const img = el.firstChild;
  // Cancels an in-flight request. Without this, fast scrolling queues hundreds
  // of fetches for tiles nobody will see.
  img.removeAttribute("src");
  el.classList.remove("loaded", "missing", "error");
  el.style.backgroundImage = "";
  el.remove();
  mounted.delete(index);
  pool.push(el);
}

function mount(index, x, y, w, h) {
  let el = mounted.get(index);
  const item = items[index];
  if (!el) {
    el = acquire();
    el.dataset.id = String(item.id);
    placeholder(el, item);
    el.firstChild.src = "/t/" + item.s + ".webp";
    canvas.appendChild(el);
    mounted.set(index, el);
  }
  el.style.width = w + "px";
  el.style.height = h + "px";
  el.style.transform = "translate(" + x + "px," + y + "px)";
}

// The ThumbHash seam. `th` is null in every row today and becomes a base64
// string at step 9 — a key that gains a value, not a key that appears, so no
// contract changes and this is the only branch that has to exist.
function placeholder(el, item) {
  if (!item.th) return;
  if (item.url === undefined) item.url = thumbHashToDataURL(item.th);
  if (item.url) el.style.backgroundImage = "url(" + item.url + ")";
}

function placeRow(row) {
  let x = 0;
  for (let i = row.from; i < row.to; i++) {
    const last = i === row.to - 1;
    // The last tile takes the remainder, so a row is exactly `width` wide and
    // rounding never accumulates into a ragged right edge.
    const w = last ? width - x : Math.round(aspect(items[i]) * row.height);
    mount(i, x, row.top, w, row.height);
    x += w + GAP;
  }
}

function render() {
  const vh = window.innerHeight;
  // One screen above, one visible, one below.
  const span = visibleRows(rows, window.scrollY - vh, window.scrollY + vh * 2);
  if (!span) return;
  const lo = rows[span[0]].from;
  const hi = rows[span[1]].to;
  for (const [index, el] of Array.from(mounted)) {
    if (index < lo || index >= hi) release(index, el);
  }
  for (let r = span[0]; r <= span[1]; r++) placeRow(rows[r]);
  if (DEBUG) drawDebug(span);
}

// ---------------------------------------------------------------- paging

async function fetchPage(next) {
  const query = new URLSearchParams({ kind: KIND, limit: String(PAGE) });
  if (next) {
    query.set("before", next.before);
    query.set("before_id", String(next.before_id));
  }
  const response = await fetch("/api/photos?" + query.toString());
  if (!response.ok) throw new Error("/api/photos returned " + response.status);
  return response.json();
}

// True while the laid-out content ends within the prefetch margin of the
// viewport. One 500-row page does not always fill a tall window plus 1000px,
// and waiting for an intersection event that will never fire again stalls the
// grid one page short — permanently.
function needsMore() {
  // Without this guard an unpacked layout has nextTop 0 forever, and the fill
  // loop below would page the entire corpus into memory in one go.
  if (width <= 0) return false;
  return nextTop - (window.scrollY + window.innerHeight) < PREFETCH_PX;
}

async function loadNext() {
  if (inflight || exhausted) return;
  inflight = true;
  try {
    do {
      const body = await fetchPage(cursor);
      for (const photo of body.photos) items.push(photo);
      cursor = body.next;
      exhausted = cursor === null; // an explicit end, not len < limit
      pack(exhausted);
      render();
    } while (!exhausted && needsMore());
    if (exhausted) sentinel.remove();
  } catch (err) {
    fail(String(err));
  } finally {
    inflight = false;
  }
}

function fail(message) {
  statusEl.textContent = message;
  statusEl.hidden = false;
}

// ---------------------------------------------------------------- events

let frame = 0;
function onScroll() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    render();
    if (needsMore()) loadNext();
  });
}

// Repack everything at the new width, keeping the reader where they were.
// Re-running packRows over 146k items is a few milliseconds of float
// arithmetic; anchoring is what stops a resize feeling like a reset.
function reflow() {
  const measured = canvas.clientWidth;
  if (measured === width) return;
  const span = visibleRows(rows, window.scrollY, window.scrollY);
  const anchor = span ? rows[span[0]].from : 0;

  width = measured;
  for (const [index, el] of Array.from(mounted)) release(index, el);
  rows.length = 0;
  packed = 0;
  nextTop = 0;
  pack(exhausted);
  render();

  const target = rows.find((row) => row.to > anchor);
  if (target) window.scrollTo(0, target.top);
  if (needsMore()) loadNext();
}

// One delegated listener. Per-tile listeners and recycling are incompatible.
canvas.addEventListener("click", async (event) => {
  const tile = event.target.closest(".tile");
  if (!tile) return;
  try {
    const response = await fetch("/api/reveal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(tile.dataset.id) }),
    });
    if (!response.ok) throw new Error("reveal returned " + response.status);
  } catch (err) {
    tile.classList.add("error");
    setTimeout(() => tile.classList.remove("error"), 1500);
    fail(String(err));
  }
});

window.addEventListener("scroll", onScroll, { passive: true });

// A ResizeObserver on the mount element rather than a window resize listener:
// it also fires when the element gets its first real width, which a window
// resize event does not, and it sees the scrollbar appearing.
let reflowTimer = 0;
new ResizeObserver(() => {
  clearTimeout(reflowTimer);
  reflowTimer = setTimeout(reflow, 100);
}).observe(canvas);

new IntersectionObserver(
  (entries) => {
    if (entries.some((entry) => entry.isIntersecting)) loadNext();
  },
  { rootMargin: "0px 0px " + PREFETCH_PX + "px 0px" }
).observe(sentinel);

width = canvas.clientWidth;
loadNext();

// ---------------------------------------------------------------- debug

function drawDebug(span) {
  const lines = [
    window.innerWidth + "x" + window.innerHeight + "  content " + width,
    "items " + items.length + "  rows " + rows.length,
    "mounted " + mounted.size + "  pool " + pool.length,
    "rows " + span[0] + ".." + span[1] + "  height " + nextTop,
    "first paint " + (firstPaint === null ? "-" : firstPaint.toFixed(1) + "ms"),
  ];
  // The client has no unit tests — "no npm" rules out a JS runner — so the
  // layout invariants are asserted here instead, at runtime, on real data.
  for (let r = 1; r < rows.length; r++) {
    if (rows[r].top !== rows[r - 1].top + rows[r - 1].height + GAP) {
      lines.push("BROKEN: row " + r + " top");
      break;
    }
  }
  debugEl.textContent = lines.join("\n");
  debugEl.hidden = false;
}

// ---------------------------------------------------------------- thumbhash

// Decoder for the ThumbHash format (evanw/thumbhash). Step 9 is what starts
// populating `th`; until then this never runs. The DC path is verifiable by
// arithmetic against a hand-built hash; the AC path is not verifiable until
// real hashes exist, which is stated rather than implied.
function thumbHashToDataURL(base64) {
  try {
    const hash = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const header24 = hash[0] | (hash[1] << 8) | (hash[2] << 16);
    const header16 = hash[3] | (hash[4] << 8);
    const lDc = (header24 & 63) / 63;
    const pDc = ((header24 >> 6) & 63) / 31.5 - 1;
    const qDc = ((header24 >> 12) & 63) / 31.5 - 1;
    const lScale = ((header24 >> 18) & 31) / 31;
    const hasAlpha = header24 >> 23;
    const pScale = ((header16 >> 3) & 63) / 63;
    const qScale = ((header16 >> 9) & 63) / 63;
    const isLandscape = header16 >> 15;
    const lx = Math.max(3, isLandscape ? (hasAlpha ? 5 : 7) : header16 & 7);
    const ly = Math.max(3, isLandscape ? header16 & 7 : hasAlpha ? 5 : 7);

    let acStart = hasAlpha ? 6 : 5;
    let acIndex = 0;
    const channel = (nx, ny, scale) => {
      const ac = [];
      for (let cy = 0; cy < ny; cy++) {
        for (let cx = cy ? 0 : 1; cx * ny < nx * (ny - cy); cx++) {
          const nibble = (hash[acStart + (acIndex >> 1)] >> ((acIndex++ & 1) << 2)) & 15;
          ac.push((nibble / 7.5 - 1) * scale);
        }
      }
      return ac;
    };
    const lAc = channel(lx, ly, lScale);
    const pAc = channel(3, 3, pScale * 1.25);
    const qAc = channel(3, 3, qScale * 1.25);

    const ratio = lx / ly;
    const w = Math.max(1, Math.round(ratio > 1 ? 32 : 32 * ratio));
    const h = Math.max(1, Math.round(ratio > 1 ? 32 / ratio : 32));
    const canvasEl = document.createElement("canvas");
    canvasEl.width = w;
    canvasEl.height = h;
    const ctx = canvasEl.getContext("2d");
    const image = ctx.createImageData(w, h);
    const fx = [];
    const fy = [];
    for (let y = 0, i = 0; y < h; y++) {
      for (let x = 0; x < w; x++, i += 4) {
        let l = lDc;
        let p = pDc;
        let q = qDc;
        for (let cx = 0; cx < lx; cx++) fx[cx] = Math.cos((Math.PI / w) * (x + 0.5) * cx);
        for (let cy = 0; cy < ly; cy++) fy[cy] = Math.cos((Math.PI / h) * (y + 0.5) * cy);
        for (let cy = 0, j = 0; cy < ly; cy++) {
          for (let cx = cy ? 0 : 1; cx * ly < lx * (ly - cy); cx++, j++) {
            l += lAc[j] * fx[cx] * fy[cy] * 2;
          }
        }
        for (let cy = 0, j = 0; cy < 3; cy++) {
          for (let cx = cy ? 0 : 1; cx < 3 - cy; cx++, j++) {
            const f = fx[cx] * fy[cy] * 2;
            p += pAc[j] * f;
            q += qAc[j] * f;
          }
        }
        const b = l - (2 / 3) * p;
        const r = (3 * l - b + q) / 2;
        const g = r - q;
        image.data[i] = Math.max(0, Math.min(255, Math.round(255 * r)));
        image.data[i + 1] = Math.max(0, Math.min(255, Math.round(255 * g)));
        image.data[i + 2] = Math.max(0, Math.min(255, Math.round(255 * b)));
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    return canvasEl.toDataURL();
  } catch (err) {
    return null; // a malformed hash must never cost a tile
  }
}
