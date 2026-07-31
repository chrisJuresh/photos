<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ApiClientError,
    reviewApi,
    StaleStateError,
    type BackfillState,
    type Preference,
    type SavedView
  } from '$lib/api';
  import ThemeControls from '$lib/components/ThemeControls.svelte';
  import { applyTheme, type ThemePreference } from '$lib/theme';

  type Appearance = { theme: ThemePreference; density: 'comfortable' | 'compact' };

  let appearance = $state<Appearance>({ theme: 'system', density: 'comfortable' });
  let preference = $state<Preference | null>(null);
  let views = $state<SavedView[]>([]);
  let generation = $state<number | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let message = $state('Loading settings…');
  let newViewName = $state('');
  let backfill = $state<BackfillState | null>(null);
  let backfillBusy = $state(false);

  function processedAssets(state: BackfillState): number {
    return (state.progress.asset_jobs_completed ?? 0) + (state.progress.asset_jobs_failed ?? 0);
  }

  function durationLabel(seconds: number): string {
    const totalMinutes = Math.max(1, Math.ceil(seconds / 60));
    const days = Math.floor(totalMinutes / 1_440);
    const hours = Math.floor((totalMinutes % 1_440) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) return `${days}d${hours > 0 ? ` ${hours}h` : ''}`;
    if (hours > 0) return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    return `${minutes}m`;
  }

  function etaLabel(state: BackfillState): string {
    const seconds = state.progress.eta_seconds;
    if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return 'ETA learning from completed assets';
    if (seconds <= 0) return 'Asset preparation complete';
    const estimate = `${durationLabel(seconds)} active processing remaining`;
    const confidence = state.progress.eta_confidence ?? 'learning';
    return state.status === 'paused'
      ? `Paused · ${estimate} · ${confidence} confidence`
      : `ETA ${estimate} · ${confidence} confidence`;
  }

  async function load() {
    loading = true;
    try {
      const [preferences, saved, backfillResponse] = await Promise.all([
        reviewApi.preferences(),
        reviewApi.savedViews(),
        reviewApi.backfill()
      ]);
      generation = backfillResponse.meta.generation ?? saved.meta.generation ?? preferences.meta.generation;
      preference = preferences.data?.find((item) => item.key === 'appearance') ?? null;
      if (preference?.value && typeof preference.value === 'object') {
        appearance = { ...appearance, ...(preference.value as Partial<Appearance>) };
      }
      views = saved.data ?? [];
      backfill = backfillResponse.data;
      applyTheme(appearance.theme);
      message = 'Settings loaded from the vault database.';
    } catch (error) {
      message = error instanceof ApiClientError ? error.problem.message : 'Settings are unavailable.';
    } finally {
      loading = false;
    }
  }

  async function saveAppearance(next: Appearance) {
    if (generation === null) return;
    saving = true;
    appearance = next;
    applyTheme(next.theme);
    try {
      const response = await reviewApi.putPreference('appearance', next, preference?.revision ?? 0, generation);
      preference = response.data;
      generation = response.meta.generation;
      message = 'Appearance saved.';
    } catch (error) {
      message = error instanceof StaleStateError ? 'Settings changed elsewhere. Reloading…' : 'Could not save appearance.';
      await load();
    } finally {
      saving = false;
    }
  }

  async function addSavedView() {
    if (generation === null || !newViewName.trim()) return;
    saving = true;
    try {
      const response = await reviewApi.createSavedView(
        { name: newViewName.trim(), route: '/', state: { shell: true } },
        generation
      );
      if (response.data) views = [response.data, ...views];
      generation = response.meta.generation;
      newViewName = '';
      message = 'Workspace view saved.';
    } catch (error) {
      message = error instanceof StaleStateError ? 'Views changed elsewhere. Reloading…' : 'Could not save this view.';
      await load();
    } finally {
      saving = false;
    }
  }

  async function refreshBackfill() {
    try {
      const response = await reviewApi.backfill();
      backfill = response.data;
      generation = response.meta.generation ?? generation;
    } catch {
      if (backfill && !['completed', 'failed'].includes(backfill.status)) {
        message = 'The local service is offline. Persisted backfill work is safe and will resume after reconnecting.';
      }
    }
  }

  async function controlBackfill(action: 'start' | 'pause' | 'resume') {
    if (generation === null) return;
    backfillBusy = true;
    try {
      const response = action === 'start'
        ? await reviewApi.controlBackfill(action, generation, backfill?.status === 'completed')
        : await reviewApi.controlBackfill(action, generation);
      backfill = response.data;
      generation = response.meta.generation;
      message = action === 'pause'
        ? 'Backfill pause requested. The current bounded item may finish before work stops.'
        : action === 'resume'
          ? 'Backfill resumed from persisted progress.'
          : 'Backfill queued. Media analysis remains in the low-priority background worker.';
    } catch (error) {
      message = error instanceof StaleStateError ? 'Backfill state changed elsewhere. Reloading…' : 'Could not update backfill control.';
      await load();
    } finally {
      backfillBusy = false;
    }
  }

  onMount(() => {
    void load();
    const timer = window.setInterval(() => void refreshBackfill(), 5_000);
    return () => window.clearInterval(timer);
  });
