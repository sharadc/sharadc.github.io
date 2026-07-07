---
title: Prime Games IV
date: 2026-07-06 22:44:03
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

# Prime Games IV: Restricted Multiplication Rules

In the earlier posts, we treated multiplication as a total operation: given two non-unit elements, their product always existed and always landed later in the ordered sequence. This post studies a different idea:

> What if multiplication is only allowed for compatible pairs?

The main example is:

$$
a \star b = ab \quad \text{only when } \gcd(a,b)=1.
$$

This turns ordinary multiplication into a **restricted multiplication game**. A number is no longer composite merely because it factors. It is composite only if it factors through an **allowed** product.

Under ordinary multiplication, the atoms are the ordinary primes. Under coprime-only multiplication, the atoms are the **prime powers**:

$$
2,3,4,5,7,8,9,11,13,16,17,19,23,25,27,\dots
$$

The reason is simple. A number such as

$$
12 = 3\cdot 4
$$

is composite because $3$ and $4$ are coprime. But

$$
16 = 2\cdot 8 = 4\cdot 4
$$

has no nontrivial factorization into coprime factors. So $16$ becomes prime-like in this game.

---

## 1. Formal definition: restricted multiplication game

Start with a base multiplicative monoid

$$
(M,\cdot,1).
$$

For this post, the main example is

$$
M=\mathbb N_{\ge 1}
$$

under ordinary multiplication. The only unit is $1$.

Now choose a compatibility predicate

$$
R(a,b)\in\{\text{true},\text{false}\}.
$$

Define the restricted product

$$
a\star b = ab
$$

when $R(a,b)$ is true, and leave $a\star b$ undefined when $R(a,b)$ is false.

A non-unit $n\in M$ is a **restricted composite** if there exist non-units $a,b\in M$ such that

$$
n=ab
$$

and

$$
R(a,b)=\text{true}.
$$

A non-unit $n$ is a **restricted atom**, or **restricted prime**, if no such allowed factorization exists.

So the prime game changes from this:

$$
\text{composite} = \text{has any nontrivial factorization}
$$

to this:

$$
\text{restricted composite} = \text{has an allowed nontrivial factorization}.
$$

---

## 2. What makes a restriction a real multiplication rule?

Some restrictions are merely pair filters. They can still produce interesting sieves, but they do not behave like multiplication.

For a restriction to be a **real partial multiplication rule**, it should satisfy the partial monoid laws.

### Unit law

The unit should multiply with everything:

$$
R(1,a)=R(a,1)=\text{true},
$$

and

$$
1\star a=a\star 1=a.
$$

### Partial associativity

This is the important condition. Since the underlying product is associative, the values agree automatically when both sides exist. The real issue is definedness.

We want

$$
(a\star b)\star c
$$

to be defined exactly when

$$
a\star(b\star c)
$$

is defined. In terms of $R$, this means:

$$
R(a,b)\ \text{and}\ R(ab,c)
$$

if and only if

$$
R(b,c)\ \text{and}\ R(a,bc).
$$

When this holds, the operation is a **partial monoid**. 

## 3. Unitary multiplication

Define

$$
R_{\mathrm{unitary}}(a,b): \gcd(a,b)=1.
$$

Then

$$
a\star b=ab
$$

only when the factors share no prime factor.

This is a real partial multiplication rule. Indeed,

$$
\gcd(ab,c)=1
$$

if and only if

$$
\gcd(a,c)=1
\quad\text{and}\quad
\gcd(b,c)=1.
$$

Therefore both parenthesizations of $a\star b\star c$ are defined exactly when $a,b,c$ are pairwise coprime.

### Atoms

The restricted atoms are exactly the prime powers:

$$
p^k,
\quad p\text{ prime},\quad k\ge 1.
$$

| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |
|---|---:|---:|---:|---:|---|
| $\gcd(a,b)=1$ | 35 | 193 | 1,280 | 9,700 | $2,3,4,5,7,8,9,11,13,16,17,19,23,25,27,\dots$ |

This is the cleanest restricted multiplication game.

The distribution is only slightly denser than ordinary primes because prime powers beyond first powers are sparse:

$$
A_{\mathrm{unitary}}(X)=Count(p^k\le X:k\ge1)
$$

Asymptotically this is

$$
\pi(X)+O(\sqrt X),
$$

so the leading term is still prime-like.

---

## 4. Feature-disjoint multiplication: restrict by prime colors

The previous two rules track individual primes. We can generalize by assigning every prime a **feature** or **color**.

Let

$$
c(p)\in C
$$

be a color assigned to each prime. For a number $n$, define its color support:

$$
\mathrm{col}(n)=\{c(p):p\mid n\}.
$$

Now define

$$
R_c(a,b):
\mathrm{col}(a)\cap \mathrm{col}(b)=\emptyset.
$$

Factors are compatible only if they do not use any common prime color.

