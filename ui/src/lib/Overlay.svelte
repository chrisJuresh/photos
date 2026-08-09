<script>
  // An opened tile: its frames over a blurred grid, each one a click away from
  // Explorer. So revealing a photograph in the grid takes two presses — the
  // tile, then the frame — whether the tile stood for fifty captures or one.
  //
  // This floats above the sheet and never touches it. The sheet's rows are
  // immutable once packed, and the whole of "opening a stack costs you your
  // place" would be re-packing them to make room — so nothing here is in the
  // sheet's flow, nothing here changes its width, and closing it puts the
  // reader back on the row they were reading.
  //
  // Frames are drawn from `/d/` — the 1536px substrate — and not from the 384px
  // thumbnail the tile behind it uses. The cover rule picks the sharpest frame
  // of the middle exposure third, and the whole reason to open a stack is to
  // disagree with it; a thumbnail cannot show you what you would be disagreeing
  // about.
  import { onMount } from "svelte";
  import { GAP, aspect } from "./layout.js";

  let { frames = [], origin = null, onreveal = () => {}, onclose = () => {} } = $props();

  // What the frames keep from the edges of the window. One number for all four:
  // the pane covers the header rather than clearing it, so there is no edge here
  // that is different from the others.
  const PAD = 40;

  // A tile that stood for one photograph opens as one frame, so the label has
  // to say that rather than "1 frames in this stack" — there is no stack.
  const label = $derived(
    frames.length === 1 ? "one photograph" : `${frames.length} frames in this stack`,
  );

  let width = $state(0);
  let height = $state(0);
  let pane = $state(null);
  // Which frames have their substrate. A new Set on each arrival rather than a
  // mutation: `$state` does not proxy a Set, so reassignment is what redraws.
  let loaded = $state(new Set());

  // The shortest row the bisection will settle for, and how many halvings it
  // takes. Four pixels because a row thinner than that is not a photograph any
  // more; twenty-five halvings of a window's height land inside a thousandth of
  // a pixel, which is past what a rounded box can show.
  const MIN_ROW = 4;
  const PASSES = 25;

  // Where a frame sits before the window has been measured. A box per frame at
  // all times rather than an empty list, so nothing downstream has to ask
  // whether this one has been laid out yet.
  const UNPLACED = { x: 0, y: 0, w: 0, h: 0 };

  const boxW = $derived(Math.max(0, width - PAD * 2));
  const boxH = $derived(Math.max(0, height - PAD * 2));
  const boxes = $derived(
    boxW > 0 && boxH > 0 ? pack(frames, boxW, boxH) : frames.map(() => UNPLACED),
  );

  // --- layout --------------------------------------------------------------
  //
  // Justified rows that fill a fixed box, which is the other half of the problem
  // `layout.js` solves. There the row height is settled and the sheet grows down
  // for as long as it has to; here the box is the window and the height is what
  // gives. They share `aspect` and the gap, and nothing else would be shared by
  // making one call the other.

  /** Where the rows break if they are packed at `h`, with each row's aspect sum. */
  function rowsAt(items, avail, h) {
    const rows = [];
    let from = 0;
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
      sum += aspect(items[i]);
      if (sum * h + GAP * (i - from) >= avail) {
        rows.push({ from, to: i + 1, sum });
        from = i + 1;
        sum = 0;
      }
    }
    if (from < items.length) rows.push({ from, to: items.length, sum });
    return rows;
  }

  // Every row justified to the full width, except a trailing partial one — which
  // keeps the height it was packed at instead of being stretched to fill a row
  // it does not have the frames for. Same instinct as `layout.MAX_H`.
  function heights(rows, avail, cap) {
    return rows.map((row, index) => {
      const h = (avail - GAP * (row.to - row.from - 1)) / row.sum;
      return index === rows.length - 1 && h > cap ? cap : h;
    });
  }

  function stackHeight(rows, avail, cap) {
    return (
      heights(rows, avail, cap).reduce((a, b) => a + b, 0) + GAP * (rows.length - 1)
    );
  }

  /**
   * The frames' boxes, largest that fit. Taller rows hold fewer frames and so
   * stack deeper, which makes the total height monotone in the packing height —
   * so this bisects for the tallest row that still fits rather than solving it.
   * Thirty passes over at most 51 frames, once per resize.
   */
  function pack(items, avail, limit) {
    let lo = MIN_ROW;
    let hi = Math.max(MIN_ROW, limit);
    for (let i = 0; i < PASSES; i++) {
      const mid = (lo + hi) / 2;
      if (stackHeight(rowsAt(items, avail, mid), avail, mid) <= limit) lo = mid;
      else hi = mid;
    }
    const rows = rowsAt(items, avail, lo);
    const tall = heights(rows, avail, lo);
    const out = [];
    let y = (limit - (tall.reduce((a, b) => a + b, 0) + GAP * (rows.length - 1))) / 2;
    rows.forEach((row, index) => {
      const h = tall[index];
      const widths = [];
      for (let i = row.from; i < row.to; i++) widths.push(aspect(items[i]) * h);
      const span = widths.reduce((a, b) => a + b, 0) + GAP * (widths.length - 1);
      let x = (avail - span) / 2;
      for (const w of widths) {
        out.push({ x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
        x += w + GAP;
      }
      y += h + GAP;
    });
    return out;
  }

  // Where a frame starts: the clicked tile's rect, as the offset and scale that
  // maps its final box back onto it. One `transform` off `transform-origin: 0 0`
  // rather than four animated lengths, so the flight is the compositor's work
  // and not the layout engine's.
  //
  // Handed to CSS as a custom property for a keyframe to start from, rather than
  // painted here and cleared a frame later. A transition needs two renders and
  // so needs a `requestAnimationFrame` between them, and rAF does not run in a
  // tab that is not compositing — which would leave the overlay stuck at the
  // tile's rect at opacity zero. An animation needs no second render, and it is
  // also what lets `prefers-reduced-motion` be answered in the stylesheet by the
  // reader's own setting instead of by a `matchMedia` read taken at open.
  function flight(box) {
    if (!origin || !box || !box.w || !box.h) return "none";
    const dx = origin.left - (PAD + box.x);
    const dy = origin.top - (PAD + box.y);
    return `translate(${dx}px, ${dy}px) scale(${origin.width / box.w}, ${origin.height / box.h})`;
  }

  // --- open and close ------------------------------------------------------

  function onkeydown(event) {
    if (event.key === "Escape") onclose();
  }

  // A click on anything that is not a frame closes it. `.frame` and not the
  // `.frames` box they sit in: that box is the whole pane bar its margin, so
  // testing it would leave every gap between and around the frames — most of
  // the surface for a stack of two — doing nothing.
  //
  // On `pointerdown` and not on `click`, for the reason the header's own
  // outside-click is: this component mounts during the `click` that opened it,
  // and a `click` listener added here would be handed that same event on its way
  // up to the window and shut immediately. The `pointerdown` that opened it has
  // already been and gone.
  function onpointerdown(event) {
    if (!event.target.closest(".frame")) onclose();
  }

  onMount(() => {
    const from = document.activeElement;
    pane?.focus();
    return () => {
      // Back where the reader was. `focus` and not `click`: restoring focus to
      // the tile must not re-open the stack it just closed.
      if (from instanceof HTMLElement && document.contains(from)) from.focus();
    };
  });
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} {onkeydown} {onpointerdown} />

<!-- The material the header is made of, without the refraction: `refract` draws
     a displacement map the size of its node, and at the size of the window that
     is a two-megapixel canvas and a PNG encode of it between the click and the
     first frame. app.css already has the refraction absent as a state this
     material ships in — outside Chromium it is always absent — so this is the
     same pane at the same blur, tint and saturation, with the one stage left off
     that a full-bleed surface has no rim to show anyway. -->
<div
  class="glass pane"
  bind:this={pane}
  role="dialog"
  aria-label={label}
  tabindex="-1"
>
  <div class="frames" style:inset="{PAD}px">
    {#each frames as frame, index (frame.id)}
      <button
        class="frame"
        type="button"
        title="Reveal this frame in Explorer"
        style:left="{boxes[index].x}px"
        style:top="{boxes[index].y}px"
        style:width="{boxes[index].w}px"
        style:height="{boxes[index].h}px"
        style:--flight={flight(boxes[index])}
        onclick={() => onreveal(frame)}
      >
        <img
          class:loaded={loaded.has(frame.id)}
          src="/d/{frame.s}.webp"
          alt=""
          decoding="async"
          onload={() => (loaded = new Set(loaded).add(frame.id))}
        />
      </button>
    {/each}
  </div>
</div>

<style>
  /* Fixed, so the sheet keeps its scroll position underneath and nothing here
     is in its flow. */
  /* The material at the panels' depth, not the bar's. `.glass` alone is the bar:
     a 2px blur and a tint tuned to be seen through, which is right for five
     words floating over a photograph and wrong for a surface whose whole job is
     to put the grid behind it out of the way. The panels already answer this —
     glass.js's `deepen()` and app.css's `--glass-tint-sheet` are one material at
     two depths — but the class that applies it is scoped to Header.svelte, so
     the deep half is declared here off the same custom properties. `/tune` still
     moves it, and there is still only one material.

     The refraction slots are left out rather than passed through: `refract` is
     what fills them, and it is not used here — see the pane's own comment. */
  .pane {
    position: fixed;
    inset: 0;
    z-index: 40;
    border-radius: 0;
    background-color: var(--glass-tint-sheet);
    backdrop-filter: blur(calc(var(--glass-blur, 2px) + 12px))
      saturate(var(--glass-saturate, 130%)) brightness(var(--glass-bright-sheet));
    animation: rise 200ms ease both;
  }

  @keyframes rise {
    from {
      opacity: 0;
    }
  }

  /* No rim on a full-bleed surface: the fresnel and the glare draw the edge of a
     floating pane, and this one has no edge that is not the window's. */
  .pane::before,
  .pane::after {
    content: none;
  }

  /* `inset` is written from `PAD`, which the frames' boxes are also measured
     against — one number, so the flight cannot land a frame off by a margin. */
  .frames {
    position: absolute;
  }

  .frame {
    position: absolute;
    padding: 0;
    border: none;
    background: none;
    border-radius: var(--r-1);
    overflow: hidden;
    cursor: pointer;
    transform-origin: 0 0;
    animation: emanate 260ms cubic-bezier(0.22, 0.7, 0.3, 1) both;
  }

  /* Out of the tile that was clicked and into place. `--flight` is that tile's
     rect expressed as this frame's own transform; the component writes it. */
  @keyframes emanate {
    from {
      transform: var(--flight, none);
    }
  }

  /* The cross-fade. The frames arrive where they belong and the pane's own
     `rise` is the whole of the movement, which is the point: nothing here
     travels across the window. */
  @media (prefers-reduced-motion: reduce) {
    .frame {
      animation: none;
    }
  }

  .frame:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .frame img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 160ms ease;
  }

  /* The substrate is a 1536px read and arrives after the flight does. Fading it
     in is what keeps an arriving frame from being an empty rectangle snapping
     to a photograph. */
  .frame img.loaded {
    opacity: 1;
  }
</style>
