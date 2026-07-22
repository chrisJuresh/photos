<script lang="ts">
  import { onMount } from 'svelte';
  import { createVirtualizer } from '@tanstack/svelte-virtual';
  import type { LibraryEntity, LibraryState, StackDetail, StackMember } from '$lib/api';

  export let items: LibraryEntity[] = [];
  export let density = 220;
  export let contactSheet = false;
  export let grayscale = false;
  export let selected = new Set<string>();
  export let stackDetails: Record<string, StackDetail> = {};
  export let disabled = false;
  export let virtualize = true;
  export let initialScrollTop = 0;
  export let onSelect: (entity: LibraryEntity, extend: boolean) => void = () => undefined;
  export let onInspect: (entity: LibraryEntity) => void = () => undefined;
  export let onState: (entity: LibraryEntity, state: LibraryState) => void | Promise<void> = () => undefined;
  export let onOpenFolder: (entity: LibraryEntity) => void | Promise<void> = () => undefined;
  export let onExpandStack: (entity: LibraryEntity) => void | Promise<void> = () => undefined;
  export let onStackCover: (entity: LibraryEntity, member: StackMember) => void | Promise<void> = () => undefined;
  export let onScroll: (scrollTop: number) => void = () => undefined;

  let viewport: HTMLDivElement;
  let viewportWidth = 1000;
  let columns = 4;

  $: columns = Math.max(1, Math.floor(viewportWidth / Math.max(150, density + 18)));
  $: rowCount = Math.ceil(items.length / columns);
  $: hasStackCards = items.some((entity) => Boolean(entity.stack));
  $: rowHeight = density + (contactSheet ? 78 : 112) + (hasStackCards ? 64 : 0) + (Object.keys(stackDetails).length ? 168 : 0);

  const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: 0,
    getScrollElement: () => viewport,
    estimateSize: () => 340,
    overscan: 3
  });

  $: $virtualizer.setOptions({
    count: virtualize ? rowCount : 0,
    getScrollElement: () => viewport,
    estimateSize: () => rowHeight,
    overscan: 3
  });
  $: virtualRows = virtualize ? $virtualizer.getVirtualItems() : [];
  $: visibleRows = virtualize
    ? virtualRows.map((row) => ({ index: row.index, start: row.start, size: row.size }))
    : Array.from({ length: rowCount }, (_value, index) => ({ index, start: index * rowHeight, size: rowHeight }));

  function derivatives(entity: LibraryEntity) {
    return entity.derivatives.filter((item) => item.status === 'ready' && item.url).sort((left, right) => left.long_edge - right.long_edge);
  }

  function src(entity: LibraryEntity) {
    const ready = derivatives(entity);
    return ready.find((item) => item.long_edge >= density)?.url ?? ready.at(-1)?.url ?? null;
  }

  function srcset(entity: LibraryEntity) {
    return derivatives(entity).map((item) => `${item.url} ${item.long_edge}w`).join(', ');
  }

  function patch(entity: LibraryEntity, value: Partial<LibraryState>) {
    return onState(entity, { ...entity.state, ...value });
  }

  function cardKeydown(entity: LibraryEntity, event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onSelect(entity, event.shiftKey);
    }
  }

  onMount(() => {
    const resize = new ResizeObserver((entries) => {
      viewportWidth = entries[0]?.contentRect.width ?? viewport.clientWidth ?? viewportWidth;
    });
    resize.observe(viewport);
    viewport.scrollTop = initialScrollTop;
    viewportWidth = viewport.clientWidth || viewportWidth;
    return () => resize.disconnect();
  });
</script>

