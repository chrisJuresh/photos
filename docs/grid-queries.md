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
view holds — because cross-filtering them would cost one count per dimension per
click, and a menu that renumbers itself as you tick through it is worse at the one job
it has.

## The two costs that decide the module's shape

**Every filter leaves the default sort on the `photo_sort` index**, so a filtered page
is 9–15 ms: 100–152 ms for `root` and `grade`, which carry a subquery, and ~430 ms in
the worst case, which is a view narrow enough that the index has to be walked to
its end to fill one page. An alternate ordering cannot use the index and pays
230–290 ms to sort 24,536 rows. That is the honest price of "largest first" against
this schema and it is charged only when such a sort is chosen.

**`total` is 230–400 ms whatever the filter**, because a count visits every tile. It is
therefore memoised per filter set on the frozen `Query` object and never recomputed per
page — see `GridServer.total`. Two requests that mean the same view are the same
key however the query string was spelled.

A test asserts the index property for every filter, and another asserts that each facet
count equals what selecting it actually yields. Keep both green.

## Stacking

`stack=on` draws the frames verified to be the same photograph as one tile. **The
grouping is read, not computed**: `photolib.membership` wrote one row per tile at
strictness 10 with *the chain* behind the 3600s fence, and `browse.py` joins
`stack_member` on those five key columns — [ADR 0003](adr/0003-stack-on-verified-match.md)
is the decision and [ADR 0001](adr/0001-stack-on-capture-time-not-phash.md) the
measurements it stands on. There is no window to send: what used to be a slider is the
fence the Match rows were computed behind, and a walk at any other value would be reading
pairs nothing ever checked. `browse.STACK_SETTING` names the assignment the grid reads by
default and `tests/test_membership.py` asserts it is the one the pass writes.

**`strictness=` and `linkage=` name another one**, and are the whole of what the Stacks
panel's two knobs send. They cost nothing extra — a setting is five bound values in the
same join, so a second population is a different key into the same index and never a
second query shape — and they are validated against `browse.settings`, one
`SELECT DISTINCT` over `stack_member`'s key read once per process beside the facets. That
read is a `SEARCH … USING PRIMARY KEY` and not a pass over the table, so it does not grow
with the assignment: 0.1 ms over 72,000 rows in three populations, and a test asserts the
plan. That
list is what the panel is offered, so **the panel and the refusal read one list**: a knob
the panel showed is never a 400, and a setting nobody ran the pass at is a 400 rather than
a page. That last part is the point of validating at all — with no rows the LEFT JOIN
below answers every tile as its own stack, which is a plausible page and not an error, and
no reader could tell it from a library that brackets nothing.

Only tiles membership placed carry a row. A tile the filesystem dated gets none — a copy
date is not when the photograph was taken — and reaches the grid as a stack of one named
by its own sha256, which is also what a video is: nothing verifies one. An unplaced frame
sitting chronologically inside a burst does not split the burst around it.

**The grid draws nothing stacked until the pass has run.** With `stack_member` empty every
tile is its own stack and the mode is a no-op, which is the honest reading of an assignment
that does not exist rather than a fall back to the clock. `python -m photolib.membership`
is the command.

Measured over the real catalog with membership in place — the default stills view,
24,306 tiles:

| | stacks | of more than one | largest | stacks of one |
|---|---|---|---|---|
| whole view | 7,712 | 3,505 | 96 | 4,207 |
| `orient=landscape` | 2,010 | 708 | 48 | 1,302 |

Re-measured 2026-08-21 when the default moved from strictness 20 with *matches most
members* to strictness 10 with *the chain* — see ADR 0003's "What the recalibration
settled". The setting it moved from is still a population in the table and still drawable,
and on the same machine and the same tile set it reads 8,706 / 3,621 / 96 / 5,085 for the
whole view and 2,203 / 683 / 48 / 1,520 for `orient=landscape`. **Fewer stacks of more than
one frame and fewer stacks of one at the same time** is what a looser rule does: it pulls
frames that used to stand alone into stacks that already existed rather than starting new
ones.

**A filter shrinks a stack and never splits it, checked over the whole corpus.** Every
stack under `orient=landscape`, `ext=.jpg`, `grade=best` and `year=2023` is a subset of a
stack of the unfiltered view — 0 splits in all four. That is what stored membership
buys, and it is why this section no longer has a table of windows in it.

**One pass per view, then a page is a slice.** The assignment visits every tile the view
holds and is memoised per view and sort — see `GridServer.assignment`:

| view | assignment | 500-cover page | 200-cover page |
|---|---|---|---|
| `newest` | 713 ms | 80 ms (1,883 frames) | 26 ms (523 frames) |
| `oldest` | 714 ms | 27 ms (800 frames) | 9 ms (280 frames) |
| `largest` | 370 ms | 47 ms (1,260 frames) | 12 ms (344 frames) |
| `newest`, `orient=landscape` | 513 ms | 48 ms (1,228 frames) | 22 ms (523 frames) |

