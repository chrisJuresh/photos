"""The triage rule engine: ordered rules, first match wins, overrides beat all.

The model `archive/PLAN.md` specifies, and nothing more. A rule is one structured
predicate -- a `(column, operator, value)` tuple -- plus a decision. Rules
evaluate top-down and the first match wins, which is what lets a rule set say
"exclude everything under `node_modules`, except this one folder": put the
include first. A `triage_override` row keyed on `sha256` beats every rule.

Three properties are load-bearing.

**Predicates are never SQL from the client.** The column and the operator are
whitelists, the value always leaves as a bound parameter, and the SQL text is
generated from the *shape* of the validated rule. There is no `eval`, no format
string carrying a value, and -- deliberately -- no `LIKE`, whose pattern
language would put an escapable mini-syntax back into the value.

**Ordering costs nothing to evaluate.** Rules over bucket columns compile to one
`CASE`, whose branches SQL evaluates top-down and stops at the first true one.
Rules over directories compile to a `UNION ALL` of index seeks reduced by
`min(position)`. The overall winner is the smaller of those two positions, so
"first match wins" is a `min` and not a second pass.

**A rule reads exactly one column.** Composition is what the ordered list is
for. Two conditions are two rules, and the plan's screens never need more.

Every count runs against `triage_bucket` (see `triage_survey`), which is the
only reason a recompute keeps up with typing: the corpus is 1,374,328 paths but
only ~440,000 distinct predicate tuples.
"""

from __future__ import annotations

import json
import re
import sqlite3
from dataclasses import dataclass

# Larger than any rule position, so `min()` over "no match" sentinels is still
# "no match". Not NULL, because NULL would poison the min.
NO_MATCH = 1 << 30

DECISIONS = ("exclude", "include")

# A directory-valued predicate resolves to a set of `triage_dir.id`; a bucket
# predicate is a boolean over `triage_bucket` columns. The two are combined by
# position, never mixed inside one rule.
DIR_COLUMNS = ("dir_segment", "dir_under")
# `ext` and `root` are interned; a predicate over them compares integers and
# resolves the text once per statement, not once per bucket.
INTERNED = {"ext": "triage_ext", "root": "triage_root"}
TEXT_COLUMNS = ("kind",)
INT_COLUMNS = ("width", "height", "long_edge", "camera")

OPERATORS = {
    "dir_segment": ("=",),
    "dir_under": ("=",),
    "ext": ("=", "in"),
    "root": ("=", "in"),
    "kind": ("=", "in", "is null"),
    "width": ("=", "<=", ">", "is null"),
    "height": ("=", "<=", ">", "is null"),
    "long_edge": ("=", "<=", ">", "is null"),
    "camera": ("=",),
    "dims": ("=",),
}

# Screen 4 selects an exact `(width, height)` cluster, which is the one thing in
# the plan's screens that two columns decide together -- and "a rule reads
# exactly one column" is a property worth keeping rather than weakening for it.
# So `dims` is one column as far as the rule set is concerned, carrying one
# value, and only its compiled form touches two. The value's shape is checked
# here rather than trusted: it still leaves as two bound integers.
DIMS = re.compile(r"^([0-9]{1,6})x([0-9]{1,6})$")

# A rule set is human input and the UI authors it. An `in` list is bounded so a
# single rule cannot generate unbounded SQL text.
MAX_IN_VALUES = 256
MAX_VALUE_CHARS = 1024


class PredicateError(ValueError):
    """The predicate was refused. Nothing was compiled and nothing ran."""


@dataclass(frozen=True)
class Compiled:
    """One validated predicate, as the two things the query builder needs.

    `kind` is `bucket` -- `sql` is a boolean expression over `triage_bucket`
    columns -- or `dir`, where `sql` is a SELECT yielding one `dir_id` column.

    A bucket expression carries its own `{a}.` qualifiers and is finished with
    `bound(alias)`. The caller used to paste `f"{alias}.{compiled.sql}"`, which
    silently assumed every predicate begins with exactly one column name --
    true until `dims`, whose expression reads two. Qualifying inside the
    compiler keeps `origin.ext` and `origin.size` from ever resolving in place
    of the bucket's, which in a join is a wrong answer rather than an error.
    """

    kind: str
    sql: str
    params: list

    def bound(self, alias: str = "k") -> str:
        """The expression with its columns qualified by `alias`."""
        return self.sql.format(a=alias)


