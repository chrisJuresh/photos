# Review UI

**State in v1:** 7 routes, 14 components, 3,642 lines. All frontend tests pass. Live use held
for decision-safety reasons rather than build reasons.

**Depends on:** [review-api.md](review-api.md).

This file covers the shell: app structure, routing, theming, state, build, and embedding. The
individual screens have their own docs — [library.md](library.md),
[organize-views.md](organize-views.md), [stacks.md](stacks.md),
[junk-and-bulk-reject.md](junk-and-bulk-reject.md), and the imports screen in
[import-pipeline.md](import-pipeline.md).

## What it is

A SvelteKit application built with the static adapter, bundled into
`media_vault/review_ui_dist/`, and served by the review API on `127.0.0.1:8766`. No separate
dev server is needed in production; the Python package ships the built assets as package data.

## Stack

Svelte 5.56 (runes: `$state`, `$derived`), SvelteKit 2.70, Vite 8.1, TypeScript 6.0,
`@tanstack/svelte-virtual` 3.13 for list virtualization. Testing: Vitest 4.1 with
`@testing-library/svelte` and jsdom, Playwright 1.61 with `@axe-core/playwright` for
accessibility. Two runtime dependencies total — the app is deliberately close to the platform.

## Routes

| Route | File | Lines | Doc |
|---|---|---|---|
| `/` | `routes/+page.svelte` | 61 | Landing and status |
| `/imports` | `routes/imports/+page.svelte` | 422 | [import-pipeline.md](import-pipeline.md) |
| `/library` | `routes/library/+page.svelte` | 658 | [library.md](library.md) |
| `/organize` | `routes/organize/+page.svelte` | 268 | [organize-views.md](organize-views.md) |
| `/junk` | `routes/junk/+page.svelte` | 203 | [junk-and-bulk-reject.md](junk-and-bulk-reject.md) |
| `/bulk-reject` | `routes/bulk-reject/+page.svelte` | 170 | [junk-and-bulk-reject.md](junk-and-bulk-reject.md) |
| `/settings` | `routes/settings/+page.svelte` | 243 | Appearance, saved views, release controls |

## Components

| Component | Lines | Used by |
|---|---|---|
| `AppShell.svelte` | 43 | `+layout.svelte` |
| `ShellNav.svelte` | 29 | `AppShell` |
| `ThemeControls.svelte` | 30 | `/settings` |
| `ManifestReview.svelte` | 208 | `/imports` |
| `ImportApproval.svelte` | 57 | `/imports` |
| `ImportTelemetry.svelte` | 45 | `/imports` |
| `UnavailableMetrics.svelte` | 12 | `/imports` |
| `LibraryFilters.svelte` | 182 | `/library` |
| `LibraryGrid.svelte` | 214 | `/library` |
| `LibraryInspector.svelte` | 137 | `/library` |
| `StackProfileControls.svelte` | 100 | `/library` |
| `OrganizationViews.svelte` | 185 | `/organize` |
| `JunkProfileControls.svelte` | 105 | `/junk` |
| `JunkPreview.svelte` | 70 | `/junk` |
| `BulkRejectView.svelte` | 200 | `/bulk-reject` |

Every component has a colocated `.test.ts` except `AppShell`, `JunkPreview`,
`ImportApproval`'s sibling `ImportTelemetry`, and `OrganizationViews`' data module.

## Shared modules

| File | Purpose |
|---|---|
| `lib/api.ts` | Typed API client, 1,051 lines, 48 exports |
| `lib/theme.ts` | Light/dark theme and density state |
| `lib/scroll-state.ts` | Scroll position restoration across navigation |
| `lib/data/offline-world-map.ts` | Embedded world map outline — the map view makes no network requests |
| `app.css` | All styling, hand-written, no framework |
| `test-setup.ts` | Vitest and jsdom setup |

The offline world map matters: the map view in `/organize` is built from an embedded SVG
projection and vault-local cluster data, so opening it never contacts a tile server and never
discloses where the photos were taken.

## Build and embedding

```bash
cd v1/review_ui
npm ci
npm run check      # svelte-kit sync && svelte-check
npm test           # vitest
npm run build      # vite build -> ../media_vault/review_ui_dist
npm run test:e2e   # playwright, capture disabled
npm run test:a11y  # playwright + axe, capture disabled
```

`svelte.config.js` uses `@sveltejs/adapter-static`. `pyproject.toml` declares
`review_ui_dist/**/*` as package data, so the built bundle is committed and shipped rather than
built at install time. That means a source change without a rebuild leaves the served app
stale — the two must be committed together.

## Known defects

Frontend findings are `F58`–`F72`. The shell-level ones:

| ID | Sev | Summary |
|---|---|---|
| `F58` | Critical | Approval, bulk, inspector, and profile confirmation Booleans can remain checked when their batch, entity, profile, or selection changes |
| `F60` | High | Selected entities can remain active but hidden after filters change, obscuring the target set |
| `F61` | High | Parent error handling can swallow a failed action while child components clear selection or local undo history |
| `F64` | High | Polling issues repeated requests with no consistent abort, dedup, teardown, request epochs, or latest-response-wins |
| `F67` | High | ARIA tab and inspector behaviour and keyboard/focus announcements are incomplete; automated E2E only exercises an empty vault; no manual keyboard, screen-reader, or responsive review record exists |
| `F68` | High | Variable-height and mobile virtualization tests are disabled or too shallow; fixed row estimates can break keyboard and scroll targeting |
| `F72` | High | Service-ready messaging proves API response only, not worker availability, lease health, queue progress, schema readiness, backup age, or projection freshness |
| `F66` | Medium | Shell density and generic saved views are partly inert; update and delete management is incomplete; stored local routes are not strictly allow-listed |
| `F70` | Medium | Scroll restoration stores a raw offset and first-item approximation rather than a true visible-entity anchor |
| `F71` | Medium | User-visible map punctuation and arrows contain mojibake; styles reference an undefined `--accent-soft` token |
| `F52` | High | Backend and TypeScript contracts are handwritten separately |

## Reuse notes

Worth lifting:

- The offline map data module. No network calls from a photo browser is a real privacy
  property, and the data file is the whole implementation.
- Two runtime dependencies. The app is almost entirely platform APIs plus one virtualization
  library, which is why the dependency audit came back clean (`P12`, `F79`).
- Committing the built bundle as package data, so the Python package is self-contained.
- Colocated component tests.

Do not lift as-is:

- Confirmation-state handling anywhere (`F58`, critical). A checkbox that means "yes, reject
  these 400 photos" must be derived from the current target, not stored independently of it.
- Selection across filter changes (`F60`). Selection must be visible or discarded.
- The polling implementation (`F64`). Needs abort on unmount, request epochs, and
  latest-response-wins.
- Scroll restoration (`F70`). Anchor on an entity ID, not an offset.
- Readiness messaging (`F72`). "The API answered" is not "the system works" — this one misled
  the operator, which is how several other problems went unnoticed.

The frontend has a distinct character among the findings: almost nothing here is a data-loss
bug, and almost everything is a *decision-safety* bug — the UI can lead someone to reject
photos they did not mean to reject. Given that the whole point of the vault is that rejection
is reversible metadata, that is less dangerous than it sounds, but it is the reason the UI is
under hold.
