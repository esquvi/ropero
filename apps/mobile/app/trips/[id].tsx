import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
  notes: string | null;
}

interface PackingItem {
  item_id: string;
  packed: boolean;
  item_name: string;
  item_category: string;
}

interface PackingList {
  id: string;
  status: string;
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [packingList, setPackingList] = useState<PackingList | null>(null);
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingItems, setTogglingItems] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    if (!id) return;

    // Fetch trip
    const { data: tripData } = await (supabase.from('trips') as ReturnType<typeof supabase.from>)
      .select('*')
      .eq('id', id)
      .single();

    if (tripData) setTrip(tripData as unknown as Trip);

    // Fetch packing list with items
    const { data: plData } = await (supabase.from('packing_lists') as ReturnType<typeof supabase.from>)
      .select('id, status, packing_list_items(item_id, packed, items(name, category))')
      .eq('trip_id', id)
      .single();

    if (plData) {
      const pl = plData as unknown as {
        id: string;
        status: string;
        packing_list_items: Array<{
          item_id: string;
          packed: boolean;
          items: { name: string; category: string };
        }>;
      };
      setPackingList({ id: pl.id, status: pl.status });
      setPackingItems(
        (pl.packing_list_items ?? []).map((pli) => ({
          item_id: pli.item_id,
          packed: pli.packed,
          item_name: pli.items.name,
          item_category: pli.items.category,
        }))
      );
    }
  }, [id]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const togglePacked = async (itemId: string, currentPacked: boolean) => {
    if (!packingList) return;

    setTogglingItems((prev) => new Set(prev).add(itemId));

    // Optimistic update
    setPackingItems((prev) =>
      prev.map((pi) =>
        pi.item_id === itemId ? { ...pi, packed: !currentPacked } : pi
      )
    );

    const { error } = await (supabase.from('packing_list_items') as ReturnType<typeof supabase.from>)
      .update({ packed: !currentPacked })
      .eq('packing_list_id', packingList.id)
      .eq('item_id', itemId);

    if (error) {
      // Revert on failure
      setPackingItems((prev) =>
        prev.map((pi) =>
          pi.item_id === itemId ? { ...pi, packed: currentPacked } : pi
        )
      );
    }

    setTogglingItems((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Trip not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const packedCount = packingItems.filter((pi) => pi.packed).length;
  const totalCount = packingItems.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const duration =
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Group packing items by category
  const byCategory: Record<string, PackingItem[]> = {};
  for (const pi of packingItems) {
    if (!byCategory[pi.item_category]) byCategory[pi.item_category] = [];
    byCategory[pi.item_category].push(pi);
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.tripName}>{trip.name}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text style={styles.infoText}>{trip.destination}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text style={styles.infoText}>
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
              {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' '}({duration} {duration === 1 ? 'day' : 'days'})
            </Text>
          </View>
        </View>
      </View>

      {/* Packing Progress */}
      {totalCount > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Packing List</Text>
            <Text style={styles.progressText}>
              {packedCount}/{totalCount} packed
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      )}

      {/* Packing Items by Category */}
      <View style={styles.packingContent}>
        {Object.entries(byCategory).map(([category, items]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>
              {category} ({items.filter((i) => i.packed).length}/{items.length})
            </Text>
            {items.map((pi) => (
              <TouchableOpacity
                key={pi.item_id}
                style={[styles.packingRow, pi.packed && styles.packingRowPacked]}
                onPress={() => togglePacked(pi.item_id, pi.packed)}
                disabled={togglingItems.has(pi.item_id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={pi.packed ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={pi.packed ? '#22c55e' : '#9ca3af'}
                />
                <Text
                  style={[styles.itemName, pi.packed && styles.itemNamePacked]}
                >
                  {pi.item_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {totalCount === 0 && (
          <View style={styles.emptyPacking}>
            <Ionicons name="cube-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No packing list yet</Text>
            <Text style={styles.emptySubtext}>
              Add items to your packing list on the web app.
            </Text>
          </View>
        )}
      </View>

      {trip.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{trip.notes}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#6b7280', marginBottom: 12 },
  linkText: { fontSize: 16, color: '#111', fontWeight: '600', textDecorationLine: 'underline' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
    gap: 12,
  },
  backBtn: { marginTop: 2 },
  headerText: { flex: 1, gap: 4 },
  tripName: { fontSize: 22, fontWeight: '700', color: '#111' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 13, color: '#6b7280' },
  progressSection: { paddingHorizontal: 20, marginBottom: 20 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  progressText: { fontSize: 13, color: '#6b7280' },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  packingContent: { paddingHorizontal: 20, paddingBottom: 20 },
  categorySection: { marginBottom: 20 },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  packingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  packingRowPacked: { backgroundColor: '#f0fdf4' },
  itemName: { fontSize: 15, color: '#111', flex: 1 },
  itemNamePacked: { color: '#6b7280', textDecorationLine: 'line-through' },
  emptyPacking: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#111', marginTop: 12 },
  emptySubtext: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  notesSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  notes: { fontSize: 14, color: '#374151', lineHeight: 20, marginTop: 8 },
});
