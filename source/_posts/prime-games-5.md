---
title: prime-games-V
date: 2026-07-08 11:48:40
tags: primes
mathjax: true
---
<style>
r { color: Red }
o { color: Orange }
g { color: Green }
b { color: Blue}
y { color: Yellow}
</style>

# Prime Games on Sieves

In the earlier posts, the main object was a **multiplication rule**:

$$
a_i \otimes a_j = a_{\mu(i,j)}.
$$

A number was game-prime when it was not hit by any non-unit product. A sieve is broader. A sieve does not have to be multiplication. A sieve is any systematic rule that says:

$$
\text{remove this candidate, keep that candidate, and study what survives.}
$$

A multiplication rule creates composites. A sieve creates survivors.

Sometimes these are the same thing. The Sieve of Eratosthenes is exactly the ordinary multiplication table viewed as a deletion process. But the interesting world begins when we allow non-trivial deletion rules: residue, square-factor, smoothness, quadratic parity, rank-based, and restricted product sieves.

---

## 1. Formal definition of a sieve in a prime game

Let the game universe be an ordered sequence

$$
A = \{a_1,a_2,a_3,\ldots\}.
$$

For a finite experiment, let

$$
[N]=\{1,2,\ldots,N\}
$$

be the candidate index set.

A **deletion sieve** is a family of bad sets

$$
\mathcal B_N = \{B_{\theta,N}\subseteq [N] : \theta\in \Theta\}.
$$

The survivors are

$$
S_{\mathcal B}(N)
=
[N]\setminus \bigcup_{\theta\in\Theta} B_{\theta,N}.
$$

In ordinary prime sieving, $\theta$ is a prime $p$, and

$$
B_{p,N}=\{n\le N:p\mid n,\ n\ne p\}.
$$

A **multiplication-image sieve** is a special deletion sieve. Given a multiplication index rule

$$
\mu(i,j),
$$

we remove

$$
B_N=\{\mu(i,j)\le N:i,j>0\}.
$$

Then the survivors are exactly the game-primes.

But there are several other sieve modes.

#### Deletion sieves

Delete every candidate that satisfies a bad predicate:

$$
n\in B_\theta.
$$

Examples:

$$
p\mid n,\qquad p^2\mid n,\qquad n\bmod p\in R_p.
$$

#### Toggling sieves

Instead of deleting immediately, flip a bit:

$$
\chi(n)\leftarrow 1-\chi(n).
$$

The candidate survives if it is flipped an odd number of times and then passes a cleanup rule. The Sieve of Atkin is the key example.

#### Weighted sieves

Assign a score

$$
w(n)
$$

instead of a yes/no mark. Selberg-style sieves often belong here. The output may be an upper bound, lower bound, or weighted estimate rather than an explicit survivor list.

#### Rank-based sieves

The deletion rule depends on the current position of a candidate in the survivor list, not just on its value. 

#### Restricted-product sieves

Given ordinary multiplication, delete $ij$ only when the factor pair passes a restriction:

$$
R(i,j)=1.
$$

Examples:

$$
\gcd(i,j)=1,
$$

$$
|i-j|\le \Delta,
$$

---

## 2. Sundaram's sieve

Sundaram's sieve is often presented as a clever variant of Eratosthenes, but in prime-game language it has a very clean interpretation.

Represent odd numbers as

$$
2k+1.
$$

The product of two odd non-units is

$$
(2i+1)(2j+1)=2(i+j+2ij)+1.
$$

Therefore, the odd composite index is

$$
k=i+j+2ij.
$$

Sundaram deletes every $k$ of this form, and the survivors $k$ give odd primes $2k+1$. This is a pure multiplication-image sieve in the odd subgame.

| Index limit N | survivor indices | density | meaning |
| --- | --- | --- | --- |
| 100 | 45 | 0.4500 | odd primes <= 201 |
| 1000 | 302 | 0.3020 | odd primes <= 2001 |
| 10000 | 2261 | 0.2261 | odd primes <= 20001 |
| 100000 | 17983 | 0.1798 | odd primes <= 200001 |

First survivor values for $N=100$:

$$
3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73
$$

The density looks larger than ordinary $\pi(N)/N$ because $N$ here is not the prime-value cutoff; the output values go up to $2N+1$.

---

## 3. Wheel sieves

A wheel sieve chooses a small basis of primes

$$
P_0=\{2,3,5,\ldots\}
$$

and keeps only numbers coprime to

