// The labelling harness's client. Vanilla and unbundled — `ui/` is the website's
// client and this is not part of it, so it carries none of that toolchain.
//
// **Two modes over one page.** The stack mode asks whether a stack is drawn right
// and the people mode asks whether a person is somebody the reader photographed;
// they share the header, the stage, the substrate route and the labels file, and
// they share nothing else. Everything below the mode switch is one or the other,
// and the stack mode's half is unchanged by the people mode existing.
//
// Everything the sitting has been dealt arrives in one response, so going back to
// revise an answer is a local move. Two things talk to the server: recording an
// answer, and asking for one more set. Both answer with the sitting again, which is
// what keeps the counter honest across a reload.

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
const marks = new Map(); // index -> { out: Set, in: Set, why: Map }

// Which question the reader is answering. It rides in the location hash so a
// reload comes back to the mode they were in -- the alternative is storage, and a
// page with one reader at one keyboard has somewhere simpler to put one word.
let mode = location.hash === "#people" ? "people" : "stacks";

const beside = (set) => Math.max(set.before.length, set.after.length);
const showing = (set) => Math.min(wanted, beside(set));

// The reader's words for the linkage rules, not the map keys. ADR 0003 and
// CONTEXT.md call the middle one "matches most members" everywhere it is written
// down, and this line is the one place the operator reads it.
const LINKAGES = {
  complete: "complete",
  majority: "matches most members",
  neighbour: "neighbour",
};

const VERDICTS = {
  accept: "accepted as drawn",
  split: "holds a frame that does not belong",
  merge: "is missing a frame that should be here",
  both: "holds one that does not belong and is missing one that should be here",
  unsure: "not sure",
};

// Why a frame does not belong, in the reader's own words. Three because they named
// three, and one keystroke each — see `KEYS` — because a reason that cost a sentence
// would stop being given. `REASONS` in label.py is the same three under the names the
// column stores, which are the keys here.
const WORDS = {
  people: "different people",
  moment: "a different moment",
  close: "not close enough",
};

