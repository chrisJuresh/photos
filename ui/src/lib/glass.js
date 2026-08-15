// The header's material: iyinchao/liquid-glass-studio, reduced to what a
// backdrop filter can carry.
//
// https://github.com/iyinchao/liquid-glass-studio is a WebGL2/WebGPU renderer.
// It has a fragment shader, a full-canvas backdrop it owns, and a Leva panel of
// twenty-nine controls. None of that is available to a fixed header floating
// over a scrolling document: there is one element, one `backdrop-filter`, and
// whatever the compositor already has behind it. What follows is that shader's
// four visible parts, each expressed in the one CSS mechanism that can carry it.
//
//   * **Refraction** is an SVG `feDisplacementMap` used as a backdrop filter. A
//     map is drawn whose red channel says how far to move each backdrop pixel
//     horizontally and whose green says vertically, 128 meaning "not at all";
//     `feDisplacementMap` then samples the backdrop through it. Studio's optics
//     are in `sampler()` below and are the reason this is per-pixel canvas work
//     rather than the gradient ramp this file used to draw.
//   * **Dispersion** is that pass run three times at slightly different scales,
//     one per colour channel, recombined with `feBlend`. Red bends further than
//     blue, which is the coloured fringe at a real lens's edge.
//   * **Fresnel** and **glare** are the rim: two masked rings on `::before` and
//     `::after`, the first a flat wash and the second a conic gradient with two
//     opposite lobes, the far one dimmer. The shader computes both per pixel
//     from the same signed distance field the map uses; a ring with a blur is
//     the same falloff at a hundredth of the cost, and it updates while a slider
//     is moving. What the glare's brightness varies with is the **surface
//     normal**, not the direction from the centre, so its stops are laid out off
//     each pane's own outline — see `glare()`.
//   * **Blur, tint and shadow** are ordinary CSS, driven by custom properties,
//     and so are the **control fill and ink** — the one part of this that is
//     about the writing on the pane rather than about the pane.
//
// Two things are load-bearing:
//
// * The filter lives in this document and is referenced as `url(#id)`. A data:
//   URI would be a fetch, and the page's CSP is `default-src 'none'`. The map
//   inside it is a data: URI, which `img-src data:` does allow.
// * Chromium is the only engine that runs `url()` in a backdrop filter today.
//   The blur, tint, rings and shadow are the whole material on their own, and
//   the refraction only ever adds to them: the custom property is set, the
//   computed value is read back, and if the declaration did not survive it is
//   removed and the pane stays frosted.
//
// What does not survive the reduction, and is marked as such on `/tune`:
// upstream's shape controls belong to its own demo blob rather than to a bar
// that is sized by its contents, and `blurEdge` there chooses between a sharp
// and a pre-blurred copy of the backdrop per pixel, which one backdrop filter
// cannot do. It is kept here as the nearest real thing — which of blur and
// refraction runs first — because that is the same question about the same two
// images, and the answer is visible.

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * What the studio's own editor opens on, key for key — `src/Controls.tsx`.
 * The `/tune` panel's "Studio defaults" button, and the thing every number
 * below is a departure from.
 */
export const STUDIO = {
  refThickness: 20,
  refFactor: 1.4,
  refDispersion: 7,
  refFresnelRange: 30,
  refFresnelHardness: 20,
  refFresnelFactor: 20,
  glareRange: 30,
  glareHardness: 20,
  glareFactor: 90,
  glareConvergence: 50,
  glareOppositeFactor: 80,
  glareAngle: -45,
  blurRadius: 1,
  blurEdge: true,
  tint: { r: 255, g: 255, b: 255, a: 0 },
  tintLight: { r: 255, g: 255, b: 255, a: 0 },
  shadowExpand: 25,
  shadowFactor: 15,
  shadowX: 0,
  shadowY: -10,
  shapeRadius: 80,
  shapeRoundness: 5,
};

