-- A visual fingerprint per tile: the cheap screen the match pass runs first.
--
-- `docs/adr/0003-stack-on-verified-match.md` puts an embedding in front of the
-- geometric check, to reject the overwhelming majority of candidate pairs before
-- anything expensive looks at them. This is where that embedding is kept.
--
-- The model's identity is part of the key rather than a column beside it. A
-- change of model then adds a population instead of overwriting one: the old
-- rows stay readable as the old model's, a pass at the new model finds none of
-- its own rows and embeds everything, and no query can accidentally compare a
-- vector from one model against a vector from another.
--
-- Keyed on sha256, like everything else derived from a file and never on
-- photo.id: `archive.pipeline.group` rebuilds `photo` and reassigns every id,
-- and a vector describes bytes rather than a tile.
CREATE TABLE main.fingerprint (
  model   TEXT NOT NULL,          -- 'dinov2_vits14'
  version TEXT NOT NULL,          -- bumped when the weights or the preprocessing change
  sha256  TEXT NOT NULL REFERENCES file(sha256),
  vector  BLOB NOT NULL,          -- little-endian float32, L2-normalised
  PRIMARY KEY (model, version, sha256)
);
