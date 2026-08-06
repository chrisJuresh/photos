"""The grid server: paging, thumbnails, and the security posture around reveal.

Every test starts a real server on port 0 against a temporary database pair and
a temporary thumbnail tree. No test opens a path from config.toml, no test uses
real media, and the spawn seam means no test launches Explorer.
"""

from __future__ import annotations

import http.client
import json
import sqlite3
import threading
from dataclasses import dataclass
from pathlib import Path

import pytest
import synthetic

from photolib import db, migrate
from photolib.grid import (
    DEFAULT_KINDS,
    MAX_LIMIT,
    BadRequest,
    GridHandler,
    GridServer,
    Roots,
    page_sql,
    parse_cursor,
    parse_kinds,
    parse_limit,
)


# -- harness -------------------------------------------------------------


@dataclass
class Grid:
    port: int
    roots: Roots
    spawns: list
    rows: list
    server: GridServer


def http_request(
    port: int,
    method: str,
    path: str,
    *,
    host: str | None = None,
    headers: tuple = (),
    body: bytes | None = None,
    declared_length: str | None = None,
    send_body: bool = True,
):
    """One request with complete control over the headers, including Host."""
    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
    try:
        conn.putrequest(method, path, skip_host=True, skip_accept_encoding=True)
        conn.putheader("Host", f"127.0.0.1:{port}" if host is None else host)
        for name, value in headers:
            conn.putheader(name, value)
        if declared_length is not None:
            conn.putheader("Content-Length", declared_length)
        elif body is not None:
            conn.putheader("Content-Length", str(len(body)))
        conn.endheaders()
        if body is not None and send_body:
            conn.send(body)
        response = conn.getresponse()
        return response.status, dict(response.getheaders()), response.read()
    finally:
        conn.close()


def get_json(port: int, path: str, **kwargs) -> dict:
    status, _, body = http_request(port, "GET", path, **kwargs)
    assert status == 200, (status, body)
    return json.loads(body)


@pytest.fixture
def make_grid(tmp_path: Path):
    started: list[GridServer] = []

    def factory(*, count: int = 40, tie: int = 0, thumbnails: int = 0) -> Grid:
        # Step 14 promoted the objects, so the base a relpath joins to and the
        # containment root are both the vault root now. They stay two fields
        # because they are two questions -- see `Roots`.
        base = tmp_path / "vault"
        roots = Roots(
            catalog_db=tmp_path / "catalog.sqlite3",
            state_db=tmp_path / "state.sqlite3",
            thumb_root=tmp_path / "thumb",
            vault_root=base,
            reveal_root=base,
            photos_root=tmp_path / "photos",
        )
        (roots.reveal_root).mkdir(parents=True, exist_ok=True)
        roots.thumb_root.mkdir(parents=True, exist_ok=True)
        roots.photos_root.mkdir(parents=True, exist_ok=True)
        rows = synthetic.corpus(roots.catalog_db, roots.state_db, count=count, tie=tie)
        synthetic.write_thumbnails(roots.thumb_root, [row[1] for row in rows[:thumbnails]])

        spawns: list = []
        server = GridServer(
            ("127.0.0.1", 0),
            GridHandler,
            roots,
            lambda command, executable: spawns.append((command, executable)),
        )
        started.append(server)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        return Grid(server.server_address[1], roots, spawns, rows, server)

    yield factory
    for server in started:
        server.shutdown()
        server.server_close()


@pytest.fixture
def grid(make_grid) -> Grid:
    return make_grid(count=40, thumbnails=3)


def walk(port: int, *, limit: int = 500, kind: str | None = None) -> tuple[list[int], int]:
    """Page to exhaustion. Returns the ids in the order served, and the page count."""
    ids: list[int] = []
    pages = 0
    query = f"/api/photos?limit={limit}" + (f"&kind={kind}" if kind else "")
    cursor = None
    while True:
        url = query
        if cursor:
            url += f"&before={cursor['before']}&before_id={cursor['before_id']}"
        body = get_json(port, url)
        ids += [photo["id"] for photo in body["photos"]]
        pages += 1
        cursor = body["next"]
        if cursor is None:
            return ids, pages


# -- query parsing -------------------------------------------------------


