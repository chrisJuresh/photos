import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// Svelte 5, no Kit. SSR is meaningless for a localhost client-side virtual
// scroll and routing across eight screens is a number in a variable, so Kit
// would buy a build system and a server-side story neither half of this app
// has any use for.
export default {
  preprocess: vitePreprocess(),
};
