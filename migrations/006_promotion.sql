-- The promotion ledger: one row per object Phase 4 acts on, written BEFORE the
-- syscall that acts on it.
--
-- This is the durable intent record. `G:` has no active USN journal, so there is
-- no filesystem-side history to reconstruct a killed run from, and the two
-- failures Phase 4 has already produced were both "the directory listing looked
-- finished". A promotion that links, unlinks, and dies before it can record
-- itself leaves a name that is metadata-identical to an unrelated file; only a
-- row written in advance distinguishes the two. Step 16's in-flight scoping is
-- sound only because every attempt, including COLLISION and the half-linked
-- case, has a row here.
--
-- It lives in `catalog.sqlite3` and not in `state.sqlite3` on purpose. This is
-- machine-produced pipeline output, not a human decision, and `state.sqlite3` is
-- the irreplaceable file that gets snapshotted to `C:` and uploaded off-site --
-- 146,034 rows of ledger would turn an instant ~20 KB copy into a slow one.
CREATE TABLE main.promotion (
  sha256         TEXT PRIMARY KEY REFERENCES file(sha256),
  intent         TEXT NOT NULL,     -- promote | unlink | stage_rename
  object_relpath TEXT NOT NULL,     -- the name being destroyed, relative to its own root
  vault_relpath  TEXT,              -- the target, relative to vault_root; NULL for an unlink
  size           INTEGER NOT NULL,
  decided_by     TEXT,              -- 'rule <id> seq <n> <described>' | 'override'; NULL to promote
  status         TEXT NOT NULL,     -- intent | done | half_linked | collision | blocked | failed
  -- (volume serial, file index) of the surviving name, as text: the NTFS file
  -- index is 128 bits and SQLite's INTEGER is a signed 64.
  file_index     TEXT,
  detail         TEXT,              -- winerror or message for any status but done
  started_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

-- The repair pass and step 16 both select by status, never by scanning.
CREATE INDEX main.promotion_status ON promotion(status);
