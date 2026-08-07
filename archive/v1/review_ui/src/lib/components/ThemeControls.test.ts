import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import ThemeControls from './ThemeControls.svelte';

describe('ThemeControls', () => {
  it('exposes labelled keyboard controls for theme and density', async () => {
    const onThemeChange = vi.fn();
    const onDensityChange = vi.fn();
    render(ThemeControls, { theme: 'system', density: 'comfortable', onThemeChange, onDensityChange });

    await fireEvent.change(screen.getByLabelText('Theme'), { target: { value: 'dark' } });
    await fireEvent.click(screen.getByRole('button', { name: 'Compact' }));

    expect(onThemeChange).toHaveBeenCalledWith('dark');
    expect(onDensityChange).toHaveBeenCalledWith('compact');
  });
});

