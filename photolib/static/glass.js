// Glass lab — ten implementations, their displacement filters, and the grid
// they float over.
//
// **Every variant is at the settings its own source ships.** Where a library
// documents defaults they are those defaults verbatim; where a demo publishes a
// filter its attribute values are copied; where an editor has controls they are
// the values it opens on. Nothing here is turned up to be more visible, and no
// variant is a second configuration of a source that already has one — which is
// why there is one kube.io entry and not three.
//
// Every variant that refracts does it the same way the published implementation
// does: a displacement map is drawn at the pane's own pixel size and fed to
// `feDisplacementMap` through a filter this document owns, and the stylesheet
// appends that filter to the pane's `backdrop-filter` via `--glass-refract`.
// What differs between them — and it is the whole point of the page — is how
// the map is computed:
//
//   * `ramp`       two linear gradients flattened to neutral inside a blurred
//                  rounded rectangle. What this build ships.
//   * `shuding`    a rounded-rect SDF, two smoothsteps, the UV scaled toward
//                  the centre. Ported from the copy-paste shader.
//   * `snell`      a height profile across the bevel band, its derivative as
//                  the surface normal, and Snell's law at n=1.5.
//   * `ybouane`    a half-circle bevel measured in pixels, finite-differenced
//                  for its normal, and refraction linearised to 1 − 1/n instead
//                  of solved.
//   * `studio`     Snell's law again, but with the angle of incidence read off
//                  the edge ratio itself rather than off a surface derivative,
//                  so the outermost pixel enters at a grazing 90°.
//   * `turbulence` fractal noise, no map at all.
//
// One variant computes nothing: the TonniTools generator is a pure-CSS material
// — its refraction is concentric bands of `invert`/`contrast` rather than any
// displacement — so it carries no settings here and lives entirely in the
// stylesheet.
//
// Every variant also carries a `frost` entry, which is what `F` toggles: the same
// optics with ground under the text. Frost is blur and tint and nothing else, so
// it is a stylesheet layer under `body[data-frost="on"]` rather than a second set
// of maps — one variant excepted, because `overLight` halves a displacement scale.
// Three kinds, and the switcher always says which is in force:
//
//   * `own`     the variant is already frosted at its own defaults, so there is
//               nothing to add and `F` changes nothing. Four are.
//   * `source`  its own source publishes a frosted configuration, and these are
//               that configuration's values. Two do: liquid-glass-react's
//               `overLight` prop and ybouane's "Frosted Panel" example.
//   * `page`    its source ships the controls but publishes no frosted values, so
//               this is **this page's** frost and not theirs — the same one the
//               shipping header uses, blur 22px over a 44% dark tint, stated once
//               and used for all four rather than invented per variant.
//
// One detail is easy to get wrong and invisible when you do: `feDisplacementMap`
// moves a pixel by `scale * (channel - 0.5)`, so a channel encoded as 128 ± 127
// only reaches half of `scale`. Every builder here therefore asks for
// `2 * maxima` and not `maxima`.
//
// The other is the one the shipping implementation already learned: a backdrop
// filter is composited, and rewriting the filter it points at does not
// invalidate it. Each redraw takes a new id so the declared value changes.

const SVG_NS = "http://www.w3.org/2000/svg";

// ---------------------------------------------------------------- the catalogue

