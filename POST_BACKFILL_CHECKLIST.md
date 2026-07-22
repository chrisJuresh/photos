# Post-backfill checklist

Use this checklist only after the `Resume Live Vault Backfill.cmd` terminal says `Backfill completed successfully` and the website's **Settings > Vault preparation** panel shows status `completed` and phase `complete`.

## 1. Run and retain the final release audit

Open PowerShell and paste this complete block. The release audit reads SQLite, ready derivatives, canonical filesystem metadata, and the retained 64-object canonical baseline sample. It never opens source media and never changes canonical objects. Derivative checksum verification can take a long time and may be quiet while it reads every ready derivative.

```powershell
Set-Location -LiteralPath 'C:\Users\Chris\Documents\photos'
$stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
$reportPath = "G:\MediaVault\reports\release-audit-$stamp.json"
Write-Host "Running the final release audit. Do not close this window..."

@'
from __future__ import annotations

import hashlib
import json
import os
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

from media_vault.config import ReviewConfig
from media_vault.review_backfill import audit_release_state

vault = Path(r"G:\MediaVault")
inbox = Path(r"G:\MediaVaultImports")
baseline_path = Path(
    r"C:\Users\Chris\AppData\Local\Temp\media-vault-stage11-live-copy-20260722-v3"
    r"\live-immutability-before.json"
)
backup_path = Path(
    r"G:\MediaVault\state\backups"
    r"\manifest-v2-20260722T010355Z-3d51a7116cd2.sqlite3"
)
report_path = Path(sys.argv[1])

if not baseline_path.is_file():
    raise SystemExit(f"Required pre-backfill baseline is missing: {baseline_path}")
if not backup_path.is_file():
    raise SystemExit(f"Required live migration backup is missing: {backup_path}")

print("Auditing SQLite, derivatives, and materialization lineage...", flush=True)
audit = audit_release_state(ReviewConfig(vault_root=vault, inbox_root=inbox))

print("Checking canonical inventory and the retained 64-object baseline sample...", flush=True)
baseline = json.loads(baseline_path.read_text(encoding="utf-8"))
database = vault / "state" / "manifest.sqlite3"
connection = sqlite3.connect(f"file:{database.as_posix()}?mode=ro", uri=True, timeout=30)
try:
    asset_count = int(connection.execute("SELECT COUNT(*) FROM assets").fetchone()[0])
    source_count = int(connection.execute("SELECT COUNT(*) FROM source_files").fetchone()[0])
    object_relpaths = [
        str(row[0])
        for row in connection.execute(
            "SELECT object_relpath FROM assets WHERE object_status='verified' ORDER BY asset_id"
        )
    ]
finally:
    connection.close()

objects_root = (vault / "objects").resolve()
missing_objects: list[str] = []
outside_objects: list[str] = []
for relpath in object_relpaths:
    candidate = (vault / relpath).resolve()
    try:
        inside = os.path.commonpath((str(candidate), str(objects_root))) == str(objects_root)
    except ValueError:
        inside = False
    if not inside:
        outside_objects.append(relpath)
    elif not candidate.is_file():
        missing_objects.append(relpath)

sample_errors: list[dict[str, object]] = []
for expected in baseline["sample_hashes"]:
    path = vault / str(expected["relpath"])
    problems: list[str] = []
    if not path.is_file():
        problems.append("missing")
    else:
        stat = path.stat()
        if stat.st_size != int(expected["size"]):
            problems.append("size changed")
        if stat.st_mtime_ns != int(expected["mtime_ns"]):
            problems.append("mtime changed")
        if stat.st_ctime_ns != int(expected["ctime_ns"]):
            problems.append("ctime changed")
        digest = hashlib.sha256()
        with path.open("rb", buffering=0) as handle:
            while block := handle.read(8 * 1024 * 1024):
                digest.update(block)
        if digest.hexdigest() != str(expected["sha256"]):
            problems.append("SHA-256 changed")
    if problems:
        sample_errors.append({"asset_id": expected["asset_id"], "problems": problems})

materializations = audit["materializations"]
checks = {
    "backfill_completed": (
        audit["backfill"]["status"] == "completed"
        and audit["backfill"]["phase"] == "complete"
    ),
    "sqlite_integrity_ok": audit["integrity_check"] == "ok",
    "foreign_keys_ok": audit["foreign_key_issues"] == 0,
    "ready_derivatives_exist": audit["ready_derivative_count"] > 0,
    "derivative_checksums_ok": not audit["derivative_checksum_errors"],
    "catalog_ready": audit["catalog_generation"] is not None and audit["catalog_item_count"] > 0,
    "materializations_ready": bool(materializations)
    and all(value["status"] == "ready" for value in materializations.values()),
    "materialization_generations_current": not audit["stale_materialization_kinds"],
    "asset_count_unchanged": asset_count == int(baseline["asset_identity"]["count"]),
    "source_record_count_unchanged": source_count == int(baseline["source_identity"]["count"]),
    "canonical_object_count_unchanged": len(object_relpaths) == int(baseline["object_count"]),
    "all_canonical_objects_present": not missing_objects,
    "all_canonical_paths_inside_objects": not outside_objects,
    "canonical_sample_hashes_and_stats_unchanged": not sample_errors,
    "required_live_migration_backup_retained": (
        backup_path.stat().st_size == 3_615_932_416
    ),
}
passed = all(checks.values())
payload = {
    "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    "passed": passed,
    "checks": checks,
    "immutability": {
        "asset_count": asset_count,
        "source_record_count": source_count,
        "canonical_object_count": len(object_relpaths),
        "missing_objects": missing_objects,
        "outside_objects": outside_objects,
        "sample_errors": sample_errors,
        "baseline": str(baseline_path),
    },
    "retained_live_migration_backup": str(backup_path),
    "audit": audit,
}
report_path.parent.mkdir(parents=True, exist_ok=True)
temporary = report_path.with_suffix(report_path.suffix + ".tmp")
temporary.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
temporary.replace(report_path)

for name, value in checks.items():
    print(f"{'PASS' if value else 'FAIL'}  {name}")
print(f"REPORT {report_path}")
raise SystemExit(0 if passed else 1)
'@ | .\.venv\Scripts\python.exe - $reportPath

if ($LASTEXITCODE -ne 0) {
    throw "The release audit did not pass. Keep both database copies and the migration backup. Do not run cleanup."
}

Write-Host "FINAL RELEASE AUDIT PASSED"
Write-Host "Retain this report: $reportPath"
```

