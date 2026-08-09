-- Every pair of frames that could be one stack, with the cheap screen's verdict.
--
-- `docs/adr/0003-stack-on-verified-match.md` decides a stack by a verified match
-- between two frames and fences candidacy with the clock: two frames may belong
-- to one stack only if they sit in the same run of consecutive same-camera
-- captures, each gap at or below the window ceiling. Membership is complete
-- linkage -- every pair inside a stack must match -- so the pair set the offline
-- pass owes a verdict on is every pair *inside* a run, not merely the adjacent
-- ones. That is 3.63M pairs over this catalog at the committed 3600s ceiling.
--
-- `screen` is stored per pair rather than reduced to a yes-or-no, because the
-- fingerprint's own threshold is what ADR 0003 leaves unsettled: the labelling
-- harness chooses it, and a number chosen later has to be a re-read of these rows
-- rather than another pass. It is not the reader's *strictness*, which CONTEXT.md
-- defines as a threshold on the Match and never on the fingerprint.
--
-- `verdict` is what keeps "never plausibly the same picture" distinguishable from
-- "checked properly and disagreed". A screened-out pair is a named state rather
-- than a low number, so the geometric stage can select its own work without
-- re-deciding the screen's, and a pair it checks and rejects is not confusable
-- with a pair it never looked at.
--
-- It is therefore the one derived value in this table -- `screen >= 0.40` frozen at
-- the moment the pass ran -- and `photolib.candidates.refuse_if_rethresholded` is
-- what stops it going quietly stale: a re-run cannot repair a verdict, because the
-- resume key is the frame and every frame would already be done.
--
-- The model's identity is part of the key, for 008_fingerprint.sql's reason: a
-- change of model adds a population instead of overwriting one, and no query can
-- compare a screen from one model against a screen from another.
--
-- Keyed on sha256 and never on photo.id, also 008's reason: `archive.pipeline
-- .group` rebuilds `photo` and reassigns every id on each Apply to grid, and a
-- screen describes two frames' bytes rather than two tiles. `sha_early` is the
-- earlier capture of the two, ordered as the enumeration orders a run -- by
-- (camera, sort_key, sha256), so that two captures sharing a second land the
-- same way around on every pass.
--
-- WITHOUT ROWID because the row is very nearly all key: at 3.6M rows the
-- duplicate index a rowid table would carry costs more than the table.
CREATE TABLE main.candidate_pair (
  model     TEXT NOT NULL,          -- 'dinov2_vits14'
  version   TEXT NOT NULL,          -- the fingerprint version the screen read
  sha_early TEXT NOT NULL REFERENCES file(sha256),
  sha_late  TEXT NOT NULL REFERENCES file(sha256),
  screen    REAL NOT NULL,          -- cosine of the two fingerprints, in [-1, 1]
  verdict   TEXT NOT NULL CHECK (verdict IN ('screened_out', 'survivor')),
  PRIMARY KEY (model, version, sha_early, sha_late)
) WITHOUT ROWID;
