"""What the grid can be filtered and sorted by.

The corpus here is eight tiles, hand-written rather than generated, because every
assertion below is "which of these eight" and that is only readable if you can
see them. Between them they cover every option of every dimension: five byte
bands, five quality bands, four orientations including the unmeasured one, a
paired tile and a single, a near-duplicate and a unique, all three date sources,
and a tile with no `origin` row at all.

The load-bearing test is `test_every_option_counts_the_same_two_ways`. The menu's
numbers come from one Python pass over the tile set and the filter's answer comes
from SQL, and those are two implementations of one definition -- a band edge or a
NULL handled differently in one of them is a header that promises a number it
does not deliver.
"""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

import pytest
import synthetic

from photolib import browse, db, migrate

# id, kind, ext, sort_key, w, h, size, camera, lens, taken_src, gps, quality
TILES = [
    (1, "image", ".jpg", "2025-07-04T10:00:00", 4000, 3000, 6_000_000,
     "Cam A", "Lens 1", "exif:DateTimeOriginal", True, 0.40),
    (2, "raw_image", ".rw2", "2024-12-25T00:00:00", 3000, 4000, 25_000_000,
     "Cam A", None, "filename", False, 0.10),
    (3, "video", ".mp4", "2023-01-15T00:00:00", 1920, 1080, 150_000_000,
     None, None, "mtime", False, None),
    (4, "image", "", "2022-06-01T00:00:00", None, None, 500_000,
     "Cam B", "Lens 2", "exif:CreateDate", True, 0.02),
    (5, "image", ".png", "2026-02-14T00:00:00", 2000, 2000, 3_000_000,
     "Cam B", "Lens 1", "exif:DateTimeOriginal", False, 0.16),
    (6, "image", ".jpg", "2021-03-09T00:00:00", 800, 600, 900_000,
     None, "Lens 2", "mtime", False, 0.06),
    (7, "image", ".jpeg", "2025-07-04T10:00:00", 4000, 3000, 6_000_000,
     "Cam A", "Lens 1", "exif:DateTimeOriginal", True, 0.30),
    (8, "image", ".jpg", "2010-08-22T20:04:30", 1500, 1000, 2_000_000,
     "Cam C", None, "exif:DateTimeOriginal", False, -0.50),
]

# The resolution class Phase 2b would have recorded, which is a *label* in the
# JSON rather than a function of width and height, so it is stated per tile. Tile
# 3 has none: its quality is an error stub, so it has dimensions and no class,
# exactly like the 23 tiles in the real corpus that `grade: unscored` finds and
# no `res` option does.
RESOLUTION = {1: "huge", 2: "large", 4: "icon", 5: "medium", 6: "small", 7: "huge", 8: "medium"}

# Tiles holding a second file, which is what Phase 5's RAW+JPEG pairing produces.
PAIRED = {1, 5}
# `near_dup` rows for the tile's representative. Two groups of two.
NEAR_DUP = {1: 1, 2: 1, 4: 2, 7: 2}
# `origin.root` values per representative. Tile 4 has none: nothing in `origin`
# carries its bytes, which the `root` filter has to survive rather than assume.
ROOTS = {1: ["sd card"], 2: ["backup"], 3: ["backup", "sd card"], 5: ["sd card"],
         6: ["backup"], 7: ["sd card"], 8: ["old"]}


def sha_for(photo_id: int) -> str:
    return f"{photo_id:064x}"


@pytest.fixture(scope="module")
def catalog(tmp_path_factory) -> sqlite3.Connection:
    """The eight tiles, in a migrated temporary pair. Read-only once built."""
    directory: Path = tmp_path_factory.mktemp("browse")
    catalog_db, state_db = directory / "catalog.sqlite3", directory / "state.sqlite3"
    migrate.apply(catalog_db, state_db)

    conn = sqlite3.connect(catalog_db)
    conn.execute("BEGIN")
    for (photo_id, kind, ext, sort_key, width, height, size, camera, lens, taken_src,
         gps, quality) in TILES:
        sha = sha_for(photo_id)
        payload = None
        if quality is not None:
            payload = json.dumps(
                {"composite_quality": quality, "sharpness": abs(quality) / 2,
                 "resolution_class": RESOLUTION[photo_id]}
            )
        elif photo_id == 3:
            # Phase 2b persists a failure as {"error": ...}: a quality row with
            # no scalar in it, which is not the same as no row.
            payload = json.dumps({"error": "decode failed"})
        conn.execute(
            "INSERT INTO file (sha256, size, ext, kind, width, height, taken_at, taken_src, "
            "camera, lens, gps_lat, gps_lon, quality, vault_relpath, state, feature_ver) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 'test')",
            (sha, size, ext, kind, width, height, sort_key, taken_src, camera, lens,
             51.5 if gps else None, -0.1 if gps else None, payload, f"aa\\bb\\{sha}{ext}"),
        )
        conn.execute("INSERT INTO photo (id, rep_sha256, sort_key) VALUES (?, ?, ?)",
                     (photo_id, sha, sort_key))
        conn.execute("INSERT INTO photo_member (sha256, photo_id) VALUES (?, ?)", (sha, photo_id))
        if photo_id in PAIRED:
            # 'e' first, so a member sha cannot collide with a representative's:
            # every one of those is an id in hex and starts with a zero.
            second = f"e{photo_id:063x}"
            conn.execute(
                "INSERT INTO file (sha256, size, ext, kind, state, feature_ver) "
                "VALUES (?, 1, '.rw2', 'raw_image', 'published', 'test')", (second,)
            )
            conn.execute("INSERT INTO photo_member (sha256, photo_id) VALUES (?, ?)",
                         (second, photo_id))
        if photo_id in NEAR_DUP:
            conn.execute("INSERT INTO near_dup (sha256, group_id) VALUES (?, ?)",
                         (sha, NEAR_DUP[photo_id]))
        for index, root in enumerate(ROOTS.get(photo_id, [])):
            conn.execute(
                "INSERT INTO origin (id, path, root, ext, size, sha256, seen_at) "
                "VALUES (?, ?, ?, ?, ?, ?, '2026-08-07T00:00:00+00:00')",
                (photo_id * 10 + index, f"G:\\photos\\{root}\\{photo_id}{ext}", root, ext,
                 size, sha),
            )
    conn.execute("COMMIT")
    conn.close()

    read = db.connect(catalog_db, state_db, read_only=True)
    yield read
    read.close()


