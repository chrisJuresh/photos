<script>
  // A thin wrapper around sheet.js. Svelte owns this element's existence and
  // nothing inside it: every tile is created, recycled and positioned by the
  // imperative core, which is the code step 6 measured. `key` changing is the
  // signal to start over on a new predicate.
  import { onMount } from "svelte";
  import { createSheet } from "./sheet.js";
  import { thumbHashToDataURL } from "./thumbhash.js";
  import { PHOTOS_ROOT, folderOf, isUnder } from "./screens.js";

  let {
    key = "",
    fetchPage,
    total = null,
    triage = false,
    // The saved rule set's `dir_under` excludes, lowercased. The folder chip is
    // a view of them and not of its own state, so a folder excluded from
    // screen 6's table marks the tiles in it too.
    excludedDirs = [],
    onActivate = () => {},
    onOverride = async () => null,
    onExcludeFolder = () => {},
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
    // Constant, so it is set once per element ever created rather than on every
    // bind. Only the state and the title vary per item.
    const dir = document.createElement("button");
    dir.className = "dirchip";
    dir.type = "button";
    dir.textContent = "dir";
    el.appendChild(dir);
  }

  function fill(el, item) {
    const label = el.querySelector(".tile-path");
    if (label) label.textContent = item.p ? shortPath(item.p) : "";
    const dir = el.querySelector(".dirchip");
    if (dir) {
      const folder = folderOf(item.p ?? "");
      const done = folder !== "" && isUnder(excludedDirs, folder);
      // Disabled rather than hidden when it is already excluded: the tile is
      // still there to be looked at, and the red chip is how you find out why.
      dir.hidden = folder === "";
      dir.disabled = done;
      dir.dataset.state = done ? "exclude" : "none";
      dir.title = done
        ? `already excluded: ${folder}`
        : `exclude everything under ${folder}, subfolders included — one exclude rule at the end of the order`;
    }
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
      activate: async (item, event, tile, at) => {
        // A disabled button dispatches no click at all, so the already-excluded
        // case never arrives here and cannot fall through to the reveal either.
        if (event.target.closest(".dirchip")) {
          onExcludeFolder(item);
          return;
        }
        if (!event.target.closest(".chip")) {
          // The element too, and only for its rect: a stack's overlay emanates
          // from the tile that was clicked, and this is the one moment anything
          // outside the sheet can know where that tile is. Handing over the
          // element rather than a rect keeps the measuring at the point of use
          // and this a pass-through — the sheet does not gain a geometry API.
          //
          // The index too, because the overlay walks from it: "the next tile in
          // the current sort" is the next entry in the sheet's own page order.
          onActivate(item, tile, at);
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

  // Read both props first so the effect subscribes to them before any early
  // return. One effect rather than two, because the order matters: `reset` drops
  // the total along with the rows it sized, so re-applying it has to come after,
  // and two effects would leave that to declaration order.
  //
  // `total` is null in grid mode, which takes it from the page envelope instead.
  $effect(() => {
    const next = key;
    const size = total;
    if (!instance) return;
    if (next !== started) {
      started = next;
      instance.reset();
    }
    instance.setTotal(size);
  });

  // What the overlay needs from the sheet, and the only two things anything
  // outside it may ask of a tile by index. Exported off the instance rather
  // than handed up as callbacks, because both are questions asked at a moment —
  // an arrow press, a close — and neither is state.
  //
  // `walkTo` scrolls the sheet to a tile and mounts it, so the overlay can walk
  // the selection; `focusTile` puts the keyboard back on whichever tile the walk
  // ended on.

  /** @param {number} at */
  export function walkTo(at) {
    return instance?.walkTo(at);
  }

  /** @param {number} at */
  export function focusTile(at) {
    instance?.focus(at);
  }

  // Re-mark the folder chips after a write. `fill` runs when a tile is bound, so
  // without this the tiles already on screen keep the marks they were mounted
  // with. Compared as a value rather than by identity because the counts refresh
  // on every keystroke and hands back a new array each time, and re-binding
  // ~150 tiles for an unchanged rule set is pure work.
  let marked = "";
  $effect(() => {
    const dirs = excludedDirs.join("\n");
    if (!instance || dirs === marked) return;
    marked = dirs;
    instance.refill();
  });
</script>

<main id="canvas" bind:this={canvas}>
  <div id="sentinel" bind:this={sentinel}></div>
</main>
