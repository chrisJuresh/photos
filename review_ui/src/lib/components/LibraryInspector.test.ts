import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import LibraryInspector from './LibraryInspector.svelte';
import type { LibraryDetail, LibraryEntity } from '$lib/api';

const entity: LibraryEntity = {
  id: 'entity-1', anchor_asset_id: 'raw-1', display_asset_id: 'jpeg-1', entity_kind: 'raw_jpeg',
  media_kind: 'raw_image', format: 'DNG', filename: 'frame.dng', primary_path: 'C:/stored/frame.dng', folder: 'stored',
  capture: { time: '2026-07-21T10:00:00Z', source: 'EXIF', ambiguous: false }, import_time: '2026-07-21T11:00:00Z',
  equipment: { camera_make: 'Synthetic', camera_model: 'Camera A', lens_model: 'Lens A' },
  exposure: { iso: 100, aperture: 2.8, time_seconds: 0.01, focal_length_mm: 35, compensation_ev: 0, severity: 0.1 },
  dimensions: { width: 4000, height: 3000 }, size_bytes: 4096, quality: 0.91,
  counts: { members: 2, raw_members: 1, source_occurrences: 2, exact_duplicates: 1, near_duplicates: 1 },
  state: { favourite: false, rejected: false, rating: 3, revision: 2 },
  indicators: { has_raw_companion: true, stack_member_count: 0 },
  stack: null,
  derivatives: [{ long_edge: 2560, kind: 'detail', width: 2560, height: 1920, mime_type: 'image/webp', status: 'ready', error: null, url: '/api/detail/2560' }]
};

const detail: LibraryDetail = {
  entity,
  members: [{ asset_id: 'raw-1' }, { asset_id: 'jpeg-1' }],
  sources: [{ path_text: 'C:/stored/frame.dng', present: 1 }],
  destinations: [{ path_text: 'C:/vault/object', status: 'verified' }],
  relationships: [{ relationship_type: 'near_duplicate' }],
  raw_jpeg_evidence: [{ confidence_score: 0.95 }],
  warnings: [], metadata: [{ iso_value: 100 }], features: [{ sharpness_score: 0.8 }],
  state_events: [{ action: 'set_state' }],
  stacks: [{ stack_id: 'stack-1', cover_explanation: 'Unedited candidates were preferred.' }],
  stack_cover_events: [{ after_cover_entity_id: 'entity-1' }],
  junk: null,
  placeholders: { stacks: 'Persisted', junk: 'No ready junk profile is available' }
};

describe('LibraryInspector', () => {
  it('shows complete persisted evidence and keyboard-visible metadata actions', async () => {
    const onState = vi.fn();
    const onOpenFolder = vi.fn();
    render(LibraryInspector, { detail, onState, onOpenFolder });
    expect(screen.getByRole('heading', { name: 'frame.dng' })).toBeInTheDocument();
    expect(screen.getByText('No ready junk profile is available')).toBeInTheDocument();
    expect(screen.getByText('Stack membership and cover explanation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Prepared detail' })).toHaveAttribute('href', '/api/detail/2560');
    await fireEvent.click(screen.getByRole('button', { name: 'Favourite' }));
    expect(onState).toHaveBeenCalledWith(entity, expect.objectContaining({ favourite: true }));
    await fireEvent.click(screen.getByRole('button', { name: 'Open in folder' }));
    expect(onOpenFolder).toHaveBeenCalledWith(entity);
  });

  it('requires a separate explicit confirmation for a large Stack action', async () => {
    const onRejectStackRest = vi.fn();
    const stacked = {
      ...entity,
      stack: {
        id: 'stack-1', profile_id: 'profile-1', revision: 4, member_count: 102,
        cover_entity_id: entity.id, ranked_cover_entity_id: entity.id, cover_override_entity_id: null,
        cover_explanation: 'Persisted cover', cover_method_version: 'cover-v1', cover_evidence: {},
        is_cover: true, member_ordinal: 0
      }
    };
    const stackRestMembers = Array.from({ length: 101 }, (_, index) => ({
      ...entity,
      id: `member-${index + 1}`,
      filename: `member-${index + 1}.jpg`
    }));
    render(LibraryInspector, { detail: { ...detail, entity: stacked }, stackRestMembers, onRejectStackRest });
    expect(screen.getByRole('list', { name: 'Stack members affected by reject rest' })).toHaveTextContent('member-101.jpg');
    const action = screen.getByRole('button', { name: 'Reject the rest of this Stack' });
    await fireEvent.click(screen.getByLabelText('Confirm reject the rest of this Stack'));
    expect(action).toBeDisabled();
    await fireEvent.click(screen.getByLabelText('Confirm this large metadata action'));
    expect(action).toBeEnabled();
    await fireEvent.click(action);
    expect(onRejectStackRest).toHaveBeenCalledWith(stacked, false, true);
  });
});
