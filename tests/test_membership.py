"""Tests for the assignment: which stack each tile is placed in, and when.

Every test runs against a temporary catalog+state pair and Matches it writes
itself, so nothing here decodes a frame, opens a substrate or loads OpenCV -- what
is under test is what a known set of Matches becomes, which is the reading and not
the geometry. `tests/test_matches.py` is where the number itself is asserted over
pictures. Nothing here opens a path from config.toml.

The rule the pass walks with is the one `harness.calibrate` replayed the reader's
labels against, which is asserted rather than assumed: `test_the_rule_is_the_one_
the_labels_were_replayed_against`.
"""

from __future__ import annotations

import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

import pytest

from harness import label
from photolib import browse, candidates, fingerprints, matches, membership
from photolib.config import Config
from photolib.membership import (
    MembershipRefused,
    Setting,
    Work,
    link,
    place,
    place_all,
    placed,
    worklist,
)

BASE = datetime(2021, 6, 1, 12, 0, 0)
SETTING = Setting(strictness=20, linkage="majority")
HIGH = 100  # a Match well above any strictness in these tests
LOW = 3  # checked, and agreed on almost nothing


def sha_of(seed: str) -> str:
    """A 64-hex string that reads as a hash without being one."""
    return (seed * 64)[:64]


class Stacks:
    """A catalog of tiles in time, with the Matches between them written by hand.

    A Match is stated here rather than derived from a frame: these tests are about
    what the counts become and never about what a photograph scores. No fingerprint
    either -- this pass reads neither.
    """

    def __init__(self, conn: sqlite3.Connection) -> None:
        self.conn = conn
        self.next_id = 0

    def add(
        self,
        seed: str,
        second: int,
        *,
        camera: str | None = "Lumix",
        kind: str | None = "image",
        taken_src: str = "exif:DateTimeOriginal",
    ) -> str:
        """One tile, `second` seconds after the corpus's base capture time."""
        sha256 = sha_of(seed)
        self.conn.execute(
            "INSERT INTO file (sha256, size, ext, kind, state, feature_ver, camera, taken_src)"
            " VALUES (?, 1, '.jpg', ?, 'published', '{}', ?, ?)",
            (sha256, kind, camera, taken_src),
        )
        self.next_id += 1
        self.conn.execute(
            "INSERT INTO photo (id, rep_sha256, sort_key) VALUES (?, ?, ?)",
            (self.next_id, sha256, (BASE + timedelta(seconds=second)).isoformat()),
        )
        self.conn.commit()
        return sha256

    def matched(self, early: str, late: str, points: int) -> None:
        """One Match, in the order the enumeration stores a pair."""
        self.conn.execute(
            "INSERT OR REPLACE INTO pair_match (method, version, sha_early, sha_late, points)"
            " VALUES (?, ?, ?, ?, ?)",
            (matches.METHOD, matches.VERSION, early, late, points),
        )
        self.conn.commit()

    def candidate(self, early: str, late: str, verdict: str = "survivor") -> None:
        """One screened candidate, for the pairs a Match row is missing from."""
        self.conn.execute(
            "INSERT OR REPLACE INTO candidate_pair"
            " (model, version, sha_early, sha_late, screen, verdict) VALUES (?, ?, ?, ?, 1.0, ?)",
            (fingerprints.MODEL, fingerprints.VERSION, early, late, verdict),
        )
        self.conn.commit()

    def plan(self, setting: Setting = SETTING) -> tuple[Work, dict, set[str]]:
        return worklist(self.conn, setting)

    def work(self, setting: Setting = SETTING) -> Work:
        return self.plan(setting)[0]

    def run(self, setting: Setting = SETTING, *, limit: int | None = None) -> dict:
        work, points, videos = self.plan(setting)
        todo = work.todo if limit is None else work.todo[:limit]
        return place_all(self.conn, todo, videos, points, setting)

    def rows(self) -> list[tuple[str, str]]:
        return self.conn.execute(
            "SELECT sha256, stack FROM stack_member ORDER BY sha256"
        ).fetchall()

    def stacks(self) -> list[set[str]]:
        """The assignment as sets of frames, biggest first: what a reader would see."""
        grouped: dict[str, set[str]] = {}
        for sha256, stack in self.rows():
            grouped.setdefault(stack, set()).add(sha256)
        return sorted(grouped.values(), key=len, reverse=True)


