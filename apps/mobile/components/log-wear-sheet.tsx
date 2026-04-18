import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { OCCASIONS } from '@ropero/core';

type Preset = 'today' | 'yesterday' | '2d' | 'earlier';

export interface LogWearValues {
  wornAt: string;
  occasion: string | null;
  notes: string | null;
}

interface LogWearSheetProps {
  visible: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: LogWearValues) => void | Promise<void>;
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function LogWearSheet({
  visible,
  submitting,
  onClose,
  onSubmit,
}: LogWearSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);

  const [preset, setPreset] = useState<Preset>('today');
  const [daysBack, setDaysBack] = useState(3);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Sync the imperative sheet API with the declarative `visible` prop.
  useEffect(() => {
    if (visible) {
      setPreset('today');
      setDaysBack(3);
      setOccasion(null);
      setNotes('');
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const wornAt =
    preset === 'today'
      ? daysAgoISO(0)
      : preset === 'yesterday'
        ? daysAgoISO(1)
        : preset === '2d'
          ? daysAgoISO(2)
          : daysAgoISO(daysBack);

  const handleSubmit = () => {
    onSubmit({
      wornAt,
      occasion,
      notes: notes.trim() || null,
    });
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      enableDynamicSizing
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      handleIndicatorStyle={styles.handle}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Log Wear</Text>
        <TouchableOpacity onPress={onClose} disabled={submitting}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Date</Text>
        <View style={styles.presetRow}>
          {(
            [
              ['today', 'Today'],
              ['yesterday', 'Yesterday'],
              ['2d', '2d ago'],
              ['earlier', 'Earlier'],
            ] as const
          ).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.chip, preset === key && styles.chipActive]}
              onPress={() => setPreset(key)}
            >
              <Text
                style={[
                  styles.chipText,
                  preset === key && styles.chipTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {preset === 'earlier' && (
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setDaysBack((d) => Math.max(3, d - 1))}
            >
              <Ionicons name="remove" size={18} color="#111" />
            </TouchableOpacity>
            <Text style={styles.stepperLabel}>{daysBack} days ago</Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setDaysBack((d) => Math.min(30, d + 1))}
            >
              <Ionicons name="add" size={18} color="#111" />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.dateLabel}>{formatDateLabel(wornAt)}</Text>

        <Text style={[styles.label, styles.sectionSpacing]}>
          Occasion <Text style={styles.optional}>(optional)</Text>
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.occasionRow}
        >
          {OCCASIONS.map((occ) => (
            <TouchableOpacity
              key={occ}
              style={[styles.chip, occasion === occ && styles.chipActive]}
              onPress={() =>
                setOccasion((current) => (current === occ ? null : occ))
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

        <Text style={[styles.label, styles.sectionSpacing]}>
          Notes <Text style={styles.optional}>(optional)</Text>
        </Text>
        <BottomSheetTextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any notes about this wear..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
        />
      </BottomSheetScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          disabled={submitting}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitText}>Log Wear</Text>
          )}
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  handle: {
    width: 40,
    backgroundColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '600', color: '#111' },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  optional: { fontWeight: '400', color: '#9ca3af' },
  sectionSpacing: { marginTop: 20 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  occasionRow: { flexDirection: 'row', gap: 8, paddingRight: 20 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { fontSize: 13, color: '#374151', textTransform: 'capitalize' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperLabel: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
    minWidth: 100,
    textAlign: 'center',
  },
  dateLabel: { fontSize: 13, color: '#6b7280', marginTop: 10 },
  notesInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111',
    minHeight: 72,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
