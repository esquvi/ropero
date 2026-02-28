import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/auth';

interface Stats {
  totalItems: number;
  totalOutfits: number;
  upcomingTrips: number;
}

interface WearLog {
  id: string;
  worn_date: string;
  occasion: string | null;
  items: { name: string };
}

interface Outfit {
  id: string;
  name: string;
  occasion: string | null;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalItems: 0, totalOutfits: 0, upcomingTrips: 0 });
  const [wearLogs, setWearLogs] = useState<WearLog[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];

    const [itemsRes, outfitsRes, tripsRes, logsRes, outfitListRes] = await Promise.all([
      (supabase.from('items') as ReturnType<typeof supabase.from>)
        .select('*', { count: 'exact', head: true }).eq('status', 'active'),
      (supabase.from('outfits') as ReturnType<typeof supabase.from>)
        .select('*', { count: 'exact', head: true }),
      (supabase.from('trips') as ReturnType<typeof supabase.from>)
        .select('*', { count: 'exact', head: true }).gte('start_date', today),
      (supabase.from('wear_logs') as ReturnType<typeof supabase.from>)
        .select('id, worn_date, occasion, items(name)')
        .order('worn_date', { ascending: false }).limit(5),
      (supabase.from('outfits') as ReturnType<typeof supabase.from>)
        .select('id, name, occasion')
        .order('created_at', { ascending: false }).limit(5),
    ]);

    setStats({
      totalItems: itemsRes.count ?? 0,
      totalOutfits: outfitsRes.count ?? 0,
      upcomingTrips: tripsRes.count ?? 0,
    });
    if (logsRes.data) setWearLogs(logsRes.data as unknown as WearLog[]);
    if (outfitListRes.data) setOutfits(outfitListRes.data as unknown as Outfit[]);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>
        Hey{user?.email ? `, ${user.email.split('@')[0]}` : ''}
      </Text>
      <Text style={styles.subtitle}>Your wardrobe at a glance</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/wardrobe')}>
          <Ionicons name="shirt-outline" size={24} color="#111" />
          <Text style={styles.statValue}>{stats.totalItems}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </TouchableOpacity>
        <View style={styles.statCard}>
          <Ionicons name="layers-outline" size={24} color="#111" />
          <Text style={styles.statValue}>{stats.totalOutfits}</Text>
          <Text style={styles.statLabel}>Outfits</Text>
        </View>
        <TouchableOpacity style={styles.statCard} onPress={() => router.push('/(tabs)/trips')}>
          <Ionicons name="airplane-outline" size={24} color="#111" />
          <Text style={styles.statValue}>{stats.upcomingTrips}</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Wear Logs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {wearLogs.length > 0 ? (
          wearLogs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <View style={styles.logInfo}>
                <Text style={styles.logItem}>Wore {log.items.name}</Text>
                {log.occasion && (
                  <Text style={styles.logOccasion}>{log.occasion}</Text>
                )}
              </View>
              <Text style={styles.logDate}>{formatDate(log.worn_date)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent activity</Text>
        )}
      </View>

      {/* Saved Outfits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Outfits</Text>
        {outfits.length > 0 ? (
          outfits.map((outfit) => (
            <View key={outfit.id} style={styles.outfitRow}>
              <Ionicons name="layers-outline" size={18} color="#6b7280" />
              <Text style={styles.outfitName}>{outfit.name}</Text>
              {outfit.occasion && (
                <Text style={styles.outfitOccasion}>{outfit.occasion}</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No outfits saved yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: '#111' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 12 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  logInfo: { flex: 1 },
  logItem: { fontSize: 14, color: '#111' },
  logOccasion: { fontSize: 12, color: '#6b7280', textTransform: 'capitalize' },
  logDate: { fontSize: 12, color: '#9ca3af' },
  outfitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  outfitName: { flex: 1, fontSize: 14, color: '#111' },
  outfitOccasion: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'capitalize',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  emptyText: { fontSize: 14, color: '#9ca3af' },
});
