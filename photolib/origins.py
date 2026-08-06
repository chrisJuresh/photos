"""Exports and verifies `origins.jsonl`, the content-hash to original-path map.

This is the artefact `G:\\photos` is deleted behind. A vault object's filename is
its SHA-256 and carries no memory of where the bytes came from; `origin` holds
that, and `origin` lives in `catalog.sqlite3`, which is regenerable *only* by
re-walking a source tree that will no longer exist. Without this file, a restored
repository is 436 GB of correct bytes nobody can navigate.

**Every distinct file, not every kept file.** All 787,798, including the 749,422
triage excluded. Reversal of a *wrong exclusion* is the thing this file exists
for, and a wrongly excluded file is by definition not in the kept set. Exporting
only what triage kept would drop 95% of the map and drop precisely the rows the
map is needed for.

Format: one self-contained JSON object per line, no header, no compression, no
schema to look up::

    {"sha256": "...", "ext": ".jpg", "size": 176531,
     "taken_at": "2019-08-11T14:02:07", "taken_src": "exif:DateTimeOriginal",
     "paths": ["G:\\\\photos\\\\..."]}

A text editor and `grep` are the only tools required to use it, which is the
point: the recovery path must not depend on this repository still existing.

**Append-only.** The first export writes every line sorted by `sha256`; every
later run appends only what is new, at the end, unsorted with respect to the
whole. Photos imported after this build ends have to extend the file, and a
format regenerable only in one shot from a deleted `G:\\photos` goes stale the
first time anything arrives. So the read contract is a log, not a table:

* a `sha256` may appear on more than one line;
* a reader takes the **union** of every `paths` array for that `sha256`, and the
  scalars from its **last** line;
* nothing is ever rewritten, and there is no way to express a deletion. A path
  that existed once stays in the map. For a recovery index that is the correct
  bias.

`--verify` reconstructs `origin` from the file alone into a scratch database and
diffs the path sets against the live catalog, both directions, plus every path
whose `sha256` disagrees. It reads the JSONL with `json.loads` and nothing from
this module's export path, so a bug that writes and reads the same wrong shape
does not verify clean.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sqlite3
import sys
import tempfile
from collections.abc import Iterator
from pathlib import Path

from photolib import db
from photolib.config import load

FILENAME = "origins.jsonl"

# The scalars carried per distinct byte sequence. `ext` is one representative
# extension, not the only one: 15,492 origin rows disagree with it, almost all of
# them zero-byte files, which are one byte sequence under every extension in the
# corpus. The `paths` array is where the truth about extensions lives.
_FILE_COLUMNS = "sha256, ext, size, taken_at, taken_src"


def target_path(vault_root: Path | None = None) -> Path:
    """`<vault_root>\\origins.jsonl`, from config.toml unless given."""
    return Path(vault_root if vault_root is not None else load().vault_root) / FILENAME


def _line(record: dict) -> str:
    """One record as its canonical line.

    `ensure_ascii=False` because 895 paths in this corpus are non-ASCII and
    `\\u00e9` is not what "readable in a text editor" means. The file is UTF-8.
    """
    return json.dumps(record, ensure_ascii=False, separators=(",", ":"), sort_keys=False)


def _path_digest(paths: list[str]) -> str:
    """A short stable digest of a sorted path list.

    An incremental export has to know whether a `sha256` already in the file has
    since gained a path. Holding all 1.37M path strings in a dict to answer that
    costs a few hundred MB; holding one digest each costs ~47.
    """
    hasher = hashlib.sha256()
    for path in paths:
        hasher.update(path.encode("utf-8"))
        hasher.update(b"\0")
    return hasher.hexdigest()


def records(conn: sqlite3.Connection) -> Iterator[dict]:
    """Every distinct file as an export record, ordered by `sha256`.

    Two ordered cursors merged rather than one join with `ORDER BY sha256, path`:
    the join makes SQLite sort 1.37M rows into a temp b-tree, and `file.sha256`
    is already a primary key while `origin_sha` already orders `origin`.
    """
    scalars = conn.execute(f"SELECT {_FILE_COLUMNS} FROM file ORDER BY sha256")
    grouped = conn.execute("SELECT sha256, path FROM origin ORDER BY sha256")

    pending: tuple[str, str] | None = next(grouped, None)
    for sha256, ext, size, taken_at, taken_src in scalars:
        paths: list[str] = []
        while pending is not None and pending[0] == sha256:
            paths.append(pending[1])
            pending = next(grouped, None)
        if not paths:
            raise RuntimeError(f"file row {sha256} has no origin row; the catalog is inconsistent")
        paths.sort()
        yield {
            "sha256": sha256,
            "ext": ext,
            "size": size,
            "taken_at": taken_at,
            "taken_src": taken_src,
            "paths": paths,
        }
    if pending is not None:
        raise RuntimeError(f"origin row {pending[1]!r} has no file row; the catalog is inconsistent")


def read_jsonl(path: Path) -> Iterator[tuple[int, dict]]:
    """Yield `(line number, object)` for every line, one at a time."""
    with path.open("r", encoding="utf-8") as handle:
        for number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            try:
                yield number, json.loads(line)
            except json.JSONDecodeError as error:
                raise ValueError(f"{path}:{number}: not valid JSON: {error}") from error


def existing_digests(path: Path) -> dict[str, str]:
    """Per-`sha256` digest of the union of every line's paths, for the file on disk."""
    accumulated: dict[str, list[str]] = {}
    for _, record in read_jsonl(path):
        accumulated.setdefault(record["sha256"], []).extend(record["paths"])
    return {sha: _path_digest(sorted(set(paths))) for sha, paths in accumulated.items()}


