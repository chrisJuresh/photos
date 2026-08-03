<script>
  // One screen's aggregate rows. Clicking a row is what builds the candidate
  // predicate and loads the contact sheet for it.
  import { bytes, count } from "./api.js";

  let { rows = [], screen, selected = null, onpick } = $props();

  function label(row) {
    return screen.label ? screen.label(row) : row.key;
  }
</script>

{#if rows.length}
  <table class="agg">
    <thead>
      <tr>
        <th>{screen.heading[0] ?? ""}</th>
        <th class="num">paths</th>
        <th class="num">bytes</th>
        {#if screen.heading[1]}<th class="num">{screen.heading[1]}</th>{/if}
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.key)}
        <tr
          class:picked={selected === row.key}
          class:clickable={screen.sheet !== false}
          onclick={() => onpick(row)}
        >
          <td class="key">
            {label(row)}
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
