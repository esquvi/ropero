---
title: "Rediscovery surface: dormancy lens + seasonal re-encounter"
status: active
date: 2026-06-22
type: feat
origin: docs/ideation/2026-06-22-next-features.md (idea #3)
---

# Rediscovery surface: dormancy lens + seasonal re-encounter

## Summary

A way for the user to rediscover pieces they already own but have stopped reaching for, so the closet itself answers "what could I be wearing that I'm not?" before the impulse to buy something new. It ships as two coordinated, low-ceremony surfaces on existing screens: a season-aware **dormancy lens** in the wardrobe grid (active browsing), and a quiet **"back in season" module** on the dashboard (ambient serendipity). It states bare fact ("not worn since October"), never a prescription. This is the product's anti-consumption thesis ("rediscover before you buy") made visible, serving the re-wearer persona that currently has no surface of its own.

## Problem frame

Ropero captures every wear, so "last worn" is computable today, yet nothing surfaces *absence*. The wardrobe grid surfaces signature pieces and cost-per-wear; the dashboard surfaces recent activity. A re-wearer who wants to find what they've forgotten has only one move: manually scroll the whole grid and try to remember. The data to answer the question already exists and sits unused. The cost of the gap is the product's own mission: rediscovery only fights over-buying if the forgotten is made visible.

**Why now:** the wear-history dataset is the compounding core, and this is the lowest-build-cost, highest-persona-value way to turn already-captured data into the re-wearer's headline experience. It also pairs naturally with the wear-capture-fidelity and reflection work ranked alongside it in the origin ideation.

## Actors

- **A1 - The re-wearer (primary).** Wants to stop buying and rediscover what's already in the closet. Values wear-history and low-wear surfacing. This surface is built for them.
- **A2 - The curator (secondary).** Lives in detail views; treats the wardrobe as inventory-of-meaning. Benefits from honest "last worn" facts on their pieces.
- **A3 - The intentional minimalist / the packer (not excluded).** Equally-weighted personas who should not be alienated; the surface must not narrow the product toward only the re-wearer. They encounter it passively (the dashboard module) without it intruding on their flows.

## Key flows

- **F1 - Browse the forgotten.** From the wardrobe, the user switches to the dormancy lens and sees their pieces ordered by how long it's been, in-season-and-unworn first, each stating its own last-worn fact.
- **F2 - Encounter a re-encounter.** On the dashboard, the user passively notices a few pieces whose season has come back around and that they haven't worn recently ("back in season").
- **F3 - Act on a rediscovery.** The user taps a resurfaced piece and lands on its existing detail page, where Log Wear and add-to-outfit already live. Action is always user-initiated.

## Requirements

### The dormancy lens (in the wardrobe grid)

- **R1.** The wardrobe grid gains a season-aware dormancy view (a lens/mode alongside the existing sorts), reusing the existing grid, card, filter, and active/archive patterns rather than a new screen.
- **R2.** In the dormancy view, pieces are ordered by time since last worn (longest first), with **in-season** pieces surfaced ahead of **out-of-season** pieces. A piece is in-season when its `season` tags include the current season; pieces with no season tags are treated as always in-season.
- **R3.** Out-of-season pieces ("resting," e.g., a wool coat in July) are visually de-emphasized or separated from the in-season "forgotten" group, never blended into the same "you're not wearing this" signal. They remain reachable, stated as honest fact.
- **R4.** Each card states its own dormancy as concrete fact: a never-worn piece reads "not worn yet" (or `0x`), a previously-worn piece reads "not worn since <month/date>". The date/count renders in `text-gold` with `tabular-nums` per the gold-marks-the-data rule; the surrounding label stays neutral.
- **R5.** There is **no hard day-threshold and no "Dormant" label or badge.** Surfacing is by sort order, not by classification. The app never asserts a binary dormant/not-dormant verdict.
- **R6.** The dormancy view honors the grid's existing category filter and active/archive scoping (archived pieces are not "forgotten"; dormancy operates over active pieces).

### The seasonal re-encounter module (on the dashboard)

- **R7.** The dashboard gains a quiet "back in season" module, consistent in weight and treatment with the existing dashboard modules (stats, recent activity, upcoming trips), not a dominant hero.
- **R8.** The module surfaces a small, bounded set of pieces (a few at a time) whose season is currently active and that have not been worn recently within that season, cross-referencing the existing weather/season signal with last-worn.
- **R9.** Each surfaced piece is stated as fact ("not worn since last winter" / "back in season") with the data portion in gold, and links to the piece detail. The module never tells the user to wear anything.
- **R10.** When there is nothing meaningful to resurface (new account, everything recently worn, no in-season dormant pieces), the module renders a calm, honest empty/low-data state rather than a void or a filler nudge, or quietly omits itself.

### Voice, action, and restraint (cross-cutting)

- **R11.** All copy is bare declarative fact in the mirror voice. No prescriptions ("should," "wear this more"), no exclamation, no urgency, no shame for not opening the app. Vocabulary follows PRODUCT.md (curated/considered/piece/wear/worn; never item/product/favorite/trending).
- **R12.** Both surfaces are pull-based and screen-resident. **No notifications, no push, no streaks, no gamification, no social comparison, no "buy" affordances.**
- **R13.** The surfaces are reflective: any action on a piece flows through its existing detail page (tap to open). No new in-place CTAs (Log Wear / add-to-outfit) are added to the rediscovery surfaces in v1.
- **R14.** The feature serves the re-wearer without narrowing the product: the minimalist/packer are not forced through it, and the curator's detail views are unaffected except for the honest facts they already deserve.

## Acceptance examples

- **AE1 (F1, R2/R4).** A linen shirt (season: summer) last worn 2025-08-30, viewed in June, appears near the top of the dormancy lens reading "not worn since August," the date in gold.
- **AE2 (F1, R3).** A wool coat (season: winter) last worn in March, viewed in July, is de-emphasized or separated as out-of-season/resting and does not occupy the top "forgotten" slots, even though its raw time-since-worn is large.
- **AE3 (F1, R4).** A piece never worn shows "not worn yet" (not a date) and is eligible to surface as a strong rediscovery candidate.
- **AE4 (F2, R8/R9).** When autumn becomes the current season, a jacket (season: fall) not worn since last autumn appears in the dashboard "back in season" module with its fact in gold and a link to its detail page; the module issues no instruction to wear it.
- **AE5 (R10).** A brand-new account with no wear history shows a calm empty state in the module and an honest dormancy lens ("not worn yet" across pieces), never an empty void or a fabricated suggestion.
- **AE6 (F3, R13).** Tapping any resurfaced piece opens its existing detail page; the rediscovery surfaces themselves expose no wear/outfit buttons.

## Scope boundaries

### In scope
- The season-aware dormancy lens in the wardrobe grid (web).
- The "back in season" dashboard module (web).
- Mirror-voice copy for both, including empty/low-data states.

### Deferred for later (earn with evidence)
- **A dedicated rediscovery surface / nav destination.** Start inside existing surfaces; graduate to its own space only if usage shows the re-wearer repeatedly wants a deep rediscovery *workspace* (filter/compare/act on many at once) and there is enough wear data that the surface is not born empty.
- **In-place actions** (Log Wear / start-an-outfit) on the rediscovery surfaces. Add one quiet action later only if tap-through-to-act friction proves real. Tracked relationship: KNOWN-ISSUES `[SHAPE-WARDROBE-2026-04-29]` deferred quick-actions-on-cards for the same task-app-feel reason.
- **Mobile parity.** This brief is web-first; the equivalent mobile treatment is a follow-up (the mobile app shares the data but has its own surfaces).

### Outside this product's identity (do not build)
- Any prescriptive or motivational framing ("you should wear this," "your re-wear streak").
- Notifications, push, or any re-engagement mechanic that pulls the user back to the app.
- A "Dormant" verdict label, a percentile/ranking ("bottom 25%"), or any classification that judges rather than reflects.
- A "buy more," resale, or marketplace affordance attached to forgotten pieces.

## Success criteria

- A re-wearer can answer "what in-season piece have I been ignoring?" in one move from the wardrobe, without manual scrolling or memory.
- The surface reads as honest reflection, not instruction: every line is a fact the user could verify, no line tells them what to do.
- It degrades gracefully at low/zero wear data (honest, never empty-void or filler).
- It adds no new nav destination and no notification surface; carrying cost stays low by reusing the grid and dashboard.
- Out-of-season resting pieces do not pollute the "forgotten" signal (the trust test).

## Key decisions and rationale

- **Two surfaces on existing screens, not a dedicated tab.** Browse and serendipity are different jobs; housing them in the wardrobe (browse) and dashboard (ambient) reuses crafted surfaces, avoids a 6th nav destination (Principle 1 restraint), keeps the wardrobe the hero (Principle 2), and dodges the "prominent empty tab" failure mode for an app with little wear data yet. The dedicated surface is deferred, not rejected.
- **Season-aware, no hard threshold.** Raw time-since-worn would surface out-of-season resters as "forgotten" and erode trust. A hard threshold forces a binary verdict the app would have to assert; a sort + a concrete date asserts nothing and stays a mirror. Season-awareness is cheap (pieces already carry `season`).
- **Reflective, not transactional.** The mirror/coach line is about who initiates, not whether action is possible. Routing action through the existing detail page keeps initiation with the user and avoids re-introducing the card-level quick-actions the team already deliberately deferred.

## Open questions for planning

- **Current-season derivation.** Derive the current season from the calendar month (with a hemisphere assumption) or from the existing weather signal (more accurate, location-aware)? The weather path is richer but couples the lens to weather availability; the calendar path is simple but hemisphere-naive.
- **"Recently worn within the season" definition** for R8 — does the dashboard module mean "not worn at all this season," "not since the last time this season was active," or a rolling window? Needs a concrete, defensible default.
- **Module size and refresh** — how many pieces does the dashboard module show, and does its selection change on each load or stay stable within a session/day (stability matters to avoid a slot-machine feel)?
- **Where exactly the lens lives** in the wardrobe controls (a new sort option, a distinct mode toggle, or a filter), and how it composes with the existing sorts/filters and the active/archive segmented control.
- **De-emphasis vs. separation for out-of-season pieces** (R3) — a quieter visual treatment inline, a secondary grouped section, or excluded from the default view with an opt-in.
- **Tiebreakers** when many pieces share the same last-worn date (e.g., bulk-added pieces never worn) — likely a stable secondary order.
- **Mobile** — confirm web-first is acceptable for v1 and the mobile follow-up is separately tracked.

## Dependencies and assumptions

- **Data already present (verified):** `items.last_worn_at`, `items.times_worn`, `items.season` (array of spring/summer/fall/winter), `items.status`; `wear_logs.worn_at`; the `fetch-weather` edge function and `packages/core` weather logic.
- **Assumption:** the re-wearer's desire to rediscover-before-buying is the product thesis from PRODUCT.md, not yet validated against real usage (the app is early). This surface is itself the cheapest way to test that thesis; success should be read accordingly.
- **Assumption:** current season can be derived acceptably for v1 from available signals (calendar and/or weather); the exact source is an open question above, not a blocker.
