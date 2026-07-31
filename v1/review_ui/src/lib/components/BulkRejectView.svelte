<script lang="ts">
  import { createVirtualizer } from '@tanstack/svelte-virtual';
  import type { JunkResult, LibraryEntity } from '$lib/api';

  export let items: JunkResult[] = [];
  export let disabled = false;
  export let virtualize = true;
  export let lastActionId: string | null = null;
  export let onReject: (
    items: JunkResult[],
    options: { confirmFavourites: boolean; confirmLargeSelection: boolean }
  ) => void | Promise<void> = () => undefined;
  export let onUndo: (actionId: string) => void | Promise<void> = () => undefined;
  export let onExpandStack: (profileId: string, stackId: string) => Promise<LibraryEntity[]> = async () => [];

  let viewport: HTMLDivElement;
  let selected = new Set<string>();
  let anchor = -1;
  let dragging = false;
  let confirmed = false;
  let confirmFavourites = false;
  let confirmLarge = false;
  let filterText = '';
  let filterState = 'all';
  let expandedStackId: string | null = null;
  let expandedMembers: LibraryEntity[] = [];
  let stackLoading = false;

  $: normalizedFilter = filterText.trim().toLocaleLowerCase();
  $: filteredItems = items.filter((item) => {
    const stateMatches = filterState === 'all'
      || (filterState === 'favourite' && item.entity.state.favourite)
      || (filterState === 'not-favourite' && !item.entity.state.favourite)
      || (filterState === 'ready' && !item.entity.state.rejected)
      || (filterState === 'rejected' && item.entity.state.rejected);
    const textMatches = !normalizedFilter
      || item.entity.filename.toLocaleLowerCase().includes(normalizedFilter)
      || item.reasons.some((reason) => reason.label.toLocaleLowerCase().includes(normalizedFilter));
    return stateMatches && textMatches;
  });

  const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: 0,
    getScrollElement: () => viewport,
    estimateSize: () => 150,
    overscan: 6
  });
  $: $virtualizer.setOptions({ count: virtualize ? filteredItems.length : 0, getScrollElement: () => viewport });
  $: visible = virtualize
    ? $virtualizer.getVirtualItems().map((row) => ({ item: filteredItems[row.index], row }))
    : filteredItems.map((item, index) => ({ item, row: { index, start: index * 150, size: 150 } }));
  $: chosen = items.filter((item) => selected.has(item.entity.id));
  $: favouriteCount = chosen.filter((item) => item.entity.state.favourite).length;
  $: largeSelection = chosen.length > 100;

  function select(index: number, extend = false) {
    if (index < 0 || index >= filteredItems.length) return;
    const next = new Set(selected);
    if (extend && anchor >= 0) {
      const [start, end] = [anchor, index].sort((left, right) => left - right);
      for (let current = start; current <= end; current += 1) next.add(filteredItems[current].entity.id);
    } else {
      const id = filteredItems[index].entity.id;
      if (next.has(id)) next.delete(id); else next.add(id);
      anchor = index;
    }
    selected = next;
    confirmed = false;
  }

  function keySelect(index: number, event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      select(index, event.shiftKey);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = Math.max(0, Math.min(filteredItems.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)));
      select(next, event.shiftKey);
      document.querySelector<HTMLElement>(`[data-bulk-index="${next}"]`)?.focus();
    }
  }

  async function expandStack(item: JunkResult) {
    const stack = item.entity.stack;
    if (!stack) return;
    if (expandedStackId === stack.id) {
      expandedStackId = null;
      expandedMembers = [];
      return;
    }
    stackLoading = true;
    expandedStackId = stack.id;
    expandedMembers = [];
    try {
      expandedMembers = await onExpandStack(stack.profile_id, stack.id);
    } finally {
      stackLoading = false;
    }
  }

  async function reject() {
    if (!confirmed || !chosen.length || (favouriteCount && !confirmFavourites) || (largeSelection && !confirmLarge)) return;
    await onReject(chosen, { confirmFavourites, confirmLargeSelection: confirmLarge });
    selected = new Set();
    confirmed = false;
  }
</script>

