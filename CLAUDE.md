# photos

A local-first photo and video vault. **The rebuild is complete.** What is left at the
repository root is the thing that runs: the grid and triage website, and the schema it reads.

- `photolib/` is the website — `grid`, `browse`, `triage_api`, `triage_screens`, `triage`,
  `probe`, `substrates`, and the `config`/`db`/`migrate` infrastructure under them. `ui/` is
  its Svelte source.
- `archive/pipeline/` is the one-shot build pipeline that produced the vault: 16 modules that
  ran to completion between 2026-08-01 and 2026-08-07. It is still importable and still
  tested, but nothing it holds is needed to serve the website. It imports `config`, `db`,
  `migrate`, `triage` and `reveal` from `photolib`; the arrow never points the other way.
- `archive/v1/` is the previous implementation, kept as **read-only reference**. Read it
  freely; do not edit it, refactor it, or fix its bugs.
- `harness/` is the labelling harness and the reports over it — **a standing tool, not
  scaffolding**. It was written to settle the strictness threshold once and it stays, because
  recalibrating the grid against the reader's taste turned out to be a recurring need. Same
  one-way arrow as `archive/pipeline/`: it reads `photolib`, `photolib` never reads it.
- **`Open Photo Vault.cmd`** at the root is the double-click launcher for the website.

## Hard rules

1. **Never run `archive/v1/` code against `G:\photos`, `G:\MediaVault`, or
   `G:\MediaVaultImports`.** It is under a safety hold with 19 release-critical findings. Use
   synthetic temporary corpora. `archive/v1/Resume Live Vault Backfill.cmd` is quarantined —
   never invoke it.
2. **Source media and published canonical objects are permanently immutable.** Nothing
   deletes, moves, renames, or overwrites them.
3. **Reject, favourite, rate, exclude, stack, and junk are metadata only.** They never become
   destructive file operations.
4. **No media work inside an HTTP request.** Handlers may query persisted state, serve
   existing derivatives, update metadata, or enqueue a job. Decoding, hashing, copying,
   ranking, and grouping belong in background processes.
5. **No media, database, or vault state in git.** Never commit photos, videos, `*.sqlite3`,
   derivatives, or run logs. Never take or commit screenshots of real photos.
6. **Schema migration and other exclusive maintenance must refuse to run while any writer is
   active.** Test migrations on a copied database first.

`archive/v1-docs/invariants.md` explains why each of these exists and what broke in `archive/v1/`
when it was only a convention rather than an enforced boundary.

**Nothing else may touch `G:` while a pipeline step runs**, Explorer windows included. `F:` is
the same physical disk — both are partitions of the WD Elements USB HDD.

## Scope discipline

This project failed once by building everything at once. Keep changes small enough to review.

- Build only what the current request asks for. Do not add features, refactor surrounding
  code, or introduce abstractions the task does not need.
- Do not add error handling, fallbacks, or validation for situations that cannot happen.
  Validate at system boundaries: user input, filesystem, subprocess, HTTP.
- Do not design for hypothetical future requirements. Prefer the simplest thing that works.
- Do not lift an `archive/v1/` module wholesale because it exists. Check
  `archive/v1-docs/known-defects.md` for that feature first — several `archive/v1/` modules are
  correct in shape and unsafe in detail.
- One safety invariant per commit where possible.

Match written deliverables to the task. A bug fix does not need a summary document.

There is **no procedure yet for adding photos after the build**, and **no backup of `G:\vault`
at all** — `archive/PLAN.md` "Open decisions" 5. Both are deferred on purpose. Do not invent a
procedure in passing, and do not treat the gap as a reason to redesign anything.

## Running and verifying

The root build is a plain Python package with no venv. Its dependencies are `pytest`, `pillow`
and `numpy`, plus `rawpy` for Phase 2b's DNG path, `torch` for the fingerprint pass and
`opencv-python` for the match pass; `ffmpeg` and `exiftool` are external binaries reached
through PATH, and only Phase 2b needs them. Tests that need a binary skip when it is absent
rather than failing, and no test loads `torch` or a model at all — the encoder is a seam the
suite passes a stand-in through. OpenCV is the exception and is exercised for real: the Match
is a number about pictures, so `tests/test_matches.py` asserts it over pictures it draws.
Tests run against temporary databases only; none of them opens a path from `config.toml`.

```bash
python -m pytest tests -q
```

The full suite takes about three minutes, which is longer than a tool call's console lives.
When that console is torn down Windows sends Ctrl-C to everything attached to it, and pytest
dies around the two-minute mark with a `KeyboardInterrupt` — read variously as a refusal, a
hung task and a test failure, and every reading costs a re-run from the top. **An agent runs
the full suite through the script below**, which starts it on a console of its own and returns
at once; wait for `pytest.done`, which holds the exit code, and read `pytest.out` for the
report. Both live in a directory of this checkout's own under `%TEMP%` — the script prints
the two paths when it starts, and those are the ones to read, because a second worktree
running the suite at the same time has its own. A single test file is short enough to run
directly.
`Start-Process -RedirectStandardOutput` is not a workaround: redirecting makes the child
inherit the caller's console, which is the thing being escaped.

```bash
powershell -NoProfile -File scripts\run-tests.ps1
```

**A running `python -m photolib.grid` may be stopped to get a clean run**, and restarted
afterwards — the website is a read-only server over regenerable state, so nothing is lost by
killing it. Check what a `python.exe` actually is before stopping it: the launcher and the
suite look alike in a process list, and only the launcher is safe to kill.