/**
 * What ships: the studio's optics as they came back from a `/tune` session over
 * the real grid, plus the six settings it has no control for at all. Every
 * number below is a departure from `STUDIO`, and there are more of them than
 * there were — this was once the blur and the two tints and nothing else. The
 * studio's editor shows one blob on a backdrop it owns; a header is read over
 * whatever photograph the page happens to be scrolled to, which is a different
 * question about the same shader.
 *
 * Optically: `refFactor` 2 bends harder than the studio's 1.4, and
 * `refFresnelRange` 0 takes the flat wash off the rim, leaving that bend and the
 * glare to draw the edge between them. The glare is a narrow band (`glareRange`
 * 14) with no hard edge left to it (`glareHardness` 0), driven past white
 * (`glareFactor` 120) and raised to an exponent of 2.1 (`glareConvergence` 100)
 * — two short highlights on opposite corners rather than the studio's rim lit
 * almost the whole way round. `shadowFactor` 50 is over three times the
 * studio's, which is what holds the pane off a bright sky now that the tint no
 * longer does. `shapeRoundness` 2 is the ordinary circular corner, on the
 * studio's own 80px radius, which at this height the browser clamps to a pill.
 *
 * The tint is per theme because the ground is: white text needs the pane darker
 * than the photograph and black text needs it lighter, and that is the one
 * decision `data-theme` makes about this material. Here the dark pane is the
 * studio's own clear one and the light pane is barely tinted, which is only
 * possible because the ground moved under the words instead — see `control`.
 *
 * `saturation` is not the studio's either, and it is not part of that departure:
 * its shader has no saturation term at all. It is a backdrop-filter stage in
 * exactly the way the blur is — one number multiplying the chroma of whatever
 * photograph is behind the pane — and it was a literal 200% in the stylesheet,
 * with a second literal 170% on the panels, until it was asked what it was for.
 * It is here so that question can be answered by scrolling rather than guessed
 * at, and the two literals are now one number: the panels are the same material
 * as the bar, and only depth — blur and tint — distinguishes them.
 *
 * The last four pairs are not the studio's at all — its editor tints a blob with
 * nothing written on it, and this one carries a count and five controls. They
 * are here because the tint alone cannot answer for legibility: a pane tuned
 * clear enough to see the photograph through is a pane whose text has no ground,
 * and the way out is to put the ground under the words rather than under the
 * whole bar. `control` is the fill behind a pill, `ink` is what is written on
 * it, and both are per theme for the same reason the tint is. In light they now
 * carry nearly the whole of it: a fill at 0.81 is an all but opaque pill sitting
 * on a 0.13 pane.
 *
 * `tally` and `tallyInk` are the count's own pair, and the reason they exist is
 * the reason the count is a second pane at all: it is the one thing up there
 * that is an answer rather than a control, and the ground that reads under five
 * pills is not necessarily the ground a five-digit number wants behind it. They
 * no longer open on the bar's values — the count kept the tint the bar gave up,
 * a dark 0.32 against a clear pane and a light 0.82 against a 0.13 one, which is
 * the whole of what having them separate was for.
 *
 * `tallyHeight` is the same argument about geometry rather than colour, and it
 * is the one size in this material that is a number at all: upstream's
 * `shapeWidth`/`shapeHeight` size a demo blob, and the bar here is sized by its
 * contents, but the count pane holds one answer and nothing that has to fit
 * beside it. It ships at 42 against the bar's 56, so the count is the shorter of
 * the two and is centred in the row rather than setting its height.
 *
 * The last three are where the panes sit rather than what they are made of, and
 * they are here for the same reason the height is: a floating pane's margin is
 * part of whether it reads as floating, and that is a judgement about a
 * photograph rather than a constant. `headerTop` and `headerSide` are the bar's
 * own margins and nothing else's — one number each rather than one for all three
 * edges, because the top is the one that has a photograph scrolling under it.
 * The sheet keeps app.css's own `--page-inset` from the left, right and bottom
 * of the window whatever `headerSide` is set to: pulling the floating bar in
 * from the edge is a judgement about the bar, and dragging every photograph in
 * the grid sideways with it is not what that judgement was about.
 *
 * The two sides are one number rather than two because the bar is centred, and
 * at the shipped 650 the margin it opens is also where the count pane lives —
 * hung off the bar's left edge, out of the flow, so that the thing centred in
 * the window is the bar and not the pair. The bar stops shrinking at app.css's
 * `--bar-min` and the margin gives way instead, so 650 is a margin on a wide
 * monitor and a centred 560px bar on a narrow one rather than nothing at all.
 *
 * `pageTop` is the gap between the bar's bottom edge and the first row of tiles
 * — the sheet's top padding is `headerTop + headerHeight + pageTop`. It ships at
 * 14, app.css's own `--page-inset`, so the space the grid keeps under the header
 * is the space it keeps from every other edge of the window. Two of the three
 * move the photographs and both move them down — `headerTop` because the tiles
 * follow the bar rather than sliding under it, `pageTop` because that is what it
 * is for. `headerSide` moves the bar and the count alone.
 */
