# Build prompts

Eighteen prompts, run one at a time, in order. Each is self-contained: start a **fresh
session** for each, because `CLAUDE.md` loads automatically and the prompt names the only
other files that session should read.

Every prompt ends at a **gate** — a fact you can check before spending the next hour. If a
gate fails, stop and fix the plan rather than continuing; several later steps read earlier
verdicts.

> **Revised 2026-08-01 after step 1's spikes.** Steps 0 and 1 are done. Three structural
> changes came out of them:
>
> - **The upload moved ahead of the promote.** It is now step 13b and it is a *precondition*
>   of step 14, not a follow-up. Step 14 unlinks the last same-disk copy; running it before an
>   off-device copy exists is the plan's own single-USB-HDD rule broken by its own build order.
> - **Step 16 is new** — a post-promotion verification sweep. Step 14 destroys names and
>   verified nothing.
> - ~~**Step 7 roughly quadruples**, from 2–4 h to 9–13 h, because `restic backup` needs
>   `--force`.~~ **Superseded twice.** The `--force` re-read was removed on 2026-08-01 once the
>   repo was opened and found to hold only one read. Step 7 then ran on 2026-08-02 and took
>   **12h50m** anyway — the time went into hashing and per-file verification, not `--force`.
>   Step 7's top-up gave the repo its second read, but **`--force` is a scrub, not a tax on
>   every pass**: it defeats change detection, which only applies to files already in a parent
>   snapshot. **Adding new photos never needs it.** See PLAN.md "Phase 0" for the table.
>
> Numbering is otherwise unchanged, so every "step N" reference elsewhere still resolves.

---

## Effort ladder

Set the effort level in your client before sending. The ladder used here:

| Level | When | Steps |
|---|---|---|
| `low` | Mechanical, fully specified, nothing to decide | 0 ✅, 8 ✅ |
| `medium` | Normal implementation against a clear spec | 1 ✅, 2 ✅, 3 ✅, 5, 11, 13b |
| `high` | Correctness-critical, or a design decision inside it | 4 ✅, 6, 7 ✅, 9, 10, 12, 13, 15, 16 |
| `xhigh` | Irreversible, operating on data with no second copy | 14 |

Effort is how hard one pass thinks. Plan mode, background and **ultracode** are execution
modes, orthogonal to it — any of them composes with any level.

Run steps **6, 10, 11 and 14 in plan mode first** — approve the approach, then let it build.
Step 14 is the only one that deletes anything; it is written to be dry-run by default.

Steps **7, 9, 12 and 16** are long (hours; step 7 is now overnight). Have them run in the
background and print a throughput line, so you can leave them.

**Ultracode** earns its cost where a claim's failure would be expensive and invisible, and the
check costs only tokens.

- ~~**Step 1**~~ — **done 2026-08-01.** All three verdicts changed the plan; two of the three
  premises were refuted outright. See the step for what they were.
- **Step 13** — the last checkpoint before anything irreversible, and it writes nothing, so a
  fan-out costs only tokens. A check that *looks* clean is the entire failure mode. Step 1
  demonstrated the value: every one of its three spikes produced a verdict that survived its
  own author and died to an independent reader.

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
- **Every restic *read* command takes `--no-lock`.** The default writes a lock file into the
  repository, which silently breaks the read-only posture toward `G:\ResticPhotos` on every
  invocation. `cat`, `ls`, `dump`, `find` — all of them.
