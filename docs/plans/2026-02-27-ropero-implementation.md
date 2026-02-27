# Ropero Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a wardrobe management app with outfit building, wear logging, and smart trip packing — as a Turborepo monorepo with Next.js web app, Expo mobile app, and Supabase backend.

**Architecture:** Turborepo monorepo with shared TypeScript packages. Supabase handles auth, database (Postgres + RLS), file storage, and Edge Functions. No custom API server — client SDK talks directly to Supabase, Edge Functions handle server-side logic (AI, weather).

**Tech Stack:** TypeScript, Next.js 15, Expo (React Native), Turborepo, Supabase, Zod, Vitest, Playwright, Claude API, Open-Meteo API

---

## Phase 1: Monorepo Scaffold

### Task 1: Initialize Turborepo Monorepo

**Files:**
- Create: `package.json` (workspace root)
- Create: `turbo.json`
- Create: `tsconfig.json` (base config)
- Create: `.gitignore`
- Create: `.npmrc`

**Step 1: Initialize root package.json**

```json
{
  "name": "ropero",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^2"
  },
  "packageManager": "npm@10.9.0"
}
```

**Step 2: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

**Step 3: Create base tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

**Step 4: Create .gitignore**

Include: node_modules, .next, dist, .turbo, .env*, .expo, ios, android build artifacts.

**Step 5: Create .npmrc**

```
auto-install-peers=true
```

**Step 6: Install dependencies and commit**

Run: `npm install`

```bash
git add .
git commit -m "feat: initialize Turborepo monorepo"
```

---

### Task 2: Create Next.js Web App

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/app/globals.css`

**Step 1: Scaffold Next.js app**

Run from repo root:
```bash
npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-git
```

**Step 2: Update apps/web/package.json**

Set name to `@ropero/web`. Add scripts:
```json
{
  "name": "@ropero/web",
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

**Step 3: Update apps/web/tsconfig.json to extend base**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "jsx": "preserve",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "noEmit": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

**Step 4: Create a minimal landing page**

Replace `app/page.tsx` with a simple "Ropero — Your Smart Wardrobe" placeholder page.

**Step 5: Verify it runs**

Run: `npm run dev --workspace=@ropero/web`
Expected: Next.js dev server at http://localhost:3000 with the placeholder page.

**Step 6: Commit**

```bash
git add apps/web
git commit -m "feat: add Next.js web app scaffold"
```

---

### Task 3: Create Expo Mobile App

**Files:**
- Create: `apps/mobile/` (Expo project with Expo Router)

**Step 1: Scaffold Expo app**

Run from repo root:
```bash
npx create-expo-app@latest apps/mobile --template tabs
```

**Step 2: Update apps/mobile/package.json**

Set name to `@ropero/mobile`.

**Step 3: Verify it runs**

Run: `npx expo start --clear` from `apps/mobile/`
Expected: Expo dev server launches, scannable QR code.

**Step 4: Commit**

```bash
git add apps/mobile
git commit -m "feat: add Expo mobile app scaffold"
```

---

### Task 4: Create Shared Core Package

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/src/types/index.ts`
- Create: `packages/core/src/validation/index.ts`

**Step 1: Create packages/core/package.json**

```json
{
  "name": "@ropero/core",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "zod": "^3"
  },
  "devDependencies": {
    "typescript": "^5",
    "vitest": "^3"
  }
}
```

**Step 2: Create tsconfig.json extending base**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create placeholder types**

`packages/core/src/types/index.ts`:
```typescript
export type ItemStatus = 'active' | 'archived' | 'donated' | 'sold';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type PackingListStatus = 'draft' | 'finalized' | 'packed';
```

This is a placeholder — full types will be generated from Supabase schema in Phase 2.

**Step 4: Create barrel export**

`packages/core/src/index.ts`:
```typescript
export * from './types';
export * from './validation';
```

`packages/core/src/validation/index.ts`:
```typescript
// Validation schemas will be added here
export {};
```

**Step 5: Install dependencies and verify**

Run: `npm install`
Run: `npx tsc --noEmit -p packages/core/tsconfig.json`
Expected: No errors.

**Step 6: Commit**

```bash
git add packages/core
git commit -m "feat: add shared core package with base types"
```

---

### Task 5: Create Shared UI Package

**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/src/index.ts`
- Create: `packages/ui/src/tokens.ts`

**Step 1: Create packages/ui/package.json**

