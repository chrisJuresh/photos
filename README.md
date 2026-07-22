# Immutable Media Vault

> [!CAUTION]
> **The current review-interface/backfill work is a review snapshot, not a live-vault release.** Do not run `review-ui`, `worker`, `inbox-scan`, `preprocess --backfill`, the live-backfill launcher, legacy `analyze`, legacy `validate`, or a live schema migration until the blockers in [docs/SAFETY_HOLD.md](docs/SAFETY_HOLD.md) are fixed and reverified on an isolated synthetic corpus and copied database. The legacy read-only dashboard remains a separate interface, but it also has privacy hardening work listed in the review.

This project discovers images and videos in an immutable source tree, records their history and relationships, and copies each distinct byte sequence into a separate content-addressed vault. The source is opened only for enumeration and binary reads. ExifTool and FFmpeg are invoked only in read/inspect modes. No database, cache, sidecar, log, temporary file, or output is placed beneath the source.

The intended paths on this machine are:

- immutable source: `G:\photos`
- destination vault: `G:\MediaVault`
- code and Python environment: `C:\Users\Chris\Documents\photos`

`G:\MediaVault` is not a human photo-library layout. It is a stable machine-oriented object store backed by SQLite, JSON sidecar records, JSONL, and structured run logs.

## Source access-time policy

The tool checks Windows' NTFS last-access policy before it enumerates a source. At the time this project was created, Windows reported:

```text
DisableLastAccess = 2  (System Managed, Last Access Time Updates ENABLED)
```

Merely reading a file can therefore change source access-time metadata. The user subsequently and explicitly waived access-time preservation for this source. The real scan/import may therefore use `--allow-unsafe-atime`. This waiver applies only to access timestamps: the source-content, naming, permissions, other timestamps, attributes, and directory-entry prohibitions remain in force. The default refusal remains in the program to prevent accidental use without an explicit command-line acknowledgement.

## Installed and pinned tooling

- Python 3.14.6 project environment in `.venv`
- ExifTool 13.59, installed per-user outside the source and vault
- FFmpeg/ffprobe 8.1.1 already present on the machine
- Python dependencies pinned in `requirements.lock`: BLAKE3 1.0.9, Pillow 12.3.0, ImageHash 4.3.2, NumPy 2.5.1, FastAPI 0.139.2, Uvicorn 0.51.0, and their exact runtime dependencies
- Test-only packages are recorded separately in `requirements-test.lock`
- Node 22/npm 10 for the separate review application; exact Svelte 5, SvelteKit, TypeScript, static-adapter, TanStack Virtual, Vitest, Testing Library, Playwright, and accessibility dependencies are locked in `review_ui/package-lock.json`

Run commands from PowerShell with [run.ps1](./run.ps1):

```powershell
Set-Location 'C:\Users\Chris\Documents\photos'
.\run.ps1 --help
```

## Safe operating sequence

Initialize an empty destination without accessing the source:

```powershell
.\run.ps1 init --vault 'G:\MediaVault'
```

An existing supported schema-version-2 through schema-version-11 vault remains readable by all legacy commands and is never upgraded merely by opening it. When no writer is active, migrate it explicitly:

```powershell
.\run.ps1 migrate --vault 'G:\MediaVault'
```

`migrate` acquires the existing single-writer guard, checks backup space, creates and verifies a unique SQLite backup under `state\backups`, applies the ordered migration in one transaction, and runs schema-version, foreign-key, and integrity validation. It is repeatable. It does not enumerate or read source media or canonical objects, and it refuses a live `active-writer.lock`.

After the last-access safety issue is resolved, perform the full read-only discovery/hash/capacity pass. This does not copy media objects:

```powershell
.\run.ps1 preflight --source 'G:\photos' --vault 'G:\MediaVault' --allow-unsafe-atime
```

Review the run report in `G:\MediaVault\reports`. It states the all-source upper bound, exact-deduplicated object requirement, safety margin, current free space, and `sufficient_free_space`. A preflight always defaults to full rehashing so same-size stealth changes are not trusted merely because timestamps look unchanged.