- **Nothing under `G:\` gets deleted or renamed** until step 14, and step 14 requires an
  explicit flag.
- **Every step ends committed and pushed** to the one `build/rebuild` branch — the instruction
  is repeated at the foot of all 17 prompts. Stage by explicit path: a reflexive `git add -A`
  in this repo is precisely how hard rule 5 gets broken. The `pre-commit` hook described below
  refuses newly added media, `*.sqlite3`, `*.jsonl` and `*.log`, but it is a backstop, not a
  licence to stage blindly.

- **Threads on `G:` — split by what is actually the bottleneck.** "G: is a USB HDD, so one
  reader" is right for *bandwidth*-bound work (step 9's 420 GB sequential hash) and wrong for
  *latency*-bound work. Step 3 measured, on this volume: listing a sharded tree 101 entries/s
  serial against 394/s at 32 threads; reading small JSON files 41/s serial against 86/s at 32.
  Anything that touches many small files or many directories wants 16–32 threads in **one**
  process. This is about threads, not about the agent fan-out ruled out above.
  Step 5 measured both halves on the object store and the derivative tree: 32 threads over
  103,207 files of 9.8 KB ran 90–102 files/s, while **one** reader over large objects ran
  62.0 MB/s against **56.7 at two** — a second stream is a 9% loss, not a gain. So the split is
  real in both directions, and "one reader" for bandwidth-bound work now means one, not "one or
  two".
- **Creating many small files on `G:` is the expensive direction, and a small benchmark of it
  lies.** 1,500 gzip files measured 880/s at 16 threads because the OS write cache swallowed
  them whole; the sustained rate once it must flush is 4–8/s. Benchmark writes at a scale that
  exceeds the cache, or do not quote the number.

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

1. ~~**`origin.content_key` → `restic_key` + `origin.sha256`.**~~ **SUPERSEDED by step 1's
   SPIKE A, 2026-08-01. Do not implement it.** There is no pre-read dedup key at all: a stored
   restic blob list is the chunk list from the last time restic *read* the file, so equal lists
   do not imply equal bytes. `restic_key` and its index are gone from the schema. `origin`
   gains `nlink` and `file_id` instead, because the thing that actually needs distinguishing is
   *two names for one physical file* from *two copies*. `file` is keyed on `sha256`, which was
   right for the right reason.
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

# Step 1 — Three premise spikes — ✅ **DONE 2026-08-01**

**Do not re-run this.** The verdicts are folded into `PLAN.md`; the prompt is kept for the
record. Summary of what they found, because steps 7, 9 and 14 all read them:

- **SPIKE A — restic blob lists: REFUTED, fatally.** The node shape is exactly as assumed and
  it does not matter. A stored `content` list is the chunk list from the last time restic *read*
  the file, so `exiftool -P` at constant tag length leaves size and mtime bit-identical, restic
  reports `files_unmodified`, and `restic restore` returns **stale bytes**. The chunker
  polynomial is also write-path-scoped, not repo-scoped. Phase 0 now uses
  `restic --no-lock dump --archive tar` for full-file SHA-256, cross-checked against a disk
  walk. The *documented fallback* (size-grouping) was mis-costed by 20× and is also gone.
- **SPIKE B — hardlink then unlink: mechanism CONFIRMED, plan step REFUTED.**
  `CreateHardLinkW` needs no privilege and cross-volume fails loudly with no copy fallback. But
  read-only lives in the shared MFT record, so the plan's stated ordering deadlocks itself with
  `ERROR_ACCESS_DENIED (5)`; and `ERROR_ALREADY_EXISTS (183)` is returned identically for
  "already my own hardlink" and "an unrelated file" — the only resumable reading of it destroyed
  the only copy of a test file. Step 14 is rewritten around a state classifier.
- **SPIKE C — derivative orientation: INCONSISTENT.** v1 transposes the extracted embedded
  preview only. `.rw2` and `.jpg` are correct at population scale (29,450/29,450,
  direction-verified). Every `.arw` is wrong. **1,486-asset targeted repair, not a
  103,207-asset regeneration** — three of them are published upside down and are invisible to
  aspect-based detection.

Also measured: the plan's 110 MB/s was a sequential nominal. Real throughput over the object
store is **22–35 MB/s**, so every hour estimate in the original build was 3–5× optimistic.

> **Superseded by step 5 (2026-08-01): 62.0 MB/s at one reader**, over a seeded random sample of
> 1,200 objects spanning the real size distribution, hashed as step 9 will hash them. The
> 22–35 MB/s reading is left standing as what step 1 saw; the two have not been reconciled, and
> the difference in what was sampled is the first place to look. Estimates elsewhere in this
> file now use 62.0.

<details><summary>Original prompt, for the record</summary>

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

</details>

**Gate: passed.** Three verdicts in writing, each attacked by independent readers, all three
contradicting `PLAN.md` and all three folded back into it. Worth recording that the gate's own
predicted failure branches were all wrong: "A fails → fall back to size-grouping" (that fallback
is 20× mis-costed), "B fails → Phase 4 becomes a copy" (B's mechanism passed; its *ordering*
failed), "C fails → step 9 grows by a full regeneration" (the evidence says targeted repair).
Anticipating the failure is not the same as anticipating its shape.

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
  their indexes. Nothing more. Note `origin` has NO restic_key column — step 1's SPIKE A killed
  that key and PLAN.md's Schema section is already corrected. It carries `nlink` and `file_id`
  instead. If you find a draft anywhere that still mentions restic_key, it is stale.
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
   the asset the path resolved to, seen_at. Leave nlink and file_id null — step 7's disk walk
   fills them; MediaVault's sidecars do not carry them.
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

**Done 2026-08-01.** Exactly 146,034 `file` rows and 251,087 `origin` rows over 251,824
observations; 0 objects missing from disk, 0 paths claimed by two assets, 0 malformed sidecars.
Capture time is **38,200 (26.2%), not 38,767** — the 567 shortfall is 560 `0000:00:00 00:00:00`
EXIF null sentinels plus 7 odd formats, and a null sentinel is not a date. The ambiguous flag is
ignored, so the failure the gate was written to catch did not happen. ~45 min, 37 of them the
sidecar read.

Two things the prompt got wrong, both now measured and recorded in `PLAN.md` § build order:

- **The `records` sidecars are the *slow* path, not the cheap one.** Reading 146,034 of them
  sustained ~65/s for 37 min. The manifest scan the prompt was avoiding reads the same rows in
  seconds — provided nothing asks SQLite to *join* two of its tables, which costs a random seek
  per row and measured 4–11 rows/s.
- **The exiftool readings were NOT laid out under `meta_root`.** They exist — 74.8 MB of
  `raw_metadata_json`, one per asset — but writing them as 146,034 gzip files measured 4–8/s
  sustained, i.e. 5–10 h. They are behind `python -m photolib.adopt_mediavault --meta`, which is
  resumable. They are also a curated ~32-tag subset, not full `exiftool -a -G` output, so **step
  12 must generate the real sidecars regardless** — do not treat a populated `meta_root` as done.

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
         251,087 origin rows step 3 imported (confirmed exact) — NOT 1.38M, which is step 7's restic
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

**Done 2026-08-01.** All 146,034 files carry a tier, and `photo` holds one row each.
`exif:DateTimeOriginal` 37,840 · `exif:CreateDate` 360 · `exif:DateCreated` 5 · `filename` 107 ·
`mtime` 107,721 · `none` 1. Chain step 1 reads **37,840, not 38,767** — the gate's number was the
manifest's `capture_time_text` count, and 562 of those are unusable (560 `0000:00:00 00:00:00`
sentinels plus two ambiguous list reprs). EXIF across steps 1–2 is 38,205. Both halves of the
identity hold, the shape counts sum to 251,087 exactly, and the independent recompute diffed
**empty** on all six cells. Migration 003 adds a nullable `taken_offset`; 3,788 assets recorded
one and its absence never downgrades a date. ~40 min.

The ultracode note above held up: enumeration beat sampling. Masking every digit run in all
251,087 relative paths gave 127,924 shapes summing exactly to the row count, and the ranking is
directory-diluted enough (top 50 = 39.07%) that a top-N cutoff would have been the wrong unit —
the sum is the proof, not the cutoff.

Three things worth carrying forward:

- **Hit count is anti-correlated with truth here.** Ten candidate rules were scored against files
  that also have EXIF, agreeing to the day. `photos-backup-14-03-2023\` fires **30,293 times,
  more often than the winning rule, and is wrong every single time** — it is the date the backup
  was taken, not the photo. So is `photos-03-04-23\` (20,736 at 0.0%) and `lumix f 7-15-26 sd\`.
  Only `YYYYMMDD_HHMMSS` in the **basename** survived, at 27,290/27,388 = 99.6%; 91 of its 93
  misses are ±1 day on `.mp4`, where the container time is UTC and the filename is local. The
  date-only variant looks equally good in aggregate and is not: its 58 marginal hits are
  stock-photo ids, and none has EXIF to validate against.
- **The filename tier is small — 107 files.** Nearly every `YYYYMMDD_HHMMSS` name also has EXIF,
  so the tier does real work only where EXIF is absent. Its value was proving which patterns are
  dates, which is what kept 51,029 backup-date paths out of the catalog.
- **`capture_iso` was too narrow and step 3's numbers were slightly wrong because of it.** Seven
  assets held a capture time in a spelling it rejected — ctime(3), and a time with seconds
  omitted — and the mtime tier had been dating them **up to 12.6 years late**. Five are now
  recovered. Step 3's "7 odd formats" line above is therefore 2, not 7. A future clean
  `adopt_mediavault` run picks these up at source; the existing catalog got them via step 4,
  because adopt never updates a row it already inserted.

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
- ~16–32 reader threads. **This reverses the original advice** — see "Threads on G:" in the
  standing rules. 103,207 small files is latency-bound, not bandwidth-bound, and step 3 measured
  2–3.9x from concurrency on exactly this shape of work. One or two readers is right for step 9's
  420 GB sequential hash, not for this.
- Idempotent: re-running copies only what is absent.
- Generate NOTHING. Files with no 384px derivative stay recorded as missing and are step 12's
  problem.
- Copy the .arw thumbnails too, even though step 1's SPIKE C proved they are rotated wrong.
  Step 9 replaces them for 1,486 assets. Copying now and fixing later beats special-casing here
  — but record the count you copied for .arw so step 9 can reconcile against it.

Report: copied, skipped-missing, checksum mismatches, total bytes, wall time, and the
throughput you achieved so I can calibrate the 420 GB pass in step 9. That calibration matters
more than it used to: PLAN.md's original 110 MB/s was a sequential nominal and the real figure
measured 22-35 MB/s, so step 9 was re-estimated from 1.5-2 h to 5-6 h. Your number here is the
check on that.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** ~103,207 thumbnails on `E:`, zero checksum mismatches. Note the MB/s — step 9's
estimate depends on it.

**Done 2026-08-01.** **103,207** thumbnails on `E:`, **zero** checksum mismatches, zero ready
rows whose file was absent. 1,006,445,644 bytes on disk, which equals the manifest's summed
`byte_size` for those rows to the byte. 19m of wall clock at 32 reader threads: 90–102 files/s,
sustained ~0.9 MB/s. `.arw` **2,346** copied — that is every `.arw`, and it is the number step 9
reconciles against. It is **not** in tension with step 9's 1,486-asset repair set: 1,486 is the
subset with `orientation_text <> '1'`, and the other 860 are orientation 1, already correct and
needing no repair. 42,827 rows not ready, exactly the error population, and nothing was
generated for them. The extension split of what was copied is
`.png` 54,889 · `.jpg` 27,951 · `.rw2` 13,893 · `.arw` 2,346 · none 2,344 · `.gif` 817 · a tail
of 15 more.

**Step 9's 5–6 h re-estimate is too pessimistic, and 0.9 MB/s is not the reason.** The
thumbnail figure is an IOPS measurement wearing a bandwidth unit — 9.8 KB mean file size, so
it reports seek latency and says nothing about sequential throughput. Measured step 9's actual
shape directly instead: SHA-256 over a seeded random sample of 1,200 objects drawn from the
real size distribution, read-only.

| Readers | MB/s | files/s | the object store projects to |
|---|---|---|---|
| 1 | **62.0** | 22.6 | **2.0 h** |
| 2 | 56.7 | 17.5 | 2.2 h |

So: **2–3 h, not 5–6.** Three things this settles.

- **Two readers is slower than one**, by 9%. The "one reader for bandwidth-bound work" half of
  the standing rule is now measured on this volume rather than assumed. Step 9 should use one.
- **A random sample is the pessimistic case** — step 9 walks the shard tree in path order, and
  the head follows it. 62 MB/s is a floor, not a midpoint.
- **The object store's median object is 20 KB against a 3.09 MB mean.** That skew is why one
  number cannot serve both passes. A large-file-only probe on the same disk read 117.9 MB/s;
  the same disk does 0.9 MB/s on 9.8 KB files. Neither is wrong and neither is step 9's number.

**`420.17 GB` in `PLAN.md` is binary — 420.17 GiB = 451.2 decimal GB**, and `sum(size_bytes)`
over `assets` confirms it to three digits. Anything dividing by a MB/s figure must use 451.2e9,
or it undercuts the projection by 7%; the hours in the table above already do. Flagged because
the two readings differ by 31 GB and look for all the world like a data gap.

Two notes for later steps:

- **Presence on `E:` is the record of which files have a thumbnail — there is no catalog
  column and no migration here.** Step 12's gate and the grid's `/t/<sha256>.webp` both answer
  from the filesystem, and enumerating 103,207 files on NVMe takes 0.5 s. A column would be a
  second copy of a fact the disk already holds, free to drift from it.
- **The 384px tier is 1:1 with assets** — 103,207 ready rows, 103,207 distinct `asset_id`,
  103,207 distinct `relative_path_text`, and every one of those sha256s is already in `file`.
  No dedupe was needed and none is hidden in the counts.

---

# Step 6 — The grid

**Effort:** `high` · run in plan mode first · ~2 h

This is the deliverable you asked for, and it arrives before any expensive pass runs.

```text
Read PLAN.md "Grid" in full. Read docs/review-api.md ONLY for its security-posture section.
Do not copy code from v1/ — read it for what went wrong, not for what to reuse.

Build the read-only grid. One process, four routes, no framework, no bundler:

  GET  /                                   the page
  GET  /api/photos?before=<sort_key>&before_id=<id>&limit=500&kind=image
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
  - keyset paging with an integers-only payload — no OFFSET, ever. **The cursor is the pair
    `(sort_key, id)`, not `sort_key` alone.** Step 4 measured 146,034 photo rows over only
    27,076 distinct sort keys: **90.5% of rows share their key with another row**, and the
    largest single tie is 9,143 rows, because 73.8% of the library is dated by a bulk-copy
    mtime and thousands of files land on the same second. A one-column cursor against a
    500-row page cannot page through a 9,143-row tie at all — it either repeats the same page
    forever or skips 8,643 photos. `WHERE (sort_key, id) < (?, ?)` against the existing
    `(sort_key DESC, id DESC)` index is the whole fix, and `photo.id` being a primary key is
    what makes the pair unique. Undated photos sit on the sentinel `sort_key = '-'`, which
    collates below every digit and so lands last under DESC — one row today, more once the
    restic inventory widens the corpus.
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

**Done 2026-08-01.** `photolib/grid.py` + `photolib/reveal.py` + three static files, stdlib only.
97 new tests, 218 in the suite. **Cold first paint, fresh server process per run, median of 5:
43.4 ms at a synthetic 100,000 rows and 29.1 ms against the real 146,034** (assets 2.2 ms, the
500-row page 12.7 ms, 60 thumbnails over 6 connections 14.1 ms for 755 KB). Browser end to end at
1280×720: **43.5 ms to first paint, all 53 above-the-fold tiles by 95.7 ms, 0 of 53 from cache**;
a second pass transfers **0 bytes, 53 of 53 from cache**, so the content-hash + `immutable` claim
is measured rather than asserted.

Five things worth carrying forward:

- **`kind` has three values and the route table's wording hides 16,388 photos.** `file.kind` is
  `image` 109,350 · `raw_image` 16,388 · `video` 20,296. `kind=image` read literally omits the
  entire Lumix and Sony corpus. `image` now expands to `('image','raw_image')` wherever it
  appears; `video` is what "hidden by default" is for. RAW-versus-not is an extension property,
  so it belongs in a later facet rather than as a second meaning for this one.
