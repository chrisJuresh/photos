<script lang="ts">
  import type { LibraryDetail, LibraryEntity, LibraryState } from '$lib/api';

  export let detail: LibraryDetail | null = null;
  export let stackRestMembers: LibraryEntity[] = [];
  export let loading = false;
  export let disabled = false;
  export let onClose: () => void = () => undefined;
  export let onState: (entity: LibraryEntity, state: LibraryState) => void | Promise<void> = () => undefined;
  export let onOpenFolder: (entity: LibraryEntity) => void | Promise<void> = () => undefined;
  export let onRejectStackRest: (entity: LibraryEntity, confirmFavourites: boolean, confirmLargeSelection: boolean) => void | Promise<void> = () => undefined;

  let confirmStackRest = false;
  let confirmStackFavourites = false;
  let confirmStackLarge = false;

  $: entity = detail?.entity ?? null;
  $: largest = entity?.derivatives
    .filter((item) => item.status === 'ready' && item.url)
    .sort((left, right) => right.long_edge - left.long_edge)[0];
  $: expectedStackRestCount = Math.max(0, (entity?.stack?.member_count ?? 1) - 1);
  $: stackMembershipComplete = stackRestMembers.length === expectedStackRestCount;

  function state(value: Partial<LibraryState>) {
    if (!entity) return;
    void onState(entity, { ...entity.state, ...value });
  }

  function json(value: unknown) {
    return JSON.stringify(value, null, 2);
  }
</script>

<aside class="library-inspector" aria-labelledby="inspector-title" aria-busy={loading}>
  <div class="inspector-header">
    <div>
      <p class="eyebrow">Persisted evidence</p>
      <h2 id="inspector-title">{entity?.filename ?? (loading ? 'Loading inspector…' : 'Photo inspector')}</h2>
    </div>
    <button type="button" onclick={onClose} aria-label="Close inspector">Close</button>
  </div>

  {#if loading}
    <p role="status">Loading bounded metadata evidence…</p>
  {:else if entity && detail}
    <div class="inspector-preview">
      {#if largest?.url}<img src={largest.url} alt="" />{:else}<span>No ready detail derivative</span>{/if}
    </div>
    <div class="inspector-actions" aria-label="Photo actions">
      <button type="button" aria-pressed={entity.state.favourite} disabled={disabled} onclick={() => state({ favourite: !entity?.state.favourite })}>
        {entity.state.favourite ? 'Unfavourite' : 'Favourite'}
      </button>
      <button type="button" class="danger-button" aria-pressed={entity.state.rejected} disabled={disabled} onclick={() => state({ rejected: !entity?.state.rejected })}>
        {entity.state.rejected ? 'Restore' : 'Reject'}
      </button>
      <label>Rating
        <select value={entity.state.rating} disabled={disabled} onchange={(event) => state({ rating: Number(event.currentTarget.value) })}>
          {#each [0, 1, 2, 3, 4, 5] as rating}<option value={rating}>{rating || 'Unrated'}</option>{/each}
        </select>
      </label>
      <button type="button" disabled={disabled} onclick={() => void onOpenFolder(entity)}>Open in folder</button>
      {#if largest?.url}<a class="button-link" href={largest.url} target="_blank" rel="noreferrer">Prepared detail</a>{/if}
    </div>

    <dl class="inspector-summary">
      <div><dt>Logical entity</dt><dd>{entity.entity_kind}</dd></div>
      <div><dt>Members</dt><dd>{entity.counts.members}</dd></div>
      <div><dt>RAW companion</dt><dd>{entity.indicators.has_raw_companion ? 'Yes' : 'No'}</dd></div>
      <div><dt>Capture</dt><dd>{entity.capture.time ?? 'Unknown'}</dd></div>
      <div><dt>Camera</dt><dd>{entity.equipment.camera_model ?? 'Unknown'}</dd></div>
      <div><dt>Lens</dt><dd>{entity.equipment.lens_model ?? 'Unknown'}</dd></div>
      <div><dt>Quality</dt><dd>{entity.quality?.toFixed(3) ?? 'Unavailable'}</dd></div>
      <div><dt>State revision</dt><dd>{entity.state.revision}</dd></div>
    </dl>

    <details open>
      <summary>Members and RAW/JPEG evidence</summary>
      <pre>{json({ members: detail.members, raw_jpeg_evidence: detail.raw_jpeg_evidence })}</pre>
    </details>
    <details>
      <summary>Extended metadata and quality</summary>
      <pre>{json({ metadata: detail.metadata, features: detail.features })}</pre>
    </details>
    <details>
      <summary>Source history and canonical destinations</summary>
      <pre>{json({ sources: detail.sources, destinations: detail.destinations })}</pre>
    </details>
    <details>
      <summary>Duplicates, relationships, and warnings</summary>
      <pre>{json({ counts: entity.counts, relationships: detail.relationships, warnings: detail.warnings })}</pre>
    </details>
    <details>
      <summary>Derivative status</summary>
      <pre>{json(entity.derivatives)}</pre>
    </details>
    <details>
      <summary>Metadata action audit</summary>
      <pre>{json(detail.state_events)}</pre>
    </details>
    <details open>
      <summary>Stack membership and cover explanation</summary>
      <pre>{json({ memberships: detail.stacks, cover_events: detail.stack_cover_events })}</pre>
      {#if entity.stack && entity.stack.member_count > 1}
        <div class="stack-reject-rest">
          <p>Reject the other {entity.stack.member_count - 1} persisted Stack members. The cover stays unchanged and the action is undoable.</p>
          {#if stackMembershipComplete}
            <ul aria-label="Stack members affected by reject rest">
              {#each stackRestMembers as member (member.id)}
                <li><span>{member.filename}</span><span>{member.state.favourite ? 'Favourite' : 'Not favourite'} · {member.state.rejected ? 'Rejected' : 'Not rejected'}</span></li>
              {/each}
            </ul>
          {:else}
            <p role="alert">Exact persisted membership is unavailable, so this action is disabled.</p>
          {/if}
          <label><input type="checkbox" bind:checked={confirmStackRest} /> Confirm reject the rest of this Stack</label>
          <label><input type="checkbox" bind:checked={confirmStackFavourites} /> Include favourites while preserving favourite state</label>
          {#if entity.stack.member_count - 1 > 100}
            <p role="alert">Large action: this will reject more than 100 Stack members.</p>
            <label><input type="checkbox" bind:checked={confirmStackLarge} /> Confirm this large metadata action</label>
          {/if}
          <button
            type="button"
            class="danger-button"
            disabled={disabled || !stackMembershipComplete || !confirmStackRest || (entity.stack.member_count - 1 > 100 && !confirmStackLarge)}
            onclick={() => void onRejectStackRest(entity, confirmStackFavourites, confirmStackLarge)}
          >Reject the rest of this Stack</button>
        </div>
      {/if}
    </details>
    <details open>
      <summary>Junk signals and effective explanation</summary>
      {#if detail.junk}<pre>{json(detail.junk)}</pre>{:else}<p>{detail.placeholders.junk}</p>{/if}
    </details>
  {:else}
    <p>Select Inspect on any card. The panel reads persisted metadata and never requests an original file.</p>
  {/if}
</aside>
