-- state.sqlite3: human decisions, irreplaceable, written only by the app.
-- Keyed on sha256, never on photo.id -- photo.id is regenerable output and
-- re-grouping reassigns it.

CREATE TABLE state.triage_rule (
  id INTEGER PRIMARY KEY, seq INTEGER NOT NULL,
  predicate TEXT NOT NULL, decision TEXT NOT NULL,  -- exclude | include
  note TEXT, created_at TEXT NOT NULL
);

CREATE TABLE state.triage_override (
  sha256 TEXT PRIMARY KEY, decision TEXT NOT NULL, created_at TEXT NOT NULL
);
