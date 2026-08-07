# User guide

This guide explains the installed workstation, the legacy vault workflow, the intended add-photos review workflow, every review UI area, and what the application persists at each step.

> [!CAUTION]
> The review application and backfill are currently a WIP snapshot under [SAFETY_HOLD.md](SAFETY_HOLD.md). The review-UI/worker instructions may be exercised only with a wholly synthetic database, vault, source, inbox, and derivatives. A copy of the live database retains absolute paths and can still reach live media through current containment defects, so reserve it for specifically reviewed migration/query rehearsal with OS-level denial/unmounting of live roots. Do not point any command at `G:\photos`, `G:\MediaVault`, or the live inbox until the hold is lifted.

## Mental model

There are three distinct kinds of media storage:

| Area | Default path | Rule |
|---|---|---|
| Original source | `G:\photos` | Permanently immutable; the app may enumerate/read only after its access-time guard is satisfied |
| Import inbox | `G:\MediaVaultImports` | Staging input for reviewed imports; discovery/review never moves or deletes it |
| Canonical object store | `G:\MediaVault\objects` | Permanently immutable after verified no-overwrite publication |

Generated derivatives live separately, normally under `G:\MediaVault\derivatives`. They are prepared background outputs and may be rebuilt. SQLite metadata, decisions, jobs, and audits live under `G:\MediaVault\state`; they are mutable application state and must be backed up consistently.

“Reject,” “favourite,” “rate,” “exclude,” “Stack,” and “junk” are metadata concepts. They never mean delete, move, rename, or rewrite media.

## The two web interfaces

| Interface | Default URL | Purpose | Mutation capability |
|---|---|---|---|
| Legacy dashboard | `http://127.0.0.1:8765/` | Inspect legacy vault/run/source/asset evidence | GET/HEAD/OPTIONS only; SQLite opened read-only |
| Review application | `http://127.0.0.1:8766/` | Review imports, browse the library, organize, Stack, assess junk, and change application metadata | Local API metadata mutations plus background-job enqueueing |

They use separate static applications, APIs, and default ports. The review interface did not replace the legacy dashboard.

## Existing workstation paths and tools

- Repository: `C:\Users\Chris\Documents\photos`
- Python environment: `.venv`
- Original source: `G:\photos`
- Vault: `G:\MediaVault`
- Reviewed-import inbox: `G:\MediaVaultImports`
- Legacy dashboard: port 8765
- Review application: port 8766
- External readers/decoders: ExifTool and FFmpeg/ffprobe

The repository records Python 3.14.6, Node 22/npm 10, ExifTool 13.59, and FFmpeg/ffprobe 8.1.1 as the configured toolchain. Confirm rather than assume:

```powershell
Set-Location 'C:\Users\Chris\Documents\photos'
.\.venv\Scripts\python.exe --version
node --version
npm --version
exiftool -ver
ffmpeg -version
.\run.ps1 --help
```

## Reproducing a development installation

The repository currently assumes the workstation environment already exists; there is no supported one-command bootstrap yet. A development setup is approximately:

```powershell
Set-Location 'C:\Users\Chris\Documents\photos'
py -3.14 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install --requirement requirements.lock
.\.venv\Scripts\python.exe -m pip install --requirement requirements-test.lock
.\.venv\Scripts\python.exe -m pip install --no-deps --editable .

Set-Location .\review_ui
npm ci
npm run check
npm test
npm run build
Set-Location ..
```

Install ExifTool and FFmpeg outside both source and vault, or pass their executable paths with the corresponding CLI options. Treat this as developer guidance until a clean-install package test and supported bootstrap are added.

## Source access-time policy

The recorded Windows policy allows NTFS last-access updates. Reading source, inbox, or canonical files may therefore alter protected access-time metadata. Commands that can enumerate/read a source normally refuse unless the policy is safe.

The current code contains a hidden developer acknowledgement and the embedded review worker cannot carry it. Neither path is an approved live solution. Correct and verify the filesystem policy or use a reviewed snapshot/block method that avoids mounted-file reads. Do not add an HTTP/CLI switch or silently weaken the guard.

No live backup/import/analysis/validation exception may waive source, inbox, or canonical metadata immutability.

## Legacy command workflow