$$
W=\prod_{p\in P_0}p,
$$

while manually retaining the basis primes themselves.

This does not find primes by itself. It creates a smaller candidate set before running a deeper sieve. Wheel factorization is widely used as an optimization: it skips candidates known in advance to be divisible by the wheel primes.

The table shows survivor counts up to $N$. Parentheses show how many of those survivors are actually composite.

| Wheel basis | 100 | 1000 | 10000 | 100000 |
| --- | --- | --- | --- | --- |
| {2} | 50 (25 comp.) | 500 (332 comp.) | 5000 (3771 comp.) | 50000 (40408 comp.) |
| {2,3} | 34 (9 comp.) | 334 (166 comp.) | 3334 (2105 comp.) | 33334 (23742 comp.) |
| {2,3,5} | 28 (3 comp.) | 268 (100 comp.) | 2668 (1439 comp.) | 26668 (17076 comp.) |
| {2,3,5,7} | 25 (0 comp.) | 231 (63 comp.) | 2288 (1059 comp.) | 22860 (13268 comp.) |
| {2,3,5,7,11} | 25 (0 comp.) | 211 (43 comp.) | 2081 (852 comp.) | 20783 (11191 comp.) |

The lesson is clear: wheel sieves reduce the search space but do not solve primality. With basis $\{2,3,5,7\}$, only $22.86\%$ of numbers up to $100000$ survive, but more than half of those survivors are still composite.

---

## 4. Pure rough-number sieve

A stricter version removes every number divisible by a prime at most $z$. These are called $z$-rough numbers. If $z=\sqrt N$, then every composite $n\le N$ is removed, but small primes $\le z$ are also removed unless we add them back manually.

A standard heuristic for the survivor density is

$$
\prod_{p\le z}\left(1-\frac1p\right).
$$

For $N=100000$:

| z | exact rough survivors | N·∏(1-1/p) | density product | exact / estimate |
| --- | --- | --- | --- | --- |
| 5 | 26665 | 26666.7 | 0.26667 | 0.9999 |
| 11 | 20778 | 20779.2 | 0.20779 | 0.9999 |
| 31 | 15304 | 15285.2 | 0.15285 | 1.0012 |
| 100 | 11830 | 12031.7 | 0.12032 | 0.9832 |
| 316 | 9527 | 9651.9 | 0.09652 | 0.9871 |

The product estimate is already very good at this scale. This is the simplest place where sieve theory begins to look like probability: different primes behave approximately like independent filters.

---

## 5. Squarefree sieve

A number is squarefree if no prime square divides it:

$$
 !(p^2\mid n)\quad\text{for all primes }p.
$$

The squarefree sieve deletes

$$
B_p=\{n\le N:p^2\mid n\}.
$$

This is not a prime sieve. It keeps many composites, such as $6,10,14,15,21$. But it is a natural multiplicative sieve because it detects repeated prime factors.

| N | squarefree survivors excluding 1 | density |
| --- | --- | --- |
| 100 | 60 | 0.6000 |
| 1000 | 607 | 0.6070 |
| 10000 | 6082 | 0.6082 |
| 100000 | 60793 | 0.6079 |

First squarefree survivors up to $100$:

$$
1, 2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 30, 31, 33, 34, 35, 37, 38
$$

The density approaches

$$
\frac{6}{\pi^2}\approx 0.6079.
$$

This gives a useful contrast with primes: squarefree numbers are multiplicatively constrained, but they still have positive density.

---

## 6. Smoothness sieve

A number is $B$-smooth if all of its prime factors are at most $B$.

For fixed $N$, small $B$ makes the sieve very strict. Larger $B$ keeps more numbers.

| Smoothness rule | 100 | 1000 | 10000 | 100000 |
| --- | --- | --- | --- | --- |
| B=N^1/4 | 20 (B=3) | 86 (B=5) | 338 (B=10) | 2579 (B=17) |
| B=N^1/3 | 20 (B=4) | 141 (B=9) | 1169 (B=21) | 8740 (B=46) |
| B=N^1/2 | 46 (B=10) | 434 (B=31) | 3716 (B=100) | 35819 (B=316) |
| B=N^3/4 | 82 (B=31) | 771 (B=177) | 7598 (B=1000) | 75067 (B=5623) |

This table shows the opposite behavior from rough-number sieves.

- Rough sieve: keep numbers with **no small factors**.
- Smooth sieve: keep numbers with **no large factors**.

---

## 7. General tuple sieve

