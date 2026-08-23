# Stacking is vetoed by who is in the frame

**Status: accepted 2026-08-12. The rule is not implemented; the evidence it reads is** — see
"What the pass records" and "Who the reader says they photographed" below, which landed
2026-08-22. Extends
[ADR 0003](0003-stack-on-verified-match.md) and supersedes nothing in it: the Match is still
the evidence a stack is built on, and this document is a rule that sits on top of it. 0003's
own objective changed at the same time — see "The objective changed" there — and the two
changes are one decision: the dial is loosened, and the merges that loosening would otherwise
make are answered by who is in the photographs rather than by tightening it again.

**A stack needs one member whose people contain every other member's people.** Where the Match
proposes a stack with no such member, the stack is split until every part has one. The rule can
only ever split, and the member that contains everybody becomes the cover.

## Why the geometry cannot answer this on its own

ADR 0003's binding number was precision and it bought it with strictness 20. Asked to browse
the shipped grid the reader reported the opposite complaint — nothing wrongly stacked, and too
much left apart — which is what moved the floor to 85%. Loosening the dial pays for that in
false merges, roughly two and a half times as many across the labelled population: 160
wrongly-stacked mentions at strictness 20 against 415 at strictness 5.

**One of them is not the dial's to fix.** A thirteen-frame set the reader kept six frames of
and evicted seven from carries 50 of those 160 mentions at strictness 20 and 54 at strictness
5, with the strongest wrong pair scoring 256 points — so nearly a third of the damage at the
tight setting is one set, and loosening barely touches it. No threshold reaches it, because
the frames are the same scene from the same place and **the difference between the ones the
reader kept and the ones they evicted is who is in them.**

This is also what the corrected definition of a stack asks for. A stack is *the photographs of
one subject you only need to see one of*; the composition need not match and the subject may
move. Once framing has stopped being the criterion, the subject has to be named by something,
and for this library's photographs the subject is usually a person.

## The reader's worked example

Recorded verbatim, because the rule below is derived from it and has to stay checkable
against it:

> Photographs of `{A,B,C,D}`, `{A,B,C}`, `{A,B}`, `{A,B,E}`, `{B,F}`. The first three are one
> stack with `{A,B,C,D}` as its cover, and the last two stand alone.

**The reader's own stated reason for that example does not produce it.** The reason given was
that the last two *contain someone not in any other photo* — but `D` appears only in the first
photograph too, and the reader kept it, as the cover. So "introduces a new person" is not the
rule; it is a description that happens to fit four of the five frames.

The rule the example actually describes is **nesting**: `{A,B,C,D}` contains `{A,B,C}` and
`{A,B}`, and contains neither `{A,B,E}` nor `{B,F}`.

## The rule

**Nesting.** A stack needs one member whose people are a superset of every other member's
people. That member holds the most people in the stack, so the cover rule below draws it or
one of the frames tied with it.

**Subset of the cover, and not a strict chain.** The members need not form a chain of
containments among themselves; they need only all fit inside one of them. So `{A,B}`, `{A,C}`
and `{A,B,C}` are one stack, while `{A,B}` and `{A,C}` with no `{A,B,C}` present are two —
there is no frame in the second case that shows everybody, so there is no frame worth drawing
as the cover of one.

**The greedy split.** For a stack the Match proposed that has no such member: take the frame
with the most people, keep every frame whose people fit inside it, and run the rule again on
what is left. **Ties are settled by capture order**, so the answer never depends on the day it
ran. On the worked example this yields `{A,B,C,D}, {A,B,C}, {A,B}` / `{A,B,E}` / `{B,F}`.

**A frame with nobody in it never joins a frame with somebody in it.** This is the reader's own
extra clause and it does not follow from nesting — the empty set nests inside everything. It is
what keeps a landscape and the same landscape with a friend standing in it two stacks rather
than one, which is the case where hiding the wrong frame hides the photograph the reader
actually took.

**The rule sits on top of the Match and can only ever split.** It never proposes a stack. Two
photographs of the same two friends four minutes apart in different places do not become one
tile, because the geometry still has to agree first and it does not. Anything that reads this
rule as a grouping key has misread it: people are a veto.

## What a frame's people are

**The faces that were confidently read, and nothing else.** A face that could not be read is
not a person and simply does not count. That is a deliberate direction rather than an
oversight: an unreadable face can only *shrink* a frame's people set, a smaller set nests more
easily, and easier nesting can only merge. Every failure this introduces is therefore a merge,
which is the direction every other decision here leans.

