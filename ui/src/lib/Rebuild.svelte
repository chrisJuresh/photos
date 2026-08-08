<script>
  // Applying the triage decisions to the grid, which is two command-line steps
  // and a server that has to be told its counts are wrong. The button is here,
  // in the triage sidebar under the rule set, because it acts on the whole
  // saved set rather than on the screen you happen to be looking at.
  //
  // There is no progress bar and that is honest rather than lazy: `group` is
  // ~12 s of SQL that prints its report when it lands and nothing before it, so
  // what can truthfully be shown is which step is running, how long it has been
  // running, and the output as it arrives. A bar would be an animation of a
  // number nobody has.
  //
  // Closing the popup does not stop anything — the job is a thread in the
  // server, not a promise in this tab — so the poll keeps running while a run
  // is in flight and the button goes on saying so.
  import { onMount } from "svelte";
  import { api } from "./api.js";

  let { oncomplete } = $props();

  let status = $state(null);
  let open = $state(false);
  let failed = $state(null);
  // The `started_at` of the last completed run this tab has refreshed itself
  // for. Keyed on the run rather than on watching the transition, because the
  // transition is the case this misses: leaving triage unmounts this component,
  // so a rebuild started and then walked away from would finish with nobody
  // watching and the client would hold the old vocabulary for the rest of the
  // session. Coming back re-reads the status and catches up.
  let applied = $state(null);

  const running = $derived(status?.state === "running");
  // The snapshot the run took, as the argument the rollback command wants. The
  // popup shows the command rather than a Restore button on purpose: this is
  // the one action in the system that overwrites the file which cannot be
  // regenerated, and `photolib.restore_state` refuses to run while this server
  // is up.
  const snapshotName = $derived(status?.snapshot ? status.snapshot.split(/[\\/]/).pop() : null);

  async function poll() {
    try {
      const next = await api.rebuildStatus();
      status = next;
      failed = null;
      if (next.state === "done" && next.started_at !== applied) {
        applied = next.started_at;
        oncomplete?.();
      }
    } catch (err) {
      failed = String(err);
    }
  }

  // Once, so a run someone started in another tab — or one that finished before
  // this tab arrived — is on screen rather than discovered by pressing the
  // button and being refused.
  onMount(() => {
    poll();
  });

  // Keyed on the boolean and not on `status`, which changes on every poll: an
  // effect that re-ran per poll would tear down and rebuild the interval each
  // time and drift.
  $effect(() => {
    if (!running) return;
    const timer = setInterval(poll, 700);
    return () => clearInterval(timer);
  });

  async function start() {
    open = true;
    failed = null;
    try {
      status = await api.rebuild();
    } catch (err) {
      failed = String(err);
    }
  }

  function onkeydown(event) {
    if (event.key === "Escape") open = false;
  }
</script>

<svelte:window {onkeydown} />

<div class="apply">
  <button class="go" onclick={start} disabled={running}>
    {running ? "applying…" : "Apply to grid"}
  </button>
  <button class="link" onclick={() => (open = true)} disabled={!status || status.state === "idle"}>
    last run
  </button>
  <p class="muted note">
    Snapshots the triage state, rebuilds the tiles, and drops the counts this
    server cached. Nothing leaves the grid until this runs.
  </p>
