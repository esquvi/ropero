# 2026-04-24 (afternoon): Repo hygiene sweep — uncommitted cleanup, stale branches, per-file triage

User asked for a general hygiene pass: "how do you think the folder structure currently is... is there anything missing, anything we should change, anything we should change with our processes?" Did a full survey of on-disk state, git state, and config. Root repo was in decent shape but had accumulated drift: three files modified on `main` and four untracked paths sitting for weeks, five `[gone]` feature branches from already-merged PRs, and a structural smell in the root `tsconfig.json`.

## Shipped

- **`6265c32` (direct to main)** Track pending docs and Claude launch config. Committed `docs/plans/2026-02-28-profile-page-{design,plan}.md`, 25 `docs/brand/*.html` design explorations awaiting co-founder review, and `.claude/launch.json` (peer to the already-tracked `.claude/settings.json`). Also reverted a bad `extends: "expo/tsconfig.base"` the root `tsconfig.json` had picked up (clean revert — matches HEAD).
- **PR #40** Declare non-exempt encryption for iOS App Store. One-line `ITSAppUsesNonExemptEncryption: false` in `apps/mobile/app.json` ios.infoPlist so TestFlight uploads skip the export compliance prompt every build.
- **PR #41** Add palette preview route for brand review. Preserves the 4-palette, 6-font, dark/light design exploration at `/palette-preview`. Scoped `--pp-` CSS variables so nothing in the app can accidentally depend on it. `robots: noindex, nofollow` set via a minimal `layout.tsx`. Middleware matcher updated to exclude the route from auth so co-founder can review on a live URL without signup.
- **Deleted 5 `[gone]` branches** (`feature/gorhom-bottom-sheet`, `fix/home-greeting-uses-display-name`, `fix/log-wear-keyboard-covers-notes`, `fix/log-wear-sheet-footer-floating`, `fix/wardrobe-filter-chip-layout`) via the `commit-commands:clean_gone` skill. All traced back to merged PRs #31–#35.

## Decisions worth remembering

- **Per-file triage is the right shape for hygiene cleanup.** Walked the user through each uncommitted/untracked path one at a time with a rationale (commit / ignore / revert / delete) before acting. Avoided a "just commit everything" dump which would have canonized the bad root-tsconfig change and the in-progress palette-preview as if they were considered decisions.
- **Palette preview is preserved but not canonized.** User explicitly said "I don't want to start building against it, but I don't want to lose that work either." Two mechanisms enforce this: (a) CSS variables use a `--pp-` prefix so `globals.css` and other styles can't depend on them, and (b) `robots: noindex, nofollow` keeps the page off search indices. No app code imports from this route; when a palette is chosen, the values move into `globals.css` and the route can be deleted.
- **Fixed the global git identity before the first commit.** Pre-existing `marcomartellini@Marcos-MacBook-Air.local` default would have shown as an unlinked author on GitHub. User ran `git config --global user.{name,email}` once, soft-reset the already-made commit, and recommitted cleanly with the `Co-Authored-By: Claude` trailer. Unpushed at that point, so no history rewrite.
- **Flagged the `main` branch protection soft-bypass.** `git push origin main` for the doc-only commit warned `Bypassed rule violations: Changes must be made through a pull request, Required status check "check" is expected`. The rule is advisory today because user has admin. Worth tightening or carving a doc-only path later.

## Known issues opened (tagged `[HYGIENE-2026-04-24]`)

- **`ExternalLink.tsx` fails local typecheck against expo-router typed routes.** `props.href: string` is rejected by the strict `Href` union that expo-router generates into `apps/mobile/.expo/types/router.d.ts`. CI is green because `.expo/` is gitignored and fresh clones get a looser fallback. One-line cast fix.
- **Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`.** Dev-server logs the deprecation on every start. Still works today; needs to be renamed before Next.js 17.

## Next session starting points

1. **Merge and deploy PRs #40 and #41** (both were opened at end of this session, CI should have run by next session).
2. **Rename `middleware.ts` → `proxy.ts`** for Next.js 16 compliance. Small mechanical change; see the new `[HYGIENE-2026-04-24]` entry in `KNOWN-ISSUES.md`.
3. **Decide on `main` branch protection.** Either tighten it (no admin bypass, always via PR) or explicitly carve out a doc-only path so direct-to-main for docs does not show as a "bypass" every time.
4. **Add `.github/pull_request_template.md` and `.github/dependabot.yml`.** Flagged during the initial hygiene survey as low-effort wins.
5. **Add a root `README.md`.** Only `apps/web/README.md` exists today; there is no top-level onboarding doc for the repo.
6. **Consider splitting SESSION-LOG.md.** At ~200 lines and growing, a `docs/sessions/YYYY-MM-DD.md` per-session convention keeps blame useful; the root file can become an index.

## Process notes and user preferences picked up

- **User reads recommendations with intent to redirect, not rubber-stamp.** When presenting option (a/b/c), framing each with tradeoffs and a recommended default works well. User picked (a) on palette-preview after the framing even though (b) "just delete it" was cheapest.
- **Explicit confirmation before destructive git actions is expected** even when the user has already greenlit the broader plan. Branch deletion got a fresh confirm even though step 5 was in the initial pass.
- **Per-file walkthrough is the preferred shape for hygiene work.** User said "sure lets do it" to the per-file decision format rather than a bulk-commit proposal.
