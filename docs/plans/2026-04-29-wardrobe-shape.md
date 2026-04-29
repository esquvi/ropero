# Wardrobe Grid — Shape Brief

**Status:** Shape complete, ready for `/impeccable craft`. Doc-only artifact, committed to `main`.
**Provenance:** Output of `/impeccable shape` on 2026-04-29 (step 5 of the Impeccable staircase, per [docs/sessions/2026-04-24-evening-design-system.md](../sessions/2026-04-24-evening-design-system.md)).
**Reads from:** [PRODUCT.md](../../PRODUCT.md), [docs/brand/matcha.html](../brand/matcha.html), [apps/web/app/(app)/wardrobe/page.tsx](../../apps/web/app/(app)/wardrobe/page.tsx).
**Hands off to:** `/impeccable craft` next session, which migrates the matcha tokens into [apps/web/app/globals.css](../../apps/web/app/globals.css) + [packages/ui/src/tokens.ts](../../packages/ui/src/tokens.ts) and rebuilds the wardrobe grid against this brief.

This document is the source of truth for the wardrobe grid's shape. When craft happens, decisions documented here are settled. Open questions inside the brief are flagged inline.

---

## 1. Feature Summary

The wardrobe grid is the most-trafficked screen in Ropero. It serves four personas equally — minimalist, curator, re-wearer, packer — and three roughly-equal user goals: browsing what you own, finding a specific piece, and light maintenance. The grid must read as a curated archive (not a database, not a feed) while staying performant at the realistic 50–150 piece range and graceful past 200.

## 2. Primary User Action

**See pieces clearly, then act on one.** Every other affordance — sort, filter, add, archive, signature — is subordinate to that. Photos are the content; UI chrome is the frame.

## 3. Design Direction

- **Color strategy: Restrained** (product default, [PRODUCT.md](../../PRODUCT.md) Principle 1). One accent — matcha green — for current selection, primary action, and signature-active state. Gold reserved exclusively for data values (wear count, dates, cost-per-wear) per the locked-in *gold-marks-the-data* rule. The photos carry the chromatic weight; the chrome stays warm-neutral.
- **Theme via scene sentence.** *An intentional dresser at home on Sunday evening, considering the week's outfits in soft daylight or warm lamp light — unhurried, looking rather than scrolling.* This forces **light as the natural default** (warm off-white `#EEEFE8`); dark mode is supported as its own register (matcha green `#9EBF94` on `#0C0F0A`), not framed as the marquee.
- **Anchor references:** Toteme product grid (chrome restraint), Aesop product pages (typography rhythm), Jil Sander e-commerce (hard-edge cards, no decoration), `docs/brand/matcha.html` itself (in-house source of truth).
- **Per-surface override:** none — the wardrobe sits squarely in product Restrained.

No visual probes generated; the matcha mood board already encodes wardrobe direction visually.

## 4. Scope

- **Fidelity:** high-fi, production-ready.
- **Breadth:** the wardrobe index page (the grid surface itself) plus its filter bar, empty states, loading state, and card. The detail page (`/wardrobe/[id]`) and add flow (`/wardrobe/add`) are in adjacent shape passes, not this one.
- **Interactivity:** real component, full state coverage (default, hover, focus, loading, empty, filtered-empty, error).
- **Time intent:** thorough — this is the canonical screen, the one that defines the system in motion.

## 5. Layout Strategy

Three vertical zones, decreasing density top-to-bottom.

```
┌─────────────────────────────────────────────────────────┐
│  Wardrobe       142 pieces                  [Add]       │  ← masthead (sparse)
├─────────────────────────────────────────────────────────┤
│  Sort ▾   Filters ▾   ⌕   ▦/▤      ─Active─ Archive     │  ← controls (quiet, always-available)
├─────────────────────────────────────────────────────────┤
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐                      │
│  │   │  │   │  │   │  │   │  │   │                      │  ← grid (the hero, generous gap)
│  │ ● │  │ ● │  │ ● │  │ ● │  │ ● │                      │     ● = color swatch, bottom-left
│  └───┘  └───┘  └───┘  └───┘  └───┘                      │
│   name    name    name    name    name                  │
│   brand   brand   brand   brand   brand                 │
│   12×     3×      24×     1×      8×                    │  ← gold = wear count
└─────────────────────────────────────────────────────────┘
```

