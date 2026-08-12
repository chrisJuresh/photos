"""The labelling harness and the reports over it. See `harness/label.py`.

**A standing tool, and not scaffolding.** It was written for the two rounds
`docs/adr/0003-stack-on-verified-match.md` asks for and it outlived them:
recalibrating the grid against the reader's taste is a recurring need, so the
screen that collects the labels and the reports that replay them live here for
good.

Nothing in `photolib/` imports this package and nothing here is reachable from
the shipped server. The arrow points one way, as it does from
`archive/pipeline/`: this reads `photolib`, `photolib` never reads this. That
separation is the whole of it -- it is not a countdown.
"""
