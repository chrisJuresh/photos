# Release gates and operator sign-off

The current review/backfill snapshot is **not releasable**. This checklist defines the evidence required before anyone may point the new workflow at `G:\photos`, `G:\MediaVault`, or `G:\MediaVaultImports`.

Checkboxes are intentionally empty. A passing unit test alone does not satisfy a gate. Link concrete logs, commits, restored-copy records, and manual observations beside each item; never edit production media to create evidence.

## Gate 0 — scope and change control

- [ ] A named release owner is responsible for the decision.
- [ ] The candidate commit, dependency locks, frontend build identity, Python version, Node/npm version, ExifTool version, and FFmpeg/ffprobe version are recorded.
- [ ] All code changes map to stable W/F IDs in [ACTION_PRIORITY_MATRIX.md](ACTION_PRIORITY_MATRIX.md) and [FINDINGS_REGISTER.md](FINDINGS_REGISTER.md).
- [ ] Every W01–W58 item has an explicit closed-with-evidence, accepted-with-owner/expiry, or no-go disposition; documentation scaffolding alone does not close W56/W58.
- [ ] The worktree is clean except for explicitly reviewed release evidence.
- [ ] No real-media fixture, screenshot, video, trace, credential, private path dump, or backup key is present in Git.
- [ ] The capability/status documentation contains no claim stronger than the evidence.

Gate owner: __________  Evidence: __________  Date (UTC): __________

## Gate 1 — remote backup and restore

- [ ] The fixed universal barrier proved all writer-capable CLI/API/worker/service/task/host activity quiescent, or an offline storage snapshot made every protected root unavailable to all writers.
- [ ] A consistent versioned snapshot covers the original source, whole vault, current SQLite/WAL state, unpublished inbox, records, reports/logs, exports, derivatives selected by policy, and exact code/build identity.
- [ ] The remote copy is encrypted, access-restricted, retained/versioned, monitored, and in a separate failure domain.
- [ ] The snapshot was restored to an isolated pristine path/machine—not over the live source or vault—and cloned to a disposable audit working copy.
- [ ] SQLite integrity and foreign-key checks passed on the disposable working copy using strict read-only/query-only database access; the pristine restore remained sealed.
- [ ] Complete authenticated snapshot/remote/restore inventories and canonical-manifest identities reconciled every file; counts/bytes/representative samples were not accepted as proof.
- [ ] Full semantic object/path/capacity/projection/user-state checks passed on the restored copy.
- [ ] Representative application queries and review-state/undo/audit records survived the restore.
- [ ] A completed `BACKUP_RECORD.md` is retained with the remote snapshot.

Follow [MANUAL_REMOTE_BACKUP.md](MANUAL_REMOTE_BACKUP.md). Gate owner: __________  Evidence: __________  Date (UTC): __________

## Gate 2 — writer and maintenance barrier

- [ ] W01 is complete: CLI, API, workers, migration, backup, restore, and maintenance all use one writer/maintenance protocol.
- [ ] Concurrent-acquire, incomplete-record, crash, PID-reuse, foreign-host, and shared-storage tests pass.
- [ ] A maintenance request drains/refuses all writers and proves quiescence before migration/backup/restore.
- [ ] Nominal readers use read-only connections and cannot initialize the schema, switch WAL mode, or enqueue work.
- [ ] Lock/barrier health and owner/lease age are visible without exposing private data.

Gate owner: __________  Evidence: __________  Date (UTC): __________

## Gate 3 — storage authority and immutability

- [ ] W02/W03/W14/W15 are complete.
- [ ] Every canonical/source/inbox/derivative/cache/OS-open path crosses one typed authority boundary with realpath/no-follow containment.
- [ ] Corrupted database paths, junction/reparse swaps, case/alias roots, and symlink escapes fail closed in synthetic tests.
- [ ] Canonical publication is atomic, no-replace, durable, and cannot leave a writable alias to a published inode at any crash boundary.
- [ ] Existing canonical objects are protected by tested OS/storage permissions and are never opened for write.
- [ ] Conflict evidence is published without overwrite on every supported platform.
- [ ] The supported filesystem/OS matrix and power-loss semantics are documented and tested.

