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

from photolib import browse, db, migrate
from photolib import grid as grid_module
from photolib.browse import SORTS, BadFilter, page_sql, parse_cursor
from photolib.grid import (
    DEFAULT_KINDS,
    MAX_LIMIT,
    BadRequest,
    GridHandler,
    GridServer,
    Roots,
    parse_kinds,
    parse_limit,
)

NEWEST = SORTS["newest"]


def selection(**params) -> browse.Query:
    """A `browse.Query` from the query-string form the client would send."""
    values = {key: value if isinstance(value, list) else [value] for key, value in params.items()}
    return browse.parse(values, kinds=parse_kinds(values.get("kind", [])))


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

    def factory(
        *,
        count: int = 40,
        tie: int = 0,
        thumbnails: int = 0,
        substrates: int = 0,
        bursts: int = 0,
    ) -> Grid:
        # Step 14 promoted the objects, so the base a relpath joins to and the
        # containment root are both the vault root now. They stay two fields
        # because they are two questions -- see `Roots`.
        base = tmp_path / "vault"
        roots = Roots(
            catalog_db=tmp_path / "catalog.sqlite3",
            state_db=tmp_path / "state.sqlite3",
            thumb_root=tmp_path / "thumb",
            substrate_root=tmp_path / "substrate",
            vault_root=base,
            reveal_root=base,
            photos_root=tmp_path / "photos",
        )
        (roots.reveal_root).mkdir(parents=True, exist_ok=True)
        roots.thumb_root.mkdir(parents=True, exist_ok=True)
        roots.substrate_root.mkdir(parents=True, exist_ok=True)
        roots.photos_root.mkdir(parents=True, exist_ok=True)
        if bursts:
            rows = synthetic.bursts(roots.catalog_db, roots.state_db, groups=bursts)
        else:
            rows = synthetic.corpus(roots.catalog_db, roots.state_db, count=count, tie=tie)
        synthetic.write_thumbnails(roots.thumb_root, [row[1] for row in rows[:thumbnails]])
        # Disjoint from the thumbnails on purpose: a handler that reads the wrong
        # root then answers 404 where the fixture says 200, in both directions.
        synthetic.write_substrates(
            roots.substrate_root,
            [row[1] for row in rows[thumbnails : thumbnails + substrates]],
        )

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
    return make_grid(count=40, thumbnails=3, substrates=3)


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
    assert parse_cursor(NEWEST, [], []) is None
    assert parse_cursor(NEWEST, ["2019-07-04T11:22:33"], ["5"]) == ("2019-07-04T11:22:33", 5)
    for before, before_id in (
        (["2019-07-04T11:22:33"], []),
        ([], ["5"]),
        (["x" * 40], ["5"]),
        (["2019-07-04T11:22:33"], ["abc"]),
        (["photo'"], ["5"]),
    ):
        with pytest.raises(BadFilter):
            parse_cursor(NEWEST, before, before_id)


def test_the_undated_sentinel_is_a_valid_cursor():
    """Undated photos sort on '-', which the cursor has to be able to carry."""
    assert parse_cursor(NEWEST, [synthetic.UNDATED], ["1"]) == ("-", 1)


def test_a_cursor_is_validated_against_the_selected_sort():
    """A timestamp cursor handed to `largest` would page through nothing.

    SQLite compares text against an integer by storage class, so `('2019-…', 5)
    < (f.size, p.id)` is not a mistake it reports -- it is a page that silently
    ends. Which is why the key half is parsed by the sort that will bind it, and
    comes back typed.
    """
    assert parse_cursor(SORTS["largest"], ["4194304"], ["5"]) == (4194304, 5)
    assert parse_cursor(SORTS["best"], ["0.1965"], ["5"]) == (0.1965, 5)
    assert parse_cursor(SORTS["worst"], ["-1000000000.0"], ["5"]) == (-1e9, 5)
    for sort, key in (
        ("largest", "2019-07-04T11:22:33"),
        ("largest", "1.5"),
        ("newest", "1e9"),
        ("best", "0.1 or 1=1"),
        ("best", "nan"),
    ):
        with pytest.raises(BadFilter):
            parse_cursor(SORTS[sort], [key], ["5"])


@pytest.fixture
def planner(tmp_path):
    """A migrated, empty database, for asking the planner what it would do."""
    catalog, state = tmp_path / "catalog.sqlite3", tmp_path / "state.sqlite3"
    migrate.apply(catalog, state)
    conn = db.connect(catalog, state, read_only=True)
    yield conn
    conn.close()


def plan_for(conn, query, cursor=None) -> str:
    sql, params = page_sql(query, cursor)
    return " ".join(str(row) for row in conn.execute("EXPLAIN QUERY PLAN " + sql, [*params, 501]))


def test_the_page_query_uses_the_photo_sort_index(planner):
    """No index on file.kind, so a planner that drives from `file` scans it all."""
    for cursor in (None, ("2019-07-04T11:22:33", 5)):
        plan = plan_for(planner, selection(), cursor)
        assert "photo_sort" in plan
        assert "TEMP B-TREE" not in plan
        assert "SCAN file" not in plan


