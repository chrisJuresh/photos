# Operations runbook

This runbook describes safe operating boundaries for the reviewed repository. It does not override [SAFETY_HOLD.md](SAFETY_HOLD.md): the current WIP has no approved live writer mode.

## Operating modes

| Mode | Real source/vault? | State writes? | Current authorization |
|---|---:|---:|---|
| Documentation/code review | No media access | Repository Markdown only for this review | Allowed |
| Automated synthetic tests | Isolated temporary synthetic corpus only | Temporary test state | Allowed with capture disabled |
| Architecture lab | Synthetic source/inbox and new synthetic vault | Yes, isolated | Allowed with explicit paths and no real-media reachability |
| Copied-database rehearsal | Isolated copy with live roots OS-denied/unmounted and persisted paths rebased or proven unreachable | Yes, copied state only | Migration/query rehearsal only; not UI/worker/media processing while current path defects exist |
| Legacy dashboard inspection | Wholly synthetic or proven path-isolated copied state | Intended read-only | Allowed locally; live inspection remains prohibited while hostname/path flaws are open |
| Any live CLI/API/worker/backfill/migration | Live | Yes or can read guarded media | **Prohibited until all release gates pass** |

## Roles

- **Operator:** follows an approved candidate-specific runbook, records evidence, and stops on anomalies.
- **Release owner:** owns scope, candidate identity, backup/rollback, and go/no-go decision.
- **Independent reviewer:** checks evidence and can return the release to no-go.
- **Developer:** implements W/F items on synthetic/copied data and cannot self-approve live rollout alone.

One person may fill several roles during lab development, but Gate 10 requires an independent reviewer for live cutover.

## Before every lab session

1. Record branch and commit.
2. Confirm the paths are clearly synthetic/isolated and not aliases, junctions, subst drives, or descendants of the real source/vault/inbox.
3. Confirm no relevant live application/worker is already running.
4. Confirm Playwright capture is `off` for screenshots, video, and traces.
5. Confirm no real media is present in the test corpus or Git worktree.
6. Confirm available disk capacity and that temp/derivative/output paths are inside the isolated lab root.
7. Run the smallest relevant tests first.

Example path naming for documentation only:

```text
D:\media-vault-lab\case-<date>-<id>\
  source-synthetic\
  inbox-synthetic\
  vault-synthetic\
  restore-synthetic\
```

Do not rely on the word “synthetic” in a path. Resolve and validate the actual filesystem roots before any test can enumerate them.

A copied live manifest is not isolated merely because its SQLite file moved: it retains absolute source/inbox and other persisted path evidence. For any copied-state rehearsal, deny/unmount the live roots at the OS/storage boundary and rebase or prove unreachable every persisted root before starting code. Until W03/W38 are fixed, do not run UI/workers/media processing against that copy.

## Starting isolated services

While the safety hold is active, use only an isolated lab vault/inbox:

```powershell
Set-Location 'C:\Users\Chris\Documents\photos'

.\run.ps1 review-ui `
  --vault 'D:\media-vault-lab\case-id\vault-synthetic' `
  --inbox 'D:\media-vault-lab\case-id\inbox-synthetic' `
  --no-open `
  --no-worker
```

Run a separate worker only when the test explicitly covers it and the synthetic roots have been verified:

```powershell
.\run.ps1 worker `
  --vault 'D:\media-vault-lab\case-id\vault-synthetic' `
  --inbox 'D:\media-vault-lab\case-id\inbox-synthetic'
```

Separate processes make worker state and shutdown more observable than the embedded daemon thread. They do not fix current job-recovery defects; kill/restart behaviour belongs in controlled tests.

## During a session

- Keep a UTC action log with command, process, job/batch/profile/action ID, and result.
- Treat the UI as a client view, not the authority; preserve server/database events.
- Verify the selected target/revision immediately before any metadata mutation.
- Never use the generic backfill launcher to repair a missing job or stale catalog.
- Never expose ports 8765/8766 beyond loopback.
- Never enable screenshots, video, traces, external map tiles, analytics, or CDNs.
- Never edit SQLite or filesystem evidence to advance a state machine.
- Stop on any path, lock, lease, checksum, object, capacity, or revision anomaly.

## Stopping a session