def test_kind_defaults_to_stills_including_raw():
    """file.kind has three values. Reading `image` literally hides 16,388 photos."""
    assert parse_kinds([]) == DEFAULT_KINDS
    assert parse_kinds(["image"]) == DEFAULT_KINDS
    assert parse_kinds(["video"]) == ("video",)
    assert parse_kinds(["image,raw_image"]) == DEFAULT_KINDS
    assert parse_kinds(["raw_image"]) == ("raw_image",)
    # `image` expands wherever it appears, not only when it appears alone.
    assert parse_kinds(["image", "video"]) == ("image", "raw_image", "video")
    assert parse_kinds(["video,image"]) == ("image", "raw_image", "video")


@pytest.mark.parametrize("value", ["", "all", "still", "../etc", "image,nope", "IMAGE"])
def test_unknown_kind_is_refused(value):
    with pytest.raises(BadRequest):
        parse_kinds([value])


def test_limit_defaults_and_clamps():
    assert parse_limit([]) == 500
    assert parse_limit(["0"]) == 1
    assert parse_limit(["99999"]) == MAX_LIMIT
    assert parse_limit(["250"]) == 250


@pytest.mark.parametrize("value", ["abc", "-1", "1.5", "", " 5"])
def test_bad_limit_is_refused(value):
    with pytest.raises(BadRequest):
        parse_limit([value])


def test_a_half_cursor_is_refused():
    assert parse_cursor([], []) is None
    assert parse_cursor(["2019-07-04T11:22:33"], ["5"]) == ("2019-07-04T11:22:33", 5)
    for before, before_id in (
        (["2019-07-04T11:22:33"], []),
        ([], ["5"]),
        (["x" * 40], ["5"]),
        (["2019-07-04T11:22:33"], ["abc"]),
        (["photo'"], ["5"]),
    ):
        with pytest.raises(BadRequest):
            parse_cursor(before, before_id)


def test_the_undated_sentinel_is_a_valid_cursor():
    """Undated photos sort on '-', which the cursor has to be able to carry."""
    assert parse_cursor([synthetic.UNDATED], ["1"]) == ("-", 1)


def test_the_page_query_uses_the_photo_sort_index(tmp_path):
    """No index on file.kind, so a planner that drives from `file` scans it all."""
    catalog, state = tmp_path / "catalog.sqlite3", tmp_path / "state.sqlite3"
    migrate.apply(catalog, state)
    conn = db.connect(catalog, state, read_only=True)
    try:
        for cursor in (None, ("2019-07-04T11:22:33", 5)):
            sql, params = page_sql(DEFAULT_KINDS, cursor)
            plan = " ".join(
                str(row) for row in conn.execute("EXPLAIN QUERY PLAN " + sql, [*params, 501])
            )
            assert "photo_sort" in plan
            assert "TEMP B-TREE" not in plan
            assert "SCAN file" not in plan
    finally:
        conn.close()


# -- paging --------------------------------------------------------------


def test_first_page_shape(grid):
    body = get_json(grid.port, "/api/photos?limit=5")
    assert body["limit"] == 5
    assert body["kind"] == list(DEFAULT_KINDS)
    assert len(body["photos"]) == 5
    photo = body["photos"][0]
    assert set(photo) == {"id", "s", "w", "h", "th"}
    assert len(photo["s"]) == 64
    # The cursor names the last row of the page, and only the last row.
    assert body["next"]["before_id"] == body["photos"][-1]["id"]
    assert body["next"]["before"] == dict(
        (row[0], row[3]) for row in grid.rows
    )[body["photos"][-1]["id"]]


def test_a_full_walk_pages_through_a_tie_wider_than_a_page(make_grid):
    """1,200 rows on one sort_key, paged 500 at a time.

    This is the test a one-column cursor cannot pass: it either repeats a page
    forever or skips the rest of the tie. The real catalog's largest tie is
    9,143 rows over a 500-row page, so this is the ordinary case, not an edge.
    """
    grid = make_grid(count=1300, tie=1200)
    ids, pages = walk(grid.port, limit=500)

    assert len(ids) == 1300
    assert len(set(ids)) == 1300  # every photo exactly once
    assert ids == synthetic.expected_order(grid.rows)  # and in the right order
    assert pages == 3

    # ...and prove a page boundary actually fell inside the tie, otherwise the
    # corpus could satisfy every assertion above without exercising it.
    first = get_json(grid.port, "/api/photos?limit=500")
    second = get_json(
        grid.port,
        f"/api/photos?limit=500&before={first['next']['before']}"
        f"&before_id={first['next']['before_id']}",
    )
    assert first["photos"][-1]["id"] != second["photos"][0]["id"]
    assert first["next"]["before"] == "2019-07-04T11:22:33"


