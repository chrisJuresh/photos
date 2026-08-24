"""Tests for the people pass: what it looks at, what it writes, and what a person is.

Every test runs against a temporary catalog+state pair and a synthetic substrate
tree of real but tiny webps, and **none of them loads a model or opens the
network**: the detector is a seam, exactly as the encoder is in
`tests/test_fingerprints.py`, and what is under test is the worklist, the resume,
the schema and the report rather than any model's opinion of a photograph. The
clustering is asserted on its own, over vectors these tests construct. Nothing here
opens a path from config.toml.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

import numpy as np
import pytest
from PIL import Image

from photolib import candidates, people
from photolib.config import Config, substrate_path
from photolib.people import (
    CUT,
    DIM,
    FLOOR,
    MODEL,
    NO_CUT,
    THRESHOLD,
    VERSION,
    Face,
    Found,
    PeopleRefused,
    cluster,
    cluster_all,
    examine_all,
    examined,
    name,
    photograph_shas,
    read,
    reaching,
    spread,
    worklist,
)


def sha_of(seed: str) -> str:
    """A 64-hex string that reads as a hash without being one."""
    return (seed * 64)[:64]


def vector(*values: float) -> np.ndarray:
    """One face vector, padded out to the embedding's width."""
    return np.array(list(values) + [0.0] * (DIM - len(values)), dtype=np.float32)


NOBODY = Found(bodies=[], faces=[])


def somebody(*shares: float) -> Found:
    """A frame holding one body and a face of each of `shares`."""
    return Found(
        bodies=[0.8],
        faces=[Face(share=share, vector=vector(1.0)) for share in shares],
    )


class Corpus:
    """A catalog of tiles, and the substrate tree the pass reads them from."""

    def __init__(self, conn: sqlite3.Connection, root: Path) -> None:
        self.conn = conn
        self.substrates = root / "substrate"
        self.next_id = 0

    def add(
        self,
        seed: str,
        *,
        kind: str = "image",
        state: str = "published",
        taken_src: str = "exif:DateTimeOriginal",
        substrate: bool = True,
        tile: bool = True,
    ) -> str:
        """One file, its tile, and by default the substrate the pass reads."""
        sha256 = sha_of(seed)
        self.conn.execute(
            "INSERT INTO file (sha256, size, ext, kind, state, feature_ver, taken_src)"
            " VALUES (?, 1, '.jpg', ?, ?, '{}', ?)",
            (sha256, kind, state, taken_src),
        )
        if tile:
            self.next_id += 1
            self.conn.execute(
                "INSERT INTO photo (id, rep_sha256, sort_key)"
                " VALUES (?, ?, '2021-01-01T00:00:00')",
                (self.next_id, sha256),
            )
        if substrate:
            self.write_substrate(sha256)
        self.conn.commit()
        return sha256

    def write_substrate(self, sha256: str, size: tuple[int, int] = (60, 40)) -> Path:
        """A real webp, so `read` is exercised rather than stubbed around."""
        target = substrate_path(self.substrates, sha256)
        target.parent.mkdir(parents=True, exist_ok=True)
        Image.new("RGB", size, (10, 120, 200)).save(target, "WEBP")
        return target

    def worklist(self, **kwargs) -> tuple[list[str], list[str]]:
        return worklist(self.conn, self.substrates, **kwargs)

    def examine(self, todo, detect=None, **kwargs) -> dict:
        return examine_all(
            self.conn, todo, self.substrates, detect or (lambda frame: NOBODY), **kwargs
        )

    def frames(self) -> dict[str, tuple[int, float]]:
        return {
            row[0]: row[1:]
            for row in self.conn.execute("SELECT sha256, bodies, share FROM frame_body")
        }

    def faces(self) -> list[tuple[str, int, float]]:
        return self.conn.execute(
            "SELECT sha256, idx, share FROM face ORDER BY sha256, idx"
        ).fetchall()

    def persons(self, threshold: float = THRESHOLD, cut: float = CUT) -> dict[str, str]:
        return {
            name(sha256, idx): person
            for sha256, idx, person in self.conn.execute(
                "SELECT sha256, idx, person FROM face_person"
                " WHERE threshold = ? AND cut = ?",
                (threshold, cut),
            )
        }


