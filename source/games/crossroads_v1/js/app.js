// Crossroads UI client — static (GitHub Pages) edition.
// All game state runs in the browser via session.js + engine.js.

import { Session } from "./session.js";

const state = {
  session: null,    // active Session instance
  current: null,    // latest serialized snapshot
  // Buy-phase UI accumulator
  buySelection: new Set(),
  // Build-phase: which drawn-card index is selected by the human
  buildCardIdx: 0,
};

const AI_DELAY_MS = 500;   // pacing between AI steps

const $ = (sel) => document.querySelector(sel);

const GOODS = ["W", "E", "N", "S"];

// perGood: scalar (same count for every good in combo) or dict {good: count}.
function renderGoodsBadges(combo, perGood = null) {
  const set = new Set(combo || []);
  const isDict = perGood !== null && typeof perGood === "object";
  return GOODS.map((g) => {
    const on = set.has(g);
    const n = isDict ? perGood[g] : perGood;
    const label = on ? String(n ?? 1) : "";
    return `<span class="good-badge good-${g}${on ? "" : " off"}">${label}</span>`;
  }).join("");
}

// ---------- Boot: show setup wizard ----------
function showSetup() {
  const tpl = $("#setup-template");
  const node = tpl.content.cloneNode(true);
  const wb = $("#wizard-body"); wb.innerHTML = "";
  wb.appendChild(node);
  $("#wizard-title").textContent = "New game";
  $("#wizard-actions").innerHTML = "";
  $("#wizard-steps").style.display = "none";
  $("#wizard-piles").innerHTML = "";
  const wiz = $("#wizard");
  wiz.style.width = "";
  wiz.style.maxWidth = "360px";

  const syncP0Label = () => {
    const mode = $("#mode-select").value;
    $("#p0-label").style.display = mode === "human_vs_ai" ? "none" : "";
  };
  $("#mode-select").addEventListener("change", syncP0Label);
  syncP0Label();

  $("#start-btn").addEventListener("click", () => {
    const mode = $("#mode-select").value;
    let p0 = $("#p0-select").value;
    let p1 = $("#p1-select").value;
    let humanSeat = null;
    if (mode === "human_vs_ai") {
      humanSeat = 0;
      p0 = "human";
    }
    const seed = Math.floor(Math.random() * 1_000_000);
    const session = new Session({ mode, humanSeat, p0, p1, seed });
    state.session = session;
    render(session.serialize());
    tick();
  });
}

// ---------- Rendering ----------
function render(s) {
  state.current = s;
  $("#day-indicator").textContent = `Day ${s.day}/${s.days}`;
  for (let pid = 0; pid < 2; pid++) {
    const seat = $(`#seat-${pid}`);
    const sData = s.seats[pid];
    seat.querySelector(".seat-name").textContent = sData.is_human ? "You" : `P${pid + 1}`;
    seat.querySelector(".seat-coin").textContent = `$${sData.coin}`;
    seat.classList.toggle("active", s.current_pid === pid);
  }
  renderBoard(s);
  renderStepIndicator(s);
  renderPiles(s);
  renderWizard(s);
  requestAnimationFrame(syncWizardWidth);
}

function clampBuildCardIdx(s) {
  const legals = s.current_legal_per || [];
  if (legals.length === 0) return 0;
  if (legals[state.buildCardIdx] && legals[state.buildCardIdx].length > 0) {
    return state.buildCardIdx;
  }
  for (let i = 0; i < legals.length; i++) {
    if (legals[i] && legals[i].length > 0) {
      state.buildCardIdx = i;
      return i;
    }
  }
  state.buildCardIdx = 0;
  return 0;
}

function syncWizardWidth() {
  const board = $("#board");
  const wiz = $("#wizard");
  if (!board || !wiz) return;
  const w = board.getBoundingClientRect().width;
  if (w > 0) {
    wiz.style.maxWidth = "calc(100vw - 4px)";
    wiz.style.width = `${Math.round(w)}px`;
  }
}