def test_end_of_stream_is_explicit_not_inferred(make_grid):
    """Exactly 1,000 rows at limit 500: page two is full AND final.

    Deriving exhaustion from `len(photos) < limit` is wrong here, and wrong only
    when the corpus size is a multiple of the page size.
    """
    grid = make_grid(count=1000)
    body = get_json(grid.port, "/api/photos?limit=500")
    second = get_json(
        grid.port,
        f"/api/photos?limit=500&before={body['next']['before']}"
        f"&before_id={body['next']['before_id']}",
    )
    assert len(second["photos"]) == 500
    assert second["next"] is None


def test_undated_photos_sort_last(make_grid):
    grid = make_grid(count=10)
    conn = sqlite3.connect(grid.roots.catalog_db)
    conn.execute("UPDATE photo SET sort_key = ? WHERE id IN (3, 7)", (synthetic.UNDATED,))
    conn.commit()
    conn.close()
    ids, _ = walk(grid.port)
    assert ids[-2:] == [7, 3]


def test_every_page_carries_the_length_of_the_whole_walk(make_grid):
    """The client reserves scrollbar height from this while it holds one page.

    On every page and not only the first, because a client that resumes from a
    cursor -- a reflow, a re-mount -- never sees the first one. And equal to the
    walk it is reserving for: a total that disagrees with the paging is a
    scrollbar that lies in a direction nobody can see until the last page.
    """
    grid = make_grid(count=120)
    ids, pages = walk(grid.port, limit=50)
    assert pages == 3  # so there is a middle page and a last one to check
    cursor = None
    for _ in range(pages):
        url = "/api/photos?limit=50" + (
            f"&before={cursor['before']}&before_id={cursor['before_id']}" if cursor else ""
        )
        body = get_json(grid.port, url)
        assert body["total"] == len(ids) == 120
        cursor = body["next"]


def test_the_total_follows_the_kind_selection(grid):
    """One memo per kind, summed per request -- not one count of everything.

    `raw_image` is 1 photo in 9 here, so a total that ignored `kind` would be
    caught, and one that counted only `image` would be caught the other way.
    """
    stills, _ = walk(grid.port)
    raw, _ = walk(grid.port, kind="raw_image")
    assert get_json(grid.port, "/api/photos?kind=raw_image")["total"] == len(raw)
    assert get_json(grid.port, "/api/photos")["total"] == len(stills)
    assert 0 < len(raw) < len(stills)


def test_the_total_is_counted_once_for_the_life_of_the_server(grid):
    """1.07 s over the real corpus, and it cannot change: every connection here
    is read-only. Paying it per page would put it in front of every scroll."""
    first = grid.server.kind_totals()
    get_json(grid.port, "/api/photos?limit=1")
    assert grid.server.kind_totals() is first


def test_kind_selects_over_http(grid):
    stills, _ = walk(grid.port)
    raw, _ = walk(grid.port, kind="raw_image")
    assert set(raw) < set(stills)
    assert raw  # the corpus does contain raw_image rows
    comma, _ = walk(grid.port, kind="image,raw_image")
    assert comma == stills


def test_a_rejected_kind_is_not_echoed_back(grid):
    status, _, body = http_request(grid.port, "GET", "/api/photos?kind=image,%3Cscript%3E")
    assert status == 400
    assert json.loads(body) == {"error": "kind"}
    assert b"script" not in body


def test_limit_is_clamped_and_echoed(grid):
    assert get_json(grid.port, "/api/photos?limit=99999")["limit"] == MAX_LIMIT
    status, _, _ = http_request(grid.port, "GET", "/api/photos?limit=abc")
    assert status == 400
    status, _, _ = http_request(grid.port, "GET", "/api/photos?before=2020-01-01T00:00:00")
    assert status == 400


