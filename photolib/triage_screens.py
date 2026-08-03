"""The survey queries behind `PLAN.md`'s eight triage screens.

Each screen answers the same two questions in the same two shapes:

    rows  -- the aggregate the screen is *about*: extensions, directory names,
             dimension bands, roots. Always restricted to what the current rule
             set still keeps, so screen 2 does not offer you extensions that
             screen 1 already removed.
    page  -- a keyset page of the individual paths behind a chosen row, using
             the same contract as `/api/photos`: `before` + `before_id` in,
             `{"photos": [...], "next": {...}}` out, so the grid component is
             the same component.

The cursor is the pair `(path, origin id)`, never the path alone. `origin.path`
is UNIQUE so a one-column cursor would in fact work here -- but the grid's
cursor is a pair for the reason `PLAN.md` gives about tied sort keys, and a
second contract that happens to be satisfiable with one column is a contract
the UI has to special-case. It orders ascending, because a contact sheet of a
directory tree is read in tree order.

What is paged is decided by a *candidate predicate* rather than by a per-screen
query: "show me the files this rule would take". One code path then serves
clicking an extension on screen 2, a directory name on screen 1 and a
`(width, height)` pair on screen 4 -- and screen 7, which passes no candidate
and pages the remainder.
"""

from __future__ import annotations

import base64
import sqlite3

from photolib import triage

DEFAULT_LIMIT = 500
MAX_LIMIT = 1000

# Screen 3's bands, from `PLAN.md`. The long edge is orientation-invariant, so
# a header reading that has not been transposed still lands in the right band.
DIMENSION_BANDS = (64, 256, 512, 1024)

SCREENS = (
    "no_image_content",
    "containers",
    "file_type",
    "dimensions",
    "exact_dimensions",
    "camera",
    "source_folder",
    "undecided",
)

# How many aggregate rows a screen returns. The contact sheet is paged; the
# aggregate is a leaderboard and a long tail nobody reads.
TOP_N = 200

# Screen 1 re-costs this many of the largest segments and returns the best
# TOP_N of them. Ranking by unfiltered size can only over-include, never
# under-include, so a pool several times TOP_N is a bound on the reordering
# that filtering can cause -- and the whole 47,787-segment vocabulary is the
# alternative, at 2.7 s a keystroke.
SEGMENT_POOL = 1000


def _kept_bucket_cte(rules: list[triage.Rule]) -> tuple[triage.Verdict, str]:
    """`kept_bucket(id, dir_id, ...)`: the buckets the current rules still keep.

    Every screen aggregates over this rather than over `triage_bucket`, so the
    numbers on screen N are always "of what is left", which is what makes the
    review order collapse the working set.
    """
    verdict = triage.verdict_expression(rules)
    cte = f"""kept_bucket AS (
      SELECT k.id, k.dir_id, k.root_id, k.ext_id, k.kind, k.width, k.height,
             k.long_edge, k.camera, k.paths, k.bytes
      FROM triage_bucket k
      {verdict.join}
      WHERE {verdict.kept}
    )"""
    return verdict, cte


# --- the aggregates -------------------------------------------------------------

