<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ApiClientError,
    StaleStateError,
    reviewApi,
    type ApprovalResult,
    type ImportBatch,
    type ImportError,
    type ImportEvent,
    type ImportFolder,
    type ImportManifestItem,
    type ImportSample,
    type JobState,
    type UnavailableField
  } from '$lib/api';
  import ImportApproval from '$lib/components/ImportApproval.svelte';
  import ImportTelemetry from '$lib/components/ImportTelemetry.svelte';
  import ManifestReview from '$lib/components/ManifestReview.svelte';
  import UnavailableMetrics from '$lib/components/UnavailableMetrics.svelte';

  const phases = ['discovering', 'hashing', 'matching', 'preparing_previews', 'awaiting_review', 'copying', 'verifying', 'indexing', 'thumbnailing', 'complete'];
  const activeStatuses = new Set([
    ...phases.filter((phase) => !['awaiting_review', 'complete'].includes(phase)),
    'paused',
    'interrupted'
  ]);

  let batches = $state<ImportBatch[]>([]);
  let selected = $state<ImportBatch | null>(null);
  let folders = $state<ImportFolder[]>([]);
  let samples = $state<ImportSample[]>([]);
  let events = $state<ImportEvent[]>([]);
  let errors = $state<ImportError[]>([]);
  let manifest = $state<ImportManifestItem[]>([]);
  let manifestPreparing = $state(false);
  let generation = $state<number | null>(null);
  let loading = $state(true);
  let busy = $state(false);
  let message = $state('Loading import history…');
  let eventFilter = $state('');
  let preflight = $state<Pick<JobState, 'id' | 'status' | 'progress' | 'error'> | null>(null);
  let approval = $state<ApprovalResult | null>(null);
  let compareIds = $state<string[]>([]);
  let comparison = $state<ImportBatch[]>([]);
  let currentManifestQuery = $state<{ search?: string; classification?: string[]; outcome?: string[]; sort?: string[] }>({});
  let unavailable = $state<UnavailableField[]>([]);
  let historyCursor = $state<string | null>(null);
  let folderCursor = $state<string | null>(null);
  let sampleCursor = $state<string | null>(null);
  let eventCursor = $state<string | null>(null);
  let errorCursor = $state<string | null>(null);
  let manifestCursor = $state<string | null>(null);

  const formatNumber = new Intl.NumberFormat();

  function bytes(value: number | null | undefined) {
    if (value === null || value === undefined) return 'Not recorded';
    if (value < 1024) return `${value} B`;
    const units = ['KiB', 'MiB', 'GiB', 'TiB'];
    let amount = value / 1024;
    let unit = units[0];
    for (let index = 1; index < units.length && amount >= 1024; index += 1) { amount /= 1024; unit = units[index]; }
    return `${amount.toFixed(amount >= 10 ? 1 : 2)} ${unit}`;
  }

  function errorMessage(error: unknown, fallback: string) {
    return error instanceof ApiClientError ? error.problem.message : fallback;
  }

  async function loadHistory(preserveSelection = true, append = false) {
    try {
      const response = await reviewApi.imports(100, append ? historyCursor ?? undefined : undefined);
      batches = append ? [...batches, ...(response.data ?? [])] : response.data ?? [];
      historyCursor = response.page?.next_cursor ?? null;
      generation = response.meta.generation;
      if (preserveSelection && selected) selected = batches.find((batch) => batch.id === selected?.id) ?? null;
      if (!selected && batches.length) selected = batches[0];
      if (selected && !append) await loadSelected(selected.id);
      else message = 'No reviewed imports have been discovered yet.';
    } catch (error) {
      message = errorMessage(error, 'Import history is unavailable.');
    } finally {
      loading = false;
    }
  }

  async function loadSelected(batchId: string) {
    try {
      const [detail, folderResult, sampleResult, eventResult, errorResult] = await Promise.all([
        reviewApi.importDetail(batchId), reviewApi.importFolders(batchId), reviewApi.importSamples(batchId),
        reviewApi.importEvents(batchId), reviewApi.importErrors(batchId)
      ]);
      selected = detail.data;
      generation = detail.meta.generation;
      folders = folderResult.data ?? [];
      samples = sampleResult.data ?? [];
      events = eventResult.data ?? [];
      errors = errorResult.data ?? [];
      folderCursor = folderResult.page?.next_cursor ?? null;
      sampleCursor = sampleResult.page?.next_cursor ?? null;
      eventCursor = eventResult.page?.next_cursor ?? null;
      errorCursor = errorResult.page?.next_cursor ?? null;
      unavailable = detail.unavailable;
      preflight = detail.data?.preflight_job ?? null;
      approval = detail.data?.approval ? ({ approval_id: detail.data.approval.id, batch_id: batchId, batch_revision: detail.data.revision, decision_fingerprint: '', ...(detail.data.approval.summary as Omit<ApprovalResult, 'approval_id' | 'batch_id' | 'batch_revision' | 'decision_fingerprint'>) }) : null;
      await loadManifest(currentManifestQuery);
      message = `Import ${detail.data?.name ?? batchId} restored from persisted state.`;
    } catch (error) {
      message = errorMessage(error, 'Could not load this import.');
    }
  }

  async function loadManifest(query: typeof currentManifestQuery, append = false) {
    if (!selected) return;
    currentManifestQuery = query;
    const response = await reviewApi.importManifest(selected.id, {
      ...query,
      limit: 300,
      cursor: append ? manifestCursor ?? undefined : undefined
    });
    generation = response.meta.generation;
    manifest = append ? [...manifest, ...(response.data?.items ?? [])] : response.data?.items ?? [];
    manifestCursor = response.page?.next_cursor ?? null;
    manifestPreparing = Boolean(response.data?.view && response.data.view.status !== 'ready');
    if (response.job?.id && response.job.status !== 'error') {
      const completed = await reviewApi.pollJob(response.job.id, () => undefined);
      if (completed.data?.status === 'completed') {
        const ready = await reviewApi.importManifest(selected.id, { ...query, limit: 300 });
        manifest = ready.data?.items ?? [];
        manifestCursor = ready.page?.next_cursor ?? null;
        manifestPreparing = false;
      } else message = completed.data?.error?.message ?? 'The prepared manifest view failed.';
    }
  }

  async function discover() {
    if (generation === null) return;
    busy = true;
    try {
      const queued = await reviewApi.discoverImports(generation, true);
      generation = queued.meta.generation;
      message = 'Inbox discovery queued. Source media remains read-only.';
      if (queued.job?.id) void watchDiscovery(queued.job.id);
    } catch (error) { message = errorMessage(error, 'Could not enqueue inbox discovery.'); }
    finally { busy = false; }
  }

  async function watchDiscovery(jobId: string) {
    try {
      await reviewApi.pollJob(jobId, (value) => { message = `Inbox scan: ${value.data?.status ?? 'queued'}`; });
      await loadHistory(false);
    } catch (error) { message = errorMessage(error, 'Could not reconnect to inbox discovery.'); }
  }

  async function chooseBatch(batch: ImportBatch) {
    selected = batch;
    preflight = null;
    approval = null;
    currentManifestQuery = {};
    await loadSelected(batch.id);
  }

  async function loadMoreHistory() {
    if (!historyCursor || busy) return;
    busy = true;
    try { await loadHistory(true, true); }
    finally { busy = false; }
  }

  async function loadMoreFolders() {
    if (!selected || !folderCursor || busy) return;
    busy = true;
    try {
      const response = await reviewApi.importFolders(selected.id, 100, folderCursor);
      folders = [...folders, ...(response.data ?? [])];
      folderCursor = response.page?.next_cursor ?? null;
    } catch (error) { message = errorMessage(error, 'Could not load more folders.'); }
    finally { busy = false; }
  }

  async function loadMoreSamples() {
    if (!selected || !sampleCursor || busy) return;
    busy = true;
    try {
      const response = await reviewApi.importSamples(selected.id, 200, sampleCursor);
      samples = [...samples, ...(response.data ?? [])];
      sampleCursor = response.page?.next_cursor ?? null;
    } catch (error) { message = errorMessage(error, 'Could not load older progress samples.'); }
    finally { busy = false; }
  }

  async function loadMoreEvents() {
    if (!selected || !eventCursor || busy) return;
    busy = true;
    try {
      const response = await reviewApi.importEvents(selected.id, 200, eventCursor);
      events = [...events, ...(response.data ?? [])];
      eventCursor = response.page?.next_cursor ?? null;
    } catch (error) { message = errorMessage(error, 'Could not load older events.'); }
    finally { busy = false; }
  }

  async function loadMoreErrors() {
    if (!selected || !errorCursor || busy) return;
    busy = true;
    try {
      const response = await reviewApi.importErrors(selected.id, 200, errorCursor);
      errors = [...errors, ...(response.data ?? [])];
      errorCursor = response.page?.next_cursor ?? null;
    } catch (error) { message = errorMessage(error, 'Could not load older errors.'); }
    finally { busy = false; }
  }

  async function loadMoreManifest() {
    if (!manifestCursor || busy) return;
    busy = true;
    try { await loadManifest(currentManifestQuery, true); }
    catch (error) { message = errorMessage(error, 'Could not load the next manifest page.'); }
    finally { busy = false; }
  }

  async function decide(items: ImportManifestItem[], decision: 'include' | 'exclude') {
    if (!selected || generation === null) return;
    const currentItems = items.map((item) => manifest.find((current) => current.id === item.id) ?? item);
    busy = true;
    try {
      const response = await reviewApi.putImportDecisions(
        selected.id,
        selected.revision,
        currentItems.map((item) => ({ item_id: item.id, decision, expected_revision: item.decision_revision, reason: 'local review interface' })),
        generation
      );
      generation = response.meta.generation;
      message = `${currentItems.length} item decision${currentItems.length === 1 ? '' : 's'} updated. Source files were not changed.`;
      await loadSelected(selected.id);
    } catch (error) {
      message = error instanceof StaleStateError ? 'The manifest changed in another tab. Reloading…' : errorMessage(error, 'Could not update import decisions.');
      await loadSelected(selected.id);
    } finally { busy = false; }
  }

  async function prepareApproval() {
    if (!selected || generation === null) return;
    busy = true;
    try {
      const response = await reviewApi.approvalPreflight(selected.id, selected.revision, generation);
      generation = response.meta.generation;
      if (response.job?.id) {
        const completed = await reviewApi.pollJob(response.job.id, (value) => { preflight = value.data; });
        preflight = completed.data;
        message = completed.data?.status === 'completed' ? 'Approval counts and capacity were measured in the background.' : 'Approval preflight failed.';
      }
    } catch (error) { message = errorMessage(error, 'Could not prepare approval.'); }
    finally { busy = false; }
  }

  async function approve() {
    if (!selected || !preflight || generation === null) return;
    busy = true;
    try {
      const response = await reviewApi.approveImport(selected.id, selected.revision, preflight.id, generation);
      approval = response.data;
      generation = response.meta.generation;
      message = 'Decision snapshot approved. Copying still requires execute authorization.';
    } catch (error) { message = errorMessage(error, 'Could not approve this decision snapshot.'); }
    finally { busy = false; }
  }

  async function execute() {
    if (!selected || !approval || generation === null) return;
    busy = true;
    try {
      const response = await reviewApi.executeImport(selected.id, approval.approval_id, generation);
      generation = response.meta.generation;
      message = 'Execute authorization queued. Progress will continue from persisted worker state.';
      if (response.job?.id) void watchExecute(response.job.id, selected.id);
    } catch (error) { message = errorMessage(error, 'Could not authorize verified copying.'); }
    finally { busy = false; }
  }

  async function watchExecute(jobId: string, batchId: string) {
    try {
      const completed = await reviewApi.pollJob(jobId, () => undefined);
      message = completed.data?.status === 'completed'
        ? 'Verified copy authorized. Progress continues from persisted worker state.'
        : completed.data?.error?.message ?? 'Execute authorization failed.';
      await loadSelected(batchId);
    } catch (error) { message = errorMessage(error, 'Could not reconnect to execute authorization.'); }
  }

  async function control(action: 'pause' | 'resume' | 'cancel') {
    if (!selected || generation === null) return;
    busy = true;
    try {
      const response = await reviewApi.controlImport(selected.id, action, generation);
      generation = response.meta.generation;
      message = action === 'cancel' ? 'Cancellation requested. Verified objects are retained.' : `${action === 'pause' ? 'Pause' : 'Resume'} requested.`;
      await loadSelected(selected.id);
    } catch (error) { message = errorMessage(error, `Could not ${action} this import.`); }
    finally { busy = false; }
  }

  function filtersChanged(filters: { search: string; classification: string; outcome: string; sorts: string[] }) {
    void loadManifest({ search: filters.search, classification: filters.classification ? [filters.classification] : [], outcome: filters.outcome ? [filters.outcome] : [], sort: filters.sorts });
  }

  function toggleComparison(id: string) {
    compareIds = compareIds.includes(id) ? compareIds.filter((value) => value !== id) : [...compareIds, id].slice(-8);
  }

  async function compare() {
    if (compareIds.length < 2) return;
    try { comparison = (await reviewApi.compareImports(compareIds)).data ?? []; }
    catch (error) { message = errorMessage(error, 'Could not compare these imports.'); }
  }

  $effect(() => {
    if (!selected || !activeStatuses.has(selected.status)) return;
    const timer = window.setInterval(() => { if (selected) void loadSelected(selected.id); }, 3_000);
    return () => window.clearInterval(timer);
  });

  onMount(() => {
    void loadHistory();
    const reconnect = () => { message = 'Connection restored. Reloading persisted import state…'; void loadHistory(); };
    window.addEventListener('online', reconnect);
    return () => window.removeEventListener('online', reconnect);
  });

  let filteredEvents = $derived(events.filter((event) => !eventFilter || `${event.level} ${event.event_type} ${event.message}`.toLowerCase().includes(eventFilter.toLowerCase())));
  let phaseIndex = $derived(selected ? phases.indexOf(selected.status) : -1);
