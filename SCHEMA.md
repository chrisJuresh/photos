# Manifest and sidecar schema

Schema version 12 is defined authoritatively by `media_vault/db.py`. Versions 2 through 11 remain supported by the legacy commands and read-only dashboard without implicit migration. Version 3 adds the ordered migration audit table; version 4 adds the Stage 2 reviewed-inbox discovery/manifest records; version 5 adds the Stage 3 approval, copy outcome, durable worker, telemetry, error, event, and history records; version 6 adds Stage 4 persisted derivatives, extended metadata, and quality primitives; version 7 adds the Stage 5 application-state and idempotency foundation; version 8 adds only the Stage 6 background manifest-view materialization and import-interface paging indexes; version 9 adds the Stage 7 logical-photo catalog, entity user state/audit, facet rollups, and general library materializations; version 10 adds the Stage 8 calendar, source-hierarchy, normalized-equipment, map-location/geohash-cluster, and alternate-view membership records; version 11 adds the Stage 9 persisted perceptual Stack inputs, bounded candidate edges, profiles, memberships, ranking explanations, and metadata-only cover audit; version 12 adds the Stage 10 versioned junk-signal, profile, effective-result, and feedback records. SQLite is the transactional source of truth. `exports/manifest.jsonl` is the authoritative portable snapshot at its generation time; `exports/assets.csv` is convenience-only. Per-asset JSON records under `records/assets/<two>/<two>/<asset-id>.json` are independently useful recovery sidecars and are never placed beside source media.

All path columns use SQLite's binary text collation. JSON is UTF-8 with `ensure_ascii=false`. This preserves enumerated case and Unicode text rather than applying Windows filename normalization. A source path is stored as both an absolute `path_text` and the exact relative string produced for its source root.

## Stable identifiers

Identifiers have a type/version prefix and SHA-256 digest over a canonical UTF-8 JSON tuple:

- `sr1_…`: source root path identity
- `sf1_…`: source root plus exact source filepath identity
- `a1_…`: size, SHA-256, BLAKE3, and SHA-512 content identity
- `x1_…`: exact-content group identity
- `dst1_…`: asset plus destination path identity
- `rel1_…`: ordered asset pair, relationship type, and method identity
- `rjg1_…`: RAW/JPEG group anchored by a RAW asset ID
- `ib1_…`: configured inbox plus immediate-child batch identity
- `ii1_…`: batch plus exact relative path and entry-kind identity
- `iob1_…`: immutable review-item observation identity
- `job1_…`: durable discovery, reviewed-copy, or preprocessing job identity
- `iap1_…`: immutable reviewed-batch approval snapshot identity
- `iapf1_…`: approval decision/observation fingerprint
- `lih1_…`: imported legacy-history identity
- `d1_…`: derivative subject/kind/size/analyzer/input identity
- `aem1_…`: asset extended-metadata analyzer/input identity
- `af1_…`: asset quality-feature analyzer/input identity
- `sv1_…`: application-generated saved-view identity
- `sp1_…`: normalized Stack settings, catalog generation, and analyzer identity
- `st1_…`: normalized Stack settings plus its sorted stable logical-entity membership
- `jp1_…`: normalized junk settings, catalog generation, analyzer, and calibration identity
- `js1_…`: logical entity, approved junk reason, analyzer, and persisted input identity

If an otherwise impossible primary-hash collision fails byte comparison, `a1c_…`/`x1c_…` include a SHA3-512 discriminator. Asset IDs therefore remain independent of source filenames and survive source moves.

Stage 7 additionally uses `pe1_...` logical-photo entity IDs anchored by stable RAW or standalone assets and `mv1_...` analyzer/input-generation-bound materialized view IDs. Stage 8 uses deterministic `fn1_...` folder-node and `mc1_...` persisted map-cluster IDs bound to the catalog generation and normalized source/geohash evidence. Stage 9 uses `sp1_...` profile and `st1_...` Stack identities; repeated identical inputs therefore retain stable profile, group, membership, order, and cover IDs. Stage 10 uses `jp1_...` profile and `js1_...` signal identities so unchanged inputs reuse cached materializations while analyzer or input changes are retained as non-current evidence.

## Core tables

`schema_info` stores `schema_version`. `schema_migrations` exists from version 3 onward and records each ordered version, migration name, UTC application time, and tool version. Opening an existing manifest never executes migrations or rewrites this value.

