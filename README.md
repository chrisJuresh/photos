# photos

A local-first photo and video vault. The whole previous implementation now lives in
[`v1/`](v1/) as a read-only reference. The repository root is empty so the next version can
be built one feature at a time.

## What happened

`v1/` is a working but unreleased implementation: a Python CLI, a background worker, a
FastAPI review API, a SvelteKit review UI, and a schema-12 SQLite catalog. It passes its own
test suite (84 Python tests, 39 frontend tests) but a full review on 2026-07-22 recorded 83
findings, 19 of them release-critical, and put the whole thing under a safety hold against
real data. See [`v1/docs/SAFETY_HOLD.md`](v1/docs/SAFETY_HOLD.md).

Rather than fix 83 findings in place, the plan is to rebuild feature by feature and lift the
parts of `v1/` that are already correct.

## The docs in this folder

[`docs/`](docs/) describes **what `v1/` already contains** — not what to build next. One file
per feature, so that when you pick up a feature you can read only that file, see which `v1/`
files implement it, which tables and endpoints it owns, and which findings apply to it.

Start at [`docs/INDEX.md`](docs/INDEX.md).

| Read this | When |
|---|---|
| [`docs/INDEX.md`](docs/INDEX.md) | Choosing what to work on; seeing how features depend on each other |
| [`docs/invariants.md`](docs/invariants.md) | Before writing any code that touches media, paths, or the database |
| [`docs/known-defects.md`](docs/known-defects.md) | Deciding whether to lift `v1/` code or rewrite it |
| Any other `docs/*.md` | Rebuilding that one feature |

[`CLAUDE.md`](CLAUDE.md) holds the working rules for Claude Code sessions in this repository.

## Rules that carry over

Three rules are non-negotiable regardless of how the rebuild is designed. They are the reason
the vault is worth having.

1. **Source media and published canonical objects are permanently immutable.** No operation
   deletes, moves, renames, or overwrites them.
2. **Reject, favourite, rate, exclude, stack, and junk are metadata.** They never become
   destructive file operations.
3. **No media work inside an HTTP request.** Handlers query persisted state, serve existing
   derivatives, update metadata, or enqueue a job. Decoding, hashing, copying, and ranking
   happen in background processes.

[`docs/invariants.md`](docs/invariants.md) has the complete list with the reasoning.

## Running the v1 archive

`v1/` is reference material and is not expected to run against real data. Its own README
documents the setup; the short version, verified after the move:

```bash
cd v1 && ./.venv/Scripts/python.exe -m pytest -q
```

The existing virtualenv at `v1/.venv` still works. Do not point any `v1/` command at
`G:\photos`, `G:\MediaVault`, or `G:\MediaVaultImports` — the safety hold is still in force
and `v1/Resume Live Vault Backfill.cmd` in particular is quarantined, not supported.

## Real photos are not in here

This repository holds code and documentation only. Photos, canonical objects, the SQLite
catalog, derivatives, and run logs live on the vault disk and are excluded by `.gitignore`.
GitHub is not a backup for any of that — see
[`v1/docs/MANUAL_REMOTE_BACKUP.md`](v1/docs/MANUAL_REMOTE_BACKUP.md).
