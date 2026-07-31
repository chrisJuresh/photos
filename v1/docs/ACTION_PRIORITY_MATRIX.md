# Complete action priority matrix

This is the implementation order from the 2026-07-22 full repository review. It includes safety, architecture, operations, API, frontend, test, performance, privacy, documentation, and usability work. Passing tests do not override this order: the current branch remains under [SAFETY_HOLD.md](SAFETY_HOLD.md).

## Ranking method

- `#` is the strict recommended implementation order; lower is earlier.
- Category columns are importance rankings from 0 to 5: `5` release-critical, `4` high, `3` material, `2` useful, `1` minor, `0` no meaningful effect.
- `Safe` = media/data integrity and operator safety.
- `UX` = ease of use and protection from user error.
- `Rel` = reliability, crash recovery, and disaster recovery.
- `Sec` = security and privacy.
- `Scale` = performance and large-vault behavior.
- `Maint` = maintainability, testability, and future-change safety.
- Effort is `XS`, `S`, `M`, `L`, or `XL`. It is an estimate, not an excuse to reorder safety work.

Ties are intentional: two actions can be equally important within a category while still having a strict overall order.

## Master order

| # | ID | Action | Phase | Safe | UX | Rel | Sec | Scale | Maint | Effort |
|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | W01 | Replace `VaultRunLock` with one race-free, host-aware writer/maintenance barrier used by CLI, API, workers, migration, backup, and restore | P0 | 5 | 3 | 5 | 4 | 2 | 5 | L |
| 2 | W02 | Replace hard-link publication with a proven atomic no-replace/immutable protocol; reconcile orphan partial aliases; preserve conflicts with unique no-overwrite evidence | P0 | 5 | 1 | 5 | 4 | 2 | 5 | L |
| 3 | W03 | Centralize canonical, derivative, inbox, source, preview, and OS-open path resolution with realpath/no-follow containment and corrupted-DB fault tests | P0 | 5 | 2 | 5 | 4 | 2 | 5 | M |
| 4 | W04 | Replace per-stage job logic with one transactional claim/lease/heartbeat/retry/pause/cancel/recovery engine for every job kind | P0 | 5 | 5 | 5 | 3 | 4 | 5 | XL |
| 5 | W05 | Add a transactional post-copy outbox/job DAG and source revisions; invalidate projections and preserve user state through logical-entity merge/split lineage | P0 | 4 | 5 | 5 | 2 | 5 | 5 | XL |
| 6 | W06 | Isolate backfill to its own coordinator/children, persist an immutable inventory/generation, count every attempt, cap retries, and handle concurrent imports | P0 | 5 | 5 | 5 | 2 | 5 | 5 | L |
| 7 | W07 | Implement and repeatedly test application-consistent full backup, encrypted remote replication, retention, restore, and disaster-recovery audit | P0 | 5 | 4 | 5 | 5 | 3 | 4 | L |
| 8 | W08 | Route every possible source/inbox/canonical read through one local policy gate that proves protected metadata will remain unchanged (or uses an approved snapshot method), and surface blocked reasons | P0 | 5 | 5 | 5 | 3 | 2 | 5 | M |
| 9 | W09 | Make migration refuse every live writer; budget backup + migration + rollback growth, verify backup checksums/durability, and require copied-DB rehearsal | P0 | 5 | 3 | 5 | 3 | 2 | 4 | M |
| 10 | W10 | Bind every approval/confirmation to the exact batch/entity/profile/selection revision; reset or remount when the subject changes | P0 | 5 | 5 | 4 | 2 | 1 | 4 | S |
| 11 | W11 | Route all multi-item rejection—including Library selection—through favourite/large-selection safeguards, exact-target confirmation, audit, and undo | P0 | 5 | 5 | 4 | 2 | 2 | 4 | M |
| 12 | W12 | Preserve selections/history on failure, disclose or clear hidden selections, and expose durable recent undo across reloads for bulk and Stack actions | P0 | 4 | 5 | 5 | 2 | 2 | 4 | M |
| 13 | W13 | Version/content-address derivative URLs or use private ETag revalidation; never cache a “current” URL as public immutable for a year | P0 | 4 | 4 | 5 | 5 | 3 | 4 | M |
| 14 | W14 | Define filesystem durability semantics: read-only ACL/attributes, parent-directory fsync where applicable, power-loss tests, and supported filesystem matrix | P0 | 5 | 2 | 5 | 3 | 2 | 5 | L |
| 15 | W15 | Enforce source read-only and canonical append-only/immutable permissions at the OS/storage layer as defense in depth | P0 | 5 | 3 | 5 | 4 | 2 | 4 | L |
| 16 | W16 | Replace sample checks with a full semantic audit; make every approval/execute capacity decision reconcile DB claims with current object/path/filesystem truth; prove derivative/projection lineage and restore | P0 | 5 | 4 | 5 | 3 | 4 | 4 | M |
| 17 | W17 | Add TrustedHost/hostname protection to the legacy dashboard to prevent DNS-rebinding disclosure of paths, metadata, and location evidence | P1 | 2 | 1 | 3 | 5 | 1 | 3 | S |
| 18 | W18 | Add persistent structured request/job/error logs, request-ID correlation, queue/worker health, heartbeat age, alerts, and redaction | P1 | 3 | 5 | 5 | 4 | 3 | 4 | M |
| 19 | W19 | Move workers out of the web daemon thread; supervise them separately and make shutdown wait for a cooperative, evidenced safe boundary | P1 | 4 | 4 | 5 | 3 | 3 | 4 | M |
| 20 | W20 | Make `status`, release audit, backup inspection, and other readers truly read-only and incapable of initializing or switching journal mode | P1 | 4 | 3 | 5 | 3 | 2 | 4 | M |
| 21 | W21 | Limit request bodies while streaming; keep GET read-only; use explicit idempotent prepare POSTs; document the trusted-local threat model | P1 | 3 | 2 | 4 | 5 | 3 | 4 | M |
| 22 | W22 | Centralize frontend data loading with AbortController, request epochs, latest-response-wins, deduplicated polling, teardown, and one durable job watcher | P1 | 3 | 5 | 5 | 2 | 4 | 5 | L |
| 23 | W23 | Consume all cursors, add previous/back stacks and server facet search, and disclose counts/truncation for every capped detail collection | P1 | 2 | 5 | 4 | 2 | 5 | 4 | L |
| 24 | W24 | Deduplicate active jobs by subject/options and reconnect the UI to the existing durable job instead of enqueuing timestamp duplicates | P1 | 3 | 4 | 5 | 2 | 4 | 4 | M |
| 25 | W25 | Keep application generation monotonic on idempotent replay and add idempotency expiration, compaction, size limits, and audit-safe retention | P1 | 4 | 3 | 5 | 3 | 4 | 4 | M |
| 26 | W26 | Add bootstrap/config/tool checks plus a strictly read-only semantic `vault doctor` (media-free default; explicit full audit mode) | P1 | 4 | 5 | 5 | 3 | 3 | 5 | L |
| 27 | W27 | Add CI with full Python/frontend checks, coverage thresholds, concurrency/crash/disk-full/property tests, and capture-disabled populated E2E | P1 | 4 | 3 | 5 | 4 | 4 | 5 | L |
| 28 | W28 | Build/test wheel and sdist in a clean environment; verify bundled UI/package data; persist Git/build identity; adopt honest prerelease/version compatibility | P1 | 3 | 4 | 5 | 3 | 2 | 5 | M |
| 29 | W29 | Add automated Python/npm advisory checks, hashed/reproducible locks, SBOM/license policy, and documented safe dependency updates | P1 | 3 | 3 | 4 | 5 | 2 | 4 | M |
| 30 | W30 | Split the 4,747-line review API into domain routers, use cases, repositories, and typed response contracts while retaining central security/idempotency | P1 | 3 | 3 | 4 | 4 | 4 | 5 | XL |
| 31 | W31 | Split schema/migrations/data access by domain; centralize transactions and add status/value constraints plus transition validation | P1 | 4 | 2 | 5 | 3 | 4 | 5 | XL |
| 32 | W32 | Generate/share API schemas and TypeScript types, validate response envelopes at the boundary, and standardize timeouts/network errors | P1 | 3 | 4 | 5 | 3 | 3 | 5 | L |
| 33 | W33 | Implement configured total/media/analysis worker limits and resource classes, or remove the misleading fields and documentation claims | P1 | 3 | 4 | 5 | 3 | 5 | 4 | L |
| 34 | W34 | Bound/sandbox every decoder/subprocess, avoid pipe deadlocks, and verify persisted derivative checksums before similarity/ranking analysis | P1 | 4 | 3 | 5 | 5 | 4 | 4 | L |
| 35 | W35 | Export/import a complete portable review-state snapshot in addition to asset sidecars, with schema/version checks and round-trip tests | P1 | 4 | 4 | 5 | 4 | 3 | 5 | L |
| 36 | W36 | Stream large CLI/database iterations; build recovery output in a validated temporary DB; publish atomically and resume/retry only by explicit safe choice | P2 | 3 | 4 | 4 | 2 | 5 | 4 | M |
| 37 | W37 | Canonicalize source/vault root identity on Windows while preserving display spelling, so case/alias variants do not fragment history or totals | P2 | 4 | 3 | 4 | 3 | 3 | 4 | M |
| 38 | W38 | Read immutable inputs through one no-follow handle, revalidate device/file identity, and commit source association only after canonical verification | P2 | 4 | 2 | 4 | 4 | 2 | 4 | L |
| 39 | W39 | Add production-scale benchmarks and build large projections as bounded invisible shadow generations with validated atomic pointer swap | P2 | 3 | 3 | 5 | 2 | 5 | 4 | L |
| 40 | W40 | Replace idle two-second open/query/close polling when measurements justify it; use wakeups/long-lived supervised connections safely | P2 | 1 | 2 | 3 | 2 | 4 | 3 | M |
| 41 | W41 | Define capacity/retention/compaction for logs, reports, backups, jobs, attempts, samples, idempotency, materializations, derivatives, and conflicts | P2 | 3 | 4 | 5 | 4 | 5 | 4 | M |
| 42 | W42 | Encrypt/restrict backup and runtime state; redact logs/errors; document GPS/serial/path privacy and a retention/deletion governance model for metadata only | P2 | 2 | 3 | 4 | 5 | 3 | 4 | M |
| 43 | W43 | Replace global bare-letter F/X/I mutations with modifier/focused-grid commands, `preventDefault`, discoverable help, and a disable setting | P2 | 3 | 5 | 3 | 2 | 1 | 3 | S |
| 44 | W44 | Finish or remove inert generic saved views and density preferences; add edit/delete management and strictly allow-list local routes | P2 | 2 | 5 | 3 | 3 | 2 | 4 | M |
| 45 | W45 | Complete ARIA tabs, inspector focus/announcements, keyboard patterns, and populated-state accessibility tests without screenshots/video/traces | P2 | 2 | 5 | 4 | 1 | 2 | 4 | M |
| 46 | W46 | Test real virtualization with variable-height/long/mobile rows; measure items and use virtualizer scroll-to-index for keyboard navigation | P2 | 2 | 5 | 4 | 1 | 5 | 4 | M |
| 47 | W47 | Make map projection/viewBox honor pan/zoom bounds, or relabel the controls as result filters instead of visual pan/zoom | P2 | 1 | 5 | 3 | 1 | 3 | 3 | M |
| 48 | W48 | Restore scroll using a persisted visible anchor after data loads, not merely the first item/current raw offset | P2 | 1 | 4 | 3 | 1 | 3 | 3 | S |
| 49 | W49 | Fix visible mojibake in map punctuation/arrows, define missing `--accent-soft`, and add Unicode/token checks to frontend tests | P2 | 1 | 5 | 2 | 1 | 1 | 3 | S |
| 50 | W50 | Validate Stack/junk thresholds and explanations on a labelled representative corpus; publish false-positive/negative and calibration evidence | P2 | 3 | 5 | 4 | 2 | 4 | 4 | L |
| 51 | W51 | Add stable CLI exit codes, consistent `--json`/`--debug`, `config show`, safer diagnostics, and explicit remediation without leaking private paths | P2 | 2 | 5 | 4 | 3 | 2 | 4 | M |
| 52 | W52 | Create an operational health/status page that distinguishes API, writer barrier, worker, queue, schema, backup age, capacity, and materialization freshness | P2 | 3 | 5 | 5 | 3 | 3 | 4 | L |
| 53 | W53 | Decide/enforce formatting and type checking; add pre-commit/CI secret and binary-media guards; resolve upstream TestClient warning when supported | P3 | 2 | 2 | 3 | 4 | 2 | 5 | M |
| 54 | W54 | Make audit/event retention append-only and tamper-evident enough for recovery, while keeping a documented compaction/export policy | P3 | 3 | 3 | 4 | 4 | 3 | 4 | L |
| 55 | W55 | Harden/optionally disable open-in-folder OS launching; retain DB-resolved paths, audit it, and handle commas/shell/platform behavior | P3 | 2 | 3 | 3 | 4 | 1 | 3 | S |
| 56 | W56 | Document an honest capability/status matrix, glossary, troubleshooting tree, architecture decisions, release notes, and operator sign-off process | P3 | 3 | 5 | 4 | 3 | 2 | 5 | M |
| 57 | W57 | Add manual keyboard/screen-reader/responsive usability review with no artifact capture, plus issue templates for repeatable evidence | P3 | 1 | 5 | 3 | 1 | 2 | 3 | M |
| 58 | W58 | Add repository governance files appropriate to its use: support/security policy, contribution rules, changelog/ADRs, and ownership of release gates | P3 | 2 | 3 | 3 | 4 | 1 | 4 | S |

