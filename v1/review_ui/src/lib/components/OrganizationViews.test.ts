import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import OrganizationViews from './OrganizationViews.svelte';

const calendar = [
  {
    key: 'date:2024-01-02', kind: 'date' as const, date: '2024-01-02', year: 2024, month: 1, day: 2,
    label: '02 January 2024', count: 3, library_filter: { kind: 'calendar' as const, key: 'date:2024-01-02' }
  },
  {
    key: 'ambiguous', kind: 'ambiguous' as const, date: null, year: null, month: null, day: null,
    label: 'Ambiguous capture time', count: 1, library_filter: { kind: 'calendar' as const, key: 'ambiguous' }
  },
  {
    key: 'unknown', kind: 'unknown' as const, date: null, year: null, month: null, day: null,
    label: 'Unknown capture time', count: 2, library_filter: { kind: 'calendar' as const, key: 'unknown' }
  }
];

const folder = {
  id: 'folder-root', source_root_id: 'root', parent_id: null, relative_path: '', label: 'Synthetic source', depth: 0,
  counts: { direct_logical: 0, logical: 4, direct_occurrences: 0, occurrences: 7 },
  library_filter: { kind: 'folder' as const, key: 'folder-root' }
};

describe('OrganizationViews', () => {
  it('keeps calendar unknown/ambiguous evidence browsable and exposes keyboard tabs', async () => {
    const onView = vi.fn();
    const onCalendarNavigate = vi.fn();
    render(OrganizationViews, {
      activeView: 'calendar', calendar, calendarYear: 2024, calendarMonth: 1, onView, onCalendarNavigate
    });

    expect(screen.getByRole('tab', { name: 'Calendar' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('link', { name: /02 January 2024/ })).toHaveAttribute(
      'href',
      '/library/?organization_kind=calendar&organization_key=date%3A2024-01-02'
    );
    expect(screen.getByText('Ambiguous capture time')).toBeInTheDocument();
    expect(screen.getByText('Unknown capture time')).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('tab', { name: 'Folders' }));
    expect(onView).toHaveBeenCalledWith('folders');
    screen.getByRole('tab', { name: 'Private map' }).focus();
    expect(screen.getByRole('tab', { name: 'Private map' })).toHaveFocus();
    await fireEvent.click(screen.getByRole('button', { name: 'Navigate' }));
    expect(onCalendarNavigate).toHaveBeenCalledWith(2024, 1);
  });

  it('distinguishes logical and occurrence folder counts and supports expansion', async () => {
    const onFolderMode = vi.fn();
    const onFolderToggle = vi.fn();
    render(OrganizationViews, {
      activeView: 'folders', folders: [folder], folderMode: 'logical', onFolderMode, onFolderToggle
    });
    expect(screen.getByRole('link', { name: /4 logical photos/ })).toBeInTheDocument();
    await fireEvent.click(screen.getByLabelText('Source occurrences'));
    expect(onFolderMode).toHaveBeenCalledWith('occurrences');
    await fireEvent.click(screen.getByRole('button', { name: /Synthetic source/ }));
    expect(onFolderToggle).toHaveBeenCalledWith(folder);
  });

  it('renders only the bundled offline basemap and persisted cluster links', async () => {
    const onMapChange = vi.fn();
    render(OrganizationViews, {
      activeView: 'map',
      clusters: [{
        id: 'cluster', zoom: 4, geohash: 'gcp', center: { latitude: 51.5, longitude: -0.1 },
        bounds: { south: 51, north: 52, west: -1, east: 0 }, count: 8,
        library_filter: { kind: 'map', key: 'cluster' }
      }],
      unknownLocationCount: 3,
      viewport: { zoom: 4, south: -90, north: 90, west: -180, east: 180 },
      onMapChange
    });
    expect(screen.getByRole('img', { name: /private offline world map/i })).toBeInTheDocument();
    expect(document.querySelectorAll('.map-land').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /8 photos near/ })).toHaveAttribute(
      'href',
      '/library/?organization_kind=map&organization_key=cluster'
    );
    expect(screen.getByRole('link', { name: /3 photos with unknown location/ })).toHaveAttribute(
      'href',
      '/library/?organization_kind=map&organization_key=unknown'
    );
    expect(document.querySelectorAll('image').length).toBe(0);
    await fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(onMapChange).toHaveBeenCalledWith(expect.objectContaining({ zoom: 5 }));
    await fireEvent.click(screen.getByRole('button', { name: 'Pan west' }));
    expect(onMapChange).toHaveBeenCalledWith(expect.objectContaining({ west: -180, east: 180 }));
  });
});
