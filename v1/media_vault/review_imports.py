from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Protocol, Sequence

from .config import ReviewConfig
from .core import (
    FullHashes,
    VaultLayout,
    VaultRunLock,
    assert_source_read_policy,
    byte_compare,
    canonical_for_guard,
    file_is_reparse_or_symlink,
    hash_file,
    is_within,
    json_text,
    stable_id,
    utc_now,
)
from .db import SCHEMA_VERSION, ManifestDB
from .metadata import (
    IMAGE_EXTENSIONS,
    JPEG_EXTENSIONS,
    VIDEO_EXTENSIONS,
    ExifToolReader,
    classify,
    last_suffix,
    signature_kind,
)


SIDECAR_EXTENSIONS = frozenset({".aae", ".cos", ".cot", ".dop", ".mie", ".on1", ".pp3", ".thm", ".xmp"})
MANIFEST_CLASSIFICATIONS = frozenset(
    {"pending", "folder", "photo", "raw", "video", "sidecar", "unsupported", "non_media", "corrupt"}
)
ENTRY_KINDS = frozenset({"file", "folder", "reparse", "other"})
DECISIONS = frozenset({"include", "exclude", "not_applicable", "pending"})
INCLUDABLE_CLASSIFICATIONS = frozenset({"photo", "raw", "video", "sidecar", "unsupported", "corrupt"})


class MetadataBatchReader(Protocol):
    def read_batch(self, paths: list[Path]) -> list[dict[str, Any]]: ...


class DecisionConflictError(RuntimeError):
    """A caller attempted to overwrite a newer persisted item decision."""


@dataclass(frozen=True)
class BatchRecord:
    batch_id: str
    batch_name: str
    inbox_root: str
    batch_root: str
    status: str
    discovery_generation: int
    revision: int


@dataclass(frozen=True)
class ManifestCursor:
    relative_path_text: str
    item_id: str


@dataclass(frozen=True)
class ManifestPageRequest:
    batch_id: str
    limit: int = 100
    after: ManifestCursor | None = None
    classifications: tuple[str, ...] = ()
    decisions: tuple[str, ...] = ()
    entry_kinds: tuple[str, ...] = ()


@dataclass(frozen=True)
class ImportItemRecord:
    item_id: str
    relative_path_text: str
    path_text: str
    entry_kind: str
    classification: str
    media_kind: str | None
    stat_snapshot: dict[str, Any]
    extension: str | None
    signature_kind: str | None
    mime_type: str | None
    detected_format: str | None
    discovery_basis: str | None
    classification_evidence: dict[str, Any]
    unusual_extension: bool
    warnings: tuple[str, ...]
    error: str | None
    hash_status: str
    hashes: dict[str, Any] | None
    match_outcome: str
    matched_asset_id: str | None
    matched_item_id: str | None
    raw_jpeg_candidates: tuple[dict[str, Any], ...]
    associated_sidecar_of_item_id: str | None
    association_evidence: dict[str, Any]
    proposed_decision: str
    proposed_reason: str | None
    effective_decision: str
    decision_revision: int


@dataclass(frozen=True)
class ManifestPage:
    items: tuple[ImportItemRecord, ...]
    next_cursor: ManifestCursor | None


@dataclass(frozen=True)
class BatchSummary:
    batch_id: str
    status: str
    discovery_generation: int
    revision: int
    traversal_complete: bool
    discovered_item_count: int
    file_count: int
    folder_count: int
    other_count: int
    total_bytes: int
    included_count: int
    excluded_count: int
    not_applicable_count: int
    exact_match_count: int
    error_count: int
    classification_counts: dict[str, int]
    match_outcome_counts: dict[str, int]


@dataclass(frozen=True)
class DecisionRequest:
    item_id: str
    decision: str
    reason: str | None = None
    expected_revision: int | None = None
    actor: str = "local_user"


@dataclass(frozen=True)
class DecisionResult:
    item_id: str
    decision: str
    revision: int
    batch_revision: int


def _json_load(value: str | None, default: Any) -> Any:
    if not value:
        return default
    try:
        return json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return default


def _stat_fields(st: os.stat_result | None) -> dict[str, int | str | None]:
    if st is None:
        return {
            "stat_size_bytes": None,
            "stat_mtime_ns": None,
            "stat_ctime_ns": None,
            "stat_device_id": None,
            "stat_file_id": None,
            "stat_mode": None,
            "stat_attributes": None,
        }
    return {
        "stat_size_bytes": int(st.st_size),
        "stat_mtime_ns": int(st.st_mtime_ns),
        "stat_ctime_ns": int(st.st_ctime_ns),
        "stat_device_id": str(st.st_dev),
        "stat_file_id": str(st.st_ino),
        "stat_mode": int(st.st_mode),
        "stat_attributes": int(getattr(st, "st_file_attributes", 0)),
    }


def _same_stat(row: Any, fields: dict[str, int | str | None]) -> bool:
    return all(row[name] == value for name, value in fields.items())


def _relative_text(path: Path, root: Path) -> str:
    relative = path.relative_to(root)
    return "." if not relative.parts else str(relative)


def _parent_relative(relative_path_text: str) -> str | None:
    if relative_path_text == ".":
        return None
    parent = Path(relative_path_text).parent
    return "." if str(parent) in {"", "."} else str(parent)


def _metadata_has_error(metadata: dict[str, Any]) -> str | None:
    for key, value in metadata.items():
        if (key == "Error" or key.endswith(":Error")) and value not in (None, ""):
            return str(value)
    return None


def _metadata_warning(metadata: dict[str, Any]) -> str | None:
    for key, value in metadata.items():
        if (key == "Warning" or key.endswith(":Warning")) and value not in (None, ""):
            return str(value)
    return None


def _derived_stem(value: str) -> str:
    stem = Path(value).stem.casefold()
    return re.sub(
        r"(?i)(?:[-_ ](?:edit(?:ed)?|developed|export|final|hdr|bw|mono|crop|retouch|copy|v\d+))+$",
        "",
        stem,
    )


