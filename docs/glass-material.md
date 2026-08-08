# The header's glass material

Read this before changing the grid's chrome, `ui/src/lib/glass.js`, `app.css`'s glass
tokens, `/tune` or `/glass`. Nothing else needs it.

## The two panes

**The grid is the mode the site opens in, and it has no sidebar.** Its chrome is two
glass panes floating over the photographs: the bar holding the sort, the filters, the
dark/light toggle and the way into triage, **centred** in the window at a side margin
of 650px, and the count hung off its left edge in the margin that opens. Two rather
than one because the count is the only thing there that is an answer rather than a
control, and because a pane tuned transparent enough to see the photograph through is
one whose text needs its own ground. The count is out of the flow rather than in the
row with the bar because the bar is what is being centred: in the row it would push
the bar right by its own width, and a pane that is not the thing being centred should
not decide where the centre is.

The bar names no height and grows when the filter chips wrap; the count names its own
through `--glass-tally-h` and centres against the bar with an auto block margin.
`--header-h` is the bar's height alone, because the bar is the only one of the two the
photographs start below — however tall `/tune` makes the count, it is floating over a
photograph. The bar stops shrinking at `--bar-min` (420px) and the side margin gives
way instead, so the shipped 650 is a margin on a wide monitor and a centred 420px bar
on a window narrower than 1720px rather than no bar at all.

The panels drop out of the bar's own box, so they open under the controls that
summoned them rather than under the count. Triage is a pill in the bar like any other
and is not accented: what it does is said by the word on it. Triage keeps its own
sidebar and the way back, and its queries do not run until triage is on screen —
`/api/triage/files` alone is ~2.9 s that nobody looking at the grid asked for.

## The material

The header's material is **iyinchao/liquid-glass-studio**, reduced to what a backdrop
filter can carry, and `ui/src/lib/glass.js` is the whole of it: `STUDIO` is that
editor's own defaults key for key, `SHIPPED` is what a `/tune` session over the real
grid made of them — a harder bend, no Fresnel wash, a narrow clipped glare, a heavier
shadow, a circular corner, a blur of 2 and both tints all but clear — plus the
saturation, the count pane's height, the row's own two margins, the gap under it and
the four colours upstream has no control for, and `apply()` writes both onto `:root`
as custom properties that `app.css` reads.

