#!/usr/bin/env python3
"""Generate the tables for Prime Games III.

The script intentionally has no third-party dependencies. It prints the
markdown tables used by source/_posts/prime-games-3.md.
"""

from __future__ import annotations

from functools import lru_cache
from math import isqrt


POLY_FIELDS = (2, 3, 5)
POLY_DEGREE_CUTOFFS = (4, 8, 12, 16, 20)
GAUSSIAN_CUTOFFS = (10, 50, 100, 500, 1_000, 10_000, 100_000)
Z5_CUTOFFS = (10, 25, 50, 100, 250, 500, 1_000, 5_000, 10_000)
COMPARISON_CUTOFFS = (100, 500, 1_000, 10_000)
FACTORIZATION_CUTOFFS = (100, 250, 500, 1_000, 2_000)


def fmt(n: int) -> str:
    return f"{n:,}"


def divisors(n: int) -> list[int]:
    return [d for d in range(1, n + 1) if n % d == 0]


def mobius(n: int) -> int:
    primes_seen = 0
    remaining = n
    p = 2
    while p * p <= remaining:
        if remaining % p == 0:
            remaining //= p
            primes_seen += 1
            if remaining % p == 0:
                return 0
            while remaining % p == 0:
                remaining //= p
        p += 1
    if remaining > 1:
        primes_seen += 1
    return -1 if primes_seen % 2 else 1