ALL_KINDS = ("image", "raw_image", "video")


def view(*, offered=None, **params) -> browse.Query:
    """A `browse.Query` from the query-string form the client would send.

    `kind` is passed through as-is rather than through `parse_kinds`, so a test
    can select `image` without raw coming with it. The expansion has its own
    test.

    `offered` stands in for what `browse.settings` would have returned — the
    assignments the corpus holds, which is what a request naming one is checked
    against. It defaults to the `bursts` fixture's second population, so a test can
    ask to be shown it; a test about the refusal passes `()`.
    """
    values = {key: value if isinstance(value, list) else [value] for key, value in params.items()}
    kinds = tuple(values.pop("kind", ())) or ALL_KINDS
    return browse.parse(
        values, kinds=kinds, settings=(STRICTER,) if offered is None else tuple(offered)
    )


def ids(conn, query: browse.Query, limit: int = 100) -> list[int]:
    sql, params = browse.page_sql(query, None)
    return [row[0] for row in conn.execute(sql, [*params, limit])]


def counted(conn, query: browse.Query) -> int:
    sql, params = browse.count_sql(query)
    return conn.execute(sql, params).fetchone()[0]


# -- the filters ---------------------------------------------------------


@pytest.mark.parametrize(
    "params, expected",
    [
        # Newest first throughout. Tiles 1 and 7 share a capture time, so the id
        # tiebreak decides them, and it runs the same way as the key: 7 then 1.
        ({}, [5, 7, 1, 2, 3, 4, 6, 8]),
        ({"kind": ["video"]}, [3]),
        ({"kind": ["raw_image"]}, [2]),
        ({"ext": ".jpg"}, [1, 6, 8]),
        ({"ext": ["", ".png"]}, [5, 4]),
        ({"camera": "Cam A"}, [7, 1, 2]),
        ({"camera": ""}, [3, 6]),
        ({"camera": ["Cam C", ""]}, [3, 6, 8]),
        ({"lens": "Lens 1"}, [5, 7, 1]),
        ({"lens": ""}, [2, 3, 8]),
        ({"year": "2025"}, [7, 1]),
        ({"year": ["2025", "2010"]}, [7, 1, 8]),
        ({"month": "7"}, [7, 1]),
        ({"month": ["2", "12"]}, [5, 2]),
        ({"orient": "landscape"}, [7, 1, 3, 6, 8]),
        ({"orient": "portrait"}, [2]),
        ({"orient": "square"}, [5]),
        ({"orient": "unknown"}, [4]),
        ({"res": "huge"}, [7, 1]),
        # Tile 3 is absent: an error stub has no resolution class. `res` cannot
        # reach it and `grade: unscored` is what does.
        ({"res": ["medium", "small"]}, [5, 6, 8]),
        ({"size": "under1mb"}, [4, 6]),
        ({"size": "1to5mb"}, [5, 8]),
        ({"size": "5to20mb"}, [7, 1]),
        ({"size": "20to100mb"}, [2]),
        ({"size": "over100mb"}, [3]),
        ({"grade": "best"}, [7, 1]),  # 0.30 is `best`, not `good`: the edge is >=
        ({"grade": "good"}, [5]),
        ({"grade": "fair"}, [2, 6]),
        ({"grade": "poor"}, [4, 8]),
        ({"grade": "unscored"}, [3]),
        ({"gps": "yes"}, [7, 1, 4]),
        ({"gps": "no"}, [5, 2, 3, 6, 8]),
        ({"pair": "pair"}, [5, 1]),
        ({"pair": "single"}, [7, 2, 3, 4, 6, 8]),
        ({"dup": "dup"}, [7, 1, 2, 4]),
        ({"dup": "unique"}, [5, 3, 6, 8]),
        ({"dated": "exif"}, [5, 7, 1, 4, 8]),
        ({"dated": "filename"}, [2]),
        ({"dated": "mtime"}, [3, 6]),
        ({"root": "sd card"}, [5, 7, 1, 3]),
        ({"root": ["old", "backup"]}, [2, 3, 6, 8]),
        ({"root": "nothing here"}, []),
        # two dimensions narrow, two values within one widen
        ({"camera": "Cam A", "gps": "yes"}, [7, 1]),
        ({"camera": ["Cam A", "Cam B"], "year": ["2025", "2026"]}, [5, 7, 1]),
        ({"kind": ["image"], "ext": ".rw2"}, []),
    ],
    ids=lambda value: str(value),
)
def test_each_filter_selects_exactly(catalog, params, expected):
    query = view(**params)
    assert ids(catalog, query) == expected
    assert counted(catalog, query) == len(expected)


def test_a_tile_with_no_origin_row_is_reachable(catalog):
    """Tile 4 has no `origin` row. It must still be in the unfiltered answer, and
    must not be swept in by a `root` filter it has no evidence for."""
    assert 4 in ids(catalog, view())
    for root in ("sd card", "backup", "old"):
        assert 4 not in ids(catalog, view(root=root))


def test_kind_image_still_means_still_photography(catalog):
    """`image` expands to cover raw -- the one irregularity in the vocabulary, and
    the reason `parse_kinds` stayed in `grid` rather than moving here."""
    from photolib.grid import parse_kinds

    query = browse.parse({}, kinds=parse_kinds(["image"]))
    assert ids(catalog, query) == [5, 7, 1, 2, 4, 6, 8]  # tile 2 is the raw one
    assert 3 not in ids(catalog, query)  # ...and the video is not


