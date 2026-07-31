<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';
  import { reviewApi } from '$lib/api';
  import ShellNav from './ShellNav.svelte';

  let { children }: { children: Snippet } = $props();
  let serviceStatus = $state<'checking' | 'ready' | 'unavailable'>('checking');
  let statusText = $state('Checking local service…');

  async function refreshStatus() {
    try {
      const result = await reviewApi.system();
      serviceStatus = 'ready';
      statusText = `Local service ready · schema ${result.data?.schema_version ?? 'unknown'}`;
    } catch (error) {
      serviceStatus = 'unavailable';
      statusText = error instanceof Error ? error.message : 'Local service unavailable';
    }
  }

  onMount(() => {
    void refreshStatus();
    const timer = window.setInterval(refreshStatus, 30_000);
    return () => window.clearInterval(timer);
  });
</script>

<div class="shell">
  <a class="skip-link" href="#main-content">Skip to content</a>
  <aside class="rail">
    <ShellNav currentPath={page.url.pathname} />
    <div class:ready={serviceStatus === 'ready'} class:unavailable={serviceStatus === 'unavailable'} class="service-state" role="status" aria-live="polite">
      <span class="status-dot" aria-hidden="true"></span>
      <span>{statusText}</span>
    </div>
  </aside>
  <main id="main-content" tabindex="-1">
    {@render children()}
  </main>
</div>

