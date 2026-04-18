import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';

interface ProfileFormProps {
  initialName: string;
  email: string;
}

export function ProfileForm({ initialName, email }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const dirty = name.trim() !== initialName.trim();

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { name: name.trim() },
    });
    if (error) {
      setSaving(false);
      Alert.alert('Error', 'Failed to update name');
      return;
    }
    // Refresh so the session user carries the new metadata immediately.
    // Without this, consumers like the home greeting (which reads
    // user.user_metadata.name from the AuthContext) keep showing the old
    // value until the next sign in.
    await supabase.auth.refreshSession();
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#9ca3af"
            autoCapitalize="words"
          />
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!dirty || saving) && styles.saveButtonDisabled,
            ]}
            disabled={!dirty || saving}
            onPress={handleSave}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveText}>
                {savedFlash ? 'Saved' : 'Save'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.readOnly}>{email}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111',
  },
  saveButton: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 72,
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  readOnly: {
    fontSize: 15,
    color: '#374151',
    paddingVertical: 10,
  },
});
