# Contributing

This repository handles irreplaceable media and private metadata. Contributions are welcome only when they preserve the safety rules and can be proven on isolated synthetic data.

## Before starting

1. Read [AGENTS.md](AGENTS.md), [docs/SAFETY_HOLD.md](docs/SAFETY_HOLD.md), [docs/ARCHITECTURE_REVIEW.md](docs/ARCHITECTURE_REVIEW.md), [docs/FINDINGS_REGISTER.md](docs/FINDINGS_REGISTER.md), and [docs/ACTION_PRIORITY_MATRIX.md](docs/ACTION_PRIORITY_MATRIX.md).
2. Choose stable W/F IDs and write acceptance evidence before implementation.
3. Record any cross-cutting decision in [docs/ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md).
4. Work from a clean branch and preserve unrelated/user changes.

## Non-negotiable rules

- Never modify, move, rename, overwrite, delete, or normalize source/canonical media.
- Never turn reject/favourite/rate/exclude/group/junk into a filesystem operation.
- Never use real media or live source/vault paths in tests, benchmarks, fixtures, demos, or bug reproductions.
- Never take or inspect screenshots, browser video, or screenshot-bearing traces. Keep Playwright capture off.
- Never decode/hash/copy/analyze/rank/group/generate media in frontend code or an HTTP request.
- Never mix review UI code/routes/static assets with the legacy read-only dashboard.
- Never place derivatives, temp files, databases, logs, or sidecars below source/canonical objects.
- Never run schema migration/exclusive maintenance while any live writer exists; rehearse on a copied database first.
- Never weaken a guard, delete a lock/job/partial/conflict, or edit SQLite to make a test pass.

## Change design

For safety-relevant changes, define:

- invariant and exact failure being prevented;
- authority boundary and callers that must not bypass it;
- transaction/crash/interruption behaviour at every state transition;
- idempotency/retry/recovery and finite terminal states;
- supported OS/filesystem/topology;
- backup/migration/rollback/privacy implications;
- deterministic synthetic fault/property/concurrency evidence;
- documentation/release-gate updates.

Prefer small vertical seams that establish an enforceable boundary over a broad mechanical module move. Do not optimize media concurrency on the shared HDD without measurement and an explicit resource/safety model.

## Test data

- Generate clearly synthetic tiny byte sequences/metadata under the test framework's temporary directory.
- Resolve all test roots and assert they are outside known live source/vault/inbox paths.
- Verify source and canonical hashes plus filesystem metadata before/after any operation that could reach them.
- Include corrupted paths, Unicode, reparse/symlink, interruption, disk-full, contention, and stale-revision cases appropriate to the change.
- Do not commit generated derivatives/media/database artifacts.

## Required checks

```powershell
Set-Location 'C:\Users\Chris\Documents\photos'
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m ruff check .

Set-Location .\review_ui
npm ci
npm run check
npm test
npm run build
npm run test:e2e
npm run test:a11y
```

E2E and accessibility runs must retain `screenshot: off`, `video: off`, and `trace: off`. Add focused checks for the changed layer; the existing suite is a minimum, not sufficient evidence for new safety claims.

## Pull requests and commits

- Use a focused branch and intentional commits; separate mechanical moves from behaviour where practical.
- Include W/F IDs in the title/body and explain definitions of done.
- State exact tests, fault injection, copied-database rehearsal, and restore evidence.
- Identify generated files explicitly and prove how they were reproduced.
- State all limitations/unsupported environments; do not call a WIP production-ready.
- Confirm no media, database, logs, screenshots, videos, traces, secrets, or private metadata entered the diff/history.
- Keep the PR draft until the evidence is complete.

Do not merge a safety-relevant change solely because ordinary tests pass. Live authorization requires [docs/RELEASE_GATES.md](docs/RELEASE_GATES.md) and independent sign-off.

## Documentation changes

Update the README, user/operations/troubleshooting guidance, schema caveats, action/finding status, ADRs, changelog, and release gates whenever behaviour changes. Distinguish:

- verified current behaviour;
- intended target behaviour;
- historical implementation evidence;
- operator authorization.

Never let a progress log or example command become accidental live authorization.
