# Known Issues

Living doc for bugs and rough edges we know about but have not fixed yet. Use a GitHub issue for anything you plan to work on soon; this file is for longer-lived "we know, just not yet" items that don't need per-item tracking overhead.

Entries logged during the 2026-04-18 QA sweep (see `SESSION-LOG.md`) are marked with **[QA-2026-04-18]**. Three critical findings from that sweep were fixed in PRs #29, #30, #31 and are not listed here.

## Mobile

### iOS keyboard over-lifts the log wear sheet on notes focus

**Severity:** cosmetic. The notes field is usable; surrounding context gets pushed off screen.

**Surface:** `apps/mobile/components/log-wear-sheet.tsx`, iOS only.

**What happens:** when the user taps into the Notes input in the log wear sheet, the iOS keyboard rises and the sheet rises with it, overshooting so that the fields above the notes input (date presets, occasion chips, date label) scroll out of view. The user can type fine but loses context about what they are editing.

**What we tried (none landed clean):**
- Stock RN `KeyboardAvoidingView` with `automaticallyAdjustKeyboardInsets` on the inner `ScrollView`. Functional, but the sheet lifted far higher than needed.
- Dropping the `KeyboardAvoidingView` and relying on `automaticallyAdjustKeyboardInsets` alone. Regressed to the original bug: keyboard covers the notes input.
- Replacing the hand-rolled sheet with `@gorhom/bottom-sheet` using `enableDynamicSizing` + `keyboardBehavior="interactive"`. Sheet barely moved with the keyboard.
- Switching gorhom to fixed snap points (65% / 92%) + `keyboardBehavior="extend"`. No meaningful improvement on device.

**Likely fix direction:** physical-device tuning of gorhom snap points against real viewport heights; or switching to `react-native-true-sheet` (exposes finer keyboard-offset control); or writing custom keyboard-offset math with `react-native-keyboard-controller` per-frame hooks.

Deferred until a polish pass on the mobile UX layer.

### Nested TouchableOpacity on home outfit row fires both taps [QA-2026-04-18]

**Severity:** important. Real functional bug: tapping the Wear pill also navigates to the outfit detail screen.

**Surface:** `apps/mobile/app/(tabs)/index.tsx:306-325`.

**What happens:** the saved-outfit row is a `TouchableOpacity` that navigates to `/outfits/[id]`, and inside it the "Wear" pill is another `TouchableOpacity`. React Native does not prevent the outer touchable from firing when an inner one handles the press. `hitSlop` on the inner button does not help. Users see the Wear sheet open briefly, then the app navigates to the outfit detail.

**Fix direction:** make the row a `View` plus an explicit invisible `Pressable` on the non-button area, or flatten the layout so the pill sits outside the tappable row. Alternatively intercept the event on the inner pill with `onPressIn` + state.

### Errors silently swallowed across mobile data fetchers [QA-2026-04-18]

**Severity:** important. Failures look identical to "not found" in the UI.

**Surfaces:**
- `apps/mobile/app/(tabs)/index.tsx:118-149` (`fetchData`): five parallel `.select` calls, no error check on any.
- `apps/mobile/app/outfits/[id].tsx:44-92` (`fetchOutfit`): destructures `data` only, never reads `error`.
- `apps/mobile/app/wardrobe/[id].tsx:56-73`: same pattern.
- `apps/mobile/app/(tabs)/add.tsx:58-68`: upload error is checked but the code still inserts the item with an empty `photo_urls`, so the user gets a success toast with no photo.

**Fix direction:** destructure `error` everywhere, surface it inline (small banner component), and for the add-item case abort the insert on upload failure instead of silently dropping the photo.

### `formatDate` has a timezone off-by-one for negative UTC offsets [QA-2026-04-18]

**Severity:** minor. Can show "Yesterday" when the user expects "Today", or similar.

**Surfaces:**
- `apps/mobile/app/(tabs)/index.tsx` `formatDate` helper.
- `apps/web/components/dashboard/recent-activity.tsx` same shape.

