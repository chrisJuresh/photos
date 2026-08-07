# Relationships and grouping

**State in v1:** built. Live use held; the `analyze` command is one of the commands that can
read source without the access-time guard.

**Depends on:** [storage-and-identity.md](storage-and-identity.md),
[preprocessing.md](preprocessing.md).

## What it does

Records how files relate to each other **without ever acting on it**. Nothing here authorises
a deletion, a merge, or a consolidation. Every relationship is evidence attached to two assets.

Four kinds of relationship, in decreasing strength:

1. **Exact identity** — same size, all three hashes, byte comparison. This is the only one that
   consolidates, and it belongs to [storage-and-identity.md](storage-and-identity.md).
2. **Orientation-normalized decoded equality** — different bytes, identical pixels after
   applying orientation. Common for re-encodes and metadata-only edits.
3. **Perceptual near-duplicate distance** — image hash distance, so visually similar but not
   identical frames are discoverable.
4. **Conservative RAW/JPEG companionship** — multi-signal, deliberately cautious. A RAW and a
   JPEG are grouped as one logical capture only when several signals agree.

Video gets sampled or optional decoded stream evidence rather than full-frame comparison.

## The rule that matters

A relationship is never a reason to delete anything. The interface can offer "these look the
same" and the user can reject one — but rejection is metadata
([invariants.md](invariants.md), rule 3), and the bytes of both stay in the vault forever.

Suspected multi-hash collisions are preserved as distinct evidence and never silently merged.

## Where the code is

| Concern | File |
|---|---|
| Decoded equality, perceptual distance, video stream evidence, RAW/JPEG grouping | `v1/media_vault/relations.py` (28 KB) |
| Perceptual hashing dependency | `ImageHash` 4.3.2 |
| Command | `media-vault analyze` — see [cli.md](cli.md) |

Line references: `relations.py:19` (source fallback without the atime guard),
`relations.py:484` (video subprocess handling).

## Data it owns

`relationships`, `raw_jpeg_groups`, `raw_jpeg_members`, `exact_groups`.

## HTTP surface

Read-only, on the legacy dashboard:

- `GET /api/relationships`
- `GET /api/duplicates`
- `GET /api/raw-jpeg-groups`
- `GET /api/raw-jpeg-groups/{group_id}`

The review application consumes RAW/JPEG groups indirectly — a logical photo entity in the
library is built from an accepted group. See [library.md](library.md).

## Known defects

| ID | Sev | Summary |
|---|---|---|
| `F08` | Critical | `analyze` can fall back to reading source files without applying the access-time guard |
| `F55` | High | Deep-video subprocess code can wait or communicate in an order that risks pipe deadlock or unbounded resource use on hostile or corrupt input |
| `F56` | High | Decoder and subprocess bounds and failure taxonomy are not uniformly enforced |
| `F33` | High | Logical-photo entity IDs and user state have no persisted lineage policy for later RAW/JPEG merges or splits |

## Reuse notes

Worth lifting conceptually:

- The strict separation between exact identity and every kind of similarity. This is the reason
  the vault is trustworthy, and it is recorded as a positive control (`P05`).
- Treating a relationship as evidence between two assets rather than as a group membership
  that implies a winner.
- Conservative multi-signal RAW/JPEG companionship rather than filename matching. Filename
  matching is the obvious approach and it is wrong often enough to matter.
- Preserving collision suspicion as data.

Do not lift as-is:

- The video path in `relations.py:484`. Pipe deadlock on corrupt input (`F55`) is a hang, not
  a crash, which makes it worse — a wedged worker holds a lease.
- The source-fallback read (`F08`). If a canonical object is unavailable, the safe answer is
  to fail the analysis, not to reach back into the immutable source.

An open question the review flagged and did not answer (`F33`): if two assets are later
discovered to be a RAW/JPEG pair after both already exist as separate logical photos with
their own favourites and ratings, what happens to that user state? `v1` has no policy. Worth
deciding before the library is rebuilt rather than after.
