// Crossroads engine — JS port of engine.py.
// Paired with portable_rng.py / rng.js for seed-reproducible games.

import { PortableRng } from "./rng.js";

export const GOODS = ["W", "S", "E", "N"];
export const W = "W", S = "S", E = "E", N = "N";

/** Shape definitions — kept in sync with engine.py SHAPES. */
export const SHAPES_LIST = [
  { key: "cart",       label: "Cart",          cost: 1.0, perGood: 1, numTypes: 1 },
  { key: "tent",       label: "Tent",          cost: 2.0, perGood: 1, numTypes: 2 },
  { key: "stall",      label: "Stall",         cost: 3.0, perGood: 1, numTypes: 3 },
  { key: "mart",       label: "Mart",          cost: 4.0, perGood: 1, numTypes: 4 },
  { key: "dbl_cart",   label: "Double Cart",   cost: 2.5, perGood: 2, numTypes: 1 },
  { key: "dbl_tent",   label: "Double Tent",   cost: 5.0, perGood: 2, numTypes: 2 },
  { key: "dbl_stall",  label: "Double Stall",  cost: 6.0, perGood: 2, numTypes: 3 },
  { key: "trp_cart",   label: "Triple Cart",   cost: 4.5, perGood: 3, numTypes: 1 },
  { key: "trp_tent",   label: "Triple Tent",   cost: 7.0, perGood: 3, numTypes: 2 },
  { key: "trp_stall",  label: "Triple Stall",  cost: 9.0, perGood: 3, numTypes: 3 },
];
export const SHAPES = Object.fromEntries(SHAPES_LIST.map((s) => [s.key, s]));

export const COPIES = {
  2: { cart:1, tent:1, stall:1, mart:2, dbl_cart:1, dbl_tent:1, dbl_stall:1, trp_cart:1, trp_tent:1, trp_stall:1 },
  3: { cart:1, tent:1, stall:1, mart:3, dbl_cart:1, dbl_tent:1, dbl_stall:1, trp_cart:1, trp_tent:1, trp_stall:1 },
  4: { cart:1, tent:1, stall:1, mart:4, dbl_cart:1, dbl_tent:1, dbl_stall:1, trp_cart:1, trp_tent:1, trp_stall:1 },
};

export const DEFAULT_N = { 2: 4, 3: 5, 4: 6 };

// ----- Combos -----
export function allCombos(numTypes) {
  // C(4, numTypes) combos in GOODS order — must match Python's itertools.combinations output.
  const out = [];
  const arr = GOODS;
  function rec(start, chosen) {
    if (chosen.length === numTypes) { out.push([...chosen]); return; }
    for (let i = start; i < arr.length; i++) {
      chosen.push(arr[i]); rec(i + 1, chosen); chosen.pop();
    }
  }
  rec(0, []);
  return out;
}

// ----- Card -----
export class Card {
  constructor(shapeKey, combo) {
    this.shapeKey = shapeKey;
    // combo: sorted tuple of good letters (frozen, for equality)
    this.combo = [...combo].sort();
    const shape = SHAPES[shapeKey];
    // demand: array of [good, amount] pairs, deterministic order = combo order
    this.demand = this.combo.map((g) => [g, shape.perGood]);
    this.cost = shape.cost;
  }
  get shape() { return SHAPES[this.shapeKey]; }
  get label() { return SHAPES[this.shapeKey].label; }
  toString() { return `${this.shape.label}(${this.combo.join("")})`; }
}

export function buildPiles(numPlayers) {
  const cm = COPIES[numPlayers];
  const piles = {};
  for (const { key, numTypes } of SHAPES_LIST) {
    const cards = [];
    for (const combo of allCombos(numTypes)) {
      for (let i = 0; i < cm[key]; i++) cards.push(new Card(key, combo));
    }
    piles[key] = cards;
  }
  return piles;
}

// ----- Capacity deck -----
const capTuplesCache = new Map();

