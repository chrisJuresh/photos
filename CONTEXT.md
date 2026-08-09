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
The single member of a stack the grid draws when the stack is closed — the sharpest
frame of its middle-exposure third. Chosen from the members present in the current
view, never fixed in advance — so narrowing the view can change which frame a stack
draws without changing what the stack holds. It is the first frame of its stack only
about a quarter of the time, which is why the overlay marks which one it was.
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
selection is metadata that never becomes a file operation. It survives scrolling, a
resize, and a change to the filters or the sort — those change the *view*, not the
grouping. Only the knobs that regroup empty it: the window, the strictness and the
linkage, because after one of those the stacks it named no longer exist.
_Avoid_: marked, checked, ticked, chosen, tagged, flagged

**View**:
What the filters and the sort have chosen to put on screen. The word *selection* used to
mean this and now means the tiles the reader picked by hand — see above. A stack is a
property of the photographs and not of the view, so narrowing the view removes frames
from a stack and never breaks one in two.
_Avoid_: selection, result set, page

**Representative**:
The one file of a tile whose bytes are served and revealed. A property of the tile,
decided at build time, unrelated to stacking.
_Avoid_: cover, primary

### What gets grouped, and by what

> **Stack**, **Match**, **Linkage**, **Window**, **Selected** and **View** below record
> the model decided in `docs/adr/0003-stack-on-verified-match.md`, which is not built
> yet. Until it is, the code groups by capture time alone and a filter splits a stack —
> `docs/grid-queries.md` describes what actually runs.

**Stack**:
The same photograph, taken more than once — frames verified to show the same picture,
within one stretch of shooting. This is what an exposure bracket becomes, and what the
same picture fired five times over with a handheld reposition between presses becomes.
Membership is a property of the photographs, so it holds however the view is narrowed.
A tile whose date came from the filesystem rather than from EXIF never joins one: a copy
date is not when the photograph was taken.
_Avoid_: group, cluster, burst, series, similarity stack

**Match**:
How strongly two frames agree that they are the same picture — the count of distinctive
points that line up between them under one transform. It survives a change of exposure
and a handheld reposition, and collapses when the camera turns to face something else.
Computed once, per pair, and stored; **strictness** is the reader's threshold on it.
_Avoid_: similarity, score, distance, confidence

**Fingerprint**:
One vector per tile, computed from its substrate, that says roughly what the frame shows.
It is the cheap screen in front of the match: two frames whose fingerprints disagree could
not be the same picture and are never checked properly, and everything that survives is
decided by the match rather than by this. High recall is what it is for; it is not evidence
on its own, and no reader-facing knob is a threshold on it. Stored under the identity of the
model that produced it, so two models are two populations and never one.
_Avoid_: embedding (that is the implementation), signature, descriptor, hash, match

**Linkage**:
How much has to match before frames are one stack. *Complete* — every pair inside the
stack — is the default, and it is what makes "two unrelated photographs never share a
stack" structurally true rather than merely likely. *Neighbour* asks only that each
frame match the one before it, which is cheaper and lets a stack walk from one subject
to another in small steps.
_Avoid_: clustering, chaining, closure

**Window**:
The gap in seconds at or below which two consecutive captures *may* belong to one
stack. Necessary, never sufficient: it fences a stack to one stretch of shooting and
keeps stacks contiguous in capture order, and the match decides everything inside the
fence. It stopped being the only number stacking has — see `docs/adr/0003`.
_Avoid_: threshold, tolerance, distance, sensitivity

**Pair**:
A tile whose files are a RAW and its JPEG. Collapsed permanently at build time, and
not a stack.
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
