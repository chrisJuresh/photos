# Frontend and reviewed-import implementation plan

Status: approved, not implemented.

This plan must be implemented one numbered stage at a time. Each stage must update `docs/FRONTEND_PROGRESS.md`, pass its verification gates, and stop at its stated boundary before the next stage begins. The repository and `docs/FRONTEND_SPEC.md` are the source of truth if an implementation detail is unclear.

## Dependency order

```text
1 Governance/migrations
└─ 2 Import manifest
   └─ 3 Reviewed copy/telemetry
      └─ 4 Preprocessing/derivatives
         └─ 5 Separate application foundation
            ├─ 6 Import interface
            └─ 7 Library browser
               ├─ 8 Alternate organization views
               └─ 9 Similarity Stacks
                  └─ 10 Junk and bulk reject
                     └─ 11 Backfill and release verification
```

Stage 5 also depends directly on Stage 1's typed contracts and security rules. Stage 9 depends on the quality/metadata outputs of Stage 4. Stage 10 depends on Stages 4, 7, and 9. Stage 11 depends on every earlier stage.

## Stage 1. Governance, documentation, migrations, and immutable boundaries — Extra High

### Objective

Establish the permanent rules, definitive documentation, schema migration framework, and safety test harness before product functionality is added.

### Dependencies

None. This is the mandatory foundation for every later stage.

### Backend work

- Treat `AGENTS.md`, `docs/FRONTEND_SPEC.md`, this plan, and `docs/FRONTEND_PROGRESS.md` as implementation gates.
- Replace implicit schema-version rewriting with an ordered migration registry.
- Add `media-vault migrate --vault ...` as an explicit command. It must refuse an active writer, check free space, create and verify a SQLite backup, apply each migration transactionally, verify foreign keys/integrity/version, and be safely repeatable.
- Keep v2 readable by legacy commands and the current dashboard. New features must report `migration required` rather than partially operating on v2.
- Define typed configuration for vault root, inbox, derivative root, ports, worker limits, request budgets, and analyzer versions.
- Define the separation between immutable originals/canonical objects and regenerable derivatives.
- Do not migrate the live manifest while the import observed during planning is active. Prove migration on an isolated copy first.

### Frontend work

- None beyond documenting the future frontend contracts and no-screenshot testing rule.

### Acceptance criteria

- A v2 database opens with every existing command without accidental migration.
- New feature entry points fail clearly and safely until explicit migration succeeds.
- Migration refuses a live `active-writer.lock` whose PID is active.
- Backup, migration, and validation failures leave the original manifest usable.
- All four planning/governance documents agree on safety constraints, stages, deviations, assumptions, and effort.

### Tests and verification

- Preserve the existing 6 passing tests and clean Ruff check.
- Add migration tests for a fresh database, v2 fixture, repeated execution, live-writer refusal, insufficient backup space, interrupted/failing migration, foreign-key validation, and integrity failure.
- Snapshot source and canonical-object hashes/stats around migration tests.
- Search test configuration and artifacts to ensure screenshots, videos, and traces are not enabled.

### Explicit stopping point

Stop once a v2 copy can be safely migrated and the governance test gates pass. Do not add import tables, worker behavior, API routes, or UI components in this stage.

## Stage 2. Import batch discovery and review manifest — Extra High

### Objective

Model top-level inbox folders as durable reviewable imports and record every recursively discovered item before any copy decision.

### Dependencies

Stage 1 migration framework, configuration, and safety tests.

### Backend work

- Add the import orchestration schema: `import_batches`, `import_items`, `import_item_decisions`, `import_folder_progress`, and the minimal job records required for discovery.
- Default the configurable inbox to `G:\MediaVaultImports`; treat each immediate child directory as an independent batch.
- Validate that inbox/batch roots are outside the immutable source and vault. Reuse no-reparse/no-symlink traversal and the existing atime guard.
- Separate `discovering`, `hashing`, and `matching` so published phases are truthful.
- Record every recursive path and folder, stat snapshot, classification, extension/signature evidence, warnings/errors, hashes where applicable, exact-match outcome, RAW/JPEG candidate evidence, associated sidecar, and proposed include/exclude decision.
- Use stable batch/item identifiers and append-only observations. Rescans must preserve decisions and history without duplicating unchanged items.
- Default recognized media and corrupt media candidates to include, paired recognized sidecars to include, and unrelated non-media files to exclude.
- Add typed internal services/API contracts for manifest keyset paging, classification filters, item decisions, and batch summary. A polished UI is deferred.

