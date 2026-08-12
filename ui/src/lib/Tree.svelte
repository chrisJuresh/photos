<script>
  // What is left of the directory structure, one node at a time.
  //
  // Lazy by node rather than a tree fetched up front: there are 315,680
  // directories and the server costs what the opened subtree costs, so a whole
  // tree would be both the slowest possible request and mostly unread.
  //
  // A folder is here only while the rules still keep something inside it. That
  // is the screen's premise rather than a detail — excluding a folder makes it
  // disappear, so the tree is a shrinking list of places still to decide, and
  // there is no "0 paths" row to skip past.
  import { bytes, count } from "./api.js";
  import { isUnder } from "./screens.js";

  let {
    root,
    // Reloads every open node. Bumped by the parent after a write, because a
    // saved rule changes what every one of them holds.
    version = 0,
    excludedDirs = [],
    picked = null,
    busy = false,
    onload,
    onpick,
    onexclude,
  } = $props();

  // path -> the server's node payload. A plain Map reassigned rather than
  // mutated: $state does not proxy a Map, so reassignment is what redraws.
  let nodes = $state(new Map());
  let open = $state(new Set());
  let loading = $state(new Set());
  let failed = $state(new Set());

  async function fetchNode(path) {
    loading = new Set(loading).add(path);
    const node = await onload(path);
    const next = new Map(nodes);
    const gone = new Set(failed);
    if (node) {
      next.set(path, node);
      gone.delete(path);
    } else {
      // Left in `open` deliberately: the row keeps its twisty and says it
      // failed, so retrying is one click rather than a re-navigation.
      gone.add(path);
    }
    nodes = next;
    failed = gone;
    loading = new Set([...loading].filter((p) => p !== path));
  }

  function toggle(path) {
    if (open.has(path)) {
      open = new Set([...open].filter((p) => p !== path));
      return;
    }
    open = new Set(open).add(path);
    if (!nodes.has(path)) fetchNode(path);
  }

  // The root opens itself, and every write re-costs whatever is open. Reloaded
  // rather than dropped so the shape you were reading stays put underneath you:
  // a node whose contents have gone entirely simply comes back with no children.
  let applied = -1;
  $effect(() => {
    const at = version;
    if (at === applied) return;
    applied = at;
    if (!open.has(root)) open = new Set(open).add(root);
    for (const path of open) fetchNode(path);
  });

  /** The rows to draw, flattened depth-first so the markup is one loop.
   *
   * The directory is carried as `key`, not `path`, because that is the field
   * `screens.js` reads to build a rule — so a tree row goes through the parent's
   * ordinary `pick` unchanged, and the tree needs no branch there.
   */
  const rows = $derived.by(() => {
    const out = [];
    const walk = (path, name, depth, paths, size, deeper) => {
      const node = nodes.get(path);
      const expanded = open.has(path);
      out.push({
        key: path,
        name,
        depth,
        paths,
        bytes: size,
        deeper,
        expanded,
        here: node?.here ?? null,
        truncated: Boolean(node?.truncated),
        loading: loading.has(path),
        failed: failed.has(path),
        // A folder inside an already-excluded tree needs no second rule, which
        // is the same test the tile's folder chip applies.
        excluded: isUnder(excludedDirs, path),
      });
      if (!expanded || !node) return;
      for (const child of node.children) {
        walk(child.path, child.name, depth + 1, child.paths, child.bytes, child.deeper);
      }
    };
    const top = nodes.get(root);
    const kept = top
      ? top.children.reduce((sum, child) => sum + child.paths, 0) + top.here.paths
      : 0;
    const keptBytes = top
      ? top.children.reduce((sum, child) => sum + child.bytes, 0) + top.here.bytes
      : 0;
    walk(root, root, 0, kept, keptBytes, true);
    return out;
  });

  // Indentation stops growing after this depth. The sidebar is 360px, and a tree
  // that indents forever pushes the name out of it; past here the parent is
  // still on screen directly above, so the guide line carries the nesting.
  const MAX_INDENT = 8;
</script>

