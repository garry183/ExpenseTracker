import { useCallback, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import CategoryGrid from '@/components/CategoryGrid';
import CategoryEditorModal from '@/components/CategoryEditorModal';
import Keypad, { KeypadKey } from '@/components/Keypad';
import { categoriesForType } from '@/constants/categories';
import { TransactionType } from '@/types';
import { useStore } from '@/store/useStore';
import { todayISO, addDaysISO, dayHeaderLabel } from '@/lib/date';
import { colors, radii, spacing, formatAmount, CURRENCY } from '@/constants/theme';

function evalExpression(expr: string): number {
  const tokens = expr.match(/(\d+\.?\d*)|[+-]/g);
  if (!tokens) return 0;
  let total = 0;
  let op = '+';
  for (const tok of tokens) {
    if (tok === '+' || tok === '-') {
      op = tok;
    } else {
      const n = parseFloat(tok);
      if (!Number.isNaN(n)) total = op === '+' ? total + n : total - n;
    }
  }
  return Math.round(total * 100) / 100;
}

export default function AddScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const transactions = useStore((s) => s.transactions);
  const allCategories = useStore((s) => s.categories);
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const addCategory = useStore((s) => s.addCategory);

  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [expr, setExpr] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [editorVisible, setEditorVisible] = useState(false);

  // Seed from existing transaction when editing; reset when adding fresh.
  useFocusEffect(
    useCallback(() => {
      if (id) {
        const tx = transactions.find((t) => t.id === id);
        if (tx && tx.id !== loadedId) {
          setType(tx.type);
          setCategoryId(tx.categoryId);
          setExpr(String(tx.amount));
          setNote(tx.note);
          setDate(tx.date);
          setLoadedId(tx.id);
        }
      } else {
        setLoadedId(null);
      }
      return () => {};
    }, [id, transactions, loadedId])
  );

  const categories = useMemo(() => categoriesForType(allCategories, type), [allCategories, type]);
  const amount = useMemo(() => evalExpression(expr), [expr]);
  const canSubmit = amount > 0 && !!categoryId;
  const showsMath = /[+-]/.test(expr.slice(1));

  function onKey(k: KeypadKey) {
    setExpr((prev) => {
      if (k === 'back') return prev.slice(0, -1);
      if (k === '+' || k === '-') {
        if (prev === '') return k === '-' ? '-' : '';
        if (/[+-]$/.test(prev)) return prev.slice(0, -1) + k;
        return prev + k;
      }
      if (k === '.') {
        const lastNum = prev.split(/[+-]/).pop() ?? '';
        if (lastNum.includes('.')) return prev;
        return prev + (lastNum === '' ? '0.' : '.');
      }
      return prev + k;
    });
  }

  function reset() {
    setType('expense');
    setCategoryId(null);
    setExpr('');
    setNote('');
    setDate(todayISO());
    setLoadedId(null);
  }

  async function onSubmit() {
    if (!canSubmit || !categoryId) return;
    const payload = { amount, type, categoryId, note: note.trim(), date };
    if (id && loadedId) {
      await updateTransaction({ ...payload, id, createdAt: transactions.find((t) => t.id === id)!.createdAt });
    } else {
      await addTransaction(payload);
    }
    reset();
    router.replace('/');
  }

  function onDelete() {
    if (!id) return;
    Alert.alert('Delete entry', 'Remove this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(id);
          reset();
          router.replace('/');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Type toggle */}
      <View style={{ flexDirection: 'row', margin: spacing.lg, backgroundColor: colors.surfaceAlt, borderRadius: radii.pill, padding: spacing.xs }}>
        {(['expense', 'income'] as TransactionType[]).map((t) => (
          <Pressable
            key={t}
            testID={`type-${t}`}
            onPress={() => {
              setType(t);
              setCategoryId(null);
            }}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              borderRadius: radii.pill,
              backgroundColor: type === t ? colors.surface : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '700', color: type === t ? (t === 'income' ? colors.income : colors.expense) : colors.textMuted }}>
              {t === 'expense' ? 'Expense' : 'Income'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Amount display */}
      <View style={{ paddingHorizontal: spacing.xl, alignItems: 'flex-end' }}>
        {showsMath ? <Text style={{ color: colors.textMuted, fontSize: 14 }}>{expr}</Text> : null}
        <Text style={{ fontSize: 40, fontWeight: '800', color: type === 'income' ? colors.income : colors.text }}>
          {expr === '' ? `${CURRENCY}0` : formatAmount(amount)}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
        <CategoryGrid
          categories={categories}
          selectedId={categoryId}
          onSelect={setCategoryId}
          onAddNew={() => setEditorVisible(true)}
        />

        {/* Date stepper */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.sm }}>
          <Pressable testID="date-prev" onPress={() => setDate((d) => addDaysISO(d, -1))} hitSlop={8} style={{ padding: spacing.sm }}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
            <Text style={{ fontWeight: '600', color: colors.text }}>{dayHeaderLabel(date)}</Text>
          </View>
          <Pressable
            testID="date-next"
            onPress={() => setDate((d) => (d < todayISO() ? addDaysISO(d, 1) : d))}
            hitSlop={8}
            style={{ padding: spacing.sm }}
          >
            <Ionicons name="chevron-forward" size={20} color={date < todayISO() ? colors.primary : colors.border} />
          </Pressable>
        </View>

        {/* Note */}
        <TextInput
          testID="note-input"
          value={note}
          onChangeText={setNote}
          placeholder="Add a note"
          placeholderTextColor={colors.textFaint}
          style={{ backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, fontSize: 15, color: colors.text }}
        />

        {id && loadedId ? (
          <Pressable testID="delete-tx" onPress={onDelete} style={{ alignItems: 'center', padding: spacing.sm }}>
            <Text style={{ color: colors.expense, fontWeight: '600' }}>Delete entry</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <Keypad onKey={onKey} onSubmit={onSubmit} canSubmit={canSubmit} submitLabel={id && loadedId ? 'Update' : 'Save'} />

      <CategoryEditorModal
        visible={editorVisible}
        type={type}
        onClose={() => setEditorVisible(false)}
        onCreate={async (input) => {
          const cat = await addCategory(input);
          setCategoryId(cat.id);
          setEditorVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