const VARIANTS = [
  {
    slug: "current",
    name: "This build",
    tag: "in tree",
    source: "ui/src/lib/glass.js",
    url: "https://github.com/w3c/svgwg/issues/1142",
    support: "chromium",
    note:
      "What ships today, at the action's own defaults: depth 12, feather 6, strength 62, dispersion 4. Linear red/green ramps flattened to neutral inside a blurred rounded rectangle, sampled three times at staggered scales for dispersion. The rim bends; the middle does not. Baseline — everything else is measured against this.",
    refract: { kind: "ramp", depth: 12, feather: 6, strength: 62, dispersion: 4 },
    frost: {
      kind: "own",
      what: "already frosted — blur 22px over a 44% dark tint. F changes nothing here.",
    },
  },
  {
    slug: "sdf",
    name: "shuding/liquid-glass",
    tag: "SDF shader",
    source: "shuding/liquid-glass",
    url: "https://github.com/shuding/liquid-glass",
    support: "chromium",
    note:
      "The copy-paste shader as published, including its literal SDF arguments: a rounded-rect signed distance field, two smoothsteps, the whole UV scaled toward the centre, and no dispersion. Displacement grows with distance from the middle, so the pane magnifies as one lens rather than bending only at the rim. His CSS is the filter first and then blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1), with no tint at all.",
    refract: { kind: "shuding", dispersion: 0 },
    frost: {
      kind: "page",
      what:
        "a console script with three options — width, height, fragment — and a fixed " +
        "blur(0.25px): no frost control at all. This page's frost instead, blur 22px over 44% dark.",
    },
  },
  {
    slug: "kube",
    name: "kube.io",
    tag: "SVG + Snell",
    source: "kube.io/blog/liquid-glass-css-svg",
    url: "https://kube.io/blog/liquid-glass-css-svg/",
    support: "chromium",
    note:
      "Refraction computed rather than approximated, at the article's defaults: convex circle — y = √(1−(1−x)²) — n = 1.5, no chromatic aberration, and the 0.2px blur that sits inside the filter ahead of the displacement. The 11px bevel is measured off its own published map, the one baked for the 320×42 searchbox. Its rim is a second baked image, saturated ×4 and composited at 0.4, which no parameter here can reconstruct — so this pane has no rim, and the bare edge is the honest consequence.",
    refract: { kind: "snell", profile: "circle", band: 11, ior: 1.5, dispersion: 0 },
    frost: {
      kind: "page",
      what:
        "its Blur Level runs 0–1 and its own searchbox opens at 1.0, which is a 1px " +
        "stdDeviation and no tint at all — not a frost. This page's frost instead, blur 22px over 44% dark.",
    },
  },
  {
    slug: "rdev",
    name: "liquid-glass-react",
    tag: "npm",
    source: "rdev/liquid-glass-react",
    url: "https://github.com/rdev/liquid-glass-react",
    support: "chromium",
    note:
      "The documented defaults: displacementScale 70, blurAmount 0.0625 — which its own formula turns into blur(6px) — saturation 140%, aberrationIntensity 2, elasticity 0.15. That aberration is 7px between channels, and that elasticity is a lean of 0.015px per pixel of pointer distance, fading out 200px from the edge. The two masked border rings it always draws are here, angle following the pointer; the radial sheen is not, because the library only paints that on a pane with an onClick. Its map is a baked JPEG, so a squircle bevel is the nearest this page's builders come to it.",
    refract: { kind: "snell", profile: "squircle", band: 20, ior: 1.5, dispersion: 7 },
    elastic: true,
    // The library's own frosted mode, and the only variant here whose frost is a
    // documented boolean rather than a number: `overLight`, for a pane over a light
    // background. Its four consequences are all in src/index.tsx — the blur constant
    // goes 4 → 12, so 4 + 0.0625×32 becomes 12 + 0.0625×32; a black layer at 0.2 and
    // a second black layer at mix-blend-mode overlay come on; the shadow goes to
    // 0 16px 70px rgba(0,0,0,0.75); and `displacementScale` is halved, which is the
    // one thing here a stylesheet cannot do — hence `gain`.
    frost: {
      kind: "source",
      what:
        "its own overLight prop: blur 14px, a 20% black layer plus a black overlay pass, " +
        "the heavier shadow, and the displacement halved.",
      refract: { gain: 0.5 },
    },
  },
  {
    slug: "turbulence",
    name: "feTurbulence",
    tag: "macOS demo",
    source: "lucasromerodb/liquid-glass-effect-macos",
    url: "https://github.com/lucasromerodb/liquid-glass-effect-macos",
    support: "chromium",
    note:
      "The most-copied recreation, and the cheapest: no computed map, just fractal noise displacing the backdrop. Its filter verbatim — baseFrequency 0.01, one octave, seed 5, softened by 3, displacing at 150 — under blur(3px) and the flat white tint at 0.25 it ships with. The distortion is organic rather than geometric, and it ignores the pane's shape entirely, which is either the charm or the problem.",
    refract: { kind: "turbulence", baseFrequency: 0.01, octaves: 1, seed: 5, soften: 3, scale: 150 },
    frost: {
      kind: "own",
      what:
        "already frosted — blur 3px under the flat white tint at 0.25 it ships. " +
        "F changes nothing here.",
    },
  },
  {
    slug: "css-shine",
    name: "Pure CSS shine",
    tag: "no SVG",
    source: "kevinbism, DEV",
    url: "https://dev.to/kevinbism/recreating-apples-liquid-glass-effect-with-pure-css-3gpl",
    support: "all",
    note:
      "No filter, no script, every engine, and the article's single implementation copied as it stands. The rim is an inset box-shadow offset far enough that only a crescent lands on the edge, blurred and brightened. Nothing bends — but it is the only variant here that survives Firefox and Safari intact, and on a small bar that may be worth more than refraction.",
    refract: null,
    frost: {
      kind: "own",
      what:
        "already frosted — blur 2px under white at 0.15, and the article publishes " +
        "no second set of values. F changes nothing here.",
    },
  },
  {
    slug: "apple",
    name: "Apple, as shipped",
    tag: "iOS 26.1",
    source: "CSS-Tricks, Getting Clarity on Liquid Glass",
    url: "https://css-tricks.com/getting-clarity-on-apples-liquid-glass/",
    support: "chromium",
    note:
      "The default appearance Apple settled on after the first betas were called illegible: lensing confined to a narrow rim, a flat middle, a heavy adaptive tint so text has ground under it whatever scrolls past, and a hairline rather than a bright ring. The only entry here whose source publishes no code — CSS-Tricks describes the material and these numbers are a reading of it, not a copy.",
    refract: { kind: "snell", profile: "squircle", band: 11, ior: 1.5, dispersion: 2 },
    // Apple ships exactly two materials — SwiftUI's `.regular` and `.clear`, which
    // iOS 26.1 surfaces to users as Tinted and Clear — and `.regular` *is* the
    // frosted one. This entry is already it, so the toggle has nothing to add;
    // the other direction is a different material, not a setting.
    frost: {
      kind: "own",
      what:
        "already frosted — blur 28px over a 55% dark tint. This is .regular; Apple's " +
        "other material is .clear, which goes the opposite way. F changes nothing here.",
    },
  },
  {
    slug: "ybouane",
    name: "ybouane/liquidglass",
    tag: "WebGL",
    source: "ybouane/liquidglass",
    url: "https://github.com/ybouane/liquidglass",
    support: "chromium",
    note:
      "A WebGL library reduced to a displacement map, at its DEFAULTS table: refraction 0.69, zRadius 40, bevelMode 0, chromAberration 0.05 — which its shader scales to about 2px — and blurAmount, tintStrength, saturation, brightness and specular all 0. Its bevel is a half-circle in pixels rather than a profile over a normalised band, its normal is finite-differenced off that height field, and its refraction is a flat 1−1/n applied at both surfaces plus the path between them. Both terms bend inward, so it magnifies where kube.io compresses. No blur and no tint whatsoever: the one pane here with no ground under its text.",
    refract: { kind: "ybouane", zRadius: 40, refract: 0.69, ior: 1.5, dispersion: 2 },
    // Its site publishes an example called "Frosted Panel", and it is one line:
    // `blurAmount: 0.25`. The px equivalent is arithmetic off its own renderer —
    // spread = blurAmount × 2.5, and BLUR_ITERATIONS 6 passes of the 9-tap kernel in
    // shaders.ts, whose weights carry a variance of 2.854 tap² and so σ = 1.69 taps
    // per pass. Six passes compose as √6, giving σ = 1.69 × 0.625 × √6 ≈ 2.6px, which
    // is what a CSS blur radius means. Their tint stays at 0, so their frosted pane
    // still has no ground under its text — theirs, not an omission here.
    frost: {
      kind: "source",
      what:
        "its site's Frosted Panel example, blurAmount 0.25 — about blur(2.6px) once its " +
        "six 9-tap passes are composed. Its tint stays 0, so still no ground under the text.",
    },
  },
  {
    slug: "studio",
    name: "liquid-glass-studio",
    tag: "WebGL2 / WebGPU",
    source: "iyinchao/liquid-glass-studio",
    url: "https://github.com/iyinchao/liquid-glass-studio",
    support: "chromium",
    note:
      "The most elaborate of them, and the only one with a WebGPU path, at the values its editor opens on: refThickness 20, refFactor 1.4, refDispersion 7, blurRadius 1, tint alpha 0, fresnel factor 20 of 100, glare at −45° with the opposite lobe at 80%. Snell's law again, but the angle of incidence is taken from the edge ratio itself — asin((1−d/thickness)²) — so the outermost pixel refracts at a grazing 90° and the bend dies off as the square of the depth. A hot rim over a quiet interior, and by default a clear pane rather than a frosted one.",
    refract: { kind: "studio", thickness: 20, ior: 1.4, strength: 42, dispersion: 7 },
    frost: {
      kind: "page",
      what:
        "blurRadius runs 1–200 and its tint is a free RGBA, so a frosted pane is well " +
        "inside its range — but the editor opens at 1 and alpha 0 and it publishes no " +
        "frosted preset, only export/import. This page's frost, blur 22px over 44% dark.",
    },
  },
  {
    slug: "tonni",
    name: "TonniTools generator",
    tag: "pure CSS",
    source: "tonnitools.com/liquid-glass",
    url: "https://www.tonnitools.com/liquid-glass/",
    support: "all",
    note:
      "The only variant here that refracts without moving a pixel, at the generator's own opening values: strength 14, softness 12, extra blur 2, invert 10%, edge specularity 100%, tint 0%. That is seven backdrop layers — four of them masked to a concentric ring — and the ring it calls refraction does its work with invert(0.1) contrast(1.5), a tonal inversion in a 3.6px band rather than a displacement. Two further full-pane passes blend the rings into one material. No SVG, no canvas, no script. With tint at 0 there is nothing behind the brightness boosts, so over a pale backdrop the pane goes nearly white and the counts stop being readable — that is its default, not a setting chosen here.",
    refract: null,
    // Its frost is expressed in its own two controls rather than as a blur bolted on
    // top — Extra Blur, which feeds every layer's radius through `--total-strength`,
    // and Tinting, which is the only thing standing between white text and a pale
    // backdrop here. The numbers are this page's; the knobs are the generator's.
    frost: {
      kind: "page",
      what:
        "Extra Blur and Tinting are both controls it ships, but it publishes no frosted " +
        "values — its own Extra Blur at 22px over a 44% dark tint, which is this page's frost.",
    },
  },
];