**Re-measured 2026-08-21 at the looser default, because a bigger average stack is more
frames behind the same number of covers.** The same script in the same process reads 647 /
64 / 22 ms, 701 / 29 / 10 ms, 393 / 49 / 13 ms and 572 / 50 / 23 ms at the setting this
moved from. Only one figure moved beyond the ±15% these timings repeat within: **a
500-cover `newest` page, 64 ms to 80 ms**, and it is the cover rule reading 1,883 members
where it read 1,579. The bill tracks frames on the page and never stacks in the table,
which is why `oldest` and `largest` did not move at all and why a second population in
`stack_member` costs nothing. First paint on `newest` is ~790 ms against ~710 ms, and the
30 ms gate is met by a 200-cover page on `oldest` and `largest` as it was.

Against 9 ms for an unstacked page and 227 ms for a `total`. The plan is
`SCAN p USING INDEX photo_sort` with `SEARCH sm USING PRIMARY KEY` — membership is a
lookup per tile and never a scan of the table, so a second setting's rows cost nothing —
and there is no temp b-tree on a default sort, because `photo_sort` already supplies the
order. A test asserts all three.

**The bill against what it replaced is close to a wash, and its shape changed.** The
window grouping paid ~410 ms to count the stacks plus 72–77 ms for a first `newest` page,
and ~22 ms a page after it; this pays ~713 ms once and 80 ms a page. So the first paint on
`newest` is ~790 ms where it was ~490 ms, every page after it is cheaper, and the 30 ms
the spec asked for is met by a 200-cover page on `oldest` and `largest`. The lever is the
page size, as it was.

**Both of the count pane's numbers come out of that one pass.** `stacks` is the
assignment's length rather than a count of its own, which is how two readings of one
view are kept from disagreeing; `total` still counts tiles, and its memo drops the
stacking mode *and the setting*, because no grouping changes how many tiles there are —
so moving a knob costs one assignment and never a recount. The assignment memo keeps
both, since two settings are two populations and a memo that mixed them would answer
about one and be read as the other. The badge on the
Stacks pill is the first number, the pane beside it reads `<photos> photos` in both modes,
and a reader who has not turned stacking on pays for no pass at all.

**Every sort takes the same path.** A stack's members can sit anywhere in an ordering, so
there is no run to collapse as a page streams — the two default sorts used to have one,
because a time-run was contiguous in `photo_sort` order and a stack is not. Paging is a
slice of the assignment, which is what returns a stack whole on one page for all ten sorts
and what makes an overshoot past `limit` unnecessary: a page carries exactly the covers it
asked for.

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
and never materialised**, even though membership is not: what a stack holds is a property
of the photographs, and which of its frames is *present* is a property of the view, so
narrowing the filters can change the frame a stack draws without changing the stack.

Which member is drawn does *not* depend on the sort, because an ordering is not an
exposure: `largest` and `newest` draw the same tiles and differ only in where each
stack sits. The keyset cursor stays the *first* member's `(key, id)`, since that is the
ordering's own row; the drawn frame can sit anywhere in it.

**The rule costs one read over the page's own members**, and on a stacked page it is
most of the bill: a 500-cover `newest` page ranks 1,883 members and spends 42 ms of its
80 ms doing it — 1,579 and 33 of 64 at the setting the default moved from, which is the
whole of why that page got dearer. Both halves of that read are irreducible without a schema change this
feature does not make — fetching the rows by id, and SQLite parsing `file.quality` once
per row. Stacks of one are not read for at all, having nothing to choose between, and
computing the mean in SQL with `json_each` measured slower than shipping the histogram
and parsing it in Python. The lever is still the page size.

The fence the assignment was computed behind measures gaps with `unixepoch`, which is
exact for the whole-second timestamps `capture_time` writes. Its two expressions live in
`photolib/candidates.py` now — they were `browse.py`'s while the grid cut runs at query
time, and the fence is the one place left where the clock decides anything. The spec's
`julianday(...) * 86400.0` carries ~2e-5 s of float noise: it reads a four-second gap as
4.0000185, which is over a window of 4 and drops the commonest bracket interval there is.

## Triage screen 8

Screen 8 is the directory tree: what is left of the folder structure, one node per
request, with a one-click `dir_under` exclude per folder. A folder is listed only while
the rules still keep something inside it, so excluding one removes it from the tree. An
ordinary node costs 23–54 ms, but the root and the two arch backups are 1.7–3.3 s,
because between them they hold most of the 315,680 directories — the same band every
other screen sits in at a 372-rule set.
