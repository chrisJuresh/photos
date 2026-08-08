<script>
  // The dimension probe, as a button that reports and never runs.
  //
  // No progress bar. The worklist on this corpus is 25 files and the probe
  // finishes in 0.4 s — MediaVault already measured every raster the library
  // holds, 54,896 of the 54,899 .png included — so a bar would exist only to
  // flash. An empty worklist says so in words.
  //
  // The button does not run the probe either, and that is not squeamishness:
  // the probe writes file.width into the CATALOG, while every triage write
  // reaches state.sqlite3 through a connection that cannot see the catalog at
  // all, and its reads land on the USB HDD whose contention archive/PLAN.md measures in
  // whole megabytes per second. It reports, and names the one command to run.
  import { api, count } from "./api.js";

  let { screen } = $props();
  let result = $state(null);
  let busy = $state(false);
  let failed = $state(null);

  async function ask() {
    busy = true;
    failed = null;
    try {
      result = await api.probe();
    } catch (err) {
      failed = String(err);
    } finally {
      busy = false;
    }
  }
</script>

<div class="probe">
  <button onclick={ask} disabled={busy}>
    {busy ? "counting…" : "Check the dimension probe's worklist"}
  </button>

  {#if failed}
    <span class="err">{failed}</span>
  {:else if result}
    {#if result.worklist === 0}
      <span class="muted">
        Nothing to probe: every kept file with a readable header already has its
        dimensions. Rows under <code>unknown</code> above are formats the header
        reader cannot measure ({result.formats.join(" ")}) or files with no
        extension.
      </span>
    {:else}
      <span>
        <strong>{count(result.worklist)}</strong> kept files have no dimensions and a
        readable header. Run <code>{result.command}</code>, then
        <code>python -m archive.pipeline.triage_survey</code>, then reload.
      </span>
    {/if}
  {:else}
    <span class="muted">
      Screen {screen.id} bands on the long edge; this reports how many kept files
      still have none.
    </span>
  {/if}
</div>

<style>
  .probe {
    display: flex;
    gap: var(--s-2);
    align-items: center;
    flex-wrap: wrap;
    margin: 0 0 var(--s-4);
    font-size: var(--fs-200);
  }

  code {
    background: var(--sunken);
    border: 1px solid var(--line);
    border-radius: var(--r-1);
    padding: 2px 6px;
  }

  .muted {
    color: var(--dim);
  }

  .err {
    color: var(--error);
  }
</style>
