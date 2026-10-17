"""Tests for the Immich upload pass.

Every test runs against a temporary catalog, a temporary vault of a few bytes per
file, and a fake Immich server on 127.0.0.1 that speaks the two endpoints the pass
uses. Nothing here opens a path from config.toml or reaches the network.
"""

from __future__ import annotations

import hashlib
import json
import threading
import uuid
from email.parser import BytesParser
from email.policy import HTTP
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest

from photolib.immich import (
    Immich,
    ImmichRefused,
    Report,
    api_key,
    open_ledger,
    owed,
    run,
    sent,
    stacked,
    tiles,
)

KEY = "test-key"


def sha_of(seed: str) -> str:
    """A 64-hex string that reads as a hash without being one."""
    return (seed * 64)[:64]


class FakeImmich:
    """Assets keyed by the checksum of their bytes, as Immich deduplicates them."""

    def __init__(self) -> None:
        self.assets: dict[str, dict] = {}  # sha1 -> {"id", "filename", fields...}
        self.stacks: list[list[str]] = []
        self.fail_uploads = False
        fake = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *args) -> None:
                pass

            def answer(self, status: int, payload: dict) -> None:
                body = json.dumps(payload).encode()
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def do_POST(self) -> None:
                body = self.rfile.read(int(self.headers["Content-Length"]))
                if self.headers.get("x-api-key") != KEY:
                    return self.answer(401, {"message": "Invalid API key"})
                if self.path == "/api/assets":
                    if fake.fail_uploads:
                        return self.answer(500, {"message": "boom"})
                    return self.answer(*fake.upload(self.headers["Content-Type"], body))
                if self.path == "/api/stacks":
                    ids = json.loads(body)["assetIds"]
                    fake.stacks.append(ids)
                    return self.answer(201, {"id": f"stack-{len(fake.stacks)}", "primaryAssetId": ids[0]})
                return self.answer(404, {})

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.url = f"http://127.0.0.1:{self.server.server_port}"
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def upload(self, content_type: str, body: bytes) -> tuple[int, dict]:
        message = BytesParser(policy=HTTP).parsebytes(
            f"Content-Type: {content_type}\r\n\r\n".encode() + body
        )
        fields: dict[str, str] = {}
        data = b""
        filename = None
        for part in message.iter_parts():
            name = part.get_param("name", header="content-disposition")
            if name == "assetData":
                data = part.get_payload(decode=True)
                filename = part.get_filename()
            else:
                fields[name] = part.get_content().strip()
        checksum = hashlib.sha1(data).hexdigest()
        if checksum in self.assets:
            return 200, {"id": self.assets[checksum]["id"], "status": "duplicate"}
        asset = {"id": str(uuid.uuid4()), "filename": filename, "bytes": data, **fields}
        self.assets[checksum] = asset
        return 201, {"id": asset["id"], "status": "created"}

    def by_device_id(self, sha256: str) -> dict:
        return next(a for a in self.assets.values() if a["deviceAssetId"] == sha256)


@pytest.fixture
def immich():
    fake = FakeImmich()
    yield fake
    fake.server.shutdown()
    fake.server.server_close()


class Corpus:
    """Published tiles in a temporary catalog, and their bytes in a temporary vault."""

    def __init__(self, conn, root: Path) -> None:
        self.conn = conn
        self.vault = root / "vault"
        self.next_id = 0

    def file(self, seed: str, ext: str, name: str, *, taken_at="2024-07-04T14:51:35", write=True) -> str:
        sha256 = sha_of(seed)
        relpath = f"{sha256[:2]}\\{sha256[2:4]}\\{sha256}{ext}"
        self.conn.execute(
            "INSERT INTO file (sha256, size, ext, kind, taken_at, vault_relpath, state, feature_ver)"
            " VALUES (?, ?, ?, 'image', ?, ?, 'published', '{}')",
            (sha256, len(seed) * 3, ext, taken_at, relpath),
        )
        self.conn.execute(
            "INSERT INTO origin (path, root, ext, size, mtime_ns, sha256, seen_at)"
            " VALUES (?, 'sd', ?, ?, 1700000000000000000, ?, '2026-08-01')",
            (f"G:\\photos\\sd\\DCIM\\{name}", ext, len(seed) * 3, sha256),
        )
        if write:
            target = self.vault / relpath.replace("\\", "/")
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(seed.encode() * 3)
        return sha256

    def tile(self, *shas: str, sort_key: str = "2024-07-04T14:51:35") -> None:
        self.next_id += 1
        self.conn.execute(
            "INSERT INTO photo (id, rep_sha256, sort_key) VALUES (?, ?, ?)",
            (self.next_id, shas[0], sort_key),
        )
        for sha256 in shas:
            self.conn.execute(
                "INSERT INTO photo_member (sha256, photo_id) VALUES (?, ?)", (sha256, self.next_id)
            )
        self.conn.commit()


@pytest.fixture
def corpus(conn, tmp_path: Path) -> Corpus:
    return Corpus(conn, tmp_path)


@pytest.fixture
def ledger(tmp_path: Path):
    connection = open_ledger(tmp_path / "immich.sqlite3")
    yield connection
    connection.close()


def upload(corpus: Corpus, ledger, immich: FakeImmich, key: str = KEY) -> Report:
    return run(
        tiles(corpus.conn), ledger, Immich(immich.url, key), immich.url, corpus.vault, say=lambda _: None
    )


def pair(corpus: Corpus) -> tuple[str, str]:
    """A JPEG representative and its RAW, as one tile."""
    jpeg = corpus.file("a", ".jpg", "P1080096.JPG")
    raw = corpus.file("b", ".rw2", "P1080096.RW2")
    corpus.tile(jpeg, raw)
    return jpeg, raw


