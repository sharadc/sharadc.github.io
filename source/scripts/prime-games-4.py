#!/usr/bin/env python3
"""Generate the tables for Prime Games IV.

The script intentionally has no third-party dependencies. It prints the
markdown tables used by source/_posts/prime-games-4.md.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import gcd
from typing import Callable


LIMITS = (100, 1_000, 10_000, 100_000)
MAX_N = max(LIMITS)


Predicate = Callable[[int, int], bool]


def fmt(n: int) -> str:
    return f"{n:,}"


def first_atoms_text(atoms: list[int], count: int) -> str:
    return "$" + ",".join(str(n) for n in atoms[:count]) + r",\dots$"


def smallest_prime_factors(limit: int) -> list[int]:
    spf = list(range(limit + 1))
    spf[0] = 0
    spf[1] = 1
    for p in range(2, limit + 1):
        if spf[p] != p:
            continue
        if p * p > limit:
            continue
        for multiple in range(p * p, limit + 1, p):
            if spf[multiple] == multiple:
                spf[multiple] = p
    return spf


SPF = smallest_prime_factors(MAX_N)


def prime_factorization(n: int) -> tuple[tuple[int, int], ...]:
    factors = []
    while n > 1:
        p = SPF[n]
        exponent = 0
        while n % p == 0:
            n //= p
            exponent += 1
        factors.append((p, exponent))
    return tuple(factors)


FACTORS = [tuple() for _ in range(MAX_N + 1)]
for n in range(2, MAX_N + 1):
    FACTORS[n] = prime_factorization(n)


FACTOR_PAIRS_BY_PRODUCT: list[list[tuple[int, int]]] = [[] for _ in range(MAX_N + 1)]
for a in range(2, MAX_N + 1):
    for b in range(a, MAX_N // a + 1):
        FACTOR_PAIRS_BY_PRODUCT[a * b].append((a, b))


def color_mask_mod4(n: int) -> int:
    mask = 0
    for p, _ in FACTORS[n]:
        if p == 2:
            mask |= 1
        elif p % 4 == 1:
            mask |= 2
        else:
            mask |= 4
    return mask


def color_mask_mod3(n: int) -> int:
    mask = 0
    for p, _ in FACTORS[n]:
        if p % 3 == 0:
            mask |= 1
        elif p % 3 == 1:
            mask |= 2
        else:
            mask |= 4
    return mask


COLOR_MOD4 = [color_mask_mod4(n) for n in range(MAX_N + 1)]
COLOR_MOD3 = [color_mask_mod3(n) for n in range(MAX_N + 1)]


def has_no_equal_positive_shared_exponent(a: int, b: int) -> bool:
    a_factors = dict(FACTORS[a])
    for p, b_exponent in FACTORS[b]:
        a_exponent = a_factors.get(p, 0)
        if a_exponent == b_exponent and a_exponent > 0:
            return False
    return True


def restricted_atoms(predicate: Predicate, limit: int = MAX_N) -> list[int]:
    composite = [False] * (limit + 1)
    for n in range(2, limit + 1):
        for a, b in FACTOR_PAIRS_BY_PRODUCT[n]:
            if predicate(a, b):
                composite[n] = True
                break
    return [n for n in range(2, limit + 1) if not composite[n]]


def counts_for(atoms: list[int]) -> list[str]:
    return [fmt(sum(1 for n in atoms if n <= limit)) for limit in LIMITS]


@dataclass(frozen=True)
class AtomRow:
    label: str
    predicate: Predicate
    first_count: int
    status: str | None = None
    interpretation: str | None = None


def row_cells(row: AtomRow, atoms: list[int]) -> list[str]:
    counts = counts_for(atoms)
    cells = [row.label]
    if row.status is not None:
        cells.append(row.status)
    cells.extend(counts)
    if row.interpretation is not None:
        cells.append(row.interpretation)
    else:
        cells.append(first_atoms_text(atoms, row.first_count))
    return cells


def table(header: str, alignment: str, rows: list[list[str]]) -> str:
    lines = [header, alignment]
    lines.extend("| " + " | ".join(row) + " |" for row in rows)
    return "\n".join(lines)


def one_rule_table(row: AtomRow) -> str:
    atoms = restricted_atoms(row.predicate)
    return table(
        "| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |",
        "|---|---:|---:|---:|---:|---|",
        [row_cells(row, atoms)],
    )


def unitary_table() -> str:
    return one_rule_table(
        AtomRow(r"$\gcd(a,b)=1$", lambda a, b: gcd(a, b) == 1, 15)
    )


def prime_colors_mod4_table() -> str:
    return one_rule_table(
        AtomRow(
            r"Disjoint prime colors $\{2,1\bmod4,3\bmod4\}$",
            lambda a, b: (COLOR_MOD4[a] & COLOR_MOD4[b]) == 0,
            15,
        )
    )


def prime_colors_mod3_table() -> str:
    return one_rule_table(
        AtomRow(
            r"Disjoint prime colors modulo $3$",
            lambda a, b: (COLOR_MOD3[a] & COLOR_MOD3[b]) == 0,
            15,
        )
    )


def gcd_threshold_table() -> str:
    rows = [
        AtomRow(r"$\gcd(a,b)\le2$", lambda a, b: gcd(a, b) <= 2, 12, status="screened"),
        AtomRow(r"$\gcd(a,b)\le6$", lambda a, b: gcd(a, b) <= 6, 12, status="screened"),
    ]
    return table(
        "| Rule | Algebraic status | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |",
        "|---|---|---:|---:|---:|---:|---|",
        [row_cells(row, restricted_atoms(row.predicate)) for row in rows],
    )


def biunitary_table() -> str:
    row = AtomRow(
        "No equal positive shared exponent",
        has_no_equal_positive_shared_exponent,
        14,
        status="screened",
    )
    return table(
        "| Rule | Algebraic status | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |",
        "|---|---|---:|---:|---:|---:|---|",
        [row_cells(row, restricted_atoms(row.predicate))],
    )


def near_factor_table() -> str:
    rows = [
        AtomRow(r"$\|a-b\|\le10$", lambda a, b: abs(a - b) <= 10, 12),
        AtomRow(r"$\|a-b\|\le100$", lambda a, b: abs(a - b) <= 100, 12),
        AtomRow(r"ratio $\le2$", lambda a, b: b <= 2 * a, 12),
        AtomRow(r"ratio $\le10$", lambda a, b: b <= 10 * a, 12),
    ]
    return table(
        "| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |",
        "|---|---:|---:|---:|---:|---|",
        [row_cells(row, restricted_atoms(row.predicate)) for row in rows],
    )


def far_factor_table() -> str:
    rows = [
        AtomRow(r"$\|a-b\|\ge10$", lambda a, b: abs(a - b) >= 10, 12),
        AtomRow(r"ratio $\ge10$", lambda a, b: b >= 10 * a, 12),
    ]
    return table(
        "| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |",
        "|---|---:|---:|---:|---:|---|",
        [row_cells(row, restricted_atoms(row.predicate)) for row in rows],
    )


def coprime_distance_table() -> str:
    rows = [
        AtomRow(r"$\gcd=1$ and $\|a-b\|\le10$", lambda a, b: gcd(a, b) == 1 and abs(a - b) <= 10, 12),
        AtomRow(r"$\gcd=1$ and ratio $\le2$", lambda a, b: gcd(a, b) == 1 and b <= 2 * a, 12),
        AtomRow(r"$\gcd=1$ and $\|a-b\|\ge10$", lambda a, b: gcd(a, b) == 1 and abs(a - b) >= 10, 12),
        AtomRow(r"$\gcd=1$ and ratio $\ge10$", lambda a, b: gcd(a, b) == 1 and b >= 10 * a, 12),
    ]
    return table(
        "| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |",
        "|---|---:|---:|---:|---:|---|",
        [row_cells(row, restricted_atoms(row.predicate)) for row in rows],
    )


def factor_budget_table() -> str:
    rows = [
        AtomRow(r"$\min(a,b)\le10$", lambda a, b: a <= 10, 12),
        AtomRow(r"$\min(a,b)\le100$", lambda a, b: a <= 100, 12),
    ]
    return table(
        "| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |",
        "|---|---:|---:|---:|---:|---|",
        [row_cells(row, restricted_atoms(row.predicate)) for row in rows],
    )


def related_budget_table() -> str:
    rows = [
        AtomRow(
            "both factors $\\le100$",
            lambda a, b: b <= 100,
            0,
            interpretation="products only from a finite multiplication table",
        ),
        AtomRow(
            "both factors $\\ge10$",
            lambda a, b: a >= 10,
            0,
            interpretation="small-factor composites survive",
        ),
    ]
    return table(
        "| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | Interpretation |",
        "|---|---:|---:|---:|---:|---|",
        [row_cells(row, restricted_atoms(row.predicate)) for row in rows],
    )


def main() -> None:
    print("## 3. Unitary multiplication")
    print()
    print(unitary_table())
    print()
    print("## 4. Feature-disjoint multiplication: restrict by prime colors")
    print()
    print("### Prime colors modulo 4")
    print()
    print(prime_colors_mod4_table())
    print()
    print("### Prime colors modulo 3")
    print()
    print(prime_colors_mod3_table())
    print()
    print("## 5. GCD-threshold multiplication")
    print()
    print(gcd_threshold_table())
    print()
    print("## 6. Bi-unitary multiplication screen")
    print()
    print(biunitary_table())
    print()
    print("## 7. Distance-filtered multiplication")
    print()
    print("### 14.1 Near-factor multiplication")
    print()
    print(near_factor_table())
    print()
    print("### Far-factor multiplication")
    print()
    print(far_factor_table())
    print()
    print("## 8. Coprime plus distance")
    print()
    print(coprime_distance_table())
    print()
    print("## 9. Factor-budget multiplication")
    print()
    print(factor_budget_table())
    print()
    print(related_budget_table())


if __name__ == "__main__":
    main()
