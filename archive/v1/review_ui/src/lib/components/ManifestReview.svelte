<script lang="ts">
  import { createVirtualizer } from '@tanstack/svelte-virtual';
  import type { ImportManifestItem } from '$lib/api';

  export let items: ImportManifestItem[] = [];
  export let preparing = false;
  export let disabled = false;
  export let virtualize = true;
  export let onDecide: (items: ImportManifestItem[], decision: 'include' | 'exclude') => void | Promise<void> = () => undefined;
  export let onFiltersChange: (filters: { search: string; classification: string; outcome: string; sorts: string[] }) => void = () => undefined;

  let viewport: HTMLDivElement;
  let selected = new Set<string>();
  let anchor = -1;
  let dragging = false;
  let history: Array<Array<{ item: ImportManifestItem; decision: 'include' | 'exclude' }>> = [];
  let search = '';
  let classification = '';
  let outcome = '';
  let primarySort = 'relative_path:asc';
  let secondarySort = '';

  const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: 0,
    getScrollElement: () => viewport,
    estimateSize: () => 112,
    overscan: 6
  });

  $: $virtualizer.setOptions({ count: virtualize ? items.length : 0, getScrollElement: () => viewport });
  $: virtualRows = virtualize ? $virtualizer.getVirtualItems() : [];
  $: visibleItems = virtualize ? virtualRows.map((row) => ({ item: items[row.index], row })) : items.map((item, index) => ({ item, row: { index, start: index * 112, size: 112 } }));
  $: selectedItems = items.filter((item) => selected.has(item.id));
  $: selectedBytes = selectedItems.reduce((total, item) => total + (item.size_bytes ?? 0), 0);

  function selectIndex(index: number, extend = false) {
    if (index < 0 || index >= items.length) return;
    const next = new Set(selected);
    if (extend && anchor >= 0) {
      const [start, end] = [anchor, index].sort((left, right) => left - right);
      for (let current = start; current <= end; current += 1) next.add(items[current].id);
    } else {
      const id = items[index].id;
      if (next.has(id)) next.delete(id); else next.add(id);
      anchor = index;
    }
    selected = next;
  }

  function startBrush(index: number, event: PointerEvent) {
    if (disabled || event.button !== 0) return;
    dragging = true;
    selectIndex(index, event.shiftKey);
    event.currentTarget instanceof HTMLElement && event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function brush(index: number) {
    if (!disabled && dragging) selectIndex(index, true);
  }

  function stopBrush() {
    dragging = false;
  }

  function keyboardSelect(index: number, event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      selectIndex(index, event.shiftKey);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const next = Math.max(0, Math.min(items.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)));
    selectIndex(next, event.shiftKey);
    document.querySelector<HTMLElement>(`[data-manifest-index="${next}"]`)?.focus();
  }

  async function decide(decision: 'include' | 'exclude') {
    if (!selectedItems.length || disabled) return;
    history = [selectedItems.map((item) => ({ item, decision: item.effective_decision as 'include' | 'exclude' })), ...history].slice(0, 20);
    await onDecide(selectedItems, decision);
    selected = new Set();
  }

  async function undo() {
    const latest = history[0];
    if (!latest || disabled) return;
    history = history.slice(1);
    const groups = new Map<'include' | 'exclude', ImportManifestItem[]>();
    for (const entry of latest) groups.set(entry.decision, [...(groups.get(entry.decision) ?? []), entry.item]);
    for (const [decision, groupedItems] of groups) await onDecide(groupedItems, decision);
  }

  function applyFilters() {
    onFiltersChange({
      search: search.trim(),
      classification,
      outcome,
      sorts: [primarySort, secondarySort].filter(Boolean)
    });
  }

  function formatBytes(value: number) {
    if (value < 1024) return `${value} B`;
    const units = ['KiB', 'MiB', 'GiB', 'TiB'];
    let amount = value / 1024;
    let unit = units[0];
    for (let index = 1; index < units.length && amount >= 1024; index += 1) {
      amount /= 1024;
      unit = units[index];
    }
    return `${amount.toFixed(amount >= 10 ? 1 : 2)} ${unit}`;
  }
</script>

