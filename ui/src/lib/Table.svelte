<script>
  // One screen's aggregate rows. Clicking a row is what builds the candidate
  // predicate and loads the contact sheet for it.
  import { bytes, count } from "./api.js";
  import { decisionOf } from "./screens.js";

  let {
    rows = [],
    screen,
    rules = [],
    root = null,
    selected = null,
    onpick,
    checked = new Set(),
    oncheck,
  } = $props();

  // No checkbox where a row cannot become a rule: screen 0 lists the rule set
  // itself and screen 5 is a sort. A box there would offer an action that has
  // nowhere to land.
  const boxes = $derived(screen.rule !== false);

  function label(row) {
    return screen.label ? screen.label(row) : row.key;
  }

  // Which rows the saved rule set has already decided. Derived rather than
  // called from the markup: `toRule` allocates, a leaderboard is 200 rows, and
  // this only changes when the rows or the rule set do. Screen 5 sorts and
  // saves nothing, so it is skipped rather than asked a question with one
  // answer.
  const marks = $derived(
    new Map(
      rows.map((row) => [
        row.key,
        screen.rule === false ? null : decisionOf(rules, screen.toRule(row, root)),
      ]),
    ),
  );

  const MARK = { exclude: "✕", include: "✓" };
  const TITLE = {
    exclude: "a saved rule excludes this item",
    include: "a saved rule keeps this item",
  };
</script>

{#if rows.length}
  <table class="agg">
    <thead>
      <tr>
        {#if boxes}<th class="box"><span class="hide">select</span></th>{/if}
        <th>{screen.heading[0] ?? ""}</th>
        <th class="num">paths</th>
        <th class="num">bytes</th>
        {#if screen.heading[1]}<th class="num">{screen.heading[1]}</th>{/if}
      </tr>
    </thead>
    <tbody>
      {#each rows as row, i (row.key)}
        {@const mark = marks.get(row.key)}
        <tr
          class:picked={selected === row.key}
          class:clickable={screen.sheet !== false}
          onclick={() => onpick(row)}
        >
          {#if boxes}
            {@const on = checked.has(row.key)}
            <td class="box">
              <!-- A button with role=checkbox rather than <input type=checkbox>.
                   An input's `checked` attribute only writes defaultChecked, and
                   once the box has been clicked its dirty flag means the
                   attribute no longer drives what is painted — so the tick never
                   appeared even though the selection was correct. A class and a
                   glyph are written unconditionally and cannot desynchronise.
                   stopPropagation keeps the row click — which builds a single
                   candidate — out of the way. -->
              <button
                type="button"
                class="tick"
                class:on
                role="checkbox"
                aria-checked={on}
                aria-label="select {label(row)}"
                title="Select for a bulk exclude. Shift-click to extend from the last box you clicked."
                onclick={(event) => {
                  event.stopPropagation();
                  oncheck(row, i, event.shiftKey);
                }}>{on ? "✓" : ""}</button
              >
            </td>
          {/if}
          <td class="key">
            <span
              class="mark"
              class:exclude={mark === "exclude"}
              class:include={mark === "include"}
              title={TITLE[mark] ?? ""}>{MARK[mark] ?? ""}</span
            >{label(row)}
            {#if row.scope === "whole inventory"}
              <span class="scope" title="From the survey-time rollup over the whole inventory. It does not move as you edit — re-costing it live is 1.9-3.2 s.">whole inventory</span>
            {/if}
          </td>
          <td class="num">{count(row.paths)}</td>
          <td class="num">{bytes(row.bytes)}</td>
          {#if screen.heading[1]}<td class="num">{row.detail ?? ""}</td>{/if}
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  .agg {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }

  th {
    text-align: left;
    font-weight: 500;
    color: var(--dim);
    border-bottom: 1px solid var(--line);
    padding: 3px 4px;
    position: sticky;
    top: 0;
    background: var(--panel);
  }

  td {
    padding: 2px 4px;
    border-bottom: 1px solid #202024;
    vertical-align: top;
  }

  .num {
    text-align: right;
    white-space: nowrap;
  }

  .key {
    word-break: break-all;
  }

  .box {
    width: 20px;
    padding-right: 0;
    text-align: center;
  }

  /* Sized and coloured here in full: app.css's `button` rule is for the chrome,
     and its padding would make this 60px wide. */
  .tick {
    display: block;
    width: 14px;
    height: 14px;
    padding: 0;
    margin: 1px 0 0;
    font: inherit;
    font-size: 11px;
    line-height: 12px;
    text-align: center;
    color: transparent;
    background: #0c0c0e;
    border: 1px solid var(--line);
    border-radius: 2px;
  }

  .tick.on {
    color: #fff;
    background: var(--accent);
    border-color: var(--accent);
  }

  .tick:hover {
    border-color: var(--accent);
  }

  /* The header cell needs a name for the screen reader and no width from it. */
  .hide {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  /* Empty when no rule names the item, and still 1.2em wide: the marker column
     is what lets you read down the list, so it cannot appear and disappear. */
  .mark {
    display: inline-block;
    width: 1.2em;
  }

  .mark.exclude {
    color: var(--drop);
  }

  .mark.include {
    color: var(--keep);
  }

  tr.clickable {
    cursor: pointer;
  }

  tr.clickable:hover td {
    background: #202027;
  }

  tr.picked td {
    background: #23303f;
  }

  /* The scope badge is not decoration. Screen 1's leaderboard is costed over
     the whole inventory at survey time, so its numbers do not respond to the
     rules you are editing; the live number is the candidate's, next to the
     rule. Saying which is which on the row is the whole point. */
  .scope {
    display: inline-block;
    margin-left: 6px;
    padding: 0 4px;
    font-size: 10px;
    color: var(--dim);
    border: 1px solid var(--line);
    border-radius: 2px;
    white-space: nowrap;
  }
</style>