Gate owner: __________  Evidence: __________  Date (UTC): __________

## Gate 4 — source-read authorization

- [ ] Every source/inbox/canonical read—including analyze, validate, comparison, preview preparation, backup inspection, and recovery—uses one policy gate that proves protected metadata remains unchanged or supplies an approved snapshot handle.
- [ ] The real workstation's access-time policy has been corrected and verified, or an approved storage snapshot/block method avoids mounted-file reads while preserving required metadata.
- [ ] No CLI flag, HTTP parameter, or browser control can waive protected source/canonical/inbox metadata immutability.
- [ ] UI/CLI errors distinguish blocked policy, missing tool, missing worker, stale observation, and media-processing failure.
- [ ] Tests prove source contents, names, directory entries, attributes, permissions, and required timestamps remain unchanged.

Gate owner: __________  Evidence: __________  Date (UTC): __________

## Gate 5 — unified jobs and import workflow

- [ ] W04–W06 and W19 are complete.
- [ ] Every job kind uses one transactional claim/attempt/lease/heartbeat/retry/pause/cancel/recovery engine.
- [ ] An independent sweeper resolves every expired running job even when no queued job exists.
- [ ] Attempts increment exactly once, retries are finite, and terminal/manual-intervention states are visible.
- [ ] Workers are separately supervised processes with cooperative safe-boundary shutdown.
- [ ] Configured total/media/analysis resource-class limits are actually enforced under contention and visible in health evidence.
- [ ] Backfill operates only on an immutable named inventory and cannot claim unrelated import/copy jobs.
- [ ] Enqueueing deduplicates active work by subject/effective options and clients reconnect to the existing durable job.
- [ ] Idempotent replay cannot regress application generation; retention/compaction/expiry limits are proven without losing required audit.
- [ ] Successful verified asset association atomically emits an outbox event.
- [ ] Import deterministically schedules preprocessing and versioned catalog/organization/Stack/junk generations.
- [ ] Logical-photo merge/split lineage preserves or conservatively surfaces favourite/reject/rating/cover state.
- [ ] Kill/restart tests at every transition reach a correct terminal, paused, or explicit manual state without media mutation.

Gate owner: __________  Evidence: __________  Date (UTC): __________

## Gate 6 — migration and rollback

- [ ] Migration was rehearsed against a recent copied production database/state with live roots OS-denied/unmounted and every persisted media/output path rebased or proven unreachable.
- [ ] The writer barrier proves no live writer before exclusive maintenance begins.
- [ ] Capacity accounts for database, WAL, backup, migration growth, rollback, and safety margin.
- [ ] Backup publication/checksum/durability is verified before DDL begins and again before any restore.
- [ ] Integrity, foreign keys, schema semantics, application queries, and projections pass after migration.
- [ ] The rollback procedure is tested against the copy and never overwrites live evidence blindly.
- [ ] No ordinary application open performs an implicit migration.

Gate owner: __________  Evidence: __________  Date (UTC): __________

## Gate 7 — API and decision safety

- [ ] Request bodies are limited while streaming; GET/HEAD are side-effect free; preparation is an explicit idempotent POST.
- [ ] Both local web applications have hostname/TrustedHost, origin, CSP, query-budget, and path/privacy protections appropriate to their capabilities.
- [ ] Derivative URLs are content/version addressed or privately revalidated; a mutable “current” URL is never public immutable.
- [ ] Every confirmation binds to the exact batch/entity/profile/selection revision and resets on any subject change.
- [ ] Every preflight/approval/execute capacity decision reconciles persisted verified destinations with current contained filesystem identity/existence and fails closed on stale, missing, or conflicting evidence.
- [ ] Every multi-item rejection uses the same favourite/large-selection/exact-target safeguards.
- [ ] Hidden selections are disclosed or cleared; failed actions preserve target/history and show a durable error.
- [ ] Undo/action history is durable and reloadable for bulk and Stack actions.
- [ ] Global shortcuts require a deliberate focus/modifier and are documented/disableable.
- [ ] Every cursor is consumed and every capped/truncated result displays shown/total state.
- [ ] Polling cancels/deduplicates correctly and stale responses cannot replace newer state.

