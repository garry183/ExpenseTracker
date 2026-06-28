import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '@/types';
import { colors, spacing, radii } from '@/constants/theme';

interface Props {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function CategoryGrid({ categories, selectedId, onSelect }: Props) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'flex-start' }}>
      {categories.map((cat) => {
        const selected = cat.id === selectedId;
        return (
          <Pressable
            key={cat.id}
            testID={`category-${cat.id}`}
            onPress={() => onSelect(cat.id)}
            style={{ width: '22%', alignItems: 'center', paddingVertical: spacing.sm }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: radii.pill,
                backgroundColor: cat.color,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: selected ? 3 : 0,
                borderColor: colors.text,
                opacity: selected || !selectedId ? 1 : 0.55,
              }}
            >
              <Ionicons name={cat.icon as any} size={24} color="#FFFFFF" />
            </View>
            <Text
              numberOfLines={1}
              style={{ fontSize: 11, color: colors.textMuted, marginTop: spacing.xs, maxWidth: 64, textAlign: 'center' }}
            >
              {cat.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
