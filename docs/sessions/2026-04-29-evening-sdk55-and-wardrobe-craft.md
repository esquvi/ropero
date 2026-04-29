# 2026-04-29 (evening): Expo SDK 55 attempt held + wardrobe grid craft

Two chapters, same day:

1. **Expo SDK 55 upgrade.** Coordinated upgrade of the mobile app from SDK 54 to 55, supersedes Dependabot PRs #63/#65/#66. Code work fully complete and committed. On-device verification blocked by Apple's App Store review delay on Expo Go SDK 55 + the project's deliberate no-paid-Apple-Developer-Program constraint, so the PR is held open until any verification path opens up.
2. **`/impeccable craft` on the wardrobe grid.** Step 6 of the Impeccable workflow following the morning's shape brief. Token migration to `apps/web/app/globals.css` + `packages/ui/src/tokens.ts`, Geist swapped for Jost via `next/font`, full wardrobe rebuild against the brief, new `is_signature` column.

## Shipped

### From SDK 55 (PR #67, held)

- **PR #67 [esquvi/ropero#67](https://github.com/esquvi/ropero/pull/67)** opened on `chore/expo-sdk-55`. Bumps `expo` to `^55.0.18`, runs `expo install --fix` (21 packages aligned including React Native 0.81.5 -> 0.83.6, react/react-dom 19.1 -> 19.2, react-native-reanimated 4.1 -> 4.2). Adds `expo-dev-client` so `eas.json`'s `development` profile becomes meaningful. Bumps `app.json` `expo.version` from 1.0.0 to 1.1.0 per the runtimeVersion appVersion rule. Two type fixes triggered by the bump: `useColorScheme.ts` narrows the new `"unspecified"` value from `ColorSchemeName`, `ExternalLink.tsx` casts `href` to expo-router's typed `Href` union.
- **Hold rationale documented in the PR description.** All code-level checks green (8 typecheck workspaces, 134 core + 25 supabase tests, lint), but Expo Go on the App Store currently ships SDK 54 maximum (verified by the user's installed Expo Go reporting "supported sdk of 54"). Apple App Review on the SDK 55 Expo Go build is delayed past the typical 1-3 week window. EAS dev build path requires paid Apple Developer Program enrollment, which Ropero is deliberately deferring. iOS Simulator path requires full Xcode (only Command Line Tools installed locally). PR is intentionally held with all CI green; merges the moment any verification path opens (likely the App Store update).

### From wardrobe craft (PR #68)

- **PR #68 [esquvi/ropero#68](https://github.com/esquvi/ropero/pull/68)** opened on `feat/wardrobe-craft`. Four logical commits:
  - `ba3d021` — Migrate `apps/web/app/globals.css` from stock shadcn grayscale OKLCH to the matcha palette. Adds `--gold` / `--gold-dk` / `--gold-lo`, `--accent-dk` / `--accent-lo`, `--text-mid` / `--text-dim`, `--success` / `--warning` as Tailwind colors via `@theme inline`. 2-token radius scale: `--radius-structural: 0px` (cards/dividers/surfaces), `--radius-interactive: 2px` (buttons/inputs/chips/badges). Tailwind named radii remapped: `rounded-md` -> 2px, `rounded-xl` -> 0px so existing shadcn primitives pick up the system. Swaps Geist for Jost via `next/font/google` (weights 300/400/500/700, single committed family). `packages/ui/src/tokens.ts` rewritten to the matcha hex palette as the human-readable mobile reference. Dark mode is its own composition (`#9EBF94` brighter matcha, `#DCBB6A` warmer gold, lit-from-within `#141A0E` cards), not an inversion.
  - `8b1bbe3` — Hygiene fix: `apps/mobile/components/ExternalLink.tsx` gets the same typed-routes `Href` cast that lives on the SDK 55 branch. Latent on `main` because CI uses `npm ci --ignore-scripts` and skips typed-routes generation.
  - `4851cda` — `supabase/migrations/00011_add_is_signature.sql` adds the `items.is_signature boolean NOT NULL DEFAULT false` column with a partial index on rows where `is_signature = true`. Powers the Signature first sort and the toggle UI.
  - `719fb8e` — Wardrobe rebuild end-to-end. New `apps/web/components/wardrobe/signature-toggle.tsx` (client component using `useTransition` against a server action). `apps/web/components/wardrobe/retry-button.tsx` (tiny client component for inline error retry via `router.refresh()`). `apps/web/app/(app)/wardrobe/actions.ts` with `toggleSignature` server action. Full rewrites of `wardrobe/page.tsx`, `components/wardrobe/item-card.tsx`, `components/wardrobe/item-filters.tsx` against the brief: editorial masthead with light Jost weight + gold count; sort dropdown with 8 options (cost-per-wear sorts post-fetch); multi-select category and season filters via comma-separated URL params using `.in()` and `.overlaps()`; inline search across name and brand with like-pattern defanging; Active/Archive segmented control replacing the four-state status dropdown; four distinct empty states; inline error block with Retry. Item card: hard-edge rectangle with 1.5px border that shifts to matcha on hover (no shadow, scale, or movement); square photo full-bleed; square color swatch bottom-left with a 1px card-tinted ring; archive status pill at bottom-right when status isn't active; gold tabular-nums wear count rendered as `Nx` with reduced opacity for `0x`. Compact density variant hides the brand line and tightens padding without changing column count.
- **Vocabulary fixes** scoped strictly to the wardrobe surface per the brief: "Add Item" -> "Add a piece", "items in your wardrobe" -> "{count} pieces" with the count rendered in gold, the four empty-state copies. Other surfaces deliberately untouched pending their own shape passes.
- **Browser preview verification on `/login`** confirmed the matcha tokens, Jost font, and 2-token radius scale all render correctly in light and dark mode. Token computed values: button border-radius 2px, card border-radius 0px, primary `lab(47.33% -17.08 17.20)` (matcha green), gold `lab(58.65% 6.49 42.82)`, body `font-family: Jost, "Jost Fallback", system-ui`. The wardrobe page itself couldn't be verified locally (Vercel CLI token expired so couldn't `vercel env pull`; stub Supabase env let the auth screen render but middleware redirects `/wardrobe` to `/login`). Visual verification of the wardrobe will happen on the Vercel preview deployment that auto-builds from the PR push.

