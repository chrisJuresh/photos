# Legacy dashboard

**State in v1:** built and genuinely read-only. Held for synthetic or copied state only, because
of a DNS-rebinding gap rather than any write risk.

**Depends on:** [database-schema.md](database-schema.md).

## What it is

The older, simpler web interface. Predates the review application and is deliberately kept
separate from it: different port, different module, no shared request path, no mutation
endpoints at all.

Binds `127.0.0.1:8765`. Started with `media-vault ui`.

## Why it still exists

It is the read-only inspection surface. Where the review application is a product with
decisions and confirmations and state, the dashboard just shows you what is recorded: runs,
sources, assets, relationships, warnings, and existing prepared previews. When something looks
wrong in the review app, this is where you look without any risk of changing anything.

Its read-only property is enforced rather than intended:

- Accepts **only** `GET`, `HEAD`, and `OPTIONS`.
- Opens SQLite with `mode=ro` **and** `query_only=ON`.
- Has no mutation endpoints to reach.

The review recorded both as positive controls (`P01`, `P02`). This is the only part of the
system where "this cannot write" is actually provable, which is worth noting given `F03` and
`F21` — the review API and even `status` write-capable connections do not have this property.

## Endpoints

| Path | Returns |
|---|---|
| `GET /` | The dashboard page |
| `GET /api/health` | Service health |
| `GET /api/live` | Liveness |
| `GET /api/schema` | Schema version and migration state |
| `GET /api/overview` | Summary counts and capacity |
| `GET /api/runs` | Recent runs |
| `GET /api/sources` | Source roots and versions |
| `GET /api/assets` | Assets, paged |
| `GET /api/assets/{asset_id}` | One asset with its evidence |
| `GET /api/assets/{asset_id}/preview` | An existing prepared or legacy cached preview |
| `GET /api/duplicates` | Exact duplicate groups |
| `GET /api/relationships` | Non-exact relationships |
| `GET /api/raw-jpeg-groups` | RAW/JPEG groups |
| `GET /api/raw-jpeg-groups/{group_id}` | One group |
| `GET /api/warnings` | Recorded warnings |

The preview endpoint may serve an existing derivative or legacy cache file and may enqueue
missing work, but never decodes, hashes, or reads source during the request.

## Where the code is

| Concern | File |
|---|---|
| HTTP application, read-only connection policy, all endpoints | `v1/media_vault/ui_server.py` (30 KB) |
| Static frontend | `v1/media_vault/ui/index.html`, `app.js`, `styles.css` |
| Command | `media-vault ui` |

Line references: `ui_server.py:52` (path handling), `ui_server.py:202` (host handling),
`ui_server.py:244` (API path check).

The frontend is three files of vanilla HTML, JS, and CSS — no build step, no framework, no
dependencies.

## Data it reads

Everything, read-only. Owns nothing.

## Known defects

Only two, and neither is a write risk.

| ID | Sev | Summary |
|---|---|---|
| `F48` | High | No TrustedHost or hostname validation, so DNS rebinding can disclose paths, metadata, and location evidence to a hostile page |
| `F13` | High | Preview and legacy cache path resolution does not share one reparse-aware realpath authority with the rest of the system |

`F48` is the reason it is held. A page in your browser can resolve a hostname to `127.0.0.1`
and then read your photo metadata, GPS coordinates, and filesystem paths through this API. The
review application already has `TrustedHostMiddleware`; the dashboard does not.

## Reuse notes

Worth lifting, and it is close to free:

- `mode=ro` plus `query_only=ON` on read connections. Two parameters that make a whole class of
  bug impossible.
- Method allow-listing at the application level rather than per-route.
- A dependency-free static frontend for the inspection surface. Three files that will still work
  in ten years, which is the right trade for a diagnostic tool attached to an archive you intend
  to keep.

Fix before use: add `TrustedHostMiddleware` and hostname validation (`F48`). It is a small
change and the review application's existing configuration is the model.

Open question worth deciding deliberately: whether a rebuild has one interface or two. `v1`
having two was partly historical accident and partly a real property — the read-only one is
provably harmless. If it collapses into one application, the provable-read-only property is
what gets lost.
