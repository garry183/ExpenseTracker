import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '@/constants/theme';

export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | '+' | '-' | 'back';

interface Props {
  onKey: (key: KeypadKey) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  submitLabel?: string;
}

const ROWS: KeypadKey[][] = [
  ['7', '8', '9', 'back'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
];

export default function Keypad({ onKey, onSubmit, canSubmit, submitLabel = 'Save' }: Props) {
  return (
    <View style={{ backgroundColor: colors.surfaceAlt, padding: spacing.sm, gap: spacing.sm }}>
      {ROWS.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: spacing.sm }}>
          {row.map((k) => (
            <Key key={k} k={k} onPress={() => onKey(k)} />
          ))}
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Key k="." onPress={() => onKey('.')} />
        <Key k="0" onPress={() => onKey('0')} />
        <Pressable
          testID="keypad-save"
          disabled={!canSubmit}
          onPress={onSubmit}
          style={{
            flex: 2,
            backgroundColor: canSubmit ? colors.primary : colors.border,
            borderRadius: radii.md,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.lg,
          }}
        >
          <Text style={{ color: canSubmit ? colors.onPrimary : colors.textFaint, fontSize: 18, fontWeight: '700' }}>
            {submitLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Key({ k, onPress }: { k: KeypadKey; onPress: () => void }) {
  const isOp = k === '+' || k === '-' || k === 'back';
  return (
    <Pressable
      testID={`key-${k}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: pressed ? colors.surfaceAlt : isOp ? colors.surface : colors.keypad,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
      })}
    >
      {k === 'back' ? (
        <Ionicons name="backspace-outline" size={22} color={colors.text} />
      ) : (
        <Text style={{ fontSize: 22, fontWeight: '600', color: isOp ? colors.primary : colors.keypadText }}>{k}</Text>
      )}
    </Pressable>
  );
}
