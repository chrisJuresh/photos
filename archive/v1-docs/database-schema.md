# Database and migrations

**State in v1:** built. Schema version 12, 65 tables, one SQLite file. Migration on a live
vault is held.

**Depends on:** [storage-and-identity.md](storage-and-identity.md).

## What it does

One SQLite database at `<vault>\state\manifest.sqlite3` (plus WAL and SHM) is the sole
authority for source history, assets, imports, jobs, review state, profiles, and every
materialized projection. It is the irreplaceable part of the vault — objects can in principle
be re-hashed, but decisions, approvals, and lineage exist only here.

Schema versions are explicit and sequential. `db.py:13` declares base version 2 and current
version 12; every step from 3 to 12 must be present, and `db.py:1450` refuses a database whose
recorded migration list has gaps.

## Table groups by schema version

| Version | Purpose | Tables |
|---|---|---|
| Core (2) | Source history, assets, objects, identity, runs | `source_roots`, `source_versions`, `source_files`, `assets`, `asset_sources`, `destinations`, `exact_groups`, `raw_jpeg_groups`, `raw_jpeg_members`, `relationships`, `runs`, `scan_summaries`, `warnings`, `schema_info`, `schema_migrations` |
| 4 | Reviewed inbox and the job ledger | `import_batches`, `import_items`, `import_item_observations`, `import_item_decisions`, `import_folder_progress`, `background_jobs`, `background_job_attempts` |
| 5 | Reviewed copy, approval, telemetry | `import_batch_approvals`, `import_approval_items`, `import_item_copy_attempts`, `import_events`, `import_errors`, `import_progress_samples`, `legacy_import_history` |
| 6 | Preprocessing outputs | `derivatives`, `asset_extended_metadata`, `asset_features` |
| 7 | Review application state | `review_application_state`, `user_preferences`, `saved_views`, `api_idempotency_records` |
| 8 | Import-interface materializations | `import_manifest_views`, `import_manifest_view_items` |
| 9 | Logical photo library | `photo_entities`, `photo_entity_members`, `photo_user_state`, `photo_user_state_events`, `materialized_views`, `materialized_view_items`, `facet_rollups` |
| 10 | Alternate organization projections | `calendar_buckets`, `calendar_bucket_items`, `folder_hierarchy_nodes`, `folder_hierarchy_items`, `equipment_rollups`, `equipment_rollup_items`, `map_clusters`, `map_cluster_items`, `map_entity_locations`, `map_unknown_location_items` |
| 11 | Similarity stacks | `stacks`, `stack_members`, `stack_profiles`, `stack_candidate_edges`, `stack_feature_inputs`, `stack_cover_events` |
| 12 | Explainable junk review | `junk_profiles`, `junk_signals`, `junk_effective_results`, `junk_feedback` |

Stage 11 (release backfill) added no tables. It reuses `background_jobs` with a low-priority
`vault_backfill` job kind rather than introducing a second queue.

`v1/SCHEMA.md` is the 33 KB column-by-column contract, including status value enumerations and
the sidecar and JSONL export formats.

## Notable shapes worth knowing

- **`background_jobs` grew into the universal ledger.** It starts at version 4 as the Stage 2
  discovery queue and is completed at version 5 with priorities, bounded attempts, claim
  tokens, worker identity, leases, control state, retry timing, current run, and update
  evidence. Version 6 adds indexed `review_preview` and `asset_preprocess` work without
  mixing their claims or controls with reviewed-copy jobs. See
  [jobs-and-workers.md](jobs-and-workers.md).
- **`background_job_attempts` is append-only.** Every claim, heartbeat, completion, and
  interruption is preserved rather than overwriting retry history.
- **`materialized_views` / `materialized_view_items` is a generation pattern.** Projections
  are versioned as immutable generations with a pointer to the current one, so a rebuild does
  not mutate what a reader is paging through.
- **`photo_user_state` plus `photo_user_state_events`** separates current state from an audit
  trail, which is what makes reject reversible.

## Where the code is

| Concern | File |
|---|---|
| Schema definition, connection policy, all data access | `v1/media_vault/db.py` (78 KB) |
| Backup, migrate, validate | `v1/media_vault/migrations.py` |
| The written contract | `v1/SCHEMA.md` |

Line references: `db.py:13` (version constants), `db.py:506` and `db.py:556` (claim token
columns), `db.py:1450` (migration list validation), `db.py:1493` (migration entry point),
`db.py:1557` (connection used by nominal readers), `migrations.py:72` (capacity budget),
`migrations.py:92` (backup publication), `migrations.py:106` (backup checksum),
`migrations.py:271` (quiescence check).

## Migration contract as built

1. Refuse to run while a live writer exists.
2. Back up the database, checksum the backup.
3. Migrate inside a transaction.
4. Validate after.
5. Keep rollback evidence under `<vault>\state\backups`.

Migrations are tested against a copied database. The review recorded this as a positive
control (`P08`) — the shape is right. The defects are in what the steps actually prove.

## Known defects

| ID | Sev | Summary |
|---|---|---|
| `F04` | Critical | Migration cannot prove all API and worker writers are quiescent |
| `F18` | High | Capacity budgeting does not model backup, WAL, migration growth, rollback, and free-space margin together |
| `F19` | High | Backup checksum is computed, but post-publication durability and pre-restore re-verification are not a complete contract |
| `F20` | High | Backup publication uses the same hard-link style implicated in the mutable-alias hazard (`F06`) |
| `F21` | High | `status`, release audit, and other nominal readers use the general writable connection, which can initialize or switch connection state |
| `F38` | High | Logs, attempts, events, samples, jobs, idempotency rows, projections, derivatives, backups, and conflicts share no retention or capacity budget |
| `F53` | High | Schema, migrations, connection policy, and broad data access are concentrated in one 1,500+ line module with limited transition and value constraints |
| `F44` | High | Private paths, GPS, capture times, camera serials, decisions, and errors are stored with no encryption, redaction, or retention governance |
| `F73` | Medium | Several paths use `fetchall`, full sorting, or large transactions that will not stay bounded at full-vault scale |

Related and important: the same-disk migration backup is rollback evidence, not disaster
recovery (`F39`, critical), and `rebuild-index` cannot restore schema-12 review state
(`F40`, critical).

## Reuse notes

Worth lifting conceptually:

- Sequential explicit migrations with no gaps, validated after applying.
- The generation-plus-pointer pattern for projections.
- Append-only attempt history.
- Current-state plus event-log split for user decisions.

Worth reconsidering:

- 65 tables for a single-user photo vault is the shape of the previous scope, not a
  requirement. Roughly 30 of them are materialized projections that exist to keep media work
  out of the request path; they only need to exist if the same projections do.
- `db.py` as a single module holding schema, connections, and every query is finding `F53`.
- Read paths should use a genuinely read-only connection, as the legacy dashboard already
  does (`P02`), rather than the general writable one (`F21`).