**The named cost.** Where the *distinguishing* person is the unreadable one — `{A,B,E}` with
`E` blurred, so the frame reads as `{A,B}` — the frame merges into the stack wrongly.
Accepted.

**Presence and identity are answered by different detectors.** A body detector answers *is
there somebody in this frame*, which is the nobody clause, and it sees the back of a head. Face
clustering answers *who*, which is the nesting rule. A frame with a body and no readable face is
therefore *somebody* with an empty people set: the nobody clause does not fire on it, and its
empty set nests into anything, so it stays in its burst. That is what makes the two clauses
compose instead of fight, and it is why the people pass runs two detectors rather than one.

**A prominence floor exists and is measured, not picked.** Somebody counts only above some
share of the frame, or a person forty metres away in the background of one frame of a bracket
would split it. The value is settled from the reader's own friend-or-stranger answers rather
than chosen, and until they have given some it is provisional at roughly a tenth of the frame's
height. **The floor was demoted before it was measured** — see "The floor is a pre-filter"
below, which is what collecting those answers turned out to establish.

**A stranger never counts.** A person the reader has marked as a stranger is somebody who
appears in their photographs without having been photographed, and is excluded from every
frame's people. Marked once per person, not once per appearance.

**An unjudged person is a friend.** The reader will not judge two thousand persons and is not
asked to, so silence has to mean something: it means the person counts. That is the direction
every other decision here leans, and it is what makes stopping early safe rather than
undefined — **the grid at zero answers is the grid this rule produces on its own**, so every
answer the reader gives moves it from there rather than repairing it.

The default is deliberately **not stored**. A person with no row is absent from the verdict
table and `harness.people.counts` is the one place that reads the absence, because a row saying
*friend* is the reader's answer and no row at all is nobody's: a table that could not tell them
apart would report silence as a judgement, and the count of what the reader actually thinks is
the whole evidence base here.

**No names.** The rule needs only *these two faces are one person*. Naming is a feature the
reader intends to add later, and the cluster list is deliberately the thing it will be built
on; nothing here waits for it.

## What the pass records

`python -m photolib.people` is the evidence half of this rule and it landed before the rule
did. **Nothing above is implemented by it**: no stack is split, no cover moves, and no query
reads a row it writes. What it does is make every clause above answerable.

**Three models, all local, all fetched once.** No photograph leaves the disk and no name is
attached to any cluster.

| what | model | where from |
|---|---|---|
| bodies — *is there somebody* | Faster R-CNN ResNet50 FPN v2, COCO weights, 167 MB | `torchvision`, cached by `torch.hub` |
| faces — *where* | YuNet 2023mar, 233 KB of ONNX | `opencv/opencv_zoo` at `47534e2`, digest checked |
| faces — *who*, 128 dimensions | SFace 2021dec, 37 MB of ONNX | the same commit, digest checked |

The zoo files are pinned to one commit and verified against a recorded digest, because "the
file at that URL today" is not a model identity and a silently different one is a silently
different population. Both are read through the OpenCV `photolib.matches` already depends on,
so faces cost no new dependency; `torch` was already the fingerprint pass's alone. **Neither
is an import of the website**, which reads stored numbers only.

**Three tables, migration 012.** `frame_body` holds one row per frame the detector examined —
how many bodies, and the largest one's share — so that *checked and nobody here* stays a
different fact from *never checked*, which is `candidate_pair`'s `screened_out` distinction.
`face` holds one row per detected face: its share and its vector. `face_person` holds the
clustering, keyed by the threshold as `stack_member` is keyed by strictness and linkage, so
another threshold is another population and re-clustering never re-runs the detector.

**The measurement is stored and the verdict is derived.** A box records its share of the
frame's height and nothing records whether that share was enough — so the prominence floor
this document says is measured rather than picked really can be, from these rows and without
another pass. It is provisional at 0.10 and `photolib.people.FLOOR` is the only line that
reads it.

Every *face*'s share is kept individually and of the bodies only the largest, which is a
narrowing on purpose. The nobody clause asks one thing of a body — *is somebody in this frame*
— and at any floor the largest body answers it, so the distribution the floor is chosen from
is one figure per frame. Faces are the other question, *who*, and each of them is a different
who. The two confidence floors the detectors themselves run at are part of the model's version
rather than read-time constants, because what falls under one is never stored.

