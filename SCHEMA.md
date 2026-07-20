# Manifest and sidecar schema

Schema version 3 is defined authoritatively by `media_vault/db.py`. Version 2 remains supported by the legacy commands and read-only dashboard without implicit migration. Version 3 adds only the ordered migration audit table required by the frontend foundation; later feature tables are intentionally absent. SQLite is the transactional source of truth. `exports/manifest.jsonl` is the authoritative portable snapshot at its generation time; `exports/assets.csv` is convenience-only. Per-asset JSON records under `records/assets/<two>/<two>/<asset-id>.json` are independently useful recovery sidecars and are never placed beside source media.

All path columns use SQLite's binary text collation. JSON is UTF-8 with `ensure_ascii=false`. This preserves enumerated case and Unicode text rather than applying Windows filename normalization. A source path is stored as both an absolute `path_text` and the exact relative string produced for its source root.

## Stable identifiers

Identifiers have a type/version prefix and SHA-256 digest over a canonical UTF-8 JSON tuple:

- `sr1_…`: source root path identity
- `sf1_…`: source root plus exact source filepath identity
- `a1_…`: size, SHA-256, BLAKE3, and SHA-512 content identity
- `x1_…`: exact-content group identity
- `dst1_…`: asset plus destination path identity
- `rel1_…`: ordered asset pair, relationship type, and method identity
- `rjg1_…`: RAW/JPEG group anchored by a RAW asset ID

If an otherwise impossible primary-hash collision fails byte comparison, `a1c_…`/`x1c_…` include a SHA3-512 discriminator. Asset IDs therefore remain independent of source filenames and survive source moves.

## Core tables

`schema_info` stores `schema_version`. `schema_migrations` exists from version 3 onward and records each ordered version, migration name, UTC application time, and tool version. Opening an existing manifest never executes migrations or rewrites this value.

`runs` is an audit ledger with command, status, UTC start/completion, source/vault roots, host/runtime identity, tool version, exact arguments, and structured summary.

`source_roots` stores each scanned root and the last traversal known to have completed.

`scan_summaries` stores the current media file count and byte total for each completed traversal. Capacity reporting uses the summary referenced by each source root rather than rescanning the wide path table. This table was added in schema version 2; a legacy scan without a row can still make an exact destination-space decision from `exact_groups`, but its source upper-bound and deduplication-savings display fields are null.

`source_files` stores the current observation of an exact path: first/last discovery times, presence, stat snapshot (size, mtime/ctime nanoseconds, device and file IDs), current source-version ID, classification, linked content asset, and current error. Missing paths are marked `present=0` only after a complete traversal; rows are never deleted automatically.

`source_versions` is append-only observation history. It stores the run/time and stat snapshot, exact extension text, discovery status/basis, media kind, MIME/format, mismatch flag, asset link, hash/metadata status, raw ExifTool/FFprobe JSON, normalized metadata JSON, warnings, and errors. Superseded observations retain their asset/path evidence.

`exact_groups` stores size and the three full-content hashes, collision discriminator, verification method, and creation time.

`assets` stores stable content identity; all hashes and algorithm-version JSON; media/MIME/format/extension; decoded-pixel, perceptual, sampled-video, and optional decoded-stream hashes; dimensions/duration; camera, lens, capture-time, orientation, and codec fields; raw metadata; deterministic object-relative path and verification state; run/timestamps; and warnings.

`asset_sources` is the many-to-many audited link from assets to historical source versions. It names the exact verification method and whether that version initially created the asset.

`destinations` stores every corresponding destination path, copy source version, status, verified size/hashes, validation run, timestamps, and errors. Schema version 2 normally has one canonical object path per asset but does not assume that forever.

`relationships` stores ordered non-exact asset pairs. Every row includes a relationship type, versioned method, human confidence label, numeric score, structured evidence JSON, and creation run/time. These rows never drive object consolidation. A relationship is authoritative only when its `created_run_id` refers to a completed run; interrupted-run rows are retained for audit and labeled non-authoritative by the API, dashboard, and asset exports. A successful rerun updates the origin run/time for the same relationship identity.

`raw_jpeg_groups` stores the stable RAW anchor, aggregate confidence, evidence, and creation run/time. `raw_jpeg_members` stores every RAW/JPEG member, role, member-level confidence/evidence, ambiguity flag, and all alternative group IDs. Group authority follows the same completed-origin-run rule.

`warnings` stores structured severity/code/message/evidence with optional source-file and asset links.

## Sidecar asset record

Each sidecar has:

- `record_schema` and `record_schema_version`;
- generation timestamp and stable `asset_id`;
- current canonical destination filepath;
- the complete `assets` row;
- all linked source locations and historical versions, including exact-verification methods;
- all destination rows;
- all near/non-exact relationships in either direction;
- all RAW/JPEG memberships, ambiguity, and alternatives;
- linked warnings.

The sidecar is atomically replaced when state changes. It is metadata about the vault object, not a modification of the media bytes.

## JSONL export

Line 1 is `immutable-media-vault.manifest-header` and declares record, SQLite schema, generation time, and run ID. Every subsequent line is one complete sidecar-shaped asset record ordered by asset ID. Programs should reject unsupported schema versions rather than guessing.

## Explicit migration contract

`media-vault migrate --vault ...` is the only schema-upgrade entry point. It holds `state/active-writer.lock`, refuses a live writer, validates the input manifest, verifies available backup space, creates a unique SQLite backup under `state/backups`, validates that backup, applies each registered migration transactionally, and checks the resulting version, foreign keys, and integrity. A repeated run against the current schema is a validated no-op. Transaction/interruption failures roll back; a post-commit validation failure restores the verified backup. Migration code operates only on state metadata and never reads or writes source media or canonical objects.

## Status values

Important source `discovery_status` values are `pending`, `media`, and `non_media`. `hash_status` includes `verified`, `not_media`, and `error`. Destination/object status includes `missing`, `verified`, `source_unavailable`, `conflict`, `error`, and `mismatch`.

Only `verified` means a destination completed the full copy-verification contract. A source metadata failure does not prevent `hash_status=verified` or copying when extension/signature evidence retains it as media.
