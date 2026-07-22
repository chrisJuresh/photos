# Repository Review Work Log — 2026-07-22

This log records the documentation-only review requested on 2026-07-22. During this review, no application code, tests, configuration, scripts, source media, canonical vault objects, derivatives, or live-vault data may be changed. Only Markdown files and `README.md` may be edited.

## Review constraints

- Source media and canonical vault objects are immutable.
- No real/source/canonical media may be decoded, hashed, copied, inspected, analysed, ranked, grouped, generated, moved, renamed, overwritten, or deleted during this review. The logged automated suites may create/process only their isolated synthetic temporary fixture bytes.
- No screenshots, screenshot tests, browser video, or screenshot-bearing traces may be created or inspected.
- No application code may be edited.
- Existing uncommitted code belongs to the user and may only be staged after its scope, tests, and safety have been reviewed.
- Documentation must distinguish facts verified from code from recommendations that are not yet implemented.

## Starting state

- Branch: `main`, tracking `origin/main`.
- Starting commit: `409cf0d` (`Track immutable media vault application`).
- Remote: `https://github.com/chrisJuresh/photos.git`.
- GitHub CLI: installed and authenticated as `chrisJuresh`.
- Worktree: a large uncommitted implementation of preprocessing and a separate review interface, with related tests and documentation.
- Existing tracked changes: 14 files, approximately 2,358 insertions and 154 deletions before accounting for untracked files.
- Existing untracked work includes review API/domain modules, review UI source and built assets, preprocessing and backfill modules, tests, a backfill checklist, and a Windows resume helper.

## Activity log

### Initial pass — Guardrails and publishing baseline

- Read the repository safety rules in `AGENTS.md`.
- Read the GitHub publishing workflow instructions.
- Confirmed the repository, branch, remote, recent history, GitHub CLI installation, and authenticated session.
- Enumerated tracked and untracked changes without modifying them.
- Began three independent read-only review passes covering data safety, API/UI architecture, and operations/testing.

### 03:10 — Validation baseline

- `python -m pytest`: **84 passed**, with one upstream Starlette `TestClient` deprecation warning.
- `python -m ruff check .`: **passed**.
- `npm test`: **20 test files / 39 tests passed**.
- `npm run check`: **0 Svelte/TypeScript errors and 0 warnings**.
- `npm run test:e2e`: **1 smoke test passed**.
- `npm run test:a11y`: **1 route-wide automated accessibility test passed**.
- Playwright capture remained disabled (`screenshot: off`, `video: off`, `trace: off`) and the E2E support server used a temporary synthetic empty vault and inbox.
- A first E2E attempt found port 4173 transiently occupied after an earlier timed-out command; the listener was gone on inspection and the clean rerun passed. No process was terminated.

### Review pass — Early findings

- Identified a cross-host writer-lock risk: stale-lock handling tests only a PID on the current host even though the lock records a host. A vault on shared storage could therefore clear another host's active lock.
- Identified a crash-recovery defect in Stage 6 background jobs. `inbox_scan`, import-manifest materialization, approval preflight, and reviewed execution can remain `running` forever after process death because the worker recovers later-stage jobs but not Stage 6 jobs, and its selector only claims `queued` rows. This makes the current review workflow unsuitable for unattended live use until job recovery is unified or repaired.
- Identified an observability gap: the review API converts unhandled exceptions to a generic response but does not log the exception, while access logging is disabled.
- Confirmed that configured media/analysis worker limits are not currently enforced as parallel pools; the worker loop is sequential.
- Confirmed that fresh-install, upgrade, rollback, disaster-recovery, and remote-backup instructions need to be added.
- Confirmed there is no repository CI workflow or enforced coverage threshold.
- Dependency review found no known runtime Python or production npm advisories; the full npm tree has three low-severity development-only findings through `cookie@0.6.0`, already acknowledged in the existing frontend progress log.

## Review progress

- [x] Inventory the complete repository and untracked file set.
- [x] Inspect the existing diff and decide whether it is a coherent, safe snapshot.
- [x] Run tests and static checks without touching media or live vault state.
- [x] Confirm generated/build/cache files are appropriately ignored or intentionally versioned.
- [x] Preserve and push the pre-existing implementation with an explicit safety hold.
- [x] Complete independent storage-safety, API/UI, and operations/test review passes.
- [x] Produce the architecture review, complete findings register, ranked action register, backup guide, user guide, release gates, and README revision.
- [x] Reconcile every documentation link/status claim and run Markdown/repository final checks.
- [x] Commit and push the documentation-only review.
- [x] Open the preserved branch as a draft pull request, not a release-ready PR.

