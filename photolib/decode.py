"""A worker pool that can survive a decode which never returns.

`F55` is a *hang*, not a crash, and `F56` is the same problem seen from the
subprocess side: hostile or corrupt media meets a decoder with no enforced
bounds. A crash is recoverable -- the parent sees a dead child and moves on. A
hang is not, and over 103,207 files one is enough to lose a night's run. So
every decode here carries three bounds:

* **a wall-clock timeout**, enforced by the parent, which kills the worker
  holding the task and starts a replacement. This is the one that matters, and
  it is the only one a hung decoder cannot ignore.
* **an output size cap**, checked against the header's declared dimensions
  *before* the pixels are read, and again against whatever the worker returns.
* **a memory cap**, a Windows job object the worker assigns itself at startup,
  so an allocation past the limit fails inside the child rather than swapping
  the machine. `caps_in_force` reports whether it actually took, because a cap
  that silently did not apply is worse than no cap.

`ProcessPoolExecutor` cannot do the first of those: a hung task jams its pool
and cancelling a running future is not possible. Hence a plain pool of
processes over two queues, with the parent tracking which worker holds which
task and killing by PID.

Nothing here knows what a derivative is. The pool is given a `module:function`
to import in each worker, and moves opaque payloads.
"""

from __future__ import annotations

import ctypes
import importlib
import multiprocessing as mp
import os
import queue
import sys
import threading
import time
from collections.abc import Iterator

DECODE_TIMEOUT_S = 30.0
MEMORY_BYTES = 1 << 30  # 1 GiB per worker
MAX_PIXELS = 32_000_000  # the substrate is <= 2560 long edge; this is far above it
MAX_OUTPUT_BYTES = 64 << 20
POLL_S = 0.25
QUEUE_DEPTH = 64  # bounds how many payloads are in flight, and so peak memory


# --- the memory cap ----------------------------------------------------------


class _JobLimits(ctypes.Structure):
    """`JOBOBJECT_EXTENDED_LIMIT_INFORMATION`, flattened to the fields we set."""

    _fields_ = [
        ("PerProcessUserTimeLimit", ctypes.c_int64),
        ("PerJobUserTimeLimit", ctypes.c_int64),
        ("LimitFlags", ctypes.c_uint32),
        ("MinimumWorkingSetSize", ctypes.c_size_t),
        ("MaximumWorkingSetSize", ctypes.c_size_t),
        ("ActiveProcessLimit", ctypes.c_uint32),
        ("Affinity", ctypes.c_size_t),
        ("PriorityClass", ctypes.c_uint32),
        ("SchedulingClass", ctypes.c_uint32),
        ("IoInfo", ctypes.c_uint64 * 6),
        ("ProcessMemoryLimit", ctypes.c_size_t),
        ("JobMemoryLimit", ctypes.c_size_t),
        ("PeakProcessMemoryUsed", ctypes.c_size_t),
        ("PeakJobMemoryUsed", ctypes.c_size_t),
    ]


_JOB_LIMIT_PROCESS_MEMORY = 0x00000100
_JOB_EXTENDED_LIMIT_INFORMATION = 9


def memory_cap(limit_bytes: int) -> bool:
    """Cap this process's committed memory. True if the cap is really in force.

    A Windows job object with `ProcessMemoryLimit`, which the process assigns
    itself. Returns False rather than raising on any platform or policy that
    will not take it, so the caller can say so in its report instead of
    believing in a bound that is not there.
    """
    if sys.platform != "win32":
        return False
    try:
        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        # Prototypes are not optional here: a HANDLE is pointer-sized and
        # ctypes defaults every return to a 32-bit int, which truncates the job
        # handle and makes both following calls fail with no error the caller
        # would notice.
        kernel32.CreateJobObjectW.restype = ctypes.c_void_p
        kernel32.GetCurrentProcess.restype = ctypes.c_void_p
        kernel32.SetInformationJobObject.argtypes = [
            ctypes.c_void_p, ctypes.c_int, ctypes.c_void_p, ctypes.c_uint32
        ]
        kernel32.AssignProcessToJobObject.argtypes = [ctypes.c_void_p, ctypes.c_void_p]

        job = kernel32.CreateJobObjectW(None, None)
        if not job:
            return False
        limits = _JobLimits()
        limits.LimitFlags = _JOB_LIMIT_PROCESS_MEMORY
        limits.ProcessMemoryLimit = limit_bytes
        if not kernel32.SetInformationJobObject(
            job, _JOB_EXTENDED_LIMIT_INFORMATION, ctypes.byref(limits), ctypes.sizeof(limits)
        ):
            return False
        return bool(kernel32.AssignProcessToJobObject(job, kernel32.GetCurrentProcess()))
    except (OSError, AttributeError):
        return False


# --- the worker --------------------------------------------------------------


def _serve(
    target: str,
    in_q: mp.Queue,
    out_q: mp.Queue,
    index: int,
    memory_bytes: int,
    max_pixels: int,
    max_output_bytes: int,
) -> None:
    """One worker: import the target once, then take tasks until told to stop."""
    capped = memory_cap(memory_bytes)
    from PIL import Image

    Image.MAX_IMAGE_PIXELS = max_pixels
    module_name, _, function_name = target.partition(":")
    function = getattr(importlib.import_module(module_name), function_name)
    out_q.put(("ready", index, os.getpid(), capped))

    while True:
        task = in_q.get()
        if task is None:
            return
        tid, payload = task
        out_q.put(("start", index, tid, None))
        try:
            result = function(payload, max_pixels)
        except MemoryError:
            out_q.put(("error", index, tid, "memory cap exceeded"))
            continue
        except Exception as exc:  # a corrupt derivative must not stop the pass
            out_q.put(("error", index, tid, f"{type(exc).__name__}: {exc}"))
            continue
        if isinstance(result, (bytes, bytearray)) and len(result) > max_output_bytes:
            out_q.put(("error", index, tid, f"output {len(result)} over cap"))
            continue
        out_q.put(("ok", index, tid, result))