## Category leaders

These are the highest-impact sets in each requested importance category. Within each line, implementation order remains the master `#` order.

- Safety/data integrity (`5`): W01, W02, W03, W04, W06, W07, W08, W09, W10, W11, W14, W15, W16.
- Ease of use (`5`): W04, W05, W06, W08, W10, W11, W12, W18, W22, W23, W26, W43, W44, W45, W46, W47, W49, W50, W51, W52, W56, W57.
- Reliability/recovery (`5`): W01–W09, W12–W16, W18–W20, W22, W24–W28, W31–W35, W39, W41, W52.
- Security/privacy (`5`): W07, W13, W17, W21, W29, W34, W42.
- Performance/scalability (`5`): W05, W06, W23, W33, W36, W39, W41, W46.
- Maintainability/testability (`5`): W01–W06, W08, W14, W22, W26–W28, W30–W32, W35, W53, W56.

Documentation added during this review materially advances W56 and supplies part of W58's governance scaffolding. Both remain open: status/capability evidence must stay synchronized with later code, and named ownership/support/release governance is not yet established. All other rows are likewise open until their complete definition of done is evidenced.

## Full category rankings

Every action is ranked in every category below. The number in brackets is its 0–5 importance tier. Within a tied tier, the strict master order breaks the tie. These sequences are therefore complete rankings, not just shortlists.

