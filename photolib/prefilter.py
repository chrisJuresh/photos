"""Phase 1's categorical prefilter, expressed as `triage_rule` rows.

Nine extensions nobody photographs in, each written as one `exclude` rule at
`seq` 0..8 in `state.sqlite3`. Storing them as rows rather than as a list in code
is the whole point: the step `PLAN.md` called the only irreversible one before
the source is gone now reverses by deleting a row, and it uses the same ordered,
first-match-wins engine every later triage decision will use.

Zero I/O. The rules are read back *out of* the database and compiled into one
CASE expression, so the report describes the rows that exist rather than the
constant below -- edit a row by hand and the numbers move with it.

What this deliberately does not do: it does not set `file.state = 'excluded'`,
does not touch `photo`, and does not consult `triage_override`. Nothing is
excluded from the read path here; a verdict reaching `/api/photos`, and
overrides beating rules, both belong to the triage engine. This step writes five
columns into one table and reads two others.
"""

from __future__ import annotations

import argparse
import json
import sqlite3
import sys
import time
from datetime import UTC, datetime
from pathlib import Path

from photolib import db, migrate

# In PLAN.md's order. Adding to this list is a decision about what never gets
# looked at again, so it stays exactly the nine formats with no judgement call in
# them: vector graphics, TypeScript, Outlook messages, cursors, icons, DirectX
# textures, X bitmaps, Python bytecode, and v1's `.file` catch-all. Everything
# arguable -- `.png` above all -- survives to triage, where changing your mind is
# free.
EXCLUDED_EXTENSIONS = (".svg", ".ts", ".file", ".msg", ".ico", ".dds", ".xbm", ".pyc", ".cur")

NOTE = "phase 1 categorical prefilter"

# Predicates are structured, never SQL text: a rule set is human input, and the
# triage UI will be authoring these. Column and operator are whitelists and the
# value always travels as a bound parameter, so nothing a rule carries can reach
# the database as syntax. One column and one operator is all the prefilter needs;
# the triage engine widens both.
COLUMNS = ("ext",)
OPERATORS = ("=",)


class PrefilterRefused(RuntimeError):
    """Raised instead of writing. `state.sqlite3` was left exactly as found."""


# --- the predicate -----------------------------------------------------------


def compile_predicate(text: str) -> tuple[str, list[str]]:
    """`{"column": "ext", "op": "=", "value": ".svg"}` -> `("ext = ?", [".svg"])`.

    Every rejection here is a real input: the predicate arrives from a TEXT
    column that a human or a future UI wrote.
    """
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"predicate is not JSON: {text!r}") from exc
    if not isinstance(parsed, dict) or set(parsed) != {"column", "op", "value"}:
        raise ValueError(f"predicate needs exactly column, op and value: {text!r}")
    column, op, value = parsed["column"], parsed["op"], parsed["value"]
    if column not in COLUMNS:
        raise ValueError(f"unknown predicate column {column!r}, expected one of {COLUMNS}")
    if op not in OPERATORS:
        raise ValueError(f"unknown predicate operator {op!r}, expected one of {OPERATORS}")
    if not isinstance(value, str):
        raise ValueError(f"predicate value must be a string, got {value!r}")
    return f"{column} {op} ?", [value]


def predicate(column: str, op: str, value: str) -> str:
    """One predicate as it is stored. Refuses to build what cannot be compiled."""
    text = json.dumps({"column": column, "op": op, "value": value})
    compile_predicate(text)
    return text


def describe(text: str) -> str:
    """A stored predicate for human eyes: `ext = '.svg'`."""
    parsed = json.loads(text)
    return f"{parsed['column']} {parsed['op']} {parsed['value']!r}"


# --- the rules ---------------------------------------------------------------


def rules() -> list[tuple[int, str, str, str]]:
    """The prefilter as `(seq, predicate, decision, note)`, in evaluation order."""
    return [
        (seq, predicate("ext", "=", ext), "exclude", NOTE)
        for seq, ext in enumerate(EXCLUDED_EXTENSIONS)
    ]


def stored_rules(conn: sqlite3.Connection) -> list[tuple[int, int, str, str]]:
    """`(id, seq, predicate, decision)` for every rule, in evaluation order."""
    return conn.execute(
        "SELECT id, seq, predicate, decision FROM state.triage_rule ORDER BY seq, id"
    ).fetchall()


def install(conn: sqlite3.Connection, *, now: str | None = None) -> str:
    """Write the prefilter rules if absent. Returns `inserted` or `present`.

    `state.sqlite3` holds the only decisions in this project that cannot be
    regenerated, so this never overwrites and never deletes. Re-running with the
    rules already in place is a no-op that keeps their original `created_at`, and
    a rule set that is anything other than exactly the prefilter is a refusal --
    removing those rows is a deliberate act, not a side effect of a report.
    """
    wanted = rules()
    existing = conn.execute(
        "SELECT seq, predicate, decision, note FROM state.triage_rule ORDER BY seq, id"
    ).fetchall()
    if existing == wanted:
        return "present"
    if existing:
        raise PrefilterRefused(
            f"state.triage_rule already holds {len(existing)} rule(s) that are not the "
            f"prefilter; delete them deliberately before re-running"
        )
    created_at = now or datetime.now(UTC).isoformat(timespec="seconds")
    conn.execute("BEGIN")
    conn.executemany(
        "INSERT INTO state.triage_rule (seq, predicate, decision, note, created_at) "
        "VALUES (?, ?, ?, ?, ?)",
        [(*rule, created_at) for rule in wanted],
    )
    conn.execute("COMMIT")
    return "inserted"


