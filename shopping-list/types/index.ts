export type CategoryId = 'vegetables' | 'fruits' | 'groceries';

export interface Category {
  id: CategoryId;
  name: string;
  singular: string;
  emoji: string;
  color: string;
}

export interface CatalogItem {
  id: string;
  category: CategoryId;
  name: string;
  emoji?: string;
  image?: string;
  isCustom: boolean;
}

export interface ListEntry {
  itemId: string;
  category: CategoryId;
  qty: number;
  unit: string;
  updatedAt: number;
  updatedBy: string;
}

export interface Member {
  id: string;
  name: string;
  joinedAt: number;
}

export interface Group {
  code: string;
  name: string;
  createdAt: number;
}

export interface Session {
  deviceId: string;
  userName: string;
  groupCode: string | null;
}
