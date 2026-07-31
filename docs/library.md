# Library

**State in v1:** built. The main screen of the application. Reject safeguards and selection
handling are incomplete; live use held.

**Depends on:** [preprocessing.md](preprocessing.md),
[relationships.md](relationships.md), [review-api.md](review-api.md),
[review-ui.md](review-ui.md).

## What it does

The browse-everything screen: a virtualized grid over the whole vault, with facets, filters,
multi-level sorting, an inspector, and the metadata actions (favourite, reject, rate, select).

### Logical photo entities

The unit of display is a **logical photo**, not a file:

- An accepted RAW/JPEG group is one entity, anchored by the RAW asset.
- A standalone asset is its own entity.
- Exact source duplicates already share one content asset, so they are one entity by
  construction.
- Stacks group entities, not individual representations or source paths.
- Entity-level user state is stable; the inspector still exposes asset- and source-level
  evidence underneath.

### The grid

- Virtualized and responsive, bounded memory, keyset paging.
- Persisted density and thumbnail-size slider; picks the smallest suitable precomputed
  derivative using stored dimensions and `srcset`.
- Film contact-sheet mode with monochrome chrome. Image colour is preserved by default; the
  grayscale toggle is display-only and labelled as such.
- Scroll position and saved view state restored across navigation and restart.
- Rejected entities hidden by default.
- Always-visible indicators for favourite, reject, a complementary RAW member, and additional
  members in the current stack.
- Hover and keyboard focus reveal favourite, reject, rating, select, inspect, cover/detail, and
  open-in-folder.

### Sorting and filtering

An extensible registry covering capture and import time, filename and path, favourite/reject/
rating state, quality and exposure, dimensions and file size, camera and lens, similarity and
stack order, exact and near-duplicate state, media kind and format, folder, date, equipment,
GPS, junk signals, and a stable seeded random order.

Ordered secondary sorts are supported with per-level direction. The design rule: common
indexed combinations answer immediately; arbitrary combinations are built as a background
materialized view rather than an expensive request-time sort. That is the
`materialized_view` job kind.

### The inspector

Complete persisted metadata, quality evidence, source history, canonical destination, exact
duplicates, RAW/JPEG evidence and ambiguity, relationships, warnings, derivative status, and
junk explanations. Actions are favourite, reject, rating, cover override, and selection — all
metadata-only and audited.

`Open in folder` resolves only a database-stored path that is present. It is not a general
path-execution API.

## Where the code is

| Concern | File |
|---|---|
| Catalog generation, facets, filters, entity assembly, user state | `v1/media_vault/review_library.py` (41 KB) |
| Route | `v1/review_ui/src/routes/library/+page.svelte` (658 lines) |
| Filters | `LibraryFilters.svelte` (182) |
| Grid | `LibraryGrid.svelte` (214) |
| Inspector | `LibraryInspector.svelte` (137) |
| Stack controls on this screen | `StackProfileControls.svelte` (100) |
| Scroll restoration | `v1/review_ui/src/lib/scroll-state.ts` |

Line references: `review_api.py:2889` (library reject path),
`routes/library/+page.svelte:517` (bare-key shortcuts).

## Data it owns

`photo_entities`, `photo_entity_members`, `photo_user_state`, `photo_user_state_events`,
`materialized_views`, `materialized_view_items`, `facet_rollups`.

Job kind: `materialized_view`.

## HTTP surface

| Method | Path |
|---|---|
| GET | `/api/v1/library` |
| GET | `/api/v1/library/entities/{entity_id}` |
| GET | `/api/v1/library/entities/{entity_id}/derivatives/{long_edge}` |
| GET | `/api/v1/library/facets/{facet_name}` |
| PUT | `/api/v1/library/state` |
| POST | `/api/v1/library/prepare` |
| POST | `/api/v1/library/entities/{entity_id}/open-folder` |
| POST | `/api/v1/library/bulk-reject` |
| POST | `/api/v1/library/bulk-reject/undo` |

Facet names used by the UI: `media_kind`, `format`, `camera`, `lens`, `folder`.

## Known defects

| ID | Sev | Summary |
|---|---|---|
| `F59` | Critical | Generic Library multi-reject can affect hundreds of entities without routing through the favourite and large-selection safeguards |
| `F58` | Critical | Inspector confirmation Booleans can remain checked when the entity changes |
| `F32` | Critical | Catalog generations are not reliably invalidated when new assets or prepared outputs arrive |
| `F60` | High | Selected entities can remain active but hidden after filters change |
| `F61` | High | Parent error handling can swallow a failed action while children clear selection or undo history |
| `F62` | High | Bulk undo survives only in component memory |
| `F65` | High | Cursors are not fully consumed, facets can represent only the first slice, detail arrays are silently capped |
| `F68` | High | Variable-height and mobile virtualization tests are disabled or too shallow; fixed row estimates can break keyboard and scroll targeting |
| `F33` | High | Entity IDs and user state have no lineage policy for later RAW/JPEG merges or splits |
| `F63` | Medium | Bare global `F`/`X`/`I` keys mutate favourite, reject, and inspect state with no modifier or deliberately focused grid context |
| `F70` | Medium | Scroll restoration stores a raw offset rather than a visible-entity anchor |
| `F73` | Medium | Some catalog paths use `fetchall` or full sorting that will not stay bounded at full-vault scale |

## Reuse notes

Worth lifting conceptually:

- The logical-photo entity as the unit of display, with asset and source evidence available
  underneath. It is the right abstraction and it is what makes RAW+JPEG bearable.
- Entity-level user state that survives changes in the underlying representation.
- Indexed-fast versus materialized-slow as an explicit split, rather than hoping an arbitrary
  sort is fast.
- Hiding rejected by default while keeping the bytes.
- Facet rollups computed in the background.
- Display-only grayscale that is clearly labelled — a photo browser that silently alters
  colour is lying to you.

Do not lift as-is:

- The reject paths. `F59` is critical and it is the exact failure mode this application exists
  to prevent: a bulk action on a large selection that skips the safeguards written for bulk
  actions. There must be one reject path, and every caller goes through it.
- Bare single-key shortcuts that mutate state (`F63`). `X` for reject with no modifier and no
  focused-grid requirement is a mis-keypress away from a mistake.
- In-memory undo (`F62`). Undo for a destructive-feeling action needs a durable action ID.
- Selection that survives becoming invisible (`F60`).
