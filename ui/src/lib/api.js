// Every call the client makes, in one place, plus the two guards that keep a
// 250 ms endpoint usable behind a text field.

// Only undefined and null are dropped, never the empty string. `ext = ''` is a
// real predicate covering 641,764 paths in this corpus — the files with no
// extension — and treating "" as absent would make screen 2's largest row the
// one row you cannot click.
/** @param {Record<string, any>} params */
function query(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) search.set(key, String(value));
  }
  const text = search.toString();
  return text ? "?" + text : "";
}

async function get(path, params = {}) {
  const response = await fetch(path + query(params));
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`${path} ${response.status}${body.error ? " (" + body.error + ")" : ""}`);
  }
  return response.json();
}

async function post(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${path} ${response.status}${body.error ? " (" + body.error + ")" : ""}`);
  }
  return body;
}

// A candidate rule as the query string the read endpoints parse. `is null`
// carries no value and `in` arrives comma-joined, which is what triage_api's
// own parser expects — the split happens server side.
export function candidateParams(rule) {
  if (!rule) return {};
  return {
    column: rule.column,
    op: rule.op,
    value: Array.isArray(rule.value) ? rule.value.join(",") : rule.value,
    decision: rule.decision,
  };
}

export const api = {
  // --- reads
  photos: (params) => get("/api/photos", params),

  // Paths and bytes, 216-297 ms over the full corpus. The only call on the
  // keystroke path.
  counts: (rule, at) => get("/api/triage/counts", { ...candidateParams(rule), at }),

  // Distinct content, ~2.9 s. Once per screen, never per keystroke.
  files: () => get("/api/triage/files"),

  screen: (name, params = {}) => get("/api/triage/screen", { name, ...params }),

  // One directory node's still-kept children. Lazy per node because there are
  // 315,680 directories and the tree only ever shows the opened ones: 23-54 ms
  // for an ordinary node, and 1.7-3.3 s for the root and the two arch backups,
  // which hold most of those directories between them.
  tree: (path) => get("/api/triage/tree", { path }),

  page: (rule, cursor, limit = 500) =>
    get("/api/triage/page", { ...candidateParams(rule), limit, ...(cursor || {}) }),

  // How much work the probe has. It does not run the probe: that opens files on
  // the USB HDD and writes the catalog, neither of which belongs in a request.
  probe: () => get("/api/triage/probe"),

  // --- writes, all of which land in state.sqlite3 and nowhere else
  addRule: (rule, at) => post("/api/triage/rules/add", { ...rule, at }),
  deleteRule: (id) => post("/api/triage/rules/delete", { id }),
  moveRule: (id, at) => post("/api/triage/rules/move", { id, at }),
  override: (sha256, decision) => post("/api/triage/override", { sha256, decision }),

  // --- the one surface that leaves the process
  revealPhoto: (id) => post("/api/reveal", { id }),
  revealOrigin: (origin) => post("/api/reveal", { origin }),
};

/** Drops any response that a newer request has already overtaken. */
export function sequencer() {
  let issued = 0;
  let settled = 0;
  return async function run(work) {
    const mine = ++issued;
    const value = await work();
    if (mine <= settled) return { stale: true, value: undefined };
    settled = mine;
    return { stale: false, value };
  };
}

/** Trailing-edge debounce. The counts endpoint is 250 ms; typing is faster. */
export function debounce(fn, ms) {
  let timer = 0;
  const wrapped = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  wrapped.cancel = () => clearTimeout(timer);
  wrapped.now = (...args) => {
    clearTimeout(timer);
    fn(...args);
  };
  return wrapped;
}

const UNITS = ["B", "KB", "MB", "GB", "TB"];

/** Decimal GB, as PLAN.md's tables use. */
export function bytes(value) {
  let size = Number(value) || 0;
  let unit = 0;
  while (size >= 1000 && unit < UNITS.length - 1) {
    size /= 1000;
    unit++;
  }
  return `${size < 10 && unit > 0 ? size.toFixed(2) : Math.round(size).toLocaleString()} ${UNITS[unit]}`;
}

export function count(value) {
  return (Number(value) || 0).toLocaleString();
}
