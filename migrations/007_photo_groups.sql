-- Phase 5: a tile is a group of files, not a file.
--
-- `photo` keeps its shape -- (id, rep_sha256, sort_key) -- and changes meaning:
-- one row per GROUP of files, built from the triage-kept set alone. Everything
-- added here is derived and regenerable; dropping every row loses no decision.

-- which files a tile holds. `photo.rep_sha256` is always one of its own members.
CREATE TABLE main.photo_member (
  sha256   TEXT PRIMARY KEY REFERENCES file(sha256),
  photo_id INTEGER NOT NULL REFERENCES photo(id)
);
CREATE INDEX main.photo_member_photo ON photo_member(photo_id);

-- The (directory, stem) evidence RAW+JPEG pairing reads, materialised so that a
-- newly imported file finds its siblings by an index seek instead of a walk over
-- all 1,374,328 `origin` rows. Only raw and jpeg members are recorded: nothing
-- else can be either half of a pair.
CREATE TABLE main.pair_key (
  dir_stem TEXT NOT NULL,          -- 'g:\photos\lumix\dcim\108_pana\p1080096'
  sha256   TEXT NOT NULL REFERENCES file(sha256),
  cls      TEXT NOT NULL,          -- 'raw' | 'jpeg'
  PRIMARY KEY (dir_stem, sha256)
) WITHOUT ROWID;
CREATE INDEX main.pair_key_sha ON pair_key(sha256);

-- Perceptual near-duplicates: computed and STORED, never collapsed into a tile.
-- Burst frames of one scene read as near-identical to pHash, and over-grouping
-- hides photographs -- v1's stacks are built-but-uncalibrated (F57). A file with
-- no neighbour has no row here; a group is at least two files.
CREATE TABLE main.near_dup (
  sha256   TEXT PRIMARY KEY REFERENCES file(sha256),
  group_id INTEGER NOT NULL
);
CREATE INDEX main.near_dup_group ON near_dup(group_id);

-- The banded pHash index that makes "what is this photo near?" a seek. Four
-- 16-bit bands, so by the pigeonhole principle every pair within Hamming 3
-- shares at least one band exactly and no candidate is missed. The width is what
-- keeps a probe off the corpus -- see `photolib/group.py`.
CREATE TABLE main.near_band (
  band   INTEGER NOT NULL,
  chunk  INTEGER NOT NULL,
  sha256 TEXT NOT NULL REFERENCES file(sha256),
  PRIMARY KEY (band, chunk, sha256)
) WITHOUT ROWID;
