import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as db from '@/lib/db';
import { todayISO } from '@/lib/date';

const APP_TAG = 'ExpenseTracker';
const SCHEMA_VERSION = 1;

export interface ImportResult {
  transactions: number;
  categories: number;
  budgets: number;
  commitments: number;
}

async function buildBackupJson(): Promise<string> {
  const [transactions, categories, budgets, commitments, settings] = await Promise.all([
    db.getAllTransactions(),
    db.getAllCategories(),
    db.getAllBudgets(),
    db.getAllCommitments(),
    db.getAllSettings(),
  ]);
  return JSON.stringify(
    {
      app: APP_TAG,
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data: { transactions, categories, budgets, commitments, settings },
    },
    null,
    2
  );
}

// Browser download fallback — expo-sharing doesn't exist on web.
function downloadOnWeb(filename: string, json: string): string {
  const g: any = globalThis as any;
  const blob = new g.Blob([json], { type: 'application/json' });
  const url = g.URL.createObjectURL(blob);
  const a = g.document.createElement('a');
  a.href = url;
  a.download = filename;
  g.document.body.appendChild(a);
  a.click();
  a.remove();
  g.URL.revokeObjectURL(url);
  return url;
}

// Serialize the whole database to a JSON file.
// Native: opens the share sheet (save to Drive, email, etc.).
// Web: triggers a browser file download.
export async function exportBackup(): Promise<string> {
  const json = await buildBackupJson();
  const filename = `expensetracker-backup-${todayISO()}.json`;

  if (Platform.OS === 'web') {
    return downloadOnWeb(filename, json);
  }

  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(json);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Save ExpenseTracker backup',
      UTI: 'public.json',
    });
  }
  return file.uri;
}

// Let the user pick a backup file and replace all current data with it.
// Returns null if the user cancels.
export async function importBackup(): Promise<ImportResult | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
  });
  if (res.canceled || !res.assets?.length) return null;

  const uri = res.assets[0].uri;
  // expo-file-system's File API is native-only; on web read the picked URI directly.
  const content =
    Platform.OS === 'web' ? await fetch(uri).then((r) => r.text()) : await new File(uri).text();

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!parsed || parsed.app !== APP_TAG || !parsed.data) {
    throw new Error('This is not an ExpenseTracker backup file.');
  }

  const d = parsed.data;
  const bundle: db.BackupBundle = {
    transactions: Array.isArray(d.transactions) ? d.transactions : [],
    categories: Array.isArray(d.categories) ? d.categories : [],
    budgets: Array.isArray(d.budgets) ? d.budgets : [],
    commitments: Array.isArray(d.commitments) ? d.commitments : [],
    settings: Array.isArray(d.settings) ? d.settings : [],
  };

  await db.replaceAllData(bundle);

  return {
    transactions: bundle.transactions.length,
    categories: bundle.categories.length,
    budgets: bundle.budgets.length,
    commitments: bundle.commitments.length,
  };
}