Let

$$
\mathcal H=\{h_1,h_2,\ldots,h_k\}
$$

be a finite set of offsets. We want $n+h_1,\ldots,n+h_k$ all to be prime.

For each prime $p$, remove $n$ if

$$
n+h_i\equiv 0\pmod p
$$

for at least one offset $h_i$. Equivalently, remove residue classes

$$
n\equiv -h_i\pmod p.
$$

This is a dimension-$k$ sieve. The twin-prime sieve has

$$
\mathcal H=\{0,2\}.
$$

The prime quadruplet pattern has

$$
\mathcal H=\{0,2,6,8\}.
$$

Exact counts of prime constellations:

| Pattern | 100 | 1000 | 10000 | 100000 |
| --- | --- | --- | --- | --- |
| Prime | 25 | 168 | 1229 | 9592 |
| Twin n,n+2 | 8 | 35 | 205 | 1224 |
| Triplet n,n+2,n+6 | 4 | 15 | 55 | 259 |
| Triplet n,n+4,n+6 | 5 | 15 | 57 | 248 |
| Prime quadruplet n,n+2,n+6,n+8 | 2 | 5 | 12 | 38 |

Candidate counts for $N=100000$, using only primes $p\le z$ in the residue sieve:

| Pattern | z | candidate survivors | exact constellations | false survivors |
| --- | --- | --- | --- | --- |
| Prime | 31 | 15315 | 9592 | 5723 |
| Prime | 100 | 11855 | 9592 | 2263 |
| Prime | 316 (final) | 9592 | 9592 | 0 |
| Twin n,n+2 | 31 | 3123 | 1224 | 1899 |
| Twin n,n+2 | 100 | 1859 | 1224 | 635 |
| Twin n,n+2 | 316 (final) | 1224 | 1224 | 0 |
| Triplet n,n+2,n+6 | 31 | 1045 | 259 | 786 |
| Triplet n,n+2,n+6 | 100 | 446 | 259 | 187 |
| Triplet n,n+2,n+6 | 316 (final) | 259 | 259 | 0 |
| Triplet n,n+4,n+6 | 31 | 1040 | 248 | 792 |
| Triplet n,n+4,n+6 | 100 | 491 | 248 | 243 |
| Triplet n,n+4,n+6 | 316 (final) | 248 | 248 | 0 |
| Prime quadruplet n,n+2,n+6,n+8 | 31 | 238 | 38 | 200 |
| Prime quadruplet n,n+2,n+6,n+8 | 100 | 87 | 38 | 49 |
| Prime quadruplet n,n+2,n+6,n+8 | 316 (final) | 38 | 38 | 0 |

As $z$ approaches $\sqrt{N+\max \mathcal H}$, the finite sieve becomes exact for these small patterns.

---

## 8. Sophie Germain / safe-prime sieve

A Sophie Germain prime is a prime $p$ such that $2p+1$ is also prime. This is not an offset tuple, because the two forms are

$$
n,\qquad 2n+1.
$$

For each odd prime $q$, remove two residue classes:

$$
n\equiv 0\pmod q,
$$

and

$$
2n+1\equiv 0\pmod q.
$$

Exact counts:

| N | Sophie Germain primes p≤N |
| --- | --- |
| 100 | 10 |
| 1000 | 37 |
| 10000 | 190 |
| 100000 | 1171 |

This is a good example of a **polynomial sieve**. The candidate is not a number but a parameter $n$, and the sieve tests several expressions in $n$.

---

## 9. Distance-limited product sieve

A different restriction is geometric:

$$
n=ij
$$

is deleted only if the factors are close:

$$
|i-j|\le \Delta.
$$

This detects composites with near-square factorization. It ignores very unbalanced products like

$$
2\cdot 49999.
$$

The table gives survivor counts; parentheses show composite survivors.

| Rule | 100 | 1000 | 10000 | 100000 |
| --- | --- | --- | --- | --- |
| Δ=0 | 90 (65 comp.) | 969 (801 comp.) | 9900 (8671 comp.) | 99684 (90092 comp.) |
| Δ=1 | 82 (57 comp.) | 939 (771 comp.) | 9802 (8573 comp.) | 99370 (89778 comp.) |
| Δ=5 | 57 (32 comp.) | 828 (660 comp.) | 9417 (8188 comp.) | 98121 (88529 comp.) |
| Δ=10 | 45 (20 comp.) | 723 (555 comp.) | 8970 (7741 comp.) | 96594 (87002 comp.) |
| Δ=100 | 25 (0 comp.) | 341 (173 comp.) | 5824 (4595 comp.) | 77896 (68304 comp.) |

