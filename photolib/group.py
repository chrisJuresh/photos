"""Phase 5: a tile is a group of files, not a file, and only kept files are tiles.

Two things happen here, and the first one is a hole rather than a feature.

**Nothing in the build order filtered `photo` to what triage kept.** Every step
up to Phase 4 wrote `photo` as one row per *file*: `capture_time.resolve` ran
`DELETE FROM photo` followed by `INSERT ... SELECT sha256 FROM file`, with no
`WHERE` clause at all. It produced 146,034 rows only because `file` held 146,034
rows when it last ran. `file` holds 787,798 now, so the same statement today
would put every triage-excluded `.pyc` and `node_modules` `.js` into the grid as
a tile. Phase 4 sets `file.state` to `excluded` for what it destroys, and no step
rebuilt `photo` from it.

The fix is (b) of the two on offer: **`photo` gets exactly one builder, and it is
this module.** `capture_time` no longer writes it. That is not merely the tidier
of the two -- once a tile is a group, `INSERT ... SELECT sha256 FROM file` is not
a statement that is missing a predicate, it is a statement of the wrong *shape*,
and a second writer that has to be undone by the first is worse than no second
writer. Adding a state predicate to `capture_time` would have left that shape in
place and made the two disagree about what a row means. Removing the statement
closes the hole by subtraction: re-running `capture_time` today cannot put an
excluded file in the grid, because it no longer inserts anything.

`TILE_STATE` is `published`, which is exactly the set Phase 4 hardlinked into the
vault. It is not a synonym for "kept": a kept file that has not been promoted has
no vault object, so `vault_relpath` points at a MediaVault name that no longer
exists and the grid would serve a 404. `pending`, `read`, `staged` and `excluded`
are all "not a tile", for different reasons that do not need telling apart here.

**RAW+JPEG pairing** is the grouping this step ships. `P1080096.JPG` beside
`P1080096.RW2` is the whole Lumix card, so `(directory, stem)` is near-certain
evidence rather than a similarity score -- and it is corroborated by the EXIF
capture time, which for one shutter actuation is the same second in both files.
Corroboration can only *refuse* a pair: two files that share a directory and a
stem but disagree about when they were taken are not one photograph. Where either
side has no EXIF date there is nothing to corroborate with, and the name evidence
stands on its own rather than being thrown away.

**Perceptual near-duplicates are computed and stored, and collapse nothing.**
Burst frames of one scene read as near-identical to pHash and over-grouping
*hides* photographs; v1's stacks are on record as built-but-uncalibrated (`F57`,
no labelled corpus). So `near_dup` is data to look at before deciding, and
`photo` does not join it.

**Grouping is incremental.** `rebuild` is the whole-corpus build; `extend` adds
files to an existing grouping, and a new photo either joins a component, merges
two, or forms its own. Neither the pairing evidence nor the pHash neighbourhood
is scanned: `pair_key` and `near_band` are materialised indexes, so both lookups
are seeks. `Work.examined` counts the rows either path actually reads, which is
what `tests/test_group.py` asserts the incremental guarantee against -- adding
100 photos to a 30,000-photo catalog reads on the order of 100 rows' worth of
work, not 30,100.

`sort_key` is the capture timestamp, never a dense rank: a rank renumbers every
row in the table on every future import. A group's timestamp is the earliest
resolved `taken_at` among its members -- they are one exposure, and the earliest
value is the one least likely to be a copy date, which is the same argument
`capture_time` uses for `min(mtime)` across origins.
"""

from __future__ import annotations

import argparse
import collections
import re
import sqlite3
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime

from photolib import db, migrate
from photolib.capture_time import SORT_KEY_UNDATED

# The one `file.state` that becomes a tile. See the module docstring.
TILE_STATE = "published"

# The two halves of a pair. RAW is `file.kind`, which the preprocessing pass
# wrote from the decoder it actually used; JPEG is the extension, because there
# is no kind that separates a camera JPEG from a PNG.
RAW_KIND = "raw_image"
JPEG_EXT = frozenset({".jpg", ".jpeg"})

