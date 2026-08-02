# Build plan

Three deliverables, in order:

1. **Triage** — decide what not to ingest, by looking at everything.
2. **Grid** — one infinite page of every photo, deduped, click to reveal in Explorer.
3. **Neither of the above painting us into a corner** when v1's features get rebuilt.

Nothing here is built yet. This is the plan.

## Ground facts

Measured 2026-07-31 / 08-01, not assumed.

| | |
|---|---|
| `G:\photos` | **1,374,328 regular files**, 1,073.53 GiB, plus 8,052 WSL symlinks that are not files at all (see below) |
| `G:\ResticPhotos` | 406.22 GiB (436.18 decimal GB) in 24,785 packs. **3 snapshots** since 2026-08-02: `e7d60189`, `ce88f697`, and Phase 0's top-up `1e80c50e`. Enumerated and fully reconciled 2026-08-01: 1,374,298 file nodes, 353,949 dirs, **zero** symlink nodes, **zero** U+FFFD paths. `check --read-data` clean over all packs 2026-08-02. Off-site at `a3server:/mnt/bay6/ResticPhotos`, integrity and completeness verified 2026-08-02; behind by 4 files from the top-up — **all git internals, zero media; accepted, not blocking** |
| Off-site catalogue copies | `a3server:/mnt/bay6/photolib-backup/` — `catalog.sqlite3`, `phase0.sqlite3`, `manifest.sqlite3`, SHA-256 verified 2026-08-02. `manifest.sqlite3` is **not** in the restic repo and not regenerable, so this is its only second copy |
| v1 catalogued | 1,374,328 files — **exactly the regular-file count. There was no v1 shortfall; the earlier census over-counted.** `source_files` agrees with the 2026-08-02 walk to the row |
| v1 called "media" | 251,087 instances / 966.1 GB → 146,034 distinct / 420.17 GB |
| Whole-corpus hashes | **787,798 distinct SHA-256** across 1,374,328 paths (measured 2026-08-02). `nlink > 1`: **zero**, no hardlinks anywhere |
| Exact duplicates | **546 GB of logical bytes** — not a reclaimable-space figure (see below). Measured across the whole corpus: 586,530 redundant paths / **603.8 GB**, and with no hardlinks these are real distinct objects |
| With EXIF camera | 37,822 |
| RAW | 16,388 files / 293.9 GB (`.rw2` 13,893, `.arw` 2,346, `.dng` 146) |
| Est. grid tiles after RAW+JPEG pairing | ~30,000 |
| `G:\MediaVault\objects` | 146,034 files / 420.17 GB — complete, one per asset |
| `G:\MediaVault\derivatives` | 434,673 files / 21.65 GB = 412,828 thumbnail (192/384/768/1536 × 103,207) + 21,845 detail (2560, image only, **zero RAW**) |
| `G:\MediaVault\records` | 146,034 JSON sidecars / 1.22 GB |

Hardware, which drives most decisions:

| Volume | Disk | Type | Free |
|---|---|---|---|
| `G:` | WD Elements 25A3 | **USB HDD** | 1,790 GB |
| `C:` | CT1000MX500 | SATA SSD | 220 GB |
| `E:` | WDC SN530 | NVMe SSD | 150 GB |

16 logical CPUs. exiftool 13.x, ffmpeg/ffprobe 8.1.1, restic 0.19.1, python 3.14, node all present.

**One USB HDD head is the bottleneck for everything.** Every phase below is designed around
reading it as few times as possible.

**Measured G: throughput — the number depends entirely on access pattern, and both earlier
figures were measured on unrepresentative workloads.**

Random access, measured over MediaVault's sha256-sharded object store: streaming SHA-256 at
**22.5 / 28.4 / 34.5 MB/s**; cold random reads 2.7–23.6 MB/s; ~70 read IOPS at 53 ms average
latency; cold `stat` 31.3 ms mean / 297 ms p95 against 0.010 ms warm, a 3,000× ratio. That store
is hash-sharded, so consecutive objects are deliberately scattered — it is the worst case, not
the typical one.

Directory-order access over `G:\photos`, measured 2026-08-01, which is what a walk actually does:

| workload | rate | concurrency |
|---|---|---|
| big files (>1 MiB), directory order | 79.4 MB/s | 1 thread |
| big files, directory order | **94.4 MB/s** | 4 threads |
| big files, directory order | 67.9 MB/s | 16 threads — head thrashes |
| big files, random order | 59.6 MB/s | 1 thread |
| small files (≤1 MiB), directory order | 105.8 / 146.1 / 286.2 / **400.8** files/s | 1 / 6 / 16 / 40 threads |
| small files, random order | 26–33 files/s | any thread count |
| metadata-only `scandir` walk | 1,450 entries/s | 1 thread |

Three things follow and all three are load-bearing. **Concurrency helps the two regimes in
opposite directions** — small files want ~40 workers (3.8× over serial), big files want ~4 and
degrade past that; one pool for both is wrong. **Random order destroys the small-file regime** —
26–33 files/s versus 401, a 13× penalty, because it defeats readahead; never hash in hash order
or shuffled order. **110 MB/s was optimistic for random access and roughly right for sequential
big-file reads**; the 3–5× correction applies to random-access estimates only. Do not apply one
figure to both.

**Volume facts, measured.** `G:\photos`, `G:\MediaVault`, `G:\ResticPhotos` and `G:\backup`
are one NTFS volume (serial `0xb42554ea`) on partition 2 of disk 3 — one enclosure, one
spindle, one USB bridge. That is what makes Phase 4's hardlink legal, and it is also why two
copies here is one hardware failure from zero. `G:\MediaVaultImports` **does not exist**. The
USN change journal is **not active**, so no journal-based reconciliation is available. 8dot3
name creation is disabled, so 146k near-identical 107-char hex names do not hit the O(n²)
short-name pathology. Long paths work unprefixed (369 chars verified). **There is no undelete
affordance**: `DeleteFileW` bypasses the Recycle Bin and VSS cannot be queried from a
non-elevated token.

**`G:\photos` pathological-input census** (own read-only walk, 2026-08-01, 953 s at 1,450
entries/s): 1,382,380 directory entries, 353,980 directories, 1,152,691,239,120 bytes, 123,710
distinct sizes, 896 non-ASCII filenames, 55 paths over 255 chars, 1 file over 2 GiB, 0 stat
errors.

**Of those 1,382,380 entries only 1,374,328 are files.** 8,052 are WSL symlinks — NTFS reparse
points carrying tag `0xa000001d` (`IO_REPARSE_TAG_LX_SYMLINK`). They report `st_size == 0`,
`DirEntry.is_symlink()` returns **False** for them because that call only recognises
`IO_REPARSE_TAG_SYMLINK`, and **none of them can be opened** (200/200 sampled failed with
`OSError`). Both restic and v1 correctly declined them. A walk that classifies with `is_file()`
mis-counts them as 8,052 zero-byte files and then produces 8,052 open errors, which under the
"never treat could-not-open as no-duplicate-found" rule becomes 8,052 spurious hard stops. Test
`st_file_attributes & FILE_ATTRIBUTE_REPARSE_POINT` (`0x400`) instead. Genuine zero-byte files:
**11,608**, all present in the snapshot.

**Size distribution, and it governs every I/O estimate here.** 87.4% of files hold 0.64% of the
bytes; 104,745 files (7.6%) hold 1,130.35 GB (98.1%). These are two different workloads that
want different concurrency, and a single MB/s figure describes neither.

| bucket | files | %files | GB | %bytes |
|---|---|---|---|---|
| 0 B | 19,660 | 1.42% | 0.00 | 0.00% |
| 1 B – 4 K | 782,428 | 56.60% | 0.75 | 0.06% |
| 4 K – 64 K | 406,635 | 29.42% | 6.67 | 0.58% |
| 64 K – 1 M | 68,885 | 4.98% | 14.91 | 1.29% |
| 1 M – 4 M | 34,504 | 2.50% | 103.92 | 9.02% |
| 4 M – 16 M | 38,414 | 2.78% | 264.12 | 22.91% |
| 16 M – 64 M | 31,280 | 2.26% | 612.14 | 53.11% |
| 64 M – 1 G | 550 | 0.04% | 109.01 | 9.46% |
| > 1 G | 24 | 0.00% | 41.16 | 3.57% |

Byte split by top-level subtree. `home-chris arch backup` is 78.5% of the entries and 20% of the
bytes; the two SD-card trees are 1.2% of the entries and 18% of the bytes:

| subtree | entries | GB | big files (>1 MiB) |
|---|---|---|---|
| `10tb arch backup` | 256,833 | 458.66 | 47,880 |
| `home-chris arch backup` | 1,085,547 | 230.06 | 17,377 |
| `10tb win 11-04-24 backup` | 12,368 | 171.02 | 12,302 |
| `lumix f 7-15-26 sd` | 10,284 | 126.96 | 10,284 |
| `usb f 7-15-26 sd` | 6,204 | 76.29 | 6,089 |
| `arch laptop backup` | 5,579 | 51.90 | 5,338 |
| `a52s 5g backup` | 5,492 | 37.44 | 5,412 |
| `win pc 7-15-26` | 72 | 0.34 | 63 |

**Units.** The "GB" labels inherited from earlier drafts of this document are GiB: 1,073.53 "GB"
is 1,152,691,239,120 bytes = 1,073.53 GiB = 1,152.69 decimal GB, and MediaVault's 420.17 "GB" is
451,152,506,927 bytes. The tables in this section and all Phase 0 timings use decimal GB derived
from raw byte counts. Do not mix the two when comparing figures across sections.

**On "546 GB of exact duplicates".** That is a v1-derived logical-bytes figure and it is not
reclaimable space. NTFS hardlinked names are one physical extent with several names, and
sparse files share content with their dense twins while occupying different space — restic's
node JSON on Windows carries no `links`, `inode` or `device` field, so a restic-derived
inventory cannot see either. Capture `st_nlink` and the NTFS file ID during the walk before
quoting any space-saving number.

## What MediaVault already provides

Measured, not assumed. This is the largest single saving available and the plan is built
around it.

| Output | Coverage |
|---|---|
| Canonical objects | 146,034 / 146,034 — complete, self-verifying (filename **is** the SHA-256) |
| Derivatives 192/384/768/1536 | 103,207 ready, 42,827 error |
| Detail 2560 | 21,845 ready |
| `asset_features` — full quality vector | 103,207 ready — **used as a spec, not adopted as values** |
| `asset_extended_metadata` | **145,909 ready of 146,034 (99.9%)** |
| `perceptual_hash` | **0 of 146,034 — never computed** |
| Path history | 251,824 asset↔path links; also in the 146,034 `records` sidecars |

The 42,827 preprocessing failures look alarming and mostly are not:

| Extension | Count | Verdict |
|---|---|---|
| `.svg` | 22,059 | Excluded by Phase 1 anyway |
| `.ts` | 18,789 | Excluded by Phase 1 anyway |
| `.msg` | 198 | Excluded by Phase 1 anyway |
| real video (`.mp4`/`.mts`/`.mkv`/`.avi`/`.mov`/`.webm`) | ~1,464 | **Genuine gap** |
| `.dng` | 146 | **Genuine gap** |
| `.jpg` | 25 | **Genuine gap** |

By media kind: `raw_image` **16,239 ready / 149 error — 99.1%**. The 294 GB Lumix and Sony
corpus is fully processed. `image` 86,968 ready, its errors overwhelmingly the SVGs. `video`
0 ready — but 18,789 of those "videos" are TypeScript files.

**After the prefilter, ~98% of the material that matters is already derived.** The real gap
is ~1,800 files.

**Read that as "of MediaVault", not "of the corpus".** The prefilter leaves 104,376 of these
146,034 assets, and 103,207 of those carry derivatives — 98.9%. But it leaves **685,812** files
overall, so measured against everything that reaches triage the derived share is 15%. Nothing is
wrong with the sentence; it is the difference between the pile v1 already worked and the pile
Phase 0 found, and triage is what closes the gap between them.

**The v1 preprocessing run finished — do not try to resume it.** Verified: 146,034 distinct
assets in `asset_features` (exactly the asset count), 0 assets with no row, one analyzer
version (`quality-features-v1`), zero `pending`. The 42,827 failures all carry
`error_code = feature_decode_failed` and are systematic per format — video 20,296/20,296,
`.dng` 146/146, `.svg` 22,059/22,060 — while `raw_image` succeeded at 99.1%. Entire format
classes failing at 100% is a decoder gap in the code, not an interrupted run; an interrupted
run leaves a random tail. Re-running produces identical results. The ~1,635 recoverable files
(video, DNG, JPEG) are Phase 2b's job, using ffmpeg and libraw — the decoders v1 lacked.

