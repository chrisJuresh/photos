from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from .core import is_within


DEFAULT_INBOX_ROOT = Path(r"G:\MediaVaultImports")
DEFAULT_REVIEW_HOST = "127.0.0.1"
DEFAULT_DASHBOARD_PORT = 8765
DEFAULT_REVIEW_PORT = 8766


@dataclass(frozen=True)
class WorkerLimits:
    total_workers: int = 2
    media_io_workers: int = 1
    analysis_workers: int = 1

    def __post_init__(self) -> None:
        if self.total_workers < 1:
            raise ValueError("total_workers must be at least 1")
        if self.media_io_workers < 1 or self.analysis_workers < 1:
            raise ValueError("worker class limits must be at least 1")
        if max(self.media_io_workers, self.analysis_workers) > self.total_workers:
            raise ValueError("worker class limits may not exceed total_workers")


@dataclass(frozen=True)
class RequestBudgets:
    default_page_size: int = 100
    max_page_size: int = 500
    max_json_payload_bytes: int = 1_048_576
    query_timeout_ms: int = 3_000

    def __post_init__(self) -> None:
        if self.default_page_size < 1:
            raise ValueError("default_page_size must be at least 1")
        if self.max_page_size < self.default_page_size:
            raise ValueError("max_page_size must be at least default_page_size")
        if self.max_json_payload_bytes < 1:
            raise ValueError("max_json_payload_bytes must be at least 1")
        if self.query_timeout_ms < 1:
            raise ValueError("query_timeout_ms must be at least 1")


@dataclass(frozen=True)
class AnalyzerVersions:
    review_derivative: str = "review-derivative-v1"
    vault_derivative: str = "vault-derivative-v1"
    extended_metadata: str = "extended-metadata-v1"
    quality_features: str = "quality-features-v1"
    materialized_view: str = "materialized-view-v1"

    def __post_init__(self) -> None:
        for name, value in vars(self).items():
            if not value or value.strip() != value:
                raise ValueError(f"Analyzer version {name} must be a non-empty normalized string")


@dataclass(frozen=True)
class ReviewConfig:
    vault_root: Path
    inbox_root: Path = DEFAULT_INBOX_ROOT
    derivative_root: Path | None = None
    review_host: str = DEFAULT_REVIEW_HOST
    review_port: int = DEFAULT_REVIEW_PORT
    dashboard_port: int = DEFAULT_DASHBOARD_PORT
    workers: WorkerLimits = field(default_factory=WorkerLimits)
    request_budgets: RequestBudgets = field(default_factory=RequestBudgets)
    analyzer_versions: AnalyzerVersions = field(default_factory=AnalyzerVersions)

    def __post_init__(self) -> None:
        vault_root = self.vault_root.absolute()
        inbox_root = self.inbox_root.absolute()
        derivative_root = (self.derivative_root or (vault_root / "derivatives")).absolute()
        object.__setattr__(self, "vault_root", vault_root)
        object.__setattr__(self, "inbox_root", inbox_root)
        object.__setattr__(self, "derivative_root", derivative_root)

        if self.review_host not in {"127.0.0.1", "localhost", "::1"}:
            raise ValueError("review_host must be a localhost address")
        for name, port in (("review_port", self.review_port), ("dashboard_port", self.dashboard_port)):
            if not 1 <= port <= 65_535:
                raise ValueError(f"{name} must be between 1 and 65535")
        if self.review_port == self.dashboard_port:
            raise ValueError("review_port must remain separate from dashboard_port")

        canonical_objects = vault_root / "objects"
        self._assert_disjoint(inbox_root, vault_root, "inbox", "vault")
        self._assert_disjoint(derivative_root, canonical_objects, "derivative root", "canonical objects")
        self._assert_disjoint(derivative_root, inbox_root, "derivative root", "inbox")

    @staticmethod
    def _assert_disjoint(left: Path, right: Path, left_name: str, right_name: str) -> None:
        if is_within(left, right) or is_within(right, left):
            raise ValueError(f"{left_name} and {right_name} must be completely separate")

    @property
    def canonical_objects_root(self) -> Path:
        return self.vault_root / "objects"

    def assert_source_separated(self, source_root: Path) -> None:
        source = source_root.absolute()
        self._assert_disjoint(source, self.vault_root, "immutable source", "vault")
        self._assert_disjoint(source, self.inbox_root, "immutable source", "inbox")
        self._assert_disjoint(source, self.derivative_root, "immutable source", "derivative root")

    def storage_boundaries(self) -> dict[str, dict[str, str | bool]]:
        return {
            "source_media": {"mutability": "permanently immutable", "location": "configured per legacy command"},
            "canonical_objects": {
                "mutability": "permanently immutable",
                "location": str(self.canonical_objects_root),
            },
            "derivatives": {
                "mutability": "regenerable",
                "location": str(self.derivative_root),
                "separate_from_canonical_objects": True,
            },
        }
