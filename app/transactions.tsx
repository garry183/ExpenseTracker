import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TransactionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>
      <Text style={styles.hint}>Your expenses and income will appear here</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F0FF', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1B1F' },
  hint: { fontSize: 14, color: '#79747E', marginTop: 8, textAlign: 'center', paddingHorizontal: 32 },
});