Two caveats that do not go away:

- **`perceptual_hash` is empty.** RAW+JPEG pairing evidence and all near-duplicate work must
  be computed regardless — but from the existing 1536px derivatives, not from RAW.
- **Capture time is populated for only 38,767 (26.6%)** and GPS for 6,052 (4.1%), tracking
  the 37,822 assets with camera EXIF. Everything else needs the filename→mtime fallback,
  which is pure DB work over `origin`.

**Date resolution is the highest-risk part of the build, not a detail.** v1's
`calendar_buckets` contains exactly two rows: "Ambiguous capture time" (32,316) and "Unknown
capture time" (113,718), summing to all 146,034. It resolved *zero* dated buckets — it had
EXIF dates for 26.6% of the corpus and still classified every one as ambiguous, with no
fallback for the rest. Since the grid's entire ordering is capture time, getting the fallback
chain right is what separates a usable product from v1's outcome. Record `taken_src` per
photo so low-confidence dates are visible rather than silently mixed in.

The cause is policy, not missing data. Of 146,034: 107,267 have no date source, **32,316 have
a `DateTimeOriginal` flagged ambiguous**, and only 6,451 resolved cleanly. EXIF
`DateTimeOriginal` carries no timezone offset, so v1 could not pin it to an unambiguous UTC
instant and gave up. For a personal archive that is the wrong call — **treat
`DateTimeOriginal` as authoritative local time**, which takes coverage from 6,451 to 38,767
before any fallback runs. Store local time plus a nullable offset; do not require the offset.

There is also a plain bug to avoid repeating: `calendar_buckets` reported 113,718 "unknown"
while only 107,267 assets lack a date source. The 6,451 difference is exactly the set that
*did* resolve, so the projection bucketed its only well-dated assets as unknown.

**Downstream v1 state is not worth adopting, and some of it is a trap:**

| Table | Rows | Verdict |
|---|---|---|
| `photo_entities` / `photo_entity_members` | 146,034 / 146,034 | 1:1 with assets — no grouping happened. Adopting it copies the asset list under another name |
| `raw_jpeg_groups` / `raw_jpeg_members` | 0 | Pairing found nothing, despite a Lumix card of `P108xxxx.JPG`+`.RW2` pairs. `perceptual_hash` being empty starved its multi-signal test |
| `stack_feature_inputs` | 27,500 | **19% of 146,034 — stopped mid-run.** Looks complete if you only check the table is non-empty |
| `stacks` / `stack_members` / `stack_candidate_edges` | 0 | Never built |
| `junk_signals` / `junk_profiles` / `junk_effective_results` | 0 | Never ran |
| `photo_user_state` | 146,034 | All defaults — `photo_user_state_events` is 0, so no decision was ever made. Nothing irreplaceable |
| `calendar_buckets` | 2 | See above |
| `folder_hierarchy_nodes` / `facet_rollups` / `map_clusters` / `equipment_rollups` | 16,131 / 12,357 / 2,566 / 63 | Materialized projections this design replaces with live queries |
| `import_batches` / `import_items` / `saved_views` | 0 | The inbox path never ran; this was a direct backfill |

Phase 2a takes objects, derivatives, `asset_features`, `asset_extended_metadata`, and path
history. Everything downstream of preprocessing is empty, partial, or filler.

**Why this is safe to adopt.** The safety hold's 19 critical findings are about locks, path
containment, publication primitives, and UI safeguards — not about whether extracted
metadata is correct. And reading v1's *data* with new code is not running v1's *code*, which
is what the hard rule prohibits. Every adopted claim is independently checkable: an object's
filename is its SHA-256, and each derivative row carries `checksum_sha256`. Nothing is
adopted on the strength of a database row alone — only on a checksum that verifies against a
file that is actually present. That single rule retires `F06`, `F07`, `F15`, and `F54` for
this purpose.

## Storage layout

| What | Where | Why |
|---|---|---|
| Canonical objects | `G:\vault\<aa>\<bb>\<sha256><.ext>` | Only volume with room. Real extension so Explorer can open it. |
| Staging (transient) | `G:\vault\.staging\<content_key>` | Holds bytes between the read pass and triage promotion. |
| Working derivative 1536px | `G:\vault\deriv\<aa>\<bb>\<sha256>.webp` | ~36 GB. The reprocessing substrate — see "Why 1536". |
| EXIF sidecar | `G:\vault\meta\<aa>\<bb>\<sha256>.json.gz` | ~200 MB. Full exiftool output, never in the DB. |
| Grid thumbnail 384px | `E:\photolib\thumb\<aa>\<sha256>.webp` | **NVMe.** Read on every scroll. Adopted from MediaVault, not regenerated. |
| `catalog.sqlite3` | `E:\photolib\` | Regenerable. Written only by the pipeline. |
| `state.sqlite3` | `E:\photolib\` | **Irreplaceable.** Written only by the app. Snapshotted to `backup_root` on `C:` by `photolib.backup_state`, and part of Phase 13b's upload set. |
| `origins.jsonl` | `G:\vault\` | Export of the path mapping. Goes in the backup. |

Two databases, joined by `ATTACH`. The split buys two things: the pipeline never contends
with the UI for a write lock, and the entire catalog can be dropped and rebuilt without
losing a single human decision. Splitting later is a migration plus a change at every call
site; splitting now is two file paths.

## Schema

`catalog.sqlite3` — three tables carry the product.

```sql
-- one row per path ever seen. THE one-to-many store.
CREATE TABLE origin (
  id           INTEGER PRIMARY KEY,
  path         TEXT NOT NULL UNIQUE,   -- G:\photos\lumix f 7-15-26 sd\DCIM\...
  root         TEXT NOT NULL,          -- 'lumix f 7-15-26 sd'
  ext          TEXT NOT NULL,
  size         INTEGER NOT NULL,
  mtime_ns     INTEGER,
  sha256       TEXT,                   -- filled when the bytes are read or adopted
  nlink        INTEGER,                -- from os.stat during the walk
  file_id      INTEGER,                -- NTFS file ID; hardlinked names share one
  seen_at      TEXT NOT NULL
);
CREATE INDEX origin_sha  ON origin(sha256);
CREATE INDEX origin_fid  ON origin(file_id);

-- one row per distinct byte sequence
CREATE TABLE file (
  sha256       TEXT PRIMARY KEY,
  size         INTEGER NOT NULL,
  ext          TEXT NOT NULL,
  kind         TEXT,                   -- image | video
  width        INTEGER, height INTEGER,
  taken_at     TEXT, taken_src TEXT,   -- exif | filename | mtime | none
  camera       TEXT, lens TEXT,
  gps_lat      REAL, gps_lon REAL,
  phash        INTEGER, dhash INTEGER,
  thumbhash    BLOB,                   -- ~30 bytes, instant placeholder
  quality      TEXT,                   -- small JSON: sharpness, entropy, clipping, …
  vault_relpath TEXT,
  state        TEXT NOT NULL,          -- pending | adopted | read | staged | published | excluded
  feature_ver  TEXT NOT NULL           -- per-feature versions, not one global string
);
CREATE INDEX file_state ON file(state);
CREATE INDEX file_phash ON file(phash);

-- one row per grid tile
CREATE TABLE photo (
  id           INTEGER PRIMARY KEY,
  rep_sha256   TEXT NOT NULL REFERENCES file(sha256),
  sort_key     TEXT NOT NULL           -- capture timestamp. NEVER a rank.
);
CREATE INDEX photo_sort ON photo(sort_key DESC, id DESC);
```

**One identity key: `sha256`.** An earlier draft carried a second, `restic_key` —
`sha256(ordered blob id list)` — on the theory that it was available *before* the bytes were
read and could group duplicates cheaply. Spike A killed it (see Phase 0): a stored blob list
is the chunk list from the last time restic *read* the file, so equal lists do not imply equal
bytes. There is no pre-read dedup key. Every duplicate group is established by a full-file
SHA-256, obtained from the repo and from disk and required to agree.

**`file_id` is not an identity key either — it is the opposite.** Two `origin` rows sharing a
`file_id` are two *names for one physical file*, not two copies. They must never be counted as
reclaimable space and never offered as reject-the-duplicate candidates. `sha256` equality
across *different* `file_id`s is what a real duplicate looks like.

`state.sqlite3` — human decisions, keyed on `sha256`, never on `photo.id`.

```sql
CREATE TABLE triage_rule (
  id INTEGER PRIMARY KEY, seq INTEGER NOT NULL,
  predicate TEXT NOT NULL, decision TEXT NOT NULL,  -- exclude | include
  note TEXT, created_at TEXT NOT NULL
);
CREATE TABLE triage_override (
  sha256 TEXT PRIMARY KEY, decision TEXT NOT NULL, created_at TEXT NOT NULL
);
```

`triage_override` covers files whose bytes are known. A decision about a file that has never
been read is expressible as a rule with an exact-path predicate at the top of the order — so
one override table is enough.

`photo.id` is regenerable output. Re-grouping reassigns it. Anything recording a human
decision keys on `sha256`, so favourites and ratings added later survive every re-group,
re-ingest, and widened triage rule for free.

A migration runner and `schema_version` from the first commit — about 40 lines. Every
future feature then arrives as a migration file.

The two files are **one logical schema joined by `ATTACH`**, so every migration stamps
`schema_version` in *both* of them and a migration file may create tables in either. SQLite
does not commit atomically across two attached databases in WAL mode, so the runner refuses a
pair whose recorded versions disagree rather than migrating onto a split schema.

## Pipeline

### Phase 0 — Inventory, reconciled against restic — ✅ **RAN 2026-08-02**

> **Executed 2026-08-02 in 12h50m against a ~10.2 h estimate. The gate passed: zero same-size
> same-mtime hash disagreements across all 1,374,328 files.** Implemented as
> `photolib/inventory.py` + `photolib/restic_repo.py`, five resumable subcommands `a`–`e`. The
> results are recorded inline below, marked **measured**, alongside the reasoning that produced
> them. Five things this section asserted turned out otherwise; each is corrected in place and
> flagged, because they are the parts a re-run would get wrong again.
>
> | | budget | actual |
> |---|---|---|
> | A establish | 19 min | 33 min |
> | B fail fast | 15 min | 25 min |
> | C inventory | 4.4 h | 4h33m |
> | D verify | 5.3 h | 7h18m |
> | E top-up | 3 min | 2 s |

> **Spike resolved 2026-08-01, then the phase was re-costed against the actual repo on the same
> day.** SPIKE A's finding stands: `restic cat tree` does expose the ordered blob list, and it is
> unusable for identity twice over. What changed is everything downstream of that. The repo was
> opened, enumerated and fully reconciled, and the mechanism the rewrite specified — a mandatory
> `--force` re-read of 1.07 TB — turned out to defend against a failure that **cannot occur in
> this repository**. The section below is the second rewrite and it is the one that was built
> from.

**There is no `restic backup --force` in this phase any more.** The reasoning that made it
mandatory was sound in general and inapplicable here:

- SPIKE A's failure needs a file to be read by backup *N*, modified in place at identical size
  and mtime, then skipped by backup *N+1*, which carries the stale blob list forward. It
  requires **two reads of the same file.**
- `G:\ResticPhotos` contains exactly two snapshots and only **one read**. `e7d60189` ran
  2026-07-18 01:42:47 → 10:28:35 and read all 1,374,298 files. `ce88f697` ran 16:40:32 →
  16:47:59 with `e7d60189` as parent and reported `files_new:0, files_changed:0,
  files_unmodified:1374298, dirs_changed:1, data_blobs:0, data_added:293` — one directory's
  metadata, nothing else. Every content list in the repo comes from that single read.
- So there is no earlier read for a stale list to be carried forward *from*. The defect is
  structurally impossible here, and `--force` would buy an 8h46m re-read of 1.07 TB — restic's
  own measured time for that tree — in exchange for nothing.

`--force` remains mandatory the moment this repo receives a **second** backup pass. Keep the
reasoning; the trigger condition is what changed. `--ignore-inode` and `--ignore-ctime` do not
substitute for it. The control case held in the spike: mtime bumped with content untouched does
trigger a re-read, so the failure is one-directional and silent in the dangerous direction.

> **Measured 2026-08-02: the trigger condition has fired, and the rule it triggers is much
> narrower than "every pass".** Phase E added snapshot `1e80c50e` (tag `phase0-topup`), so the
> structural immunity above is spent. But `--force` defeats *change detection*, which only ever
> applies to files already in a parent snapshot:
>
> | what changed | restic without `--force` | needs `--force`? |
> |---|---|---|
> | **new file** | always read — nothing to skip it against | **no** |
> | size or mtime changed | detected, re-read | **no** |
> | edited in place, size **and** mtime identical | **skipped, stale blob list carried forward** | **yes** |
>
> Only the third row. **Adding new photos never needs `--force`**, and reading the rule as
> "every pass" turns an 8h46m scrub into a routine cost — a 20× penalty on the most common
> operation, defending against a case that cannot arise for the files being added.
>
> The right cadence is a **scrub**, not a pass. Hard rule 2 makes source media immutable, and
> the empirical record agrees: across 1,374,328 files, exactly **three** constant-size
> constant-mtime edits have ever occurred, all git internals, zero photographs. Costs for the
> decision:
>
> | operation | cost |
> |---|---|
> | backup scoped to one new import directory | seconds |
> | whole-tree incremental of `G:\photos` | ~30–40 min — the 1.38M-entry metadata walk, unrelated to `--force` |
> | `--force` full pass | **8h46m** (restic's own measured figure for this tree) |
>
> Note the middle row: even without `--force`, a whole-tree backup pays a ~30 min walk on this
> USB HDD. Scope the backup path to what actually changed rather than reaching for `--force`
> to make a slow pass feel justified.

**The reconciliation is already done, and it closes completely.** Measured 2026-08-01 against
snapshot `ce88f697`, `restic --no-lock ls --json --long --recursive` at 14,571 nodes/s (119 s for
1,728,247 nodes — PLAN's earlier 6,750 nodes/s was 2× pessimistic):

| | |
|---|---|
| snapshot file nodes | 1,374,298 — sums to 1,152,680,261,990 bytes, matching its own summary exactly |
| snapshot dir nodes | 353,949 |
| snapshot symlink nodes | **0** |
| snapshot paths containing U+FFFD | **0** |
| in snapshot, absent from disk | **0** |
| on disk, absent from snapshot | 8,082 |

The 8,082 resolve into two named sets with nothing left over:

- **8,052 are the WSL symlinks** described in Ground facts — reparse tag `0xa000001d`, zero
  bytes, unopenable. restic correctly declined them and so did v1. They are not a gap; the
  earlier "8,052-file gap" was a census artefact and **there was never anything missing.**
- **30 are git loose objects** under `home-chris arch backup\work\archive\2ux\.git\objects\`,
  10,975,971 bytes, created after the snapshot.

Plus 6 files whose on-disk size disagrees with the snapshot — `COMMIT_EDITMSG`, `config`,
`index`, and three reflogs in that same `2ux` repo, all grown, total delta 1,159 bytes. The byte
arithmetic closes to the byte:

```
1,152,691,239,120 (disk) − 1,152,680,261,990 (snapshot) = 10,977,130
                                = 10,975,971  (30 new git objects)
                                +      1,159  (6 grown git files)
