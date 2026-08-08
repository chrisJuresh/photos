<script>
  // The saved rule set, in evaluation order, with what each rule actually takes.
  //
  // This is the whole undo affordance and it is deliberately the whole of it: a
  // decision reverses by deleting the row that made it, and the survey it was
  // costed against is untouched. Moving matters as much as deleting — ordering
  // is what expresses "exclude this tree, except that subtree".
  import { bytes, count } from "./api.js";

  let { rules = [], unmatched = null, busy = false, ondelete, onmove } = $props();
</script>

<div class="rules">
  <div class="head">
    rule set <span class="muted">{rules.length} rules · top-down, first match wins</span>
  </div>
  {#if rules.length === 0}
    <div class="muted empty">No rules saved.</div>
  {/if}
  {#each rules as rule, index (rule.id)}
    <div class="rule" class:exclude={rule.decision === "exclude"}>
      <div class="row">
        <span class="pos">{index}</span>
        <span class="pred">{rule.predicate}</span>
        <span class="dec">{rule.decision}</span>
      </div>
      <div class="row sub muted">
        <span>{count(rule.paths)} paths</span>
        <span>{bytes(rule.bytes)}</span>
        <span class="spacer"></span>
        <button disabled={busy || index === 0} onclick={() => onmove(rule, index - 1)} title="move up"
          >↑</button
        >
        <button
          disabled={busy || index === rules.length - 1}
          onclick={() => onmove(rule, index + 1)}
          title="move down">↓</button
        >
        <button disabled={busy} onclick={() => ondelete(rule)} title="delete this rule">×</button>
      </div>
    </div>
  {/each}
  {#if unmatched}
    <div class="rule fallthrough">
      <div class="row">
        <span class="pos">–</span>
        <span class="pred">no rule matched</span>
        <span class="dec">kept</span>
      </div>
      <div class="row sub muted">
        <span>{count(unmatched.paths)} paths</span>
        <span>{bytes(unmatched.bytes)}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .rules {
    margin-top: var(--s-5);
    border-top: 1px solid var(--line);
    padding-top: var(--s-3);
  }

  .head {
    font-size: var(--fs-100);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dim);
    margin-bottom: var(--s-2);
  }

  .empty {
    font-size: var(--fs-200);
  }

  .rule {
    border-left: 2px solid var(--keep);
    padding: var(--s-1) 0 var(--s-1) var(--s-2);
    margin-bottom: 5px;
    font-size: var(--fs-200);
  }

  .rule.exclude {
    border-left-color: var(--drop);
  }

  .rule.fallthrough {
    border-left-style: dotted;
  }

  .row {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .row.sub {
    font-size: var(--fs-100);
    margin-top: 2px;
  }

  .pos {
    color: var(--dim);
    min-width: 1.6em;
    font-variant-numeric: tabular-nums;
  }

  /* The predicate is the rule, character for character. */
  .pred {
    font-family: var(--mono);
    word-break: break-all;
    flex: 1;
  }

  .dec {
    color: var(--dim);
  }

  .spacer {
    flex: 1;
  }

  .muted {
    color: var(--dim);
  }

  button {
    min-height: 0;
    padding: 1px 6px;
    font-size: var(--fs-100);
    line-height: 1.5;
    background: none;
    border-color: transparent;
    color: var(--dim);
  }

  button:hover:not(:disabled) {
    background: var(--raised);
    border-color: var(--line);
    color: var(--text);
  }
</style>
