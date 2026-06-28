import { View, Text } from 'react-native';
import { colors, radii, spacing, formatAmount } from '@/constants/theme';

export interface Bar {
  label: string;
  value: number;
  highlight?: boolean;
}

interface Props {
  bars: Bar[];
  height?: number;
}

export default function Bars({ bars, height = 140 }: Props) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: height + 40 }}>
      {bars.map((b, i) => {
        const barHeight = Math.round((b.value / max) * height);
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
            <Text style={{ fontSize: 10, color: colors.textMuted }} numberOfLines={1}>
              {b.value > 0 ? formatAmount(b.value) : ''}
            </Text>
            <View
              style={{
                width: '60%',
                height: Math.max(barHeight, 2),
                backgroundColor: b.highlight ? colors.primary : colors.surfaceAlt,
                borderTopLeftRadius: radii.sm,
                borderTopRightRadius: radii.sm,
              }}
            />
            <Text style={{ fontSize: 11, color: colors.textMuted }}>{b.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
