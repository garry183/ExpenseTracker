import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Header } from '@/components/ui';
import ProgressRing from '@/components/ProgressRing';
import { CATEGORIES } from '@/constants/catalog';
import { colors, spacing, typography } from '@/constants/theme';
import { useStore } from '@/store/useStore';

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const group = useStore((s) => s.group);
  const entries = useStore((s) => s.entries);
  const customItems = useStore((s) => s.customItems);
  const progressFor = useStore((s) => s.progressFor);

  // entries/customItems are read so this screen re-renders on every shared change.
  void entries;
  void customItems;

  const ringSize = Math.min(160, Math.floor((width - spacing.xl * 2 - spacing.lg) / 2));
  const totalSelected = Object.keys(entries).length;
  const [veg, fruit, groc] = CATEGORIES;

  return (
    <Screen>
      <Header
        title="My Shopping"
        subtitle={group?.name ?? 'Connecting…'}
        right={
          <Pressable onPress={() => router.push('/settings')} hitSlop={10} accessibilityLabel="Settings">
            <Ionicons name="settings-outline" size={26} color={colors.text} />
          </Pressable>
        }
      />

      <View style={styles.rings}>
        <View style={styles.row}>
          {[veg, fruit].map((c) => {
            const p = progressFor(c.id);
            return (
              <ProgressRing
                key={c.id}
                label={c.name}
                emoji={c.emoji}
                selected={p.selected}
                total={p.total}
                color={c.color}
                size={ringSize}
                onPress={() => router.push(`/category/${c.id}`)}
              />
            );
          })}
        </View>
        <View style={styles.row}>
          <ProgressRing
            label={groc.name}
            emoji={groc.emoji}
            selected={progressFor(groc.id).selected}
            total={progressFor(groc.id).total}
            color={groc.color}
            size={ringSize}
            onPress={() => router.push(`/category/${groc.id}`)}
          />
        </View>
      </View>

      <Text style={styles.hint}>
        {totalSelected === 0 ? 'Tap a category to get started' : `${totalSelected} item${totalSelected === 1 ? '' : 's'} to buy`}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rings: { flex: 1, justifyContent: 'center', gap: spacing.xl, paddingHorizontal: spacing.xl },
  row: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg },
  hint: { ...typography.label, textAlign: 'center', paddingBottom: spacing.xxl },
});
