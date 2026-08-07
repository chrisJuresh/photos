# Similarity stacks

**State in v1:** built. Never calibrated against a labelled corpus; live use held.

**Depends on:** [preprocessing.md](preprocessing.md),
[relationships.md](relationships.md), [library.md](library.md).

User-facing name: **Stacks**.

## What it does

Groups near-identical logical photos — burst frames, bracketed exposures, the same shot taken
five times — into one card with a chosen cover, so a grid of 200 photos of the same moment
reads as one entry you can expand.

Grouping is a display and ranking decision. Nothing is deleted, and rejecting the rest of a
stack is metadata like every other rejection.

### Inputs

Versioned pHash, dHash, colour distribution, aspect ratio, capture time, camera, filename,
RAW/JPEG evidence, and existing relationships from
[relationships.md](relationships.md). Candidate edges come from indexed and locality searches,
not all-pairs comparison.

An explicit design decision, recorded in the spec: **no heavyweight opaque embedding model.**
Transparent perceptual and event/burst evidence was chosen because it stays explainable and
operationally simple. A user can be told *why* two photos are stacked.

### Controls

| Control | Meaning |
|---|---|
| Stack Similarity | Loose event-level grouping through to nearly identical frames |
| Time Proximity | Allowed capture-time separation |
| RAW/JPEG Pairing Confidence | Exposed because pair confidence genuinely varies |
| Exposure Preference | Darker, neutral, or brighter |
| Sharpness Limit | Minimum acceptable sharpness for a cover candidate |
| Motion Preference | Freeze motion versus embrace intentional blur |
| Display direction | Ascending or descending |

Profile settings are normalized and their materialized memberships and order are cached. A new
combination enqueues work and **leaves the last ready profile visible until the replacement
completes** — you never get an empty screen while a profile rebuilds.

### Cover ranking

Rules, in order:

1. If any unedited candidate exists, no edited member may be cover.
2. When every member is edited, edited candidates may be ranked.
3. Then apply exposure preference, sharpness limit, motion preference, clipping, corruption,
   resolution, and deterministic tie-breakers.

Every cover carries a persisted explanation and the method version that produced it.

Cards show a layered edge, a member count, an expandable member strip, and an optional
metadata-only cover override.

## Where the code is

| Concern | File |
|---|---|
| Feature inputs, candidate edges, profiles, materialization, cover ranking | `v1/media_vault/review_stacks.py` (50 KB) |
| Controls | `v1/review_ui/src/lib/components/StackProfileControls.svelte` (100 lines) |
| Surfaced on | the library route, not a route of its own |

Line reference: `review_stacks.py:378` (derivative freshness check).

## Data it owns

`stacks`, `stack_members`, `stack_profiles`, `stack_candidate_edges`, `stack_feature_inputs`,
`stack_cover_events`.

Job kind: `stack_profile_materialize`. Analyzer versions: `stack-features-v1`,
`stack-profile-v1`.

## HTTP surface

| Method | Path |
|---|---|
| GET | `/api/v1/stacks/profiles` |
| GET | `/api/v1/stacks/status` |
| GET | `/api/v1/stacks/{profile_id}` |
| GET | `/api/v1/stacks/{profile_id}/{stack_id}` |
| POST | `/api/v1/stacks/profiles` |
| PUT | `/api/v1/stacks/{profile_id}/{stack_id}/cover` |
| POST | `/api/v1/stacks/{profile_id}/{stack_id}/reject-rest` |

`reject-rest` is the one mutation with real reach: it rejects every member except the cover. The
spec requires it to summarize affected members and remain undoable, and a stack-card reject must
act on the cover entity only.

## Known defects

| ID | Sev | Summary |
|---|---|---|
| `F58` | Critical | Profile confirmation Booleans can remain checked when the profile or stack changes |
| `F57` | High | Stack thresholds have synthetic tests but no labelled representative-corpus false-positive/false-negative calibration |
| `F54` | High | Analysis can accept derivative freshness on size and mtime rather than re-verifying the persisted checksum |
| `F62` | High | Stack `reject-rest` does not expose the same durable action ID for recovery that bulk reject does |
| `F74` | High | Large profile builds lack a bounded shadow-generation validation and atomic pointer swap |
| `F32` | Critical | Generations are not reliably invalidated when new assets or prepared outputs arrive |

## Reuse notes

Worth lifting conceptually:

- Explainable over accurate-but-opaque. The choice to skip embeddings means every stack can
  justify itself, and for an archive you intend to keep for decades that is worth more than a
  few percent of grouping quality.
- The unedited-beats-edited cover rule. It is a strong, simple, correct default: if you still
  have the original, show the original.
- Persisting a cover explanation and method version alongside the cover.
- Keeping the last ready profile visible while a new one builds. Small detail, big difference in
  whether the feature feels usable.
- Profiles as normalized named settings rather than ad-hoc slider positions, so a grouping is
  reproducible.

Do not lift as-is:

- The thresholds themselves. `F57` says plainly that no calibration evidence exists. The
  numbers in `v1` are guesses that passed synthetic tests; treat them as a starting point to
  re-derive against real photos, not as tuned values.
- `reject-rest` without a durable action ID (`F62`). This is the single highest-reach mutation
  in the application and its undo is weaker than bulk reject's.
- The freshness check (`F54`).

Stacks depend on preprocessing quality features and nothing depends on stacks except junk
review, so this is deferrable — but the quality features it needs
([preprocessing.md](preprocessing.md)) are not, and they are the expensive part.
