import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import ManifestReview from './ManifestReview.svelte';
import type { ImportManifestItem } from '$lib/api';

function item(index: number): ImportManifestItem {
  return {
    id: `item-${index}`,
    relative_path: `folder/photo-${index}.jpg`,
    path: `C:/synthetic/folder/photo-${index}.jpg`,
    entry_kind: 'file',
    classification: 'photo',
    media_kind: 'image',
    size_bytes: 1024 * index,
    extension: '.jpg',
    signature_kind: 'jpeg',
    mime_type: 'image/jpeg',
    detected_format: 'JPEG',
    unusual_extension: false,
    warnings: [],
    error: null,
    hash_status: 'verified',
    match_outcome: 'new_asset',
    copy_status: 'not_approved',
    copy_outcome: null,
    proposed_decision: 'include',
    effective_decision: 'include',
    decision_revision: 0,
    associated_sidecar_of_item_id: null,
    preview: { status: 'ready', url: `/preview/${index}`, error: null }
  };
}

describe('ManifestReview', () => {
  it('supports pointer brush selection, metadata-only decisions, and undo', async () => {
    const onDecide = vi.fn();
    render(ManifestReview, { items: [item(1), item(2), item(3)], virtualize: false, onDecide });
    const selectors = screen.getAllByRole('button', { name: /Select folder\/photo/ });

    await fireEvent.pointerDown(selectors[0], { button: 0, pointerId: 1 });
    await fireEvent.pointerEnter(selectors[2], { pointerId: 1 });
    await fireEvent.pointerUp(selectors[2], { pointerId: 1 });
    expect(screen.getByRole('status')).toHaveTextContent('3 selected');

    await fireEvent.click(screen.getByRole('button', { name: 'Exclude from this import' }));
    expect(onDecide).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: 'item-1' }), expect.objectContaining({ id: 'item-3' })]), 'exclude');
    await fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onDecide).toHaveBeenLastCalledWith(expect.any(Array), 'include');
  });

  it('supports keyboard ranges and forwards path, outcome, and safe multi-sort filters', async () => {
    const onFiltersChange = vi.fn();
    render(ManifestReview, { items: [item(1), item(2), item(3)], virtualize: false, onFiltersChange });
    const selectors = screen.getAllByRole('button', { name: /Select folder\/photo/ });
    await fireEvent.keyDown(selectors[0], { key: ' ' });
    await fireEvent.keyDown(selectors[0], { key: 'ArrowDown', shiftKey: true });
    expect(screen.getByRole('status')).toHaveTextContent('2 selected');

    await fireEvent.input(screen.getByLabelText('Path search'), { target: { value: 'holiday' } });
    await fireEvent.change(screen.getByLabelText('Classification'), { target: { value: 'photo' } });
    await fireEvent.change(screen.getByLabelText('Outcome'), { target: { value: 'new_asset' } });
    await fireEvent.change(screen.getByLabelText('Primary sort'), { target: { value: 'size:desc' } });
    await fireEvent.change(screen.getByLabelText('Secondary sort'), { target: { value: 'classification:asc' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Apply view' }));
    expect(onFiltersChange).toHaveBeenCalledWith({
      search: 'holiday',
      classification: 'photo',
      outcome: 'new_asset',
      sorts: ['size:desc', 'classification:asc']
    });
  });
});