`runs` is an audit ledger with command, status, UTC start/completion, source/vault roots, host/runtime identity, tool version, exact arguments, and structured summary.

`source_roots` stores each scanned root and the last traversal known to have completed.

`scan_summaries` stores the current media file count and byte total for each completed traversal. Capacity reporting uses the summary referenced by each source root rather than rescanning the wide path table. This table was added in schema version 2; a legacy scan without a row can still make an exact destination-space decision from `exact_groups`, but its source upper-bound and deduplication-savings display fields are null.

`source_files` stores the current observation of an exact path: first/last discovery times, presence, stat snapshot (size, mtime/ctime nanoseconds, device and file IDs), current source-version ID, classification, linked content asset, and current error. Missing paths are marked `present=0` only after a complete traversal; rows are never deleted automatically.

`source_versions` is append-only observation history. It stores the run/time and stat snapshot, exact extension text, discovery status/basis, media kind, MIME/format, mismatch flag, asset link, hash/metadata status, raw ExifTool/FFprobe JSON, normalized metadata JSON, warnings, and errors. Superseded observations retain their asset/path evidence.

`exact_groups` stores size and the three full-content hashes, collision discriminator, verification method, and creation time.

`assets` stores stable content identity; all hashes and algorithm-version JSON; media/MIME/format/extension; decoded-pixel, perceptual, sampled-video, and optional decoded-stream hashes; dimensions/duration; camera, lens, capture-time, orientation, and codec fields; raw metadata; deterministic object-relative path and verification state; run/timestamps; and warnings.

`asset_sources` is the many-to-many audited link from assets to historical source versions. It names the exact verification method and whether that version initially created the asset.

`destinations` stores every corresponding destination path, copy source version, status, verified size/hashes, validation run, timestamps, and errors. Schema version 2 normally has one canonical object path per asset but does not assume that forever.

`relationships` stores ordered non-exact asset pairs. Every row includes a relationship type, versioned method, human confidence label, numeric score, structured evidence JSON, and creation run/time. These rows never drive object consolidation. A relationship is authoritative only when its `created_run_id` refers to a completed run; interrupted-run rows are retained for audit and labeled non-authoritative by the API, dashboard, and asset exports. A successful rerun updates the origin run/time for the same relationship identity.

`raw_jpeg_groups` stores the stable RAW anchor, aggregate confidence, evidence, and creation run/time. `raw_jpeg_members` stores every RAW/JPEG member, role, member-level confidence/evidence, ambiguity flag, and all alternative group IDs. Group authority follows the same completed-origin-run rule.

`warnings` stores structured severity/code/message/evidence with optional source-file and asset links.

## Reviewed-inbox tables (schema version 4)

`import_batches` stores one durable batch for each immediate child directory of the configured inbox. It records the exact inbox/batch roots, truthful discovery phase, generation/revision, traversal completeness, persisted totals, classification and match-outcome rollups, review-ready time, and errors.

`import_items` stores the current view of every discovered file, folder, reparse point, or other entry. Stable rows retain exact absolute/relative paths, the complete non-atime stat snapshot, presence/generation, extension/signature/MIME/format evidence, classification, warnings/errors, triple hashes where applicable, exact-match outcome, RAW/JPEG candidate evidence, associated-sidecar evidence, and proposed/effective decision metadata. Complete traversal may mark unseen rows absent; rows are never deleted by discovery.

`import_item_observations` is append-only evidence. A deterministic fingerprint prevents an unchanged rescan from duplicating an observation, while a changed stat, classification, hash, match, relationship, or proposal creates a new immutable row.

`import_item_decisions` is append-only user decision history with optimistic per-item revisions and supersession links. The current effective decision is projected onto `import_items` for bounded indexed reads; no decision changes an inbox file or canonical object.

`import_folder_progress` is a rebuildable persisted rollup for each discovered folder. The root folder's inclusive item/file/folder/other, byte, decision, classification, match, and error totals reconcile with `import_batches`.

`background_jobs` begins as the Stage 2 discovery-job ledger and is completed in schema version 5 with priorities, bounded attempts, claim tokens, worker identity, leases, control state, retry timing, current run, and update evidence. Schema version 6 adds indexed `review_preview` and `asset_preprocess` work without mixing their claims or controls with reviewed-copy jobs. Stage 11 reuses the same ledger for a low-priority `vault_backfill` coordinator; no schema change or second queue is introduced. `background_job_attempts` preserves every claim/heartbeat/completion/interruption instead of overwriting retry history.

