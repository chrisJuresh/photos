# Spec — Stacking similar photos in the grid

Status: **shipped 2026-08-08, archived.** The permanent record is
[ADR 0001](../docs/adr/0001-stack-on-capture-time-not-phash.md), the glossary in
[CONTEXT.md](../CONTEXT.md), and [docs/grid-queries.md](../docs/grid-queries.md)
for what each query costs. The measurements below are the prototype's and the
shipped code does not reproduce them; re-derive against `docs/grid-queries.md`.

**A stack is a run of consecutive captures from one camera within N seconds.** The
grid draws each stack as one tile — its cover — and clicking it fans the members out
over a blurred backdrop. A toggle turns stacking on; a slider sets N.

Read [ADR 0001](../docs/adr/0001-stack-on-capture-time-not-phash.md) first. It records why
this is capture time and not the perceptual hash that exists for apparently this exact
purpose, with the measurements. Without it the obvious reaction to this spec is
"why isn't this using `near_dup`?", and the answer is that pHash finds 14.9% of the
frames this groups.

## Vocabulary

Terms are defined in [CONTEXT.md](../CONTEXT.md); the four that matter here:
**tile** (one grid entry, a `photo` row, already a RAW+JPEG group), **stack** (a run
of tiles shot in one moment), **cover** (the member drawn when a stack is closed),
**near-duplicate** (the pHash relation — a different thing, and not this).

## Settled decisions

Every line below was decided in the grilling session and is not open for
re-litigation during implementation. If one turns out to be wrong, stop and say so.

**Grouping.** Consecutive tiles by capture time, same `camera`, gap ≤ window.
EXIF-dated tiles only (`file.taken_src LIKE 'exif:%'`) — the 449 tiles dated from
`mtime` or filename are never stacked and this is not surfaced in the UI.

**Window.** Slider, 1–10 seconds, integer steps, default **4s**. 4s is where the
number of distinct sets peaks (4,632); past it the count falls, which is
over-merging rather than more grouping.

**Filters apply before stacking.** A stack forms over whatever the current selection
holds, so filtering out a member can split a stack in two, and that is correct. The
cover is therefore resolved per query and never materialised.

**Cover** = the sharpest frame of the middle-exposure third. Rank members by mean
luminance (derived from `luminance_histogram` in `file.quality`), take the middle
third rounded up to at least one, then take `max(sharpness)` among those. A
constant-exposure burst degrades to plain sharpest, which is correct. Computed in
Python for the members of stacks on the current page — never over the whole library.

**Paging.** On the two default sorts (`newest`/`oldest`) a stack is a *contiguous run*
in `photo_sort` order, so the page streams: read tiles in order, break a run when the
gap exceeds the window, emit covers. Keyset paging is unchanged and a page stays
~15 ms. Read to the end of a run that straddles a page boundary rather than splitting
one stack across two pages.

**Alternate sorts.** The eight non-time sorts cannot stream, because members are not
adjacent. Compute the whole stack assignment in one pass (~371 ms measured) and
memoise it per selection, exactly as `GridServer.total` memoises counts — same
`MAX_TOTALS`-style cap, same eviction.

**Count pane** reads `<stacks> stacks · <photos> photos` when stacking is on, and is
unchanged when it is off. Two numbers because one number that silently changes
meaning under a toggle is the one failure that pane cannot afford.

**Controls.** A `Stacks ▾` pill in the glass bar, opening a panel in the same
material as the Sort and Filters panels, holding the toggle and the slider. Not
inline in the bar: the bar stops shrinking at `--bar-min` 420px and a slider does not
fit. The pill shows the stack count when stacking is on.

**Persistence.** Toggle and window in `localStorage` under `photos.stack`. Sort and
filters stay unsaved. The existing `photos.theme` persistence is untouched.

**Click.** Unstacked tile → `/api/reveal`, exactly as today. Stack → the overlay.
A frame inside the overlay → `/api/reveal` for that frame. So a stacked photo takes
two clicks to reach Explorer and everything else is unchanged.

**Overlay.** The sheet blurs behind a glass surface built from the existing
`ui/src/lib/glass.js` material — not a second material. Members lay out as a grid
that emanates from the clicked tile's rect. `Escape` and a click outside close it.
`prefers-reduced-motion` gets a cross-fade instead of the emanate. Frames are drawn
from the 1536px substrate, not the 384px thumbnail — the cover rule is about
sharpness and a thumbnail cannot show it.

**The `dup` filter is relabelled** from "Near-duplicates" to **"Identical frames"**,
with its hint reworded, because at the shipped threshold that is what it finds and
"similar" now belongs to stacking.

## Out of scope

- Triage. Stacking is grid-only; `/api/triage/*` is untouched.
- Any change to `photo`, `photo_member`, `near_dup`, `near_band` or `pair_key`.
- Any schema migration. This feature adds none.
- Any change to `archive/pipeline/group.py`, including the `NEAR_MAX_DISTANCE`
  finding recorded in the ADR. That is a separate job.
- Perceptual grouping of any kind, at any threshold.
- Writing stacks to disk, or letting a stack be edited, named or pinned.
- Same-scene grouping (different focal length, different moment). No signal for it.

