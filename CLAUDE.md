# photos

A local-first photo and video vault. **The rebuild is complete.** What is left at the
repository root is the thing that runs: the grid and triage website, and the schema it reads.

- `photolib/` is the website — `grid`, `browse`, `triage_api`, `triage_screens`, `triage`,
  `probe`, and the `config`/`db`/`migrate` infrastructure under them. `ui/` is its Svelte source.
- `archive/pipeline/` is the one-shot build pipeline that produced the vault: 16 modules that
  ran to completion between 2026-08-01 and 2026-08-07. It is still importable and still
  tested, but nothing it holds is needed to serve the website. It imports `config`, `db`,
  `migrate`, `triage` and `reveal` from `photolib`; the arrow never points the other way.
- `archive/v1/` is the previous implementation, kept as **read-only reference**. Read it
  freely; do not edit it, refactor it, or fix its bugs.
- **`Open Photo Vault.cmd`** at the root is the double-click launcher for the website.

## Hard rules

1. **Never run `archive/v1/` code against `G:\photos`, `G:\MediaVault`, or
   `G:\MediaVaultImports`.** It is under a safety hold with 19 release-critical findings. Use
   synthetic temporary corpora. `archive/v1/Resume Live Vault Backfill.cmd` is quarantined —
   never invoke it.
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

`archive/v1-docs/invariants.md` explains why each of these exists and what broke in `archive/v1/`
when it was only a convention rather than an enforced boundary.

**Nothing else may touch `G:` while a pipeline step runs**, Explorer windows included. `F:` is
the same physical disk — both are partitions of the WD Elements USB HDD.

## Scope discipline

This project failed once by building everything at once. Keep changes small enough to review.

- Build only what the current request asks for. Do not add features, refactor surrounding
  code, or introduce abstractions the task does not need.
- Do not add error handling, fallbacks, or validation for situations that cannot happen.
  Validate at system boundaries: user input, filesystem, subprocess, HTTP.
- Do not design for hypothetical future requirements. Prefer the simplest thing that works.
- Do not lift an `archive/v1/` module wholesale because it exists. Check
  `archive/v1-docs/known-defects.md` for that feature first — several `archive/v1/` modules are
  correct in shape and unsafe in detail.
- One safety invariant per commit where possible.

Match written deliverables to the task. A bug fix does not need a summary document.

There is **no procedure yet for adding photos after the build**, and **no backup of `G:\vault`
at all** — `archive/PLAN.md` "Open decisions" 5. Both are deferred on purpose. Do not invent a
procedure in passing, and do not treat the gap as a reason to redesign anything.

## Running and verifying

The root build is a plain Python package with no venv. Its dependencies are `pytest`, `pillow`
and `numpy`, plus `rawpy` for Phase 2b's DNG path; `ffmpeg` and `exiftool` are external
binaries reached through PATH, and only Phase 2b needs them. Tests that need a binary skip when
it is absent rather than failing. Tests run against temporary databases only; none of them
opens a path from `config.toml`.

```bash
python -m pytest tests -q
```

The grid and the nine triage screens are one client, two modes, served by one process on
`127.0.0.1:8770`. Read-only except `/api/triage/*`, whose write handlers hold a connection to
`state.sqlite3` with no `ATTACH` of the catalog.

```bash
python -m photolib.grid --open
```

The client's source is `ui/` — Svelte 5, no Kit. `npm run build` emits
`photolib/static/bundle.js` and `bundle.css` under fixed unhashed names, and **those two files
are committed**: they are the only generated code in this repository, and they are here so the
server runs from a clean checkout without a node toolchain. Edit `ui/src`, never the bundle, and
rebuild before committing. **No literal `style="…"` in a `.svelte` file** — the CSP carries no
`unsafe-inline`, and Svelte compiles a static style attribute to `setAttribute`, which is
blocked; `style:` directives and classes are not.

```bash
cd ui && npm run check && npm run build
```

To apply pending migrations to the configured databases:

```bash
python -m photolib.migrate
```

To run the archived v1 suite as a reference oracle. `archive/v1/.venv` is a Python 3.14
environment and still works after the move. Frontend checks are `npm test`, `npm run check`,
`npm run build` inside `archive/v1/review_ui`. Playwright screenshot, video, and trace capture
must stay disabled.

```bash
cd archive/v1 && ./.venv/Scripts/python.exe -m pytest -q
```

## Where things are written down

Read the one that matches the work. Do not read them all.

