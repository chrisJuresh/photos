"""Resolves capture time for every adopted file. `photo` is Phase 5's, not this.

`PLAN.md` calls this the highest-risk part of the build. v1 held a
`DateTimeOriginal` for 38,767 assets, refused every one of them for carrying no
timezone, and published two calendar buckets -- "ambiguous" and "unknown" --
covering the whole corpus. Nothing here may reproduce that, so the first rule of
this module is that a local timestamp with no offset is a *resolved* date.

The chain, first hit wins, recorded in `file.taken_src`:

  1. `exif:DateTimeOriginal`         authoritative local time, offset optional
  2. `exif:CreateDate`, `exif:DateCreated`   same treatment
  3. `filename`                      one validated pattern, see FILENAME_RULE
  4. `mtime`                         min(mtime_ns) across ALL origins for the sha
  5. `none`                          taken_at stays NULL

Steps 1 and 2 are already in the catalog: `adopt_mediavault` wrote them from the
manifest's `capture_time_text`/`capture_time_source`, and this module never
overwrites a row whose `taken_src` starts with `exif:`. That is deliberate --
it keeps `taken_src LIKE 'exif:%'` a *source* column, written by an earlier step
from an earlier input, so the reconciliation identity in `tests/` can recompute
the unresolved count without consulting anything this module wrote.

The one exception runs in the same direction: seven assets hold a capture time
in a spelling step 3's parser could not read, and five of those are now readable
(see `capture_iso`). They are filled in here rather than left to the mtime tier,
which had been publishing a copy date up to 26 years after the capture. Filling
an empty source can only move a file *up* the chain, never down.

Steps 3 and 4 read `origin`, which is the payoff of the one-to-many store: a
file averages 1.72 known paths and one has 1,928, so both tiers get to pick the
best evidence across every copy rather than trusting whichever one was seen.
"""

from __future__ import annotations

import argparse
import collections
import re
import sqlite3
import sys
import time
from datetime import datetime
from pathlib import Path

from photolib import db, migrate
from archive.pipeline.adopt_mediavault import capture_iso, open_manifest
from photolib.config import Config, load

PHOTOS_PREFIX = "G:\\photos\\"

# "before 1990, in the future" -- a capture date outside this window is not a
# capture date, whichever tier produced it.
PLAUSIBLE_FLOOR = datetime(1990, 1, 1)

# Undated photos still have to sort deterministically and keyset paging still has
# to be totally ordered. '-' is U+002D, which collates below '0'..'9', so it
# sorts after every real timestamp under the DESC index; and no ISO-8601
# timestamp is one character long, so it cannot collide with one. Total order
# comes from the index being (sort_key DESC, id DESC) over a primary key.
SORT_KEY_UNDATED = "-"

_DIGITS = re.compile(r"\d+")


def mask(text: str) -> str:
    """Each run of digits as a length-tagged token: `P1080096.RW2` -> `PD7.RWD1`.

    The grouping key behind the pattern enumeration. Applied to the path
    relative to `G:\\photos`, never to the basename alone -- `2019-07-04\\IMG_1234.jpg`
    carries its date in the directory, and basename-only masking loses that
    silently rather than loudly.
    """
    return _DIGITS.sub(lambda m: f"D{len(m.group())}", text)


def relative(path: str) -> str:
    """A path below `G:\\photos`, as the shapes and rules see it."""
    return path[len(PHOTOS_PREFIX):] if path.startswith(PHOTOS_PREFIX) else path


# --- step 3: the filename rule ----------------------------------------------

# `20211206_210201.jpg`, `Screenshot_20190704-123456_Gallery.jpg`. Anchored on
# both sides so a longer digit run cannot masquerade as a date, and the year is
# pinned to 19xx/20xx so a resolution or an order number cannot parse as one.
FILENAME_RULE = re.compile(
    r"(?<!\d)((?:19|20)\d{2})(\d{2})(\d{2})[_\-. ](\d{2})(\d{2})(\d{2})(?!\d)"
)