@pytest.fixture
def corpus(conn) -> Stacks:
    return Stacks(conn)


def burst(corpus: Stacks, seeds: str, *, apart: int = 2) -> list[str]:
    """Frames `apart` seconds apart, which the 3600s fence makes one run."""
    return [corpus.add(seed, index * apart) for index, seed in enumerate(seeds)]


# --- what a known set of Matches becomes --------------------------------------


def test_frames_that_agree_are_one_stack(corpus: Stacks) -> None:
    a, b, c = burst(corpus, "123")
    for early, late in ((a, b), (b, c), (a, c)):
        corpus.matched(early, late, HIGH)
    corpus.run()

    assert corpus.stacks() == [{a, b, c}]


def test_a_frame_that_agrees_with_nothing_is_a_stack_of_one(corpus: Stacks) -> None:
    """The assignment is total: every EXIF-dated tile gets a stack, and a frame the
    geometry cannot place with anything is the only member of its own."""
    a, b = burst(corpus, "12")
    corpus.matched(a, b, LOW)
    corpus.run()

    assert corpus.stacks() == [{a}, {b}]
    assert {sha256 for sha256, _ in corpus.rows()} == {a, b}


def test_a_frame_that_shot_alone_still_gets_a_stack(corpus: Stacks) -> None:
    """`candidates.runs` drops a run of one because it holds no pair; this pass keeps
    it, because a tile with no row would have no stack to be drawn in."""
    alone = corpus.add("1", 0)
    far = corpus.add("2", 7200)
    corpus.run()

    assert corpus.rows() == sorted([(alone, alone), (far, far)])


def test_the_stack_is_named_by_its_earliest_member(corpus: Stacks) -> None:
    """Content-addressed and not numbered, and the earliest frame rather than the
    cover: the cover is the sharpest of the middle-exposure third and is resolved per
    query, so a stored id would be a second answer to a question already answered."""
    early = corpus.add("f", 0)
    late = corpus.add("0", 2)
    corpus.matched(early, late, HIGH)
    corpus.run()

    assert late < early  # the earliest capture, not the lowest sha256
    assert {stack for _, stack in corpus.rows()} == {early}


def test_a_run_becomes_two_stacks_where_the_agreement_stops(corpus: Stacks) -> None:
    """One run, two stacks: the fence admits the pair and the Match declines it, which
    is ADR 0003's whole point -- capture time is necessary and never sufficient."""
    a, b, c, d = burst(corpus, "1234")
    corpus.matched(a, b, HIGH)
    corpus.matched(c, d, HIGH)
    for early, late in ((a, c), (a, d), (b, c), (b, d)):
        corpus.matched(early, late, LOW)
    corpus.run()

    assert corpus.stacks() == [{a, b}, {c, d}]


def test_the_linkage_decides_and_the_setting_records_which_one(corpus: Stacks) -> None:
    """The same Matches under two rules, and both readings are kept: a frame agreeing
    with one of two members joins under the chain and not under "matches most
    members", so the two settings are two populations rather than one overwritten.
    """
    a, b, c = burst(corpus, "123")
    corpus.matched(a, b, HIGH)
    corpus.matched(b, c, HIGH)
    corpus.matched(a, c, LOW)
    corpus.run(SETTING)
    corpus.run(Setting(strictness=20, linkage="neighbour"))

    by_linkage = dict(
        corpus.conn.execute(
            "SELECT linkage, count(DISTINCT stack) FROM stack_member GROUP BY linkage"
        )
    )
    assert by_linkage == {"majority": 2, "neighbour": 1}


