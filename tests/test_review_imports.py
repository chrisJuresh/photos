from __future__ import annotations

import hashlib
import os
from pathlib import Path
from typing import Any

import pytest
from PIL import Image

import media_vault.review_imports as review_module
from media_vault.config import ReviewConfig
from media_vault.core import FullHashes, VaultLayout, hash_file, utc_now
from media_vault.db import ManifestDB
from media_vault.review_imports import (
    DecisionConflictError,
    DecisionRequest,
    ImportDiscoveryService,
    ImportManifestService,
    ManifestCursor,
    ManifestPageRequest,
)


class SyntheticMetadataReader:
    def read_batch(self, paths: list[Path]) -> list[dict[str, Any]]:
        output: list[dict[str, Any]] = []
        for path in paths:
            lowered = path.name.casefold()
            if lowered == "damaged.jpg":
                output.append({"File:MIMEType": "image/jpeg", "File:FileType": "JPEG", "File:Error": "corrupt"})
            elif path.suffix.casefold() == ".cr3":
                output.append({"File:MIMEType": "image/x-canon-cr3", "File:FileType": "CR3"})
            elif path.suffix.casefold() in {".jpg", ".jpeg"}:
                output.append({"File:MIMEType": "image/jpeg", "File:FileType": "JPEG"})
            elif path.suffix.casefold() == ".mp4":
                output.append({"File:MIMEType": "video/mp4", "File:FileType": "MP4"})
            elif lowered.endswith((".xmp", ".txt")):
                output.append({"File:MIMEType": "text/plain", "File:FileType": "TXT"})
            elif path.suffix.casefold() == ".png" or "unusual" in lowered:
                output.append({"File:MIMEType": "image/png", "File:FileType": "PNG"})
            else:
                output.append({})
        return output


def _tree_snapshot(root: Path) -> dict[str, tuple[str, int, int, int, int, str | None]]:
    result: dict[str, tuple[str, int, int, int, int, str | None]] = {}
    for path in sorted(root.rglob("*")):
        st = path.stat(follow_symlinks=False)
        digest = hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None
        result[str(path.relative_to(root))] = (
            "file" if path.is_file() else "directory",
            st.st_size,
            st.st_mtime_ns,
            st.st_ctime_ns,
            int(getattr(st, "st_file_attributes", 0)),
            digest,
        )
    return result


def _make_png(path: Path, color: tuple[int, int, int]) -> None:
    Image.new("RGB", (8, 6), color).save(path)


def _insert_existing_asset(db: ManifestDB, layout: VaultLayout, content: bytes) -> FullHashes:
    object_path = layout.objects / "sha256" / "aa" / "bb" / "existing.blob"
    object_path.parent.mkdir(parents=True, exist_ok=True)
    object_path.write_bytes(content)
    hashes = hash_file(object_path)
    now = utc_now()
    db.execute(
        """INSERT INTO runs(
               run_id,command,status,started_at,completed_at,vault_root,host,tool_version,arguments_json
           ) VALUES(?,?,?,?,?,?,?,?,?)""",
        ("run-existing", "synthetic", "completed", now, now, str(layout.root), "test", "test", "{}"),
    )
    db.execute(
        """INSERT INTO exact_groups(
               exact_group_id,size_bytes,sha256,blake3,sha512,verification_method,created_at
           ) VALUES(?,?,?,?,?,?,?)""",
        (hashes.exact_group_id, hashes.size_bytes, hashes.sha256, hashes.blake3, hashes.sha512, "test", now),
    )
    db.execute(
        """INSERT INTO assets(
               asset_id,exact_group_id,size_bytes,sha256,blake3,sha512,hash_algorithm_versions_json,
               media_kind,object_relpath,object_status,created_run_id,created_at,updated_at
           ) VALUES(?,?,?,?,?,?,?,'image',?,'verified','run-existing',?,?)""",
        (
            hashes.asset_id,
            hashes.exact_group_id,
            hashes.size_bytes,
            hashes.sha256,
            hashes.blake3,
            hashes.sha512,
            "{}",
            str(object_path.relative_to(layout.root)),
            now,
            now,
        ),
    )
    db.commit()
    return hashes