The grid and the nine triage screens are one client, two modes, served by one process on
`127.0.0.1:8770`. Read-only except `/api/triage/*`, whose write handlers hold a connection to
`state.sqlite3` with no `ATTACH` of the catalog.

```bash
python -m photolib.grid --open
```

**A stack is the same photograph taken more than once** — what a bracketed set or a burst
becomes in the grid, drawn as one tile and fanned out over the sheet when it is clicked.
Membership is **read from `stack_member`** and never computed per query: `stack=on` is a
mode and not a window, so narrowing the filters removes frames from a stack and never
splits one, while the cover is still resolved per query because which members are present
is a property of the view. Nothing is drawn stacked until
`python -m photolib.membership` has run. The Stacks panel's two knobs — **strictness** and
**linkage** — pick *which* stored assignment to read, and offer only the settings a pass has
written, so a knob is a choice between populations rather than a threshold dialled live;
the window is not among them, being the fence the Match rows were computed behind.
Two populations exist: **strictness 10 with *the chain*, which is the default**, and
strictness 20 with *matches most members*, which was the default until 2026-08-21 and is
kept so that the change is something the reader can see rather than be told about.
Moving one regroups, which empties the selected set, so the panel says so before it happens
rather than after. It is grid-only: `/api/triage/*` is untouched and
a triage screen never collapses anything. **Every grid tile opens that overlay**, stack or
not and with stacking off as well: a tile with no siblings is drawn as the one frame it
stands for, and revealing in Explorer is the second press, on the frame. Triage is the
exception and still reveals on the first. **A reveal opens every file of the tile**, not
only the representative: 13,840 of the 24,518 tiles are a RAW beside a JPEG, and the
build rule picks the JPEG in all but 140 of them, so the RAW was the half a click could
not reach. Explorer's `/select,` takes one path per invocation and there is no command
line for a tab, so a pair is two windows; every member resolves before any of them
spawns, so a refused path opens nothing rather than half a pair. Triage reveals one path
still, its subject being a path rather than a group. **The cover is the frame that moves**: it flies
out of the tile's own rect into its place among the frames and back into it on the way out,
which is how a reader who clicked one picture finds it again in a sheet of fifty — the cover
is the first frame of its stack only about a quarter of the time. The others arrive where
they belong, and `prefers-reduced-motion` leaves the pane's fade as the whole of it. The
overlay draws its frames from the 1536px substrate tree on the NVMe, served by
`/d/<sha256>.webp` and filled by `python -m photolib.substrates` below. `docs/adr/0003-stack-on-verified-match.md` records
why membership is a verified pairwise match with the clock kept only as a fence, `0001` why
it is neither the clock alone nor the perceptual hash that exists for apparently this exact
purpose, and `docs/grid-queries.md` what each stacked query costs.

The client's source is `ui/` — Svelte 5, no Kit. `npm run build` emits
`photolib/static/bundle.js` and `bundle.css` under fixed unhashed names, and **those two files
are committed**: they are the only generated code in this repository, and they are here so the
server runs from a clean checkout without a node toolchain. Edit `ui/src`, never the bundle, and
rebuild before committing. **No literal `style="…"` in a `.svelte` file** — the CSP carries no
`unsafe-inline`, and Svelte compiles a static style attribute to `setAttribute`, which is
blocked; `style:` directives and classes are not.

```bash
cd ui && npm run check && npm run build
```

To apply pending migrations to the configured databases:

```bash
python -m photolib.migrate
```

To fill `substrate_root` — the 1536px tier a stack's overlay draws from, adopted from
`G:\MediaVault\derivatives` and `G:\vault\deriv` onto the NVMe. Checksum-verified where the
manifest records a checksum, resumable, and idempotent, so a re-run of a complete pass places
nothing. It reads `G:`: run it in the background and leave the drive alone while it does.

```bash
python -m photolib.substrates
```

To give every published tile a **fingerprint** — the vector
`docs/adr/0003-stack-on-verified-match.md` screens candidate pairs with before anything
expensive looks at them, computed by DINOv2 ViT-S/14. Nothing reads these vectors yet and no tile looks different after a
pass. It reads the substrate tree and the catalog, both on the NVMe, and never opens `G:`, so
it cannot collide with anything reading the vault. Resumable, idempotent, and it names the
tiles whose substrate is missing rather than letting them become tiles with no vector. The
~85 MB of weights are fetched once by `torch.hub` and cached; `torch` is a dependency of this
pass alone. Measured: 24,283 tiles in 3m33s on an RTX 3080 Ti, decode-bound.

```bash
python -m photolib.fingerprints
```

To enumerate the **candidate pairs** — every pair of frames that could be one stack — and give
each one the cheap **screen** ADR 0003 puts in front of the geometric check. A candidate is a
pair inside one run of consecutive same-camera captures whose every gap is at or below the
3600s ceiling, over the EXIF-dated population `photolib/browse.py` already stacks the grid
over; complete linkage is why it is every pair of a run and not only the adjacent ones. The
ceiling is a build-time commitment, because it decides how many candidates exist at all:
3,634,381 at 3600s against 2,193,828 at 900s and 307,750 at 60s, and `--counts` prints that
table without writing anything. The screen is the cosine of the two fingerprints, **stored per
candidate rather than reduced to a yes-or-no**, because the fingerprint's own threshold is what
ADR 0003 leaves unsettled and a number chosen later must be a re-read of these rows rather than
another pass — it is not the reader's *strictness*, which is a threshold on the Match. A
screened-out candidate is recorded as one, so that "never plausibly the same picture" stays
distinguishable from "checked properly and disagreed"; that verdict is the one derived value in
the table, and moving the screen constant is refused rather than silently answered at the old
threshold. It reads the catalog on the NVMe and nothing else — not the substrates, not `G:`,
and not `state.sqlite3`, which is not even attached. Resumable, idempotent, and it refuses
while a writer holds the catalog.
Measured: 3,632,211 pairs in 1m21s, of which 566,522 survive the screen at 0.40, and the
table it wrote grew the catalog from 1,757 MB to 2,517 MB.

