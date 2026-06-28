import * as SQLite from 'expo-sqlite';
import { Transaction, Budget } from '@/types';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('expensetracker.db').then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY NOT NULL,
          amount REAL NOT NULL,
          type TEXT NOT NULL,
          categoryId TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          date TEXT NOT NULL,
          createdAt INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS budgets (
          categoryId TEXT NOT NULL,
          month TEXT NOT NULL,
          limitAmount REAL NOT NULL,
          PRIMARY KEY (categoryId, month)
        );
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date);
      `);
      return db;
    });
  }
  return dbPromise;
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDb();
  return db.getAllAsync<Transaction>(
    'SELECT * FROM transactions ORDER BY date DESC, createdAt DESC'
  );
}

export async function insertTransaction(t: Transaction): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO transactions (id, amount, type, categoryId, note, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    t.id, t.amount, t.type, t.categoryId, t.note, t.date, t.createdAt
  );
}

export async function updateTransaction(t: Transaction): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE transactions SET amount = ?, type = ?, categoryId = ?, note = ?, date = ? WHERE id = ?',
    t.amount, t.type, t.categoryId, t.note, t.date, t.id
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', id);
}

export async function getAllBudgets(): Promise<Budget[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ categoryId: string; month: string; limitAmount: number }>(
    'SELECT * FROM budgets'
  );
  return rows.map((r) => ({ categoryId: r.categoryId, month: r.month, limit: r.limitAmount }));
}

export async function upsertBudget(b: Budget): Promise<void> {
  const db = await getDb();
  if (b.limit <= 0) {
    await db.runAsync('DELETE FROM budgets WHERE categoryId = ? AND month = ?', b.categoryId, b.month);
    return;
  }
  await db.runAsync(
    `INSERT INTO budgets (categoryId, month, limitAmount) VALUES (?, ?, ?)
     ON CONFLICT (categoryId, month) DO UPDATE SET limitAmount = excluded.limitAmount`,
    b.categoryId, b.month, b.limit
  );
}