// ------------------------------------------------------------------- optics

function clamp(value, lo, hi) {
  return value < lo ? lo : value > hi ? hi : value;
}

function smoothStep(a, b, t) {
  const x = clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
}

// The standard rounded-rectangle signed distance field: negative inside,
// positive outside, and its magnitude is the distance to the boundary.
function sdfRoundRect(x, y, halfWidth, halfHeight, radius) {
  const qx = Math.abs(x) - halfWidth + radius;
  const qy = Math.abs(y) - halfHeight + radius;
  const ox = Math.max(qx, 0);
  const oy = Math.max(qy, 0);
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(ox, oy) - radius;
}

// Height of the glass surface across the bevel, as a function of how far into
// the band you are: 0 at the outer edge, 1 at the flat middle.
const PROFILES = {
  circle: (t) => Math.sqrt(Math.max(0, 1 - (1 - t) ** 2)),
  squircle: (t) => Math.pow(Math.max(0, 1 - (1 - t) ** 4), 0.25),
};

// How far a ray entering the surface at `t` comes out sideways, in units of the
// glass's thickness. The slope is capped rather than allowed to run to infinity
// at a vertical tangent — an uncapped circle profile puts an infinity in the
// first sample and takes the whole map's normalisation with it.
function refraction(profile, t, ior) {
  const step = 1 / 256;
  const lo = Math.max(0, t - step);
  const hi = Math.min(1, t + step);
  const slope = (profile(hi) - profile(lo)) / (hi - lo);
  const theta1 = Math.atan(Math.min(Math.abs(slope), 40));
  const theta2 = Math.asin(Math.min(1, Math.sin(theta1) / ior));
  return Math.tan(theta1 - theta2) * Math.sign(slope);
}

