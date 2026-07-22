import { render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  junkStatus: vi.fn(), junkProfiles: vi.fn(), junkResults: vi.fn(),
  bulkReject: vi.fn(), undoBulkReject: vi.fn(), preferences: vi.fn(), putPreference: vi.fn()
}));

vi.mock('$lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/api')>();
  return { ...actual, reviewApi: api };
});

import Page from './+page.svelte';

function envelope<T>(data: T) {
  return {
    meta: { api_version: 'v1', schema_version: 12, generation: 9, request_id: 'request' },
    data, page: { limit: 120, next_cursor: null }, job: null, unavailable: [], error: null
  };
}

const profile = {
  id: 'junk-ready', name: 'Safe review', settings: { confidence_threshold: .72, enabled_reasons: ['extreme_blur'], minimum_agreement: 1, protect_favourites: true },
  settings_sha256: 'settings', catalog_generation: 1, analyzer_version: 'v1', signal_analyzer_version: 'v1', calibration_version: 'v1',
  status: 'ready', is_default: true, is_current: true, replaces_profile_id: null, calibration_parent_profile_id: null,
  job_id: 'job', result_count: 0, effectively_hidden_count: 0, favourite_protected_count: 0, feedback_count: 0,
  created_at: 'now', updated_at: 'now', completed_at: 'now', error: null
};

describe('bulk reject route', () => {
  beforeEach(() => {
    api.preferences.mockResolvedValue(envelope([]));
    api.putPreference.mockResolvedValue(envelope({ key: 'junk.review', value: {}, revision: 1 }));
    api.junkStatus.mockResolvedValue(envelope(profile));
    api.junkResults.mockResolvedValue(envelope({ profile, items: [] }));
    api.junkProfiles.mockResolvedValue(envelope([profile]));
  });

  it('is a separate bounded route with explicit metadata-only language', async () => {
    render(Page);
    expect(await screen.findByRole('heading', { name: 'Bulk reject' })).toBeInTheDocument();
    await waitFor(() => expect(api.junkResults).toHaveBeenCalledWith('junk-ready', { hiddenOnly: true, limit: 120, cursor: undefined }));
    expect(screen.getByText(/Media files remain immutable/)).toBeInTheDocument();
    expect(screen.getByText(/No effective junk results/)).toBeInTheDocument();
  });
});