export const SHIPPED = {
  ...STUDIO,
  refFactor: 2,
  refFresnelRange: 0,
  glareRange: 14,
  glareHardness: 0,
  glareFactor: 120,
  glareConvergence: 100,
  blurRadius: 2,
  tintLight: { r: 255, g: 255, b: 255, a: 0.13 },
  shadowFactor: 50,
  shapeRoundness: 2,
  saturation: 130,
  control: { r: 255, g: 255, b: 255, a: 0.08 },
  controlLight: { r: 255, g: 255, b: 255, a: 0.81 },
  ink: { r: 237, g: 238, b: 242, a: 1 },
  inkLight: { r: 28, g: 28, b: 28, a: 1 },
  tally: { r: 16, g: 16, b: 21, a: 0.32 },
  tallyLight: { r: 255, g: 255, b: 255, a: 0.82 },
  tallyInk: { r: 237, g: 238, b: 242, a: 1 },
  tallyInkLight: { r: 28, g: 28, b: 28, a: 1 },
  tallyHeight: 42,
  headerTop: 14,
  headerSide: 650,
  pageTop: 14,
};

/**
 * The colour pairs, dark key first, with the object each is a departure from.
 * The tint is upstream's control, so its default is upstream's; the other four
 * have no studio value, so theirs is what ships. `/tune` renders this list and
 * nothing here has to know how many of them there are.
 */
export const COLOURS = [
  { dark: "tint", light: "tintLight", base: STUDIO },
  { dark: "control", light: "controlLight", base: SHIPPED },
  { dark: "ink", light: "inkLight", base: SHIPPED },
  { dark: "tally", light: "tallyLight", base: SHIPPED },
  { dark: "tallyInk", light: "tallyInkLight", base: SHIPPED },
];

// -------------------------------------------------------------- the settings

const listeners = new Set();
let live = { ...SHIPPED };

/** The settings now on the document. */
export function settings() {
  return live;
}

/**
 * Replace them, write them to the document, and tell every mounted pane to
 * redraw its map. Unknown keys are dropped and every known one is coerced, so a
 * pasted object cannot put `NaN` into a filter scale.
 */
export function tune(next) {
  live = coerce(next);
  apply();
  for (const listener of listeners) listener(live);
  return live;
}

