# RantTrack Mobile App

Privacy-first symptom tracker for chronically ill people built with React Native and Expo.

## Features

- **Voice & text input** - Speak or type how you're feeling in natural language
- **Smart NLP extraction** - Automatically detects 200+ symptoms, severity levels, and pain details
- **Local-first storage** - All data stored on your device with SQLite, no cloud services
- **Accessibility-first** - High contrast mode, font scaling, 48-64pt touch targets, screen reader support
- **Calendar & history views** - Month view, daily entries, and chronological timeline
- **Auto-save** - Drafts saved every 5 seconds for brain fog protection
- **Quick check-in** - Log symptoms in seconds, including "same as yesterday" duplication
- **OTA updates** - Over-the-air updates via EAS Update

## Tech Stack

- **React Native** with **Expo** (New Architecture enabled) for cross-platform mobile development
- **TypeScript** for type safety
- **SQLite** + **Drizzle ORM** for local database
- **Custom JavaScript NLP engine** (2,260+ lines) for symptom extraction
- **Native speech recognition** via iOS/Android APIs
- **EAS Build** for native builds (AAB for Google Play, IPA for App Store)
- **EAS Update** for over-the-air updates

## Setup

### Prerequisites

- Node.js 18+ and npm
- iOS Simulator / Android Emulator (recommended for full feature testing)
- OR Expo Go app on your phone (voice input not available in Expo Go)

### Installation

```bash
cd mobile

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

After running `npm start`, you'll see a QR code:

- **On your phone**: Open Expo Go app and scan the QR code
- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Web browser**: Press `w` in the terminal

### Building with EAS

```bash
# Build for beta testing (Android - AAB for Google Play)
eas build --profile beta --platform android

# Build for beta testing (iOS - TestFlight)
eas build --profile beta --platform ios

# Push an OTA update
eas update --branch beta
```

## Project Structure

```
mobile/
├── App.tsx                         # Main app entry point
├── app.json                        # Expo configuration
├── eas.json                        # EAS Build profiles
├── src/
│   ├── components/
│   │   ├── RantInput.tsx           # Main text/voice input interface
│   │   ├── VoiceInput.tsx          # Microphone recording UI
│   │   ├── SymptomDisplay.tsx      # Extracted symptom results
│   │   ├── SymptomChip.tsx         # Individual symptom tags
│   │   ├── AddSymptomModal.tsx     # Manual symptom addition
│   │   ├── QuickCheckInModal.tsx   # Quick entry modal
│   │   ├── QuickActionChips.tsx    # Quick action buttons
│   │   ├── SeverityPicker.tsx      # Severity level selector
│   │   └── RecordingOverlay.tsx    # Voice recording overlay
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Main rant entry screen
│   │   ├── HistoryScreen.tsx       # Past entries timeline
│   │   ├── MonthScreen.tsx         # Calendar month view
│   │   ├── VoiceRecordingScreen.tsx# Voice recording interface
│   │   ├── ReviewEntryScreen.tsx   # Review before saving
│   │   ├── QuickAddEntryScreen.tsx # Quick entry mode
│   │   └── SettingsScreen.tsx      # Settings & accessibility
│   ├── database/
│   │   ├── db.ts                   # SQLite connection
│   │   ├── schema.ts              # Drizzle table schema
│   │   ├── operations.ts          # CRUD operations
│   │   └── seed.ts                # Development seeding
│   ├── nlp/
│   │   └── extractor.ts           # NLP symptom extraction engine
│   ├── theme/
│   │   ├── colors.ts              # Color palette (dark + high contrast)
│   │   ├── typography.ts          # Font sizing and styles
│   │   └── accessibility.ts       # WCAG compliance settings
│   ├── types/
│   │   ├── index.ts               # Core types
│   │   ├── navigation.ts          # Navigation types
│   │   └── accessibility.ts       # Accessibility types
│   ├── hooks/
│   │   ├── useAutoSave.ts         # Auto-save functionality
│   │   └── useTouchTargetSize.ts  # Accessible touch sizing
│   ├── contexts/
│   │   └── AccessibilityContext.tsx# Global accessibility state
│   ├── constants/
│   │   ├── accessibility.ts       # Accessibility constants
│   │   └── commonSymptoms.ts      # Recognized symptoms list
│   └── utils/
│       └── storage.ts             # Local storage utilities
└── package.json
```

## How It Works

1. User types or speaks how they're feeling
2. Text is processed by the JavaScript symptom extractor
3. Symptoms are detected using:
   - Phrase matching ("brain fog", "wiped out")
   - Lemma matching ("exhausted" → fatigue)
   - Negation handling ("not tired" ignored)
   - Severity extraction (mild, moderate, severe)
   - Pain qualifier detection (burning, sharp, stabbing)
   - Body location tracking (shoulder, calf, etc.)
   - Chronic illness terminology (PEM, flare-ups, crashes, spoon theory)
4. Results displayed with matched symptoms and severity indicators
5. Entries saved to local SQLite database

## Current Status

v0.9.0 - Beta

- ✅ Voice & text input
- ✅ NLP symptom extraction (200+ symptoms)
- ✅ Database CRUD operations
- ✅ Entry history & calendar views
- ✅ Accessibility features (high contrast, font scaling, screen reader support)
- ✅ Auto-save & quick check-in
- ✅ React Native New Architecture enabled
- ✅ EAS Build configured (AAB for Google Play, IPA for App Store)
- ✅ OTA updates via EAS Update
- 🚧 Beta testing
- 🚧 Symptom trends/visualization
- 🚧 Data export (CSV, PDF)

## Development

```bash
# Type check
npm run tsc

# Clear cache and restart
npm start -- --clear

# Build for beta (Android)
eas build --profile beta --platform android

# Build for beta (iOS)
eas build --profile beta --platform ios
```

## Privacy

All data is stored locally on your device. No analytics, no tracking, no cloud sync (unless you explicitly enable it in future versions).
