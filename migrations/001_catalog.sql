-- catalog.sqlite3: regenerable, written only by the pipeline.
-- Three tables carry the product. Schema qualifiers are explicit because one
-- connection holds both databases.

-- one row per path ever seen. THE one-to-many store.
CREATE TABLE main.origin (
  id           INTEGER PRIMARY KEY,
  path         TEXT NOT NULL UNIQUE,   -- G:\photos\lumix f 7-15-26 sd\DCIM\...
  root         TEXT NOT NULL,          -- 'lumix f 7-15-26 sd'
  ext          TEXT NOT NULL,
  size         INTEGER NOT NULL,
  mtime_ns     INTEGER,
  sha256       TEXT,                   -- filled when the bytes are read or adopted
  nlink        INTEGER,                -- from os.stat during the walk
  file_id      INTEGER,                -- NTFS file ID; hardlinked names share one
  seen_at      TEXT NOT NULL
);
CREATE INDEX main.origin_sha  ON origin(sha256);
CREATE INDEX main.origin_fid  ON origin(file_id);

-- one row per distinct byte sequence
CREATE TABLE main.file (
  sha256       TEXT PRIMARY KEY,
  size         INTEGER NOT NULL,
  ext          TEXT NOT NULL,
  kind         TEXT,                   -- image | video
  width        INTEGER, height INTEGER,
  taken_at     TEXT, taken_src TEXT,   -- exif | filename | mtime | none
  camera       TEXT, lens TEXT,
  gps_lat      REAL, gps_lon REAL,
  phash        INTEGER, dhash INTEGER,
  thumbhash    BLOB,                   -- ~30 bytes, instant placeholder
  quality      TEXT,                   -- small JSON: sharpness, entropy, clipping, ...
  vault_relpath TEXT,
  state        TEXT NOT NULL,          -- pending | adopted | read | staged | published | excluded
  feature_ver  TEXT NOT NULL           -- per-feature versions, not one global string
);
CREATE INDEX main.file_state ON file(state);
CREATE INDEX main.file_phash ON file(phash);

-- one row per grid tile
CREATE TABLE main.photo (
  id           INTEGER PRIMARY KEY,
  rep_sha256   TEXT NOT NULL REFERENCES file(sha256),
  sort_key     TEXT NOT NULL           -- capture timestamp. NEVER a rank.
);
CREATE INDEX main.photo_sort ON photo(sort_key DESC, id DESC);
