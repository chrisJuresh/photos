# Tooling

Versions of the external tools this build depends on, as found on `PATH`.

Recorded **2026-08-01**.

| Tool | Version | Resolved from |
|---|---|---|
| python | 3.14.6 | `C:\Users\Chris\AppData\Local\Python\bin\python.exe` |
| node | 22.16.0 | `C:\nvm4w\nodejs\node.exe` |
| exiftool | 13.59 | `C:\Users\Chris\AppData\Local\Programs\ExifTool\ExifTool.exe` |
| ffmpeg | 8.1.1-full_build (Gyan) | `…\WinGet\Packages\Gyan.FFmpeg…\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe` |
| ffprobe | 8.1.1-full_build (Gyan) | `…\WinGet\Packages\Gyan.FFmpeg…\ffmpeg-8.1.1-full_build\bin\ffprobe.exe` |
| restic | 0.19.1 (go1.26.4, windows/amd64) | `C:\Program Files\WinGet\Links\restic.exe` |

Notes:

- Python 3.14 has `tomllib` in the standard library, which is what `photolib/config.py`
  uses. No dependency is required to read `config.toml`.
- `v1/.venv` is a separate Python 3.14 environment and is not this build's interpreter.
- exiftool is invoked with `-stay_open` in step 10, not once per file.