Manifest paging uses indexed binary-path keyset seeks. The Stage 2 service performs inbox classification and hashing only as background orchestration; it never inserts assets, destinations, or canonical objects and has no HTTP or frontend entry point.

## Reviewed-copy and telemetry tables (schema version 5)

`import_batch_approvals` stores the explicit review gate: batch revision/generation, a fingerprint of every current observation and decision, actor/time, exact approval summary and capacity evidence, separate execute authorization, consumption, and invalidation. `import_approval_items` snapshots every manifest outcome and marks only approved media plus sidecars whose associated media is included as copy-eligible. A decision or observation change invalidates execution until a new approval is recorded.

Schema version 5 extends `import_items` with approval identity, durable copy status/outcome, attempt count, asset/source-version/destination links, transferred/verified bytes, timestamps, and structured error code/text. Excluded, unrelated, structural, and ineligible-sidecar outcomes remain manifest metadata and never create an asset or object. `import_item_copy_attempts` retains each source snapshot, temp/destination evidence, publication result, bytes, and failure across retries.

`import_progress_samples` stores phase/status; reconciled discovered/processed/skipped/failed/duplicate/paired/remaining counts; scanned/transferred/verified/remaining bytes; current and EWMA throughput; ETA and its `learning`/`low`/`medium`/`high` confidence; observed read/write rates; queue/worker use; current path/folder; source/destination free space; storage projection; warnings; and metadata/thumbnail availability (explicitly unavailable in historical Stage 3-only samples). `import_folder_progress` is extended with matching copy counts/bytes and recent-path evidence. Samples and folder values are persisted by background workers, never derived by a frontend.

`import_events` is the filterable structured lifecycle log. `import_errors` stores path/folder context, cause, retryability, suggested resolution, and later resolution evidence without erasing the original failure. `legacy_import_history` backfills only values found in retained `runs`, reports, progress JSON, or JSONL; every missing metric remains absent with the literal reason `not recorded by this version`.

Reviewed copying creates/links the normal `source_roots`, append-only `source_versions`, `asset_sources`, `exact_groups`, `assets`, and `destinations` records, then uses the existing triple-hash, source-change, reopened-temp hash, byte-compare, fsync, atomic no-overwrite, collision, conflict, and recovery-sidecar contract. Pause/cancel/interruption removes only unpublished `.partial` work. Already published canonical objects are retained and verified/adopted on retry.

## Preprocessing tables (schema version 6)

`derivatives` stores one versioned output identity for an asset or review-manifest item, with the exact input identity/observation, selected source asset, derivative and representation kind, requested long edge, analyzer version, current/status state, source/output dimensions, WebP MIME type, SHA-256 checksum, byte size, certified file mtime, derivative-root-relative path, timestamps, and structured error. Ready state is committed only after the atomically published derivative is reopened and its checksum/size agree. Paths are deterministic and sharded below the configured regenerable derivative root; they never overlap an inbox, immutable source, or canonical `objects` path. Previous analyzer/input generations are marked `stale` rather than rewritten.

`asset_extended_metadata` stores current and historical analyzer/input generations for capture time/source/ambiguity, GPS/precision, camera/lens/serial, exposure fields, oriented dimensions, duration/codecs, software/edit evidence and likelihood, import/source-folder evidence, complete raw metadata JSON, warnings, status, timestamps, and errors. `asset_features` stores the independently versioned numeric inputs needed by later views: luminance histogram/entropy, sharpness/focus deficit, directional shake/motion, under/overexposure, clipping, near-black, blankness, obstruction, low information, blockiness, corruption/incomplete decode, resolution class, thumbnail/edit likelihood, deterministic composite quality, and cover-ranking evidence. Neither table implies rejection, deletion, or grouping.

Review-preview jobs read the immutable inbox observation and produce a 384-pixel derivative before approval. Asset jobs read only verified canonical objects, except that a confident accepted RAW/JPEG group may select its verified non-RAW companion as display input. Standalone RAW uses an embedded preview and video uses a poster. Decoder byte/pixel/time and subprocess-time limits convert failures into persisted unavailable/error evidence. HTTP requests never execute this pipeline.

