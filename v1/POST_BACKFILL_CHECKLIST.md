# Historical post-backfill checklist — quarantined

> [!CAUTION]
> **Do not run or resume the live backfill, and do not use the former commands/checks as release approval.** The 2026-07-22 full review found release-critical writer-lock, canonical-publication, job-recovery, backfill-scope, inventory/retry, source-access, workflow-invalidation, and backup/restore defects. See [docs/SAFETY_HOLD.md](docs/SAFETY_HOLD.md).

This filename is retained so bookmarks and historical references fail safely. The previous checklist remains available in Git history at commit `d49e621`; it is evidence of the WIP process, not an approved runbook.

## Why the old checklist is invalid

The previous procedure could not prove a safe release because it:

- assumed the file lock excluded all writers even though API mutations bypass it and lock acquisition itself is racy;
- treated the release-backfill launcher as isolated even though the generic worker can claim unrelated job kinds, including reviewed copy;
- assumed interrupted jobs always recover even though Stage 6 and some lone expired jobs can remain `running` indefinitely;
- used a live keyset inventory that can miss concurrently added lower-sorting assets and retry accounting that can loop indefinitely;
- relied on a retained schema-2 migration backup and reduced sidecars that cannot restore current schema-12 review state;
- sampled 64 canonical objects rather than proving full object/path/filesystem/capacity truth;
- did not demonstrate an encrypted remote, application-consistent snapshot restored and audited in isolation;
- could not show that newly copied assets automatically reached preprocessing and current catalog/organization/Stack/junk generations;
- did not account for a crash leaving a writable `.partial` hard-link alias to a canonical inode;
- used reader/audit paths that are not all provably read-only.

## Replacement process

1. Keep `Resume Live Vault Backfill.cmd`, `preprocess --backfill`, `worker`, and `review-ui` stopped for the live vault.
2. Back up the required data using [docs/MANUAL_REMOTE_BACKUP.md](docs/MANUAL_REMOTE_BACKUP.md).
3. Implement the actions in [docs/ACTION_PRIORITY_MATRIX.md](docs/ACTION_PRIORITY_MATRIX.md), beginning with W01–W16.
4. Resolve every applicable finding in [docs/FINDINGS_REGISTER.md](docs/FINDINGS_REGISTER.md) with adversarial evidence.
5. Complete and independently sign [docs/RELEASE_GATES.md](docs/RELEASE_GATES.md).
6. Only then write a new candidate-specific cutover/backfill checklist tied to an exact commit, toolchain, backup record, copied-database rehearsal, and rollback plan.

No checkbox in the historical procedure carries forward. Do not delete locks, edit SQLite manually, clear jobs, remove partial/conflict evidence, or alter any source/canonical media to make a check pass.
