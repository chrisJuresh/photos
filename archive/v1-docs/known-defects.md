# Known defects in v1

83 findings recorded on 2026-07-22 against snapshot `d49e621`: **19 critical, 49 high, 14
medium, 1 low**. Plus 12 confirmed strengths.

This is a per-feature index. The authoritative register with evidence lines and action IDs is
`v1/docs/FINDINGS_REGISTER.md`; the ranked action list is
`v1/docs/ACTION_PRIORITY_MATRIX.md` (58 actions, ranked overall and by safety, ease of use,
reliability, security and privacy, scalability, and maintainability).

Severity meanings, as the register defines them:

- **Critical** — live use must remain blocked
- **High** — required before a supported release
- **Medium** — material correctness, usability, scale, or maintenance work
- **Low** — limited current impact

## The 19 critical findings

Read this list before deciding to reuse anything.

| ID | Area | Summary |
|---|---|---|
| `F01` | Storage | Writer lock creates an empty file then writes ownership; a contender can admit a second writer |
| `F02` | Storage | Stale-owner logic records a hostname but checks PID liveness locally; shared storage can clear a live foreign lock |
| `F03` | API | Review API mutations open writable transactions without joining the CLI writer lock |
| `F04` | Migrations | Migration cannot prove all API and worker writers are quiescent |
| `F05` | Storage | Legacy import trusts a database-derived object path with no containment proof |
| `F06` | Storage | Hard-link publication can leave a writable `.partial` alias on the same inode as the final name |
| `F08` | Storage | `analyze` and `validate` can read source without the access-time guard |
| `F10` | CLI | The embedded worker cannot carry the access-time acknowledgement, so the live import path blocks |
| `F23` | Jobs | Stage 6 jobs can remain `running` forever after process death |
| `F24` | Jobs | Stale-job recovery lives inside claim paths while the dispatcher searches queued work |
| `F28` | Jobs | `preprocess --backfill` starts a worker with every job kind, so it can publish canonical media |
| `F29` | Jobs | Backfill inventory can miss a concurrently added asset sorting before the cursor |
| `F30` | Jobs | Backfill attempts do not increment on every retry, so failures can loop unbounded |
| `F31` | Import | Successful copy does not transactionally enqueue downstream work |
| `F32` | Import | Projection generations are not reliably invalidated when new assets arrive |
| `F39` | Backup | A same-disk migration backup is treated as recovery evidence; no proven remote backup and restore |
| `F40` | Backup | `rebuild-index` cannot restore schema-12 review state |
| `F58` | UI | Confirmation Booleans can remain checked when their batch, entity, profile, or selection changes |
| `F59` | UI | Generic Library multi-reject bypasses the favourite and large-selection safeguards |

## Where the findings cluster

| Area | Findings | Critical | Doc |
|---|---|---|---|
| Safety, storage, persistence | `F01`–`F22` | 6 | [storage-and-identity.md](storage-and-identity.md) |
| Jobs, import, backfill, recovery | `F23`–`F38` | 8 | [jobs-and-workers.md](jobs-and-workers.md), [import-pipeline.md](import-pipeline.md) |
| Backup, restore, audit | `F39`–`F44` | 2 | see below |
| HTTP and API security | `F45`–`F53` | 1 | [review-api.md](review-api.md), [legacy-dashboard.md](legacy-dashboard.md) |
| Media analysis and prepared-data trust | `F54`–`F57` | 0 | [preprocessing.md](preprocessing.md), [relationships.md](relationships.md), [stacks.md](stacks.md) |
| Frontend decision safety and usability | `F58`–`F72` | 2 | [review-ui.md](review-ui.md), [library.md](library.md), [junk-and-bulk-reject.md](junk-and-bulk-reject.md) |
| Scale, packaging, test, process | `F73`–`F83` | 0 | [testing.md](testing.md) |

The shape is worth reading. Every critical finding is in storage, concurrency, job recovery, the
import handoff, backup, or bulk-action confirmation. None is in the product logic — the library,
the projections, the stacking, the junk explanations are all *correct as designed* and broken
only in their plumbing.

## Backup and restore

No feature doc owns this because `v1` never built it as a feature. It matters enough to state
here.