For $\Delta=0$, we delete only perfect squares. For small $\Delta$, almost all composites survive. 

---

## 10. Ratio-limited product sieve

Instead of additive distance, use multiplicative distance:

$$
1\le \frac{j}{i}\le R,\qquad i\le j.
$$

This deletes numbers with a reasonably balanced factorization.

| Rule | 100 | 1000 | 10000 | 100000 |
| --- | --- | --- | --- | --- |
| R=1 | 90 (65 comp.) | 969 (801 comp.) | 9900 (8671 comp.) | 99684 (90092 comp.) |
| R=2 | 58 (33 comp.) | 665 (497 comp.) | 7069 (5840 comp.) | 73131 (63539 comp.) |
| R=4 | 45 (20 comp.) | 547 (379 comp.) | 6017 (4788 comp.) | 63596 (54004 comp.) |
| R=10 | 33 (8 comp.) | 433 (265 comp.) | 5025 (3796 comp.) | 54754 (45162 comp.) |

Even at $R=10$, many composites survive. Balanced-factor sieves are useful for studying factor geometry, not for detecting all composites.

---

## 11. Lucky numbers

The lucky-number sieve is value-independent after the first step. It removes numbers by their current rank in the survivor list. Start with positive integers. Remove every second number. The next survivor after $1$ is $3$, so remove every third remaining number. The next survivor is $7$, so remove every seventh remaining number, and so on. Lucky numbers were introduced as a sieve-generated analogue of primes.

| N | lucky survivors including 1 | excluding 1 | π(N) | (lucky excluding 1)/π(N) |
| --- | --- | --- | --- | --- |
| 100 | 23 | 22 | 25 | 0.880 |
| 1000 | 153 | 152 | 168 | 0.905 |
| 10000 | 1118 | 1117 | 1229 | 0.909 |
| 100000 | 8772 | 8771 | 9592 | 0.914 |

First lucky numbers:

$$
1, 3, 7, 9, 13, 15, 21, 25, 31, 33, 37, 43, 49, 51, 63, 67, 69, 73, 75, 79, 87, 93, 99, 105, 111, 115, 127, 129, 133, 135
$$

Lucky numbers are fascinating because they mimic some prime-like statistics while ignoring divisibility. In prime-game terms, they are evidence that “prime-like distribution” can arise from a sieve process without a multiplication table.

---

## 12. Cramér-style random survivor model

Cramér's random model keeps each $n$ independently with probability approximately

$$
\frac{1}{\log n}.
$$

This reproduces the rough prime-count scale, though it misses important arithmetic correlations.

The table below uses ten random seeds and reports the average, minimum, and maximum survivor counts.

| N | average random survivors | min | max | π(N) |
| --- | --- | --- | --- | --- |
| 100 | 29.1 | 21 | 38 | 25 |
| 1000 | 183.7 | 167 | 202 | 168 |
| 10000 | 1253.7 | 1200 | 1319 | 1229 |
| 100000 | 9621.3 | 9523 | 9725 | 9592 |

---

## 13. Random residue-class sieve

A closer model to actual sieving is:

For each prime $p\le z$, choose one random forbidden residue class

$$
a_p\bmod p,
$$

and delete every $n\equiv a_p\pmod p$.

The expected density is again

$$
\prod_{p\le z}\left(1-\frac1p\right),
$$

but the forbidden classes are random instead of always $0\bmod p$.

For $N=100000$, ten random seeds:

| z | average survivors | min | max | product estimate |
| --- | --- | --- | --- | --- |
| 5 | 26666.5 | 26665 | 26667 | 26666.7 |
| 11 | 20778.8 | 20778 | 20780 | 20779.2 |
| 31 | 15284.5 | 15277 | 15296 | 15285.2 |
| 100 | 12041.9 | 12023 | 12072 | 12031.7 |
| 316 | 9650.0 | 9620 | 9691 | 9651.9 |

Random residue sieves are useful because they separate two effects:

1. density caused by the number of residue classes removed;
2. arithmetic structure caused by which residue classes are removed.

The ordinary rough-number sieve always removes $0\bmod p$. The random residue sieve removes one class per $p$, but usually not the multiplicative class.

---

## 14. Standalone Script

[Standalone Python script](/scripts/prime-games-5.py)

---