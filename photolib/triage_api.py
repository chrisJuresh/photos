"""`/api/triage/*` -- the only endpoints in this system that write anything.

Two properties are enforced structurally rather than by review.

**They write `state.sqlite3` and nothing else.** Not by convention: the write
handlers are given a connection opened on `state.sqlite3` *alone*, with no
`ATTACH` of the catalog. There is no name a handler could use to reach `origin`,
`file`, `photo` or the survey, so "triage writes metadata only" is a property of
the connection rather than a rule somebody has to keep remembering. The read
handlers get the ordinary read-only pair and cannot write either.

**No media work in a request.** Handlers evaluate SQL over persisted state and
return. The survey is built by `photolib.triage_survey`, the dimensions by
`photolib.probe`; both are command-line steps. Nothing here opens a file under
any media root, for reading or for writing.

The route table is a plain dict so the server stays a router and the handlers
stay testable without a socket. Every handler takes already-parsed input and
returns `(status, payload)`; refusals name the offending field and never echo
its value, which is the same rule `/api/reveal` follows.
"""

from __future__ import annotations

import json
import re
import sqlite3
from datetime import UTC, datetime
from pathlib import Path

from photolib import probe, triage, triage_screens

SHA256 = re.compile(r"^[0-9a-f]{64}$")
MAX_NOTE_CHARS = 200
CURSOR_MAX_CHARS = 512

OVERRIDE_DECISIONS = ("exclude", "include", "clear")


class Refused(ValueError):
    """A bad request. `field` is what the client is told, and nothing else."""

    def __init__(self, field: str, status: int = 400) -> None:
        super().__init__(field)
        self.field = field
        self.status = status


def writer(state_db: Path, *, busy_timeout_ms: int = 5000) -> sqlite3.Connection:
    """A connection to `state.sqlite3` and to nothing else.

    Deliberately not `photolib.db.connect`: that attaches the catalog, and the
    whole point of this connection is that the catalog is not reachable from a
    request handler. A handler that tried would get "no such table".
    """
    conn = sqlite3.connect(state_db, isolation_level=None)
    conn.execute(f"PRAGMA busy_timeout = {int(busy_timeout_ms)}")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


def _now() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


# --- input validation ------------------------------------------------------------


def _field(payload: dict, name: str, kinds: tuple, *, required: bool = True):
    if name not in payload:
        if required:
            raise Refused(name)
        return None
    value = payload[name]
    # isinstance(True, int) is True, so bool is excluded by identity wherever an
    # integer is wanted.
    if isinstance(value, bool) and bool not in kinds:
        raise Refused(name)
    if not isinstance(value, kinds):
        raise Refused(name)
    return value


def parse_rule(payload: dict) -> tuple[str, str, str | None]:
    """`(predicate JSON, decision, note)` from a request body.

    The predicate is built through `triage.predicate`, which compiles it before
    returning it -- so a rule that cannot be evaluated is refused at the door
    rather than stored and discovered later by a query that suddenly raises.
    """
    column = _field(payload, "column", (str,))
    op = _field(payload, "op", (str,))
    value = payload.get("value")
    decision = _field(payload, "decision", (str,))
    if decision not in triage.DECISIONS:
        raise Refused("decision")
    note = _field(payload, "note", (str,), required=False)
    if note is not None and len(note) > MAX_NOTE_CHARS:
        raise Refused("note")
    try:
        predicate = triage.predicate(column, op, value)
    except triage.PredicateError:
        raise Refused("predicate") from None
    return predicate, decision, note


def parse_position(payload: dict, count: int, *, field: str = "at") -> int:
    """Where a rule goes in the order. `count` is a valid answer -- the end."""
    at = payload.get(field, count)
    if isinstance(at, bool) or not isinstance(at, int) or not 0 <= at <= count:
        raise Refused(field)
    return at


# --- writes ------------------------------------------------------------------------


def _renumber(conn: sqlite3.Connection, ids: list[int]) -> None:
    """Rewrite `seq` so that it is dense and equals the evaluation position.

    Rule order is `(seq, id)`, so nothing breaks if `seq` is sparse or
    duplicated -- but then "insert at position 3" and "set seq = 3" stop being
    the same statement, and every write has to reason about the difference.
    Renumbering after each write keeps position and `seq` the same number.
    Rule sets are tens of rows; this is not a cost.
    """
    conn.executemany(
        "UPDATE triage_rule SET seq = ? WHERE id = ?",
        [(position, rule_id) for position, rule_id in enumerate(ids)],
    )


def _rule_ids(conn: sqlite3.Connection) -> list[int]:
    return [row[0] for row in conn.execute("SELECT id FROM triage_rule ORDER BY seq, id")]


