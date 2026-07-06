---
title: Prime Games II
date: 2026-07-02 18:20:27
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

# Prime Games II: Real Multiplications

Previously, we let ourselves invent multiplier functions freely:

$$
\mu(i,j)=i+j+\lceil \sqrt{i+j}\rceil,
\qquad
\mu(i,j)=i+j+\lceil 2+2\sin(2\pi(i+j)/m)\rceil,
$$

and so on. Those are useful as **sieves**, but they are not automatically multiplication. A true multiplication rule has to survive a much stricter test: it must not depend on where we put the parentheses.

This post, we will separate “composite-marking rules” from real multiplication rules, then build a list of  prime games on monoids.

---

## 1. The formal test

A **monoid** is a set with a closed associative binary operation and an identity element. [^1] For our game, that means we want a countable universe

$$
M=\{a_0,a_1,a_2,\dots\}
$$

with identity

$$
a_0=e
$$

and a binary operation

$$
\otimes:M\times M\to M.
$$

The induced index multiplication is the function

$$
\mu(i,j)=k
\quad\text{when}\quad
a_i\otimes a_j=a_k.
$$

For $\mu$ to be a **real multiplication rule**, it should satisfy:

- **Identity**

$$
\mu(0,n)=\mu(n,0)=n.
$$

- **Associativity**

$$
\mu(\mu(i,j),k)=\mu(i,\mu(j,k)).
$$

- **Closure**. For every pair $(i,j)$, the product must land back in the same universe:

$$
a_i\otimes a_j\in M.
$$

- **Growth**. For the prime game, we also want products of non-identity elements to appear later:

$$
i,j>0
\quad\Longrightarrow\quad
\mu(i,j)>\max(i,j).
$$

This last condition is not part of the ordinary definition of a monoid. It is our game-specific condition. It rules out finite groups, Boolean union/intersection monoids, and other structures where multiplying can keep you in place or move backward.

In ordinary factorization theory, our “game-primes” are usually called **atoms** or **irreducibles**: non-unit elements that cannot be written as a product of two non-units. [^2]

---

## 2. Why surcharge and trigonometric rules usually fail

A surcharge rule may look multiplication-like:

$$
\mu(i,j)=i+j+\lceil\sqrt{i+j}\rceil.
$$

It has the right growth behavior, but it is not associative.

For example:

$$
\mu(\mu(1,1),4)=11,
$$

while

$$
\mu(1,\mu(1,4))=12.
$$

So the two products

$$
(a_1\otimes a_1)\otimes a_4
$$

and

$$
a_1\otimes(a_1\otimes a_4)
$$

do not agree.

That is not multiplication. It is only a composite-index generator.

The same warning applies to most ceiled trig rules:

$$
i+j+\left\lceil A+B\sin(i+j)\right\rceil,
$$

or

$$
i+j+\left\lceil A+B\sin(i)\sin(j)\right\rceil.
$$

They can make beautiful sieves, but unless they satisfy the associativity equation, they are not real multiplication.

There is one honest trigonometric exception: rotations.

$$
e^{i\theta}\cdot e^{i\phi}=e^{i(\theta+\phi)}.
$$

Equivalently,

$$
(\cos\theta,\sin\theta)\otimes(\cos\phi,\sin\phi) =
(\cos(\theta+\phi),\sin(\theta+\phi)).
$$

That is real multiplication because it is just complex multiplication. But it is a group-like world: elements have inverses, products do not strictly move later, and the atom distribution is not a prime-game distribution.

A “spiral” version,

$$
z_n=R^n e^{in\theta},
$$

does give

$$
z_i z_j=z_{i+j}.
$$

So the induced rule is simply

$$
\mu(i,j)=i+j.
$$

That is real, but the trig part is decorative. It gives the same prime game as a geometric progression: one atom, then everything else is composite.

---

## 3. The $1\pmod q$ family

Let

$$
a_n=1+qn.
$$

Then

$$
(1+qi)(1+qj) =
1+q(i+j+qij).
$$

So the real index multiplication is

$$
\boxed{\mu_q(i,j)=i+j+qij.}
$$

This is a perfect example of a rule that *looks* like a surcharge but is actually real multiplication. It is not arbitrary. It comes from ordinary multiplication inside the closed monoid

$$
M_q=\{1,1+q,1+2q,1+3q,\dots\}.
$$

Special cases:
- **Ordinary integers**
$$
q=1
\quad\Rightarrow\quad
\mu(i,j)=i+j+ij,
$$

$$
1,2,3,4,5,6,7,\dots
$$

- **Odd numbers**
$$
q=2
\quad\Rightarrow\quad
\mu(i,j)=i+j+2ij,
$$

