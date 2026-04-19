// Step-by-step game state machine — JS port of web/server.py's Session.
// Drives both Human vs AI and AI vs AI flows; the UI consumes `serialize()`.

import { PortableRng } from "./rng.js";
import {
  Board, CapacityState, buildPiles, assignEdgeTiers, computeRevenue, tierPrice, SHAPES,
} from "./engine.js";
import { make as makeStrategy } from "./strategies.js";

const GOODS = ["W", "S", "E", "N"];
const N = 4; // 2P only on the web UI

function randSid() { return Math.random().toString(36).slice(2, 10); }

export class Session {
  constructor({ mode, humanSeat, p0, p1, seed }) {
    this.sid = randSid();
    this.mode = mode;
    this.humanSeat = humanSeat;
    this.stratKeys = [p0, p1];
    this.strats = this.stratKeys.map((k, i) => (k === "human" ? null : makeStrategy(k, seed + 1 + i)));
    this.cfg = { numPlayers: 2, days: 8, startingCoin: 5.5, monotonicCapacity: true };
    this.rng = new PortableRng(seed);
    this.coins = [this.cfg.startingCoin, this.cfg.startingCoin];
    this.decks = [[], []];
    this.piles = buildPiles(2);
    for (const k of Object.keys(this.piles)) this.rng.shuffle(this.piles[k]);
    this.firstPlayer = this.rng.randrange(2);
    this.edgeDays = { W: 1, S: 1, E: 1, N: 1 };
    this.day = 0;
    this.board = null;
    this.capacity = null;
    this.playDecks = [];
    this.buildOrder = [];
    this.currentPid = null;
    this.currentDrawn = [];
    this.currentLegalPer = [];
    this.buildOut = [false, false];
    this.phase = "awaiting_day_start";
    this.log = [];
    this.lastDayDiscard = [[], []];
    this.lastDayPlacedShops = [[], []];
    this.lastDayRevenue = [0, 0];
    this.lastDaySalesDetail = null;
    this.gameOver = false;
  }

  _turnOrder() { return [this.firstPlayer, 1 - this.firstPlayer]; }

  _fakeGame() {
    return {
      players: [0, 1].map((i) => ({ idx: i, coin: this.coins[i], deck: this.decks[i] })),
      day: this.day,
      config: { numPlayers: 2, days: this.cfg.days },
      firstPlayer: this.firstPlayer,
      log: [],
      todayCapacity: this.capacity,
      todayBoard: this.board,
    };
  }

  // ---------- State machine transitions ----------

  _startDay() {
    if (this.day >= this.cfg.days) { this.phase = "game_over"; this.gameOver = true; return; }
    this.day += 1;
    this.capacity = CapacityState.drawPerEdge(N, this.edgeDays, this.rng, this.cfg.monotonicCapacity);
    this.board = new Board(N, this.capacity, 2);
    this.lastDayPlacedShops = [[], []];
    this.lastDayDiscard = [[], []];
    this.lastDayRevenue = [0, 0];
    this.buildOrder = this._turnOrder();
    this.currentDrawn = [];
    this.currentLegalPer = [];
    this.buildOut = [false, false];
    this.currentPid = this.buildOrder.shift();
    this.phase = "buy_turn";
  }

  _resolveAiBuy(pid) {
    const strat = this.strats[pid];
    const available = {};
    for (const [k, v] of Object.entries(this.piles)) if (v.length > 0) available[k] = v;
    const choices = strat.buy(this._fakeGame(), pid, available);
    this._applyBuy(pid, choices);
  }

  _applyBuy(pid, choices) {
    let remaining = this.coins[pid];
    for (const key of choices) {
      const pile = this.piles[key];
      if (!pile || pile.length === 0) continue;
      const top = pile[pile.length - 1];
      if (remaining < top.cost) continue;
      const card = pile.pop();
      remaining -= card.cost;
      this.decks[pid].push(card);
    }
    this.coins[pid] = remaining;
  }

  _advanceFromBuy() {
    if (this.buildOrder.length > 0) {
      this.currentPid = this.buildOrder.shift();
      this.phase = "buy_turn";
    } else {
      this._beginBuild();
    }
  }

  _beginBuild() {
    this.playDecks = [0, 1].map((pid) => {
      const d = [...this.decks[pid]];
      this.rng.shuffle(d);
      return d;
    });
    this.buildOut = [false, false];
    this.buildOrder = this._turnOrder();
    this.currentPid = null;
    this.currentDrawn = [];
    this.currentLegalPer = [];
    this._nextBuildTurn();
  }