# Every candidate that lost, kept as data because the reason is the evidence.
# Measured against files that ALSO have EXIF, agreeing to the day. See
# `--validate`, and the docstring of `rule_agreement` for how to reproduce.
#
#   rule            fires  exif-checked  agree   verdict
#   ymd_hms        27,608        27,388  99.6%   ADOPTED (this module's rule)
#   ymd (date only, no time)
#                  27,666        27,388  99.6%   rejected: its 58 marginal hits over
#                                                ymd_hms are stock-photo and web
#                                                names (`20140812-alaska-vacation-15.jpg`)
#                                                where the 8-digit run is an id.
#                                                None has EXIF, so the rule adds
#                                                only unvalidatable hits.
#   dir_dmy_dash   30,293        27,913   0.0%   rejected: `photos-backup-14-03-2023\`
#                                                is the backup date. Fires MORE
#                                                often than the winner and is
#                                                wrong every single time.
#   dir_dmy2       20,736        20,629   0.0%   rejected: `photos-03-04-23\`,
#                                                `10tb win 11-04-24 backup\`,
#                                                `lumix f 7-15-26 sd\` -- backup and
#                                                card-labelling dates.
#   epoch_s         5,405             2   0.0%   rejected: `1000000010.jpg` is an
#                                                Android thumbnail id and
#                                                `Snapchat-1780409551.mp4` an
#                                                object id, not epoch seconds.
#   ymd_dash          413            22  27.3%   rejected: `video_2024-04-14_02-42-57.mp4`
#                                                is a Telegram download date.
#   ymd_hms_sep        57             4   0.0%   rejected: same Telegram names.
#   epoch_ms          113             3   0.0%   rejected: `1592166245999.webm` is a
#                                                message id.
#   dir_ymd_dash       10             0     n/a  rejected: no EXIF-bearing member
#   dir_ymd            50             0     n/a  exists, so neither can be validated.
REJECTED_RULES = (
    ("ymd", "base", re.compile(r"(?<!\d)((?:19|20)\d{2})(\d{2})(\d{2})(?!\d)"),
     lambda m: _at(m[1], m[2], m[3], 12, 0, 0)),
    ("ymd_dash", "base", re.compile(r"(?<!\d)((?:19|20)\d{2})[-_.](\d{2})[-_.](\d{2})(?!\d)"),
     lambda m: _at(m[1], m[2], m[3], 12, 0, 0)),
    ("ymd_hms_sep", "base",
     re.compile(r"(?<!\d)((?:19|20)\d{2})[-_.](\d{2})[-_.](\d{2})[ _T](\d{2})[-_.:](\d{2})[-_.:](\d{2})(?!\d)"),
     lambda m: _at(*m.groups())),
    ("epoch_s", "base", re.compile(r"(?<!\d)(1[0-9]{9})(?!\d)"),
     lambda m: _from_epoch(int(m[1]))),
    ("epoch_ms", "base", re.compile(r"(?<!\d)(1[0-9]{12})(?!\d)"),
     lambda m: _from_epoch(int(m[1]) // 1000)),
    ("dir_ymd_dash", "dir", re.compile(r"(?<!\d)((?:19|20)\d{2})[-_.](\d{2})[-_.](\d{2})(?!\d)"),
     lambda m: _at(m[1], m[2], m[3], 12, 0, 0)),
    ("dir_dmy_dash", "dir", re.compile(r"(?<!\d)(\d{2})[-_.](\d{2})[-_.]((?:19|20)\d{2})(?!\d)"),
     lambda m: _at(m[3], m[2], m[1], 12, 0, 0)),
    ("dir_dmy2", "dir", re.compile(r"(?<!\d)(\d{2})[-_.](\d{2})[-_.](\d{2})(?!\d)"),
     lambda m: _at("20" + m[3], m[2], m[1], 12, 0, 0)),
    ("dir_ymd", "dir", re.compile(r"(?<!\d)((?:19|20)\d{2})(\d{2})(\d{2})(?!\d)"),
     lambda m: _at(m[1], m[2], m[3], 12, 0, 0)),
)


def _at(year, month, day, hour, minute, second) -> datetime | None:
    """A datetime, or None for the digits that only look like a date."""
    try:
        return datetime(int(year), int(month), int(day), int(hour), int(minute), int(second))
    except ValueError:
        return None


def _from_epoch(seconds: int) -> datetime | None:
    try:
        return datetime.fromtimestamp(seconds)
    except (OSError, OverflowError, ValueError):
        return None


def plausible(when: datetime | None, ceiling: datetime) -> bool:
    return when is not None and PLAUSIBLE_FLOOR <= when <= ceiling


def filename_date(rel_path: str, ceiling: datetime) -> datetime | None:
    """The capture time this path's *basename* states, or None.

    Only the basename: every directory-borne pattern in this corpus was measured
    at 0% agreement with EXIF, because the directories that carry dates carry
    the date of the backup that made them.
    """
    match = FILENAME_RULE.search(rel_path.rsplit("\\", 1)[-1])
    if match is None:
        return None
    when = _at(*match.groups())
    return when if plausible(when, ceiling) else None


def mtime_date(mtime_ns: int, ceiling: datetime) -> tuple[datetime, str] | None:
    """A whole-second local timestamp and its UTC offset, or None if implausible.

    Integer division rather than `ns / 1e9`, so the value does not depend on
    float rounding. mtime is an absolute instant, so unlike the tiers above it
    yields a genuine offset: the local reading and that offset together pin it
    exactly.

    `mtime_ns` arrives from a filesystem, so a value the platform cannot convert
    at all is a real input rather than a hypothetical: Windows raises on an
    epoch-zero mtime, and the corpus holds one.
    """
    try:
        aware = datetime.fromtimestamp(mtime_ns // 1_000_000_000).astimezone()
    except (OSError, OverflowError, ValueError):
        return None
    naive = aware.replace(tzinfo=None)
    if not plausible(naive, ceiling):
        return None
    return naive, normalise_offset(aware.strftime("%z"))


def normalise_offset(text: str | None) -> str | None:
    """`+0100`, `+01:00`, `Z` -> `+01:00`, `+01:00`, `+00:00`. None for anything else."""
    if not text:
        return None
    text = text.strip()
    if text in ("Z", "z"):
        return "+00:00"
    match = re.fullmatch(r"([+-])(\d{2}):?(\d{2})", text)
    return f"{match[1]}{match[2]}:{match[3]}" if match else None


def iso(when: datetime) -> str:
    return when.strftime("%Y-%m-%dT%H:%M:%S")


# --- step 1 and 2: the offset v1 threw away ---------------------------------

# `capture_time_text` sometimes carries a trailing offset that `adopt_mediavault`
# dropped for having nowhere to put it, and 3,574 assets carry an explicit
# OffsetTimeOriginal in the exiftool reading. Both are read here, read-only.
_OFFSET_QUERY = """
SELECT asset_id, capture_time_text, capture_time_source, raw_metadata_json
FROM asset_extended_metadata WHERE is_current = 1
"""
_RAW_OFFSET = re.compile(r'"(?:ExifIFD:)?OffsetTime(?:Original|Digitized)?"\s*:\s*"([^"]+)"')


def exif_readings(manifest: sqlite3.Connection) -> tuple[dict[str, str], dict[str, tuple[str, str]]]:
    """The two things step 3 left on the table, read from the manifest read-only.

    Returns `(offsets, recovered)`:

    - `offsets`   sha256 -> normalised UTC offset, for assets that recorded one,
      from the trailing offset on `capture_time_text` or from
      `OffsetTimeOriginal` in the exiftool reading. A regex over the reading
      rather than a JSON parse of 146,034 documents to pick out one optional
      key. Absence is the normal case and stays NULL.
    - `recovered` sha256 -> (ISO local time, tag), for every asset whose
      `capture_time_text` is readable at all. `resolve` applies it only to files
      that have no `exif:` source yet, so in practice it changes exactly the
      rows step 3's narrower parser dropped -- five of the seven non-placeholder
      spellings, which the mtime tier had been dating up to 26 years late. The
      filter lives there rather than here so this function stays a plain read of
      the manifest, and so it can never overwrite an adopted date.
    """
    sha_of = dict(manifest.execute("SELECT asset_id, sha256 FROM assets"))
    offsets: dict[str, str] = {}
    recovered: dict[str, tuple[str, str]] = {}
    for asset_id, capture_text, capture_source, raw in manifest.execute(_OFFSET_QUERY):
        sha256 = sha_of.get(asset_id)
        if sha256 is None:
            continue
        offset = normalise_offset((capture_text or "").strip()[19:])
        if offset is None and raw:
            match = _RAW_OFFSET.search(raw)
            offset = normalise_offset(match[1]) if match else None
        if offset is not None:
            offsets[sha256] = offset
        parsed = capture_iso(capture_text)
        if parsed and capture_source:
            recovered[sha256] = (parsed, capture_source)
    return offsets, recovered


# --- the chain ---------------------------------------------------------------


def evidence(conn: sqlite3.Connection, ceiling: datetime) -> dict[str, tuple]:
    """Per sha256, the best filename date and the earliest mtime across ALL origins.

    One pass over `origin`. The filename tier takes the earliest of the
    candidate dates and the mtime tier the earliest mtime, so both are
    independent of row order and a re-run lands on the same answer.
    """
    best: dict[str, tuple[datetime | None, int | None]] = {}
    for path, sha256, mtime_ns in conn.execute("SELECT path, sha256, mtime_ns FROM origin"):
        if sha256 is None:
            continue
        named = filename_date(relative(path), ceiling)
        prior_named, prior_mtime = best.get(sha256, (None, None))
        if prior_named is not None and (named is None or prior_named < named):
            named = prior_named
        if prior_mtime is not None and (mtime_ns is None or prior_mtime < mtime_ns):
            mtime_ns = prior_mtime
        best[sha256] = (named, mtime_ns)
    return best


_UPDATE = """
UPDATE file SET taken_at = ?, taken_src = ?, taken_offset = ?
WHERE sha256 = ? AND (taken_src IS NULL OR taken_src NOT LIKE 'exif:%')
"""


def resolve(
    conn: sqlite3.Connection,
    *,
    offsets: dict[str, str] | None = None,
    recovered: dict[str, tuple[str, str]] | None = None,
    ceiling: datetime | None = None,
) -> collections.Counter:
    """Run the chain over every `file` row. Returns the tally.

    Rows already carrying an `exif:` source are left exactly as adopted; only
    their offset is filled in, which is additive and cannot unresolve a date.

    **This does not write `photo`, and used to.** It ran `DELETE FROM photo`
    followed by `INSERT ... SELECT sha256 FROM file` with no `WHERE` clause, so
    it put one tile in the grid for every distinct byte sequence in the catalog.
    That was merely wrong-by-a-predicate while `file` held only MediaVault's
    146,034 assets, and it is a grid full of `.pyc` files now that `file` holds
    787,798. Phase 5 owns `photo`: a tile is a *group* of triage-kept files, which
    is a shape this function has no way to produce and no business overwriting.
    Run `python -m archive.pipeline.group` after this.
    """
    ceiling = ceiling or datetime.now()
    offsets = offsets or {}
    recovered = recovered or {}
    found = evidence(conn, ceiling)
    counts: collections.Counter = collections.Counter()

    conn.execute("BEGIN")
    for sha256, taken_at, taken_src in conn.execute(
        "SELECT sha256, taken_at, taken_src FROM file"
    ).fetchall():
        if taken_src and taken_src.startswith("exif:") and taken_at:
            counts[taken_src] += 1
            conn.execute(
                "UPDATE file SET taken_offset = ? WHERE sha256 = ?", (offsets.get(sha256), sha256)
            )
            continue
        named, mtime_ns = found.get(sha256, (None, None))
        if (reading := recovered.get(sha256)) is not None:
            resolved, source, offset = reading[0], f"exif:{reading[1]}", offsets.get(sha256)
        elif named is not None:
            resolved, source, offset = iso(named), "filename", None
        elif mtime_ns is not None and (stamped := mtime_date(mtime_ns, ceiling)):
            resolved, source, offset = iso(stamped[0]), "mtime", stamped[1]
        else:
            resolved, source, offset = None, "none", None
        counts[source] += 1
        conn.execute(_UPDATE, (resolved, source, offset, sha256))
    conn.execute("COMMIT")
    return counts


# --- the numbers this step has to show --------------------------------------


def coverage(conn: sqlite3.Connection) -> list[tuple[str, int]]:
    """Rows per `taken_src`, as written."""
    return conn.execute(
        "SELECT coalesce(taken_src, '(null)'), count(*) FROM file GROUP BY 1 ORDER BY 2 DESC"
    ).fetchall()


# The other half of the reconciliation identity. Computed from the SOURCE
# columns -- `taken_src LIKE 'exif:%'` as written by `adopt_mediavault` from the
# manifest, `origin.path`, `origin.mtime_ns` -- and never from `photo`. v1
# reported 113,718 unknown against 107,267 with no source and never compared the
# two; holding both halves makes that divergence arithmetic rather than luck.
def unresolvable(conn: sqlite3.Connection, ceiling: datetime | None = None) -> int:
    """Files with no date source available at all, from the inputs alone."""
    ceiling = ceiling or datetime.now()
    has_exif = {
        row[0]
        for row in conn.execute(
            "SELECT sha256 FROM file WHERE taken_src LIKE 'exif:%' AND taken_at IS NOT NULL"
        )
    }
    dated = set(has_exif)
    for path, sha256, mtime_ns in conn.execute("SELECT path, sha256, mtime_ns FROM origin"):
        if sha256 is None or sha256 in dated:
            continue
        if filename_date(relative(path), ceiling) is not None:
            dated.add(sha256)
        elif mtime_ns is not None and mtime_date(mtime_ns, ceiling) is not None:
            dated.add(sha256)
    total = conn.execute("SELECT count(*) FROM file").fetchone()[0]
    return total - len(dated)


def shapes(conn: sqlite3.Connection) -> collections.Counter:
    """Every origin path masked and grouped. The counts sum to the row count."""
    counted: collections.Counter = collections.Counter()
    for (path,) in conn.execute("SELECT path FROM origin"):
        counted[mask(relative(path))] += 1
    return counted


def rule_agreement(conn: sqlite3.Connection, ceiling: datetime | None = None) -> list[tuple]:
    """Per candidate rule: fires, fires on an EXIF-bearing file, and agreement.

    Agreement is to the day against `DateTimeOriginal`, which is what decides
    whether a digit run is a capture date or an export date. The adopted rule is
    scored by the same query as the rejected ones.
    """
    ceiling = ceiling or datetime.now()
    truth = dict(
        conn.execute(
            "SELECT sha256, taken_at FROM file WHERE taken_src LIKE 'exif:%' AND taken_at IS NOT NULL"
        )
    )
    candidates = (
        ("ymd_hms (ADOPTED)", "base", FILENAME_RULE, lambda m: _at(*m.groups())),
        *REJECTED_RULES,
    )
    fires: collections.Counter = collections.Counter()
    checked: collections.Counter = collections.Counter()
    agrees: collections.Counter = collections.Counter()
    for path, sha256 in conn.execute("SELECT path, sha256 FROM origin"):
        rel = relative(path)
        basename = rel.rsplit("\\", 1)[-1]
        directory = rel[: len(rel) - len(basename)]
        for name, scope, pattern, build in candidates:
            match = pattern.search(basename if scope == "base" else directory)
            if match is None:
                continue
            when = build(match)
            if not plausible(when, ceiling):
                continue
            fires[name] += 1
            actual = truth.get(sha256)
            if actual is None:
                continue
            checked[name] += 1
            agrees[name] += when.strftime("%Y-%m-%d") == actual[:10]
    return [
        (name, fires[name], checked[name], agrees[name])
        for name, *_ in candidates
    ]


def _print_coverage(conn: sqlite3.Connection) -> None:
    rows = coverage(conn)
    total = conn.execute("SELECT count(*) FROM file").fetchone()[0]
    print(f"\n{'taken_src':<24}{'files':>10}  {'share':>7}")
    for source, count in rows:
        print(f"{source:<24}{count:>10,}  {count / total * 100:6.2f}%")
    print(f"{'-' * 24}{'-' * 10}")
    print(f"{'sum':<24}{sum(c for _, c in rows):>10,}   of {total:,} file rows")
    dated = conn.execute("SELECT count(*) FROM file WHERE taken_at IS NOT NULL").fetchone()[0]
    print(f"{'dated':<24}{dated:>10,}  {dated / total * 100:6.2f}%")
    offsets = conn.execute("SELECT count(*) FROM file WHERE taken_offset IS NOT NULL").fetchone()[0]
    print(f"{'with a UTC offset':<24}{offsets:>10,}  {offsets / total * 100:6.2f}%  (never required)")


def _print_validation(conn: sqlite3.Connection, ceiling: datetime, top: int) -> None:
    counted = shapes(conn)
    rows = conn.execute("SELECT count(*) FROM origin").fetchone()[0]
    summed = sum(counted.values())
    print(f"\nmasked shapes over `origin`")
    print(f"  origin rows        {rows:,}")
    print(f"  distinct shapes    {len(counted):,}")
    print(f"  counts sum to      {summed:,}   identical to the row count: {summed == rows}")
    for cutoff in (50, 100, 500, 1000):
        covered = sum(n for _, n in counted.most_common(cutoff))
        print(
            f"  top {cutoff:<5}          {covered:>9,} paths ({covered / summed * 100:5.2f}%), "
            f"below the cutoff {summed - covered:,} ({(summed - covered) / summed * 100:.2f}%)"
        )
    print(f"\n  top {top} shapes")
    for shape, count in counted.most_common(top):
        print(f"  {count:>8,}  {shape[:100]}")

    print(f"\ncandidate rules, agreement measured to the day against EXIF")
    print(f"  {'rule':<20}{'fires':>9}{'exif-checked':>14}{'agree':>9}{'rate':>9}")
    for name, fires, checked, agrees in rule_agreement(conn, ceiling):
        rate = f"{agrees / checked * 100:7.1f}%" if checked else "    n/a"
        print(f"  {name:<20}{fires:>9,}{checked:>14,}{agrees:>9,}{rate:>9}")


def run(
    config: Config | None = None,
    *,
    validate: bool = False,
    top: int = 25,
    catalog_db: Path | None = None,
    state_db: Path | None = None,
) -> int:
    config = config or load()
    conn = db.connect(catalog_db, state_db)
    try:
        if migrate.version(conn) < 3:
            raise SystemExit("catalog is behind; run python -m photolib.migrate first")
        ceiling = datetime.now()

        started = time.perf_counter()
        manifest = open_manifest(config.mediavault_manifest_db)
        try:
            offsets, recovered = exif_readings(manifest)
        finally:
            manifest.close()
        print(
            f"manifest  {len(offsets):,} assets recorded a UTC offset, "
            f"{len(recovered):,} capture times readable "
            f"({time.perf_counter() - started:.0f}s, read-only)"
        )

        started = time.perf_counter()
        counts = resolve(conn, offsets=offsets, recovered=recovered, ceiling=ceiling)
        print(f"resolve   {sum(counts.values()):,} files in {time.perf_counter() - started:.0f}s")
        _print_coverage(conn)

        undated = conn.execute("SELECT count(*) FROM file WHERE taken_at IS NULL").fetchone()[0]
        print(
            f"\nsort_key  {undated:,} files will land on the {SORT_KEY_UNDATED!r} sentinel"
            "\n          `photo` is not written here -- run python -m archive.pipeline.group"
        )

        if validate:
            _print_validation(conn, ceiling, top)
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--validate",
        action="store_true",
        help="also print the masked-shape enumeration and per-rule EXIF agreement",
    )
    parser.add_argument("--top", type=int, default=25, help="shapes to list under --validate")
    args = parser.parse_args()
    sys.exit(run(validate=args.validate, top=args.top))