## Review application tables (schema version 7)

`review_application_state` is a single-row authority for the monotonically increasing application generation used to detect stale state across tabs. Application-state mutations compare the caller's generation inside the same immediate SQLite transaction and advance it only after the row-level optimistic revision also matches.

`user_preferences` stores one JSON value per normalized preference key with creation/update timestamps and a monotonically increasing row revision. `saved_views` stores the local name, same-origin application route, state JSON, timestamps, revision, and a soft-deletion timestamp. Its active-view index supports descending updated-time/ID keyset pages without a temporary sort or table scan.

`api_idempotency_records` durably binds a mutation scope and caller key to the canonical request SHA-256 plus exact response status/envelope. A repeated identical request returns the committed response even if its original generation is now stale; reuse with different application metadata is rejected. These hashes cover API JSON only and never source or canonical media.

All Stage 5 API writes are limited to these application-metadata tables. They never change an inbox file, immutable source, canonical object, or derivative. The `/api/v1` response envelope reports schema version, application generation, request ID, optional keyset/job state, explicit unavailable legacy fields, and structured errors.

## Import-interface materializations (schema version 8)

`import_manifest_views` binds a normalized non-indexed manifest query to the exact batch revision, query SHA-256, analyzer version, durable job, status, item count, timestamps, and error evidence. `import_manifest_view_items` stores the resulting ordered item IDs and persisted sort evidence. Views are rebuildable SQLite metadata: request handlers may read a ready view or enqueue its durable materialization, but never perform the arbitrary compound sort, path scan, media analysis, or hashing themselves.

Common path/classification/outcome queries use the existing bounded manifest indexes directly. Version 8 also adds explicit keyset indexes for import history, events, and errors. The Stage 6 API reads persisted batch/folder/sample/event/error/manifest/derivative evidence; decision, approval, and control calls update application or import metadata; inbox discovery, approval capacity measurement, arbitrary view materialization, and reviewed execution are durable background jobs. Certified preview responses serve only already-ready derivative files after database and filesystem-stat validation. No Stage 6 HTTP handler or frontend code decodes, hashes, copies, analyses, ranks, groups, or generates media.

## Logical-photo library tables (schema version 9)

`photo_entities` is the rebuildable current logical-photo catalog. A high-confidence, non-ambiguous RAW/JPEG group from a completed run becomes one stable entity anchored by the RAW asset; other verified assets are standalone entities. The row stores the selected display asset, persisted path/time/equipment/exposure/dimension/size/quality/similarity sort inputs, duplicate/relationship counts, RAW evidence flags, and catalog generation. It does not cluster, rank, hash, decode, or inspect media. `photo_entity_members` records each member's role, display selection, and persisted RAW/JPEG confidence evidence.

`photo_user_state` stores entity-level favourite, rejected, rating, optimistic revision, and timestamps. `photo_user_state_events` is the append-only action audit with before/after JSON and idempotency evidence. These operations update SQLite metadata only; the default library query hides rejected entities.

`facet_rollups` stores catalog-generation-bound media-kind, format, camera, lens, and folder counts. `materialized_views` and `materialized_view_items` store both catalog builds and arbitrary normalized library query orders, with source catalog generation, application-state generation, analyzer version, job/status/error evidence, stable ordinal, and persisted sort evidence. Indexed single-order views use bounded keyset seeks immediately; path search, compound sorting, multi-valued filter combinations, and non-default seeded random order are durable background jobs. A later application-state generation cannot reuse an older state-sensitive arbitrary view.

The library API serves only certified current derivatives belonging to the selected display asset and validates derivative-root containment plus persisted size/mtime before responding. Detail, facet, and page handlers query bounded persisted evidence; state handlers update application metadata; preparation handlers enqueue jobs. Open-in-folder accepts only an entity ID and resolves a present source or verified destination stored in SQLite. No Stage 7 request or frontend code opens originals/canonical objects, calculates media data, or accepts a client-supplied path for execution.

## Alternate organization materializations (schema version 10)

`calendar_buckets` persists exact capture dates plus explicit `unknown` and `ambiguous` buckets, and `calendar_bucket_items` links every bucket to the same stable `photo_entities` used by the primary grid. `folder_hierarchy_nodes` stores source-root-relative parent/child nodes with direct and recursive logical-entity and source-occurrence counts; `folder_hierarchy_items` stores recursive membership and occurrence evidence so exact duplicate paths do not multiply logical mode. `equipment_rollups` and `equipment_rollup_items` store normalized camera/lens keys, display values, retained raw make/model/lens evidence, unknown values, counts, and stable entity membership.

