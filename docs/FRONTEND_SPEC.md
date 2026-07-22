# Frontend and reviewed-import specification

> [!CAUTION]
> This is the historical intended product contract, not a statement that the current WIP satisfies it or is safe for live data. Runtime deviations and release blockers are documented in [SAFETY_HOLD.md](SAFETY_HOLD.md), [FINDINGS_REGISTER.md](FINDINGS_REGISTER.md), and [ACTION_PRIORITY_MATRIX.md](ACTION_PRIORITY_MATRIX.md). Where this specification conflicts with those later findings, the later safety documents control.

Historical status at planning: approved baseline. This document defines the intended product outcome; the reviewed repository is evidence of current behaviour, while the later safety/review documents control readiness and authorization.

## 1. Current repository baseline

- The project is a Python 3.11+ FastAPI/SQLite media vault with a content-addressed object store, append-only source history, triple full-file hashes, byte comparison, collision handling, atomic no-overwrite publication, recovery sidecars, exports, and a single-writer guard.
- SQLite schema version 2 is authoritative. At planning time, the live manifest was approximately 3.52 GB and contained a large active import based on a 1,374,328-file traversal and 146,034 candidate assets. The implementation must therefore assume six-figure asset counts and million-row manifests.
- The existing dashboard is strictly GET-only and uses bounded cursor pagination, but its preview endpoint currently performs image, RAW, or video preview generation synchronously during an HTTP request. This must be replaced with persisted derivatives without removing the existing dashboard.
- The current schema has no reviewed-import manifest, user-state, derivative catalog, extended quality/junk features, saved views, materialized arbitrary sorts, map clusters, or adjustable similarity-stack profiles.
- The baseline suite has 6 passing tests and clean Ruff output. A Starlette TestClient deprecation warning is present and must not be hidden by unrelated upgrades.
- There was no root `AGENTS.md` or `docs` planning directory before this approved plan was persisted.

## 2. Product goal

Create a separate, elegant, local-first media review application that:

- reviews and safely imports future folders from a configurable G: drive inbox;
- exposes truthful, durable import progress and history;
- provides a fast virtualized browser for the complete vault;
- presents RAW/JPEG pairs as logical photos;
- supports calendar, folder, equipment, and private offline map organization;
- materializes adjustable similarity groups called **Stacks**;
- provides explainable, non-destructive junk filtering;
- supports metadata-only favourites, ratings, rejects, import exclusions, and bulk review;
- remains responsive at the existing vault's scale; and
- preserves every existing immutability, collision, copy-verification, recovery, and audit guarantee.

The application is optimized for a coherent, maintainable single-user workflow rather than the largest possible collection of controls.

## 3. Non-negotiable safety contract

1. Original source files and canonical vault objects are permanently immutable. They are never modified, moved, renamed, overwritten, or deleted.
2. Reject, favourite, rating, import-exclusion, cover override, feedback, and similar actions update SQLite application metadata only.
3. No feature may automatically discard media. Cooperative cancellation stops future work but never removes already verified objects.
4. No implementation or validation step may take, generate, save, compare, or inspect screenshots. Browser tests must disable screenshot, video, and trace capture.
5. Frontend code and HTTP request handlers may not decode, hash, copy, inspect, analyse, rank, group, or generate media.
6. Metadata, derivatives, similarity and quality measurements, grouping results, junk signals, rollups, and map clusters must be produced by resumable preprocessing/background jobs and persisted before they are requested for display.
7. Generated derivatives are regenerable artifacts stored separately from original/canonical media. They may be atomically rebuilt; originals and canonical objects may not.
8. The new application must remain completely separate from the current read-only dashboard.
9. Existing CLI commands, tests, recovery behavior, source guards, capacity checks, and copy-verification rules must remain operational.
10. Live-vault migration or exclusive maintenance must refuse to run while a writer is active and must first be proven against a copied database.

## 4. Architecture decisions

### 4.1 Separate application

