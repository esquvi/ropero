# Ropero

Wardrobe management app with outfit building, wear logging, and smart trip packing. Consumer SaaS, currently in friends-and-family beta (invite-gated signup).

Production web app: https://ropero-web.vercel.app

## What's in here

Turborepo monorepo with two apps and three shared packages:

```
apps/
  web/        Next.js 16 (App Router), shadcn/ui, Tailwind
  mobile/     Expo (React Native, Expo Router)
packages/
  core/       Shared types, Zod validation, scoring, packing logic, weather
  supabase/   Supabase client, DB types, query helpers, RLS integration tests
  ui/         Shared design tokens
supabase/     Migrations, seed, Edge Functions, local config
docs/
  plans/      Design + implementation docs for shipped and in-progress features
  brand/      Standalone HTML palette/typography explorations (pre-decision)
  sessions/   Per-session Claude Code work logs
```

Backend is Supabase (Postgres with Row Level Security, Auth, Storage, Edge Functions). No custom API server: the apps talk to Supabase directly.

## Quickstart

Requirements: Node.js 20+, npm 10+, Docker (for local Supabase).

```bash
# Install
npm install

# Run everything (web on :3000, mobile via Expo)
npm run dev

# Web only
npm run dev --workspace=@ropero/web

# Mobile only
cd apps/mobile && npx expo start

# Type check / lint / test
npm run typecheck
npm run lint            # apps/web only today
npm run test

# Build web
npm run build
```

For local Supabase: `supabase start` (requires Docker). Migrations live in `supabase/migrations/`.

## Key docs

- [CLAUDE.md](CLAUDE.md) — project conventions, workflow rules, tech stack notes. Read this before writing code.
- [KNOWN-ISSUES.md](KNOWN-ISSUES.md) — bugs and rough edges we know about but haven't fixed. Check before reproducing something.
- [SESSION-LOG.md](SESSION-LOG.md) — index of per-session Claude Code work logs. Read the most recent entry to get up to speed.
- [docs/plans/](docs/plans/) — design and implementation plans for shipped and in-progress features.
- [docs/brand/](docs/brand/) — HTML design explorations awaiting co-founder review. Also a live interactive preview at `/palette-preview` on the deployed web app.

## Workflow at a glance

- Code, migrations, dependency bumps, and deploy config go through PRs against `main`. CI runs typecheck, lint, unit tests, RLS integration tests, and web E2E.
- Doc-only edits (this file, CLAUDE.md, KNOWN-ISSUES.md, session logs, comments) may be committed directly to `main`.
- Squash-merge PRs. Delete branches after merging. Branch names: `feature/…`, `fix/…`, `chore/…`.
- PR titles are imperative, under 70 chars, no trailing period, and no em-dashes anywhere in prose.

## Deployment

- **Web**: auto-deploys to Vercel on merge to `main`.
- **Database**: run `npx supabase db push` after merging any migration PR.
- **Mobile**: development via Expo Go. Production builds via `eas build`; JS-only updates ship via `eas update` on the `preview` / `production` channels.
- **Supabase Cloud**: project ref `ihwkmkdtlcmrhomlyalx`.

See [CLAUDE.md](CLAUDE.md#deployment) for the full deployment reference.
