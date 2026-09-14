import { CatalogItem, Category, CategoryId } from '@/types';
import { colors } from './theme';

export const CATEGORIES: Category[] = [
  { id: 'vegetables', name: 'Vegetables', singular: 'Vegetable', emoji: '🥬', color: colors.vegetables },
  { id: 'fruits', name: 'Fruits', singular: 'Fruit', emoji: '🍎', color: colors.fruits },
  { id: 'groceries', name: 'Groceries', singular: 'Grocery', emoji: '🛒', color: colors.groceries },
];

export function categoryById(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

function items(category: CategoryId, rows: [string, string][]): CatalogItem[] {
  return rows.map(([name, emoji]) => ({
    id: `${category}:${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    category,
    name,
    emoji,
    isCustom: false,
  }));
}

export const DEFAULT_CATALOG: CatalogItem[] = [
  ...items('vegetables', [
    ['Tomato', '🍅'],
    ['Onion', '🧅'],
    ['Potato', '🥔'],
    ['Carrot', '🥕'],
    ['Broccoli', '🥦'],
    ['Capsicum', '🫑'],
    ['Cabbage', '🥬'],
    ['Cauliflower', '🥦'],
    ['Spinach', '🌿'],
    ['Cucumber', '🥒'],
    ['Garlic', '🧄'],
    ['Ginger', '🫚'],
    ['Green Chilli', '🌶️'],
    ['Coriander', '🌿'],
    ['Lemon', '🍋'],
    ['Beans', '🫛'],
    ['Peas', '🫛'],
    ['Brinjal', '🍆'],
    ['Mushroom', '🍄'],
    ['Corn', '🌽'],
  ]),
  ...items('fruits', [
    ['Apple', '🍎'],
    ['Banana', '🍌'],
    ['Orange', '🍊'],
    ['Mango', '🥭'],
    ['Grapes', '🍇'],
    ['Watermelon', '🍉'],
    ['Strawberry', '🍓'],
    ['Pineapple', '🍍'],
    ['Papaya', '🧡'],
    ['Pomegranate', '🔴'],
    ['Pear', '🍐'],
    ['Peach', '🍑'],
    ['Cherry', '🍒'],
    ['Kiwi', '🥝'],
    ['Melon', '🍈'],
    ['Blueberry', '🫐'],
    ['Coconut', '🥥'],
    ['Guava', '🟢'],
    ['Avocado', '🥑'],
    ['Dates', '🌴'],
  ]),
  ...items('groceries', [
    ['Milk', '🥛'],
    ['Eggs', '🥚'],
    ['Bread', '🍞'],
    ['Rice', '🍚'],
    ['Wheat Flour', '🌾'],
    ['Sugar', '🧂'],
    ['Salt', '🧂'],
    ['Cooking Oil', '🫙'],
    ['Butter', '🧈'],
    ['Cheese', '🧀'],
    ['Yogurt', '🥣'],
    ['Tea', '🍵'],
    ['Coffee', '☕'],
    ['Pasta', '🍝'],
    ['Lentils', '🫘'],
    ['Chickpeas', '🫘'],
    ['Biscuits', '🍪'],
    ['Cereal', '🥣'],
    ['Dish Soap', '🧴'],
    ['Toilet Paper', '🧻'],
  ]),
];

export const UNITS = ['kg', 'grams', 'litre', 'ml', 'piece', 'pack', 'dozen', 'bunch'] as const;

export const DEFAULT_UNIT: Record<CategoryId, string> = {
  vegetables: 'kg',
  fruits: 'kg',
  groceries: 'pack',
};

export const EMOJI_CHOICES = [
  '🥬', '🥕', '🍅', '🧅', '🥔', '🥦', '🫑', '🥒', '🍆', '🌽', '🍄', '🧄', '🌶️', '🌿', '🫛',
  '🍎', '🍌', '🍊', '🥭', '🍇', '🍉', '🍓', '🍍', '🍐', '🍑', '🍒', '🥝', '🍈', '🫐', '🥥',
  '🥛', '🥚', '🍞', '🍚', '🧈', '🧀', '🍵', '☕', '🍝', '🫘', '🍪', '🥣', '🧴', '🧻', '🧂',
  '🍗', '🐟', '🍫', '🍯', '🥜', '🧃', '🥤', '🧼', '🪥', '🧺',
];
