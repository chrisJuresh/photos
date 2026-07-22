# Implementation handoff

This is the recommended starting point for the next coding phase. The current branch remains a documentation/preservation branch; do not begin by resuming live backfill or polishing the UI.

## Objective

Turn the WIP's intended safety properties into four universal executable primitives:

1. one writer/maintenance barrier;
2. one typed path/storage authority;
3. one proven canonical no-replace publication protocol;
4. one durable job/lease/recovery engine.

Then connect import to all downstream prepared state with a transactional outbox and immutable generation inventories.

## First decision package

Before modifying behaviour, resolve/research:

- ADR-001 writer ownership and maintenance drain;
- ADR-002 supported Windows/NTFS canonical publication primitive;
- ADR-003 typed storage/no-follow path authority;
- ADR-005 unified job engine/supervision;
- ADR-012 supported OS/filesystem/topology.

The main agent/implementer must read `AGENTS.md` and all referenced ADR/action/finding acceptance criteria. Do not delegate interpretation of safety instructions to a subtask without retaining primary review.

## Suggested issue/branch sequence

### Epic A — W01 writer/maintenance barrier

Deliverables:

- formal owner/maintenance/read-only states and transition table;
- atomically complete host-aware owner/lease record or OS-backed equivalent;
- common connection/authority integration for CLI/API/workers/migration/backup/restore;
- independent process contention/incomplete-record/crash/PID/foreign-host tests;
- status/health evidence that does not mutate state.

Stop after tests and ADR. Do not yet run a live migration.

### Epic B — W03/W37/W38 storage authority

Deliverables:

- typed source/inbox/canonical/derivative/cache/open-folder capabilities;
- canonicalized root identity plus preserved display spelling;
- no-follow/realpath/reparse policy and handle/file identity revalidation;
- corrupted-DB and TOCTOU fault tests;
- removal/prevention of direct arbitrary `Path` joins at authority boundaries.

Stop after every current caller either uses the capability or is explicitly blocked/unsupported.

### Epic C — W02/W14/W15 publication/durability

Deliverables:

- selected supported primitive and filesystem matrix in ADR-002;
- no writable alias at any failure boundary;
- immediate verified immutable permissions/attributes;
- file and directory durability contract;
- unique no-overwrite conflict evidence;
- safe restart reconciliation and power-loss/fault matrix.

Do not migrate the legacy/review copy paths until the primitive passes independently.

### Epic D — W04/W19 job engine

Deliverables:

- one schema-constrained job/attempt/lease/event transition model;
- transactional claim, heartbeat/lease extension, finite retry, pause/cancel safe boundaries;
- independent expired-running sweeper;
- separate worker supervision/cooperative shutdown;
- model/property/kill/restart tests for every transition;
- compatibility adapter for one pilot non-media job kind.

Migrate job kinds incrementally; never leave two competing claim protocols for the same kind.

### Epic E — W05/W06 workflow/outbox/backfill

Deliverables:

- authoritative `AssetVerified` outbox in the same commit as asset/source association;
- explicit preparation/projection DAG and generation identities;
- logical-photo merge/split lineage policy;
- backfill immutable inventory with finite attempts and isolated job kinds;
- concurrent-import coverage and complete reconciliation;
- end-to-end copied synthetic import reaches current Library/organization/Stack/junk or explicit terminal unavailable state.

### Epic F — W07–W16 recovery and intent gates

Deliverables:

- remote versioned encrypted backup/restore automation and semantic audit;
- source-read authorization across every path;
- migration/capacity/durability rehearsal;
- exact-target confirmation, unified bulk safeguards, durable failure/undo;
- versioned/private derivative caching;
- full release audit and operator evidence.

Only after Epic F passes should the P1 API/UI modularization and release tooling proceed.

## Change discipline

- One safety invariant per focused commit where possible.
- Use W/F/ADR IDs in branch/commit/test names and PR description.
- Add failing adversarial tests before changing the implementation.
- Keep media-facing storage changes separate from broad module moves/formatting.
- Preserve existing public CLI behaviour unless the safe response is to refuse an unsupported operation.
- Prefer explicit unsupported/no-go states over compatibility that bypasses a new boundary.
- Do not delete historical state/evidence or rewrite schema history.
- Update docs/worklog at every stopping point.

## Review checkpoints

At the end of each epic:

1. run focused and complete checks from [TEST_STRATEGY.md](TEST_STRATEGY.md);
2. confirm no real media/database/private evidence entered Git;
3. verify changed filesystem targets on synthetic roots only;
4. update W/F/ADR status without renumbering IDs;
5. update README/user/ops/troubleshooting/schema/release gates;
6. publish a draft PR with exact limitations;
7. stop—do not chain the next architectural epic without reviewing the boundary just created.

## Definition of “ready to consider copied production-shaped rehearsal”

- W01–W16 implemented and reviewed;
- storage/writer/job formal models and fault tests pass repeatedly;
- readers/audits are provably read-only;
- installed clean package/build identity is reproducible;
- backup/restore drill succeeds on isolated synthetic scale;
- no current documentation overclaim remains;
- independent reviewer approves the copied-rehearsal plan.

This is not permission for live use. Live consideration begins only after all [RELEASE_GATES.md](RELEASE_GATES.md) evidence is signed.
