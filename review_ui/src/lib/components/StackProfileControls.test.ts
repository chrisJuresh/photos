import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import StackProfileControls from './StackProfileControls.svelte';
import type { StackProfile } from '$lib/api';

const profile: StackProfile = {
  id: 'profile-ready', name: 'Ready profile', settings: {
    similarity: 0.72, time_proximity_seconds: 300, raw_jpeg_pairing_confidence: 0.8,
    exposure_preference: 'neutral', sharpness_limit: 0.55, motion_preference: 'freeze', order_direction: 'asc'
  },
  settings_sha256: 'settings', catalog_generation: 1, analyzer_version: 'stack-profile-v1',
  feature_analyzer_version: 'stack-features-v1', status: 'ready', is_default: true, is_current: true,
  replaces_profile_id: null, job_id: 'job-ready', stack_count: 12, member_count: 30,
  candidate_edge_count: 42, created_at: 'now', updated_at: 'now', completed_at: 'now', error: null
};

describe('StackProfileControls', () => {
  it('exposes every persisted profile control and keeps preparing profiles non-selectable', async () => {
    const onSelect = vi.fn();
    const onCreate = vi.fn();
    const queued = { ...profile, id: 'profile-queued', name: 'Preparing profile', status: 'building', job_id: 'job-queued' };
    const failed = { ...profile, id: 'profile-failed', name: 'Failed profile', status: 'error', error: 'Synthetic failure' };
    render(StackProfileControls, {
      profiles: [profile, queued, failed], selectedProfileId: profile.id, preparingProfile: queued, onSelect, onCreate
    });

    expect(screen.getByRole('status')).toHaveTextContent('building');
    expect(screen.getByRole('button', { name: /Ready profile/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Preparing profile/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Failed profile/ })).toBeDisabled();
    expect(screen.getByText('Synthetic failure')).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: /Ready profile/ }));
    expect(onSelect).toHaveBeenCalledWith(profile);

    await fireEvent.click(screen.getByText('Create an adjustable profile'));
    await fireEvent.input(screen.getByLabelText('Profile name'), { target: { value: 'Bursts and brackets' } });
    await fireEvent.input(screen.getByLabelText('Stack similarity'), { target: { value: '0.81' } });
    await fireEvent.input(screen.getByLabelText('Time proximity'), { target: { value: '45' } });
    await fireEvent.input(screen.getByLabelText('RAW/JPEG pairing confidence'), { target: { value: '0.91' } });
    await fireEvent.change(screen.getByLabelText('Exposure preference'), { target: { value: 'brighter' } });
    await fireEvent.input(screen.getByLabelText('Sharpness limit'), { target: { value: '0.67' } });
    await fireEvent.change(screen.getByLabelText('Motion preference'), { target: { value: 'intentional_blur' } });
    await fireEvent.change(screen.getByLabelText('Stack order'), { target: { value: 'desc' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Prepare profile in background' }));
    expect(onCreate).toHaveBeenCalledWith('Bursts and brackets', {
      similarity: 0.81,
      time_proximity_seconds: 45,
      raw_jpeg_pairing_confidence: 0.91,
      exposure_preference: 'brighter',
      sharpness_limit: 0.67,
      motion_preference: 'intentional_blur',
      order_direction: 'desc'
    });
  });
});
