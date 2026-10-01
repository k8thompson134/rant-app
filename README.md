# RantTrack

**Privacy-first symptom tracker for disabled and chronically ill people.**

Type or speak how you feel. A rule-based NLP engine extracts symptoms, severity, pain details, triggers, duration, and negation, with a confidence score on each detection. Everything runs in the browser and is stored in `localStorage`. No account, no server, no analytics.

## Features

- Voice (Web Speech API, where the browser supports it) or typed input
- 200+ symptom patterns: medical terms, spoon theory, casual and Gen-Z language
- Negation handling ("no nausea though")
- History grouped by day
- Insights: symptom frequency and good/moderate/rough day counts over 7, 30, 90 days, or all time
- JSON export and import, CSV export

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build into dist/
npm run test     # NLP test suite
```

## Layout

```
src/nlp/          Extraction engine (tokenizer, dictionaries, severity, pain, temporal, confidence)
src/types/        Shared types and symptom display/colour helpers
src/utils/        Date helpers and trend analysis
src/components/   Rant, History, Insights, Data tabs
src/storage.ts    localStorage persistence with visible failure handling
```

## Mobile app

The React Native / Expo version (on-device SQLite, native speech recognition, energy-tier tracking) lives on the [`mobile`](../../tree/mobile) branch.

## Known issues

Roughly 30 of the 285 NLP tests fail (negation edge cases, temporal parsing, energy-tier signals). They predate the web port.

## Legal

[Privacy policy and terms](docs/index.html).

---

Built by Kate Thompson, who has lived with Long COVID since 2020 and wanted a tracker that works on the days she can barely use one.