def _all_manifest(service: ImportManifestService, batch_id: str, limit: int = 3):
    items = []
    cursor = None
    while True:
        page = service.manifest_page(ManifestPageRequest(batch_id=batch_id, limit=limit, after=cursor))
        items.extend(page.items)
        if page.next_cursor is None:
            return items
        cursor = page.next_cursor


def test_complete_review_manifest_decisions_rescan_and_immutability(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    inbox = tmp_path / "inbox"
    batch_root = inbox / "Batch Δ"
    nested = batch_root / "nested"
    reparse = batch_root / "reparse-target"
    second_batch = inbox / "second-batch"
    legacy_source = tmp_path / "legacy-immutable-source"
    for directory in (nested, reparse, second_batch, legacy_source):
        directory.mkdir(parents=True, exist_ok=True)
    _make_png(batch_root / "photo.png", (20, 30, 40))
    (batch_root / "photo.png.xmp").write_text("<xmp>sidecar</xmp>", encoding="utf-8")
    (batch_root / "unpaired.xmp").write_text("not associated", encoding="utf-8")
    _make_png(nested / "雪.multi.part.png", (1, 2, 3))
    (nested / "unusual.multi.odd").write_bytes((batch_root / "photo.png").read_bytes())
    _make_png(nested / "new-unique.png", (11, 12, 13))
    (nested / "new-unique.copy").write_bytes((nested / "new-unique.png").read_bytes())
    (nested / "clip.mp4").write_bytes(b"\x00\x00\x00\x18ftypisomsynthetic-video")
    (nested / "IMG_0001.CR3").write_bytes(b"synthetic raw candidate")
    _make_png(nested / "IMG_0001-edit.jpg", (80, 90, 100))
    (nested / "damaged.jpg").write_bytes(b"not a decodable jpeg")
    (batch_root / "notes.txt").write_text("unrelated", encoding="utf-8")
    _make_png(reparse / "must-not-be-followed.png", (9, 9, 9))
    (inbox / "loose-file.jpg").write_bytes(b"not a batch")
    (legacy_source / "legacy.bin").write_bytes(b"legacy immutable bytes")

    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    db = ManifestDB(layout.database)
    existing_hashes = _insert_existing_asset(db, layout, (batch_root / "photo.png").read_bytes())
    config = ReviewConfig(vault_root=layout.root, inbox_root=inbox, derivative_root=tmp_path / "derivatives")
    phases: list[str] = []

    real_reparse_check = review_module.file_is_reparse_or_symlink

    def synthetic_reparse(entry: os.DirEntry[str]) -> bool:
        return entry.name == "reparse-target" or real_reparse_check(entry)

    monkeypatch.setattr(review_module, "file_is_reparse_or_symlink", synthetic_reparse)
    discovery = ImportDiscoveryService(
        db,
        layout,
        config,
        metadata_reader=SyntheticMetadataReader(),
        allow_unsafe_atime=True,
        immutable_source_roots=(legacy_source,),
        metadata_batch_size=3,
        phase_hook=lambda phase, _batch_id: phases.append(phase),
    )
    inbox_before = _tree_snapshot(inbox)
    source_before = _tree_snapshot(legacy_source)
    objects_before = _tree_snapshot(layout.objects)

    batches = discovery.discover_batches()
    assert [batch.batch_name for batch in batches] == ["Batch Δ", "second-batch"]
    batch = batches[0]
    summary = discovery.scan_batch(batch.batch_id)
    service = ImportManifestService(db, config)
    items = _all_manifest(service, batch.batch_id)

    assert phases == ["discovering", "hashing", "matching"]
    assert summary.status == "awaiting_review"
    assert summary.traversal_complete is True
    assert summary.discovered_item_count == len(items)
    assert {item.relative_path_text for item in items}.isdisjoint(
        {str(Path("reparse-target") / "must-not-be-followed.png")}
    )
    assert next(item for item in items if item.relative_path_text == "reparse-target").entry_kind == "reparse"
    photo_match = next(item for item in items if item.relative_path_text == "photo.png")
    assert photo_match.match_outcome == "exact_match", (photo_match.error, photo_match.warnings)
    assert next(item for item in items if item.relative_path_text == "photo.png").matched_asset_id == existing_hashes.asset_id
    unusual = next(item for item in items if item.relative_path_text == "nested\\unusual.multi.odd")
    assert unusual.classification == "photo"
    assert unusual.signature_kind == "image"
    assert unusual.unusual_extension is True
    assert unusual.classification_evidence["discovery_basis"] == "exiftool_mime+exiftool_format+signature"
    assert unusual.stat_snapshot["mtime_ns"] is not None
    assert next(item for item in items if item.relative_path_text == "nested\\damaged.jpg").classification == "corrupt"
    assert next(item for item in items if item.relative_path_text == "nested\\damaged.jpg").proposed_decision == "include"
    assert next(item for item in items if item.relative_path_text == "notes.txt").effective_decision == "exclude"
    assert next(item for item in items if item.relative_path_text == "unpaired.xmp").classification == "non_media"
    sidecar = next(item for item in items if item.relative_path_text == "photo.png.xmp")
    photo = next(item for item in items if item.relative_path_text == "photo.png")
    assert sidecar.classification == "sidecar"
    assert sidecar.associated_sidecar_of_item_id == photo.item_id
    raw = next(item for item in items if item.relative_path_text == "nested\\IMG_0001.CR3")
    jpeg = next(item for item in items if item.relative_path_text == "nested\\IMG_0001-edit.jpg")
    assert raw.raw_jpeg_candidates[0]["jpeg_item_id"] == jpeg.item_id
    assert jpeg.raw_jpeg_candidates[0]["raw_item_id"] == raw.item_id
    batch_duplicates = {
        item.match_outcome
        for item in items
        if item.relative_path_text in {"nested\\new-unique.copy", "nested\\new-unique.png"}
    }
    assert batch_duplicates == {"new_asset", "batch_exact_duplicate"}

    corrupt_page = service.manifest_page(
        ManifestPageRequest(batch_id=batch.batch_id, limit=20, classifications=("corrupt",))
    )
    assert [item.relative_path_text for item in corrupt_page.items] == ["nested\\damaged.jpg"]
    root_progress = next(row for row in service.folder_progress(batch.batch_id) if row["relative_path_text"] == ".")
    assert root_progress["subtree_item_count"] == summary.discovered_item_count
    assert root_progress["subtree_file_count"] == summary.file_count
    assert root_progress["subtree_folder_count"] == summary.folder_count
    assert root_progress["subtree_other_count"] == summary.other_count
    assert root_progress["subtree_bytes"] == summary.total_bytes
    assert root_progress["classification_counts"] == summary.classification_counts
    assert root_progress["match_outcome_counts"] == summary.match_outcome_counts
    assert sum(summary.classification_counts.values()) == summary.discovered_item_count

    decision = service.set_decision(
        DecisionRequest(photo.item_id, "exclude", "Not part of this reviewed batch", expected_revision=0)
    )
    assert decision.revision == 1
    with pytest.raises(DecisionConflictError, match="expected 0, found 1"):
        service.set_decision(DecisionRequest(photo.item_id, "include", expected_revision=0))
    assert service.decision_history(photo.item_id)[0]["decision"] == "exclude"
    assert _tree_snapshot(inbox) == inbox_before
    assert _tree_snapshot(legacy_source) == source_before
    assert _tree_snapshot(layout.objects) == objects_before
    assert len(list(layout.objects.rglob("*.blob"))) == 1

    db.close()
    db = ManifestDB(layout.database)
    service = ImportManifestService(db, config)
    discovery = ImportDiscoveryService(
        db,
        layout,
        config,
        metadata_reader=SyntheticMetadataReader(),
        allow_unsafe_atime=True,
        immutable_source_roots=(legacy_source,),
        metadata_batch_size=3,
    )
    observations_before = db.one(
        "SELECT COUNT(*) AS count FROM import_item_observations WHERE item_id=?", (photo.item_id,)
    )["count"]
    item_count_before = db.one(
        "SELECT COUNT(*) AS count FROM import_items WHERE batch_id=?", (batch.batch_id,)
    )["count"]
    summary = discovery.scan_batch(batch.batch_id)
    assert summary.discovered_item_count == item_count_before
    assert db.one(
        "SELECT COUNT(*) AS count FROM import_item_observations WHERE item_id=?", (photo.item_id,)
    )["count"] == observations_before
    assert service.manifest_page(
        ManifestPageRequest(batch.batch_id, limit=10, after=ManifestCursor("", ""), decisions=("exclude",))
    ).items
    assert service.manifest_page(
        ManifestPageRequest(batch.batch_id, limit=20, classifications=("photo",))
    ).items
    assert _tree_snapshot(inbox) == inbox_before
    assert _tree_snapshot(legacy_source) == source_before
    assert _tree_snapshot(layout.objects) == objects_before

    before_changed_rescan = _tree_snapshot(inbox)
    (batch_root / "photo.png").write_bytes((batch_root / "photo.png").read_bytes() + b"changed")
    expected_changed = _tree_snapshot(inbox)
    summary = discovery.scan_batch(batch.batch_id)
    changed = next(item for item in _all_manifest(service, batch.batch_id) if item.item_id == photo.item_id)
    assert summary.status == "awaiting_review"
    assert changed.effective_decision == "exclude"
    assert changed.decision_revision == 1
    assert db.one(
        "SELECT COUNT(*) AS count FROM import_item_observations WHERE item_id=?", (photo.item_id,)
    )["count"] == observations_before + 1
    assert before_changed_rescan != expected_changed
    assert _tree_snapshot(inbox) == expected_changed
    assert _tree_snapshot(legacy_source) == source_before
    assert _tree_snapshot(layout.objects) == objects_before
    db.close()


def test_interruption_permission_failure_and_resume_without_duplicates(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    inbox = tmp_path / "inbox"
    batch_root = inbox / "batch"
    blocked = batch_root / "blocked"
    blocked.mkdir(parents=True)
    _make_png(batch_root / "visible.png", (1, 1, 1))
    _make_png(blocked / "eventually-visible.png", (2, 2, 2))
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    config = ReviewConfig(vault_root=layout.root, inbox_root=inbox, derivative_root=tmp_path / "derivatives")
    db = ManifestDB(layout.database)
    interrupted = True

    with pytest.raises(ValueError, match="immutable source and inbox"):
        ImportDiscoveryService(
            db,
            layout,
            config,
            metadata_reader=SyntheticMetadataReader(),
            allow_unsafe_atime=True,
            immutable_source_roots=(batch_root,),
        )

    def interrupt_hashing(phase: str, _batch_id: str) -> None:
        nonlocal interrupted
        if phase == "hashing" and interrupted:
            interrupted = False
            raise KeyboardInterrupt("synthetic interruption")

    discovery = ImportDiscoveryService(
        db,
        layout,
        config,
        metadata_reader=SyntheticMetadataReader(),
        allow_unsafe_atime=True,
        phase_hook=interrupt_hashing,
    )
    batch = discovery.discover_batches()[0]
    with pytest.raises(KeyboardInterrupt, match="synthetic interruption"):
        discovery.scan_batch(batch.batch_id)
    assert ImportManifestService(db, config).batch_summary(batch.batch_id).status == "interrupted"
    count_after_interrupt = db.one(
        "SELECT COUNT(*) AS count FROM import_items WHERE batch_id=?", (batch.batch_id,)
    )["count"]

    real_scandir = review_module.os.scandir

    def fail_blocked(path: str | os.PathLike[str]):
        if Path(path).absolute() == blocked.absolute():
            raise PermissionError("synthetic permission failure")
        return real_scandir(path)

    source_before = _tree_snapshot(inbox)
    monkeypatch.setattr(review_module.os, "scandir", fail_blocked)
    resumed = ImportDiscoveryService(
        db,
        layout,
        config,
        metadata_reader=SyntheticMetadataReader(),
        allow_unsafe_atime=True,
    )
    summary = resumed.scan_batch(batch.batch_id)
    assert summary.status == "awaiting_review"
    assert summary.traversal_complete is False
    folder = next(
        row for row in ImportManifestService(db, config).folder_progress(batch.batch_id)
        if row["relative_path_text"] == "blocked"
    )
    assert "PermissionError" in folder["error_text"]
    assert db.one(
        "SELECT COUNT(*) AS count FROM import_items WHERE batch_id=?", (batch.batch_id,)
    )["count"] == count_after_interrupt
    monkeypatch.setattr(review_module.os, "scandir", real_scandir)
    assert _tree_snapshot(inbox) == source_before
    complete = resumed.scan_batch(batch.batch_id)
    assert complete.traversal_complete is True
    assert complete.error_count == 0
    paths = {item.relative_path_text for item in _all_manifest(ImportManifestService(db, config), batch.batch_id)}
    assert "blocked\\eventually-visible.png" in paths
    jobs = db.all(
        "SELECT status FROM background_jobs WHERE subject_id=? ORDER BY created_at,job_id", (batch.batch_id,)
    )
    assert [row["status"] for row in jobs] == ["interrupted", "completed", "completed"]
    assert _tree_snapshot(inbox) == source_before
    assert not list(layout.objects.rglob("*.blob"))
    db.close()


def test_million_row_manifest_uses_indexed_keyset_query(tmp_path: Path) -> None:
    layout = VaultLayout(tmp_path / "vault")
    layout.create()
    inbox = tmp_path / "inbox"
    inbox.mkdir()
    config = ReviewConfig(vault_root=layout.root, inbox_root=inbox, derivative_root=tmp_path / "derivatives")
    db = ManifestDB(layout.database)
    now = utc_now()
    db.execute(
        """INSERT INTO import_batches(
               batch_id,inbox_root_text,batch_root_text,batch_name,status,created_at,updated_at
           ) VALUES('million',?,?,?,'awaiting_review',?,?)""",
        (str(inbox), str(inbox / "million"), "million", now, now),
    )
    db.execute(
        """WITH RECURSIVE seq(x) AS (
               VALUES(0) UNION ALL SELECT x+1 FROM seq WHERE x<999999
           )
           INSERT INTO import_items(
               item_id,batch_id,relative_path_text,path_text,parent_relative_path_text,entry_kind,
               first_seen_at,last_seen_at,last_seen_generation,classification,hash_status,match_outcome,
               proposed_decision,effective_decision
           )
           SELECT printf('ii_%07d',x),'million',printf('p%07d.jpg',x),printf('X:/p%07d.jpg',x),'.','file',
                  ?,?,1,'photo','verified','new_asset','include','include' FROM seq""",
        (now, now),
    )
    db.commit()

    service = ImportManifestService(db, config)
    request = ManifestPageRequest(
        batch_id="million",
        limit=25,
        after=ManifestCursor("p0900000.jpg", "ii_0900000"),
        classifications=("photo",),
    )
    plan = service.explain_manifest_query(request)
    page = service.manifest_page(request)
    assert len(page.items) == 25
    assert page.items[0].relative_path_text == "p0900001.jpg"
    assert page.next_cursor is not None
    assert any("SEARCH import_items USING INDEX idx_import_items_classification" in step for step in plan)
    assert all("SCAN import_items" not in step and "USE TEMP B-TREE" not in step for step in plan)
    with pytest.raises(ValueError, match="Unsupported manifest filters"):
        service.manifest_page(ManifestPageRequest("million", classifications=("invented",)))
    db.close()