**What it found, over the whole library.** The pass has now run: 23,904 frames examined, two
tiles named as having no substrate, nothing that would not decode.

| | |
|---|---|
| frames holding a body at all | 9,268 |
| frames holding one at or above the provisional 0.10 floor | 6,176 |
| frames holding a face | 4,049 |
| faces | 8,037 |
| persons at the default 0.363 | 2,043 |
| appearances per person | largest 120, median 3, 330 seen once |

Two of those numbers price the rules above rather than merely describing the library. **The
nobody clause reaches a quarter of the population**: 6,176 frames of 23,904 hold somebody
prominent, so the veto has something to say about a quarter of what the grid draws and is
silent about the rest, which is the shape a rule about people should have. And **there are two
thousand persons, not two hundred** — so any design that asks the reader a question per person
is asking two thousand questions, and #54's "once per person" has to mean once per person
*worth asking about*. The 330 seen exactly once are where to start looking: a singleton cluster
is either somebody who really was photographed once or a face the clustering failed to join to
its person, the counts alone cannot tell those apart, and under the nesting rule either of them
splits a stack on the evidence of one embedding.

**A person is content-addressed**, named by its least face as `<sha256>:<idx>`, which is
`stack_member`'s reason: `archive.pipeline.group` reassigns every tile id on each Apply to
grid without changing a byte. The clustering is **complete linkage** — two clusters join only
when every face of one is within the threshold of every face of the other — because single
linkage walks a resemblance from one individual to another across a crowd of near-misses,
which is the failure this document exists to avoid rather than to reproduce. The default
threshold is SFace's own published 0.363.

## Who the reader says they photographed

`python -m harness.label --open` has a second mode, landed 2026-08-22, and it is where *a
stranger never counts* stops being a clause and becomes rows. One person at a time, the reader
says **friend** or **stranger** once, and it holds everywhere that person appears. Nothing
above is applied by it either: no stack moves and no cover moves.

**The verdict is the primary evidence and prominence is the proxy.** The reader's own words for
what they wanted to distinguish were *a stranger versus a person I wanted to photo*, and the
wording is the reasoning: the distinction is about **intent**, which no detector can see. A
stranger can be large and close and a friend small and distant, so a threshold fitted to
per-appearance boxes would encode the proxy permanently. That is why this mode exists at all
rather than a script that picks a floor.

**Ordered by how much the answer would change.** For each person, the number of stacks they
appear in *some* frames of and not others — a pure function over stored numbers, and the stack
sampler's least-decisive draw pointed at a different population. A person in every frame of
every stack they touch scores zero and is **never asked about**, because every frame of that
stack gains or loses them together and the rule above draws it identically either way. So the
two thousand persons are not two thousand questions, and stopping early is the expected
behaviour rather than an abandonment.

**Four answers, and the fourth is about the clustering.** `friend`, `stranger`, `unsure` — a
cluster the reader could not make out, which is an answer and not a skip — and `two-people`,
which says the cluster is obviously two individuals. That last one feeds neither the floor nor
the rule: it exists so that a clustering failure is **visible** instead of being forced into a
judgement about somebody, and so that the count of them is what justifies a ticket to split
them rather than an intuition. Acting on it is out of scope here.

**Keyed on the person and the clustering**, which is `stack_member`'s discipline one layer up.
A person is named by its least face, so re-clustering at another threshold can hand the same
name to a different set of faces; a verdict that did not say which clustering it was about
would be a judgement about a name rather than about somebody.

**The montage is frames, not face crops, and that is a schema consequence rather than a
choice.** `face` stores a box's *share of the frame's height* and its embedding and **no
coordinates** — see "The measurement is stored and the verdict is derived" above, which is the
decision that produced it — so there is nothing stored to crop from. Cropping would mean a
column and a re-run of the whole detection pass. What is drawn instead is the frames the faces
came from, several at once, each captioned with which face of that frame this is and how tall
it was. That is enough for the reader's stated question — a guest at a party against a stranger
in the background of the same party — and it is worth recording as the cost of storing a share
instead of a box.

## The floor is a pre-filter

`python -m harness.floor` is the measurement the clause above promised, and it is allowed to
answer **no**. It reports the friends' and the strangers' box shares separately, whether any
value separates them, each candidate floor's two error counts — kept apart, because a friend
left out shrinks a frame's people and can only *merge* while a stranger let in can only *split*
— and the persons each floor gets wrong.

