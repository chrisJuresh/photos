"""Driving the client's pure modules from pytest, through `client_module.js`.

The client has no test runner and is not getting one: the suite already reaches
into shipped client JavaScript for the ThumbHash decoder, and this is the same
arrangement generalised — node imports a module from `ui/src`, calls a named
export, and prints JSON; the assertions stay in Python.

It reads the source under `ui/src`, not `photolib/static/bundle.js`. The bundle
is minified, so the named export would not be there to call, and a stale one
would prove agreement with code the browser is no longer running.

Nothing here needs `ui/node_modules`, so it works in a fresh worktree.
"""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path
from typing import Any

import pytest

ROOT = Path(__file__).resolve().parent.parent
ADAPTER = Path(__file__).resolve().parent / "client_module.js"

needs_node = pytest.mark.skipif(shutil.which("node") is None, reason="node is not installed")


def call(module: str, export: str, *args: Any) -> Any:
    """Call `export` from the client module at `module` (repo-relative) with
    `args`, and return whatever it returned, through JSON."""
    result = subprocess.run(
        ["node", str(ADAPTER), module, export],
        cwd=ROOT,
        input=json.dumps(list(args)),
        capture_output=True,
        text=True,
        timeout=60,
    )
    if result.returncode != 0:
        raise AssertionError(f"{module}:{export} failed\n{result.stderr}")
    return json.loads(result.stdout)
