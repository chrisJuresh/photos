"""Finds the people: whether somebody is in a frame, and which persons those are.

`docs/adr/0003-stack-on-verified-match.md` names the one failure the geometry
cannot fix, and it is the worst one there is: a set of frames of the same place
where the difference is *who is in them*. The Match counts distinctive points that
agree under one transform and the fingerprint is a vector describing roughly what a
frame shows. Neither has any notion of a person, so neither can express the
reader's own rule -- photographs of one subject, and a subject is mostly a person.

This pass is the fourth of its kind and is shaped like the three before it. It
gives every published tile two facts and changes nothing a reader can see:

- **Whether there is somebody in it**, read off *bodies* rather than faces, so that
  the back of a head counts and a landscape does not.
- **Which persons are in it**, from face detection, face embedding and clustering
  -- a *person* being one cluster of faces this pass decided are the same
  individual, with no name attached to it.

**The measurement is stored and the verdict is derived**, which is
`photolib.candidates`' discipline: every box records its share of the frame and
nothing records whether that share was enough, so moving the prominence floor is a
re-read of these rows rather than another pass. `FLOOR` below is provisional and is
the only place that reads it.

**The one number that cannot work that way is the size cut**, and that is why it is
in the key rather than beside it. Only the faces whose stored share reaches `CUT`
are clustered, because at under two per cent of a frame's height there are too few
pixels for SFace to place a face anywhere meaningful and complete linkage merges
whatever lands in the same noise -- the failure
`docs/adr/0004-people-veto-a-stack.md` found the reader flagging a third of their
queue over. A later reader cannot filter it away afterwards: two faces merged
because a third small one sat between them stay merged, and the merge order depends
on every cluster at once, so a cut is a different agglomeration and not a subset of
an old one. A face under it keeps its row in `face` and simply has no person at that
cut.

Three models, all local, all fetched once and cached beside DINOv2's weights in
`torch.hub`'s own checkpoint directory. **No photograph leaves this disk**, and no
name is attached to any cluster -- the pass produces "person 4f2a...", not "Chris".

- Bodies: torchvision's Faster R-CNN ResNet50 FPN v2 at its COCO weights, of whose
  91 categories exactly one is read.
- Faces: YuNet, 233 KB of ONNX, run through the OpenCV `photolib.matches` already
  depends on. It returns five landmarks per face, which is what lets the embedder
  align a crop rather than embed whatever the box happened to contain.
- Face vectors: SFace, 128 dimensions from 37 MB, L2-normalised on the way in for
  `photolib.fingerprints`' reason -- the cosine a clustering wants is then a dot
  product and no consumer has to remember to normalise.

Both ONNX files are pinned to one commit of `opencv/opencv_zoo` and checked against
the digest recorded below, because "the file at that URL today" is not a model
identity and a silently different one would be a silently different population.

**Neither model is an import of the website**, which reads stored numbers only --
the relationship `ffmpeg` and `exiftool` already have with the pipeline. `torch`,
`torchvision` and the weights are all deferred into `load_detector`, so a finished
pass with nothing to do never loads one.

The pass reads the substrate tree and the catalog, both on the NVMe. **It never
opens a path under `G:`** and `state.sqlite3` is not even attached, so it can
neither collide with anything reading the vault nor endanger the triage decisions.

Resumable in two stages and idempotent, in the shape `photolib.fingerprints`
established. Detection is resumed by the frames carrying no row; clustering is a
reading of every vector at once and is redone when a vector the cut keeps has no
person at the threshold in hand. `--threshold` and `--cut` cluster into a new
population without re-detecting anything, because both are part of `face_person`'s
key and neither is part of `face`'s.

**A device fault is one of those interruptions and is reported as one.** The card
this pass runs on is also the one drawing the desktop, and Windows resets that driver
when a graphics command outstays its timeout -- which kills every CUDA context on the
card, mid-pass and through no fault of the frame being looked at. There is nothing to
retry in this process, because a lost context poisons every call after it, so the
frames in hand are stored and the pass stops and says the device failed, rather than
ending in a traceback that leaves it unclear whether anything was kept. It exits 2
there, and clusters nothing: a clustering of the fraction of the vectors the pass
reached would be reported as this library's persons without being them.

`photolib.membership` is what reads these rows: ADR 0004's veto takes a frame's
people from `face_person` at `FLOOR`, and its presence from `frame_body`. Nothing
here applies any of it -- no stack is split and no cover moves by writing a row --
and moving `FLOOR` moves what that rule reads without touching anything stored.
"""

