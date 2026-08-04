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

The root build is a plain Python package with no venv. Its dependencies are `pytest`, `pillow`
and `numpy`, plus `rawpy` for Phase 2b's DNG path; `ffmpeg` and `exiftool` are external
binaries reached through PATH, and only Phase 2b needs them. Tests that need a binary skip when
it is absent rather than failing. From the repository root:

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

To write the Phase 1 categorical prefilter — nine `exclude` rules on extension at `seq` 0–8 in
`state.sqlite3` — and report what each removes. Seconds, pure SQL, zero I/O. It writes nothing to
the catalog: no `file.state` becomes `excluded` and no `photo` row moves, so the grid is
unchanged and that is not a failure. Re-running with the rules in place is a no-op that keeps
their `created_at`; a rule set that is not exactly the prefilter is refused rather than
overwritten. Deleting a rule row reverses it.

```bash
python -m photolib.prefilter
```

Phase 2a's verification read, in three passes that each resume on their own: `a` re-hashes all
146,034 MediaVault objects against the SHA-256 and the byte count in their own filenames
(451.2 GB, the only large read in the project, **one** reader because it is bandwidth-bound);
`b` turns the 1,486 wrongly-rotated `.arw` derivatives upright; `c` computes pHash, dHash,
ThumbHash and the 18 quality scalars from the repaired 1536px substrate, 24 readers feeding 12
bounded decode workers. `bench` projects the wall time without writing anything. **`b` must
precede `c`** or every ARW hash comes off pixels that are 90° out. One lock file at
`E:\photolib\phase2a.lock`; a lock left by a killed run is detected by its PID and cleared.

**Nothing else may touch `G:` while this runs, and `F:` is the same physical disk** — both are
partitions of disk 3, the WD Elements USB HDD. A concurrent 15 MB/s write to `F:` measured pass
`a` at 27.4 MB/s against the 62.0 the volume does when idle.

```bash
python -m photolib.phase2a
```

The repaired ARW derivatives are **written to the new build's own trees, never over v1's**:
the 1536px substrate to `deriv_root`, the 384px tile over step 5's copy on `thumb_root`. That
is 2,972 files, not the 5,944 the plan anticipated — the 192 and 768 tiers exist only inside
MediaVault, nothing here reads them, and rewriting a checksummed MediaVault derivative in place
would turn a verified tree into 1,486 apparent corruptions. So the working 1536 substrate is
split: 1,486 assets under `G:\vault\deriv`, the rest still under `G:\MediaVault\derivatives`.

To build the triage survey — the derived, regenerable projection of `origin` and `file` that the
rule engine reads. ~40 s, pure SQL, no media root is opened. It collapses 1,374,328 paths onto a
counting surface of 448,512 buckets, which is what lets a rule set be re-costed in ~220 ms instead
of ~2.9 s. Re-run it after anything that changes the catalog — `capture_time`, `probe`. It holds
no decisions, so dropping every row loses nothing.

```bash
python -m photolib.triage_survey
```

To fill `file.width`/`height` for triage screen 3 by reading image **headers**, never decoding.
Runs only on what the current rule set still keeps, which is why `PLAN.md` puts it after screens
0–2. On this corpus the worklist is **25 files** and all 25 are unreadable — MediaVault already
measured every raster the library holds, including 54,896 of the 54,899 `.png`. `--dry-run`
reports the worklist and stops; `--ext` overrides the format list.

```bash
python -m photolib.probe --dry-run
```

Phase 2b's gap fill: the step billed as the only one that reads the photos root, which on this
corpus reads none of it. ~3m20s. Two populations. **1** — the 1,659 MediaVault assets v1 could
not preprocess, read from the object and decoded three ways: an ffmpeg poster frame for video
(`scale` before `thumbnail`, or a 4K frame buffer breaks the worker's memory cap), libraw for
DNG (embedded preview when it can make a 1536px substrate, half-size demosaic when it cannot —
this corpus's previews are 504×376, so it always demosaics), a normal decode for stills. **2** —
whatever survives triage with no MediaVault asset, copied into `G:\vault\.staging` and hash-
verified first; that set is currently **empty** and the pass says so rather than skipping
silently. One decode per file produces the 1536px substrate on `deriv_root`, the 384px tile on
`thumb_root`, ThumbHash, pHash, dHash and the 18 quality scalars. Idempotent on
`file.quality IS NULL`; failures persist as `{"error": …}` so 407 broken stubs are not re-read
for ever, and `--retry-errors` clears them. Needs `ffmpeg` and `exiftool` on PATH and `rawpy`
installed. `bench` projects the wall time without writing anything.

```bash
python -m photolib.phase2b bench --n 500
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

The off-site copy lives on `a3server` (`ssh -p 22222 chris@82.14.247.27`):
`/mnt/bay6/ResticPhotos` for the repo, `/mnt/bay6/photolib-backup/` for the catalogue databases.
Verified 2026-08-02 by hashing every repo file server-side and comparing each against its own
filename — restic content-addresses packs, index files and snapshots, so that establishes the
same property as `check --read-data` without a password, without restic on the server, and
without pulling 436 GB over a 11.7 MB/s link. Prefer that technique over a remote
`check --read-data` whenever a verified local copy exists. **Never put a backup anywhere a
download client or an *arr app manages** — the repo spent ~29 hours seeding to the DHT from
qBittorrent's completed-downloads directory before it was moved.

There is **no procedure yet for adding photos after the build**, and **no backup of `G:\vault`
at all** — `PLAN.md` "Open decisions" 5. Both are deferred on purpose: the architecture was
audited against future import on 2026-08-02 and needs no change, chiefly because import requires
**no schema migration** and the walk/hash helpers are already root-parameterised. Do not invent a
procedure in passing, and do not treat the gap as a reason to redesign anything.

The grid and the nine triage screens are one client, two modes, served by one process on
`127.0.0.1:8770`. Read-only except `/api/triage/*`, whose write handlers hold a connection to
`state.sqlite3` with no `ATTACH` of the catalog.

Screen 8 is the directory tree: what is left of the folder structure, one node per request, with a
one-click `dir_under` exclude per folder. A folder is listed only while the rules still keep
something inside it, so excluding one removes it from the tree. An ordinary node costs 23–54 ms,
but the root and the two arch backups are 1.7–3.3 s, because between them they hold most of the
315,680 directories — the same band every other screen sits in at a 372-rule set.

```bash
python -m photolib.grid --open
```

Its source is `ui/` — Svelte 5, no Kit. `npm run build` emits `photolib/static/bundle.js` and
`bundle.css` under fixed unhashed names, and **those two files are committed**: they are the only
generated code in this repository, and they are here so the server runs from a clean checkout
without a node toolchain. Edit `ui/src`, never the bundle, and rebuild before committing. No
literal `style="…"` in a `.svelte` file — the CSP carries no `unsafe-inline`, and Svelte compiles
a static style attribute to `setAttribute`, which is blocked; `style:` directives and classes are
not.

```bash
cd ui && npm run check && npm run build
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
