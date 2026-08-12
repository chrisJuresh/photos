# Stacking is vetoed by who is in the frame

**Status: accepted 2026-08-12, not yet implemented.** Extends
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
much left apart — which is what moved the floor to 85%. Loosening the dial makes the one
failure 0003 could not fix about three times worse: a thirteen-frame set the reader kept six
frames of and evicted seven from carries 50 of 160 wrongly-stacked mentions at strictness 20
and 54 at strictness 5, with the strongest wrong pair scoring 256 points. No threshold reaches
it, because the frames are the same scene from the same place and **the difference between the
ones the reader kept and the ones they evicted is who is in them.**

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
people. That member is the stack's cover by construction.

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
than chosen — #54 is that measurement — and until then it is provisional at roughly a tenth of
the frame's height.

**A stranger never counts.** A person the reader has marked as a stranger is somebody who
appears in their photographs without having been photographed, and is excluded from every
frame's people. Marked once per person, not once per appearance.

**No names.** The rule needs only *these two faces are one person*. Naming is a feature the
reader intends to add later, and the cluster list is deliberately the thing it will be built
on; nothing here waits for it.

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