def _observation_fingerprint(row: Any) -> tuple[str, dict[str, Any]]:
    stat_snapshot = {
        "size_bytes": row["stat_size_bytes"],
        "mtime_ns": row["stat_mtime_ns"],
        "ctime_ns": row["stat_ctime_ns"],
        "device_id": row["stat_device_id"],
        "file_id": row["stat_file_id"],
        "mode": row["stat_mode"],
        "file_attributes": row["stat_attributes"],
    }
    evidence = {
        "entry_kind": row["entry_kind"],
        "stat": stat_snapshot,
        "classification": row["classification"],
        "media_kind": row["media_kind"],
        "extension": row["extension_text"],
        "signature": row["signature_kind"],
        "mime_type": row["mime_type"],
        "detected_format": row["detected_format"],
        "discovery_basis": row["discovery_basis"],
        "classification_evidence": _json_load(row["classification_evidence_json"], {}),
        "unusual_extension": bool(row["unusual_extension"]),
        "warnings": _json_load(row["warnings_json"], []),
        "error": row["error_text"],
        "hash_status": row["hash_status"],
        "hashes": {
            "size_bytes": row["hashed_size_bytes"],
            "sha256": row["sha256"],
            "blake3": row["blake3"],
            "sha512": row["sha512"],
        }
        if row["sha256"]
        else None,
        "match_outcome": row["match_outcome"],
        "match_method": row["match_method"],
        "matched_asset_id": row["matched_asset_id"],
        "matched_item_id": row["matched_item_id"],
        "raw_jpeg_candidates": _json_load(row["raw_jpeg_candidate_json"], []),
        "associated_sidecar_of_item_id": row["associated_sidecar_of_item_id"],
        "association_evidence": _json_load(row["association_evidence_json"], {}),
        "proposed_decision": row["proposed_decision"],
        "proposed_reason": row["proposed_reason"],
    }
    return stable_id("iof1", evidence), evidence


def _persist_observation(db: ManifestDB, item_id: str, generation: int) -> None:
    row = db.one("SELECT * FROM import_items WHERE item_id=?", (item_id,))
    if row is None:
        raise RuntimeError(f"Import item disappeared while recording observation: {item_id}")
    fingerprint, evidence = _observation_fingerprint(row)
    observation_id = stable_id("iob1", item_id, fingerprint)
    relationships = {
        "raw_jpeg_candidates": evidence["raw_jpeg_candidates"],
        "associated_sidecar_of_item_id": evidence["associated_sidecar_of_item_id"],
        "association_evidence": evidence["association_evidence"],
    }
    db.execute(
        """INSERT OR IGNORE INTO import_item_observations(
               observation_id,item_id,observed_generation,observed_at,fingerprint,stat_snapshot_json,
               classification,classification_evidence_json,warnings_json,error_text,hash_status,
               hashes_json,match_outcome,match_evidence_json,relationship_evidence_json,
               proposed_decision,proposed_reason
           ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            observation_id,
            item_id,
            generation,
            utc_now(),
            fingerprint,
            json_text(evidence["stat"]),
            row["classification"],
            json_text(evidence["classification_evidence"]),
            json_text(evidence["warnings"]),
            row["error_text"],
            row["hash_status"],
            json_text(evidence["hashes"]) if evidence["hashes"] else None,
            row["match_outcome"],
            json_text(
                {
                    "method": row["match_method"],
                    "matched_asset_id": row["matched_asset_id"],
                    "matched_item_id": row["matched_item_id"],
                }
            ),
            json_text(relationships),
            row["proposed_decision"],
            row["proposed_reason"],
        ),
    )
    db.execute("UPDATE import_items SET current_observation_id=? WHERE item_id=?", (observation_id, item_id))


def _folder_ancestors(relative_path_text: str, folder_paths: set[str]) -> list[str]:
    if relative_path_text == ".":
        return ["."]
    result = ["."]
    parts = Path(relative_path_text).parts
    for length in range(1, len(parts) + 1):
        candidate = str(Path(*parts[:length]))
        if candidate in folder_paths:
            result.append(candidate)
    return result


def _recompute_rollups(db: ManifestDB, batch_id: str, generation: int, phase: str) -> None:
    rows = db.all(
        "SELECT * FROM import_items WHERE batch_id=? AND present=1 ORDER BY relative_path_text COLLATE BINARY,item_id",
        (batch_id,),
    )
    folders = {row["relative_path_text"]: row for row in rows if row["entry_kind"] == "folder"}
    folder_paths = set(folders)
    rollups: dict[str, dict[str, Any]] = {
        relative: {
            "direct_item_count": 0,
            "subtree_item_count": 0,
            "subtree_file_count": 0,
            "subtree_folder_count": 0,
            "subtree_other_count": 0,
            "subtree_bytes": 0,
            "included_count": 0,
            "excluded_count": 0,
            "not_applicable_count": 0,
            "error_count": 0,
            "classification_counts": {},
            "match_outcome_counts": {},
        }
        for relative in folders
    }
    for row in rows:
        relative = row["relative_path_text"]
        parent = row["parent_relative_path_text"]
        if parent in rollups:
            rollups[parent]["direct_item_count"] += 1
        for ancestor in _folder_ancestors(relative, folder_paths):
            values = rollups[ancestor]
            values["subtree_item_count"] += 1
            if row["entry_kind"] == "file":
                values["subtree_file_count"] += 1
            elif row["entry_kind"] == "folder":
                values["subtree_folder_count"] += 1
            else:
                values["subtree_other_count"] += 1
            values["subtree_bytes"] += int(row["stat_size_bytes"] or 0) if row["entry_kind"] == "file" else 0
            decision = row["effective_decision"]
            if decision in {"include", "exclude", "not_applicable"}:
                counter = {"include": "included_count", "exclude": "excluded_count"}.get(
                    decision, "not_applicable_count"
                )
                values[counter] += 1
            if row["error_text"] or row["hash_status"] == "error":
                values["error_count"] += 1
            classification = row["classification"]
            values["classification_counts"][classification] = (
                values["classification_counts"].get(classification, 0) + 1
            )
            outcome = row["match_outcome"]
            values["match_outcome_counts"][outcome] = values["match_outcome_counts"].get(outcome, 0) + 1

    db.execute("DELETE FROM import_folder_progress WHERE batch_id=?", (batch_id,))
    now = utc_now()
    for relative, folder in folders.items():
        values = rollups[relative]
        db.execute(
            """INSERT INTO import_folder_progress(
                   batch_id,folder_item_id,relative_path_text,parent_relative_path_text,phase,
                   direct_item_count,subtree_item_count,subtree_file_count,subtree_folder_count,
                   subtree_other_count,subtree_bytes,included_count,excluded_count,not_applicable_count,
                   error_count,classification_counts_json,match_outcome_counts_json,discovery_generation,
                   updated_at,warnings_json,error_text
               ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                batch_id,
                folder["item_id"],
                relative,
                folder["parent_relative_path_text"],
                phase,
                values["direct_item_count"],
                values["subtree_item_count"],
                values["subtree_file_count"],
                values["subtree_folder_count"],
                values["subtree_other_count"],
                values["subtree_bytes"],
                values["included_count"],
                values["excluded_count"],
                values["not_applicable_count"],
                values["error_count"],
                json_text(values["classification_counts"]),
                json_text(values["match_outcome_counts"]),
                generation,
                now,
                folder["warnings_json"],
                folder["error_text"],
            ),
        )

    counts = {
        "discovered_item_count": len(rows),
        "file_count": sum(row["entry_kind"] == "file" for row in rows),
        "folder_count": sum(row["entry_kind"] == "folder" for row in rows),
        "other_count": sum(row["entry_kind"] not in {"file", "folder"} for row in rows),
        "total_bytes": sum(int(row["stat_size_bytes"] or 0) for row in rows if row["entry_kind"] == "file"),
        "included_count": sum(row["effective_decision"] == "include" for row in rows),
        "excluded_count": sum(row["effective_decision"] == "exclude" for row in rows),
        "not_applicable_count": sum(row["effective_decision"] == "not_applicable" for row in rows),
        "exact_match_count": sum(row["match_outcome"] == "exact_match" for row in rows),
        "error_count": sum(bool(row["error_text"]) or row["hash_status"] == "error" for row in rows),
        "classification_counts_json": json_text(
            {
                classification: sum(row["classification"] == classification for row in rows)
                for classification in sorted({row["classification"] for row in rows})
            }
        ),
        "match_outcome_counts_json": json_text(
            {
                outcome: sum(row["match_outcome"] == outcome for row in rows)
                for outcome in sorted({row["match_outcome"] for row in rows})
            }
        ),
    }
    db.execute(
        """UPDATE import_batches SET
               discovered_item_count=?,file_count=?,folder_count=?,other_count=?,total_bytes=?,
               included_count=?,excluded_count=?,not_applicable_count=?,exact_match_count=?,error_count=?,
               classification_counts_json=?,match_outcome_counts_json=?,revision=revision+1,updated_at=?
               WHERE batch_id=?""",
        (*counts.values(), now, batch_id),
    )


