"""The screen where twelve anecdotes become a few hundred judgements.

**This is scaffolding with a stated end of life.** `docs/adr/0003-stack-on-verified-match.md`
leaves the reader's *strictness* -- the threshold on the Match -- unsettled on
purpose, and says how it will be settled: a labelling harness, thrown away
afterwards, showing candidate stacks with the frame before and after each one and
recording merge / split / **not sure**. This is that harness. It is not part of
the shipped website, nothing in `photolib/` imports it, no route of
`photolib.grid` reaches it, and it is expected to be deleted whole once the grid
ticket lands.

It shows one candidate stack at a time **with its neighbours**, which is what
lets a single screen answer both of the reader's complaints at once: *does this
stack hold something that does not belong*, and *is it missing something that
should be here*. Accepting the stack as drawn is one keystroke, because that is
the common case and it should cost almost nothing. Clicking a member says it does
not belong; clicking a neighbour says it should have been included. **Not sure**
is a first-class answer and not a skip -- the reader has said outright that some
of these are grey, and a grey area recorded as grey is worth more than a forced
verdict.

Which sets it shows is the point of it. `STRICTNESS` below is a *provisional*
line drawn only so there is something to disagree with; every set is chosen for
how little the Match commits to it, so the reader's evening lands where it moves
the real threshold most. The sample is then spread over the cameras, so a
threshold calibrated on the body the operator shoots most does not quietly
misbehave on the other four.

Answers go to a `labels.sqlite3` of the harness's own, beside the catalog on the
NVMe. **Never `state.sqlite3`**: that holds irreplaceable triage decisions and has
its own snapshot and restore machinery, and these labels are disposable
calibration data that will be re-derived if the descriptor changes. It is not a
migrated database either, for the same reason -- a disposable table has no
business in the shipped schema, so this module creates its own and `*.sqlite3` in
`.gitignore` is what keeps it out of git. The reader's *answers* are the
exception to all of that disposability, because an evening of them cannot be
re-derived from anything: when this module changes the shape it writes, it
carries them forward rather than asking for the file to be moved aside. See
`_carry_over`.

Frames are served from the same 1536px substrate tree the grid's overlay draws
from, so what the reader judges is what the grid will draw. It reads the catalog
and the substrates, both on the NVMe, and never opens `G:`.

    python -m harness.label --open

Stopping it loses nothing: every answer is committed as it is given, the sample
is deterministic, and an answer already given comes back with its set so it can
be revised rather than repeated.
"""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
import threading
from collections.abc import Iterable, Sequence
from dataclasses import dataclass, replace
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from photolib import candidates, matches
from photolib.config import load, substrate_path

# The provisional line the sets are drawn at. **Not the answer this harness
# exists to find** -- it is a place to stand while asking, and every set below is
# chosen for sitting near it rather than for being on one side of it.
#
# 20 because that is where the two populations `photolib.matches` measured start
# to separate: pairs a second or less apart score a median of 283 and 94% of them
# reach 20 or more, against a median of 5 beyond two minutes. A reader's answers
# are what will move it.
STRICTNESS = 20

# How many sets one round is worth. ADR 0003 asks for two rounds of about thirty,
# and they are two *runs* of this harness rather than sixty sets in one sitting:
# the second is "drawn after re-running with the first round's answers", so the
# line has moved by then and the sample it draws is a different one. `--sets` and
# `--strictness` are how the second round says so.
SETS = 30

# How many frames either side of a stack the reader may look at, and how many
# they are shown before asking.
#
# One each side is what ADR 0003 specifies and it is not enough on its own: the
# frame beyond the neighbour is often a plausible member too, and a reader who
# cannot see it cannot say so. Measured over this catalog, of the 4,368 candidate
# stacks 46% have no frame outside with any claim at all -- but the sets a round
# samples are the *least decisive* ones by construction, and there only 27% do.
#
# There is also no width that settles it: three each side covers 43% of a round's
# sets and eight covers little more, because the runs this fence admits reach
# 1,435 frames. So the width is the reader's to choose per set. One each side is
# the default because the common case is a stack with nothing arguable beside it
# and it should cost nothing to confirm; `CONTEXT` is as far as the widening key
# goes.
#
# The extra frames are chosen by position in the run and captioned with the gap,
# never by the Match: a bracket end blown out past having any texture left scores
# nothing and is exactly the member ADR 0003 expects to be missed, so choosing
# context by the Match would hide the failure the reader is here to find.
CONTEXT = 8
SHOWN = 1

