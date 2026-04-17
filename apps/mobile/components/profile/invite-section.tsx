import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export interface Redemption {
  id: string;
  created_at: string;
}

interface InviteSectionProps {
  code: string;
  maxUses: number;
  timesUsed: number;
  redemptions: Redemption[];
}

export function InviteSection({
  code,
  maxUses,
  timesUsed,
  redemptions,
}: InviteSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const remaining = Math.max(0, maxUses - timesUsed);

  return (
    <View style={styles.container}>
      <View style={styles.codeRow}>
        <View style={styles.codeBox}>
          <Text style={styles.code}>{code}</Text>
        </View>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={18}
            color="#111"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.usage}>
        {timesUsed} of {maxUses} invites used · {remaining} remaining
      </Text>

      {redemptions.length > 0 && (
        <View style={styles.redemptions}>
          <Text style={styles.redemptionsTitle}>Invited friends</Text>
          {redemptions.map((r) => (
            <View key={r.id} style={styles.redemptionRow}>
              <Text style={styles.redemptionLabel}>Joined via your code</Text>
              <Text style={styles.redemptionDate}>
                {new Date(r.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  code: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#111',
    fontVariant: ['tabular-nums'],
  },
  copyButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usage: { fontSize: 13, color: '#6b7280' },
  redemptions: { gap: 6, marginTop: 4 },
  redemptionsTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  redemptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  redemptionLabel: { fontSize: 13, color: '#374151' },
  redemptionDate: { fontSize: 12, color: '#9ca3af' },
});