This is associative for the same reason as the support rules:

$$
\mathrm{col}(ab)=\mathrm{col}(a)\cup\mathrm{col}(b).
$$

### Prime colors modulo 4

Color primes by

$$
2,
\quad 1\pmod 4,
\quad 3\pmod 4.
$$

Then two factors are compatible only if their prime factors occupy disjoint mod-4 color classes.

Atoms are numbers whose prime factors all live in a single color class.

Examples:

$$
21=3\cdot 7
$$

is an atom because both $3$ and $7$ are $3\pmod4$. Splitting them would put the same color on both sides.

But

$$
15=3\cdot5
$$

is composite because $3$ and $5$ have different colors.

| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |
|---|---:|---:|---:|---:|---|
| Disjoint prime colors $\{2,1\bmod4,3\bmod4\}$ | 45 | 331 | 2,765 | 24,539 | $2,3,4,5,7,8,9,11,13,16,17,19,21,23,25,\dots$ |

This produces a much denser atom set than ordinary unitary multiplication.

### Prime colors modulo 3

Color primes by residue modulo $3$:

$$
0\pmod3,
\quad 1\pmod3,
\quad 2\pmod3.
$$

| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |
|---|---:|---:|---:|---:|---|
| Disjoint prime colors modulo $3$ | 54 | 412 | 3,471 | 30,675 | $2,3,4,5,7,8,9,10,11,13,16,17,19,20,22,\dots$ |

The mod-3 color rule has even more atoms in these cutoffs because many composites use primes from a single color bucket.

---

## 5. GCD-threshold multiplication

A natural relaxation of the unitary rule is:

$$
R_T(a,b):\gcd(a,b)\le T.
$$

For $T=1$, this is unitary multiplication.

For $T>1$, this is usually not associative. Example with $T=2$:

$$
\gcd(2,6)=2,
$$

so $2\star6$ is allowed, but once we multiply first, compatibility with a third factor can change in a way that depends on parenthesization.

Still, the atom set has a clean pattern.

### Atoms

Under $\gcd(a,b)\le T$, the atoms are ordinary primes plus powers $p^k$ where $p>T$.

Why? If $p\le T$, then

$$
p^2=p\cdot p
$$

is allowed. But if $p>T$, then every split of $p^k$ has gcd divisible by $p$, so no split is allowed.

| Rule | Algebraic status | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |
|---|---|---:|---:|---:|---:|---|
| $\gcd(a,b)\le2$ | screened | 30 | 185 | 1,268 | 9,685 | $2,3,5,7,9,11,13,17,19,23,25,27,\dots$ |
| $\gcd(a,b)\le6$ | screened | 26 | 177 | 1,257 | 9,670 | $2,3,5,7,11,13,17,19,23,29,31,37,\dots$ |

---

## 6. Bi-unitary multiplication screen

A divisor $d\mid n$ is **bi-unitary** when the greatest common unitary divisor of $d$ and $n/d$ is $1$. In prime-exponent language, this means no prime appears with the same positive exponent on both sides.[^biunitary]

This suggests the pair rule:

$$
R_{**}(a,b):
\text{there is no prime }p\text{ such that }v_p(a)=v_p(b)>0.
$$

So:

$$
2\cdot 4
$$

is allowed, because the exponents of $2$ are $1$ and $2$.

But

$$
4\cdot4
$$

is not allowed, because the exponents of $2$ are $2$ and $2$.

This is not associative. For instance, with $2\cdot4\cdot8$, one parenthesization fails where another can succeed.

### Atoms

The atoms are exactly:

$$
\text{ordinary primes}\quad\text{and}\quad\text{prime squares}.
$$

Why? A prime square

$$
p^2=p\cdot p
$$

is not allowed, because both sides have exponent $1$. But for $k\ge3$,

$$
p^k=p\cdot p^{k-1}
$$

is allowed, since $1\ne k-1$. Any number with at least two distinct prime factors has a coprime split and is composite.

| Rule | Algebraic status | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |
|---|---|---:|---:|---:|---:|---|
| No equal positive shared exponent | screened | 29 | 179 | 1,254 | 9,657 | $2,3,4,5,7,9,11,13,17,19,23,25,29,31,\dots$ |

---

## 7. Distance-filtered multiplication

Now consider restrictions based on the numerical distance between two factors.

These rules are generally not associative, but they are interesting because they ask geometric questions about the divisor diagram of $n$.

For a factorization

$$
n=ab,
\quad a\le b,
$$

we can measure distance additively:

$$
b-a,
$$

or multiplicatively:

$$
\frac ba.
$$

### 14.1 Near-factor multiplication

Allow only factor pairs that are close:

$$
R_D^{\mathrm{near}}(a,b): |a-b|\le D.
$$

or

$$
R_\rho^{\mathrm{balanced}}(a,b):\frac{\max(a,b)}{\min(a,b)}\le\rho.
$$

