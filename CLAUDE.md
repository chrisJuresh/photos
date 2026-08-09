# photos

A local-first photo and video vault. **The rebuild is complete.** What is left at the
repository root is the thing that runs: the grid and triage website, and the schema it reads.

- `photolib/` is the website — `grid`, `browse`, `triage_api`, `triage_screens`, `triage`,
  `probe`, `substrates`, and the `config`/`db`/`migrate` infrastructure under them. `ui/` is
  its Svelte source.
- `archive/pipeline/` is the one-shot build pipeline that produced the vault: 16 modules that
  ran to completion between 2026-08-01 and 2026-08-07. It is still importable and still
  tested, but nothing it holds is needed to serve the website. It imports `config`, `db`,
  `migrate`, `triage` and `reveal` from `photolib`; the arrow never points the other way.
- `archive/v1/` is the previous implementation, kept as **read-only reference**. Read it
  freely; do not edit it, refactor it, or fix its bugs.
- `harness/` is the labelling harness, **scaffolding with a stated end of life**: it settles
  the strictness threshold and is deleted whole once the grid ticket lands. Same one-way
  arrow as `archive/pipeline/`.
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
and `numpy`, plus `rawpy` for Phase 2b's DNG path, `torch` for the fingerprint pass and
`opencv-python` for the match pass; `ffmpeg` and `exiftool` are external binaries reached
through PATH, and only Phase 2b needs them. Tests that need a binary skip when it is absent
rather than failing, and no test loads `torch` or a model at all — the encoder is a seam the
suite passes a stand-in through. OpenCV is the exception and is exercised for real: the Match
is a number about pictures, so `tests/test_matches.py` asserts it over pictures it draws.
Tests run against temporary databases only; none of them opens a path from `config.toml`.

```bash
python -m pytest tests -q
```

The full suite takes about three minutes, which is longer than a tool call's console lives.
When that console is torn down Windows sends Ctrl-C to everything attached to it, and pytest
dies around the two-minute mark with a `KeyboardInterrupt` — read variously as a refusal, a
hung task and a test failure, and every reading costs a re-run from the top. **An agent runs
the full suite through the script below**, which starts it on a console of its own and returns
at once; wait for `pytest.done`, which holds the exit code, and read `pytest.out` for the
report. Both live in a directory of this checkout's own under `%TEMP%` — the script prints
the two paths when it starts, and those are the ones to read, because a second worktree
running the suite at the same time has its own. A single test file is short enough to run
directly.
`Start-Process -RedirectStandardOutput` is not a workaround: redirecting makes the child
inherit the caller's console, which is the thing being escaped.

```bash
powershell -NoProfile -File scripts\run-tests.ps1
```

**A running `python -m photolib.grid` may be stopped to get a clean run**, and restarted
afterwards — the website is a read-only server over regenerable state, so nothing is lost by
killing it. Check what a `python.exe` actually is before stopping it: the launcher and the
suite look alike in a process list, and only the launcher is safe to kill.

The grid and the nine triage screens are one client, two modes, served by one process on
`127.0.0.1:8770`. Read-only except `/api/triage/*`, whose write handlers hold a connection to
`state.sqlite3` with no `ATTACH` of the catalog.

```bash
python -m photolib.grid --open
```

**A stack is a run of consecutive captures from one camera within the reader's window** —
what a bracketed set or a burst becomes in the grid, drawn as one tile and fanned out over
the sheet when it is clicked. It is formed at query time over whatever the filters select
and never stored, so removing a member splits its stack in two and the cover is resolved
per query rather than materialised. It is grid-only: `/api/triage/*` is untouched and a
triage screen never collapses anything. **Every grid tile opens that overlay**, stack or
not and with stacking off as well: a tile with no siblings is drawn as the one frame it
stands for, and revealing in Explorer is the second press, on the frame. Triage is the
exception and still reveals on the first. The overlay draws its frames from the 1536px
substrate tree on the NVMe, served by `/d/<sha256>.webp` and filled by
`python -m photolib.substrates` below. `docs/adr/0001-stack-on-capture-time-not-phash.md`
records why this groups on capture time and not on the perceptual hash that exists for
apparently this exact purpose, and `docs/grid-queries.md` what each stacked query costs.

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

To fill `substrate_root` — the 1536px tier a stack's overlay draws from, adopted from
`G:\MediaVault\derivatives` and `G:\vault\deriv` onto the NVMe. Checksum-verified where the
manifest records a checksum, resumable, and idempotent, so a re-run of a complete pass places
nothing. It reads `G:`: run it in the background and leave the drive alone while it does.

```bash
python -m photolib.substrates
```

To give every published tile a **fingerprint** — the vector
`docs/adr/0003-stack-on-verified-match.md` screens candidate pairs with before anything
expensive looks at them, computed by DINOv2 ViT-S/14. Nothing reads these vectors yet and no tile looks different after a
pass. It reads the substrate tree and the catalog, both on the NVMe, and never opens `G:`, so
it cannot collide with anything reading the vault. Resumable, idempotent, and it names the
tiles whose substrate is missing rather than letting them become tiles with no vector. The
~85 MB of weights are fetched once by `torch.hub` and cached; `torch` is a dependency of this
pass alone. Measured: 24,283 tiles in 3m33s on an RTX 3080 Ti, decode-bound.

```bash
python -m photolib.fingerprints
```