from __future__ import annotations

import argparse
import hashlib
import heapq
import sqlite3
import sys
import time
from collections.abc import Callable, Iterator, Mapping, Sequence
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image

from photolib import candidates
from photolib.config import Config, load, substrate_path
from photolib.fingerprints import from_blob, to_blob
from photolib.substrates import present

# What produced these rows, on every row it produced. One string for three models,
# because they are one answer: a frame's people are what all three said together,
# and a change to any of them is a change to the population.
MODEL = "fasterrcnn_v2+yunet+sface"
# Bumped when the weights, the preprocessing or either confidence floor below
# change. All three decide which detections exist at all, so all three are part of
# what "this model said" means: a sub-threshold detection is not stored, so moving a
# floor cannot be answered by a re-read the way moving `FLOOR` can.
VERSION = "1"
DIM = 128  # SFace's embedding

SIDE = 1024  # the long edge a substrate is read at, `photolib.matches`' own

# The cosine at or above which two faces are the same individual. SFace's own
# published threshold, and the default rather than the truth: it is part of
# `face_person`'s key precisely so that another value is another population.
THRESHOLD = 0.363

# **Provisional, and the only line in this repository that reads it.** A box counts
# as somebody when it is at least this much of the frame's height. The next two
# tickets settle it from the reader's own answers, and they can, because every share
# is stored and nothing stored is derived from this number.
FLOOR = 0.10

# The least box a face has to be to be evidence about *who somebody is*: under this
# it is clustered into nobody. Provisional, and carried with the measurement that
# chose it -- `harness.recluster` clustered at 0.363 over the faces reaching each
# candidate value and 0.02 is the largest that drops no box of any friend the reader
# answered about. It takes 9 of the 69 clusters they flagged as several passers-by
# out of the population entirely and splits 27 more, for 2 fragmented friends, where
# no threshold could buy 34 without breaking 16: the flagged clusters' median box is
# 0.018 against the friends' 0.137, so a size is the axis the two populations
# separate on and a similarity is not.
#
# **Not `FLOOR`, and deliberately a second constant** at provisionally the same kind
# of value: `FLOOR` decides whether a person is in a frame's *people*, this decides
# whether a face says anything about who somebody is. The same report prices 0.10
# here at 624 of those friends' boxes and 0.02 at none.
#
# **Unlike `FLOOR` it cannot be moved by re-reading rows**, which is why it is part
# of `face_person`'s key: the clustering is the thing it changes. Two faces merged
# because a third small one sat between them stay merged whatever a later reader
# filters, and complete linkage's merge order depends on every cluster at once, so a
# cut is a different agglomeration and not a subset of an old one.
CUT = 0.02

# What a population clustered before the cut existed was cut at: nothing. A real
# value of the column rather than a stand-in for one -- every face there was, which
# is the population every answer in `labels.sqlite3` was given about.
NO_CUT = 0.0

# The two confidence floors, which are part of `VERSION` and not read-time knobs:
# what falls under them is never stored, so unlike `FLOOR` they cannot be moved by
# re-reading rows.
BODY_SCORE = 0.7  # a person, at the body detector's own confidence
FACE_SCORE = 0.7  # a face, at YuNet's
PERSON = 1  # of the COCO categories the body detector was trained on

BATCH = 32  # frames per transaction
DECODE_WORKERS = 8
PROGRESS_SECONDS = 30

# One commit of opencv/opencv_zoo, and the digest of each file at it. Pinned rather
# than tracked, for the module docstring's reason. The `github.com/.../raw/` form is
# deliberate: these are git-lfs objects, and `raw.githubusercontent.com` serves the
# 131-byte pointer instead of the model.
ZOO = "47534e27c9851bb1128ccc0102f1145e27f23f98"
YUNET = (
    "models/face_detection_yunet/face_detection_yunet_2023mar.onnx",
    "8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4",
)
SFACE = (
    "models/face_recognition_sface/face_recognition_sface_2021dec.onnx",
    "0ba9fbfa01b5270c96627c4ef784da859931e02f04419c829e83484087c34e79",
)


class PeopleRefused(RuntimeError):
    """Raised before anything is stored. Nothing was written."""


# --- what gets looked at -----------------------------------------------------

