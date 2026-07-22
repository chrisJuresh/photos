<script lang="ts">
  import type { UnavailableField } from '$lib/api';
  export let fields: UnavailableField[] = [];
</script>

{#if fields.length}
  <aside class="unavailable-metrics" aria-labelledby="unavailable-heading">
    <h3 id="unavailable-heading">Unavailable legacy metrics</h3>
    <p>These values were not fabricated during backfill.</p>
    <ul>{#each fields as field}<li><strong>{field.field.replaceAll('_', ' ')}</strong><span>{field.reason}</span></li>{/each}</ul>
  </aside>
{/if}
