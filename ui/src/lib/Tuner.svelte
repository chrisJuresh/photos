<script>
  // `/tune` — the header's material, one slider per control, over the real grid.
  //
  // The point of the page is that the thing being judged is the shipping bar
  // over real photographs, not a swatch: a rim that reads beautifully over a
  // studio backdrop can be invisible over a white sky and unbearable over a
  // black interior, and the only way to find that out is to scroll. So this is a
  // panel bolted onto the grid rather than a page of its own, it is deliberately
  // opaque — you are judging the glass, not this — and it can be folded away.
  //
  // Every control liquid-glass-studio's own editor carries is here, at its own
  // range and step, read off `src/Controls.tsx`. The nine it has that a header
  // does not are listed at the bottom with the reason, rather than shipped as
  // sliders that move nothing.
  import { onMount } from "svelte";
  import { COLOURS, SHIPPED, STUDIO, apply, settings, tune } from "./glass.js";
  import { current, set } from "./theme.js";

  const KEY = "photos.glass";

  // key, label, min, max, step. The ranges are upstream's, and the notes say
  // what each one does here when that is not the same as what it does there.
  //
  // A max may be a function of the window's width instead of a number, for the
  // one setting whose ceiling is not a fact about the material: how far in from
  // the edge the bar can be pulled is bounded by the window it is floating in,
  // and any literal is either short on a wide monitor or meaningless on a laptop.
  /**
   * @type {{title: string, note: string,
   *         rows: [string, string, number, number | ((vw: number) => number), number][]}[]}
   */
  const GROUPS = [
    {
      title: "Refraction",
      note:
        "The displacement map: how wide the bevel is, how hard it bends, and how far red goes " +
        "past blue. Thickness is capped at a bar-height's worth of band — about 22px on a 56px " +
        "bar — because a rim as deep as the pane is not a rim, it is a lens, and it smears the " +
        "text. Past that the slider moves and the pane does not.",
      rows: [
        ["refThickness", "Thickness", 1, 80, 0.01],
        ["refFactor", "IOR", 1, 4, 0.01],
        ["refDispersion", "Dispersion", 0, 50, 0.01],
      ],
    },
    {
      title: "Fresnel",
      note: "The flat rim. Range is the band's width, hardness is how much of it is a soft edge, factor is how bright.",
      rows: [
        ["refFresnelRange", "Range", 0, 100, 0.01],
        ["refFresnelHardness", "Hardness", 0, 100, 0.01],
        ["refFresnelFactor", "Factor", 0, 100, 0.01],
      ],
    },
    {
      title: "Glare",
      note:
        "The angular rim, read off the surface normal: two opposite lobes, the far one dimmed by " +
        "Opposite, and a dark notch at each of the two corners between them. Angle turns the pair; " +
        "at the shipped -45 the notches sit top-right and bottom-left. Convergence is the exponent " +
        "the lobe is taken to, so low is a rim lit the whole way round and high is two hot corners.",
      rows: [
        ["glareRange", "Range", 0, 100, 0.01],
        ["glareHardness", "Hardness", 0, 100, 0.01],
        ["glareFactor", "Factor", 0, 120, 0.01],
        ["glareConvergence", "Convergence", 0, 100, 0.01],
        ["glareOppositeFactor", "Opposite", 0, 100, 0.01],
        ["glareAngle", "Angle", -180, 180, 0.01],
      ],
    },
    {
      title: "Blur",
      note: "Studio opens on 1, which is a clear pane. Everything under this header is a photograph, so what ships is 18.",
      rows: [["blurRadius", "Radius", 1, 200, 1]],
    },
    {
      title: "Saturation",
      note:
        "Not upstream's — its shader has no saturation term at all, and this was a literal 200% " +
        "in the stylesheet with a second 170% on the panels until it was asked what it was for. " +
        "It multiplies the chroma of whatever photograph is behind the pane, so past a point the " +
        "header stops being glass over a photograph and becomes a more colourful copy of one. " +
        "100 leaves the backdrop its own colour. The panels take this same number — saturation " +
        "is not a depth. No studio value, so the default is what ships.",
      rows: [["saturation", "Amount", 0, 300, 1]],
    },
    {
      title: "Shadow",
      note:
        "Y is upstream's sign — negative puts the shadow below the pane. Scroll before judging " +
        "any of these: the bar and the count carry none of their shadow until a photograph is " +
        "under them, all of it once one has passed under the whole pane, and the four numbers " +
        "here only say what the whole of it is.",
      rows: [
        ["shadowExpand", "Expand", 2, 100, 0.01],
        ["shadowFactor", "Factor", 0, 100, 0.01],
        ["shadowX", "Offset X", -20, 20, 0.01],
        ["shadowY", "Offset Y", -20, 20, 0.01],
      ],
    },
    {
      title: "Shape",
      note:
        "Radius in pixels, clamped by the browser to half the shorter side — on a 56px bar " +
        "anything past 28 is the same capsule. Roundness is the superellipse exponent: 2 is the " +
        "ordinary circular corner, 4 is a squircle, 7 is nearly square. CSS takes the logarithm " +
        "of it rather than the exponent, so the painted corner and the one the map refracts are " +
        "the same corner.",
      rows: [
        ["shapeRadius", "Radius", 1, 100, 0.1],
        ["shapeRoundness", "Roundness", 2, 7, 0.01],
      ],
    },
    {
      title: "Count height",
      note:
        "The only size in this material, and it belongs to the count pane alone: the bar is as " +
        "tall as the pills in it and grows when the chips wrap, but the count holds one number " +
        "and nothing that has to fit beside it. It ships at the bar's own 56, so the two start " +
        "level; below that it centres against the bar, above it the whole header grows. The " +
        "floor is 30 — the height of the sort, Filters and Triage pills themselves, which is as " +
        "short as a pane holding a line of text can honestly be. No studio value — its " +
        "shapeHeight sizes a demo blob, so the default is what ships.",
      rows: [["tallyHeight", "Height", 30, 160, 1]],
    },
    {
      title: "Placement",
      note:
        "Where the bar sits and where the photographs start under it. Top and Sides are the " +
        "bar's own margins and nothing else's, kept as separate numbers because only the top has " +
        "a photograph scrolling under it. Sides is one number for both edges because the bar is " +
        "centred, and at the shipped 650 the margin it opens on the left is where the count pane " +
        "lives — hung off the bar rather than in the row with it, so what is centred in the " +
        "window is the bar and not the pair. The grid keeps its own 14px from the left, right " +
        "and bottom of the window whatever Sides says: pulling the floating bar in from the edge " +
        "is a judgement about the bar, and dragging every photograph sideways with it is not what " +
        "that judgement was about. Page top is the gap between the bar's bottom edge and the " +
        "first row of tiles, and it ships at 14 — the same as the grid's own inset, so the space " +
        "it keeps under the header is the space it keeps from every other edge. " +
        "So two of these move the photographs and both move them down: Top, because the tiles " +
        "follow the bar rather than sliding under it, and Page top, because that is what it is " +
        "for. Sides moves the bar and the count alone. Its slider ends at half this window's " +
        "width and re-scales when you drag the window, but the bar stops shrinking at 560px and " +
        "the margin gives way instead, so the last of that range does nothing here. No studio " +
        "value — its editor's shape controls size a demo blob, so the default is what ships.",
      rows: [
        ["headerTop", "Top", 0, 300, 1],
        ["headerSide", "Sides", 0, (vw) => Math.floor(vw / 2), 1],
        ["pageTop", "Page top", 0, 300, 1],
      ],
    },
  ];

  // The five colours: the bar's tint, the fill of a control on it, the ink
  // written on that fill, and then the count pane's own ground and ink.
  // `glass.js` holds which keys each is and what its default is; this holds what
  // to say about it. Only the first is upstream's, and the notes say so, because
  // the amber-name convention is about departures from a default and the other
  // four cannot have the studio's.
  const COLOUR_NOTES = {
    tint: {
      title: "Tint",
      note:
        "Studio's own control, and it opens at alpha 0 — a clear pane, with nothing under the " +
        "text. This one is per theme, because which way the ground has to move is what the " +
        "palette decides about this material. It is the bar and the panels that drop out of " +
        "it; the count has its own, below.",
    },
    control: {
      title: "Control fill",
      note:
        "The pill behind each button in the bar. This is the way out of a transparent pane: " +
        "put the ground under the words rather than under the whole bar, and the photograph " +
        "stays visible between them. Hover and open are washes laid over this, so a fill you " +
        "make solid stays solid. No studio value — the default is what ships.",
    },
    ink: {
      title: "Control text",
      note:
        "Everything written on the bar and its panels: the label colours are fractions of it, " +
        "so this one number moves them all. The count is written in its own, below. No studio " +
        "value — the default is what ships.",
    },
    tally: {
      title: "Count tint",
      note:
        "The ground behind the number, which the bar's tint no longer decides. It is the one " +
        "pane up there that is an answer rather than a control, and the tint that reads under " +
        "five pills is not necessarily the one a five-digit number wants behind it. Ships equal " +
        "to the bar's, so the header does not change until you move this.",
    },
    tallyInk: {
      title: "Count text",
      note:
        "The number, the word beside it and the spinner's label, all of them fractions of this " +
        "one. Separate from the control text because a ground you can move on its own is a " +
        "ground whose ink has to move with it. No studio value — the default is what ships.",
    },
  };

  const CHANNELS = [
    ["r", "Red", 255],
    ["g", "Green", 255],
    ["b", "Blue", 255],
    ["a", "Alpha", 1],
  ];

  // Upstream's own controls that a fixed header cannot use, and why. Named
  // rather than silently dropped: the page claims to be the whole control set.
  const ABSENT = [
    ["renderer, language, Show Step", "editor plumbing — this has one renderer and no step view"],
    ["bgType", "its demo owns its backdrop; here the backdrop is the grid"],
    [
      "shapeWidth, shapeHeight",
      "the bar is sized by its contents and the window; the count pane's own height, and where " +
        "the row sits in that window, are above",
    ],
    ["mergeRate, showShape1, springSizeFactor", "the two-blob demo, which is one pane here"],
  ];

  let s = $state(settings());
  let open = $state(true);
  let copied = $state(false);
  let theme = $state(current());
  // The window's own width, for the one slider whose ceiling is the window
  // rather than the material. Initialised rather than left to the binding: a 0
  // here is a slider with no range for the frame before the bind runs.
  let vw = $state(window.innerWidth);

  // Which side of each colour pair the sliders edit. The material carries one
  // per theme because the ground does, and only one of them is on screen.
  const keyOf = (group) => (theme === "light" ? group.light : group.dark);

  // What a control's name is amber against, and what its ↺ goes back to.
  // Upstream has a value for nearly all of these; for the ones it has not — the
  // saturation stage its shader does not have, and the four colours its editor
  // has no control for — there is nothing to return to but what ships. `COLOURS`
  // carries its own `base` for exactly this reason.
  const baseOf = (key) => (key in STUDIO ? STUDIO : SHIPPED);
  const rgba = (c) => `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;

  const json = $derived(JSON.stringify(s, null, 2));

  // localStorage is writable by anything on this origin, so what comes out of
  // it goes through `tune`, which coerces every key against SHIPPED rather than
  // trusting it into a filter scale.
  onMount(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      try {
        s = tune(JSON.parse(stored));
        return;
      } catch {
        // Not JSON any more. The shipped material is the right thing to show.
      }
    }
    apply();
  });

  function push(patch) {
    s = tune({ ...s, ...patch });
    localStorage.setItem(KEY, JSON.stringify(s));
    copied = false;
  }

  function reset(preset) {
    s = tune(preset);
    localStorage.setItem(KEY, JSON.stringify(s));
    copied = false;
  }

  // One setting back to its default. That is the studio's own value wherever
  // upstream has one, so that the button is the exact inverse of the amber name
  // beside it: the name says this is no longer upstream's number, and this puts
  // it back. The two buttons at the bottom are how you return to the material
  // as a whole.
  function revert(key) {
    push({ [key]: baseOf(key)[key] });
  }

  function flipTheme() {
    theme = set(theme === "dark" ? "light" : "dark");
  }

  async function copy() {
    await navigator.clipboard.writeText(json);
    copied = true;
  }
</script>

<svelte:window bind:innerWidth={vw} />

<div class="tuner" class:folded={!open}>
  <div class="head">
    <strong>Glass</strong>
    <span class="src">liquid-glass-studio</span>
    <button class="fold" onclick={() => (open = !open)} title={open ? "Fold away" : "Open"}>
      {open ? "–" : "+"}
    </button>
  </div>

  {#if open}
    <div class="body">
      <!-- Always in the row and only ever hidden, so a value returning to its
           default does not shift the column it sits in. -->
      {#snippet undo(label, moved, back)}
        <button
          class="undo"
          class:idle={!moved}
          onclick={back}
          title="Back to its default"
          aria-label="Reset {label}"
        >↺</button>
      {/snippet}

      <p class="note lead">
        A name goes amber when its value is no longer its default, and ↺ beside it puts that one
        setting back. The default is the studio's own for everything upstream has a control for,
        and this build's for the nine it has not — the saturation, the count pane's height, the
        three placement numbers, and then the control fill, the control text and that pane's own
        ground and ink. The two buttons at the bottom move the whole material at once.
      </p>

      {#each GROUPS as group}
        <section>
          <h2>{group.title}</h2>
          <p class="note">{group.note}</p>
          {#each group.rows as [key, label, min, ceiling, step]}
            {@const moved = s[key] !== baseOf(key)[key]}
            {@const max = typeof ceiling === "function" ? ceiling(vw) : ceiling}
            <div class="row" class:moved>
              <span class="name">{label}</span>
              <input
                type="range"
                {min}
                {max}
                {step}
                aria-label="{label}"
                value={s[key]}
                oninput={(event) => push({ [key]: Number(event.currentTarget.value) })}
              />
              <input
                class="num"
                type="number"
                {min}
                {max}
                {step}
                aria-label="{label} value"
                value={s[key]}
                oninput={(event) => push({ [key]: Number(event.currentTarget.value) })}
              />
              {@render undo(label, moved, () => revert(key))}
            </div>
          {/each}
        </section>
      {/each}

      <!-- The colours are the same four sliders over and over, and the theme
           button above them is one button rather than one each: it flips the
           whole page, so it cannot belong to any one of them. -->
      <p class="note">
        The five colours below are per theme, and you are editing the {theme} side of each. The
        first three are the bar and the panels that drop out of it; the last two are the count
        pane on its own.
      </p>
      <button class="ghost flip" onclick={flipTheme}>
        Edit the {theme === "dark" ? "light" : "dark"} colours
      </button>

      {#each COLOURS as group}
        {@const key = keyOf(group)}
        {@const value = s[key]}
        {@const base = group.base[key]}
        <section>
          <h2>{COLOUR_NOTES[group.dark].title} <span class="which">{theme}</span></h2>
          <p class="note">{COLOUR_NOTES[group.dark].note}</p>
          {#each CHANNELS as [channel, label, max]}
            {@const moved = value[channel] !== base[channel]}
            <div class="row" class:moved>
              <span class="name">{label}</span>
              <input
                type="range"
                min="0"
                {max}
                step={max === 1 ? 0.01 : 1}
                aria-label="{theme} {COLOUR_NOTES[group.dark].title} {label}"
                value={value[channel]}
                oninput={(event) =>
                  push({ [key]: { ...value, [channel]: Number(event.currentTarget.value) } })}
              />
              <input
                class="num"
                type="number"
                min="0"
                {max}
                step={max === 1 ? 0.01 : 1}
                aria-label="{theme} {COLOUR_NOTES[group.dark].title} {label} value"
                value={value[channel]}
                oninput={(event) =>
                  push({ [key]: { ...value, [channel]: Number(event.currentTarget.value) } })}
              />
              {@render undo(label, moved, () =>
                push({ [key]: { ...value, [channel]: base[channel] } }))}
            </div>
          {/each}
          <div class="swatch" style:background={rgba(value)}>{rgba(value)}</div>
        </section>
      {/each}

      <section>
        <h2>Blur edge</h2>
        <p class="note">
          Upstream chooses per pixel between a sharp and a pre-blurred copy of the backdrop.
          One backdrop filter cannot vary across a pane, so what this switches is the same
          question about the same two images: on, the rim lenses the blurred backdrop; off, it
          lenses the sharp one and the blur that follows softens the result.
        </p>
        <div class="row toggle" class:moved={s.blurEdge !== STUDIO.blurEdge}>
          <label class="check">
            <input
              type="checkbox"
              checked={s.blurEdge}
              onchange={(event) => push({ blurEdge: event.currentTarget.checked })}
            />
            <span class="name">Blur at the edge</span>
          </label>
          {@render undo("Blur at the edge", s.blurEdge !== STUDIO.blurEdge, () => revert("blurEdge"))}
        </div>
      </section>

      <section>
        <h2>Not here</h2>
        <p class="note">Controls its editor has that a header has nowhere to put.</p>
        <ul class="absent">
          {#each ABSENT as [names, why]}
            <li><code>{names}</code> — {why}</li>
          {/each}
        </ul>
      </section>

      <section class="export">
        <h2>Export</h2>
        <p class="note">
          Paste this back into the conversation to have it become the shipped material. Studio
          defaults puts the nine settings upstream has no control for — the saturation, the count
          pane's height, the three placement numbers, the control fill, the control text and the
          count's own two colours — back to what ships, there being nothing else for them to go
          back to.
        </p>
        <div class="buttons">
          <button class="ghost" onclick={() => reset(SHIPPED)}>Shipped</button>
          <button class="ghost" onclick={() => reset(STUDIO)}>Studio defaults</button>
          <button class="ghost" onclick={copy}>{copied ? "Copied" : "Copy"}</button>
        </div>
        <textarea readonly rows="16" value={json}></textarea>
      </section>
    </div>
  {/if}
</div>

<style>
  /* Opaque, and its own surface colours rather than the palette's glass: this
     panel must not be the thing you end up looking at. Bottom right, because
     the bar is at the top and the two must never overlap. */
  .tuner {
    position: fixed;
    right: var(--page-inset);
    bottom: var(--page-inset);
    z-index: 40;
    width: 340px;
    max-height: calc(
      100vh - var(--header-top) - var(--header-h) - var(--s-2) - var(--page-inset)
    );
    display: flex;
    flex-direction: column;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: var(--r-2);
    box-shadow: 0 18px 48px -18px rgba(0, 0, 0, 0.7);
    font-size: var(--fs-200);
  }

  .tuner.folded {
    width: auto;
  }

  .head {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    padding: var(--s-2) var(--s-2) var(--s-2) var(--s-3);
    border-bottom: 1px solid var(--line-soft);
  }

  .tuner.folded .head {
    border-bottom: none;
  }

  .src {
    flex: 1;
    color: var(--dim);
    font-size: var(--fs-100);
  }

  .fold {
    width: 22px;
    min-height: 22px;
    padding: 0;
    line-height: 1;
  }

  .body {
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: var(--s-3);
  }

  section {
    padding-bottom: var(--s-4);
  }

  h2 {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: var(--fs-100);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-2);
    margin: 0 0 4px;
  }

  .which {
    letter-spacing: 0;
    text-transform: none;
    color: var(--dim);
  }

  .note {
    margin: 0 0 var(--s-2);
    color: var(--dim);
    font-size: var(--fs-100);
    line-height: 1.45;
  }

  .row {
    display: grid;
    grid-template-columns: 84px 1fr 58px 20px;
    align-items: center;
    gap: 6px;
    min-height: 24px;
  }

  .lead {
    margin-bottom: var(--s-3);
  }

  .name {
    color: var(--text-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* A value that is no longer the studio's own. The page is about departures
     from a published default, so it says which ones you have made. */
  .row.moved .name {
    color: var(--accent);
  }

  input[type="range"] {
    width: 100%;
    accent-color: var(--accent);
  }

  .num {
    width: 100%;
    min-width: 0;
    background: var(--sunken);
    border: 1px solid var(--line-soft);
    border-radius: var(--r-1);
    color: var(--text);
    font: inherit;
    font-variant-numeric: tabular-nums;
    padding: 1px 4px;
  }

  .toggle {
    grid-template-columns: 1fr 20px;
  }

  .check {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  /* Held in its own column and only ever made invisible, so a value going back
     to its default does not shift the row it is in. */
  .undo {
    width: 20px;
    min-height: 20px;
    padding: 0;
    border-radius: var(--r-1);
    color: var(--dim);
    font-size: 13px;
    line-height: 1;
  }

  .undo:hover {
    color: var(--accent);
  }

  .undo.idle {
    visibility: hidden;
  }

  /* Not `chip`: app.css has a global `.chip` for the tile's corner override
     button, absolutely positioned in a tile's top right, and a scoped selector
     does not shield a component from a global one that also matches. */
  .swatch {
    margin-top: 6px;
    padding: 4px 8px;
    border: 1px solid var(--line);
    border-radius: var(--r-1);
    font-variant-numeric: tabular-nums;
    text-align: center;
    /* The swatch is drawn at the tint's own alpha over the panel, so a low
       alpha reads as almost nothing — which is the honest thing for it to do. */
    color: var(--text);
  }

  .absent {
    margin: 0;
    padding-left: 1.1em;
    color: var(--dim);
    font-size: var(--fs-100);
    line-height: 1.5;
  }

  .absent code {
    color: var(--text-2);
  }

  .buttons {
    display: flex;
    gap: 6px;
    margin-bottom: 6px;
  }

  .ghost {
    min-height: var(--ctl-sm);
    padding: 0 10px;
    border-radius: var(--r-1);
    font-size: var(--fs-100);
  }

  /* One button for three sections, so it needs the gap a section's own padding
     would otherwise have given it. Not `side`, for the same reason `.swatch` is
     not `chip`: app.css's global `.side` is triage's fixed 340px sidebar. */
  .flip {
    margin-bottom: var(--s-4);
  }

  textarea {
    width: 100%;
    background: var(--sunken);
    border: 1px solid var(--line-soft);
    border-radius: var(--r-1);
    color: var(--text);
    font-family: ui-monospace, "Cascadia Mono", Menlo, monospace;
    font-size: 11px;
    line-height: 1.4;
    padding: var(--s-2);
    resize: vertical;
  }
</style>