### Frontend work

- None beyond contract fixtures. Do not build the import page yet.

### Acceptance criteria

- A batch reaches a persisted review-ready manifest without publishing canonical media.
- Manifest pages account for every discovered file and folder and expose proposed outcomes.
- Folder totals reconcile exactly with batch totals.
- Exclusions update decision metadata only and persist across restart/rescan.
- The same batch can resume after interruption without duplicated items or lost decisions.

### Tests and verification

- Synthetic recursive trees cover photos, videos, RAW, sidecars, random files, Unicode, multiple extensions, unusual extensions, corruption, permission failures, reparse points, exact duplicates, and changed files.
- Snapshot source bytes, paths, timestamps other than the documented atime waiver, attributes, and directory entries before/after discovery.
- Test keyset pagination/filtering and query plans against a generated million-row manifest fixture.
- Assert that no canonical object is created before approval/copy.

### Explicit stopping point

Stop with a complete headless review manifest and decision service. Do not implement approved copying, rich telemetry, preview generation, or the import UI.

## Stage 3. Reviewed copying, durable telemetry, and import history — Extra High

### Objective

Copy only approved items through the existing verification contract while persisting complete operational evidence and history.

### Dependencies

Stage 2 batch/item/decision model and Stage 1 writer/migration safeguards.

### Backend work

- Complete `background_jobs`, `import_progress_samples`, `import_events`, and durable error/folder progress records.
- Implement job claiming, leases, heartbeats, retry evidence, restart recovery, pause/resume, and cooperative cancel.
- Require explicit batch approval and execute authorization before copying.
- Reuse triple-hash verification, source-change checks, reopened-temp hashing, byte comparison, fsync, atomic no-overwrite publication, collision separation, destination-conflict handling, capacity checks, and recovery-sidecar behavior.
- Copy only included media and associated included sidecars. Never copy excluded/random non-media items.
- Persist overall/per-folder phases, counts, scanned/transferred/verified/remaining bytes, current/EWMA throughput, ETA/confidence, observed read/write rates, queue depth, worker use, current/recent paths, duplicate types, pairing rate, index/thumbnail progress, storage growth, projections, free space, warnings, stalls, activity samples, events, errors, causes, and suggested resolutions.
- Backfill legacy history only from runs, reports, progress snapshots, and JSONL evidence. Store unavailable values as null with an explicit legacy reason.

### Frontend work

- None beyond API fixtures and machine-readable event/error schemas.

### Acceptance criteria

- Only explicitly approved items are copied.
- Excluded/unsupported items retain manifest outcomes without any filesystem mutation.
- Crash/restart at every publication boundary cannot overwrite, duplicate, or delete canonical media.
- Pause/resume/cancel is durable; cancellation leaves verified objects and stops future items.
- Import history retains statistics, activity samples, events, errors, folder progress, and complete manifest outcomes.
- ETA confidence is `learning`, `low`, `medium`, or `high` based on sample count and throughput variance.

### Tests and verification

- Fault injection across hashing, approval, copy creation, fsync, reopen, byte compare, publication, telemetry commit, pause, cancel, and restart.
- Reconcile every summary counter with item and folder outcomes.
- Compare source and pre-existing canonical-object hashes/stats around every control operation.
- Preserve all existing import-gate, collision, validation, rerun, sidecar, and recovery tests.

### Explicit stopping point

Stop when a headless reviewed batch can complete safely and be fully audited through service/CLI APIs. Do not generate visual derivatives or create the new application.

## Stage 4. Preprocessing, derivatives, metadata, and feature pipeline — Extra High

### Objective

Ensure every media-derived value needed by either interface is created outside HTTP/frontend execution and persisted first.

