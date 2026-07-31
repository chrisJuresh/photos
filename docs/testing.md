# Tests

**State in v1:** 84 Python tests and 39 frontend tests, all passing. No CI, no coverage gate, no
fault-injection suite, no restore drill.

## The rules that make these tests safe

Non-negotiable, and they held in `v1` (`P09`, `P10`):

- Test corpora are isolated synthetic temporary trees, never the real source or vault.
- Tests assert on source and canonical-object hashes and on filesystem metadata around any
  operation that could affect them.
- Playwright screenshot, video, and trace capture are **off**. `playwright.config.ts` sets all
  three to `'off'` explicitly.
- Never take, save, compare, or inspect a screenshot of real photos.

The screenshot rule is not paranoia about disk space. A screenshot of a personal photo library
is the same sensitive data as the library, in a place nobody thinks to protect.

## Python suite

15 files, 6,431 lines, 84 tests. Run from `v1/`:

```bash
cd v1 && ./.venv/Scripts/python.exe -m pytest -q
```

Verified passing after the archive move: 84 passed in 106 s.

| File | Lines | Covers |
|---|---|---|
| `test_migrations.py` | 856 | Schema migration steps, backup, validation, copied-database path |
| `test_preprocess.py` | 724 | Derivatives, metadata, features, job claim and lease |
| `test_review_stacks_api.py` | 635 | Stack profiles, materialization, cover ranking, endpoints |
| `test_review_copy.py` | 559 | Verified copy, publication, no-overwrite, copy attempts |
| `test_review_library_api.py` | 534 | Catalog, facets, filters, user state, endpoints |
| `test_review_organization_api.py` | 504 | Calendar, folder, equipment, map projections |
| `test_review_junk_api.py` | 479 | Signals, profiles, effective results, feedback |
| `test_review_import_api.py` | 452 | Import endpoints, decisions, approval, execute |
| `test_review_imports.py` | 429 | Inbox discovery, batch and item identity, observations |
| `test_review_backfill.py` | 387 | Backfill inventory, attempts, audit |
| `test_review_api.py` | 379 | Envelopes, security posture, budgets, idempotency |
| `test_review_runtime.py` | 168 | Dispatcher, job-kind routing, recovery |
| `test_end_to_end.py` | 157 | A full synthetic pass through the pipeline |
| `test_ui.py` | 130 | Legacy dashboard read-only behaviour |
| `support_review_server.py` | 38 | Test server used by Playwright, not a test itself |

Lint: `./.venv/Scripts/python.exe -m ruff check .`

## Frontend suite

20 test files, 39 tests. Colocated `.test.ts` next to each component and route.

```bash
cd v1/review_ui
npm test           # vitest, 39 tests
npm run check      # svelte-check, 0 errors 0 warnings at the reviewed state
npm run build      # vite build
npm run test:e2e   # playwright smoke, capture off
npm run test:a11y  # playwright + axe, capture off
```

Playwright runs against a temporary synthetic empty vault via `tests/support_review_server.py`
on `127.0.0.1:4173`, single worker, no parallelism.

## What the reviewed baseline actually proved

From 2026-07-22 (`P11`):

- 84 Python tests passed
- Ruff passed
- 20 frontend test files / 39 tests passed
- Svelte and TypeScript check: 0 errors, 0 warnings
- One capture-disabled Playwright smoke test passed
- One capture-disabled automated accessibility test passed
- Runtime Python and production npm advisory checks clean
- Full npm tree had three low-severity development-only findings via `cookie@0.6.0` (`F79`)

## What it did not prove

This is the important half. The tests pass and the system is still held, which tells you what
the suite does not cover.

Missing entirely:

- **CI and coverage gates.** Nothing runs on push (`F75`).
- **Writer contention.** No test starts two processes and checks that only one writes. Given
  `F01`, `F02`, and `F03`, this is the gap that matters most.
- **Crash boundaries.** No kill-at-each-step test around publication or job claim, which is
  exactly where `F06` and `F23` live.
- **Disk-full and power-loss behaviour** (`F17`).
- **Full restore drill.** No test restores a backup to an isolated path and audits it (`F39`).
- **Clean wheel and sdist install** with the bundled UI (`F76`).
- **Production-scale projections.** Everything is tested small, and several paths use `fetchall`
  or full sorting (`F73`).
- **Populated end-to-end flows.** The Playwright runs use an *empty* vault (`F67`), so no UI
  test exercises a screen with photos in it.
- **Representative stack and junk calibration.** No labelled corpus, so no false-positive or
  false-negative rate is known (`F57`).
- **Variable-height and mobile virtualization.** Those tests are disabled or too shallow
  (`F68`).
- **Manual keyboard, screen-reader, and responsive review.** No repeatable record exists
  (`F67`).

## Known defects

| ID | Sev | Summary |
|---|---|---|
| `F75` | High | No CI, coverage threshold, lock/crash/disk-full/property suite, restore drill, or populated capture-disabled E2E |
| `F76` | High | Wheel and sdist with bundled UI are not installed and tested from a clean environment |
| `F67` | High | Automated E2E exercises only an empty vault; no manual accessibility review record |
| `F68` | High | Variable-height and mobile virtualization tests disabled or too shallow |
| `F57` | High | No labelled-corpus calibration for stack and junk thresholds |
| `F78` | High | Dependency and security checking is manual; no hash policy, SBOM, license rules, or update process |
| `F80` | Medium | Formatting, type-checking, and pre-commit policy incomplete; generated-asset review implicit; a Starlette `TestClient` deprecation warning remains |
| `F79` | Low | Three low-severity development-only npm findings via `cookie@0.6.0` |

## Reuse notes

Worth lifting:

- Synthetic temporary corpora with hash and filesystem-metadata assertions around every
  operation that touches media. This is why `v1` has no known data-loss bug despite 19 critical
  findings — the tests were pointed at the right invariant.
- Capture permanently off in the Playwright config, not per-test.
- Colocated frontend tests.
- The proportion: `test_migrations.py` is the largest test file in the project, which is the
  correct instinct for the one operation that can destroy the catalog.

The lesson worth carrying forward is narrower than "write more tests". `v1` has a
well-constructed suite that passes and a system that cannot ship, because the suite tests
*correct behaviour on the happy path* and every critical finding is about *concurrency, crash,
or hostile input*. A single test that starts two writers, and a single test that kills the
process between publication steps, would have caught more critical findings than the other 84
combined.

The other lesson: `v1/docs/TEST_STRATEGY.md` (14 KB) is a detailed plan for exactly those
missing tests, written after the review. It was never executed. A plan for tests is not tests.