`--glass-saturate` is not upstream's in any form — its shader has no saturation term —
and it was a literal 200% in `app.css` beside a second literal 170% on the panels
until the two became one number: it multiplies the chroma of the photograph behind the
pane, and past a point that is what a reader sees instead of the glass, so it is a
slider like the blur rather than a constant. A panel takes the bar's own value, because
saturation is not one of the two depths (`deepen()`'s tint, `+12px` of blur) that
separate a panel from the bar.

The last four pairs are not upstream's at all — its editor tints a blob with nothing
written on it. They exist because the tint alone cannot answer for legibility at a low
alpha: `--glass-ctl` is the fill behind a pill in the bar and `--glass-text` the ink on
it, every muted label being a fraction of it, so the words keep a ground the pane
itself has given up. Hover and open are washes of `--glass-ink` laid **over** the tuned
fill rather than fills of their own, so a control made solid stays solid.
`--glass-tint-tally` and `--glass-text-tally` are the count pane's own ground and ink,
no longer equal to the bar's — the count kept the tint the bar gave up, 0.32 dark and
0.82 light against a pane that is clear and one that is 0.13 — and are rebound on
`.tally` itself rather than read there, so everything inside it picks them up from the
rules that already read `--glass-tint` and `--glass-text`. They exist because the count
is the one pane up there that carries an answer rather than controls, and the tint that
reads under five pills is not necessarily the one a five-digit number wants behind it.

`--glass-tally-h` is that same argument about geometry: it is the only size of a pane
in this material, because the bar is sized by its contents and the count is not. It
ships at 42px against the bar's 56, so the count is the shorter of the two and is
centred against the bar rather than setting any height; it is an exact height with no
block padding under it — 12px above and below the number would have floored the pane
at 45px — and it bottoms out at the 30px of the pills beside it.

## Placement

`--header-top`, `--header-side` and `--page-top` are where that row sits rather than
what it is made of, and they are tuned for the same reason its height is: a floating
pane's margin is part of whether it reads as floating, and that is a judgement about a
photograph. The first two are the bar's own margins and nothing else's, two numbers
rather than one for all three edges because only the top has a photograph scrolling
under it, and `--header-side` is one number for both sides because the bar is centred
and the count lives in the left one.

The sheet keeps `app.css`'s own `--page-inset` from the left, right and bottom of the
window whatever `--header-side` is: pulling the floating bar in from the edge is a
judgement about the bar, and dragging every photograph in the grid sideways with it is
not what that judgement was about, so that one number is fixed and is not tuned.
`--page-top` is the gap between the bar's bottom edge and the first row of tiles — the
sheet's top padding is `--header-top` plus `--header-h` plus this. It ships at **14**,
the same as `--page-inset`, so the space the grid keeps under the header is the space
it keeps from every other edge of the window.

Two of the three move the photographs and both move them down: `--header-top`, because
the tiles follow the bar rather than sliding under it, and `--page-top`, because that
is what it is for. `--header-side` moves the bar alone. These three are the only
settings that relayout the sheet rather than recolouring it.

## Optics

Refraction and dispersion are an SVG `feDisplacementMap` run three times, one per
channel, off a per-pixel map whose optics are upstream's — θᵢ read straight off the
depth into the bevel, so the outermost pixel bends at a grazing 90° and the bend dies
as the square of the depth. Fresnel and glare are two masked rings, `::before` flat and
`::after` a conic gradient of two opposite lobes with a dark notch at each of the two
corners between them, because a ring with a blur is the same falloff at a hundredth of
the cost of a second canvas and it updates while a slider is moving.

The glare's brightness is upstream's own term ported whole — a raised sine of **twice**
the surface normal's angle, raised to `glareConvergence`, so at the studio's 50 the
exponent is 1.1 and the rim is lit almost the whole way round while the shipped 100
makes it 2.1 and leaves two highlights with dark between them, and `glareFactor` 120
through the shader's 1.2 clips the near peak to pure white. It varies with the
**normal**, not with the direction from the pane's centre, and those are the same thing
only on a square: on a 1200×56 bar the top edge is 175° of the sweep round the centre
and each end cap is 5° of it, so a conic gradient read off that angle put a lobe
halfway along a long edge and left every corner unlit — the header visibly wrong while
the count pane beside it looked nearly right. So `--glass-glare` is laid out per pane
off its own outline, walking the same superellipse `sdf()` measures, and is written by
`refract()` on the node rather than by `apply()` on `:root`.

Only the five optical settings rebuild the map; everything else is a custom property.
`shapeRoundness` is honoured as `corner-shape: superellipse()` and the map's own SDF
carries the same exponent, so the painted boundary and the refracted one agree — but
that property's argument is **log₂ of the exponent** (`round` is `superellipse(1)`,
`squircle` is `superellipse(2)`), so `apply()` writes the logarithm and only the SDF
sees the exponent. Handed over raw, the 5 that shipped at the time painted an exponent
of 32 — a corner with no curve left in it, and a radius with nothing to round — while
the map went on refracting the exponent-5 arc it was asked for.

## The shadow, and the one thing that is not always on

**The shadow is the one part of it that is not always on.** At the top of the page
there is nothing behind the bar and the count but the page, and a shadow cast on that
is a lid on a document rather than a pane floating over a picture — on white it reads
as exactly that. So the two of them carry none of it until the first row of tiles
reaches the bar's bottom edge, which is `--page-top` of scrolling and nothing else, and
the whole of it a bar's height further on, the point at which the photograph has passed
under the whole pane rather than just its lower edge.