<section class="bulk-reject-panel" aria-labelledby="bulk-reject-title">
  <div class="section-heading">
    <div>
      <p class="eyebrow">Metadata-only review</p>
      <h2 id="bulk-reject-title">Bulk reject candidates</h2>
      <p>Brush with the pointer or use Shift with the keyboard. Rejection changes SQLite metadata only and is undoable.</p>
    </div>
    <span class="count-pill">{items.length}</span>
  </div>

  <div class="selection-bar" role="status" aria-live="polite">
    <span><strong>{chosen.length}</strong> selected · {favouriteCount} favourites</span>
    <div>
      {#if lastActionId}<button type="button" disabled={disabled} onclick={() => void onUndo(lastActionId)}>Undo last bulk rejection</button>{/if}
      <button type="button" disabled={!chosen.length || disabled} onclick={() => { selected = new Set(); }}>Clear</button>
    </div>
  </div>

  <div class="bulk-filter-bar" aria-label="Candidate filters">
    <label>Filter candidates
      <input type="search" bind:value={filterText} placeholder="Filename or reason" oninput={() => { anchor = -1; }} />
    </label>
    <label>Candidate state
      <select bind:value={filterState} onchange={() => { anchor = -1; }}>
        <option value="all">All candidates</option>
        <option value="favourite">Favourites</option>
        <option value="not-favourite">Not favourites</option>
        <option value="ready">Not already rejected</option>
        <option value="rejected">Already rejected</option>
      </select>
    </label>
    <span>{filteredItems.length} shown from this bounded page</span>
  </div>

  {#if expandedStackId}
    <section class="bulk-stack-expansion" aria-label="Expanded Stack members" aria-busy={stackLoading}>
      <div class="section-heading">
        <h3>Persisted Stack members</h3>
        <button type="button" onclick={() => { expandedStackId = null; expandedMembers = []; }}>Close Stack</button>
      </div>
      {#if stackLoading}
        <p role="status">Loading persisted Stack membership…</p>
      {:else}
        <ul>{#each expandedMembers as member (member.id)}<li><span>{member.filename}</span><span>{member.state.favourite ? 'Favourite' : 'Not favourite'} · {member.state.rejected ? 'Rejected' : 'Not rejected'}</span></li>{/each}</ul>
      {/if}
    </section>
  {/if}

  {#if chosen.length}
    <div class="bulk-confirmation">
      <label><input type="checkbox" bind:checked={confirmed} /> Confirm metadata-only rejection of {chosen.length} entities</label>
      {#if favouriteCount}<label><input type="checkbox" bind:checked={confirmFavourites} /> Also reject {favouriteCount} favourites while preserving favourite state</label>{/if}
      {#if largeSelection}<label><input type="checkbox" bind:checked={confirmLarge} /> Confirm this large selection</label>{/if}
      <button class="danger-button" type="button" disabled={disabled || !confirmed || (favouriteCount > 0 && !confirmFavourites) || (largeSelection && !confirmLarge)} onclick={() => void reject()}>Reject selected metadata</button>
    </div>
  {/if}

  {#if !items.length}
    <p class="inline-empty">No effective junk results are ready for bulk review.</p>
  {:else}
    <div class="bulk-reject-viewport" role="group" aria-label="Bulk reject brush selection" bind:this={viewport} onpointerup={() => { dragging = false; }} onpointercancel={() => { dragging = false; }}>
      <div class="bulk-reject-spacer" class:nonvirtual={!virtualize} style:height={virtualize ? `${$virtualizer.getTotalSize()}px` : 'auto'}>
        {#each visible as value (value.item.entity.id)}
          <article class:selected={selected.has(value.item.entity.id)} class="bulk-reject-row" style:transform={virtualize ? `translateY(${value.row.start}px)` : undefined}>
            <button
              type="button"
              class="brush-target"
              data-bulk-index={value.row.index}
              aria-label={`Select ${value.item.entity.filename}`}
              aria-pressed={selected.has(value.item.entity.id)}
              disabled={disabled}
              onpointerdown={(event) => { if (event.button === 0) { dragging = true; select(value.row.index, event.shiftKey); } }}
              onpointerenter={() => { if (dragging) select(value.row.index, true); }}
              onkeydown={(event) => keySelect(value.row.index, event)}
            ><span aria-hidden="true">{selected.has(value.item.entity.id) ? '✓' : ''}</span></button>
            <div>
              <h3>{value.item.entity.filename}</h3>
              <p>{value.item.explanation}</p>
              <div class="reason-chips">{#each value.item.reasons as reason}<span>{reason.label} · {Math.round(reason.confidence * 100)}%</span>{/each}</div>
              {#if value.item.entity.stack && value.item.entity.stack.member_count > 1}
                <button type="button" disabled={disabled || stackLoading} onclick={() => void expandStack(value.item)}>
                  {expandedStackId === value.item.entity.stack.id ? 'Collapse Stack' : `Expand ${value.item.entity.stack.member_count}-member Stack`}
                </button>
              {/if}
            </div>
            <div class="bulk-state"><span>{value.item.entity.state.favourite ? 'Favourite' : 'Not favourite'}</span><span>{value.item.entity.state.rejected ? 'Already rejected' : 'Ready to review'}</span></div>
          </article>
        {/each}
      </div>
    </div>
  {/if}
</section>
