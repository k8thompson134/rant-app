# RantTrack Build Quick Reference

**One guide. Dev or Prod. Brain fog friendly.**

---

## First Time Setup

```bash
cd c:\Users\Admin\Documents\rant-app\mobile
npm install
```

Done. Do this once.

---

## Building Dev Version

**What you get:** Separate app called "RantTrack Dev" on your device. Independent data. Coexists with production.

### Terminal 1 (start once, leave running):
```bash
npm start
```

### Terminal 2 (build & run):
```bash
APP_VARIANT=development npm run android
```

**Windows alternatives:**
```cmd
# Command Prompt
set APP_VARIANT=development && npm run android

# PowerShell
$env:APP_VARIANT="development"; npm run android
```

### Making changes (dev):
1. Edit code
2. Save file
3. Press `r` in Terminal 1
4. App reloads instantly

---

## Building Production Version

**What you get:** Regular "RantTrack" app. Same one your users will get.

### Terminal 1 (start once, leave running):
```bash
npm start
```

### Terminal 2 (build & run):
```bash
npm run android
```

### Making changes (prod):
1. Edit code
2. Save file
3. Press `r` in Terminal 1
4. App reloads instantly

---

## Key Difference

| | Dev | Production |
|--|-----|------------|
| **App name** | RantTrack Dev | RantTrack |
| **Package** | com.k8thompson.rantapp.dev | com.k8thompson.rantapp |
| **Database** | Separate | Separate |
| **On device** | Can have both | Can have both |
| **For testing** | ✅ New features | ❌ (use dev version) |
| **Command** | `APP_VARIANT=development npm run android` | `npm run android` |

---

## Building APK Files

**Dev APK** (offline testing/sharing):
```bash
APP_VARIANT=development npx eas build --platform android --local --output=rantapp-dev.apk
adb install rantapp-dev.apk
```

**Production APK** (what users download):
```bash
npx eas build --platform android --local --output=rantapp.apk
adb install rantapp.apk
```

---

## Type Checking

```bash
npm run tsc              # Check once
npm run tsc -- --watch   # Auto-check while you code
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| App won't start | `npm start` (restart Terminal 1) → Press `r` |
| Still broken | `rm -rf node_modules` → `npm install` → `npm start` |
| Device not found | `adb devices` (check USB debugging is ON) |
| Port 8081 in use | `npm start -- --port 8082` |
| Code changes not showing | Did you press `r` in Terminal 1? Try again. |

---

## Daily Workflow (Dev)

```bash
# Morning: start these once
npm start                              # Terminal 1
APP_VARIANT=development npm run android # Terminal 2

# All day: code normally
# Edit → Save → Press r → See changes
```

---

## Daily Workflow (Production Testing)

```bash
# Morning: start these once
npm start                    # Terminal 1
npm run android              # Terminal 2

# All day: code normally
# Edit → Save → Press r → See changes
```

---

## After Git Pull

```bash
git pull origin v2
cd mobile
npm install
npm start           # Restart Terminal 1
# Dev/prod app auto-updates when you reload (press r)
```

---

## Quick Commands

| Command | What it does |
|---------|-------------|
| `node --version` | Check Node.js |
| `npm --version` | Check npm |
| `adb devices` | List devices |
| `adb logcat \| grep RantTrack` | Watch app logs |
| `adb uninstall com.k8thompson.rantapp.dev` | Remove dev app |
| `adb uninstall com.k8thompson.rantapp` | Remove prod app |

---

## Device Info

Both versions can exist on your phone:
- **App Drawer**: Shows "RantTrack" + "RantTrack Dev"
- **Data**: Completely separate
- **Perfect for**: Testing before prod release

---

## Windows Batch File (Optional)

Save as `dev.bat`:
```batch
@echo off
set APP_VARIANT=development
cd c:\Users\Admin\Documents\rant-app\mobile
npm run android
```

Then just: `dev.bat`

Save as `prod.bat`:
```batch
@echo off
cd c:\Users\Admin\Documents\rant-app\mobile
npm run android
```

Then just: `prod.bat`

---

## When Stuck

**Restart Terminal 1:**
```bash
Ctrl+C
npm start
```

**If that fails:**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

**If device won't connect:**
- Unplug phone
- Unplug from computer
- Wait 5 seconds
- Plug back in
- `adb devices`

---

## Bottom Line

**Dev:**
```bash
APP_VARIANT=development npm run android
```

**Production:**
```bash
npm run android
```

Press `r` after every code change. That's it.

---

**For detailed explanations, see:** [DEV_VERSION_QUICKSTART.md](DEV_VERSION_QUICKSTART.md)
