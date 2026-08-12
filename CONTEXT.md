# photos

A local-first photo and video vault: one immutable store of original media, and a
website that browses it. This glossary fixes the words for the things that get
grouped, because almost everything here is a group of something else and the
words for them have collided repeatedly.

## Language

### What is on screen

**Tile**:
One entry in the grid — a `photo` row. Already a group: a RAW and its
in-camera JPEG are one tile, decided once at build time and never visible as two.
_Avoid_: photo (ambiguous — a tile, a file, or the thing that was photographed),
image, asset

**File**:
One immutable object in the vault, identified by the SHA-256 of its bytes. A tile
has one or more.
_Avoid_: photo, asset, object

**Overlay**:
What a tile expands into: its frames over a blurred grid, all of them at once — one
photograph filling the pane where the tile stands alone. Every tile expands, so the
overlay is where a photograph is looked at and where revealing it in Explorer is asked
for. The reader walks the view from inside it, tile to tile in the current sort,
and the grid scrolls underneath to whichever tile the pane is drawing.
_Avoid_: lightbox, modal, viewer, expanded stack

**Frame**:
One member of what the overlay draws — the tile's own photograph when it stands alone,
and one of the stack's when it does not. A frame is a tile, seen from inside an open
one; the word exists because "the tiles of a tile" reads as nonsense.
_Avoid_: slide, item, member

**Cover**:
The single member of a stack the grid draws when the stack is closed — the member with the
most people in it, and among the members tied at the top the sharpest frame of its
middle-exposure third. It is the frame that shows *who* is in the stack, which is the point
of it rather than a nicety: a stack holds one subject, so the member that contains everybody
in it is the one worth drawing. Chosen from the members present in the current view, never
fixed in advance — so narrowing the view can change which frame a stack draws without
changing what the stack holds, and can change who the cover shows and not only how it is
exposed. It is the first frame of its stack only about a quarter of the time, which is why
the overlay marks which one it was.
_Avoid_: representative (that word is taken — see below), thumbnail, hero, key photo

**Deck**:
The card edges a tile draws above its photograph when it stands for a stack of two
or more — a deck of cards seen from slightly above. It says *that* there is depth,
never how much: the strip is one constant height at every size, and the edges in it
saturate at six. The count is the overlay's to give. Rises into the gap between
rows, so the photograph never moves — see
`docs/adr/0002-decks-rise-into-the-row-gap.md`.
_Avoid_: badge, stack indicator, count, pile

**Selected**:
A tile the reader has picked by hand, in select mode — by clicking it, by shift-clicking
to extend from the last tile touched, or by sweeping a marquee over a run of them. The
selected set is evidence: it is what the Copy button puts on the clipboard, as the ids
grouped the way the grid grouped them. Selecting a cover selects its whole stack, and a
selection is metadata that never becomes a file operation. A pick is keyed on the stack's
**name**, not on the cover that stands for it, so a set survives scrolling, a resize, a
filter and a sort: those change the *view*, and the name is a property of the photographs.
What each pick holds is re-read from the pages of the new view as they arrive, so a stack
the filter shrank stays selected holding less. A pick the new view has not shown keeps
what it last held — the sheet pages as the reader scrolls, so "further down this view" and
"not in this view at all" look alike until the view runs out, and a set that dropped the
second would drop the first with it. Only a **regrouping** empties a set — the toggle, the
strictness or the linkage — because only then do the stacks the selection named stop
existing, and that is the one change the Stacks panel warns about first.
_Avoid_: marked, checked, ticked, chosen, tagged, flagged

**View**:
What the filters and the sort have chosen to put on screen. The word *selection* used to
mean this and now means the tiles the reader picked by hand — see above. A stack is a
property of the photographs and not of the view, so narrowing the view removes frames
from a stack and never breaks one in two.
_Avoid_: selection, result set, page

**Representative**:
The one file of a tile whose bytes are served. A property of the tile, decided at
build time, unrelated to stacking. It is no longer the one file *revealed*: a
reveal opens every member, so a RAW+JPEG pair is two Explorer windows and which
of the two the build rule picked stops mattering.
_Avoid_: cover, primary

### What gets grouped, and by what

**Stack**:
The photographs of one subject you only need to see one of. This is what an exposure bracket
becomes, and what the same subject shot from several angles across one stretch of shooting
becomes: the composition need not match, and the subject may move between frames. What
separates two stacks is the subject and not the framing — a landscape and the same landscape
with a friend standing in it are two, while that friend two steps along and differently
framed is one. Membership is a property of the photographs, so it holds however the view is
narrowed. A tile whose date came from the filesystem rather than from EXIF never joins one: a
copy date is not when the photograph was taken.

A stack's **name** is its earliest member's sha256 — decided by the membership pass,
stored, and carried to the client as a tile's `k`. It is the handle on a stack that the
view cannot move, where the cover can and the ids are reassigned by every rebuild. It is
total: a frame that shot alone is a stack of one named by itself, and with stacking off a
tile stands for itself and its own hash is its name.
_Avoid_: group, cluster, burst, series, similarity stack, "the same photograph taken more
than once" (that was the old rule, and `docs/adr/0003` records why the reader replaced it);
and for the name: id, key, hash