To enumerate the **candidate pairs** — every pair of frames that could be one stack — and give
each one the cheap **screen** ADR 0003 puts in front of the geometric check. A candidate is a
pair inside one run of consecutive same-camera captures whose every gap is at or below the
3600s ceiling, over the EXIF-dated population `photolib/browse.py` already stacks the grid
over; complete linkage is why it is every pair of a run and not only the adjacent ones. The
ceiling is a build-time commitment, because it decides how many candidates exist at all:
3,634,381 at 3600s against 2,193,828 at 900s and 307,750 at 60s, and `--counts` prints that
table without writing anything. The screen is the cosine of the two fingerprints, **stored per
candidate rather than reduced to a yes-or-no**, because the fingerprint's own threshold is what
ADR 0003 leaves unsettled and a number chosen later must be a re-read of these rows rather than
another pass — it is not the reader's *strictness*, which is a threshold on the Match. A
screened-out candidate is recorded as one, so that "never plausibly the same picture" stays
distinguishable from "checked properly and disagreed"; that verdict is the one derived value in
the table, and moving the screen constant is refused rather than silently answered at the old
threshold. It reads the catalog on the NVMe and nothing else — not the substrates, not `G:`,
and not `state.sqlite3`, which is not even attached. Resumable, idempotent, and it refuses
while a writer holds the catalog.
Measured: 3,632,211 pairs in 1m21s, of which 566,522 survive the screen at 0.40, and the
table it wrote grew the catalog from 1,757 MB to 2,517 MB.

```bash
python -m photolib.candidates
```

To give every candidate the screen let through a **Match** — the count of distinctive points
the two frames agree on under a single transform, which is the number the whole of ADR 0003
rests on. The seam is `match(frame_a, frame_b)`, taking two images rather than two sha256s,
so what the number means is asserted over pictures `tests/test_matches.py` draws: a copy at a
different exposure and a copy nudged a few pixels both keep it high, two unrelated textures
drop it to nothing. SIFT from the installed OpenCV, capped at 800 points a frame, matched
with Lowe's ratio and fitted by RANSAC to a homography — a homography because a handheld
reposition is very nearly a rotation about the camera's own centre, and a transform that
explains more explains unrelated frames too. Its named failure is a bracket end blown out
past having any texture left: no keypoints, so a Match of zero, which ADR 0003 accepts as one
true stack drawn as two. **The count is stored and no verdict is derived from it**, because
*strictness* is the reader's threshold on the Match and ADR 0003 leaves its value for the
labelling harness — a pair with no row was not checked, not checked and found wanting.
Frames are read from the substrate tree at 1024px on the long edge, and fan-outs are walked
in capture order so a frame is described once rather than once per pair. It reads the
substrates and the catalog, both on the NVMe, never opens `G:`, and does not attach
`state.sqlite3`. Resumable, idempotent, and it refuses while a writer holds the catalog.
Measured: 566,522 pairs over 22,580 frames at 287/s — 32m47s for the 564,323 left after a
trial run — and the table it wrote grew the catalog from 2,517 MB to 2,631 MB. Nothing was
missing and nothing failed to decode. The Match separates the two populations it was built
to: pairs a second or less apart score a median of 283 and 94% of them reach 20 or more,
against a median of 5 beyond two minutes.

```bash
python -m photolib.matches
```

To judge those Matches — the **labelling harness** ADR 0003 says strictness will be settled
by. It shows one candidate stack at a time with the frame before and after it, which is what
lets one screen answer both of the reader's complaints: *does this stack hold something that
does not belong*, and *is it missing something that should be here*. Space accepts the stack
as drawn, clicking a member says it does not belong, clicking a neighbour says it should have
been included — each click is recorded as it is made — and `u` records **not sure**, which is
an answer rather than a skip; dragging across several frames marks them together and records
once. The keys are vim's — `h`/`l` between sets, `k`/`j` for how much of the run is on screen.
`k` widens the view when the answer turns on what is past the edge, **with no ceiling** — one
frame each side is enough for 46% of candidate stacks but only 27% of the least decisive ones,
and every ceiling picked for it so far has been hit, so the whole run rides with the set. That
is 3,808 frames and about 316 KB over a round's thirty sets. `g` shows the whole run and `0`
comes back. The frames shrink to a floor and then the box scrolls, rather than the view
stopping. **The frame past each end of the run is drawn too**, dotted and always — the fence
rules it out of the stack, so it is there as the reader's check that the run ended because the
shooting ended and that the clock is telling the truth; a frame 23 hours away that is plainly
the same photograph is a wrong timestamp, and nothing else on the screen could show that. **What an
answer says is bounded by what was on screen for it**, which is stored per answer and is the
column ticket 34 has to read — `accept` means the frames the reader was shown are right, never
that the stack is complete. Sets are drawn from wherever the Match is least decisive and
dealt out a camera at a time; `STRICTNESS` there is a provisional line to disagree with and
not the answer. One run is one of ADR 0003's two rounds of thirty, and the second round is a
second run at whatever the first round moved the line to — `--strictness` and `--sets` say so.
Answers go to a `labels.sqlite3` of its own beside the catalog, **never `state.sqlite3`**, and
it is not a migrated database because a disposable table has no business in the shipped
schema. Frames come from the substrate tree. Its one test is the sampling.

```bash
python -m harness.label --open
```

Triage's **Apply to grid** button is what makes a triage decision visible in the grid:
it snapshots `state.sqlite3`, spawns `archive.pipeline.group` to rebuild `photo`, and
then drops the facet vocabulary and every `total` the server had memoised — no restart.
It is a background job, never a request; `photolib/rebuild.py` is the whole of it.

To roll the triage state back to one of those snapshots. It refuses while the grid is
up, refuses while anything holds the database, verifies the snapshot carries the
decisions, and snapshots the current state before replacing it. Rolling back a triage
session means restoring the snapshot from *before* it, which is the previous run's.

```bash
python -m photolib.restore_state --list
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
