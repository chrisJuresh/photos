# Preprocessing and derivatives

**State in v1:** implemented and tested against synthetic corpora. Decoder bounds, checksum
trust, and resource limits need rework. Live use held.

**Depends on:** [storage-and-identity.md](storage-and-identity.md),
[jobs-and-workers.md](jobs-and-workers.md).

## What it does

Everything the interface needs is computed once in a background job and persisted, so no
request ever decodes an image. This is what makes rule 5 in
[invariants.md](invariants.md) possible.

Three outputs per asset: **derivatives** (resized images), **extended metadata** (normalized
EXIF and friends), and **quality features** (numbers the library, stacks, and junk review sort
and rank by).

### Derivatives

- Sharded WebP at 192, 384, 768, and 1536 pixel long edges.
- A high-quality 2560-pixel detail derivative when source resolution warrants it.
- Minimal review previews generated before approval using read-only source access, then final
  derivatives regenerated from the verified vault object after copy.
- Video posters, and safe extraction of embedded RAW previews.
- When an accepted RAW/JPEG group has a suitable non-RAW member, that member is used for the
  logical photo display; RAW preview is the fallback.
- Each row records kind, analyzer version, source asset identity, dimensions, MIME type,
  checksum, relative path, status, error, and timestamps.

### Extended metadata

Normalized plus raw evidence for: capture time and its source and ambiguity; GPS coordinates
and precision; camera make, model, serial, and lens; ISO, aperture, exposure time, focal
length, exposure compensation; dimensions, orientation, duration, codecs; software and edit
history with a derived/edit likelihood; import time and source-folder evidence; and decode or
metadata warnings with analyzer versions.

### Quality features

Persisted as versioned inputs rather than computed in views: luminance histogram and entropy;
sharpness and focus deficit; directional shake and motion evidence; severe under- and
overexposure, highlight clipping, near-black evidence; blankness, obstruction likelihood, and
low-information regions; blockiness and compression damage; corruption and incomplete decode;
resolution class and thumbnail likelihood; edit likelihood; and deterministic composite quality
and cover-ranking values.

## Where the code is

| Concern | File |
|---|---|
| Job claim, derivative generation, feature computation, lease handling | `v1/media_vault/preprocess.py` (64 KB) |
| ExifTool and metadata extraction and normalization | `v1/media_vault/metadata.py` |
| Out-of-process decode helper | `v1/media_vault/_decode_worker.py` |
| Analyzer version strings | `v1/media_vault/config.py:52` |

Analyzer versions are explicit and part of the data contract: `review-derivative-v1`,
`vault-derivative-v1`, `extended-metadata-v1`, `quality-features-v1`, `materialized-view-v1`,
`stack-features-v1`, `stack-profile-v1`, `junk-signals-v1`, `junk-profile-v1`,
`junk-calibration-v1`. Bumping one is how a projection gets invalidated.

## Data it owns

`derivatives`, `asset_extended_metadata`, `asset_features`.

Job kinds: `review_preview` (pre-approval, reads inbox), `asset_preprocess` (post-copy, reads
the canonical object).

## HTTP surface

Derivatives are served, never generated, by the request:

- `GET /api/v1/library/entities/{entity_id}/derivatives/{long_edge}`
- `GET /api/v1/imports/{batch_id}/items/{item_id}/preview`
- `GET /api/assets/{asset_id}/preview` (legacy dashboard)

The contract is that a request may serve a ready derivative or an existing legacy cached
preview and may enqueue missing work, but may never call Pillow, ExifTool, FFmpeg, hashing, or
a source read.

## External tools

ExifTool 13.59 and FFmpeg/ffprobe 8.1.1, installed outside the source and vault. Pillow,
ImageHash, and numpy come from the Python dependencies.

## Known defects

| ID | Sev | Summary |
|---|---|---|
| `F25` | High | Heartbeat does not consistently extend the job lease |
| `F54` | High | Derivative freshness can be accepted on size and mtime instead of re-verifying the persisted checksum |
| `F56` | High | Decoder and subprocess sandboxing, timeouts, memory/CPU/output bounds, and failure taxonomy are not uniformly enforced across ExifTool, Pillow, FFmpeg, and workers |
| `F47` | High | A stable "current derivative" URL is served `public, max-age=31536000, immutable`, so stale or replaced content persists |
| `F46` | Medium | Some GET and query flows enqueue materialization jobs, so a safe read mutates state |
| `F13` | High | Derivative, preview, and cache boundaries do not share one reparse-aware realpath authority |
| `F38` | High | Derivatives have no retention or capacity budget |

## Reuse notes

Worth lifting conceptually — this is the load-bearing idea of the whole architecture:

- Compute once in a job, persist, serve. It is what keeps the interface fast and the request
  path safe.
- Explicit analyzer version strings as part of the row, so invalidation is a version bump
  rather than a cache-clearing ritual.
- Two-phase derivatives: a cheap read-only preview before approval, a real one from the
  verified object after copy.
- Preferring a non-RAW group member for display, with RAW preview as fallback.
- Persisting quality primitives rather than computing them in views. Stacks and junk review
  both depend on this and neither has to re-decode.

Do not lift as-is:

- The freshness check. Size and mtime is `F54`; the checksum is already stored, so compare it.
- The subprocess handling. `F56` and `F55` (in [relationships.md](relationships.md)) are the
  same underlying problem: hostile or corrupt input meets a subprocess with no enforced bounds.
  Any decode of untrusted media needs a timeout, an output cap, and a memory limit.
- The immutable cache header on a mutable URL (`F47`). Either the URL includes the content
  checksum and can be immutable, or the header goes.
