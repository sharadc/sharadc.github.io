// Scripted AI strategies — JS port of strategies.py.
// Must produce the same choices Python does for matching seeds.

import { PortableRng } from "./rng.js";
import { SHAPES, projectedPlayerRevenue } from "./engine.js";

const AVG_YIELD = {
  cart: 1.0, dbl_cart: 1.6, trp_cart: 2.0,
  tent: 2.0, stall: 3.0, mart: 4.0,
  dbl_tent: 3.5, dbl_stall: 4.0,
  trp_tent: 4.5, trp_stall: 5.0,
};

const PLAYS_PER_BUY = {
  cart: 2.6, dbl_cart: 3.2, trp_cart: 4.1,
  tent: 2.0, stall: 2.3, mart: 1.6,
  dbl_tent: 3.9, dbl_stall: 1.8,
  trp_tent: 1.9, trp_stall: 1.4,
};

const COIN_PER_GOOD = 1.0;
const PLAYS_PER_DAY = { 2: 5, 3: 4, 4: 3 };

function expectedLifetimeRev(key, daysLeft) {
  return AVG_YIELD[key] * COIN_PER_GOOD * daysLeft;
}

function profitableToBuy(key, cost, daysLeft) {
  // Late game (≤2 days left): skip anything pricier than $2.5 — expensive cards
  // rarely realize enough plays to pay back in the final 1-2 days.
  if (daysLeft <= 2 && cost > 2.0) return false;
  return expectedLifetimeRev(key, daysLeft) >= cost;
}

function deckHasRoom(game, pid, pending) {
  const deckSize = game.players[pid].deck.length + pending;
  const daysLeft = game.config.days - game.day + 1;
  const ppd = PLAYS_PER_DAY[game.config.numPlayers] ?? 3;
  return deckSize < daysLeft * ppd;
}

// Pile iteration order — must match Python's _pile_priority for parity.
function pilePriority(available, affinity, rng) {
  let keys = Object.keys(available).filter((k) => available[k].length > 0);
  if (affinity === "cheap") {
    keys.sort((a, b) => SHAPES[a].cost - SHAPES[b].cost);
    return keys;
  }
  if (affinity === "expensive") {
    keys.sort((a, b) => SHAPES[b].cost - SHAPES[a].cost);
    return keys;
  }
  if (affinity === "roi") {
    keys.sort((a, b) => (-AVG_YIELD[a] / SHAPES[a].cost) - (-AVG_YIELD[b] / SHAPES[b].cost));
    return keys;
  }
  keys = [...keys];
  rng.shuffle(keys);
  return keys;
}

export class Strategy {
  constructor({ affinity = "cheap", seed = 0 } = {}) {
    this.affinity = affinity;
    this.rng = new PortableRng(seed);
  }
  static name = "Strategy";
  shapeFilter(key) { return true; }
  dynamicAffinity(game, pid) { return this.affinity; }

  buy(game, pid, available) {
    const coin = game.players[pid].coin;
    const daysLeft = game.config.days - game.day + 1;
    const aff = this.dynamicAffinity(game, pid);
    const ordered = pilePriority(available, aff, this.rng);
    const chosen = [];
    const boughtKeys = new Set();
    let remaining = coin;
    for (const k of ordered) {
      if (!this.shapeFilter(k)) continue;
      const top = available[k][available[k].length - 1];
      if (remaining < top.cost) continue;
      if (!profitableToBuy(k, top.cost, daysLeft)) continue;
      if (!deckHasRoom(game, pid, chosen.length)) break;
      chosen.push(k);
      boughtKeys.add(k);
      remaining -= top.cost;
    }
    // Early-game (day 1-2) budget-flex filler.
    if (game.day <= 2 && remaining >= 1.0) {
      const fillers = Object.keys(available)
        .filter((k) => available[k].length > 0 && !boughtKeys.has(k))
        .sort((a, b) => SHAPES[a].cost - SHAPES[b].cost);
      for (const k of fillers) {
        const top = available[k][available[k].length - 1];
        if (remaining < top.cost) continue;
        if (!profitableToBuy(k, top.cost, daysLeft)) continue;
        if (!deckHasRoom(game, pid, chosen.length)) break;
        chosen.push(k);
        remaining -= top.cost;
        if (remaining < 1.0) break;
      }
    }
    return chosen;
  }

  place(game, pid, board, card, squares) {
    const n = board.capacity.n;
    const cap = board.capacity;
    let best = squares[0];
    let bestScore = -1;
    for (const [r, c] of squares) {
      let s = 0;
      for (const [g] of card.demand) {
        if (g === "W") s += cap.west[r];
        else if (g === "E") s += cap.east[n - 1 - r];
        else if (g === "S") s += cap.south[c];
        else s += cap.north[n - 1 - c];
      }
      if (s > bestScore) { bestScore = s; best = [r, c]; }
    }
    return best;
  }

