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

To resolve capture time for every adopted file and rebuild the `photo` rows. Seconds, pure
DB plus one read-only manifest scan. Re-running is safe and lands on the same answer.
`--validate` additionally prints the masked-shape enumeration and the per-rule EXIF
agreement that decided which filename patterns are adopted.

```bash
python -m photolib.capture_time
```

To copy MediaVault's existing 384px WebP derivatives onto the NVMe as grid thumbnails,
checksum-verified. ~17 min at 32 reader threads. It generates nothing: assets whose
derivative errored in v1 stay without one. Re-running copies only what is absent, so an
interrupted pass resumes. `--limit N` stops after N for a throughput measurement.

```bash
python -m photolib.thumbnails
```

To snapshot `state.sqlite3` — the triage rules and overrides, the one thing here that cannot be
regenerated — onto `C:`, a different physical disk from `E:`. Instant, ~20 KB before triage. Uses
`VACUUM INTO`, so it is safe against a live WAL, and it refuses to write onto the source's own
volume. Run it after every triage session.

```bash
python -m photolib.backup_state
```

The Phase 0 inventory: five phases as separate subcommands, all resumable, sharing a work
database at `E:\photolib\phase0.sqlite3` that is regenerable and never committed. **It ran to
completion on 2026-08-02 and does not need re-running** — `origin` holds all 1,374,328 rows and
the deletion gate's evidence is recorded in `PLAN.md` "Phase 0". `a` walks and reconciles against
restic, `b` is the fail-fast sample, `c` hashes everything and writes `origin`, `d` verifies every
file against the repo, `e` is the top-up backup and the **only** write to `G:\ResticPhotos`.

```bash
python -m photolib.inventory a
```

Every restic read command in `photolib/restic_repo.py` carries `--no-lock`, because the default
writes a lock file into the repository being verified. The password is never handled here: it is
a DPAPI blob reached by passing `config.toml`'s `restic_password_command` to restic's
`--password-command`. Never echo it, never write it to a file, never put it on a command line.

**`restic backup --force` is a scrub, not a routine cost. Adding new files never needs it.**
`--force` defeats change detection, which only applies to files already in a parent snapshot; a
new file has nothing to be skipped against and is always read. It is needed only for a file
edited in place at *identical size and mtime* — impossible for source media under hard rule 2,
and impossible for a vault object, whose filename is its own SHA-256. A `--force` pass over
`G:\photos` is **8h46m**; a whole-tree incremental is ~30–40 min (the 1.38M-entry metadata walk,
unrelated to `--force`); a backup scoped to one new directory is seconds. If you find yourself
about to reach for `--force`, check which of those three you actually need.

There is **no procedure yet for adding photos after the build**, and **no backup of `G:\vault`
at all** — `PLAN.md` "Open decisions" 5. Both are deferred on purpose: the architecture was
audited against future import on 2026-08-02 and needs no change, chiefly because import requires
**no schema migration** and the walk/hash helpers are already root-parameterised. Do not invent a
procedure in passing, and do not treat the gap as a reason to redesign anything.

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
