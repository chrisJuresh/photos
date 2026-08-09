# What the grid can be asked, and what each question costs

Read this before touching `photolib/browse.py`, `photolib/grid.py`'s query paths, or
the triage screen queries. The two cost properties below are load-bearing — a change
that breaks either one is a regression whether or not a test catches it.

## The vocabulary

What can be filtered and sorted by lives in `photolib/browse.py`: fifteen dimensions
and ten orderings, every one of them grounded in a column that is actually populated
for the tile set. `file.dims_src` is the one that did not qualify — 0 of 24,536 tiles
carry it, so a "how were the dimensions obtained" facet would be a menu with one empty
entry.

The vocabulary, including every dimension's title, each value's label and how many
tiles it holds, is served from `/api/facets` and built in one ~700 ms pass at startup,
which replaced the 1.07 s per-kind count. The client hardcodes no dimension names, so
**adding a filter is a change to `browse.py` alone.**

Facet counts are **unconditional** — what the library holds, not what the current
selection holds — because cross-filtering them would cost one count per dimension per
click, and a menu that renumbers itself as you tick through it is worse at the one job
it has.

## The two costs that decide the module's shape

**Every filter leaves the default sort on the `photo_sort` index**, so a filtered page
is 9–15 ms: 100–152 ms for `root` and `grade`, which carry a subquery, and ~430 ms in
the worst case, which is a selection narrow enough that the index has to be walked to
its end to fill one page. An alternate ordering cannot use the index and pays
230–290 ms to sort 24,536 rows. That is the honest price of "largest first" against
this schema and it is charged only when such a sort is chosen.

**`total` is 230–400 ms whatever the filter**, because a count visits every tile. It is
therefore memoised per filter set on the frozen `Query` object and never recomputed per
page — see `GridServer.total`. Two requests that mean the same selection are the same
key however the query string was spelled.

A test asserts the index property for every filter, and another asserts that each facet
count equals what selecting it actually yields. Keep both green.

## Stacking

`stack=<1..10>` collapses each run of consecutive captures from one camera within that
many seconds into one tile. It is a grouping over the *filtered* set, so a filter that
removes a member splits its stack in two, and nothing is stored — see
[ADR 0001](adr/0001-stack-on-capture-time-not-phash.md) for why this is capture time and
not the perceptual hash. Only EXIF-dated tiles stack; the 449 dated from mtime or from a
filename are each a stack of one, and an unstackable frame chronologically inside a
burst does not split the burst around it.

Measured over the real 24,534-tile catalog, against [ADR 0001](adr/0001-stack-on-capture-time-not-phash.md)'s
own table:

| window | 1s | 2s | 3s | 4s | 6s | 10s |
|---|---|---|---|---|---|---|
| stacks | 15,458 | 13,393 | 11,990 | **10,948** | 9,566 | 8,159 |
| ADR | 15,435 | 13,371 | 11,969 | **10,929** | 9,550 | 8,145 |

**This code groups 14–23 stacks less than the ADR's prototype did, at every window, and
why is not known.** The offset is systematic rather than noise, and it shrinks as the
window widens, so a handful of runs the prototype merged this splits. It is not the
`unixepoch`-versus-`julianday` change below: float noise *splits* a gap of exactly the
window, which would push the prototype's count up rather than down. The prototype's
script was not kept. Anyone re-deriving these should expect this table, not the ADR's.

**A stacked page costs what its tiles cost, and nothing more.** 500 covers is 1,805
tiles at the recent end of the library — which is the bracketed end — and 640 at the
old end, so the same page is 36 ms on `newest` and 16 ms on `oldest` against 10 ms
unstacked. A full walk is 22 pages and 489 ms, ~22 ms a page. **The first page on
`newest` therefore misses the 30 ms the spec asked for**, and it misses it by reading
tiles rather than by collapsing them: under `orient=landscape` a 500-cover page reads
1,189 tiles and takes 212 ms where the unstacked 500 takes 95 ms. A smaller page under
stacking is the client's lever, not this module's.

**The two default sorts never run the grouping pass at all.** A run is contiguous in
`photo_sort` order, so a page collapses its own as it streams and keyset paging is
unchanged; `_rows` steps the cursor rather than fetching it, so a tile the page never
reaches is a tile SQLite never visits. A page ends at a *clean cut* — the first tile
more than the window away from the last one that could stack — so no run straddles a
boundary and a page can carry a few covers more than it asked for. That is deliberate:
the alternative is splitting a burst across two pages.

