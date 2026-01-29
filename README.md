# Expense Tracker

Personal expense tracker Android app with offline-first architecture, Firebase sync, voice input, and Material 3 UI.

## Features

- 💰 **Fast Expense Entry**: Quick add with voice input support
- 📊 **Beautiful Reports**: Monthly and category-wise spending visualization with charts
- 🔒 **PIN Security**: 4-digit PIN protection for privacy
- 🌐 **Offline First**: Works without internet, syncs when online
- 🎨 **Material 3 UI**: Modern, clean design with dark mode support
- 🗣️ **Voice Input**: Add expenses by speaking (e.g., "Spent 250 on food")
- 📱 **Native Android**: Built with Kotlin and Jetpack Compose

## Tech Stack

- **Language**: Kotlin
- **UI Framework**: Jetpack Compose
- **Architecture**: MVVM + Clean Architecture
- **Database**: Room (SQLite)
- **Backend**: Firebase Firestore
- **Dependency Injection**: Hilt
- **Charts**: YCharts
- **Min SDK**: 26 (Android 8.0)
- **Target SDK**: 34 (Android 14)

## Project Structure

```
app/src/main/java/com/personal/expensetracker/
├── data/                       # Data layer
│   ├── local/                  # Room database
│   │   ├── entity/            # Database entities
│   │   ├── dao/               # Data access objects
│   │   └── AppDatabase.kt     # Database configuration
│   ├── remote/                 # Firebase integration
│   ├── repository/             # Repository implementations
│   └── model/                  # DTOs
├── domain/                     # Domain layer
│   ├── model/                  # Domain models
│   ├── repository/             # Repository interfaces
│   └── usecase/               # Use cases
├── presentation/               # Presentation layer
│   ├── add/                   # Add expense screen
│   ├── reports/               # Reports screen
│   ├── security/              # PIN screen
│   ├── navigation/            # Navigation setup
│   └── theme/                 # Material 3 theme
└── di/                        # Dependency injection modules
```

## Setup Instructions

### Prerequisites

- Android Studio Hedgehog or newer
- JDK 17
- Android SDK with API 34

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add an Android app with package name: `com.personal.expensetracker`
3. Download `google-services.json` and place it in the `app/` directory
4. Enable Firestore Database in Firebase Console
5. (Optional) Set up Firebase Authentication for multi-user support

### Building the App

1. Clone the repository:
```bash
git clone https://github.com/garry183/ExpenseTracker.git
cd ExpenseTracker
```

2. Open the project in Android Studio

3. Replace the dummy `app/google-services.json` with your actual Firebase configuration

4. Sync Gradle files

5. Run the app on an emulator or physical device

### Release Build

To create a release build:

1. Create a keystore file:
```bash
keytool -genkey -v -keystore keystore/expense-tracker-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias key0
```

2. Set environment variables for signing:
```bash
export KEYSTORE_PASSWORD=your_password
export KEY_ALIAS=key0
export KEY_PASSWORD=your_password
```

3. Build the release APK:
```bash
./gradlew assembleRelease
```

The APK will be generated at `app/build/outputs/apk/release/app-release.apk`

## Usage

### First Launch
- Set up a 4-digit PIN for security
- Default categories are automatically created

### Adding Expenses
- Tap the **+** button on home screen
- Enter amount or use voice input (tap microphone icon)
- Select category and date
- Optionally add a note
- Tap "Save Expense"

### Voice Input Examples
- "Spent 250 on food"
- "Groceries 120 yesterday"
- "Transport 50 rupees today"

### Viewing Reports
- Tap the reports icon in the top bar
- Navigate between months using arrow buttons
- View pie chart for category distribution
- See detailed breakdown with percentages

## Default Categories

🍔 Food | 🛒 Groceries | 🚗 Transport | 🎬 Entertainment  
🛍️ Shopping | 💡 Bills | 🏥 Health | 💰 Others

## Offline Support

- All expenses are saved locally first
- Automatic sync when internet connection is available
- Sync status indicators show pending/synced state

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
