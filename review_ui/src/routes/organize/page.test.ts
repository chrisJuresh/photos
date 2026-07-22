import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({
  preferences: vi.fn(), organizationStatus: vi.fn(), organizationCalendar: vi.fn(),
  organizationFolders: vi.fn(), organizationEquipment: vi.fn(), organizationMap: vi.fn(),
  putPreference: vi.fn(), prepareOrganization: vi.fn(), pollJob: vi.fn()
}));

vi.mock('$lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/api')>();
  return { ...actual, reviewApi: api };
});

import Page from './+page.svelte';

function envelope<T>(data: T) {
  return {
    meta: { api_version: 'v1', schema_version: 10, generation: 6, request_id: 'request' },
    data, page: { limit: 120, next_cursor: null }, job: null, unavailable: [], error: null
  };
}

const root = {
  id: 'root', source_root_id: 'source', parent_id: null, relative_path: '', label: 'Source root', depth: 0,
  counts: { direct_logical: 0, logical: 2, direct_occurrences: 0, occurrences: 3 },
  library_filter: { kind: 'folder', key: 'root' }
};

describe('organization route', () => {
  beforeEach(() => {
    api.preferences.mockResolvedValue(envelope([{
      key: 'organization.views', revision: 2, created_at: 'now', updated_at: 'now',
      value: { activeView: 'map', folderMode: 'occurrences', viewport: { zoom: 5, south: -20, north: 20, west: 150, east: -150 } }
    }]));
    api.organizationStatus.mockResolvedValue(envelope({
      id: 'rollups', kind: 'organization_rollups', status: 'ready', job_id: 'job', source_generation: 1,
      state_generation: 0, item_count: 5, error: null, progress: { unknown_location_count: 2 }
    }));
    api.organizationCalendar.mockResolvedValue(envelope([]));
    api.organizationFolders.mockImplementation((parent?: string) => Promise.resolve(envelope(parent ? [{ ...root, id: 'child', parent_id: 'root', label: 'Child', depth: 1 }] : [root])));
    api.organizationEquipment.mockResolvedValue(envelope([]));
    api.organizationMap.mockResolvedValue(envelope({
      clusters: [], unknown_location_count: 2,
      unknown_location_filter: { kind: 'map', key: 'unknown' },
      viewport: { zoom: 5, south: -20, north: 20, west: 150, east: -150 }
    }));
    api.putPreference.mockResolvedValue(envelope({
      key: 'organization.views', value: {}, revision: 3, created_at: 'now', updated_at: 'now'
    }));
  });

  it('restores saved map state, drills into folders, and persists route controls', async () => {
    render(Page);
    expect(await screen.findByRole('heading', { name: 'Private offline map' })).toBeInTheDocument();
    expect(api.organizationMap).toHaveBeenCalledWith(
      { zoom: 5, south: -20, north: 20, west: 150, east: -150 },
      200
    );
    await fireEvent.click(screen.getByRole('tab', { name: 'Folders' }));
    await waitFor(() => expect(api.putPreference).toHaveBeenCalled());
    expect(await screen.findByRole('heading', { name: 'Folders' })).toBeInTheDocument();
    expect(screen.getByLabelText('Source occurrences')).toBeChecked();
    await fireEvent.click(screen.getByRole('button', { name: /Source root/ }));
    await waitFor(() => expect(api.organizationFolders).toHaveBeenCalledWith('root', 120));
    expect(await screen.findByText('Child')).toBeInTheDocument();
  });
});