# RAW and JPEG off one actuation carry the same DateTimeOriginal, which has
# one-second resolution. Two seconds allows for a camera that stamps the second
# file as it finishes writing it, and refuses a same-stem pair that is minutes
# apart -- which is a name collision between two shoots, not one photograph.
PAIR_TOLERANCE_SECONDS = 2

# Four 16-bit bands over the 64-bit pHash. By the pigeonhole principle any two
# hashes within Hamming `NEAR_BANDS - 1` agree exactly on at least one band, so
# banding misses no pair at that threshold -- it only bounds how many are
# compared. Keep the two constants together: raising the threshold without adding
# bands silently starts missing pairs.
#
# **The band width is set by the incremental guarantee, not by the threshold.**
# Eight 8-bit bands would reach Hamming 7, and a probe would then read 1/256th of
# the corpus per band -- 936 rows per new photo against a 30,000-photo catalog,
# which is O(corpus) wearing an index. 65,536 chunks per band puts average
# occupancy below one row, so a probe reads the neighbourhood and nothing else.
# Measured on the kept set: 24,733 distinct hashes, 89,577 candidate comparisons,
# largest single chunk 64.
#
# The threshold itself is UNCALIBRATED and deliberately so: nothing joins
# `near_dup` to `photo`, so it costs a wrong grouping nothing to be wrong.
NEAR_BANDS = 4
NEAR_BAND_BITS = 16
NEAR_MAX_DISTANCE = 3

MASK64 = (1 << 64) - 1
BAND_MASK = (1 << NEAR_BAND_BITS) - 1

# "Unedited beats edited", as a marker on the name and nothing cleverer. A file
# counts as edited only when EVERY name it is known by carries one, so a single
# clean copy anywhere in the corpus settles it. Whole tokens, never substrings:
# `edit` must not take `credit`, and `Reddit` is not a retouch.
EDIT_MARKER = re.compile(r"(?:^|[ _\-~(])(?:edited|edit|retouch|retouched)(?:$|[ _\-~).])", re.I)


class GroupRefused(RuntimeError):
    """Raised instead of building. `photo` is left exactly as it was."""


# --- union-find ---------------------------------------------------------------


class Components:
    """Union-find over hashable items. The whole grouping model, once.

    Both groupings this module builds -- pairs and near-duplicates -- are "a new
    item joins a component, merges two, or forms its own", which is exactly what
    this data structure is. Having one of them rather than two spellings is what
    makes `extend` able to reuse `rebuild`'s decisions.
    """

    def __init__(self) -> None:
        self.parent: dict = {}

    def add(self, item) -> None:
        self.parent.setdefault(item, item)

    def find(self, item):
        root = item
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[item] != root:
            self.parent[item], item = root, self.parent[item]
        return root

    def union(self, left, right) -> None:
        self.add(left)
        self.add(right)
        a, b = self.find(left), self.find(right)
        if a != b:
            # Lower root wins, so a component's identity does not depend on the
            # order the edges arrived in.
            low, high = (a, b) if a <= b else (b, a)
            self.parent[high] = low

    def groups(self) -> dict:
        """`root -> sorted members`, roots and members both in sorted order."""
        found: dict = collections.defaultdict(list)
        for item in sorted(self.parent):
            found[self.find(item)].append(item)
        return dict(found)


# --- what a file is, for grouping purposes -------------------------------------


@dataclass(slots=True)
class Kept:
    """One tile-eligible file, plus what the pairing and ranking rules read."""

    sha256: str
    size: int
    ext: str
    kind: str | None
    width: int | None
    height: int | None
    taken_at: str | None
    taken_src: str | None
    phash: int | None
    names: int = 0  # how many origin paths it is known by
    marked: int = 0  # how many of them carry an edit marker

    @property
    def cls(self) -> str | None:
        """`raw`, `jpeg`, or None for something that cannot be half of a pair."""
        if self.kind == RAW_KIND:
            return "raw"
        return "jpeg" if (self.ext or "").lower() in JPEG_EXT else None

    @property
    def edited(self) -> bool:
        return self.names > 0 and self.marked == self.names

    @property
    def has_exif(self) -> bool:
        return bool(self.taken_src) and self.taken_src.startswith("exif:")

    @property
    def rank(self) -> tuple:
        """Representative order: unedited, then pixels, then bytes, then EXIF.

        `sha256` last so that two genuinely indistinguishable members still pick
        the same winner on every rebuild.
        """
        pixels = (self.width or 0) * (self.height or 0)
        return (not self.edited, pixels, self.size, self.has_exif, self.sha256)


