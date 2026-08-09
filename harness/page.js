// The labelling harness's client. Vanilla, unbundled and deleted with the rest
// of `harness/` — `ui/` is the website's client and this is not part of it.
//
// The whole sample arrives in one response, so going back to revise an answer is
// a local move. Only recording talks to the server, and the response to that is
// the sample again, which is what keeps the counter honest across a reload.

const count = document.getElementById("count");
const about = document.getElementById("about");
const stage = document.getElementById("stage");
const said = document.getElementById("said");

let sample = null;
let at = 0;
// How much context the reader has asked for, which is not the same as how much
// there is: a set at the end of a run has less, and one they widened earlier
// should not leave the counter stuck above what the next set can show.
let wanted = 1;
const marks = new Map(); // index -> { out: Set, in: Set }

const beside = (set) => Math.max(set.before.length, set.after.length);
const showing = (set) => Math.min(wanted, beside(set));

const VERDICTS = {
  accept: "accepted as drawn",
  split: "holds a frame that does not belong",
  merge: "is missing a frame that should be here",
  both: "holds one that does not belong and is missing one that should be here",
  unsure: "not sure",
};

function marksFor(index) {
  if (!marks.has(index)) {
    const answer = sample.sets[index].answer;
    marks.set(index, {
      out: new Set(answer ? answer.evicted : []),
      in: new Set(answer ? answer.included : []),
    });
  }
  return marks.get(index);
}

// The gap between a frame outside the stack and the edge of it, which is what
// says whether the frame is plausible at all: two seconds is another press of
// the shutter, forty minutes is somewhere else.
function elapsed(seconds) {
  const gap = Math.abs(seconds);
  if (gap < 60) return `${gap}s`;
  if (gap < 3600) return `${Math.round(gap / 60)}m`;
  return `${(gap / 3600).toFixed(1)}h`;
}

function frame(sha, role, marked, gap) {
  const button = document.createElement("button");
  button.className = `frame ${role}` + (marked ? ` marked-${marked}` : "");
  button.dataset.sha = sha;
  button.dataset.role = role;

  const image = document.createElement("img");
  image.src = `/d/${sha}.webp`;
  image.alt = "";
  button.append(image);

  const caption = document.createElement("span");
  caption.className = "caption";
  caption.textContent =
    marked === "out" ? "does not belong"
    : marked === "in" ? "should be included"
    : role === "neighbour" ? `${elapsed(gap)} away`
    : sha.slice(0, 8);
  button.append(caption);
  return button;
}

// A box rather than a group: CONTEXT.md keeps "group" off the stack, and this is
// the stack as drawn, with the border that states the claim being judged.
function box(entries, role, marked) {
  const holder = document.createElement("div");
  holder.className = `box ${role}`;
  for (const { sha, gap } of entries) holder.append(frame(sha, role, marked(sha), gap));
  return holder;
}

const asFrames = (shas) => shas.map((sha) => ({ sha, gap: 0 }));

const GAP = 6; // must match the `gap` the boxes are laid out with
const CAPTION = 22; // the strip under each frame that is not photograph
const CONTEXT = 8; // how far the view widens; `harness/label.py` bounds it too

// How many columns to lay a stack out in. CSS can do this with `auto-fit` and it
// gets it wrong for the job: `auto-fit` packs in as many columns as will fit the
// width and never looks at the height, so six frames went four across in two
// rows and each photograph came out 182px wide with half the row empty under it.
// The reader is here to see a difference between photographs, so the arrangement
// worth having is the one that draws them largest -- which means trying each
// column count and keeping the best, since the winner depends on the shape of
// the room as much as on how many frames there are.
function columns(count, width, height) {
  let best = 1;
  let largest = 0;
  for (let candidate = 1; candidate <= count; candidate += 1) {
    const rows = Math.ceil(count / candidate);
    const tall = (height - GAP * (rows - 1)) / rows - CAPTION;
    const wide = (width - GAP * (candidate - 1)) / candidate;
    if (tall <= 0 || wide <= 0) continue;
    // A 3:2 picture is what this library is mostly made of, so its height in
    // that tile stands in for "how well can the reader see it".
    const size = Math.min(wide / 1.5, tall);
    if (size > largest) {
      largest = size;
      best = candidate;
    }
  }
  return best;
}

function draw() {
  const set = sample.sets[at];
  const mark = marksFor(at);

  // `before` comes back nearest-first, so it is reversed to be drawn: on screen
  // the run reads left to right in the order it was shot.
  const outside = (sha) => (mark.in.has(sha) ? "in" : null);
  const shown = showing(set);
  const before = set.before.slice(0, shown);
  const after = set.after.slice(0, shown);

  stage.replaceChildren();
  if (before.length) stage.append(box([...before].reverse(), "neighbour", outside));
  const members = box(asFrames(set.members), "member", (sha) =>
    mark.out.has(sha) ? "out" : null
  );
  stage.append(members);
  if (after.length) stage.append(box(after, "neighbour", outside));
  // After appending, because the count is chosen against the room the box
  // actually got. `style.setProperty` and never `setAttribute("style", …)`:
  // the CSP carries no `unsafe-inline`, which blocks the attribute and not the
  // CSSOM — the same distinction CLAUDE.md draws for Svelte.
  members.style.setProperty(
    "--columns",
    columns(set.members.length, members.clientWidth, members.clientHeight)
  );

  const answer = set.answer;
  const available = beside(set);
  about.replaceChildren(
    `set ${at + 1} of ${sample.sets.length} · ${set.members.length} frames · `,
    strong(set.camera || "unnamed camera"),
    ` · ${set.margin} points from the provisional line of ${sample.strictness} · `,
    available === 0
      ? "nothing either side of it in the run"
      : `showing ${shown} of ${available} either side`
  );
  said.textContent = answer
    ? `answered: ${VERDICTS[answer.verdict]} — record again to revise it`
    : "not answered yet";
  countUp();
}

