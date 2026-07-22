# Complete code-review findings register

Review date: 2026-07-22

Snapshot: `d49e621`

Status: documentation of observed behaviour; no code changes were made during the review

This register records the distinct findings that produced the ordered actions in [ACTION_PRIORITY_MATRIX.md](ACTION_PRIORITY_MATRIX.md). `Critical` means live use must remain blocked; `High` means required before a supported release; `Medium` means material correctness, usability, scale, or maintenance work; `Low` means limited current impact.

Line references identify the reviewed snapshot and will move. The W IDs are stable implementation/action IDs.

## Safety, storage, and persistence

| Finding | Severity | Observation | Primary evidence | Action |
|---|---|---|---|---|
| F01 | Critical | `VaultRunLock` creates an empty exclusive file and writes ownership afterward; a contender can observe an incomplete record, remove it, and admit two writers | `media_vault/core.py:342` | W01 |
| F02 | Critical | Lock stale-owner logic records a hostname but checks PID liveness on the current host, so shared storage can clear a foreign host's active lock | `media_vault/core.py:342` | W01 |
| F03 | Critical | Review API mutations open writable SQLite transactions without participating in the CLI writer lock | `media_vault/review_api.py:478` and mutation methods | W01 |
| F04 | Critical | Migration/exclusive maintenance cannot prove all API/worker writers are quiescent | `media_vault/migrations.py:271`, `media_vault/review_api.py` | W01, W09 |
| F05 | Critical | Legacy import trusts a database-derived `object_relpath` without a mandatory containment proof below canonical `objects` | `media_vault/vault_ops.py:364` | W03 |
| F06 | Critical | Hard-link publication can crash after the final name exists but before the writable `.partial` alias is removed; both names then mutate the same inode | `media_vault/vault_ops.py:412`, `media_vault/review_copy.py:1439` | W02, W14 |
| F07 | High | Canonical append-only intent is not reinforced with a tested OS-level read-only/immutable permission contract | publication paths and `VaultLayout` | W14, W15 |
| F08 | Critical | Legacy `analyze` and `validate` can fall back to source files without applying the source access-time guard | `media_vault/relations.py:19`, `media_vault/vault_ops.py:470` | W08 |
| F09 | High | The source atime guard is Windows-specific; on other supported-looking platforms the result is informational rather than an enforced policy | `media_vault/core.py:232` | W08 |
| F10 | Critical | The embedded review-UI worker cannot carry the code's hidden atime acknowledgement, so the advertised live import path can block; propagating the waiver would still fail the protected-metadata invariant | `media_vault/cli.py:379`, worker arguments | W08, W19, W51 |
| F11 | High | Source/inbox identity is checked in multiple steps instead of through one no-follow handle revalidated before authoritative association | scanner/import/copy flows | W38 |
| F12 | High | Windows root identity can fragment by case, spelling, alias, or mount representation while preserving different IDs/totals | `media_vault/core.py:76`, source-root handling | W37 |
| F13 | High | Derivative, preview, legacy cache, and OS-open boundaries do not all share one reparse-aware realpath authority | `media_vault/config.py`, `ui_server.py:52`, `review_api.py` | W03, W55 |
| F14 | High | Config checks derivatives against canonical objects and inbox but does not prove disjointness from every source/vault/state topology at every entry point | `media_vault/config.py:85` | W03 |
| F15 | High | Capacity calculations can trust persisted “verified” destination rows without reconciling current filesystem existence/identity | `media_vault/vault_ops.py:36` | W16 |
| F16 | High | Conflict preservation can use a rename operation whose overwrite semantics differ by platform, weakening “never overwrite evidence” | canonical conflict paths | W02 |
| F17 | High | Parent-directory/directory-entry durability, ACL/attribute persistence, and supported-filesystem behaviour are not proven by power-loss tests | publication/migration paths | W14 |
| F18 | High | Migration capacity budgeting does not comprehensively model backup, WAL, migration growth, rollback, and required free-space margin | `media_vault/migrations.py:72` | W09 |
| F19 | High | Migration backup checksum is computed, but end-to-end post-publication durability and later pre-restore re-verification are not a complete contract | `media_vault/migrations.py:106` | W09 |
| F20 | High | Migration backup publication uses the same hard-link style implicated in the mutable-alias hazard | `media_vault/migrations.py:92` | W02, W09 |
| F21 | High | `status`, release audit, and other nominal readers can use the general writable manifest connection, which can initialize/switch connection state | `media_vault/db.py:1557`, `review_backfill.py:529` | W20 |
| F22 | Medium | Recovery-index creation writes directly to its requested output and uses large in-memory collections rather than validated temporary publication | `media_vault/vault_ops.py:543` | W36 |