## Phases

Build in order. Each phase ends at a gate that is a fact you can check.

### Phase 1 — 1536px substrates on the NVMe, and a route

The substrates exist but are unreachable: the relpath lives in MediaVault's own
manifest (`SELECT ... FROM derivatives WHERE long_edge = 1536 AND is_current = 1`),
the same source [archive/pipeline/thumbnails.py](pipeline/thumbnails.py)
uses for the 384px tier. They are also split across two trees with different layouts
— 1,486 repaired ARW under `G:\vault\deriv` in `<aa>\<bb>\<sha><ext>`, the rest under
`G:\MediaVault\derivatives` in v1's sharded `d1_` layout.

Copy them onto the NVMe under one content-addressed tree, checksum-verified and
resumable — `thumbnails.py` at a different tier, and it is the template. Add
`substrate_root` to `photolib/config.py` and `config.toml`. Then add `/d/<sha>.webp`
to `photolib/grid.py` as a near-clone of `_thumbnail`: same sha256 validation, same
immutable `Cache-Control`, same refusal to serve outside the root.

Measured: ~2.6 GB, 40 ms/read from MediaVault and 18 ms from `G:\vault\deriv` against
9 ms once on E:. Run it in the background; nothing else may touch `G:` while it does.

> **Gate.** Every tile with a 1536px substrate in the manifest has one on E:,
> byte-for-byte against its recorded checksum, and the count is printed. `/d/<sha>.webp`
> returns 200 for a known sha and 404 for a well-formed unknown one.

### Phase 2 — Stacking in the query layer

`photolib/browse.py` gains the grouping and `photolib/grid.py` the memoised
assignment. No UI yet — this phase is provable from `curl` alone.

The grouping, as measured (371 ms unfiltered, 247–312 ms under a filter):

```sql
lag(sort_key) OVER (ORDER BY camera, sort_key)   -- previous capture
CASE WHEN camera IS lag_cam
      AND (julianday(sort_key) - julianday(lag_key)) * 86400.0 <= :window
     THEN 0 ELSE 1 END                            -- 1 starts a new stack
sum(...) OVER (ORDER BY camera, sort_key ROWS UNBOUNDED PRECEDING)
```

> **Gate.** `/api/photos?stack=4` returns 10,929 ± a few tiles against 24,534
> unstacked, every photo carries its stack size, a page on the default sort is under
> 30 ms, and `python -m pytest tests -q` passes. A test asserts the default sort
> still uses `photo_sort` with stacking on, matching the existing index assertions.

### Phase 3 — The header

The `Stacks ▾` pill and its panel in `ui/src/lib/Header.svelte`, the two-number count
pane, `photos.stack` persistence beside `ui/src/lib/theme.js`, and the `dup` filter
relabel in `photolib/browse.py`. No literal `style="…"` anywhere — the CSP carries no
`unsafe-inline` and Svelte compiles a static style attribute to `setAttribute`.

> **Gate.** `cd ui && npm run check && npm run build` clean, the bundle committed,
> the count pane reads both numbers, and the setting survives a reload.

### Phase 4 — The overlay

New component; `ui/src/lib/sheet.js` gains only what it must to report a clicked
tile's rect. The sheet's rows are immutable once packed and that property stays —
the overlay floats above the sheet and does not re-pack it.

> **Gate.** Clicking a stack opens the overlay over a blurred grid, frames render
> from `/d/`, a frame click reveals in Explorer, `Escape` closes it, and the
> reduced-motion path cross-fades. `npm run check && npm run build` clean.

### Phase 5 — Documentation

A CLAUDE.md paragraph for the feature in the voice of the ones around it, and this
spec archived.

## Measurements

Taken 2026-08-08 against the real 24,534-tile catalog, read-only. Re-derive with the
scripts described in ADR 0001 rather than trusting these if the corpus changes.

| window | sets | tiles in | grid after | largest | multiple-of-3 |
|---|---|---|---|---|---|
| 1s | 4,188 | 13,228 | 15,435 | 18 | 71.8% |
| 2s | 4,422 | 15,560 | 13,371 | 36 | 63.0% |
| 3s | 4,553 | 17,096 | 11,969 | 50 | 56.6% |
| **4s** | **4,632** | **18,222** | **10,929** | **51** | **52.7%** |
| 6s | 4,624 | 19,549 | 9,550 | 63 | 50.0% |
| 10s | 4,280 | 20,618 | 8,145 | 89 | 47.5% |

Set sizes at 3s: 1,661 twos, 1,680 threes, 206 fours, 94 fives, 558 sixes, 153 nines,
56 twelves — the 3/6/9/12 spine is three-frame bracketing fired repeatedly.

Costs: grouping pass 371 ms unfiltered, 247 ms filtered to landscape, 312 ms filtered
to one camera. Substrate reads 40 ms (MediaVault), 18 ms (`G:\vault\deriv`), 9 ms
(E: thumbnails). Existing baselines: 9–15 ms a filtered page, 230–290 ms an alternate
sort, 230–400 ms a `total`.
