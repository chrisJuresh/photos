"""`/api/triage/*`: the write endpoints, and the proof they write nothing else.

The security tests here are about the one property the whole triage surface
rests on -- a triage decision is a row in `state.sqlite3` and never a file
operation -- and they check it by watching every file the process opens rather
than by reading the code.
"""

from __future__ import annotations

import builtins
import http.client
import io
import json
import os
import sqlite3
import threading
from pathlib import Path
from urllib.parse import urlencode

import pytest
import synthetic
from test_grid import http_request
from test_triage import CORPUS, load

from photolib import db, migrate, triage, triage_api
from photolib.grid import GridHandler, GridServer, Roots


@pytest.fixture
def server(tmp_path: Path):
    """A real grid server over a synthetic catalog with the triage survey built."""
    roots = Roots(
        catalog_db=tmp_path / "catalog.sqlite3",
        state_db=tmp_path / "state.sqlite3",
        thumb_root=tmp_path / "thumb",
        substrate_root=tmp_path / "substrate",
        vault_root=tmp_path / "vault",
        reveal_root=tmp_path / "vault",
        photos_root=tmp_path / "photos",
    )
    roots.reveal_root.mkdir(parents=True)
    roots.thumb_root.mkdir()
    roots.substrate_root.mkdir()
    roots.photos_root.mkdir()
    migrate.apply(roots.catalog_db, roots.state_db)
    conn = db.connect(roots.catalog_db, roots.state_db)
    load(conn)
    conn.close()

    instance = GridServer(("127.0.0.1", 0), GridHandler, roots, lambda *_: None)
    threading.Thread(target=instance.serve_forever, daemon=True).start()
    yield instance
    instance.shutdown()
    instance.server_close()


def post(server, path: str, payload: dict, *, origin: str | None = None, **kwargs):
    port = server.server_address[1]
    headers = (
        ("Content-Type", "application/json"),
        ("Origin", f"http://127.0.0.1:{port}" if origin is None else origin),
    )
    status, _, body = http_request(
        port, "POST", path, headers=headers, body=json.dumps(payload).encode(), **kwargs
    )
    return status, json.loads(body) if body else None


def get(server, path: str, params: dict[str, str] | None = None):
    port = server.server_address[1]
    query = f"?{urlencode(params)}" if params else ""
    status, _, body = http_request(port, "GET", path + query)
    return status, json.loads(body) if body else None


# --- the writes ---------------------------------------------------------------------


def test_a_rule_is_added_deleted_and_the_counts_follow(server):
    status, added = post(
        server,
        "/api/triage/rules/add",
        {"column": "dir_segment", "op": "=", "value": "node_modules", "decision": "exclude"},
    )
    assert status == 200 and added["at"] == 0

    status, counts = get(server, "/api/triage/counts")
    assert status == 200 and counts["excluded_paths"] == 3
    assert counts["rules"][0]["predicate"] == "dir_segment = 'node_modules'"
    assert counts["rules"][0]["paths"] == 3
    # The structured form travels alongside the human one so a screen can mark
    # the row whose item this rule already decided. `predicate` is Python's
    # `repr` and is not something the client should be parsing.
    assert counts["rules"][0]["term"] == {
        "column": "dir_segment",
        "op": "=",
        "value": "node_modules",
    }

    assert post(server, "/api/triage/rules/delete", {"id": added["id"]})[0] == 200
    assert get(server, "/api/triage/counts")[1]["excluded_paths"] == 0


def test_a_rule_lands_where_it_is_asked_to(server):
    post(server, "/api/triage/rules/add", {"column": "ext", "op": "=", "value": ".png",
                                           "decision": "exclude"})
    post(server, "/api/triage/rules/add",
         {"column": "dir_under", "op": "=", "value": r"G:\photos\backup\rcr\node_modules\keep",
          "decision": "include", "at": 0})
    positions = [rule["predicate"] for rule in get(server, "/api/triage/counts")[1]["rules"]]
    assert positions[0].startswith("dir_under")
    assert get(server, "/api/triage/counts")[1]["excluded_paths"] == 3  # hero.png re-included


def test_moving_a_rule_changes_the_answer(server):
    include = post(server, "/api/triage/rules/add",
                   {"column": "ext", "op": "=", "value": ".png", "decision": "include"})[1]
    post(server, "/api/triage/rules/add",
         {"column": "dir_segment", "op": "=", "value": "node_modules", "decision": "exclude"})
    assert get(server, "/api/triage/counts")[1]["excluded_paths"] == 0

    assert post(server, "/api/triage/rules/move", {"id": include["id"], "at": 1})[0] == 200
    assert get(server, "/api/triage/counts")[1]["excluded_paths"] == 3


