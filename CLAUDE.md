# Ropero

Wardrobe management app with outfit building, wear logging, and smart trip packing.

## Monorepo Structure
- `apps/web` — Next.js 15 (App Router), port 3000
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
- Code, migrations, dependencies, and deploy config changes must go through feature branches and PRs. Doc-only edits (CLAUDE.md, READMEs, code comments) may be committed directly to `main`
- Branch naming: `feature/description`, `fix/description`, `chore/description`
- PR titles become the squash-merge commit message on `main`: use imperative mood, keep under 70 characters, no trailing period
- Write clear PR descriptions with a summary and test plan
- Never use em-dashes (—) in PR descriptions, titles, or commit messages. Use periods, commas, colons, semicolons, or parentheses instead
- PRs require passing CI typecheck, lint, and tests before merging. Lint runs against `apps/web` only today; other workspaces have no ESLint config
- Squash-merge PRs to keep `main` history clean
- Delete branches after merging
- Commit prefixes like `feat:` / `fix:` / `chore:` are not required. Use them if helpful, but consistency is not enforced

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
- **Mobile**: Run locally with `cd apps/mobile && npx expo start`, scan QR with iPhone camera
- **Supabase Cloud**: Project ref `ihwkmkdtlcmrhomlyalx`
