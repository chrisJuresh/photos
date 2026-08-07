import { beforeEach, describe, expect, it } from 'vitest';
import { clearScrollState, restoreScrollState, saveScrollState } from './scroll-state';

describe('scroll state', () => {
  beforeEach(() => sessionStorage.clear());

  it('persists bounded navigation state for restoration', () => {
    saveScrollState('library', { x: 0, y: 420, anchor: 'asset-9' });
    expect(restoreScrollState('library')).toEqual({ x: 0, y: 420, anchor: 'asset-9' });
    clearScrollState('library');
    expect(restoreScrollState('library')).toBeNull();
  });

  it('rejects malformed stored state', () => {
    sessionStorage.setItem('media-vault:scroll:library', '{not-json');
    expect(restoreScrollState('library')).toBeNull();
  });
});

