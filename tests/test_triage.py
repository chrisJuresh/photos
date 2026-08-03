"""The triage rule engine: predicates, ordering, overrides, screens and paging.

Everything runs against a temporary database pair and a synthetic survey; the
write endpoints are in `test_triage_api`. Most of the file uses an eight-path
corpus, because ordering and precedence are arithmetic and a large corpus would
only hide which row moved.

The exception is the latency section, which builds the real thing: 1,374,328
paths over 315,680 directories, collapsing to a counting surface of the right
size. That fixture costs ~50 s and is module-scoped so it is paid once. It is
the only place the claim this design exists to make is actually checked, so it
runs by default rather than behind a marker.
"""

from __future__ import annotations

import json
import sqlite3
import time

import pytest

from photolib import db, triage, triage_screens, triage_survey

# (path, ext, size, sha seed, kind, width, height, camera)
CORPUS = (
    (r"G:\photos\lumix\DCIM\100_PANA\P1080096.JPG", ".jpg", 5_000_000, "a", "image", 4592, 3448, 1),
    (r"G:\photos\lumix\DCIM\100_PANA\P1080096.RW2", ".rw2", 20_000_000, "b", "raw_image", 4592, 3448, 1),
    (r"G:\photos\backup\rcr\node_modules\x\logo.png", ".png", 400, "c", None, None, None, 0),
    (r"G:\photos\backup\rcr\node_modules\y\icon.png", ".png", 300, "d", None, None, None, 0),
    (r"G:\photos\backup\rcr\node_modules\keep\hero.png", ".png", 900_000, "e", "image", 1920, 1080, 0),
    (r"G:\photos\backup\rcr\src\banner.svg", ".svg", 100, "f", None, None, None, 0),
    (r"G:\photos\backup\photos\holiday\beach.jpg", ".jpg", 3_000_000, "g", "image", 3024, 4032, 1),
    (r"G:\photos\backup\photos\holiday\thumb.png", ".png", 2_000, "h", "image", 128, 96, 0),
)


def load(conn: sqlite3.Connection, corpus=CORPUS) -> None:
    """Write `origin` and `file` rows, then build the survey over them."""
    for index, (path, ext, size, seed, kind, width, height, camera) in enumerate(corpus):
        sha = seed * 64
        conn.execute(
            "INSERT OR IGNORE INTO file "
            "(sha256, size, ext, kind, width, height, camera, state, feature_ver) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'test')",
            (sha, size, ext, kind, width, height, "DC-G9" if camera else None),
        )
        conn.execute(
            "INSERT INTO origin (path, root, ext, size, sha256, seen_at) VALUES (?, ?, ?, ?, ?, ?)",
            (path, path.split("\\")[2], ext, size, sha, "2026-08-03T00:00:00+00:00"),
        )
    triage_survey.build(conn)


@pytest.fixture
def survey(conn):
    load(conn)
    return conn


def rule(column, op, value, decision="exclude", position=0) -> triage.Rule:
    return triage.Rule(position, triage.predicate(column, op, value), decision)


def save(conn, *rules_in, note="test") -> None:
    """Store rules in the given order, `seq` dense so position equals `seq`."""
    conn.executemany(
        "INSERT INTO state.triage_rule (seq, predicate, decision, note, created_at) "
        "VALUES (?, ?, ?, ?, '2026-08-03T00:00:00+00:00')",
        [(seq, r.predicate, r.decision, note) for seq, r in enumerate(rules_in)],
    )


# --- predicates --------------------------------------------------------------------


def test_the_value_never_becomes_syntax():
    compiled = triage.compile_predicate(triage.predicate("ext", "=", "' OR 1=1 --"))
    assert compiled.params == ["' or 1=1 --"] and "OR 1=1" not in compiled.sql


def test_no_predicate_compiles_to_a_like():
    """A LIKE pattern is an escapable mini-language inside the value."""
    for column, op, value in (
        ("dir_segment", "=", "node_modules"),
        ("dir_under", "=", r"G:\photos\backup"),
        ("ext", "=", ".png"),
        ("ext", "in", [".png", ".gif"]),
        ("long_edge", "<=", 512),
        ("kind", "is null", None),
    ):
        assert "LIKE" not in triage.compile_predicate(triage.predicate(column, op, value)).sql


