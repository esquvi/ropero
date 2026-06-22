# 2026-06-22 (continued): Rediscovery surface, ideate to ship (PR #74)

Second half of the 2026-06-22 session (the first half shipped real test infrastructure via `/lfg`, PR #73; see `2026-06-22-real-test-infrastructure.md`). The user asked "what else makes sense to work on next in terms of features," and we ran the full compound-engineering chain end to end: `/ce-ideate` -> `/ce-brainstorm` -> `/ce-plan` -> `/ce-work`, shipping the rediscovery surface as **PR #74**, squash-merged to `main` as `d4491a3`.

## Shipped

A season-aware way to resurface forgotten pieces, web-first, on existing screens, strictly mirror-not-coach.

- **`@ropero/core/rediscovery`** (`packages/core/src/rediscovery/dormancy.ts`, pure, test-first, 24 unit tests): `currentSeason` (calendar, northern hemisphere), `isInSeason` (empty array = always in-season), `sortByDormancy` (in-season forgotten first, never-worn most-dormant, oldest-last-worn, stable id tiebreaker, `outOfSeason` tag), `selectBackInSeason` (in-season and not worn since the season window began; winter's window spans the Dec-Feb year boundary; deterministic), `dormancyLabel` / `lastWornSince` (timezone-safe, date-portion parse).
- **Wardrobe dormancy lens:** a "Least recently worn" sort that orders the grid season-aware (resting out-of-season pieces quieted at `opacity-45`). Each card states its last-worn fact ("not worn since October" with the date in gold, "not worn yet" muted) in place of the wear count. Tap-to-detail untouched; no in-place actions. The query now selects `season`; ordering is post-fetch like cost-per-wear.
- **Dashboard "back in season" module:** up to 3 in-season pieces not reached for this season, each linking to detail with its fact in gold, omitting itself when there's nothing to resurface.

## The chain (artifacts, all on `main`)

- Ideation: `docs/ideation/2026-06-22-next-features.md` - 7 ranked directions (one headline per persona + two cross-cutting foundations), adversarially filtered against the intention-over-engagement identity. The re-discovery surface (idea #3) was selected.
- Requirements: `docs/brainstorms/2026-06-22-rediscovery-surface-requirements.md` - the WHAT (A/F/R/AE, the shape and voice decisions).
- Plan: `docs/plans/2026-06-22-002-feat-rediscovery-surface-plan.md` - the HOW (4 units, 8 KTDs resolving the brainstorm's 7 open questions).

## Decisions worth remembering

- **Two surfaces on existing screens, not a dedicated tab.** Browse (wardrobe lens) and serendipity (dashboard module) are different jobs; housing them in existing surfaces reuses the crafted grid + dashboard, avoids a 6th nav destination (restraint), and dodges the "prominent empty tab" failure mode for an app with little wear data yet. The dedicated surface is deferred, earned with usage evidence.
- **Season-aware dormancy, no hard threshold.** Raw time-since-worn would surface out-of-season resters as "forgotten" and erode trust. A threshold forces a binary verdict the app must assert; a sort + a concrete date asserts nothing and stays a mirror. The key design line: "no threshold, state the date" is what keeps it a mirror, not a coach.
- **Reflective, not transactional.** The mirror/coach line is about who *initiates*, not whether action is possible. Action routes through the existing detail page; no in-place CTAs (consistent with the deliberately-deferred card quick-actions, KNOWN-ISSUES `[SHAPE-WARDROBE-2026-04-29]`).
- **The review caught a data-shape bug tests couldn't.** `items.last_worn_at` is a `timestamptz` (PostgREST serializes it as a full ISO string), not the bare `YYYY-MM-DD` the code assumed. It worked only by luck of Supabase's UTC-default session. Fixed by normalizing to the date portion (`slice(0,10)`) at every parse/compare, with tests against the real full-timestamp shape. Lesson: test fixtures should mirror production serialization, and review should read the migration, not just the code.

## Known issues opened/closed

### Opened
- Logged a related pre-existing date-render bug in KNOWN-ISSUES (under the `[QA-2026-04-18]` formatDate entry): `apps/web/components/wardrobe/item-detail.tsx` renders `last_worn_at` via `new Date(value).toLocaleDateString()`, the same UTC off-by-one; the new `dormancyLabel`/`lastWornSince` solved it correctly and the detail page should adopt the date-only treatment.

### Closed - none.

## Next session starting points

- **Visually verify the rediscovery surface** on production / a fresh deploy: switch the wardrobe sort to "Least recently worn" (check the gold date facts and the quieted out-of-season pieces), and confirm the dashboard "back in season" module. CI proved it builds and renders; no one has eyeballed the treatment yet. The user's starter wardrobe (10 seeded pieces with varied seasons + wear dates) should exercise it.
- **The remaining ideation directions** (`docs/ideation/2026-06-22-next-features.md`) are a ready-made roadmap, one per persona: wear-capture fidelity (#1, the highest-leverage foundation), the planning surface / Sunday week board (#4), Year-in-Wardrobe reflection (#2), piece provenance + the ghost shelf (#5), capsules as first-class objects (#6), and lowering the cataloging cold-start (#7). The suggested sequence was capture -> rediscover (now done) -> plan.
- **Deferred follow-ups for rediscovery itself:** weather/location-aware current season (calendar ships first; northern-hemisphere assumption documented), mobile parity, a dedicated surface + in-place actions (earn with evidence), and fixing the item-detail date bug.

## Process notes

- The user drives the compound-engineering chain hands-on, approving each decision conversationally and preferring a recommendation-with-reasoning over a bare option menu (they redirected several `AskUserQuestion` menus toward "give me your recommendation, detailing tradeoffs"). They authorized merges explicitly per-PR.
- Verification-before-done held: the user was offered the Vercel-preview visual check before merging and chose to proceed; the visual eyeball remains the one open verification, noted above.

## Final state

- `main` at `d4491a3` (PR #74 squash-merged). Working tree clean except this doc-only session close.
- Local branches: `main`, `chore/expo-sdk-55` (unchanged, still held). No `[gone]` entries.
- No migrations this PR; no `supabase db push` needed.
- Tests: `@ropero/core` 167 (24 new), `@ropero/supabase` 29; typecheck 8/8; web lint 0 errors.
- Open PRs: the SDK 55 hold (#67) and the Dependabot set remain from before.
