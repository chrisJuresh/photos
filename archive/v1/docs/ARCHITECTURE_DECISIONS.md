# Architecture decision register

The current snapshot needs explicit decisions before the architecture rework begins. This register prevents an implementation detail from silently becoming a safety policy.

No proposed decision below is approved merely because it appears here. Each final ADR must name the exact candidate commit, supported platform/filesystem, evidence, rejected alternatives, migration/rollback effect, and related W/F IDs.

## Decision register

| ADR | Decision | Status | Recommended direction | Related work |
|---|---|---|---|---|
| ADR-001 | Normal writer ownership and exclusive maintenance protocol | Proposed | One local vault supervisor owns normal writes; offline CLI maintenance acquires the same universal barrier after service drain | W01, W09, F01–F04 |
| ADR-002 | Canonical no-replace publication and immutable permission model | Research required | Select a platform/filesystem-specific primitive only after crash/power-loss tests prove no writable alias and durable directory entry | W02, W14, W15, F06–F07/F16–F20 |
| ADR-003 | Typed storage authorities and no-follow path policy | Proposed | Central source/inbox/canonical/derivative/cache/open-folder capabilities with handle identity and realpath/reparse enforcement | W03, W37, W38, W55 |
| ADR-004 | Protected-media access-time policy | Proposed | Correct/verify filesystem policy or use a proven snapshot/block method; no CLI/HTTP/browser waiver for live source/canonical/inbox metadata | W08, F08–F10 |
| ADR-005 | Unified job state machine and worker supervision | Proposed | One transactionally constrained engine/sweeper; separate supervised resource-class processes | W04, W19, W33 |
| ADR-006 | Import/outbox/projection workflow | Proposed | Commit `AssetVerified` outbox with authoritative state; consume through an explicit generation-bound DAG | W05, W06 |
| ADR-007 | Logical-photo merge/split user-state lineage | Research required | Persist lineage and apply conservative deterministic propagation; ambiguous state requires review | W05, W35, F33 |
| ADR-008 | SQLite connection modes and repository boundaries | Proposed | Writer, strict read-only, and maintenance connection factories; domain repositories and schema constraints | W20, W30, W31 |
| ADR-009 | Backup consistency and disaster-recovery model | Proposed | Stopped whole-vault snapshot first; encrypted versioned remote copies plus isolated restore drill | W07, W16, W35, W42 |
| ADR-010 | Derivative identity, serving, and retention | Proposed | Content/analyzer/input-addressed URL or private ETag; retain reviewed evidence under explicit encrypted policy | W13, W41, W42 |
| ADR-011 | Generated review UI distribution | Open | Either commit reproducible bundles or build signed artifacts in CI; record source/build identity and test installed package | W28, W53 |
| ADR-012 | Supported OS/filesystem/host topology | Proposed | Start with a narrow named local Windows/NTFS matrix; explicitly refuse untested live DB/shared-host configurations | W01, W14, W37 |
| ADR-013 | API command/query and contract generation | Proposed | Side-effect-free GET queries, explicit idempotent POST commands, generated/validated shared schemas | W21, W30, W32 |
| ADR-014 | Audit/idempotency/job/projection retention | Research required | Policy by authority/privacy/rebuild cost; tamper-evident export before bounded compaction | W25, W41, W42, W54 |
| ADR-015 | Algorithm calibration and human override | Proposed | Version thresholds against labelled evidence; never auto-delete; preserve feedback/profile lineage and rollback | W50 |

## ADR template

Create one Markdown file per accepted decision, for example `docs/adr/0001-writer-ownership.md`, using this structure:

```markdown
# ADR-NNN: Short decision title

- Status: proposed / accepted / superseded / rejected
- Date: YYYY-MM-DD
- Decision owners: names/roles
- Candidate commit: Git SHA
- Related work: W IDs and F IDs
- Supported scope: OS, filesystem, vault topology, data scale

## Context

What invariant/problem forces a decision? Which current behaviours and failure modes are evidenced?

## Decision

State one concrete choice, its boundaries, and what callers are forbidden to bypass.

## Alternatives considered

List credible alternatives and why each was not chosen.

## Safety and privacy consequences

Explain source/canonical immutability, writer/maintenance, recovery, private metadata, and failure behaviour.

## Operational consequences

Explain deployment, backup, migration, monitoring, support, capacity, and rollback.

## Verification

List deterministic unit/integration/fault/property/load/restore/manual evidence. Never use real media or screen capture.

## Rollout and rollback

Describe copied-database rehearsal, compatibility, transition steps, stop conditions, and how to revert without rewriting media.

## Follow-up

List unresolved questions with owners/dates. Link superseding ADRs rather than rewriting history.
```

## Decision rules

- Safety invariants outrank implementation convenience and throughput.
- A decision that changes supported live scope requires explicit operator/release approval.
- Do not approve a filesystem primitive from documentation alone; prove it at every failure boundary on the supported matrix.
- Do not make browser/UI state the authority for approval, access-time waivers, job ownership, or undo.
- Do not use a distributed service to mask a local invariant that remains undefined.
- Keep ADR history; supersede rather than deleting the reasoning.
- Update README, user guide, schema caveats, tests, action/finding mappings, and release gates when a decision lands.
