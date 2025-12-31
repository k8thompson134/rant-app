# Database & History Features

Successfully implemented database persistence and entry history!

## ✅ What Was Added

### Database Operations ([src/database/operations.ts](src/database/operations.ts))
- `saveRantEntry()` - Save rants with symptoms to SQLite
- `getAllRantEntries()` - Load all entries (newest first)
- `getRantEntryById()` - Get specific entry
- `deleteRantEntry()` - Delete an entry
- `getRecentRantEntries()` - Get entries from last N days
- `getRantEntryCount()` - Count total entries

### Two-Screen Navigation ([App.tsx](App.tsx))
- **Home Tab** - New rant input and extraction
- **History Tab** - View past rants

### Home Screen ([src/screens/HomeScreen.tsx](src/screens/HomeScreen.tsx))
- Text input for rants
- Real-time symptom extraction
- Automatic save to database
- Success confirmation
- "Clear & Start New Rant" button
- Loading state during save

### History Screen ([src/screens/HistoryScreen.tsx](src/screens/HistoryScreen.tsx))
- List of all saved rants
- Shows date (relative: "2h ago", "3d ago", etc.)
- Preview of rant text (3 lines)
- Symptom tags (first 4 + count)
- Delete functionality with confirmation
- Pull-to-refresh
- Empty state for no entries

## 🎨 UI Features

**Home Tab:**
- Shows "Extract & Save" button
- Loading spinner while processing
- Success alert on save
- Results display with clear button

**History Tab:**
- Card-based layout
- Timestamp in header
- Delete button per entry
- Symptom tags color-coded
- Smooth refresh

## 📊 Data Flow

```
1. User types rant
2. Tap "Extract & Save"
3. Extract symptoms (JS extractor)
4. Save to SQLite with:
   - Unique ID
   - Full text
   - Timestamp
   - Symptoms (JSON)
5. Show success alert
6. View in History tab
```

## 🗄️ Database Schema

```sql
CREATE TABLE rants (
  id TEXT PRIMARY KEY,           -- "rant_{timestamp}_{random}"
  text TEXT NOT NULL,           -- Original rant text
  timestamp INTEGER NOT NULL,   -- Unix timestamp (ms)
  symptoms TEXT NOT NULL,       -- JSON array of ExtractedSymptom[]
  created_at INTEGER DEFAULT (unixepoch())
);
```

## 🚀 Try It Out

1. **Save a rant:**
   - Go to "New Rant" tab
   - Type: "crashed hard yesterday, brain fog is killing me"
   - Tap "Extract & Save"
   - See success message

2. **View history:**
   - Switch to "History" tab
   - See your saved rant
   - Pull down to refresh
   - Tap "Delete" to remove

3. **Test persistence:**
   - Force close the app
   - Reopen it
   - Check History tab - your data is still there!

## 📱 What Works Now

- ✅ Rants are saved automatically after extraction
- ✅ Data persists between app restarts
- ✅ View all past entries
- ✅ Delete entries
- ✅ Navigation between Home and History
- ✅ Loading states and error handling
- ✅ Pull-to-refresh in history
- ✅ Relative timestamps ("2h ago")

## 🔜 Next Steps

Potential improvements:
- [ ] Edit past entries
- [ ] Search/filter history
- [ ] Symptom trends chart
- [ ] Export to CSV
- [ ] Voice input
- [ ] Tag entries with triggers
- [ ] Severity ratings