  _nextBuildTurn() {
    for (;;) {
      if (this.board.isFull()) { this._finishBuild(); return; }
      if (this.buildOrder.length === 0) {
        const active = [0, 1].filter((pid) => !this.buildOut[pid] && this.playDecks[pid].length > 0);
        if (active.length === 0) { this._finishBuild(); return; }
        this.buildOrder = this._turnOrder();
      }
      const pid = this.buildOrder.shift();
      if (this.buildOut[pid]) continue;
      const deck = this.playDecks[pid];
      if (deck.length === 0) continue;
      const drawn = [deck.pop()];
      if (deck.length > 0) drawn.push(deck.pop());
      const legalPer = drawn.map((c) => this.board.legalSquares(c));
      if (!legalPer.some((l) => l.length > 0)) {
        this.lastDayDiscard[pid].push(...drawn);
        this.buildOut[pid] = true;
        continue;
      }
      this.currentPid = pid;
      this.currentDrawn = drawn;
      this.currentLegalPer = legalPer;
      this.phase = "build_place";
      return;
    }
  }

  _applyPlacement(pid, cardIdx, row, col) {
    const chosen = this.currentDrawn[cardIdx];
    const shop = this.board.place(chosen, pid, row, col);
    this.lastDayPlacedShops[pid].push(shop);
    if (this.currentDrawn.length === 2) {
      const other = this.currentDrawn[1 - cardIdx];
      this.playDecks[pid].unshift(other);
    }
    this.currentDrawn = [];
    this.currentLegalPer = [];
  }

  _resolveAiPlacement() {
    const strat = this.strats[this.currentPid];
    const [idx, r, c] = strat.chooseCardAndSquare(
      this._fakeGame(), this.currentPid, this.board, this.currentDrawn, this.currentLegalPer,
    );
    this._applyPlacement(this.currentPid, idx, r, c);
  }

  _finishBuild() {
    const edgeTotals = { ...this.board.edgeTotals };
    const tiers = assignEdgeTiers(edgeTotals);
    const pricePerGood = {};
    for (const g of GOODS) pricePerGood[g] = tierPrice(tiers[g], 4, 1);
    const revenues = computeRevenue(this.board, 2);
    const perPlayerCons = [];
    const perPlayerPerGoodRev = [];
    for (let pid = 0; pid < 2; pid++) {
      const cons = { ...this.board.playerConsumption[pid] };
      const consStr = {};
      for (const g of GOODS) consStr[g] = cons[g] || 0;
      perPlayerCons.push(consStr);
      const perGoodRev = {};
      for (const g of GOODS) perGoodRev[g] = tierPrice(tiers[g], 4, cons[g] || 0);
      perPlayerPerGoodRev.push(perGoodRev);
      this.coins[pid] += revenues[pid];
    }
    this.lastDayRevenue = [...revenues];
    const tierToDelta = { 0: 0, 1: 1, 2: 1, 3: 2 };
    const edgeDeltas = {};
    for (const g of GOODS) edgeDeltas[g] = tierToDelta[tiers[g]];
    for (const g of GOODS) this.edgeDays[g] += tierToDelta[tiers[g]];
    const nextEdgeTotals = {};
    for (const g of GOODS) nextEdgeTotals[g] = (N - 2) + this.edgeDays[g];

    this.lastDaySalesDetail = {
      edge_totals: { ...edgeTotals },
      tiers: { ...tiers },
      prices: pricePerGood,
      player_consumption: perPlayerCons,
      player_revenue_by_good: perPlayerPerGoodRev,
      next_edge_days: { ...this.edgeDays },
      next_edge_totals: nextEdgeTotals,
      edge_deltas: edgeDeltas,
    };

    // Next first player = fewest-coin; tie-break by current turn order.
    const mn = Math.min(...this.coins);
    const cands = [0, 1].filter((i) => this.coins[i] === mn);
    if (cands.length === 1) {
      this.firstPlayer = cands[0];
    } else {
      for (const i of this._turnOrder()) if (cands.includes(i)) { this.firstPlayer = i; break; }
    }
    this.phase = "day_summary";
  }

  // ---------- Public API (called from app.js) ----------