@pytest.mark.parametrize(
    "text",
    [
        "not json",
        json.dumps({"column": "ext", "op": "="}),
        json.dumps({"column": "ext", "op": "=", "value": ".svg", "extra": 1}),
        json.dumps({"column": "path", "op": "=", "value": "x"}),
        json.dumps({"column": "ext", "op": "LIKE", "value": ".svg"}),
        json.dumps({"column": "long_edge", "op": "<=", "value": "512"}),
        json.dumps({"column": "long_edge", "op": "<=", "value": True}),
        json.dumps({"column": "dir_segment", "op": "=", "value": r"a\b"}),
        json.dumps({"column": "ext", "op": "in", "value": []}),
        json.dumps({"column": "ext", "op": "in", "value": ["a"] * 300}),
    ],
)
def test_bad_predicates_are_refused(text):
    with pytest.raises(triage.PredicateError):
        triage.compile_predicate(text)


def test_the_prefilters_stored_predicates_still_compile(conn):
    """Migration-free compatibility: Phase 1's nine rows are valid triage rules."""
    from photolib import prefilter

    prefilter.install(conn)
    assert [r.decision for r in triage.load_rules(conn)] == ["exclude"] * 9


# --- ordering -----------------------------------------------------------------------


def test_first_match_wins(survey):
    """An earlier include beats a later exclude on the same rows."""
    save(survey, rule("ext", "=", ".png", "include"), rule("ext", "=", ".png", "exclude"))
    assert triage.counts(survey)["excluded_paths"] == 0

    survey.execute("DELETE FROM state.triage_rule")
    save(survey, rule("ext", "=", ".png", "exclude"), rule("ext", "=", ".png", "include"))
    assert triage.counts(survey)["excluded_paths"] == 4


def test_ordering_across_the_two_predicate_kinds(survey):
    """A directory rule and a bucket rule compete by position, not by kind.

    They compile to different things -- an index seek and a CASE branch -- so
    "first match wins" has to hold across that seam or the order is a lie.
    """
    save(survey, rule("ext", "=", ".png", "include"), rule("dir_segment", "=", "node_modules"))
    kept_png_first = triage.counts(survey)["excluded_paths"]

    survey.execute("DELETE FROM state.triage_rule")
    save(survey, rule("dir_segment", "=", "node_modules"), rule("ext", "=", ".png", "include"))
    excluded_dir_first = triage.counts(survey)["excluded_paths"]

    # png first: only the non-png under node_modules would go, and there is none.
    assert kept_png_first == 0
    # node_modules first: all three of its files go, png or not.
    assert excluded_dir_first == 3


def test_exclude_a_tree_then_re_include_a_subtree(survey):
    """The `PLAN.md` sentence this whole model exists for.

    "exclude everything under node_modules, except this one folder" -- which is
    only expressible because the include sits *above* the exclude.
    """
    save(
        survey,
        rule("dir_under", "=", r"G:\photos\backup\rcr\node_modules\keep", "include"),
        rule("dir_segment", "=", "node_modules", "exclude"),
    )
    summary = triage.counts(survey)
    assert summary["excluded_paths"] == 2  # logo.png and icon.png
    assert summary["kept_paths"] == 6  # hero.png survives with the rest

    kept = {row["p"] for row in triage_screens.page(survey, triage.load_rules(survey))["photos"]}
    assert r"G:\photos\backup\rcr\node_modules\keep\hero.png" in kept
    assert r"G:\photos\backup\rcr\node_modules\x\logo.png" not in kept


def test_a_subtree_rule_below_the_tree_rule_does_nothing(survey):
    """The same two rules the other way round: the tree wins, as ordered."""
    save(
        survey,
        rule("dir_segment", "=", "node_modules", "exclude"),
        rule("dir_under", "=", r"G:\photos\backup\rcr\node_modules\keep", "include"),
    )
    assert triage.counts(survey)["excluded_paths"] == 3


def test_a_segment_is_a_whole_directory_name(conn):
    """`dist` must not take `redistributable`, which a substring match would."""
    load(
        conn,
        (
            (r"G:\photos\t\dist\a.png", ".png", 1, "a", None, None, None, 0),
            (r"G:\photos\t\redistributable\b.png", ".png", 1, "b", None, None, None, 0),
        ),
    )
    save(conn, rule("dir_segment", "=", "dist"))
    assert triage.counts(conn)["excluded_paths"] == 1


