-- Who is in each frame: bodies for presence, faces for identity, and the
-- persons those faces cluster into.
--
-- `docs/adr/0003-stack-on-verified-match.md` decides a stack by a verified match
-- between two frames, and names the one failure geometry cannot fix: a set of
-- frames of the same place where the difference is *who is in them*. The Match
-- counts distinctive points agreeing under one transform and the fingerprint
-- describes roughly what a frame shows; neither has any notion of a person, so
-- neither can express the reader's own rule. These tables are what a rule about
-- people would have to read. Nothing reads them yet.
--
-- **The measurement is stored and the verdict is derived**, which is
-- 009_candidate_pair.sql's discipline turned the other way up. There it was the
-- one derived value that needed guarding; here there is none: every box records
-- its share of the frame and nothing records whether that share was enough. The
-- prominence floor is a read-time constant precisely so that choosing it later is
-- a query over these rows rather than another twenty-minute pass.
--
-- The model's identity is part of the key, for 008_fingerprint.sql's reason: a
-- change of model adds a population instead of overwriting one, and no query can
-- compare a vector from one model against a vector from another.
--
-- Keyed on sha256 and never on photo.id, also 008's reason: `archive.pipeline
-- .group` rebuilds `photo` and reassigns every id on each Apply to grid, and who
-- is in a photograph is a property of its bytes and not of a tile.

-- One row per frame the detector examined, whatever it found there.
--
-- The row exists so that "checked, and nobody is in it" stays distinguishable
-- from "never looked at" -- 009's `screened_out` distinction, and the same reason:
-- a pass whose absence of an answer and whose answer of *no* look alike cannot be
-- resumed, and cannot be believed either.
--
-- `bodies` counts what was found and `share` is the largest one's, because the
-- question these rows will be asked is *is somebody in this frame*, which the
-- largest body answers at whatever floor is chosen. Presence is read off bodies
-- rather than faces so that a person photographed from behind is still somebody:
-- the back of a head has no face and is not a landscape.
CREATE TABLE main.frame_body (
  model   TEXT NOT NULL,          -- the detector's identity, on every row it wrote
  version TEXT NOT NULL,          -- bumped when the weights or the preprocessing change
  sha256  TEXT NOT NULL REFERENCES file(sha256),
  bodies  INTEGER NOT NULL CHECK (bodies >= 0),        -- 0 is an answer, not a gap
  share   REAL NOT NULL CHECK (share >= 0.0),          -- the largest body's height
  faces   INTEGER NOT NULL CHECK (faces >= 0),         -- how many `face` rows it has
  PRIMARY KEY (model, version, sha256)
);

-- One row per detected face: where it was and what it looked like.
--
-- `idx` is the face's position in the detector's own output for that frame, which
-- is what makes a face nameable at all. Together with the sha256 it is the face's
-- name, and the pair is content-addressed for the reason above: a rebuild that
-- reassigns every tile id leaves both halves untouched.
--
-- `share` is the box's height as a fraction of the frame's, stored and never
-- applied. `vector` is the embedding, little-endian float32 and L2-normalised on
-- the way in so that the cosine a clustering wants is a dot product -- 008's
-- convention, kept deliberately, because a consumer that has to remember to
-- normalise is a consumer that will one day forget.
CREATE TABLE main.face (
  model   TEXT NOT NULL,
  version TEXT NOT NULL,
  sha256  TEXT NOT NULL REFERENCES file(sha256),
  idx     INTEGER NOT NULL CHECK (idx >= 0),
  share   REAL NOT NULL CHECK (share > 0.0),
  vector  BLOB NOT NULL,
  PRIMARY KEY (model, version, sha256, idx)
);

-- Which person each face belongs to, at one clustering threshold.
--
-- Apart from `face` rather than a column on them, because the two are answered by
-- different questions and resumed separately. A face's box and vector are what a
-- model saw and cost a forward pass to learn; a face's person is a reading of every
-- vector at once and costs a matrix multiply. Re-clustering at another threshold
-- must not re-run the detector, and that is only true if the vector is not keyed by
-- the threshold.
--
-- **The threshold is part of the key**, exactly as strictness and linkage are in
-- 011_stack_member.sql: moving it adds a population rather than overwriting one, so
-- the old assignment stays readable as the old threshold's and no query can compare
-- across two of them.
--
-- `person` is the name of the cluster and never a row id: the name of its least
-- face, `<sha256>:<idx>`. Content-addressed for 011's reason -- a person is a set of
-- faces' bytes and not a set of tiles -- and it is not a name in the human sense.
-- Naming a person is a later feature and no name is collected here.
--
-- WITHOUT ROWID for 009's reason: the row is all key but for the one column.
CREATE TABLE main.face_person (
  model     TEXT NOT NULL,
  version   TEXT NOT NULL,
  threshold REAL NOT NULL,        -- the cosine at or above which two faces are one person
  sha256    TEXT NOT NULL,
  idx       INTEGER NOT NULL,
  person    TEXT NOT NULL,        -- '<sha256>:<idx>' of the cluster's least face
  PRIMARY KEY (model, version, threshold, sha256, idx),
  FOREIGN KEY (model, version, sha256, idx) REFERENCES face(model, version, sha256, idx)
) WITHOUT ROWID;
