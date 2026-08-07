@echo off
setlocal
title Media Vault Live Backfill
pushd "%~dp0"

echo Starting the read-only review interface for persisted progress...
start "Media Vault Review UI" /min powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0run.ps1" review-ui --vault "G:\MediaVault" --inbox "G:\MediaVaultImports" --no-worker

echo Resuming the durable low-priority live-vault backfill...
echo Closing this window interrupts safely; run this file again to resume persisted progress.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0run.ps1" preprocess --vault "G:\MediaVault" --inbox "G:\MediaVaultImports" --backfill
set "BackfillExitCode=%ERRORLEVEL%"

if not "%BackfillExitCode%"=="0" (
  echo.
  echo Backfill stopped with exit code %BackfillExitCode%. Persisted completed work is retained.
) else (
  echo.
  echo Backfill completed successfully.
)

echo Press any key to close this window.
pause >nul
popd
exit /b %BackfillExitCode%
