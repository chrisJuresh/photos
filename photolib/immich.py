"""Uploads the published set to an Immich server, one way, and remembers what it sent.

The vault is browsed here; Immich is somewhere else to browse the same photographs
from — a phone, another machine. This pass is the only thing that crosses between
them, and it crosses in one direction: it reads the catalog and `vault_root` and
writes nothing to either. **Nothing here deletes**, on the server or in the vault,
so a tile excluded after it was uploaded stays in Immich until someone removes it
there by hand. It is a copy for browsing and not the backup of `G:\\vault` —
`archive/PLAN.md` "Open decisions" 5 is still open, and this does not close it.

What is uploaded is every member of every tile: `photo_member`, which is the
triage-kept set and nothing else. A RAW and its JPEG are one tile here and two
files there, so both go up and are made one Immich *stack* with the
representative as its primary, which is the nearest thing Immich has to a tile.
The grid's own stacks (`stack_member`) are not mirrored — that is a later ticket.
Each file goes up under its original name, read from `origin`, because a vault
object is named by its sha256 and a sha256 is no name to browse by.

A ledger of its own, `immich.sqlite3` beside the catalog, records which sha256 is
which Immich asset on which server. It is not a migrated database: this pass
creates it. It is what makes the pass resumable — 435 GB over a home uplink is a
day, and an interruption costs the file in flight — and what makes a re-run of a
finished pass upload nothing. Immich deduplicates by checksum on its own, and an
upload it already holds comes back as `duplicate` with the existing asset's id;
that is recorded like any other, so a photograph the phone app already sent is
stacked rather than sent twice.

The API key is read from `IMMICH` in the environment, or failing that from the
`.env` beside this checkout, which git ignores. It is sent as a header and never
printed. `--dry-run` reports what is owed and opens no connection at all.

This reads `G:`. Run it in the background and leave the drive alone while it does.
"""

from __future__ import annotations

import argparse
import http.client
import itertools
import json
import ntpath
import os
import sqlite3
import ssl
import sys
import time
import uuid
from collections.abc import Callable, Iterator, Mapping
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import urlsplit

from photolib import db
from photolib.config import load
from photolib.reveal import RevealRefused, resolve

DEFAULT_URL = "https://photos.chrisj.uk"
KEY = "IMMICH"
DOTENV = Path(__file__).resolve().parent.parent / ".env"
LEDGER = "immich.sqlite3"  # beside the catalog, on the NVMe
DEVICE_ID = "photolib"
CHUNK = 1 << 20
TIMEOUT_SECONDS = 600
PROGRESS_SECONDS = 30


class ImmichRefused(RuntimeError):
    """The server or the setup said no to everything, not to one file. Stop."""


class UploadFailed(RuntimeError):
    """One request failed. Counted and named; a re-run tries it again."""


# --- what to upload ----------------------------------------------------------

# Representative first within a tile, so it is the stack's primary. The origin
# is the alphabetically first path the bytes were ever seen at: any of them is a
# true name for the file, and a fixed choice keeps a re-run's names stable.
_MEMBERS_QUERY = """
SELECT photo.id, photo.rep_sha256, m.sha256, file.size, file.vault_relpath,
       file.taken_at, origin.path, origin.mtime_ns
FROM photo
JOIN photo_member AS m ON m.photo_id = photo.id
JOIN file ON file.sha256 = m.sha256
JOIN origin ON origin.path = (
  SELECT path FROM origin AS o WHERE o.sha256 = m.sha256 ORDER BY path LIMIT 1
)
WHERE file.state = 'published'
ORDER BY photo.sort_key, photo.id, m.sha256 <> photo.rep_sha256, m.sha256
"""


@dataclass(frozen=True)
class Member:
    sha256: str
    size: int
    vault_relpath: str
    filename: str
    created: str
    modified: str


@dataclass(frozen=True)
class Tile:
    rep_sha256: str
    members: tuple[Member, ...]  # representative first