DEFAULT_PORT = 8771  # the grid is on 8770 and this is not the grid

LABELS = "labels.sqlite3"  # beside the catalog, which is where the NVMe is named

STATIC_DIR = Path(__file__).resolve().parent

Points = dict[tuple[str, str], int]
Capture = tuple[str, int]  # a frame, and when it was taken
Run = tuple[str | None, list[Capture]]  # a camera, and its consecutive captures
Near = tuple[str, int]  # a frame outside the stack, and its gap from the edge


# --- forming the sets ---------------------------------------------------------


@dataclass(frozen=True)
class Question:
    """One candidate stack, what surrounds it, and how little the Match commits.

    `before` and `after` run **outwards from the stack**, nearest frame first,
    and carry the seconds between each frame and the edge of the stack it sits
    beside. The gap is carried because it is what tells the reader whether a
    frame outside is plausible at all -- two seconds is another press of the
    shutter and forty minutes is somewhere else -- and because it is the fence
    ADR 0003 keeps, made visible.
    """

    camera: str | None
    members: tuple[str, ...]
    before: tuple[Near, ...]
    after: tuple[Near, ...]
    margin: int  # points between the weakest evidence and `STRICTNESS`

    def nearest(self) -> tuple[str | None, str | None]:
        """The frame each side of the stack, which is where the margin is decided."""
        return (
            self.before[0][0] if self.before else None,
            self.after[0][0] if self.after else None,
        )

    def surrounding(self, shown: int) -> list[str]:
        """The frames outside the stack the reader was actually shown."""
        return [sha for sha, _ in self.before[:shown]] + [sha for sha, _ in self.after[:shown]]


def match(points: Points, a: str, b: str) -> int:
    """The Match between two frames, or zero where there is no row.

    A pair with no row is a pair the harness has no evidence for -- the screen
    rejected it, or a substrate it needed was missing. `photolib.matches` is
    careful to keep those two apart from a checked zero and this is not: what a
    set is drawn from is evidence that two frames are one picture, and absent
    evidence and no agreement come to the same drawing.

    Either order, because a run's order is the enumeration's order and a caller
    should not have to reproduce it to ask a question about two frames.
    """
    found = points.get((a, b))
    return points.get((b, a), 0) if found is None else found


def link(
    run: Sequence[str], points: Points, strictness: int = STRICTNESS
) -> list[list[str]]:
    """One run cut into stacks, by complete linkage at `strictness`.

    ADR 0003: every pair inside a stack must match, not merely each frame and its
    predecessor -- so a frame joins the stack in hand only if it agrees with all
    of it. The walk is forward and greedy, which is what `photolib.browse` does
    with the window, and its failure is the one the reader is being asked about:
    a frame the walk consumed early can agree with every member of the stack it
    was placed before. That split is a coin toss and `questions` scores it as one.
    """
    stacks: list[list[str]] = []
    holding: list[str] = []
    for frame in run:
        if holding and all(match(points, member, frame) >= strictness for member in holding):
            holding.append(frame)
        else:
            if holding:
                stacks.append(holding)
            holding = [frame]
    if holding:
        stacks.append(holding)
    return stacks


def _margin(
    members: Sequence[str],
    neighbours: Iterable[str | None],
    points: Points,
    strictness: int,
) -> int:
    """How far the weakest thing this drawing rests on sits from the line.

    Two kinds of evidence and they are the reader's two complaints. A pair
    *inside* the stack barely above the line is a frame that may not belong; a
    neighbour *outside* it barely below is a frame that may be missing. Both are
    a distance from `strictness`, so the least decisive of them is one number.

    A neighbour is judged on its weakest pair against the stack, because complete
    linkage is what it would have had to satisfy. Floored at zero, so a neighbour
    that agrees with every member and was split off anyway -- which the forward
    walk can do -- reads as the coin toss it is rather than as a negative.

    The two terms are not on the same scale and cannot be: a Match runs upwards
    without a bound, so a member pair can sit hundreds of points above the line,
    while a neighbour can only be `strictness` below it. That asymmetry is the
    truth about the distances and not a skew, and it is invisible to the ordering
    -- it only ever separates sets that are decisive either way.
    """
    weakest = [
        match(points, early, late) - strictness
        for index, early in enumerate(members)
        for late in members[index + 1 :]
    ]
    weakest += [
        strictness - min(match(points, neighbour, member) for member in members)
        for neighbour in neighbours
        if neighbour is not None
    ]
    return max(min(weakest, default=0), 0)