1. Stop submitting new commands/actions.
2. Request a supported pause/cancel and wait for a documented persisted safe boundary where applicable.
3. Record the final job/control/lease/attempt state.
4. Stop the separate worker, then API/UI, only after the boundary is evidenced.
5. Check for remaining listeners/processes without terminating unknown owners.
6. Preserve logs and state for failed/interrupted tests.
7. Record test results and exact candidate commit.

Because current embedded shutdown and several recovery paths are defective, an abrupt stop must be treated as a fault-injection event, not proof of safe resumability.

## Routine live operation after—not before—release

The following is a target operating rhythm contingent on signed release gates:

### Start-of-day checks

- candidate/deployed version matches the approved release;
- backup age and last restore-drill status are within policy;
- writer barrier reports exactly one valid supervisor and no maintenance conflict;
- schema version and read-only semantic health are current;
- workers are supervised, heartbeating, and within configured resource limits;
- queue depth, expired leases, failed/manual jobs, capacity, and projection freshness are healthy;
- source/inbox access policy remains valid;
- no unresolved canonical/object/conflict incident exists.

### Import session

1. Ensure the inbox batch is independently retained.
2. Discover and prepare previews in background.
3. Review include/exclude decisions and hidden/selected counts.
4. Prepare capacity evidence bound to the exact revision.
5. Approve, then separately authorize exact copy.
6. Monitor the durable job DAG through verified asset, preprocessing, and current projections.
7. Review all warnings/errors/unavailable outputs.
8. Run the approved read-only semantic audit.
9. Create/replicate a new consistent backup generation.

### End-of-day checks

- no unexplained running/expired jobs;
- no pending canonical conflicts or mutable aliases;
- current projection generation includes the latest verified assets;
- errors have owner/resolution evidence without deleting the original record;
- state/log backup completed remotely and is monitored;
- operator log records any paused/manual work.

## Maintenance and migration window

Do not schedule live maintenance until W01/W09 are complete.

The future sequence is:

1. publish a candidate-specific plan and stop/abort conditions;
2. finish a fresh remote restore point;
3. refuse new commands and drain jobs to safe boundaries;
4. acquire the universal maintenance barrier and prove no writer connection/process remains;
5. rehearse exact migration on a recent isolated copy;
6. verify capacity for backup + WAL + migration + rollback + margin;
7. create and verify the local rollback artifact;
8. migrate transactionally;
9. run integrity, foreign-key, semantic, application, and projection checks;
10. release the barrier only after success, or execute the proven rollback without overwriting evidence;
11. make a new remote snapshot and restore-check it.

## Backup operations

Use [MANUAL_REMOTE_BACKUP.md](MANUAL_REMOTE_BACKUP.md). The operational facts to remember are:

- the source, canonical objects, complete SQLite state, inbox, and review/audit history are irreplaceable;
- SQLite main/WAL/SHM must represent one consistent state;
- the current lock cannot prove quiescence;
- `rebuild-index` and sidecars are incomplete;
- snapshots must be versioned and non-delete-propagating;
- restore/audit in isolation is part of backup, not an optional later task.

## Severity and response

| Severity | Examples | Response |
|---|---|---|
| Critical | Unexpected source/canonical change; two writers; path escape; mutable canonical alias; corrupt DB; failed restore | Stop all work, preserve evidence/snapshot, revoke live authorization, independent incident review |
| High | Stranded/duplicated job; missing import-to-projection handoff; stale confirmation applied; unbounded retry; backup overdue | Stop affected workflow, preserve state, reproduce/fix on copy, no scope increase |
| Medium | Incomplete paging, unavailable derivative, polling race, UI/accessibility defect, poor performance | Avoid affected action, record finding, prioritize by matrix; no unsafe workaround |
| Low | Cosmetic/documentation/development-only advisory with no data-integrity effect | Track with owner/version; batch only if it cannot hide higher-severity evidence |

## Handoff record

At the end of an operational or development session, record:

- date/time/timezone and people/roles;
- branch/commit/build/tool identities;
- operating mode and exact isolated/live roots (keep private records private);
- commands/actions and IDs;
- jobs/generations/backup state at handoff;
- tests/audits and evidence locations;
- anomalies, open W/F IDs, and explicit next safe action;
- whether the system is stopped, paused at a proven boundary, or supervised and healthy.

Never describe a process as “safe to resume” without the job engine/recovery evidence required by W04.
