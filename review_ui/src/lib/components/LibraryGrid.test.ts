import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import LibraryGrid from './LibraryGrid.svelte';
import type { LibraryEntity } from '$lib/api';

function entity(index: number): LibraryEntity {
  return {
    id: `entity-${index}`,
    anchor_asset_id: `asset-${index}`,
    display_asset_id: index === 1 ? 'jpeg-1' : `asset-${index}`,
    entity_kind: index === 1 ? 'raw_jpeg' : 'standalone',
    media_kind: index === 1 ? 'raw_image' : 'image',
    format: index === 1 ? 'DNG' : 'JPEG',
    filename: `photo-${index}.jpg`,
    primary_path: `C:/synthetic/photo-${index}.jpg`,
    folder: 'synthetic',
    capture: { time: `2026-07-0${index}T12:00:00Z`, source: 'fixture', ambiguous: false },
    import_time: '2026-07-21T12:00:00Z',
    equipment: { camera_make: 'Synthetic', camera_model: 'Camera', lens_model: 'Lens' },
    exposure: { iso: 100, aperture: 2.8, time_seconds: 0.01, focal_length_mm: 35, compensation_ev: 0, severity: 0.1 },
    dimensions: { width: 1600, height: 1200 },
    size_bytes: 1024,
    quality: 0.8,
    counts: { members: index === 1 ? 2 : 1, raw_members: index === 1 ? 1 : 0, source_occurrences: 1, exact_duplicates: 0, near_duplicates: 0 },
    state: { favourite: index === 2, rejected: false, rating: index, revision: 1 },
    indicators: { has_raw_companion: index === 1, stack_member_count: index === 2 ? 3 : 0 },
    stack: index === 2 ? {
      profile_id: 'profile-1', id: 'stack-1', member_count: 3, cover_entity_id: 'entity-2',
      ranked_cover_entity_id: 'entity-2', cover_override_entity_id: null,
      cover_explanation: 'Persisted deterministic cover explanation.', cover_method_version: 'cover-v1',
      cover_evidence: {}, revision: 1, is_cover: true, member_ordinal: 0
    } : null,
    derivatives: [
      { long_edge: 192, kind: 'thumbnail', width: 192, height: 144, mime_type: 'image/webp', status: 'ready', error: null, url: `/api/entity-${index}/192` },
      { long_edge: 384, kind: 'thumbnail', width: 384, height: 288, mime_type: 'image/webp', status: 'ready', error: null, url: `/api/entity-${index}/384` }
    ]
  };
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

describe('LibraryGrid', () => {
  it('keeps a bounded virtual grid contract and exposes all hover actions to keyboard users', async () => {
    const onSelect = vi.fn();
    const onState = vi.fn();
    const onInspect = vi.fn();
    const onOpenFolder = vi.fn();
    const onExpandStack = vi.fn();
    const { container } = render(LibraryGrid, {
      items: [entity(1), entity(2)],
      density: 180,
      contactSheet: true,
      grayscale: true,
      virtualize: false,
      selected: new Set(['entity-1']),
      onSelect,
      onState,
      onInspect,
      onOpenFolder,
      onExpandStack
    });

    expect(container.querySelector('.library-grid-panel')).toHaveClass('contact-sheet', 'grayscale');
    expect(container.querySelectorAll('.library-card')).toHaveLength(2);
    const image = container.querySelectorAll('img')[0];
    expect(image).toHaveAttribute('src', '/api/entity-1/192');
    expect(image).toHaveAttribute('srcset', expect.stringContaining('/api/entity-1/384 384w'));
    expect(image.getAttribute('src')).not.toContain('C:/synthetic');
    expect(screen.getByTitle('RAW companion')).toHaveTextContent('RAW+');
    expect(screen.getByTitle('Stack members')).toHaveTextContent('Stack 3');
    expect(screen.getByText(/Persisted deterministic cover explanation/)).toBeInTheDocument();

    const selector = screen.getByRole('button', { name: 'Select photo-1.jpg' });
    await fireEvent.keyDown(selector, { key: 'Enter', shiftKey: true });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'entity-1' }), true);
    await fireEvent.click(screen.getByRole('button', { name: 'Favourite photo-1.jpg' }));
    expect(onState).toHaveBeenCalledWith(expect.objectContaining({ id: 'entity-1' }), expect.objectContaining({ favourite: true }));
    await fireEvent.click(screen.getAllByRole('button', { name: 'Inspect' })[0]);
    expect(onInspect).toHaveBeenCalledWith(expect.objectContaining({ id: 'entity-1' }));
    await fireEvent.click(screen.getAllByRole('button', { name: 'Folder' })[0]);
    expect(onOpenFolder).toHaveBeenCalledWith(expect.objectContaining({ id: 'entity-1' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Expand Stack 3' }));
    expect(onExpandStack).toHaveBeenCalledWith(expect.objectContaining({ id: 'entity-2' }));
  });
});