```bash
python -m photolib.candidates
```

To give every candidate the screen let through a **Match** — the count of distinctive points
the two frames agree on under a single transform, which is the number the whole of ADR 0003
rests on. The seam is `match(frame_a, frame_b)`, taking two images rather than two sha256s,
so what the number means is asserted over pictures `tests/test_matches.py` draws: a copy at a
different exposure and a copy nudged a few pixels both keep it high, two unrelated textures
drop it to nothing. SIFT from the installed OpenCV, capped at 800 points a frame, matched
with Lowe's ratio and fitted by RANSAC to a homography — a homography because a handheld
reposition is very nearly a rotation about the camera's own centre, and a transform that
explains more explains unrelated frames too. Its named failure is a bracket end blown out
past having any texture left: no keypoints, so a Match of zero, which ADR 0003 accepts as one
true stack drawn as two. **The count is stored and no verdict is derived from it**, because
*strictness* is the reader's threshold on the Match and ADR 0003 leaves its value for the
labelling harness — a pair with no row was not checked, not checked and found wanting.
Frames are read from the substrate tree at 1024px on the long edge, and fan-outs are walked
in capture order so a frame is described once rather than once per pair. It reads the
substrates and the catalog, both on the NVMe, never opens `G:`, and does not attach
`state.sqlite3`. Resumable, idempotent, and it refuses while a writer holds the catalog.
Measured: 566,522 pairs over 22,580 frames at 287/s — 32m47s for the 564,323 left after a
trial run — and the table it wrote grew the catalog from 2,517 MB to 2,631 MB. Nothing was
missing and nothing failed to decode. The Match separates the two populations it was built
to: pairs a second or less apart score a median of 283 and 94% of them reach 20 or more,
against a median of 5 beyond two minutes.

```bash
python -m photolib.matches
```

To judge those Matches — the **labelling harness**, which is where strictness was settled and
where it is settled again whenever the grid stops matching the reader's taste. It shows one
candidate stack at a time with the frame before and after it, which is what
lets one screen answer both of the reader's complaints: *does this stack hold something that
does not belong*, and *is it missing something that should be here*. Space accepts the stack
as drawn, clicking a member says it does not belong, clicking a neighbour says it should have
been included — each click is recorded as it is made — and `u` records **not sure**, which is
an answer rather than a skip; dragging across several frames marks them together and records
once. **`p`, `m` and `c` say why a frame does not belong** — different people, a different
moment, just not close enough — and the answer stores that **per frame**, so a set split for
two reasons reads as such and the reader's instinct that people are the problem becomes a
count. A press answers for the frames pushed out that have no reason yet, so a drag of three
and one press covers all three; missing the key blocks nothing, and an answer given before the
column existed reads as *reasons unknown* rather than as none given. Nothing reads the column
yet: the ticket that prices the people rule does, and `harness.calibrate` ignores it.
The keys are vim's — `h`/`l` between sets, `k`/`j` for how much of the run is on screen.
`k` widens the view when the answer turns on what is past the edge, **with no ceiling** — one
frame each side is enough for 46% of candidate stacks but only 27% of the least decisive ones,
and every ceiling picked for it so far has been hit, so the whole run rides with the set.
`g` shows the whole run and `0`
comes back. The frames shrink to a floor and then the box scrolls, rather than the view
stopping. **The frame past each end of the run is drawn too**, dotted and always — the fence
rules it out of the stack, so it is there as the reader's check that the run ended because the
shooting ended and that the clock is telling the truth; a frame 23 hours away that is plainly
the same photograph is a wrong timestamp, and nothing else on the screen could show that. **What an
answer says is bounded by what was on screen for it**, which is stored per answer and is the
column ticket 34 has to read — `accept` means the frames the reader was shown are right, never
that the stack is complete. Answers go to a `labels.sqlite3` of its own beside the catalog,
**never `state.sqlite3`**, and it is not a migrated database because a table nothing shipped
reads has no business in the shipped schema. Frames come from the substrate tree.

**A round is one sitting bounded by the reader stopping**, and `--round` says which one it is —
3 by default, `--strictness` and `--linkage` still saying what the sets are drawn at. **Nothing
is generated before the reader asks for it**: the first set arrives with the page, each one
after it is a query over numbers already in the catalog, and eight sets is a round exactly as
two hundred is. Rounds one and two drew thirty each from wherever the Match was least decisive
around the setting — round one on the margin, round two on **the chain**, which is how many
frames single linkage would drag across a boundary the settled rule drew and is what priced
neighbour linkage out. Neither sampler could ask whether the line is in the right place at all,
so round three draws from **three bands** instead: pairs a looser dial would newly merge
(5–19, 40% of the draw), pairs the shipped setting already merges (20–40, 40% — without them a
round can only find missing merges and would flatter every loosening), and pairs no strictness
reaches (under 5 or no Match row, 20% — the evidence for what the answer is if the dial is not).
**Those boundaries are cut around strictness 20, which is where the grid stood when round
three was drawn and is no longer where it stands** — the setting shipped now is 10, so the
middle band is only partly "already merges" and the sampler still draws at 20. It stays that
way on purpose: re-pointing it means re-deriving the three bands, which is a round-four
question and not a constant to nudge. `harness/label.py`'s `STRICTNESS` says the same thing
where a reader would edit it.
A set is banded by the least decisive pair its drawing turns on and never by its strongest, and
above 40 is decisive and not drawn at all. The bands are **mixed rather than served in blocks**,
because a round abandoned halfway through would otherwise be a round of one band; a band that
runs out is said so on the console and never on the page, since telling the reader which band a
set came from is telling them what to say about it. Sets are still dealt across the cameras and
in the same deterministic order, **a run an earlier round answered about is not asked about
again** — by run and not by set, so a stack redrawn a frame wider is not a fresh question — and
the counter counts the answers given this round. Every earlier round's answers carry over with
nothing re-labelled.