# Every published photograph the clock can place, which is `photolib.candidates`'
# population narrowed by the two things this pass cannot answer for. A video is out
# for `photolib.fingerprints`' reason -- nothing detects a person in one and nothing
# needs to -- and a tile the filesystem dated is out because a copy date is not when
# the photograph was taken, so it is nobody's neighbour and no rule about people
# could use it.
#
# DISTINCT and ordered by sha256, both for `fingerprints.photograph_shas`' reasons:
# nothing in the schema stops two tiles naming one frame, and a stable order is what
# lets an interrupted pass resume rather than wander.
_PHOTOGRAPHS_QUERY = f"""
SELECT DISTINCT p.rep_sha256 FROM photo AS p
JOIN file AS f ON f.sha256 = p.rep_sha256
WHERE f.state = 'published' AND f.kind IS NOT 'video' AND {candidates.STACKABLE}
ORDER BY p.rep_sha256
"""

_EXAMINED = "SELECT sha256 FROM frame_body WHERE model = ? AND version = ?"

_INSERT_FRAME = """
INSERT OR REPLACE INTO frame_body (model, version, sha256, bodies, share)
VALUES (?, ?, ?, ?, ?)
"""

_INSERT_FACE = """
INSERT OR REPLACE INTO face (model, version, sha256, idx, share, vector)
VALUES (?, ?, ?, ?, ?, ?)
"""

_VECTORS = "SELECT sha256, idx, vector FROM face WHERE model = ? AND version = ?"

_SHARES = "SELECT sha256, idx, share FROM face WHERE model = ? AND version = ?"

_ASSIGNED = """
SELECT sha256, idx FROM face_person
WHERE model = ? AND version = ? AND threshold = ? AND cut = ?
"""

_INSERT_PERSON = """
INSERT OR REPLACE INTO face_person (model, version, threshold, cut, sha256, idx, person)
VALUES (?, ?, ?, ?, ?, ?, ?)
"""

_PEOPLED = """
SELECT count(*) FROM frame_body WHERE model = ? AND version = ? AND share >= ?
"""

_APPEARANCES = """
SELECT person, count(*) FROM face_person
WHERE model = ? AND version = ? AND threshold = ? AND cut = ? GROUP BY person
"""


def photograph_shas(conn: sqlite3.Connection) -> list[str]:
    """Every tile this pass owes an answer about, in order."""
    return [sha256 for (sha256,) in conn.execute(_PHOTOGRAPHS_QUERY)]


def examined(conn: sqlite3.Connection, model: str = MODEL, version: str = VERSION) -> set[str]:
    """Every frame this detector has already looked at. One query, not N probes.

    A frame it looked at and found nobody in is in here, which is the whole reason
    `frame_body` carries a row for one: "checked and empty" has to be a different
    fact from "never checked" or the pass cannot be resumed.
    """
    return {sha256 for (sha256,) in conn.execute(_EXAMINED, (model, version))}


def worklist(
    conn: sqlite3.Connection,
    substrate_root: Path,
    *,
    model: str = MODEL,
    version: str = VERSION,
) -> tuple[list[str], list[str]]:
    """What is left to examine, and which tiles have no substrate to examine.

    Both, and separately, for `fingerprints.worklist`'s reason: the first shrinks to
    nothing as the pass runs and the second is a hole in the derivative tree that
    stays and must keep being said.
    """
    done = examined(conn, model, version)
    on_disk = present(substrate_root)
    todo, missing = [], []
    for sha256 in photograph_shas(conn):
        if sha256 in done:
            continue
        (todo if sha256 in on_disk else missing).append(sha256)
    return todo, missing


# --- what a frame holds ------------------------------------------------------


@dataclass(frozen=True)
class Face:
    """One detected face: how big it was, and what it looked like.

    `share` is the box's height over the frame's, which is the fraction `FLOOR` is
    a fraction of. Stored and never applied.
    """

    share: float
    vector: np.ndarray


@dataclass(frozen=True)
class Found:
    """What one detector saw in one frame. Empty is an answer and not a gap."""

    bodies: list[float]  # each body's share of the frame's height
    faces: list[Face]  # in whatever order the detector found them; `indexed` orders

    @property
    def indexed(self) -> list[tuple[int, Face]]:
        """The faces by descending share, which is what `idx` means.

        Ordered here rather than by the detector, so that `idx` is a fact about the
        photograph and not about a model's output conventions: 0 is the most
        prominent face in the frame whichever detector found it.
        """
        return list(enumerate(sorted(self.faces, key=lambda face: -face.share)))

    @property
    def largest(self) -> float:
        """The largest body's share, or zero where there is no body.

        The largest is all that is stored, and deliberately: *is somebody in this
        frame* is what a body is asked, and at any floor the largest body answers
        it. Each face's share is kept individually, because there the question is
        who, and each face is a different who.
        """
        return max(self.bodies, default=0.0)


