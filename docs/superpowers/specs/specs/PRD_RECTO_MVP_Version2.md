# PRD — RECTO (MVP)

## NOTE — TECHNICAL CLARIFICATION
RECTO uses on‑device pose estimation (Apple Vision / Core ML) to compute posture drift from a user‑defined baseline. This is ML-powered computer vision running locally on macOS (no cloud inference). Do not interpret this as an LLM or cloud AI product. Claims in the PRD emphasize relative, personal drift consistency rather than absolute medical precision.

---

## 1. Overview

**Product Name:** RECTO  
**Subtitle:** Posture Drift Calibration  
**Platform:** macOS 15.0+  
**Target Hardware:** Apple Silicon (M‑Series optimized)

RECTO is a macOS menu bar instrument that measures ergonomic drift from a user‑defined baseline using on‑device computer vision. It replaces “posture nagging” with subtle, continuous calibration feedback.

---

## 2. Goals

### Primary Goals
- Ship a credible, private, menu‑bar‑first posture drift instrument.
- Prove that baseline calibration + drift monitoring can retain users.
- Avoid wellness/medical positioning; deliver a technical utility.

### Non‑Goals
- Medical claims or health outcome promises.
- External device integrations.
- Notch‑exclusive UI dependence.
- Rich analytics dashboard.

---

## 3. Target Users

- Developers, designers, writers, researchers.
- Long‑session desk workers.
- Users who dislike reminders and “wellness” apps.
- Privacy‑sensitive users.

---

## 4. Key Product Principles

1. Calibration over correction  
2. Subtle feedback, no nagging  
3. Local‑only processing (on‑device Vision/Core ML)  
4. Instrument‑like UX  
5. Minimal configuration

---

## 5. MVP Feature Set

### 5.1 Menu Bar Instrument
- Runs in menu bar only.
- Displays:
  - Drift %
  - Head angle
  - Confidence indicator
  - Active / paused state
- Monochrome icon (instrument style).

### 5.2 Zero‑Point Calibration (Baseline)
- User sits in ideal ergonomic posture.
- Clicks **Set Baseline**.
- Stores a local baseline profile.

### 5.3 On‑Device Pose Estimation & Drift Detection
- Uses Apple Vision pose estimation (local on‑device Core ML).
- Measures head and shoulder drift from baseline.
- Processes video frames in memory only; no frames are saved or sent to network.

Notes:
- This is not a medical measurement. It provides a stable, personal relative signal: "how much you've drifted from your calibrated baseline."

### 5.4 Ambient Feedback (Minimal)
- No notifications, no pop‑ups.
- Visual only:
  - Menu bar icon state change
  - Compact drift meter in popover
  - Optional thin screen‑edge indicator (very subtle)

### 5.5 Quick Actions
- Recalibrate
- Pause for 30 minutes
- Resume monitoring

---

## 6. Drift Model

### User‑Facing Metrics
- **Drift %** (relative to baseline)
- **Head Angle** (degrees)
- **Confidence** (input quality indicator)

### Default Drift Thresholds (tunable)
- 0–5%: neutral
- 6–15%: subtle warning
- 16–30%: amber warning
- 30%+: strong warning

Important: thresholds chosen to be conservative to avoid false positives given camera variability.

---

## 7. UX / Visual Design

### Visual Style
- Minimal technical interface
- Grid lines, meter marks, coordinates
- Sharp corners, no pill buttons

### Color Palette
- Background: `#1A1A1A`
- Text: `#E0E0E0`
- Accent: `#FF4500`

### Typography
- SF Mono (primary)
- JetBrains Mono (optional)

---

## 8. Privacy & Trust

- All processing on device.
- No image or video storage.
- No data transmitted.
- No third‑party analytics in MVP.
- App Store privacy label: "Data Not Collected" / explicit local processing text.

App Review language:
> RECTO uses Apple Vision for local pose estimation. Camera frames are processed in memory and discarded immediately. No video, images, or biometric data are stored or transmitted.

---

## 9. Technical Requirements

### Frameworks
- Swift 6 / SwiftUI
- AppKit for menu bar + overlays
- Vision (on‑device pose estimation)
- AVFoundation (camera pipeline)

### Permissions
- `com.apple.security.device.camera`
- `com.apple.security.app-sandbox`
- Camera usage description (clear privacy-first rationale)

### Performance
- Adaptive sampling and smoothing to minimize CPU/battery impact.
- Target: unobtrusive background workload on M-series Macs.

---

## 10. Monetization (MVP)

### Free Tier
- Baseline calibration
- Live drift % + head angle
- Pause / resume

### Pro Tier (placeholder)
- Ambient screen‑edge indicator enhancements
- Session analytics
- Deep Work rules

---

## 11. Success Metrics

- 30s or less to complete calibration.
- Drift reading appears stable to users.
- Users keep app running for a full work session.
- Low churn after week 1.

---

## 12. Non‑Functional Notes

- Emphasize the product as an "instrument" for drift awareness.
- Avoid claims about medical-grade accuracy or "professional" measurement without validation studies.