- **The space is the case that breaks, not the comma.** `list2cmdline(["explorer.exe",
  f"/select,{path}"])` — v1's form at `review_api.py:465` — emits `explorer.exe
  "/select,G:\a b\c.jpg"`, quoting the whole switch token, and Explorer's non-CRT parser then
  fails to see a switch at all. The comma survives that form untouched. There is no argv shape
  that works, so `lpCommandLine` is built directly (`"<exe>" /select,"<path>"`) and the module is
  passed as `executable=`, i.e. lpApplicationName, which also closes `F50`'s CWD search. Verified
  against real Explorer for a space, a comma, and both.
- **Containment is by `os.path.samestat` up the parent chain, not by string prefix.** A
  `startswith` check passes `objects_evil` against a root of `objects`; identity does not. The
  refusal list is drive-qualified, UNC, root-anchored-without-a-drive (`is_absolute()` is
  **False** for `\objects\x` while the join still discards the base — that is `F05`'s exact
  shape), `..`, junction, missing, and directory.
- **`next: null` has to come from a `limit + 1` probe.** Inferring exhaustion from
  `len(photos) < limit` is wrong exactly when the corpus is a multiple of the page size, which is
  a bug that reproduces only at particular row counts. There is a test at 1,000 rows and limit
  500.
- **A tab that loads while hidden reports `clientWidth` 0**, and packing against that gives one
  tile per row at a few pixels with nothing to correct it. A `ResizeObserver` on the mount element
  fixes it where a window `resize` listener cannot, because the element acquiring its first real
  width is not a window resize. Found by running the client in a pane that never becomes visible.

Two limits stated rather than implied. **There are no automated client tests** — "no npm, no
bundler" rules out a JS runner — so the layout maths was verified by extracting `packRows`,
`aspect` and `visibleRows` from the shipped source and running them under `node` over 146,034
items at five widths, asserting contiguity, exact row width, monotonic tops and `visibleRows`
against a linear scan at 300 offsets each; the runtime `?debug=1` overlay carries the same
assertions. And **the ThumbHash decoder is unverified**: `th` is null in all 146,034 rows, so the
branch has never run. Step 9 is what proves it.

Also measured: **22,531 stills have no thumbnail** (22,059 `.svg`, then `.msg` 198, `.dng` 146,
`.jpg` 25) and render as neutral tiles. **Step 8 does not make them go away** — it writes
`triage_rule` rows to `state.sqlite3`, and `/api/photos` joins `photo` to `file` on `kind` alone,
so an excluded file keeps its `photo` row and its tile. Applying triage to the grid is a decision
for step 11, and it is a real one: either the grid filters on the rule engine's verdict, or
something rebuilds `photo`. Neither happens for free.
Every still that *does* have a thumbnail has non-null `width`/`height`, zero exceptions, so
the fallback aspect never applies to a tile showing an image. The row-value cursor
`(sort_key, id) < (?, ?)` gives `SEARCH p USING INDEX photo_sort (sort_key<?)`, a seek rather than
the ordered scan the expanded `OR` form produces, and a test pins the plan because there is no
index on `file.kind` and a planner that drove the join from `file` would scan it whole.

---

# Step 7 — Phase 0 inventory from restic — ✅ **DONE 2026-08-02**

**Do not re-run this.** Ran in 12h50m against a ~10.2 h estimate. `photolib/inventory.py` and
`photolib/restic_repo.py` implement it as five resumable subcommands (`a`–`e`); the work
database is `E:\photolib\phase0.sqlite3` and is regenerable. Results are folded into `PLAN.md`
"Phase 0"; the prompt is kept below for the record.

**The gate passed. Zero same-size same-mtime hash disagreements across all 1,374,328 files.**
Every file node in the snapshot was dumped, hashed and compared against an independently
computed disk hash — not a sample.

| phase | budget | actual | outcome |
|---|---|---|---|
| A establish | 19 min | 33 min | every established fact reproduced; byte arithmetic closes exactly |
| B fail fast | 15 min | 25 min | 207,366 files compared, 0 hard stops |
| C inventory | 4.4 h | 4h33m | 1,374,328 hashed, 0 errors, `origin` written |
| D verify | 5.3 h | 7h18m | full `--read-data` + per-file dump, 0 hard stops |
| E top-up | 3 min | 2 s | 39 files, snapshot `1e80c50e` |

**Headline results, because steps 8, 9, 12 and 13 all read them:**

- **All 251,087 adopted hashes were re-derived from the bytes and every one matched.** An
  independent cross-check of v1's hashing across 90% of the corpus, at no extra cost.
- **`nlink > 1` is zero.** No hardlinks anywhere, so `home-chris arch backup` holds no
  hardlinked backup generations and the duplicate map counts real distinct objects:
  **586,530 redundant paths carrying 603.8 GB**.
- 787,798 distinct SHA-256 across 1,374,328 paths. `file` now holds 146,034 `adopted` +
  641,764 `pending`.
- 0 read errors; the 8,052 reparse points were never opened.
- Both unexplained counts closed. The **737** is 251,824 distinct `source_version_id`
  resolving onto 251,087 distinct `source_file_id` and 251,087 distinct paths — a version
  count against a path count — with **0** adopted paths lacking an `origin` row. All **356**
  of v1's hash-error files hashed successfully this pass.
- Measured rates, for later steps: disk big 80.3 MB/s at 4 workers; disk small 376 files/s at
  40; `dump --archive tar` 44.5 MB/s in high-dedup `10tb arch backup` against 110.5 in
  low-dedup `a52s`; `check --read-data` 1h56m for all 24,785 packs.

**Five things the prompt asserted that turned out otherwise.** Each is corrected in `PLAN.md`:

1. **`dump --archive tar` names members by their full snapshot path** (`G/photos/<rel>`), not
   relative to the dumped node. Caught with a five-member probe before Phase B. A
   node-relative mapper would have made every Phase D comparison vacuous while reporting
   cleanly.
2. **The top-up is 39 files, not 36.** "30 missing + 6 changed size" is a size-based
   derivation; three more files changed *in place at identical size* and the repo did not hold
   their current bytes. Backing up 36 would have left three files whose only copy was the
   source disk.
3. **The three same-size drifted files are `1ux\.git\index` (3,149 B) and both `2ux` refs
   (41 B).** The prompt described them as "1ux\.git\index and both refs\...\main at exactly 41
   bytes", merging two different files and two different sizes.
4. **The full `--read-data` was run, not skipped.** The skip rationale requires confirming from
   restic's own behaviour that blobs are hash-verified on load; that was asserted rather than
   confirmed, and the prompt's own instruction says an unconfirmed assumption means running it.
   1h56m, all 24,785 packs, no errors.
5. **`asset_sources` and `source_versions` have no `path_text` column.** The real chain is
   `asset_sources(source_version_id)` → `source_versions(source_file_id)` →
   `source_files(path_text)`. Incidentally, `source_files` holds 1,374,328 rows — v1's
   discovery and this walk agree on the size of the corpus to the row.

**Two consequences, both narrower than they first looked. Resolved 2026-08-02.**

1. **`--force` is a scrub, not a per-pass tax — and adding photos never needs it.** The repo
   has had a second pass (`1e80c50e`, tag `phase0-topup`), so SPIKE A's structural immunity is
   gone. But `--force` defeats *change detection*, which only ever applies to files already in
   a parent snapshot:

   | what changed | restic without `--force` | needs `--force`? |
   |---|---|---|
   | **new file** | always read — nothing to skip it against | **no** |
   | size or mtime changed | detected, re-read | **no** |
   | edited in place, size **and** mtime identical | skipped, stale blob list carried forward | **yes** |

   Only the third row, and hard rule 2 makes source media immutable. Across 1,374,328 files
   exactly three such edits have ever occurred, all git internals. Costs: a backup scoped to one
   new import directory is **seconds**; a whole-tree incremental of `G:\photos` is **~30–40 min**
   (the 1.38M-entry metadata walk, unrelated to `--force`); a `--force` pass is **8h46m**.
   Reading the rule as "every pass" is a 20× penalty on the most common operation.

2. **The off-site copy is stale by 39 files, and this is accepted, not blocking.** All 39 are
   git internals — no file extension, all inside `.git\` directories, and the catalog classifies
   **zero** of them as media. Every one of the 146,034 media files is in the uploaded snapshot.
   Owner's stated priority is that all real photos are included, not that copies match byte for
   byte, so step 13b treats the re-sync as housekeeping.

   **`origins.jsonl` still does not exist, and that is the one that matters.** Without it the
   off-site repo holds every photograph and cannot be navigated back from a vault object to its
   original path.

**One gap this step exposed and did not close — and it does not change the build order.** There
is no procedure for adding photos after the build ends, and no backup of `G:\vault` at all.
Every estimate in this file is a one-off migration cost. The architecture was audited against
future import on 2026-08-02 and **needs no change now**: import requires no schema migration,
the walk and hash helpers are already root-parameterised, dedup is a primary-key lookup, and
`state` is content-keyed so re-grouping cannot disturb triage decisions. **Carry on from step 8
as written.** See PLAN.md "Open decisions" 5 for the audit and the three things worth deciding
early — deliberately not designed yet.

<details><summary>Original prompt, for the record</summary>

```text
Read PLAN.md "Phase 0" in full (rewritten 2026-08-01 for the SECOND time — read the current
text, not a summary, and not any recollection of the --force version) plus the "Gate" section.

The restic password is already set up and verified as a DPAPI blob, and is reached by passing
config.toml's restic_password_command to restic's --password-command. Do not re-create it, do
not prompt for it, do not read .restic-key yourself. Never echo it, never write it to a file,
never put it on a command line.

Pass --no-lock on EVERY restic read command. The default writes a lock file into the repository.

=== ESTABLISHED FACTS. Do not re-derive these; verify cheaply where verification is cheap. ===

G:\photos holds 1,382,380 directory entries, of which only 1,374,328 are FILES.
  - 8,052 are WSL symlinks: NTFS reparse points, tag 0xa000001d (IO_REPARSE_TAG_LX_SYMLINK),
    st_size == 0, UNOPENABLE (200/200 sampled raised OSError). DirEntry.is_symlink() returns
    False for them because it only recognises IO_REPARSE_TAG_SYMLINK. If you classify with
    is_file() you will count 8,052 phantom zero-byte files and then generate 8,052 open errors.
    Classify with st_file_attributes & 0x400 (FILE_ATTRIBUTE_REPARSE_POINT). Record their paths,
    never attempt to hash them.
  - 11,608 are genuine zero-byte files. All share sha256 e3b0c442...; keep the rows.
  - Total bytes 1,152,691,239,120. 353,980 directories. 0 stat errors.