def test_the_strictness_decides_and_is_recorded_with_the_assignment(corpus: Stacks) -> None:
    a, b = burst(corpus, "12")
    corpus.matched(a, b, 25)
    corpus.run(Setting(strictness=20, linkage="majority"))
    corpus.run(Setting(strictness=40, linkage="majority"))

    assert dict(
        corpus.conn.execute(
            "SELECT strictness, count(DISTINCT stack) FROM stack_member GROUP BY strictness"
        )
    ) == {20: 1, 40: 2}


def test_the_window_the_walk_was_fenced_by_rides_with_every_row(corpus: Stacks) -> None:
    """Not a knob and stored anyway: it is the fence the Match rows were computed
    behind, so a build-time commitment that moved would be visible here."""
    burst(corpus, "12")
    corpus.run()

    assert {row[0] for row in corpus.conn.execute("SELECT ceiling FROM stack_member")} == {
        candidates.CEILING
    }


def test_a_pair_beyond_the_window_is_not_stacked_however_well_it_matches(
    corpus: Stacks,
) -> None:
    """The fence is necessary: two frames a day apart that are plainly the same
    photograph are two stacks, which is what stops a coincidence joining them."""
    a = corpus.add("1", 0)
    b = corpus.add("2", candidates.CEILING + 1)
    corpus.matched(a, b, HIGH)
    corpus.run()

    assert corpus.stacks() == [{a}, {b}]


# --- who is not a candidate ---------------------------------------------------


def test_a_tile_the_filesystem_dated_is_in_no_stack_at_all(corpus: Stacks) -> None:
    """A copy date is not when the photograph was taken, so it can be nobody's
    neighbour -- and it gets no row rather than a stack of its own."""
    a, b = burst(corpus, "12")
    copied = corpus.add("3", 1, taken_src="mtime")
    corpus.matched(a, b, HIGH)
    corpus.run()

    assert copied not in {sha256 for sha256, _ in corpus.rows()}
    assert corpus.stacks() == [{a, b}]


def test_a_video_is_its_own_stack_and_does_not_break_the_burst_around_it(
    corpus: Stacks,
) -> None:
    """Two of ADR 0003's rules at once. Nothing verifies a video, so it joins nothing;
    and it does not split the run it sits inside either, exactly as an mtime-dated
    frame does not in `browse.py`."""
    a = corpus.add("1", 0)
    clip = corpus.add("2", 2, kind="video")
    b = corpus.add("3", 4)
    corpus.matched(a, b, HIGH)
    corpus.run()

    assert corpus.stacks() == [{a, b}, {clip}]


def test_a_video_is_counted_in_the_report(corpus: Stacks) -> None:
    burst(corpus, "12")
    corpus.add("3", 6, kind="video")

    assert (corpus.work().videos, corpus.work().tiles) == (1, 3)


# --- absent evidence is never a match -----------------------------------------


def test_a_pair_with_no_match_row_is_not_stacked(corpus: Stacks) -> None:
    """The acceptance criterion in one test: a pair nobody checked is read as no
    agreement, so a stack is never invented out of the absence of evidence."""
    a, b = burst(corpus, "12")
    corpus.run()

    assert corpus.stacks() == [{a}, {b}]


def test_a_survivor_with_no_match_row_is_counted_and_named(corpus: Stacks) -> None:
    """A hole rather than a design: the screen said look properly and nothing did.
    ADR 0003 prices that at 6.0% of the pairs the reader kept together, so the pass
    says how many frames it saw rather than letting them go quiet."""
    a, b, c = burst(corpus, "123")
    corpus.matched(a, b, HIGH)
    for early, late in ((a, b), (a, c), (b, c)):
        corpus.candidate(early, late)
    work = corpus.work()

    assert work.pairs == 3
    assert (work.unchecked.survivors, work.unchecked.frames) == (2, sorted([a, b, c]))


def test_a_pair_the_screen_rejected_is_counted_and_not_named(corpus: Stacks) -> None:
    """Counted, because it is the screen doing its job over 84% of this catalog's
    candidates, and not a hole in the derivative tree."""
    a, b = burst(corpus, "12")
    corpus.candidate(a, b, verdict="screened_out")
    unchecked = corpus.work().unchecked

    assert (unchecked.screened_out, unchecked.survivors, unchecked.frames) == (1, 0, [])


