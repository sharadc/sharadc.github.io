#!/usr/bin/env python3
"""Generate the tables for Prime Games V.

The script intentionally has no third-party dependencies. It prints the
markdown tables used by source/_posts/prime-games-5.md.
"""

from __future__ import annotations

import random
from math import gcd, isqrt, log


LIMITS = (100, 1_000, 10_000, 100_000)
MAX_N = max(LIMITS)
RANDOM_SEEDS = range(10)


def fmt(n: int) -> str:
    return f"{n:,}"


def prime_sieve(limit: int) -> list[bool]:
    is_prime = [True] * (limit + 1)
    is_prime[0] = False
    is_prime[1] = False
    for p in range(2, isqrt(limit) + 1):
        if is_prime[p]:
            for multiple in range(p * p, limit + 1, p):
                is_prime[multiple] = False
    return is_prime


IS_PRIME = prime_sieve(2 * MAX_N + 100)
PRIMES = [n for n, prime in enumerate(IS_PRIME) if prime]


def table(header: str, alignment: str, rows: list[list[str]]) -> str:
    lines = [header, alignment]
    lines.extend("| " + " | ".join(row) + " |" for row in rows)
    return "\n".join(lines)


def count_primes(limit: int) -> int:
    return sum(1 for n in range(2, limit + 1) if IS_PRIME[n])


def prime_factors(n: int) -> list[int]:
    factors = []
    for p in PRIMES:
        if p * p > n:
            break
        if n % p == 0:
            factors.append(p)
            while n % p == 0:
                n //= p
    if n > 1:
        factors.append(n)
    return factors


def sundaram_table() -> str:
    rows = []
    for limit in LIMITS:
        survivors = sum(1 for k in range(1, limit + 1) if IS_PRIME[2 * k + 1])
        rows.append([
            str(limit),
            str(survivors),
            f"{survivors / limit:.4f}",
            f"odd primes <= {2 * limit + 1}",
        ])
    return table(
        "| Index limit N | survivor indices | density | meaning |",
        "| --- | --- | --- | --- |",
        rows,
    )


def wheel_table() -> str:
    bases = [
        [2],
        [2, 3],
        [2, 3, 5],
        [2, 3, 5, 7],
        [2, 3, 5, 7, 11],
    ]
    rows = []
    for basis in bases:
        wheel = 1
        for p in basis:
            wheel *= p
        cells = ["{" + ",".join(str(p) for p in basis) + "}"]
        for limit in LIMITS:
            survivors = [
                n for n in range(2, limit + 1)
                if n in basis or gcd(n, wheel) == 1
            ]
            composite_survivors = sum(1 for n in survivors if not IS_PRIME[n])
            cells.append(f"{len(survivors)} ({composite_survivors} comp.)")
        rows.append(cells)
    return table(
        "| Wheel basis | 100 | 1000 | 10000 | 100000 |",
        "| --- | --- | --- | --- | --- |",
        rows,
    )


def rough_table() -> str:
    rows = []
    limit = 100_000
    for z in (5, 11, 31, 100, 316):
        sieving_primes = [p for p in PRIMES if p <= z]
        exact = sum(
            1 for n in range(2, limit + 1)
            if all(n % p != 0 for p in sieving_primes)
        )
        density = 1.0
        for p in sieving_primes:
            density *= 1.0 - 1.0 / p
        estimate = limit * density
        rows.append([
            str(z),
            str(exact),
            f"{estimate:.1f}",
            f"{density:.5f}",
            f"{exact / estimate:.4f}",
        ])
    return table(
        "| z | exact rough survivors | N·∏(1-1/p) | density product | exact / estimate |",
        "| --- | --- | --- | --- | --- |",
        rows,
    )


def squarefree_table() -> str:
    square_primes = [p * p for p in PRIMES if p * p <= MAX_N]
    rows = []
    for limit in LIMITS:
        survivors = sum(
            1 for n in range(2, limit + 1)
            if all(n % square != 0 for square in square_primes if square <= n)
        )
        rows.append([str(limit), str(survivors), f"{survivors / limit:.4f}"])
    return table(
        "| N | squarefree survivors excluding 1 | density |",
        "| --- | --- | --- |",
        rows,
    )


def is_smooth(n: int, bound: int) -> bool:
    if n == 1:
        return True
    return max(prime_factors(n)) <= bound


def smooth_bound(limit: int, numerator: int, denominator: int) -> int:
    # Floating powers reproduce the displayed integer cutoffs in the post.
    return int(limit ** (numerator / denominator))


