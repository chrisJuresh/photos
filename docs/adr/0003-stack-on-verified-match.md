# Stack on a verified visual match, fenced by time

**Status: accepted 2026-08-09, implemented 2026-08-11.** Supersedes the *decision* of
[ADR 0001](0001-stack-on-capture-time-not-phash.md) and none of its measurements: pHash
still cannot group this library, and 0001 remains the place that proves it.

**A stack is the same photograph, taken more than once** — frames verified to show the
same picture, within one stretch of shooting. Capture time stops deciding membership and
becomes a fence: a necessary condition, never a sufficient one.

## Why the old rule could not be tuned

The operator shot two habits into this library, often together: three- and five-frame
exposure brackets, and the same picture fired four or five times over with small
handheld repositions between presses. Both want to collapse to one tile. Neither is
what "a run of captures within N seconds" finds.

Two error classes came out of a real browsing session at `stack=10s`, with the operator
labelling by eye. Both were measured against the shipped 24,518-tile catalog, 24,076 of
them EXIF-dated.

**Unrelated frames arriving in one stack.** A nine-frame stack spanning 15:58:29 to
15:58:55 held two frames that belong to neither of the others; a three-frame stack held
one. The gaps *inside* those stacks are 2, 2, 2, 2, 3, 4, 4, 7 and 2, 9 seconds — every
one of them under any window a reader would set.

**Stacks of the same picture left apart.** Eleven runs, 172 tiles. The gaps the reader
wanted bridged are 9, 12, 12, 12, 13, 14, 14, 15, 18, 19, 20, 20, 23, 25, 36, 41, 46, 55,
71, 86, 134, 137, 148, 184, 831 seconds. **Every one of the eleven runs contains at least
one gap over 10s**, and the largest is 831s.

So the two populations sit on opposite sides of every threshold at once: the merges to
undo happen at 2–9s, the merges to make need 12–831s. **No value of the window satisfies
both**, which is why tuning it never converged.

**pHash does not separate them either, and on the operator's own labels it inverts.**
Hamming distance across boundaries the reader wanted merged: 0, 6, 6, 8, 10, 10, 12, 12,
12, 18, 20, 20, 24, 26, 28, 32, 34, 34, 36. Distance between adjacent frames *inside* the
seven-frame group the reader kept together after evicting the two intruders: 4, 8, 26,
26, 30, 38. The largest within-stack distance exceeds the distances that separated the
frames the reader threw out. This is 0001's finding reached from the other end — a
bracket changes structure, not just brightness — and it rules out the stored hash as an
arbiter as firmly as it ruled it out as a grouping key.

## The decision

**Membership is a verified pairwise match**, computed once offline from the 1536px
substrates already on the NVMe (24,511 of 24,518 tiles covered, so no `G:` access):

1. An embedding screens every candidate pair on the GPU — cheap, and it rejects the
   overwhelming majority.
2. Survivors get geometric verification: distinctive points are matched between the two
   frames and fitted to a single transform. **Match** is the count of points that agree.
   A handheld reposition and a two-stop exposure change preserve it; turning to face
   something else does not.

Geometry rather than embedding distance alone is the primary evidence because the
operator's binding constraint is precision — *never open a stack and see two unrelated
photographs* — and "forty-one points agree on one transform" is a harder claim than a
cosine over a threshold.

**Linkage is complete by default**: every pair inside a stack must match, not merely
each frame and its predecessor. This makes the precision constraint structural rather
than probable. Its failure mode is named and accepted: a bracket end too blown out to
verify against a distant member splits one true stack into two adjacent ones, showing
the same picture twice — the lesser evil, and measurable against the fixture.

> **Superseded by the labels.** The failure mode above is not the lesser evil at this
> library's scale, and "What the labels settled" below replaces this default with
> *matches most members*. The reasoning here stands; the measurement disagreed with it.

**The window survives as a fence**, at or below which two consecutive captures *may*
belong to one stack. Default and slider ceiling both 3600s. Its cost saturates — see the
table below — and it exists now only to stop two coincidentally identical frames from
different days joining, and to bound the offline pair set.