def _iso_from_ns(mtime_ns: int | None) -> str:
    seconds = (mtime_ns or 0) / 1e9
    return datetime.fromtimestamp(seconds, UTC).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def tiles(conn: sqlite3.Connection) -> list[Tile]:
    """Every published tile with its members, in capture order."""
    result = []
    rows = conn.execute(_MEMBERS_QUERY)
    for (_, rep), group in itertools.groupby(rows, key=lambda row: (row[0], row[1])):
        members = []
        for _, _, sha256, size, relpath, taken_at, path, mtime_ns in group:
            modified = _iso_from_ns(mtime_ns)
            members.append(
                Member(sha256, size, relpath, ntpath.basename(path), taken_at or modified, modified)
            )
        result.append(Tile(rep, tuple(members)))
    return result


# --- the ledger --------------------------------------------------------------

_LEDGER_SCHEMA = """
CREATE TABLE IF NOT EXISTS asset (
  server   TEXT NOT NULL,
  sha256   TEXT NOT NULL,
  asset_id TEXT NOT NULL,
  status   TEXT NOT NULL,   -- created | duplicate, as the server answered
  at       TEXT NOT NULL,
  PRIMARY KEY (server, sha256)
) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS stack (
  server         TEXT NOT NULL,
  primary_sha256 TEXT NOT NULL,
  stack_id       TEXT NOT NULL,
  at             TEXT NOT NULL,
  PRIMARY KEY (server, primary_sha256)
) WITHOUT ROWID;
"""


def open_ledger(path: Path) -> sqlite3.Connection:
    conn = sqlite3.connect(path, isolation_level=None)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.executescript(_LEDGER_SCHEMA)
    return conn


def _now() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def sent(ledger: sqlite3.Connection, server: str) -> dict[str, str]:
    """sha256 -> Immich asset id, for everything this server already holds."""
    return dict(ledger.execute("SELECT sha256, asset_id FROM asset WHERE server = ?", (server,)))


def stacked(ledger: sqlite3.Connection, server: str) -> set[str]:
    rows = ledger.execute("SELECT primary_sha256 FROM stack WHERE server = ?", (server,))
    return {row[0] for row in rows}


# --- the key -----------------------------------------------------------------


def api_key(env: Mapping[str, str] = os.environ, dotenv: Path = DOTENV) -> str:
    """`IMMICH` from the environment, else from `.env`. Never echoed anywhere."""
    if env.get(KEY):
        return env[KEY]
    if dotenv.is_file():
        for line in dotenv.read_text(encoding="utf-8").splitlines():
            name, sep, value = line.partition("=")
            if sep and name.strip() == KEY:
                value = value.strip().strip("'\"")
                if value:
                    return value
    raise ImmichRefused(f"no API key: set {KEY} in the environment or in {dotenv}")


# --- the server --------------------------------------------------------------


def _field(boundary: str, name: str, value: str) -> bytes:
    return (
        f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'
    ).encode()


def _safe_filename(name: str) -> str:
    """A header value cannot carry a quote or a line break; a filename can."""
    return "".join("_" if c in '"\r\n' else c for c in name)


