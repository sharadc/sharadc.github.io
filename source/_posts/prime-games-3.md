---
title: Prime Games III
date: 2026-07-05 10:07:30
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

# Prime Games with Finite-Field Polynomials, Gaussian Integers, and Z[√−5]

We will study three examples:

1. Monic polynomials over finite fields,
2. Gaussian integers modulo units,
3. $\mathbb Z[\sqrt{-5}]$, the standard real-multiplication example where unique factorization fails.

The guiding question continuing from last post is:

> What does the prime distribution look like when the game-primes are genuine irreducible elements of a real multiplicative system?

The answer is that the first two worlds behave like clean unique-factorization games, while $\mathbb Z[\sqrt{-5}]$ behaves like a prime game with real multiplication but multiple irreducible factorizations.

---

## 1. Monic polynomials over finite fields

Let $\mathbb F_q$ be the finite field with $q$ elements, where $q$ is a prime power. Consider the polynomial ring

$$
\mathbb F_q[x].
$$

The units in $\mathbb F_q[x]$ are the nonzero constants. 

<details>
  <summary> <y> Why do we care about Units? </y> </summary>
  <p> We care about units because they define "Essentially the Same."
  
  In arithmetic, we say $5$ and $-5$ are basically the same prime number, just flipped by a unit $(-1)$.
  
  In polynomials over $\mathbb{F}_{3}$, the polynomial $x + 1$ and the polynomial $2x + 2$ are essentially the same polynomial. Why? Because if you take $x + 1$ and multiply it by the unit $2$, you get:
  $2\cdot (x+1)=2x+2$

  Because $2$ is a unit, it has no structural impact on the polynomial. It doesn't add roots, it doesn't change the degree, and it doesn't change how it factors. Units are just "scaling factors" that we can clear out whenever we want.</p>
</details>

To remove unit ambiguity, we choose the unique **monic** representative from each nonzero associate class.

<details>
  <summary> <y> Monic Polynomials </y> </summary>
  <p>
  A monic polynomial is a polynomial whose leading coefficient is exactly 1. The leading coefficient is the number multiplied by the highest power of the variable (like \(x^{2}\) or \(x^{3}\)).
  </p>
</details>

So the game universe is

$$
M_q=\{\text{monic polynomials in }\mathbb F_q[x]\}.
$$

The identity is the monic constant polynomial

$$
1.
$$

The multiplication rule is ordinary polynomial multiplication:

$$
f\otimes g=fg.
$$

The product of two monic polynomials is monic, so this universe is closed.

The height is degree:

$$
H(f)=\deg f.
$$

For nonconstant polynomials,

$$
\deg(fg)=\deg f+\deg g>\deg f,\deg g.
$$

Thus, if we order monic polynomials by degree and then lexicographically by coefficients, multiplication always moves forward.

### Atoms

The game-primes are exactly the monic irreducible polynomials over $\mathbb F_q$.

This is one of the cleanest prime games because $\mathbb F_q[x]$ is a Euclidean domain, hence a unique factorization domain. Every monic polynomial factors uniquely into monic irreducibles.

The number of monic irreducible polynomials of exact degree $n$ over $\mathbb F_q$ is

$$
I_q(n)=\frac1n\sum_{d\mid n}\mu(d)q^{n/d},
$$

where $\mu$ is the Möbius function. This is the polynomial analogue of prime-number counting. For fixed degree $n$, there are $q^n$ monic polynomials of degree $n$, and asymptotically

$$
I_q(n)=\frac{q^n}{n}+O(q^{n/2}).
$$

So a random monic polynomial of degree $n$ is irreducible with probability approximately

$$
\frac1n.
$$

That is the finite-field-polynomial version of the heuristic that an integer near size $X$ is prime with probability about $1/\log X$. Here $X=q^n$, so $\log_q X=n$.

### Exact simulation for $\mathbb F_2[x]$

