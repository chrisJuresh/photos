"""The grid and the triage screens: one server, two modes of one client.

    GET  /                                                the page
    GET  /tune                                            the page, plus glass controls
    GET  /glass                                           the material comparison
    GET  /api/photos?before=&before_id=&limit=&<filters>  a keyset page
    GET  /api/facets                                      what can be filtered by
    GET  /t/<sha256>.webp                                 a thumbnail, immutable
    GET  /d/<sha256>.webp                                 a 1536px substrate, ditto
    POST /api/reveal {"id": N} | {"origin": N}            select it in Explorer
    GET  /api/triage/*                                    the survey, read-only
    POST /api/triage/*                                    the only writes there are

Everything except `/api/triage/*` is read-only, and those writes reach
`state.sqlite3` through a connection that cannot see the catalog — see
`GridServer.state_writer`. The only surface that leaves the process is
`/api/reveal`,
and its path proof lives in `photolib.reveal` so it can be read and tested on
its own — `F51` is v1 putting routers, SQL, security and browser launch in one
4,700-line module.

Four properties carry the stated requirement, that perceived load delay be
small:

  * `file.width`/`height` come back with the page, so justified rows lay out
    before a single image is requested. No measuring, no layout shift.
  * every page carries `total`, so the client can give the scrollbar its final
    length while it still holds only the first page. It is 230-400 ms whatever
    the filter, because a count has to visit every tile, so it is memoised per
    filter set -- once per selection the reader makes, never once per page. It
    cannot go stale: every connection here is read-only.
  * thumbnail URLs are content hashes, so `immutable` is honest and the browser
    stops asking after the first pass. `F47` is that header on a URL whose
    meaning can change.
  * paging is keyset on the pair `(sort_key, id)`, never OFFSET. 90.5% of photo
    rows share a sort_key with another row and the largest single tie is 9,143,
    so a one-column cursor cannot page through the library at all. An alternate
    ordering pages on `(its own key, id)` the same way -- see `photolib.browse`.

`stack=<seconds>` collapses each run of consecutive captures from one camera
into one tile, so a page carries covers rather than frames and each one says how
many it stands for. The two default sorts pay nothing for it beyond the tiles
they read: a run is contiguous in `photo_sort` order, so a page collapses its
own as it streams. The other eight cannot, and buy one grouping pass per
selection instead. Which frame a stack is drawn as is `browse.cover` — the
sharpest of the middle-exposure third — resolved from one read over the members
of the stacks on the page and never materialised, because a filter applies
before the grouping and can change what a stack holds.

What can be filtered and sorted by lives in `photolib.browse`, so the vocabulary
can be read, measured and tested without a server. This module keeps the query
string, the envelope, and the security posture, and holds no filter of its own.
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import sqlite3
import sys
import threading
from dataclasses import dataclass
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs

from photolib import browse, db, reveal as reveal_module, triage_api
from photolib.config import load, substrate_path, thumb_path

DEFAULT_PORT = 8770  # v1 used 8765 for the dashboard and 8766 for the review API

# `kind` was a query parameter from the first commit, before there was a second
# filter, so the later facets in `photolib.browse` extended that contract instead
# of renegotiating it. It still parses here because its one irregularity is its
# own: `image` means still photography and expands to cover raw.
KINDS = frozenset({"image", "raw_image", "video"})
DEFAULT_KINDS = ("image", "raw_image")

DEFAULT_LIMIT = 500
MAX_LIMIT = 1000

# How many tiles a stacked page asks for per cover it wants. 24,534 tiles
# collapse to 10,948 at a four-second window — 2.24 each — but the recent end of
# the library is the bracketed end and runs nearer 3.6, so a first page wants
# more headroom than the average. `_rows` steps rather than fetches, so asking
# for more than the page needs costs nothing and asking for too little costs a
# second round trip.
TILES_PER_COVER = 6

STATIC_DIR = Path(__file__).resolve().parent / "static"
# `bundle.js` and `bundle.css` are built from `ui/src` by `npm run build` and
# committed, so the server runs from a clean checkout with no node toolchain.
# `index.html` is hand-written and is not a build output.
#
# `/glass` is the material comparison — ten published liquid-glass
# implementations over the real grid, each at its own source's default settings,
# flipped through with the arrow keys. It is
# hand-written, it is not part of the bundle, and it reads `/api/photos` and
# `/t/` like any other client. Nothing else imports it and the app never links
# to it: it is for choosing the header's material and for nothing else.
#
# `/tune` is the settled material's control panel and serves the same document
# as `/`, because it is the same client: the app reads the path once and mounts
# a panel of sliders over the grid. Nothing links to it either.
STATIC_ROUTES = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/tune": ("index.html", "text/html; charset=utf-8"),
    "/bundle.js": ("bundle.js", "text/javascript; charset=utf-8"),
    "/bundle.css": ("bundle.css", "text/css; charset=utf-8"),
    "/glass": ("glass.html", "text/html; charset=utf-8"),
    "/glass.css": ("glass.css", "text/css; charset=utf-8"),
    "/glass.js": ("glass.js", "text/javascript; charset=utf-8"),
}

# 64 lowercase hex characters cannot traverse, cannot be absolute and cannot
# hold a separator, so this pattern IS the containment proof for /t/. That is
# structurally stronger than checking a joined path afterwards, and it costs no
# database round-trip — one query per thumbnail would dominate first paint.
THUMB_ROUTE = re.compile(r"^/t/([0-9a-f]{64})\.webp$")
# The 1536px tier, which a stack's overlay draws its frames from. Same proof,
# same tier-per-root split as `thumb_path`/`substrate_path`: a sha can have one
# tier and not the other, and a request for the tier that is missing is a 404
# rather than a fall back to the other one.
SUBSTRATE_ROUTE = re.compile(r"^/d/([0-9a-f]{64})\.webp$")

LIMIT_VALUE = re.compile(r"^[0-9]{1,5}$")

# How many distinct filter sets a session may bank a `total` for. Each is one
# integer against a small tuple, so this is not a memory bound -- it is a bound
# on a dict whose keys come from the query string.
MAX_TOTALS = 512

MAX_REVEAL_BODY = 1024
# A rule body carries a predicate value -- a directory path or an `in` list --
# so it is larger than a reveal's `{"id": N}`, and still nowhere near a bulk
# upload. `triage.MAX_IN_VALUES` and `MAX_VALUE_CHARS` bound the same thing
# from the other side.
MAX_TRIAGE_BODY = 64 * 1024

SECURITY_HEADERS = (
    ("X-Content-Type-Options", "nosniff"),
    ("Referrer-Policy", "no-referrer"),
    ("X-Frame-Options", "DENY"),
    (
        "Content-Security-Policy",
        # data: is for decoded ThumbHash placeholders and nothing else; every
        # other source is 'none' or 'self', and script/style are separate files
        # so no 'unsafe-inline' is needed anywhere.
        "default-src 'none'; img-src 'self' data:; script-src 'self'; style-src 'self'; "
        "connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    ),
)


class BadRequest(ValueError):
    """A malformed query. `field` names what to tell the client, and nothing else."""

    def __init__(self, field: str) -> None:
        super().__init__(field)
        self.field = field


@dataclass(frozen=True)
class Roots:
    """Every path the server reads, so tests and the bench never touch E: or G:."""

    catalog_db: Path
    state_db: Path
    thumb_root: Path
    substrate_root: Path
    # What a `file.vault_relpath` is relative to. Step 14 promoted the objects out
    # of MediaVault, so this is the vault root and `reveal_root` is the vault too;
    # they are still two fields because the base and the containment root are
    # different questions, and before the promotion they were different
    # directories. Moving one without the other 403s every reveal.
    vault_root: Path
    reveal_root: Path
    # Triage's containment root, and only triage's. A triage subject is an
    # `origin` path under `G:\photos`, which is a different tree from the vault
    # objects `reveal_root` covers. Which of the two applies is decided by the
    # kind of id the request carries, before anything resolves -- never by
    # trying one and falling back to the other.
    photos_root: Path

    @classmethod
    def from_config(cls) -> Roots:
        config = load()
        return cls(
            catalog_db=config.catalog_db,
            state_db=config.state_db,
            thumb_root=config.thumb_root,
            substrate_root=config.substrate_root,
            vault_root=config.vault_root,
            reveal_root=config.reveal_root,
            photos_root=config.photos_root,
        )


# --------------------------------------------------------------------------
# query parsing


def parse_kinds(values: list[str]) -> tuple[str, ...]:
    """The media kinds a request selects.

    `image` always means still photography, which is `image` and `raw_image`
    both. `file.kind` has three values, not two, and reading the default as
    `image` alone would silently hide 16,388 RAW photos — the Lumix and Sony
    corpus. Video is what "hidden by default" is actually for.

    RAW-versus-not is a property of the extension, not of the media kind, so it
    is a later facet rather than a second meaning for this one.
    """
    if not values:
        return DEFAULT_KINDS
    tokens = [token.strip() for value in values for token in value.split(",")]
    tokens = [token for token in tokens if token]
    if not tokens or any(token not in KINDS for token in tokens):
        raise BadRequest("kind")
    selected = set(tokens)
    if "image" in selected:
        selected.update(DEFAULT_KINDS)
    return tuple(sorted(selected))


def parse_limit(values: list[str]) -> int:
    """Page size. Clamped rather than refused — an over-large limit is a budget."""
    if not values:
        return DEFAULT_LIMIT
    raw = values[-1]
    if not LIMIT_VALUE.match(raw):
        raise BadRequest("limit")
    return min(max(int(raw), 1), MAX_LIMIT)


def build_assignment(conn: sqlite3.Connection, query: browse.Query) -> tuple:
    """Every stack of one selection as `(id, sort key, members)`, in order.

    The id and the key are the *first* member's in this ordering: that is where
    the stack sits in it, and it is what a keyset cursor compares against. Which
    member the stack is drawn as is a separate question with a separate answer —
    it depends on readings this pass does not carry, so it is asked only of the
    stacks a page actually holds.

    One pass, ~380 ms; the caller memoises it. Only the eight sorts that cannot
    stream ever ask for it — see `GridServer.assignment`.
    """
    sql, params = browse.assignment_sql(query)
    stacks: list[list] = []
    seen: dict[int, int] = {}  # stack -> the index of its first member
    for photo_id, key, stack in conn.execute(sql, params):
        index = seen.get(stack)
        if index is None:
            seen[stack] = len(stacks)
            stacks.append([photo_id, key, [photo_id]])
        else:
            stacks[index][2].append(photo_id)
    return tuple((photo_id, key, tuple(members)) for photo_id, key, members in stacks)


def _scalars(conn: sqlite3.Connection, ids: list[int]) -> dict:
    """`(mean luminance, sharpness)` per photo — what the cover rule ranks on.

    Both live inside `file.quality` as JSON, and extracting one costs ~50 ms
    over the whole tile set. This is the read that keeps that off the page: it
    is asked only about the members of the stacks being served, and never about
    the library. The ids come from `photo`, not from a request.
    """
    if not ids:
        return {}
    sql = (
        f"SELECT p.id, {browse.LUMINANCE}, {browse.SHARPNESS} "
        "FROM photo AS p JOIN file AS f ON f.sha256 = p.rep_sha256 "
        f"WHERE p.id IN ({', '.join('?' * len(ids))})"
    )
    return {
        row[0]: (browse.mean_luminance(row[1]), row[2])
        for row in conn.execute(sql, ids)
    }


def _covers(conn: sqlite3.Connection, groups: list) -> list[int]:
    """Which member each stack is drawn as, in one read for the whole page.

    A stack of one is not read for — there is nothing to choose between, and
    most of the stacks on a page are that — but it still goes through the rule
    like any other. An unread member arrives as a member with no readings, which
    is a state the rule already answers: it draws the first, and the first of
    one is it. So the size of a stack is not a case anything here has to know
    about.
    """
    scalars = _scalars(
        conn, [photo_id for group in groups if len(group) > 1 for photo_id in group]
    )
    return [
        browse.cover(
            [(photo_id, *scalars.get(photo_id, (None, None))) for photo_id in group]
        )
        for group in groups
    ]


def _photo(row) -> dict:
    return {
        "id": row[0],
        "s": row[1],
        "w": row[2],
        "h": row[3],
        # Always present, null until step 9 computes ThumbHash. A key that
        # gains a value is not a contract change; a key that appears is.
        "th": base64.b64encode(row[4]).decode("ascii") if row[4] is not None else None,
    }


def _frame(row) -> dict:
    """One member of a stack, as the overlay draws it.

    `_photo` without the ThumbHash: a frame is drawn from `/d/`, which is a
    1536px read behind a click that has already happened, and a placeholder for
    it would be a second decode of a hash the cover has already shown.
    """
    return {"id": row[0], "s": row[1], "w": row[2], "h": row[3]}


def _frames(rows, members: tuple | list) -> dict:
    """`{"m": [...]}` for a stack worth opening, and nothing for one that is not.

    A stack of one opens nothing — clicking it reveals in Explorer, as an
    unstacked tile always has — so the key is absent rather than a list of one.
    That is 6,297 of the 10,929 rows a four-second window leaves.
    """
    if len(members) < 2:
        return {}
    return {"m": [_frame(rows[photo_id]) for photo_id in members]}


def _plain_page(conn: sqlite3.Connection, query: browse.Query, cursor, limit: int):
    """One keyset page of tiles, and whether another follows.

    Reads `limit + 1` rows and returns `limit`. Whether the extra row existed is
    what sets `next`, so exhaustion is a fact rather than an inference — a page
    that happens to hold exactly `limit` rows is not the end, and deriving it
    that way is a bug that only reproduces at particular corpus sizes.
    """
    sql, params = browse.page_sql(query, cursor)
    rows = conn.execute(sql, [*params, limit + 1]).fetchall()
    has_more = len(rows) > limit
    rows = rows[:limit]
    following = None
    if has_more and rows:
        following = {"before": rows[-1][5], "before_id": rows[-1][0]}
    return [_photo(row) for row in rows], following


def _rows(conn: sqlite3.Connection, query: browse.Query, cursor, chunk: int):
    """Tiles in the page's order, refetching from the keyset cursor as needed.

    A stacked page cannot know up front how many tiles it takes to fill: that is
    the ratio it exists to change. So it reads in chunks off the same cursor the
    client would have used, which keeps every read a `photo_sort` page.

    Stepped rather than fetched, because `photo_sort` supplies the order and the
    plan carries no temp b-tree — so a row the page never reaches is a row
    SQLite never visits, and an over-generous chunk costs nothing. Fetching the
    chunk instead read 3,000 tiles to serve a 1,805-tile page.
    """
    while True:
        sql, params = browse.page_sql(query, cursor)
        seen, row = 0, None
        for row in conn.execute(sql, [*params, chunk]):
            seen += 1
            yield row
        if seen < chunk:
            return
        cursor = (row[5], row[0])


def _streamed(conn: sqlite3.Connection, query: browse.Query, cursor, limit: int):
    """One page of covers, collapsing runs as the tiles arrive.

    The two default sorts read in capture order, so a run's members arrive in
    one pass and a stack takes the place of the first of them — the newest frame
    on `newest`, the oldest on `oldest`. Which member is *drawn* there is
    `_covers`, asked once the page is whole. Each camera keeps its own open run,
    so a second body shooting at the same moment interleaves without splitting
    anything.

    A page ends at a *clean cut*: the first tile more than the window away from
    the last one that could stack. Every earlier tile is further away still, so
    no run can straddle the boundary and every stack is returned whole, on one
    page, exactly once. Reaching `limit` is what starts looking for that cut
    rather than what ends the page, so a page can carry a few covers more than
    it asked for — the alternative is splitting a burst across two pages.

    The cut is measured on where a tile sits and not on whether it may stack.
    A selection holding nothing stackable — `dated=mtime`, say — has no run to
    close, and a cut that only fired on stackable tiles would never fire and
    serve the whole selection as one page.
    """
    window = query.stack
    groups: list[list] = []  # the page's stacks, each its members' rows in order
    runs: dict = {}  # camera -> [seconds of its last tile, index of its stack]
    frontier = None  # the last tile that could stack, in seconds
    last = None  # the last tile this page consumed, which is what `next` names
    has_more = False

    for row in _rows(conn, query, cursor, limit * TILES_PER_COVER):
        camera = row[browse.CAMERA]
        seconds, stackable = row[browse.SECONDS], row[browse.STACKABLE]
        if len(groups) >= limit and (
            frontier is None or seconds is None or abs(seconds - frontier) > window
        ):
            has_more = True
            break
        run = runs.get(camera) if stackable else None
        if run is not None and abs(seconds - run[0]) <= window:
            run[0] = seconds
            groups[run[1]].append(row)
        else:
            groups.append([row])
            if stackable:
                runs[camera] = [seconds, len(groups) - 1]
        if stackable:
            frontier = seconds
        last = row

    # Every member's row is already in hand, so naming the cover costs the
    # quality read and no second look at the tiles.
    rows = {row[0]: row for group in groups for row in group}
    members = [[row[0] for row in group] for group in groups]
    covers = _covers(conn, members)
    photos = [
        {**_photo(rows[cover]), "n": len(group), **_frames(rows, group)}
        for cover, group in zip(covers, members)
    ]

    following = None
    if has_more and last is not None:
        following = {"before": last[browse.KEY], "before_id": last[0]}
    return photos, following


def _assigned(
    conn: sqlite3.Connection, query: browse.Query, cursor, limit: int, stacks
):
    """One page of covers, sliced out of an assignment computed in one pass.

    The eight non-time sorts cannot stream: a stack's members are scattered
    through the ordering, so there is no run to collapse. `stacks` is every
    stack in this sort's order, first member first, computed once per selection
    — see `GridServer.assignment`. Paging is then a slice, and the cursor is
    found by walking to it rather than by looking it up, so a key that survived
    a round trip through the query string compares the way SQL would.

    The cursor is the first member's `(key, id)` and not the cover's, because it
    is the ordering it has to compare against: the drawn frame is chosen from
    readings the ordering knows nothing about, and could sit anywhere in it.
    """
    start = 0
    if cursor is not None:
        descending = query.ordering.descending
        while start < len(stacks):
            here = (stacks[start][1], stacks[start][0])
            if here < cursor if descending else here > cursor:
                break
            start += 1
    wanted = stacks[start:start + limit]
    covers = _covers(conn, [members for _, _, members in wanted])
    # Every member and not just the drawn one: the covers alone would leave the
    # overlay a second read behind the click. The same ids `_covers` has just
    # read the quality of, so this adds a row width rather than a query shape.
    rows = _by_id(conn, [photo_id for _, _, members in wanted for photo_id in members])
    photos = [
        {**_photo(rows[cover]), "n": len(members), **_frames(rows, members)}
        for cover, (_, _, members) in zip(covers, wanted)
    ]
    following = None
    if wanted and start + limit < len(stacks):
        following = {"before": wanted[-1][1], "before_id": wanted[-1][0]}
    return photos, following


def _by_id(conn: sqlite3.Connection, ids: list[int]) -> dict:
    """The page's tiles, by primary key. The ids come from `photo`, not a request."""
    if not ids:
        return {}
    sql = (
        "SELECT p.id, f.sha256, f.width, f.height, f.thumbhash "
        "FROM photo AS p JOIN file AS f ON f.sha256 = p.rep_sha256 "
        f"WHERE p.id IN ({', '.join('?' * len(ids))})"
    )
    return {row[0]: row for row in conn.execute(sql, ids)}


