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

export type CommitmentFrequency = 'monthly' | 'yearly';

// A recurring fixed obligation. Monthly ones (EMI, rent, subscription) auto-post
// every month; yearly ones (insurance, LIC, PPF) auto-post once, in monthOfYear.
export interface Commitment {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  frequency: CommitmentFrequency;
  dayOfMonth: number; // 1-31, clamped to month length when posted
  monthOfYear: number | null; // 1-12, due month for yearly; null for monthly
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

export type AnnualExpenseStatus = 'paid' | 'overdue' | 'dueSoon' | 'upcoming';

// Derived view of a yearly commitment's status for the current year (not persisted).
export interface AnnualExpenseInfo {
  commitment: Commitment;
  dueDate: string; // YYYY-MM-DD, this year's occurrence
  daysUntil: number; // negative if past due and not yet posted
  status: AnnualExpenseStatus;
  perMonthToSave: number; // amount / months remaining until due (min 1)
}