def add_rule(conn: sqlite3.Connection, payload: dict) -> tuple[int, dict]:
    """Insert one rule at a position. `POST /api/triage/rules/add`."""
    predicate, decision, note = parse_rule(payload)
    conn.execute("BEGIN IMMEDIATE")
    try:
        ids = _rule_ids(conn)
        at = parse_position(payload, len(ids))
        cursor = conn.execute(
            "INSERT INTO triage_rule (seq, predicate, decision, note, created_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (at, predicate, decision, note, _now()),
        )
        ids.insert(at, cursor.lastrowid)
        _renumber(conn, ids)
        conn.execute("COMMIT")
    except Exception:
        conn.execute("ROLLBACK")
        raise
    return 200, {"id": cursor.lastrowid, "at": at, "rules": len(ids)}


def delete_rule(conn: sqlite3.Connection, payload: dict) -> tuple[int, dict]:
    """Remove one rule. `POST /api/triage/rules/delete`.

    This is the reversal path the whole design rests on: a decision undoes by
    deleting the row that made it, and the survey it was computed against is
    untouched.
    """
    rule_id = _field(payload, "id", (int,))
    conn.execute("BEGIN IMMEDIATE")
    try:
        deleted = conn.execute("DELETE FROM triage_rule WHERE id = ?", (rule_id,)).rowcount
        if not deleted:
            conn.execute("ROLLBACK")
            raise Refused("id", status=404)
        ids = _rule_ids(conn)
        _renumber(conn, ids)
        conn.execute("COMMIT")
    except Refused:
        raise
    except Exception:
        conn.execute("ROLLBACK")
        raise
    return 200, {"deleted": rule_id, "rules": len(ids)}


def move_rule(conn: sqlite3.Connection, payload: dict) -> tuple[int, dict]:
    """Reorder one rule. `POST /api/triage/rules/move`.

    Ordering is the only thing that expresses "exclude this tree, except that
    subtree", so moving a rule is a first-class edit and not a convenience.
    """
    rule_id = _field(payload, "id", (int,))
    conn.execute("BEGIN IMMEDIATE")
    try:
        ids = _rule_ids(conn)
        if rule_id not in ids:
            conn.execute("ROLLBACK")
            raise Refused("id", status=404)
        ids.remove(rule_id)
        at = parse_position(payload, len(ids))
        ids.insert(at, rule_id)
        _renumber(conn, ids)
        conn.execute("COMMIT")
    except Refused:
        raise
    except Exception:
        conn.execute("ROLLBACK")
        raise
    return 200, {"id": rule_id, "at": at}


def set_override(conn: sqlite3.Connection, payload: dict) -> tuple[int, dict]:
    """Per-file decision, keyed on content. `POST /api/triage/override`.

    Keyed on `sha256` and never on `photo.id`, so it survives every re-group and
    re-ingest -- `PLAN.md`'s rule for anything recording a human decision. There
    is no path in the body: the client names bytes, not a file.
    """
    sha256 = _field(payload, "sha256", (str,))
    if not SHA256.match(sha256):
        raise Refused("sha256")
    decision = _field(payload, "decision", (str,))
    if decision not in OVERRIDE_DECISIONS:
        raise Refused("decision")
    if decision == "clear":
        conn.execute("DELETE FROM triage_override WHERE sha256 = ?", (sha256,))
        return 200, {"sha256": sha256, "decision": None}
    conn.execute(
        "INSERT INTO triage_override (sha256, decision, created_at) VALUES (?, ?, ?) "
        "ON CONFLICT(sha256) DO UPDATE SET decision = excluded.decision, "
        "created_at = excluded.created_at",
        (sha256, decision, _now()),
    )
    return 200, {"sha256": sha256, "decision": decision}


WRITE_ROUTES = {
    "/api/triage/rules/add": add_rule,
    "/api/triage/rules/delete": delete_rule,
    "/api/triage/rules/move": move_rule,
    "/api/triage/override": set_override,
}


# --- reads ---------------------------------------------------------------------------


def _one(params: dict[str, list[str]], name: str) -> str | None:
    values = params.get(name)
    return values[-1] if values else None


def _candidate(params: dict[str, list[str]]) -> triage.Rule | None:
    """A candidate rule from the query string, or None.

    The value arrives as text because a query string has no types; integer
    columns are converted here and a non-integer is a refusal, not a silent
    zero.
    """
    column = _one(params, "column")
    if column is None:
        return None
    op = _one(params, "op") or "="
    raw = _one(params, "value")
    decision = _one(params, "decision") or "exclude"
    if decision not in triage.DECISIONS:
        raise Refused("decision")
    value: object = raw
    # `is null` is tested first because it takes no value at all, and three of
    # the four columns that accept it are integer columns. Testing the column
    # first made `long_edge is null` unexpressible as a candidate -- which is
    # screen 3's `unknown` band, the one holding every file whose bytes have
    # never been read.
    if op == "is null":
        value = None
    elif column in triage.INT_COLUMNS:
        if raw is None or not raw.isdigit():
            raise Refused("value")
        value = int(raw)
    elif op == "in":
        value = (raw or "").split(",")
    try:
        return triage.Rule(0, triage.predicate(column, op, value), decision)
    except triage.PredicateError:
        raise Refused("predicate") from None