# -- the sorts -----------------------------------------------------------


@pytest.mark.parametrize(
    "name, expected",
    [
        ("newest", [5, 7, 1, 2, 3, 4, 6, 8]),
        ("oldest", [8, 6, 4, 3, 2, 1, 7, 5]),
        ("largest", [3, 2, 7, 1, 5, 8, 6, 4]),
        ("smallest", [4, 6, 8, 5, 1, 7, 2, 3]),
        # Tiles 1, 2 and 7 are all 12 Mpx -- 4000x3000 and 3000x4000 -- so this
        # is a three-way tie broken by id, in the direction the key runs.
        ("biggest", [7, 2, 1, 5, 3, 8, 6, 4]),
        ("tiniest", [4, 6, 8, 3, 5, 1, 2, 7]),
        ("best", [1, 7, 5, 2, 6, 4, 8, 3]),
        ("worst", [3, 8, 4, 6, 2, 5, 7, 1]),
        ("sharpest", [8, 1, 7, 5, 2, 6, 4, 3]),
        ("softest", [3, 4, 6, 2, 5, 7, 1, 8]),
    ],
)
def test_each_sort_orders_exactly(catalog, name, expected):
    """Every tile, in order, for each ordering. Ties break on `p.id` in the same
    direction as the key, which is what makes the ordering total -- and total is
    what a keyset cursor needs to be able to resume."""
    assert ids(catalog, view(sort=name)) == expected


@pytest.mark.parametrize("name", sorted(browse.SORTS))
def test_each_sort_pages_to_exhaustion_without_gap_or_repeat(catalog, name):
    """One tile per page, eight pages, off the sort's own keyset cursor.

    A page size of one puts a boundary between every pair of rows, including
    every tie, which is where a cursor that cannot distinguish two equal keys
    either repeats a row for ever or skips the rest of the tie.
    """
    query = view(sort=name)
    sort = query.ordering
    seen: list[int] = []
    cursor = None
    for _ in range(len(TILES) + 1):
        sql, params = browse.page_sql(query, cursor)
        rows = catalog.execute(sql, [*params, 2]).fetchall()
        if not rows:
            break
        photo_id, key = rows[0][0], rows[0][5]
        seen.append(photo_id)
        if len(rows) == 1:
            break
        # `str` is what the client does to the key on its way into the query
        # string, so the cursor is parsed back from exactly that.
        cursor = browse.parse_cursor(sort, [str(key)], [str(photo_id)])
    assert seen == ids(catalog, query)
    assert len(seen) == len(TILES)


# -- the menu and the filter agree ---------------------------------------


def test_every_option_counts_the_same_two_ways(catalog):
    """Each option's count, from the facet pass, equals what selecting it yields.

    This is the one that has to hold. The counts come from Python reading rows
    and the view comes from SQL reading the same rows, so a band edge, a
    NULL, or an empty string treated differently by one of them shows up here and
    nowhere else until somebody notices the header lying.
    """
    facets = browse.facets(catalog)
    checked = 0
    for dimension in facets["dimensions"]:
        name = dimension["name"]
        if name in ("kind", "month"):
            continue  # neither is a plain count -- both are covered below
        for option in dimension["options"]:
            query = view(**{name: option["value"]})
            assert option["count"] == counted(catalog, query), (name, option)
            checked += 1
    assert checked >= 40  # every option of thirteen dimensions, not a lucky few


def test_the_facet_total_is_every_tile(catalog):
    facets = browse.facets(catalog)
    assert facets["total"] == len(TILES)
    assert facets["kinds"] == {"image": 6, "raw_image": 1, "video": 1}
    # And the per-kind counts are what selecting that kind alone yields, once
    # `image`'s expansion is accounted for.
    assert counted(catalog, view(kind=["raw_image"])) == facets["kinds"]["raw_image"]
    assert counted(catalog, view(kind=["image", "raw_image"])) == (
        facets["kinds"]["image"] + facets["kinds"]["raw_image"]
    )


def test_the_months_are_always_all_twelve(catalog):
    """The one dimension with no count: it is derived from `sort_key`, and a menu
    that hid December because nothing was shot in it would be a worse menu."""
    months = next(d for d in browse.facets(catalog)["dimensions"] if d["name"] == "month")
    assert [option["value"] for option in months["options"]] == [str(n) for n in range(1, 13)]
    assert all(option["count"] is None for option in months["options"])
    assert months["options"][6]["label"] == "July"


def test_every_dimension_the_parser_knows_is_in_the_menu(catalog):
    """A filter the server accepts and the header never offers is dead code; one
    the header offers and the server refuses is a broken control."""
    offered = {d["name"] for d in browse.facets(catalog)["dimensions"]}
    assert offered == set(browse.ENUMS) | set(browse.COLUMNS) | {"kind", "year", "month", "root"}
    # ...and every one of them is titled, because the header renders what it is
    # handed and has no names of its own.
    assert offered == set(browse.TITLES)
    assert set(browse.HINTS) <= offered


def test_a_value_the_corpus_does_not_hold_is_not_offered(catalog):
    facets = browse.facets(catalog)
    extensions = next(d for d in facets["dimensions"] if d["name"] == "ext")
    assert [option["value"] for option in extensions["options"]] == [
        ".jpg", "", ".jpeg", ".mp4", ".png", ".rw2",
    ]
    # The empty extension is a real value here and is labelled as one, which is
    # not what an absent camera means -- see `NULLABLE`.
    assert [o["label"] for o in extensions["options"] if o["value"] == ""] == ["No extension"]
    cameras = next(d for d in facets["dimensions"] if d["name"] == "camera")
    assert [o["label"] for o in cameras["options"] if o["value"] == ""] == ["Not recorded"]


