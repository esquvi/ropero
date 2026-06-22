import { readFileSync } from 'node:fs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Service-role + admin helpers for E2E setup. These run in Node (never in the
// browser bundle). Defaults match the Supabase local demo keys so a developer
// with `supabase start` can run the suite without extra env wiring; CI passes
// the same values explicitly via the e2e-tests job env.
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Paths are relative to the Playwright cwd (apps/web), shared by the setup
// project (writer) and the specs + config (readers) so they never drift.
export const AUTH_DIR = 'e2e/.auth';
export const STORAGE_STATE = `${AUTH_DIR}/user.json`;
export const SEED_FILE = `${AUTH_DIR}/seed.json`;

export interface TestUser {
  id: string;
  email: string;
  password: string;
}

export interface SeededItem {
  id: string;
  name: string;
  category: string;
}

export interface SeedContext {
  user: TestUser;
  items: SeededItem[];
}

export function createAdminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Create a pre-confirmed user directly via the admin API, bypassing the
// invite gate and email confirmation. The invite gate itself is exercised by
// signup.spec.ts; this just yields a usable session for the authed specs.
export async function createTestUser(admin: SupabaseClient): Promise<TestUser> {
  const email = `e2e-${Date.now()}@test.local`;
  const password = 'e2e-password-123';

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(`createTestUser failed: ${error?.message ?? 'no user returned'}`);
  }

  return { id: data.user.id, email, password };
}

const STARTER_ITEMS = [
  {
    name: 'E2E Oxford Shirt',
    category: 'tops',
    color_primary: 'white',
    formality: 4,
    season: ['spring', 'fall'],
  },
  {
    name: 'E2E Wool Trousers',
    category: 'bottoms',
    color_primary: 'charcoal',
    formality: 4,
    season: ['fall', 'winter'],
  },
  {
    name: 'E2E Leather Loafers',
    category: 'shoes',
    color_primary: 'brown',
    formality: 3,
    season: ['spring', 'summer', 'fall'],
  },
];

// Seed a small fixed wardrobe so the authed specs have items to view, build
// outfits from, and log wears against. Inserted with empty photo_urls so no
// Supabase Storage bucket is required (Storage is excluded from the CI stack).
export async function seedItems(admin: SupabaseClient, userId: string): Promise<SeededItem[]> {
  const rows = STARTER_ITEMS.map((item) => ({
    user_id: userId,
    ...item,
    photo_urls: [],
    tags: [],
  }));

  const { data, error } = await admin.from('items').insert(rows).select('id, name, category');

  if (error || !data) {
    throw new Error(`seedItems failed: ${error?.message ?? 'no rows returned'}`);
  }

  return data as SeededItem[];
}

// Read the seed context persisted by the setup project. Specs use this to know
// the seeded user's email and item names without hard-coding them.
export function readSeedContext(): SeedContext {
  return JSON.parse(readFileSync(SEED_FILE, 'utf8')) as SeedContext;
}
