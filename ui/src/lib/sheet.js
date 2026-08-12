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
//   sweepStart/sweepMove/sweepEnd          the marquee, while `setSweeping(true)`
//
// The packing and the recycling are step 6's, unchanged. Two things about the
// windowing are not, because step 6 was measured on a sheet the size of one
// screen and both only show up on a sheet the size of the library:
//
//   * the height is reserved for the whole answer, not grown page by page, so
//     the scrollbar stops being 1% of its final length — see `reserve`
//   * placeholders are decoded a frame after the images are requested, not on
//     the line before, so a fresh window's requests leave immediately — see
//     `drainPlaceholders`

import {
  DECK_H,
  DECK_MAX,
  ROW_GAP,
  TARGET_H,
  deck,
  packRows,
  rowBoxes,
  tilesIn,
  visibleRows,
} from "./layout.js";

// How much laid-out runway to keep ahead of the reader before asking for another
// page. One page is roughly 2,500px of rows, so this is about one page of slack.
// At reading speed that is enough never to arrive at the packed edge; a fling
// still outruns it, and outruns any figure that does not page the whole library.
const PREFETCH_PX = 2500;

// Viewports of tiles kept mounted around the fold. Ahead is where images are
// won: a tile mounted two screens down has its request in flight long before it
// is looked at, which is the difference between arriving at a loaded row and
// arriving at a grey one. Measured cold, a fresh window's thumbnails take ~220ms
// to arrive, of which ~110ms is queueing behind the six connections a browser
// gives one origin — so they have to start early, not fast.
const BEHIND = 1;
const AHEAD = 2;

// How far the pointer travels before a press is a drag rather than a click. A
// hand that means to select one tile still moves a pixel or two on the way down,
// and a marquee that fired on those would replace select mode's single click
// with a one-tile sweep that says the same thing less clearly.
const SWEEP_MIN = 4;

// Chrome clamps an element's height near 33.5M px and then disagrees with any
// layout computed past it. Triage's largest screen is 1.24M rows, which wants
// ~80M px, so the reservation below stops well short of the cliff: the bar is
// still the length of the track, it just stops being linear in the deep tail.
const MAX_CANVAS_PX = 30_000_000;

// A tile's inner elements, by the tile element that owns them: the photograph's
// box, the image in it, and the deck's cards. `acquire` is the only thing that
// creates them, and `mount`, `release` and `placeholder` are the only things
// that need them back. They used to be read as `el.firstChild`, which was true
// only because every `extend` so far appends behind the image; the first one to
// put an element in front of it would have had `release` clear the wrong node's
// src instead, on a path that fails silently. The references are held here so
// the order stops mattering.
const parts = new WeakMap();

/** The photograph's box inside a tile — what a click flies out of.
 *
 * A stacked tile's element is taller than its photograph, by the strip its deck
 * rises into, so its own rect starts above the image. Exported because the
 * overlay's flight has to start from the picture and not from the box around it,
 * and this file is the one that knows the difference. */
export function photoRect(tile) {
  return parts.get(tile).photo.getBoundingClientRect();
}

