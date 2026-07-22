<script lang="ts">
  import type { ApprovalResult, ImportBatch, JobState } from '$lib/api';

  export let batch: ImportBatch;
  export let preflight: Pick<JobState, 'id' | 'status' | 'progress' | 'error'> | null = null;
  export let approval: ApprovalResult | null = null;
  export let busy = false;
  export let onPrepare: () => void | Promise<void> = () => undefined;
  export let onApprove: () => void | Promise<void> = () => undefined;
  export let onExecute: () => void | Promise<void> = () => undefined;
  export let onControl: (action: 'pause' | 'resume' | 'cancel') => void | Promise<void> = () => undefined;

  let confirmed = false;
  $: progress = preflight?.progress as { summary?: Record<string, number | boolean> } | undefined;
  $: summary = progress?.summary;

  function bytes(value: number | boolean | undefined) {
    if (typeof value !== 'number') return 'Not recorded';
    return new Intl.NumberFormat(undefined, { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 }).format(value / 1_000_000);
  }
</script>

<section class="approval-panel" aria-labelledby="approval-heading">
  <div class="section-heading"><div><p class="eyebrow">Explicit copy gate</p><h2 id="approval-heading">Approve this import</h2></div></div>
  <p>Approval snapshots the current include/exclude decisions. Copying begins only after the separate execute authorization. Source files stay in place.</p>
  {#if !summary}
    <button class="primary" type="button" disabled={busy} onclick={onPrepare}>Prepare approval summary</button>
    {#if preflight}<p role="status">Capacity check: {preflight.status}</p>{/if}
  {:else}
    <dl class="approval-summary">
      <div><dt>Included</dt><dd>{summary.included_count ?? 0}</dd></div>
      <div><dt>Excluded</dt><dd>{summary.excluded_count ?? 0}</dd></div>
      <div><dt>Duplicates</dt><dd>{summary.duplicate_count ?? 0}</dd></div>
      <div><dt>Sidecars</dt><dd>{summary.sidecar_count ?? 0}</dd></div>
      <div><dt>Corrupt candidates</dt><dd>{summary.corrupt_count ?? 0}</dd></div>
      <div><dt>Projected storage</dt><dd>{bytes(summary.projected_copy_bytes)}</dd></div>
      <div><dt>Destination free</dt><dd>{bytes(summary.destination_free_bytes)}</dd></div>
    </dl>
    {#if summary.sufficient_free_space === false}<p class="danger" role="alert">There is not enough destination space with the required safety margin.</p>{/if}
    {#if !approval}
      <label class="confirmation"><input type="checkbox" bind:checked={confirmed} /> I reviewed these counts and decisions.</label>
      <button class="primary" type="button" disabled={busy || !confirmed} onclick={onApprove}>Approve decision snapshot</button>
    {:else}
      <p role="status">Approval recorded. Copying has not started.</p>
      <button class="primary" type="button" disabled={busy || !approval.sufficient_free_space} onclick={onExecute}>Authorize verified copy</button>
    {/if}
  {/if}

  {#if batch.current_job_id}
    <div class="control-row" role="group" aria-label="Import job controls">
      <button type="button" disabled={busy} onclick={() => onControl('pause')}>Pause safely</button>
      <button type="button" disabled={busy} onclick={() => onControl('resume')}>Resume</button>
      <button type="button" class="danger-button" disabled={busy} onclick={() => onControl('cancel')}>Cancel future work</button>
    </div>
    <p class="muted">Cancellation keeps every verified object and stops future items at a safe boundary.</p>
  {/if}
</section>