# Every filter, one at a time, in the form the header sends. A value that has to
# exist in the corpus is not needed here: the planner is being asked about the
# shape of the query, not about the answer.
EVERY_FILTER = [
    {"kind": "video"},
    {"ext": ".jpg"},
    {"ext": ["", ".jpg"]},
    {"camera": "Panasonic DMC-GX80"},
    {"camera": ""},
    {"camera": ["", "SONY NEX-5N"]},
    {"lens": "LUMIX G 42.5/F1.7"},
    {"year": "2025"},
    {"year": "2024,2025"},
    {"month": "7"},
    {"month": ["7", "8"]},
    {"orient": "portrait"},
    {"orient": "landscape,portrait,square,unknown"},
    {"res": "huge"},
    {"size": "5to20mb"},
    {"grade": "best"},
    {"grade": "unscored"},
    {"gps": "yes"},
    {"gps": "no"},
    {"pair": "pair"},
    {"pair": "single"},
    {"dup": "dup"},
    {"dup": "unique"},
    {"dated": "exif"},
    {"root": "lumix f 7-15-26 sd"},
    {"root": ["a", "b"]},
]


@pytest.mark.parametrize("params", EVERY_FILTER, ids=lambda p: "+".join(sorted(p)))
def test_every_filter_keeps_the_default_sort_on_the_index(planner, params):
    """The property that makes a filtered page 9-15 ms instead of 230.

    `photo_sort` supplies the order, so the query stops as soon as it has filled
    a page rather than sorting the library and taking the first 500 -- which is
    also why no filter here needs an index of its own.
    """
    plan = plan_for(planner, selection(**params))
    assert "photo_sort" in plan, plan
    assert "TEMP B-TREE" not in plan, plan
    assert "SCAN file" not in plan, plan


@pytest.mark.parametrize("name", sorted(SORTS))
def test_every_sort_pages_without_scanning_file(planner, name):
    """An alternate ordering sorts `photo` -- 230-290 ms, the price of the sort --
    but it must still reach `file` by its primary key and never scan it."""
    query = selection(sort=name)
    for cursor in (None, parse_cursor(SORTS[name], ["0"] if SORTS[name].cursor != "time" else ["-"], ["5"])):
        plan = plan_for(planner, query, cursor)
        assert "SCAN file" not in plan, plan
        if SORTS[name].indexed:
            assert "photo_sort" in plan and "TEMP B-TREE" not in plan, plan


def test_a_filter_set_is_one_key_however_it_is_spelled():
    """The `total` memo is keyed on the parsed selection, so two spellings of one
    selection are one count and not two."""
    assert selection(year="2024,2025") == selection(year=["2025", "2024"])
    assert selection(kind="image") == selection(kind="image,raw_image")
    assert selection(camera=["a", "b", "a"]) == selection(camera=["b", "a"])
    assert selection(year="2024") != selection(year="2025")
    assert selection(sort="largest") != selection(sort="smallest")


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


def test_the_facets_route_serves_the_whole_vocabulary(grid):
    body = get_json(grid.port, "/api/facets")
    assert body["total"] == 40
    assert body["kinds"] == {"image": 35, "raw_image": 5}  # every ninth is raw
    names = [dimension["name"] for dimension in body["dimensions"]]
    assert names[:3] == ["kind", "year", "month"]
    assert set(names) >= {"camera", "ext", "orient", "size", "grade", "gps", "pair", "dup"}
    for dimension in body["dimensions"]:
        assert set(dimension) == {"name", "title", "hint", "options"}
        assert dimension["title"]
        for option in dimension["options"]:
            assert set(option) == {"value", "label", "count"}
    # The sorts come with the vocabulary, so the client hardcodes no ordering.
    assert [entry["value"] for entry in body["sorts"]] == list(SORTS)
    assert all(entry["label"] for entry in body["sorts"])


def test_the_facets_route_is_built_once_for_the_life_of_the_server(grid):
    """~700 ms over the real corpus, and it cannot change: every connection here
    is read-only. `main` warms it before the browser opens."""
    first = grid.server.facets()
    get_json(grid.port, "/api/facets")
    assert grid.server.facets() is first
    assert grid.server.kind_totals() is first["kinds"]


def test_filters_select_over_http(grid):
    """The synthetic corpus is every 9th photo raw and five shapes in rotation, so
    an orientation and an extension are both real predicates over it."""
    everything = get_json(grid.port, "/api/photos?kind=image,raw_image,video&limit=1000")
    portrait = get_json(grid.port, "/api/photos?kind=image,raw_image,video&orient=portrait&limit=1000")
    square = get_json(grid.port, "/api/photos?kind=image,raw_image,video&orient=square&limit=1000")
    assert 0 < len(portrait["photos"]) < len(everything["photos"])
    assert all(photo["h"] > photo["w"] for photo in portrait["photos"])
    assert all(photo["w"] == photo["h"] for photo in square["photos"])
    # Two values of one dimension widen rather than narrow.
    both = get_json(
        grid.port, "/api/photos?kind=image,raw_image,video&orient=portrait,square&limit=1000"
    )
    assert len(both["photos"]) == len(portrait["photos"]) + len(square["photos"])


