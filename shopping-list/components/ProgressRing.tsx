import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/constants/theme';

interface Props {
  label: string;
  emoji: string;
  selected: number;
  total: number;
  color: string;
  size?: number;
  onPress: () => void;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const s = polar(cx, cy, r, from);
  const e = polar(cx, cy, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export default function ProgressRing({ label, emoji, selected, total, color, size = 150, onPress }: Props) {
  const strokeWidth = 12;
  const r = (size - strokeWidth) / 2;
  const c = size / 2;
  const segments = Math.max(total, 1);
  const gap = segments > 24 ? 2 : 4;
  const segDeg = 360 / segments;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${selected} of ${total} selected`}
      style={({ pressed }) => [styles.wrap, { width: size, height: size, opacity: pressed ? 0.8 : 1 }]}
    >
      <Svg width={size} height={size}>
        {Array.from({ length: segments }, (_, i) => {
          const from = i * segDeg + gap / 2;
          const to = (i + 1) * segDeg - gap / 2;
          return (
            <Path
              key={i}
              d={arcPath(c, c, r, from, to)}
              stroke={i < selected ? color : colors.ringTrack}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              fill="none"
            />
          );
        })}
      </Svg>
      <View style={styles.center}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.count, { color }]}>
          {selected}/{total}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  emoji: { fontSize: 30, marginBottom: 2 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  count: { fontSize: 16, fontWeight: '800', marginTop: 2 },
});