Detector = Callable[[np.ndarray], Found]


def read(path: Path) -> np.ndarray:
    """One substrate as the detectors want it: RGB, long edge `SIDE`.

    `thumbnail` only ever shrinks, so a substrate smaller than `SIDE` is read at its
    own size rather than enlarged into detail it does not have. `photolib.matches`
    reads at the same edge and for the same reason: 1536px is more frame than either
    model looks at, and the decode is the expensive half of the pass.
    """
    with Image.open(path) as image:
        frame = image.convert("RGB")
        frame.thumbnail((SIDE, SIDE), Image.BICUBIC)
        return np.asarray(frame)


def weights(rel: str, digest: str, pin: str = ZOO) -> Path:
    """One pinned ONNX file, fetched once into `torch.hub`'s cache and verified.

    The pin rides in the filename so that moving it fetches rather than reuses, and
    the digest is checked on the way in: a model identity that is really "whatever
    was at that URL" is not an identity, and `MODEL` would be recording a fiction.
    """
    import torch

    directory = Path(torch.hub.get_dir()) / "checkpoints"
    directory.mkdir(parents=True, exist_ok=True)
    target = directory / f"{pin[:7]}_{rel.rsplit('/', 1)[-1]}"
    if not target.exists():
        torch.hub.download_url_to_file(
            f"https://github.com/opencv/opencv_zoo/raw/{pin}/{rel}", target, progress=False
        )
    found = hashlib.sha256(target.read_bytes()).hexdigest()
    if found != digest:
        # Unlinked before refusing, or a download truncated once refuses for ever:
        # the cache would keep answering with the broken file and the next run would
        # not re-fetch it.
        target.unlink()
        raise PeopleRefused(f"{target.name} hashed to {found}, not the pinned {digest}")
    return target


def load_detector() -> Detector:
    """The three models as one callable from a frame to what is in it.

    A seam for `fingerprints.load_encoder`'s reason, which is the load-bearing one:
    **no test in this suite loads a model**, so the pass is exercised through a
    stand-in and what is asserted is the worklist, the resume, the schema and the
    report rather than a model's opinion of a photograph. `torch`, `torchvision` and
    170 MB of weights are all deferred to here for the same reason.
    """
    import cv2
    import torch
    from torchvision.models.detection import (
        FasterRCNN_ResNet50_FPN_V2_Weights,
        fasterrcnn_resnet50_fpn_v2,
    )

    detect = cv2.FaceDetectorYN.create(
        str(weights(*YUNET)), "", (SIDE, SIDE), score_threshold=FACE_SCORE
    )
    embed = cv2.FaceRecognizerSF.create(str(weights(*SFACE)), "")
    bodies = fasterrcnn_resnet50_fpn_v2(
        weights=FasterRCNN_ResNet50_FPN_V2_Weights.COCO_V1, box_score_thresh=BODY_SCORE
    )
    device = "cuda" if torch.cuda.is_available() else "cpu"
    bodies.eval().to(device)

    def found(frame: np.ndarray) -> Found:
        height = frame.shape[0]
        # `ascontiguousarray` rather than the transposed view: Pillow decodes into a
        # read-only buffer and a transpose of one is not contiguous either, both of
        # which torch takes only under protest.
        planes = np.ascontiguousarray(frame.transpose(2, 0, 1))
        tensor = torch.from_numpy(planes).to(device).float().div_(255.0)
        with torch.inference_mode():
            boxed = bodies([tensor])[0]
        people = boxed["boxes"][boxed["labels"] == PERSON].cpu().numpy()

        # YuNet and SFace both read BGR, which is OpenCV's own order and not the
        # one Pillow decodes into. A reversed view is not contiguous and cv2 will
        # not take one, so this is a copy rather than a slice.
        bgr = np.ascontiguousarray(frame[:, :, ::-1])
        detect.setInputSize((frame.shape[1], frame.shape[0]))
        _, rows = detect.detect(bgr)
        faces = []
        for row in [] if rows is None else rows:
            # Aligned on YuNet's five landmarks rather than cropped to its box,
            # which is what the landmarks are returned for: SFace was trained on
            # faces squared up this way and embeds a tilted one as a stranger.
            aligned = embed.alignCrop(bgr, row)
            faces.append(Face(share=float(row[3]) / height, vector=unit(embed.feature(aligned)[0])))
        return Found(bodies=[float(box[3] - box[1]) / height for box in people], faces=faces)

    return found