def test_options_are_ordered_for_reading(catalog):
    facets = {d["name"]: d["options"] for d in browse.facets(catalog)["dimensions"]}
    # Free vocabularies lead with the biggest source of photographs, ties by name
    # so the order is stable between runs -- which puts the absent camera, at two
    # tiles, ahead of "Cam B"'s two.
    assert [option["value"] for option in facets["camera"]] == ["Cam A", "", "Cam B", "Cam C"]
    # ...bands keep the order the band is in...
    assert [option["value"] for option in facets["size"]] == [
        "over100mb", "20to100mb", "5to20mb", "1to5mb", "under1mb",
    ]
    assert [option["value"] for option in facets["grade"]] == [
        "best", "good", "fair", "poor", "unscored",
    ]
    # ...and years run backwards, like the default sort.
    assert [option["value"] for option in facets["year"]] == [
        "2026", "2025", "2024", "2023", "2022", "2021", "2010",
    ]


def test_an_undated_tile_is_not_offered_as_a_year(catalog, tmp_path):
    """`sort_key` is '-' for a photo with no date at all -- 0 of 24,536 today, but
    the schema allows it. '-' is not a year the filter can express, so it must not
    appear in the menu as though it were."""
    catalog_db, state_db = tmp_path / "c.sqlite3", tmp_path / "s.sqlite3"
    migrate.apply(catalog_db, state_db)
    conn = sqlite3.connect(catalog_db)
    conn.execute(
        "INSERT INTO file (sha256, size, ext, kind, state, feature_ver) "
        "VALUES ('a', 1, '.jpg', 'image', 'published', 't')"
    )
    conn.execute("INSERT INTO photo (id, rep_sha256, sort_key) VALUES (1, 'a', '-')")
    conn.commit()
    conn.close()
    read = db.connect(catalog_db, state_db, read_only=True)
    try:
        years = next(d for d in browse.facets(read)["dimensions"] if d["name"] == "year")
        assert years["options"] == []
    finally:
        read.close()


# -- validation ----------------------------------------------------------


@pytest.mark.parametrize(
    "params, field",
    [
        ({"orient": "sideways"}, "orient"),
        ({"orient": "portrait,sideways"}, "orient"),
        ({"res": "gigantic"}, "res"),
        ({"size": "3mb"}, "size"),
        ({"grade": "excellent"}, "grade"),
        ({"gps": "maybe"}, "gps"),
        ({"pair": "triple"}, "pair"),
        ({"dup": "dupe"}, "dup"),
        ({"dated": "guess"}, "dated"),
        ({"orient": "PORTRAIT"}, "orient"),
        ({"year": "25"}, "year"),
        ({"year": "2025-07"}, "year"),
        ({"year": "202x"}, "year"),
        ({"month": "0"}, "month"),
        ({"month": "13"}, "month"),
        ({"month": "july"}, "month"),
        ({"sort": "cheapest"}, "sort"),
        ({"sort": "newest;drop table photo"}, "sort"),
        ({"camera": ["x"] * 65}, "camera"),
        ({"camera": "x" * 201}, "camera"),
        ({"orient": ",".join(["portrait"] * 65)}, "orient"),
    ],
    ids=lambda value: str(value),
)
def test_a_malformed_filter_is_refused_by_name(params, field):
    with pytest.raises(browse.BadFilter) as raised:
        view(**params)
    assert raised.value.field == field


def test_an_unknown_value_of_a_free_vocabulary_selects_nothing(catalog):
    """A camera name is a value, not a token: it comes out of the corpus, so
    there is no list to check it against and nothing to refuse. It selects
    nothing, which is the truthful answer."""
    for params in ({"camera": "Hasselblad"}, {"lens": "Noctilux"}, {"ext": ".tiff"}):
        assert ids(catalog, view(**params)) == []


def test_no_filter_value_reaches_the_sql_text(catalog):
    """Every value is bound. The enum terms are looked up by key in a dict, so
    the only way a token becomes SQL is by being written into `ENUMS`."""
    query = view(camera="Cam'; DROP TABLE photo --", ext="'", root="\\", year="2025")
    sql, params = browse.page_sql(query, None)
    assert "DROP" not in sql
    assert "Cam" not in sql
    assert "2025" not in sql
    assert "Cam'; DROP TABLE photo --" in params
    assert ids(catalog, query) == []
    # ...and the table is still there.
    assert catalog.execute("SELECT count(*) FROM photo").fetchone()[0] == len(TILES)


# -- stacking ------------------------------------------------------------

# A second hand-written corpus, because stacking is about which frames are the
# same photograph and the eight tiles above are eight different ones. Sixteen
# frames over 400 seconds of one afternoon, with the grouping `photolib.membership`
# would have written for them stored beside them: a four-frame bracket with a
# second body shooting through it, two frames a second apart that are *not* one
# stack, and every way a tile can reach the grid with no membership at all.
#
# `BURST_BASE` is the moment they all hang off. Tile 114 has no capture time,
# so it sorts on the '-' sentinel and its offset is None.
BURST_BASE = datetime(2025, 5, 1, 12, 0, 0)
EXIF = "exif:DateTimeOriginal"