## Publishing decision

The pre-existing implementation is worth preserving as a code backup because it is coherent, extensively tested on synthetic data, and represents substantial work. It is **not** safe to merge, release, or run against the live vault. It will therefore be committed only to a clearly labelled WIP review branch with `docs/SAFETY_HOLD.md` and a prominent README warning.

Additional release blockers found before the snapshot commit:

- the file-based writer lock has a create/write race that can admit two writers;
- the stale-lock check ignores the recorded host;
- legacy import trusts a database-derived object path without proving containment below `objects`;
- review API writers do not participate in the migration/exclusive-maintenance lock;
- Stage 6 jobs have no process-death recovery;
- backfill inventory can miss later low-sorting assets and its attempt counter can allow endless retries;
- downstream catalog/materialized results are not automatically invalidated after later imports/preprocessing;
- legacy analyze/validate source fallbacks bypass the source access-time guard;
- sidecar `rebuild-index` is a reduced recovery aid, not a full manifest/review-state restore;
- `preprocess --backfill` runs every supported job kind, so the live-backfill launcher can execute a queued reviewed copy and publish canonical objects rather than isolating release backfill work;
- the embedded review-UI worker cannot carry the code's historical hidden access-time acknowledgement, but propagating that waiver would still violate the protected-metadata policy; the advertised UI import path therefore remains blocked until filesystem/snapshot policy is fixed;
- reviewed-copy completion does not enqueue preprocessing or invalidate/refresh downstream catalog, organization, Stack, and junk generations, so newly imported photos can remain absent or unprepared in the library.
- canonical hard-link publication can crash after the final name is created but before the writable `.partial` alias is removed; the alias and canonical name then share one inode, so changing the alias would change canonical bytes.

### Snapshot commit and remote preservation

- Created `codex/wip-review-interface-audit` from `main` at `409cf0d`.
- Staged the coherent pre-existing WIP only after the full synthetic validation baseline passed and the safety hold was present.
- Confirmed no staged media files and no obvious secret-pattern hits.
- `git diff --cached --check` reported only whitespace/newline warnings in pre-existing generated frontend output; those files were not reformatted because code/generated-asset edits were outside the documentation-only phase.
- Committed 134 files as `d49e621` (`Snapshot review interface WIP; do not use live`), preserving approximately 32,357 insertions and 154 deletions.
- Pushed the branch to `origin/codex/wip-review-interface-audit` with upstream tracking.
- Did not merge to `main` or describe the snapshot as release-ready.

### Independent review completion

The three review tracks independently converged on an architectural, rather than cosmetic, release hold:

- **Storage/data safety:** lock acquisition and cross-host stale handling, API writer bypass, unchecked persisted paths, hard-link alias publication, incomplete migration/durability evidence, source-read bypasses, and incomplete backup/rebuild.
- **API/UI:** stale confirmation/selection intent, bypassed bulk safeguards, non-durable failure/undo state, derivative cache semantics, GET side effects/body buffering, polling races, incomplete paging, accessibility/virtualization/map/Unicode gaps, and monolithic boundaries.
- **Operations/tests:** stage-specific job recovery, generic backfill scope, incomplete inventory/retry accounting, absent post-copy workflow handoff, worker shutdown/limits, missing CI/clean packaging/restore/load evidence, observability/privacy/retention gaps, and documentation overclaims.

The combined register contains F01–F83 and maps every finding to W01–W58. The action matrix gives every W item an overall order plus safety, ease-of-use, reliability, security/privacy, scalability, and maintainability rankings.

### Documentation-only rework