_COLUMNS = "sha256, size, ext, kind, width, height, taken_at, taken_src, phash"


@dataclass
class Work:
    """How many database rows a pass read. The unit of the incremental claim.

    Counted rather than timed because a wall clock cannot tell "proportional to
    the batch" from "proportional to the corpus, on a fast disk".
    """

    examined: int = 0


def pair_key(path: str) -> str:
    """`G:\\photos\\lumix\\DCIM\\P1080096.RW2` -> `g:\\photos\\lumix\\dcim\\p1080096`.

    Lowercased because NTFS is case-insensitive and the same card is spelled both
    ways across the backup trees. A name with no dot keeps its whole self as the
    stem, which is what makes `.gitignore` a stem rather than an empty one.
    """
    directory, _, base = path.rpartition("\\")
    stem = base.rpartition(".")[0] or base
    return f"{directory}\\{stem}".lower()


def when(file: Kept) -> datetime | None:
    """The EXIF capture instant, or None when there is no EXIF evidence.

    Only `exif:` sources. A `filename` or `mtime` date is a copy date often
    enough that corroborating one pair against another's would refuse real pairs
    -- and this predicate is only ever used to *refuse*.
    """
    if not file.has_exif or file.taken_at is None:
        return None
    return datetime.fromisoformat(file.taken_at)


def corroborates(raw: Kept, jpeg: Kept) -> bool:
    """Whether the EXIF timestamps agree, or are absent. Never invents evidence."""
    left, right = when(raw), when(jpeg)
    if left is None or right is None:
        return True
    return abs((left - right).total_seconds()) <= PAIR_TOLERANCE_SECONDS


def representative(members: list[Kept]) -> tuple[str, str]:
    """`(rep_sha256, sort_key)` for one group, by the rule `PLAN.md` states.

    **On this corpus that rule picks the JPEG in every RAW+JPEG pair, and the
    reason is a defect in the input rather than in the ordering.** `file.width`
    and `file.height` for a MediaVault-adopted RAW hold the *derivative's*
    geometry, not the sensor's: 12,568 `.rw2` rows read 1440x1920 and all 2,346
    `.arw` rows read 1616x1080, against 3448x4592 for the camera JPEG beside
    them. Only the 146 `.dng`, which Phase 2b demosaiced itself, carry a source
    raster. So "highest pixel count" is comparing a 1536px substrate against a
    full-size JPEG and the RAW loses; "largest bytes", the next term, would have
    picked it. The rule is left exactly as specified and the count is printed --
    inverting it silently would hide the measurement that motivates the change.

    It costs the grid nothing today: both members carry a thumbnail, and the
    substrate has the same aspect ratio as the JPEG, so justified layout is
    unaffected. What it changes is which file `/api/reveal` opens.
    """
    rep = max(members, key=lambda file: file.rank)
    dated = [file.taken_at for file in members if file.taken_at is not None]
    return rep.sha256, min(dated) if dated else SORT_KEY_UNDATED


# --- reading the kept set ------------------------------------------------------


def load_kept(
    conn: sqlite3.Connection, shas: list[str] | None, work: Work, into: dict | None = None
) -> tuple[dict[str, Kept], dict[str, list[str]]]:
    """`(files, pair keys per file)`, for the whole kept set or for named files.

    `shas=None` is the whole-corpus scan; a list is one primary-key seek each,
    which is what keeps `extend` off the corpus. `into` tops up a pool that
    already holds some of them, and files already in it are not re-read.
    """
    found = {} if into is None else into
    if shas is None:
        rows = conn.execute(f"SELECT {_COLUMNS} FROM file WHERE state = ?", (TILE_STATE,))
    else:
        rows = [
            row
            for sha in shas
            if sha not in found
            and (
                row := conn.execute(
                    f"SELECT {_COLUMNS} FROM file WHERE sha256 = ? AND state = ?",
                    (sha, TILE_STATE),
                ).fetchone()
            )
            is not None
        ]
    fresh = []
    for row in rows:
        file = Kept(*row)
        found[file.sha256] = file
        fresh.append(file.sha256)
    work.examined += len(fresh)
    return found, _read_names(conn, None if shas is None else fresh, found, work)