function marksFor(index) {
  if (!marks.has(index)) {
    const answer = sample.sets[index].answer;
    marks.set(index, {
      out: new Set(answer ? answer.evicted : []),
      in: new Set(answer ? answer.included : []),
      // Reasons unknown reads as none given, which is what it is from here: an
      // answer carried over from an earlier round has nothing to redraw.
      why: new Map(Object.entries((answer && answer.reasons) || {})),
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

function frame(sha, role, marked, gap, beyond) {
  const button = document.createElement("button");
  button.className = `frame ${role}`;
  button.dataset.sha = sha;
  button.dataset.role = role;
  button.dataset.gap = gap;
  button.dataset.beyond = beyond ? "1" : "";

  const image = document.createElement("img");
  image.src = `/d/${sha}.webp`;
  image.alt = "";
  // A widened view can hold hundreds of 1536px substrates, and fetching and
  // decoding all of them at once is how a local page becomes a slideshow. Only
  // what is on screen is loaded; the rest arrives as the box is scrolled.
  image.loading = "lazy";
  image.decoding = "async";
  button.append(image);

  const caption = document.createElement("span");
  caption.className = "caption";
  button.append(caption);
  paint(button, marked !== null);
  return button;
}

// A frame's marked state, written straight onto the element. Straight onto it
// rather than through `draw`, because a drag paints as it goes and redrawing
// under a held pointer would replace the elements it is dragging over.
//
// An evicted frame says why it was evicted the moment the reader says so, because a
// reason recorded and not shown is a reason they cannot tell they gave.
function paint(button, marked) {
  const { sha, role, gap, beyond } = button.dataset;
  const reason = marksFor(at).why.get(sha);
  button.classList.toggle(role === "member" ? "marked-out" : "marked-in", marked);
  button.querySelector(".caption").textContent = marked
    ? role === "member"
      ? reason
        ? WORDS[reason]
        : "does not belong"
      : "should be included"
    : role === "neighbour"
      ? `${elapsed(Number(gap))} away${beyond ? " · past the run" : ""}`
      : sha.slice(0, 8);
}

// A box rather than a group: CONTEXT.md keeps "group" off the stack, and this is
// the stack as drawn, with the border that states the claim being judged.
function box(entries, classes, marked) {
  const holder = document.createElement("div");
  holder.className = `box ${classes}`;
  // The class list may carry more than the role -- `neighbour beyond` -- and a
  // frame only ever knows the role, which is what decides what marking it means.
  const [role] = classes.split(" ");
  const beyond = classes.includes("beyond");
  for (const { sha, gap } of entries) {
    holder.append(frame(sha, role, marked(sha), gap, beyond));
  }
  return holder;
}

const asFrames = (shas) => shas.map((sha) => ({ sha, gap: 0 }));

const GAP = 6; // must match the `gap` the boxes are laid out with
const CAPTION = 16; // the strip under each frame that is not photograph
// The smallest a photograph is worth drawing -- the reader's own words are "as
// long as i can just about see what they are", and they would rather have all
// of a run small than some of it large. So this is low, and the arrangement
// shrinks to it before it starts scrolling. Below it a box scrolls instead,
// because a hundred frames at four pixels each is not a view of anything.
const FLOOR = 40;

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
  // Everything fits and the frames are big enough to read: that arrangement.
  if (largest >= FLOOR) return best;
  // It does not fit. Rather than carry on shrinking, fill the width at the floor
  // size and let the box scroll -- which is the only honest answer once there
  // are more frames than the room can hold at a legible size.
  return Math.max(1, Math.min(count, Math.floor((width + GAP) / (FLOOR * 1.5 + GAP))));
}

// Redrawing is rebuilding every frame on screen, and a widened view holds
// hundreds of them. A held key repeats about thirty times a second, so drawing
// once per press is quadratic work on a growing DOM -- measured by spamming the
// widen key on a 723-frame run, which stopped answering altogether. One draw per
// animation frame instead: the presses still all count, they just land together.
let pending = false;
function redraw() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    draw();
  });
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

  // The frame past each end of the run, drawn however narrow the view is. It is
  // not a candidate -- the fence rules it out -- so it stands in its own box
  // outside the dashed ones, and the reader can still say it belongs, which
  // would mean the fence or the clock is wrong rather than the threshold.
  const boxes = [];
  if (set.outside[0]) boxes.push(box([set.outside[0]], "neighbour beyond", outside));
  if (before.length) boxes.push(box([...before].reverse(), "neighbour", outside));
  boxes.push(box(asFrames(set.members), "member", (sha) => (mark.out.has(sha) ? "out" : null)));
  if (after.length) boxes.push(box(after, "neighbour", outside));
  if (set.outside[1]) boxes.push(box([set.outside[1]], "neighbour beyond", outside));

  // A box's share of the width is how many frames are in it, which is what gives
  // every frame on screen about the same area however lopsided the run is: 155
  // frames one side of a stack and 40 the other should not be two boxes of the
  // same size. `min-width` in the stylesheet keeps the smaller side off nothing.
  // `style.setProperty` and never `setAttribute("style", …)`: the CSP carries no
  // `unsafe-inline`, which blocks the attribute and not the CSSOM — the same
  // distinction CLAUDE.md draws for Svelte.
  for (const holder of boxes) {
    holder.style.setProperty("--share", holder.children.length);
  }
  stage.replaceChildren(...boxes);
  // After appending, because each count is chosen against the room its box
  // actually got.
  for (const holder of boxes) {
    holder.style.setProperty(
      "--columns",
      columns(holder.children.length, holder.clientWidth, holder.clientHeight)
    );
  }

  const answer = set.answer;
  const available = beside(set);
  about.replaceChildren(
    // The set's place in the sitting and no total beside it: there is nothing to be
    // "of" until the reader stops, and a denominator would read as a quota.
    `set ${at + 1} · ${set.members.length} frames · `,
    strong(set.camera || "unnamed camera"),
    ` · ${set.margin} points from the line of ${sample.strictness}` +
      ` under ${LINKAGES[sample.linkage] || sample.linkage} linkage · `,
    // Each side counted separately, because they run out separately: a stack
    // five frames from the end of its run shows five after it however far the
    // view is widened, and "5 of 5 after" says the run ended where "showing 30
    // of 30 either side" looked like a limit.
    available === 0
      ? "nothing either side of it in the run"
      : `showing ${Math.min(shown, set.before.length)} of ${set.before.length} before` +
        ` · ${Math.min(shown, set.after.length)} of ${set.after.length} after`,
    ended(set, shown)
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

// Why the context stops, once it has. A run that ended and a view that was
// capped look identical from inside the harness -- both are simply "no more
// frames" -- and the reader read the first as the second. So when a side is
// fully shown, say what is beyond it: the shooting picked up again a day later,
// or the camera has nothing else at all.
function ended(set, shown) {
  const [before, after] = set.outside;
  const done = (side, near) =>
    shown < side.length
      ? null
      : near === null
        ? "nothing else from this camera"
        : `${elapsed(near.gap)} to the frame drawn past it`;
  const ends = [
    ["before it", done(set.before, before)],
    ["after it", done(set.after, after)],
  ].filter(([, said]) => said);
  if (!ends.length) return "";
  return ` · the run ends ${ends.map(([side, said]) => `${side}: ${said}`).join(", ")}`;
}

// The count is the round in hand and says so: how many answers the reader has given
// this sitting. There is no second number, because there is no round size -- nothing
// decided up front how many sets tonight holds, so "how many more are useful" has no
// answer and saying one would invent a target the reader never set.
function countUp() {
  count.replaceChildren(
    strong(`round ${sample.round}`),
    " · ",
    strong(`${sample.given}`),
    sample.given === 1 ? " judgement given" : " judgements given",
    " · stop whenever you like"
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
      // Always an object and never left off, because this round asks: an empty one
      // says the reader was asked and pressed nothing, which is a different fact
      // from the missing column rounds one and two have. Only the frames still
      // pushed out are in it -- letting go of a frame lets go of its reason.
      reasons: Object.fromEntries([...mark.why].filter(([sha]) => mark.out.has(sha))),
    }),
  });
  if (!response.ok) {
    said.textContent = `the harness refused that answer (${response.status})`;
    return;
  }
  sample = await response.json();
  marks.delete(at); // the stored answer is the marks now
  if (advance) await forward();
  else draw();
}

