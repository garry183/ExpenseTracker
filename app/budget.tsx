import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AmountPromptModal from '@/components/AmountPromptModal';
import { useStore } from '@/store/useStore';
import { categoriesForType } from '@/constants/categories';
import { currentMonth, addMonths, monthLabel, daysRemainingInMonth } from '@/lib/date';
import { colors, radii, spacing, formatAmount } from '@/constants/theme';

export default function BudgetScreen() {
  const [month, setMonth] = useState(currentMonth());
  const [overallModal, setOverallModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const allCategories = useStore((s) => s.categories);
  const spentByCategory = useStore((s) => s.spentByCategory);
  const monthTotals = useStore((s) => s.monthTotals);
  const setBudget = useStore((s) => s.setBudget);
  const budgetFor = useStore((s) => s.budgetFor);
  const categoryById = useStore((s) => s.categoryById);
  const monthlyBudget = useStore((s) => s.monthlyBudget);
  const setMonthlyBudget = useStore((s) => s.setMonthlyBudget);

  const expenseCategories = useMemo(() => categoriesForType(allCategories, 'expense'), [allCategories]);
  const spent = spentByCategory(month);
  const totalSpent = monthTotals(month).expense;

  const left = monthlyBudget - totalSpent;
  const usedPct = monthlyBudget > 0 ? Math.min(totalSpent / monthlyBudget, 1) : 0;
  const overBudget = monthlyBudget > 0 && left < 0;
  const perDay = monthlyBudget > 0 ? left / daysRemainingInMonth(month) : 0;

  function openEditor(categoryId: string) {
    const existing = budgetFor(categoryId, month);
    setDraft(existing > 0 ? String(existing) : '');
    setEditing(categoryId);
  }

  async function save() {
    if (editing) {
      const value = parseFloat(draft);
      await setBudget(editing, month, Number.isNaN(value) ? 0 : value);
    }
    setEditing(null);
    setDraft('');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, paddingVertical: spacing.md }}>
        <Pressable testID="budget-month-prev" onPress={() => setMonth((m) => addMonths(m, -1))} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 140, textAlign: 'center' }}>{monthLabel(month)}</Text>
        <Pressable testID="budget-month-next" onPress={() => setMonth((m) => addMonths(m, 1))} hitSlop={8}>
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 40 }}>
        {/* Overall monthly budget — the headline */}
        <Pressable
          testID="overall-budget-card"
          onPress={() => setOverallModal(true)}
          style={{ backgroundColor: colors.primary, borderRadius: radii.lg, padding: spacing.lg }}
        >
          {monthlyBudget > 0 ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ color: '#E8DEF8', fontSize: 13 }}>{overBudget ? 'Over budget' : 'Left this month'}</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '800', marginTop: 2 }}>{formatAmount(Math.abs(left))}</Text>
                  <Text style={{ color: '#E8DEF8', fontSize: 12, marginTop: 2 }}>
                    {formatAmount(totalSpent)} spent of {formatAmount(monthlyBudget)}
                  </Text>
                </View>
                <Ionicons name="pencil" size={18} color="#E8DEF8" />
              </View>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: '#4F378B', marginTop: spacing.md, overflow: 'hidden' }}>
                <View style={{ width: `${usedPct * 100}%`, height: '100%', backgroundColor: overBudget ? '#FF8A80' : '#D0BCFF' }} />
              </View>
              {!overBudget ? (
                <Text style={{ color: '#E8DEF8', fontSize: 12, marginTop: spacing.sm }}>
                  {formatAmount(Math.max(0, perDay))} / day for the rest of the month
                </Text>
              ) : null}
            </>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Set a monthly budget</Text>
                <Text style={{ color: '#E8DEF8', fontSize: 13, marginTop: 2 }}>One total limit for the whole month.</Text>
              </View>
              <Ionicons name="add-circle-outline" size={26} color="#FFFFFF" />
            </View>
          )}
        </Pressable>

        {/* Optional per-category limits */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, marginTop: spacing.sm, marginLeft: spacing.xs }}>
          Category limits (optional)
        </Text>

        {expenseCategories.map((cat) => {
          const limit = budgetFor(cat.id, month);
          const used = spent[cat.id] ?? 0;
          const pct = limit > 0 ? Math.min(used / limit, 1) : 0;
          const over = limit > 0 && used > limit;
          const barColor = over ? colors.over : pct > 0.8 ? colors.warning : colors.primary;
          return (
            <Pressable
              key={cat.id}
              testID={`budget-${cat.id}`}
              onPress={() => openEditor(cat.id)}
              style={{ backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, gap: spacing.sm }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View style={{ width: 32, height: 32, borderRadius: radii.pill, backgroundColor: cat.color, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={cat.icon as any} size={16} color="#FFFFFF" />
                </View>
                <Text style={{ flex: 1, fontWeight: '600', color: colors.text }}>{cat.name}</Text>
                <Text style={{ color: over ? colors.over : colors.textMuted, fontSize: 13 }}>
                  {limit > 0 ? `${formatAmount(used)} / ${formatAmount(limit)}` : 'Set limit'}
                </Text>
              </View>
              {limit > 0 ? (
                <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
                  <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: barColor }} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <AmountPromptModal
        visible={overallModal}
        title="Monthly budget"
        subtitle="Your total spending limit each month."
        initialValue={monthlyBudget}
        onClose={() => setOverallModal(false)}
        onSave={(value) => setMonthlyBudget(value)}
      />

      {/* Per-category limit editor */}
      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <Pressable
          onPress={() => setEditing(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.xl }}
        >
          <Pressable style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.xl, gap: spacing.lg }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
              {editing ? `${categoryById(editing).name} limit` : ''}
            </Text>
            <TextInput
              testID="budget-input"
              value={draft}
              onChangeText={setDraft}
              keyboardType="numeric"
              autoFocus
              placeholder="0"
              placeholderTextColor={colors.textFaint}
              style={{ backgroundColor: colors.bg, borderRadius: radii.md, padding: spacing.md, fontSize: 20, fontWeight: '700', color: colors.text }}
            />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <Pressable onPress={() => setEditing(null)} style={{ flex: 1, padding: spacing.md, alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="budget-save"
                onPress={save}
                style={{ flex: 1, padding: spacing.md, alignItems: 'center', backgroundColor: colors.primary, borderRadius: radii.md }}
              >
                <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