The sequence below documents intent. Because the current branch has writer-lock, path-containment, and source-guard blockers, use it only after the relevant safety hold is fixed or in a wholly synthetic isolated lab.

### 1. Initialize an empty vault

```powershell
.\run.ps1 init --vault 'G:\MediaVault'
```

What happens:

- vault/state/log/report/record/export/object directories are created;
- a schema-version-12 SQLite manifest is initialized for a new vault;
- tool identities are recorded;
- no source path is enumerated and no media is copied.

### 2. Migrate an existing manifest explicitly

```powershell
.\run.ps1 migrate --vault 'G:\MediaVault'
```

What is designed to happen:

- acquire exclusive writer/maintenance coordination;
- validate the current database;
- check backup capacity;
- create and verify a unique SQLite backup under `state\backups`;
- apply ordered schema migrations transactionally;
- run integrity and foreign-key checks;
- restore the verified backup on a post-commit validation failure.

Current restriction: API writers do not participate in the same lock, and the lock itself has a race/cross-host defect. Migrate only a copied database until fixed.

### 3. Preflight the source

```powershell
.\run.ps1 preflight --source 'G:\photos' --vault 'G:\MediaVault'
```

What happens:

1. source/vault separation and access-time policy are checked;
2. the source is recursively enumerated without following reparse points/symbolic links;
3. ExifTool metadata and file signatures classify candidates;
4. each media candidate is fully read once to compute SHA-256, SHA-512, and BLAKE3;
5. exact byte identities and source history are committed to SQLite;
6. capacity is calculated with one canonical object per distinct verified byte sequence plus a margin;
7. a JSON report and structured run log are written below the vault;
8. no canonical media object is copied.

Review the latest report under `G:\MediaVault\reports` and confirm `sufficient_free_space` before any import authorization.

If the command refuses because Windows last-access updates are not proven disabled, stop. Correct and verify the filesystem policy or use a future approved snapshot/block method. The code contains a hidden developer acknowledgement, but this runbook explicitly prohibits using it on protected live roots.

### 4. Recover a completed scan's capacity report

If scanning committed successfully but report publication was interrupted:

```powershell
.\run.ps1 finalize-preflight --vault 'G:\MediaVault'
```

This uses persisted scan totals. It does not enumerate or read the source.

### 5. Execute verified canonical copy

```powershell
.\run.ps1 import --source 'G:\photos' --vault 'G:\MediaVault' --execute
```

Designed copy contract:

- rescan/rehash before copying;
- refuse incomplete traversal or insufficient capacity;
- copy to a unique `.partial` below vault state while hashing;
- reopen and rehash the temporary output;
- byte-compare it with the source;
- publish through a same-filesystem no-overwrite operation;
- verify/adopt a matching object found after a race;
- retain evidence instead of overwriting a conflict;
- write destination state and a recovery sidecar.

Current restriction: legacy import needs a mandatory canonical `objects` containment check for database-derived paths before live use.

### 6. Analyze relationships

```powershell
.\run.ps1 analyze --vault 'G:\MediaVault'
```

This calculates non-exact image/video relationships and RAW/JPEG groups, then refreshes sidecars/exports. `--deep-video` adds full decoded primary-stream hashing.

Current restriction: analysis can fall back to original sources without applying the access-time guard. Do not run live until fixed.

### 7. Validate canonical objects

```powershell
.\run.ps1 validate --vault 'G:\MediaVault'
```

This rehashes canonical objects and, when a source representative is available, byte-compares it. It updates validation metadata and sidecars; it does not rewrite canonical bytes.

Current restriction: the source byte-compare can bypass the access-time guard. Do not run live until fixed.

### 8. Inspect and export

```powershell
.\run.ps1 status --vault 'G:\MediaVault'
.\run.ps1 progress --vault 'G:\MediaVault' --interval 10
.\run.ps1 ui --vault 'G:\MediaVault'
.\run.ps1 export --vault 'G:\MediaVault'
```

- `status` prints recent runs, capacity, and warning counts.
- `progress` reads small atomic progress snapshots; `Ctrl+C` stops only the viewer.
- `ui` runs the legacy dashboard in the foreground; `Ctrl+C` stops only that server.
- `export` rebuilds asset sidecars, `exports\manifest.jsonl`, and `exports\assets.csv`.

