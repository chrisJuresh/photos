# Stack on a verified visual match, fenced by time

**Status: accepted 2026-08-09, not yet implemented.** Supersedes the *decision* of
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

**The window survives as a fence**, at or below which two consecutive captures *may*
belong to one stack. Default and slider ceiling both 3600s. Its cost saturates — see the
table below — and it exists now only to stop two coincidentally identical frames from
different days joining, and to bound the offline pair set.

**Four knobs are reader-facing**: window, strictness (a threshold on Match), linkage and
the on/off pill. Their existence is free — an untouched knob is a constant in the memo
key and hits the same cache entry — and moving one is a cache miss, which the interface
warns about.

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
- **A hand-picked set survives a filter or sort change**, and is cleared only by the
  knobs that regroup.
- **`rebuild.py` gains a step**: Apply to grid must refresh the assignment after triage
  rewrites `photo`.

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

## What is deliberately not settled here

The strictness threshold, whether the embedding screen can be tightened enough to skip
geometry on most pairs, and whether complete linkage needs softening to "matches most
members". All three are questions for the fixture, and answering them by argument before
the labels exist is how this feature got its first two windows.