def test_uploads_every_member_and_stacks_the_pair_rep_first(corpus, ledger, immich) -> None:
    jpeg, raw = pair(corpus)
    alone = corpus.file("c", ".jpg", "P1080097.JPG")
    corpus.tile(alone, sort_key="2024-07-04T14:52:00")

    report = upload(corpus, ledger, immich)

    assert (report.created, report.duplicate, report.stacks) == (3, 0, 1)
    assert set(sent(ledger, immich.url)) == {jpeg, raw, alone}
    assert immich.stacks == [[immich.by_device_id(jpeg)["id"], immich.by_device_id(raw)["id"]]]
    assert stacked(ledger, immich.url) == {jpeg}


def test_sends_the_original_name_the_bytes_and_the_capture_time(corpus, ledger, immich) -> None:
    jpeg, _ = pair(corpus)

    upload(corpus, ledger, immich)

    asset = immich.by_device_id(jpeg)
    assert asset["filename"] == "P1080096.JPG"
    assert asset["bytes"] == b"aaa"
    assert asset["fileCreatedAt"] == "2024-07-04T14:51:35"
    assert asset["fileModifiedAt"] == "2023-11-14T22:13:20.000Z"
    assert asset["deviceId"] == "photolib"


def test_a_capture_time_the_catalog_lacks_falls_back_to_the_file_time(corpus, ledger, immich) -> None:
    sha256 = corpus.file("a", ".jpg", "a.jpg", taken_at=None)
    corpus.tile(sha256)

    upload(corpus, ledger, immich)

    assert immich.by_device_id(sha256)["fileCreatedAt"] == "2023-11-14T22:13:20.000Z"


def test_a_rerun_of_a_finished_pass_sends_nothing(corpus, ledger, immich) -> None:
    pair(corpus)
    upload(corpus, ledger, immich)

    report = upload(corpus, ledger, immich)

    assert (report.owed_files, report.owed_stacks, report.created, report.stacks) == (0, 0, 0, 0)
    assert len(immich.stacks) == 1


def test_a_file_the_server_already_holds_is_recorded_and_still_stacked(corpus, ledger, immich) -> None:
    jpeg, raw = pair(corpus)
    # The phone app got there first, under a name of its own.
    immich.assets[hashlib.sha1(b"aaa").hexdigest()] = {"id": "from-the-phone", "deviceAssetId": "IMG_0001"}

    report = upload(corpus, ledger, immich)

    assert (report.created, report.duplicate) == (1, 1)
    assert sent(ledger, immich.url)[jpeg] == "from-the-phone"
    assert immich.stacks == [["from-the-phone", immich.by_device_id(raw)["id"]]]


def test_a_bad_key_stops_the_pass_before_anything_is_recorded(corpus, ledger, immich) -> None:
    pair(corpus)

    with pytest.raises(ImmichRefused):
        upload(corpus, ledger, immich, key="wrong")

    assert sent(ledger, immich.url) == {}
    assert immich.assets == {}


def test_a_failed_upload_is_named_and_a_rerun_retries_it(corpus, ledger, immich) -> None:
    jpeg, raw = pair(corpus)
    immich.fail_uploads = True

    report = upload(corpus, ledger, immich)

    assert [line.split(":")[0] for line in report.failed] == [jpeg, raw]
    assert (report.created, report.stacks) == (0, 0)

    immich.fail_uploads = False
    report = upload(corpus, ledger, immich)

    assert (report.created, report.stacks, report.failed) == (2, 1, [])


def test_a_file_missing_from_the_vault_is_named_and_its_pair_waits(corpus, ledger, immich) -> None:
    jpeg = corpus.file("a", ".jpg", "a.jpg")
    raw = corpus.file("b", ".rw2", "a.rw2", write=False)
    corpus.tile(jpeg, raw)

    report = upload(corpus, ledger, immich)

    assert report.missing == [raw]
    assert (report.created, report.stacks) == (1, 0)
    assert immich.stacks == []


def test_only_published_tile_members_are_owed(corpus, ledger) -> None:
    kept = corpus.file("a", ".jpg", "a.jpg")
    corpus.tile(kept)
    corpus.file("b", ".jpg", "b.jpg")  # in the vault, in no tile: triage excluded it
    corpus.conn.commit()

    report = Report()
    owed(tiles(corpus.conn), sent(ledger, "x"), stacked(ledger, "x"), report)

    assert (report.tiles, report.files, report.owed_files, report.owed_bytes) == (1, 1, 1, 3)


def test_the_ledger_is_per_server(corpus, ledger, immich) -> None:
    pair(corpus)
    upload(corpus, ledger, immich)

    report = Report()
    owed(tiles(corpus.conn), sent(ledger, "https://elsewhere"), stacked(ledger, "https://elsewhere"), report)

    assert (report.owed_files, report.owed_stacks) == (2, 1)


def test_the_key_comes_from_the_environment_first(tmp_path: Path) -> None:
    dotenv = tmp_path / ".env"
    dotenv.write_text("OTHER=1\nIMMICH='from-file'\n", encoding="utf-8")

    assert api_key({"IMMICH": "from-env"}, dotenv) == "from-env"
    assert api_key({}, dotenv) == "from-file"


def test_no_key_anywhere_is_refused_without_echoing_anything(tmp_path: Path) -> None:
    with pytest.raises(ImmichRefused, match="no API key"):
        api_key({}, tmp_path / ".env")


def test_a_url_that_is_not_http_is_refused() -> None:
    with pytest.raises(ImmichRefused):
        Immich("photos.chrisj.uk", KEY)