$$
1,3,5,7,9,11,\dots
$$

- **The Hilbert monoid**
$$
q=4
\quad\Rightarrow\quad
\mu(i,j)=i+j+4ij,
$$

$$
1,5,9,13,17,21,\dots
$$

In $M_4$, numbers like $9$ and $21$ become atoms because their ordinary factors are not in the universe.

A classic non-unique factorization appears in the Hilbert monoid:

$$
441=9\cdot49=21\cdot21.
$$

Here $9,21,49$ are atoms inside $1+4\mathbb N_0$. [^3]

Counts below are atoms among the first $N$ non-identity elements.

| Monoid | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | First few atoms |
| --- | --- | --- | --- | --- |
| ordinary integers | 26 | 168 | 1229 | 2, 3, 5, 7, 11, 13, 17, 19, ... |
| $1 \bmod 2$ | 45 | 302 | 2261 | 3, 5, 7, 11, 13, 17, 19, 23, ... |
| $1 \bmod 3$ | 60 | 465 | 3781 | 4, 7, 10, 13, 19, 22, 25, 31, ... |
| $1 \bmod 4$ | 67 | 533 | 4420 | 5, 9, 13, 17, 21, 29, 33, 37, ... |
| $1 \bmod 6$ | 77 | 648 | 5523 | 7, 13, 19, 25, 31, 37, 43, 55, ... |
| $1 \bmod 12$ | 91 | 822 | 7533 | 13, 25, 37, 49, 61, 73, 85, 97, ... |
| $1 \bmod 30$ | 97 | 938 | 9036 | 31, 61, 91, 121, 151, 181, 211, 241, ... |


As $q$ grows, multiplication becomes more selective. Fewer products remain inside the universe, so more elements survive as atoms.

---

## 4. Arithmetical Congruence Monoids

The $1\pmod q$ family is only one slice of a larger class.

An **arithmetical congruence monoid** is

$$
M_{a,b}=\{1\}\cup\{a,a+b,a+2b,a+3b,\dots\},
$$

where

$$
0<a\le b
$$

and

$$
a^2\equiv a\pmod b.
$$

That congruence is exactly what makes the progression closed under multiplication:

$$
(a+bx)(a+by)\equiv a^2\equiv a\pmod b.
$$

For $a>1$, use the global enumeration

$$
a_0=1,
\qquad
a_n=a+b(n-1)\quad(n\ge1).
$$

Then for $i,j\ge1$,

$$
\boxed{
\mu(i,j)=
1+\frac{(a+b(i-1))(a+b(j-1))-a}{b}.
}
$$

Equivalently,

$$
\mu(i,j)=
1+\frac{a^2-a}{b}+a(i+j-2)+b(i-1)(j-1).
$$

| Monoid | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | First few atoms |
| --- | --- | --- | --- | --- |
| $M_{4,6}$ | 69 | 665 | 6440 | 4, 10, 22, 28, 34, 46, 52, 58, ... |
| $M_{3,6}$ | 67 | 667 | 6667 | 3, 15, 21, 33, 39, 51, 57, 69, ... |
| $M_{6,10}$ | 78 | 748 | 7233 | 6, 16, 26, 46, 56, 66, 76, 86, ... |
| $M_{4,12}$ | 75 | 750 | 7500 | 4, 28, 40, 52, 76, 88, 100, 124, ... |
| $M_{9,12}$ | 85 | 829 | 8076 | 9, 21, 33, 45, 57, 69, 93, 105, ... |
| $M_{6,15}$ | 81 | 796 | 7848 | 6, 21, 51, 66, 81, 96, 111, 141, ... |
| $M_{10,15}$ | 88 | 869 | 8604 | 10, 25, 40, 55, 70, 85, 115, 130, ... |
| $M_{16,24}$ | 93 | 921 | 9141 | 16, 40, 64, 88, 112, 136, 160, 184, ... |


These are are interesting prime games because they have infinite prime sets and frequent non-unique factorization.

---

## 5. $k$-th powers

Let

$$
a_n=(n+1)^k.
$$

Then

$$
(i+1)^k(j+1)^k=((i+1)(j+1))^k,
$$

so the index rule is again

$$
\boxed{\mu(i,j)=ij+i+j.}
$$

The atoms are

$$
p^k
$$

where $p$ is an ordinary prime.

For squares:

$$
4,9,25,49,121,169,\dots
$$

The index distribution is the same as ordinary primes. The value distribution is much thinner, because values grow like $n^k$.

---

## 6. Free monoids: words under concatenation
Here, Commutativity is optional. Associativity is not.

Let $A$ be an alphabet. The free monoid $A^*$ is the set of all finite words over $A$, with concatenation as multiplication and the empty word as identity.

