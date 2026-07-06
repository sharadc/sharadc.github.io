#!/usr/bin/env python3
"""Generate the computed tables for Prime Games II.

The script intentionally has no third-party dependencies. It prints the
markdown tables used by source/_posts/prime-games-2.md.
"""

from __future__ import annotations


LIMITS = (100, 1_000, 10_000)
Q_VALUES = (1, 2, 3, 4, 6, 12, 30)
ACM_VALUES = (
    (4, 6),
    (3, 6),
    (6, 10),
    (4, 12),
    (9, 12),
    (6, 15),
    (10, 15),
    (16, 24),
)


def count_at(indices: list[int], limit: int) -> int:
    return sum(1 for n in indices if n <= limit)


def join_values(values: list[int]) -> str:
    return ", ".join(str(value) for value in values)


def qn_plus_one_atom_indices(limit: int, q: int) -> list[int]:
    """Atom indices for a_n = 1 + qn and mu(i,j) = i + j + qij."""
    composite = [False] * (limit + 1)
    for i in range(1, limit + 1):
        # q*i*j + i + j <= limit  =>  j <= (limit - i) / (q*i + 1)
        j_max = (limit - i) // (q * i + 1)
        if j_max < 1:
            break
        for j in range(1, j_max + 1):
            composite[q * i * j + i + j] = True
    return [n for n in range(1, limit + 1) if not composite[n]]


def arithmetical_congruence_atom_indices(limit: int, a: int, b: int) -> list[int]:
    """Atom indices for M_{a,b} = {1} union {a, a+b, a+2b, ...}."""
    composite = [False] * (limit + 1)
    top_value = a + b * (limit - 1)

    for i in range(1, limit + 1):
        left = a + b * (i - 1)
        if left * a > top_value:
            break

        for j in range(1, limit + 1):
            right = a + b * (j - 1)
            k = 1 + (left * right - a) // b
            if k > limit:
                break
            composite[k] = True

    return [n for n in range(1, limit + 1) if not composite[n]]


def weighted_free_noncommutative_count(limit: int) -> int:
    """Atoms among the first N weighted words, ordered by weight."""
    return limit.bit_length()


def partition_numbers_through_position(limit: int) -> list[int]:
    """Return partition counts p(0), p(1), ... through enough weight."""
    partitions = [1]
    cumulative_nonempty = 0
    weight = 1

    while cumulative_nonempty < limit:
        total = 0
        k = 1
        while True:
            pentagonal_1 = k * (3 * k - 1) // 2
            pentagonal_2 = k * (3 * k + 1) // 2
            if pentagonal_1 > weight:
                break
            sign = 1 if k % 2 else -1
            total += sign * partitions[weight - pentagonal_1]
            if pentagonal_2 <= weight:
                total += sign * partitions[weight - pentagonal_2]
            k += 1

        partitions.append(total)
        cumulative_nonempty += total
        weight += 1

    return partitions


def weighted_free_commutative_count(limit: int) -> int:
    """Atoms among first N weighted multisets, with singleton first by weight."""
    partitions = partition_numbers_through_position(limit)
    before_weight = 0
    atom_count = 0

    for weight in range(1, len(partitions)):
        atom_position = before_weight + 1
        if atom_position > limit:
            break
        atom_count += 1
        before_weight += partitions[weight]

    return atom_count


def qn_plus_one_table() -> str:
    lines = [
        "| Monoid | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | First few atoms |",
        "| --- | --- | --- | --- | --- |",
    ]

    for q in Q_VALUES:
        atoms = qn_plus_one_atom_indices(max(LIMITS), q)
        counts = [str(count_at(atoms, limit)) for limit in LIMITS]
        values = [q * n + 1 for n in atoms[:8]]
        monoid = "ordinary integers" if q == 1 else f"$1 \\bmod {q}$"
        lines.append(
            f"| {monoid} | {counts[0]} | {counts[1]} | {counts[2]} | "
            f"{join_values(values)}, ... |"
        )

    return "\n".join(lines)


def arithmetical_congruence_table() -> str:
    lines = [
        "| Monoid | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | First few atoms |",
        "| --- | --- | --- | --- | --- |",
    ]

    for a, b in ACM_VALUES:
        atoms = arithmetical_congruence_atom_indices(max(LIMITS), a, b)
        counts = [str(count_at(atoms, limit)) for limit in LIMITS]
        values = [a + b * (n - 1) for n in atoms[:8]]
        lines.append(
            f"| $M_{{{a},{b}}}$ | {counts[0]} | {counts[1]} | {counts[2]} | "
            f"{join_values(values)}, ... |"
        )

    return "\n".join(lines)


def finite_free_monoid_table() -> str:
    return "\n".join(
        [
            "| Monoid | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | Atoms |",
            "| --- | --- | --- | --- | --- |",
            "| free monoid on two letters | 2 | 2 | 2 | A, B |",
        ]
    )


def weighted_free_noncommutative_table() -> str:
    counts = [str(weighted_free_noncommutative_count(limit)) for limit in LIMITS]
    return "\n".join(
        [
            "| Monoid | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | Atoms |",
            "| --- | --- | --- | --- | --- |",
            "| weighted free noncommutative monoid | "
            f"{counts[0]} | {counts[1]} | {counts[2]} | single letters $x_1,x_2,\\dots$ |",
        ]
    )


def weighted_free_commutative_table() -> str:
    counts = [str(weighted_free_commutative_count(limit)) for limit in LIMITS]
    return "\n".join(
        [
            "| Monoid | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | Atoms |",
            "| --- | --- | --- | --- | --- |",
            "| weighted free commutative monoid | "
            f"{counts[0]} | {counts[1]} | {counts[2]} | singleton multisets $\\{{x_n\\}}$ |",
        ]
    )


def main() -> None:
    print("## 3. The $1\\pmod q$ family")
    print()
    print(qn_plus_one_table())
    print()
    print("## 4. Arithmetical Congruence Monoids")
    print()
    print(arithmetical_congruence_table())
    print()
    print("## 6. Free monoids: words under concatenation")
    print()
    print(finite_free_monoid_table())
    print()
    print("## 7. Weighted free monoids")
    print()
    print(weighted_free_noncommutative_table())
    print()
    print("## 8. Free commutative monoids: partitions instead of words")
    print()
    print(weighted_free_commutative_table())


if __name__ == "__main__":
    main()
