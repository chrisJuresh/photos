<script lang="ts">
  import type { StackProfile, StackSettings } from '$lib/api';

  export let profiles: StackProfile[] = [];
  export let selectedProfileId: string | null = null;
  export let preparingProfile: StackProfile | null = null;
  export let disabled = false;
  export let onSelect: (profile: StackProfile) => void | Promise<void> = () => undefined;
  export let onCreate: (name: string, settings: StackSettings) => void | Promise<void> = () => undefined;

  let name = 'My Stack profile';
  let similarity = 0.72;
  let timeProximity = 300;
  let rawConfidence = 0.8;
  let exposure: StackSettings['exposure_preference'] = 'neutral';
  let sharpness = 0.55;
  let motion: StackSettings['motion_preference'] = 'freeze';
  let order: StackSettings['order_direction'] = 'asc';

  function submit() {
    if (!name.trim()) return;
    void onCreate(name.trim(), {
      similarity,
      time_proximity_seconds: timeProximity,
      raw_jpeg_pairing_confidence: rawConfidence,
      exposure_preference: exposure,
      sharpness_limit: sharpness,
      motion_preference: motion,
      order_direction: order
    });
  }
</script>

<section class="stack-profile-panel" aria-labelledby="stack-profile-title">
  <div class="stack-profile-heading">
    <div>
      <p class="eyebrow">Persisted grouping</p>
      <h2 id="stack-profile-title">Stacks</h2>
      <p>Profiles group logical photos and rank covers in a background job. The current ready profile stays visible while another prepares.</p>
    </div>
    {#if preparingProfile}
      <span class="status-pill" role="status">{preparingProfile.status}</span>
    {/if}
  </div>

  {#if profiles.length}
    <div class="stack-profile-list" role="list" aria-label="Ready and prepared Stack profiles">
      {#each profiles as profile (profile.id)}
        <button
          type="button"
          class:active={profile.id === selectedProfileId}
          disabled={disabled || profile.status !== 'ready'}
          aria-pressed={profile.id === selectedProfileId}
          onclick={() => void onSelect(profile)}
        >
          <strong>{profile.name}</strong>
          <span>{profile.status} · {profile.stack_count} Stacks · {profile.member_count} photos</span>
          {#if profile.error}<small>{profile.error}</small>{/if}
        </button>
      {/each}
    </div>
  {/if}

  <details>
    <summary>Create an adjustable profile</summary>
    <form class="stack-profile-form" onsubmit={(event) => { event.preventDefault(); submit(); }}>
      <label class="wide">Profile name
        <input bind:value={name} maxlength="120" disabled={disabled} />
      </label>
      <label>Stack similarity
        <span><input aria-label="Stack similarity" type="range" min="0.3" max="0.98" step="0.01" bind:value={similarity} disabled={disabled} /> {similarity.toFixed(2)}</span>
      </label>
      <label>Time proximity (seconds)
        <input aria-label="Time proximity" type="number" min="0" max="86400" step="1" bind:value={timeProximity} disabled={disabled} />
      </label>
      <label>RAW/JPEG pairing confidence
        <span><input aria-label="RAW/JPEG pairing confidence" type="range" min="0" max="1" step="0.01" bind:value={rawConfidence} disabled={disabled} /> {rawConfidence.toFixed(2)}</span>
      </label>
      <label>Exposure preference
        <select aria-label="Exposure preference" bind:value={exposure} disabled={disabled}>
          <option value="darker">Darker</option><option value="neutral">Neutral</option><option value="brighter">Brighter</option>
        </select>
      </label>
      <label>Sharpness limit
        <span><input aria-label="Sharpness limit" type="range" min="0" max="1" step="0.01" bind:value={sharpness} disabled={disabled} /> {sharpness.toFixed(2)}</span>
      </label>
      <label>Motion preference
        <select aria-label="Motion preference" bind:value={motion} disabled={disabled}>
          <option value="freeze">Freeze motion</option><option value="intentional_blur">Embrace intentional blur</option>
        </select>
      </label>
      <label>Stack order
        <select aria-label="Stack order" bind:value={order} disabled={disabled}>
          <option value="asc">Ascending</option><option value="desc">Descending</option>
        </select>
      </label>
      <button type="submit" disabled={disabled || !name.trim()}>Prepare profile in background</button>
    </form>
  </details>
</section>
