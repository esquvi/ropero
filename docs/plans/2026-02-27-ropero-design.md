# Ropero — Design Document

**Date:** 2026-02-27
**Status:** Approved

## Overview

Ropero is a wardrobe management application that helps users catalog everything they own, log what they wear, build outfits, and pack smartly for trips. It combines rule-based filtering with AI-powered recommendations to suggest what to wear based on weather, occasion, wear history, and personal style.

**Target:** Consumer SaaS, launching with a friends-and-family beta.

## Architecture

### Monorepo (Turborepo)

```
ropero/
├── apps/
│   ├── web/                    # Next.js 15 (App Router)
│   └── mobile/                 # Expo (React Native, Expo Router)
├── packages/
│   ├── core/                   # Shared types, validation (Zod), business logic
│   ├── supabase/               # Supabase client, generated types, query helpers
│   └── ui/                     # Shared design tokens (colors, spacing, typography)
├── supabase/                   # Supabase project config
│   ├── migrations/             # SQL migrations
│   ├── functions/              # Edge Functions
│   └── seed.sql
├── turbo.json
├── package.json
└── CLAUDE.md
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Web app | Next.js 15 (App Router) |
| Web UI components | shadcn/ui (Radix UI + Tailwind CSS) |
| Mobile app | Expo with Expo Router |
| Monorepo | Turborepo |
| Auth | Supabase Auth (email + Google OAuth) |
| Database | Supabase Postgres with Row Level Security |
| File storage | Supabase Storage (item/outfit photos) |
| Server-side logic | Supabase Edge Functions |
| AI | Claude API (via Edge Functions) |
| Weather | Open-Meteo (free, no API key) |
| Web hosting | Vercel (auto-deploy from GitHub) |
| Mobile builds | EAS (Expo Application Services) |
| CI | GitHub Actions |

### API Architecture

No custom API server. The client SDK talks directly to Supabase Postgres, with RLS enforcing per-user data isolation.

```
90% of operations:  App → Supabase SDK → Postgres (RLS)
10% of operations:  App → Supabase Edge Function → External API → Postgres
```

Edge Functions handle operations requiring secrets or server-side processing:
- Claude API calls (outfit recommendations, packing suggestions)
- Weather data fetching and caching
- Future: Gmail receipt parsing

## Data Model

### Item

Represents a single clothing piece in a user's wardrobe.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| name | text | |
| brand | text | nullable |
| category | text | tops, bottoms, outerwear, shoes, accessories, etc. |
| subcategory | text | nullable (e.g., t-shirt, blazer, sneakers) |
| color_primary | text | |
| color_secondary | text | nullable |
| pattern | text | nullable (solid, striped, plaid, etc.) |
| size | text | nullable |
| material | text | nullable |
| season | text[] | spring, summer, fall, winter |
| formality | int | 1 (casual) to 5 (formal) |
| photo_urls | text[] | Supabase Storage URLs |
| purchase_date | date | nullable |
| purchase_price | numeric | nullable |
| purchase_source | text | nullable |
| receipt_email_id | text | nullable, for future Gmail integration |
| times_worn | int | default 0, denormalized counter |
| last_worn_at | timestamptz | nullable |
| status | text | active, archived, donated, sold |
| notes | text | nullable |
| tags | text[] | user-defined tags |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### Outfit

A combination of items styled together.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| name | text | |
| occasion | text | nullable (casual, work, date night, etc.) |
| photo_url | text | nullable (optional outfit photo) |
| rating | int | nullable, 1-5 |
| notes | text | nullable |
| tags | text[] | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Join table:** `outfit_items` (outfit_id, item_id)

### Trip

An upcoming or past trip for packing planning.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| name | text | |
| destination | text | |
| start_date | date | |
| end_date | date | |
| trip_type | text | business, vacation, hiking, beach, etc. |
| weather_forecast | jsonb | nullable, cached from Open-Meteo |
| notes | text | nullable |
| tags | text[] | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### PackingList

A packing list associated with a trip.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| trip_id | uuid | FK → trips |
| user_id | uuid | FK → auth.users (denormalized for RLS) |
| status | text | draft, finalized, packed |
| notes | text | nullable |
| tags | text[] | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Join tables:**
- `packing_list_items` (packing_list_id, item_id, packed boolean)
- `packing_list_outfits` (packing_list_id, outfit_id)

### WearLog

Records each time a user wears an item.

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| item_id | uuid | FK → items |
| outfit_id | uuid | nullable, FK → outfits |
| worn_at | date | |
| occasion | text | nullable |
| weather_conditions | text | nullable |
| notes | text | nullable |
| tags | text[] | |
| created_at | timestamptz | |

### RLS Policy Pattern

Every table uses the same base pattern:

```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON <table>
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own data" ON <table>
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own data" ON <table>
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own data" ON <table>
  FOR DELETE USING (user_id = auth.uid());
