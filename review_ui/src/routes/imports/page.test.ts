import { render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ imports: vi.fn() }));

vi.mock('$lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/api')>();
  return { ...actual, reviewApi: { imports: api.imports } };
});

import Page from './+page.svelte';

describe('import workspace reconnect', () => {
  beforeEach(() => {
    api.imports.mockResolvedValue({
      meta: { api_version: 'v1', schema_version: 9, generation: 0, request_id: 'request' },
      data: [], page: { limit: 100, next_cursor: null }, job: null, unavailable: [], error: null
    });
  });

  it('reconstructs the empty workspace from SQLite again when connectivity returns', async () => {
    render(Page);
    await waitFor(() => expect(api.imports).toHaveBeenCalledOnce());
    expect(screen.getByRole('heading', { name: 'Import workspace' })).toBeInTheDocument();
    expect(await screen.findByText(/No batches yet/)).toBeInTheDocument();
    window.dispatchEvent(new Event('online'));
    await waitFor(() => expect(api.imports).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/No reviewed imports/));
  });
});
