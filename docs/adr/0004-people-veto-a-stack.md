# Stacking is vetoed by who is in the frame

**Status: accepted 2026-08-12, implemented 2026-09-02** — the rule, the key column and the
cover are in `photolib.membership` and `photolib.browse`; see "What landed, and what it left
standing" below. The evidence it reads landed first: "What the pass records" and "Who the
reader says they photographed", 2026-08-22. Extends
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
clustering, keyed by the threshold **and by the size cut** (migration 013) as `stack_member`
is keyed by strictness and linkage, so another value of either is another population and
re-clustering never re-runs the detector.

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

**Counted over the faces that reach the floor.** A face under it is in no frame's people, so
a person whose every box is under it cannot move a stack whichever way the reader answers.
Counting the splits over every face therefore fills the queue with persons the floor has
already disposed of — 1,731 questions where a count at the floor leaves 279, which is what the
reader's first sitting was mostly spent on. So the frames a split is counted over are the
frames of the above-floor faces, and a person with none scores zero and is never asked about,
which is the rule above and not a new one. **It is not only a pruning.** Somebody in every
frame of a stack and above the floor in one of them is a frame's people set that differs across
it, so the two populations are not nested and the count at the floor is the question rather
than a subset of it. **The montage is not filtered**: a small face is still something to
recognise somebody by, and so is the tie-break on how many faces there are, so only the splits
read the floor. It is `photolib.people.FLOOR`, read and never copied, so moving it moves the
queue and no stored row changes — which is what the share was stored for.

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
clustering problem.** `harness.people.splits` ordered the questions over every face a person
had, and the floor was applied nowhere in it: it would ask about **1,731** persons where the
same count over the boxes that reach 0.10 leaves **279**. The reader was shown sub-floor noise
because the ordering did not read the floor the rule reads, which is why a third of what they
were shown could not be answered. That was
[#73](https://github.com/chrisJuresh/photos/issues/73), which has landed: the splits are
counted over the above-floor faces now, so 279 is the queue and the montage is unchanged. It
was not a clustering change at all, and the numbers above are measured at a size cut of 0.00
and will move if #74 lands.

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

### What the cut settled: 0.02, and in the key

[#74](https://github.com/chrisJuresh/photos/issues/74) is that ticket and it landed.
`photolib.people.CUT` is provisional at 0.02 and the pass clusters only the faces whose
stored share reaches it; `--cut` points it at another value. The reason is the table above
and nothing new: the largest cut that drops no box of any answered friend, addressing 36 of
the 69 flagged clusters for 2 fragmented friends, where no threshold could buy 34 without
breaking 16. The 0.02 population is not in the catalog yet — the rows there are the uncut
ones, stamped 0.0 by the migration — and writing it is a run of the pass that examines
nothing: 5,826 faces in 1,397 persons, on the table's own count.

**It is a column and not a `WHERE`**, which is the one thing about it that is not a
restatement of the measurement. `FLOOR` can be moved by re-reading rows because nothing
stored is derived from it. A cut cannot, because the clustering is the thing it changes: two
faces merged because a third small one sat between them stay merged whatever a later reader
filters, and complete linkage's merge order depends on every cluster at once, so a cut is a
different agglomeration and not a subset of an old one. Migration 013 grows `face_person`'s
primary key by it and stamps the rows already there 0.0 — `photolib.people.NO_CUT`, no cut, a
real value of the column — so the population every answer in `labels.sqlite3` was given about
stays readable as itself. `harness.floor` and `harness.recluster` read that population by
name, for that reason.

**The cut is not the floor**, and they are deliberately two constants at provisionally
similar values. `FLOOR` decides whether a person is in a frame's *people*; the cut decides
whether a face is evidence about *who somebody is*. The same report prices 0.10 here at 624
of the friends' boxes and 0.02 at none.

**A face under the cut keeps its row.** Nothing re-detects, nothing is deleted, and the share
and the vector stay where they were — the face simply has no person at that cut, which is
`face_person`'s existing shape. So a cut costs a matrix multiply and not a pass.

**The answers still stand.** `person_verdict` was *not* keyed by the cut when #74 landed, and
that asymmetry was deliberate: a verdict about a person carries across a re-clustering so that
a sitting is not spent twice, which is the whole reason the measurement above could be made
from labels given before the cut existed.

**But that carry-across cut both ways**, which #74 left open and
[#78](https://github.com/chrisJuresh/photos/issues/78) has now settled — before the next
sitting, as it had to be. A person is named by its least face, so the same name can survive a
cut holding fewer faces; answering about that one *replaced* the earlier answer, because the
key could not tell the two apart, and `harness.floor` and `harness.recluster` read the uncut
population, so the newer answer would have been scored against boxes it was never given about.
Nothing had been answered at 0.02, so nothing was ever wrong in the file.

### What a verdict is about, and what an older one is evidence of

`person_verdict` is keyed by the cut. A labels file written before that column is widened when
the harness opens it and its rows are carried forward as `NO_CUT` — a real value that names the
population they were given about — so nothing the reader has said is lost or re-asked for a
column.

**An older answer is not thrown away and is not silently inherited either.** Which of the two it
is turns on the faces and never on the name: `harness.people.unchanged` reads `face_person` at
both cuts and names the clusters that came through holding exactly the faces they had. Those are
the faces the reader judged, so their answer is a judgement about this population as well, and
they are not asked again. Every other cluster of the same name reads as **unjudged with a
prior** — the older answer is shown beside the question and counted by nothing, which is the
shape an unjudged person's `friend` already has and is there for the same reason: an answer
about a different set of faces is evidence and not a judgement.

That leaves `harness.floor` and `harness.recluster` exactly where they were. Both read `NO_CUT`
by name, and at `NO_CUT` there is no population behind the answers for them to have been
inherited from, so every input either report has is one the reader gave about the population it
reads.

### What the downward sweep settled: the rule needs a guard, not a looser clustering

`python -m harness.nesting` is [#91](https://github.com/chrisJuresh/photos/issues/91), and it
asked the question the two reports above could not. Both price a knob against the reader's
answers about *persons*; neither can ask what the rule at the top of this document would do to
a *stack*, because the rule reads a frame's people and they stop at a person's boxes. So the
column this report brings is **the stacks the nesting rule would split where every frame holds
somebody** — computed from stored rows, by clustering the vectors, taking each frame's people
at `photolib.people.FLOOR`, walking `stack_member` at `photolib.browse.STACK_SETTING` and
asking nesting. The floor and the setting are read and never copied.

**Why the qualifier is the whole of it.** Priced against the shipped grid — strictness 10 with
the chain — the rule would split **94** of the 3,984 multi-frame stacks, holding **707** frames
between them. Only **53** of the 94 are stacks where every frame holds somebody; the other 41
hold a frame with nobody read in it. Presence is a body's answer and no value of the person
threshold moves a body row, so 41 of the 94 are fixed whatever the clustering does, and a sweep
scored on all 94 would flatter every value equally. The nobody clause is therefore deliberately
not simulated, and the 53 are the only part of the split count a threshold reaches.

**And the rule is a no-op on 91% of stacks.** Only **346** of the 3,984 hold anybody at all at
the floor. Whatever the rule costs or buys is concentrated in that population.

**The sweep runs both ways now.** "What the sweep settled" above ran upwards, because *coming
apart* was what it was measuring, and the direction that rejoins one human read as two is
looser — so the finding that the threshold is the wrong knob had evidence for one direction
only. It has evidence for both now, and it says the same thing.

| threshold | persons | split | every frame holds somebody | bought back | lost | friends contested | …at the floor |
|---|---|---|---|---|---|---|---|
| 0.100 | 574 | 76 | **39** | 14 | 0 | 32 | 28 |
| 0.200 | 989 | 81 | 44 | 9 | 0 | 23 | 19 |
| 0.250 | 1,262 | 84 | 45 | 8 | 0 | 17 | 13 |
| 0.300 | 1,575 | 88 | 49 | 4 | 0 | 9 | 7 |
| 0.320 | 1,725 | 92 | 52 | 1 | 0 | 6 | 4 |
| 0.340 | 1,874 | 92 | 52 | 1 | 0 | 4 | 2 |
| **0.363** | 2,043 | 94 | **53** | — | — | — | — |
| 0.400 | 2,375 | 95 | 54 | 0 | 1 | 0 | 0 |
| 0.450 | 2,896 | 97 | 54 | 0 | 1 | 0 | 0 |

The cost is carried over both of the populations "What the sweep settled" scores over — every
judged cluster, and the ones carrying a box that reaches the floor — and the recommendation
reads the second, because a person whose every box is under the floor is in no frame's people
before a join or after.

**Tightening is worse, which is the half that was already expected.** 0.400 and 0.450 each
split *more* stacks and each lose one the standing value held together. That is the upward
direction scored on this subject for the first time, and it agrees with what the flagged
clusters said about it.

**The subject survives the knob.** At 0.100, where the 2,043 persons have become 574, **39 of
the 53 still split.** So at most 14 of them were ever the clustering's doing, and the 53 is a
ceiling on what any threshold could buy rather than a count of clustering errors: the rest are
the rule reading two sets of people because two sets of people were read, and no cosine changes
that.

**The reader's own case turns at 0.300, and it is not a bargain.** The thirteen-frame run
`[18072],[21747,21009],[2905,…,13141]` — stack `665b42ee…`, twelve faces on one person and
`15835` on its own at a box 0.208 of the frame's height — is one of the 53, and it stops
splitting at 0.300 and not at 0.320. The report names it there, with the two other stacks that
turn at the same value, so a reader with a run in mind finds theirs rather than being told.
Buying it takes 468 persons off the population — 2,043 to 1,575 — for four of the 53 stacks,
and leaves nine of the reader's 202 answers sharing a cluster with another of their answers,
seven of them at the floor.

**No value swept puts a friend and a stranger inside one person.** That is the one
contradiction these answers can show, and none of them showed it, down to 0.100. It is not the
same as loosening being free: the reader was never asked whether two clusters are the same
human — `person_verdict` has no such answer — so two friends merging is **unpriced rather than
priced at nothing**, and the `friends contested` column counts answers put in question and not
mistakes made. The report says so where it prints the column, because a zero read as a licence
would be an absence of evidence dressed as evidence of absence.

**The cut changes nothing here.** Clustering at 0.363 over only the faces reaching
`photolib.people.CUT` gives 1,397 persons and **the same 94 splits and the same 53**, and at the
loosest value swept it gives 402 persons, 75 and 39 against the uncut 76 and 39. So the uncut
population the reader's answers were given about is not answering a different question from the
one the pass would ask, and the sweep above stands for both. It is priced rather than assumed,
at both ends of the range, and the report prints the difference.

**So 0.363 stands, for the third time, and no new population was written.** The 202 answers are
intact and nothing was re-clustered. What this leaves for
[#56](https://github.com/chrisJuresh/photos/issues/56) is that the nesting rule needs a **guard
on the rule** rather than a different clustering under it — the two candidates the evidence
points at being the reader's own *these two clusters are one person* answer, which does not
exist yet and is [#88](https://github.com/chrisJuresh/photos/issues/88)'s user story 11, and a
guard on how much of a run a person has to appear in before their absence may veto it. This
report does not choose between them; it establishes that the person threshold is not one of
them.

## What landed, and what it left standing

[#56](https://github.com/chrisJuresh/photos/issues/56) is the rule arriving, and it arrived
**as written** — the guard the section above says it needs was not invented on the way in.
That is deliberate and it is the whole shape of this landing: the veto is a keyed population
beside the one the grid already had, so what the sweep predicted is now something the reader
can look at rather than a table in this document.

**`photolib.membership.regroup(members, who)` is the rule and the whole of it.** One pure
function from a Match-proposed stack and a mapping of frames to people, to that stack
partitioned. Nesting, the greedy split, the capture-order tie-break and the nobody clause
all live inside it; there is no image, no database and no model anywhere in it, so the
worked example above is a test case verbatim and so is every clause under "The rule". It is
applied after the walk and before anything is stored, which keeps
`migrations/011_stack_member.sql`'s argument whole: the grid reads the answer and no query
re-derives it.

**A frame's people are three states and not two.** A set of person names is what was read
there; `None` is the body detector saying nobody is in the frame, which is the nobody
clause's subject; and a frame the people pass never examined is **absent from the mapping**
and exempt from both halves. That third state is what makes an incomplete people pass
degrade to the grid without the rule, frame by frame, rather than to a split — and the pass
counts those frames, because a grid that quietly stopped vetoing is the failure that would
otherwise be silent. The empty set is somebody with no readable face and nests into
anything, which is the distinction the two detectors exist for.

**The people identity is a column of `stack_member`'s key** — migration 014 — holding
`face_person`'s whole key as one value, `'<model>/<version>/<threshold>/<cut>'`. All four,
because all four decide which persons a frame has; three would name three of the four things
that decided the answer, which is what #55's blocker on that ticket said and what migration
013 established. **The rows already there are stamped `'none'`**, a real value saying *no
people rule applied*, so the grid the reader had before this is still in the table and still
drawable, and `python -m photolib.membership --no-people` writes more of it. `--no-people`
is a flag where `--ceiling` is not, and the difference is the reason: a fence cannot be
moved without reading pairs nothing checked, and a rule can simply be not applied.

**The floor and the strangers are read when the pass runs and are not in that key.** The
floor can be moved by re-reading `face.share`, which is what the share was stored for; a
verdict is the reader's answer rather than a population, and one more of them is not a
different clustering. What that costs is stated where it is paid: the pass places a frame
once per key, so re-reading the rule after an answer moved is a `DELETE` of the population
and a re-run, and the pass prints that line the way it already prints one for a hole in the
Match rows. Naming them in the key instead would make every answer a fifth population of a
table that would then never be re-read at all.

**The strangers are the one thing `photolib` reads out of `labels.sqlite3`** — one column of
one table, read-only, and tolerant of the file not being there. An absent labels file, a
file written before the people mode existed, and a reader who has answered nothing are all
*no strangers*, which is the grid this document says the rule produces on its own. Only the
verdicts given about the clustering in hand are read: an answer about another population is
evidence and not a judgement, so the carry-across `harness.people.unchanged` performs for
the harness is deliberately not performed here, and the pass reports the count so that a
reader whose answers are all about another cut sees zero rather than assuming otherwise.

**The pass reports what the veto did**, which is "How it will be judged" made operational:
how many of the walk's stacks it split, how many frames left the stack they were proposed
in, and the name of every split stack. The thirteen-frame set is checkable against that list
rather than by browsing.

**What the sweep predicted is unchanged by any of this**, and is the number to read the
first run against: 94 of 3,984 multi-frame stacks split, 53 of them with every frame holding
somebody, and the reader's own thirteen-frame run among the 53. If the first run says
something else, the clustering or the floor moved and not the rule.

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

**It is additive, and the tests written before it are what prove that.** `browse.cover`
takes `(id, luminance, sharpness, people)` and filters to the members holding the most
people before the exposure rule runs at all. A bracket's frames hold the same people, so the
count is constant, nothing is filtered out and the rule is the one it was — every assertion
made about the exposure rule still holds with the count held constant, which is why none of
them was rewritten. A stack no frame of which holds anybody is the same case by the same
arithmetic.

**The count the cover ranks on is not quite the set the veto read**, and the difference is
the strangers. It is read from the people tables at the clustering the assignment's own key
names and above the same floor, but the reader's stranger verdicts live in `labels.sqlite3`
and the website does not open that file — it reads the catalog and the triage state and
nothing else. The cost is bounded by what the count is for: it ranks the members of a stack
the veto has already decided, so a stranger can tip *which* frame is drawn and never which
frames are in it. Closing it would mean the grid opening a third database in a request
handler, or storing a count the floor exists to keep read-time, and neither is worth a
tie-break.

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
