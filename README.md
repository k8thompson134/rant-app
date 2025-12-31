# RantTrack

**Privacy-first symptom tracker for disabled and chronically ill people**

Track your symptoms naturally—voice or type how you're feeling. No forms, no checkboxes, no tracking. Just you and your data, stored locally on your device.

---

## What is RantTrack?

RantTrack is a symptom tracking app designed specifically for people with ME/CFS, Long COVID, fibromyalgia, POTS, and other chronic illnesses. It uses natural language processing to extract structured symptom data from free-form text or voice input.

**Core Features**:
- **Voice or text input** - Speak or type out your symptoms
- **Smart NLP extraction** - Automatically detects 200+ symptoms, severity levels, and pain details
- **100% local storage** - Your data never leaves your device
- **Accessibility-first** - Designed for brain fog, fatigue, and low-spoon days
- **Calendar & history views** - See patterns over time
- **Privacy by design** - No tracking, no analytics, no ads

---

## Why RantTrack?

### My Story

I'm Kate, a software engineering student living with Long COVID for 5 years. I got sick with COVID during my first semester of college in November 2020, and my life has never been the same. I live with debilitating fatigue, brain fog, and chronic pain that interferes with my daily life.

When I went to doctors, they didn't understand the impact of my symptoms or how I was living with worsening symptoms every single day. New symptoms kept appearing, so many that it became overwhelming and hard to keep track of—especially with brain fog.

I turned to symptom tracking apps, but each one felt overwhelming and wasn't catered to what I needed. The apps I tried were energy-consuming, gamified, and made it hard to get much out of them if I wasn't super consistent. **On my worst days, the very days I NEEDED to be symptom tracking, I was unable to due to my post-exertional malaise symptoms themselves.** I'd end up filling out days later when I was feeling better, but I wasn't always accurately capturing every detail throughout the flares.

After trying several apps, I ended up setting up my own Notion page and tracking when I could ut have never been super consistent with that either.

Over the past couple of years, I've really declined. I can't do as much as I used to, even reflecting back a few months. At first, I really gaslit myself about it, thinking I was just depressed, giving up hope, or overthinking it. Those around me always said I was looking better, but I think I was just getting much better at operating at a higher pain level and publicly masking it after years of practice. Even my doctors would remark similarly, even when I was describing the things I was going through.

**The only thing that has significantly helped me through my diagnosis journey has been data** whether self-tracking my fatigue to help get my PEM diagnosed, using a Holter monitor to diagnose my POTS, or currently wearing a CGM to figure out what's going on with my blood sugar. As a technical person, I like seeing the data, looking for patterns, and seeing how each factor impacts outcomes. Taking this approach in my health has helped me better understand my own body and helped me better explain what I'm going through to others.

**These are the motivating factors behind the creation of this app.** Selfishly, I really want this app for myself, but I also really hope to help others who are struggling like I am.

In solidarity,
Kate Thompson

---

## Features

### Voice & Text Input
- Tap the microphone button to speak your symptoms
- Or type how you're feeling in natural language
- No structured forms or checkboxes required

### Smart Symptom Extraction
- Automatically detects **200+ symptoms** from your rant
- Extracts **severity levels** (mild, moderate, severe)
- Identifies **pain qualifiers** (burning, sharp, stabbing, etc.)
- Tracks **specific body locations** (shoulder, calf, etc.)
- Understands chronic illness terminology (PEM, flare-ups, crashes, spoon theory)

### Accessibility Features
- **Auto-save** - Saves drafts every 5 seconds (brain fog protection)
- **Quick check-in** - Log symptoms in <5 seconds
- **"Same as yesterday"** - One-tap entry duplication for bad days
- **High contrast mode** - WCAG AAA compliant
- **Font scaling** - Small to extra large
- **Touch target sizes** - 48-64pt for low dexterity
- **Screen reader optimized** - VoiceOver/TalkBack support
- **Reduced motion** - Disables animations

### Calendar & History
- **Month view** - See all entries at a glance
- **Daily entries** - View all rants for a specific day
- **Timeline** - Chronological history with search
- **Color-coded severity** - Visual severity indicators

---

## Privacy

**100% local. No cloud. No tracking.**

- All data stored in SQLite database on your device
- No user accounts required
- No analytics or crash reporting
- No third-party services
- Voice processing happens on-device using iOS/Android APIs
- Symptom extraction runs locally (no cloud AI)

Read the full [Privacy Policy](docs/PRIVACY_POLICY.md).

---

## Open Source

RantTrack is open source under the **GNU General Public License v3.0 (GPL-3.0)**.

This license ensures that:
- The community can always verify privacy claims
- Derivative works must stay open source
- No one can add tracking and close the source
- Your privacy is legally protected

See [LICENSE](LICENSE) for details.

---

## Technology

- **Frontend**: React Native (Expo)
- **Database**: SQLite + Drizzle ORM
- **NLP**: Custom JavaScript symptom extraction engine (2,260+ lines)
- **Voice**: Native iOS/Android speech recognition APIs

---

## Installation

### Beta Testing

RantTrack is currently in beta. To join:

1. **iOS**: [TestFlight link coming soon]
2. **Android**: [Google Play Internal Testing link coming soon]

### Development

```bash
# Clone the repo
git clone https://github.com/k8thompson134/rant-app.git
cd rant-app/mobile

# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

---

## Roadmap

### v1.0 (Current - Beta)
- [x] Voice & text input
- [x] NLP symptom extraction
- [x] Calendar & history views
- [x] Accessibility features
- [x] 100% local storage
- [ ] Beta testing

### v1.1 (Planned)
- [ ] Data export (CSV, PDF)
- [ ] Symptom trends visualization
- [ ] Custom symptom vocabulary
- [ ] Light theme option

### v2.0 (Future)
- [ ] Pattern detection (e.g., "You tend to crash 1-2 days after physical exertion")
- [ ] Optional encrypted cloud backup
- [ ] Wearable integration (heart rate, sleep data)
- [ ] Weather/barometric pressure tracking


---

## Contributing

Contributions are welcome! Please note:

- All contributions will be licensed under GPL-3.0
- Privacy-first design is non-negotiable
- Accessibility is a core value, not an afterthought

---

## Support

- **Email**: katethompson134@gmail.com
- **GitHub Issues**: https://github.com/k8thompson134/rant-app/issues
- **Feedback**: Use the in-app "Send Feedback" button in Settings

---

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).
See [LICENSE](LICENSE) for details.

---

## Acknowledgments

Built for the chronic illness community, by someone in the chronic illness community.

Special thanks to:
- Everyone living with ME/CFS, Long COVID, fibromyalgia, POTS, and other invisible illnesses
- The disabled activists who have paved the way for disability justice
- Anyone reading this

---

**Your data stays on your device. No tracking, no ads.**

Privacy-first. Accessibility-first. Always.
