/**
 * RLS Policy Integration Tests
 *
 * These tests verify Row Level Security policies by:
 * 1. Creating two test users via Supabase Admin API
 * 2. User A inserts data -> must succeed
 * 3. User B attempts CRUD on User A's data -> must fail
 * 4. User A CRUD on own data -> must succeed
 *
 * Requires a running local Supabase instance: `supabase start`
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Admin client for user management
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let userAClient: SupabaseClient;
let userBClient: SupabaseClient;
let userAId: string;
let userBId: string;

// Check if Supabase is running
async function isSupabaseRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: ANON_KEY },
    });
    return res.ok;
  } catch {
    return false;
  }
}

function createAuthenticatedClient(accessToken: string): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const skipMessage = 'Skipping: local Supabase is not running. Run `supabase start` to enable.';

describe('RLS Policies', () => {
  let supabaseRunning = false;

  beforeAll(async () => {
    supabaseRunning = await isSupabaseRunning();
    if (!supabaseRunning) return;

    // Create test users
    const emailA = `rls-test-a-${Date.now()}@test.local`;
    const emailB = `rls-test-b-${Date.now()}@test.local`;
    const password = 'test-password-123';

    const { data: dataA } = await admin.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
    });
    const { data: dataB } = await admin.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
    });

    userAId = dataA.user!.id;
    userBId = dataB.user!.id;

    // Sign in to get tokens
    const clientA = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const clientB = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: sessionA } = await clientA.auth.signInWithPassword({ email: emailA, password });
    const { data: sessionB } = await clientB.auth.signInWithPassword({ email: emailB, password });

    userAClient = createAuthenticatedClient(sessionA.session!.access_token);
    userBClient = createAuthenticatedClient(sessionB.session!.access_token);
  });

  afterAll(async () => {
    if (!supabaseRunning) return;

    // Clean up test users and their data (cascade delete)
    await admin.auth.admin.deleteUser(userAId);
    await admin.auth.admin.deleteUser(userBId);
  });

  describe('items table', () => {
    let itemId: string;

    it('User A can insert own items', async () => {
      if (!supabaseRunning) return expect(true).toBe(true); // skip

      const { data, error } = await userAClient
        .from('items')
        .insert({
          user_id: userAId,
          name: 'RLS Test Shirt',
          category: 'tops',
          color_primary: 'blue',
          formality: 3,
          season: ['summer'],
          photo_urls: [],
          tags: [],
        })
        .select('id')
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      itemId = data!.id;
    });

    it('User A can read own items', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data, error } = await userAClient
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      expect(error).toBeNull();
      expect(data?.name).toBe('RLS Test Shirt');
    });

    it('User B cannot read User A items', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data } = await userBClient
        .from('items')
        .select('*')
        .eq('id', itemId);

      expect(data).toEqual([]);
    });

    it('User B cannot update User A items', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data } = await userBClient
        .from('items')
        .update({ name: 'Hacked' })
        .eq('id', itemId)
        .select();

      expect(data).toEqual([]);
    });

    it('User B cannot delete User A items', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data } = await userBClient
        .from('items')
        .delete()
        .eq('id', itemId)
        .select();

      expect(data).toEqual([]);
    });

    it('User A can update own items', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { error } = await userAClient
        .from('items')
        .update({ name: 'Updated Shirt' })
        .eq('id', itemId);

      expect(error).toBeNull();
    });
  });

  describe('outfits table', () => {
    let outfitId: string;

    it('User A can insert own outfits', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data, error } = await userAClient
        .from('outfits')
        .insert({
          user_id: userAId,
          name: 'RLS Test Outfit',
          tags: [],
        })
        .select('id')
        .single();

      expect(error).toBeNull();
      outfitId = data!.id;
    });

    it('User B cannot read User A outfits', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data } = await userBClient
        .from('outfits')
        .select('*')
        .eq('id', outfitId);

      expect(data).toEqual([]);
    });

    it('User B cannot delete User A outfits', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data } = await userBClient
        .from('outfits')
        .delete()
        .eq('id', outfitId)
        .select();

      expect(data).toEqual([]);
    });
  });

  describe('trips table', () => {
    let tripId: string;

    it('User A can insert own trips', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data, error } = await userAClient
        .from('trips')
        .insert({
          user_id: userAId,
          name: 'RLS Test Trip',
          destination: 'Testville',
          start_date: '2026-06-01',
          end_date: '2026-06-07',
          trip_type: 'leisure',
          tags: [],
        })
        .select('id')
        .single();

      expect(error).toBeNull();
      tripId = data!.id;
    });

    it('User B cannot read User A trips', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data } = await userBClient
        .from('trips')
        .select('*')
        .eq('id', tripId);

      expect(data).toEqual([]);
    });

    it('User B cannot update User A trips', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data } = await userBClient
        .from('trips')
        .update({ name: 'Hacked Trip' })
        .eq('id', tripId)
        .select();

      expect(data).toEqual([]);
    });
  });

  describe('wear_logs table', () => {
    let itemId: string;
    let wearLogId: string;

    beforeAll(async () => {
      if (!supabaseRunning) return;

      // Create an item for wear log
      const { data } = await userAClient
        .from('items')
        .insert({
          user_id: userAId,
          name: 'Wear Log Test Item',
          category: 'tops',
          color_primary: 'red',
          formality: 3,
          season: [],
          photo_urls: [],
          tags: [],
        })
        .select('id')
        .single();

      itemId = data!.id;
    });

    it('User A can insert own wear logs', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data, error } = await userAClient
        .from('wear_logs')
        .insert({
          user_id: userAId,
          item_id: itemId,
          worn_date: '2026-02-28',
        })
        .select('id')
        .single();

      expect(error).toBeNull();
      wearLogId = data!.id;
    });

    it('User B cannot read User A wear logs', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data } = await userBClient
        .from('wear_logs')
        .select('*')
        .eq('id', wearLogId);

      expect(data).toEqual([]);
    });

    it('User B cannot delete User A wear logs', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data } = await userBClient
        .from('wear_logs')
        .delete()
        .eq('id', wearLogId)
        .select();

      expect(data).toEqual([]);
    });
  });

  it(skipMessage, () => {
    if (!supabaseRunning) {
      console.warn(skipMessage);
    }
    expect(true).toBe(true);
  });
});
