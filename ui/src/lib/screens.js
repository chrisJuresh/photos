// The eight screens, in archive/PLAN.md's order, which is cheapest and most decisive
// first so the working set collapses fast.
//
// A screen is mostly data: which server aggregate feeds its table, and what
// clicking one of its rows means as a candidate rule. The two exceptions carry
// a flag rather than a special case in App.svelte:
//
//   screen 0 has no contact sheet   — you cannot look at a .d.ts
//   screen 5 has no rule            — messaging apps strip EXIF, so a missing
//                                     camera tag is not evidence of anything

export const PHOTOS_ROOT = "G:\\photos";

/** @typedef {{column: string, op: string, value: any, decision?: string}} Rule */

export const SCREENS = [
  {
    id: 0,
    name: "no_image_content",
    title: "No image content",
    blurb:
      "Every exclude rule in the set, and what each one takes. Shown so that " +
      "nothing is invisible — it starts as the nine categorical prefilter rules " +
      "and grows as you work.",
    sheet: false,
    rule: false,
    heading: ["rule", "decision"],
    toRule: () => null,
  },
  {
    id: 1,
    name: "containers",
    title: "Container directories",
    blurb:
      "The biggest single win. node_modules, .git, site-packages, .venv, .cache, " +
      "AppData, vendor, browser profiles — `home-chris arch backup` is 1,077,495 " +
      "files and is the target.",
    heading: ["directory name", "directories"],
    // The leaderboard is the survey-time rollup over the WHOLE inventory and
    // does not move as you type. Re-costing it live is 1.9-3.2 s because the
    // top 50 segments span 1,953,553 of the 2,894,845 rows in the segment
    // index, so it is offered as a button and never as a default.
    relive: "Re-cost against current rules (~2-3 s)",
    toRule: (row) => ({ column: "dir_segment", op: "=", value: row.key }),
  },
  {
    id: 2,
    name: "file_type",
    title: "File type",
    blurb: "Every extension still kept, with count and bytes. .gif, .webp and .bmp resolve in one click each.",
    heading: ["extension", ""],
    label: (row) => (row.key === "" ? "(no extension)" : row.key),
    toRule: (row) => ({ column: "ext", op: "=", value: row.key }),
  },
  {
    id: 3,
    name: "dimensions",
    title: "Dimensions",
    blurb:
      "The filter that actually kills the 54,899 .png. Nearly all UI and web " +
      "assets die at a long edge of 512 or less.",
    heading: ["long edge", ""],
    // Bands are cumulative because that is what one `long_edge <= N` rule
    // means: picking <=512 takes <=256 and <=64 with it. Saying so on the row
    // is cheaper than a range predicate nobody asked for.
    note: "Bands are cumulative: <=512 includes <=256 and <=64.",
    toRule: (row) => {
      if (row.key === "unknown") return { column: "long_edge", op: "is null", value: null };
      if (row.key === ">1024") return { column: "long_edge", op: ">", value: 1024 };
      return { column: "long_edge", op: "<=", value: Number(row.key.replace("<=", "")) };
    },
  },
  {
    id: 4,
    name: "exact_dimensions",
    title: "Exact-dimension clusters",
    blurb:
      "Screenshots pile up hard at your screen and phone resolutions. This is " +
      "what separates 'these 4,000 are all 1920x1080' in one action.",
    heading: ["width x height", ""],
    toRule: (row) => ({ column: "dims", op: "=", value: row.key }),
  },
  {
    id: 5,
    name: "camera",
    title: "EXIF camera presence",
    blurb:
      "A sort, not a filter. Messaging apps strip EXIF, so the absence of a " +
      "camera tag is not evidence of anything — use it to order the remainder " +
      "for review, folder by folder.",
    rule: false,
    heading: ["camera tag", ""],
    // No saved rule, but the rows still route into the sheet: that is the
    // ordering this screen exists to provide.
    toRule: (row) => ({
      column: "camera",
      op: "=",
      value: row.key === "exif camera" ? 1 : 0,
    }),
  },
  {
    id: 6,
    name: "source_folder",
    title: "Source folder",
    blurb:
      "The eight trees, then the second level. Accept lumix\\DCIM and usb f\\DCIM " +
      "(189 GB, pure camera) wholesale; scrutinise the backup trees.",
    heading: ["folder", ""],
    drill: true,
    toRule: (row, root) => ({
      column: "dir_under",
      op: "=",
      value: root ? `${PHOTOS_ROOT}\\${root}\\${row.key}` : `${PHOTOS_ROOT}\\${row.key}`,
    }),
  },
  {
    id: 7,
    name: "undecided",
    title: "Everything still undecided",
    blurb:
      "The remainder, as a plain contact sheet. Nothing reaches the vault " +
      "without having been seen at thumbnail scale at least once.",
    table: false,
    heading: [],
    toRule: () => null,
  },
  {
    id: 8,
    name: "directory_tree",
    title: "Directory tree",
    blurb:
      "What is left of the folder structure, expanded one level at a time. A " +
      "folder only appears while it still holds something, so excluding one " +
      "removes it from the tree — which is what makes this readable as a " +
      "shrinking list of places still to decide. Biggest first, not alphabetical.",
    // The tree is this screen's picker, so there is no aggregate table and the
    // contact sheet waits for a folder to be clicked rather than paging the
    // whole remainder the way screen 7 does.
    table: false,
    tree: true,
    heading: [],
    // Whatever the tree hands back is already the lowercased form a `dir_under`
    // rule stores, so the row's own path is the value unchanged.
    toRule: (row) => ({ column: "dir_under", op: "=", value: row.key }),
  },
];

