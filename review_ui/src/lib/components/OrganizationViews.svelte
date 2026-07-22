<script lang="ts">
  import type {
    CalendarBucket,
    EquipmentBucket,
    FolderNode,
    MapCluster
  } from '$lib/api';
  import { OFFLINE_WORLD_LAND } from '$lib/data/offline-world-map';

  export let activeView: 'calendar' | 'folders' | 'equipment' | 'map' = 'calendar';
  export let calendar: CalendarBucket[] = [];
  export let folders: FolderNode[] = [];
  export let cameras: EquipmentBucket[] = [];
  export let lenses: EquipmentBucket[] = [];
  export let clusters: MapCluster[] = [];
  export let unknownLocationCount = 0;
  export let folderMode: 'logical' | 'occurrences' = 'logical';
  export let expandedFolders = new Set<string>();
  export let calendarYear: number | undefined = undefined;
  export let calendarMonth: number | undefined = undefined;
  export let viewport = { zoom: 1, south: -90, north: 90, west: -180, east: 180 };
  export let onView: (view: typeof activeView) => void = () => undefined;
  export let onFolderMode: (mode: typeof folderMode) => void = () => undefined;
  export let onFolderToggle: (node: FolderNode) => void = () => undefined;
  export let onCalendarNavigate: (year?: number, month?: number) => void = () => undefined;
  export let onMapChange: (value: typeof viewport) => void = () => undefined;

  const tabs: Array<{ id: typeof activeView; label: string }> = [
    { id: 'calendar', label: 'Calendar' },
    { id: 'folders', label: 'Folders' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'map', label: 'Private map' }
  ];

  function libraryHref(kind: string, key: string) {
    const params = new URLSearchParams({ organization_kind: kind, organization_key: key });
    return `/library/?${params.toString()}`;
  }

  function clusterX(cluster: MapCluster) {
    return ((cluster.center.longitude + 180) / 360) * 1000;
  }

  function clusterY(cluster: MapCluster) {
    return ((90 - cluster.center.latitude) / 180) * 500;
  }

  function changeZoom(delta: number) {
    onMapChange({ ...viewport, zoom: Math.max(0, Math.min(18, viewport.zoom + delta)) });
  }

  function pan(longitude: number, latitude: number) {
    const latSpan = viewport.north - viewport.south;
    const lonSpan = viewport.east >= viewport.west
      ? viewport.east - viewport.west
      : 360 - viewport.west + viewport.east;
    const south = Math.max(-90, Math.min(90 - latSpan, viewport.south + latitude));
    if (lonSpan >= 360) {
      onMapChange({ ...viewport, south, north: south + latSpan, west: -180, east: 180 });
      return;
    }
    let west = viewport.west + longitude;
    while (west > 180) west -= 360;
    while (west < -180) west += 360;
    let east = west + lonSpan;
    if (east > 180) east -= 360;
    onMapChange({ ...viewport, south, north: south + latSpan, west, east });
  }
</script>