**Four knobs are reader-facing**: window, strictness (a threshold on Match), linkage and
the on/off pill. Their existence is free — an untouched knob is a constant in the memo
key and hits the same cache entry — and moving one is a cache miss, which the interface
warns about.

> **Superseded by what was built, twice.** Three knobs are reader-facing, and the window
> is not one of them.
>
> None of the three are free in the sense meant here, because the grouping is materialised
> rather than computed per request: a knob off its default would have to be answered from a
> population of `stack_member` nobody wrote, or by falling back to a live walk over the
> Match rows, which is a second implementation of the rule and the thing "the walk is one
> walk" was worth most. So a knob is not a threshold the reader dials to any value they
> like; it is a **choice of which stored assignment to read**, and `photolib.browse.settings`
> offers the ones a pass has actually written. Strictness and linkage are
> `python -m photolib.membership`'s flags, so a setting the panel offers is one somebody
> ran, and a request naming any other is a 400 rather than a page of stacks of one.
>
> **The window is not a knob and this document was the one that had it wrong.**
> `migrations/011_stack_member.sql` is where it is written down correctly: the ceiling is
> the fence the Match rows were computed behind, so an assignment at any other value would
> have been decided over pairs nothing ever checked — narrowing it asks about a subset of
> the evidence and would still need a pass to write the answer, and widening it reaches
> pairs that were never checked at all. It stays in the key so that a build-time commitment
> that changed could be seen to have changed. Ticket 42 settled it that way; the "four
> knobs" line above is the superseded half, and "Its cost saturates" is a measurement about
> a grouping that no longer runs at query time.

## What this makes true that was not

**A stack is stable under filtering, so filtering shrinks a stack and never splits it.**
This is the load-bearing consequence and it follows from the definition: hiding a frame
does not change whether the remaining frames still show the same picture. 0001's "a
filter that removes a member splits its stack in two" was correct for a time-run and is
wrong for this.

Three things fall out:

- **The grouping can be materialised.** A 500-cover page reads 500 rows instead of
  walking 1,805 tiles — page cost drops below today's rather than rising. Scores are
  stored per candidate pair as well as the assignment, so strictness stays adjustable
  without re-running the pass; non-default knobs fall back to computing from the scores.

  > **Measured, and half of it held.** A 500-cover page is 23–61 ms across the four
  > selections measured, where the window grouping's were 19–228 ms: the win is on the
  > filtered and alternate-sort pages, which no longer read tiles they discard. What did
  > not drop is the *first* page — the assignment is one ~630 ms read per selection where
  > the stack count was ~410 ms, so first paint on `newest` went from ~490 ms to ~690 ms.
  > `docs/grid-queries.md` has the table and the comparison. The fall back to computing
  > from the scores was not built — see the knobs above.
- **A hand-picked set survives a filter or sort change**, and is cleared only by the
  knobs that regroup.

  > **Not built.** A mark is keyed on the cover that stood for a stack, and narrowing the
  > view can change which frame that is, so a set carried across a filter could point at a
  > tile the page no longer draws. Carrying it waits on the grid naming a stack to the
  > client rather than pointing at its cover; the marked set is still cleared by any change
  > to the query.
- **`rebuild.py` gains a step**: Apply to grid must refresh the assignment after triage
  rewrites `photo`.

  > **Not needed, for a reason worth recording.** A stack is named by a member's sha256 and
  > keyed on sha256, and `archive.pipeline.group` reassigns ids without changing bytes — so
  > a rebuild cannot invalidate a row. What it can do is publish a tile whose
  > representative has no row yet, which the grid draws as a stack of one until the pass is
  > re-run. Clearing the memos, which Apply to grid already does, is the whole of the
  > server's part.

The cover rule is unchanged — the sharpest frame of the middle-exposure third — and it
degrades correctly over a stack holding a dozen brackets, because a larger middle third
is a larger pool of correctly-exposed frames. Measured on the shipped catalog, the cover
is the *first* frame of its stack in only 33% of stacks at a 4s window and 27% at 900s,
which is why the overlay marks which frame it was.

