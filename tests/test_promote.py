"""Phase 4: the classifier, the seven-step order, and everything it refuses.

`tmp_path` is on NTFS, so `os.link`, `st_ino`, `st_nlink` and
`FILE_ATTRIBUTE_READONLY` all behave exactly as they do on `G:` -- these are real
hardlinks and real sharing violations, not simulations. The two failures this
module exists to prevent both looked like success in a directory listing, so most
of what is asserted here is about the state of the *other* name after something
went wrong.

The corpus is eight paths over six objects, because precedence and ordering are
arithmetic and a large corpus would only hide which name moved.
"""

from __future__ import annotations

import hashlib
import io
import json
import os
import stat
from pathlib import Path

import pytest

from archive.pipeline import promote, triage_survey
from photolib import db, triage
from photolib.config import Config

# (origin path, ext, seed, times) -> content is seed * times, so the digest is real
CORPUS = (
    (r"G:\photos\lumix\DCIM\100_PANA\P1080096.JPG", ".jpg", "keep-jpg", 900),
    (r"G:\photos\lumix\DCIM\100_PANA\P1080096.RW2", ".rw2", "keep-raw", 2000),
    (r"G:\photos\backup\photos\holiday\beach.jpg", ".jpg", "keep-beach", 500),
    (r"G:\photos\backup\photos\holiday\noext", "", "keep-noext", 40),
    (r"G:\photos\backup\rcr\node_modules\x\logo.png", ".png", "drop-logo", 30),
    (r"G:\photos\backup\rcr\node_modules\y\icon.png", ".png", "drop-icon", 20),
)
KEPT = 4
EXCLUDED = 2


def content_of(seed: str, times: int) -> bytes:
    return (seed + "\n").encode() * times


def digest_of(seed: str, times: int) -> str:
    return hashlib.sha256(content_of(seed, times)).hexdigest()


def object_relpath(sha256: str, size: int) -> str:
    """MediaVault spells an object exactly this way, and so does `file.vault_relpath`."""
    return (
        f"objects\\sha256\\{sha256[:2]}\\{sha256[2:4]}\\"
        f"{sha256}_0123456789abcdef_fedcba9876543210_{size}.blob"
    )


@pytest.fixture
def config(tmp_path: Path, migrated: tuple[Path, Path]) -> Config:
    return Config(
        photos_root=tmp_path / "photos",
        restic_repo=tmp_path / "restic",
        mediavault_root=tmp_path / "MediaVault",
        mediavault_manifest_db=tmp_path / "MediaVault" / "state" / "manifest.sqlite3",
        vault_root=tmp_path / "vault",
        staging_root=tmp_path / "vault" / ".staging",
        deriv_root=tmp_path / "vault" / "deriv",
        meta_root=tmp_path / "vault" / "meta",
        thumb_root=tmp_path / "thumb",
        substrate_root=tmp_path / "substrate",
        catalog_db=migrated[0],
        state_db=migrated[1],
        backup_root=tmp_path / "backups",
        reveal_root=tmp_path / "MediaVault" / "objects",
        restic_password_command="true",
    )


def write_object(config: Config, seed: str, times: int) -> tuple[str, str, Path]:
    """One real object file under the MediaVault tree. Returns (sha, relpath, path)."""
    payload = content_of(seed, times)
    sha256 = hashlib.sha256(payload).hexdigest()
    relpath = object_relpath(sha256, len(payload))
    path = config.mediavault_root / relpath
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(payload)
    return sha256, relpath, path


