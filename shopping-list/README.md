# Shopping List

A very simple shared family shopping list. One family, one list, everyone sees the same thing in real time.

```
Create/Join Family → Home → Select Category → Select Item → Enter Quantity → Shared List
```

Built with Expo (React Native + expo-router + TypeScript) and Firebase Firestore for live sync. Runs on Android, iOS and web from one codebase.

## 1. One-time Firebase setup (5 minutes)

The shared list lives in Firestore, so each install needs the keys of one Firebase project.

1. Go to <https://console.firebase.google.com> → **Add project** (any name, Analytics off is fine).
2. **Build → Firestore Database → Create database** → start in *production mode* → pick a region.
3. Open the **Rules** tab, paste the contents of [`firestore.rules`](./firestore.rules) and **Publish**.
4. **Project settings (gear) → Your apps → Web app (`</>`)** → register it → copy the `firebaseConfig` values.
5. In this folder: `cp .env.example .env` and fill in the six `EXPO_PUBLIC_FIREBASE_*` values.

That's it. No Firebase Auth is used in V1: the 6-character join code is the shared secret.

## 2. Run it

```bash
cd shopping-list
npm install
npm start          # then press a (Android), i (iOS) or w (web), or scan the QR in Expo Go
```

To try the shared experience, open the app on two devices (or a phone + a browser tab), create a family on one, and join with the code on the other.

## 3. How it works

| Concern | Where |
| --- | --- |
| Screens | `app/` — `onboarding`, `create`, `join`, `home`, `category/[id]`, `settings` |
| Shared state + Firestore listeners | `store/useStore.ts` |
| Predefined items, units, categories | `constants/catalog.ts` |
| Device identity (no login) | `lib/session.ts` (AsyncStorage) |
| Dark "Premium" theme | `constants/theme.ts` |

Firestore layout (everything under one family):

```
groups/{JOINCODE}                { name, code, createdAt }
groups/{JOINCODE}/members/{id}   { name, joinedAt }
groups/{JOINCODE}/items/{id}     custom items  { category, name, emoji | image, createdBy }
groups/{JOINCODE}/list/{itemId}  selected items { qty, unit, category, updatedBy, updatedAt }
```

Every screen subscribes with `onSnapshot`, so a change on one phone appears on the other within a second. Custom item photos are shrunk to 128 px and stored inline in the item document.

## 4. Manual test checklist (V1)

**Onboarding**
- [ ] Fresh install shows *Create a Family / Group* and *Join a Family / Group*
- [ ] Create: family name + your name required; lands on Home; Settings shows a 6-char code
- [ ] Join: invalid code shows an error; valid code lands on Home with the same family name
- [ ] Code entry ignores lowercase/spaces; O/0/I/1 never appear in generated codes

**Home**
- [ ] Three rings visible without scrolling on a normal phone: Vegetables, Fruits, Groceries at 0/20
- [ ] Ring fills segment-by-segment as items are selected; count updates immediately
- [ ] Gear icon opens Settings

**Category**
- [ ] 20 predefined items with image, name, checkbox
- [ ] Tap checkbox → quantity sheet → confirm → item shows `2 kg`, header count and Home ring update
- [ ] `+` on an unselected item adds it with quantity 1 in the default unit
- [ ] `−` / `+` on a selected item steps by unit (kg 0.5, grams 50, ml 100, piece 1…); `−` below zero removes it
- [ ] Tap the quantity pill to change quantity and unit; *Remove from list* unselects
- [ ] *Add New Vegetable/Fruit/Grocery* → name + emoji or photo → appears at the end of that category

**Shared / real-time (two devices)**
- [ ] A selects Tomato 2 kg → B sees it without refresh
- [ ] B changes to 3 kg → A sees 3 kg
- [ ] A adds "Sweet Potato" → B sees it in Vegetables
- [ ] B unselects Tomato → A's ring count drops

**Settings**
- [ ] Family name, join code, copy (checkmark feedback), share sheet, member list with "(you)"
- [ ] Leave family returns to onboarding; rejoining with the code restores the same list

## 5. Out of scope for V1

Search, multiple lists, recipes, AI, prices, barcodes, store comparison, offers, notifications, social features.