- Use Svelte 5, SvelteKit, and TypeScript with the official static adapter.
- Build static assets and serve them from a separate FastAPI application invoked by `media-vault review-ui`.
- Default the new application to `127.0.0.1:8766`; preserve the current `ui` command and dashboard on port 8765.
- Use TanStack Svelte Virtual for large lists and grids, with stable item keys, keyset API pagination, bounded DOM size, and scroll restoration.
- Pin exact Node dependencies and keep production assets self-contained. Do not use external fonts, scripts, analytics, maps, CDNs, or runtime package downloads.

SvelteKit is preferred over React for this repository because it provides concise compiled components, file-based routing, static output suitable for FastAPI hosting, and supported Svelte virtualization while avoiding a second application server.

### 4.2 Backend and jobs

- Keep SQLite as the authoritative store and extend it through explicit ordered additive migrations.
- Add a durable background job queue with claiming, leases, heartbeats, retry evidence, analyzer versions, and restart recovery.
- A worker may run with `review-ui` or separately through `media-vault worker`. Media pipeline jobs must continue to use the existing single-writer protection.
- HTTP endpoints may validate requests, execute bounded indexed reads, write small application-metadata transactions, serve existing derivative files, or enqueue jobs. Missing work returns a durable preparation/job state; it is not performed in the request.
- Use common indexed query paths for immediate views. If an arbitrary compound sort/filter, stable random order, Stack profile, or junk profile would require a scan or expensive sort, enqueue and persist a materialized result set.

### 4.3 Security and locality

- Bind only to localhost and use a versioned `/api/v1` namespace.
- Require same-origin mutation requests, JSON content types, payload limits, no permissive CORS, and a restrictive self-only CSP.
- Use idempotency keys for bulk mutations and optimistic revisions to prevent lost updates between tabs.
- The application is single-user, but state remains durable and conflict-safe.
- `Open in folder` accepts an entity or asset identifier only. The server resolves a stored present path and launches Windows Explorer; it never accepts an arbitrary client filesystem path.

## 5. Reviewed inbox imports

### 5.1 Inbox and batch identity

- Default inbox: `G:\MediaVaultImports`, configurable at startup and CLI.
- Each immediate child directory is an independent import batch; its contents are traversed recursively.
- The inbox must be outside the immutable source and vault. Reparse points and symbolic links are not followed.
- Stable batch and item identifiers bind decisions and history to the exact inbox/folder/path observation.
- A re-scan is resumable and append-only. It updates current observations without deleting historical evidence or silently discarding decisions.

### 5.2 Import lifecycle

Use the truthful lifecycle:

1. `discovering`
2. `hashing`
3. `matching`
4. `preparing_previews`
5. `awaiting_review`
6. `copying`
7. `verifying`
8. `indexing`
9. `thumbnailing`
10. `complete`

`paused`, `cancelled`, `failed`, and `interrupted` are durable terminal or resumable states, not fabricated phases.

The two phases added to the requested list are deliberate: review previews must exist before the UI requests them, and copying must wait for an explicit review/approval gate.

### 5.3 Discovery and manifest

Record every recursively discovered item, not only recognized media:

- exact absolute and relative paths;
- folder membership and progress ancestry;
- stat snapshot and discovery generation;
- photo, video, RAW, sidecar, unsupported, non-media, or corrupt classification;
- content/signature/extension evidence and unusual-extension warnings;
- size and hashes where hashing applies;
- existing exact match, visually related candidate, RAW/JPEG candidate, or new asset outcome;
- proposed and final include/exclude decision;
- copy, verification, indexing, thumbnail, skip, duplicate, and failure outcomes; and
- structured errors and suggested resolutions.

Recognized sidecars are hashed, associated with media, and copied as opaque verified assets when their associated media is included. Unrelated random non-media files remain visible in the manifest but are excluded by default. Corrupt or unsupported media candidates retain the existing conservative inclusion behavior unless the user explicitly excludes them.

### 5.4 Review and control