### Memory updates

- **`project_no_apple_developer_account.md`** (new project memory). Captures the deferred-paid-enrollment constraint with reasoning + a ranked list of free verification paths. Indexed in `MEMORY.md`. The user said "we've discussed this many times in the past" when the EAS build path was proposed; this memory ensures future sessions don't repeat the mistake.

## Decisions worth remembering

- **OKLCH conversion via `culori` in a temp install.** The matcha hex tokens were converted to OKLCH using a one-shot npm install of `culori@4` in `/tmp` followed by a node `-e` script. Avoids polluting the project deps with a color-conversion library only needed for the migration. Saved the converted ramp inline in the commit message essence (each `oklch(...)` value annotated with its source hex in the globals.css comment column).
- **Tailwind v4 `@theme inline` does not expose CSS vars on `:root`.** During inspection, `getPropertyValue('--radius-md')` returned empty even though the values applied correctly via Tailwind classes. The system works at the class level (`rounded-md` -> 2px) without the vars themselves being available for runtime introspection. Worth knowing for any future debugging.
- **Server action + sibling layout for the signature toggle.** The card is wrapped in a `<Link>`, but the signature toggle is a sibling of the link inside an `<article className="relative">`, not a descendant. Combined with `e.stopPropagation` and `e.preventDefault`, this prevents the toggle click from firing the navigation. Cleaner than nesting a button inside the link and fighting React/HTML semantics.
- **Cost-per-wear sort sentinel.** Items with no purchase price or zero wears push to the end via `Infinity`. Direction: lowest first (best value, "most loved per dollar"). Honors Principle 3 (intention over engagement) by surfacing the pieces that earn their cost.
- **Borrowing the SDK 55 type fix into the wardrobe branch as hygiene.** The `ExternalLink.tsx` typed-routes cast was needed locally to keep `npm run typecheck` clean on this branch (typed-routes generation runs on `npm install`'s postinstall, which CI skips via `--ignore-scripts`). Brought the same fix into a separate commit (`8b1bbe3`) on this branch with a clear commit message explaining it duplicates work in #67. When #67 lands first, this commit becomes a no-op merge; when this lands first, #67 conflicts on that single line and is trivially resolved.
- **Strict scope on vocabulary fixes.** The brief lists vocab changes for the wardrobe surface only. Dashboard's "Add Item" CTA, the add page's title, the outfit page's "items in this outfit", trips packing list's vocabulary — all flagged but left untouched. Each gets fixed via its own shape pass. Resisted the temptation to do a sitewide sweep, which would have prejudged adjacent shape briefs.

## Process notes and user preferences picked up

- **The user has stated multiple times that paid Apple Developer Program enrollment is deferred.** Saved as project memory `project_no_apple_developer_account.md` so future sessions don't propose `eas build --profile development --platform ios`, `eas submit`, or paid enrollment as a step. Free paths only: Expo Go (when the App Store is current), iOS Simulator (free with Xcode), tethered iPhone via free Apple ID personal team signing, web preview.
- **The user prefers verification before claiming completion.** When the SDK 55 PR's smoke-test path was blocked, the call was to hold the PR rather than merge with green code-checks alone. Lesson: a defensible-on-paper PR isn't a mergeable PR until the actual user-facing surfaces have been checked. Holding is fine; the cost of waiting is much less than the cost of merging untested native code.
- **Fast pivots when a path is blocked.** When Expo Go was incompatible, the user accepted the EAS pivot, then immediately accepted the hold once paid enrollment was off the table. No wasted cycles arguing about non-options. The same energy carried into the wardrobe craft pivot — clean handoff between chapters within one session.

## Known issues opened/closed

### Opened — none new this session.

### Closed — pending merge of #68:
- `[DESIGN-SYSTEM-2026-04-24]` — token migration to `apps/web/app/globals.css` + `packages/ui/src/tokens.ts` lands with PR #68. Once merged, this can be marked resolved in [KNOWN-ISSUES.md](../../KNOWN-ISSUES.md).

## Next session starting points

- **Verify PR #68 visually on the Vercel preview deployment.** Sign in to the preview URL, work through the on-device test plan in the PR body. If anything reads off (cards too tight, hover fights the masthead, gold count too loud, etc.), iterate. Then squash-merge.
- **After PR #68 merges:** run `npx supabase db push` to deploy migration 00011 to Supabase Cloud. Mark `[DESIGN-SYSTEM-2026-04-24]` resolved in KNOWN-ISSUES.
- **`/impeccable document` (step 7).** Generates `DESIGN.md` from the now-tokenized code. Final codification of the design system.
- **`/impeccable critique` and `/impeccable polish` on the wardrobe grid.** The brief's recommended downstream passes. Critique evaluates against PRODUCT.md principles + persona walkthroughs. Polish handles micro-detail (color swatch presence audit, skeleton card count by breakpoint, hover treatment refinement).
- **Adjacent shape passes.** The wardrobe detail page (`/wardrobe/[id]`), the add flow (`/wardrobe/add`), the home/dashboard, the outfit builder, the trip packer — each gets its own `/impeccable shape` pass before its craft. Wardrobe is the canonical surface; the others get shaped after seeing it land.
- **PR #67 disposition.** Watch the App Store for an Expo Go SDK 55 release (likely within 1-3 more weeks). When it lands, install the update, scan the QR for `feat/wardrobe-craft` (or whatever's then-current main), run the smoke checklist, merge. Until then, PR sits with green CI.
- **PR #62 (Dependabot minor-and-patch group of 22).** After #67 merges, comment `@dependabot recreate` to rebuild against the new SDK 55 baseline.
- **Lint-config session: eslint 10 (PR #64).** Standalone `flat config` migration. Single-PR session.

## Artifacts

- PR #67: [esquvi/ropero#67](https://github.com/esquvi/ropero/pull/67) — Expo SDK 55 upgrade (held).
- PR #68: [esquvi/ropero#68](https://github.com/esquvi/ropero/pull/68) — Wardrobe grid craft.
- New project memory: [project_no_apple_developer_account.md](../../../.claude/projects/-Users-marcomartellini-Projects-Ropero/memory/project_no_apple_developer_account.md) (in user memory directory, not in-repo).
- Migration: [supabase/migrations/00011_add_is_signature.sql](../../supabase/migrations/00011_add_is_signature.sql).
- Source brief: [docs/plans/2026-04-29-wardrobe-shape.md](../plans/2026-04-29-wardrobe-shape.md).
- Brand mood board reference: [docs/brand/matcha.html](../brand/matcha.html).

## Final state

- `main` at `66330dd` (unchanged from session start).
- Open PRs: 7. PR #67 (SDK 55, held), PR #68 (wardrobe craft, awaiting visual verification on Vercel preview), plus the five Dependabot PRs (#62, #63, #64, #65, #66) deferred from the morning.
- Local branches: `main`, `chore/expo-sdk-55` (waiting for App Store), `feat/wardrobe-craft` (current). No `[gone]` entries.
- Working tree on `feat/wardrobe-craft` is clean.
- KNOWN-ISSUES entries opened this session: 0. Pending close on #68 merge: `[DESIGN-SYSTEM-2026-04-24]`.
- Memory files added: 1 (`project_no_apple_developer_account.md`); MEMORY.md index updated.

---

## Amendment: PR #68 verification iteration (same evening)

After the initial commits landed and CI went green, ran a full visual iteration on PR #68 against the Vercel preview deployment using the Chrome MCP browser session. The original commits passed code-level checks but several design and behavior issues only surfaced when actually clicking through the UI with realistic data. Captured below for the next-session-pickup view of what changed and why.

### Pre-iteration unblocking

- **Vercel preview env vars.** Initial preview deploy 500'd because `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were scoped to Production only, and `NEXT_PUBLIC_*` is inlined at build time so a preview build had `undefined` baked into the middleware bundle. User added the vars to the Preview scope in the Vercel dashboard, redeployed `feat/wardrobe-craft` with cache cleared, preview came up.
- **Supabase migration 00011 pushed to production.** Selecting the new `is_signature` column failed the entire wardrobe query before the migration was deployed — the page rendered the error block path on every load. Pushed migration via `npx supabase db push --linked --include-all`. Same migration is in the PR; running again post-merge is a no-op.
- **Test data inserted.** User's account had 0 items, so 7 of 10 test plan checklist items were unverifiable. Inserted 10 realistic sample items (Toteme turtleneck, Auralee linen, Jil Sander trousers, Lemaire loafers, COS tee, The Row blazer, A.P.C. jeans, Margaret Howell field jacket, Begg & Co. scarf, Khaite dress) via Supabase Management API SQL — varied categories, seasons, brands, wear counts, prices, signatures, archive statuses. Spread `created_at` timestamps across past 6 months so default sort had real variation. Replaced initial Picsum placeholder photos (random non-clothing images) with real Unsplash fashion photos sourced via `WebFetch` of Unsplash search pages. User chose to keep all 10 as starter wardrobe data after testing.

### Issues found during iteration and shipped on the same branch

Each one is a separate commit on `feat/wardrobe-craft`:

- **Brand text on item-card was cool-green-tinted.** `text-text-dim` (oklch 0.642 0.055 120) clashed with the gold wear count below it on every card, reading as Italian-flag tension. Swapped to `text-foreground/55` (warm fade picking up foreground hue at half opacity). Black name → warm-fade brand → gold wear count flows cleanly.
- **Dashboard had zero gold while wardrobe was gold-rich.** The brief scoped wardrobe-only, but the gold rule is supposed to be systemic. Inconsistent application across surfaces undercuts the rule itself. Hand-applied `text-gold tabular-nums` to the StatCard value, the category sub-stats (`3 / 2 / 2 / 1`), and the Most Worn / Least Worn wear counts. Now: dashboard reads as a coherently gold-marked data surface alongside the wardrobe.
- **Gold rule documentation strengthened.** Codified the cross-surface universality and the data-vs-not-data checklist in PRODUCT.md, mirrored in `.github/copilot-instructions.md`, added a new "Design system rules" section to CLAUDE.md, and dropped pointers in `apps/web/app/globals.css` and `packages/ui/src/tokens.ts` so a future surface craft pass will encounter the rule no matter where they read first.
- **Random-reorder bug on signature toggle.** SQL `INSERT` of the 10 items used `now()` for every row, so all `created_at` timestamps were identical. Default sort `ORDER BY created_at DESC` returned them in arbitrary physical-row order. Each `revalidatePath` from a server action re-shuffled the grid, which read as the toggled item moving. Fix: append `.order('id', { ascending: true })` as a stable tiebreaker to every sort branch. Plus `useOptimistic` on the signature toggle so the gold flips instantly on click, eliminating the 300ms+ pending lag that drew the eye to the reshuffle. Also spread the test-data `created_at` timestamps so default sort has meaningful variation regardless.
- **Active/Archive segmented control button widths were unequal** because "Archive" is one character longer than "Active". Switched the parent from `flex` to `inline-grid grid-cols-2` so both buttons share the wider column width.
- **Compact density was indistinguishable from regular.** Original implementation only hid the brand line — same column count, same photo size, barely visible difference. Rebuilt: compact bumps to 3 / 4 / 6 / 7 / 8 columns across breakpoints (vs 2 / 3 / 4 / 5 for regular), tightens gap, shrinks card padding and text. Then per user feedback, brand and wear count collapse to one inline row beneath the name (brand left in warm fade, wear count right in gold) instead of brand line being hidden — preserves all signal, two metadata lines instead of three, gold rule still alive in dense view.
- **Search input rendered double clear button.** WebKit's native `input[type="search"]` cancel button rendered alongside the brand custom X. Suppressed the native pseudo-element globally in `globals.css` `@layer base`.
- **Masthead `8 pieces` two-color split.** Originally rendered as gold `8` + neutral `pieces`. User pushed back: "pieces" is the unit (same role as `×` in `24×` or `$` in `$3,815`), it should travel with the number. Rule refined: **the unit travels with the number — the whole data expression is one gold phrase, never split**. Applied to the masthead. Documented in PRODUCT.md / CLAUDE.md / copilot-instructions.md / globals.css / tokens.ts. Named exception: label + badge patterns (e.g., `Filters 2`) keep label neutral and badge gold because they're conceptually separate elements.
- **Sort/Filters control row too loud.** Both rendered their copy in `text-foreground` (near-black), competing with photos for visual attention. Per Principle 2 ("let the wardrobe be the hero"), chrome should recede. Switched to `text-foreground/55` (warm fade) at rest, popping to `text-foreground` on hover so click affordance stays discoverable. Filters open-state cue is now carried solely by `border-primary` (matcha), not by darkening the text.

### Process notes picked up

- **Realistic test data is a prerequisite for visual iteration.** Empty wardrobes hide design problems (only empty-state visible), Picsum placeholders ship random non-clothing images that make cards look broken, and a single mock item doesn't exercise sort/filter/search. The ~20 minutes spent on populating 10 varied items + sourcing real Unsplash fashion photos paid off across every iteration that followed; the 8 issues above were only visible because the wardrobe had real-feeling data behind it. Codified as feedback memory at [feedback_realistic_test_data_first.md](../../../.claude/projects/-Users-marcomartellini-Projects-Ropero/memory/feedback_realistic_test_data_first.md).
- **Live CSS overrides via Chrome MCP `javascript_tool`** let me preview a token change against the user's live preview without a Vercel rebuild round-trip. Used for the brand-text warm-fade iteration before committing. Cuts ~30-45s off each iteration for token-level changes that don't need a code change to verify.
- **Vercel preview gotcha**: redeploying the wrong branch is a real failure mode. Vercel's "Redeploy" button on production main isn't the same as redeploying the PR's preview deployment. With NEXT_PUBLIC_* env vars baked in at build time, redeploying the preview branch (with cache cleared) is the only way to pick up new env settings on a preview.
- **Gold rule's universality has teeth.** Treating "the wardrobe surface only" as the scope of this PR was too narrow — leaving the dashboard gold-empty meant the user landing first on the dashboard wouldn't see the rule at all, weakening the rule across both surfaces. Future surface-scoped PRs should hand-apply systemic rules to adjacent surfaces too, even if those surfaces aren't being redesigned.

### Memory updates from this iteration

- New feedback memory: `feedback_realistic_test_data_first.md` — populate realistic test data via SQL before iterating on any UI surface; SQL pattern + Unsplash sourcing recipe; ask user about cleanup at end.
- Existing `project_no_apple_developer_account.md` (from morning) confirmed correct and applied — never proposed paid Apple Developer enrollment during the iteration even though SDK 55 work briefly resurfaced as adjacent context.
- MEMORY.md index updated with the new feedback memory.

### Final final state (post-iteration)

- PR #68 has 13 commits as of this writing: 4 original (token migration, ExternalLink fix, is_signature migration, wardrobe craft) + 9 iteration (brand color, dashboard gold + docs, sort tiebreaker + optimistic toggle, segmented buttons, compact density bump, compact inline row, search clear button, masthead unit-travels-with-number + docs, chrome quiet, filters-button quiet-when-open).
- All 13 commits squash-merge into one commit on `main` per the project's squash-merge convention. PR description (already updated) becomes the squash-merge message.
- Migration 00011 is already on Supabase Cloud (pushed during iteration). Post-merge `npx supabase db push` is a no-op.
- Test data: user kept all 10 sample items as starter wardrobe data.
- KNOWN-ISSUES `[DESIGN-SYSTEM-2026-04-24]` ready to mark resolved on merge.
- User's verdict on the final wardrobe + dashboard: ready to merge.