// One more set, drawn when the reader asks for it and not before. It is the end of
// the dealt list that asks: nothing is waiting there, so going forward past it is
// the request.
async function deal() {
  said.textContent = "drawing another…";
  const held = sample.sets.length;
  const response = await fetch("/api/next", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) {
    said.textContent = `the harness could not draw another set (${response.status})`;
    return;
  }
  sample = await response.json();
  if (sample.sets.length === held) return finished();
  at = sample.sets.length - 1;
  draw();
}

// Forward is the next set dealt, or a new one off the end. Backwards is always one
// step, because backwards is how an answer gets revised.
async function forward() {
  if (at < sample.sets.length - 1) {
    at += 1;
    draw();
    return;
  }
  await deal();
}

function step(by) {
  at = Math.min(Math.max(at + by, 0), sample.sets.length - 1);
  draw();
}

function finished() {
  stage.replaceChildren();
  const done = document.createElement("p");
  done.className = "done";
  done.textContent =
    "the catalog has no set left to ask about: every run either scores past the bands" +
    " or has already been judged.";
  stage.append(done);
  about.textContent = "";
  said.textContent = "← to go back over any of them";
  countUp();
}

// The arrangement is chosen against the room there is, so a resized window is a
// different answer. Debounced, because a drag is a hundred of these.
let settling = null;
window.addEventListener("resize", () => {
  const drawing = mode === "people" ? crowd && crowd.persons[who] : sample && sample.sets[at];
  if (!drawing) return;
  clearTimeout(settling);
  settling = setTimeout(mode === "people" ? drawPerson : draw, 150);
});

