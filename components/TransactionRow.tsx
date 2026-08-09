import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '@/types';
import { useStore } from '@/store/useStore';
import { colors, radii, spacing, formatAmount } from '@/constants/theme';

interface Props {
  transaction: Transaction;
  onPress?: () => void;
  onLongPress?: () => void;
}

export default function TransactionRow({ transaction, onPress, onLongPress }: Props) {
  const cat = useStore((s) => s.categoryById(transaction.categoryId));
  const isIncome = transaction.type === 'income';
  return (
    <Pressable
      testID={`tx-${transaction.id}`}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
        gap: spacing.md,
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radii.pill,
          backgroundColor: cat.color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={cat.icon as any} size={20} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{cat.name}</Text>
        {transaction.note ? (
          <Text numberOfLines={1} style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
            {transaction.note}
          </Text>
        ) : null}
      </View>
      <Text style={{ fontSize: 15, fontWeight: '700', color: isIncome ? colors.income : colors.expense }}>
        {isIncome ? '+' : '-'}
        {formatAmount(transaction.amount)}
      </Text>
    </Pressable>
  );
}