Current note: `status` and the release audit use the general writable `ManifestDB` connection class rather than a provably read-only connection. The dashboard itself uses SQLite `mode=ro` and `query_only=ON`, but still needs TrustedHost/DNS-rebinding hardening before sensitive metadata is exposed in an untrusted browser environment.

## Adding photos through the review application

This is the intended post-release flow. It is not currently approved for the live vault.

### Prepare the inbox

Place each import as an immediate child directory of the inbox:

```text
G:\MediaVaultImports\
  2026-07 Cornwall\
    DCIM\
      photo001.jpg
      photo001.xmp
      clip001.mov
  Scans from family album\
    page001.tif
```

The batch directory may contain recursive folders. Keep the input unchanged during discovery/review/copy. Reparse points and symbolic links are recorded/skipped rather than followed.

### Start services (lab only while held)

The designed all-in-one command is:

```powershell
.\run.ps1 review-ui --vault 'D:\media-vault-lab\case-id\vault-synthetic' --inbox 'D:\media-vault-lab\case-id\inbox-synthetic' --no-open
```

It serves the UI and starts an embedded background worker. `--no-worker` suppresses that worker so a separate worker can be supervised:

```powershell
.\run.ps1 review-ui --vault 'D:\media-vault-lab\case-id\vault-synthetic' --inbox 'D:\media-vault-lab\case-id\inbox-synthetic' --no-open --no-worker
.\run.ps1 worker --vault 'D:\media-vault-lab\case-id\vault-synthetic' --inbox 'D:\media-vault-lab\case-id\inbox-synthetic'
```

These paths must contain a newly constructed synthetic manifest and synthetic bytes. Do not substitute a copied live manifest unless an approved rehearsal has proven that every persisted absolute/root-relative path is rebased or denied at the OS level and no process can reach the real roots.

Open `http://127.0.0.1:8766/` manually when `--no-open` is used.

Current restrictions:

- embedded shutdown is not a proven safe boundary for every job kind;
- some running jobs cannot be recovered after process death;
- the live workstation policy does not prove metadata-preserving reads, and the embedded worker cannot make that safe; the hidden developer waiver is not approved;
- the UI's “Local service ready” state proves the API responds, not that a healthy worker is claiming jobs.

### Imports page: step by step

1. Select **Imports** in the primary navigation.
2. Select **Scan inbox**.
3. The API enqueues discovery; a worker records batch folders/files, stat snapshots, classification evidence, full hashes where applicable, exact matches, sidecar associations, and preview jobs.
4. Select the batch under **Import history**.
5. Wait for discovery, hashing, matching, and prepared-preview evidence. The page shows phase, folder rollups, progress samples, structured events, errors, and manifest pages.
6. Use manifest filters/search/sort and select rows with pointer, Space/Enter, or Shift range selection.
7. Select **Include in this import** or **Exclude from this import**. These change SQLite decision metadata only; they do not change inbox files.
8. Use **Undo** for recent in-component decision history, and re-check the persisted result.
9. Select **Prepare approval summary**. A background preflight binds capacity/count evidence to the exact batch revision.
10. Check the review-confirmation box and select **Approve decision snapshot**. Approval freezes the reviewed revision/observations; later changes must invalidate it.
11. Review free-space evidence, then separately select **Authorize verified copy**.
12. Monitor current phase, bytes, folders, events, and errors. **Pause safely** requests a safe-boundary pause; **Resume** continues; **Cancel future work** stops not-yet-published work. A verified object is retained.

What verified execution is intended to do:

- revalidate the approved source observation;
- copy only eligible included media and associated sidecars;
- use the triple-hash, reopened-temp, byte-compare, fsync, and no-overwrite publication contract;
- link exact matches without duplicating objects;
- append source/destination/import/job/audit evidence;
- never delete or move inbox files.

Current gap: verified copy does not enqueue preprocessing for new assets or automatically refresh catalog → organization → Stack → junk generations. A copied photo may therefore lack prepared derivatives and remain absent from the Library until the workflow is redesigned; manual catalog refresh alone does not create missing derivatives.

### Import comparisons and history