class Immich:
    """The two calls this pass makes, and nothing else of Immich's API."""

    def __init__(self, url: str, key: str, *, timeout: float = TIMEOUT_SECONDS) -> None:
        parts = urlsplit(url)
        if parts.scheme not in ("http", "https") or not parts.hostname:
            raise ImmichRefused(f"not an http(s) URL: {url!r}")
        self.scheme = parts.scheme
        self.host = parts.hostname
        self.port = parts.port
        self.key = key
        self.timeout = timeout

    def _connection(self) -> http.client.HTTPConnection:
        if self.scheme == "https":
            return http.client.HTTPSConnection(
                self.host, self.port, timeout=self.timeout, context=ssl.create_default_context()
            )
        return http.client.HTTPConnection(self.host, self.port, timeout=self.timeout)

    def _send(self, method: str, path: str, body, headers: dict[str, str]) -> tuple[int, dict]:
        conn = self._connection()
        try:
            conn.request(method, path, body=body, headers={**headers, "x-api-key": self.key})
            response = conn.getresponse()
            payload = response.read()
        except (OSError, http.client.HTTPException) as exc:
            raise UploadFailed(f"{method} {path}: {exc}") from exc
        finally:
            conn.close()
        if response.status in (401, 403):
            raise ImmichRefused(
                f"{method} {path} answered {response.status}: check the key and that it carries"
                " the asset.upload and stack.create permissions"
            )
        if not 200 <= response.status < 300:
            raise UploadFailed(f"{method} {path} answered {response.status}: {payload[:200]!r}")
        try:
            return response.status, json.loads(payload)
        except ValueError as exc:
            raise UploadFailed(f"{method} {path}: response was not JSON") from exc

    def upload(self, source: Path, member: Member) -> tuple[str, str]:
        """Stream one file up. Returns (asset id, created | duplicate)."""
        boundary = uuid.uuid4().hex
        head = b"".join(
            [
                _field(boundary, "deviceAssetId", member.sha256),
                _field(boundary, "deviceId", DEVICE_ID),
                _field(boundary, "fileCreatedAt", member.created),
                _field(boundary, "fileModifiedAt", member.modified),
                (
                    f"--{boundary}\r\nContent-Disposition: form-data; name=\"assetData\";"
                    f' filename="{_safe_filename(member.filename)}"\r\n'
                    "Content-Type: application/octet-stream\r\n\r\n"
                ).encode(),
            ]
        )
        tail = f"\r\n--{boundary}--\r\n".encode()
        size = source.stat().st_size

        def body() -> Iterator[bytes]:
            yield head
            with source.open("rb") as handle:
                while chunk := handle.read(CHUNK):
                    yield chunk
            yield tail

        _, answer = self._send(
            "POST",
            "/api/assets",
            body(),
            {
                "Content-Type": f"multipart/form-data; boundary={boundary}",
                "Content-Length": str(len(head) + size + len(tail)),
                "Accept": "application/json",
            },
        )
        return answer["id"], answer.get("status", "created")

    def stack(self, asset_ids: list[str]) -> str:
        """One Immich stack of these assets, the first as its primary."""
        _, answer = self._send(
            "POST",
            "/api/stacks",
            json.dumps({"assetIds": asset_ids}).encode(),
            {"Content-Type": "application/json", "Accept": "application/json"},
        )
        return answer["id"]


# --- the pass ----------------------------------------------------------------


@dataclass
class Report:
    tiles: int = 0
    files: int = 0
    owed_files: int = 0
    owed_bytes: int = 0
    owed_stacks: int = 0
    created: int = 0
    duplicate: int = 0
    stacks: int = 0
    missing: list[str] = field(default_factory=list)  # sha256s with no file in the vault
    failed: list[str] = field(default_factory=list)  # "<sha256 or stack>: <reason>"


def owed(all_tiles: list[Tile], done: Mapping[str, str], done_stacks: set[str], report: Report) -> None:
    report.tiles = len(all_tiles)
    for tile in all_tiles:
        report.files += len(tile.members)
        for member in tile.members:
            if member.sha256 not in done:
                report.owed_files += 1
                report.owed_bytes += member.size
        if len(tile.members) > 1 and tile.rep_sha256 not in done_stacks:
            report.owed_stacks += 1


