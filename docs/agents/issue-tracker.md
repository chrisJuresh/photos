# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments` then keep only `authorAssociation` of `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE` (drop `OWNER`/`MEMBER`/`COLLABORATOR`).
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either — resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Working a ticket

When a request names a ticket — `#7`, an issue URL, "the overlay one" — do all of this
without being asked for any of it. The reader named a ticket; they did not ask to be
walked through `gh`.

1. **Read it.** `gh issue view <n> --comments`, and follow the links in the body. The ticket
   is the brief; the spec behind it is context, not a second set of instructions.
2. **Check it is startable.** `gh api repos/chrisJuresh/photos/issues/<n> --jq
   .issue_dependencies_summary.blocked_by` — anything above 0 means an open blocker. Say which
   one and stop, rather than building against a blocker's unwritten half.
3. **Claim it.** `gh issue edit <n> --add-assignee @me`. First write of the session, so an
   abandoned session still shows who was in it.
4. **Take your worktree.** Every ticket gets one — there is no contention check, because
   there is no case where the answer is "work in the main checkout". Nothing is written
   there, and a `PreToolUse` hook denies it.

   ```bash
   git worktree add .claude/worktrees/<n> -b <n>-<short-slug> <base>
   ```

   Then **enter it with `EnterWorktree`**, not with `cd` — the difference is enforcement, and
   "Entering versus cd-ing" below is why it matters.
5. **Branch off the right base.** `<base>` is the ticket's blocker where step 2 found one that
   is closed but not yet merged to `development`; otherwise `origin/development`. Never branch
   off "the current branch", and never build on `development` itself — a worktree sitting on
   the integration branch is denied writes for the same reason the main checkout is.
6. **Build it,** to the ticket's acceptance criteria and no further. A criterion that turns out
   to be wrong is a comment on the issue and a stop, not a quiet re-scope.
7. **Land it.** At the end, unasked, and all four steps: stage the paths you changed by name
   (`git status`, never `git add -A`), commit, `git push -u origin HEAD`,
   `gh pr create --base development --fill`, `gh pr merge --squash`. Committing is not
   delivering and neither is pushing — a branch nobody merged is a ticket nobody can close.
   The worktree is spent once its PR merges; the next ticket takes a new one.
8. **Close it.** `gh issue close <n> --comment "..."` naming the branch and what a reader can
   now see. Closing is what unblocks the dependents: GitHub counts open blockers only, so a
   closed ticket drops its dependents' `blocked_by` on its own. Nothing else needs editing —
   in particular, do not touch another ticket's body to record that this one is done.

Leave the issue open, assigned, with a comment saying where it got to, if the work stops
half-finished. An open ticket with a note is recoverable; a closed one that did not ship is not.

## Two tickets at once

Start from the honest position: `/implement` is one invocation, one ticket, and running several
side by side in one checkout is [explicitly unsupported][implement-faq] — the field reports
behind that are an amend landing on another session's commit, a stash disappearing, and commits
arriving on the wrong branch, all in one afternoon. Worktrees are the community workaround, not
a supported mode. This section is damage limitation for a thing that is worth doing carefully
and is not worth doing casually.

[implement-faq]: https://github.com/mattpocock/skills — `docs/engineering/implement.md`

Two sessions in one working tree share an index and a `HEAD`. One's commit sweeps up the
other's half-finished files, `git switch` moves the floor under both, and neither session's
`git status` describes anything real. Step 4 above is what keeps that from happening; the rest
of this section is what surrounds it.

### The guard, because the rule alone did not hold

This page's rules were written on 2026-08-08 and broken the same evening by three sessions that
had them available and did not read them. So they are enforced as well as written:
`.claude/settings.json` is committed, and its `PreToolUse` hook runs
[`.claude/hooks/worktree-guard.py`](../../.claude/hooks/worktree-guard.py).

That guard used to reason about who was in the tree — a claim registry, a liveness window,
a denial once a *second* writer showed up. It no longer asks. **Every write to the main
checkout is denied, always**, along with every git call that writes history there. There is
no contention check because there is no contended case: one writer in the main checkout is
one writer whose diff nobody reviewed and whose branch the next session's `git switch` moves
the floor under. The registry was machinery for a question that should not have been asked.

What it denies, in full: file edits anywhere in the main checkout; `git add`/`commit`/
`switch`/`checkout`/`reset`/`rebase`/`merge`/`clean`/`rm`/`mv` and friends there; edits in a
worktree that is sitting on `development`; edits in a worktree whose PR has already merged,
because a merged branch that grows a commit reaches nobody; and `git stash` everywhere. A
`Stop` hook refuses to end a session holding uncommitted or unpushed work, twice at most, so
"land it" in step 7 is not something anyone has to remember. It fails **open** on anything it
cannot read — no repo, no git, an unparseable payload — because blocking the only writer over
state it merely failed to read is the worse error. `CLAUDE_WORKTREE_GATE=off` turns it off
when it is wrong; `=warn` reports without denying.