- The import review surface shows preprocessed thumbnails and supports pointer brush/drag, keyboard ranges, include/exclude, undo, filters, safe multi-sort, and selection summaries.
- Exclusions change only batch decision metadata. They persist for that batch/item identity and never alter the inbox source.
- Approval presents included, excluded, duplicate, sidecar, corrupt, projected-size, and free-space totals and requires explicit execute authorization.
- Pause/resume is durable. Cancellation is cooperative, retains verified objects, abandons only unpublished temporary work, and never deletes media.
- Reconsidering an excluded item after approval creates an explicit new decision/retry event.

### 5.5 Import telemetry and history

Persist and display, where reliably measurable:

- overall and per-folder phase/progress;
- discovered, processed, skipped, failed, duplicate, paired, and remaining items;
- photos, videos, RAW, sidecars, unsupported, non-media, and corrupt counts;
- scanned, transferred, verified, and remaining bytes;
- current and exponentially weighted throughput;
- ETA with `learning`, `low`, `medium`, or `high` confidence based on sample count and throughput variance;
- observed pipeline read and write speeds;
- queue depth and busy/total worker utilization;
- current file, current folder, and recently completed folders;
- exact-match versus visually similar duplicate evidence;
- RAW/JPEG pairing rate;
- metadata, thumbnail, indexing, and verification progress;
- import storage consumed, projected final vault size, and source/destination free space;
- low-space, permission, unreadable-file, unusual-extension, corrupt-file, and stalled-work warnings;
- a persisted activity series for discoveries, bytes/s, errors, and queue depth;
- a filterable structured event log; and
- a collapsible error inspector with path, cause, context, retryability, and suggested resolution.

Completed imports remain in a comparison/history list with their complete manifest. Legacy run data is backfilled only where current reports, progress snapshots, or JSONL logs contain evidence. Missing legacy metrics are null and labeled `not recorded by this version`.

## 6. Preprocessing and derivative contract

### 6.1 Derivatives

- Generate sharded WebP derivatives at 192, 384, 768, and 1536 pixel long edges, plus a high-quality 2560-pixel detail derivative when source resolution warrants it.
- Generate minimal review previews before approval using read-only source access; regenerate final derivatives from verified vault objects after copy.
- Generate video posters and extract safe embedded RAW previews.
- When an accepted RAW/JPEG group has a suitable non-RAW representation, use the selected non-RAW member for the logical photo display. Fall back to the RAW preview when no acceptable companion exists.
- Record derivative kind, analyzer version, source asset identity, dimensions, MIME type, checksum, relative path, status, error, and timestamps.
- Serve derivatives with immutable caching only after the database row and file checksum agree.
- The legacy preview endpoint may serve a ready new derivative or an existing legacy cached preview. It may enqueue missing work but may never call Pillow, ExifTool, FFmpeg, hashing, or source reads during the request.

### 6.2 Extended metadata

Preprocess and persist normalized and raw evidence for:

- capture time and source/ambiguity;
- GPS coordinates and precision;
- camera make/model/serial and lens;
- ISO, aperture, exposure time, focal length, and exposure compensation;
- dimensions, orientation, duration, and codecs;
- software/edit history and derived/edit likelihood;
- import time and source-folder evidence; and
- decode/metadata warnings and analyzer versions.

### 6.3 Quality primitives

Persist versioned inputs rather than computing them in views:

- luminance histogram and entropy;
- sharpness and focus deficit;
- directional shake and motion evidence;
- severe under/overexposure, highlight clipping, and near-black evidence;
- blankness, obstruction likelihood, and low-information regions;
- blockiness/compression damage;
- corruption/incomplete decode;
- resolution class and thumbnail-likelihood;
- edit-likelihood; and
- deterministic composite quality/cover-ranking values.

## 7. Vault browser and user actions

### 7.1 Logical photo entities

- An accepted RAW/JPEG group is one stable logical photo entity anchored by the RAW asset.
- A standalone asset is its own entity.
- Exact source duplicates already share one content asset.
- Similarity Stacks group logical entities, not individual RAW/JPEG representations or source paths.
- Entity-level user state is stable. The inspector may still expose asset- and source-level evidence.