That is a scroll-driven animation on `--glass-lift` — `animation-timeline: scroll(root
block)` with `animation-range` naming those same two numbers — rather than a scroll
listener: the interpolation is the compositor's, nothing runs on the main thread while
the reader scrolls, and it is linear because what it tracks is how much photograph is
under the pane rather than a clock, so it has no duration to shorten under
`prefers-reduced-motion`. `--glass-lift` is `@property`-registered in `app.css` (an
unregistered custom property has no type to interpolate through and would step), it
does not inherit, and it starts at 1 — so the panels, which hang below the bar with
photographs behind them at any scroll position, keep their shadow whole by saying
nothing. That is also why `apply()` writes `--glass-shadow-geometry` and
`--glass-shadow-alpha` rather than one finished `rgba()`: the lift multiplies the
alpha, and a shadow that arrives assembled has nothing to multiply. An engine without
scroll-driven animations never starts the timeline, so `@supports not` gives it the
shadow unconditionally, which is what shipped before.

Otherwise **the material has one state** — the old scroll-lift, which moved the tint
and the blur as well, is still gone, because a two-state pane was a property of the
hand-made material and not of this one.

## `/tune`

`/tune` is that material's control panel, and it serves `index.html`: the app reads the
path once and mounts a panel of sliders over the real grid, because a rim that reads
beautifully over a studio backdrop can be invisible over a white sky and unbearable
over a black interior, and scrolling is the only way to find that out.

Every control upstream's editor carries is there at its own range and step; the nine it
has that a header has nowhere to put are named on the page with the reason rather than
shipped as sliders that move nothing. One range is not a constant: `--header-side` ends
at half the window's width, which is where the bar would have no width left, so that
slider re-scales when the window does. A max in the table may be a function of the
viewport for exactly that case, because a literal there is short on a wide monitor and
meaningless on a laptop. The `--bar-min` clamp means the last of that range moves
nothing, which the page says.

The five colours — tint, control fill, control ink, then the count pane's own tint and
ink — are the same four channels five times over, per theme, with one button flipping
which side you are editing. Each control carries its own reset, and it goes back to
**`STUDIO`**, not to `SHIPPED`: the button is the exact inverse of the amber name
beside it, which already says that this number is no longer upstream's. The nine
settings upstream has no control for — the saturation, the count pane's height, the
three placement numbers and the four colours — are the exception and revert to
`SHIPPED`, which the page says, and "Studio defaults" puts them back to `SHIPPED` for
the same reason. One `baseOf()` decides which of the two a control answers to, by
asking whether `STUDIO` holds the key at all, so a setting that upstream has no
equivalent for needs no second list. The reset is held in its own column and only made
invisible, so a value returning to its default does not shift the row. The two buttons
at the bottom are how the whole material moves at once.

Two reductions are stated on the page and are not bugs: `refThickness` saturates at a
bar-height's worth of band, about 22px on a 56px bar, and `blurEdge` cannot gate the
blur per pixel the way a shader does, so it switches which of the sharp and the blurred
backdrop the rim lenses — the same question, answered with the filter's own order.

The panel remembers under `localStorage` `photos.glass`, which **only `/tune` reads**:
a tuning session cannot leak into the grid. Its Copy button emits the settings object;
pasting that back is how a tuned material becomes `SHIPPED`.

## Theme

The page is black or white and nothing in between: `data-theme="light"` on `<html>`
swaps the surfaces, the ink, the glass and the three hues that fall under 3:1 on white,
and every other token — the metrics, the type scale, the radii — is shared. Dark is the
default and the choice is remembered in `localStorage` under `photos.theme`;
`ui/src/lib/theme.js` owns it and `main.js` applies it before the mount, because a
component doing it would paint the default palette first and then correct it. There is
no `prefers-color-scheme` fallback: the ground behind a photograph is a decision about
the photograph. The toggle is in the grid header only, so triage inherits whatever the
grid was left set to.

## `/glass` — the comparison the choice was made from

