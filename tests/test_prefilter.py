"""The prefilter: predicate compilation, installing rows, and the tally.

Every test runs against a temporary pair. The corpus is a handful of synthetic
`file`/`origin` rows -- the point is the rule engine's arithmetic and ordering,
not the real catalog's numbers.
"""

from __future__ import annotations

import json

import pytest

from photolib import prefilter

# (sha seed, ext, size, how many origin paths)
CORPUS = (
    ("a", ".svg", 100, 2),
    ("b", ".svg", 200, 1),
    ("c", ".pyc", 300, 3),
    ("d", ".png", 400, 1),
    ("e", ".jpg", 500, 1),
    ("f", ".cur", 600, 1),
)


@pytest.fixture
def corpus(conn):
    """`file` and `origin` rows covering excluded and surviving extensions."""
    for seed, ext, size, paths in CORPUS:
        sha = seed * 64
        conn.execute(
            "INSERT INTO file (sha256, size, ext, state, feature_ver) VALUES (?, ?, ?, ?, ?)",
            (sha, size, ext, "pending", "test"),
        )
        for index in range(paths):
            conn.execute(
                "INSERT INTO origin (path, root, ext, size, sha256, seen_at) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (rf"G:\photos\t\{seed}{index}{ext}", "t", ext, size, sha, "2026-08-02T00:00:00+00:00"),
            )
    return conn


# --- predicates --------------------------------------------------------------


def test_predicate_compiles_to_a_bound_parameter():
    assert prefilter.compile_predicate(prefilter.predicate("ext", "=", ".svg")) == (
        "ext = ?",
        [".svg"],
    )


def test_the_value_never_becomes_syntax():
    """A rule set is human input; the value is a parameter, so it cannot be SQL."""
    sql, params = prefilter.compile_predicate(prefilter.predicate("ext", "=", "' OR 1=1 --"))
    assert sql == "ext = ?" and params == ["' OR 1=1 --"]


@pytest.mark.parametrize(
    "text",
    [
        "not json",
        json.dumps({"column": "ext", "op": "="}),
        json.dumps({"column": "ext", "op": "=", "value": ".svg", "extra": 1}),
        json.dumps({"column": "path", "op": "=", "value": "x"}),
        json.dumps({"column": "ext", "op": "LIKE", "value": ".svg"}),
        json.dumps({"column": "ext", "op": "=", "value": 7}),
    ],
)
def test_bad_predicates_are_refused(text):
    with pytest.raises(ValueError):
        prefilter.compile_predicate(text)


# --- installing --------------------------------------------------------------


def test_install_writes_one_exclude_rule_per_extension(conn):
    assert prefilter.install(conn) == "inserted"
    rows = conn.execute(
        "SELECT seq, predicate, decision, note FROM state.triage_rule ORDER BY seq"
    ).fetchall()
    assert [row[0] for row in rows] == list(range(len(prefilter.EXCLUDED_EXTENSIONS)))
    assert {row[2] for row in rows} == {"exclude"}
    assert [json.loads(row[1])["value"] for row in rows] == list(prefilter.EXCLUDED_EXTENSIONS)


def test_install_is_a_no_op_the_second_time(conn):
    prefilter.install(conn, now="2026-08-02T00:00:00+00:00")
    assert prefilter.install(conn, now="2027-01-01T00:00:00+00:00") == "present"
    stamps = {row[0] for row in conn.execute("SELECT created_at FROM state.triage_rule")}
    assert stamps == {"2026-08-02T00:00:00+00:00"}


def test_install_refuses_to_disturb_rules_it_did_not_write(conn):
    conn.execute(
        "INSERT INTO state.triage_rule (seq, predicate, decision, note, created_at) "
        "VALUES (0, ?, 'include', 'mine', '2026-08-02T00:00:00+00:00')",
        (prefilter.predicate("ext", "=", ".svg"),),
    )
    with pytest.raises(prefilter.PrefilterRefused):
        prefilter.install(conn)
    assert conn.execute("SELECT count(*) FROM state.triage_rule").fetchone() == (1,)


# --- the tally ---------------------------------------------------------------


def test_tally_counts_files_bytes_and_paths_per_rule(corpus):
    prefilter.install(corpus)
    report = {row["predicate"]: row for row in prefilter.tally(corpus)}

    assert (report["ext = '.svg'"]["files"], report["ext = '.svg'"]["bytes"]) == (2, 300)
    assert report["ext = '.svg'"]["paths"] == 3
    assert (report["ext = '.pyc'"]["files"], report["ext = '.pyc'"]["bytes"]) == (1, 300)
    assert report["ext = '.pyc'"]["paths"] == 3
    assert report["ext = '.msg'"]["files"] == 0

    summed = prefilter.totals(prefilter.tally(corpus))
    assert summed["excluded"] == {"files": 4, "bytes": 1200, "paths": 7}
    assert summed["surviving"] == {"files": 2, "bytes": 900, "paths": 2}


def test_the_arguable_formats_survive(corpus):
    prefilter.install(corpus)
    remainder = next(row for row in prefilter.tally(corpus) if row["seq"] is None)
    assert remainder["files"] == 2  # the .png and the .jpg
    assert remainder["decision"] == "include"


def test_an_earlier_include_beats_a_later_exclude(corpus):
    """Ordering is the whole reason these are rows: first match wins."""
    prefilter.install(corpus)
    corpus.execute(
        "UPDATE state.triage_rule SET seq = seq + 1"
    )
    corpus.execute(
        "INSERT INTO state.triage_rule (seq, predicate, decision, note, created_at) "
        "VALUES (0, ?, 'include', 'keep the SVGs after all', '2026-08-02T00:00:00+00:00')",
        (prefilter.predicate("ext", "=", ".svg"),),
    )
    summed = prefilter.totals(prefilter.tally(corpus))
    assert summed["excluded"] == {"files": 2, "bytes": 900, "paths": 4}  # .pyc and .cur only
    assert summed["surviving"]["files"] == 4


def test_deleting_a_rule_reverses_it(corpus):
    """The property the whole step exists for."""
    prefilter.install(corpus)
    before = prefilter.totals(prefilter.tally(corpus))["surviving"]["files"]
    corpus.execute(
        "DELETE FROM state.triage_rule WHERE predicate = ?",
        (prefilter.predicate("ext", "=", ".svg"),),
    )
    assert prefilter.totals(prefilter.tally(corpus))["surviving"]["files"] == before + 2


def test_no_rules_means_nothing_is_excluded(corpus):
    summed = prefilter.totals(prefilter.tally(corpus))
    assert summed["excluded"] == {"files": 0, "bytes": 0, "paths": 0}
    assert summed["surviving"]["files"] == len(CORPUS)


def test_the_catalog_is_left_alone(corpus):
    """Metadata only: no `file.state` moves to 'excluded', no `photo` row changes."""
    prefilter.install(corpus)
    prefilter.tally(corpus)
    assert corpus.execute("SELECT count(*) FROM file WHERE state = 'excluded'").fetchone() == (0,)
    assert corpus.execute("SELECT count(*) FROM photo").fetchone() == (0,)