def test_deleting_a_rule_reverses_it(survey):
    save(survey, rule("dir_segment", "=", "node_modules"))
    assert triage.counts(survey)["excluded_paths"] == 3
    survey.execute("DELETE FROM state.triage_rule")
    assert triage.counts(survey)["excluded_paths"] == 0


# --- overrides ----------------------------------------------------------------------


def test_an_override_beats_every_rule(survey):
    save(survey, rule("dir_segment", "=", "node_modules"))
    assert triage.counts(survey)["excluded_paths"] == 3

    survey.execute(
        "INSERT INTO state.triage_override VALUES (?, 'include', '2026-08-03T00:00:00+00:00')",
        ("c" * 64,),
    )
    summary = triage.counts(survey)
    assert summary["excluded_paths"] == 2 and summary["kept_paths"] == 6


def test_an_override_can_exclude_what_no_rule_touches(survey):
    survey.execute(
        "INSERT INTO state.triage_override VALUES (?, 'exclude', '2026-08-03T00:00:00+00:00')",
        ("a" * 64,),
    )
    summary = triage.counts(survey)
    assert summary["excluded_paths"] == 1
    assert summary["excluded_bytes"] == 5_000_000


def test_an_override_agreeing_with_the_rules_changes_nothing(survey):
    """The correction is a delta, so an override that confirms must be a no-op."""
    save(survey, rule("dir_segment", "=", "node_modules"))
    before = triage.counts(survey)
    survey.execute(
        "INSERT INTO state.triage_override VALUES (?, 'exclude', '2026-08-03T00:00:00+00:00')",
        ("c" * 64,),
    )
    assert triage.counts(survey) == before


def test_overrides_reach_the_file_level_fold_too(survey):
    survey.execute(
        "INSERT INTO state.triage_override VALUES (?, 'exclude', '2026-08-03T00:00:00+00:00')",
        ("a" * 64,),
    )
    assert triage.file_counts(survey)["excluded_files"] == 1


# --- the candidate ------------------------------------------------------------------


def test_a_candidate_changes_nothing_that_is_saved(survey):
    save(survey, rule("ext", "=", ".svg"))
    summary = triage.counts(survey, candidate=rule("dir_segment", "=", "node_modules"))
    assert summary["excluded_paths"] == 1
    assert summary["candidate_excluded_paths"] == 4
    assert survey.execute("SELECT count(*) FROM state.triage_rule").fetchone() == (1,)


def test_a_candidate_inserted_above_an_include_overrides_it(survey):
    """Position is what the candidate's numbers depend on, not just its predicate."""
    save(survey, rule("ext", "=", ".png", "include"))
    candidate = rule("dir_segment", "=", "node_modules")
    assert triage.counts(survey, candidate=candidate, at=1)["candidate_excluded_paths"] == 0
    assert triage.counts(survey, candidate=candidate, at=0)["candidate_excluded_paths"] == 3


def test_the_per_rule_breakdown_sums_to_the_corpus(survey):
    save(survey, rule("ext", "=", ".png"), rule("dir_segment", "=", "node_modules"))
    summary = triage.counts(survey)
    assert sum(row["paths"] for row in summary["per_rule"]) == 8
    assert summary["per_rule"][0]["paths"] == 4  # every png, wherever it is
    # Nothing: the three files under node_modules are all .png, so rule 0 took
    # them first. A rule's own count is what the order actually leaves it.
    assert summary["per_rule"][1]["paths"] == 0
    assert summary["per_rule"][2]["paths"] == 4  # matched by neither


# --- the file-level fold ------------------------------------------------------------


def test_a_file_is_kept_if_any_of_its_paths_is_kept(conn):
    """Identical bytes in two trees: excluding one copy must not lose the file."""
    load(
        conn,
        (
            (r"G:\photos\t\node_modules\a.png", ".png", 500, "a", "image", 100, 100, 0),
            (r"G:\photos\t\keep\a.png", ".png", 500, "a", "image", 100, 100, 0),
        ),
    )
    save(conn, rule("dir_segment", "=", "node_modules"))
    assert triage.counts(conn)["excluded_paths"] == 1
    assert triage.file_counts(conn) == {
        "kept_files": 1,
        "kept_bytes": 500,
        "excluded_files": 0,
        "excluded_bytes": 0,
    }


