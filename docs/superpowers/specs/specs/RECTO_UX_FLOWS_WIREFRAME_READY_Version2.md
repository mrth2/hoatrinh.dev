# RECTO — Wireframe-Ready UX Flows (Updated for On‑Device Vision)

This updated UX flows doc clarifies that all primary sensing is on‑device Vision pose estimation and includes UI cues for confidence and sensor mode selection.

---

## 1) Information Architecture

### Primary Surfaces
1. Menu Bar Icon (persistent)
2. Menu Bar Popover (primary control panel)
3. First‑Run Onboarding Window (camera permission + privacy)
4. Calibration Window (guided baseline capture)
5. Settings Window (includes Sensor Mode card)
6. Session Summary Window (v1.5+)

Navigation model remains menu bar → popover → windows.

---

## 2) Global UI Regions (wireframe)

### A. Menu Bar Icon States
- Idle/Paused
- Good Drift
- Warning Drift
- Critical Drift
- Low Confidence (distinct visual)

### B. Popover Layout Zones
- Header (app + current sensor mode)
- Primary Metrics (drift, head angle, confidence)
- Status Meter (instrument track)
- Quick Actions (set baseline, pause, deep work)
- Footer (settings, session view)

Sensor Mode indicator:
- Visible badge: [VISION] / [MANUAL] / [HEADPHONE (EXP)]

If non‑Vision mode active, show a small "orientation‑only" disclaimer for headphone mode.

---

## 3) Core User Flows

### Flow 1 — First Launch & Permissions
- Onboarding explains local Vision processing and privacy.
- Request camera permission with permission rationale.
- If permission denied, show manual fallback and instructions to enable later.

Success criteria:
- Users understand "on‑device Vision" before OS prompt.

### Flow 2 — Baseline Calibration
- Guided capture with live confidence meter (driven by Vision confidence).
- 3s stability capture once confidence is high.
- If confidence low for >8s, show tips (lighting, framing).

Error handling:
- Camera in use, low light, multiple faces.

### Flow 3 — Live Monitoring
- Continuous updates to drift and confidence.
- If confidence drops below threshold:
  - downgrade ambient intensity
  - show "Low Confidence" state
  - do not change drift tier unless confidence recovers

### Flow 4 — Quick Actions
- Set Baseline (recalibrate)
- Pause 30 min / Resume
- Deep Work toggle

### Flow 5 — Settings / Sensor Mode
- Sensor Mode: Vision (default), Manual, Headphone (experimental)
- If Headphone selected, show compatibility note and permission for motion data
- Manual mode offers simple start/stop baseline capture without camera

### Flow 6 — Session Summary (v1.5+)
- Show session duration, average drift, time in tolerance.
- Confidence trend visualization (important to explain data quality)

---

## 4) State & Edge Cases (Vision-centric)

- Normal running: Vision confidence high
- Low Confidence: brief degrade; show tips
- Multi-person detected: pause or lower confidence and ask user to reframe
- Camera in use by other app: notify and fallback
- External webcam with different geometry: show "frame calibration" helper

---

## 5) UX Copy (sensor clarity)

- “ON‑DEVICE VISION” label in onboarding and settings
- “Headphone mode provides head orientation only” (if enabled)
- “Drift is measured relative to your saved baseline” (avoid medical claims)
- Confidence messaging: “Signal: High / Medium / Low — improves with better lighting and framing.”

---

## 6) Deliverables for Design Sprint

1. Updated wireframes that include Sensor Mode badge and Confidence meter.
2. Prototype with onboarding, baseline capture, live monitoring, and settings.
3. Handoff tokens: on‑device Vision badge, confidence color mapping, sensor mode copy.

Notes:
- Keep mechanical/instrument design but ensure confidence and sensor mode are clearly visible to avoid trust issues.