export type TransactionType = 'expense' | 'income';

export type CategoryType = 'expense' | 'income' | 'both';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  note: string;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: number; // unix timestamp
  commitmentId?: string; // set when auto-posted from a fixed commitment
}

export interface Budget {
  categoryId: string;
  limit: number;
  month: string; // YYYY-MM
}

// A recurring fixed obligation (EMI, rent, subscription) that auto-posts monthly.
export interface Commitment {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  dayOfMonth: number; // 1-31, clamped to month length when posted
  active: boolean;
  lastPostedMonth: string | null; // YYYY-MM of the last auto-post
}

// Derived monthly cash-flow plan (not persisted).
export interface FinancePlan {
  income: number;
  committed: number;
  savings: number;
  discretionarySpent: number;
  safeToSpend: number;
  perDay: number;
}
