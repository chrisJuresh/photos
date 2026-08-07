<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import {
    ApiClientError,
    reviewApi,
    type JunkProfile,
    type JunkResult,
    type JunkSettings,
    type Preference
  } from '$lib/api';
  import JunkPreview from '$lib/components/JunkPreview.svelte';
  import JunkProfileControls from '$lib/components/JunkProfileControls.svelte';

  let profiles = $state<JunkProfile[]>([]);
  let selectedProfileId = $state<string | null>(null);
  let preparing = $state<JunkProfile | null>(null);
  let items = $state<JunkResult[]>([]);
  let generation = $state<number | null>(null);
  let nextCursor = $state<string | null>(null);
  let busy = $state(false);
  let showAll = $state(false);
  let preference = $state<Preference | null>(null);
  let message = $state('Loading persisted junk profiles…');
  const abort = new AbortController();

  function errorMessage(error: unknown, fallback: string) {
    return error instanceof ApiClientError ? error.problem.message : fallback;
  }

  function preferenceValue(value: unknown) {
    if (!value || typeof value !== 'object') return { selected_profile_id: null as string | null, show_all: false };
    const candidate = value as Record<string, unknown>;
    return {
      selected_profile_id: typeof candidate.selected_profile_id === 'string' ? candidate.selected_profile_id : null,
      show_all: candidate.show_all === true
    };
  }

  async function savePreference() {
    if (generation === null) return;
    try {
      const response = await reviewApi.putPreference(
        'junk.review',
        { selected_profile_id: selectedProfileId, show_all: showAll },
        preference?.revision ?? 0,
        generation
      );
      preference = response.data;
      generation = response.meta.generation;
    } catch (error) {
      message = errorMessage(error, 'The results loaded, but the junk-review preference could not be saved.');
    }
  }

  async function loadResults(profile: JunkProfile, cursor?: string) {
    selectedProfileId = profile.id;
    const response = await reviewApi.junkResults(profile.id, { hiddenOnly: !showAll, limit: 120, cursor });
    generation = response.meta.generation;
    items = response.data?.items ?? [];
    nextCursor = response.page?.next_cursor ?? null;
    message = `${items.length} persisted candidates shown. Filtering has not changed any review state.`;
  }

  async function loadFoundation() {
    try {
      const preferences = await reviewApi.preferences();
      preference = preferences.data?.find((item) => item.key === 'junk.review') ?? null;
      generation = preferences.meta.generation;
      const saved = preferenceValue(preference?.value);
      showAll = saved.show_all;
      let status;
      try {
        status = await reviewApi.junkStatus(saved.selected_profile_id ?? undefined);
      } catch (error) {
        if (!(error instanceof ApiClientError && error.problem.code === 'junk_profile_not_found')) throw error;
        status = await reviewApi.junkStatus();
      }
      generation = status.meta.generation;
      preparing = status.data?.status === 'ready' ? null : status.data;
      const list = await reviewApi.junkProfiles(100);
      profiles = list.data ?? [];
      generation = list.meta.generation;
      if (status.data?.status === 'ready') await loadResults(status.data);
      else if (status.job?.id) void watch(status.job.id, status.data?.id ?? null);
    } catch (error) {
      message = errorMessage(error, 'Junk review is unavailable.');
    }
  }

  async function watch(jobId: string, profileId: string | null) {
    try {
      const completed = await reviewApi.pollJob(jobId, (value) => {
        message = `Junk preparation: ${value.data?.status ?? 'queued'} · ${value.data?.phase ?? 'waiting'}`;
      }, { signal: abort.signal });
      const list = await reviewApi.junkProfiles(100);
      profiles = list.data ?? [];
      generation = list.meta.generation;
      const profile = profiles.find((value) => value.id === profileId && value.status === 'ready');
      preparing = profiles.find((value) => value.id === profileId && value.status !== 'ready') ?? null;
      if (completed.data?.status === 'completed' && profile) {
        preparing = null;
        await loadResults(profile);
        await savePreference();
      } else if (completed.data?.status !== 'completed') {
        message = completed.data?.error?.message ?? 'Junk profile preparation failed.';
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) message = errorMessage(error, 'Could not reconnect to junk preparation.');
    }
  }

  async function createProfile(name: string, settings: JunkSettings) {
    if (generation === null || busy) return;
    busy = true;
    try {
      const response = await reviewApi.createJunkProfile({ name, settings, replaces_profile_id: selectedProfileId ?? undefined }, generation);
      generation = response.meta.generation;
      if (response.data) {
        profiles = [response.data, ...profiles.filter((value) => value.id !== response.data?.id)];
        if (response.data.status === 'ready') {
          await loadResults(response.data);
          await savePreference();
        }
        else {
          preparing = response.data;
          message = 'The new profile is preparing in the background; the last ready preview remains available.';
          if (response.job?.id) void watch(response.job.id, response.data.id);
        }
      }
    } catch (error) {
      message = errorMessage(error, 'Could not create the junk profile.');
    } finally {
      busy = false;
    }
  }

  async function feedback(item: JunkResult, kind: 'false_positive' | 'false_negative') {
    if (generation === null || !selectedProfileId || busy) return;
    busy = true;
    try {
      const response = await reviewApi.junkFeedback(selectedProfileId, item.entity.id, kind, generation);
      generation = response.meta.generation;
      message = response.data?.calibration_job_id
        ? 'Feedback saved. A versioned calibration is queued; the current profile remains available.'
        : 'Feedback saved as application metadata.';
    } catch (error) {
      message = errorMessage(error, 'Could not save junk feedback.');
    } finally {
      busy = false;
    }
  }

  async function setPreviewMode(value: boolean) {
    showAll = value;
    const profile = profiles.find((item) => item.id === selectedProfileId && item.status === 'ready');
    if (profile) {
      await loadResults(profile);
      await savePreference();
    }
  }

  async function selectProfile(profile: JunkProfile) {
    await loadResults(profile);
    await savePreference();
  }

  onMount(() => { void loadFoundation(); });
  onDestroy(() => abort.abort());
</script>

<svelte:head><title>Junk review · Media Vault</title></svelte:head>

<header class="page-header compact">
  <div>
    <p class="eyebrow">Explainable review acceleration</p>
    <h1>Junk review</h1>
    <p class="lede">Preview versioned signals and effective results before taking any separate metadata action.</p>
  </div>
  <a class="button-link" href="/bulk-reject/">Bulk reject view</a>
</header>

<p class="notice" role="status" aria-live="polite">{message}</p>

<JunkProfileControls
  {profiles}
  {selectedProfileId}
  preparingProfile={preparing}
  disabled={busy}
  onSelect={selectProfile}
  onCreate={createProfile}
/>

<JunkPreview {items} {showAll} disabled={busy} onFeedback={feedback} onShowAll={setPreviewMode} />

{#if nextCursor && selectedProfileId}
  <nav class="library-paging" aria-label="Junk result pages">
    <span>At most 120 persisted results are held in memory.</span>
    <button type="button" disabled={busy} onclick={async () => {
      const profile = profiles.find((value) => value.id === selectedProfileId);
      if (profile && nextCursor) await loadResults(profile, nextCursor);
    }}>Next page</button>
  </nav>
{/if}