def export(
    conn: sqlite3.Connection,
    path: Path,
    *,
    progress: object | None = None,
) -> dict[str, int]:
    """Write or extend `path`, and return what happened.

    A first export goes to a sibling temporary file and is renamed into place, so
    an interrupted run leaves no half file that a later run would append to. An
    extending export appends in place, because rewriting is the one thing an
    append-only format may not do.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    first = not path.exists()
    before = {} if first else existing_digests(path)

    written = 0
    considered = 0
    destination = path.with_suffix(path.suffix + ".partial") if first else path
    mode = "w" if first else "a"
    with destination.open(mode, encoding="utf-8", newline="\n") as handle:
        for record in records(conn):
            considered += 1
            if not first and before.get(record["sha256"]) == _path_digest(record["paths"]):
                continue
            handle.write(_line(record) + "\n")
            written += 1
            if progress is not None and written % 50_000 == 0:
                print(f"  {written:,} lines", file=progress, flush=True)
        handle.flush()
        os.fsync(handle.fileno())

    if first:
        destination.replace(path)
    return {"considered": considered, "written": written, "appended": 0 if first else written}


def reconstruct(path: Path, scratch_db: Path) -> dict[str, int]:
    """Build an `origin`-shaped table in `scratch_db` from `path` alone.

    Deliberately naive: read each line with `json.loads`, insert one row per
    entry in `paths`. It shares no code with the export, so the diff is a real
    check rather than a round trip through one set of assumptions.
    """
    conn = sqlite3.connect(scratch_db, isolation_level=None)
    try:
        conn.execute("PRAGMA journal_mode = OFF")
        conn.execute("PRAGMA synchronous = OFF")
        conn.execute("DROP TABLE IF EXISTS origin_jsonl")
        conn.execute("CREATE TABLE origin_jsonl (path TEXT PRIMARY KEY, sha256 TEXT NOT NULL)")
        conn.execute("BEGIN")
        lines = 0
        for _, record in read_jsonl(path):
            lines += 1
            sha256 = record["sha256"]
            # The log contract: a repeated sha256 unions its paths. INSERT OR
            # REPLACE on the path key is that union, and also catches a path
            # relisted under a different hash by keeping the later one, which
            # the diff then reports.
            conn.executemany(
                "INSERT OR REPLACE INTO origin_jsonl (path, sha256) VALUES (?, ?)",
                ((entry, sha256) for entry in record["paths"]),
            )
        conn.execute("COMMIT")
        paths = conn.execute("SELECT count(*) FROM origin_jsonl").fetchone()[0]
        hashes = conn.execute("SELECT count(DISTINCT sha256) FROM origin_jsonl").fetchone()[0]
    finally:
        conn.close()
    return {"lines": lines, "paths": paths, "hashes": hashes}


def diff(scratch_db: Path, catalog_db: Path) -> dict[str, object]:
    """Diff the reconstructed table against the live `origin`, both directions."""
    conn = sqlite3.connect(scratch_db, uri=True)
    try:
        # mode=ro: the live catalog is the thing being checked against, and a
        # verification that can write to its own reference is not one.
        conn.execute("ATTACH DATABASE ? AS live", (Path(catalog_db).as_uri() + "?mode=ro",))
        missing = conn.execute(
            "SELECT count(*) FROM live.origin o "
            "WHERE NOT EXISTS (SELECT 1 FROM origin_jsonl j WHERE j.path = o.path)"
        ).fetchone()[0]
        extra = conn.execute(
            "SELECT count(*) FROM origin_jsonl j "
            "WHERE NOT EXISTS (SELECT 1 FROM live.origin o WHERE o.path = j.path)"
        ).fetchone()[0]
        mismatched = conn.execute(
            "SELECT count(*) FROM origin_jsonl j JOIN live.origin o ON o.path = j.path "
            "WHERE o.sha256 <> j.sha256"
        ).fetchone()[0]
        samples = {
            "missing": [
                row[0]
                for row in conn.execute(
                    "SELECT o.path FROM live.origin o "
                    "WHERE NOT EXISTS (SELECT 1 FROM origin_jsonl j WHERE j.path = o.path) "
                    "LIMIT 5"
                )
            ],
            "extra": [
                row[0]
                for row in conn.execute(
                    "SELECT j.path FROM origin_jsonl j "
                    "WHERE NOT EXISTS (SELECT 1 FROM live.origin o WHERE o.path = j.path) "
                    "LIMIT 5"
                )
            ],
        }
        live_paths = conn.execute("SELECT count(*) FROM live.origin").fetchone()[0]
        live_hashes = conn.execute("SELECT count(DISTINCT sha256) FROM live.origin").fetchone()[0]
    finally:
        conn.close()
    return {
        "live_paths": live_paths,
        "live_hashes": live_hashes,
        "missing_from_jsonl": missing,
        "not_in_origin": extra,
        "sha256_disagreements": mismatched,
        "samples": samples,
    }


def _run_export(path: Path) -> int:
    conn = db.connect(read_only=True)
    try:
        result = export(conn, path, progress=sys.stdout)
    finally:
        conn.close()
    size = path.stat().st_size
    print(f"{path}  {size:,} bytes")
    print(f"  {result['considered']:,} distinct files considered, {result['written']:,} lines written")
    if result["appended"]:
        print(f"  appended to an existing file; {result['appended']:,} new or extended records")
    elif result["written"] == 0:
        print("  nothing new — the file already covers every distinct file in the catalog")
    return 0


def _run_verify(path: Path, scratch: Path | None) -> int:
    catalog_db, _ = db.paths()
    with tempfile.TemporaryDirectory() as temporary:
        scratch_db = Path(scratch) if scratch else Path(temporary) / "origins-verify.sqlite3"
        built = reconstruct(path, scratch_db)
        result = diff(scratch_db, catalog_db)

    print(f"reconstructed {built['lines']:,} lines -> {built['paths']:,} paths, "
          f"{built['hashes']:,} distinct sha256")
    print(f"live origin    {result['live_paths']:,} paths, {result['live_hashes']:,} distinct sha256")
    print("diff:")
    print(f"  in origin, absent from origins.jsonl : {result['missing_from_jsonl']:,}")
    print(f"  in origins.jsonl, absent from origin : {result['not_in_origin']:,}")
    print(f"  same path, different sha256          : {result['sha256_disagreements']:,}")
    for label, rows in result["samples"].items():
        for row in rows:
            print(f"    {label}: {row}")
    clean = not (
        result["missing_from_jsonl"] or result["not_in_origin"] or result["sha256_disagreements"]
    )
    print("PATH SETS MATCH EXACTLY" if clean else "PATH SETS DIFFER")
    return 0 if clean else 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--verify",
        action="store_true",
        help="reconstruct origin from the JSONL into a scratch database and diff it",
    )
    parser.add_argument(
        "--out", type=Path, default=None, help=f"override <vault_root>\\{FILENAME}"
    )
    parser.add_argument(
        "--scratch",
        type=Path,
        default=None,
        help="keep the verification's scratch database at this path instead of a temp dir",
    )
    args = parser.parse_args(argv)
    path = args.out or target_path()

    if args.verify:
        if not path.is_file():
            raise FileNotFoundError(f"no export at {path}; run without --verify first")
        return _run_verify(path, args.scratch)
    return _run_export(path)


if __name__ == "__main__":
    sys.exit(main())