def test_an_override_is_keyed_on_content_and_beats_the_rules(server):
    post(server, "/api/triage/rules/add",
         {"column": "dir_segment", "op": "=", "value": "node_modules", "decision": "exclude"})
    assert post(server, "/api/triage/override", {"sha256": "c" * 64, "decision": "include"})[0] == 200
    assert get(server, "/api/triage/counts")[1]["excluded_paths"] == 2
    assert post(server, "/api/triage/override", {"sha256": "c" * 64, "decision": "clear"})[0] == 200
    assert get(server, "/api/triage/counts")[1]["excluded_paths"] == 3


@pytest.mark.parametrize(
    "payload, field",
    [
        ({"column": "path", "op": "=", "value": "x", "decision": "exclude"}, "predicate"),
        ({"column": "ext", "op": "LIKE", "value": ".png", "decision": "exclude"}, "predicate"),
        ({"column": "ext", "op": "=", "value": ".png", "decision": "maybe"}, "decision"),
        ({"column": "ext", "op": "=", "value": ".png", "decision": "exclude", "at": -1}, "at"),
        ({"column": "ext", "op": "=", "value": ".png", "decision": "exclude", "at": 9}, "at"),
        ({"op": "=", "value": ".png", "decision": "exclude"}, "column"),
    ],
)
def test_a_bad_rule_is_refused_by_field_name(server, payload, field):
    status, body = post(server, "/api/triage/rules/add", payload)
    assert status == 400 and body == {"error": field}


def test_the_tree_endpoint_serves_one_node_at_a_time(server):
    status, body = get(server, "/api/triage/tree", {"path": r"G:\photos"})
    assert status == 200
    assert {child["name"]: child["paths"] for child in body["children"]} == {"backup": 6, "lumix": 2}
    # And the path it hands back is what the next request asks for.
    child = body["children"][0]
    assert get(server, "/api/triage/tree", {"path": child["path"]})[1]["path"] == child["path"]


@pytest.mark.parametrize("params", [{}, {"path": ""}, {"path": "\\"}])
def test_a_tree_request_without_a_usable_path_is_refused_by_field_name(server, params):
    status, body = get(server, "/api/triage/tree", params)
    assert status == 400 and body == {"error": "path"}


def test_a_refusal_never_echoes_the_value(server):
    status, body = post(
        server,
        "/api/triage/override",
        {"sha256": "not-a-hash-but-a-secret", "decision": "exclude"},
    )
    assert status == 400 and body == {"error": "sha256"}
    assert "secret" not in json.dumps(body)


def test_deleting_a_rule_that_is_not_there_is_a_404(server):
    assert post(server, "/api/triage/rules/delete", {"id": 999})[0] == 404


def test_the_write_routes_refuse_a_get(server):
    port = server.server_address[1]
    status, headers, _ = http_request(port, "GET", "/api/triage/rules/add")
    assert status == 405 and headers["Allow"] == "POST"


def test_a_cross_origin_write_is_refused_before_the_body_is_read(server):
    status, body = post(
        server,
        "/api/triage/rules/add",
        {"column": "ext", "op": "=", "value": ".png", "decision": "exclude"},
        origin="http://evil.example",
    )
    assert status == 403 and body == {"error": "origin"}


def test_a_foreign_host_header_is_refused(server):
    port = server.server_address[1]
    status, _, _ = http_request(
        port, "POST", "/api/triage/rules/add", host="attacker.example",
        headers=(("Content-Type", "application/json"),), body=b"{}",
    )
    assert status == 403


def test_an_oversized_body_is_refused_before_it_is_read(server):
    port = server.server_address[1]
    status, _, _ = http_request(
        port,
        "POST",
        "/api/triage/rules/add",
        headers=(("Content-Type", "application/json"),
                 ("Origin", f"http://127.0.0.1:{port}")),
        body=b"{}",
        declared_length=str(1 << 20),
        send_body=False,
    )
    assert status == 413


# --- the reads ------------------------------------------------------------------------


def test_a_page_uses_the_same_contract_as_api_photos(server):
    status, payload = get(server, "/api/triage/page?limit=3")
    assert status == 200
    assert set(payload) == {"photos", "next", "limit"}
    assert set(payload["next"]) == {"before", "before_id"}
    first = [row["id"] for row in payload["photos"]]

    cursor = payload["next"]
    status, second = get(
        server, f"/api/triage/page?limit=3&before={cursor['before']}&before_id={cursor['before_id']}"
    )
    assert status == 200 and not set(first) & {row["id"] for row in second["photos"]}


def test_a_half_cursor_is_refused(server):
    assert get(server, "/api/triage/page?before=x")[1] == {"error": "cursor"}
    assert get(server, "/api/triage/page?before_id=3")[1] == {"error": "cursor"}