</script>

<svelte:head><title>Imports · Media Vault</title></svelte:head>

<header class="page-header compact import-header">
  <div><p class="eyebrow">Reviewed imports</p><h1>Import workspace</h1><p class="lede">Discover inbox batches, review every entry, and authorize verified copies without moving or deleting source media.</p></div>
  <button class="primary" type="button" disabled={busy || generation === null} onclick={discover}>Scan inbox</button>
</header>

<p class="notice" role="status" aria-live="polite">{loading ? 'Loading persisted import state…' : message}</p>

<div class="import-layout">
  <aside class="import-history" aria-labelledby="history-heading">
    <div class="section-heading"><div><p class="eyebrow">Permanent record</p><h2 id="history-heading">Import history</h2></div><span class="count-pill">{batches.length}</span></div>
    {#if batches.length}
      <ul>
        {#each batches as batch}
          <li class:active={selected?.id === batch.id}>
            <button type="button" onclick={() => chooseBatch(batch)}><strong>{batch.name}</strong><span>{batch.status} · {formatNumber.format(batch.counts.discovered ?? 0)} entries</span></button>
            <label><input type="checkbox" checked={compareIds.includes(batch.id)} onchange={() => toggleComparison(batch.id)} aria-label={`Compare ${batch.name}`} /> Compare</label>
          </li>
        {/each}
      </ul>
      {#if historyCursor}<button type="button" disabled={busy} onclick={loadMoreHistory}>Load older imports</button>{/if}
      <button type="button" disabled={compareIds.length < 2} onclick={compare}>Compare selected</button>
    {:else}<p class="inline-empty">No batches yet. Scan the configured inbox to begin.</p>{/if}
  </aside>

  <div class="import-main">
    {#if selected}
      <section class="import-overview" aria-labelledby="batch-heading">
        <div class="section-heading"><div><p class="eyebrow">{selected.status}</p><h2 id="batch-heading">{selected.name}</h2></div><span class="revision-chip">Revision {selected.revision}</span></div>
        <ol class="phase-timeline" aria-label="Import phase timeline">
          {#each phases as phase, index}<li class:done={phaseIndex > index || selected.status === 'complete'} class:current={selected.status === phase}><span>{index + 1}</span>{phase.replaceAll('_', ' ')}</li>{/each}
        </ol>
        <div class="metric-grid">
          <article><span>Discovered</span><strong>{formatNumber.format(selected.counts.discovered ?? 0)}</strong></article>
          <article><span>Processed</span><strong>{formatNumber.format(selected.counts.processed ?? 0)}</strong></article>
          <article><span>Transferred</span><strong>{bytes(selected.bytes.transferred)}</strong></article>
          <article><span>Verified</span><strong>{bytes(selected.bytes.verified)}</strong></article>
          <article><span>Duplicates</span><strong>{formatNumber.format(selected.counts.duplicates ?? 0)}</strong></article>
          <article><span>Errors</span><strong>{formatNumber.format(selected.counts.errors ?? 0)}</strong></article>
        </div>
        <UnavailableMetrics fields={unavailable} />
      </section>

      <ImportTelemetry {samples} />
      {#if sampleCursor}<button class="load-more" type="button" disabled={busy} onclick={loadMoreSamples}>Load older progress samples</button>{/if}

      <section class="folder-panel" aria-labelledby="folders-heading">
        <div class="section-heading"><div><p class="eyebrow">Recursive progress</p><h2 id="folders-heading">Folders</h2></div><span class="count-pill">{folders.length}</span></div>
        <div class="bounded-table"><table><thead><tr><th>Folder</th><th>Phase</th><th>Items</th><th>Copied</th><th>Remaining</th></tr></thead><tbody>
          {#each folders as folder}<tr><td title={folder.relative_path_text}>{folder.relative_path_text || 'Batch root'}</td><td>{folder.phase}</td><td>{folder.subtree_item_count}</td><td>{folder.copied_count}</td><td>{bytes(folder.remaining_bytes)}</td></tr>{/each}
        </tbody></table></div>
        {#if folderCursor}<button type="button" disabled={busy} onclick={loadMoreFolders}>Load more folders</button>{/if}
      </section>

      <ManifestReview items={manifest} preparing={manifestPreparing} disabled={busy} onDecide={decide} onFiltersChange={filtersChanged} />
      {#if manifestCursor}<button class="load-more" type="button" disabled={busy} onclick={loadMoreManifest}>Load next manifest page</button>{/if}

      <ImportApproval batch={selected} {preflight} {approval} {busy} onPrepare={prepareApproval} onApprove={approve} onExecute={execute} onControl={control} />

      <div class="evidence-grid">
        <section class="event-panel" aria-labelledby="events-heading">
          <div class="section-heading"><div><p class="eyebrow">Structured evidence</p><h2 id="events-heading">Event log</h2></div><span class="count-pill">{filteredEvents.length}</span></div>
          <label>Filter events<input bind:value={eventFilter} placeholder="Level, type, or message" /></label>
          <ol class="event-log">{#each filteredEvents as event}<li><time>{event.occurred_at}</time><strong>{event.event_type}</strong><span>{event.message}</span><em>{event.phase} · {event.level}</em></li>{/each}</ol>
          {#if eventCursor}<button type="button" disabled={busy} onclick={loadMoreEvents}>Load older events</button>{/if}
        </section>
        <section class="error-panel" aria-labelledby="errors-heading">
          <div class="section-heading"><div><p class="eyebrow">Actionable problems</p><h2 id="errors-heading">Errors</h2></div><span class="count-pill">{errors.length}</span></div>
          {#each errors as error}<details><summary>{error.code} · {error.phase}</summary><p>{error.cause_text}</p><p><strong>Suggested resolution:</strong> {error.suggested_resolution}</p><p>{error.retryable ? 'Retryable' : 'Not retryable'} · {error.occurred_at}</p></details>{/each}
          {#if !errors.length}<p class="inline-empty">No persisted errors for this import.</p>{/if}
          {#if errorCursor}<button type="button" disabled={busy} onclick={loadMoreErrors}>Load older errors</button>{/if}
        </section>
      </div>
    {:else if !loading}
      <section class="empty-state"><span class="empty-index" aria-hidden="true">06</span><div><h2>Ready for the next inbox batch</h2><p>Scan the configured inbox. Discovery runs in the background and records every file and folder before any copy decision.</p></div></section>
    {/if}
  </div>
</div>

{#if comparison.length}
  <section class="comparison-panel" aria-labelledby="comparison-heading">
    <div class="section-heading"><div><p class="eyebrow">Persisted history</p><h2 id="comparison-heading">Import comparison</h2></div></div>
    <div class="bounded-table"><table><thead><tr><th>Batch</th><th>Status</th><th>Discovered</th><th>Copied</th><th>Failed</th><th>Verified bytes</th></tr></thead><tbody>
      {#each comparison as batch}<tr><td>{batch.name}</td><td>{batch.status}</td><td>{batch.counts.discovered}</td><td>{batch.counts.copied}</td><td>{batch.counts.failed}</td><td>{bytes(batch.bytes.verified)}</td></tr>{/each}
    </tbody></table></div>
  </section>
{/if}