def page(
    conn: sqlite3.Connection,
    query: browse.Query,
    cursor,
    limit: int,
    *,
    total: int | None = None,
    stacks: int | None = None,
    assignment: tuple | None = None,
) -> dict:
    """One page, stacked or not, with an honest end-of-stream marker.

    `total` is how many *tiles* the whole query has, which the client needs in
    order to give the scrollbar its final length on the first page instead of
    growing it under the reader on every page. It is carried rather than
    computed here: it costs 230-400 ms and it is the same number for every page
    of one selection, so it is counted once per selection — see
    `GridServer.total`.

    With stacking on the envelope echoes `stack`, the window it grouped at, and
    every photo gains `n`, its stack's size. It also carries `stacks`, how many
    rows the whole selection collapses to: `total` still counts tiles, so the
    two together are the count pane's two numbers and the first of them is what
    the sheet reserves its height for. With stacking off none of the three keys
    is there and the page is byte for byte what it was before stacking existed.

    A photo whose `n` is more than one also carries `m`, the frames it collapsed
    — `id`, `sha`, `width`, `height` each, in this page's own order — which is
    what the overlay draws when the stack is opened. They ride with the cover
    rather than being fetched per click because this page is where the grouping
    is authoritative: a filter applies before stacking and the assignment memo
    evicts, so asking again later could answer about a different set of frames.
    """
    if query.stack is None:
        photos, following = _plain_page(conn, query, cursor, limit)
    elif query.ordering.indexed:
        photos, following = _streamed(conn, query, cursor, limit)
    else:
        photos, following = _assigned(conn, query, cursor, limit, assignment)
    envelope = {
        "photos": photos,
        "next": following,
        "kind": list(query.kinds),
        "sort": query.sort,
        "limit": limit,
        "total": total,
    }
    if query.stack is not None:
        envelope["stack"] = query.stack
        envelope["stacks"] = stacks
    return envelope


