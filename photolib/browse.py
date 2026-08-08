"""What the grid can be filtered and sorted by, and the SQL that does it.

This is the vocabulary the header offers, and it is deliberately bounded by what
the catalog actually holds *today* rather than by what the schema permits. Every
dimension below was measured against the real 24,536-tile set before it was
added; nothing here filters on a column that is null for the whole corpus.
`file.dims_src` is the one that did not make it -- 0 of 24,536 tiles carry it, so
a "how were the dimensions obtained" facet would be a menu with one empty entry.

Two properties are load-bearing and both are about cost:

  * every filter leaves the default sort on the `photo_sort` index, so a filtered
    page terminates early instead of sorting the library. Measured: 9-15 ms for a
    page under most filters, 100-152 ms for the two that carry a subquery
    (`root`, `grade`), and ~430 ms in the worst case, which is a selection narrow
    enough that the index has to be walked to its end to fill one page.
  * `total` costs a full count -- 230-400 ms, because it has to visit every tile
    whatever the filter is -- so it is memoised per filter set by the caller and
    never recomputed per page. See `GridServer.total`.

An alternate sort cannot use the index and pays ~230-290 ms per page to sort
24,536 rows. That is the honest price of "largest first" against this schema and
it is charged only when such a sort is chosen.

Stacking is the third dimension of cost and the only one that changes how many
rows a page holds: a run of consecutive captures from one camera within `stack`
seconds is drawn as one tile. It is a grouping over the *filtered* set, so a
filter that removes a member splits its stack in two, and nothing is stored --
see `docs/adr/0001-stack-on-capture-time-not-phash.md` for why this is capture
time and not the perceptual hash. `assignment_sql` is the whole grouping in one
pass, ~380 ms, and only the eight sorts that cannot stream ever run it. The two
default sorts never do: their runs are contiguous in `photo_sort` order, so
`page_sql` carries the three extra columns a reader needs to collapse them as it
streams, and a stacked page stays a keyset page. Which member a stack is *drawn*
as is `cover`, and it is a different question from where the stack sits in the
ordering: it is the sharpest frame of the middle-exposure third, computed in
Python over readings that only the page's own members are ever read for.

The vocabulary itself is served from `facets`, one pass over the tile set at
startup, so the header can only ever offer a value that exists and can show what
each one would yield.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, replace

# The three scalars that live inside `file.quality` as JSON rather than in a
# column of their own. json1 is compiled into the stdlib's SQLite (3.50.4 here),
# and extracting one costs ~50 ms over the tile set on top of the row read --
# acceptable for a filter, which is why `grade` and `res` exist at all.
QUALITY = "json_extract(f.quality, '$.composite_quality')"
SHARPNESS = "json_extract(f.quality, '$.sharpness')"
RESOLUTION = "json_extract(f.quality, '$.resolution_class')"

# The fourth reading, and the only one that is not a scalar: 16 bins over the
# 0-1 luma, each holding the fraction of the frame that fell in it, written by
# `archive/pipeline/features.py`. It comes back as JSON text and `mean_luminance`
# turns it into the one number the cover rule ranks on. Phase 2b kept no mean of
# its own -- `underexposure` is clamped at mid grey, so every frame brighter than
# that reads 0 and a bracket's top two frames are indistinguishable by it.
LUMINANCE = "json_extract(f.quality, '$.luminance_histogram')"

# What a NULL sorts as, so that a sort key is never NULL and a keyset cursor can
# always compare against it. Below every real value in both cases: quality runs
# -1.0..0.60 and sharpness 0.0..1.24, and a pixel count is never negative.
NULL_NUMBER = -1e9

# Bounds on a request rather than on the data. A dimension nobody could select 64
# distinct values of from a menu of 17 is a request that was not built by the
# header, and a 4 KB camera name is not a camera name. Both are size budgets: the
# values reach SQLite as bound parameters, never as SQL text.
MAX_VALUES = 64
MAX_VALUE_CHARS = 200

# The stacking window, in whole seconds. Bounds on the request: a slider with
# ten stops cannot send 0 or 47. Which of the ten it opens on is the header's to
# decide and nothing here reads it, so the default is not written down yet.
MIN_WINDOW = 1
MAX_WINDOW = 10


class BadFilter(ValueError):
    """A malformed filter or sort. `field` names it, and never echoes the value."""

    def __init__(self, field: str) -> None:
        super().__init__(field)
        self.field = field


# --------------------------------------------------------------------------
# sorts


@dataclass(frozen=True)
class Sort:
    """One ordering, as a keyset-pageable (key, id) pair.

    `key` is the SQL expression the rows order by; it must never evaluate to
    NULL, because the cursor comparison `(key, id) < (?, ?)` is unknown against
    one and the page would silently end early. `cursor` says how to validate the
    key coming back from the client, which is a size and type budget and not
    injection defence -- it is bound, not interpolated.

    `indexed` records that this ordering is `photo_sort`'s own, which is the
    difference between a 9 ms page and a 230 ms one. It is asserted in the tests
    rather than trusted.
    """

    key: str
    descending: bool
    cursor: str  # time | int | real
    label: str
    indexed: bool = False


SORTS: dict[str, Sort] = {
    # The two the index gives away for free.
    "newest": Sort("p.sort_key", True, "time", "Newest first", indexed=True),
    "oldest": Sort("p.sort_key", False, "time", "Oldest first", indexed=True),
    # Bytes. NOT NULL in the schema, so no coalesce is needed.
    "largest": Sort("f.size", True, "int", "Largest file"),
    "smallest": Sort("f.size", False, "int", "Smallest file"),
    # Pixel count. 22 of 24,536 tiles have no dimensions and sort last either way.
    "biggest": Sort(f"coalesce(f.width * f.height, {NULL_NUMBER})", True, "real", "Most pixels"),
    "tiniest": Sort(f"coalesce(f.width * f.height, {NULL_NUMBER})", False, "real", "Fewest pixels"),
    # Phase 2b's composite quality scalar, and the sharpness that feeds it.
    "best": Sort(f"coalesce({QUALITY}, {NULL_NUMBER})", True, "real", "Best quality"),
    "worst": Sort(f"coalesce({QUALITY}, {NULL_NUMBER})", False, "real", "Worst quality"),
    "sharpest": Sort(f"coalesce({SHARPNESS}, {NULL_NUMBER})", True, "real", "Sharpest"),
    "softest": Sort(f"coalesce({SHARPNESS}, {NULL_NUMBER})", False, "real", "Softest"),
}

DEFAULT_SORT = "newest"

# A cursor key, per sort. The time pattern is the original one: an ISO timestamp
# and the '-' sentinel undated photos sort on, and nothing else.
_CURSOR_TIME = re.compile(r"^[0-9T:+.Z-]{1,32}$")
_CURSOR_INT = re.compile(r"^-?[0-9]{1,19}$")
_CURSOR_REAL = re.compile(r"^-?[0-9]{1,19}(\.[0-9]{1,10})?(e[+-]?[0-9]{1,3})?$")


def parse_sort(values: list[str]) -> str:
    """The selected sort's name. Unknown is a 400, not a silent fall back to the
    default -- an ordering nobody asked for looks like a bug in the client."""
    if not values:
        return DEFAULT_SORT
    name = values[-1]
    if name not in SORTS:
        raise BadFilter("sort")
    return name


def parse_cursor(sort: Sort, before: list[str], before_id: list[str]):
    """The keyset cursor, or None for the first page.

    Both halves or neither: a half cursor has no defensible interpretation. The
    key half is validated against the *selected* sort, so a numeric cursor
    cannot be handed to a timestamp ordering -- SQLite would compare an integer
    against text by storage class and page through nothing.
    """
    if not before and not before_id:
        return None
    if not before or not before_id:
        raise BadFilter("cursor")
    key, identifier = before[-1], before_id[-1]
    if not _CURSOR_INT.match(identifier):
        raise BadFilter("cursor")
    if sort.cursor == "time":
        if not _CURSOR_TIME.match(key):
            raise BadFilter("cursor")
        return key, int(identifier)
    if sort.cursor == "int":
        if not _CURSOR_INT.match(key):
            raise BadFilter("cursor")
        return int(key), int(identifier)
    if not _CURSOR_REAL.match(key.lower()):
        raise BadFilter("cursor")
    return float(key), int(identifier)


# --------------------------------------------------------------------------
# filters

# The categorical dimensions whose vocabulary is fixed here rather than read from
# the corpus, each mapping one token to one SQL term. Anything not in the mapping
# is a 400 naming the dimension: these are enumerations, so an unknown token is a
# malformed request rather than a selection that happens to match nothing.
#
# Byte and quality bands are ranges over a continuum, cut where the measured
# distribution actually has structure -- the quality bands are the p25/p50/p90 of
# `composite_quality` over this corpus (0.061 / 0.151 / 0.301), so each says
# something about the library rather than about a number somebody liked.
ENUMS: dict[str, dict[str, str]] = {
    "orient": {
        "landscape": "f.width > f.height",
        "portrait": "f.width < f.height",
        "square": "f.width = f.height",
        # 22 tiles. Named so they are reachable, since no other filter finds them.
        "unknown": "f.width IS NULL OR f.height IS NULL",
    },
    "res": {
        name: f"{RESOLUTION} = '{name}'"
        for name in ("huge", "large", "medium", "small", "icon")
    },
    "size": {
        "under1mb": "f.size < 1048576",
        "1to5mb": "f.size >= 1048576 AND f.size < 5242880",
        "5to20mb": "f.size >= 5242880 AND f.size < 20971520",
        "20to100mb": "f.size >= 20971520 AND f.size < 104857600",
        "over100mb": "f.size >= 104857600",
    },
    "grade": {
        "best": f"{QUALITY} >= 0.30",
        "good": f"{QUALITY} >= 0.15 AND {QUALITY} < 0.30",
        "fair": f"{QUALITY} >= 0.06 AND {QUALITY} < 0.15",
        "poor": f"{QUALITY} < 0.06",
        # Phase 2b persists a failure as {"error": ...}, so these have a quality
        # row and no scalar in it. 23 tiles.
        "unscored": f"{QUALITY} IS NULL",
    },
    "gps": {
        "yes": "f.gps_lat IS NOT NULL AND f.gps_lon IS NOT NULL",
        "no": "f.gps_lat IS NULL OR f.gps_lon IS NULL",
    },
    # Phase 5 collapsed 13,840 RAW+JPEG pairs into one tile each. Which side of
    # that a tile is on is a property of the group, so it is counted, not joined.
    "pair": {
        "pair": "(SELECT count(*) FROM photo_member m WHERE m.photo_id = p.id) > 1",
        "single": "(SELECT count(*) FROM photo_member m WHERE m.photo_id = p.id) = 1",
    },
    # `near_dup` collapses nothing -- see migration 007. This is the only way to
    # see it from the grid, and it reads the tile's representative alone: a
    # pair's RAW half having a neighbour is not the same claim.
    "dup": {
        "dup": "EXISTS (SELECT 1 FROM near_dup nd WHERE nd.sha256 = f.sha256)",
        "unique": "NOT EXISTS (SELECT 1 FROM near_dup nd WHERE nd.sha256 = f.sha256)",
    },
    # How `capture_time` decided the date, grouped: which EXIF tag it came from
    # is a detail, whether it came from EXIF at all is not. A filename or mtime
    # date is a guess about when the photograph was taken.
    "dated": {
        "exif": "substr(f.taken_src, 1, 5) = 'exif:'",
        "filename": "f.taken_src = 'filename'",
        "mtime": "f.taken_src = 'mtime'",
    },
}

# Dimensions whose vocabulary IS the data. The header only ever offers values
# `facets` found, so no list of camera names is written down anywhere -- an
# unrecognised value here selects nothing rather than being refused, because it
# is a value and not a token.
#
# The empty string means different things in different columns and both are what
# the data says: `file.ext` genuinely holds '' for the 4 tiles whose object has
# no extension, while `camera` and `lens` are NULL when no EXIF recorded one.
COLUMNS: dict[str, str] = {"ext": "f.ext", "camera": "f.camera", "lens": "f.lens"}
NULLABLE = frozenset({"camera", "lens"})

_YEAR = re.compile(r"^[0-9]{4}$")
_WINDOW = re.compile(r"^[0-9]{1,2}$")


def parse_stack(values: list[str]) -> int | None:
    """The stacking window in seconds, or None when stacking is off.

    Refused rather than clamped, and by name rather than by value: a window
    outside 1-10 was not sent by the slider, so it is a malformed request in the
    same sense as an unknown `orient` token.
    """
    if not values:
        return None
    raw = values[-1]
    if not _WINDOW.match(raw):
        raise BadFilter("stack")
    window = int(raw)
    if not MIN_WINDOW <= window <= MAX_WINDOW:
        raise BadFilter("stack")
    return window


@dataclass(frozen=True)
class Query:
    """A validated selection. Hashable, so the caller can memoise a count on it."""

    kinds: tuple[str, ...]
    enums: tuple[tuple[str, tuple[str, ...]], ...]
    columns: tuple[tuple[str, tuple[str, ...]], ...]
    years: tuple[str, ...]
    months: tuple[int, ...]
    roots: tuple[str, ...]
    sort: str
    stack: int | None = None

    @property
    def ordering(self) -> Sort:
        return SORTS[self.sort]

    def unstacked(self) -> Query:
        """The same selection with stacking off.

        `total` counts tiles and a window cannot change how many there are, so
        the two windows of one selection share one count rather than paying
        230-400 ms each time the slider moves.
        """
        return self if self.stack is None else replace(self, stack=None)

    def grouping(self) -> Query:
        """The same selection reduced to what decides how it stacks.

        Runs are formed per camera in capture order, so the sort the reader is
        looking at changes which cover a stack shows and never how many stacks
        there are. Dropping the sort is what lets the count survive a change of
        ordering instead of paying ~410 ms again for the number already on
        screen.
        """
        return self if self.sort == DEFAULT_SORT else replace(self, sort=DEFAULT_SORT)


def _tokens(field: str, values: list[str], *, split: bool) -> tuple[str, ...]:
    """The distinct values a repeated query parameter selects.

    Repeated parameters are the form (`camera=a&camera=b`), because a value can
    contain anything. `split` additionally accepts the comma-joined form, and is
    on only for the fixed vocabularies, whose tokens are known not to contain
    one -- `kind` has taken that form since the first commit.
    """
    raw = [part for value in values for part in (value.split(",") if split else [value])]
    if len(raw) > MAX_VALUES:
        raise BadFilter(field)
    if any(len(value) > MAX_VALUE_CHARS for value in raw):
        raise BadFilter(field)
    return tuple(dict.fromkeys(raw))


def parse(params: dict[str, list[str]], *, kinds: tuple[str, ...]) -> Query:
    """The whole selection, validated. `kinds` comes from the existing parser."""
    enums = []
    for field, vocabulary in ENUMS.items():
        selected = _tokens(field, params.get(field, []), split=True)
        if not selected:
            continue
        if any(token not in vocabulary for token in selected):
            raise BadFilter(field)
        enums.append((field, tuple(sorted(selected))))

    columns = []
    for field in COLUMNS:
        selected = _tokens(field, params.get(field, []), split=False)
        if selected:
            columns.append((field, tuple(sorted(selected))))

    years = _tokens("year", params.get("year", []), split=True)
    if any(not _YEAR.match(value) for value in years):
        raise BadFilter("year")

    raw_months = _tokens("month", params.get("month", []), split=True)
    if any(not value.isdigit() or not 1 <= int(value) <= 12 for value in raw_months):
        raise BadFilter("month")

    return Query(
        kinds=kinds,
        enums=tuple(enums),
        columns=tuple(columns),
        years=tuple(sorted(years)),
        months=tuple(sorted({int(value) for value in raw_months})),
        roots=_tokens("root", params.get("root", []), split=False),
        sort=parse_sort(params.get("sort", [])),
        stack=parse_stack(params.get("stack", [])),
    )


def _placeholders(count: int) -> str:
    return ", ".join("?" * count)


def _direction(sort: Sort) -> str:
    return "DESC" if sort.descending else "ASC"


def where(query: Query) -> tuple[list[str], list]:
    """The WHERE terms and their bound parameters.

    One AND per dimension, one OR within it: ticking two cameras widens, ticking
    a camera and a year narrows. No token from the request reaches the SQL text --
    the enum terms are looked up by key in a dict written above, and every value
    is bound.
    """
    terms: list[str] = [f"f.kind IN ({_placeholders(len(query.kinds))})"]
    params: list = list(query.kinds)

    for field, selected in query.enums:
        vocabulary = ENUMS[field]
        terms.append(" OR ".join(f"({vocabulary[token]})" for token in selected))

    for field, selected in query.columns:
        column = COLUMNS[field]
        values = [value for value in selected if not (value == "" and field in NULLABLE)]
        parts = []
        if values:
            parts.append(f"{column} IN ({_placeholders(len(values))})")
            params += values
        if len(values) != len(selected):
            parts.append(f"{column} IS NULL")
        terms.append(" OR ".join(parts))

    if query.years:
        terms.append(f"substr(p.sort_key, 1, 4) IN ({_placeholders(len(query.years))})")
        params += list(query.years)

    if query.months:
        # `sort_key` is the capture timestamp, so the month is a substring of it.
        # cast rather than comparing '07' as text, so the client can send 7.
        terms.append(
            "cast(substr(p.sort_key, 6, 2) AS INTEGER) IN "
            f"({_placeholders(len(query.months))})"
        )
        params += list(query.months)

    if query.roots:
        # The representative's own paths. A source root holding only the RAW half
        # of a pair is not reported, which is why the facet counts come from the
        # same expression -- the menu and the filter agree by construction.
        terms.append(
            "EXISTS (SELECT 1 FROM origin o WHERE o.sha256 = f.sha256 "
            f"AND o.root IN ({_placeholders(len(query.roots))}))"
        )
        params += list(query.roots)

    return terms, params


# Where a tile sits in time, and whether it may stack at all. `capture_time`
# writes whole seconds, so `unixepoch` is exact where the spec's
# `julianday(...) * 86400.0` carries ~2e-5 s of float noise: it reads a gap of
# exactly four seconds as 4.0000185, which is over a window of 4 and would drop
# the commonest bracket interval there is. A tile fails the stackable test two
# ways -- a date `capture_time` guessed from mtime or from a filename, because a
# copy date is not when the photograph was taken, and the '-' sentinel an
# undated photo sorts on, which `unixepoch` returns NULL for.
_SECONDS = "unixepoch(p.sort_key)"
_STACKABLE = f"substr(f.taken_src, 1, 5) = 'exif:' AND {_SECONDS} IS NOT NULL"

# Where the caller finds each column of a `page_sql` row. The first six are the
# page itself; stacking appends three more, and reading them by position is how
# a column added in the middle would break the collapse silently.
KEY, CAMERA, SECONDS, STACKABLE = 5, 6, 7, 8

# Every selected tile with a 1 where a new stack starts. Runs are per camera in
# capture order, and the tiles the window excludes sit in a partition of their
# own -- so an mtime-dated frame chronologically inside a burst is its own stack
# and cannot split the burst around it. `IS` rather than `=` on the camera
# because two frames from a body that recorded no name are still consecutive
# captures from one camera as far as this grouping can tell.
_ASSIGNMENT = """WITH selected AS (
  SELECT p.id AS id, {key} AS k, p.sort_key AS sk, f.camera AS cam,
         CASE WHEN {stackable} THEN 1 ELSE 0 END AS ok,
         {seconds} AS secs
  FROM photo AS p
  JOIN file AS f ON f.sha256 = p.rep_sha256
  WHERE {terms}
),
marked AS (
  SELECT id, k, ok, cam, sk,
         CASE WHEN ok = 1 AND cam IS lag(cam) OVER w
                        AND secs - lag(secs) OVER w <= ?
              THEN 0 ELSE 1 END AS starts
  FROM selected
  WINDOW w AS (PARTITION BY ok ORDER BY cam, sk, id)
)"""


def _assignment(query: Query) -> tuple[str, list]:
    """The `marked` CTE and its parameters. The window binds last."""
    terms, params = where(query)
    sql = _ASSIGNMENT.format(
        key=query.ordering.key,
        stackable=_STACKABLE,
        seconds=_SECONDS,
        terms=" AND ".join(f"({term})" for term in terms),
    )
    return sql, [*params, query.stack]


def page_sql(query: Query, cursor) -> tuple[str, list]:
    """The page query and its parameters, minus the LIMIT value.

    With stacking on the page carries three more columns per row: the camera,
    where the tile sits in time, and whether it may stack at all. Position and
    stackability are separate because they answer different questions — a tile
    an mtime date excluded from stacking still has a place in the ordering, and
    the caller needs that place to know when it has read past the end of every
    open run. They are what lets a stacked page on a default sort stay a keyset
    page on `photo_sort` instead of a ~380 ms grouping pass.
    """
    sort = query.ordering
    terms, params = where(query)
    direction = _direction(sort)
    if cursor is not None:
        comparison = "<" if sort.descending else ">"
        terms.append(f"({sort.key}, p.id) {comparison} (?, ?)")
        params += [cursor[0], cursor[1]]
    columns = f"p.id, f.sha256, f.width, f.height, f.thumbhash, {sort.key}"
    if query.stack is not None:
        columns += (
            f", f.camera, {_SECONDS}, CASE WHEN {_STACKABLE} THEN 1 ELSE 0 END"
        )
    sql = (
        f"SELECT {columns}\n"
        "FROM photo AS p\n"
        "JOIN file AS f ON f.sha256 = p.rep_sha256\n"
        f"WHERE {' AND '.join(f'({term})' for term in terms)}\n"
        f"ORDER BY {sort.key} {direction}, p.id {direction}\n"
        "LIMIT ?"
    )
    return sql, params


def count_sql(query: Query) -> tuple[str, list]:
    """How many tiles the whole selection has. 230-400 ms; memoise it."""
    terms, params = where(query)
    return (
        "SELECT count(*) FROM photo AS p JOIN file AS f ON f.sha256 = p.rep_sha256 "
        f"WHERE {' AND '.join(f'({term})' for term in terms)}",
        params,
    )


def stack_count_sql(query: Query) -> tuple[str, list]:
    """How many stacks the whole selection collapses to. ~410 ms; memoise it.

    `starts` is 1 exactly where a new stack begins, so summing it counts them
    without materialising one. The two default sorts collapse their own runs as
    they page and so never build an assignment, but the count pane still has to
    say what stacking did to the whole selection rather than to the page in
    front of it — this is that number, and the only grouping pass those two
    sorts pay for.
    """
    sql, params = _assignment(query)
    return f"{sql}\nSELECT coalesce(sum(starts), 0) FROM marked", params


def assignment_sql(query: Query) -> tuple[str, list]:
    """Every selected tile as `(id, sort key, stack)`, in the page's own order.

    The eight non-time sorts need this: their stacks' members are not adjacent,
    so there is no run to collapse while streaming and the whole assignment has
    to exist before the first page can name its first cover. ~380 ms unfiltered;
    memoise it per selection. The two default sorts never run it: they collapse
    their own runs as they page, which is what keeps a stacked page a page.
    """
    sql, params = _assignment(query)
    direction = _direction(query.ordering)
    return (
        f"{sql},\n"
        "assigned AS (\n"
        "  SELECT id, k, sum(starts) OVER (ORDER BY ok, cam, sk, id\n"
        "                                  ROWS UNBOUNDED PRECEDING) AS stack\n"
        "  FROM marked\n"
        ")\n"
        f"SELECT id, k, stack FROM assigned ORDER BY k {direction}, id {direction}",
        params,
    )


# --------------------------------------------------------------------------
# the cover


def mean_luminance(histogram: str | None) -> float | None:
    """How bright a frame is, from the 16-bin histogram Phase 2b stored.

    The bins are equal cuts of the 0-1 luma and each holds the fraction of the
    frame that fell in it, so the mean is the centre of mass over the bin
    midpoints. None where the quality pass never ran or failed -- a failure is
    persisted as `{"error": ...}`, so `json_extract` returns NULL for both, and
    a frame with no exposure reading cannot be ranked by one.
    """
    if histogram is None:
        return None
    bins = json.loads(histogram)
    return sum(share * (index + 0.5) / len(bins) for index, share in enumerate(bins))


def cover(members: list[tuple[int, float | None, float | None]]) -> int:
    """Which member a closed stack is drawn as, from `(id, luminance, sharpness)`.

    The sharpest frame of the middle-exposure third. Rank the members by mean
    luminance, take the middle third rounded up to at least one, and take the
    sharpest of those. The library is mostly three-frame bracketing, and the
    middle exposure is the one that was aimed -- so the frame worth looking at
    is the best-focused frame of the metered exposure, not the brightest and not
    whichever one the ordering happened to reach first.

    The band widens to every member sharing its edge exposures, which is what
    makes a constant-exposure burst degrade to plain sharpest: frames that all
    read the same brightness are one band, and the rule reduces to
    `max(sharpness)` over the whole stack. A stack of two and a stack of one
    fall out of the same arithmetic and need no case of their own.

    A member missing either reading cannot be ranked and so cannot win. When no
    member has both, the stack is drawn as the first member in the page's own
    order -- which is what `members` is in, and which is also how a tie in
    sharpness is settled.
    """
    ranked = sorted(
        (member for member in members if member[1] is not None and member[2] is not None),
        key=lambda member: member[1],
    )
    if not ranked:
        return members[0][0]
    width = -(-len(ranked) // 3)  # the middle third, rounded up
    start = (len(ranked) - width) // 2
    band = ranked[start:start + width]
    low, high = band[0][1], band[-1][1]
    order = {member[0]: index for index, member in enumerate(members)}
    return max(
        (member for member in ranked if low <= member[1] <= high),
        key=lambda member: (member[2], -order[member[0]]),
    )[0]


# --------------------------------------------------------------------------
# the vocabulary


# Which dimensions are ordered by count and which keep a meaningful order of
# their own. A resolution class or a quality band read wrong sorted by size.
_ORDERED = {
    "res": ("huge", "large", "medium", "small", "icon"),
    "size": ("over100mb", "20to100mb", "5to20mb", "1to5mb", "under1mb"),
    "grade": ("best", "good", "fair", "poor", "unscored"),
    "gps": ("yes", "no"),
    "pair": ("pair", "single"),
    "dup": ("dup", "unique"),
    "dated": ("exif", "filename", "mtime"),
    "orient": ("landscape", "portrait", "square", "unknown"),
}

LABELS: dict[str, dict[str, str]] = {
    "kind": {"image": "Photos", "raw_image": "RAW", "video": "Video"},
    "orient": {
        "landscape": "Landscape",
        "portrait": "Portrait",
        "square": "Square",
        "unknown": "Unmeasured",
    },
    "res": {
        "huge": "Huge",
        "large": "Large",
        "medium": "Medium",
        "small": "Small",
        "icon": "Icon",
    },
    "size": {
        "under1mb": "under 1 MB",
        "1to5mb": "1 – 5 MB",
        "5to20mb": "5 – 20 MB",
        "20to100mb": "20 – 100 MB",
        "over100mb": "over 100 MB",
    },
    "grade": {
        "best": "Best",
        "good": "Good",
        "fair": "Fair",
        "poor": "Poor",
        "unscored": "Unscored",
    },
    "gps": {"yes": "Has location", "no": "No location"},
    "pair": {"pair": "RAW + JPEG", "single": "Single file"},
    "dup": {"dup": "Has an identical frame", "unique": "Unique"},
    "dated": {"exif": "From EXIF", "filename": "From filename", "mtime": "From file date"},
}

# What each dimension is called, and where it needs a sentence. Both live here
# rather than in the client so that the whole vocabulary is one thing: adding a
# dimension is a change to this module and to nothing else, and the header
# renders whatever it is handed.
TITLES: dict[str, str] = {
    "kind": "Media",
    "year": "Year",
    "month": "Month",
    "camera": "Camera",
    "lens": "Lens",
    "ext": "Format",
    "root": "Came from",
    "orient": "Shape",
    "res": "Resolution",
    "size": "File size",
    "grade": "Quality",
    "gps": "Location",
    "pair": "Grouping",
    "dup": "Identical frames",
    "dated": "Date from",
}

HINTS: dict[str, str] = {
    "kind": "Photos includes RAW: file.kind has three values and still "
            "photography is two of them. Picking nothing here means stills only, "
            "so video is counted below but hidden until you ask for it.",
    "month": "Any year. Counts are not shown because this one is derived from the "
             "capture time rather than counted per value.",
    "root": "The drive or card a photograph was found on, from the paths that "
            "carry its bytes.",
    "res": "Phase 2b's resolution class. The 23 tiles whose quality pass failed "
           "have none — Quality: Unscored finds those.",
    "grade": "Phase 2b's composite quality scalar, banded at this corpus's own "
             "quartiles.",
    "pair": "Phase 5 collapsed 13,840 RAW+JPEG pairs into one tile each.",
    "dup": "Frames that hash the same at the shipped threshold of 2, which is "
           "copies rather than resemblances — similar frames from one moment are "
           "a stack instead. They are recorded and never collapsed, so both of a "
           "pair are still their own tile.",
    "dated": "Where the capture time came from. A filename or a file date is a "
             "guess about when the photograph was taken.",
    "lens": "As the camera wrote it. Several bodies record a code rather than a "
            "name.",
}

# Everything one pass has to read to count every dimension at once. Thirteen
# GROUP BY queries would be ~250 ms each because each visits every tile; this is
# one 350 ms read and some arithmetic.
_FACET_SQL = f"""
SELECT p.id, p.sort_key, f.kind, f.ext, f.size, f.camera, f.lens, f.taken_src,
       f.gps_lat, f.gps_lon, f.width, f.height, f.quality, {RESOLUTION}
