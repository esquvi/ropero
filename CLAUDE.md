# Ropero

Wardrobe management app with outfit building, wear logging, and smart trip packing.

Known bugs and rough edges are tracked in `KNOWN-ISSUES.md` at the repo root. Check there before spending time reproducing something and add to it (no PR needed, doc-only) when you find a new non-urgent issue.

Past session summaries live under `docs/sessions/` with an index at `SESSION-LOG.md`. Claude should read the most recent entry at the start of every session for context (what's been shipped recently, open threads, user preferences picked up so far), and append a new dated file under `docs/sessions/` plus an index line in `SESSION-LOG.md` at the end of the session. Doc-only, direct to main is fine.

## Monorepo Structure
- `apps/web` — Next.js 16 (App Router), port 3000
- `apps/mobile` — Expo (React Native, Expo Router)
- `packages/core` — Shared TypeScript types, Zod validation, business logic
- `packages/supabase` — Supabase client, generated DB types, query helpers
- `packages/ui` — Shared design tokens (colors, spacing, typography)
- `supabase/` — Supabase project config, migrations, Edge Functions

## Build & Dev
- Install: `npm install` (from root)
- Dev (all): `npm run dev`
- Dev (web only): `npm run dev --workspace=@ropero/web`
- Build: `npm run build`
- Typecheck: `npm run typecheck`

## Test
- Unit tests: `npm run test --workspace=@ropero/core`
- All tests: `npm run test`
- E2E: `npx playwright test` (from apps/web)

## Code Style
- TypeScript strict mode everywhere
- Zod for all validation (shared in packages/core)
- Use @ropero/core types — never define data types in app code
- Supabase DB types auto-generated: `npm run generate-types --workspace=@ropero/supabase`

## Database
- Supabase Postgres with Row Level Security
- Every table MUST have RLS policies (user_id = auth.uid())
- Local dev: `supabase start` (requires Docker)
- Migrations: `supabase/migrations/`

## Web UI Components (shadcn/ui)
- shadcn/ui components live in `apps/web/components/ui/` — do NOT modify these directly for app logic
- App-specific components go in `apps/web/components/` (they compose shadcn primitives)
- Add new shadcn components: `npx shadcn@latest add <component>` (run from apps/web/)
- Use the `cn()` helper from `@/lib/utils` for conditional Tailwind classes
- shadcn/ui is web-only — mobile app uses React Native primitives with shared tokens

## Git Workflow
- Code, migrations, dependencies, and deploy config changes must go through feature branches and PRs. Doc-only edits (CLAUDE.md, READMEs, KNOWN-ISSUES, session logs, code comments) may be committed directly to `main`
- Branch naming: `feature/description`, `fix/description`, `chore/description`
- PR titles become the squash-merge commit message on `main`: use imperative mood, keep under 70 characters, no trailing period
- Write clear PR descriptions with a summary and test plan (use `.github/pull_request_template.md`)
- Never use em-dashes (—) in PR descriptions, titles, or commit messages. Use periods, commas, colons, semicolons, or parentheses instead
- PRs require passing CI typecheck, lint, and tests before merging. Lint runs against `apps/web` only today; other workspaces have no ESLint config
- Squash-merge PRs to keep `main` history clean
- Delete branches after merging
- Commit prefixes like `feat:` / `fix:` / `chore:` are not required. Use them if helpful, but consistency is not enforced

### Branch protection on `main`

Classic branch protection is enabled on `main`: PR required, required status check `check`, no force pushes, no deletions. `enforce_admins` is deliberately OFF so the admin (repo owner) can push doc-only edits directly per the rule above. GitHub will narrate this as "Bypassed rule violations" on the push; that is expected and not an error. The protection's real job is to catch accidental direct pushes of code and serve as a firm rule for any future non-admin contributor.

## Testing
- TDD: write failing test first, then implement
- Unit tests required for all business logic in `packages/core`
- E2E tests required for new user-facing features (Playwright in `apps/web/e2e/`)
- RLS tests required for any new database tables or policy changes
- All tests must pass before merging — CI enforces this
- Run `npm run test` locally before pushing

## Key Conventions
- No custom API server — use Supabase client SDK directly + Edge Functions
- Design tokens in packages/ui — import from @ropero/ui, not hardcoded values
- Always use shadcn/ui components for web UI — never raw HTML inputs, buttons, etc.
- Dark mode via `next-themes` — ThemeProvider at root layout, uses `class` attribute + CSS vars in globals.css
- Triggers on `auth.users` must use `public.` schema prefix for table/function references (auth schema context)

## Exploratory / scratch work

If you're sketching something that isn't ready to commit (design explorations, research code, one-off scripts, test fixtures you're iterating on), put it in one of two places:

- `scratch/` at the repo root. Gitignored. Use this for anything truly throwaway or that you want to keep locally without it landing on `main`.
- A `spike/<topic>` branch. Use this when the exploration is substantial enough to want version history but isn't converging on a PR. Example: `spike/new-outfit-score-algorithm`.

**Never leave untracked files under `apps/`, `packages/`, `supabase/`, or `docs/plans/`.** Those paths imply "intentional and committed"; untracked content there signals drift and tends to sit for weeks before anyone notices. If an exploration outgrows `scratch/` or a spike branch, convert it into a real feature branch with a proper plan doc in `docs/plans/`.

## End-of-session checklist

Before closing out a session, verify and address each item. Append notes to the session file if any remain deliberately unresolved.

- [ ] `git status` is clean on `main`, or everything remaining is explicitly logged in the session file with a stated reason
- [ ] Every local branch whose PR has merged has been deleted (`git branch -vv` shows no `[gone]` entries)
- [ ] Any new findings worth tracking are filed in `KNOWN-ISSUES.md` with a dated tag (`[TAG-YYYY-MM-DD]`)
- [ ] The session entry is appended to `docs/sessions/YYYY-MM-DD-slug.md` and indexed in `SESSION-LOG.md`
- [ ] Memory index (`~/.claude/projects/.../MEMORY.md`) reviewed for stale facts (framework versions, file paths, migration counts, numeric claims)

Exception for doc-only sessions with nothing shipped: the checklist still applies but can be a single line in the session log noting "no code changes; checklist trivially satisfied."

## Invite System
- Signup is gated — requires a valid invite code
- Founder code: `ROPERO01` (9999 uses) for bootstrapping
- Each user gets a unique 8-char code with 5 invites on signup (DB trigger)
- Atomic redemption via `redeem_invite_code()` Postgres function (race-safe with `FOR UPDATE`)
- Profile page auto-generates codes for pre-existing users on first visit
- Tables: `invite_codes`, `invite_redemptions` (migrations 00006–00007)

## Deployment
- **Web**: Auto-deploys to Vercel on merge to `main` (https://ropero-web.vercel.app)
- **Database**: Push migrations with `npx supabase db push` after merging migration PRs
- **Mobile dev**: `cd apps/mobile && npx expo start`, scan QR with iPhone camera
- **Mobile builds**: `cd apps/mobile && eas build --profile <development|preview|production>`. Each profile maps to an EAS Update channel of the same name
- **Mobile OTA updates** (JS-only changes): `cd apps/mobile && eas update --branch <preview|production> --message "<short description>"`. Updates ship to installed apps that already include the matching native runtime (the `expo-updates` module). Bumping `expo.version` in `app.json` invalidates existing OTAs because `runtimeVersion` policy is `appVersion`; do that only when shipping new native code via `eas build`
- **Supabase Cloud**: Project ref `ihwkmkdtlcmrhomlyalx`
