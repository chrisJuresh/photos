export type ThemePreference = 'system' | 'light' | 'dark';

export function applyTheme(theme: ThemePreference): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
}