`map_entity_locations` stores only already-persisted Stage 4 coordinates and deterministic geohashes for the current catalog; `map_unknown_location_items` keeps missing or invalid coordinates explicitly browsable. `map_clusters` stores bounded zoom 0â€“18 geohash clusters, centers, bounds, counts, and generation; `map_cluster_items` stores stable entity membership. Viewport requests, including antimeridian-crossing bounds, page stored cluster rows only. The UI uses bundled coarse world geometry and performs no tile, geocoding, coordinate, or other external request. Alternate-view library links add a persisted organization kind/key to the existing background `materialized_views` pipeline; no request aggregates dates/folders/equipment, computes a geohash, or groups/ranks media.

## Similarity Stack materializations (schema version 11)

`stack_feature_inputs` binds each current logical entity and selected prepared display derivative to a catalog generation, exact input identity, and Stack-feature analyzer. A background worker verifies derivative-root containment and the persisted size/mtime certificate, then persists versioned pHash, dHash, color distribution, aspect, capture epoch/bucket, normalized camera/filename, RAW/JPEG confidence, relationship count, and the existing edit/quality/cover-ranking primitives. Missing or changed derivatives produce an honest `partial` row with error evidence; the worker never falls back to original or canonical media. `stack_candidate_edges` records only pairs returned by bounded indexed time, perceptual-hash, and filename locality seeks. Each left entity admits at most 48 candidates, preventing all-pairs growth while retaining deterministic evidence and distances.

`stack_profiles` caches normalized user settings against the exact catalog plus Stack profile/feature analyzer versions and retains queued/building/ready/error job evidence. A new combination is a durable `stack_profile_materialize` job; previous ready profiles remain queryable until the replacement is ready. `stacks` stores stable ordered groups, the offline-ranked and effective cover, optional metadata-only override, revision, human explanation, method version, and complete evidence. `stack_members` stores every stable logical entity once per profile with deterministic order, rank score/evidence, and cover flags. `stack_cover_events` is the append-only override audit. Edited candidates are excluded whenever an unedited candidate exists before exposure, sharpness, motion, clipping, corruption, resolution, and deterministic tie-breaking are applied.

The Stack API pages only persisted profiles/groups/members or enqueues a background profile. Stack-aware library views join persisted covers and ordinals through the existing background `materialized_views` contract. Cover override changes SQLite metadata and application generation only. No HTTP handler or frontend code opens a derivative for analysis, generates a perceptual value, discovers a candidate, clusters entities, or ranks a cover.

## Explainable junk review (schema version 12)

`junk_signals` stores one versioned result for each logical entity and approved reason, including confidence, the threshold used by the analyzer, exact input identity, ready/partial status, structured evidence, and an optional better-alternative entity. Current-row flags invalidate changed inputs without erasing prior evidence. Signal materialization consumes only persisted entity, Stage 4 quality, user-state, relationship, and ready Stack evidence in a durable background job; it never opens media.

`junk_profiles` caches normalized confidence threshold, enabled-reason set, minimum-agreement rule, and favourite-protection setting against the catalog and analyzer/calibration versions. `junk_effective_results` stores the ready profile's bounded page order, effective-hidden decision, favourite protection, agreement/reason counts, human explanation, reason snapshots, and better alternative. Test-chart and downloaded-graphic likelihoods require corroboration under the default minimum-agreement profile, and focus deficit does not cross the automatic threshold without a sharper persisted Stack alternative.

`junk_feedback` is the append-only false-positive/false-negative audit with the exact signal snapshot and idempotency evidence. Once a sufficient feedback batch exists, a background calibration job creates a separately versioned successor profile; the parent remains ready, selectable, and available for rollback. Bulk reject and Reject the rest of this Stack reuse `photo_user_state`, its event audit, idempotency records, optimistic generation/revision checks, favourite and large-selection confirmations, and undo links. They change SQLite metadata only, preserve Stack covers, and never modify source or canonical media.

Junk APIs serve only ready persisted profiles, results, signals, and explanations or enqueue durable materialization/calibration jobs. No HTTP handler or frontend code analyzes media, calculates junk confidence, calibrates a profile, or performs grouping/ranking.