@dataclass(frozen=True)
class Rule:
    """A rule at a position in the evaluation order. Position is dense."""

    position: int
    predicate: str
    decision: str
    rule_id: int | None = None
    seq: int | None = None
    note: str | None = None


# --- predicates ---------------------------------------------------------------


def dir_stem(value: str) -> str:
    """The form a directory is compared in: lowercased, no trailing separator.

    Shared rather than inlined into `dir_under`, because the directory tree
    browses the same subtrees this predicate excludes. If the two normalised
    differently, the tree could show you one set of files and the exclude button
    under it take another.
    """
    stem = value.rstrip("\\/").lower()
    if not stem:
        raise PredicateError(f"a directory is needed, got {value!r}")
    return stem


def subtree_range(stem: str) -> tuple[str, str, str]:
    """`(stem, low, high)`: the directory itself, then everything below it.

    '\\' is 0x5C and ']' is 0x5D, so [stem+'\\', stem+']') is exactly the set of
    directories strictly below `stem` under SQLite's BINARY collation. The
    directory itself is not in that range, which is why it is a separate
    equality and why this returns three values rather than two.
    """
    return stem, stem + "\\", stem + "]"


def predicate(column: str, op: str, value) -> str:
    """One predicate as it is stored. Refuses to build what cannot be compiled."""
    text = json.dumps({"column": column, "op": op, "value": value})
    compile_predicate(text)
    return text


def _check_value(column: str, op: str, value):
    if op == "is null":
        if value is not None:
            raise PredicateError(f"{column} 'is null' takes no value, got {value!r}")
        return None
    if op == "in":
        if not isinstance(value, list) or not value:
            raise PredicateError(f"{column} 'in' needs a non-empty list, got {value!r}")
        if len(value) > MAX_IN_VALUES:
            raise PredicateError(f"{column} 'in' holds {len(value)} values, limit {MAX_IN_VALUES}")
        for item in value:
            if not isinstance(item, str) or len(item) > MAX_VALUE_CHARS:
                raise PredicateError(f"{column} 'in' values must be short strings, got {item!r}")
        return list(value)
    if column in INT_COLUMNS:
        # isinstance(True, int) is True, and a bool is not a pixel count.
        if type(value) is not int or value < 0:
            raise PredicateError(f"{column} needs a non-negative integer, got {value!r}")
        return value
    if not isinstance(value, str) or len(value) > MAX_VALUE_CHARS:
        raise PredicateError(f"{column} needs a string, got {value!r}")
    # '' is a real extension -- 641,764 paths in this corpus carry none -- so it
    # is only the columns where emptiness is meaningless that reject it.
    if not value and column != "ext":
        raise PredicateError(f"{column} needs a non-empty string")
    return value


def compile_predicate(text: str) -> Compiled:
    """`{"column": "ext", "op": "=", "value": ".svg"}` -> a bound-parameter form.

    Every rejection here is a real input: the predicate arrives from a TEXT
    column that a human, or the triage UI, wrote.
    """
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as exc:
        raise PredicateError(f"predicate is not JSON: {text!r}") from exc
    if not isinstance(parsed, dict) or set(parsed) != {"column", "op", "value"}:
        raise PredicateError(f"predicate needs exactly column, op and value: {text!r}")
    column, op, value = parsed["column"], parsed["op"], parsed["value"]
    if column not in OPERATORS:
        raise PredicateError(f"unknown predicate column {column!r}")
    if op not in OPERATORS[column]:
        raise PredicateError(f"{column!r} does not take operator {op!r}")
    value = _check_value(column, op, value)

    if column == "dir_segment":
        # One directory name, matched whole. Not a substring: `dist` must not
        # take `redistributable`, which is exactly what a LIKE would do.
        if "\\" in value or "/" in value:
            raise PredicateError("dir_segment is one directory name, not a path")
        return Compiled("dir", "SELECT dir_id FROM triage_dir_segment WHERE seg = ?", [value.lower()])
    if column == "dir_under":
        stem = dir_stem(value)
        return Compiled(
            "dir",
            "SELECT id AS dir_id FROM triage_dir WHERE path_key = ? "
            "OR (path_key >= ? AND path_key < ?)",
            list(subtree_range(stem)),
        )

    if column == "dims":
        # Screen 4's exact cluster. The bucket table already carries `width` and
        # `height`, so this needs no column, no migration and no survey rebuild
        # -- only a value shape and two bound integers.
        match = DIMS.match(value)
        if not match:
            raise PredicateError(f"dims is '<width>x<height>', got {value!r}")
        return Compiled(
            "bucket",
            "({a}.width = ? AND {a}.height = ?)",
            [int(match.group(1)), int(match.group(2))],
        )

    if column in INTERNED:
        # An uncorrelated subquery, so SQLite resolves the text to an id once
        # per statement and the per-row work is an integer comparison. A value
        # the corpus has never seen resolves to no row and the predicate simply
        # matches nothing, which is the right answer and not an error. Only the
        # outer column is qualified: the one inside the subquery belongs to the
        # interning table.
        table = INTERNED[column]
        if op == "in":
            placeholders = ", ".join("?" * len(value))
            return Compiled(
                "bucket",
                f"{{a}}.{column}_id IN (SELECT id FROM {table} WHERE {column} IN ({placeholders}))",
                [item.lower() for item in value],
            )
        return Compiled(
            "bucket",
            f"{{a}}.{column}_id = (SELECT id FROM {table} WHERE {column} = ?)",
            [value.lower()],
        )
    if op == "is null":
        return Compiled("bucket", f"{{a}}.{column} IS NULL", [])
    if op == "in":
        return Compiled(
            "bucket", f"{{a}}.{column} IN ({', '.join('?' * len(value))})", list(value)
        )
    return Compiled("bucket", f"{{a}}.{column} {op} ?", [value])


