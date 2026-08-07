# Junk review and bulk reject

**State in v1:** both built. Undo is not durable and the generic reject path bypasses the
safeguards. Live use held.

**Depends on:** [preprocessing.md](preprocessing.md), [library.md](library.md),
[stacks.md](stacks.md).

Two related screens: `/junk` suggests what might be worth rejecting and explains why;
`/bulk-reject` is the deliberate high-volume selection tool.

The rule that governs both: **junk results never reject, exclude, move, delete, or otherwise
modify media automatically.** Junk review is a suggestion with an explanation. A human decides,
and the decision is metadata.

## Junk review

### Signals

Independent confidence and evidence is persisted per signal: extreme blur; camera shake; focus
deficit; severe underexposure; severe overexposure; highlight clipping; near-black frames;
possible obstruction or accidental frame; screenshot or downloaded-graphic likelihood; tiny or
low-resolution files; corruption or incomplete decoding; exact duplicates; near duplicates with
a better alternative; test-chart or calibration likelihood; blank scans; severe compression
damage; thumbnail-rather-than-original likelihood.

Each signal stores confidence, method and version, evidence, the threshold used, and a
better-alternative entity where one applies.

### The semantic safeguards

These are deliberate honesty constraints and they are the most interesting design decision in
the feature:

- Floor, pocket, finger, and lens-cap claims are **combined** into
  `possible_obstruction_or_accidental_frame` rather than labelled individually, because no
  validated local classifier supports the narrower labels. The system does not claim to know
  something it cannot know.
- Missed focus is `focus deficit`, and high confidence is only assigned when a sharper related
  frame actually exists.
- Test-chart and downloaded-graphic evidence may use filenames, paths, and structural image
  evidence, but may **not** hide an item on its own under the default multi-signal profile.

### Profiles, explanations, feedback

- Junk confidence threshold, plus per-reason enable and disable.
- `Only hide when multiple signals agree`, with the agreement count stored.
- `Never classify favourites as junk`, applied when materializing effective results — the
  underlying signals stay visible.
- `Show me what would be hidden` preview before applying a profile.
- Explanations in plain language: *Hidden because blur confidence is 92% and a sharper frame
  exists in the same Stack.*
- False-positive and false-negative feedback stored as metadata.
- Background calibration may adjust versioned local weights and thresholds only after
  sufficient feedback; previous versions stay auditable and reversible.

## Bulk reject

A separate virtualized route with pointer brush and drag selection, keyboard range selection,
filters, stack expansion, undo, and metadata-only bulk updates.

Required safeguards:

- Warn before rejecting favourites or a large selection.
- Summarize exactly which entities will change.
- Preserve favourites unless the user explicitly confirms the conflicting update.
- Never translate rejection into a filesystem operation.

## Where the code is

| Concern | File |
|---|---|
| Signals, profiles, effective results, feedback, calibration | `v1/media_vault/review_junk.py` (35 KB) |
| Junk route | `v1/review_ui/src/routes/junk/+page.svelte` (203 lines) |
| Junk controls | `JunkProfileControls.svelte` (105) |
| Junk preview | `JunkPreview.svelte` (70) |
| Bulk reject route | `v1/review_ui/src/routes/bulk-reject/+page.svelte` (170 lines) |
| Bulk reject view | `BulkRejectView.svelte` (200) |
| Bulk reject API | `review_api.py` — `/api/v1/library/bulk-reject` and `/undo` |

## Data it owns

`junk_profiles`, `junk_signals`, `junk_effective_results`, `junk_feedback`.

Bulk reject writes `photo_user_state` and `photo_user_state_events` — see
[library.md](library.md).

Job kind: `junk_profile_materialize`. Analyzer versions: `junk-signals-v1`, `junk-profile-v1`,
`junk-calibration-v1`.

## HTTP surface

| Method | Path |
|---|---|
| GET | `/api/v1/junk/profiles` |
| GET | `/api/v1/junk/status` |
| GET | `/api/v1/junk/{profile_id}` |
| GET | `/api/v1/junk/{profile_id}/entities/{entity_id}` |
| POST | `/api/v1/junk/profiles` |
| POST | `/api/v1/junk/{profile_id}/feedback` |
| POST | `/api/v1/library/bulk-reject` |
| POST | `/api/v1/library/bulk-reject/undo` |

## Known defects

| ID | Sev | Summary |
|---|---|---|
| `F59` | Critical | Generic Library multi-reject bypasses the favourite and large-selection safeguards that this feature defines |
| `F58` | Critical | Bulk and profile confirmation Booleans can remain checked when the selection or profile changes |
| `F62` | High | Bulk undo survives only in component memory |
| `F60` | High | Selected entities can remain active but hidden after filters change |
| `F61` | High | Parent error handling can swallow a failed action while children clear selection or undo history |
| `F57` | High | Junk thresholds have synthetic tests but no labelled representative-corpus calibration |
| `F65` | High | Junk and bulk paging is forward-only |

## Reuse notes

Worth lifting — the semantic safeguards in particular are the best thinking in the project:

- Refusing to make claims the evidence cannot support. Collapsing lens-cap and pocket-shot into
  one honest label is the kind of decision that gets undone by the first person who wants nicer
  copy, and it should not be.
- Requiring a sharper related frame before high-confidence "missed focus".
- Filename evidence allowed but never sufficient alone.
- `Never classify favourites as junk` applied at materialization while leaving the signals
  visible — the user's judgment wins without hiding the machine's.
- `Show me what would be hidden` before applying. A preview before a bulk change should be the
  default everywhere.
- Per-signal confidence, method version, threshold, and evidence stored, so an explanation is
  reconstructable rather than generated.
- Feedback stored as metadata, calibration versioned and reversible.

Do not lift as-is:

- The reject plumbing. `F59` is the critical one: this feature carefully defines safeguards for
  bulk rejection and then the library screen has another path that skips them. One reject
  function, all callers through it.
- In-memory undo (`F62`).
- The thresholds (`F57`) — same as stacks, uncalibrated.
- Forward-only paging on a review queue (`F65`). You will want to go back.
