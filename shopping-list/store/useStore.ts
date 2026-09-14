import { create } from 'zustand';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { CatalogItem, CategoryId, Group, ListEntry, Member, Session } from '@/types';
import { DEFAULT_CATALOG, DEFAULT_UNIT } from '@/constants/catalog';
import { getDb } from '@/lib/firebase';
import { loadSession, saveSession } from '@/lib/session';
import { generateCode, normalizeCode, uid } from '@/lib/codes';

interface StoreState {
  session: Session | null;
  hydrated: boolean;
  group: Group | null;
  members: Member[];
  customItems: CatalogItem[];
  entries: Record<string, ListEntry>;
  connected: boolean;

  hydrate: () => Promise<void>;
  createGroup: (groupName: string, userName: string) => Promise<string>;
  joinGroup: (code: string, userName: string) => Promise<void>;
  leaveGroup: () => Promise<void>;

  selectItem: (item: CatalogItem, qty: number, unit: string) => Promise<void>;
  unselectItem: (itemId: string) => Promise<void>;
  addCustomItem: (category: CategoryId, name: string, emoji?: string, image?: string) => Promise<void>;

  catalogFor: (category: CategoryId) => CatalogItem[];
  entryFor: (itemId: string) => ListEntry | undefined;
  progressFor: (category: CategoryId) => { selected: number; total: number };
}

let unsubscribers: Unsubscribe[] = [];

function stopListening() {
  unsubscribers.forEach((u) => u());
  unsubscribers = [];
}

export const useStore = create<StoreState>((set, get) => {
  function listen(code: string) {
    stopListening();
    const db = getDb();
    const groupRef = doc(db, 'groups', code);

    unsubscribers.push(
      onSnapshot(groupRef, (snap) => {
        if (!snap.exists()) {
          get().leaveGroup();
          return;
        }
        set({ group: snap.data() as Group, connected: true });
      }),
      onSnapshot(collection(groupRef, 'members'), (snap) => {
        const members = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Member, 'id'>) }))
          .sort((a, b) => a.joinedAt - b.joinedAt);
        set({ members });
      }),
      onSnapshot(collection(groupRef, 'items'), (snap) => {
        const customItems = snap.docs
          .map((d) => ({ id: d.id, isCustom: true, ...(d.data() as Omit<CatalogItem, 'id' | 'isCustom'>) }))
          .sort((a, b) => a.name.localeCompare(b.name));
        set({ customItems });
      }),
      onSnapshot(collection(groupRef, 'list'), (snap) => {
        const entries: Record<string, ListEntry> = {};
        snap.docs.forEach((d) => {
          entries[d.id] = d.data() as ListEntry;
        });
        set({ entries });
      }),
    );
  }

  async function persistSession(patch: Partial<Session>) {
    const session = { ...(get().session as Session), ...patch };
    await saveSession(session);
    set({ session });
    return session;
  }

  return {
    session: null,
    hydrated: false,
    group: null,
    members: [],
    customItems: [],
    entries: {},
    connected: false,

    hydrate: async () => {
      const session = await loadSession();
      set({ session, hydrated: true });
      if (session.groupCode) listen(session.groupCode);
    },

    createGroup: async (groupName, userName) => {
      const db = getDb();
      const session = get().session as Session;
      let code = generateCode();
      // Retry on the (very unlikely) collision so two families never share a code.
      while ((await getDoc(doc(db, 'groups', code))).exists()) code = generateCode();

      const now = Date.now();
      await setDoc(doc(db, 'groups', code), { code, name: groupName.trim(), createdAt: now });
      await setDoc(doc(db, 'groups', code, 'members', session.deviceId), { name: userName.trim(), joinedAt: now });
      await persistSession({ groupCode: code, userName: userName.trim() });
      listen(code);
      return code;
    },

    joinGroup: async (rawCode, userName) => {
      const db = getDb();
      const code = normalizeCode(rawCode);
      const snap = await getDoc(doc(db, 'groups', code));
      if (!snap.exists()) throw new Error('No family found with that code. Check it and try again.');

      const session = get().session as Session;
      await setDoc(doc(db, 'groups', code, 'members', session.deviceId), {
        name: userName.trim(),
        joinedAt: Date.now(),
      });
      await persistSession({ groupCode: code, userName: userName.trim() });
      listen(code);
    },

    leaveGroup: async () => {
      stopListening();
      await persistSession({ groupCode: null });
      set({ group: null, members: [], customItems: [], entries: {}, connected: false });
    },

    selectItem: async (item, qty, unit) => {
      const { session } = get();
      if (!session?.groupCode) return;
      const entry: ListEntry = {
        itemId: item.id,
        category: item.category,
        qty,
        unit,
        updatedAt: Date.now(),
        updatedBy: session.userName,
      };
      await setDoc(doc(getDb(), 'groups', session.groupCode, 'list', item.id), entry);
    },

    unselectItem: async (itemId) => {
      const { session } = get();
      if (!session?.groupCode) return;
      await deleteDoc(doc(getDb(), 'groups', session.groupCode, 'list', itemId));
    },

    addCustomItem: async (category, name, emoji, image) => {
      const { session } = get();
      if (!session?.groupCode) return;
      const id = `custom:${uid()}`;
      await setDoc(doc(getDb(), 'groups', session.groupCode, 'items', id), {
        category,
        name: name.trim(),
        ...(emoji ? { emoji } : {}),
        ...(image ? { image } : {}),
        createdAt: Date.now(),
        createdBy: session.userName,
      });
    },

    catalogFor: (category) => [
      ...DEFAULT_CATALOG.filter((i) => i.category === category),
      ...get().customItems.filter((i) => i.category === category),
    ],

    entryFor: (itemId) => get().entries[itemId],

    progressFor: (category) => {
      const total = get().catalogFor(category).length;
      const selected = Object.values(get().entries).filter((e) => e.category === category).length;
      return { selected, total };
    },
  };
});

export function defaultUnitFor(category: CategoryId): string {
  return DEFAULT_UNIT[category];
}
