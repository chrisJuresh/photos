# Frontend implementation progress

Status: Stage 1 complete. Stage 2 is the next authorized implementation stage.

This file is the durable handoff ledger for `docs/FRONTEND_PLAN.md`. Update it at the end of every implementation stage before stopping. Do not mark a stage complete unless its acceptance criteria and verification gates have actually passed.

## Status legend

- `Not started`: no product implementation work has begun.
- `In progress`: work is confined to this stage; later stages must not be started.
- `Blocked`: progress cannot continue safely; record the exact blocker and evidence.
- `Complete`: every acceptance criterion and required verification for the stage passed.

## Planning baseline

- Approved specification: `docs/FRONTEND_SPEC.md`
- Approved implementation plan: `docs/FRONTEND_PLAN.md`
- Permanent repository rules: `AGENTS.md`
- Existing SQLite schema: version 2
- Current implemented schema after Stage 1: version 3; supported version-2 manifests remain readable until explicitly migrated
- Existing frontend: separate read-only FastAPI dashboard with vanilla HTML/CSS/JavaScript
- Existing backend guarantees to preserve: immutable source, content-addressed canonical objects, triple hashing, byte comparison, collision separation, atomic no-overwrite publication, append-only source history, recovery sidecars/exports, and single-writer safety
- Live-vault planning observation: approximately 3.52 GB manifest; import `run_20260720T174333Z_2d2c654345b4` was active with a 1,374,328-file traversal and 146,034 candidate assets. Treat this as historical planning evidence; re-check writer state before any implementation-time maintenance.
- Baseline verification observed during planning: `6 passed`, Ruff clean, with one Starlette TestClient deprecation warning.
- No screenshots were taken or inspected during repository inspection/planning.

## Stage tracker

| # | Stage | Depends on | Effort | Status |
|---:|---|---|---|---|
| 1 | Governance, documentation, migrations, and immutable boundaries | None | Extra High | Complete |
| 2 | Import batch discovery and review manifest | 1 | Extra High | Not started |
| 3 | Reviewed copying, durable telemetry, and import history | 2 | Extra High | Not started |
| 4 | Preprocessing, derivatives, metadata, and feature pipeline | 3; review previews also use 2 | Extra High | Not started |
| 5 | Separate SvelteKit application and API foundation | 1 and 4 | Extra High | Not started |
| 6 | Import progress, review, history, and manifest interface | 2, 3, 4, 5 | Extra High | Not started |
| 7 | Virtualized library, contact sheet, actions, filtering, and inspector | 3, 4, 5 | Extra High | Not started |
| 8 | Calendar, folder, equipment, and private map views | 4 and 7 | Extra High | Not started |
| 9 | Similarity Stacks and best-frame ranking | 4, 5, 7 | Extra High | Not started |
| 10 | Explainable junk filtering, feedback, and bulk reject | 4, 5, 7, 9 | Extra High | Not started |
| 11 | Backfill, compatibility, performance, accessibility, and release verification | 1–10 | Extra High | Not started |

## Current implementation stage

None. Stage 1 is complete, and its dependency-free foundation has passed the required gates. The next authorized product implementation stage is Stage 2 only.

Stage 2's dependency on the Stage 1 migration framework, typed configuration, and safety tests is satisfied. No Stage 2 import tables, discovery behavior, services, jobs, API routes, or UI were started during Stage 1.

## Permanent implementation gates

- Do not modify, move, rename, overwrite, or delete source files or canonical vault objects.
- Keep reject/favourite/rating/exclusion/grouping/feedback actions metadata-only.
- Do not calculate media data in frontend code or HTTP request handlers.
- Serve only ready persisted derivatives; enqueue missing work outside the request.
- Do not take, generate, save, compare, or inspect screenshots.
- Configure browser tests with screenshots, video, and traces disabled.
- Preserve the existing dashboard, CLI commands, tests, recovery behavior, and safety guarantees.
- Do not migrate the live vault while a writer is active.
- Test migrations and backfills against a copied database before the live vault.
- Stop at the current stage's explicit stopping point.

## Required stage completion record

At the end of each stage, append a dated record containing:

1. Stage number and final status.
2. Objective achieved.
3. Files/components changed.
4. Schema/API/CLI/interface contracts added or changed.
5. Acceptance criteria with pass/fail evidence.
6. Exact test, lint, type-check, build, query-plan, and audit commands run.
7. Source and canonical-object immutability evidence.
8. Screenshot prohibition verification, including confirmation that no screenshot/video/trace artifacts were created.
9. Known limitations, deviations, or follow-up decisions.
10. Explicit confirmation that work stopped before the next stage.

Use this template:

