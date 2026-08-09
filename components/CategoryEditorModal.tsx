import { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryType } from '@/types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/constants/categories';
import { colors, radii, spacing } from '@/constants/theme';

interface Props {
  visible: boolean;
  type: 'expense' | 'income';
  onClose: () => void;
  onCreate: (input: { name: string; icon: string; color: string; type: CategoryType }) => void;
}

export default function CategoryEditorModal({ visible, type, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [color, setColor] = useState(CATEGORY_COLORS[0]);

  function reset() {
    setName('');
    setIcon(CATEGORY_ICONS[0]);
    setColor(CATEGORY_COLORS[0]);
  }

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate({ name: trimmed, icon, color, type });
    reset();
  }

  function close() {
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: colors.bg, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.xl, gap: spacing.lg, maxHeight: '88%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>New {type} category</Text>
            <Pressable testID="category-editor-close" onPress={close} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Preview + name */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ width: 52, height: 52, borderRadius: radii.pill, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={icon as any} size={24} color="#FFFFFF" />
            </View>
            <TextInput
              testID="category-name-input"
              value={name}
              onChangeText={setName}
              placeholder="Category name"
              placeholderTextColor={colors.textFaint}
              autoFocus
              style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.md, fontSize: 16, color: colors.text }}
            />
          </View>

          <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: spacing.lg }}>
            <View>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm }}>Color</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {CATEGORY_COLORS.map((c) => (
                  <Pressable
                    key={c}
                    testID={`color-${c}`}
                    onPress={() => setColor(c)}
                    style={{
                      width: 36, height: 36, borderRadius: radii.pill, backgroundColor: c,
                      borderWidth: color === c ? 3 : 0, borderColor: colors.text,
                    }}
                  />
                ))}
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm }}>Icon</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {CATEGORY_ICONS.map((ic) => (
                  <Pressable
                    key={ic}
                    testID={`icon-${ic}`}
                    onPress={() => setIcon(ic)}
                    style={{
                      width: 44, height: 44, borderRadius: radii.md,
                      backgroundColor: icon === ic ? color : colors.surface,
                      alignItems: 'center', justifyContent: 'center',
                      borderWidth: 1, borderColor: colors.border,
                    }}
                  >
                    <Ionicons name={ic as any} size={22} color={icon === ic ? '#FFFFFF' : colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          <Pressable
            testID="category-create"
            disabled={!name.trim()}
            onPress={submit}
            style={{
              backgroundColor: name.trim() ? colors.primary : colors.border,
              borderRadius: radii.md, alignItems: 'center', paddingVertical: spacing.lg,
            }}
          >
            <Text style={{ color: name.trim() ? colors.onPrimary : colors.textFaint, fontSize: 16, fontWeight: '700' }}>
              Create category
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