def smooth_table() -> str:
    rules = [
        ("B=N^1/4", (1, 4)),
        ("B=N^1/3", (1, 3)),
        ("B=N^1/2", (1, 2)),
        ("B=N^3/4", (3, 4)),
    ]
    rows = []
    for label, exponent in rules:
        cells = [label]
        for limit in LIMITS:
            bound = smooth_bound(limit, *exponent)
            count = sum(1 for n in range(1, limit + 1) if is_smooth(n, bound))
            cells.append(f"{count} (B={bound})")
        rows.append(cells)
    return table(
        "| Smoothness rule | 100 | 1000 | 10000 | 100000 |",
        "| --- | --- | --- | --- | --- |",
        rows,
    )


PATTERNS = [
    ("Prime", (0,)),
    ("Twin n,n+2", (0, 2)),
    ("Triplet n,n+2,n+6", (0, 2, 6)),
    ("Triplet n,n+4,n+6", (0, 4, 6)),
    ("Prime quadruplet n,n+2,n+6,n+8", (0, 2, 6, 8)),
]


def is_constellation(n: int, offsets: tuple[int, ...]) -> bool:
    return all(IS_PRIME[n + h] for h in offsets)


def tuple_exact_count(limit: int, offsets: tuple[int, ...]) -> int:
    return sum(1 for n in range(2, limit + 1) if is_constellation(n, offsets))


def tuple_exact_table() -> str:
    rows = []
    for label, offsets in PATTERNS:
        rows.append([label] + [str(tuple_exact_count(limit, offsets)) for limit in LIMITS])
    return table(
        "| Pattern | 100 | 1000 | 10000 | 100000 |",
        "| --- | --- | --- | --- | --- |",
        rows,
    )


def tuple_candidate_count(limit: int, offsets: tuple[int, ...], z: int) -> int:
    sieving_primes = [p for p in PRIMES if p <= z]
    count = 0
    for n in range(2, limit + 1):
        survives = True
        for p in sieving_primes:
            for h in offsets:
                value = n + h
                if value != p and value % p == 0:
                    survives = False
                    break
            if not survives:
                break
        if survives:
            count += 1
    return count


def tuple_candidate_table() -> str:
    rows = []
    limit = 100_000
    for label, offsets in PATTERNS:
        exact = tuple_exact_count(limit, offsets)
        for z_label, z in [("31", 31), ("100", 100), ("316 (final)", 316)]:
            candidates = tuple_candidate_count(limit, offsets, z)
            rows.append([label, z_label, str(candidates), str(exact), str(candidates - exact)])
    return table(
        "| Pattern | z | candidate survivors | exact constellations | false survivors |",
        "| --- | --- | --- | --- | --- |",
        rows,
    )


def sophie_germain_table() -> str:
    rows = []
    for limit in LIMITS:
        count = sum(1 for p in range(2, limit + 1) if IS_PRIME[p] and IS_PRIME[2 * p + 1])
        rows.append([str(limit), str(count)])
    return table(
        "| N | Sophie Germain primes p≤N |",
        "| --- | --- |",
        rows,
    )