def test_the_total_follows_the_whole_filter_set(grid):
    """Not just `kind`: a scrollbar sized for the unfiltered library under a
    filter that removes four fifths of it is a bar that lies."""
    for query in ("", "&orient=portrait", "&orient=square", "&ext=.jpg", "&size=under1mb"):
        body = get_json(grid.port, f"/api/photos?kind=image,raw_image,video&limit=1000{query}")
        assert body["total"] == len(body["photos"]), query


def test_a_total_is_counted_once_per_filter_set(grid):
    """Memoised on the parsed selection, so paging does not recount, and two
    spellings of one selection do not count twice."""
    counted = []
    original = GridServer.total

    def spy(server, query):
        counted.append(query)
        return original(server, query)

    GridServer.total = spy
    try:
        for url in (
            "/api/photos?limit=5&orient=portrait",
            "/api/photos?limit=5&orient=portrait",  # same selection, again
            "/api/photos?limit=5&orient=portrait&kind=image,raw_image",  # the default kind
            "/api/photos?limit=5&orient=square",  # a different one
        ):
            get_json(grid.port, url)
    finally:
        GridServer.total = original
    assert len(counted) == 4  # asked four times...
    assert len(set(counted)) == 2  # ...for two distinct selections
    assert len(grid.server._totals) == 2  # ...and counted twice


def test_sorting_over_http_reorders_and_still_pages(grid):
    newest = get_json(grid.port, "/api/photos?limit=1000")
    largest = get_json(grid.port, "/api/photos?limit=1000&sort=largest")
    assert largest["sort"] == "largest"
    assert newest["sort"] == "newest"
    assert {photo["id"] for photo in largest["photos"]} == {
        photo["id"] for photo in newest["photos"]
    }
    # Every synthetic file is one byte, so `largest` is a total tie broken by id.
    assert [photo["id"] for photo in largest["photos"]] == sorted(
        (photo["id"] for photo in largest["photos"]), reverse=True
    )


def test_a_cursor_is_validated_by_the_sort_that_will_bind_it(grid):
    """The client sends the cursor back verbatim, so it is parsed against the sort
    named in the same request and not against the default.

    Only one direction of the mismatch is structural: a timestamp is not an
    integer, so `sort=largest` refuses it. The reverse -- a numeric key reaching
    the timestamp ordering -- is a size budget and not a type check, and the
    client cannot produce it anyway: changing the sort resets the sheet, which
    drops the cursor with it.
    """
    body = get_json(grid.port, "/api/photos?limit=5")
    cursor = f"before={body['next']['before']}&before_id={body['next']['before_id']}"
    status, _, payload = http_request(grid.port, "GET", f"/api/photos?limit=5&sort=largest&{cursor}")
    assert status == 400
    assert json.loads(payload) == {"error": "cursor"}
    assert get_json(grid.port, f"/api/photos?limit=5&{cursor}")["photos"]

    # ...and a cursor is carried by every sort that has one to carry.
    for name in SORTS:
        first = get_json(grid.port, f"/api/photos?limit=5&sort={name}")
        following = first["next"]
        second = get_json(
            grid.port,
            f"/api/photos?limit=5&sort={name}"
            f"&before={following['before']}&before_id={following['before_id']}",
        )
        assert second["photos"], name
        assert not ({photo["id"] for photo in second["photos"]}
                    & {photo["id"] for photo in first["photos"]}), name


# -- stacking ------------------------------------------------------------


@pytest.fixture
def stacked(make_grid) -> Grid:
    """Twelve bursts: 74 tiles that collapse to 38 stacks at any window."""
    return make_grid(bursts=12)


def expected_stacks(rows) -> dict[str, list[int]]:
    """The grouping the corpus was built to produce, from the plan and not the
    endpoint. Members are in capture order. See `synthetic.bursts`."""
    stacks: dict[str, list[int]] = {}
    for row in rows:
        stacks.setdefault(row[5], []).append(row[0])
    return stacks


def expected_covers(rows) -> dict[str, int]:
    """The member each stack must be drawn as, read off `synthetic.BURST_PLAN`.

    Named by where the frame sits in the plan rather than by re-running the rule
    the endpoint is being tested for: the bracket's middle exposure, the pair's
    sharper frame, and -- in the bursts whose brightest frame has no quality
    scalars at all -- the darker of the two that can still be ranked.
    """
    covers = {}
    for stack, members in expected_stacks(rows).items():
        group, name = stack.split(":", 1)
        bracketed = name == "bracket" and not synthetic.brightest_failed(int(group))
        covers[stack] = members[1] if bracketed else members[0]
    return covers


def walk_stacked(port: int, query: str, limit: int = 500):
    """Page a stacked selection to exhaustion. Returns [(cover id, size)]."""
    covers: list[tuple[int, int]] = []
    cursor = None
    for _ in range(200):
        url = f"/api/photos?limit={limit}&{query}"
        if cursor:
            url += f"&before={cursor['before']}&before_id={cursor['before_id']}"
        body = get_json(port, url)
        covers += [(photo["id"], photo["n"]) for photo in body["photos"]]
        cursor = body["next"]
        if cursor is None:
            return covers
    raise AssertionError("paging did not terminate")


