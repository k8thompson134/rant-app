# RantTrack Privacy Policy

**Last Updated**: December 30, 2024
**Effective Date**: December 30, 2024

## Our Promise

RantTrack is designed to be **100% private by default**. Your symptom data never leaves your device. We can't see it, we don't want to see it, and we've built the app so we couldn't access it even if we wanted to.

This isn't marketing speak. This is our core principle: **your health data is yours, and it stays yours.**

---

## The Short Version

- ❌ **No data collection** - We don't collect, store, or transmit your symptom entries
- ❌ **No analytics** - We don't track how you use the app
- ❌ **No crash reports** - We don't automatically report bugs or errors
- ❌ **No user accounts** - You don't need to create an account to use RantTrack
- ❌ **No cloud storage** - Your data lives only on your device (no servers, no cloud sync)
- ❌ **No third-party services** - We don't share data with anyone because we don't have access to it
- ❌ **No ads** - We'll never monetize your health data
- ✅ **100% local** - Everything happens on your device, offline, private

---

## Data We Collect

**None.**

Seriously. Zero. Nada. Nothing.

We don't collect:
- Personal information (name, email, phone number)
- Health data (symptoms, entries, medical history)
- Usage data (how often you use the app, which features you tap)
- Device identifiers (advertising IDs, unique device tokens)
- Location data
- Any other personally identifiable information

---

## Where Your Data Lives

All your symptom entries, rants, and settings are stored in a **local SQLite database on your device**. Think of it like a private diary that only exists on your phone.

### What this means:

✅ **Your data stays on your device forever** (unless you delete the app)
✅ **No one else can access it** - not us, not Apple, not Google, not anyone
✅ **Works completely offline** - no internet connection required
✅ **Your device, your data** - you have complete control

❌ **No cloud backup** - if you lose your phone, your data is gone
❌ **Can't sync between devices** - each device has its own separate database
❌ **No recovery** - we can't help you restore lost data because we never had it

---

## Permissions We Request

### Microphone Access (Optional)

**Why we need it**: To convert your voice into text for symptom tracking using your device's built-in speech recognition.

**What we do with it**:
- Voice audio is processed **on your device** using iOS/Android native speech recognition APIs
- We **never record, store, or transmit** audio files
- The microphone only activates when you tap the microphone button
- You can revoke this permission anytime in your device settings
- **You can use RantTrack without ever granting microphone access** - just type instead

