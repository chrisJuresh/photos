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

import random
import sqlite3
from collections.abc import Sequence
from datetime import datetime, timedelta
from pathlib import Path

import pytest

from harness import label
from photolib import browse, candidates, fingerprints, matches, membership, people
from photolib.config import Config
from photolib.membership import (
    NO_PEOPLE,
    MembershipRefused,
    Setting,
    Work,
    agreement,
    link,
    place,
    place_all,
    placed,
    regroup,
    worklist,
)

BASE = datetime(2021, 6, 1, 12, 0, 0)
# The shipped setting, read from the module rather than restated: a corpus that
# ran at one setting while `membership.run` defaulted to another would be two
# populations, and the tests that turn on "a second run places nothing" would
# quietly stop testing it. `test_the_recorded_setting_is_the_one_the_labels_settled`
# is where the value itself is asserted.
SETTING = Setting()
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

    def examined(self, sha256: str, *, body: float = 0.0, who: Sequence[str] = ()) -> None:
        """What the people pass found in one frame: a body, and some persons.

        `body` is the largest body's share of the frame's height and `who` is the
        persons whose faces were read there, each given a face of its own well above
        the floor. A frame with neither is the pass having looked and found nobody,
        which is a row and not an absence -- `frame_body` exists to keep those two
        apart, and the veto reads them differently.
        """
        self.conn.execute(
            "INSERT OR REPLACE INTO frame_body (model, version, sha256, bodies, share)"
            " VALUES (?, ?, ?, ?, ?)",
            (people.MODEL, people.VERSION, sha256, 1 if body else 0, body),
        )
        for idx, person in enumerate(who):
            self.conn.execute(
                "INSERT OR REPLACE INTO face (model, version, sha256, idx, share, vector)"
                " VALUES (?, ?, ?, ?, ?, ?)",
                (people.MODEL, people.VERSION, sha256, idx, people.FLOOR + 0.1, b""),
            )
            self.conn.execute(
                "INSERT OR REPLACE INTO face_person"
                " (model, version, threshold, cut, sha256, idx, person)"
                " VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    people.MODEL,
                    people.VERSION,
                    people.THRESHOLD,
                    people.CUT,
                    sha256,
                    idx,
                    person,
                ),
            )
        self.conn.commit()

    def plan(
        self, setting: Setting = SETTING, excluded: Sequence[str] = ()
    ) -> tuple[Work, dict, set[str], dict | None]:
        return worklist(self.conn, setting, excluded)

    def work(self, setting: Setting = SETTING) -> Work:
        return self.plan(setting)[0]

    def run(
        self,
        setting: Setting = SETTING,
        *,
        limit: int | None = None,
        excluded: Sequence[str] = (),
    ) -> dict:
        work, points, videos, who = self.plan(setting, excluded)
        todo = work.todo if limit is None else work.todo[:limit]
        return place_all(self.conn, todo, videos, points, setting, who)

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
    # Both rules named outright rather than one of them taken from the shipped
    # default, which is a rule this test is comparing and not the one it runs at.
    corpus.run(Setting(strictness=20, linkage="majority"))
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
    work, points, videos, who = corpus.plan()
    place_all(corpus.conn, work.todo, videos, points, SETTING, who, progress_seconds=0)

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
    ) == {membership.STRICTNESS: 2, 200: 2}


def test_a_setting_that_has_never_run_owes_every_tile(corpus: Stacks) -> None:
    a, b = burst(corpus, "12")
    corpus.matched(a, b, HIGH)
    corpus.run(SETTING)

    assert corpus.work(Setting(strictness=25, linkage="majority")).todo == [[a, b]]


# --- the veto, over a catalog ----------------------------------------------------


def test_the_veto_splits_a_stack_the_match_proposed(corpus: Stacks) -> None:
    """ADR 0003's worst failure, drawn: three frames of one place that the geometry
    cannot tell apart, where the difference is who is in them."""
    a, b, c = burst(corpus, "123")
    for early, late in ((a, b), (b, c), (a, c)):
        corpus.matched(early, late, HIGH)
    corpus.examined(a, body=0.4, who=["p1", "p2"])
    corpus.examined(b, body=0.4, who=["p1"])
    corpus.examined(c, body=0.4, who=["p3"])
    corpus.run()

    assert corpus.stacks() == [{a, b}, {c}]