### 7.2 Primary grid

- Present a virtualized responsive grid for the complete vault with bounded memory and keyset paging.
- Provide a persisted density/thumbnail-size slider and select the smallest suitable precomputed derivative through stored dimensions and `srcset`.
- Add film contact-sheet mode with monochrome chrome. Preserve image color by default; an optional grayscale presentation toggle is display-only and clearly labeled.
- Restore scroll position and saved view state across navigation/session restart.
- Default to hiding rejected entities.
- Minimal always-visible indicators distinguish favourite/reject state, a complementary RAW member, and additional members in the current Stack.
- Hover and keyboard focus reveal favourite, reject, rating, select, inspect, cover/detail, open-in-folder, and other safe metadata actions.

### 7.3 Sorting and filtering

Provide a safe extensible registry including:

- capture and import time;
- filename/path;
- favourite, rejected, and rating state;
- quality and exposure;
- dimensions and file size;
- camera and lens;
- similarity/Stack order;
- exact/near-duplicate state;
- media kind and format;
- folder, date, equipment, GPS, and junk signals; and
- stable seeded random order.

Users may add ordered secondary sorts and choose ascending/descending per level. Common indexed combinations are immediate. Arbitrary combinations are built as background materialized views instead of running an expensive request-time sort.

### 7.4 Inspector and safe actions

- Show complete persisted metadata, quality evidence, source history, canonical destination, exact duplicates, RAW/JPEG evidence/ambiguity, relationships, warnings, derivative status, and junk explanations.
- Favourite, reject, rating, cover override, and selection are metadata-only and auditable.
- `Open in folder` resolves only a database-stored present path. It must not expose an arbitrary path-execution API.
- A stack-card reject acts on the cover entity only. A separate explicit `reject the rest of this Stack` action summarizes affected members and remains undoable.

## 8. Alternate organization views

### 8.1 Calendar

- Materialize capture-date buckets and counts.
- Preserve capture-time source and ambiguity.
- Provide explicit unknown/ambiguous-time buckets rather than guessing dates.

### 8.2 Folder hierarchy

- Materialize source-root and recursive folder nodes with logical entity and source-occurrence counts.
- Default to logical-photo view so exact duplicates do not multiply photos.
- Offer an explicit occurrence mode for auditing every preserved source path.

### 8.3 Camera and lens

- Persist normalized and raw equipment values, counts, and drill-down materialized views.
- Keep unknown values browsable.

### 8.4 Private offline map

- Bundle a compact offline world basemap and make no external tile/network requests.
- Materialize clusters by zoom/geohash level; the frontend renders and navigates persisted clusters only.
- Provide pan, zoom, cluster drill-down, linked library filters, unknown-location handling, and saved viewport.

## 9. Similarity Stacks

The user-facing name is **Stacks**.

### 9.1 Inputs and materialization

- Extend preprocessing with versioned pHash, dHash, color distribution, aspect, capture time, camera, filename, RAW/JPEG, and existing relationship evidence.
- Generate candidate edges through indexed/locality searches rather than all-pairs comparison.
- Do not introduce a heavyweight opaque embedding model in this version. Transparent perceptual and event/burst evidence better preserves explainability and operational simplicity.
- Normalize profile settings and cache their materialized memberships/order. A new combination enqueues work and leaves the last ready profile visible until replacement completes.

### 9.2 Controls

- Stack Similarity: loose event-level grouping to nearly identical frames.
- Time Proximity: allowed capture-time separation.
- RAW/JPEG Pairing Confidence: included because current pair confidence varies and ambiguity exists.
- Exposure Preference: darker, neutral, or brighter.
- Sharpness Limit: minimum acceptable sharpness for preferred cover candidates.
- Motion Preference: freeze motion versus embrace intentional blur.
- Ascending/descending display controls.

### 9.3 Cover ranking