```markdown
### YYYY-MM-DD — Stage N: title

- Status: Complete | In progress | Blocked
- Objective result:
- Changed:
- Contracts:
- Acceptance evidence:
- Verification commands/results:
- Immutability audit:
- No-screenshot audit:
- Decisions/limitations:
- Stopping point respected: Yes/No — explanation
- Next authorized stage:
```

## Approved decision log

### D-001 — Top-level inbox batches

- Decision: default to configurable `G:\MediaVaultImports`; each immediate child folder is one recursive batch.
- Reason: creates stable review/history boundaries without turning a rolling folder into an ambiguous endless import.

### D-002 — Separate SvelteKit application

- Decision: Svelte 5 + SvelteKit + TypeScript, statically built and served by a new FastAPI app on port 8766.
- Reason: concise compiled components, maintainable routing/state, static FastAPI hosting, and supported virtualization for the required interaction density.
- Compatibility: preserve current `ui` dashboard on port 8765.

### D-003 — Offline/private map

- Decision: bundled offline world basemap plus persisted clusters; no external tiles.
- Reason: avoids location leakage, network dependencies, and CSP exceptions.

### D-004 — Background materialization

- Decision: arbitrary compound sorts, seeded random views, Stack profiles, and junk profiles are materialized by durable jobs.
- Reason: prevents expensive request-time/frontend calculations while retaining configurable behavior.

### D-005 — Honest junk semantics

- Decision: use `possible obstruction or accidental frame` and `focus deficit` until narrower claims have validated evidence.
- Reason: avoids misleading confidence while preserving the review goal.

### D-006 — Transparent Stack evidence

- Decision: use perceptual/time/equipment evidence and indexed candidate search; defer opaque heavyweight embeddings.
- Reason: improves explainability, scale, maintenance, and offline operation.

### D-007 — Sidecars and random files

- Decision: recognized associated sidecars are verified opaque assets when their media is included; unrelated non-media remains manifested but excluded by default.
- Reason: preserves meaningful edit/provenance files without importing arbitrary junk.

### D-008 — Video scope

- Decision: show video posters and metadata; defer original-video streaming.
- Reason: the approved goal is photo review, and streaming broadens media-serving/performance risk without being necessary.

## Validation commands

Run the commands applicable to the current stage. Do not use screenshot flags or visual snapshot tooling.

```powershell
.\.venv\Scripts\python.exe -m pytest -q
.\.venv\Scripts\python.exe -m ruff check .
```

Once the SvelteKit project exists, add its exact locked commands here for:

- TypeScript/Svelte checking;
- Vitest and Svelte Testing Library;
- production static build;
- DOM-only Playwright with screenshots, videos, and traces disabled; and
- accessibility checks.

## Documentation-only initialization record

### 2026-07-20 — Approved plan persistence

- Status: Complete (planning documents only; no product stage completed)
- Objective result: persisted the approved specification, dependency-ordered plan, progress ledger, and permanent repository rules.
- Changed: `AGENTS.md`, `docs/FRONTEND_SPEC.md`, `docs/FRONTEND_PLAN.md`, `docs/FRONTEND_PROGRESS.md`.
- Contracts: documentation only; no runtime API, schema, CLI, backend, or frontend changes.
- Acceptance evidence: documentation audit confirmed all 11 numbered stages, dependencies, per-stage objective/backend/frontend/acceptance/tests/stopping sections, assumptions, deviations, effort recommendations, and permanent no-screenshot/immutability/preprocessing rules.
- Verification commands/results: PowerShell text audit passed with `CROSS_CHECK_OK stages=11 per_stage_sections=complete`; all four target files exist, are non-empty UTF-8 text, and no runtime file was changed by this documentation-only operation.
- Immutability audit: no source or vault media operations authorized or performed.
- No-screenshot audit: no screenshots taken, generated, saved, compared, or inspected.
- Decisions/limitations: product implementation intentionally not started.
- Stopping point respected: Yes — stop after planning document validation.
- Next authorized stage: Stage 1 only.

### 2026-07-21 — Stage 1: Governance, documentation, migrations, and immutable boundaries

