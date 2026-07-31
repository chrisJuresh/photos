# Safety contract

**State in v1:** stated as rules, enforced unevenly. Most of the 19 critical findings are
places where an invariant was a convention rather than a checked boundary.

The original wording is `v1/AGENTS.md`. This file adds what each rule is protecting against
and where `v1` failed to hold it.

## The rules

### 1. Source media and canonical objects are permanently immutable

No operation modifies, moves, renames, overwrites, or deletes them. Publishing a new
canonical object is the only write to the objects tree.

Where `v1` did not hold it:

- Hard-link publication could crash after the final name existed but before the writable
  `.partial` alias was removed, leaving two names pointing at one mutable inode
  (`F06`, critical — `vault_ops.py:412`, `review_copy.py:1439`).
- Append-only intent was never reinforced with a tested OS-level read-only or immutable
  permission contract (`F07`).
- Conflict preservation used a rename whose overwrite semantics differ per platform, which
  weakens "never overwrite evidence" (`F16`).

### 2. Reads of the immutable source must not disturb it

Reading a source file must not change its access time or any other protected metadata.

Where `v1` did not hold it:

- Legacy `analyze` and `validate` could fall back to reading source files without applying
  the access-time guard (`F08`, critical).
- The guard is Windows-specific; elsewhere it is informational rather than enforced (`F09`).
- The embedded review-UI worker cannot carry the hidden access-time acknowledgement, so the
  advertised live import path blocks — and propagating the waiver would itself break the
  protected-metadata invariant (`F10`, critical).

There is a hidden override for the source access-time policy. Do not carry it forward as a
way to make a protected root readable.

### 3. User decisions are metadata, never file operations

Reject, favourite, rate, exclude, stack membership, cover selection, and junk feedback write
rows. They never delete, move, or rewrite a photo. Rejection is a label, not a deletion.

This one `v1` held at the storage layer. The failures were in the interface: a generic
Library multi-reject could affect hundreds of entities without routing through the
favourite and large-selection safeguards (`F59`, critical).

### 4. Exact byte identity is not visual similarity

Automatic consolidation requires matching size and all three full-file hashes, plus a byte
comparison whenever a trusted representative exists. Perceptual distance, decoded-pixel
equality, RAW/JPEG companionship, and stack similarity never authorise consolidation or
deletion. A suspected multi-hash collision is preserved as distinct evidence.

`v1` held this. It is recorded as a positive control (`P05`).

### 5. No media work inside an HTTP request

Handlers may query persisted data, serve an existing derivative, update metadata, or enqueue
a job. Decoding, hashing, copying, ranking, and grouping happen in background processes.

`v1` largely held this (`P04`). The leak was that some GET and query flows enqueue
materialization jobs, so a nominally safe read mutates state (`F46`).

### 6. Derivatives are separate and regenerable; originals are neither

Previews, extended metadata, features, rollups, and map clusters live outside the objects
tree and can be rebuilt. `config.py:99` enforces that the derivative root is disjoint from
canonical objects and from the inbox.

Recorded as a positive control (`P07`). The related defect is that derivative freshness was
sometimes accepted on size and mtime instead of re-verifying the persisted checksum
(`F54`).

### 7. One writer at a time; maintenance requires quiescence

Schema migration and other exclusive maintenance must refuse to run while any writer is
active.

Where `v1` did not hold it — this is the single largest cluster of critical findings:

- `VaultRunLock` creates an empty exclusive file and writes ownership afterwards, so a
  contender can see an incomplete record, remove it, and admit a second writer
  (`F01`, critical — `core.py:342`).
- Stale-owner logic records a hostname but checks PID liveness on the current host, so shared
  storage can clear a foreign host's live lock (`F02`, critical).
- Review API mutations open writable SQLite transactions without joining the CLI writer lock
  at all (`F03`, critical — `review_api.py:478`).
- Migration cannot prove that API and worker writers are quiescent (`F04`, critical).

### 8. Every path must be proved to live under its authority root

A path derived from the database, a request, or a filesystem walk is not trusted until it is
proved to be inside the root that owns it, with symlink and reparse points resolved.

Where `v1` did not hold it:

- Legacy import trusted a database-derived `object_relpath` without a mandatory containment
  proof below canonical `objects` (`F05`, critical — `vault_ops.py:364`).
- Derivative, preview, legacy cache, and OS-open boundaries do not share one reparse-aware
  realpath authority (`F13`).
- Source and inbox identity is checked in several steps rather than through one no-follow
  handle revalidated before authoritative association (`F11`).
- Windows root identity can fragment by case, spelling, alias, or mount representation while
  preserving different IDs and totals (`F12`).

### 9. Two applications, two ports, one direction of trust

The review application (`8766`) is separate from the read-only dashboard (`8765`). The
dashboard opens SQLite read-only and query-only and exposes no mutation endpoints. Both bind
to localhost only.

`v1` held the separation (`P01`, `P02`). The gap is that the dashboard lacks TrustedHost and
hostname validation, so DNS rebinding can disclose paths, metadata, and location evidence
(`F48`).

### 10. Tests use synthetic corpora and capture nothing

Test corpora are isolated temporary trees outside the real source and vault. Playwright
screenshot, video, and trace capture stay off. Never take, save, or inspect a screenshot of
real photos.

`v1` held this (`P09`, `P10`).

## Reuse notes

The contract itself is the most valuable artefact in `v1` and worth carrying forward
verbatim. What is not worth carrying forward is the way it was enforced: scattered per-caller
checks with no single chokepoint.

The review's own conclusion (`v1/docs/IMPLEMENTATION_HANDOFF.md`) was that these rules need
four executable primitives rather than documentation plus discipline:

1. one writer and maintenance barrier;
2. one typed path and storage authority;
3. one proven canonical no-replace publication primitive;
4. one durable job, lease, and recovery engine.

That is a description of what the review concluded, recorded here so the reasoning is not
lost. It is not a commitment to build it that way.