_AGGREGATES = {
    # Screen 0 is the one screen that reports what is *gone*: the prefilter
    # rules and what each removed. It comes from `triage.counts`, not from here.
    #
    # Screen 1's live form. Costed against the current rule set, and slow on
    # purpose rather than by accident: the top 50 segments alone account for
    # 1,953,553 of the 2,894,845 rows in the segment index, so there is no
    # shortlist that makes this cheap. Measured at 1.9-2.7 s whatever the pool
    # size, against 2.5 ms for the survey-time rollup. `aggregate` serves the
    # rollup by default and this only when asked; the number that has to move
    # while somebody types is the candidate's, and that one is `triage.counts`.
    "containers_live": """
      SELECT ds.seg, count(DISTINCT ds.dir_id), sum(b.paths), sum(b.bytes)
      FROM (SELECT seg FROM triage_segment ORDER BY paths DESC LIMIT ?) top
      JOIN triage_dir_segment ds ON ds.seg = top.seg
      JOIN kept_bucket b ON b.dir_id = ds.dir_id
      GROUP BY 1 ORDER BY 3 DESC LIMIT ?
    """,
    "file_type": """
      SELECT e.ext, NULL, sum(b.paths), sum(b.bytes)
      FROM kept_bucket b JOIN triage_ext e ON e.id = b.ext_id
      GROUP BY 1 ORDER BY 3 DESC LIMIT ?
    """,
    "dimensions": """
      SELECT CASE WHEN long_edge IS NULL THEN 'unknown'
                  WHEN long_edge <= 64   THEN '<=64'
                  WHEN long_edge <= 256  THEN '<=256'
                  WHEN long_edge <= 512  THEN '<=512'
                  WHEN long_edge <= 1024 THEN '<=1024'
                  ELSE '>1024' END,
             NULL, sum(paths), sum(bytes)
      FROM kept_bucket GROUP BY 1 ORDER BY 3 DESC LIMIT ?
    """,
    "exact_dimensions": """
      SELECT width || 'x' || height, NULL, sum(paths), sum(bytes)
      FROM kept_bucket WHERE width IS NOT NULL AND height IS NOT NULL
      GROUP BY 1 ORDER BY 3 DESC LIMIT ?
    """,
    "camera": """
      SELECT CASE camera WHEN 1 THEN 'exif camera' ELSE 'no exif camera' END,
             NULL, sum(paths), sum(bytes)
      FROM kept_bucket GROUP BY 1 ORDER BY 3 DESC LIMIT ?
    """,
    "source_folder": """
      SELECT r.root, NULL, sum(b.paths), sum(b.bytes)
      FROM kept_bucket b JOIN triage_root r ON r.id = b.root_id
      GROUP BY 1 ORDER BY 3 DESC LIMIT ?
    """,
}


def aggregate(
    conn: sqlite3.Connection,
    screen: str,
    rules: list[triage.Rule],
    *,
    limit: int = TOP_N,
    live: bool = False,
) -> list[dict]:
    """The screen's aggregate rows, over what the current rule set still keeps.

    Screen 0 reports the rules themselves and screen 7 has no aggregate -- it is
    the contact sheet of everything still undecided, which is the point of it.

    Screen 1 is the exception to "over what the rules still keep": it serves the
    survey-time rollup, whose `scope` says so, unless `live` is passed. See
    `_AGGREGATES["containers_live"]` for why.
    """
    if screen == "no_image_content":
        summary = triage.counts(conn, rules)
        return [
            {
                "key": triage.describe(rule.predicate),
                "detail": rule.decision,
                "paths": summary["per_rule"][rule.position]["paths"],
                "bytes": summary["per_rule"][rule.position]["bytes"],
                "scope": "this rule's own take",
            }
            for rule in rules
            if rule.decision == "exclude"
        ]
    if screen == "undecided":
        return []
    if screen == "containers" and not live:
        rows = conn.execute(
            "SELECT seg, dirs, paths, bytes FROM triage_segment ORDER BY paths DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [
            {"key": key, "detail": dirs, "paths": paths, "bytes": size, "scope": "whole inventory"}
            for key, dirs, paths, size in rows
        ]

    key = "containers_live" if screen == "containers" else screen
    if key not in _AGGREGATES:
        raise ValueError(f"unknown screen {screen!r}")
    verdict, cte = _kept_bucket_cte(rules)
    sql = verdict.query(cte, tail=_AGGREGATES[key])
    tail_params = [SEGMENT_POOL, limit] if key == "containers_live" else [limit]
    rows = conn.execute(sql, [*verdict.params, *tail_params]).fetchall()
    return [
        {"key": key, "detail": detail, "paths": paths, "bytes": size, "scope": "still kept"}
        for key, detail, paths, size in rows
    ]