```

## Features — v1 (Beta Launch)

### 1. Auth & Onboarding
- Supabase Auth with email + Google OAuth
- Simple onboarding: name, style preferences (optional)

### 2. Wardrobe Management
- Add items via: photo upload (web), camera capture (mobile), manual form
- Browse wardrobe as a filterable grid (category, color, season, formality, tags)
- Search items by name, brand, tags
- Edit and archive/donate/sell items

### 3. Wear Logging
- Quick "wore this today" action from item detail or outfit
- Wear history timeline on each item
- Automatically updates times_worn counter and last_worn_at

### 4. Outfit Builder
- Select items to compose an outfit
- Name, tag, and rate outfits
- Optional outfit photo

### 5. Trip & Packing
- Create trips with destination, dates, and type
- Weather forecast fetched from Open-Meteo and cached
- AI-assisted packing suggestions based on: trip duration, type, weather, formality needs
- Editable packing list with pack/unpack checkboxes
- Organize by outfits or individual items

### 6. Recommendations (Hybrid)
- Rule-based filtering: season-appropriate, formality-matched, weather-suitable
- Scoring: least recently worn, most versatile (appears in many outfits), user-rated
- Claude API polishes final suggestions with natural language explanations

### 7. Dashboard
- Wardrobe stats: total items, total value, items by category
- Recent wear logs
- Upcoming trips
- Quick actions: log wear, add item

## Features — v2 (Post-Beta)

- Gmail integration: auto-import purchase receipts, create items
- Google Calendar integration: auto-detect travel, create trips
- Image recognition: auto-tag category, color, pattern from item photos
- Full AI-powered outfit recommendations
- Declutter mode: suggest items to donate/sell based on wear frequency
- Social features: share outfits, get feedback
- Advanced analytics: cost-per-wear, seasonal breakdowns, style trends

## UI & Navigation

### Web (Next.js)

Sidebar navigation with these pages:

- `/dashboard` — stats, recent activity, upcoming trips
- `/wardrobe` — filterable item grid
- `/wardrobe/[id]` — item detail (photos, wear history, edit)
- `/wardrobe/add` — multi-step add flow (photo → details → tags)
- `/outfits` — saved outfits grid
- `/outfits/builder` — compose outfits from items
- `/trips` — trip list
- `/trips/[id]` — trip detail with packing list
- `/trips/[id]/pack` — AI-assisted packing flow
- `/settings` — profile, integrations, account

### Mobile (Expo)

Bottom tab navigation: Home, Wardrobe, Add (+), Trips, Profile

Mobile priorities:
- Quick camera capture for adding items
- Quick "wore this" tap action
- Packing list with checkboxes
- Same route structure adapted for mobile navigation

### Shared Design System

**Web (shadcn/ui):** Components live in `apps/web/components/ui/` — installed via `npx shadcn@latest add <component>`. Built on Radix UI (accessible primitives) + Tailwind CSS. Key components used: Button, Card, Dialog, Dropdown Menu, Form, Input, Select, Tabs, Badge, Sheet (mobile sidebar), Command (search), Calendar (date picker).

**Shared tokens (packages/ui):** Color palette, spacing scale, typography exported as constants. Both apps consume the same tokens. Web app maps tokens to Tailwind CSS variables (used by shadcn/ui theme). Mobile app uses tokens directly in React Native styles.

**Mobile:** Platform-native components (React Native primitives), styled using shared tokens from packages/ui. No shadcn/ui on mobile (it's web-only).

## Testing

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | packages/core (validation, scoring, utils) |
| Component | React Testing Library | Key web UI components |
| Integration | Vitest + Supabase local | DB queries, RLS policies, Edge Functions |
| E2E | Playwright | Critical web flows (sign up → add item → wear → trip → pack) |
| Mobile | Jest + Expo | Mobile-specific component tests |

### RLS Policy Tests (Mandatory)

Every table gets explicit tests verifying:
- User A can CRUD their own data
- User A cannot SELECT/UPDATE/DELETE user B's data

### CI Pipeline (GitHub Actions)

```
Push / PR → Typecheck → Lint → Unit + Integration tests → E2E → Build check
```

Vercel auto-deploys preview builds on PRs.

## Deployment

| Target | Platform | Trigger |
|--------|----------|---------|
| Web app | Vercel | Auto-deploy on push to main, previews on PRs |
| Mobile app | EAS (Expo) | Manual or GitHub Actions trigger |
| Database | Supabase Cloud | Migrations via supabase db push or CI |