def questions(
    runs: Iterable[Run],
    points: Points,
    strictness: int = STRICTNESS,
    context: int = CONTEXT,
) -> list[Question]:
    """Every candidate stack there is to ask about, with what surrounds it.

    A stack of one is not asked about -- CONTEXT.md has a stack be the same
    photograph taken more than once -- but it is still drawn, as a neighbour of
    whichever stack it borders. Which is the whole shape of the second complaint:
    the frame that should have been included is usually sitting right there.

    Up to `context` frames are carried each side rather than one, so the reader
    can widen the view when the answer depends on what is past the edge. Only the
    nearest still decides the margin: the margin is about *this* boundary, and a
    frame five along is its own boundary with its own question.
    """
    asked: list[Question] = []
    for camera, run in runs:
        shas = [sha for sha, _ in run]
        taken = dict(run)
        stacks = link(shas, points, strictness)
        at = 0
        for stack in stacks:
            first, last = at, at + len(stack) - 1
            at += len(stack)
            if len(stack) < 2:
                continue
            before = tuple(
                (shas[index], taken[shas[first]] - taken[shas[index]])
                for index in range(first - 1, max(first - context - 1, -1), -1)
            )
            after = tuple(
                (shas[index], taken[shas[index]] - taken[shas[last]])
                for index in range(last + 1, min(last + context + 1, len(shas)))
            )
            question = Question(
                camera=camera,
                members=tuple(stack),
                before=before,
                after=after,
                margin=0,
            )
            asked.append(
                replace(
                    question,
                    margin=_margin(stack, question.nearest(), points, strictness),
                )
            )
    return asked


def spread(asked: Sequence[Question], wanted: int = SETS) -> list[Question]:
    """The least decisive sets, taken a camera at a time.

    Least decisive first is what puts the reader's time where it moves the
    threshold most. Round-robin over the cameras is the other half of the ask: the
    operator shoots one body far more than the other four, so a straight ranking
    would hand back an evening of that body alone and calibrate a number that
    quietly misbehaves everywhere else.

    Deterministic -- ties break on the members, and the cameras are ordered by
    their own best set -- because answers are keyed on the frames and a reader who
    stops and comes back has to be shown the same sets in the same order for the
    counter to mean anything.
    """
    queues: dict[str | None, list[Question]] = {}
    for question in sorted(asked, key=lambda q: (q.margin, q.members)):
        queues.setdefault(question.camera, []).append(question)
    order = sorted(
        queues, key=lambda camera: (queues[camera][0].margin, camera is None, camera or "")
    )

    picked: list[Question] = []
    while len(picked) < wanted and any(queues.values()):
        for camera in order:
            if queues[camera]:
                picked.append(queues[camera].pop(0))
                if len(picked) == wanted:
                    break
    return picked


def plan(
    conn: sqlite3.Connection,
    *,
    strictness: int = STRICTNESS,
    wanted: int = SETS,
    ceiling: int = candidates.CEILING,
    method: str = matches.METHOD,
    version: str = matches.VERSION,
) -> list[Question]:
    """The sets to ask about, read from the catalog and from nothing else.

    The population and the runs are `photolib.candidates`' own, so what this asks
    about is what that pass enumerated: the frames are cut into runs the same way
    and a pair it never considered a candidate is a pair with no Match here.
    """
    frames = candidates.population(conn)
    camera_of = {sha256: camera for camera, _secs, _kind, sha256 in frames}
    taken = {sha256: secs for _camera, secs, _kind, sha256 in frames}
    runs = [
        (camera_of[run[0]], [(sha256, taken[sha256]) for sha256 in run])
        for run in candidates.runs(frames, ceiling)
    ]
    points: Points = {
        (early, late): count
        for early, late, count in conn.execute(
            "SELECT sha_early, sha_late, points FROM pair_match WHERE method = ? AND version = ?",
            (method, version),
        )
    }
    return spread(questions(runs, points, strictness), wanted)


