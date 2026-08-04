<script>
  // Triage is a mode of the grid, not a second app: one shell, one virtualised
  // sheet, one paging contract, one reveal. The sidebar and the rule bar are
  // what triage adds, and they are the surface that goes away when triage is
  // done.
  import { onMount, untrack } from "svelte";
  import { api, count, debounce, sequencer } from "./lib/api.js";
  import { PHOTOS_ROOT, SCREENS, decisionOf, folderOf, isUnder } from "./lib/screens.js";
  import Counts from "./lib/Counts.svelte";
  import Probe from "./lib/Probe.svelte";
  import RuleBar from "./lib/RuleBar.svelte";
  import Rules from "./lib/Rules.svelte";
  import Sheet from "./lib/Sheet.svelte";
  import Table from "./lib/Table.svelte";
  import Tree from "./lib/Tree.svelte";

  let mode = $state("triage");
  let index = $state(0);
  let root = $state(null); // screen 6's drill-down
  let rows = $state([]);
  let picked = $state(null);
  let candidate = $state(null);
  // The checkbox selection, by row key, and the box the last click landed on —
  // shift-click extends from it. A new Set on every change rather than a
  // mutation: $state does not proxy a Set, so reassignment is what makes the
  // boxes redraw.
  let checked = $state(new Set());
  let anchor = $state(null);
  let counts = $state(null);
  let files = $state(null);
  let filesAt = $state(null);
  let filesStale = $state(false);
  let busy = $state(false);
  let saving = $state(false);
  let loadingRows = $state(false);
  let sheet = $state({ loading: false, count: 0, exhausted: false, total: null });
  let failed = $state(null);
  // Bumped by every write that changes the rule set, which is the tree's signal
  // to re-cost every node it has open. A counter rather than a reload call so the
  // tree keeps its own expansion state and App does not have to know it.
  let treeVersion = $state(0);

  const screen = $derived(SCREENS[index]);
  const showTable = $derived(screen.table !== false);
  // Whether the sidebar offers something to choose from — the aggregate table on
  // most screens, the directory tree on screen 8. Screen 7 has neither, and that
  // is what makes its sheet the remainder rather than a selection, so the sheet
  // condition is about the picker and not about the table.
  const showPicker = $derived(showTable || screen.tree === true);
  const showSheet = $derived(screen.sheet !== false && (candidate !== null || !showPicker));
  // Changing this is what tells the sheet to start over. The screen is in it
  // because two screens can produce the same predicate and still be different
  // places to be.
  const sheetKey = $derived(`${mode}:${index}:${JSON.stringify(candidate)}`);

  // What a bulk exclude would actually write. Not simply the checked rows: one
  // the saved set already excludes is dropped here, because a second identical
  // rule decides nothing and the order is the thing you have to be able to read.
  // Derived so the button can say the honest number before you press it.
  const pending = $derived(
    screen.rule === false || checked.size === 0
      ? []
      : rows
          .filter((row) => checked.has(row.key))
          .map((row) => screen.toRule(row, root))
          .filter((term) => term && decisionOf(counts?.rules ?? [], term) !== "exclude"),
  );

  // Every folder the saved set already excludes, lowercased and without a
  // trailing separator — the form the tiles' folder chips compare against. Taken
  // from the rules rather than tracked separately, so a folder excluded from
  // screen 6's table and one excluded from a tile are the same fact.
  const excludedDirs = $derived(
    (counts?.rules ?? [])
      .filter((rule) => rule.decision === "exclude" && rule.term?.column === "dir_under")
      .map((rule) =>
        String(rule.term.value)
          .replace(/[\\/]+$/, "")
          .toLowerCase(),
      ),
  );

  const runCounts = sequencer();

  function fail(err) {
    failed = String(err);
  }

  async function guard(work) {
    try {
      failed = null;
      return await work();
    } catch (err) {
      fail(err);
      return null;
    }
  }

  // --- the numbers ---------------------------------------------------------

  // ~270-360 ms of SQL over the full corpus, so this is debounced and
  // sequenced: a slow response must never overwrite a newer one, which is the
  // failure you only see when you type fast enough to overlap two of them.
  const recount = debounce(() => {
    busy = true;
    guard(async () => {
      const at = candidate?.at === "end" || candidate?.at === undefined ? undefined : 0;
      const { stale, value } = await runCounts(() => api.counts(candidate, at));
      if (!stale) counts = value;
    }).finally(() => {
      busy = false;
    });
  }, 220);

  // ~25 s measured against the ~2.9 s on record, and it is the honest "how
  // many photographs survive". Never on a keystroke, never following the
  // candidate — it reports the saved rule set, which is also why it is not
  // re-fetched per screen: it does not vary by screen.
  async function recountFiles() {
    files = "loading";
    const value = await guard(() => api.files());
    files = value;
    filesStale = false;
    filesAt = new Date().toLocaleTimeString();
  }

  // --- loading a screen ----------------------------------------------------

  async function loadRows(live = false) {
    if (!showTable) {
      rows = [];
      return;
    }
    loadingRows = true;
    const params = screen.name === "source_folder" && root ? { root } : {};
    if (live) params.live = "1";
    const body = await guard(() => api.screen(screen.name, params));
    rows = body?.rows ?? [];
    loadingRows = false;
  }

  // Changing screen starts over. `untrack` is load-bearing: `recount.now()`
  // reads `candidate` synchronously and this body *writes* it, so without it
  // the effect depends on the value it clears — picking a row set a candidate,
  // which re-ran this, which set it straight back to null.
  //
  // `files` is deliberately untouched: it reports the saved rule set, so
  // changing screen cannot change it, and re-fetching would spend 25 s arriving
  // back at the number already on screen.
  $effect(() => {
    void index;
    untrack(() => {
      picked = null;
      candidate = null;
      root = null;
      clearChecked();
      loadRows();
      recount.now();
    });
  });

  // Screen 6's drill-down reloads the table and nothing else. It is a separate
  // effect because drilling *into* a root also selects that root as a candidate,
  // and one combined effect would clear the candidate it had just been given.
  $effect(() => {
    void root;
    untrack(() => {
      clearChecked(); // the rows are a different level; the keys do not carry over
      loadRows();
    });
  });

  onMount(recountFiles);

  // --- editing ------------------------------------------------------------

  function pick(row) {
    if (screen.sheet === false) return;
    // Screen 6's first level is a drill-down as well as a selection: it loads
    // the second level, and offers the root itself as a rule at the same time.
    if (screen.drill && !root) {
      picked = row.key;
      candidate = { ...screen.toRule(row, null), decision: "exclude", at: "end" };
      root = row.key;
      return;
    }
    picked = row.key;
    candidate = { ...screen.toRule(row, root), decision: "exclude", at: "end" };
    recount();
  }

  // Shift-click extends from the last box clicked and applies *that* click's
  // outcome across the range — tick a box, shift-click twenty rows down, twenty
  // rows are ticked; do it from a ticked box and the range clears. The anchor is
  // a row key rather than an index so a reloaded table cannot silently reinterpret
  // it: if the key has gone, this is an ordinary single toggle.
  function check(row, i, shift) {
    const next = new Set(checked);
    const want = !next.has(row.key);
    const from = shift && anchor !== null ? rows.findIndex((r) => r.key === anchor) : -1;
    const [lo, hi] = from < 0 ? [i, i] : from < i ? [from, i] : [i, from];
    for (let at = lo; at <= hi; at++) {
      if (want) next.add(rows[at].key);
      else next.delete(rows[at].key);
    }
    checked = next;
    anchor = row.key;
  }

  function clearChecked() {
    checked = new Set();
    anchor = null;
  }

  function edit(next) {
    candidate = next;
    picked = null; // it no longer corresponds to a row
    recount();
  }

  function clearCandidate(alsoRoot = false) {
    candidate = null;
    picked = null;
    if (alsoRoot) root = null;
    recount.now();
  }

  // --- writes -------------------------------------------------------------

  // What every rule write has to do afterwards, in one place. The tree is the
  // reason it is one place: it re-costs on `treeVersion`, and a write that
  // forgot to bump it would leave folders on screen that the rules had already
  // taken — a stale tree reads as a real one.
  //
  // Not called by `override`: an override decides bytes, and the tree, like
  // every other screen's aggregate, is the rules' verdict alone.
  async function afterRuleWrite() {
    filesStale = true; // the distinct-content number now says so on its face
    treeVersion++;
    await loadRows();
    recount.now();
  }

  async function confirm() {
    if (!candidate) return;
    saving = true;
    const at = candidate.at === "end" ? undefined : 0;
    const ok = await guard(() =>
      api.addRule(
        {
          column: candidate.column,
          op: candidate.op,
          value: candidate.value,
          decision: candidate.decision ?? "exclude",
          note: `screen ${screen.id} ${screen.title}`,
        },
        at,
      ),
    );
    saving = false;
    if (!ok) return;
    candidate = null;
    picked = null;
    await afterRuleWrite();
  }

  // The checkbox selection, as one exclude rule per row at the end of the order.
  // Sequential and not parallel: rules evaluate top-down, first match wins, so
  // the order they land in is part of what they mean, and N concurrent POSTs
  // would decide it by arrival. A failure stops the run rather than pressing on —
  // what already landed stands, and every one of them undoes by deleting its row.
  async function excludeChecked() {
    const terms = pending;
    if (!terms.length) {
      clearChecked();
      return;
    }
    saving = true;
    for (const term of terms) {
      const ok = await guard(() =>
        api.addRule({
          column: term.column,
          op: term.op,
          value: term.value,
          decision: "exclude",
          note: `screen ${screen.id} ${screen.title}`,
        }),
      );
      if (!ok) break;
    }
    saving = false;
    clearChecked();
    candidate = null;
    picked = null;
    await afterRuleWrite();
  }

  // One exclude rule for one folder, subfolders included, at the end of the
  // order — the default settings, with no candidate step and no confirmation.
  // Exactly the write screen 6's rows make; what the tile chip and the tree's ✕
  // add is reaching it from a photograph and from the folder structure itself.
  // It undoes by deleting the rule, like every other decision here.
  //
  // `isUnder` and not `decisionOf` because a folder inside an already-excluded
  // tree needs no second rule either.
  async function excludeDir(folder) {
    if (!folder || isUnder(excludedDirs, folder)) return;
    saving = true;
    const ok = await guard(() =>
      api.addRule({
        column: "dir_under",
        op: "=",
        value: folder,
        decision: "exclude",
        note: `screen ${screen.id} ${screen.title}`,
      }),
    );
    saving = false;
    if (!ok) return;
    await afterRuleWrite();
  }

  // The tile's folder chip: the directory the file you are looking at sits in.
  // The only way to act on screen 5's "order the remainder for review, folder by
  // folder". The chip's own title names the folder before you press it, and the
  // tiles in it go red as the counts come back.
  const excludeFolder = (item) => excludeDir(folderOf(item.p ?? ""));

  // The tree's ✕. `row.key` is the directory, already in the form a `dir_under`
  // rule stores, and the row is gone from the tree once the counts come back.
  const excludeTreeFolder = (row) => excludeDir(row.key);

  async function removeRule(rule) {
    saving = true;
    await guard(() => api.deleteRule(rule.id));
    saving = false;
    await afterRuleWrite();
  }

  async function moveRule(rule, to) {
    saving = true;
    await guard(() => api.moveRule(rule.id, to));
    saving = false;
    await afterRuleWrite();
  }

  async function override(item, decision) {
    const body = await guard(() => api.override(item.s, decision));
    if (!body) return item.o ?? null;
    filesStale = true;
    recount();
    return body.decision;
  }

  // --- the sheet ----------------------------------------------------------

  function fetchPage(cursor) {
    if (mode === "grid") {
      return api.photos({ kind: "image", limit: 500, ...(cursor || {}) });
    }
    return api.page(candidate, cursor);
  }

  function activate(item) {
    guard(() => (mode === "grid" ? api.revealPhoto(item.id) : api.revealOrigin(item.id)));
  }
