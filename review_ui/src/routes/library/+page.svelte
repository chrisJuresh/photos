<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import {
    ApiClientError,
    StaleStateError,
    reviewApi,
    type LibraryDetail,
    type LibraryEntity,
    type LibraryFacet,
    type LibraryQuery,
    type LibraryState,
    type LibraryView,
    type Preference,
    type SavedView,
    type StackDetail,
    type StackMember,
    type StackProfile,
    type StackSettings
  } from '$lib/api';
  import LibraryFilters from '$lib/components/LibraryFilters.svelte';
  import LibraryGrid from '$lib/components/LibraryGrid.svelte';
  import LibraryInspector from '$lib/components/LibraryInspector.svelte';
  import StackProfileControls from '$lib/components/StackProfileControls.svelte';
  import { restoreScrollState, saveScrollState } from '$lib/scroll-state';

  type LibraryPreference = {
    density: number;
    contactSheet: boolean;
    grayscale: boolean;
    query: LibraryQuery;
  };

  const defaultPreference: LibraryPreference = {
    density: 220,
    contactSheet: false,
    grayscale: false,
    query: { rejected: 'hide', sort: ['capture_time:desc'] }
  };
  const libraryPageSize = 60;
  const facetNames = ['media_kind', 'format', 'camera', 'lens', 'folder'];

  let items = $state<LibraryEntity[]>([]);
  let query = $state<LibraryQuery>({ ...defaultPreference.query });
  let density = $state(defaultPreference.density);
  let contactSheet = $state(false);
  let grayscale = $state(false);
  let facets = $state<Record<string, LibraryFacet[]>>({});
  let generation = $state<number | null>(null);
  let preference = $state<Preference | null>(null);
  let savedViews = $state<SavedView[]>([]);
  let nextCursor = $state<string | null>(null);
  let cursorStack = $state<Array<string | undefined>>([undefined]);
  let pageIndex = $state(0);
  let selected = $state(new Set<string>());
  let selectionAnchor = $state(-1);
  let detail = $state<LibraryDetail | null>(null);
  let stackRestMembers = $state<LibraryEntity[]>([]);
  let inspectorLoading = $state(false);
  let loading = $state(true);
  let loadError = $state<string | null>(null);
  let busy = $state(false);
  let preparing = $state<LibraryView | null>(null);
  let message = $state('Loading the persisted library catalog…');
  let scrollTop = $state(restoreScrollState('library')?.y ?? 0);
  let preparationJob = '';
  let newViewName = $state('');
  let stackProfiles = $state<StackProfile[]>([]);
  let selectedStackProfileId = $state<string | null>(null);
  let stackPreparing = $state<StackProfile | null>(null);
  let stackDetails = $state<Record<string, StackDetail>>({});
  let stackPreparationJob = '';
  let stackFoundationLoading = false;
  const abort = new AbortController();

  function errorMessage(error: unknown, fallback: string) {
    return error instanceof ApiClientError ? error.problem.message : fallback;
  }

  function preferenceValue(value: unknown): LibraryPreference {
    if (!value || typeof value !== 'object') return defaultPreference;
    const candidate = value as Partial<LibraryPreference>;
    return {
      density: typeof candidate.density === 'number' ? candidate.density : defaultPreference.density,
      contactSheet: Boolean(candidate.contactSheet),
      grayscale: Boolean(candidate.grayscale),
      query: candidate.query && typeof candidate.query === 'object' ? candidate.query : defaultPreference.query
    };
  }

  async function loadLibrary(cursor = cursorStack[pageIndex]) {
    loading = true;
    loadError = null;
    try {
      const response = await reviewApi.library({ ...query, limit: libraryPageSize, cursor });
      generation = response.meta.generation;
      items = response.data?.items ?? [];
      nextCursor = response.page?.next_cursor ?? null;
      selected = new Set();
      selectionAnchor = -1;
      preparing = response.data?.view?.status && response.data.view.status !== 'ready' ? response.data.view : null;
      if (response.job?.id && !['completed', 'failed', 'cancelled'].includes(response.job.status)) {
        message = response.job.phase === 'library_catalog' ? 'Preparing logical photo entities and facets in the background.' : 'Preparing this compound view in the background. The last ready catalog remains unchanged.';
        if (preparationJob !== response.job.id) {
          preparationJob = response.job.id;
          void watchPreparation(response.job.id);
        }
      } else {
        preparing = null;
        message = `${items.length.toLocaleString()} logical photos loaded in this bounded page.`;
        void loadFacets();
        void loadStackFoundation();
      }
    } catch (error) {
      loadError = errorMessage(error, 'The library is unavailable.');
      message = loadError;
    } finally {
      loading = false;
    }
  }

  async function watchPreparation(jobId: string) {
    try {
      const completed = await reviewApi.pollJob(jobId, (value) => {
        message = `Library preparation: ${value.data?.status ?? 'queued'} · ${value.data?.phase ?? 'waiting'}`;
      }, { signal: abort.signal });
      if (completed.data?.status === 'completed') {
        preparationJob = '';
        await loadLibrary(cursorStack[pageIndex]);
      } else message = completed.data?.error?.message ?? 'Library preparation failed.';
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        message = errorMessage(error, 'Could not reconnect to library preparation.');
      }
    }
  }

  async function loadFacets() {
    const results = await Promise.allSettled(facetNames.map((name) => reviewApi.libraryFacets(name, 100)));
    const values: Record<string, LibraryFacet[]> = {};
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') values[facetNames[index]] = result.value.data ?? [];
    });
    facets = values;
  }

  async function loadStackFoundation() {
    if (stackFoundationLoading || preparing) return;
    stackFoundationLoading = true;
    try {
      let status;
      try {
        status = await reviewApi.stackStatus(query.stackProfileId);
      } catch (error) {
        if (!(error instanceof ApiClientError && error.problem.code === 'stack_profile_not_found' && query.stackProfileId)) throw error;
        query = { ...query, stackProfileId: undefined };
        selectedStackProfileId = '';
        status = await reviewApi.stackStatus();
      }
      generation = status.meta.generation;
      const list = await reviewApi.stackProfiles(100);
      generation = list.meta.generation;
      stackProfiles = list.data ?? [];
      stackPreparing = status.data?.status === 'ready' ? null : status.data;
      if (status.job?.id && status.data?.status !== 'ready' && stackPreparationJob !== status.job.id) {
        stackPreparationJob = status.job.id;
        void watchStackPreparation(status.job.id, status.data?.id ?? null);
      }
      const preferred = stackProfiles.find((profile) => profile.id === query.stackProfileId && profile.status === 'ready')
        ?? stackProfiles.find((profile) => profile.is_default && profile.status === 'ready')
        ?? stackProfiles.find((profile) => profile.status === 'ready');
      if (preferred) {
        selectedStackProfileId = preferred.id;
        if (!query.stackProfileId) {
          query = { ...query, stackProfileId: preferred.id, sort: ['similarity:asc'] };
          cursorStack = [undefined];
          pageIndex = 0;
          stackDetails = {};
          await loadLibrary();
        }
      }
    } catch (error) {
      if (!(error instanceof ApiClientError && ['library_preparing', 'stack_profile_not_ready'].includes(error.problem.code))) {
        message = errorMessage(error, 'Could not load persisted Stack profiles.');
      }
    } finally {
      stackFoundationLoading = false;
    }
  }

  async function watchStackPreparation(jobId: string, selectProfileId: string | null) {
    try {
      const completed = await reviewApi.pollJob(jobId, (value) => {
        message = `Stack preparation: ${value.data?.status ?? 'queued'} · ${value.data?.phase ?? 'waiting'}`;
      }, { signal: abort.signal });
      stackPreparationJob = '';
      if (completed.data?.status === 'completed') {
        stackPreparing = null;
        const list = await reviewApi.stackProfiles(100);
        stackProfiles = list.data ?? [];
        generation = list.meta.generation;
        const selectedProfile = stackProfiles.find((profile) => profile.id === selectProfileId && profile.status === 'ready');
        if (selectedProfile) await selectStackProfile(selectedProfile);
      } else {
        const list = await reviewApi.stackProfiles(100);
        stackProfiles = list.data ?? [];
        generation = list.meta.generation;
        stackPreparing = stackProfiles.find((profile) => profile.id === selectProfileId) ?? null;
        message = completed.data?.error?.message ?? 'Stack preparation failed.';
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        message = errorMessage(error, 'Could not reconnect to Stack preparation.');
      }
    }
  }

  async function createStackProfile(name: string, settings: StackSettings) {
    if (generation === null || busy) return;
    busy = true;
    try {
      const response = await reviewApi.createStackProfile({ name, settings }, generation);
      generation = response.meta.generation;
      if (response.data) {
        stackProfiles = [response.data, ...stackProfiles.filter((profile) => profile.id !== response.data?.id)];
        if (response.data.status === 'ready') await selectStackProfile(response.data);
        else {
          stackPreparing = response.data;
          if (response.job?.id) {
            stackPreparationJob = response.job.id;
            void watchStackPreparation(response.job.id, response.data.id);
          }
        }
      }
      message = 'Stack profile queued. The current ready profile remains visible until replacement completes.';
    } catch (error) {
      message = errorMessage(error, 'Could not create the Stack profile.');
    } finally { busy = false; }
  }

  async function rejectStackRest(entity: LibraryEntity, confirmFavourites: boolean, confirmLargeSelection: boolean) {
    if (generation === null || !entity.stack || busy) return;
    busy = true;
    try {
      const response = await reviewApi.rejectStackRest(
        entity.stack.profile_id,
        entity.stack.id,
        entity.stack.revision,
        generation,
        { confirmFavourites, confirmLargeSelection }
      );
      generation = response.meta.generation;
      message = `${response.data?.states.length ?? 0} Stack members rejected in metadata. The cover and all media remain unchanged.`;
      await loadLibrary(cursorStack[pageIndex]);
      await inspect(entity);
    } catch (error) {
      message = errorMessage(error, 'Could not reject the remaining Stack members.');
    } finally {
      busy = false;
    }
  }

  async function selectStackProfile(profile: StackProfile) {
    if (profile.status !== 'ready') return;
    selectedStackProfileId = profile.id;
    stackDetails = {};
    await applyView({
      density,
      contactSheet,
      grayscale,
      query: { ...query, stackProfileId: profile.id, sort: ['similarity:asc'] }
    });
    message = `${profile.name} is active. Grouping and cover order come from persisted Stack rows.`;
  }

  async function expandStack(entity: LibraryEntity) {
    if (!entity.stack) return;
    if (stackDetails[entity.stack.id]) {
      const next = { ...stackDetails };
      delete next[entity.stack.id];
      stackDetails = next;
      return;
    }
    try {
      const response = await reviewApi.stackDetail(entity.stack.profile_id, entity.stack.id);
      generation = response.meta.generation;
      if (response.data) stackDetails = { ...stackDetails, [entity.stack.id]: response.data };
    } catch (error) { message = errorMessage(error, 'Could not load persisted Stack members.'); }
  }

  async function setStackCover(entity: LibraryEntity, member: StackMember) {
    if (generation === null || !entity.stack || busy) return;
    busy = true;
    try {
      const response = await reviewApi.putStackCover(
        entity.stack.profile_id,
        entity.stack.id,
        member.entity.id,
        entity.stack.revision,
        generation
      );
      generation = response.meta.generation;
      stackDetails = {};
      cursorStack = [undefined];
      pageIndex = 0;
      await loadLibrary();
      message = 'Metadata-only Stack cover override saved. Original and canonical media remain unchanged.';
    } catch (error) {
      message = errorMessage(error, 'Could not update the Stack cover.');
      if (error instanceof StaleStateError) await loadLibrary();
    } finally { busy = false; }
  }

  async function loadFoundation() {
    try {
      const [preferences, views] = await Promise.all([reviewApi.preferences(), reviewApi.savedViews(100)]);
      generation = views.meta.generation ?? preferences.meta.generation;
      preference = preferences.data?.find((item) => item.key === 'library.browser') ?? null;
      const value = preferenceValue(preference?.value);
      density = value.density;
      contactSheet = value.contactSheet;
      grayscale = value.grayscale;
      query = value.query;
      const linked = new URLSearchParams(window.location.search);
      const organizationKind = linked.get('organization_kind');
      const organizationKey = linked.get('organization_key');
      if (
        organizationKey &&
        organizationKind &&
        ['calendar', 'folder', 'camera', 'lens', 'map'].includes(organizationKind)
      ) {
        query = {
          ...query,
          organizationKind: organizationKind as LibraryQuery['organizationKind'],
          organizationKey
        };
      }
      savedViews = (views.data ?? []).filter((view) => view.route === '/library/');
      await loadLibrary();
    } catch (error) {
      loading = false;
      message = errorMessage(error, 'The library foundation is unavailable.');
    }
  }

  async function applyView(value: LibraryPreference) {
    query = value.query;
    density = value.density;
    contactSheet = value.contactSheet;
    grayscale = value.grayscale;
    selectedStackProfileId = value.query.stackProfileId ?? null;
    stackDetails = {};
    cursorStack = [undefined];
    pageIndex = 0;
    scrollTop = 0;
    await loadLibrary();
    if (generation === null) return;
    try {
      const response = await reviewApi.putPreference('library.browser', value, preference?.revision ?? 0, generation);
      preference = response.data;
      generation = response.meta.generation;
      message = `${message} View settings saved.`;
    } catch (error) {
      if (error instanceof StaleStateError) await loadFoundation();
      else message = errorMessage(error, 'The view loaded, but its preference could not be saved.');
    }
  }

  function choose(entity: LibraryEntity, extend: boolean) {
    const index = items.findIndex((item) => item.id === entity.id);
    const next = new Set(selected);
    if (extend && selectionAnchor >= 0) {
      const [start, end] = [selectionAnchor, index].sort((left, right) => left - right);
      for (let current = start; current <= end; current += 1) next.add(items[current].id);
    } else {
      if (next.has(entity.id)) next.delete(entity.id); else next.add(entity.id);
      selectionAnchor = index;
    }
    selected = next;
  }

  async function setState(entity: LibraryEntity, state: LibraryState) {
    if (generation === null) return;
    busy = true;
    try {
      const response = await reviewApi.putLibraryState([
        {
          entity_id: entity.id,
          expected_revision: entity.state.revision,
          favourite: state.favourite,
          rejected: state.rejected,
          rating: state.rating
        }
      ], generation);
      generation = response.meta.generation;
      const persisted = response.data?.states[0];
      if (persisted) {
        const nextState = {
          favourite: persisted.favourite,
          rejected: persisted.rejected,
          rating: persisted.rating,
          revision: persisted.revision
        };
        if (detail?.entity.id === entity.id) detail = { ...detail, entity: { ...detail.entity, state: nextState } };
      }
      cursorStack = [undefined];
      pageIndex = 0;
      scrollTop = 0;
      await loadLibrary();
      message = 'Metadata-only photo state saved. No media file was changed.';
    } catch (error) {
      message = error instanceof StaleStateError ? 'Photo state changed elsewhere. Reloading the page…' : errorMessage(error, 'Could not save photo state.');
      if (error instanceof StaleStateError) await loadLibrary();
    } finally {
      busy = false;
    }
  }

  async function setSelected(patch: Partial<LibraryState>) {
    if (generation === null || !selected.size) return;
    const chosen = items.filter((item) => selected.has(item.id));
    busy = true;
    try {
      const response = await reviewApi.putLibraryState(chosen.map((entity) => ({
        entity_id: entity.id,
        expected_revision: entity.state.revision,
        favourite: patch.favourite ?? entity.state.favourite,
        rejected: patch.rejected ?? entity.state.rejected,
        rating: patch.rating ?? entity.state.rating
      })), generation);
      generation = response.meta.generation;
      cursorStack = [undefined];
      pageIndex = 0;
      scrollTop = 0;
      await loadLibrary();
      message = `${chosen.length} metadata records updated. Media remains immutable.`;
    } catch (error) {
      message = errorMessage(error, 'Could not update the selected metadata.');
      if (error instanceof StaleStateError) await loadLibrary();
    } finally { busy = false; }
  }

  async function inspect(entity: LibraryEntity) {
    inspectorLoading = true;
    detail = null;
    stackRestMembers = [];
    try {
      const [response, stackResponse] = await Promise.all([
        reviewApi.libraryDetail(entity.id),
        entity.stack && entity.stack.member_count > 1
          ? reviewApi.stackDetail(entity.stack.profile_id, entity.stack.id)
          : Promise.resolve(null)
      ]);
      detail = response.data;
      stackRestMembers = stackResponse?.data?.members
        .map((member) => member.entity)
        .filter((member) => member.id !== entity.stack?.cover_entity_id) ?? [];
      generation = stackResponse?.meta.generation ?? response.meta.generation;
    } catch (error) { message = errorMessage(error, 'Could not load persisted photo evidence.'); }
    finally { inspectorLoading = false; }
  }

  async function openFolder(entity: LibraryEntity) {
    if (generation === null) return;
    try {
      await reviewApi.openLibraryFolder(entity.id, generation);
      message = 'Windows Explorer opened a database-resolved present path.';
    } catch (error) { message = errorMessage(error, 'No stored present path could be opened.'); }
  }

  async function refreshCatalog() {
    if (generation === null || busy) return;
    busy = true;
    try {
      const response = await reviewApi.prepareLibrary(generation);
      generation = response.meta.generation;
      if (response.job?.id) {
        preparing = response.data;
        preparationJob = response.job.id;
        void watchPreparation(response.job.id);
      }
      message = 'A fresh logical-photo catalog was queued. Original media remains read-only.';
    } catch (error) { message = errorMessage(error, 'Could not queue a catalog refresh.'); }
    finally { busy = false; }
  }

  async function saveView() {
    if (generation === null || !newViewName.trim()) return;
    try {
      const response = await reviewApi.createSavedView({
        name: newViewName.trim(),
        route: '/library/',
        state: { density, contactSheet, grayscale, query }
      }, generation);
      generation = response.meta.generation;
      if (response.data) savedViews = [response.data, ...savedViews];
      newViewName = '';
      message = 'Library view saved in SQLite.';
    } catch (error) { message = errorMessage(error, 'Could not save this library view.'); }
  }

  async function applySavedView(view: SavedView) {
    await applyView(preferenceValue(view.state));
  }

  async function nextPage() {
    if (!nextCursor) return;
    cursorStack = [...cursorStack.slice(0, pageIndex + 1), nextCursor];
    pageIndex += 1;
    scrollTop = 0;
    await loadLibrary(nextCursor);
  }

  async function previousPage() {
    if (pageIndex === 0) return;
    pageIndex -= 1;
    cursorStack = cursorStack.slice(0, pageIndex + 1);
    scrollTop = 0;
    await loadLibrary(cursorStack[pageIndex]);
  }

  function keyboardActions(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
    const chosen = items.filter((item) => selected.has(item.id));
    if (event.key.toLowerCase() === 'f' && chosen.length) void setSelected({ favourite: true });
    if (event.key.toLowerCase() === 'x' && chosen.length) void setSelected({ rejected: true });
    if (event.key.toLowerCase() === 'i' && chosen[0]) void inspect(chosen[0]);
  }

  onMount(() => {
    window.addEventListener('keydown', keyboardActions);
    void loadFoundation();
    return () => window.removeEventListener('keydown', keyboardActions);
  });

  onDestroy(() => {
    abort.abort();
    saveScrollState('library', { x: 0, y: scrollTop, anchor: items[0]?.id });
  });