// A drag marks a run of frames in one go, because a stack of a dozen near
// identical frames is where the reader most wants to say "these three do not
// belong" and least wants to say it three times. It paints as the pointer
// travels and records once, on release -- so a drag is one answer and not one
// per frame, and a plain click is a drag over a single frame.
//
// The drag keeps to the role it started on: dragging out of the stack and
// across a neighbour would otherwise turn "these do not belong" into "and pull
// that one in", which is two different claims from one gesture.
let dragging = null;

function held(role) {
  return role === "member" ? marksFor(at).out : marksFor(at).in;
}

function setMark(button, marked) {
  const set = held(button.dataset.role);
  if (marked) set.add(button.dataset.sha);
  else {
    set.delete(button.dataset.sha);
    // Letting go of a frame lets go of why it was pushed out. A reason attached to a
    // frame that is back in the stack is not a fact about anything.
    marksFor(at).why.delete(button.dataset.sha);
  }
  paint(button, marked);
}

// Whether the pointer already dealt with this press, so the `click` that follows
// it does not toggle the frame a second time.
let taken = false;

stage.addEventListener("pointerdown", (event) => {
  if (mode !== "stacks") return;
  const button = event.target.closest(".frame");
  taken = false;
  if (!button || event.button !== 0) return;
  event.preventDefault();
  dragging = {
    role: button.dataset.role,
    marked: !held(button.dataset.role).has(button.dataset.sha),
  };
  setMark(button, dragging.marked);
  stage.setPointerCapture(event.pointerId);
});

stage.addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const button = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest(".frame");
  if (!button || button.dataset.role !== dragging.role) return;
  if (held(dragging.role).has(button.dataset.sha) === dragging.marked) return;
  setMark(button, dragging.marked);
});

for (const ending of ["pointerup", "pointercancel"]) {
  stage.addEventListener(ending, () => {
    if (!dragging) return;
    dragging = null;
    taken = true;
    send(false, false);
  });
}

// A frame is a button, and a button can be pressed without a pointer -- from the
// keyboard, or by anything driving the page. The pointer path above is what
// makes dragging work and it swallows the common case, so this is the same
// answer for a press that never came from a pointer at all.
stage.addEventListener("click", (event) => {
  if (mode !== "stacks") return;
  if (taken) {
    taken = false;
    return;
  }
  const button = event.target.closest(".frame");
  if (!button) return;
  setMark(button, !held(button.dataset.role).has(button.dataset.sha));
  send(false, false);
});

// Vim keys, because the reader's hand is on the home row and the answer keys are
// there too. The arrows and `+`/`-` still work and are simply not advertised.
const KEYS = {
  " ": () => send(false, true),
  u: () => send(true, true),
  l: () => forward(),
  h: () => step(-1),
  ArrowRight: () => forward(),
  ArrowLeft: () => step(-1),
  // Why the frames pushed out do not belong, one press each. See `WORDS` for the
  // words and `why` for which frames a press answers for.
  p: () => why("people"),
  m: () => why("moment"),
  c: () => why("close"),
  // Vertical for how much is on screen, horizontal for which set: `k` is up and
  // out to more of the run, `j` is down and back to less of it.
  k: () => widen(1),
  j: () => widen(-1),
  // The whole run at once and back again. A run reaches 723 frames either side
  // of a stack in this library, and stepping there one frame at a time is not a
  // way to get there.
  g: () => widen(Infinity),
  0: () => widen(-Infinity),
  "=": () => widen(1),
  "+": () => widen(1),
  "-": () => widen(-1),
  _: () => widen(-1),
};