# --- what the reader answers --------------------------------------------------

VERDICTS = ("accept", "split", "merge", "both", "unsure")


def verdict(*, evicted: Sequence[str], included: Sequence[str], unsure: bool) -> str:
    """What a set of clicks and a keystroke amount to.

    Five answers rather than three, because a reader who both evicts a frame and
    pulls a neighbour in has said two things and `both` is what they said. Not
    sure outranks everything: it is the answer, not the absence of one, and a
    click the reader then decided they were unsure about must not survive as a
    verdict.
    """
    if unsure:
        return "unsure"
    if evicted and included:
        return "both"
    if evicted:
        return "split"
    if included:
        return "merge"
    return "accept"


def key(members: Sequence[str]) -> str:
    """What an answer is filed under: the stack it was about, as drawn.

    The frames and not a set number, because the sample moves when the
    provisional strictness does -- so an answer keyed on its position in a list
    would come back attached to a different photograph.
    """
    return ",".join(members)


# Not a migration. A disposable table has no business in the shipped schema, so
# this is created by the harness that owns it and goes when the harness does.
# `margin` and `camera` ride along with the answer because reading the labels
# afterwards means asking how the verdicts fell across the grey band and across
# the bodies, and neither question can be re-derived once the sample has moved.
#
# **`surrounding` is what makes an answer readable, and ticket 34 turns on it.**
# It is the frames outside the stack that were on screen when the answer was
# given -- so `accept` means "the frames I was shown are right" and never "this
# stack is complete". A strictness that pulls in a frame the reader never saw is
# not contradicting them, and a report that scored it as an error would be
# measuring the width of this window rather than the threshold.
SCHEMA = f"""
CREATE TABLE IF NOT EXISTS answer (
  members     TEXT PRIMARY KEY,  -- the stack as drawn, comma-joined. See `key`.
  camera      TEXT,
  surrounding TEXT NOT NULL,     -- JSON: the frames outside it the reader saw
  margin      INTEGER NOT NULL,
  verdict     TEXT NOT NULL CHECK (verdict IN ({', '.join(f"'{v}'" for v in VERDICTS)})),
  evicted     TEXT NOT NULL,     -- JSON: members the reader said do not belong
  included    TEXT NOT NULL,     -- JSON: neighbours the reader said should be in
  answered_at TEXT NOT NULL DEFAULT (datetime('now'))
)
"""

_RECORD = """
INSERT OR REPLACE INTO answer
  (members, camera, surrounding, margin, verdict, evicted, included)
VALUES (?, ?, ?, ?, ?, ?, ?)
"""


_CARRY = """
INSERT INTO answer
  (members, camera, surrounding, margin, verdict, evicted, included, answered_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
"""


def _carry_over(conn: sqlite3.Connection) -> int:
    """Bring answers written before the view could be widened into its shape.

    Not a migration framework and not the start of one -- this converts one
    known shape that this harness itself wrote, and goes with the directory. It
    is here because it is **exact**: the older table stored `before_sha` and
    `after_sha`, which is precisely what was on screen when the view was one
    frame either side, so there is nothing to guess and nothing lost.

    The alternative was refusing and asking the reader to move the file aside,
    which is what this did first. That is the wrong trade: their answers are the
    one thing here that is not re-derivable, and making them handle a file to
    keep them is a cost with nothing on the other side of it.
    """
    columns = {row[1] for row in conn.execute("PRAGMA table_info(answer)")}
    if not columns or "surrounding" in columns:
        return 0

    conn.execute("BEGIN")
    conn.execute("ALTER TABLE answer RENAME TO answer_before_widening")
    conn.execute(SCHEMA)
    older = conn.execute(
        "SELECT members, camera, before_sha, after_sha, margin, verdict, evicted,"
        " included, answered_at FROM answer_before_widening"
    ).fetchall()
    conn.executemany(
        _CARRY,
        [
            (
                members,
                camera,
                json.dumps([sha for sha in (before, after) if sha]),
                margin,
                given,
                evicted,
                included,
                when,
            )
            for members, camera, before, after, margin, given, evicted, included, when in older
        ],
    )
    conn.execute("DROP TABLE answer_before_widening")
    conn.execute("COMMIT")
    return len(older)