### Safety and data integrity

W01[5], W02[5], W03[5], W04[5], W06[5], W07[5], W08[5], W09[5], W10[5], W11[5], W14[5], W15[5], W16[5], W05[4], W12[4], W13[4], W19[4], W20[4], W25[4], W26[4], W27[4], W31[4], W34[4], W35[4], W37[4], W38[4], W18[3], W21[3], W22[3], W24[3], W28[3], W29[3], W30[3], W32[3], W33[3], W36[3], W39[3], W41[3], W43[3], W50[3], W52[3], W54[3], W56[3], W17[2], W23[2], W42[2], W44[2], W45[2], W46[2], W51[2], W53[2], W55[2], W58[2], W40[1], W47[1], W48[1], W49[1], W57[1].

### Ease of use and error prevention

W04[5], W05[5], W06[5], W08[5], W10[5], W11[5], W12[5], W18[5], W22[5], W23[5], W26[5], W43[5], W44[5], W45[5], W46[5], W47[5], W49[5], W50[5], W51[5], W52[5], W56[5], W57[5], W07[4], W13[4], W16[4], W19[4], W24[4], W28[4], W32[4], W33[4], W35[4], W36[4], W41[4], W48[4], W01[3], W09[3], W15[3], W20[3], W25[3], W27[3], W29[3], W30[3], W34[3], W37[3], W39[3], W42[3], W54[3], W55[3], W58[3], W03[2], W14[2], W21[2], W31[2], W38[2], W40[2], W53[2], W02[1], W17[1].