## The numbers the window value was chosen from

Read-ahead for a 500-cover page on `newest`, simulated against the catalog and calibrated
against the shipped 1,805 tiles / 72–77 ms at 4s:

| bound | tiles read | est. page | candidate pairs offline | of the 11 runs |
|---|---|---|---|---|
| 4s | 1,806 | 76 ms | — | none |
| 30s | 4,509 | 189 ms | — | 5 |
| 60s | 6,095 | 256 ms | 308k | 6 |
| 300s | 8,457 | 355 ms | 1.26M | 10 |
| 900s | 8,888 | 373 ms | 2.19M | 11 |
| 3600s | 9,583 | 402 ms | 3.63M | 11 |
| none | 24,076 | ~380 ms grouping pass, every sort | 290M | 11 |

The expensive stretch is 4s to 120s; from 300s to an hour costs 47 ms in total. Those
figures are what the *live* path costs when a knob is off its default — the materialised
path does not pay them at all. Dropping the bound entirely was rejected for a different
reason: with no fence, a stack is no longer a contiguous run in capture order, the two
default sorts lose their streaming collapse and keyset paging, and every page becomes a
full-library grouping pass.

Gaps between consecutive same-camera captures decay smoothly with no natural break —
46.3% are ≤ 2s, 65.7% ≤ 8s, 80.9% ≤ 60s, 89.7% ≤ 900s — so no window value is discovered
rather than chosen. This is why the value is argued from cost and coverage above and not
from a knee.

## How it will be judged

A labelling harness, thrown away afterwards, shows the operator candidate stacks with the
frame before and after each one and records merge / split / **not sure** into a separate
`labels.sqlite3` on the NVMe — never `state.sqlite3`, which holds irreplaceable triage
decisions and has its own snapshot and restore machinery. Pairs are drawn from wherever
the match score is least decisive, so a few hundred judgements land where they move the
threshold most. Labels are treated as soft: accuracy is reported over the confident
subset, and disagreement in the grey band is expected rather than fitted to.

Two rounds of about thirty sets: the first calibrates the threshold, the second — drawn
after re-running with the first round's answers — checks the work.

> **Judged, and the harness is gone.** Both rounds were labelled on 2026-08-10 and the
> harness was deleted whole on 2026-08-12 (ticket 44), scaffolding removed once it had
> answered. The three sections below are what it returned and are now the record: the
> setting itself lives in `photolib/membership.py` as `STRICTNESS` and `DEFAULT_LINKAGE`,
> and `python -m photolib.membership` is what writes the grouping the grid reads.
>
> **The labels themselves were not deleted.** They stay in the `labels.sqlite3` beside the
> catalog on the NVMe — never in git — so a figure here is re-derivable from the answers
> that produced it rather than only by labelling again. What has gone is the screen that
> collected them and the report that replayed them, not the evidence.

## What the labels settled

**Strictness 20, linkage "matches most members".** Recorded 2026-08-10 from round one of
the labelling harness — thirty sets, every one answered with certainty, replayed against
complete and majority linkage by the harness's calibration report — and confirmed the same
day by round two, which is the last section here. The setting reached the grid as
`photolib.membership.STRICTNESS` and `DEFAULT_LINKAGE`, and the walk the report replayed the
labels against is `photolib.membership.link`, which it read rather than copied.

### What the labels are, and what they are not

Thirty answers, 5,368 labelled pairs over 25 runs — 3,712 pairs the reader kept together
and 1,656 they pushed apart. **Every comparison is scoped to the frames that were on
screen when the answer was given.** A label says *the frames I was shown are right* and
never *this stack is complete*; the harness's view was widened by the reader but never
reaches the whole run, so scoring outside that scope would measure the width of the window
rather than the threshold, and would push this section towards a stricter setting than the
labels justify.

Three ceilings sit above every setting, and none of them is the threshold's fault:

- **224 of the 3,712 pairs the reader kept together carry no Match row at all** — the
  fingerprint screen rejected them at 0.40, or a substrate was missing. No strictness
  reaches them, so 6.0% of recall is gone before a threshold is chosen.