G:\ResticPhotos, snapshot ce88f697 (newest), enumerated 2026-08-01:
  1,374,298 file nodes summing to 1,152,680,261,990 bytes; 353,949 dirs; ZERO symlink nodes;
  ZERO paths containing U+FFFD; ZERO paths present in the snapshot but absent from disk.
  Repo format 2, single chunker_polynomial 3ecd3d7919bbcf, NO snapshot carries an `original`
  field, so no restic copy has ever touched it.
  Repo size on disk 436,175,270,064 bytes = 436.18 decimal GB = 406.22 GiB, in 24,840 pack
  files. PLAN.md's "406.22 GB" is GiB; reading it as decimal understates by 7.4%.
  The snapshot's single root entry is "G", with "photos" one level below. dump's path argument
  must have NO LEADING SLASH: "/", "." and "/photos" all fail with the misleading
  `path "\\C:" not found in snapshot`. Bare "G" works, and so do deeper slash-separated paths
  from that root -- "G/photos/lumix f 7-15-26 sd" is verified working, which is what makes the
  per-subtree invocation in D2 possible. Discover the subtree names from ls, not from this list.

The disk-vs-snapshot difference is 30 files and it is fully enumerated:
  - 30 git loose objects under
      home-chris arch backup\work\archive\2ux\.git\objects\
    totalling 10,975,971 bytes, created after the snapshot.
  - PLUS 6 files whose size disagrees: that same repo's COMMIT_EDITMSG, config, index, and
    logs\HEAD, logs\refs\heads\main, logs\refs\remotes\origin\main. Total delta 1,159 bytes.
  Byte arithmetic closes exactly: 10,977,130 = 10,975,971 + 1,159.

Only 39 files in the whole corpus have an mtime after the backup ended (2026-07-18 10:28:35),
and ZERO were modified during the backup window. 30 are those git objects. The other 9 are in
the snapshot, total 8,711 bytes, all under work\archive\{1ux,2ux}\.git\. Three of the 9 match
the snapshot's size but not its mtime — 1ux\.git\index and both refs\...\main at exactly 41
bytes. A git ref is 40 hex chars plus newline, so those are same-size-different-bytes: SPIKE A's
shape, real, three files, 123 bytes, no photographs.

E:\photolib\catalog.sqlite3 already holds, from adopt_mediavault:
  origin 251,087 rows, EVERY ONE with a sha256, covering 1,037,335,826,898 bytes (90.0%);
  146,034 distinct sha256; file 146,034 rows all state='adopted'; photo 146,034 rows;
  origin.nlink and origin.file_id NULL for all of them.
  All 251,087 paths exist on disk with zero size disagreements.
v1's manifest: source_versions hash_status = verified 251,824 / not_media 1,123,246 / error 356.

Measured I/O rates on G: — use these, do not re-benchmark from scratch:
  big files (>1 MiB), directory order:  94.4 MB/s at 4 threads (79.4 at 1, 67.9 at 16)
  small files (<=1 MiB), directory order: 400.8 files/s at 40 threads (105.8 at 1)
  small files in RANDOM order: 26-33 files/s at any thread count -- a 13x penalty
  metadata-only scandir walk: 1,450 entries/s, 953 s for the whole tree
  restic ls --json --long --recursive: 14,571 nodes/s, 119 s for 1,728,247 nodes
  restic dump --archive tar: 105.6 MB/s low-dedup subtree, 81.3 MB/s and 883 files/s in the
    small-file subtree, 52.9 MB/s and falling in high-dedup 10tb arch backup. Index loads in
    1.6-2.2 s. Dedup makes restore SLOWER, not faster: unique content streams sequentially
    from pack-adjacent blobs, deduplicated content pulls blobs scattered across older packs.

=== WHAT TO DO ===

Four phases. Report at every phase boundary before starting the next one. The ordering is
deliberate and two parts of it are the point: the cheapest decisive evidence comes FIRST, and the
inventory is durable on disk BEFORE the longest phase begins.

--- PHASE A: establish. ~19 min. ---

A1. `restic --no-lock cat config` and `restic --no-lock snapshots --json`. Record
    chunker_polynomial; confirm no snapshot carries an `original` field. ~5 s.

A2. Metadata-only os.scandir walk of the photos root: path, size, mtime_ns, and reparse
    classification via st_file_attributes & 0x400. ~16 min at 1,450 entries/s. This is a
    SEPARATE pass from hashing on purpose -- it is what lets Phase C partition by size, and
    running the two size regimes concurrently would put 44 readers on one head.

A3. `restic --no-lock ls --json --long --recursive ce88f697`. ~2 min at 14,571 nodes/s.

A4. Reconcile A2 against A3: paths present on one side only, size disagreements, and files whose
    mtime postdates 2026-07-18 10:28:35. Expect exactly 30 / 6 / 39. <1 min.

--- PHASE B: fail fast. ~15 min. THE CHECKPOINT THAT MATTERS. ---

B1. Hash, on the DISK side only, the 9 files whose mtime postdates the backup plus a
    directory-order cluster sample of ~20 GB spanning both size regimes. ~4 min.

B2. Dump those same paths from the repo and compare per file. ~4 min.

B3. STOP AND REPORT. If any file matches on size AND mtime but differs in hash, the backup does
    not contain what the catalogue will claim it contains, and the remaining ~10 h would build an
    inventory on a collapsed premise. Do not continue past a same-size mismatch without saying so
    and waiting.

    This phase exists because the previous ordering spent 4.2 h hashing before comparing a single
    byte against the repo. ~35 min to the first real verdict instead of five hours.

--- PHASE C: the inventory. ~4.4 h. This is the product. ---

C1. Disk-side hash, BIG regime: 104,745 files / 1,130.35 GB, 4 workers, DIRECTORY ORDER.
    ~3.3 h. Never hash in hash order or shuffled order -- random order costs 13x on small files
    and is no help here.

C2. Disk-side hash, SMALL regime: 1,257,975 files, 40 workers, directory order. ~52 min.
    Skip the 8,052 reparse points entirely; they are unopenable by design.

    In both: capture st_nlink and the NTFS file ID from os.fstat ON THE ALREADY-OPEN HANDLE, so
    identity metadata costs no extra I/O. Hash once per file ID and reuse for other names sharing
    it. Report how many files have nlink > 1 -- home-chris arch backup is where hardlinked backup
    generations would show up, and if they exist this phase gets cheaper.

C3. Write origin rows -- path, size, mtime_ns, sha256, nlink, file_id -- 1,374,328 of them,
    batched inside transactions on E:. Then file rows with state='pending' for anything not
    already adopted. ~5 min.

    For the 251,087 rows that already carry an adopted sha256: COMPARE, never overwrite. On
    disagreement record both values and abort. Silently replacing the adopted value destroys the
    only evidence that v1 and this pass disagreed. Agreement across 90% of the bytes is a free
    independent cross-check of v1's hashing and is a headline result either way.

C4. COMMIT HERE, before Phase D. The inventory is the deliverable and it is now complete. Phase D
    is verification and it is the part that may overrun the window.

--- PHASE D: full per-file verification. ~5.3 h. Resumable. ---

D1. `restic --no-lock check` WITHOUT --read-data, plus `--read-data-subset=1/8`. ~12 min.
    Rationale for not running the full --read-data: restic verifies each blob's plaintext hash
    against its ID on load, so D2 reads and verifies every referenced data blob as a side effect.
    What --read-data uniquely adds is unreferenced blobs and pack/index structure, which plain
    check plus a 1/8 subset covers. If you cannot confirm from restic's own behaviour that blobs
    are hash-verified on load, say so and run the full --read-data (436.18 GB, ~1.15-1.35 h)
    instead of assuming.

D2. Full repo-side per-file comparison. `restic --no-lock dump --archive tar ce88f697 <subtree>`
    piped into a streaming tar reader hashing each member, compared against Phase C's disk
    hashes. ~5.1 h (range 4.0-6.5).

    Invoke it ONCE PER TOP-LEVEL SUBTREE under G/photos, not once over "G". Eight invocations at
    1.6-2.2 s startup each cost ~16 s total and buy per-subtree checkpointing, visible progress,
    and restartability across evenings. A single 5-hour invocation that dies at hour 4 loses
    everything.

    Expect wildly uneven rates and do not treat a slow subtree as a fault: measured 105.6 MB/s in
    low-dedup lumix, 81.3 MB/s in small-file home-chris, 52.9 MB/s and falling in high-dedup
    10tb arch backup. Dedup makes restore SLOWER, not faster.

    This is what closes the residual the earlier design left open -- an in-place edit that
    preserved its mtime. With D2 complete the gate rests on per-file proof rather than on an
    mtime argument plus a 1.7% sample.

D3. Reconcile and report:
     files_seen_on_disk == files_hashed_from_disk == 1,374,328
     files_seen_in_snapshot                       == 1,374,298
   Those two differ by exactly 30 and the 30 are enumerated above. An earlier version of this
   prompt demanded all four counters be equal; that predated the reconciliation and would abort
   on a correct run. Also assert count(distinct path) == count(origin rows).

   Reconcile and report two counts that are currently unexplained, rather than rationalising
   them: asset_sources has 251,824 rows against origin's 251,087, a 737-row difference; and
   v1's 356 hash-error files need a recorded outcome each. Neither is large. Both are gaps in
   the inventory that will later authorise deleting 1.07 TB, so "probably the version-history
   join" is not an answer -- demonstrate it or report it unresolved.

   Classify every hash disagreement into exactly one of two buckets:
     - size differs, OR mtime is after 2026-07-18 10:28:35 -> the file changed since the
       backup. Expected, benign, 6 and 9 files respectively. Log and re-back-up. NOT a stop.
     - size AND mtime both match but the hash differs -> in-place edit that preserved mtime, or
       the repo holds bytes it should not. THIS IS THE HARD STOP and it is the only one.
   NEVER treat "could not open" or "could not hash" as "no duplicate found". With the reparse
   guard in place the expected unopenable count is ZERO; without it, 8,052.

--- PHASE E: the one write. ~3 min. CONDITIONAL. ---