@pytest.fixture
def corpus(conn, config: Config):
    """Six objects on disk, their catalog rows, the survey, and one exclude rule.

    `origins.jsonl` is written because `preflight` refuses without it -- that is
    step 13b's gate, and it is enforced rather than assumed.
    """
    (config.mediavault_root / "objects" / "sha256").mkdir(parents=True, exist_ok=True)
    config.vault_root.mkdir(parents=True, exist_ok=True)
    (config.vault_root / "origins.jsonl").write_text('{"sha256":"x"}\n', encoding="utf-8")
    for path, ext, seed, times in CORPUS:
        sha256, relpath, _ = write_object(config, seed, times)
        size = len(content_of(seed, times))
        conn.execute(
            "INSERT OR IGNORE INTO file (sha256, size, ext, kind, vault_relpath, state, feature_ver)"
            " VALUES (?, ?, ?, 'image', ?, 'read', 'test')",
            (sha256, size, ext, relpath),
        )
        conn.execute(
            "INSERT INTO origin (path, root, ext, size, sha256, seen_at)"
            " VALUES (?, ?, ?, ?, ?, '2026-08-06T00:00:00+00:00')",
            (path, path.split("\\")[2], ext, size, sha256),
        )
    triage_survey.build(conn)
    conn.execute(
        "INSERT INTO state.triage_rule (seq, predicate, decision, note, created_at) "
        "VALUES (0, ?, 'exclude', 'test', '2026-08-06T00:00:00+00:00')",
        (triage.predicate("dir_segment", "=", "node_modules"),),
    )
    return conn


def job_for(conn, config: Config, seed: str, times: int) -> promote.Job:
    """The one job the current rule set produces for this object."""
    sha256 = digest_of(seed, times)
    jobs, _ = promote.worklist(conn)
    return next(job for job in jobs if job.sha256 == sha256)


def log_for(config: Config) -> promote.UnlinkLog:
    return promote.UnlinkLog(config.catalog_db.parent / promote.UNLINK_LOG_NAME)


def log_lines(config: Config) -> list[dict]:
    path = config.catalog_db.parent / promote.UNLINK_LOG_NAME
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines()]


def row(conn, sha256: str) -> dict:
    got = conn.execute(
        "SELECT p.status, p.intent, p.decided_by, p.vault_relpath, p.file_index, p.detail, f.state,"
        " f.vault_relpath FROM promotion p JOIN file f ON f.sha256 = p.sha256 WHERE p.sha256 = ?",
        (sha256,),
    ).fetchone()
    keys = ("status", "intent", "decided_by", "vault_relpath", "file_index", "detail",
            "file_state", "file_relpath")
    return dict(zip(keys, got)) if got else {}


# --- names -------------------------------------------------------------------------


def test_the_target_name_is_the_digest_and_a_real_extension(tmp_path: Path):
    sha256 = "ab" + "cd" * 31
    assert promote.object_path(tmp_path, sha256, ".jpg") == (
        tmp_path / "ab" / "cd" / f"{sha256}.jpg"
    )
    # 2,422 objects in the real corpus have no extension, and a bare digest is a
    # valid name; the two-level shard is what keeps a directory small.
    assert promote.object_path(tmp_path, sha256, "") == tmp_path / "ab" / "cd" / sha256


def test_two_objects_cannot_collide_even_case_insensitively(corpus, config: Config):
    jobs, _ = promote.worklist(corpus)
    names = [
        str(promote.object_path(config.vault_root, job.sha256, job.ext)).lower() for job in jobs
    ]
    assert len(set(names)) == len(names)


# --- the worklist ------------------------------------------------------------------


def test_the_three_populations_come_out_of_one_verdict(corpus, config: Config):
    jobs, counts = promote.worklist(corpus)
    assert counts["objects"] == len(CORPUS)
    assert counts["promote"] == KEPT
    assert counts["unlink"] == EXCLUDED
    assert counts["stage_rename"] == 0
    assert {job.intent for job in jobs} == {promote.PROMOTE, promote.UNLINK}


def test_every_unlink_names_the_rule_that_excluded_it(corpus):
    jobs, _ = promote.worklist(corpus)
    reasons = {job.decided_by for job in jobs if job.intent == promote.UNLINK}
    assert len(reasons) == 1
    (reason,) = reasons
    assert reason.startswith("rule ") and "node_modules" in reason
    assert all(job.decided_by is None for job in jobs if job.intent == promote.PROMOTE)


def test_an_override_is_named_as_the_reason_not_the_rule(corpus):
    """An overridden file's rules-alone verdict is 'kept', which is the whole point."""
    sha256 = digest_of("keep-jpg", 900)
    corpus.execute(
        "INSERT INTO state.triage_override (sha256, decision, created_at)"
        " VALUES (?, 'exclude', '2026-08-06T00:00:00+00:00')",
        (sha256,),
    )
    jobs, counts = promote.worklist(corpus)
    job = next(job for job in jobs if job.sha256 == sha256)
    assert job.intent == promote.UNLINK and job.decided_by == "override"
    assert counts["unlink"] == EXCLUDED + 1 and counts["promote"] == KEPT - 1