</script>

<svelte:head><title>Library · Media Vault</title></svelte:head>

<header class="page-header compact library-header">
  <div>
    <p class="eyebrow">Vault library</p>
    <h1>Photo browser</h1>
    <p class="lede">A bounded logical-photo grid backed by persisted derivatives, metadata, facets, and metadata-only review state.</p>
  </div>
  <button type="button" onclick={() => void refreshCatalog()} disabled={busy || generation === null}>Refresh prepared catalog</button>
</header>

<p class="notice" role="status" aria-live="polite">{message}</p>

{#if query.organizationKind && query.organizationKey}
  <aside class="linked-view-notice">
    <strong>Linked {query.organizationKind} view</strong>
    <span>This bounded library view uses persisted Stage 8 membership for {query.organizationKey}.</span>
    <a href="/organize/">Back to organization views</a>
  </aside>
{/if}

<StackProfileControls
  profiles={stackProfiles}
  selectedProfileId={selectedStackProfileId}
  preparingProfile={stackPreparing}
  disabled={busy || loading}
  onSelect={selectStackProfile}
  onCreate={createStackProfile}
/>

<LibraryFilters
  {query}
  {density}
  {contactSheet}
  {grayscale}
  {facets}
  disabled={busy || loading}
  onApply={(value) => void applyView(value)}
/>

<div class="library-workspace">
  <div class="library-main">
    <div class="library-toolbar">
      <div>
        <strong>{selected.size}</strong> selected on this bounded page
        <span>Keyboard: F favourite · X reject · I inspect</span>
      </div>
      <div>
        <button type="button" disabled={!selected.size || busy} onclick={() => void setSelected({ favourite: true })}>Favourite selected</button>
        <button type="button" class="danger-button" disabled={!selected.size || busy} onclick={() => void setSelected({ rejected: true })}>Reject selected</button>
        <button type="button" disabled={!selected.size || busy} onclick={() => { selected = new Set(); }}>Clear</button>
      </div>
    </div>

    {#if loadError}
      <section class="preparing-view library-load-error" aria-labelledby="library-load-error-title">
        <h2 id="library-load-error-title">This library page could not load</h2>
        <p>{loadError}</p>
        <button type="button" disabled={loading} onclick={() => void loadLibrary(cursorStack[pageIndex])}>Try again</button>
      </section>
    {:else if preparing && items.length === 0}
      <section class="preparing-view" aria-labelledby="library-preparing-title">
        <h2 id="library-preparing-title">Prepared view in progress</h2>
        <p>{preparing.status} · job {preparing.job_id}. Grouping, sorting, and facets run in the background from persisted metadata.</p>
      </section>
    {:else}
      <LibraryGrid
        {items}
        {density}
        {contactSheet}
        {grayscale}
        {selected}
        {stackDetails}
        disabled={busy}
        initialScrollTop={scrollTop}
        onScroll={(value) => { scrollTop = value; }}
        onSelect={choose}
        onInspect={(entity) => void inspect(entity)}
        onState={setState}
        onOpenFolder={openFolder}
        onExpandStack={expandStack}
        onStackCover={setStackCover}
      />
    {/if}

    <nav class="library-paging" aria-label="Library pages">
      <button type="button" disabled={pageIndex === 0 || loading} onclick={() => void previousPage()}>Previous page</button>
      <span>Page {pageIndex + 1} · at most {libraryPageSize} entities held in memory</span>
      <button type="button" disabled={!nextCursor || loading} onclick={() => void nextPage()}>Next page</button>
    </nav>

    <section class="library-saved-views" aria-labelledby="library-saved-title">
      <div>
        <h2 id="library-saved-title">Saved library views</h2>
        <p>Filters, ordered sorts, density, contact sheet, and grayscale presentation persist in SQLite.</p>
      </div>
      <form onsubmit={(event) => { event.preventDefault(); void saveView(); }}>
        <label for="library-view-name">View name</label>
        <input id="library-view-name" bind:value={newViewName} maxlength="120" placeholder="Five-star contact sheet" />
        <button type="submit" disabled={!newViewName.trim() || generation === null}>Save current view</button>
      </form>
      {#if savedViews.length}
        <ul>{#each savedViews as view (view.id)}<li><button type="button" onclick={() => void applySavedView(view)}>{view.name}</button></li>{/each}</ul>
      {/if}
    </section>
  </div>

  <LibraryInspector
    {detail}
    {stackRestMembers}
    loading={inspectorLoading}
    disabled={busy}
    onClose={() => { detail = null; stackRestMembers = []; }}
    onState={setState}
    onOpenFolder={openFolder}
    onRejectStackRest={rejectStackRest}
  />
</div>
