# Changelog

This project is an unreleased WIP. Package metadata currently says `1.0.0`, but no live-ready 1.0 release has been approved.

## Unreleased

### Preserved implementation snapshot — 2026-07-22

- Preserved the pre-existing review interface, API/domain modules, preprocessing/backfill work, generated static bundle, tests, migration/schema additions, launcher, and historical docs as commit `d49e621` on `codex/wip-review-interface-audit`.
- Validation at that snapshot passed 84 Python tests, Ruff, 39 frontend tests, Svelte/TypeScript checks, one capture-disabled smoke test, and one capture-disabled accessibility test.
- Explicitly classified the snapshot as WIP/not safe for live source/vault/inbox use.

### Documentation and full review — 2026-07-22

- Added a safety hold and quarantined the former live post-backfill checklist.
- Added the manual remote-backup inventory and isolated restore-drill runbook.
- Added a complete user guide for legacy commands, adding photos, both web interfaces, all review workspaces, lifecycle, stopping, and troubleshooting.
- Added a full code/architecture/process review and proposed target architecture.
- Added F01–F83 findings with evidence and W01–W58 action traceability.
- Ranked every action overall and by safety, ease of use, reliability, security/privacy, scalability, and maintainability.
- Added a documentation hub, release gates, operations, troubleshooting, glossary, ADR register, test strategy, implementation handoff, security policy, contribution guidance, backup/incident templates, and a draft-PR publishing summary.
- Rewrote the README to state capability/readiness honestly and removed unsafe routine live instructions.
- Added controlling historical-status warnings to schema/frontend specification/plan/progress documents.
- Changed no application code, tests, scripts, configuration, generated assets, media, vault state, or database during this documentation review.

### Known release blockers

- universal race-free writer/maintenance exclusion;
- realpath/no-follow typed path authority;
- canonical no-replace publication with no writable alias and proven durability;
- unified job claim/lease/heartbeat/retry/recovery and supervised shutdown;
- transactional import-to-preprocessing/projection outbox and entity lineage;
- isolated immutable backfill inventory with finite attempts;
- complete encrypted remote backup, restore, and semantic audit;
- source-read authorization across every fallback;
- exact-target confirmation/bulk/undo/caching/paging/polling correctness;
- security/privacy/decoder/package/CI/load/accessibility/calibration evidence.

See [docs/SAFETY_HOLD.md](docs/SAFETY_HOLD.md) and [docs/ACTION_PRIORITY_MATRIX.md](docs/ACTION_PRIORITY_MATRIX.md) for authoritative current status.
