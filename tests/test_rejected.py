"""Tests for the measurement that matches what the fingerprint screen rejected.

**The measurement itself is run by hand and its numbers go in ADR 0003, not in an
assertion** -- they describe real photographs, and no photograph appears in this
suite. What is under test is the arithmetic around them: which of the rejected
pairs count as recovered at a strictness, and what an undecodable substrate does
to the report rather than to the score.

Nothing here opens a substrate, a catalog, or a path from `config.toml`.
"""

from __future__ import annotations

from harness import rejected


def scored(points: int | None, cosine: float = 0.2, unreadable: str | None = None):
    return rejected.Scored(
        early="a" * 64, late="b" * 64, cosine=cosine, points=points, unreadable=unreadable
    )


def test_a_rejected_pair_counts_as_recovered_only_once_it_reaches_the_strictness() -> None:
    """ADR 0003's whole reasoning for leaving the screen alone: a pair the screen
    turned away only helps the grid if its Match then clears the reader's
    threshold. The reasoning did not change; the threshold did."""
    pairs = [scored(4), scored(10), scored(413)]

    assert [one.points for one in rejected.clearing(pairs, 10)] == [10, 413]
    assert [one.points for one in rejected.clearing(pairs, 20)] == [413]


def test_a_pair_whose_substrate_would_not_decode_is_never_counted_as_recovered() -> None:
    """A pair nothing could look at is not a pair that was looked at and disagreed.
    It is a hole in the derivative tree, which is a different fix from the screen."""
    pairs = [scored(None, unreadable="cannot identify image file"), scored(50)]

    assert rejected.clearing(pairs, 10) == [pairs[1]]
    assert "1 would not decode" in "\n".join(rejected.report(pairs, 10))
    assert "cannot identify image file" in "\n".join(rejected.report(pairs, 10))


def test_the_distribution_leaves_out_what_would_not_decode() -> None:
    """Averaging a hole in as a zero would read as "checked and agreed on nothing",
    which is the one distinction `photolib.matches` is careful to keep."""
    assert rejected.distribution([scored(None)]) == "nothing decoded"
    said = rejected.distribution([scored(None), scored(0), scored(8)])
    assert "median 4" in said and "1 agreeing on none" in said


def test_nothing_reaching_the_strictness_is_said_plainly() -> None:
    """The answer ADR 0003 expected, and it has to be printable: if the rejected
    pairs would not have agreed either, loosening the screen buys the grid nothing
    and the report should say so rather than print an empty list."""
    said = "\n".join(rejected.report([scored(3), scored(9)], 10))

    assert "buys the grid nothing at this strictness" in said


def test_the_loosest_screen_that_recovers_them_is_read_off_the_pairs_themselves() -> None:
    """Not swept and not guessed: it is the weakest cosine among the pairs that
    would actually have earned a Match, so it is the reader's own answers deciding
    what a looser screen would have to be."""
    said = "\n".join(rejected.report([scored(50, cosine=0.31), scored(50, cosine=0.18)], 10))

    assert "a screen of 0.180 reaches every one of them" in said