<div class="organization-tabs" role="tablist" aria-label="Alternate library views">
  {#each tabs as tab}
    <button
      type="button"
      role="tab"
      aria-selected={activeView === tab.id}
      aria-controls={`organization-${tab.id}`}
      class:active={activeView === tab.id}
      onclick={() => onView(tab.id)}
    >{tab.label}</button>
  {/each}
</div>

{#if activeView === 'calendar'}
  <div id="organization-calendar" role="tabpanel" aria-labelledby="calendar-heading" class="organization-panel">
    <header class="organization-panel-header">
      <div><p class="eyebrow">Persisted date buckets</p><h2 id="calendar-heading">Calendar</h2></div>
      <form onsubmit={(event) => { event.preventDefault(); onCalendarNavigate(calendarYear, calendarMonth); }}>
        <label>Year <input type="number" min="1" max="9999" bind:value={calendarYear} placeholder="All" /></label>
        <label>Month <input type="number" min="1" max="12" bind:value={calendarMonth} disabled={!calendarYear} placeholder="All" /></label>
        <button type="submit">Navigate</button>
        <button type="button" onclick={() => onCalendarNavigate(undefined, undefined)}>All dates</button>
      </form>
    </header>
    <ul class="calendar-buckets">
      {#each calendar as bucket (bucket.key)}
        <li class:special={bucket.kind !== 'date'}>
          <a href={libraryHref(bucket.library_filter.kind, bucket.library_filter.key)}>
            <span>{bucket.label}</span><strong>{bucket.count.toLocaleString()}</strong>
          </a>
          <small>{bucket.kind === 'date' ? 'logical photos' : `${bucket.kind} time evidence remains browsable`}</small>
        </li>
      {:else}
        <li class="empty-inline">No persisted calendar buckets match this navigation.</li>
      {/each}
    </ul>
  </div>
{:else if activeView === 'folders'}
  <div id="organization-folders" role="tabpanel" aria-labelledby="folders-heading" class="organization-panel">
    <header class="organization-panel-header">
      <div><p class="eyebrow">Persisted source hierarchy</p><h2 id="folders-heading">Folders</h2></div>
      <fieldset class="segmented-control">
        <legend>Folder count mode</legend>
        <label><input type="radio" name="folder-mode" checked={folderMode === 'logical'} onchange={() => onFolderMode('logical')} /> Logical photos</label>
        <label><input type="radio" name="folder-mode" checked={folderMode === 'occurrences'} onchange={() => onFolderMode('occurrences')} /> Source occurrences</label>
      </fieldset>
    </header>
    <ul class="folder-tree">
      {#each folders as node (node.id)}
        <li style={`--folder-depth:${node.depth}`}>
          <button type="button" class="folder-toggle" aria-expanded={expandedFolders.has(node.id)} onclick={() => onFolderToggle(node)}>
            <span aria-hidden="true">{expandedFolders.has(node.id) ? 'âˆ’' : '+'}</span>
            <strong>{node.label}</strong>
          </button>
          <a href={libraryHref(node.library_filter.kind, node.library_filter.key)}>
            {folderMode === 'logical' ? node.counts.logical.toLocaleString() : node.counts.occurrences.toLocaleString()}
            {folderMode === 'logical' ? ' logical photos' : ' source occurrences'}
          </a>
        </li>
      {:else}
        <li class="empty-inline">No persisted source folders are available.</li>
      {/each}
    </ul>
  </div>
{:else if activeView === 'equipment'}
  <div id="organization-equipment" role="tabpanel" aria-labelledby="equipment-heading" class="organization-panel">
    <header class="organization-panel-header">
      <div><p class="eyebrow">Normalized with raw evidence retained</p><h2 id="equipment-heading">Camera and lens</h2></div>
    </header>
    <div class="equipment-columns">
      {#each [{ label: 'Cameras', kind: 'camera', values: cameras }, { label: 'Lenses', kind: 'lens', values: lenses }] as group}
        <section>
          <h3>{group.label}</h3>
          <ul>
            {#each group.values as value (value.key)}
              <li>
                <a href={libraryHref(value.library_filter.kind, value.library_filter.key)}><span>{value.label}</span><strong>{value.count.toLocaleString()}</strong></a>
                <small>{value.raw_values.length} retained raw {value.raw_values.length === 1 ? 'value' : 'values'}</small>
              </li>
            {:else}<li class="empty-inline">No persisted {group.label.toLowerCase()}.</li>{/each}
          </ul>
        </section>
      {/each}
    </div>
  </div>
{:else}
  <div id="organization-map" role="tabpanel" aria-labelledby="map-heading" class="organization-panel map-panel">
    <header class="organization-panel-header">
      <div><p class="eyebrow">Bundled basemap Â· no network tiles</p><h2 id="map-heading">Private offline map</h2></div>
      <div class="map-controls" aria-label="Map controls">
        <button type="button" aria-label="Zoom out" onclick={() => changeZoom(-1)}>âˆ’</button>
        <span>Zoom {viewport.zoom}</span>
        <button type="button" aria-label="Zoom in" onclick={() => changeZoom(1)}>+</button>
        <button type="button" aria-label="Pan west" onclick={() => pan(-30, 0)}>â†</button>
        <button type="button" aria-label="Pan north" onclick={() => pan(0, 15)}>â†‘</button>
        <button type="button" aria-label="Pan south" onclick={() => pan(0, -15)}>â†“</button>
        <button type="button" aria-label="Pan east" onclick={() => pan(30, 0)}>â†’</button>
      </div>
    </header>
    <svg class="offline-map" viewBox="0 0 1000 500" role="img" aria-label="Private offline world map with persisted photo clusters">
      <rect width="1000" height="500" class="map-ocean" />
      {#each OFFLINE_WORLD_LAND as path}<path d={path} class="map-land" />{/each}
      {#each clusters as cluster (cluster.id)}
        <a href={libraryHref(cluster.library_filter.kind, cluster.library_filter.key)} aria-label={`${cluster.count} photos near ${cluster.center.latitude.toFixed(1)}, ${cluster.center.longitude.toFixed(1)}`}>
          <circle cx={clusterX(cluster)} cy={clusterY(cluster)} r={Math.min(22, 7 + Math.log2(cluster.count + 1) * 2)} />
          <text x={clusterX(cluster)} y={clusterY(cluster) + 3}>{cluster.count}</text>
        </a>
      {/each}
    </svg>
    <div class="map-footer">
      <span>{clusters.length.toLocaleString()} persisted clusters in this bounded viewport</span>
      <a href={libraryHref('map', 'unknown')}>{unknownLocationCount.toLocaleString()} photos with unknown location</a>
    </div>
  </div>
{/if}
