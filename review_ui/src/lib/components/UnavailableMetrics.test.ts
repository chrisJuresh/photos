import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import UnavailableMetrics from './UnavailableMetrics.svelte';

describe('UnavailableMetrics', () => {
  it('labels unrecorded legacy values without inventing replacements', () => {
    render(UnavailableMetrics, { fields: [{ field: 'ewma_throughput_bps', reason: 'not recorded by this version' }] });
    expect(screen.getByRole('heading', { name: 'Unavailable legacy metrics' })).toBeInTheDocument();
    expect(screen.getByText('not recorded by this version')).toBeInTheDocument();
    expect(screen.getByText(/not fabricated/)).toBeInTheDocument();
  });
});
