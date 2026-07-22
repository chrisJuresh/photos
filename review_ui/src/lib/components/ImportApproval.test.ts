import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import ImportApproval from './ImportApproval.svelte';
import type { ImportBatch, JobState } from '$lib/api';

const batch: ImportBatch = {
  id: 'batch-1', name: 'July card', status: 'awaiting_review', revision: 4,
  discovery_generation: 1, traversal_complete: true,
  counts: {}, bytes: { total: 10, transferred: 0, verified: 0 }, classifications: {}, match_outcomes: {},
  latest_metrics: {}, current_job_id: null, active_approval_id: null, last_error: null, timestamps: {}
};

const preflight: JobState = {
  id: 'preflight', kind: 'import_approval_preflight', subject: { type: 'import_batch', id: 'batch-1' },
  phase: 'import_approval_preflight', status: 'completed', attempt: 1, max_attempts: 3, control_state: 'run',
  progress: { summary: { included_count: 7, excluded_count: 2, duplicate_count: 1, sidecar_count: 1, corrupt_count: 1, projected_copy_bytes: 5000, destination_free_bytes: 50000000000, sufficient_free_space: true } },
  error: null, timestamps: {}
};

describe('ImportApproval', () => {
  it('requires explicit confirmation after showing persisted approval counts', async () => {
    const onApprove = vi.fn();
    render(ImportApproval, { batch, preflight, approval: null, onApprove });
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    const approve = screen.getByRole('button', { name: 'Approve decision snapshot' });
    expect(approve).toBeDisabled();
    await fireEvent.click(screen.getByRole('checkbox'));
    expect(approve).toBeEnabled();
    await fireEvent.click(approve);
    expect(onApprove).toHaveBeenCalledOnce();
    expect(screen.getByText(/Source files stay in place/)).toBeInTheDocument();
  });
});
