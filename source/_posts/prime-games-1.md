---
title: Prime Games I
date: 2026-07-01 18:21:47
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

# Prime Games I: Generators, Multipliers, and Distributions

The usual prime numbers are only one version of a more general game.

A **prime game** starts with a generated sequence of elements

$$
a_0, a_1, a_2, a_3, \dots
$$

and two rules:

1. A **generator** that uniquely produces the next element:

$$
G(a_n)=a_{n+1}.
$$

2. A **multiplication rule** that combines two elements and always lands later in the sequence:

$$
a_i \otimes a_j = a_{\mu(i,j)}.
$$

For non-identity elements, we want

$$
\mu(i,j)>\max(i,j) \qquad \text{for } i,j>0.
$$

The identity element is usually $a_0$. If $a_0$ is included, it is exempt from the greater-index rule, because identity multiplication should satisfy $a_0\otimes a_n=a_n$.

A **game-prime** is an element $a_n$, with $n>0$, that cannot be written as

$$
a_n=a_i\otimes a_j
$$

for any $i,j>0$.

So the central idea is simple:

$$
\boxed{\text{game-primes are the elements whose indices are not hit by the multiplication table.}}
$$

Equivalently:

$$
\boxed{\text{prime distribution} = \text{complement of the image of } \mu.}
$$

The generator gives the ordering. The multiplier decides which later elements get crossed out as composites.

Throughout this post, $P_N$ means:

$$
P_N = Count \( \text{game-prime indices } n : 1\le n\le N \).
$$

So all tables compare the first $N$ **non-identity indices**, not necessarily all values below a fixed numeric cutoff.

---

## 1. Natural Numbers

Let

$$
a_n=n+1.
$$

So the universe is

$$
1,2,3,4,5,6,\dots
$$

The generator is

$$
G(x)=x+1.
$$

Multiplication is ordinary multiplication:

$$
a_i\otimes a_j=(i+1)(j+1).
$$

Since $a_k=k+1$, the index rule is

$$
\mu(i,j)=(i+1)(j+1)-1=ij+i+j.
$$

The game-primes are exactly the ordinary primes:

$$
2,3,5,7,11,13,17,19,\dots
$$

The usual prime number theorem says the density of ordinary primes near size $x$ is roughly

$$
\frac{1}{\log x}.
$$

In this game, that familiar thinning-out pattern is produced by the image of

$$
\mu(i,j)=ij+i+j.
$$

---

## 2. Original examples

These are the first examples from the game, now placed side-by-side.

| Game | Elements $a_n$ | Multiplier index rule $\mu(i,j)$ | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | First few game-prime values |
|---|---:|---:|---:|---:|---:|---|
| Ordinary numbers | $n+1$ | $ij+i+j$ | 26 | 168 | 1,229 | $2,3,5,7,11,13,17,19,23,29,31,37$ |
| Odd numbers | $2n+1$ | $2ij+i+j$ | 45 | 302 | 2,261 | $3,5,7,11,13,17,19,23,29,31,37,41$ |
| $1 \pmod 4$ numbers | $4n+1$ | $4ij+i+j$ | 67 | 533 | 4,420 | $5,9,13,17,21,29,33,37,41,49,53,57$ |
| Squares | $(n+1)^2$ | $ij+i+j$ | 26 | 168 | 1,229 | $4,9,25,49,121,169,289,361,529,841,961,1369$ |
| Powers of two | $2^n$ | $i+j$ | 1 | 1 | 1 | $2$ |

The first row is the usual prime system.

The odd-number row removes all even numbers. Since odd times odd is odd, this world is closed under ordinary multiplication. The game-primes are the odd ordinary primes.

The $1\pmod 4$ row is more interesting. It includes numbers like

$$
9,21,33,49,57,\dots
$$

as game-primes, even though they are ordinary composites. For example:

$$
9=3\cdot 3,
$$

but $3$ is not in the $1\pmod 4$ universe. So inside this world, $9$ has no nontrivial factorization.

This shows one of the main lessons:

$$
\boxed{\text{prime-ness depends on the universe of allowed factors.}}
$$