## Jobs, import flow, backfill, and recovery

| Finding | Severity | Observation | Primary evidence | Action |
|---|---|---|---|---|
| F23 | Critical | Stage 6 `inbox_scan`, manifest materialization, approval-preflight, and execute jobs can remain `running` forever after process death | `media_vault/review_stage6.py:214`, `review_runtime.py:55` | W04 |
| F24 | Critical | Reviewed-copy and preprocessing stale-job recovery is hidden inside claim paths, while the dispatcher searches queued work; a lone expired running job may never be discovered | `review_copy.py`, `preprocess.py`, `review_runtime.py:55` | W04 |
| F25 | High | Preprocessing heartbeat behaviour does not consistently extend the job lease, permitting false expiry or ambiguous ownership | `media_vault/preprocess.py` | W04 |
| F26 | High | Job kinds independently implement state transitions, retries, attempts, recovery, progress, pause/cancel, and errors, so semantics diverge by stage | stage 6–11 modules | W04, W31 |
| F27 | High | The embedded worker is a daemon thread; server shutdown joins for only five seconds and cannot deliver a cooperative stop token into every runner | `media_vault/review_api.py:4695` | W19 |
| F28 | Critical | `preprocess --backfill` starts the generic worker with every supported kind, so it can execute a queued reviewed copy and publish canonical media | `media_vault/review_runtime.py:222` | W06 |
| F29 | Critical | Backfill's live keyset inventory can miss a concurrently added asset whose ID sorts before the saved cursor | `media_vault/review_backfill.py:310` | W06 |
| F30 | Critical | Backfill attempt accounting does not increment on every retry, allowing some failures to loop without a finite attempt cap | `media_vault/review_backfill.py:244` | W06 |
| F31 | Critical | Successful reviewed copy does not transactionally enqueue asset preprocessing or the downstream catalog/organization/Stack/junk chain | `media_vault/review_copy.py:1252`, `review_backfill.py:335` | W05 |
| F32 | Critical | Catalog and later projection generations are not reliably invalidated when new assets or prepared outputs arrive | library/organization/backfill orchestration | W05 |
| F33 | High | Logical-photo entity IDs and user state do not have an explicit persisted lineage policy for later RAW/JPEG merges or splits | `media_vault/review_library.py` | W05 |
| F34 | High | Active jobs can be duplicated by timestamp-derived IDs rather than reconnected/deduplicated by subject and effective options | enqueue helpers across stage modules | W24 |
| F35 | High | An idempotent replay can return an older generation and regress client application state; idempotency storage has no complete retention/compaction policy | `media_vault/review_api.py` | W25 |
| F36 | High | Configured total/media/analysis worker limits are present but the runtime is a single sequential loop and does not enforce resource pools | `media_vault/config.py:16`, `review_runtime.py:78` | W33 |
| F37 | Medium | Idle worker polling repeatedly opens/queries/closes on a fixed interval without measured wakeup/backoff design | `media_vault/review_runtime.py:78` | W40 |
| F38 | High | Logs, attempts, events, samples, jobs, idempotency rows, projections, derivatives, backups, and conflicts lack one explicit retention/capacity budget | schema and runtime modules | W41, W54 |

## Backup, restore, and audit

| Finding | Severity | Observation | Primary evidence | Action |
|---|---|---|---|---|
| F39 | Critical | A same-disk migration backup is treated too much like recovery evidence; there is no proven application-consistent encrypted remote backup/restore process | migration/docs | W07 |
| F40 | Critical | `rebuild-index` reconstructs only a reduced asset/search index and cannot restore the schema-12 review state | `media_vault/vault_ops.py:543` | W07, W35 |
| F41 | High | Asset sidecars omit approvals, jobs, preferences, saved views, user-state audit, projection/profile state, and other authoritative records | `media_vault/vault_ops.py:129` | W35 |
| F42 | High | The previous post-backfill checklist referenced an old schema-2 backup and a 64-object sample, neither of which proves current-vault recoverability | historical `POST_BACKFILL_CHECKLIST.md` | W16 |
| F43 | High | Release audit does not prove full object/path/filesystem/capacity truth, projection lineage, current review state, and independent restore | `media_vault/review_backfill.py:529` | W16 |
| F44 | High | Runtime state and backups expose private paths, GPS, capture times, camera serials, decisions, and errors without a complete encryption/redaction/retention governance model | schema, API, logs, backups | W42 |

## HTTP/API and security

