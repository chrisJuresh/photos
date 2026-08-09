"""Applying triage to the grid: one job, two steps, and no work in a request.

A triage decision lands in `state.sqlite3` the moment it is made, and the grid
does not see it. A tile is a row in `photo`, `archive.pipeline.group` is the only
builder of `photo`, and a `triage_override` of `exclude` is read *there* -- so a
photograph leaves the grid when `photo` is next rebuilt and not before. Until
this module existed that was two commands typed in a console with the website
open in front of you, plus a server restart, and the failure it invites is
believing the button-less version worked: the grid answers every query happily
with the tile set it built at startup.

Four things decide the shape of this.

**Grouping does not happen in a request.** Invariant 4 names it: a handler may
enqueue a job, and this is the job. The HTTP surface is `start()` and `status()`,
both of which take a lock, read or write a dict, and return.

**The pipeline is spawned, never imported.** `archive/pipeline/` imports
`photolib`; the arrow never points the other way, and one `import` here would
turn a one-shot build step into a runtime dependency of the website. A
subprocess is the only coupling that keeps the arrow pointing the way the
repository says it does -- `python -m archive.pipeline.group`, resolved from the
repository root, with the same interpreter that is serving.

**The snapshot goes first.** `state.sqlite3` is the one artefact in this project
that cannot be regenerated, and `archive.pipeline.backup_state` writes a
verified, timestamped copy of it in a few milliseconds. Running it ahead of the
rebuild rather than after means a run that dies in `group` has still left the
restore point, and the ladder of snapshots is what `photolib.restore_state`
rolls back along.

**Nothing here writes anything itself.** Both steps are existing command-line
programs with their own safety properties; this module starts them in order,
keeps their output, and reports. If a step is wrong, it is wrong in the same way
from the console.

The subprocess inherits the server's console, so a Ctrl-C aimed at the grid
takes the rebuild with it. That is the right way round: `group` runs its writes
in transactions and is idempotent, so an interrupted rebuild rolls back to its
last commit and the next run puts it right.

Its *input* is not inherited. A job started from a button has no reader at a
keyboard, so a step that ever paused for one would hang with nobody to answer
it -- and a server started without a console of its own has no standard input to
hand down in the first place, which on Windows is not an empty stream but an
invalid handle that fails the spawn before the step runs. `DEVNULL` is the only
stdin that means the same thing from a console, from a hidden window and from a
scheduler.
"""

from __future__ import annotations

import subprocess
import sys
import threading
import time
from collections.abc import Callable
from datetime import UTC, datetime
from pathlib import Path

# `photolib/rebuild.py` -> `photolib` -> the repository root, where `archive` is
# a sibling of `photolib` and `-m archive.pipeline.group` resolves. Derived from
# this file's location rather than the process's working directory, which is
# whatever the launcher happened to be started from.
REPO_ROOT = Path(__file__).resolve().parent.parent

# The two steps, in the order they run. Both are modules rather than scripts, so
# the interpreter resolves them as packages and `archive.pipeline`'s own imports
# of `photolib` work without a path fixup.
STEPS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("snapshot", ("-m", "archive.pipeline.backup_state")),
    ("tiles", ("-m", "archive.pipeline.group")),
)

# `group` prints a ~25-line report and `backup_state` two lines, so this holds
# every line either produces with room to spare. It is a bound and not a budget:
# the point is that a step which somehow produced a million lines cannot grow
# this process's memory without limit.
MAX_LOG_LINES = 400
# One report line is under 100 characters. A line longer than this is a
# traceback or a path list, and the popup shows the head of it either way.
MAX_LINE_CHARS = 500


def _spawn(root: Path, args: tuple[str, ...], emit: Callable[[str], None]) -> int:
    """Run one step to completion, feeding `emit` its output a line at a time.

    A list argv, so nothing is ever handed to a shell -- and nothing in it comes
    from a request in any case: the steps are a constant in this module and the
    client's only input is which of `start` and `status` it called.

    stderr is folded into stdout because the popup shows one stream and a
    traceback interleaved with the report in the order it happened is what makes
    a failed run readable.

    stdin is `DEVNULL` rather than inherited: no step reads it, nobody is at a
    keyboard to feed one that did, and an uninherited stdin is the difference
    between a step that ends at EOF and a step that never starts. Left to
    itself, Windows hands the child `GetStdHandle(STD_INPUT_HANDLE)` -- the
    process-wide handle, which a parent launched with no console does not have,
    and duplicating an invalid one raises `WinError 6` out of `Popen` itself.
    """
    process = subprocess.Popen(  # noqa: S603
        [sys.executable, *args],
        cwd=root,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        close_fds=True,
    )
    with process:
        for line in process.stdout:
            emit(line.rstrip()[:MAX_LINE_CHARS])
    return process.returncode


