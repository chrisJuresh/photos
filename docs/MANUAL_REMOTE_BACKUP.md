# Manual remote-backup runbook

This document answers two questions:

1. What exists only on this workstation or its attached storage and must be copied to a remote server?
2. How can an operator make and prove a restorable copy without modifying source media or canonical vault objects?

No backup was executed during the 2026-07-22 review. The commands below are an operator runbook, not evidence that a remote copy already exists.

> [!CAUTION]
> The current WIP has writer-coordination and recovery defects. Its process/port/lock checks cannot prove all writers are quiescent. The release-grade current option is an offline/storage snapshot or block-level copy taken while the protected volumes are unavailable to every application/host, followed by remote replication of that snapshot. A stopped file-level copy is only a fallback after every known service/task/process/other-user/other-host writer is excluded and the no-atime/reparse/security-metadata conditions below are proven. Do not kill a busy worker merely to begin a backup; preserve its state and obtain engineering guidance.

## Backup inventory and priority

| Priority | Local data | Default path | Why it matters | Can it be regenerated? |
|---:|---|---|---|---|
| 1 | Original source tree | `G:\photos` | The original media and source layout | **No** |
| 1 | Canonical content-addressed objects | `G:\MediaVault\objects` | Verified vault copies of distinct byte sequences | Only by rereading available originals; treat as irreplaceable |
| 1 | Authoritative SQLite state and all state evidence | `G:\MediaVault\state` | Manifest, source history, review decisions, jobs, preferences, saved views, audit, migrations, conflicts, and recovery evidence | **No complete rebuild exists** |
| 1 | Unpublished import inbox | `G:\MediaVaultImports` | New files that may not yet exist in source or canonical objects | **No**, unless independently retained elsewhere |
| 1 | Asset recovery records | `G:\MediaVault\records` | Per-asset portable evidence used by the reduced recovery index | Partly regenerable only while the authoritative DB survives |
| 2 | Reports and structured logs | `G:\MediaVault\reports`, `G:\MediaVault\logs` | Operational, safety, and incident evidence | No equivalent history can be recreated later |
| 2 | Portable exports | `G:\MediaVault\exports` | Human/tool-readable snapshots of core asset state | Regenerable from a healthy DB, but valuable during recovery |
| 2 | Regenerable prepared derivatives | `G:\MediaVault\derivatives` by default | Avoids expensive repeat decoding and preserves exactly what was reviewed | Yes, after code/analyzer versions and canonical objects are available |
| 2 | Repository and Git history | this repository and its `.git` history | Code/schema version needed to interpret and restore data | GitHub is one remote copy; keep an independent bundle for disaster recovery |
| 2 | Actual configured out-of-vault roots | resolved derivative/cache/log/temp/config paths from the exact deployment | CLI options can place important/private evidence outside defaults | Varies; inventory explicitly |
| 2 | Release/tool artifacts | built wheel/sdist/frontend artifact, SBOM, tool installers or private artifact-repository references and checksums | Locks alone do not guarantee future offline availability | Rebuildable only while exact dependencies/tools remain obtainable |
| 2 | Service/task/launch configuration | private definitions for scheduled tasks, services, launchers, environment/config and permissions | Needed to understand/restore writer topology safely | Partly reproducible; record exact current state |
| 3 | Legacy dashboard cache | `C:\Users\Chris\Documents\photos\.ui-cache` | Existing preview cache only | Yes |
| 3 | Local environments/caches | `.venv`, `review_ui\node_modules`, `.pytest_cache`, `.ruff_cache`, `.svelte-kit` | Build/test convenience | Yes; rebuild from lock files |

The safest simple policy is to back up the **entire resolved** vault tree, source tree, inbox, and every configured out-of-vault authority into a unique non-destructive remote snapshot. The paths above are defaults, not discovery. Record actual resolved roots, volume identities/filesystem types, CLI/service/task configuration, and independently escrowed encryption-recovery material before transfer. Selective backup is harder to reason about and easier to get wrong.