def _read_names(
    conn: sqlite3.Connection, shas: list[str] | None, kept: dict[str, Kept], work: Work
) -> dict[str, list[str]]:
    """Fill in the name-derived fields, and return the pair keys per file.

    One pass over `origin` for a full build; one index seek per file otherwise.
    `origin_sha` is the index that makes the second form a seek.
    """
    keys: dict[str, list[str]] = collections.defaultdict(list)
    if shas is None:
        rows = conn.execute(
            "SELECT o.sha256, o.path FROM origin o JOIN file f ON f.sha256 = o.sha256 "
            "WHERE f.state = ?",
            (TILE_STATE,),
        )
    else:
        rows = (
            row
            for sha in shas
            for row in conn.execute("SELECT sha256, path FROM origin WHERE sha256 = ?", (sha,))
        )
    read = 0
    for sha256, path in rows:
        read += 1
        file = kept.get(sha256)
        if file is None:
            continue
        file.names += 1
        base = path.rpartition("\\")[2]
        if EDIT_MARKER.search(base.rpartition(".")[0] or base):
            file.marked += 1
        if file.cls is not None:
            keys[sha256].append(pair_key(path))
    work.examined += read
    return keys


# --- RAW+JPEG pairing ----------------------------------------------------------


def bucket_edges(members: list[tuple[str, str]], kept: dict[str, Kept]):
    """The corroborated raw/jpeg edges inside one `(directory, stem)` bucket."""
    raws = [sha for sha, cls in members if cls == "raw"]
    jpegs = [sha for sha, cls in members if cls == "jpeg"]
    for raw in raws:
        for jpeg in jpegs:
            if corroborates(kept[raw], kept[jpeg]):
                yield raw, jpeg


# --- perceptual near-duplicates -------------------------------------------------


def bands(phash: int) -> list[tuple[int, int]]:
    """The `(band, chunk)` keys one pHash is indexed under."""
    value = phash & MASK64
    return [
        (band, (value >> (band * NEAR_BAND_BITS)) & BAND_MASK) for band in range(NEAR_BANDS)
    ]


def distance(left: int, right: int) -> int:
    """Hamming distance over 64 bits. SQLite hands back signed integers."""
    return ((left ^ right) & MASK64).bit_count()


def near_components(kept: dict[str, Kept]) -> dict[str, int]:
    """`sha256 -> group_id` for every file that has at least one near-duplicate.

    Union-find runs over *distinct* pHash values, not over files: 38,353 kept
    files carry 24,733 distinct hashes, and files sharing a hash exactly are in
    one component by construction. Group ids are numbered from the sorted
    minimum member, so a rebuild lands on the same ids.
    """
    by_hash: dict[int, list[str]] = collections.defaultdict(list)
    for file in kept.values():
        if file.phash is not None:
            by_hash[file.phash & MASK64].append(file.sha256)

    buckets: dict[tuple[int, int], list[int]] = collections.defaultdict(list)
    comp = Components()
    for value in sorted(by_hash):
        comp.add(value)
        for key in bands(value):
            buckets[key].append(value)
    for candidates in buckets.values():
        for index, left in enumerate(candidates):
            for right in candidates[index + 1 :]:
                if distance(left, right) <= NEAR_MAX_DISTANCE:
                    comp.union(left, right)

    groups = []
    for values in comp.groups().values():
        members = sorted(sha for value in values for sha in by_hash[value])
        if len(members) > 1:
            groups.append(members)
    groups.sort()
    return {sha: index for index, members in enumerate(groups, 1) for sha in members}


# --- the whole-corpus build ------------------------------------------------------


@dataclass
class Report:
    """What the rebuild did, in the numbers the step has to show."""

    stale_tiles: int = 0
    kept_files: int = 0
    pair_buckets: int = 0
    mixed_buckets: int = 0
    collapsed: int = 0
    tiles: int = 0
    refused_by_exif: int = 0
    edited_files: int = 0
    jpeg_over_raw: int = 0
    near_groups: int = 0
    near_files: int = 0
    largest_near: int = 0
    seconds: float = 0.0
    sizes: collections.Counter = field(default_factory=collections.Counter)
    work: Work = field(default_factory=Work)
    groups: list = field(default_factory=list)