**Platform APIs used**:
- **iOS**: `SFSpeechRecognizer` (Apple's on-device speech recognition)
- **Android**: Android Speech Recognition API (Google's on-device speech recognition)

### No Other Permissions

We **don't** request access to:
- Location (we don't track where you are)
- Contacts (we don't access your address book)
- Calendar (we don't integrate with your calendar)
- Photos (unless you manually export data)
- Camera (we don't need it)
- Network state (we work offline)
- Background location, motion sensors, or health data

---

## How Your Data is Processed

### Natural Language Processing (NLP)

When you enter a rant, RantTrack analyzes the text to extract symptoms (e.g., "bone-tired" → fatigue, "brain fog" → cognitive dysfunction).

**This processing happens entirely on your device.** We use a custom JavaScript-based symptom extraction algorithm that runs locally. No text is sent to external servers or cloud AI services.

### Speech Recognition

If you use voice input, your device's native speech recognition API converts your voice to text. This may involve:
- **iOS**: Apple's speech recognition may process audio on-device or via Apple's servers (based on your device settings)
- **Android**: Google's speech recognition may process audio on-device or via Google's servers (based on your device settings)

**We don't control these platform APIs**, but we never receive or store the audio. We only receive the transcribed text, which stays on your device.

To maximize privacy:
- Use on-device speech recognition in your iOS/Android settings if available
- Or simply type instead of using voice input

---

## Data Sharing

We don't share your data because **we don't have your data.**

### What About Feedback Forms?

If you choose to send feedback through the in-app feedback button, you'll be redirected to an external Google Form. This is:
- **Completely optional** (you choose what to share)
- **Anonymous by default** (unless you provide your email)
- **Separate from the app** (your symptom data is never automatically included)
- **User-controlled** (you can optionally copy device info to help us debug issues)

Any information you share in feedback forms is governed by Google Forms' privacy policy, not RantTrack's (because we don't host or control those forms).

---

## Data Export

You can manually export your symptom data (this feature is planned for a future update). Exports will be:
- Generated **on your device**
- Saved to **your device's local storage or shared via your choice of app** (email, messaging, etc.)
- Under **your complete control** - you decide who to share it with (e.g., your doctor)

We never receive exported data. You generate it, you share it, you control it.

---

## Data Deletion

To delete all your RantTrack data:

1. **Delete the app from your device**
2. **Done!** All data is permanently gone.

There's no server to contact, no account to close, no "right to be forgotten" request needed. Deleting the app removes all traces of your data from your device.

You can also delete individual entries within the app by swiping left on any entry in your History.

---

## Data Security

### On-Device Storage

Your data is stored in a local SQLite database on your device. This database is:
- **Not encrypted by RantTrack itself** (it's plaintext)
- **Protected by your device's security** (iOS/Android automatically encrypt app data at the device level if you enable device encryption/passcode)

For maximum security:
- Use a strong passcode/biometric lock on your device
- Enable full-device encryption in your iOS/Android settings
- Consider a future update where we may add optional app-level encryption

### No Network Transmission

Since your data never leaves your device, there's no risk of:
- Interception during transmission
- Server breaches or hacks
- Unauthorized access by third parties
- Data leaks from cloud storage

The safest data is data that never travels over the internet. That's RantTrack.

---

## Third-Party Services

We don't use any third-party analytics, crash reporting, advertising, or tracking services.

**Exception**: The app is built using **Expo** (a React Native framework). Expo provides development and build infrastructure, but:
- Expo **does not** collect your symptom data
- Expo **may** collect anonymous app diagnostics during development builds (e.g., app crashes during testing)
- Production builds (what you download from app stores) **do not** send data to Expo unless you explicitly opt-in to over-the-air updates

For transparency, here's what Expo has access to:
- **Nothing from production users** - the app runs entirely on your device
- **Build metadata** - when we create new versions of the app (e.g., "build #42 created on Dec 30, 2024")
- That's it. No usage data, no symptom data, no personal information.

---

## Children's Privacy (COPPA Compliance)

RantTrack is designed for adults (18+) with chronic illness. We don't knowingly collect information from children under 13.

Since we don't collect **any** data from **anyone**, we're automatically COPPA-compliant. But if you're under 18, please get a parent or guardian's permission before using health tracking apps.

---

## GDPR & CCPA Compliance

Since we don't collect, process, or store any personal data, the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA) don't apply to RantTrack's core functionality.

But if they did, here's how we'd comply:

| GDPR/CCPA Right | How RantTrack Complies |
|-----------------|------------------------|
| **Right to access** | All your data is on your device - you have complete access anytime |
| **Right to deletion** | Delete the app = all data gone |
| **Right to portability** | Export feature lets you take your data anywhere |
| **Right to be informed** | This privacy policy explains everything |
| **Right to object** | You control all data - there's nothing to object to |
| **Right to rectification** | Edit any entry directly in the app |

---

## Updates to This Policy

If we ever change our privacy practices (e.g., add optional cloud backup), we'll:

1. **Update this policy** with a new "Last Updated" date
2. **Notify you in the app** before implementing changes
3. **Make any new data collection opt-in only** (never automatic or required)
4. **Give you a choice** - if you don't like the changes, keep using the fully local version

We're committed to **privacy by default forever**. Any future features that involve data transmission will be:
- **Optional** (not required to use the app)
- **Transparent** (we'll explain exactly what data goes where)
- **User-controlled** (you can disable it anytime)

---

## International Data Transfers

Your data doesn't cross borders because it doesn't leave your device. 🌍📵

If we add optional cloud sync in the future, we'll update this policy to explain where servers are located and how data is protected.

---

## Your Rights

You have the right to:

✅ **Access your data** - it's all on your device, open the app anytime
✅ **Delete your data** - delete the app or individual entries
✅ **Export your data** - use the export feature (coming soon)
✅ **Stop using the app** - no account, no contracts, just delete it
✅ **Control your privacy** - disable microphone, use offline, your choice

---

## Contact Us

If you have questions about this privacy policy or RantTrack's privacy practices:

- **Email**: katethompson134@gmail.com
- **GitHub**: https://github.com/k8thompson134/rant-app/issues
- **Feedback**: Use the in-app "Send Feedback" button in Settings

We can't access your symptom data (by design), but we're happy to answer questions about how the app works.

---

## Legal Disclaimers

### Not Medical Advice

RantTrack is a **symptom tracking tool**, not a medical device. It does not:
- Diagnose conditions
- Provide medical advice
- Replace consultations with healthcare providers
- Recommend treatments

Always consult with qualified healthcare professionals for medical decisions.

### No Warranty

RantTrack is provided "as-is" without warranties of any kind. We strive to make the app accurate and reliable, but:
- The NLP symptom extraction may misinterpret your entries
- Data could be lost if you delete the app or lose your device
- The app may have bugs or errors

**Important**: Because all data is local-only, we can't recover lost data. Please export important symptom histories regularly (when export feature is available).

### Limitation of Liability

We're not liable for:
- Data loss (your responsibility to back up/export)
- Misinterpretation of symptoms by the NLP algorithm
- Medical decisions made based on tracked data
- Technical issues with your device

By using RantTrack, you acknowledge these limitations and agree to use the app at your own risk.

---

## Open Source Commitment

RantTrack is committed to being **open source** so the chronic illness community can verify our privacy claims.

You can review the source code at: https://github.com/k8thompson134/rant-app

If you find any privacy issues, please report them via GitHub Issues. We take privacy seriously and will address concerns promptly.

---

## Summary: What Makes RantTrack Different

Most health apps collect your data and promise to "keep it secure." We think that's backwards.

**RantTrack's approach**: Don't collect data in the first place.

- No servers to hack
- No databases to breach
- No companies to sell your data
- No privacy policies full of loopholes

Just you, your device, and your symptom history. Simple. Private. Yours.

---

## Bottom Line

**Your health data is sacred.** You're trusting us with sensitive information about your chronic illness, your worst days, your struggles.

We honor that trust by **never having access to your data in the first place.**

Local-first. Privacy-first. Always.

---

**Questions?** Email us at katethompson134@gmail.com or open an issue on GitHub.

**Want to verify our claims?** Review our open source code: https://github.com/k8thompson134/rant-app

---

*This privacy policy was written in plain language because legal jargon is inaccessible, and accessibility is a core value of RantTrack. If you need this policy in another format (large print, screen reader optimized, simplified language), please contact us.*

---

**Document Version**: 1.0
**Last Updated**: December 30, 2024
**Next Review**: Annually, or whenever app features change