def test_the_veto_is_a_population_and_never_an_overwrite(corpus: Stacks) -> None:
    """The people identity is part of the key for the reason strictness and linkage
    are: the grid the reader had before the rule landed is still in the table, so the
    change is something they can see rather than be told about."""
    a, b = burst(corpus, "12")
    corpus.matched(a, b, HIGH)
    corpus.examined(a, body=0.4, who=["p1"])
    corpus.examined(b, body=0.4, who=["p2"])
    corpus.run()
    corpus.run(Setting(people=NO_PEOPLE))

    assert dict(
        corpus.conn.execute(
            "SELECT people, count(DISTINCT stack) FROM stack_member GROUP BY people"
        )
    ) == {membership.PEOPLE: 2, NO_PEOPLE: 1}
    assert placed(corpus.conn, SETTING) == {a, b}


def test_a_second_pass_with_the_veto_places_nothing(corpus: Stacks) -> None:
    a, b = burst(corpus, "12")
    corpus.matched(a, b, HIGH)
    corpus.examined(a, body=0.4, who=["p1"])
    corpus.examined(b, body=0.4, who=["p2"])
    corpus.run()
    before = corpus.rows()

    assert corpus.work().todo == []
    assert corpus.run()["written"] == 0
    assert corpus.rows() == before


def test_an_interrupted_pass_with_the_veto_resumes_where_it_reached(corpus: Stacks) -> None:
    """The resume unit is still the run: the veto is applied inside one, so a run is
    either wholly placed as the rule decided or wholly absent."""
    first = burst(corpus, "12")
    second = [corpus.add("3", 7200), corpus.add("4", 7202)]
    for pair in (first, second):
        corpus.matched(pair[0], pair[1], HIGH)
        corpus.examined(pair[0], body=0.4, who=["p1"])
        corpus.examined(pair[1], body=0.4, who=["p2"])

    corpus.run(limit=1)
    assert len(corpus.rows()) == 2
    assert corpus.work().todo == [second]

    corpus.run()
    assert corpus.stacks() == [{first[0]}, {first[1]}, {second[0]}, {second[1]}]


def test_the_frames_the_people_pass_never_reached_are_counted(corpus: Stacks) -> None:
    """Counted rather than split, and counted rather than left to be noticed: an
    incomplete people pass degrades to the grid without the rule, frame by frame, and
    that is the failure that would otherwise be silent."""
    a, b, c = burst(corpus, "123")
    for early, late in ((a, b), (b, c), (a, c)):
        corpus.matched(early, late, HIGH)
    corpus.examined(a, body=0.4, who=["p1"])
    corpus.run()

    assert corpus.work().unpeopled == 2
    assert corpus.stacks() == [{a, b, c}]


def passers_by(corpus: Stacks) -> list[str]:
    """A burst of one friend with two different passers-by wandering through it.

    Two and not one, which is the shape of the failure `harness.people` was built to
    guard: one extra person in some frames *nests*, because the frame holding them
    contains the frames that do not. It takes two different ones to leave no frame
    showing everybody, and that is when the rule takes the burst apart.
    """
    a, b, c = burst(corpus, "123")
    for early, late in ((a, b), (b, c), (a, c)):
        corpus.matched(early, late, HIGH)
    corpus.examined(a, body=0.4, who=["p1", "tourist"])
    corpus.examined(b, body=0.4, who=["p1"])
    corpus.examined(c, body=0.4, who=["p1", "cyclist"])
    return [a, b, c]


def test_a_stranger_is_out_of_every_frames_people(corpus: Stacks) -> None:
    """ADR 0004's *a stranger never counts*: passers-by the reader never noticed
    cannot break their burst, once the reader has said so."""
    a, b, c = passers_by(corpus)

    assert corpus.run(excluded=["tourist", "cyclist"])["split"] == []
    assert corpus.stacks() == [{a, b, c}]


def test_an_unjudged_person_is_a_friend_and_splits_the_stack(corpus: Stacks) -> None:
    """The other side of the same test, and ADR 0004's stated default: the grid at
    zero answers is the grid the rule produces on its own, so silence counts the
    person rather than discounting them -- every answer the reader gives moves the
    grid from there rather than repairing it."""
    a, b, c = passers_by(corpus)
    result = corpus.run()

    assert corpus.stacks() == [{a, b}, {c}]
    assert (result["split"], result["moved"]) == ([a], 1)


