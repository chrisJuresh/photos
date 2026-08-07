# Storage and identity

**State in v1:** built and substantially tested; live mutation held because storage, path, and
writer-lock defects cross every flow that touches it.

**Depends on:** nothing. Everything else depends on this.

## What it does

Turns a read-only source tree into a content-addressed object store, and decides when two
files are the same file.

- Discovers and classifies candidate media in a source or inbox tree.
- Hashes every candidate with SHA-256, SHA-512, and BLAKE3 while reading it once in full.
- Publishes each distinct byte sequence once, under a format-neutral content-derived name.
- Records original paths, formats, and filesystem metadata as data, not as directory layout.
- Holds a single-writer lock for the duration of any mutating run.
- Calculates capacity before a copy and validates objects after one.

`G:\MediaVault` is a machine-oriented object store, not a human folder hierarchy. There is no
"my pictures / 2019 / holiday" structure on disk; that is a projection built from metadata.

## Storage areas and their contracts

| Area | Default | Contract |
|---|---|---|
| Original source | `G:\photos` | Immutable. Reads require a safe access-time policy. |
| Review inbox | `G:\MediaVaultImports` | Immutable staging. Import never moves or deletes from it. |
| Canonical objects | `<vault>\objects` | Content-addressed published bytes. Existing objects never change. |
| SQLite catalog | `<vault>\state\manifest.sqlite3` + WAL/SHM | Irreplaceable mutable state. Copy consistently. |
| Per-asset sidecars | `<vault>\records` | Recovery evidence. Incomplete — see below. |
| Derivatives | `<vault>\derivatives` | Regenerable. Still private and still valuable. |
| Reports and logs | `<vault>\reports`, `<vault>\logs` | Run, safety, error, and audit evidence. |
| Exports | `<vault>\exports` | JSONL and CSV snapshots, regenerable from a healthy database. |
| Migration and in-flight | `<vault>\state\backups`, `state\tmp`, conflicts | Rollback evidence. Not a remote backup. |

`config.py:99` enforces that inbox, derivative root, and canonical objects are mutually
disjoint. `config.py:112` additionally proves a source root is disjoint from all three.

## Exact identity

A candidate is assigned all three hashes in a single full read. Automatic consolidation into
an existing object requires:

1. identical size, **and**
2. all three full-file hashes matching, **and**
3. a byte-for-byte comparison whenever a trusted representative is available.

A suspected multi-hash collision is preserved as distinct evidence and never silently merged.
Every distinct byte sequence remains its own asset and object unless exact equality is proved.

This is the one part of `v1` the review flagged as a design strength to preserve (`P05`).

## Where the code is

| Concern | File |
|---|---|
| Writer lock, path helpers, source access-time guard, root identity | `v1/media_vault/core.py` |
| Storage roots, ports, worker limits, request budgets, analyzer versions | `v1/media_vault/config.py` |
| Source discovery, classification, hashing | `v1/media_vault/scanner.py` |
| Capacity, publication, validation, sidecars, recovery index | `v1/media_vault/vault_ops.py` |
| Progress accounting for long runs | `v1/media_vault/progress.py` |

Key line references from the audit: `core.py:76` (root identity), `core.py:232` (atime
guard), `core.py:342` (`VaultRunLock`), `vault_ops.py:36` (capacity), `vault_ops.py:129`
(sidecars), `vault_ops.py:364` (object path trust), `vault_ops.py:412` (publication),
`vault_ops.py:470` (validation source fallback), `vault_ops.py:543` (`rebuild-index`).

## Data it owns

`source_roots`, `source_versions`, `source_files`, `assets`, `asset_sources`, `destinations`,
`exact_groups`, `runs`, `scan_summaries`, `warnings`, `schema_info`, `schema_migrations`.

See [database-schema.md](database-schema.md).

## Known defects

The heaviest concentration of critical findings in the project.

| ID | Sev | Summary |
|---|---|---|
| `F01` | Critical | Writer lock creates an empty file then writes ownership; a contender can admit a second writer |
| `F02` | Critical | Stale-owner logic records a hostname but checks PID liveness locally; shared storage can clear a live foreign lock |
| `F05` | Critical | Legacy import trusts a database-derived `object_relpath` with no containment proof under `objects` |
| `F06` | Critical | Hard-link publication can leave a writable `.partial` alias on the same inode as the final name |
| `F08` | Critical | `analyze` and `validate` can read source files without the access-time guard |
| `F07` | High | No tested OS-level read-only or immutable permission contract on published objects |
| `F09` | High | The access-time guard is Windows-only; elsewhere it is informational |
| `F11` | High | Source and inbox identity checked in multiple steps, not one revalidated no-follow handle |
| `F12` | High | Windows root identity fragments by case, spelling, alias, or mount representation |
| `F13` | High | Derivative, preview, cache, and OS-open boundaries lack one reparse-aware realpath authority |
| `F14` | High | Derivative disjointness is not proved against every topology at every entry point |
| `F15` | High | Capacity trusts persisted "verified" rows without reconciling filesystem existence |
| `F16` | High | Conflict preservation uses a rename with platform-dependent overwrite semantics |
| `F17` | High | Directory durability, ACL persistence, and filesystem behaviour not proved by power-loss tests |
| `F22` | Medium | Recovery-index creation writes directly to its output using large in-memory collections |

## Reuse notes

Sound as designed and worth lifting conceptually:

- The three-hash plus byte-comparison identity rule.
- The separation of storage areas and the disjointness checks in `config.py`.
- Storing original paths and formats as metadata rather than as directory structure.

Do not lift as-is:

- `VaultRunLock` in `core.py`. Two independent critical findings; the create-then-populate
  sequence is not a lock.
- The hard-link publication path in `vault_ops.py` / `review_copy.py`. The review's position
  (`ADR-002` in `v1/docs/ARCHITECTURE_DECISIONS.md`) is that the correct Windows/NTFS
  no-overwrite primitive is an open decision, not a settled one.
- `rebuild-index`. It reconstructs a reduced asset and search index only and cannot restore
  schema-12 review state (`F40`, critical). The sidecars it reads omit approvals, jobs,
  preferences, saved views, user-state audit, and projection state (`F41`). Treat both as
  diagnostic aids, never as recovery.
