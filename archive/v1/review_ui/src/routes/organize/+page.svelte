<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import {
    ApiClientError,
    StaleStateError,
    reviewApi,
    type CalendarBucket,
    type EquipmentBucket,
    type FolderNode,
    type MapCluster,
    type Preference
  } from '$lib/api';
  import OrganizationViews from '$lib/components/OrganizationViews.svelte';

  type ViewName = 'calendar' | 'folders' | 'equipment' | 'map';
  type OrganizationPreference = {
    activeView: ViewName;
    folderMode: 'logical' | 'occurrences';
    viewport: { zoom: number; south: number; north: number; west: number; east: number };
  };

  const defaults: OrganizationPreference = {
    activeView: 'calendar',
    folderMode: 'logical',
    viewport: { zoom: 1, south: -90, north: 90, west: -180, east: 180 }
  };

  let activeView = $state<ViewName>('calendar');
  let folderMode = $state<'logical' | 'occurrences'>('logical');
  let viewport = $state({ ...defaults.viewport });
  let calendar = $state<CalendarBucket[]>([]);
  let folders = $state<FolderNode[]>([]);
  let cameras = $state<EquipmentBucket[]>([]);
  let lenses = $state<EquipmentBucket[]>([]);
  let clusters = $state<MapCluster[]>([]);
  let unknownLocationCount = $state(0);
  let expandedFolders = $state(new Set<string>());
  let calendarYear = $state<number | undefined>(undefined);
  let calendarMonth = $state<number | undefined>(undefined);
  let generation = $state<number | null>(null);
  let preference = $state<Preference | null>(null);
  let busy = $state(true);
  let message = $state('Loading persisted organization viewsâ€¦');
  const abort = new AbortController();

  function errorMessage(error: unknown, fallback: string) {
    return error instanceof ApiClientError ? error.problem.message : fallback;
  }

  function preferenceValue(value: unknown): OrganizationPreference {
    if (!value || typeof value !== 'object') return defaults;
    const candidate = value as Partial<OrganizationPreference>;
    const view = candidate.activeView && ['calendar', 'folders', 'equipment', 'map'].includes(candidate.activeView)
      ? candidate.activeView
      : defaults.activeView;
    return {
      activeView: view,
      folderMode: candidate.folderMode === 'occurrences' ? 'occurrences' : 'logical',
      viewport: candidate.viewport && typeof candidate.viewport === 'object'
        ? { ...defaults.viewport, ...candidate.viewport }
        : defaults.viewport
    };
  }

  async function savePreference() {
    if (generation === null) return;
    try {
      const response = await reviewApi.putPreference(
        'organization.views',
        { activeView, folderMode, viewport },
        preference?.revision ?? 0,
        generation
      );
      generation = response.meta.generation;
      preference = response.data;
    } catch (error) {
      if (error instanceof StaleStateError) {
        message = 'Organization settings changed in another tab. Reload to reconcile them.';
      }
    }
  }

  async function loadCalendar(year = calendarYear, month = calendarMonth) {
    const response = await reviewApi.organizationCalendar({ limit: 120, year, month });
    generation = response.meta.generation;
    calendar = response.data ?? [];
  }

  async function loadFolders(parentId?: string) {
    const response = await reviewApi.organizationFolders(parentId, 120);
    generation = response.meta.generation;
    return response.data ?? [];
  }

  async function loadMap(value = viewport) {
    const response = await reviewApi.organizationMap(value, 200);
    generation = response.meta.generation;
    clusters = response.data?.clusters ?? [];
    unknownLocationCount = response.data?.unknown_location_count ?? 0;
  }

  async function loadPreparedViews() {
    const [calendarResponse, folderResponse, cameraResponse, lensResponse, mapResponse] = await Promise.all([
      reviewApi.organizationCalendar({ limit: 120 }),
      reviewApi.organizationFolders(undefined, 120),
      reviewApi.organizationEquipment('camera', 120),
      reviewApi.organizationEquipment('lens', 120),
      reviewApi.organizationMap(viewport, 200)
    ]);
    generation = mapResponse.meta.generation;
    calendar = calendarResponse.data ?? [];
    folders = folderResponse.data ?? [];
    cameras = cameraResponse.data ?? [];
    lenses = lensResponse.data ?? [];
    clusters = mapResponse.data?.clusters ?? [];
    unknownLocationCount = mapResponse.data?.unknown_location_count ?? 0;
    message = 'All four views are reading bounded persisted rollups. No media analysis occurs in the browser.';
  }

  async function watchPreparation(jobId: string) {
    try {
      const completed = await reviewApi.pollJob(jobId, (value) => {
        message = `Organization preparation: ${value.data?.status ?? 'queued'} Â· ${value.data?.phase ?? 'waiting'}`;
      }, { signal: abort.signal });
      if (completed.data?.status === 'completed') await loadPreparedViews();
      else message = completed.data?.error?.message ?? 'Organization preparation failed.';
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        message = errorMessage(error, 'Could not reconnect to organization preparation.');
      }
    } finally {
      busy = false;
    }
  }

  async function loadFoundation() {
    try {
      const preferences = await reviewApi.preferences();
      generation = preferences.meta.generation;
      preference = preferences.data?.find((item) => item.key === 'organization.views') ?? null;
      const saved = preferenceValue(preference?.value);
      activeView = saved.activeView;
      folderMode = saved.folderMode;
      viewport = saved.viewport;
      const status = await reviewApi.organizationStatus();
      generation = status.meta.generation;
      if (status.data?.status === 'ready') {
        await loadPreparedViews();
        busy = false;
      } else if (status.job?.id) {
        message = 'Preparing calendar, folder, equipment, and private map rollups in the background.';
        void watchPreparation(status.job.id);
      }
    } catch (error) {
      busy = false;
      message = errorMessage(error, 'Alternate organization views are unavailable.');
    }
  }

  async function refresh() {
    if (generation === null || busy) return;
    busy = true;
    try {
      const response = await reviewApi.prepareOrganization(generation, true);
      generation = response.meta.generation;
      message = 'A fresh persisted organization generation was queued.';
      if (response.job?.id) void watchPreparation(response.job.id);
    } catch (error) {
      busy = false;
      message = errorMessage(error, 'Could not prepare organization views.');
    }
  }

  function descendantsOf(nodeId: string) {
    const found = new Set<string>();
    let changed = true;
    while (changed) {
      changed = false;
      for (const node of folders) {
        if (node.parent_id === nodeId || (node.parent_id && found.has(node.parent_id))) {
          if (!found.has(node.id)) { found.add(node.id); changed = true; }
        }
      }
    }
    return found;
  }

  async function toggleFolder(node: FolderNode) {
    const expanded = new Set(expandedFolders);
    if (expanded.has(node.id)) {
      expanded.delete(node.id);
      const descendants = descendantsOf(node.id);
      folders = folders.filter((item) => !descendants.has(item.id));
      for (const id of descendants) expanded.delete(id);
    } else {
      try {
        const children = await loadFolders(node.id);
        const index = folders.findIndex((item) => item.id === node.id);
        folders = [...folders.slice(0, index + 1), ...children, ...folders.slice(index + 1)];
        expanded.add(node.id);
      } catch (error) {
        message = errorMessage(error, 'Could not expand this persisted folder node.');
      }
    }
    expandedFolders = expanded;
  }

  async function navigateCalendar(year?: number, month?: number) {
    calendarYear = year;
    calendarMonth = year ? month : undefined;
    try { await loadCalendar(calendarYear, calendarMonth); }
    catch (error) { message = errorMessage(error, 'Could not navigate persisted calendar buckets.'); }
  }

  async function changeMap(value: typeof viewport) {
    viewport = value;
    try {
      await loadMap(value);
      await savePreference();
    } catch (error) { message = errorMessage(error, 'Could not load this persisted map viewport.'); }
  }

  function changeView(value: ViewName) {
    activeView = value;
    void savePreference();
  }

  function changeFolderMode(value: typeof folderMode) {
    folderMode = value;
    void savePreference();
  }

  onMount(() => { void loadFoundation(); });
  onDestroy(() => abort.abort());
</script>

<svelte:head><title>Organize Â· Media Vault</title></svelte:head>

<header class="page-header compact organization-header">
  <div>
    <p class="eyebrow">Alternate organization</p>
    <h1>Explore the vault</h1>
    <p class="lede">Calendar, source hierarchy, equipment, and a private offline map resolve to the same stable logical photos and metadata-only state.</p>
  </div>
  <button type="button" onclick={() => void refresh()} disabled={busy || generation === null}>Refresh prepared views</button>
</header>

<p class="notice" role="status" aria-live="polite">{message}</p>

<OrganizationViews
  {activeView}
  {calendar}
  {folders}
  {cameras}
  {lenses}
  {clusters}
  {unknownLocationCount}
  {folderMode}
  {expandedFolders}
  {calendarYear}
  {calendarMonth}
  {viewport}
  onView={changeView}
  onFolderMode={changeFolderMode}
  onFolderToggle={(node) => void toggleFolder(node)}
  onCalendarNavigate={(year, month) => void navigateCalendar(year, month)}
  onMapChange={(value) => void changeMap(value)}
/>
