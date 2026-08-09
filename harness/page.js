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
const marks = new Map(); // index -> { out: Set, in: Set }

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

function frame(sha, role, marked) {
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
    : role === "neighbour" ? "neighbour"
    : sha.slice(0, 8);
  button.append(caption);
  return button;
}

// A box rather than a group: CONTEXT.md keeps "group" off the stack, and this is
// the stack as drawn, with the border that states the claim being judged.
function box(shas, role, marked) {
  const holder = document.createElement("div");
  holder.className = `box ${role}`;
  for (const sha of shas) holder.append(frame(sha, role, marked(sha)));
  return holder;
}

function draw() {
  const set = sample.sets[at];
  const mark = marksFor(at);

  stage.replaceChildren();
  if (set.before) {
    stage.append(box([set.before], "neighbour", (sha) => (mark.in.has(sha) ? "in" : null)));
  }
  stage.append(box(set.members, "member", (sha) => (mark.out.has(sha) ? "out" : null)));
  if (set.after) {
    stage.append(box([set.after], "neighbour", (sha) => (mark.in.has(sha) ? "in" : null)));
  }

  const answer = set.answer;
  about.replaceChildren(
    `set ${at + 1} of ${sample.sets.length} · ${set.members.length} frames · `,
    strong(set.camera || "unnamed camera"),
    ` · ${set.margin} points from the provisional line of ${sample.strictness}`
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
  } else if (event.key === "Backspace") {
    event.preventDefault();
    marks.set(at, { out: new Set(), in: new Set() });
    send(false, false);
  }
});

(async () => {
  sample = await (await fetch("/api/sets")).json();
  if (!sample.sets.length) {
    count.textContent = "no sets to judge";
    return;
  }
  step(0, true);
})();