def unit(vector: np.ndarray) -> np.ndarray:
    """One vector L2-normalised, so that a cosine between two is a dot product."""
    vector = np.asarray(vector, dtype=np.float32)
    norm = float(np.linalg.norm(vector))
    return vector if norm == 0.0 else vector / norm


# --- the persons -------------------------------------------------------------


def name(sha256: str, idx: int) -> str:
    """One face's name: the frame it is in and where in the frame it is.

    Content-addressed and never a row id, for `stack_member`'s reason:
    `archive.pipeline.group` reassigns every tile id on each Apply to grid without
    changing a byte, and who is in a photograph is a property of its bytes.
    """
    return f"{sha256}:{idx}"


def _unname(key: str) -> tuple[str, int]:
    """A face's name back into the two columns it is stored under."""
    sha256, idx = key.rsplit(":", 1)
    return sha256, int(idx)


def reaching(boxes: Mapping[str, float], cut: float = CUT) -> set[str]:
    """The faces a cut clusters: the ones whose stored box share reaches it.

    Pure over the stored shares and separate from `cluster`, which stays pure over
    vectors and knows nothing about how big anything was. The two compose in
    `cluster_all` and in `harness.recluster`, which prices this predicate at every
    candidate value and reads it from here rather than keeping its own.

    At or above, which is `FLOOR`'s convention and the threshold's.
    """
    return {face for face, share in boxes.items() if share >= cut}


def cluster(
    vectors: Mapping[str, np.ndarray], threshold: float = THRESHOLD
) -> dict[str, str]:
    """Faces into persons: each face's name against the name of its person.

    Pure over vectors, and separate from the pass for the reason `matches.match` is
    separate from `matches.check_all`: *these two faces are one individual* is a
    claim worth asserting on its own, over vectors a test constructs.

    **Complete linkage, so that a person is not a chain.** Two clusters join only
    when every face of one is within `threshold` of every face of the other, and the
    joins are made in the order a complete-linkage agglomeration makes them: the pair
    whose worst cross-similarity is best, first. Single linkage would walk a
    resemblance from one individual to another across a crowd of near-misses, which
    is the failure this whole pass exists to avoid rather than to reproduce.

    A person is named by its least face, which is `name`'s ordering and therefore
    the frame's sha256 and the face's index within it. So the same vectors clustered
    twice produce the same names, and a rebuild that reassigns every tile id leaves
    every name where it was.
    """
    names = sorted(vectors)
    if not names:
        return {}
    matrix = np.stack([unit(vectors[key]) for key in names])

    # Cluster state, keyed by the index of the cluster's least member so that the
    # key is already the name: who is in it, and what it is joined to.
    members: dict[int, list[int]] = {i: [i] for i in range(len(names))}
    joined: dict[int, dict[int, tuple[int, float]]] = {i: {} for i in range(len(names))}
    queue: list[tuple[float, int, int]] = []

    def offer(a: int, b: int) -> None:
        """Queue a pair, best worst-similarity first, if every cross pair agrees.

        The indices ride in the entry after the similarity, which is what breaks a
        tie: they are positions in a sorted list of names, so two equally good
        merges are always made in the same order.
        """
        edges, worst = joined[a][b]
        if edges == len(members[a]) * len(members[b]):
            heapq.heappush(queue, (-worst, a, b))

    for a, b, similarity in _above(matrix, threshold):
        joined[a][b] = joined[b][a] = (1, similarity)
    for a in list(joined):
        for b in joined[a]:
            if a < b:
                offer(a, b)

    while queue:
        negated, a, b = heapq.heappop(queue)
        # Three ways an entry goes stale, and all three are dropped rather than
        # repaired, because every merge re-offers the whole neighbourhood of the
        # cluster it made: one side has been absorbed, the pair is no longer
        # complete, or -- the one that is easy to miss -- **the pair is still
        # complete but has got worse**, because a merge on either side brought in a
        # face further away than the two this entry was queued for. Honouring the
        # queued figure there would make the merges in the wrong order, which is a
        # different clustering and not merely a slower one.
        if a not in members or b not in members or b not in joined[a]:
            continue
        edges, worst = joined[a][b]
        if worst != -negated or edges != len(members[a]) * len(members[b]):
            continue
        kept = min(a, b)
        _absorb(members, joined, kept, max(a, b))
        for other in joined[kept]:
            offer(*sorted((kept, other)))

    return {
        names[member]: names[root] for root, group in members.items() for member in group
    }


