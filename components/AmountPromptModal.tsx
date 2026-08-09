import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable } from 'react-native';
import { colors, radii, spacing, CURRENCY } from '@/constants/theme';

interface Props {
  visible: boolean;
  title: string;
  subtitle?: string;
  initialValue: number;
  onClose: () => void;
  onSave: (value: number) => void;
}

export default function AmountPromptModal({ visible, title, subtitle, initialValue, onClose, onSave }: Props) {
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (visible) setDraft(initialValue > 0 ? String(initialValue) : '');
  }, [visible, initialValue]);

  function save() {
    const value = parseFloat(draft);
    onSave(Number.isNaN(value) ? 0 : value);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.xl }}>
        <Pressable style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.xl, gap: spacing.md }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{title}</Text>
          {subtitle ? <Text style={{ fontSize: 13, color: colors.textMuted }}>{subtitle}</Text> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radii.md, paddingHorizontal: spacing.md }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textMuted }}>{CURRENCY}</Text>
            <TextInput
              testID="amount-prompt-input"
              value={draft}
              onChangeText={setDraft}
              keyboardType="numeric"
              autoFocus
              placeholder="0"
              placeholderTextColor={colors.textFaint}
              style={{ flex: 1, padding: spacing.md, fontSize: 22, fontWeight: '700', color: colors.text }}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs }}>
            <Pressable onPress={onClose} style={{ flex: 1, padding: spacing.md, alignItems: 'center' }}>
              <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancel</Text>
            </Pressable>
            <Pressable testID="amount-prompt-save" onPress={save} style={{ flex: 1, padding: spacing.md, alignItems: 'center', backgroundColor: colors.primary, borderRadius: radii.md }}>
              <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