### Dependencies

Stage 3 durable worker/jobs and verified object lifecycle. Review-preview work also consumes Stage 2 batch items.

### Backend work

- Add `derivatives`, `asset_features`, `asset_extended_metadata`, analyzer-version/status/error fields, and resumable preprocessing jobs.
- Generate sharded WebP derivatives at 192, 384, 768, and 1536 pixel long edges plus a 2560-pixel detail derivative when warranted.
- Generate source-read review previews before approval; regenerate final derivatives from verified objects after copy.
- Generate video posters, extract RAW embedded previews, and select the accepted non-RAW companion for logical RAW display when confidence permits.
- Persist GPS, exposure, equipment, capture-time, orientation, codec, software/edit-history, import, warning, and raw metadata evidence.
- Persist luminance/entropy, sharpness/focus, shake/motion, clipping, exposure, near-black, blankness, obstruction, blockiness, corruption, resolution, thumbnail-likelihood, edit-likelihood, and versioned quality/cover-ranking inputs.
- Enforce decoder pixel/time/resource limits and persist failures.
- Refactor the legacy preview endpoint to serve only a ready new derivative or existing legacy cached preview. It may enqueue work but may not read/decode/hash media or invoke subprocesses.

### Frontend work

- Update only legacy preview copy/state as required to describe `preparing` or `unavailable`; do not build the new interface.

### Acceptance criteria

- Derivative endpoints perform database lookup and file serving only.
- Failed/missing derivatives produce a persisted job/state rather than repeated request-time work.
- Reprocessing is deterministic/idempotent and never changes source or canonical object bytes.
- RAW/JPEG/video/corrupt formats have honest ready/fallback/error states.
- Existing dashboard previews function after backfill without request-time generation.

### Tests and verification

- In HTTP tests, monkeypatch Pillow, ExifTool, FFmpeg, hashing, subprocess creation, and source reads to fail if called in a request handler.
- Numeric/golden-data tests cover features without screenshot or visual comparison.
- Test orientation, resource limits, RAW fallback/preference, video poster, corrupt decode, derivative checksums, atomic rebuild, and analyzer-version invalidation.
- Verify derivative paths never overlap source or canonical object paths.

### Explicit stopping point

Stop when all browser-visible media, metadata, and base quality inputs can be preprocessed and served safely. Do not add SvelteKit or user-facing Stack/junk logic.

## Stage 5. Separate SvelteKit application and API foundation — Extra High

### Objective

Create the independent, accessible application shell, typed API, preferences, and security boundary without altering the existing dashboard's purpose.

### Dependencies

Stage 1 public/security contracts and Stage 4 persisted derivative contract.

### Backend work

- Add `/api/v1` typed FastAPI routes and `media-vault review-ui` on `127.0.0.1:8766`.
- Add `media-vault worker`, `preprocess`, and `inbox-scan` command entry points while preserving all existing commands.
- Serve the static build with self-only CSP, same-origin mutation checks, localhost-only binding, JSON/payload limits, idempotency, and optimistic revisions.
- Add `user_preferences` and `saved_views`; use SQLite as authority.
- Implement common API envelopes for schema version, generation, keyset cursor, job state, errors, and unavailable legacy fields.

### Frontend work

- Add pinned Svelte 5/SvelteKit/TypeScript dependencies, static adapter, TanStack Svelte Virtual, Vitest, Svelte Testing Library, and DOM-only Playwright configuration.
- Build the application layout, routes, navigation, design tokens, responsive shell, light/dark themes, focus management, reduced-motion behavior, loading/error states, and typed API client.
- Add paging, job polling, stale-generation handling, saved preferences/views, and scroll-state primitives.
- Use no external fonts, scripts, analytics, maps, or CDNs.

### Acceptance criteria

- The old dashboard remains available through `ui` on port 8765.
- The new application is independently available through `review-ui` on port 8766.
- The two static asset/API namespaces do not overlap accidentally.
- Settings survive browser and server restart.
- All routes and controls have keyboard-accessible foundations and semantic status/error behavior.

