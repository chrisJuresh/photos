"""The survey queries behind `PLAN.md`'s eight triage screens, and the directory
tree added alongside them.

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


def _kept_bucket_cte(
    rules: list[triage.Rule], restrict: str | None = None
) -> tuple[triage.Verdict, str]:
    """`kept_bucket(id, dir_id, ...)`: the buckets the current rules still keep.

    Every screen aggregates over this rather than over `triage_bucket`, so the
    numbers on screen N are always "of what is left", which is what makes the
    review order collapse the working set.

    `restrict` is passed straight to `triage.verdict_expression`: a caller that
    has already bounded itself to a set of directories says so, and the verdict's
    directory relation is built for those alone.
    """
    verdict = triage.verdict_expression(rules, restrict=restrict)
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


# --- the directory tree ------------------------------------------------------------

# One node's children. `rest` is the part of a directory below the node, so ''
# is the node itself -- the files sitting directly in it -- and everything else
# groups under its first component.
#
# `deeper` is `max(rest holds a separator)`: whether this child has directories
# of its own that still hold something. It is what decides whether a row gets an
# expander, and it is computed here because the alternative is a request per row
# that mostly answers "nothing".
#
# The join is to `kept_bucket`, so a subtree the rules have already taken has no
# rows and does not appear. That is the screen's whole premise: what is left.
_TREE_TAIL = r"""
SELECT CASE WHEN instr(n.rest, '\') = 0 THEN n.rest
            ELSE substr(n.rest, 1, instr(n.rest, '\') - 1) END AS name,
       max(instr(n.rest, '\') > 0), sum(k.paths), sum(k.bytes)
FROM node n JOIN kept_bucket k ON k.dir_id = n.dir_id
GROUP BY 1 ORDER BY name = '' DESC, 3 DESC LIMIT ?
"""

# Both halves of the node's own subtree, and the offset that turns a directory
# into its path below the node. `path_key` is lowercased, so the names this
# yields are lowercased too -- which is the same text a `dir_under` rule stores,
# so the path a row hands back is usable as a predicate value unchanged.
#
# MATERIALIZED because in the restricted plan this relation is read once per
# directory rule -- 187 of them in the live rule set -- and re-running the range
# scan that many times is the one thing that would give the restriction back.
_NODE_CTE = """node(dir_id, rest) AS MATERIALIZED (
   SELECT id, substr(path_key, ?) FROM triage_dir
   WHERE path_key = ? OR (path_key >= ? AND path_key < ?)
 )"""

_NODE_DIRS = (
    "SELECT count(*) FROM triage_dir WHERE path_key = ? OR (path_key >= ? AND path_key < ?)"
)

# Above this many directories in the subtree, bounding the verdict's directory
# relation to the node costs more than building it whole. Measured on the live
# 372-rule set, restricted against unrestricted, for the same node:
#
#        53 dirs      22 ms      1,080 ms
#       507 dirs      67 ms        906 ms
#     2,005 dirs     308 ms      1,253 ms
#     4,038 dirs     783 ms      1,185 ms   <- still ahead
#     6,204 dirs   1,315 ms      1,183 ms   <- behind
#    58,443 dirs  13,596 ms      1,427 ms
#
# The unrestricted side is flat because it is the whole vocabulary every time;
# the restricted side is linear in the subtree. They cross at ~5,000. Deciding
# between them costs one indexed count: 0 ms at a leaf, 131 ms at the root.
RESTRICT_MAX_DIRS = 5000


def tree(conn: sqlite3.Connection, rules: list[triage.Rule], path: str) -> dict:
    """One directory node's still-kept children, for the tree screen.

    Lazy by node rather than a whole tree in one response: there are 315,680
    directories, and the client only ever looks at the handful it has opened.

    Cost tracks the subtree rather than the corpus -- `node` is a range scan of
    the `path_key` index and reaches `triage_bucket` through `triage_bucket_dir`
    -- with the root as the honest worst case, where the subtree *is* the corpus.

    Ordinary nodes are fast only because the verdict's directory relation is
    bounded to `node` too. Without that every node paid the ~1 s of building it
    over the whole vocabulary, and a directory holding 72 paths measured 1,358 ms
    -- expanding five rows cost seven seconds. With it, and only below
    `RESTRICT_MAX_DIRS`, measured over the live 372-rule set: **23-54 ms** for an
    ordinary node, whatever its depth or path count.

    What stays slow is the handful of nodes that hold most of the 315,680
    directories -- the root at ~3.3 s, `home-chris arch backup` at ~2.8 s, `10tb
    arch backup` at ~1.7 s -- and there is nothing to bound there, because the
    subtree really is most of the corpus. That band is the same one every other
    screen sits in at this rule set (`counts` 2.3 s, screen 2's aggregate 2.8 s),
    so it is the engine's cost and not the tree's. The root is also the one node
    the client loads without being asked, so it is paid once per visit.
    """
    stem = triage.dir_stem(path)
    subtree = triage.subtree_range(stem)
    # One indexed count, then the cheaper of the two plans. See RESTRICT_MAX_DIRS.
    node_dirs = conn.execute(_NODE_DIRS, subtree).fetchone()[0]
    restrict = "node" if node_dirs < RESTRICT_MAX_DIRS else None
    verdict, kept = _kept_bucket_cte(rules, restrict)
    sql = verdict.query(kept, _NODE_CTE, tail=_TREE_TAIL)
    # `node` is written last, so its parameters bind after both of the verdict's
    # groups; see `Verdict.params` for when that ordering is not free.
    #
    # TOP_N + 2 rows, because the node's own '' group is sorted to the front and
    # so occupies one of them: that leaves TOP_N + 1 children, which is what
    # makes "there were more" an observation rather than an inference from a
    # full page.
    rows = conn.execute(sql, [*verdict.params, len(stem) + 2, *subtree, TOP_N + 2]).fetchall()

    here = {"paths": 0, "bytes": 0}
    children = []
    for name, deeper, paths, size in rows:
        if name == "":
            here = {"paths": paths, "bytes": size}
            continue
        children.append(
            {
                "name": name,
                "path": f"{stem}\\{name}",
                "paths": paths,
                "bytes": size,
                "deeper": bool(deeper),
            }
        )
    # A node with more children than the client will read still reports how many
    # it got, rather than presenting a truncated list as the whole of it.
    truncated = len(children) > TOP_N
    return {"path": stem, "here": here, "children": children[:TOP_N], "truncated": truncated}


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