Complete scans persist their current media count and byte total, so later capacity reports do not reconstruct totals by scanning the large path table. The first legacy scan made before schema version 2 has no persisted source-total row; its report therefore leaves the source upper-bound and deduplication-savings display fields null, while still making an exact sufficiency decision from the complete full-hash-group ledger.

Preflight deliberately ends after discovery, full-content hashing, exact-duplicate accounting, and the capacity report. RAW/JPEG pairing, visual/decoded relationship analysis, and bulk sidecar/export generation are deferred so they cannot delay the capacity decision.

If a writer was interrupted after its scan completed but before it published the capacity report, finish from the durable scan without reading or enumerating the source again:

```powershell
.\run.ps1 finalize-preflight --vault 'G:\MediaVault'
```

On the next writer command, stale `running` run rows are marked `interrupted`; SQLite retains committed scan transactions and rolls back only unfinished work.

Only after reviewing a successful and sufficient report, start the copy explicitly:

```powershell
.\run.ps1 import --source 'G:\photos' --vault 'G:\MediaVault' --allow-unsafe-atime --execute
```

`import` rescans and rehashes before copying, recalculates capacity, refuses incomplete traversal or insufficient space, and requires the explicit `--execute` gate. It never silently overwrites an object.

Import ends when verified object copying ends. It writes/reconciles each copied asset's recovery sidecar incrementally, but deliberately defers relationship analysis and the bulk portable exports so those phases cannot make a finished copy look stuck.

Record non-exact relationships after import (it can also read a currently available source when an object is not copied yet):

```powershell
.\run.ps1 analyze --vault 'G:\MediaVault'
```

Sampled video similarity is the standard behavior. Full decoded primary-stream hashing is deliberately separate because decoding a terabyte-scale video collection can be vastly more work than reading its stored bytes:

```powershell
.\run.ps1 analyze --vault 'G:\MediaVault' --deep-video
```

Validate every destination object with all full-content hashes and byte-compare it with an available source representative:

```powershell
.\run.ps1 validate --vault 'G:\MediaVault'
```

Other useful commands:

```powershell
.\run.ps1 status --vault 'G:\MediaVault'
.\run.ps1 progress --vault 'G:\MediaVault' --interval 10
.\run.ps1 ui --vault 'G:\MediaVault'
.\run.ps1 export --vault 'G:\MediaVault'
.\run.ps1 rebuild-index --vault 'G:\MediaVault' --output 'C:\recovery\media-vault-recovered.sqlite3'
```

`progress` reads only a tiny atomic snapshot under `state\progress`; it does not query the large SQLite database or enumerate the source. Because the scanner discovers the total population during the same pass, its bar is intentionally indeterminate and shows live counts, newly hashed bytes, snapshot age, recent rate, errors, and warnings rather than a fabricated percentage. `Ctrl+C` stops only this viewer.

## Read-only dashboard

The local dashboard can be used while a scan is running; there is no benefit to waiting for the scan to finish. Start it with:

```powershell
.\run.ps1 ui --vault 'G:\MediaVault'
```

