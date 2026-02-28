import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ITEM_CATEGORIES, SEASONS } from '@ropero/core';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/auth';
import { CameraCapture } from '../../components/camera-capture';

export default function AddScreen() {
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('tops');
  const [colorPrimary, setColorPrimary] = useState('');
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [formality, setFormality] = useState(3);
  const [loading, setLoading] = useState(false);

  const toggleSeason = (season: string) => {
    setSelectedSeasons((prev) =>
      prev.includes(season) ? prev.filter((s) => s !== season) : [...prev, season]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for the item');
      return;
    }
    if (!colorPrimary.trim()) {
      Alert.alert('Error', 'Please enter the primary color');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    setLoading(true);
    try {
      let photoUrls: string[] = [];

      // Upload image if selected
      if (imageUri) {
        const fileName = `${user.id}/${Date.now()}.jpg`;
        const response = await fetch(imageUri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('item-photos')
          .upload(fileName, blob, { contentType: 'image/jpeg' });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('item-photos')
            .getPublicUrl(fileName);
          photoUrls = [urlData.publicUrl];
        }
      }

      const { error } = await (supabase.from('items') as ReturnType<typeof supabase.from>)
        .insert({
          user_id: user.id,
          name: name.trim(),
          category,
          color_primary: colorPrimary.trim(),
          season: selectedSeasons,
          formality,
          photo_urls: photoUrls,
          status: 'active',
          tags: [],
        });

      if (error) {
        Alert.alert('Error', 'Failed to add item');
        return;
      }

      Alert.alert('Success', 'Item added to your wardrobe!', [
        { text: 'OK', onPress: () => {
          // Reset form
          setName('');
          setCategory('tops');
          setColorPrimary('');
          setSelectedSeasons([]);
          setFormality(3);
          setImageUri(null);
          router.push('/(tabs)/wardrobe');
        }},
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Item</Text>

      {/* Camera / Gallery */}
      <CameraCapture
        imageUri={imageUri}
        onImageSelected={setImageUri}
        onImageRemoved={() => setImageUri(null)}
      />

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Blue Oxford Shirt"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {ITEM_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Primary Color *</Text>
          <TextInput
            style={styles.input}
            value={colorPrimary}
            onChangeText={setColorPrimary}
            placeholder="e.g. Navy Blue"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Seasons</Text>
          <View style={styles.chipRow}>
            {SEASONS.map((season) => (
              <TouchableOpacity
                key={season}
                style={[styles.chip, selectedSeasons.includes(season) && styles.chipActive]}
                onPress={() => toggleSeason(season)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedSeasons.includes(season) && styles.chipTextActive,
                  ]}
                >
                  {season}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Formality ({formality}/5)</Text>
          <View style={styles.formalityRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.formalityButton,
                  formality === level && styles.formalityActive,
                ]}
                onPress={() => setFormality(level)}
              >
                <Text
                  style={[
                    styles.formalityText,
                    formality === level && styles.formalityTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.formalityLabels}>
            <Text style={styles.formalityLabel}>Casual</Text>
            <Text style={styles.formalityLabel}>Formal</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Add to Wardrobe</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 20 },
  form: { marginTop: 20, gap: 20 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { fontSize: 13, color: '#374151', textTransform: 'capitalize' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  formalityRow: { flexDirection: 'row', gap: 8 },
  formalityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formalityActive: { backgroundColor: '#111', borderColor: '#111' },
  formalityText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  formalityTextActive: { color: '#fff' },
  formalityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  formalityLabel: { fontSize: 11, color: '#9ca3af' },
  submitButton: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
