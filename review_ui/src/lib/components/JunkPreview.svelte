<script lang="ts">
  import type { JunkResult } from '$lib/api';

  export let items: JunkResult[] = [];
  export let showAll = false;
  export let disabled = false;
  export let onFeedback: (item: JunkResult, kind: 'false_positive' | 'false_negative') => void | Promise<void> = () => undefined;
  export let onShowAll: (showAll: boolean) => void | Promise<void> = () => undefined;

  function preparedPreview(item: JunkResult['entity']) {
    return item.derivatives
      .filter((derivative) => derivative.status === 'ready' && derivative.url)
      .sort((left, right) => right.long_edge - left.long_edge)[0]?.url ?? null;
  }
</script>

<section class="junk-preview" aria-labelledby="junk-preview-title">
  <div class="section-heading">
    <div>
      <p class="eyebrow">Preview before action</p>
      <h2 id="junk-preview-title">{showAll ? 'Review all results for missed junk' : 'Show me what would be hidden'}</h2>
      <p>These are persisted effective results. Nothing on this page changes rejection state.</p>
    </div>
    <div class="junk-preview-modes" aria-label="Junk preview mode">
      <button type="button" aria-pressed={!showAll} disabled={disabled} onclick={() => void onShowAll(false)}>Would be hidden</button>
      <button type="button" aria-pressed={showAll} disabled={disabled} onclick={() => void onShowAll(true)}>All results</button>
      <a class="button-link" href="/bulk-reject/">Open bulk reject</a>
    </div>
  </div>
  {#if !items.length}
    <p class="inline-empty">{showAll ? 'No persisted results are available on this page.' : 'This profile would hide no logical photos.'}</p>
  {:else}
    <div class="junk-result-list">
      {#each items as item (item.entity.id)}
        <article class="junk-result-card">
          <div>
            <h3>{item.entity.filename}</h3>
            <p>{item.explanation}</p>
            <div class="reason-chips" aria-label={`Reasons for ${item.entity.filename}`}>
              {#each item.reasons as reason}
                <span>{reason.label} · {Math.round(reason.confidence * 100)}%</span>
              {/each}
            </div>
            {#if item.better_alternative}
              <div class="better-comparison" role="group" aria-label={`Candidate and better alternative for ${item.entity.filename}`}>
                <article>
                  {#if preparedPreview(item.entity)}<img src={preparedPreview(item.entity) ?? ''} alt="" />{/if}
                  <strong>Candidate</strong><span>{item.entity.filename} · quality {item.entity.quality?.toFixed(3) ?? 'unavailable'}</span>
                </article>
                <article>
                  {#if preparedPreview(item.better_alternative)}<img src={preparedPreview(item.better_alternative) ?? ''} alt="" />{/if}
                  <strong>Better alternative</strong><span>{item.better_alternative.filename} · quality {item.better_alternative.quality?.toFixed(3) ?? 'unavailable'}</span>
                </article>
              </div>
            {:else if item.better_alternative_entity_id}
              <p><strong>Better alternative:</strong> {item.better_alternative_entity_id}</p>
            {/if}
          </div>
          <div class="junk-feedback-actions" aria-label={`Feedback for ${item.entity.filename}`}>
            {#if item.effective_hidden}
              <button type="button" disabled={disabled} onclick={() => void onFeedback(item, 'false_positive')}>This is not junk</button>
            {:else}
              <button type="button" disabled={disabled} onclick={() => void onFeedback(item, 'false_negative')}>This should be junk</button>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  {/if}
</section>
