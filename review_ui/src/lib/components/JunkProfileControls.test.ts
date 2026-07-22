import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import JunkProfileControls from './JunkProfileControls.svelte';
import type { JunkProfile } from '$lib/api';

const profile: JunkProfile = {
  id: 'junk-ready', name: 'Safe review', settings: {
    confidence_threshold: 0.72,
    enabled_reasons: ['extreme_blur', 'camera_shake'],
    minimum_agreement: 2,
    protect_favourites: true
  },
  settings_sha256: 'settings', catalog_generation: 1, analyzer_version: 'junk-profile-v1',
  signal_analyzer_version: 'junk-signals-v1', calibration_version: 'junk-calibration-v1',
  status: 'ready', is_default: true, is_current: true, replaces_profile_id: null,
  calibration_parent_profile_id: null, job_id: 'job-ready', result_count: 12,
  effectively_hidden_count: 3, favourite_protected_count: 1, feedback_count: 0,
  created_at: 'now', updated_at: 'now', completed_at: 'now', error: null
};

describe('JunkProfileControls', () => {
  it('exposes confidence, agreement, reason and favourite safeguards without automatic actions', async () => {
    const onSelect = vi.fn();
    const onCreate = vi.fn();
    const preparing = { ...profile, id: 'junk-building', name: 'Preparing', status: 'building', job_id: 'job-building' };
    render(JunkProfileControls, {
      profiles: [profile, preparing], selectedProfileId: profile.id, preparingProfile: preparing, onSelect, onCreate
    });

    expect(screen.getByText(/never reject, exclude, move, or delete/i)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('building');
    expect(screen.getByRole('button', { name: /Preparing/ })).toBeDisabled();
    await fireEvent.click(screen.getByRole('button', { name: /Safe review/ }));
    expect(onSelect).toHaveBeenCalledWith(profile);

    await fireEvent.click(screen.getByText('Create an adjustable profile'));
    await fireEvent.input(screen.getByLabelText('Profile name'), { target: { value: 'Strict review' } });
    await fireEvent.input(screen.getByLabelText('Junk confidence'), { target: { value: '0.88' } });
    await fireEvent.input(screen.getByLabelText('Minimum agreeing signals'), { target: { value: '3' } });
    await fireEvent.click(screen.getByLabelText('Never classify favourites as junk'));
    await fireEvent.click(screen.getByLabelText('Test chart or calibration likelihood'));
    await fireEvent.click(screen.getByRole('button', { name: 'Prepare profile in background' }));
    expect(onCreate).toHaveBeenCalledWith('Strict review', expect.objectContaining({
      confidence_threshold: 0.88,
      minimum_agreement: 3,
      protect_favourites: false
    }));
    expect(onCreate.mock.calls[0][1].enabled_reasons).not.toContain('test_chart_or_calibration_likelihood');
  });
});
