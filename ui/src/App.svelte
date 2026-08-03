<script>
  // Triage is a mode of the grid, not a second app: one shell, one virtualised
  // sheet, one paging contract, one reveal. The sidebar and the rule bar are
  // what triage adds, and they are the surface that goes away when triage is
  // done.
  import { onMount, untrack } from "svelte";
  import { api, count, debounce, sequencer } from "./lib/api.js";
  import { SCREENS } from "./lib/screens.js";
  import Counts from "./lib/Counts.svelte";
  import Probe from "./lib/Probe.svelte";
  import RuleBar from "./lib/RuleBar.svelte";
  import Rules from "./lib/Rules.svelte";
  import Sheet from "./lib/Sheet.svelte";
  import Table from "./lib/Table.svelte";

  let mode = $state("triage");
  let index = $state(0);
  let root = $state(null); // screen 6's drill-down
  let rows = $state([]);
  let picked = $state(null);
  let candidate = $state(null);
  let counts = $state(null);
  let files = $state(null);
  let filesAt = $state(null);
  let filesStale = $state(false);
  let busy = $state(false);
  let saving = $state(false);
  let loadingRows = $state(false);
  let sheet = $state({ loading: false, count: 0, exhausted: false });
  let failed = $state(null);

  const screen = $derived(SCREENS[index]);
  const showTable = $derived(screen.table !== false);
  const showSheet = $derived(screen.sheet !== false && (candidate !== null || !showTable));
  // Changing this is what tells the sheet to start over. The screen is in it
  // because two screens can produce the same predicate and still be different
  // places to be.
  const sheetKey = $derived(`${mode}:${index}:${JSON.stringify(candidate)}`);

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
      loadRows();
      recount.now();
    });
  });

  // Screen 6's drill-down reloads the table and nothing else. It is a separate
  // effect because drilling *into* a root also selects that root as a candidate,
  // and one combined effect would clear the candidate it had just been given.
  $effect(() => {
    void root;
    untrack(loadRows);
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
    filesStale = true; // the distinct-content number now says so on its face
    await loadRows();
    recount.now();
  }

  async function removeRule(rule) {
    saving = true;
    await guard(() => api.deleteRule(rule.id));
    saving = false;
    filesStale = true;
    await loadRows();
    recount.now();
  }

  async function moveRule(rule, to) {
    saving = true;
    await guard(() => api.moveRule(rule.id, to));
    saving = false;
    filesStale = true;
    await loadRows();
    recount.now();
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
        <Table {rows} {screen} selected={picked} onpick={pick} />
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
          {count(sheet.count)} loaded{sheet.exhausted ? " · all of them" : ""}{sheet.loading
            ? " · loading…"
            : ""}
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
        triage={mode === "triage"}
        onActivate={activate}
        onOverride={override}
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