### Tests and verification

- Python/API tests, TypeScript checking, Vitest, Svelte Testing Library, production static build, and DOM-only Playwright smoke tests.
- Disable Playwright screenshots, videos, and traces in configuration and CI.
- Test CSP, origin rejection, payload limits, bad cursors, stale revisions, job errors, and schema migration-required states.
- Run the complete existing Python suite after introducing the frontend build.

### Explicit stopping point

Stop with a production-built shell, API client, preferences, and security boundaries. Feature routes may remain functional placeholders; do not implement import or library screens.

## Stage 6. Import progress, review, history, and manifest interface — Extra High

### Objective

Deliver the complete visual reviewed-import workflow using persisted data from Stages 2–4.

### Dependencies

Stages 2–4 backend behavior and Stage 5 application foundation.

### Backend work

- Finalize bounded `/api/v1/imports` endpoints for list/detail, summaries, folder progress, samples, manifest, events, errors, decisions, approval, pause/resume, cancel, and comparison.
- Provide persisted common manifest filters/sorts and background materialization for non-indexed arbitrary combinations.
- Return preprocessed review derivative URLs and honest preparation/error states only.

### Frontend work

- Build import history/list and per-import phase timeline.
- Add complete metrics, overall/per-folder progress, throughput/error/discovery/queue graph, live filterable event log, and collapsible error inspector.
- Build virtualized manifest and thumbnail review surfaces with classification/outcome filters, path search, safe multi-sort, pointer brush/drag, keyboard ranges, include/exclude, undo, and selection summaries.
- Add approval confirmation with included/excluded/duplicate/sidecar/corrupt counts, projected storage, and free space.
- Add pause/resume/cancel controls and durable reconnect behavior.
- Show stalls, low space, permission/readability problems, unusual extensions, causes, retryability, and suggested resolutions.

### Acceptance criteria

- A user can discover a top-level batch, inspect every manifest item, exclude media, approve, copy, pause/resume, and audit completion.
- Exclusion language never implies source deletion or movement.
- Live graphs use persisted samples rather than browser-derived throughput.
- Reload/reconnect reconstructs identical state from SQLite.
- Completed batches remain permanently inspectable and comparable.

### Tests and verification

- Component/DOM tests cover brush and keyboard selection, filters, undo, approval, stale states, reconnect, and unavailable legacy metrics.
- API totals reconcile exactly with persisted batch/item/folder records.
- End-to-end synthetic reviewed import proves source/canonical immutability.
- No screenshot assertions or captured browser artifacts.

### Explicit stopping point

Stop once reviewed inbox importing is independently usable. Do not begin the general vault browser in this stage.

## Stage 7. Virtualized library, contact sheet, actions, filtering, and inspector — Extra High

### Objective

Build the high-performance primary vault browser and metadata-only daily review actions.

### Dependencies

Stage 4 derivatives/features and Stage 5 application/API foundation. Stage 3 supplies import-time evidence.

### Backend work

- Add `photo_entities`, `photo_entity_members`, `materialized_views`, `materialized_view_items`, `photo_user_state`, `facet_rollups`, and indexes.
- Materialize common orders: capture/import time, filename, rating, quality, dimensions, size, camera, lens, exposure, similarity, and stable random.
- Whitelist sort/filter fields and directions. Use indexed keyset seeks for common combinations and background materialization for arbitrary combinations.
- Add entity detail, derivative, facet, metadata action, and database-resolved open-in-folder APIs.
- Make favourite/reject/rating updates idempotent, optimistic, auditable, and entity-level.

### Frontend work

- Build a virtualized responsive grid with bounded DOM/memory, density slider, suitable derivative selection, scroll restoration, and loading/error placeholders.
- Add film contact-sheet mode, optional display-only grayscale, saved views, facet/filter drawer, ordered secondary sorts, and ascending/descending controls.
- Default to hiding rejected entities.
- Add minimal always-visible favourite/reject, RAW companion, and Stack-member indicators; expose all actions on hover and keyboard focus.
- Add favourite, reject, rating, selection, inspector, cover/detail, keyboard shortcuts, and open-in-folder controls.
- Build the metadata inspector with source history, object evidence, duplicates, RAW/JPEG confidence/ambiguity, relationships, warnings, quality, derivatives, and junk placeholders.

