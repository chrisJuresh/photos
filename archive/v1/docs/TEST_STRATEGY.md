# Test and verification strategy

The current suite is a strong prototype baseline but not release evidence. This strategy defines what must be proven without touching real media or capturing screenshots/video/traces.

## Principles

1. Every test corpus is isolated, synthetic, and outside the real source/vault/inbox.
2. Every risky operation verifies source/canonical hashes and filesystem metadata before and after.
3. Tests fail closed if a path resolves beneath a configured or known live root.
4. Safety invariants are tested at crash/concurrency/fault boundaries, not only happy-path return values.
5. HTTP/frontend tests never perform media work; workers consume only prepared synthetic inputs.
6. Screenshot, video, and trace capture remain off in local and CI Playwright configuration.
7. A passing test proves only its stated environment/failure model; supported OS/filesystem/topology is explicit.
8. Restore and operator usability require exercised evidence, not mocked claims.

## Test corpus guard

Before any test creates data:

- resolve source, inbox, vault, derivatives, temp, cache, output, and restore roots;
- reject drive roots, home/profile roots, repository root, and known live roots;
- reject path equality/ancestry/alias/reparse overlap between authorities;
- create a unique temporary case directory;
- label every byte sequence as synthetic in generator metadata;
- record initial file IDs/link counts/size/timestamps/attributes/permissions for immutable inputs;
- ensure teardown can remove only the resolved unique test root and never follows links.

CI should also reject committed media extensions, `.blob`, SQLite/WAL, logs, backups, screenshots, videos, traces, and generated local state.

## Layer 1 — pure domain/property tests

Cover deterministic logic without filesystem/media/process access:

- stable identifiers and canonical JSON hashing;
- normalized import/library/Stack/junk queries;
- revision/idempotency/confirmation target hashes;
- job transition table and retry/terminal rules;
- entity merge/split lineage and conservative metadata propagation;
- pagination cursor encode/decode/order invariants;
- capacity arithmetic with overflow/boundaries;
- ETA confidence/bounds without promises;
- path grammar rejection before resolution;
- threshold/profile normalization and explanation ordering.

Use property tests for state-machine transition closure, idempotent replay, cursor monotonicity, path traversal strings, Unicode/case variations, and bounded candidate generation.

## Layer 2 — storage authority tests

Actions W01–W03/W14/W15/W37/W38 require the highest bar.

### Writer/maintenance barrier

- simultaneous acquire from threads and independent processes;
- contender during incomplete owner-record publication;
- crash before/after each record/lease/heartbeat step;
- PID reuse and dead same-host owner;
- live foreign-host owner simulation;
- clock skew/lease expiry;
- API/CLI/worker/migration/backup/restore participation;
- maintenance drain/refusal and read-only coexistence;
- unsupported shared/network topology fails closed.

Assert never more than one mutation/maintenance authority exists.

### Path authority

- absolute/traversal/mixed-separator/UNC/device/short-name/case-alias input;
- corrupted DB relative/absolute paths;
- symlink/junction/reparse point at each ancestor and final component;
- directory replacement between validation/open;
- hard-link/file-ID changes between observation/read/commit;
- source/inbox/canonical/derivative/cache/open-folder capability separation;
- error handling before any mkdir/open/process launch.

Assert the opened handle identity/root authority—not string prefix—is correct.

### Canonical publication/durability

Inject failure before/after write, flush, file fsync, reopen/hash, byte compare, no-replace publish, permission hardening, directory durability, DB commit, outbox commit, and temp cleanup.

Assert:

- no existing canonical bytes/metadata change;
- no crash leaves a writable alias to a published inode;
- an unexpected final path is never overwritten;
- matching raced publication is verified/adopted only with full evidence;
- conflict evidence is unique/no-overwrite;
- restart reconciliation is idempotent and evidence-preserving;
- supported filesystem power-loss behaviour matches the ADR.

## Layer 3 — manifest/repository/migration tests

