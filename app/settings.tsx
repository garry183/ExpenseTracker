import { useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStore } from '@/store/useStore';
import { exportBackup, importBackup } from '@/lib/backup';
import { colors, radii, spacing } from '@/constants/theme';

export default function SettingsScreen() {
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const hydrate = useStore((s) => s.hydrate);
  const txCount = useStore((s) => s.transactions.length);
  const commitmentCount = useStore((s) => s.commitments.length);

  async function onExport() {
    if (busy) return;
    setBusy('export');
    try {
      await exportBackup();
    } catch (e: any) {
      Alert.alert('Backup failed', e?.message ?? 'Could not create the backup file.');
    } finally {
      setBusy(null);
    }
  }

  function onRestorePress() {
    if (busy) return;
    Alert.alert(
      'Restore from backup?',
      'This replaces ALL current data with the contents of the backup file. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose file', style: 'destructive', onPress: doRestore },
      ]
    );
  }

  async function doRestore() {
    setBusy('import');
    try {
      const result = await importBackup();
      if (!result) return; // user cancelled the picker
      await hydrate();
      Alert.alert(
        'Restore complete',
        `Imported ${result.transactions} transactions, ${result.categories} categories, ${result.commitments} fixed expenses.`
      );
    } catch (e: any) {
      Alert.alert('Restore failed', e?.message ?? 'Could not read that file.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <Pressable testID="settings-back" onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Settings</Text>
      </View>

      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textMuted, marginLeft: spacing.xs }}>
          Backup & restore
        </Text>

        {/* Export */}
        <Pressable
          testID="settings-export"
          onPress={onExport}
          disabled={!!busy}
          style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: busy && busy !== 'export' ? 0.5 : 1 }}
        >
          <View style={{ width: 40, height: 40, borderRadius: radii.pill, backgroundColor: colors.primary + '22', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: colors.text }}>Back up my data</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
              Save a JSON file — send it to Google Drive, email, or your files.
            </Text>
          </View>
          {busy === 'export' ? <ActivityIndicator color={colors.primary} /> : <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />}
        </Pressable>

        {/* Restore */}
        <Pressable
          testID="settings-restore"
          onPress={onRestorePress}
          disabled={!!busy}
          style={{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: busy && busy !== 'import' ? 0.5 : 1 }}
        >
          <View style={{ width: 40, height: 40, borderRadius: radii.pill, backgroundColor: colors.warning + '22', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="cloud-download-outline" size={20} color={colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', color: colors.text }}>Restore from backup</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
              Replace all current data with a backup file.
            </Text>
          </View>
          {busy === 'import' ? <ActivityIndicator color={colors.warning} /> : <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />}
        </Pressable>

        <Text style={{ fontSize: 12, color: colors.textFaint, marginTop: spacing.xs, marginLeft: spacing.xs }}>
          Currently {txCount} transaction{txCount === 1 ? '' : 's'} · {commitmentCount} fixed expense{commitmentCount === 1 ? '' : 's'}.
        </Text>
      </View>
    </SafeAreaView>
  );
}
