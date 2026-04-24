# 2026-04-24 (afternoon): Repo hygiene sweep — uncommitted cleanup, stale branches, per-file triage, full follow-up pass

User asked for a general hygiene pass: "how do you think the folder structure currently is... is there anything missing, anything we should change, anything we should change with our processes?" Did a full survey of on-disk state, git state, and config. Root repo was in decent shape but had accumulated drift: three files modified on `main` and four untracked paths sitting for weeks, five `[gone]` feature branches from already-merged PRs, and a structural smell in the root `tsconfig.json`. After the first-round cleanup, user said "let's keep going, let's do all of these" on the remaining punch list, so everything previously flagged as "next session" got done in this same session.

## Shipped

### First round: uncommitted cleanup and per-file triage

- **`6265c32` (direct to main)** Track pending docs and Claude launch config. Committed `docs/plans/2026-02-28-profile-page-{design,plan}.md`, 25 `docs/brand/*.html` design explorations awaiting co-founder review, and `.claude/launch.json` (peer to the already-tracked `.claude/settings.json`). Also reverted a bad `extends: "expo/tsconfig.base"` the root `tsconfig.json` had picked up (clean revert, matched HEAD).
- **PR #40** Declare non-exempt encryption for iOS App Store. One-line `ITSAppUsesNonExemptEncryption: false` in `apps/mobile/app.json` ios.infoPlist so TestFlight uploads skip the export compliance prompt every build.
- **PR #41** Add palette preview route for brand review. Preserves the 4-palette, 6-font, dark/light design exploration at `/palette-preview`. Scoped `--pp-` CSS variables so nothing in the app can accidentally depend on it. `robots: noindex, nofollow` set via a minimal `layout.tsx`. Middleware matcher updated to exclude the route from auth so co-founder can review on a live URL without signup.
- **Deleted 5 `[gone]` branches** (`feature/gorhom-bottom-sheet`, `fix/home-greeting-uses-display-name`, `fix/log-wear-keyboard-covers-notes`, `fix/log-wear-sheet-footer-floating`, `fix/wardrobe-filter-chip-layout`) via the `commit-commands:clean_gone` skill. All traced back to merged PRs #31–#35.

### Second round: "let's do all of these" follow-up

- **`2710845` (direct to main)** Log the first-round session + two new `[HYGIENE-2026-04-24]` KNOWN-ISSUES entries (ExternalLink.tsx typed-routes local typecheck, middleware.ts → proxy.ts Next.js 16 deprecation).
- **`59b6def` (direct to main)** Hygiene docs batch: new root `README.md`, `.github/pull_request_template.md`, `SESSION-LOG.md` split into `docs/sessions/YYYY-MM-DD-slug.md` (root becomes a thin index), deleted `docs/IMPLEMENTATION-SUMMARY.md` (Feb 27 kickoff, stale), moved `docs/SESSION-LOG-2026-02-27.md` into `docs/sessions/` via `git mv` so history is preserved. CLAUDE.md updated with a new "Branch protection on `main`" subsection documenting the `enforce_admins=false` bypass as convention (not accident), plus a stale "Next.js 15" fixed to "Next.js 16".
- **PR #42** Add dependabot config for npm and GitHub Actions. Three update streams: `/` (root workspace, covers apps/web + packages/* via npm workspaces), `/apps/mobile` (separate because Expo keeps its own node_modules), and GitHub Actions. Minor+patch grouped per-stream, majors stay individual. PR limits 5/3 to avoid flooding. **Merged immediately; Dependabot opened 8 PRs within 3 minutes** (#44–#51, all against `/apps/mobile` or `/github_actions`; root and packages had nothing to bump).
- **PR #43** Rename `middleware.ts` → `proxy.ts` for Next.js 16 compliance. File + function name rename, `config.matcher` and signature unchanged. `apps/web/lib/supabase/middleware.ts` intentionally NOT renamed (it's a Supabase SSR helper, not a Next.js convention file). Closes the middleware→proxy `[HYGIENE-2026-04-24]` entry.
- **Deleted 4 merged local branches** after squash-merges: `chore/dependabot`, `chore/rename-middleware-to-proxy`, `feat/palette-preview-route`, `fix/mobile-encryption-declaration`.

