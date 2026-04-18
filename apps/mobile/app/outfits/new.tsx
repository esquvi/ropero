import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OCCASIONS } from '@ropero/core';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/auth';

interface WardrobeItem {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  color_primary: string;
  photo_urls: string[];
}

interface ExistingOutfit {
  id: string;
  name: string;
  occasion: string | null;
  rating: number | null;
  notes: string | null;
  tags: string[] | null;
  outfit_items: Array<{ item_id: string }> | null;
}

export default function OutfitFormScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ editId?: string }>();
  const editId = params.editId ?? null;
  const isEditing = editId !== null;

  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      // Always fetch wardrobe items so the picker has something to show.
      const itemsPromise = (
        supabase.from('items') as ReturnType<typeof supabase.from>
      )
        .select('id, name, brand, category, color_primary, photo_urls')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // In edit mode, also fetch the existing outfit and its current items.
      const outfitPromise = isEditing
        ? (supabase.from('outfits') as ReturnType<typeof supabase.from>)
            .select(
              'id, name, occasion, rating, notes, tags, outfit_items(item_id)',
            )
            .eq('id', editId!)
            .single()
        : Promise.resolve({ data: null });

      const [itemsRes, outfitRes] = await Promise.all([
        itemsPromise,
        outfitPromise,
      ]);

      setItems((itemsRes.data as unknown as WardrobeItem[] | null) ?? []);

      const existing = outfitRes.data as unknown as ExistingOutfit | null;
      if (existing) {
        setName(existing.name);
        setOccasion(existing.occasion);
        setRating(existing.rating ?? 0);
        setNotes(existing.notes ?? '');
        setTags(existing.tags ?? []);
        setSelected(
          new Set((existing.outfit_items ?? []).map((row) => row.item_id)),
        );
      }

      setLoading(false);
    })();
  }, [editId, isEditing]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      const matchesSearch =
        q === '' ||
        it.name.toLowerCase().includes(q) ||
        (it.brand?.toLowerCase().includes(q) ?? false);
      const matchesCategory =
        categoryFilter === 'all' || it.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const selectedItems = useMemo(
    () => items.filter((it) => selected.has(it.id)),
    [items, selected],
  );

  const toggleItem = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) {
      setTagInput('');
      return;
    }
    setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const canSave = name.trim().length > 0 && selected.size > 0 && !saving;

  const handleSave = async () => {
    if (!user || !canSave) return;
    setSaving(true);

    const payload = {
      name: name.trim(),
      occasion,
      rating: rating || null,
      notes: notes.trim() || null,
      tags,
    };

    let outfitId: string;

    if (isEditing && editId) {
      const { error: updateError } = await (
        supabase.from('outfits') as ReturnType<typeof supabase.from>
      )
        .update(payload)
        .eq('id', editId);

      if (updateError) {
        setSaving(false);
        Alert.alert('Error', 'Failed to save outfit');
        return;
      }
      outfitId = editId;

      // Replace the item set: delete all existing outfit_items and reinsert.
      // Not transactional, but acceptable for now; on partial failure the
      // outfit may end up empty until the user retries.
      const { error: deleteError } = await (
        supabase.from('outfit_items') as ReturnType<typeof supabase.from>
      )
        .delete()
        .eq('outfit_id', outfitId);

      if (deleteError) {
        setSaving(false);
        Alert.alert('Error', 'Failed to update outfit items');
        return;
      }
    } else {
      const { data: outfit, error: outfitError } = await (
        supabase.from('outfits') as ReturnType<typeof supabase.from>
      )
        .insert({ user_id: user.id, ...payload })
        .select('id')
        .single();

      if (outfitError || !outfit) {
        setSaving(false);
        Alert.alert('Error', 'Failed to create outfit');
        return;
      }
      outfitId = (outfit as unknown as { id: string }).id;
    }

    const rows = Array.from(selected).map((itemId) => ({
      outfit_id: outfitId,
      item_id: itemId,
    }));
    const { error: itemsError } = await (
      supabase.from('outfit_items') as ReturnType<typeof supabase.from>
    ).insert(rows);

    setSaving(false);

    if (itemsError) {
      Alert.alert(
        'Partial success',
        isEditing
          ? 'Outfit saved but items could not be attached.'
          : 'Outfit saved but items could not be attached.',
      );
    }

    if (isEditing) {
      // Replace so the detail screen remounts and picks up the new data
      // instead of going back to a stale render.
      router.replace(`/outfits/${outfitId}`);
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="close" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{isEditing ? 'Edit Outfit' : 'Create Outfit'}</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Selected items canvas */}
        <Text style={styles.sectionLabel}>
          Outfit ({selected.size} {selected.size === 1 ? 'item' : 'items'})
        </Text>
        {selectedItems.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.canvasRow}
          >
            {selectedItems.map((it) => (
              <View key={it.id} style={styles.canvasTile}>
                {it.photo_urls.length > 0 ? (
                  <Image
                    source={{ uri: it.photo_urls[0] }}
                    style={styles.canvasImage}
                  />
                ) : (
                  <View style={[styles.canvasImage, styles.canvasPlaceholder]}>
                    <Ionicons name="shirt-outline" size={24} color="#9ca3af" />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeBadge}
                  onPress={() => toggleItem(it.id)}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.canvasEmpty}>
            <Text style={styles.canvasEmptyText}>
              Tap items below to add them
            </Text>
          </View>
        )}

        {/* Item picker */}
        <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Items</Text>
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search"
            size={16}
            color="#9ca3af"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search items..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              categoryFilter === 'all' && styles.chipActive,
            ]}
            onPress={() => setCategoryFilter('all')}
          >
            <Text
              style={[
                styles.chipText,
                categoryFilter === 'all' && styles.chipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, categoryFilter === c && styles.chipActive]}
              onPress={() => setCategoryFilter(c)}
            >
              <Text
                style={[
                  styles.chipText,
                  categoryFilter === c && styles.chipTextActive,
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 32 }} />
        ) : filteredItems.length === 0 ? (
          <Text style={styles.emptyText}>
            {items.length === 0
              ? 'Your wardrobe is empty. Add items first.'
              : 'No items match your filters'}
          </Text>
        ) : (
          <View style={styles.grid}>
            {filteredItems.map((it) => {
              const isSelected = selected.has(it.id);
              return (
                <TouchableOpacity
                  key={it.id}
                  style={[
                    styles.gridTile,
                    isSelected && styles.gridTileSelected,
                  ]}
                  onPress={() => toggleItem(it.id)}
                  activeOpacity={0.7}
                >
                  {it.photo_urls.length > 0 ? (
                    <Image
                      source={{ uri: it.photo_urls[0] }}
                      style={styles.gridImage}
                    />
                  ) : (
                    <View style={[styles.gridImage, styles.gridPlaceholder]}>
                      <Ionicons
                        name="shirt-outline"
                        size={28}
                        color="#9ca3af"
                      />
                    </View>
                  )}
                  {isSelected && (
                    <View style={styles.selectedOverlay}>
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    </View>
                  )}
                  <View style={styles.gridCaption}>
                    <Text style={styles.gridCaptionText} numberOfLines={1}>
                      {it.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Details */}
        <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Details</Text>

        <Text style={styles.fieldLabel}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Summer Casual Look"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.fieldLabel}>
          Occasion <Text style={styles.optional}>(optional)</Text>
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {OCCASIONS.map((occ) => (
            <TouchableOpacity
              key={occ}
              style={[styles.chip, occasion === occ && styles.chipActive]}
              onPress={() =>
                setOccasion((cur) => (cur === occ ? null : occ))
              }
            >
              <Text
                style={[
                  styles.chipText,
                  occasion === occ && styles.chipTextActive,
                ]}
              >
                {occ}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.fieldLabel}>
          Rating <Text style={styles.optional}>(optional)</Text>
        </Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setRating(rating === s ? 0 : s)}
              hitSlop={8}
            >
              <Ionicons
                name={s <= rating ? 'star' : 'star-outline'}
                size={28}
                color={s <= rating ? '#f59e0b' : '#d1d5db'}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>
          Notes <Text style={styles.optional}>(optional)</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any notes about this outfit..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.fieldLabel}>
          Tags <Text style={styles.optional}>(optional)</Text>
        </Text>
        <View style={styles.tagInputRow}>
          <TextInput
            style={[styles.input, styles.tagInput]}
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Add a tag..."
            placeholderTextColor="#9ca3af"
            onSubmitEditing={addTag}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[
              styles.tagAddButton,
              !tagInput.trim() && styles.tagAddButtonDisabled,
            ]}
            onPress={addTag}
            disabled={!tagInput.trim()}
          >
            <Text style={styles.tagAddText}>Add</Text>
          </TouchableOpacity>
        </View>
        {tags.length > 0 && (
          <View style={styles.tagList}>
            {tags.map((t) => (
              <View key={t} style={styles.tagPill}>
                <Text style={styles.tagPillText}>{t}</Text>
                <TouchableOpacity onPress={() => removeTag(t)} hitSlop={6}>
                  <Ionicons name="close" size={14} color="#6b7280" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveText}>{isEditing ? 'Save Changes' : 'Save Outfit'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  topTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  iconButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 32 },

  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 10 },
  sectionSpacing: { marginTop: 24 },

  canvasRow: { gap: 10, paddingRight: 20 },
  canvasTile: {
    width: 80,
    height: 80,
    borderRadius: 8,
    position: 'relative',
  },
  canvasImage: { width: 80, height: 80, borderRadius: 8 },
  canvasPlaceholder: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasEmpty: {
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasEmptyText: { fontSize: 13, color: '#9ca3af' },

  searchWrapper: { position: 'relative', marginBottom: 10 },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 10,
    paddingLeft: 34,
    paddingRight: 12,
    fontSize: 15,
    color: '#111',
  },
  categoryRow: { gap: 8, paddingRight: 20, marginBottom: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { fontSize: 13, color: '#374151', textTransform: 'capitalize' },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridTile: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gridTileSelected: { borderColor: '#111' },
  gridImage: { width: '100%', height: '100%' },
  gridPlaceholder: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,17,17,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCaption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  gridCaptionText: { fontSize: 11, color: '#fff' },

  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 24,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  optional: { fontWeight: '400', color: '#9ca3af' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111',
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },

  starRow: { flexDirection: 'row', gap: 6 },

  tagInputRow: { flexDirection: 'row', gap: 8 },
  tagInput: { flex: 1 },
  tagAddButton: {
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagAddButtonDisabled: { opacity: 0.4 },
  tagAddText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagPillText: { fontSize: 13, color: '#374151' },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
