<script>
  // The grid's chrome: what is on screen, how it is ordered, and how to narrow
  // it. Fixed, so it never leaves; glass, so what is behind it stays visible
  // while the text on it stays legible over any photograph.
  //
  // It knows no dimension names. Titles, option labels, counts, hints and the
  // sort list all arrive from /api/facets, so a new filter is a change to
  // `photolib.browse` and to nothing here.
  import { onMount } from "svelte";
  import { count } from "./api.js";
  import { refract } from "./glass.js";
  import { current, set } from "./theme.js";

  let {
    facets = null,
    // dimension name -> the values it filters on. Owned by App; this component
    // proposes the next one and never mutates the one it was given. The filters
    // and the sort together are the view — what is on screen — which is a
    // different thing from the selected set below, the tiles the reader picked
    // by hand out of it.
    filters = {},
    sort = "newest",
    // `{on}`, owned and remembered by App exactly as the filters are owned by
    // it: this proposes the next one.
    stacking = { on: false },
    // The rows the answer holds, and — while stacking is on — the tiles those
    // rows stand for. `tiles` is null when a row is already a tile, which is
    // what lets the pane read photographs in both modes without being told the
    // toggle's state. `total` is the rows, which is the stack count while
    // stacking is on and what the pill's badge says.
    total = null,
    tiles = null,
    loading = false,
    // Select mode, and what it has caught: `{stacks, photos}` from
    // `select.js`'s `tally`. The pair of numbers the count pane gave up when it
    // became one number — here they are about a set the reader picked by hand,
    // which is the only place a pair of them is worth reading. Named for the
    // tally and not for the set, because the selected set itself never comes
    // here: the header draws two numbers about it and nothing else.
    selecting = false,
    selectedTally = { stacks: 0, photos: 0 },
    onfilter = () => {},
    onsort = () => {},
    onstack = () => {},
    onclear = () => {},
    onselecting = () => {},
    onshare = () => {},
    ondeselect = () => {},
    ontriage = () => {},
  } = $props();

  let panel = $state(""); // "" | "sort" | "filters" | "stacks"
  // Read off the document rather than defaulted here: main.js has already put
  // the remembered one on it, and this is the button that says which it is.
  let theme = $state(current());
  let row = $state(null);

  // The count pane's number, and it is photographs whichever mode is on: with
  // stacking on the rows are covers and `tiles` is what they collapsed, with it
  // off a row is already a tile. Null until the first page answers.
  const photos = $derived(tiles ?? total);

  const dimensions = $derived(facets?.dimensions ?? []);
  const sorts = $derived(facets?.sorts ?? []);
  const sortLabel = $derived(sorts.find((entry) => entry.value === sort)?.label ?? sort);

  // How many values the view filters on across every dimension. The badge, and
  // the only thing that says a filter is on while the panel is shut.
  const active = $derived(
    Object.values(filters).reduce((sum, values) => sum + values.length, 0),
  );

  // Those values as one flat list, so each can be dropped from the bar without
  // opening the panel. Labels come from the facet list rather than from the
  // value, because "1to5mb" is not a label and "" is not a camera.
  const chips = $derived(
    dimensions.flatMap((dimension) =>
      (filters[dimension.name] ?? []).map((value) => ({
        dimension: dimension.name,
        value,
        title: dimension.title,
        label:
          dimension.options.find((option) => option.value === value)?.label ?? String(value),
      })),
    ),
  );

  function toggle(dimension, value) {
    const current = filters[dimension] ?? [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onfilter(dimension, next);
  }

  function isOn(dimension, value) {
    return (filters[dimension] ?? []).includes(value);
  }

  function flipTheme() {
    theme = set(theme === "dark" ? "light" : "dark");
  }

  // Escape closes whatever is open, and a click anywhere that is not the header
  // does the same. Both are on window rather than on a backdrop element: a
  // backdrop over the sheet would eat the click that opens a photograph.
  function onkeydown(event) {
    if (event.key === "Escape") panel = "";
  }

  function onpointerdown(event) {
    if (panel && !event.target.closest(".topbar")) panel = "";
  }

  // Publish the header's real height, which the sheet uses as its top padding.
  // The bar grows when the chips wrap, and a constant here would put the first
  // row of photographs underneath them. This is the bar's height and only the
  // bar's: the count hangs out of the row in the margin beside it, so however
  // tall `/tune` makes that pane it is floating over a photograph rather than
  // deciding where the photographs start.
  //
  // Written through the CSSOM rather than as a style attribute: the CSP carries
  // no 'unsafe-inline', and setting the attribute is what that blocks.
  onMount(() => {
    const observer = new ResizeObserver(([entry]) => {
      const height = Math.round(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
      document.documentElement.style.setProperty("--header-h", height + "px");
    });
    observer.observe(row);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--header-h");
    };
  });
</script>

<svelte:window {onkeydown} {onpointerdown} />

<div class="topbar" bind:this={row}>
  <!-- The count is a pane of its own, to the left of the controls: it is the one
       thing here that is an answer rather than a control, and reading it off a
       photograph is what a bar tuned clear enough to see through makes hard.
       Its own pane gives it its own ground. -->
  <!-- One number, and it counts photographs in both modes, so the toggle cannot
       change what it means underneath the reader — the failure this pane cannot
       afford is 10,731 where 24,306 stood with the word "photos" still beside
       it, reading as a library that has lost half of itself. The number that
       does change with the toggle is how many stacks those photographs made,
       and that is the badge on the Stacks pill, which is where the reader
       turned stacking on. -->
  <!-- Both panes hang out of the bar's left edge, in the margin the side setting
       opens up. The selected one is first so it grows away from the count. -->
  <div class="panes">
    {#if selectedTally.stacks}
      <div class="glass selected" use:refract>
        <span class="nums">
          <strong>{count(selectedTally.stacks)}</strong>
          <span class="muted">{selectedTally.stacks === 1 ? "stack" : "stacks"}</span>
          <strong>{count(selectedTally.photos)}</strong>
          <span class="muted">{selectedTally.photos === 1 ? "photo" : "photos"}</span>
        </span>
        <button class="menu small" onclick={() => onshare()} title="Copy the conditions and the selected ids to the clipboard">
          Share
        </button>
        <button class="menu small" onclick={() => ondeselect()}>Clear</button>
      </div>
    {/if}

    <div class="glass tally" use:refract>
      <strong>{photos === null ? "…" : count(photos)}</strong>
      <span class="muted">{photos === 1 ? "photo" : "photos"}</span>
      {#if loading}<span class="spin" aria-label="loading"></span>{/if}
    </div>
  </div>

  <!-- The panels hang off this rather than off the bar: an element with a
       backdrop-filter is a backdrop root for its descendants, so a panel nested
       inside the blurred bar would sample the bar instead of the photographs. -->
  <div class="stack">
    <div class="glass bar" role="toolbar" aria-label="Grid controls" tabindex="-1" use:refract>
      <div class="controls">
        <button
          class="menu"
          class:open={panel === "sort"}
          aria-expanded={panel === "sort"}
          onclick={() => (panel = panel === "sort" ? "" : "sort")}
        >
          {sortLabel}<span class="caret">▾</span>
        </button>

        <button
          class="menu"
          class:open={panel === "filters"}
          class:on={active > 0}
          aria-expanded={panel === "filters"}
          onclick={() => (panel = panel === "filters" ? "" : "filters")}
        >
          Filters{#if active}<span class="badge">{active}</span>{/if}<span class="caret">▾</span>
        </button>

        <!-- The count on the pill is what stacking did, readable without
             opening the panel, and the only place that number is said: the
             pill is where you turned it on. -->
        <button
          class="menu"
          class:open={panel === "stacks"}
          class:on={stacking.on}
          aria-expanded={panel === "stacks"}
          onclick={() => (panel = panel === "stacks" ? "" : "stacks")}
        >
          Stacks{#if stacking.on && total !== null}<span class="badge">{count(total)}</span>{/if}<span
            class="caret">▾</span
          >
        </button>

        <!-- A toggle rather than a menu, so no caret: there is nothing to open.
             What it does is change what a click on a photograph means, which is
             why its on-state is the solid one the open panels use. -->
        <button
          class="menu"
          class:on={selecting}
          role="switch"
          aria-checked={selecting}
          title="Select tiles by clicking them, then copy their ids"
          onclick={() => onselecting(!selecting)}
        >
          Select
        </button>

        {#if chips.length}
          <div class="chips">
            {#each chips as chip (chip.dimension + " " + chip.value)}
              <button
                class="fchip"
                title="{chip.title}: {chip.label} — click to remove"
                onclick={() => toggle(chip.dimension, chip.value)}
              >
                <span class="muted">{chip.title}</span>{chip.label}<span class="x">×</span>
              </button>
            {/each}
            <button class="clear" onclick={() => onclear()}>Clear all</button>
          </div>
        {/if}
      </div>

      <!-- The two grounds a photograph can hang on. The glyph is the one you are
           not on, because that is what pressing it gives you. -->
      <button
        class="menu theme"
        onclick={flipTheme}
        title={theme === "dark" ? "Switch to a white background" : "Switch to a black background"}
        aria-label={theme === "dark"
          ? "Switch to a white background"
          : "Switch to a black background"}
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>

      <button class="menu" onclick={() => ontriage()} title="Leave the grid and go to triage">
        Triage
      </button>
    </div>

    {#if panel === "sort"}
      <div class="glass sheet sorts" use:refract>
        {#each sorts as entry}
          <button
            class="option"
            class:on={entry.value === sort}
            onclick={() => {
              onsort(entry.value);
              panel = "";
            }}
          >
            {entry.label}
          </button>
        {/each}
      </div>
    {/if}

    <!-- A panel and not a control in the bar: the bar stops shrinking at
         `--bar-min`, and the sentence under the switch is what makes the switch
         mean anything. Same material and same behaviour as Sort and Filters, so
         Escape and a click outside close this one too, from the two handlers
         above. -->
    {#if panel === "stacks"}
      <div class="glass sheet stacks" use:refract>
        <section>
          <h2>Stacking</h2>
          <div class="options">
            <button
              class="option"
              class:on={stacking.on}
              role="switch"
              aria-checked={stacking.on}
              onclick={() => onstack({ ...stacking, on: !stacking.on })}
            >
              {stacking.on ? "On" : "Off"}
            </button>
          </div>
          <p class="note">
            The same photograph taken more than once is drawn as one tile — a
            bracket or a burst, checked frame against frame rather than guessed
            from the clock. Narrowing the filters takes frames out of a stack and
            never breaks one in two.
          </p>
        </section>
      </div>
    {/if}

    {#if panel === "filters"}
      <div class="glass sheet filters" use:refract>
        {#if !facets}
          <p class="muted">loading…</p>
        {:else}
          {#each dimensions as dimension}
            <section>
              <h2>
                {dimension.title}
                {#if dimension.hint}<span class="help" title={dimension.hint}>?</span>{/if}
              </h2>
              <div class="options">
                {#each dimension.options as option}
                  <button
                    class="option"
                    class:on={isOn(dimension.name, option.value)}
                    onclick={() => toggle(dimension.name, option.value)}
                  >
                    {option.label}
                    {#if option.count !== null}<span class="n">{count(option.count)}</span>{/if}
                  </button>
                {/each}
                {#if !dimension.options.length}
                  <span class="muted">nothing here</span>
                {/if}
              </div>
            </section>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  /* The wrapper is exactly the bar's box, so it cannot swallow a click meant for
     a tile. The count and the panels hang out of it, which absolutely positioned
     children may. Margin from the top, left and right — two numbers, both of
     which `/tune` moves: this floats over the photographs rather than being a
     lid on them.

     The two side margins are equal, so the bar is centred in the window and the
     count sits in the margin to its left rather than in the row: the bar is the
     thing being centred, and a count in the flow would push it off centre by its
     own width. `min()` is what keeps the two honest on a window the shipped
     margin is too wide for — past the point where it would squeeze the bar below
     `--bar-min`, the margin gives way and the bar stops shrinking.

     `stretch` is the default for the bar's own stack, which is how the bar stays
     as tall as its contents and grows when the chips wrap. */
  .topbar {
    position: fixed;
    top: var(--header-top);
    left: min(var(--header-side), calc((100vw - var(--bar-min)) / 2));
    right: min(var(--header-side), calc((100vw - var(--bar-min)) / 2));
    z-index: 30;
    display: flex;
    align-items: stretch;
  }

  /* The bar and the panels that drop out of it, as one positioned box. The
     panels measure from this rather than from the whole row, so they open under
     the controls that summoned them and not under the count. */
  .stack {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  /* Two capsules. Their height is the control height plus a ring of padding on
     every side, so the pills inside sit in the middle rather than being crowded
     against the rim the refraction draws. */
  .bar {
    display: flex;
    align-items: center;
    gap: var(--s-3);
    padding: var(--s-3);
    min-height: 56px;
  }

  /* The answers, each on ground of its own so it has something under it whatever
     the bar's tint is set to. Out of the flow and hung off the bar's left edge,
     because the bar is what is centred in the window: in the row they would push
     it right by their own width, and a count that is not the thing being centred
     should not be what decides where the centre is. They live in the margin the
     side setting opens up, which is why that setting has a floor — at 650 there
     is 650px of window to the bar's left and the count needs about 120 of them.

     Right to left, so the count keeps its position and the selected pane grows
     away from it: the count is where the reader's eye already is, and a pane
     appearing must not move it.

     The height is the count's own, and `/tune` sets it: the pane holding a
     five-digit answer does not have to be the height of a row of pills. It
     ships at 42px against the bar's 56, and `top`/`bottom` plus an auto block
     margin centre the row against the bar whatever that height is. It no longer
     sets the header's height at all — `--header-h` is the bar, which is the only
     one of the two the photographs have to start below.

     The height is exact rather than a floor, and the block padding is nothing:
     a pane that kept 12px above and below the number could not be shrunk past
     45px however low the slider went, and the point of the control is to get it
     down to the height of a pill beside it. The line is centred by the flex
     row, so the padding was never what put it in the middle. */
  .panes {
    position: absolute;
    right: calc(100% + var(--s-2));
    top: 0;
    bottom: 0;
    margin-block: auto;
    display: flex;
    align-items: center;
    gap: var(--s-2);
    height: var(--glass-tally-h, 42px);
  }

  /* The two properties the rest of the material reads are rebound here to the
     count's own pair, rather than each pane naming a background and a colour of
     its own: everything inside them — the number, the word, the muted fraction
     that word is written in — then picks the new values up from the rules that
     already read them, and `.glass` above needs no exception. */
  .tally,
  .selected {
    --glass-tint: var(--glass-tint-tally);
    --glass-text: var(--glass-text-tally);
  }

  .tally {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 100%;
    padding: 0 var(--s-4);
    white-space: nowrap;
  }

  /* The count's material, because it is the same kind of thing: an answer, on
     its own ground, read off a photograph. What it adds is the two controls the
     count pane has no use for. */
  .selected {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    height: 100%;
    padding: 0 var(--s-2) 0 var(--s-4);
    white-space: nowrap;
  }

  /* Two numbers with their words, which is what makes them readable as a pair
     rather than as one number the reader has to guess the unit of. */
  .selected .nums {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }

  .selected strong {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .selected strong + .muted {
    margin-right: 3px;
  }

  .small {
    min-height: var(--ctl-sm);
    font-size: var(--fs-200);
    font-weight: 400;
    color: var(--glass-text);
  }

  /* The shadow these two panes cast, and when they are entitled to cast one.
     At the top of the page there is nothing behind them but the page: a shadow
     there is a lid on a document rather than a pane floating over a picture, and
     on white it reads as exactly that. So they carry none of it until the first
     row of tiles reaches the bar's bottom edge — which is `--page-top` of
     scrolling and nothing else, because that is the gap the sheet leaves — and
     the whole of it a bar's height further on, the point at which the photograph
     has passed under the whole pane rather than just its lower edge. The two
     numbers in `animation-range` are that sentence.

     A scroll-driven animation rather than a scroll listener: the interpolation
     is the compositor's, nothing runs on the main thread while the reader
     scrolls, and the range re-reads its own two custom properties when `/tune`
     moves them. Linear, because what this tracks is how much photograph is under
     the pane, and that grows with the scroll rather than with a clock — the
     shadow arrives at the speed the reader brings it, which is why there is no
     duration here to reduce for `prefers-reduced-motion`. A page too short to
     scroll leaves the timeline inactive and the base value standing, which is
     the right answer for a grid the header never covers.

     `.sheet` is deliberately not here: a panel hangs below the bar with
     photographs behind it at any scroll position, so it keeps its shadow whole
     through app.css's initial value. */
  .tally,
  .selected,
  .bar {
    --glass-lift: 0;
    animation-name: lift;
    animation-timing-function: linear;
    animation-fill-mode: both;
    animation-timeline: scroll(root block);
    animation-range: var(--page-top) calc(var(--page-top) + var(--header-h));
  }

  @keyframes lift {
    from {
      --glass-lift: 0;
    }
    to {
      --glass-lift: 1;
    }
  }

  /* Where scroll-driven animations are not implemented the timeline never
     starts, and the base value above would hold the shadow off for ever. Those
     engines get it unconditionally, which is what shipped before this: a shadow
     always present is a better failure than one never present. */
  @supports not (animation-timeline: scroll()) {
    .tally,
    .selected,
    .bar {
      --glass-lift: 1;
    }
  }

  .tally strong {
    font-size: var(--fs-400);
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    flex: 1;
    min-width: 0;
  }

  .chips {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    min-width: 0;
  }

  /* The two ends of the page, as one button. Square, because it holds a glyph
     rather than a word, and it sits with Triage rather than with the filters:
     both of these change the page you are on rather than what is on it. */
  .theme {
    padding: 0;
    width: var(--ctl);
    font-size: 14px;
    line-height: 1;
  }

  /* Everything written on either pane is the glass's own ink, which `/tune`
     sets: a bar transparent enough to see the photograph through needs its text
     decided separately from the page's. `button` in app.css states a colour, so
     inheritance has to be asked for rather than left to happen. */
  .bar button,
  .sheet button {
    color: var(--glass-text);
  }

  /* ---------------------------------------------------------------- panels */

  /* A panel of dense text needs more ground under it than a bar of five words
     does: the same material as the bar leaves the section labels sitting on
     whatever happens to be behind them, and over a bright photograph that is not
     a background, it is noise. Deeper blur, harder dim, same glass — the tuned
     tint pushed towards opaque by lib/glass.js and the tuned blur deepened here,
     so there is one material and not two parameter sets to keep in step. The
     saturation is deepened by nothing: it is not a depth, so a panel takes the
     bar's own `--glass-saturate` rather than a second literal beside it. */
  .sheet {
    position: absolute;
    top: calc(100% + var(--s-2));
    background-color: var(--glass-tint-sheet);
    backdrop-filter: var(--glass-pre, ) blur(calc(var(--glass-blur, 2px) + 12px))
      saturate(var(--glass-saturate, 130%)) brightness(var(--glass-bright-sheet))
      var(--glass-post, );
    /* Whatever is left of the window below the bar, less the inset it keeps at
       the bottom. Tall panels scroll inside themselves rather than off screen. */
    max-height: calc(
      100vh - var(--header-top) - var(--header-h) - var(--s-2) - var(--page-inset)
    );
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .sorts {
    left: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--s-2);
    min-width: 210px;
  }

  /* Narrow rather than spread across the bar like the filters: it holds one
     control, and a panel the width of the window for one control reads as a page
     rather than as a menu. Hung from the bar's left edge, as the sort menu
     is — the panels line up with each other rather than each with the pill that
     opened it, so opening a second one does not slide the ground sideways. */
  .stacks {
    left: 0;
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    padding: var(--s-4);
    width: 300px;
    max-width: 100%;
  }

  /* A sentence under a control, in the panel's own ink. The hints on the filter
     panel are a `?` because there are fifteen of them and fifteen sentences is
     a page; there is one here, and a sentence you have to hover for is a
     sentence nobody reads. */
  .note {
    margin: var(--s-2) 0 0;
    font-size: var(--fs-100);
    line-height: 1.45;
    color: color-mix(in srgb, var(--glass-text) 58%, transparent);
  }

  .filters {
    left: 0;
    right: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(232px, 1fr));
    gap: var(--s-2) var(--s-6);
    padding: var(--s-5);
  }

  .filters section {
    min-width: 0;
    padding-bottom: var(--s-3);
  }

  h2 {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: var(--fs-100);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--glass-text) 68%, transparent);
    margin: 0 0 var(--s-2);
  }

  .help {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--glass-ink) 12%, transparent);
    color: color-mix(in srgb, var(--glass-text) 68%, transparent);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0;
    cursor: help;
  }

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  /* An option is a checkbox that looks like a pill. The count is what makes the
     menu worth opening: it says what the library holds before you commit to
     looking for it.
   *
   * Every fill in this panel and in the bar below is a wash of `--glass-ink`
   * rather than a colour of its own: on glass, a control is a place the pane is
   * a little more solid, and which way "more solid" runs is the one thing the
   * theme decides. */
  .option {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    max-width: 100%;
    min-height: var(--ctl-sm);
    padding: 0 10px;
    border-radius: var(--r-pill);
    font-weight: 400;
    background: color-mix(in srgb, var(--glass-ink) 6%, transparent);
    border-color: transparent;
    text-align: left;
  }

  .option:hover:not(:disabled) {
    background: color-mix(in srgb, var(--glass-ink) 11%, transparent);
    border-color: transparent;
  }

  .option .n {
    color: color-mix(in srgb, var(--glass-text) 54%, transparent);
    font-size: var(--fs-100);
  }

  .option.on,
  .option.on:hover {
    background: color-mix(in srgb, var(--accent) 28%, transparent);
    border-color: color-mix(in srgb, var(--accent) 60%, transparent);
  }

  .option.on .n {
    color: color-mix(in srgb, var(--glass-text) 70%, transparent);
  }

  .sorts .option {
    justify-content: flex-start;
    border-radius: var(--r-1);
    min-height: var(--ctl);
    padding: 0 var(--s-3);
    background: none;
  }

  /* ---------------------------------------------------------------- buttons */

  /* The fill `/tune` sets, and the two states above it as washes of `--glass-ink`
     laid over that fill rather than as fills of their own — so a control the
     reader has made solid stays solid when it is hovered, and one they have made
     clear still says which of it is open. */
  .menu {
    flex: none;
    gap: 7px;
    border-radius: var(--r-pill);
    padding: 0 var(--s-3);
    background: var(--glass-ctl);
    border-color: color-mix(in srgb, var(--glass-text) 14%, transparent);
  }

  .menu:hover:not(:disabled) {
    background: color-mix(in srgb, var(--glass-ink) 10%, var(--glass-ctl));
    border-color: color-mix(in srgb, var(--glass-text) 24%, transparent);
  }

  .menu.open,
  .menu.on,
  .menu.open:hover,
  .menu.on:hover {
    background: color-mix(in srgb, var(--glass-ink) 18%, var(--glass-ctl));
    border-color: color-mix(in srgb, var(--glass-text) 36%, transparent);
  }

  .caret {
    font-size: 8px;
    color: color-mix(in srgb, var(--glass-text) 66%, transparent);
    margin-left: -1px;
  }

  .badge {
    min-width: 17px;
    height: 17px;
    padding: 0 5px;
    border-radius: var(--r-pill);
    background: var(--accent);
    color: var(--accent-ink);
    font-size: 10px;
    font-weight: 700;
    line-height: 17px;
    text-align: center;
  }

  /* Not `.chip`: that name belongs to the override chip the contact sheet pins
     into a tile's corner, which app.css positions absolutely. A filter chip that
     inherited it stacked itself in the bar's top right corner, on top of the
     Triage button. */
  .fchip {
    gap: 6px;
    max-width: 24ch;
    min-height: var(--ctl-sm);
    padding: 0 var(--s-2) 0 10px;
    border-radius: var(--r-pill);
    font-size: var(--fs-200);
    font-weight: 400;
    background: color-mix(in srgb, var(--accent) 22%, transparent);
    border-color: color-mix(in srgb, var(--accent) 42%, transparent);
    overflow: hidden;
    white-space: nowrap;
  }

  .fchip:hover:not(:disabled) {
    background: color-mix(in srgb, var(--accent) 30%, transparent);
    border-color: color-mix(in srgb, var(--accent) 58%, transparent);
  }

  .fchip .muted {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: color-mix(in srgb, var(--glass-text) 62%, transparent);
  }

  .fchip .x {
    color: color-mix(in srgb, var(--glass-text) 68%, transparent);
    font-size: 13px;
  }

  .fchip:hover .x {
    color: var(--glass-text);
  }

  .clear {
    border-radius: var(--r-pill);
    min-height: var(--ctl-sm);
    padding: 0 10px;
    font-size: var(--fs-200);
    font-weight: 400;
    background: none;
    border-color: transparent;
    color: color-mix(in srgb, var(--glass-text) 58%, transparent);
  }

  .clear:hover:not(:disabled) {
    background: color-mix(in srgb, var(--glass-ink) 8%, transparent);
    border-color: transparent;
    color: var(--glass-text);
  }

  /* A ring rather than a moving bar: it costs one composited transform per frame
     and nothing else while pages are in flight. */
  .spin {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1.5px solid color-mix(in srgb, var(--glass-ink) 20%, transparent);
    border-top-color: var(--accent);
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spin {
      animation-duration: 2.5s;
    }
  }

  .muted {
    color: color-mix(in srgb, var(--glass-text) 58%, transparent);
  }
</style>