def rebuild(conn: sqlite3.Connection) -> Report:
    """Rebuild `photo` and everything derived from it, from the kept set alone."""
    started = time.perf_counter()
    report = Report()
    report.stale_tiles = conn.execute("SELECT count(*) FROM photo").fetchone()[0]

    work = report.work
    kept, keys = load_kept(conn, None, work)
    report.kept_files = len(kept)
    if not kept:
        raise GroupRefused(
            f"no file is in state {TILE_STATE!r}, so there is nothing to show. Phase 4 "
            "(python -m photolib.promote) publishes the kept objects; this step reads what it "
            "published rather than emptying the grid"
        )
    report.edited_files = sum(file.edited for file in kept.values())

    buckets: dict[str, list[tuple[str, str]]] = collections.defaultdict(list)
    for sha256, paths in keys.items():
        for key in set(paths):
            buckets[key].append((sha256, kept[sha256].cls))
    report.pair_buckets = len(buckets)

    comp = Components()
    for sha256 in kept:
        comp.add(sha256)
    for members in buckets.values():
        classes = {cls for _, cls in members}
        if len(classes) < 2:
            continue
        report.mixed_buckets += 1
        edges = list(bucket_edges(members, kept))
        if not edges:
            report.refused_by_exif += 1
        for left, right in edges:
            comp.union(left, right)

    components = comp.groups()
    report.tiles = len(components)
    report.collapsed = report.kept_files - report.tiles
    report.sizes = collections.Counter(len(members) for members in components.values())

    tiles, membership = [], []
    for index, members in enumerate(sorted(components.values()), 1):
        files = [kept[sha] for sha in members]
        rep, key = representative(files)
        if kept[rep].cls == "jpeg" and any(file.cls == "raw" for file in files):
            report.jpeg_over_raw += 1
        tiles.append((index, rep, key))
        membership.extend((sha, index) for sha in members)

    near = near_components(kept)
    report.near_files = len(near)
    report.near_groups = len(set(near.values()))
    if near:
        report.largest_near = max(collections.Counter(near.values()).values())

    conn.execute("BEGIN")
    for table in ("photo_member", "photo", "pair_key", "near_band", "near_dup"):
        conn.execute(f"DELETE FROM {table}")
    conn.executemany("INSERT INTO photo (id, rep_sha256, sort_key) VALUES (?, ?, ?)", tiles)
    conn.executemany("INSERT INTO photo_member (sha256, photo_id) VALUES (?, ?)", membership)
    conn.executemany(
        "INSERT INTO pair_key (dir_stem, sha256, cls) VALUES (?, ?, ?)",
        sorted(
            {(key, sha256, kept[sha256].cls) for sha256, paths in keys.items() for key in paths}
        ),
    )
    conn.executemany(
        "INSERT INTO near_band (band, chunk, sha256) VALUES (?, ?, ?)",
        [
            (band, chunk, file.sha256)
            for file in kept.values()
            if file.phash is not None
            for band, chunk in bands(file.phash)
        ],
    )
    conn.executemany(
        "INSERT INTO near_dup (sha256, group_id) VALUES (?, ?)", sorted(near.items())
    )
    conn.execute("COMMIT")

    report.groups = _collapsed_groups(components, kept)
    report.seconds = time.perf_counter() - started
    return report


def _collapsed_groups(components: dict, kept: dict[str, Kept]) -> list:
    """Every group holding more than one file, largest first, for eyeballing."""
    multi = [members for members in components.values() if len(members) > 1]
    multi.sort(key=lambda members: (-len(members), members[0]))
    out = []
    for members in multi:
        files = [kept[sha] for sha in members]
        rep, key = representative(files)
        out.append((rep, key, files))
    return out


# --- the incremental path ---------------------------------------------------------


