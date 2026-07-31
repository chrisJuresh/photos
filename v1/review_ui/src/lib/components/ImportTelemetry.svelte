<script lang="ts">
  import type { ImportSample } from '$lib/api';

  export let samples: ImportSample[] = [];
  const series = [
    { key: 'ewma_throughput_bps', label: 'Throughput', color: 'var(--accent)' },
    { key: 'discovered_count', label: 'Discovered', color: '#6f72c9' },
    { key: 'failed_count', label: 'Errors', color: 'var(--danger)' },
    { key: 'queue_depth', label: 'Queue', color: '#c59b36' }
  ] as const;

  $: ordered = [...samples].reverse().slice(-40);
  $: maxima = Object.fromEntries(series.map(({ key }) => [key, Math.max(1, ...ordered.map((sample) => Number(sample[key] ?? 0))) ]));

  function height(key: (typeof series)[number]['key'], sample: ImportSample) {
    return `${Math.max(2, (Number(sample[key] ?? 0) / Number(maxima[key])) * 100)}%`;
  }
</script>

<section class="telemetry-panel" aria-labelledby="telemetry-heading">
  <div class="section-heading">
    <div><p class="eyebrow">Persisted activity</p><h2 id="telemetry-heading">Pipeline signal</h2></div>
    <ul class="chart-legend">
      {#each series as item}<li><span style:background={item.color}></span>{item.label}</li>{/each}
    </ul>
  </div>
  {#if ordered.length}
    <div class="activity-chart" role="img" aria-label="Persisted import samples for throughput, discoveries, errors, and queue depth">
      {#each ordered as sample}
        <div class="sample-column" title={`${sample.recorded_at} · ${sample.phase}`}>
          {#each series as item}
            <span style:height={height(item.key, sample)} style:background={item.color}></span>
          {/each}
        </div>
      {/each}
    </div>
    <table class="sr-only">
      <caption>Latest persisted import metrics</caption>
      <thead><tr><th>Time</th><th>Phase</th><th>Throughput</th><th>Discovered</th><th>Errors</th><th>Queue</th></tr></thead>
      <tbody>{#each ordered as sample}<tr><td>{sample.recorded_at}</td><td>{sample.phase}</td><td>{sample.ewma_throughput_bps}</td><td>{sample.discovered_count}</td><td>{sample.failed_count}</td><td>{sample.queue_depth}</td></tr>{/each}</tbody>
    </table>
  {:else}
    <p class="inline-empty">No activity samples have been recorded for this import yet.</p>
  {/if}
</section>
