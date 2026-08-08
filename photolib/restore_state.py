"""Rolls `state.sqlite3` back to one of its snapshots.

`archive.pipeline.backup_state` writes a verified, timestamped copy of
`state.sqlite3` and never prunes or overwrites one, so the backup root holds a
ladder of restore points: one per rebuild, each of them the triage settings as
they stood at the end of that run. This is the way back down it. A triage
session that went wrong is undone by restoring the snapshot from before it --
which is the *previous* run's, because the snapshot a run takes is of the
decisions that run is about to apply.

This is the only thing in the repository that overwrites the one file which
cannot be regenerated, so it is deliberately a typed command and not a button.
Three refusals guard it, and all three are invariant 6 -- exclusive maintenance
refuses to run while a writer is active -- applied to the file that deserves it
most:

  * **the website answers on its port.** The grid holds a write connection to
    `state.sqlite3` for every thread that has served a triage write, and
    replacing the file under it would leave those connections addressing an
    inode nothing else can see. The port is the honest test for "is the writer
    running", because the writer is a server;
  * **the database takes an exclusive lock.** Cheap, and it catches a writer
    this module cannot see: anything holding an open transaction fails this
    before a byte moves;
  * **the snapshot verifies.** It must open, carry the two decision tables, and
    be reported before anything is replaced. A snapshot that turns out to be
    empty is a worse outcome than the mistake being rolled back.

The current state is snapshotted before it is replaced, so a restore is itself
undoable -- restoring the wrong file is exactly the mistake this module exists
to fix. That snapshot is taken by spawning `archive.pipeline.backup_state`
rather than by reimplementing `VACUUM INTO` here: it is the verified
implementation, and `photolib` importing `archive.pipeline` would point the
dependency arrow the wrong way round.
"""

from __future__ import annotations

import argparse
import shutil
import socket
import sqlite3
import subprocess
import sys
from collections.abc import Callable
from datetime import UTC, datetime
from pathlib import Path

from photolib.config import load
from photolib.grid import DEFAULT_PORT
from photolib.rebuild import REPO_ROOT

# The same three the snapshot verifies on the way out, compared again on the way
# back in. A snapshot that opens and has lost the decisions is the failure worth
# catching in both directions.
VERIFIED_TABLES = ("triage_rule", "triage_override", "schema_version")

SNAPSHOT_GLOB = "state-*.sqlite3"


class RestoreRefused(Exception):
    """The restore did not happen and nothing was written."""


def counts(path: Path) -> dict[str, int]:
    """Row count per verified table, reading `path` on its own, read-only."""
    if not path.is_file():
        raise RestoreRefused(f"no snapshot at {path}")
    try:
        conn = sqlite3.connect(f"{path.as_uri()}?mode=ro", uri=True)
    except sqlite3.Error as exc:
        raise RestoreRefused(f"{path} could not be opened: {exc}") from exc
    try:
        present = {
            row[0] for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        }
        missing = [table for table in VERIFIED_TABLES if table not in present]
        if missing:
            raise RestoreRefused(f"{path} is not a state database: no {', '.join(missing)}")
        return {
            table: conn.execute(f'SELECT count(*) FROM "{table}"').fetchone()[0]
            for table in VERIFIED_TABLES
        }
    except sqlite3.DatabaseError as exc:
        raise RestoreRefused(f"{path} did not open as a database: {exc}") from exc
    finally:
        conn.close()


def snapshots(backup_root: Path) -> list[Path]:
    """Every snapshot in the backup root, newest first by name.

    The name carries a UTC stamp in a sortable form, so this is a sort and never
    a stat: an mtime is what a copy changes and the stamp is what the snapshot
    means.
    """
    return sorted(backup_root.glob(SNAPSHOT_GLOB), reverse=True)


def server_is_up(port: int, host: str = "127.0.0.1") -> bool:
    """Whether something answers on the grid's port."""
    with socket.socket() as probe:
        probe.settimeout(0.3)
        return probe.connect_ex((host, port)) == 0


def _refuse_if_locked(state_db: Path) -> None:
    """Refuse unless this process can take the database exclusively, right now."""
    conn = sqlite3.connect(state_db, isolation_level=None, timeout=0.5)
    try:
        conn.execute("BEGIN EXCLUSIVE")
        conn.execute("ROLLBACK")
    except sqlite3.OperationalError as exc:
        raise RestoreRefused(
            f"{state_db} is in use by another process ({exc}). Stop every writer and try again."
        ) from exc
    finally:
        conn.close()


