import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Header, Button, Input } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';
import { useStore } from '@/store/useStore';

export default function CreateGroup() {
  const router = useRouter();
  const createGroup = useStore((s) => s.createGroup);
  const savedName = useStore((s) => s.session?.userName ?? '');
  const [groupName, setGroupName] = useState('');
  const [userName, setUserName] = useState(savedName);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await createGroup(groupName, userName);
      router.replace('/home');
    } catch (e) {
      Alert.alert('Could not create family', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Header title="Create Family" back />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.form}>
        <View style={styles.field}>
          <Text style={typography.label}>Family / group name</Text>
          <Input value={groupName} onChangeText={setGroupName} placeholder="e.g. Our Home" autoFocus accessibilityLabel="Family name" />
        </View>
        <View style={styles.field}>
          <Text style={typography.label}>Your name</Text>
          <Input value={userName} onChangeText={setUserName} placeholder="e.g. Priya" accessibilityLabel="Your name" />
        </View>
        <Button label="Create" onPress={submit} loading={busy} disabled={!groupName.trim() || !userName.trim()} />
        <Text style={styles.hint}>We'll generate a join code you can share from Settings.</Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { padding: spacing.xl, gap: spacing.lg },
  field: { gap: spacing.sm },
  hint: { ...typography.label, textAlign: 'center' },
});
