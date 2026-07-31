import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ShellNav from './ShellNav.svelte';

describe('ShellNav', () => {
  it('marks the active route and retains all foundational destinations', () => {
    render(ShellNav, { currentPath: '/settings/' });

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Imports' })).toHaveAttribute('href', '/imports/');
    expect(screen.getByRole('link', { name: 'Library' })).toHaveAttribute('href', '/library/');
    expect(screen.getByRole('link', { name: 'Organize' })).toHaveAttribute('href', '/organize/');
    expect(screen.getByRole('link', { name: 'Junk review' })).toHaveAttribute('href', '/junk/');
    expect(screen.getByRole('link', { name: 'Bulk reject' })).toHaveAttribute('href', '/bulk-reject/');
  });
});