| Finding | Severity | Observation | Primary evidence | Action |
|---|---|---|---|---|
| F45 | High | Request bodies can be buffered before the declared length budget is enforced, so chunked or missing-length bodies evade early limits | `media_vault/review_api.py` middleware/routes | W21 |
| F46 | Medium | Some GET/query flows enqueue materialization jobs, so safe/idempotent reads can mutate state | `media_vault/review_api.py` prepare paths | W21 |
| F47 | High | A stable “current derivative” URL is served with `public, max-age=31536000, immutable`, allowing stale/replaced content to persist | `media_vault/review_api.py:3919` | W13 |
| F48 | High | The legacy dashboard lacks TrustedHost/hostname validation and can disclose paths/metadata/location evidence through DNS rebinding | `media_vault/ui_server.py:202` | W17 |
| F49 | High | Unhandled review-API exceptions are converted to generic responses without sufficient persistent structured exception/access logging | `media_vault/review_api.py` error handling | W18 |
| F50 | Medium | Open-in-folder crosses into an OS launcher and needs stricter allow-listing, audit, platform-safe argument handling, and an off switch | `media_vault/review_api.py:465` | W55 |
| F51 | High | The review API combines routers, SQL, domain rules, serialization, security, static files, browser launch, and worker lifecycle in a 4,700+ line module | `media_vault/review_api.py` | W30 |
| F52 | High | Backend and TypeScript contracts are handwritten separately and network/error/timeout behaviour is not standardized at one boundary | `review_api.py`, `review_ui/src/lib/api.ts` | W32 |
| F53 | High | Schema, migrations, connection policy, and broad data access are concentrated in a 1,500+ line module with limited transition/value constraints | `media_vault/db.py` | W31 |

## Media analysis and prepared-data trust

| Finding | Severity | Observation | Primary evidence | Action |
|---|---|---|---|---|
| F54 | High | Stack analysis can accept derivative freshness based on size/mtime rather than re-verifying the persisted content checksum | `media_vault/review_stacks.py:378` | W34 |
| F55 | High | Deep-video subprocess code can wait/communicate in an order that risks pipe deadlock or unbounded resource use on hostile/corrupt inputs | `media_vault/relations.py:484` | W34 |
| F56 | High | Decoder/subprocess sandbox, timeout, memory/CPU/output bounds, and failure taxonomy are not uniformly enforced across ExifTool, Pillow, FFmpeg, and workers | metadata/preprocess/relations | W34 |
| F57 | High | Stack and junk thresholds have synthetic tests but no labelled representative-corpus false-positive/false-negative calibration evidence | Stack/junk tests and progress docs | W50 |

## Frontend decision safety and usability

| Finding | Severity | Observation | Primary evidence | Action |
|---|---|---|---|---|
| F58 | Critical | Approval, bulk, inspector, and profile confirmation Booleans can remain checked when their batch/entity/profile/selection changes | review UI approval/inspector/bulk components | W10 |
| F59 | Critical | Generic Library multi-reject can affect hundreds of entities without routing through favourite/large-selection safeguards | `review_api.py:2889`, Library UI | W11 |
| F60 | High | Selected entities can remain active but hidden after filters change, obscuring the target set | Library/Bulk components | W12 |
| F61 | High | Parent error handling can swallow a failed action while child components clear selection or local undo history | manifest/inspector/bulk components | W12 |
| F62 | High | Bulk undo survives only in component memory, while Stack reject-rest does not expose the same durable action ID for recovery | Bulk/Stack components and API | W12 |
| F63 | Medium | Bare global F/X/I keys mutate favourite/reject/inspect state without a modifier or deliberately focused grid context | `review_ui/src/routes/library/+page.svelte:517` | W43 |
| F64 | High | Import polling issues multiple requests every few seconds without consistent abort, deduplication, teardown, request epochs, or latest-response-wins | `review_ui/src/routes/imports/+page.svelte:88` | W22 |
| F65 | High | Organization cursors are not fully consumed, facets can represent only the first slice, detail arrays are silently capped, and Junk/Bulk paging is forward-only | organization/library/junk/bulk routes and API | W23 |
| F66 | Medium | Shell density and generic saved views are partly inert; update/delete management is incomplete; stored local routes are not strictly allow-listed | Settings/layout/API client | W44 |
| F67 | High | ARIA tab/inspector behaviours and keyboard/focus announcements are incomplete, automated E2E exercises only an empty vault, and no repeatable manual keyboard/screen-reader/responsive review record exists | components and Playwright tests | W27, W45, W57 |
| F68 | High | Real variable-height/mobile virtualization tests are disabled or too shallow; fixed row estimates can break keyboard/scroll targeting | virtualized UI components/tests | W46 |
| F69 | Medium | Map query bounds change with pan/zoom controls but the SVG remains a fixed full-world projection | `OrganizationViews.svelte` | W47 |
| F70 | Medium | Scroll restoration stores a raw offset/first-item approximation instead of a true visible entity anchor after data loads | Library route | W48 |
| F71 | Medium | User-visible map punctuation/arrows contain mojibake and styles reference an undefined `--accent-soft` token | `OrganizationViews.svelte` and styles | W49 |
| F72 | High | UI service-ready messaging proves API response only, not worker availability, lease health, queue progress, schema readiness, backup age, or projection freshness | review UI shell/status | W52 |