// --------------------------------------------------------------- the samplers

// Each returns dx,dy in pixels for a point in the pane. `encode` normalises
// whatever range comes back, so a sampler never has to know the final scale.

function snellSampler({ width, height, radius, band, profile, ior }) {
  const fn = PROFILES[profile];
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const reach = Math.min(band, Math.min(width, height) / 2.5);
  const sdf = (x, y) =>
    sdfRoundRect(x - halfWidth, y - halfHeight, halfWidth, halfHeight, radius);

  // 128 samples of the profile, because the profile is the same for every pixel
  // at the same depth and a bar is a hundred thousand pixels.
  const N = 128;
  const table = new Float32Array(N + 1);
  for (let i = 0; i <= N; i++) table[i] = refraction(fn, i / N, ior);

  return (x, y) => {
    const depth = -sdf(x, y);
    if (depth < 0) return null; // outside the pane
    if (depth > reach) return { dx: 0, dy: 0 }; // past the bevel: flat, no bend
    const magnitude = table[Math.round((depth / reach) * N)];
    if (magnitude === 0) return { dx: 0, dy: 0 };
    // The outward normal, taken numerically so this works for any shape the SDF
    // can describe rather than only for the corners of a rectangle.
    const e = 0.75;
    let nx = sdf(x + e, y) - sdf(x - e, y);
    let ny = sdf(x, y + e) - sdf(x, y - e);
    const length = Math.hypot(nx, ny);
    if (length === 0) return { dx: 0, dy: 0 };
    nx /= length;
    ny /= length;
    return { dx: nx * magnitude * reach, dy: ny * magnitude * reach };
  };
}

// shuding's fragment function, unchanged, including its literal SDF arguments —
// 0.3, 0.2 and 0.6 are his, and on a wide bar they are what make the map behave
// the way his demo behaves.
function shudingSampler({ width, height }) {
  return (x, y) => {
    const ux = x / width;
    const uy = y / height;
    const ix = ux - 0.5;
    const iy = uy - 0.5;
    const distance = sdfRoundRect(ix, iy, 0.3, 0.2, 0.6);
    const displacement = smoothStep(0.8, 0, distance - 0.15);
    const scaled = smoothStep(0, 1, displacement);
    return {
      dx: (ix * scaled + 0.5 - ux) * width,
      dy: (iy * scaled + 0.5 - uy) * height,
    };
  };
}

// ybouane/liquidglass, at its published defaults. Two things here are not what
// `snell` above does. The bevel is a half-circle in *pixels* — h = √(d(2zR−d)),
// reaching zR at depth zR — and the normal comes from finite-differencing that
// height field rather than from differentiating a profile, so the shape of the
// pane enters twice: once through the SDF and once through the gradient. And the
// refraction is not solved, it is linearised to `1 − 1/n`, applied at the entry
// surface, again at the exit surface, and a third time weighted by how much glass
// the ray crossed between them. That is their biconvex `bevelMode` 0.
//
// Their `e = 2.0` is load-bearing rather than incidental: a half-circle's slope
// is infinite at the rim, and a two-pixel difference is the whole of what bounds
// it. Nothing here caps a slope, because nothing needs to.
function ybouaneSampler({ width, height, radius, zRadius, refract, ior }) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const zR = Math.min(zRadius, Math.min(width, height) / 2.5);
  const refrPow = 1 - 1 / ior;
  const sdf = (x, y) =>
    sdfRoundRect(x - halfWidth, y - halfHeight, halfWidth, halfHeight, radius);
  const bevel = (inside) =>
    inside <= 0 ? 0 : inside >= zR ? zR : Math.sqrt(inside * (2 * zR - inside));
  const e = 2;

  return (x, y) => {
    const inside = -sdf(x, y);
    if (inside < 0) return null; // outside the pane

    // Uphill, which inside a pane points toward the middle.
    const gx = (bevel(-sdf(x + e, y)) - bevel(-sdf(x - e, y))) / (2 * e);
    const gy = (bevel(-sdf(x, y + e)) - bevel(-sdf(x, y - e))) / (2 * e);
    // `thickness` is both surfaces, so their thickness/(2·zR) is just the height
    // fraction: 0 at the rim, 1 across the flat middle.
    const thickNorm = bevel(inside) / zR;
    const bend = (refrPow * 2 + refrPow * thickNorm * 0.5) * refract * 30;

    // Their `centerDir`: toward the middle, and scaled by how far out you are, so
    // this term on its own is a magnification rather than a shove. `depth` fades
    // it in across the bevel so it belongs to the flat interior.
    const pull = refract * 4 * smoothStep(0, zR, inside);
    const cx = -(x - halfWidth) / halfWidth;
    const cy = -(y - halfHeight) / halfHeight;

    // Both terms displace inward, and inward is magnification: the pane samples
    // from nearer its own centre than the pixel it is filling. The kube.io three
    // go the other way, along the outward normal, which compresses the backdrop
    // into the bevel band the way a ground edge does. Same optics, opposite sign,
    // and that is most of why they do not look alike.
    return { dx: gx * bend + cx * pull, dy: gy * bend + cy * pull };
  };
}