def _safety_snapshot() -> str:
    """Snapshot the current state by spawning the step that owns snapshotting."""
    result = subprocess.run(  # noqa: S603
        [sys.executable, "-m", "archive.pipeline.backup_state"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if result.returncode != 0:
        raise RestoreRefused(
            "could not snapshot the current state before replacing it, so nothing was "
            f"replaced:\n{result.stdout}{result.stderr}"
        )
    return result.stdout.splitlines()[0].rsplit("  ", 1)[0]


def restore(
    snapshot: Path,
    state_db: Path,
    *,
    port: int = DEFAULT_PORT,
    before: Callable[[], str] | None = None,
) -> dict[str, int]:
    """Replace `state_db` with `snapshot`. Returns the restored row counts.

    Raises `RestoreRefused` without having written anything if any guard fails.

    `before` preserves what is about to be replaced and defaults to *not
    running*, which looks backwards for a safety measure and is not: the only
    snapshotter in the repository reads `config.toml` for itself, so a default
    that ran it would make every test of this function snapshot the real
    `state.sqlite3`. `main` passes `_safety_snapshot`, and `main` is the only
    caller that operates on the configured database.
    """
    snapshot, state_db = Path(snapshot), Path(state_db)
    if not snapshot.is_file():
        raise RestoreRefused(f"no snapshot at {snapshot}")
    if snapshot.resolve() == state_db.resolve():
        raise RestoreRefused("the snapshot and the live database are the same file")
    if server_is_up(port):
        raise RestoreRefused(
            f"something is answering on 127.0.0.1:{port}. Stop the grid "
            f"(`python -m photolib.grid`) before restoring, and start it again after."
        )
    restored = counts(snapshot)
    if state_db.is_file():
        _refuse_if_locked(state_db)
        if before is not None:
            before()

    # Fold the write-ahead log into the file and let SQLite remove it: a `-wal`
    # left beside the replaced database describes the database that is no longer
    # there, and replaying it onto the restored one is corruption rather than an
    # error. The unlinks below cover the same sidecars surviving a crash, where
    # there is no connection left to close and clear them.
    if state_db.is_file():
        conn = sqlite3.connect(state_db, isolation_level=None)
        try:
            conn.execute("PRAGMA wal_checkpoint(TRUNCATE)")
        finally:
            conn.close()

    # Copied beside the target and renamed onto it, so a failure part way through
    # a multi-megabyte copy leaves the live database untouched rather than half
    # overwritten.
    incoming = state_db.with_name(state_db.name + ".incoming")
    shutil.copy2(snapshot, incoming)
    incoming.replace(state_db)
    for suffix in ("-wal", "-shm"):
        state_db.with_name(state_db.name + suffix).unlink(missing_ok=True)
    return restored


def _print_listing(backup_root: Path) -> int:
    found = snapshots(backup_root)
    if not found:
        print(f"no snapshots under {backup_root}")
        return 1
    print(f"{len(found)} snapshots under {backup_root}, newest first")
    for path in found:
        size = path.stat().st_size
        try:
            recorded = counts(path)
            decisions = (
                f"{recorded['triage_rule']:,} rules, {recorded['triage_override']:,} overrides"
            )
        except RestoreRefused as exc:
            decisions = f"unreadable: {exc}"
        print(f"  {path.name}  {size:,} bytes  {decisions}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m photolib.restore_state", description=__doc__.splitlines()[0]
    )
    parser.add_argument("snapshot", type=Path, nargs="?", help="the snapshot to restore")
    parser.add_argument("--list", action="store_true", help="list the snapshots and stop")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="the grid's port")
    parser.add_argument(
        "--yes", action="store_true", help="skip the confirmation prompt"
    )
    args = parser.parse_args(argv)

    config = load()
    if args.list or args.snapshot is None:
        code = _print_listing(config.backup_root)
        if args.snapshot is None and not args.list:
            print("\nname one to restore it, or --list to see this again")
        return code

    # A bare filename means "the one in the backup root", which is how the
    # listing above and the grid's popup both spell them.
    snapshot = args.snapshot
    if not snapshot.is_absolute() and not snapshot.exists():
        snapshot = config.backup_root / snapshot.name

    try:
        incoming = counts(snapshot)
        current = counts(config.state_db) if config.state_db.is_file() else {}
    except RestoreRefused as exc:
        print(f"refused: {exc}", file=sys.stderr)
        return 1

    print(f"restoring {snapshot}")
    print(f"  onto    {config.state_db}")
    for table in VERIFIED_TABLES:
        print(f"  {table:<16} {current.get(table, 0):,} now  ->  {incoming[table]:,} restored")
    if not args.yes:
        answer = input("\nreplace the live triage state? [y/N] ").strip().lower()
        if answer not in ("y", "yes"):
            print("nothing was replaced")
            return 1

    try:
        restore(snapshot, config.state_db, port=args.port, before=_safety_snapshot)
    except RestoreRefused as exc:
        print(f"refused: {exc}", file=sys.stderr)
        return 1

    stamp = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"\nrestored at {stamp}")
    print("the grid still holds the tile set built from the state you just replaced.")
    print("start it and press Apply to grid, or run `python -m archive.pipeline.group`.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