  chooseCardAndSquare(game, pid, board, drawn, legalPer) {
    let bestIdx = null, bestRC = null, bestScore = -Infinity;
    for (let i = 0; i < drawn.length; i++) {
      if (legalPer[i].length === 0) continue;
      const [r, c] = this.place(game, pid, board, drawn[i], legalPer[i]);
      const score = projectedPlayerRevenue(board, pid, drawn[i], r, c);
      if (score > bestScore) { bestScore = score; bestIdx = i; bestRC = [r, c]; }
    }
    return [bestIdx, bestRC[0], bestRC[1]];
  }

  trash(game, pid, discard) {
    if (game.day * 2 <= game.config.days) return null;
    if (discard.length < 2) return null;
    const fails = new Map();
    for (const c of discard) fails.set(c.shapeKey, (fails.get(c.shapeKey) || 0) + 1);
    const struggling = new Set([...fails].filter(([, v]) => v >= 2).map(([k]) => k));
    if (struggling.size === 0) return null;
    const deck = game.players[pid].deck;
    const deckCounts = new Map();
    for (const c of deck) {
      const k = `${c.shapeKey}|${c.combo.join("")}`;
      deckCounts.set(k, (deckCounts.get(k) || 0) + 1);
    }
    const candidates = discard.filter((c) =>
      struggling.has(c.shapeKey) &&
      (deckCounts.get(`${c.shapeKey}|${c.combo.join("")}`) || 0) >= 2
    );
    if (candidates.length === 0) return null;
    return candidates.reduce((a, b) => (a.cost <= b.cost ? a : b));
  }
}

// ---------- baselines ----------

export class RandomStrategy extends Strategy {
  constructor({ seed = 0 } = {}) { super({ affinity: "random", seed }); }
  static name = "Random";

  buy(game, pid, available) {
    let coin = game.players[pid].coin;
    let keys = Object.keys(available);
    this.rng.shuffle(keys);
    const chosen = [];
    for (const k of keys) {
      if (available[k].length === 0) continue;
      if (this.rng.random() < 0.5 && coin >= available[k][available[k].length - 1].cost) {
        chosen.push(k);
        coin -= available[k][available[k].length - 1].cost;
      }
    }
    return chosen;
  }
  place(game, pid, board, card, squares) { return this.rng.choice(squares); }
  chooseCardAndSquare(game, pid, board, drawn, legalPer) {
    const options = [];
    for (let i = 0; i < legalPer.length; i++) if (legalPer[i].length > 0) options.push(i);
    const idx = this.rng.choice(options);
    const [r, c] = this.rng.choice(legalPer[idx]);
    return [idx, r, c];
  }
  trash(game, pid, discard) {
    if (!discard.length || game.day * 2 <= game.config.days) return null;
    if (this.rng.random() < 0.9) return null;
    return this.rng.choice(discard);
  }
}

export class Greedy extends Strategy { static name = "Greedy"; }

// ---------- type concentration ----------
export class TwoType extends Strategy {
  static name = "TwoType";
  shapeFilter(k) { return SHAPES[k].numTypes === 2; }
}
export class ThreeType extends Strategy {
  static name = "ThreeType";
  shapeFilter(k) { return SHAPES[k].numTypes === 3; }
}
export class FourType extends Strategy {
  static name = "FourType";
  shapeFilter(k) { return SHAPES[k].numTypes === 4; }
}
export class CartFamily extends Strategy {
  static name = "CartFamily";
  shapeFilter(k) { return SHAPES[k].numTypes === 1; }
}

// ---------- tier concentration ----------
export class SingleTier extends Strategy {
  static name = "SingleTier";
  shapeFilter(k) { return SHAPES[k].perGood === 1; }
}
export class DoubleTier extends Strategy {
  static name = "DoubleTier";
  shapeFilter(k) { return SHAPES[k].perGood === 2; }
}
export class TripleTier extends Strategy {
  static name = "TripleTier";
  shapeFilter(k) { return SHAPES[k].perGood === 3; }
}

// ---------- cost band ----------
export class MidCurve extends Strategy {
  static name = "MidCurve";
  shapeFilter(k) { const c = SHAPES[k].cost; return c >= 3 && c <= 5.5; }
}

// ---------- tempo ----------
export class EarlyBoom extends Strategy {
  static name = "EarlyBoom";
  dynamicAffinity(game) { return game.day <= 3 ? "expensive" : "cheap"; }
}

// ---------- leader-hindering ----------
function currentLeader(game) {
  let best = 0;
  for (let i = 1; i < game.players.length; i++) {
    if (game.players[i].coin > game.players[best].coin) best = i;
  }
  return best;
}

export class PileDenier extends Strategy {
  constructor({ seed = 0 } = {}) { super({ affinity: "expensive", seed }); }
  static name = "PileDenier";