// iyinchao/liquid-glass-studio. Snell's law, as `snell` above, but the angle of
// incidence is not derived from a surface at all: it is read straight off how far
// through the bevel band you are, θᵢ = asin((1 − d/thickness)²). So the outermost
// pixel is at a grazing 90° — maximal bend — and because the ratio is squared the
// bend collapses quickly, reaching a tenth of its peak about a third of the way
// in. That is a much sharper falloff than any height profile produces.
function studioSampler({ width, height, radius, thickness, ior, strength }) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const reach = Math.min(thickness, Math.min(width, height) / 2.5);
  const sdf = (x, y) =>
    sdfRoundRect(x - halfWidth, y - halfHeight, halfWidth, halfHeight, radius);

  // Depth-only, like the profile table above, and for the same reason.
  const N = 256;
  const table = new Float32Array(N + 1);
  for (let i = 0; i <= N; i++) {
    const ratio = 1 - i / N;
    const thetaI = Math.asin(clamp(ratio * ratio, 0, 1));
    const thetaT = Math.asin(clamp(Math.sin(thetaI) / ior, 0, 1));
    // Their `-tan(θt − θi)`, which is positive, and finite even at the grazing
    // rim — 1.12 at n = 1.5 — so this construction needs no cap either.
    table[i] = Math.tan(thetaI - thetaT);
  }

  return (x, y) => {
    const inside = -sdf(x, y);
    if (inside < 0) return null;
    if (inside >= reach) return { dx: 0, dy: 0 };
    const magnitude = table[Math.round((inside / reach) * N)];
    if (magnitude === 0) return { dx: 0, dy: 0 };
    const e = 0.75;
    let nx = sdf(x + e, y) - sdf(x - e, y);
    let ny = sdf(x, y + e) - sdf(x, y - e);
    const length = Math.hypot(nx, ny);
    if (length === 0) return { dx: 0, dy: 0 };
    // Their offset is `-normal * edgeFactor`: against the outward normal, so this
    // one magnifies like ybouane's rather than compressing like kube.io's.
    const scale = (-magnitude * strength) / length;
    return { dx: nx * scale, dy: ny * scale };
  };
}

function surface(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return { canvas, context: canvas.getContext("2d") };
}

// One RGBA map, normalised so the largest displacement lands on 255, plus the
// pixel value that 255 now means.
function encode(width, height, sampler) {
  const map = surface(width, height);
  const image = map.context.createImageData(width, height);
  const pixels = image.data;
  const count = width * height;
  const xs = new Float32Array(count);
  const ys = new Float32Array(count);

  let maxima = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const at = y * width + x;
      const sample = sampler(x + 0.5, y + 0.5);
      if (!sample) continue;
      xs[at] = sample.dx;
      ys[at] = sample.dy;
      const magnitude = Math.hypot(sample.dx, sample.dy);
      if (magnitude > maxima) maxima = magnitude;
    }
  }

  const norm = maxima > 0 ? 127 / maxima : 0;
  for (let at = 0; at < count; at++) {
    const out = at * 4;
    pixels[out] = 128 + clamp(Math.round(xs[at] * norm), -127, 127);
    pixels[out + 1] = 128 + clamp(Math.round(ys[at] * norm), -127, 127);
    pixels[out + 2] = 128;
    pixels[out + 3] = 255;
  }
  map.context.putImageData(image, 0, 0);

  // 255 is half of `scale` away from neutral, so the scale that reproduces
  // `maxima` pixels of movement is twice it.
  return { url: map.canvas.toDataURL(), scale: maxima * 2 };
}

