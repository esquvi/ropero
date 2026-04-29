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
