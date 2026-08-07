"""Snapshots `state.sqlite3` onto a different physical disk.

`state.sqlite3` is the only artefact in this project that cannot be regenerated.
`catalog.sqlite3` rebuilds from a re-scan, derivatives regenerate from the 1536px
substrate, and the vault restores from restic through `origins.jsonl`. The triage
rules and per-file overrides do not: they are the output of a human looking at
1.37M files, and every future favourite and rating lands in the same file.

`PLAN.md` labels it *Irreplaceable* and nothing in the build order copied it
anywhere, so losing `E:` after triage meant doing triage again.

Two things this does not do, deliberately. It is **not** an off-site backup --
`backup_root` is another disk in the same machine, which covers a dead drive and
not a dead building; the off-site copy remains a manual step alongside the restic
repo. And it does not prune: snapshots are ~20 KB before triage and a few MB
after, so a retention policy would be more code than the thing it manages.

`VACUUM INTO` rather than a file copy. The database runs in WAL mode, so copying
the file alone can capture a torn page set with its committed tail sitting in a
`-wal` the copy did not take. `VACUUM INTO` writes a consistent, fully
checkpointed snapshot from inside a read transaction, and produces a single file
with nothing beside it to remember.
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

from photolib.config import load

# Present in every backup and compared afterwards. A snapshot that opens but has
# lost the decisions is the failure worth catching.
VERIFIED_TABLES = ("triage_rule", "triage_override", "schema_version")


def _counts(path: Path) -> dict[str, int]:
    """Row count per verified table, reading `path` on its own, read-only."""
    conn = sqlite3.connect(f"{path.as_uri()}?mode=ro", uri=True)
    try:
        present = {
            row[0]
            for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        }
        return {
            table: conn.execute(f'SELECT count(*) FROM "{table}"').fetchone()[0]
            for table in VERIFIED_TABLES
            if table in present
        }
    finally:
        conn.close()


def _volume(path: Path) -> str:
    """The volume a path lives on, for the distinct-disk check."""
    return path.resolve().drive.upper()


def snapshot(
    state_db: Path | None = None,
    backup_root: Path | None = None,
    *,
    now: datetime | None = None,
    require_distinct_volume: bool = True,
) -> Path:
    """Write a verified snapshot of `state_db` under `backup_root`, and return its path.

    Raises rather than returning a bad snapshot: a backup that silently did not
    happen is worse than no backup, because it is believed.
    """
    if state_db is None or backup_root is None:
        config = load()
        state_db = state_db or config.state_db
        backup_root = backup_root or config.backup_root
    state_db, backup_root = Path(state_db), Path(backup_root)

    if not state_db.is_file():
        raise FileNotFoundError(f"no state database at {state_db}")

    if require_distinct_volume and _volume(state_db) == _volume(backup_root):
        raise ValueError(
            f"backup_root {backup_root} is on {_volume(backup_root)}, the same volume as "
            f"{state_db}. A snapshot beside its source survives nothing that would destroy "
            f"the source."
        )

    stamp = (now or datetime.now(timezone.utc)).strftime("%Y%m%dT%H%M%SZ")
    backup_root.mkdir(parents=True, exist_ok=True)
    target = backup_root / f"state-{stamp}.sqlite3"
    if target.exists():
        raise FileExistsError(f"{target} already exists; refusing to overwrite a snapshot")

    source = sqlite3.connect(f"{state_db.as_uri()}?mode=ro", uri=True)
    try:
        source.execute("VACUUM INTO ?", (str(target),))
    finally:
        source.close()

    before, after = _counts(state_db), _counts(target)
    if before != after:
        target.unlink(missing_ok=True)
        raise RuntimeError(
            f"snapshot verification failed: source {before} != snapshot {after}; "
            f"{target} removed"
        )
    return target


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--allow-same-volume",
        action="store_true",
        help="permit a snapshot on the source's own volume (it protects against nothing)",
    )
    args = parser.parse_args(argv)

    target = snapshot(require_distinct_volume=not args.allow_same_volume)
    counts = _counts(target)
    decisions = counts.get("triage_rule", 0) + counts.get("triage_override", 0)
    print(f"{target}  {target.stat().st_size:,} bytes")
    print("  " + "  ".join(f"{table}={count:,}" for table, count in sorted(counts.items())))
    if decisions == 0:
        print("  note: no triage decisions recorded yet, so this snapshot protects only the schema")
    return 0


if __name__ == "__main__":
    sys.exit(main())
