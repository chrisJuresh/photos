"""The rebuild job: single-flight, reported honestly, and never in a request.

No test here starts a real subprocess. `Rebuild` takes its step runner as a
seam, and the tests drive that seam directly — which is also the property worth
asserting, because the default runner spawns `archive.pipeline.group` against
whatever `config.toml` names.
"""

from __future__ import annotations

import threading
import time

import pytest

from photolib.rebuild import MAX_LOG_LINES, REPO_ROOT, STEPS, Rebuild, _spawn


def settle(job: Rebuild, want: str = "done", timeout: float = 5.0) -> dict:
    """Wait for the job to reach `want`, and return its status."""
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        status = job.status()
        if status["state"] == want:
            return status
        time.sleep(0.01)
    raise AssertionError(f"still {job.status()['state']} after {timeout}s, wanted {want}")


@pytest.fixture
def calls():
    return []


@pytest.fixture
def recorder(calls):
    """A step runner that records its arguments and succeeds silently."""

    def run(root, args, emit):
        calls.append((root, args))
        return 0

    return run


def test_a_run_executes_both_steps_in_order(recorder, calls):
    job = Rebuild(permitted=lambda: True, run=recorder)

    status, _ = job.start()

    assert status == 202
    settle(job)
    assert [args for _, args in calls] == [args for _, args in STEPS]


def test_the_snapshot_runs_before_the_tiles_are_rebuilt(calls):
    """Order is the point: a rebuild that dies has still left the restore point."""
    order = []

    def run(root, args, emit):
        order.append(args)
        return 1 if "group" in args[1] else 0

    job = Rebuild(permitted=lambda: True, run=run)
    job.start()
    settle(job, "failed")

    assert order[0] == STEPS[0][1]
    assert job.status()["steps"][0]["state"] == "done"


def test_the_invalidation_callback_runs_once_a_run_succeeds(recorder):
    invalidations = []
    job = Rebuild(permitted=lambda: True, after=lambda: invalidations.append(1), run=recorder)

    job.start()
    settle(job)

    assert invalidations == [1]


def test_a_failed_run_does_not_invalidate(recorder):
    """The tile set did not change, so the memos still describe it."""
    invalidations = []
    job = Rebuild(
        permitted=lambda: True,
        after=lambda: invalidations.append(1),
        run=lambda root, args, emit: 3,
    )

    job.start()
    settle(job, "failed")

    assert invalidations == []
    assert "exited 3" in job.status()["error"]


def test_the_callback_runs_before_the_state_says_done():
    """The client refetches on `done`; a refetch that overtook the invalidation
    would bank the stale numbers for the life of the process."""
    seen = []
    job = Rebuild(
        permitted=lambda: True,
        after=lambda: seen.append(job.status()["state"]),
        run=lambda root, args, emit: 0,
    )

    job.start()
    settle(job)

    assert seen == ["running"]


def test_a_second_start_is_refused_while_one_is_in_flight():
    release = threading.Event()

    def run(root, args, emit):
        release.wait(5)
        return 0

    job = Rebuild(permitted=lambda: True, run=run)
    assert job.start()[0] == 202
    try:
        status, payload = job.start()
        assert status == 409
        assert payload["state"] == "running"
    finally:
        release.set()
    settle(job)
    assert job.start()[0] == 202  # and it is startable again once it has landed


def test_a_server_on_other_databases_may_not_rebuild(calls, recorder):
    job = Rebuild(permitted=lambda: False, run=recorder)

    status, payload = job.start()

    assert status == 409
    assert payload["state"] == "failed"
    assert "configured databases" in payload["error"]
    assert calls == []


def test_output_is_kept_per_step_and_bounded():
    def run(root, args, emit):
        for index in range(MAX_LOG_LINES + 50):
            emit(f"{args[1]} line {index}")
        return 0

    job = Rebuild(permitted=lambda: True, run=run)
    job.start()
    status = settle(job)

    for step, (_, args) in zip(status["steps"], STEPS):
        assert len(step["log"]) == MAX_LOG_LINES
        assert step["log"][-1] == f"{args[1]} line {MAX_LOG_LINES + 49}"
        assert args[1] in step["log"][0]  # each step kept its own output


def test_the_snapshot_path_is_lifted_out_of_the_first_line():
    """`backup_state` prints `<path>  <n> bytes`, and the path is what a
    rollback names -- so it is a field rather than something to copy off a log."""

    def run(root, args, emit):
        if "backup_state" in args[1]:
            emit(r"E:\backups\state-20260808T203015Z.sqlite3  24,576 bytes")
            emit("  triage_rule=12  triage_override=2")
        return 0

    job = Rebuild(permitted=lambda: True, run=run)
    job.start()

    assert settle(job)["snapshot"] == r"E:\backups\state-20260808T203015Z.sqlite3"


def test_a_step_that_cannot_start_is_a_failure_and_not_a_crash():
    def run(root, args, emit):
        raise OSError(2, "no such file")

    job = Rebuild(permitted=lambda: True, run=run)
    job.start()
    status = settle(job, "failed")

    assert status["steps"][0]["state"] == "failed"
    assert "snapshot" in status["error"]


# -- the default runner, which is the thing the seam stands in for ----------


def test_the_default_runner_streams_output_and_returns_the_exit_code(tmp_path):
    """`-c` rather than a pipeline step: this asserts the plumbing — a list argv
    with no shell, stderr folded into stdout, lines as they arrive — and not
    what `group` does with it."""
    lines = []

    code = _spawn(
        tmp_path,
        ("-c", "import sys; print('out'); print('err', file=sys.stderr); sys.exit(7)"),
        lines.append,
    )

    assert code == 7
    assert sorted(lines) == ["err", "out"]


def test_the_default_runner_runs_in_the_directory_it_is_given(tmp_path):
    seen = []

    _spawn(tmp_path, ("-c", "import os; print(os.getcwd())"), seen.append)

    assert seen == [str(tmp_path.resolve())]


def test_an_untouched_job_reports_idle():
    job = Rebuild(permitted=lambda: True, run=lambda *args: 0)

    status = job.status()

    assert status["state"] == "idle"
    assert status["seconds"] == 0
    assert [step["state"] for step in status["steps"]] == ["pending", "pending"]
    assert status["snapshot"] is None


def test_the_steps_resolve_from_the_repository_root():
    """`-m archive.pipeline.group` resolves from the directory `archive` and
    `photolib` are siblings in, and from nowhere else."""
    assert (REPO_ROOT / "archive" / "pipeline" / "group.py").is_file()
    assert (REPO_ROOT / "photolib" / "rebuild.py").is_file()
