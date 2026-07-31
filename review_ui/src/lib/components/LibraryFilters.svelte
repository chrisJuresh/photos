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
  let previousQuery = query;

  $: if (query !== previousQuery) {
    previousQuery = query;
    search = query.search ?? '';
    mediaKind = query.mediaKind?.[0] ?? '';
    format = query.format?.[0] ?? '';
    camera = query.camera?.[0] ?? '';
    lens = query.lens?.[0] ?? '';
    folder = query.folder?.[0] ?? '';
    rejected = query.rejected ?? 'hide';
    favourite = query.favourite === true ? 'only' : 'include';
    ratingMin = query.ratingMin ?? 0;
    primarySort = query.sort?.[0] ?? 'capture_time:desc';
    secondarySort = query.sort?.[1] ?? '';
    randomSeed = query.randomSeed ?? 'media-vault-default';
  }

  $: folderOptions = facets.folder ?? [];
  $: savedFolderIsListed = !folder || folderOptions.some((item) => item.key === folder);

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
    <div class="control-field search-control">
      <label for="catalogued-folder">Catalogued folder</label>
      <select id="catalogued-folder" bind:value={folder} disabled={disabled} aria-describedby="catalogued-folder-help">
        <option value="">All catalogued folders</option>
        {#if folder && !savedFolderIsListed}<option value={folder}>{folder} (saved selection)</option>{/if}
        {#each folderOptions as item}<option value={item.key}>{item.label} ({item.count})</option>{/each}
      </select>
      <span class="control-help" id="catalogued-folder-help">
        Choose a folder already recorded in the vault. Apply view remembers it in SQLite.
      </span>
    </div>
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
    <label>Filename or path contains
      <input bind:value={search} maxlength="256" placeholder="Optional text filter" disabled={disabled} />
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