`/glass` on the same server is the material comparison the choice was made from — entry
9, `liquid-glass-studio`, is what the header now is, and `/tune` above is where its
settings are edited. It is kept as the comparison it was: ten published liquid-glass
implementations over the real grid, flipped through with the arrow keys. It is
hand-written in `photolib/static/glass.{html,css,js}`, it is **not** part of the bundle
and `npm run build` does not touch it, and nothing in `ui/` links to it.

**Every variant is at the settings its own source ships**, and that is the page's one
rule; the frost toggle below is the only place it cannot be kept, and it says so on
screen. Where a library documents defaults they are those defaults
(`liquid-glass-react`'s displacementScale 70 / blurAmount 0.0625 / aberrationIntensity
2 / elasticity 0.15, `ybouane/liquidglass`'s DEFAULTS table, `liquid-glass-studio`'s
editor values); where a demo publishes a filter its attributes are copied (the macOS
demo's baseFrequency 0.01, one octave, seed 5, scale 150); where a bevel width is only
in a baked map it was measured off that map (kube.io's 11px, from the displacement map
for its own 320×42 searchbox). Nothing is turned up to be easier to see, and **no
source appears twice** — one kube.io entry at the convex circle its playground opens
on, not three at profiles it merely explores. Two consequences are deliberate and are
not bugs: at their own defaults kube.io's pane has no rim and no tint at all, and
TonniTools' goes nearly white over a pale backdrop.

`F` — or the **Frosted** button — is the answer to those two: it turns on each
variant's frosted counterpart, which is where a material either keeps its character
with ground under the text or stops being worth choosing. Frost is blur and tint and
nothing else, so it is a stylesheet layer under `body[data-frost]` and every rim,
shadow, geometry and map stays the variant's own; the one exception is
`liquid-glass-react`, whose frosted mode halves its own `displacementScale`, which the
script does through a `gain` factor. Four variants are **already frosted at their own
defaults** and the toggle leaves them untouched — this build, Apple's `.regular` (its
other material, `.clear`, goes the opposite way), the macOS demo under its white 0.25,
and the pure-CSS shine. Two **publish** a frosted configuration and get exactly it:
`liquid-glass-react`'s `overLight` prop — blur 14px, a 20% black layer plus a black
`overlay` pass, its heavier shadow, displacement halved — and `ybouane/liquidglass`'s
"Frosted Panel" example, `blurAmount` 0.25, which its own six 9-tap passes compose to
≈2.6px and which leaves its tint at 0, so that pane is frosted and still has nothing
under its text. The remaining four — shuding, kube.io (its Blur Level tops out at a 1px
stdDeviation), `liquid-glass-studio` and TonniTools — ship frost controls but publish no
frosted values, so all four get **one** frost, this build's own blur 22px over a 44%
dark tint, expressed in the generator's own Extra Blur and Tinting controls where it has
them. One recipe rather than four inventions, because four would make the page a
comparison of frosts instead of materials. The switcher line names which of the two is
in force and is coloured by it: green for the source's own values, amber for this
page's. `?frosted` opens with it on.

Each variant is a block of CSS plus a displacement-map builder keyed on one `data-v`
attribute; the six map kinds are a linear ramp (what `ui/src/lib/glass.js` ships), a
rounded-rect SDF, a height profile refracted through Snell's law, fractal noise, a
half-circle bevel in pixels whose normal is finite-differenced off the height field with
refraction linearised to 1−1/n, and Snell's law taken on the edge ratio itself so the
outermost pixel enters at a grazing 90°. One variant builds no map at all: the
TonniTools generator is pure CSS — seven stacked backdrop layers, four masked to
concentric rings, whose "refraction" band is an `invert(10%) contrast(1.5)` rather than
any displacement, and the only refracting variant here that runs on every engine. The
two WebGL/WebGPU libraries are reduced to what a displacement map can carry, and each
note says which part of its original did not survive. One entry is not a copy of
anything and says so: Apple's own shipped material, because no published CSS for it
exists. `?synthetic` — or `S` — swaps the photographs for procedural tiles whose
lightness sweeps the whole range, which is the harder test of whether white text
survives, and it needs no catalog. Deciding nothing, it writes nothing.
