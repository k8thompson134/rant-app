# RantTrack Mobile App

Privacy-first symptom tracker for chronically ill people built with React Native and Expo.

## Features

- **Natural language symptom extraction**: Just rant about how you're feeling
- **Local-first**: All data stored on your device with SQLite
- **Privacy-focused**: No cloud services, no tracking, your data stays with you
- **Accessible design**: Large tap targets, clear typography

## Tech Stack

- **React Native** with **Expo** for cross-platform mobile development
- **TypeScript** for type safety
- **SQLite** + **Drizzle ORM** for local database
- **JavaScript port** of the spaCy-based symptom extractor

## Setup

### Prerequisites

- Node.js 18+ and npm
- Expo Go app on your phone (for testing)
- OR iOS Simulator / Android Emulator

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

## Project Structure

```
mobile/
├── App.tsx                    # Main app component
├── src/
│   ├── components/
│   │   ├── RantInput.tsx      # Text input component
│   │   └── SymptomDisplay.tsx # Symptom results display
│   ├── database/
│   │   ├── schema.ts          # Database schema (Drizzle)
│   │   └── db.ts              # Database initialization
│   ├── nlp/
│   │   └── extractor.ts       # Symptom extraction (JS port)
│   └── types/
│       └── index.ts           # TypeScript types
└── package.json
```

## How It Works

1. User types or speaks how they're feeling
2. Text is processed by the JavaScript symptom extractor
3. Symptoms are detected using:
   - Phrase matching ("brain fog", "wiped out")
   - Lemma matching ("exhausted" → fatigue)
   - Negation handling ("not tired" ignored)
4. Results displayed with matched text and detection method
5. (Coming soon) Entries saved to local SQLite database

## Current Status

✅ Basic UI components built
✅ Symptom extraction working
✅ Database schema defined
🚧 Database saving/loading (coming next)
🚧 Entry history view
🚧 Voice input
🚧 Symptom trends/visualization

## Next Steps

1. Implement database CRUD operations
2. Add entry history screen
3. Add voice input support
4. Build symptom trends visualization
5. Add customization (themes, symptom vocabulary)
6. Implement export functionality

## Development

```bash
# Type check
npm run tsc

# Clear cache and restart
npm start -- --clear

# Build for production
npm run build
```

## Privacy

All data is stored locally on your device. No analytics, no tracking, no cloud sync (unless you explicitly enable it in future versions).
