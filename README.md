# photos

A local-first photo and video vault. The build is finished: 1,374,328 discovered paths were
reduced to a triage-kept set, published into a content-addressed vault at `G:\vault`, and are
browsed through a local website.

Nothing in this repository is a photo. Media, the SQLite catalog, derivatives and run logs live
on the vault disks and are excluded by `.gitignore`. GitHub is not a backup for any of it.

## Opening it

Double-click **`Open Photo Vault.cmd`**.

It starts the grid server on `http://127.0.0.1:8770/` and opens a browser tab. The server binds
to loopback only. Closing the console window stops it. The equivalent from a shell is:

```bash
python -m photolib.grid --open
```

The one client has two modes: the grid, and the nine triage screens. Everything is read-only
except `/api/triage/*`, which writes the rule set to `state.sqlite3`.

## What is where

| Path | What it is |
|---|---|
| `photolib/` | The website. `grid` serves it; `triage_api`, `triage_screens`, `triage` and `probe` are the triage half; `config`, `db` and `migrate` are shared infrastructure. |
| `ui/` | Svelte 5 source for the client. `npm run build` emits `photolib/static/bundle.{js,css}`, which are committed so the server runs from a clean checkout with no node toolchain. |
| `migrations/` | The seven SQL migrations behind the catalog and state databases. |
| `tests/` | One suite over both the website and the archived pipeline. |
| `archive/pipeline/` | The one-shot build pipeline that produced the vault — 16 modules, run to completion between 2026-08-01 and 2026-08-07. Still importable, still tested, not needed to serve the website. |
| `archive/v1/` | The previous implementation, read-only reference, under a safety hold. |
| `archive/v1-docs/` | One file per `archive/v1/` feature. Start at `archive/v1-docs/INDEX.md`. |
| `PLAN.md`, `BUILD-PROMPTS.md` | Dated records of how the build actually went. The commands quoted inside them are as they were run at the time, under the pre-archive module paths. |

`archive/pipeline/` depends on `photolib` for `config`, `db`, `migrate`, `triage` and `reveal`.
The arrow never points the other way: `photolib.grid` imports nothing from `archive`.

## Verifying

```bash
python -m pytest tests -q
```

563 tests, temporary databases only — none of them opens a path from `config.toml`. Tests that
need `ffmpeg`, `exiftool` or `rawpy` skip when the binary is absent rather than failing.

[`CLAUDE.md`](CLAUDE.md) documents every command, what each one touches, and what it costs.

## Rules that still hold

1. **Source media and published canonical objects are permanently immutable.** No operation
   deletes, moves, renames, or overwrites them.
2. **Reject, favourite, rate, exclude, stack, and junk are metadata.** They never become
   destructive file operations.
3. **No media work inside an HTTP request.** Handlers query persisted state, serve existing
   derivatives, update metadata, or enqueue a job.

[`archive/v1-docs/invariants.md`](archive/v1-docs/invariants.md) has the complete list with the
reasoning, and what broke in `archive/v1/` when each was only a convention.

## Two known gaps

There is no procedure yet for adding photos after the build, and no backup of `G:\vault`.
Both are deferred on purpose — `PLAN.md` "Open decisions" 5. The architecture was audited
against future import on 2026-08-02 and needs no change to support it.
