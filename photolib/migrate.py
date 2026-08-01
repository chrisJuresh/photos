"""Applies the numbered .sql files in migrations/ to the catalog+state pair.

One transaction per migration. Every migration stamps `schema_version` in BOTH
files, because the two databases are one logical schema joined by ATTACH -- a
version reading 2 in one file and 1 in the other is a split schema, and this
refuses to run until that is repaired rather than migrating onto it.

It also refuses while any other writer holds the lock (invariant 6: exclusive
maintenance does not run alongside a writer), and refuses a database recording a
version ahead of the files present, which means older code against a newer
database.
"""

from __future__ import annotations

import re
import sqlite3
from datetime import UTC, datetime
from pathlib import Path

from photolib import db

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"
SCHEMAS = ("main", "state")

_FILENAME = re.compile(r"^(\d{3})_[a-z0-9_]+\.sql$")
_VERSION_TABLE = """
CREATE TABLE IF NOT EXISTS {schema}.schema_version (
  version    INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
)
"""


class MigrationRefused(RuntimeError):
    """Raised instead of migrating. Nothing was applied."""


def discover(migrations_dir: Path = MIGRATIONS_DIR) -> list[tuple[int, Path]]:
    """Every migration file, in order. Numbering must be 1..N with no gaps."""
    found = []
    for path in sorted(migrations_dir.iterdir()):
        match = _FILENAME.match(path.name)
        if match is None:
            raise MigrationRefused(f"{path.name} is not a numbered migration (NNN_name.sql)")
        found.append((int(match.group(1)), path))
    numbers = [number for number, _ in found]
    if numbers != list(range(1, len(found) + 1)):
        raise MigrationRefused(f"migrations must be numbered 1..N with no gaps, found {numbers}")
    return found


def version(conn: sqlite3.Connection, schema: str = "main") -> int:
    """The recorded schema version of one attached database, 0 if unmigrated."""
    table = conn.execute(
        f"SELECT count(*) FROM {schema}.sqlite_master WHERE type='table' AND name='schema_version'"
    ).fetchone()[0]
    if not table:
        return 0
    return conn.execute(f"SELECT coalesce(max(version), 0) FROM {schema}.schema_version").fetchone()[0]


def apply(
    catalog_db: Path | None = None,
    state_db: Path | None = None,
    *,
    migrations_dir: Path = MIGRATIONS_DIR,
) -> int:
    """Apply every pending migration. Returns the version now recorded."""
    files = discover(migrations_dir)
    latest = max((number for number, _ in files), default=0)
    catalog, state = db.paths(catalog_db, state_db)
    for path in (catalog, state):
        path.parent.mkdir(parents=True, exist_ok=True)

    conn = None
    try:
        # busy_timeout 0: a writer holding the lock is a refusal, not a wait.
        conn = db.connect(catalog, state, busy_timeout_ms=0)
        conn.autocommit = False  # so executescript cannot commit a half-applied migration
        for schema in SCHEMAS:
            conn.execute(_VERSION_TABLE.format(schema=schema))
        conn.commit()

        recorded = {schema: version(conn, schema) for schema in SCHEMAS}
        if len(set(recorded.values())) != 1:
            raise MigrationRefused(f"split schema version {recorded}: repair before migrating")
        current = recorded["main"]
        if current > latest:
            raise MigrationRefused(
                f"databases record version {current} but only {latest} migration files are present"
            )

        applied_at = datetime.now(UTC).isoformat(timespec="seconds")
        for number, path in files:
            if number <= current:
                continue
            conn.executescript(path.read_text(encoding="utf-8"))
            for schema in SCHEMAS:
                conn.execute(
                    f"INSERT INTO {schema}.schema_version (version, applied_at) VALUES (?, ?)",
                    (number, applied_at),
                )
            conn.commit()
        return version(conn)
    except sqlite3.OperationalError as exc:
        if "locked" in str(exc) or "busy" in str(exc):
            raise MigrationRefused(f"another writer holds the lock: {exc}") from exc
        raise
    finally:
        if conn is not None:
            conn.rollback()
            conn.close()


if __name__ == "__main__":
    catalog, state = db.paths()
    print(f"schema_version {apply()}: {catalog}, {state}")