// Why the frames pushed out of this stack do not belong. It answers for the ones
// with no reason yet, so a drag of three and one press covers all three and a fourth
// frame pushed out afterwards takes its own reason; when they all have one, the press
// is a correction and answers for all of them. Recorded like a click is, because it
// is a click's worth of thought and losing it to a stray arrow key would be the same
// loss.
function why(reason) {
  const mark = marksFor(at);
  if (!mark.out.size) {
    said.textContent = "nothing is pushed out of this stack yet — click a frame first";
    return;
  }
  const unsaid = [...mark.out].filter((sha) => !mark.why.has(sha));
  for (const sha of unsaid.length ? unsaid : mark.out) mark.why.set(sha, reason);
  send(false, false);
}

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  if (mode === "people") {
    pressedInPeople(event);
    return;
  }
  if (!sample) return;
  if (event.key === "Backspace") {
    event.preventDefault();
    marks.set(at, { out: new Set(), in: new Set(), why: new Map() });
    send(false, false);
    return;
  }
  const pressed = KEYS[event.key] || KEYS[event.key.toLowerCase()];
  if (!pressed) return;
  event.preventDefault(); // space would scroll, and would press a focused frame
  pressed();
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
  // `by` may be Infinity, which is the whole run, or -Infinity, which is back to
  // one frame either side. Both land inside the same clamp.
  const next = Math.min(Math.max(current + by, pinned), beside(set));
  // Only when a mark is what stopped it. At the narrowest view there is nothing
  // to narrow and nothing to explain.
  if (next === current && by < 0 && pinned > 1) {
    said.textContent =
      "a frame you have pulled in is out there — click it again to let go of it first";
    return;
  }
  if (next === wanted) return;
  wanted = next;
  redraw();
}

// --- the people mode --------------------------------------------------------
//
// One person at a time, drawn as a montage of the frames their faces were found
// in, and the reader says once whether they are somebody photographed or somebody
// who wandered in. The answer holds everywhere that person appears, which is what
// makes it worth asking: `harness.people` orders the list by how many stacks the
// answer would move, so the reader judges the people who matter and can stop long
// before the list ends.
//
// **The frames, and not face crops.** `migrations/012_people.sql` stores a face's
// share of the frame's height and its embedding, and no box — so there is nothing
// stored to crop from, and a caption saying which face of the frame this is and how
// big it was is the whole of what can honestly be drawn around it.

let crowd = null; // the /api/persons payload
let who = 0;
// How many of this person's faces are on screen. Their own `wanted`, kept apart
// from the stack mode's so switching modes does not carry a widened view across
// into a question it means nothing in.
let faces = 0;

// The four answers, in the reader's own words. `harness.people.VERDICTS` is the
// same four under the names the column stores, which are the keys here.
const SAYS = {
  friend: "somebody you photographed",
  stranger: "a stranger who wandered in",
  unsure: "not sure — the cluster could not be made out",
  "two-people": "obviously two different people — a clustering failure",
};

const modes = {
  stacks: document.getElementById("mode-stacks"),
  people: document.getElementById("mode-people"),
};

const legends = {
  stacks: document.getElementById("keys-stacks"),
  people: document.getElementById("keys-people"),
};

function subject() {
  return crowd && crowd.persons[who];
}

// A face is not a control. The answer is a keystroke about the person and never a
// click on one of their appearances, so this is a div and not the button the stack
// mode's frames are: there is nothing here to press.
function faceOf(face, of) {
  const holder = document.createElement("div");
  holder.className = "frame face";

  const image = document.createElement("img");
  image.src = `/d/${face.sha}.webp`;
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  holder.append(image);

  const caption = document.createElement("span");
  caption.className = "caption";
  // Which face of the frame, and how much of the frame it was. The only stored
  // facts about where it is -- so this is what tells the reader which of three
  // people in a party photograph is the one being judged, and it is also the
  // number `harness.floor` prices a prominence floor against.
  caption.textContent =
    of > 1
      ? `face ${face.idx + 1} of ${of} here · ${(face.share * 100).toFixed(0)}% tall`
      : `${(face.share * 100).toFixed(0)}% tall`;
  holder.append(caption);
  return holder;
}