def extend(conn: sqlite3.Connection, shas: list[str]) -> Work:
    """Group newly published files into the existing `photo` table.

    Every lookup here is an index seek keyed on something the new files carry --
    their own primary key, their `(directory, stem)`, their pHash bands -- so the
    cost is the batch's, plus the size of whatever components it touches. Nothing
    reads the corpus, and `Work.examined` is the number the test holds to that.
    """
    work = Work()
    pool, keys = load_kept(conn, list(shas), work)
    new = [
        sha for sha in shas if sha in pool and _tile_of(conn, sha, work) is None
    ]
    if not new:
        return work

    keys = {sha: paths for sha, paths in keys.items() if sha in set(new)}
    conn.execute("BEGIN")
    conn.executemany(
        "INSERT OR IGNORE INTO pair_key (dir_stem, sha256, cls) VALUES (?, ?, ?)",
        sorted({(key, sha, pool[sha].cls) for sha, paths in keys.items() for key in paths}),
    )

    comp = Components()
    for sha in new:
        comp.add(sha)
    for key in sorted({key for paths in keys.values() for key in paths}):
        members = conn.execute(
            "SELECT sha256, cls FROM pair_key WHERE dir_stem = ?", (key,)
        ).fetchall()
        work.examined += len(members)
        load_kept(conn, [sha for sha, _ in members], work, pool)
        # A neighbour whose `file` row is no longer published has a stale
        # `pair_key` row and is not a member of anything.
        members = [(sha, cls) for sha, cls in members if sha in pool]
        for left, right in bucket_edges(members, pool):
            comp.union(left, right)

    _apply_components(conn, comp, pool, work)
    _apply_near(conn, new, pool, work)
    conn.execute("COMMIT")
    return work


def _tile_of(conn: sqlite3.Connection, sha256: str, work: Work) -> int | None:
    row = conn.execute(
        "SELECT photo_id FROM photo_member WHERE sha256 = ?", (sha256,)
    ).fetchone()
    if row is None:
        return None
    work.examined += 1
    return row[0]


def _apply_components(
    conn: sqlite3.Connection, comp: Components, pool: dict[str, Kept], work: Work
) -> None:
    """Write each touched component as one tile: joined, merged, or brand new."""
    next_id = conn.execute("SELECT coalesce(max(id), 0) FROM photo").fetchone()[0] + 1
    for members in comp.groups().values():
        ids = {
            found
            for sha in members
            if (found := _tile_of(conn, sha, work)) is not None
        }
        for photo_id in sorted(ids):
            existing = conn.execute(
                "SELECT sha256 FROM photo_member WHERE photo_id = ?", (photo_id,)
            ).fetchall()
            work.examined += len(existing)
            members = sorted(set(members) | {sha for (sha,) in existing})
        load_kept(conn, members, work, pool)

        if ids:
            target = min(ids)
        else:
            target, next_id = next_id, next_id + 1
        rep, key = representative([pool[sha] for sha in members])
        if ids:
            conn.execute(
                "UPDATE photo SET rep_sha256 = ?, sort_key = ? WHERE id = ?", (rep, key, target)
            )
        else:
            conn.execute(
                "INSERT INTO photo (id, rep_sha256, sort_key) VALUES (?, ?, ?)", (target, rep, key)
            )
        conn.executemany(
            "INSERT INTO photo_member (sha256, photo_id) VALUES (?, ?) "
            "ON CONFLICT(sha256) DO UPDATE SET photo_id = excluded.photo_id",
            [(sha, target) for sha in members],
        )
        # After the members have moved, never before: `photo_member.photo_id` is
        # a foreign key and an emptied tile is only deletable once it is empty.
        for photo_id in sorted(ids - {target}):
            conn.execute("DELETE FROM photo WHERE id = ?", (photo_id,))