### Reliability and recovery

W01[5], W02[5], W03[5], W04[5], W05[5], W06[5], W07[5], W08[5], W09[5], W12[5], W13[5], W14[5], W15[5], W16[5], W18[5], W19[5], W20[5], W22[5], W24[5], W25[5], W26[5], W27[5], W28[5], W31[5], W32[5], W33[5], W34[5], W35[5], W39[5], W41[5], W52[5], W10[4], W11[4], W21[4], W23[4], W29[4], W30[4], W36[4], W37[4], W38[4], W42[4], W45[4], W46[4], W50[4], W51[4], W54[4], W56[4], W17[3], W40[3], W43[3], W44[3], W47[3], W48[3], W53[3], W55[3], W57[3], W58[3], W49[2].

### Security and privacy

W07[5], W13[5], W17[5], W21[5], W29[5], W34[5], W42[5], W01[4], W02[4], W03[4], W15[4], W18[4], W27[4], W30[4], W35[4], W38[4], W41[4], W53[4], W54[4], W55[4], W58[4], W04[3], W08[3], W09[3], W14[3], W16[3], W19[3], W20[3], W25[3], W26[3], W28[3], W31[3], W32[3], W33[3], W37[3], W44[3], W51[3], W52[3], W56[3], W05[2], W06[2], W10[2], W11[2], W12[2], W22[2], W23[2], W24[2], W36[2], W39[2], W40[2], W43[2], W50[2], W45[1], W46[1], W47[1], W48[1], W49[1], W57[1].