E1. Do this ONLY if Phase D's gate passed for every subtree. If any subtree is unverified, or any
    same-size same-mtime disagreement was found, STOP AND REPORT INSTEAD. Do not add to a
    repository you have just discovered may hold bytes it should not, and do not add to one whose
    verification is incomplete -- fix the finding or finish the verification first.

    Top-up backup: the only write to G: in this step, and it IS authorised (2026-08-01). Back up
    the 30 missing git objects and the 6 changed files. Megabytes, not terabytes. Derive the list
    from your own Phase A4 reconciliation; do not hardcode it from this prompt.

    It is deliberately LAST. It creates the repository's second read, which changes the state
    every fact above was measured against, so everything that reads the repo runs first.

    Two things to state in your report afterwards:
      - a second backup pass means --force becomes MANDATORY for every pass after this one,
        because SPIKE A's defect needs two reads of the same file and until now there was one.
      - G:\ResticPhotos was already uploaded off-site BEFORE this top-up, so the remote copy is
        now stale by those 36 files. Say so explicitly and say what must be re-synced. An
        off-site copy that silently differs from local is worse than one known to be behind.

Read-only against the photos root throughout — the single write is to G:\ResticPhotos in E1, not
to the photos root. Report counts and stop — do not act on the non-media population, that is
step 12.

Two things in this step are pure logic and belong under test before ten hours of I/O runs on top
of them, because both fail silently and both fail at scale:
  - reparse classification. Feed the classifier a stubbed st_file_attributes with and without
    0x400 set and assert an LX symlink is excluded rather than counted as a zero-byte file. You
    cannot easily create tag 0xa000001d in a test, so test the predicate, not the filesystem.
  - the two-bucket disagreement classifier. A size change, an mtime change, and a same-size
    same-mtime hash difference must land in benign, benign, and HARD STOP respectively. Getting
    this backwards either aborts a correct run or waves through the one case the gate exists for.

Print elapsed and throughput every 60 seconds.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild — create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

</details>

**Gate, in two parts, because Phase C and Phase D can land on different evenings. Both passed
2026-08-02.**

**Phase C gate — the inventory. ✅** `origin` holds 1,374,328 rows each with a `sha256`, `nlink`
and `file_id`; the 251,087 adopted hashes agree with the independently computed values;
`count(distinct path) == count(origin rows) == 1,374,328`.

**Phase D gate — the deletion gate's evidence. ✅** Every one of the 1,374,298 files in the
snapshot has a repo-side SHA-256 equal to its disk-side SHA-256, and `restic check` passes
including the full `--read-data`:

```
agree          1,374,289      hard_stop         0
changed_size           6      not_on_disk       0
changed_mtime          3      not_hashed        0
                              not in repo      30
```

`1,374,289 + 6 + 3 = 1,374,298` — complete coverage of the snapshot. The nine disagreements are
the nine known drifted git files and all nine are benign; the 30 are the new loose objects. All
39 were backed up in Phase E and re-verified out of the new snapshot: 39 agree, 0 differ.

**A same-size, same-mtime hash disagreement is the hard stop** — that is a file whose bytes
changed under restic's nose. A size or mtime change is not that; it is a file that legitimately
changed after 2026-07-18 and needs re-backing-up, and conflating the two would abort a correct
run. None was found.

Two failure modes this run hit and that a re-run must not reintroduce, both now fixed in
`photolib/inventory.py`:

- **A resumed Phase D must not read emptier than a fresh one.** `_phase_d_report` originally
  summed an in-memory counter, so the resumed run that skipped its eight already-verified
  subtrees printed `agree 1` against 1,374,289 real agreements — on the number the deletion gate
  rests on. Totals now come from the persisted per-subtree rows.
- **A cluster sample must budget each size regime separately.** One shared byte budget let a
  single 49.4 GB directory swallow it, leaving 109 small files out of a 20 GB target — no
  coverage of the regime holding 92% of the file count.

---

# Step 8 — Categorical prefilter — ✅ **DONE 2026-08-02**

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

**Done 2026-08-02.** `photolib/prefilter.py`, 2.7s. Nine `exclude` rules at `seq` 0–8 in
`state.sqlite3`, predicates as structured `(column, op, value)` JSON compiled into one CASE so
first-match-wins costs no second pass. The extension list is exactly the nine and unchanged.

**Half the gate was wrong, and the half that held is the one that matters.** `.png` (54,899),
`.gif` (817), `.webp` (45) and `.bmp` (11) are matched by no rule — that half held. But **101,986
files / 4.77 GB** were excluded, not ~41,700 / 0.5 GB. The estimate was counted over MediaVault's
146,034 adopted assets, where the same nine rules take **41,658 files / 0.64 GB** and reproduce
the prediction to the file; over Phase 0's full 787,798-row `file` table `.pyc` is 59,516 rather
than 7, `.file` 1,148 rather than 498, and `.msg` 367 rather than 198. **685,812 files / 544.14 GB
survive to triage.** See `PLAN.md` "Phase 1" for the per-extension table. A step-8 re-run that
reports ~41,700 is reading the adopted subset, not the inventory.

Rules match `file.ext`, the extension of the deduplicated byte sequence, so a sha with several
names is decided once. 539 excluded files are also known under a *different* extension, every one
of them source or text (`.cts`, `.py`, `.js`, `.pem`, `.svelte`); the only one touching an image
format is a 1,279-byte `favicon.ico` that also exists as `favicon-32x32.png`. 63 files carry an
excluded-extension path and survive anyway, which is the safe direction.

**Expect the grid to look identical afterwards, and do not treat that as a failure.** Step 6
measured 22,059 `.svg` tiles rendering as empty placeholders, and it is tempting to read this
step as the fix for them. It is not. This step writes `triage_rule` rows to `state.sqlite3`;
`/api/photos` selects from `photo` joined to `file` on `kind`, and knows nothing about the rule
engine. Every excluded file keeps its `photo` row and its tile until step 11 decides how a
verdict reaches the read path.

> **Held, and enforced rather than merely observed.** The step wrote five columns into
> `state.triage_rule` and read `origin`/`file`; no `file.state` became `excluded`, no `photo` row
> moved, `triage_override` was not consulted, and `tests/test_prefilter.py` asserts all three.
> The 22,059 `.svg` placeholders are still on the grid.

---

# Step 9 — Phase 2a verification read

**Effort:** `high` · run in the background · **~2–3 h** (step 5 re-measured this; it was 5–6),
the largest single I/O in the project

