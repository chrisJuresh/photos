# photos

A local-first photo and video vault, being rebuilt feature by feature.

- `v1/` is the previous implementation, kept as **read-only reference**. Read it freely; do
  not edit it, refactor it, or fix its bugs.
- The repository root is where the new version gets built.
- `docs/` describes what `v1/` already contains, one file per feature. Read only the file for
  the feature at hand.

## Hard rules

1. **Never run `v1/` code against `G:\photos`, `G:\MediaVault`, or `G:\MediaVaultImports`.**
   `v1/` is under a safety hold with 19 release-critical findings. Use synthetic temporary
   corpora. `v1/Resume Live Vault Backfill.cmd` is quarantined — never invoke it.
2. **Source media and published canonical objects are permanently immutable.** Nothing
   deletes, moves, renames, or overwrites them.
3. **Reject, favourite, rate, exclude, stack, and junk are metadata only.** They never become
   destructive file operations.
4. **No media work inside an HTTP request.** Handlers may query persisted state, serve
   existing derivatives, update metadata, or enqueue a job. Decoding, hashing, copying,
   ranking, and grouping belong in background processes.
5. **No media, database, or vault state in git.** Never commit photos, videos, `*.sqlite3`,
   derivatives, or run logs. Never take or commit screenshots of real photos.
6. **Schema migration and other exclusive maintenance must refuse to run while any writer is
   active.** Test migrations on a copied database first.

`docs/invariants.md` explains why each of these exists and what broke in `v1/` when it was
only a convention rather than an enforced boundary.

## Scope discipline

This project failed once by building everything at once. Keep changes small enough to review.

- Build only what the current request asks for. Do not add features, refactor surrounding
  code, or introduce abstractions the task does not need.
- Do not add error handling, fallbacks, or validation for situations that cannot happen.
  Validate at system boundaries: user input, filesystem, subprocess, HTTP.
- Do not design for hypothetical future requirements. Prefer the simplest thing that works.
- Do not lift a `v1/` module wholesale because it exists. Check `docs/known-defects.md` for
  that feature first — several `v1/` modules are correct in shape and unsafe in detail.
- One safety invariant per commit where possible.

Match written deliverables to the task. A bug fix does not need a summary document.

## Verifying work

The root build is a plain Python package, no venv and no dependencies beyond `pytest`. From
the repository root:

```bash
python -m pytest tests -q
```

Tests run against temporary databases only; none of them opens a path from `config.toml`.
To apply pending migrations to the configured databases:

```bash
python -m photolib.migrate
```

To import MediaVault's path history and extended metadata into the catalog. Re-running is
safe: it inserts nothing twice, but it does re-read the 146,034 sidecars, so allow ~40 min.
`--meta` additionally lays the exiftool readings out under `meta_root`, which is hours of
USB-HDD head time and is off by default.

```bash
python -m photolib.adopt_mediavault
```

To run the archived test suite as a reference oracle:

```bash
cd v1 && ./.venv/Scripts/python.exe -m pytest -q
```

`v1/.venv` is a Python 3.14 environment and still works after the move. Frontend checks are
`npm test`, `npm run check`, `npm run build` inside `v1/review_ui`. Playwright screenshot,
video, and trace capture must stay disabled.

## Feature documentation

Read the one file that matches the work. Do not read them all.

| Feature | Doc |
|---|---|
| Inventory, dependency graph, status | `docs/INDEX.md` |
| Safety contract and why it exists | `docs/invariants.md` |
| Vault layout, content addressing, hashing, exact identity | `docs/storage-and-identity.md` |
| SQLite schema, 68 tables, migration contract | `docs/database-schema.md` |
| The 16 CLI commands and what each one touches | `docs/cli.md` |
| Inbox discovery, manifest, approval, verified copy | `docs/import-pipeline.md` |
| Job ledger, leases, claim tokens, worker runtime | `docs/jobs-and-workers.md` |
| Derivatives, extended metadata, quality features | `docs/preprocessing.md` |
| Visual similarity, RAW+JPEG grouping, exact groups | `docs/relationships.md` |
| Review HTTP API, security posture, envelopes | `docs/review-api.md` |
| SvelteKit app shell, routing, theming, build | `docs/review-ui.md` |
| Logical photo library, facets, filters, inspector | `docs/library.md` |
| Calendar, folder, equipment, map views | `docs/organize-views.md` |
| Similarity stacks and cover ranking | `docs/stacks.md` |
| Junk review, bulk reject, undo | `docs/junk-and-bulk-reject.md` |
| Read-only legacy dashboard on port 8765 | `docs/legacy-dashboard.md` |
| Test suites and synthetic corpus rules | `docs/testing.md` |
| All 83 findings, grouped by feature | `docs/known-defects.md` |

The full `v1/` audit is in `v1/docs/` — `ARCHITECTURE_REVIEW.md`, `FINDINGS_REGISTER.md`,
and `ACTION_PRIORITY_MATRIX.md` are the authoritative long-form versions. `docs/` summarises
them per feature. Prefer `docs/`; open `v1/docs/` when you need the detail behind a finding.

## Repository etiquette

- Default branch is `main`. Branch before committing.
- Reference `v1/` findings by their stable IDs (`F31`, `W05`) when they motivate a decision.
- `v1/` files are reference material: cite them as `v1/media_vault/db.py:506`.