def key_of(conn: sqlite3.Connection, table: str) -> list[str]:
    """One table's primary key, in order. What "part of the key" is asserted over."""
    columns = [row for row in conn.execute(f"PRAGMA table_info({table})") if row[5]]
    return [row[1] for row in sorted(columns, key=lambda row: row[5])]


@pytest.fixture
def corpus(conn, tmp_path: Path) -> Corpus:
    return Corpus(conn, tmp_path)


# --- what gets looked at -----------------------------------------------------


def test_every_published_photograph_with_a_substrate_is_examined(corpus: Corpus) -> None:
    shas = {corpus.add(seed) for seed in "123"}
    todo, missing = corpus.worklist()
    result = corpus.examine(todo)

    assert (set(todo), missing) == (shas, [])
    assert result["written"] == 3
    assert set(corpus.frames()) == shas


def test_the_row_records_the_model_and_the_version(corpus: Corpus) -> None:
    sha256 = corpus.add("1")
    corpus.examine(corpus.worklist()[0], detect=lambda frame: somebody(0.3))

    assert corpus.conn.execute(
        "SELECT model, version, sha256 FROM frame_body"
    ).fetchall() == [(MODEL, VERSION, sha256)]
    assert corpus.conn.execute("SELECT model, version FROM face").fetchall() == [
        (MODEL, VERSION)
    ]


def test_a_new_model_re_examines_and_leaves_the_old_rows_readable(corpus: Corpus) -> None:
    """A change of model is visible rather than mixed into one population."""
    sha256 = corpus.add("1")
    corpus.examine(corpus.worklist()[0])

    todo, _ = corpus.worklist(model="retinaface")
    assert todo == [sha256]
    corpus.examine(todo, model="retinaface")

    assert corpus.conn.execute(
        "SELECT model FROM frame_body ORDER BY model"
    ).fetchall() == [(MODEL,), ("retinaface",)]
    assert examined(corpus.conn) == {sha256}


def test_a_video_is_not_examined(corpus: Corpus) -> None:
    """Nothing detects a person in a video and nothing needs to, so the
    population is the fingerprint pass's."""
    photograph = corpus.add("1")
    corpus.add("2", kind="video")

    assert corpus.worklist() == ([photograph], [])


def test_a_raw_tile_is_examined(corpus: Corpus) -> None:
    """"Not a video" is the criterion, and "is an image" would drop two thousand."""
    raw = corpus.add("1", kind="raw_image")

    assert corpus.worklist()[0] == [raw]


def test_a_filesystem_dated_tile_is_not_examined(corpus: Corpus) -> None:
    """A copy date is not when the photograph was taken, so such a tile is
    nobody's neighbour and no rule about people could read it."""
    exif = corpus.add("1")
    corpus.add("2", taken_src="mtime")

    assert corpus.worklist() == ([exif], [])


def test_an_unpublished_tile_is_not_examined(corpus: Corpus) -> None:
    published = corpus.add("1")
    corpus.add("2", state="excluded")

    assert corpus.worklist()[0] == [published]


def test_a_file_that_is_not_a_tile_is_not_examined(corpus: Corpus) -> None:
    tile = corpus.add("1")
    corpus.add("2", tile=False)

    assert corpus.worklist()[0] == [tile]


def test_two_tiles_naming_one_frame_are_examined_once(corpus: Corpus) -> None:
    sha256 = corpus.add("1")
    corpus.conn.execute(
        "INSERT INTO photo (id, rep_sha256, sort_key) VALUES (99, ?, '2021-01-02T00:00:00')",
        (sha256,),
    )

    assert photograph_shas(corpus.conn) == [sha256]
    assert corpus.examine(corpus.worklist()[0])["written"] == 1


def test_photograph_shas_is_ordered(corpus: Corpus) -> None:
    """A stable order is what makes an interrupted pass resume rather than wander."""
    for seed in "3142":
        corpus.add(seed)

    assert photograph_shas(corpus.conn) == sorted(photograph_shas(corpus.conn))


# --- checked and empty, against never checked --------------------------------


