/**
 * Invite System RLS and RPC Integration Tests
 *
 * Covers the two privilege-escalation fixes shipped as PRs #30 and #31:
 *   - redeem_invite_code no longer trusts a caller-supplied redeemer_id;
 *     it reads auth.uid() internally. (migration 00008)
 *   - The permissive "Anyone can validate invite codes" SELECT policy on
 *     invite_codes was dropped in favor of a targeted validate_invite_code
 *     RPC that returns only yes/no/usage. (migration 00009)
 *
 * These tests are written so they would FAIL on the pre-fix schema and PASS
 * on the post-fix schema, to catch regressions.
 *
 * Mirrors the skip-when-unreachable pattern in rls.test.ts so the suite is
 * a no-op in sandboxes without a running local Supabase instance.
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

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let userAClient: SupabaseClient;
let userBClient: SupabaseClient;
let userAId: string;
let userBId: string;

// Unique per-suite seed code so repeated test runs do not collide on
// invite_codes.code's UNIQUE constraint. We seed a fresh redemption target
// for the RPC test below.
const seedCode = `TEST${Date.now().toString(36).toUpperCase()}`.slice(0, 12);
let seedCodeId: string | undefined;

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

describe('Invite System RLS and RPC', () => {
  let supabaseRunning = false;

  beforeAll(async () => {
    supabaseRunning = await isSupabaseRunning();
    if (!supabaseRunning) return;

    const emailA = `invite-rls-a-${Date.now()}@test.local`;
    const emailB = `invite-rls-b-${Date.now()}@test.local`;
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

    const signInA = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const signInB = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: sessionA } = await signInA.auth.signInWithPassword({
      email: emailA,
      password,
    });
    const { data: sessionB } = await signInB.auth.signInWithPassword({
      email: emailB,
      password,
    });

    userAClient = createAuthenticatedClient(sessionA.session!.access_token);
    userBClient = createAuthenticatedClient(sessionB.session!.access_token);

    // Seed a dedicated, unowned invite code for the redemption test. Unowned
    // (user_id NULL) so it's visible to User A via the owner policy's
    // `user_id IS NULL` clause, matching how the ROPERO01 founder code works.
    const { data: seeded } = await (admin as any)
      .from('invite_codes')
      .insert({ code: seedCode, max_uses: 5, user_id: null })
      .select('id')
      .single();
    seedCodeId = seeded?.id;
  });

  afterAll(async () => {
    if (!supabaseRunning) return;

    // Clean up seeded redemptions + code, then users (cascade covers
    // trigger-created codes for A and B).
    if (seedCodeId) {
      await (admin as any).from('invite_redemptions').delete().eq('invite_code_id', seedCodeId);
      await (admin as any).from('invite_codes').delete().eq('id', seedCodeId);
    }
    await admin.auth.admin.deleteUser(userAId);
    await admin.auth.admin.deleteUser(userBId);
  });

  describe('invite_codes SELECT policy', () => {
    it('User A can read own invite code(s)', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      // The signup trigger should have created a code owned by User A.
      const { data, error } = await userAClient
        .from('invite_codes')
        .select('*')
        .eq('user_id', userAId);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect((data ?? []).length).toBeGreaterThanOrEqual(1);
    });

    it('User B cannot enumerate User A invite codes', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      // Directly targeting User A's user_id: the owner policy should reject.
      const { data: targetedData } = await userBClient
        .from('invite_codes')
        .select('*')
        .eq('user_id', userAId);

      expect(targetedData).toEqual([]);

      // Broad enumeration: User B should only ever see rows they own
      // (plus unowned rows like the founder seed). Never User A's rows.
      const { data: broadData, error } = await userBClient.from('invite_codes').select('*');

      expect(error).toBeNull();
      const leakedUserARows = (broadData ?? []).filter(
        (row: { user_id: string | null }) => row.user_id === userAId,
      );
      expect(leakedUserARows).toEqual([]);
    });

    it('anon cannot read invite_codes directly', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      // After migration 00009 no policy matches the anon role on SELECT,
      // so the query must return zero rows even for the founder seed.
      const { data, error } = await anonClient.from('invite_codes').select('*');

      expect(error).toBeNull();
      expect(data ?? []).toEqual([]);
    });
  });

  describe('redeem_invite_code identity assertion', () => {
    it('rejects the old caller-supplied redeemer_id signature', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      // Pre-fix signature was redeem_invite_code(text, uuid). If anyone
      // reintroduces it we want this to fail loudly. PostgREST returns
      // PGRST202 ("Could not find the function ... in the schema cache")
      // when no overload matches the supplied arguments.
      const { data, error } = await (userAClient.rpc as any)('redeem_invite_code', {
        invite_code: seedCode,
        redeemer_id: userBId,
      });

      expect(error).not.toBeNull();
      expect(error?.code).toBe('PGRST202');
      expect(data).toBeNull();
    });

    it('records redemption under auth.uid() of the caller, not a supplied id', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);
      if (!seedCodeId) {
        throw new Error('seed code not created in beforeAll');
      }

      const { data, error } = await (userAClient.rpc as any)('redeem_invite_code', {
        invite_code: seedCode,
      });

      expect(error).toBeNull();
      expect(data).toMatchObject({ success: true });

      // Verify via admin that the redemption row was written with User A's id.
      const { data: redemptions } = await (admin as any)
        .from('invite_redemptions')
        .select('redeemed_by, invite_code_id')
        .eq('invite_code_id', seedCodeId);

      expect(redemptions ?? []).toHaveLength(1);
      expect(redemptions![0].redeemed_by).toBe(userAId);
    });
  });

  describe('validate_invite_code access', () => {
    it('anon can validate the founder code and sees only aggregate fields', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data, error } = await (anonClient.rpc as any)('validate_invite_code', {
        p_code: 'ROPERO01',
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.valid).toBe(true);
      expect(typeof data.times_used).toBe('number');
      expect(typeof data.max_uses).toBe('number');
      expect(data.max_uses).toBeGreaterThanOrEqual(data.times_used);

      // Must not leak identifying fields from invite_codes.
      expect(data).not.toHaveProperty('id');
      expect(data).not.toHaveProperty('user_id');
      expect(data).not.toHaveProperty('code');
    });

    it('anon gets valid=false for a non-existent code without leaking row data', async () => {
      if (!supabaseRunning) return expect(true).toBe(true);

      const { data, error } = await (anonClient.rpc as any)('validate_invite_code', {
        p_code: 'NOTREAL1',
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.valid).toBe(false);
      expect(data).not.toHaveProperty('id');
      expect(data).not.toHaveProperty('user_id');
      expect(data).not.toHaveProperty('code');
    });
  });

  describe('invite_redemptions cross-user isolation', () => {
    it("User B cannot read User A's redemption row", async () => {
      if (!supabaseRunning) return expect(true).toBe(true);
      if (!seedCodeId) {
        throw new Error('seed code not created in beforeAll');
      }

      // Sanity: admin sees the redemption written by the test above.
      const { data: adminView } = await (admin as any)
        .from('invite_redemptions')
        .select('id, redeemed_by')
        .eq('invite_code_id', seedCodeId);
      expect((adminView ?? []).length).toBeGreaterThanOrEqual(1);

      // User B must not see it: the SELECT policy restricts to redemptions
      // whose invite_code_id belongs to the caller's own codes.
      const { data: userBView } = await userBClient
        .from('invite_redemptions')
        .select('*')
        .eq('invite_code_id', seedCodeId);

      expect(userBView ?? []).toEqual([]);
    });
  });

  it(skipMessage, () => {
    if (!supabaseRunning) {
      console.warn(skipMessage);
    }
    expect(true).toBe(true);
  });
});
