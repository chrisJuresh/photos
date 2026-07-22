# Glossary

This glossary uses the terminology of the reviewed WIP. “Intended” terms do not imply the current safety hold has been lifted.

| Term | Meaning |
|---|---|
| Access-time (`atime`) policy | Filesystem policy controlling whether a read updates last-access metadata. The application refuses guarded source reads when safety is not established |
| Action ID | Durable identifier for a metadata mutation/bulk action, needed for audit and undo |
| Analyzer version | Versioned identity of the code/tool/policy that produced metadata, features, derivatives, or a projection |
| Approval | Immutable record that a specific import decision/observation revision was reviewed; separate from execute authorization |
| Asset | One distinct verified byte sequence and its content identity/evidence |
| Asset sidecar | JSON recovery record under `records`; useful but insufficient to reconstruct all authoritative review state |
| Authoritative state | Data that cannot be safely regenerated or guessed, primarily source/canonical bytes and complete SQLite review/history state |
| Backfill | Low-priority preparation of derivatives/materializations for an existing vault; current implementation is held and not isolated safely |
| Batch | One immediate child directory of the configured review inbox, recursively discovered as a review unit |
| BLAKE3 / SHA-256 / SHA-512 | Independent full-file digests used together for exact identity evidence |
| Byte comparison | Direct full-content comparison used to confirm an apparent exact match when a trusted representative is available |
| Canonical object | Verified content-addressed vault copy of one exact asset; must be append-only and immutable after publication |
| Canonical publication | Transition that makes a fully verified temporary output visible at its final object path without overwriting an existing path |
| Catalog | Prepared generation of stable logical-photo entities and selected display assets used by the Library |
| Certified derivative | Prepared derivative whose persisted input identity, analyzer, path, size/checksum/stat, and ready state meet the serving contract |
| Collision discriminator | Additional identity evidence used when matching primary hashes fail byte comparison; prevents silent consolidation |
| Command | Explicit intent to mutate application state or enqueue work; should be distinct from a read-only query |
| Conflict evidence | Preserved information/file resulting when an unexpected final path exists or verification disagrees; never overwrite or clean blindly |
| Content-addressed | Located/identified from content digests and size rather than the original filename |
| Cursor / keyset paging | Bounded pagination using the last stable sort key/ID instead of unbounded offsets |
| Derivative | Regenerable preview/detail/poster/analysis output stored separately from source and canonical objects |
| Disaster recovery | Ability to restore the whole application in a separate failure domain, including authoritative state and validated operating behaviour |
| Display asset | Verified member chosen to represent a logical photo, such as a JPEG companion for a RAW |
| Entity generation | Version of a prepared catalog/materialization; incomplete generations should remain invisible |
| Event / audit event | Append-oriented record of a state transition or user action with before/after and identity evidence |
| Exact duplicate | Same byte count and all required full-content digests, plus byte comparison where available; the only automatic object-consolidation class |
| Execute authorization | Separate operator decision allowing a previously approved exact import snapshot to publish verified canonical objects |
| Favourite / rejected / rating | Mutable SQLite user metadata on a logical entity; never a media-file operation |
| Foreign-key check | SQLite validation that references obey declared relationships; complements but does not replace integrity/semantic audits |
| Generation pointer | Small authoritative value selecting the last fully validated prepared generation |
| Hard link | Two directory names for the same filesystem inode/file record. A writable temporary alias can therefore mutate canonical bytes |
| Heartbeat | Periodic evidence that a lease-owning worker is alive and making or safely waiting for progress |
| Idempotency key | Caller-supplied mutation identity bound to exact request content so a retry cannot apply the action twice or to different intent |
| Immutable inventory | Persisted finite subject list bound to a backfill/audit generation; avoids missing concurrent inserts around a moving cursor |
| Inbox | Separate staging tree for reviewed imports; it is input and must not be moved/deleted/rewritten by review |
| Integrity check | SQLite internal structural check; does not prove external objects, paths, projections, or business semantics are correct |
| Job | Persisted unit of background work with kind, subject, state, priority, attempt, lease, progress, and error evidence |
| Job attempt | One bounded claim/execution of a job; retained even when a later retry succeeds |
| Job DAG | Explicit directed dependency graph connecting import, preprocessing, and prepared projections |
| Junk signal/profile | Versioned, explainable metadata-only recommendation evidence and user-selected threshold/agreement policy; never deletion |
| Lease | Time-bounded ownership of a running job; expiration must be handled by an independent sweeper |
| Legacy dashboard | Separate port-8765 GET-only application for inspecting persisted vault evidence |
| Lineage | Persisted relationship explaining how identities/generations derive, merge, split, or replace one another |
| Live vault writer | Any process/API/worker capable of changing the authoritative manifest or publishing vault output, not merely a process holding the old lock file |
| Logical photo | Prepared entity representing one standalone asset or a confidently grouped RAW/JPEG set while retaining every distinct asset |
| Maintenance barrier | Universal protocol that refuses/drains all writers and grants exclusive migration/backup/restore authority |
| Manifest | Authoritative SQLite database holding source, asset, destination, import, job, review, profile, projection, and audit state |
| Materialization / projection | Rebuildable persisted view or rollup prepared outside an HTTP request for bounded UI queries |
| Metadata-only action | Change to application state that leaves source/canonical/derivative bytes untouched |
| No-follow | Filesystem open/resolution policy that refuses symbolic links/reparse traversal according to the authority contract |
| No-overwrite / no-replace | Publication operation that fails rather than replacing any existing destination name |
| Observation | Immutable snapshot of a discovered input's path/stat/classification/hash/match evidence at a generation |
| Outbox | Event row committed in the same database transaction as authoritative state, later consumed idempotently to schedule dependent jobs |
| Partial | Unpublished temporary output. In this WIP it may be a hard-link alias after an interrupted publication; never clean by suffix alone |
| Prepared view | Persisted bounded ordering/rollup used by UI instead of performing expensive media/database work during the request |
| Projection freshness | Proof that a prepared result represents the current authoritative input/catalog/application generation |
| Query | Side-effect-free read of persisted state; should use a provably read-only connection and never enqueue work |
| RAW/JPEG group | Conservative, evidence-based relationship between a RAW anchor and companion JPEG(s); never exact-byte deduplication |
| Recovery point objective (RPO) | Maximum acceptable amount of authoritative change lost between backups |
| Recovery time objective (RTO) | Target time to restore and verify service after failure |
| Regenerable | Can be reproduced from preserved authoritative inputs plus exact code/tool/analyzer identity; not necessarily cheap or disposable without policy |
| Reparse point | Windows filesystem indirection including junctions/some links; relevant to containment and traversal safety |
| Restore drill | Actual restore to a separate location followed by integrity, semantic, and application verification |
| Review application | Separate Svelte UI and local API on port 8766 with metadata mutations and background-job orchestration |
| Revision | Monotonic version of a mutable row/subject used for optimistic conflict and exact-target confirmation |
| Safe boundary | Documented point where pause/cancel/shutdown leaves authoritative state valid and restart behaviour deterministic |
| Semantic audit | Read-only check of database, object/path/filesystem truth, capacity, lineage, generations, and user/application behaviour—not just SQLite integrity |
| Shadow generation | Prepared output built invisibly in bounded work, validated completely, then exposed by an atomic current pointer |
| Sidecar | Metadata file stored with vault records/exports, never next to source media |
| Similarity | Non-exact relationship such as perceptual/decoded/temporal/equipment evidence; never sufficient for automatic byte consolidation |
| Snapshot | Point-in-time consistent backup generation; a folder copy made across active writes is not necessarily a snapshot |
| Source | Existing original media tree; permanently immutable and outside the vault |
| Source revision/version | Append-oriented evidence that a path's observed bytes/stat/classification changed over time |
| Stack | Prepared group of visually/temporally related logical photos with explainable ordering/cover; no media is consolidated or deleted |
| Sweeper | Independent process/routine that finds expired running jobs and applies their declared recovery policy even if no queued jobs exist |
| Transactional claim | Atomic state transition that proves exactly which worker/attempt owns a job lease |
| Transactional outbox | See Outbox; prevents authoritative commit from losing the downstream scheduling handoff |
| TrustedHost | HTTP hostname validation that reduces DNS-rebinding/host-header exposure on a local service |
| Undo | Compensating metadata action tied to a durable prior action ID; not deletion/restoration of media |
| Vault doctor | Proposed strictly read-only diagnostic that validates configuration/state without media access by default |
| WAL / SHM | SQLite write-ahead log and shared-memory files that must be handled consistently with the main database during stopped-copy backup |
| WIP | Work in progress; preserved for review and development, not authorized for live use |
| Writer | Any code path capable of changing SQLite, publishing canonical/derivative/evidence files, or changing operational state |

For current definitions of done, use [ACTION_PRIORITY_MATRIX.md](ACTION_PRIORITY_MATRIX.md); schema-specific fields remain in [../SCHEMA.md](../SCHEMA.md).