def test_the_veto_reads_the_persons_at_the_clustering_the_key_names(corpus: Stacks) -> None:
    """A person at another threshold or another cut is a person of another
    population, and reading one against the other is what putting all four columns in
    the identity prevents."""
    a, b = burst(corpus, "12")
    corpus.matched(a, b, HIGH)
    corpus.examined(a, body=0.4, who=["p1"])
    corpus.examined(b, body=0.4, who=["p2"])
    elsewhere = Setting(people=membership.identity(threshold=0.9))
    corpus.run(elsewhere)

    # No face has a person at 0.9, so both frames read as somebody with no readable
    # face -- which nests, and leaves the walk's own answer standing.
    assert corpus.stacks() == [{a, b}]


def test_a_face_under_the_floor_is_in_no_frames_people(corpus: Stacks) -> None:
    """The floor is read at every run and stored nowhere, which is what
    `012_people.sql` kept the share for: a person forty metres away in the background
    of one frame of a bracket does not split it."""
    a, b = burst(corpus, "12")
    corpus.matched(a, b, HIGH)
    corpus.examined(a, body=0.4, who=["p1"])
    corpus.examined(b, body=0.4, who=["p1"])
    corpus.conn.execute(
        "INSERT INTO face (model, version, sha256, idx, share, vector)"
        " VALUES (?, ?, ?, 9, ?, ?)",
        (people.MODEL, people.VERSION, b, people.FLOOR / 2, b""),
    )
    corpus.conn.execute(
        "INSERT INTO face_person"
        " (model, version, threshold, cut, sha256, idx, person) VALUES (?, ?, ?, ?, ?, 9, ?)",
        (people.MODEL, people.VERSION, people.THRESHOLD, people.CUT, b, "distant"),
    )
    corpus.conn.commit()
    corpus.run()

    assert corpus.stacks() == [{a, b}]


def test_a_video_is_its_own_stack_whatever_the_veto_says(corpus: Stacks) -> None:
    """Nothing looks for a person in a video, so it has no people -- and it is out of
    the veto's way for the same reason it is out of the walk's."""
    a = corpus.add("1", 0)
    clip = corpus.add("2", 2, kind="video")
    b = corpus.add("3", 4)
    corpus.matched(a, b, HIGH)
    corpus.examined(a, body=0.4, who=["p1"])
    corpus.examined(b, body=0.4, who=["p1"])
    corpus.run()

    assert corpus.stacks() == [{a, b}, {clip}]


def test_the_strangers_are_read_from_the_labels_file_when_there_is_one(
    tmp_path: Path,
) -> None:
    """The one read this package makes of the harness's database, and every way it
    can be absent is *no strangers* rather than an error: ADR 0004's grid at zero
    answers is the grid the rule produces on its own."""
    labels_db = tmp_path / membership.LABELS
    assert membership.strangers(labels_db, membership.PEOPLE) == frozenset()

    conn = sqlite3.connect(labels_db)
    try:
        conn.execute("CREATE TABLE answer (given TEXT)")  # a file from before the mode
        conn.commit()
        assert membership.strangers(labels_db, membership.PEOPLE) == frozenset()

        from harness import people as harness_people

        harness_people.ensure(conn)
        clustering = harness_people.Clustering()
        harness_people.record(conn, "tourist", "stranger", clustering=clustering)
        harness_people.record(conn, "friend", "friend", clustering=clustering)
        conn.commit()
    finally:
        conn.close()

    assert membership.strangers(labels_db, membership.PEOPLE) == {"tourist"}
    # An answer given about another clustering is evidence and not a judgement here.
    assert membership.strangers(labels_db, membership.identity(cut=0.5)) == frozenset()


# --- the rule ------------------------------------------------------------------


def test_the_rule_is_the_one_the_labels_were_replayed_against(corpus: Stacks) -> None:
    """Load-bearing, and the reason `link` lives in `photolib` rather than in the
    harness: ADR 0003's "What the labels settled" describes what this pass draws only
    if the walk is the same walk. Not a second copy of it -- the same object.
    """
    assert label.LINKAGE is membership.LINKAGE
    assert label.link is membership.link
    assert label.agreement is membership.agreement


def test_the_recorded_setting_is_the_one_the_labels_settled() -> None:
    """Strictness 10 with the chain, from ADR 0003.

    It was 20 with "matches most members" and it moved when the precision floor
    `harness.calibrate` ranks under moved from 95% to 85% -- see
    `photolib.membership.STRICTNESS`. Moving it is what adds a population rather
    than overwriting one, so the setting this test names is the grid's default and
    never the only assignment `stack_member` holds.
    """
    assert (membership.STRICTNESS, membership.DEFAULT_LINKAGE) == (10, "neighbour")
    assert Setting().key == (
        matches.METHOD,
        matches.VERSION,
        10,
        "neighbour",
        candidates.CEILING,
        membership.PEOPLE,
    )


