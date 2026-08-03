-- The triage survey: a derived, regenerable projection of `origin` and `file`
-- shaped so that a rule set can be re-costed while somebody is still typing it.
--
-- Measured on the real corpus, which is why these tables exist at all:
--
--   * scanning all 1,374,328 `origin` rows costs 51 ms -- not the problem;
--   * twelve `LIKE '%\segment\%'` patterns over the 315,680 distinct directories
--     cost 548 ms, and over the paths themselves 2.9 s. Substring matching IS
--     the problem, so no predicate here is a LIKE. A directory-name predicate is
--     an index seek into `triage_dir_segment`, and a subtree predicate is a
--     range scan of `triage_dir.path_key`;
--   * folding 1,374,328 paths to a verdict costs ~470 ms even with every
--     predicate free, so the counting surface is not the path list. It is
--     `triage_bucket`: one row per distinct combination of everything a
--     predicate can read. 1,374,328 paths collapse to ~440,000 buckets, and the
--     same aggregate lands in 79 ms.
--
-- Nothing here holds a decision. Every row is regenerable from the catalog by
-- `python -m photolib.triage_survey`, which is why it lives in catalog.sqlite3
-- and not in state.sqlite3.

-- Every distinct directory a path lives in. 315,680 rows against 1,374,328
-- paths, so a predicate over directories costs 0.23x what one over paths costs
-- before any index is involved.
CREATE TABLE main.triage_dir (
  id       INTEGER PRIMARY KEY,
  path     TEXT NOT NULL UNIQUE,  -- as walked, for display
  path_key TEXT NOT NULL          -- lowercased; NTFS is case-insensitive
);
CREATE INDEX main.triage_dir_key ON triage_dir(path_key);

-- One row per (directory, path segment). 2,913,848 rows over a vocabulary of
-- 47,787 distinct segments. `seg = 'node_modules'` is then an index seek
-- returning 75,341 directories in 3.6 ms, against 548 ms to LIKE for it.
CREATE TABLE main.triage_dir_segment (
  seg    TEXT NOT NULL,           -- lowercased, one directory name, no separators
  dir_id INTEGER NOT NULL
);
CREATE INDEX main.triage_dir_segment_i ON triage_dir_segment(seg, dir_id);

-- Screen 1's aggregate, rolled up once at build time rather than joining 2.9M
-- rows on every request. Segments nest, so these figures overlap by design:
-- a path under `...\node_modules\foo\.git\` is counted by both.
CREATE TABLE main.triage_segment (
  seg   TEXT PRIMARY KEY,
  dirs  INTEGER NOT NULL,
  paths INTEGER NOT NULL,
  bytes INTEGER NOT NULL
);

-- Extensions and source roots, interned. 1,941 and 9 distinct values against
-- 448,512 buckets, and the whole point is that a predicate over them is then an
-- integer comparison. Nine `ext = ?` branches as TEXT cost 1,327 ms over the
-- bucket table; the same nine against `ext_id` cost a fraction of that, because
-- the SQL is `ext_id = (SELECT id FROM triage_ext WHERE ext = ?)` and the
-- subquery is uncorrelated, so it resolves once per statement rather than once
-- per row. Both are stored lowercased: NTFS is case-insensitive, and folding at
-- build time is what lets the comparison stay a plain integer equality.
CREATE TABLE main.triage_ext (
  id  INTEGER PRIMARY KEY,
  ext TEXT NOT NULL UNIQUE        -- lowercased, leading dot, '' for none
);
CREATE TABLE main.triage_root (
  id   INTEGER PRIMARY KEY,
  root TEXT NOT NULL UNIQUE       -- lowercased
);

-- The counting surface. One row per distinct value of every column a predicate
-- may read, plus the two aggregates. A rule set is evaluated here and nowhere
-- else, so recompute cost is bounded by the number of distinct predicate
-- tuples rather than by the corpus.
CREATE TABLE main.triage_bucket (
  id        INTEGER PRIMARY KEY,
  dir_id    INTEGER NOT NULL,
  root_id   INTEGER NOT NULL,
  ext_id    INTEGER NOT NULL,
  kind      TEXT,                 -- image | raw_image | video | NULL, never read
  width     INTEGER,
  height    INTEGER,
  long_edge INTEGER,              -- max(width, height); orientation-invariant
  camera    INTEGER NOT NULL,     -- 0/1, EXIF camera present
  paths     INTEGER NOT NULL,
  bytes     INTEGER NOT NULL
);
CREATE INDEX main.triage_bucket_dir ON triage_bucket(dir_id);

-- The paging surface: which bucket each individual path belongs to. The counts
-- never touch this table; the contact sheets never touch `triage_bucket`.
CREATE TABLE main.triage_path (
  origin_id INTEGER PRIMARY KEY,
  bucket_id INTEGER NOT NULL
);
CREATE INDEX main.triage_path_bucket ON triage_path(bucket_id);

-- How `file.width`/`height` were obtained. Before this column the two are
-- indistinguishable, and they are not equivalent: `decode` is the real raster
-- of a rotated image, `header` is the container's own numbers read without
-- decoding a pixel, and for a JPEG carrying EXIF orientation 6 or 8 those two
-- are transposed. Triage bands on the long edge, which is invariant under that
-- transposition -- but anything that later reads width and height separately
-- has to know which it is holding.
ALTER TABLE main.file ADD COLUMN dims_src TEXT;  -- decode | header | NULL
