import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen, Header, Button } from '@/components/ui';
import ItemRow from '@/components/ItemRow';
import QuantityModal from '@/components/QuantityModal';
import AddItemModal from '@/components/AddItemModal';
import { categoryById, DEFAULT_UNIT } from '@/constants/catalog';
import { spacing } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { CatalogItem, CategoryId } from '@/types';
import { stepFor } from '@/lib/quantity';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = categoryById(id);
  const categoryId = category.id as CategoryId;

  const entries = useStore((s) => s.entries);
  const customItems = useStore((s) => s.customItems);
  const catalogFor = useStore((s) => s.catalogFor);
  const selectItem = useStore((s) => s.selectItem);
  const unselectItem = useStore((s) => s.unselectItem);
  const addCustomItem = useStore((s) => s.addCustomItem);
  void customItems;

  const items = catalogFor(categoryId);
  const selectedCount = items.filter((i) => entries[i.id]).length;

  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [adding, setAdding] = useState(false);

  function step(item: CatalogItem, direction: 1 | -1) {
    const entry = entries[item.id];
    if (!entry) {
      if (direction === 1) selectItem(item, 1, DEFAULT_UNIT[categoryId]);
      return;
    }
    const next = Math.round((entry.qty + direction * stepFor(entry.unit)) * 100) / 100;
    if (next <= 0) unselectItem(item.id);
    else selectItem(item, next, entry.unit);
  }

  return (
    <Screen>
      <Header title={category.name} subtitle={`${selectedCount} of ${items.length} selected`} back />

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ItemRow
            item={item}
            entry={entries[item.id]}
            color={category.color}
            onToggle={() => (entries[item.id] ? unselectItem(item.id) : setEditing(item))}
            onEditQty={() => setEditing(item)}
            onStep={(d) => step(item, d)}
          />
        )}
      />

      <View style={styles.footer}>
        <Button
          label={`Add New ${category.singular}`}
          icon="add"
          onPress={() => setAdding(true)}
          style={{ backgroundColor: category.color }}
        />
      </View>

      <QuantityModal
        item={editing}
        entry={editing ? entries[editing.id] : undefined}
        defaultUnit={DEFAULT_UNIT[categoryId]}
        color={category.color}
        onConfirm={(qty, unit) => {
          if (editing) selectItem(editing, qty, unit);
          setEditing(null);
        }}
        onRemove={() => {
          if (editing) unselectItem(editing.id);
          setEditing(null);
        }}
        onClose={() => setEditing(null)}
      />

      <AddItemModal
        visible={adding}
        category={category}
        onSave={(name, emoji, image) => addCustomItem(categoryId, name, emoji, image)}
        onClose={() => setAdding(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  footer: { padding: spacing.lg, paddingTop: spacing.sm },
});
