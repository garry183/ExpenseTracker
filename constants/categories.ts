import { Category } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food',          name: 'Food & Dining',  icon: 'restaurant-outline',    color: '#FF6B6B' },
  { id: 'transport',     name: 'Transport',       icon: 'car-outline',           color: '#4ECDC4' },
  { id: 'housing',       name: 'Housing',         icon: 'home-outline',          color: '#45B7D1' },
  { id: 'health',        name: 'Health',          icon: 'heart-outline',         color: '#96CEB4' },
  { id: 'shopping',      name: 'Shopping',        icon: 'bag-outline',           color: '#FFEAA7' },
  { id: 'entertainment', name: 'Entertainment',   icon: 'game-controller-outline', color: '#DDA0DD' },
  { id: 'utilities',     name: 'Utilities',       icon: 'flash-outline',         color: '#98D8C8' },
  { id: 'education',     name: 'Education',       icon: 'book-outline',          color: '#F7DC6F' },
  { id: 'salary',        name: 'Salary',          icon: 'briefcase-outline',     color: '#2ECC71' },
  { id: 'freelance',     name: 'Freelance',       icon: 'laptop-outline',        color: '#3498DB' },
  { id: 'investment',    name: 'Investment',      icon: 'trending-up-outline',   color: '#1ABC9C' },
  { id: 'other',         name: 'Other',           icon: 'ellipsis-horizontal-outline', color: '#BDC3C7' },
];

export const EXPENSE_CATEGORIES = DEFAULT_CATEGORIES.filter(
  c => !['salary', 'freelance', 'investment'].includes(c.id)
);

export const INCOME_CATEGORIES = DEFAULT_CATEGORIES.filter(
  c => ['salary', 'freelance', 'investment', 'other'].includes(c.id)
);

export function getCategoryById(id: string): Category {
  return DEFAULT_CATEGORIES.find(c => c.id === id) ?? DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
}