function drawPerson() {
  const one = subject();
  const shown = Math.min(faces, one.faces.length);
  const here = new Map();
  for (const face of one.faces) here.set(face.sha, (here.get(face.sha) || 0) + 1);

  const holder = document.createElement("div");
  holder.className = "box montage";
  for (const face of one.faces.slice(0, shown)) {
    holder.append(faceOf(face, here.get(face.sha)));
  }
  holder.style.setProperty("--share", shown);
  stage.replaceChildren(holder);
  holder.style.setProperty(
    "--columns",
    columns(shown, holder.clientWidth, holder.clientHeight)
  );

  about.replaceChildren(
    // No denominator on the person, for the reason the stack mode gives none on
    // the set: the list is ordered so stopping early is expected, and "3 of 412"
    // reads as a quota rather than as a queue.
    `person ${who + 1} · `,
    strong(
      one.splits === 1
        ? "1 stack would be drawn differently"
        : `${one.splits} stacks would be drawn differently`
    ),
    ` at strictness ${crowd.strictness} under ${LINKAGES[crowd.linkage] || crowd.linkage}` +
      ` linkage · showing ${shown} of ${one.faces.length}` +
      ` ${one.faces.length === 1 ? "face" : "faces"} · clustered at ${crowd.threshold}`
  );
  said.textContent = one.answer
    ? `answered: ${SAYS[one.answer]} — press again to revise it`
    : "not answered yet";
  peopleCount();
}

// Two numbers, because the reader asked for two: how many they have judged, and
// how many are left whose answer would change anything. The second is what says
// when stopping is free -- it reaches zero and there is nothing left to buy.
function peopleCount() {
  count.replaceChildren(
    strong("people"),
    " · ",
    strong(`${crowd.judged}`),
    crowd.judged === 1 ? " person judged" : " people judged",
    " · ",
    strong(`${crowd.left}`),
    " left whose answer would change a stack · stop whenever you like"
  );
}

async function judgePerson(verdict) {
  const one = subject();
  const response = await fetch("/api/person", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ person: one.person, verdict }),
  });
  if (!response.ok) {
    said.textContent = `the harness refused that answer (${response.status})`;
    return;
  }
  crowd = await response.json();
  // The verdict is filed either way -- that is the server's business and it is
  // done. What must not happen is drawing a montage over a stack question, so a
  // reader who switched modes while this was in flight gets no redraw.
  if (mode !== "people") return;
  // On to the next, because the answer *is* the keystroke here: there is no second
  // press that means "finished with this one", so recording and advancing are the
  // same act. `h` is how a misclick is revised.
  if (who < crowd.persons.length - 1) toPerson(1);
  else drawPerson();
}

function toPerson(by) {
  who = Math.min(Math.max(who + by, 0), crowd.persons.length - 1);
  // The montage resets to the first few for each person, because how far the
  // reader widened it for somebody with ninety faces says nothing about the next
  // person, who may have three.
  faces = crowd.montage;
  drawPerson();
}

// More or fewer of their faces, with no ceiling -- the stack mode's `widen` and its
// reasoning: every ceiling picked for a view here has been hit.
//
// **Counted from what is on screen rather than from what was asked for**, which is
// `widen`'s own correction and it is needed here for a sharper reason: the montage
// opens at twelve and the median person has three faces, so the asked-for number is
// usually above the available one. A press counted from twelve would spend itself
// closing that gap -- the first widen visibly did nothing and the next narrow then
// jumped from every face to one.
function widenFaces(by) {
  const one = subject();
  const current = Math.min(faces, one.faces.length);
  // `by` may be Infinity, which is every face, or -Infinity, which is back to one.
  const next = Math.min(Math.max(current + by, 1), one.faces.length);
  if (next === current) return;
  faces = next;
  redrawPerson();
}