/**
 * The directory one path sits in, or '' if excluding it would be too much.
 *
 * Too much is anything not strictly below `PHOTOS_ROOT`: a tile sitting directly
 * in `G:\photos` would otherwise offer "exclude the entire library" as a
 * one-click button on a photograph, which is not a thing a corner chip should be
 * able to do. Both separators are looked for because a path is only guaranteed
 * to be what the walk recorded.
 */
export function folderOf(path) {
  const at = Math.max(path.lastIndexOf("\\"), path.lastIndexOf("/"));
  if (at <= 0) return "";
  const dir = path.slice(0, at);
  const root = PHOTOS_ROOT.toLowerCase();
  return dir.toLowerCase().startsWith(root + "\\") ? dir : "";
}

/**
 * Is `dir` one of `dirs`, or below one of them?
 *
 * `dirs` are already lowercased and stripped of a trailing separator; `dir` is
 * lowercased here. This *is* coverage rather than the exact identity
 * `decisionOf` settles for, and affordably so: a `dir_under` rule is a subtree
 * by definition, and there are a handful of them against one string compare
 * each.
 */
export function isUnder(dirs, dir) {
  const key = dir.toLowerCase();
  return dirs.some((d) => key === d || key.startsWith(d + "\\"));
}

export function describe(rule) {
  if (!rule) return "everything still kept";
  if (rule.op === "is null") return `${rule.column} is null`;
  return `${rule.column} ${rule.op} ${JSON.stringify(rule.value)}`;
}

// Values compare case-insensitively because the engine lowercases them before
// it compares: `ext = '.PNG'` and `ext = '.png'` are one rule, not two. `is
// null` carries null on both sides, which is screen 3's `unknown` band.
function sameValue(a, b) {
  if (typeof a === "string" && typeof b === "string") return a.toLowerCase() === b.toLowerCase();
  return a === b;
}

/**
 * The saved rule set's decision on one item, or null if no rule names it.
 *
 * Screen 1's leaderboard is the survey-time rollup over the whole inventory, so
 * a segment you excluded five minutes ago is still on it with its original
 * numbers — without this there is nothing on the row to say you already decided
 * it. The other screens list only what is still kept, so what shows there is
 * mostly `include` and the absence of a mark.
 *
 * This is exact predicate identity and deliberately not coverage: a row whose
 * whole tree some *other* rule already took is not marked, because answering
 * that is screen 1's 1.9-3.2 s live re-cost and this is meant to cost nothing.
 *
 * @param {Array<{term?: Rule, decision: string}>} rules
 * @param {Rule | null} term
 */
export function decisionOf(rules, term) {
  if (!term) return null;
  const found = rules.find(
    (rule) =>
      rule.term &&
      rule.term.column === term.column &&
      rule.term.op === term.op &&
      sameValue(rule.term.value, term.value),
  );
  return found ? found.decision : null;
}