| Degree $n$ | Monic polynomials $2^n$ | Irreducibles $I_2(n)$ | Exact density |
|---:|---:|---:|---:|
| 1 | 2 | 2 | 1.0000 |
| 2 | 4 | 1 | 0.2500 |
| 3 | 8 | 2 | 0.2500 |
| 4 | 16 | 3 | 0.1875 |
| 5 | 32 | 6 | 0.1875 |
| 6 | 64 | 9 | 0.1406 |
| 7 | 128 | 18 | 0.1406 |
| 8 | 256 | 30 | 0.1172 |
| 9 | 512 | 56 | 0.1094 |
| 10 | 1,024 | 99 | 0.0967 |
| 11 | 2,048 | 186 | 0.0908 |
| 12 | 4,096 | 335 | 0.0818 |

The density tracks $1/n$, with small finite-degree corrections.

### Cumulative simulation by degree cutoff

Here $D$ means we include every nonconstant monic polynomial of degree at most $D$.

| Field | Max degree $D$ | Total non-identity elements | Atoms | Atom density |
|---:|---:|---:|---:|---:|
| $\mathbb F_2$ | 4 | 30 | 8 | 0.2667 |
| $\mathbb F_2$ | 8 | 510 | 71 | 0.1392 |
| $\mathbb F_2$ | 12 | 8,190 | 747 | 0.0912 |
| $\mathbb F_2$ | 16 | 131,070 | 8,800 | 0.0671 |
| $\mathbb F_2$ | 20 | 2,097,150 | 111,013 | 0.0529 |
| $\mathbb F_3$ | 4 | 120 | 32 | 0.2667 |
| $\mathbb F_3$ | 8 | 9,840 | 1,318 | 0.1339 |
| $\mathbb F_3$ | 12 | 797,160 | 69,706 | 0.0874 |
| $\mathbb F_3$ | 16 | 64,570,080 | 4,180,416 | 0.0647 |
| $\mathbb F_3$ | 20 | 5,230,176,600 | 268,807,044 | 0.0514 |
| $\mathbb F_5$ | 4 | 780 | 205 | 0.2628 |
| $\mathbb F_5$ | 8 | 488,280 | 63,319 | 0.1297 |
| $\mathbb F_5$ | 12 | 305,175,780 | 26,039,187 | 0.0853 |
| $\mathbb F_5$ | 16 | 190,734,863,280 | 12,127,122,989 | 0.0636 |
| $\mathbb F_5$ | 20 | 119,209,289,550,780 | 6,041,172,226,049 | 0.0507 |

For fixed $D$, the cumulative density is surprisingly similar across $q$. The reason is that degree $D$ dominates the total count, and degree $D$ has irreducible density about $1/D$.

### First few atoms in $\mathbb F_2[x]$

Degree 1:

$$
x,
\quad
x+1.
$$

Degree 2:

$$
x^2+x+1.
$$

Degree 3:

$$
x^3+x^2+1,
\quad
x^3+x+1.
$$

Degree 4:

$$
x^4+x^3+1,
\quad
x^4+x+1,
\quad
x^4+x^3+x^2+x+1.
$$

This world is the closest analogue of ordinary prime numbers, except degree replaces logarithmic size.

---

## 2. Case study II: Gaussian integers modulo units

Now move from polynomials to a two-dimensional integer lattice.

The Gaussian integers are

$$
\mathbb Z[i]=\{a+bi:a,b\in\mathbb Z\},
$$

with ordinary complex multiplication.

The norm is

$$
N(a+bi)=a^2+b^2.
$$

It is multiplicative:

$$
N(zw)=N(z)N(w).
$$

The units are

$$
\{1,-1,i,-i\}.
$$

So each nonzero element has four associates:

$$
z,
\quad
-z,
\quad
iz,
\quad
-iz.
$$

To create a reduced prime game, we quotient by units. Informally, we identify elements that differ by rotation by $90^\circ$ or by sign.

This is **not** the quotient ring $\mathbb Z[i]/(\pm1,\pm i)$. It is the multiplicative monoid of associate classes.

A convenient canonical representative is the unique associate $a+bi$ satisfying

$$
a>0,
\quad
b\ge 0.
$$

Examples:

$$
[1+i]\mapsto 1+i,
$$

$$
[1-2i]\mapsto 2+i,
$$

$$
[-3i]\mapsto 3.
$$

The multiplication rule is

$$
[a+bi][c+di]=[(a+bi)(c+di)].
$$

The height is the norm. Since nonunits have norm greater than 1,

$$
N(zw)=N(z)N(w)>N(z),N(w)
$$

