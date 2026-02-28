import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/auth';

interface ItemDetail {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  color_primary: string;
  color_secondary: string | null;
  pattern: string | null;
  size: string | null;
  material: string | null;
  season: string[];
  formality: number;
  photo_urls: string[];
  times_worn: number;
  last_worn_at: string | null;
  status: string;
  notes: string | null;
  purchase_price: number | null;
}

interface WearLog {
  id: string;
  worn_date: string;
  occasion: string | null;
}

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [wearLogs, setWearLogs] = useState<WearLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingWear, setLoggingWear] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;

    const [itemResult, logsResult] = await Promise.all([
      (supabase.from('items') as ReturnType<typeof supabase.from>)
        .select('*')
        .eq('id', id)
        .single(),
      (supabase.from('wear_logs') as ReturnType<typeof supabase.from>)
        .select('id, worn_date, occasion')
        .eq('item_id', id)
        .order('worn_date', { ascending: false })
        .limit(10),
    ]);

    if (itemResult.data) setItem(itemResult.data as unknown as ItemDetail);
    if (logsResult.data) setWearLogs(logsResult.data as unknown as WearLog[]);
  }, [id]);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleLogWear = async () => {
    if (!user || !id) return;

    setLoggingWear(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await (supabase.from('wear_logs') as ReturnType<typeof supabase.from>)
        .insert({
          user_id: user.id,
          item_id: id,
          worn_date: today,
        });

      if (error) {
        Alert.alert('Error', 'Failed to log wear');
      } else {
        Alert.alert('Logged!', 'Wear logged for today.');
        await fetchData();
      }
    } finally {
      setLoggingWear(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Item not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#111" />
      </TouchableOpacity>

      {/* Photo */}
      {item.photo_urls.length > 0 ? (
        <Image source={{ uri: item.photo_urls[0] }} style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Ionicons name="shirt-outline" size={64} color="#9ca3af" />
        </View>
      )}

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{item.name}</Text>
          {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.times_worn}</Text>
            <Text style={styles.statLabel}>Times Worn</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.formality}/5</Text>
            <Text style={styles.statLabel}>Formality</Text>
          </View>
          {item.purchase_price != null && (
            <View style={styles.stat}>
              <Text style={styles.statValue}>${item.purchase_price}</Text>
              <Text style={styles.statLabel}>Price</Text>
            </View>
          )}
        </View>

        {/* Log Wear button */}
        <TouchableOpacity
          style={styles.logWearButton}
          onPress={handleLogWear}
          disabled={loggingWear}
        >
          {loggingWear ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.logWearText}>Log Wear</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{item.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Color</Text>
            <Text style={styles.detailValue}>
              {item.color_primary}{item.color_secondary ? ` / ${item.color_secondary}` : ''}
            </Text>
          </View>
          {item.pattern && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pattern</Text>
              <Text style={styles.detailValue}>{item.pattern}</Text>
            </View>
          )}
          {item.size && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Size</Text>
              <Text style={styles.detailValue}>{item.size}</Text>
            </View>
          )}
          {item.material && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Material</Text>
              <Text style={styles.detailValue}>{item.material}</Text>
            </View>
          )}
          {item.season.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Seasons</Text>
              <Text style={styles.detailValue}>{item.season.join(', ')}</Text>
            </View>
          )}
        </View>

        {/* Wear History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wear History</Text>
          {wearLogs.length > 0 ? (
            wearLogs.map((log) => (
              <View key={log.id} style={styles.logRow}>
                <Text style={styles.logDate}>
                  {new Date(log.worn_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                {log.occasion && (
                  <Text style={styles.logOccasion}>{log.occasion}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No wear logs yet</Text>
          )}
        </View>

        {item.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{item.notes}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#6b7280', marginBottom: 12 },
  linkText: { fontSize: 16, color: '#111', fontWeight: '600', textDecorationLine: 'underline' },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: { width: '100%', aspectRatio: 1 },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 16 },
  name: { fontSize: 24, fontWeight: '700', color: '#111' },
  brand: { fontSize: 16, color: '#6b7280', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  logWearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 14,
    marginBottom: 24,
  },
  logWearText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  section: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 12 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: { fontSize: 14, color: '#6b7280' },
  detailValue: { fontSize: 14, color: '#111', fontWeight: '500', textTransform: 'capitalize' },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  logDate: { fontSize: 14, color: '#374151' },
  logOccasion: { fontSize: 12, color: '#6b7280', textTransform: 'capitalize' },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  notes: { fontSize: 14, color: '#374151', lineHeight: 20 },
});
