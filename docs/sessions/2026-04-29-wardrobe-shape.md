# 2026-04-29: Wardrobe grid shape pass — Impeccable step 5

Continuation of the design-system staircase from [2026-04-24 evening](2026-04-24-evening-design-system.md). Last session locked the visual brand system (matcha palette, Jost type, gold=data rule, 2-token radius scale) into `docs/brand/matcha.html` and PRODUCT.md. This session ran `/impeccable shape` on the wardrobe grid — the most-trafficked screen in Ropero — to define UX architecture before any code migration. Output is a high-fi design brief that hands off to `/impeccable craft` next session for the actual token migration + grid rebuild.

## Shipped

- **`docs/plans/2026-04-29-wardrobe-shape.md` — full design brief.** 10-section structured artifact: feature summary, primary user action, design direction, scope, layout strategy, key states, interaction model, content/vocabulary fixes, recommended downstream passes, open questions for craft. Source of truth for the wardrobe rebuild. Doc-only commit, direct to main.
- **`KNOWN-ISSUES.md` — `[SHAPE-WARDROBE-2026-04-29]` entry.** Logged the two deferred hover treatments (metadata peek, quick actions) as future enhancements with explicit re-evaluation triggers (post-launch usage data / power-user requests / persona-mix shifts). User asked for these to be tracked in project documentation rather than dropped silently.

## Decisions worth remembering

- **Primary use of the wardrobe screen is "mix, no dominant"** across the four personas. All three goals (browse, find, maintain) get equal weight in the design — no single goal optimization. Implies sort + light filter + clean grid + invokable details, none shouting.
- **Realistic wardrobe size is 50–150 pieces** (sweet spot, no pagination). Affordances scale gracefully past 200 without threshold-triggered UI changes.
- **Card hover is light treatment only** — 1px border-color shift to matcha. No shadow, scale, or motion. Honors Principle 2 (chrome recedes, the wardrobe is the hero).
- **Per-piece manual flag is renamed "Signature"** (was "favorite", which violates PRODUCT.md vocabulary). Verb: *Mark as signature*. Noun: *Signature pieces*. Sort label: *Signature first*. DB column when craft lands: `is_signature: boolean`. The user pushed back on the initial recommendation ("Mark") as confusing — the second-take rename to "Signature" landed because it's editorial-fashion vocabulary rather than tool vocabulary, and it propagates cleanly into the data model.
- **Importance is data-driven AND manual.** Sort options surface importance via wear-count, recency, cost-per-wear; the Signature gesture is a manual override on top. This was the user's most interesting answer in discovery — "rename the gesture, but should also have a concept of data influencing the importance that is surfaced." Both layers exist together.
- **Color swatch on cards: kept, moved bottom-left** (was bottom-right). The pin/signature marker takes the top-right corner; the swatch retains a corner of its own. Polish-pass open question: does the swatch earn presence at all when the photo conveys color directly?
- **Search + density toggle are always available, visually quiet** at all wardrobe sizes — no threshold-promoted disclosure. The user picked this over the threshold-trigger approach I initially proposed; it's the more Ropero-voice answer (available without insisting).
- **Status dropdown retired.** Active ↔ Archive segmented control on the same `/wardrobe` route replaces the four-state status dropdown. Donated/sold collapse into Archive with their specific status surfaced as a per-card pill. Removes a task-app affordance, gives the screen a closet's mental model rather than a CRM list's.
- **Vocabulary fixes documented for the craft pass.** "Item" → "piece" everywhere on this screen. "Add Item" → "Add a piece". "No items found" splits into first-time vs filtered with different copy. "Worn N times" stays (wear/worn is in the vocabulary).

## Process notes and user preferences picked up

- **User has good editorial-vocabulary instincts.** Pushed back when "Mark" felt confusing as a rename for "favorite", which forced a sharper second-pass exploration that landed on "Signature" — a genuinely better word with fashion-editorial provenance. Lesson: when the first naming proposal lands with friction, surface the next layer of candidates with full context (verb form + noun form + sort label) rather than picking the runner-up from the original list.
- **User asks for deferred ideas to be logged, not dropped.** Both deferred hover treatments (metadata peek, quick actions) explicitly requested in KNOWN-ISSUES with re-evaluation triggers. Pattern: when a user picks the conservative option among 3-4, ask whether the rejected richer options are worth filing.
- **User picks the simpler-mental-model answer when offered.** "Always available, quiet" beat the threshold-trigger approach; the segmented Active/Archive beat the dedicated route. Consistent direction: prefer flatter affordances and progressive *visibility* over progressive *existence*.