def test_an_empty_rule_set_may_not_unlink_anything(conn, config: Config):
    with pytest.raises(promote.PromoteRefused, match="rule set is empty"):
        promote.worklist(conn)


def test_an_object_with_no_verdict_is_not_acted_on(corpus, config: Config):
    """No origin path means neither kept nor excluded, and a delete needs a reason."""
    corpus.execute(
        "INSERT INTO file (sha256, size, ext, vault_relpath, state, feature_ver)"
        " VALUES (?, 1, '.jpg', 'objects\\sha256\\ff\\ff\\x.blob', 'read', 'test')",
        ("f" * 64,),
    )
    with pytest.raises(promote.PromoteRefused, match="no triage verdict"):
        promote.worklist(corpus)


def test_rows_already_finished_are_counted_not_repeated(corpus):
    sha256 = digest_of("keep-jpg", 900)
    corpus.execute("UPDATE file SET state = 'published' WHERE sha256 = ?", (sha256,))
    jobs, counts = promote.worklist(corpus)
    assert counts["already_promoted"] == 1 and counts["promote"] == KEPT - 1
    assert sha256 not in {job.sha256 for job in jobs}


# --- the classifier ----------------------------------------------------------------


def test_the_five_states(tmp_path: Path):
    source = tmp_path / "object"
    target = tmp_path / "target"
    source.write_bytes(b"payload")
    assert promote.classify(promote.identity(source), promote.identity(target)) == promote.S0

    os.link(source, target)
    assert promote.classify(promote.identity(source), promote.identity(target)) == promote.S1

    other = tmp_path / "other"
    other.write_bytes(b"payload")  # same bytes, different extent
    assert promote.classify(promote.identity(source), promote.identity(other)) == promote.COLLISION

    os.remove(source)
    assert promote.classify(None, promote.identity(target)) == promote.AMBIGUOUS
    assert promote.classify(None, None) == promote.ABSENT


def test_an_unidentifiable_pair_is_a_collision_not_a_match():
    """Index 0 is `os.stat` falling back to FindFirstFileW. Two of those are not one file."""
    blind = promote.Ident(dev=1, index=0, nlink=1, size=5, readonly=False, reparse=False)
    assert promote.classify(blind, blind) == promote.COLLISION


# --- promotion ---------------------------------------------------------------------


def test_a_promotion_leaves_one_read_only_name_with_the_right_bytes(corpus, config: Config):
    job = job_for(corpus, config, "keep-jpg", 900)
    source = config.mediavault_root / job.relpath
    with log_for(config) as log:
        assert promote.promote_one(corpus, config, job, log) == "done"

    target = promote.object_path(config.vault_root, job.sha256, job.ext)
    survivor = promote.identity(target)
    assert not source.exists()
    assert survivor.nlink == 1 and survivor.readonly and not survivor.reparse
    assert target.read_bytes() == content_of("keep-jpg", 900)
    assert hashlib.sha256(target.read_bytes()).hexdigest() == job.sha256

    recorded = row(corpus, job.sha256)
    assert recorded["status"] == "done" and recorded["file_state"] == "published"
    assert recorded["file_relpath"] == str(target.relative_to(config.vault_root))
    assert recorded["file_index"] == survivor.key


def test_a_blocked_unlink_leaves_it_half_linked_and_never_read_only(corpus, config: Config):
    """The state that made `F06`. Read-only here would mutate the repair error 32 -> 5."""
    job = job_for(corpus, config, "keep-raw", 2000)
    source = config.mediavault_root / job.relpath
    target = promote.object_path(config.vault_root, job.sha256, job.ext)
    with open(source, "rb"):  # CPython passes no FILE_SHARE_DELETE
        with log_for(config) as log:
            assert promote.promote_one(corpus, config, job, log) == "half_linked"
        assert source.exists() and target.exists()
        assert not promote.identity(source).readonly
        assert not promote.identity(target).readonly
        assert promote.identity(target).nlink == 2

    recorded = row(corpus, job.sha256)
    assert recorded["status"] == "half_linked" and recorded["file_state"] == "read"
    assert "winerror 32" in recorded["detail"]