def test_a_frame_with_nobody_in_it_is_recorded_as_looked_at(corpus: Corpus) -> None:
    """The distinction `candidate_pair`'s verdict draws: "no people here" is an
    answer, and it has to stay different from "never looked at"."""
    sha256 = corpus.add("1")
    corpus.examine(corpus.worklist()[0], detect=lambda frame: NOBODY)

    assert corpus.frames() == {sha256: (0, 0.0)}
    assert corpus.faces() == []
    assert corpus.worklist() == ([], [])


def test_a_second_pass_of_a_finished_corpus_has_nothing_to_do(corpus: Corpus) -> None:
    for seed in "123":
        corpus.add(seed)
    corpus.examine(corpus.worklist()[0], detect=lambda frame: somebody(0.3))
    before = corpus.frames()

    assert corpus.worklist() == ([], [])
    assert corpus.examine(corpus.worklist()[0])["written"] == 0
    assert corpus.frames() == before
    assert len(corpus.faces()) == 3


def test_an_interrupted_pass_resumes_where_it_reached(corpus: Corpus) -> None:
    shas = {corpus.add(seed) for seed in "1234"}
    todo, _ = corpus.worklist()

    # One batch of two lands; the pass then dies with the other two unexamined.
    corpus.examine(todo[:2], batch=2)

    resumed, _ = corpus.worklist()
    assert set(resumed) == shas - set(todo[:2])
    corpus.examine(resumed)
    assert set(corpus.frames()) == shas


# --- the holes in the tree ---------------------------------------------------


def test_a_tile_with_no_substrate_is_named_and_gets_no_row(corpus: Corpus) -> None:
    have, orphan = corpus.add("1"), corpus.add("2", substrate=False)
    todo, missing = corpus.worklist()
    corpus.examine(todo)

    assert (todo, missing) == ([have], [orphan])
    assert orphan not in corpus.frames()


def test_a_missing_substrate_keeps_being_reported_after_a_full_pass(corpus: Corpus) -> None:
    corpus.add("1")
    orphan = corpus.add("2", substrate=False)
    corpus.examine(corpus.worklist()[0])

    assert corpus.worklist() == ([], [orphan])


def test_a_substrate_that_will_not_decode_is_named_not_fatal(corpus: Corpus) -> None:
    """Otherwise a corrupt file ends the pass at the same tile on every resume."""
    good, corrupt = corpus.add("1"), corpus.add("2")
    substrate_path(corpus.substrates, corrupt).write_bytes(b"not a webp")
    result = corpus.examine(corpus.worklist()[0], batch=1)

    assert result["written"] == 1
    assert [sha256 for sha256, _ in result["unreadable"]] == [corrupt]
    assert set(corpus.frames()) == {good}


# --- the device failing under the pass ---------------------------------------


def faulting_after(count: int, message: str = "CUDA error: an illegal memory access"):
    """A detector whose device dies on the frame after `count` of them.

    Which is what a display driver reset looks like from in here: not this frame's
    fault, and not the next frame's either, because the context is gone.
    """
    asked = []

    def detect(frame):
        asked.append(frame)
        if len(asked) > count:
            raise RuntimeError(message)
        return somebody(0.3)

    detect.asked = asked  # how many frames it was shown, fault included
    return detect


def test_a_device_that_fails_keeps_the_frames_already_looked_at(corpus: Corpus) -> None:
    for seed in "1234":
        corpus.add(seed)
    todo, _ = corpus.worklist()

    result = corpus.examine(todo, detect=faulting_after(3), batch=2)

    # The first batch of two committed; the third frame was detected and the fourth
    # faulted, so the batch it faulted in still stores the one frame it had in hand.
    assert result["written"] == 3
    assert set(corpus.frames()) == set(todo[:3])
    assert "illegal memory access" in result["faulted"]


def test_a_device_that_fails_stops_the_pass_rather_than_every_frame(
    corpus: Corpus,
) -> None:
    """A poisoned context fails identically on every frame after it, so walking on
    would be twenty thousand copies of one message and an hour spent collecting them."""
    for seed in "1234":
        corpus.add(seed)
    detect = faulting_after(1)

    result = corpus.examine(corpus.worklist()[0], detect=detect, batch=1)

    assert result["written"] == 1
    assert len(detect.asked) == 2  # the one it looked at, and the one it died on
    assert result["unreadable"] == []  # a device fault is not the substrate's fault


