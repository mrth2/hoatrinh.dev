# PRD — RECTO (v1.5)

## NOTE — TECHNICAL CLARIFICATION
v1.5 continues to rely on on‑device Vision/Core ML pose estimation as the primary sensing mode. Headphone motion remains a supplemental, experimental input (Core Motion) and is explicitly labeled as orientation-only.

---

## 1. Overview

RECTO v1.5 expands the MVP by improving signal stability, adding session intelligence, and introducing optional workflow‑aware behavior—while keeping the product minimalist and local‑only.

---

## 2. Goals

### Primary Goals
- Improve trust in signal quality and stability.
- Add small but meaningful session feedback.
- Reduce user friction in long work sessions.

### Non‑Goals
- Multi‑device sync
- Health claims
- External sensor ecosystems (beyond experimental headphone motion)

---

## 3. v1.5 Feature Set

### 3.1 Drift Engine Improvements (Vision Focused)
- Improved smoothing + stability around Vision outputs.
- Confidence handling for:
  - low light
  - user leaving frame
  - partial occlusion
- Tunable sensitivity presets:
  - Relaxed
  - Standard
  - Strict

### 3.2 Ambient Feedback Upgrade
- User‑selectable visibility levels: Minimal / Standard / High visibility
- Enhanced screen‑edge indicator
- Optional top‑center ambient indicator (non‑notch dependent)
- Visual-only, no system notifications

### 3.3 Session Tracking (Lite)
- Session duration
- Average drift for session
- Time in tolerance band
- Recalibration count

### 3.4 Deep Work Mode (Simple)
- Reduced visual intensity
- Extra smoothing
- Optional auto‑enable when specified apps are active (VS Code, Terminal, Xcode, iA Writer)

### 3.5 Manual Calibration Mode (Fallback)
- For camera‑averse users
- User sets baseline manually; lower precision but usable for awareness

### 3.6 Headphone Motion Mode (Experimental / Beta)
- Optional internal flag; only enabled for supported motion‑capable headphones where public APIs exist
- Uses Core Motion (headphone motion manager) as a supplemental head‑orientation input
- Explicitly described as "head orientation only" — not a full posture substitute
- When active, headphone input can smooth or complement Vision outputs (blended mode optional)

---

## 4. User‑Facing Metrics

- Drift %
- Head angle
- Confidence
- Session average drift
- Time in tolerance

---

## 5. Technical Additions

- Core Motion (for headphone mode when enabled)
- Adaptive sampling (dynamic frequency based on confidence/state)
- Improved Vision pipeline resilience and frame handling

Notes:
- On Apple Silicon, Vision/Core ML inference benefits from hardware acceleration (Neural Engine) — no cloud required.

---

## 6. Privacy

- Still local‑only.
- No camera storage.
- Motion data remains on device.
- No third‑party analytics by default.

---

## 7. Monetization (v1.5)

### Free
- Baseline calibration
- Live drift monitor

### Pro (v1.5)
- Ambient indicator upgrades
- Session tracking
- Deep Work mode
- Sensitivity presets
- (Optional) headphone motion if stable and adds value

---

## 8. Success Metrics

- Lower false positives vs MVP
- 20–30% improvement in week‑2 retention
- Session stats are understood without explanation
- Alternate modes reduce camera‑privacy objections