def test_thumbhash_is_null_now_and_base64_later(make_grid):
    """The key is present either way — step 9 changes a value, not the contract."""
    grid = make_grid(count=4)
    assert all(photo["th"] is None for photo in get_json(grid.port, "/api/photos")["photos"])

    conn = sqlite3.connect(grid.roots.catalog_db)
    sha = grid.rows[0][1]
    conn.execute("UPDATE file SET thumbhash = ? WHERE sha256 = ?", (b"\x01\x02\x03", sha))
    conn.commit()
    conn.close()

    photos = get_json(grid.port, "/api/photos")["photos"]
    assert set(photos[0]) == {"id", "s", "w", "h", "th"}
    assert [p["th"] for p in photos if p["s"] == sha] == ["AQID"]


# -- thumbnails ----------------------------------------------------------


def test_thumbnail_is_served_immutable_with_an_etag(grid):
    sha = grid.rows[0][1]
    status, headers, body = http_request(grid.port, "GET", f"/t/{sha}.webp")
    assert status == 200
    assert body == synthetic.TINY_WEBP
    assert headers["Content-Type"] == "image/webp"
    assert headers["Cache-Control"] == "private, max-age=31536000, immutable"
    assert headers["ETag"] == f'"{sha}"'


def test_thumbnail_revalidates_with_if_none_match(grid):
    sha = grid.rows[0][1]
    status, _, body = http_request(
        grid.port, "GET", f"/t/{sha}.webp", headers=(("If-None-Match", f'"{sha}"'),)
    )
    assert status == 304
    assert body == b""


def test_a_query_string_does_not_break_the_thumbnail_route(grid):
    sha = grid.rows[0][1]
    status, _, _ = http_request(grid.port, "GET", f"/t/{sha}.webp?v=1")
    assert status == 200


def test_a_missing_thumbnail_is_a_plain_404(grid):
    """22,531 stills have no derivative. That is expected, not an error."""
    sha = grid.rows[-1][1]
    status, _, body = http_request(grid.port, "GET", f"/t/{sha}.webp")
    assert status == 404
    assert body == b""


@pytest.mark.parametrize(
    "path",
    [
        "/t/../../config.toml",
        "/t/..%2f..%2fconfig.toml",
        "/t/%2e%2e%2f%2e%2e%2fconfig.toml",
        "/t/" + "a" * 63 + ".webp",
        "/t/" + "a" * 65 + ".webp",
        "/t/" + "A" * 64 + ".webp",
        "/t/" + "z" * 64 + ".webp",
        "/t/" + "a" * 64 + ".png",
        "/t/" + "a" * 64 + ".webp/",
        "/t/",
    ],
)
def test_the_thumbnail_route_only_matches_64_hex(grid, path):
    """The pattern IS the containment proof: 64 hex cannot traverse or escape."""
    status, _, body = http_request(grid.port, "GET", path)
    assert status == 404
    assert b"reveal_root" not in body and b"photos_root" not in body


def test_thumbnails_never_open_the_database(grid, monkeypatch):
    """Presence is a filesystem fact. A query per tile would dominate first paint."""
    monkeypatch.setattr(
        GridServer, "connection", lambda self: pytest.fail("thumbnail opened the catalog")
    )
    sha = grid.rows[0][1]
    status, _, _ = http_request(grid.port, "GET", f"/t/{sha}.webp")
    assert status == 200


# -- static and headers --------------------------------------------------


def test_index_is_served_without_inline_script(grid):
    status, headers, body = http_request(grid.port, "GET", "/")
    assert status == 200
    assert headers["Content-Type"].startswith("text/html")
    assert b'src="/bundle.js"' in body and b'href="/bundle.css"' in body
    # The CSP carries no 'unsafe-inline', so an inline block would not execute.
    assert b"<script>" not in body


def test_the_built_bundle_is_committed_and_current(grid):
    """The two build outputs are checked in, so a clean checkout runs without npm.

    They are also the one place this repository holds generated code, which is
    only safe while they are actually present — a missing bundle turns the whole
    client into a 404 that no Python test would otherwise notice.
    """
    for path, content_type in (("/bundle.js", "text/javascript"), ("/bundle.css", "text/css")):
        status, headers, body = http_request(grid.port, "GET", path)
        assert status == 200, path
        assert headers["Content-Type"].startswith(content_type)
        assert body, path