```text
Read PLAN.md "Phase 2a" in full (it was rewritten on 2026-08-01 — read the current text),
including the adopt-objective/recompute-subjective paragraph and the resolved orientation
section. Read docs/preprocessing.md ONLY for its list of quality scalars — as a SPECIFICATION
of what to compute, never as code to import and never as values to adopt.

One long pass. It will be killed and restarted; design for that from the first line.

A. Re-hash every MediaVault object and compare against its filename, which IS its SHA-256.
   146,034 objects, 420.17 GiB = 451.2 decimal GB, and the only large read in the project.
   Use 451.2e9 in any MB/s projection: PLAN.md's "420.17 GB" is binary, and reading it as
   decimal undercuts the estimate by 7%. Record pass or fail per asset. Any mismatch is a hard
   error, listed by name — never silently skipped, never repaired.

B. REPAIR THE ARW ORIENTATION FIRST, before computing anything from the substrate.
   Step 1's SPIKE C proved v1 transposes the extracted embedded preview only, so orientation
   survives for .rw2 and .jpg (correct at population scale, 29,450/29,450, direction-verified)
   and is silently dropped for every .arw, because the Sony preview carries no EXIF.

   Repair set: preferred_extension='.arw' AND orientation_text <> '1' = 1,486 assets
   (orientation 8: 1,459; 6: 24; 3: 3) x 4 tiers = 5,944 files. About 15 minutes.
   Transform, measured at r=1.000: orientation 8 -> rotate 90 CCW; 6 -> 90 CW; 3 -> 180.

   Do NOT select by aspect transposition. Orientations 2, 3 and 4 are invisible to it by
   construction, and the three orientation-3 ARW are published UPSIDE DOWN — not sideways —
   so neither an aspect predicate nor a visual spot-check can find them.

   Do NOT regenerate all 103,207. That is a 6-9 h full decode of 418 GB for a defect affecting
   1.4%, and the RAW-demosaic variant needs a LibRaw dependency that is not installed.

   Fix the root cause in the new code before regenerating anything: drive rotation from the
   CONTAINER's orientation, never from whatever EXIF survives into the extracted preview.

C. Read the derivative tree (21.65 GB) and, from the REPAIRED 1536px derivative, compute in ONE
   decode per asset: pHash, dHash, ThumbHash, and every quality scalar in v1's 18-scalar list.
   Do not adopt v1's asset_features values — they are relative judgements that only mean
   anything when every value comes from one implementation, and cover ranking compares members
   within a stack. Objective readings (GPS, ISO, lens, capture time) were already adopted in
   step 3; these are the subjective ones and they get recomputed.

   The substrate is FIVE tiers, not four: 192/384/768/1536 thumbnail (103,207 assets each) plus
   long_edge 2560 detail (21,845 rows, image only). There is NO detail tier for any RAW asset —
   for .rw2 and .arw the 1536 IS the vendor embedded preview at ~95% scale, and no
   higher-resolution derivative exists at any tier. If anything downstream assumes a detail
   view, that is a gap of 81,362 assets and you should tell me rather than paper over it.

   Step 5 copied .arw thumbnails to E:; replace the rotated ones here. It reported **2,346**,
   which is every .arw, against this repair set of 1,486. The two are consistent, not in
   conflict — the other 860 are orientation 1 and need nothing. Reconcile 1,486 replaced +
   860 untouched = 2,346 on disk.

D. Do NOT adopt assets.width/height as an objective reading. It holds at least five different
   quantities across the corpus — the true raster, an EXIF camera-original size, an embedded
   EXIF THUMBNAIL size (504x376 on 2,046 Samsung JPEGs), the .rw2 preview size and the .arw
   sensor size — differs from the orientation-corrected metadata for 4,415 of 103,207 assets,
   and for ~52 its landscape/portrait polarity is the OPPOSITE of the real file. Use
   asset_extended_metadata or re-measure the object.

E. Regression check, and it cannot be a DB-only assertion: derivatives.source_width/height
   equals the POST-transpose size in 103,207/103,207 rows, so no column holds the true stored
   raster. Either re-read EXIF:Orientation and File:ImageWidth/Height from the object, or
   persist pre-rotation raster dimensions as a new column. Assert that the rotation actually
   applied equals the container orientation for all eight EXIF values. Do NOT add the companion
   assertion "non-transposing orientation => derivative not transposed" against
   assets.width/height — it fires on 50 real, correct assets.

Constraints:
- Reader threads differ by pass, and the difference is measured: **one** for A's object re-hash,
  which is bandwidth-bound — step 5 measured two readers 9% SLOWER than one (56.7 vs 62.0 MB/s)
  on exactly this workload, so the "one or two" this line used to say is settled at one;
  **16–32** for C's derivative tree, which is 434,673 small files and latency-bound. See "Threads
  on G:" in the standing rules. About twelve decode workers either way — 16 CPUs, one disk head.
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
Step 5 already measured this workload — SHA-256 over a seeded random sample of 1,200 objects
drawn from the real size distribution — at 62.0 MB/s with one reader, which is ~2.0 h for
451.2e9 bytes, and a tree-ordered walk should beat that. Do NOT use step 5's 0.9 MB/s headline:
that pass read 9.8 KB files and its figure is seek latency in a bandwidth unit. If your 500-asset
benchmark lands near 22-35 MB/s instead, something differs from step 5's conditions — say so
before spending the night on it rather than accepting either number.

Nothing else may touch G: while this runs. Contention on this volume measured a ~1,700x spread
on identical operations — 1.4 ms idle versus one call at 3,081 ms after a write burst.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** zero hash mismatches across 146,034 objects, and 5,944 ARW derivative files rewritten.
Then reload the grid — every tile should now paint a ThumbHash placeholder instantly, and the
NEX-5N photos from 2019-12-31 to 2021-09-24 should be the right way up.

**Two things step 6 left for this step, both of which will make the gate lie if ignored.**

- **A plain reload will NOT show the repaired ARW thumbnails.** `/t/<sha256>.webp` is keyed on
  the *asset* hash and served `immutable, max-age=31536000`, so a browser that has already loaded
  those 1,486 tiles will not ask again for a year. Rewriting the file on `E:` changes nothing it
  can see. **Hard-reload or clear the cache before judging the gate**, or the repair looks like it
  failed. This is a mild echo of `F47` inside the new design and worth naming rather than
  excusing: the URL is stable per asset, not per derivative, so it is honestly immutable only
  because this step is the one and only time a derivative's bytes change. If a second such
  mutation ever becomes likely, key the URL on the derivative's own checksum instead.
- **The shipped ThumbHash decoder has never executed.** `th` is null in all 146,034 rows today,
  so `thumbHashToDataURL` in `photolib/static/app.js` is unverified code. This step writes the
  encoder, so it is the step that can prove them consistent: encode a known synthetic image,
  decode it with the *shipped* function, and compare — do not assume the client half works
  because tiles look plausible. A wrong decoder produces a wrong-coloured blur, which is exactly
  the failure nobody notices.

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

**Then snapshot the decisions, and do it after every triage session, not just this one:**

```bash
python -m photolib.backup_state
```

`state.sqlite3` is the only artefact in this project that cannot be regenerated — the catalog
rebuilds from a re-scan, derivatives regenerate from the substrate, the vault restores from restic
through `origins.jsonl`. The triage rules and overrides are the output of you looking at 1.37M
files. `backup_state` writes a `VACUUM INTO` snapshot to `backup_root` on `C:`, a different
physical disk from `E:`, and refuses to write onto the source's own volume. It is not off-site:
it survives a dead drive, not a dead building, so the snapshots belong in the step 13b upload
alongside the restic repo and `origins.jsonl`.

**This is where the framework decision lands — not step 6, and not step 10, which is backend
only.** Step 6 was built vanilla on purpose: the grid's hot path is a scroll event mutating
transforms on ~150 recycled tiles, which framework diffing only adds to, and a 125,738-item array
would be opted out of reactivity anyway. Eight screens with a rule sidebar, live recomputing
counts and per-file override toggles is the opposite case, and it is the first place a component
layer earns its cost. Decide here, deliberately.

If the answer is Svelte, the port is bounded and known: `packRows`, `visibleRows` and `fetchPage`
in `photolib/static/app.js` are pure functions over plain arrays and move untouched; all DOM
ownership is already scoped to a single `#canvas` element, so it is a wrapper rather than
surgery; and the API contract does not move at all. Note that SvelteKit specifically buys little
here — SSR is meaningless for a localhost client-side virtual scroll, and routing across the
screens is trivial. Svelte without Kit keeps the Python server serving static files exactly as it
does today.

The paging contract to reuse, as built: `{photos: [{id, s, w, h, th}], next: {before, before_id}
| null, kind, limit}`, cursor in the envelope rather than per row, and `next` derived from a
`limit + 1` probe so exhaustion is a fact rather than `len < limit`.

---

# Step 12 — Phase 2b gap fill

**Effort:** `high` · run in the background · ~1 h, but **re-estimate before running**: this was
sized from "the step 7 gap", which turned out not to exist. Population 2 is now whatever triage
keeps out of 1,123,241 non-media files, which is not known until triage runs.

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
   read from the photos root into the staging directory. That population is 1,123,241 files
   before triage — confirmed exactly by step 7, and essentially v1's `not_media` classification
   — and an unknown small fraction after it. It is NOT "the 8,052-file gap": that gap was a
   census artefact (8,052 WSL symlinks miscounted as files) and does not exist.

   v1's 356 hash-error files are already resolved and are NOT an open item here: step 7 read and
   hashed all 356 without error, so each has a `sha256` in `origin` like any other file. Treat
   them as ordinary members of this population, not as a gap to chase.

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

Run all FOUR checks and give me a report I can sign off on. This step changes no files, and
neither does anything you spawn: every agent in this step is a reader. Do not parallelise any
walk of the photos root — it is 1.38M files on a USB HDD and splitting it thrashes the head. The
fan-out is for attacking the results, not for producing them.

1. Every MediaVault object re-hashed and matching its filename — that is step 9's result, so
   re-read it rather than repeating 420 GB — AND every gap-filled object from step 12 matching
   its recorded sha256.

2. Every origin row that survived the Phase 1 prefilter has a file row in state 'read' or
   'adopted'. List any that do not, with their paths. AND count(distinct origin.path) ==
   count(origin rows) — restic's reported paths are not injective, so a trivially-passing
   check 2 can be an artifact of two files having collapsed into one row upstream.

3. CONTENT-level reconciliation, not a path diff. A path diff CANNOT catch the failure this gate
   exists to prevent: a file rewritten in place at constant size with mtime preserved appears in
   both lists, at the same path, with restic holding the old bytes. If you find yourself
   comparing two lists of strings, you are running the old check.

   What step 7's Phase D establishes, and what you re-assert here:
     - per-file agreement between the repo-side sha256 (from dump --archive tar, per subtree) and
       the disk-side sha256, for all 1,374,298 files in the snapshot.
     - disk-side sha256 for all 1,374,328 files on disk, of which the 251,087 adopted from
       MediaVault agreed with an independently computed value. Re-assert that agreement count.
     - files_seen_on_disk == files_hashed_from_disk == 1,374,328, and
       files_seen_in_snapshot == 1,374,298, differing by exactly the 30 enumerated git objects.
       Do NOT assert these two are equal — an earlier version of this check demanded four equal
       counters, which predated the reconciliation and would abort on a correct run.
     - restic check passed, INCLUDING the full --read-data: all 24,785 packs read, no errors,
       1h56m on 2026-08-02. The "blobs are hash-verified on load, so the subset suffices"
       argument is no longer load-bearing anywhere and you do not need to re-establish it.

   CHECK WHETHER PHASE D ACTUALLY COMPLETED before crediting it. It is per-subtree checkpointed
   across possibly more than one evening, and a partial run is a legitimate state step 7 is
   instructed to report. If any subtree is unverified, this check does NOT pass, and the residual
   is specifically an in-place edit that preserved its mtime in an unverified subtree — which no
   mtime argument and no sample can exclude. Name the subtrees and BLOCK. Do not run the missing
   subtrees yourself; that is hours of I/O and step 13 is a ~30 min verification step.

4. Does G:\ResticPhotos cover the current corpus? Step 7 established that it does, to the byte:
   1,374,298 file nodes against 1,374,328 files on disk, missing exactly 30 git loose objects,
   plus 6 files that grew — total 10,977,130 bytes, arithmetic closing exactly.

   Step 7's top-up closed 39 files, not 36, in snapshot 1e80c50e tagged phase0-topup, and
   re-verified all 39 out of that snapshot. The extra three changed IN PLACE AT IDENTICAL SIZE
   (1ux\.git\index at 3,149 bytes, both 2ux refs\...\main at 41), so the size-based "30 + 6"
   derivation cannot see them and the repo did not hold their current bytes. Verify by name and
   count that all 39 are covered. If you find yourself checking for 36, you are running the old
   derivation and three files' only copy is the source disk.

   Then verify the thing step 7 could NOT: that the OFF-SITE copy holds every MEDIA file. The
   local repo was uploaded before the top-up ran, so the remote is expected to be behind by those
   39 files unless a re-sync happened. That lag is ACCEPTED and does not block: all 39 are git
   internals with no extension, inside .git\ directories, and zero are classified as media —
   re-confirm that classification rather than taking it on trust, then move on.

   What you are actually checking is that all 146,034 media files are present off-site. The
   off-site copy — not the same-disk repo — is what stands behind step 14, so an unverified
   remote is the single largest assumption between this plan and an irreversible deletion. Do
   not accept "the upload completed" as evidence that the remote holds the right bytes.

   MOSTLY DONE ALREADY, 2026-08-02 — re-confirm rather than repeat. The off-site copy is
   a3server:/mnt/bay6/ResticPhotos (ssh -p 22222 chris@82.14.247.27). Integrity: every one of
   its 24,839 content-addressed files hashes to its own filename, restic naming packs, index
   files and snapshots by the SHA-256 of their contents; only `config` is exempt. Completeness:
   local 24,844 files against the server's 24,840, the difference being exactly the four the
   top-up created (two packs, one index, snapshot 1e80c50e) and ZERO files present on the server
   but not locally.

   Use that technique rather than `restic check --read-data` against the remote. It is strictly
   stronger where a verified local copy exists — `check` on a copy missing a whole snapshot file
   verifies the remaining ones and passes, whereas a file-set comparison notices — and it needs
   no password on the remote and no bulk transfer. `check --read-data` over SFTP would pull
   436 GB at the measured 11.7 MB/s: ~10.4 hours.

   Also verify, because it is NOT yet done: that the three catalogue databases under
   /mnt/bay6/photolib-backup/ are current. They were copied 2026-08-02 and every later step
   writes to catalog.sqlite3, so by the time you run this they are stale by definition. Re-copy
   and re-verify by SHA-256. manifest.sqlite3 does not change and does not need re-copying, but
   note it is not in the restic repo and is not regenerable, so that copy is its only backup.

   If any file in the stale set turns out to be media, the acceptance above does not cover it
   and the re-sync becomes blocking again.