def factor_pair_lists(limit: int) -> list[list[tuple[int, int]]]:
    pairs = [[] for _ in range(limit + 1)]
    for a in range(2, limit + 1):
        for b in range(a, limit // a + 1):
            pairs[a * b].append((a, b))
    return pairs


FACTOR_PAIRS = factor_pair_lists(MAX_N)


def restricted_product_survivors(predicate) -> list[bool]:
    deleted = [False] * (MAX_N + 1)
    for n in range(2, MAX_N + 1):
        for a, b in FACTOR_PAIRS[n]:
            if predicate(a, b):
                deleted[n] = True
                break
    return [n >= 2 and not deleted[n] for n in range(MAX_N + 1)]


def survivor_cells(survivors: list[bool]) -> list[str]:
    cells = []
    for limit in LIMITS:
        count = sum(1 for n in range(2, limit + 1) if survivors[n])
        composite_count = sum(1 for n in range(2, limit + 1) if survivors[n] and not IS_PRIME[n])
        cells.append(f"{count} ({composite_count} comp.)")
    return cells


def distance_table() -> str:
    rows = []
    for delta in (0, 1, 5, 10, 100):
        survivors = restricted_product_survivors(lambda a, b, delta=delta: abs(a - b) <= delta)
        rows.append([f"Δ={delta}"] + survivor_cells(survivors))
    return table(
        "| Rule | 100 | 1000 | 10000 | 100000 |",
        "| --- | --- | --- | --- | --- |",
        rows,
    )


def ratio_table() -> str:
    rows = []
    for ratio in (1, 2, 4, 10):
        survivors = restricted_product_survivors(lambda a, b, ratio=ratio: b <= ratio * a)
        rows.append([f"R={ratio}"] + survivor_cells(survivors))
    return table(
        "| Rule | 100 | 1000 | 10000 | 100000 |",
        "| --- | --- | --- | --- | --- |",
        rows,
    )


def lucky_numbers(limit: int) -> list[int]:
    numbers = list(range(1, limit + 1, 2))
    index = 1
    while index < len(numbers):
        step = numbers[index]
        if step > len(numbers):
            break
        numbers = [value for position, value in enumerate(numbers, start=1) if position % step != 0]
        index += 1
    return numbers


def lucky_table() -> str:
    lucky = lucky_numbers(MAX_N)
    rows = []
    for limit in LIMITS:
        including_one = sum(1 for n in lucky if n <= limit)
        excluding_one = including_one - 1
        pi_n = count_primes(limit)
        rows.append([
            str(limit),
            str(including_one),
            str(excluding_one),
            str(pi_n),
            f"{excluding_one / pi_n:.3f}",
        ])
    return table(
        "| N | lucky survivors including 1 | excluding 1 | π(N) | (lucky excluding 1)/π(N) |",
        "| --- | --- | --- | --- | --- |",
        rows,
    )


def cramer_random_count(limit: int, seed: int) -> int:
    rng = random.Random(seed)
    return sum(
        1 for n in range(2, limit + 1)
        if rng.random() < min(1.0, 1.0 / log(n))
    )


def cramer_table() -> str:
    rows = []
    for limit in LIMITS:
        counts = [cramer_random_count(limit, seed) for seed in RANDOM_SEEDS]
        rows.append([
            str(limit),
            f"{sum(counts) / len(counts):.1f}",
            str(min(counts)),
            str(max(counts)),
            str(count_primes(limit)),
        ])
    return table(
        "| N | average random survivors | min | max | π(N) |",
        "| --- | --- | --- | --- | --- |",
        rows,
    )


def random_residue_count(limit: int, z: int, seed: int) -> int:
    rng = random.Random(seed)
    sieving_primes = [p for p in PRIMES if p <= z]
    forbidden = {p: rng.randrange(p) for p in sieving_primes}
    return sum(
        1 for n in range(2, limit + 1)
        if all(n % p != forbidden[p] for p in sieving_primes)
    )


def random_residue_table() -> str:
    rows = []
    limit = 100_000
    for z in (5, 11, 31, 100, 316):
        counts = [random_residue_count(limit, z, seed) for seed in RANDOM_SEEDS]
        density = 1.0
        for p in PRIMES:
            if p > z:
                break
            density *= 1.0 - 1.0 / p
        rows.append([
            str(z),
            f"{sum(counts) / len(counts):.1f}",
            str(min(counts)),
            str(max(counts)),
            f"{limit * density:.1f}",
        ])
    return table(
        "| z | average survivors | min | max | product estimate |",
        "| --- | --- | --- | --- | --- |",
        rows,
    )


def main() -> None:
    print("## 2. Sundaram's sieve")
    print()
    print(sundaram_table())
    print()
    print("## 3. Wheel sieves")
    print()
    print(wheel_table())
    print()
    print("## 4. Pure rough-number sieve")
    print()
    print(rough_table())
    print()
    print("## 5. Squarefree sieve")
    print()
    print(squarefree_table())
    print()
    print("## 6. Smoothness sieve")
    print()
    print(smooth_table())
    print()
    print("## 7. General tuple sieve")
    print()
    print(tuple_exact_table())
    print()
    print(tuple_candidate_table())
    print()
    print("## 8. Sophie Germain / safe-prime sieve")
    print()
    print(sophie_germain_table())
    print()
    print("## 9. Distance-limited product sieve")
    print()
    print(distance_table())
    print()
    print("## 10. Ratio-limited product sieve")
    print()
    print(ratio_table())
    print()
    print("## 11. Lucky numbers")
    print()
    print(lucky_table())
    print()
    print("## 12. Cramér-style random survivor model")
    print()
    print(cramer_table())
    print()
    print("## 13. Random residue-class sieve")
    print()
    print(random_residue_table())


if __name__ == "__main__":
    main()