## Release backfill and audit (Stage 11; no schema change)

`vault_backfill` is a single durable coordinator over the existing version-12 job and materialization contracts. Its progress JSON persists an analyzer/version identity, phase, verified-asset total and keyset cursor, enqueued/completed/failed/unavailable counts, completed phases, active bounded child-job IDs, legacy-history count, and HDD throttle settings. It also retains a bounded window of completed preprocessing-attempt durations, the total timing-sample count, current and EWMA asset rates, ETA seconds, confidence (`learning`, `low`, `medium`, or `high`), and an explicit evidence basis. The ETA is active asset-preparation time only; it excludes pauses, queue starvation by higher-priority reviewed imports, and later catalog/organization/Stack/junk materialization rather than fabricating evidence for them. Asset preparation is enqueued in batches of at most the configured `backfill_batch_size` at lower priority than reviewed imports. Later phases ensure the current logical-photo catalog, facets and common views, organization rollups, default Stack profile, default junk profile, and legacy history. A completed phase is not repeated after restart; an interrupted running coordinator is recoverable, and pause/resume propagates only to its current bounded child jobs.

The Settings API reads this persisted state or changes job control metadata with optimistic generation and idempotency checks. Starting a backfill performs only a small SQLite enqueue; request handlers never enumerate assets, open media, calculate rollups, or drain jobs. Honest not-started, queued, running, paused, error, and complete states remain visible across browser/server restarts.

The release audit checks SQLite integrity and foreign keys, certified ready-derivative size and SHA-256, current materialized-generation lineage, and coordinator state. It reads only the manifest and existing regenerable derivatives; it does not open source or canonical media. Full source/canonical hash/stat snapshots remain an external operation boundary around migration/backfill verification.

## Sidecar asset record

Each sidecar has:

- `record_schema` and `record_schema_version`;
- generation timestamp and stable `asset_id`;
- current canonical destination filepath;
- the complete `assets` row;
- all linked source locations and historical versions, including exact-verification methods;
- all destination rows;
- all near/non-exact relationships in either direction;
- all RAW/JPEG memberships, ambiguity, and alternatives;
- linked warnings.

The sidecar is atomically replaced when state changes. It is metadata about the vault object, not a modification of the media bytes.

## JSONL export

Line 1 is `immutable-media-vault.manifest-header` and declares record, SQLite schema, generation time, and run ID. Every subsequent line is one complete sidecar-shaped asset record ordered by asset ID. Programs should reject unsupported schema versions rather than guessing.

## Explicit migration contract

`media-vault migrate --vault ...` is the only schema-upgrade entry point. It holds `state/active-writer.lock`, refuses a live writer, validates the input manifest, verifies available backup space, creates a unique SQLite backup under `state/backups`, validates that backup, applies each registered migration transactionally, and checks the resulting version, foreign keys, and integrity. A repeated run against the current schema is a validated no-op. Transaction/interruption failures roll back; a post-commit validation failure restores the verified backup. Migration code operates only on state metadata and never reads or writes source media or canonical objects.

## Status values

Important source `discovery_status` values are `pending`, `media`, and `non_media`. `hash_status` includes `verified`, `not_media`, and `error`. Destination/object status includes `missing`, `verified`, `source_unavailable`, `conflict`, `error`, and `mismatch`.

Reviewed-import batch phases are `discovered`, `discovering`, `hashing`, `matching`, `preparing_previews`, `awaiting_review`, `copying`, `verifying`, `indexing`, `thumbnailing`, and `complete`, with durable `paused`, `cancelled`, `interrupted`, and `failed` states. Review classifications are `folder`, `photo`, `raw`, `video`, `sidecar`, `unsupported`, `non_media`, and `corrupt`; `pending` is used only while a generation is incomplete. Effective decisions are `include`, `exclude`, `not_applicable`, or `pending`. Item copy states are `not_approved`, `approved`, `copying`, `verified`, `excluded`, `skipped`, `not_applicable`, and `failed`. Generated preprocessing states are `queued`, `processing`, `ready`, `error`, and `stale`; an error is an honest unavailable output and never changes media.

Only `verified` means a destination completed the full copy-verification contract. A source metadata failure does not prevent `hash_status=verified` or copying when extension/signature evidence retains it as media.