def test_a_stacked_page_returns_one_tile_per_stack(stacked):
    """The gate: fewer tiles out than in, each standing for the frames it
    collapsed, and every frame accounted for exactly once."""
    groups = expected_stacks(stacked.rows)
    body = get_json(stacked.port, "/api/photos?limit=1000&stack=4")

    assert body["stack"] == 4
    assert body["total"] == len(stacked.rows) == 74  # tiles, which stacking cannot change
    assert len(body["photos"]) == len(groups) == 38
    assert sum(photo["n"] for photo in body["photos"]) == len(stacked.rows)
    assert all(
        set(photo) == {"id", "s", "w", "h", "th", "n"} | ({"m"} if photo["n"] > 1 else set())
        for photo in body["photos"]
    )


def test_every_returned_photo_carries_its_own_stacks_size(stacked):
    groups = expected_stacks(stacked.rows)
    covers = walk_stacked(stacked.port, "stack=4")

    # A cover stands for its whole set, and a tile in no set is a stack of one.
    assert {photo_id: size for photo_id, size in covers} == {
        cover: len(groups[stack]) for stack, cover in expected_covers(stacked.rows).items()
    }
    assert sorted(size for _, size in covers) == sorted(
        len(members) for members in groups.values()
    )


def test_a_cover_carries_the_frames_it_collapsed(stacked):
    """The overlay's whole input, and the reason it needs no second endpoint.

    The page has already grouped these tiles; asking again for one stack would
    re-derive a grouping that filters and an evicted memo can move under it, and
    then draw a set the grid never returned. So the members ride with the cover
    that stands for them.

    A stack of one carries none. It opens nothing -- clicking it reveals in
    Explorer, exactly as an unstacked tile always has -- and on the real corpus
    that is 6,297 of the 10,929 rows, every one of which would otherwise carry a
    one-element list saying so.
    """
    sha = {row[0]: row[1] for row in stacked.rows}
    groups = expected_stacks(stacked.rows)
    stack_of = {cover: stack for stack, cover in expected_covers(stacked.rows).items()}
    body = get_json(stacked.port, "/api/photos?limit=1000&stack=4")

    collapsed = 0
    for photo in body["photos"]:
        if photo["n"] == 1:
            assert "m" not in photo
            continue
        collapsed += 1
        frames = photo["m"]
        assert len(frames) == photo["n"]
        assert all(set(frame) == {"id", "s", "w", "h"} for frame in frames)
        assert {frame["id"] for frame in frames} == set(groups[stack_of[photo["id"]]])
        # The cover is one of the frames it draws for, not a thirty-ninth tile.
        assert photo["id"] in {frame["id"] for frame in frames}
        # Real shas, because the overlay turns each into a /d/ URL.
        assert all(frame["s"] == sha[frame["id"]] for frame in frames)
        # Real boxes, because the overlay packs rows before an image arrives.
        assert all(frame["w"] > 0 and frame["h"] > 0 for frame in frames)
    assert collapsed == 24  # the corpus really does hold multi-frame stacks


@pytest.mark.parametrize("sort", sorted(SORTS))
def test_a_covers_frames_are_in_the_pages_own_order(stacked, sort):
    """Not capture order: the order this sort would have drawn them in, which on
    `newest` is capture order reversed. The overlay lays them out in the order it
    is handed, so a grid sorted largest-first opens a stack largest-first too."""
    body = get_json(stacked.port, f"/api/photos?limit=1000&stack=4&sort={sort}")
    place = {
        photo["id"]: index
        for index, photo in enumerate(
            get_json(stacked.port, f"/api/photos?limit=1000&sort={sort}")["photos"]
        )
    }

    for photo in body["photos"]:
        if photo["n"] == 1:
            continue
        seats = [place[frame["id"]] for frame in photo["m"]]
        assert seats == sorted(seats), (sort, photo["id"])


def test_stacking_off_carries_no_frames(stacked):
    """`m` is a stacked page's key, like `n`. An unstacked page is byte for byte
    what it was before stacking existed, and this is the second half of that."""
    body = get_json(stacked.port, "/api/photos?limit=1000")
    assert all("m" not in photo for photo in body["photos"])


def test_paging_a_stacked_selection_returns_each_stack_exactly_once(stacked):
    """Every page size, including ones that land a boundary inside a burst.

    A stack straddling a boundary is what breaks a naive collapse: half of it
    comes back on one page and the other half becomes its own cover on the next.
    Both halves would show up here, as a cover count that grew and sizes that
    did not add up.
    """
    whole = walk_stacked(stacked.port, "stack=4", limit=1000)
    assert len(whole) == 38
    for limit in (1, 2, 3, 5, 7, 13, 37):
        paged = walk_stacked(stacked.port, "stack=4", limit=limit)
        assert paged == whole, limit
        assert len({photo_id for photo_id, _ in paged}) == len(paged), limit
        assert sum(size for _, size in paged) == len(stacked.rows), limit


def test_a_stack_straddling_a_page_boundary_comes_back_whole(stacked):
    """Proved rather than assumed: the first page of a three-cover request ends
    inside the first burst, so the boundary really does fall in a run."""
    first = get_json(stacked.port, "/api/photos?limit=3&stack=4")
    assert first["next"] is not None
    # Three covers asked for, and the page ran on to the end of the run it was
    # in rather than splitting it -- so the sizes on this page are complete.
    assert [photo["n"] for photo in first["photos"]] == [1, 3, 2]
    second = get_json(
        stacked.port,
        f"/api/photos?limit=3&stack=4&before={first['next']['before']}"
        f"&before_id={first['next']['before_id']}",
    )
    assert not ({photo["id"] for photo in first["photos"]}
                & {photo["id"] for photo in second["photos"]})


