<script>
  // A thin wrapper around sheet.js. Svelte owns this element's existence and
  // nothing inside it: every tile is created, recycled and positioned by the
  // imperative core, which is the code step 6 measured. `key` changing is the
  // signal to start over on a new predicate.
  import { onMount } from "svelte";
  import { createSheet } from "./sheet.js";
  import { thumbHashToDataURL } from "./thumbhash.js";
  import { PHOTOS_ROOT } from "./screens.js";

  let {
    key = "",
    fetchPage,
    triage = false,
    onActivate = () => {},
    onOverride = async () => null,
    onState = () => {},
  } = $props();

  let canvas = $state(null);
  let sentinel = $state(null);
  let instance = null;
  let started = "";

  // The chip cycles through the three states an override can be in. `clear`
  // deletes the row rather than storing a third value, so "the rules decide
  // this one" stays the absence of a decision instead of becoming one.
  const NEXT = { null: "exclude", exclude: "include", include: "clear" };

  // The full path is 60-100 characters of which the last 40 identify the file.
  // Truncating in JS rather than with a bidi CSS trick, which mangles the
  // leading backslash of a Windows path.
  function shortPath(path) {
    const relative = path.toLowerCase().startsWith(PHOTOS_ROOT.toLowerCase())
      ? path.slice(PHOTOS_ROOT.length + 1)
      : path;
    return relative.length > 64 ? "…" + relative.slice(-64) : relative;
  }

  function extend(el) {
    const label = document.createElement("div");
    label.className = "tile-path";
    el.appendChild(label);
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.type = "button";
    el.appendChild(chip);
  }

  function fill(el, item) {
    const label = el.querySelector(".tile-path");
    if (label) label.textContent = item.p ? shortPath(item.p) : "";
    const chip = el.querySelector(".chip");
    if (chip) {
      chip.dataset.state = item.o || "none";
      chip.textContent = item.o === "exclude" ? "drop" : item.o === "include" ? "keep" : "·";
      chip.title =
        item.o === "exclude"
          ? "overridden: excluded — click to keep"
          : item.o === "include"
            ? "overridden: kept — click to clear"
            : "no override; the rules decide this one — click to drop";
    }
  }

  onMount(() => {
    instance = createSheet(canvas, sentinel, {
      fetchPage: (cursor) => fetchPage(cursor),
      thumbHash: thumbHashToDataURL,
      extend: triage ? extend : undefined,
      fill: triage ? fill : undefined,
      onState: (state) => onState(state),
      activate: async (item, event, tile) => {
        if (!event.target.closest(".chip")) {
          onActivate(item);
          return;
        }
        const decision = NEXT[item.o ?? "null"];
        item.o = await onOverride(item, decision);
        fill(tile, item);
      },
    });
    started = key;
    return () => instance?.destroy();
  });

  $effect(() => {
    // Read `key` first so the effect subscribes to it before any early return.
    const next = key;
    if (!instance || next === started) return;
    started = next;
    instance.reset();
  });
</script>

<main id="canvas" bind:this={canvas}>
  <div id="sentinel" bind:this={sentinel}></div>
</main>