def reveal_relpath(conn: sqlite3.Connection, photo_id: int) -> tuple | None:
    """The stored object path for one photo, as a row, or None if there is none.

    A row rather than the value, because "no such photo" and "a photo whose
    path was never recorded" are different answers and a bare None conflates
    them into one.
    """
    return conn.execute(
        "SELECT f.vault_relpath FROM photo AS p "
        "JOIN file AS f ON f.sha256 = p.rep_sha256 WHERE p.id = ?",
        (photo_id,),
    ).fetchone()


def origin_source_path(conn: sqlite3.Connection, origin_id: int) -> tuple | None:
    """The source path one `origin` row records, as a row, or None.

    Triage's subject is a path, not a photo: most of what it looks at has no
    `photo` row and 85% of it has no thumbnail either. `origin.path` is NOT NULL,
    so unlike `vault_relpath` there is no "recorded but empty" case to tell
    apart from "no such row".
    """
    return conn.execute("SELECT path FROM origin WHERE id = ?", (origin_id,)).fetchone()


# --------------------------------------------------------------------------
# server


class GridServer(ThreadingHTTPServer):
    """Threaded because keep-alive plus one thread is a hang, not a slowdown.

    A single-threaded HTTPServer serves one connection until the *client* closes
    it, and the handler timeout defaults to None — so the browser's first socket
    would hold the server while the other five sat in the backlog. Turning
    keep-alive off instead means a TCP handshake per thumbnail, which is the
    opposite of what this step is for.
    """

    daemon_threads = True

    # http.server sets this to 1. On Windows SO_REUSEADDR does not mean what it
    # means on POSIX: it lets a second process bind the same address and take
    # over connections. Silently.
    allow_reuse_address = False

    def __init__(self, address, handler, roots: Roots, spawn) -> None:
        self.roots = roots
        self.spawn = spawn
        self._local = threading.local()
        self._facets: dict | None = None
        self._totals: dict[browse.Query, int] = {}
        self._stacks: dict[browse.Query, int] = {}
        self._assignments: dict[browse.Query, tuple] = {}
        self._totals_lock = threading.Lock()
        super().__init__(address, handler)
        port = self.server_address[1]
        # Literal, built after binding. The Origin check compares against this
        # too and never derives an expected origin from the Host header, which
        # is what v1 did and what only worked because a host check ran first.
        self.allowed_hosts = frozenset({f"127.0.0.1:{port}", f"localhost:{port}"})
        self.allowed_origins = frozenset({f"http://127.0.0.1:{port}", f"http://localhost:{port}"})

    def connection(self) -> sqlite3.Connection:
        """This thread's read-only connection, opened on first use.

        Per-thread rather than pooled or shared: a connection never crosses a
        thread, which settles the sqlite thread-safety question instead of
        arguing about it. The /t/ route never calls this, so the handful of
        threads that exist because of thumbnails never open the database.
        """
        conn = getattr(self._local, "conn", None)
        if conn is None:
            conn = db.connect(self.roots.catalog_db, self.roots.state_db, read_only=True)
            conn.execute("PRAGMA query_only = ON")
            self._local.conn = conn
        return conn

    def facets(self) -> dict:
        """The filter vocabulary, built once and served from memory after.

        Every dimension the header offers, with a count per value, from one pass
        over the tile set — ~700 ms over the real corpus. Thirteen GROUP BY
        queries would be ~250 ms each, because each one visits every tile.

        Every connection in this process is read-only, so the answer cannot
        change while the server runs. Counted under the lock rather than around
        it, so two threads arriving together pay for one pass and not two;
        `main` warms it before the browser opens, which is why no request ever
        waits on it.
        """
        with self._totals_lock:
            if self._facets is None:
                self._facets = browse.facets(self.connection())
            return self._facets

    def kind_totals(self) -> dict[str, int]:
        """`photo` rows per media kind. A view of `facets`, not a second query."""
        return self.facets()["kinds"]

    def total(self, query: browse.Query) -> int:
        """How many tiles one selection holds, counted once per selection.

        The sheet reserves scrollbar height for the pages it has not asked for
        yet, so it needs the size of the whole answer while it still holds only
        the first page. A count visits every tile whatever the filter is —
        230-400 ms — and it is the same number for every page of one selection,
        so paying it per page would put it in front of every scroll.

        Memoised on the `Query` itself: it is frozen and its fields are sorted
        tuples, so two requests that mean the same selection are the same key
        however the query string was spelled. The stacking window is dropped
        from the key first, because this counts tiles and no window changes how
        many there are. The cap is on the number of distinct keys a session can
        bank, because those keys come from a query string; when it is reached
        the oldest is dropped, and the only cost of being wrong about which is
        one recount.
        """
        key = query.unstacked()
        with self._totals_lock:
            if key not in self._totals:
                sql, params = browse.count_sql(key)
                if len(self._totals) >= MAX_TOTALS:
                    del self._totals[next(iter(self._totals))]
                self._totals[key] = self.connection().execute(sql, params).fetchone()[0]
            return self._totals[key]

    def stacks(self, query: browse.Query) -> int:
        """How many stacks one selection collapses to, counted once per window.

        The count pane says `<stacks> stacks · <photos> photos`, and the first
        of those is about the whole selection rather than the page on screen —
        so it is one more number of the same shape as `total`: ~410 ms measured
        against the real catalog, the same for every page of one selection, and
        therefore counted once in front of the first page rather than per page.
        Same cap and same eviction as the other two memos.

        Keyed on the selection with its sort dropped, because the sort decides
        which member covers a stack and never how many stacks there are.
        """
        key = query.grouping()
        with self._totals_lock:
            if key not in self._stacks:
                sql, params = browse.stack_count_sql(key)
                if len(self._stacks) >= MAX_TOTALS:
                    del self._stacks[next(iter(self._stacks))]
                self._stacks[key] = self.connection().execute(sql, params).fetchone()[0]
            return self._stacks[key]

    def assignment(self, query: browse.Query) -> tuple:
        """How one selection stacks, grouped once per selection and window.

        Asked for only by the eight sorts that cannot collapse runs as they
        page. The pass is ~380 ms — the same order as a `total`, and paid for
        the same reason: it is the same answer for every page of one selection,
        so paying it per page would put it in front of every scroll. Same cap
        and same eviction as the count memo, on keys that come from a query
        string. One entry is a tuple per stack carrying its members' ids, ~2 MB
        over the real corpus, which is why the cap is on the number of
        selections and not on bytes.
        """
        with self._totals_lock:
            if query not in self._assignments:
                if len(self._assignments) >= MAX_TOTALS:
                    del self._assignments[next(iter(self._assignments))]
                self._assignments[query] = build_assignment(self.connection(), query)
            return self._assignments[query]

    def state_writer(self) -> sqlite3.Connection:
        """This thread's write connection -- to `state.sqlite3` and nothing else.

        The catalog is not attached, so no `/api/triage/*` handler has a name
        that reaches `origin`, `file`, `photo` or the survey. "Triage writes
        metadata only" is then a fact about the connection rather than a rule
        somebody has to keep obeying.
        """
        conn = getattr(self._local, "writer", None)
        if conn is None:
            conn = triage_api.writer(self.roots.state_db)
            self._local.writer = conn
        return conn


class GridHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    timeout = 30
    server_version = "photolib-grid"
    sys_version = ""

    server: GridServer

    # -- plumbing ---------------------------------------------------------

    def log_request(self, code="-", size="-") -> None:
        """Quiet on success. 500 thumbnails per paint is not a log."""
        if isinstance(code, int) and code >= 400:
            self.log_message('"%s" %s', self.requestline, code)

    def _respond(self, status: int, body: bytes = b"", headers: tuple = ()) -> None:
        self.send_response(status)
        for name, value in SECURITY_HEADERS:
            self.send_header(name, value)
        for name, value in headers:
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD" and body:
            self.wfile.write(body)

    def _json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self._respond(status, body, (("Content-Type", "application/json"),))

    def _fail(self, status: int, field: str | None = None) -> None:
        """A refusal that says which field, and never what was in it.

        Echoing a rejected value hands back the one thing the check withheld,
        and turns a JSON body into a reflection sink if a client ever mistakes
        the content type.
        """
        if field is None:
            self._respond(status)
            return
        self._json(status, {"error": field})

    def _host_ok(self) -> bool:
        host = (self.headers.get("Host") or "").strip().lower()
        return host in self.server.allowed_hosts

    def _refuse_body(self) -> None:
        """Refuse without reading the body, so close rather than desynchronise."""
        self.close_connection = True

    # -- routing ----------------------------------------------------------

    def do_GET(self) -> None:
        # Host first, before anything looks at the path. F48 is this missing:
        # a name an attacker controls that resolves to 127.0.0.1 is same-origin
        # as far as the browser is concerned, so CSP does not help.
        if not self._host_ok():
            self._fail(403, "host")
            return

        path, _, query = self.path.partition("?")

        thumbnail = THUMB_ROUTE.match(path)
        substrate = SUBSTRATE_ROUTE.match(path)
        if path in STATIC_ROUTES:
            self._static(path)
        elif path == "/api/photos":
            self._photos(query)
        elif path == "/api/facets":
            self._json(200, self.server.facets())
        elif thumbnail:
            sha256 = thumbnail.group(1)
            self._tile(thumb_path(self.server.roots.thumb_root, sha256), sha256)
        elif substrate:
            sha256 = substrate.group(1)
            self._tile(substrate_path(self.server.roots.substrate_root, sha256), sha256)
        elif path in triage_api.READ_ROUTES:
            self._triage_read(path, query)
        elif path == "/api/reveal" or path in triage_api.WRITE_ROUTES:
            self._respond(405, b"", (("Allow", "POST"),))
        else:
            self._fail(404)

    do_HEAD = do_GET

    def do_POST(self) -> None:
        if not self._host_ok():
            self._refuse_body()
            self._fail(403, "host")
            return
        path = self.path.partition("?")[0]
        if path == "/api/reveal":
            self._reveal()
        elif path in triage_api.WRITE_ROUTES:
            self._triage_write(path)
        else:
            self._refuse_body()
            self._fail(404)

    def _method_not_allowed(self) -> None:
        if not self._host_ok():
            self._refuse_body()
            self._fail(403, "host")
            return
        self._refuse_body()
        self._respond(405, b"", (("Allow", "GET, HEAD, POST"),))

    do_PUT = do_DELETE = do_PATCH = do_OPTIONS = _method_not_allowed

    # -- handlers ---------------------------------------------------------

    def _static(self, route: str) -> None:
        name, content_type = STATIC_ROUTES[route]
        try:
            body = (STATIC_DIR / name).read_bytes()
        except OSError:
            self._fail(404)
            return
        self._respond(
            200,
            body,
            (("Content-Type", content_type), ("Cache-Control", "no-cache")),
        )

    def _photos(self, query: str) -> None:
        params = parse_qs(query, keep_blank_values=True)
        try:
            limit = parse_limit(params.get("limit", []))
            selection = browse.parse(params, kinds=parse_kinds(params.get("kind", [])))
            cursor = browse.parse_cursor(
                selection.ordering, params.get("before", []), params.get("before_id", [])
            )
        except (BadRequest, browse.BadFilter) as exc:
            self._fail(400, exc.field)
            return
        payload = page(
            self.server.connection(),
            selection,
            cursor,
            limit,
            total=self.server.total(selection),
            stacks=(
                self.server.stacks(selection) if selection.stack is not None else None
            ),
            # Only the sorts that cannot stream: a default sort collapses its
            # own runs as it pages, so it must never pay for a grouping pass.
            assignment=(
                self.server.assignment(selection)
                if selection.stack is not None and not selection.ordering.indexed
                else None
            ),
        )
        self._json(200, payload)

    def _tile(self, path: Path, sha256: str) -> None:
        """One content-addressed webp off the NVMe: a thumbnail or a substrate.

        The two tiers differ only in which root the caller resolved the sha
        against — the caching, the revalidation and the 404 are the same answer
        to the same question, so they are one handler rather than a near-clone.
        Which root applies is fixed by the route that matched, before anything
        touches the disk, and neither tier ever falls back to the other.
        """
        etag = f'"{sha256}"'
        if self.headers.get("If-None-Match") == etag:
            self._respond(304, b"", (("ETag", etag),))
            return
        try:
            body = path.read_bytes()
        except OSError:
            # Expected: 22,531 stills have no thumbnail — step 12's problem —
            # and 23 tiles have no 1536px substrate in either source tree.
            self._fail(404)
            return
        self._respond(
            200,
            body,
            (
                ("Content-Type", "image/webp"),
                # Safe only because the name is the content hash. F47 is this
                # header on a URL that means "whatever is current".
                ("Cache-Control", "private, max-age=31536000, immutable"),
                ("ETag", etag),
            ),
        )

    def _json_body(self, max_bytes: int) -> dict | None:
        """A validated JSON object body, or None having already answered.

        Same gauntlet for every POST in the process: same-origin, an explicit
        JSON content type so any cross-origin attempt needs a preflight there is
        no handler for, and a size budget checked *before* a byte is read --
        `F45` is that budget arriving after the read.
        """
        origin = self.headers.get("Origin")
        if origin is None or origin not in self.server.allowed_origins:
            self._refuse_body()
            self._fail(403, "origin")
            return None
        content_type = (self.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        if content_type != "application/json":
            self._refuse_body()
            self._fail(415, "content-type")
            return None
        if self.headers.get("Transfer-Encoding"):
            self._refuse_body()
            self._fail(400, "body")
            return None
        raw_length = self.headers.get("Content-Length")
        if raw_length is None or not raw_length.strip().isdigit():
            self._refuse_body()
            self._fail(411, "body")
            return None
        length = int(raw_length)
        if length > max_bytes:
            self._refuse_body()
            self._fail(413, "body")
            return None
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            self._fail(400, "body")
            return None
        if not isinstance(payload, dict):
            self._fail(400, "body")
            return None
        return payload

    def _triage_read(self, path: str, query: str) -> None:
        params = parse_qs(query, keep_blank_values=True)
        try:
            status, payload = triage_api.READ_ROUTES[path](self.server.connection(), params)
        except triage_api.Refused as exc:
            self._fail(exc.status, exc.field)
            return
        self._json(status, payload)

    def _triage_write(self, path: str) -> None:
        """The only write in the process, and the only one there will be.

        The connection it is handed reaches `state.sqlite3` and nothing else --
        see `GridServer.state_writer`. Invariant 3 on a new surface: a triage
        decision is a row, never a file operation.
        """
        payload = self._json_body(MAX_TRIAGE_BODY)
        if payload is None:
            return
        try:
            status, body = triage_api.WRITE_ROUTES[path](self.server.state_writer(), payload)
        except triage_api.Refused as exc:
            self._fail(exc.status, exc.field)
            return
        self._json(status, body)

    def _reveal(self) -> None:
        payload = self._json_body(MAX_REVEAL_BODY)
        if payload is None:
            return

        # Two id kinds: `id` is a photo and resolves under the vault, `origin`
        # is a triage subject and resolves under the photos root. Exactly one
        # may be present, and which one it is fixes the containment root before
        # anything resolves. Accepting both and preferring one would be a silent
        # choice, and trying one root then the other is the `F05`/`F13` shape.
        keys = [key for key in ("id", "origin") if key in payload]
        if len(keys) != 1:
            self._fail(400, "id")
            return
        key = keys[0]
        identifier = payload[key]
        # isinstance(True, int) is True, so bool has to be excluded by type.
        if type(identifier) is not int or identifier <= 0:
            self._fail(400, key)
            return

        roots = self.server.roots
        conn = self.server.connection()
        try:
            if key == "origin":
                row = origin_source_path(conn, identifier)
                if row is None:
                    self._fail(404, key)
                    return
                target = reveal_module.resolve_absolute(row[0], roots.photos_root)
            else:
                row = reveal_relpath(conn, identifier)
                if row is None:
                    self._fail(404, key)
                    return
                if not row[0]:
                    self._fail(409, "path")
                    return
                target = reveal_module.resolve(row[0], roots.vault_root, roots.reveal_root)
        except reveal_module.RevealRefused:
            # The reason is in the server log. The client gets a field name.
            self._fail(403, "path")
            return
        try:
            reveal_module.reveal(target, spawn=self.server.spawn)
        except (reveal_module.RevealRefused, OSError):
            self._fail(500, "spawn")
            return
        self._respond(204)


def serve(
    roots: Roots,
    port: int = DEFAULT_PORT,
    *,
    spawn=reveal_module._popen,
) -> GridServer:
    """Bind and return the server. The caller runs it."""
    return GridServer(("127.0.0.1", port), GridHandler, roots, spawn)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m photolib.grid", description=__doc__)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--open", action="store_true", help="open a browser once bound")
    for name in (
        "catalog",
        "state",
        "thumb-root",
        "substrate-root",
        "vault-root",
        "reveal-root",
        "photos-root",
    ):
        parser.add_argument(f"--{name}", type=Path, default=None)
    args = parser.parse_args(argv)

    roots = Roots.from_config()
    roots = Roots(
        catalog_db=args.catalog or roots.catalog_db,
        state_db=args.state or roots.state_db,
        thumb_root=args.thumb_root or roots.thumb_root,
        substrate_root=args.substrate_root or roots.substrate_root,
        vault_root=args.vault_root or roots.vault_root,
        reveal_root=args.reveal_root or roots.reveal_root,
        photos_root=args.photos_root or roots.photos_root,
    )

    server = serve(roots, args.port)
    url = f"http://127.0.0.1:{server.server_address[1]}/"
    counts = server.connection().execute(
        "SELECT kind, count(*) FROM file GROUP BY kind ORDER BY kind"
    ).fetchall()
    # Built here rather than on the first request, which would put its ~700 ms
    # in front of the first paint the reader sees.
    totals = server.kind_totals()
    dimensions = server.facets()["dimensions"]
    print(f"grid on {url}")
    print(f"  host allowlist  {sorted(server.allowed_hosts)}")
    print(f"  catalog         {roots.catalog_db}")
    print(f"  thumbnails      {roots.thumb_root}")
    print(f"  substrates      {roots.substrate_root}")
    print(f"  reveal root     {roots.reveal_root}")
    print(f"  triage root     {roots.photos_root}")
    print("  kinds           " + ", ".join(f"{kind} {count:,}" for kind, count in counts))
    print("  grid photos     " + ", ".join(f"{kind} {n:,}" for kind, n in sorted(totals.items())))
    print(
        "  filters         "
        + ", ".join(f"{d['name']} {len(d['options'])}" for d in dimensions)
    )
    if args.open:
        import webbrowser

        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
