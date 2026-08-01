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
| `G:\photos` | 1,382,380 files, 1,073.53 GB |
| `G:\ResticPhotos` | 406.22 GB, 2 snapshots, newest **2026-07-18**. Coverage of the current 1,382,380 files is **unverified** — the repo has never been opened |
| v1 catalogued | 1,374,328 files — **8,052 fewer than the disk has** |
| v1 called "media" | 251,087 instances / 966.1 GB → 146,034 distinct / 420.17 GB |
| Exact duplicates | **546 GB of logical bytes** — not a reclaimable-space figure (see below) |
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

**Measured G: throughput, 2026-08-01 — 110 MB/s was wrong by 3–5×.** Streaming SHA-256 over
randomly sampled MediaVault objects measured **22.5 / 28.4 / 34.5 MB/s** in three independent
runs; cold random reads over the sha256-sharded store measured 2.7–23.6 MB/s; the drive does
~70 read IOPS at 53 ms average latency under load. Cold `stat` on the object store is 31.3 ms
mean / 297 ms p95 against 0.010 ms warm — a 3,000× cold/warm ratio. **Every hour estimate in
this plan was computed from 110 MB/s and every one of them is 3–5× optimistic.** They have
been revised below; do not reintroduce the old figure.

**Volume facts, measured.** `G:\photos`, `G:\MediaVault`, `G:\ResticPhotos` and `G:\backup`
are one NTFS volume (serial `0xb42554ea`) on partition 2 of disk 3 — one enclosure, one
spindle, one USB bridge. That is what makes Phase 4's hardlink legal, and it is also why two
copies here is one hardware failure from zero. `G:\MediaVaultImports` **does not exist**. The
USN change journal is **not active**, so no journal-based reconciliation is available. 8dot3
name creation is disabled, so 146k near-identical 107-char hex names do not hit the O(n²)
short-name pathology. Long paths work unprefixed (369 chars verified). **There is no undelete
affordance**: `DeleteFileW` bypasses the Recycle Bin and VSS cannot be queried from a
non-elevated token.