def test_repair_finishes_a_half_linked_object_and_is_idempotent(corpus, config: Config):
    job = job_for(corpus, config, "keep-raw", 2000)
    source = config.mediavault_root / job.relpath
    with open(source, "rb"), log_for(config) as log:
        promote.promote_one(corpus, config, job, log)

    jobs, _ = promote.worklist(corpus)
    with log_for(config) as log:
        first = promote.repair(corpus, config, jobs, log)
    assert first == {"rows": 1, "repaired": 1, "still_blocked": 0, "settled": 0}
    assert not source.exists()
    assert promote.identity(promote.object_path(config.vault_root, job.sha256, job.ext)).readonly

    jobs, _ = promote.worklist(corpus)  # the row has moved to 'published'
    with log_for(config) as log:
        again = promote.repair(corpus, config, jobs, log)
    assert again["repaired"] == 0 and again["still_blocked"] == 0


def test_repair_clears_read_only_on_either_name_and_retries_on_5(corpus, config: Config):
    """An earlier draft sealed the new name before the unlink. NTFS then refuses both."""
    job = job_for(corpus, config, "keep-raw", 2000)
    source = config.mediavault_root / job.relpath
    target = promote.object_path(config.vault_root, job.sha256, job.ext)
    with open(source, "rb"), log_for(config) as log:
        promote.promote_one(corpus, config, job, log)
    os.chmod(target, stat.S_IREAD)  # the botched order, applied by hand
    assert promote.identity(source).readonly  # one MFT record, both names

    with pytest.raises(OSError) as blocked:
        os.remove(source)
    assert blocked.value.winerror == promote.ACCESS_DENIED

    jobs, _ = promote.worklist(corpus)
    with log_for(config) as log:
        assert promote.repair(corpus, config, jobs, log)["repaired"] == 1
    assert not source.exists() and promote.identity(target).readonly


def test_a_collision_aborts_the_object_and_never_unlinks(corpus, config: Config):
    job = job_for(corpus, config, "keep-beach", 500)
    source = config.mediavault_root / job.relpath
    target = promote.object_path(config.vault_root, job.sha256, job.ext)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(b"a different file that happens to own that name")

    with log_for(config) as log:
        assert promote.promote_one(corpus, config, job, log) == promote.COLLISION
    assert source.exists() and source.read_bytes() == content_of("keep-beach", 500)
    assert target.read_bytes() == b"a different file that happens to own that name"
    assert row(corpus, job.sha256)["status"] == promote.COLLISION
    assert row(corpus, job.sha256)["file_state"] == "read"
    assert log_lines(config) == []


def test_error_183_re_enters_the_classifier_and_deletes_nothing(
    corpus, config: Config, monkeypatch
):
    """Reading 183 as "already linked, proceed to unlink" destroyed a file once."""
    job = job_for(corpus, config, "keep-beach", 500)
    source = config.mediavault_root / job.relpath
    target = promote.object_path(config.vault_root, job.sha256, job.ext)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(b"someone else")
    # Force the pre-link classifier to miss it, so os.link really returns 183.
    monkeypatch.setattr(promote, "classify", lambda source_ident, target_ident: promote.S0)

    with log_for(config) as log, pytest.raises(promote.PromoteRefused, match="winerror 183"):
        promote.promote_one(corpus, config, job, log)
    assert source.exists() and target.read_bytes() == b"someone else"


def test_a_recorded_promotion_that_never_landed_is_recovered_by_its_bytes(
    corpus, config: Config
):
    job = job_for(corpus, config, "keep-noext", 40)
    source = config.mediavault_root / job.relpath
    target = promote.object_path(config.vault_root, job.sha256, job.ext)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content_of("keep-noext", 40))
    os.remove(source)

    with log_for(config) as log:
        assert promote.promote_one(corpus, config, job, log) == "recovered"
    recorded = row(corpus, job.sha256)
    assert recorded["file_state"] == "published" and "recovered" in recorded["detail"]