def _apply_near(
    conn: sqlite3.Connection, new: list[str], pool: dict[str, Kept], work: Work
) -> None:
    """The same three outcomes for the near-duplicate grouping, which collapses nothing."""
    hashed = [sha for sha in new if pool[sha].phash is not None]
    if not hashed:
        return
    conn.executemany(
        "INSERT OR IGNORE INTO near_band (band, chunk, sha256) VALUES (?, ?, ?)",
        [(band, chunk, sha) for sha in hashed for band, chunk in bands(pool[sha].phash)],
    )

    comp = Components()
    for sha in hashed:
        comp.add(sha)
        candidates: set[str] = set()
        for band, chunk in bands(pool[sha].phash):
            rows = conn.execute(
                "SELECT sha256 FROM near_band WHERE band = ? AND chunk = ?", (band, chunk)
            ).fetchall()
            work.examined += len(rows)
            candidates.update(other for (other,) in rows)
        candidates.discard(sha)
        load_kept(conn, sorted(candidates), work, pool)
        for other in sorted(candidates):
            if other in pool and distance(pool[sha].phash, pool[other].phash) <= NEAR_MAX_DISTANCE:
                comp.union(sha, other)

    next_id = conn.execute("SELECT coalesce(max(group_id), 0) FROM near_dup").fetchone()[0] + 1
    for members in comp.groups().values():
        ids = set()
        for sha in members:
            row = conn.execute(
                "SELECT group_id FROM near_dup WHERE sha256 = ?", (sha,)
            ).fetchone()
            if row is not None:
                work.examined += 1
                ids.add(row[0])
        for group_id in sorted(ids):
            rows = conn.execute(
                "SELECT sha256 FROM near_dup WHERE group_id = ?", (group_id,)
            ).fetchall()
            work.examined += len(rows)
            members = sorted(set(members) | {sha for (sha,) in rows})
        if len(members) < 2:
            continue
        if ids:
            target = min(ids)
        else:
            target, next_id = next_id, next_id + 1
        conn.executemany(
            "INSERT INTO near_dup (sha256, group_id) VALUES (?, ?) "
            "ON CONFLICT(sha256) DO UPDATE SET group_id = excluded.group_id",
            [(sha, target) for sha in members],
        )


# --- the numbers this step has to show ---------------------------------------------


def _print_report(report: Report, top: int) -> None:
    print(f"\nkept set        {report.kept_files:,} files in state {TILE_STATE!r}")
    print(f"{'':16}{report.stale_tiles:,} rows were in `photo` before this ran")
    print(f"\npair evidence   {report.pair_buckets:,} distinct (directory, stem)")
    print(f"{'':16}{report.mixed_buckets:,} of them hold both a raw and a JPEG")
    print(f"{'':16}{report.refused_by_exif:,} refused by the EXIF timestamp check")
    print(f"{'':16}{report.edited_files:,} files carry an edit marker on every name")
    print(f"\ntiles before    {report.kept_files:,}   (one per kept file)")
    print(f"tiles after     {report.tiles:,}")
    print(f"collapsed       {report.collapsed:,}")
    print(
        f"representative  {report.jpeg_over_raw:,} groups picked the JPEG over a RAW member "
        "-- see `representative`"
    )
    print(
        "group sizes     "
        + ", ".join(f"{size}: {count:,}" for size, count in sorted(report.sizes.items()))
    )
    print(
        f"\nnear-duplicate  {report.near_groups:,} groups over {report.near_files:,} files, "
        f"largest {report.largest_near:,} -- STORED, collapses nothing"
    )
    print(f"\n{report.work.examined:,} rows examined in {report.seconds:.1f}s")

    if not top:
        return
    print(f"\ntop {top} collapsed groups, largest first, ties in sha256 order")
    for rep, key, files in report.groups[:top]:
        print(f"\n  {len(files)} files   {key}")
        for file in sorted(files, key=lambda f: f.rank, reverse=True):
            dims = f"{file.width}x{file.height}" if file.width else "-"
            print(
                f"    {'*' if file.sha256 == rep else ' '} {file.sha256[:12]}  "
                f"{(file.ext or '(none)'):<6}{(file.kind or '-'):<10}{dims:>12}"
                f"{file.size:>12,}  {file.taken_at or '-'}  {file.taken_src or '-'}"
            )


def run(top: int = 20, *, catalog_db=None, state_db=None) -> int:
    conn = db.connect(catalog_db, state_db)
    try:
        if migrate.version(conn) < 7:
            raise SystemExit("catalog is behind migration 007; run python -m photolib.migrate")
        report = rebuild(conn)
        _print_report(report, top)
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        prog="python -m photolib.group", description=__doc__.splitlines()[0]
    )
    parser.add_argument("--top", type=int, default=20, help="collapsed groups to list")
    args = parser.parse_args()
    try:
        sys.exit(run(args.top))
    except GroupRefused as exc:
        sys.exit(f"refused: {exc}")