def describe(text: str) -> str:
    """A stored predicate for human eyes: `ext = '.svg'`."""
    parsed = json.loads(text)
    if parsed["op"] == "is null":
        return f"{parsed['column']} is null"
    return f"{parsed['column']} {parsed['op']} {parsed['value']!r}"


# --- reading the rule set ------------------------------------------------------


def load_rules(conn: sqlite3.Connection) -> list[Rule]:
    """Every stored rule, in evaluation order, with a dense position.

    Order is `(seq, id)`, not `seq` alone: nothing stops two rules sharing a
    `seq`, and an order that depends on which row SQLite happens to return
    first is not an order. `position` is what everything downstream uses, so
    inserting a rule renumbers positions without renumbering rows.
    """
    rows = conn.execute(
        "SELECT id, seq, predicate, decision, note FROM state.triage_rule ORDER BY seq, id"
    ).fetchall()
    rules = []
    for position, (rule_id, seq, text, decision, note) in enumerate(rows):
        if decision not in DECISIONS:
            raise PredicateError(f"rule {rule_id} has decision {decision!r}")
        compile_predicate(text)  # refuse the whole set rather than skip a row
        rules.append(Rule(position, text, decision, rule_id, seq, note))
    return rules


# --- compiling a rule set into one verdict expression ---------------------------


@dataclass(frozen=True)
class DirRelation:
    """The directory rules of one rule set, as a joinable relation or as nothing.

    `cte` is None when the set holds no directory rule at all, and that case is
    not cosmetic. An empty CTE joined to `triage_bucket` is estimated as
    trivially small, so SQLite builds no automatic index for it and re-scans it
    once per bucket row: two such joins turned a 30 ms scan into 1,446 ms. When
    there is nothing to join, the join is not emitted.
    """

    cte: str | None
    params: list
    alias: str

    @property
    def pos(self) -> str:
        return f"{self.alias}.pos" if self.cte else "NULL"

    @property
    def matched(self) -> str:
        return f"{self.alias}.dir_id IS NOT NULL" if self.cte else "0"

    @property
    def join(self) -> str:
        if not self.cte:
            return ""
        return f"LEFT JOIN {self.alias} ON {self.alias}.dir_id = k.dir_id"