# --- evaluating them ---------------------------------------------------------


def first_match(
    rule_rows: list[tuple[int, int, str, str]], qualifier: str = ""
) -> tuple[str, list[str]]:
    """The rule set as one CASE expression yielding the matching rule's id.

    SQL's CASE evaluates its branches top-down and stops at the first true one,
    which is exactly the rule model -- so ordering costs nothing and needs no
    second pass. NULL means no rule matched.
    """
    if not rule_rows:
        return "NULL", []
    branches, params = [], []
    for rule_id, _, text, _ in rule_rows:
        sql, values = compile_predicate(text)
        branches.append(f"WHEN {qualifier}{sql} THEN {int(rule_id)}")
        params.extend(values)
    return "CASE " + " ".join(branches) + " END", params


def tally(conn: sqlite3.Connection) -> list[dict]:
    """Per rule: the files, bytes and origin paths it takes. Plus the remainder.

    Two aggregates. Counts and bytes come from `file`, one row per distinct byte
    sequence, because bytes counted per path would count a duplicate twice. Paths
    come from `origin` joined back to `file`, so a rule's path count is every
    known name for the files it took, matched on the same extension the byte-level
    rule matched on.

    The last row carries `seq = None`: the files no rule matched, which is what
    survives into triage.
    """
    rule_rows = stored_rules(conn)
    case, params = first_match(rule_rows)
    matched = {
        rule_id: (count, size)
        for rule_id, count, size in conn.execute(
            f"SELECT {case} AS rule_id, count(*), coalesce(sum(size), 0) FROM file GROUP BY 1",
            params,
        )
    }
    joined, join_params = first_match(rule_rows, "f.")
    paths = dict(
        conn.execute(
            f"SELECT {joined} AS rule_id, count(*) FROM origin o "
            "JOIN file f ON f.sha256 = o.sha256 GROUP BY 1",
            join_params,
        )
    )

    report = []
    for rule_id, seq, text, decision in rule_rows:
        count, size = matched.get(rule_id, (0, 0))
        report.append(
            {
                "seq": seq,
                "predicate": describe(text),
                "decision": decision,
                "files": count,
                "bytes": size,
                "paths": paths.get(rule_id, 0),
            }
        )
    count, size = matched.get(None, (0, 0))
    report.append(
        {
            "seq": None,
            "predicate": "no rule matched",
            "decision": "include",
            "files": count,
            "bytes": size,
            "paths": paths.get(None, 0),
        }
    )
    return report


def totals(report: list[dict]) -> dict[str, dict[str, int]]:
    """The two lines the gate is read off: what leaves and what stays."""
    summed: dict[str, dict[str, int]] = {
        "excluded": {"files": 0, "bytes": 0, "paths": 0},
        "surviving": {"files": 0, "bytes": 0, "paths": 0},
    }
    for row in report:
        into = summed["excluded" if row["decision"] == "exclude" else "surviving"]
        for key in into:
            into[key] += row[key]
    return summed


# --- the report --------------------------------------------------------------


def _print(conn: sqlite3.Connection, report: list[dict]) -> None:
    header = f"{'seq':>4}  {'predicate':<20}{'decision':<10}{'files':>10}{'bytes':>17}{'paths':>12}"
    print(f"\n{header}")
    print("-" * len(header))
    for row in report:
        seq = "-" if row["seq"] is None else str(row["seq"])
        print(
            f"{seq:>4}  {row['predicate']:<20}{row['decision']:<10}"
            f"{row['files']:>10,}{row['bytes']:>17,}{row['paths']:>12,}"
        )

    summed = totals(report)
    print("-" * len(header))
    for name in ("excluded", "surviving"):
        line = summed[name]
        print(
            f"{'':>4}  {name:<30}{line['files']:>10,}{line['bytes']:>17,}{line['paths']:>12,}"
            f"   {line['bytes'] / 1e9:6.2f} GB"
        )

    files, size = conn.execute("SELECT count(*), coalesce(sum(size), 0) FROM file").fetchone()
    origins = conn.execute("SELECT count(*) FROM origin").fetchone()[0]
    print(
        f"{'':>4}  {'catalog':<30}{files:>10,}{size:>17,}{origins:>12,}   {size / 1e9:6.2f} GB"
    )
    accounted = summed["excluded"]["files"] + summed["surviving"]["files"]
    print(f"\n          every file row is in exactly one bucket: {accounted == files}")


def run(catalog_db: Path | None = None, state_db: Path | None = None) -> int:
    conn = db.connect(catalog_db, state_db)
    try:
        if migrate.version(conn, "state") < 2:
            raise SystemExit("state schema is behind; run python -m photolib.migrate first")
        status = install(conn)
        rule_rows = stored_rules(conn)
        print(f"rules     {len(rule_rows)} in state.triage_rule ({status})")

        started = time.perf_counter()
        report = tally(conn)
        print(f"tally     {time.perf_counter() - started:.1f}s, pure SQL, nothing was opened")
        _print(conn, report)
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    argparse.ArgumentParser(description=__doc__.splitlines()[0]).parse_args()
    try:
        sys.exit(run())
    except PrefilterRefused as exc:
        sys.exit(f"refused: {exc}")