def store(path: Path) -> sqlite3.Connection:
    """The labels database, created if it is not there yet.

    Its own file and its own connection: the catalog is not attached and
    `state.sqlite3` has no name here at all, which is what makes "these labels
    never reach the triage decisions" a fact about the code.

    One connection shared across the server's threads rather than one per thread
    as `photolib.grid` has, because there is exactly one reader at one keyboard
    and every use of it goes through `LabelServer`'s lock. `check_same_thread` is
    off because that is what the lock is for.
    """
    conn = sqlite3.connect(path, isolation_level=None, check_same_thread=False)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute(SCHEMA)
    carried = _carry_over(conn)
    if carried:
        print(f"carried {carried} answer(s) over from before the view could be widened")
    return conn


def record(
    conn: sqlite3.Connection,
    question: Question,
    *,
    shown: int,
    evicted: Sequence[str],
    included: Sequence[str],
    unsure: bool,
) -> str:
    """File one answer, replacing whatever the reader said about it before.

    The question rather than five of its fields, because reading the labels
    afterwards means asking how the verdicts fell across the grey band and across
    the bodies -- so what was asked is stored beside what was answered, and there
    is one place that decides which parts of it that is. `shown` is how far the
    reader had widened the view, and it is stored as the frames themselves: see
    `SCHEMA` for why that is the column ticket 34 turns on.
    """
    given = verdict(evicted=evicted, included=included, unsure=unsure)
    conn.execute(
        _RECORD,
        (
            key(question.members),
            question.camera,
            json.dumps(question.surrounding(shown)),
            question.margin,
            given,
            json.dumps(list(evicted)),
            json.dumps(list(included)),
        ),
    )
    return given


def answers(conn: sqlite3.Connection) -> dict[str, dict]:
    """Every answer given, by the stack it was about."""
    return {
        row[0]: {
            "members": row[0].split(","),
            "camera": row[1],
            "verdict": row[2],
            "evicted": json.loads(row[3]),
            "included": json.loads(row[4]),
            "surrounding": json.loads(row[5]),
        }
        for row in conn.execute(
            "SELECT members, camera, verdict, evicted, included, surrounding FROM answer"
        )
    }


# --- the page -----------------------------------------------------------------

STATIC_ROUTES = {
    "/": ("page.html", "text/html; charset=utf-8"),
    "/page.css": ("page.css", "text/css; charset=utf-8"),
    "/page.js": ("page.js", "text/javascript; charset=utf-8"),
}

# 64 lowercase hex cannot traverse, cannot be absolute and cannot hold a
# separator, so the pattern is the containment proof. `photolib.grid` spells the
# same route the same way and for the same reason.
SUBSTRATE_ROUTE = re.compile(r"^/d/([0-9a-f]{64})\.webp$")

MAX_ANSWER_BODY = 8 * 1024

