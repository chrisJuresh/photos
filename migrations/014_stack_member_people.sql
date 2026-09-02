-- The people rule joins `stack_member`'s key: which clustering the walk read a
-- frame's people from, beside the strictness and the linkage it walked with.
--
-- `docs/adr/0004-people-veto-a-stack.md` puts a veto on top of the Match: a stack
-- needs one member whose people contain every other member's, and where the Match
-- proposed one with no such member it is split until every part has one. Until now
-- nothing read it. `photolib.membership` applies it after the walk and before
-- anything is stored, which is 011's own argument -- membership is a property of
-- the photographs and not of the view, so the grid reads the answer and no query
-- re-derives it.
--
-- **In the key for 011's reason**, the one `strictness`, `linkage` and `ceiling`
-- already carry: a change to it changes the assignment, so moving it adds a
-- population instead of overwriting one, the old rows stay readable as the old
-- rule's, and no query can compare a grouping made with people against one made
-- without. Ordered after `ceiling` and before the subject, as 013 put the cut
-- after the threshold: every setting sits between the method and the frame.
--
-- **The value is the identity of the persons the walk read**, `'<model>/<version>/
-- <threshold>/<cut>'` -- `face_person`'s whole key, because all four decide which
-- persons a frame has. Three of them would name three of the four things that
-- decided the answer, which is what #55's blocker on this ticket says and what 013
-- established when it put the cut in that key.
--
-- The rows already here were walked before the rule existed, so they are stamped
-- `'none'` -- `photolib.membership.NO_PEOPLE`, a real value of this column saying
-- *no people rule applied* rather than a stand-in for one. They are the population
-- the grid drew before this landed and they stay readable as themselves, which is
-- how the reader sees the difference rather than being told about it.
--
-- **What is deliberately not in the value.** The prominence floor and the reader's
-- stranger verdicts are read when the pass runs and are not named here: the floor
-- can be moved by re-reading `face.share`, and a verdict is the reader's answer
-- rather than a population -- one more of them is not a different clustering. What
-- that costs is a resume: the pass places a frame once per key, so a rule re-read
-- after an answer moved is a DELETE of this population and a re-run, which is what
-- the pass prints. Naming them here would instead make every answer a fifth
-- population of a table that would then never be re-read at all.
--
-- Rebuilt rather than altered because SQLite cannot grow a primary key in place --
-- 013's shape. `stack_member` is nobody's parent, so nothing else's foreign keys
-- are rewritten by the rename, and every row moved satisfies the same references to
-- `file` it already did.
ALTER TABLE main.stack_member RENAME TO stack_member_before_the_people;

CREATE TABLE main.stack_member (
  method     TEXT NOT NULL,          -- 'sift_ratio_homography'
  version    TEXT NOT NULL,          -- the match method version the walk read
  strictness INTEGER NOT NULL CHECK (strictness >= 0),  -- the threshold on the Match
  linkage    TEXT NOT NULL CHECK (linkage IN ('complete', 'majority', 'neighbour')),
  ceiling    INTEGER NOT NULL CHECK (ceiling > 0),      -- the window, in seconds
  people     TEXT NOT NULL,          -- the clustering the veto read, or 'none' for no veto
  sha256     TEXT NOT NULL REFERENCES file(sha256),
  stack      TEXT NOT NULL REFERENCES file(sha256),     -- the earliest member
  PRIMARY KEY (method, version, strictness, linkage, ceiling, people, sha256)
) WITHOUT ROWID;

INSERT INTO main.stack_member
  (method, version, strictness, linkage, ceiling, people, sha256, stack)
SELECT method, version, strictness, linkage, ceiling, 'none', sha256, stack
FROM main.stack_member_before_the_people;

DROP TABLE main.stack_member_before_the_people;
