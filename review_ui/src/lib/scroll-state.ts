const PREFIX = 'media-vault:scroll:';

export type ScrollState = {
  x: number;
  y: number;
  anchor?: string;
};

export function saveScrollState(key: string, value: ScrollState): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
}

export function restoreScrollState(key: string): ScrollState | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(`${PREFIX}${key}`);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ScrollState>;
    if (typeof value.x !== 'number' || typeof value.y !== 'number') return null;
    return { x: value.x, y: value.y, anchor: typeof value.anchor === 'string' ? value.anchor : undefined };
  } catch {
    return null;
  }
}

export function clearScrollState(key: string): void {
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(`${PREFIX}${key}`);
}