# --- the screens ----------------------------------------------------------------------


def test_every_screen_answers(survey):
    save(survey, rule("ext", "=", ".svg"))
    rules = triage.load_rules(survey)
    for screen in triage_screens.SCREENS:
        triage_screens.aggregate(survey, screen, rules)
    assert triage_screens.aggregate(survey, "file_type", rules)[0]["key"] in {".png", ".jpg", ".rw2"}


def test_an_aggregate_only_counts_what_is_still_kept(survey):
    """Screen 2 must not offer extensions screen 1 already removed."""
    save(survey, rule("dir_segment", "=", "node_modules"))
    rows = {r["key"]: r["paths"] for r in triage_screens.aggregate(survey, "file_type", triage.load_rules(survey))}
    assert rows[".png"] == 1  # only holiday\thumb.png survives


def test_the_dimension_bands_place_the_unmeasured_under_unknown(survey):
    rows = {r["key"]: r["paths"] for r in triage_screens.aggregate(survey, "dimensions", [])}
    assert rows["unknown"] == 3
    assert rows[">1024"] == 4
    assert rows["<=256"] == 1


def test_source_folder_drills_into_the_second_level(survey):
    rows = {r["key"]: r["paths"] for r in triage_screens.second_level(survey, [], "backup")}
    assert rows == {"rcr": 4, "photos": 2}


# --- paging -------------------------------------------------------------------------


def test_a_page_walks_the_whole_remainder_once(survey):
    """Same contract as /api/photos: `(key, id)` cursor, `next` from a peeked row."""
    seen, cursor, pages = [], None, 0
    while True:
        payload = triage_screens.page(survey, [], cursor=cursor, limit=3)
        seen.extend(row["p"] for row in payload["photos"])
        pages += 1
        if payload["next"] is None:
            break
        cursor = (payload["next"]["before"], payload["next"]["before_id"])
    assert pages == 3
    assert len(seen) == len(set(seen)) == 8
    assert seen == sorted(seen)


def test_a_page_is_scoped_to_the_candidate(survey):
    payload = triage_screens.page(survey, [], candidate=rule("dir_segment", "=", "node_modules"))
    assert len(payload["photos"]) == 3
    assert all("node_modules" in row["p"] for row in payload["photos"])


def test_a_page_never_shows_what_the_rules_already_excluded(survey):
    save(survey, rule("dir_segment", "=", "node_modules"))
    payload = triage_screens.page(survey, triage.load_rules(survey))
    assert all("node_modules" not in row["p"] for row in payload["photos"])


# --- latency ---------------------------------------------------------------------------

# The real corpus: `origin` holds 1,374,328 rows over 315,680 distinct
# directories, and the survey collapses them to ~448,000 buckets.
CORPUS_PATHS = 1_374_328
CORPUS_DIRS = 315_680

# Generous against the ~220-300 ms this measures on the real catalog, because
# what it is guarding is the regression that would put the naive shape back:
# LIKE over the paths was 2.9 s, and eight sums over one CASE was 1.2 s.
RECOMPUTE_BUDGET_S = 1.0

CONTAINERS = ("node_modules", ".git", "site-packages", ".venv", ".cache", "appdata", "vendor")
EXTENSIONS = (".js", ".png", ".jpg", ".json", ".py", ".svg", ".ts", "", ".rw2", ".log")