**What happens:** parses a bare ISO date `YYYY-MM-DD` with `new Date(str)`, which JS interprets as UTC midnight. In US timezones that's "yesterday local," so `diffDays` is off by one.

**Fix direction:** append `T00:00:00` as `log-wear-sheet.tsx:44` already does, or normalize to date-only string comparison.

### Outfit edit save is not transactional; partial failure leaves an empty outfit [QA-2026-04-18]

**Severity:** important. Users may see their outfit "disappear" its items.

**Surface:** `apps/mobile/app/outfits/new.tsx:148-231`.

**What happens:** the edit save path is three sequential Supabase calls: `update outfits`, `delete outfit_items`, `insert outfit_items`. If the last insert fails (network drop, RLS surprise), the outfit is left with zero items and the code still navigates to detail via `router.replace`. The "Partial success" alert fires but the next screen shows an empty outfit.

**Fix direction:** wrap the three operations in a Postgres RPC so it's atomic. Minimum stopgap: do not navigate on partial failure; keep the user on the form so they can retry with state intact.

### Nested accessibility labels missing across mobile [QA-2026-04-18]

**Severity:** important for accessibility.

**Surface:** ~120 `TouchableOpacity` uses across the mobile app have no `accessibilityLabel`. Icon-only buttons (back arrows, close X, remove badges, edit pencil, wear pill, etc.) are unreadable to VoiceOver.

**Fix direction:** audit pass adding `accessibilityLabel` and `accessibilityRole="button"` to every icon-only `TouchableOpacity`. Establish a convention that all icon buttons get labels going forward.

### Touch targets under 44pt [QA-2026-04-18]

**Severity:** minor to important depending on surface.

**Examples:**
- `apps/mobile/app/outfits/new.tsx:275-281` remove badge is 22x22.
- `apps/mobile/app/outfits/[id].tsx:388-393` `iconButton` is 32x32.

**Fix direction:** set `hitSlop` to push the effective hit area to at least 44pt, or resize the visual target.

### Expo template leftover files [QA-2026-04-18]

**Severity:** cosmetic dead code.

**Surface:** `apps/mobile/components/EditScreenInfo.tsx`, `StyledText.tsx`, `useClientOnlyValue.ts`, `useClientOnlyValue.web.ts`. Unreferenced.

**Fix direction:** delete. Low-risk cleanup.

### `ExternalLink.tsx` fails local typecheck against expo-router typed routes [HYGIENE-2026-04-24]

**Severity:** minor. Local-only; CI is green.

**Surface:** `apps/mobile/components/ExternalLink.tsx:13`.

**What happens:** the component passes `props.href` (typed `string`) to `<Link href=...>` from expo-router. With the locally-generated `apps/mobile/.expo/types/router.d.ts` in place, expo-router's `Href` type is a strict union of known routes, so `string` is rejected. CI passes because `.expo/` is gitignored and the file is regenerated from scratch (with a looser fallback) on each fresh clone. Fresh clones (new laptops, first-time contributors) will also not hit this.

**Fix direction:** cast the prop at the boundary: `href={props.href as Href}` (import `Href` from `expo-router`), or use `href={props.href as any}` if the strictness is not worth the friction.

## Web

### Recent activity `formatDate` has the same timezone bug [QA-2026-04-18]

See the mobile entry above; same file-level shape in `apps/web/components/dashboard/recent-activity.tsx`.

### `sb as any` on the dashboard instead of typed casts [QA-2026-04-18]

**Severity:** tech debt.

**Surface:** `apps/web/app/(app)/dashboard/page.tsx:13-14` casts `supabase as any` to save writing per-query casts, unlike the `ReturnType<typeof supabase.from>` pattern the rest of the codebase uses after PR #12.

**Fix direction:** convert to per-query typed casts, or wait for the Supabase types regeneration (see below) which eliminates the need for both.

## Tech debt and consistency

### Zod major version skew across workspaces [QA-2026-04-18]