// One draw per animation frame, `redraw`'s reason and its measurement: a held key
// repeats about thirty times a second and a montage can hold a hundred and twenty
// frames, so drawing once per press is quadratic work on a growing DOM.
let settlingPerson = false;
function redrawPerson() {
  if (settlingPerson) return;
  settlingPerson = true;
  requestAnimationFrame(() => {
    settlingPerson = false;
    drawPerson();
  });
}

const PEOPLE_KEYS = {
  f: () => judgePerson("friend"),
  s: () => judgePerson("stranger"),
  u: () => judgePerson("unsure"),
  2: () => judgePerson("two-people"),
  l: () => toPerson(1),
  h: () => toPerson(-1),
  ArrowRight: () => toPerson(1),
  ArrowLeft: () => toPerson(-1),
  // One at a time, the stack mode's step and for its reason: the median person
  // here has three faces, so a coarser step would take every narrow straight to
  // one. The person with a hundred and twenty is what `g` is for.
  k: () => widenFaces(1),
  j: () => widenFaces(-1),
  g: () => widenFaces(Infinity),
  0: () => widenFaces(-Infinity),
  "=": () => widenFaces(1),
  "+": () => widenFaces(1),
  "-": () => widenFaces(-1),
  _: () => widenFaces(-1),
};

function pressedInPeople(event) {
  if (!subject()) return;
  const pressed = PEOPLE_KEYS[event.key] || PEOPLE_KEYS[event.key.toLowerCase()];
  if (!pressed) return;
  event.preventDefault();
  pressed();
}

function nobody() {
  stage.replaceChildren();
  const done = document.createElement("p");
  done.className = "done";
  done.textContent =
    "nobody to judge: either the people pass has not run, or no person appears in" +
    " some frames of a stack and not others — which would mean the case this mode" +
    " exists to catch does not happen in this library.";
  stage.append(done);
  about.textContent = "";
  said.textContent = "";
  count.textContent = "no people to judge";
}

// --- the two modes ----------------------------------------------------------

async function into(next) {
  mode = next;
  // Assigning the hash rather than pushing state: a mode is where the reader is
  // and not somewhere they navigated to, so the back button should leave the
  // harness rather than walk the modes.
  history.replaceState(
    null,
    "",
    next === "people" ? "#people" : location.pathname + location.search
  );
  for (const [name, button] of Object.entries(modes)) {
    button.classList.toggle("on", name === mode);
    button.setAttribute("aria-pressed", String(name === mode));
  }
  for (const [name, block] of Object.entries(legends)) block.hidden = name !== mode;
  if (mode === "people") {
    if (!crowd) crowd = await (await fetch("/api/persons")).json();
    // The switch may have moved again while that was in flight -- the first entry
    // into either mode is a fetch, and two clicks fit inside one. Whoever set
    // `mode` last is the mode the reader is in, so a resumed continuation that no
    // longer matches it draws nothing rather than drawing over the other mode.
    if (mode !== "people") return;
    if (!crowd.persons.length) return nobody();
    faces = faces || crowd.montage;
    drawPerson();
    return;
  }
  if (!sample) {
    // The first set arrives with this response: the server draws one when the
    // sitting has none, so opening the page is the first request and there is
    // nothing to wait for behind it.
    sample = await (await fetch("/api/sets")).json();
  }
  if (mode !== "stacks") return;
  if (!sample.sets.length) {
    count.textContent = "no sets to judge";
    stage.replaceChildren();
    about.textContent = "";
    return;
  }
  step(0);
}

modes.stacks.addEventListener("click", () => into("stacks"));
modes.people.addEventListener("click", () => into("people"));

into(mode);
