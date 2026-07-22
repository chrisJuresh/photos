<script lang="ts">
  import type { ThemePreference } from '$lib/theme';

  export let theme: ThemePreference = 'system';
  export let density: 'comfortable' | 'compact' = 'comfortable';
  export let disabled = false;
  export let onThemeChange: (value: ThemePreference) => void = () => undefined;
  export let onDensityChange: (value: 'comfortable' | 'compact') => void = () => undefined;
</script>

<fieldset {disabled}>
  <legend>Appearance</legend>
  <label>
    Theme
    <select value={theme} onchange={(event) => onThemeChange(event.currentTarget.value as ThemePreference)}>
      <option value="system">Use system setting</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  <div class="segmented" role="group" aria-label="Interface density">
    <button type="button" class:active={density === 'comfortable'} onclick={() => onDensityChange('comfortable')}>
      Comfortable
    </button>
    <button type="button" class:active={density === 'compact'} onclick={() => onDensityChange('compact')}>
      Compact
    </button>
  </div>
</fieldset>

