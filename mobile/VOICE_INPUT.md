# Voice Input Feature

Voice input is now available for accessibility and low-spoon days!

## 🎤 What It Does

- **Tap microphone button** to start voice recognition
- **Speak naturally** about how you're feeling
- **Text appears** in the input box automatically
- **Combine** voice and typed text if needed
- **Extract & Save** when ready

## 📱 Current Status

✅ **Code is ready** - VoiceInput component fully implemented
⚠️ **Requires development build** - Won't work in Expo Go

### Why Development Build?

The `@react-native-voice/voice` package uses native modules that aren't included in Expo Go. You need to create a development build to use voice input.

### What Works Now

**In Expo Go:**
- ✅ Microphone button appears
- ✅ Tapping shows helpful message
- ✅ Falls back to typing gracefully
- ✅ No crashes or errors

**In Development Build:**
- ✅ Full voice recognition
- ✅ Real-time speech-to-text
- ✅ Works on iOS and Android
- ✅ Handles permissions automatically

## 🚀 How to Create a Development Build

### Option 1: EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure your project
cd mobile
eas build:configure

# Build for your device
eas build --profile development --platform ios  # for iOS
eas build --profile development --platform android  # for Android

# Install on your device
eas build:run -p android
```

### Option 2: Local Build

**iOS:**
```bash
npx expo prebuild
npx expo run:ios
```

**Android:**
```bash
npx expo prebuild
npx expo run:android
```

## 🔐 Permissions

The app will automatically request microphone permissions when you tap the voice button:

**iOS:** Shows system permission dialog
**Android:** Shows system permission dialog

If denied, the button will show an error message.

## 💡 Using Voice Input

1. **Tap the microphone button** (🎤 Voice Input)
2. **Allow microphone permissions** (first time only)
3. **See "Listening..."** indicator with red dot
4. **Speak your rant**: "crashed hard yesterday, brain fog is killing me"
5. **Watch text appear** in the input box
6. **Tap "Extract & Save"** when done

### Tips

- Speak clearly but naturally
- Works with any accent
- Punctuation is automatic
- Can pause and continue typing
- Voice text is appended to existing text

## 🎨 UI Features

**Microphone Button:**
- Clean design with emoji icon
- Shows "Voice Input" when idle
- Changes to "Listening..." when recording
- Red pulsing dot while active
- Disabled during save operation

**Divider:**
- Clear "or type below" separator
- Visual indication of two input methods

## 🔧 Technical Details

**Package:** `@react-native-voice/voice`
**iOS:** Uses SFSpeechRecognizer
**Android:** Uses Speech Recognition API
**Language:** English (US) by default

**Events Handled:**
- `onSpeechStart` - Recording started
- `onSpeechEnd` - Recording ended
- `onSpeechResults` - Text recognized
- `onSpeechError` - Error handling

## 🐛 Troubleshooting

### "Voice Input Not Available" message

**Solution:** You're using Expo Go. Create a development build (see above).

### Permission denied

**Solution:** Go to device Settings → RantTrack → Enable Microphone

### No speech detected

**Solution:**
- Speak louder or closer to mic
- Check microphone isn't blocked
- Try tapping button again

### Text not appearing

**Solution:**
- Make sure you're speaking (not just tapping)
- Check that "Listening..." appears
- Try typing instead as fallback

## 🎯 Future Enhancements

Potential improvements:
- [ ] Language selection (Spanish, French, etc.)
- [ ] Custom voice commands ("save", "clear", etc.)
- [ ] Continuous recording mode
- [ ] Offline voice recognition
- [ ] Voice feedback (reads symptoms back)

## 📝 Code Files

**Components:**
- `src/components/VoiceInput.tsx` - Voice recognition logic
- `src/components/RantInput.tsx` - Integration with text input

**Key Functions:**
- `startRecording()` - Begins voice capture
- `stopRecording()` - Ends voice capture
- `onSpeechResults()` - Processes recognized text
- `onSpeechError()` - Handles errors gracefully

## 🌟 Accessibility Impact

This feature is crucial for:
- **Low-spoon days** - Too fatigued to type
- **Brain fog** - Hard to organize thoughts in text
- **Motor issues** - Difficulty with fine motor control
- **Migraine days** - Screen time is painful
- **General convenience** - Just faster to talk

Perfect for chronic illness symptom tracking where typing might be a barrier!
