## Summary

This draft PR preserves the pre-existing review-interface/preprocessing/backfill WIP and adds a documentation-only full code, architecture, process, safety, usability, operations, backup, and release review.

**It is not a release candidate and must not be run against the live source, vault, or inbox.** The branch exists to back up valuable work, make risks explicit, and provide an ordered rework path.

## Preserved implementation

- separate Svelte review application and `/api/v1` local API;
- reviewed inbox, approval/copy, preprocessing, Library, Organize, Stack, junk, bulk, Settings, and backfill work;
- schema/migration versions through 12;
- generated packaged frontend bundle;
- synthetic Python/frontend/API/domain/E2E/accessibility tests;
- historical specification, plan, progress, schema, and launcher artifacts.

Snapshot commit: `d49e621` (`Snapshot review interface WIP; do not use live`).

## Review outcome

The implementation is worth preserving but is unsafe for live use. The highest-priority blockers are:

1. racy/cross-host writer lock and API writer bypass;
2. unchecked database-derived canonical path and inconsistent path authorities;
3. hard-link publication can leave a writable alias to a canonical inode;
4. per-stage job recovery can strand running work; embedded shutdown is not a proven boundary;
5. reviewed copy lacks transactional downstream preprocessing/projection handoff;
6. backfill can claim unrelated jobs, miss concurrent lower-sorting assets, and retry indefinitely;
7. legacy source fallbacks bypass the atime guard and UI workers cannot satisfy local authorization;
8. backup/rebuild/audit do not prove full remote disaster recovery;
9. frontend confirmation/bulk/selection/failure/undo/caching/paging/polling semantics can apply stale intent or conceal incomplete results.

## Documentation added/reworked

- short controlling safety hold and quarantined historical live checklist;
- complete F01–F83 findings register;
- W01–W58 master implementation order and complete safety, ease-of-use, reliability, security/privacy, scalability, and maintainability rankings;
- full architecture/process review, target boundaries, workflow DAG, phases, and ADR register;
- manual remote-backup inventory, non-destructive copy guidance, private backup record, and isolated restore drill;
- full user guide for adding photos, both UIs, data lifecycle, current gaps, stopping, and common problems;
- release gates, operations runbook, troubleshooting/incident template, glossary, test strategy, and implementation handoff;
- security/contribution/changelog policies;
- rewritten README and controlling caveats on historical schema/frontend documents;
- complete review/publishing work log.

No application code, tests, scripts, configuration, generated assets, media, vault state, or database was changed during the documentation phase.

## Validation

Executed before preserving the implementation snapshot, using isolated synthetic/temporary data with Playwright screenshot/video/trace capture disabled:

- `python -m pytest`: 84 passed; one upstream Starlette `TestClient` deprecation warning;
- `python -m ruff check .`: passed;
- `npm test`: 20 files / 39 tests passed;
- `npm run check`: 0 errors, 0 warnings;
- `npm run test:e2e`: one smoke test passed;
- `npm run test:a11y`: one automated accessibility test passed;
- runtime Python dependency and production npm advisory checks: clean;
- full npm tree: three low-severity development-only `cookie@0.6.0` findings.

Documentation-only final checks cover changed-file scope, relative links, ID/ranking completeness, unsafe-live-instruction search, encoding/whitespace, and repository status. The ordinary code suites were not rerun after Markdown-only edits.

## Review guidance

- Keep this PR draft.
- Do not merge it as a release or resume the live backfill launcher.
- Start review with `docs/SAFETY_HOLD.md`, then `docs/ACTION_PRIORITY_MATRIX.md`, `docs/FINDINGS_REGISTER.md`, and `docs/ARCHITECTURE_REVIEW.md`.
- Preserve W/F IDs in follow-up issues/commits.
- Begin implementation with W01–W03/W14/W15, then W04–W06; do not start with cosmetic UI work.
- Require `docs/RELEASE_GATES.md` and an independent restored-copy audit before any future live cutover.
