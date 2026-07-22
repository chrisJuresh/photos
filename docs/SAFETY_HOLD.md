# Safety hold: do not use the review/backfill snapshot on the live vault

- Status: **WIP preservation snapshot only**
- Reviewed: 2026-07-22
- Applies to: the current uncommitted review application, workers, preprocessing/backfill pipeline, and related legacy entry points

The current implementation passes its synthetic automated tests, but the code review found blockers that make it unsuitable for the live vault. Preserve it on a review branch; do not merge it as a release and do not start it against `G:\MediaVault`, `G:\photos`, or the live inbox.

## Immediate prohibitions

Until every release gate below is satisfied:

- Do not run `review-ui`, `worker`, `inbox-scan`, or `preprocess --backfill` against the live vault.
- Do not double-click `Resume Live Vault Backfill.cmd`.
- Do not run legacy `analyze` or `validate` against the live vault; those paths can read original sources without applying the source access-time guard.
- Do not migrate the live database. Test only on an isolated copied database while all live writers remain stopped.
- Do not treat the absence of `state\active-writer.lock` as proof that no writer exists; API metadata writes do not participate in that lock.
- Do not recover a stuck job by editing SQLite manually. Preserve evidence and fix/test the recovery protocol first.

## Release-blocking findings

### 1. The single-writer lock has an acquisition race

`VaultRunLock` creates the lock file and then writes its JSON. A second contender can observe the newly created but not-yet-populated file, treat it as unreadable/stale, unlink it, and acquire a replacement while the first process continues. Both processes can then believe they hold the single-writer lock.

The stale check also records but does not honor the host name. On shared or network storage, a PID check on the current machine can clear a lock held by a different host.

Required outcome: replace the protocol with a tested OS/filesystem lock or an atomic, host-aware lease whose incomplete record can never be mistaken for a stale writer. Include concurrent acquisition, PID reuse, foreign-host, crash, and network/share semantics in the tests.

Evidence: `media_vault/core.py`, `VaultRunLock.__enter__`.

### 2. Legacy canonical import does not contain a database-derived object path

The legacy import path joins `vault.root` to `assets.object_relpath`, then creates directories and publishes the object without first proving that the resolved target is below `vault/objects`. A damaged or tampered manifest could therefore direct a write outside the canonical object tree. The newer reviewed-copy implementation has a containment check; the legacy implementation needs the same invariant at every read/write boundary.

Required outcome: centralize canonical-object path resolution, require normalized relative paths, reject traversal/absolute/reparse escapes, and fault-test corrupted manifest values before any directory or file operation.

Evidence: `media_vault/vault_ops.py`, `import_assets`.

### 3. The maintenance lock is not an all-writer barrier

The review API opens writable SQLite connections, starts immediate transactions, and commits metadata changes without acquiring or registering with `VaultRunLock`. A migration can therefore see no active writer even while the review service can still write. This violates the exclusive-maintenance requirement and makes live backup assumptions based only on the lock unsafe.

Required outcome: introduce one database-wide writer/maintenance coordination layer used by CLI writers, API mutations, background workers, migration, backup, and recovery. Migration must refuse while any service capable of writing is live.

Evidence: `media_vault/review_api.py`, `ApplicationStateStore.connection` and mutation methods; `media_vault/migrations.py`, `migrate_vault`.

### 4. Stage 6 jobs can be stranded after a crash

`inbox_scan`, `import_manifest_materialize`, `import_approval_preflight`, and `reviewed_execute` move to `running`, but worker startup has no Stage 6 recovery path and selects only `queued` jobs. A killed process can leave these jobs permanently unclaimable. Other stages implement separate recovery logic, which has already drifted.

Required outcome: replace per-stage job state machines with one transactional claim/lease/heartbeat/retry/cancel/recovery service used by every job kind. Add process-death and fault-injection tests for each public phase boundary.

Evidence: `media_vault/review_runtime.py`; `media_vault/review_stage6.py`.

### 5. Backfill inventory and retry accounting are not stable