function describePhase(s) {
  if (s.game_over) return "Game over";
  const pname = (pid) => s.seats?.[pid]?.is_human ? "You" : `P${pid + 1}`;
  if (s.phase === "awaiting_day_start") return "Starting day";
  if (s.phase === "buy_turn") return `Buy phase (${pname(s.current_pid)})`;
  if (s.phase === "build_place") return `Build (${pname(s.current_pid)})`;
  if (s.phase === "day_summary") return "End of day";
  return s.phase;
}

function renderBoard(s) {
  const board = $("#board");
  board.innerHTML = "";
  if (!s.board) {
    board.style.display = "none";
    return;
  }
  board.style.display = "grid";
  const n = s.board.n;
  const cap = s.board.capacity;

  const addCell = (style, text, opts = {}) => {
    const d = document.createElement("div");
    d.className = style;
    if (text !== undefined) d.textContent = text;
    if (opts.row !== undefined) d.dataset.row = opts.row;
    if (opts.col !== undefined) d.dataset.col = opts.col;
    if (opts.onClick) d.addEventListener("click", opts.onClick);
    board.appendChild(d);
    return d;
  };

  addCell("cap-cell cap-corner");
  for (let c = 0; c < n; c++) addCell("cap-cell cap-N", String(cap.north[n - 1 - c]));
  addCell("cap-cell cap-corner");

  for (let r = 0; r < n; r++) {
    addCell("cap-cell cap-W", String(cap.west[r]));
    for (let c = 0; c < n; c++) {
      const shop = s.board.grid[r][c];
      let classes = "tile";
      const humanPicking = s.phase === "build_place" && s.current_pid === s.human_seat;
      let legalForSelected = [];
      if (humanPicking) {
        const idx = clampBuildCardIdx(s);
        legalForSelected = (s.current_legal_per && s.current_legal_per[idx]) || [];
      }
      const isLegal = humanPicking
        && legalForSelected.some(([rr, cc]) => rr === r && cc === c);
      if (isLegal) classes += " legal";
      if (shop) classes += ` has-shop owner-${shop.owner}`;
      const cell = addCell(classes, undefined, {
        row: r, col: c,
        onClick: isLegal ? () => humanPlace(r, c) : null,
      });
      if (shop) {
        cell.innerHTML = `<div class="shop-label">${shop.label}</div>
                          <div class="goods-badges">${renderGoodsBadges(shop.combo, shop.consumed)}</div>`;
      }
    }
    addCell("cap-cell cap-E", String(cap.east[n - 1 - r]));
  }

  addCell("cap-cell cap-corner");
  for (let c = 0; c < n; c++) addCell("cap-cell cap-S", String(cap.south[c]));
  addCell("cap-cell cap-corner");
}

function renderPiles(s) {
  const wrap = $("#wizard-piles");
  wrap.innerHTML = "";
  const iHuman = s.human_seat;
  const isBuyTurn = s.phase === "buy_turn" && s.current_pid === iHuman && iHuman !== null;
  if (!isBuyTurn) return;

  const humanCoin = s.seats[iHuman].coin;
  let reserved = 0;
  state.buySelection.forEach((k) => { reserved += s.piles[k]?.cost || 0; });
  const remaining = humanCoin - reserved;

  const tiers = { 1: [], 2: [], 3: [] };
  Object.entries(s.piles).forEach(([key, p]) => { tiers[p.per_good].push([key, p]); });
  for (const pg of [1, 2, 3]) tiers[pg].sort((a, b) => a[1].cost - b[1].cost);

  for (const pg of [1, 2, 3]) {
    const rowInner = document.createElement("div");
    rowInner.className = `pile-row tier-${pg}`;
    for (const [key, p] of tiers[pg]) {
      const d = document.createElement("div");
      d.className = "pile";
      const selected = state.buySelection.has(key);
      const depleted = p.count === 0;
      const unaffordable = !selected && !depleted && p.cost > remaining;
      if (depleted) d.classList.add("depleted");
      if (unaffordable) d.classList.add("unaffordable");
      if (selected) d.classList.add("selected");
      const selectable = !depleted && (selected || p.cost <= remaining);
      if (selectable) d.classList.add("selectable");
      d.innerHTML = `
        <div class="plabel"><span>${p.label}</span><span class="pmeta">$${p.cost}</span></div>
      `;
      if (selectable) d.addEventListener("click", () => toggleBuy(key, p.cost));
      rowInner.appendChild(d);
    }
    wrap.appendChild(rowInner);
  }
}