$$
u\otimes v=uv.
$$

This is associative and usually noncommutative:

$$
AB\ne BA.
$$

If the alphabet is finite, the only atoms are the one-letter words.

For alphabet $\{A,B\}$, the atoms are

$$
A,B.
$$

Everything longer factors.

This is real asymmetric multiplication, but with only finitely many atoms.

| Monoid | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | Atoms |
| --- | --- | --- | --- | --- |
| free monoid on two letters | 2 | 2 | 2 | A, B |

---

## 7. Weighted free monoids

To get infinitely many atoms, use an infinite alphabet

$$
X=\{x_1,x_2,x_3,\dots\}
$$

but assign weights

$$
w(x_n)=n.
$$

A word has weight equal to the sum of its letter weights.

Multiplication is still concatenation:

$$
u\otimes v=uv.
$$

Weight is additive:

$$
w(uv)=w(u)+w(v).
$$

Because there are only finitely many words of any fixed weight, we can enumerate by weight.

Atoms are exactly the single-letter words:

$$
x_1,x_2,x_3,\dots
$$

Words of total weight $m$ correspond to compositions of $m$, so there are

$$
2^{m-1}
$$

words of weight $m$. [^4]

That means the atom density collapses quickly. Up to weight $W$, there are $W$ atoms but $2^W-1$ nonempty words.

If ordered by weight and placing the one-letter word first within each weight, then the atom count among the first $N$ elements is roughly

$$
\lfloor\log_2 N\rfloor+1.
$$

| Monoid | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | Atoms |
| --- | --- | --- | --- | --- |
| weighted free noncommutative monoid | 7 | 10 | 14 | single letters $x_1,x_2,\dots$ |

---

## 8. Free commutative monoids: partitions instead of words

The commutative analogue is the free commutative monoid on weighted generators.

Elements are finite multisets of letters. Multiplication is multiset addition.

A multiset of total weight $m$ corresponds to an integer partition of $m$. The partition function $p(m)$ grows approximately like

$$
p(m)
\sim
\frac{1}{4m\sqrt3}
\exp\left(\pi\sqrt{\frac{2m}{3}}\right).
$$

So the free commutative weighted monoid has more atoms than a finite generated monoid, but atoms are still sparse relative to all elements. [^5]

| Monoid | $P_{100}$ | $P_{1000}$ | $P_{10000}$ | Atoms |
| --- | --- | --- | --- | --- |
| weighted free commutative monoid | 10 | 17 | 26 | singleton multisets $\{x_n\}$ |

---

## 9. Affine transformation monoids

Here is a compact noncommutative monoid with a closed formula.

Let

$$
T_{a,b}(x)=2^a x+b,
$$

where

$$
a,b\in\mathbb N_0.
$$

Composition gives

$$
T_{a,b}\circ T_{c,d}(x) =
2^a(2^c x+d)+b =
2^{a+c}x+(b+2^a d).
$$

So

$$
\boxed{
(a,b)\otimes(c,d)=(a+c,\ b+2^a d).
}
$$

The identity is

$$
(0,0).
$$

This multiplication is asymmetric:

$$
(0,1)\otimes(1,0)=(1,1),
$$

but

$$
(1,0)\otimes(0,1)=(1,2).
$$

The atoms are

$$
S=(0,1)
$$

and

$$
D=(1,0).
$$

But factorization is not unique:

$$
D\otimes S =
S\otimes S\otimes D.
$$

Indeed,

$$
(1,0)\otimes(0,1)=(1,2),
$$

and

$$
(0,1)\otimes(0,1)\otimes(1,0)=(1,2).
$$


It can also be written as a matrix monoid. Then multiplication is ordinary matrix multiplication.

---

## 10. Standalone Script

[Standalone Python script](/scripts/prime-games-2.py)

---
## References
[^1]: Wolfram MathWorld, “Monoid.” https://mathworld.wolfram.com/Monoid.html
[^2]: Alfred Geroldinger and Qinghai Zhong, “Factorization theory in commutative monoids,” *Semigroup Forum* 2020. https://link.springer.com/article/10.1007/s00233-019-10079-0
[^3]: Christopher O’Neill, “Atomic density of arithmetical congruence monoids,” slides, 2022. https://cdoneill.sdsu.edu/slides/20220514-virtualsectional.pdf
[^4]: Integer compositions: each positive integer $n$ has $2^{n-1}$ distinct compositions. https://en.wikipedia.org/wiki/Composition_%28combinatorics%29
[^5]: Partition function asymptotics and generating function. https://en.wikipedia.org/wiki/Partition_function_%28number_theory%29
