<script lang="ts">
  import type { LibraryFacet, LibraryQuery } from '$lib/api';

  export let query: LibraryQuery = {};
  export let density = 220;
  export let contactSheet = false;
  export let grayscale = false;
  export let facets: Record<string, LibraryFacet[]> = {};
  export let disabled = false;
  export let onApply: (value: {
    query: LibraryQuery;
    density: number;
    contactSheet: boolean;
    grayscale: boolean;
  }) => void = () => undefined;

  let search = query.search ?? '';
  let mediaKind = query.mediaKind?.[0] ?? '';
  let format = query.format?.[0] ?? '';
  let camera = query.camera?.[0] ?? '';
  let lens = query.lens?.[0] ?? '';
  let folder = query.folder?.[0] ?? '';
  let rejected = query.rejected ?? 'hide';
  let favourite = query.favourite === true ? 'only' : 'include';
  let ratingMin = query.ratingMin ?? 0;
  let primarySort = query.sort?.[0] ?? 'capture_time:desc';
  let secondarySort = query.sort?.[1] ?? '';
  let randomSeed = query.randomSeed ?? 'media-vault-default';

  const sortOptions = [
    ['capture_time', 'Capture time'],
    ['import_time', 'Import time'],
    ['filename', 'Filename'],
    ['favourite', 'Favourite'],
    ['rejected', 'Rejected'],
    ['rating', 'Rating'],
    ['quality', 'Quality'],
    ['width', 'Width'],
    ['height', 'Height'],
    ['size', 'File size'],
    ['camera', 'Camera'],
    ['lens', 'Lens'],
    ['exposure', 'Exposure'],
    ['similarity', 'Similarity evidence'],
    ['random', 'Seeded random']
  ];

  function apply() {
    const sorts = [primarySort, secondarySort].filter(Boolean);
    onApply({
      density,
      contactSheet,
      grayscale,
      query: {
        organizationKind: query.organizationKind,
        organizationKey: query.organizationKey,
        search: search.trim() || undefined,
        mediaKind: mediaKind ? [mediaKind] : undefined,
        format: format ? [format] : undefined,
        camera: camera ? [camera] : undefined,
        lens: lens ? [lens] : undefined,
        folder: folder ? [folder] : undefined,
        rejected,
        favourite: favourite === 'only' ? true : undefined,
        ratingMin,
        sort: sorts,
        randomSeed: sorts.some((item) => item.startsWith('random:')) ? randomSeed : undefined
      }
    });
  }
</script>

<form class="library-controls" aria-label="Library filters and display" onsubmit={(event) => { event.preventDefault(); apply(); }}>
  <div class="library-control-grid">
    <label class="search-control">Search persisted paths
      <input bind:value={search} maxlength="256" placeholder="Filename or stored path" disabled={disabled} />
    </label>
    <label>Media
      <select bind:value={mediaKind} disabled={disabled}>
        <option value="">All media</option>
        {#each facets.media_kind ?? [] as item}<option value={item.key}>{item.label} ({item.count})</option>{/each}
      </select>
    </label>
    <label>Format
      <select bind:value={format} disabled={disabled}>
        <option value="">All formats</option>
        {#each facets.format ?? [] as item}<option value={item.key}>{item.label} ({item.count})</option>{/each}
      </select>
    </label>
    <label>Camera
      <select bind:value={camera} disabled={disabled}>
        <option value="">All cameras</option>
        {#each facets.camera ?? [] as item}<option value={item.key}>{item.label} ({item.count})</option>{/each}
      </select>
    </label>
    <label>Lens
      <select bind:value={lens} disabled={disabled}>
        <option value="">All lenses</option>
        {#each facets.lens ?? [] as item}<option value={item.key}>{item.label} ({item.count})</option>{/each}
      </select>
    </label>
    <label>Folder
      <select bind:value={folder} disabled={disabled}>
        <option value="">All folders</option>
        {#each facets.folder ?? [] as item}<option value={item.key}>{item.label} ({item.count})</option>{/each}
      </select>
    </label>
    <label>Rejected
      <select bind:value={rejected} disabled={disabled}>
        <option value="hide">Hide rejected</option>
        <option value="include">Include rejected</option>
        <option value="only">Rejected only</option>
      </select>
    </label>
    <label>Favourites
      <select bind:value={favourite} disabled={disabled}>
        <option value="include">All</option>
        <option value="only">Favourites only</option>
      </select>
    </label>
    <label>Minimum rating
      <select bind:value={ratingMin} disabled={disabled}>
        {#each [0, 1, 2, 3, 4, 5] as rating}<option value={rating}>{rating || 'Any'}</option>{/each}
      </select>
    </label>
    <label>Primary sort
      <select bind:value={primarySort} disabled={disabled}>
        {#each sortOptions as option}
          <option value={`${option[0]}:desc`}>{option[1]} · descending</option>
          <option value={`${option[0]}:asc`}>{option[1]} · ascending</option>
        {/each}
      </select>
    </label>
    <label>Secondary sort
      <select bind:value={secondarySort} disabled={disabled}>
        <option value="">None</option>
        {#each sortOptions as option}
          <option value={`${option[0]}:desc`}>{option[1]} · descending</option>
          <option value={`${option[0]}:asc`}>{option[1]} · ascending</option>
        {/each}
      </select>
    </label>
    <label>Random seed
      <input bind:value={randomSeed} maxlength="64" disabled={disabled || ![primarySort, secondarySort].some((item) => item.startsWith('random:'))} />
    </label>
  </div>

  <div class="library-display-controls">
    <label>Thumbnail size
      <input type="range" min="150" max="360" step="10" bind:value={density} disabled={disabled} />
      <span>{density}px</span>
    </label>
    <label><input type="checkbox" bind:checked={contactSheet} disabled={disabled} /> Film contact sheet</label>
    <label><input type="checkbox" bind:checked={grayscale} disabled={disabled} /> Display-only grayscale</label>
    <button class="primary" type="submit" disabled={disabled}>Apply view</button>
  </div>
</form>