While this WIP is under safety hold, preserve `state\tmp`, conflict files, WAL/SHM files, locks, and other apparently transient evidence in the stopped snapshot. A `.partial` name may be a hard-link alias to a published canonical inode; do not open it for write, “clean” it, or exclude it based only on its suffix. It is not authoritative application state, but it can be essential incident evidence. After W02 is fixed, a future backup policy may exclude validated regenerable temporary files from routine generations while retaining them in incident snapshots.

Robocopy does not preserve/prove hard-link file-ID/link-count topology; it normally materializes separate destination files for separate names. For an alias/conflict incident, use a volume/block snapshot or a forensic-capable no-write method and capture file-ID/link-count evidence from the snapshot before transfer. The fallback Robocopy recipe is data-recovery copying, not sufficient forensic preservation of a hard-link incident.

## What `rebuild-index` does not recover

`rebuild-index` reads asset sidecars and canonical objects into a new, reduced search/validation index. It does **not** reconstruct the authoritative schema-version-12 manifest. In particular, it does not restore:

- review include/exclude decisions, approvals, or idempotency records;
- favourite/rejected/rating state and its event audit;
- import batches, item history, worker jobs, progress, events, or errors;
- user preferences or saved views;
- current derivative/metadata/quality certifications;
- catalog, facet, organization, map, Stack, or junk generations;
- Stack covers, junk feedback/calibration, bulk-action undo state, or release-backfill progress;
- the complete run/migration history.

The SQLite state is therefore an irreplaceable backup target even when every object and sidecar survives.

## Consistency rules

Before copying the vault state:

1. Stop submitting UI actions.
2. Let any copy/preprocessing/materialization operation reach an idle boundary.
3. Stop the review UI and its embedded worker, any separate `worker`, any `preprocess`/backfill process, every legacy writer command, and the read-only dashboard.
4. Check both processes and listening ports; do not rely only on the lock file.
5. Confirm `G:\MediaVault\state\active-writer.lock` is absent. If it is present, **do not delete it**. Investigate the recorded process/host and preserve the file as evidence.
6. Keep every coupled root unavailable to writers until the complete source, vault (including any `manifest.sqlite3-wal`/`-shm`), inbox, and configured out-of-vault state have reached the same snapshot/generation.

SQLite uses WAL. Copying only `manifest.sqlite3` while a writer is active can omit committed transactions that remain in `manifest.sqlite3-wal`. Copying database files at different points in time can also create a set that never existed together.

The current database should remain on a local filesystem supported by SQLite locking. Do not run the live manifest directly from an SMB/NFS share; use the remote server for backup snapshots, not as an untested live database volume.

## Pre-backup operator checks

Run these read-only checks in a private PowerShell session. Their output can expose paths/arguments, so do not paste it into public logs/issues. They list some relevant processes/listeners; they do not stop anything and are evidence only, **not proof of quiescence**. They can miss renamed/packaged executables, services, scheduled tasks, other-user processes, inaccessible command lines, and writers on another host:

```powershell
Get-CimInstance Win32_Process |
  Where-Object {
    $_.CommandLine -match 'media[-_]vault|run\.ps1|Resume Live Vault Backfill|uvicorn'
  } |
  Select-Object ProcessId, ParentProcessId, Name, CommandLine

Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in 8765, 8766 } |
  Select-Object LocalAddress, LocalPort, OwningProcess

Test-Path -LiteralPath 'G:\MediaVault\state\active-writer.lock'
```

Necessary result before a fallback state copy: no relevant app/worker process, no listener on 8765/8766, and `False` for the lock path. If any result differs, stop and investigate. Even if they match, use the fixed universal writer barrier when available or an offline/storage snapshot that excludes every host; do not call these checks proof.

## Recommended remote layout

Use versioned snapshots rather than a mirror that deletes remote files missing locally:

```text
<remote-backup-root>/
  immutable-media-vault/
    2026-07-22T031500Z-a1b2c3d4.incomplete/
      source/
      vault/
      inbox/
      code/
      transfer-logs/
    backup-catalog/
      2026-07-22T031500Z-a1b2c3d4-BACKUP_RECORD.md
```

Never use `/MIR`, `/PURGE`, `/MOVE`, or another delete-propagating option for this archive. Retain several dated generations and enable the server's snapshots/versioning/immutability controls where available.

## Immutable-media access-time gate

This machine's documented NTFS policy currently permits last-access updates. A file-level copy reads the original source, canonical objects inside the vault, and unpublished inbox media and can therefore change their access times. **Do not run the fallback recipe below** unless one of these is already proven:

1. the copy reads a storage/volume snapshot or block-level representation rather than mounted protected files; or
2. the filesystem last-access policy has been corrected and verified for every protected root before the file-level copy.

If neither is possible, stop and obtain a candidate-specific reviewed method. The historical hidden application acknowledgement is not authority to change protected metadata during backup. No backup method may change contents, names, directory entries, attributes, permissions, link relationships, or required timestamps.

## Fallback example: file-level copy to a Windows/SMB server

Prefer a storage-native snapshot or backup product that preserves all required metadata without opening immutable files through the mounted tree. The Robocopy example below is a fallback for a target where data/attributes/timestamps are the approved contract. `/COPY:DAT` does not preserve every possible ACL/owner/audit/alternate-stream property; if those properties are required for recovery, use a proven compatible backup method and record it instead of assuming this example is sufficient.

The example deliberately uses `/XJ` so it will not traverse junctions into an unknown tree. That also means it is a complete “whole-tree” copy only after an approved no-follow inventory proves there are no required reparse-point entries/targets under the three roots. If any reparse point exists or the inventory cannot prove its behaviour, stop and design a method that preserves the link/reparse metadata without following it or reading an unapproved target.

Before the first byte or log is written, verify the share's encryption, effective ACL/inheritance, capacity, retention, and snapshot/immutability support. Never embed credentials in the UNC path. Replace `\\server\backups` with the real protected share. These commands generate a timestamp plus random suffix, label the working generation incomplete, refuse reuse, create private code/log directories, and copy without deleting local or remote files:

```powershell
$BackupStamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHHmmssZ')
$BackupSuffix = (New-Guid).Guid.Substring(0, 8)
$BackupRoot = "\\server\backups\immutable-media-vault\$BackupStamp-$BackupSuffix.incomplete"

if (Test-Path -LiteralPath $BackupRoot) {
  throw "Refusing to reuse an existing backup generation: $BackupRoot"
}

New-Item -ItemType Directory -Path $BackupRoot -ErrorAction Stop | Out-Null
New-Item -ItemType Directory -Path (Join-Path $BackupRoot 'code') -ErrorAction Stop | Out-Null
New-Item -ItemType Directory -Path (Join-Path $BackupRoot 'transfer-logs') -ErrorAction Stop | Out-Null

robocopy 'G:\photos' "$BackupRoot\source" /E /COPY:DAT /DCOPY:DAT /XJ /Z /R:2 /W:5 /LOG:"$BackupRoot\transfer-logs\source-robocopy.log"
$SourceCopyExit = $LASTEXITCODE

robocopy 'G:\MediaVault' "$BackupRoot\vault" /E /COPY:DAT /DCOPY:DAT /XJ /Z /R:2 /W:5 /LOG:"$BackupRoot\transfer-logs\vault-robocopy.log"
$VaultCopyExit = $LASTEXITCODE

robocopy 'G:\MediaVaultImports' "$BackupRoot\inbox" /E /COPY:DAT /DCOPY:DAT /XJ /Z /R:2 /W:5 /LOG:"$BackupRoot\transfer-logs\inbox-robocopy.log"
$InboxCopyExit = $LASTEXITCODE

[pscustomobject]@{
  Source = $SourceCopyExit
  Vault  = $VaultCopyExit
  Inbox  = $InboxCopyExit
}
```

