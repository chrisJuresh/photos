"""Step 16: prove that what Phase 4 did is what Phase 4 recorded.

Step 14 destroys directory entries and verifies nothing. A wrong-bytes survivor
is indistinguishable from success by existence, size, `nlink`, file count or free
space -- the batch-shaped promotion that failed once left exactly that: the right
name, `nlink 1`, an ordinary listing, the wrong bytes. Only re-reading the bytes
finds it, and this is the pass that does.

Four checks, and this module writes nothing but its report. The connection is
opened `mode=ro` so a stray write raises rather than landing somewhere.

1. Re-hash every promoted vault name against the digest the catalogue records.
   `missing`, `mismatched` and `not yet promoted` are three separate outcomes and
   are never collapsed: an unstarted row and a vanished survivor look identical to
   a name-existence check, which is the trap the whole step is about.
2. Per promoted object: `nlink == 1`, read-only set, and the resolved path proven
   inside the vault. An object still at `nlink == 2` is a half-promotion the repair
   pass did not finish -- listed, never fixed here.
3. Nothing remains under the MediaVault objects root for a promoted digest, and
   staging is empty *positively*: the directory absent or holding no files, and
   zero `file` rows in state `staged`. An empty result from a query looking in the
   wrong place is identical to a pass.
4. The append-only log reconciles against the excluded set in both directions.

Budget ~1h57m: 435.6 GB at the 62.0 MB/s one reader gets from this volume. It is
disk bandwidth, not work. It must never run while promotion or repair is running,
because it opens names Phase 4 has just set read-only and CPython's `open()`
passes no `FILE_SHARE_DELETE`, so a handle here blocks a repair's unlink.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

from photolib import db, promote, reveal
from photolib.adopt_mediavault import object_index
from photolib.config import Config, load

PROGRESS_SECONDS = 60


def promoted_rows(conn) -> list[tuple[str, str, int]]:
    """`(sha256, vault_relpath, size)` for every name the ledger says is published."""
    return conn.execute(
        "SELECT p.sha256, p.vault_relpath, f.size FROM promotion p "
        "JOIN file f ON f.sha256 = p.sha256 "
        "WHERE p.status = 'done' AND p.intent IN ('promote', 'stage_rename') "
        "ORDER BY p.sha256"
    ).fetchall()


def rehash(config: Config, rows: list[tuple[str, str, int]]) -> dict:
    """Check 1 and check 2 in one pass over the bytes. One reader.

    Both checks read the same name, and the second is three `os.stat` fields, so
    splitting them into two passes would cost another 435.6 GB to learn nothing.
    """
    result = {
        "verified": 0,
        "mismatched": [],
        "missing": [],
        "nlink_2": [],
        "not_read_only": [],
        "outside_vault": [],
        "bytes": 0,
    }
    total_bytes = float(sum(size for _, _, size in rows))
    started = announced = time.perf_counter()
    for index, (sha256, relpath, size) in enumerate(rows, 1):
        target = config.vault_root / relpath
        ident = promote.identity(target)
        if ident is None:
            result["missing"].append((sha256, relpath))
            continue
        try:
            reveal.resolve(relpath, config.vault_root, config.vault_root)
        except reveal.RevealRefused:
            result["outside_vault"].append((sha256, relpath))
        if ident.nlink != 1:
            result["nlink_2"].append((sha256, relpath, ident.nlink))
        if not ident.readonly:
            result["not_read_only"].append((sha256, relpath))

        digest = promote.sha256_of(target)
        result["bytes"] += ident.size
        if digest != sha256 or ident.size != size:
            result["mismatched"].append((sha256, digest, relpath, ident.size, size))
        else:
            result["verified"] += 1

        now = time.perf_counter()
        if now - announced >= PROGRESS_SECONDS:
            announced = now
            elapsed = now - started
            share = (result["bytes"] / total_bytes) if total_bytes else index / len(rows)
            print(
                f"  rehash  {index:>7,}/{len(rows):,}  {promote._hms(elapsed)} elapsed"
                f"  {result['bytes'] / elapsed / 1e6:6.1f} MB/s  {share * 100:5.1f}%"
                f"  ETA {promote._hms(elapsed / share - elapsed if share else 0)}",
                flush=True,
            )
    result["elapsed_s"] = time.perf_counter() - started
    return result


def leftovers(config: Config, conn) -> dict:
    """Check 3. What is still under the roots Phase 4 emptied, and why it matters.

    A leftover under the objects root for a *promoted* digest is a half-promotion;
    for an *excluded* one it is a blocked unlink. They are counted apart because
    the remedies differ, and orphaned derivatives are counted as neither.
    """
    promoted = {row[0] for row in conn.execute(
        "SELECT sha256 FROM file WHERE state = 'published'"
    )}
    excluded = {row[0] for row in conn.execute(
        "SELECT sha256 FROM file WHERE state = 'excluded'"
    )}
    present = object_index(config.mediavault_root)
    remaining = {"objects": len(present), "for_promoted": [], "for_excluded": [], "unknown": 0}
    for relpath in present:
        digest = relpath.rsplit("\\", 1)[-1].split("_")[0]
        if digest in promoted:
            remaining["for_promoted"].append(relpath)
        elif digest in excluded:
            remaining["for_excluded"].append(relpath)
        else:
            remaining["unknown"] += 1

    staged_rows = conn.execute("SELECT count(*) FROM file WHERE state = 'staged'").fetchone()[0]
    staging_files = (
        [str(path) for path in config.staging_root.rglob("*") if path.is_file()]
        if config.staging_root.exists()
        else []
    )
    remaining["staging_absent"] = not config.staging_root.exists()
    remaining["staging_files"] = len(staging_files)
    remaining["staged_rows"] = staged_rows
    remaining["orphans"] = promote.orphan_derivatives(config, excluded)
    return remaining


def reconcile(config: Config, conn) -> dict:
    """Check 4. The log against the excluded set, both directions.

    Neither direction may have orphans: a delete with no excluded row means
    something was destroyed that triage did not condemn, and an excluded row with
    no line means a destruction nobody recorded.
    """
    path = config.catalog_db.parent / promote.UNLINK_LOG_NAME
    lines = []
    if path.exists():
        with open(path, encoding="utf-8") as handle:
            for number, text in enumerate(handle, 1):
                text = text.strip()
                if not text:
                    continue
                try:
                    lines.append(json.loads(text))
                except json.JSONDecodeError:
                    lines.append({"_malformed": number})

    unlinks: dict[str, int] = {}
    unnamed = []
    malformed = [line["_malformed"] for line in lines if "_malformed" in line]
    for line in lines:
        if line.get("intent") != promote.UNLINK or line.get("status") != "done":
            continue
        unlinks[line["sha256"]] = unlinks.get(line["sha256"], 0) + 1
        if not line.get("decided_by"):
            unnamed.append(line["sha256"])
    excluded = {row[0] for row in conn.execute(
        "SELECT sha256 FROM file WHERE state = 'excluded'"
    )}
    return {
        "log": str(path),
        "lines": len(lines),
        "malformed": malformed,
        "unlinks": len(unlinks),
        "excluded_rows": len(excluded),
        "logged_but_not_excluded": sorted(set(unlinks) - excluded),
        "excluded_but_not_logged": sorted(excluded - set(unlinks)),
        "logged_more_than_once": sorted(sha for sha, count in unlinks.items() if count > 1),
        "unnamed": unnamed,
    }


def report(config: Config | None = None) -> int:
    config = config or load()
    conn = db.connect(config.catalog_db, config.state_db, read_only=True)
    failures = 0
    try:
        rows = promoted_rows(conn)
        jobs, counts = promote.worklist(conn)
        unfinished = conn.execute(
            "SELECT status, count(*) FROM promotion WHERE status <> 'done' GROUP BY 1 ORDER BY 1"
        ).fetchall()

        print(
            f"ledger          {len(rows):,} promoted names, "
            f"{counts['already_unlinked']:,} unlinked, "
            f"{len(jobs):,} not yet done"
        )
        if jobs:
            still = {intent: sum(job.intent == intent for job in jobs) for intent in
                     (promote.PROMOTE, promote.UNLINK, promote.STAGE_RENAME)}
            print(f"  not yet promoted: " + ", ".join(f"{k} {v:,}" for k, v in still.items()))
            failures += len(jobs)
        if unfinished:
            print("  unfinished rows: " + ", ".join(f"{s} {c:,}" for s, c in unfinished))
            failures += sum(count for _, count in unfinished)

        print(f"\ncheck 1+2       re-hashing {len(rows):,} names, "
              f"{sum(size for _, _, size in rows) / 1e9:.1f} GB, one reader", flush=True)
        hashes = rehash(config, rows)
        print(
            f"  verified      {hashes['verified']:,} of {len(rows):,} in "
            f"{promote._hms(hashes['elapsed_s'])} "
            f"({hashes['bytes'] / max(hashes['elapsed_s'], 1e-6) / 1e6:.1f} MB/s)"
        )
        for label, key in (
            ("MISMATCHED", "mismatched"),
            ("MISSING", "missing"),
            ("nlink != 1", "nlink_2"),
            ("not read-only", "not_read_only"),
            ("outside the vault", "outside_vault"),
        ):
            entries = hashes[key]
            print(f"  {label:<14}{len(entries):,}")
            for entry in entries[:20]:
                print(f"      {entry}")
            failures += len(entries)

        print("\ncheck 3         what is left under the roots step 14 emptied", flush=True)
        left = leftovers(config, conn)
        print(f"  objects root  {left['objects']:,} files remain")
        print(f"    for a promoted digest  {len(left['for_promoted']):,}  (half-promotions)")
        print(f"    for an excluded digest {len(left['for_excluded']):,}  (blocked unlinks)")
        print(f"    for neither            {left['unknown']:,}")
        failures += len(left["for_promoted"]) + len(left["for_excluded"])
        print(
            f"  staging       {'absent' if left['staging_absent'] else 'present'}, "
            f"{left['staging_files']:,} files, {left['staged_rows']:,} rows in state 'staged'"
        )
        failures += left["staging_files"] + left["staged_rows"]
        print(
            f"  orphans       {left['orphans']['thumbs']:,} thumbnails, "
            f"{left['orphans']['substrates']:,} substrates -- deliberate, not a failure"
        )

        print("\ncheck 4         the delete log against the excluded set", flush=True)
        books = reconcile(config, conn)
        print(f"  log           {books['lines']:,} lines, {books['unlinks']:,} completed unlinks")
        print(f"  excluded rows {books['excluded_rows']:,}")
        for label, key in (
            ("logged, not excluded", "logged_but_not_excluded"),
            ("excluded, not logged", "excluded_but_not_logged"),
            ("logged twice", "logged_more_than_once"),
            ("no rule named", "unnamed"),
            ("malformed lines", "malformed"),
        ):
            entries = books[key]
            print(f"  {label:<21}{len(entries):,}")
            for entry in entries[:20]:
                print(f"      {entry}")
            failures += len(entries)

        print(
            "\nPROMOTION VERIFIED" if not failures
            else f"\n{failures:,} problems above. The promotion is NOT verified."
        )
        return 1 if failures else 0
    finally:
        conn.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m photolib.promote_verify", description=__doc__.splitlines()[0]
    )
    parser.parse_args(argv)
    return report(load())


if __name__ == "__main__":
    sys.exit(main())
