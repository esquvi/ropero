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
- **Never commit directly to `main`** — all changes go through feature branches and PRs
- Branch naming: `feature/description`, `fix/description`, `chore/description`
- Create a PR for every change, no matter how small
- PRs require passing CI checks (typecheck, lint, tests) before merging
- Squash-merge PRs to keep `main` history clean
- Write clear PR descriptions with a summary and test plan
- Delete branches after merging

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

## Deployment
- **Web**: Auto-deploys to Vercel on merge to `main` (https://ropero-web.vercel.app)
- **Database**: Push migrations with `npx supabase db push` after merging migration PRs
- **Mobile**: Run locally with `cd apps/mobile && npx expo start`, scan QR with iPhone camera
- **Supabase Cloud**: Project ref `ihwkmkdtlcmrhomlyalx`