The squares row has the same index rule as ordinary multiplication, so the prime-index distribution is the same as the ordinary primes. But by value, the primes are much farther apart, because the values grow quadratically.

The powers-of-two row is the opposite extreme. Since

$$
2^i\cdot 2^j=2^{i+j},
$$

we have

$$
\mu(i,j)=i+j.
$$

Then every index after $1$ is hit:

$$
2 = 1+1,\quad 3=1+2,\quad 4=1+3,\quad \dots
$$

So the only game-prime is $2$.

---

## 3. The $qn+1$ family

Now generalize the odd and $1\pmod 4$ games.

Let

$$
a_n=qn+1.
$$

The elements are

$$
1,q+1,2q+1,3q+1,\dots
$$

The generator is

$$
G(x)=x+q.
$$

This universe is closed under ordinary multiplication, because

$$
(qi+1)(qj+1)=q(qij+i+j)+1.
$$

So the multiplier index rule is

$$
\boxed{\mu_q(i,j)=qij+i+j.}
$$

Special cases:

$$
q=1 \Rightarrow \text{ordinary numbers},
$$

$$
q=2 \Rightarrow \text{odd numbers},
$$

$$
q=4 \Rightarrow \text{numbers }1\pmod 4.
$$

A useful observation is that the first composite index is

$$
\mu_q(1,1)=q+2.
$$

So the first $q+1$ non-identity indices are automatically game-prime. Larger $q$ creates a longer initial prime run.

### Simulation: $qn+1$ worlds

| $q$ | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | $P_{100000}$ |
|---:|---:|---:|---:|---:|
| 1 | 26 | 168 | 1,229 | 9,592 |
| 2 | 45 | 302 | 2,261 | 17,983 |
| 3 | 60 | 465 | 3,781 | 31,926 |
| 4 | 67 | 533 | 4,420 | 37,684 |
| 5 | 74 | 631 | 5,515 | 49,248 |
| 6 | 77 | 648 | 5,523 | 47,976 |
| 7 | 81 | 720 | 6,456 | 58,889 |
| 8 | 84 | 741 | 6,615 | 59,823 |
| 9 | 86 | 772 | 7,028 | 64,708 |
| 10 | 87 | 788 | 7,127 | 65,277 |
| 11 | 89 | 816 | 7,557 | 70,682 |
| 12 | 91 | 822 | 7,533 | 69,361 |
| 15 | 92 | 864 | 8,097 | 76,161 |
| 20 | 95 | 900 | 8,546 | 81,337 |
| 24 | 96 | 920 | 8,792 | 84,091 |
| 30 | 97 | 938 | 9,036 | 87,064 |
| 60 | 99 | 973 | 9,561 | 93,817 |

The broad trend is clear: as $q$ grows, the product term $qij$ pushes more products beyond a fixed index window, so fewer indices are crossed out as composites.

The trend is not perfectly monotone at every finite cutoff. For example, $q=5$ and $q=6$ are close, and their counts can swap depending on the cutoff. The value of $q$ changes both the size of the product term and the arithmetic structure of the allowed residue class.

### First game-primes in selected $qn+1$ worlds

| $q$ | Universe | First few game-prime values |
|---:|---|---|
| 1 | $1,2,3,4,5,\dots$ | $2,3,5,7,11,13,17,19,23,29,31,37$ |
| 2 | $1,3,5,7,9,\dots$ | $3,5,7,11,13,17,19,23,29,31,37,41$ |
| 3 | $1,4,7,10,13,\dots$ | $4,7,10,13,19,22,25,31,34,37,43,46$ |
| 4 | $1,5,9,13,17,\dots$ | $5,9,13,17,21,29,33,37,41,49,53,57$ |
| 6 | $1,7,13,19,25,\dots$ | $7,13,19,25,31,37,43,55,61,67,73,79$ |
| 10 | $1,11,21,31,41,\dots$ | $11,21,31,41,51,61,71,81,91,101,111,131$ |
| 30 | $1,31,61,91,121,\dots$ | $31,61,91,121,151,181,211,241,271,301,331,361$ |

