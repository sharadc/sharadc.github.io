#!/usr/bin/env python3
"""Generate the computed tables for Prime Games I.

The script intentionally has no third-party dependencies. It prints the
markdown tables used by source/_posts/prime-games-1.md.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import isqrt
from typing import Callable, Iterable


LIMITS_100_TO_10000 = (100, 1_000, 10_000)
QN_LIMITS = (100, 1_000, 10_000, 100_000)
Q_VALUES = (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 24, 30, 60)
SELECTED_Q_VALUES = (1, 2, 3, 4, 6, 10, 30)


def ceil_sqrt(n: int) -> int:
    """Return ceil(sqrt(n)) for positive integers."""
    return isqrt(n - 1) + 1


def ceil_log2(n: int) -> int:
    """Return ceil(log2(n)) for positive integers."""
    if n <= 1:
        return 0
    return (n - 1).bit_length()


def fmt(n: int) -> str:
    return f"{n:,}"


def dollars(text: str) -> str:
    return f"${text}$"


def count_at(primes: list[int], limit: int) -> int:
    # The prime lists are small enough that a direct count keeps the script
    # dependency-free and clear.
    return sum(1 for n in primes if n <= limit)


def markdown_values(values: Iterable[int]) -> str:
    return dollars(",".join(str(value) for value in values))


def primes_from_hits(hit: list[bool]) -> list[int]:
    return [n for n in range(1, len(hit)) if not hit[n]]


def qn_plus_one_prime_indices(limit: int, q: int) -> list[int]:
    """Game-prime indices for a_n = qn + 1 and mu(i,j) = qij + i + j."""
    hit = [False] * (limit + 1)
    for i in range(1, limit + 1):
        # q*i*j + i + j <= limit  =>  j <= (limit - i) / (q*i + 1)
        j_max = (limit - i) // (q * i + 1)
        if j_max < 1:
            break
        for j in range(1, j_max + 1):
            hit[q * i * j + i + j] = True
    return primes_from_hits(hit)


def additive_prime_indices(limit: int) -> list[int]:
    hit = [False] * (limit + 1)
    for n in range(2, limit + 1):
        hit[n] = True
    return primes_from_hits(hit)


def shifted_additive_prime_indices(limit: int) -> list[int]:
    hit = [False] * (limit + 1)
    for n in range(3, limit + 1):
        hit[n] = True
    return primes_from_hits(hit)


def sum_surcharge_prime_indices(
    limit: int,
    surcharge: Callable[[int], int],
) -> list[int]:
    """Primes for mu(i,j) = i + j + f(i + j)."""
    hit = [False] * (limit + 1)
    for s in range(2, limit + 1):
        k = s + surcharge(s)
        if k <= limit:
            hit[k] = True
    return primes_from_hits(hit)


def pair_sum_prime_indices(
    limit: int,
    transform: Callable[[int], int],
) -> list[int]:
    """Primes for mu(i,j) = t(i) + t(j), using a bitset convolution."""
    values = []
    value_bits = 0
    for i in range(1, limit + 1):
        value = transform(i)
        if value > limit:
            break
        values.append(value)
        value_bits |= 1 << value

    hit_bits = 0
    clip = (1 << (limit + 1)) - 1
    for value in values:
        hit_bits |= (value_bits << value) & clip

    return [n for n in range(1, limit + 1) if not ((hit_bits >> n) & 1)]


def mark_interval(diff: list[int], start: int, end: int) -> None:
    if start > end:
        return
    start = max(start, 1)
    end = min(end, len(diff) - 2)
    if start <= end:
        diff[start] += 1
        diff[end + 1] -= 1


def primes_from_intervals(limit: int, intervals: Iterable[tuple[int, int]]) -> list[int]:
    diff = [0] * (limit + 2)
    for start, end in intervals:
        mark_interval(diff, start, end)

    primes = []
    active = 0
    for n in range(1, limit + 1):
        active += diff[n]
        if active == 0:
            primes.append(n)
    return primes


def _complete_additive_sqrt_product_prime_indices(limit: int) -> list[int]:
    """Complete scan for mu(i,j) = i + j + ceil(sqrt(ij))."""
    diff = [0] * (limit + 2)

    for i in range(1, limit + 1):
        if i + 1 + ceil_sqrt(i) > limit:
            break

        j = 1
        while True:
            c = ceil_sqrt(i * j)
            j_end = (c * c) // i
            start = i + j + c
            if start > limit:
                break
            end = min(i + j_end + c, limit)
            mark_interval(diff, start, end)
            j = j_end + 1

    primes = []
    active = 0
    for n in range(1, limit + 1):
        active += diff[n]
        if active == 0:
            primes.append(n)
    return primes


def additive_sqrt_product_prime_indices(limit: int) -> list[int]:
    """Primes for mu(i,j) = i + j + ceil(sqrt(ij))."""
    hit = [False] * (limit + 1)

    # For the table limit used in the post, factors 1, 2, and 3 already
    # cover every composite index in this family. Keep a complete fallback so
    # larger future limits cannot silently undercount.
    for i in range(1, min(3, limit) + 1):
        for j in range(1, limit + 1):
            k = i + j + ceil_sqrt(i * j)
            if k > limit:
                break
            hit[k] = True

    primes = primes_from_hits(hit)
    expected = [n for n in (1, 2, 4) if n <= limit]
    if primes == expected:
        return primes
    return _complete_additive_sqrt_product_prime_indices(limit)


def additive_log_product_prime_indices(limit: int) -> list[int]:
    """Primes for mu(i,j) = i + j + ceil(log2(ij + 1))."""
    diff = [0] * (limit + 2)

    for i in range(1, limit + 1):
        if i + 1 + ceil_log2(i + 1) > limit:
            break

        c = ceil_log2(i + 1)
        while True:
            lower = 0 if c == 0 else (1 << (c - 1)) - 1
            upper = (1 << c) - 1
            j_start = lower // i + 1
            j_end = upper // i
            start = i + j_start + c
            if start > limit:
                break
            end = min(i + j_end + c, limit)
            mark_interval(diff, start, end)
            c += 1

    primes = []
    active = 0
    for n in range(1, limit + 1):
        active += diff[n]
        if active == 0:
            primes.append(n)
    return primes


def max_sum_surcharge_prime_indices(
    limit: int,
    min_surcharge: Callable[[int], int],
    max_surcharge: Callable[[int], int],
) -> list[int]:
    """Primes for mu(i,j) = max(i,j) + f(i+j), where i <= j."""
    intervals = (
        (j + min_surcharge(j), j + max_surcharge(j))
        for j in range(1, limit + 1)
        if j + min_surcharge(j) <= limit
    )
    return primes_from_intervals(limit, intervals)


def _complete_max_sqrt_product_prime_indices(limit: int) -> list[int]:
    """Complete scan for mu(i,j) = max(i,j) + ceil(sqrt(ij))."""
    hit = [False] * (limit + 1)

    for j in range(1, limit + 1):
        if j + ceil_sqrt(j) > limit:
            break
        for i in range(1, j + 1):
            k = j + ceil_sqrt(i * j)
            if k > limit:
                break
            hit[k] = True

    return primes_from_hits(hit)


def max_sqrt_product_prime_indices(limit: int) -> list[int]:
    """Primes for mu(i,j) = max(i,j) + ceil(sqrt(ij))."""
    hit = [False] * (limit + 1)

    # As above, factors 1, 2, and 3 cover the blog's N <= 10000 table.
    # The complete fallback preserves correctness if this script is extended.
    for i in range(1, min(3, limit) + 1):
        for j in range(i, limit + 1):
            k = j + ceil_sqrt(i * j)
            if k > limit:
                break
            hit[k] = True

    primes = primes_from_hits(hit)
    expected = [n for n in (1, 3) if n <= limit]
    if primes == expected:
        return primes
    return _complete_max_sqrt_product_prime_indices(limit)


def max_log_product_prime_indices(limit: int) -> list[int]:
    """Primes for mu(i,j) = max(i,j) + ceil(log2(ij + 1))."""
    hit = [False] * (limit + 1)

    for j in range(1, limit + 1):
        if j + ceil_log2(j + 1) > limit:
            break

        c = ceil_log2(j + 1)
        c_max = ceil_log2(j * j + 1)
        while c <= c_max:
            lower = 0 if c == 0 else (1 << (c - 1)) - 1
            upper = (1 << c) - 1
            i_start = max(1, lower // j + 1)
            i_end = min(j, upper // j)
            k = j + c
            if k > limit:
                break
            if i_start <= i_end:
                hit[k] = True
            c += 1

    return primes_from_hits(hit)


@dataclass(frozen=True)
class ArtificialFamily:
    name: str
    rule: str
    prime_indices: Callable[[int], list[int]]


ARTIFICIAL_FAMILIES = (
    ArtificialFamily("Additive", "i+j", additive_prime_indices),
    ArtificialFamily("Shifted additive", "i+j+1", shifted_additive_prime_indices),
    ArtificialFamily(
        "Additive + sqrt-sum surcharge",
        r"i+j+\lceil\sqrt{i+j}\rceil",
        lambda limit: sum_surcharge_prime_indices(limit, ceil_sqrt),
    ),
    ArtificialFamily(
        "Additive + log-sum surcharge",
        r"i+j+\lceil\log_2(i+j)\rceil",
        lambda limit: sum_surcharge_prime_indices(limit, ceil_log2),
    ),
    ArtificialFamily(
        "Additive + separated sqrt surcharge",
        r"i+j+\lceil\sqrt{i}\rceil+\lceil\sqrt{j}\rceil",
        lambda limit: pair_sum_prime_indices(limit, lambda i: i + ceil_sqrt(i)),
    ),
    ArtificialFamily(
        "Additive + separated log surcharge",
        r"i+j+\lceil\log_2(i+1)\rceil+\lceil\log_2(j+1)\rceil",
        lambda limit: pair_sum_prime_indices(limit, lambda i: i + ceil_log2(i + 1)),
    ),
    ArtificialFamily(
        "Additive + sqrt-product surcharge",
        r"i+j+\lceil\sqrt{ij}\rceil",
        additive_sqrt_product_prime_indices,
    ),
    ArtificialFamily(
        "Additive + log-product surcharge",
        r"i+j+\lceil\log_2(ij+1)\rceil",
        additive_log_product_prime_indices,
    ),
    ArtificialFamily(
        "Max-base + sqrt-sum jump",
        r"\max(i,j)+\lceil\sqrt{i+j}\rceil",
        lambda limit: max_sum_surcharge_prime_indices(
            limit,
            lambda j: ceil_sqrt(j + 1),
            lambda j: ceil_sqrt(2 * j),
        ),
    ),
    ArtificialFamily(
        "Max-base + log-sum jump",
        r"\max(i,j)+\lceil\log_2(i+j+1)\rceil",
        lambda limit: max_sum_surcharge_prime_indices(
            limit,
            lambda j: ceil_log2(j + 2),
            lambda j: ceil_log2(2 * j + 1),
        ),
    ),
    ArtificialFamily(
        "Max-base + sqrt-product jump",
        r"\max(i,j)+\lceil\sqrt{ij}\rceil",
        max_sqrt_product_prime_indices,
    ),
    ArtificialFamily(
        "Max-base + log-product jump",
        r"\max(i,j)+\lceil\log_2(ij+1)\rceil",
        max_log_product_prime_indices,
    ),
)


def original_examples_table() -> str:
    q1_primes = qn_plus_one_prime_indices(10_000, 1)
    q2_primes = qn_plus_one_prime_indices(10_000, 2)
    q4_primes = qn_plus_one_prime_indices(10_000, 4)
    additive_primes = additive_prime_indices(10_000)

    rows = [
        (
            "Ordinary numbers",
            "n+1",
            "ij+i+j",
            q1_primes,
            [n + 1 for n in q1_primes[:12]],
        ),
        (
            "Odd numbers",
            "2n+1",
            "2ij+i+j",
            q2_primes,
            [2 * n + 1 for n in q2_primes[:12]],
        ),
        (
            r"$1 \pmod 4$ numbers",
            "4n+1",
            "4ij+i+j",
            q4_primes,
            [4 * n + 1 for n in q4_primes[:12]],
        ),
        (
            "Squares",
            "(n+1)^2",
            "ij+i+j",
            q1_primes,
            [(n + 1) ** 2 for n in q1_primes[:12]],
        ),
        (
            "Powers of two",
            "2^n",
            "i+j",
            additive_primes,
            [2],
        ),
    ]

    lines = [
        "| Game | Elements $a_n$ | Multiplier index rule $\\mu(i,j)$ | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | First few game-prime values |",
        "|---|---:|---:|---:|---:|---:|---|",
    ]
    for game, elements, rule, primes, values in rows:
        counts = [fmt(count_at(primes, limit)) for limit in LIMITS_100_TO_10000]
        lines.append(
            f"| {game} | {dollars(elements)} | {dollars(rule)} | "
            f"{counts[0]} | {counts[1]} | {counts[2]} | {markdown_values(values)} |"
        )
    return "\n".join(lines)


def qn_plus_one_table() -> str:
    prime_lists = {
        q: qn_plus_one_prime_indices(max(QN_LIMITS), q)
        for q in Q_VALUES
    }

    lines = [
        "| $q$ | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | $P_{100000}$ |",
        "|---:|---:|---:|---:|---:|",
    ]
    for q in Q_VALUES:
        counts = [fmt(count_at(prime_lists[q], limit)) for limit in QN_LIMITS]
        lines.append(f"| {q} | {counts[0]} | {counts[1]} | {counts[2]} | {counts[3]} |")
    return "\n".join(lines)


def selected_qn_plus_one_primes_table() -> str:
    lines = [
        "| $q$ | Universe | First few game-prime values |",
        "|---:|---|---|",
    ]
    for q in SELECTED_Q_VALUES:
        primes = qn_plus_one_prime_indices(200, q)
        universe = "1,2,3,4,5,\\dots" if q == 1 else f"1,{q + 1},{2 * q + 1},{3 * q + 1},{4 * q + 1},\\dots"
        values = [q * n + 1 for n in primes[:12]]
        lines.append(f"| {q} | {dollars(universe)} | {markdown_values(values)} |")
    return "\n".join(lines)


def artificial_index_table() -> str:
    lines = [
        "| Family | Multiplier rule $\\mu(i,j)$ | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | First game-prime indices |",
        "|---|---:|---:|---:|---:|---|",
    ]
    for family in ARTIFICIAL_FAMILIES:
        primes = family.prime_indices(max(LIMITS_100_TO_10000))
        counts = [fmt(count_at(primes, limit)) for limit in LIMITS_100_TO_10000]
        lines.append(
            f"| {family.name} | {dollars(family.rule)} | "
            f"{counts[0]} | {counts[1]} | {counts[2]} | {markdown_values(primes[:12])} |"
        )
    return "\n".join(lines)


def main() -> None:
    print("## 2. Original examples")
    print()
    print(original_examples_table())
    print()
    print("## 3. The $qn+1$ family")
    print()
    print("### Simulation: $qn+1$ worlds")
    print()
    print(qn_plus_one_table())
    print()
    print("### First game-primes in selected $qn+1$ worlds")
    print()
    print(selected_qn_plus_one_primes_table())
    print()
    print("## 5. Index-only multiplier games")
    print()
    print("### Simulation: artificial index multipliers")
    print()
    print(artificial_index_table())


if __name__ == "__main__":
    main()
