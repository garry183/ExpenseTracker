import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '@/constants/theme';

export interface DonutSlice {
  value: number;
  color: string;
}

interface Props {
  slices: DonutSlice[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSub?: string;
}

export default function Donut({ slices, size = 180, strokeWidth = 28, centerLabel, centerSub }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  let offset = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {total > 0 &&
            slices.map((s, i) => {
              const fraction = s.value / total;
              const dash = fraction * circumference;
              const circle = (
                <Circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={s.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += dash;
              return circle;
            })}
        </G>
      </Svg>
      {(centerLabel || centerSub) && (
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          {centerLabel ? (
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{centerLabel}</Text>
          ) : null}
          {centerSub ? <Text style={{ fontSize: 12, color: colors.textMuted }}>{centerSub}</Text> : null}
        </View>
      )}
    </View>
  );
}
