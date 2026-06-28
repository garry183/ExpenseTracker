import { create } from 'zustand';
import { Transaction, Budget } from '@/types';
import * as db from '@/lib/db';

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function monthOf(date: string): string {
  return date.slice(0, 7); // YYYY-MM
}

interface MonthTotals {
  income: number;
  expense: number;
  balance: number;
}

interface StoreState {
  transactions: Transaction[];
  budgets: Budget[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addTransaction: (input: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setBudget: (categoryId: string, month: string, limit: number) => Promise<void>;
  // selectors
  transactionsForMonth: (month: string) => Transaction[];
  monthTotals: (month: string) => MonthTotals;
  spentByCategory: (month: string) => Record<string, number>;
  budgetFor: (categoryId: string, month: string) => number;
}

export const useStore = create<StoreState>((set, get) => ({
  transactions: [],
  budgets: [],
  hydrated: false,

  hydrate: async () => {
    const [transactions, budgets] = await Promise.all([
      db.getAllTransactions(),
      db.getAllBudgets(),
    ]);
    set({ transactions, budgets, hydrated: true });
  },

  addTransaction: async (input) => {
    const t: Transaction = { ...input, id: uid(), createdAt: Date.now() };
    await db.insertTransaction(t);
    set((s) => ({ transactions: sortTx([t, ...s.transactions]) }));
  },

  updateTransaction: async (t) => {
    await db.updateTransaction(t);
    set((s) => ({
      transactions: sortTx(s.transactions.map((x) => (x.id === t.id ? t : x))),
    }));
  },

  deleteTransaction: async (id) => {
    await db.deleteTransaction(id);
    set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) }));
  },

  setBudget: async (categoryId, month, limit) => {
    await db.upsertBudget({ categoryId, month, limit });
    set((s) => {
      const rest = s.budgets.filter((b) => !(b.categoryId === categoryId && b.month === month));
      return { budgets: limit > 0 ? [...rest, { categoryId, month, limit }] : rest };
    });
  },

  transactionsForMonth: (month) => get().transactions.filter((t) => monthOf(t.date) === month),

  monthTotals: (month) => {
    const txs = get().transactionsForMonth(month);
    const income = txs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = txs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  },

  spentByCategory: (month) => {
    const txs = get().transactionsForMonth(month).filter((t) => t.type === 'expense');
    return txs.reduce<Record<string, number>>((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] ?? 0) + t.amount;
      return acc;
    }, {});
  },

  budgetFor: (categoryId, month) =>
    get().budgets.find((b) => b.categoryId === categoryId && b.month === month)?.limit ?? 0,
}));

function sortTx(txs: Transaction[]): Transaction[] {
  return [...txs].sort((a, b) =>
    a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1
  );
}