### Acceptance criteria

- The grid is responsive at the current six-figure asset scale and never fetches all results/full originals.
- RAW entities use the selected non-RAW companion when available and distinguish RAW versus Stack indicators.
- Reject/favourite/rating persists across restart and never changes media bytes/stats.
- Common sorts are immediate; arbitrary sorts expose background preparation honestly.
- Every hover action is keyboard accessible without hover.

### Tests and verification

- Query-plan tests prove intended indexes/keyset cursors for common views.
- Generated large-data tests cover at least 146,034 assets and million-row source manifests.
- DOM tests cover virtualization, density, contact sheet, filters, multi-sort, selection, actions, default rejected filtering, inspector, and open-folder validation.
- Hash/stat media snapshots surround every action test.

### Explicit stopping point

Stop with a complete daily-use grid and inspector. Do not add calendar/folder/equipment/map, adjustable Stacks, or junk review.

## Stage 8. Calendar, folder, equipment, and private map views — Extra High

### Objective

Add alternate organization views based entirely on persisted rollups/clusters.

### Dependencies

Stage 7 logical entities/materialized views and Stage 4 extended metadata/GPS.

### Backend work

- Materialize calendar date/unknown/ambiguous buckets and counts.
- Materialize source-root/folder hierarchy nodes with logical entity and source-occurrence counts.
- Normalize/persist camera/lens facets while retaining raw and unknown values.
- Add `map_clusters` by zoom/geohash level and bounded linked-library view generation.
- Return stored buckets/hierarchy/facets/clusters; do not aggregate them during requests.

### Frontend work

- Build calendar navigation and unknown/ambiguous buckets.
- Build expandable folder hierarchy with logical-photo default and explicit source-occurrence mode for duplicates.
- Build camera/lens grouping and drill-down.
- Bundle an offline world basemap; add pan, zoom, cluster drill-down, linked library filtering, unknown-location state, and saved viewport.
- Ensure the map makes no external tile or coordinate request.

### Acceptance criteria

- All views resolve to the same stable entities and user state as the grid.
- Duplicate paths do not multiply logical photos unless occurrence mode is selected.
- Missing dates/equipment/coordinates remain browsable and labeled.
- The map operates fully offline and uses persisted clusters.

### Tests and verification

- Deterministic tests for date buckets, hierarchy, duplicate occurrences, normalization, unknown data, geohashes, zoom levels, and antimeridian behavior.
- CSP/network tests reject external map resources.
- DOM-only keyboard, route, saved-state, and drill-down tests.
- Query-plan tests prove request handlers use persisted rollups.

### Explicit stopping point

Stop when all four alternate views are complete and link back to stable library views. Do not implement adjustable Stacks or junk logic.

## Stage 9. Similarity Stacks and best-frame ranking — Extra High

### Objective

Deliver adjustable, persisted photo grouping and explainable cover selection.

### Dependencies

Stage 4 feature/quality inputs, Stage 7 logical entities/browser, and Stage 5 background materialization.

### Backend work

- Add versioned pHash/dHash, color distribution, aspect, time, equipment, filename, RAW/JPEG, and relationship inputs needed for grouping.
- Generate candidate edges through indexed/locality searches, never all-pairs comparison.
- Add `stack_profiles`, `stacks`, and `stack_members` with normalized settings and cached materialized generations.
- Materialize controls for Stack Similarity, Time Proximity, RAW/JPEG Pairing Confidence, Exposure Preference, Sharpness Limit, Motion Preference, and order direction.
- Rank covers offline. Exclude edited candidates whenever any unedited candidate exists; then apply exposure, sharpness, motion, clipping, corruption, resolution, override, and deterministic tie-breakers.
- Persist cover explanation, input evidence, analyzer/profile version, and stable IDs/order.
- A new settings combination enqueues a job and leaves the previous ready profile available.

### Frontend work