def test_a_pass_the_device_ended_resumes_at_the_frame_it_ended_on(
    corpus: Corpus,
) -> None:
    shas = {corpus.add(seed) for seed in "1234"}
    corpus.examine(corpus.worklist()[0], detect=faulting_after(2), batch=1)

    resumed, _ = corpus.worklist()
    assert len(resumed) == 2
    assert corpus.examine(resumed, detect=lambda frame: somebody(0.3))["faulted"] is None
    assert set(corpus.frames()) == shas


def test_a_finished_pass_reports_no_fault(corpus: Corpus) -> None:
    corpus.add("1")
    assert corpus.examine(corpus.worklist()[0])["faulted"] is None


# --- the stored share, not the verdict ---------------------------------------


def test_a_face_below_the_provisional_floor_is_stored_with_its_share(
    corpus: Corpus,
) -> None:
    """The whole point of the floor being read-time is that the rows outlive it:
    nothing here is dropped for being small, and nothing records that it was."""
    tiny = FLOOR / 4
    sha256 = corpus.add("1")
    corpus.examine(corpus.worklist()[0], detect=lambda frame: somebody(tiny))

    assert corpus.faces() == [(sha256, 0, pytest.approx(tiny))]
    assert "share" in {row[1] for row in corpus.conn.execute("PRAGMA table_info(face)")}


def test_the_frame_records_the_largest_body_and_how_many(corpus: Corpus) -> None:
    """At any floor, the largest body answers "is somebody in this frame", which is
    the whole of what a body is asked and the reason the others are only counted."""
    sha256 = corpus.add("1")
    corpus.examine(
        corpus.worklist()[0], detect=lambda frame: Found(bodies=[0.2, 0.6, 0.4], faces=[])
    )

    assert corpus.frames() == {sha256: (3, pytest.approx(0.6))}


def test_every_face_of_a_frame_is_stored_and_indexed_by_prominence(
    corpus: Corpus,
) -> None:
    """Each face is a different who, so each keeps its own share -- and `idx` is
    the place in the frame by descending share rather than the detector's own
    output order, so 0 is the most prominent face there."""
    sha256 = corpus.add("1")
    corpus.examine(
        corpus.worklist()[0],
        detect=lambda frame: Found(
            bodies=[0.9],
            faces=[Face(share=share, vector=vector(1.0)) for share in (0.2, 0.4, 0.3)],
        ),
    )

    assert corpus.faces() == [
        (sha256, 0, pytest.approx(0.4)),
        (sha256, 1, pytest.approx(0.3)),
        (sha256, 2, pytest.approx(0.2)),
    ]


def test_the_stored_vector_is_what_the_detector_produced(corpus: Corpus) -> None:
    ramp = np.linspace(0, 1, DIM, dtype=np.float32)
    corpus.add("1")
    corpus.examine(
        corpus.worklist()[0],
        detect=lambda frame: Found(bodies=[0.5], faces=[Face(share=0.2, vector=ramp)]),
    )

    assert np.array_equal(list(people.vectors(corpus.conn).values())[0], ramp)


# --- what a person is --------------------------------------------------------


def test_two_near_identical_faces_are_one_person() -> None:
    faces = {"a:0": vector(1.0, 0.02), "b:0": vector(1.0, 0.0)}
    assignment = cluster(faces, THRESHOLD)

    assert len(set(assignment.values())) == 1


def test_two_orthogonal_faces_are_two_persons() -> None:
    faces = {"a:0": vector(1.0, 0.0), "b:0": vector(0.0, 1.0)}
    assignment = cluster(faces, THRESHOLD)

    assert assignment == {"a:0": "a:0", "b:0": "b:0"}


def test_a_chain_of_near_neighbours_is_not_one_person() -> None:
    """A person is not a chain. Under single linkage this is one cluster, and
    that is exactly the walk from one individual to another across a crowd of
    near-misses that this pass exists to avoid rather than to reproduce."""
    step = np.cos(np.deg2rad(50))  # each neighbour agrees, the ends do not
    faces = {
        "a:0": _at(0.0),
        "b:0": _at(50.0),
        "c:0": _at(100.0),
    }
    assignment = cluster(faces, step - 0.01)

    assert len(set(assignment.values())) > 1
    assert assignment["a:0"] != assignment["c:0"]