FROM photo AS p
JOIN file AS f ON f.sha256 = p.rep_sha256
"""


def _band(size: int) -> str:
    if size < 1048576:
        return "under1mb"
    if size < 5242880:
        return "1to5mb"
    if size < 20971520:
        return "5to20mb"
    if size < 104857600:
        return "20to100mb"
    return "over100mb"


def _grade(quality: str | None) -> str:
    """The band `ENUMS['grade']` puts this tile in. One place, two consumers.

    Reading the JSON in Python rather than asking SQLite for a fourteenth
    `json_extract` keeps the pass to one column read; the thresholds are the
    ones above, and a test asserts the two agree over the whole corpus.
    """
    score = None
    if quality:
        try:
            score = json.loads(quality).get("composite_quality")
        except ValueError:
            score = None
    if not isinstance(score, (int, float)):
        return "unscored"
    if score >= 0.30:
        return "best"
    if score >= 0.15:
        return "good"
    if score >= 0.06:
        return "fair"
    return "poor"


def facets(conn) -> dict:
    """Every dimension, its values, and how many tiles each holds.

    One pass over the tile set plus three small joins -- ~700 ms over the real
    corpus, paid once per process because every connection here is read-only and
    the answer cannot change while the server runs. That is the same reasoning
    `GridServer.kind_totals` was built on, and this replaces it: the per-kind
    figures it served are the `kind` dimension below.

    The counts are unconditional -- what the whole library holds, not what the
    current selection holds. Cross-filtering them would cost one count per
    dimension per keystroke, and a menu that renumbers itself as you tick
    through it is worse at the one job it has, which is telling you what is
    there before you go looking.
    """
    tally: dict[str, dict] = {name: {} for name in ("kind", "ext", "camera", "lens", "year")}
    tally.update({name: {} for name in ENUMS})
    tally["root"] = {}

    def bump(dimension: str, value) -> None:
        tally[dimension][value] = tally[dimension].get(value, 0) + 1

    total = 0
    for row in conn.execute(_FACET_SQL):
        (_, sort_key, kind, ext, size, camera, lens, taken_src,
         lat, lon, width, height, quality, resolution) = row
        total += 1
        bump("kind", kind)
        bump("ext", ext)
        bump("camera", camera if camera is not None else "")
        bump("lens", lens if lens is not None else "")
        bump("year", (sort_key or "")[:4])
        bump("res", resolution)
        bump("size", _band(size))
        bump("grade", _grade(quality))
        bump("gps", "yes" if lat is not None and lon is not None else "no")
        bump(
            "dated",
            "exif" if (taken_src or "").startswith("exif:") else taken_src,
        )
        if width is None or height is None:
            bump("orient", "unknown")
        else:
            bump("orient", "landscape" if width > height else "portrait" if width < height else "square")

    for _, members in conn.execute(
        "SELECT photo_id, count(*) FROM photo_member GROUP BY photo_id"
    ):
        bump("pair", "pair" if members > 1 else "single")

    duplicated = conn.execute(
        "SELECT count(*) FROM photo AS p JOIN near_dup AS nd ON nd.sha256 = p.rep_sha256"
    ).fetchone()[0]
    tally["dup"] = {"dup": duplicated, "unique": total - duplicated}

    # Distinct tiles per source root. A tile counts once per root even when the
    # root holds several of its paths, which is what the `root` filter selects.
    seen: set[tuple[int, str]] = set()
    for photo_id, root in conn.execute(
        "SELECT p.id, o.root FROM photo AS p JOIN origin AS o ON o.sha256 = p.rep_sha256"
    ):
        if (photo_id, root) not in seen:
            seen.add((photo_id, root))
            bump("root", root)

    return {
        "total": total,
        "sorts": [
            {"value": name, "label": sort.label} for name, sort in SORTS.items()
        ],
        "dimensions": [
            {
                "name": name,
                "title": TITLES[name],
                "hint": HINTS.get(name),
                # `month` is the one dimension with no tally: it is derived from
                # `sort_key` and all twelve are always offered. See `_options`.
                "options": _options(name, tally.get(name, {})),
            }
            for name in (
                "kind", "year", "month", "camera", "lens", "ext", "root",
                "orient", "res", "size", "grade", "gps", "pair", "dup", "dated",
            )
        ],
        # Kept as its own key because `main`'s banner and the page total both want
        # it by kind and neither wants to walk the dimension list to find it.
        "kinds": {kind: count for kind, count in tally["kind"].items() if kind is not None},
    }


# Months are the one dimension whose vocabulary is neither a fixed enum nor a
# value read off a row: it is derived from `sort_key`, and all twelve are always
# offered so the menu does not change shape with the library.
MONTHS = (
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
)


def _options(name: str, counts: dict) -> list[dict]:
    """One dimension's values, labelled and ordered for a menu."""
    if name == "month":
        return [
            {"value": str(number), "label": MONTHS[number - 1], "count": None}
            for number in range(1, 13)
        ]

    labels = LABELS.get(name, {})
    items = [(value, count) for value, count in counts.items() if value is not None]
    if name == "year":
        # `sort_key` is '-' for a photo with no date at all -- 0 of 24,536 today,
        # but the schema allows it. It is not a year the filter can express, so
        # it is not offered as one.
        items = [item for item in items if _YEAR.match(item[0])]
    if name in _ORDERED:
        order = _ORDERED[name]
        items.sort(key=lambda item: order.index(item[0]) if item[0] in order else len(order))
    elif name == "year":
        items.sort(key=lambda item: item[0], reverse=True)
    elif name == "kind":
        order = ("image", "raw_image", "video")
        items.sort(key=lambda item: order.index(item[0]) if item[0] in order else len(order))
    else:
        # Read the data, so the biggest source of photographs is the first thing
        # in the menu. Ties by name, so the order is stable between runs.
        items.sort(key=lambda item: (-item[1], str(item[0])))

    return [
        {
            "value": value,
            "label": labels.get(value) or _fallback(name, value),
            "count": count,
        }
        for value, count in items
    ]


def _fallback(name: str, value: str) -> str:
    """A label for a value that came out of the corpus rather than a list above."""
    if value == "":
        return "No extension" if name == "ext" else "Not recorded"
    return str(value)
