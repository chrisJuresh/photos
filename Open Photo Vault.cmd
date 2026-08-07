@echo off
rem Double-click this to open the photo vault in a browser.
rem
rem It starts the local grid server on 127.0.0.1:8770 and opens the page. The
rem server binds to the loopback address only -- nothing is exposed to the
rem network. It reads the catalog and serves existing thumbnails; the only thing
rem it writes is the triage rule set in state.sqlite3. No vault object is read,
rem moved, or deleted by anything this starts.
rem
rem Closing this window stops the server.

setlocal
title Photo Vault
cd /d "%~dp0"

set "PY="
where py >nul 2>nul
if not errorlevel 1 set "PY=py -3"
where python >nul 2>nul
if not errorlevel 1 set "PY=python"

if not defined PY (
  echo Python was not found on PATH.
  echo.
  echo This needs Python 3.14 -- see TOOLING.md. Install it, or add the existing
  echo installation to PATH, then double-click this file again.
  echo.
  pause
  exit /b 1
)

echo Starting the photo vault. A browser tab will open on http://127.0.0.1:8770/
echo Close this window when you are finished, or press Ctrl+C.
echo.

%PY% -m photolib.grid --open

if errorlevel 1 (
  echo.
  echo The server stopped with an error. The lines above say why.
  echo.
  pause
)

endlocal