/** Called by every mounted pane. Returns its own unsubscribe. */
export function watch(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function number(value, fallback) {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function colour(value, fallback) {
  if (!value || typeof value !== "object") return { ...fallback };
  return {
    r: clamp(number(value.r, fallback.r), 0, 255),
    g: clamp(number(value.g, fallback.g), 0, 255),
    b: clamp(number(value.b, fallback.b), 0, 255),
    a: clamp(number(value.a, fallback.a), 0, 1),
  };
}

/** @returns {typeof SHIPPED} */
function coerce(next) {
  const source = next && typeof next === "object" ? next : {};
  /** @type {any} */
  const out = {};
  for (const [key, fallback] of Object.entries(SHIPPED)) {
    if (typeof fallback === "boolean") out[key] = source[key] === undefined ? fallback : !!source[key];
    else if (typeof fallback === "object") out[key] = colour(source[key], fallback);
    else out[key] = number(source[key], fallback);
  }
  return out;
}

// ------------------------------------------------------------ the stylesheet

function rgba({ r, g, b, a }) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${round(a, 3)})`;
}

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

// A panel of dense text needs more ground under it than a bar of five words
// does. Rather than a second parameter set nobody would keep in step with the
// first, the sheet is the bar's own tint pushed towards opaque and its own blur
// deepened — one material, two depths.
function deepen({ r, g, b, a }) {
  return { r, g, b, a: clamp(a * 1.7 + 0.22, 0, 1) };
}

// The ring the shader draws as a per-pixel falloff off the signed distance
// field, as a masked border. `range` is 0–100 in the editor and becomes the
// band's width; `hardness` is how much of that width is a soft edge rather than
// a hard one, so it runs backwards into a blur radius.
function ring(range, hardness) {
  const width = 0.4 + (clamp(range, 0, 100) / 100) * 5;
  return { width, blur: width * (1 - clamp(hardness, 0, 100) / 100) };
}

// Studio's glare, per surface normal, ported term for term from its
// `fragment-main.glsl`. `theta` is that normal's angle in the shader's own
// convention — `atan2` of a y-up vector, wrapped into [0, 2π) — because the
// near and far lobes are picked by comparing the doubled angle against
// hard-coded multiples of π, and a signed angle would put the far side on the
// wrong lobe.
//
// The doubling is the whole character of it: brightness has a period of 180° in
// the normal, so it is a raised sine with two peaks on opposite arcs falling to
// nothing at the two normals perpendicular to them. `glareConvergence` is the
// exponent that raised sine is taken to, not a lobe width — at the studio's 50
// it is 1.1, which is a rim lit almost all the way round, and at the shipped 100
// it is 2.1, which is two highlights with dark between them. At the shipped -45°
// the two zeros land on the top-right and bottom-left corners and the peaks on
// the other two, and `glareFactor` 120 through the shader's own 1.2 overshoots 1
// by half, so the near peak clips to pure white across the whole of its top.
// `glareOppositeFactor` dims the far lobe, which is the one whose normals point
// down-right.
function glareAt(theta, s) {
  const angle = (theta - Math.PI / 4 + s.glareAngle * (Math.PI / 180)) * 2;
  const far = (angle > Math.PI * 1.5 && angle < Math.PI * 3.5) || angle < Math.PI * -0.5;
  const lobe = 1.2 * (far ? clamp(s.glareOppositeFactor, 0, 100) / 100 : 1);
  const lit = (0.5 + Math.sin(angle) * 0.5) * lobe * Math.max(s.glareFactor, 0) / 100;
  return clamp(lit ** (0.1 + (clamp(s.glareConvergence, 0, 100) / 100) * 2), 0, 1);
}

// Each corner clockwise from the top edge's midpoint: the sign of its x and y in
// screen coordinates, and whether the arc is walked down the parameter or up it,
// which is what keeps that walk clockwise all the way round.
/** @type {[number, number, boolean][]} */
const CORNERS = [
  [1, -1, true],
  [1, 1, false],
  [-1, 1, true],
  [-1, -1, false],
];

/**
 * That brightness as a conic gradient — but indexed by the normal rather than by
 * the direction from the centre, which is why this needs the pane's own size.
 *
 * The two are the same thing only on a square. On a 1200×56 bar the top edge is
 * 175° of the sweep round the centre and each end cap is 5° of it, so a gradient
 * read straight off that angle puts a lobe halfway along a long edge, leaves the
 * corners unlit, and squeezes what should be the brightest part of the rim into
 * a few pixels of end cap. Handed the same numbers, the small pane looks nearly
 * right and the header looks wrong, which is exactly the symptom.
 *
 * So the stops are laid out off the outline itself: walk the boundary of the
 * same superellipse-cornered rectangle `sdf()` measures, and at each point emit
 * `glareAt(normal)` at the position angle that point actually sits at. Straight
 * edges contribute only their endpoints — the normal does not turn along one, so
 * two stops of equal brightness draw the flat band that belongs there — and the
 * corner arcs, where it turns through the whole 90°, are sampled. Their curve is
 * `qx^k + qy^k = r^k` parametrised as `(r·cos t^(2/k), r·sin t^(2/k))`, exact for
 * every exponent rather than a circle standing in for one, and its normal is
 * `(qx^(k-1), qy^(k-1))` — which at the ends of the arc is the flat edge's own
 * normal, so the corners and the edges are one walk.
 */
function glare(width, height, s) {
  const k = clamp(s.shapeRoundness, 2, 7);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const radius = Math.min(s.shapeRadius, halfWidth, halfHeight);
  const insetX = halfWidth - radius;
  const insetY = halfHeight - radius;

  const N = 8;
  const arc = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * (Math.PI / 2);
    arc.push([radius * Math.cos(t) ** (2 / k), radius * Math.sin(t) ** (2 / k)]);
  }

  const stops = [];
  // `turn` is the conic gradient's own coordinate: zero at 12 o'clock, clockwise,
  // as a percentage. `theta` is the shader's, off a y-up normal.
  const add = (x, y, nx, ny) => {
    let turn = Math.atan2(x, -y);
    if (turn < 0) turn += Math.PI * 2;
    let theta = Math.atan2(ny, nx);
    if (theta < 0) theta += Math.PI * 2;
    const alpha = round(glareAt(theta, s), 3);
    stops.push(`rgba(255, 255, 255, ${alpha}) ${round((turn / (Math.PI * 2)) * 100, 2)}%`);
  };

  add(0, -halfHeight, 0, 1);
  for (const [sx, sy, down] of CORNERS) {
    for (let i = 0; i <= N; i++) {
      const [qx, qy] = arc[down ? N - i : i];
      add(sx * (insetX + qx), sy * (insetY + qy), sx * qx ** (k - 1), -sy * qy ** (k - 1));
    }
  }
  stops.push(`rgba(255, 255, 255, ${round(glareAt(Math.PI / 2, s), 3)}) 100%`);

  return `conic-gradient(${stops.join(", ")})`;
}

/**
 * Write the settings onto `:root`. Everything here is a custom property the
 * stylesheet already reads, so this costs one style recalculation — and, for
 * all but the four sizes, no layout, which is what lets a slider drag stay
 * smooth while twenty panes are mounted.
 *
 * Both tints are written and the stylesheet picks: `data-theme` can flip at any
 * moment and nothing in this module should have to know that it did.
 */
export function apply() {
  const s = live;
  const root = document.documentElement.style;
  const fresnel = ring(s.refFresnelRange, s.refFresnelHardness);
  const glareRing = ring(s.glareRange, s.glareHardness);

  root.setProperty("--glass-blur", `${round(s.blurRadius)}px`);
  root.setProperty("--glass-saturate", `${round(Math.max(s.saturation, 0))}%`);
  root.setProperty("--glass-tint-dark", rgba(s.tint));
  root.setProperty("--glass-tint-light", rgba(s.tintLight));
  root.setProperty("--glass-tint-sheet-dark", rgba(deepen(s.tint)));
  root.setProperty("--glass-tint-sheet-light", rgba(deepen(s.tintLight)));
  root.setProperty("--glass-ctl-dark", rgba(s.control));
  root.setProperty("--glass-ctl-light", rgba(s.controlLight));
  root.setProperty("--glass-text-dark", rgba(s.ink));
  root.setProperty("--glass-text-light", rgba(s.inkLight));
  root.setProperty("--glass-tint-tally-dark", rgba(s.tally));
  root.setProperty("--glass-tint-tally-light", rgba(s.tallyLight));
  root.setProperty("--glass-text-tally-dark", rgba(s.tallyInk));
  root.setProperty("--glass-text-tally-light", rgba(s.tallyInkLight));
  root.setProperty("--glass-tally-h", `${round(Math.max(s.tallyHeight, 0))}px`);
  // Where the row sits and where the tiles start under it. Not `--glass-`
  // prefixed: these are the page's own metrics, which app.css declares with the
  // same numbers so the first paint before this has run is the same page.
  root.setProperty("--header-top", `${round(Math.max(s.headerTop, 0))}px`);
  root.setProperty("--header-side", `${round(Math.max(s.headerSide, 0))}px`);
  root.setProperty("--page-top", `${round(Math.max(s.pageTop, 0))}px`);
  // The shadow in two halves rather than as one value: the stylesheet multiplies
  // the alpha by `--glass-lift`, which the header runs off the scroll position so
  // that the bar casts a shadow onto the photographs and none onto the page above
  // them. A shadow that arrives as a finished `rgba()` has nothing to multiply.
  root.setProperty(
    "--glass-shadow-geometry",
    `${round(s.shadowX)}px ${round(-s.shadowY)}px ${round(s.shadowExpand)}px`,
  );
  root.setProperty(
    "--glass-shadow-alpha",
    String(round(clamp(s.shadowFactor, 0, 100) / 100, 3)),
  );
  root.setProperty("--glass-radius", `${round(s.shapeRadius, 1)}px`);
  // CSS's `superellipse(k)` is logarithmic: the curve it draws is
  // |x|^(2ᵏ) + |y|^(2ᵏ) = 1, so `round` — the circular corner, exponent 2 — is
  // `superellipse(1)` and `squircle` — exponent 4 — is `superellipse(2)`.
  // Upstream's `shapeRoundness` is the exponent itself, which is what `sdf()`
  // takes, so the painted corner needs its logarithm. Handed over raw, the
  // shipped 5 asked for an exponent of 32, a corner with no curve left in it,
  // while the displacement map went on refracting the exponent-5 arc — the paint
  // squarer than the refraction, and the radius with nothing left to round.
  root.setProperty("--glass-roundness", String(round(Math.log2(clamp(s.shapeRoundness, 2, 7)), 3)));
  root.setProperty("--glass-fresnel-w", `${round(fresnel.width)}px`);
  root.setProperty("--glass-fresnel-blur", `${round(fresnel.blur)}px`);
  root.setProperty(
    "--glass-fresnel",
    `rgba(255, 255, 255, ${round(clamp(s.refFresnelFactor, 0, 100) / 100 * 0.55, 3)})`,
  );
  root.setProperty("--glass-glare-w", `${round(glareRing.width)}px`);
  root.setProperty("--glass-glare-blur", `${round(glareRing.blur)}px`);
  // Not `--glass-glare`: the ring's brightness depends on the pane's own
  // proportions, so `refract()` writes it per node.
}

// ------------------------------------------------------------------- optics

function clamp(value, lo, hi) {
  return value < lo ? lo : value > hi ? hi : value;
}

// The signed distance to a superellipse-cornered rectangle: negative inside,
// positive outside. `k` is the corner exponent — 2 is the ordinary circular
// round that `border-radius` draws, and upstream's `shapeRoundness` runs to 7,
// which is nearly square with softened corners. Kept in step with the
// `corner-shape: superellipse()` app.css asks for, so the map's idea of the
// boundary is the same as the painted one.
function sdf(x, y, halfWidth, halfHeight, radius, k) {
  const qx = Math.abs(x) - halfWidth + radius;
  const qy = Math.abs(y) - halfHeight + radius;
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  const corner =
    k === 2 ? Math.hypot(ox, oy) : (ox ** k + oy ** k) ** (1 / k);
  return Math.min(Math.max(qx, qy), 0) + corner - radius;
}

// liquid-glass-studio's refraction. The angle of incidence is not derived from
// a surface at all: it is read straight off how far through the bevel band you
// are, θᵢ = asin((1 − d/thickness)²). So the outermost pixel is at a grazing
// 90° — maximal bend — and because the ratio is squared the bend collapses
// quickly, reaching a tenth of its peak about a third of the way in. That is a
// much sharper falloff than a height profile produces, and it is what gives
// this material a hot rim over a quiet middle.
//
// The offset is `tan(θᵢ − θₜ)` times the thickness, which is a slope times a
// depth and so is already in pixels: no gain constant, and `refThickness` sets
// both how wide the band is and how hard it bends.
function sampler(width, height, s) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const k = clamp(s.shapeRoundness, 2, 7);
  const radius = Math.min(s.shapeRadius, Math.min(width, height) / 2);
  const reach = Math.max(1, Math.min(s.refThickness, Math.min(width, height) / 2.5));
  const ior = Math.max(1.0001, s.refFactor);
  const at = (x, y) => sdf(x - halfWidth, y - halfHeight, halfWidth, halfHeight, radius, k);

  // Depth only, so the trigonometry runs 257 times rather than once per pixel.
  const N = 256;
  const table = new Float32Array(N + 1);
  for (let i = 0; i <= N; i++) {
    const ratio = 1 - i / N;
    const thetaI = Math.asin(clamp(ratio * ratio, 0, 1));
    const thetaT = Math.asin(clamp(Math.sin(thetaI) / ior, 0, 1));
    // Finite even at the grazing rim — 1.12 at n = 1.5 — so this needs no cap.
    table[i] = Math.tan(thetaI - thetaT) * reach;
  }

  return (x, y) => {
    const inside = -at(x, y);
    if (inside < 0) return null;
    if (inside >= reach) return null;
    const magnitude = table[Math.round((inside / reach) * N)];
    if (magnitude === 0) return null;
    const e = 0.75;
    const nx = at(x + e, y) - at(x - e, y);
    const ny = at(x, y + e) - at(x, y - e);
    const length = Math.hypot(nx, ny);
    if (length === 0) return null;
    // Against the outward normal, as theirs is: this magnifies rather than
    // compressing the backdrop into the band.
    const scale = -magnitude / length;
    return { dx: nx * scale, dy: ny * scale };
  };
}

// One RGBA map, normalised so the largest displacement lands on 255, plus the
// `scale` that turns that back into the pixel count it stood for.
function encode(width, height, sample) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const image = context.createImageData(width, height);
  const pixels = image.data;
  const count = width * height;
  const xs = new Float32Array(count);
  const ys = new Float32Array(count);

  let maxima = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const point = sample(x + 0.5, y + 0.5);
      if (!point) continue;
      const index = y * width + x;
      xs[index] = point.dx;
      ys[index] = point.dy;
      const magnitude = Math.hypot(point.dx, point.dy);
      if (magnitude > maxima) maxima = magnitude;
    }
  }

  const norm = maxima > 0 ? 127 / maxima : 0;
  for (let index = 0; index < count; index++) {
    const out = index * 4;
    pixels[out] = 128 + clamp(Math.round(xs[index] * norm), -127, 127);
    pixels[out + 1] = 128 + clamp(Math.round(ys[index] * norm), -127, 127);
    pixels[out + 2] = 128;
    pixels[out + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  // 255 is half of `scale` away from neutral, so the scale that reproduces
  // `maxima` pixels of movement is twice it.
  return { url: canvas.toDataURL(), scale: maxima * 2 };
}

// One <feDisplacementMap> + <feColorMatrix> pair per channel. The matrix keeps
// that channel and nothing else, so the three passes can be screened back
// together with each having sampled the backdrop from a slightly different
// place.
const KEEP = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
];

function pass(scale, keep, result) {
  return (
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${round(scale, 3)}" ` +
    `xChannelSelector="R" yChannelSelector="G"/>` +
    `<feColorMatrix type="matrix" values="${keep}" result="${result}"/>`
  );
}