**Severity:** important. Any shared schema imported from core into web will hit v3 to v4 API breaks.

**Surface:** `packages/core` pins `zod ^3`, `apps/web` uses `zod ^4.3`.

**Fix direction:** pin one major at the repo root. Likely safest is to move to v4 everywhere now while the schema surface is small.

### React version skew [QA-2026-04-18]

**Severity:** minor today, blocker later.

**Surface:** `apps/mobile` uses `react@19.1.0`, `apps/web` uses `react@19.2.3`.

**Fix direction:** harmless while `packages/ui` only exposes tokens. The day any package ships React code for both apps, align them.

### Supabase DB types not regenerated [QA-2026-04-18]

**Severity:** important. Source of ~37 `as ReturnType<typeof supabase.from>` casts and ~28 `as unknown as T` casts across 14+ files.

**Surface:** `packages/supabase/src/database.types.ts` predates the invite system and several outfit joins. `invite_codes`, `invite_redemptions`, `generate_invite_code`, `redeem_invite_code`, and `validate_invite_code` (from PR #31) are all missing.

**Fix direction:** run `npm run generate-types --workspace=@ropero/supabase` against the live schema after the three critical PRs deploy. Requires `npx supabase db push` first. Remove the casts in a follow-up pass.

### Duplicated flatten logic for `outfit_items(items(...))` joins [QA-2026-04-18]

**Severity:** tech debt.

**Surfaces:**
- `apps/mobile/app/outfits/new.tsx`
- `apps/mobile/app/outfits/[id].tsx`
- `apps/web/app/(app)/outfits/[id]/page.tsx:65-67`

Near-identical type casts and nullable filtering repeated three times.

**Fix direction:** lift a shared helper (`flattenOutfitItems`) into `@ropero/supabase` or `@ropero/core`.

### Duplicated wear-log insert logic [QA-2026-04-18]

**Severity:** tech debt.

**Surfaces:**
- `apps/mobile/app/outfits/[id].tsx:115`
- `apps/mobile/app/(tabs)/index.tsx:190`
- `apps/mobile/app/wardrobe/[id].tsx:90`
- `apps/web/components/wear/actions.ts:83`

Same shape (user_id, item_id, optional outfit_id, worn_at, occasion, notes).

**Fix direction:** extract into a helper; consider a `wear` RPC if atomicity across multiple wear_logs is ever wanted.

### Duplicated `groupWearLogs` on web and mobile [QA-2026-04-18]

**Severity:** tech debt.

**Surfaces:**
- `apps/mobile/app/(tabs)/index.tsx:64-103`
- `apps/web/components/dashboard/recent-activity.tsx:39-82`

**Fix direction:** lift into `@ropero/core`. Also a good opportunity to add unit tests (neither copy is tested).

### Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts` [HYGIENE-2026-04-24]

**Severity:** tech debt. Next.js 16 logs a deprecation warning on every dev-server start: `The "middleware" file convention is deprecated. Please use "proxy" instead.` Still functional today; will be removed in a future major.

**Surface:** `apps/web/middleware.ts`.

**Fix direction:** rename `middleware.ts` to `proxy.ts` and update any documentation references. Logic stays the same. Do this before upgrading to Next.js 17.

## UX and copy

### Copy inconsistencies on the wear action [QA-2026-04-18]

**Severity:** minor.

**Surfaces:** "Log Wear" on the item detail, "Wear Outfit" on the outfit detail, "Wear" on home-row pills, "Log Outfit Wear" on the web popover submit button.

**Fix direction:** pick one label per surface type and standardize.

### Error feedback inconsistent [QA-2026-04-18]

**Severity:** minor.

**Surface:** mobile uses `Alert.alert` almost everywhere. Web uses inline `setError` in some places and silent `console.error` in others (log-wear-button before PR #24 was guilty).

**Fix direction:** toast component for both, or at minimum one convention per platform.

### Loading states missing on fast cold-loads [QA-2026-04-18]

**Severity:** minor.

**Surface:** mobile home greeting renders "Hey" on the first tick before `user` hydrates. Web outfit detail page has no Suspense fallback.

**Fix direction:** add a minimal loading placeholder where it matters.

## Security (non-critical)

### Storage bucket `item-photos` is public [QA-2026-04-18]

**Severity:** depends on product intent.

**Surface:** `supabase/migrations/00005_create_storage.sql:3`.

**What it means:** anyone with a photo URL can view any user's item photos. Acceptable if photos are not sensitive (and the URLs are hard to guess), risky otherwise.

**Fix direction:** switch the bucket to private and generate signed URLs for reads, or confirm the public model is intentional for this product.

### Auth callback fires and forgets the redeem RPC [QA-2026-04-18]

**Severity:** minor data integrity.

**Surface:** `apps/web/app/auth/callback/route.ts`. If `redeem_invite_code` fails, the user is signed in but their invite is not recorded. No retry, no log.

**Fix direction:** surface the error (log server-side at minimum), consider a light retry.

## Testing

### E2E tests are cosmetic [QA-2026-04-18]

**Severity:** important.

**Surface:** `apps/web/e2e/wardrobe.spec.ts`, `outfit.spec.ts`, `trip.spec.ts`. Each asserts "either login or the page loaded"; the wardrobe one contains `expect(true).toBe(true)` as of the cleanup in PR #12. None cover the 22 features shipped in the 2026-04-18 session (outfit detail, wear-outfit, delete, dashboard activity, etc.).

**Fix direction:** build a real auth fixture (seed a test user, sign in programmatically) and write end-to-end tests against the actual flows. Prioritize invite signup, wear logging, and outfit create/edit/delete.

### Mobile has zero automated tests [QA-2026-04-18]

**Severity:** important as mobile grows.

**Surface:** `apps/mobile/package.json` has no `test` script. No component or integration coverage.

**Fix direction:** Jest + React Native Testing Library for component tests; a detox or Maestro flow for smoke. Low priority until the mobile surface stabilizes, but important to start before it grows further.

### `packages/core` has gaps in validation coverage [QA-2026-04-18]

**Severity:** minor. Would have caught the OCCASIONS drift.

**Surfaces:** `validation/outfit` (OCCASIONS, tag limits), `validation/trip`, `validation/wear-log` have no tests. Item, scoring, packing, weather do.

**Fix direction:** add one test file per missing validator.

### `groupWearLogs` is untested [QA-2026-04-18]

**Severity:** minor but easy.

**Surface:** the copy-pasted helper is the most complex pure function in the recent batch.

**Fix direction:** lift to core (see Tech debt) and add unit tests for the grouping invariants (cap behavior, incrementing existing groups after cap, outfit-less rows pass through, etc.).

### RLS integration tests miss invite system [QA-2026-04-18]

**Severity:** important given we just shipped two RLS fixes (#30, #31).

**Surface:** `packages/supabase/src/__tests__/rls.test.ts` has no coverage of `invite_codes` policies or `redeem_invite_code` / `validate_invite_code`.

**Fix direction:** add tests specifically for cross-user enumeration (must fail), unauthenticated redemption (must fail), and signup validation through the new RPC.

## Infra

### CI lint and test only cover web and two packages [QA-2026-04-18]

**Severity:** informational.

**Surface:** CLAUDE.md already notes lint is `apps/web` only. `test` similarly fans out only to workspaces with a `test` script (`packages/core`, `packages/supabase`). Mobile is typechecked but not linted or tested. Web has Playwright but no `test` script; Playwright runs in its own CI job.

**Fix direction:** add ESLint config and `test` scripts to the three unreferenced workspaces when ready to enforce.

### Root `postinstall` symlinks expo-router from mobile into root [QA-2026-04-18]

**Severity:** minor, fragility.

**Surface:** `package.json:15`. Breaks if mobile is removed or renamed.

**Fix direction:** either promote expo-router to a root devDep, or document the hack in CLAUDE.md. Not urgent.
