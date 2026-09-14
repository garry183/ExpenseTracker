import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '@/constants/theme';
import { CatalogItem, ListEntry } from '@/types';
import ItemImage from './ItemImage';
import { formatQty } from '@/lib/quantity';

interface Props {
  item: CatalogItem;
  entry?: ListEntry;
  color: string;
  onToggle: () => void;
  onEditQty: () => void;
  onStep: (direction: 1 | -1) => void;
}

export default function ItemRow({ item, entry, color, onToggle, onEditQty, onStep }: Props) {
  const selected = Boolean(entry);
  return (
    <View style={[styles.row, selected && { borderColor: color }]}>
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={item.name}
        style={[styles.checkbox, selected && { backgroundColor: color, borderColor: color }]}
      >
        {selected && <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
      </Pressable>

      <Pressable onPress={onToggle} style={styles.main}>
        <ItemImage item={item} />
        <View style={styles.text}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.qty, selected && { color }]} numberOfLines={1}>
            {entry ? formatQty(entry.qty, entry.unit) : 'Not on the list'}
          </Text>
        </View>
      </Pressable>

      <View style={[styles.stepper, !selected && styles.stepperIdle]}>
        <Pressable
          onPress={() => onStep(-1)}
          disabled={!selected}
          hitSlop={6}
          accessibilityLabel={`Decrease ${item.name}`}
          style={styles.stepBtn}
        >
          <Ionicons name="remove" size={18} color={selected ? colors.text : colors.textFaint} />
        </Pressable>
        <Pressable onPress={selected ? onEditQty : onToggle} accessibilityLabel={`Edit quantity for ${item.name}`}>
          <Text style={[styles.stepValue, !selected && { color: colors.textFaint }]}>
            {entry ? formatQty(entry.qty, entry.unit) : 'Add'}
          </Text>
        </Pressable>
        <Pressable onPress={() => onStep(1)} hitSlop={6} accessibilityLabel={`Increase ${item.name}`} style={styles.stepBtn}>
          <Ionicons name="add" size={18} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  qty: { fontSize: 13, color: colors.textFaint, marginTop: 2 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.pill,
    paddingHorizontal: 4,
    height: 36,
  },
  stepperIdle: { opacity: 0.8 },
  stepBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepValue: { minWidth: 52, textAlign: 'center', fontSize: 13, fontWeight: '700', color: colors.text },
});