</script>

<div class="shell">
  <aside class="side">
    <div class="modes">
      <button class:on={mode === "triage"} onclick={() => (mode = "triage")}>triage</button>
      <button class:on={mode === "grid"} onclick={() => (mode = "grid")}>grid</button>
    </div>

    {#if mode === "triage"}
      <nav>
        {#each SCREENS as entry, i}
          <button class="nav" class:on={i === index} onclick={() => (index = i)}>
            <span class="n">{entry.id}</span>{entry.title}
          </button>
        {/each}
      </nav>

      {#if showTable}
        <div class="tablehead">
          {#if screen.drill && root}
            <button onclick={clearCandidate.bind(null, true)}>← all roots</button>
            <span class="muted">inside {root}</span>
          {:else if screen.relive}
            <button onclick={() => loadRows(true)} title="Costs 1.9-3.2 s: the top 50 segments span 1,953,553 of the 2,894,845 rows in the segment index.">
              {screen.relive}
            </button>
          {/if}
        </div>
        {#if loadingRows}
          <div class="muted pad">loading…</div>
        {/if}
        <Table
          {rows}
          {screen}
          {root}
          {checked}
          rules={counts?.rules ?? []}
          selected={picked}
          onpick={pick}
          oncheck={check}
        />
      {/if}

      {#if screen.tree}
        <Tree
          root={PHOTOS_ROOT}
          version={treeVersion}
          {excludedDirs}
          selected={picked}
          busy={saving}
          onload={(path) => guard(() => api.tree(path))}
          onpick={pick}
          onexclude={excludeTreeFolder}
        />
      {/if}

      <Rules
        rules={counts?.rules ?? []}
        unmatched={counts?.unmatched ?? null}
        busy={saving}
        ondelete={removeRule}
        onmove={moveRule}
      />
    {:else}
      <p class="muted pad">
        The read-only grid: every photo, newest first, click to reveal in Explorer.
      </p>
    {/if}
  </aside>

  <div class="main">
    {#if mode === "triage"}
      <h1>{screen.id} · {screen.title}</h1>
      <p class="blurb">{screen.blurb}</p>
      {#if screen.note}<p class="blurb">{screen.note}</p>{/if}

      {#if screen.name === "dimensions"}
        <Probe {screen} />
      {/if}

      <Counts {counts} {files} {filesAt} stale={filesStale} {candidate} {busy} onfiles={recountFiles} />

      {#if checked.size}
        <div class="bulkbar">
          <strong>{count(checked.size)} ticked</strong>
          <button onclick={excludeChecked} disabled={saving || !pending.length}>
            {saving ? "saving…" : `Exclude ${count(pending.length)}`}
          </button>
          <button onclick={clearChecked} disabled={saving}>Clear selection</button>
          <span class="muted">
            {#if !pending.length}
              already excluded — nothing left to write
            {:else}
              one exclude rule each, at the end of the order{pending.length < checked.size
                ? ` · ${count(checked.size - pending.length)} already excluded, skipped`
                : ""}
            {/if}
          </span>
        </div>
      {/if}

      <RuleBar
        {candidate}
        {screen}
        {saving}
        onedit={edit}
        onconfirm={confirm}
        onclear={clearCandidate}
      />

      {#if showSheet}
        <div class="sheetbar muted">
          {count(sheet.count)}{sheet.total ? " of " + count(sheet.total) : ""} loaded{sheet.exhausted
            ? " · all of them"
            : ""}{sheet.loading ? " · loading…" : ""}
          <span class="hint">click a tile to reveal it · click the corner chip to override</span>
        </div>
      {:else if screen.sheet === false}
        <p class="muted">
          No contact sheet here — you cannot look at a .d.ts. This screen is the table.
        </p>
      {/if}
    {/if}

    {#if showSheet || mode === "grid"}
      <Sheet
        key={sheetKey}
        {fetchPage}
        total={mode === "grid" ? null : (counts?.page_paths ?? null)}
        triage={mode === "triage"}
        {excludedDirs}
        onActivate={activate}
        onOverride={override}
        onExcludeFolder={excludeFolder}
        onState={(state) => (sheet = { ...sheet, ...state })}
      />
    {/if}
  </div>
</div>

{#if failed}
  <div class="status">{failed}</div>
{/if}

<style>
  .modes {
    display: flex;
    gap: 4px;
    margin-bottom: 10px;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: 12px;
  }

  .nav {
    text-align: left;
    background: none;
    border-color: transparent;
  }

  .nav .n {
    display: inline-block;
    width: 1.6em;
    color: var(--dim);
  }

  button.on {
    background: #23303f;
    border-color: var(--accent);
  }

  .tablehead {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }

  /* Sits with the rule bar rather than by the table, because this is the same
     kind of thing the rule bar's Confirm is: the write, apart from the browsing.
     The table scrolls in its own fixed sidebar, so ticking boxes does not move
     this. */
  .bulkbar {
    display: flex;
    gap: 8px;
    align-items: baseline;
    flex-wrap: wrap;
    padding: 5px 7px;
    margin-bottom: 2px;
    font-size: 12px;
    border: 1px solid var(--accent);
    border-radius: 3px;
    background: #1a222d;
  }

  .sheetbar {
    display: flex;
    gap: 12px;
    align-items: baseline;
    padding: 4px 0 6px;
    font-size: 11px;
    flex-wrap: wrap;
  }

  .hint {
    color: #55555e;
  }

  .pad {
    padding: 4px 0;
  }

  .muted {
    color: var(--dim);
  }
</style>
