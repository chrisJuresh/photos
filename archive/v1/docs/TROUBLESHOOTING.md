# Troubleshooting and incident response

Current rule: **do not troubleshoot the WIP by running it against the live source, vault, or inbox.** Use an isolated synthetic corpus and copied database until [RELEASE_GATES.md](RELEASE_GATES.md) is complete.

## First response to any anomaly

1. Stop submitting new UI/CLI actions.
2. If a worker is active, request a documented safe pause/cancel boundary when available; do not kill it merely to make the UI quiet.
3. Do not delete `active-writer.lock`, `.partial` names, conflict evidence, WAL/SHM files, jobs, attempts, logs, or database rows.
4. Do not move, rename, touch, rewrite, re-permission, or delete source/canonical media.
5. Record UTC time, visible action, command/URL, batch/job/entity/action ID, current phase, process IDs, ports, and exact error text.
6. Preserve a stopped, versioned snapshot according to [MANUAL_REMOTE_BACKUP.md](MANUAL_REMOTE_BACKUP.md) before attempting repair.
7. Reproduce only against an isolated copy or synthetic corpus.

The present lock and job implementation has known defects. Absence of a lock does not prove no writer; presence of an old-looking lock does not prove it is safe to remove.

## Quick triage tree

```text
Unexpected source/canonical change or object conflict?
  yes -> stop everything, preserve evidence, treat as critical incident
  no
  |
  +-- database integrity/foreign-key failure?
  |     yes -> stop writers, preserve DB+WAL+SHM, restore/audit an isolated backup
  |
  +-- migration requested or schema mismatch?
  |     yes -> do not migrate live; rehearse on copied database after all-writer barrier is fixed
  |
  +-- API responds but job does not advance?
  |     inspect worker/process/job evidence; current running job may be stranded
  |
  +-- preview/view unavailable or stale?
  |     inspect persisted job/input/generation evidence; never decode in the browser/request
  |
  +-- revision/confirmation conflict?
        reload, reselect, rereview exact target; never replay an old confirmation blindly
```

## Read-only workstation checks

These commands inspect processes/listeners and Git only. They do not stop a process or open media:

```powershell
Get-CimInstance Win32_Process |
  Where-Object {
    $_.CommandLine -match 'media[-_]vault|run\.ps1|Resume Live Vault Backfill|uvicorn'
  } |
  Select-Object ProcessId, ParentProcessId, Name, CommandLine

Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in 8765, 8766 } |
  Select-Object LocalAddress, LocalPort, OwningProcess

Set-Location 'C:\Users\Chris\Documents\photos'
git status --short --branch
git log -5 --oneline --decorate
```

Do not run the current application `status` or release audit merely as a “read-only” diagnostic on live state; F21 records that some nominal readers use the general writable manifest connection.

## Application will not start

Check, in order:

- `.venv\Scripts\python.exe` exists and `run.ps1` is being launched from the repository;
- the candidate branch/commit matches the documentation being followed;
- dependencies and external tools exist outside source/vault;
- ports 8765/8766 are not owned by another process;
- the configured vault, inbox, and derivative roots are mutually appropriate;
- the installed frontend bundle exists for a packaged run;
- schema version is supported by that exact candidate.

Do not “solve” a schema error by deleting/recreating the live database. Do not stop an unknown port owner until its identity and work state are understood.

## “Migration required”

The database is older than the feature's required schema.

- Do not migrate live while the safety hold is active.
- Do not infer exclusivity from `active-writer.lock` alone.
- Make an application-consistent remote recovery point.
- Rehearse the exact candidate migration on an isolated recent copied database.
- Verify backup capacity, integrity, foreign keys, semantic queries, rollback, and restored-copy behaviour.
- Complete Gates 1, 2, and 6 before a live decision.

## “Windows last-access updates are not confirmed disabled”

The source/inbox read was blocked deliberately because merely reading a file can change atime.

- Correct and verify the filesystem policy, or use a reviewed storage snapshot/block method that does not open protected mounted files.
- Never add/use a CLI, browser, or HTTP bypass for live source/canonical/inbox roots.
- The current hidden developer flag is not an approved live procedure.
- Preserve contents, names, directory entries, attributes, permissions, link relationships, and all required timestamps.

## “Local service ready,” but work does not advance

API health is not worker health. The current UI readiness message does not prove that a worker is running, allowed to read the input, claiming the right queue, extending its lease, or able to recover the job.

Record:

- worker process and ID;
- job ID/kind/status/control state;
- lease owner/expiry/heartbeat age;
- attempt count and last event/error;
- batch/profile/catalog generation and revision;
- whether a source-policy or tool error is persisted.

A Stage 6 or lone expired job can currently remain `running` forever. Preserve it and reproduce on a copy; do not change its status manually. W04 replaces this with a universal sweeper/state machine.

## Worker/server does not stop promptly

The embedded worker is a daemon thread and the server currently joins it for only five seconds. Closing the browser does not stop the server, and closing a console may interrupt work outside a proven safe boundary.

- Stop submitting actions.
- Use a supported pause/cancel request if it reaches a documented safe boundary.
- Record job state and wait for evidence of that boundary.
- Preserve state before forced termination is considered.
- Treat any forced termination as an incident requiring restart/recovery verification on a copy.

## Preview, metadata, metric, or poster unavailable

Unavailable may be the correct persisted result when an input representation/tool is missing, a decoder fails within bounds, a derivative checksum/stat no longer matches, or the required job has not completed.