# Copied from `photolib.grid` rather than imported from it, and this is the one
# place that is the right way round: importing would leave the shipped server
# holding a name this directory uses, and deleting `harness/` has to leave
# nothing behind. The copy is small, it is checked against the original whenever
# either moves, and the whole of it goes at once.
SECURITY_HEADERS = (
    ("X-Content-Type-Options", "nosniff"),
    ("Referrer-Policy", "no-referrer"),
    ("X-Frame-Options", "DENY"),
    (
        "Content-Security-Policy",
        "default-src 'none'; img-src 'self'; script-src 'self'; style-src 'self'; "
        "connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    ),
)


class LabelServer(ThreadingHTTPServer):
    """Threaded for `photolib.grid.GridServer`'s reason: keep-alive plus one
    thread is a hang rather than a slowdown, and a set draws up to a dozen 1536px
    frames at once."""

    daemon_threads = True
    allow_reuse_address = False

    def __init__(self, address, handler, asked: list[Question], labels, substrate_root):
        self.asked = asked
        self.labels = labels
        self.substrate_root = substrate_root
        # Every touch of the labels database goes through this, which is what
        # lets one connection serve threaded requests -- see `store`.
        self._lock = threading.Lock()
        super().__init__(address, handler)
        port = self.server_address[1]
        self.allowed_hosts = frozenset({f"127.0.0.1:{port}", f"localhost:{port}"})
        self.allowed_origins = frozenset(
            {f"http://127.0.0.1:{port}", f"http://localhost:{port}"}
        )

    def judge(self, question: Question, **marks) -> dict:
        """Record one answer and hand back the sample it changed.

        One lock over the write and the read that follows it, so the counter the
        reader is shown is the count as of their own click.
        """
        with self._lock:
            record(self.labels, question, **marks)
            return self._payload()

    def payload(self) -> dict:
        with self._lock:
            return self._payload()

    def _payload(self) -> dict:
        """The whole sample, with whatever the reader has already said about it.

        All of it at once: thirty sets of shas is a few tens of kilobytes, and
        sending it whole is what makes going back to revise an answer a local
        move rather than a round trip.
        """
        given = answers(self.labels)
        sets = [
            {
                "members": list(question.members),
                # Nearest first, each with the seconds between it and the stack.
                # All of them ride with the set: widening the view is then a
                # local move, like going back to revise is.
                "before": [{"sha": sha, "gap": gap} for sha, gap in question.before],
                "after": [{"sha": sha, "gap": gap} for sha, gap in question.after],
                "camera": question.camera,
                "margin": question.margin,
                "answer": given.get(key(question.members)),
            }
            for question in self.asked
        ]
        return {
            "sets": sets,
            "shown": SHOWN,
            "strictness": STRICTNESS,
            "given": sum(1 for entry in sets if entry["answer"] is not None),
            # What is left to judge is what is left in the sample, which is
            # ADR 0003's round of thirty unless the catalog held fewer.
            "useful": len(sets),
        }


class LabelHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    timeout = 30
    server_version = "photolib-label-harness"
    sys_version = ""

    server: LabelServer

    def log_request(self, code="-", size="-") -> None:
        if isinstance(code, int) and code >= 400:
            self.log_message('"%s" %s', self.requestline, code)

    def _respond(self, status: int, body: bytes = b"", headers: tuple = ()) -> None:
        self.send_response(status)
        for name, value in SECURITY_HEADERS:
            self.send_header(name, value)
        for name, value in headers:
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD" and body:
            self.wfile.write(body)

    def _json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        self._respond(status, body, (("Content-Type", "application/json"),))

    def _host_ok(self) -> bool:
        return (self.headers.get("Host") or "").strip().lower() in self.server.allowed_hosts

    def do_GET(self) -> None:
        if not self._host_ok():
            self._json(403, {"error": "host"})
            return
        path = self.path.partition("?")[0]
        substrate = SUBSTRATE_ROUTE.match(path)
        if path in STATIC_ROUTES:
            self._static(path)
        elif path == "/api/sets":
            self._json(200, self.server.payload())
        elif substrate:
            self._frame(substrate.group(1))
        else:
            self._respond(404)

    do_HEAD = do_GET

    def do_POST(self) -> None:
        if not self._host_ok():
            self.close_connection = True
            self._json(403, {"error": "host"})
            return
        if self.path.partition("?")[0] != "/api/answer":
            self.close_connection = True
            self._respond(404)
            return
        self._answer()

    def _static(self, route: str) -> None:
        name, content_type = STATIC_ROUTES[route]
        try:
            body = (STATIC_DIR / name).read_bytes()
        except OSError:
            self._respond(404)
            return
        self._respond(
            200, body, (("Content-Type", content_type), ("Cache-Control", "no-cache"))
        )

    def _frame(self, sha256: str) -> None:
        """One 1536px substrate, by content hash -- the tree the overlay draws from."""
        etag = f'"{sha256}"'
        if self.headers.get("If-None-Match") == etag:
            self._respond(304, b"", (("ETag", etag),))
            return
        try:
            body = substrate_path(self.server.substrate_root, sha256).read_bytes()
        except OSError:
            self._respond(404)
            return
        self._respond(
            200,
            body,
            (
                ("Content-Type", "image/webp"),
                ("Cache-Control", "private, max-age=31536000, immutable"),
                ("ETag", etag),
            ),
        )

    def _answer(self) -> None:
        """Record one judgement. The only write this process makes.

        The body names a stack rather than describing one: it is matched against
        the sample this server is serving, and an answer about anything else is a
        404. So the reader's marks are checked against the frames actually drawn
        -- a member that is not a member, or a neighbour that is not a neighbour,
        cannot be filed.
        """
        payload = self._json_body()
        if payload is None:
            return
        members = payload.get("members")
        if not isinstance(members, list) or not all(isinstance(sha, str) for sha in members):
            self._json(400, {"error": "members"})
            return
        question = next(
            (q for q in self.server.asked if list(q.members) == members), None
        )
        if question is None:
            self._json(404, {"error": "members"})
            return

        # How far the reader had widened the view. Everything else is checked
        # against it, so a frame that was off screen cannot be marked as one the
        # reader saw and judged.
        shown = payload.get("shown", SHOWN)
        if type(shown) is not int or not 1 <= shown <= CONTEXT:
            self._json(400, {"error": "shown"})
            return

        marks = {}
        for field, allowed in (
            ("evicted", set(question.members)),
            ("included", set(question.surrounding(shown))),
        ):
            value = payload.get(field, [])
            if not isinstance(value, list) or not set(value) <= allowed:
                self._json(400, {"error": field})
                return
            marks[field] = value
        unsure = payload.get("unsure", False)
        if not isinstance(unsure, bool):
            self._json(400, {"error": "unsure"})
            return

        self._json(
            200,
            self.server.judge(
                question,
                shown=shown,
                evicted=marks["evicted"],
                included=marks["included"],
                unsure=unsure,
            ),
        )

    def _json_body(self) -> dict | None:
        """A validated JSON object body, or None having already answered.

        `photolib.grid._json_body`'s gauntlet, short: same origin, an explicit
        JSON content type so a cross-origin attempt needs a preflight there is no
        handler for, and a size budget checked before a byte is read.
        """
        origin = self.headers.get("Origin")
        if origin not in self.server.allowed_origins:
            self.close_connection = True
            self._json(403, {"error": "origin"})
            return None
        content_type = (self.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        if content_type != "application/json":
            self.close_connection = True
            self._json(415, {"error": "content-type"})
            return None
        if self.headers.get("Transfer-Encoding"):
            self.close_connection = True
            self._json(400, {"error": "body"})
            return None
        raw_length = self.headers.get("Content-Length")
        if raw_length is None or not raw_length.strip().isdigit():
            self.close_connection = True
            self._json(411, {"error": "body"})
            return None
        length = int(raw_length)
        if length > MAX_ANSWER_BODY:
            self.close_connection = True
            self._json(413, {"error": "body"})
            return None
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            self._json(400, {"error": "body"})
            return None
        if not isinstance(payload, dict):
            self._json(400, {"error": "body"})
            return None
        return payload


# --- running it ---------------------------------------------------------------


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m harness.label", description=__doc__)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--open", action="store_true", help="open a browser once bound")
    parser.add_argument(
        "--sets",
        type=int,
        default=SETS,
        help="how many sets one round samples (default 30, ADR 0003's round)",
    )
    parser.add_argument(
        "--strictness",
        type=int,
        default=STRICTNESS,
        help="the provisional Match threshold the sets are drawn at",
    )
    args = parser.parse_args(argv)

    config = load()
    labels_db = config.catalog_db.parent / LABELS
    conn = candidates.catalog(config.catalog_db, read_only=True)
    try:
        asked = plan(conn, strictness=args.strictness, wanted=args.sets)
    finally:
        conn.close()
    if not asked:
        print(
            "nothing to judge: no candidate stack has two frames at this strictness. "
            "Run python -m photolib.matches first."
        )
        return 1

    labels = store(labels_db)
    server = LabelServer(
        ("127.0.0.1", args.port), LabelHandler, asked, labels, config.substrate_root
    )
    url = f"http://127.0.0.1:{server.server_address[1]}/"
    cameras = sorted({question.camera or "(unnamed)" for question in asked})
    print(f"labelling harness on {url}  -- disposable, see the module docstring")
    print(f"  strictness      {args.strictness} provisional, {matches.METHOD}")
    print(f"  sets            {len(asked)} sampled, least decisive first")
    print(f"  context         {SHOWN} frame each side, widened to {CONTEXT} with +")
    print(f"  cameras         {', '.join(cameras)}")
    print(f"  margins         {asked[0].margin} to {asked[-1].margin} points from the line")
    print(f"  labels          {labels_db}")
    print(f"  substrates      {config.substrate_root}")
    print(f"  answers given   {len(answers(labels))}")
    if args.open:
        import webbrowser

        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
    finally:
        server.server_close()
        labels.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
