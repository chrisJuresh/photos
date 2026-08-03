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
    margin-top: 14px;
    border-top: 1px solid var(--line);
    padding-top: 8px;
  }

  .head {
    font-size: 11px;
    letter-spacing: 0.08em;
    margin-bottom: 6px;
  }

  .empty {
    font-size: 12px;
  }

  .rule {
    border-left: 2px solid var(--keep);
    padding: 3px 0 3px 7px;
    margin-bottom: 4px;
    font-size: 12px;
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
    font-size: 11px;
    margin-top: 1px;
  }

  .pos {
    color: var(--dim);
    min-width: 1.5em;
  }

  .pred {
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
    padding: 0 6px;
    line-height: 1.5;
  }
</style>