def _absorb(
    members: dict[int, list[int]],
    joined: dict[int, dict[int, tuple[int, float]]],
    kept: int,
    gone: int,
) -> None:
    """Fold one cluster into another, carrying both sides' edges with it.

    The counts add and the worst similarities take the worse of the two, which is
    what makes "every cross pair agrees" answerable without re-reading the vectors.
    """
    members[kept] += members.pop(gone)
    for other, (edges, worst) in joined.pop(gone).items():
        if other == kept:
            continue
        joined[other].pop(gone)
        before = joined[kept].get(other)
        merged = (edges, worst) if before is None else (before[0] + edges, min(before[1], worst))
        joined[kept][other] = joined[other][kept] = merged
    joined[kept].pop(gone, None)


def _above(
    matrix: np.ndarray, threshold: float, chunk: int = 1024
) -> Iterator[tuple[int, int, float]]:
    """Every pair of vectors at or above `threshold`, in blocks rather than at once.

    A dense similarity matrix over this library's faces would be gigabytes; the
    pairs that clear the threshold are a small fraction of it, and they are all the
    clustering ever looks at. The block size is a memory figure and not a speed one
    -- the multiply is the same work whatever it is cut into -- so it is small
    enough that one block stays in the hundred-megabyte range at any face count this
    library will reach.
    """
    for start in range(0, len(matrix), chunk):
        block = matrix[start : start + chunk] @ matrix.T
        rows, cols = np.nonzero(block >= threshold)
        for row, col in zip(rows, cols):
            if start + row < col:
                yield int(start + row), int(col), float(block[row, col])


# --- the pass ----------------------------------------------------------------


def _decode(path: Path) -> tuple[np.ndarray | None, str | None]:
    """`read`, as `(frame, reason it would not decode)` -- one of them None.

    `fingerprints._decode`'s shape and its reason: this is the boundary the
    filesystem is read across, and a substrate that will not decode has to be
    survivable, because resuming re-reaches the same file and fails again.
    """
    try:
        return read(path), None
    except (OSError, ValueError) as exc:
        return None, str(exc)


def batches(todo: Sequence[str], size: int) -> Iterator[Sequence[str]]:
    for start in range(0, len(todo), size):
        yield todo[start : start + size]


def examine_all(
    conn: sqlite3.Connection,
    todo: Sequence[str],
    substrate_root: Path,
    detect: Detector,
    *,
    model: str = MODEL,
    version: str = VERSION,
    batch: int = BATCH,
    workers: int = DECODE_WORKERS,
    progress_seconds: float = PROGRESS_SECONDS,
) -> dict:
    """Look at every frame in `todo` and store what was in it. Returns the tally.

    One transaction per batch, so an interruption costs the batch in flight and
    nothing before it. Decoding runs on a pool because a 1536px webp costs more to
    read than either model costs to run, exactly as it does in `fingerprints`.

    A detector that fails on the device rather than on the frame ends the walk and
    is returned as `faulted`, for the module docstring's reason. The frames already
    detected in the batch it failed in are stored on the way out, so the fault costs
    the frame it happened on and nothing else.
    """
    written = faces = 0
    unreadable: list[tuple[str, str]] = []
    faulted: str | None = None
    started = announced = time.perf_counter()

    with ThreadPoolExecutor(max(workers, 1)) as pool:
        for chunk in batches(todo, max(batch, 1)):
            paths = [substrate_path(substrate_root, sha256) for sha256 in chunk]
            rows: list[tuple[str, Found]] = []
            for sha256, (frame, reason) in zip(chunk, pool.map(_decode, paths)):
                if reason is not None:
                    unreadable.append((sha256, reason))
                    continue
                try:
                    rows.append((sha256, detect(frame)))
                except RuntimeError as exc:
                    # The detector's device has failed, which on this machine means
                    # the display driver was reset under the pass: Windows resets it
                    # when a graphics command outstays the TDR timeout, and every
                    # CUDA context on the GPU dies with it. Unlike a substrate that
                    # will not decode this is not the frame's fault and not
                    # survivable, because a lost context poisons every call after
                    # it -- so the frames in hand are stored and the pass stops
                    # rather than reporting 22,000 identical failures. What it costs
                    # is the resume unit and no more.
                    faulted = str(exc)
                    break
            if rows:
                conn.execute("BEGIN")
                conn.executemany(
                    _INSERT_FRAME,
                    [
                        (model, version, sha256, len(f.bodies), f.largest)
                        for sha256, f in rows
                    ],
                )
                conn.executemany(
                    _INSERT_FACE,
                    [
                        (model, version, sha256, idx, face.share, to_blob(face.vector))
                        for sha256, f in rows
                        for idx, face in f.indexed
                    ],
                )
                conn.execute("COMMIT")
                written += len(rows)
                faces += sum(len(f.faces) for _, f in rows)

            if faulted is not None:
                break

            now = time.perf_counter()
            if now - announced >= progress_seconds:
                announced = now
                print(
                    f"  examine  {written:>7,}/{len(todo):,}  "
                    f"{written / (now - started):.1f}/s  {faces:,} faces",
                    flush=True,
                )

    return {
        "written": written,
        "faces": faces,
        "unreadable": unreadable,
        "faulted": faulted,
        "elapsed_s": time.perf_counter() - started,
    }


