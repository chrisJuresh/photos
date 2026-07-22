<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { ApiClientError, reviewApi, type JunkProfile, type JunkResult, type Preference } from '$lib/api';
  import BulkRejectView from '$lib/components/BulkRejectView.svelte';

  let profiles = $state<JunkProfile[]>([]);
  let selectedProfileId = $state<string | null>(null);
  let items = $state<JunkResult[]>([]);
  let generation = $state<number | null>(null);
  let nextCursor = $state<string | null>(null);
  let lastActionId = $state<string | null>(null);
  let busy = $state(false);
  let preference = $state<Preference | null>(null);
  let message = $state('Loading persisted junk candidates…');
  const abort = new AbortController();

  function errorMessage(error: unknown, fallback: string) {
    return error instanceof ApiClientError ? error.problem.message : fallback;
  }

  function selectedPreference(value: unknown) {
    if (!value || typeof value !== 'object') return null;
    const selected = (value as Record<string, unknown>).selected_profile_id;
    return typeof selected === 'string' ? selected : null;
  }

  async function saveSelectedProfile() {
    if (generation === null) return;
    const existing = preference?.value && typeof preference.value === 'object'
      ? preference.value as Record<string, unknown>
      : {};
    try {
      const response = await reviewApi.putPreference(
        'junk.review',
        { ...existing, selected_profile_id: selectedProfileId },
        preference?.revision ?? 0,
        generation
      );
      preference = response.data;
      generation = response.meta.generation;
    } catch (error) {
      message = errorMessage(error, 'The profile loaded, but its selection could not be saved.');
    }
  }

  async function loadFoundation() {
    try {
      const preferences = await reviewApi.preferences();
      preference = preferences.data?.find((item) => item.key === 'junk.review') ?? null;
      generation = preferences.meta.generation;
      await load(selectedPreference(preference?.value) ?? undefined);
    } catch (error) {
      message = errorMessage(error, 'Bulk reject is unavailable.');
    }
  }

  async function selectProfile(profileId: string) {
    await load(profileId);
    await saveSelectedProfile();
  }

  async function load(profileId?: string, cursor?: string) {
    try {
      const status = await reviewApi.junkStatus(profileId);
      generation = status.meta.generation;
      if (!status.data || status.data.status !== 'ready') {
        items = [];
        message = 'The selected junk profile is still preparing. Return to Junk review to inspect its job state.';
        return;
      }
      selectedProfileId = status.data.id;
      const response = await reviewApi.junkResults(status.data.id, { hiddenOnly: true, limit: 120, cursor });
      generation = response.meta.generation;
      items = response.data?.items ?? [];
      nextCursor = response.page?.next_cursor ?? null;
      message = `${items.length} effective candidates loaded for explicit, metadata-only review.`;
      const list = await reviewApi.junkProfiles(100);
      profiles = list.data ?? [];
      generation = list.meta.generation;
    } catch (error) {
      if (profileId && error instanceof ApiClientError && error.problem.code === 'junk_profile_not_found') {
        await load();
        return;
      }
      message = errorMessage(error, 'Bulk reject is unavailable.');
    }
  }

  async function reject(chosen: JunkResult[], options: { confirmFavourites: boolean; confirmLargeSelection: boolean }) {
    if (generation === null || busy) return;
    busy = true;
    try {
      const response = await reviewApi.bulkReject(
        chosen.map((item) => ({ entity_id: item.entity.id, expected_revision: item.entity.state.revision })),
        generation,
        options
      );
      generation = response.meta.generation;
      lastActionId = response.data?.action_id ?? null;
      message = `${response.data?.states.length ?? 0} entities rejected in metadata. No media was changed.`;
      if (selectedProfileId) await load(selectedProfileId);
    } catch (error) {
      message = errorMessage(error, 'Bulk rejection failed without changing the selection.');
    } finally {
      busy = false;
    }
  }

  async function undo(actionId: string) {
    if (generation === null || busy) return;
    busy = true;
    try {
      const response = await reviewApi.undoBulkReject(actionId, generation);
      generation = response.meta.generation;
      lastActionId = null;
      message = `${response.data?.states.length ?? 0} metadata states restored.`;
      if (selectedProfileId) await load(selectedProfileId);
    } catch (error) {
      message = errorMessage(error, 'Undo could not be applied because state changed.');
    } finally {
      busy = false;
    }
  }

  async function expandStack(profileId: string, stackId: string) {
    try {
      const response = await reviewApi.stackDetail(profileId, stackId);
      generation = response.meta.generation;
      return response.data?.members.map((member) => member.entity) ?? [];
    } catch (error) {
      message = errorMessage(error, 'Persisted Stack membership is unavailable.');
      return [];
    }
  }

  onMount(() => { void loadFoundation(); });
  onDestroy(() => abort.abort());
</script>

<svelte:head><title>Bulk reject · Media Vault</title></svelte:head>

<header class="page-header compact">
  <div>
    <p class="eyebrow">Dedicated review route</p>
    <h1>Bulk reject</h1>
    <p class="lede">Select persisted candidates, review exact warnings, confirm, and retain an undo record. Media files remain immutable.</p>
  </div>
  <a class="button-link" href="/junk/">Back to junk explanations</a>
</header>

<p class="notice" role="status" aria-live="polite">{message}</p>

{#if profiles.length}
  <label class="profile-picker">Junk profile
    <select value={selectedProfileId ?? ''} disabled={busy} onchange={(event) => void selectProfile(event.currentTarget.value)}>
      {#each profiles.filter((profile) => profile.status === 'ready') as profile (profile.id)}
        <option value={profile.id}>{profile.name} · {profile.effectively_hidden_count} candidates</option>
      {/each}
    </select>
  </label>
{/if}

<BulkRejectView {items} {lastActionId} disabled={busy} onReject={reject} onUndo={undo} onExpandStack={expandStack} />

{#if nextCursor && selectedProfileId}
  <nav class="library-paging" aria-label="Bulk reject pages">
    <span>At most 120 candidates are held in memory.</span>
    <button type="button" disabled={busy} onclick={() => void load(selectedProfileId ?? undefined, nextCursor ?? undefined)}>Next page</button>
  </nav>
{/if}