# id, camera, seconds after BURST_BASE, taken_src, ext
BURSTS = [
    (101, "Cam A", 0, EXIF, ".jpg"),
    (102, "Cam B", 0, EXIF, ".jpg"),
    (103, "Cam A", 1, EXIF, ".jpg"),
    (104, "Cam B", 2, EXIF, ".jpg"),
    # An mtime date inside the bracket. Membership places no such frame, and --
    # the part that is easy to get wrong -- it does not split the bracket.
    (105, "Cam A", 1, "mtime", ".jpg"),
    # The one tile with a different extension, so a filter can remove it from
    # the bracket. See `test_a_filter_shrinks_a_stack_and_never_splits_it`.
    (106, "Cam A", 2, EXIF, ".png"),
    (107, "Cam A", 6, EXIF, ".jpg"),
    (108, "Cam A", 11, EXIF, ".jpg"),
    (109, "Cam C", 100, EXIF, ".jpg"),
    # No camera recorded, and two frames the walk kept together anyway.
    (110, None, 200, EXIF, ".jpg"),
    (111, None, 201, EXIF, ".jpg"),
    (112, None, 300, EXIF, ".jpg"),
    (113, "Cam A", 400, None, ".jpg"),  # no date source at all
    (114, "Cam A", None, EXIF, ".jpg"),  # EXIF said so, and there is no time
    # One second apart, one camera, and two stacks: the camera turned to face
    # something else between the presses. No window can express this, which is
    # the whole of why the grouping is read rather than computed.
    (115, "Cam D", 300, EXIF, ".jpg"),
    (116, "Cam D", 301, EXIF, ".jpg"),
]

# The stacks `photolib.membership` placed these frames in, which the fixture
# stores and the grid reads. 105, 113 and 114 are deliberately absent: a tile the
# filesystem dated gets no row, and reaches the grid as a stack of one on the
# strength of that absence.
PLACED = {
    "bracket": (101, 103, 106, 107),
    "second body": (102, 104),
    "after the bracket": (108,),
    "far away": (109,),
    "unnamed": (110, 111),
    "unnamed later": (112,),
    "turned away": (115,),
    "what it turned to": (116,),
}
UNPLACED = (105, 113, 114)

# What the count pane's first number has to be: one per stored stack, plus one
# apiece for the tiles no assignment holds.
STACKS = len(PLACED) + len(UNPLACED)

# A second assignment of the same frames, stored the way a second
# `python -m photolib.membership --strictness 40` would store it: a stricter
# threshold on the Match keeps less together, so the bracket comes apart and the
# two frames the camera recorded no name for stop being one stack. The corpus holds
# both populations at once because the real table does — moving a knob adds one
# rather than overwriting one.
STRICTER = {"strictness": 40, "linkage": browse.DEFAULT_LINKAGE}
STRICTER_PLACED = {
    "bracket, unpicked": (101, 103),
    "bracket, the rest": (106, 107),
    "second body": (102, 104),
    "after the bracket": (108,),
    "far away": (109,),
    "unnamed": (110,),
    "unnamed, unpicked": (111,),
    "unnamed later": (112,),
    "turned away": (115,),
    "what it turned to": (116,),
}


@pytest.fixture(scope="module")
def bursts(tmp_path_factory) -> sqlite3.Connection:
    directory: Path = tmp_path_factory.mktemp("bursts")
    catalog_db, state_db = directory / "catalog.sqlite3", directory / "state.sqlite3"
    migrate.apply(catalog_db, state_db)

    conn = sqlite3.connect(catalog_db)
    conn.execute("BEGIN")
    for photo_id, camera, offset, taken_src, ext in BURSTS:
        sha = sha_for(photo_id)
        taken_at = None
        if offset is not None:
            taken_at = (BURST_BASE + timedelta(seconds=offset)).strftime("%Y-%m-%dT%H:%M:%S")
        conn.execute(
            "INSERT INTO file (sha256, size, ext, kind, width, height, taken_at, taken_src, "
            "camera, vault_relpath, state, feature_ver) "
            "VALUES (?, 1000, ?, 'image', 100, 80, ?, ?, ?, ?, 'published', 'test')",
            (sha, ext, taken_at, taken_src, camera, f"aa\\bb\\{sha}{ext}"),
        )
        conn.execute("INSERT INTO photo (id, rep_sha256, sort_key) VALUES (?, ?, ?)",
                     (photo_id, sha, taken_at or "-"))
        conn.execute("INSERT INTO photo_member (sha256, photo_id) VALUES (?, ?)", (sha, photo_id))
    # The assignment, written the way `photolib.membership` writes it — the members
    # are in capture order above, so the first of each is the stack's name.
    synthetic.store_membership(
        conn, [[sha_for(member) for member in members] for members in PLACED.values()]
    )
    # And a second pass's, at a strictness of its own. Both are in the table because
    # a knob adds a population rather than replacing one.
    synthetic.store_membership(
        conn,
        [[sha_for(member) for member in members] for members in STRICTER_PLACED.values()],
        **STRICTER,
    )
    conn.execute("COMMIT")
    conn.close()

    read = db.connect(catalog_db, state_db, read_only=True)
    yield read
    read.close()


def grouped(conn, query: browse.Query) -> list[list[int]]:
    """The stacks, as lists of ids, each in the query's own order."""
    sql, params = browse.assignment_sql(query)
    stacks: dict[str, list[int]] = {}
    for photo_id, _key, stack in conn.execute(sql, params):
        stacks.setdefault(stack, []).append(photo_id)
    return list(stacks.values())


def stack_sets(conn, query: browse.Query) -> set[frozenset[int]]:
    return {frozenset(stack) for stack in grouped(conn, query)}


def test_a_stack_is_the_frames_membership_placed_together(bursts):
    """The grouping on screen is the stored one, frame for frame. Every tile is in
    exactly one stack, which is the property that makes a stack count a grid
    length, and a tile no assignment holds is a stack of one."""
    stacks = grouped(bursts, view(stack="on"))
    assert len(stacks) == STACKS
    assert stack_sets(bursts, view(stack="on")) == {
        frozenset(members) for members in PLACED.values()
    } | {frozenset({alone}) for alone in UNPLACED}
    assert sorted(photo_id for stack in stacks for photo_id in stack) == [
        row[0] for row in BURSTS
    ]


def test_a_second_body_shooting_through_a_bracket_is_its_own_stack(bursts):
    """Cam B's two frames land inside Cam A's bracket in capture order, and the
    two stacks stay two. Interleaved in the ordering is not interleaved in the
    grouping: a stack is a set of frames and never a stretch of the page."""
    stacks = stack_sets(bursts, view(stack="on"))
    assert frozenset({101, 103, 106, 107}) in stacks
    assert frozenset({102, 104}) in stacks


