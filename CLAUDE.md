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

## Key Conventions
- No custom API server — use Supabase client SDK directly + Edge Functions
- Design tokens in packages/ui — import from @ropero/ui, not hardcoded values
- Always use shadcn/ui components for web UI — never raw HTML inputs, buttons, etc.
- TDD: write failing test first, then implement