<div class="tree">
  {#each rows as row (row.key)}
    <div class="row" class:picked={picked === row.key} class:gone={row.excluded}>
      <span class="indent" style:width="{Math.min(row.depth, MAX_INDENT) * 11}px"></span>

      {#if row.deeper}
        <button
          class="twisty"
          onclick={() => toggle(row.key)}
          aria-expanded={row.expanded}
          aria-label="{row.expanded ? 'collapse' : 'expand'} {row.name}"
          title={row.expanded ? "collapse" : "expand"}
        >{row.loading ? "·" : row.expanded ? "▾" : "▸"}</button>
      {:else}
        <span class="twisty leaf">·</span>
      {/if}

      <!-- Clicking the name is the read: it loads the contact sheet for this
           whole subtree, which is the same set the exclude button would take.
           Deliberately not also the expander — one click must not do both.

           The root is a label and not a choice. Selecting it would fill the rule
           bar with `dir_under = G:\photos`, one Confirm from excluding the entire
           library — the same offer `folderOf` refuses to make from a tile. -->
      {#if row.depth === 0}
        <span class="name root">{row.key}</span>
      {:else}
        <button class="name" onclick={() => onpick(row)} title="Show every kept file under {row.key}">
          {row.name}
        </button>
      {/if}

      <span class="num">{count(row.paths)}</span>
      <span class="num size">{bytes(row.bytes)}</span>

      <!-- One exclude rule for this folder, subfolders included, at the end of
           the order. The default settings, with no candidate step: the title
           names the folder before you press it, and it undoes by deleting the
           rule like every other decision here. -->
      <button
        class="drop"
        disabled={busy || row.excluded || row.depth === 0}
        onclick={() => onexclude(row)}
        title={row.depth === 0
          ? "The library root is not excludable from here."
          : row.excluded
            ? "already excluded"
            : `Exclude everything under ${row.key}, subfolders included — one exclude rule at the end of the order`}
      >✕</button>
    </div>

    {#if row.expanded && row.failed}
      <div class="note err" style:padding-left="{Math.min(row.depth, MAX_INDENT) * 11 + 18}px">
        could not load — click the arrow to retry
      </div>
    {:else if row.expanded && row.here && row.here.paths > 0}
      <div class="note" style:padding-left="{Math.min(row.depth, MAX_INDENT) * 11 + 18}px">
        {count(row.here.paths)} directly here · {bytes(row.here.bytes)}
      </div>
    {/if}

    {#if row.truncated}
      <div class="note err" style:padding-left="{Math.min(row.depth, MAX_INDENT) * 11 + 18}px">
        showing the largest 200 subfolders — there are more
      </div>
    {/if}
  {/each}
</div>

<style>
  .tree {
    font-size: var(--fs-200);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 3px;
    border-bottom: 1px solid var(--line-soft);
  }

  .row:hover {
    background: var(--raised);
  }

  .row.picked {
    background: var(--picked);
  }

  /* An excluded folder can still be here when an include rule below it keeps
     part of the subtree. Dimming says why its exclude button is disabled. */
  .row.gone .name {
    color: var(--dim);
    text-decoration: line-through;
  }

  .indent {
    flex: none;
  }

  /* Sized in full rather than inheriting app.css's button chrome, whose padding
     would make each of these 60px wide. */
  .twisty {
    flex: none;
    width: 16px;
    min-height: 0;
    padding: 0;
    font: 10px/20px var(--font);
    text-align: center;
    color: var(--dim);
    background: none;
    border: none;
  }

  .twisty:hover:not(:disabled) {
    color: var(--text);
    background: none;
    border: none;
  }

  .leaf {
    display: inline-block;
    color: var(--faint);
  }

  .name {
    flex: 1;
    min-width: 0;
    min-height: 0;
    justify-content: flex-start;
    padding: 2px 3px;
    font: var(--fs-200) / 1.4 var(--mono);
    text-align: left;
    color: inherit;
    background: none;
    border: none;
    border-radius: 3px;
    word-break: break-all;
  }

  .name:hover:not(.root) {
    background: none;
    border: none;
    color: var(--accent);
  }

  .root {
    color: var(--dim);
  }

  .num {
    flex: none;
    text-align: right;
    white-space: nowrap;
    color: var(--dim);
    font-size: var(--fs-100);
  }

  .size {
    min-width: 5.5em;
  }

  .drop {
    flex: none;
    min-height: 0;
    padding: 1px 6px;
    font-size: var(--fs-100);
    line-height: 1.5;
    color: var(--dim);
    background: none;
    border-color: transparent;
  }

  .drop:hover:not(:disabled) {
    color: #fff;
    background: var(--drop);
    border-color: var(--drop);
  }

  .note {
    font-size: var(--fs-100);
    color: var(--dim);
    padding-bottom: 2px;
  }

  .err {
    color: var(--drop);
  }
</style>