| ID | Sev | Summary |
|---|---|---|
| `F39` | Critical | Same-disk migration backup treated too much like recovery evidence; no proven application-consistent encrypted remote backup and restore |
| `F40` | Critical | `rebuild-index` reconstructs only a reduced asset and search index; cannot restore schema-12 review state |
| `F41` | High | Asset sidecars omit approvals, jobs, preferences, saved views, user-state audit, and projection or profile state |
| `F42` | High | The old post-backfill checklist referenced a schema-2 backup and a 64-object sample; neither proved current recoverability |
| `F43` | High | Release audit does not prove object, path, filesystem, and capacity truth, projection lineage, current review state, or independent restore |
| `F44` | High | Runtime state and backups expose private paths, GPS, capture times, camera serials, decisions, and errors with no encryption, redaction, or retention governance |

What `v1` has instead of automated backup: `v1/docs/MANUAL_REMOTE_BACKUP.md` (22 KB), a manual
runbook, plus `v1/docs/BACKUP_RECORD_TEMPLATE.md` for recording each snapshot and restore drill.
The five things it says must be copied:

1. the original source tree;
2. a whole stopped-vault snapshot — `objects`, complete `state` including WAL and SHM, `records`,
   `logs`, `reports`;
3. the unpublished inbox;
4. derivatives selected by retention policy;
5. exact repository, build, and tool identity, plus an independent Git bundle.

Use timestamped non-destructive remote generations. Never mirror deletions. A backup is not
accepted until it has been restored to an isolated path and audited.

**GitHub protects the code history and nothing else.** Not the photos, not the objects, not the
SQLite state, not the inbox.

## The 12 confirmed strengths

Recorded as `P01`–`P12`. Not reasons to lift the hold; explicitly recorded as design assets to
preserve.

| ID | Strength |
|---|---|
| `P01` | Review UI, API, static assets, and port 8766 stay separate from the read-only dashboard on 8765; config rejects equal ports |
| `P02` | Dashboard accepts only `GET`/`HEAD`/`OPTIONS` and opens SQLite `mode=ro` plus `query_only=ON` |
| `P03` | Review API has localhost binding, TrustedHost, same-origin mutation checks, JSON validation, CSP, request and query budgets, typed envelopes, revisions, and idempotency foundations |
| `P04` | HTTP handlers serve existing derivatives, query persisted state, update metadata, or enqueue work; decoding, hashing, copying, ranking, and grouping stay in background and CLI code |
| `P05` | Exact identity uses three full hashes, distinct collision evidence, and byte comparison when a representative exists; visual similarity never silently deduplicates bytes |
| `P06` | Import has distinct review, approval, and execute-authorization concepts; canonical publication is intended to be no-overwrite |
| `P07` | Derivatives and materializations are separate from source and canonical objects and treated as regenerable |
| `P08` | Migrations are explicit with a copied-database test path, backup intent, transaction, and post-validation |
| `P09` | Tests use isolated synthetic temporary corpora with source and canonical hash plus filesystem metadata assertions |
| `P10` | Playwright screenshot, video, and trace capture disabled; smoke and accessibility runs used a temporary synthetic empty vault |
| `P11` | 84 Python tests, Ruff, 39 frontend tests, Svelte and TypeScript checks, one smoke test, one accessibility test all passed |
| `P12` | Runtime Python and production npm advisory scans found no known advisories at the reviewed lock state |

## How to use this when deciding to lift code

The pattern across all 83 findings:

- **Product design in `v1` is good.** The logical-photo entity, the three import gates, the
  explainable junk labels, the unedited-cover rule, the offline map, the honest unknown buckets
  — these are the expensive thinking and they are done.
- **Plumbing in `v1` is not safe.** Locks, publication, job recovery, the copy-to-projection
  handoff, and confirmation state each have at least one critical finding.

So: read the designed behaviour out of these docs and out of `v1/docs/FRONTEND_SPEC.md`, and be
sceptical of any `v1` module that owns a lock, a lease, a publication, a transaction boundary, or
a confirmation.

Before reusing a specific file, grep `v1/docs/FINDINGS_REGISTER.md` for its name — the register
records a primary evidence path for nearly every finding.
