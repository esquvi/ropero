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
import { LogWearSheet, LogWearValues } from '../../components/log-wear-sheet';

interface OutfitItem {
  id: string;
  name: string;
  category: string;
  photo_urls: string[];
}

interface Outfit {
  id: string;
  name: string;
  occasion: string | null;
  rating: number | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  items: OutfitItem[];
}

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loggingWear, setLoggingWear] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchOutfit = useCallback(async () => {
    if (!id) return;

    const { data } = await (
      supabase.from('outfits') as ReturnType<typeof supabase.from>
    )
      .select(
        `id, name, occasion, rating, notes, tags, created_at,
         outfit_items(items(id, name, category, photo_urls))`,
      )
      .eq('id', id)
      .single();

    if (!data) {
      setOutfit(null);
      return;
    }

    const raw = data as unknown as {
      id: string;
      name: string;
      occasion: string | null;
      rating: number | null;
      notes: string | null;
      tags: string[] | null;
      created_at: string;
      outfit_items:
        | Array<{ items: OutfitItem | null }>
        | null;
    };

    const items: OutfitItem[] = (raw.outfit_items ?? [])
      .map((row) => row.items)
      .filter((it): it is OutfitItem => it !== null);

    setOutfit({
      id: raw.id,
      name: raw.name,
      occasion: raw.occasion,
      rating: raw.rating,
      notes: raw.notes,
      tags: raw.tags ?? [],
      created_at: raw.created_at,
      items,
    });
  }, [id]);

  useEffect(() => {
    fetchOutfit().finally(() => setLoading(false));
  }, [fetchOutfit]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOutfit();
    setRefreshing(false);
  }, [fetchOutfit]);

  const handleWear = async (values: LogWearValues) => {
    if (!user || !outfit) return;

    if (outfit.items.length === 0) {
      Alert.alert('Empty outfit', 'This outfit has no items, so nothing to log.');
      setSheetOpen(false);
      return;
    }

    setLoggingWear(true);
    try {
      const rows = outfit.items.map((it) => ({
        user_id: user.id,
        item_id: it.id,
        outfit_id: outfit.id,
        worn_at: values.wornAt,
        occasion: values.occasion,
        notes: values.notes,
      }));

      const { error } = await (
        supabase.from('wear_logs') as ReturnType<typeof supabase.from>
      ).insert(rows);

      if (error) {
        Alert.alert('Error', 'Failed to log outfit wear');
        return;
      }
      setSheetOpen(false);
    } finally {
      setLoggingWear(false);
    }
  };

  const handleDelete = () => {
    if (!outfit) return;
    Alert.alert(
      'Delete outfit?',
      `Permanently delete "${outfit.name}". Individual items and wear history will not be affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const { error } = await (
              supabase.from('outfits') as ReturnType<typeof supabase.from>
            )
              .delete()
              .eq('id', outfit.id);
            setDeleting(false);
            if (error) {
              Alert.alert('Error', 'Failed to delete outfit');
              return;
            }
            router.back();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!outfit) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Outfit not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const heroPhotos = outfit.items
    .map((it) => it.photo_urls[0])
    .filter((u): u is string => !!u)
    .slice(0, 4);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {outfit.name}
        </Text>
        <View style={styles.iconButton} />
      </View>

      {/* Photo hero (2x2 grid or single for <4 items) */}
      <View style={styles.hero}>
        {heroPhotos.length > 0 ? (
          <View style={styles.heroGrid}>
            {heroPhotos.map((url, i) => (
              <View
                key={i}
                style={[
                  styles.heroTile,
                  heroPhotos.length === 1 && styles.heroTileFull,
                ]}
              >
                <Image source={{ uri: url }} style={styles.heroImage} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.heroPlaceholder}>
            <Ionicons name="layers-outline" size={48} color="#9ca3af" />
          </View>
        )}
      </View>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.metaStat}>
          <Text style={styles.metaValue}>{outfit.items.length}</Text>
          <Text style={styles.metaLabel}>
            {outfit.items.length === 1 ? 'Item' : 'Items'}
          </Text>
        </View>
        {outfit.rating != null && (
          <View style={styles.metaStat}>
            <Text style={styles.metaValue}>{outfit.rating}/5</Text>
            <Text style={styles.metaLabel}>Rating</Text>
          </View>
        )}
        {outfit.occasion && (
          <View style={styles.metaStat}>
            <Text style={[styles.metaValue, styles.metaValueSmall]}>
              {outfit.occasion}
            </Text>
            <Text style={styles.metaLabel}>Occasion</Text>
          </View>
        )}
      </View>

      {/* Primary actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.wearButton,
            outfit.items.length === 0 && styles.wearButtonDisabled,
          ]}
          onPress={() => setSheetOpen(true)}
          disabled={outfit.items.length === 0}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.wearButtonText}>Wear Outfit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/outfits/new?editId=${outfit.id}`)}
        >
          <Ionicons name="pencil" size={18} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Items */}
      <Text style={styles.sectionTitle}>Items</Text>
      {outfit.items.length > 0 ? (
        <View style={styles.itemGrid}>
          {outfit.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemTile}
              onPress={() => router.push(`/wardrobe/${item.id}`)}
            >
              {item.photo_urls[0] ? (
                <Image
                  source={{ uri: item.photo_urls[0] }}
                  style={styles.itemImage}
                />
              ) : (
                <View style={[styles.itemImage, styles.itemPlaceholder]}>
                  <Ionicons name="shirt-outline" size={24} color="#9ca3af" />
                </View>
              )}
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No items in this outfit</Text>
      )}

      {outfit.notes && (
        <>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{outfit.notes}</Text>
        </>
      )}

      {outfit.tags.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagRow}>
            {outfit.tags.map((t) => (
              <View key={t} style={styles.tagPill}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Destructive action */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        disabled={deleting}
      >
        {deleting ? (
          <ActivityIndicator color="#ef4444" size="small" />
        ) : (
          <>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Delete Outfit</Text>
          </>
        )}
      </TouchableOpacity>

      <LogWearSheet
        visible={sheetOpen}
        submitting={loggingWear}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleWear}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 40 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: { fontSize: 16, color: '#6b7280' },
  linkText: {
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  topTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hero: { aspectRatio: 1, backgroundColor: '#f3f4f6' },
  heroGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  heroTile: { width: '50%', height: '50%' },
  heroTileFull: { width: '100%', height: '100%' },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  metaRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  metaStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  metaValue: { fontSize: 18, fontWeight: '700', color: '#111' },
  metaValueSmall: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  metaLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  wearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 14,
  },
  wearButtonDisabled: { opacity: 0.4 },
  wearButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  editButton: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  itemTile: { width: '31.5%' },
  itemImage: { width: '100%', aspectRatio: 1, borderRadius: 8 },
  itemPlaceholder: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 12,
    color: '#111',
    fontWeight: '500',
    marginTop: 4,
  },
  itemCategory: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'capitalize',
  },

  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 20,
  },
  tagPill: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagText: { fontSize: 13, color: '#374151' },

  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    paddingHorizontal: 20,
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 32,
  },
  deleteButtonText: { color: '#ef4444', fontSize: 15, fontWeight: '500' },
});
