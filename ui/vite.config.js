import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// Builds straight into the directory the Python server already serves, under
// fixed unhashed names, and never empties it -- index.html lives there and is
// hand-written, not generated.
//
// The two outputs are committed. They are the only build artefacts in the
// repository and they are here so that `python -m photolib.grid` works from a
// clean checkout without a node toolchain; the source of truth is ui/src.
export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: "../photolib/static",
    emptyOutDir: false,
    target: "es2022",
    cssCodeSplit: false,
    lib: {
      entry: "src/main.js",
      formats: ["es"],
      fileName: () => "bundle.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: (asset) =>
          asset.names?.some((name) => name.endsWith(".css"))
            ? "bundle.css"
            : "[name][extname]",
      },
    },
  },
});