def _at(degrees: float) -> np.ndarray:
    """A unit vector at an angle, so a cosine between two is stated rather than
    stumbled on."""
    radians = np.deg2rad(degrees)
    return vector(float(np.cos(radians)), float(np.sin(radians)))


def test_the_same_vectors_cluster_to_the_same_names_twice() -> None:
    faces = {name(sha_of(seed), 0): _at(angle) for seed, angle in zip("abcd", (0, 3, 90, 93))}

    assert cluster(faces, THRESHOLD) == cluster(faces, THRESHOLD)


def test_a_person_is_named_by_its_least_face() -> None:
    """Content-addressed, so `archive.pipeline.group` reassigning every tile id
    cannot invalidate the clustering: the name is the frame's bytes and the
    face's place in it, and neither moves."""
    early, late = name(sha_of("0"), 0), name(sha_of("f"), 1)
    assignment = cluster({late: _at(1.0), early: _at(0.0)}, THRESHOLD)

    assert set(assignment.values()) == {early}


def test_a_person_survives_every_tile_id_being_reassigned(corpus: Corpus) -> None:
    """The content-addressing claim, made against the thing that breaks ids:
    `archive.pipeline.group` rebuilds `photo` on every Apply to grid and hands out
    fresh ones. The bytes do not move, so neither does any person."""
    corpus.add("1")
    corpus.add("2")
    corpus.examine(corpus.worklist()[0], detect=_two_faces([_at(0.0), _at(1.0)]))
    cluster_all(corpus.conn)
    before = corpus.persons()

    corpus.conn.execute("UPDATE photo SET id = id + 1000")
    corpus.conn.commit()
    corpus.conn.execute("DELETE FROM face_person")
    cluster_all(corpus.conn)

    assert corpus.persons() == before
    assert len(set(before.values())) == 1


def test_a_different_threshold_is_a_different_population(corpus: Corpus) -> None:
    """Moving the threshold adds a population rather than overwriting one, which
    is `stack_member`'s discipline and the reason it is part of the key."""
    corpus.add("1")
    corpus.add("2")
    corpus.examine(
        corpus.worklist()[0],
        detect=_two_faces([_at(0.0), _at(50.0)]),
    )
    cluster_all(corpus.conn, 0.99)
    cluster_all(corpus.conn, 0.1)

    assert len(set(corpus.persons(0.99).values())) == 2
    assert len(set(corpus.persons(0.1).values())) == 1


def _two_faces(vectors: list[np.ndarray]):
    """A detector handing out one of `vectors` per frame, in call order."""
    handed = iter(vectors)

    def detect(frame: np.ndarray) -> Found:
        return Found(bodies=[0.9], faces=[Face(share=0.3, vector=next(handed))])

    return detect


def test_clustering_an_empty_library_is_not_an_error() -> None:
    assert cluster({}, THRESHOLD) == {}


# --- the cut: which faces are evidence about who somebody is -----------------


def test_a_face_under_the_cut_is_in_no_person() -> None:
    """The cut narrows the population before the agglomeration sees it, so a box
    too small to place a face in is in nobody rather than in whoever else landed
    in the same noise."""
    faces = {"a:0": vector(1.0), "b:0": vector(1.0)}
    boxes = {"a:0": 0.4, "b:0": CUT / 2}

    assert reaching(boxes) == {"a:0"}
    assert cluster({key: faces[key] for key in reaching(boxes)}, THRESHOLD) == {"a:0": "a:0"}


def test_a_face_exactly_at_the_cut_is_evidence() -> None:
    """At or above, which is `FLOOR`'s convention and the threshold's: the cut is
    the least share that still says something about who somebody is."""
    assert reaching({"a:0": CUT, "b:0": CUT - 0.001}) == {"a:0"}


