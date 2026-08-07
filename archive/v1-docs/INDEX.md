# What v1 already contains

An inventory of the previous implementation, one entry per feature. This is a description of
existing code, not a plan. Nothing here proposes an order of work or a new feature.

Every path is relative to the repository root, so `v1/media_vault/db.py` is the archived
module and `v1/docs/` is the archived long-form audit.

## How to use these docs

Pick the feature you are working on, read that one file, and check its **Known defects**
section before reusing any `v1/` code. Each feature doc has the same shape:

- **What it does** — the behaviour as built
- **Where the code is** — the `v1/` files that implement it
- **Data it owns** — the SQLite tables
- **HTTP surface** — endpoints, where applicable
- **Known defects** — the findings from the 2026-07-22 review that apply to this feature
- **Reuse notes** — what the review concluded is sound versus unsafe

## Feature inventory

| Feature | Doc | State in v1 | Primary v1 code |
|---|---|---|---|
| Safety contract | [invariants.md](invariants.md) | Stated and partly enforced | `AGENTS.md`, `core.py`, `config.py` |
| Storage and identity | [storage-and-identity.md](storage-and-identity.md) | Built, live use held | `core.py`, `config.py`, `vault_ops.py`, `scanner.py` |
| Database and migrations | [database-schema.md](database-schema.md) | Built, schema v12, 65 tables | `db.py`, `migrations.py` |
| CLI | [cli.md](cli.md) | 16 commands built | `cli.py`, `__main__.py`, `run.ps1` |
| Import pipeline | [import-pipeline.md](import-pipeline.md) | Built, incomplete handoff to preprocessing | `review_imports.py`, `review_copy.py`, `review_stage6.py` |
| Jobs and workers | [jobs-and-workers.md](jobs-and-workers.md) | Built, recovery incomplete | `review_runtime.py`, `preprocess.py`, `review_backfill.py` |
| Preprocessing | [preprocessing.md](preprocessing.md) | Built and tested synthetically | `preprocess.py`, `metadata.py`, `_decode_worker.py` |
| Relationships and grouping | [relationships.md](relationships.md) | Built, live use held | `relations.py` |
| Review API | [review-api.md](review-api.md) | ~55 endpoints built | `review_api.py` (215 KB, one module) |
| Review UI | [review-ui.md](review-ui.md) | 7 routes built | `review_ui/`, `media_vault/review_ui_dist/` |
| Library | [library.md](library.md) | Built, reject safeguards incomplete | `review_library.py`, `routes/library/` |
| Organize views | [organize-views.md](organize-views.md) | Built, paging incomplete | `review_organization.py`, `OrganizationViews.svelte` |
| Similarity stacks | [stacks.md](stacks.md) | Built, uncalibrated | `review_stacks.py`, `StackProfileControls.svelte` |
| Junk and bulk reject | [junk-and-bulk-reject.md](junk-and-bulk-reject.md) | Built, undo not durable | `review_junk.py`, `junk/`, `bulk-reject/` |
| Legacy dashboard | [legacy-dashboard.md](legacy-dashboard.md) | Built, read-only, held | `ui_server.py`, `media_vault/ui/` |
| Tests | [testing.md](testing.md) | 84 Python, 39 frontend, all passing | `tests/`, `review_ui/src/**/*.test.ts` |
| Known defects | [known-defects.md](known-defects.md) | 83 findings recorded | `v1/docs/FINDINGS_REGISTER.md` |

## How the features depend on each other

This is the dependency graph `v1` was built against, recorded in
`v1/docs/FRONTEND_PLAN.md`. It describes what needs what, not what to build first.

```text
storage-and-identity
└─ database-schema
   └─ import-pipeline ── jobs-and-workers
      └─ preprocessing ── relationships
         └─ review-api
            ├─ review-ui
            │  ├─ library
            │  │  ├─ organize-views
            │  │  └─ stacks
            │  │     └─ junk-and-bulk-reject
            │  └─ legacy-dashboard  (independent: reads only)
            └─ (all UI features read through the API)
```

Notes the plan called out explicitly:

- The review API depends on the storage and schema contracts directly, not only through the
  import pipeline.
- Stacks depend on the quality and metadata outputs of preprocessing.
- Junk depends on preprocessing, library, and stacks.
- The legacy dashboard shares the database and derivatives but nothing else; it is a separate
  application on a separate port.

## Size of the thing being replaced

Rough measure of how much code each area represents, to calibrate what "rip this part out"
actually means.

| Area | Lines / size |
|---|---|
| `review_api.py` | 215 KB, one module, ~55 routes |
| `review_copy.py` | 86 KB |
| `db.py` | 78 KB, 65 tables |
| `preprocess.py` | 64 KB |
| `review_imports.py` | 62 KB |
| `review_stacks.py` | 50 KB |
| `review_library.py` | 41 KB |
| `review_junk.py` | 35 KB |
| `ui_server.py` | 30 KB |
| `relations.py`, `vault_ops.py`, `cli.py` | 27–28 KB each |
| `review_organization.py`, `review_backfill.py` | 26 KB each |
| Everything else in `media_vault/` | under 16 KB each |
| `review_ui/src/` | 3,642 lines across 7 routes and 14 components |
| `tests/` | 15 files, 84 tests |

## Ports, paths, and versions as configured

| Thing | Value | Source |
|---|---|---|
| Source media | `G:\photos` | per-command argument |
| Review inbox | `G:\MediaVaultImports` | `config.py:9` |
| Canonical vault | `G:\MediaVault` | per-command argument |
| Canonical objects | `<vault>\objects` | `config.py:110` |
| Derivatives | `<vault>\derivatives` | `config.py:85` |
| SQLite catalog | `<vault>\state\manifest.sqlite3` | `db.py` |
| Legacy dashboard | `127.0.0.1:8765` | `config.py:11` |
| Review API and UI | `127.0.0.1:8766` | `config.py:12` |
| Schema version | 12 (base 2, all steps 3–12 required) | `db.py:13` |
| Python | 3.11+ declared, 3.14 used | `pyproject.toml` |
| Runtime deps | blake3, fastapi, Pillow, ImageHash, numpy, uvicorn | `pyproject.toml` |
| External tools | ExifTool 13.59, FFmpeg/ffprobe 8.1.1 | `v1/README.md` |
| Frontend | Svelte 5, SvelteKit 2, Vite 8, TypeScript 6 | `review_ui/package.json` |

The host must be a localhost address and the two ports must differ; `config.py:90` and
`config.py:95` reject anything else. The inbox, derivative root, and canonical objects are
required to be mutually disjoint paths (`config.py:99`).

## Long-form audit, if you need the detail

`docs/` here is a per-feature summary. The originals are longer and stay in `v1/docs/`:

| File | Contents |
|---|---|
| `v1/docs/ARCHITECTURE_REVIEW.md` | 41 KB full system assessment |
| `v1/docs/FINDINGS_REGISTER.md` | F01–F83 with severity, evidence line, and action ID |
| `v1/docs/ACTION_PRIORITY_MATRIX.md` | 58 actions ranked six ways |
| `v1/docs/SAFETY_HOLD.md` | Stop conditions and unblock requirements |
| `v1/docs/FRONTEND_SPEC.md` | The original product and interaction contract |
| `v1/docs/FRONTEND_PROGRESS.md` | 113 KB implementation ledger |
| `v1/SCHEMA.md` | 33 KB table-by-table data contract |
| `v1/docs/GLOSSARY.md` | Shared vocabulary |