def test_the_people_the_veto_reads_are_named_by_the_whole_clustering() -> None:
    """`face_person`'s four columns and not three of them.

    The cut joined that key at migration 013, so an identity naming the model, the
    version and the threshold alone would name three of the four things that decided
    which persons a frame has -- and a grouping made at one cut and one made at
    another would share a key, which is what `011_stack_member.sql` exists to
    prevent.
    """
    assert membership.PEOPLE == (
        f"{people.MODEL}/{people.VERSION}/{people.THRESHOLD}/{people.CUT}"
    )
    assert membership.clustering(membership.PEOPLE) == (
        people.MODEL,
        people.VERSION,
        people.THRESHOLD,
        people.CUT,
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
        "people",
    )
    assert tuple(browse.STACK_SETTING.values()) == Setting().key
    assert browse.NO_PEOPLE == NO_PEOPLE


def test_the_grid_ranks_a_cover_at_the_floor_the_veto_read() -> None:
    """The other constant the website spells out for itself, and for the same
    reason: `photolib.people` imports numpy and Pillow to reach `FLOOR`, and the
    website reads stored numbers only. A cover ranked at one floor over an
    assignment vetoed at another would draw a frame for holding somebody the stack
    was not grouped by."""
    assert browse.PEOPLE_FLOOR == people.FLOOR


def test_the_labels_file_is_named_the_same_thing_on_both_sides() -> None:
    """The one read `photolib` makes of the harness's database, spelled out rather
    than imported because the arrow between them points the other way."""
    assert membership.LABELS == label.LABELS


def test_a_greedy_walk_can_split_a_stack_the_rule_would_have_held(corpus: Stacks) -> None:
    """The failure the labelling harness scored as a coin toss, kept rather than
    hidden: the walk is forward and greedy, so a frame consumed early can agree with
    every member of the stack it was placed before."""
    points = {("a", "b"): HIGH, ("b", "c"): HIGH, ("a", "c"): LOW}

    assert link(["a", "b", "c"], agreement(points, 20), membership.majority) == [
        ["a", "b"],
        ["c"],
    ]


# --- the veto -------------------------------------------------------------------

# ADR 0004's rule is a statement about sets of people, so it is asserted as one:
# no photograph, no database and no model anywhere below. The frames are named by
# letter in capture order and each one's people are a set of person names, which is
# exactly what `regroup` takes.


def sets(*who: object) -> tuple[list[str], dict[str, frozenset[str] | None]]:
    """One stack's frames in capture order, and what was read in each.

    A string is the people read in that frame -- `"ABC"` is `{A,B,C}` and `""` is
    somebody with no readable face -- `None` is a frame the pass found nobody in,
    and `...` is a frame it never reached, which is absent from the mapping rather
    than in it holding nothing.
    """
    frames = [chr(ord("a") + index) for index in range(len(who))]
    return frames, {
        frame: None if held is None else frozenset(str(held))
        for frame, held in zip(frames, who)
        if held is not ...
    }


def grouped(*who: object) -> list[str]:
    """`regroup`'s answer as one string per stack, for reading in an assertion."""
    frames, held = sets(*who)
    return ["".join(stack) for stack in regroup(frames, held)]


def test_the_readers_worked_example() -> None:
    """ADR 0004's, verbatim, and the reason the rule is derived rather than stated:

    > Photographs of `{A,B,C,D}`, `{A,B,C}`, `{A,B}`, `{A,B,E}`, `{B,F}`. The first
    > three are one stack with `{A,B,C,D}` as its cover, and the last two stand
    > alone.
    """
    assert grouped("ABCD", "ABC", "AB", "ABE", "BF") == ["abc", "d", "e"]


def test_a_stack_needs_a_member_holding_the_rest_and_not_a_chain() -> None:
    """Subset of the cover, and not a strict chain: the members need not contain one
    another, only all fit inside one of them. `{A,B}` and `{A,C}` do not contain each
    other and `{A,B,C}` contains both, so all three are one stack."""
    assert grouped("AB", "AC", "ABC") == ["abc"]


def test_two_frames_with_no_frame_showing_everybody_are_two_stacks() -> None:
    """The other half of the same rule: with no `{A,B,C}` present there is no frame
    that shows everybody, so there is none worth drawing as a cover of one."""
    assert grouped("AB", "AC") == ["a", "b"]


