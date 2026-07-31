# Jobs and workers

**State in v1:** built and used by every stage. Recovery, leasing, and supervision are
incomplete. Live use held.

**Depends on:** [database-schema.md](database-schema.md).

## What it does

One table-backed job ledger carries all background work, so HTTP requests can enqueue instead
of doing. Jobs are claimed with a token, heartbeat a lease, retry a bounded number of times,
and record every attempt.

The intended lifecycle: `queued` → claimed (`running`, with a claim token, worker identity, and
a lease expiry) → heartbeat extends the lease → `completed` or `failed`, with pause and cancel
at safe boundaries.

## The 12 job kinds

| Kind | Owner | Purpose |
|---|---|---|
| `inbox_scan` | Stage 6 | Discover a batch in the inbox |
| `import_manifest_materialize` | Stage 6 | Build the reviewable manifest generation |
| `import_approval_preflight` | Stage 6 | Produce the capacity and approval summary |
| `reviewed_execute` | Stage 6 | Fan out an authorized batch into copy jobs |
| `reviewed_copy` | Copy | Verify and publish one canonical object |
| `review_preview` | Preprocess | Prepare an inbox item preview |
| `asset_preprocess` | Preprocess | Derivatives, extended metadata, features for one asset |
| `materialized_view` | Stage 7 | Build the library catalog generation |
| `organization_rollups_materialize` | Stage 8 | Build calendar, folder, equipment, map projections |
| `stack_profile_materialize` | Stage 9 | Build stacks for a profile |
| `junk_profile_materialize` | Stage 10 | Build junk results for a profile |
| `vault_backfill` | Stage 11 | Low-priority coordinator for release preparation |

`SUPPORTED_WORKER_JOB_KINDS` at `review_runtime.py:30` is the union of all of them.
`PREPROCESS_JOB_KINDS` at `review_runtime.py:43` is just `review_preview` and
`asset_preprocess`.

## Where the code is

| Concern | File |
|---|---|
| Dispatcher loop, job-kind routing, worker entry | `v1/media_vault/review_runtime.py` |
| Preprocess claim, heartbeat, lease, retry | `v1/media_vault/preprocess.py` |
| Copy claim and lease | `v1/media_vault/review_copy.py` |
| Backfill coordinator, inventory, audit | `v1/media_vault/review_backfill.py` |
| Per-stage handlers and per-stage recovery functions | `review_stage6.py`, `review_library.py`, `review_organization.py`, `review_stacks.py`, `review_junk.py` |
| Embedded worker thread inside the API | `v1/media_vault/review_api.py:4695` |
| Job status endpoint | `GET /api/v1/jobs/{job_id}` |
| Backfill endpoints | `GET /api/v1/backfill`, `POST /api/v1/backfill/control` |

Line references: `review_runtime.py:55` (dispatcher search), `review_runtime.py:78` (idle
poll loop), `review_runtime.py:222` (generic worker with all kinds),
`preprocess.py:83` (claim struct), `preprocess.py:707`–`:728` (claim), `preprocess.py:764`–`:770`
(claim-token validation), `preprocess.py:1314` and `:1336` (release on failure),
`review_backfill.py:244` (attempt accounting), `review_backfill.py:310` (keyset inventory),
`review_backfill.py:335` (post-copy chain), `review_backfill.py:529` (release audit).

## Data it owns

`background_jobs` — priorities, bounded attempts, claim tokens, worker identity, leases,
control state, retry timing, current run, update evidence.

`background_job_attempts` — append-only; every claim, heartbeat, completion, and interruption
is preserved rather than overwriting retry history.

## Configured limits

From `config.py:16`: `total_workers: 2`, `media_io_workers: 1`, `analysis_workers: 1`,
`backfill_batch_size: 32`. These are validated but the runtime is a single sequential loop and
does not enforce them as resource pools (`F36`).

## Known defects

The second-largest cluster of critical findings after storage.

| ID | Sev | Summary |
|---|---|---|
| `F23` | Critical | Stage 6 jobs can remain `running` forever after process death |
| `F24` | Critical | Stale-job recovery is hidden inside claim paths while the dispatcher searches queued work, so a lone expired running job may never be found |
| `F28` | Critical | `preprocess --backfill` starts the generic worker with every kind, so it can publish canonical media |
| `F29` | Critical | Backfill's live keyset inventory can miss a concurrently added asset whose ID sorts before the cursor |
| `F30` | Critical | Backfill attempt accounting does not increment on every retry, so some failures loop without a finite cap |
| `F31` | Critical | Successful copy does not transactionally enqueue downstream work |
| `F32` | Critical | Projection generations are not reliably invalidated when new assets arrive |
| `F25` | High | Preprocessing heartbeat does not consistently extend the lease, permitting false expiry or ambiguous ownership |
| `F26` | High | Every job kind implements its own transitions, retries, attempts, recovery, progress, pause/cancel, and errors, so semantics diverge per stage |
| `F27` | High | The embedded worker is a daemon thread; shutdown joins for five seconds and cannot deliver a cooperative stop token into every runner |
| `F34` | High | Jobs can be duplicated by timestamp-derived IDs instead of deduplicated by subject and effective options |
| `F35` | High | An idempotent replay can return an older generation and regress client state; idempotency storage has no retention policy |
| `F36` | High | Worker limits are configured but the runtime is a single sequential loop with no resource pools |
| `F38` | High | No single retention or capacity budget across attempts, events, samples, jobs, idempotency rows, projections, derivatives, backups, conflicts |
| `F37` | Medium | Idle polling opens, queries, and closes on a fixed interval with no measured wakeup or backoff |
| `F72` | High | UI readiness messaging proves API response only, not worker availability, lease health, or queue progress |

## Reuse notes

Worth lifting conceptually:

- One ledger for all job kinds rather than a queue per feature. Stage 11 reusing
  `background_jobs` with a low-priority kind instead of adding a second queue was the right
  call.
- Append-only attempt history.
- Claim tokens validated on every progress write, so a stale worker cannot mutate a job that
  has been reclaimed (`preprocess.py:764`).
- Priority, lease expiry, and control state as columns rather than as separate mechanisms.

Do not lift as-is:

- The dispatcher. `F24` is structural: recovery lives inside claim paths while the dispatcher
  only looks for queued work, so an expired `running` job with no sibling queued work is
  invisible. An independent sweeper for expired running jobs is what the review concluded is
  needed.
- Per-stage job handling. Twelve kinds with their own state machines is `F26`. One
  schema-constrained transition model with per-kind handlers is the shape the review
  recommended.
- The embedded worker thread in the API (`F27`). A separate supervised process with
  cooperative shutdown avoids both the join timeout and the access-time waiver problem
  (`F10`).
- The backfill coordinator. Three independent critical findings (`F28`, `F29`, `F30`).