Gate owner: __________  Evidence: __________  Date (UTC): __________

## Gate 8 — privacy, dependencies, and observability

- [ ] Logs include request/job IDs, transitions, worker/queue health, lease age, and actionable failures with private paths/GPS/serials redacted.
- [ ] Backup/runtime/log access follows least privilege, encryption, retention, and deletion-governance policy.
- [ ] Every decoder/subprocess has documented CPU, memory, time, output, path, and failure bounds.
- [ ] Similarity/ranking workers verify persisted derivative checksums and input identity rather than trusting size/mtime alone.
- [ ] Runtime and development dependencies pass the approved advisory/license policy; accepted risks have owners and expiry dates.
- [ ] A software bill of materials and reproducible lock/build evidence are attached.
- [ ] Open-in-folder is allow-listed, audited, platform-safe, and optionally disabled.

Gate owner: __________  Evidence: __________  Date (UTC): __________

## Gate 9 — automated and manual verification

- [ ] CI runs clean Python/frontend installs, build/package tests, static/type/format checks, dependency checks, and the complete automated suite.
- [ ] Coverage thresholds protect the storage kernel, writer barrier, job state machine, API decision commands, and migrations.
- [ ] Concurrency, crash-boundary, disk-full, corrupted-DB-path, decoder-failure, property, and restore tests pass.
- [ ] Production-scale synthetic benchmarks meet documented budgets without unbounded memory/transactions.
- [ ] Large projections build as bounded invisible shadow generations, validate completely, and expose only through an atomic monotonic current-pointer change.
- [ ] Audit/event history has tamper-evident retention/export and reviewed compaction semantics; pruning cannot erase required recovery evidence.
- [ ] Populated-state E2E covers adding/reviewing photos, confirmations, failure/retry, pagination, undo, restart/reconnect, and stale revisions.
- [ ] Screenshot, video, and trace capture remain disabled; test fixtures remain isolated synthetic corpora.
- [ ] Keyboard, screen-reader, zoom/responsive, virtualization, map, long-text, and reduced-motion manual checks pass without artifact capture.
- [ ] Stack/junk performance on a labelled representative corpus has documented false-positive/negative and calibration results.

Gate owner: __________  Evidence: __________  Date (UTC): __________

## Gate 10 — controlled live cutover

- [ ] Gates 0–9 are signed and reviewed by someone other than the primary implementer.
- [ ] The live source/vault/inbox paths and canonical identities are recorded without copying private details into public logs/issues.
- [ ] A fresh remote recovery point is complete and restorable.
- [ ] The cutover window, operator, abort conditions, rollback steps, capacity margin, and communication plan are written.
- [ ] First live operation is the smallest media-free, strictly read-only health check permitted by the new design.
- [ ] First import uses a deliberately small, independently retained inbox batch and stops after each explicit gate for evidence review.
- [ ] Full canonical/source hashes and filesystem metadata are verified before and after using protected storage snapshots or a proven no-atime policy and the W16 audit; the verification itself does not alter live protected metadata.
- [ ] No anomaly is dismissed or repaired by deleting/renaming/moving media, clearing locks, or editing SQLite manually.
- [ ] Post-cutover backup and isolated restore verification complete before increasing scope.

Release decision: **GO / NO-GO** (circle one)

Release owner: __________

Independent reviewer: __________

Operator: __________

Date (UTC): __________

Candidate commit: __________

Backup record: __________

Evidence bundle: __________

## Automatic no-go conditions

Any one of the following immediately returns the decision to **NO-GO**:

- a source or canonical hash/stat/permission changes unexpectedly;
- more than one writer can act or maintenance cannot prove quiescence;
- a path escapes its authority root or traverses an unapproved reparse point;
- a canonical publication leaves a writable alias or overwrites an existing path;
- a running job has no deterministic recovery/terminal path;
- a copied asset does not reach the expected current projection generation;
- a confirmation can apply to a target other than the one reviewed;
- a remote snapshot cannot be restored and semantically audited;
- tests touch a real source/vault or enable screenshots/video/traces;
- the candidate differs from the recorded/tested build.

Stop, preserve the database/WAL/log/job/lock/conflict evidence, and open a new finding. Do not “fix forward” on live media.