def test_a_target_holding_other_bytes_aborts_loudly(corpus, config: Config):
    job = job_for(corpus, config, "keep-noext", 40)
    target = promote.object_path(config.vault_root, job.sha256, job.ext)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(b"not this object")
    os.remove(config.mediavault_root / job.relpath)

    with log_for(config) as log, pytest.raises(promote.PromoteRefused, match="has no copy left"):
        promote.promote_one(corpus, config, job, log)


def test_an_object_that_is_simply_gone_aborts_loudly(corpus, config: Config):
    job = job_for(corpus, config, "keep-noext", 40)
    os.remove(config.mediavault_root / job.relpath)
    with log_for(config) as log, pytest.raises(promote.PromoteRefused, match="neither"):
        promote.promote_one(corpus, config, job, log)
    assert row(corpus, job.sha256) == {}


def test_an_object_at_nlink_2_fails_its_precondition(corpus, config: Config):
    """The baseline is nlink 1 across 12,036 objects; a second name means something changed."""
    job = job_for(corpus, config, "keep-beach", 500)
    source = config.mediavault_root / job.relpath
    os.link(source, source.with_name("someone-elses-name.blob"))
    with log_for(config) as log, pytest.raises(promote.PromoteRefused, match="nlink 2"):
        promote.promote_one(corpus, config, job, log)
    assert source.exists()


# --- unlinking the excluded -------------------------------------------------------


def test_an_unlink_writes_the_rule_that_killed_it(corpus, config: Config):
    job = job_for(corpus, config, "drop-logo", 30)
    source = config.mediavault_root / job.relpath
    with log_for(config) as log:
        assert promote.unlink_one(corpus, config, job, log, {job.sha256}) == "done"

    assert not source.exists()
    (line,) = log_lines(config)
    assert line["intent"] == "unlink" and line["sha256"] == job.sha256
    assert line["status"] == "done" and "node_modules" in line["decided_by"]
    assert line["path"] == job.relpath and line["at"]
    recorded = row(corpus, job.sha256)
    assert recorded["file_state"] == "excluded" and recorded["file_relpath"] is None


def test_nothing_is_unlinked_that_is_not_explicitly_excluded(corpus, config: Config):
    job = job_for(corpus, config, "drop-logo", 30)
    with log_for(config) as log, pytest.raises(promote.PromoteRefused, match="not in the excluded"):
        promote.unlink_one(corpus, config, job, log, set())
    assert (config.mediavault_root / job.relpath).exists()


def test_a_path_outside_the_objects_root_is_refused(corpus, config: Config):
    job = job_for(corpus, config, "drop-logo", 30)
    outside = config.mediavault_root / "elsewhere.blob"
    outside.write_bytes(b"not an object")
    escaped = promote.Job(
        job.sha256, job.ext, job.size, job.state, "elsewhere.blob", job.intent, job.decided_by
    )
    with log_for(config) as log, pytest.raises(promote.PromoteRefused, match="not provably inside"):
        promote.unlink_one(corpus, config, escaped, log, {job.sha256})
    assert outside.exists()


def test_a_file_not_named_after_its_digest_is_refused(corpus, config: Config):
    """The row and the file have to agree about which object this is."""
    job = job_for(corpus, config, "drop-icon", 20)
    renamed = (config.mediavault_root / job.relpath).with_name("0000_not_the_digest.blob")
    os.rename(config.mediavault_root / job.relpath, renamed)
    mislabelled = promote.Job(
        job.sha256, job.ext, job.size, job.state,
        str(renamed.relative_to(config.mediavault_root)), job.intent, job.decided_by,
    )
    with log_for(config) as log, pytest.raises(promote.PromoteRefused, match="not named after"):
        promote.unlink_one(corpus, config, mislabelled, log, {job.sha256})
    assert renamed.exists()


def test_a_delete_that_never_got_recorded_is_recovered(corpus, config: Config):
    job = job_for(corpus, config, "drop-logo", 30)
    promote.record(corpus, job, "intent")
    os.remove(config.mediavault_root / job.relpath)
    with log_for(config) as log:
        assert promote.unlink_one(corpus, config, job, log, {job.sha256}) == "recovered"
    assert row(corpus, job.sha256)["file_state"] == "excluded"
    assert log_lines(config)[0]["recovered"] is True