@pytest.mark.parametrize(
    "path", ["/", "/bundle.js", "/bundle.css", "/api/photos", "/t/x.webp", "/nope"]
)
def test_security_headers_are_on_every_response(grid, path):
    _, headers, _ = http_request(grid.port, "GET", path)
    assert headers["X-Content-Type-Options"] == "nosniff"
    assert headers["Referrer-Policy"] == "no-referrer"
    assert headers["X-Frame-Options"] == "DENY"
    assert "default-src 'none'" in headers["Content-Security-Policy"]
    assert "Access-Control-Allow-Origin" not in headers


def test_unknown_routes_are_404(grid):
    for path in ("/api/nope", "/static/bundle.js", "//evil", "/index.html"):
        status, _, _ = http_request(grid.port, "GET", path)
        assert status == 404, path


def test_the_server_is_loopback_only_and_does_not_share_its_address(grid):
    assert grid.server.server_address[0] == "127.0.0.1"
    # http.server sets this to 1; on Windows it lets a second process bind the
    # same address and take over connections.
    assert GridServer.allow_reuse_address is False


# -- Host and Origin -----------------------------------------------------


def test_the_host_allowlist_accepts_loopback(grid):
    for host in (f"127.0.0.1:{grid.port}", f"localhost:{grid.port}", f"LOCALHOST:{grid.port}"):
        status, _, _ = http_request(grid.port, "GET", "/api/photos?limit=1", host=host)
        assert status == 200, host


@pytest.mark.parametrize("path", ["/", "/bundle.js", "/api/photos", "/t/x.webp"])
def test_a_foreign_host_header_is_refused(grid, path):
    """F48: a name an attacker controls that resolves to 127.0.0.1 is same-origin
    to the browser, so CSP does not help and only a Host allowlist does."""
    for host in ("evil.example", f"evil.example:{grid.port}", "127.0.0.1", f"[::1]:{grid.port}", ""):
        status, _, _ = http_request(grid.port, "GET", path, host=host)
        assert status == 403, (path, host)


def test_the_host_allowlist_is_bound_to_the_actual_port(grid):
    status, _, _ = http_request(grid.port, "GET", "/api/photos", host=f"127.0.0.1:{grid.port + 1}")
    assert status == 403


# -- reveal --------------------------------------------------------------


def reveal_post(grid, payload=b'{"id": 1}', *, origin=None, **kwargs):
    headers = kwargs.pop("headers", ())
    if origin is None:
        origin = f"http://127.0.0.1:{grid.port}"
    if origin is not False:
        headers = (("Origin", origin), *headers)
    headers = (("Content-Type", "application/json"), *headers)
    return http_request(grid.port, "POST", "/api/reveal", headers=headers, body=payload, **kwargs)


@pytest.fixture
def revealable(make_grid):
    """A grid whose photos 1 and 2 are real files with a space and a comma."""
    grid = make_grid(count=4)
    conn = sqlite3.connect(grid.roots.catalog_db)
    names = {1: "a space.jpg", 2: "a,comma.jpg"}
    for photo_id, name in names.items():
        sha = conn.execute("SELECT rep_sha256 FROM photo WHERE id = ?", (photo_id,)).fetchone()[0]
        relpath = name
        (grid.roots.vault_root / name).write_bytes(b"jpg")
        conn.execute("UPDATE file SET vault_relpath = ? WHERE sha256 = ?", (relpath, sha))
    conn.commit()
    conn.close()
    return grid, names


def test_reveal_spawns_the_right_command_for_space_and_comma_paths(revealable):
    """The two shapes v1's argv form gets wrong. `/select,` must stay unquoted."""
    grid, names = revealable
    for photo_id, name in names.items():
        status, _, _ = reveal_post(grid, json.dumps({"id": photo_id}).encode())
        assert status == 204
    assert len(grid.spawns) == 2
    for (command, executable), name in zip(grid.spawns, names.values()):
        expected = grid.roots.reveal_root / name
        assert command == f'"{executable}" /select,"{expected}"'
        assert '"/select,' not in command


