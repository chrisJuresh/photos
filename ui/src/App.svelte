<script>
  // Triage is a mode of the grid, not a second app: one shell, one virtualised
  // sheet, one paging contract, one reveal. The sidebar and the rule bar are
  // what triage adds, and they are the surface that goes away when triage is
  // done.
  //
  // The grid is the mode this opens in, and it has no sidebar: its chrome is the
  // fixed header, which carries the filters, the sort, and the way into triage.
  import { onMount, tick, untrack } from "svelte";
  import { api, count, debounce, sequencer } from "./lib/api.js";
  import { PHOTOS_ROOT, SCREENS, decisionOf, folderOf, isUnder } from "./lib/screens.js";
  import Counts from "./lib/Counts.svelte";
  import Header from "./lib/Header.svelte";
  import Overlay from "./lib/Overlay.svelte";
  import Probe from "./lib/Probe.svelte";
  import Rebuild from "./lib/Rebuild.svelte";
  import RuleBar from "./lib/RuleBar.svelte";
  import Rules from "./lib/Rules.svelte";
  import {
    grouping,
    nameOf,
    refresh,
    shareText,
    stackOf,
    sweep,
    tally,
    toggle,
  } from "./lib/select.js";
  import Sheet from "./lib/Sheet.svelte";
  import { photoRect } from "./lib/sheet.js";
  import { remember, restore, settle } from "./lib/stack.js";
  import Table from "./lib/Table.svelte";
  import Tree from "./lib/Tree.svelte";
  import Tuner from "./lib/Tuner.svelte";
  import { step } from "./lib/walk.js";

  // `/tune` is the grid with the material's controls bolted on: the same header
  // over the same photographs, which is the only place the material can honestly
  // be judged. Read once from the path rather than kept in state — there is no
  // way into or out of it except the address bar, deliberately.
  const tuning = location.pathname === "/tune";

  let mode = $state("grid");
  let index = $state(0);
  let root = $state(null); // screen 6's drill-down
  let rows = $state([]);
  let picked = $state(null);
  let candidate = $state(null);
  // Triage's ticked rows, by row key, and the box the last click landed on —
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
  // `total` is the rows the answer holds — covers while stacking is on — and
  // `tiles` the ones behind them, null when a row is already a tile.
  let sheet = $state({ loading: false, count: 0, exhausted: false, total: null, tiles: null });
  let failed = $state(null);
  // Bumped by every write that changes the rule set, which is the tree's signal
  // to re-cost every node it has open. A counter rather than a reload call so the
  // tree keeps its own expansion state and App does not have to know it.
  let treeVersion = $state(0);

  // --- the grid's own state ------------------------------------------------
  // The filter vocabulary, fetched once: the server builds it once per process
  // because it cannot change while a read-only process runs.
  let facets = $state(null);
  // dimension name -> the values it filters on. A dimension absent from here is
  // one nobody has touched, which is not the same as one narrowed to nothing —
  // and both mean "do not send it", so an untouched filter never reaches the URL.
  let filters = $state({});
  let sort = $state("newest");
  // Whether the frames verified to be the same photograph are drawn as one tile.
  // Restored from localStorage rather than defaulted, so the grid opens the way it
  // was left — the only part of the header's state that is remembered, and the
  // reason it is remembered is that it is a preference about the grid rather than
  // a search in it.
  let stacking = $state(restore());
  // The open tile — its frames, the rect they came out of, and where it sits in
  // the sheet's page order — or null. Held here rather than in the sheet because
  // the sheet is not what is open: the overlay floats above it and leaves its
  // rows exactly as packed. The index is what the arrows walk along.
  let opened = $state(null);
  // The sheet component, for the two things the overlay asks of it by index.
  let sheetView = $state(null);
  // Select mode, and the tiles selected in it as `{key, ids}` in the order they
  // were selected. Held here rather than in the sheet for the same reason the
  // overrides are: a tile is recycled and the selection is not, so a tile cannot
  // be what holds it.
  let selecting = $state(false);
  let selected = $state([]);
  // The last tile touched, as an index into the sheet's page order, and what a
  // shift-click extends from. An index rather than an id because the range is
  // "everything between these two in the current sort", and the sheet's order
  // is that sort. Null until something has been touched.
  let selectAnchor = $state(null);
  // The drag in progress, or null: `{from, adding}` — the selected set as it
  // stood when the press landed, and the verdict the tile under the pointer
  // fixed for the whole of it. Both are re-applied on every move, which is what
  // makes the preview live and a tile the box has moved back off revert. One
  // object rather than two variables, so there is no half-set drag to describe.
  // Not `$state`: it decides what a move computes and nothing draws it.
  let dragging = null;

  const screen = $derived(SCREENS[index]);
  const showTable = $derived(screen.table !== false);
  // Whether the sidebar offers something to choose from — the aggregate table on
  // most screens, the directory tree on screen 8. Screen 7 has neither, and that
  // is what makes its sheet the remainder rather than what a picker chose, so the
  // sheet condition is about the picker and not about the table.
  const showPicker = $derived(showTable || screen.tree === true);
  const showSheet = $derived(screen.sheet !== false && (candidate !== null || !showPicker));
  // What the grid asks the server for, and what a filter change comes to. Built
  // once so the sheet key and the request cannot disagree about the view: the
  // key IS the request, so a filter that changes the answer always resets the
  // sheet and one that does not never does.
  // `stack` is in it only while stacking is on, so turning it off leaves a query
  // string with no `stack` in it at all rather than one the server has to read as
  // "off" — and the sheet key below then says the two are different answers, which
  // they are.
  // The two knobs ride with the mode, and only when the reader has moved one: null
  // means whichever assignment the server is pointed at, and a client that spelled
  // that out would be writing down a number ADR 0003 settled and `photolib.browse`
  // owns. Both or neither, because a setting is a pair.
  const gridQuery = $derived({
    sort,
    ...(stacking.on
      ? {
          stack: "on",
          ...(stacking.strictness === null
            ? {}
            : { strictness: String(stacking.strictness), linkage: stacking.linkage }),
        }
      : {}),
    ...Object.fromEntries(
      Object.entries(filters).filter(([, values]) => values.length > 0),
    ),
  });

  // What the sheet needs to draw the tickboxes, and what the header's pane
  // reads. Derived rather than tracked alongside `selected`, so there is one
  // place a tile is selected and nothing to keep in step with it.
  const selectedKeys = $derived(selected.map((entry) => entry.key));
  const selectedTally = $derived(tally(selected));

  // What a selection is a claim about. A filter or a sort changes the *view*:
  // those are still the tiles the reader picked, still grouped the way the grid
  // grouped them, and a pick is keyed on the stack's name, which the view cannot
  // move. The toggle and the two knobs change the *grouping*, and then the stacks
  // the picks named do not exist. One string rather than three variables watched
  // together, and the same one the report's conditions line carries.
  const grouped = $derived(grouping(stacking));

  $effect(() => {
    void grouped;
    untrack(() => {
      selected = [];
    });
  });

  // The anchor goes on any change to the query, selection or no selection: it is
  // an index into the sheet's page order, and a new query is a new order. What
  // shift-click extends from is then the next tile touched, which is the only
  // honest answer once the run it named has been repacked.
  $effect(() => {
    void gridQuery;
    untrack(() => {
      selectAnchor = null;
    });
  });

  // Changing this is what tells the sheet to start over. The screen is in it
  // because two screens can produce the same predicate and still be different
  // places to be.
  const sheetKey = $derived(
    mode === "grid"
      ? `grid:${JSON.stringify(gridQuery)}`
      : `triage:${index}:${JSON.stringify(candidate)}`,
  );

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
    if (mode !== "triage" || !showTable) {
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
  // `mode` is in it because none of this is triage's to fetch until triage is on
  // screen, and the grid is what opens: `/api/triage/files` alone is ~2.9 s of
  // SQL that nobody looking at the grid asked for. Arriving at triage is what
  // runs it, which is why the effect reads the mode rather than the mount doing
  // it once.
  //
  // `files` is fetched once and then deliberately untouched: it reports the saved
  // rule set, so changing screen cannot change it, and re-fetching would spend
  // 25 s arriving back at the number already on screen.
  let filesFetched = false;

  $effect(() => {
    void index;
    void mode;
    untrack(() => {
      picked = null;
      candidate = null;
      root = null;
      clearChecked();
      if (mode !== "triage") return;
      loadRows();
      recount.now();
      if (!filesFetched) {
        filesFetched = true;
        recountFiles();
      }
    });
  });

  // Screen 6's drill-down reloads the table and nothing else. It is a separate
  // effect because drilling *into* a root also selects that root as a candidate,
  // and one combined effect would clear the candidate it had just been given.
  $effect(() => {
    void root;
    untrack(() => {
      if (mode !== "triage") return;
      clearChecked(); // the rows are a different level; the keys do not carry over
      loadRows();
    });
  });

  // The filter vocabulary. Once, on mount, and never again: it is the whole
  // library's shape, so nothing the reader does here can change it. Cheap enough
  // to fetch even if triage is where you end up — the server built it before it
  // began serving.
  onMount(() => {
    guard(async () => {
      facets = await api.facets();
    });
  });

  // The remembered setting outlives the table it names: the assignments come with
  // the vocabulary, so this is the first moment the client can tell whether the one
  // it restored is still there. The server refuses a setting nobody wrote — this is
  // why a reader who rebuilt the catalog reopens the grid at the default rather than
  // on that refusal, and it runs again after a rebuild for the same reason.
  $effect(() => {
    const offered = facets?.stacking?.settings;
    if (!offered) return;
    untrack(() => {
      const settled = settle(stacking, offered);
      if (settled !== stacking) stacking = remember(settled);
    });
  });

  function setFilter(dimension, values) {
    filters = { ...filters, [dimension]: values };
  }

  // --- editing ------------------------------------------------------------

  function pick(row) {
    if (screen.sheet === false) return;
    // Screen 6's first level is a drill-down as well as a pick: it loads
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

  // Triage's ticked rows, as one exclude rule per row at the end of the order.
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

  // A finished rebuild changed the tile set, so the one thing this client
  // fetched once and kept is now describing a library that has moved. The
  // server drops its own memos as part of the job; this drops the client's copy
  // of the only one it holds.
  async function afterRebuild() {
    await guard(async () => {
      facets = await api.facets();
    });
  }

  async function override(item, decision) {
    const body = await guard(() => api.override(item.s, decision));
    if (!body) return item.o ?? null;
    filesStale = true;
    recount();
    return body.decision;
  }

  // --- the sheet ----------------------------------------------------------

  async function fetchPage(cursor) {
    if (mode !== "grid") return api.page(candidate, cursor);
    // Which view asked, so a page that lands after the reader has moved on can be
    // told from one that is still being looked at — the same fact the sheet keeps
    // as its generation, read here because this is where it is needed.
    const view = sheetKey;
    // No `kind` unless the reader picked one: the server's default is still
    // photography, which is `image` and `raw_image` both and no video.
    const body = await api.photos({ limit: 500, ...gridQuery, ...(cursor || {}) });
    // A pick survives a filter; what it holds does not, because a filter removes
    // frames from a stack. So every page of the view re-reads the picks it
    // carries, which is what keeps the count and the report describing the view
    // their conditions line names. Only for the view that is still on screen: a
    // page from the one before it landing late would be answering about a page
    // nobody is looking at, exactly as the sheet's own generation says.
    if (selected.length && view === sheetKey) {
      selected = refresh(selected, body.photos.map(stackOf));
    }
    return body;
  }

  // What the overlay draws for one tile. `m` is the page's own answer to what a
  // stack holds and it is absent on a stack of one and on every tile while
  // stacking is off — so the tile stands in for itself there, which it can
  // because a tile already carries everything a frame is: its id, its hash and
  // its dimensions. That is why one rule covers both settings of a switch the
  // payload does not mention, and why walking works the same in both.
  const framesOf = (item) => item.m ?? [{ id: item.id, s: item.s, w: item.w, h: item.h }];

  // A tile in the grid opens, always.
  //
  // Triage is the other client of this sheet and keeps its single click: its
  // tiles are source files, revealed as origins, and most of them have no
  // substrate for an overlay to draw.
  function activate(item, tile, at, shift = false) {
    if (mode === "grid") {
      // In select mode a click selects and nothing else: no overlay, no
      // reveal. A cover carries its whole stack, which is what makes the export
      // say how the grid had grouped things rather than only which photographs
      // were picked.
      if (selecting) {
        // Shift extends from the last tile touched to this one, in the order
        // the sheet holds them — which is the sort the grid is under — and
        // applies *this* click's outcome across the range: select from an
        // unselected tile, deselect from a selected one. The same gesture the
        // triage table's tickboxes have, over tiles instead of rows.
        if (shift && selectAnchor !== null) {
          const run = sheetView?.itemsBetween(selectAnchor, at) ?? [];
          selected = sweep(selected, run.map(stackOf), !isSelected(item));
        } else {
          selected = toggle(selected, stackOf(item));
        }
        selectAnchor = at;
        return;
      }
      // The photograph's rect and not the tile's: a stacked tile's element is
      // taller than its picture by the deck above it, and the overlay has to
      // fly out of the picture.
      //
      // The tile's own id is the cover's — a stacked page's row is the drawn
      // member — so this says which of the frames the reader had been looking
      // at, and it says it the same way for a tile that is its own only frame.
      opened = { frames: framesOf(item), cover: item.id, origin: photoRect(tile), at };
      return;
    }
    guard(() => api.revealOrigin(item.id));
  }

  const isSelected = (item) => selected.some((entry) => entry.key === nameOf(item));

  // The marquee, in three moments.
  //
  // The tile under the pointer when the press landed decides the whole drag:
  // from a selected tile it deselects everything it touches, from an unselected
  // one — and from empty canvas, which is the same thing said with no tile — it
  // selects. Fixed here, once, because a box whose meaning changed under the hand
  // while it was being extended would be unusable.
  function sweepStart(item, at) {
    dragging = { from: selected, adding: item === null || !isSelected(item) };
    if (at !== null) selectAnchor = at;
  }

  // Every move is the verdict re-applied to the set as it stood when the drag
  // began, so the set previews live and a tile the box has moved back off goes
  // back to what it was. The drag never touches a tile outside its own box:
  // this is an evidence-gathering tool and the reader sweeps several separate
  // runs into one report. Clearing is the button that says Clear.
  function sweepMove(covered) {
    selected = sweep(dragging.from, covered.map(stackOf), dragging.adding);
  }

  function sweepEnd() {
    dragging = null;
  }

  function deselectAll() {
    selected = [];
    selectAnchor = null;
  }

  // Whether there is a tile that way. `step` is the whole of it: the sheet's
  // count and its `exhausted` are what say where the view really ends, as
  // against where the pages read so far happen to stop.
  const canStepBack = $derived(
    opened !== null && step(opened.at, -1, sheet.count, sheet.exhausted) !== null,
  );
  const canStepOn = $derived(
    opened !== null && step(opened.at, 1, sheet.count, sheet.exhausted) !== null,
  );

  // One step of the walk. The sheet scrolls to the tile — paging for it if the
  // reader has run off the end of what is loaded — and the overlay is re-opened
  // on what it landed on, which is what gives every step a rect to fly out of
  // and leaves the grid where the walk ended.
  //
  // Two gates, both here so a press has one place that decides its fate.
  // `walking` drops one that arrives while a step is still resolving: a step
  // waiting on a page is the slow one, and queueing those behind a held key
  // would spend fetches on tiles the reader has already gone past. `STEP_MS` is
  // the rate a *held* arrow may go — repeat arrives about thirty times a second,
  // and a step onto a tile already read resolves at once, so without it holding
  // the key would cross thirty photographs a second. It applies to `held` alone:
  // a press or a click the reader made is never too fast to mean something.
  const STEP_MS = 120;
  let walking = false;
  let stepped = 0;

  async function walk(delta, held = false) {
    const now = performance.now();
    if (!opened || walking || (held && now - stepped < STEP_MS)) return;
    const next = step(opened.at, delta, sheet.count, sheet.exhausted);
    if (next === null) return;
    stepped = now;
    walking = true;
    try {
      const landed = await sheetView?.walkTo(next);
      if (!landed || !opened) return;
      opened = {
        frames: framesOf(landed.item),
        cover: landed.item.id,
        origin: photoRect(landed.tile),
        at: next,
      };
    } finally {
      walking = false;
    }
  }

  // What the overlay asks for once its own way out has played — the cover is
  // back in its tile by the time this runs, which is why the overlay owns the
  // timing of it and this owns nothing but the state.
  //
  // Closing hands the keyboard back to the tile the reader actually reached,
  // which after a walk is not the one they opened. After the flush, because the
  // overlay's own pane holds focus until it is gone.
  async function closeOverlay() {
    const at = opened?.at ?? null;
    opened = null;
    await tick();
    if (at !== null) sheetView?.focusTile(at);
  }

  // The second press: a frame inside the open overlay. The overlay closes
  // itself on the way out, because the reveal was the thing it was opened to do
  // — and closes the same way Escape closes it, so the reader comes back from
  // Explorer to the tile they left rather than to the one they started at.
  function revealFrame(frame) {
    guard(() => api.revealPhoto(frame.id));
  }

  // The selected set as the report it exists to produce. Nothing leaves the
  // machine: this is the system clipboard, there is no endpoint behind it, and
  // the conditions line is what stops the reader being asked which grouping they
  // were looking at.
  function share() {
    guard(() => navigator.clipboard.writeText(shareText({ stacking, sort, filters }, selected)));
  }
</script>

{#if mode === "grid"}
  <Header
    {facets}
    {filters}
    {sort}
    {stacking}
    total={sheet.total}
    tiles={sheet.tiles}
    loading={sheet.loading}
    {selecting}
    {selectedTally}
    onfilter={setFilter}
    onsort={(next) => (sort = next)}
    onstack={(next) => (stacking = remember(next))}
    onclear={() => (filters = {})}
    onselecting={(next) => (selecting = next)}
    onshare={share}
    ondeselect={deselectAll}
    ontriage={() => (mode = "triage")}
  />
{/if}

{#if tuning}
  <Tuner />
{/if}

<div class="shell" class:bare={mode === "grid"}>
  {#if mode === "triage"}
    <aside class="side">
      <!-- The sidebar only exists in triage, so it needs one control: the way
           back. Going the other way is the header's Triage button. -->
      <div class="modes">
        <button onclick={() => (mode = "grid")}>← grid</button>
      </div>

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
          {picked}
          onpick={pick}
          oncheck={check}
        />
      {/if}

      {#if screen.tree}
        <Tree
          root={PHOTOS_ROOT}
          version={treeVersion}
          {excludedDirs}
          {picked}
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

      <Rebuild oncomplete={afterRebuild} />
    </aside>
  {/if}

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
          <button onclick={clearChecked} disabled={saving}>Clear</button>
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
        bind:this={sheetView}
        key={sheetKey}
        {fetchPage}
        total={mode === "grid" ? null : (counts?.page_paths ?? null)}
        triage={mode === "triage"}
        {excludedDirs}
        selecting={mode === "grid" && selecting}
        {selectedKeys}
        onActivate={activate}
        onOverride={override}
        onExcludeFolder={excludeFolder}
        onSweepStart={sweepStart}
        onSweepMove={sweepMove}
        onSweepEnd={sweepEnd}
        onState={(state) => (sheet = { ...sheet, ...state })}
      />
    {/if}
  </div>
</div>

{#if opened}
  <Overlay
    frames={opened.frames}
    cover={opened.cover}
    origin={opened.origin}
    back={canStepBack}
    forward={canStepOn}
    onstep={walk}
    onreveal={revealFrame}
    onclose={closeOverlay}
  />
{/if}

{#if failed}
  <div class="status" class:bare={mode === "grid"}>{failed}</div>
{/if}

<style>
  .modes {
    display: flex;
    gap: var(--s-1);
    margin-bottom: var(--s-4);
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 1px;
    margin-bottom: var(--s-4);
  }

  .nav {
    justify-content: flex-start;
    gap: 0;
    text-align: left;
    font-weight: 400;
    padding: 0 var(--s-2);
    background: none;
    border-color: transparent;
  }

  .nav .n {
    display: inline-block;
    width: 1.8em;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
  }

  button.on,
  button.on:hover {
    background: var(--picked);
    border-color: color-mix(in srgb, var(--accent) 55%, transparent);
    color: var(--text);
  }

  .tablehead {
    display: flex;
    gap: var(--s-2);
    align-items: center;
    margin-bottom: var(--s-2);
    flex-wrap: wrap;
  }

  /* Sits with the rule bar rather than by the table, because this is the same
     kind of thing the rule bar's Confirm is: the write, apart from the browsing.
     The table scrolls in its own fixed sidebar, so ticking boxes does not move
     this. */
  .bulkbar {
    display: flex;
    gap: var(--s-2);
    align-items: center;
    flex-wrap: wrap;
    padding: var(--s-2) var(--s-3);
    margin-bottom: var(--s-2);
    font-size: var(--fs-200);
    border: 1px solid color-mix(in srgb, var(--accent) 55%, transparent);
    border-radius: var(--r-2);
    background: var(--picked);
  }

  .sheetbar {
    display: flex;
    gap: var(--s-3);
    align-items: baseline;
    padding: var(--s-1) 0 var(--s-2);
    font-size: var(--fs-100);
    flex-wrap: wrap;
  }

  .hint {
    color: var(--faint);
  }

  .pad {
    padding: var(--s-1) 0;
  }

  .muted {
    color: var(--dim);
  }
</style>