Then attack each result before reporting. Send independent readers to REFUTE the claim that the
check passed, each with a different lens — does the query measure what the sentence claims, does
the number survive a differently written query, does a clean result here depend on an earlier
step's number that was itself never re-verified — and have them default to "refuted" when
uncertain. Attack check 1 hardest: it re-reads step 9's recorded result rather than repeating
420 GB, so a stale, partial or mis-joined read of that result would look exactly like a pass.

State plainly, in one sentence, whether all four passed. Any check that is not clean BLOCKS
steps 13b and 14 — say so rather than qualifying it. A check that passed only weakly under
refutation is not clean.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** an unambiguous pass on all four, with the refutation verdicts attached. This is the
last checkpoint before anything becomes irreversible.

---

# Step 13b — Export the origin map, then upload

**Effort:** `medium` · ~20 min plus your upload time

**This moved ahead of step 14 and it is now a precondition of it.** Step 14 unlinks the last
same-disk copy of 420 GB. `G:\photos`, `G:\MediaVault` and `G:\ResticPhotos` are all one
partition on one USB enclosure, so until this step lands there is no copy anywhere else — and
`origins.jsonl` is the only content-hash → original-path map, without which step 14's reversal
story does not function at all.

```text
Read PLAN.md's Gate section and the origins.jsonl row of the storage table.

Export <vault_root>\origins.jsonl: one line per distinct file —
  {sha256, ext, size, taken_at, taken_src, paths: [every original path under G:\photos]}

This is the one-to-many store that has to survive the source being deleted, so it must be
readable with nothing but a text editor. No database required, no schema knowledge required, no
compression.

Write it APPEND-ONLY, one self-contained JSON object per line, sorted by sha256 on first
export. Photos imported after this build has ended have to extend this file, and a format that
can only be regenerated wholesale from a `G:\photos` that no longer exists is a format that goes
stale the first time anything new arrives. Appending is free; retrofitting append onto a
one-shot dump is not.

Verify it: reconstruct the origin table from the JSONL into a scratch database and diff it
against the live one. The path sets must match exactly. Report the diff, even if empty.

The upload set is THREE things, not two: the restic repo, `origins.jsonl`, and the
`state.sqlite3` snapshots under `backup_root`. The third is easy to forget because it is a few MB
next to 436 GB, and it is the only one of the three that cannot be rebuilt from the others — it
holds every triage decision. Take a fresh snapshot with `python -m photolib.backup_state` as part
of this step so the uploaded one is current.

Most of the upload already happened. As of 2026-08-02 the server (a3server, ssh -p 22222
chris@82.14.247.27) holds /mnt/bay6/ResticPhotos, verified, and /mnt/bay6/photolib-backup/ with
catalog.sqlite3, phase0.sqlite3 and manifest.sqlite3. What is still missing is origins.jsonl,
which does not exist yet, and the state.sqlite3 snapshots. Put both in
/mnt/bay6/photolib-backup/ alongside the rest, and re-copy catalog.sqlite3, which every step
after 7 has changed.

Two facts about that server to build the instruction around. The link is ASYMMETRIC — 11.7 MB/s
down, 3 MB/s up as measured from this machine — and the slow direction is the restore direction,
so a full restore from off-site is a multi-day operation, not an afternoon. And the repo is owned
by `mark`, not `chris`, so writes into it need sudo; the photolib-backup directory is chris-owned
and does not.

Then tell me exactly what to upload, in what order, and precisely what I must confirm has landed
before I run step 14 or delete anything locally.

Two things to state explicitly in that instruction, because both were wrong in an earlier draft
of the plan:
  - The restic repo and the photos root are on the SAME physical disk — partition 2 of disk 3,
    one WD Elements USB enclosure. Two copies there is one hardware failure from zero. The
    upload is the ONLY thing that changes that.
  - Reversal of a wrong exclusion is NOT "one restic dump". It is: look the content key up in
    origins.jsonl to get the original G:\photos path, translate that to restic's snapshot form,
    then `restic --no-lock dump <snapshot> <path>`. It is not addressable by content hash at
    all — restic chunks anything over 512 KiB, so `restic find --blob <sha256>` returns nothing
    for any real photo or video.

    The snapshot form is `G/photos/x.jpg` — a bare root-entry name with NO LEADING SLASH.
    Measured 2026-08-02: `/G/photos/x.jpg` FAILS, and so do `/`, `.` and `/photos`, all with the
    misleading `path "\\C:" not found in snapshot`. An earlier draft of this step specified the
    leading-slash form; it does not work, and it fails in a way that reads like the file is
    missing rather than like the path is malformed. Verify one real dump before writing the
    instruction.

Do not upload anything yourself. Do not delete anything. Do not run step 14.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild — create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** the reconstruction diff is empty, **and you have confirmed the upload landed**. Only
then is `G:\photos` deletable and only then may step 14 run. `origins.jsonl` itself is excluded
from git by the `*.jsonl` rule — it lives in the vault, not the repo.

---

# Step 14 — Phase 4 promote

**Effort:** `xhigh` · run in plan mode first · dry run before anything executes

The only step in the project that deletes. It operates on 420 GB with one other copy.

```text
Read PLAN.md "Phase 4" in full — it was rewritten on 2026-08-01 and the current text is the
spec. Read step 13's report and step 13b's upload confirmation.

STOP AND TELL ME, do not proceed, if any of these is untrue:
  - step 13 passed all four checks
  - step 13b's upload has completed and been confirmed landed
  - <vault_root>\origins.jsonl exists on disk
Phase 4 unlinks the last same-disk copy. Without an off-device copy this step is the plan's own
single-USB-HDD rule broken by its own build order.

Write the promotion, then show me a DRY RUN before anything executes.

THE MECHANISM IS PROVEN; THE ORDERING IS THE PART THAT KILLS. From step 1's SPIKE B:
CreateHardLinkW needs no privilege, creates no reparse point, and cross-volume fails loudly
with winerror 17 creating nothing. First-name unlink is O(1) in file size. 6,000 full
promotions ran clean. What follows is everything around it.

- Budget ~1.3 HOURS, not "seconds". The NTFS work is ~2 ms per object, but cold metadata on the
  real object store measured 31.3 ms mean / 297 ms p95 / 811 ms max, and one os.remove took
  3,081 ms under contention. Make it resumable and checkpointed. Nothing else may touch G:.

- st_nlink == 2 is ONE extent with TWO NAMES, not two copies. It reads like redundancy and is
  its opposite. Any progress accounting that sums logical file sizes double-counts every
  promoted object.

- Promotion is PER OBJECT, state-classified before every action, NEVER link-all-then-unlink-all.
  The batch shape was implemented against a poisoned batch and produced silent data loss: one
  row failed to link because its vault name already existed from an interrupted earlier run, the
  unlink pass deleted its object anyway, and the survivor has the right name, nlink 1, a normal
  directory listing and the WRONG BYTES.

  Classify first, every time — this IS the resume path:
    object present, target absent                          -> S0: link
    object present, target present, (st_dev, file index) EQUAL   -> S1: resume at the unlink
    object present, target present, file index DIFFERS      -> COLLISION: abort this object,
                                                               leave it untouched, log. Never unlink.
    object absent,  target present  -> AMBIGUOUS: sha256 the target. Matches -> already promoted,
                                       fix the DB row. Does not match -> abort loudly.
    object absent,  target absent   -> abort loudly, do not mark done.

- NEVER branch on ERROR_ALREADY_EXISTS(183). It is returned identically for "target is already
  my own hardlink" (the normal crash-resume state), "target is an unrelated file", and a
  CASE-ONLY collision on NTFS. Reading 183 as "already linked, proceed to unlink" — the only
  reading that makes a 146k-object run resumable — was tested and PERMANENTLY DESTROYED the only
  copy of a file. On 183, re-enter the classifier.

- Then, for S0/S1, in exactly this order:
   1. Assert object has nlink == 1 and no read-only attribute. Baseline confirmed across 12,036
      objects and 2,500 nlink samples, so any violation means something else changed the store.
      Assert st_dev(object) == st_dev(target parent).
   2. CreateHardLinkW new <- existing.
   3. GetFileInformationByHandle on BOTH names. Assert equal volume serial, equal file index,
      index != 0, nlink == 2 on both, equal size, reparse bit clear on both. Any failure aborts
      THIS object with its MediaVault name intact.
   4. Clear FILE_ATTRIBUTE_READONLY if set.
   5. DeleteFileW the MediaVault name, bounded backoff on ERROR_SHARING_VIOLATION(32). CPython's
      open() does not pass FILE_SHARE_DELETE, so every Python reader in this project blocks it.
   6. Re-stat the survivor: nlink == 1, index unchanged, size unchanged. ONLY THEN set read-only.
   7. Record the promotion. The DB row, not the directory listing, is the record.

  The order matters and the obvious order is wrong: FILE_ATTRIBUTE_READONLY lives in the shared
  MFT record, so setting it on the new name sets it on the old one, and NTFS then refuses to
  unlink EITHER with ERROR_ACCESS_DENIED(5). An earlier draft of this prompt said "set read-only
  on the new name, then unlink" — that deadlocks on every object.

