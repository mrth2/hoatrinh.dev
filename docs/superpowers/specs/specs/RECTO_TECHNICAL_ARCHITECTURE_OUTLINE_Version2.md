# RECTO — Technical Architecture Outline (Updated for On‑Device Vision)

This updated technical architecture assumes Vision/Core ML is the primary sensor. It includes guidance on confidence handling, blending with optional orientation input, and on‑device performance considerations for Apple Silicon.

---

## 1) Architecture Goals

- Reliable posture‑drift estimation using Apple Vision (on‑device Core ML).
- Privacy‑first: no frame persistence, local processing only.
- Modular sensor pipeline with Vision primary and optional motion input.
- Deterministic state machine for UI behavior with explicit confidence handling.

---

## 2) High‑Level System Diagram (logical)

1. App Shell Layer
2. Sensor Layer
   - Camera capture (AVFoundation)
   - Vision pose estimation (on‑device)
   - Optional headphone motion (Core Motion)
3. Signal Processing Layer
   - Landmark normalization
   - Baseline manager
   - Drift computation
   - Smoothing and confidence scoring
4. State & Rules Layer
   - Monitoring state machine
   - Threshold engine
5. Presentation Layer
   - Menu bar icon
   - Popover view models
   - Ambient renderer
6. Persistence Layer
   - Baseline store
   - Settings
   - Session summaries (local)

---

## 3) Module Breakdown (key updates)

### Module C — `CaptureVision`
- Use AVFoundation to get frames.
- Use Vision's VNDetectHumanBodyPoseRequest (or equivalent) for landmark extraction.
- Respect batching and throttling: do not queue unbounded frames.
- Use Vision results' internal confidences to compute overall frame confidence.

### Module D — `CalibrationEngine`
- Normalize landmarks to a consistent coordinate space (relative to face/shoulders).
- BaselineProfile includes landmark vectors plus calibration quality metadata.
- Compute driftPercent using robust measures (median of normalized metrics, weighted by per‑landmark confidence).
- ConfidenceScore = function(Vision confidences, landmark stability, recent variance).

Important: avoid overfitting a complex ML fusion model here initially — use deterministic math and smoothing on Vision outputs.

### Module E — `MonitoringState`
- If confidence < thresholdLong: transition to `lowConfidence` and reduce ambient intensity.
- If multiple faces detected: `lowConfidence` + guidance to user.
- Use hysteresis and debounce to prevent tier thrashing.

### Module F — `SensorFusion` (v2 / experimental)
- Interface `SensorInputProvider` protocol:
  - `VisionProvider` (required)
  - `MotionProvider` (optional)
- If `MotionProvider` present, only use yaw/pitch/roll to smooth head angle; do not replace vision-based shoulder/torso signals.
- Fusion algorithm: complement head angle measurement, with conservative trust weighting (e.g., vision 0.8 / motion 0.2) and require explicit user opt‑in.

---

## 4) Data Contracts (core)

- `LandmarkSet` (timestamp, points, per‑point confidence)
- `BaselineProfile` (createdAt, normalized vectors, quality)
- `DriftMetrics` (timestamp, driftPercent, headAngleDegrees, confidence, tier)
- `MonitoringSnapshot` (state, driftMetrics, pauseRemaining)

---

## 5) Signal Processing Pipeline (recommended)

1. Capture frame (downscale if needed)
2. Vision inference (VNDetectHumanBodyPoseRequest)
3. Extract landmarks and per‑point confidence
4. Validate frame confidence (drop low‑quality frames)
5. Normalize landmarks
6. Compare to baseline
7. Compute raw drift values
8. Apply smoothing (exponential moving average + outlier rejection)
9. Emit `DriftMetrics` and update state machine
10. Update UI (debounced)

Notes:
- Use frame‑level confidence gating: do not allow a single low‑quality frame to flip UI tier.

---

## 6) Concurrency & Performance

- Use Swift Concurrency; run vision and signal processing off the main actor.
- Processing pattern:
  - Camera capture → AsyncStream<Frame>
  - Vision inference tasks scheduled on an inference queue
  - CalibrationEngine runs on a dedicated actor to avoid race conditions
- Use `Task` cancellation to drop stale processing when paused or when backlog grows.

Performance tips:
- Use moderate input resolution (e.g., 640x480) to reduce CPU.
- Take advantage of Apple Silicon Neural Engine (Vision/Core ML handles this internally).
- Adaptive sampling: raise sampling when confidence high and user active, lower when idle.

---

## 7) Confidence Handling & UX Signals

- Provide three confidence bands: High / Medium / Low.
- Confidence based on:
  - per‑landmark confidences from Vision
  - recent variance of metrics
  - face/shoulder visibility checks
- UX behavior:
  - High: normal UI updates
  - Medium: reduce ambient intensity; show confidence badge
  - Low: show "Low Confidence" overlay; do not escalate drift tier

---

## 8) Edge Cases & Reliability

- Multiple people: detect and pause.
- Occlusion (headphones/hoodie): degrade gracefully.
- Camera in use: present clear recovery UI.
- External webcam geometry: provide manual framing helper and recalibration prompt.

Testing:
- Use synthetic landmark datasets to test drift math under controlled variance.
- Record inference latency and per‑frame confidence in dev build debug panel.

---

## 9) Security & Privacy

- No frame persistence in any release build.
- Logs must not include identifiable image data.
- Any telemetry must be opt‑in and anonymized; default: none.
- Provide clear in‑app privacy text and App Store submission note explaining local processing.

---

## 10) Validation Strategy

- Collect opt‑in telemetry in a limited beta (if consented) to measure real‑world confidence and false positive rates.
- Use automated replay tests with recorded landmark sequences simulating typical desk behaviors.
- Aim to tune thresholds conservatively to minimize false alarms.

---

## 11) Integration Points & Future Expansion

- Headphone motion (Core Motion) as optional provider — requires opt‑in and compatibility checks.
- External IMU puck or BLE accessory only after validating robust fusion strategy.
- Potential future on‑device learning (e.g., per‑user calibration smoothing) should remain local and conservatively validated.

---

## 12) Definition of Done (MVP Tech)

- Vision-based pipeline runs stable on M‑series macOS 15.
- Baseline capture and drift metrics are deterministic and reproducible.
- UI reflects confidence and sensor mode clearly.
- No persistent storage of frames; no network dependencies.
- Performance targets met for all‑day background operation on Apple Silicon.