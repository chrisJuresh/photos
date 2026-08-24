-- The size cut joins `face_person`'s key: which faces were clustered, beside the
-- threshold they were clustered at.
--
-- `docs/adr/0004-people-veto-a-stack.md` records what the labels found and 012's
-- own comment anticipated: the clusters the reader flagged as several passers-by
-- separate from the ones they called a friend on *size* and not on similarity --
-- median box 0.018 against 0.137 -- so the knob that repairs them is a floor on
-- the box and not a tighter cosine. Clustering at 0.363 over only the faces whose
-- share reaches 0.02 takes 9 of the 69 flagged clusters out of the population and
-- splits 27 more, for 2 fragmented friends, where no threshold could buy 34
-- without breaking 16.
--
-- **A written population and not a read-time filter**, which is what makes this a
-- migration rather than a `WHERE`. `FLOOR` can be moved by re-reading rows because
-- nothing stored is derived from it; a cut cannot, because the clustering is the
-- thing it changes. Two faces merged because a third small one sat between them
-- stay merged whatever a later reader filters -- and complete linkage's merge order
-- depends on every cluster at once, so dropping one person's small faces can move
-- where another's joins are made. A cut is a different agglomeration and not a
-- subset of an old one.
--
-- **In the key for 011_stack_member.sql's reason**, the one `threshold` already
-- carries: moving it adds a population instead of overwriting one, so the old
-- assignment stays readable as the old cut's, and no query can compare an
-- assignment made over one population of faces against an assignment made over
-- another. Ordered after `threshold` and before the face, as `stack_member` puts
-- every setting between the method and the subject.
--
-- The rows already here were clustered before this column existed, over every face
-- there was, so they are stamped 0.0 -- no cut, which is `photolib.people.NO_CUT`
-- and a real value of this column rather than a stand-in for one. They are the
-- population every answer in `labels.sqlite3` was given about, and they stay
-- readable as such.
--
-- Rebuilt rather than altered because SQLite cannot grow a primary key in place.
-- `face_person` is nobody's parent, so nothing else's foreign keys are rewritten by
-- the rename, and every row moved satisfies the same reference to `face` it already
-- did.
ALTER TABLE main.face_person RENAME TO face_person_uncut;

CREATE TABLE main.face_person (
  model     TEXT NOT NULL,
  version   TEXT NOT NULL,
  threshold REAL NOT NULL,        -- the cosine at or above which two faces are one person
  cut       REAL NOT NULL CHECK (cut >= 0.0),  -- the least box share clustered, 0.0 for none
  sha256    TEXT NOT NULL,
  idx       INTEGER NOT NULL,
  person    TEXT NOT NULL,        -- '<sha256>:<idx>' of the cluster's least face
  PRIMARY KEY (model, version, threshold, cut, sha256, idx),
  FOREIGN KEY (model, version, sha256, idx) REFERENCES face(model, version, sha256, idx)
) WITHOUT ROWID;

INSERT INTO main.face_person (model, version, threshold, cut, sha256, idx, person)
SELECT model, version, threshold, 0.0, sha256, idx, person FROM main.face_person_uncut;

DROP TABLE main.face_person_uncut;
