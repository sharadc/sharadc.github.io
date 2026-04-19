# Crossroads — 2 Player Rules

Two Deans compete on a **4×4 market**, each starting with **5.5 coin**. The market is open for **8 days**. The Dean with the most coin at the end wins.

## The Market

- Four trade routes feed the grid's edges: **West** (Wine), **South** (Silk), **East** (Emerald), **North** (Nutmeg).
- Each row shares its West/East supply; each column shares its North/South supply.

## Card Piles

One shared shop for each pile below.

| Card | Max Demand | Min Demand to Place | Cards in the Pile | Cost |
|---|---|---|---|---|
| Cart | 1 | 1 | 4 | $1 |
| Tent | 1+1 | 1+1 | 6 | $2 |
| Stall | 1+1+1 | 1+1+1 | 4 | $3 |
| Mart | 1+1+1+1 | 1+1+1+1 | 1 | $4 |
| Double Cart | 2 | 1 | 4 | $2.5 |
| Double Tent | 2+2 | 1+1 | 6 | $5 |
| Double Stall | 2+2+2 | 1+1+1 | 4 | $6 |
| Triple Cart | 3 | 1 | 4 | $4.5 |
| Triple Tent | 3+3 | 1+1 | 6 | $7 |
| Triple Stall | 3+3+3 | 1+1+1 | 4 | $9 |

## Daily Turn Structure
0. **Edge Capacity** - New Resource Capacity is applied to each edge.
1. **Buy** — starting with the Dean with fewer coin, each buys any number of cards, at most one per pile.
2. **Build** — shuffle play decks, then play round-robin **turns**:
   - Draw **2 cards** (or 1 if only one left).
   - Pick one to place at a legal square. A card needs ≥1 unit of each demanded good from its row/column, and consumes up to its listed demand capped by lane supply.
   - The unchosen card goes to the **bottom of your Play deck** (it can be redrawn later).
   - **If neither card is placeable, both get discarded and you're out for the rest of the build step.**
3. **Sales** — each good a Dean consumed is paid out based on its edge's remaining supply rank.

At end of day, shops clear, all cards return to each Dean's play deck, and capacity resets. First player next day is whoever has the fewer coin (ties → seat order).

## Pricing

Goods on **scarcer edges pay more**, goods on abundant edges pay less. The four edges are ranked by leftover capacity, lowest is rank 1. Ties resolve downward.
| Leftover Capacity Rank | Price Per Resource | Next Day Total Capacity |
|---|---|---|
| 1 | $1.5 | Current Day + 2 |
| 2 | $1 | Current Day + 1 |
| 3 | $1 | Current Day + 1 |
| 4 | $0.5 | Same as aCurrent Day |


## Ending

Game ends when the market fills or after 8 days — whichever comes first.
