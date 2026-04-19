// Seeded RNG matching portable_rng.py bit-for-bit on identical seeds.
// Algorithm: mulberry32 + Fisher-Yates shuffle/sample/choice.

export class PortableRng {
  constructor(seed) {
    this.state = (seed >>> 0);
  }

  nextUint32() {
    this.state = (this.state + 0x6D2B79F5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
    t = (t ^ (t >>> 14)) >>> 0;
    return t;
  }

  random() {
    return this.nextUint32() / 4294967296;
  }

  randrange(n) {
    return Math.floor(this.random() * n);
  }

  choice(seq) {
    return seq[this.randrange(seq.length)];
  }

  shuffle(lst) {
    for (let i = lst.length - 1; i > 0; i--) {
      const j = this.randrange(i + 1);
      [lst[i], lst[j]] = [lst[j], lst[i]];
    }
    return lst;
  }

  sample(population, k) {
    const pool = Array.from(population);
    const n = pool.length;
    for (let i = 0; i < k; i++) {
      const j = i + this.randrange(n - i);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, k);
  }

  choices(population, k) {
    const out = [];
    for (let i = 0; i < k; i++) out.push(this.choice(population));
    return out;
  }
}
