import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { EMOJI_CHOICES } from '@/constants/catalog';
import { Category } from '@/types';
import ItemImage from './ItemImage';
import { Button, Input } from './ui';

interface Props {
  visible: boolean;
  category: Category;
  onSave: (name: string, emoji?: string, image?: string) => Promise<void>;
  onClose: () => void;
}

export default function AddItemModal({ visible, category, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState<string>(category.emoji);
  const [image, setImage] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  function reset() {
    setName('');
    setEmoji(category.emoji);
    setImage(undefined);
  }

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to add a picture, or pick an emoji instead.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (result.canceled) return;
    // Shrink hard: the picture lives inside the Firestore document and syncs to every phone.
    const small = await ImageManipulator.manipulateAsync(result.assets[0].uri, [{ resize: { width: 128, height: 128 } }], {
      compress: 0.6,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
    setImage(`data:image/jpeg;base64,${small.base64}`);
  }

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave(name, image ? undefined : emoji, image);
      reset();
      onClose();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <ItemImage item={{ name: name || category.singular, emoji, image }} size={56} />
            <View style={{ flex: 1 }}>
              <Text style={typography.h2}>New {category.singular}</Text>
              <Text style={typography.label}>Shared with everyone in your family</Text>
            </View>
          </View>

          <Input value={name} onChangeText={setName} placeholder={`${category.singular} name`} autoFocus accessibilityLabel="Item name" />

          <View style={styles.imageRow}>
            <Text style={typography.label}>Image</Text>
            <Pressable onPress={image ? () => setImage(undefined) : pickPhoto} style={styles.photoBtn} accessibilityRole="button">
              <Ionicons name={image ? 'close-circle-outline' : 'image-outline'} size={18} color={colors.text} />
              <Text style={styles.photoBtnText}>{image ? 'Remove photo' : 'Choose photo'}</Text>
            </Pressable>
          </View>

          {!image && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojis}>
              {EMOJI_CHOICES.map((e) => (
                <Pressable
                  key={e}
                  onPress={() => setEmoji(e)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: e === emoji }}
                  style={[styles.emojiChip, e === emoji && { borderColor: category.color, backgroundColor: colors.surfaceAlt }]}
                >
                  <Text style={{ fontSize: 24 }}>{e}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <Button label="Save" onPress={save} loading={saving} disabled={!name.trim()} style={{ backgroundColor: category.color }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl + 8,
    gap: spacing.lg,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  imageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
  },
  photoBtnText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  emojis: { gap: spacing.sm },
  emojiChip: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