def monic_irreducible_count(q: int, degree: int) -> int:
    """I_q(n) = (1/n) sum_{d|n} mu(d) q^(n/d)."""
    total = sum(mobius(d) * q ** (degree // d) for d in divisors(degree))
    return total // degree


def polynomial_degree_table() -> str:
    lines = [
        "| Degree $n$ | Monic polynomials $2^n$ | Irreducibles $I_2(n)$ | Exact density |",
        "|---:|---:|---:|---:|",
    ]
    for degree in range(1, 13):
        total = 2**degree
        atoms = monic_irreducible_count(2, degree)
        lines.append(f"| {degree} | {fmt(total)} | {fmt(atoms)} | {atoms / total:.4f} |")
    return "\n".join(lines)


def polynomial_cumulative_table() -> str:
    lines = [
        "| Field | Max degree $D$ | Total non-identity elements | Atoms | Atom density |",
        "|---:|---:|---:|---:|---:|",
    ]
    for q in POLY_FIELDS:
        for cutoff in POLY_DEGREE_CUTOFFS:
            total = sum(q**degree for degree in range(1, cutoff + 1))
            atoms = sum(monic_irreducible_count(q, degree) for degree in range(1, cutoff + 1))
            lines.append(
                f"| $\\mathbb F_{q}$ | {cutoff} | {fmt(total)} | {fmt(atoms)} | {atoms / total:.4f} |"
            )
    return "\n".join(lines)


def is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    p = 3
    while p * p <= n:
        if n % p == 0:
            return False
        p += 2
    return True


def gaussian_norm(z: tuple[int, int]) -> int:
    a, b = z
    return a * a + b * b


@lru_cache(maxsize=None)
def gaussian_elements(limit: int) -> tuple[tuple[int, int], ...]:
    elements = []
    for a in range(1, isqrt(limit) + 1):
        for b in range(0, isqrt(limit - a * a) + 1):
            n = a * a + b * b
            if 1 < n <= limit:
                elements.append((a, b))
    return tuple(sorted(elements, key=lambda z: (gaussian_norm(z), z[0], z[1])))


def is_gaussian_atom(z: tuple[int, int]) -> bool:
    a, b = z
    n = gaussian_norm(z)
    if n == 2:
        return True
    if b == 0:
        return is_prime(a) and a % 4 == 3
    return is_prime(n)


@lru_cache(maxsize=None)
def gaussian_atoms(limit: int) -> tuple[tuple[int, int], ...]:
    return tuple(z for z in gaussian_elements(limit) if is_gaussian_atom(z))


def gaussian_rep(z: tuple[int, int]) -> str:
    a, b = z
    if b == 0:
        return str(a)
    if b == 1:
        return f"{a}+i"
    return f"{a}+{b}i"


def gaussian_atom_type(z: tuple[int, int]) -> str:
    a, b = z
    n = gaussian_norm(z)
    if n == 2:
        return "ramified prime above $2$"
    if b == 0:
        return f"inert rational prime ${a}$"
    if a < b:
        return f"split prime above ${n}$"
    return f"conjugate split class above ${n}$"


def gaussian_norm_cutoff_table() -> str:
    lines = [
        "| Norm cutoff $B$ | Non-unit classes | Atom classes | Atom density |",
        "|---:|---:|---:|---:|",
    ]
    for limit in GAUSSIAN_CUTOFFS:
        elements = gaussian_elements(limit)
        atoms = gaussian_atoms(limit)
        lines.append(f"| {fmt(limit)} | {fmt(len(elements))} | {fmt(len(atoms))} | {len(atoms) / len(elements):.4f} |")
    return "\n".join(lines)


def first_gaussian_atoms_table() -> str:
    lines = [
        "| Representative | Norm | Type |",
        "|---:|---:|---|",
    ]
    for z in gaussian_atoms(100)[:15]:
        lines.append(f"| ${gaussian_rep(z)}$ | {gaussian_norm(z)} | {gaussian_atom_type(z)} |")
    return "\n".join(lines)


def z5_canon(z: tuple[int, int]) -> tuple[int, int]:
    a, b = z
    if a < 0 or (a == 0 and b < 0):
        return (-a, -b)
    return z


def z5_norm(z: tuple[int, int]) -> int:
    a, b = z
    return a * a + 5 * b * b


def z5_mul(x: tuple[int, int], y: tuple[int, int]) -> tuple[int, int]:
    a, b = x
    c, d = y
    return z5_canon((a * c - 5 * b * d, a * d + b * c))


def z5_div_exact(z: tuple[int, int], x: tuple[int, int]) -> tuple[int, int] | None:
    """Return z/x when the quotient lies in Z[sqrt(-5)], otherwise None."""
    a, b = z
    c, d = x
    divisor_norm = z5_norm(x)
    real_numerator = a * c + 5 * b * d
    omega_numerator = b * c - a * d
    if real_numerator % divisor_norm or omega_numerator % divisor_norm:
        return None
    return z5_canon((real_numerator // divisor_norm, omega_numerator // divisor_norm))


@lru_cache(maxsize=None)
def z5_elements(limit: int) -> tuple[tuple[int, int], ...]:
    elements = []
    max_b = isqrt(limit // 5)
    for b in range(-max_b, max_b + 1):
        max_a = isqrt(max(0, limit - 5 * b * b))
        for a in range(0, max_a + 1):
            if not (a > 0 or (a == 0 and b > 0)):
                continue
            n = a * a + 5 * b * b
            if 1 < n <= limit:
                elements.append((a, b))
    return tuple(sorted(elements, key=lambda z: (z5_norm(z), z[0], z[1])))


@lru_cache(maxsize=None)
def z5_atoms(limit: int) -> tuple[tuple[int, int], ...]:
    elements = z5_elements(limit)
    atoms = []
    for z in elements:
        z_norm = z5_norm(z)
        composite = False
        for x in elements:
            x_norm = z5_norm(x)
            if x_norm * x_norm > z_norm:
                break
            quotient = z5_div_exact(z, x)
            if quotient is not None and z5_norm(quotient) > 1:
                composite = True
                break
        if not composite:
            atoms.append(z)
    return tuple(atoms)


def z5_rep(z: tuple[int, int]) -> str:
    a, b = z
    if b == 0:
        return str(a)
    if a == 0:
        return r"\omega" if b == 1 else rf"{b}\omega"
    sign = "+" if b > 0 else "-"
    coeff = "" if abs(b) == 1 else str(abs(b))
    return rf"{a}{sign}{coeff}\omega"


def z5_norm_cutoff_table() -> str:
    elements = z5_elements(max(Z5_CUTOFFS))
    atoms = z5_atoms(max(Z5_CUTOFFS))
    lines = [
        "| Norm cutoff $B$ | Non-unit classes | Atom classes | Atom density |",
        "|---:|---:|---:|---:|",
    ]
    for limit in Z5_CUTOFFS:
        element_count = sum(1 for z in elements if z5_norm(z) <= limit)
        atom_count = sum(1 for z in atoms if z5_norm(z) <= limit)
        lines.append(f"| {fmt(limit)} | {fmt(element_count)} | {fmt(atom_count)} | {atom_count / element_count:.4f} |")
    return "\n".join(lines)


def gaussian_z5_comparison_table() -> str:
    gaussian_elements_all = gaussian_elements(max(COMPARISON_CUTOFFS))
    gaussian_atoms_all = gaussian_atoms(max(COMPARISON_CUTOFFS))
    z5_elements_all = z5_elements(max(COMPARISON_CUTOFFS))
    z5_atoms_all = z5_atoms(max(COMPARISON_CUTOFFS))

    lines = [
        "| Norm cutoff $B$ | Gaussian atom density | $\\mathbb Z[\\sqrt{-5}]$ atom density |",
        "|---:|---:|---:|",
    ]
    for limit in COMPARISON_CUTOFFS:
        gaussian_element_count = sum(1 for z in gaussian_elements_all if gaussian_norm(z) <= limit)
        gaussian_atom_count = sum(1 for z in gaussian_atoms_all if gaussian_norm(z) <= limit)
        z5_element_count = sum(1 for z in z5_elements_all if z5_norm(z) <= limit)
        z5_atom_count = sum(1 for z in z5_atoms_all if z5_norm(z) <= limit)
        lines.append(
            f"| {fmt(limit)} | {gaussian_atom_count / gaussian_element_count:.4f} | "
            f"{z5_atom_count / z5_element_count:.4f} |"
        )
    return "\n".join(lines)


def first_z5_atoms_table() -> str:
    lines = [
        "| Representative | Norm |",
        "|---:|---:|",
    ]
    for z in z5_atoms(100)[:22]:
        lines.append(f"| ${z5_rep(z)}$ | {z5_norm(z)} |")
    return "\n".join(lines)


def z5_factorizations(
    z: tuple[int, int],
    atoms: tuple[tuple[int, int], ...],
    atom_norms: tuple[int, ...],
    start: int,
    memo: dict[tuple[tuple[int, int], int], tuple[tuple[int, ...], ...]],
) -> tuple[tuple[int, ...], ...]:
    key = (z, start)
    if key in memo:
        return memo[key]
    if z == (1, 0):
        return ((),)

    z_norm = z5_norm(z)
    factorizations = []
    for index in range(start, len(atoms)):
        x_norm = atom_norms[index]
        if x_norm > z_norm:
            break
        if z_norm % x_norm:
            continue
        quotient = z5_div_exact(z, atoms[index])
        if quotient is None:
            continue
        if z5_norm(quotient) == 1:
            factorizations.append((index,))
        else:
            for tail in z5_factorizations(quotient, atoms, atom_norms, index, memo):
                factorizations.append((index,) + tail)

    result = tuple(dict.fromkeys(factorizations))
    memo[key] = result
    return result


def z5_factorization_stats(limit: int) -> tuple[int, int, int, int, int]:
    elements = z5_elements(limit)
    atoms = z5_atoms(limit)
    atom_norms = tuple(z5_norm(z) for z in atoms)
    memo: dict[tuple[tuple[int, int], int], tuple[tuple[int, ...], ...]] = {}

    multiple_count = 0
    max_factorizations = 0
    different_lengths = 0
    for z in elements:
        factorizations = z5_factorizations(z, atoms, atom_norms, 0, memo)
        max_factorizations = max(max_factorizations, len(factorizations))
        if len(factorizations) > 1:
            multiple_count += 1
        if len({len(factorization) for factorization in factorizations}) > 1:
            different_lengths += 1

    return len(elements), len(atoms), multiple_count, max_factorizations, different_lengths


def z5_factorization_table() -> str:
    lines = [
        "| Norm cutoff $B$ | Non-unit classes | Atom classes | Classes with multiple atom factorizations | Max factorizations seen | Classes with different factorization lengths |",
        "|---:|---:|---:|---:|---:|---:|",
    ]
    for limit in FACTORIZATION_CUTOFFS:
        element_count, atom_count, multiple_count, max_factorizations, different_lengths = z5_factorization_stats(limit)
        lines.append(
            f"| {fmt(limit)} | {fmt(element_count)} | {fmt(atom_count)} | "
            f"{fmt(multiple_count)} | {fmt(max_factorizations)} | {fmt(different_lengths)} |"
        )
    return "\n".join(lines)


def summary_table() -> str:
    return "\n".join(
        [
            "| World | Unit normalization | Height | Atoms | Unique factorization? | Main phenomenon |",
            "|---|---|---|---|---|---|",
            "| Monic $\\mathbb F_q[x]$ | choose monic representatives | degree | monic irreducible polynomials | yes | polynomial prime number theorem |",
            "| Gaussian integers $\\mathbb Z[i]$ | quotient by $\\{\\pm1,\\pm i\\}$ | norm $a^2+b^2$ | Gaussian primes modulo units | yes | rational primes split, ramify, or stay inert |",
            "| $\\mathbb Z[\\sqrt{-5}]$ | quotient by $\\{\\pm1\\}$ | norm $a^2+5b^2$ | irreducibles | no | atoms are not always prime; nonunique but half-factorial |",
        ]
    )


def main() -> None:
    print("## 1. Monic polynomials over finite fields")
    print()
    print("### Exact simulation for $\\mathbb F_2[x]$")
    print()
    print(polynomial_degree_table())
    print()
    print("### Cumulative simulation by degree cutoff")
    print()
    print(polynomial_cumulative_table())
    print()
    print("## 2. Case study II: Gaussian integers modulo units")
    print()
    print("### Simulation by norm cutoff")
    print()
    print(gaussian_norm_cutoff_table())
    print()
    print("### First Gaussian atom classes by norm")
    print()
    print(first_gaussian_atoms_table())
    print()
    print("## 3. Case study III: $\\mathbb Z[\\sqrt{-5}]$, real multiplication without unique factorization")
    print()
    print("### Simulation by norm cutoff")
    print()
    print(z5_norm_cutoff_table())
    print()
    print(gaussian_z5_comparison_table())
    print()
    print("### First atoms in $\\mathbb Z[\\sqrt{-5}]$")
    print()
    print(first_z5_atoms_table())
    print()
    print("### Nonunique factorization simulation")
    print()
    print(z5_factorization_table())
    print()
    print("## 5. What the three worlds teach us")
    print()
    print(summary_table())


if __name__ == "__main__":
    main()