def test_the_clock_no_longer_decides_what_is_one_stack(bursts):
    """115 and 116 are one second and one camera apart and are two stacks, where
    every window the slider used to offer made them one. This is the complaint
    ADR 0003 exists for: unrelated frames arriving in one stack, at gaps under
    any window a reader would set."""
    stacks = stack_sets(bursts, view(stack="on"))
    assert frozenset({115}) in stacks
    assert frozenset({116}) in stacks


def test_a_tile_the_filesystem_dated_is_a_stack_of_one(bursts):
    """Three ways to carry no membership, one stack of one each: an mtime date
    (105), no date source at all (113), and a source that says EXIF over no time
    (114). A copy date is not when the photograph was taken, so such a tile can be
    nobody's neighbour.

    105 sits chronologically inside Cam A's bracket, from Cam A, so it is also the
    proof that an unplaced tile does not split the stack it sits inside.
    """
    stacks = stack_sets(bursts, view(stack="on"))
    for alone in UNPLACED:
        assert frozenset({alone}) in stacks
    assert frozenset({101, 103, 106, 107}) in stacks


def test_two_frames_from_an_unnamed_camera_can_share_a_stack(bursts):
    """`camera` is NULL for a body that recorded no name, and the walk read the
    two of them as the same photograph. Nothing about the grouping needs the
    camera to have a name, because nothing here groups by camera."""
    stacks = stack_sets(bursts, view(stack="on"))
    assert frozenset({110, 111}) in stacks
    assert frozenset({112}) in stacks


def test_a_filter_shrinks_a_stack_and_never_splits_it(bursts):
    """The ticket's load-bearing consequence. Tile 106 is the only `.png` and sits
    in the middle of the bracket; without it the bracket is three frames and still
    one stack, where a run cut at query time broke in two around the hole.

    So a narrowed view holds no more stacks than the whole one, and every stack in
    it is a subset of a stack of the whole -- which is what "shrinks and never
    splits" means, asserted over the filters rather than only for the one that
    demonstrates it.
    """
    whole = stack_sets(bursts, view(stack="on"))
    assert frozenset({101, 103, 106, 107}) in whole

    filtered = stack_sets(bursts, view(stack="on", ext=".jpg"))
    assert frozenset({101, 103, 107}) in filtered
    # The bracket is still one stack, so removing a member removed a tile and no
    # stack: one fewer frame on screen, the same number of stacks.
    assert len(filtered) == STACKS

    for narrowing in ({"ext": ".jpg"}, {"camera": "Cam A"}, {"orient": "landscape"},
                      {"ext": [".jpg", ".png"]}, {"dated": "exif"}):
        for stack in stack_sets(bursts, view(stack="on", **narrowing)):
            assert any(stack <= every for every in whole), narrowing


@pytest.mark.parametrize("name", sorted(browse.SORTS))
def test_every_sort_groups_the_same_tiles(bursts, name):
    """Membership is a property of the photographs, so it cannot depend on what
    the page is ordered by. Only which member is drawn first does."""
    query = view(stack="on", sort=name)
    assert stack_sets(bursts, query) == stack_sets(bursts, view(stack="on"))
    assert len(grouped(bursts, query)) == STACKS


def test_the_assignment_lists_a_stacks_members_in_the_pages_order(bursts):
    """`assignment_sql` returns rows in the sort's order, so the first member of
    a stack to appear is where the stack sits: the newest frame on `newest` and
    the oldest on `oldest`."""
    newest = {stack[0]: stack for stack in grouped(bursts, view(stack="on"))}
    assert newest[107] == [107, 106, 103, 101]
    oldest = {
        stack[0]: stack for stack in grouped(bursts, view(stack="on", sort="oldest"))
    }
    assert oldest[101] == [101, 103, 106, 107]


def test_a_view_holding_nothing_has_no_stacks(bursts):
    """The count pane's first number is the assignment's length, and a count pane
    cannot print NULL."""
    assert grouped(bursts, view(stack="on", ext=".nothing")) == []


def test_only_the_assignment_the_grid_names_is_read(bursts, monkeypatch):
    """The strictness, the linkage and the window are part of the key, so a second
    population in the table is a second population and never a merge. Asked at a
    setting nothing was written under, every tile comes back as its own stack --
    the fixture's rows are still there and are not this setting's.
    """
    monkeypatch.setattr(
        browse,
        "STACK_SETTING",
        {**browse.STACK_SETTING, "strictness": 25, "linkage": "neighbour", "ceiling": 900},
    )
    stacks = grouped(bursts, view(stack="on"))
    assert len(stacks) == len(BURSTS)
    assert all(len(stack) == 1 for stack in stacks)


def test_stacking_is_a_mode_and_not_a_measurement(bursts):
    """There is no window to send: two requests either stack or do not, so a memo
    keyed on the query has two keys and not eleven -- and dropping the mode makes
    them one, which is what the tile count wants."""
    assert view(stack="on") != view()
    assert view(stack="on").stack is True
    assert view().stack is False
    assert view(stack="on").unstacked() == view()
    unstacked = view()
    assert unstacked.unstacked() is unstacked


# ------------------------------------------------------- the reader's two knobs


def test_the_panel_is_offered_the_assignments_that_exist(bursts):
    """Not the cartesian product of the key. The corpus holds two populations, so
    two are offered, in one order however the table is read."""
    assert browse.settings(bursts) == (
        {"strictness": browse.DEFAULT_STRICTNESS, "linkage": browse.DEFAULT_LINKAGE},
        STRICTER,
    )


