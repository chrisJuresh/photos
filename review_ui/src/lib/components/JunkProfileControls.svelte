<script lang="ts">
  import type { JunkProfile, JunkSettings } from '$lib/api';

  export let profiles: JunkProfile[] = [];
  export let selectedProfileId: string | null = null;
  export let preparingProfile: JunkProfile | null = null;
  export let disabled = false;
  export let onSelect: (profile: JunkProfile) => void | Promise<void> = () => undefined;
  export let onCreate: (name: string, settings: JunkSettings) => void | Promise<void> = () => undefined;

  const reasons = [
    ['extreme_blur', 'Extreme blur'],
    ['camera_shake', 'Camera shake'],
    ['focus_deficit', 'Focus deficit'],
    ['severe_underexposure', 'Severe underexposure'],
    ['severe_overexposure', 'Severe overexposure'],
    ['highlight_clipping', 'Highlight clipping'],
    ['near_black_frame', 'Near-black frame'],
    ['possible_obstruction_or_accidental_frame', 'Possible obstruction or accidental frame'],
    ['screenshot_or_downloaded_graphic_likelihood', 'Screenshot or downloaded graphic likelihood'],
    ['tiny_or_low_resolution', 'Tiny or low resolution'],
    ['corruption_or_incomplete_decode', 'Corruption or incomplete decode'],
    ['exact_duplicate', 'Exact duplicate evidence'],
    ['near_duplicate_with_better_alternative', 'Near duplicate with a better alternative'],
    ['test_chart_or_calibration_likelihood', 'Test chart or calibration likelihood'],
    ['blank_scan', 'Blank scan'],
    ['severe_compression_damage', 'Severe compression damage'],
    ['thumbnail_rather_than_original', 'Thumbnail rather than original likelihood']
  ] as const;

  let name = 'My junk review profile';
  let confidence = 0.72;
  let minimumAgreement = 2;
  let protectFavourites = true;
  let enabled: Set<string> = new Set(reasons.map(([reason]) => reason));

  function toggle(reason: string, checked: boolean) {
    const next = new Set(enabled);
    if (checked) next.add(reason); else next.delete(reason);
    enabled = next;
    minimumAgreement = Math.min(minimumAgreement, Math.max(1, enabled.size));
  }

  function submit() {
    if (!name.trim() || !enabled.size) return;
    void onCreate(name.trim(), {
      confidence_threshold: confidence,
      enabled_reasons: [...enabled].sort(),
      minimum_agreement: minimumAgreement,
      protect_favourites: protectFavourites
    });
  }
</script>

<section class="junk-profile-panel" aria-labelledby="junk-profile-title">
  <div class="section-heading">
    <div>
      <p class="eyebrow">Explainable filtering</p>
      <h2 id="junk-profile-title">Junk profiles</h2>
      <p>Profiles preview persisted evidence only. They never reject, exclude, move, or delete media automatically.</p>
    </div>
    {#if preparingProfile}<span class="status-pill" role="status">{preparingProfile.status}</span>{/if}
  </div>

  {#if profiles.length}
    <div class="junk-profile-list" role="list" aria-label="Persisted junk profiles">
      {#each profiles as profile (profile.id)}
        <button
          type="button"
          class:active={profile.id === selectedProfileId}
          aria-pressed={profile.id === selectedProfileId}
          disabled={disabled || profile.status !== 'ready'}
          onclick={() => void onSelect(profile)}
        >
          <strong>{profile.name}</strong>
          <span>{profile.status} · {profile.effectively_hidden_count} would be hidden · {profile.favourite_protected_count} favourites protected</span>
          {#if profile.calibration_parent_profile_id}<small>Feedback-calibrated; its parent remains available for rollback.</small>{/if}
          {#if profile.error}<small>{profile.error}</small>{/if}
        </button>
      {/each}
    </div>
  {/if}

  <details>
    <summary>Create an adjustable profile</summary>
    <form class="junk-profile-form" onsubmit={(event) => { event.preventDefault(); submit(); }}>
      <label class="wide">Profile name<input bind:value={name} maxlength="120" disabled={disabled} /></label>
      <label>Junk confidence
        <span><input aria-label="Junk confidence" type="range" min="0" max="1" step="0.01" bind:value={confidence} disabled={disabled} /> {Math.round(confidence * 100)}%</span>
      </label>
      <label>Minimum agreeing signals
        <input aria-label="Minimum agreeing signals" type="number" min="1" max={Math.max(1, enabled.size)} bind:value={minimumAgreement} disabled={disabled} />
      </label>
      <label class="checkbox-label"><input type="checkbox" bind:checked={protectFavourites} disabled={disabled} /> Never classify favourites as junk</label>
      <fieldset class="wide reason-fieldset">
        <legend>Enabled reasons</legend>
        {#each reasons as [reason, label]}
          <label><input type="checkbox" checked={enabled.has(reason)} disabled={disabled} onchange={(event) => toggle(reason, event.currentTarget.checked)} /> {label}</label>
        {/each}
      </fieldset>
      <p class="wide safety-copy">The default requires multiple agreeing signals, so screenshot/download and test-chart evidence cannot hide an item alone.</p>
      <button type="submit" disabled={disabled || !name.trim() || !enabled.size}>Prepare profile in background</button>
    </form>
  </details>
</section>
