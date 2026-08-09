import { useMemo, useState } from 'react';
import { View, Text, SectionList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import TransactionRow from '@/components/TransactionRow';
import AmountPromptModal from '@/components/AmountPromptModal';
import { useStore } from '@/store/useStore';
import { Transaction } from '@/types';
import { currentMonth, addMonths, monthLabel, dayHeaderLabel, daysRemainingInMonth } from '@/lib/date';
import { colors, radii, spacing, formatAmount } from '@/constants/theme';

export default function RecordsScreen() {
  const [month, setMonth] = useState(currentMonth());
  const [budgetModal, setBudgetModal] = useState(false);
  const transactionsForMonth = useStore((s) => s.transactionsForMonth);
  const monthTotals = useStore((s) => s.monthTotals);
  const monthlyBudget = useStore((s) => s.monthlyBudget);
  const setMonthlyBudget = useStore((s) => s.setMonthlyBudget);
  const monthlyIncome = useStore((s) => s.monthlyIncome);
  const financePlan = useStore((s) => s.financePlan);
  const txCount = useStore((s) => s.transactions.length);

  const txs = transactionsForMonth(month);
  const totals = monthTotals(month);
  const hasPlan = monthlyIncome > 0;
  const plan = financePlan(month);
  const planNegative = plan.safeToSpend < 0;

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

  const left = monthlyBudget - totals.expense;
  const usedPct = monthlyBudget > 0 ? Math.min(totals.expense / monthlyBudget, 1) : 0;
  const perDay = monthlyBudget > 0 ? left / daysRemainingInMonth(month) : 0;
  const overBudget = monthlyBudget > 0 && left < 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Month selector */}
      <View style={{ justifyContent: 'center', paddingVertical: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl }}>
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
        <Pressable
          testID="open-settings"
          onPress={() => router.push('/settings' as Href)}
          hitSlop={8}
          style={{ position: 'absolute', right: spacing.lg }}
        >
          <Ionicons name="settings-outline" size={22} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Summary header */}
      <View style={{ flexDirection: 'row', marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg }}>
        <Summary label="Income" value={totals.income} color={colors.income} />
        <Summary label="Expense" value={totals.expense} color={colors.expense} />
        <Summary label="Balance" value={totals.balance} color={totals.balance >= 0 ? colors.text : colors.expense} />
      </View>

      {/* Safe-to-spend headline when a finance plan is set; else monthly budget */}
      {hasPlan ? (
        <Pressable
          testID="safe-to-spend-card"
          onPress={() => router.push('/plan' as Href)}
          style={{ marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.primary, borderRadius: radii.lg, padding: spacing.lg }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text style={{ color: '#E8DEF8', fontSize: 13 }}>{planNegative ? 'Over your plan by' : 'Safe to spend'}</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '800', marginTop: 2 }}>
                {formatAmount(Math.abs(plan.safeToSpend))}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#E8DEF8', fontSize: 12 }}>of {formatAmount(plan.income)}</Text>
              {!planNegative ? (
                <Text style={{ color: '#E8DEF8', fontSize: 12, marginTop: 2 }}>{formatAmount(Math.max(0, plan.perDay))}/day</Text>
              ) : null}
            </View>
          </View>
        </Pressable>
      ) : (
      <Pressable
        testID="monthly-budget-card"
        onPress={() => setBudgetModal(true)}
        style={{ marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.primary, borderRadius: radii.lg, padding: spacing.lg }}
      >
        {monthlyBudget > 0 ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View>
                <Text style={{ color: '#E8DEF8', fontSize: 13 }}>{overBudget ? 'Over budget this month' : 'Left this month'}</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '800', marginTop: 2 }}>
                  {formatAmount(Math.abs(left))}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#E8DEF8', fontSize: 12 }}>of {formatAmount(monthlyBudget)}</Text>
                {!overBudget ? (
                  <Text style={{ color: '#E8DEF8', fontSize: 12, marginTop: 2 }}>{formatAmount(Math.max(0, perDay))}/day</Text>
                ) : null}
              </View>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: '#4F378B', marginTop: spacing.md, overflow: 'hidden' }}>
              <View style={{ width: `${usedPct * 100}%`, height: '100%', backgroundColor: overBudget ? '#FF8A80' : '#D0BCFF' }} />
            </View>
          </>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="wallet-outline" size={20} color="#E8DEF8" />
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Set a monthly budget</Text>
            </View>
            <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
          </View>
        )}
      </Pressable>
      )}

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

      <AmountPromptModal
        visible={budgetModal}
        title="Monthly budget"
        subtitle="Your total spending limit each month."
        initialValue={monthlyBudget}
        onClose={() => setBudgetModal(false)}
        onSave={(value) => setMonthlyBudget(value)}
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