function phaseToStep(phase) {
  if (phase === "buy_turn") return "buy";
  if (phase === "build_place") return "build";
  if (phase === "day_summary") return "sales";
  return null;
}
const STEP_ORDER = ["buy", "build", "sales"];

function renderStepIndicator(s) {
  const tabs = $("#wizard-steps");
  if (!tabs) return;
  const current = phaseToStep(s.phase);
  const currentIdx = STEP_ORDER.indexOf(current);
  tabs.querySelectorAll(".step").forEach((el) => {
    const step = el.dataset.step;
    const idx = STEP_ORDER.indexOf(step);
    el.classList.remove("active", "done");
    if (current && idx === currentIdx) el.classList.add("active");
    else if (current && idx < currentIdx) el.classList.add("done");
  });
  tabs.style.display = (s.game_over || !current) ? "none" : "flex";
}

function toggleBuy(key, cost) {
  if (state.buySelection.has(key)) {
    state.buySelection.delete(key);
  } else {
    const s = state.current;
    const humanCoin = s.seats[s.human_seat].coin;
    const spent = [...state.buySelection].reduce((acc, k) => acc + s.piles[k].cost, 0);
    if (spent + cost > humanCoin) return;
    state.buySelection.add(key);
  }
  render(state.current);
}

function renderWizard(s) {
  const title = $("#wizard-title");
  const body = $("#wizard-body");
  const actions = $("#wizard-actions");
  actions.innerHTML = "";
  body.innerHTML = "";

  if (s.game_over) {
    title.textContent = "Game over";
    const [c0, c1] = [s.seats[0].coin, s.seats[1].coin];
    const nameFor = (pid) => s.seats[pid].is_human ? "You" : `P${pid + 1}`;
    let msg;
    if (c0 === c1) {
      msg = `Tied at $${c0}.`;
    } else {
      const winPid = c0 > c1 ? 0 : 1;
      const losePid = 1 - winPid;
      const winName = nameFor(winPid);
      const loseName = nameFor(losePid);
      const verb = s.seats[winPid].is_human ? "win" : "wins";
      msg = `${winName} ${verb} with $${Math.max(c0, c1)} (${loseName}: $${Math.min(c0, c1)}).`;
    }
    body.innerHTML = `<div>${msg}</div>`;
    const btn = document.createElement("button"); btn.className = "primary";
    btn.textContent = "New game";
    btn.addEventListener("click", showSetup);
    actions.appendChild(btn);
    return;
  }

  if (s.phase === "buy_turn" && s.current_pid === s.human_seat) {
    title.textContent = `Your buy turn (Day ${s.day})`;
    body.innerHTML = `
      <div>Tap piles to select. Cost updates live.</div>
      <div class="hint">Coin: $${s.seats[s.human_seat].coin}
        · Selected: $${[...state.buySelection].reduce((a, k) => a + s.piles[k].cost, 0)}</div>
    `;
    const confirm = document.createElement("button");
    confirm.className = "primary";
    confirm.textContent = "Confirm buy";
    confirm.addEventListener("click", () => {
      const choices = [...state.buySelection];
      state.buySelection.clear();
      state.session.humanBuy(choices);
      render(state.session.serialize());
      tick();
    });
    actions.appendChild(confirm);
    const skip = document.createElement("button");
    skip.textContent = "Skip";
    skip.addEventListener("click", () => {
      state.buySelection.clear();
      state.session.humanBuy([]);
      render(state.session.serialize());
      tick();
    });
    actions.appendChild(skip);
    return;
  }

  if (s.phase === "build_place" && s.current_pid === s.human_seat) {
    const drawn = s.current_drawn || [];
    const legals = s.current_legal_per || [];
    const selIdx = clampBuildCardIdx(s);
    title.textContent = drawn.length === 2
      ? `Build — pick a card, then a tile`
      : `Build — place your shop`;
    const cardCards = drawn.map((c, i) => {
      const placeable = legals[i] && legals[i].length > 0;
      const isSel = i === selIdx;
      const badge = placeable ? "" : `<span class="bwc-tag">no legal</span>`;
      return `
        <div class="build-wizard-card build-pick-card${isSel ? " selected" : ""}${placeable ? "" : " unplaceable"}" data-idx="${i}">
          <div class="bwc-label">${c.label} ${badge}</div>
          <div class="goods-badges">${renderGoodsBadges(c.combo, c.per_good)}</div>
        </div>`;
    }).join("");
    const hint = drawn.length === 2
      ? `Tap a card to choose; tap a highlighted tile to place it. The other card goes to the <i>bottom</i> of your play deck.`
      : `Tap a highlighted green tile on the board.`;
    body.innerHTML = `<div class="build-pick-row">${cardCards}</div><div class="hint">${hint}</div>`;
    body.querySelectorAll(".build-pick-card").forEach((el) => {
      if (el.classList.contains("unplaceable")) return;
      el.addEventListener("click", () => {
        state.buildCardIdx = parseInt(el.dataset.idx, 10);
        render(state.current);
      });
    });
    return;
  }

  if (s.phase === "day_summary") {
    title.textContent = `Day ${s.day} complete`;
    const rev = s.last_day.revenue;
    const sd = s.last_day.sales_detail;
    const nameFor = (pid) => s.seats[pid].is_human ? "You" : `P${pid + 1}`;
    let breakdown = "";
    if (sd) {
      const goodsOrder = ["W", "E", "N", "S"];
      const priceRow = goodsOrder.map((g) =>
        `<span class="sb-pill"><span class="good-badge good-${g}">${g}</span>$${sd.prices[g]}</span>`
      ).join("");
      const playerLines = [0, 1].map((pid) => {
        const cons = sd.player_consumption[pid];
        const badges = goodsOrder.map((g) => {
          const n = cons[g] || 0;
          return `<span class="good-badge good-${g}${n === 0 ? " off" : ""}">${n}</span>`;
        }).join("");
        return `<div class="sb-player"><b>${nameFor(pid)}</b> ${badges} <span class="sb-total">= $${rev[pid]}</span></div>`;
      }).join("");
      let nextRow = "";
      if (sd.next_edge_totals) {
        const parts = goodsOrder.map((g) => {
          const nt = sd.next_edge_totals[g];
          return `<span class="sb-pill"><span class="good-badge good-${g}">${g}</span>${nt}</span>`;
        }).join("");
        nextRow = `<div class="sb-next"><span class="sb-next-label">Next turn:</span>${parts}</div>`;
      }
      breakdown = `
        <div class="sales-breakdown">
          <div class="sb-prices">${priceRow}</div>
          ${playerLines}
          ${nextRow}
        </div>`;
    }
    body.innerHTML = `
      <div>Revenue — ${nameFor(0)}: <b>+$${rev[0]}</b> · ${nameFor(1)}: <b>+$${rev[1]}</b></div>
      ${breakdown}
    `;
    const btn = document.createElement("button"); btn.className = "primary";
    btn.textContent = s.day < s.days ? "Next day" : "Finish";
    btn.addEventListener("click", () => { step(); tick(); });
    actions.appendChild(btn);
    return;
  }

  title.textContent = describePhase(s);
  body.innerHTML = `<div>AI thinking…</div>`;
}

// ---------- Session driver + auto-tick ----------
function step() {
  state.session.advance();
  const s = state.session.serialize();
  render(s);
  return s;
}

function humanPlace(r, c) {
  const idx = clampBuildCardIdx(state.current);
  state.session.humanPlace(idx, r, c);
  state.buildCardIdx = 0;
  render(state.session.serialize());
  tick();
}

function tick() {
  const s = state.current;
  if (!s) return;
  if (s.game_over) return;
  if (s.phase === "buy_turn" && s.current_pid === s.human_seat) return;
  if (s.phase === "build_place" && s.current_pid === s.human_seat) return;
  if (s.phase === "day_summary") return;
  setTimeout(() => {
    const next = step();
    if (!next.game_over) tick();
  }, AI_DELAY_MS);
}

window.addEventListener("resize", () => requestAnimationFrame(syncWizardWidth));

showSetup();