def test_the_settings_are_found_by_key_and_never_by_scanning_the_table(bursts):
    """It runs once per process and is in front of the first page, so what it must
    not do is read the assignment to find out which assignments exist. The key's
    leading columns are the three that are not knobs, so this is a search over the
    index rather than a pass over every row of every population -- measured at
    0.1 ms over 72,000 rows in three populations."""
    seen: list[tuple] = []

    class Recording:
        def execute(self, sql, params):
            seen.append((sql, params))
            return bursts.execute(sql, params)

    browse.settings(Recording())
    sql, params = seen[0]
    plan = " ".join(row[-1] for row in bursts.execute(f"EXPLAIN QUERY PLAN {sql}", params))
    assert "SEARCH stack_member USING PRIMARY KEY" in plan, plan
    assert "SCAN" not in plan, plan


def test_a_population_of_another_method_is_not_offered_as_a_strictness(bursts, monkeypatch):
    """The three columns that are not knobs scope the list: rows left behind by an
    older match method are that method's answer, and offering their strictness would
    invite a reader to compare it with this one's."""
    monkeypatch.setattr(browse, "STACK_SETTING", {**browse.STACK_SETTING, "version": "2"})
    assert browse.settings(bursts) == ()


def test_the_grid_groups_at_the_setting_the_reader_asked_for(bursts):
    """The knob is a choice of which stored assignment to read, so the same frames
    come back grouped the way that pass grouped them -- the stricter one takes the
    bracket apart, which is the reader's own complaint about a stack holding
    something that does not belong."""
    assert stack_sets(bursts, view(stack="on", strictness="40")) == {
        frozenset(members) for members in STRICTER_PLACED.values()
    } | {frozenset({alone}) for alone in UNPLACED}


def test_a_knob_moves_and_the_tiles_in_view_do_not(bursts):
    """A setting decides how the tiles are grouped and never which ones are there,
    which is why one tile count serves every setting of one view."""
    for query in (view(stack="on"), view(stack="on", strictness="40")):
        assert counted(bursts, query) == len(BURSTS)
    assert view(stack="on", strictness="40").unstacked() == view()


def test_an_assignment_nobody_wrote_is_refused_rather_than_drawn(bursts):
    """The hole a LEFT JOIN would leave. A setting with no rows reads as every tile
    in a stack of its own, which is a plausible page and not an error, so a reader
    could not tell it from a library that brackets nothing -- and the answer is to
    refuse the request by name, since the panel never offered it."""
    with pytest.raises(browse.BadFilter) as raised:
        view(stack="on", strictness="40", offered=())
    assert raised.value.field == "strictness"

    with pytest.raises(browse.BadFilter) as raised:
        view(stack="on", linkage="neighbour")
    assert raised.value.field == "linkage"


def test_a_pair_is_checked_and_not_each_half_of_it(bursts):
    """Two settings existing does not make their four combinations exist. Both of
    these values are offered and this pairing of them is not."""
    offered = ({"strictness": 20, "linkage": "majority"}, {"strictness": 40, "linkage": "complete"})
    with pytest.raises(browse.BadFilter) as raised:
        view(stack="on", strictness="40", linkage="majority", offered=offered)
    assert raised.value.field == "linkage"


def test_the_default_setting_is_asked_for_without_being_offered(bursts):
    """A clean checkout has run no pass, and the grid still has to serve a page:
    the default is the setting the code is pointed at, and an empty table read as
    stacks of one is `docs/grid-queries.md`'s documented no-op. Any other value is
    a claim about a population and is checked."""
    query = view(stack="on", offered=())
    assert (query.strictness, query.linkage) == (
        browse.DEFAULT_STRICTNESS,
        browse.DEFAULT_LINKAGE,
    )


@pytest.mark.parametrize(
    "value", ["", "-1", "20.5", "twenty", " 20", "0x14", "²", "٤", "9" * 10]
)
def test_a_malformed_strictness_is_refused_by_name(value):
    with pytest.raises(browse.BadFilter) as raised:
        view(stack="on", strictness=value)
    assert raised.value.field == "strictness"


@pytest.mark.parametrize("value", ["", "chain", "Majority", "single", "most"])
def test_a_linkage_outside_the_vocabulary_is_refused_by_name(value):
    """The three rules `migrations/011_stack_member.sql` allows, and nothing else --
    checked before the population is, so an unknown rule is never looked up."""
    with pytest.raises(browse.BadFilter) as raised:
        view(stack="on", linkage=value)
    assert raised.value.field == "linkage"


def test_two_knobs_are_two_settings_and_never_a_repeated_one(bursts):
    """A repeated parameter widens a filter, because a filter is a set of values.
    A setting is one assignment, so two of them is not a request the grid can
    answer -- it is refused rather than read as the last one."""
    with pytest.raises(browse.BadFilter) as raised:
        view(stack="on", strictness=["20", "40"])
    assert raised.value.field == "strictness"


def test_stacking_does_not_change_which_tiles_are_in_view(bursts):
    """The grouping is over the filtered set and never narrows it."""
    for query in (view(), view(stack="on")):
        assert counted(bursts, query) == len(BURSTS)
        assert sorted(ids(bursts, query)) == [row[0] for row in BURSTS]


@pytest.mark.parametrize(
    "value", ["4", "0", "11", "-1", "4.5", "four", "", " on", "On", "true", "1", "yes"]
)
def test_a_malformed_stack_value_is_refused_by_name(value):
    """`on` and nothing else. A client still sending seconds is a client that
    thinks it is choosing the grouping, so it is told rather than humoured."""
    with pytest.raises(browse.BadFilter) as raised:
        view(stack=value)
    assert raised.value.field == "stack"


def test_no_part_of_the_setting_reaches_the_sql_text(bursts):
    """The five values that name the assignment are bound like every other value, so
    the grouping SQL is one string and the setting is five parameters in front of the
    filter's own -- in the order the join names the columns in, which is why the join
    is generated from the same mapping."""
    sql, params = browse.assignment_sql(view(stack="on", ext=".jpg"))
    assert "stack_member" in sql
    assert sql.count("?") == len(params)
    for column, value in browse.STACK_SETTING.items():
        assert f"sm.{column} = ?" in sql
        assert str(value) not in sql.split("WHERE")[0]
    assert params[:len(browse.STACK_SETTING)] == list(browse.STACK_SETTING.values())
    assert params[-1] == ".jpg"