def test_an_unknown_screen_is_refused(server):
    assert get(server, "/api/triage/screen?name=nope")[1] == {"error": "name"}


def test_every_screen_answers_over_http(server):
    from photolib import triage_screens

    for name in triage_screens.SCREENS:
        status, payload = get(server, f"/api/triage/screen?name={name}")
        assert status == 200 and payload["name"] == name


def test_the_candidate_arrives_from_the_query_string(server):
    status, payload = get(
        server, "/api/triage/counts?column=dir_segment&op=%3D&value=node_modules&decision=exclude"
    )
    assert status == 200
    assert payload["excluded_paths"] == 0
    assert payload["candidate_excluded_paths"] == 3


def test_a_non_numeric_dimension_candidate_is_refused(server):
    assert get(server, "/api/triage/counts?column=long_edge&op=%3C%3D&value=big")[1] == {
        "error": "value"
    }


def test_an_is_null_candidate_needs_no_value_on_an_integer_column(server):
    """Screen 3's `unknown` band, which is most of the corpus.

    `long_edge` is an integer column and `is null` takes no value, so a parser
    that checked the column before the operator demanded a digit and refused the
    one band holding every file whose bytes have never been read.
    """
    status, payload = get(server, "/api/triage/counts?column=long_edge&op=is+null")
    assert status == 200
    assert payload["candidate_excluded_paths"] == 3  # the three with no dimensions


def test_the_empty_extension_is_a_candidate_and_not_an_absent_one(server):
    """641,764 paths in the real corpus carry no extension.

    `ext = ''` is a real predicate, so `value=` has to survive the query string
    as an empty string rather than being read as "no value supplied".
    """
    status, payload = get(server, "/api/triage/counts?column=ext&op=%3D&value=")
    assert status == 200 and payload["candidate_excluded_paths"] == 0
    assert get(server, "/api/triage/counts?column=ext&op=%3D")[1] == {"error": "predicate"}


def test_an_exact_dimension_candidate_pages_that_cluster(server):
    """Screen 4 clicking straight through into the sheet for one cluster."""
    status, payload = get(server, "/api/triage/page?column=dims&op=%3D&value=1920x1080")
    assert status == 200
    assert [row["p"].rsplit("\\", 1)[-1] for row in payload["photos"]] == ["hero.png"]
    assert get(server, "/api/triage/page?column=dims&op=%3D&value=1920")[1] == {
        "error": "predicate"
    }


def test_a_page_row_reports_its_override_over_http(server):
    """The chip renders from this field, so it has to follow the write.

    `hero.png` rather than whichever row sorts first: the corpus seeds its
    hashes from single letters and only a-f are hex, so the rows seeded `g` and
    `h` are refused by the sha256 check -- correctly, and unhelpfully here.
    """
    page = "/api/triage/page?column=dims&op=%3D&value=1920x1080"
    row = get(server, page)[1]["photos"][0]
    assert row["p"].endswith("hero.png") and row["o"] is None

    assert post(server, "/api/triage/override", {"sha256": row["s"], "decision": "exclude"})[0] == 200
    assert get(server, page)[1]["photos"][0]["o"] == "exclude"

    assert post(server, "/api/triage/override", {"sha256": row["s"], "decision": "clear"})[0] == 200
    assert get(server, page)[1]["photos"][0]["o"] is None


def test_the_probe_route_reports_and_does_not_run(server):
    """A count, in SQL. The button reports it; the CLI is what would read files."""
    status, payload = get(server, "/api/triage/probe")
    assert status == 200
    assert set(payload) == {"worklist", "formats", "command"}
    assert payload["worklist"] == 2 and payload["command"] == "python -m photolib.probe"

    # And it follows the rule set: screen 1's output is directory rules.
    assert (
        post(
            server,
            "/api/triage/rules/add",
            {"column": "dir_segment", "op": "=", "value": "node_modules", "decision": "exclude"},
        )[0]
        == 200
    )
    payload = get(server, "/api/triage/probe")[1]
    assert payload["worklist"] == 0 and payload["command"] is None


# --- the invariant --------------------------------------------------------------------


def test_the_write_connection_cannot_reach_the_catalog(tmp_path: Path):
    """Structural, not conventional: the catalog is not attached, so it has no name."""
    catalog, state = tmp_path / "catalog.sqlite3", tmp_path / "state.sqlite3"
    migrate.apply(catalog, state)
    conn = triage_api.writer(state)
    try:
        assert conn.execute("SELECT count(*) FROM triage_rule").fetchone() == (0,)
        for table in ("origin", "file", "photo", "triage_bucket", "triage_path"):
            with pytest.raises(sqlite3.OperationalError, match="no such table"):
                conn.execute(f"SELECT count(*) FROM {table}")
    finally:
        conn.close()


