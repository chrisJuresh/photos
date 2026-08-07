# Documentation hub

The repository is under a live-use safety hold. Use this page to choose the right document and understand which one controls when historical claims conflict.

## Precedence

1. [SAFETY_HOLD.md](SAFETY_HOLD.md) and [RELEASE_GATES.md](RELEASE_GATES.md) control operational authorization.
2. [FINDINGS_REGISTER.md](FINDINGS_REGISTER.md), [ACTION_PRIORITY_MATRIX.md](ACTION_PRIORITY_MATRIX.md), and [ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md) control current review status and implementation priorities.
3. [USER_GUIDE.md](USER_GUIDE.md), [OPERATIONS_RUNBOOK.md](OPERATIONS_RUNBOOK.md), [TROUBLESHOOTING.md](TROUBLESHOOTING.md), and [MANUAL_REMOTE_BACKUP.md](MANUAL_REMOTE_BACKUP.md) explain current limitations and future intended operation.
4. [../SCHEMA.md](../SCHEMA.md) describes the WIP data model, subject to review caveats.
5. `FRONTEND_SPEC.md`, `FRONTEND_PLAN.md`, and `FRONTEND_PROGRESS.md` are historical design/implementation records. They never override a later safety finding or authorize a live command.

## Start here by role

### Operator

1. [Safety hold](SAFETY_HOLD.md)
2. [Manual remote backup](MANUAL_REMOTE_BACKUP.md)
3. [Backup record template](BACKUP_RECORD_TEMPLATE.md)
4. [Operations runbook](OPERATIONS_RUNBOOK.md)
5. [Troubleshooting](TROUBLESHOOTING.md)
6. [Release gates](RELEASE_GATES.md)

### Application user

1. [../README.md](../README.md)
2. [User guide](USER_GUIDE.md)
3. [Glossary](GLOSSARY.md)
4. [Troubleshooting](TROUBLESHOOTING.md)

### Developer or reviewer

1. [Architecture review](ARCHITECTURE_REVIEW.md)
2. [Findings register](FINDINGS_REGISTER.md)
3. [Action priority matrix](ACTION_PRIORITY_MATRIX.md)
4. [Architecture decisions](ARCHITECTURE_DECISIONS.md)
5. [Test strategy](TEST_STRATEGY.md)
6. [Implementation handoff](IMPLEMENTATION_HANDOFF.md)
7. [Review work log](REVIEW_WORKLOG_2026-07-22.md)

### Incident responder

1. [Troubleshooting: first response](TROUBLESHOOTING.md#first-response-to-any-anomaly)
2. [Incident record template](INCIDENT_RECORD_TEMPLATE.md)
3. [Manual remote backup](MANUAL_REMOTE_BACKUP.md)
4. [Automatic no-go conditions](RELEASE_GATES.md#automatic-no-go-conditions)

## Document inventory

| Document | Status | Purpose |
|---|---|---|
| `SAFETY_HOLD.md` | Current/controlling | Short stop sign and immediate blockers |
| `RELEASE_GATES.md` | Current/controlling | Evidence and independent go/no-go sign-off |
| `FINDINGS_REGISTER.md` | Current review | F01–F83 observations, evidence, and action mapping |
| `ACTION_PRIORITY_MATRIX.md` | Current review | W01–W58 strict order and six category rankings |
| `ARCHITECTURE_REVIEW.md` | Current review | Full system/process review and target architecture |
| `IMPLEMENTATION_HANDOFF.md` | Current recommendation | Safe starting sequence and delivery boundaries |
| `TEST_STRATEGY.md` | Current recommendation | Required invariant/fault/CI/release evidence |
| `USER_GUIDE.md` | Current caveated guide | Detailed commands, adding photos, UI, lifecycle |
| `OPERATIONS_RUNBOOK.md` | Current caveated guide | Authorized modes, session/maintenance/incident operations |
| `TROUBLESHOOTING.md` | Current caveated guide | Safe diagnosis and evidence preservation |
| `MANUAL_REMOTE_BACKUP.md` | Current manual runbook | Remote inventory, consistency, transfer, restore drill |
| `BACKUP_RECORD_TEMPLATE.md` | Template | Private record for each snapshot/restore |
| `INCIDENT_RECORD_TEMPLATE.md` | Template | Private containment/evidence/recovery record |
| `GLOSSARY.md` | Reference | Shared terminology |
| `ARCHITECTURE_DECISIONS.md` | Decision register | Proposed ADRs and template |
| `REVIEW_WORKLOG_2026-07-22.md` | Audit trail | Commands, checks, publishing and documentation activity |
| `PR_DESCRIPTION_2026-07-22.md` | Publishing artifact | Draft-PR summary, validation, blockers, and review guidance |
| `FRONTEND_SPEC.md` | Historical | Intended product contract at planning time |
| `FRONTEND_PLAN.md` | Historical | Original staged implementation plan |
| `FRONTEND_PROGRESS.md` | Historical | Stage implementation/test/live-operation chronology |

Root-level [SECURITY.md](../SECURITY.md), [CONTRIBUTING.md](../CONTRIBUTING.md), [CHANGELOG.md](../CHANGELOG.md), [SCHEMA.md](../SCHEMA.md), and the quarantined [POST_BACKFILL_CHECKLIST.md](../POST_BACKFILL_CHECKLIST.md) complement this set.

## Updating documentation

- Keep W01–W58 and F01–F83 stable; add suffixes/new IDs instead of renumbering history.
- Mark verified current behaviour, intended design, historical evidence, and operator authorization distinctly.
- Update safety hold/release gates first when status changes.
- Keep commands copyable but never normalize hidden/unsafe developer options into routine live guidance.
- Never include real media, screenshots/video/traces, credentials, private database/log/backup content, GPS, serials, or remote keys.
- Validate relative links and Markdown diff whitespace before commit.