export function validCapacityTuples(n, day) {
  const key = `${n}|${day}`;
  if (capTuplesCache.has(key)) return capTuplesCache.get(key);
  const total = n - 2 + day;
  const spreadCap = Math.max(Math.floor((day + 1) / 2), 2);
  const out = [];

  function rec(prefix, remaining, zeros, minSeen, maxSeen) {
    const slotsLeft = n - prefix.length;
    if (slotsLeft === 0) {
      if (remaining === 0) out.push([...prefix]);
      return;
    }
    let lo, hi;
    if (prefix.length === 0) {
      lo = 0; hi = 1;
    } else if (minSeen <= total) {
      lo = Math.max(0, maxSeen - spreadCap);
      hi = Math.min(total, minSeen + spreadCap);
    } else {
      lo = 0; hi = total;
    }
    for (let v = lo; v <= hi; v++) {
      if (v === 0 && zeros >= 1) continue;
      const newRem = remaining - v;
      if (newRem < 0) break;
      const after = slotsLeft - 1;
      if (after > 0) {
        const nm = (minSeen <= total) ? Math.min(minSeen, v) : v;
        const nM = (maxSeen >= 0) ? Math.max(maxSeen, v) : v;
        const futureLo = Math.max(0, nM - spreadCap);
        const futureHi = Math.min(total, nm + spreadCap);
        if (newRem < futureLo * after || newRem > futureHi * after) continue;
        prefix.push(v);
        rec(prefix, newRem, zeros + (v === 0 ? 1 : 0), nm, nM);
        prefix.pop();
      } else {
        if (newRem === 0) {
          const nm = (minSeen <= total) ? Math.min(minSeen, v) : v;
          const nM = (maxSeen >= 0) ? Math.max(maxSeen, v) : v;
          if (nM - nm <= spreadCap && zeros + (v === 0 ? 1 : 0) <= 1) {
            prefix.push(v); out.push([...prefix]); prefix.pop();
          }
        }
      }
    }
  }
  rec([], total, 0, total + 1, -1);
  capTuplesCache.set(key, out);
  return out;
}

const monoCache = new Map();
export function isMonotonic(t) {
  for (let i = 0; i < t.length - 1; i++) {
    if (t[i] > t[i + 1]) return false;
  }
  return true;
}

export function validMonotonicTuples(n, day) {
  const key = `${n}|${day}`;
  if (monoCache.has(key)) return monoCache.get(key);
  const out = validCapacityTuples(n, day).filter(isMonotonic);
  monoCache.set(key, out);
  return out;
}

// ----- CapacityState -----
export class CapacityState {
  constructor(n, west, south, east, north) {
    this.n = n;
    this.west = west; this.south = south; this.east = east; this.north = north;
  }
  static drawPerEdge(n, edgeDays, rng, monotonic = false) {
    const one = (day) => {
      const deck = monotonic ? validMonotonicTuples(n, day) : validCapacityTuples(n, day);
      if (deck.length === 0) return Array(n).fill(1);
      return [...rng.choice(deck)];
    };
    return new CapacityState(n, one(edgeDays.W), one(edgeDays.S), one(edgeDays.E), one(edgeDays.N));
  }
  squareSupply(row, col) {
    const n = this.n;
    return {
      W: this.west[row],
      E: this.east[n - 1 - row],
      S: this.south[col],
      N: this.north[n - 1 - col],
    };
  }
  consume(good, row, col, amt) {
    const n = this.n;
    if (good === W) this.west[row] -= amt;
    else if (good === E) this.east[n - 1 - row] -= amt;
    else if (good === S) this.south[col] -= amt;
    else this.north[n - 1 - col] -= amt;
  }
  edgeTotals() {
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    return { W: sum(this.west), S: sum(this.south), E: sum(this.east), N: sum(this.north) };
  }
}

// ----- Shop / Board -----
export class Shop {
  constructor(card, owner, row, col, consumed) {
    this.card = card; this.owner = owner; this.row = row; this.col = col; this.consumed = consumed;
  }
}

export class Board {
  constructor(n, capacity, numPlayers) {
    this.n = n;
    this.capacity = capacity;
    this.numPlayers = numPlayers;
    this.grid = Array.from({ length: n }, () => Array(n).fill(null));
    this.emptyCount = n * n;
    this.edgeTotals = capacity.edgeTotals();
    this.playerConsumption = Array.from({ length: numPlayers }, () => ({}));
  }
  _laneCapacity(good, row, col) {
    const n = this.n;
    if (good === W) return this.capacity.west[row];
    if (good === E) return this.capacity.east[n - 1 - row];
    if (good === S) return this.capacity.south[col];
    return this.capacity.north[n - 1 - col];
  }
  canPlace(card, row, col) {
    if (this.grid[row][col] !== null) return false;
    for (const [g] of card.demand) {
      if (this._laneCapacity(g, row, col) < 1) return false;
    }
    return true;
  }
  legalSquares(card) {
    const out = [];
    for (let r = 0; r < this.n; r++) {
      for (let c = 0; c < this.n; c++) {
        if (this.canPlace(card, r, c)) out.push([r, c]);
      }
    }
    return out;
  }
  place(card, owner, row, col) {
    const consumed = {};
    const shop = new Shop(card, owner, row, col, consumed);
    this.grid[row][col] = shop;
    for (const [g, maxAmt] of card.demand) {
      const avail = this._laneCapacity(g, row, col);
      const amt = Math.min(maxAmt, avail);
      consumed[g] = amt;
      if (amt) {
        this.capacity.consume(g, row, col, amt);
        this.edgeTotals[g] -= amt;
        this.playerConsumption[owner][g] = (this.playerConsumption[owner][g] || 0) + amt;
      }
    }
    this.emptyCount -= 1;
    return shop;
  }
  isFull() { return this.emptyCount === 0; }
}

