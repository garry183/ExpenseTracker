# ExpenseTracker — App Idea Brief
**For:** Personal use + recruiter portfolio showcase  
**Platform:** Android + iOS (React Native via Expo Go)  
**Date:** June 2026  

---

## What I'm Building

A personal expense tracker Android app that stands out from the 100+ apps already on the Play Store by combining three things no free app currently does together:

1. **Voice input with AI parsing** — say "spent 45 on groceries", app logs it automatically
2. **Receipt OCR (item-level)** — photo a receipt, get each line item as a separate expense
3. **"Safe to spend today"** — one number on the home screen: budget minus spent minus upcoming bills

Everything works offline. No bank account required. No ads.

---

## Why These Three Features

| Feature | Current Market | This App |
|---------|---------------|----------|
| Voice entry | Gimmicky, inaccurate in most apps | Gemini API parses natural language properly |
| Receipt OCR | Item-level only in Yomio (paid) | Free, using ML Kit on-device |
| Safe to spend | PocketGuard has it but needs bank sync | Works with manual entries, fully offline |

---

## Core Features (MVP)

- Add / edit / delete expenses and income
- Categories with icons and colors
- Monthly budget per category with progress bar
- Recurring transactions (rent, subscriptions)
- Voice entry — speak to log a transaction
- Receipt scan — camera to log multiple items at once
- "Safe to spend today" on the home dashboard
- Charts — monthly spending by category
- Home screen widget showing daily spend
- Light / dark mode, Material 3 UI

---

## Tech Stack (what recruiters will see)

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Framework | React Native + Expo (SDK 52) |
| UI | React Native Paper / custom components |
| Navigation | Expo Router (file-based) |
| Database | SQLite via expo-sqlite (offline-first) |
| State | Zustand |
| AI / NLP | Gemini API |
| OCR | expo-camera + Google Cloud Vision or ML Kit |
| Cloud Sync (optional) | Firebase Firestore |
| Dev workflow | Expo Go — scan QR, live on real device |

---

## What This Demonstrates to Recruiters

- Cross-platform mobile development (React Native + Expo)
- TypeScript + clean component architecture
- AI/ML integration (Gemini API + OCR)
- Offline-first data handling (SQLite)
- Real-world product thinking (not just a todo app)

---

## Out of Scope

- Bank account linking
- Multi-currency
- Shared / couple mode
- PDF reports
- Investments or net worth

---

## Validation Questions for Other AIs

1. Is voice + OCR + offline a strong enough differentiator for a portfolio Android app in 2026?
2. Is Gemini API the right choice for voice NLP parsing, or is there a better/cheaper option?
3. Is ML Kit sufficient for item-level receipt OCR, or does it need a cloud API?
4. Is this tech stack (Compose + Hilt + Room + Gemini) what Android hiring teams want to see in 2026?
5. What is the single most impressive feature to lead with on a recruiter demo?
