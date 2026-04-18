import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redeem invite code if present in user metadata
      const { data: { user } } = await supabase.auth.getUser();
      const inviteCode = user?.user_metadata?.invite_code;

      if (inviteCode && user) {
        // The redeem_invite_code RPC derives the redeemer from auth.uid()
        // server-side, so we do not (and must not) pass a user id here.
        await (
          supabase.rpc as unknown as (
            fn: 'redeem_invite_code',
            args: { invite_code: string },
          ) => Promise<unknown>
        )('redeem_invite_code', {
          invite_code: inviteCode,
        });
        // Clear invite_code from metadata after redemption
        await supabase.auth.updateUser({
          data: { invite_code: null },
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
