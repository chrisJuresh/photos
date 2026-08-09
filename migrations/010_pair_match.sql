-- The Match: how many distinctive points two frames agree on a transform for.
--
-- `docs/adr/0003-stack-on-verified-match.md` makes membership of a stack a
-- verified pairwise match and puts the cheap fingerprint screen in front of it.
-- 009_candidate_pair.sql is that screen; this is the check it defends. One row
-- per candidate the screen called a survivor, carrying the count of points that
-- agree -- "forty-one points agree on one transform" being the harder claim the
-- ADR wants precision to rest on, rather than a cosine over a threshold.
--
-- `points` is stored as the count and never as a yes-or-no, for 009's reason and
-- more sharply: the reader's *strictness* is defined in CONTEXT.md as a threshold
-- on the Match, ADR 0003 leaves its value unsettled, and a knob is only free if
-- moving it is a re-read of these rows rather than another pass. So this table
-- carries no derived verdict at all -- 009 has one because its `screen` decides
-- which pairs reach this stage, and nothing downstream of here needs deciding
-- before the labelling harness has run.
--
-- A pair with no row was not checked, which happens two ways and neither is a
-- zero: the screen rejected it, or a substrate it needed is missing. Zero means
-- checked properly and agreed on nothing -- which is also what a bracket end
-- blown out past having any texture left scores, and telling those two apart is
-- the fixture's job rather than this column's.
--
-- `method` and `version` are part of the key rather than columns beside it, for
-- 008_fingerprint.sql's reason: a change of detector adds a population instead of
-- overwriting one, and no query can compare a Match from one method against a
-- Match from another. `version` here is the match method's own and is not the
-- fingerprint version 009 records -- re-screening and re-matching are separate
-- decisions.
--
-- Keyed on sha256 and never on photo.id, also 008's reason, and `sha_early` is
-- the earlier capture of the two exactly as 009 orders them, so a row here joins
-- its candidate on the key it was enumerated under.
--
-- WITHOUT ROWID for 009's reason: the row is very nearly all key.
CREATE TABLE main.pair_match (
  method    TEXT NOT NULL,          -- 'sift_ratio_homography'
  version   TEXT NOT NULL,          -- bumped when the detector or the fit changes
  sha_early TEXT NOT NULL REFERENCES file(sha256),
  sha_late  TEXT NOT NULL REFERENCES file(sha256),
  points    INTEGER NOT NULL CHECK (points >= 0),  -- the Match
  PRIMARY KEY (method, version, sha_early, sha_late)
) WITHOUT ROWID;
