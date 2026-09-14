import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { CatalogItem } from '@/types';

interface Props {
  item: Pick<CatalogItem, 'emoji' | 'image' | 'name'>;
  size?: number;
}

export default function ItemImage({ item, size = 44 }: Props) {
  const box = { width: size, height: size, borderRadius: size * 0.28 };
  if (item.image) {
    return <Image source={{ uri: item.image }} style={[styles.box, box]} accessibilityLabel={item.name} />;
  }
  return (
    <View style={[styles.box, box, styles.emojiBox]}>
      <Text style={{ fontSize: size * 0.55 }}>{item.emoji ?? '🛒'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surfaceAlt },
  emojiBox: { alignItems: 'center', justifyContent: 'center' },
});