def test_a_page_of_tiles_that_cannot_stack_still_ends(stacked):
    """`dated=mtime` selects only tiles the window excludes, so there is never an
    open run to close. A page that looked for its cut among stackable tiles
    alone would never find one and would serve the whole selection at once."""
    guessed = [row[0] for row in stacked.rows if row[4] == "mtime"]
    assert len(guessed) == 2

    body = get_json(stacked.port, "/api/photos?limit=1&stack=4&dated=mtime")
    assert len(body["photos"]) == 1
    assert body["next"] is not None
    assert dict(walk_stacked(stacked.port, "stack=4&dated=mtime", limit=1)) == {
        photo_id: 1 for photo_id in guessed
    }


@pytest.mark.parametrize("limit", [1, 2, 5])
def test_a_page_carries_close_to_the_covers_it_asked_for(stacked, limit):
    """A page runs past `limit` only to the end of the run it is in, so the
    overshoot is the size of one burst rather than the size of the library."""
    body = get_json(stacked.port, f"/api/photos?limit={limit}&stack=10")
    assert limit <= len(body["photos"]) <= limit + 3
    assert body["limit"] == limit


@pytest.mark.parametrize("name", sorted(SORTS))
def test_every_sort_stacks_the_same_frames_and_draws_the_same_cover(stacked, name):
    """Grouping is by capture time and camera, so the ordering cannot change it.
    Neither can it change which member is drawn: the cover comes from the
    frames' own exposure and sharpness, and an ordering is not one of those."""
    groups = expected_stacks(stacked.rows)
    covers = walk_stacked(stacked.port, f"stack=4&sort={name}", limit=7)
    assert len(covers) == len(groups)
    assert len({photo_id for photo_id, _ in covers}) == len(covers)
    assert sum(size for _, size in covers) == len(stacked.rows)
    assert {photo_id for photo_id, _ in covers} == set(expected_covers(stacked.rows).values())


def test_an_alternate_sort_moves_a_stack_without_changing_what_it_draws(stacked):
    """The eight non-time sorts scatter a stack's members through the ordering,
    which is why they cannot collapse runs as they page.

    What they change is where a stack sits, not what it is drawn as. A stack's
    place on `largest` is its biggest file, which is rarely the frame the cover
    rule names -- so the page comes back in a different order carrying the same
    tiles, and the cursor is the ordering's row rather than the drawn one.
    """
    groups = expected_stacks(stacked.rows)
    covers = expected_covers(stacked.rows)
    size = {row[0]: row[6] for row in stacked.rows}
    # Where each stack sits on `largest`: its first member in that ordering.
    place = {stack: max((size[member], member) for member in members)
             for stack, members in groups.items()}

    body = get_json(stacked.port, "/api/photos?limit=1000&stack=4&sort=largest")
    drawn = [photo["id"] for photo in body["photos"]]
    assert len(drawn) == 38
    assert drawn == [
        covers[stack]
        for stack in sorted(place, key=lambda stack: place[stack], reverse=True)
    ]

    # ...the same tiles `newest` draws, in an order that is not `newest`'s.
    by_time = [photo["id"] for photo in get_json(
        stacked.port, "/api/photos?limit=1000&stack=4")["photos"]]
    assert set(drawn) == set(by_time) and drawn != by_time


def test_a_bracket_is_drawn_as_the_sharpest_frame_of_its_middle_exposure(stacked):
    """The rule, on the first burst: three exposures a stop apart, ids 1-3 in
    capture order, and the sharpest of them is the brightest. So the frame drawn
    is none of the ones a simpler rule would reach for -- not the first the page
    sees (3 on `newest`, 1 on `oldest`), not the brightest, not the sharpest."""
    covers = dict(walk_stacked(stacked.port, "stack=4"))
    assert covers[2] == 3
    assert 1 not in covers and 3 not in covers
    assert dict(walk_stacked(stacked.port, "stack=4&sort=oldest"))[2] == 3


def test_a_pair_that_shares_an_exposure_is_drawn_as_its_sharper_frame(stacked):
    """Cam B's two frames are one exposure, which is the case the rule degrades
    to plain sharpest for. Its sharper frame is the older one, so `newest`
    cannot reach it by reading the run's first member."""
    covers = dict(walk_stacked(stacked.port, "stack=4"))
    assert covers[4] == 2
    assert 5 not in covers


def test_a_frame_whose_quality_pass_failed_is_not_drawn_over_one_that_can_be_ranked(
    stacked,
):
    """Burst 3's brightest frame carries `{"error": ...}` and no scalars, and it
    is the sharpest of its bracket. It cannot be ranked, so it cannot win -- the
    bracket falls to the darker of the two that can, and the page still serves.
    """
    failed = [row for row in stacked.rows if row[7] is None]
    assert [row[5] for row in failed] == ["3:bracket", "8:bracket"]

    covers = dict(walk_stacked(stacked.port, "stack=4"))
    for row in failed:
        bracket = expected_stacks(stacked.rows)[row[5]]
        assert row[0] not in covers
        assert covers[bracket[0]] == len(bracket) == 3


