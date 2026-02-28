import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WardrobeScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="shirt-outline" size={48} color="#9ca3af" />
      <Text style={styles.title}>Your Wardrobe</Text>
      <Text style={styles.subtitle}>
        Browse and manage your clothing items here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: '600', color: '#111', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 8 },
});