def _dir_cte(rules: list[Rule], alias: str, restrict: str | None = None) -> DirRelation:
    """`alias`(dir_id, pos): the lowest-positioned directory rule per directory.

    Each branch is an index seek, so this costs what the rules actually match
    rather than what the vocabulary holds -- 3.6 ms for twelve segment rules
    against 548 ms for the same twelve as LIKE patterns.

    `restrict` is the name of a relation with a `dir_id` column, and it bounds
    every branch to that set. It is an exact equivalence rather than a shortcut:
    this relation is only ever reached by a LEFT JOIN on `dir_id`, so a row for a
    directory the caller cannot join to could not have changed an answer. It
    exists because "what the rules actually match" stopped being small -- the
    live rule set's 187 segment rules cover 312,891 of the 315,680 directories,
    so building the whole relation costs ~997 ms whatever is asked of it, and the
    directory tree asks about one subtree at a time. Restricted to a subtree the
    same relation costs 13 ms. Never client input: callers pass a CTE name they
    wrote themselves.
    """
    where = f" WHERE dir_id IN (SELECT dir_id FROM {restrict})" if restrict else ""
    branches, params = [], []
    for rule in rules:
        compiled = compile_predicate(rule.predicate)
        if compiled.kind != "dir":
            continue
        branches.append(f"SELECT dir_id, {rule.position} AS pos FROM ({compiled.sql}){where}")
        params.extend(compiled.params)
    if not branches:
        return DirRelation(None, [], alias)
    union = " UNION ALL ".join(branches)
    return DirRelation(
        f"{alias}(dir_id, pos) AS MATERIALIZED "
        f"(SELECT dir_id, min(pos) FROM ({union}) GROUP BY dir_id)",
        params,
        alias,
    )


def _with(*relations: DirRelation) -> str:
    """The WITH prefix for whichever directory relations exist."""
    parts = [relation.cte for relation in relations if relation.cte]
    return f"WITH {', '.join(parts)} " if parts else ""


def _bucket_case(rules: list[Rule], alias: str = "k") -> tuple[str, list]:
    """The bucket rules as one CASE yielding the winning position.

    CASE stops at its first true branch, so emitting the branches in position
    order makes the expression itself the first-match-wins rule -- no second
    pass, no min over a list. Qualification is `Compiled.bound`'s job: `origin`
    also has `ext` and `size`, and an unqualified column in a join is a silent
    wrong answer.
    """
    branches, params = [], []
    for rule in rules:
        compiled = compile_predicate(rule.predicate)
        if compiled.kind != "bucket":
            continue
        branches.append(f"WHEN {compiled.bound(alias)} THEN {rule.position}")
        params.extend(compiled.params)
    if not branches:
        return str(NO_MATCH), []
    return "CASE " + " ".join(branches) + f" ELSE {NO_MATCH} END", params


def _winner(dirs: DirRelation, case_sql: str) -> str:
    """The position of the first matching rule, or NO_MATCH.

    The directory rules and the bucket rules each produce their own lowest
    matching position; the smaller of the two is the rule that actually wins.
    """
    return f"min(coalesce({dirs.pos}, {NO_MATCH}), {case_sql})"


def _kept(winner: str, rules: list[Rule]) -> str:
    """1 if the rule at `winner` keeps the row. Positions are integers we made."""
    excluded = [rule.position for rule in rules if rule.decision == "exclude"]
    if not excluded:
        return "1"
    return f"({winner} NOT IN ({', '.join(str(p) for p in excluded)}))"


def _kept_expression(dirs: DirRelation, rules: list[Rule], alias: str = "k") -> tuple[str, list]:
    """`(kept expression, params)` for a query that scores rows one at a time.

    Returned together because a rule set with no `exclude` in it collapses to
    the constant 1 -- and then the bucket CASE is gone from the SQL, so its
    bound values must be gone from the parameter list too. Returning the two
    separately is how that goes wrong.
    """
    case_sql, case_params = _bucket_case(rules, alias)
    if not any(rule.decision == "exclude" for rule in rules):
        return "1", []
    return _kept(_winner(dirs, case_sql), rules), case_params


# --- the count ------------------------------------------------------------------

# One statement over `triage_bucket`, scoring the saved set and the candidate in
# the same pass, and grouped by *which rule won* rather than by kept/excluded.
#
# Grouping on the winning position rather than summing a decision is the whole
# performance story, measured on the real 448,512-bucket surface:
#
#   bare scan, two sums                                        30 ms
#   the same plus a 9-branch CASE, one sum                     90 ms
#   ... and eight sums over that CASE                         658 ms
#   ... expanded into the kept/excluded/candidate form      1,193 ms
#   grouped by (winning position, candidate hit)              222 ms
#
# SQLite does not common-subexpression a computed column across aggregates, so
# every one of the eight sums re-ran the whole CASE. Grouping evaluates it once
# and yields at most `len(rules) + 1` rows -- and those rows are also exactly
# the per-rule breakdown the rule sidebar and screen 0 need, so the eight
# numbers and the table above them come out of one query rather than two.
#
# Turning positions into kept/excluded then happens in Python, against the same
# rule list that generated the SQL.
_TALLY_CTE = """tally AS (
   SELECT {winner} AS w,
          ({cand_bucket} OR {cand_dir}) AS hit,
          k.paths AS n, k.bytes AS b
   FROM triage_bucket k
   {dv_join}
   {cv_join}
 )"""

