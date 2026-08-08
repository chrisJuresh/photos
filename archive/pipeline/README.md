# The build pipeline

Sixteen one-shot modules that produced the vault, run to completion between
2026-08-01 and 2026-08-07. **Nothing here is needed to serve the website.** They stay
importable and tested because they are the record of how the catalog was built and
because a future import will reuse their helpers.

They import `config`, `db`, `migrate`, `triage` and `reveal` from `photolib`; the
arrow never points the other way.

Read this file when you are re-running a build step or need to know what one did.
Day-to-day website work does not need it — that is why it is here and not in
`CLAUDE.md`.

`archive/PLAN.md` is the long-form build plan and holds the evidence behind the
deletion gate. `archive/BUILD-PROMPTS.md` is the eighteen prompts the build was
driven by.

---

## adopt_mediavault

Imports MediaVault's path history and extended metadata into the catalog. Re-running
is safe: it inserts nothing twice, but it does re-read the 146,034 sidecars, so allow
~40 min. `--meta` additionally lays the exiftool readings out under `meta_root`, which
is hours of USB-HDD head time and is off by default.

```bash
python -m archive.pipeline.adopt_mediavault
```

## capture_time

Resolves capture time for every adopted file. Seconds, pure DB plus one read-only
manifest scan. Re-running is safe and lands on the same answer. `--validate`
additionally prints the masked-shape enumeration and the per-rule EXIF agreement that
decided which filename patterns are adopted. It **does not write `photo`** and used to
— that is Phase 5's `group`; run it after this or the grid keeps the previous
grouping's sort keys.

```bash
python -m archive.pipeline.capture_time
```

## thumbnails

Copies MediaVault's existing 384px WebP derivatives onto the NVMe as grid thumbnails,
checksum-verified. ~17 min at 32 reader threads. It generates nothing: assets whose
derivative errored in v1 stay without one. Re-running copies only what is absent, so
an interrupted pass resumes. `--limit N` stops after N for a throughput measurement.

```bash
python -m archive.pipeline.thumbnails
```

## prefilter

Writes the Phase 1 categorical prefilter — nine `exclude` rules on extension at `seq`
0–8 in `state.sqlite3` — and reports what each removes. Seconds, pure SQL, zero I/O.
It writes nothing to the catalog: no `file.state` becomes `excluded` and no `photo`
row moves, so the grid is unchanged and that is not a failure. Re-running with the
rules in place is a no-op that keeps their `created_at`; a rule set that is not
exactly the prefilter is refused rather than overwritten. Deleting a rule row
reverses it.

```bash
python -m archive.pipeline.prefilter
```

## phase2a

Phase 2a's verification read, in three passes that each resume on their own: `a`
re-hashes all 146,034 MediaVault objects against the SHA-256 and the byte count in
their own filenames (451.2 GB, the only large read in the project, **one** reader
because it is bandwidth-bound); `b` turns the 1,486 wrongly-rotated `.arw`
derivatives upright; `c` computes pHash, dHash, ThumbHash and the 18 quality scalars
from the repaired 1536px substrate, 24 readers feeding 12 bounded decode workers.
`bench` projects the wall time without writing anything. **`b` must precede `c`** or
every ARW hash comes off pixels that are 90° out. One lock file at
`E:\photolib\phase2a.lock`; a lock left by a killed run is detected by its PID and
cleared.

**Nothing else may touch `G:` while this runs, and `F:` is the same physical disk** —
both are partitions of disk 3, the WD Elements USB HDD. A concurrent 15 MB/s write to
`F:` measured pass `a` at 27.4 MB/s against the 62.0 the volume does when idle.

```bash
python -m archive.pipeline.phase2a
```

The repaired ARW derivatives are **written to the new build's own trees, never over
v1's**: the 1536px substrate to `deriv_root`, the 384px tile over step 5's copy on
`thumb_root`. That is 2,972 files, not the 5,944 the plan anticipated — the 192 and
768 tiers exist only inside MediaVault, nothing here reads them, and rewriting a
checksummed MediaVault derivative in place would turn a verified tree into 1,486
apparent corruptions. So the working 1536 substrate is split: 1,486 assets under
`G:\vault\deriv`, the rest still under `G:\MediaVault\derivatives`.

## triage_survey

Builds the triage survey — the derived, regenerable projection of `origin` and `file`
that the rule engine reads. ~40 s, pure SQL, no media root is opened. It collapses
1,374,328 paths onto a counting surface of 448,512 buckets, which is what lets a rule
set be re-costed in ~220 ms instead of ~2.9 s. Re-run it after anything that changes
the catalog — `capture_time`, `probe`. It holds no decisions, so dropping every row
loses nothing.

```bash
python -m archive.pipeline.triage_survey
```

## probe

Lives in `photolib`, not here, because the website's screen 3 is what reads its output —
but it is a build-sequence step and this is where the sequence is written down.

