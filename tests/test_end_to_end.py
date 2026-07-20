from __future__ import annotations

import hashlib
import sqlite3
from pathlib import Path

from PIL import Image, PngImagePlugin

from media_vault.cli import main
from media_vault.core import executable_path


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def snapshot_tree(root: Path) -> dict[str, tuple[int, int, int, str]]:
    result: dict[str, tuple[int, int, int, str]] = {}
    for path in sorted(item for item in root.rglob("*") if item.is_file()):
        st = path.stat()
        result[str(path.relative_to(root))] = (st.st_size, st.st_mtime_ns, st.st_ctime_ns, digest(path))
    return result


def create_corpus(source: Path) -> None:
    (source / "a").mkdir(parents=True)
    (source / "b").mkdir(parents=True)
    (source / "unicode-Δ").mkdir(parents=True)

    red = Image.new("RGB", (32, 24), (230, 20, 20))
    red.save(source / "a" / "red.png")
    (source / "b" / "red-exact.weird").write_bytes((source / "a" / "red.png").read_bytes())

    png_info = PngImagePlugin.PngInfo()
    png_info.add_text("Comment", "same decoded pixels, different metadata")
    red.save(source / "a" / "red-metadata.png", pnginfo=png_info)

    Image.new("RGB", (17, 13), (10, 200, 30)).save(source / "a" / "same.name.jpg", quality=94)
    Image.new("RGB", (17, 13), (20, 30, 220)).save(source / "b" / "same.name.jpg", quality=94)
    Image.new("RGB", (9, 11), (123, 45, 67)).save(source / "unicode-Δ" / "雪.multi.part.jpeg")

    wrong = source / "a" / "actually-png.jpg"
    Image.new("RGB", (8, 8), (1, 2, 3)).save(wrong, format="PNG")
    (source / "a" / "damaged.jpg").write_bytes(b"this is deliberately malformed image data")
    (source / "notes.txt").write_text("not media", encoding="utf-8")

    exif = Image.Exif()
    exif[271] = "Synthetic Camera Co"
    exif[272] = "Model Test"
    exif[36867] = "2026:07:19 12:34:56"
    exif[42033] = "SERIAL-123"
    raw_image = Image.new("RGB", (40, 30), (100, 110, 120))
    raw_image.save(source / "a" / "IMG_0042.dng", format="TIFF", exif=exif)
    raw_image.save(source / "a" / "IMG_0042-edit.jpg", format="JPEG", quality=92, exif=exif)


def scalar(db: sqlite3.Connection, sql: str, params: tuple = ()) -> int:
    return int(db.execute(sql, params).fetchone()[0])


def test_full_synthetic_workflow(tmp_path: Path) -> None:
    source = tmp_path / "source"
    vault = tmp_path / "vault"
    source.mkdir()
    create_corpus(source)
    before = snapshot_tree(source)
    exiftool = executable_path("exiftool")
    assert exiftool is not None

    common = [
        "--source", str(source), "--vault", str(vault), "--exiftool", str(exiftool), "--allow-unsafe-atime",
    ]
    assert main(["preflight", *common]) == 0
    assert snapshot_tree(source) == before
    assert not any((vault / "objects").rglob("*.blob"))

    db_path = vault / "state" / "manifest.sqlite3"
    db = sqlite3.connect(db_path)
    db.row_factory = sqlite3.Row
    media_sources = scalar(db, "SELECT COUNT(*) FROM source_files WHERE discovery_status='media'")
    assert media_sources == 10
    unique_assets = scalar(db, "SELECT COUNT(*) FROM assets")
    assert unique_assets == 9
    assert scalar(db, "SELECT COUNT(*) FROM source_versions WHERE extension_mismatch=1") >= 1
    assert scalar(
        db,
        """SELECT COUNT(*) FROM source_files sf JOIN source_versions sv ON sv.source_version_id=sf.current_version_id
           WHERE sf.path_text LIKE '%damaged.jpg' AND sf.asset_id IS NOT NULL
             AND sv.warnings_json LIKE '%retained from extension evidence%'""",
    ) == 1
    assert scalar(db, "SELECT COUNT(*) FROM raw_jpeg_groups") == 0
    db.close()

    # Capacity can be finalized from the durable completed scan without source access.
    assert main(["finalize-preflight", "--vault", str(vault)]) == 0
    assert snapshot_tree(source) == before

    assert main(["import", *common, "--execute"]) == 0
    assert snapshot_tree(source) == before
    objects = list((vault / "objects").rglob("*.blob"))
    assert len(objects) == unique_assets

    object_snapshot = {str(path.relative_to(vault)): digest(path) for path in objects}
    assert main(["import", *common, "--execute"]) == 0
    assert {str(path.relative_to(vault)): digest(path) for path in (vault / "objects").rglob("*.blob")} == object_snapshot
    assert snapshot_tree(source) == before

    assert main(["analyze", "--vault", str(vault)]) == 0
    db = sqlite3.connect(db_path)
    assert scalar(db, "SELECT COUNT(*) FROM relationships WHERE relationship_type='identical_decoded_pixels'") >= 1
    assert scalar(db, "SELECT COUNT(*) FROM relationships WHERE relationship_type='raw_jpeg_candidate'") >= 1
    assert scalar(db, "SELECT COUNT(*) FROM raw_jpeg_groups") == 1
    db.close()

    assert main(["validate", "--vault", str(vault)]) == 0
    db = sqlite3.connect(db_path)
    assert scalar(db, "SELECT COUNT(*) FROM assets WHERE object_status='verified'") == unique_assets
    db.close()

    recovery = tmp_path / "recovery.sqlite3"
    assert main(["rebuild-index", "--vault", str(vault), "--output", str(recovery)]) == 0
    rebuilt = sqlite3.connect(recovery)
    assert scalar(rebuilt, "SELECT COUNT(*) FROM asset_records") == unique_assets
    assert scalar(rebuilt, "SELECT COUNT(*) FROM asset_records WHERE object_status='verified'") == unique_assets
    rebuilt.close()

    changed = source / "b" / "same.name.jpg"
    changed.write_bytes(changed.read_bytes() + b"synthetic change")
    assert main(["preflight", *common]) == 0
    db = sqlite3.connect(db_path)
    versions = scalar(
        db,
        """SELECT COUNT(*) FROM source_versions sv JOIN source_files sf USING(source_file_id)
           WHERE sf.path_text=?""",
        (str(changed),),
    )
    assert versions >= 2
    assert scalar(
        db,
        """SELECT COUNT(DISTINCT sv.asset_id) FROM source_versions sv JOIN source_files sf USING(source_file_id)
           WHERE sf.path_text=?""",
        (str(changed),),
    ) == 2
    db.close()


def test_import_requires_execute(tmp_path: Path) -> None:
    source = tmp_path / "source"
    vault = tmp_path / "vault"
    source.mkdir()
    Image.new("RGB", (2, 2), (0, 0, 0)).save(source / "x.png")
    exiftool = executable_path("exiftool")
    assert exiftool is not None
    args = ["--source", str(source), "--vault", str(vault), "--exiftool", str(exiftool), "--allow-unsafe-atime"]
    assert main(["preflight", *args]) == 0
    assert main(["import", *args]) == 1
    assert not any((vault / "objects").rglob("*.blob"))
