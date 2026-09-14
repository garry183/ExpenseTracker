import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Header, Button, Input } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { normalizeCode } from '@/lib/codes';

export default function JoinGroup() {
  const router = useRouter();
  const joinGroup = useStore((s) => s.joinGroup);
  const savedName = useStore((s) => s.session?.userName ?? '');
  const [code, setCode] = useState('');
  const [userName, setUserName] = useState(savedName);
  const [busy, setBusy] = useState(false);

  const valid = normalizeCode(code).length === 6 && userName.trim().length > 0;

  async function submit() {
    setBusy(true);
    try {
      await joinGroup(code, userName);
      router.replace('/home');
    } catch (e) {
      Alert.alert('Could not join', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Header title="Join Family" back />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.form}>
        <View style={styles.field}>
          <Text style={typography.label}>Join code</Text>
          <Input
            value={code}
            onChangeText={(t) => setCode(normalizeCode(t).slice(0, 6))}
            placeholder="A7K9P2"
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
            accessibilityLabel="Join code"
            style={styles.codeInput}
          />
        </View>
        <View style={styles.field}>
          <Text style={typography.label}>Your name</Text>
          <Input value={userName} onChangeText={setUserName} placeholder="e.g. Arjun" accessibilityLabel="Your name" />
        </View>
        <Button label="Join" onPress={submit} loading={busy} disabled={!valid} />
        <Text style={styles.hint}>Ask a family member for the 6-character code shown in their Settings.</Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { padding: spacing.xl, gap: spacing.lg },
  field: { gap: spacing.sm },
  codeInput: { fontSize: 28, fontWeight: '800', letterSpacing: 6, textAlign: 'center', height: 64 },
  hint: { ...typography.label, textAlign: 'center' },
});