def vectors(
    conn: sqlite3.Connection, *, model: str = MODEL, version: str = VERSION
) -> dict[str, np.ndarray]:
    """Every stored face vector, by name. The clustering reads all of them at once."""
    return {
        name(sha256, idx): from_blob(blob)
        for sha256, idx, blob in conn.execute(_VECTORS, (model, version))
    }


def shares(
    conn: sqlite3.Connection, *, model: str = MODEL, version: str = VERSION
) -> dict[str, float]:
    """Every stored face's box share, by name. What the cut is applied to."""
    return {
        name(sha256, idx): share
        for sha256, idx, share in conn.execute(_SHARES, (model, version))
    }


def assigned(
    conn: sqlite3.Connection,
    threshold: float = THRESHOLD,
    cut: float = CUT,
    *,
    model: str = MODEL,
    version: str = VERSION,
) -> set[str]:
    """Every face already given a person at one threshold and cut."""
    return {
        name(sha256, idx)
        for sha256, idx in conn.execute(_ASSIGNED, (model, version, threshold, cut))
    }


def cluster_all(
    conn: sqlite3.Connection,
    threshold: float = THRESHOLD,
    cut: float = CUT,
    *,
    model: str = MODEL,
    version: str = VERSION,
) -> dict:
    """Give every big enough face a person, or say there is nothing to do.

    Redone whole rather than resumed in parts, because a clustering is a reading of
    every vector at once: a face detected after the last one ran does not join a
    person, it changes which persons there are. So the resume unit is the threshold
    and the cut together, and the question asked is whether every face the cut keeps
    has an answer at them.

    **Asked of the population and not of every stored face**, which is the trap the
    cut introduces: a face under it is never owed a person, so a resume that
    counted one as owed would re-cluster on every run.
    """
    started = time.perf_counter()
    stored = vectors(conn, model=model, version=version)
    big = reaching(shares(conn, model=model, version=version), cut)
    population = {key: vector for key, vector in stored.items() if key in big}
    under = len(stored) - len(population)
    owed = population.keys() - assigned(conn, threshold, cut, model=model, version=version)
    if not owed:
        return {
            "faces": len(population),
            "under": under,
            "persons": 0,
            "written": 0,
            "elapsed_s": 0.0,
        }

    persons = cluster(population, threshold)
    rows = [
        (model, version, threshold, cut, *_unname(key), person)
        for key, person in persons.items()
    ]
    conn.execute("BEGIN")
    conn.executemany(_INSERT_PERSON, rows)
    conn.execute("COMMIT")
    return {
        "faces": len(population),
        "under": under,
        "persons": len(set(persons.values())),
        "written": len(rows),
        "elapsed_s": time.perf_counter() - started,
    }


# --- report ------------------------------------------------------------------


def appearances(
    conn: sqlite3.Connection,
    threshold: float = THRESHOLD,
    cut: float = CUT,
    *,
    model: str = MODEL,
    version: str = VERSION,
) -> list[int]:
    """How many faces each person has, most first.

    The next ticket needs this to know how many judgements it is about to ask the
    reader for: a hundred persons of one face each is a different afternoon from
    ten of a hundred.
    """
    return sorted(
        (count for _, count in conn.execute(_APPEARANCES, (model, version, threshold, cut))),
        reverse=True,
    )


def spread(counts: Sequence[int]) -> str:
    """The distribution of appearances, in one line."""
    if not counts:
        return "no person found"
    once = sum(1 for count in counts if count == 1)
    return (
        f"{len(counts):,} persons, largest {counts[0]:,} faces, "
        f"median {counts[len(counts) // 2]:,}, {once:,} seen once"
    )


