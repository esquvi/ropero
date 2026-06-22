# Ideation: What to build next in Ropero

Created: 2026-06-22
Method: ce-ideate, 6 frames (pain, inversion/automation, assumption-breaking, leverage/compounding, cross-domain analogy, constraint-flipping), ~46 raw candidates, adversarially filtered.
Grounding: PRODUCT.md (personas + the five design principles, esp. "intention over engagement"), the current feature surface, the wear-history dataset as the compounding core.

## Topic axes (persona/surface map)

- **A1** Wardrobe as inventory-of-meaning (the curator)
- **A2** Reflection & insight without engagement (the mirror)
- **A3** Deliberate outfit planning (the intentional minimalist's Sunday ritual)
- **A4** Rediscovery & re-wear (anti-consumption; the re-wearer)
- **A5** Capsule travel & packing (the packer)

## The convergence

Six independent frames collapsed onto a small number of directions. That convergence is the headline finding: the strongest ideas are not exotic, they are the obvious-in-hindsight gaps that every lens found from a different angle. Each surviving direction also maps cleanly to one underserved persona, so the set reads as a balanced roadmap rather than a grab-bag.

---

## Ranked survivors

### 1. The rediscovery surface ("what you've forgotten you own") — A4

A dedicated, factual view of dormant pieces: "not worn since October", "worn 0x this season", sorted by dormancy, filterable by category. Plus a seasonal re-encounter layer (cross-references the existing `fetch-weather` data with last-worn so a coat resurfaces when its weather returns). Stated as bare fact, never "you should wear this."

- **Found by:** pain (#7), inversion (#4), leverage (#2 seasonal), analogy (#5 fallow rotation / #6 b-sides), constraint (#2 closed-wardrobe / #6 long-tail) — the widest convergence in the batch.
- **Basis (direct):** wear timestamps already exist; "last worn" is computable today. The re-wearer is the single most on-mission persona (anti-consumption is the product's deepest value) and has zero dedicated surface.
- **Why it wins:** highest persona value at the lowest build cost (data already captured), and it is the purest expression of "rediscover before you buy." The mirror-not-coach framing ("not worn since October", not "wear this more") is the whole discipline.
- **The tightrope:** phrasing. The instant it says "should", it becomes a coach and betrays Principle 3.

### 2. Make wear-capture nearly free and always truthful — A2 (foundational)

The load-bearing input. Three moves: (a) a near-zero-friction quick-log ("what I wore today" without deep navigation); (b) confirm that logging an outfit-wear cascades a wear to each constituent piece (this may be a latent correctness bug — piece-level cost-per-wear undercounts otherwise); (c) an opt-in, pull-based catch-up for forgotten days (a quiet checklist the user *comes to* — never a push, never a streak).

- **Found by:** pain (#3/#4/#5), inversion (#1 plan-confirm), constraint (#5 infer-from-intent).
- **Basis (direct):** every insight surface (cost-per-wear, re-wear rate, "worn 12x", the entire dashboard) is strictly downstream of this one input being captured faithfully. If logging is high-friction, the data thins and every mirror feature degrades.
- **Why it wins:** it is the dependency under everything else on this list. Worth doing before or alongside #1 and #4.
- **The tightrope:** the catch-up must be pull-based only. A "you forgot to log!" notification is an instant identity violation.

### 3. The planning surface (the Sunday week board) — A3

A simple week board that assigns a planned outfit to each day (weather-aware, since `fetch-weather` exists). The payoff loops directly into #2: a planned day becomes a one-tap confirm-to-log, collapsing planning and logging into one ritual. Optionally organized by occasion (dinner, interview, flight) rather than only by date.

- **Found by:** pain (#6), inversion (#1/#7 calendar), assumption (#5 occasion), constraint (#7 night-before), analogy (#4 reading-room pull).
- **Basis (direct):** the outfit builder and weather function both exist, but there is no calendar/planning surface connecting outfits to days, and the minimalist's "Sunday ritual" is explicitly named in PRODUCT.md as a behavior the product cannot currently host.
- **Why it wins:** serves the minimalist's core ritual AND pre-stages the week's logging, so #2 gets much of its value for free. High synergy.
- **The tightrope:** keep it a calm canvas, not a productivity planner. No reminders to "fill your week."

### 4. Year-in-Wardrobe (longitudinal reflection) — A2

An on-demand (and annual) reflective digest from existing wear data, rendered as a calm editorial page, not a shareable card: most-worn pieces, true cost-per-wear leaders, what earned its keep, what didn't move. Two compounding sub-features: cost-per-wear as a *trajectory* (a sparkline falling as wears accumulate, not a cold snapshot), and re-wear rate as a *trend line* (is the user succeeding at their own stated intent of reaching for what they own).

- **Found by:** leverage (#3/#6/#7), inversion (#6), analogy (#2 condition report), constraint (#3 one-thing).
- **Basis (reasoned):** all the data exists; what's missing is automated synthesis. The value is the *change over time* — a one-season user can't get this; a two-year user gets a genuinely personal rhythm. This is the compounding moat and the deepest retention (your memories don't export to a competitor).
- **The tightrope:** reflection-on-open only. The moment it becomes a place to "check back daily", it's a dashboard habit-loop the personas reject.

### 5. Piece provenance & biography (incl. the ghost shelf) — A1

Give each piece a quiet biography beyond a wear count: a provenance card (where acquired, the season it entered, who it was inherited from), optional per-wear notes (a "tasting note" register: how it felt, where worn), and a "ghost shelf" where donated/sold pieces stay catalogued and dimmed with the reason and date they left. The wardrobe becomes editorial history, not just current inventory.

- **Found by:** assumption (#1 ghost shelf / #4 provenance / #7 wear-is-not-the-only-verb), analogy (#1 accession card / #3 tasting notes), leverage (#8 provenance threads), constraint (#1 annual tribunal).
- **Basis (reasoned):** the curator persona treats the wardrobe as "inventory-of-meaning" and lives in detail views, but the schema flattens an inherited Lemaire coat and a basic tee into the same shape. Provenance is the structural feature that lets meaning compound — and the lifecycle PRODUCT.md implies (acquired -> worn -> archived/donated/sold -> remembered) currently drops "remembered."
- **Why it wins:** most emotionally differentiating; the hardest direction for any competitor to copy, because the value is the user's own accreted history.
- **The tightrope:** vocabulary discipline. Each event/verb must sit in the editorial-fashion register (per the naming memory), and it must not creep toward a journaling/Notion app.

### 6. Capsules as first-class, reusable objects — A5

Promote the "capsule" from an implicit idea to a real object: save a finished trip's set as a named, reusable capsule (the ten-piece winter set), refine it across years, and start the next similar trip from a proven capsule instead of an empty weather-suggestion. Add packing memory: "last beach trip you packed 12 and wore 7 of these" — your personal over-pack ratio, from your own history.

- **Found by:** pain (#8), assumption (#8 capsule is the unit), leverage (#4/#5), analogy (#8 tasting-menu), constraint (#4 pack-for-ten).
- **Basis (direct):** the packer persona literally thinks in capsules, but the product models *trips*, not *capsules* — the noun the user reasons in is missing. `suggest-packing` handles novelty, but most travel is repeat patterns.
- **Why it wins:** turns packing from a per-trip cold-start into curating a durable artifact that improves over time — intention compounding across trips.
- **The tightrope:** don't over-formalize into a "packing optimizer." The capsule is a remembered set, not a solved equation.

### 7. Lower the cataloging cold-start — A1 (adoption enabler)

The standout friction (noted in CLAUDE.md): getting clothing *into* the app is manual and tedious, which stalls every persona before they reach value. The high-confidence subset: clone-to-add ("add another in...") so near-twin pieces inherit brand/category/material; a draft/"unfinished shelf" state so interrupted entries wait quietly instead of being lost or polluting the grid.

- **Found by:** pain (#1/#2), inversion (#2 receipt-email / #3 vision auto-tag — see Flagged below).
- **Basis (reasoned + direct):** multi-field manual entry over a real closet is inherently interruptible; the cold-start is the gate on adoption. The wardrobe already models the fields to inherit and already has active/archive states (a draft is a natural third).
- **Why it matters:** the enabler under all the others — none of the insight features matter on an empty or half-entered wardrobe.

---

## Flagged (promising but carries identity risk or heavier scope)

- **Observed pairing affinities / auto-built "worn-together" outfits** (inversion #8, leverage #1, assumption #3). Genuinely useful as a *mirror* ("you've worn these together 6x"), but one phrasing slip turns it into a recommendation engine ("wear this with that") — the coach line. Keep as detail-page enrichment only, never a suggestion surface. The agents flagged this themselves.
- **Receipt/order-email parsing for cataloging** (inversion #2). Removes the worst metadata entry, but needs email-ingest infra + parser reliability. Promising, heavier; a fast-follow to #7's manual wins, not the first move.
- **Vision background-removal + auto-tagging** (inversion #3). Real ML dependency and scope; defer until the simpler cataloging wins land.
- **Calendar integration** (inversion #7). A privacy + integration surface; the in-app week board (#3) delivers most of the value first.

## Rejected (identity conflict)

- **Retire the dashboard / "one thing today"** (assumption #6, constraint #3). Bold and on-theme in spirit, but removes the overview the packer and curator actively want, and "one daily card chosen by the app" edges toward a daily-check habit. Provocative as a design *principle* to absorb (keep insight ambient and in-context), not as a feature to ship.
- Anything reward-frequency-shaped (streaks, "you haven't logged in N days", push-to-open, social comparison). None survived; the frames were instructed to reject these, and did.

---

## Recommendation: the highest-leverage sequence

If picking one thread to take into `ce-brainstorm` first: **#1 (rediscovery surface)** is the strongest standalone — it is the product's reason-for-being made visible, serves the most on-mission persona, and rides on data that already exists. But **#2 (wear-capture fidelity)** is the dependency under everything, so the sharpest *sequence* is **#2 then #1 then #3** (capture -> rediscover -> plan), which also happens to weave the re-wearer, the minimalist, and the dashboard's data integrity into one coherent arc. #4/#5/#6/#7 are excellent second-wave bets, one per remaining persona.