**Person**:
One human, as face clustering finds them — a cluster of faces the pass decided are the same
individual, with no name attached. A frame's **people** are the persons whose faces were
confidently read in it; a face that could not be read is not a person and simply does not
count.
_Avoid_: face, identity, subject, individual

**Stranger**:
A person the reader has marked as one — somebody who appears in their photographs without
having been photographed. A stranger never counts towards a frame's people, so a tourist
walking through the back of a burst cannot break it. Marked once per person and not per
appearance.
_Avoid_: bystander, background person, extra

**Match**:
How strongly two frames agree that they are the same picture — the count of distinctive
points that line up between them under one transform. It survives a change of exposure
and a handheld reposition, and collapses when the camera turns to face something else.
Computed once, per pair, and stored; **strictness** is the reader's threshold on it, and
**linkage** is how many members of a stack a frame has to clear it against. Both were
settled from the reader's own labels — see `docs/adr/0003`, "What the labels settled".
It is the evidence stacking is built on rather than the whole of the rule: who is in the
frames sits on top of it and can veto a stack the Match proposed, never propose one —
see `docs/adr/0004`.
_Avoid_: similarity, score, distance, confidence

**Fingerprint**:
One vector per tile, computed from its substrate, that says roughly what the frame shows.
It is the cheap screen in front of the match: two frames whose fingerprints disagree could
not be the same picture and are never checked properly, and everything that survives is
decided by the match rather than by this. High recall is what it is for; it is not evidence
on its own, and no reader-facing knob is a threshold on it. Stored under the identity of the
model that produced it, so two models are two populations and never one. *Embedding* is the
implementation and belongs where the model is being talked about — `photolib/fingerprints.py`
says it and should; everywhere the thing itself is meant, it is a fingerprint.
_Avoid_: signature, descriptor, hash, match

**Linkage**:
How much has to match before frames are one stack. *Matches most members* — strictly more
than half of them, so a tie is not most — is the default, settled from the reader's labels
in `docs/adr/0003`. *Complete* is every pair inside the stack, which makes "two unrelated
photographs never share a stack" structurally true rather than merely likely, and cannot
express a burst holding one pair the geometry agrees nothing about. *Neighbour* asks only
that each frame match the one before it, which is cheaper and lets a stack walk from one
subject to another in small steps — measured and rejected, not merely feared. It is a knob
in the Stacks panel beside **strictness**, and both offer the assignments
`python -m photolib.membership` has written rather than every value the rule allows: a
setting is a choice of which stored grouping to read.
_Avoid_: clustering, chaining, closure

**Window**:
The gap in seconds at or below which two consecutive captures *may* belong to one
stack. Necessary, never sufficient: it fences a stack to one stretch of shooting and
keeps stacks contiguous in capture order, and the match decides everything inside the
fence. It stopped being the only number stacking has — see `docs/adr/0003` — and then
stopped being a number a reader sets: at 3600s it is the fence the stored Matches were
computed behind, so moving it would ask about pairs nothing ever checked. It is the one
part of a setting the Stacks panel does not offer, and `docs/adr/0003` records that this
is settled rather than pending.
_Avoid_: threshold, tolerance, distance, sensitivity

**Candidate**:
Two frames the window has not ruled out — a pair inside one run of consecutive
same-camera captures. Every pair of a run and not only the adjacent ones, because a
frame owes a verdict against every member of a stack and not only against the one
before it — under complete linkage, which made a stack a clique, and equally under
*matches most members*, which `docs/adr/0003` settled on and which still counts every
member. It is the pair set the offline match pass
owes a verdict on, and it is enumerated over every EXIF-dated tile rather than over
what a filter has left on screen, because membership does not depend on the view.
A candidate the fingerprint rejects is **screened out** — never plausibly the same
picture, and never checked properly; the rest are **survivors**, which is a statement
about what is worth checking and never about whether the two frames match.
_Avoid_: pair (that is a RAW and its JPEG, below), comparison, edge

**Pair**:
A tile whose files are a RAW and its JPEG. Collapsed permanently at build time, and
not a stack. A **candidate pair** is the other thing entirely, and the word is only
safe there in full.
_Avoid_: duplicate, sidecar, RAW+JPEG group

**Near-duplicate**:
Two files whose perceptual hashes are within the stored Hamming threshold — in
practice, the same frame twice. Recorded, filterable, and it collapses nothing.
Not a measure of whether two photographs look alike to a person. The grid's filter
for it is labelled **Identical frames**, because that is what the shipped threshold
finds and a reader should not have to know the word "perceptual" to use it.
_Avoid_: similar, duplicate, match

### The word that is not a term

**Similar** is not a term in this domain and should not be used unqualified. Two tiles
can be *near-duplicates* — their pixels hash alike, which is a claim about two files —
or they can *match*, which is a claim that they show the same picture. These are not the
same population and neither implies the other: on the labelled examples the perceptual
hash put larger distances inside a stack the reader kept whole than between the frames
the reader threw out of it. Say which one is meant.
`docs/adr/0001` is why the hash is not the grouping, and `docs/adr/0003` is why it is not
the arbiter either.
