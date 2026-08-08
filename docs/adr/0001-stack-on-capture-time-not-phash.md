# Stack the grid on capture time, not on the perceptual hash

The catalog carries a purpose-built near-duplicate subsystem — pHash, dHash, a
banded `near_band` index and a populated `near_dup` table — so grouping the grid
by perceptual similarity looks like the obvious implementation. It is the wrong
one for this library, and the measurements below are why. **Stacks are runs of
consecutive captures from one camera within a reader-set window of seconds.**
pHash keeps its existing job: the near-duplicate filter, which collapses nothing.

## Why

This library is mostly bracketed exposures — three frames a second apart at
wildly different exposure, often fired three or four times at one subject. Two
measurements decided it, both against the real 24,534-tile corpus.

**pHash barely sees a bracket.** Measuring pHash distance *within* 1,966 known
bracketed sets (found by capture time, exposure spread ≥ 0.07 mean luma):

| threshold | bracket pairs grouped | grid after | largest stack |
|---|---|---|---|
| 0 | 2.8% | 23,289 | 38 |
| 2 (what ships) | 14.9% | 20,185 | 41 |
| 4 | 30.8% | 17,013 | 47 |
| 6 | 43.5% | 15,046 | 69 |
| 8 | 53.2% | 13,585 | **350** |
| 10 | 60.4% | 12,305 | **1,116** |
| 12 | 65.6% | 10,263 | **4,488** |

Median distance between two frames of one bracket is 8. There is no threshold at
which pHash both finds the brackets and stays sane: by the time half of them
group, transitive closure has produced a 350-tile component. Clipped highlights
and crushed shadows change structure, not just brightness.

**Capture time sees them structurally.** 24,085 of 24,534 tiles (98.2%) carry an
EXIF capture time. Grouping consecutive same-camera frames by gap:

| window | sets | tiles in | grid after | largest | multiple-of-3 sets |
|---|---|---|---|---|---|
| 1s | 4,188 | 13,228 | 15,435 | 18 | 71.8% |
| 2s | 4,422 | 15,560 | 13,371 | 36 | 63.0% |
| 3s | 4,553 | 17,096 | 11,969 | 50 | 56.6% |
| **4s** | **4,632** | **18,222** | **10,929** | **51** | **52.7%** |
| 6s | 4,624 | 19,549 | 9,550 | 63 | 50.0% |
| 10s | 4,280 | 20,618 | 8,145 | 89 | 47.5% |

Set sizes at 3s: 1,661 twos, **1,680 threes**, 206 fours, 94 fives, **558 sixes,
153 nines, 56 twelves**. That 3-6-9-12 spine is three-frame AEB fired repeatedly,
visible in the raw counts. The default window is **4s**, where the number of
distinct sets peaks — past it the count falls, which is over-merging.

That window table is the **prototype's**, and the shipped implementation does not
reproduce it: it merges 14–23 runs fewer at every window, so the grid it leaves is
larger — 10,948 rows at 4s against the 10,929 above. The offset is systematic
rather than noise and shrinks as the window widens; its cause is not known and the
prototype's script was not kept. `docs/grid-queries.md` carries the shipped table
and is the one to re-derive against. The peak in distinct sets that chose 4s has
not been re-measured against the shipped code.

## Two facts found on the way, worth not re-discovering

**Every odd pHash threshold is unreachable.** The hash is median-thresholded, so
exactly 32 of 64 bits are set in every value (confirmed: 20,000 of 20,000
sampled). Hamming distance between any two is therefore always even, and
`NEAR_MAX_DISTANCE = 3` in `archive/pipeline/group.py` has always behaved as 2.
The pigeonhole comment beside it is correct about the index and misleading about
the setting; `NEAR_BANDS = 4` buys nothing over 3.

**`near_dup` over-reports by roughly four to one when read as tiles.** It groups
*files*, and a RAW and its own JPEG hash almost identically — so 8,463 of its
10,717 groups are the two halves of a pair the grid already draws as one tile.
Projected onto tiles it is 2,735 groups, not 10,717.

## Consequences

- Stacking adds **no schema migration and no stored grouping**. It is a window
  function over the filtered set, and on the default sorts it is a streaming
  collapse of adjacent runs, so keyset paging survives. A stacked page then costs
  what its tiles cost rather than what it draws, which is more than the ~15 ms
  hoped for here: the first 500-cover page on `newest` reads 1,805 tiles and ranks
  1,632 of them to pick covers, ~75 ms against an unstacked 10 ms. A 200-cover page
  is 16 ms, and page size is the lever. `docs/grid-queries.md` has the bill.
- Filters apply *before* stacking, so a stack re-forms over whatever is selected
  and the cover is resolved per query rather than materialised.
- The 449 tiles dated from `mtime` or filename are never stacked: a file date is
  a copy date, and a wrong stack is worse than no stack.
- The grid's `dup` filter is relabelled **Identical frames**, because at the
  shipped threshold that is what it finds, and "similar" now belongs to stacking.
