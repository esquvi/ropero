import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/auth';
import { supabase } from '../../lib/supabase';
import { ProfileForm } from '../../components/profile/profile-form';
import {
  InviteSection,
  Redemption,
} from '../../components/profile/invite-section';

interface InviteCode {
  id: string;
  code: string;
  max_uses: number;
  times_used: number;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const name = (user?.user_metadata?.name as string | undefined) ?? '';
  const email = user?.email ?? '';

  const fetchInviteData = useCallback(async () => {
    if (!user) return;

    // Fetch invite code; create one if missing (mirrors web profile page behavior)
    const { data: existing } = await (
      supabase.from('invite_codes') as ReturnType<typeof supabase.from>
    )
      .select('id, code, max_uses, times_used')
      .eq('user_id', user.id)
      .maybeSingle();

    let code = existing as unknown as InviteCode | null;

    if (!code) {
      const { data: generated } = await (
        supabase.rpc as unknown as (
          fn: 'generate_invite_code',
        ) => Promise<{ data: string | null }>
      )('generate_invite_code');

      if (generated) {
        const { data: inserted } = await (
          supabase.from('invite_codes') as ReturnType<typeof supabase.from>
        )
          .insert({ user_id: user.id, code: generated })
          .select('id, code, max_uses, times_used')
          .single();
        if (inserted) code = inserted as unknown as InviteCode;
      }
    }

    setInviteCode(code);

    if (code) {
      const { data } = await (
        supabase.from('invite_redemptions') as ReturnType<typeof supabase.from>
      )
        .select('id, created_at')
        .eq('invite_code_id', code.id)
        .order('created_at', { ascending: false });
      setRedemptions((data as unknown as Redemption[] | null) ?? []);
    } else {
      setRedemptions([]);
    }
  }, [user]);

  useEffect(() => {
    fetchInviteData().finally(() => setLoading(false));
  }, [fetchInviteData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInviteData();
    setRefreshing(false);
  }, [fetchInviteData]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color="#9ca3af" />
        </View>
        <Text style={styles.name}>{name || 'Add your name'}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <ProfileForm initialName={name} email={email} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Invite Friends</Text>
        {loading ? (
          <ActivityIndicator />
        ) : inviteCode ? (
          <InviteSection
            code={inviteCode.code}
            maxUses={inviteCode.max_uses}
            timesUsed={inviteCode.times_used}
            redemptions={redemptions}
          />
        ) : (
          <Text style={styles.muted}>
            No invite code yet — pull to refresh.
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: { fontSize: 18, fontWeight: '600', color: '#111' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#111' },
  muted: { fontSize: 14, color: '#9ca3af' },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  signOutText: { fontSize: 15, fontWeight: '500', color: '#ef4444' },
});
