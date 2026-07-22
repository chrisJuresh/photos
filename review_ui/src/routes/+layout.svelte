<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import AppShell from '$lib/components/AppShell.svelte';
  import { reviewApi } from '$lib/api';
  import { applyTheme, type ThemePreference } from '$lib/theme';
  import '../app.css';

  let { children }: { children: Snippet } = $props();

  afterNavigate(() => {
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('#main-content')?.focus({ preventScroll: true }));
  });

  onMount(() => {
    void reviewApi.preferences().then((response) => {
      const appearance = response.data?.find((item) => item.key === 'appearance');
      const value = appearance?.value as { theme?: ThemePreference } | undefined;
      applyTheme(value?.theme ?? 'system');
    }).catch(() => applyTheme('system'));
  });
</script>

<AppShell>
  {@render children()}
</AppShell>