# -- the cover -----------------------------------------------------------

# The cover rule reads two numbers per frame and nothing else, so it is tested
# on the numbers rather than through a corpus. Ids are the frame's position in
# the page's own order, because that is the only other thing the rule uses.


def frames(*readings) -> list[tuple]:
    """`(id, luminance, sharpness)` per frame, in the page's order."""
    return [(index + 1, *reading) for index, reading in enumerate(readings)]


def test_a_bracket_draws_the_sharpest_frame_of_its_middle_exposure():
    """The rule the whole feature is for. The bracket's sharpest frame is its
    brightest one, so plain sharpest, brightest and first-in-order each name a
    different frame -- and the one that was aimed is the middle exposure."""
    bracket = frames((0.20, 0.40), (0.50, 0.70), (0.80, 0.95))
    assert browse.cover(bracket) == 2
    # ...and it is the middle exposure that decides it, not the position: the
    # same sharpnesses in a differently exposed order move the cover.
    assert browse.cover(frames((0.50, 0.40), (0.80, 0.70), (0.20, 0.95))) == 1


def test_a_burst_that_holds_one_exposure_draws_its_sharpest():
    """A constant-exposure burst has one band, so the rule reduces to plain
    sharpest. Anything that sliced the middle third by rank alone would draw an
    arbitrary frame here, which is the case this degrades correctly for."""
    assert browse.cover(frames((0.5, 0.30), (0.5, 0.90), (0.5, 0.60))) == 2
    assert browse.cover(
        frames((0.5, 0.10), (0.5, 0.20), (0.5, 0.90), (0.5, 0.30), (0.5, 0.40))
    ) == 3


@pytest.mark.parametrize("size, expected", [(3, 2), (6, 4), (9, 6), (12, 8)])
def test_the_band_is_the_middle_third_rounded_up(size, expected):
    """Sharpness rising with exposure makes the cover the top of the band, so
    the frame that comes back names where the band ends: a third of 9 is frames
    4-6 of the ranked order, and a third of 12 is frames 5-8."""
    rising = frames(*[(index / size, index / size) for index in range(size)])
    assert browse.cover(rising) == expected


def test_a_stack_of_two_and_a_stack_of_one_need_no_case_of_their_own():
    """Both fall out of the same arithmetic. A third of two rounds up to one,
    which is the darker of them; a third of one is itself."""
    assert browse.cover(frames((0.20, 0.40), (0.80, 0.95))) == 1
    assert browse.cover(frames((0.80, 0.95), (0.20, 0.40))) == 2
    assert browse.cover(frames((0.5, 0.30))) == 1


def test_a_frame_with_a_missing_reading_cannot_win():
    """A failed quality pass leaves `{"error": ...}` and no scalars, so both
    readings come back NULL. Such a frame is drawn only when it is the whole
    stack -- never in preference to one that can actually be ranked, however it
    is placed and whatever the other frames read."""
    assert browse.cover(frames((0.50, None), (0.20, 0.40), (0.80, 0.95))) == 2
    assert browse.cover(frames((None, 9.9), (0.20, 0.40), (0.80, 0.95))) == 2
    assert browse.cover(frames((None, None), (0.50, 0.70))) == 2


def test_a_stack_no_frame_of_which_can_be_ranked_draws_its_first():
    """Something has to be drawn, and with no reading to choose on the honest
    answer is the frame the page's own order reached first."""
    assert browse.cover(frames((None, None), (None, None))) == 1
    assert browse.cover(frames((None, 0.9), (0.5, None))) == 1


def test_a_tie_in_sharpness_goes_to_the_first_in_the_pages_order():
    """Two frames of one exposure that read identically sharp are, as far as
    this can tell, the same photograph. The page's order settles it, so the
    answer is stable rather than whichever the sort happened to hand over."""
    assert browse.cover(frames((0.5, 0.70), (0.5, 0.70), (0.5, 0.70))) == 1
    assert browse.cover(frames((0.5, 0.10), (0.5, 0.70), (0.5, 0.70))) == 2


def test_the_mean_luminance_is_the_histograms_centre_of_mass():
    """16 bins over the 0-1 luma, each holding a fraction of the frame. A frame
    that is half black and half white reads mid grey, which is what a centre of
    mass says and what a modal or a median bin would not."""
    black = [1.0] + [0.0] * 15
    white = [0.0] * 15 + [1.0]
    assert browse.mean_luminance(json.dumps(black)) == pytest.approx(0.03125)
    assert browse.mean_luminance(json.dumps(white)) == pytest.approx(0.96875)
    assert browse.mean_luminance(
        json.dumps([0.5] + [0.0] * 14 + [0.5])
    ) == pytest.approx(0.5)


def test_a_frame_with_no_histogram_has_no_mean_luminance():
    """`json_extract` returns NULL for a quality pass that never ran and for one
    that failed, and neither is an exposure of 0."""
    assert browse.mean_luminance(None) is None


def test_the_sort_key_is_never_null(catalog):
    """A NULL sort key makes `(key, id) < (?, ?)` unknown, and the page ends
    early with no error. Every sort coalesces, and tile 4 (no dimensions) and
    tile 3 (no quality scalar) are the rows that prove it."""
    for name in browse.SORTS:
        sort = browse.SORTS[name]
        nulls = catalog.execute(
            f"SELECT count(*) FROM photo AS p JOIN file AS f ON f.sha256 = p.rep_sha256 "
            f"WHERE ({sort.key}) IS NULL"
        ).fetchone()[0]
        assert nulls == 0, name