```json
{
  "name": "@ropero/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

**Step 2: Create design tokens**

`packages/ui/src/tokens.ts`:
```typescript
export const colors = {
  primary: {
    50: '#f0f7ff',
    100: '#e0efff',
    200: '#b8dbff',
    300: '#7ac0ff',
    400: '#369ff7',
    500: '#0c7ee8',
    600: '#0062c6',
    700: '#004ea1',
    800: '#044385',
    900: '#0a396e',
  },
  neutral: {
    50: '#f8f9fa',
    100: '#f1f3f5',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#868e96',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
```

**Step 3: Create barrel export**

`packages/ui/src/index.ts`:
```typescript
export * from './tokens';
```

**Step 4: Commit**

```bash
git add packages/ui
git commit -m "feat: add shared UI package with design tokens"
```

---

### Task 6: Create Supabase Package

**Files:**
- Create: `packages/supabase/package.json`
- Create: `packages/supabase/tsconfig.json`
- Create: `packages/supabase/src/index.ts`
- Create: `packages/supabase/src/client.ts`

**Step 1: Create packages/supabase/package.json**

```json
{
  "name": "@ropero/supabase",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "eslint src/",
    "generate-types": "supabase gen types typescript --local > src/database.types.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2"
  },
  "devDependencies": {
    "typescript": "^5",
    "vitest": "^3",
    "supabase": "^2"
  }
}
```

**Step 2: Create client factory**

`packages/supabase/src/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(supabaseUrl: string, supabaseAnonKey: string) {
  return createClient(supabaseUrl, supabaseAnonKey);
}
```

Type-safe client will be added after schema migration generates types.

**Step 3: Create barrel export**

`packages/supabase/src/index.ts`:
```typescript
export { createSupabaseClient } from './client';
```

**Step 4: Commit**

```bash
git add packages/supabase
git commit -m "feat: add shared Supabase package"
```

---

### Task 7: Wire Up Cross-Package Dependencies

**Step 1: Add @ropero/core and @ropero/ui as dependencies in apps/web/package.json**

```json
"dependencies": {
  "@ropero/core": "*",
  "@ropero/supabase": "*",
  "@ropero/ui": "*"
}
```

**Step 2: Same for apps/mobile/package.json**

**Step 3: Update next.config.ts for monorepo transpilation**

Next.js needs to know about the workspace packages:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ropero/core', '@ropero/supabase', '@ropero/ui'],
};

export default nextConfig;
```

**Step 4: Install and verify**

Run: `npm install`
Run: `npm run build` (from root)
Expected: All packages and apps build successfully.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: wire up cross-package dependencies"
```

---

### Task 8: Create CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

**Step 1: Write project memory file**

```markdown
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

## Key Conventions
- No custom API server — use Supabase client SDK directly + Edge Functions
- Design tokens in packages/ui — import from @ropero/ui, not hardcoded values
- TDD: write failing test first, then implement
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "feat: add CLAUDE.md project memory"
```

---

## Phase 2: Supabase Setup & Database Schema

### Task 9: Initialize Supabase Project

**Step 1: Initialize Supabase locally**

Run from repo root:
```bash
npx supabase init
```

This creates the `supabase/` directory with config.toml.

**Step 2: Start Supabase locally**

Run: `npx supabase start`
Expected: Local Supabase stack starts (Postgres, Auth, Storage, etc.). Note the output URLs and keys.

**Step 3: Create .env.local for web app**

Create `apps/web/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-supabase-start>
```

**Step 4: Commit (not the .env.local)**

```bash
git add supabase/
git commit -m "feat: initialize Supabase project"
```

---

### Task 10: Create Database Migration — Items Table

**Files:**
- Create: `supabase/migrations/00001_create_items.sql`

**Step 1: Write the migration**

```sql
-- Items table: core wardrobe pieces
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text,
  category text NOT NULL,
  subcategory text,
  color_primary text NOT NULL,
  color_secondary text,
  pattern text,
  size text,
  material text,
  season text[] NOT NULL DEFAULT '{}',
  formality int NOT NULL DEFAULT 3 CHECK (formality BETWEEN 1 AND 5),
  photo_urls text[] NOT NULL DEFAULT '{}',
  purchase_date date,
  purchase_price numeric,
  purchase_source text,
  receipt_email_id text,
  times_worn int NOT NULL DEFAULT 0,
  last_worn_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'donated', 'sold')),
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for common queries
CREATE INDEX items_user_id_idx ON items(user_id);
CREATE INDEX items_category_idx ON items(user_id, category);
CREATE INDEX items_status_idx ON items(user_id, status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own items" ON items
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own items" ON items
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own items" ON items
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own items" ON items
  FOR DELETE USING (user_id = auth.uid());
```

**Step 2: Apply migration**

Run: `npx supabase db reset`
Expected: Migration applies cleanly.

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add items table migration with RLS"
```

---

### Task 11: Create Database Migration — Outfits Table

**Files:**
- Create: `supabase/migrations/00002_create_outfits.sql`

**Step 1: Write the migration**

```sql
-- Outfits table
CREATE TABLE outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  occasion text,
  photo_url text,
  rating int CHECK (rating BETWEEN 1 AND 5),
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX outfits_user_id_idx ON outfits(user_id);

CREATE TRIGGER outfits_updated_at
  BEFORE UPDATE ON outfits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own outfits" ON outfits
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own outfits" ON outfits
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own outfits" ON outfits
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own outfits" ON outfits
  FOR DELETE USING (user_id = auth.uid());

-- Outfit-Items join table
CREATE TABLE outfit_items (
  outfit_id uuid NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  PRIMARY KEY (outfit_id, item_id)
);

ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

-- RLS via outfit ownership
CREATE POLICY "Users can view own outfit items" ON outfit_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_id AND outfits.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own outfit items" ON outfit_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_id AND outfits.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own outfit items" ON outfit_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_id AND outfits.user_id = auth.uid())
  );
```

**Step 2: Apply and verify**

Run: `npx supabase db reset`

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add outfits and outfit_items tables with RLS"
```

---

### Task 12: Create Database Migration — Trips & Packing Lists

**Files:**
- Create: `supabase/migrations/00003_create_trips_packing.sql`

**Step 1: Write the migration**

```sql
-- Trips table
CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  destination text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  trip_type text NOT NULL,
  weather_forecast jsonb,
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX trips_user_id_idx ON trips(user_id);

CREATE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own trips" ON trips
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own trips" ON trips
  FOR DELETE USING (user_id = auth.uid());

-- Packing Lists table
CREATE TABLE packing_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'packed')),
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX packing_lists_trip_id_idx ON packing_lists(trip_id);

