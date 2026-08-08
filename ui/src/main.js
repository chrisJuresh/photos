import "./app.css";
import { mount } from "svelte";
import App from "./App.svelte";
import { apply } from "./lib/glass.js";
import { restore } from "./lib/theme.js";

// Both before the mount, so the first paint of the app is already the right
// palette and the right material. `apply` writes the shipped glass settings
// onto `:root`; app.css carries the same numbers as fallbacks, so a pane that
// paints before this has run is the same pane.
restore();
apply();

mount(App, { target: document.getElementById("app") });