- fresh schema and every supported upgrade path;
- copied current-size schema-2 through schema-12 fixtures using synthetic rows;
- ordinary open never migrates or rewrites schema/journal state;
- strict read-only URI/query-only connections cannot write/initialize/checkpoint/switch WAL;
- domain value/status/foreign-key/transition constraints;
- transaction rollback at every migration statement/checkpoint;
- backup/WAL/migration/rollback capacity boundaries;
- backup checksum/durability before DDL and before restore;
- post-commit validation failure and proven rollback;
- migration refusal while every kind of writer is live;
- output/recovery DB builds in temp, validates, and publishes no-overwrite.

Never apply a migration test to the live manifest. Production-shaped tests use copied/synthetic databases with object/source paths redirected or inaccessible.

## Layer 4 — unified job engine tests

For every registered job kind and transition:

- transactional single claim under contention;
- attempt increments exactly once;
- lease heartbeat extends ownership;
- wrong token/worker cannot mutate progress/complete;
- sweeper sees lone expired running jobs without queued work;
- retry delay and finite attempt cap;
- retryable versus terminal/manual errors;
- pause before start and at each safe boundary;
- cancel before start and cooperative safe-boundary cancel;
- process kill/restart at every transition;
- duplicate enqueue reconnects to the same effective job;
- shutdown waits for or records the actual safe state;
- resource-class totals/media/analysis limits are enforced;
- backfill worker cannot claim non-backfill job kinds.

Model-based/property tests should compare the persisted state to the formal transition table after randomized event sequences.

## Layer 5 — workflow/DAG tests

Exercise the full synthetic lifecycle:

```text
discover -> preview -> decide -> preflight -> approve -> authorize -> publish
         -> AssetVerified outbox -> preprocess -> catalog -> organization
         -> Stack -> junk -> read-only semantic audit
```

At every arrow, inject transaction failure, process death, duplicate delivery, stale revision, missing tool, decoder failure, insufficient capacity, and concurrent later import.

Assert:

- HTTP authorization enqueues only; no handler opens/decodes/hashes/copies media;
- approval/execute target exact immutable observations/revision;
- outbox and authoritative asset association commit together;
- duplicate events/jobs are idempotent;
- every verified asset reaches the correct desired preparation state or explicit terminal unavailable/manual evidence;
- current generation advances only after complete validation;
- lower-sorting concurrent assets belong to a clear later generation and are never lost;
- RAW/JPEG merge/split lineage conserves/audits user metadata;
- backfill immutable inventory/counts reconcile completely.

## Layer 6 — API/security tests

- loopback host allow-list and TrustedHost for both applications;
- same-origin checks on every mutation;
- restrictive CSP/no external requests;
- GET/HEAD side-effect freedom and explicit prepare POSTs;
- streaming body limit with content-length absent/false/chunked/slow input;
- content type/JSON/schema/numeric/string/list/depth budgets;
- SQL time/query/page caps and cursor tamper/expiry;
- idempotency exact request binding, generation monotonicity, retention/compaction;
- optimistic revision conflicts and exact-target confirmation;
- path/client cannot control filesystem or OS-launch target;
- derivative version/checksum/private cache semantics;
- exception/request/job logging with redaction;
- DNS-rebinding/host-header/cross-origin cases;
- decoder errors never leak private paths/tool stderr unsafely.

## Layer 7 — frontend unit/component tests

Use DOM/component state only; no visual snapshots.

- every confirmation resets/remounts on batch/entity/profile/selection/revision change;
- all multi-reject routes use favourite/large/exact-target safeguards;
- hidden selections are disclosed/cleared;
- failures preserve selection/history and display durable error;
- action IDs and undo survive reload/reconnect;
- polling aborts/deduplicates/tears down and latest response wins;
- all cursors/previous stacks and shown/total/truncation UI;
- global shortcuts require intended focus/modifier and respect form controls/disable setting;
- saved routes are strict allow-listed and settings are actually consumed;
- ARIA tabs/inspector/grid focus/announcements/keyboard patterns;
- variable-height/long/Unicode/mobile virtualization and scroll-to-index;
- map projection/viewBox matches the meaning of pan/zoom controls;
- worker/API/schema/backup/projection health states are distinct;
- mojibake/token checks for user-visible strings and CSS variables.