export function createSheet(canvas, sentinel, options) {
  const items = []; // page order, never reordered
  const rows = []; // {top, height, from, to} — immutable once pushed
  const mounted = new Map(); // item index -> element
  const pool = []; // detached tiles, reused
  const pending = []; // mounted, still owed a ThumbHash placeholder

  let packed = 0; // items consumed into rows
  // y of the next row to commit. It starts at DECK_H rather than at 0 so the
  // first row has the same room above it as every other one — the strip is left
  // uniformly or the rows are spaced raggedly, and ragged is the worse defect.
  let nextTop = DECK_H;
  let cursor = null; // the envelope's `next`, passed straight back
  let total = null; // rows the whole query has, or null while unknown
  // The tiles those rows stand for, or null when a row is already a tile —
  // which is every query except a stacked one. `total` is what the sheet
  // reserves height for and so has to be the number of rows it will hold; the
  // tiles they collapsed are what the count pane says instead of it while
  // stacking is on, and nothing here uses them for anything but reporting.
  let tiles = null;
  let exhausted = false;
  let inflight = false;
  let width = 0;
  let generation = 0; // bumped by reset(); stale pages are dropped
  let placeholderFrame = 0;
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
      nextTop += height + ROW_GAP;
    });
    stretch();
  }

  // Height for the rows the sheet has not paged in yet, so the scrollbar is the
  // length of the whole answer from the first page rather than growing under the
  // reader on every one of them.
  //
  // The earlier version reserved nothing, on the grounds that a stable bar is
  // bought with a scroll mapping that corrects itself. That trade only holds if
  // the estimate is a guess: here `total` is exact — counted from `photo` for the
  // grid, from the bucket surface for triage — so the only inexact part is the
  // mean row of what has not been read yet, and that converges after one page.
  // What is left is a bar that settles instead of one that grows 250 times.
  function reserve() {
    // Same guard as `pack`: with no width there is no row to average and no
    // sensible per-row occupancy, and guessing one asks for a 278M px canvas.
    if (total === null || exhausted || width <= 0 || packed >= total) return 0;
    const perRow = rows.length ? packed / rows.length : Math.max(1, width / TARGET_H);
    // `nextTop` carries the leading strip as well as the rows, so it is taken
    // back out before the mean: an estimate that counted it once per row would
    // reserve a page too much on a short answer.
    const rowHeight = rows.length
      ? (nextTop - DECK_H) / rows.length
      : TARGET_H + ROW_GAP;
    const wanted = Math.round(((total - packed) / perRow) * rowHeight);
    return Math.max(0, Math.min(wanted, MAX_CANVAS_PX - nextTop));
  }

  // The sentinel stays at the end of the *packed* rows, never at the end of the
  // reservation: it exists to say "real content is running out", and parking it
  // in reserved emptiness would stop it ever saying so.
  function stretch() {
    canvas.style.height = nextTop + reserve() + "px";
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
    // Focusable by script but not by Tab: the overlay closes onto whichever
    // tile the reader walked to, and the keyboard has to land somewhere real
    // for the arrow keys they were just using to keep meaning something. Not in
    // the tab order, because 150 mounted tiles in it would be a tab order
    // nobody could get past.
    el.tabIndex = -1;
    // The deck first, so it paints under everything, and its cards deepest
    // first, so each one is painted over by the wider card in front of it and
    // only its top sliver shows. `cards` is held the other way round — nearest
    // the photograph first — because that is the order `deck` returns.
    const strip = document.createElement("div");
    strip.className = "deck";
    strip.style.height = DECK_H + "px";
    const cards = [];
    for (let i = 0; i < DECK_MAX; i++) {
      const card = document.createElement("div");
      card.className = "card";
      card.hidden = true;
      cards.push(card);
    }
    for (let i = cards.length - 1; i >= 0; i--) strip.appendChild(cards[i]);
    el.appendChild(strip);
    // The photograph's own box, so that a tile whose element is taller than its
    // picture still frames the picture — and the ThumbHash behind it — exactly
    // where an unstacked tile in the same row frames its own.
    const photo = document.createElement("div");
    photo.className = "tile-photo";
    const img = document.createElement("img");
    img.decoding = "async";
    // Otherwise a press on a photograph starts the browser's own image drag,
    // which swallows the pointer stream a marquee is drawn from.
    img.draggable = false;
    // No loading="lazy": it layers the browser's own viewport heuristic on top
    // of our windowing, and the two disagree at the edges.
    img.addEventListener("load", () => el.classList.add("loaded"));
    img.addEventListener("error", () => el.classList.add("missing"));
    photo.appendChild(img);
    el.appendChild(photo);
    // `above` is written by the first `bindDeck`, which always runs before the
    // element is positioned.
    parts.set(el, { img, photo, strip, cards, above: 0 });
    if (options.extend) options.extend(el);
    return el;
  }

  function release(index, el) {
    const { img, photo } = parts.get(el);
    // Cancels an in-flight request. Without this, fast scrolling queues hundreds
    // of fetches for tiles nobody will see.
    img.removeAttribute("src");
    el.classList.remove("loaded", "missing", "error");
    photo.style.backgroundImage = "";
    el.remove();
    mounted.delete(index);
    pool.push(el);
  }

  // Bind the pooled cards to this item, and record how tall the element stands
  // above its photograph — nothing for a tile that stands for one frame, which
  // is every tile with stacking off. `deck` decides both, so the element's
  // height and its card count cannot disagree about whether there is a stack.
  //
  // Every card is written on every bind — one the deck does not reach is hidden
  // rather than left as it was — so recycling a tile from a stack of forty onto
  // one of two, or onto none, leaves nothing behind.
  function bindDeck(el, item, w) {
    const bits = parts.get(el);
    const spec = deck(item.n, w);
    bits.above = spec.length ? DECK_H : 0;
    bits.strip.hidden = spec.length === 0;
    for (let i = 0; i < bits.cards.length; i++) {
      const card = spec[i];
      bits.cards[i].hidden = card === undefined;
      if (card === undefined) continue;
      bits.cards[i].style.top = card.top + "px";
      bits.cards[i].style.left = card.inset + "px";
      bits.cards[i].style.right = card.inset + "px";
      bits.cards[i].style.opacity = String(card.opacity);
    }
  }

  function mount(index, x, y, w, h, urgent) {
    let el = mounted.get(index);
    const item = items[index];
    if (!el) {
      el = acquire();
      el.dataset.index = String(index);
      const img = parts.get(el).img;
      bindDeck(el, item, w);
      // Before the src, because the hint is read when the request is created and
      // ignored afterwards — which also means it only ever decides the order
      // *within* a freshly built window: a reset, a screen change, a first paint,
      // where 23 visible tiles and 57 prefetched ones are queued in one go and
      // have to share six connections. During steady scrolling every tile enters
      // through the prefetch band and they are all "low", which is the same
      // ordering they would have had anyway.
      img.fetchPriority = urgent ? "high" : "low";
      img.src = "/t/" + item.s + ".webp";
      // The placeholder is deliberately not decoded here. See drainPlaceholders.
      pending.push(index);
      if (options.fill) options.fill(el, item);
      canvas.appendChild(el);
      mounted.set(index, el);
    }
    // The element grows upward by the strip and the photograph does not move:
    // `y` is the row's top and stays the photograph's top, stacked or not, so
    // every photograph in a row shares its top edge and its bottom one.
    const { above, photo } = parts.get(el);
    el.style.width = w + "px";
    el.style.height = h + above + "px";
    el.style.transform = "translate(" + x + "px," + (y - above) + "px)";
    photo.style.height = h + "px";
  }

  function placeholder(el, item) {
    if (!item.th) return;
    if (item.url === undefined) item.url = options.thumbHash(item.th);
    if (item.url) parts.get(el).photo.style.backgroundImage = "url(" + item.url + ")";
  }

  // Decoding one ThumbHash is ~1.1 ms of canvas work — ~130 ms for a screenful —
  // and it used to run inside `mount`, on the line above the `img.src`. So every
  // request in a fresh window started a tenth of a second late, waiting on
  // placeholders for tiles whose images had not been asked for yet.
  //
  // Held to the next frame instead. That is late enough for a warm cache to have
  // fired `load` already, which is what makes the skip below worth having: on a
  // revisited region the decode is not deferred, it is not done at all.
  function drainPlaceholders() {
    placeholderFrame = 0;
    for (const index of pending) {
      const el = mounted.get(index);
      // Released while it waited, or the real image got there first.
      if (el && !el.classList.contains("loaded")) placeholder(el, items[index]);
    }
    pending.length = 0;
  }

  function placeRow(row, urgent) {
    for (const box of rowBoxes(row, items, width)) {
      mount(box.index, box.x, row.top, box.w, row.height, urgent);
    }
  }

  function render() {
    const vh = window.innerHeight;
    const top = origin();
    const span = visibleRows(rows, top - vh * BEHIND, top + vh * (1 + AHEAD));
    if (!span) return;
    const lo = rows[span[0]].from;
    const hi = rows[span[1]].to;
    for (const [index, el] of Array.from(mounted)) {
      if (index < lo || index >= hi) release(index, el);
    }
    for (let r = span[0]; r <= span[1]; r++) {
      const row = rows[r];
      placeRow(row, row.top < top + vh && row.top + row.height > top);
    }
    if (pending.length && !placeholderFrame) {
      placeholderFrame = requestAnimationFrame(drainPlaceholders);
    }
  }

  // ------------------------------------------------------------- paging

  // True while the laid-out content ends within the prefetch margin of the
  // viewport. One 500-row page does not always fill a tall window plus 1000px,
  // and waiting for an intersection event that will never fire again stalls the
  // sheet one page short — permanently.
  function needsMore() {
    // Without this guard an unpacked layout keeps its empty nextTop forever, and
    // the fill loop below would page the entire corpus into memory in one go.
    if (width <= 0) return false;
    return nextTop - (origin() + window.innerHeight) < PREFETCH_PX;
  }

  // The read that is running, kept so it can be waited on. `walkTo` steps past
  // the end of what has been paged in and has to wait for the page that brings
  // the tile it wants; a `loadNext` that returns at once while a page is already
  // in flight cannot be awaited in a loop without spinning. So the guard and the
  // reading are separate, and the guard hands back the promise of the read that
  // is already going.
  let reading = Promise.resolve();

  function loadNext() {
    if (inflight || exhausted) return reading;
    inflight = true;
    reading = readPages();
    return reading;
  }

  async function readPages() {
    const mine = generation;
    onState({ loading: true, count: items.length, exhausted, total, tiles });
    try {
      do {
        const body = await options.fetchPage(cursor);
        // A reset landed while this was in flight. Its rows belong to a
        // predicate nobody is looking at any more.
        if (mine !== generation) return;
        for (const photo of body.photos) items.push(photo);
        cursor = body.next;
        exhausted = cursor === null; // an explicit end, not len < limit
        // `/api/photos` carries it; `/api/triage/page` does not, because there it
        // costs 220 ms and the same number arrives free with the counts — see
        // `setTotal`. So this is "if this endpoint knows", not "if it is set".
        // A stacked page's rows are covers, so `stacks` is the one that sizes
        // this sheet and `total` becomes the tiles behind it. The key is
        // absent with stacking off, which is what keeps the unstacked path the
        // path it has always been.
        if (typeof body.stacks === "number") {
          total = body.stacks;
          tiles = typeof body.total === "number" ? body.total : null;
        } else if (typeof body.total === "number") {
          total = body.total;
        }
        pack(exhausted);
        render();
        onState({ loading: true, count: items.length, exhausted, total, tiles });
      } while (!exhausted && needsMore());
    } catch (err) {
      if (mine === generation) onState({ error: String(err) });
    } finally {
      if (mine === generation) {
        inflight = false;
        onState({ loading: false, count: items.length, exhausted, total, tiles });
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
      // A drag held still while the wheel scrolls is still growing its box: the
      // anchor is a point on the sheet and the sheet has moved under the hand.
      if (drag) trackSweep();
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
    nextTop = DECK_H;
    pack(exhausted);
    render();

    const target = rows.find((row) => row.to > anchor);
    if (target) window.scrollTo(0, target.top + canvas.offsetTop);
    if (needsMore()) loadNext();
  }

  // ------------------------------------------------------------- the marquee

  // A press on the canvas rubber-bands a box over the tiles it crosses. It lives
  // here rather than above the sheet because this file holds `rows`, `items` and
  // `width`, which is the whole of the geometry the box is tested against.
  // Nothing here knows what being selected is — the seams hand up the tiles the
  // box covers and the caller decides what to do about them.
  //
  // Coordinates are the canvas's own throughout, so a wheel-scroll mid-drag
  // extends the box over content rather than dragging it over the window: the
  // anchor is a point on the sheet, and the sheet is what moves. That is also
  // what lets a drag reach tiles that were never mounted, which is most of them.
  let sweeping = false;
  let drag = null; // {ax, ay, cx, cy, index, live} or null
  let sweepFrame = 0;
  let band = null;
  // A finished drag leaves a click behind it, on whichever element the press and
  // the release have in common. It selects nothing, and it is the one click
  // select mode must not act on.
  let sweptClick = false;

  // The pointer, in canvas coordinates. Read per event rather than cached: the
  // canvas moves under a scroll, and the drag is meant to notice.
  function pointAt(clientX, clientY) {
    const box = canvas.getBoundingClientRect();
    return { x: clientX - box.left, y: clientY - box.top };
  }

  function drawBand(rect) {
    if (!band) {
      band = document.createElement("div");
      band.className = "marquee";
      canvas.appendChild(band);
    }
    band.hidden = false;
    band.style.width = rect.right - rect.left + "px";
    band.style.height = rect.bottom - rect.top + "px";
    band.style.transform = "translate(" + rect.left + "px," + rect.top + "px)";
  }

  // The box as it now stands, and what it covers. Called from a frame rather
  // than from the pointer event, and from the scroll handler as well, so a drag
  // held still over a scrolling sheet keeps up.
  function trackSweep() {
    if (!drag) return;
    const { x, y } = pointAt(drag.cx, drag.cy);
    if (!drag.live) {
      if (Math.abs(x - drag.ax) < SWEEP_MIN && Math.abs(y - drag.ay) < SWEEP_MIN) return;
      drag.live = true;
      options.sweepStart(drag.index === null ? null : items[drag.index], drag.index);
    }
    const rect = {
      left: Math.min(drag.ax, x),
      right: Math.max(drag.ax, x),
      top: Math.min(drag.ay, y),
      bottom: Math.max(drag.ay, y),
    };
    drawBand(rect);
    options.sweepMove(tilesIn(rows, items, width, rect).map((index) => items[index]));
  }

  function onPointerDown(event) {
    sweptClick = false;
    // Shift is the other gesture: it extends from the last tile touched, and a
    // press that could be either would have to guess which.
    if (!sweeping || event.button !== 0 || event.shiftKey) return;
    const { x, y } = pointAt(event.clientX, event.clientY);
    // The tile under the pointer decides the whole drag, and it is asked for
    // the same way every other tile in the box will be — not off the DOM, so a
    // press on empty canvas below the rows is one answer rather than a missing
    // element handled somewhere else.
    const under = tilesIn(rows, items, width, { left: x, top: y, right: x, bottom: y });
    drag = {
      ax: x,
      ay: y,
      cx: event.clientX,
      cy: event.clientY,
      index: under.length ? under[0] : null,
      live: false,
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  function onPointerMove(event) {
    if (!drag) return;
    drag.cx = event.clientX;
    drag.cy = event.clientY;
    if (sweepFrame) return;
    sweepFrame = requestAnimationFrame(() => {
      sweepFrame = 0;
      trackSweep();
    });
  }

  function onPointerUp(event) {
    if (!drag) return;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
    cancelAnimationFrame(sweepFrame);
    sweepFrame = 0;
    // The last move may still be waiting on a frame, and the release is itself a
    // position: the box commits where the reader let go, not where the last
    // frame happened to catch it.
    drag.cx = event.clientX;
    drag.cy = event.clientY;
    trackSweep();
    const live = drag.live;
    drag = null;
    if (band) band.hidden = true;
    if (!live) return;
    sweptClick = true;
    options.sweepEnd();
  }

  canvas.addEventListener("pointerdown", onPointerDown);

  // One delegated listener. Per-tile listeners and recycling are incompatible.
  function onClick(event) {
    if (sweptClick) {
      sweptClick = false;
      return;
    }
    const tile = event.target.closest(".tile");
    if (!tile || !canvas.contains(tile)) return;
    const index = Number(tile.dataset.index);
    const item = items[index];
    if (item && options.activate) options.activate(item, event, tile, index);
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
      pending.length = 0;
      packed = 0;
      nextTop = DECK_H;
      cursor = null;
      // A new predicate is a new answer and therefore a new size. Keeping the
      // old one would reserve the previous screen's height for this one.
      total = null;
      tiles = null;
      exhausted = false;
      canvas.style.height = "0px";
      window.scrollTo(0, 0);
      loadNext();
    },
    // The size of the whole answer, for the endpoints that do not carry it in
    // the page envelope. Triage's is a by-product of the counts the rule bar
    // already asks for, so it arrives beside the first page rather than in
    // front of it — a second query would put 220 ms before the first paint.
    setTotal(value) {
      const next = typeof value === "number" ? value : null;
      if (next === total) return;
      total = next;
      stretch();
      onState({ total });
    },
    // Re-bind every mounted tile. For a change to state the tiles *display* but
    // do not own — the saved rule set — which `fill` would otherwise not be
    // asked about again until each tile happened to be recycled back into view.
    refill() {
      if (!options.fill) return;
      for (const [index, el] of mounted) options.fill(el, items[index]);
    },
    // Walk to one tile: read pages until it has a box, scroll the sheet so it
    // sits in the middle of the window, mount it, and hand back the item with
    // the element it was mounted into.
    //
    // Not `reveal`: that word is taken, and it means Explorer everywhere else in
    // this codebase. The overlay steps with this, and stepping *is* this scroll:
    // the tile the pane is drawing is the tile behind the pane, so the flight
    // has a real rect to leave from on every step rather than only on the first,
    // running off the loaded end pages the same way scrolling always has, and
    // closing the overlay leaves the reader where the walk ended.
    //
    // `packed` and not `items.length`, because a trailing partial row is held
    // back until the page after it — an item can be read and still have no box.
    async walkTo(index) {
      while (index >= packed && !exhausted) {
        const before = packed;
        await loadNext();
        if (packed === before) break;
      }
      const row = rows.find((one) => one.to > index);
      if (!row) return null;
      const middle = Math.max(0, (window.innerHeight - row.height) / 2);
      window.scrollTo(0, Math.max(0, canvas.offsetTop + row.top - middle));
      render();
      const el = mounted.get(index);
      return el ? { item: items[index], tile: el } : null;
    },
    // Put the keyboard back on a tile. The overlay hands focus back on the way
    // out, and after a walk that is a different tile from the one it opened on.
    focus(index) {
      mounted.get(index)?.focus();
    },
    // Whether a press on the canvas rubber-bands. Select mode turns on and off
    // under a sheet that outlives the toggle, exactly as the tickboxes do.
    setSweeping(value) {
      sweeping = value;
    },
    // The items between two indices, inclusive, in the order the sheet holds
    // them — which is the order the grid is sorted in. Shift-click's range: the
    // gesture knows two tiles and this is what lies between them.
    itemsBetween(a, b) {
      return items.slice(Math.min(a, b), Math.max(a, b) + 1);
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
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("scroll", onScroll);
      resize.disconnect();
      intersect.disconnect();
      clearTimeout(reflowTimer);
      cancelAnimationFrame(placeholderFrame);
      cancelAnimationFrame(sweepFrame);
      band?.remove();
    },
  };
}
