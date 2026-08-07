# Import pipeline

**State in v1:** built through verified copy. The handoff from copy to everything downstream is
missing. Live use held.

**Depends on:** [storage-and-identity.md](storage-and-identity.md),
[database-schema.md](database-schema.md), [jobs-and-workers.md](jobs-and-workers.md).

## What it does

Takes a folder dropped into the inbox and turns it into published canonical objects, with a
human decision point before anything is copied. The inbox is never modified.

The designed flow, in order:

1. **Drop** — one immediate child folder of `G:\MediaVaultImports` becomes a batch. It must not
   change after discovery starts.
2. **Discover** (`inbox_scan`) — walk the batch, record immutable observations: hashes,
   classification, warnings, per-item and per-folder progress.
3. **Materialize a manifest** (`import_manifest_materialize`) — build a paged, reviewable view
   of the batch as an immutable generation.
4. **Decide** — set include/exclude per item. Decisions are revisioned and audited.
5. **Preflight the approval** (`import_approval_preflight`) — produce a capacity and approval
   summary bound to that exact batch revision.
6. **Approve** — approve a specific decision snapshot. Approval records which exact revision
   was approved, so a later change invalidates it rather than silently riding along.
7. **Authorize execution** — a separate action from approval.
8. **Copy** (`reviewed_copy`) — the worker revalidates the approved observation and publishes
   only a newly verified, no-overwrite canonical object. Inbox bytes are untouched.
9. **Report** — durable progress, events, errors, pause/resume/cancel boundaries.

Steps 1–8 are implemented. Step 9 is partly implemented. What is missing is what happens
*after* step 8: see the outbox gap below.

## The three-gate design

Review, approval, and execute authorization are deliberately distinct concepts, each bound to
a batch revision. Approving a manifest is not the same as authorizing a copy. The review
recorded this as a design strength (`P06`).

## Where the code is

| Concern | File |
|---|---|
| Inbox discovery, batch and item identity, observations, decisions | `v1/media_vault/review_imports.py` (62 KB) |
| Verified copy, publication, copy attempts, telemetry | `v1/media_vault/review_copy.py` (86 KB) |
| Stage 6 job handlers: `inbox_scan`, `import_manifest_materialize`, `import_approval_preflight`, `reviewed_execute` | `v1/media_vault/review_stage6.py` |
| Legacy import path (pre-review) | `v1/media_vault/vault_ops.py` |
| UI | `v1/review_ui/src/routes/imports/+page.svelte` (422 lines) |
| UI components | `ManifestReview.svelte` (208), `ImportApproval.svelte` (57), `ImportTelemetry.svelte` (45), `UnavailableMetrics.svelte` (12) |

Line references: `review_stage6.py:214` (job state), `review_copy.py:108` (claim struct),
`review_copy.py:294` and `:322` (claim and release), `review_copy.py:1252` (post-copy
completion — the outbox gap), `review_copy.py:1439` (publication).

## Data it owns

`import_batches`, `import_items`, `import_item_observations`, `import_item_decisions`,
`import_folder_progress`, `import_batch_approvals`, `import_approval_items`,
`import_item_copy_attempts`, `import_events`, `import_errors`, `import_progress_samples`,
`import_manifest_views`, `import_manifest_view_items`, `legacy_import_history`.

Job kinds: `inbox_scan`, `import_manifest_materialize`, `import_approval_preflight`,
`reviewed_execute`, `reviewed_copy`.

## HTTP surface

| Method | Path |
|---|---|
| GET | `/api/v1/imports` |
| GET | `/api/v1/imports/compare` |
| GET | `/api/v1/imports/{batch_id}` |
| GET | `/api/v1/imports/{batch_id}/manifest` |
| GET | `/api/v1/imports/{batch_id}/folders` |
| GET | `/api/v1/imports/{batch_id}/samples` |
| GET | `/api/v1/imports/{batch_id}/events` |
| GET | `/api/v1/imports/{batch_id}/errors` |
| GET | `/api/v1/imports/{batch_id}/items/{item_id}/preview` |
| POST | `/api/v1/imports/discover` |
| PUT | `/api/v1/imports/{batch_id}/decisions` |
| POST | `/api/v1/imports/{batch_id}/approval-preflight` |
| POST | `/api/v1/imports/{batch_id}/approve` |
| POST | `/api/v1/imports/{batch_id}/execute` |
| POST | `/api/v1/imports/{batch_id}/control` |

## The outbox gap

This is the single most consequential structural defect in `v1`.

A successful reviewed copy does **not** transactionally enqueue the downstream work
(`F31`, critical — `review_copy.py:1252`). Preprocessing, library catalog, organization
rollups, stacks, and junk results are not scheduled in the same commit that associates the
asset with its source. Related: catalog and later projection generations are not reliably
invalidated when new assets arrive (`F32`, critical).

The practical symptom is that a photo can be correctly published to the vault and never appear
in the library, with no error anywhere. The review's conclusion was that this needs a
transactional outbox — an `AssetVerified` record written in the same commit as the asset — plus
an explicit projection DAG with generation identities.

## Known defects

| ID | Sev | Summary |
|---|---|---|
| `F31` | Critical | Successful copy does not transactionally enqueue preprocessing or downstream projections |
| `F32` | Critical | Catalog and projection generations are not reliably invalidated when new assets arrive |
| `F23` | Critical | Stage 6 jobs can remain `running` forever after process death |
| `F06` | Critical | Publication can leave a writable `.partial` alias on the same inode as the final name |
| `F11` | High | Source and inbox identity checked in multiple steps rather than one revalidated no-follow handle |
| `F15` | High | Capacity trusts persisted "verified" rows without reconciling the filesystem |
| `F33` | High | Logical-photo entity IDs and user state have no persisted lineage policy for later RAW/JPEG merges or splits |
| `F34` | High | Active jobs can be duplicated by timestamp-derived IDs instead of deduplicated by subject and options |
| `F58` | Critical | Approval confirmation Booleans can stay checked when the batch they refer to changes |
| `F64` | High | Import polling issues repeated requests with no consistent abort, dedup, teardown, or latest-response-wins |

## Reuse notes

Worth lifting conceptually — this is the best-designed part of `v1`:

- Batch as one immediate child folder, immutable after discovery starts.
- Observations recorded once and revalidated at copy time rather than trusted.
- Three separate gates: review, approve, authorize execute.
- Approval bound to an exact batch revision.
- Manifest as an immutable paged generation, not a live query.
- Copy publishes only new objects and never touches inbox bytes.

Do not lift as-is:

- The post-copy completion path. It is the outbox gap (`F31`, `F32`).
- Stage 6 job handling. Each stage implements its own state machine (`F26`), and Stage 6 jobs
  in particular can hang as `running` forever (`F23`).
- The UI confirmation state. Checkboxes outliving their target is `F58`.
