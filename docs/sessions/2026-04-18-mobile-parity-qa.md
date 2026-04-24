# 2026-04-18: mobile parity + device smoke test sprint + QA sweep

## Shipped (25 PRs, #7 through #31, plus two doc-only commits to main)

**Mobile feature parity** with web for all core object types:
- Wear logging enhancements: date presets, occasion chips, notes (#7).
- Profile page with name edit and invite section (#8).
- Outfit builder (#10) and outfit detail screen (#17) and outfit edit via `?editId=` query param on the builder (#18).
- Wear a whole outfit via home-row "Wear" pill, inserts one `wear_logs` row per item with shared `outfit_id` (#13).
- Activity feed grouping: wear_logs sharing outfit_id + worn_at collapse into one entry (#14).

**Web catch-up**:
- `/outfits/[id]` detail page (#19). Was 404'ing because `OutfitCard` linked there but the route did not exist.
- Wear-outfit action on outfit cards (#15).
- Dashboard activity feed grouping mirror of mobile #14 (#20).

**Infrastructure**:
- Mobile `typecheck` wired into CI via turbo (#11); fixed the 5 pre-existing TS errors at the root cause (`useColorScheme` return type).
- Lint is now blocking in CI (#12). Also fixed a real bug: `apps/web`'s `lint` script was calling the removed `next lint`; switched to `eslint .`. Three packages had `lint` scripts with no ESLint config (silently exit-0'ing); script removed rather than configuring.
- Conventions refresh: relaxed "PR for every change" rule to exempt doc-only edits; added PR-title convention; no em-dashes rule (#9).
- EAS Update setup for mobile OTA (#21). After one fresh `eas build --profile preview`, future JS changes ship via `eas update --branch preview`.
- `@gorhom/bottom-sheet` adopted as the mobile bottom-sheet library (#24). `GestureHandlerRootView` + `BottomSheetModalProvider` now wired at app root; reusable for future sheets.
- `KNOWN-ISSUES.md` created as a running tracker for deferred bugs.
- `.gitignore` covers `.claude/worktrees/` and `.claude/settings.local.json` (#16).

**Device-test-surfaced fixes (merged this session)**:
- Wardrobe filter chips stretching vertically (#22, horizontal FlatList flex quirk).
- Home greeting reading `user.user_metadata.name` with session refresh after profile save (#25).
- Outfit builder canvas clip + notes keyboard scroll (#26).
- Log-wear sheet footer floating via `BottomSheetFooter` so cancel/submit stay visible (#27).
- Outfit detail hero shrunk from 1:1 to 3:2; items grid width dropped from 31.5% to 31% to actually fit 3 per row (#28).

## Decisions worth remembering

- **No clean fix today for "bottom sheet + iOS keyboard + multiline input."** Tried stock RN (`KeyboardAvoidingView` + `automaticallyAdjustKeyboardInsets`), tried dropping KAV, tried gorhom with `interactive` and `extend` keyboard behaviors on fixed snap points. Best achievable state right now is the gorhom version which over-lifts the sheet (focused field visible but surrounding context scrolls off). Tracked in KNOWN-ISSUES.md. Likely real fix involves `react-native-true-sheet` or `react-native-keyboard-controller` per-frame hooks for custom offset math.
- **Design tokens pass still deferred.** Attempted earlier this session but paused because we lacked brand direction from the user. Worth picking up when product design gets a dedicated pass.
- **Parallel subagent worktrees proved valuable.** Two agents in parallel + one manual workstream shipped three non-conflicting PRs (#18, #19, #20) in roughly the time of one. Pattern: scope by file (different apps, or different files within an app), use `isolation: "worktree"` on the Agent tool, always review the diff before opening the PR.
- **Smoke-testing on device is non-optional.** Several pre-existing bugs only manifested when the app was actually on a phone with data. Wardrobe filter chip bug had been there since the feature shipped. Home-row greeting using email prefix instead of display name was present since profile metadata was introduced. Future sessions: schedule a device smoke test at least every few mobile PRs, do not let a backlog of unverified mobile work accumulate.

## QA sweep addendum (end of session)

Before wrapping, ran a comprehensive QA subagent across everything shipped in the last two sessions. Three findings landed as their own PRs (#29, #30, #31); the other ~25 non-critical findings were logged in `KNOWN-ISSUES.md` tagged `[QA-2026-04-18]`. Highlights worth remembering beyond what's in that file:

- **`redeem_invite_code` had an identity spoof (#30).** The SECURITY DEFINER function accepted a caller-supplied `redeemer_id` uuid and wrote it into `invite_redemptions.redeemed_by`. Any authenticated user could pollute another user's redemption history by passing their uuid. Fix: new migration drops the param and reads `auth.uid()` internally.
- **`invite_codes` table had a world-readable SELECT policy (#31).** Because Postgres RLS policies OR together, a `USING (true)` policy next to an owner-scoped one meant any authenticated user could enumerate every invite code. Fix: drop the permissive policy, add `validate_invite_code(p_code)` RPC granted to anon + authenticated that exposes only yes/no/remaining.
- **Dashboard had a dead `Log Wear` link pointing at `/wear-log` (#29).** Never existed. Removed; logging wear is a contextual action from item/outfit surfaces.
- Both #30 and #31 require `npx supabase db push` against the cloud project after merge. User ran this at session end.

## Known issues open (see KNOWN-ISSUES.md)

- iOS keyboard over-lifts the log wear sheet when focusing the notes field. Cosmetic.
- ~25 non-critical findings from the QA sweep, grouped by surface (mobile bugs, web bugs, tech debt, UX, security, testing, infra) and tagged `[QA-2026-04-18]`. Highlights worth a direct call-out next time:
  - **OCCASIONS forked across 3 files** with different values; web `outfit-builder.tsx` uses `interview`/`workout` that the Zod schema in core will reject if ever validated server-side.
  - **Zod major version skew** between `packages/core` (v3) and `apps/web` (v4) will break shared schemas.
  - **Nested `TouchableOpacity` on home outfit row** fires both taps (Wear pill + row navigation).
  - **Mobile errors silently swallowed** across several fetchers; look like "not found" to the user.
  - **Outfit edit save is not transactional**; partial failure leaves outfit with zero items.
  - **Zero mobile tests, zero real E2E coverage.**

## Next session starting points

Concrete, pick one:

1. **Finish smoke-testing** remaining checklist items (outfit edit end-to-end, wear-outfit activity grouping verification, outfit delete confirmation, anything else the user spots).
2. **Regenerate Supabase DB types.** Would kill the `as ReturnType<typeof supabase.from>` and `as unknown as Foo` casts scattered across invite and outfit-items queries. Requires running `supabase gen types typescript` against the live schema. User may have creds; worth asking.
3. **Web outfit edit** (mirror of mobile #18). Extend the web builder to accept an `editId` query param, prefill state, update on save.
4. **Outfit wear history on detail pages** (mobile and web). Data exists (`wear_logs.outfit_id`); just needs a "worn N times, last on X" section on the detail screens.
5. **Design tokens pass** (revisit if user has brand direction).
6. **E2E test coverage** for invite / wear / profile flows. Would need a real authenticated fixture; the existing `apps/web/e2e/wardrobe.spec.ts` is a no-op placeholder.

## User preferences and conventions picked up this session

- PR descriptions should be thorough (state summary, what changed, why, what's explicitly not included, test plan, reviewer notes). User reads them.
- No em-dashes anywhere prose lives (PRs, commits, CLAUDE.md). Hard rule.
- Ropero is single-developer; overly strict process is overhead. Doc-only changes go direct to main.
- Apple Developer Program is deferred; mobile testing runs through Expo Go via `npx expo start` from `apps/mobile/` until further notice.
- User is on a Mac (`~/Projects/Ropero`) with an iPhone for testing; no Android smoke path established.
- EAS Update channel `preview` is live for this project; a `development` and `production` channel also exist per `eas.json`.