def run(
    all_tiles: list[Tile],
    ledger: sqlite3.Connection,
    client: Immich,
    server: str,
    vault_root: Path,
    *,
    say: Callable[[str], None] = print,
    clock: Callable[[], float] = time.monotonic,
) -> Report:
    """Upload what the ledger does not hold, then stack each pair. Resumable."""
    done = sent(ledger, server)
    done_stacks = stacked(ledger, server)
    report = Report()
    owed(all_tiles, done, done_stacks, report)

    started = last = clock()
    sent_bytes = 0
    for tile in all_tiles:
        for member in tile.members:
            if member.sha256 in done:
                continue
            try:
                source = resolve(member.vault_relpath, vault_root, vault_root)
            except RevealRefused:
                report.missing.append(member.sha256)
                continue
            try:
                asset_id, status = client.upload(source, member)
            except UploadFailed as exc:
                report.failed.append(f"{member.sha256}: {exc}")
                continue
            ledger.execute(
                "INSERT OR REPLACE INTO asset VALUES (?, ?, ?, ?, ?)",
                (server, member.sha256, asset_id, status, _now()),
            )
            done[member.sha256] = asset_id
            if status == "duplicate":
                report.duplicate += 1
            else:
                report.created += 1
            sent_bytes += member.size
            if clock() - last >= PROGRESS_SECONDS:
                last = clock()
                rate = sent_bytes / max(last - started, 1e-9)
                left = report.owed_bytes - sent_bytes
                say(
                    f"  {report.created + report.duplicate:,}/{report.owed_files:,} files,"
                    f" {sent_bytes / 1e9:,.1f}/{report.owed_bytes / 1e9:,.1f} GB,"
                    f" {rate / 1e6:,.1f} MB/s, ~{left / max(rate, 1) / 3600:,.1f}h left"
                )

        if len(tile.members) < 2 or tile.rep_sha256 in done_stacks:
            continue
        if not all(member.sha256 in done for member in tile.members):
            continue  # a member is missing or failed; a re-run stacks it
        try:
            stack_id = client.stack([done[member.sha256] for member in tile.members])
        except UploadFailed as exc:
            report.failed.append(f"stack {tile.rep_sha256}: {exc}")
            continue
        ledger.execute(
            "INSERT OR REPLACE INTO stack VALUES (?, ?, ?, ?)",
            (server, tile.rep_sha256, stack_id, _now()),
        )
        done_stacks.add(tile.rep_sha256)
        report.stacks += 1
    return report


def server_name(url: str) -> str:
    """What the ledger is keyed on: the URL without a trailing slash."""
    return url.rstrip("/")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m photolib.immich", description=__doc__.split("\n")[0])
    parser.add_argument("--url", default=DEFAULT_URL, help=f"the Immich server (default {DEFAULT_URL})")
    parser.add_argument("--dry-run", action="store_true", help="say what is owed; open no connection")
    args = parser.parse_args(argv)
    sys.stdout.reconfigure(errors="backslashreplace")

    config = load()
    server = server_name(args.url)
    conn = db.connect(read_only=True)
    try:
        all_tiles = tiles(conn)
    finally:
        conn.close()
    ledger = open_ledger(config.catalog_db.parent / LEDGER)
    try:
        if args.dry_run:
            report = Report()
            owed(all_tiles, sent(ledger, server), stacked(ledger, server), report)
            print(
                f"{server}: {report.tiles:,} tiles, {report.files:,} files."
                f" Owed: {report.owed_files:,} files ({report.owed_bytes / 1e9:,.1f} GB)"
                f" and {report.owed_stacks:,} stacks. Nothing was sent."
            )
            return 0
        try:
            client = Immich(server, api_key())
            print(f"Uploading to {server}. Leave G: alone until this finishes.")
            report = run(all_tiles, ledger, client, server, config.vault_root)
        except ImmichRefused as exc:
            print(f"Refused: {exc}. What was stored before this is kept; a re-run resumes.")
            return 2
    finally:
        ledger.close()

    print(
        f"{report.created:,} uploaded, {report.duplicate:,} already on the server,"
        f" {report.stacks:,} stacks made."
    )
    for sha256 in report.missing:
        print(f"  missing from the vault: {sha256}")
    for line in report.failed:
        print(f"  failed: {line}")
    if report.missing or report.failed:
        print("A re-run retries every file and stack named above.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
