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
| `G:\ResticPhotos` | 406.22 GB (same content, deduped + compressed 2.64×) |
| v1 catalogued | 1,374,328 files — **8,052 fewer than the disk has** |
| v1 called "media" | 251,087 instances / 966.1 GB → 146,034 distinct / 420.17 GB |
| Exact duplicates | **546 GB** |
| With EXIF camera | 37,822 |
| RAW | 16,388 files / 293.9 GB (`.rw2` 13,893, `.arw` 2,346, `.dng` 146) |
| Est. grid tiles after RAW+JPEG pairing | ~30,000 |
| `G:\MediaVault\objects` | 146,034 files / 420.17 GB — complete, one per asset |
| `G:\MediaVault\derivatives` | 434,673 files / 21.65 GB |
| `G:\MediaVault\records` | 146,034 JSON sidecars / 1.22 GB |

Hardware, which drives most decisions:

| Volume | Disk | Type | Free |
|---|---|---|---|
| `G:` | WD Elements 25A3 | **USB HDD** | 1,790 GB |
| `C:` | CT1000MX500 | SATA SSD | 220 GB |
| `E:` | WDC SN530 | NVMe SSD | 150 GB |

16 logical CPUs. exiftool 13.x, ffmpeg/ffprobe 8.1.1, restic, python, node all present.

**One USB HDD head is the bottleneck for everything.** Every phase below is designed around
reading it as few times as possible.

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
  restic_key   TEXT,                   -- sha256(ordered blob id list). Pre-read dedup key.
  sha256       TEXT,                   -- filled when the bytes are read or adopted
  seen_at      TEXT NOT NULL
);
CREATE INDEX origin_restic ON origin(restic_key);
CREATE INDEX origin_sha    ON origin(sha256);

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

**Two identity keys, one primary.** `restic_key` is available *before* the bytes are read and
exists only to group duplicates cheaply, so Phase 2 reads one member per group. `sha256` is
the real identity and is what `file` is keyed on. This matters because MediaVault is imported
before the restic inventory runs: adopted assets know their SHA-256 and not their blob list.
Keying `file` on `sha256` from the start avoids merging two identity spaces later.

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

## Pipeline

### Phase 0 — Fresh snapshot, then inventory from restic

```
restic backup G:\photos     # incremental; only reads what changed since 2026-07-18
```

This closes the 8,052-file gap and makes the snapshot authoritative and current.

Then walk the snapshot's trees (`restic cat snapshot` → `restic cat tree`, recursively).
Each file node carries its path, size, mtime, and its ordered list of content blob IDs.
`content_key = hash(blob id list)` — **identical blob lists mean byte-identical files**,
because content-defined chunking is deterministic under a fixed per-repo polynomial.

That gives the full path inventory *and* exact dedup **without reading a byte of
`G:\photos`**.

Writes `origin` (~1.38M rows) and `file` (`state='pending'`).

> **Verify first.** I have not confirmed hands-on that `restic cat tree` exposes the blob
> list in the form assumed here. First task of the build is a 20-line spike against a
> throwaway repo. **Fallback if it doesn't:** `scandir` walk, group by size, hash only
> inside size-collision groups. Slower and less elegant; same result.

**What restic actually saves:** not hashing — SHA-256 runs at ~1.5 GB/s against a 110 MB/s
disk, so hashing during the read is free either way. It saves *knowing which files are
duplicates before reading them*, so Phase 2 reads 420 GB instead of 966 GB. That is ~546 GB
of avoided reads, roughly 1.5 hours. Plus a verified inventory instead of a walk we'd have
to trust.

**Note this reorders your request.** You asked for triage *before* dedupe. Restic makes
dedupe free and upfront, so triage now runs on deduped content — which is strictly better
for review: ~146k tiles instead of ~251k, each showing "appears at 5 paths" rather than
appearing five times. The reason for your original ordering (dedup needs an expensive
hashing pass) no longer exists.

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
| Re-hash every object, compare to its filename | **420 GB read** | Proves the bytes; the only large I/O |
| Import the 146,034 `records` sidecars | 1.22 GB read | `origin` rows — avoids scanning the 6.97 GB manifest |
| Import `asset_extended_metadata` **only** | manifest scan | GPS, lens, ISO, aperture, capture time — objective readings |
| Read the derivative tree | 21.65 GB read | Adopt 1536px as the working substrate; copy 384px → `E:` as grid thumbnails; compute **pHash, dHash, ThumbHash and all quality scalars** from the 1536px |

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

