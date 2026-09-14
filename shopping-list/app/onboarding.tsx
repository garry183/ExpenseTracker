import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, Card } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function Onboarding() {
  const router = useRouter();
  return (
    <Screen style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.logo}>🛒</Text>
        <Text style={typography.h1}>Shopping List</Text>
        <Text style={styles.tagline}>One list for the whole family.</Text>
      </View>

      {!isFirebaseConfigured && (
        <Card style={styles.warning}>
          <Text style={styles.warningTitle}>Firebase not configured</Text>
          <Text style={typography.label}>Copy .env.example to .env, add your Firebase web app keys, then restart the app.</Text>
        </Card>
      )}

      <View style={styles.actions}>
        <Button label="Create a Family / Group" icon="people" onPress={() => router.push('/create')} />
        <Button label="Join a Family / Group" icon="enter-outline" variant="secondary" onPress={() => router.push('/join')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  logo: { fontSize: 72, marginBottom: spacing.md },
  tagline: { ...typography.body, color: colors.textMuted },
  warning: { borderColor: colors.fruits, marginBottom: spacing.lg },
  warningTitle: { ...typography.title, color: colors.fruits, marginBottom: 4 },
  actions: { gap: spacing.md },
});
