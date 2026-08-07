# Backup and restore record

Create a protected companion copy in the backup catalog and bind it to the immutable server snapshot ID. Keep it outside the sealed data tree so restore results do not mutate snapshot evidence. Complete it with private operational details; do not commit a filled record containing private paths, hostnames, usernames, server locations, credentials, keys, GPS, serials, or database extracts.

## Identity

- Backup ID: `<UTC timestamp + unique suffix>`
- UTC start: `<YYYY-MM-DDTHH:MM:SSZ>`
- UTC end: `<YYYY-MM-DDTHH:MM:SSZ>`
- Operator: `<private name/role>`
- Workstation/source host: `<private>`
- Protected volume identities/filesystem types: `<private evidence>`
- Actual resolved source/vault/inbox/derivative/cache/log/temp/config roots: `<private inventory>`
- Writer topology (services/tasks/users/hosts/launchers): `<private inventory>`
- Remote target/snapshot ID: `<private>`
- Retention expiry/policy: `<date/policy>`
- Encryption method/key escrow reference: `<reference only; never the key>`
- Git branch: `<branch>`
- Git commit: `<full SHA>`
- Application/package build ID: `<ID>`
- Python/Node/npm/ExifTool/FFmpeg versions: `<versions>`
- SQLite schema version: `<version>`

## Backup scope

| Target | Local path (private record) | Remote subpath | Included? | File count | Bytes | Transfer log/result |
|---|---|---|---:|---:|---:|---|
| Original source | `<path>` | `source/` | [ ] | | | |
| Whole vault | `<path>` | `vault/` | [ ] | | | |
| Canonical objects | `<path>` | `vault/objects/` | [ ] | | | |
| Complete state incl. DB/WAL/SHM/evidence | `<path>` | `vault/state/` | [ ] | | | |
| Records | `<path>` | `vault/records/` | [ ] | | | |
| Reports/logs/exports | `<paths>` | `vault/...` | [ ] | | | |
| Derivatives selected by policy | `<path>` | `vault/derivatives/` | [ ] | | | |
| Unpublished inbox | `<path>` | `inbox/` | [ ] | | | |
| Git bundle and lock/build docs | `<path>` | `code/` | [ ] | | | |
| Configured out-of-vault state | `<resolved paths>` | `<mapped subpaths>` | [ ] | | | |
| Build/SBOM/tool artifacts | `<artifact sources>` | `code/artifacts/` | [ ] | | | |
| Service/task/config definitions | `<private sources>` | `code/operations/` | [ ] | | | |

Document every intentional exclusion and why it is either independently protected or provably regenerable:

```text
<none, or exact exclusions/rationale/owner>
```

The component rows beneath “whole vault” validate coverage; they do not imply a second overlapping transfer.

## Consistency window

- [ ] New UI/CLI submissions stopped.
- [ ] Every worker/job reached a recorded safe idle boundary.
- [ ] Review UI/API stopped.
- [ ] Separate/embedded workers stopped.
- [ ] Backfill/preprocess/legacy writer processes stopped.
- [ ] Dashboard/listeners stopped for the copy window.
- [ ] Services, scheduled tasks, other-user sessions, and other hosts were excluded from writing.
- [ ] Process inspection showed no known writer-capable command (supporting evidence only, not proof).
- [ ] Ports 8765/8766 had no listener.
- [ ] Lock path was absent.
- [ ] If a lock was present/unexplained, it was preserved without deletion and this generation was marked **FAIL**, not accepted.
- [ ] The fixed universal barrier proved quiescence, or every protected volume/root was offline/unavailable to all application hosts during a storage snapshot.
- [ ] Main SQLite, WAL, and SHM were copied in the same stopped snapshot.
- [ ] All coupled roots remained unavailable to writers until source, vault, inbox, and configured out-of-vault state reached one snapshot/generation.

How quiescence was established (the current WIP lock alone is insufficient):

```text
<process/listener/job evidence>
```

## Source access-time decision