def test_nothing_is_cut_at_no_cut() -> None:
    """The value the population clustered before the cut existed was made at, and
    a real setting rather than a stand-in for one: `face.share` is greater than
    zero by construction, so every face reaches it."""
    assert reaching({"a:0": 1e-6}, NO_CUT) == {"a:0"}


def test_a_cut_is_a_different_agglomeration_and_not_a_filter() -> None:
    """The finding ADR 0004 records as a property of the method rather than a
    rounding error: complete linkage's merge order depends on every cluster at
    once, so dropping *another* person's small faces moves where this one's joins
    are made. Here two faces are one person while a fourth small one is in the
    population and come apart once it is cut -- which is why the cut has to be a
    written population and could never be a filter over an assignment already
    made.

    At 60 degrees: a agrees with b and with c, b does not agree with c, and the
    small face agrees with c alone. So c pairs off with the small face first and
    leaves a free to take b; cut the small face and c takes a instead.
    """
    a, b, c, small = (name(sha_of(seed), 0) for seed in "1234")
    faces = dict(zip((a, b, c, small), (_at(0.0), _at(58.0), _at(-40.0), _at(-70.0))))
    boxes = {a: 0.4, b: 0.4, c: 0.4, small: CUT / 2}
    threshold = 0.5

    whole = cluster(faces, threshold)
    tight = cluster({key: faces[key] for key in reaching(boxes)}, threshold)

    assert whole[a] == whole[b]
    assert tight[a] != tight[b]


def test_the_cut_is_part_of_the_key(corpus: Corpus) -> None:
    """User story 3: a population clustered at one cut can never be compared
    against another, which is `stack_member`'s discipline and the reason this is a
    column and not a `WHERE`."""
    assert key_of(corpus.conn, "face_person") == [
        "model",
        "version",
        "threshold",
        "cut",
        "sha256",
        "idx",
    ]


def test_a_different_cut_is_a_different_population(corpus: Corpus) -> None:
    sha256 = corpus.add("1")
    corpus.examine(corpus.worklist()[0], detect=lambda frame: somebody(0.4, CUT / 2))
    cluster_all(corpus.conn, THRESHOLD, NO_CUT)
    cluster_all(corpus.conn, THRESHOLD, CUT)

    assert set(corpus.persons(cut=NO_CUT)) == {name(sha256, 0), name(sha256, 1)}
    assert set(corpus.persons(cut=CUT)) == {name(sha256, 0)}


def test_a_face_under_the_cut_keeps_its_row_and_gets_no_person(corpus: Corpus) -> None:
    """Nothing re-detects and nothing is deleted: the face keeps its share and its
    vector and simply has no person at this cut, which is `face_person`'s existing
    shape rather than a new one."""
    tiny = CUT / 2
    sha256 = corpus.add("1")
    corpus.examine(corpus.worklist()[0], detect=lambda frame: somebody(0.4, tiny))
    result = cluster_all(corpus.conn)

    assert corpus.faces() == [
        (sha256, 0, pytest.approx(0.4)),
        (sha256, 1, pytest.approx(tiny)),
    ]
    assert set(corpus.persons()) == {name(sha256, 0)}
    assert (result["faces"], result["written"], result["under"]) == (1, 1, 1)


def test_a_second_clustering_at_the_same_cut_writes_nothing(corpus: Corpus) -> None:
    """The trap the cut introduces: a face under it is never owed a person, so a
    resume asking about every stored face would re-cluster on every run."""
    corpus.add("1")
    corpus.examine(corpus.worklist()[0], detect=lambda frame: somebody(0.4, CUT / 2))
    cluster_all(corpus.conn)

    assert cluster_all(corpus.conn)["written"] == 0


def test_a_new_cut_re_examines_nothing_and_moves_no_face_row(corpus: Corpus) -> None:
    """User story 4: a cut is a matrix multiply and not a rebuild. The share and
    the vector live in `face`, which the cut is not part of the key of."""
    corpus.add("1")
    corpus.examine(corpus.worklist()[0], detect=lambda frame: somebody(0.4, CUT / 2))
    cluster_all(corpus.conn, THRESHOLD, CUT)
    before = corpus.faces()

    assert corpus.worklist() == ([], [])
    assert cluster_all(corpus.conn, THRESHOLD, NO_CUT)["written"] == 2
    assert corpus.faces() == before