It opens [http://127.0.0.1:8765/](http://127.0.0.1:8765/) and stays in the foreground. `Ctrl+C` stops only the dashboard, never the scanner. Add `--no-open` to suppress automatic browser opening, `--port 9000` to choose another local port, or `--derivative-root ...` when prepared derivatives use a non-default root.

The dashboard includes live scan throughput sampled in the browser, capacity and pipeline state, assets, every preserved source path, exact-duplicate groups, non-exact relationships, RAW/JPEG groups, warnings, runs, manifest locations, and the versioned table contract. List views use bounded cursor pagination so a million-row manifest is never loaded into browser memory at once. Detailed whole-manifest aggregates are deferred while a writer is active unless the user deliberately requests a snapshot.

The server binds only to localhost, accepts only `GET`, `HEAD`, and `OPTIONS`, opens SQLite with `mode=ro` and `query_only=ON`, and provides no mutation endpoint. Static assets have no external network dependencies. Live status polls only the small atomic progress record (five seconds while visible, thirty seconds in a background tab), so it does not repeatedly aggregate the database. Preview requests now perform only a bounded database lookup and file serving: they prefer a checksum-verified ready WebP under the configured regenerable derivative root and may fall back to an already existing legacy UI-cache JPEG. Missing, preparing, and error states are reported without opening source or canonical media, decoding, hashing, or starting ExifTool/FFmpeg. The legacy cache remains outside both source and vault; prepared derivatives remain separate from canonical `objects`.

## Separate review application

Stage 5 adds an independent SvelteKit application without changing the read-only dashboard. After the explicit schema migration, start it on its separate default port with:

```powershell
.\run.ps1 review-ui --vault 'G:\MediaVault' --inbox 'G:\MediaVaultImports'
```

The application binds only to localhost at [http://127.0.0.1:8766/](http://127.0.0.1:8766/), serves its self-contained production build, and uses only the versioned `/api/v1` namespace. Add `--no-open` to suppress browser launch or `--no-worker` to run the durable worker separately. The import workspace provides durable batch discovery, history and comparison, phase/folder/progress telemetry, a filterable event/error audit, a virtualized review manifest with metadata-only include/exclude and undo, explicit approval/preflight/execute gates, persisted preview states, and pause/resume/cancel controls. The library workspace provides a bounded virtualized logical-photo grid, responsive density and contact-sheet modes, display-only grayscale, persisted facets and saved views, immediate indexed and background compound sorts, default rejected hiding, selection/keyboard actions, database-resolved open-in-folder, and a full persisted-evidence inspector. Adjustable Stack profiles persist transparent perceptual/time/equipment settings, use bounded indexed candidate generation, retain the previous ready profile during background preparation, rank explainable covers offline with edited-candidate protection, and integrate persisted Stack order, layered cards, member expansion, and metadata-only cover overrides into the same library. The organization workspace adds persisted calendar/unknown-time buckets, a recursive source hierarchy with logical-photo and source-occurrence modes, normalized camera/lens drill-down with raw evidence retained, and a private map backed by bundled land geometry and persisted geohash clusters. The Junk review workspace uses only background-materialized, versioned signals and profiles, exposes threshold/reason/agreement/favourite controls and human explanations, supports false-positive/false-negative feedback and separately versioned calibration, and previews exactly what a ready profile would hide. Its separate virtualized Bulk reject route and the Stack inspector action use explicit confirmation, metadata-only reject, favourite preservation, bounded safeguards, audit, and undo. Every alternate-view or Stack link becomes a bounded background-materialized library view over the same stable entities and metadata-only state. Favourite, reject, rating, Stack cover, and junk-review actions are optimistic, idempotent, auditable SQLite metadata only.

The review API applies a self-only content security policy, trusted localhost hosts, same-origin checks for every mutation, JSON-only bounded payloads, bounded SQLite query time, durable idempotency records, optimistic global generations and row revisions, strict keyset cursors, and common typed response/error/job/unavailable-field envelopes. SQLite is authoritative for preferences, saved views, logical-photo state, facets, organization rollups/clusters, Stack profiles/memberships/covers, junk signals/profiles/results/feedback, and materialized query order, so settings, map viewport, profiles, and review actions survive both browser and server restarts. The private map makes no external tile, coordinate, font, script, analytics, or CDN request. HTTP handlers perform no media decoding, hashing, copying, analysis, ranking, grouping, derivative generation, calibration, or rollup aggregation; library responses serve only already-ready certified derivatives for the persisted display asset.

The matching public orchestration commands are:

```powershell
.\run.ps1 inbox-scan --vault 'G:\MediaVault' --inbox 'G:\MediaVaultImports'
.\run.ps1 worker --vault 'G:\MediaVault' --inbox 'G:\MediaVaultImports'
.\run.ps1 preprocess --vault 'G:\MediaVault'
```

`inbox-scan` performs the existing guarded discovery workflow and enqueues review-preview jobs; it never publishes canonical media. `worker` claims only registered durable reviewed-copy, preprocessing, materialized-view, Stack, junk-profile, and release-backfill job kinds and runs each through its guarded entry point. `preprocess` drains preprocessing jobs; `--backfill` creates or resumes the low-priority release coordinator, which prepares verified assets in bounded batches and then materializes the catalog, facets, common views, organization rollups, default Stack and junk profiles, and legacy history. Verified imports retain priority over release work. The coordinator and its current bounded child batch are durably pausable/resumable from Settings, and interruption leaves a resumable job rather than restarting completed phases. These commands preserve the legacy `import` command rather than redirecting it.

On the configured Windows workstation, double-click `Resume Live Vault Backfill.cmd` to resume the persisted `G:\MediaVault` job, start one low-priority worker, and open the separate review interface without a second worker. Closing the worker window interrupts safely; double-clicking the launcher again resumes committed progress. The Settings progress bar learns its ETA from persisted completed asset-attempt durations, labels confidence, and reports active processing time only; paused time and the final catalog/organization/Stack/junk materialization phases are not included.

For an existing large vault, first exercise migration and the complete workflow against an isolated copied database. Before the live command, confirm there is no active writer, enough backup space, and a clean SQLite integrity/foreign-key result. The explicit migration creates and verifies its own retained backup. Start the live backfill only afterward; its persisted Settings panel reports the exact phase, counts, unavailable outputs, and current bounded batch without implying that queued work is ready. Pausing changes job metadata only and does not remove completed derivatives or materializations.

The recovery command refuses to overwrite its output. It reconstructs a new SQLite search/validation index from asset sidecars and rehashes the objects. Original source history is recoverable from the sidecars even if the primary database is lost.

## Exact deduplication and collision safeguards

Every discoverable media candidate is read in full and assigned SHA-256, SHA-512, and BLAKE3 digests in one pass. Sizes and algorithm/version descriptions are stored with the asset. A second source is consolidated with an existing exact group only after the independent full-content hashes match. When a representative source or verified object is accessible, the files are also compared byte-for-byte. The first source defines a new content asset and is not a deduplication decision.

Three independent full-content digests make an accidental collision extraordinarily less likely than a single hash. The implementation still handles the failure case: if all primary hashes match but byte comparison differs, it computes SHA3-512, records a critical collision warning, assigns a separate collision discriminator, and uses a separate object path. Hashes, names, sizes, timestamps, metadata, perceptual hashes, and visual similarity alone are never accepted as exact equality.

The content-addressed path is deterministic and short enough for normal Windows limits:

```text
objects/sha256/aa/bb/<sha256>_<blake3-prefix>_<sha512-prefix>_<size>.blob
```

The `.blob` suffix is intentionally format-neutral. Actual format, MIME type, original suffix, and every original path are stored as data; a misleading source extension cannot influence identity or collide with another file.

## Copy and crash-safety model

Each new object is copied with SHA-256, SHA-512, and BLAKE3 computed during the write. The temporary file is flushed and `fsync`ed, reopened and fully rehashed, then byte-compared against the source. It is published with an atomic same-filesystem hard link that fails if the final path already exists; the temporary link is then removed. An unexpected existing path is verified and reused only if its hashes and bytes match. Otherwise it is recorded as a critical conflict and never overwritten.

SQLite uses WAL mode, foreign keys, `synchronous=FULL`, small committed transactions, and a durable run ledger. A crash can leave an unreferenced `.partial` file in `state\tmp`, but it cannot make that partial file the canonical object. If publication succeeds just before a crash, the next run verifies and adopts the already completed object. Existing objects are never deleted automatically, including when all old source paths disappear.

Schema changes are separate maintenance operations. Normal manifest opens accept supported schema versions without executing DDL or rewriting `schema_info`. Review-specific entry points require the current schema and report the explicit `migrate` command when an older supported manifest is encountered. Schema version 6 adds the Stage 4 persisted derivative, extended-metadata, and transparent quality-feature contracts; schema version 7 adds only the Stage 5 application-state, saved-view, generation, and idempotency foundation; schema version 8 adds only the Stage 6 background manifest-view materialization and bounded import-history/event/error paging indexes; schema version 9 adds the Stage 7 logical-photo catalog, user-state/audit, facet, and general library materialization contracts; schema version 10 adds only the Stage 8 calendar, folder, equipment, map-location/geohash-cluster, and linked membership contracts; schema version 11 adds only the Stage 9 Stack feature inputs, bounded candidate edges, normalized profiles, memberships, cover explanations, and override audit; schema version 12 adds only the Stage 10 versioned junk signals, profiles, effective results, and feedback. Stage 11 requires no schema change: it coordinates the existing durable contracts and audits their release state. Migration remains explicit and must be proven against an isolated copy before live use.

## Review configuration contract

`media_vault.config.ReviewConfig` defines the typed contract for the vault root, configurable inbox (default `G:\MediaVaultImports`), regenerable derivative root, separate dashboard/review ports (8765/8766), localhost binding, worker limits, request budgets, and analyzer versions. Its path validation keeps the inbox outside the vault and derivatives disjoint from canonical `objects`; callers must also validate each immutable source root with `assert_source_separated`.

`media_vault.review_copy.ReviewedImportService` is the headless reviewed-copy contract. It snapshots an approval against the exact manifest revision/observations, requires a second explicit execute authorization, enqueues a claim/lease/heartbeat job, and copies only eligible approved media and associated sidecars. Pause, resume, cooperative cancellation, bounded retry, progress samples, structured events/errors, folder reconciliation, and completed history are durable in SQLite. Stage 6 measures approval capacity and authorizes execution in durable background jobs so request handlers consume persisted evidence only. `run_reviewed_copy_job` is the lock-owning service entry point used by the worker.

`media_vault.preprocess.PreprocessingService` is the headless Stage 4 pipeline. `prepare_review_batch` creates durable 384-pixel review-preview jobs and keeps the batch in `preparing_previews` until every included media item has a persisted ready or honest unavailable state; approval refuses an unprepared batch. Verified assets can be enqueued for 192, 384, 768, and 1536-pixel WebP derivatives, with a 2560-pixel detail derivative when source dimensions warrant it, plus extended metadata and versioned numeric quality primitives. Video posters, RAW embedded previews, and accepted high-confidence non-RAW companions are resolved only in this background pipeline. Jobs are deterministic, leased, resumable, analyzer-versioned, and atomically publish only below the derivative root. `run_preprocessing_job` is the lock-owning entry point used by both Stage 5 worker surfaces.

## What is and is not deduplicated

- **Exact file duplicate:** same size and all three full-file hashes, with byte comparison whenever a representative is available. Only this class shares one canonical object automatically.
- **Identical decoded image pixels:** orientation-normalized RGB/RGBA pixels hash identically after Pillow decoding. This can relate metadata/container variants but never discards either byte-distinct asset.
- **Identical decoded video streams:** optional deep FFmpeg analysis hashes canonical YUV444P video and stereo 48 kHz PCM audio. A match is recorded at high confidence but remains non-exact file content.
- **Near-duplicate image:** 64-bit perceptual hashes within a documented Hamming threshold, constrained by aspect ratio. Evidence and distance are stored; no consolidation occurs.
- **Visually similar video:** a deterministic sequence of twelve sampled-frame perceptual hashes. This is sampled evidence only and never exact identity.
- **Edited versions, bursts, and related captures:** retained as distinct assets. The current implementation records relationships it can evidence; it does not invent a group solely from adjacent filenames or timestamps.
- **RAW/JPEG companion or derivative:** conservative multi-signal relationship described below. It never controls deduplication.

## RAW/JPEG grouping

Every group is anchored by a stable RAW asset ID, making the group ID stable when paths move or new JPEG derivatives appear. The relationship scorer records case-folded exact stems, recognized edit suffixes, source-directory proximity, capture-time delta, camera make/model/serial matches, and aspect-ratio delta. A filename alone is insufficient. Acceptance requires a threshold plus corroborating metadata (normally capture time and model/serial). One RAW can have multiple JPEG members. If a JPEG qualifies for several RAW anchors, every alternative group ID is recorded and the member is marked ambiguous instead of forcing a single answer.

## Discovery and format handling

ExifTool is applied in batches to all files, not just familiar extensions. Content signatures and a broad image/RAW/video extension inventory provide independent evidence. FFprobe augments video metadata. A corrupt or unsupported file with media extension/signature evidence is still fully hashed and copied; its extraction failure or content disagreement becomes a warning. Reparse points and symbolic links are not followed, preventing loops and accidental traversal outside the named source.

This approach covers the formats understood by ExifTool/FFmpeg plus extension-evidenced malformed or unsupported candidates. No finite toolchain can guarantee recognition of an unknown proprietary format with neither a recognizable signature nor a media-like extension; non-media discovery rows are retained in SQLite so classification can be revisited with a later tool version.

## Incremental behavior and performance

Full rehash is the default because it is the only robust way to detect changed bytes when size and timestamps are unreliable. `--reuse-unchanged-hashes` is available as an explicit weaker optimization; it keys the cache on size, mtime, ctime, device ID, and file ID. Source versions are append-only, so the old content/path association remains in history when a path changes.

The current source and destination share an HDD. Sequential large-block hashing/copying is intentional: parallel reads on one spindle cause seeks and usually reduce throughput. ExifTool discovery is batched, triple hashes share one read pass, SQLite writes are bounded, and image relationship search uses a BK-tree rather than an all-pairs scan. The design can safely raise analysis concurrency in a future NVMe-specific revision, but never by relaxing verification.

## Tests

The isolated test corpus is created under the Windows temporary directory, never under `G:\photos`. It contains exact duplicates with different names/extensions, same decoded pixels with different metadata, same names with different bytes, Unicode/multiple-extension names, an extension/content mismatch, a corrupt JPEG candidate, a synthetic RAW/JPEG pair, and a non-media file. Tests cover:

- source byte/stat immutability across preflight and import;
- report-only preflight and the explicit import gate;
- exact consolidation and collision-safe distinct assets;
- verified copying, rerun without extra objects, and full validation;
- decoded-pixel and RAW/JPEG relationships;
- append-only detection of a changed source;
- sidecars, JSONL/CSV export, and recovery-index rebuild.
- dashboard GET-only enforcement, query-only manifest reads, static UI delivery, and manifest API responses.
- separate review API security, migration state, preference/saved-view persistence, optimistic conflicts, idempotency, keyset paging/query plans, job envelopes, and source/canonical immutability.
- logical-photo catalog stability, RAW/JPEG display selection, certified derivative serving, facet/detail evidence, metadata-only favourite/reject/rating persistence, arbitrary-view invalidation, database-resolved folder opening, and 146,034-entity indexed keyset paging.
- deterministic calendar/unknown/ambiguous buckets, recursive folder logical/occurrence counts, equipment normalization/raw evidence, persisted map geohashes/zoom clusters and antimeridian viewports, alternate-view linked library materialization, query plans, recovery, and source/canonical immutability.
- persisted perceptual similarity inputs, bounded candidate generation, reproducible Stack profiles, deterministic best-frame ranking, metadata-only cover overrides, Stack-aware library views, recovery, query plans, and source/canonical immutability.
- versioned explainable junk signals and profiles, deterministic effective decisions, favourite protection, better alternatives, feedback/calibration lineage, metadata-only bulk reject/undo and Stack-rest actions, recovery, query plans, and source/canonical immutability.
- copied-database migration, resumable/pauseable bounded release backfill, full materialization lineage, derivative checksum and SQLite integrity audits, sidecar/export/recovery compatibility, interruption recovery, and source/canonical immutability.
- locked TypeScript/Svelte checks, Vitest and Svelte Testing Library, production static build, DOM-only Playwright smoke tests, and automated accessibility checks with screenshot/video/trace capture disabled.

Run them with:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m ruff check .
Set-Location .\review_ui
npm ci
npm run check
npm test
npm run build
npm run test:e2e
npm run test:a11y
```

See [SCHEMA.md](./SCHEMA.md) for the manifest contract.