def test_the_greedy_split_runs_again_on_what_is_left() -> None:
    """A stack that splits into a group and a remainder which itself has no maximum
    splits again, rather than the remainder being kept whole because the first pass
    was satisfied."""
    assert grouped("ABC", "AB", "AD", "AE") == ["ab", "c", "d"]


def test_ties_are_settled_by_capture_order_and_the_answer_never_moves() -> None:
    """Two frames holding as many people as each other are separated by which was
    taken first, which is what makes the assignment a fact about the photographs
    rather than about the day the pass ran."""
    assert grouped("AB", "CD") == ["a", "b"]
    assert grouped("CD", "AB") == ["a", "b"]
    frames, held = sets("AB", "CD", "AB")
    assert regroup(frames, held) == regroup(frames, held) == [["a", "c"], ["b"]]


def test_a_frame_with_nobody_in_it_never_joins_a_frame_with_somebody() -> None:
    """The reader's own extra clause, and it does not follow from nesting -- the
    empty set is a subset of everything, so a landscape would otherwise disappear
    into the same landscape with a friend standing in it."""
    assert grouped(None, "A") == ["a", "b"]
    assert grouped("A", None, "A") == ["b", "ac"]
    # And it fires on presence rather than on identity: a frame the pass found
    # somebody in whose face it could not read is not a frame with nobody in it.
    assert grouped(None, None) == ["ab"]


def test_a_frame_holding_somebody_with_no_readable_face_stays_in_its_burst() -> None:
    """The empty set nests into anything, which is the whole reason ADR 0004 runs two
    detectors: a turned head and a blink are somebody, and their frame keeps its
    place rather than being split out on the strength of a face that could not be
    read."""
    assert grouped("", "AB") == ["ab"]
    assert grouped("AB", "", "AB") == ["abc"]


def test_a_frame_the_people_pass_never_reached_stays_where_the_match_put_it() -> None:
    """Exempt from both halves: an incomplete people pass degrades to the grid
    without the rule for that frame, and never to a split."""
    assert grouped(..., "AB") == ["ab"]
    assert grouped(..., None) == ["ab"]
    assert grouped("AB", ..., "AC") == ["ab", "c"]


def test_the_rule_only_ever_splits() -> None:
    """What comes back is a partition of what went in -- never a frame twice, never
    a frame lost, and never a stack the Match did not propose."""
    frames, held = sets("ABCD", "ABC", None, "", "BF", ..., "AB")
    parts = regroup(frames, held)

    assert sorted(frame for part in parts for frame in part) == sorted(frames)
    assert all(part for part in parts)
    assert len(parts) > 1


def test_a_stack_nobody_is_in_is_the_stack_the_match_proposed() -> None:
    """The no-op the rule is on nine stacks in ten: every frame reads as no people,
    every set nests, and the walk's answer comes back unchanged."""
    assert grouped("", "", "") == ["abc"]
    assert grouped(*[...] * 3) == ["abc"]


# --- the seam --------------------------------------------------------------------

# The three linkage rules and the walk exactly as they stood before the pair
# predicate was lifted out of them: each rule spelling out the Match against
# strictness for itself. This is the only copy of that code left anywhere and it
# lives here on purpose -- the prefactor's whole claim is that the grid did not
# move, and a claim like that has to be asserted against what was actually replaced
# rather than against a paraphrase of it.
#
# **It is dead code by design and nothing keeps it in step with `link`.** That is
# the point: it is a photograph of the old rule and not a second live one. It is
# also spent the moment the evidence moves -- the ticket that prices a rule over the
# fingerprint is where this block and the test under it go, because an equivalence
# to a rule nothing ships is a test that can only fail for the wrong reason.


def _was_complete(
    holding: Sequence[str], frame: str, points: dict[tuple[str, str], int], strictness: int
) -> bool:
    return all(membership.match(points, member, frame) >= strictness for member in holding)


def _was_majority(
    holding: Sequence[str], frame: str, points: dict[tuple[str, str], int], strictness: int
) -> bool:
    agreed = sum(
        1 for member in holding if membership.match(points, member, frame) >= strictness
    )
    return agreed * 2 > len(holding)


def _was_neighbour(
    holding: Sequence[str], frame: str, points: dict[tuple[str, str], int], strictness: int
) -> bool:
    return membership.match(points, holding[-1], frame) >= strictness


WAS = {"complete": _was_complete, "majority": _was_majority, "neighbour": _was_neighbour}


