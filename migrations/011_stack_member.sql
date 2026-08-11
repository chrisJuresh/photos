-- Which stack each tile belongs to: the assignment, materialised.
--
-- `docs/adr/0003-stack-on-verified-match.md` makes a stack the same photograph
-- taken more than once, decided by a verified pairwise match and fenced by the
-- clock. 010_pair_match.sql is that evidence, pair by pair; this is the reading of
-- it, frame by frame. It exists because **membership is a property of the
-- photographs and not of the view**: today the grid cuts runs at query time over
-- whatever the filters select, so narrowing the view splits a stack in two, and
-- once membership is written a filter can only ever remove frames from a stack.
--
-- `stack` is the earliest member's sha256 -- the name of the stack and one of its
-- own rows, so a stack of one is a frame naming itself. Content-addressed for
-- 008_fingerprint.sql's reason rather than numbered: `archive.pipeline.group`
-- rebuilds `photo` and reassigns every id on each Apply to grid, and a stack is a
-- set of frames' bytes and not a set of tiles. It is not the *cover*, which is the
-- sharpest frame of the middle-exposure third and is resolved per query.
--
-- The three things that decided the assignment are part of the key rather than
-- columns beside it, exactly as 008 and 010 key on the model and the method that
-- produced their numbers: a change of strictness, of linkage or of the window adds
-- a population instead of overwriting one, so moving one is visible in this table
-- rather than mixed into it, the old rows stay readable as the old setting's, and
-- no query can compare an assignment made at one setting against an assignment
-- made at another. `method` and `version` ride along for the same reason one step
-- further back -- an assignment is only as good as the Match rows it read.
--
-- `ceiling` is in the key and is nonetheless not a knob: it is the fence the Match
-- rows were computed behind, so a row at any other value would have been decided
-- over pairs nothing ever checked. It is here so that a build-time commitment that
-- changed could be seen to have changed.
--
-- Every EXIF-dated published tile gets exactly one row per setting, a frame that
-- shot alone included. A tile whose date came from the filesystem gets none: a
-- copy date is not when the photograph was taken, so it can be no one's
-- neighbour. A video gets a row and it is always its own -- nothing fingerprints
-- one, so nothing verifies one, and a pair with no evidence is never stacked.
--
-- WITHOUT ROWID for 009's reason: the row is all key but for the one column.
CREATE TABLE main.stack_member (
  method     TEXT NOT NULL,          -- 'sift_ratio_homography'
  version    TEXT NOT NULL,          -- the match method version the walk read
  strictness INTEGER NOT NULL CHECK (strictness >= 0),  -- the threshold on the Match
  linkage    TEXT NOT NULL CHECK (linkage IN ('complete', 'majority', 'neighbour')),
  ceiling    INTEGER NOT NULL CHECK (ceiling > 0),      -- the window, in seconds
  sha256     TEXT NOT NULL REFERENCES file(sha256),
  stack      TEXT NOT NULL REFERENCES file(sha256),     -- the earliest member
  PRIMARY KEY (method, version, strictness, linkage, ceiling, sha256)
) WITHOUT ROWID;
