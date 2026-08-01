# Build prompts

Seventeen prompts, run one at a time, in order. Each is self-contained: start a **fresh
session** for each, because `CLAUDE.md` loads automatically and the prompt names the only
other files that session should read.

Every prompt ends at a **gate** — a fact you can check before spending the next hour. If a
gate fails, stop and fix the plan rather than continuing; several later steps read earlier
verdicts.

---

## Effort ladder

Set the effort level in your client before sending. The ladder used here:

| Level | When | Steps |
|---|---|---|
| `low` | Mechanical, fully specified, nothing to decide | 0, 8 |
| `medium` | Normal implementation against a clear spec | 1, 2, 3, 5, 11, 16 |
| `high` | Correctness-critical, or a design decision inside it | 4, 6, 7, 9, 10, 12, 13, 15 |
| `xhigh` | Irreversible, operating on data with no second copy | 14 |

Effort is how hard one pass thinks. Plan mode, background and **ultracode** are execution
modes, orthogonal to it — any of them composes with any level.

Run steps **6, 10, 11 and 14 in plan mode first** — approve the approach, then let it build.
Step 14 is the only one that deletes anything; it is written to be dry-run by default.

Steps **7, 9 and 12** are long (tens of minutes to hours). Have them run in the background
and print a throughput line, so you can leave them.

**Ultracode** earns its cost in two places, which share one shape: a claim whose failure would be
expensive and invisible, checked by readers that cost only tokens.

- **Step 1** — three independent spikes that can run concurrently, producing three verdicts the
  rest of the build assumes. Spike B's verdict is what authorises step 14 to unlink 420 GB, and
  one passing hardlink test is thin evidence for a filesystem behaviour.
- **Step 13** — the last checkpoint before anything irreversible, and it writes nothing, so a
  fan-out costs only tokens. A check that *looks* clean is the entire failure mode.

**Step 4 was on this list and came off it.** Its filename-pattern space reads as an unknown-size
search, which is ultracode's best case — but masking digit runs and grouping enumerates that
space exhaustively in one pass, and the bucket counts summing to the row total is the proof.
Parallel readers over disjoint slices cannot offer that: each can miss a pattern that is rare in
its own slice, and the round then reports convergence. Enumerating beat sampling on correctness
and on cost at the same time. Step 4 keeps one independent reader for its coverage number, which
is a claim rather than a space.

Never run steps **3, 5, 7, 9, 12 or 14** under ultracode. Each is a single process holding one
lock file by invariant 6 — a fan-out of writers is precisely the job ledger `PLAN.md` refuses to
build — and each is disk-bound on one USB HDD head, so parallel agents buy no throughput at all.
Where a fan-out is used at all, it reads; the main session stays the only writer.

Steps **0, 2, 6, 8, 10, 11, 15 and 16** are fully specified by `PLAN.md`. Extra agents on those
mostly generate proposals to add things the plan deliberately excludes. Step 6's `/api/reveal` is
better served by a targeted security review after it builds than by a fan-out while it does.

---

## Standing rules

`CLAUDE.md` covers most of it. Four things worth restating in any session that drifts:

- **No `v1/` code ever executes.** Reading v1's *data* with new code is fine and is most of
  the plan; importing a v1 *module* is not.
- **`G:\photos` is opened read-only** in every step except step 7's `restic backup`.
- **Nothing under `G:\` gets deleted or renamed** until step 14, and step 14 requires an
  explicit flag.
- **Every step ends committed and pushed** to the one `build/rebuild` branch — the instruction
  is repeated at the foot of all 17 prompts. Stage by explicit path: a reflexive `git add -A`
  in this repo is precisely how hard rule 5 gets broken. The `pre-commit` hook described below
  refuses newly added media, `*.sqlite3`, `*.jsonl` and `*.log`, but it is a backstop, not a
  licence to stage blindly.

If a session proposes a job ledger, a worker runtime, a materialized projection table, an ORM,
or a plugin seam — that is v1 reappearing. Say no; `PLAN.md` § "Explicitly not building" lists
them.

---

## Setup before step 0 — restic password — **done 2026-08-01**

Step 7 is the only step that needs it. The password must not pass through the assistant or sit
in plaintext on disk. Option A is in place and verified; nothing needs redoing.

**Option A — DPAPI-encrypted file (in use).** `%USERPROFILE%\.restic-key` holds a blob
decryptable only by this Windows account on this machine, created with:

```powershell
Read-Host -Prompt 'restic password' -AsSecureString | ConvertFrom-SecureString | Set-Content -Path $env:USERPROFILE\.restic-key -Encoding ascii
```

Run that directly at a `PS>` prompt. Do **not** wrap it in `powershell -NoProfile -Command "…"`
— PS 5.1 drops the inner quotes when quoting arguments to a native command, so `-Prompt`
swallows the following token and the call fails.

`%USERPROFILE%\.restic-pw.ps1` reads that blob and writes the password to stdout. It contains no
secret. Restic is wired to it with this exact flag value, which opened repo `bee3c3c3` with no
prompt on 2026-08-01:

```
--password-command "powershell -NoProfile -File C:/Users/Chris/.restic-pw.ps1"
```

Forward slashes are deliberate — restic splits `--password-command` with shell-style quoting
rules, under which backslashes escape the following character.

**Option B — you run restic yourself.** Still the fallback if the flag ever misbehaves: run
`restic backup` and the `cat snapshot` / `cat tree` calls in your own terminal and paste the
output. Slower, zero exposure.

Either way: **never** put the password in a command line — arguments land in shell history and
process listings.

---

## Amendments to PLAN.md

Six corrections found while sequencing this. `PLAN.md` has been updated to match; they are
listed here so you know why the prompts read the way they do.

1. **`origin.content_key` → `restic_key` + `origin.sha256`; `file` is keyed on `sha256`.**
   MediaVault is imported (step 3) before the restic inventory runs (step 7), so adopted
   assets know their SHA-256 and not their blob list. Keying `file` on the restic key would
   have forced a merge of two identity spaces later. `restic_key` now exists only to group
   duplicates before reading them.
2. **The Phase 1 prefilter is `triage_rule` rows, not code.** The one step described as
   irreversible now reverses by the same mechanism as every other decision.
3. **Grid thumbnails are the adopted 384px WebP**, not a generated 512px AVIF — so the route
   is `/t/<sha256>.webp`. The storage table said AVIF; the Phase 2a row said adopt the WebP.
4. **Triage needs a header-only dimension probe** between screens 2 and 3. Screens 0–2 run on
   path and extension alone; screen 3 needs `width`/`height`, which files outside MediaVault
   do not have.
5. **`/api/reveal` resolves against one configured containment root**, which is
   `G:\MediaVault\objects` until step 14 and `G:\vault` after. A *set* of allowed roots is how
   `F05`/`F13` happen.
6. **ThumbHash arrives at step 9, after the grid exists.** `th` is optional in the API
   response from day one so nothing renegotiates when it lands.

---

# Step 0 — Preflight

**Effort:** `low` · ~10 min

```text
Read PLAN.md. Do not read anything in docs/ or v1/ for this step.

