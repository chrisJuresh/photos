# Organize views

**State in v1:** four projections built. Paging and map rendering incomplete; live use held.

**Depends on:** [preprocessing.md](preprocessing.md), [library.md](library.md).

## What it does

Four alternative ways into the same library, each backed by a precomputed projection rather
than a request-time aggregation. All four are read-only navigation — nothing here changes a
photo's state.

### Calendar

Materialized capture-date buckets with counts. Capture-time source and ambiguity are preserved,
and unknown or ambiguous times get their own explicit buckets rather than being guessed into a
date. A photo with no reliable capture time appears under "unknown", not under the file's mtime.

### Folder hierarchy

Source-root and recursive folder nodes with both logical-entity and source-occurrence counts.
Defaults to the logical-photo view so exact duplicates do not multiply the apparent photo
count. An explicit occurrence mode exists for auditing every preserved source path — useful
when you want to know where a photo came from rather than how many photos there are.

### Camera and lens

Normalized and raw equipment values with counts and drill-down projections. Unknown values stay
browsable rather than being filtered out.

### Private offline map

A compact offline world basemap is bundled in the app. **No external tile or network requests.**
Clusters are materialized by zoom and geohash level; the frontend renders and navigates
persisted clusters only. Pan, zoom, cluster drill-down, linked library filters,
unknown-location handling, and a saved viewport.

This is the privacy-relevant one: GPS data from personal photos never leaves the machine, and
the map does not phone a tile server that would learn where the photos were taken.

## Where the code is

| Concern | File |
|---|---|
| All four projections, rollups, cluster building | `v1/media_vault/review_organization.py` (26 KB) |
| Route | `v1/review_ui/src/routes/organize/+page.svelte` (268 lines) |
| Rendering for all four views | `OrganizationViews.svelte` (185 lines) |
| Bundled basemap | `v1/review_ui/src/lib/data/offline-world-map.ts` |

## Data it owns

`calendar_buckets`, `calendar_bucket_items`, `folder_hierarchy_nodes`,
`folder_hierarchy_items`, `equipment_rollups`, `equipment_rollup_items`, `map_clusters`,
`map_cluster_items`, `map_entity_locations`, `map_unknown_location_items`.

Job kind: `organization_rollups_materialize`.

## HTTP surface

| Method | Path |
|---|---|
| GET | `/api/v1/organize/calendar` |
| GET | `/api/v1/organize/folders` |
| GET | `/api/v1/organize/equipment/{equipment_kind}` |
| GET | `/api/v1/organize/map` |
| GET | `/api/v1/organize/status` |
| POST | `/api/v1/organize/prepare` |

## Known defects

| ID | Sev | Summary |
|---|---|---|
| `F65` | High | Organization cursors are not fully consumed, facets can represent only the first slice, and detail arrays are silently capped |
| `F32` | Critical | Projection generations are not reliably invalidated when new assets arrive |
| `F74` | High | Large projection builds lack a bounded invisible shadow-generation validation and atomic pointer-swap contract |
| `F69` | Medium | Map query bounds change with pan and zoom controls but the SVG remains a fixed full-world projection |
| `F71` | Medium | User-visible map punctuation and arrows contain mojibake; styles reference an undefined `--accent-soft` token |
| `F73` | Medium | Some organization paths use `fetchall` or full sorting that will not stay bounded at full-vault scale |

## Reuse notes

Worth lifting conceptually:

- The offline basemap. It is a small data file and it buys a real privacy property that a tile
  server cannot.
- Explicit unknown and ambiguous buckets everywhere, instead of guessing. This shows up in
  calendar (unknown capture time), equipment (unknown camera), and map (unknown location), and
  it is consistently the right call for a personal archive where metadata is patchy.
- Logical-entity counts by default with an occurrence mode for auditing. Two genuinely
  different questions, two modes, clearly labelled.
- Precomputed clusters by zoom level rather than sending coordinates to the client and
  clustering there.

Do not lift as-is:

- The paging (`F65`). Cursors that are not fully consumed and detail arrays that are silently
  capped mean a view can quietly show you a subset of your photos. For a browse-everything
  screen, that is worse than an error.
- The map rendering (`F69`). Bounds change in the query but the SVG stays a fixed full-world
  projection, so pan and zoom do not actually move the picture.
- The projection swap (`F74`). A generation should be built invisibly, validated, then swapped
  in atomically. The pattern is half-present in `materialized_views` and not enforced.

The four projections are cheap to rebuild and none of them owns any user state, which makes
this the lowest-risk area to defer. Nothing else depends on it.
