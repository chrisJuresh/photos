# Run the test suite on a console of its own, and report where the result will be.
#
# The suite takes about three minutes. An agent that runs it inside a tool call
# does not get to keep that console for three minutes: when the call's console is
# torn down, Windows sends Ctrl-C to every process attached to it and pytest dies
# at the two-minute mark with a KeyboardInterrupt. That has been misread as a
# refusal, as a hung task, and as a test failure, and each misreading cost a
# re-run from the top.
#
# `Start-Process -RedirectStandardOutput` does NOT avoid it: redirecting forces
# UseShellExecute=false, and the child then inherits the caller's console. The
# redirection has to happen inside the child instead, which is what this does.
#
# The console pytest gets here is hidden and non-interactive, so it has no valid
# standard input. Code under test that spawns a subprocess without saying what
# its stdin is inherits that invalid handle, and Windows raises
# `OSError: [WinError 6] The handle is invalid` from `subprocess.Popen` --
# a failure of this runner, reported as a test failure, in a file that passes in
# a normal console. It bit `photolib/rebuild.py` on 2026-08-09 and was fixed
# there with `stdin=subprocess.DEVNULL`, which is what a job with no reader
# should have asked for anyway; `test_the_default_runner_gives_the_child_no_stdin`
# holds it. A WinError 6 out of a spawn is this, and the spawning code is where
# it is fixed.
#
#   powershell -NoProfile -File scripts\run-tests.ps1
#
# It returns immediately. Wait for <out>\pytest.done -- it holds the exit code --
# and read <out>\pytest.out for the report. <out> is this checkout's own and is
# printed on start; read it from there rather than assuming a fixed path.

param(
    # Where the transcript and the exit-code marker go. Defaults to a directory
    # of this checkout's own under %TEMP% -- see below. Anywhere but the repo:
    # rule 5 keeps run logs out of git.
    [string] $OutDir,
    # Passed through to pytest, so a subset is `-Target tests/test_grid.py`.
    [string] $Target = 'tests'
)

$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot

if (-not $OutDir) {
    # One output directory per checkout. The default used to be a single shared
    # `photos-tests`, and the first thing a run does is delete the transcript and
    # the marker in it, so two worktrees running at once clobbered each other:
    # one waits for `pytest.done` and reads a pass count another tree produced.
    # That was seen on 2026-08-09, as three runs of one unchanged tree reporting
    # 966, 959 and 966 passed. The leaf name says which tree it is at a glance,
    # and the path hash keeps two worktrees with the same leaf apart.
    $sha = [System.Security.Cryptography.SHA1]::Create()
    try {
        $bytes = $sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($repo.ToLowerInvariant()))
    } finally {
        $sha.Dispose()
    }
    $tag = -join ($bytes[0..3] | ForEach-Object { $_.ToString('x2') })
    $OutDir = Join-Path $env:TEMP ('photos-tests-' + (Split-Path -Leaf $repo) + '-' + $tag)
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$out = Join-Path $OutDir 'pytest.out'
$done = Join-Path $OutDir 'pytest.done'
Remove-Item $out, $done -ErrorAction SilentlyContinue

# Out-File rather than `*>`, which writes UTF-16 in PowerShell 5.1 and leaves the
# transcript full of NULs for whatever reads it back. $LASTEXITCODE survives the
# pipeline; $? does not, and is not what is recorded here.
$inner = "python -m pytest $Target -q 2>&1 | Out-File -Encoding utf8 '$out'; " +
         "Set-Content -Encoding utf8 '$done' `$LASTEXITCODE"
Start-Process -FilePath 'powershell.exe' `
    -ArgumentList '-NoProfile', '-NonInteractive', '-Command', $inner `
    -WorkingDirectory $repo -WindowStyle Hidden

Write-Output "started: $Target"
Write-Output "  transcript $out"
Write-Output "  exit code  $done  (appears when the run finishes)"