def test_filtering_out_a_cover_promotes_the_frame_the_rule_names_next(stacked):
    """A stack forms over the current selection, so the cover has to be resolved
    against the members that survived the filter. Burst 1's bracket is drawn as
    its middle exposure (2), which is also the only square frame in it: removing
    the squares leaves 1 and 3, still one stack at a four-second window, and the
    rule names 1 -- the darker of the two, and not the sharper.
    """
    assert dict(walk_stacked(stacked.port, "stack=4"))[2] == 3

    covers = dict(walk_stacked(stacked.port, "stack=4&orient=landscape,portrait"))
    assert covers[1] == 2
    assert 2 not in covers and 3 not in covers


@pytest.mark.parametrize("sort", ["newest", "largest"])
def test_a_page_reads_the_quality_of_its_own_members_and_nothing_else(stacked, sort,
                                                                      monkeypatch):
    """The cost the whole design turns on. Ranking reads two values out of a
    JSON column, which is ~50 ms over the tile set, so it is asked only about
    the members of the stacks being served -- and not about the stacks of one,
    which have nothing to choose between.
    """
    read: list[list[int]] = []
    original = grid_module._scalars

    def spy(conn, ids):
        read.append(list(ids))
        return original(conn, ids)

    monkeypatch.setattr(grid_module, "_scalars", spy)
    body = get_json(stacked.port, f"/api/photos?limit=3&stack=4&sort={sort}")

    groups = expected_stacks(stacked.rows)
    holds = {photo_id: stack for stack, ids in groups.items() for photo_id in ids}
    served = {holds[photo["id"]] for photo in body["photos"]}
    wanted = [photo_id for stack in served for photo_id in groups[stack]
              if len(groups[stack]) > 1]

    assert len(read) == 1
    assert sorted(read[0]) == sorted(wanted)
    assert len(read[0]) < len(stacked.rows)


def test_a_wider_window_merges_and_a_narrower_one_does_not_split_a_bracket(stacked):
    """Every window the slider offers holds this corpus's plan: the bursts are an
    hour apart and their frames a second apart, so 1 and 10 agree."""
    for window in (1, 4, 10):
        body = get_json(stacked.port, f"/api/photos?limit=1000&stack={window}")
        assert len(body["photos"]) == 38, window
        assert body["stack"] == window


def test_a_guessed_date_is_never_stacked(stacked):
    """Two of the twelve bursts carry an mtime-dated frame from the same body,
    chronologically inside the bracket. Each is its own stack of one, and the
    bracket around it is still three."""
    guessed = [row[0] for row in stacked.rows if row[4] == "mtime"]
    brackets = [row[5] for row in stacked.rows if row[5].endswith("bracket")]
    assert len(guessed) == 2 and len(set(brackets)) == 12

    covers = dict(walk_stacked(stacked.port, "stack=10"))
    for photo_id in guessed:
        assert covers[photo_id] == 1
    assert sorted(covers.values()) == [1] * 14 + [2] * 12 + [3] * 12


def test_a_filter_applies_before_stacking(stacked):
    """A stack forms over whatever the selection holds. Portrait keeps one frame
    in three, so the bracket it splits is three stacks of one where it was one
    of three -- which is correct, not a defect."""
    body = get_json(stacked.port, "/api/photos?limit=1000&stack=4&orient=portrait")
    assert 0 < len(body["photos"]) < 38
    assert body["total"] == sum(photo["n"] for photo in body["photos"])


def test_a_stacked_page_carries_both_of_the_count_panes_numbers(stacked):
    """`<stacks> stacks · <photos> photos`. The first is about the whole
    selection and not the page in front of it, so a first page of one cover
    still says how many there are in all -- and it is what the sheet reserves
    its height for, because the rows it will hold are covers."""
    first = get_json(stacked.port, "/api/photos?limit=1&stack=4")
    assert first["stacks"] == 38
    assert first["total"] == 74
    assert len(first["photos"]) < first["stacks"]
    assert len(walk_stacked(stacked.port, "stack=4")) == first["stacks"]

    filtered = get_json(stacked.port, "/api/photos?limit=1000&stack=4&orient=portrait")
    assert filtered["stacks"] == len(filtered["photos"])
    assert filtered["total"] == sum(photo["n"] for photo in filtered["photos"])


def test_the_stack_count_is_counted_once_per_selection_and_window(stacked):
    """~380 ms and the same answer for every page, so it is banked like a total.
    Two windows are two counts; two sorts are one, because the sort decides
    which member covers a stack and never how many stacks there are."""
    for url in (
        "/api/photos?limit=1&stack=4",
        "/api/photos?limit=1&stack=4",  # the same one, again
        "/api/photos?limit=1&stack=4&sort=largest",  # a different sort
        "/api/photos?limit=1&stack=6",  # a different window
    ):
        get_json(stacked.port, url)
    assert sorted(key.stack for key in stacked.server._stacks) == [4, 6]
    assert all(key.sort == browse.DEFAULT_SORT for key in stacked.server._stacks)


