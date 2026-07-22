import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  preferences: vi.fn(),
  savedViews: vi.fn(),
  backfill: vi.fn(),
  putPreference: vi.fn(),
  createSavedView: vi.fn(),
  controlBackfill: vi.fn()
}));

vi.mock('$lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/api')>();
  return { ...actual, reviewApi: api };
});

import Page from './+page.svelte';

function envelope<T>(data: T, generation = 8) {
  return {
    meta: { api_version: 'v1', schema_version: 12, generation, request_id: 'request' },
    data,
    page: null,
    job: null,
    unavailable: [],
    error: null
  };
}

const running = {
  id: 'job-backfill',
  kind: 'vault_backfill',
  status: 'queued',
  phase: 'inventory',
  control_state: 'run',
  progress: {
    message: 'Preparing persisted evidence.',
    asset_total: 10,
    asset_jobs_completed: 4,
    asset_jobs_failed: 0,
    asset_outputs_unavailable: 1,
    asset_timing_sample_count: 4,
    asset_current_rate_per_second: 0.02,
    asset_ewma_rate_per_second: 0.0008333333333333334,
    eta_seconds: 7_200,
    eta_confidence: 'medium',
    eta_basis: 'completed asset preprocessing attempts; active processing time only',
    throttle: { asset_batch_size: 32, asset_job_priority: 5, reviewed_copy_priority: 100 }
  },
  error: null
};

describe('settings release preparation', () => {
  beforeEach(() => {
    api.preferences.mockResolvedValue(envelope([]));
    api.savedViews.mockResolvedValue(envelope([]));
    api.backfill.mockResolvedValue(envelope(running));
    api.controlBackfill.mockResolvedValue(envelope({ ...running, status: 'paused', control_state: 'pause' }, 9));
  });

  it('announces honest persisted progress and exposes keyboard-operable pause', async () => {
    render(Page);
    expect(await screen.findByRole('heading', { name: 'Vault preparation' })).toBeInTheDocument();
    expect(screen.getByText('Completed assets')).toBeInTheDocument();
    expect(await screen.findByText('4 / 10')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '4');
    expect(screen.getByText('ETA 2h active processing remaining · medium confidence')).toBeInTheDocument();
    expect(screen.getByText('Preparing persisted evidence.')).toBeInTheDocument();

    const pause = screen.getByRole('button', { name: 'Pause after current item' });
    pause.focus();
    await fireEvent.click(pause);
    await waitFor(() => expect(api.controlBackfill).toHaveBeenCalledWith('pause', 8));
    expect(screen.getByRole('status')).toHaveTextContent('Backfill pause requested');
    expect(screen.getByRole('button', { name: 'Resume preparation' })).toBeInTheDocument();
  });
});