// The shipping build's map, which is vector work rather than per-pixel work and
// so is drawn as an SVG document exactly as ui/src/lib/glass.js draws it.
function rampMap({ width, height, radius, depth, feather }) {
  const inner = Math.max(0, radius - depth);
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
        `<defs>` +
        `<linearGradient id="y" x1="0" x2="0" y1="0" y2="1">` +
        `<stop offset="0%" stop-color="#0F0"/><stop offset="100%" stop-color="#000"/>` +
        `</linearGradient>` +
        `<linearGradient id="x" x1="0" x2="1" y1="0" y2="0">` +
        `<stop offset="0%" stop-color="#F00"/><stop offset="100%" stop-color="#000"/>` +
        `</linearGradient>` +
        `</defs>` +
        `<rect width="${width}" height="${height}" fill="#808080"/>` +
        `<g filter="blur(1px)">` +
        `<rect width="${width}" height="${height}" fill="#000080"/>` +
        `<rect width="${width}" height="${height}" fill="url(#y)" style="mix-blend-mode:screen"/>` +
        `<rect width="${width}" height="${height}" fill="url(#x)" style="mix-blend-mode:screen"/>` +
        `<rect x="${depth}" y="${depth}" width="${Math.max(0, width - 2 * depth)}" ` +
        `height="${Math.max(0, height - 2 * depth)}" rx="${inner}" ry="${inner}" ` +
        `fill="#808080" filter="blur(${feather}px)"/>` +
        `</g>` +
        `</svg>`,
    )
  );
}

// ---------------------------------------------------------------- filter body

// One <feDisplacementMap>/<feColorMatrix> pair per channel, so three passes at
// staggered scales can be screened back together. That separation is dispersion:
// red bends fractionally further than blue, which is the coloured fringe at a
// real lens's edge.
const KEEP = [
  "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
];

function displacement(map, scale, keep, result) {
  return (
    `<feDisplacementMap in="SourceGraphic" in2="${map}" scale="${scale}" ` +
    `xChannelSelector="R" yChannelSelector="G"/>` +
    `<feColorMatrix type="matrix" values="${keep}" result="${result}"/>`
  );
}

function refractBody(url, scale, dispersion, width, height) {
  const image =
    `<feImage x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none" ` +
    `href="${url}" result="map"/>`;
  if (!dispersion) {
    return (
      image +
      `<feDisplacementMap in="SourceGraphic" in2="map" scale="${scale}" ` +
      `xChannelSelector="R" yChannelSelector="G"/>`
    );
  }
  return (
    image +
    displacement("map", scale + dispersion * 2, KEEP[0], "r") +
    displacement("map", scale + dispersion, KEEP[1], "g") +
    displacement("map", scale, KEEP[2], "b") +
    `<feBlend in="r" in2="g" mode="screen"/>` +
    `<feBlend in2="b" mode="screen"/>`
  );
}

// The macOS demo's filter, primitive for primitive: noise, a blur over it, and
// the displacement. `soften` is its feGaussianBlur, and it is not the same knob
// as `baseFrequency` — smoothing the field turns grain into ripple however fine
// the noise underneath it was.
function turbulenceBody({ baseFrequency, octaves, seed, soften, scale }) {
  return (
    `<feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" ` +
    `numOctaves="${octaves}" seed="${seed}" result="noise"/>` +
    `<feGaussianBlur in="noise" stdDeviation="${soften}" result="soft"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="soft" scale="${scale}" ` +
    `xChannelSelector="R" yChannelSelector="G"/>`
  );
}

// ------------------------------------------------------------------ the pane

let defs = null;
let seq = 0;

// One hidden <svg> for every filter on the page, outside any glass element: an
// element with a backdrop-filter is a backdrop root for its descendants, so a
// filter nested inside one would put its own subtree into the backdrop it is
// filtering.
function container() {
  if (defs) return defs;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  defs = document.createElementNS(SVG_NS, "defs");
  svg.appendChild(defs);
  document.body.appendChild(svg);
  return defs;
}

class Pane {
  constructor(node) {
    this.node = node;
    this.filter = document.createElementNS(SVG_NS, "filter");
    this.filter.setAttribute("color-interpolation-filters", "sRGB");
    this.filter.setAttribute("filterUnits", "userSpaceOnUse");
    container().appendChild(this.filter);
    this.base = `lab-${++seq}`;
    this.version = 0;
    this.settings = null;
    this.width = 0;
    this.height = 0;

    // The observer keeps the map right when the bar wraps or the window
    // changes. It is not what produces the first one: a ResizeObserver delivers
    // on the rendering step, which a document that is not being presented never
    // reaches, so a pane that waited for it would sit unrefracted until
    // something happened to resize it. Every entry point measures instead, and
    // this only catches the resizes nothing else knows about.
    this.observer = new ResizeObserver(() => this.refresh());
    this.observer.observe(node);
  }

  /** True if the pane is a different size than the last map was drawn for. */
  measure() {
    const box = this.node.getBoundingClientRect();
    const width = Math.round(box.width);
    const height = Math.round(box.height);
    if (width === this.width && height === this.height) return false;
    this.width = width;
    this.height = height;
    return true;
  }

  apply(settings) {
    this.settings = settings;
    this.measure();
    this.draw();
  }

  refresh() {
    if (this.measure()) this.draw();
  }