A successful run prints `FINAL RELEASE AUDIT PASSED`, with every individual check marked `PASS`. If anything prints `FAIL` or the command raises an error, do not remove any evidence or backup.

After it passes, browse several Library, Organize, Stack, and Junk pages and confirm prepared thumbnails and counts load normally. This is a basic usability check, not a substitute for the audit.

## 2. Remove only the temporary audit copy

The temporary audit directory occupies approximately 6.74 GiB. The required live migration backup is a different 3.37 GiB file inside the live vault.

Recommended timing: keep the temporary copy until the final audit passes and the application has behaved normally for seven days. If local disk space is needed, it may be removed immediately after the audit passes and the usability check succeeds because the required live migration backup and the final report remain in the vault.

This block refuses cleanup unless it finds a passing report, the exact completed job state, the exact expected temporary path, and the exact retained live backup. It copies the small pre-backfill baseline into the live reports directory before deleting the temporary databases. It never targets source media, canonical objects, derivatives, or the live manifest.

```powershell
$tempAudit = [IO.Path]::GetFullPath(
    'C:\Users\Chris\AppData\Local\Temp\media-vault-stage11-live-copy-20260722-v3'
)
$expectedTempAudit = [IO.Path]::GetFullPath(
    'C:\Users\Chris\AppData\Local\Temp\media-vault-stage11-live-copy-20260722-v3'
)
$tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\')
$requiredBackup = 'G:\MediaVault\state\backups\manifest-v2-20260722T010355Z-3d51a7116cd2.sqlite3'
$expectedBackupHash = 'b4db14244726bdae77360266d4136196b5b30384559c8fee8b91ce979e339981'

if (-not $tempAudit.Equals($expectedTempAudit, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Temporary audit path does not exactly match the approved target.'
}
if (-not $tempAudit.StartsWith($tempRoot + '\', [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Temporary audit target is outside the Windows temporary directory.'
}
if ([IO.Path]::GetFileName($tempAudit) -ne 'media-vault-stage11-live-copy-20260722-v3') {
    throw 'Temporary audit directory name is not the approved exact name.'
}
if (-not (Test-Path -LiteralPath $tempAudit -PathType Container)) {
    throw "Temporary audit copy is already absent: $tempAudit"
}
if (-not (Test-Path -LiteralPath $requiredBackup -PathType Leaf)) {
    throw "Required live migration backup is missing: $requiredBackup"
}

$latestReport = Get-ChildItem -LiteralPath 'G:\MediaVault\reports' -Filter 'release-audit-*.json' -File |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
if ($null -eq $latestReport) {
    throw 'No retained final release-audit report was found.'
}
$report = Get-Content -LiteralPath $latestReport.FullName -Raw | ConvertFrom-Json
if ($report.passed -ne $true) {
    throw "Latest release audit did not pass: $($latestReport.FullName)"
}
if ($report.audit.backfill.status -ne 'completed' -or $report.audit.backfill.phase -ne 'complete') {
    throw 'The retained audit does not show a completed backfill.'
}

Write-Host 'Verifying the required live migration backup before cleanup...'
$actualBackupHash = (Get-FileHash -LiteralPath $requiredBackup -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actualBackupHash -ne $expectedBackupHash) {
    throw 'The required live migration backup checksum does not match its retained evidence.'
}

$baseline = Join-Path $tempAudit 'live-immutability-before.json'
$retainedBaseline = 'G:\MediaVault\reports\stage11-live-immutability-before.json'
if (-not (Test-Path -LiteralPath $baseline -PathType Leaf)) {
    throw "The pre-backfill baseline is missing: $baseline"
}
Copy-Item -LiteralPath $baseline -Destination $retainedBaseline -Force

Write-Host "Cleanup target: $tempAudit"
Write-Host "Passing audit: $($latestReport.FullName)"
Write-Host "Retained backup: $requiredBackup"
Write-Host "Retained baseline: $retainedBaseline"
$confirmation = Read-Host 'Type DELETE TEMP AUDIT COPY to remove only the temporary copy'
if ($confirmation -cne 'DELETE TEMP AUDIT COPY') {
    Write-Host 'Cleanup cancelled; nothing was removed.'
    return
}

Remove-Item -LiteralPath $tempAudit -Recurse -Force
if (Test-Path -LiteralPath $tempAudit) {
    throw 'Cleanup did not completely remove the temporary audit directory.'
}
Write-Host 'Temporary audit copy removed. The live migration backup, final report, and baseline remain retained.'
```

Never remove this required migration backup as part of the temporary cleanup:

```text
G:\MediaVault\state\backups\manifest-v2-20260722T010355Z-3d51a7116cd2.sqlite3
```

## 3. Afterward

The approved frontend/backfill plan has no further stage. Retain:

- the passing `G:\MediaVault\reports\release-audit-*.json` report;
- `G:\MediaVault\reports\stage11-live-immutability-before.json` after cleanup; and
- the required live migration backup listed above.

You may close the worker terminal after it reports success and close the review-interface terminal when you no longer need the website. Future review imports and metadata actions use the normal application workflow.

Separately, establish a normal recurring backup for the current schema-12 `state\manifest.sqlite3` and application metadata. The retained schema-2 migration backup is rollback evidence, not a current backup of the completed backfill. Generated derivatives are rebuildable and do not replace backups of the database, source media, or canonical vault objects.