- **Masthead:** "Wardrobe" in display weight + count (gold, per the rule) + "Add a piece" CTA. No description sub-line.
- **Controls row:** sort dropdown, filters disclosure (collapses category/season behind one button), search icon (expands inline on click), density toggle (regular ▦ / compact ▤), and a two-state segmented control: **Active** ↔ **Archive**. Status leaves the dropdown entirely; donated/sold collapse into Archive with their specific status surfaced on the card or in the detail page.
- **Search and density toggle: always available, visually quiet.** No threshold-based promotion. The same affordances are present at 40 pieces and 350; at small sizes they sit unused, at large sizes they earn their keep without being added "later."
- **Grid:** 2/3/4/5 columns at the existing breakpoints. Generous gap (`gap-6` minimum, possibly `gap-8` at lg+) — Toteme spacing, not Pinterest. Cards are rectangles, 1.5px border, 0px radius (`--radius-structural`). Photos full-bleed, aspect-square.

## 6. Key States

| State | What the user needs | Visual posture |
|---|---|---|
| **Default (active, no filter)** | Pieces, sortable, scannable | Full grid, sort = Recently added, filters collapsed |
| **Filtered** | Confirmation of what's filtered + escape hatch | Active filter pills under the controls row, "Clear" inline, count updates |
| **Empty (first-time)** | Welcome, set expectations, get to first action | Centered: "Your wardrobe is empty." sub-line about adding pieces. Single CTA. No dashed-border box (replace the current shadcn empty pattern). |
| **Empty (filtered)** | "Nothing matches" without dead-end | "No pieces match these filters." Inline "Clear filters" button. No CTA to add. |
| **Loading** | Sense of the grid before pixels arrive | Skeleton grid: 8–10 ghost cards (square photo placeholder + 2 thin lines), warm-neutral fill, no spinners, no shimmer. PPR-friendly. |
| **Error** | Honest report + retry | Inline message, no toast, no full-page error. "Couldn't load your wardrobe. [Retry]" |
| **Archive view** | Pieces no longer in active rotation, with reason | Same grid layout, slight chrome tint (e.g. desaturated card border), status pill on each card (Archived / Donated / Sold). |

## 7. Interaction Model

### Card-level

- **Click:** opens detail page. Whole card surface, not just the photo.
- **Hover (web only):** light treatment — 1px border color shifts from neutral to matcha. No shadow change, no scale, no movement. Richer hover treatments (metadata peek, quick actions) are deferred — see [KNOWN-ISSUES.md](../../KNOWN-ISSUES.md) under `[SHAPE-WARDROBE-2026-04-29]`.
- **Signature gesture:** small marker icon top-right of the photo. Inactive: thin 1.5px outline only, neutral color. Active: filled gold. Click toggles without navigating. The gesture vocabulary is *"Mark as signature"* / set name *"Signature pieces"* / sort label *"Signature first"*.
- **Color swatch:** small dot, bottom-left of photo. 1px white outer ring + 1px structural radius. Shows `color_primary` from the `items` table.

### Filter bar