## Known issues opened/closed

### Opened — `[SHAPE-WARDROBE-2026-04-29]`

- **Wardrobe card hover: deferred richer treatments.** Two hover treatments (metadata peek showing last-worn date / cost-per-wear / etc., and quick actions like mark worn / add to outfit / archive) were considered for the wardrobe card and explicitly deferred. Re-evaluate when post-launch usage data shows users repeatedly clicking into detail just to log a wear, when a power-user request emerges from the personas, or if the curator persona is identified as the dominant user and the design pivots toward density-and-information. Logged in [KNOWN-ISSUES.md](../../KNOWN-ISSUES.md).

### Closed — nothing this session.

## Next session starting points

- **Step 6: `/impeccable craft` on the wardrobe grid.** The shape brief at [docs/plans/2026-04-29-wardrobe-shape.md](../plans/2026-04-29-wardrobe-shape.md) is the input. Craft does the actual code migration:
  - Convert matcha hex tokens to OKLCH in [apps/web/app/globals.css](../../apps/web/app/globals.css), replacing the stock shadcn grayscale.
  - Rewrite [packages/ui/src/tokens.ts](../../packages/ui/src/tokens.ts) to the matcha palette (currently legacy blue — see `[DESIGN-SYSTEM-2026-04-24]` in KNOWN-ISSUES).
  - Swap the `next/font` imports to Jost.
  - Apply the `--radius-structural` / `--radius-interactive` pattern to shadcn primitives.
  - Rebuild [apps/web/app/(app)/wardrobe/page.tsx](../../apps/web/app/(app)/wardrobe/page.tsx), [apps/web/components/wardrobe/item-card.tsx](../../apps/web/components/wardrobe/item-card.tsx), and [apps/web/components/wardrobe/item-filters.tsx](../../apps/web/components/wardrobe/item-filters.tsx) per the shape brief.
  - Add migration for `items.is_signature: boolean`.
  - Apply vocabulary fixes (item → piece, etc.).
  - Implement Active/Archive segmented control + retire status dropdown.
  - Retire `/brand-preview` (PR #61) in the same PR as the migration.
  - Regular feature branch + PR (code change, not doc-only).
- **Step 7: `/impeccable document`** writes DESIGN.md from the landed system. Final codification.
- **Stale branches still around.** PR #61 (`feat/brand-preview-matcha`) remains effectively obsolete — close or convert into the step-6 craft PR. PR #60 (`chore/tokenize-page-shell-backgrounds`) is older and likely subsumed by the upcoming token migration; review and close or rebase onto craft.
- **Adjacent shape passes worth scheduling.** The brief deliberately scoped to the wardrobe index. The detail page (`/wardrobe/[id]`), the add flow (`/wardrobe/add`), the home screen, the outfit builder, and the trip packer each warrant their own shape pass before they're crafted. Wardrobe is the canonical screen — its craft proves the system; the others get shaped after.

## Artifacts

- Shape brief: [docs/plans/2026-04-29-wardrobe-shape.md](../plans/2026-04-29-wardrobe-shape.md).
- Companion KNOWN-ISSUES entry: [SHAPE-WARDROBE-2026-04-29] in [KNOWN-ISSUES.md](../../KNOWN-ISSUES.md).
- Existing wardrobe code surveyed: [apps/web/app/(app)/wardrobe/page.tsx](../../apps/web/app/(app)/wardrobe/page.tsx), [apps/web/components/wardrobe/item-card.tsx](../../apps/web/components/wardrobe/item-card.tsx), [apps/web/components/wardrobe/item-filters.tsx](../../apps/web/components/wardrobe/item-filters.tsx).
- Brand mood board (in-house anchor): [docs/brand/matcha.html](../brand/matcha.html).