  draw() {
    const { node, filter, settings, width, height } = this;
    node.style.removeProperty("--glass-refract");
    if (!settings || width < 8 || height < 8) return;

    const radius = parseFloat(getComputedStyle(node).borderTopLeftRadius) || 0;
    const shape = {
      width,
      height,
      radius: Math.min(radius, Math.min(width, height) / 2),
    };

    let body;
    if (settings.kind === "turbulence") {
      body = turbulenceBody(settings);
    } else {
      let map;
      if (settings.kind === "ramp") {
        const depth = clamp(settings.depth, 2, Math.floor(Math.min(width, height) / 3));
        map = {
          url: rampMap({ ...shape, depth, feather: settings.feather }),
          scale: settings.strength,
        };
      } else if (settings.kind === "shuding") {
        map = encode(width, height, shudingSampler(shape));
      } else if (settings.kind === "ybouane") {
        map = encode(width, height, ybouaneSampler({ ...shape, ...settings }));
      } else if (settings.kind === "studio") {
        map = encode(width, height, studioSampler({ ...shape, ...settings }));
      } else {
        map = encode(width, height, snellSampler({ ...shape, ...settings }));
      }
      if (!map.scale) return;
      // `gain` scales the whole displacement, dispersion with it, because the one
      // library that publishes a frosted mode halves its displacementScale in it and
      // its aberration is a multiple of that scale rather than a separate distance.
      const gain = settings.gain ?? 1;
      body = refractBody(
        map.url,
        map.scale * gain,
        (settings.dispersion ?? 0) * gain,
        width,
        height,
      );
    }

    filter.setAttribute("x", "0");
    filter.setAttribute("y", "0");
    filter.setAttribute("width", String(width));
    filter.setAttribute("height", String(height));
    filter.innerHTML = body;
    // A new id per redraw: rewriting a filter a composited backdrop already
    // points at does not invalidate it, but changing the declared value does.
    filter.id = `${this.base}-${++this.version}`;

    node.style.setProperty("--glass-refract", `url(#${filter.id})`);
    // Ask, then check it was taken. An engine with no url() support in a
    // backdrop filter drops the whole declaration, which would cost the blur
    // too — so the property comes straight back off if it did not survive.
    //
    // Reported rather than returned: the first draw of a pane happens when the
    // ResizeObserver first measures it, which is after the variant was applied,
    // so a caller that read a return value would always read the early one.
    if (!getComputedStyle(node).backdropFilter.includes("url(")) {
      node.style.removeProperty("--glass-refract");
      refractDropped();
    }
  }
}

// ------------------------------------------------------------------- the grid

// A small LCG rather than Math.random, so the synthetic backdrop is the same
// every reload and two variants are compared over the same pixels.
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function syntheticTiles(host, howMany = 160) {
  const random = rng(20260807);
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < howMany; i++) {
    const tile = document.createElement("div");
    tile.className = "tile fake";
    tile.style.setProperty("--ar", (0.62 + random() * 1.28).toFixed(3));
    tile.style.setProperty("--h", String(Math.round(random() * 360)));
    // The lightness sweeps the whole range on purpose: a header only fails over
    // the brightest and the darkest thing that can scroll under it.
    tile.style.setProperty("--l", `${(12 + random() * 76).toFixed(1)}%`);
    tile.style.setProperty("--angle", `${Math.round(random() * 360)}deg`);
    fragment.appendChild(tile);
  }
  host.replaceChildren(fragment);
}

async function photoTiles(host) {
  const response = await fetch("/api/photos?limit=400");
  if (!response.ok) throw new Error(`/api/photos ${response.status}`);
  const body = await response.json();
  const photos = body.photos ?? [];
  if (!photos.length) throw new Error("no photos");
  const fragment = document.createDocumentFragment();
  for (const photo of photos) {
    const tile = document.createElement("div");
    tile.className = "tile";
    const ratio = photo.w && photo.h ? photo.w / photo.h : 1.5;
    tile.style.setProperty("--ar", clamp(ratio, 0.45, 2.6).toFixed(3));
    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = "";
    img.src = `/t/${photo.s}.webp`;
    // 22,531 stills have no derivative. A missing one leaves the dark tile,
    // which is a fine thing to have glass over.
    img.addEventListener("error", () => img.remove(), { once: true });
    tile.appendChild(img);
    fragment.appendChild(tile);
  }
  host.replaceChildren(fragment);
  return photos.length;
}

// -------------------------------------------------------------------- wiring

const grid = document.getElementById("grid");
const warn = document.getElementById("warn");
const panes = [new Pane(document.getElementById("bar")), new Pane(document.getElementById("sheet"))];
const sheet = document.getElementById("sheet");

const ui = {
  idx: document.getElementById("idx"),
  name: document.getElementById("name"),
  tag: document.getElementById("tag"),
  note: document.getElementById("note"),
  support: document.getElementById("support"),
  source: document.getElementById("source"),
  frost: document.getElementById("frost-state"),
  frostButton: document.getElementById("frost"),
};

const query = new URLSearchParams(location.search);
let at = 0;
let synthetic = query.has("synthetic");
let frosted = query.has("frosted");
let refractionWorks = true;

