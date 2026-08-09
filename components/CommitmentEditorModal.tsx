import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category, Commitment, CommitmentFrequency } from '@/types';
import { colors, radii, spacing, CURRENCY } from '@/constants/theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Props {
  visible: boolean;
  commitment: Commitment | null; // null = create
  categories: Category[]; // expense categories to choose from
  defaultFrequency?: CommitmentFrequency; // frequency for a newly created commitment
  onClose: () => void;
  onSave: (input: Omit<Commitment, 'id' | 'lastPostedMonth'>, id: string | null) => void;
  onDelete: (id: string) => void;
}

export default function CommitmentEditorModal({ visible, commitment, categories, defaultFrequency = 'monthly', onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [frequency, setFrequency] = useState<CommitmentFrequency>('monthly');
  const [day, setDay] = useState('1');
  const [monthOfYear, setMonthOfYear] = useState(1);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!visible) return;
    if (commitment) {
      setName(commitment.name);
      setAmount(String(commitment.amount));
      setCategoryId(commitment.categoryId);
      setFrequency(commitment.frequency);
      setDay(String(commitment.dayOfMonth));
      setMonthOfYear(commitment.monthOfYear ?? 1);
      setActive(commitment.active);
    } else {
      setName('');
      setAmount('');
      setCategoryId(categories[0]?.id ?? '');
      setFrequency(defaultFrequency);
      setDay('1');
      setMonthOfYear(1);
      setActive(true);
    }
  }, [visible, commitment, categories, defaultFrequency]);

  const isYearly = frequency === 'yearly';
  const parsedAmount = parseFloat(amount);
  const parsedDay = Math.min(31, Math.max(1, parseInt(day, 10) || 1));
  const valid = name.trim().length > 0 && !Number.isNaN(parsedAmount) && parsedAmount > 0 && !!categoryId;

  function submit() {
    if (!valid) return;
    onSave(
      {
        name: name.trim(),
        amount: parsedAmount,
        categoryId,
        frequency,
        dayOfMonth: parsedDay,
        monthOfYear: isYearly ? monthOfYear : null,
        active,
      },
      commitment?.id ?? null
    );
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.xl, gap: spacing.lg, maxHeight: '90%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
              {commitment ? 'Edit fixed expense' : 'New fixed expense'}
            </Text>
            <Pressable testID="commitment-editor-close" onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ gap: spacing.lg }} keyboardShouldPersistTaps="handled">
            {/* Name */}
            <TextInput
              testID="commitment-name-input"
              value={name}
              onChangeText={setName}
              placeholder="Name (e.g. Home loan EMI)"
              placeholderTextColor={colors.textFaint}
              autoFocus={!commitment}
              style={{ backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, fontSize: 16, color: colors.text }}
            />

            {/* Amount */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, paddingHorizontal: spacing.md }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textMuted }}>{CURRENCY}</Text>
              <TextInput
                testID="commitment-amount-input"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textFaint}
                style={{ flex: 1, padding: spacing.md, fontSize: 20, fontWeight: '700', color: colors.text }}
              />
            </View>

            {/* Category */}
            <View>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm }}>Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {categories.map((c) => {
                  const selected = c.id === categoryId;
                  return (
                    <Pressable
                      key={c.id}
                      testID={`commitment-cat-${c.id}`}
                      onPress={() => setCategoryId(c.id)}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
                        paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.pill,
                        backgroundColor: selected ? c.color : colors.surface,
                        borderWidth: 1, borderColor: selected ? c.color : colors.border,
                      }}
                    >
                      <Ionicons name={c.icon as any} size={16} color={selected ? '#FFFFFF' : colors.textMuted} />
                      <Text style={{ color: selected ? '#FFFFFF' : colors.text, fontWeight: '600', fontSize: 13 }}>{c.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Frequency */}
            <View>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm }}>Repeats</Text>
              <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radii.md, padding: 4 }}>
                {(['monthly', 'yearly'] as CommitmentFrequency[]).map((f) => {
                  const selected = frequency === f;
                  return (
                    <Pressable
                      key={f}
                      testID={`commitment-freq-${f}`}
                      onPress={() => setFrequency(f)}
                      style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radii.sm, backgroundColor: selected ? colors.primary : 'transparent' }}
                    >
                      <Text style={{ color: selected ? colors.onPrimary : colors.textMuted, fontWeight: '700', fontSize: 13 }}>
                        {f === 'monthly' ? 'Monthly' : 'Yearly'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Due month (yearly only) */}
            {isYearly ? (
              <View>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm }}>Due month</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                  {MONTHS.map((m, i) => {
                    const selected = monthOfYear === i + 1;
                    return (
                      <Pressable
                        key={m}
                        testID={`commitment-month-${i + 1}`}
                        onPress={() => setMonthOfYear(i + 1)}
                        style={{
                          paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.pill,
                          backgroundColor: selected ? colors.primary : colors.surface,
                          borderWidth: 1, borderColor: selected ? colors.primary : colors.border,
                        }}
                      >
                        <Text style={{ color: selected ? colors.onPrimary : colors.text, fontWeight: '600', fontSize: 13 }}>{m}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* Day of month */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: colors.text }}>{isYearly ? 'Due day' : 'Due day of month'}</Text>
              <TextInput
                testID="commitment-day-input"
                value={day}
                onChangeText={setDay}
                keyboardType="numeric"
                maxLength={2}
                style={{ backgroundColor: colors.surface, borderRadius: radii.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 64, textAlign: 'center' }}
              />
            </View>

            {/* Active toggle */}
            <Pressable
              testID="commitment-active-toggle"
              onPress={() => setActive((a) => !a)}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <View>
                <Text style={{ fontSize: 14, color: colors.text }}>Active</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Reserve this in your plan and auto-post it</Text>
              </View>
              <Ionicons name={active ? 'toggle' : 'toggle-outline'} size={40} color={active ? colors.primary : colors.textFaint} />
            </Pressable>
          </ScrollView>

          <Pressable
            testID="commitment-save"
            disabled={!valid}
            onPress={submit}
            style={{ backgroundColor: valid ? colors.primary : colors.border, borderRadius: radii.md, alignItems: 'center', paddingVertical: spacing.lg }}
          >
            <Text style={{ color: valid ? colors.onPrimary : colors.textFaint, fontSize: 16, fontWeight: '700' }}>
              {commitment ? 'Save' : 'Add fixed expense'}
            </Text>
          </Pressable>

          {commitment ? (
            <Pressable
              testID="commitment-delete"
              onPress={() => { onDelete(commitment.id); onClose(); }}
              style={{ alignItems: 'center', paddingVertical: spacing.sm }}
            >
              <Text style={{ color: colors.expense, fontWeight: '600' }}>Delete</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
