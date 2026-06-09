import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BudgetScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Budget</Text>
      <Text style={styles.hint}>Set monthly limits per category here</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F0FF', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1B1F' },
  hint: { fontSize: 14, color: '#79747E', marginTop: 8, textAlign: 'center', paddingHorizontal: 32 },
});