# --- the two stages ----------------------------------------------------------


def test_clustering_fills_in_a_person_for_every_face(corpus: Corpus) -> None:
    corpus.add("1")
    corpus.add("2")
    corpus.examine(corpus.worklist()[0], detect=lambda frame: somebody(0.3))
    result = cluster_all(corpus.conn)

    assert (result["faces"], result["written"], result["persons"]) == (2, 2, 1)
    assert len(corpus.persons()) == 2


def test_a_second_clustering_at_the_same_threshold_writes_nothing(corpus: Corpus) -> None:
    corpus.add("1")
    corpus.examine(corpus.worklist()[0], detect=lambda frame: somebody(0.3))
    cluster_all(corpus.conn)

    assert cluster_all(corpus.conn)["written"] == 0


def test_a_face_detected_after_a_clustering_is_clustered_by_the_next(
    corpus: Corpus,
) -> None:
    """A clustering is a reading of every vector at once, so a new face does not
    join a person -- it changes which persons there are."""
    corpus.add("1")
    corpus.examine(corpus.worklist()[0], detect=lambda frame: somebody(0.3))
    cluster_all(corpus.conn)

    corpus.add("2")
    corpus.examine(corpus.worklist()[0], detect=lambda frame: somebody(0.3))

    assert cluster_all(corpus.conn)["written"] == 2


def test_a_new_threshold_does_not_re_examine_a_single_frame(corpus: Corpus) -> None:
    """The vector is not keyed by the threshold, which is the whole reason the
    two stages are separate tables."""
    corpus.add("1")
    corpus.examine(corpus.worklist()[0], detect=lambda frame: somebody(0.3))
    cluster_all(corpus.conn, 0.5)

    assert corpus.worklist() == ([], [])
    assert cluster_all(corpus.conn, 0.2)["written"] == 1


# --- the report --------------------------------------------------------------


def test_spread_says_how_many_persons_and_how_often_they_appear() -> None:
    assert spread([]) == "no person found"
    assert "3 persons" in spread([5, 2, 1])
    assert "largest 5" in spread([5, 2, 1])
    assert "1 seen once" in spread([5, 2, 1])


def test_read_shrinks_a_frame_to_the_working_edge_and_never_grows_one(
    corpus: Corpus,
) -> None:
    wide = read(corpus.write_substrate(sha_of("1"), size=(3000, 1000)))
    small = read(corpus.write_substrate(sha_of("2"), size=(60, 40)))

    assert (wide.shape[1], wide.dtype) == (people.SIDE, np.uint8)
    assert small.shape[:2] == (40, 60)


# --- the command -------------------------------------------------------------


def synthetic_config(tmp_path: Path, migrated: tuple[Path, Path]) -> Config:
    """A config whose every `G:` path points at something that does not exist.

    This is the "never opens a path under the vault" criterion made testable: a
    pass that touched any of them would fail here rather than pass quietly.
    """
    catalog, state = migrated
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
        thumb_root=tmp_path / "thumb",
        substrate_root=tmp_path / "substrate",
        catalog_db=catalog,
        state_db=state,
        backup_root=tmp_path / "backups",
        reveal_root=absent / "vault",
        restic_password_command="false",
    )


