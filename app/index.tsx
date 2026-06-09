import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.month}>June 2026</Text>
        </View>

        <View style={styles.safeCard}>
          <Text style={styles.safeLabel}>Safe to spend today</Text>
          <Text style={styles.safeAmount}>₹0</Text>
          <Text style={styles.safeHint}>Set up your budget to see this</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.summaryCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: '#2E7D32' }]}>₹0</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FFEBEE' }]}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, { color: '#C62828' }]}>₹0</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Text style={styles.empty}>No transactions yet. Tap + to add one.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F0FF' },
  header: { padding: 20, paddingBottom: 8 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#1C1B1F' },
  month: { fontSize: 14, color: '#79747E', marginTop: 2 },
  safeCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#6750A4',
    borderRadius: 20,
    alignItems: 'center',
  },
  safeLabel: { color: '#E8DEF8', fontSize: 14 },
  safeAmount: { color: '#fff', fontSize: 48, fontWeight: '800', marginVertical: 4 },
  safeHint: { color: '#CAC4D0', fontSize: 12 },
  row: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 12, color: '#49454F' },
  summaryAmount: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', margin: 16, marginBottom: 8, color: '#1C1B1F' },
  empty: { textAlign: 'center', color: '#79747E', marginTop: 32, fontSize: 14 },
});
