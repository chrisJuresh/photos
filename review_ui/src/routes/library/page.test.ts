import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  preferences: vi.fn(), savedViews: vi.fn(), library: vi.fn(), libraryFacets: vi.fn(),
  putPreference: vi.fn(), prepareLibrary: vi.fn(), createSavedView: vi.fn(),
  stackStatus: vi.fn(), stackProfiles: vi.fn(), pollJob: vi.fn(), createStackProfile: vi.fn(),
  stackDetail: vi.fn(), putStackCover: vi.fn()
}));

vi.mock('$lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/api')>();
  return { ...actual, reviewApi: api };
});

import Page from './+page.svelte';

function envelope<T>(data: T) {
  return {
    meta: { api_version: 'v1', schema_version: 11, generation: 4, request_id: 'request' },
    data, page: { limit: 120, next_cursor: null }, job: null, unavailable: [], error: null
  };
}

describe('library workspace', () => {
  afterEach(() => window.history.replaceState({}, '', '/'));

  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    api.preferences.mockResolvedValue(envelope([]));
    api.savedViews.mockResolvedValue(envelope([]));
    api.library.mockResolvedValue(envelope({
      items: [], query: { rejected: false, sorts: [{ field: 'capture_time', direction: 'desc' }] },
      catalog: { id: 'catalog', kind: 'library_catalog', status: 'ready', job_id: 'job', source_generation: 1, state_generation: 0, item_count: 0, error: null },
      view: null
    }));
    api.libraryFacets.mockResolvedValue(envelope([]));
    api.putPreference.mockResolvedValue(envelope({ key: 'library.browser', value: {}, revision: 1, created_at: 'now', updated_at: 'now' }));
    api.stackStatus.mockRejectedValue(new Error('Library preparing'));
    api.stackProfiles.mockResolvedValue(envelope([]));
  });

  it('restores the SQLite-authoritative view and requests default rejected filtering with bounded pages', async () => {
    render(Page);
    await waitFor(() => expect(api.library).toHaveBeenCalled());
    expect(api.library).toHaveBeenCalledWith(expect.objectContaining({
      rejected: 'hide', sort: ['capture_time:desc'], limit: 120
    }));
    expect(screen.getByRole('heading', { name: 'Photo browser' })).toBeInTheDocument();
    expect(await screen.findByText(/at most 120 entities held in memory/)).toBeInTheDocument();

    await fireEvent.change(screen.getByLabelText('Primary sort'), { target: { value: 'quality:desc' } });
    await fireEvent.change(screen.getByLabelText('Secondary sort'), { target: { value: 'filename:asc' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Apply view' }));
    await waitFor(() => expect(api.library).toHaveBeenLastCalledWith(expect.objectContaining({
      rejected: 'hide', sort: ['quality:desc', 'filename:asc'], limit: 120
    })));
    await waitFor(() => expect(api.putPreference).toHaveBeenCalled());
  });

  it('restores a persisted alternate-view membership from a same-origin route link', async () => {
    window.history.replaceState({}, '', '/library/?organization_kind=calendar&organization_key=date%3A2024-01-02');
    render(Page);
    await waitFor(() => expect(api.library).toHaveBeenCalledWith(expect.objectContaining({
      organizationKind: 'calendar', organizationKey: 'date:2024-01-02', limit: 120
    })));
    expect(await screen.findByText('Linked calendar view')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to organization views' })).toHaveAttribute('href', '/organize/');
  });
});
