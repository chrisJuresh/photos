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

**Cover**:
The single member of a stack the grid draws when the stack is closed. Chosen from
the members present in the current selection, never fixed in advance.
_Avoid_: representative (that word is taken — see below), thumbnail, hero, key photo

**Representative**:
The one file of a tile whose bytes are served and revealed. A property of the tile,
decided at build time, unrelated to stacking.
_Avoid_: cover, primary

### What gets grouped, and by what

**Stack**:
A run of tiles shot in one moment — consecutive captures from one camera within
the window. This is what a bracketed set or a burst becomes in the grid. Formed at
query time over whatever the current filters select, so it is never stored.
_Avoid_: group, cluster, burst, series, similarity stack

**Window**:
The gap in seconds below which two consecutive captures belong to the same stack.
The reader sets it; it is the only number stacking has.
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

### The two words that are not interchangeable

**Similar** is not a term in this domain and should not be used unqualified.
Two tiles can be *near-duplicates* (their pixels hash alike) or *stacked* (they
were shot moments apart), and these are measurably different populations: at the
shipped settings, near-duplicate detection finds about one seventh of the frames
stacking groups. Say which one is meant.