def test_neither_count_is_derived_by_subtracting_one_total_from_another(
    corpus: Stacks,
) -> None:
    """Both are counted where they are recorded, so a narrower fence than the Match
    rows were computed behind cannot make the report say a negative number."""
    a, b, c = burst(corpus, "123", apart=30)
    for early, late in ((a, b), (a, c), (b, c)):
        corpus.matched(early, late, HIGH)
    narrow = Setting(strictness=20, linkage="majority", ceiling=29)
    work = worklist(corpus.conn, narrow)[0]

    # Three Match rows and a fence that admits no pair at all, which is what the
    # subtraction this replaced would have reported as -3.
    assert (work.pairs, work.unchecked.screened_out, work.unchecked.survivors) == (0, 0, 0)


# --- resume and idempotence ---------------------------------------------------


def test_a_second_pass_of_a_finished_catalog_places_nothing(corpus: Stacks) -> None:
    a, b = burst(corpus, "12")
    corpus.matched(a, b, HIGH)
    corpus.run()
    before = corpus.rows()

    assert corpus.work().todo == []
    assert corpus.run()["written"] == 0
    assert corpus.rows() == before


def test_an_interrupted_pass_resumes_where_it_reached(corpus: Stacks) -> None:
    """The resume unit is the run, because the run is what the rule is applied to."""
    first = burst(corpus, "12")
    second = [corpus.add("3", 7200), corpus.add("4", 7202)]
    for pair in (first, second):
        corpus.matched(pair[0], pair[1], HIGH)
    every = corpus.work().todo
    assert len(every) == 2

    corpus.run(limit=1)  # one run lands; the pass then dies
    assert len(corpus.rows()) == 2

    resumed = corpus.work()
    assert resumed.todo == every[1:]
    corpus.run()
    assert corpus.stacks() == [set(first), set(second)]


def test_a_run_is_placed_in_one_transaction(corpus: Stacks) -> None:
    """What makes the resume above exact: a run is either wholly placed or wholly
    absent, so the worklist is one query over the frames."""
    burst(corpus, "12")
    corpus.add("3", 7200)
    written: list[list[tuple]] = []
    store = membership._store

    def spy(conn, rows):
        written.append(list(rows))
        return store(conn, rows)

    with pytest.MonkeyPatch.context() as patch:
        patch.setattr(membership, "_store", spy)
        corpus.run()

    assert [len(rows) for rows in written] == [2, 1]


def test_progress_is_reported_as_the_pass_runs(corpus: Stacks, capsys) -> None:
    """So that a slow pass is distinguishable from a stuck one. The interval is the
    other passes' 30 seconds, and zero here so the assertion is about the reporting
    and not about how long a test is willing to sit still."""
    burst(corpus, "12")
    corpus.add("3", 7200)
    work, points, videos = corpus.plan()
    place_all(corpus.conn, work.todo, videos, points, SETTING, progress_seconds=0)

    assert "place            2/3" in capsys.readouterr().out


def test_a_second_setting_leaves_the_first_one_standing(corpus: Stacks) -> None:
    """A setting is a population and never an overwrite, which is what makes moving
    one visible in the table rather than mixed into it."""
    a, b = burst(corpus, "12")
    corpus.matched(a, b, HIGH)
    corpus.run(SETTING)
    corpus.run(Setting(strictness=200, linkage="complete"))

    assert placed(corpus.conn, SETTING) == {a, b}
    assert dict(
        corpus.conn.execute(
            "SELECT strictness, count(*) FROM stack_member GROUP BY strictness"
        )
    ) == {20: 2, 200: 2}


def test_a_setting_that_has_never_run_owes_every_tile(corpus: Stacks) -> None:
    a, b = burst(corpus, "12")
    corpus.matched(a, b, HIGH)
    corpus.run(SETTING)

    assert corpus.work(Setting(strictness=25, linkage="majority")).todo == [[a, b]]