_COUNT_TAIL = "SELECT w, hit, sum(n), sum(b) FROM tally GROUP BY 1, 2"

_OVERRIDE_SQL = """
SELECT o.decision, {kept} AS kept_now, count(*), coalesce(sum(g.size), 0)
FROM state.triage_override o
CROSS JOIN origin g ON g.sha256 = o.sha256
JOIN triage_path tp ON tp.origin_id = g.id
JOIN triage_bucket k ON k.id = tp.bucket_id
{dv_join}
GROUP BY 1, 2
"""


def _override_correction(conn: sqlite3.Connection, rules: list[Rule]) -> dict[str, int]:
    """How the overrides move paths and bytes away from the rules' verdict.

    An override is a decision about *bytes*, so it carries every path of that
    content with it. Returned as a delta on the kept side; the excluded side is
    its negation, because every path is in exactly one bucket and therefore on
    exactly one side.

    `CROSS JOIN` is load-bearing: it is SQLite's only way to pin join order, and
    without it the planner drives from `origin` and scans all 1,374,328 rows to
    find the handful with an override -- 140 ms with *zero* overrides stored.
    Driven from `triage_override` the cost is the overrides', not the corpus'.
    """
    dirs = _dir_cte(rules, "dv")
    kept, case_params = _kept_expression(dirs, rules)
    sql = _with(dirs) + _OVERRIDE_SQL.format(kept=kept, dv_join=dirs.join)
    delta = {"paths": 0, "bytes": 0}
    for decision, kept_now, paths, size in conn.execute(sql, [*dirs.params, *case_params]):
        wanted = 1 if decision == "include" else 0
        if wanted == kept_now:
            continue
        sign = 1 if wanted else -1
        delta["paths"] += sign * paths
        delta["bytes"] += sign * size
    return delta


def candidate_relation(candidate: Rule | None) -> tuple[DirRelation, str, list]:
    """A candidate rule as `(directory relation, boolean over `k`, params)`.

    Exactly one of the two carries the predicate: a directory rule matches
    through the relation and its bucket expression is the constant false, and
    a bucket rule the other way round. The caller pastes both unconditionally.
    """
    if candidate is None:
        return DirRelation(None, [], "cv"), "0", []
    dirs = _dir_cte([candidate], "cv")
    compiled = compile_predicate(candidate.predicate)
    if compiled.kind == "bucket":
        return dirs, compiled.bound("k"), compiled.params
    return dirs, "0", []


def count_sql(rules: list[Rule], candidate: Rule | None = None) -> tuple[str, list]:
    """The one query, and its bound parameters. Exposed so a test can time it.

    Returns `(winning position, candidate hit, paths, bytes)` per group. The
    saved set and the candidate are scored in the same pass over
    `triage_bucket`; which of the two decides a row is arithmetic on the
    position, done by the caller.
    """
    dirs = _dir_cte(rules, "dv")
    case_sql, case_params = _bucket_case(rules)
    cand_dirs, cand_bucket, cand_params = candidate_relation(candidate)

    ctes = [relation.cte for relation in (dirs, cand_dirs) if relation.cte]
    ctes.append(
        _TALLY_CTE.format(
            winner=_winner(dirs, case_sql),
            cand_bucket=cand_bucket,
            cand_dir=cand_dirs.matched,
            dv_join=dirs.join,
            cv_join=cand_dirs.join,
        )
    )
    sql = "WITH " + ",\n ".join(ctes) + "\n" + _COUNT_TAIL
    # In statement order: the dv CTE, the cv CTE, then the tally SELECT's own two
    # expressions -- the saved bucket CASE, then the candidate's predicate.
    return sql, [*dirs.params, *cand_dirs.params, *case_params, *cand_params]


def _decisions(rules: list[Rule]) -> list[bool]:
    """`kept[position]` for every rule, plus a trailing True for "no rule matched"."""
    return [rule.decision == "include" for rule in rules] + [True]


