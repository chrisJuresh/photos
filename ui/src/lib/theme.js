// Which way the page is set — black behind the photographs, or white — and
// remembering it between visits.
//
// The whole switch is one attribute on <html>: app.css declares the light
// palette under `:root[data-theme="light"]` and every colour downstream is a
// token, so nothing else has to know a theme exists. It is applied from main.js
// before the app mounts rather than from the button that flips it, because a
// component doing it would paint the default palette first and then correct it.
//
// Dark is the default, and there is no `prefers-color-scheme` fallback: this is
// a viewer for photographs, and the ground behind them is a decision about the
// photographs rather than about the machine.

const KEY = "photos.theme";
const DEFAULT = "dark";

/** The theme now on the document. */
export function current() {
  return document.documentElement.dataset.theme === "light" ? "light" : DEFAULT;
}

/**
 * Put the remembered theme on the document. localStorage is writable by
 * anything on this origin, so what comes out of it is checked against the two
 * themes that exist rather than trusted onto the attribute.
 */
export function restore() {
  const stored = localStorage.getItem(KEY);
  const theme = stored === "dark" || stored === "light" ? stored : DEFAULT;
  document.documentElement.dataset.theme = theme;
  return theme;
}

/** Switch, and remember. */
export function set(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(KEY, theme);
  return theme;
}