def test_a_stack_count_is_banked_under_the_count_memos_cap(stacked):
    """Same cap and same eviction as the other two memos: the keys come from a
    query string, so what a session can bank has to be bounded."""
    from photolib.grid import MAX_TOTALS

    for window in range(browse.MIN_WINDOW, browse.MAX_WINDOW + 1):
        get_json(stacked.port, f"/api/photos?limit=1&stack={window}")
    assert len(stacked.server._stacks) == 10 <= MAX_TOTALS
    assert all(value == 38 for value in stacked.server._stacks.values())


def test_an_unstacked_page_is_never_counted_for_stacks(stacked):
    """The pass costs what a total costs, and a reader who has not turned
    stacking on must not pay for it."""
    for url in ("/api/photos?limit=5", "/api/photos?limit=5&sort=largest"):
        assert "stacks" not in get_json(stacked.port, url)
    assert stacked.server._stacks == {}


def test_stacking_off_returns_what_it_returned_before_stacking_existed(stacked):
    body = get_json(stacked.port, "/api/photos?limit=1000")
    assert set(body) == {"photos", "next", "kind", "sort", "limit", "total"}
    assert set(body["photos"][0]) == {"id", "s", "w", "h", "th"}
    assert len(body["photos"]) == body["total"] == len(stacked.rows)


@pytest.mark.parametrize("value", ["0", "11", "-1", "4.5", "four", "", "%3Cscript%3E"])
def test_a_malformed_window_is_refused_by_name(stacked, value):
    status, _, body = http_request(stacked.port, "GET", f"/api/photos?stack={value}")
    assert status == 400
    assert json.loads(body) == {"error": "stack"}
    assert b"script" not in body


def test_the_default_sort_still_pages_on_the_index_with_stacking_on(planner):
    """The property that keeps a stacked page a page rather than a grouping pass.

    `photo_sort` supplies the order, so the read stops as soon as the covers are
    collected. Stacking adds two columns to the row and nothing to the WHERE, so
    the plan must be the plan it was without it.
    """
    for params in ({"stack": "4"}, {"stack": "4", "orient": "portrait"},
                   {"stack": "10", "sort": "oldest"}):
        for cursor in (None, ("2019-07-04T11:22:33", 5)):
            plan = plan_for(planner, selection(**params), cursor)
            assert "photo_sort" in plan, plan
            assert "TEMP B-TREE" not in plan, plan
            assert "SCAN file" not in plan, plan


def test_a_default_sort_never_runs_the_grouping_pass(stacked):
    """The property the whole streaming design exists for. A default sort
    collapses its own runs as it pages, so it must not compute -- or bank -- an
    assignment at any window, on the first page or any other."""
    built = []
    original = grid_module.build_assignment

    def spy(conn, query):
        built.append(query)
        return original(conn, query)

    grid_module.build_assignment = spy
    try:
        for url in (
            "/api/photos?limit=5&stack=4",
            "/api/photos?limit=5&stack=4&sort=oldest",
            "/api/photos?limit=5&stack=10",
        ):
            body = get_json(stacked.port, url)
            assert body["photos"]
    finally:
        grid_module.build_assignment = original
    assert built == []
    assert stacked.server._assignments == {}


def test_an_assignment_is_computed_once_per_selection(stacked):
    """~380 ms over the real corpus and the same answer for every page of one
    selection, so paging must not recompute it -- and two windows are two
    selections, because the window is what it groups by."""
    built = []
    original = grid_module.build_assignment

    def spy(conn, query):
        built.append(query)
        return original(conn, query)

    grid_module.build_assignment = spy
    try:
        for url in (
            "/api/photos?limit=5&stack=4&sort=largest",
            "/api/photos?limit=5&stack=4&sort=largest",  # the same one, again
            "/api/photos?limit=5&stack=4&sort=best",  # a different sort
            "/api/photos?limit=5&stack=6&sort=largest",  # a different window
        ):
            get_json(stacked.port, url)
    finally:
        grid_module.build_assignment = original
    assert len(built) == 3
    assert len(stacked.server._assignments) == 3
    # ...and the window is not part of what a tile count is keyed on, because no
    # window changes how many tiles there are. Two sorts here, so two counts --
    # not one per window.
    assert len(stacked.server._totals) == 2
    assert all(key.stack is None for key in stacked.server._totals)


def test_an_alternate_sort_banks_its_assignment_under_the_count_memos_cap(stacked):
    """Same cap, same eviction: the keys come from a query string, so the number
    of distinct ones a session can bank is bounded and the oldest goes first."""
    from photolib.grid import MAX_TOTALS

    for window in range(browse.MIN_WINDOW, browse.MAX_WINDOW + 1):
        get_json(stacked.port, f"/api/photos?limit=1&stack={window}&sort=largest")
    assert len(stacked.server._assignments) == 10 <= MAX_TOTALS
    assert all(entry for entry in stacked.server._assignments.values())
    assert all(key.sort == "largest" for key in stacked.server._assignments)


@pytest.mark.parametrize(
    "query, field",
    [
        ("orient=sideways", "orient"),
        ("sort=cheapest", "sort"),
        ("year=202x", "year"),
        ("month=13", "month"),
        ("grade=%3Cscript%3E", "grade"),
        ("size=1MB", "size"),
        ("kind=nope", "kind"),
    ],
)
def test_a_rejected_filter_names_the_field_and_echoes_nothing(grid, query, field):
    status, _, body = http_request(grid.port, "GET", f"/api/photos?{query}")
    assert status == 400
    assert json.loads(body) == {"error": field}
    assert b"script" not in body


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


