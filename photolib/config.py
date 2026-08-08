"""Loads config.toml, the one place a drive letter appears.

Every module that needs a path calls `load()` and reads an attribute. Nothing
here creates directories or touches the filesystem beyond reading config.toml.
"""

from __future__ import annotations

import tomllib
from dataclasses import dataclass, fields
from functools import cache
from pathlib import Path

CONFIG_PATH = Path(__file__).resolve().parent.parent / "config.toml"


@dataclass(frozen=True)
class Config:
    photos_root: Path
    restic_repo: Path
    mediavault_root: Path
    mediavault_manifest_db: Path
    vault_root: Path
    staging_root: Path
    deriv_root: Path
    meta_root: Path
    thumb_root: Path
    substrate_root: Path
    catalog_db: Path
    state_db: Path
    backup_root: Path
    reveal_root: Path
    restic_password_command: str


@cache
def load(config_path: Path = CONFIG_PATH) -> Config:
    """Read and validate config.toml. Cached — the file is read once per process."""
    with config_path.open("rb") as handle:
        raw = tomllib.load(handle)

    expected = {f.name for f in fields(Config)}
    missing = sorted(expected - raw.keys())
    unknown = sorted(raw.keys() - expected)
    if missing or unknown:
        raise ValueError(
            f"{config_path}: "
            + ", ".join(
                part
                for part in (
                    f"missing keys {missing}" if missing else "",
                    f"unknown keys {unknown}" if unknown else "",
                )
                if part
            )
        )

    values: dict[str, object] = {}
    for field in fields(Config):
        value = raw[field.name]
        if not isinstance(value, str) or not value:
            raise ValueError(f"{config_path}: {field.name} must be a non-empty string")
        if field.type == "str":  # annotations are strings here, not types
            values[field.name] = value
            continue
        path = Path(value)
        if not path.is_absolute():
            raise ValueError(f"{config_path}: {field.name} must be absolute, got {value!r}")
        values[field.name] = path

    return Config(**values)


def thumb_path(thumb_root: Path, sha256: str) -> Path:
    """`<thumb_root>\\<aa>\\<sha256>.webp` -- one shard level, not two.

    256 directories of ~400 files. The vault's two-level fan-out exists for
    hundreds of thousands of objects on a spinning disk; this tree is smaller
    and lives on NVMe, and `archive/PLAN.md` spells it with one level.

    It sits beside the root it derives from rather than in the pass that first
    filled the tree: the grid reads that tree on every request and the pass is
    archived under `archive/pipeline`.
    """
    return thumb_root / sha256[:2] / f"{sha256}.webp"


def substrate_path(substrate_root: Path, sha256: str) -> Path:
    """`<substrate_root>\\<aa>\\<sha256>.webp` -- the 1536px tier, one shard level.

    Same shape and same reasoning as `thumb_path`: 256 directories on NVMe, of
    ~100 files each here, and the request path reads this tree the moment a
    stack is opened. The two trees stay separate roots rather than two subtrees
    of one, because they are filled by different passes and a tile can have one
    tier without the other.
    """
    return substrate_root / sha256[:2] / f"{sha256}.webp"