def _was_link(
    run: Sequence[str], points: dict[tuple[str, str], int], strictness: int, joins
) -> list[list[str]]:
    stacks: list[list[str]] = []
    holding: list[str] = []
    for frame in run:
        if holding and joins(holding, frame, points, strictness):
            holding.append(frame)
        else:
            if holding:
                stacks.append(holding)
            holding = [frame]
    if holding:
        stacks.append(holding)
    return stacks


def awkward_matches(seed: int, run: Sequence[str]) -> dict[tuple[str, str], int]:
    """One run's Match rows, drawn deterministically and deliberately awkwardly.

    Three of every ten pairs carry no row at all and half the rows that do exist are
    stored the other way round, which are exactly the two readings `match` is careful
    about -- absent evidence is no agreement, and either order, because a run's order
    is the enumeration's. Both had to survive the move into the predicate, and a tidy
    corpus of forward rows would not notice either of them going missing.

    The counts straddle every strictness the equivalence is checked at, so the rules
    disagree with one another over this corpus rather than all returning one cut.
    """
    draw = random.Random(seed)
    rows: dict[tuple[str, str], int] = {}
    for index, early in enumerate(run):
        for late in run[index + 1 :]:
            if draw.random() < 0.3:
                continue
            pair = (late, early) if draw.random() < 0.5 else (early, late)
            rows[pair] = draw.randrange(0, 41)
    return rows


def test_the_predicate_cuts_every_run_where_the_rule_it_replaced_did() -> None:
    """The prefactor's acceptance test: the same run and the same stored Matches,
    through the seam and through what the seam replaced, cut in the same places.

    Every rule at every strictness worth asking about, over enough corpora for the
    rules to disagree with one another -- an equivalence asserted on one tidy burst
    would hold for a predicate that was wrong everywhere else.
    """
    run = [sha_of(seed) for seed in "abcdefghijkl"]
    drawn: set[tuple[int, ...]] = set()
    for seed in range(24):
        points = awkward_matches(seed, run)
        for strictness in (0, 4, membership.STRICTNESS, 20, 41):
            for linkage, joins in membership.LINKAGE.items():
                cut = link(run, agreement(points, strictness), joins)
                assert cut == _was_link(run, points, strictness, WAS[linkage]), (
                    seed,
                    strictness,
                    linkage,
                )
                drawn.add(tuple(len(stack) for stack in cut))

    # Not a vacuous agreement. Two rules that never stack anything agree perfectly,
    # so the corpus has to have exercised both ends and the middle: the whole run in
    # one stack, the run in twelve stacks of one, and enough distinct shapes between
    # them that the rules were plainly disagreeing with each other rather than all
    # returning the same cut. 20 is a floor well under the 120 this corpus draws --
    # what it rules out is a corpus collapsed to a handful of shapes, not a count
    # worth tuning.
    assert (len(run),) in drawn
    assert (1,) * len(run) in drawn
    assert len(drawn) > 20


def test_the_predicate_reads_a_pair_in_either_order_and_an_absent_one_as_nothing() -> None:
    """`match`'s two readings, asserted of the predicate and not only of the function
    under it: those are the properties the linkage rules used to hold themselves and
    now delegate, and a rule that lost one would quietly stop stacking half the pairs
    in the table."""
    early, late = sha_of("a"), sha_of("b")
    agrees = agreement({(late, early): HIGH}, 20)

    assert agrees(early, late) is True
    assert agrees(late, early) is True
    assert agreement({}, 20)(early, late) is False


def test_a_rule_asks_the_predicate_and_never_the_table() -> None:
    """The property the seam exists for: the rules take agreement as a value and have
    no way to reach a Match, so a predicate built from other evidence is a different
    rule rather than a second walk."""
    asked: list[tuple[str, str]] = []

    def agrees(early: str, late: str) -> bool:
        asked.append((early, late))
        return "c" not in (early, late)

    assert link(["a", "b", "c", "d"], agrees, membership.complete) == [
        ["a", "b"],
        ["c"],
        ["d"],
    ]
    assert asked == [("a", "b"), ("a", "c"), ("c", "d")]


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

    cut = place(run, {run[2]}, {(run[0], run[1]): HIGH}, SETTING)

    assert sorted(sha256 for stack in cut.stacks for sha256 in stack) == sorted(run)


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
    assert (
        f"strictness {membership.STRICTNESS}, {membership.DEFAULT_LINKAGE} linkage"
        in report
    )
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
