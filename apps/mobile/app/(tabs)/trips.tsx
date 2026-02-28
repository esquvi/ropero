import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
}

export default function TripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = useCallback(async () => {
    const { data, error } = await (supabase.from('trips') as ReturnType<typeof supabase.from>)
      .select('id, name, destination, start_date, end_date, trip_type')
      .order('start_date', { ascending: false });

    if (!error && data) {
      setTrips(data as unknown as Trip[]);
    }
  }, []);

  useEffect(() => {
    fetchTrips().finally(() => setLoading(false));
  }, [fetchTrips]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTrips();
    setRefreshing(false);
  }, [fetchTrips]);

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={trips.length === 0 ? styles.centered : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="airplane-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptySubtitle}>
              Create trips on the web app to see them here.
            </Text>
          </View>
        }
        renderItem={({ item: trip }) => (
          <TouchableOpacity
            style={styles.tripCard}
            onPress={() => router.push(`/trips/${trip.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.tripHeader}>
              <Text style={styles.tripName}>{trip.name}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{trip.trip_type}</Text>
              </View>
            </View>
            <View style={styles.tripInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text style={styles.infoText}>{trip.destination}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                <Text style={styles.infoText}>
                  {formatDateRange(trip.start_date, trip.end_date)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, gap: 12 },
  empty: { alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8 },
  tripCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripName: { fontSize: 16, fontWeight: '600', color: '#111', flex: 1 },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  typeText: { fontSize: 11, color: '#374151', textTransform: 'capitalize' },
  tripInfo: { gap: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, color: '#6b7280' },
});