### Performance and scalability

W05[5], W06[5], W23[5], W33[5], W36[5], W39[5], W41[5], W46[5], W04[4], W16[4], W22[4], W24[4], W25[4], W27[4], W30[4], W31[4], W34[4], W40[4], W50[4], W07[3], W13[3], W18[3], W19[3], W21[3], W26[3], W32[3], W35[3], W37[3], W42[3], W47[3], W48[3], W52[3], W54[3], W01[2], W02[2], W03[2], W08[2], W09[2], W11[2], W12[2], W14[2], W15[2], W20[2], W28[2], W29[2], W38[2], W44[2], W45[2], W51[2], W53[2], W56[2], W57[2], W10[1], W17[1], W43[1], W49[1], W55[1], W58[1].

### Maintainability and testability

W01[5], W02[5], W03[5], W04[5], W05[5], W06[5], W08[5], W14[5], W22[5], W26[5], W27[5], W28[5], W30[5], W31[5], W32[5], W35[5], W53[5], W56[5], W07[4], W09[4], W10[4], W11[4], W12[4], W13[4], W15[4], W16[4], W18[4], W19[4], W20[4], W21[4], W23[4], W24[4], W25[4], W29[4], W33[4], W34[4], W36[4], W37[4], W38[4], W39[4], W41[4], W42[4], W44[4], W45[4], W46[4], W50[4], W51[4], W52[4], W54[4], W58[4], W17[3], W40[3], W43[3], W47[3], W48[3], W49[3], W55[3], W57[3].

## Why the first 16 cannot be deferred

### W01–W03: make “immutable” enforceable

The current lock can admit two processes if one sees another's just-created but not-yet-written file, and it can clear a foreign host's lock by checking its PID locally. API writes bypass the barrier. Separately, legacy import trusts `object_relpath`, and several preview/dashboard boundaries use weaker path checks. A corrupted DB must never turn metadata into an arbitrary filesystem write/read.

Definition of done:

- one writer/maintenance protocol covers every writable code path and backup/migration coordination;
- concurrent, incomplete-record, PID-reuse, crash, foreign-host, and shared-storage behavior is tested;
- all externally persisted paths resolve through typed capabilities such as source-read, canonical-publish, derivative-read/write, and OS-open;
- every capability proves root containment, no-follow/reparse policy, expected status/identity, and operation permission before filesystem access.

### W02, W14, W15: eliminate mutable canonical aliases

`os.link(temp, final)` exposes the inode under the final name before `temp.unlink()`. A crash can leave a writable `.partial` alias whose writes alter canonical bytes. Application checks are not enough: publication/durability and OS permissions must agree.

Definition of done:

- no failure boundary leaves a writable alias to a published object;
- published objects are immediately verified and protected by an enforceable read-only/append-only policy;
- startup reconciliation removes only safe names/evidence and never rewrites canonical bytes;
- power-loss tests cover file data, directory entries, ACLs/attributes, temp/conflict evidence, and supported filesystems.

### W04–W06: one durable workflow, not stage-specific loops

Stage 6 can remain `running` forever, while reviewed-copy/preprocessing recovery is hidden inside claim paths that the dispatcher never discovers when only a stale running job exists. Later stages each implement their own recovery. Backfill can claim unrelated work, miss concurrent lower-sorting assets, and retry endlessly. Normal reviewed copy does not feed the library pipeline.

Target state:

```text
approved import snapshot
  -> reviewed-copy job(s)
  -> verified-asset outbox events
  -> asset preprocessing jobs
  -> catalog generation
  -> organization generation
  -> Stack profile generation
  -> junk profile generation
  -> release audit checkpoint
```