## Layer 8 — capture-disabled populated E2E

Run the installed/bundled application against a synthetic populated vault/inbox. Explicitly assert Playwright capture options are off before launch.

Flows:

- first start/tool/config/schema failure and remediation;
- discover/review/approve/authorize/prepare/display one synthetic batch;
- stale tab/revision and idempotent network retry;
- failure before/after server commit without incorrect selection clearing;
- pause/restart/reconnect to durable jobs;
- Library search/filter/facets/pagination/selection/inspector;
- favourite/reject/rating/bulk safeguards/durable undo;
- organization cursors/calendar/folders/equipment/map links;
- Stack and junk profile preparation/explanations/feedback;
- keyboard-only and automated accessibility over non-empty state;
- long text/Unicode/large counts/unavailable outputs;
- safe shutdown and restart.

Test code may inspect DOM/network/database test state, but never create or compare screenshots/video/traces.

## Layer 9 — performance and resource tests

Build synthetic database/state sizes that model:

- six-figure assets/logical entities;
- million-row source/history/projection tables;
- large import histories/events/errors;
- worst-case facet/filter/cursor combinations;
- full catalog/organization/Stack/junk shadow generations;
- sustained job/attempt/event/idempotency/log retention;
- HDD-style serialized media I/O versus NVMe resource classes.

Measure peak memory, transaction duration/WAL growth, query plans/latency, worker CPU/I/O, queue fairness, derivative capacity, cancellation latency, and restore time. Define budgets before optimization. Never benchmark the real vault.

## Layer 10 — backup/restore and release drills

For a production-shaped isolated synthetic/copy rehearsal:

1. establish all-writer quiescence using the candidate barrier;
2. create encrypted/versioned snapshot in a test remote failure domain;
3. restore to a different isolated path/machine;
4. run strict read-only SQLite integrity/foreign keys;
5. run full object/path/filesystem/capacity/lineage/user-state semantic audit;
6. start the installed candidate and exercise representative read/metadata/undo flows;
7. measure RPO/RTO and record the result;
8. simulate missing/corrupt generations and prove clear failure/selection of last good recovery point.

Use [BACKUP_RECORD_TEMPLATE.md](BACKUP_RECORD_TEMPLATE.md). A migration backup or sampled object hashes do not pass this layer.

## Algorithm evaluation

Stack/junk calibration needs a separately governed, isolated, consented/non-sensitive labelled corpus or purpose-built synthetic corpus—not the real source and not committed media.

Record:

- corpus provenance/scope/bias/limitations;
- analyzer/profile/threshold identity;
- false-positive/false-negative/precision/recall by reason and relevant subgroups;
- favourite/edit/RAW/video/corrupt/low-resolution behaviour;
- human disagreement and explanation quality;
- rollback/versioning and no-auto-delete guarantee.

Synthetic correctness alone cannot justify real curation recommendations.

## CI stages

Recommended fail-fast order:

1. repository secret/media/database/capture-config/Markdown guard;
2. clean Python lock install, Ruff, format policy, type check, unit/property tests;
3. clean npm install, Svelte/TypeScript, unit/component, Unicode/token tests;
4. wheel/sdist + frontend reproducible build and installed-artifact smoke;
5. API/security/storage/job integration and concurrency/fault matrices;
6. capture-disabled populated E2E/accessibility;
7. scheduled large-scale/load/dependency/SBOM/license scans;
8. candidate-only migration/backup/restore drill with retained private evidence.

No CI runner should have credentials or filesystem reachability to the live source/vault/inbox.

## Evidence report

Each W/F closure should record:

- exact branch/commit/build/tool/platform/filesystem;
- tests and seeds/fault points/repetition counts;
- synthetic/copy corpus identity and root-isolation proof;
- before/after immutability evidence;
- observed result/budgets and retained logs with redaction;
- limitations and unsupported cases;
- reviewer and date;
- affected docs/ADR/release-gate updates.

Keep test evidence distinct from live authorization. Only [RELEASE_GATES.md](RELEASE_GATES.md) governs cutover.