- Status: Complete
- Objective result: Replaced implicit schema rewriting with an ordered, audited, explicit migration framework; added a safe `media-vault migrate --vault ...` command; defined typed review configuration and immutable/regenerable storage boundaries; and proved the framework only against isolated synthetic schema-v2 copies.
- Changed: `media_vault/db.py`, `media_vault/migrations.py`, `media_vault/config.py`, `media_vault/core.py`, `media_vault/cli.py`, `media_vault/vault_ops.py`, `tests/test_migrations.py`, `tests/test_ui.py`, `README.md`, `SCHEMA.md`, and this ledger.
- Contracts: schema version 3 adds only `schema_migrations(version, name, applied_at, tool_version)`; supported v2 manifests remain readable by legacy commands and are never migrated on open; new feature callers can require v3 and receive an explicit migration-required error; migration holds `active-writer.lock`, validates the input, checks free space, creates and validates a unique SQLite backup in `state/backups`, applies ordered migrations transactionally, validates version/foreign keys/integrity, restores the verified backup after a post-commit validation failure, and is a validated no-op when repeated; JSONL exports now record the open database's actual schema version. `ReviewConfig`, `WorkerLimits`, `RequestBudgets`, and `AnalyzerVersions` define the vault, inbox (`G:\MediaVaultImports`), derivative root, ports 8765/8766, localhost binding, worker limits, request budgets, analyzer versions, and source/vault/inbox/derivative/canonical separation rules without adding runtime review features.
- Acceptance evidence: `test_v2_opens_without_implicit_migration_and_review_features_refuse` and `test_representative_legacy_commands_keep_v2_schema` prove v2 compatibility and explicit feature gating; fresh/repeated and v2-copy migration tests prove deterministic v3 initialization, a verified v2 backup, the audit row, and idempotence; live-writer, insufficient-space, backup-failure, transactional failure, `KeyboardInterrupt`, foreign-key failure, post-migration validation/restore, and initializer-rewrite tests pass. The existing dashboard and legacy end-to-end tests remain green. The governance cross-check reports `FRONTEND_DOC_AUDIT_OK stages=11 dependency=none safety=aligned decisions=aligned`.
- Verification commands/results: pre-edit `.\.venv\Scripts\python.exe -m pytest -q` -> `6 passed, 1 warning in 50.32s`; pre-edit `.\.venv\Scripts\python.exe -m ruff check .` -> `All checks passed!`; final `.\.venv\Scripts\python.exe -m pytest -q tests/test_migrations.py` -> `15 passed in 14.81s`; final `.\.venv\Scripts\python.exe -m pytest -q` -> `21 passed, 1 warning in 31.71s`; final `.\.venv\Scripts\python.exe -m ruff check .` -> `All checks passed!`; `.\.venv\Scripts\python.exe -m media_vault migrate --help` -> exit 0 with the required `--vault` option. The documentation/capture/artifact audit command reported `FRONTEND_DOC_AUDIT_OK`, `TEST_CAPTURE_CONFIG_AUDIT_OK`, and `BROWSER_ARTIFACT_AUDIT_OK`. TypeScript, Svelte, Vitest, production-build, Playwright, accessibility, and query-plan checks are not applicable because Stage 1 deliberately adds no frontend project, HTTP API, or new query surface. The one full-suite warning is the approved pre-existing Starlette TestClient deprecation; no dependency churn was introduced. An intermediate focused run exposed Windows' requirement for a writable handle when calling `fsync` and a test-fixture column-count error; both were corrected before the final passing runs.
- Immutability audit: every migration/control test uses a temporary synthetic source and a pre-existing synthetic canonical object, snapshotting relative paths, size, mtime nanoseconds, ctime nanoseconds, mode, and SHA-256 before and after; all snapshots matched. Migration code reads and writes only SQLite state/backup files and the writer lock. No real source, live manifest, or canonical vault object was read, hashed, copied, modified, moved, renamed, overwritten, or deleted, and no live-vault migration was attempted.
- No-screenshot audit: no screenshot, video, browser trace, browser automation, or visual snapshot operation was used. Configuration search found no capture settings, and the repository artifact-name audit found no screenshot/video/trace output (`TEST_CAPTURE_CONFIG_AUDIT_OK`; `BROWSER_ARTIFACT_AUDIT_OK`).
- Decisions/limitations: v3 is intentionally governance-only and contains no import, job, derivative, API, or UI tables. Fresh manifests are created at v3; existing v2 manifests stay v2 until the explicit command succeeds. Backups remain as durable metadata evidence and are not removed automatically. Live-vault rollout remains deferred to Stage 11, so Stage 1 proves migration only on isolated synthetic copies. The Starlette warning remains documented and unchanged. The initial worktree had only `README.md` tracked and the remaining repository files untracked, so Git could not provide a conventional complete diff; final review used the known pre-edit inspection, edited-file review, `git diff --check` for the tracked change, Ruff/tests, and an explicit Stage 2+ implementation search.
- Stopping point respected: Yes — stopped after a schema-v2 copy migrated safely and all governance gates passed; no import tables, worker behavior, API routes, or UI components were added.
- Next authorized stage: Stage 2 only — Import batch discovery and review manifest.