- **Sort dropdown** (single-select): Recently added (default), Recently worn, Most worn, Least worn, Signature first, By color, By brand, Cost-per-wear.
- **Filters disclosure** expands a thin row with category multi-select and season multi-select. (Today's three dropdowns become two; status disappears from this menu.)
- **Search:** small icon in the row by default, expands inline on click, collapses on blur if empty.
- **Density toggle:** two-state icon (regular grid / compact grid). Compact reduces card photo size and hides the brand line — name and wear-count remain.
- **Active/Archive segmented control** replaces the status dropdown.
- **Active filters** render as removable pills under the row. Each pill is dismissable; "Clear all" appears when any are present.

### Sort and importance, intertwined

Per the discovery answer ("rename the gesture, but data should influence importance"), the brand-loud expression of importance is the **sort menu**, not a single fanfare. *Most worn* and *Cost-per-wear* are not power-user features — they are how Ropero rewards intention over consumption (Principle 3). The Signature gesture is a **manual override** on top of that data layer.

## 8. Content Requirements

### Vocabulary fixes

| Today | Replace with |
|---|---|
| "Add Item" | "Add a piece" |
| "items in your wardrobe" | "pieces" |
| "No items found" (first-time) | "Your wardrobe is empty." |
| "No items found" (filtered) | "No pieces match these filters." |
| "Worn 12 times" | Keep — verb form is in the vocabulary |
| "Active / Archived / Donated / Sold" dropdown | Active / Archive segmented control + per-piece status pill in archive |
| "Favorite" (as a gesture) | **Signature** (verb: *Mark as signature*; noun: *Signature pieces*; sort: *Signature first*) |

### Sort menu labels

The dropdown trigger reads "Sort: [active value]". Options:

- Recently added
- Recently worn
- Most worn
- Least worn
- Signature first
- By color
- By brand
- Cost-per-wear

### Empty state body copy

- **First-time:** "Your wardrobe is empty. Add your first piece to begin." Single CTA: "Add a piece."
- **Filtered:** "No pieces match these filters." Single inline action: "Clear filters."
- **Search-empty:** "Nothing matches *[query]*." Inline: "Clear search."

### Microcopy posture

Declarative, no exclamation marks, no "Get started", no "Looks like..." softeners. Voice from PRODUCT.md.

## 9. Recommended Downstream Passes

When this hands off to `/impeccable craft`, the most useful adjacent passes:

- **`/impeccable typeset`** — the masthead "Wardrobe" + gold count benefits from a deliberate display-vs-body weight contrast at the matcha system's Jost weights (300/400/500/700).
- **`/impeccable layout`** — generous gap and column rhythm at responsive breakpoints; the temptation will be to shrink gap as columns grow, which is wrong.
- **`/impeccable harden`** — empty states, error states, search-zero-state need the same care as default. Currently undercooked in the codebase.
- **`/impeccable colorize`** — at the moment of adding the matcha tokens to globals.css, this screen is the proving ground. The "gold marks the data" rule lives or dies on the wear-count typography here.

## 10. Open Questions for Craft

These are decisions deferred to implementation, not design:

1. **Compact density toggle implementation.** Whether the toggle changes column count (e.g. 5 → 7 cols at lg) or shrinks card content (smaller photo, less metadata) at the same column count. Recommendation: same columns, smaller photos and hidden brand line. Verify against real photos at craft time.
2. **Color swatch presence audit at polish.** The swatch is kept and moved to bottom-left here. After craft, look at real cards on real photos and decide whether it earns its space or reads as duplicated information.
3. **`is_signature` migration timing.** The signature feature requires a boolean column on `items`. Add it in the same craft PR as the UI work, or in a separate migration PR ahead of UI? Recommendation: same PR, since the feature is end-to-end and signature-without-data or data-without-UI ships partial state.
4. **Skeleton card count.** Brief proposes 8–10. Refine to match the breakpoint's typical first-fold visible card count: 4 at mobile, 6 at sm, 8 at md, 10 at lg+. Determine in craft.

## Decisions logged

The shape pass made these decisions explicitly. They are not re-litigated in craft.

- Primary use is "mix, no dominant" across the four personas — design serves all three goals (browse, find, maintain) equally.
- Realistic wardrobe size is 50–150 pieces; affordances scale gracefully past 200 without threshold-triggered changes.
- Card hover is light treatment only; richer treatments deferred to KNOWN-ISSUES.
- Per-piece manual flag is renamed **Signature** (was "favorite"). DB column: `is_signature: boolean`.
- Color swatch kept, moved to bottom-left of photo.
- Search and density toggle are always available, visually quiet — no threshold logic.
- Archive lives on the same `/wardrobe` route via segmented control; donated/sold collapse into archive.
- Status dropdown is retired entirely.

## Companion artifact: KNOWN-ISSUES entry

The hover-treatment alternates (metadata peek, quick actions) are logged in [KNOWN-ISSUES.md](../../KNOWN-ISSUES.md) under tag `[SHAPE-WARDROBE-2026-04-29]` for reconsideration after launch usage data, power-user requests, or persona-mix shifts.