In these worlds, ordinary composite numbers often become game-prime.

For $q=30$, the value $91=7\cdot 13$ is game-prime because neither $7$ nor $13$ is congruent to $1\pmod {30}$. The world only allows factors of the form

$$
30n+1.
$$

So many ordinary factorizations are invisible inside the game.

---

## 4. Unique factorization can fail

The ordinary positive integers have unique prime factorization. Prime games do not automatically inherit that property.

In the $1\pmod 4$ game,

$$
9,21,49
$$

are all game-prime.

But

$$
441=9\cdot 49=21\cdot 21.
$$

Both are valid factorizations using game-primes from the $1\pmod 4$ universe.

So this game has irreducible elements, but it does not have unique factorization.

That distinction matters:

$$
\boxed{\text{irreducible} \neq \text{part of a unique prime factorization}.}
$$

---

## 5. Index-only multiplier games

The $qn+1$ games come from ordinary multiplication on selected numeric universes.

But we can also define games directly on indices. In these games, the actual values $a_n$ can be treated as abstract labels. The entire prime distribution comes from the multiplier index function $\mu(i,j)$.

The only required condition is still

$$
\mu(i,j)>\max(i,j) \qquad i,j>0.
$$

Sublinear functions like $\sqrt{x}$ and $\log x$ cannot usually be used alone, because they would not land beyond both inputs. But they can be used as **surcharges** on top of a safe baseline such as $i+j$ or $\max(i,j)$.

For the simulations below, $\log$ means $\log_2$, and all square-root and logarithm terms are ceiled.

### Simulation: artificial index multipliers

| Family | Multiplier rule $\mu(i,j)$ | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | First game-prime indices |
|---|---:|---:|---:|---:|---|
| Additive | $i+j$ | 1 | 1 | 1 | $1$ |
| Shifted additive | $i+j+1$ | 2 | 2 | 2 | $1,2$ |
| Additive + sqrt-sum surcharge | $i+j+\lceil\sqrt{i+j}\rceil$ | 11 | 33 | 101 | $1,2,3,7,13,21,31,43,57,73,91,111$ |
| Additive + log-sum surcharge | $i+j+\lceil\log_2(i+j)\rceil$ | 8 | 11 | 15 | $1,2,4,7,12,21,38,71,136,265,522,1035$ |
| Additive + separated sqrt surcharge | $i+j+\lceil\sqrt{i}\rceil+\lceil\sqrt{j}\rceil$ | 4 | 4 | 4 | $1,2,3,5$ |
| Additive + separated log surcharge | $i+j+\lceil\log_2(i+1)\rceil+\lceil\log_2(j+1)\rceil$ | 4 | 4 | 4 | $1,2,3,5$ |
| Additive + sqrt-product surcharge | $i+j+\lceil\sqrt{ij}\rceil$ | 3 | 3 | 3 | $1,2,4$ |
| Additive + log-product surcharge | $i+j+\lceil\log_2(ij+1)\rceil$ | 3 | 3 | 3 | $1,2,4$ |
| Max-base + sqrt-sum jump | $\max(i,j)+\lceil\sqrt{i+j}\rceil$ | 2 | 2 | 2 | $1,2$ |
| Max-base + log-sum jump | $\max(i,j)+\lceil\log_2(i+j+1)\rceil$ | 2 | 2 | 2 | $1,2$ |
| Max-base + sqrt-product jump | $\max(i,j)+\lceil\sqrt{ij}\rceil$ | 2 | 2 | 2 | $1,3$ |
| Max-base + log-product jump | $\max(i,j)+\lceil\log_2(ij+1)\rceil$ | 2 | 2 | 2 | $1,3$ |

These artificial games make the image-of-$\mu$ idea very visible.

The additive rule

$$
\mu(i,j)=i+j
$$

is too efficient at crossing things out. Every index after $1$ is composite.

The shifted rule

$$
\mu(i,j)=i+j+1
$$

leaves exactly two primes, $1$ and $2$, then crosses out everything else.

The sum-surcharge rules are more interesting.

