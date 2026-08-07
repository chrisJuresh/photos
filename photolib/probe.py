"""Fills `file.width`/`height` from image HEADERS. Never a decode.

Triage screen 3 -- long edge <=64 / <=256 / <=512 / <=1024 / >1024 -- is the
filter that actually settles the 54,899 `.png`, and dimensions are the one thing
it needs that files outside MediaVault do not have: 641,764 of 787,798 `file`
rows have never had their bytes read, so `width` is NULL for all of them.

`PLAN.md` puts this between screen 2 and screen 3 deliberately, and that
position is the whole cost argument. Screens 0-2 need only path and extension
and run on the full inventory with no reads at all; whatever they remove, this
never opens. Run it *after* those decisions are saved, not before.

**Header only.** `Image.open()` parses the container header and stops; `.size`
is available without a pixel being decoded, and `load()` is never called. That
is the difference between reading ~2 KB and reading a 25 MB raw file, and it is
also why no decode timeout or memory cap is needed here -- `archive.pipeline.decode`
exists for the case where pixels are actually produced.

Two properties are recorded rather than assumed. The dimensions land with
`file.dims_src = 'header'`, because a header reading of a JPEG carrying EXIF
orientation 6 or 8 is transposed relative to the decoded raster and anything
reading width and height separately has to know which it holds. And rows that
were already measured by a decode are never overwritten: Phase 2a's numbers are
better than these.
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from photolib import db, migrate, triage
from photolib.config import Config, load

# Latency-bound, not bandwidth-bound: each probe reads a few kilobytes from the
# head of a file on a USB HDD, which is the shape `thumbnails` measured at 41
# reads/s serial against 86/s at 32 threads.
READ_WORKERS = 32
PROGRESS_SECONDS = 30

# Containers Pillow can measure from a header. Raw formats are excluded on
# purpose: `.arw`, `.rw2` and friends need a real decoder, MediaVault has
# already measured every one of them, and a failed open per raw file would be
# thousands of pointless seeks.
#
# Extension-less files are also excluded, and that is the one judgement call
# here: 200,546 `file` rows carry no extension, and probing them all is ~29 min
# of USB-HDD head time to find the few that are images. They are overwhelmingly
# `.git` objects and browser cache entries, which screen 1 removes without ever
# needing a dimension. `--ext` overrides the list if a later screen disagrees.
HEADER_FORMATS = frozenset(
    {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tif", ".tiff", ".ico"}
)


def _worklist_sql(
    verdict: triage.Verdict, formats: list[str], *, select: str, suffix: str = ""
) -> tuple[str, list]:
    """The worklist query, as either its rows or a count over them.

    Driven from `file`, which is 787,798 rows and mostly already measured,
    rather than from the 1,374,328-row path list: reaching the paths of a small
    candidate set through `origin_sha` costs the candidates, and grouping the
    whole path list first cost 17 s.

    The extension is filtered on `origin.ext`, not `file.ext`. One content hash
    can have paths with different extensions -- the empty file has dozens -- and
    picking `min(path)` off a `file.ext` match hands the prober a name it cannot
    open.

    Returns the SQL and its parameters together, because they cannot be assembled
    independently here. `candidate` is a parameterised CTE sitting *between* the
    verdict's directory CTE and the `kept` expression in the WHERE, so the bind
    order is dir, formats, case, formats -- not `verdict.params` as one unit.
    Binding it as one unit fed the first extension to the directory CTE, which
    then matched nothing and quietly kept every path a `dir_segment` rule had
    excluded. That is invisible without a directory rule in the set, which is
    why it survived step 10: the prefilter is nine `ext` rules.
    """
    placeholders = ", ".join("?" * len(formats))
    sql = verdict.query(
        f"""candidate AS (
      SELECT sha256 FROM file WHERE width IS NULL AND lower(ext) IN ({placeholders})
    )""",
        tail=f"""SELECT {select}
      FROM candidate c
      CROSS JOIN origin g ON g.sha256 = c.sha256
      JOIN triage_path tp ON tp.origin_id = g.id
      JOIN triage_bucket k ON k.id = tp.bucket_id
      {verdict.join}
      WHERE {verdict.kept} AND lower(g.ext) IN ({placeholders})
      {suffix}""",
    )
    return sql, [*verdict.dir_params, *formats, *verdict.case_params, *formats]


def worklist(
    conn: sqlite3.Connection,
    rules: list[triage.Rule] | None = None,
    *,
    formats: frozenset[str] = HEADER_FORMATS,
) -> list[tuple]:
    """`(sha256, path)` for every kept file with no dimensions and a readable header.

    One path per file -- the bytes are identical, so the first name is as good
    as any and probing a duplicate twice would be work with no output. Restricted
    to what the current rule set keeps, which is the point of running this after
    screens 0-2 rather than before them.
    """
    rules = triage.load_rules(conn) if rules is None else rules
    verdict = triage.verdict_expression(rules)
    sql, params = _worklist_sql(
        verdict,
        sorted(formats),
        select="g.sha256, min(g.path)",
        suffix="GROUP BY g.sha256 ORDER BY 2",
    )
    return conn.execute(sql, params).fetchall()


def pending(
    conn: sqlite3.Connection,
    rules: list[triage.Rule] | None = None,
    *,
    formats: frozenset[str] = HEADER_FORMATS,
) -> dict:
    """How much work the probe has, without doing any of it.

    This is what the triage UI's probe button reports, and it is deliberately
    the *only* thing an HTTP request does about the probe. Hard rule 4 keeps
    media work out of a request, and here that is not ceremony:

      * `probe.store` writes `file.width`/`height` into the **catalog**, while
        the triage write surface is handed a connection with no `ATTACH` of the
        catalog precisely so "triage writes metadata only" is a fact about the
        connection rather than a convention somebody maintains;
      * the reads land on `G:`, the USB HDD whose contention `PLAN.md` measures
        in whole megabytes per second, at whatever moment a request arrives;
      * and on this corpus it would buy nothing -- the worklist is 25 files,
        all of them unreadable cache blobs, so the probe stores zero rows.

    So this counts, in pure SQL, and the caller runs `python -m photolib.probe`
    if the count ever justifies it. `formats` rides along because it is the
    honest explanation for why screen 3's `unknown` band does not shrink to
    zero: everything outside this list stays unmeasured however long you wait.
    """
    rules = triage.load_rules(conn) if rules is None else rules
    verdict = triage.verdict_expression(rules)
    ordered = sorted(formats)
    sql, params = _worklist_sql(verdict, ordered, select="count(DISTINCT g.sha256)")
    count = conn.execute(sql, params).fetchone()[0]
    return {
        "worklist": count,
        "formats": ordered,
        "command": "python -m photolib.probe" if count else None,
    }


def measure(path: Path) -> tuple[int, int] | None:
    """`(width, height)` from the header, or None if it could not be read.

    `Image.open` is lazy: it reads the header, populates `size`, and leaves the
    pixels alone. The context manager closes the handle without ever calling
    `load()`.
    """
    from PIL import Image

    try:
        with Image.open(path) as image:
            width, height = image.size
    except (OSError, ValueError, Image.DecompressionBombError):
        # A truncated, absent or unrecognised file is a fact about the corpus,
        # not a failure of the run. It stays dimensionless and screen 3 shows
        # it under 'unknown'.
        return None
    if width <= 0 or height <= 0:
        return None
    return width, height


def probe(
    todo: list[tuple],
    *,
    workers: int = READ_WORKERS,
    progress=None,
) -> tuple[list[tuple], dict]:
    """Measure every item. Returns the rows to write and a tally.

    Reads only. Nothing here opens a file for writing, and the results go back
    to the caller rather than to the database, so the write is one transaction
    the caller can see.
    """
    say = progress or (lambda _message: None)
    results: list[tuple] = []
    unreadable = 0
    started = announced = time.perf_counter()

    with ThreadPoolExecutor(max(workers, 1)) as pool:
        for done, (item, size) in enumerate(
            zip(todo, pool.map(lambda row: measure(Path(row[1])), todo)), 1
        ):
            if size is None:
                unreadable += 1
            else:
                results.append((size[0], size[1], max(size), item[0]))
            now = time.perf_counter()
            if now - announced >= PROGRESS_SECONDS:
                announced = now
                say(f"  probe    {done:>7,}/{len(todo):,}  {done / (now - started):.0f}/s")

    elapsed = time.perf_counter() - started
    return results, {
        "measured": len(results),
        "unreadable": unreadable,
        "elapsed_s": elapsed,
        "rate": len(todo) / elapsed if elapsed else 0.0,
    }


def store(conn: sqlite3.Connection, rows: list[tuple]) -> int:
    """Write the readings. `dims_src` records that these came from a header.

    Guarded on `width IS NULL` in the UPDATE itself, not just in the worklist:
    a decode that landed between the two would otherwise be overwritten by the
    weaker measurement.
    """
    conn.execute("BEGIN")
    conn.executemany(
        "UPDATE file SET width = ?, height = ?, dims_src = 'header' "
        "WHERE sha256 = ? AND width IS NULL",
        [(width, height, sha) for width, height, _long_edge, sha in rows],
    )
    conn.execute("COMMIT")
    return len(rows)


def run(
    config: Config | None = None,
    *,
    workers: int = READ_WORKERS,
    limit: int | None = None,
    dry_run: bool = False,
    formats: frozenset[str] = HEADER_FORMATS,
) -> int:
    config = config or load()
    conn = db.connect(config.catalog_db, config.state_db)
    try:
        if migrate.version(conn, "main") < 5:
            raise SystemExit("catalog schema is behind; run python -m photolib.migrate first")

        started = time.perf_counter()
        todo = worklist(conn, formats=formats)
        print(
            f"worklist  {len(todo):,} kept files with no dimensions and a readable header "
            f"({time.perf_counter() - started:.1f}s, pure SQL)",
            flush=True,
        )
        if limit is not None:
            todo = todo[:limit]
            print(f"limit     probing {len(todo):,} of them", flush=True)
        if dry_run or not todo:
            return 0

        rows, tally = probe(todo, workers=workers, progress=lambda m: print(m, flush=True))
        print(
            f"\nprobed    {tally['measured']:,} measured, {tally['unreadable']:,} unreadable "
            f"in {tally['elapsed_s']:.1f}s at {tally['rate']:.0f} files/s"
        )
        if limit is not None:
            remaining = len(todo)
            print(
                f"projected {remaining:,} at this rate is "
                f"{remaining / max(tally['rate'], 1e-9) / 60:.1f} min"
            )
        written = store(conn, rows)
        print(f"stored    {written:,} rows, dims_src = 'header'")
        print("          rebuild the survey: python -m archive.pipeline.triage_survey")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--workers", type=int, default=READ_WORKERS)
    parser.add_argument("--limit", type=int, help="probe at most this many, for a measurement")
    parser.add_argument("--dry-run", action="store_true", help="report the worklist and stop")
    parser.add_argument(
        "--ext", help="comma-separated extensions to probe instead of the default list"
    )
    args = parser.parse_args()
    chosen = HEADER_FORMATS
    if args.ext:
        chosen = frozenset(part.strip().lower() for part in args.ext.split(",") if part.strip())
    sys.exit(
        run(workers=args.workers, limit=args.limit, dry_run=args.dry_run, formats=chosen)
    )