for nonunit classes $[z],[w]$. Ordering by norm, then by coordinates, gives a valid generator game.

### Atoms

Gaussian integers form a Euclidean domain and hence a unique factorization domain. After quotienting by units, factorizations become genuinely unique.

The Gaussian atom classes are:

1. $[1+i]$, with norm $2$,
2. two conjugate classes $[a+bi]$ and $[a-bi]$ above every rational prime $p\equiv1\pmod4$, where $p=a^2+b^2$,
3. one class $[p]$ above every rational prime $p\equiv3\pmod4$, with norm $p^2$.

This means that rational primes split into three behaviors:

$$
2=-i(1+i)^2,
$$

$$
p\equiv1\pmod4 \Longrightarrow p=(a+bi)(a-bi),
$$

$$
p\equiv3\pmod4 \Longrightarrow p \text{ remains Gaussian-prime.}
$$

For example:

$$
5=(1+2i)(1-2i),
$$

so ordinary $5$ is composite in the Gaussian game. But $3$ remains an atom.

### Simulation by norm cutoff

Here $B$ means we include associate classes $[z]$ with

$$
1<N(z)\le B.
$$

| Norm cutoff $B$ | Non-unit classes | Atom classes | Atom density |
|---:|---:|---:|---:|
| 10 | 8 | 4 | 0.5000 |
| 50 | 39 | 15 | 0.3846 |
| 100 | 78 | 25 | 0.3205 |
| 500 | 394 | 93 | 0.2360 |
| 1,000 | 786 | 167 | 0.2125 |
| 10,000 | 7,853 | 1,232 | 0.1569 |
| 100,000 | 78,548 | 9,601 | 0.1222 |

The total number of associate classes up to norm $B$ grows like the area of a disk divided by four:

$$
Count\{[z]:N(z)\le B\}\approx \frac{\pi B}{4}.
$$

The atom count is controlled mostly by rational primes $p\equiv1\pmod4$, which split into two Gaussian prime classes of norm $p$. The inert primes $p\equiv3\pmod4$ contribute only at norm $p^2$, so they are a lower-order contribution for this norm cutoff.

### First Gaussian atom classes by norm

Using the representative $a+bi$ with $a>0$, $b\ge0$:

| Representative | Norm | Type |
|---:|---:|---|
| $1+i$ | 2 | ramified prime above $2$ |
| $1+2i$ | 5 | split prime above $5$ |
| $2+i$ | 5 | conjugate split class above $5$ |
| $3$ | 9 | inert rational prime $3$ |
| $2+3i$ | 13 | split prime above $13$ |
| $3+2i$ | 13 | conjugate split class above $13$ |
| $1+4i$ | 17 | split prime above $17$ |
| $4+i$ | 17 | conjugate split class above $17$ |
| $2+5i$ | 29 | split prime above $29$ |
| $5+2i$ | 29 | conjugate split class above $29$ |
| $1+6i$ | 37 | split prime above $37$ |
| $6+i$ | 37 | conjugate split class above $37$ |
| $4+5i$ | 41 | split prime above $41$ |
| $5+4i$ | 41 | conjugate split class above $41$ |
| $7$ | 49 | inert rational prime $7$ |


---

## 3. Case study III: $\mathbb Z[\sqrt{-5}]$, real multiplication without unique factorization

Now we keep real multiplication but lose unique factorization.

Let

$$
R=\mathbb Z[\sqrt{-5}]
=\{a+b\sqrt{-5}:a,b\in\mathbb Z\}.
$$

Write

$$
\omega=\sqrt{-5}.
$$

Then

$$
\omega^2=-5.
$$

Multiplication is ordinary ring multiplication:

$$
(a+b\omega)(c+d\omega) =
(ac-5bd)+(ad+bc)\omega.
$$

The norm is

$$
N(a+b\omega)=a^2+5b^2.
$$

Again,

$$
N(\alpha\beta)=N(\alpha)N(\beta).
$$

The only units are

$$
\pm1.
$$

So we quotient by sign. A convenient representative for each nonzero associate class is the unique $a+b\omega$ such that

$$
a>0
$$

or

$$
a=0,\quad b>0.
$$