def test_run_examines_and_clusters_without_opening_the_vault(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    for seed in "123":
        corpus.add(seed)
    orphan = corpus.add("4", substrate=False)
    corpus.conn.close()

    assert people.run(synthetic_config(tmp_path, migrated), detect=lambda f: somebody(0.3)) == 0

    report = capsys.readouterr().out
    assert "3 tiles to examine" in report
    assert orphan in report  # named, not silently a tile with no answer
    assert "3 frames hold a body" in report
    assert "1 persons" in report


def test_run_never_attaches_the_state_database(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    """An experiment has no business reaching the irreplaceable triage decisions,
    and the safest thing is that there be no name for them."""
    corpus.add("1")
    corpus.conn.close()
    config = synthetic_config(tmp_path, migrated)

    conn = candidates.catalog(config.catalog_db)
    try:
        assert "state" not in {row[1] for row in conn.execute("PRAGMA database_list")}
    finally:
        conn.close()
    assert people.run(config, detect=lambda f: NOBODY) == 0


def test_run_refuses_while_a_writer_holds_the_catalog(
    corpus: Corpus, tmp_path: Path, migrated
) -> None:
    """Invariant 6, borrowed whole from `photolib.candidates` rather than restated."""
    corpus.add("1")
    corpus.conn.close()
    config = synthetic_config(tmp_path, migrated)

    writer = candidates.catalog(config.catalog_db)
    writer.execute("BEGIN IMMEDIATE")
    try:
        with pytest.raises(PeopleRefused, match="another writer holds the catalog"):
            people.run(config, detect=lambda f: NOBODY)
    finally:
        writer.execute("ROLLBACK")
        writer.close()


def test_run_says_so_when_there_is_nothing_to_do(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    """And gets there without loading a model: `detect` is left unset, so a pass
    that reached for one would raise rather than quietly download 200 MB."""
    corpus.add("1")
    corpus.examine(corpus.worklist()[0])
    cluster_all(corpus.conn)
    corpus.conn.close()

    assert people.run(synthetic_config(tmp_path, migrated)) == 0
    assert "nothing to examine" in capsys.readouterr().out


def test_run_reports_a_substrate_that_would_not_decode(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    corrupt = corpus.add("1")
    substrate_path(corpus.substrates, corrupt).write_bytes(b"not a webp")
    corpus.conn.close()

    assert people.run(synthetic_config(tmp_path, migrated), detect=lambda f: NOBODY) == 1
    assert corrupt in capsys.readouterr().out


def test_run_says_the_device_failed_and_clusters_nothing(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    """The persons of the fraction the pass reached are not this library's persons,
    so the report that would name them is not printed."""
    for seed in "123":
        corpus.add(seed)
    corpus.conn.close()

    code = people.run(synthetic_config(tmp_path, migrated), detect=faulting_after(1))

    report = capsys.readouterr().out
    assert code == 2
    assert "the detector's device failed" in report
    assert "illegal memory access" in report
    assert "persons" not in report

    conn = candidates.catalog(migrated[0])
    try:
        assert len(examined(conn)) == 1  # and the one frame it did look at is stored
        assert conn.execute("SELECT count(*) FROM face_person").fetchone()[0] == 0
    finally:
        conn.close()


def test_run_refuses_a_cut_below_zero_before_looking_at_anything(
    corpus: Corpus, tmp_path: Path, migrated
) -> None:
    """Before, and not after: the column's own CHECK fires once the detection pass
    has run and committed, so a mistyped cut would cost the pass and end in a
    traceback instead of a refusal."""
    corpus.add("1")
    corpus.conn.close()

    with pytest.raises(PeopleRefused, match="a share of the frame's height"):
        people.run(synthetic_config(tmp_path, migrated), detect=lambda f: NOBODY, cut=-0.5)

    conn = candidates.catalog(migrated[0])
    try:
        assert examined(conn) == set()  # the tile was there to look at and was not
    finally:
        conn.close()


def test_run_refuses_without_a_substrate_tree(tmp_path: Path, migrated) -> None:
    with pytest.raises(PeopleRefused, match="substrate tree not found"):
        people.run(synthetic_config(tmp_path, migrated))


def test_run_honours_a_limit(corpus: Corpus, tmp_path: Path, migrated) -> None:
    for seed in "123":
        corpus.add(seed)
    corpus.conn.close()

    assert people.run(synthetic_config(tmp_path, migrated), detect=lambda f: NOBODY, limit=2) == 0

    conn = candidates.catalog(migrated[0])
    try:
        assert len(examined(conn)) == 2
    finally:
        conn.close()


def test_run_names_every_missing_tile_rather_than_the_first_few(
    corpus: Corpus, tmp_path: Path, migrated, capsys
) -> None:
    corpus.add("ff")
    orphans = {corpus.add(f"{n:02x}", substrate=False) for n in range(25)}
    corpus.conn.close()

    people.run(synthetic_config(tmp_path, migrated), detect=lambda f: NOBODY)

    report = capsys.readouterr().out
    assert all(orphan in report for orphan in orphans)
    assert "more" not in report
