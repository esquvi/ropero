import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/auth';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>
        Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}
      </Text>
      <Text style={styles.subtitle}>Your wardrobe at a glance</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Stats</Text>
        <Text style={styles.placeholder}>
          Item counts, recent activity, and upcoming trips will appear here.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        <Text style={styles.placeholder}>
          Your latest wear logs will show here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 8 },
  placeholder: { fontSize: 14, color: '#9ca3af' },
});