Every node must be idempotent, generation-bound, leased, heartbeating, retry-limited, pausable/cancellable at explicit boundaries, and recoverable by a startup sweeper independent of queued-job discovery.

### W07, W09, W16: prove recovery before risking live state

The migration backup is same-disk rollback protection, not disaster recovery. The sidecar rebuild is reduced. The current checklist samples 64 objects and points at an old schema-2 backup, which cannot prove current review-state recovery.

Definition of done:

- stopped or coordinated online backup produces one consistent SQLite/object/state snapshot;
- remote copy is encrypted, versioned, retained, monitored, and independently restorable;
- a restore drill reconstructs a separate vault, passes SQLite integrity/foreign keys, object/derivative lineage, application queries, review-state checks, and a complete—not sampled—release audit;
- live migration remains prohibited until copied-production rehearsal and explicit approval succeed.

### W08: one source-read gate

Legacy analyze/validate can read originals without the atime guard, while the embedded UI worker cannot carry the historical hidden acknowledgement. The fix is not to propagate that waiver: every protected-media read must prove the filesystem policy leaves required metadata unchanged or use an approved snapshot/block method. The UI must expose the blocked reason and must never gain a browser toggle.

### W10–W13: prevent the interface from applying yesterday's intent today

Confirmation booleans are local component state and can survive target changes. Library multi-reject bypasses bulk protections. Hidden selections and swallowed failures can clear the wrong UI state. Stable derivative URLs cache changing “current” content indefinitely. These are data/decision integrity failures even though media bytes remain untouched.

## Architecture rework dependencies

Recommended dependency graph:

1. W01–W03 establish safe storage/writer primitives.
2. W14–W15 complete publication/durability invariants on those primitives.
3. W04 establishes the job engine.
4. W05–W06 migrate import/backfill/materialization to it.
5. W07/W09/W16 prove recovery and rollout.
6. W10–W13 and W17–W25 harden API/UI semantics on stable backend contracts.
7. W30–W35 modularize after invariants are executable tests, avoiding a blind big-bang rewrite.
8. W36 onward completes scale, polish, governance, and measured usability.

## Evidence map

The main evidence locations are:

- writer/host/race: `media_vault/core.py:323`;
- legacy object publication/path: `media_vault/vault_ops.py:364`;
- reviewed publication: `media_vault/review_copy.py:1386`;
- migration backup/publication: `media_vault/migrations.py:92`;
- writable API connections and transactions: `media_vault/review_api.py:478` and mutation methods;
- job dispatcher/recovery/shutdown: `media_vault/review_runtime.py:55`, `media_vault/review_api.py:4711`;
- Stage 6 job states: `media_vault/review_stage6.py:214`;
- backfill claim/inventory/scope: `media_vault/review_backfill.py:244`, `:310`, `media_vault/review_runtime.py:250`;
- missing post-copy preprocessing: `media_vault/review_copy.py:1252`, `media_vault/review_backfill.py:335`;
- legacy source fallback: `media_vault/relations.py:19`, `media_vault/vault_ops.py:470`;
- derivative URLs/cache: `media_vault/review_api.py:1003`, `:3293`, `:3919`;
- generic library update/bulk reject: `media_vault/review_api.py:184`, `:2889`;
- old-dashboard boundary: `media_vault/ui_server.py:52`, `:660`;
- confirmation/selection/failure: `review_ui/src/lib/components/ImportApproval.svelte`, `LibraryInspector.svelte`, `BulkRejectView.svelte`, `ManifestReview.svelte`;
- frontend polling: `review_ui/src/routes/imports/+page.svelte:88`;
- pagination/truncation: `review_ui/src/routes/organize/+page.svelte`, `review_ui/src/routes/library/+page.svelte`, `media_vault/review_api.py:1335`;
- keyboard shortcuts: `review_ui/src/routes/library/+page.svelte:517`;
- map/accessibility/Unicode: `review_ui/src/lib/components/OrganizationViews.svelte`;
- backup/reduced rebuild: `media_vault/vault_ops.py:543`;
- read/write audit connection: `media_vault/review_backfill.py:529`, `media_vault/db.py:1557`;
- current test configuration: `pyproject.toml`, `review_ui/package.json`, `review_ui/playwright.config.ts`.

Line numbers refer to the WIP snapshot and may move when work begins. Preserve stable issue IDs W01–W58 in commits, tests, and architecture decisions.
