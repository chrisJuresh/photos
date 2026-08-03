<script>
  // The candidate rule, as an editable predicate, plus the explicit confirm.
  // Nothing here writes: `onconfirm` is what does, and only when pressed.
  import { describe } from "./screens.js";

  let { candidate = null, screen, saving = false, onedit, onconfirm, onclear } = $props();

  const COLUMNS = [
    "dir_segment",
    "dir_under",
    "ext",
    "root",
    "kind",
    "width",
    "height",
    "long_edge",
    "camera",
    "dims",
  ];

  // Mirrors photolib/triage.py's OPERATORS. A column offering an operator the
  // engine will refuse is a refusal round-trip for no reason.
  const OPS = {
    dir_segment: ["="],
    dir_under: ["="],
    ext: ["=", "in"],
    root: ["=", "in"],
    kind: ["=", "in", "is null"],
    width: ["=", "<=", ">", "is null"],
    height: ["=", "<=", ">", "is null"],
    long_edge: ["=", "<=", ">", "is null"],
    camera: ["="],
    dims: ["="],
  };

  const INTS = new Set(["width", "height", "long_edge", "camera"]);

  const ops = $derived(candidate ? (OPS[candidate.column] ?? ["="]) : ["="]);
  const needsValue = $derived(Boolean(candidate) && candidate.op !== "is null");

  function edit(field, raw) {
    const next = { ...candidate, [field]: raw };
    if (field === "column") {
      // The old operator may not exist on the new column, and the old value is
      // certainly the wrong type.
      const allowed = OPS[raw] ?? ["="];
      if (!allowed.includes(next.op)) next.op = allowed[0];
      next.value = INTS.has(raw) ? 0 : "";
    }
    if (field === "op" && raw === "is null") next.value = null;
    if (field === "value" && INTS.has(next.column)) next.value = Number(raw) || 0;
    onedit(next);
  }
</script>

<div class="bar">
  {#if screen.rule === false}
    <div class="none">
      <strong>{screen.title} does not save a rule.</strong>
      <span class="muted">{screen.blurb}</span>
    </div>
  {:else if candidate}
    <div class="fields">
      <select
        value={candidate.column}
        onchange={(e) => edit("column", e.currentTarget.value)}
        aria-label="predicate column"
      >
        {#each COLUMNS as column}<option value={column}>{column}</option>{/each}
      </select>

      <select
        value={candidate.op}
        onchange={(e) => edit("op", e.currentTarget.value)}
        aria-label="predicate operator"
      >
        {#each ops as op}<option value={op}>{op}</option>{/each}
      </select>

      {#if needsValue}
        <input
          class="value"
          value={candidate.value ?? ""}
          oninput={(e) => edit("value", e.currentTarget.value)}
          aria-label="predicate value"
          spellcheck="false"
        />
      {/if}

      <select
        value={candidate.decision ?? "exclude"}
        onchange={(e) => edit("decision", e.currentTarget.value)}
        aria-label="decision"
      >
        <option value="exclude">exclude</option>
        <option value="include">include</option>
      </select>

      <select
        value={String(candidate.at ?? "end")}
        onchange={(e) => edit("at", e.currentTarget.value)}
        aria-label="position in the rule order"
        title="Rules evaluate top-down, first match wins. Put an include at the top to carve a subtree out of an exclude below it."
      >
        <option value="end">at end</option>
        <option value="0">at top</option>
      </select>

      <button onclick={onconfirm} disabled={saving}>
        {saving ? "saving…" : "Confirm"}
      </button>
      <button onclick={onclear}>Clear</button>
    </div>
    <div class="echo muted">{describe(candidate)} &rarr; {candidate.decision ?? "exclude"}</div>
  {:else}
    <div class="none muted">
      Pick a row to build a rule{screen.table === false ? ", or scroll — this is the remainder" : ""}.
    </div>
  {/if}
</div>

<style>
  .bar {
    padding: 6px 0 8px;
  }

  .fields {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
  }

  .value {
    min-width: 26rem;
  }

  .echo {
    margin-top: 3px;
    font-size: 11px;
  }

  .none {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .muted {
    color: var(--dim);
  }
</style>