<section class:contact-sheet={contactSheet} class:grayscale class="library-grid-panel" aria-label="Vault photos">
  <div
    class="library-grid-viewport"
    bind:this={viewport}
    onscroll={() => onScroll(viewport.scrollTop)}
    aria-busy={disabled}
  >
    {#if items.length === 0}
      <p class="inline-empty">No logical photos match this persisted view.</p>
    {:else}
      <div
        class:nonvirtual={!virtualize}
        class="library-grid-spacer"
        style:height={virtualize ? `${$virtualizer.getTotalSize()}px` : 'auto'}
      >
        {#each visibleRows as row (row.index)}
          <div
            class="library-grid-row"
            style:transform={virtualize ? `translateY(${row.start}px)` : undefined}
            style:grid-template-columns={`repeat(${columns}, minmax(0, 1fr))`}
          >
            {#each items.slice(row.index * columns, row.index * columns + columns) as entity (entity.id)}
              <article
                class:selected={selected.has(entity.id)}
                class:rejected={entity.state.rejected}
                class:stacked={Boolean(entity.stack && entity.stack.member_count > 1)}
                class="library-card"
                data-entity-id={entity.id}
              >
                <button
                  type="button"
                  class="library-card-select"
                  aria-label={`Select ${entity.filename}`}
                  aria-pressed={selected.has(entity.id)}
                  disabled={disabled}
                  onclick={(event) => onSelect(entity, event.shiftKey)}
                  onkeydown={(event) => cardKeydown(entity, event)}
                >
                  <span class="library-image" style:height={`${density}px`}>
                    {#if src(entity)}
                      <img
                        src={src(entity) ?? undefined}
                        srcset={srcset(entity) || undefined}
                        sizes={`${density}px`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    {:else}
                      <span class="derivative-state">{entity.derivatives[0]?.status ?? 'preparing'}</span>
                    {/if}
                  </span>
                  <span class="library-card-copy">
                    <strong>{entity.filename}</strong>
                    <small>{entity.capture.time ?? 'Unknown capture time'} · {entity.format || entity.media_kind}</small>
                  </span>
                </button>

                <div class="library-indicators" aria-label="Photo state">
                  {#if entity.state.favourite}<span title="Favourite">♥</span>{/if}
                  {#if entity.state.rejected}<span title="Rejected">Rejected</span>{/if}
                  {#if entity.indicators.has_raw_companion}<span title="RAW companion">RAW+</span>{/if}
                  {#if entity.indicators.stack_member_count > 1}<span title="Stack members">Stack {entity.indicators.stack_member_count}</span>{/if}
                </div>

                <div class="library-card-actions" aria-label={`Actions for ${entity.filename}`}>
                  <button
                    type="button"
                    aria-label={entity.state.favourite ? `Remove ${entity.filename} from favourites` : `Favourite ${entity.filename}`}
                    aria-pressed={entity.state.favourite}
                    disabled={disabled}
                    onclick={() => void patch(entity, { favourite: !entity.state.favourite })}
                  >♥</button>
                  <button
                    type="button"
                    aria-label={entity.state.rejected ? `Restore ${entity.filename}` : `Reject ${entity.filename}`}
                    aria-pressed={entity.state.rejected}
                    disabled={disabled}
                    onclick={() => void patch(entity, { rejected: !entity.state.rejected })}
                  >×</button>
                  <label>
                    <span class="sr-only">Rating for {entity.filename}</span>
                    <select
                      aria-label={`Rating for ${entity.filename}`}
                      value={entity.state.rating}
                      disabled={disabled}
                      onchange={(event) => void patch(entity, { rating: Number(event.currentTarget.value) })}
                    >
                      {#each [0, 1, 2, 3, 4, 5] as rating}
                        <option value={rating}>{rating ? `${rating} star${rating === 1 ? '' : 's'}` : 'Unrated'}</option>
                      {/each}
                    </select>
                  </label>
                  <button type="button" disabled={disabled} onclick={() => onInspect(entity)}>Inspect</button>
                  <button type="button" disabled={disabled} onclick={() => void onOpenFolder(entity)}>Folder</button>
                  {#if entity.stack && entity.stack.member_count > 1}
                    <button type="button" disabled={disabled} aria-expanded={Boolean(stackDetails[entity.stack.id])} onclick={() => void onExpandStack(entity)}>
                      {stackDetails[entity.stack.id] ? 'Collapse' : `Expand Stack ${entity.stack.member_count}`}
                    </button>
                  {/if}
                </div>

                {#if entity.stack}
                  <p class="stack-cover-explanation"><strong>Cover:</strong> {entity.stack.cover_explanation}</p>
                  {#if stackDetails[entity.stack.id]}
                    <div class="stack-member-strip" aria-label={`Members of Stack for ${entity.filename}`}>
                      {#each stackDetails[entity.stack.id].members as member (member.entity.id)}
                        <button
                          type="button"
                          class:cover={member.is_cover}
                          disabled={disabled}
                          aria-label={`Use ${member.entity.filename} as Stack cover`}
                          onclick={() => void onStackCover(entity, member)}
                        >
                          {#if src(member.entity)}<img src={src(member.entity) ?? undefined} alt="" />{/if}
                          <span>{member.entity.filename}</span>
                          <small>{member.is_cover ? 'Cover' : member.rank_score.toFixed(3)}</small>
                        </button>
                      {/each}
                    </div>
                  {/if}
                {/if}
              </article>
            {/each}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>
