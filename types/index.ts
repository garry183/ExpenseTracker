export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  note: string;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: number; // unix timestamp
}

export interface Budget {
  categoryId: string;
  limit: number;
  month: string; // YYYY-MM
}