CREATE TRIGGER packing_lists_updated_at
  BEFORE UPDATE ON packing_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own packing lists" ON packing_lists
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own packing lists" ON packing_lists
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own packing lists" ON packing_lists
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own packing lists" ON packing_lists
  FOR DELETE USING (user_id = auth.uid());

-- Packing List Items join table
CREATE TABLE packing_list_items (
  packing_list_id uuid NOT NULL REFERENCES packing_lists(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  packed boolean NOT NULL DEFAULT false,
  PRIMARY KEY (packing_list_id, item_id)
);

ALTER TABLE packing_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own packing list items" ON packing_list_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own packing list items" ON packing_list_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );
CREATE POLICY "Users can update own packing list items" ON packing_list_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own packing list items" ON packing_list_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );

-- Packing List Outfits join table
CREATE TABLE packing_list_outfits (
  packing_list_id uuid NOT NULL REFERENCES packing_lists(id) ON DELETE CASCADE,
  outfit_id uuid NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  PRIMARY KEY (packing_list_id, outfit_id)
);

ALTER TABLE packing_list_outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own packing list outfits" ON packing_list_outfits
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own packing list outfits" ON packing_list_outfits
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own packing list outfits" ON packing_list_outfits
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM packing_lists WHERE packing_lists.id = packing_list_id AND packing_lists.user_id = auth.uid())
  );
```

**Step 2: Apply and verify**

Run: `npx supabase db reset`

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add trips, packing_lists, and join tables with RLS"
```

---

### Task 13: Create Database Migration — Wear Logs

**Files:**
- Create: `supabase/migrations/00004_create_wear_logs.sql`

**Step 1: Write the migration**

```sql
-- Wear Logs table
CREATE TABLE wear_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  outfit_id uuid REFERENCES outfits(id) ON DELETE SET NULL,
  worn_at date NOT NULL DEFAULT CURRENT_DATE,
  occasion text,
  weather_conditions text,
  notes text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX wear_logs_user_id_idx ON wear_logs(user_id);
CREATE INDEX wear_logs_item_id_idx ON wear_logs(item_id);
CREATE INDEX wear_logs_worn_at_idx ON wear_logs(user_id, worn_at DESC);

ALTER TABLE wear_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wear logs" ON wear_logs
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own wear logs" ON wear_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own wear logs" ON wear_logs
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own wear logs" ON wear_logs
  FOR DELETE USING (user_id = auth.uid());

-- Trigger to update item stats when a wear log is created
CREATE OR REPLACE FUNCTION update_item_wear_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE items
  SET times_worn = times_worn + 1,
      last_worn_at = NEW.worn_at
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER wear_log_update_item_stats
  AFTER INSERT ON wear_logs
  FOR EACH ROW EXECUTE FUNCTION update_item_wear_stats();
```

**Step 2: Apply and verify**