- **246 more were checked and agreed on nothing.** That is the linkage's problem rather
  than the screen's, and it is what decides the next section.
- **The strongest pair the reader pushed apart scores 256 points**, so no strictness in the
  sweep reaches perfect precision. 42 of the 53 false positives at the chosen setting are
  one thirteen-frame set where the reader kept six frames and evicted seven that the
  geometry cannot tell apart from them.

The positive evidence is also unbalanced in a way worth stating rather than discovering
later: the reader's **five longest sets — 42, 39, 37, 28 and 24 frames — are 79% of the
pairs they kept together**, because a set of *n* frames is *n(n−1)/2* pairs. Those five
sets contain no frame the reader pushed out at all.

### Precision and recall, reported separately and never blended

Precision is the binding constraint — *never open a stack and see two unrelated
photographs* — and recall is best-effort under it, so the report treats precision as a
floor rather than as a ranking. Ordering on precision alone returns the corner of the
sweep, where a setting stacks almost nothing and is therefore almost never wrong.

| linkage | strictness | precision | recall | pairs stacked | wrongly stacked | cases with a disagreement |
|---|---|---|---|---|---|---|
| complete | 20 | 92.8% | 18.5% | 686 | 53 | 23/30 |
| **majority** | **20** | **96.0%** | **34.2%** | **1,271** | **53** | **21/30** |
| complete | 40 | 97.3% | 12.6% | 469 | 13 | 24/30 |
| neighbour | 25 | 95.1% | 44.7% | 1,658 | 85 | 18/30 |

Both counts are reported because they answer different questions. A pair is the unit the
threshold works in and the unit "two unrelated photographs in one stack" is about, but it
weights a long burst quadratically; a case is one vote each and is coarse for the same
reason. The report printed the whole sweep, the frontier, and the labelled cases every
setting got wrong; the four rows above are the ones this decision turns on.

### Complete linkage does need softening — the answer is yes

At strictness 20, "matches most members" beats complete linkage on **both** counts at
once: 96.0% against 92.8% precision, 34.2% against 18.5% recall, stacking 1,271 pairs
against 686 for the same 53 mistakes. It does so at every strictness from 40 upwards too,
and at 12 and 25.

The reason is structural rather than incidental. Complete linkage requires every pair
inside a stack to match, and 224 of the reader's kept pairs have no Match row at all — so
**a burst holding one such pair cannot be one stack under complete linkage at any
strictness.** The reader's five longest sets each hold several. Complete linkage cannot
express any of them, which is the failure mode this ADR named and accepted as the lesser
evil; at 42 frames it is not the lesser evil.

"Matches most members" is strictly most, so a frame agreeing with half a stack does not
join it: a tie is not most, and precision breaks ties.

### What was measured and not adopted

Scored over all three rules, round one's labels return **neighbour linkage at
strictness 25** — 95.1% precision, 44.7% recall, the best recall of anything clearing the
report's 95% precision floor. It is not the default, for a reason in the evidence rather
than in taste: **the runs where a chain does its work carry no frames the reader pushed
out.** The five long drags are 79% of the pairs kept together and contribute not one pair
pushed apart, so these labels cannot price a chaining rule's failure — a chain that walks
a whole run into one stack scores perfectly on them. Complete and majority linkage make
precision a property of the stack; a chain does not, and one round of labels that cannot
see the difference is not enough to make it the default.

Round two was drawn to see it, and did — "What round two settled" below.

### The fence is not what is losing frames

60 frames past the end of a run were drawn beside a set and left out, and **none was
called a member**. The 3600s window's value is untouched by this round.

### What round two settled

**The default stands: strictness 20 with "matches most members".** Recorded 2026-08-10
from round two of the labelling harness — thirty more sets, drawn at that setting, every
one answered with certainty. It is the same report round one's setting is recorded from,
reading a labels file that holds both rounds and scoring the second apart.

