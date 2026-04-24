# PRD — RECTO (v2)

## NOTE — TECHNICAL CLARIFICATION
v2 is based on a multi‑input engine where Vision/Core ML remains the authoritative source for posture drift. Headphone motion (Core Motion) can be used to supplement head orientation. The design intentionally avoids cloud inference and keeps all core computation local and on‑device.

---

## 1. Overview

RECTO v2 is a mature desktop calibration instrument with multi‑input sensing, premium ambient signaling, and richer session intelligence while remaining minimal, private, and local‑only.

---

## 2. Goals

### Primary Goals
- Make RECTO the best premium posture‑drift instrument on macOS.
- Expand supported sensing modes without diluting simplicity.
- Strengthen Pro value for paid conversion.

### Non‑Goals
- Medical/clinical posture claims
- Health or rehab outcomes
- Enterprise team dashboards

---

## 3. v2 Feature Set

### 3.1 Multi‑Input Calibration Engine
Supported inputs:
- Vision (primary, most complete; on‑device Core ML)
- Manual (fallback)
- Supported Headphone Motion (head orientation only; Core Motion)
- Optional blended mode (Vision + orientation fusion)

Rules:
- Vision remains default authoritative mode for full posture estimates.
- Headphone mode labeled “orientation‑only” and used to smooth head angle where available.
- Mode limitations are visible in UI.

### 3.2 Advanced Ambient Output System
- Configurable screen‑edge glow
- Optional top‑center / notch‑adjacent glow (only where appropriate)
- Per‑display behavior settings
- Custom pulse/fade behavior
- User adjustable intensity

### 3.3 Session Intelligence
- Session timeline
- Drift distribution
- Stability score
- Recalibration points
- Weekly trend summaries
- Time in tolerance by session

### 3.4 Workflow‑Aware Behavior
- Rules based on active app
- Auto‑pause during presentation modes or detected meetings
- Better camera confidence management
- Adaptive background behavior to save power

### 3.5 Tolerance Profiles
- Strict / Standard / Relaxed
- Custom thresholds
- Optional presets for coding / writing / reading

### 3.6 Calibration Quality Flow
- Guided baseline capture
- Quality score / calibration health
- Recalibration suggestions when signal degrades

---

## 4. User‑Facing Metrics

- Live drift %
- Head angle
- Confidence
- Session stability
- Time in tolerance
- Weekly drift trend

---

## 5. Technical Stack

- Swift 6
- SwiftUI
- AppKit (menu bar + system interactions)
- Vision (on‑device pose estimation)
- AVFoundation
- Core Motion (headphone orientation, optional)
- Local persistence for session summaries

Hardware notes:
- Apple Silicon (M‑Series) accelerates Core ML/Vision inference through the Neural Engine and GPU where applicable — enabling efficient on‑device performance.

---

## 6. Privacy

- Local‑only data handling.
- No stored camera frames.
- No cloud processing.
- No biometric identity data.

---

## 7. Monetization (v2)

### Free
- Baseline calibration
- Live drift % + head angle
- Pause / resume
- Limited session view

### Pro
- Ambient output system
- Session intelligence
- Deep Work automation
- Multi‑input modes
- Tolerance profiles
- Advanced controls

---

## 8. Success Metrics

- Increased Pro conversion
- Higher weekly retention
- Positive reviews emphasizing privacy + subtlety
- Lower churn from camera discomfort