def run(
    config: Config | None = None,
    *,
    detect: Detector | None = None,
    threshold: float = THRESHOLD,
    cut: float = CUT,
    limit: int | None = None,
) -> int:
    config = config or load()
    if not config.substrate_root.is_dir():
        raise PeopleRefused(f"substrate tree not found: {config.substrate_root}")
    # Checked here rather than left to the column's own CHECK, because that one fires
    # after the detection pass has run and committed: a mistyped cut would cost half
    # an hour of GPU and end in a traceback rather than a refusal.
    if cut < NO_CUT:
        raise PeopleRefused(f"a cut is a share of the frame's height, so not {cut}")

    # `candidates.catalog` rather than `db.connect`, for its own two reasons: the
    # triage decisions have no business being reachable from an experiment, and
    # `BEGIN IMMEDIATE` over an attached state would refuse every time the grid
    # saved a reject.
    conn = candidates.catalog(config.catalog_db)
    try:
        try:
            candidates.refuse_if_busy(conn)
        except candidates.CandidatesRefused as exc:
            raise PeopleRefused(str(exc)) from exc

        started = time.perf_counter()
        todo, missing = worklist(conn, config.substrate_root)
        print(
            f"model     {MODEL} version {VERSION}, {DIM} dimensions "
            f"({time.perf_counter() - started:.1f}s to plan)",
            flush=True,
        )
        print(f"substrate {config.substrate_root}")
        print(f"floor     {FLOOR} of the frame's height, provisional and read-time only")
        print(f"cut       {cut} of it, the least face clustered, and part of the key")
        if limit is not None:
            todo = todo[:limit]
        print(f"todo      {len(todo):,} tiles to examine")
        # Every one of them, for `fingerprints.run`'s reason: a hole in the
        # derivative tree is the thing that must not go quiet.
        print(f"missing   {len(missing):,} tiles with no substrate, so no answer:")
        for sha256 in missing:
            print(f"          {sha256}")

        unreadable: list[tuple[str, str]] = []
        if todo:
            result = examine_all(conn, todo, config.substrate_root, detect or load_detector())
            unreadable = result["unreadable"]
            elapsed = max(result["elapsed_s"], 1e-6)
            print(
                f"\nexamined  {result['written']:,} frames in "
                f"{int(elapsed) // 60}m{int(elapsed) % 60:02d}s, "
                f"{result['written'] / elapsed:,.1f}/s, {result['faces']:,} faces"
            )
            print(f"corrupt   {len(unreadable):,} substrates that would not decode")
            for sha256, reason in unreadable:
                print(f"          {sha256}  {reason}")
            if result["faulted"] is not None:
                # Nothing is clustered and nothing is counted, because a clustering
                # is a reading of every vector at once and there is no reading of a
                # fraction: the persons it named would be the persons of however far
                # the pass got, reported as though they were the library's.
                print(
                    "\nfaulted   the detector's device failed, so the pass stopped where it"
                    " is. Every frame counted above is stored and re-running resumes"
                    " from there."
                )
                print(f"          {result['faulted'].splitlines()[0]}")
                return 2
        else:
            print("\nnothing to examine: every tile with a substrate has been looked at")

        grouped = cluster_all(conn, threshold, cut)
        if grouped["written"]:
            print(
                f"clustered {grouped['written']:,} faces at {threshold} in "
                f"{grouped['elapsed_s']:.1f}s, {grouped['under']:,} left under the cut"
            )
        else:
            print(
                f"clustered nothing new: every face reaching {cut} has a person at"
                f" {threshold}"
            )

        peopled = conn.execute(_PEOPLED, (MODEL, VERSION, FLOOR)).fetchone()[0]
        looked = len(examined(conn))
        print(f"\nsomebody  {peopled:,} of {looked:,} frames hold a body at or above {FLOOR}")
        print(f"persons   {spread(appearances(conn, threshold, cut))}")
        return 0 if not unreadable else 1
    finally:
        conn.close()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m photolib.people", description=__doc__.splitlines()[0]
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=THRESHOLD,
        help="the cosine at or above which two faces are one person, and part of the"
        " key rather than a setting: another value is another population"
        " (default: %(default)s)",
    )
    parser.add_argument(
        "--cut",
        type=float,
        default=CUT,
        help="the least box share clustered, and part of the key for the same reason:"
        " a face under it is evidence about nobody, and another value is another"
        " population (default: %(default)s)",
    )
    parser.add_argument(
        "--limit", type=int, help="examine at most this many, for a throughput measurement"
    )
    args = parser.parse_args(argv)
    return run(threshold=args.threshold, cut=args.cut, limit=args.limit)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except PeopleRefused as exc:
        sys.exit(f"refused: {exc}")