</script>

<svelte:head><title>Settings · Media Vault</title></svelte:head>

<header class="page-header compact">
  <p class="eyebrow">Workspace preferences</p>
  <h1>Settings</h1>
  <p class="lede">Application preferences and saved views are authoritative in SQLite and use revision-safe updates across tabs.</p>
</header>

<p class="notice" role="status" aria-live="polite">{message}</p>

<div class="settings-grid" aria-busy={loading || saving}>
  <section class="settings-panel" aria-labelledby="appearance-title">
    <h2 id="appearance-title">Display</h2>
    <ThemeControls
      theme={appearance.theme}
      density={appearance.density}
      disabled={loading || saving || generation === null}
      onThemeChange={(theme) => void saveAppearance({ ...appearance, theme })}
      onDensityChange={(density) => void saveAppearance({ ...appearance, density })}
    />
    <p class="setting-note">Reduced motion follows your operating-system preference automatically.</p>
  </section>

  <section class="settings-panel" aria-labelledby="views-title">
    <div class="panel-heading">
      <div>
        <h2 id="views-title">Saved views</h2>
        <p>Reusable shell state; feature filters arrive with their approved stages.</p>
      </div>
      <span class="count-pill">{views.length}</span>
    </div>
    <form onsubmit={(event) => { event.preventDefault(); void addSavedView(); }}>
      <label for="view-name">View name</label>
      <div class="inline-form">
        <input id="view-name" bind:value={newViewName} maxlength="120" autocomplete="off" placeholder="Morning review" />
        <button class="primary" type="submit" disabled={saving || generation === null || !newViewName.trim()}>Save</button>
      </div>
    </form>
    {#if views.length}
      <ul class="saved-views">
        {#each views as view (view.id)}
          <li><a href={view.route}>{view.name}</a><span>Revision {view.revision}</span></li>
        {/each}
      </ul>
    {:else if !loading}
      <p class="muted">No saved views yet.</p>
    {/if}
  </section>

  <section class="settings-panel backfill-panel" aria-labelledby="backfill-title">
    <div class="panel-heading">
      <div>
        <h2 id="backfill-title">Vault preparation</h2>
        <p>Resumable low-priority jobs prepare derivatives, metadata, facets, Stacks, junk evidence, map clusters, and legacy history.</p>
      </div>
      <span class="status-pill">{backfill?.status ?? 'checking'}</span>
    </div>
    <dl class="backfill-summary">
      <div><dt>Phase</dt><dd>{backfill?.phase?.replaceAll('_', ' ') ?? 'Not available'}</dd></div>
      <div><dt>Completed assets</dt><dd>{backfill?.progress.asset_jobs_completed ?? 0} / {backfill?.progress.asset_total ?? 'learning'}</dd></div>
      <div><dt>Unavailable outputs</dt><dd>{backfill?.progress.asset_outputs_unavailable ?? 0}</dd></div>
      <div><dt>Failed jobs</dt><dd>{backfill?.progress.asset_jobs_failed ?? 0}</dd></div>
    </dl>
    {#if typeof backfill?.progress.asset_total === 'number' && backfill.progress.asset_total > 0}
      <label class="backfill-progress">
        <span class="backfill-progress-heading">
          <span>Prepared asset progress</span>
          <strong>{etaLabel(backfill)}</strong>
        </span>
        <progress max={backfill.progress.asset_total} value={processedAssets(backfill)}></progress>
      </label>
    {/if}
    <p class="setting-note">{backfill?.progress.message ?? 'Preparation has not started. Starting it only enqueues durable work.'}</p>
    {#if backfill?.error}<p class="backfill-error" role="alert">{backfill.error}</p>{/if}
    <div class="control-row">
      {#if !backfill?.id || ['not_started', 'failed', 'completed', 'cancelled'].includes(backfill.status)}
        <button class="primary" type="button" disabled={backfillBusy || generation === null} onclick={() => void controlBackfill('start')}>
          {backfill?.status === 'completed' ? 'Verify current preparation' : 'Start preparation'}
        </button>
      {:else if backfill.status === 'paused'}
        <button class="primary" type="button" disabled={backfillBusy || generation === null} onclick={() => void controlBackfill('resume')}>Resume preparation</button>
      {:else}
        <button type="button" disabled={backfillBusy || generation === null} onclick={() => void controlBackfill('pause')}>Pause after current item</button>
      {/if}
      <button type="button" disabled={backfillBusy} onclick={() => void refreshBackfill()}>Refresh persisted status</button>
    </div>
    <p class="setting-note">Reviewed imports have priority 100; backfill media jobs run at priority {backfill?.progress.throttle?.asset_job_priority ?? 5} in batches of {backfill?.progress.throttle?.asset_batch_size ?? 32}. ETA uses persisted completed-attempt durations and excludes paused time and final materialization phases.</p>
  </section>
</div>