def test_reveal_requires_post(grid):
    for method in ("GET", "PUT", "DELETE", "OPTIONS"):
        status, _, _ = http_request(grid.port, method, "/api/reveal")
        assert status == 405, method
    assert grid.spawns == []


def test_reveal_requires_a_same_origin_header(grid):
    status, _, _ = reveal_post(grid, origin=False)
    assert status == 403
    for origin in (
        "http://evil.example",
        "null",
        f"https://127.0.0.1:{grid.port}",
        f"http://127.0.0.1:{grid.port + 1}",
        f"http://localhost.evil.example:{grid.port}",
    ):
        status, _, _ = reveal_post(grid, origin=origin)
        assert status == 403, origin
    assert grid.spawns == []


def test_the_expected_origin_is_not_derived_from_the_host_header(grid):
    """v1 built the expected origin from the Host header the caller supplied.

    That is only safe if a host allowlist ran first. Here the allowlist is
    literal, so a self-consistent Host/Origin pair from a foreign name fails.
    """
    status, _, _ = reveal_post(
        grid,
        origin=f"http://evil.example:{grid.port}",
        host=f"evil.example:{grid.port}",
    )
    assert status == 403
    assert grid.spawns == []


def test_reveal_requires_a_json_content_type(grid):
    status, _, _ = http_request(
        grid.port,
        "POST",
        "/api/reveal",
        headers=(("Origin", f"http://127.0.0.1:{grid.port}"), ("Content-Type", "text/plain")),
        body=b'{"id": 1}',
    )
    assert status == 415
    assert grid.spawns == []


def test_the_body_budget_is_enforced_before_the_body_is_read(grid):
    """F45: a limit applied after buffering is not a limit."""
    status, _, _ = reveal_post(grid, b"x" * 16, declared_length="4096", send_body=False)
    assert status == 413
    status, _, _ = reveal_post(
        grid, None, headers=(("Transfer-Encoding", "chunked"),)
    )
    assert status == 400
    status, _, _ = http_request(
        grid.port,
        "POST",
        "/api/reveal",
        headers=(
            ("Origin", f"http://127.0.0.1:{grid.port}"),
            ("Content-Type", "application/json"),
        ),
    )
    assert status == 411
    assert grid.spawns == []


@pytest.mark.parametrize(
    "payload",
    [b"{}", b'{"id": "5"}', b'{"id": true}', b'{"id": 1.0}', b'{"id": 0}', b'{"id": -1}',
     b"[1]", b"not json", b'{"id": null}'],
)
def test_a_bad_reveal_payload_is_refused(grid, payload):
    """`{"id": true}` is the one that catches isinstance(True, int) being True."""
    status, _, _ = reveal_post(grid, payload)
    assert status == 400, payload
    assert grid.spawns == []


def test_an_unknown_photo_id_is_404(grid):
    status, _, _ = reveal_post(grid, b'{"id": 99999}')
    assert status == 404
    assert grid.spawns == []


def test_an_escaping_vault_relpath_is_refused_without_leaking_it(make_grid):
    grid = make_grid(count=2)
    (grid.roots.vault_root.parent / "outside.txt").write_bytes(b"secret")
    conn = sqlite3.connect(grid.roots.catalog_db)
    sha = conn.execute("SELECT rep_sha256 FROM photo WHERE id = 1").fetchone()[0]
    conn.execute(
        "UPDATE file SET vault_relpath = ? WHERE sha256 = ?", (r"ab\..\..\outside.txt", sha)
    )
    conn.commit()
    conn.close()

    status, _, body = reveal_post(grid, b'{"id": 1}')
    assert status == 403
    assert grid.spawns == []
    # The client gets a field name. Neither the path nor any absolute path leaks.
    assert b"outside" not in body and b"C:" not in body


def test_reveal_by_origin_resolves_under_the_photos_root(make_grid):
    """A triage subject is an `origin` path, not a photo.

    Most of what triage looks at has no `photo` row and 85% of it has no
    thumbnail, so the path is how you identify it — and revealing it is how you
    look at the ones the sheet cannot show you.
    """
    grid = make_grid(count=2)
    target = grid.roots.photos_root / "lumix" / "DCIM" / "P1080096.JPG"
    target.parent.mkdir(parents=True)
    target.write_bytes(b"jpg")
    conn = sqlite3.connect(grid.roots.catalog_db)
    conn.execute(
        "INSERT INTO origin (id, path, root, ext, size, sha256, seen_at) "
        "VALUES (7, ?, 'lumix', '.jpg', 3, ?, '2026-08-03T00:00:00+00:00')",
        (str(target), "a" * 64),
    )
    conn.commit()
    conn.close()

    status, _, _ = reveal_post(grid, b'{"origin": 7}')
    assert status == 204
    command, executable = grid.spawns[0]
    assert command == f'"{executable}" /select,"{target}"'