Fills `file.width`/`height` for triage screen 3 by reading image **headers**, never
decoding. Runs only on what the current rule set still keeps, which is why
`archive/PLAN.md` puts it after screens 0–2. On this corpus the worklist is **25
files** and all 25 are unreadable — MediaVault already measured every raster the
library holds, including 54,896 of the 54,899 `.png`. `--dry-run` reports the worklist
and stops; `--ext` overrides the format list.

```bash
python -m photolib.probe --dry-run
```

## phase2b

Phase 2b's gap fill: the step billed as the only one that reads the photos root,
which on this corpus reads none of it. ~3m20s. Two populations. **1** — the 1,659
MediaVault assets v1 could not preprocess, read from the object and decoded three
ways: an ffmpeg poster frame for video (`scale` before `thumbnail`, or a 4K frame
buffer breaks the worker's memory cap), libraw for DNG (embedded preview when it can
make a 1536px substrate, half-size demosaic when it cannot — this corpus's previews
are 504×376, so it always demosaics), a normal decode for stills. **2** — whatever
survives triage with no MediaVault asset, copied into `G:\vault\.staging` and
hash-verified first; that set is currently **empty** and the pass says so rather than
skipping silently. One decode per file produces the 1536px substrate on `deriv_root`,
the 384px tile on `thumb_root`, ThumbHash, pHash, dHash and the 18 quality scalars.
Idempotent on `file.quality IS NULL`; failures persist as `{"error": …}` so 407 broken
stubs are not re-read for ever, and `--retry-errors` clears them. Needs `ffmpeg` and
`exiftool` on PATH and `rawpy` installed. `bench` projects the wall time without
writing anything.

```bash
python -m archive.pipeline.phase2b bench --n 500
```

## promote

Phase 4's promotion: hardlink every triage-kept MediaVault object into `G:\vault`
under `<aa>\<bb>\<sha256><ext>`, unlink the MediaVault name, and unlink the 107,658
excluded objects outright. **The only step that deletes.** Default mode is a dry run;
`--execute` additionally requires a typed phrase carrying the counts derived in that
same process. ~1.5 h, of which 917 s is the cold object-tree enumeration it does
before touching anything. Per object, classified immediately before every action —
never link-all-then-unlink-all, and never a branch on `ERROR_ALREADY_EXISTS(183)`.
Resumable off the `promotion` ledger, whose rows are written before the syscalls they
describe; `--repair` finishes anything a sharing violation left half-linked, and
`--limit N` bounds each population for a rehearsal. Every delete is appended to
`E:\photolib\promote-unlink.log` as one JSON object per line, with the rule or
override that condemned it. Nothing else may touch `G:` while it runs, Explorer
windows included — CPython's `open()` passes no `FILE_SHARE_DELETE`, so any reader
blocks the unlink.

```bash
python -m archive.pipeline.promote
```

## promote_verify

