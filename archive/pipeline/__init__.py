"""The one-shot build pipeline that produced the vault, kept as a record.

Every module here ran to completion between 2026-08-01 and 2026-08-07 and is not
needed to serve the grid. They stay importable and tested rather than frozen,
because the deferred work in `PLAN.md` "Open decisions" 5 -- a procedure for
adding photos after the build -- will reuse `decode`, `features` and `phase2b`.

Shared infrastructure stayed behind in `photolib`: `config`, `db`, `migrate`,
`triage` and `reveal` are imported from there, not duplicated here.
"""