**Gate before adopting the 1536px substrate:** spot-check a sample against fresh resizes of
their objects, specifically for **EXIF orientation**. If v1 baked orientation into some
derivatives and not others, every thumbnail, pHash and quality score inherits it, and
sideways tiles in the grid would be the first symptom. The substrate is load-bearing enough
to warrant the check.

Adopt nothing on a database row alone — only where `checksum_sha256` verifies against a file
that exists. The 42,827 `error` rows have no files, correctly, and are skipped.

Grid thumbnails come from the existing 384px WebP rather than generating 512px AVIF. Reusing
what's there beats a marginally better format.

**Estimate: 1.5–2 hours.** ~442 GB read, no large writes, no decode of originals, no RAW
decode at all. The verification read can run concurrently with triage, since triage needs
only thumbnails and metadata — so most of it hides behind human time.

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

Not after triage — after Phase 2b verifies. At that point every byte exists in MediaVault or
staging, *and* in restic.

Verification, all three:
1. Every MediaVault object re-hashed and matching its filename (Phase 2a), and every
   gap-filled object matching its recorded SHA-256.
2. Every Phase-1-surviving `origin` row has a `file` row in `state='read'` or `'adopted'`.
3. Diff restic's path list against a fresh `scandir` of `G:\photos` — catches anything the
   inventory missed (permissions, reparse points, path length).

**Deletion is still gated on the server upload completing, not on restic existing.** The
repo and `G:\photos` are on the *same physical disk*. Two copies on one USB HDD is one
hardware failure from zero. Upload the restic repo (406 GB, encrypted, deduped) plus
`origins.jsonl`.

### Phase 3 — Triage

Interactive, offline from the source, no deadline. Details below.

### Phase 4 — Promote

For accepted **adopted** assets: create an NTFS **hardlink** from
`G:\vault\<aa>\<bb>\<sha256><.ext>` to the existing MediaVault `.blob`. Same volume, so zero
bytes move — seconds, not hours, for 420 GB. Set the read-only attribute on the new name.
Then remove the MediaVault directory entries: link count falls to 1 and the data persists
under the new, extension-bearing name. That is how the `.blob`-breaks-Explorer problem gets
solved without a copy.

For accepted **gap-filled** assets: rename out of `G:\vault\.staging\` with no-replace
semantics — if the target exists the bytes are already published, drop the staging copy.

Then clear remaining staging and unlink excluded MediaVault objects. This is the only delete
path in the system; it is proven under `G:\vault\.staging\` or `G:\MediaVault\objects\`, and
only touches content keys explicitly marked excluded. Reversal, if you regret an exclusion
later, is one `restic dump` of that file.

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
3. **`.png` policy.** 54,899 files. The whole question is dimensions, which is why it is
   triage screen 3 rather than a prefilter.
4. **Staging peak.** Phase 2 holds ~420 GB in staging while `G:\vault` fills. 1,790 GB free, so
   comfortable, but it means triage and promotion should not be left indefinitely.

## Build order

| Step | Output | Gate |
|---|---|---|
| 1 | restic blob-list spike | Confirms or kills Phase 0's premise |
| 2 | Hardlink spike — link, unlink original, verify data survives | Confirms Phase 4's premise |
| 2b | Orientation spike — sample 1536px derivatives vs fresh resizes | Confirms the substrate is safe to build on |
| 3 | Schema + migration runner | — |
| 4 | Phase 2a import: `records` → `origin`, extended metadata | Cheap, no large I/O, unblocks the UI |
| 5 | Grid UI against adopted 384px thumbnails | Proves paging, thumbnails, reveal — on real data, early |
| 6 | Phase 0 inventory | `origin` reconciled, diffed against `scandir` |
| 7 | Phase 1 prefilter | — |
| 8 | Phase 2a verification read | Background it; runs concurrently with everything below |
| 9 | Triage UI | — |
| 10 | Phase 2b gap fill | Benchmark on 500 files first |
| 11 | Phase 4 promote + Phase 5 group | — |
| 12 | `origins.jsonl` export + server upload | Only then is `G:\photos` deletable |

Adopting MediaVault reorders this usefully. Step 4 is pure database import with no large
reads, which means **a working grid at step 5** — on real photos, before any expensive pass
runs. That proves the read path, the thumbnail path, and reveal-in-Explorer while the
420 GB verification is still ahead of you rather than behind.
