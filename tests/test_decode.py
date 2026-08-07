"""The bounded worker pool: the timeout, the caps, and what a hang costs.

`F55` is a hang rather than a crash, and over 103,207 decodes one is enough to
lose a night's run. `test_a_hang_is_survivable` is the assertion that matters
here; the rest is bookkeeping around it.
"""

from __future__ import annotations

import sys

import pytest

from archive.pipeline import decode

TARGETS = "decode_targets"


def test_a_payload_round_trips():
    with decode.BoundedPool(f"{TARGETS}:echo", workers=2) as pool:
        for tid in range(6):
            pool.submit(tid, bytes([tid]))
        got = dict((tid, payload) for tid, status, payload in pool.results(6) if status == "ok")
    assert got == {tid: bytes([tid]) + b"!" for tid in range(6)}


def test_a_raising_decode_is_an_error_not_a_stoppage():
    with decode.BoundedPool(f"{TARGETS}:boom", workers=2) as pool:
        for tid in range(4):
            pool.submit(tid, b"")
        results = list(pool.results(4))
    assert len(results) == 4
    assert all(status == "error" for _, status, _ in results)
    assert all("this one is corrupt" in str(payload) for _, _, payload in results)


def test_a_hang_is_survivable():
    """A worker that never returns is killed, its task is reported as a timeout,
    and a replacement takes the next task. Without this the run stops dead."""
    with decode.BoundedPool(f"{TARGETS}:hang", workers=2, timeout_s=1.0) as pool:
        for tid in range(4):
            pool.submit(tid, b"")
        results = list(pool.results(4))
    assert {status for _, status, _ in results} == {"timeout"}
    assert {tid for tid, _, _ in results} == {0, 1, 2, 3}
    assert pool.timeouts == 4
    assert pool.replacements == 4


def test_a_hang_does_not_take_the_tasks_behind_it():
    """The replacement worker has to keep going, or one bad file quietly turns
    into a stalled pass."""
    with decode.BoundedPool(f"{TARGETS}:hang", workers=1, timeout_s=1.0) as pool:
        pool.submit(0, b"")
        first = next(pool.results(1))
        pool.submit(1, b"")
        second = next(pool.results(1))
    assert first[1] == "timeout" and second[1] == "timeout"


def test_the_output_cap_rejects_an_oversized_result():
    with decode.BoundedPool(
        f"{TARGETS}:oversized", workers=1, max_output_bytes=1024
    ) as pool:
        pool.submit(0, b"")
        _tid, status, payload = next(pool.results(1))
    assert status == "error" and "over cap" in str(payload)


def test_deliver_answers_for_a_task_that_never_reached_a_worker():
    with decode.BoundedPool(f"{TARGETS}:echo", workers=1) as pool:
        pool.deliver(0, "error", "checksum mismatch")
        pool.submit(1, b"a")
        results = dict((tid, status) for tid, status, _ in pool.results(2))
    assert results == {0: "error", 1: "ok"}


def test_a_result_is_delivered_once_even_if_both_paths_fire():
    with decode.BoundedPool(f"{TARGETS}:echo", workers=1) as pool:
        pool.deliver(0, "error", "first")
        pool.deliver(0, "error", "second")
        results = list(pool.results(1))
    assert len(results) == 1 and results[0][2] == "first"


@pytest.mark.skipif(sys.platform != "win32", reason="the memory cap is a Windows job object")
def test_the_memory_cap_is_really_in_force():
    """A cap that silently did not apply is worse than no cap, so the pool
    reports whether the job object actually took."""
    with decode.BoundedPool(f"{TARGETS}:echo", workers=1) as pool:
        pool.submit(0, b"a")
        next(pool.results(1))
        assert pool.caps_in_force is True


@pytest.mark.skipif(sys.platform != "win32", reason="the memory cap is a Windows job object")
def test_the_memory_cap_stops_a_runaway_allocation():
    """The flag above says the job object took; this says it bites. A worker
    that tries for a gigabyte under a 256 MB cap fails inside the child."""
    with decode.BoundedPool(
        f"{TARGETS}:greedy", workers=1, memory_bytes=256 << 20, timeout_s=60
    ) as pool:
        pool.submit(0, b"")
        _tid, status, payload = next(pool.results(1))
    assert status == "error", payload
    assert "memory" in str(payload).casefold()