  buy(game, pid, available) {
    const daysLeft = game.config.days - game.day + 1;
    const coin = game.players[pid].coin;
    const leader = currentLeader(game);
    const leaderBuys = {};
    if (leader !== pid && game.log.length) {
      for (const log of game.log) {
        if (leader < log.bought.length) {
          for (const c of log.bought[leader]) {
            leaderBuys[c.shapeKey] = (leaderBuys[c.shapeKey] || 0) + 1;
          }
        }
      }
    }
    const boosted = new Set(Object.entries(leaderBuys).filter(([, v]) => v >= 2).map(([k]) => k));
    const keys = Object.keys(available)
      .filter((k) => available[k].length > 0 && this.shapeFilter(k));
    keys.sort((a, b) => {
      const aBoost = boosted.has(a) ? 1 : 0;
      const bBoost = boosted.has(b) ? 1 : 0;
      if (aBoost !== bBoost) return bBoost - aBoost;
      return SHAPES[b].cost - SHAPES[a].cost;
    });
    const chosen = [];
    let remaining = coin;
    for (const k of keys) {
      const top = available[k][available[k].length - 1];
      if (remaining < top.cost) continue;
      if (!profitableToBuy(k, top.cost, daysLeft)) continue;
      chosen.push(k);
      remaining -= top.cost;
    }
    return chosen;
  }
}

export class EdgeDrainer extends Strategy {
  constructor({ seed = 0 } = {}) { super({ affinity: "expensive", seed }); }
  static name = "EdgeDrainer";

  buy(game, pid, available) {
    const daysLeft = game.config.days - game.day + 1;
    const coin = game.players[pid].coin;
    const leader = currentLeader(game);
    const topGoods = new Set();
    if (leader !== pid && game.log.length) {
      const cons = { W: 0, S: 0, E: 0, N: 0 };
      for (const log of game.log) {
        if (leader < log.placed.length) {
          for (const shop of log.placed[leader]) {
            for (const [g, a] of Object.entries(shop.consumed)) cons[g] += a;
          }
        }
      }
      const total = cons.W + cons.S + cons.E + cons.N;
      if (total > 0) for (const g of Object.keys(cons)) if (cons[g] / total > 0.25) topGoods.add(g);
    }

    // Enumerate combos of GOODS taken numTypes at a time — must match engine.js allCombos order.
    const allCombos4 = (numTypes) => {
      const goods = ["W", "S", "E", "N"];
      const out = [];
      const rec = (start, cur) => {
        if (cur.length === numTypes) { out.push([...cur]); return; }
        for (let i = start; i < goods.length; i++) { cur.push(goods[i]); rec(i + 1, cur); cur.pop(); }
      };
      rec(0, []);
      return out;
    };

    const keys = Object.keys(available)
      .filter((k) => available[k].length > 0 && this.shapeFilter(k));
    keys.sort((a, b) => {
      const sA = SHAPES[a], sB = SHAPES[b];
      if (topGoods.size === 0) return sB.cost - sA.cost;
      const frac = (s) => {
        const combos = allCombos4(s.numTypes);
        let overlap = 0;
        for (const cb of combos) if (cb.some((g) => topGoods.has(g))) overlap += 1;
        return overlap / combos.length;
      };
      const gA = frac(sA) >= 0.6 ? 1 : 0;
      const gB = frac(sB) >= 0.6 ? 1 : 0;
      if (gA !== gB) return gB - gA;
      return sB.cost - sA.cost;
    });
    const chosen = [];
    let remaining = coin;
    for (const k of keys) {
      const top = available[k][available[k].length - 1];
      if (remaining < top.cost) continue;
      if (!profitableToBuy(k, top.cost, daysLeft)) continue;
      chosen.push(k);
      remaining -= top.cost;
    }
    return chosen;
  }
}

// ---------- registry + factory ----------
export const STRATEGIES = {
  greedy_expensive: Greedy,
  two_type: TwoType,
  three_type: ThreeType,
  single_tier: SingleTier,
  double_tier: DoubleTier,
  triple_tier: TripleTier,
  mid_curve: MidCurve,
  cart_family: CartFamily,
  pile_denier: PileDenier,
  edge_drainer: EdgeDrainer,
};

export function make(key, seed = 0) {
  switch (key) {
    case "greedy_expensive": return new Greedy({ affinity: "expensive", seed });
    case "two_type": return new TwoType({ affinity: "expensive", seed });
    case "three_type": return new ThreeType({ affinity: "expensive", seed });
    case "single_tier": return new SingleTier({ affinity: "expensive", seed });
    case "double_tier": return new DoubleTier({ affinity: "expensive", seed });
    case "triple_tier": return new TripleTier({ affinity: "expensive", seed });
    case "mid_curve": return new MidCurve({ affinity: "expensive", seed });
    case "cart_family": return new CartFamily({ affinity: "expensive", seed });
    case "pile_denier": return new PileDenier({ seed });
    case "edge_drainer": return new EdgeDrainer({ seed });
    default: return new STRATEGIES[key]({ seed });
  }
}