```

**Only 39 files in 1,382,380 have an mtime after the backup ended, and zero were modified
during it.** 30 are those new git objects; the remaining 9 are in the snapshot and total 8,711
bytes, all inside `work\archive\{1ux,2ux}\.git\`. Six changed size. The other three —
`1ux\.git\index` at **3,149 bytes**, and `2ux\.git\refs\heads\main` and
`2ux\.git\refs\remotes\origin\main` at **41 bytes each** — match the snapshot's size while their
mtime does not. A git ref is 40 hex characters and a newline, so a different commit is *the same
size with different bytes*: SPIKE A's failure shape, occurring for real, at a scale of three
files and **3,231 bytes**, none of them photographs.

> **Corrected 2026-08-02.** This paragraph previously read "`1ux\.git\index` and both
> `refs\...\main` at exactly 41 bytes", which merges two different files at two different sizes
> and puts both refs in the wrong repository. Confirmed by hashing both sides: `1ux\.git\index`
> is 3,149 bytes on disk and in the snapshot with different SHA-256; the two 41-byte refs are
> in `2ux` and share one disk hash. The distinction matters because these three are precisely
> the files a size-based top-up derivation drops.

That is the whole extent of drift in this corpus. One `git commit` in one archived repository on
2026-07-19 at 03:09.

**What the snapshot still is not.** Restic's Windows node JSON carries no inode, `nlink` or
device field, and it drops alternate data streams. `nlink` and the NTFS file ID must come from
the filesystem side. The U+FFFD surrogate hazard is real in general but **measured at zero
occurrences here**, so it needs a guard, not a reconciliation path.

**Do not derive any identity from restic-stored blob lists.** Unchanged from the first rewrite;
the premise this plan was built on is false in the direction dedup depends on:

- A node's `content` list is the chunk list from the last time restic actually *read* the
  file. Equal lists therefore do **not** imply equal bytes — same path, three snapshots, the
  stored key unchanged while the on-disk SHA-256 had changed.
- The chunker polynomial is not repo-fixed, it is write-path-fixed. `restic copy` imports
  foreign-chunked blobs with **no warning**, so one repo can hold byte-identical content
  under two different blob lists (verified: 12 blobs vs 13 for the same 20 MB file, in one
  repo). Checked 2026-08-01: this repo is format version 2, single `chunker_polynomial`
  `3ecd3d7919bbcf`, and **neither snapshot carries an `original` field** — no `restic copy` has
  ever touched it. The hazard is absent here; the prohibition stands anyway.
- `sha256(json(content))` false-merges every symlink and junction onto one key, because
  those nodes carry `content: null` — and a `(size, content)` composite does not rescue it,
  since symlink nodes have no `size` key either.
- The formula is under-specified: `json.dumps(c)` and `json.dumps(c, separators=(',',':'))`
  differ for every list with ≥2 elements, i.e. every real photo, and agree on the empty list,
  i.e. the only case anyone would put in a test fixture.

**Half of this phase's output already exists.** `adopt_mediavault` has run. As of 2026-08-01
`E:\photolib\catalog.sqlite3` holds:

| | |
|---|---|
| `origin` rows | 251,087 — **every one carrying a `sha256`** |
| bytes covered | 1,037,335,826,898 — **90.0% of the disk** |
| distinct `sha256` | 146,034 — the duplicate groups already exist |
| `file` rows | 146,034, all `state='adopted'` |
| `photo` rows | 146,034 |
| `origin.nlink`, `origin.file_id` | `NULL` for all 251,087 |

Cross-checked against the fresh walk: all 251,087 recorded paths exist on disk and **zero** have
a size disagreement. v1's `source_versions.hash_status` explains the shape of what is left —
`verified` 251,824, `not_media` 1,123,246, `error` 356. v1 hashed the media set and deliberately
never hashed the rest, which is correct for building a photo vault and insufficient for a
deletion gate.

**Two unexplained counts to reconcile, not rationalise.** `asset_sources` holds 251,824 rows but
`origin` holds 251,087 — a **737-row** difference. `source_versions` holds 1,375,426 rows against
`source_files`' 1,374,328, a 1,098 difference, which is expected because `source_versions` is a
version history and a path may have several. The 737 is plausibly the same effect surfacing in
the adoption join, but plausible is not established, and an unexplained gap of any size in the
inventory that authorises a deletion is the wrong kind of small. Likewise v1's 356 `error` files:
they need a recorded outcome, not a silent absence.

> **Both closed, measured 2026-08-02.** The 737 *is* the version-history effect, now shown
> rather than assumed: `asset_sources` holds 251,824 rows carrying 251,824 **distinct**
> `source_version_id`, which resolve onto **251,087 distinct `source_file_id`** and 251,087
> distinct `path_text`. So 737 files carry more than one adopted version row, and **zero** of
> the 251,087 paths lack an `origin` row. All **356** of v1's `error` files were read and hashed
> without error by this pass, none superseded, none absent — they are ordinary rows now, not a
> gap for step 12 to chase.
>
> The query that answers this is not the obvious one. **Neither `asset_sources` nor
> `source_versions` has a `path_text` column.** The chain is
> `asset_sources(asset_id, source_version_id)` → `source_versions(source_version_id,
> source_file_id, hash_status, superseded_at)` → `source_files(source_file_id, path_text)`,
> walked with three sequential scans joined in dicts rather than index probes, for the reason
> `adopt_mediavault` gives about ~70 IOPS inside a 6.97 GB file. Incidentally `source_files`
> holds **1,374,328** rows — v1's discovery and this walk agree on the size of the corpus to
> the row.

**Those 251,087 hashes are re-derived from the bytes, not trusted.** Decided 2026-08-01. The path
and size cross-checks above are corroboration, not verification: a file rewritten in place at
identical size passes both. Re-reading them costs ~3.05 h and turns v1's work into a **free
per-file cross-check across 90% of the bytes** — v1's recorded value against an independent one.
Disagreement there is a finding in its own right.

**Never overwrite an adopted `sha256` with a freshly computed one.** Compare, and on
disagreement record both and abort. Silently replacing the adopted value destroys the only
evidence that v1 and this pass disagreed.

**Disk side — one pass, two regimes, different concurrency.** A direct `os.scandir` walk with
streaming SHA-256, capturing `st_nlink` and the NTFS file ID from `os.fstat` **on the already-open
handle** so identity metadata costs no extra I/O. Partition by size and run the regimes
separately; measured rates and the reasoning are in Ground facts.

| regime | population | rate | workers | hours | **measured 2026-08-02** |
|---|---|---|---|---|---|
| big (>1 MiB) | 104,745 files / 1,130.35 GB | 94.4 MB/s | 4 | 3.3 | **80.3 MB/s, 3h44m** |
| small (1 B–1 MiB) | 1,257,975 files | 400.8 files/s | 40 | 0.9 | **376 files/s, 47m** |
| genuine zero-byte | 11,608 files | — | — | 0 (constant hash) | folded into the small pass |
| WSL symlinks | 8,052 | — | — | 0 (excluded by reparse tag) | **0 opened, 0 errors** |
| | | | | **≈ 4.2 h** (4.1–5.7) | **4h33m** |

Walk in **directory order**, never hash order or shuffled order: random order costs 13× on the
small-file regime. The zero-byte files all share `e3b0c442…`; that is one key, and collapsing
them destroys distinct paths without losing bytes, so keep the rows.

> **Measured 2026-08-02.** 1,374,328 files hashed, **0 read errors**, **787,798 distinct
> SHA-256**. All 251,087 adopted hashes agreed with the independently computed value — v1's
> hashing confirmed across 90% of the corpus, and no `origin` row overwritten.
>
> **`nlink > 1` is zero.** There are no hardlinks anywhere in the corpus, so `home-chris arch
> backup` holds no hardlinked backup generations, hash-once-per-file-ID bought nothing, and the
> phase did not get cheaper. The useful consequence is downstream: the duplicate map counts real
> distinct filesystem objects, so **586,530 redundant paths carrying 603.8 GB** are genuinely
> reclaimable rather than one object under many names.
>
> The zero-byte files were hashed in the small pass rather than assigned a constant. 11,608
> opens at ~400/s is ~30 s and it yields their `nlink` and `file_id` like every other row,
> which a constant would not.

**Repo side — full per-file comparison.** Decided 2026-08-01 against a 12 h window.
`restic --no-lock dump --archive tar <snapshot> <subtree>` piped into a streaming tar reader
hashing each member, compared against the disk-side hashes: **≈5.1 h (range 4.0–6.5)**. This is
the only thing that rules out an in-place edit that preserved its mtime, which is the residual no
sample and no mtime argument can exclude, and it is what the deletion gate is for.

Invoke it **once per top-level subtree**, not once over `G`. Eight invocations cost ~16 s of extra
startup and buy per-subtree checkpointing, visible progress, and restartability across evenings —
a single five-hour invocation that dies at hour four loses everything.

> **Corrected 2026-08-02, and it would have been silent.** `dump --archive tar` names every
> member by its **full snapshot path** — `G/photos/<rel>` — whichever subtree was dumped, *not*
> relative to the dumped node. A node-relative mapper produces keys that match nothing on disk,
> so every comparison passes vacuously and the run reports cleanly. Map tar member names through
> the same function as `ls` output, and treat a member outside the photos root as a fault rather
> than a file to skip. Verified against restic 0.19.1 with a five-member probe before Phase B.
>
> There are also **loose files directly under `G:\photos`** (one: `.codex-arch-home-copy.lock`).
> Eight subtrees plus one loose file, so `top_level_subtrees` must return both and the loose ones
> need an individual `dump`.

`restic --no-lock check` plus `--read-data-subset=1/8` covers what the dump does not: unreferenced
blobs and pack/index structure, ~12 min. **The full `--read-data` (436.18 GB — the repo is
406.22 GiB, and reading that as decimal understates it by 7.4%) is not run**, because restic
verifies each blob's plaintext hash against its ID on load, so the dump pass already reads and
verifies every referenced data blob. If that property cannot be confirmed from restic's own
behaviour, run the full `--read-data` at ≈1.15–1.35 h rather than assuming it.

> **The full `--read-data` was run, 2026-08-02: all 24,785 packs, no errors, 1h56m** — above the
> 1.15–1.35 h estimate. The escape hatch above is the reason: the "blobs are hash-verified on
> load" property was *asserted* rather than confirmed from restic's own behaviour, and the rule
> says an unconfirmed assumption means running it. **This question is now settled and no later
> step needs to re-establish it.** Plain `check` also passed.

Measured dump rates: 105.6 MB/s in a low-dedup subtree, 81.3 MB/s and 883 files/s in the
small-file subtree, 52.9 MB/s and falling in the high-dedup `10tb arch backup` region. **Dedup
makes restore slower, not faster** — unique content was written in read order so its blobs are
pack-adjacent and stream sequentially, while deduplicated content pulls blobs scattered across
packs written at earlier moments. That inverts the naive expectation and it is why the whole-tree
projection carries a wide band.

> **Measured 2026-08-02, and the band was right to be wide.** Per-subtree dump, 5h11m total:
>
> | subtree | files | time | MB/s |
> |---|---:|---:|---:|
> | `a52s 5g backup` | 5,492 | 5m38 | 110.5 |
> | `usb f 7-15-26 sd` | 6,204 | 11m06 | 114.5 |
> | `lumix f 7-15-26 sd` | 10,284 | 20m37 | 102.6 |
> | `arch laptop backup` | 5,579 | 8m50 | 97.9 |
> | `home-chris arch backup` | 1,077,465 | 44m29 | 86.2 |
> | `10tb win 11-04-24 backup` | 12,368 | 37m45 | 75.5 |
> | `10tb arch backup` | 256,833 | **2h51m40** | **44.5** |
> | `win pc 7-15-26` | 72 | 5 s | 59.4 |
>
> `10tb arch backup` took 55% of the wall clock for 40% of the bytes, and decayed from 62 MB/s
> to 44 MB/s as it went. Small-file *repo* reads were far faster than projected — 400–2,400
> files/s against the 883/s on record — so the small-file penalty is a disk-side effect, not a
> restore-side one.

**Phase order is: establish, then fail fast, then build, then verify.** The cheap decisive
evidence runs first — a ~20 GB sample plus the 9 drifted files, compared against the repo at about
the 35-minute mark. A same-size mismatch there means the remaining ten hours would build an
inventory on a collapsed premise, so it is a stop. The inventory itself is written and committed
**before** the 5.1 h repo pass begins, so an overrun costs a second evening rather than the run.

Two gotchas to encode: `--no-lock` on **every** read command, because the default writes a lock
file *into the repo*; and `dump`'s path argument must be a **bare root-entry name with no
leading slash**. Confirmed here — this snapshot's single root entry is **`G`**, with `photos`
one level below it. `/`, `.` and `/photos` all fail with the misleading
`path "\\C:" not found in snapshot`. Restic's index loads in 1.6–2.2 s, so invocation startup is
negligible; per-file invocation is not, which is why the sample is a cluster sample.

Use `restic --no-lock ls --json --long --recursive` for the path/size/mtime inventory only —
never for identity.

Preconditions, each an abort rather than a skip:

- `type == "file"` as an explicit allowlist, never `not dir`. Three node types exist in general;
  junctions appear as `type: "symlink"` with a `linktarget`, and `content` is present-with-null
  on both dir and symlink nodes. This snapshot contains zero symlink nodes, so the allowlist is a
  guard rather than a filter that fires.
- `size_bytes = node.get("size", 0)` — the key is absent for zero-byte *and* symlink nodes.
- On the filesystem side, classify with `st_file_attributes & 0x400`
  (`FILE_ATTRIBUTE_REPARSE_POINT`), **not** `is_file()` / `is_symlink()`. The 8,052 WSL symlinks
  defeat both.
- Decode all subprocess output with an explicit `encoding="utf-8"`. Python's Windows default
  is the ANSI codepage, which silently rewrites non-ASCII into different, valid-looking paths
  with no exception raised. 896 non-ASCII names and 55 over-255-char paths are exposed to it.
- Named decisions, not defaults, for: the 8,052 WSL symlinks (excluded, unopenable, zero bytes —
  record the paths, never attempt a hash), alternate data streams (not represented by restic;
  lost on restore), the 11,608 genuine zero-byte files (one shared key, rows kept), the 55 paths
  over 255 chars, and the one file over 2 GiB.
- Duplicate means *distinct filesystem object with identical content*. Group by NTFS file ID
  first; hardlinked names are one object and must never be counted as reclaimable space or
  offered as reject candidates. `nlink > 1` is also an opportunity — hash once per file ID and
  reuse — and `home-chris arch backup` is the tree where hardlinked backup generations would
  show up if they exist. **They do not: measured `nlink > 1` = 0 across the whole corpus.**

Writes `origin` (1,374,328 rows) and `file` (`state='pending'`). Assert before proceeding:
`count(distinct path) == count(origin rows)`, and

```
files_seen_on_disk == files_hashed_from_disk == 1,374,328
files_seen_in_snapshot                       == 1,374,298
```

**Those two numbers are expected to differ by exactly 30, and the 30 are enumerated.** The
earlier form of this assert demanded all four counters be equal; that was written before the
reconciliation existed and it would abort on a correct run.

> **All four held, 2026-08-02.** `origin` 1,374,328 rows, 1,374,328 distinct paths; `file`
> 146,034 `adopted` + 641,764 `pending` = 787,798, matching the distinct-hash count exactly.
>
> One reporting trap worth carrying forward, hit on the resumed Phase D run: **a resumed
> verification must not read emptier than a fresh one.** Totals summed from an in-memory counter
> showed `agree 1` after the run skipped its eight already-verified subtrees — on the single
> number the deletion gate rests on. Sum the persisted per-subtree rows, not the counter.

**The gate must distinguish two kinds of hash disagreement, and the earlier text did not.**

- **Size differs, or mtime is after the backup** → the file changed since 2026-07-18. Expected,
  benign, already enumerated at 6 and 9 files respectively. Log it and re-back-up. Not a stop.
- **Size and mtime both match but the hash differs** → either an in-place edit that preserved
  mtime, or the repo holds bytes it should not. **This is the hard stop** and it is the only one.

**Never treat "could not open" or "could not hash" as "no duplicate found".** With the reparse
guard in place the expected count of unopenable files is zero; without it, it is 8,052.

> **Measured 2026-08-02: 0 unopenable, 0 read errors, 8,052 reparse points never opened.** The
> gate result in full:
>
> ```
> agree          1,374,289      hard_stop         0
> changed_size           6      not_on_disk       0
> changed_mtime          3      not_hashed        0
>                               not in repo      30
> ```
>
> `1,374,289 + 6 + 3 = 1,374,298` — every file node in the snapshot, compared. The nine
> disagreements are the nine known drifted git files and all nine classify benign; the three
> same-size ones landed in `changed_mtime`, not `hard_stop`, which is the case the classifier
> exists to get right.
>
> One sampling trap for any re-run of Phase B: **budget each size regime separately.** A single
> shared byte budget let one 49.4 GB directory swallow it and left 109 small files out of a
> 20 GB target — no coverage of the regime holding 92% of the file count. Re-sampled with
> per-regime budgets: 207,366 files across 24 directories, ~202k of them small.

**The rejected fallback was costed on a number that is 20× wrong.** "`scandir` walk, group by
size, hash only inside size-collision groups" saves 4%, not most: measured on `G:\photos`,
**95.99% of files (1,326,992) and 90.9% of bytes (1.05 TB)** sit in multi-member size groups,
because there are only 123,710 distinct sizes and the distribution is quantized into groups
of 675–1,047 members. Size grouping is lossless and near-useless here.

**What the hashing buys, and it is not verification.** SHA-256 runs at ~1.5 GB/s against a disk
doing 94 MB/s, so hashing during a read the phase performs anyway is free by a factor of ~16.
The output is the duplicate map, and that is what lets Phase 2 read 420 GB instead of 966 GB —
~5–7 hours of avoided reads. The disk-side pass is this phase's **product**, not its overhead.
Only the repo-side verification is overhead.

**Note this reorders your request.** You asked for triage *before* dedupe. Dedupe is cheap rather
than free, so triage still runs on deduped content, which is strictly better for review: ~146k
tiles instead of ~251k, each showing "appears at 5 paths" rather than appearing five times.

**The write to `G:\ResticPhotos` is authorised** (2026-08-01), and it is now a top-up of the 30
git objects plus the 6 changed files — megabytes, not 1.07 TB.

> **Corrected 2026-08-02: the top-up is 39 files, not 36 — and this is the one correction here
> that could have cost data.** "30 missing + 6 changed size" is a *path-and-size* derivation.
> Three more files changed **in place at identical size** — `1ux\.git\index` at 3,149 bytes and
> both `2ux` `refs\...\main` at 41 — so a size diff cannot see them and the repo did not hold
> their current bytes. They are benign, because their mtime postdates the backup, which is
> exactly why they are not a hard stop and exactly why the size-based derivation drops them.
> Backing up 36 would have left three files whose only copy was the source disk: the precise
> population this gate exists to protect.
>
> **Derive the top-up set from the byte comparison, never from the path/size diff**: every disk
> file whose repo-side hash is absent or unequal. And refuse to derive it at all if any snapshot
> file was never compared — an incomplete comparison silently shrinks the set.
>
> Done: 39 files, 10,984,682 bytes, snapshot `1e80c50e` tag `phase0-topup`, 2 s. All 39 were
> dumped back out of the new snapshot and re-verified against their disk hashes — 39 agree,
> 0 differ.

Two consequences to carry forward. First, a second backup pass means `--force` becomes relevant
where it was structurally impossible before — **on a scrub cadence, not on every pass**; see the
table at the top of this section, and do not read this as a tax on adding photos.

Second, `G:\ResticPhotos` was uploaded off-site before the top-up, so the remote copy is stale by
those **39** files. Either re-sync or record the divergence explicitly — an off-site copy that
silently differs from local is worse than one known to be 39 files behind.

> **Divergence recorded and accepted, 2026-08-02.** The 39 stale files are **all git internals
> and contain no photographs**: every one has no file extension, every one sits inside a
> `.git\` directory, and the catalog classifies **zero** of them as media. All 146,034 media
> files are in the uploaded snapshot; the only disk files absent from it are the 30 git loose
> objects.
>
> Owner's stated priority: *staleness of the off-site copy does not matter, only that all real
> photos are included.* By that criterion the off-site copy is **already complete**, and the
> re-sync is housekeeping rather than a blocker. The divergence is recorded here rather than
> erased so the decision stays auditable, and so a future pass that touches *media* is not
> waved through by the same argument.

Note also that the upload does **not** by itself satisfy Phase 13b's gate: `origins.jsonl` does
not exist yet, and without it the repo is not navigable from a content hash back to an original
path. **That, not the 39 files, is what currently threatens "all real photos are recoverable".**

### Phase 1 — Categorical prefilter — ✅ **RAN 2026-08-02**

> **Ran in 2.7s as `photolib/prefilter.py`. Nine `exclude` rules at `seq` 0–8 in
> `state.sqlite3`, nothing written to the catalog.** The extension list is exactly as specified
> below and unchanged. The *counts* below were wrong, and wrong in one specific, correctable
> way, so they are corrected in place.
>
> **The per-extension figures in this section were counted over MediaVault's 146,034 adopted
> assets, not over the 787,798-row `file` table Phase 0 produced.** Over the adopted subset the
> same nine rules take **41,658 files / 0.64 GB** — which is where "≈41,700 files, ~0.5 GB"
> came from, and it reproduces to the file. Over the full inventory they take **101,986 files /
> 4.77 GB**, leaving **685,812 files / 544.14 GB** surviving to triage.
>
> | ext | this section said | actual (`file`) | bytes |
> |---|---|---|---|
> | `.pyc` | 7 | **59,516** | 904.9 MB |
> | `.file` | 498 | **1,148** | 3.24 GB |
> | `.msg` | 198 | **367** | 254.3 MB |
> | `.svg` · `.ts` · `.ico` · `.dds` · `.xbm` · `.cur` | as stated | unchanged | 232.4 MB |
>
> `.pyc` is the whole story: v1 had misfiled 7 of them as media, and the arch backup tree holds
> 59,509 more that only Phase 0 ever saw. `.file` at 3.24 GB is the single largest line and is
> not a rounding difference. **Do not read "0.5 GB" as the size of this step again** — the
> prefilter is ~10× the file count and ~7× the bytes the estimate implied, and it is still
> under 1% of the corpus by size.
>
> Rules match `file.ext`, the extension of the deduplicated byte sequence. **539 excluded files
> are also known under some other extension**, every one of them a source or text extension
> (`.cts`, `.py`, `.js`, `.pem`, `.svelte`). The only one touching an image format is a single
> 1,279-byte `favicon.ico` that also exists as `favicon-32x32.png`. In the other direction 63
> survivors carry at least one excluded-extension path and survive, which is the safe way round.
>
> Gate met: `.png` (54,899), `.gif` (817), `.webp` (45) and `.bmp` (11) are matched by no rule.

Pure SQL over `origin`/`file`. Zero I/O. Seconds.

Excludes only formats nobody photographs in, and non-images v1 misfiled as media:

`.svg` (22,060) · `.ts` (18,789) · `.file` (1,148) · `.msg` (367) · `.ico` (52) · `.dds` (42) ·
`.xbm` (7) · `.pyc` (59,516) · `.cur` (5)

**101,986 files, 4.77 GB** — measured over `file`, corrected 2026-08-02 from the ≈41,700 / ~0.5 GB
this section carried, which was the MediaVault-adopted subset. No judgement calls in that list.
Everything genuinely ambiguous — notably the whole 54,899-file `.png` pile — survives to triage,
where changing your mind is free.

It stays narrow because it is the last filter before the source is deletable, not because it is
irreversible: as rows it reverses like everything else. Shown in triage as a table, not a contact
sheet: you can't look at a `.d.ts`.

**Expressed as `triage_rule` rows, not as code.** The prefilter is simply the first rules in
the same engine triage uses, so the one step that looked irreversible reverses by the same
mechanism as everything else.

### Phase 2a — Adopt MediaVault and verify

**MediaVault's `objects` tree acts as staging.** The bytes are already content-addressed and
on the right volume, so nothing is copied here — promotion in Phase 4 is a hardlink.

Read work, in one pass each:

| Step | I/O | Output |
|---|---|---|
| Re-hash every object, compare to its filename | **420 GB read, ~4–5 h at the measured 22–35 MB/s** | Proves the bytes; the largest single I/O in this phase |
| Import the 146,034 `records` sidecars | 1.22 GB read | `origin` rows — avoids scanning the 6.97 GB manifest |
| Import `asset_extended_metadata` **only** | manifest scan | GPS, lens, ISO, aperture, capture time — objective readings |
| Read the derivative tree (**five tiers**, not four) | 21.65 GB read | Adopt 1536px as the working substrate **after the ARW orientation repair below**; copy 384px → `E:` as grid thumbnails; compute **pHash, dHash, ThumbHash and all quality scalars** from the repaired 1536px |

**Adopt objective facts, recompute subjective scores.** `asset_extended_metadata` holds
readings — GPS is GPS, ISO is ISO — so provenance doesn't affect them. `asset_features` holds
*relative* judgements (sharpness, shake, blankness, composite quality) that only mean
anything when every value comes from one implementation. Phase 2b would compute ~1,800 files
with new code while 103,207 carried v1's, and cover ranking compares members *within* a
stack — so a mixed stack would rank on incompatible measurements. Recomputing costs almost
nothing here: the 21.65 GB derivative read and decode is already happening for pHash and
ThumbHash, and 16 cores sit idle behind a disk-bound pass. It also drops any dependency on
v1's feature code, which carries `F54` and `F56`.

v1's 18-scalar feature list is still worth copying — as a *specification* of what to compute,
not as values.

**Exception: `assets.width/height` is not an objective reading and is not adopted.** It holds
at least five different quantities — the true raster, the EXIF `ExifImageWidth/Height`
camera-original size on edited files, the *embedded EXIF thumbnail* size (504×376 / 512×384 /
496×240, on 2,046 Samsung JPEGs), the `.rw2` preview size, and the `.arw` sensor size. It
differs from the orientation-corrected `asset_extended_metadata` dimensions as an unordered
pair for **4,415 of 103,207** adopted assets, and for ~52 its landscape/portrait polarity is
the *opposite* of the real file. 54 assets have NULL `assets.width` yet a ready 1536
derivative. Any regression check, repair predicate or Library display logic must use
`asset_extended_metadata` or re-measure the object. Record as a separate defect against v1's
metadata extraction.

What did hold: `assets` and `asset_extended_metadata` agree on `orientation_text` for all
146,034 assets, there is exactly one AEM row per asset, and a single `analyzer_version`
(`vault-derivative-v1`) produced all 605,981 derivative rows — so the single-implementation
premise above is sound.

**Spike resolved, 2026-08-01. The orientation gate was the right instinct and the answer is
now known — do not spot-check.** v1 applies `ImageOps.exif_transpose` to the *extracted
embedded preview only*, so orientation survives only where that preview happens to carry its
own EXIF. Panasonic `.rw2` previews do (120/120 match the container); Sony `.arw` previews
carry no Orientation tag at all (107/107), so `exif_transpose` is a silent no-op for every
one of them.

- **`.jpg` and `.rw2` are correct at population scale** — 29,450 / 29,450 transposing-
  orientation assets, and correct in *direction*, not merely transposed (8×8 luma-grid
  correlation r=1.000 against the correctly-oriented source). Adopt as-is.
- **`.arw` is wrong for every non-identity orientation, at every tier.** Every ARW derivative
  is 1536×1027 landscape regardless of orientation. **Repair set: `preferred_extension='.arw'
  AND orientation_text <> '1'` = 1,486 assets** (orientation 8: 1,459; 6: 24; 3: 3) × 4 tiers
  = **5,944 files, ~15 min.** Transform, measured: orientation 8 → rotate 90° CCW; 6 → 90° CW;
  3 → 180°.
- **Do not select by aspect transposition.** Orientations 2, 3 and 4 are invisible to it by
  construction, and three orientation-3 ARW are published *upside down* today — not sideways,
  so neither an aspect predicate nor the "sideways tiles" symptom can see them.
- **Fix the root cause before regenerating anything:** drive rotation from the *container's*
  orientation, not from whatever EXIF survives into the extracted preview.
- Correct the 73 `.dng` and 1 `.jpg` on the same decode path when Phase 2b generates theirs.

**"Sideways tiles would be the first symptom" was wrong, and that changes how narrow this
is.** Mean pHash Hamming distance between a derivative and its own 90° rotation is 31.3 / 64
(dHash 31.7) — indistinguishable from uncorrelated. A mis-rotated ARW can *never* match its
correctly-rotated sibling: under-grouping is total, not partial. And nothing would surface
it, because `raw_jpeg_groups`, `stack_candidate_edges` and `stack_members` all have zero rows
— the grouping layer has never emitted an output. 1.4% is accurate about count and must not
be read as low risk.

**Invalidate the derived features.** 266 `stack_feature_inputs` rows already carry the
poison: `.arw` at orientation 6/8 hold `aspect_ratio = 1.4956` (landscape) with 265 distinct
wrong pHashes, while matching `.rw2` rows correctly hold `0.75`. All three ARW orientation
buckets share the identical 1.4956 — the orientation signal is provably absent. Any asset
whose derivative is regenerated must have its `phash_hex`, `dhash_hex`, `phash_bucket`,
`dhash_bucket` and `aspect_ratio` invalidated and recomputed.

**The regression check cannot be a DB-only assertion.** `derivatives.source_width/height`
equals the *post*-transpose size in 103,207 / 103,207 rows, and no column holds the true
stored raster. Either re-read `EXIF:Orientation` and `File:ImageWidth/Height` from the object,
or persist pre-rotation raster dimensions as a distinct column in the new schema. **Step 3
built neither** — the Schema section above lists no such column, so this branch is a migration
`003` written at the point of use rather than a decision already taken. Assert that
the rotation actually applied equals the container orientation for all eight EXIF values, and
that `stack_feature_inputs.aspect_ratio` agrees with the shape `orientation_text` implies —
that one check would have caught this at population scale.

**No detail tier exists for RAW.** The 2560 `detail` tier covers 21,845 of 103,207 assets
(21.2%), `representation='image'` only, gated on source long side ≥ 2560. Zero `.rw2` and zero
`.arw` qualify, because their derivative source is a 1920×1440 / 1616×1080 vendor embedded
preview. For RAW the adopted 1536 substrate *is* the vendor preview at ~95% scale, with no
higher-resolution derivative at any tier. If the grid or Library assumes a detail view, that
is a gap of 81,362 assets, RAW entirely — a design question, not a rounding error.

Adopt nothing on a database row alone — only where `checksum_sha256` verifies against a file
that exists (verified: 5,500 derivatives sampled across all five tiers, 0 dimension
mismatches, 0 missing files, paths 1:1 with rows — no integrity repair needed). The
**171,308** `error` rows (89,528 image + 596 raw_embedded + 81,184 video_poster; 42,827 was
the per-tier figure) have no files — all carry NULL path, checksum, dimensions and byte_size —
and are correctly skipped. The `raw_embedded` errors cover 149 assets (146 `.dng`, 2 `.ptx`,
1 `.raw`).

Grid thumbnails come from the existing 384px WebP rather than generating 512px AVIF. Reusing
what's there beats a marginally better format. The 384 tier is confirmed consistent with 1536
(per-asset shape agrees in 103,178 / 103,207; all 29 exceptions are near-square ±1 px
rounding), but it inherits the ARW defect identically and is covered by the same 5,944-file
repair. No derivative carries a WebP EXIF chunk — 0 of 10,090 checked — so orientation cannot
be corrected at display time by a viewer. The pixels have to be rotated.

**Estimate: 5–6 hours**, dominated by the 420 GB object re-hash at the measured 22–35 MB/s
(~4–5 h), plus the 21.65 GB derivative pass and ~15 min for the ARW repair. ~442 GB read, no
large writes, no decode of originals, no RAW decode at all. The earlier **1.5–2 h figure
assumed 110 MB/s and is withdrawn.**

The verification read can run concurrently with triage **only after** the 384px thumbnail copy
to `E:` has completed, so that triage touches no G: head. Contention on this volume is severe:
identical metadata operations measured 1.4 ms on an idle volume and 36 ms mean immediately
after a write burst, with one `os.remove` taking 3,081 ms — a ~1,700× spread on the same code.
No other G: work may overlap it.

### Phase 2b — Gap fill (the only time originals are read)

Two populations, ~1,800 files plus whatever the inventory diff turns up:

1. **Preprocessing failures worth recovering** — ~1,464 real videos, 146 `.dng`, 25 `.jpg`.
   Read from the *MediaVault object*, not from `G:\photos` — already local and verified.
   Video gets an ffmpeg poster frame; DNG and JPEG get a normal decode.
2. **Anything in the Phase 0 inventory with no MediaVault asset** — that is 1,123,241 files,
   essentially v1's `not_media` classification, of which triage keeps some unknown small
   fraction. These read from `G:\photos` into `G:\vault\.staging\`, decode once, and produce the
   full output set. **This population is not "the 8,052-file gap"** — that gap was a census
   artefact and does not exist (see Phase 0). Size this step from what triage actually keeps,
   not from a gap figure. v1's 356 `error`-status files belong here too and need an explicit
   outcome rather than a silent absence.

For population 2, decode exactly once and from that one pixel array produce the 1536px
substrate, thumbnail, ThumbHash, pHash/dHash, and quality scalars; exiftool via `-stay_open`
(one process, not thousands of spawns).

**RAW: extract the embedded preview, never decode sensor data** — ~50 ms versus 1–3 s.
Record which path produced the features in `feature_ver`: sharpness off a 1620px preview is
not the same number as off a 5184px decode. Fine for ranking members against each other, not
comparable across methods. This also applies to the 16,239 adopted RAW features, whose
`analyzer_version` says what produced them.

Concurrency: 16 CPUs, one disk head. **1–2 reader threads** feeding ~12 decode workers. More
readers is slower, not faster.

Every decode of untrusted media gets a timeout, an output cap, and a memory limit. `F55` and
`F56` are the same underlying problem — hostile input meets an unbounded subprocess — and
`F55` is a *hang*, not a crash, which is worse.

Idempotent and restartable at row granularity via `file.state`. One process, one lock file.
No job ledger, no leases, no worker runtime — those exist in v1 to let an HTTP API enqueue
work, which does not happen here.

**Estimate: under an hour**, dominated by however large the inventory gap turns out to be.

### Gate: `G:\photos` becomes deletable

Not after triage — after Phase 2b verifies. `G:\photos` is deletable only once **proven**, not
assumed, that every byte exists in MediaVault or staging *and* in restic. ~~Nothing to date
establishes restic's coverage: the repo has never been opened, and its newest snapshot
(2026-07-18) predates the current disk state.~~ **Proving coverage is a separate, explicit,
blocking task.**

> **Condition 3 was discharged by Phase 0 on 2026-08-02.** The repo has been opened, fully
> enumerated, `check`ed including the complete `--read-data`, and every one of its 1,374,298
> file nodes reconstructed and compared per-file against a fresh disk hash. Zero same-size
> same-mtime disagreements. The 39 files whose bytes the repo did not hold were backed up
> (`1e80c50e`) and re-verified out of the new snapshot. Conditions 1 and 2 remain open and
> belong to Phase 2a/2b.

Verification, all three:
1. Every MediaVault object re-hashed and matching its filename (Phase 2a — ~4–5 h, not free),
   and every gap-filled object matching its recorded SHA-256.
2. Every Phase-1-surviving `origin` row has a `file` row in `state='read'` or `'adopted'`,
   **and** `count(distinct origin.path) == count(origin rows)`, and no row reached that state
   via a failed or skipped read.
3. **Content-level, not path-level, reconciliation. ✅ done 2026-08-02.** A path diff cannot
   catch what was measured: restic collapses distinct filenames onto one reported path, the
   Windows ANSI default silently mangles the join between the two lists, and — decisively — a
   file whose bytes were rewritten in place at constant size with mtime preserved appears in
   *both* lists at the same path while restic holds the old bytes. So: compute SHA-256 twice by
   two independent paths, once from the repo via `dump --archive tar` and once from a fresh
   `os.scandir` of `G:\photos`, and require per-file agreement. Any mismatch, and any file
   present on one side only, aborts loudly. This — not a path diff — is the evidence that the
   backup contains the bytes, which is the actual precondition for deleting the source.

   Phase 0 did exactly this and it passed. Note what the "constant size, mtime preserved"
   sentence above implies for the *remedy* as well as the detection: the top-up set has to be
   derived from the hash comparison, because a size-based derivation is blind to the same case
   the check is designed to find. It missed three real files.

**Deletion is still gated on the server upload completing, not on restic existing.** The
repo and `G:\photos` are on the *same physical disk* — confirmed to the device: volume serial
`0xb42554ea`, partition 2 of disk 3, one USB enclosure. Two copies on one USB HDD is one
hardware failure from zero. Upload the restic repo (406 GB, encrypted, deduped) plus
`origins.jsonl`.

> **Off-site copy located and verified 2026-08-02.** `a3server`, reachable at
> `ssh -p 22222 chris@82.14.247.27`, on an 11 TB volume (`/dev/sdf2`, 9.8 TB free).
>
> | | |
> |---|---|
> | restic repo | `/mnt/bay6/ResticPhotos` — 436,175,270,064 bytes, 24,785 packs, 51 index, 2 snapshots |
> | catalogue databases | `/mnt/bay6/photolib-backup/` — `catalog.sqlite3`, `phase0.sqlite3`, `manifest.sqlite3`, each SHA-256 verified end to end |
> | link | 11.7 MB/s down, **3 MB/s up** — asymmetric, and the slow direction is the restore direction |
>
> **Verified without restic and without the password.** restic names packs, index files and
> snapshots by the SHA-256 of their contents, so hashing every file server-side and comparing
> each against its own filename establishes the same integrity property `check --read-data`
> does — **24,839 of 24,840 files self-verify**, the exception being `config`, which is not
> content-addressed. 45 minutes server-side against ~10.4 h to pull 436 GB over a 11.7 MB/s
> link for `check --read-data` over SFTP.
>
> Completeness: local holds 24,844 files, the server 24,840, and the difference is exactly the
> four the 2026-08-02 top-up created after the upload — two packs, one index, snapshot
> `1e80c50e`. **Zero files on the server that are not local.** Every one of the 146,034 media
> files was already there.
>
> Prefer this shape of check over `check --read-data` against a remote whenever a verified
> local copy exists: it is strictly stronger. `check` on a copy missing an entire snapshot file
> verifies the remaining ones and passes; a file-set comparison notices.

> **Finding, 2026-08-02: the off-site copy had been seeding to the BitTorrent DHT for ~29
> hours.** It was at `/mnt/bay6/torrents/completed/ResticPhotos`, alongside the `radarr` and
> `sonarr` categories of a live qBittorrent instance — a torrent was the transfer mechanism, and
> it was never stopped afterwards. The torrent (infohash `e371ec1d…`) carries **no trackers and
> no `private` flag**, and qBittorrent's config sets none of DHT/PeX/LSD, so all three run at
> their enabled defaults. A trackerless non-private torrent is discoverable through the DHT, and
> DHT crawlers harvest infohashes continuously.
>
> What is and is not exposed: restic encrypts pack contents with AES-256 under a scrypt-derived
> key, and every filename is a content hash, so **the photographs themselves stay confidential
> as long as the repo password is strong.** What leaks is the backup's existence, its 436 GB
> size, its file structure, and the name `ResticPhotos` — plus the encrypted bytes themselves,
> which is an offline password-cracking target rather than a disclosure.
>
> The directory has been moved to `/mnt/bay6/ResticPhotos`, out of the torrent tree, which also
> removes the files qBittorrent was serving. **The torrent entry still exists in the client and
> must be removed there** — moving the data errors it, it does not delete it. The repo also
> remains owned by `mark`, not `chris`, so writing to it needs `sudo`.
>
> The rule this earns: **an off-site copy's location is part of the backup, not an
> implementation detail.** A directory a download client manages, or that an *arr app's cleanup
> can reach, is not somewhere the only remote copy of the library may live.

`origins.jsonl` is the **only** content-hash → original-path map, and Phase 4's reversal story
is unusable without it. It must exist on disk **before Phase 4**, not merely be uploaded here.

**Two structural gaps this gate does not cover.** It declares `G:\photos` deletable two phases
before Phase 4 destroys the MediaVault directory entries — from that point the off-device
upload, not the same-disk repo, is the only copy standing behind Phase 4. And this plan
establishes **no backup of `G:\vault` at all**: after Phase 4 the vault is the sole live
representation of the library, as single extents on one USB HDD, last verified before
promotion and never again. A single bad sector kills the object under both names at once and
nothing here detects it. There is no undelete affordance on this machine to fall back on.

**A third gap, named 2026-08-02: there is no procedure for adding photos after the build ends.**
This plan consumes a fixed 1.07 TB corpus and stops. `G:\photos` is deleted at this gate, so it
is not where new photos go; the vault is, and the vault has neither an import path nor a backup.
Every hour estimate here is a one-off migration cost, and none of them describes what next
month's card dump costs.

**Deferring it is safe** — the architecture was audited against future import and needs no
change now, chiefly because import requires no schema migration. The audit, and the three
things worth deciding early anyway, are in "Open decisions" 5. What remains genuinely missing is
the *vault backup*, and that gap is this section's second paragraph, not a new one.

One thing that is *not* a problem, because it looked like one: **content addressing dissolves
the SPIKE A hazard entirely for the vault.** A canonical object's filename *is* its SHA-256, so
it cannot be edited in place and still be correct — the name/hash check catches it without
reading the backup at all. Whatever the vault's backup turns out to be, `--force` is not part of
it, and scrubbing is a local re-hash rather than a restore.

### Phase 3 — Triage

Interactive, offline from the source, no deadline. Details below.

### Phase 4 — Promote

> **Gated.** Before any MediaVault directory entry is unlinked: (a) the off-device upload of
> the restic repo plus `origins.jsonl` must have completed and been verified — the repo went up
> on 2026-08-01, `origins.jsonl` has not; (b) Phase 0's top-up backup of the **39** drifted
> files must have run **and been re-synced off-site**, since the uploaded copy predates it; (c)
> `origins.jsonl` must already be on disk. **Phase 4 must not run until at least one full copy
> of the content exists on a device that is not disk 3.** The Gate section already states this
> principle for `G:\photos`; Phase 4 was exempting itself from it.
>
> Condition (b) formerly read "a fresh `restic backup --force G:\photos` must have run". That
> demanded 8h46m of re-reading to defend against a defect Phase 0 showed cannot occur in a repo
> with only one read. It is now a top-up of 39 enumerated files — 36 was a size-based
> undercount, see Phase 0. `--force` becomes mandatory again for any pass *after* that one,
> because a second read is what creates the hazard.
>
> **Status 2026-08-02.** (b) is **satisfied for the purpose this gate serves, and downgraded to
> advisory.** The top-up ran as snapshot `1e80c50e` and was re-verified locally. The off-site
> re-sync has not happened, so the remote is 39 files behind — but all 39 are git internals
> with no extension, inside `.git\` directories, and **zero of them are media**. Every one of
> the 146,034 media files is in the uploaded snapshot. The owner's stated priority is that all
> real photos are included, not that the copies match byte for byte, so (b) no longer blocks.
>
> **(a) and (c) still block, and they are the real ones.** `origins.jsonl` does not exist. It
> is the only content-hash → original-path map, so without it the off-site repo holds every
> photo and cannot be navigated back from a vault object to where it came from. Under the
> owner's own criterion this matters far more than 39 git objects: it is the difference between
> "the photos are backed up" and "the photos can be got back".
>
> `--force` is **not** now mandatory for every future pass — see the corrected rule in Phase 0.
> It applies to in-place edits at constant size and mtime, which cannot happen to a
> content-addressed vault object without the name/hash check catching it.

The mechanism is sound and was verified hard. `CreateHardLinkW` (kernel32) needs **no special
privilege** — confirmed from a non-elevated token — and creates no reparse point, so
`SeCreateSymbolicLinkPrivilege` is not involved. Cross-volume fails **loudly** with winerror
17 and creates nothing, so there is no silent copy-fallback at link time. First-name unlink is
O(1) in file size from 4 KB to 1.27 GiB. 6,000 full promotions ran with zero retries, zero
failures and a clean audit. What follows is everything around it that the original three
sentences got wrong.

**Budget ~1.3 hours, not "seconds".** The NTFS work is ~2 ms per object, but that figure came
from a cache-hot tree. Cold metadata on the *real* object store measured 31.3 ms mean / 297 ms
p95 / 811 ms max; under write contention the same code ran 17 ms link / 10 ms unlink with one
`os.remove` at **3,081 ms**. Run it as a resumable, checkpointed job; never concurrently with
imports, derivative generation, or restic. Any lease or lock TTL must tolerate multi-second
stalls on a single metadata call.

**`st_nlink == 2` is one extent with two names, not two copies.** It reads like redundancy and
is its opposite. Any progress accounting that sums logical file sizes double-counts every
promoted object.

**The original ordering deadlocks itself.** `FILE_ATTRIBUTE_READONLY` lives in the shared MFT
record, not the directory entry, so setting it on the new name sets it on *all* names — and
NTFS refuses to unlink any name of a read-only file, failing `ERROR_ACCESS_DENIED (5)`.
"Set read-only on the new name, then remove the MediaVault entry" cannot work. (All 12,036
real objects sampled are Archive-only today, so the clear step is a no-op — it must still be
present and idempotent.)

**Promotion is per object, state-classified before every action, and never a
link-all-then-unlink-all batch.** The batch shape was implemented and it produced silent data
loss: one row failed to link because its vault name already existed from an interrupted
earlier run, the unlink pass deleted its MediaVault object anyway, and the survivor has the
right name, the right `nlink`, a normal directory listing and the **wrong bytes**.

Classify first, every time — this *is* the resume path, and the steady state is just the S0
case:

| Observation | State | Action |
|---|---|---|
| object present, target absent | S0 | link |
| object present, target present, `(st_dev, file index)` **equal** | S1 | half-done — resume at the unlink |
| object present, target present, file index **differs** | COLLISION | abort this object, leave it untouched, log for review. Never unlink |
| object absent, target present | AMBIGUOUS | SHA-256 the target. Matches → already promoted, fix the DB row. Does not match → abort loudly |
| object absent, target absent | — | abort loudly; do not mark done |

**Never branch on `ERROR_ALREADY_EXISTS (183)`.** It is returned identically for "target is
already my own hardlink" (the normal crash-resume state), "target is an unrelated file", and a
**case-only** collision on case-insensitive NTFS. Reading 183 as "already linked, proceed to
unlink" — the only reading that makes a 146k-object run resumable — was run and **permanently
destroyed the only copy of a file**. On 183, re-enter the classifier.

Then, for S0/S1, in this order:

1. Precondition assert: object has `nlink == 1` and no read-only attribute (baseline confirmed
   across 12,036 objects and 2,500 nlink samples — any violation means something else changed
   the store). Assert `st_dev(object) == st_dev(target parent)`.
2. `CreateHardLinkW` new ← existing.
3. `GetFileInformationByHandle` on **both** names. Assert: equal volume serial; equal file
   index; index != 0; `nlink == 2` on both; equal size; reparse bit clear on both. Any failure
   aborts *this object* with its MediaVault name intact.
4. Clear read-only if set.
5. `DeleteFileW` the MediaVault name, with bounded backoff on `ERROR_SHARING_VIOLATION (32)`.
   Contention measured at 0.5%, all recovered on the first 20 ms retry. Note that CPython's
   `open()` does not pass `FILE_SHARE_DELETE`, so **every Python reader in this project blocks
   this unlink**.
6. Re-stat the survivor: assert `nlink == 1`, index unchanged, size unchanged. **Only then**
   set read-only.
7. Record the promotion. The DB row, not the directory listing, is the record.

**Never set read-only when the unlink did not succeed.** Doing so makes the surviving object
name undeletable and mutates the repair error from 32 to 5 — a repair pass written to retry on
32 never recovers it, and a naive "vault name present" check reports the object as promoted.
If the unlink is still blocked after the retry budget, leave the object half-linked, record it,
and move on. The repair pass must clear read-only on either link first and retry on **both** 32
and 5, and must be idempotent. It cannot use the USN journal — that is not active on G: — so it
needs its own persisted intent record.

**Identity, never name existence, decides "already promoted."** A completed promotion is
metadata-identical to an ordinary unrelated file (`nlink 1`, same attrs), and a hard-kill test
produced a half-linked object that existence checks report as done. File-index comparison is
sound within a run — zero index reuse across 400 create/delete cycles.

**Per-batch free-space assertion.** Capture `disk_usage("G:").free` before and after; abort if
the drop exceeds `256 KiB × promoted_count + 1 MiB`. A hardlink costs ~410 B/file into an
existing directory; a 25 MiB copy costs 26,775,552 B. This is the *only* thing that would catch
a silent degradation to copy — G: has 1.92 TB free, so a full 420 GB copy completes with
1.50 TB to spare and raises nothing on its own.

**Mandatory post-Phase-4 re-hash sweep**, mirroring Phase 2a: every promoted vault name
re-hashed against its recorded SHA-256, non-zero exit and an explicit count of mismatched and
missing names. A wrong-bytes survivor is indistinguishable from success by existence, size,
`nlink`, file count or free space. Budget it — a full 420 GB pass is another ~4–5 h, so either
scope it to rows the DB marks in-flight or schedule the full pass explicitly.

Vault target names must be collision-free **by construction, including case-insensitively**.
Path lengths are bounded (real object paths max 148 chars) and 369-char paths work unprefixed
on this volume, so assert a length bound rather than adding `\\?\` ceremony. Promoted files do
**not** inherit the vault tree's directory ACLs — they carry explicit, non-inherited ACEs,
permanently immune to later inheritance changes. Harmless today; must be stated if the vault
tree is ever locked down.

For accepted **gap-filled** assets: rename out of `G:\vault\.staging\` with no-replace
semantics. If the target name exists, **do not** infer the bytes are already published —
SHA-256 the target and compare. Match → drop the staging copy. Mismatch → abort loudly and keep
staging; a different object owns that name. NTFS is case-insensitive, so a case-only variant
collides too.

Then clear remaining staging and unlink excluded MediaVault objects, **one object at a time
through the same verify-gated sequence** — never as a bulk pass over a list. This is the most
dangerous delete in the system. It touches only content keys explicitly marked excluded. (The
deletion of `G:\photos` at the Gate is the other delete path; "the only delete path" was
wrong.)

**Reversal of an exclusion is not one `restic dump`.** It is: look the content key up in
`origins.jsonl` to recover the original `G:\photos` path, translate that path to restic's
snapshot form, then `restic dump <snapshot> <path>`. The path argument is a **bare root-entry
name with no leading slash** — `G/photos/x.jpg`, not `/G/photos/x.jpg` and not the Windows form;
`/`, `.` and `/photos` all fail with the misleading `path "\\C:" not found in snapshot`. It is
**not addressable by content hash** — restic chunks anything over 512 KiB, so
`restic find --blob <sha256>` returns nothing for any real photo or video (verified: 20 MiB no
match, 97 KiB match).

It only works for files the repo actually contains. **As of the 2026-08-02 top-up that is all
1,374,328 of them, verified per file**, so this reversal path is now backed by measurement
rather than by the assumption that the snapshot was complete. Before the top-up it was 30 git
loose objects short, plus — invisibly to a path-and-size check — three files whose bytes had
changed at constant size. That is why the top-up is a precondition above; the earlier text
demanded a full `--force` pass for the same reason, before the coverage was known to be
complete.

### Phase 5 — Group

Pure DB. Minutes.

- Exact dedup: already done, in Phase 0.
- **RAW+JPEG pairing**: `(directory, stem)` plus corroborating EXIF timestamp. The Lumix card
  is `P1080096.JPG` + `P1080096.RW2` throughout, so this is near-certain evidence, not
  similarity. Collapses ~14k tiles.
- Representative: highest pixel count → largest bytes → has EXIF. Unedited beats edited.
- `sort_key` = capture timestamp. **Never a dense rank** — a rank forces renumbering every
  row on every future import.

Capture time chain: EXIF `DateTimeOriginal` → filename pattern (`IMG_20190704_`, `PXL_`,
`Screenshot_`) → **`min(mtime)` across all origins**. Never ctime: v1's records show ctime is
the 2026 copy date while mtime survived from 2019 and 2024. Having N origins per file is an
advantage — the earliest mtime across all copies is the best date proxy.

**Perceptual near-dup grouping is computed and stored, but does not collapse tiles.** Burst
frames of one scene look near-identical to pHash, and over-grouping *hides* photos. v1's
stacks are recorded as built-but-uncalibrated (`F57`: no labelled-corpus calibration exists).
Ship exact + RAW/JPEG, look at the result, then decide.

## Triage

**Model:** an ordered rule list. Each rule is a predicate over survey metadata with a
decision of `exclude`/`include`. Rules evaluate top-down, first match wins, per-file
overrides beat all rules. Ordering is what lets you say "exclude everything under
`node_modules`, except this one folder". Counts recompute instantly — it is all SQL over a
sub-GB catalog on NVMe.

**Review order — cheapest and most decisive first**, so the working set collapses fast:

| # | Screen | Why here |
|---|---|---|
| 0 | **No image content** — the Phase 1 list, as a table | Already excluded; shown so nothing is invisible |
| 1 | **Container directories** — `node_modules`, `.git`, `site-packages`, `.venv`, `.cache`, `AppData`, `Program Files`, `vendor`, browser profiles, Steam | Biggest single win. `home-chris arch backup` is 1,077,495 files yielding 142,222 candidates at ~1 MB average — that tree is the target |
| 2 | **File type** — every extension with count, bytes, contact sheet | `.gif`, `.webp`, `.bmp` resolve in one click each |
| 3 | **Dimensions** — long edge ≤64 / ≤256 / ≤512 / ≤1024 / >1024 | The filter that actually kills the 54,899 `.png`. Nearly all UI and web assets die at ≤512 |
| 4 | **Exact-dimension clusters** — top `(width,height)` pairs by count | Screenshots pile up hard at your screen and phone resolutions. Separates "these 4,000 are all 1920×1080" in one action |
| 5 | **EXIF camera presence** | Not a filter (messaging apps strip EXIF) but the right way to *sort* the remainder: review the no-camera pile folder by folder |
| 6 | **Source folder** — the 8 trees, then second level | Accept `lumix\DCIM` and `usb f\DCIM` (189 GB, pure camera) wholesale; scrutinise the backup trees |
| 7 | **Everything still undecided** — plain contact sheet | Nothing reaches the vault without having been seen at thumbnail scale at least once |

Each screen: the rule, live counts of what it would exclude and keep (files + GB), a
virtualised contact sheet of **every** match, per-file override toggles. Nothing applies
until confirmed.

**Screens 0–2 need only path and extension, so they run on the full 1.38M-row inventory with
no reads at all.** Screen 3 needs dimensions, which files outside MediaVault do not have — so
a **header-only probe** (read image headers, never decode) fills `width`/`height` for whatever
survives screens 0–2, between screen 2 and screen 3. That is precisely why the cheap,
decisive screens come first: the probe only ever runs on the remainder.

**Two properties that matter.** Triage writes metadata only — it never touches `G:\photos`
(invariant 3 on a new surface). And decisions save as a versioned rule set, so any decision
reverses by flipping a rule; the survey data is already on the SSD.

**Same app as the grid**, different mode: shared virtualised grid, keyset paging, SSD
thumbnails, click-to-reveal. Triage adds a rule sidebar and the only write endpoints in the
system — separate route namespace, and that surface goes away when triage is done.

## Grid

Read-only server on `127.0.0.1`. Four routes. No framework — one `index.html`, one `app.js`,
one `style.css`.

| Route | Does |
|---|---|
| `GET /` | the page |
| `GET /api/photos?before=<sort_key>&before_id=<id>&limit=500&kind=image` | keyset page: `[{id, w, h, th}]` |
| `GET /t/<sha256>.webp` | thumbnail from NVMe, `immutable` |
| `POST /api/reveal {id}` | `explorer.exe /select,<vault path>` |

Filters as query params from the start, even with one filter, so adding facets later extends
the contract instead of renegotiating it.

**The cursor is the pair `(sort_key, id)`, never `sort_key` alone.** Step 4 resolved 146,034
photos onto only 27,076 distinct sort keys: 90.5% of rows share theirs and the largest single
tie is 9,143, because most of the library is dated by `min(mtime)` and a bulk copy puts
thousands of files on one second. A one-column cursor cannot page through a tie wider than the
page — it repeats a page forever or skips the rest of the tie. `photo_sort` is already
`(sort_key DESC, id DESC)` and `photo.id` is a primary key, so `WHERE (sort_key, id) < (?, ?)`
is both correct and indexed; the route just has to carry the second half.

**Minimising perceived load delay** — the stated requirement, in order of effect:

1. **ThumbHash in the page JSON.** ~30 bytes per photo, rendered as a blurred placeholder the
   instant the row scrolls in — zero extra requests, so tiles are never empty. Computed free
   during the Phase 2 decode.
2. **Thumbnails on NVMe, never the HDD.** ~30k × 25 KB ≈ 750 MB.
3. **Content-hash URLs + `Cache-Control: immutable`.** Can never be stale, so the browser
   stops asking after the first pass. (v1's `F47` is this header on a *mutable* URL — the
   hash in the path is what makes it safe.)
4. **Stored `width`/`height`** so justified rows lay out before any image loads. No layout
   shift, no measuring.
5. **Keyset paging, minimal payload** — integers only, no strings.
6. `IntersectionObserver` prefetching ~1000 px ahead; DOM recycling so ~3 screens exist at once.

At ~30k tiles this is comfortable; the design holds at 10× that.

**`/api/reveal` is the only security-sensitive surface in the system:**

- takes an **id**, never a path — the client cannot name a file
- path comes from the DB, is realpath-resolved, and must **prove containment under the vault
  root** (`F05` and `F13` are exactly this check missing)
- bind `127.0.0.1`, validate the `Host` header (`F48` is a DNS-rebinding hole from omitting
  it), non-GET plus same-origin
- argument-vector invocation, never a shell string; `/select,` with spaces needs an explicit
  test

## Why 1536, and what it buys later

Every expensive output is a function of **one decoded pixel array**: all derivative sizes,
the entire quality-feature list, pHash/dHash/colour, `decoded_pixel_sha256`. So: decode once
per asset, ever. (v1 decodes at least twice by design — `review_preview` from the inbox, then
`asset_preprocess` from the object.)

The 1536px WebP is not a display size. It is the substrate that makes *future* features
cheap: sharpness, entropy, histogram, blockiness, blankness, colour distribution, perceptual
hashes all compute fine at 1536px. ~36 GB buys never re-reading 419 GB of RAW off a USB HDD.

| Operation | This design | v1's model |
|---|---|---|
| Initial ingest | 3–5 h | days (two decodes, full RAW) |
| Add a 5,000-photo folder, all features live | 10–20 min, read-bound | + full stack profile rebuild |
| Add one new quality feature, whole corpus | 30–60 min from local WebP | full re-decode of 419 GB RAW |

Two rules protect the bottom two rows:

**No phase may be O(total corpus).** Grouping is incremental — a new photo joins a component,
merges two, or forms its own; cover ranking re-runs only for touched stacks. v1's
`stack_profile_materialize` rebuilds membership and order corpus-wide per profile, and `F32`
records that generations aren't reliably invalidated when new assets arrive.

**No materialized projections.** Calendar is `GROUP BY` date, equipment is `GROUP BY`
camera/lens, folder view is `GROUP BY` origin path prefix, map is `GROUP BY` GPS grid. Over
30k rows on NVMe that is single-digit milliseconds. v1 has `calendar_buckets`,
`folder_hierarchy_nodes`, `equipment_rollups`, `map_clusters`, `facet_rollups` and a generic
`materialized_views` table because its catalog was 6.97 GB on a USB HDD — a constraint this
design removes. Retrofitting *away* from materialization means rewriting every view;
materializing one slow view later is an afternoon.

**Per-feature versions, not one global analyzer string.** v1's model is bump-and-recompute-
everything. Per-feature versioning plus the working derivative means adding feature N+1
recomputes only feature N+1.

## Explicitly not building

Job ledger, leases, claim tokens, worker runtime, import approval flow, saved views, facet
and materialized-view rollup tables, multi-size display derivatives, plugin seams, any
interface layer over SQLite, `run_id` (back-fills trivially — everything predating the
migration is run 1).

Test for anything else: **if adding it later is a migration rather than a rewrite, add it
later.**

## Open decisions

1. **`F33` — entity lineage.** When two entities merge because a RAW/JPEG pair is discovered
   late, what happens to favourites and ratings attached to each separately? v1 has no policy.
   Incremental grouping makes this routine rather than rare, so it needs answering before the
   library exists. Keying state on `content_key` rather than `photo.id` defers it safely — the
   state survives the merge — but the *display* rule (union? most recent? highest?) is still a
   choice.
2. ~~**Restic verification.**~~ **CLOSED 2026-08-02 by Phase 0.** `check --read-data` ran over
   all 24,785 packs with no errors, and — the stronger claim — all 1,374,298 file nodes were
   reconstructed from the packs and compared per-file against a fresh disk SHA-256, with zero
   same-size same-mtime disagreements. So the repo is both internally sound *and* holds the
   bytes the disk holds. The stale-blob-list hazard is excluded by measurement rather than by
   argument. The password never passed through the assistant: it stays a DPAPI blob reached via
   `--password-command`.

   **What replaces it as the open risk** is not the off-site copy's 39-file lag — that is
   accepted (all git internals, zero media) and is step 13b's housekeeping. It is decision 5.
3. **`.png` policy.** 54,899 files. The whole question is dimensions, which is why it is
   triage screen 3 rather than a prefilter.
4. **Staging peak.** Phase 2 holds ~420 GB in staging while `G:\vault` fills. 1,790 GB free, so
   comfortable, but it means triage and promotion should not be left indefinitely.
5. **What happens after the build ends — where new photos enter, and what backs the vault up.**
   Raised 2026-08-02. This plan migrates a fixed corpus and stops. `G:\photos` is deleted at the
   Gate, so it is not the answer, and `G:\vault` has **no import path and no backup**. Every
   hour figure in this document is a one-off migration cost; none of them says what next month's
   card dump costs.

   > **Verdict, 2026-08-02: defer it. The architecture was audited against future import and
   > nothing needs changing now.** Continue through `BUILD-PROMPTS.md` as written. The audit:
   >
   > | what later import needs | what already provides it | verdict |
   > |---|---|---|
   > | discover new files | `walk_disk(root)` — root-parameterised; cost is proportional to the new directory, not the corpus | reuse as-is |
   > | hash them | `Hasher(root)` and `hash_regime(work, root, …)` — also root-parameterised | reuse as-is |
   > | decide "is this a duplicate" | `file` keyed on `sha256`, `origin` many-to-one → a primary-key lookup, never a corpus scan | O(1) per file |
   > | derivatives and features | decode once → every tier from one pixel array; the 1536px substrate; per-feature `feature_ver` | designed for it |
   > | grouping | incremental — a new photo joins a component, merges two, or forms its own | designed for it |
   > | schema | `origin` / `file` / `photo` need **no new column**; `file.state='pending'` is already the arrival state | **no migration** |
   > | keep triage decisions across re-grouping | `state` is keyed on `sha256`, never `photo.id`, and `triage_override` is content-keyed — so re-importing known content inherits its existing decision | designed for it |
   > | back the new object up | **nothing** | the one real gap |
   >
   > The decisive line is the schema row. This document's own test is *"if adding it later is a
   > migration rather than a rewrite, add it later"*, and import needs no migration at all.
   >
   > What also holds, measured rather than assumed: the vault is **≈211k entries** against
   > `G:\photos`' 1.38M, so the ~30 min metadata-walk tax that makes whole-tree backup of the
   > source annoying is roughly 5× smaller for the vault; and vault objects are immutable and
   > content-addressed, so an incremental backup is purely additive, `--force` never applies,
   > and a scrub is a local re-hash (*does this file hash to its own name?*) rather than a
   > restore.

   **Three things are free to decide now and awkward to retrofit. Decide, do not build:**

   - **The vault's backup is a SECOND repo, and it must be off-device from the start.**
     `G:\ResticPhotos` is partition 2 of disk 3 — the same disk as the vault — so backing the
     vault into it reproduces exactly the "two copies on one USB HDD is one hardware failure
     from zero" problem this plan already forbids. After the Gate, `ResticPhotos` is a *frozen
     archive of a deleted `G:\photos`*, not an ongoing target. `config.toml` gains a key when
     the step arrives; nothing changes before then.
   - **Back up `vault_root` only.** `deriv`, `meta` and `thumb` all regenerate from the
     canonical objects. Excluding them roughly halves the walk and avoids carrying ~36 GB of
     substrate that a re-run reproduces exactly.
   - **`origins.jsonl` must be append-only** — see step 13b. A format that can only be
     regenerated wholesale from a `G:\photos` that no longer exists goes stale the first time
     anything new arrives.

   The procedure itself is not designed here on purpose: it is a design decision, not a
   correction, and this document should not grow a procedure nobody has reviewed.
6. **`origins.jsonl` does not exist, and it is the binding constraint on recoverability.**
   Raised as a gate condition already, restated here because it is routinely mistaken for
   paperwork. The off-site repo holds every photograph; without this map you cannot navigate
   from a vault object back to the original path, which is the difference between "the photos
   are backed up" and "the photos can be got back". It must exist on disk before Phase 4.

## Build order

| Step | Output | Gate |
|---|---|---|
| ~~1~~ | ~~restic blob-list spike~~ | **Done 2026-08-01 — killed Phase 0's premise. Rewritten above.** |
| ~~2~~ | ~~Hardlink spike~~ | **Done 2026-08-01 — mechanism confirmed, ordering and resume path rewritten above.** |
| ~~2b~~ | ~~Orientation spike~~ | **Done 2026-08-01 — `.arw` inconsistent. 1,486-asset repair added above.** |
| ~~3~~ | ~~Schema + migration runner~~ | **Done 2026-08-01.** `schema_version` 2 in both files. `origin` carries `nlink` and `file_id`. Pre-rotation raster dims are **not** in the schema — step 8 chooses that branch or the re-read one, and pays a migration `003` if it wants the column |
| ~~4~~ | ~~Phase 2a import: `records` → `origin`, extended metadata~~ | **Done 2026-08-01.** 146,034 `file` rows, 251,087 `origin` rows from 251,824 observations, 0 objects missing, 0 paths claimed by two assets. Capture time 38,200 (26.2%), not 38,767: the 567 shortfall is 560 `0000:00:00 00:00:00` EXIF nulls plus 7 odd formats, and rejecting a null sentinel as a date is correct. **The exiftool sidecars under `meta_root` were not written** — see below |
| 5 | Grid UI against adopted 384px thumbnails | Proves paging, thumbnails, reveal — on real data, early |
| ~~6~~ | ~~Phase 0 inventory~~ | **Done 2026-08-02 in 12h50m.** `origin` 1,374,328 rows, all hashed, 0 errors; 787,798 distinct SHA-256; all 251,087 adopted hashes agreed. Content-level cross-check complete: every one of the 1,374,298 snapshot file nodes reconstructed from the repo and compared per-file, **zero** same-size same-mtime disagreements. `check --read-data` clean. Top-up snapshot `1e80c50e` covers the 39 drifted files |
| ~~7~~ | ~~Phase 1 prefilter~~ | **Done 2026-08-02 in 2.7s.** Nine `exclude` rules at `seq` 0–8 in `state.sqlite3`, nothing written to the catalog. **101,986 files / 4.77 GB excluded, 685,812 / 544.14 GB surviving** — not the ≈41,700 / 0.5 GB this document predicted, which was the adopted subset. `.png`, `.gif`, `.webp`, `.bmp` matched by no rule |
| 8 | Phase 2a verification read + ARW repair | Background it; ~4–5 h; nothing else may touch G: |
| 9 | Triage UI | — |
| 10 | Phase 2b gap fill | Benchmark on 500 files first |
| 11 | **`origins.jsonl` export + server upload** | **Moved ahead of Phase 4. `G:\photos` deletable; Phase 4 unblocked** |
| 12 | Phase 4 promote + Phase 5 group | Gated on step 11 completing and verifying |
| 13 | Post-Phase-4 re-hash sweep | Phase 4 is not complete without it |

**Step 4 measured three things that change later steps.** All on `G:`, 2026-08-01.

- **Creating many small files is the expensive direction, and the cheap benchmark lies.**
  1,500 gzip sidecars measured 880/s at 16 threads — entirely absorbed by the OS write cache.
  The sustained rate once the cache has to flush is **4–8/s**, so the 146,034 `meta_root`
  sidecars are 5–10 h, not 3 min. They are behind `--meta` and left to a step already paying
  for a `G:` pass; the readings themselves are 74.8 MB of `raw_metadata_json` in the manifest,
  and are a curated ~32-tag subset rather than full `exiftool -a -G` output, so that step has
  to regenerate them anyway. Phase 4's 146,034 hardlinks are the same shape of cost.
- **Never let SQLite join two tables of the manifest.** `assets JOIN asset_extended_metadata`
  probes an index inside a 6.97 GB file once per row — one random seek at ~70 IOPS, measured
  at **4–11 rows/s**, most of a day for the corpus. Two separate table scans joined in a dict
  read the same 146,034 rows in **seconds**.
- **Listing a sharded tree parallelises; the cost is per-directory latency, not bandwidth.**
  101 entries/s serial against **394/s at 32 threads**. Reading the 146,034 sidecars sustained
  ~65/s for 37 min — slower than a manifest scan would have been, and worth knowing before
  step 7 walks 1.38M files.

**Step 6 measured four things that change later steps.** All 2026-08-02.

- **There are no hardlinks in the corpus.** `nlink > 1` is zero across all 1,374,328 files, so
  every duplicate group is distinct filesystem objects. The Gate's "hardlinked names are one
  object and must never be counted as reclaimable space" guard is correct to keep and will
  never fire. **586,530 redundant paths / 603.8 GB is a real reclaimable figure.**
- **Dedup makes restore slower, and the spread is 2.5×.** `10tb arch backup` dumped at
  44.5 MB/s against 110.5 in low-dedup `a52s`, and took 55% of Phase D's wall clock for 40% of
  the bytes. Any later step that reads from the repo should budget per-subtree, not per-GB.
- **Small files are slow on the disk side, not the repo side.** Disk hashing sustained 376
  files/s; dumping the same shape *out of restic* ran 400–2,400 files/s. Do not carry the
  small-file penalty into estimates for repo-side work.
- **v1's `source_files` holds 1,374,328 rows** — v1's discovery and an independent walk agree
  on the corpus size to the row. Where v1 and this build disagree, it is not about *which files
  exist*.

**Steps 11 and 12 were the other way round.** Phase 4 unlinks the last same-disk redundancy;
the plan performed that irreversible delete one full step *before* the first off-device byte
existed, while its own Gate section states the rule it was breaking. `origins.jsonl` also has
to exist before Phase 4, not after it, because it is the only content-hash → path map the
reversal story depends on.

Adopting MediaVault reorders this usefully. Step 4 is pure database import with no large
reads, which means **a working grid at step 5** — on real photos, before any expensive pass
runs. That proves the read path, the thumbnail path, and reveal-in-Explorer while the
420 GB verification is still ahead of you rather than behind.