Round two is a check and never evidence. The setting is not re-chosen on its labels: the
report picks from the earliest round and replays every later one against that pick, so an
agreement between the two is a finding rather than arithmetic. What follows is that
replay, and every comparison in it is still scoped to the frames that were on screen when
the answer was given.

Round two's sets are the population round one had none of: 20 of its 30 carry a **chain**
to price — frames single linkage would drag across a boundary *matches most members* drew,
one of them dragging 48. 898 labelled pairs over 19 runs, 715 the reader kept together and
183 they pushed apart. The reader was not told which sets those were, so the rejections
below are observed and not prompted.

| linkage | precision | recall | wrongly stacked | cases with a disagreement |
|---|---|---|---|---|
| complete | 90.1% | 44.3% | 35 of 352 | 18/30 |
| **majority** | **96.5%** | **85.6%** | **22 of 634** | **15/30** |
| neighbour | 88.8% | 93.4% | 84 of 752 | 15/30 |

**"Matches most members" clears the 95% floor on sets it was not chosen from**, at 96.5%,
and the chain does not: 88.8%, six points under, spent on 7.8 points of recall.
Precision is a floor and not a ranking, so the chain's better recall does not get to
speak. The same holds at strictness 25, where round one's all-rules run recommends the
chain: on round two's labels neighbour scores 92.1% precision there, so **the setting round
one recommended does not clear its own floor on the sets drawn to test it.** The strictness
is 20 because round one's evidence put it there — 25 falls under the floor on those labels
too, at 94.9% — and round two agrees rather than decides: majority at 25 scores 92.5% here.

### Which cases the chain gets wrong, and which the settled rule does

Counting says the chain is worse; naming says where it went. Seven of round two's sets are
stacked wrongly by neighbour linkage and got **entirely right** by *matches most members* —
53 of the chain's 84 wrongly stacked pairs. **Every one of the seven is a set the round was
drawn to find**: the chain column is how many frames single linkage drags across the
boundary the settled rule drew, and none of these is zero.

| case | chain | pairs the chain wrongly stacked | strongest |
|---|---|---|---|
| Panasonic DMC-GX80 77255b0e x9 | 47 | 3 | 70 |
| Panasonic DMC-GX80 42383d08 x12 | 39 | 24 | 133 |
| Panasonic DMC-GX80 89721cb9 x12 | 39 | 12 | 40 |
| samsung SM-G950F fb0e1243 x2 | 8 | 2 | 64 |
| samsung SM-A528B 965e000c x2 | 6 | 2 | 92 |
| samsung SM-G950F 63f7e85d x4 | 6 | 8 | 101 |
| SONY NEX-5N 85d1d298 x2 | 5 | 2 | 222 |

This is the failure ADR 0003 declined the chain by argument for, measured: a chain walks a
stack from one subject to another in small steps, and a rule that counts every member does
not. The rest of the chain's errors are the settled rule's errors made larger — SONY NEX-5N
01d7b54b x6 at 12 pairs against 9, 6bf2663b x8 at 18 against 12 — plus one pair scoring 109
in Apple iPhone 5 4288780d x2 that all three rules stack and the reader pushed apart. That
last set carries no chain at all, and every rule makes the same single mistake in it: it is
the threshold that is wrong there, not the linkage.

The settled rule is not clean, and its 22 wrongly stacked pairs sit in exactly those three
cases: 01d7b54b (9, strongest at 176), 6bf2663b (12, at 125), 4288780d (1, at 109). Its
misses are the shape round one already described — pairs the geometry agrees nothing about,
which no strictness reaches: Panasonic DMC-GX80 464c7018 x25 (25 missed, weakest at 0
points), samsung SM-A528B 86f3f49e x9 (19 at 0), Apple iPhone 7 Plus 5ab519c7 x6 (13 at 0),
samsung SM-A528B d4385b8e x8 (8 at 0). The report named every rule's wrong cases on this
round and not only the chosen rule's, which is why the chain's are listed above beside them.

### The fence, checked a second time

57 frames past the end of a run were drawn beside a set and left out, and **one was called
a member** — Apple iPhone 6 Plus 25139d57 x3. One frame in the 118 shown over both rounds
is the 3600s window's whole bill, so round one's finding survives: the fence is not what is
losing frames, and its value is unchanged.