## Scale, packaging, test, and process

| Finding | Severity | Observation | Primary evidence | Action |
|---|---|---|---|---|
| F73 | Medium | Several CLI/database paths use `fetchall`, full sorting, or large transactions that will not remain bounded at full-vault scale | vault/recovery/catalog/organization paths | W36, W39 |
| F74 | High | Large projection builds lack a consistently bounded, invisible shadow-generation validation and atomic pointer-swap contract | catalog/organization/Stack/junk | W39 |
| F75 | High | There is no repository CI, coverage threshold, lock/crash/disk-full/property suite, restore drill, or populated capture-disabled E2E workflow | repository/test config | W27 |
| F76 | High | Wheel/sdist and bundled UI are not installed/tested from a clean environment; code/analyzer/build identity is not a complete release artifact | packaging/build files | W28 |
| F77 | Medium | Project/package versions report `1.0.0` despite the snapshot being an unreleased live-blocked WIP | Python/npm metadata | W28 |
| F78 | High | Dependency/security checking is manual; reproducible hash policy, SBOM, license rules, and an update process are absent | lock files/package config | W29 |
| F79 | Low | Runtime Python and production npm advisory checks were clean, but the full npm tree reports three low-severity development-only `cookie@0.6.0` findings | pip/OSV/npm audit on 2026-07-22 | W29 |
| F80 | Medium | Formatting/type-checking/pre-commit policy is incomplete, generated asset review is implicit, and a Starlette `TestClient` deprecation warning remains | tool config/test output | W53 |
| F81 | Medium | CLI diagnostics lack a consistent JSON/debug/exit-code/config-doctor contract and can make safe remediation hard to discover | `media_vault/cli.py` | W26, W51 |
| F82 | High | Existing documentation overstated live readiness, resumability, worker limits, backup completeness, and the safe scope of the backfill launcher | README/progress/checklist before review | W56 |
| F83 | Medium | Repository lacks explicit support/security/contribution/release ownership, changelog policy, and ADR governance | repository root | W58 |

## Positive controls confirmed

These are not reasons to lift the safety hold, but they are design assets to preserve.

| ID | Confirmed strength |
|---|---|
| P01 | Review UI/API/static assets and port 8766 remain separate from the legacy read-only dashboard on port 8765; config rejects equal ports |
| P02 | Legacy dashboard accepts only GET/HEAD/OPTIONS and opens SQLite with `mode=ro` plus `query_only=ON` |
| P03 | Review API has localhost host options, TrustedHost, same-origin mutation checks, JSON validation, CSP, request/query budgets, typed envelopes, revisions, and idempotency foundations |
| P04 | HTTP handlers are designed to serve existing derivatives/query persisted state/update metadata/enqueue work; media decoding, hashing, copying, ranking, and grouping remain in background/CLI code |
| P05 | Exact identity uses three full hashes, distinct collision evidence, and byte comparison when a representative is available; visual similarity never silently deduplicates bytes |
| P06 | Import has distinct review, approval, and execute-authorization concepts, and canonical publication is intended to be no-overwrite |
| P07 | Derivatives/materializations are separate from source and canonical objects and are treated as regenerable |
| P08 | Migrations are explicit and include a copied-database test path, backup intent, transaction, and post-validation |
| P09 | Automated tests use isolated synthetic temporary corpora and include source/canonical hash and filesystem metadata assertions |
| P10 | Playwright screenshot, video, and trace capture are disabled; the executed smoke/accessibility runs used a temporary synthetic empty vault/inbox |
| P11 | Current validation passed: 84 Python tests, Ruff, 39 frontend tests, Svelte/TypeScript checks, one smoke test, and one automated accessibility test |
| P12 | Runtime Python and production npm advisory scans found no known advisories at the reviewed lock state |

## Completeness rule

A future review may add findings, but none of F01–F83 should be closed merely because a nearby code path is tested. Closure requires the corresponding W action's definition of done, adversarial evidence appropriate to the risk, documentation updates, and release-gate sign-off. Where one implementation resolves several findings, record all affected F IDs in its change and tests.
