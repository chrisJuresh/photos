from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

import uvicorn

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from media_vault.config import ReviewConfig  # noqa: E402
from media_vault.core import VaultLayout  # noqa: E402
from media_vault.db import ManifestDB  # noqa: E402
from media_vault.review_api import create_review_app  # noqa: E402


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="media-vault-review-e2e-") as temporary:
        root = Path(temporary)
        inbox = root / "inbox"
        inbox.mkdir()
        layout = VaultLayout(root / "vault")
        layout.create()
        db = ManifestDB(layout.database)
        db.close()
        port = int(os.environ.get("MEDIA_VAULT_REVIEW_E2E_PORT", "4173"))
        config = ReviewConfig(
            vault_root=layout.root,
            inbox_root=inbox,
            review_port=port,
        )
        app = create_review_app(config)
        uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning", access_log=False)


if __name__ == "__main__":
    main()
