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
#   powershell -NoProfile -File scripts\run-tests.ps1
#
# It returns immediately. Wait for <out>\pytest.done -- it holds the exit code --
# and read <out>\pytest.out for the report.

param(
    # Where the transcript and the exit-code marker go. Anywhere but the repo:
    # rule 5 keeps run logs out of git.
    [string] $OutDir = (Join-Path $env:TEMP 'photos-tests'),
    # Passed through to pytest, so a subset is `-Target tests/test_grid.py`.
    [string] $Target = 'tests'
)

$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
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
