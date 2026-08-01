"""Opens catalog.sqlite3 with state.sqlite3 ATTACHed as `state`.

Two files, one connection. The catalog is regenerable and written only by the
pipeline; state holds human decisions and is written only by the app. ATTACH is
what lets a query read both without either process waiting on the other's write
lock. Paths come from config.toml via `photolib.config`; the parameters exist so
tests can point at a temporary pair, and hold no drive letter.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

from photolib.config import load

BUSY_TIMEOUT_MS = 5000


def _uri(path: Path, read_only: bool) -> str:
    """file: URI for `path`, read-only callers getting mode=ro."""
    return path.as_uri() + ("?mode=ro" if read_only else "")


def paths(catalog_db: Path | None = None, state_db: Path | None = None) -> tuple[Path, Path]:
    """The catalog and state paths, from config.toml unless given explicitly."""
    if catalog_db is None or state_db is None:
        config = load()
        catalog_db = catalog_db or config.catalog_db
        state_db = state_db or config.state_db
    return Path(catalog_db), Path(state_db)


def connect(
    catalog_db: Path | None = None,
    state_db: Path | None = None,
    *,
    read_only: bool = False,
    busy_timeout_ms: int = BUSY_TIMEOUT_MS,
) -> sqlite3.Connection:
    """Connect to the catalog with state attached.

    A read-only connection opens both files with mode=ro, so a stray write
    raises rather than being written somewhere unexpected.
    """
    catalog, state = paths(catalog_db, state_db)
    conn = sqlite3.connect(_uri(catalog, read_only), uri=True, isolation_level=None)
    conn.execute("ATTACH DATABASE ? AS state", (_uri(state, read_only),))
    conn.execute(f"PRAGMA busy_timeout = {int(busy_timeout_ms)}")
    conn.execute("PRAGMA foreign_keys = ON")
    if not read_only:
        conn.execute("PRAGMA journal_mode = WAL")
        conn.execute("PRAGMA state.journal_mode = WAL")
    return conn