Set up the root of this repository to build in, and nothing more.

1. Branch off main: build/rebuild. Every later step commits to this same branch.

2. A root .gitignore already exists and already covers hard rule 5 well: every media
   extension, *.sqlite3/*.db and their -wal/-shm/-journal siblings, *.log, and the
   objects/ records/ state/ exports/ reports/ logs/ conflicts/ derivatives/ directories.
   Do not rewrite it. Append only what is genuinely missing for this build:
   *.jsonl, and thumb/ deriv/ meta/ staging/.
   Add a comment that UI assets, if any are ever added, need `git add -f`.
   Do not touch v1/ or v1/.gitignore.

   A .git/hooks/pre-commit backstop is already installed: it refuses newly added media,
   *.sqlite3, *.jsonl and *.log even when force-staged. Leave it alone; it is not
   version-controlled and does not need to be.

3. Write config.toml at the root holding every absolute path the build uses, and a small
   loader module that reads it. This is the ONLY place a drive letter appears in the code:
   photos_root, restic_repo, mediavault_root, mediavault_manifest_db, vault_root,
   staging_root, deriv_root, meta_root, thumb_root, catalog_db, state_db, reveal_root.
   reveal_root starts as the MediaVault objects directory; step 14 changes it.
   Add one non-path entry, restic_password_command, whose value is the string given in
   BUILD-PROMPTS.md "Setup". Step 7 reads it from here rather than hardcoding it.

4. Print the version of python, node, exiftool, ffmpeg, ffprobe and restic on PATH and
   record them in TOOLING.md with today's date.

Do not create the schema, do not add a test runner or framework, do not write to G: at all.
Report what you created and stop.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** `git status` shows no media, no `.sqlite3`. `config.toml` has every path and the
code has no drive letter outside it.

---

# Step 1 — Three premise spikes

**Effort:** `medium` · run under ultracode · ~30 min

These kill or confirm three assumptions the plan rests on. Nothing is built. The three spikes
share nothing, so they run concurrently — and each verdict then gets attacked before you act on
it, because two of the three are only contradicted much later and one of those is at the moment
of deletion.

```text
Run this step under ultracode.

Read PLAN.md sections "Phase 0", "Phase 2a — Adopt MediaVault and verify", and "Phase 4 —
Promote". Do not read docs/. Do not run any v1/ code.

Three independent premise checks. Run them CONCURRENTLY — they touch nothing in common. Write
throwaway scripts in the scratchpad, not the repo. Everything here is read-only against
G:\MediaVault; the only writes are inside throwaway directories you create and clean up. You are
the only one who edits PLAN.md.

SPIKE A — restic blob lists
  Create a throwaway restic repo in the scratchpad with a throwaway password (not mine).
  Back it up a directory containing: two byte-identical files under different names, one file
  differing from them by a single byte, one file larger than 8 MB so it chunks, and one tiny
  file. Then walk `restic cat snapshot <id>` into `restic cat tree <id>` and report:
    - the exact JSON shape of a file node
    - whether it carries the ordered content blob ID list, size, and mtime
    - whether the two identical files have byte-identical blob lists
    - whether the one-byte-different file shares any blobs with them
  VERDICT: can content_key = sha256(json(ordered blob ids)) serve as an exact-duplicate key?
  If no, say so plainly and state which fallback Phase 0 must use.

SPIKE B — NTFS hardlink then unlink
  In a throwaway directory on G: (same volume as MediaVault): create a file, hardlink it to a
  second name, confirm link count 2, delete the FIRST name, confirm the data is still readable
  through the second name and link count is 1. Repeat with the read-only attribute set on the
  second name and report whether deleting the first name still succeeds.
  VERDICT: is Phase 4's link-then-unlink promotion safe? Give the exact API or command you
  would use, and say whether it needs a privilege I may not have.
  Delete the throwaway directory when done.

SPIKE C — derivative orientation
  Sample 40 MediaVault assets across .rw2, .arw, .jpg and .png, biased toward ones whose EXIF
  Orientation tag is not 1. For each, compare the 1536px derivative's pixel dimensions against
  the object's EXIF orientation and native dimensions.
  VERDICT: did v1 bake EXIF orientation into the derivatives consistently, inconsistently, or
  not at all? If inconsistently, the 1536px substrate cannot be adopted as-is and Phase 2a
  must regenerate it from the objects — say so explicitly, and say what that costs.

Before you report any verdict, attack it. For each of the three, send independent readers to
REFUTE it rather than confirm it, each with a different lens — is the evidence actually general
or true only of the case tested, does the result hold on a case the test did not cover, and
would a wrong verdict even be visible at this stage — and have them default to "refuted" when
uncertain. Attack SPIKE B hardest: its verdict is what authorises step 14 to unlink 420 GB, and
one passing hardlink test is thin evidence for a filesystem behaviour. Report each verdict with
the evidence that settled it, and say plainly which ones survived only weakly.

Finally: if any verdict contradicts PLAN.md, amend the affected section of PLAN.md and tell me
exactly what changed.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** three verdicts in writing, each having survived its refutation pass, and any that
survived only weakly named as such. A fails → Phase 0 falls back to size-grouping. B fails →
Phase 4 becomes a copy, and you need 420 GB more free space. C fails → step 9 grows by a full
regeneration pass.

---

# Step 2 — Schema and migration runner

**Effort:** `medium` · ~45 min

```text
Read PLAN.md "Storage layout" and "Schema". Read docs/database-schema.md ONLY for its
migration contract — you are not reproducing v1's 68 tables and must not import any of them.

Build both databases and the migration runner.

- Migration runner, roughly 40 lines: numbered .sql files in migrations/, a schema_version
  table, each migration applied inside one transaction. It refuses to run while any other
  writer holds the lock (invariant 6) and refuses to run against a database whose recorded
  version is ahead of the files it can see.
- Migration 001 creates catalog.sqlite3 exactly as PLAN.md specifies: origin, file, photo, and
  their indexes. Nothing more.
- Migration 002 creates state.sqlite3: triage_rule, triage_override. Nothing more.
- A db module that opens catalog and ATTACHes state as `state`, with WAL, foreign_keys ON, and
  a busy_timeout. Read-only callers open with a read-only URI.
- Tests: applies from empty; is idempotent; refuses concurrent application; a round-trip
  insert/select on every table; and a test that opening read-only rejects a write.

Constraints:
- Every path comes from step 0's config loader. No drive letter in any module.
- Do not add tables PLAN.md does not list — no run_id, no job ledger, no projections, no
  materialized views. If you think one is needed, tell me instead of adding it.
- Import nothing from v1/.

Report the applied schema and the test output.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** `schema_version` reads 2 in both files; the test that a second concurrent migration
is refused actually passes.

---

# Step 3 — Import MediaVault's cheap outputs

**Effort:** `medium` · ~1 h, mostly the 1.22 GB sidecar read

```text
Read PLAN.md "What MediaVault already provides", "Phase 2a", and the Schema section. This step
reads v1's DATA, never v1's code.

Import everything that costs no large I/O.

1. Locate the MediaVault manifest database, record its path in config.toml, and open it
   READ-ONLY via a file: URI with mode=ro. Never write to it, never migrate it, never take a
   write lock on it.

2. Read the 146,034 JSON sidecars under the MediaVault records directory and insert `origin`
   rows: path, root (the first path segment under G:\photos), ext, size, mtime_ns, sha256 of
   the asset the path resolved to, seen_at. Leave restic_key null — step 7 fills it.
   `origin.path` is UNIQUE and 737 paths were observed more than once, so a path can arrive
   twice. Verified against the manifest: no path resolves to two different assets, so this is
   never a sha256 conflict — it is the same file re-observed with changed mtime or size. Keep
   the EARLIEST mtime_ns when collapsing. Step 4 resolves undated photos by min(mtime_ns), so
   keeping the later one would quietly bias those dates forward.

3. Insert one `file` row per distinct asset: sha256, size, ext, kind, width, height,
   vault_relpath (the MediaVault object relpath), state='adopted'.

4. Import asset_extended_metadata ONLY: capture time and its source tag, camera, lens, GPS,
   and anything else that lands in a `file` column. Do NOT import asset_features,
   photo_entities, photo_user_state, stack_*, junk_*, or any projection table — PLAN.md
   explains why each is empty, partial, or filler.

5. If the manifest carries raw exiftool output per asset, write it to
   <meta_root>\<aa>\<bb>\<sha256>.json.gz. If it does not, say so and leave it to step 12.

Constraints:
- Adopt nothing on the strength of a database row. Where a row references an object or
  derivative file, require that file to exist on disk; count and report the ones that do not
  rather than importing them.
- Idempotent and restartable: re-running must change nothing and must not duplicate rows.
- Batch inserts inside transactions. This should take minutes of CPU, not hours.

Report: origin rows, file rows, coverage of capture time / camera / GPS as counts and
percentages, and how many manifest rows were skipped for a missing file.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** ~146,034 `file` rows and ~251,087 `origin` rows. Capture-time coverage should land
near 38,767 (26.6%) — if it reads 6,451, the ambiguous-flag column is being honoured and step 4
has to override it.

---

# Step 4 — Capture time, and the first `photo` rows

**Effort:** `high` · ~45 min

`PLAN.md` calls this the highest-risk part of the build. It is the single thing v1 got wrong
that made its library unusable. The filename-pattern space reads as unknown at the start, but it
is enumerable rather than searchable — masking digit runs and grouping turns discovery into one
deterministic pass whose coverage is provable by arithmetic. What stays genuinely worth
attacking is the coverage number, because that is the exact shape of v1's failure.

```text
Read PLAN.md's paragraphs on date resolution ("Date resolution is the highest-risk part of the
build...") and Phase 5's capture-time chain. Do not read docs/.

Resolve capture time for every adopted file, then create the `photo` rows.

Do this work yourself. The one place a second reader earns its cost is named at the end; it is
read-only, and you stay the only writer to either database.

The chain, in order, with the winner recorded in taken_src:
  1. EXIF DateTimeOriginal — treat as AUTHORITATIVE LOCAL TIME. Store the local timestamp plus
     a NULLABLE UTC offset. Do not require the offset. Do not mark it ambiguous.
     v1 had dates for 26.6% of the corpus, flagged all 32,316 of them ambiguous because
     DateTimeOriginal carries no timezone, and resolved zero calendar buckets. Do not repeat it.
  2. CreateDate, then DateCreated — same treatment.
  3. Filename pattern. Do NOT hunt for these by sampling — enumerate the whole space:
       - For every origin path, mask each run of digits to a length-tagged token, so
         IMG_20190704_123456.jpg becomes IMG_D8_D6.jpg and P1080096.RW2 becomes P_D7.RW2.
         Mask the RELATIVE PATH, not just the basename: some dates live in the directory
         (2019-07-04\IMG_1234.jpg) and basename-only masking loses them silently.
       - Group by the masked shape, count, order by count descending. One pass over the
         ~251,087 origin rows step 3 imported — NOT 1.38M, which is what step 7's restic
         inventory adds later and does not exist yet. Seconds, not minutes.
       - The counts MUST sum to the total row count. That sum is the coverage proof — every path
         is in exactly one bucket, so no pattern can hide from this the way one can hide from a
         sample. Report the sum, and report what fraction of files fall below whatever cutoff
         you take the top N at.
       - Then read the ranked shape list and classify each as date-bearing or not. IMG_D8_D6 is
         a date; P_D7 is a Lumix sequence number; D4xD3 is a resolution.
     VALIDATE every candidate before adopting it: on files that ALSO have EXIF
     DateTimeOriginal, the shape's parse must agree with EXIF to the day. A shape that disagrees
     is reading something that is not a capture date — an export date, a version, a resolution,
     an order number. Report the agreement rate per shape, and adopt on that evidence rather
     than on hit count.
     Report every shape you adopted with its hit count, and every one you rejected with why.
     Reject implausible results (before 1990, in the future).
  4. min(mtime_ns) across ALL origin rows for that sha256. Never ctime — v1's records show
     ctime is the 2026 copy date while mtime survived from 2019 and 2024. Having many origins
     per file is an advantage here: the earliest mtime across every copy is the best proxy.
  5. none.

Then one `photo` row per file, sort_key = the resolved timestamp. Undated photos must still sort
deterministically and keyset paging must stay totally ordered — say what sentinel you chose and
why it cannot collide with a real timestamp.

Acceptance, all of which you must show me:
- Coverage per taken_src as a table. Step 1 of the chain alone should cover roughly 38,767
  files. If it covers ~6,451 instead, STOP — you are honouring v1's ambiguous flag.
- A reconciliation identity, written as a test: the taken_src buckets sum to the count of
  adopted files, AND the 'none' bucket equals the independently computed count of files with no
  available date source. Compute that second number from the source columns, never from the
  photo table you just wrote. v1 reported 113,718 unknown against 107,267 with no source, and
  the 6,451 difference was exactly the set that HAD resolved. Once both halves of this identity
  hold, that divergence is arithmetically impossible rather than merely unobserved.
- Twenty resolved dates spot-checked against the file's real EXIF via exiftool, printed side by
  side, spread across all five chain steps.

Then, before you report, have ONE independent reader recompute the coverage table from the
source columns without seeing your query, and diff it against yours. Attack that number and
nothing else: the spot-checks carry their own ground truth, and the identity above is a test
rather than a claim. Coverage is the one figure that can look right and be wrong — v1's were
true of its projection and false of its data. Report the diff even if it is empty.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** the coverage table. Chain step 1 ≈ 38,767, both halves of the reconciliation identity
hold, the masked-shape counts sum to the full row count, the twenty spot-checks look right,
every adopted shape has a reported EXIF agreement rate, and the independent recompute diffs
clean against yours.

---

# Step 5 — Thumbnails onto NVMe

**Effort:** `medium` · ~20–40 min, disk-bound

```text
Read PLAN.md "Storage layout" and the derivative row of the Phase 2a table.

Copy the existing 384px WebP derivatives out of the MediaVault derivative tree to
<thumb_root>\<aa>\<sha256>.webp. One sequential pass.

- Verify each file against its recorded checksum_sha256 before accepting it. Count mismatches
  separately from missing files; a mismatch is a real problem, a missing file is expected for
  the 42,827 error rows.
- One or two reader threads. G: is a USB HDD — more readers is slower, not faster.
- Idempotent: re-running copies only what is absent.
- Generate NOTHING. Files with no 384px derivative stay recorded as missing and are step 12's
  problem.

Report: copied, skipped-missing, checksum mismatches, total bytes, wall time, and the
throughput you achieved so I can calibrate the 420 GB pass in step 9.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** ~103,207 thumbnails on `E:`, zero checksum mismatches. Note the MB/s — step 9's
estimate depends on it.

---

# Step 6 — The grid

**Effort:** `high` · run in plan mode first · ~2 h

This is the deliverable you asked for, and it arrives before any expensive pass runs.

```text
Read PLAN.md "Grid" in full. Read docs/review-api.md ONLY for its security-posture section.
Do not copy code from v1/ — read it for what went wrong, not for what to reuse.

Build the read-only grid. One process, four routes, no framework, no bundler:

  GET  /                                   the page
  GET  /api/photos?before=<sort_key>&limit=500&kind=image
                                           keyset page, payload [{id, w, h, th}]
  GET  /t/<sha256>.webp                    thumbnail from E:, Cache-Control immutable
  POST /api/reveal {id}                    explorer.exe /select,<path>

/api/reveal is the only security-sensitive surface in this system. Non-negotiable:
  - takes an id, never a path. The client cannot name a file.
  - the path is read from the DB, realpath-resolved, and must PROVE containment under the one
    configured reveal_root before the process spawns. F05 and F13 are exactly this check
    missing. One root, not a set — reveal_root is MediaVault objects today and becomes the
    vault at step 14.
  - bind 127.0.0.1 only; validate the Host header (F48 is a DNS-rebinding hole from omitting
    it); POST plus same-origin only.
  - argument-vector invocation, never a shell string. Write a test for a path containing a
    space and one containing a comma — `/select,` with a comma is the case that breaks.

Perceived load delay is the stated requirement. In priority order:
  - stored width/height so justified rows lay out before a single image loads: no measuring,
    no layout shift
  - content-hash URLs with immutable caching, so the browser stops asking after pass one
  - keyset paging with an integers-only payload — no OFFSET, ever
  - IntersectionObserver prefetching about 1000px ahead
  - DOM recycling so roughly three screens of tiles exist at once

ThumbHash does not exist yet; it arrives in step 9. Write the client so `th` is optional:
neutral tile when absent, decoded ThumbHash when present, and NO API contract change when it
lands.

`kind` is a query parameter from the start and defaults to image, which is how video is
ingested but hidden by default. Filters are query params even while there is only one, so
adding facets later extends the contract instead of renegotiating it.

No writes. No auth. No npm dependency you cannot justify in one line.

Report the route table, the reveal test output including the comma and space cases, and how
long a cold first paint takes with 100,000 rows in the table.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** scroll from newest to oldest with no blank gaps and no layout shift; click a photo
and Explorer selects the right file; the comma/space reveal tests pass.

---

# Step 7 — Phase 0 inventory from restic

**Effort:** `high` · run in the background · ~2–4 h including the backup

```text
Read PLAN.md "Phase 0" and the "Gate" section, and read step 1's SPIKE A verdict before you
write a line. If SPIKE A failed, implement its documented fallback instead: scandir walk, group
by size, hash only inside size-collision groups.

The restic password is already set up and verified as a DPAPI blob, and is reached by passing
config.toml's restic_password_command to restic's --password-command. Do not re-create it, do
not prompt for it, do not read .restic-key yourself. Never echo it, never write it to a file,
never put it on a command line.

1. `restic backup` the photos root. Incremental — it only reads what changed since 2026-07-18.
   This closes the 8,052-file gap and makes the snapshot authoritative. It is the only write to
   G: in this step.

2. Walk the new snapshot's trees and write, for every file node: path, size, mtime, and
   restic_key = sha256 of the ordered blob id list. About 1.38M origin rows. Batch inside
   transactions — minutes, not hours. Rows already present from step 3 get restic_key filled in
   rather than duplicated.

3. Reconcile against step 3's import by joining on path, and report four numbers:
   - origin rows in the snapshot with no MediaVault asset (the gap, expected around 8,052 plus
     whatever v1 misclassified as non_media)
   - MediaVault assets whose recorded paths are absent from the snapshot (moved or deleted)
   - restic_key groups whose members disagree on sha256 where both are known. This MUST be
     zero. If it is not, SPIKE A's premise is wrong and dedup falls back to size-grouping.
   - files whose sha256 is known and whose restic_key groups match — the confirmation that the
     two identity spaces agree.

4. Diff restic's path list against a fresh scandir of the photos root. Report every discrepancy
   with its cause: permissions, reparse point, path longer than 260 characters, file in use.

Read-only against the photos root apart from restic's own read. Report the counts and stop —
do not act on the gap; that is step 12.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** the sha256-disagreement count is **zero**. Any non-zero value invalidates the dedup
premise and everything downstream of it.

---

# Step 8 — Categorical prefilter

**Effort:** `low` · ~10 min

```text
Read PLAN.md "Phase 1".

Pure SQL over origin and file. Zero I/O.

Express the prefilter as triage_rule rows with seq 0..n and decision='exclude' — NOT as a
hardcoded list in code. It is simply the first rules in the same engine triage uses, which is
what makes the one apparently irreversible step reverse like everything else.

Exclude by extension only:
  .svg  .ts  .file  .msg  .ico  .dds  .xbm  .pyc  .cur

Report the count and bytes each rule removes and the surviving count and bytes. Expect roughly
41,700 files and about 0.5 GB.

Add nothing to that list. Every arguable format — .png above all, all 54,899 of them — survives
to triage, where changing my mind is free. If you believe another extension belongs here, tell
me rather than adding it.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** ~41,700 excluded, and `.png`, `.gif`, `.webp`, `.bmp` all still present.

---

# Step 9 — Phase 2a verification read

**Effort:** `high` · run in the background · **1.5–2 h**, the largest I/O in the project

```text
Read PLAN.md "Phase 2a" in full, including the adopt-objective/recompute-subjective paragraph
and the orientation gate. Read step 1's SPIKE C verdict. Read docs/preprocessing.md ONLY for
its list of quality scalars — as a SPECIFICATION of what to compute, never as code to import
and never as values to adopt.

One long pass. It will be killed and restarted; design for that from the first line.

A. Re-hash every MediaVault object and compare against its filename, which IS its SHA-256.
   About 420 GB and the only large read in the project. Record pass or fail per asset. Any
   mismatch is a hard error, listed by name — never silently skipped, never repaired.

B. Read the derivative tree (21.65 GB) and, from the 1536px derivative, compute in ONE decode
   per asset: pHash, dHash, ThumbHash, and every quality scalar in v1's 18-scalar list. Do not
   adopt v1's asset_features values — they are relative judgements that only mean anything when
   every value comes from one implementation, and cover ranking compares members within a
   stack. Objective readings (GPS, ISO, lens, capture time) were already adopted in step 3;
   these are the subjective ones and they get recomputed.

C. If SPIKE C found orientation baked in inconsistently, regenerate the 1536px substrate from
   the objects during pass A instead of adopting it, and say so explicitly in your report.

Constraints:
- One or two reader threads against G:, about twelve decode workers. 16 CPUs, one disk head.
- EVERY decode gets a wall-clock timeout, an output size cap, and a memory cap. F55 is a HANG,
  not a crash — a timeout is the only thing that saves the run.
- Progress commits at row granularity via file.state. Killing the process loses at most one
  batch and re-running resumes.
- feature_ver is per feature, not one global string, and records which substrate produced each
  value: 1536px derivative, fresh decode, or RAW embedded preview. Sharpness off a 1620px
  preview is not the same number as off a 5184px decode.
- One process, one lock file. No job ledger, no leases, no worker runtime — those exist in v1
  so an HTTP API can enqueue work, which does not happen here.
- Print elapsed, throughput and ETA every 60 seconds so I can leave it running.

Benchmark on 500 assets and give me the projected wall time BEFORE starting the full run.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** zero hash mismatches across 146,034 objects. Then reload the grid — every tile should
now paint a ThumbHash placeholder instantly.

---

# Step 10 — Triage engine and survey

**Effort:** `high` · run in plan mode first · ~2 h

Backend only. Nothing visual.

```text
Read PLAN.md "Triage" in full. No UI in this step.

- Rule engine: ordered triage_rule rows evaluated top-down, first match wins, triage_override
  rows beating every rule. Predicates are STRUCTURED — (column, operator, value) tuples —
  never SQL strings from the client and never eval. Ordering is what lets me say "exclude
  everything under node_modules, except this one folder".

- One query that returns, for the current rule set: kept count and bytes, excluded count and
  bytes, and the same four numbers for a CANDIDATE rule that has not been saved. It must be
  fast enough to recompute on every keystroke over 1.38M rows on NVMe. Show me the timing.

- Survey queries behind each of the eight screens, each returning both the aggregate rows and a
  keyset-paged list of matching files, using the same paging contract as /api/photos so the UI
  can reuse the grid.

- Header-only dimension probe. Screens 0-2 need only path and extension and run on the full
  inventory with no reads. Screen 3 needs width and height, which files outside MediaVault do
  not have. Add a probe that reads image HEADERS only — never a full decode — and fills
  width/height for whatever survives screens 0-2. Report how many files that is and how long
  the probe takes. It is deliberately positioned after the two most decisive screens so it only
  ever runs on the remainder.

- Write endpoints live in their own route namespace (/api/triage/*) and are the only writes in
  the system. They write state.sqlite3 and nothing else.

Tests: rule ordering; override precedence over rules; a rule that excludes a tree followed by a
later rule that re-includes a subtree of it; recompute latency under 1.38M rows; and an
assertion that no triage code path opens any file under the photos root for writing.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** candidate-rule counts recompute in well under 100 ms; the exclude-then-re-include
test passes; the probe's runtime is known before you commit to step 11.

---

# Step 11 — Triage screens

**Effort:** `medium` · run in plan mode first · ~2 h

```text
Read PLAN.md "Triage" — the screen table in particular. Reuse the grid from step 6: same
virtualised component, same keyset paging, same thumbnails, same reveal. Triage is a mode of
the same app, not a second app.

Eight screens in PLAN.md's order — 0 no image content, 1 container directories, 2 file type,
3 dimensions, 4 exact-dimension clusters, 5 EXIF camera presence, 6 source folder, 7 remainder.

Each screen shows:
  - the rule as an editable predicate
  - live counts of what it would exclude and what it would keep, files and GB, updating as I
    edit and BEFORE anything is saved
  - a virtualised contact sheet of EVERY match, not a sample. Nothing reaches the vault without
    having been seen at thumbnail scale at least once.
  - a per-file override toggle
  - an explicit confirm. Nothing applies until confirmed.

Screen 0 is a table, not a contact sheet — you cannot look at a .d.ts.
Screens 3 and 4 are what actually decide the 54,899 .png files: make each dimension bucket and
each exact-dimension cluster click straight through into the contact sheet for that set.
Screen 5 is a sort, not a filter — messaging apps strip EXIF, so absence of a camera tag is not
evidence of anything. Use it to order the remainder for review.
Run the step 10 dimension probe automatically when I leave screen 2, with a progress bar.

Add nothing else. No settings page, no undo-history UI beyond flipping a rule, no keyboard
shortcut system unless a screen is genuinely unusable without one.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** you can work screens 0 through 7 end to end and land on a kept-file count you believe.
That count is what step 12 and step 14 operate on.

---

# Step 12 — Phase 2b gap fill

**Effort:** `high` · run in the background · ~1 h, dominated by the step 7 gap

```text
Read PLAN.md "Phase 2b" in full.

This is the only step that reads the photos root, and it reads it read-only. Nothing there is
written, moved, renamed or deleted.

Two populations:

1. About 1,635 recoverable preprocessing failures — roughly 1,464 real videos, 146 .dng, 25
   .jpg. Read these from the MediaVault OBJECT, not from the photos root: already local, already
   verified in step 9. Video gets an ffmpeg poster frame; DNG goes through libraw; JPEG is a
   normal decode. v1 failed these because it lacked those decoders, not because the files are
   bad — every video and every DNG failed, which is a decoder gap, not a bad run.

2. Everything step 7's inventory found with no MediaVault asset AND that survived triage. These
   read from the photos root into the staging directory.

Decode exactly once per file. From that single pixel array produce all of: the 1536px
substrate, the 384px thumbnail on E:, ThumbHash, pHash, dHash, and the quality scalars.

RAW: extract the embedded preview, never decode sensor data — about 50 ms against 1 to 3
seconds. Record in feature_ver which path produced the numbers.
exiftool through -stay_open: one process, not one spawn per file.

Constraints:
- One or two readers, about twelve decode workers.
- Hard wall-clock timeout, output size cap and memory cap on every subprocess. F55 and F56 are
  the same underlying problem: hostile input meeting an unbounded subprocess.
- Idempotent and restartable at row granularity via file.state. One process, one lock file.

Benchmark on 500 files, report the projected wall time, then run.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** every triage-kept file has bytes either in MediaVault or in staging, and a thumbnail.

---

# Step 13 — Deletion gate

**Effort:** `high` · run under ultracode · ~30 min

Verification only. Nothing is deleted, published, or uploaded — which is exactly why a fan-out
is safe here and worth paying for. This report is what authorises step 14, and the failure mode
is a check that looks clean.

```text
Run this step under ultracode.

Read PLAN.md "Gate: G:\photos becomes deletable".

Run all three checks and give me a report I can sign off on. This step changes no files, and
neither does anything you spawn: every agent in this step is a reader. Do not parallelise the
scandir in check 3 — it is one walk of 1.38M files on a USB HDD and splitting it thrashes the
head. The fan-out is for attacking the results, not for producing them.

1. Every MediaVault object re-hashed and matching its filename — that is step 9's result, so
   re-read it rather than repeating 420 GB — AND every gap-filled object from step 12 matching
   its recorded sha256.

2. Every origin row that survived the Phase 1 prefilter has a file row in state 'read' or
   'adopted'. List any that do not, with their paths.

3. restic's path list diffed against a fresh scandir of the photos root, with every discrepancy
   named and explained: permissions, reparse point, long path, in use.

Then attack each of the three results before reporting. Send independent readers to REFUTE the
claim that the check passed, each with a different lens — does the query measure what the
sentence claims, does the number survive a differently written query, does a clean result here
depend on an earlier step's number that was itself never re-verified — and have them default to
"refuted" when uncertain. Attack check 1 hardest: it re-reads step 9's recorded result rather
than repeating 420 GB, so a stale, partial or mis-joined read of that result would look exactly
like a pass.

State plainly, in one sentence, whether all three passed. Any check that is not clean BLOCKS
step 14 — say so rather than qualifying it. A check that passed only weakly under refutation is
not clean.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** an unambiguous pass on all three, with the refutation verdicts attached. This is the
last checkpoint before anything becomes irreversible.

---

# Step 14 — Phase 4 promote

**Effort:** `xhigh` · run in plan mode first · dry run before anything executes

The only step in the project that deletes. It operates on 420 GB with one other copy.

```text
Read PLAN.md "Phase 4", step 1's SPIKE B verdict, and step 13's report. If step 13 did not pass
all three checks, stop and tell me — do not proceed.

Write the promotion, then show me a DRY RUN before anything executes.

- Accepted adopted assets: create an NTFS hardlink from <vault_root>\<aa>\<bb>\<sha256><.ext> to
  the existing MediaVault .blob. Same volume, so zero bytes move — seconds, not hours, for
  420 GB. Set the read-only attribute on the new name. VERIFY the new name is readable and
  hashes correctly BEFORE unlinking the MediaVault directory entry. Then unlink it: link count
  falls to 1 and the data persists under the extension-bearing name, which is how the
  .blob-breaks-Explorer problem is solved without a copy.

- Accepted gap-filled assets: rename out of staging with NO-REPLACE semantics. If the target
  exists, the bytes are already published — drop the staging copy. Never overwrite a published
  object.

- Excluded assets: unlink the MediaVault object. Before ANY unlink, prove the resolved path is
  under the MediaVault objects root or the staging root, and that its sha256 is explicitly
  marked excluded by the saved rule set. Nothing else may ever be unlinked, under any
  condition, including an empty or malformed rule set.

- Default mode is --dry-run and prints exactly what it would do. The destructive mode requires
  an explicit flag AND prints a summary I have to confirm interactively.

- Restartable: a crash mid-run must leave every asset either fully promoted or untouched, never
  half. Say how you guarantee that.

- Append-only log of every unlink with sha256, path, and the rule that excluded it. Never
  truncated, never rotated by this program.

After promotion, change reveal_root in config.toml from the MediaVault objects root to the vault
root, and confirm that clicking a photo in the grid still opens Explorer on the right file.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** the dry run's counts match your triage numbers exactly. Read them before you pass the
destructive flag. Reversal of a wrong exclusion is one `restic dump` — but only while the repo
still holds it, which is why step 16 comes before any deletion.

---

# Step 15 — Phase 5 group

**Effort:** `high` · ~15 min, pure DB

```text
Read PLAN.md "Phase 5".

Pure database work. Minutes, not hours.

- RAW+JPEG pairing on (directory, stem) plus a corroborating EXIF timestamp. The Lumix card is
  P1080096.JPG alongside P1080096.RW2 throughout, so this is near-certain evidence, not
  similarity. Expect roughly 14,000 tiles to collapse. If it finds nothing, something is wrong:
  v1's pairing returned zero groups and that was the symptom of its empty perceptual_hash
  starving a multi-signal test, not the truth about the corpus.

- Representative selection: highest pixel count, then largest bytes, then has EXIF. Unedited
  beats edited.

- sort_key is the capture timestamp. NEVER a dense rank — a rank forces renumbering every row
  on every future import.

- Compute and STORE perceptual near-duplicate groups, but do NOT collapse tiles on them. Burst
  frames of one scene look near-identical to pHash and over-grouping hides photos. v1's stacks
  are recorded as built-but-uncalibrated (F57: no labelled-corpus calibration exists). Ship
  exact plus RAW/JPEG, look at the result, then decide.

- Grouping must be incremental: a new photo joins a component, merges two, or forms its own. No
  phase may be O(total corpus). Write the test that proves adding 100 photos to a 30,000-photo
  catalog does work proportional to 100, not to 30,100. This is the test that keeps the
  "adding a folder is fast" requirement true once features exist.

Report the tile count before and after pairing, and show me the top 20 collapsed groups so I can
eyeball them.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** ~30,000 tiles. Non-zero RAW/JPEG groups. The incremental-cost test passes.

---

# Step 16 — Export the origin map, then upload

**Effort:** `medium` · ~20 min plus your upload time

```text
Read PLAN.md's Gate section and the origins.jsonl row of the storage table.

Export <vault_root>\origins.jsonl: one line per distinct file —
  {sha256, ext, size, taken_at, taken_src, paths: [every original path under G:\photos]}

This is the one-to-many store that has to survive the source being deleted, so it must be
readable with nothing but a text editor. No database required, no schema knowledge required, no
compression.

Verify it: reconstruct the origin table from the JSONL into a scratch database and diff it
against the live one. The path sets must match exactly. Report the diff, even if empty.

Then tell me exactly what to upload, in what order, and precisely what I must confirm has landed
before deleting anything locally. Remember the restic repo and the photos root are on the SAME
physical disk — two copies on one USB HDD is one hardware failure away from zero, so deletion is
gated on the upload completing, not on restic existing.

Do not upload anything yourself. Do not delete anything.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** the reconstruction diff is empty. Then you upload, you confirm it landed, and only
then is `G:\photos` deletable.

---

## After step 16

The three things you asked for exist: triage happened, the grid is one infinite deduped page,
and clicking a photo opens Explorer while `origins.jsonl` holds every original path.

Four decisions from `PLAN.md` § "Open decisions" are still open and none of them block the
above. The one worth doing early is **restic verification** — `restic check --read-data` before
the repo becomes the backup of record. It is hours of reading and the only way to know the repo
is sound. Run it yourself with your own password.

Feature work after that arrives as a migration plus a per-feature version bump, computed from
the 1536px substrate rather than from 419 GB of RAW. That is what the substrate was for.

---

*AI-assisted: review, test and fact-check before relying on any step's output. Step 14 in
particular deletes data — read its dry run.*