def _at(params: dict[str, list[str]]) -> int | None:
    raw = _one(params, "at")
    if raw is None:
        return None
    if not raw.isdigit():
        raise Refused("at")
    return int(raw)


def _limit(params: dict[str, list[str]]) -> int:
    raw = _one(params, "limit")
    if raw is None:
        return triage_screens.DEFAULT_LIMIT
    if not raw.isdigit():
        raise Refused("limit")
    return min(max(int(raw), 1), triage_screens.MAX_LIMIT)


def _cursor(params: dict[str, list[str]]) -> tuple[str, int] | None:
    """The keyset cursor: both halves or neither, as `/api/photos` requires."""
    before, before_id = _one(params, "before"), _one(params, "before_id")
    if before is None and before_id is None:
        return None
    if before is None or before_id is None or not before_id.isdigit():
        raise Refused("cursor")
    if len(before) > CURSOR_MAX_CHARS:
        # A size budget, not injection defence -- it travels as a parameter.
        raise Refused("cursor")
    return before, int(before_id)


def read_counts(conn: sqlite3.Connection, params: dict) -> tuple[int, dict]:
    """`GET /api/triage/counts` -- the eight numbers, and the per-rule table."""
    rules = triage.load_rules(conn)
    summary = triage.counts(conn, rules, candidate=_candidate(params), at=_at(params))
    summary["rules"] = [
        {
            "id": rule.rule_id,
            "position": rule.position,
            "predicate": triage.describe(rule.predicate),
            # The same predicate structurally, so the client can tell whether a
            # row on a screen is an item some rule already names and mark it.
            # `predicate` is for eyes -- it is Python's `repr` of the value, and
            # reproducing that in JS to compare against is not a contract worth
            # having.
            "term": json.loads(rule.predicate),
            "decision": rule.decision,
            "note": rule.note,
            **summary["per_rule"][rule.position],
        }
        for rule in rules
    ]
    summary["unmatched"] = summary["per_rule"][len(rules)]
    del summary["per_rule"]
    return 200, summary


def read_files(conn: sqlite3.Connection, params: dict) -> tuple[int, dict]:
    """`GET /api/triage/files` -- the same verdict folded to distinct content.

    Separate from `/counts` because it costs ~470 ms against ~220 ms: a screen
    asks for it once, a keystroke never does.
    """
    return 200, triage.file_counts(conn)


def read_screen(conn: sqlite3.Connection, params: dict) -> tuple[int, dict]:
    """`GET /api/triage/screen?name=...` -- one screen's aggregate rows."""
    name = _one(params, "name")
    if name not in triage_screens.SCREENS:
        raise Refused("name")
    rules = triage.load_rules(conn)
    live = _one(params, "live") == "1"
    root = _one(params, "root")
    if name == "source_folder" and root:
        return 200, {"name": name, "rows": triage_screens.second_level(conn, rules, root)}
    return 200, {"name": name, "rows": triage_screens.aggregate(conn, name, rules, live=live)}


def read_tree(conn: sqlite3.Connection, params: dict) -> tuple[int, dict]:
    """`GET /api/triage/tree?path=...` -- one directory node's kept children.

    The path is a value, never a path this process opens: it is lowercased and
    compared against `triage_dir.path_key` as bound parameters. A path the corpus
    has never held matches no directory and comes back empty, which is the right
    answer rather than an error.
    """
    path = _one(params, "path")
    if path is None or len(path) > triage.MAX_VALUE_CHARS:
        raise Refused("path")
    try:
        return 200, triage_screens.tree(conn, triage.load_rules(conn), path)
    except triage.PredicateError:
        raise Refused("path") from None


def read_page(conn: sqlite3.Connection, params: dict) -> tuple[int, dict]:
    """`GET /api/triage/page` -- a keyset page, same contract as `/api/photos`."""
    rules = triage.load_rules(conn)
    payload = triage_screens.page(
        conn,
        rules,
        candidate=_candidate(params),
        cursor=_cursor(params),
        limit=_limit(params),
    )
    return 200, payload


def read_probe(conn: sqlite3.Connection, params: dict) -> tuple[int, dict]:
    """`GET /api/triage/probe` -- how much work the probe has. It does not run it.

    A count, in SQL, over the current rule set. Running the probe from here
    would open files on `G:` and write the catalog from a request handler; see
    `probe.pending` for why neither is worth the 25 files it would measure.
    """
    return 200, probe.pending(conn)


READ_ROUTES = {
    "/api/triage/counts": read_counts,
    "/api/triage/files": read_files,
    "/api/triage/screen": read_screen,
    "/api/triage/tree": read_tree,
    "/api/triage/page": read_page,
    "/api/triage/probe": read_probe,
}
