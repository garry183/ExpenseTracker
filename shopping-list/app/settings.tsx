import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Screen, Header, Card } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useStore } from '@/store/useStore';

export default function Settings() {
  const router = useRouter();
  const group = useStore((s) => s.group);
  const members = useStore((s) => s.members);
  const session = useStore((s) => s.session);
  const leaveGroup = useStore((s) => s.leaveGroup);
  const [copied, setCopied] = useState(false);
  const [showMembers, setShowMembers] = useState(true);

  const code = group?.code ?? session?.groupCode ?? '';
  const message = `Join our family shopping list "${group?.name}" — open the app, tap "Join a Family / Group" and enter code ${code}`;

  async function copy() {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function share() {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
      await copy();
      return;
    }
    try {
      await Share.share({ message });
    } catch {
      await copy();
    }
  }

  function confirmLeave() {
    const doLeave = async () => {
      await leaveGroup();
      router.replace('/onboarding');
    };
    if (Platform.OS === 'web') {
      if (confirm('Leave this family? You can rejoin any time with the code.')) doLeave();
      return;
    }
    Alert.alert('Leave family?', 'You can rejoin any time with the join code.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: doLeave },
    ]);
  }

  return (
    <Screen>
      <Header title="Settings" back />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>Family / Group</Text>

        <Card style={styles.groupCard}>
          <View style={styles.groupIcon}>
            <Ionicons name="home" size={24} color={colors.groceries} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={typography.h2}>{group?.name ?? 'Connecting…'}</Text>
            <Text style={typography.label}>Join Code</Text>
            <Text style={styles.code} selectable>
              {code}
            </Text>
          </View>
          <Pressable onPress={copy} hitSlop={10} accessibilityLabel="Copy join code" style={styles.copyBtn}>
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={22} color={copied ? colors.primary : colors.text} />
          </Pressable>
        </Card>

        <Row icon="share-social-outline" label="Share Code" onPress={share} />
        <Row
          icon="people-outline"
          label="Members"
          value={String(members.length)}
          chevron={showMembers ? 'chevron-down' : 'chevron-forward'}
          onPress={() => setShowMembers((v) => !v)}
        />
        {showMembers && (
          <Card style={styles.members}>
            {members.length === 0 && <Text style={typography.label}>Loading members…</Text>}
            {members.map((m) => (
              <View key={m.id} style={styles.member}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{m.name.slice(0, 1).toUpperCase()}</Text>
                </View>
                <Text style={typography.body}>
                  {m.name}
                  {m.id === session?.deviceId ? ' (you)' : ''}
                </Text>
              </View>
            ))}
          </Card>
        )}

        <Text style={styles.section}>App</Text>
        <Row icon="log-out-outline" label="Leave family" onPress={confirmLeave} danger />
        <Text style={styles.version}>Shopping List v1.0</Text>
      </ScrollView>
    </Screen>
  );
}

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  chevron?: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  onPress: () => void;
}

function Row({ icon, label, value, chevron = 'chevron-forward', danger, onPress }: RowProps) {
  const tint = danger ? colors.danger : colors.text;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={22} color={tint} />
      <Text style={[typography.body, { flex: 1, color: tint }]}>{label}</Text>
      {value ? <Text style={typography.label}>{value}</Text> : null}
      <Ionicons name={chevron} size={18} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.sm },
  section: { ...typography.label, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.md, marginBottom: spacing.xs },
  groupCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  groupIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  code: { fontSize: 24, fontWeight: '800', letterSpacing: 4, color: colors.text },
  copyBtn: { padding: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  members: { gap: spacing.md },
  member: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primary, fontWeight: '800' },
  version: { ...typography.label, textAlign: 'center', marginTop: spacing.xl },
});