For Robocopy, exit codes 0 through 7 are success-with-differences/information; 8 or higher means at least one failure. Read and retain every protected log even when the exit code is below 8. The generation remains `.incomplete` and must never be reused. After complete cryptographic inventory reconciliation and an isolated restore drill, publish/seal it once using the server's storage-native immutable snapshot/catalog mechanism and record that immutable snapshot ID; do not make an incomplete directory look successful by overwriting or relabelling it. A successful transfer is not yet a proven restore.

## Independent code backup

The WIP snapshot is pushed to GitHub, but a restorable system also benefits from an independent Git bundle stored with the data snapshot:

```powershell
Set-Location 'C:\Users\Chris\Documents\photos'
git status --porcelain=v2 --branch --untracked-files=all
git bundle create "$BackupRoot\code\photos-all-refs.bundle" --all
git bundle verify "$BackupRoot\code\photos-all-refs.bundle"
```

A Git bundle contains committed refs only; it omits uncommitted/untracked files and ordinary build/install artifacts. A dirty worktree is therefore a failed “exact code state” precondition unless the deliberate changes are first committed/pushed or a separate reviewed, encrypted repository snapshot/patch is preserved after media/secret/private-state scanning. `--all` can also retain secrets in old refs, so protect and review the bundle like sensitive state.

Also retain `requirements.lock`, `requirements-test.lock`, `pyproject.toml`, `review_ui\package-lock.json`, this documentation, the tested wheel/sdist and frontend artifact, build identity, SBOM/license/advisory record, and checksums. For disconnected recovery, retain legally redistributable Python/npm/tool artifacts in a protected artifact repository or offline cache, plus verified ExifTool/FFmpeg installers/binary hashes. Escrow encryption/recovery material separately—never inside this snapshot or Git. Do not rely on `.venv` or `node_modules` as the primary durable artifact.

## Server-side protections

The backup contains the media itself—including possible faces, children, documents, screens, and audio—plus thumbnails/previews, partial/conflict bytes, private filenames, full source paths, capture times, GPS coordinates, camera serial numbers, review decisions, terminal/process command evidence, transfer logs, and Git history. Require:

- encryption in transit and at rest;
- a dedicated least-privilege backup identity;
- no anonymous/share-wide read access;
- immutable/versioned snapshots or object lock;
- monitoring for failed/incomplete transfers and low capacity;
- retention appropriate to the desired recovery-point objective;
- a second failure domain in addition to the workstation and attached `G:` storage.
- credentials supplied through an approved credential manager/session, never embedded in a UNC path, script, command line, log, record, or terminal history.

A useful minimum is the 3-2-1 rule: three copies, on two storage types/failure domains, with one off-site. GitHub counts for code, not for media/vault data.

## Backup record

Create a protected companion record from [BACKUP_RECORD_TEMPLATE.md](BACKUP_RECORD_TEMPLATE.md) in the backup catalog, keyed to the immutable server snapshot ID. Keep it outside the sealed data tree so restore results can be appended without mutating snapshot evidence. At minimum record:

- UTC start/end time;
- workstation, source volume, vault path, inbox path, and remote target;
- Git branch and commit;
- whether every application/worker was stopped and how that was checked;
- whether the writer lock was absent;
- protected source/canonical/inbox access-time policy and the approved snapshot/backup method;
- each Robocopy exit code and log filename;
- source/vault/inbox counts/bytes plus complete authenticated inventory/digest reconciliation (counts alone are insufficient);
- SQLite integrity/foreign-key result from a disposable audit working copy, with the pristine restore kept sealed;
- server snapshot/version identifier and retention expiry;
- restore-drill date and result;
- operator name and unresolved anomalies.

Do not store credentials or recovery keys in this record.

## Verification and restore drill

A backup is complete only after a restore to a separate directory proves it usable. Never test by restoring over `G:\photos` or `G:\MediaVault`.

