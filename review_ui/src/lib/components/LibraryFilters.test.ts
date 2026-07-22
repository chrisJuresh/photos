import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import LibraryFilters from './LibraryFilters.svelte';

describe('LibraryFilters', () => {
  it('forwards persisted facets, default rejected hiding, multi-sort, density, and display-only modes', async () => {
    const onApply = vi.fn();
    render(LibraryFilters, {
      query: { rejected: 'hide', sort: ['capture_time:desc'] },
      density: 220,
      facets: {
        media_kind: [{ key: 'image', label: 'Images', count: 12 }],
        format: [], camera: [], lens: [], folder: []
      },
      onApply
    });
    expect(screen.getByLabelText('Rejected')).toHaveValue('hide');
    await fireEvent.change(screen.getByLabelText('Media'), { target: { value: 'image' } });
    await fireEvent.change(screen.getByLabelText('Primary sort'), { target: { value: 'quality:desc' } });
    await fireEvent.change(screen.getByLabelText('Secondary sort'), { target: { value: 'filename:asc' } });
    await fireEvent.input(screen.getByRole('slider', { name: /Thumbnail size/ }), { target: { value: '300' } });
    await fireEvent.click(screen.getByLabelText('Film contact sheet'));
    await fireEvent.click(screen.getByLabelText('Display-only grayscale'));
    await fireEvent.click(screen.getByRole('button', { name: 'Apply view' }));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({
      density: 300,
      contactSheet: true,
      grayscale: true,
      query: expect.objectContaining({
        mediaKind: ['image'],
        rejected: 'hide',
        sort: ['quality:desc', 'filename:asc']
      })
    }));
  });
});