- Inspect the persisted derivative/metadata/feature row and job error; do not make the HTTP request open the original/canonical file.
- Confirm the exact analyzer version and input identity.
- Confirm a supervised worker is healthy.
- Requeue only through a future idempotent supported control after the cause is understood.
- Never copy a random preview into the derivative path or mark a row ready manually.

## New import completed but photo is absent from Library

This is a known WIP defect, not necessarily operator error. Reviewed-copy completion does not transactionally enqueue preprocessing and invalidate/rebuild every downstream projection.

Preserve:

- approval/copy job and attempt IDs;
- resulting asset/source/destination rows;
- preprocessing job presence/absence;
- current catalog/organization/Stack/junk generation IDs.

Do not launch the generic live backfill as a repair: it can claim unrelated job kinds. W05/W06 introduce the transactional outbox and isolated generation inventory.

## Stale revision, generation, or idempotency conflict

Another action/tab changed the subject, or a response arrived for an older state.

1. Reload current state.
2. Clear/rebuild the visible selection.
3. Verify batch/entity/profile/action ID and revision.
4. Re-read the confirmation summary.
5. Submit with a fresh idempotency key only after intentional review.

Never reuse an old confirmation or blindly retry the same mutation against a different target. Current frontend confirmation/polling defects make this especially important.

## Hidden or unexpectedly large selection

Filters can hide selected entities without clearing them.

- Cancel the action.
- Clear the entire selection.
- Reapply filters and select the exact intended targets.
- Confirm shown count, selected count, favourite count, and large-selection warning.
- Do not use generic Library multi-reject on live data; it bypasses the dedicated bulk safeguards.

## Action failed but selection/undo disappeared

Treat the server response and persisted state as authoritative, not the component's cleared UI state.

- Do not repeat the action until current entity revisions/audit are reloaded.
- Record the request/action/idempotency ID and error.
- Check whether the metadata change committed before the response failed.
- Do not infer “nothing happened” from a cleared selection.

W12 requires durable recent undo and preservation of local intent on failure.

## Insufficient capacity

Do not authorize copy or migration.

- Preserve the capacity report and its exact input revision.
- Reconcile persisted verified rows with filesystem truth once the read-only doctor exists.
- Provision capacity in a separate supported vault volume or reduce only regenerable/approved data according to a retention policy.
- Never delete canonical objects, source media, conflicts, backups, or unknown partials to make the number pass.
- Rerun preflight only through the approved source-read policy.

## Port 8765 or 8766 is already in use

Identify the owner with the read-only listener/process checks above. The dashboard and review application must retain distinct ports. Do not expose either service by binding to an unapproved non-loopback interface or proxying it onto a network.

## Canonical conflict, hash mismatch, or unexpected `.partial`

This is a critical incident.

- Stop all writers and preserve the whole vault state, lock, WAL/SHM, logs, conflict files, partial names, source evidence, and candidate commit identity.
- Do not open a partial/conflict/canonical path for write.
- Do not unlink a partial: it may be a hard-link alias to a canonical inode.
- Do not “choose the newest” file, rename over the final path, or edit the destination row.
- Investigate only on snapshots/copies with filesystem identity/link-count evidence.
- Do not hash/read the live protected trees to diagnose it. The current WIP has no approved live offline-audit command. First preserve a volume/block snapshot, then use the future W16 read-only semantic audit or a candidate-specific reviewed forensic procedure on a disposable copy.

The automatic release decision becomes no-go until W02/W14/W15 evidence explains and prevents the condition.

## SQLite integrity or foreign-key failure

- Stop every writer and preserve `manifest.sqlite3`, `-wal`, `-shm`, locks, logs, and the exact application build.
- Do not run repair pragmas, dump/reload, delete WAL, checkpoint, vacuum, or migration on the live evidence.
- Restore the latest versioned backup into an isolated pristine directory and keep it sealed.
- Clone it to a disposable audit working directory, then open that database URI with `mode=ro` and `query_only=ON` for integrity/foreign-key assessment. SQLite may still create/update auxiliary shared-memory state; do not claim the working directory stayed pristine.
- Compare multiple retained generations and determine the last proven recovery point.
- Escalate to a candidate-specific recovery plan with independent review.

## Backup transfer reports failures

Robocopy exit code 8 or higher indicates at least one failure. Lower codes can still report differences that must be read.

- Keep the incomplete timestamped snapshot and its logs; do not mirror/purge it.
- Keep applications stopped if a consistent state copy is still in progress.
- Resolve permissions/capacity/connectivity without altering source/vault content.
- Rerun into a new unique generation. Preserve the failed generation unchanged; never append/overwrite it into an apparently successful snapshot.
- Do not mark the backup successful until an isolated restore passes.

## Unexpected source or canonical metadata/content change

Treat any unexpected hash, size, name, path, timestamp, attribute, permission, link-count, or directory-entry change as safety-critical.

1. Stop all application writers.
2. Preserve before/after evidence and storage/system logs.
3. Do not normalize timestamps or permissions to hide the difference.
4. Identify the exact process, operation, and filesystem primitive on a copy.
5. Revoke live authorization until the root cause has a deterministic regression test.

## Safe diagnostic record

For a private issue/evidence bundle, include only what is needed:

- UTC timeline and operator actions;
- branch/commit and tool versions;
- sanitized CLI/API error text and request/job/action IDs;
- schema version and read-only integrity/foreign-key results from a copy;
- process/listener evidence;
- relevant redacted structured log/event rows;
- synthetic reproduction steps and test result;
- backup snapshot/restore record identifiers.

Do not attach media, screenshots, videos, traces, credentials, private share names, full personal paths, GPS, camera serials, or unredacted database/backups to a public issue.
