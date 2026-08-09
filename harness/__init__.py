"""Scaffolding with a stated end of life. See `harness/label.py`.

Nothing in `photolib/` imports this package and nothing here is reachable from
the shipped server. The arrow points one way, as it does from
`archive/pipeline/`: this reads `photolib`, `photolib` never reads this. Deleting
the directory is how this ends.
"""