- Check **Compare** for at least two batches and choose **Compare selected**.
- **Load older imports**, **Load older progress samples**, **Load more folders**, **Load older events**, and **Load older errors** follow persisted cursors.
- Treat events/errors as evidence; do not edit the DB to clear a stuck job.

## Review UI reference

### Overview

The landing page links to Imports, Library, Organize, Junk review, Bulk reject, and Settings. Service-ready text indicates API availability only.

### Library

The **Photo browser** reads a prepared logical-photo catalog and ready derivatives. It supports:

- path/filename search;
- media kind, format, camera, lens, folder, favourite, rejected, and rating filters;
- capture time, filename, size, quality, similarity, and deterministic random ordering supported by the API;
- grid density, contact-sheet mode, and display-only grayscale;
- Previous/Next keyset pages;
- saved in-page library views;
- selection, favourite, reject, rating, inspection, and open-in-folder;
- Stack profile preparation, Stack-aware cards, member expansion, and cover override.

Rejected entities are hidden by default. Favourite, reject, rating, and Stack-cover changes are SQLite metadata only.

The inspector can show the selected logical entity, prepared detail derivative, RAW/JPEG members, stored source/destination evidence, extended metadata, features, relationships, warnings, audit events, and Stack actions.

Current safety/usability restrictions:

- **Reject selected** uses the generic state endpoint and bypasses the dedicated bulk confirmation/favourite safeguards;
- F/X/I are global bare-letter shortcuts for favourite/reject/inspect and can trigger outside a deliberately focused grid;
- inspector/bulk confirmations can remain checked when the target changes;
- Stack reject-rest currently does not expose durable undo in the UI;
- evidence/detail collections can be silently capped;
- do not use mutation actions on live data while held.

### Organize

**Explore the vault** reads background-prepared views over the same logical entities:

- Calendar includes exact-date, unknown-time, and ambiguous-time buckets.
- Folders can show logical photos or source occurrences in a recursive hierarchy.
- Camera and lens use normalized values while retaining raw evidence.
- Private offline map uses bundled geometry and persisted clusters; it makes no tile/geocoding request.

Links open a corresponding Library view. Current pagination cursors are not fully consumed by the frontend, and the map controls filter server data without changing the fixed full-world visual projection. The visible source also contains mis-decoded punctuation/arrow characters that need correction before release.

### Junk review

Junk review is a recommendation/feedback layer over persisted signals. It never deletes media.

1. Choose or prepare a profile.
2. Set confidence, minimum agreeing signals, enabled reasons, and favourite protection.
3. Select **Prepare profile in background**.
4. Review **Would be hidden** or **All results**.
5. Inspect explanations and any better alternative.
6. Record **This is not junk** or **This should be junk** as feedback metadata.
7. Move to Bulk reject only when intentionally applying rejected metadata.

Stack/junk algorithms have synthetic correctness tests but still need a labelled representative corpus and measured false-positive/false-negative evaluation before being trusted for real curation.

### Bulk reject

Bulk reject applies `rejected=true` metadata to selected candidates. It is designed to require:

- an explicit review confirmation;
- a separate acknowledgement when favourites are included;
- a separate acknowledgement for a large selection;
- an action ID that supports undo.

Current restrictions: hidden filtered selections can remain chosen; confirmations can carry across profile/selection changes; failures can still clear the local selection; undo survives only in current component memory; paging has no previous-page stack. Do not use on live data until these are fixed.

### Settings

Settings contains:

- theme and density preferences;
- general saved-view entries;
- release-backfill status/start/resume/pause controls.

Current restrictions:

- the saved shell-view state is not applied when its link is opened;
- stored density is not consumed by the application shell;
- the backfill launcher/worker can claim unrelated queued job kinds, including reviewed copy;
- backfill inventory, retry, generation invalidation, and recovery have blockers.

Do not start or resume live preparation from Settings.

## What happens to a photo over time