def counts(
    conn: sqlite3.Connection,
    rules: list[Rule] | None = None,
    *,
    candidate: Rule | None = None,
    at: int | None = None,
    overrides: bool = True,
) -> dict:
    """Kept and excluded paths and bytes, for the saved set and for a candidate.

    `at` is where the candidate would be inserted; it beats every saved rule
    from that position down. The default is the end of the list, which is what
    a rule typed into the last screen means.

    `per_rule` comes out of the same query: how many paths and bytes each rule
    actually takes, in order, which is the rule sidebar and screen 0's table. So
    does `page_paths`, the size of the contact sheet the same candidate produces.
    """
    rules = load_rules(conn) if rules is None else rules
    position = len(rules) if at is None else at
    if candidate is not None:
        candidate = Rule(position, candidate.predicate, candidate.decision)

    sql, params = count_sql(rules, candidate)
    kept_by_position = _decisions(rules)
    cand_kept = candidate is not None and candidate.decision == "include"

    result = dict.fromkeys(
        (
            "kept_paths",
            "kept_bytes",
            "excluded_paths",
            "excluded_bytes",
            "candidate_kept_paths",
            "candidate_kept_bytes",
            "candidate_excluded_paths",
            "candidate_excluded_bytes",
            "page_paths",
        ),
        0,
    )
    per_rule = [{"paths": 0, "bytes": 0} for _ in range(len(rules) + 1)]

    for winner, hit, paths, size in conn.execute(sql, params):
        index = len(rules) if winner >= NO_MATCH else winner
        per_rule[index]["paths"] += paths
        per_rule[index]["bytes"] += size

        kept = kept_by_position[index]
        side = "kept" if kept else "excluded"
        result[f"{side}_paths"] += paths
        result[f"{side}_bytes"] += size

        # The candidate sits at `position`, so it takes every row whose saved
        # winner is at or below it -- including "no rule matched".
        taken = bool(hit) and candidate is not None and winner >= position
        side = "kept" if (cand_kept if taken else kept) else "excluded"
        result[f"candidate_{side}_paths"] += paths
        result[f"candidate_{side}_bytes"] += size

        # How many rows the contact sheet will serve, which is what lets the
        # client give the scrollbar its final length from the first page. It is
        # `triage_screens.page`'s own relation -- kept by the saved rules, and
        # matched by the candidate -- so it falls out of this tally for free
        # rather than costing a second 220 ms query. Position does not enter it:
        # the sheet shows what the candidate covers, not what it would win.
        # Neither do the overrides, which the sheet reports per tile and does
        # not filter on, so this is deliberately outside the correction below.
        if kept and (candidate is None or hit):
            result["page_paths"] += paths

    if overrides:
        delta = _override_correction(conn, rules)
        for prefix in ("", "candidate_"):
            result[f"{prefix}kept_paths"] += delta["paths"]
            result[f"{prefix}kept_bytes"] += delta["bytes"]
            result[f"{prefix}excluded_paths"] -= delta["paths"]
            result[f"{prefix}excluded_bytes"] -= delta["bytes"]
    result["per_rule"] = per_rule
    return result


# --- the verdict of one path, and of one file -----------------------------------


