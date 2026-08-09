import { Category } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food',          name: 'Food & Dining',  icon: 'restaurant-outline',    color: '#FF6B6B', type: 'expense' },
  { id: 'transport',     name: 'Transport',       icon: 'car-outline',           color: '#4ECDC4', type: 'expense' },
  { id: 'housing',       name: 'Housing',         icon: 'home-outline',          color: '#45B7D1', type: 'expense' },
  { id: 'health',        name: 'Health',          icon: 'heart-outline',         color: '#96CEB4', type: 'expense' },
  { id: 'shopping',      name: 'Shopping',        icon: 'bag-outline',           color: '#FFEAA7', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment',   icon: 'game-controller-outline', color: '#DDA0DD', type: 'expense' },
  { id: 'utilities',     name: 'Utilities',       icon: 'flash-outline',         color: '#98D8C8', type: 'expense' },
  { id: 'education',     name: 'Education',       icon: 'book-outline',          color: '#F7DC6F', type: 'expense' },
  { id: 'salary',        name: 'Salary',          icon: 'briefcase-outline',     color: '#2ECC71', type: 'income' },
  { id: 'freelance',     name: 'Freelance',       icon: 'laptop-outline',        color: '#3498DB', type: 'income' },
  { id: 'investment',    name: 'Investment',      icon: 'trending-up-outline',   color: '#1ABC9C', type: 'income' },
  { id: 'other',         name: 'Other',           icon: 'ellipsis-horizontal-outline', color: '#BDC3C7', type: 'both' },
];

// Fallback resolver for ids not found in the live store (e.g. deleted category).
export function getCategoryById(id: string, categories: Category[] = DEFAULT_CATEGORIES): Category {
  return (
    categories.find((c) => c.id === id) ??
    DEFAULT_CATEGORIES.find((c) => c.id === id) ??
    DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1]
  );
}

export function categoriesForType(categories: Category[], type: 'expense' | 'income'): Category[] {
  return categories.filter((c) => c.type === type || c.type === 'both');
}

// Pickers for the custom-category editor.
export const CATEGORY_COLORS = [
  '#FF6B6B', '#FF8C42', '#FFB100', '#F7DC6F', '#2ECC71', '#1ABC9C',
  '#4ECDC4', '#45B7D1', '#3498DB', '#6750A4', '#9B59B6', '#DDA0DD',
  '#E84393', '#96CEB4', '#98D8C8', '#BDC3C7',
];

export const CATEGORY_ICONS = [
  'fast-food-outline', 'cafe-outline', 'cart-outline', 'gift-outline', 'shirt-outline',
  'bus-outline', 'airplane-outline', 'bicycle-outline', 'medkit-outline', 'fitness-outline',
  'paw-outline', 'school-outline', 'wifi-outline', 'phone-portrait-outline', 'tv-outline',
  'musical-notes-outline', 'film-outline', 'beer-outline', 'construct-outline', 'cash-outline',
  'card-outline', 'wallet-outline', 'pricetag-outline', 'star-outline',
];