# -- substrates ----------------------------------------------------------
#
# The 1536px tier the stack overlay draws its frames from. Same shape as the
# thumbnail route above, a second root: what is asserted here is that it IS the
# same shape, and that the two roots do not leak into each other.


def test_substrate_is_served_immutable_with_an_etag(grid):
    sha = grid.rows[3][1]
    status, headers, body = http_request(grid.port, "GET", f"/d/{sha}.webp")
    assert status == 200
    assert body == synthetic.TINY_WEBP
    assert headers["Content-Type"] == "image/webp"
    assert headers["Cache-Control"] == "private, max-age=31536000, immutable"
    assert headers["ETag"] == f'"{sha}"'


def test_substrate_revalidates_with_if_none_match(grid):
    sha = grid.rows[3][1]
    status, _, body = http_request(
        grid.port, "GET", f"/d/{sha}.webp", headers=(("If-None-Match", f'"{sha}"'),)
    )
    assert status == 304
    assert body == b""


def test_a_query_string_does_not_break_the_substrate_route(grid):
    sha = grid.rows[3][1]
    status, _, _ = http_request(grid.port, "GET", f"/d/{sha}.webp?v=1")
    assert status == 200


def test_a_missing_substrate_is_a_plain_404(grid):
    """23 tiles have a thumbnail and no substrate. That is expected, not an error."""
    sha = grid.rows[-1][1]
    status, _, body = http_request(grid.port, "GET", f"/d/{sha}.webp")
    assert status == 404
    assert body == b""


def test_the_two_tiers_are_separate_roots(grid):
    """A sha with one tier and not the other answers from its own tree only."""
    thumbnailed, substrated = grid.rows[0][1], grid.rows[3][1]
    assert http_request(grid.port, "GET", f"/t/{thumbnailed}.webp")[0] == 200
    assert http_request(grid.port, "GET", f"/d/{thumbnailed}.webp")[0] == 404
    assert http_request(grid.port, "GET", f"/d/{substrated}.webp")[0] == 200
    assert http_request(grid.port, "GET", f"/t/{substrated}.webp")[0] == 404


@pytest.mark.parametrize(
    "path",
    [
        "/d/../../config.toml",
        "/d/..%2f..%2fconfig.toml",
        "/d/%2e%2e%2f%2e%2e%2fconfig.toml",
        "/d/" + "a" * 63 + ".webp",
        "/d/" + "a" * 65 + ".webp",
        "/d/" + "A" * 64 + ".webp",
        "/d/" + "z" * 64 + ".webp",
        "/d/" + "a" * 64 + ".png",
        "/d/" + "a" * 64 + ".webp/",
        "/d/",
    ],
)
def test_the_substrate_route_only_matches_64_hex(grid, path, monkeypatch):
    """The pattern IS the containment proof here too, so nothing reaches the disk."""
    monkeypatch.setattr(
        grid_module, "substrate_path", lambda *args: pytest.fail(f"{path} reached the filesystem")
    )
    status, _, body = http_request(grid.port, "GET", path)
    assert status == 404
    assert b"reveal_root" not in body and b"photos_root" not in body


def test_substrates_never_open_the_database(grid, monkeypatch):
    """Opening a stack asks for one frame per member. None of them is a query."""
    monkeypatch.setattr(
        GridServer, "connection", lambda self: pytest.fail("substrate opened the catalog")
    )
    sha = grid.rows[3][1]
    status, _, _ = http_request(grid.port, "GET", f"/d/{sha}.webp")
    assert status == 200


# -- static and headers --------------------------------------------------


def test_index_is_served_without_inline_script(grid):
    status, headers, body = http_request(grid.port, "GET", "/")
    assert status == 200
    assert headers["Content-Type"].startswith("text/html")
    assert b'src="/bundle.js"' in body and b'href="/bundle.css"' in body
    # The CSP carries no 'unsafe-inline', so an inline block would not execute.
    assert b"<script>" not in body


def test_tune_serves_the_same_document_as_the_grid(grid):
    """`/tune` is the grid plus the glass controls, and it is the same client.

    The app decides which by reading `location.pathname`, so the two paths must
    return byte-identical HTML — a `/tune` that 404s or that serves something
    else is a panel nobody can reach, and no JavaScript test runs here.
    """
    _, _, index = http_request(grid.port, "GET", "/")
    status, headers, body = http_request(grid.port, "GET", "/tune")
    assert status == 200
    assert headers["Content-Type"].startswith("text/html")
    assert body == index


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
    "path",
    ["/", "/tune", "/bundle.js", "/bundle.css", "/api/photos", "/t/x.webp", "/d/x.webp", "/nope"],
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


@pytest.mark.parametrize("path", ["/", "/bundle.js", "/api/photos", "/t/x.webp", "/d/x.webp"])
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
        for root in (grid.roots.vault_root, grid.roots.thumb_root, grid.roots.substrate_root):
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
        http_request(grid.port, "GET", f"/d/{row[1]}.webp")
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