def _full_size_rows():
    """1,374,328 synthetic paths with the real corpus's directory cardinality.

    The shape that matters is not the row count on its own -- it is 1.38M paths
    over ~316k directories with container names buried at varying depth, because
    that is what decides how much work a directory predicate does.
    """
    # 1,374,328 over 315,680 is 4.35 files per directory, so most get four and
    # the remainder get a fifth. Truncating instead would leave a fifth of the
    # directories unwritten and quietly measure the wrong cardinality.
    base, extra = divmod(CORPUS_PATHS, CORPUS_DIRS)
    for index in range(CORPUS_DIRS):
        container = CONTAINERS[index % len(CONTAINERS)]
        directory = rf"G:\photos\root{index % 9}\p{index}\{container}\d{index}"
        for slot in range(base + (1 if index < extra else 0)):
            # A directory is mostly one file type, occasionally two. That is
            # what produces the real corpus's ~3.1 paths per bucket; one
            # extension per file would make the counting surface as big as the
            # path list and measure nothing.
            offset = index + (1 if slot == 0 and index % 3 == 0 else 0)
            ext = EXTENSIONS[offset % len(EXTENSIONS)]
            # ~800,000 distinct hashes over 1.38M paths, close to the real
            # corpus's 787,798, so the file-level fold has duplicates to fold.
            sha = f"{(index * 5 + slot) % 800_000:064x}"
            yield (
                rf"{directory}\f{slot}{ext}",
                f"root{index % 9}",
                ext,
                1000 + slot,
                sha,
                "2026-08-03T00:00:00+00:00",
            )


@pytest.fixture(scope="module")
def full_size(tmp_path_factory):
    """A 1.38M-path catalog, built once for the whole module.

    Module-scoped because building it is ~40 s and every latency assertion
    wants the same corpus. Nothing in it is written to, so sharing is safe.
    """
    from photolib import migrate

    base = tmp_path_factory.mktemp("full")
    catalog, state = base / "catalog.sqlite3", base / "state.sqlite3"
    migrate.apply(catalog, state)
    conn = db.connect(catalog, state)
    rows = list(_full_size_rows())
    conn.execute("BEGIN")
    conn.executemany(
        "INSERT OR IGNORE INTO file (sha256, size, ext, state, feature_ver) "
        "VALUES (?, 1000, ?, 'pending', 'test')",
        {(row[4], row[2]) for row in rows},
    )
    conn.executemany(
        "INSERT INTO origin (path, root, ext, size, sha256, seen_at) VALUES (?, ?, ?, ?, ?, ?)",
        rows,
    )
    conn.execute("COMMIT")
    triage_survey.build(conn)
    yield conn
    conn.close()


def test_the_corpus_is_the_size_the_claim_is_about(full_size):
    assert full_size.execute("SELECT count(*) FROM origin").fetchone()[0] == CORPUS_PATHS
    assert full_size.execute("SELECT count(*) FROM triage_dir").fetchone()[0] == CORPUS_DIRS
    buckets = full_size.execute("SELECT count(*) FROM triage_bucket").fetchone()[0]
    assert buckets < CORPUS_PATHS / 2, "the counting surface stopped collapsing"


@pytest.mark.parametrize(
    "candidate",
    [
        None,
        ("dir_segment", "=", "node_modules"),
        ("dir_under", "=", r"G:\photos\root3\p12"),
        ("ext", "=", ".png"),
        ("long_edge", "<=", 512),
    ],
)
def test_a_recompute_keeps_up_with_typing_over_1_38m_rows(full_size, candidate):
    """The whole reason the survey exists, asserted rather than asserted about."""
    save(
        full_size,
        *[rule("ext", "=", ext) for ext in (".svg", ".ts", ".pyc")],
        rule("dir_segment", "=", ".cache"),
    )
    try:
        rules = triage.load_rules(full_size)
        candidate_rule = rule(*candidate) if candidate else None
        triage.counts(full_size, rules, candidate=candidate_rule)  # warm the page cache

        started = time.perf_counter()
        summary = triage.counts(full_size, rules, candidate=candidate_rule)
        elapsed = time.perf_counter() - started
    finally:
        full_size.execute("DELETE FROM state.triage_rule")

    assert summary["kept_paths"] + summary["excluded_paths"] == CORPUS_PATHS
    assert elapsed < RECOMPUTE_BUDGET_S, f"recompute took {elapsed * 1000:.0f} ms"


def test_a_contact_sheet_page_is_not_proportional_to_the_corpus(full_size):
    """500 rows out of 1.38M, keyset-paged, so the page is the cost."""
    started = time.perf_counter()
    payload = triage_screens.page(full_size, [], limit=500)
    elapsed = time.perf_counter() - started
    assert len(payload["photos"]) == 500
    assert elapsed < RECOMPUTE_BUDGET_S, f"first page took {elapsed * 1000:.0f} ms"