function strong(text) {
  const node = document.createElement("strong");
  node.textContent = text;
  return node;
}

function countUp() {
  const left = Math.max(sample.useful - sample.given, 0);
  count.replaceChildren(
    strong(`${sample.given}`),
    sample.given === 1 ? " judgement given · about " : " judgements given · about ",
    strong(`${left}`),
    left === 1 ? " more is useful" : " more are useful"
  );
}

// A click is an answer, not a pencil mark: the set is recorded the moment the
// reader says a frame does not belong, and the keystroke that follows only says
// they are finished with it. So nothing is lost by walking away mid-set, and
// "clicking a frame records that it does not belong" is true of the click.
async function send(unsure, advance) {
  const set = sample.sets[at];
  const mark = marksFor(at);
  const response = await fetch("/api/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      members: set.members,
      // At least one, because that is the narrowest view there is; a set with
      // nothing beside it has nothing to say about either way.
      shown: Math.max(showing(set), 1),
      evicted: [...mark.out],
      included: [...mark.in],
      unsure,
    }),
  });
  if (!response.ok) {
    said.textContent = `the harness refused that answer (${response.status})`;
    return;
  }
  sample = await response.json();
  marks.delete(at); // the stored answer is the marks now
  if (advance) step(1, true);
  else draw();
}

// The next set nobody has answered, wrapping past the end, or -1 when they all
// are. Wrapping is what keeps the last set from being a dead end: a reader who
// arrows past a few and then finishes the last one is sent back to the gaps
// rather than left redrawing the set they just answered.
function unanswered(from) {
  const total = sample.sets.length;
  for (let offset = 0; offset < total; offset += 1) {
    const index = (from + offset + total) % total;
    if (!sample.sets[index].answer) return index;
  }
  return -1;
}

// Forward past whatever is already answered, so a reader who stops and comes
// back carries on rather than re-judging. Backwards is always one step, because
// backwards is how an answer gets revised.
function step(by, skipAnswered = false) {
  if (skipAnswered) {
    const next = unanswered(at + by);
    if (next < 0) return finished();
    at = next;
    draw();
    return;
  }
  at = Math.min(Math.max(at + by, 0), sample.sets.length - 1);
  draw();
}

function finished() {
  stage.replaceChildren();
  const done = document.createElement("p");
  done.className = "done";
  done.textContent = "every set in this sample is answered. Nothing more is useful here.";
  stage.append(done);
  about.textContent = "";
  said.textContent = "← to go back over any of them";
  countUp();
}

// The arrangement is chosen against the room there is, so a resized window is a
// different answer. Debounced, because a drag is a hundred of these.
let settling = null;
window.addEventListener("resize", () => {
  if (!sample || !sample.sets[at]) return;
  clearTimeout(settling);
  settling = setTimeout(draw, 150);
});

stage.addEventListener("click", (event) => {
  const button = event.target.closest(".frame");
  if (!button) return;
  const mark = marksFor(at);
  const held = button.dataset.role === "member" ? mark.out : mark.in;
  const sha = button.dataset.sha;
  if (held.has(sha)) held.delete(sha);
  else held.add(sha);
  send(false, false);
});

document.addEventListener("keydown", (event) => {
  if (!sample) return;
  if (event.key === " ") {
    event.preventDefault();
    send(false, true);
  } else if (event.key === "u" || event.key === "U") {
    send(true, true);
  } else if (event.key === "ArrowRight") {
    step(1);
  } else if (event.key === "ArrowLeft") {
    step(-1);
  } else if (event.key === "+" || event.key === "=") {
    widen(1);
  } else if (event.key === "-" || event.key === "_") {
    widen(-1);
  } else if (event.key === "Backspace") {
    event.preventDefault();
    marks.set(at, { out: new Set(), in: new Set() });
    send(false, false);
  }
});

// Changing the view is not an answer, so it posts nothing.
//
// Narrowing stops at the furthest frame the reader has pulled in, rather than
// hiding it. Hiding it would have to retract the answer -- what is recorded is
// only ever about the frames that were on screen -- and quietly turning a
// considered "this one should have been included" back into "accepted as drawn"
// is the wrong way to resolve that. Let go of the frame first, which is a click
// on it, and then the view narrows.
function widen(by) {
  const set = sample.sets[at];
  const mark = marksFor(at);
  const reach = (near) =>
    near.reduce((furthest, { sha }, index) => (mark.in.has(sha) ? index + 1 : furthest), 0);
  const pinned = Math.max(reach(set.before), reach(set.after), 1);

  // Counted from what is on screen rather than from what was asked for, so a
  // press always moves the view by one and never spends itself closing a gap
  // between the two.
  const current = showing(set);
  const next = Math.min(Math.max(current + by, pinned), CONTEXT);
  // Only when a mark is what stopped it. At the narrowest view there is nothing
  // to narrow and nothing to explain.
  if (next === current && by < 0 && pinned > 1) {
    said.textContent =
      "a frame you have pulled in is out there — click it again to let go of it first";
    return;
  }
  if (next === wanted) return;
  wanted = next;
  draw();
}

(async () => {
  sample = await (await fetch("/api/sets")).json();
  if (!sample.sets.length) {
    count.textContent = "no sets to judge";
    return;
  }
  step(0, true);
})();