The backfill records a count and walks `asset_id > cursor`. An asset imported later with an ID below the saved cursor can be missed. The coordinator increments its attempt only when `started_at` is null, so subsequent failures can be requeued indefinitely instead of exhausting `max_attempts`. Completed catalog/organization/Stack/junk results are not automatically invalidated when later imports or preprocessing change their inputs.

Required outcome: bind a backfill to an immutable persisted inventory or generation, account for concurrent imports explicitly, increment every claim attempt, cap retries, and invalidate/rebuild downstream generations when authoritative inputs change.

Evidence: `media_vault/review_backfill.py`, `_claim_backfill` and `_advance_backfill`; catalog/materialization entry points in `media_vault/review_library.py`.

The advertised launcher also does not isolate backfill work. `preprocess --backfill` runs the full supported worker-kind set, including reviewed-copy and Stage 6 import jobs. If an authorized copy job is already queued, the launcher can publish canonical objects even though it is presented as a low-priority backfill/resume operation. A dedicated backfill queue or job-DAG scope is required before the launcher can be used.

Evidence: `media_vault/review_runtime.py`, `SUPPORTED_WORKER_JOB_KINDS` and `preprocess_vault`; `Resume Live Vault Backfill.cmd`.

### 6. Backup/rebuild is not full disaster recovery

SQLite uses WAL. Copying only `manifest.sqlite3` while a process is live can omit committed WAL state. `rebuild-index` creates a reduced recovery index from asset sidecars; it does not reconstruct the authoritative manifest, review decisions, preferences, imports/jobs, saved views, organization data, Stack state, junk feedback, or audit history.

Required outcome: document and test an application-consistent backup/restore procedure for the whole vault state; perform restore drills; verify SQLite integrity/foreign keys and representative application queries; state explicitly which data is regenerable and which is irreplaceable.

Evidence: `media_vault/db.py`, `ManifestDB`; `media_vault/vault_ops.py`, `rebuild_recovery_index`.

### 7. Some legacy source reads bypass the access-time policy gate

Legacy `analyze` can fall back from a missing canonical object to an original source, and legacy `validate` byte-compares with an available original source. Neither command performs the source read-policy check used by scan/import entry points. On the configured NTFS policy, that read can alter source access-time metadata.

Required outcome: route every possible original-source open through one mandatory source-access guard and record the authorization/evidence. Tests must cover fallbacks, not only the primary path.

Evidence: `media_vault/relations.py`, `_asset_path` and image analysis; `media_vault/vault_ops.py`, `validate_objects`; `media_vault/cli.py`, `command_analyze` and `command_validate`.

### 8. The documented review-UI import path cannot satisfy this machine's access-time policy

The README records that NTFS last-access updates are enabled and requires an explicit acknowledgement for source/inbox reads. The embedded worker started by `review-ui` has no CLI option to pass that acknowledgement, so inbox discovery, review-preview preparation, or reviewed copy can fail at the guard on this machine. The one-click launcher also omits it. The guard must not be silently weakened.

Required outcome: preferably fix and verify the filesystem last-access policy. If an exception remains necessary, make it an explicit, durable, path-scoped local operator acknowledgement outside the HTTP API; surface the blocked reason in the UI; and test/document the exact flow.

Evidence: `media_vault/cli.py`, review UI parser; `media_vault/review_api.py`, embedded worker startup; `media_vault/review_runtime.py`; the configured policy in `README.md`.

## Minimum release gates

All of the following must be true before the hold is lifted:

1. The eight blockers above are fixed in code and covered by deterministic synthetic tests.
2. The full Python, frontend unit, Svelte/type, smoke, and automated accessibility suites pass with capture disabled.
3. Concurrent-writer and abrupt-process-death tests pass repeatedly.
4. A clean package is built and installed into an empty environment, and its bundled review UI starts from the installed artifact.
5. A copied production-size database is migrated, backfilled, interrupted/resumed, audited, backed up, restored elsewhere, and audited again.
6. Source and canonical-object content plus filesystem metadata are proven unchanged around every test that could reach them.
7. A human reviews the complete action register and explicitly approves live rollout.

The detailed rankings, architecture options, operating instructions, and backup procedure will live in the accompanying review documentation. This hold is intentionally short enough to remain the first operational stop sign.
