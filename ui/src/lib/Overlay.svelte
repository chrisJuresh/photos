<script>
  // An opened tile: its frames over a blurred grid, each one a click away from
  // Explorer. So revealing a photograph in the grid takes two presses — the
  // tile, then the frame — whether the tile stood for fifty captures or one.
  //
  // The reader walks the selection from in here rather than closing to move on:
  // a puck at each edge and the arrow keys ask to step to the adjacent tile,
  // whatever its stack size. Asking is all they do — `onstep(delta, held)`, the
  // second of which is only true of a key being held down. App owns the walk:
  // which tile that is, whether there is one, and how fast a held key may go.
  // This is handed a fresh set of frames and a fresh rect, and redraws.
  //
  // This floats above the sheet and never touches it. The sheet's rows are
  // immutable once packed, and the whole of "opening a tile costs you your
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
  import { refract } from "./glass.js";
  import { GAP, aspect } from "./layout.js";

  let {
    frames = [],
    origin = null,
    back = false,
    forward = false,
    onstep = () => {},
    onreveal = () => {},
    onclose = () => {},
  } = $props();

  // What the frames keep from the top and bottom of the window. The pane covers
  // the header rather than clearing it, so there is no horizontal edge here that
  // is different from the vertical one — except for what the arrows need.
  const PAD = 40;

  // ...which is this: the lane down each side the pucks sit in. Wider than the
  // pad, because a photograph must never be under an arrow — the arrows are the
  // furniture and the photograph is the thing. The puck is centred in it, so the
  // margin either side of a 44px puck is what is left of 72.
  const SIDE = 72;
  const PUCK = 44;

  // A tile that stood for one photograph opens as one frame, so the label has
  // to say that rather than "1 frames in this stack" — there is no stack.
  const label = $derived(
    frames.length === 1 ? "one photograph" : `${frames.length} frames in this stack`,
  );

  // The pane's own box, and not the window's. `innerWidth` counts the sheet's
  // scrollbar, which the pane is not laid out across — so packing against it
  // pushed the widest row a scrollbar's width past the right margin, far enough
  // to reach under the arrow that margin exists to hold.
  //
  // Seeded rather than started at zero, and then kept by the pane's own size
  // binding. The binding is a ResizeObserver, so its first reading arrives after
  // this component's first render — and a first render at zero would lay every
  // frame out at nothing and hand the flight no rect to leave from, which is the
  // one movement the reader sees when a tile opens. The document element is the
  // same box a `position: fixed; inset: 0` pane gets, and it can be read now.
  let width = $state(document.documentElement.clientWidth);
  let height = $state(document.documentElement.clientHeight);
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

  const boxW = $derived(Math.max(0, width - SIDE * 2));
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

  // Where a frame starts: the current tile's rect, as the offset and scale that
  // maps its final box back onto it. One `transform` off `transform-origin: 0 0`
  // rather than four animated lengths, so the flight is the compositor's work
  // and not the layout engine's.
  //
  // The current tile and not the clicked one: the sheet scrolls under the pane
  // on every step, so the rect handed in is always a tile that is mounted and on
  // screen, and the flight is the same movement on the twentieth tile of a walk
  // as on the first.
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
    const dx = origin.left - (SIDE + box.x);
    const dy = origin.top - (PAD + box.y);
    return `translate(${dx}px, ${dy}px) scale(${origin.width / box.w}, ${origin.height / box.h})`;
  }

  // --- the arrows ----------------------------------------------------------

  // How long the pointer has to rest before they go. Long enough that reaching
  // for one does not lose it, short enough that a photograph being looked at is
  // not flanked by furniture.
  const REST_MS = 1600;

  let resting = $state(false);
  let restTimer = 0;

  function stir() {
    resting = false;
    clearTimeout(restTimer);
    restTimer = setTimeout(() => (resting = true), REST_MS);
  }

  // --- open and close ------------------------------------------------------

  function onkeydown(event) {
    if (event.key === "Escape") {
      onclose();
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    // Otherwise the page behind scrolls sideways under a pane that is covering
    // it, and closing lands the reader somewhere they never went.
    event.preventDefault();
    // `repeat` is the whole of what the rate limit is for: a key being held
    // down. A press the reader made is never too fast to mean something.
    onstep(event.key === "ArrowLeft" ? -1 : 1, event.repeat);
  }

  // A click on anything that is not a frame or an arrow's lane closes it.
  // `.frame` and not the `.frames` box they sit in: that box is the whole pane
  // bar its margins, so testing it would leave every gap between and around the
  // frames — most of the surface for a stack of two — doing nothing. `.lane` and
  // not `.puck`, for the reason the lanes exist at all: see the markup.
  //
  // On `pointerdown` and not on `click`, for the reason the header's own
  // outside-click is: this component mounts during the `click` that opened it,
  // and a `click` listener added here would be handed that same event on its way
  // up to the window and shut immediately. The `pointerdown` that opened it has
  // already been and gone.
  function onpointerdown(event) {
    if (!event.target.closest(".frame, .lane")) onclose();
  }

  onMount(() => {
    pane?.focus();
    stir();
    return () => clearTimeout(restTimer);
  });
</script>

<svelte:window {onkeydown} {onpointerdown} onpointermove={stir} />

<!-- The material the header is made of, without the refraction: `refract` draws
     a displacement map the size of its node, and at the size of the window that
     is a two-megapixel canvas and a PNG encode of it between the click and the
     first frame. app.css already has the refraction absent as a state this
     material ships in — outside Chromium it is always absent — so this is the
     same pane at the same blur, tint and saturation, with the one stage left off
     that a full-bleed surface has no rim to show anyway.

     The pucks are the other way round: they are small, they have a rim, and they
     are the header's panes at the header's size, so they take the refraction
     too. One material, one visual language. -->
<div
  class="glass pane"
  class:resting
  bind:this={pane}
  bind:clientWidth={width}
  bind:clientHeight={height}
  role="dialog"
  aria-label={label}
  tabindex="-1"
>
  <div class="frames" style:inset="{PAD}px {SIDE}px">
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

  <!-- The lanes are what the pointer lands on, not the buttons. A disabled
       button dispatches no pointer event in Chromium and the pane behind it gets
       one instead, so without them pressing a greyed-out arrow would close the
       overlay — which is the opposite of what a control that says "there is
       nothing that way" should do. Sized to the puck, so they swallow nothing
       else. -->
  <div class="lane" style:width="{PUCK}px" style:left="{(SIDE - PUCK) / 2}px">
    <button
      class="glass puck"
      type="button"
      use:refract
      title="Previous tile"
      aria-label="Previous tile"
      disabled={!back}
      onclick={() => onstep(-1)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5 7.5 12l7 7" /></svg>
    </button>
  </div>

  <div class="lane" style:width="{PUCK}px" style:right="{(SIDE - PUCK) / 2}px">
    <button
      class="glass puck"
      type="button"
      use:refract
      title="Next tile"
      aria-label="Next tile"
      disabled={!forward}
      onclick={() => onstep(1)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5l7 7-7 7" /></svg>
    </button>
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

  /* `inset` is written from `PAD` and `SIDE`, which the frames' boxes are also
     measured against — one pair of numbers, so the flight cannot land a frame
     off by a margin. */
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

  /* Out of the tile that is behind the pane and into place. `--flight` is that
     tile's rect expressed as this frame's own transform; the component writes
     it. Re-running on every step is what the keyed `{#each}` buys: a step is a
     new set of frames, so these are new elements and the animation is new. */
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

  /* Centred in the margin `SIDE` opens down each edge — which is the margin the
     frames are laid out inside, so an arrow is never over a photograph. Square,
     because the puck is round. */
  .lane {
    position: absolute;
    top: 50%;
    translate: 0 -50%;
    aspect-ratio: 1;
  }

  /* The two arrows. Round, so the radius is the one thing about the material
     they state for themselves; everything else — the blur, the tint, the
     fresnel, the glare, the refraction `use:refract` fills in — is the header's,
     because a second visual language for one control would show. */
  .puck {
    --glass-radius: 50%;
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    padding: 0;
    border: none;
    cursor: pointer;
    transition: opacity 260ms ease;
  }

  /* A control on glass is a place the pane is denser, not a coloured box —
     app.css's `button:hover` would put an opaque fill on a surface whose whole
     point is being seen through. Same wash of `--glass-ink` the header's own
     controls use. The `.pane` in front is specificity: `button:hover:not(...)`
     is three classes and an element, so three classes alone would lose to it. */
  .pane .puck:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--glass-ink) 10%, var(--glass-tint));
  }

  .puck svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Gone while the pointer is still, back the moment it moves. A photograph
     being looked at is not flanked by furniture; a reader reaching for the
     furniture has already moved the pointer by the time they need it. */
  .pane.resting .puck {
    opacity: 0;
  }

  /* Unavailable at the ends of the selection: still there, so the reader can see
     which end they are at, and plainly not a thing to press. `disabled` already
     stops the click; this is what says so. */
  .puck:disabled {
    opacity: 0.25;
    cursor: default;
  }

  @media (prefers-reduced-motion: reduce) {
    .puck {
      transition: none;
    }
  }
</style>
