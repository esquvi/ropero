import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ItemCardProps {
  id: string;
  name: string;
  category: string;
  photoUrl: string | null;
  timesWorn: number;
  onPress: (id: string) => void;
}

export function ItemCard({ id, name, category, photoUrl, timesWorn, onPress }: ItemCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(id)} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="shirt-outline" size={32} color="#9ca3af" />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.category}>{category}</Text>
        {timesWorn > 0 && (
          <Text style={styles.worn}>{timesWorn}x worn</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
  },
  category: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  worn: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
});
