import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import BulkRejectView from './BulkRejectView.svelte';
import JunkPreview from './JunkPreview.svelte';
import type { JunkResult, LibraryEntity } from '$lib/api';

function entity(id: string, favourite = false): LibraryEntity {
  return {
    id, anchor_asset_id: `asset-${id}`, display_asset_id: `asset-${id}`, entity_kind: 'standalone',
    media_kind: 'image', format: 'JPEG', filename: `${id}.jpg`, primary_path: null, folder: '',
    capture: { time: null, source: null, ambiguous: false }, import_time: null,
    equipment: { camera_make: null, camera_model: null, lens_model: null },
    exposure: { iso: null, aperture: null, time_seconds: null, focal_length_mm: null, compensation_ev: null, severity: null },
    dimensions: { width: 100, height: 100 }, size_bytes: 10, quality: 0.2,
    counts: { members: 1, raw_members: 0, source_occurrences: 1, exact_duplicates: 0, near_duplicates: 1 },
    state: { favourite, rejected: false, rating: 0, revision: 1 },
    indicators: { has_raw_companion: false, stack_member_count: 2 }, derivatives: [], stack: null
  };
}

function result(id: string, favourite = false): JunkResult {
  return {
    entity: entity(id, favourite), ordinal: Number(id.slice(-1)), effective_hidden: true,
    favourite_protected: false, agreement_count: 2,
    reasons: [{
      reason: 'extreme_blur', label: 'extreme blur', confidence: 0.94, method_threshold: 0.82,
      method_version: 'junk-signals-v1', evidence: {}, better_alternative_entity_id: 'better'
    }],
    explanation: 'Hidden because extreme blur confidence is 94%.',
    better_alternative_entity_id: 'better',
    better_alternative: entity('better')
  };
}

describe('junk result interactions', () => {
  it('previews explanations and records explicit feedback', async () => {
    const onFeedback = vi.fn();
    const onShowAll = vi.fn();
    render(JunkPreview, { items: [result('item-1')], onFeedback, onShowAll });
    expect(screen.getByText('Hidden because extreme blur confidence is 94%.')).toBeInTheDocument();
    expect(screen.getByText('extreme blur · 94%')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Candidate and better alternative for item-1.jpg' })).toHaveTextContent('better.jpg');
    await fireEvent.click(screen.getByRole('button', { name: 'This is not junk' }));
    expect(onFeedback).toHaveBeenCalledWith(expect.objectContaining({ entity: expect.objectContaining({ id: 'item-1' }) }), 'false_positive');
    await fireEvent.click(screen.getByRole('button', { name: 'All results' }));
    expect(onShowAll).toHaveBeenCalledWith(true);

    const missed = { ...result('item-2'), effective_hidden: false };
    const missedFeedback = vi.fn();
    render(JunkPreview, { items: [missed], showAll: true, onFeedback: missedFeedback });
    await fireEvent.click(screen.getByRole('button', { name: 'This should be junk' }));
    expect(missedFeedback).toHaveBeenCalledWith(expect.objectContaining({ entity: expect.objectContaining({ id: 'item-2' }) }), 'false_negative');
  });

  it('supports keyboard ranges, favourite confirmation, explicit rejection and undo', async () => {
    const onReject = vi.fn();
    const onUndo = vi.fn();
    render(BulkRejectView, {
      items: [result('item-1'), result('item-2', true), result('item-3')],
      virtualize: false,
      lastActionId: 'bulk-action',
      onReject,
      onUndo
    });

    await fireEvent.keyDown(screen.getByRole('button', { name: 'Select item-1.jpg' }), { key: ' ' });
    await fireEvent.keyDown(screen.getByRole('button', { name: 'Select item-2.jpg' }), { key: ' ', shiftKey: true });
    expect(screen.getByRole('status')).toHaveTextContent('2 selected');
    const reject = screen.getByRole('button', { name: 'Reject selected metadata' });
    await fireEvent.click(screen.getByLabelText('Confirm metadata-only rejection of 2 entities'));
    expect(reject).toBeDisabled();
    await fireEvent.click(screen.getByLabelText('Also reject 1 favourites while preserving favourite state'));
    await fireEvent.click(reject);
    expect(onReject).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ entity: expect.objectContaining({ id: 'item-1' }) }),
      expect.objectContaining({ entity: expect.objectContaining({ id: 'item-2' }) })
    ]), { confirmFavourites: true, confirmLargeSelection: false });
    await fireEvent.click(screen.getByRole('button', { name: 'Undo last bulk rejection' }));
    expect(onUndo).toHaveBeenCalledWith('bulk-action');
  });

  it('supports pointer brush selection', async () => {
    render(BulkRejectView, {
      items: [result('item-1'), result('item-2'), result('item-3')],
      virtualize: false
    });
    const first = screen.getByRole('button', { name: 'Select item-1.jpg' });
    const third = screen.getByRole('button', { name: 'Select item-3.jpg' });
    await fireEvent.pointerDown(first, { button: 0 });
    await fireEvent.pointerEnter(third);
    await fireEvent.pointerUp(screen.getByRole('group', { name: 'Bulk reject brush selection' }));
    expect(screen.getByRole('status')).toHaveTextContent('3 selected');
  });

  it('filters the bounded page and expands persisted Stack membership', async () => {
    const onExpandStack = vi.fn().mockResolvedValue([entity('member-1'), entity('member-2', true)]);
    const stacked = result('item-1');
    stacked.entity.stack = {
      profile_id: 'stack-profile', id: 'stack-1', member_count: 2, cover_entity_id: stacked.entity.id,
      ranked_cover_entity_id: stacked.entity.id, cover_override_entity_id: null,
      cover_explanation: 'Persisted cover', cover_method_version: 'cover-v1', cover_evidence: {},
      revision: 1, is_cover: true, member_ordinal: 0
    };
    render(BulkRejectView, {
      items: [stacked, result('item-2', true)],
      virtualize: false,
      onExpandStack
    });
    await fireEvent.input(screen.getByLabelText('Filter candidates'), { target: { value: 'item-1' } });
    expect(screen.getByText('1 shown from this bounded page')).toBeInTheDocument();
    await fireEvent.click(screen.getByRole('button', { name: 'Expand 2-member Stack' }));
    expect(onExpandStack).toHaveBeenCalledWith('stack-profile', 'stack-1');
    expect(await screen.findByText('member-1.jpg')).toBeInTheDocument();
    expect(screen.getByText('member-2.jpg')).toBeInTheDocument();
  });

  it('requires the dedicated large-selection confirmation', async () => {
    const onReject = vi.fn();
    const items = Array.from({ length: 101 }, (_, index) => result(`item-${index + 1}`));
    render(BulkRejectView, { items, virtualize: false, onReject });
    await fireEvent.keyDown(screen.getByRole('button', { name: 'Select item-1.jpg' }), { key: ' ' });
    await fireEvent.keyDown(screen.getByRole('button', { name: 'Select item-101.jpg' }), { key: ' ', shiftKey: true });
    await fireEvent.click(screen.getByLabelText('Confirm metadata-only rejection of 101 entities'));
    const reject = screen.getByRole('button', { name: 'Reject selected metadata' });
    expect(reject).toBeDisabled();
    await fireEvent.click(screen.getByLabelText('Confirm this large selection'));
    await fireEvent.click(reject);
    expect(onReject).toHaveBeenCalledWith(expect.any(Array), {
      confirmFavourites: false,
      confirmLargeSelection: true
    });
  });
});