**Where no floor separates them, the recommendation is to change nothing**: keep the floor
where it stands as a cheap pre-filter and let the friend-or-stranger verdict do the work. That
is not a fallback, it is the outcome this arrangement was designed to survive, and it follows
from the paragraph above: if the distinction is about intent then a proxy for size may simply
have nothing to say, and a report that returned the least-bad value would be dressing that
failure as an answer.

Its stack-change column is **how many stacks hold a frame whose people set differs** from the
standing floor's — not how many stacks would split. The nesting rule at the top of this
document is not implemented, so a count of splits is not available to be reported; what changes
is the *input* the rule reads, which is the tightest honest measure there is until it lands.

### What the answers settled

One sitting, 2026-08-23, over the head of the ordered list: **202 persons answered of the 1,731
worth asking about** — 83 strangers, 50 friends, 69 clusters called two people, and no `unsure`.
`python -m harness.floor` over those answers returned the result this arrangement was built to
survive: **no floor separates a stranger from a friend.**

The two populations are strongly *ordered* and still not separable. The friends are 1,584 boxes,
median 0.137 of the frame's height, quartiles 0.070/0.224, from 0.022 to 0.861; the strangers
are 471 boxes, median 0.015, quartiles 0.012/0.021, from 0.009 to 0.368. The medians are a
factor of nine apart and the tails cross anyway: 109 stranger boxes reach the smallest friend
box, and 1,395 friend boxes fall inside the largest stranger box. That is the *intent* argument
above arriving as numbers — a stranger can be large and close, and seven of them were.

**So the floor stays at 0.10 and stays a pre-filter**, and the per-person view is why it is
worth keeping rather than merely harmless. **76 of the 83 strangers have no box that reaches
0.10 at all**, so the floor disposes of 92% of them without being asked; only 7 carry a box
above it, and those 7 are 26 stack-touches, which is precisely the work the verdict exists to
do. The cost is 8 of the 50 friends, whose every box is under the floor and who are therefore
absent from every frame's people — and that failure can only *merge*, which is the direction
this document prefers everywhere else.

**Moving it is worse in both directions.** 0.04 has the fewest total errors — 82 friend boxes
out against 43 stranger boxes in, where 0.10 has 624 and 15 — but the two errors are not the
same failure, and totalling them is the mistake the report refuses to make: 0.04 nearly triples
the stranger boxes let in, and a stranger let in is the *split* the guard exists to prevent.
Raising it buys almost nothing: the last stranger box only clears at 0.38, by which point 1,404
friend boxes have gone with it.

**The sample is the head of an impact-ordered list and not a random draw**, so it over-represents
persons who appear in many stacks with large faces — which is to say it over-represents friends
in the box distribution. A later round is a different sample and not a continuation of this one.
The finding survives the bias in the direction that matters: a sample skewed towards large
friend boxes should make separation *easier*, and it did not appear.

### A third of the clusters were not one person

**69 of the 202 answered were flagged `two-people`** — the fourth answer, doing the job it was
put there for. At clustering threshold 0.363 that is a third of everything the reader was shown,
and it is a large enough count to be evidence rather than an impression. Those clusters carry 288
stack-touches between them, and their median box is 0.018 — the strangers' size, not the
friends' — which is the likely mechanism: at under two per cent of the frame's height there are
too few pixels for SFace to place a face anywhere meaningful, so the clustering merges whatever
lands in the same noise. The reader also reported clusters holding a person, several passers-by
*and* a hand, so what this column actually recorded includes detections that are not faces at
all.