- Added `docs/MANUAL_REMOTE_BACKUP.md` with the complete manual remote inventory, application-consistency rules, non-destructive versioned transfer example, privacy protections, backup record, and isolated restore drill.
- Added `docs/USER_GUIDE.md` with the legacy command model, intended add-photos flow, both web applications, every review area, the photo lifecycle, stop/recovery guidance, and current limitations.
- Added `docs/ACTION_PRIORITY_MATRIX.md` with 58 strictly ordered actions and six complete category rankings.
- Added `docs/FINDINGS_REGISTER.md` with 83 distinct findings, severity, evidence location, and action traceability, plus confirmed positive controls.
- Added `docs/ARCHITECTURE_REVIEW.md` with full component/process analysis, system risks, target architecture, module boundaries, workflow DAG, rework phases, and architectural decisions.
- Added `docs/RELEASE_GATES.md` with evidence-based gates and automatic no-go conditions.
- Replaced the old live `POST_BACKFILL_CHECKLIST.md` with a safe quarantine page; its historical content remains at `d49e621`.
- Added a controlling warning to `docs/FRONTEND_PROGRESS.md` so its historical live claims cannot be mistaken for current authorization.
- Rewrote `README.md` around honest status, invariants, capability/readiness, storage, setup, command effects, adding photos, interfaces, backup, validation, and documentation navigation.
- Added `docs/OPERATIONS_RUNBOOK.md`, `docs/TROUBLESHOOTING.md`, `docs/GLOSSARY.md`, and `docs/ARCHITECTURE_DECISIONS.md` so operation, incident response, terminology, and unresolved architectural policy are explicit.
- Added `SECURITY.md`, `CONTRIBUTING.md`, and `CHANGELOG.md` for privacy/security reporting, future safe contribution rules, and release-history honesty.
- Added reusable `docs/BACKUP_RECORD_TEMPLATE.md` and `docs/INCIDENT_RECORD_TEMPLATE.md` so manual backup/restore and safety incidents produce consistent evidence without public private-data leakage.
- Added `docs/README.md` as a role-based documentation hub with explicit precedence over historical ledgers.
- Added `docs/TEST_STRATEGY.md` and `docs/IMPLEMENTATION_HANDOFF.md` to turn the ranked rework into deterministic synthetic/fault/restore evidence and safe implementation epics.
- Added `docs/PR_DESCRIPTION_2026-07-22.md` as the exact draft-PR handoff; it labels the branch as preservation/review rather than a release candidate.
- Made no application-code, test, script, configuration, generated-asset, media, vault, or database change during this documentation phase.

### Independent documentation QA and final validation

Three additional read-only passes checked documentation consistency, backup/restore safety, and ranking/traceability. Their findings were reconciled without changing application code:

- corrected category-leader omissions while retaining the strict master order and added the missing F67-to-W57 mapping;
- made W16 cover every capacity approval/execution decision and filesystem-truth reconciliation;
- made release gates require an explicit disposition for every W01–W58 item and added omitted criteria for job deduplication, idempotency retention, worker limits, derivative checksum verification, projection benchmarking, tamper-evident audit retention, and runtime capacity;
- replaced residual historical live-readiness, resumability, and migration-exclusion claims with direct superseding warnings;
- tightened copied-database guidance so UI/worker labs use wholly synthetic roots and any copied live database is usable only while all referenced live roots are OS-denied, unmounted, and proven unreachable;
- hardened the remote-backup procedure around whole-root inventory, all-host quiescence, unique incomplete generations, encryption before transfer, reparse/hard-link caveats, complete authenticated inventories, pristine restore copies, disposable SQLite audit copies, and server-side temporary-data scrubbing;
- made the access-time rule absolute for live protected roots: no acknowledgement or waiver substitutes for a verified no-update storage policy or approved snapshot/block method.

Final documentation checks:

- `DOC_SCOPE_PASS changed=27 markdown_only=True`;
- `RANKING_TRACE_PASS master=58 findings=83 categories=6 leaders=6 architecture=58`;
- `DOC_LINK_PASS files=28 broken=0`;
- `DOC_UTF8_PASS invalid=0 mojibake=0`;
- `DOC_FENCE_PASS odd=0`;
- `DOC_SECRET_SCAN_PASS files=27 matches=0`;
- backup delete-propagating flags occur only inside the explicit prohibition;
- `git diff --check` found no whitespace errors; Git emitted only the repository's expected LF-to-CRLF working-copy notices.

The application suites were not rerun after the snapshot commit because every subsequent change is Markdown-only. The full synthetic baseline recorded above remains the code validation evidence for `d49e621`.

### Documentation publication

- Committed the 27-file Markdown-only review as `b29c83b` (`Document full safety and architecture review`).
- Pushed `b29c83b` to `origin/codex/wip-review-interface-audit`.
- Opened draft pull request [#1](https://github.com/chrisJuresh/photos/pull/1), titled `Preserve review interface WIP and document safety audit`, against `main`.
- Kept the pull request in draft state. No merge, release, live-vault operation, or remote media backup was performed.
- This publication record is the final Markdown-only follow-up on the same branch and pull request.
