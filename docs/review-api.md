# Review API

**State in v1:** ~55 endpoints built in a single 215 KB module. Security posture is good in
shape, incomplete in detail. Live use held.

**Depends on:** [database-schema.md](database-schema.md),
[jobs-and-workers.md](jobs-and-workers.md), [preprocessing.md](preprocessing.md).

## What it does

FastAPI application on `127.0.0.1:8766` that also serves the built SvelteKit app. It is the
only network surface the review UI talks to, and it is strictly separate from the legacy
dashboard on 8765 — `config.py:95` rejects a configuration where the two ports match.

What a handler is allowed to do: query persisted data, serve an existing derivative, update
metadata, enqueue a job. Nothing else. See [invariants.md](invariants.md), rule 5.

## Endpoint groups

Full list, grouped by feature. Feature docs repeat their own subset.

**System and health** — `GET /api/v1/system`, `GET /api/v1/jobs/{job_id}`

**Imports** — 15 endpoints under `/api/v1/imports`. See
[import-pipeline.md](import-pipeline.md).

**Library** — `GET /api/v1/library`, `GET /api/v1/library/entities/{entity_id}`,
`GET /api/v1/library/entities/{entity_id}/derivatives/{long_edge}`,
`GET /api/v1/library/facets/{facet_name}`, `PUT /api/v1/library/state`,
`POST /api/v1/library/prepare`, `POST /api/v1/library/entities/{entity_id}/open-folder`,
`POST /api/v1/library/bulk-reject`, `POST /api/v1/library/bulk-reject/undo`. See
[library.md](library.md).

**Organize** — `GET /api/v1/organize/calendar`, `/folders`,
`/equipment/{equipment_kind}`, `/map`, `/status`, `POST /api/v1/organize/prepare`. See
[organize-views.md](organize-views.md).

**Stacks** — `GET /api/v1/stacks/profiles`, `/status`, `/{profile_id}`,
`/{profile_id}/{stack_id}`, `POST /api/v1/stacks/profiles`,
`PUT /api/v1/stacks/{profile_id}/{stack_id}/cover`,
`POST /api/v1/stacks/{profile_id}/{stack_id}/reject-rest`. See [stacks.md](stacks.md).

**Junk** — `GET /api/v1/junk/profiles`, `/status`, `/{profile_id}`,
`/{profile_id}/entities/{entity_id}`, `POST /api/v1/junk/profiles`,
`POST /api/v1/junk/{profile_id}/feedback`. See
[junk-and-bulk-reject.md](junk-and-bulk-reject.md).

**Preferences and saved views** — `GET /api/v1/preferences`,
`PUT /api/v1/preferences/{key}`, `GET /api/v1/saved-views`, `POST /api/v1/saved-views`,
`PUT /api/v1/saved-views/{view_id}`, `DELETE /api/v1/saved-views/{view_id}`

**Backfill** — `GET /api/v1/backfill`, `POST /api/v1/backfill/control`

**Static** — `GET /` and the SvelteKit assets from `media_vault/review_ui_dist/`.

## Security posture as built

Recorded as a positive control (`P03`):

- Host is restricted to a localhost address (`config.py:90`).
- `TrustedHostMiddleware` is configured.
- Same-origin check on mutations.
- JSON payload validation.
- `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.
- Request and query budgets: `max_json_payload_bytes` 1 MiB, `query_timeout_ms` 3000,
  `default_page_size` 100, `max_page_size` 500 (`config.py:34`).
- Typed response envelopes with `meta`, `data`, and `page` sections.
- Revision numbers on mutable entities.
- `Idempotency-Key` support backed by `api_idempotency_records`.

## Response envelope

Responses carry a `meta` block with the projection `generation`, a `data` block, and for paged
endpoints a `page` block with `next_cursor`. The UI uses `meta.generation` to detect that the
projection it is paging through has been rebuilt underneath it.

## Where the code is

| Concern | File |
|---|---|
| Routers, SQL, domain rules, serialization, security, static files, browser launch, worker lifecycle | `v1/media_vault/review_api.py` (215 KB, ~4,700 lines) |
| Typed client | `v1/review_ui/src/lib/api.ts` (1,051 lines, 48 exports) |
| Embedded worker thread | `review_api.py:4695` |

Line references: `review_api.py:465` (open-in-folder), `review_api.py:478` (mutation
transactions), `review_api.py:2889` (library reject), `review_api.py:3919` (derivative cache
header), `review_api.py:4695` (worker thread).

## Data it owns

`api_idempotency_records`, `review_application_state`, `user_preferences`, `saved_views`.

## Known defects

| ID | Sev | Summary |
|---|---|---|
| `F03` | Critical | Mutations open writable SQLite transactions without joining the CLI writer lock |
| `F45` | High | Request bodies can be buffered before the declared length budget is enforced, so chunked or missing-length bodies evade early limits |
| `F47` | High | A stable "current derivative" URL is served with a one-year immutable cache header |
| `F49` | High | Unhandled exceptions become generic responses without sufficient persistent structured exception and access logging |
| `F51` | High | One 4,700-line module holds routers, SQL, domain rules, serialization, security, static files, browser launch, and worker lifecycle |
| `F52` | High | Backend and TypeScript contracts are handwritten separately; network, error, and timeout behaviour is not standardized at one boundary |
| `F35` | High | An idempotent replay can return an older generation and regress client state; idempotency rows have no retention policy |
| `F27` | High | The embedded worker is a daemon thread with a five-second shutdown join |
| `F46` | Medium | Some GET and query flows enqueue materialization jobs, so a safe read mutates state |
| `F50` | Medium | Open-in-folder crosses into an OS launcher and needs stricter allow-listing, audit, platform-safe argument handling, and an off switch |
| `F65` | High | Cursors are not fully consumed, facets can represent only the first slice, detail arrays are silently capped, and some paging is forward-only |

## Reuse notes

Worth lifting conceptually:

- The typed envelope with `meta.generation`. It is what lets a client notice that the
  projection changed under it.
- Revisions on mutable entities, so a mutation can be rejected if it targets a stale version.
- Localhost-only binding, separate ports, same-origin mutation checks, and explicit request
  budgets. The whole security posture is the right shape.
- `Idempotency-Key` on mutations.

Do not lift as-is:

- The module itself. `F51` is the single largest maintainability finding in the project and
  the reason a rebuild is reasonable.
- The mutation transaction path (`F03`, critical). The API writing to SQLite without
  participating in the writer lock is the same class of bug as `F01` and `F02`.
- Handwritten dual contracts (`F52`). Generating the TypeScript client from the backend
  schema, or sharing one definition, removes a whole category of drift.
- `open-folder` (`F50`), unless there is a real need for it. It is the one endpoint that
  crosses out of the application into an OS launcher.

One decision to make early rather than late: silent truncation. `F65` covers several places
where a result set is capped and the response does not say so. A response that cannot be
complete should say it is incomplete.