Step 16, the pass that finds out what step 14 actually did — it destroys names and
verifies nothing itself. Re-hashes every promoted vault name against its recorded
SHA-256 (435.6 GB, one reader, **~1h29m** — measured at 81.7 MB/s on 2026-08-07, not
the 62.0 the estimate assumed; the vault tree reads faster than MediaVault's did),
asserts `nlink == 1` and read-only and containment per object, asserts that nothing
survives under MediaVault's objects root and that staging is empty *positively*, and
reconciles the delete log against the excluded set in both directions. Writes
nothing: the connection is `mode=ro`. Never run it concurrently with `promote` or
`promote --repair`.

```bash
python -m archive.pipeline.promote_verify
```

## group

Phase 5's grouping, and **the only thing that builds `photo`**. 12 s, pure DB, no
media root is opened. Until this existed nothing filtered the grid to what triage
kept: `capture_time.resolve` rebuilt `photo` with an `INSERT ... SELECT sha256 FROM
file` carrying no `WHERE` clause, which was one tile per MediaVault asset only because
`file` held 146,034 rows at the time — it holds 787,798 now. `capture_time` no longer
writes `photo` at all, and a tile is a group of files in state `published` **that no
`triage_override` of `exclude` condemns**. That second half is how a photograph is
removed from the grid after the promotion: Phase 4 skips a row already in state
`published`, so a post-promotion exclusion has no `file.state` to move to, and it is
read here rather than in `photolib.browse` because this is the only builder of `photo`
— a tile that should not exist never exists, instead of every page, count, facet and
tree query carrying a subquery to hide one. Invariant 3 is intact: the override is a
row, the vault object is untouched and stays `published`, and deleting the row puts
the tile back on the next rebuild. Two tiles are hidden that way today, which is why
`photo` holds 24,534 and not the 24,536 the measurements quote.

RAW+JPEG pairing on `(directory, stem)` with a corroborating EXIF timestamp collapses
**13,840 of 38,376 tiles into 24,536**; every group is exactly one raw and one JPEG,
none is larger. Perceptual near-duplicates are computed and stored in `near_dup`
(10,717 groups over 28,935 files) and **collapse nothing** — `photo` does not join
them. See `docs/adr/0001-stack-on-capture-time-not-phash.md` for what that table is
and is not good for.

Idempotent, and incremental: `group.extend` adds files by index seek off `pair_key`
and `near_band` at ~17 rows per photo, regardless of corpus size. Re-run it after
anything that changes the kept set or `capture_time` — including writing or clearing
an override, which the grid does not see until it does.

**Triage's Apply to grid button is this step**, plus `backup_state` ahead of it: the
website spawns the two as a background job and then drops the facet vocabulary and
every `total` it had memoised, which is what used to need a server restart. See
`photolib/rebuild.py`. Running it here by hand is still the same rebuild, and a
server that was up while you did needs restarting to notice — nothing tells it.

```bash
python -m archive.pipeline.group
```

## backup_state

Snapshots `state.sqlite3` — the triage rules and overrides, the one thing here that
cannot be regenerated — onto `C:`, a different physical disk from `E:`. Instant,
~20 KB before triage. Uses `VACUUM INTO`, so it is safe against a live WAL, and it
refuses to write onto the source's own volume. Run it after every triage session —
or press Apply to grid, which runs it first and then rebuilds the tiles.

Because it never prunes and never overwrites, the backup root is a ladder of restore
points rather than a single latest copy: one per run, each of them the settings as
they stood at the end of that run. `python -m photolib.restore_state` is the way back
down it, and a triage session is undone by restoring the snapshot from *before* it.

```bash
python -m archive.pipeline.backup_state
```

## origins

Exports `<vault_root>\origins.jsonl`, the only content-hash → original-path map and
the thing `G:\photos` is deleted behind. **All 787,798 distinct files, including the
749,422 triage excluded** — the file exists so a *wrong exclusion* can be undone, and
a wrongly excluded file is by definition not in the kept set. One self-contained JSON
object per line, UTF-8, no header, no compression, readable with nothing but a text
editor. **Append-only**: the first export is sorted by `sha256`, later runs append at
the end and never rewrite, so a reader takes the union of every `paths` array for a
hash and the scalars from its last line. 2m54s, 300 MB, pure DB. A first export goes
to `origins.jsonl.partial` and is renamed in, so an interrupted run leaves nothing to
append to. `--verify` reconstructs `origin` from the JSONL alone into a scratch
database, sharing no code with the export, and diffs the path sets both directions —
5m12s.

```bash
python -m archive.pipeline.origins --verify
```

## inventory

The Phase 0 inventory: five phases as separate subcommands, all resumable, sharing a
work database at `E:\photolib\phase0.sqlite3` that is regenerable and never committed.
**It ran to completion on 2026-08-02 and does not need re-running** — `origin` holds
all 1,374,328 rows and the deletion gate's evidence is recorded in `archive/PLAN.md`
"Phase 0". `a` walks and reconciles against restic, `b` is the fail-fast sample, `c`
hashes everything and writes `origin`, `d` verifies every file against the repo, `e`
is the top-up backup and the **only** write to `G:\ResticPhotos`.

```bash
python -m archive.pipeline.inventory a
```

---

## restic and the off-site copy

Every restic read command in `archive/pipeline/restic_repo.py` carries `--no-lock`,
because the default writes a lock file into the repository being verified. The
password is never handled here: it is a DPAPI blob reached by passing `config.toml`'s
`restic_password_command` to restic's `--password-command`. Never echo it, never write
it to a file, never put it on a command line.

**`restic backup --force` is a scrub, not a routine cost. Adding new files never needs
it.** `--force` defeats change detection, which only applies to files already in a
parent snapshot; a new file has nothing to be skipped against and is always read. It
is needed only for a file edited in place at *identical size and mtime* — impossible
for source media under hard rule 2, and impossible for a vault object, whose filename
is its own SHA-256. A `--force` pass over `G:\photos` is **8h46m**; a whole-tree
incremental is ~30–40 min (the 1.38M-entry metadata walk, unrelated to `--force`); a
backup scoped to one new directory is seconds. If you find yourself about to reach for
`--force`, check which of those three you actually need.

The off-site copy lives on `a3server` (`ssh -p 22222 chris@82.14.247.27`):
`/mnt/bay6/ResticPhotos` for the repo, `/mnt/bay6/photolib-backup/` for the catalogue
databases. Verified 2026-08-02 by hashing every repo file server-side and comparing
each against its own filename — restic content-addresses packs, index files and
snapshots, so that establishes the same property as `check --read-data` without a
password, without restic on the server, and without pulling 436 GB over a 11.7 MB/s
link. Prefer that technique over a remote `check --read-data` whenever a verified
local copy exists. **Never put a backup anywhere a download client or an *arr app
manages** — the repo spent ~29 hours seeding to the DHT from qBittorrent's
completed-downloads directory before it was moved.