The height is the norm. Nonunits have norm greater than 1, so multiplication moves forward in norm order.

### The classic failure

In $\mathbb Z[\sqrt{-5}]$, we have

$$
6=2\cdot3=(1+\sqrt{-5})(1-\sqrt{-5}).
$$

The four factors

$$
2,
\quad
3,
\quad
1+\sqrt{-5},
\quad
1-\sqrt{-5}
$$

are irreducible and pairwise non-associate.

So $6$ has two different atom factorizations:

$$
6=2\cdot3,
$$

and

$$
6=(1+\sqrt{-5})(1-\sqrt{-5}).
$$

This is the prime-game moment where atoms and primes split apart.

In a UFD, every irreducible is prime. Here, $2$ is irreducible but not prime. Indeed,

$$
2\mid (1+\sqrt{-5})(1-\sqrt{-5}),
$$

because the product is $6$, but $2$ divides neither $1+\sqrt{-5}$ nor $1-\sqrt{-5}$, since divisibility by $2$ would require both coefficients to be even.

### Atom test used in the simulation

Let

$$
z=a+b\omega,
\quad
x=c+d\omega.
$$

Then

$$
\frac{z}{x} =
\frac{z\overline{x}}{N(x)} =
\frac{(a+b\omega)(c-d\omega)}{c^2+5d^2}.
$$

Expanding gives

$$
\frac{z}{x} =
\frac{ac+5bd}{N(x)}+
\frac{bc-ad}{N(x)}\omega.
$$

Therefore $x$ divides $z$ in $\mathbb Z[\sqrt{-5}]$ exactly when both quantities

$$
ac+5bd
$$

and

$$
bc-ad
$$

are divisible by

$$
N(x)=c^2+5d^2.
$$

The simulation uses this exact divisibility test. An element is marked composite if it has a nonunit divisor with nonunit quotient.

### Simulation by norm cutoff

Here $B$ means we include associate classes $[\alpha]$ with

$$
1<N(\alpha)\le B.
$$

| Norm cutoff $B$ | Non-unit classes | Atom classes | Atom density |
|---:|---:|---:|---:|
| 10 | 7 | 7 | 1.0000 |
| 25 | 18 | 13 | 0.7222 |
| 50 | 35 | 22 | 0.6286 |
| 100 | 69 | 34 | 0.4928 |
| 250 | 177 | 76 | 0.4294 |
| 500 | 345 | 134 | 0.3884 |
| 1,000 | 702 | 236 | 0.3362 |
| 5,000 | 3,510 | 992 | 0.2826 |
| 10,000 | 7,017 | 1,831 | 0.2609 |

Compare this with Gaussian integers at the same norm cutoff:

| Norm cutoff $B$ | Gaussian atom density | $\mathbb Z[\sqrt{-5}]$ atom density |
|---:|---:|---:|
| 100 | 0.3205 | 0.4928 |
| 500 | 0.2360 | 0.3884 |
| 1,000 | 0.2125 | 0.3362 |
| 10,000 | 0.1569 | 0.2609 |

The non-UFD world has more atoms at these cutoffs. The reason is that irreducibles can have composite norms. For example:

$$
N(1+\sqrt{-5})=6,
$$

$$
N(2+\sqrt{-5})=9,
$$

$$
N(3+\sqrt{-5})=14.
$$

In a UFD norm world like $\mathbb Z[i]$, many composite norms signal composite elements. In $\mathbb Z[\sqrt{-5}]$, composite norm does not necessarily mean factorable.

### First atoms in $\mathbb Z[\sqrt{-5}]$

Using $\omega=\sqrt{-5}$:

| Representative | Norm |
|---:|---:|
| $2$ | 4 |
| $\omega$ | 5 |
| $1-\omega$ | 6 |
| $1+\omega$ | 6 |
| $2-\omega$ | 9 |
| $2+\omega$ | 9 |
| $3$ | 9 |
| $3-\omega$ | 14 |
| $3+\omega$ | 14 |
| $1-2\omega$ | 21 |
| $1+2\omega$ | 21 |
| $4-\omega$ | 21 |
| $4+\omega$ | 21 |
| $3-2\omega$ | 29 |
| $3+2\omega$ | 29 |
| $6-\omega$ | 41 |
| $6+\omega$ | 41 |
| $1-3\omega$ | 46 |
| $1+3\omega$ | 46 |
| $2-3\omega$ | 49 |
| $2+3\omega$ | 49 |
| $7$ | 49 |