<section class="manifest-panel" aria-labelledby="manifest-heading">
  <div class="section-heading">
    <div>
      <p class="eyebrow">Every discovered entry</p>
      <h2 id="manifest-heading">Review manifest</h2>
      <p>Excluding an item changes this import decision only. The source file is never moved or deleted.</p>
    </div>
    <span class="count-pill">{items.length}</span>
  </div>

  <form class="manifest-filters" onsubmit={(event) => { event.preventDefault(); applyFilters(); }}>
    <label>Path search<input bind:value={search} placeholder="Folder or filename" /></label>
    <label>Classification
      <select bind:value={classification}>
        <option value="">All classifications</option>
        <option value="photo">Photos</option><option value="raw">RAW</option><option value="video">Videos</option>
        <option value="sidecar">Sidecars</option><option value="corrupt">Corrupt candidates</option>
        <option value="unsupported">Unsupported candidates</option><option value="non_media">Non-media</option>
      </select>
    </label>
    <label>Outcome
      <select bind:value={outcome}>
        <option value="">All outcomes</option><option value="new_asset">New asset</option>
        <option value="exact_match">Exact match</option><option value="verified">Verified</option>
        <option value="failed">Failed</option><option value="excluded">Excluded</option>
      </select>
    </label>
    <label>Primary sort
      <select bind:value={primarySort}>
        <option value="relative_path:asc">Path · A–Z</option><option value="relative_path:desc">Path · Z–A</option>
        <option value="classification:asc">Classification</option><option value="decision:asc">Decision</option>
        <option value="size:desc">Largest first</option><option value="copy_status:asc">Copy status</option>
      </select>
    </label>
    <label>Secondary sort
      <select bind:value={secondarySort}>
        <option value="">None</option><option value="classification:asc">Classification</option>
        <option value="decision:asc">Decision</option><option value="size:desc">Largest first</option>
      </select>
    </label>
    <button type="submit">Apply view</button>
  </form>

  <div class="selection-bar" role="status" aria-live="polite">
    <span><strong>{selectedItems.length}</strong> selected · {formatBytes(selectedBytes)}</span>
    <div>
      <button type="button" disabled={disabled || !selectedItems.length} onclick={() => decide('include')}>Include in this import</button>
      <button type="button" disabled={disabled || !selectedItems.length} onclick={() => decide('exclude')}>Exclude from this import</button>
      <button type="button" disabled={disabled || !history.length} onclick={undo}>Undo</button>
    </div>
  </div>

  {#if preparing}
    <div class="preparing-view" role="status">Preparing this search and sort in the background. The current manifest remains unchanged.</div>
  {:else if !items.length}
    <div class="inline-empty">No manifest entries match this view.</div>
  {:else}
    <div class="manifest-viewport" role="group" aria-label="Manifest brush selection" bind:this={viewport} onpointerup={stopBrush} onpointercancel={stopBrush}>
      <div class="manifest-spacer" class:nonvirtual={!virtualize} style:height={virtualize ? `${$virtualizer.getTotalSize()}px` : 'auto'}>
        {#each visibleItems as visible (visible.item.id)}
          <div
            class="manifest-row"
            class:selected={selected.has(visible.item.id)}
            style:transform={virtualize ? `translateY(${visible.row.start}px)` : undefined}
          >
            <button
              class="brush-target"
              type="button"
              aria-label={`Select ${visible.item.relative_path}`}
              aria-pressed={selected.has(visible.item.id)}
              data-manifest-index={visible.row.index}
              onpointerdown={(event) => startBrush(visible.row.index, event)}
              onpointerenter={() => brush(visible.row.index)}
              onkeydown={(event) => keyboardSelect(visible.row.index, event)}
            ><span aria-hidden="true">{selected.has(visible.item.id) ? '✓' : ''}</span></button>
            <div class="manifest-preview">
              {#if visible.item.preview.status === 'ready' && visible.item.preview.url}
                <img src={visible.item.preview.url} alt="" loading="lazy" />
              {:else}<span>{visible.item.preview.status}</span>{/if}
            </div>
            <div class="manifest-identity">
              <strong title={visible.item.path}>{visible.item.relative_path}</strong>
              <span>{visible.item.classification} · {formatBytes(visible.item.size_bytes ?? 0)}</span>
              {#if visible.item.unusual_extension}<em>Unusual extension</em>{/if}
            </div>
            <div class="manifest-outcome"><span>{visible.item.match_outcome}</span><span>{visible.item.copy_status}</span></div>
            <span class:excluded={visible.item.effective_decision === 'exclude'} class="decision-chip">{visible.item.effective_decision}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</section>
