---
slug: pacelingo
title: PaceLingo
tagline: Private AI English coach for family learning with voice-first practice and personalized feedback
status: active
role: Creator
year: 2026
tech:
  - Flutter
  - Firebase
  - Google Gemini
  - Cloud Functions
askContext:
  - The README describes a voice-first PWA with push-to-talk practice, speech-to-text, text-to-speech, and text input fallback.
  - Lesson modes are Free Talk, Pronunciation Guru, and Vocabulary Builder, backed by a seven-layer adaptive prompt system.
  - The app uses Firebase Anonymous Auth, Cloud Firestore, and Cloud Functions, with the Gemini API key kept in Google Cloud Secret Manager.
featured: true
---

PaceLingo is a private PWA I built so my family can practice English in short, low-friction sessions. The experience is voice-first: push-to-talk conversation, speech recognition, text-to-speech playback, and Gemini-generated lessons for free talk, pronunciation, and vocabulary.

After each session, it extracts new words and recurring mistakes into a per-learner word bank, writes a summary, and tracks streaks over time. Anonymous auth and profile-based progress keep setup lightweight while still supporting multiple learners on the same device.