- NEVER set read-only when the unlink did not succeed. Doing so makes the surviving object name
  undeletable and mutates the repair error from 32 to 5, so a repair pass written to retry on 32
  never recovers it. Leave it half-linked, record it, move on. The repair pass clears read-only
  on either link first and retries on BOTH 32 and 5, and is idempotent. It cannot use the USN
  journal — that is not active on G: — so it needs its own persisted intent record.

- Identity, never name existence, decides "already promoted". A completed promotion is
  metadata-identical to an ordinary unrelated file. os.path.exists is not a valid predicate.

- PER-BATCH FREE-SPACE ASSERTION. Capture disk_usage("G:").free before and after; abort if the
  drop exceeds 256 KiB * promoted_count + 1 MiB. A hardlink costs ~410 B/file; a 25 MiB copy
  costs 26,775,552 B. This is the ONLY thing that would catch a silent degradation to copy —
  G: has 1.92 TB free, so a full 420 GB copy completes with 1.50 TB spare and raises nothing.

- Accepted gap-filled assets: rename out of staging with NO-REPLACE semantics. If the target
  name exists, do NOT infer the bytes are already published — sha256 the target and compare.
  Match -> drop the staging copy. Mismatch -> abort loudly and keep staging; a different object
  owns that name. NTFS is case-insensitive, so a case-only variant collides too.

- Excluded assets: unlink the MediaVault object, ONE AT A TIME through the same verify-gated
  sequence, never as a bulk pass over a list. Before ANY unlink, prove the resolved path is
  under the MediaVault objects root or the staging root, and that its sha256 is explicitly
  marked excluded by the saved rule set. Nothing else may ever be unlinked, under any condition,
  including an empty or malformed rule set.

- Vault target names must be collision-free BY CONSTRUCTION, including case-insensitively. Path
  lengths are bounded (real object paths max 148 chars) and 369-char paths work unprefixed on
  this volume, so assert a length bound rather than adding \\?\ ceremony.

- Default mode is --dry-run and prints exactly what it would do. The destructive mode requires
  an explicit flag AND prints a summary I have to confirm interactively.

- Append-only log of every unlink with sha256, path, and the rule that excluded it. Never
  truncated, never rotated by this program.

After promotion, repoint reveal. This is THREE changes, not one, and doing only the first
breaks every reveal:
  - file.vault_relpath currently holds a MediaVault-relative path
    (objects\sha256\<aa>\<bb>\<sha>_..._<n>.blob). Rewrite it to the promoted vault path.
  - photolib/reveal.resolve() joins the relpath to a BASE and proves containment under a ROOT,
    and they are different directories: today base = mediavault_root, root = reveal_root
    (G:\MediaVault\objects). Change the base at the one call site in photolib/grid.py from
    mediavault_root to vault_root.
  - config.toml reveal_root: G:\MediaVault\objects -> G:\vault.
Changing only reveal_root leaves the base at G:\MediaVault while the root is G:\vault, so
containment fails for every photo and /api/reveal returns 403 across the board. That is the
designed failure — it refuses rather than revealing the wrong file — but it looks like the
promotion broke, so make all three changes together.

Then confirm that clicking a photo in the grid still opens Explorer on the right file, and run
step 16 — this step destroys names and verifies nothing on its own.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild â€” create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** the dry run's counts match your triage numbers exactly. Read them before you pass the
destructive flag. Reversal of a wrong exclusion needs `origins.jsonl` **and** a repo that still
holds the file — which is why step 13b comes before this one, and why it is a hard precondition
rather than a courtesy.

Then run step 16 before you call this done.

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

**Close the grid before this runs, and reload it after.** Collapsing ~14,000 tiles rewrites the
`photo` table, and `photo.id` is regenerable output that re-grouping reassigns —
`photolib/capture_time.resolve()` already does `DELETE FROM photo` then re-inserts. A browser
holding a page of ids from before the regroup will POST a stale id to `/api/reveal` and get
Explorer opened on **a different photo**, with no error anywhere. Read-only and harmless, but
baffling. Everything durable already keys on `sha256`, so this is the only surface that carries a
regenerable id, and a reload is the whole fix.

---

# Step 16 — Post-promotion verification sweep

**Effort:** `high` · run in the background · **4–5 h**

Step 14 destroys directory entries and verifies nothing. A wrong-bytes survivor is
indistinguishable from success by existence, size, `nlink`, file count, or free space. This is
the step that finds out — and it has to run while the off-device copy from step 13b is still the
thing you could restore from.

```text
Read PLAN.md "Phase 4" — the mandatory post-Phase-4 re-hash sweep paragraph — and step 14's
promotion log.

Verify what step 14 actually did. This step writes nothing except its own report.

1. Re-hash every promoted vault name against its recorded sha256. Report mismatches and missing
   names as explicit counts and exit non-zero if either is greater than zero. Do not summarise
   a mismatch as a warning; it means the vault contains bytes that are not the photo the
   catalogue thinks is there.

2. Assert per promoted object: nlink == 1, the read-only attribute is set, and the file is
   under vault_root. Any object still carrying nlink == 2 is a half-promotion step 14's repair
   pass did not finish — list it, do not fix it here.

3. Assert no file remains under the MediaVault objects root for any sha256 the DB records as
   promoted, and no file remains in staging for any sha256 recorded as published.

4. Reconcile the append-only unlink log against the excluded set: every unlink has a
   corresponding excluded sha256, and every excluded sha256 has exactly one unlink. Neither
   direction may have orphans.

Budget: a full re-hash of the 451.2e9 bytes is ~2 h at step 5's measured 62.0 MB/s with one
reader (it was costed at 4-5 h against the earlier 22-35 MB/s). If that is too long to
accept, scope check 1 to rows the DB marks in-flight plus a random sample of the rest — and say
explicitly which you did, because a scoped sweep is a weaker claim than a full one.

Print elapsed and throughput every 60 seconds. Nothing else may touch G: while this runs.

Finally, commit and push before you stop. The whole build lives on one branch,
build/rebuild — create it off main if it does not exist yet, otherwise stay on it.
Stage by explicit path; never `git add -A` or `git add -u`. No *.sqlite3, *.jsonl,
*.log and no media files. Then `git push -u origin build/rebuild`. If you left
anything uncommitted on purpose, say which and why.
```

**Gate:** zero hash mismatches, zero missing names, zero objects at `nlink == 2`, and the unlink
log reconciles in both directions. Only now is the promotion complete.

---

## After step 16

The three things you asked for exist: triage happened, the grid is one infinite deduped page,
and clicking a photo opens Explorer while `origins.jsonl` holds every original path.

Four decisions from `PLAN.md` § "Open decisions" are still open and none of them block the
above. **restic verification is no longer one of them — it was settled in step 7 on 2026-08-02.**
Step 7 ran `restic check` including the full `--read-data` (all 24,785 packs, no errors), and its
Phase D reconstructed all 1,374,298 files from the packs and compared each against the disk, with
zero same-size same-mtime disagreements. That is the stronger claim: not merely that the repo is
internally consistent, but that it holds the same bytes the disk holds. It closes the
mtime-preserving in-place edit, which no sample and no mtime argument can exclude.

**Three things this build never establishes, and the last is the one that will bite first.**

**There is no backup of `G:\vault`.** After step 14 the vault is the sole live representation of
the library, as single extents on one USB HDD, last verified at step 16 and never again. A single
bad sector kills the object under both names at once. The content is at least *recoverable* —
`origins.jsonl` maps every content hash to its original `G:\photos` path and the off-site restic
repo holds those bytes — so this is a restore-from-cold problem, not a data-loss problem. That
recoverability is entirely contingent on `origins.jsonl` existing, which as of 2026-08-02 it does
not.

**There is no procedure for adding photos once the build ends.** Raised 2026-08-02. Every step
here is a one-off migration of a fixed 1.07 TB corpus; nothing says what next month's card dump
costs or where it goes. `G:\photos` is deleted at the Gate, so it is not the answer, and the
vault has no import path.

**This does not block anything and was deliberately deferred.** The architecture was audited
against future import: it needs **no schema migration**, `walk_disk` and `Hasher` are already
root-parameterised so their cost scales with the new directory rather than the corpus, dedup is
a primary-key lookup on `file.sha256`, `file.state='pending'` is already the arrival state, and
`state` is keyed on `sha256` rather than `photo.id` so re-grouping cannot disturb triage
decisions. By this project's own test — *if adding it later is a migration rather than a
rewrite, add it later* — it passes.

Two facts for whoever does design it: `--force` is **not** part of it — new files are always
read, and a canonical object cannot be silently edited in place because its filename *is* its
SHA-256 — and content addressing makes scrubbing a local re-hash rather than a restore. The
vault is also ≈211k entries against `G:\photos`' 1.38M, so the metadata-walk cost that makes
whole-tree backup of the source annoying is ~5× smaller. See `PLAN.md` "Open decisions" 5.

**`state.sqlite3` is only half-covered, and it is the one artefact in this project that cannot be
regenerated.** `PLAN.md` labels it *Irreplaceable* and it is: `triage_rule` and `triage_override`
are the output of steps 10–11, which is hours of human judgement over 1.37M files, and every
future favourite and rating lands there too. Everything else is derivable — `catalog.sqlite3`
rebuilds from a re-scan, derivatives regenerate from the substrate, the vault restores from restic
via `origins.jsonl`. This file does not.

`python -m photolib.backup_state` now snapshots it to `C:\photolib-backups`, a different physical
disk from `E:`, and step 11's gate calls for a snapshot after every triage session. **That covers
a dead drive and not a dead building.** The snapshots are ~20 KB before triage and a few MB after,
so add them to step 13b's upload set — the plan currently uploads the restic repo and
`origins.jsonl` and nothing else, and an off-site copy of the library that omits the decisions
about the library is a strange thing to have.

Feature work after that arrives as a migration plus a per-feature version bump, computed from
the 1536px substrate rather than from 419 GB of RAW. That is what the substrate was for.

---

*AI-assisted: review, test and fact-check before relying on any step's output. Step 14 in
particular deletes data — read its dry run.*
