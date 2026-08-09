import * as SQLite from 'expo-sqlite';
import { Transaction, Budget, Category, Commitment } from '@/types';
import { DEFAULT_CATEGORIES } from '@/constants/categories';

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
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          icon TEXT NOT NULL,
          color TEXT NOT NULL,
          type TEXT NOT NULL,
          isCustom INTEGER NOT NULL DEFAULT 0,
          sortOrder INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS commitments (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          amount REAL NOT NULL,
          categoryId TEXT NOT NULL,
          dayOfMonth INTEGER NOT NULL DEFAULT 1,
          active INTEGER NOT NULL DEFAULT 1,
          lastPostedMonth TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date);
      `);

      // Migration for installs created before commitments landed.
      try {
        await db.execAsync('ALTER TABLE transactions ADD COLUMN commitmentId TEXT');
      } catch {
        // column already exists — ignore
      }

      // Seed default categories on first run only.
      const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
      if (!row || row.count === 0) {
        for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
          const c = DEFAULT_CATEGORIES[i];
          await db.runAsync(
            'INSERT OR IGNORE INTO categories (id, name, icon, color, type, isCustom, sortOrder) VALUES (?, ?, ?, ?, ?, 0, ?)',
            c.id, c.name, c.icon, c.color, c.type, i
          );
        }
      }
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
    'INSERT INTO transactions (id, amount, type, categoryId, note, date, createdAt, commitmentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    t.id, t.amount, t.type, t.categoryId, t.note, t.date, t.createdAt, t.commitmentId ?? null
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

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string; name: string; icon: string; color: string; type: string; isCustom: number;
  }>('SELECT * FROM categories ORDER BY sortOrder ASC, name ASC');
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    color: r.color,
    type: r.type as Category['type'],
    isCustom: r.isCustom === 1,
  }));
}

export async function insertCategory(c: Category): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO categories (id, name, icon, color, type, isCustom, sortOrder) VALUES (?, ?, ?, ?, ?, ?, 1000)',
    c.id, c.name, c.icon, c.color, c.type, c.isCustom ? 1 : 0
  );
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM categories WHERE id = ? AND isCustom = 1', id);
}

export async function getAllCommitments(): Promise<Commitment[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string; name: string; amount: number; categoryId: string;
    dayOfMonth: number; active: number; lastPostedMonth: string | null;
  }>('SELECT * FROM commitments ORDER BY dayOfMonth ASC, name ASC');
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    amount: r.amount,
    categoryId: r.categoryId,
    dayOfMonth: r.dayOfMonth,
    active: r.active === 1,
    lastPostedMonth: r.lastPostedMonth,
  }));
}

export async function insertCommitment(c: Commitment): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO commitments (id, name, amount, categoryId, dayOfMonth, active, lastPostedMonth) VALUES (?, ?, ?, ?, ?, ?, ?)',
    c.id, c.name, c.amount, c.categoryId, c.dayOfMonth, c.active ? 1 : 0, c.lastPostedMonth
  );
}

export async function updateCommitment(c: Commitment): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE commitments SET name = ?, amount = ?, categoryId = ?, dayOfMonth = ?, active = ?, lastPostedMonth = ? WHERE id = ?',
    c.name, c.amount, c.categoryId, c.dayOfMonth, c.active ? 1 : 0, c.lastPostedMonth, c.id
  );
}

export async function deleteCommitment(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM commitments WHERE id = ?', id);
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
    key, value
  );
}

export async function getAllSettings(): Promise<{ key: string; value: string }[]> {
  const db = await getDb();
  return db.getAllAsync<{ key: string; value: string }>('SELECT * FROM settings');
}

export interface BackupBundle {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  commitments: Commitment[];
  settings: { key: string; value: string }[];
}

// Atomically wipe every table and re-insert from a backup bundle.
export async function replaceAllData(b: BackupBundle): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.execAsync(
      'DELETE FROM transactions; DELETE FROM budgets; DELETE FROM categories; DELETE FROM commitments; DELETE FROM settings;'
    );
    for (let i = 0; i < b.categories.length; i++) {
      const c = b.categories[i];
      await db.runAsync(
        'INSERT INTO categories (id, name, icon, color, type, isCustom, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)',
        c.id, c.name, c.icon, c.color, c.type, c.isCustom ? 1 : 0, i
      );
    }
    for (const t of b.transactions) {
      await db.runAsync(
        'INSERT INTO transactions (id, amount, type, categoryId, note, date, createdAt, commitmentId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        t.id, t.amount, t.type, t.categoryId, t.note, t.date, t.createdAt, t.commitmentId ?? null
      );
    }
    for (const bg of b.budgets) {
      if (bg.limit > 0) {
        await db.runAsync(
          'INSERT INTO budgets (categoryId, month, limitAmount) VALUES (?, ?, ?)',
          bg.categoryId, bg.month, bg.limit
        );
      }
    }
    for (const c of b.commitments) {
      await db.runAsync(
        'INSERT INTO commitments (id, name, amount, categoryId, dayOfMonth, active, lastPostedMonth) VALUES (?, ?, ?, ?, ?, ?, ?)',
        c.id, c.name, c.amount, c.categoryId, c.dayOfMonth, c.active ? 1 : 0, c.lastPostedMonth
      );
    }
    for (const s of b.settings) {
      await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', s.key, s.value);
    }
  });
}