For

$$
\mu(i,j)=i+j+\lceil\sqrt{i+j}\rceil,
$$

let

$$
s=i+j.
$$

Every $s\ge 2$ is possible as a sum of two positive indices, so the composite indices are exactly

$$
s+\lceil\sqrt{s}\rceil.
$$

The missing indices form a sparse sequence:

$$
1,2,3,7,13,21,31,43,57,73,91,\dots
$$

After the initial terms, these are

$$
m(m+1)+1.
$$

So the number of game-primes up to $N$ grows on the order of

$$
\sqrt{N}.
$$

For

$$
\mu(i,j)=i+j+\lceil\log_2(i+j)\rceil,
$$

again set $s=i+j$. The composite indices are

$$
s+\lceil\log_2 s\rceil.
$$

The gaps occur near powers of two:

$$
1,2,4,7,12,21,38,71,136,265,522,\dots
$$

After the initial terms, these are

$$
2^m+m+1.
$$

So the number of game-primes up to $N$ grows on the order of

$$
\log N.
$$

This is a nice design principle:

$$
\boxed{\mu(i,j)=i+j+f(i+j) \text{ creates prime gaps controlled by the jumps of } f.}
$$

If $f$ is a staircase function like $\lceil\sqrt{s}\rceil$ or $\lceil\log s\rceil$, then game-primes live at the places where the staircase jumps.

The product-sensitive and max-base rules behave differently. They cross out almost everything very quickly. In the first $10{,}000$ indices, each of those rules leaves only a few seed-primes. This is a useful warning: adding a sublinear term does not automatically create a rich prime distribution. The structure of the image of $\mu$ matters more than the growth rate of a single term.

---

## 6. What controls the prime distribution?

The experiments suggest three main levers.

### 1. The ordering

The generator decides which element receives which index.

For example, ordinary numbers and squares can share the same multiplier index rule:

$$
\mu(i,j)=ij+i+j.
$$

So they have the same prime-index distribution. But their values grow differently:

$$
n+1 \quad \text{versus} \quad (n+1)^2.
$$

By index, the prime counts match. By value, the square game is much sparser.

### 2. The allowed universe

The $qn+1$ games show that restricting the universe changes irreducibility.

When factors are removed from the universe, ordinary composites can become game-prime.

Examples:

$$
9 \text{ is game-prime in the } 1\pmod 4 \text{ world},
$$

$$
91 \text{ is game-prime in the } 1\pmod {30} \text{ world}.
$$

### 3. The image of multiplication

The most direct control knob is the index multiplier $\mu(i,j)$.

If $\mu$ hits almost every index, there are very few primes.

If $\mu$ leaves many gaps, primes are dense.

Some rough patterns from the simulations:

| Multiplier behavior | Resulting prime distribution |
|---|---|
| $\mu=i+j$ | Only one prime |
| $\mu=i+j+1$ | Only two primes |
| $\mu=i+j+\lceil\log(i+j)\rceil$ | About $\log N$ primes up to index $N$ |
| $\mu=i+j+\lceil\sqrt{i+j}\rceil$ | About $\sqrt N$ primes up to index $N$ |
| $\mu=qij+i+j$ | Prime density depends on residue-class universe |
| Max-base jump rules | Very fast collapse to a few seed-primes in the tested range |

---

## 7. Standalone Script

[Standalone Python script](/scripts/prime-games-1.py)

---

## 8. Takeaways

The ordinary primes are produced by one particular game:

$$
a_n=n+1,
\qquad
\mu(i,j)=ij+i+j.
$$

But once we separate the generator from the multiplier, many other prime distributions become possible.

The $qn+1$ games show how changing the allowed universe changes irreducibility. Some ordinary composites become game-prime because their ordinary factors are not legal elements.

The artificial index games show that the prime distribution can be engineered directly. Additive multiplication destroys almost all primes. Logarithmic and square-root surcharge rules can create prime counts that grow like $\log N$ or $\sqrt N$. Product-sensitive and max-base rules can collapse back to only a few seed-primes.

## Follow up in this series
WIP
