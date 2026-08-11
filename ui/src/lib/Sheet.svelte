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
    // drawn from them and not from its own state, so a folder excluded from
    // screen 6's table reddens the tiles in it too.
    excludedDirs = [],
    // Grid select mode: whether the tickboxes are shown at all, and the cover
    // ids of the tiles that are selected. Owned by App, exactly as the rule set
    // is — a tile displays them and does not hold them, which is what lets a
    // recycled tile come back selected.
    selecting = false,
    selectedKeys = [],
    onActivate = () => {},
    onOverride = async () => null,
    onExcludeFolder = () => {},
    onState = () => {},
    // The marquee, in three moments. `onSweepStart` is handed the tile the drag
    // pressed on — null on empty canvas — because that tile decides whether the
    // whole drag selects or deselects; `onSweepMove` every tile the box now
    // covers, which is a preview and a commit at once; `onSweepEnd` the release.
    onSweepStart = () => {},
    onSweepMove = () => {},
    onSweepEnd = () => {},
  } = $props();

  let canvas = $state(null);
  let sentinel = $state(null);
  let instance = null;
  let started = "";

  // Selectedness is looked up once per bind, so the set is built once per change
  // rather than scanned per tile — ~150 mounted tiles against a selected set that
  // is however long the reader made it.
  const lookup = $derived(new Set(selectedKeys));

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

  // The grid's tickbox. Added to every tile ever created rather than when select
  // mode turns on: `extend` runs once at creation and a tile outlives the
  // toggle, so what the toggle moves is a class on the canvas and nothing else.
  function extendTick(el) {
    const box = document.createElement("span");
    box.className = "tick";
    el.appendChild(box);
  }

  // Read from the selected set rather than from the tile, which is what lets a
  // tile stay selected through recycling: one scrolled out is released, and the
  // one that comes back is bound here against the set as it stands now.
  function fillTick(el, item) {
    el.dataset.selected = lookup.has(item.id) ? "on" : "off";
  }

  onMount(() => {
    instance = createSheet(canvas, sentinel, {
      fetchPage: (cursor) => fetchPage(cursor),
      thumbHash: thumbHashToDataURL,
      extend: triage ? extend : extendTick,
      fill: triage ? fill : fillTick,
      onState: (state) => onState(state),
      sweepStart: (item, at) => onSweepStart(item, at),
      sweepMove: (swept) => onSweepMove(swept),
      sweepEnd: () => onSweepEnd(),
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
          // outside the sheet can know where that tile is. Still an element and
          // not a rect, so the measuring stays at the point of use and this
          // stays a pass-through — the sheet does not gain a geometry API. The
          // box wanted is the photograph's and not the element's, since a
          // stacked tile is taller than its picture, and `sheet.js` exports
          // `photoRect` to say which is which.
          //
          // The index too, because the overlay walks from it: "the next tile in
          // the current sort" is the next entry in the sheet's own page order.
          //
          // And whether Shift was down — as the one bit it is, rather than as
          // the event, which would put a DOM object above a component whose
          // whole arrangement is that the DOM stays underneath it.
          onActivate(item, tile, at, event.shiftKey);
          return;
        }
        const decision = NEXT[item.o ?? "null"];
        item.o = await onOverride(item, decision);
        fill(tile, item);
      },
    });
    started = key;
    instance.setSweeping(selecting);
    return () => instance?.destroy();
  });

  // Whether a press rubber-bands. The same fact the `.selecting` class on the
  // canvas carries — the tickboxes are shown by CSS and the gesture is armed
  // here, from one prop, so the two cannot disagree about which mode is on.
  //
  // Said twice on purpose, and the mount is the one that cannot go: `instance`
  // is a plain `let` rather than `$state`, so this effect does not re-run when
  // it is assigned. Its first pass has nothing to arm, and a sheet that mounts
  // with select mode already on — leaving triage and coming back, say — would
  // then never be armed at all, because `selecting` is not about to change.
  $effect(() => {
    instance?.setSweeping(selecting);
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
  // the view; `focusTile` puts the keyboard back on whichever tile the walk
  // ended on.

  /** @param {number} at */
  export function walkTo(at) {
    return instance?.walkTo(at);
  }

  /** @param {number} at */
  export function focusTile(at) {
    instance?.focus(at);
  }

  /** The tiles from `a` to `b` inclusive, in sheet order — shift-click's range.
   * @param {number} a
   * @param {number} b */
  export function itemsBetween(a, b) {
    return instance?.itemsBetween(a, b) ?? [];
  }

  // Redraw the folder chips after a write. `fill` runs when a tile is bound, so
  // without this the tiles already on screen keep the state they were mounted
  // with. Compared as a value rather than by identity because the counts refresh
  // on every keystroke and hands back a new array each time, and re-binding
  // ~150 tiles for an unchanged rule set is pure work.
  let dirsBound = "";
  $effect(() => {
    const dirs = excludedDirs.join("\n");
    if (!instance || dirs === dirsBound) return;
    dirsBound = dirs;
    instance.refill();
  });

  // The same for the selected set: a tile already on screen that has just been
  // selected has to say so, rather than waiting to be scrolled away and recycled
  // back in.
  //
  // By identity and not by value, which is the opposite of the rule above and
  // for the reason that rule gives: the folder list is rebuilt on every
  // keystroke whether or not it changed, and this one is derived from `selected`,
  // which is only reassigned when the set actually changes. So identity is already
  // the exact signal — and a marquee makes the difference matter, because a
  // sweep can leave thousands of keys and joining them into a string to compare
  // is then real work on every frame of a drag.
  let keysBound = null;
  $effect(() => {
    const keys = selectedKeys;
    if (!instance || keys === keysBound) return;
    keysBound = keys;
    instance.refill();
  });
</script>

<main id="canvas" class:selecting bind:this={canvas}>
  <div id="sentinel" bind:this={sentinel}></div>
</main>
