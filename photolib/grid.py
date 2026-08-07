"""The grid and the triage screens: one server, two modes of one client.

    GET  /                                                the page
    GET  /api/photos?before=&before_id=&limit=&kind=      a keyset page
    GET  /t/<sha256>.webp                                 a thumbnail, immutable
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
    length while it still holds only the first page. Counted once per process,
    because it is 1.07 s and it cannot change while the server runs.
  * thumbnail URLs are content hashes, so `immutable` is honest and the browser
    stops asking after the first pass. `F47` is that header on a URL whose
    meaning can change.
  * paging is keyset on the pair `(sort_key, id)`, never OFFSET. 90.5% of photo
    rows share a sort_key with another row and the largest single tie is 9,143,
    so a one-column cursor cannot page through the library at all.
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

from photolib import db, reveal as reveal_module, triage_api
from photolib.config import load, thumb_path

DEFAULT_PORT = 8770  # v1 used 8765 for the dashboard and 8766 for the review API

# `kind` is a query parameter from the first commit even though it is the only
# filter, so later facets extend the contract instead of renegotiating it.
KINDS = frozenset({"image", "raw_image", "video"})
DEFAULT_KINDS = ("image", "raw_image")

DEFAULT_LIMIT = 500
MAX_LIMIT = 1000

STATIC_DIR = Path(__file__).resolve().parent / "static"
# `bundle.js` and `bundle.css` are built from `ui/src` by `npm run build` and
# committed, so the server runs from a clean checkout with no node toolchain.
# `index.html` is hand-written and is not a build output.
STATIC_ROUTES = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/bundle.js": ("bundle.js", "text/javascript; charset=utf-8"),
    "/bundle.css": ("bundle.css", "text/css; charset=utf-8"),
}

# 64 lowercase hex characters cannot traverse, cannot be absolute and cannot
# hold a separator, so this pattern IS the containment proof for /t/. That is
# structurally stronger than checking a joined path afterwards, and it costs no
# database round-trip — one query per thumbnail would dominate first paint.
THUMB_ROUTE = re.compile(r"^/t/([0-9a-f]{64})\.webp$")

# A bound parameter, so this is a size budget rather than injection defence. It
# admits an ISO timestamp and the '-' sentinel that undated photos sort on.
CURSOR_KEY = re.compile(r"^[0-9T:+.Z-]{1,32}$")
CURSOR_ID = re.compile(r"^[0-9]{1,19}$")
LIMIT_VALUE = re.compile(r"^[0-9]{1,5}$")

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


def parse_cursor(before: list[str], before_id: list[str]) -> tuple[str, int] | None:
    """The keyset cursor, or None for the first page.

    Both halves or neither: a half cursor has no defensible interpretation.
    """
    if not before and not before_id:
        return None
    if not before or not before_id:
        raise BadRequest("cursor")
    key, identifier = before[-1], before_id[-1]
    if not CURSOR_KEY.match(key) or not CURSOR_ID.match(identifier):
        raise BadRequest("cursor")
    return key, int(identifier)


def page_sql(kinds: tuple[str, ...], cursor: tuple[str, int] | None) -> tuple[str, list]:
    """The page query and its parameters, minus the LIMIT value.

    The placeholders are generated from the *count* of already-validated kinds;
    no token from the query string reaches the SQL text. The first page omits
    the cursor predicate entirely rather than binding a magic high-water key.
    """
    where = ["f.kind IN ({})".format(", ".join("?" * len(kinds)))]
    params: list = list(kinds)
    if cursor is not None:
        where.append("(p.sort_key, p.id) < (?, ?)")
        params += [cursor[0], cursor[1]]
    sql = (
        "SELECT p.id, f.sha256, f.width, f.height, f.thumbhash, p.sort_key\n"
        "FROM photo AS p\n"
        "JOIN file AS f ON f.sha256 = p.rep_sha256\n"
        f"WHERE {' AND '.join(where)}\n"
        "ORDER BY p.sort_key DESC, p.id DESC\n"
        "LIMIT ?"
    )
    return sql, params


def page(
    conn: sqlite3.Connection,
    kinds: tuple[str, ...],
    cursor,
    limit: int,
    *,
    total: int | None = None,
) -> dict:
    """One keyset page, with an honest end-of-stream marker.

    Reads `limit + 1` rows and returns `limit`. Whether the extra row existed is
    what sets `next`, so exhaustion is a fact rather than an inference — a page
    that happens to hold exactly `limit` rows is not the end, and deriving it
    that way is a bug that only reproduces at particular corpus sizes.

    `total` is how many rows the whole query has, which the client needs in order
    to give the scrollbar its final length on the first page instead of growing
    it under the reader on every page. It is carried rather than computed here:
    it costs 1.07 s and it is the same number for every page, so it is counted
    once per process — see `GridServer.kind_totals`.
    """
    sql, params = page_sql(kinds, cursor)
    rows = conn.execute(sql, [*params, limit + 1]).fetchall()
    has_more = len(rows) > limit
    rows = rows[:limit]
    photos = [
        {
            "id": row[0],
            "s": row[1],
            "w": row[2],
            "h": row[3],
            # Always present, null until step 9 computes ThumbHash. A key that
            # gains a value is not a contract change; a key that appears is.
            "th": base64.b64encode(row[4]).decode("ascii") if row[4] is not None else None,
        }
        for row in rows
    ]
    following = None
    if has_more and rows:
        following = {"before": rows[-1][5], "before_id": rows[-1][0]}
    return {
        "photos": photos,
        "next": following,
        "kind": list(kinds),
        "limit": limit,
        "total": total,
    }


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
        self._totals: dict[str, int] | None = None
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

    def kind_totals(self) -> dict[str, int]:
        """`photo` rows per media kind, counted once and served from memory after.

        The sheet reserves scrollbar height for the pages it has not asked for
        yet, so it needs the size of the whole answer while it still holds only
        the first page. There is no index on `file.kind`, so this is one index
        lookup per tile — 1.07 s when `photo` held one row per file, and 24,536
        lookups since Phase 5 made a tile a group. Every connection in this
        process is read-only, so the answer cannot change while the server runs.
        Counted under the lock rather than around it, so two threads arriving
        together pay for one query and not two; `main` warms it before the
        browser opens, which is why no request ever waits on it.
        """
        with self._totals_lock:
            if self._totals is None:
                self._totals = dict(
                    self.connection().execute(
                        "SELECT f.kind, count(*) FROM photo AS p "
                        "JOIN file AS f ON f.sha256 = p.rep_sha256 GROUP BY f.kind"
                    )
                )
            return self._totals

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
        if path in STATIC_ROUTES:
            self._static(path)
        elif path == "/api/photos":
            self._photos(query)
        elif thumbnail:
            self._thumbnail(thumbnail.group(1))
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
            kinds = parse_kinds(params.get("kind", []))
            limit = parse_limit(params.get("limit", []))
            cursor = parse_cursor(params.get("before", []), params.get("before_id", []))
        except BadRequest as exc:
            self._fail(400, exc.field)
            return
        totals = self.server.kind_totals()
        payload = page(
            self.server.connection(),
            kinds,
            cursor,
            limit,
            total=sum(totals.get(kind, 0) for kind in kinds),
        )
        self._json(200, payload)

    def _thumbnail(self, sha256: str) -> None:
        etag = f'"{sha256}"'
        if self.headers.get("If-None-Match") == etag:
            self._respond(304, b"", (("ETag", etag),))
            return
        try:
            body = thumb_path(self.server.roots.thumb_root, sha256).read_bytes()
        except OSError:
            # Expected: 22,531 stills have no derivative. Step 12's problem.
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
        vault_root=args.vault_root or roots.vault_root,
        reveal_root=args.reveal_root or roots.reveal_root,
        photos_root=args.photos_root or roots.photos_root,
    )

    server = serve(roots, args.port)
    url = f"http://127.0.0.1:{server.server_address[1]}/"
    counts = server.connection().execute(
        "SELECT kind, count(*) FROM file GROUP BY kind ORDER BY kind"
    ).fetchall()
    # Counted here rather than on the first request, which would put its 1.07 s
    # in front of the first paint the reader sees.
    totals = server.kind_totals()
    print(f"grid on {url}")
    print(f"  host allowlist  {sorted(server.allowed_hosts)}")
    print(f"  catalog         {roots.catalog_db}")
    print(f"  thumbnails      {roots.thumb_root}")
    print(f"  reveal root     {roots.reveal_root}")
    print(f"  triage root     {roots.photos_root}")
    print("  kinds           " + ", ".join(f"{kind} {count:,}" for kind, count in counts))
    print("  grid photos     " + ", ".join(f"{kind} {n:,}" for kind, n in sorted(totals.items())))
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