Two limits worth knowing. **A git call's `-C` target is read textually and never expanded**,
so `git -C "$W" commit` is judged against the session's own tree; spell the path out when you
mean another one. And it only sees Claude's own tool calls — a person in an editor writes
without ever running it, and nothing here should stop them.

`/worktree-per-change` is the protocol in full, and
`.claude/worktree-per-change.json` is where `development` is named as the branch everything
merges into.

### Entering versus cd-ing

`git worktree add` isolates files. It does not stop a session reaching back into the tree it
came from, and reaching back is what actually goes wrong. Claude Code enforces the boundary
only for a worktree the session **entered** — with `EnterWorktree`, or by starting under
`claude --worktree`. From inside one, an `Edit`/`Write` targeting the main checkout, a command
whose working directory resolves there, and a git redirect into it via `git -C`, `--git-dir`,
`GIT_DIR`/`GIT_WORK_TREE` or a `cd` are each refused as a tool error. A worktree you only
`cd` into has none of that: every one of those still lands on the shared tree.

Create the worktree with git, because the base matters here, then enter that path.
`claude --worktree <name>` does both in one step but branches from the default branch —
`worktree.baseRef` chooses only between that and the local `HEAD`, never a named branch — and
the default branch is `main`, which is not what anything merges into. It is the wrong base for
every ticket here, and doubly wrong for one with a blocker. A path under `.claude/worktrees/` is
entered without a prompt; anywhere else asks first, since entering moves the session's working
directory, write access and project config along with it.

A worktree is a fresh checkout, so `ui/node_modules` is not in it. The committed `bundle.js`
and `bundle.css` mean the server still runs; only a ticket that edits `ui/src` needs its own
`npm install` there before `npm run build`.

### Getting it wrong

Never put back a `HEAD` you moved by accident. A session that finds it has moved the shared
tree — checked out a branch there, left it somewhere new — **says which command it ran and
stops.** It does not restore anything. "Back" is not knowable from inside one session: the
value you are trying to restore is another session's, you cannot see what that session had,
and a wrong guess silently swaps the files under a live worker. Two sessions each guessing
leaves the tree somewhere neither of them intended, with the second guess hiding the first.
The session that owns the branch is the only one that can put it back, and it can only do that
if it is told.

If a session realises mid-ticket that it has been sharing a tree, it moves rather than
finishes: **commit** what is genuinely its own — never stash it, see below — add a worktree off
the correct base, and carry on there. Sorting the branches out afterwards is far more expensive
than moving now, and the shared tree gets worse with every file written.

### Leave the work where it can be seen

**Removing a worktree is a merge-time action, not an end-of-prompt one.** Tearing it down when
the prompt ends is what makes the work vanish: the reply names a branch and the operator is left
with no files to open. Push the branch, **leave the directory**, and name its path in the reply.
It stands until the branch merges.

Sweep the merged ones at the *start* of a session instead, when nothing is in flight:

```bash
git branch --merged development --format='%(refname:short)|%(worktreepath)'
```

Any row with a path is a worktree whose branch is already in `development`. Remove the ones that
are yours with `git worktree remove`; another session's is its business even after its branch
merges, so leave those and say they are there.

**The session that wrote a change is the one that merges it back**, in step 7, before it stops.
It already holds the intent behind every hunk; batching four branches' conflicts onto one agent
at the end throws that away and makes it reconstruct what four sessions already knew.

Independent tickets are still not free of each other. Three things collide even in separate
worktrees:

- **`refs/stash`** — the stash is one stack for the whole repository, shared by every worktree.
  `git stash` in one worktree pushes onto another's entries and renumbers them, so a later
  `git stash pop` or `git stash drop` in *either* takes the wrong one. This is the one place a
  worktree looks like isolation and is not. **The guard denies `git stash` from every tree,
  unconditionally** — there is no "while another session is live" to check, because the wrong
  entry is taken whenever the second session arrives, which may be after you have gone. Commit
  instead — a commit belongs to your branch and cannot be popped by a stranger — and leave
  someone else's `stash@{0}` alone even when it looks redundant.
- **`G:`** — nothing else may touch it while a step that reads it runs, Explorer windows
  included. That is rule 1 territory, and it applies across sessions.
- **`E:`** — the catalog, the thumbnails and the substrates share one NVMe. A ticket
  measuring a page against a timing gate cannot trust its numbers while another ticket is
  copying gigabytes onto that drive. Take the measurement before the copy starts or after it
  finishes; the correctness gates are unaffected either way.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (`gh api` on the sub-issues endpoint). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: GitHub's **native issue dependencies** — the canonical, UI-visible representation. Add an edge with `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). GitHub reports `issue_dependencies_summary.blocked_by` (open blockers only — the live gate). Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (`issue_dependencies_summary.blocked_by > 0`, or an open issue in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee @me` — the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append a context pointer (gist + link) to the map's Decisions-so-far.
