import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { UNITS } from '@/constants/catalog';
import { CatalogItem, ListEntry } from '@/types';
import { parseQty } from '@/lib/quantity';
import ItemImage from './ItemImage';
import { Button, Input } from './ui';

interface Props {
  item: CatalogItem | null;
  entry?: ListEntry;
  defaultUnit: string;
  color: string;
  onConfirm: (qty: number, unit: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export default function QuantityModal({ item, entry, defaultUnit, color, onConfirm, onRemove, onClose }: Props) {
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState(defaultUnit);

  useEffect(() => {
    if (item) {
      setQty(entry ? String(entry.qty) : '1');
      setUnit(entry ? entry.unit : defaultUnit);
    }
  }, [item, entry, defaultUnit]);

  const parsed = parseQty(qty);

  return (
    <Modal visible={Boolean(item)} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap} pointerEvents="box-none">
        {item && (
          <View style={styles.sheet}>
            <View style={styles.titleRow}>
              <ItemImage item={item} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={typography.h2}>{item.name}</Text>
                <Text style={typography.label}>How much?</Text>
              </View>
            </View>

            <Input
              value={qty}
              onChangeText={setQty}
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
              placeholder="Quantity"
              accessibilityLabel="Quantity"
              style={styles.qtyInput}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.units}>
              {UNITS.map((u) => {
                const active = u === unit;
                return (
                  <Pressable
                    key={u}
                    onPress={() => setUnit(u)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={[styles.unitChip, active && { backgroundColor: color, borderColor: color }]}
                  >
                    <Text style={[styles.unitText, active && { color: colors.onPrimary }]}>{u}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Button
              label={entry ? 'Update' : 'Add to list'}
              onPress={() => parsed && onConfirm(parsed, unit)}
              disabled={!parsed}
              style={{ backgroundColor: color }}
            />
            {entry && <Button label="Remove from list" variant="danger" onPress={onRemove} style={{ marginTop: spacing.sm }} />}
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl + 8,
    gap: spacing.lg,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  qtyInput: { fontSize: 28, fontWeight: '800', textAlign: 'center', height: 64 },
  units: { gap: spacing.sm },
  unitChip: {
    paddingHorizontal: spacing.lg,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
  },
  unitText: { color: colors.text, fontWeight: '600' },
});