- If any unedited candidate exists, no edited member may be selected as cover.
- When all members are edited, edited candidates may be ranked.
- Ranking then applies preferred exposure, sharpness limit, motion preference, clipping, corruption, resolution, and deterministic tie-breakers.
- Every cover exposes a persisted explanation and method version.
- Cards show a minimal layered edge, member count, expandable member strip, and optional metadata-only cover override.

## 10. Explainable junk filtering

### 10.1 Signals

Persist independent confidence/evidence for:

- extreme blur;
- camera shake;
- focus deficit;
- severe underexposure;
- severe overexposure;
- highlight clipping;
- near-black frames;
- possible obstruction or accidental frame;
- screenshot/downloaded-graphic likelihood;
- tiny or low-resolution files;
- corruption/incomplete decoding;
- exact duplicates;
- near duplicates with a better alternative;
- test-chart/calibration likelihood;
- blank scans;
- severe compression damage; and
- thumbnail-rather-than-original likelihood.

Each signal stores confidence, method/version, evidence, threshold, and a better-alternative entity where applicable.

### 10.2 Deliberate semantic safeguards

- Combine floor/pocket/finger/lens-cap claims into `possible_obstruction_or_accidental_frame` until a validated local classifier can support narrower labels.
- Treat missed focus as `focus deficit`; only assign high confidence when a sharper related frame exists.
- Test-chart and downloaded-graphic evidence may use filenames/paths and structural image evidence but may not hide an item alone under the default multi-signal profile.

These substitutions avoid misleading claims while preserving the goal of finding likely accidental/junk images.

### 10.3 Profiles, explanations, and feedback

- Junk Confidence threshold.
- Per-reason enable/disable controls.
- `Only hide when multiple signals agree` with a stored agreement count.
- `Never classify favourites as junk` applied when materializing effective results; underlying signals remain visible.
- `Show me what would be hidden` preview before applying the profile.
- Explanations such as: `Hidden because blur confidence is 92% and a sharper frame exists in the same Stack.`
- False-positive and false-negative feedback stored as metadata.
- Background calibration may adjust versioned local weights/thresholds only after sufficient feedback. Previous versions remain auditable and reversible.
- Junk results never reject, exclude, move, delete, or otherwise modify media automatically.

## 11. Bulk reject workflow

- Provide a separate virtualized bulk-reject route.
- Support pointer brush/drag selection, keyboard range selection, filters, Stack expansion, undo, and metadata-only bulk updates.
- Warn before rejecting favourites or large selections and summarize exactly which entities will change.
- Preserve favourites unless the user explicitly confirms a conflicting metadata update.
- Never translate rejection into a filesystem operation.

## 12. Public commands and API

### 12.1 Commands

Preserve all existing commands and add:

- `media-vault migrate --vault ...`
- `media-vault review-ui --vault ... [--inbox G:\MediaVaultImports] [--port 8766] [--no-open] [--no-worker]`
- `media-vault worker --vault ... --inbox ...`
- `media-vault preprocess --vault ... [--backfill]`
- `media-vault inbox-scan --vault ... --inbox ...`

The existing `import` command remains compatible and is not silently redirected into the reviewed-inbox workflow.

### 12.2 API groups

- Imports: list/detail, manifest pages, folder progress, samples, events, errors, discover, item decisions, approve, pause/resume, cancel.
- Jobs: status, progress, retry, analyzer version, and output generation.
- Library: create/materialize view, page ready view, entity detail, derivatives, facets, and metadata.
- Metadata actions: idempotent bulk reject/favourite/rating updates with optimistic revisions.
- Preferences: local profile, saved views, density, theme, filters, sorts, panel state, map state, and selected Stack/junk profiles.
- Stacks and junk: create/materialize profile, readiness, members/results, and explanations.
- Open in folder: database-resolved path only.

### 12.3 Schema additions

Add indexed, additive tables grouped by responsibility:

