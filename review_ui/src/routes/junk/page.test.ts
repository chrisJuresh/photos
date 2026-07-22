import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  junkStatus: vi.fn(), junkProfiles: vi.fn(), junkResults: vi.fn(),
  createJunkProfile: vi.fn(), junkFeedback: vi.fn(), pollJob: vi.fn(),
  preferences: vi.fn(), putPreference: vi.fn()
}));

vi.mock('$lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/api')>();
  return { ...actual, reviewApi: api };
});

import Page from './+page.svelte';

function envelope<T>(data: T) {
  return {
    meta: { api_version: 'v1', schema_version: 12, generation: 8, request_id: 'request' },
    data, page: { limit: 120, next_cursor: null }, job: null, unavailable: [], error: null
  };
}

const profile = {
  id: 'junk-ready', name: 'Safe review', settings: {
    confidence_threshold: 0.72, enabled_reasons: ['extreme_blur', 'camera_shake'],
    minimum_agreement: 2, protect_favourites: true
  },
  settings_sha256: 'settings', catalog_generation: 1, analyzer_version: 'junk-profile-v1',
  signal_analyzer_version: 'junk-signals-v1', calibration_version: 'junk-calibration-v1',
  status: 'ready', is_default: true, is_current: true, replaces_profile_id: null,
  calibration_parent_profile_id: null, job_id: 'job', result_count: 1, effectively_hidden_count: 1,
  favourite_protected_count: 0, feedback_count: 0, created_at: 'now', updated_at: 'now', completed_at: 'now', error: null
};

const entity = {
  id: 'entity-1', anchor_asset_id: 'asset', display_asset_id: 'asset', entity_kind: 'standalone', media_kind: 'image',
  format: 'JPEG', filename: 'blur.jpg', primary_path: null, folder: '', capture: { time: null, source: null, ambiguous: false },
  import_time: null, equipment: { camera_make: null, camera_model: null, lens_model: null },
  exposure: { iso: null, aperture: null, time_seconds: null, focal_length_mm: null, compensation_ev: null, severity: null },
  dimensions: { width: 100, height: 100 }, size_bytes: 10, quality: 0.1,
  counts: { members: 1, raw_members: 0, source_occurrences: 1, exact_duplicates: 0, near_duplicates: 1 },
  state: { favourite: false, rejected: false, rating: 0, revision: 1 },
  indicators: { has_raw_companion: false, stack_member_count: 2 }, derivatives: [], stack: null
};

const result = {
  entity, ordinal: 0, effective_hidden: true, favourite_protected: false, agreement_count: 2,
  reasons: [{ reason: 'extreme_blur', label: 'extreme blur', confidence: .94, method_threshold: .82, method_version: 'v1', evidence: {}, better_alternative_entity_id: 'better' }],
  explanation: 'Hidden because extreme blur confidence is 94%.', better_alternative_entity_id: 'better', better_alternative: null
};

describe('junk review route', () => {
  beforeEach(() => {
    api.preferences.mockResolvedValue(envelope([]));
    api.putPreference.mockResolvedValue(envelope({ key: 'junk.review', value: {}, revision: 1 }));
    api.junkStatus.mockResolvedValue(envelope(profile));
    api.junkProfiles.mockResolvedValue(envelope([profile]));
    api.junkResults.mockResolvedValue(envelope({ profile, items: [result] }));
    api.junkFeedback.mockResolvedValue(envelope({ feedback_id: 1, calibration_job_id: null, media_mutation: 'none' }));
  });

  it('loads the ready profile, previews explanations, and records feedback only', async () => {
    render(Page);
    expect(await screen.findByRole('heading', { name: 'Junk review' })).toBeInTheDocument();
    expect(await screen.findByText('Hidden because extreme blur confidence is 94%.')).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: 'This is not junk' }));
    await waitFor(() => expect(api.junkFeedback).toHaveBeenCalledWith('junk-ready', 'entity-1', 'false_positive', 8));
    expect(screen.getByRole('status')).toHaveTextContent('Feedback saved as application metadata.');
    await fireEvent.click(screen.getByRole('button', { name: 'All results' }));
    await waitFor(() => expect(api.junkResults).toHaveBeenLastCalledWith(
      'junk-ready',
      { hiddenOnly: false, limit: 120, cursor: undefined }
    ));
    expect(api.putPreference).toHaveBeenCalledWith(
      'junk.review',
      { selected_profile_id: 'junk-ready', show_all: true },
      0,
      8
    );
  });
});