  advance() {
    if (this.gameOver) return;
    if (this.phase === "awaiting_day_start") { this._startDay(); return; }
    if (this.phase === "buy_turn") {
      if (this.currentPid === this.humanSeat && this.mode === "human_vs_ai") return;
      this._resolveAiBuy(this.currentPid);
      this._advanceFromBuy();
      return;
    }
    if (this.phase === "build_place") {
      if (this.currentPid === this.humanSeat && this.mode === "human_vs_ai") return;
      this._resolveAiPlacement();
      this._nextBuildTurn();
      return;
    }
    if (this.phase === "day_summary") {
      if (this.day >= this.cfg.days || (this.board && this.board.isFull())) {
        this.phase = "game_over"; this.gameOver = true;
      } else {
        this.phase = "awaiting_day_start";
      }
      return;
    }
    if (this.phase === "game_over") { this.gameOver = true; }
  }

  humanBuy(choices) {
    if (this.phase !== "buy_turn" || this.currentPid !== this.humanSeat) return;
    this._applyBuy(this.currentPid, choices);
    this._advanceFromBuy();
  }

  humanPlace(cardIdx, row, col) {
    if (this.phase !== "build_place" || this.currentPid !== this.humanSeat) return;
    if (cardIdx < 0 || cardIdx >= this.currentDrawn.length) return;
    const legal = this.currentLegalPer[cardIdx];
    if (!legal.some(([r, c]) => r === row && c === col)) return;
    this._applyPlacement(this.currentPid, cardIdx, row, col);
    this._nextBuildTurn();
  }

  serialize() {
    const piles = {};
    for (const k of Object.keys(SHAPES)) {
      piles[k] = {
        label: SHAPES[k].label,
        cost: SHAPES[k].cost,
        num_types: SHAPES[k].numTypes,
        per_good: SHAPES[k].perGood,
        count: this.piles[k].length,
      };
    }
    const seats = [];
    for (let pid = 0; pid < 2; pid++) {
      const canSeeDeck = (this.mode === "ai_vs_ai") || (pid === this.humanSeat);
      const inBuild = this.phase === "build_place" && this.playDecks.length > 0;
      const cardsLeft = inBuild ? this.playDecks[pid].length : this.decks[pid].length;
      seats.push({
        pid,
        strategy: this.stratKeys[pid],
        coin: this.coins[pid],
        deck_size: this.decks[pid].length,
        cards_left: cardsLeft,
        deck: canSeeDeck ? this.decks[pid].map(serializeCard) : null,
        is_human: this.mode === "human_vs_ai" && pid === this.humanSeat,
      });
    }
    return {
      sid: this.sid,
      mode: this.mode,
      human_seat: this.humanSeat,
      day: this.day,
      days: this.cfg.days,
      first_player: this.firstPlayer,
      phase: this.phase,
      current_pid: this.currentPid,
      current_drawn: this.currentDrawn.map(serializeCard),
      current_legal_per: this.currentLegalPer.map((l) => l.map(([r, c]) => [r, c])),
      piles,
      seats,
      board: serializeBoard(this.board),
      game_over: this.gameOver,
      last_day: {
        placed: this.lastDayPlacedShops.map((l) => l.map((sh) => serializeCard(sh.card))),
        discard: this.lastDayDiscard.map((l) => l.map(serializeCard)),
        revenue: [...this.lastDayRevenue],
        sales_detail: this.lastDaySalesDetail,
      },
      edge_days: { ...this.edgeDays },
    };
  }
}

function serializeCard(c) {
  return {
    shape: c.shapeKey,
    label: SHAPES[c.shapeKey].label,
    combo: [...c.combo].sort(),
    cost: c.cost,
    per_good: SHAPES[c.shapeKey].perGood,
    num_types: SHAPES[c.shapeKey].numTypes,
  };
}

function serializeBoard(board) {
  if (board === null) return null;
  const grid = [];
  for (const row of board.grid) {
    const rowOut = [];
    for (const s of row) {
      if (s === null) { rowOut.push(null); continue; }
      rowOut.push({
        owner: s.owner,
        label: SHAPES[s.card.shapeKey].label,
        shape: s.card.shapeKey,
        combo: [...s.card.combo].sort(),
        consumed: { ...s.consumed },
      });
    }
    grid.push(rowOut);
  }
  return {
    n: board.n,
    capacity: {
      n: board.capacity.n,
      west: [...board.capacity.west],
      south: [...board.capacity.south],
      east: [...board.capacity.east],
      north: [...board.capacity.north],
    },
    grid,
    edge_totals: { ...board.edgeTotals },
  };
}