1. Take a storage-native immutable/server-side snapshot of the unique incomplete generation; never verify by mutating the transfer destination itself.
2. Restore that immutable snapshot into an isolated **pristine restore** on another volume or machine.
3. Clone the pristine restore into a second disposable **audit working copy**. Keep the remote snapshot and pristine restore sealed: even SQLite read-only connections can create/update auxiliary shared-memory state.
4. Confirm the restored set contains every actual configured source/vault/inbox/out-of-vault/code root and expected vault area (`objects`, complete `state`, `records`, `logs`, `reports`, `exports`, and policy-selected derivatives).
5. Confirm `state\manifest.sqlite3` and any WAL/SHM files came from the same snapshot/generation.
6. Use a backup/storage tool with authenticated transfer verification or create a complete cryptographic inventory from the protected storage snapshot—not by rereading live protected media. Verify every file/type/path/size/digest on the remote and restored sides; reconcile every canonical object to trusted manifest identity; record reparse/security/link topology separately where the chosen method supports it. Counts, byte totals, and representative hashes are not sufficient.
7. Run SQLite integrity and foreign-key checks on the **disposable audit working copy**, using URI `mode=ro` plus `query_only=ON` to prohibit database writes while accepting that disposable auxiliary files may change.
8. Run the full read-only semantic audit on the audit working copy: contained object/path/filesystem truth, capacity, derivative/input checksums, projection lineage/generations, review decisions/preferences/audit/undo/profiles, and representative application queries. Keep live roots OS-denied/unmounted.
9. Verify server-side scrub/bit-rot monitoring and immutable retention for the accepted snapshot.
10. Record every result. Preserve failed/incomplete snapshots unchanged. Mark the immutable server snapshot accepted only through the external backup catalog/record; never overwrite or relabel failed data in place.

One way to run internal SQLite checks on the disposable audit working copy with the project's Python is:

```powershell
$AuditDatabase = 'D:\RestoreDrills\working-copy\vault\state\manifest.sqlite3'
@'
import sqlite3
import sys
from pathlib import Path

path = Path(sys.argv[1]).resolve()
uri = f"file:{path.as_posix()}?mode=ro"
connection = sqlite3.connect(uri, uri=True)
connection.execute("PRAGMA query_only=ON")
print("integrity_check:", connection.execute("PRAGMA integrity_check").fetchall())
print("foreign_key_check:", connection.execute("PRAGMA foreign_key_check").fetchall())
connection.close()
'@ | C:\Users\Chris\Documents\photos\.venv\Scripts\python.exe - $AuditDatabase
```

Expected output is exactly one `('ok',)` integrity row and an empty foreign-key list. This proves internal SQLite consistency only. It neither keeps the audit directory byte-for-byte pristine nor proves external objects, paths, review state, or application behaviour; those are separate full-inventory/semantic checks above.

## Suggested schedule

| Event | Minimum action |
|---|---|
| Before any migration, import execution, backfill, or architecture rollout | New consistent full state snapshot plus confirmed remote source/object coverage |
| After verified new canonical objects or reviewed imports | Copy new objects, the full consistent state, records, reports/logs, and inbox remainder |
| Daily while review metadata is changing | Consistent state/records/logs snapshot |
| Weekly or after source additions | Source and inbox snapshot, subject to the access-time policy |
| After each code/documentation release | Push Git refs and create an independent Git bundle |
| Quarterly | Restore drill on a separate path/machine |

## Current manual actions

Until automated, application-consistent backup and restore exist, the operator still needs to:

- provision and secure the remote target;
- enumerate every actual configured/default root and offline/tool/service dependency;
- choose/approve a snapshot/copy method compatible with protected-media metadata and reparse/security/link semantics;
- coordinate the fixed universal barrier or a true offline/all-host storage snapshot;
- copy source, whole vault, inbox, configured out-of-vault state, and exact code/build/tool artifacts;
- inspect transfer logs and resolve all failures;
- create the backup record;
- verify server retention/versioning;
- verify a complete cryptographic inventory and restore/audit an isolated disposable working copy while preserving a pristine restore;
- repeat the process on schedule.
