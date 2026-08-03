// `main.js` imports app.css for its side effect: that import is what makes vite
// emit bundle.css. svelte-check needs to be told the module exists.
declare module "*.css";