// ----- Sales -----
export function assignEdgeTiers(edgeTotals) {
  // Group goods by remaining cap, sort desc; ties all share the lowest tier index.
  const groups = new Map();
  for (const g of GOODS) {
    const v = edgeTotals[g];
    if (!groups.has(v)) groups.set(v, []);
    groups.get(v).push(g);
  }
  const caps = [...groups.keys()].sort((a, b) => b - a);
  const tiers = {};
  let idx = 0;
  for (const cap of caps) {
    for (const g of groups.get(cap)) tiers[g] = idx;
    idx += groups.get(cap).length;
  }
  return tiers;
}

export function tierPrice(tier, totalTiers, goods) {
  if (tier === totalTiers - 1) return goods * 1.5;
  if (tier === 0) return goods * 0.5;
  return goods * 1.0;
}

export function computeRevenue(board, numPlayers) {
  const tiers = assignEdgeTiers(board.edgeTotals);
  const revs = [];
  for (let pid = 0; pid < numPlayers; pid++) {
    let sum = 0;
    for (const [g, t] of Object.entries(board.playerConsumption[pid])) {
      sum += tierPrice(tiers[g], 4, t);
    }
    revs.push(sum);
  }
  return revs;
}

// What would `pid`'s total revenue be if they placed `card` at (r,c) right now?
export function projectedPlayerRevenue(board, pid, card, r, c) {
  const totals = { ...board.edgeTotals };
  const actual = {};
  for (const [g, maxAmt] of card.demand) {
    const avail = board._laneCapacity(g, r, c);
    const amt = Math.min(maxAmt, avail);
    actual[g] = amt;
    totals[g] -= amt;
  }
  const tiers = assignEdgeTiers(totals);
  const cons = board.playerConsumption[pid];
  let rev = 0;
  for (const [g, t] of Object.entries(cons)) {
    const extra = actual[g] || 0;
    rev += tierPrice(tiers[g], 4, t + extra);
    delete actual[g];
  }
  for (const [g, extra] of Object.entries(actual)) {
    rev += tierPrice(tiers[g], 4, extra);
  }
  return rev;
}

// ----- Game loop -----
export class PlayerState {
  constructor(idx, coin) { this.idx = idx; this.coin = coin; this.deck = []; }
}

export const DEFAULT_CONFIG = {
  numPlayers: 2,
  startingCoin: 5.5,
  days: 8,
  monotonicCapacity: true,
  enableTrash: false,
  seed: null,
};