```bash
python -m harness.label --open
```

**The same page has a second mode, and it asks about people rather than stacks.** ADR 0004's
nesting rule applied to every face a detector finds is destructive — a tourist wandering
through frames three and four of a nine-frame burst breaks it into three — so the guard is the
reader saying which persons they actually photographed. The obvious guard was a prominence
floor, and the reader asked for it to be measured against their own judgement rather than
picked: *a stranger versus a person I wanted to photograph*, which is a judgement about intent
that no detector can see. So the verdict is the primary evidence and the floor is demoted to
whatever `harness.floor` below says it is worth.

One person at a time, drawn as a **montage of the frames their faces were found in** — not
face crops, because `migrations/012_people.sql` stores a face's share of the frame's height and
its embedding and **no box**, so there is nothing stored to crop from; each frame is captioned
with which face of it this is and how tall, which is what tells a guest at a party from a
stranger in the background of the same party. `f` is somebody photographed, `s` is a stranger,
`u` is **not sure** — a cluster that could not be made out, an answer rather than a skip — and
`2` says the cluster is **obviously two different people**, which is a report about the
clustering rather than about a person: it feeds neither the floor nor the rule and exists so a
clustering failure is visible. `h`/`l` move between people and `k`/`j`/`g`/`0` say how much of
the montage is on screen, the stack mode's own vocabulary. The answer *is* the keystroke, so it
records and moves on; `h` is how a misclick is revised.

**The list is ordered by how much the answer would change**, which is what makes stopping early
the expected behaviour rather than a loss: for each person, the number of stacks they appear in
*some* frames of and not others. A person in every frame of every stack they touch scores zero
and is never asked about at all — whichever way the reader answers, every frame gains or loses
them together — and the highest scorer is the person whose verdict splits the most stacks. It
is a pure function over two mappings, so the order is an assertion rather than a browsing
session, and the counter says how many are judged and how many are left that would change
anything. With two thousand persons at the default threshold, *once per person* has to mean
once per person **worth asking about**.

**An unjudged person is a friend**, and that is what makes stopping safe: the grid at zero
answers is the grid the people rule produces on its own, so every answer moves it from there
rather than repairing it. The default lives in `harness.people.counts` and deliberately not in
the table — a row saying friend is the reader's answer and no row is nobody's, and a table that
could not tell them apart would report silence as a judgement. Verdicts go to the same
`labels.sqlite3` in a `person_verdict` table of their own, **keyed on the person and the
clustering** — `stack_member`'s discipline one layer up, because a person is named by its least
face and re-clustering at another threshold can hand the same name to a different set of faces.
The splits are counted at `browse.STACK_SETTING` and not at a knob, so a verdict is priced
against the grid the reader is actually looking at.

To price the **prominence floor** from those answers — the other thing ADR 0004 left open, and
the one it expects to lose. It prints, separately for the friends and the strangers, the
distribution of their box shares and the overlap between them; whether **any** floor separates
them at all; every candidate floor's error counts, kept apart because they are different
failures — a friend left out shrinks a frame's people and can only **merge**, a stranger let in
can only **split** — and **the persons each floor gets wrong**, so a bad value is diagnosable
rather than merely scored. Where nothing separates them it says so plainly and recommends
keeping the floor where it stands as a cheap pre-filter, which is the outcome this report was
designed to survive: prominence is a proxy for what the reader was asked, and a proxy that does
not work is abandoned rather than tuned. The stack-change column is **how many stacks hold a
frame whose people set differs** from the standing floor's, not how many stacks would split —
the nesting rule is not implemented, so that is the tightest honest measure there is, and it is
priced from `photolib.people.FLOOR` where the floor actually stands. There are no arguments and
the sweep is not a knob. It reads the catalog and `labels.sqlite3`, both on the NVMe, holds
both connections read-only, opens no substrate and never touches `G:`, so it writes nothing at
all.

```bash
python -m harness.floor
```

