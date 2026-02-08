# RantTrack Mobile - Quick Start

Get the mobile app running in under 2 minutes!

## Step 1: Install Dependencies

```bash
cd mobile
npm install
```

## Step 2: Start Development Server

```bash
npm start
```

You'll see something like this:

```
› Metro waiting on exp://192.168.1.xxx:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press o │ open project in browser
```

## Step 3: Build Types

RantTrack has two separate build variants to prevent overwriting your personal data while developing:

- **Development** (default): `RantTrack Dev` - Use this for testing changes
- **Personal Use**: `RantTrack` - Your actual data, only build when intentional

This prevents accidentally overwriting your personal app when running development builds!

## Step 4: Run on Your Device

### Option A: Your Phone (Easiest!)

1. **Install Expo Go** on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan the QR code** from your terminal:
   - iOS: Use the Camera app
   - Android: Use Expo Go app's QR scanner

3. The app will load on your phone!

### Option B: Emulator/Simulator

**iOS Simulator** (Mac only):
```bash
npm run ios                    # Development build (RantTrack Dev)
npm run ios:prod              # Personal use build (RantTrack)
```

**Android Emulator**:
```bash
npm run android               # Development build (RantTrack Dev)
npm run android:prod          # Personal use build (RantTrack)
```
(Make sure Android Studio and an emulator are set up)

### Option C: Web Browser

```bash
npm run web
```

Opens at `http://localhost:8081`

### Option D: Wireless ADB (Android Physical Device)

Run directly on your phone without a USB cable:

**One-time setup (requires USB first):**
```bash
# Connect phone via USB, then enable wireless debugging
adb tcpip 5555

# Disconnect USB, then connect wirelessly
adb connect 192.168.1.113:5555
```

**Reconnecting (no USB needed):**
```bash
adb connect 192.168.1.113:5555
```

**Run the app:**
```bash
npm run android               # Development build (RantTrack Dev)
npm run android:prod          # Personal use build (RantTrack)
```

**Verify connection:**
```bash
adb devices
# Should show: 192.168.1.113:5555  device
```

**Disconnect when done:**
```bash
adb disconnect 192.168.1.113:5555
```

> **Tip:** Your phone's IP may change if you reconnect to WiFi. Check it in Settings > WiFi > your network > IP address.

## Try It Out!

Once the app loads:

1. Type a rant in the text box:
   ```
   "crashed hard yesterday, completely wiped out. brain fog is killing me"
   ```

2. Tap "Extract Symptoms"

3. See the detected symptoms:
   - Post-Exertional Malaise (PEM) - matched: "crashed"
   - Fatigue - matched: "wiped out"
   - Brain Fog - matched: "brain fog"

## Troubleshooting

**"Expo Go" not connecting?**
- Make sure phone and computer are on the same WiFi
- Try pressing `r` to reload

**Metro bundler errors?**
```bash
npm start -- --clear
```

**TypeScript errors?**
```bash
npm run tsc
```

**Need to reset everything?**
```bash
rm -rf node_modules
npm install
npm start -- --clear
```

## Next: Customize It!

Check out [mobile/README.md](README.md) for:
- Project structure
- How to add features
- Database usage
- Building for production
