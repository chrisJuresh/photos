# CLI

**State in v1:** 16 subcommands built. Every command that mutates live data is held.

**Depends on:** [storage-and-identity.md](storage-and-identity.md),
[database-schema.md](database-schema.md).

## What it does

`media-vault` is the entry point for everything that touches media. It is the only place
hashing, copying, decoding, and analysis are allowed to happen — the HTTP layers enqueue work
for it rather than doing the work themselves.

Invoked through `v1/run.ps1` on Windows, or `python -m media_vault`. Declared as a console
script `media-vault = media_vault.cli:main` in `pyproject.toml`.

## The commands

| Command | Purpose | Effect on media and state |
|---|---|---|
| `init` | Create an empty vault and versioned database | Creates directories and the database. Does not read any source. |
| `migrate` | Back up, migrate, and validate the manifest | Exclusive state maintenance. **Held.** |
| `preflight` | Discover, classify, hash source; calculate capacity | Reads source. Writes manifest and a report. Copies nothing. **Held on live source.** |
| `finalize-preflight` | Recreate the capacity report from a completed scan | Reads persisted state, writes a report. |
| `import --execute` | Rescan, verify, publish canonical objects | Reads source. Writes objects, state, evidence. **Held.** |
| `analyze` | Record visual, decoded, and RAW/JPEG relationships | Reads canonical objects with source fallback. Writes metadata. **Held.** |
| `validate` | Rehash canonical objects, byte-compare available sources | Reads canonical and source. Writes validation results and sidecars. **Held.** |
| `export` | Regenerate sidecars, JSONL, and CSV | Writes `records` and `exports`. |
| `status` | Recent runs, capacity, warning counts | Intended read-only; not provably so (`F21`). |
| `progress` | Progress for a long-running operation | Intended read-only. |
| `ui` | Start the read-only dashboard on 8765 | Read-only HTTP and SQLite. See [legacy-dashboard.md](legacy-dashboard.md). |
| `review-ui` | Start the review API and UI on 8766, optionally with an embedded worker | Metadata mutations and queued work. **Held.** |
| `worker` | Process durable review, preprocessing, and materialization jobs | Can publish canonical objects. **Held.** |
| `preprocess` | Drain prepared-data jobs; `--backfill` coordinates release preparation | Reads canonical bytes, writes derivatives and state. **Held.** |
| `inbox-scan` | Discover top-level inbox batches | Reads inbox, writes manifest and jobs. **Held.** |
| `rebuild-index` | Build a reduced recovery SQLite index from sidecars and objects | Reads vault, creates a separate output. Not a restore. |

Parser definitions are at `v1/media_vault/cli.py:481` onward, one `add_parser` call per
command in the order above.

## Where the code is

| Concern | File |
|---|---|
| Argument parsing, command dispatch, output | `v1/media_vault/cli.py` (27 KB) |
| `python -m media_vault` entry | `v1/media_vault/__main__.py` |
| PowerShell wrapper | `v1/run.ps1` |
| Quarantined backfill launcher | `v1/Resume Live Vault Backfill.cmd` |

## Two commands to treat as hazards

**`preprocess --backfill`** starts the generic worker with *every* supported job kind, so it
can pick up a queued `reviewed_copy` job and publish canonical media as a side effect of what
looks like a preparation command (`F28`, critical — `review_runtime.py:222`).

**`Resume Live Vault Backfill.cmd`** is the launcher for the above. `v1/POST_BACKFILL_CHECKLIST.md`
was rewritten into a deliberate failure page because the original checklist referenced a
schema-2 backup and a 64-object sample and proved nothing about current recoverability
(`F42`). Do not run it.

## Known defects

| ID | Sev | Summary |
|---|---|---|
| `F08` | Critical | `analyze` and `validate` can read source without the access-time guard |
| `F10` | Critical | The embedded worker cannot carry the access-time acknowledgement, so the advertised live import path blocks |
| `F28` | Critical | `preprocess --backfill` starts a worker with every job kind, including reviewed copy |
| `F21` | High | `status` and release audit use the general writable connection |
| `F81` | Medium | No consistent JSON, debug, exit-code, or config-doctor contract; safe remediation is hard to discover |

## Reuse notes

The command decomposition is sound and worth keeping: separating discovery from capacity
calculation from copy, requiring an explicit `--execute`, and keeping read-only inspection
commands distinct from mutating ones are all good boundaries.

Two things to change:

- A worker must be startable for a specific set of job kinds. The single generic worker that
  accepts everything is `F28`.
- Read-only commands need a read-only connection so "this only reads" is provable rather than
  intended.

The review's position is to preserve existing public CLI behaviour where possible, and where
the safe answer is different, refuse the unsupported operation rather than silently changing
what a command does.