Its output is ADR 0004's "What the answers settled", and it lost as expected: over the reader's
202 answers of 2026-08-23 — 83 strangers, 50 friends, 69 clusters called two people — **no floor
separates the two populations.** The medians are a factor of nine apart (friends 0.137 of the
frame's height over 1,584 boxes, strangers 0.015 over 471) and the tails cross anyway, so 0.10
stays where it is and stays a pre-filter: it disposes of 76 of the 83 strangers without being
asked, and the 7 that carry a box above it are what the verdict is for. Moving it is worse in
both directions, which the ADR shows. The third of the queue the reader flagged as more than one
person is [#71](https://github.com/chrisJuresh/photos/issues/71) and not a floor problem.

To price a **tighter clustering** against those same answers — the third of the reader's
sitting that came back flagged `two-people`, which is the count that fourth answer was put
there to produce. **It is the measurement and never the pass**: every row is a clustering of
the stored vectors by `photolib.people.cluster` itself, so what is priced is what a pass would
write, and both connections are read-only — `harness.floor`'s posture kept whole.
**The sweep runs upwards**, because `face_person`'s threshold is the cosine at or above which
two faces are one person and a *lower* value merges more; the standing row is first and the
report says whether it reproduces the stored assignment, which is its own check that it is
pricing the clustering the pass performs. **Two counts, apart and never totalled**, for the
floor report's reason: a flagged cluster coming apart is the failure being fixed, and a
judged friend coming apart is the reader's own answer being contradicted — one individual
reading as two persons is a frame's people set that no longer nests, which is a stack split
wrongly. So a threshold is worth moving to only when it buys more of the first than the
second, and where none does the recommendation is to change nothing. **It is scored twice** —
over every judged cluster, which is the population the reader was shown, and over the ones
carrying a box that reaches `FLOOR`, which is the population the nesting rule reads, because
a person whose every box is under the floor is in no frame's people and no clustering of them
moves a stack. The last table answers the other question ticket 71 asked with numbers rather
than a change: a **size cut** on the stored share, clustered at the standing threshold. There
are no arguments and neither sweep is a knob. It reads the catalog and `labels.sqlite3`, both
on the NVMe, opens no substrate, never touches `G:` and writes nothing; it is a minute or two
of CPU and no disk to speak of.

```bash
python -m harness.recluster
```

Its output is ADR 0004's "What the sweep settled", and the knob lost: **no threshold takes
more flagged clusters apart than it breaks friends the reader has answered.** 0.450 splits 64
of the 69 and fragments 36 of the 50; 0.400 splits 34 and fragments 16. So **0.363 stands and
no new population was written**, and the 202 answers are intact. Two things came out of it
that were not a clustering problem at all. Only **16 of the 69** flagged clusters carry a box
reaching 0.10, so their 288 stack-touches are **27** the rule can feel — and of the 1,731
persons the harness would ask about, **279** have a box that reaches the floor, because
`harness.people.splits` counts over every face and applies the floor nowhere. That is
[#73](https://github.com/chrisJuresh/photos/issues/73). And a size cut of **0.02** drops no
box of any answered friend while taking 9 flagged clusters out of the population and splitting
27 more — 36 of the 69 for 2 fragmented friends, which is the exchange the threshold could not
offer, and is [#74](https://github.com/chrisJuresh/photos/issues/74). Those 2 keep every box
they had: a cut is a different agglomeration and not only a filter, because complete linkage's
merge order depends on every cluster at once, so the table's two friend columns can disagree.

To turn those answers into the two numbers the grid inherits — the **calibration report**.
It replays every label against a sweep of strictness values and all three linkage rules,
and says how well each setting reproduces what the reader actually said. **Precision and
recall are reported apart and never blended**, because they are not equally important: the
binding constraint is precision — *never open a stack and see two unrelated photographs* —
and recall is best-effort under it, so precision is a floor a setting clears before its
recall counts rather than a ranking. Ordering on precision alone returns the corner of the
sweep, where a setting stacks almost nothing and is therefore almost never wrong.
**Every comparison is scoped to the frames that were on screen when the answer was
given** — the `surrounding` column — because a label says *the frames I was shown are
right* and never *this stack is complete*; a strictness that pulls in a frame the reader
never saw is not contradicting them, and scoring it would measure the width of the
harness's window. The frame past the end of the run is separated out for the same reason
in reverse: no strictness reaches it, so what the reader said about it is evidence about
the 3600s fence. Confident labels are scored apart from the not-sure ones, and every
setting **names the labelled cases it gets wrong** rather than only counting them.

**The floor is 85% and it used to be 95%**, a named constant carrying its reasoning so that
moving it again is a decision rather than an edit: the reader browsed the 95% result,
reported seeing no wrongly stacked photographs at all *and* that the pre-stacking grouping
was better, which says the floor was above the evidence and the recall it cost is the whole
complaint. **A rate is not the whole of a mistake**, so every setting also reports the most
wrongly stacked pairs in any single case, and among the settings within a hair of the best
recall — one point, `HAIR`, because two thresholds never tie exactly and a tie-break waiting
for one never fires — the one whose errors *scatter* wins. **Both counting conventions are
printed and neither is chosen**: once per answer, which is the weight a calibration wants,
and once per pair globally, which is what a share of a population needs.

**The rounds are scored apart and never pooled, and the newest one chooses.** That is the
inversion of the rule this ran under before and it is deliberate: rounds one and two were
answered under the 95% floor and a stricter question, so they check the pick rather than
make it. **A quarter of the newest round is held back** from the choice as well — partitioned
by a stable hash of each answer's own key, never a draw, so re-running cannot re-roll the
slice until it agrees — and the pick is replayed against it afterwards; a pick that fails
its own check is printed as failing rather than silently re-chosen. That is the confirmation
round two used to provide, taken out of the same sitting. Under twenty confident answers in
the choosing slice it **refuses and says the count** rather than returning a bad number.
Round two keeps its own job either way: its section prices the chain at the chosen
strictness, which is the comparison round one's labels could not make, naming the cases
**every** rule gets wrong there and not only the chosen rule's — and where the chain is
itself what was chosen, it is asked whether it clears the floor on the sets drawn to break
it rather than asked to beat itself.

`--precision` moves the floor and `--linkage` narrows which rules are
in the running, so a decision to set one aside is a command rather than an argument made
afterwards. It reads
the catalog and `labels.sqlite3`, both on the NVMe, opens no substrate and never touches
`G:`; it writes no label and no report, and the only thing it can put in the labels file is
the round-one stamp the harness would have written anyway. The ceiling is not a knob: it is the fence the Match rows
were computed behind, so cutting the runs anywhere else would replay the labels over pairs
that were never checked.

```bash
python -m harness.calibrate
```

Its output is `docs/adr/0003-stack-on-verified-match.md`'s "What the recalibration settled",
and the bare run above **is** the command that returns what the ADR now records: *the chain*
at strictness 10, at 97.0% precision and 93.2% recall on round three's choosing slice, 90.2%
on the quarter held back from it, and 88.2% on round two's chain-crossing sets — the
population that declined the chain when the floor was 95%. The rule did not change and the
floor did. The two earlier sections, "What the labels settled" and "What round two settled",
describe the setting this superseded and the run that returned it is still
`python -m harness.calibrate --linkage complete,majority`; that setting's population is
still in `stack_member` and still offered by the Stacks panel.

To price the **fingerprint screen** — the other thing ADR 0003 left open, and the one the
labels turned round: at 0.40 the screen costs 5.2% of the pairs the reader kept together,
and the question is whether to loosen it. This is the measurement and never the pass. It
splits why each kept pair carries no Match row, because the two causes have different fixes
— the screen rejected it, or the derivative tree is missing a substrate — and it prices what
each screen value would ask for, estimated from the rates `photolib.matches` already
recorded rather than by running anything. Every value is answered from the stored cosine and
never from `verdict`, which is frozen at 0.40; the refusal guarding that constant is
borrowed whole rather than weakened. **A pair is counted once**, where `harness.calibrate`
counts it once per answer: the rounds partition a run differently and their sets overlap, so
60 answers' worth of kept pairs is 4,427 mentions of 3,727 pairs. It reads the catalog and
`labels.sqlite3`, both on the NVMe, opens no substrate, never touches `G:`, and holds both
connections read-only, so it writes nothing at all; the numbers are counts rather than
timings, but it shares the NVMe with the catalog and the substrates, so take it when nothing
else is measuring against that drive. There are no arguments and the sweep is not a knob.
Measured: all 192 of the unreached pairs are the screen's, none is a hole in the tree, and
buying every one of them back means a screen of 0.087, 1.77M fresh pairs, 1h42m and 356 MB.
Its output is ADR 0003's "What is still deliberately not settled here", which recommends
leaving the screen where it is.

```bash
python -m harness.screen
```

To finish that question — **match the pairs the screen rejected and see whether the geometry
was there.** `harness.screen` prices a looser screen from the stored cosine and stops, on
ADR 0003's reasoning that a recovered pair only helps if its Match then clears the reader's
strictness. That held at strictness 20 and stops holding at 10, so this computes the number
the ADR left open. **It writes nothing, and that is a fact about the code rather than a
promise**: both connections are read-only, `candidate_pair` and `pair_match` are untouched,
the 0.40 screen stays frozen, and the refusal guarding it is borrowed whole. It reads
`labels.sqlite3`, the catalog and the substrate tree, all on the NVMe, and never opens `G:`.
Unlike `harness.screen` it decodes photographs, so it is the slow one of the two, and a pair
is counted once each rather than once per answer. `--strictness` defaults to the setting the
grid runs. Measured: **297** kept pairs the screen turned away over three rounds, all 297
decoded — no hole in the tree — Matches of median 9, quartiles 4/16 and best 413, of which
**134 reach strictness 10** where 67 would have reached 20. Its output is ADR 0003's "The
screen's last open number, answered", which says the reasoning has turned and leaves acting
on it to a ticket of its own.

```bash
python -m harness.rejected
```

To read those Matches as **membership** — one row per tile saying which stack it is in,
at the setting the labels settled. It is stored rather than derived per query because
membership is a property of the photographs and not of the view, and **this table is what
the grid groups on**: `photolib/browse.py` joins it at `browse.STACK_SETTING`, so a filter
can only remove frames from a stack. Until a pass has run the grid draws every tile as its
own stack, whatever the toggle says. The walk is
the one `harness.calibrate` replayed the labels against, imported from here rather than
copied, so ADR 0003's numbers describe what the grid draws and not something adjacent
to it; `harness/label.py` re-exports it and keeps working. A stack is named by its earliest
member's sha256 and never by an id, and that is not the **cover**, which is resolved per
query. **The strictness, the linkage and the window are part of the key**, the relationship
the Match rows already have with the method that produced them, so moving one adds a
population rather than overwriting one and `--strictness`/`--linkage` are how a caller says
so; the ceiling is stored and is deliberately not a flag, being the fence the Match rows
were computed behind. Every EXIF-dated published tile gets exactly one row, a frame that
shot alone included; a tile the filesystem dated gets none, because a copy date is not when
the photograph was taken; and a video gets a stack that is always its own — nothing
verifies one — without breaking the run around it. **A pair carrying no Match row is read as
no agreement and never as a match**, so no stack is invented out of absent evidence, and the
pass counts those pairs and names the frames a *survivor* with no Match row touches, that
being a hole rather than a design. It reads the catalog on the NVMe and nothing else — no
substrate, no `G:`, and `state.sqlite3` is not attached. Resumable a run at a time,
idempotent, and it refuses while a writer holds the catalog.
Measured at the shipped setting — strictness 10 with *the chain*: 24,076 EXIF-dated tiles in
1,954 runs placed in 2–3s, 5–9s including the plan, into 7,995 stacks — 3,984 of them holding
more than one frame, the largest 96, collapsing 20,065 tiles. Of the fence's 3,634,381 pairs,
566,522 carry a Match and 3,065,689 were rejected by the screen; **no survivor is missing a
Match row**, so nothing is owed. The setting this superseded — strictness 20 with *matches
most members*, 9,108 stacks and 19,106 tiles collapsed — is **still in the table**, because a
setting is part of the key: the Stacks panel offers both and the reader flips between them.
Each population costs about 5 MB of catalog.

```bash
python -m photolib.membership
```

To find **the people** — the fourth pass of that shape, and the first that looks at anybody.
It gives every published, EXIF-dated, non-video tile two facts and changes nothing a reader
can see: **whether somebody is in it**, read off *bodies* so that the back of a head counts
and a landscape does not, and **which persons are in it**, from face detection, face
embedding and clustering, a *person* being one cluster of faces the pass decided are the
same individual. It exists because ADR 0003's worst stacks are of one place where the
difference is who is in them, which neither the Match nor the fingerprint has any notion of.
Three models, all local, all fetched once into `torch.hub`'s cache and none of them an
import of the website: torchvision's **Faster R-CNN ResNet50 FPN v2** at its COCO weights
for bodies, and **YuNet** with **SFace** — 233 KB and 37 MB of ONNX from a pinned commit of
`opencv/opencv_zoo`, checked against a recorded digest — for faces and their 128-dimension
vectors. No photograph leaves the disk and **no name is attached to any cluster**: the pass
produces "person 4f2a…", not "Chris". **The measurement is stored and the verdict is
derived**, `candidate_pair.screen`'s discipline: a box records its share of the frame's height
and nothing records whether that share was enough, so the prominence floor — 0.10, measured
against the reader's own answers and kept as a pre-filter rather than a verdict — moves by
re-reading rows. Every *face*'s share is kept, because each face
is a different who; of the bodies only the largest, because *is somebody here* is the whole of
what a body is asked and the largest answers it at any floor. The clustering is **complete
linkage**, because a person is not a chain, and its **threshold is part of the key** as
strictness and linkage are in `stack_member`, so `--threshold` adds a population rather than
overwriting one and re-clusters without re-detecting: the vector lives in `face` and the
person in `face_person`. A frame it looked at and found nobody in gets a row saying so, which
is how "checked and empty" stays different from "never checked". It reads the substrate tree
and the catalog, both on the NVMe, never opens `G:`, and does not attach `state.sqlite3`.
Resumable in its two stages, idempotent, refuses while a writer holds the catalog, and it
names the tiles whose substrate is missing rather than letting them become frames with no
answer. **A driver reset is one of those interruptions and the pass says so**: the card it
runs on is the one drawing the desktop, Windows resets that driver when a graphics command
outstays its timeout, and every CUDA context on the card dies with it — which is what ended
a run 320 frames in on 2026-08-22, in the same minute as six `nvlddmkm` resets and after two
graphics bugchecks the same night. A lost context poisons every call after it, so there is
nothing to retry in the process: the pass stores the frames it had in hand, clusters nothing,
and exits 2 saying that everything it counted is stored and a re-run resumes there. Re-running
it is the whole of the answer from this side; the fault is the driver's. Nothing reads any of
these rows yet.
Measured: 23,904 frames, the last 22,432 of them in one uninterrupted pass of 35m39s at
10.5/s on an RTX 3080 Ti — eleven times the fingerprint pass's cost per frame, which is what
three models instead of one costs. Two tiles have no substrate and are named; nothing failed
to decode. **9,268 frames hold a body and 6,176 hold one at or above the provisional 0.10
floor**; 4,049 frames hold a face, 8,037 faces in all, clustered at 0.363 in 5.6s into
**2,043 persons** — the largest of 120 faces, the median of 3, and 330 seen exactly once.
That last figure is what #54 was waiting for: the reader is being asked about two thousand
persons and not two hundred. The rows are cheap where the Match rows were not — 8,037
128-dimension vectors is 4 MB of a 2,531 MB catalog.

```bash
python -m photolib.people
```

Triage's **Apply to grid** button is what makes a triage decision visible in the grid:
it snapshots `state.sqlite3`, spawns `archive.pipeline.group` to rebuild `photo`, and
then drops the facet vocabulary and every `total` the server had memoised — no restart.
It is a background job, never a request; `photolib/rebuild.py` is the whole of it.

To roll the triage state back to one of those snapshots. It refuses while the grid is
up, refuses while anything holds the database, verifies the snapshot carries the
decisions, and snapshots the current state before replacing it. Rolling back a triage
session means restoring the snapshot from *before* it, which is the previous run's.

```bash
python -m photolib.restore_state --list
```

To run the archived v1 suite as a reference oracle. `archive/v1/.venv` is a Python 3.14
environment and still works after the move. Frontend checks are `npm test`, `npm run check`,
`npm run build` inside `archive/v1/review_ui`. Playwright screenshot, video, and trace capture
must stay disabled.

```bash
cd archive/v1 && ./.venv/Scripts/python.exe -m pytest -q
```

## Where things are written down

Read the one that matches the work. Do not read them all.

| Topic | Doc |
|---|---|
| Domain vocabulary — tile, stack, cover, near-duplicate | `CONTEXT.md` |
| Decisions and why they went the way they did | `docs/adr/` |
| The header's glass material, `/tune`, `/glass`, theme | `docs/glass-material.md` |
| Grid filters, sorts, facets, and what each query costs | `docs/grid-queries.md` |
| The 16 one-shot build steps, restic, the off-site copy | `archive/pipeline/README.md` |
| The long-form build plan and the deletion gate's evidence | `archive/PLAN.md` |

## `archive/v1/` feature documentation

`archive/v1-docs/` describes what `archive/v1/` contains, one file per feature.

| Feature | Doc |
|---|---|
| Inventory, dependency graph, status | `archive/v1-docs/INDEX.md` |
| Safety contract and why it exists | `archive/v1-docs/invariants.md` |
| Vault layout, content addressing, hashing, exact identity | `archive/v1-docs/storage-and-identity.md` |
| SQLite schema, 68 tables, migration contract | `archive/v1-docs/database-schema.md` |
| The 16 CLI commands and what each one touches | `archive/v1-docs/cli.md` |
| Inbox discovery, manifest, approval, verified copy | `archive/v1-docs/import-pipeline.md` |
| Job ledger, leases, claim tokens, worker runtime | `archive/v1-docs/jobs-and-workers.md` |
| Derivatives, extended metadata, quality features | `archive/v1-docs/preprocessing.md` |
| Visual similarity, RAW+JPEG grouping, exact groups | `archive/v1-docs/relationships.md` |
| Review HTTP API, security posture, envelopes | `archive/v1-docs/review-api.md` |
| SvelteKit app shell, routing, theming, build | `archive/v1-docs/review-ui.md` |
| Logical photo library, facets, filters, inspector | `archive/v1-docs/library.md` |
| Calendar, folder, equipment, map views | `archive/v1-docs/organize-views.md` |
| Similarity stacks and cover ranking | `archive/v1-docs/stacks.md` |
| Junk review, bulk reject, undo | `archive/v1-docs/junk-and-bulk-reject.md` |
| Read-only legacy dashboard on port 8765 | `archive/v1-docs/legacy-dashboard.md` |
| Test suites and synthetic corpus rules | `archive/v1-docs/testing.md` |
| All 83 findings, grouped by feature | `archive/v1-docs/known-defects.md` |

The full audit is in `archive/v1/docs/` — `ARCHITECTURE_REVIEW.md`, `FINDINGS_REGISTER.md` and
`ACTION_PRIORITY_MATRIX.md` are the authoritative long-form versions. Prefer `archive/v1-docs/`;
open `archive/v1/docs/` when you need the detail behind a finding.

## Repository etiquette

- **Work merges through `development`.** `main` is the default branch on GitHub and the
  release branch; nothing is PR'd into it directly.
- **One change, one worktree, one branch, one merged PR. Nothing is ever written in the main
  checkout** — not a one-line fix, not a typo. A committed `PreToolUse` hook
  (`.claude/hooks/worktree-guard.py`) denies it, and `/worktree-per-change` is the protocol.
  There is no contention check to run first: two writers in one tree share an index and a
  `HEAD`, so one's commit sweeps up the other's half-finished work and neither `git status`
  means anything, and the only rule that reliably prevents that is one with no exception in it.

  ```bash
  git worktree add .claude/worktrees/<name> -b <short-slug> origin/development
  ```

  Then **enter it with `EnterWorktree`**, not `cd` — entering is what makes reaching back into
  the main checkout refused rather than merely discouraged. A bare `EnterWorktree` cuts from
  `main`, which is the wrong base here.
- **Land the change at the end of every request, without being asked.** Stage the paths you
  changed by name (`git status` first — never `git add -A`, and never commit media, database or
  vault state; rule 5 above still applies), commit, then `git push -u origin HEAD`,
  `gh pr create --base development --fill`, `gh pr merge --squash --delete-branch`. Do not
  wait for permission, and do not leave a finished change on a local branch. If nothing
  changed, say so and skip it.
- Leave the worktree standing until its PR merges and name the path in your reply. The hook
  denies further edits in a worktree whose PR has merged: the next change takes a new one.
- **Once it has merged, take all three down** — remote branch (`--delete-branch` above),
  worktree, then the local branch, in that order. A merged branch left standing is a live
  push target after the PR that reviewed it has closed. **`ExitWorktree` with
  `action: "remove"` will not take the tree down**: it removes only a worktree it created
  itself, and every tree here is made with `git worktree add` and entered by path, so it
  refuses. Ask for `"keep"`, which puts the session back in the main checkout, and let git do
  the removal from there — nothing can remove the tree it is standing in, so the two are
  separate steps in that order. **Confirm the merge against GitHub, not git**: `--squash`
  keeps no ancestry, so `git branch -d`, `--merged` and `merge-base --is-ancestor` read every
  merged branch here as unmerged. `gh pr view <n> --json state --jq .state` for `MERGED`,
  then `git worktree remove <path>` and `git branch -D <slug>`.
- **Never stash** — `refs/stash` is one stack for the whole repository, worktrees included, so
  a push here renumbers every other tree's entries. Commit instead. And **never restore a
  `HEAD` you moved by accident** — say what you ran and stop.
- Reference `archive/v1/` findings by their stable IDs (`F31`, `W05`) when they motivate a decision.
- `archive/v1/` files are reference material: cite them as `archive/v1/media_vault/db.py:506`.

## Agent skills

### Issue tracker

Issues live as GitHub issues on `chrisJuresh/photos`, driven through the `gh` CLI.
See `docs/agents/issue-tracker.md`.

**When a request names a ticket, run its whole lifecycle without being asked** — claim it,
pick a tree, branch, build it, commit and push, then close it with a comment saying what
landed. The reader should not have to type a `gh` command. "Working a ticket" in that file is
the sequence; it is an extension of the commit-and-push etiquette above, not an exception to it.

### Triage labels

The five canonical roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
