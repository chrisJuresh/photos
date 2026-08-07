# Safety incident record

Use this template for unexpected source/canonical changes, writer/lock anomalies, path escapes, object conflicts, stranded/duplicated jobs, database failures, incorrect metadata actions, backup/restore failures, or privacy exposure.

Keep the completed record private unless it has been deliberately redacted. Never attach media, screenshots, videos, traces, live databases/backups, credentials, exact private locations, GPS, or camera serials to a public report.

## Summary

- Incident ID: `<UTC timestamp + unique suffix>`
- Detected UTC: `<time>`
- Detector/operator: `<private role>`
- Severity: `<critical/high/medium/low>`
- Status: `<open/contained/investigating/recovered/closed>`
- One-sentence impact: `<what invariant/data/workflow may be affected>`
- Related W/F IDs: `<IDs>`

## Candidate and environment

- Git branch/commit/build: `<exact identity>`
- Python/Node/npm/ExifTool/FFmpeg: `<versions>`
- OS/filesystem/topology: `<supported private summary>`
- SQLite schema version: `<version>`
- Operating mode: `<synthetic lab/copied rehearsal/live>`
- Relevant batch/job/attempt/entity/action/generation IDs: `<IDs>`

## Immediate containment

- [ ] New actions stopped.
- [ ] Safe pause/cancel requested where possible.
- [ ] Writers/services/listeners recorded.
- [ ] Source/canonical media left untouched.
- [ ] Locks/partials/conflicts/jobs/WAL/SHM/logs preserved without cleanup/edit.
- [ ] Consistent versioned snapshot made or latest proven recovery point protected.
- [ ] Live authorization revoked if a release invariant is implicated.

Containment actions and UTC timeline:

```text
<facts only>
```

## Expected versus observed

Expected invariant/behaviour:

```text
<exact expectation>
```

Observed evidence:

```text
<sanitized exact error/state/difference>
```

Do not normalize/repair evidence merely to compare it.

## Scope assessment

- Source contents/names/metadata/permissions affected? `<yes/no/unknown + evidence>`
- Canonical contents/names/link-count/permissions affected? `<yes/no/unknown + evidence>`
- Manifest/WAL integrity affected? `<yes/no/unknown + evidence>`
- Review decisions/audit/undo affected? `<yes/no/unknown + evidence>`
- Jobs/projections affected? `<yes/no/unknown + evidence>`
- Backup/recovery point affected? `<yes/no/unknown + evidence>`
- Private metadata exposed? `<yes/no/unknown + evidence>`
- Earliest/latest affected generation/time: `<range>`

## Evidence inventory

| Evidence | Snapshot/private location | Checksum/identity | Collected read-only? | Notes |
|---|---|---|---:|---|
| Process/listener record | | | [ ] | |
| DB/WAL/SHM snapshot | | | [ ] | |
| Lock/job/attempt/events/errors | | | [ ] | |
| Logs/reports/conflicts/partials | | | [ ] | |
| Before/after approved audit | | | [ ] | |
| Git/build/tool identity | | | [ ] | |
| Synthetic reproduction | | | [ ] | |

## Root cause

- Trigger: `<event>`
- Direct technical cause: `<cause>`
- Missing/failed invariant: `<boundary>`
- Why existing tests/review/operations did not prevent it: `<gap>`
- Contributing factors: `<factors>`
- Confidence and remaining uncertainty: `<assessment>`

## Remediation plan

| Action | W/F/ADR | Owner | Evidence required | Status |
|---|---|---|---|---|
| | | | | |

The fix must be reproduced and verified on synthetic/copied state before any live repair/cutover. Do not repair live media by overwriting, moving, renaming, deleting, relinking, or timestamp/permission normalization.

## Recovery

- Selected recovery point: `<backup/snapshot ID>`
- Why it is trusted: `<restore/audit evidence>`
- Isolated recovery rehearsal result: `<result>`
- Candidate-specific live recovery approval: `<owner/reviewer/date>`
- Post-recovery semantic audit: `<result>`
- New remote snapshot/restore result: `<result>`

## Closure

- [ ] Root cause has deterministic regression/fault test.
- [ ] All affected W/F/ADR/docs/release gates updated.
- [ ] CI/operations/monitoring detect recurrence.
- [ ] Backup/restore and rollback re-proven.
- [ ] Privacy disclosure/credential rotation completed if applicable.
- [ ] Independent reviewer accepted evidence.
- [ ] No-go status lifted only through formal release decision.

- Closed UTC: `<time>`
- Release owner: `<private>`
- Independent reviewer: `<private>`
- Residual risk/expiry: `<details>`
