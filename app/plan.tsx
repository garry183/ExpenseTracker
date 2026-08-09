import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AmountPromptModal from '@/components/AmountPromptModal';
import CommitmentEditorModal from '@/components/CommitmentEditorModal';
import { useStore } from '@/store/useStore';
import { categoriesForType } from '@/constants/categories';
import { Commitment } from '@/types';
import { currentMonth, monthLabel, daysRemainingInMonth } from '@/lib/date';
import { colors, radii, spacing, formatAmount } from '@/constants/theme';
import { annualStatusMeta } from '@/lib/annualStatus';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PlanScreen() {
  const month = currentMonth();
  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');
  const [incomeModal, setIncomeModal] = useState(false);
  const [savingsModal, setSavingsModal] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Commitment | null>(null);

  const monthlyIncome = useStore((s) => s.monthlyIncome);
  const savingsTarget = useStore((s) => s.savingsTarget);
  const setIncome = useStore((s) => s.setIncome);
  const setSavingsTarget = useStore((s) => s.setSavingsTarget);
  const commitments = useStore((s) => s.commitments);
  const categories = useStore((s) => s.categories);
  const categoryById = useStore((s) => s.categoryById);
  const financePlan = useStore((s) => s.financePlan);
  const annualExpenses = useStore((s) => s.annualExpenses);
  const addCommitment = useStore((s) => s.addCommitment);
  const updateCommitment = useStore((s) => s.updateCommitment);
  const deleteCommitment = useStore((s) => s.deleteCommitment);

  const expenseCategories = useMemo(() => categoriesForType(categories, 'expense'), [categories]);
  const plan = financePlan(month);
  const configured = monthlyIncome > 0;
  const negative = plan.safeToSpend < 0;
  const daysLeft = daysRemainingInMonth(month);

  const monthlyCommitments = useMemo(() => commitments.filter((c) => c.frequency === 'monthly'), [commitments]);
  const yearlyCommitments = useMemo(
    () =>
      commitments
        .filter((c) => c.frequency === 'yearly')
        .sort((a, b) => (a.monthOfYear ?? 0) - (b.monthOfYear ?? 0) || a.dayOfMonth - b.dayOfMonth),
    [commitments]
  );
  const yearlyTotal = yearlyCommitments.filter((c) => c.active).reduce((sum, c) => sum + c.amount, 0);
  const yearlyPerMonth = yearlyTotal / 12;
  const annualStatusById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof annualExpenses>[number]>();
    for (const info of annualExpenses()) map.set(info.commitment.id, info);
    return map;
  }, [annualExpenses, commitments]);

  function openNew() {
    setEditing(null);
    setEditorOpen(true);
  }

  function openEdit(c: Commitment) {
    setEditing(c);
    setEditorOpen(true);
  }

  async function onSaveCommitment(
    input: Omit<Commitment, 'id' | 'lastPostedMonth'>,
    id: string | null
  ) {
    if (id) {
      const existing = commitments.find((c) => c.id === id);
      await updateCommitment({ ...input, id, lastPostedMonth: existing?.lastPostedMonth ?? null });
    } else {
      await addCommitment(input);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <View style={{ paddingVertical: spacing.md, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Finance Plan</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
          {view === 'monthly' ? monthLabel(month) : month.slice(0, 4)}
        </Text>
      </View>

      {/* Monthly / Yearly switcher */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radii.md, padding: 4, marginHorizontal: spacing.lg, marginBottom: spacing.sm }}>
        {(['monthly', 'yearly'] as const).map((v) => {
          const selected = view === v;
          return (
            <Pressable
              key={v}
              testID={`plan-view-${v}`}
              onPress={() => setView(v)}
              style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radii.sm, backgroundColor: selected ? colors.primary : 'transparent' }}
            >
              <Text style={{ color: selected ? colors.onPrimary : colors.textMuted, fontWeight: '700', fontSize: 14 }}>
                {v === 'monthly' ? 'Monthly' : 'Yearly'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {view === 'yearly' ? (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 40 }}>
          <View style={{ backgroundColor: colors.primary, borderRadius: radii.lg, padding: spacing.lg }}>
            <Text style={{ color: '#E8DEF8', fontSize: 13 }}>Yearly obligations</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 34, fontWeight: '800', marginTop: 2 }}>{formatAmount(yearlyTotal)}</Text>
            <Text style={{ color: '#E8DEF8', fontSize: 12, marginTop: 4 }}>
              ≈ {formatAmount(yearlyPerMonth)} / month, already deducted from your monthly Safe to spend
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, marginLeft: spacing.xs }}>
              Yearly commitments
            </Text>
            <Pressable testID="commitment-add-yearly" onPress={openNew} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Add</Text>
            </Pressable>
          </View>

          {yearlyCommitments.length === 0 ? (
            <Pressable onPress={openNew} style={{ backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name="calendar-outline" size={28} color={colors.textFaint} />
              <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
                No yearly items yet.{'\n'}Add insurance, LIC, or PPF — they auto-post once a year.
              </Text>
            </Pressable>
          ) : (
            yearlyCommitments.map((c) => {
              const cat = categoryById(c.categoryId);
              const info = annualStatusById.get(c.id);
              const badge = c.active && info ? annualStatusMeta(info.status) : null;
              return (
                <Pressable
                  key={c.id}
                  testID={`commitment-${c.id}`}
                  onPress={() => openEdit(c)}
                  style={{ backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: c.active ? 1 : 0.5 }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: radii.pill, backgroundColor: cat.color, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={cat.icon as any} size={18} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', color: colors.text }}>{c.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      Due {MONTHS_SHORT[(c.monthOfYear ?? 1) - 1]} {c.dayOfMonth}{c.active ? '' : ' · paused'}
                    </Text>
                  </View>
                  {badge ? (
                    <View style={{ backgroundColor: badge.bg, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 3, marginRight: spacing.xs }}>
                      <Text style={{ color: badge.color, fontSize: 11, fontWeight: '700' }}>{badge.label}</Text>
                    </View>
                  ) : null}
                  <Text style={{ fontWeight: '700', color: colors.text }}>{formatAmount(c.amount)}</Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      ) : (
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 40 }}>
        {/* Safe to spend headline */}
        <View style={{ backgroundColor: colors.primary, borderRadius: radii.lg, padding: spacing.lg }}>
          {configured ? (
            <>
              <Text style={{ color: '#E8DEF8', fontSize: 13 }}>
                {negative ? 'Over your plan by' : 'Safe to spend'}
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 34, fontWeight: '800', marginTop: 2 }}>
                {formatAmount(Math.abs(plan.safeToSpend))}
              </Text>
              {!negative ? (
                <Text style={{ color: '#E8DEF8', fontSize: 12, marginTop: 4 }}>
                  {formatAmount(Math.max(0, plan.perDay))} / day for {daysLeft} more day{daysLeft === 1 ? '' : 's'}
                </Text>
              ) : (
                <Text style={{ color: '#FFD7D2', fontSize: 12, marginTop: 4 }}>
                  Discretionary spending has passed what your plan allows.
                </Text>
              )}
            </>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: spacing.md }}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Set up your plan</Text>
                <Text style={{ color: '#E8DEF8', fontSize: 13, marginTop: 2 }}>
                  Add your monthly income to see what's safe to spend.
                </Text>
              </View>
              <Ionicons name="calculator-outline" size={26} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Breakdown */}
        <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, overflow: 'hidden' }}>
          <PlanRow
            testID="plan-income"
            icon="cash-outline"
            iconColor={colors.income}
            label="Monthly income"
            value={monthlyIncome}
            sign=""
            onPress={() => setIncomeModal(true)}
          />
          <Divider />
          <PlanRow
            testID="plan-committed"
            icon="repeat-outline"
            iconColor={colors.primary}
            label="Fixed commitments"
            value={plan.committed}
            sign="−"
            subtitle={`${monthlyCommitments.filter((c) => c.active).length} active`}
          />
          <Divider />
          <PlanRow
            testID="plan-yearly-reserve"
            icon="calendar-outline"
            iconColor={colors.warning}
            label="Annual sinking fund"
            value={plan.yearlyReserve}
            sign="−"
            subtitle={`${yearlyCommitments.filter((c) => c.active).length} yearly item${yearlyCommitments.filter((c) => c.active).length === 1 ? '' : 's'} set aside`}
            onPress={() => setView('yearly')}
          />
          <Divider />
          <PlanRow
            testID="plan-savings"
            icon="trending-up-outline"
            iconColor={colors.warning}
            label="Savings target"
            value={savingsTarget}
            sign="−"
            onPress={() => setSavingsModal(true)}
          />
          <Divider />
          <PlanRow
            testID="plan-spent"
            icon="card-outline"
            iconColor={colors.expense}
            label="Discretionary spent"
            value={plan.discretionarySpent}
            sign="−"
          />
          <Divider />
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.surfaceAlt }}>
            <Text style={{ flex: 1, fontWeight: '800', color: colors.text, fontSize: 15 }}>Safe to spend</Text>
            <Text style={{ fontWeight: '800', color: negative ? colors.over : colors.text, fontSize: 15 }}>
              {formatAmount(plan.safeToSpend)}
            </Text>
          </View>
        </View>

        {/* Commitments list */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, marginLeft: spacing.xs }}>
            Fixed commitments
          </Text>
          <Pressable testID="commitment-add" onPress={openNew} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Ionicons name="add-circle" size={20} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Add</Text>
          </Pressable>
        </View>

        {monthlyCommitments.length === 0 ? (
          <Pressable onPress={openNew} style={{ backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, alignItems: 'center', gap: spacing.xs }}>
            <Ionicons name="repeat-outline" size={28} color={colors.textFaint} />
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
              No fixed expenses yet.{'\n'}Add EMIs, rent, or subscriptions — they auto-post each month.
            </Text>
          </Pressable>
        ) : (
          monthlyCommitments.map((c) => {
            const cat = categoryById(c.categoryId);
            return (
              <Pressable
                key={c.id}
                testID={`commitment-${c.id}`}
                onPress={() => openEdit(c)}
                style={{ backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: c.active ? 1 : 0.5 }}
              >
                <View style={{ width: 36, height: 36, borderRadius: radii.pill, backgroundColor: cat.color, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={cat.icon as any} size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: colors.text }}>{c.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    Day {c.dayOfMonth}{c.active ? '' : ' · paused'}
                  </Text>
                </View>
                <Text style={{ fontWeight: '700', color: colors.text }}>{formatAmount(c.amount)}</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
      )}

      <AmountPromptModal
        visible={incomeModal}
        title="Monthly income"
        subtitle="Your total take-home income each month."
        initialValue={monthlyIncome}
        onClose={() => setIncomeModal(false)}
        onSave={(value) => setIncome(value)}
      />
      <AmountPromptModal
        visible={savingsModal}
        title="Savings target"
        subtitle="Amount to set aside before spending."
        initialValue={savingsTarget}
        onClose={() => setSavingsModal(false)}
        onSave={(value) => setSavingsTarget(value)}
      />
      <CommitmentEditorModal
        visible={editorOpen}
        commitment={editing}
        categories={expenseCategories}
        defaultFrequency={view}
        onClose={() => setEditorOpen(false)}
        onSave={onSaveCommitment}
        onDelete={(id) => deleteCommitment(id)}
      />
    </SafeAreaView>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: spacing.lg }} />;
}

function PlanRow({
  testID, icon, iconColor, label, value, sign, subtitle, onPress,
}: {
  testID: string;
  icon: string;
  iconColor: string;
  label: string;
  value: number;
  sign: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable testID={testID} onPress={onPress} disabled={!onPress} style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md }}>
      <View style={{ width: 34, height: 34, borderRadius: radii.pill, backgroundColor: iconColor + '22', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text>
        {subtitle ? <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      <Text style={{ color: colors.text, fontWeight: '700' }}>
        {sign}{formatAmount(value)}
      </Text>
      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textFaint} /> : null}
    </Pressable>
  );
}
