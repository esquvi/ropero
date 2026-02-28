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
import { ItemCard } from '../../components/item-card';
import { ITEM_CATEGORIES } from '@ropero/core';

interface Item {
  id: string;
  name: string;
  category: string;
  photo_urls: string[];
  times_worn: number;
}

const ALL_FILTER = 'all';

export default function WardrobeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(ALL_FILTER);

  const fetchItems = useCallback(async () => {
    let query = (supabase.from('items') as ReturnType<typeof supabase.from>)
      .select('id, name, category, photo_urls, times_worn')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (selectedCategory !== ALL_FILTER) {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query;

    if (!error && data) {
      setItems(data as unknown as Item[]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setLoading(true);
    fetchItems().finally(() => setLoading(false));
  }, [fetchItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  }, [fetchItems]);

  const handleItemPress = (id: string) => {
    router.push(`/wardrobe/${id}`);
  };

  const filters = [ALL_FILTER, ...ITEM_CATEGORIES];

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <FlatList
        horizontal
        data={filters}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        renderItem={({ item: category }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCategory === category && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === category && styles.filterTextActive,
              ]}
            >
              {category === ALL_FILTER ? 'All' : category}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Items grid */}
      {loading ? (
        <ActivityIndicator style={styles.loading} size="large" />
      ) : items.length > 0 ? (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.gridContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <ItemCard
              id={item.id}
              name={item.name}
              category={item.category}
              photoUrl={item.photo_urls[0] ?? null}
              timesWorn={item.times_worn}
              onPress={handleItemPress}
            />
          )}
        />
      ) : (
        <View style={styles.empty}>
          <Ionicons name="shirt-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No items yet</Text>
          <Text style={styles.emptySubtitle}>
            Add items from the + tab to build your wardrobe.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  filterContainer: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  filterText: {
    fontSize: 13,
    color: '#374151',
    textTransform: 'capitalize',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  gridContent: { paddingHorizontal: 8, paddingBottom: 20 },
  loading: { flex: 1, justifyContent: 'center' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8 },
});