</div>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="scrim" onclick={() => (open = false)}></div>
  <div class="popup" role="dialog" aria-label="Apply triage to the grid">
    <div class="top">
      <strong>Apply triage to the grid</strong>
      <span class="spacer"></span>
      <span class="muted">{status?.seconds ?? 0}s</span>
      <button class="link" onclick={() => (open = false)}>close</button>
    </div>

    {#if failed}
      <p class="bad">{failed}</p>
    {/if}

    {#each status?.steps ?? [] as step}
      <div class="step" class:on={step.state === "running"} class:bad={step.state === "failed"}>
        <div class="row">
          <span class="mark">
            {#if step.state === "done"}✓{:else if step.state === "failed"}✕{:else if step.state === "running"}·{:else}&nbsp;{/if}
          </span>
          <span class="name">
            {step.name === "snapshot" ? "snapshot the triage state" : "rebuild the tiles"}
          </span>
          <span class="spacer"></span>
          <span class="muted">{step.seconds === null ? "" : step.seconds + "s"}</span>
        </div>
        {#if step.log.length}
          <pre>{step.log.join("\n")}</pre>
        {/if}
      </div>
    {/each}

    {#if status?.state === "failed"}
      <p class="bad">{status.error}</p>
      <p class="muted">
        Nothing was lost. The tiles are whatever the last complete rebuild left,
        and the snapshot above — if it got that far — still stands.
      </p>
    {:else if status?.state === "done"}
      <p>Done. The grid is showing the tile set your rules and overrides describe.</p>
    {:else if running}
      <p class="muted">
        Safe to close — this runs in the server, not in this tab.
      </p>
    {/if}

    {#if snapshotName}
      <div class="rollback">
        <div class="head">roll back to before this run</div>
        <p class="muted">
          That snapshot is the state this run applied. To undo a triage session,
          restore the one <em>before</em> it — stop the grid first, the command
          refuses while it is up.
        </p>
        <pre>python -m photolib.restore_state --list</pre>
        <pre>python -m photolib.restore_state {snapshotName}</pre>
      </div>
    {/if}
  </div>
{/if}

<style>
  .apply {
    margin-top: var(--s-4);
    border-top: 1px solid var(--line);
    padding-top: var(--s-3);
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-2);
    align-items: center;
  }

  .go {
    font-weight: 600;
  }

  .note {
    font-size: var(--fs-100);
    line-height: var(--lh);
    margin: 0;
    flex-basis: 100%;
  }

  .link {
    min-height: 0;
    padding: 1px 6px;
    font-size: var(--fs-100);
    background: none;
    border-color: transparent;
    color: var(--dim);
  }

  .link:hover:not(:disabled) {
    background: var(--raised);
    border-color: var(--line);
    color: var(--text);
  }

  .scrim {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 50;
  }

  .popup {
    position: fixed;
    top: 50%;
    left: 50%;
    translate: -50% -50%;
    z-index: 51;
    width: min(680px, calc(100vw - var(--s-6)));
    max-height: min(80vh, 760px);
    overflow-y: auto;
    padding: var(--s-4);
    background: var(--panel);
    border: 1px solid var(--line-strong);
    border-radius: var(--r-3);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
    font-size: var(--fs-200);
  }

  .top {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    margin-bottom: var(--s-3);
  }

  .step {
    border-left: 2px solid var(--line-strong);
    padding: var(--s-1) 0 var(--s-1) var(--s-2);
    margin-bottom: var(--s-2);
  }

  .step.on {
    border-left-color: var(--accent);
  }

  .step.bad {
    border-left-color: var(--drop);
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--s-2);
  }

  .mark {
    width: 1em;
    color: var(--dim);
  }

  .step.on .mark {
    color: var(--accent);
  }

  .step.bad .mark {
    color: var(--drop);
  }

  .name {
    font-weight: 600;
  }

  pre {
    font-family: var(--mono);
    font-size: var(--fs-100);
    line-height: var(--lh);
    white-space: pre-wrap;
    word-break: break-word;
    background: var(--sunken);
    border-radius: var(--r-1);
    padding: var(--s-2);
    margin: var(--s-2) 0 0;
    color: var(--text-2);
  }

  .rollback {
    margin-top: var(--s-4);
    border-top: 1px solid var(--line);
    padding-top: var(--s-3);
  }

  .rollback .head {
    font-size: var(--fs-100);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dim);
    margin-bottom: var(--s-2);
  }

  .spacer {
    flex: 1;
  }

  .muted {
    color: var(--dim);
  }

  .bad {
    color: var(--error);
  }

  p {
    margin: var(--s-2) 0 0;
    line-height: var(--lh);
  }
</style>