class ImportDiscoveryService:
    """Background-only inbox discovery and manifest materialization.

    Callers must hold the vault writer lock. This service reads inbox files and
    writes SQLite metadata; it never creates, changes, or publishes media objects.
    """

    def __init__(
        self,
        db: ManifestDB,
        layout: VaultLayout,
        config: ReviewConfig,
        *,
        metadata_reader: MetadataBatchReader | None = None,
        exiftool: Path | None = None,
        allow_unsafe_atime: bool = False,
        immutable_source_roots: Sequence[Path] = (),
        metadata_batch_size: int = 64,
        phase_hook: Callable[[str, str], None] | None = None,
    ):
        db.require_schema(SCHEMA_VERSION, feature_name="review import discovery")
        if canonical_for_guard(layout.root) != canonical_for_guard(config.vault_root):
            raise ValueError("Review configuration vault_root must match the opened vault")
        if metadata_reader is not None and exiftool is not None:
            raise ValueError("Provide metadata_reader or exiftool, not both")
        if metadata_batch_size < 1:
            raise ValueError("metadata_batch_size must be at least 1")
        for source_root in immutable_source_roots:
            config.assert_source_separated(source_root)
        self.db = db
        self.layout = layout
        self.config = config
        self.allow_unsafe_atime = allow_unsafe_atime
        self.metadata_batch_size = metadata_batch_size
        self.phase_hook = phase_hook
        self.metadata_reader = metadata_reader or (ExifToolReader(exiftool, layout.temp) if exiftool else None)

    def _read_guard(self) -> dict[str, Any]:
        return assert_source_read_policy(self.allow_unsafe_atime)

    def _validate_batch_root(self, batch_root: Path) -> Path:
        root = batch_root.absolute()
        inbox = self.config.inbox_root.absolute()
        if canonical_for_guard(root.parent) != canonical_for_guard(inbox):
            raise ValueError("An import batch must be an immediate child directory of the configured inbox")
        if not root.is_dir():
            raise ValueError(f"Import batch directory does not exist: {root}")
        if root.is_symlink() or not is_within(root, inbox):
            raise ValueError("Import batch may not be a symbolic link, reparse escape, or outside the inbox")
        attrs = int(getattr(root.stat(follow_symlinks=False), "st_file_attributes", 0))
        if attrs & 0x400:
            raise ValueError("Import batch root may not be a reparse point")
        if is_within(root, self.layout.root) or is_within(self.layout.root, root):
            raise ValueError("Import batch and vault must remain completely separate")
        return root

    def discover_batches(self) -> tuple[BatchRecord, ...]:
        self._read_guard()
        inbox = self.config.inbox_root
        if not inbox.is_dir():
            raise ValueError(f"Configured inbox directory does not exist: {inbox}")
        batches: list[BatchRecord] = []
        with os.scandir(inbox) as entries:
            materialized = sorted(entries, key=lambda entry: entry.name)
        for entry in materialized:
            try:
                if file_is_reparse_or_symlink(entry) or not entry.is_dir(follow_symlinks=False):
                    continue
            except OSError:
                continue
            root = self._validate_batch_root(Path(entry.path))
            batch_id = stable_id("ib1", str(inbox.absolute()), str(root))
            now = utc_now()
            self.db.execute(
                """INSERT INTO import_batches(
                       batch_id,inbox_root_text,batch_root_text,batch_name,status,created_at,updated_at
                   ) VALUES(?,?,?,?,?,?,?) ON CONFLICT(batch_id) DO UPDATE SET
                       batch_name=excluded.batch_name,updated_at=excluded.updated_at""",
                (batch_id, str(inbox.absolute()), str(root), entry.name, "discovered", now, now),
            )
            row = self.db.one("SELECT * FROM import_batches WHERE batch_id=?", (batch_id,))
            assert row is not None
            batches.append(self._batch_record(row))
        self.db.commit()
        return tuple(batches)

    @staticmethod
    def _batch_record(row: Any) -> BatchRecord:
        return BatchRecord(
            batch_id=row["batch_id"],
            batch_name=row["batch_name"],
            inbox_root=row["inbox_root_text"],
            batch_root=row["batch_root_text"],
            status=row["status"],
            discovery_generation=int(row["discovery_generation"]),
            revision=int(row["revision"]),
        )

    def _set_phase(self, batch_id: str, job_id: str, phase: str) -> None:
        now = utc_now()
        self.db.execute(
            "UPDATE import_batches SET status=?,updated_at=?,last_error_text=NULL WHERE batch_id=?",
            (phase, now, batch_id),
        )
        self.db.execute(
            "UPDATE background_jobs SET phase=?,status='running',heartbeat_at=? WHERE job_id=?",
            (phase, now, job_id),
        )
        self.db.commit()
        if self.phase_hook:
            self.phase_hook(phase, batch_id)

    def scan_batch(self, batch_id: str, *, reuse_unchanged: bool = False) -> BatchSummary:
        batch = self.db.one("SELECT * FROM import_batches WHERE batch_id=?", (batch_id,))
        if batch is None:
            raise KeyError(f"Unknown import batch: {batch_id}")
        root = self._validate_batch_root(Path(batch["batch_root_text"]))
        self._read_guard()
        self.db.execute(
            """UPDATE background_jobs SET status='interrupted',completed_at=?,error_text=?
               WHERE subject_type='import_batch' AND subject_id=? AND status='running'""",
            (utc_now(), "A later scan recovered this unfinished discovery job", batch_id),
        )
        generation = int(batch["discovery_generation"]) + 1
        job_id = stable_id("job1", "import_discovery", batch_id, generation)
        now = utc_now()
        self.db.execute(
            """UPDATE import_batches SET discovery_generation=?,status='discovering',updated_at=?,
                   traversal_complete=0,last_error_text=NULL WHERE batch_id=?""",
            (generation, now, batch_id),
        )
        self.db.execute(
            """INSERT INTO background_jobs(
                   job_id,job_kind,subject_type,subject_id,phase,status,attempt,created_at,started_at,heartbeat_at
               ) VALUES(?,?,?,?,?,'running',?,?,?,?)""",
            (job_id, "import_discovery", "import_batch", batch_id, "discovering", generation, now, now, now),
        )
        self.db.commit()
        try:
            self._set_phase(batch_id, job_id, "discovering")
            item_ids, traversal_complete = self._discover_tree(batch_id, root, generation, reuse_unchanged)
            self.db.execute(
                "UPDATE import_batches SET traversal_complete=?,updated_at=? WHERE batch_id=?",
                (int(traversal_complete), utc_now(), batch_id),
            )
            self.db.commit()

            self._set_phase(batch_id, job_id, "hashing")
            self._hash_and_classify(batch_id, root, generation, item_ids)
            self.db.commit()

            self._set_phase(batch_id, job_id, "matching")
            self._match_items(batch_id, generation)
            _recompute_rollups(self.db, batch_id, generation, "awaiting_review")
            finished = utc_now()
            self.db.execute(
                """UPDATE import_batches SET status='awaiting_review',review_ready_at=?,updated_at=?
                   WHERE batch_id=?""",
                (finished, finished, batch_id),
            )
            self.db.execute(
                """UPDATE background_jobs SET phase='matching',status='completed',heartbeat_at=?,completed_at=?,
                       progress_json=? WHERE job_id=?""",
                (
                    finished,
                    finished,
                    json_text({"traversal_complete": traversal_complete, "discovery_generation": generation}),
                    job_id,
                ),
            )
            self.db.commit()
            return ImportManifestService(self.db, self.config).batch_summary(batch_id)
        except BaseException as exc:
            failed = utc_now()
            status = "interrupted" if isinstance(exc, (KeyboardInterrupt, SystemExit)) else "failed"
            error = f"{type(exc).__name__}: {exc}"
            self.db.execute(
                "UPDATE import_batches SET status=?,updated_at=?,last_error_text=? WHERE batch_id=?",
                (status, failed, error, batch_id),
            )
            self.db.execute(
                "UPDATE background_jobs SET status=?,heartbeat_at=?,completed_at=?,error_text=? WHERE job_id=?",
                (status, failed, failed, error, job_id),
            )
            self.db.commit()
            raise

    def _upsert_entry(
        self,
        batch_id: str,
        root: Path,
        path: Path,
        entry_kind: str,
        generation: int,
        st: os.stat_result | None,
        *,
        error_text: str | None = None,
        reuse_unchanged: bool = False,
    ) -> tuple[str, bool]:
        relative = _relative_text(path, root)
        item_id = stable_id("ii1", batch_id, relative, entry_kind)
        fields = _stat_fields(st)
        existing = self.db.one("SELECT * FROM import_items WHERE item_id=?", (item_id,))
        now = utc_now()
        if existing is None:
            classification = "pending" if entry_kind == "file" else "folder" if entry_kind == "folder" else "unsupported"
            decision = "pending" if entry_kind == "file" else "not_applicable" if entry_kind == "folder" else "exclude"
            hash_status = "pending" if entry_kind == "file" else "not_applicable"
            match_outcome = "pending" if entry_kind == "file" else "not_applicable"
            warnings = [error_text] if error_text else (["Reparse point or symbolic link was recorded but not followed"] if entry_kind == "reparse" else [])
            self.db.execute(
                """INSERT INTO import_items(
                       item_id,batch_id,relative_path_text,path_text,parent_relative_path_text,entry_kind,
                       first_seen_at,last_seen_at,last_seen_generation,stat_size_bytes,stat_mtime_ns,stat_ctime_ns,
                       stat_device_id,stat_file_id,stat_mode,stat_attributes,classification,warnings_json,error_text,
                       hash_status,match_outcome,proposed_decision,proposed_reason,effective_decision
                   ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    item_id,
                    batch_id,
                    relative,
                    str(path),
                    _parent_relative(relative),
                    entry_kind,
                    now,
                    now,
                    generation,
                    *fields.values(),
                    classification,
                    json_text(warnings),
                    error_text,
                    hash_status,
                    match_outcome,
                    decision,
                    "Folders are structural manifest entries" if entry_kind == "folder" else error_text,
                    decision,
                ),
            )
            needs_processing = entry_kind == "file"
        else:
            completed = existing["hash_status"] not in {"pending", "error"} and existing["match_outcome"] != "pending"
            unchanged = _same_stat(existing, fields) and completed
            needs_processing = entry_kind == "file" and not (reuse_unchanged and unchanged)
            self.db.execute(
                """UPDATE import_items SET path_text=?,parent_relative_path_text=?,present=1,last_seen_at=?,
                       last_seen_generation=?,stat_size_bytes=?,stat_mtime_ns=?,stat_ctime_ns=?,stat_device_id=?,
                       stat_file_id=?,stat_mode=?,stat_attributes=? WHERE item_id=?""",
                (
                    str(path),
                    _parent_relative(relative),
                    now,
                    generation,
                    *fields.values(),
                    item_id,
                ),
            )
            if needs_processing:
                effective = existing["effective_decision"] if int(existing["decision_revision"]) else "pending"
                self.db.execute(
                    """UPDATE import_items SET current_observation_id=NULL,classification='pending',media_kind=NULL,
                           extension_text=NULL,signature_kind=NULL,mime_type=NULL,detected_format=NULL,
                           discovery_basis=NULL,classification_evidence_json='{}',unusual_extension=0,
                           warnings_json='[]',error_text=NULL,hash_status='pending',hashed_size_bytes=NULL,
                           sha256=NULL,blake3=NULL,sha512=NULL,match_outcome='pending',match_method=NULL,
                           matched_asset_id=NULL,matched_item_id=NULL,raw_jpeg_candidate_json='[]',
                           associated_sidecar_of_item_id=NULL,association_evidence_json='{}',
                           proposed_decision='pending',proposed_reason=NULL,effective_decision=? WHERE item_id=?""",
                    (effective, item_id),
                )
            elif entry_kind != "file":
                classification = "folder" if entry_kind == "folder" else "unsupported"
                decision = "not_applicable" if entry_kind == "folder" else "exclude"
                warnings = (
                    [error_text]
                    if error_text
                    else ["Reparse point or symbolic link was recorded but not followed"]
                    if entry_kind == "reparse"
                    else []
                )
                self.db.execute(
                    """UPDATE import_items SET classification=?,warnings_json=?,error_text=?,
                           hash_status='not_applicable',match_outcome='not_applicable',proposed_decision=?,
                           proposed_reason=?,effective_decision=? WHERE item_id=?""",
                    (
                        classification,
                        json_text(warnings),
                        error_text,
                        decision,
                        "Folders are structural manifest entries" if entry_kind == "folder" else error_text,
                        decision,
                        item_id,
                    ),
                )
        if entry_kind != "file":
            _persist_observation(self.db, item_id, generation)
        return item_id, needs_processing

    def _record_folder_error(self, batch_id: str, root: Path, directory: Path, generation: int, exc: OSError) -> None:
        relative = _relative_text(directory, root)
        row = self.db.one(
            "SELECT item_id,warnings_json FROM import_items WHERE batch_id=? AND relative_path_text=? AND entry_kind='folder'",
            (batch_id, relative),
        )
        if row is None:
            return
        error = f"{type(exc).__name__}: {exc}"
        warnings = _json_load(row["warnings_json"], [])
        warnings.append(f"Directory could not be enumerated: {error}")
        self.db.execute(
            "UPDATE import_items SET warnings_json=?,error_text=? WHERE item_id=?",
            (json_text(warnings), error, row["item_id"]),
        )
        _persist_observation(self.db, row["item_id"], generation)

    def _discover_tree(
        self,
        batch_id: str,
        root: Path,
        generation: int,
        reuse_unchanged: bool,
    ) -> tuple[list[str], bool]:
        root_stat = root.stat(follow_symlinks=False)
        self._upsert_entry(batch_id, root, root, "folder", generation, root_stat, reuse_unchanged=reuse_unchanged)
        pending: list[str] = []
        traversal_complete = True
        stack = [root]
        while stack:
            directory = stack.pop()
            try:
                with os.scandir(directory) as entries:
                    materialized = sorted(entries, key=lambda entry: entry.name)
            except OSError as exc:
                traversal_complete = False
                self._record_folder_error(batch_id, root, directory, generation, exc)
                self.db.commit()
                continue
            directories: list[Path] = []
            for entry in materialized:
                path = Path(entry.path)
                try:
                    st = entry.stat(follow_symlinks=False)
                    if file_is_reparse_or_symlink(entry):
                        self._upsert_entry(batch_id, root, path, "reparse", generation, st)
                    elif entry.is_dir(follow_symlinks=False):
                        self._upsert_entry(batch_id, root, path, "folder", generation, st)
                        directories.append(path)
                    elif entry.is_file(follow_symlinks=False):
                        item_id, process = self._upsert_entry(
                            batch_id,
                            root,
                            path,
                            "file",
                            generation,
                            st,
                            reuse_unchanged=reuse_unchanged,
                        )
                        if process:
                            pending.append(item_id)
                    else:
                        self._upsert_entry(batch_id, root, path, "other", generation, st)
                except OSError as exc:
                    traversal_complete = False
                    self._upsert_entry(
                        batch_id,
                        root,
                        path,
                        "other",
                        generation,
                        None,
                        error_text=f"{type(exc).__name__}: {exc}",
                    )
            stack.extend(reversed(directories))
            self.db.commit()
        if traversal_complete:
            self.db.execute(
                "UPDATE import_items SET present=0 WHERE batch_id=? AND last_seen_generation<>?",
                (batch_id, generation),
            )
        self.db.commit()
        return pending, traversal_complete

    def _metadata_for(self, paths: list[Path]) -> list[dict[str, Any]]:
        if self.metadata_reader is None:
            return [{} for _path in paths]
        try:
            values = self.metadata_reader.read_batch(paths)
        except Exception as exc:
            error = f"Metadata reader failed: {type(exc).__name__}: {exc}"
            return [{"Error": error} for _path in paths]
        if len(values) != len(paths):
            error = f"Metadata reader returned {len(values)} records for {len(paths)} paths"
            return [{"Error": error} for _path in paths]
        return values

    @staticmethod
    def _classify_current(path: Path, metadata: dict[str, Any]) -> tuple[dict[str, Any], str, str, str]:
        sniffed = signature_kind(path)
        discovery = classify(path, metadata, sniffed)
        extension = last_suffix(path)
        metadata_error = _metadata_has_error(metadata)
        metadata_warning = _metadata_warning(metadata)
        warnings = list(discovery.warnings)
        if metadata_warning and metadata_warning not in warnings:
            warnings.append(metadata_warning)
        if discovery.status == "media":
            extension_only = discovery.basis == "extension"
            if metadata_error:
                classification = "corrupt"
            elif extension_only:
                classification = "unsupported"
            elif discovery.media_kind == "raw_image":
                classification = "raw"
            elif discovery.media_kind == "video":
                classification = "video"
            else:
                classification = "photo"
            proposed = "include"
            proposed_reason = (
                "Conservative inclusion for a corrupt or unreadable media candidate"
                if classification == "corrupt"
                else "Conservative inclusion for an extension-evidenced unsupported media candidate"
                if classification == "unsupported"
                else "Recognized media is included by default"
            )
        else:
            classification = "non_media"
            proposed = "exclude"
            proposed_reason = "Unrelated non-media files are excluded by default"
        unusual = bool(
            discovery.status == "media"
            and extension not in IMAGE_EXTENSIONS | VIDEO_EXTENSIONS
        )
        evidence = {
            "extension": extension,
            "signature_kind": sniffed,
            "mime_type": discovery.mime_type,
            "detected_format": discovery.detected_format,
            "discovery_basis": discovery.basis,
            "extension_mismatch": discovery.extension_mismatch,
            "metadata_error": metadata_error,
            "metadata_warning": metadata_warning,
            "unusual_extension": unusual,
        }
        return (
            {
                "classification": classification,
                "media_kind": discovery.media_kind,
                "extension_text": extension,
                "signature_kind": sniffed,
                "mime_type": discovery.mime_type,
                "detected_format": discovery.detected_format,
                "discovery_basis": discovery.basis,
                "classification_evidence_json": json_text(evidence),
                "unusual_extension": int(unusual),
                "warnings_json": json_text(warnings),
                "error_text": metadata_error,
            },
            proposed,
            proposed_reason,
            classification,
        )

    def _update_classification(
        self,
        item_id: str,
        values: dict[str, Any],
        proposed: str,
        proposed_reason: str,
    ) -> None:
        row = self.db.one("SELECT decision_revision,effective_decision FROM import_items WHERE item_id=?", (item_id,))
        assert row is not None
        effective = row["effective_decision"] if int(row["decision_revision"]) else proposed
        columns = ",".join(f"{name}=?" for name in values)
        self.db.execute(
            f"UPDATE import_items SET {columns},proposed_decision=?,proposed_reason=?,effective_decision=? WHERE item_id=?",
            (*values.values(), proposed, proposed_reason, effective, item_id),
        )

    def _hash_item(self, item_id: str, path: Path) -> FullHashes | None:
        row = self.db.one("SELECT * FROM import_items WHERE item_id=?", (item_id,))
        assert row is not None
        try:
            hashes = hash_file(path)
            after = _stat_fields(path.stat(follow_symlinks=False))
            if any(
                row[name] != after[name]
                for name in ("stat_size_bytes", "stat_mtime_ns", "stat_ctime_ns")
            ):
                raise RuntimeError("Inbox item changed while it was being hashed; the hash was not accepted")
            self.db.execute(
                """UPDATE import_items SET hash_status='verified',hashed_size_bytes=?,sha256=?,blake3=?,sha512=?
                   WHERE item_id=?""",
                (hashes.size_bytes, hashes.sha256, hashes.blake3, hashes.sha512, item_id),
            )
            return hashes
        except Exception as exc:
            error = f"{type(exc).__name__}: {exc}"
            warnings = _json_load(row["warnings_json"], [])
            warnings.append(f"Full-file hashing failed: {error}")
            prior_error = row["error_text"]
            self.db.execute(
                "UPDATE import_items SET hash_status='error',warnings_json=?,error_text=? WHERE item_id=?",
                (json_text(warnings), prior_error or error, item_id),
            )
            return None

    def _associate_sidecars(self, batch_id: str) -> None:
        rows = self.db.all(
            "SELECT * FROM import_items WHERE batch_id=? AND present=1 AND entry_kind='file' ORDER BY relative_path_text COLLATE BINARY",
            (batch_id,),
        )
        media = [row for row in rows if row["classification"] in INCLUDABLE_CLASSIFICATIONS - {"sidecar"}]
        by_parent: dict[str | None, list[Any]] = {}
        for row in media:
            by_parent.setdefault(row["parent_relative_path_text"], []).append(row)
        for row in rows:
            if row["extension_text"] not in SIDECAR_EXTENSIONS or row["classification"] != "non_media":
                continue
            path = Path(row["relative_path_text"])
            sidecar_base_name = path.name[: -len(path.suffix)].casefold()
            sidecar_stem = path.stem.casefold()
            candidates: list[tuple[int, Any, str]] = []
            for target in by_parent.get(row["parent_relative_path_text"], []):
                target_path = Path(target["relative_path_text"])
                if sidecar_base_name == target_path.name.casefold():
                    candidates.append((0, target, "sidecar filename contains the complete media filename"))
                elif sidecar_stem == target_path.stem.casefold():
                    priority = 1 if target["classification"] == "raw" else 2
                    candidates.append((priority, target, "case-insensitive filename stem match"))
            if not candidates:
                continue
            candidates.sort(key=lambda value: (value[0], value[1]["relative_path_text"], value[1]["item_id"]))
            chosen = candidates[0][1]
            evidence = {
                "rules_version": "associated-sidecar-v1",
                "signal": candidates[0][2],
                "candidate_item_ids": [candidate[1]["item_id"] for candidate in candidates],
                "ambiguous": len(candidates) > 1,
            }
            values = {
                "classification": "sidecar",
                "media_kind": "sidecar",
                "discovery_basis": "recognized_sidecar_extension+associated_filename",
                "association_evidence_json": json_text(evidence),
                "associated_sidecar_of_item_id": chosen["item_id"],
            }
            self._update_classification(
                row["item_id"],
                values,
                "include",
                "A recognized sidecar associated with included media is included by default",
            )
            self._hash_item(row["item_id"], Path(row["path_text"]))

    def _hash_and_classify(self, batch_id: str, root: Path, generation: int, item_ids: list[str]) -> None:
        del root, generation
        for offset in range(0, len(item_ids), self.metadata_batch_size):
            chunk = item_ids[offset : offset + self.metadata_batch_size]
            rows = [self.db.one("SELECT * FROM import_items WHERE item_id=?", (item_id,)) for item_id in chunk]
            paths = [Path(row["path_text"]) for row in rows if row is not None]
            metadata_values = self._metadata_for(paths)
            for row, path, metadata in zip(rows, paths, metadata_values, strict=True):
                assert row is not None
                values, proposed, reason, classification = self._classify_current(path, metadata)
                self._update_classification(row["item_id"], values, proposed, reason)
                if classification in INCLUDABLE_CLASSIFICATIONS - {"sidecar"}:
                    self._hash_item(row["item_id"], path)
                else:
                    self.db.execute(
                        "UPDATE import_items SET hash_status='not_applicable',match_outcome='not_applicable' WHERE item_id=?",
                        (row["item_id"],),
                    )
                self.db.commit()
        self._associate_sidecars(batch_id)
        self.db.commit()

    def _match_exact(self, row: Any, first_by_hash: dict[tuple[Any, ...], str]) -> tuple[str, str, str | None, str | None]:
        identity = (row["hashed_size_bytes"], row["sha256"], row["blake3"], row["sha512"])
        existing = self.db.one(
            """SELECT asset_id,object_relpath,object_status FROM assets
               WHERE size_bytes=? AND sha256=? AND blake3=? AND sha512=? ORDER BY asset_id LIMIT 1""",
            identity,
        )
        if existing is not None:
            method = "size+sha256+blake3+sha512_full_content_v1"
            if existing["object_status"] == "verified" and existing["object_relpath"]:
                object_path = self.layout.root / Path(existing["object_relpath"])
                if is_within(object_path, self.layout.objects) and object_path.is_file():
                    if not byte_compare(Path(row["path_text"]), object_path):
                        return "hash_collision_candidate", "triple_hash_match+byte_compare_mismatch", existing["asset_id"], None
                    method += "+byte_compare_v1"
            return "exact_match", method, existing["asset_id"], None
        earlier = first_by_hash.get(identity)
        if earlier is not None:
            earlier_row = self.db.one("SELECT path_text FROM import_items WHERE item_id=?", (earlier,))
            if earlier_row is not None and Path(earlier_row["path_text"]).is_file():
                if not byte_compare(Path(row["path_text"]), Path(earlier_row["path_text"])):
                    return "hash_collision_candidate", "triple_hash_match+byte_compare_mismatch", None, earlier
                method = "size+sha256+blake3+sha512+byte_compare_v1"
            else:
                method = "size+sha256+blake3+sha512_full_content_v1"
            return "batch_exact_duplicate", method, None, earlier
        first_by_hash[identity] = row["item_id"]
        return "new_asset", "no_persisted_triple_hash_match_v1", None, None

    def _record_raw_jpeg_candidates(self, batch_id: str) -> None:
        rows = self.db.all(
            """SELECT item_id,relative_path_text,parent_relative_path_text,classification,extension_text
               FROM import_items WHERE batch_id=? AND present=1 AND classification IN ('raw','photo')
               ORDER BY relative_path_text COLLATE BINARY,item_id""",
            (batch_id,),
        )
        jpegs_by_parent_stem: dict[tuple[str | None, str], list[Any]] = {}
        for row in rows:
            if row["classification"] == "photo" and row["extension_text"] in JPEG_EXTENSIONS:
                path = Path(row["relative_path_text"])
                keys = {path.stem.casefold(), _derived_stem(path.name)}
                for key in keys:
                    jpegs_by_parent_stem.setdefault((row["parent_relative_path_text"], key), []).append(row)
        evidence_by_item: dict[str, list[dict[str, Any]]] = {row["item_id"]: [] for row in rows}
        for raw in (row for row in rows if row["classification"] == "raw"):
            raw_path = Path(raw["relative_path_text"])
            candidates = jpegs_by_parent_stem.get((raw["parent_relative_path_text"], raw_path.stem.casefold()), [])
            seen: set[str] = set()
            for jpeg in candidates:
                if jpeg["item_id"] in seen:
                    continue
                seen.add(jpeg["item_id"])
                jpeg_path = Path(jpeg["relative_path_text"])
                exact = raw_path.stem.casefold() == jpeg_path.stem.casefold()
                evidence = {
                    "rules_version": "review-raw-jpeg-candidate-v1",
                    "raw_item_id": raw["item_id"],
                    "jpeg_item_id": jpeg["item_id"],
                    "signals": ["same_folder", "exact_filename_stem" if exact else "recognized_jpeg_edit_suffix"],
                    "candidate_only": True,
                }
                evidence_by_item[raw["item_id"]].append(evidence)
                evidence_by_item[jpeg["item_id"]].append(evidence)
        for item_id, evidence in evidence_by_item.items():
            self.db.execute(
                "UPDATE import_items SET raw_jpeg_candidate_json=? WHERE item_id=?",
                (json_text(evidence), item_id),
            )

    def _match_items(self, batch_id: str, generation: int) -> None:
        rows = self.db.all(
            """SELECT * FROM import_items WHERE batch_id=? AND present=1 AND entry_kind='file'
               ORDER BY relative_path_text COLLATE BINARY,item_id""",
            (batch_id,),
        )
        first_by_hash: dict[tuple[Any, ...], str] = {}
        for row in rows:
            if row["hash_status"] == "verified":
                outcome, method, asset_id, matched_item_id = self._match_exact(row, first_by_hash)
                self.db.execute(
                    """UPDATE import_items SET match_outcome=?,match_method=?,matched_asset_id=?,matched_item_id=?
                       WHERE item_id=?""",
                    (outcome, method, asset_id, matched_item_id, row["item_id"]),
                )
            elif row["hash_status"] == "error":
                self.db.execute(
                    "UPDATE import_items SET match_outcome='error',match_method='hash_unavailable' WHERE item_id=?",
                    (row["item_id"],),
                )
        self._record_raw_jpeg_candidates(batch_id)
        self.db.commit()
        for row in self.db.all("SELECT item_id FROM import_items WHERE batch_id=? AND present=1", (batch_id,)):
            _persist_observation(self.db, row["item_id"], generation)
        self.db.commit()


class ImportManifestService:
    """Bounded internal contracts for Stage 2 review queries and decisions."""

    def __init__(self, db: ManifestDB, config: ReviewConfig):
        db.require_schema(SCHEMA_VERSION, feature_name="review import manifest")
        self.db = db
        self.config = config

    def list_batches(self) -> tuple[BatchRecord, ...]:
        rows = self.db.all("SELECT * FROM import_batches ORDER BY created_at,batch_id")
        return tuple(ImportDiscoveryService._batch_record(row) for row in rows)

    def batch_summary(self, batch_id: str) -> BatchSummary:
        row = self.db.one("SELECT * FROM import_batches WHERE batch_id=?", (batch_id,))
        if row is None:
            raise KeyError(f"Unknown import batch: {batch_id}")
        return BatchSummary(
            batch_id=batch_id,
            status=row["status"],
            discovery_generation=int(row["discovery_generation"]),
            revision=int(row["revision"]),
            traversal_complete=bool(row["traversal_complete"]),
            discovered_item_count=int(row["discovered_item_count"]),
            file_count=int(row["file_count"]),
            folder_count=int(row["folder_count"]),
            other_count=int(row["other_count"]),
            total_bytes=int(row["total_bytes"]),
            included_count=int(row["included_count"]),
            excluded_count=int(row["excluded_count"]),
            not_applicable_count=int(row["not_applicable_count"]),
            exact_match_count=int(row["exact_match_count"]),
            error_count=int(row["error_count"]),
            classification_counts={
                str(key): int(value) for key, value in _json_load(row["classification_counts_json"], {}).items()
            },
            match_outcome_counts={
                str(key): int(value) for key, value in _json_load(row["match_outcome_counts_json"], {}).items()
            },
        )

    def folder_progress(self, batch_id: str) -> tuple[dict[str, Any], ...]:
        output: list[dict[str, Any]] = []
        for row in self.db.all(
            "SELECT * FROM import_folder_progress WHERE batch_id=? ORDER BY relative_path_text COLLATE BINARY",
            (batch_id,),
        ):
            item = dict(row)
            item["classification_counts"] = _json_load(item.pop("classification_counts_json"), {})
            item["match_outcome_counts"] = _json_load(item.pop("match_outcome_counts_json"), {})
            output.append(item)
        return tuple(output)

    def _manifest_query(self, request: ManifestPageRequest) -> tuple[str, tuple[Any, ...]]:
        if not 1 <= request.limit <= self.config.request_budgets.max_page_size:
            raise ValueError(
                f"Manifest page limit must be between 1 and {self.config.request_budgets.max_page_size}"
            )
        invalid_classifications = set(request.classifications) - MANIFEST_CLASSIFICATIONS
        invalid_decisions = set(request.decisions) - DECISIONS
        invalid_kinds = set(request.entry_kinds) - ENTRY_KINDS
        if invalid_classifications or invalid_decisions or invalid_kinds:
            raise ValueError(
                "Unsupported manifest filters: "
                f"classifications={sorted(invalid_classifications)}, decisions={sorted(invalid_decisions)}, "
                f"entry_kinds={sorted(invalid_kinds)}"
            )
        clauses = ["batch_id=?", "present=1"]
        parameters: list[Any] = [request.batch_id]
        for column, values in (
            ("classification", request.classifications),
            ("effective_decision", request.decisions),
            ("entry_kind", request.entry_kinds),
        ):
            if values:
                clauses.append(f"{column} IN ({','.join('?' for _value in values)})")
                parameters.extend(values)
        if request.after:
            clauses.append("(relative_path_text,item_id)>(?,?)")
            parameters.extend((request.after.relative_path_text, request.after.item_id))
        parameters.append(request.limit + 1)
        sql = (
            "SELECT * FROM import_items WHERE "
            + " AND ".join(clauses)
            + " ORDER BY relative_path_text COLLATE BINARY,item_id LIMIT ?"
        )
        return sql, tuple(parameters)

    def explain_manifest_query(self, request: ManifestPageRequest) -> tuple[str, ...]:
        sql, parameters = self._manifest_query(request)
        return tuple(str(row[3]) for row in self.db.all("EXPLAIN QUERY PLAN " + sql, parameters))

    def manifest_page(self, request: ManifestPageRequest) -> ManifestPage:
        if self.db.one("SELECT 1 FROM import_batches WHERE batch_id=?", (request.batch_id,)) is None:
            raise KeyError(f"Unknown import batch: {request.batch_id}")
        sql, parameters = self._manifest_query(request)
        rows = self.db.all(sql, parameters)
        has_more = len(rows) > request.limit
        rows = rows[: request.limit]
        items = tuple(self._item_record(row) for row in rows)
        next_cursor = (
            ManifestCursor(rows[-1]["relative_path_text"], rows[-1]["item_id"])
            if has_more and rows
            else None
        )
        return ManifestPage(items=items, next_cursor=next_cursor)

    @staticmethod
    def _item_record(row: Any) -> ImportItemRecord:
        hashes = None
        if row["sha256"]:
            hashes = {
                "size_bytes": row["hashed_size_bytes"],
                "sha256": row["sha256"],
                "blake3": row["blake3"],
                "sha512": row["sha512"],
            }
        return ImportItemRecord(
            item_id=row["item_id"],
            relative_path_text=row["relative_path_text"],
            path_text=row["path_text"],
            entry_kind=row["entry_kind"],
            classification=row["classification"],
            media_kind=row["media_kind"],
            stat_snapshot={
                "size_bytes": row["stat_size_bytes"],
                "mtime_ns": row["stat_mtime_ns"],
                "ctime_ns": row["stat_ctime_ns"],
                "device_id": row["stat_device_id"],
                "file_id": row["stat_file_id"],
                "mode": row["stat_mode"],
                "file_attributes": row["stat_attributes"],
            },
            extension=row["extension_text"],
            signature_kind=row["signature_kind"],
            mime_type=row["mime_type"],
            detected_format=row["detected_format"],
            discovery_basis=row["discovery_basis"],
            classification_evidence=_json_load(row["classification_evidence_json"], {}),
            unusual_extension=bool(row["unusual_extension"]),
            warnings=tuple(_json_load(row["warnings_json"], [])),
            error=row["error_text"],
            hash_status=row["hash_status"],
            hashes=hashes,
            match_outcome=row["match_outcome"],
            matched_asset_id=row["matched_asset_id"],
            matched_item_id=row["matched_item_id"],
            raw_jpeg_candidates=tuple(_json_load(row["raw_jpeg_candidate_json"], [])),
            associated_sidecar_of_item_id=row["associated_sidecar_of_item_id"],
            association_evidence=_json_load(row["association_evidence_json"], {}),
            proposed_decision=row["proposed_decision"],
            proposed_reason=row["proposed_reason"],
            effective_decision=row["effective_decision"],
            decision_revision=int(row["decision_revision"]),
        )

    def decision_history(self, item_id: str) -> tuple[dict[str, Any], ...]:
        return tuple(
            dict(row)
            for row in self.db.all(
                "SELECT * FROM import_item_decisions WHERE item_id=? ORDER BY revision",
                (item_id,),
            )
        )

    def set_decision(self, request: DecisionRequest) -> DecisionResult:
        if request.decision not in {"include", "exclude"}:
            raise ValueError("An item decision must be include or exclude")
        row = self.db.one("SELECT * FROM import_items WHERE item_id=? AND present=1", (request.item_id,))
        if row is None:
            raise KeyError(f"Unknown current import item: {request.item_id}")
        current_revision = int(row["decision_revision"])
        if request.expected_revision is not None and request.expected_revision != current_revision:
            raise DecisionConflictError(
                f"Item decision revision changed: expected {request.expected_revision}, found {current_revision}"
            )
        if row["entry_kind"] != "file":
            raise ValueError("Only file manifest items accept include/exclude decisions")
        if request.decision == "include" and row["classification"] not in INCLUDABLE_CLASSIFICATIONS:
            raise ValueError("Unrelated non-media files cannot be included by the reviewed-copy workflow")
        normalized_reason = request.reason.strip() if request.reason else None
        if current_revision and row["effective_decision"] == request.decision:
            latest = self.db.one(
                "SELECT reason FROM import_item_decisions WHERE item_id=? ORDER BY revision DESC LIMIT 1",
                (request.item_id,),
            )
            if latest and latest["reason"] == normalized_reason:
                batch = self.db.one("SELECT revision FROM import_batches WHERE batch_id=?", (row["batch_id"],))
                assert batch is not None
                return DecisionResult(request.item_id, request.decision, current_revision, int(batch["revision"]))
        latest = self.db.one(
            "SELECT decision_id FROM import_item_decisions WHERE item_id=? ORDER BY revision DESC LIMIT 1",
            (request.item_id,),
        )
        revision = current_revision + 1
        self.db.execute(
            """INSERT INTO import_item_decisions(
                   batch_id,item_id,revision,decision,reason,actor,created_at,supersedes_decision_id
               ) VALUES(?,?,?,?,?,?,?,?)""",
            (
                row["batch_id"],
                request.item_id,
                revision,
                request.decision,
                normalized_reason,
                request.actor,
                utc_now(),
                latest["decision_id"] if latest else None,
            ),
        )
        self.db.execute(
            "UPDATE import_items SET effective_decision=?,decision_revision=? WHERE item_id=?",
            (request.decision, revision, request.item_id),
        )
        batch = self.db.one(
            "SELECT discovery_generation FROM import_batches WHERE batch_id=?",
            (row["batch_id"],),
        )
        assert batch is not None
        _recompute_rollups(self.db, row["batch_id"], int(batch["discovery_generation"]), "awaiting_review")
        self.db.commit()
        updated_batch = self.db.one("SELECT revision FROM import_batches WHERE batch_id=?", (row["batch_id"],))
        assert updated_batch is not None
        return DecisionResult(request.item_id, request.decision, revision, int(updated_batch["revision"]))


def discover_review_manifests(
    config: ReviewConfig,
    *,
    metadata_reader: MetadataBatchReader | None = None,
    exiftool: Path | None = None,
    allow_unsafe_atime: bool = False,
    immutable_source_roots: Sequence[Path] = (),
    reuse_unchanged: bool = False,
) -> tuple[BatchSummary, ...]:
    """Run the headless Stage 2 workflow under the vault single-writer guard."""
    layout = VaultLayout(config.vault_root)
    layout.create()
    with VaultRunLock(layout.state, "review-import-discovery"):
        db = ManifestDB(
            layout.database,
            required_schema_version=SCHEMA_VERSION,
            feature_name="review import discovery",
        )
        try:
            discovery = ImportDiscoveryService(
                db,
                layout,
                config,
                metadata_reader=metadata_reader,
                exiftool=exiftool,
                allow_unsafe_atime=allow_unsafe_atime,
                immutable_source_roots=immutable_source_roots,
            )
            return tuple(
                discovery.scan_batch(batch.batch_id, reuse_unchanged=reuse_unchanged)
                for batch in discovery.discover_batches()
            )
        finally:
            db.close()