Notice the difference from Gaussian integers. In $\mathbb Z[i]$, an off-axis Gaussian integer with prime norm is prime, and inert rational primes appear at squared norms. In $\mathbb Z[\sqrt{-5}]$, many elements with composite norms are still atoms.

### Nonunique factorization simulation

The simulation also enumerated complete atom factorizations for elements up to a norm cutoff.

| Norm cutoff $B$ | Non-unit classes | Atom classes | Classes with multiple atom factorizations | Max factorizations seen | Classes with different factorization lengths |
|---:|---:|---:|---:|---:|---:|
| 100 | 69 | 34 | 10 | 2 | 0 |
| 250 | 177 | 76 | 33 | 3 | 0 |
| 500 | 345 | 134 | 78 | 5 | 0 |
| 1,000 | 702 | 236 | 170 | 6 | 0 |
| 2,000 | 1,391 | 446 | 365 | 9 | 0 |

The last column is important. The simulation found many elements with multiple atom factorizations, but no examples with different factorization lengths in this range.

That is not an accident. $\mathbb Z[\sqrt{-5}]$ is a classic example of a **half-factorial domain**: factorizations need not be unique, but all irreducible factorizations of the same element have the same length.

Examples from the simulation:

$$
6=2\cdot3=(1-\omega)(1+\omega).
$$

Both factorizations have length $2$.

Another example:

$$
9=3\cdot3=(2-\omega)(2+\omega).
$$

Again both factorizations have length $2$.

A larger example appears at the associate class of $18$. In the reduced game, unit factors are suppressed, so the cleanest notation is to write factorizations of the class $[18]$:

$$
[18]=[2][3][3],
$$

$$
[18]=[2][2-\omega][2+\omega],
$$

and

$$
[18]=[1-\omega][1+\omega][3].
$$

The simulation found five atom factorizations of $[18]$, all of length $3$:

$$
[18]=[2][2-\omega][2+\omega],
$$

$$
[18]=[2][3][3],
$$

$$
[18]=[1-\omega]^2[2-\omega],
$$

$$
[18]=[1-\omega][1+\omega][3],
$$

$$
[18]=[1+\omega]^2[2+\omega].
$$

For example, $(1-\omega)^2(2-\omega)=-18$, which is the same reduced class as $18$ because $-1$ is a unit.

So this world has real multiplication, abundant atoms, nonunique factorization, but still a hidden conservation law: factorization length is preserved.

---

## 4. Standalone Script

[Standalone Python script](/scripts/prime-games-3.py)

---

## References

1. Dummit, *Math 3527 Number Theory I: Finite Fields lecture notes*. The notes derive the formula for the number of monic irreducible polynomials over $\mathbb F_p[x]$ using $x^{p^n}-x$ and Möbius inversion.  
   https://dummit.cos.northeastern.edu/teaching_sp20_3527/3527_lecture_25_finite_fields.pdf

2. Keith Conrad, *The Gaussian Integers*. This gives the norm, units, Euclidean algorithm, unique factorization, and the classification of Gaussian primes.  
   https://kconrad.math.uconn.edu/blurbs/ugradnumthy/Zinotes.pdf

3. Keith Conrad, *Remarks about Euclidean Domains*. This gives a standard definition of Euclidean domains and the role of division with remainder.  
   https://kconrad.math.uconn.edu/blurbs/ringtheory/euclideanrk.pdf

4. Akhil Mathew, *CRing Project, Chapter 7*. This includes the standard example $6=2\cdot3=(1+\sqrt{-5})(1-\sqrt{-5})$ showing failure of unique factorization in $\mathbb Z[\sqrt{-5}]$.  
   https://math.uchicago.edu/~amathew/chintegrality.pdf

5. Scott T. Chapman, Felix Gotti, and Marly Gotti, *How do elements really factor in $\mathbb Z[\sqrt{-5}]$?* This paper discusses the nonunique but half-factorial behavior of $\mathbb Z[\sqrt{-5}]$.  
   https://arxiv.org/abs/1711.10842
