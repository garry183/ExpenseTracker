import { create } from 'zustand';
import { Transaction, Budget, Category, Commitment, FinancePlan, AnnualExpenseInfo, AnnualExpenseStatus } from '@/types';
import { getCategoryById as resolveCategory, categoriesForType } from '@/constants/categories';
import { currentMonth, todayISO, daysInMonth, daysRemainingInMonth, daysBetween } from '@/lib/date';
import * as db from '@/lib/db';

const MONTHLY_BUDGET_KEY = 'monthlyBudget';
const MONTHLY_INCOME_KEY = 'monthlyIncome';
const SAVINGS_TARGET_KEY = 'savingsTarget';

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
  categories: Category[];
  commitments: Commitment[];
  monthlyBudget: number;
  monthlyIncome: number;
  savingsTarget: number;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addTransaction: (input: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setBudget: (categoryId: string, month: string, limit: number) => Promise<void>;
  addCategory: (input: Omit<Category, 'id' | 'isCustom'>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  setMonthlyBudget: (amount: number) => Promise<void>;
  setIncome: (amount: number) => Promise<void>;
  setSavingsTarget: (amount: number) => Promise<void>;
  addCommitment: (input: Omit<Commitment, 'id' | 'lastPostedMonth'>) => Promise<void>;
  updateCommitment: (c: Commitment) => Promise<void>;
  deleteCommitment: (id: string) => Promise<void>;
  postDueCommitments: () => Promise<void>;
  // selectors
  transactionsForMonth: (month: string) => Transaction[];
  monthTotals: (month: string) => MonthTotals;
  spentByCategory: (month: string) => Record<string, number>;
  budgetFor: (categoryId: string, month: string) => number;
  categoriesByType: (type: 'expense' | 'income') => Category[];
  categoryById: (id: string) => Category;
  monthlyLeft: (month: string) => number;
  committedTotal: () => number;
  annualExpenses: () => AnnualExpenseInfo[];
  financePlan: (month: string) => FinancePlan;
}

export const useStore = create<StoreState>((set, get) => ({
  transactions: [],
  budgets: [],
  categories: [],
  commitments: [],
  monthlyBudget: 0,
  monthlyIncome: 0,
  savingsTarget: 0,
  hydrated: false,

  hydrate: async () => {
    const [transactions, budgets, categories, commitments, monthlyBudgetRaw, incomeRaw, savingsRaw] =
      await Promise.all([
        db.getAllTransactions(),
        db.getAllBudgets(),
        db.getAllCategories(),
        db.getAllCommitments(),
        db.getSetting(MONTHLY_BUDGET_KEY),
        db.getSetting(MONTHLY_INCOME_KEY),
        db.getSetting(SAVINGS_TARGET_KEY),
      ]);
    // Yearly commitments are tracked in the Annual expenses view, not spent as
    // monthly transactions. Purge any that were auto-posted by earlier builds so
    // they stop showing up in Home and Analytics as monthly expenses.
    const yearlyIds = new Set(commitments.filter((c) => c.frequency === 'yearly').map((c) => c.id));
    const staleYearlyTx = yearlyIds.size
      ? transactions.filter((t) => t.commitmentId && yearlyIds.has(t.commitmentId))
      : [];
    if (staleYearlyTx.length) {
      await db.deleteTransactionsByCommitmentIds([...yearlyIds]);
    }
    const cleanTransactions = staleYearlyTx.length
      ? transactions.filter((t) => !(t.commitmentId && yearlyIds.has(t.commitmentId)))
      : transactions;

    set({
      transactions: cleanTransactions,
      budgets,
      categories,
      commitments,
      monthlyBudget: monthlyBudgetRaw ? parseFloat(monthlyBudgetRaw) || 0 : 0,
      monthlyIncome: incomeRaw ? parseFloat(incomeRaw) || 0 : 0,
      savingsTarget: savingsRaw ? parseFloat(savingsRaw) || 0 : 0,
      hydrated: true,
    });
    await get().postDueCommitments();
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

  addCategory: async (input) => {
    const cat: Category = { ...input, id: uid(), isCustom: true };
    await db.insertCategory(cat);
    set((s) => ({ categories: [...s.categories, cat] }));
    return cat;
  },

  deleteCategory: async (id) => {
    await db.deleteCategory(id);
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
  },

  setMonthlyBudget: async (amount) => {
    const value = Math.max(0, amount);
    await db.setSetting(MONTHLY_BUDGET_KEY, String(value));
    set({ monthlyBudget: value });
  },

  setIncome: async (amount) => {
    const value = Math.max(0, amount);
    await db.setSetting(MONTHLY_INCOME_KEY, String(value));
    set({ monthlyIncome: value });
  },

  setSavingsTarget: async (amount) => {
    const value = Math.max(0, amount);
    await db.setSetting(SAVINGS_TARGET_KEY, String(value));
    set({ savingsTarget: value });
  },

  addCommitment: async (input) => {
    const c: Commitment = { ...input, id: uid(), lastPostedMonth: null };
    await db.insertCommitment(c);
    set((s) => ({ commitments: sortCommitments([...s.commitments, c]) }));
    await get().postDueCommitments();
  },

  updateCommitment: async (c) => {
    await db.updateCommitment(c);
    set((s) => ({
      commitments: sortCommitments(s.commitments.map((x) => (x.id === c.id ? c : x))),
    }));
  },

  deleteCommitment: async (id) => {
    await db.deleteCommitment(id);
    set((s) => ({ commitments: s.commitments.filter((c) => c.id !== id) }));
  },

  postDueCommitments: async () => {
    const month = currentMonth();
    const monthNum = Number(month.slice(5, 7));
    const today = Number(todayISO().slice(8, 10));
    const dim = daysInMonth(month);
    const due = get().commitments.filter((c) => c.active && c.lastPostedMonth !== month);
    for (const c of due) {
      if (c.frequency === 'yearly' && c.monthOfYear !== monthNum) continue; // not its due month
      const day = Math.min(c.dayOfMonth, dim);
      if (today < day) continue; // not reached its due day yet this month

      // Yearly commitments are not spent as monthly transactions — that would
      // double-count them in Home and Analytics. Mark this year's occurrence as
      // paid (for the Annual expenses view) without posting a transaction.
      if (c.frequency === 'yearly') {
        const updated: Commitment = { ...c, lastPostedMonth: month };
        await db.updateCommitment(updated);
        set((s) => ({
          commitments: s.commitments.map((x) => (x.id === c.id ? updated : x)),
        }));
        continue;
      }

      const t: Transaction = {
        id: uid(),
        amount: c.amount,
        type: 'expense',
        categoryId: c.categoryId,
        note: c.name,
        date: `${month}-${String(day).padStart(2, '0')}`,
        createdAt: Date.now(),
        commitmentId: c.id,
      };
      await db.insertTransaction(t);
      const updated: Commitment = { ...c, lastPostedMonth: month };
      await db.updateCommitment(updated);
      set((s) => ({
        transactions: sortTx([t, ...s.transactions]),
        commitments: s.commitments.map((x) => (x.id === c.id ? updated : x)),
      }));
    }
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

  categoriesByType: (type) => {
    const cats = get().categories;
    return categoriesForType(cats.length ? cats : [], type);
  },

  categoryById: (id) => resolveCategory(id, get().categories),

  monthlyLeft: (month) => get().monthlyBudget - get().monthTotals(month).expense,

  committedTotal: () =>
    get()
      .commitments.filter((c) => c.active && c.frequency === 'monthly')
      .reduce((sum, c) => sum + c.amount, 0),

  annualExpenses: () => {
    const today = todayISO();
    return get()
      .commitments.filter((c) => c.frequency === 'yearly' && c.active)
      .map((c) => annualExpenseInfoFor(c, today))
      .sort((a, b) => a.daysUntil - b.daysUntil);
  },

  financePlan: (month) => {
    const income = get().monthlyIncome;
    const savings = get().savingsTarget;
    const committed = get().committedTotal();
    const discretionarySpent = get()
      .transactionsForMonth(month)
      .filter((t) => t.type === 'expense' && !t.commitmentId)
      .reduce((sum, t) => sum + t.amount, 0);
    const safeToSpend = income - committed - savings - discretionarySpent;
    const perDay = safeToSpend / daysRemainingInMonth(month);
    return { income, committed, savings, discretionarySpent, safeToSpend, perDay };
  },
}));

function annualExpenseInfoFor(c: Commitment, today: string): AnnualExpenseInfo {
  const year = today.slice(0, 4);
  const monthOfYear = c.monthOfYear ?? 1;
  const monthStr = `${year}-${String(monthOfYear).padStart(2, '0')}`;
  const day = Math.min(c.dayOfMonth, daysInMonth(monthStr));
  const dueDate = `${monthStr}-${String(day).padStart(2, '0')}`;
  const paid = !!c.lastPostedMonth && c.lastPostedMonth.slice(0, 4) === year;
  const daysUntil = daysBetween(today, dueDate);

  let status: AnnualExpenseStatus;
  if (paid) status = 'paid';
  else if (daysUntil < 0) status = 'overdue';
  else if (daysUntil <= 45) status = 'dueSoon';
  else status = 'upcoming';

  const monthsRemaining = Math.max(1, Math.ceil(Math.max(daysUntil, 0) / 30));
  const perMonthToSave = c.amount / monthsRemaining;

  return { commitment: c, dueDate, daysUntil, status, perMonthToSave };
}

function sortTx(txs: Transaction[]): Transaction[] {
  return [...txs].sort((a, b) =>
    a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1
  );
}

function sortCommitments(cs: Commitment[]): Commitment[] {
  return [...cs].sort((a, b) =>
    a.dayOfMonth === b.dayOfMonth ? a.name.localeCompare(b.name) : a.dayOfMonth - b.dayOfMonth
  );
}