- Add elegant profile controls and ready/preparing/error states.
- Render Stack cards with cover, layered edge, member count, expandable members, explanation, cover override, and distinct RAW/Stack indicators.
- Integrate Stack grouping/order into the main library without browser-side clustering/ranking.

### Acceptance criteria

- Identical profile inputs produce stable Stack IDs, memberships, order, and covers.
- Loose settings create event/burst groups; strict settings approach nearly identical frames.
- Edited media never outranks an available unedited candidate.
- Every cover has a persisted human-readable explanation and method version.
- Profile requests never perform clustering/ranking synchronously.

### Tests and verification

- Synthetic bursts cover time boundaries, exposure brackets, motion, edited exports, ambiguity, similar compositions, unrelated adjacent names, and deterministic ties.
- Test profile cache, restart recovery, analyzer invalidation, cover overrides, and all-pairs prevention.
- DOM tests cover sliders, job transitions, indicators, keyboard expansion, and explanations without screenshots.
- Performance tests use representative scale and bounded candidate-edge growth.

### Explicit stopping point

Stop when default and user-created Stack profiles are ready, explainable, and integrated. Do not implement junk feedback or bulk reject.

## Stage 10. Explainable junk filtering, feedback, and bulk reject — Extra High

### Objective

Add safe, explainable review acceleration without destructive behavior or opaque classifications.

### Dependencies

Stage 4 quality primitives, Stage 7 user state/browser, Stage 9 Stacks/better alternatives, and Stage 5 materialized jobs.

### Backend work

- Add `junk_signals`, `junk_profiles`, `junk_effective_results`, and `junk_feedback`.
- Persist independent confidence/evidence/method versions for all approved reasons: blur, shake, focus deficit, exposure, clipping, near-black, obstruction, screenshot/graphic likelihood, low resolution, corruption, exact/near duplicate, better alternative, chart/calibration, blank scan, compression, and thumbnail-likelihood.
- Materialize profile threshold, enabled reasons, agreement count, and favourite protection.
- Retain underlying signals while excluding favourites from effective hidden results.
- Store better-alternative entity links and explanation text.
- Record false-positive/false-negative feedback. Recalibrate versioned local weights/thresholds only in background after sufficient feedback; preserve rollback/audit history.
- Add idempotent bulk metadata actions, undo records, and `reject the rest of this Stack` with explicit affected membership.

### Frontend work

- Build junk confidence/reason/agreement/favourite controls.
- Add `show what would be hidden` preview, reason chips, explanations, and better-alternative comparison.
- Build a separate virtualized bulk-reject view with brush/range/keyboard selection, favourite and large-selection warnings, explicit confirmation, and undo.
- Make it unambiguous that junk filtering never rejects or deletes automatically.

### Acceptance criteria

- No junk operation alters, moves, deletes, rejects, or excludes media automatically.
- Every effectively hidden entity has persisted reasons/evidence.
- Agreement and favourite safeguards are honored during materialization.
- Feedback affects only future profile generations and is auditable/reversible.
- Bulk rejects are metadata-only, conflict-safe, and undoable.

### Tests and verification

- Numeric fixtures cover each signal plus artistic dark/shallow-focus images, edited graphics, tiny originals, corrupt files, and better-neighbor evidence.
- Test minimum-feedback thresholds, model/profile versions, rollback, favourite protection, agreement counts, conflicts, undo, restart, and large selections.
- Snapshot source/canonical hashes/stats around every action.
- DOM-only tests cover preview-before-apply, reasons, feedback, brush/range selection, confirmation, and undo.

### Explicit stopping point

Stop when junk review and bulk rejection are explainable, reversible, and persisted. Do not begin live-vault rollout/backfill in this stage.

## Stage 11. Backfill, compatibility, performance, accessibility, and release verification — Extra High

### Objective

Safely prepare the existing large vault and prove the complete application without weakening legacy behavior.

### Dependencies

All previous stages.

### Backend work