# --- the pool ----------------------------------------------------------------


class BoundedPool:
    """`workers` processes running `target`, none of which may exceed `timeout_s`.

    Used as a context manager. `submit` blocks once `QUEUE_DEPTH` payloads are in
    flight, which is what keeps peak memory bounded when the readers are faster
    than the decoders. `results` yields `(tid, status, payload)` in completion
    order, `status` being `ok`, `error` or `timeout`.
    """

    def __init__(
        self,
        target: str,
        *,
        workers: int,
        timeout_s: float = DECODE_TIMEOUT_S,
        memory_bytes: int = MEMORY_BYTES,
        max_pixels: int = MAX_PIXELS,
        max_output_bytes: int = MAX_OUTPUT_BYTES,
    ) -> None:
        self.target = target
        self.workers = max(workers, 1)
        self.timeout_s = timeout_s
        self.memory_bytes = memory_bytes
        self.max_pixels = max_pixels
        self.max_output_bytes = max_output_bytes
        self.timeouts = 0
        self.replacements = 0
        self.caps_in_force = False

        context = mp.get_context("spawn")
        self._in_q: mp.Queue = context.Queue(QUEUE_DEPTH)
        self._out_q: mp.Queue = context.Queue()
        self._context = context
        self._procs: dict[int, mp.process.BaseProcess] = {}
        self._active: dict[int, tuple[int, float]] = {}  # worker index -> (tid, deadline)
        self._done: set[int] = set()
        self._lock = threading.Lock()
        self._out: queue.Queue = queue.Queue()
        self._stopping = threading.Event()
        self._threads: list[threading.Thread] = []

    # -- lifecycle
    def _spawn(self, index: int) -> None:
        proc = self._context.Process(
            target=_serve,
            args=(
                self.target,
                self._in_q,
                self._out_q,
                index,
                self.memory_bytes,
                self.max_pixels,
                self.max_output_bytes,
            ),
            daemon=True,
        )
        proc.start()
        self._procs[index] = proc

    def __enter__(self) -> BoundedPool:
        for index in range(self.workers):
            self._spawn(index)
        for run in (self._collect, self._reap):
            thread = threading.Thread(target=run, daemon=True)
            thread.start()
            self._threads.append(thread)
        return self

    def __exit__(self, *exc: object) -> None:
        self._stopping.set()
        for _ in self._procs:
            try:
                self._in_q.put_nowait(None)
            except queue.Full:
                pass
        for proc in self._procs.values():
            proc.join(timeout=2)
            if proc.is_alive():
                proc.kill()

    # -- the two background threads
    def _collect(self) -> None:
        """Drain the workers' queue, keeping the reaper's view of them current."""
        while not self._stopping.is_set():
            try:
                message = self._out_q.get(timeout=POLL_S)
            except (queue.Empty, OSError, EOFError):
                continue
            kind = message[0]
            if kind == "ready":
                _, index, _pid, capped = message
                with self._lock:
                    self.caps_in_force = capped if index == 0 else self.caps_in_force
                continue
            if kind == "start":
                _, index, tid, _ = message
                with self._lock:
                    self._active[index] = (tid, time.monotonic() + self.timeout_s)
                continue
            _, index, tid, payload = message
            with self._lock:
                self._active.pop(index, None)
                if tid in self._done:
                    continue  # the reaper already gave up on it; first answer wins
                self._done.add(tid)
            self._out.put((tid, "ok" if kind == "ok" else "error", payload))

    def _reap(self) -> None:
        """Kill any worker that has held one task past the timeout, and replace it."""
        while not self._stopping.is_set():
            time.sleep(POLL_S)
            now = time.monotonic()
            with self._lock:
                overdue = [
                    (index, tid) for index, (tid, due) in self._active.items() if now > due
                ]
                for index, tid in overdue:
                    self._active.pop(index, None)
                    if tid in self._done:
                        continue
                    self._done.add(tid)
                    self.timeouts += 1
            for index, tid in overdue:
                proc = self._procs.get(index)
                if proc is not None and proc.is_alive():
                    proc.kill()
                    proc.join(timeout=5)
                self.replacements += 1
                self._spawn(index)
                self._out.put((tid, "timeout", None))

    # -- the caller's half
    def submit(self, tid: int, payload: object) -> None:
        self._in_q.put((tid, payload))

    def deliver(self, tid: int, status: str, payload: object = None) -> None:
        """Record a result for a task that never reached a worker.

        A file that is absent or fails its checksum has no decode to bound, but
        it still owes `results` an answer -- without this the caller would wait
        for a task that was never submitted.
        """
        with self._lock:
            if tid in self._done:
                return
            self._done.add(tid)
        self._out.put((tid, status, payload))

    def results(self, count: int) -> Iterator[tuple[int, str, object]]:
        """Yield exactly `count` results, whatever became of the tasks."""
        for _ in range(count):
            while True:
                try:
                    yield self._out.get(timeout=POLL_S)
                    break
                except queue.Empty:
                    if all(not proc.is_alive() for proc in self._procs.values()):
                        raise RuntimeError("every decode worker died") from None