- Observed filesystem/access-time policy: `<evidence>`
- Backup method: `<storage snapshot/block replication/file-level copy>`
- Verified no-atime-update evidence for every file-level protected-media read: `<evidence/not applicable>`
- If no safe policy/snapshot method was available, backup stopped: `<yes>`
- Before/after filesystem evidence: `<private reference>`

No exception authorizes changes to protected contents, names, directory entries, permissions, attributes, link relationships, or required timestamps.

## Transfer results

| Transfer | Start/end UTC | Exit/result | Log | Warnings/differences resolved? |
|---|---|---:|---|---:|
| Source | | | | [ ] |
| Vault | | | | [ ] |
| Inbox | | | | [ ] |
| Code bundle | | | | [ ] |

- [ ] No delete-propagating mirror/purge/move option was used.
- [ ] The destination generation was unique and did not exist before this run.
- [ ] A no-follow inventory proved there were no unaccounted required reparse points, or the approved backup method preserved their metadata without traversing unapproved targets.
- [ ] Required ACL/owner/audit/alternate-stream metadata was preserved by the selected method or explicitly recorded as unsupported before approval.
- [ ] Every transfer log was retained and read.
- [ ] All failures and unexpected skips/differences were resolved or recorded as a failed backup.
- [ ] A complete authenticated inventory/digest generated from the protected snapshot reconciled every remote/restored file; counts/bytes/samples were not used as the proof.
- [ ] Canonical-object identities all reconciled to trusted manifest evidence without rereading live protected media.
- [ ] For incident evidence, the selected method preserved/proved required file-ID/hard-link topology; ordinary Robocopy was not treated as forensic proof.
- [ ] Server-side snapshot/version/immutability controls were confirmed.
- [ ] Capacity/monitoring/retention alerts are active.

## Git bundle

- Bundle filename: `<name>`
- Bundle size/checksum: `<evidence>`
- `git bundle verify` result: `<result>`
- Included refs: `<summary>`
- Worktree clean? `<yes; if no, exact separate reviewed snapshot/patch reference>`
- Wheel/sdist/frontend/SBOM/tool artifact checksums: `<evidence>`
- Offline/private artifact-repository availability: `<evidence>`

## Restore drill

- Restore ID/path/machine: `<isolated private target>`
- Restore UTC start/end: `<times>`
- Restored from immutable snapshot/version: `<ID>`
- Live source/vault overwritten? **No**
- Pristine restored copy kept sealed? **Yes**
- Disposable audit working-copy path: `<private target>`
- [ ] Expected top-level vault/source/inbox/code areas are present.
- [ ] File/byte totals reconcile with transfer evidence.
- [ ] Main DB/WAL/SHM belong to the same snapshot.
- [ ] SQLite checks ran on the disposable audit working copy with URI `mode=ro` and `query_only=ON`; auxiliary-file changes were not mistaken for pristine evidence.
- Integrity check result: `<exact summary; expected one ok row>`
- Foreign-key check result: `<exact summary; expected empty>`
- Full object/path/filesystem/capacity semantic audit: `<result/evidence>`
- Derivative/projection/input lineage audit: `<result/evidence>`
- Review decisions/preferences/saved views/audit/undo/profile state checks: `<result/evidence>`
- Representative application queries: `<result/evidence>`
- Canonical transfer verification: `<result/evidence>`
- Complete snapshot/remote/pristine-restore cryptographic inventory reconciliation: `<result/evidence>`
- Reparse/security descriptor/owner/audit/alternate-stream/link-topology verification: `<result/evidence>`
- Server scrub/bit-rot monitoring result: `<result/evidence>`
- Unresolved discrepancies: `<none or details/owner>`

## Outcome

- Backup result: **PASS / FAIL**
- Restore result: **PASS / FAIL**
- Immutable server snapshot accepted/published exactly once: `<snapshot/catalog ID>`
- Proven recovery point (UTC): `<time>`
- Measured restore duration: `<duration>`
- Next backup due: `<time>`
- Next restore drill due: `<time>`
- Operator signature/date: `<private>`
- Independent reviewer signature/date: `<private>`

Failed/incomplete generations remain preserved for diagnosis and must not be silently relabelled or overwritten.