Run: `npx supabase db reset`

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add wear_logs table with auto-update trigger and RLS"
```

---

### Task 14: Generate Supabase Types & Create Storage Bucket

**Step 1: Generate TypeScript types from schema**

Run: `npm run generate-types --workspace=@ropero/supabase`

This creates `packages/supabase/src/database.types.ts` with full type definitions for all tables.

**Step 2: Update Supabase client to use generated types**

Update `packages/supabase/src/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export function createSupabaseClient(supabaseUrl: string, supabaseAnonKey: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export type { Database };
```

**Step 3: Create storage bucket migration**

Create `supabase/migrations/00005_create_storage.sql`:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-photos', 'item-photos', true);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload item photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'item-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view item photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'item-photos');

CREATE POLICY "Users can delete own item photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'item-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Step 4: Apply, regenerate types, verify**

Run: `npx supabase db reset`
Run: `npm run generate-types --workspace=@ropero/supabase`

**Step 5: Commit**

```bash
git add packages/supabase/src/ supabase/migrations/
git commit -m "feat: generate Supabase types and add storage bucket"
```

---

### Task 15: Create Seed Data

**Files:**
- Create: `supabase/seed.sql`

**Step 1: Write seed data**

Create a test user and sample items across categories (tops, bottoms, outerwear, shoes, accessories) with varied attributes. Include 1-2 outfits, a trip, and some wear logs.

This seed data will be used for local development and testing.

**Step 2: Apply**

Run: `npx supabase db reset` (reset applies migrations + seed)

**Step 3: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat: add seed data for local development"
```

---

## Phase 3: Core Package — Types & Validation

### Task 16: Define Zod Validation Schemas

**Files:**
- Create: `packages/core/src/validation/item.ts`
- Create: `packages/core/src/validation/outfit.ts`
- Create: `packages/core/src/validation/trip.ts`
- Create: `packages/core/src/validation/wear-log.ts`
- Modify: `packages/core/src/validation/index.ts`

**Step 1: Write failing tests**

Create `packages/core/src/validation/__tests__/item.test.ts`:
- Test that a valid item passes validation
- Test that missing required fields fail
- Test that formality outside 1-5 fails
- Test that invalid status fails

**Step 2: Run tests to verify they fail**

Run: `npm run test --workspace=@ropero/core`

**Step 3: Implement Zod schemas**

`packages/core/src/validation/item.ts`:
```typescript
import { z } from 'zod';

export const ITEM_CATEGORIES = [
  'tops', 'bottoms', 'outerwear', 'shoes', 'accessories',
  'dresses', 'activewear', 'swimwear', 'sleepwear', 'underwear',
] as const;

export const ITEM_STATUSES = ['active', 'archived', 'donated', 'sold'] as const;
export const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const;
export const PATTERNS = ['solid', 'striped', 'plaid', 'floral', 'dotted', 'geometric', 'abstract', 'other'] as const;

export const createItemSchema = z.object({
  name: z.string().min(1).max(200),
  brand: z.string().max(100).nullable().optional(),
  category: z.enum(ITEM_CATEGORIES),
  subcategory: z.string().max(100).nullable().optional(),
  color_primary: z.string().min(1).max(50),
  color_secondary: z.string().max(50).nullable().optional(),
  pattern: z.enum(PATTERNS).nullable().optional(),
  size: z.string().max(20).nullable().optional(),
  material: z.string().max(100).nullable().optional(),
  season: z.array(z.enum(SEASONS)).default([]),
  formality: z.number().int().min(1).max(5).default(3),
  purchase_date: z.string().nullable().optional(), // ISO date string
  purchase_price: z.number().nonnegative().nullable().optional(),
  purchase_source: z.string().max(200).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(50)).default([]),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
```

Similarly for outfit, trip, wear-log schemas.

**Step 4: Run tests to verify they pass**

**Step 5: Commit**

```bash
git add packages/core/
git commit -m "feat: add Zod validation schemas for all entities"
```

---

### Task 17: Add Business Logic — Outfit Scoring

**Files:**
- Create: `packages/core/src/scoring/outfit-score.ts`
- Create: `packages/core/src/scoring/__tests__/outfit-score.test.ts`

**Step 1: Write failing tests**

Test cases:
- Items not worn recently score higher
- Items worn frequently score lower for "try something new"
- Season-appropriate items score higher for given date
- Formality-matched items score higher for given occasion

**Step 2: Run tests to verify they fail**

**Step 3: Implement scoring functions**

```typescript
export interface ScoredItem {
  itemId: string;
  score: number;
  reasons: string[];
}

export function scoreItemForWear(item: {
  last_worn_at: string | null;
  times_worn: number;
  season: string[];
  formality: number;
}, context: {
  currentSeason: string;
  targetFormality?: number;
  today: string;
}): ScoredItem { ... }
```

**Step 4: Run tests to verify they pass**

**Step 5: Commit**

```bash
git add packages/core/
git commit -m "feat: add outfit scoring logic"
```

---

## Phase 4: Auth & App Shell

### Task 18: Set Up Supabase Auth in Web App

**Files:**
- Create: `apps/web/lib/supabase/client.ts` (browser client)
- Create: `apps/web/lib/supabase/server.ts` (server client)
- Create: `apps/web/lib/supabase/middleware.ts`
- Create: `apps/web/middleware.ts`
- Modify: `apps/web/app/layout.tsx`

**Step 1: Install Supabase SSR package**

Run: `npm install @supabase/ssr --workspace=@ropero/web`

**Step 2: Create browser and server Supabase clients**

Follow the Supabase Next.js SSR pattern:
- Browser client: `createBrowserClient()` for client components
- Server client: `createServerClient()` using cookies for server components/actions
- Middleware: refreshes auth tokens on every request

**Step 3: Create auth middleware**

`apps/web/middleware.ts` — refreshes session on every request, redirects unauthenticated users to `/login`.

**Step 4: Verify auth flow works locally**

Run: `npm run dev --workspace=@ropero/web`
Navigate to any protected route — should redirect to /login.

**Step 5: Commit**

```bash
git add apps/web/
git commit -m "feat: set up Supabase auth with SSR in web app"
```

---

### Task 19: Build Login & Signup Pages

**Files:**
- Create: `apps/web/app/(auth)/login/page.tsx`
- Create: `apps/web/app/(auth)/signup/page.tsx`
- Create: `apps/web/app/(auth)/layout.tsx`
- Create: `apps/web/app/auth/callback/route.ts`

**Step 1: Create auth layout**

Centered card layout for auth pages — no sidebar.

**Step 2: Build login page**

- Email + password form
- "Sign in with Google" button (Supabase OAuth)
- Link to signup

**Step 3: Build signup page**

- Email + password + name form
- "Sign up with Google" button
- Link to login

**Step 4: Create OAuth callback route**

`apps/web/app/auth/callback/route.ts` — exchanges auth code for session.

**Step 5: Test manually**

- Sign up with email
- Sign in with email
- Google OAuth flow (requires Supabase Google provider config)

**Step 6: Commit**

```bash
git add apps/web/
git commit -m "feat: add login and signup pages with email and Google OAuth"
```

---

### Task 20: Build App Shell — Sidebar Layout

**Files:**
- Create: `apps/web/app/(app)/layout.tsx`
- Create: `apps/web/app/(app)/dashboard/page.tsx`
- Create: `apps/web/components/sidebar.tsx`
- Create: `apps/web/components/header.tsx`

**Step 1: Create app layout with sidebar**

Route group `(app)` wraps all authenticated pages. Layout includes:
- Sidebar with navigation links (Dashboard, Wardrobe, Outfits, Trips, Settings)
- Header with user menu (profile, sign out)
- Main content area

**Step 2: Create placeholder dashboard page**

Simple "Welcome to Ropero" message with placeholder stat cards.

**Step 3: Test navigation**

Run dev server, sign in, verify sidebar navigation works between placeholder pages.

**Step 4: Commit**

```bash
git add apps/web/
git commit -m "feat: add app shell with sidebar navigation"
```

---

## Phase 5: Wardrobe Management (Web)

### Task 21: Wardrobe List Page

**Files:**
- Create: `apps/web/app/(app)/wardrobe/page.tsx`
- Create: `apps/web/components/wardrobe/item-card.tsx`
- Create: `apps/web/components/wardrobe/item-filters.tsx`

**Step 1: Build the wardrobe grid page**

Server component that fetches items from Supabase:
```typescript
const { data: items } = await supabase
  .from('items')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });
```

**Step 2: Build ItemCard component**

Displays: photo thumbnail (or placeholder), name, brand, category, color dot, season badges.

**Step 3: Build filter bar**

Client component with dropdowns: category, season, formality range, status. Filters applied as URL search params for server-side filtering.

**Step 4: Test with seed data**

**Step 5: Commit**

```bash
git add apps/web/
git commit -m "feat: add wardrobe list page with item cards and filters"
```

---

### Task 22: Add Item Flow

**Files:**
- Create: `apps/web/app/(app)/wardrobe/add/page.tsx`
- Create: `apps/web/components/wardrobe/add-item-form.tsx`
- Create: `apps/web/components/wardrobe/photo-upload.tsx`

**Step 1: Build multi-step add form**

Three steps:
1. **Photo** — drag-and-drop or click to upload photo(s). Upload to Supabase Storage under `{user_id}/{uuid}.jpg`.
2. **Details** — category, name, brand, colors, size, material, season, formality, purchase info.
3. **Tags** — notes and tags. Review and submit.

Uses the `createItemSchema` from `@ropero/core` for client-side validation.

**Step 2: Build photo upload component**

Uploads to Supabase Storage, returns public URL. Shows preview.

**Step 3: Create server action for item creation**

```typescript
'use server'
export async function createItem(formData: CreateItemInput & { photo_urls: string[] }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('items').insert({
    ...formData,
    user_id: user.id,
  });
  // redirect to wardrobe page
}
```

**Step 4: Test the full add flow**

**Step 5: Commit**

```bash
git add apps/web/
git commit -m "feat: add item creation flow with photo upload"
```

---

### Task 23: Item Detail & Edit Page

**Files:**
- Create: `apps/web/app/(app)/wardrobe/[id]/page.tsx`
- Create: `apps/web/components/wardrobe/item-detail.tsx`
- Create: `apps/web/components/wardrobe/edit-item-form.tsx`

**Step 1: Build item detail page**

Displays: full-size photos, all attributes, wear history (from wear_logs), edit button, status change buttons (archive, mark as donated/sold).

**Step 2: Build edit form**

Pre-populated form using the same schema as add. Server action for update.

**Step 3: Add status change actions**

Server actions for: archive, donate, sell, reactivate.

**Step 4: Commit**

```bash
git add apps/web/
git commit -m "feat: add item detail and edit pages"
```

---

## Phase 6: Wear Logging (Web)

### Task 24: Wear Log Feature

**Files:**
- Create: `apps/web/app/(app)/wardrobe/[id]/wear-log.tsx`
- Create: `apps/web/components/wear/log-wear-button.tsx`
- Create: `apps/web/components/wear/wear-history.tsx`

**Step 1: Build "Log Wear" button component**

Quick action button on item cards and item detail page. Opens a small modal/popover:
- Date (defaults to today)
- Occasion (optional)
- Notes (optional)

Server action creates wear_log entry. The database trigger automatically updates `items.times_worn` and `items.last_worn_at`.

**Step 2: Build wear history component**

Timeline of wear logs for an item, displayed on the item detail page.

**Step 3: Test the flow**

Add an item, log a wear, verify times_worn increments and last_worn_at updates.

**Step 4: Commit**

```bash
git add apps/web/
git commit -m "feat: add wear logging with history timeline"
```

---

## Phase 7: Outfit Builder (Web)

### Task 25: Outfit Builder Page

**Files:**
- Create: `apps/web/app/(app)/outfits/page.tsx`
- Create: `apps/web/app/(app)/outfits/builder/page.tsx`
- Create: `apps/web/components/outfits/outfit-builder.tsx`
- Create: `apps/web/components/outfits/outfit-card.tsx`

**Step 1: Build outfits list page**

Grid of saved outfits with name, photo/item previews, occasion, rating.

**Step 2: Build outfit builder**

Interactive page:
- Left panel: browse/filter wardrobe items (reuse item-filters)
- Right panel: "outfit canvas" where selected items appear
- Click an item to add/remove from outfit
- Form fields: name, occasion, rating, notes, tags
- Save action creates outfit + outfit_items rows

**Step 3: Test creating and viewing outfits**

**Step 4: Commit**

```bash
git add apps/web/
git commit -m "feat: add outfit builder and outfits list"
```

---

## Phase 8: Trips & Packing (Web)

### Task 26: Trip Management Pages

**Files:**
- Create: `apps/web/app/(app)/trips/page.tsx`
- Create: `apps/web/app/(app)/trips/[id]/page.tsx`
- Create: `apps/web/components/trips/trip-card.tsx`
- Create: `apps/web/components/trips/create-trip-form.tsx`

**Step 1: Build trips list page**

Upcoming and past trips. Trip card shows: name, destination, dates, type, packing status.

**Step 2: Build create trip form**

Fields: name, destination, start/end dates, trip type. Server action creates trip.

**Step 3: Build trip detail page**

Shows trip info, weather forecast (fetched in Task 27), and packing list.

**Step 4: Commit**

```bash
git add apps/web/
git commit -m "feat: add trip management pages"
```

---

### Task 27: Weather Integration (Edge Function)

**Files:**
- Create: `supabase/functions/fetch-weather/index.ts`

**Step 1: Write failing test for weather fetch logic**

Test in `packages/core/src/weather/__tests__/weather.test.ts`:
- Test that geocoding a destination returns coordinates
- Test that forecast data is parsed into a usable format

**Step 2: Implement weather utility in packages/core**

```typescript
export interface WeatherForecast {
  daily: Array<{
    date: string;
    tempMin: number;
    tempMax: number;
    precipitation: number;
    description: string;
  }>;
}

export function parseOpenMeteoResponse(data: unknown): WeatherForecast { ... }
```

**Step 3: Create Edge Function**

`supabase/functions/fetch-weather/index.ts`:
- Receives destination + date range
- Geocodes destination via Open-Meteo geocoding API
- Fetches forecast via Open-Meteo forecast API
- Caches result in trip.weather_forecast column
- Returns parsed forecast

**Step 4: Wire up in trip detail page**

Call the Edge Function when viewing a trip, display forecast.

**Step 5: Run tests, commit**

```bash
git add packages/core/ supabase/functions/ apps/web/
git commit -m "feat: add weather integration via Open-Meteo Edge Function"
```

---

### Task 28: AI-Assisted Packing Suggestions (Edge Function)

**Files:**
- Create: `supabase/functions/suggest-packing/index.ts`
- Create: `packages/core/src/packing/suggest.ts`

**Step 1: Implement rule-based packing logic in packages/core**

```typescript
export function suggestPackingItems(
  items: Item[],
  trip: { duration: number; type: string; weather: WeatherForecast; formality: number }
): ScoredItem[] { ... }
```

Rules:
- Calculate number of each category needed based on duration
- Filter by season/weather appropriateness
- Score by formality match, versatility, and freshness (least recently worn)

**Step 2: Write tests for packing logic**

**Step 3: Create Edge Function for AI polish**

- Takes rule-based suggestions + trip context
- Sends to Claude API for natural language explanation and final ranking
- Returns polished suggestions

**Step 4: Build packing UI**

`apps/web/app/(app)/trips/[id]/pack/page.tsx`:
- "Generate suggestions" button triggers Edge Function
- Displays suggested items with AI explanations
- User can accept/reject each suggestion
- Finalize creates packing_list + packing_list_items

**Step 5: Test, commit**

```bash
git add packages/core/ supabase/functions/ apps/web/
git commit -m "feat: add AI-assisted packing suggestions"
```

---

## Phase 9: Dashboard (Web)

### Task 29: Dashboard Page

**Files:**
- Modify: `apps/web/app/(app)/dashboard/page.tsx`
- Create: `apps/web/components/dashboard/stat-card.tsx`
- Create: `apps/web/components/dashboard/recent-activity.tsx`
- Create: `apps/web/components/dashboard/upcoming-trips.tsx`

**Step 1: Build dashboard with real data**

Stats:
- Total items (by status)
- Total wardrobe value (sum of purchase_price)
- Items by category (bar/pie chart)
- Most worn / least worn items

Recent activity: last 10 wear logs.

Upcoming trips: next 3 trips with packing status.

Quick actions: "Add Item", "Log Wear".

**Step 2: Commit**

```bash
git add apps/web/
git commit -m "feat: build dashboard with stats and activity feed"
```

---

## Phase 10: Mobile App

### Task 30: Set Up Supabase Auth in Expo

**Files:**
- Create: `apps/mobile/lib/supabase.ts`
- Modify: `apps/mobile/app/_layout.tsx`

**Step 1: Install dependencies**

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage --workspace=@ropero/mobile
```

**Step 2: Create Supabase client for React Native**

Uses AsyncStorage for session persistence.

**Step 3: Create auth context/provider**

Wrap app in auth provider, handle session state.

**Step 4: Build login/signup screens**

Screens matching the web auth flow. Adapt for mobile UX (full-screen forms, keyboard handling).

**Step 5: Commit**

```bash
git add apps/mobile/
git commit -m "feat: set up Supabase auth in Expo mobile app"
```

---

### Task 31: Mobile App Shell & Navigation

**Files:**
- Modify: `apps/mobile/app/(tabs)/_layout.tsx`
- Create: `apps/mobile/app/(tabs)/index.tsx` (Home/Dashboard)
- Create: `apps/mobile/app/(tabs)/wardrobe.tsx`
- Create: `apps/mobile/app/(tabs)/add.tsx`
- Create: `apps/mobile/app/(tabs)/trips.tsx`
- Create: `apps/mobile/app/(tabs)/profile.tsx`

**Step 1: Configure bottom tab navigation**

5 tabs: Home, Wardrobe, Add (+), Trips, Profile.

**Step 2: Build placeholder screens for each tab**

**Step 3: Commit**

```bash
git add apps/mobile/
git commit -m "feat: add mobile tab navigation and placeholder screens"
```

---

### Task 32: Mobile Wardrobe & Camera Capture

**Files:**
- Create: `apps/mobile/app/wardrobe/[id].tsx`
- Create: `apps/mobile/components/item-card.tsx`
- Create: `apps/mobile/components/camera-capture.tsx`

**Step 1: Build wardrobe grid screen**

FlatList with item cards, pull-to-refresh, filter chips at top.

**Step 2: Build camera capture for adding items**

Use `expo-camera` for taking photos, `expo-image-picker` for gallery selection. Upload to Supabase Storage.

**Step 3: Build add item form (mobile-optimized)**

Full-screen form with camera/gallery at top, details below. Same validation via `@ropero/core`.

**Step 4: Build item detail screen**

Photos, details, wear history, "Log Wear" button.

**Step 5: Commit**

```bash
git add apps/mobile/
git commit -m "feat: add mobile wardrobe, camera capture, and item management"
```

---

### Task 33: Mobile Wear Logging, Outfits & Trips

**Step 1: Add quick "Log Wear" action**

Tap item → modal with date + occasion → save. Reuses same Supabase queries as web.

**Step 2: Build mobile outfit viewer**

List of saved outfits. Tap to view items in outfit. (Full builder is complex on mobile — defer to web for v1, mobile shows read-only outfits.)

**Step 3: Build mobile trip list and packing checklist**

Trip list screen. Trip detail with packing list checkboxes (toggle packed status).

**Step 4: Commit**

```bash
git add apps/mobile/
git commit -m "feat: add mobile wear logging, outfits, and packing"
```

---

## Phase 11: Testing & CI

### Task 34: RLS Policy Integration Tests

**Files:**
- Create: `packages/supabase/src/__tests__/rls.test.ts`

**Step 1: Write RLS tests for every table**

For each table (items, outfits, outfit_items, trips, packing_lists, packing_list_items, packing_list_outfits, wear_logs):
- Create two test users via Supabase Auth admin API
- User A inserts data
- User B attempts SELECT, UPDATE, DELETE on User A's data → all must fail
- User A can CRUD their own data → all must succeed

**Step 2: Run tests against local Supabase**

Run: `npx supabase start` then `npm run test --workspace=@ropero/supabase`

**Step 3: Commit**

```bash
git add packages/supabase/
git commit -m "test: add RLS policy integration tests for all tables"
```

---

### Task 35: E2E Tests (Playwright)

**Files:**
- Create: `apps/web/e2e/auth.spec.ts`
- Create: `apps/web/e2e/wardrobe.spec.ts`
- Create: `apps/web/e2e/outfit.spec.ts`
- Create: `apps/web/e2e/trip.spec.ts`
- Create: `apps/web/playwright.config.ts`

**Step 1: Install Playwright**

Run: `npm install -D @playwright/test --workspace=@ropero/web`
Run: `npx playwright install`

**Step 2: Write critical path E2E tests**

- `auth.spec.ts`: Sign up → redirect to dashboard → sign out → sign in
- `wardrobe.spec.ts`: Add item (with photo) → see in grid → edit → archive
- `outfit.spec.ts`: Create outfit from items → view in outfits list
- `trip.spec.ts`: Create trip → generate packing suggestions → finalize list

**Step 3: Run E2E tests**

Run: `npx playwright test` (from apps/web)

**Step 4: Commit**

```bash
git add apps/web/e2e/ apps/web/playwright.config.ts
git commit -m "test: add Playwright E2E tests for critical flows"
```

---

### Task 36: GitHub Actions CI Pipeline

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Write CI workflow**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - uses: supabase/setup-cli@v1
      - run: supabase start
      - run: npm run test --workspace=@ropero/supabase
      - run: npx playwright install --with-deps
      - run: npx playwright test
        working-directory: apps/web
```

**Step 2: Commit**

```bash
git add .github/
git commit -m "ci: add GitHub Actions pipeline"
```

---

## Phase 12: Deploy

### Task 37: Deploy Web App to Vercel

**Step 1: Push repo to GitHub**

```bash
git remote add origin <github-url>
git push -u origin main
```

**Step 2: Connect to Vercel**

Run: `npx vercel` from repo root. Select `apps/web` as the root directory. Vercel auto-detects Turborepo.

**Step 3: Set environment variables in Vercel**

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase Cloud project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Cloud anon key

**Step 4: Deploy and verify**

Run: `npx vercel --prod`

**Step 5: Commit any Vercel config changes**

```bash
git add .
git commit -m "ci: configure Vercel deployment"
```

---

### Task 38: Configure Supabase Cloud

**Step 1: Create Supabase Cloud project**

Via dashboard.supabase.com. Note project URL and keys.

**Step 2: Link local project**

Run: `npx supabase link --project-ref <project-id>`

**Step 3: Push migrations to cloud**

Run: `npx supabase db push`

**Step 4: Configure auth providers**

In Supabase dashboard: enable Google OAuth provider, set redirect URLs for Vercel domain.

**Step 5: Create storage bucket in cloud**

Verify the storage migration applied correctly.

---

### Task 39: Configure EAS for Mobile Builds

**Step 1: Install EAS CLI**

Run: `npm install -g eas-cli`

**Step 2: Configure EAS**

Run from `apps/mobile/`:
```bash
eas build:configure
```

**Step 3: Set environment variables**

Create `apps/mobile/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=<cloud-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<cloud-anon-key>
```

**Step 4: Create development build**

Run: `eas build --platform ios --profile development`

**Step 5: Commit**

```bash
git add apps/mobile/eas.json
git commit -m "ci: configure EAS for mobile builds"
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| 1 | 1-8 | Monorepo scaffold: Turborepo + Next.js + Expo + shared packages |
| 2 | 9-15 | Supabase: schema, migrations, RLS, storage, seed data |
| 3 | 16-17 | Core package: Zod validation, outfit scoring logic |
| 4 | 18-20 | Auth + app shell (web) |
| 5 | 21-23 | Wardrobe CRUD (web) |
| 6 | 24 | Wear logging (web) |
| 7 | 25 | Outfit builder (web) |
| 8 | 26-28 | Trips, weather, AI packing (web) |
| 9 | 29 | Dashboard (web) |
| 10 | 30-33 | Mobile app (auth, wardrobe, camera, packing) |
| 11 | 34-36 | Testing: RLS, E2E, CI pipeline |
| 12 | 37-39 | Deploy: Vercel, Supabase Cloud, EAS |