def test_an_object_that_vanished_without_an_intent_row_stops_the_run(corpus, config: Config):
    job = job_for(corpus, config, "drop-logo", 30)
    os.remove(config.mediavault_root / job.relpath)
    with log_for(config) as log, pytest.raises(promote.PromoteRefused, match="no intent row"):
        promote.unlink_one(corpus, config, job, log, {job.sha256})


def test_a_blocked_delete_is_logged_and_left_alone(corpus, config: Config):
    job = job_for(corpus, config, "drop-icon", 20)
    source = config.mediavault_root / job.relpath
    with open(source, "rb"), log_for(config) as log:
        assert promote.unlink_one(corpus, config, job, log, {job.sha256}) == "blocked"
    assert source.exists() and not promote.identity(source).readonly
    assert row(corpus, job.sha256)["status"] == "blocked"
    assert log_lines(config)[0]["status"] == "blocked"


# --- the staging branch, which has no input on this corpus but must keep working ---


def staged_job(conn, config: Config, seed: str, times: int) -> promote.Job:
    """One kept file whose bytes are in staging rather than in MediaVault."""
    payload = content_of(seed, times)
    sha256 = hashlib.sha256(payload).hexdigest()
    relpath = f".staging\\{sha256[:2]}\\{sha256[2:4]}\\{sha256}.blob"
    path = config.vault_root / relpath
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(payload)
    conn.execute(
        "INSERT INTO file (sha256, size, ext, kind, vault_relpath, state, feature_ver)"
        " VALUES (?, ?, '.jpg', 'image', ?, 'staged', 'test')",
        (sha256, len(payload), relpath),
    )
    conn.execute(
        "INSERT INTO origin (path, root, ext, size, sha256, seen_at)"
        " VALUES (?, 'inbox', '.jpg', ?, ?, '2026-08-06T00:00:00+00:00')",
        (rf"G:\photos\inbox\{seed}.jpg", len(payload), sha256),
    )
    triage_survey.build(conn)
    jobs, counts = promote.worklist(conn)
    assert counts["stage_rename"] == 1
    return next(job for job in jobs if job.sha256 == sha256)


def test_a_staged_copy_is_published_by_rename(corpus, config: Config):
    job = staged_job(corpus, config, "staged-new", 60)
    with log_for(config) as log:
        assert promote.stage_rename_one(corpus, config, job, log) == "done"
    target = promote.object_path(config.vault_root, job.sha256, job.ext)
    assert not (config.vault_root / job.relpath).exists()
    assert target.read_bytes() == content_of("staged-new", 60)
    assert promote.identity(target).readonly
    assert row(corpus, job.sha256)["file_state"] == "published"


def test_a_matching_target_drops_the_staging_copy_rather_than_replacing_it(
    corpus, config: Config
):
    job = staged_job(corpus, config, "staged-dup", 70)
    target = promote.object_path(config.vault_root, job.sha256, job.ext)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content_of("staged-dup", 70))
    published = promote.identity(target)

    with log_for(config) as log:
        assert promote.stage_rename_one(corpus, config, job, log) == "recovered"
    assert not (config.vault_root / job.relpath).exists()
    assert promote.identity(target).key == published.key  # the same extent, not a replacement
    assert log_lines(config)[0]["intent"] == "staging_drop"


def test_a_mismatching_target_keeps_staging_and_aborts(corpus, config: Config):
    job = staged_job(corpus, config, "staged-clash", 80)
    target = promote.object_path(config.vault_root, job.sha256, job.ext)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(b"a different object owns this name")

    with log_for(config) as log, pytest.raises(promote.PromoteRefused, match="already holds"):
        promote.stage_rename_one(corpus, config, job, log)
    assert (config.vault_root / job.relpath).read_bytes() == content_of("staged-clash", 80)
    assert target.read_bytes() == b"a different object owns this name"


# --- the guards around the batch --------------------------------------------------


def test_a_silent_copy_is_caught_by_the_free_space_assertion(corpus, config: Config):
    """The only check that would notice: G: has 1.75 TiB free, so a 420 GB copy fits."""
    jobs, _ = promote.worklist(corpus)
    jobs = [job for job in jobs if job.intent == promote.PROMOTE][:1]
    # Read at the start of the run, at the start of the batch, and at its end. The
    # last reading is one 25 MiB copy lighter, which is what a degradation costs.
    drops = iter([10_000_000_000, 10_000_000_000, 10_000_000_000 - 26_775_552])

    class Usage:
        def __init__(self, free):
            self.free = free

    with log_for(config) as log:
        with pytest.raises(promote.PromoteRefused, match="A copy is happening"):
            promote.execute(corpus, config, jobs, log, usage=lambda _: Usage(next(drops)))


