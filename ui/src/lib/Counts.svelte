<script>
  // The two numbers, deliberately never rendered the same way.
  //
  //   PATHS   /api/triage/counts, ~270 ms of SQL, recomputed while you type
  //   FILES   /api/triage/files,  ~25 s, on demand only
  //
  // They disagree on purpose: a rule decides paths, and a file is kept if ANY
  // of its paths is kept. Labelling them identically would make the slower,
  // staler, more meaningful number look like the one that just moved.
  //
  // FILES is on demand rather than "once per screen" for two measured reasons.
  // It costs 25 s against the ~2.9 s on record, and it reports the SAVED rule
  // set — so it does not vary by screen, and re-fetching it on every nav click
  // would spend 25 s arriving at the number already on the display. It is
  // fetched once at start and marked stale by any write.
  import { bytes, count } from "./api.js";

  let {
    counts = null,
    files = null,
    filesAt = null,
    stale = false,
    candidate = null,
    busy = false,
    onfiles,
  } = $props();

  const delta = $derived(
    counts && candidate
      ? counts.candidate_excluded_paths - counts.excluded_paths
      : 0,
  );
</script>

<div class="counts">
  <div class="block" class:busy>
    <div class="tag">PATHS <span class="muted">live · ~300 ms</span></div>
    {#if counts}
      <div class="line">
        <span class="keep">kept {count(counts.kept_paths)}</span>
        <span class="muted">{bytes(counts.kept_bytes)}</span>
        <span class="sep">/</span>
        <span class="drop">excluded {count(counts.excluded_paths)}</span>
        <span class="muted">{bytes(counts.excluded_bytes)}</span>
      </div>
      {#if candidate}
        <div class="line cand">
          <span class="muted">with this rule &rarr;</span>
          <span class="keep">kept {count(counts.candidate_kept_paths)}</span>
          <span class="muted">{bytes(counts.candidate_kept_bytes)}</span>
          <span class="sep">/</span>
          <span class="drop">excluded {count(counts.candidate_excluded_paths)}</span>
          <span class="muted">{bytes(counts.candidate_excluded_bytes)}</span>
          <span class="delta">{delta >= 0 ? "+" : ""}{count(delta)} excluded</span>
        </div>
      {/if}
    {:else}
      <div class="line muted">…</div>
    {/if}
  </div>

  <div class="block" class:busy={files === "loading"}>
    <div class="tag">
      FILES <span class="muted">distinct content · ~25 s</span>
      <button onclick={onfiles} disabled={files === "loading"}>
        {files === "loading" ? "counting…" : "recount"}
      </button>
      {#if stale && files && files !== "loading"}
        <span class="stale">stale — rules changed</span>
      {/if}
    </div>
    {#if files && files !== "loading"}
      <div class="line" class:outdated={stale}>
        <span class="keep">kept {count(files.kept_files)}</span>
        <span class="muted">{bytes(files.kept_bytes)}</span>
        <span class="sep">/</span>
        <span class="drop">excluded {count(files.excluded_files)}</span>
        <span class="muted">{bytes(files.excluded_bytes)}</span>
      </div>
      <div class="line muted small">
        as of {filesAt} · the saved rule set, not the candidate
      </div>
    {:else}
      <div class="line muted">{files === "loading" ? "counting…" : "not counted yet"}</div>
    {/if}
  </div>
</div>

<style>
  .counts {
    display: flex;
    gap: var(--s-6);
    flex-wrap: wrap;
    margin-bottom: var(--s-4);
  }

  /* Wide enough that the kept and excluded figures stay on one line, and never
     wider than what it has been given: a fixed 22rem pushes a horizontal
     scrollbar onto the whole page as soon as the window is narrow. */
  .block {
    min-width: min(22rem, 100%);
  }

  /* The live block dims while a recompute is in flight, so a stale number is
     visibly stale rather than quietly wrong. */
  .block.busy .line {
    opacity: 0.45;
  }

  .tag {
    font-size: var(--fs-100);
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--dim);
    display: flex;
    align-items: center;
    gap: var(--s-2);
    margin-bottom: 3px;
  }

  /* FILES is boxed and PATHS is not, so the two are told apart at a glance and
     not by reading the label. */
  .block:last-child {
    border-left: 2px solid var(--line);
    padding-left: var(--s-4);
  }

  .line {
    display: flex;
    gap: 7px;
    align-items: baseline;
    flex-wrap: wrap;
  }

  .line.cand {
    margin-top: 3px;
  }

  .small {
    font-size: var(--fs-100);
  }

  .keep {
    color: var(--keep);
  }

  .drop {
    color: var(--drop);
  }

  .sep,
  .muted {
    color: var(--dim);
  }

  .delta {
    color: var(--accent);
  }

  /* A stale number stays on screen — it is still the last true answer — but it
     never looks current. Clearing it instead would hide the only distinct-content
     figure there is behind a 25 s wait. */
  .outdated {
    opacity: 0.45;
    text-decoration: line-through;
  }

  .stale {
    color: var(--drop);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
</style>
