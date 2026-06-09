import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Transaction</Text>
      <Text style={styles.hint}>Coming soon — manual entry, voice, and receipt scan</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F0FF', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1B1F' },
  hint: { fontSize: 14, color: '#79747E', marginTop: 8, textAlign: 'center', paddingHorizontal: 32 },
});
