# Security and privacy policy

## Supported status

No version of the new review/backfill workflow is currently supported for live data. Snapshot `d49e621` is preserved for review under [docs/SAFETY_HOLD.md](docs/SAFETY_HOLD.md). Security fixes do not by themselves lift the data-safety/recovery hold.

## Reporting a vulnerability

Do not test a suspected vulnerability against the live source, vault, inbox, or another person's data. Reproduce with an isolated synthetic corpus and copied/synthetic database.

Use GitHub's private vulnerability-reporting/security-advisory channel for this repository if enabled. Otherwise contact the repository owner through a private channel before public disclosure. Include:

- affected commit/version and platform;
- concise impact and preconditions;
- synthetic reproduction with no media, screenshot, video, trace, credentials, or personal metadata;
- relevant W/F IDs if known;
- suggested mitigation or safe stop condition;
- whether source/canonical immutability, writer exclusion, path authority, backup, or privacy could be affected.

Do not attach a live database, backup, logs with full paths/GPS/serials, source/canonical media, or remote credentials. Coordinate redaction before sharing diagnostic evidence.

## Sensitive data

Even without image/video pixels, this system can expose:

- original filenames and complete filesystem paths;
- capture times, locations/GPS, camera/lens/serial data, and software/edit evidence;
- source/inbox/vault topology and machine/process identities;
- favourites, rejection, ratings, groupings, feedback, and search/saved-view history;
- logs, errors, job actions, backup locations, and operational timing;
- prepared previews/posters that reproduce private media content.

Treat the manifest, derivatives, records, exports, reports, logs, backups, and caches as private. Encrypt them in transit/at rest, restrict them to least-privilege identities, and apply versioned retention/deletion governance.

## Threat model

The intended deployment is one trusted local operator on a supported local filesystem with loopback-only web services. It is not a multi-user network service. Relevant threats still include:

- malformed/tampered database paths escaping authority roots;
- symlink/junction/reparse swaps and Windows path aliases;
- two writers or maintenance racing a writer;
- hostile/corrupt media exhausting or exploiting decoders/subprocesses;
- DNS rebinding/Host-header and cross-origin browser requests to localhost;
- oversized/chunked requests and replayed/stale mutations;
- stale public browser caches serving the wrong derivative;
- command/OS-launch argument confusion;
- dependency/build/supply-chain compromise;
- private metadata leakage through logs/errors/backups/issues;
- ransomware/operator error/delete propagation affecting local and remote copies;
- an attacker or cleanup tool modifying a writable hard-link alias to canonical bytes.

## Required controls

- Bind HTTP services only to approved loopback addresses; never port-forward/proxy them without a new threat model.
- Validate Host and same-origin mutation requests; use a restrictive self-only CSP and no external analytics/CDN/tile/font dependencies.
- Stream-limit request bodies, parse typed JSON, bound queries, use explicit POST commands, and keep GET/HEAD side-effect free.
- Resolve filesystem access through typed no-follow realpath authorities; never trust a client or database path directly.
- Enforce one writer/maintenance barrier and strict read-only connections for queries/audits.
- Run decoders/subprocesses in supervised background work with CPU/memory/time/output/path bounds.
- Bind idempotency and confirmations to exact request/subject revisions; retain auditable durable action/undo IDs.
- Use content/version-addressed derivatives or private revalidation, not public immutable caching of a mutable “current” URL.
- Encrypt/version remote backups; prevent delete propagation; restore/audit them in a separate failure domain.
- Redact private values from logs and public issues while preserving enough local evidence for recovery.

The implementation gaps are ranked in [docs/ACTION_PRIORITY_MATRIX.md](docs/ACTION_PRIORITY_MATRIX.md), especially W01–W03, W07, W13, W17, W21, W29, W34, W42, W53–W55, and W58.

## Secrets and repository hygiene

- Never commit credentials, `.env` files, tokens, SMB paths with embedded credentials, encryption/recovery keys, private databases/backups, logs, or media.
- Source media extensions, vault objects, database/WAL files, caches, and common local state are ignored; future CI should independently reject them.
- Use environment/credential-manager facilities outside source/vault/repository. Do not print secrets in commands, process listings, logs, or backup records.
- A Git history rewrite is not a substitute for revoking a leaked credential.

## Dependency and build policy

Before a release candidate:

- install/build Python wheel/sdist and frontend from clean locked environments;
- run runtime and development advisory scans;
- produce an SBOM and license review;
- record accepted advisory owner, rationale, mitigation, and expiry;
- verify the installed bundled UI matches the reviewed source/build identity;
- sign/record the exact Git commit, toolchain, and analyzer versions.

The 2026-07-22 review found no known runtime Python or production npm advisories. The full npm tree had three low-severity development-only findings through `cookie@0.6.0`; this is point-in-time evidence only.

## Disclosure and release

Coordinate public disclosure after a fix, tests, and safe upgrade/mitigation exist. If a report affects source/canonical immutability, writer/maintenance, path escape, restore, or private-data exposure, the release decision is automatically no-go until independent evidence closes it.