WRITE_FLAGS = os.O_WRONLY | os.O_RDWR | os.O_APPEND | os.O_CREAT | os.O_TRUNC


def test_no_triage_code_path_opens_a_file_under_the_photos_root_for_writing(tmp_path, monkeypatch):
    """Invariant 3 on a new surface, checked by watching every open() in the process.

    `builtins.open`, `os.open` and `sqlite3.connect` are three separate ways to
    reach the filesystem and none of them goes through the others, so all three
    are watched. The corpus's paths are rewritten to sit under a real temporary
    directory, so a handler that did construct a path from a rule and touch it
    would touch something this test can see.
    """
    photos_root = tmp_path / "photos"
    photos_root.mkdir()
    catalog, state = tmp_path / "catalog.sqlite3", tmp_path / "state.sqlite3"
    migrate.apply(catalog, state)

    corpus = []
    for path, *rest in CORPUS:
        real = photos_root / path.removeprefix("G:\\photos\\")
        real.parent.mkdir(parents=True, exist_ok=True)
        real.write_bytes(b"not really a photo")
        corpus.append((str(real), *rest))
    conn = db.connect(catalog, state)
    load(conn, tuple(corpus))
    conn.close()

    opened: list[tuple[str, int]] = []
    real_open, real_os_open, real_connect = builtins.open, os.open, sqlite3.connect

    def spy_open(file, mode="r", *args, **kwargs):
        opened.append((str(file), 0 if set(mode) <= {"r", "b", "t"} else WRITE_FLAGS))
        return real_open(file, mode, *args, **kwargs)

    def spy_os_open(path, flags, *args, **kwargs):
        opened.append((str(path), flags))
        return real_os_open(path, flags, *args, **kwargs)

    def spy_connect(database, *args, **kwargs):
        # A read-only connection is a `file:...?mode=ro` URI; anything else can
        # write, so it is recorded as a write.
        text = str(database)
        opened.append((text, 0 if "mode=ro" in text else WRITE_FLAGS))
        return real_connect(database, *args, **kwargs)

    monkeypatch.setattr(builtins, "open", spy_open)
    monkeypatch.setattr(io, "open", spy_open)
    monkeypatch.setattr(os, "open", spy_os_open)
    monkeypatch.setattr(sqlite3, "connect", spy_connect)

    writer = triage_api.writer(state)
    reader = db.connect(catalog, state, read_only=True)
    try:
        rule = triage_api.add_rule(
            writer,
            {"column": "dir_under", "op": "=", "value": str(photos_root), "decision": "exclude"},
        )[1]
        triage_api.add_rule(
            writer,
            {"column": "ext", "op": "=", "value": ".png", "decision": "include", "at": 0},
        )
        triage_api.move_rule(writer, {"id": rule["id"], "at": 0})
        triage_api.set_override(writer, {"sha256": "a" * 64, "decision": "include"})
        for path, handler in triage_api.READ_ROUTES.items():
            params: dict[str, list[str]] = {}
            if path.endswith("screen"):
                params = {"name": ["file_type"]}
            elif path.endswith("tree"):
                # The real temporary root, so a handler that turned this value
                # into a path and opened it would be caught rather than missed.
                params = {"path": [str(photos_root)]}
            handler(reader, params)
        triage_api.set_override(writer, {"sha256": "a" * 64, "decision": "clear"})
        triage_api.delete_rule(writer, {"id": rule["id"]})
    finally:
        writer.close()
        reader.close()

    root = str(photos_root).lower()
    under_photos = [entry for entry in opened if entry[0].lower().startswith(root)]
    assert under_photos == [], f"triage touched the photos root: {under_photos}"

    writes = [path for path, flags in opened if flags & WRITE_FLAGS]
    assert all(Path(path).name.startswith("state.sqlite3") for path in writes), writes


def test_the_survey_build_never_opens_a_media_file(tmp_path, monkeypatch):
    """`triage_survey` is pure SQL over the catalog -- the claim, checked."""
    from archive.pipeline import triage_survey

    catalog, state = tmp_path / "catalog.sqlite3", tmp_path / "state.sqlite3"
    migrate.apply(catalog, state)
    conn = db.connect(catalog, state)
    load(conn)

    opened: list[str] = []
    real_open = builtins.open
    monkeypatch.setattr(
        builtins, "open", lambda file, *a, **k: (opened.append(str(file)), real_open(file, *a, **k))[1]
    )
    try:
        triage_survey.build(conn)
    finally:
        conn.close()
    assert opened == []