| Topic | Doc |
|---|---|
| Domain vocabulary — tile, stack, cover, near-duplicate | `CONTEXT.md` |
| Decisions and why they went the way they did | `docs/adr/` |
| Specs for work not yet built | `docs/specs/` |
| The header's glass material, `/tune`, `/glass`, theme | `docs/glass-material.md` |
| Grid filters, sorts, facets, and what each query costs | `docs/grid-queries.md` |
| The 16 one-shot build steps, restic, the off-site copy | `archive/pipeline/README.md` |
| The long-form build plan and the deletion gate's evidence | `archive/PLAN.md` |

## `archive/v1/` feature documentation

`archive/v1-docs/` describes what `archive/v1/` contains, one file per feature.

| Feature | Doc |
|---|---|
| Inventory, dependency graph, status | `archive/v1-docs/INDEX.md` |
| Safety contract and why it exists | `archive/v1-docs/invariants.md` |
| Vault layout, content addressing, hashing, exact identity | `archive/v1-docs/storage-and-identity.md` |
| SQLite schema, 68 tables, migration contract | `archive/v1-docs/database-schema.md` |
| The 16 CLI commands and what each one touches | `archive/v1-docs/cli.md` |
| Inbox discovery, manifest, approval, verified copy | `archive/v1-docs/import-pipeline.md` |
| Job ledger, leases, claim tokens, worker runtime | `archive/v1-docs/jobs-and-workers.md` |
| Derivatives, extended metadata, quality features | `archive/v1-docs/preprocessing.md` |
| Visual similarity, RAW+JPEG grouping, exact groups | `archive/v1-docs/relationships.md` |
| Review HTTP API, security posture, envelopes | `archive/v1-docs/review-api.md` |
| SvelteKit app shell, routing, theming, build | `archive/v1-docs/review-ui.md` |
| Logical photo library, facets, filters, inspector | `archive/v1-docs/library.md` |
| Calendar, folder, equipment, map views | `archive/v1-docs/organize-views.md` |
| Similarity stacks and cover ranking | `archive/v1-docs/stacks.md` |
| Junk review, bulk reject, undo | `archive/v1-docs/junk-and-bulk-reject.md` |
| Read-only legacy dashboard on port 8765 | `archive/v1-docs/legacy-dashboard.md` |
| Test suites and synthetic corpus rules | `archive/v1-docs/testing.md` |
| All 83 findings, grouped by feature | `archive/v1-docs/known-defects.md` |

The full audit is in `archive/v1/docs/` — `ARCHITECTURE_REVIEW.md`, `FINDINGS_REGISTER.md` and
`ACTION_PRIORITY_MATRIX.md` are the authoritative long-form versions. Prefer `archive/v1-docs/`;
open `archive/v1/docs/` when you need the detail behind a finding.

## Repository etiquette

- Default branch is `main`. Branch before committing.
- **Commit and push at the end of every request, without being asked.** Once the work is
  finished and verified, stage it, commit it with a message describing what changed, and push
  the working branch. Do not wait for permission; do not leave a finished change uncommitted.
  Never commit media, database, or vault state — rule 5 above still applies, so check
  `git status` before staging rather than reaching for `git add -A`. If nothing changed, say so
  and skip the commit.
- **One writer, one branch, one working tree.** Two writers in this tree share an index and a
  `HEAD`, so one's commit sweeps up the other's half-finished work and neither `git status`
  means anything. **Check before you build, every time** — `list_sessions` for another running
  session whose `cwd` is this checkout, `git status --porcelain` for work you did not make.
  Neither: work in place, which is the common case and keeps the diff where the operator is
  already looking. Either: take a worktree, added with `git worktree add` and then **entered
  with `EnterWorktree`** so reaching back into this tree is refused rather than merely
  discouraged. "Pick your tree" in `docs/agents/issue-tracker.md` is the check, and a committed
  `PreToolUse` hook enforces it — a write to this checkout is denied once another session holds
  it. Leave the worktree standing until its branch merges, **never stash while another session
  is live** (`refs/stash` is one stack for the whole repository, worktrees included), and
  **never restore a `HEAD` you moved by accident** — say what you ran and stop.
- Reference `archive/v1/` findings by their stable IDs (`F31`, `W05`) when they motivate a decision.
- `archive/v1/` files are reference material: cite them as `archive/v1/media_vault/db.py:506`.

## Agent skills

### Issue tracker

Issues live as GitHub issues on `chrisJuresh/photos`, driven through the `gh` CLI.
See `docs/agents/issue-tracker.md`.

**When a request names a ticket, run its whole lifecycle without being asked** — claim it,
pick a tree, branch, build it, commit and push, then close it with a comment saying what
landed. The reader should not have to type a `gh` command. "Working a ticket" in that file is
the sequence; it is an extension of the commit-and-push etiquette above, not an exception to it.

### Triage labels

The five canonical roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
