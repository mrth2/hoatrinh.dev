---
slug: recto
title: Recto
tagline: macOS menu-bar posture monitor that tracks ergonomic drift with on-device Apple Vision
status: active
role: Creator
year: 2026
tech:
  - Swift
  - SwiftUI
  - Apple Vision
  - macOS
  - Sparkle
links:
  repo: https://github.com/mrth2/Recto
askContext:
  - Recto is a macOS 15+ menu-bar app that uses on-device pose estimation to measure posture drift.
  - It runs entirely locally with no network calls or stored images.
  - Distribution is via GitHub Releases and Sparkle in-app updates.
featured: false
---

Recto is a macOS menu-bar app that measures ergonomic drift from a user-defined baseline using on-device computer vision. It tracks head and body position, calculates drift percentage and head angle, and surfaces subtle feedback through the menu bar.

All processing happens locally. No images are stored and no data is transmitted.