| Step | Reads | Writes | Media mutation? |
|---|---|---|---|
| Inbox discovery | Inbox directory entries/files for evidence/hashes | Import manifest/history/jobs in SQLite | No |
| Review preview preparation | Approved current inbox observation | Regenerable WebP derivative + certification rows | No original/canonical mutation |
| Include/exclude | Existing manifest rows | Decision/revision/audit metadata | No |
| Approval preflight | Persisted manifest/capacity state | Durable preflight job/result | No media read in HTTP request |
| Approval | Persisted exact revision | Immutable approval metadata | No |
| Execute authorization | Persisted approval | Queued reviewed-copy job | No media work in HTTP request |
| Reviewed copy worker | Approved inbox bytes | New canonical object via no-overwrite, DB rows, sidecar/log evidence | Publishes a new object; never changes an existing one |
| Asset preprocessing | Verified canonical object (or accepted prepared representation) | Regenerable derivatives/metadata/features | No canonical mutation |
| Catalog/organization/Stack/junk | Persisted DB evidence and ready derivatives where specified | Rebuildable materializations/profile results | No original/canonical mutation |
| Favourite/reject/rating/cover/feedback | Persisted entity/profile state | SQLite metadata/audit | No |

HTTP handlers are intended to query persisted data, serve an existing certified derivative, update metadata, or enqueue a job. Media decoding, hashing, copying, analysis, grouping, ranking, rollups, and derivative generation belong in background workers.

## Common problems

The concise cases below cover normal recognition. For incident preservation, stuck jobs, object conflicts, SQLite failures, and safe diagnostic evidence, use [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

### “Migration required”

Do not migrate live while the safety hold is active. Copy the database/vault state to an isolated location, stop every writer-capable process, migrate the copy, and validate it.

### “Windows last-access updates are not confirmed disabled”

The source/inbox read was blocked deliberately. Correct and verify the filesystem policy or use an approved storage snapshot/block method that leaves protected metadata unchanged. Do not use the hidden developer acknowledgement or add a CLI/browser bypass on live roots.

### “Local service ready,” but work does not advance

API health is not worker health. Check the worker process and durable job state. A Stage 6 or expired running job can currently be stranded; preserve evidence and do not edit SQLite manually.

### Preview or metric unavailable

The UI reports persisted unavailable/error evidence when a decoder is missing, bounded work fails, or no ready certified derivative exists. Retry through the eventual supported job controls after resolving the recorded cause; never make the HTTP request decode the original.

### Prepared view in progress

Compound searches/sorts and organization/Stack/junk views are background materializations. The UI should reconnect to the durable job. Current polling/race behavior needs hardening; reload and verify the selected batch/profile/entity before acting.

### Stale generation or revision conflict

Another tab/action changed state. Reload current state, review the new target/revision, then retry with a new idempotency key. Never blindly replay a confirmation for a different subject.

### Insufficient capacity

Do not authorize copy. Free or provision separate vault capacity, rerun persisted preflight against the exact current revision, and review the margin.

### Port 8765/8766 already in use

Identify the owning process before stopping anything:

```powershell
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in 8765, 8766 } |
  Select-Object LocalAddress, LocalPort, OwningProcess
```

Use `--port` only while preserving dashboard/review separation.

## Stopping safely

- `Ctrl+C` stops a foreground CLI/server.
- The progress viewer and legacy dashboard are not supposed to stop a scanner/worker.
- A review worker should be allowed to reach a documented safe boundary.
- Current embedded shutdown waits only five seconds and does not pass cooperative cancellation into every runner; do not assume an abrupt close is recoverable.
- After a suspected interruption, preserve the DB, WAL, logs, lock, and job evidence before any remediation.

## Backup and recovery

Follow [MANUAL_REMOTE_BACKUP.md](MANUAL_REMOTE_BACKUP.md). The minimum remote set is the source, entire vault (especially objects/state/records), inbox, reports/logs, and a code/Git bundle. `rebuild-index` is a reduced recovery aid, not a full review-state restore.

## Validation for developers

All tests use synthetic temporary corpora; never point them at the real source or vault. Screenshot, video, and trace capture must remain off.

```powershell
Set-Location 'C:\Users\Chris\Documents\photos'
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m ruff check .

Set-Location .\review_ui
npm test
npm run check
npm run test:e2e
npm run test:a11y
```

Current review baseline: 84 Python tests, 39 frontend unit/component tests, one Playwright smoke test, and one route-wide automated accessibility test passed. This is useful evidence, not production approval; crash/concurrency/restore/clean-package/populated-UI coverage remains incomplete.