def second_level(conn: sqlite3.Connection, rules: list[triage.Rule], root: str) -> list[dict]:
    """Screen 6's drill-down: the directories one level inside one source root.

    `PLAN.md` wants `lumix\\DCIM` accepted wholesale and the backup trees
    scrutinised, which is a decision about the second path component and not
    about the root.
    """
    verdict, cte = _kept_bucket_cte(rules)
    # The component after `G:\photos\<root>\`. Computed from the stored
    # directory rather than re-split per path: 315,680 strings, not 1,374,328.
    tail = """
      SELECT CASE WHEN instr(rest, '\\') = 0 THEN rest
                  ELSE substr(rest, 1, instr(rest, '\\') - 1) END, NULL,
             sum(paths), sum(bytes)
      FROM (
        SELECT substr(d.path_key, length(?) + 2) AS rest, b.paths, b.bytes
        FROM kept_bucket b
        JOIN triage_dir d ON d.id = b.dir_id
        JOIN triage_root r ON r.id = b.root_id
        WHERE r.root = ? AND length(d.path_key) > length(?) + 1
      )
      GROUP BY 1 ORDER BY 3 DESC LIMIT ?
    """
    sql = verdict.query(cte, tail=tail)
    prefix = f"g:\\photos\\{root.lower()}"
    rows = conn.execute(sql, [*verdict.params, prefix, root.lower(), prefix, TOP_N]).fetchall()
    return [
        {"key": key, "detail": detail, "paths": paths, "bytes": size, "scope": "still kept"}
        for key, detail, paths, size in rows
    ]


# --- the contact sheet ------------------------------------------------------------

# `o.decision` rides along because the sheet's per-file toggle has to render
# what it is toggling. Without it the chip would have to guess, and a chip that
# shows "no override" over a file you excluded five minutes ago is worse than no
# chip. It is a LEFT JOIN on a PRIMARY KEY over a table holding tens of rows, so
# it costs nothing measurable next to the path ordering.
_PAGE_TAIL = """
SELECT g.id, g.path, g.sha256, f.width, f.height, f.thumbhash, o.decision
FROM origin g
JOIN triage_path tp ON tp.origin_id = g.id
JOIN kept_bucket k ON k.id = tp.bucket_id
{cv_join}
LEFT JOIN file f ON f.sha256 = g.sha256
LEFT JOIN state.triage_override o ON o.sha256 = g.sha256
WHERE {candidate}{cursor}
ORDER BY g.path, g.id
LIMIT ?
"""


def page(
    conn: sqlite3.Connection,
    rules: list[triage.Rule],
    *,
    candidate: triage.Rule | None = None,
    cursor: tuple[str, int] | None = None,
    limit: int = DEFAULT_LIMIT,
) -> dict:
    """One keyset page of the paths a candidate rule would take.

    With no candidate this is screen 7: everything the current rules leave
    undecided. `next` is set from whether a `limit + 1`-th row existed, not from
    the page happening to be full -- the same honesty `/api/photos` applies, and
    the same reason.
    """
    limit = min(max(int(limit), 1), MAX_LIMIT)
    verdict, cte = _kept_bucket_cte(rules)
    params = list(verdict.params)

    cand_dirs, cand_bucket, cand_params = triage.candidate_relation(candidate)
    if candidate is None:
        predicate_sql = "1"
    else:
        predicate_sql = f"({cand_bucket} OR {cand_dirs.matched})"
        params = [*verdict.params, *cand_dirs.params, *cand_params]

    cursor_sql = ""
    if cursor is not None:
        cursor_sql = " AND (g.path, g.id) > (?, ?)"
        params += [cursor[0], cursor[1]]
    params.append(limit + 1)

    # The candidate's CTE is defined last even though it is joined first: a
    # CTE may be referenced before it is defined, and the parameter order
    # follows the *text*, so putting it here is what keeps the bound values
    # lined up with the placeholders.
    ctes = [*verdict.ctes, cte, *([cand_dirs.cte] if cand_dirs.cte else [])]
    sql = "WITH " + ",\n ".join(ctes) + "\n" + _PAGE_TAIL.format(
        cv_join=cand_dirs.join, candidate=predicate_sql, cursor=cursor_sql
    )
    rows = conn.execute(sql, params).fetchall()

    has_more = len(rows) > limit
    rows = rows[:limit]
    photos = [
        {
            "id": row[0],
            "p": row[1],
            "s": row[2],
            "w": row[3],
            "h": row[4],
            "th": base64.b64encode(row[5]).decode("ascii") if row[5] is not None else None,
            # `include` | `exclude` | null -- the per-file override, which beats
            # every rule. Null is the ordinary case and is not an absence of
            # information: it means the rules decide this one.
            "o": row[6],
        }
        for row in rows
    ]
    following = None
    if has_more and rows:
        following = {"before": rows[-1][1], "before_id": rows[-1][0]}
    return {"photos": photos, "next": following, "limit": limit}
