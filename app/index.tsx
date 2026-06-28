import { useMemo, useState } from 'react';
import { View, Text, SectionList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import TransactionRow from '@/components/TransactionRow';
import { useStore } from '@/store/useStore';
import { Transaction } from '@/types';
import { currentMonth, addMonths, monthLabel, dayHeaderLabel, daysRemainingInMonth } from '@/lib/date';
import { colors, radii, spacing, formatAmount } from '@/constants/theme';

export default function RecordsScreen() {
  const [month, setMonth] = useState(currentMonth());
  const transactionsForMonth = useStore((s) => s.transactionsForMonth);
  const monthTotals = useStore((s) => s.monthTotals);
  const budgets = useStore((s) => s.budgets);
  const txCount = useStore((s) => s.transactions.length);

  const txs = transactionsForMonth(month);
  const totals = monthTotals(month);

  const sections = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    for (const t of txs) {
      const arr = groups.get(t.date) ?? [];
      arr.push(t);
      groups.set(t.date, arr);
    }
    return Array.from(groups.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, data]) => ({ date, data }));
  }, [txs]);

  const safeToSpend = useMemo(() => {
    const monthBudget = budgets.filter((b) => b.month === month).reduce((s, b) => s + b.limit, 0);
    if (monthBudget <= 0) return null;
    const remaining = monthBudget - totals.expense;
    const perDay = remaining / daysRemainingInMonth(month);
    return { remaining, perDay };
  }, [budgets, month, totals.expense]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Month selector */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, paddingVertical: spacing.md }}>
        <Pressable testID="month-prev" onPress={() => setMonth((m) => addMonths(m, -1))} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 140, textAlign: 'center' }}>
          {monthLabel(month)}
        </Text>
        <Pressable testID="month-next" onPress={() => setMonth((m) => addMonths(m, 1))} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {/* Summary header */}
      <View style={{ flexDirection: 'row', marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg }}>
        <Summary label="Income" value={totals.income} color={colors.income} />
        <Summary label="Expense" value={totals.expense} color={colors.expense} />
        <Summary label="Balance" value={totals.balance} color={totals.balance >= 0 ? colors.text : colors.expense} />
      </View>

      {safeToSpend ? (
        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.primary, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: '#E8DEF8', fontSize: 13 }}>Safe to spend / day</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>
            {formatAmount(Math.max(0, safeToSpend.perDay))}
          </Text>
        </View>
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: spacing.md, paddingBottom: 32 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xs, fontSize: 12, fontWeight: '700', color: colors.textMuted }}>
            {dayHeaderLabel(section.date)}
          </Text>
        )}
        renderItem={({ item }) => (
          <TransactionRow transaction={item} onPress={() => router.push({ pathname: '/add', params: { id: item.id } })} />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 64, paddingHorizontal: spacing.xl }}>
            <Ionicons name="receipt-outline" size={48} color={colors.textFaint} />
            <Text style={{ color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' }}>
              {txCount === 0 ? 'No transactions yet.\nTap Add to log your first expense.' : 'Nothing this month.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function Summary({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: 12, color: colors.textMuted }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: '700', color, marginTop: 2 }} numberOfLines={1} adjustsFontSizeToFit>
        {formatAmount(value)}
      </Text>
    </View>
  );
}