export class Game {
  constructor(config, strategies) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    if (strategies.length !== this.config.numPlayers) throw new Error("strategy count mismatch");
    this.n = this.config.n ?? DEFAULT_N[this.config.numPlayers];
    const seed = this.config.seed ?? Math.floor(Math.random() * 0xFFFFFFFF);
    this.rng = new PortableRng(seed);
    this.players = Array.from({ length: this.config.numPlayers }, (_, i) => new PlayerState(i, this.config.startingCoin));
    this.strategies = strategies;
    this.piles = buildPiles(this.config.numPlayers);
    for (const key of Object.keys(this.piles)) this.rng.shuffle(this.piles[key]);
    this.firstPlayer = this.rng.randrange(this.config.numPlayers);
    this.day = 0;
    this.edgeDays = { W: 1, S: 1, E: 1, N: 1 };
    this.log = [];
    this.endedEarly = false;
    // Exposed to strategies during the buy phase
    this.todayCapacity = null;
    this.todayBoard = null;
  }

  _turnOrder() {
    return Array.from({ length: this.config.numPlayers }, (_, i) => (this.firstPlayer + i) % this.config.numPlayers);
  }

  _nextFirstPlayer() {
    const coins = this.players.map((p) => p.coin);
    const mn = Math.min(...coins);
    const cands = coins.map((c, i) => c === mn ? i : -1).filter((i) => i >= 0);
    if (cands.length === 1) return cands[0];
    for (const i of this._turnOrder()) if (cands.includes(i)) return i;
    return cands[0];
  }

  _buyPhase() {
    const bought = Array.from({ length: this.config.numPlayers }, () => []);
    for (const pid of this._turnOrder()) {
      const strat = this.strategies[pid];
      const available = Object.fromEntries(Object.entries(this.piles).filter(([, v]) => v.length > 0));
      const choices = strat.buy(this, pid, available);
      const player = this.players[pid];
      for (const key of choices) {
        const pile = this.piles[key];
        if (!pile || pile.length === 0) continue;
        const top = pile[pile.length - 1];
        if (player.coin < top.cost) continue;
        const card = pile.pop();
        player.coin -= card.cost;
        player.deck.push(card);
        bought[pid].push(card);
      }
    }
    return bought;
  }

  _buildPhase(board) {
    const N = this.config.numPlayers;
    const placed = Array.from({ length: N }, () => []);
    const discard = Array.from({ length: N }, () => []);
    const playDecks = this.players.map((p) => {
      const d = [...p.deck]; this.rng.shuffle(d); return d;
    });
    const out = Array(N).fill(false);
    const turnOrder = this._turnOrder();
    let queue = [...turnOrder];
    while (!board.isFull()) {
      if (queue.length === 0) {
        const active = [];
        for (let pid = 0; pid < N; pid++) {
          if (!out[pid] && playDecks[pid].length > 0) active.push(pid);
        }
        if (active.length === 0) break;
        queue = [...turnOrder];
      }
      const pid = queue.shift();
      if (out[pid]) continue;
      const deck = playDecks[pid];
      if (deck.length === 0) continue;
      const drawn = [deck.pop()];
      if (deck.length > 0) drawn.push(deck.pop());
      const legalPer = drawn.map((c) => board.legalSquares(c));
      if (!legalPer.some((l) => l.length > 0)) {
        discard[pid].push(...drawn);
        out[pid] = true;
        continue;
      }
      const strat = this.strategies[pid];
      const [idx, r, c] = strat.chooseCardAndSquare(this, pid, board, drawn, legalPer);
      const card = drawn[idx];
      const shop = board.place(card, pid, r, c);
      placed[pid].push(shop);
      if (drawn.length === 2) {
        const other = drawn[1 - idx];
        deck.unshift(other);
      }
    }
    for (let pid = 0; pid < N; pid++) {
      discard[pid].push(...playDecks[pid]);
    }
    return { placed, discard };
  }

  _playDay() {
    this.day += 1;
    const capacity = CapacityState.drawPerEdge(this.n, this.edgeDays, this.rng, this.config.monotonicCapacity);
    this.todayCapacity = capacity;
    const capStart = new CapacityState(capacity.n, [...capacity.west], [...capacity.south], [...capacity.east], [...capacity.north]);
    const board = new Board(this.n, capacity, this.config.numPlayers);
    this.todayBoard = board;
    const bought = this._buyPhase();
    const { placed, discard } = this._buildPhase(board);
    const revenues = computeRevenue(board, this.config.numPlayers);
    for (let i = 0; i < this.config.numPlayers; i++) this.players[i].coin += revenues[i];

    // Advance per-edge days: rank 1 +2, ranks 2&3 +1, rank 4 +0.
    const tiers = assignEdgeTiers({ ...board.edgeTotals });
    const tierDelta = { 0: 0, 1: 1, 2: 1, 3: 2 };
    for (const g of GOODS) this.edgeDays[g] += tierDelta[tiers[g]];

    const capEnd = new CapacityState(capacity.n, [...capacity.west], [...capacity.south], [...capacity.east], [...capacity.north]);
    const logEntry = {
      day: this.day,
      firstPlayer: this.firstPlayer,
      bought, placed, discard,
      revenue: [...revenues],
      coinAfter: this.players.map((p) => p.coin),
      capacityStart: capStart,
      capacityEnd: capEnd,
      board,
      tiers,
    };
    this.log.push(logEntry);
    this.endedEarly = board.isFull();
    this.firstPlayer = this._nextFirstPlayer();
    return logEntry;
  }

  play() {
    for (let i = 0; i < this.config.days; i++) {
      this._playDay();
      if (this.endedEarly) break;
    }
    return this.players.map((p) => p.coin);
  }
}