## What is still deliberately not settled here

Whether the embedding screen can be tightened enough to skip geometry on most pairs. The
labels say the live question is the opposite one: at 0.40 the screen costs 5.2% of the pairs
the reader kept together, and that is a floor on recall no strictness can lift. Loosening it
was the change worth measuring, and it has been measured — over the 60 answers in the labels
file, against the stored cosines, pricing each value's pass from the rates the last one
recorded rather than by running anything.

| screen | surviving candidates | fresh pairs to match | match time | catalog | kept pairs reached |
|---|---|---|---|---|---|
| 0.087 | 2,334,168 | 1,767,646 | 1h42m | +356 MB | 3,727 (100.0%) |
| 0.10 | 2,207,651 | 1,641,129 | 1h35m | +330 MB | 3,722 (99.9%) |
| 0.15 | 1,771,880 | 1,205,358 | 1h09m | +243 MB | 3,714 (99.7%) |
| 0.20 | 1,414,690 | 848,168 | 49m | +171 MB | 3,682 (98.8%) |
| 0.25 | 1,127,405 | 560,883 | 32m | +113 MB | 3,657 (98.1%) |
| 0.30 | 894,016 | 327,494 | 19m | +66 MB | 3,612 (96.9%) |
| 0.35 | 708,578 | 142,056 | 8m | +29 MB | 3,580 (96.1%) |
| **0.40** | **566,522** | **0** | — | — | **3,535 (94.8%)** |
| 0.45 | 454,402 | 0 | — | — | 3,465 (93.0%) |
| 0.50 | 367,526 | 0 | — | — | 3,351 (89.9%) |

0.087 is not a round number and is not from the sweep: it is the weakest cosine among the
pairs the reader kept and the screen rejected, so it is the value that buys every one of
them back. Every row is read from `candidate_pair.screen` and never from the verdict, which
is frozen at 0.40 — the refusal guarding that constant is borrowed whole and untouched.

The denominator is not the 3,712 of "What the labels settled" above, and the difference is
not round two. **A pair is counted once here and once per answer there**: the two rounds
partition a run under different linkage rules, so their sets overlap, and 60 answers' worth
of kept pairs is 4,427 mentions of 3,727 pairs. Weight per answer is what a calibration
wants and double-counting is what a share of a population cannot have.

**The bill is the screen's alone.** All 192 kept pairs with no Match row were rejected by
the fingerprint. Not one is a missing substrate, and not one holds a frame the fingerprint
pass never reached: the derivative tree is complete over every frame the reader was shown.
The two causes this ticket set out to separate turn out to be one.

**Tightening is settled, and the answer is no.** 0.45 already loses 70 of the reader's kept
pairs and 0.50 loses 184 — 4.9 points of the labelled population — before any strictness has
spoken. There is no tightening that skips geometry and keeps the pairs the reader says are
one photograph, so the question this ADR left open is closed against itself.

**Recommendation: leave the screen at 0.40.** Loosening is affordable — 19 minutes and 66 MB
at 0.30, under two hours and 356 MB to buy back everything — but the recall it buys is a
**ceiling and not a delivery**. A recovered pair changes what the grid draws only if its
Match then clears strictness 20, and these are the weakest fingerprints in the labelled set
(median 0.277 against 0.965 for pairs a second or less apart). The settled linkage is what
makes that trade a poor one: under complete linkage a pair with no Match row was fatal to
its whole stack, which is the argument above for softening; under *matches most members* it
costs one vote among many. The floor that mattered when this was written is much less
binding now that the rule above it changed.

What is left unsettled is exactly one number, and it is cheap: **match those 192 pairs and
see whether their geometry agrees.** That is seconds of work and it turns the ceiling into
a delivered figure, which is the one thing a measurement over stored rows cannot do — it
needs a write to the catalog, which is why this ticket did not do it. Revisit the screen if
that check says the geometry is there; a change would mean re-running the match pass and
then #40's materialising pass, both resumable and idempotent by design.