- Test migration and full backfill on a copied database first.
- When no live writer is active, apply the explicit live migration only after backup/free-space/integrity checks.
- Backfill entities, metadata, derivatives, facets, common views, default Stacks, quality, junk, map clusters, and legacy history through resumable jobs.
- Throttle HDD work; expose progress and pause/resume so verified importing is not starved.
- Verify and document schema, analyzer, materialization, derivative, sidecar, export, and recovery compatibility.
- Preserve old dashboard APIs and every existing CLI path.
- Address or explicitly document the Starlette TestClient warning without unrelated dependency churn.
- Update README, SCHEMA, and progress documentation only as needed to describe shipped behavior.

### Frontend work

- Finish responsive, keyboard, screen-reader, reduced-motion, contrast, empty/error, long-path, Unicode, and stale/offline polishing.
- Ensure all prepared/backfill states are honest and actionable.

### Acceptance criteria

- Existing functionality and tests remain operational.
- No HTTP route performs media work, heavy aggregation, clustering, ranking, or derivative generation.
- Live-vault browsing uses bounded memory, keyset pagination, persisted rollups, and ready derivatives.
- Migration/backfill resumes safely and leaves source/canonical hashes unchanged.
- Documentation matches shipped behavior, deviations, unavailable legacy data, and recovery procedures.
- No screenshot, video, or trace artifacts exist.

### Tests and verification

- Full Python, Ruff, TypeScript, Vitest, production build, DOM-only Playwright, accessibility, API contract, query-plan, fault-injection, migration, backfill, and large-data suites.
- Source/canonical immutability audits before/after migration and backfill.
- SQLite integrity/foreign-key checks, derivative checksum audit, materialized-generation audit, job recovery, sidecar/export/recovery compatibility.
- Manual DOM/keyboard inspection only; no screenshots.

### Explicit stopping point

Stop with a release-ready separate application, completed progress ledger, verified migration, and a resumable backfill state. Do not add unrelated features during release hardening.

## Approved assumptions

- The default configurable inbox is `G:\MediaVaultImports`; immediate children are batches.
- The active import observed during planning must be allowed to finish or stop safely before migration.
- The application is single-user and localhost-only, with durable revisions/idempotency for multiple tabs.
- Windows Explorer is the initial open-in-folder integration.
- Photos, RAW files, and video posters are browsable; original-video streaming is outside this plan.
- Generated derivatives are rebuildable; source and canonical media are not.
- Exact dependency versions are pinned in the stage that introduces them.

## Approved deviations and replacements

1. Add preview/review phases before copying.
2. Use a documented extensible field registry instead of claiming literally unlimited reliable statistics/sorts.
3. Materialize arbitrary sorts and adjustable profiles in background instead of calculating them in HTTP/frontend code.
4. Use Svelte 5/SvelteKit/TypeScript rather than React or dependency-free vanilla JavaScript.
5. Use a bundled private offline map rather than online tiles.
6. Use `possible obstruction or accidental frame` instead of unvalidated floor/pocket/finger/lens-cap labels.
7. Use focus deficit with related-frame evidence instead of asserting missed focus.
8. Defer opaque heavyweight embeddings in favor of transparent perceptual/time/equipment Stack evidence.
9. Keep contact-sheet monochrome styling presentational and non-destructive.
10. Define disk speed as observed pipeline throughput.
11. Leave unavailable legacy metrics null and explicit.
12. Defer original-video streaming.

## Effort recommendation summary

1. Governance, documentation, migrations, and immutable boundaries — **Extra High**
2. Import batch discovery and review manifest — **Extra High**
3. Reviewed copying, durable telemetry, and import history — **Extra High**
4. Preprocessing, derivatives, metadata, and feature pipeline — **Extra High**
5. Separate SvelteKit application and API foundation — **Extra High**
6. Import progress, review, history, and manifest interface — **Extra High**
7. Virtualized library, contact sheet, actions, filtering, and inspector — **Extra High**
8. Calendar, folder, equipment, and private map views — **Extra High**
9. Similarity Stacks and best-frame ranking — **Extra High**
10. Explainable junk filtering, feedback, and bulk reject — **Extra High**
11. Backfill, compatibility, performance, accessibility, and release verification — **Extra High**