def test_an_origin_path_outside_the_photos_root_is_refused(make_grid):
    """The containment root is fixed by the id kind, never searched.

    `F05` and `F13` are a *set* of roots tried until one passes. Here a request
    carrying `origin` is proven against `photos_root` and against nothing else,
    so a row naming a vault object does not quietly resolve through the other
    root.
    """
    grid = make_grid(count=2)
    outside = grid.roots.vault_root / "elsewhere.jpg"
    outside.write_bytes(b"jpg")
    conn = sqlite3.connect(grid.roots.catalog_db)
    conn.execute(
        "INSERT INTO origin (id, path, root, ext, size, sha256, seen_at) "
        "VALUES (7, ?, 'x', '.jpg', 3, ?, '2026-08-03T00:00:00+00:00')",
        (str(outside), "b" * 64),
    )
    conn.commit()
    conn.close()

    status, _, body = reveal_post(grid, b'{"origin": 7}')
    assert status == 403
    assert grid.spawns == []
    assert b"elsewhere" not in body and b"C:" not in body


def test_an_unknown_origin_id_is_404(grid):
    status, _, _ = reveal_post(grid, b'{"origin": 99999}')
    assert status == 404
    assert grid.spawns == []


@pytest.mark.parametrize(
    "payload",
    [b'{"id": 1, "origin": 1}', b'{"origin": "5"}', b'{"origin": true}', b'{"origin": 0}'],
)
def test_reveal_refuses_an_ambiguous_or_malformed_id_kind(grid, payload):
    """Two ids is not a preference to resolve silently; it is a bad request."""
    status, _, _ = reveal_post(grid, payload)
    assert status == 400, payload
    assert grid.spawns == []


def test_an_empty_vault_relpath_is_refused(make_grid):
    grid = make_grid(count=2)
    conn = sqlite3.connect(grid.roots.catalog_db)
    conn.execute("UPDATE file SET vault_relpath = NULL")
    conn.commit()
    conn.close()
    status, _, _ = reveal_post(grid, b'{"id": 1}')
    assert status == 409
    assert grid.spawns == []


# -- the read-only guarantee ---------------------------------------------


def test_the_server_writes_nothing(revealable):
    """Everything except a WAL sidecar beside the catalog, which is named here."""
    grid, _ = revealable

    def snapshot() -> dict[str, tuple[int, int]]:
        seen = {}
        for root in (grid.roots.vault_root, grid.roots.thumb_root):
            for path in sorted(root.rglob("*")):
                if path.is_file():
                    stat = path.stat()
                    seen[str(path)] = (stat.st_size, stat.st_mtime_ns)
        for path in (grid.roots.catalog_db, grid.roots.state_db):
            stat = path.stat()
            seen[str(path)] = (stat.st_size, stat.st_mtime_ns)
        return seen

    before = snapshot()
    walk(grid.port)
    for row in grid.rows:
        http_request(grid.port, "GET", f"/t/{row[1]}.webp")
    assert reveal_post(grid, b'{"id": 1}')[0] == 204
    assert snapshot() == before

    sidecars = {
        path.name
        for path in grid.roots.catalog_db.parent.iterdir()
        if path.name.startswith("catalog.sqlite3-") or path.name.startswith("state.sqlite3-")
    }
    assert sidecars <= {
        "catalog.sqlite3-shm",
        "catalog.sqlite3-wal",
        "state.sqlite3-shm",
        "state.sqlite3-wal",
    }


def test_the_servers_connection_is_read_only(grid):
    conn = grid.server.connection()
    with pytest.raises(sqlite3.OperationalError):
        conn.execute("INSERT INTO photo (id, rep_sha256, sort_key) VALUES (9999, 'x', 'y')")