@dataclass(frozen=True)
class Verdict:
    """The kept/excluded expression of one rule set, for the screens to embed.

    `ctes` and `join` are empty when the set holds no directory rule, so a
    caller composes all four pieces unconditionally.

    The parameters come in two groups because they bind in two different places
    and a caller may put SQL of its own between them. `dir_params` belongs to
    the directory CTE, which `query` emits first; `case_params` belongs to
    `kept`, which lands wherever the caller pastes it. `params` concatenates
    them for the common case where the caller adds no parameterised CTE of its
    own, and is the wrong thing to use when it does -- see `probe._worklist_sql`,
    whose `candidate` CTE sits between the two and which bound them as one list
    until it was measured against a rule set holding a directory rule.

    `winner` is the first-match-wins position `counts` already groups by, exposed
    for a caller that needs *which* rule decided a row and not only whether it
    survived -- `promote` names it against every object it destroys. It binds
    `winner_params`, which is **not** `case_params`: a rule set with no `exclude`
    in it collapses `kept` to the constant 1 and takes its bound values away with
    it, while `winner` still carries the whole `CASE`. Select `kept` and bind
    `[*dir_params, *case_params]`, or select `winner` and bind
    `[*dir_params, *winner_params]`; selecting both pays the `CASE` twice, and
    `kept_of` exists so that a caller can compute `winner` once into a column and
    derive the verdict from that column instead.
    """

    ctes: list[str]
    join: str
    kept: str
    dir_params: list
    case_params: list
    winner: str = str(NO_MATCH)
    winner_params: tuple = ()
    excluded: tuple[int, ...] = ()

    @property
    def params(self) -> list:
        """Both groups, in text order, for a caller that interposes nothing."""
        return [*self.dir_params, *self.case_params]

    def kept_of(self, column: str) -> str:
        """`kept`, re-expressed over an already-computed `winner` column.

        Binds nothing: rule positions are integers this module generated, and
        the caller has already paid `case_params` once, for `winner`.
        """
        if not self.excluded:
            return "1"
        return f"({column} NOT IN ({', '.join(str(position) for position in self.excluded)}))"

    def query(self, *ctes: str, tail: str) -> str:
        """`WITH <dir CTE?>, <the caller's CTEs> <tail>`."""
        parts = [*self.ctes, *ctes]
        return ("WITH " + ",\n ".join(parts) + "\n" if parts else "") + tail


def verdict_expression(rules: list[Rule], alias: str = "k", restrict: str | None = None) -> Verdict:
    """The same verdict the counts use, for a query over individual rows.

    Generated in one place so a contact sheet can never disagree with the
    number printed above it. The caller joins `triage_bucket AS <alias>`.

    `restrict` names a relation of `dir_id` the caller has already bounded its
    own scan to; see `_dir_cte` for why that is free of consequence and what it
    is worth.
    """
    dirs = _dir_cte(rules, "dv", restrict)
    kept, case_params = _kept_expression(dirs, rules, alias)
    join = dirs.join.replace("k.dir_id", f"{alias}.dir_id")
    ctes = [dirs.cte] if dirs.cte else []
    case_sql, winner_params = _bucket_case(rules, alias)
    return Verdict(
        ctes,
        join,
        kept,
        dirs.params,
        case_params,
        _winner(dirs, case_sql),
        tuple(winner_params),
        tuple(rule.position for rule in rules if rule.decision == "exclude"),
    )


def file_counts(conn: sqlite3.Connection, rules: list[Rule] | None = None) -> dict[str, int]:
    """The same verdict folded to distinct content. Deliberately not the hot path.

    A file is kept if **any** of its paths is kept: the bytes are identical, so
    one surviving copy is enough and excluding the others cannot lose it.

    That fold is a `GROUP BY sha256` over all 1,374,328 paths joined back to
    their buckets, and measures ~2.9 s warm against ~220 ms for the bucket
    aggregate. It is the honest number for "how many photographs survive", and
    it is an order of magnitude too slow to run while somebody types -- which is
    the whole reason `counts` counts paths and this is a separate call.

    One consequence worth stating, because it makes the two disagree slightly:
    a rule reads `origin.ext`, which is per *path*, while `file.ext` is one
    value per content hash. 539 files in this corpus carry paths with different
    extensions, so a rule that takes `.svg` leaves them kept here.
    """
    rules = load_rules(conn) if rules is None else rules
    verdict = verdict_expression(rules)
    sql = verdict.query(
        f"""per AS (
       SELECT g.sha256 AS sha256, max({verdict.kept}) AS kept, max(g.size) AS size
       FROM origin g
       JOIN triage_path tp ON tp.origin_id = g.id
       JOIN triage_bucket k ON k.id = tp.bucket_id
       {verdict.join}
       GROUP BY g.sha256
     )""",
        """final AS (
       SELECT coalesce(CASE o.decision WHEN 'include' THEN 1 WHEN 'exclude' THEN 0 END,
                       per.kept) AS kept,
              per.size AS size
       FROM per LEFT JOIN state.triage_override o ON o.sha256 = per.sha256
     )""",
        tail="""SELECT coalesce(sum(kept), 0), coalesce(sum(kept * size), 0),
           coalesce(sum(1 - kept), 0), coalesce(sum((1 - kept) * size), 0)
    FROM final""",
    )
    row = conn.execute(sql, verdict.params).fetchone()
    return {
        "kept_files": row[0],
        "kept_bytes": row[1],
        "excluded_files": row[2],
        "excluded_bytes": row[3],
    }