- Import orchestration: `import_batches`, `import_items`, `import_item_decisions`, `import_folder_progress`, `import_progress_samples`, `import_events`, `background_jobs`.
- Preprocessing: `derivatives`, `asset_features`, `asset_extended_metadata`, `facet_rollups`, `map_clusters`.
- Logical browsing: `photo_entities`, `photo_entity_members`, `materialized_views`, `materialized_view_items`.
- Application state: `photo_user_state`, `user_preferences`, `saved_views`.
- Stacks: `stack_profiles`, `stacks`, `stack_members`.
- Junk: `junk_signals`, `junk_profiles`, `junk_effective_results`, `junk_feedback`.

Every generated row records its schema/analyzer version, input asset identity, status, timestamps, and error evidence. Outputs are invalidated by version mismatch, never by changing originals.

## 13. Performance and reliability requirements

- Use keyset cursors; never load a million-row manifest into browser memory.
- Keep DOM size bounded through virtualization.
- Use persisted facet counts, activity samples, folder rollups, map clusters, Stack memberships, junk results, and materialized arbitrary views.
- Enforce request budgets: no full-table scans, media subprocesses, decoding, hashing, clustering, ranking, or derivative creation in request handlers.
- Use deterministic identifiers and ordering so restarts do not reshuffle results unexpectedly.
- Make discovery, copying, preprocessing, grouping, view materialization, and backfill resumable and idempotent.
- Throttle HDD work and expose queue/backfill state rather than starving verified imports.
- Preserve null/unavailable evidence instead of guessing.

## 14. Accessibility and validation

- All hover actions must also be available through keyboard focus and visible controls.
- Provide semantic headings, labels, status announcements, focus restoration, reduced-motion support, adequate contrast, and responsive layouts.
- Use Python tests, Ruff, TypeScript checking, Vitest, Svelte Testing Library, production builds, API contract tests, query-plan tests, fault injection, and DOM/accessibility-only Playwright tests.
- Disable Playwright screenshots, video, and traces.
- Use numerical/golden data fixtures for image-analysis verification; never use screenshot comparison.
- Surround any metadata mutation, import, migration, and backfill test with source and canonical-object hash/stat snapshots.
- Test at or above the current six-figure asset scale with generated database fixtures, not real source enumeration.

## 15. Assumptions

- `G:\MediaVaultImports` is the default configurable inbox and immediate children are batches.
- The active import observed during planning is allowed to finish; implementation must not migrate or disrupt it.
- The application is single-user and localhost-only, with durable revisions/idempotency for multiple tabs.
- Windows Explorer is the initial open-in-folder integration.
- Photos, RAW files, and video posters appear in the library; interactive original-video streaming is outside the approved plan.
- Generated derivatives may be rebuilt, but source and canonical vault objects may not.
- Exact Node/Python dependency versions will be pinned when their implementation stage begins.

## 16. Approved deviations and replacements

1. Added `preparing_previews` and `awaiting_review` phases because exclusions require thumbnails and approval before copy.
2. Replaced open-ended `every possible` fields with an extensible registry of reliable, persisted fields; unavailable values remain explicit.
3. Replaced synchronous arbitrary sorts/grouping with persisted materialized views/profiles to honor request-time constraints.
4. Selected Svelte 5/SvelteKit/TypeScript instead of React or vanilla JavaScript for a statically hosted, maintainable complex UI.
5. Selected a private offline map instead of external tiles to avoid network dependencies and location leakage.
6. Combined floor/pocket/finger/lens-cap into an honest obstruction/accidental-frame signal until validated semantics exist.
7. Reframed missed focus as focus deficit with related-frame evidence to protect intentional shallow-focus work.
8. Deferred opaque heavyweight image embeddings; transparent perceptual/time/equipment evidence supports the intended event/burst Stacks with better explainability.
9. Contact-sheet monochrome styling does not alter image data; grayscale is an optional presentation-only effect.
10. `Disk speed` means observed pipeline throughput, not an invented device benchmark.
11. Legacy metrics are backfilled only from recorded evidence and are never fabricated.
12. Original-video streaming is deferred because it is not required for the photo-review goal and would broaden media-serving and performance risk.