# --- the rule ------------------------------------------------------------------


def test_the_rule_is_the_one_the_labels_were_replayed_against(corpus: Stacks) -> None:
    """Load-bearing, and the reason `link` lives in `photolib` rather than in the
    harness: ADR 0003's "What the labels settled" describes what this pass draws only
    if the walk is the same walk. Not a second copy of it -- the same object.
    """
    assert label.LINKAGE is membership.LINKAGE
    assert label.link is membership.link


def test_the_recorded_setting_is_the_one_the_labels_settled() -> None:
    """Strictness 20 with "matches most members", from ADR 0003."""
    assert (membership.STRICTNESS, membership.DEFAULT_LINKAGE) == (20, "majority")
    assert Setting().key == (
        matches.METHOD,
        matches.VERSION,
        20,
        "majority",
        candidates.CEILING,
    )


def test_the_grid_reads_the_setting_this_pass_writes() -> None:
    """The other half of that agreement, and the reason it is a test rather than an
    import: `photolib.browse` names the assignment it reads in five literals of its
    own, because reaching this module for them would put OpenCV -- `photolib.matches`
    is where two of the five live -- between a clean checkout and the website. So the
    two are asserted equal here, where both may be imported.

    The column names are asserted too, and not only the values: the grid's join is
    generated from that mapping, so its keys are what decides which column each value
    is compared against.
    """
    assert tuple(browse.STACK_SETTING) == (
        "method",
        "version",
        "strictness",
        "linkage",
        "ceiling",
    )
    assert tuple(browse.STACK_SETTING.values()) == Setting().key


def test_a_greedy_walk_can_split_a_stack_the_rule_would_have_held(corpus: Stacks) -> None:
    """The failure the labelling harness scored as a coin toss, kept rather than
    hidden: the walk is forward and greedy, so a frame consumed early can agree with
    every member of the stack it was placed before."""
    points = {("a", "b"): HIGH, ("b", "c"): HIGH, ("a", "c"): LOW}

    assert link(["a", "b", "c"], points, 20, membership.majority) == [["a", "b"], ["c"]]


def test_the_linkage_vocabulary_is_the_schema_s_and_not_a_convention(corpus: Stacks) -> None:
    sha256 = corpus.add("1", 0)

    with pytest.raises(sqlite3.IntegrityError):
        corpus.conn.execute(
            "INSERT INTO stack_member"
            " (method, version, strictness, linkage, ceiling, sha256, stack)"
            " VALUES (?, ?, 20, 'sometimes', 3600, ?, ?)",
            (matches.METHOD, matches.VERSION, sha256, sha256),
        )


def test_place_puts_every_frame_of_a_run_somewhere(corpus: Stacks) -> None:
    """A frame with no row is a tile the grid could not draw, so the walk is total."""
    run = [f"{index}" * 64 for index in range(4)]

    stacks = place(run, {run[2]}, {(run[0], run[1]): HIGH}, SETTING)

    assert sorted(sha256 for stack in stacks for sha256 in stack) == sorted(run)


# --- refusals -----------------------------------------------------------------


def test_the_pass_refuses_while_a_writer_holds_the_catalog(
    corpus: Stacks, tmp_path: Path, migrated
) -> None:
    """Invariant 6: exclusive maintenance does not run alongside a writer."""
    a, b = burst(corpus, "12")
    corpus.matched(a, b, HIGH)
    corpus.conn.close()
    writer = candidates.catalog(migrated[0])
    writer.execute("BEGIN IMMEDIATE")
    try:
        with pytest.raises(MembershipRefused, match="another writer holds the catalog"):
            membership.run(synthetic_config(tmp_path, migrated))
    finally:
        writer.execute("ROLLBACK")
        writer.close()


def test_the_pass_refuses_before_the_matches_exist(
    corpus: Stacks, tmp_path: Path, migrated
) -> None:
    burst(corpus, "12")
    corpus.conn.close()

    with pytest.raises(MembershipRefused, match="no Matches"):
        membership.run(synthetic_config(tmp_path, migrated))


