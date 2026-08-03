// The virtualised contact sheet: the step 6 grid client's imperative core, with
// three things turned into parameters instead of being hardcoded to /api/photos.
//
// This is deliberately NOT a Svelte component. The hot path is a scroll event
// mutating transforms on ~150 recycled tiles, which framework diffing only adds
// to, and the item array reaches 686,351 entries in triage's screen 7. Svelte
// owns the chrome around it; this owns everything inside one element.
//
// The three seams:
//
//   fetchPage(cursor)  -> {photos, next}   which endpoint, which order
//   extend(el)                             called once per element ever created
//   fill(el, item)                         called when an item is bound to one
//   activate(item, event)                  a click that was not handled by fill's
//                                          own controls
//
// Everything else — the packing, the windowing, the recycling, the prefetch —
// is the code step 6 measured, unchanged.

import { GAP, aspect, packRows, visibleRows } from "./layout.js";

const PREFETCH_PX = 1000;

export function createSheet(canvas, sentinel, options) {
  const items = []; // page order, never reordered
  const rows = []; // {top, height, from, to} — immutable once pushed
  const mounted = new Map(); // item index -> element
  const pool = []; // detached tiles, reused

  let packed = 0; // items consumed into rows
  let nextTop = 0; // y of the next row to commit
  let cursor = null; // the envelope's `next`, passed straight back
  let exhausted = false;
  let inflight = false;
  let width = 0;
  let generation = 0; // bumped by reset(); stale pages are dropped
  let onState = options.onState || (() => {});

  // ------------------------------------------------------------- layout

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

  // Where the canvas starts on the page. Step 6's canvas was the whole page, so
  // this was 0 and the arithmetic could ignore it; triage puts a sticky rule bar
  // above the sheet, and without the offset the window would be one bar-height
  // out at every scroll position.
  function origin() {
    return window.scrollY - canvas.offsetTop;
  }

  // ------------------------------------------------------------- tiles

  function acquire() {
    const tile = pool.pop();
    if (tile) return tile;
    const el = document.createElement("div");
    el.className = "tile";
    const img = document.createElement("img");
    img.decoding = "async";
    // No loading="lazy": it layers the browser's own viewport heuristic on top
    // of our windowing, and the two disagree at the edges.
    img.addEventListener("load", () => el.classList.add("loaded"));
    img.addEventListener("error", () => el.classList.add("missing"));
    el.appendChild(img);
    if (options.extend) options.extend(el);
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
      el.dataset.index = String(index);
      placeholder(el, item);
      el.firstChild.src = "/t/" + item.s + ".webp";
      if (options.fill) options.fill(el, item);
      canvas.appendChild(el);
      mounted.set(index, el);
    }
    el.style.width = w + "px";
    el.style.height = h + "px";
    el.style.transform = "translate(" + x + "px," + y + "px)";
  }

  function placeholder(el, item) {
    if (!item.th) return;
    if (item.url === undefined) item.url = options.thumbHash(item.th);
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
    const top = origin();
    const span = visibleRows(rows, top - vh, top + vh * 2);
    if (!span) return;
    const lo = rows[span[0]].from;
    const hi = rows[span[1]].to;
    for (const [index, el] of Array.from(mounted)) {
      if (index < lo || index >= hi) release(index, el);
    }
    for (let r = span[0]; r <= span[1]; r++) placeRow(rows[r]);
  }

  // ------------------------------------------------------------- paging

  // True while the laid-out content ends within the prefetch margin of the
  // viewport. One 500-row page does not always fill a tall window plus 1000px,
  // and waiting for an intersection event that will never fire again stalls the
  // sheet one page short — permanently.
  function needsMore() {
    // Without this guard an unpacked layout has nextTop 0 forever, and the fill
    // loop below would page the entire corpus into memory in one go.
    if (width <= 0) return false;
    return nextTop - (origin() + window.innerHeight) < PREFETCH_PX;
  }

  async function loadNext() {
    if (inflight || exhausted) return;
    inflight = true;
    const mine = generation;
    onState({ loading: true, count: items.length, exhausted });
    try {
      do {
        const body = await options.fetchPage(cursor);
        // A reset landed while this was in flight. Its rows belong to a
        // predicate nobody is looking at any more.
        if (mine !== generation) return;
        for (const photo of body.photos) items.push(photo);
        cursor = body.next;
        exhausted = cursor === null; // an explicit end, not len < limit
        pack(exhausted);
        render();
        onState({ loading: true, count: items.length, exhausted });
      } while (!exhausted && needsMore());
    } catch (err) {
      if (mine === generation) onState({ error: String(err) });
    } finally {
      if (mine === generation) {
        inflight = false;
        onState({ loading: false, count: items.length, exhausted });
      }
    }
  }

  // ------------------------------------------------------------- events

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
  // Re-running packRows over the item array is a few milliseconds of float
  // arithmetic; anchoring is what stops a resize feeling like a reset.
  function reflow() {
    const measured = canvas.clientWidth;
    if (measured === width) return;
    const span = visibleRows(rows, origin(), origin());
    const anchor = span ? rows[span[0]].from : 0;

    width = measured;
    for (const [index, el] of Array.from(mounted)) release(index, el);
    rows.length = 0;
    packed = 0;
    nextTop = 0;
    pack(exhausted);
    render();

    const target = rows.find((row) => row.to > anchor);
    if (target) window.scrollTo(0, target.top + canvas.offsetTop);
    if (needsMore()) loadNext();
  }

  // One delegated listener. Per-tile listeners and recycling are incompatible.
  function onClick(event) {
    const tile = event.target.closest(".tile");
    if (!tile || !canvas.contains(tile)) return;
    const item = items[Number(tile.dataset.index)];
    if (item && options.activate) options.activate(item, event, tile);
  }

  canvas.addEventListener("click", onClick);
  window.addEventListener("scroll", onScroll, { passive: true });

  // A ResizeObserver on the mount element rather than a window resize listener:
  // it also fires when the element gets its first real width, which a window
  // resize event does not, and it sees the scrollbar appearing.
  let reflowTimer = 0;
  const resize = new ResizeObserver(() => {
    clearTimeout(reflowTimer);
    reflowTimer = setTimeout(reflow, 100);
  });
  resize.observe(canvas);

  const intersect = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadNext();
    },
    { rootMargin: "0px 0px " + PREFETCH_PX + "px 0px" },
  );
  intersect.observe(sentinel);

  width = canvas.clientWidth;
  loadNext();

  return {
    // Start over on a new predicate. The generation bump is what makes an
    // in-flight page from the previous one land nowhere.
    reset() {
      generation++;
      inflight = false;
      for (const [index, el] of Array.from(mounted)) release(index, el);
      items.length = 0;
      rows.length = 0;
      packed = 0;
      nextTop = 0;
      cursor = null;
      exhausted = false;
      canvas.style.height = "0px";
      window.scrollTo(0, 0);
      loadNext();
    },
    // Re-bind one already-mounted item, for an override toggle that changed it.
    refresh(item) {
      for (const [index, el] of mounted) {
        if (items[index] === item && options.fill) options.fill(el, item);
      }
    },
    destroy() {
      generation++;
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      resize.disconnect();
      intersect.disconnect();
      clearTimeout(reflowTimer);
    },
  };
}
