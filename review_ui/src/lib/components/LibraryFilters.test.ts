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
        format: [], camera: [], lens: [],
        folder: [{ key: 'family\\holidays', label: 'family\\holidays', count: 8 }]
      },
      onApply
    });
    expect(screen.getByLabelText('Rejected')).toHaveValue('hide');
    expect(screen.getByLabelText('Catalogued folder')).toHaveValue('');
    expect(screen.getByText(/Apply view remembers it in SQLite/)).toBeInTheDocument();
    await fireEvent.change(screen.getByLabelText('Catalogued folder'), { target: { value: 'family\\holidays' } });
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
        folder: ['family\\holidays'],
        rejected: 'hide',
        sort: ['quality:desc', 'filename:asc']
      })
    }));
  });

  it('restores a saved folder even when it is outside the first bounded facet page', async () => {
    const view = render(LibraryFilters, {
      query: { rejected: 'hide', sort: ['capture_time:desc'] },
      facets: { media_kind: [], format: [], camera: [], lens: [], folder: [] }
    });

    await view.rerender({
      query: {
        rejected: 'hide',
        sort: ['capture_time:desc'],
        folder: ['archive\\family']
      },
      facets: { media_kind: [], format: [], camera: [], lens: [], folder: [] }
    });

    expect(screen.getByLabelText('Catalogued folder')).toHaveValue('archive\\family');
    expect(screen.getByRole('option', { name: 'archive\\family (saved selection)' })).toBeInTheDocument();
  });
});
