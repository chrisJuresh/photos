param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $MediaVaultArguments
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PythonExecutable = Join-Path $ProjectRoot '.venv\Scripts\python.exe'

if (-not (Test-Path -LiteralPath $PythonExecutable)) {
    throw "Project virtual environment is missing: $PythonExecutable"
}

& $PythonExecutable -m media_vault @MediaVaultArguments
exit $LASTEXITCODE