**`G:\photos` pathological-input census** (own read-only walk, 2026-08-01): 1,382,380 files,
1,152,691,239,120 bytes, 123,710 distinct sizes, 19,660 zero-byte files, 896 non-ASCII
filenames, 55 paths over 255 chars, 1 file over 2 GiB, 0 stat errors.

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
| `state.sqlite3` | `E:\photolib\` | **Irreplaceable.** Written only by the app. |
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

### Phase 0 — Fresh snapshot, then inventory from restic

> **Spike resolved, 2026-08-01. The original mechanism is dead.** `restic cat tree` does
> expose the ordered blob list, exactly as assumed — and it is unusable twice over. This
> section is the rewrite.

```
restic backup G:\photos --force
```

`--force` is **mandatory, not defensive**. Incremental mode skips any file whose size *and*
mtime match the parent snapshot and carries the stale blob list forward. Reproduced: a JPEG
rewritten by `exiftool -P -overwrite_original -Artist=…` at the same tag length keeps its
size and its mtime to the nanosecond, restic reports `files_changed:0, data_blobs:0`, and
`restic restore` of the *newest* snapshot then returns the **old bytes**. `--ignore-inode`
and `--ignore-ctime` do not fix this; only `--force` re-reads. The control case holds —
mtime bumped with content untouched does trigger a re-read — so the failure is
one-directional and silent in the dangerous direction.

This closes the 8,052-file gap. The snapshot is then **current but not authoritative**.
Restic's Windows node JSON carries no inode, nlink or device field; it drops alternate data
streams; and it replaces unpaired UTF-16 surrogates in filenames with U+FFFD, so two
distinct files can be reported at one byte-identical path that does not exist on disk and
`json.loads` never raises. Treat the snapshot as a second opinion to be reconciled against a
direct `os.scandir` walk, never as the sole inventory.

**Do not derive any identity from restic-stored blob lists.** The premise this plan was
built on is false in the direction dedup depends on:

- A node's `content` list is the chunk list from the last time restic actually *read* the
  file. Equal lists therefore do **not** imply equal bytes — same path, three snapshots, the
  stored key unchanged while the on-disk SHA-256 had changed.
- The chunker polynomial is not repo-fixed, it is write-path-fixed. `restic copy` imports
  foreign-chunked blobs with **no warning**, so one repo can hold byte-identical content
  under two different blob lists (verified: 12 blobs vs 13 for the same 20 MB file, in one
  repo). `G:\ResticPhotos` is an older repo that 0.19.1 will append to.
- `sha256(json(content))` false-merges every symlink and junction onto one key, because
  those nodes carry `content: null` — and a `(size, content)` composite does not rescue it,
  since symlink nodes have no `size` key either.
- The formula is under-specified: `json.dumps(c)` and `json.dumps(c, separators=(',',':'))`
  differ for every list with ≥2 elements, i.e. every real photo, and agree on the empty list,
  i.e. the only case anyone would put in a test fixture.

**The route that actually works — and it is faster than the one it replaces.** Per snapshot
root entry, in a single invocation:

```
restic --no-lock dump --archive tar <snapshot> <root-entry-name>
```

piped into a streaming tar reader computing SHA-256 per member. `content_key = sha256(full
file bytes)`, stored alongside `size_bytes`. Measured: 30,000 files fully hashed in 7.5 s in
one invocation; decrypt runs above 500 MB/s so the G: read is the bound. It round-trips CJK,
Cyrillic, emoji, accented and 125-char paths correctly. Two gotchas to encode: `--no-lock` is
mandatory on every read command (the default writes a lock file *into the repo*), and the
path argument must be a **bare root-entry name with no leading slash** — `/`, `.` and
`/data4` all fail with the misleading `path "\\C:" not found in snapshot`, while `data4`
works. Discover root entry names from `restic --no-lock ls --json` first.

Use `restic --no-lock ls --json --long --recursive` for the path/size/mtime inventory only —
never for identity. It scales: ~6,750 nodes/s through a 100× directory-count increase, ~4
minutes projected for 1.38 M nodes.

Preconditions, each an abort rather than a skip:

- `type == "file"` as an explicit allowlist, never `not dir`. There are three node types:
  junctions appear as `type: "symlink"` with a `linktarget`, and `content` is
  present-with-null on both dir and symlink nodes.
- `size_bytes = node.get("size", 0)` — the key is absent for zero-byte *and* symlink nodes.
- Decode all subprocess output with an explicit `encoding="utf-8"`. Python's Windows default
  is the ANSI codepage, which silently rewrites non-ASCII into different, valid-looking paths
  with no exception raised. 896 non-ASCII names and 55 over-255-char paths are exposed to it.
- `restic --no-lock cat config` first: record `chunker_polynomial`, and check whether any
  snapshot carries an `original` field (evidence of a past `restic copy`).
- Named decisions, not defaults, for: symlinks and junctions (excluded — `content` is null),
  alternate data streams (not represented; lost on restore), the 19,660 zero-byte files (all
  one key — collapsing them destroys distinct paths without losing bytes), the 55 paths over
  255 chars, and the one file over 2 GiB.
- Duplicate means *distinct filesystem object with identical content*. Capture `st_nlink` and
  the NTFS file ID during the disk walk and group by file ID first; hardlinked names are one
  object and must never be counted as reclaimable space or offered as reject candidates.

Writes `origin` (~1.38 M rows) and `file` (`state='pending'`). Assert before proceeding:
`count(distinct path) == count(file rows)`, and
`files_seen_on_disk == files_seen_in_snapshot == files_hashed_from_repo == files_hashed_from_disk`.
Any inequality aborts loudly. Count U+FFFD in restic-reported paths and route those rows to
filesystem-side reconciliation. **Never treat "could not open" or "could not hash" as "no
duplicate found".**

**The rejected fallback was costed on a number that is 20× wrong.** "`scandir` walk, group by
size, hash only inside size-collision groups" saves 4%, not most: measured on `G:\photos`,
**95.99% of files (1,326,992) and 90.9% of bytes (1.05 TB)** sit in multi-member size groups,
because there are only 123,710 distinct sizes and the distribution is quantized into groups
of 675–1,047 members. Size grouping is lossless and near-useless here. If a cheap pre-filter
is wanted, use first-64 KiB + last-64 KiB + size — but the cross-check below needs the full
read regardless.

**What the dump route actually saves:** not hashing — SHA-256 runs at ~1.5 GB/s against a
disk measured at 22–35 MB/s, so hashing during the read is free by a factor of ~50. It saves
knowing which files are duplicates before reading them, so Phase 2 reads 420 GB instead of
966 GB. At the measured rate those ~546 GB of avoided reads are **~5–7 hours**, not 1.5 — the
saving is larger in wall-clock than the plan claimed, while every absolute figure was ~4×
short. It costs one sequential pass over the 406 GB repo, on the same disk head. **Measure
sequential pack-read throughput before committing to this estimate** — it is the one input
nobody has measured.

**Note this reorders your request.** You asked for triage *before* dedupe. Dedupe is now
**cheap** rather than free — one repo pass instead of 1.07 TiB of scattered reads across
353,981 directories — so triage still runs on deduped content, which is strictly better for
review: ~146k tiles instead of ~251k, each showing "appears at 5 paths" rather than appearing
five times.

**Policy question this raises.** Phase 0's first action *writes* to `G:\ResticPhotos`, which
the project's read-only posture toward that tree does not currently carve out. Decide that
explicitly before running it.

### Phase 1 — Categorical prefilter

Pure SQL over `origin`/`file`. Zero I/O. Seconds.

Excludes only formats nobody photographs in, and non-images v1 misfiled as media:

`.svg` (22,060) · `.ts` (18,789) · `.file` (498) · `.msg` (198) · `.ico` (52) · `.dds` (42) ·
`.xbm` (7) · `.pyc` (7) · `.cur` (5)

≈ 41,700 files, ~0.5 GB. No judgement calls in that list. Everything genuinely ambiguous —
notably the whole 54,899-file `.png` pile — survives to triage, where changing your mind is
free.

This is the only irreversible step before the source is gone, so it stays narrow. Shown in
triage as a table, not a contact sheet: you can't look at a `.d.ts`.

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
2. **Anything in the restic inventory with no MediaVault asset** — the 8,052-file gap and
   any real photo v1's classifier called `non_media`. These read from `G:\photos` into
   `G:\vault\.staging\`, decode once, and produce the full output set.

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
assumed, that every byte exists in MediaVault or staging *and* in restic. Nothing to date
establishes restic's coverage: the repo has never been opened, and its newest snapshot
(2026-07-18) predates the current disk state. **Proving coverage is a separate, explicit,
blocking task.**

Verification, all three:
1. Every MediaVault object re-hashed and matching its filename (Phase 2a — ~4–5 h, not free),
   and every gap-filled object matching its recorded SHA-256.
2. Every Phase-1-surviving `origin` row has a `file` row in `state='read'` or `'adopted'`,
   **and** `count(distinct origin.path) == count(origin rows)`, and no row reached that state
   via a failed or skipped read.
3. **Content-level, not path-level, reconciliation.** A path diff cannot catch what was
   measured: restic collapses distinct filenames onto one reported path, the Windows ANSI
   default silently mangles the join between the two lists, and — decisively — a file whose
   bytes were rewritten in place at constant size with mtime preserved appears in *both* lists
   at the same path while restic holds the old bytes. So: compute SHA-256 twice by two
   independent paths, once from the repo via `dump --archive tar` and once from a fresh
   `os.scandir` of `G:\photos`, and require per-file agreement. Any mismatch, and any file
   present on one side only, aborts loudly. This — not a path diff — is the evidence that the
   backup contains the bytes, which is the actual precondition for deleting the source.

**Deletion is still gated on the server upload completing, not on restic existing.** The
repo and `G:\photos` are on the *same physical disk* — confirmed to the device: volume serial
`0xb42554ea`, partition 2 of disk 3, one USB enclosure. Two copies on one USB HDD is one
hardware failure from zero. Upload the restic repo (406 GB, encrypted, deduped) plus
`origins.jsonl`.

`origins.jsonl` is the **only** content-hash → original-path map, and Phase 4's reversal story
is unusable without it. It must exist on disk **before Phase 4**, not merely be uploaded here.

**Two structural gaps this gate does not cover.** It declares `G:\photos` deletable two phases
before Phase 4 destroys the MediaVault directory entries — from that point the off-device
upload, not the same-disk repo, is the only copy standing behind Phase 4. And this plan
establishes **no backup of `G:\vault` at all**: after Phase 4 the vault is the sole live
representation of the library, as single extents on one USB HDD, last verified before
promotion and never again. A single bad sector kills the object under both names at once and
nothing here detects it. There is no undelete affordance on this machine to fall back on.

### Phase 3 — Triage

Interactive, offline from the source, no deadline. Details below.

### Phase 4 — Promote

> **Gated.** Before any MediaVault directory entry is unlinked: (a) the off-device upload of
> the restic repo plus `origins.jsonl` must have completed and been verified; (b) a fresh
> `restic backup --force G:\photos` must have run; (c) `origins.jsonl` must already be on
> disk. **Phase 4 must not run until at least one full copy of the content exists on a device
> that is not disk 3.** The Gate section already states this principle for `G:\photos`; Phase
> 4 was exempting itself from it.

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
snapshot form (`G:\photos\x.jpg` → `/G/photos/x.jpg`; the Windows form is rejected outright),
then `restic dump <snapshot> <path>`. It is **not addressable by content hash** — restic chunks
anything over 512 KiB, so `restic find --blob <sha256>` returns nothing for any real photo or
video (verified: 20 MiB no match, 97 KiB match). And it only works for files the repo actually
contains, which is why the fresh `--force` backup is a precondition above.

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
| `GET /api/photos?before=<sort_key>&limit=500&kind=image` | keyset page: `[{id, w, h, th}]` |
| `GET /t/<sha256>.webp` | thumbnail from NVMe, `immutable` |
| `POST /api/reveal {id}` | `explorer.exe /select,<vault path>` |

Filters as query params from the start, even with one filter, so adding facets later extends
the contract instead of renegotiating it.

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
2. **Restic verification.** `restic snapshots` and `restic check --read-data` before it becomes
   the backup of record. Hours of reading, and the only way to know the repo is sound. Needs
   your password — supply it yourself; it should not pass through the assistant or land on disk.
   **Now larger than it was.** The repo has never been opened; its newest snapshot is
   2026-07-18; and the stale-blob-list mechanism (Phase 0) means it may hold *wrong bytes* for
   any file ever rewritten in place at constant size with mtime preserved. `check --read-data`
   verifies the repo is internally sound, not that it matches the disk. Only the two-sided
   SHA-256 cross-check at the Gate answers that.
3. **`.png` policy.** 54,899 files. The whole question is dimensions, which is why it is
   triage screen 3 rather than a prefilter.
4. **Staging peak.** Phase 2 holds ~420 GB in staging while `G:\vault` fills. 1,790 GB free, so
   comfortable, but it means triage and promotion should not be left indefinitely.

## Build order

| Step | Output | Gate |
|---|---|---|
| ~~1~~ | ~~restic blob-list spike~~ | **Done 2026-08-01 — killed Phase 0's premise. Rewritten above.** |
| ~~2~~ | ~~Hardlink spike~~ | **Done 2026-08-01 — mechanism confirmed, ordering and resume path rewritten above.** |
| ~~2b~~ | ~~Orientation spike~~ | **Done 2026-08-01 — `.arw` inconsistent. 1,486-asset repair added above.** |
| ~~3~~ | ~~Schema + migration runner~~ | **Done 2026-08-01.** `schema_version` 2 in both files. `origin` carries `nlink` and `file_id`. Pre-rotation raster dims are **not** in the schema — step 8 chooses that branch or the re-read one, and pays a migration `003` if it wants the column |
| 4 | Phase 2a import: `records` → `origin`, extended metadata | Cheap, no large I/O, unblocks the UI |
| 5 | Grid UI against adopted 384px thumbnails | Proves paging, thumbnails, reveal — on real data, early |
| 6 | Phase 0 inventory | `origin` reconciled, content-level cross-check against `scandir` |
| 7 | Phase 1 prefilter | — |
| 8 | Phase 2a verification read + ARW repair | Background it; ~4–5 h; nothing else may touch G: |
| 9 | Triage UI | — |
| 10 | Phase 2b gap fill | Benchmark on 500 files first |
| 11 | **`origins.jsonl` export + server upload** | **Moved ahead of Phase 4. `G:\photos` deletable; Phase 4 unblocked** |
| 12 | Phase 4 promote + Phase 5 group | Gated on step 11 completing and verifying |
| 13 | Post-Phase-4 re-hash sweep | Phase 4 is not complete without it |

**Steps 11 and 12 were the other way round.** Phase 4 unlinks the last same-disk redundancy;
the plan performed that irreversible delete one full step *before* the first off-device byte
existed, while its own Gate section states the rule it was breaking. `origins.jsonl` also has
to exist before Phase 4, not after it, because it is the only content-hash → path map the
reversal story depends on.

Adopting MediaVault reorders this usefully. Step 4 is pure database import with no large
reads, which means **a working grid at step 5** — on real photos, before any expensive pass
runs. That proves the read path, the thumbnail path, and reveal-in-Explorer while the
420 GB verification is still ahead of you rather than behind.