// ------------------------------------------------------------------ the defs

let defs = null;
let seq = 0;

// One hidden <svg> for every filter on the page. Outside any glass element:
// nesting it inside one would put the filter's own subtree in the backdrop it
// is filtering.
function container() {
  if (defs) return defs;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.classList.add("glass-defs");
  defs = document.createElementNS(SVG_NS, "defs");
  svg.appendChild(defs);
  document.body.appendChild(svg);
  return defs;
}

/**
 * Svelte action. Keeps a displacement filter sized to the node and exposes it
 * in whichever of `--glass-pre` and `--glass-post` `blurEdge` asks for, which
 * is where the stylesheet splices it into the node's own backdrop filter.
 * Redraws on resize and whenever `tune()` changes an optical setting.
 *
 * It also writes the node's `--glass-glare`, for the reason above `glare()`:
 * that ring is a function of the surface normal, and which normal a point on the
 * rim has is a fact about this pane's proportions. Unlike the map it is a string
 * rather than a canvas, so it is rebuilt on every settings change without being
 * coalesced.
 *
 * @param {HTMLElement} node
 */
export function refract(node) {
  const base = `glass-refract-${++seq}`;
  const filter = document.createElementNS(SVG_NS, "filter");
  filter.setAttribute("color-interpolation-filters", "sRGB");
  filter.setAttribute("filterUnits", "userSpaceOnUse");
  container().appendChild(filter);

  let width = 0;
  let height = 0;
  let version = 0;
  let frame = 0;
  // Only these change the map. A tint or a shadow is a custom property and
  // costs nothing; a map is a canvas the width of the header, so it is not
  // rebuilt because the glare angle moved.
  const OPTICAL = ["refThickness", "refFactor", "refDispersion", "shapeRadius", "shapeRoundness"];
  let drawn = null;
  let url = "";

  // Where the refraction sits in the node's own backdrop filter, which is what
  // is left of upstream's `blurEdge` once there is one filter chain rather than
  // a shader that can choose per pixel. After the blur, the rim lenses an
  // already-smeared backdrop, which is the gated-off case; before it, the rim
  // lenses the sharp one and the blur that follows softens the result. CSS
  // cannot reorder a list from a variable, so both slots exist and one is empty.
  function place() {
    node.style.setProperty("--glass-pre", live.blurEdge ? "" : url);
    node.style.setProperty("--glass-post", live.blurEdge ? url : "");
  }

  function paint() {
    if (width < 2 || height < 2) return;
    node.style.setProperty("--glass-glare", glare(width, height, live));
  }

  function draw() {
    if (width < 2 || height < 2) return;
    const s = live;
    const map = encode(width, height, sampler(width, height, s));
    // Their chromatic aberration, `offset * (1 - (N - 1) * factor)` with the
    // three indices 0.98, 1.0 and 1.02: red comes out wider than blue by twice
    // `refDispersion` percent, and at 0 the three passes coincide.
    const spread = (s.refDispersion * 2) / 100;
    filter.setAttribute("x", "0");
    filter.setAttribute("y", "0");
    filter.setAttribute("width", String(width));
    filter.setAttribute("height", String(height));
    filter.innerHTML =
      `<feImage x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none" ` +
      `href="${map.url}" result="map"/>` +
      pass(map.scale * (1 + spread), KEEP[0], "r") +
      pass(map.scale, KEEP[1], "g") +
      pass(map.scale * (1 - spread), KEEP[2], "b") +
      `<feBlend in="r" in2="g" mode="screen"/>` +
      `<feBlend in2="b" mode="screen"/>`;

    // A new id every redraw. A backdrop filter is composited, and rewriting the
    // filter it points at does not invalidate it — the pane keeps rendering
    // through the map it was rasterised with, which after a resize is the wrong
    // size. Changing the referenced id changes the declared value, and that does.
    filter.id = `${base}-${++version}`;

    // Ask for it, then check it was taken. An engine without url() support in a
    // backdrop filter drops the whole declaration, which would cost the blur too.
    url = `url(#${filter.id})`;
    place();
    if (!getComputedStyle(node).backdropFilter.includes("url(")) {
      url = "";
      place();
    }
    drawn = OPTICAL.map((key) => live[key]).join(" ");
  }

  // Coalesced, because a slider drag fires a change per pointer move and each
  // redraw is a canvas the size of the pane plus a PNG encode of it.
  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      draw();
    });
  }

  const observer = new ResizeObserver(([entry]) => {
    const box = entry.borderBoxSize?.[0];
    const next = box
      ? { w: Math.round(box.inlineSize), h: Math.round(box.blockSize) }
      : { w: Math.round(entry.contentRect.width), h: Math.round(entry.contentRect.height) };
    if (next.w === width && next.h === height) return;
    width = next.w;
    height = next.h;
    paint();
    schedule();
  });
  observer.observe(node);

  const unwatch = watch(() => {
    paint();
    if (OPTICAL.map((key) => live[key]).join(" ") !== drawn) schedule();
    else place();
  });

  return {
    destroy() {
      if (frame) cancelAnimationFrame(frame);
      unwatch();
      observer.disconnect();
      filter.remove();
      node.style.removeProperty("--glass-pre");
      node.style.removeProperty("--glass-post");
      node.style.removeProperty("--glass-glare");
    },
  };
}
