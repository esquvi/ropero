import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Palette, Share2 } from 'lucide-react';
import { ProfileForm } from '@/components/profile/profile-form';
import { ThemeSelector } from '@/components/profile/theme-selector';
import { InviteSection } from '@/components/profile/invite-section';
import { SignOutButton } from '@/components/profile/sign-out-button';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const name = (user.user_metadata?.name as string) || '';
  const email = user.email || '';

  // Fetch invite code — create one if missing (for users created before the invite system)
  let { data: inviteCode } = await (supabase.from('invite_codes') as any)
    .select('id, code, max_uses, times_used')
    .eq('user_id', user.id)
    .single();

  if (!inviteCode) {
    const { data: newCode } = await (supabase.rpc as any)('generate_invite_code');
    if (newCode) {
      const { data: inserted } = await (supabase.from('invite_codes') as any)
        .insert({ user_id: user.id, code: newCode })
        .select('id, code, max_uses, times_used')
        .single();
      if (inserted) inviteCode = inserted;
    }
  }

  let redemptions: any[] = [];
  if (inviteCode) {
    const { data } = await (supabase.from('invite_redemptions') as any)
      .select('id, created_at, redeemed_by')
      .eq('invite_code_id', inviteCode.id)
      .order('created_at', { ascending: false });

    if (data) {
      redemptions = data.map((r: any) => ({
        id: r.id,
        created_at: r.created_at,
        redeemed_by_email: null,
        redeemed_by_name: null,
      }));
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm name={name} email={email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      {inviteCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Invite Friends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InviteSection
              code={inviteCode.code}
              maxUses={inviteCode.max_uses}
              timesUsed={inviteCode.times_used}
              redemptions={redemptions}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
