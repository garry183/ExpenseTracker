import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Donut from '@/components/Donut';
import Bars from '@/components/Bars';
import { useStore } from '@/store/useStore';
import { currentMonth, addMonths, monthLabel, shortMonthLabel } from '@/lib/date';
import { colors, radii, spacing, formatAmount } from '@/constants/theme';

export default function ChartsScreen() {
  const [month, setMonth] = useState(currentMonth());
  const spentByCategory = useStore((s) => s.spentByCategory);
  const monthTotals = useStore((s) => s.monthTotals);
  const categoryById = useStore((s) => s.categoryById);

  const breakdown = useMemo(() => {
    const map = spentByCategory(month);
    return Object.entries(map)
      .map(([categoryId, value]) => ({ category: categoryById(categoryId), value }))
      .sort((a, b) => b.value - a.value);
  }, [month, spentByCategory, categoryById]);

  const totalExpense = monthTotals(month).expense;

  const trend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const m = addMonths(month, i - 5);
      return { label: shortMonthLabel(m), value: monthTotals(m).expense, highlight: m === month };
    });
  }, [month, monthTotals]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, paddingVertical: spacing.md }}>
        <Pressable testID="charts-month-prev" onPress={() => setMonth((m) => addMonths(m, -1))} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 140, textAlign: 'center' }}>{monthLabel(month)}</Text>
        <Pressable testID="charts-month-next" onPress={() => setMonth((m) => addMonths(m, 1))} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, paddingBottom: 40 }}>
        {/* Donut */}
        <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, alignItems: 'center' }}>
          <Text style={{ alignSelf: 'flex-start', fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.md }}>
            Spending by category
          </Text>
          {totalExpense > 0 ? (
            <>
              <Donut
                slices={breakdown.map((b) => ({ value: b.value, color: b.category.color }))}
                centerLabel={formatAmount(totalExpense)}
                centerSub="spent"
              />
              <View style={{ width: '100%', marginTop: spacing.lg, gap: spacing.sm }}>
                {breakdown.map((b) => (
                  <View key={b.category.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: b.category.color }} />
                    <Text style={{ flex: 1, color: colors.text, fontSize: 13 }}>{b.category.name}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {Math.round((b.value / totalExpense) * 100)}%
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600', minWidth: 70, textAlign: 'right' }}>
                      {formatAmount(b.value)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={{ color: colors.textMuted, paddingVertical: spacing.xl }}>No expenses this month.</Text>
          )}
        </View>

        {/* Trend */}
        <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.lg }}>Last 6 months</Text>
          <Bars bars={trend} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
