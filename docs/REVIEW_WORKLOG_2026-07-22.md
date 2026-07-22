# Repository Review Work Log — 2026-07-22

This log records the documentation-only review requested on 2026-07-22. During this review, no application code, tests, configuration, scripts, source media, canonical vault objects, derivatives, or live-vault data may be changed. Only Markdown files and `README.md` may be edited.

## Review constraints

- Source media and canonical vault objects are immutable.
- No media may be decoded, hashed, copied, inspected, analysed, ranked, grouped, generated, moved, renamed, overwritten, or deleted.
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

### 03:xx — Guardrails and publishing baseline

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

### 03:xx — Early review findings

- Identified a cross-host writer-lock risk: stale-lock handling tests only a PID on the current host even though the lock records a host. A vault on shared storage could therefore clear another host's active lock.
- Identified a crash-recovery defect in Stage 6 background jobs. `inbox_scan`, import-manifest materialization, approval preflight, and reviewed execution can remain `running` forever after process death because the worker recovers later-stage jobs but not Stage 6 jobs, and its selector only claims `queued` rows. This makes the current review workflow unsuitable for unattended live use until job recovery is unified or repaired.
- Identified an observability gap: the review API converts unhandled exceptions to a generic response but does not log the exception, while access logging is disabled.
- Confirmed that configured media/analysis worker limits are not currently enforced as parallel pools; the worker loop is sequential.
- Confirmed that fresh-install, upgrade, rollback, disaster-recovery, and remote-backup instructions need to be added.
- Confirmed there is no repository CI workflow or enforced coverage threshold.
- Dependency review found no known runtime Python or production npm advisories; the full npm tree has three low-severity development-only findings through `cookie@0.6.0`, already acknowledged in the existing frontend progress log.

## Pending gates

- Inventory the complete repository and untracked file set.
- Inspect the existing diff and decide whether it is a coherent, safe commit.
- Run tests and static checks without touching media or live vault state.
- Confirm generated/build/cache files are appropriately ignored or intentionally versioned.
- Publish the pre-existing implementation only if the evidence supports it.
- Produce the complete architecture review, ranked action register, backup guide, user guide, and README revision.
- Reconcile all documentation claims against code and tests.
- Commit and push documentation separately.

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
- sidecar `rebuild-index` is a reduced recovery aid, not a full manifest/review-state restore.
- `preprocess --backfill` runs every supported job kind, so the live-backfill launcher can execute a queued reviewed copy and publish canonical objects rather than isolating release backfill work;
- the embedded review-UI worker cannot carry the explicit access-time acknowledgement required by this machine's documented NTFS policy, so the advertised UI import path can fail safely but confusingly;
- reviewed-copy completion does not enqueue preprocessing or invalidate/refresh downstream catalog, organization, Stack, and junk generations, so newly imported photos can remain absent or unprepared in the library.
