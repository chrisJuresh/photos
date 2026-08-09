# Decks rise into the row gap, not into the photograph

A tile that stands for a stack draws card edges above its photograph. **The
photograph does not move to make room for them: the tile's box grows upward into
the gap between rows, and that gap is widened uniformly for every row whether it
holds a stack or not.** The in-row gap is unchanged, the equation that turns an
aspect ratio into a tile width is untouched, and the strip is a constant height
at every stack size.

## Why not take the space from the photograph

The grid is justified rows: `packRows` solves one equation per row for the
height every tile in it shares, and `rowBoxes` solves the same equation for each
tile's width. Both are in `ui/src/lib/layout.js` and both were measured.

Giving a stacked tile its deck out of its own box means shortening its
photograph, and a row's height is shared — so either the whole row shortens
because one tile in it is a stack, or the stacked tile's photograph sits lower
than its neighbours'. The first makes row height depend on the *contents* of the
row rather than on its aspect ratios, which is a change to the packing equation
and to every number in `docs/grid-queries.md` that came out of it. The second
reads as broken alignment. A grid where some photographs start 12px lower than
the ones beside them does not read as depth; it reads as a bug, and the reader
has to work out that it is not one.

Growing the box upward keeps both edges: every photograph's top edge in a row is
`row.top`, stacked or not, and every bottom edge is `row.top + row.height`. The
photograph's box is what the aspect ratio sized, so the equation never sees the
deck.

## What it costs

Room above a row has to come from somewhere, and the single `GAP = 4` did not
leave it. It is split in two:

| | before | after |
|---|---|---|
| between tiles in a row | 4 | 4 |
| between rows | 4 | 16 (`GAP` + `DECK_H`) |

Uniformly, for every row, including the first — `nextTop` starts at `DECK_H`
rather than at 0. A gap widened only where a stack happens to be would make row
spacing depend on where the stacks fell, which is a worse defect than the density
it saves: ragged spacing is visible everywhere at once, and a few percent of
vertical density is visible nowhere.

The cost is that 12px: at the 220px target row height, about 5% of the vertical
run. On a 1080px window that is roughly a third of a row per screen.

## Why the strip is a constant height

Some stacks in this library are fifty frames. A deck whose height grew with the
count would be absurd at that end and invisible at the other, and the tile would
have become a chart of stack size.

So the strip is `DECK_H` at every size, and a deeper stack packs more, thinner,
tighter-spaced edges into the same space — which is what a thick deck actually
looks like seen edge-on. Six edges is the ceiling, reached at seven frames. Past
a handful the only true statement a tile can make is "many", and six edges say
exactly that. The exact count belongs in the overlay, which already has it;
a numeral printed on a photograph would make the grid look like a spreadsheet.

The taper — each card inset horizontally from the one in front — is capped per
card from both sides: an absolute 5px so a 1440px last-row tile does not splay,
and 2.5% of the tile's width so a fifty-frame stack on a narrow portrait tile
stays a stack instead of becoming a wedge.

## Consequences

- `layout.js` gains `DECK_H`, `ROW_GAP`, `DECK_MAX` and `deck(size, width)`, the
  pure function from stack size and tile width to card edges. It is exercised
  from `tests/test_client_deck.py` through the node adapter #13 opened, at size
  1, size 2, the saturation boundary and a fifty-frame stack.
- A tile element now holds its photograph in a `.tile-photo` box anchored to the
  bottom of the element, rather than being the photograph itself. The ThumbHash
  placeholder moves onto that box with the image, so the two are framed
  identically and nothing shifts when the image loads.
- The overlay's flight starts from `photoRect(tile)` — the photograph's rect, not
  the element's — because on a stacked tile they are no longer the same box.
- Decks are a stacking-mode feature. With stacking off the payload carries no
  `n`, every frame is already its own tile, and `deck` draws nothing. The row gap
  is still the wider one: it is a property of the grid, not of the switch.
- Triage's sheet is the same code and gets the wider row gap too. It never draws
  a deck — its payload has no `n` either — so the only change there is 12px of
  extra air between rows.