These rules mark a number composite only when it has a factorization near its square root.

| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |
|---|---:|---:|---:|---:|---|
| $\|a-b\|\le10$ | 45 | 723 | 8,970 | 96,594 | $2,3,5,7,11,13,17,19,23,26,29,31,\dots$ |
| $\|a-b\|\le100$ | 25 | 341 | 5,824 | 77,896 | $2,3,5,7,11,13,17,19,23,29,31,37,\dots$ |
| ratio $\le2$ | 58 | 665 | 7,069 | 73,131 | $2,3,5,7,10,11,13,14,17,19,21,22,\dots$ |
| ratio $\le10$ | 33 | 433 | 5,025 | 54,754 | $2,3,5,7,11,13,17,19,23,29,31,37,\dots$ |

Near-factor rules create many atoms because most composite numbers have their most obvious factorization far from balanced.

Example:

$$
26=2\cdot13
$$

is composite ordinarily, but under $|a-b|\le10$, the gap is $11$, so $26$ becomes an atom.

### Far-factor multiplication

Now do the opposite. Allow only sufficiently far-apart factors:

$$
R_D^{\mathrm{far}}(a,b): |a-b|\ge D.
$$

or

$$
R_\rho^{\mathrm{unbalanced}}(a,b):\frac{\max(a,b)}{\min(a,b)}\ge\rho.
$$

These rules mark composites through small-factor splits, while near-square composites may survive.

| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |
|---|---:|---:|---:|---:|---|
| $\|a-b\|\ge10$ | 47 | 208 | 1,306 | 9,759 | $2,3,4,5,6,7,8,9,10,11,12,13,\dots$ |
| ratio $\ge10$ | 66 | 296 | 1,858 | 13,561 | $2,3,4,5,6,7,8,9,10,11,12,13,\dots$ |

Far-factor rules are closer to ordinary prime behavior, because many composites have a small-factor split.

---

## 8. Coprime plus distance

The gcd rule and distance rule can be combined.

For example:

$$
R(a,b):\gcd(a,b)=1\quad\text{and}\quad |a-b|\le10.
$$

This says that a factorization is allowed only when the factors are both coprime and close together.

| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |
|---|---:|---:|---:|---:|---|
| $\gcd=1$ and $\|a-b\|\le10$ | 63 | 830 | 9,403 | 98,058 | $2,3,4,5,7,8,9,11,13,16,17,19,\dots$ |
| $\gcd=1$ and ratio $\le2$ | 78 | 792 | 7,978 | 80,528 | $2,3,4,5,7,8,9,10,11,13,14,16,\dots$ |
| $\gcd=1$ and $\|a-b\|\ge10$ | 62 | 258 | 1,383 | 9,875 | $2,3,4,5,6,7,8,9,10,11,12,13,\dots$ |
| $\gcd=1$ and ratio $\ge10$ | 82 | 423 | 2,352 | 15,205 | $2,3,4,5,6,7,8,9,10,11,12,13,\dots$ |

The first two rows are extremely restrictive. Almost everything becomes atom-like.

The last two rows preserve a prime-like sparse set while adding structure.

---

## 9. Factor-budget multiplication

Another useful screen is computational:

$$
R_B(a,b):\min(a,b)\le B.
$$

This means a product is allowed only if one factor is small. It models a trial-division budget.

A number becomes composite only if it has a factor no larger than $B$. Therefore the atoms are primes plus composite numbers whose prime factors all exceed $B$. These are sometimes called $B$-rough numbers.

| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | First atoms |
|---|---:|---:|---:|---:|---|
| $\min(a,b)\le10$ | 25 | 231 | 2,288 | 22,860 | $2,3,5,7,11,13,17,19,23,29,31,37,\dots$ |
| $\min(a,b)\le100$ | 25 | 168 | 1,229 | 11,855 | $2,3,5,7,11,13,17,19,23,29,31,37,\dots$ |

The $B=100$ row matches ordinary primes through $10{,}000$, because every composite $n\le10{,}000$ has a factor at most $100$. Past $10{,}000$, semiprimes such as

$$
101\cdot103
$$

start surviving.

Two related budget screens are:

$$
R(a,b):\max(a,b)\le100
$$

and

$$
R(a,b):\min(a,b)\ge10.
$$

| Rule | $A(100)$ | $A(1000)$ | $A(10000)$ | $A(100000)$ | Interpretation |
|---|---:|---:|---:|---:|---|
| both factors $\le100$ | 25 | 360 | 7,119 | 97,119 | products only from a finite multiplication table |
| both factors $\ge10$ | 98 | 582 | 3,936 | 29,781 | small-factor composites survive |

The first rule is almost a finite-table game. Once $n$ is large enough, most numbers cannot be hit.

---

## 10. Standalone Script

[Standalone Python script](/scripts/prime-games-4.py)

---
