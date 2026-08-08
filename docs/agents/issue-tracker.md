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
4. **Branch.** `git switch -c <n>-<short-slug>` off the current branch. Never build on `main`.
5. **Build it,** to the ticket's acceptance criteria and no further. A criterion that turns out
   to be wrong is a comment on the issue and a stop, not a quiet re-scope.
6. **Commit and push** under the etiquette in CLAUDE.md — at the end, unasked, checking
   `git status` rather than `git add -A`.
7. **Close it.** `gh issue close <n> --comment "..."` naming the branch and what a reader can
   now see. Closing is what unblocks the dependents: GitHub counts open blockers only, so a
   closed ticket drops its dependents' `blocked_by` on its own. Nothing else needs editing —
   in particular, do not touch another ticket's body to record that this one is done.

Leave the issue open, assigned, with a comment saying where it got to, if the work stops
half-finished. An open ticket with a note is recoverable; a closed one that did not ship is not.

## Two tickets at once

Two sessions in one working tree share an index and a `HEAD`. One's commit sweeps up the
other's half-finished files, `git switch` moves the floor under both, and neither session's
`git status` describes anything real. So the second concurrent ticket gets its own worktree:

```bash
git worktree add ../photos-<n> -b <n>-<short-slug>
```

Independent tickets are still not free of each other. Two things collide even in separate
worktrees, and both are physical rather than textual:

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