def test_the_log_appends_and_is_never_truncated(corpus, config: Config):
    for seed, times in (("drop-logo", 30), ("drop-icon", 20)):
        job = job_for(corpus, config, seed, times)
        with log_for(config) as log:
            promote.unlink_one(corpus, config, job, log, {job.sha256})
    assert len(log_lines(config)) == 2


def test_preflight_refuses_without_the_origin_map(corpus, config: Config):
    (config.vault_root / "origins.jsonl").unlink()
    with pytest.raises(promote.PromoteRefused, match="only content-hash"):
        promote.preflight(corpus, config)


def test_preflight_refuses_an_empty_origin_map(corpus, config: Config):
    (config.vault_root / "origins.jsonl").write_text("", encoding="utf-8")
    with pytest.raises(promote.PromoteRefused, match="is empty"):
        promote.preflight(corpus, config)


# --- the two modes ---------------------------------------------------------------


def test_the_dry_run_writes_absolutely_nothing(corpus, config: Config, capsys):
    corpus.close()
    assert promote.run(config, execute_writes=False) == 0
    printed = capsys.readouterr().out
    assert "DRY RUN" in printed and f"PROMOTE {KEPT} UNLINK {EXCLUDED}" in printed

    conn = db.connect(config.catalog_db, config.state_db)
    try:
        assert conn.execute("SELECT count(*) FROM promotion").fetchone()[0] == 0
        assert conn.execute("SELECT count(*) FROM file WHERE state = 'read'").fetchone()[0] == len(
            CORPUS
        )
    finally:
        conn.close()
    assert log_lines(config) == []
    assert promote.vault_object_index(config.vault_root) == set()
    for _, _, seed, times in CORPUS:
        assert (config.mediavault_root / object_relpath(
            digest_of(seed, times), len(content_of(seed, times))
        )).exists()


def test_execute_refuses_a_phrase_that_does_not_match(corpus, config: Config):
    corpus.close()
    with pytest.raises(promote.PromoteRefused, match="confirmation was"):
        promote.run(config, execute_writes=True, stdin=io.StringIO("PROMOTE 1 UNLINK 1\n"))
    conn = db.connect(config.catalog_db, config.state_db)
    try:
        assert conn.execute("SELECT count(*) FROM promotion").fetchone()[0] == 0
    finally:
        conn.close()


def test_the_whole_step_end_to_end(corpus, config: Config, capsys):
    corpus.close()
    phrase = f"PROMOTE {KEPT} UNLINK {EXCLUDED}\n"
    assert promote.run(config, execute_writes=True, stdin=io.StringIO(phrase)) == 0

    conn = db.connect(config.catalog_db, config.state_db)
    try:
        states = dict(conn.execute("SELECT state, count(*) FROM file GROUP BY 1").fetchall())
        assert states == {"published": KEPT, "excluded": EXCLUDED}
        assert conn.execute(
            "SELECT count(*) FROM promotion WHERE status <> 'done'"
        ).fetchone()[0] == 0
        for sha256, relpath in conn.execute(
            "SELECT sha256, vault_relpath FROM file WHERE state = 'published'"
        ):
            target = config.vault_root / relpath
            assert hashlib.sha256(target.read_bytes()).hexdigest() == sha256
            assert promote.identity(target).nlink == 1
            assert promote.identity(target).readonly
    finally:
        conn.close()

    # Nothing survives under the objects root, and every delete is on the log.
    remaining = [
        entry
        for entry in (config.mediavault_root / "objects").rglob("*")
        if entry.is_file()
    ]
    assert remaining == []
    unlinks = [line for line in log_lines(config) if line["intent"] == "unlink"]
    assert len(unlinks) == EXCLUDED
    assert {line["sha256"] for line in unlinks} == {
        digest_of(seed, times) for _, _, seed, times in CORPUS if seed.startswith("drop")
    }