function say(message) {
  warn.hidden = !message;
  warn.textContent = message ?? "";
}

function show(index) {
  at = (index + VARIANTS.length) % VARIANTS.length;
  const variant = VARIANTS[at];
  document.body.dataset.v = variant.slug;
  // Set whatever the toggle says, on every variant. A variant that is already
  // frosted simply has no block under the attribute, so it renders identically and
  // the state stays consistent when you flip past it to one that does.
  document.body.dataset.frost = frosted ? "on" : "off";

  ui.idx.textContent = `${at + 1} / ${VARIANTS.length}`;
  ui.name.textContent = variant.name;
  ui.tag.textContent = variant.tag;
  ui.note.textContent = variant.note;
  ui.support.textContent =
    variant.support === "all" ? "every engine" : "Chromium only";
  ui.support.className = `support ${variant.support}`;
  ui.source.textContent = variant.source;
  ui.source.href = variant.url;

  const frost = variant.frost;
  ui.frost.textContent = `${frosted ? "frosted" : "clear"} · ${frost.what}`;
  ui.frost.className = `frost ${frost.kind}${frosted ? " on" : ""}`;
  ui.frostButton.setAttribute("aria-pressed", String(frosted));
  ui.frostButton.classList.toggle("on", frosted);
  // Dimmed rather than disabled: the toggle is global, and pressing it on a variant
  // that is already frosted is not an error, it just has no work to do.
  ui.frostButton.classList.toggle("inert", frost.kind === "own");

  // The lean and the rings' angle belong to one variant, so they are cleared
  // here rather than left to a stylesheet that cannot reach a transform.
  for (const pane of panes) {
    pane.node.style.removeProperty("transform");
    pane.node.style.removeProperty("--ang");
  }

  if (refractionWorks) say(null);
  // Only one frost reaches the map at all, so most variants hand over the same
  // settings frosted or not and redraw nothing they did not have to.
  const settings =
    frosted && frost.refract && variant.refract
      ? { ...variant.refract, ...frost.refract }
      : variant.refract;
  for (const pane of panes) pane.apply(settings);
}

// Called by any pane whose `url()` did not survive into the computed value.
// Latched: an engine either does this or it does not, and saying so twice per
// variant change would be noise.
function refractDropped() {
  if (!refractionWorks) return;
  refractionWorks = false;
  say(
    "This engine drops url() in a backdrop-filter, so the refracting variants " +
      "show their blur and tint only. Chromium renders them in full.",
  );
}

// liquid-glass-react's default pointer behaviour, which is two things and not
// three: `elasticity` 0.15 leans the pane toward the pointer by
// `(pointer − centre) × elasticity × 0.1`, faded out linearly over the 200px
// beyond its edge, and the same offset — as a percentage of the pane — turns the
// two border rings' gradient by 1.2° per percent. The radial sheen the library
// can also draw is not here: it only paints that on a pane with an `onClick`.
window.addEventListener("pointermove", (event) => {
  if (!VARIANTS[at].elastic) return;
  for (const pane of panes) {
    const box = pane.node.getBoundingClientRect();
    if (!box.width) continue;
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    pane.node.style.setProperty("--ang", `${(135 + (dx / box.width) * 100 * 1.2).toFixed(1)}deg`);

    const edgeX = Math.max(0, Math.abs(dx) - box.width / 2);
    const edgeY = Math.max(0, Math.abs(dy) - box.height / 2);
    const fade = Math.max(0, 1 - Math.hypot(edgeX, edgeY) / 200);
    const lean = 0.15 * 0.1 * fade;
    pane.node.style.setProperty(
      "transform",
      `translate(${(dx * lean).toFixed(2)}px, ${(dy * lean).toFixed(2)}px)`,
    );
  }
});

document.getElementById("prev").addEventListener("click", () => show(at - 1));
document.getElementById("next").addEventListener("click", () => show(at + 1));
ui.frostButton.addEventListener("click", () => {
  frosted = !frosted;
  show(at);
});

window.addEventListener("resize", () => {
  for (const pane of panes) pane.refresh();
});

window.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.key === "ArrowRight") show(at + 1);
  else if (event.key === "ArrowLeft") show(at - 1);
  else if (event.key === "p" || event.key === "P") {
    sheet.hidden = !sheet.hidden;
    // A hidden pane measures zero, so the panel has no map until it is on
    // screen. Opening it is therefore a redraw, not just a visibility change.
    if (!sheet.hidden) show(at);
  } else if (event.key === "s" || event.key === "S") {
    synthetic = !synthetic;
    load();
  } else if (event.key === "f" || event.key === "F") {
    frosted = !frosted;
    show(at);
  } else if (event.key >= "1" && event.key <= "9") show(Number(event.key) - 1);
  else return;
  event.preventDefault();
});

async function load() {
  if (synthetic) {
    syntheticTiles(grid);
    return;
  }
  try {
    await photoTiles(grid);
  } catch (error) {
    syntheticTiles(grid);
    say(
      `Could not load the grid (${error.message}) — showing the synthetic ` +
        "backdrop instead. Press S to switch back once the server is up.",
    );
  }
}

show(0);
load();