**How many stacks the whole selection holds is one more number of `total`'s shape**, and
the badge on the Stacks pill is what asks for it — the selection's stacks, not the page
in front of the reader. The count pane beside it reads `<photos> photos` in both modes,
so the only number that moves when stacking is toggled is the badge's. `starts` is 1
exactly where a stack begins, so summing it counts them without building one — 410–420 ms
unfiltered against this catalog on a warm `total` memo, which is the assignment pass's
~380 ms plus the sum.
Memoised per selection under the same cap and eviction as the other two. It is the only
grouping pass a default sort pays for, once, in front of the first page rather than per
page, and a reader who has not turned stacking on never pays it. The memo key **drops the
sort**, since the sort decides which member covers a stack and never how many there are,
so changing the ordering does not re-count; it keeps the window, which is what the
grouping groups by.

**The eight other sorts cannot stream**, because a stack's members are scattered through
the ordering. They compute the whole assignment in one ~380 ms pass and memoise it per
selection under the same cap and eviction as `total` — see `GridServer.assignment`.
Paging is then a slice and a page is 9 ms. The window is part of the memo key, since it
is what the grouping groups by; it is dropped from `total`'s key, because no window
changes how many tiles there are.

The **cover** — the frame a closed stack is drawn as — is **the sharpest frame of the
middle-exposure third**. Rank the members by mean luminance, take the middle third
rounded up to at least one, and take `max(sharpness)` among those: the library is
mostly three-frame bracketing, and the middle exposure is the one that was aimed. The
band widens to every member sharing its edge exposures, which is what makes a
constant-exposure burst degrade to plain sharpest instead of picking an arbitrary frame
out of a tie. A member whose quality pass failed carries neither reading, cannot be
ranked, and so is never drawn over one that can be — only when it is the whole stack.

Mean luminance is not stored. It is the centre of mass of the 16-bin
`luminance_histogram` Phase 2b wrote, computed in Python: Phase 2b's own
`underexposure` is clamped at mid grey, so every frame brighter than that reads 0 and a
bracket's top two frames are indistinguishable by it. The cover is **resolved per query
and never materialised**, because filters apply before the grouping — removing a member
changes what a stack holds and therefore what it draws.

Which member is drawn does *not* depend on the sort, because an ordering is not an
exposure: `largest` and `newest` draw the same tiles and differ only in where each
stack sits. The keyset cursor stays the *first* member's `(key, id)`, since that is the
ordering's own row; the drawn frame can sit anywhere in it.

**The rule costs one read over the page's own members**, and on a stacked page it is
the second-largest line in the bill:

| page (limit 500, window 4s) | tiles read | members ranked | page | of which the cover |
|---|---|---|---|---|
| `newest` | 1,805 | 1,632 | 72-77 ms | 37-40 ms |
| `oldest` | 640 | 240 | 19-21 ms | 6 ms |
| `newest`, `orient=landscape` | 1,189 | 906 | 223-228 ms | 22 ms |
| `newest`, limit 200 | 409 | 302 | 16 ms | 8 ms |

So **30 ms holds for a 200-cover page and for `oldest`, and the 500-cover first page on
`newest` is ~75 ms against the 36 ms it was without the rule.** Both halves of that read
are irreducible without a schema change this feature does not make: ~13 ms to fetch
1,632 rows by id and ~12 ms for SQLite to parse `file.quality` once per row. Stacks of
one are not read for at all, having nothing to choose between, and computing the mean
in SQL with `json_each` measured slower than shipping the histogram and parsing it in
Python. The lever is still the page size.

Gaps are measured with `unixepoch`, which is exact for the whole-second timestamps
`capture_time` writes. The spec's `julianday(...) * 86400.0` carries ~2e-5 s of float
noise — it reads a four-second gap as 4.0000185, which is over a window of 4 and drops
the commonest bracket interval there is.

## Triage screen 8

Screen 8 is the directory tree: what is left of the folder structure, one node per
request, with a one-click `dir_under` exclude per folder. A folder is listed only while
the rules still keep something inside it, so excluding one removes it from the tree. An
ordinary node costs 23–54 ms, but the root and the two arch backups are 1.7–3.3 s,
because between them they hold most of the 315,680 directories — the same band every
other screen sits in at a 372-rule set.