# --- the command ---------------------------------------------------------------


def synthetic_config(tmp_path: Path, migrated: tuple[Path, Path]) -> Config:
    """A config whose every path but the database pair points at nothing.

    This is the "reads the catalog and nothing else" criterion made testable: a pass
    that opened the substrates, the thumbnails or anything under the vault would fail
    here rather than pass quietly. There is no substrate root either -- this pass
    reads Match counts, not frames.
    """
    catalog_db, state_db = migrated
    absent = tmp_path / "no-such-drive"
    return Config(
        photos_root=absent / "photos",
        restic_repo=absent / "ResticPhotos",
        mediavault_root=absent / "MediaVault",
        mediavault_manifest_db=absent / "MediaVault" / "manifest.sqlite3",
        vault_root=absent / "vault",
        staging_root=absent / "vault" / ".staging",
        deriv_root=absent / "vault" / "deriv",
        meta_root=absent / "vault" / "meta",
        thumb_root=absent / "thumb",
        substrate_root=absent / "substrate",
        catalog_db=catalog_db,
        state_db=state_db,
        backup_root=absent / "backups",
        reveal_root=absent / "vault",
        restic_password_command="false",
    )


def test_run_places_every_tile_without_opening_the_vault(
    corpus: Stacks, tmp_path: Path, migrated, capsys
) -> None:
    """The "reads the catalog and nothing else" criterion made testable: every path
    in this config but the database pair points at nothing, so a pass that opened the
    substrates or `G:` would fail here rather than pass quietly."""
    a, b, c = burst(corpus, "123")
    corpus.matched(a, b, HIGH)
    corpus.matched(b, c, HIGH)
    corpus.matched(a, c, HIGH)
    alone = corpus.add("4", 7200)
    corpus.conn.close()

    assert membership.run(synthetic_config(tmp_path, migrated)) == 0

    report = capsys.readouterr().out
    assert "strictness 20, majority linkage" in report
    assert "4 tiles to place" in report
    assert "2 stacks, 1 of more than one frame, largest 3" in report

    conn = sqlite3.connect(migrated[0])
    try:
        assert conn.execute(
            "SELECT count(DISTINCT stack) FROM stack_member WHERE stack = ?", (a,)
        ).fetchone() == (1,)
        assert conn.execute(
            "SELECT stack FROM stack_member WHERE sha256 = ?", (alone,)
        ).fetchone() == (alone,)
    finally:
        conn.close()


def test_run_says_so_when_there_is_nothing_to_do(
    corpus: Stacks, tmp_path: Path, migrated, capsys
) -> None:
    a, b = burst(corpus, "12")
    corpus.matched(a, b, HIGH)
    corpus.run()
    corpus.conn.close()

    assert membership.run(synthetic_config(tmp_path, migrated)) == 0
    assert "nothing to do" in capsys.readouterr().out


def test_the_command_line_takes_the_setting_as_a_parameter(
    corpus: Stacks, tmp_path: Path, migrated, monkeypatch, capsys
) -> None:
    """ADR 0003 makes strictness and linkage the reader's, and #40 materialises at
    what the labels settled: the default is that setting and the flags move it."""
    a, b = burst(corpus, "12")
    corpus.matched(a, b, 25)
    corpus.conn.close()
    monkeypatch.setattr(membership, "load", lambda: synthetic_config(tmp_path, migrated))

    assert membership.main(["--strictness", "40", "--linkage", "complete"]) == 0

    assert "strictness 40, complete linkage" in capsys.readouterr().out
    conn = sqlite3.connect(migrated[0])
    try:
        assert conn.execute("SELECT count(DISTINCT stack) FROM stack_member").fetchone() == (2,)
    finally:
        conn.close()


def test_the_window_is_not_a_flag(corpus: Stacks) -> None:
    """The ceiling is the fence the Match rows were computed behind, so a walk at
    another value would be reading pairs nothing ever checked."""
    with pytest.raises(SystemExit):
        membership.main(["--ceiling", "900"])