It feeds neither the floor nor the rule, exactly as decided above. Acting on it is
[#71](https://github.com/chrisJuresh/photos/issues/71), which re-clusters from
the stored vectors at another threshold without re-detecting anything — `face` holds the
embedding and `face_person` the assignment, which is what makes the threshold a knob rather than
a rebuild.

### What the sweep settled: the threshold is the wrong knob

`python -m harness.recluster` is that re-cluster, priced rather than performed, and it lost
the way the floor did — **the threshold stays at 0.363 and no new population is written.**

**The sweep runs upwards, because the threshold is a similarity.** `face_person`'s threshold
is the cosine at or above which two faces are one person, so a *lower* value merges more.
[#71](https://github.com/chrisJuresh/photos/issues/71) asked for "a sweep of thresholds below
0.363", which is the direction that makes the failure worse; the sweep runs from 0.363 up to
0.600, and the standing row reproduces the stored assignment's 2,043 persons exactly, which is
the report's own check that it is pricing the clustering the pass performs.

**Both populations come apart together.** Over every judged cluster, 0.450 takes 64 of the 69
flagged clusters apart — and fragments 36 of the 50 friends the reader has said *are* one
person. There is no value where the first number is the larger: 0.400 buys 34 and breaks 16,
0.500 buys all 69 and breaks 47. A friend split in two is one individual reading as two
persons, which is a frame's people set that no longer nests and therefore a stack split
wrongly, so a value that does more of that than it repairs is not an improvement however many
clusters it splits. The two counts are reported apart and never totalled, for
`harness.floor`'s reason.

**And most of the failure is under the floor already.** Only **16 of the 69** flagged clusters
carry a box that reaches 0.10; the other 53 are in no frame's people whatever they hold, so no
clustering of them moves a stack. Their much-quoted 288 stack-touches are **27** counted over
the boxes that reach the floor. Scored over that population — the one the rule actually reads
— the knob is worse still: at 0.450 it takes 6 of those 16 apart and fragments 22 of the 42
friends that reach the floor, and at 0.600, the tightest value swept, 8 of the 16 are still one
person and 37 friends have come apart.

**So the third of the queue that was unanswerable was mostly a queue problem rather than a
clustering problem.** `harness.people.splits` orders the questions over every face a person
has, and the floor is applied nowhere in it: of the 1,731 persons the harness would ask about,
**279** have a box that reaches 0.10. The reader was shown sub-floor noise because the ordering
does not read the floor the rule will, which is why a third of what they were shown could not
be answered. Fixing that is [#73](https://github.com/chrisJuresh/photos/issues/73) and it is
not a clustering change at all.

**The size cut is the knob that works, and this is not the ticket that turns it.** Asked for
numbers rather than a change, the report clusters at 0.363 over only the faces whose stored
share reaches a cut. **0.02 is the largest cut that drops no box of any answered friend**: it
takes 9 flagged clusters out of the population entirely, splits 27 more, and brings the
population from 2,043 persons to 1,397. That is 36 of the 69 addressed for **2** fragmented
friends, where the threshold could not buy 34 without breaking 16 — because the flagged
clusters' median box is 0.018 against the friends' 0.137, and a size is the axis the two
populations actually separate on.

**Those 2 keep every box they had**, which is worth recording as a property of the method
rather than a rounding error: complete linkage's merge order depends on every cluster at once,
so dropping *another* person's small faces can move where this one's joins are made. A cut is
therefore not only a filter on the population — it is a different agglomeration — and the two
columns of that table can disagree. Acting on any of it means the cut joining `face_person`'s
key, and that is [#74](https://github.com/chrisJuresh/photos/issues/74) rather than a constant
edited in passing.

**The 202 answers stand.** Nothing was re-clustered, so no verdict was orphaned and the
sitting was not spent twice.

## The cover, and the surprise it introduces

**Most people first, then the existing rule among the frames tied at the top** — the sharpest
frame of the middle-exposure third. So the cover is the frame that tells you who is in the
stack, which is the point of it rather than a nicety: a stack is admissible precisely because
one of its members contains everybody in it, and that member is the one worth drawing.

The cover is still resolved **per query**, because which members are present is a property of
the view. The new consequence, recorded here before it surprises anybody: **narrowing the view
can now change *who* the cover shows**, and not only how it is exposed. A filter that hides the
`{A,B,C,D}` frame leaves `{A,B,C}` as the most-people member present, and the stack is drawn
with `D` missing while still holding every frame it held.

## Accepted failures

1. **The unreadable distinguishing person.** `{A,B,E}` with `E` too blurred to read merges into
   the `{A,B}` stack. The merge-preferring direction is deliberate; see above.
2. **The blown-out bracket end still scores zero.** ADR 0003's named geometric failure is
   untouched by this rule — one true stack drawn as two — and it is much less damaging at a
   loose strictness than it was at 20.
3. **The cover's identity changes with the view.** Two readers looking at the same stack
   through different filters can see different people on the tile. The alternative is a cover
   fixed in advance, which draws frames the view is not showing.

## How it will be judged

Against the reader's worked example, which is a test case verbatim, and against the
thirteen-frame set in "The one case no dial reaches" in
[ADR 0003](0003-stack-on-verified-match.md). The rule is one pure function over people sets —
no image, no database, no model — so both are assertions rather than a browsing session. #56
is where it lands, and it reports how many stacks it split and names them, so a surprising
result is diagnosable rather than merely visible.