class Rebuild:
    """The one rebuild job this process will run, and its status.

    Single-flight by construction: `start()` refuses while a run is in flight
    rather than queueing behind it. Two concurrent `group` processes would write
    `photo` at the same time, and the second one's answer would not be more
    correct than the first's -- it would be the same answer, arrived at twice,
    with SQLite arbitrating by lock timeout.

    `permitted` is the seam that keeps this off a server that is not serving the
    configured databases. Both steps read `config.toml` themselves, so a grid
    started with `--catalog` pointing at a temporary pair would otherwise rebuild
    the *real* catalog on a click. Every test server is exactly that shape, which
    is the accident worth making structurally impossible rather than watching
    for.

    `after` runs once, on success, before the state goes to `done`. It is how the
    server drops the memos it built from the tile set that has just changed.
    """

    def __init__(
        self,
        root: Path = REPO_ROOT,
        *,
        permitted: Callable[[], bool],
        after: Callable[[], None] = lambda: None,
        run: Callable[[Path, tuple[str, ...], Callable[[str], None]], int] = _spawn,
    ) -> None:
        self._root = Path(root)
        self._permitted = permitted
        self._after = after
        self._run = run
        self._lock = threading.Lock()
        self._state = "idle"
        self._error: str | None = None
        self._snapshot: str | None = None
        self._started_at: str | None = None
        self._started: float | None = None
        self._elapsed: float | None = None
        self._steps = self._fresh_steps()

    @staticmethod
    def _fresh_steps() -> list[dict]:
        return [
            {"name": name, "state": "pending", "seconds": None, "log": []}
            for name, _ in STEPS
        ]

    def _status(self) -> dict:
        """The status payload. Called with the lock held."""
        running = self._state == "running"
        return {
            "state": self._state,
            "error": self._error,
            "snapshot": self._snapshot,
            "started_at": self._started_at,
            # Counts up while it runs and freezes when it stops, so the popup
            # needs no clock of its own to say how long a finished run took.
            "seconds": round(
                time.monotonic() - self._started
                if running and self._started is not None
                else (self._elapsed or 0.0),
                1,
            ),
            "steps": [dict(step, log=list(step["log"])) for step in self._steps],
        }

    def status(self) -> dict:
        with self._lock:
            return self._status()

    def start(self) -> tuple[int, dict]:
        """Enqueue a run. `(202, status)`, or `(409, status)` if it cannot.

        Returns the status rather than an acknowledgement so the client that
        pressed the button and the client that polls are reading the same
        document from the first frame.
        """
        with self._lock:
            if self._state == "running":
                return 409, self._status()
            if not self._permitted():
                self._state = "failed"
                self._error = (
                    "this server is not serving the configured databases, so a "
                    "rebuild here would act on the wrong catalog"
                )
                return 409, self._status()
            self._state = "running"
            self._error = None
            self._snapshot = None
            self._started_at = datetime.now(UTC).isoformat(timespec="seconds")
            self._started = time.monotonic()
            self._elapsed = None
            self._steps = self._fresh_steps()
            status = self._status()
        threading.Thread(target=self._work, daemon=True).start()
        return 202, status

    def _emit(self, index: int, line: str) -> None:
        with self._lock:
            log = self._steps[index]["log"]
            log.append(line)
            if len(log) > MAX_LOG_LINES:
                del log[0]
            # `backup_state` prints `<path>  <n> bytes` first. The path is what
            # a rollback names, so it is lifted out of the log rather than left
            # for the reader to copy off a console line.
            if STEPS[index][0] == "snapshot" and self._snapshot is None and "  " in line:
                self._snapshot = line.rsplit("  ", 1)[0]

    def _work(self) -> None:
        for index, (name, args) in enumerate(STEPS):
            with self._lock:
                self._steps[index]["state"] = "running"
            began = time.monotonic()
            try:
                code = self._run(self._root, args, lambda line, at=index: self._emit(at, line))
            except OSError as exc:
                self._finish(index, began, f"{name}: {exc}")
                return
            if code != 0:
                self._finish(index, began, f"{name} exited {code}")
                return
            with self._lock:
                self._steps[index]["state"] = "done"
                self._steps[index]["seconds"] = round(time.monotonic() - began, 1)

        # Before the state goes to `done`: the client refetches the moment it
        # sees `done`, and a refetch that overtook the invalidation would bank
        # the stale numbers for the life of the process.
        self._after()
        with self._lock:
            self._state = "done"
            self._elapsed = round(time.monotonic() - self._started, 1)

    def _finish(self, index: int, began: float, error: str) -> None:
        with self._lock:
            self._steps[index]["state"] = "failed"
            self._steps[index]["seconds"] = round(time.monotonic() - began, 1)
            self._state = "failed"
            self._error = error
            self._elapsed = round(time.monotonic() - self._started, 1)