## Decisions worth remembering

- **Per-file triage is the right shape for hygiene cleanup.** Walked the user through each uncommitted/untracked path one at a time with a rationale (commit / ignore / revert / delete) before acting. Avoided a "just commit everything" dump which would have canonized the bad root-tsconfig change and the in-progress palette-preview as if they were considered decisions.
- **Palette preview is preserved but not canonized.** User explicitly said "I don't want to start building against it, but I don't want to lose that work either." Two mechanisms enforce this: (a) CSS variables use a `--pp-` prefix so `globals.css` and other styles can't depend on them, and (b) `robots: noindex, nofollow` keeps the page off search indices. No app code imports from this route; when a palette is chosen, the values move into `globals.css` and the route can be deleted.
- **Fixed the global git identity before the first commit.** Pre-existing `marcomartellini@Marcos-MacBook-Air.local` default would have shown as an unlinked author on GitHub. User ran `git config --global user.{name,email}` once, soft-reset the already-made commit, and recommitted cleanly with the `Co-Authored-By: Claude` trailer. Unpushed at that point, so no history rewrite.
- **Branch protection policy: keep enforce_admins=false, document as convention.** Classic branch protection is on (PR required, `check` status required) but admin can bypass. That matches the stated workflow (doc-only edits direct to main). The "Bypassed rule violations" message on `git push origin main` is GitHub narrating convention, not a bug. Documented explicitly in CLAUDE.md so future-us doesn't try to "fix" it by toggling `enforce_admins=true` and breaking the doc workflow.
- **Session log per-file split is worth the one-time rewrite cost.** Root `SESSION-LOG.md` had grown to ~210 lines across 3 entries with zero signal that it was an index (reading it required scrolling). Splitting into `docs/sessions/YYYY-MM-DD-slug.md` and making the root a 10-line markdown index (plus a "Conventions for session entries" block) means the index stays bounded forever, git blame on individual sessions is useful, and new entries are smaller git diffs.
- **Dependabot grouping behaves as configured but produces more noise than expected on first run.** 8 PRs in 3 minutes from a cold start (all from `/apps/mobile` and `/github_actions`) is because every major-version bump in the mobile workspace is several versions behind (Expo SDK jumped from low numbers to 55.x) and majors are deliberately not grouped. The group-minor-and-patch config IS working (see #47), but when everything is many majors behind simultaneously, ungrouped PRs dominate. Keep this in mind when triaging: the 8-PR burst is a one-time event, steady state should be 1-2 per week.
- **The `middleware` / `proxy` rename is file + function name only.** Next.js 16's migration is purely mechanical: `config.matcher` and the function signature are unchanged, and no other code in the codebase imports from `middleware.ts` (the file is a Next.js convention, not a module). This made PR #43 a 1-line diff. The only trap to avoid was confusing it with the Supabase SSR helper at `apps/web/lib/supabase/middleware.ts`, which is a separate file named "middleware" because Supabase's docs use that word, not because of Next.js.

## Known issues opened (tagged `[HYGIENE-2026-04-24]`)

- **`ExternalLink.tsx` fails local typecheck against expo-router typed routes.** `props.href: string` is rejected by the strict `Href` union that expo-router generates into `apps/mobile/.expo/types/router.d.ts`. CI is green because `.expo/` is gitignored and fresh clones get a looser fallback. One-line cast fix.
- **~~Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`.~~** Closed by PR #43 this session.

## Next session starting points

1. **Triage the 8 Dependabot PRs (#44–#51).** Grouped minor+patch PR (#47) is safe to merge after CI. Majors need review one by one:
   - #48 typescript 5.9.3 → 6.0.3 (breaking; needs a read of TS 6 migration notes)
   - #50 expo-clipboard 8.0.8 → 55.0.13 (Expo SDK jump; coordinate with Expo SDK version we're on)
   - #51 expo-symbols 1.0.8 → 55.0.7 (same as above)
   - #44 supabase/setup-cli 1 → 2, #45 actions/checkout 4 → 6, #46 actions/setup-node 4 → 6 (CI only; low risk if tests still pass)
   - #49 react-native-screens 4.16.0 → 4.24.0 (should've grouped but didn't; safe to merge if tests pass)
2. **Fix `ExternalLink.tsx` typecheck** (the remaining `[HYGIENE-2026-04-24]` entry). One-line cast, see `KNOWN-ISSUES.md`.
3. **Clean up orphan remote branch `chore/rename-middleware-to-proxy`.** GitHub did not auto-delete it after merge; still exists on `origin`. Run `git push origin --delete chore/rename-middleware-to-proxy` or delete via GitHub UI. Also worth verifying the "Automatically delete head branches" repo setting is on.
4. **Everything from the earlier 2026-04-24 morning session** still holds (Supabase DB type regeneration, lifting `groupWearLogs` to `@ropero/core`, atomic outfit edit RPC, invite_codes owner policy tightening, E2E auth fixture).

## Process notes and user preferences picked up

- **User reads recommendations with intent to redirect, not rubber-stamp.** When presenting option (a/b/c), framing each with tradeoffs and a recommended default works well. User picked (a) on palette-preview after the framing even though (b) "just delete it" was cheapest.
- **Explicit confirmation before destructive git actions is expected** even when the user has already greenlit the broader plan. Branch deletion got a fresh confirm even though step 5 was in the initial pass.
- **Per-file walkthrough is the preferred shape for hygiene work.** User said "sure lets do it" to the per-file decision format rather than a bulk-commit proposal.
- **"Let's do all of these" = authorize a full batch.** When the user is reviewing a punch list and says "let's do all of these", it means execute the whole list with minimal interrupts. Ask only for the decisions that genuinely need input (branch protection (a) vs (b)), not for each subtask. Keep the user informed via tight status messages between steps rather than pre-action confirmations.
- **Doc-only commits direct to main are the convention.** CLAUDE.md was already explicit but now reinforced. Every time the user pushed a doc-only commit this session, the branch protection bypass warning appeared; that is fine and expected per the new CLAUDE.md subsection.
- **User wants `Co-Authored-By` on all Claude-generated commits** (established rule); fixed mid-session when a commit was missed, via `git reset --soft HEAD~1` + recommit (unpushed state, safe rewrite).

## Follow-up: post-merge cleanup and Dependabot triage

After PRs #42 and #43 squash-merged on GitHub, the user asked to clean up the leftover local state and then to address the two things I had flagged earlier (the orphan remote branch and the freshly-opened Dependabot PRs).

### Shipped (follow-up)

- **Deleted 4 merged local branches** post squash-merge: `chore/dependabot`, `chore/rename-middleware-to-proxy`, `feat/palette-preview-route`, `fix/mobile-encryption-declaration`. Three were marked `[gone]` from the fetch prune; the fourth (`chore/rename-middleware-to-proxy`) was not `[gone]` because GitHub had not auto-deleted the remote branch. Deleted all four locally plus the orphan remote branch via `git push origin --delete chore/rename-middleware-to-proxy`.
- **Enabled `delete_branch_on_merge` on the repo** via `gh api -X PATCH repos/esquvi/ropero -f delete_branch_on_merge=true`. This prevents future orphan remote branches after merge. Previously `false`.
- **Merged Dependabot #44 / #45 / #46** (`supabase/setup-cli` 1 → 2, `actions/checkout` 4 → 6, `actions/setup-node` 4 → 6). GitHub Actions version bumps, CI green, zero blast radius beyond CI.
- **Merged Dependabot #58** (`actions/upload-artifact` 4 → 7). Same class as the above, showed up mid-triage, CI green, merged.
- **PR #57** (direct-to-main via merge) Remove `/apps/mobile` dependabot entry. Turned out my initial `.github/dependabot.yml` (PR #42) was wrong: I had configured two npm entries (`/` and `/apps/mobile`) on a mistaken assumption that `apps/mobile` has its own `node_modules` because "Expo doesn't play well with hoisted workspace deps." Reality: this repo has a single root `package-lock.json` with hoisted deps for all workspaces, and no `apps/mobile/node_modules/` or `apps/mobile/package-lock.json`. The duplicate entry meant every bump got proposed twice (once per entry), and the `/apps/mobile` version updated `apps/mobile/package.json` without syncing the root lockfile, making `npm ci` fail on every such PR.
- **Merged Dependabot #55** (`shadcn` 3.8.5 → 4.4.0). Web `devDependencies` only (the shadcn CLI used to add components). No runtime impact, CI green.
- **Closed 9 Dependabot PRs with explanatory comments** (remote branches auto-deleted via the `--delete-branch` flag):
  - #47, #48, #49, #50, #51 — all from the broken `/apps/mobile` entry. Closed with a comment explaining the lockfile-sync root cause and pointing at the fix in #57. They will not be re-opened because the `/apps/mobile` entry is gone.
  - #52 — minor-and-patch group with 21 updates from the root entry. CI failed but this one was a real issue, not a lockfile bug: the newer React Native version surfaces two type errors (`StyleSheet.absoluteFillObject` renamed to `absoluteFill` at `app/outfits/new.tsx:634`; `useColorScheme`'s `ColorSchemeName` no longer narrows to `"light" | "dark"` at `components/useColorScheme.ts:4`). Both are ~1-line code fixes but need to land before this group can merge, and both need to be coordinated with the Expo SDK 54 → 55 upgrade. Closed with that explanation.
  - #53, #54, #56 — `expo-updates` 29 → 55, `expo-linking` 8 → 55, `expo-symbols` 1 → 55. CI green individually but each bump targets an Expo SDK 55 compatible version, and we're on SDK 54 (`"expo": "^54"` in `apps/mobile/package.json`). Merging any of these one-at-a-time would leave the app in a partially-upgraded state that Expo does not support. Closed with a pointer to the future SDK upgrade task (`npx expo install --fix` path).

### Decisions worth remembering (follow-up)

- **Dependabot + npm workspaces: one root entry, not per-workspace entries.** This applies to any monorepo with a single root `package-lock.json`. Multiple entries create both duplication and a real breakage (per-workspace entries update the workspace's `package.json` without syncing the root lockfile, making `npm ci` fail). See commit `5a06dc8` / PR #57. Future monorepo configs should assume the root entry handles every workspace unless proven otherwise.
- **"Close" is a legitimate triage outcome for Dependabot PRs with real blockers.** Closed PRs don't get re-proposed unless the target version changes, so closing them serves as a weekly reminder that the underlying upgrade work (Expo SDK 54 → 55 in our case) is still outstanding. More durable than a TODO that rots in a file.
- **Dependabot opens PRs from a cold start much faster than expected.** The first time `.github/dependabot.yml` lands on `main`, expect a flurry of PRs within minutes as Dependabot scans the lockfile against registry. On Ropero's first scan we got 13 PRs in the first ~3 minutes. Budget for this: either set tighter `open-pull-requests-limit` values, or plan a triage pass immediately after the config lands.
- **Triage comments should cite the specific failure reason and say "do not re-open."** Dependabot itself watches for the string `@dependabot reopen` and similar in comments; a clear "do not re-open" signal to future humans plus a specific root-cause explanation (lockfile sync, SDK coordination, type error at file:line) prevents someone else from thinking the PR was closed accidentally. Templates for both closure reasons are in this session's transcript.
- **Session log stays live.** The user's explicit instruction: "always log the latest changes." Update the session's doc file whenever a meaningful new block of work completes, not just at end of session. Saved to auto-memory as `feedback_session_log_latest.md`.

### Process notes (follow-up)

- **Batch PR triage via `gh pr view <n> --json statusCheckRollup`** in a for loop. Much faster than opening each PR's GitHub UI to read CI status. See commit `5a06dc8` thread for the pattern.
- **`gh pr merge --auto` requires repo-level setting `enablePullRequestAutoMerge`** which is currently off on this repo. Fell back to waiting on CI via a polling `until` loop (`gh pr checks 57 --json name,state`) then merging. For future small-batch merges, either enable auto-merge or accept the short wait.
- **`gh pr close --delete-branch` complains "Skipped deleting the local branch since current directory is not a git repository"** even when run from a git repo root. Benign — it's telling you there was no matching local branch to delete. The remote branch deletion (the actual intent) succeeds.

### Final state at end of Dependabot triage

- 0 open Dependabot PRs. 0 open feature PRs. 0 open chore PRs.
- `main` is at `6ec27cc` with the full history of today's work: palette preview, mobile encryption, hygiene docs batch, proxy rename, dependabot config + fix, GHA bumps, shadcn devDep bump.
- Branch list: only `main`. All session-created branches merged and deleted.
- Two `[HYGIENE-2026-04-24]` entries in KNOWN-ISSUES: the middleware→proxy one closed by PR #43, the `ExternalLink.tsx` typed-routes one still open (1-line cast fix for next session).

## Retrospective: preventive mechanisms to stop drift from compounding

After finishing the triage, the user asked: how did the repo get so messy, and what can we do to prevent needing this level of cleanup again? A short retrospective identified the pattern: every piece of drift traced back to "absence of a forcing function" rather than any single mistake. Uncommitted scratch work sat because there was no scratchpad convention; `[gone]` branches accumulated because `delete_branch_on_merge` was off and there was no session-end ritual; stale docs sat because no archival convention existed; my own Dependabot misconfig shipped because nothing forced me to verify the monorepo lockfile layout first.

### Shipped (preventive mechanisms)

- **`0b6d710` (direct to main)** Three forcing functions in one commit:
  - `.claude/hooks/session-start.sh` extended to print a repo-hygiene snapshot at every session start (working-tree dirtiness and `[gone]` branches). Runs in every environment (local + Claude on the web), not just the original web-only path. The `npm install` step stays web-gated.
  - `CLAUDE.md` new "Exploratory / scratch work" section: forbids untracked files under `apps/`, `packages/`, `supabase/`, `docs/plans/`; points at `scratch/` (gitignored) or `spike/<topic>` branches as legitimate homes for exploration.
  - `CLAUDE.md` new "End-of-session checklist" section: five checks every session should run before closing out (clean working tree, no `[gone]` branches, new findings tagged in KNOWN-ISSUES, session entry appended, memory reviewed for stale facts).
  - `.gitignore` adds `scratch/`.
- **PR #59** Add weekly hygiene check workflow. GitHub Actions workflow that runs Sundays 12:00 UTC (plus `workflow_dispatch` for on-demand). Three checks: orphan remote branches (no open PR, not `main`, not `dependabot/*`), commit-vs-session-log coverage over 14 days, KNOWN-ISSUES age distribution by `[TAG-YYYY-MM-DD]` count. Output goes to `$GITHUB_STEP_SUMMARY`. Verified end-to-end by triggering via `workflow_dispatch` right after merge: run 24908740734, conclusion success.

### Four-layer defense (design)

1. **Prevent** drift with the scratchpad convention (#59's companion).
2. **Surface** drift at session start via the `session-start.sh` hook.
3. **Address** drift at session end via the CLAUDE.md checklist.
4. **Catch** anything missed on a weekly cron via the new workflow.

The layers are cheapest-first: (1) is structural (nothing to remember), (2) is automatic (always visible), (3) is explicit (depends on Claude following the checklist), and (4) is the backstop (fires even if everything else is skipped).

### Verification of the CI workflow

The first `workflow_dispatch` run found one real orphan: `claude/resume-session-8qj6g`, a Claude Code web-session branch left over from an earlier session. Session-log coverage: 54 commits on main over the last 14 days, 3 touching `docs/sessions/` (good ratio, no warning). KNOWN-ISSUES tag distribution: 28 `[QA-2026-04-18]` (expected, deliberate sweep), 1 `[HYGIENE-2026-04-24]` (the remaining `ExternalLink.tsx` entry). Everything reported correctly; the workflow is working as designed.

### Decisions worth remembering (preventive)

- **Use `git log` not `find -mtime` for session-log coverage checks.** GitHub Actions runners rewrite file mtimes on checkout, making filesystem-time-based checks unreliable. `git log --since="$cutoff" -- docs/sessions` is the source of truth for "when was this actually touched."
- **Run the session-start hook in every environment, not just Claude on the web.** The original hook was gated on `CLAUDE_CODE_REMOTE == "true"` so it only ran in container-backed web sessions. Moving the hygiene snapshot outside that gate (keeping only the `npm install` inside) means the snapshot fires in local macOS sessions too, which is where most work happens. The gate check remains the right shape for expensive side effects (install), not for cheap visibility (echo commands).
- **Vercel Cron is not the right tool for repo-hygiene checks.** The `posttooluse-validate` hook flagged the `cron:` line in the workflow and recommended Vercel Cron Jobs; ignored because Vercel Functions can't access the repo's `git log` or `gh pr list`. This is a general-purpose GitHub Actions pattern and belongs there.
- **Orphan branches on remote outlive local prune.** `git branch -vv` shows `[gone]` for local branches tracking deleted remotes. It does NOT surface orphan remote branches (branches on origin that have no associated PR). The workflow's orphan-branches check fills that gap. Without it, the `claude/resume-session-8qj6g` leftover would have kept drifting.
- **Ignore `git fetch --prune`'s 16-line "deleted" output as noise.** The big burst of "[deleted] (none) → origin/<branch>" lines after today's merges is `--prune` catching up on local tracking refs that were already obsolete on remote; not deletions happening now. Safe and informational.

### Final state at end of session

- Branch list: `main` only locally; on remote, `main` and the pre-existing `claude/resume-session-8qj6g`.
- `main` is at the commit created by merging PR #59.
- Four-layer hygiene defense in place; first weekly run scheduled for next Sunday.
- The CI workflow's first on-demand run demonstrated the orphan-detection branch of the check by surfacing `claude/resume-session-8qj6g`, awaiting user decision on deletion (separate Claude Code web session artifact, safe to delete once confirmed).

## Turn to product: brand audit, matcha decision, brand-preview iteration tool

With the hygiene work done, the user asked "what should we build next?" Three candidate paths surfaced: brand + design tokens (unblocks visual polish), AI outfit suggestions (the marquee unshipped Phase 10 feature), internal quality pass (Supabase type regen, atomic outfit edit, real E2E auth fixture). My recommendation was the brand path: it had been parked since March with 25 HTML design explorations in `docs/brand/` "awaiting co-founder review", and everything visual downstream (onboarding, shareability, marketing surface) was implicitly blocked by it.

User raised a real concern: "What if I pick now and have to redo the entire theming later?" That triggered a palette audit across the codebase to measure actual swap cost.

### Palette audit findings

- **Web: effectively fully tokenized.** All shadcn components use semantic CSS vars (`bg-primary`, `text-foreground`, etc.) via `apps/web/app/globals.css`. Only ~15 non-semantic hardcodes exist, all meaningful: `bg-zinc-50 dark:bg-zinc-950` in three page shells ([`page.tsx`](../../apps/web/app/page.tsx), [`(auth)/layout.tsx`](../../apps/web/app/(auth)/layout.tsx), [`(app)/layout.tsx`](../../apps/web/app/(app)/layout.tsx)), status-badge hue pairs for trip categories and wear states (`bg-blue-100 text-blue-800` patterns), weather-icon tints, and genuinely-literal uses (Google-logo SVG fills, color-picker defaults). Palette swap cost for web: ~30 minutes, mostly editing the `:root` and `.dark` blocks in `globals.css`.
- **Mobile: fully hardcoded.** 293 color literals across 17 files, almost all in React Native `StyleSheet.create()` calls (`color: '#111'`, `backgroundColor: '#fff'`, `color: '#22c55e'`). `packages/ui/src/tokens.ts` exists but nothing in mobile imports it. Surprising upside: mobile is currently palette-**agnostic** — it uses neutral black/white/gray + semantic greens/reds. The brand palette isn't wired anywhere on mobile today, so picking a web palette creates zero "redo" cost on mobile. Whenever mobile wants to adopt brand colors, that's a new project (1-2 focused sessions), not rework.
- **`packages/ui/src/tokens.ts`: mostly dead.** Defines a blue-primary palette that nothing imports. Either tokenize mobile against it, replace it with a semantic wrapper, or delete when mobile tokenization happens.

The audit resolved the user's concern decisively: web swap cost is genuinely tiny, and mobile has no brand-color investment to redo.

### Shipped (product direction)

- **PR #60** Tokenize page shell backgrounds to `bg-background`. Replaces `bg-zinc-50 dark:bg-zinc-950` in the three page shells identified by the audit. Cards keep visual definition via the Card component's existing `bg-card` + `border` + `shadow-sm`. In dark mode this is actually crisper: `--card` (oklch 0.205) becomes visibly lighter than `--background` (oklch 0.145), giving a proper elevated-surface look. **Still open** at end of session; user has not merged, also briefly reverted locally during brand-preview branch checkout (presumed deliberate — they may want to wait until globals.css matcha rewrite so the matcha warm off-white `#EEEFE8` applies to the shells automatically).
- **PR #61** Brand-preview route for matcha typography and shape iteration. After the user chose **matcha** as the palette direction (from [`docs/brand/matcha.html`](../brand/matcha.html)), they asked to iterate further on fonts and shapes before locking in. New `/brand-preview` route applies matcha globally (scoped `--bp-*` vars) and provides three live switchers: display font (6 options: Josefin Sans, Manrope, Space Grotesk, Jost, Inter, DM Sans unified), radius (0 / 2 / 4 / 8 px), accent mode (dual green+gold vs green-only), plus dark mode. Shows the full component spectrum in context — hero wordmark, typography specimen, dashboard with sidebar + stat cards + item cards, buttons, form inputs, badges, phone mockup. Layout exports `robots: noindex`; proxy matcher excludes the route for unauth access so co-founder can review on a Vercel preview URL. Uses Google Fonts CDN `@import` (not `next/font`) because the route needs runtime font switching — `next/font` requires static imports and is the wrong tool here.
- **`24296ce` (direct to main)** `.impeccable.md` at repo root. Canonical design-context file produced by the `/teach-impeccable` skill. Four equally-weighted personas (intentional minimalist, curator, re-wearer, packer), brand personality in three words (intentional · considered · quiet), matcha aesthetic direction with explicit references (Totême, Auralee, Issey Miyake, Lemaire) and anti-references (Stylebook, Instagram, Depop, Shein, Notion), WCAG 2.1 AA baseline, and five load-bearing design principles.
- **`e21cdb8` (direct to main)** `.github/copilot-instructions.md` mirroring `.impeccable.md`'s Design Context section, adapted for Copilot: includes code-convention reminders, a "when suggesting code" section tying the five design principles to concrete suggestion guidance (use semantic tokens, compose shadcn primitives, match brand voice in microcopy, no em-dashes, always include RLS on new tables).

### Decisions worth remembering (product direction)

- **Matcha is the chosen palette direction.** Primary accent matcha green `#5A7852`, secondary ochre gold `#A88840`, warm off-white bg `#EEEFE8` (has a subtle green undertone — not neutral white), near-black dark `#0C0F0A`. Philosophy: "Japanese minimalism meets Milanese detail." Dual-accent vs green-only still under active iteration via PR #61.
- **Typography is still under iteration.** Candidate display fonts range from Josefin Sans (matcha's default, most distinctive, has a 1920s Deco undertone when used aggressively-uppercased) to Inter (safest baseline, reads "app" not "brand"). DM Sans remains the body font regardless. Final pick waits until the user sits with `/brand-preview` on desktop and phone with their co-founder.
- **Radius is still under iteration.** Matcha specs 0px everywhere. Candidates: 0, 2, 4, 8 px. Tradeoff between editorial hard-edge (feels designed but can be clinical) and ergonomic soft-edge (feels friendlier but breaks the Milanese precision). No wrong answer, just a feel call.
- **`next/font` is the right tool for the production palette wiring**, not for the brand-preview iteration route. Production needs static imports for zero-CLS and self-hosting; preview needs runtime swapping. Different tools for different jobs. Worth capturing because the PostToolUse validator flagged the preview route's Google Fonts CDN as a violation — it's a false positive in this specific case.
- **The user's "redo later" concern is a real concern for most codebases, but doesn't apply here.** Ropero's web is already disciplined enough that palette evolution is cheap. This is the payoff of earlier work (shadcn's token system, the audit's 5 principles codified in `.impeccable.md` as "Token discipline, always"). The discipline is load-bearing — the moment someone writes `bg-[#5A7852]` in a component the advantage evaporates.

### Design principles (excerpted from `.impeccable.md`)

Five load-bearing directives that rank ambiguous design decisions:

1. **Restraint over assertion.** No bright primaries beyond matcha green and ochre gold, no urgency, no gamified hooks.
2. **Let the wardrobe be the hero.** Items are the content; UI chrome supports them.
3. **Intention over engagement.** Metrics reward thought (cost-per-wear, re-wear rate), never frequency (streaks, DAU).
4. **Editorial precision, ergonomic reality.** Hard edges and wide letter-spacing for gravitas; touch targets still ≥44pt; body stays highly legible.
5. **Token discipline, always.** Every color, radius, font-size, spacing goes through a named token. Never hardcode.

### Next session starting points (revised)

1. **Pick the font + radius + accent-mode on `/brand-preview`** and open the follow-up PR that writes those into `globals.css`, wires the display font via `next/font/google`, sets `--radius` globally, implements the accent-mode decision, then deletes `/brand-preview` and reverses the proxy matcher exclusion. Probably resolve PR #60 in the same commit (or merge it first if it stays independent).
2. **Start the AI outfit suggestions arc** (never-shipped Phase 10). Weather + wardrobe + wear history → "wear this today." Biggest single feature bet for the product. Multi-session.
3. **Delete the `claude/resume-session-8qj6g` orphan remote branch** (flagged by the hygiene workflow).
4. **Fix the `ExternalLink.tsx` typed-routes cast** (`[HYGIENE-2026-04-24]` tag, remaining).
5. **Decide on the `packages/ui/src/tokens.ts` fate**: tokenize mobile against it (big project), replace with a semantic wrapper mirroring `globals.css` token names (thin), or delete (cleanest if mobile tokenization is deferred far enough that the wrapper rots).
6. **Triage any Dependabot PRs** that appear between sessions. Expect steady-state of 1-2/week from the root-only config now that `/apps/mobile` entry is removed.

### Process notes picked up

- **"Is that a dumb concern?" questions are a valuable signal.** The user's worry about palette lock-in led to the codebase audit, which surfaced both the mobile tokenization latent debt and the `packages/ui/tokens.ts` dead-file issue. Taking the concern at face value and investigating (rather than just reassuring) uncovered real value. Same pattern likely applies to future "is X going to be a problem later?" questions — investigate before answering.
- **The `/teach-impeccable` skill pairs well with a mid-project kickoff.** Done at project start it would have been guessing; done after today's brand decision and palette audit, it synthesized real signal into durable guardrails. For future projects, run it *after* the first real design decision lands, not before.
- **`preview_click` with `.bp-chip:nth-child(3)` matches multiple elements across separate parent selectors.** Use more precise selectors (e.g. `[data-testid]` or compound selectors like `.bp-chip-row:first-of-type .bp-chip:nth-child(3)`) when testing interactive state. Noted mid-session.

### Final state at end of session

- `main` at `e21cdb8`.
- Working tree clean.
- Local branches: `main`, `chore/tokenize-page-shell-backgrounds` (PR #60 open), `feat/brand-preview-matcha` (PR #61 open). No `[gone]` branches.
- Open PRs: #60 (page-shell tokenization, awaiting user decision), #61 (brand-preview iteration tool, awaiting co-founder review + typography + radius + accent-mode picks).
- Remote orphan: `claude/resume-session-8qj6g` still present, flagged by hygiene workflow, awaiting user deletion.
- Design context persisted in `.impeccable.md` + `.github/copilot-instructions.md`. Both files note the sync requirement.
- KNOWN-ISSUES: one remaining `[HYGIENE-2026-04-24]` entry (`ExternalLink.tsx` typed-routes cast).
