# RECTO - Technical Probe

Single-window SwiftUI app. 3-day timebox.
Goal: validate that on-device Vision pose estimation produces a drift reading that is stable, reactive, and "obviously posture-like" to the author.

Do not start the menu bar MVP until this probe passes the success criteria in section 5.

---

## 1. Scope

Build exactly this. Nothing else.

- AVFoundation front-camera capture
- `VNDetectHumanBodyPoseRequest` landmark extraction
- **Set Baseline** button
- Live **Drift %** label (updates from smoothed signal)
- Live **Confidence** label (High / Medium / Low)
- Debug overlay: landmark dots drawn over the camera preview (debug builds only)

**Do not build:** menu bar, popover, status icon, screen-edge ambient UI, onboarding, settings, sensor mode selector, manual fallback, headphone mode, session tracking, any persistence beyond process lifetime, code signing, notarization, or an installer.

---

## 2. Day-by-Day Plan

### Day 1 - Camera + Vision + Landmarks on Screen

**Target state at end of day:** camera preview is visible, landmarks are drawn on screen as dots, raw per-landmark confidences are logged to the console.

Tasks:
1. Create a new Xcode project: macOS, SwiftUI, App target.
2. Add `NSCameraUsageDescription` to `Info.plist`.
3. Add `com.apple.security.device.camera` entitlement.
4. Build a `CaptureSession` actor:
   - `AVCaptureSession` with `AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front)`
   - Output: `AVCaptureVideoDataOutput` with a sample buffer delegate
   - Target resolution: `AVCaptureSession.Preset.vga640x480`
5. Build a `VisionProcessor`:
   - Input: `CMSampleBuffer` from the capture session
   - Creates `VNDetectHumanBodyPoseRequest` (or `VNDetectFaceLandmarks` with a manually estimated shoulder proxy as fallback if body pose is too noisy at desk distance - see section 3b; test the primary first)
   - Runs request via `VNImageRequestHandler` with `.front` camera orientation
   - Extracts recognized points from `VNHumanBodyPoseObservation`
6. Build a `DebugOverlayView` using `Canvas` or `Path` that draws a dot at each recognized landmark position (normalized VN coordinates -> view coordinates).
7. Show the camera preview + overlay in a single `NSWindow` (800x600 is fine).

**Key landmarks for desk framing (prioritize these):**
- `nose`, `leftEye`, `rightEye` - face anchor
- `leftShoulder`, `rightShoulder` - torso anchor
- `neck` (if available in body pose) or derived midpoint

**Check:** do all landmarks appear on screen? Are the raw confidence values printed sensibly (0.0-1.0 per point)?

---

### Day 2 - Baseline + Drift Math + EMA Smoothing

**Target state at end of day:** clicking Set Baseline locks in a reference pose; the Drift % label updates live; the Confidence label reflects signal quality.

#### 2a. Landmark Normalization

Normalize each frame's landmark set to a stable coordinate space before doing any comparison. This removes camera-to-face distance as a variable.

Suggested approach:
1. Compute the midpoint of `leftShoulder` and `rightShoulder` as the torso anchor `M`.
2. Compute the inter-shoulder distance `S = distance(leftShoulder, rightShoulder)`.
3. Normalize each landmark as: `normalized = (landmark - M) / S`

This gives a scale- and translation-invariant pose vector.

**Frame guards (apply before normalization):**
- If `leftShoulder.confidence < 0.5` or `rightShoulder.confidence < 0.5`, drop the whole frame. Both shoulder anchors are required.
- If `S` is below a minimum (suggest: 0.05 in normalized VN coordinates, or ~30 px in a 640x480 frame), drop the frame. Near-zero shoulder distance usually means occlusion or misdetection and would blow up the normalization.
- In the downstream pose vector, include a non-shoulder landmark only if its own confidence > 0.5. Landmarks below that threshold are excluded from the baseline capture and the drift comparison for that frame, not used as zeros.

#### 2b. Baseline Capture

```swift
struct BaselineLandmark {
    let point: CGPoint  // normalized
    let confidence: Float  // per-landmark confidence at capture time
}

struct BaselineProfile {
    let capturedAt: Date
    let landmarks: [VNHumanBodyPoseObservation.JointName: BaselineLandmark]
    let quality: Float  // average confidence across included landmarks at capture time
}
```

Per-landmark confidence is kept so the drift calculation can skip or down-weight joints that were unreliable at capture time (e.g. excluded if `baseline.confidence < 0.5`).

On **Set Baseline** button tap:
- Take the current normalized landmark set (frame guards from 2a must have passed).
- Reject the capture if average confidence < 0.6 (show a brief "signal too weak, adjust framing" message instead).
- Store as `BaselineProfile`.

#### 2c. Drift Computation

For each incoming frame after baseline is set (and after the frame guards in 2a pass):

```
eligible = [
  joint for joint in baseline_landmarks.keys
  where current_confidence[joint] > 0.5
    and baseline_landmarks[joint].confidence > 0.5
]

if eligible.count < 3:
  // too little signal this frame; skip the drift update and hold the last smoothed value
  return nil

driftPercent = mean(
  distance(normalized_current[joint], baseline_landmarks[joint].point)
  for joint in eligible
) * 100
```

The minimum of 3 eligible joints prevents a single flickering landmark from driving the reading. If `eligible.count < 3`, skip the update, do not emit NaN, and let the Confidence band reflect the dropout.

Scale factor: tune this so that a visibly slouched position reads roughly 20-35%. You will calibrate this by observation on Day 3.

#### 2d. Confidence Score

```
frameConfidence = mean(per_landmark_confidence for landmarks used in drift calc)
```

Map to three bands:
- High: frameConfidence >= 0.75
- Medium: 0.5 <= frameConfidence < 0.75
- Low: frameConfidence < 0.5 (do not update Drift %; show Low and hold last value)

#### 2e. EMA Smoothing

Apply an exponential moving average to the raw drift value before displaying:

```swift
let alpha: Float = 0.15  // start here; tune if jitter is high or lag is noticeable

if !hasSmoothedDrift {
    smoothedDrift = rawDrift  // seed on first post-baseline sample, not 0
    hasSmoothedDrift = true
} else {
    smoothedDrift = alpha * rawDrift + (1 - alpha) * smoothedDrift
}
```

Without this seed, the first ~1 second after baseline reads artificially low because `smoothedDrift` starts at 0. Reset `hasSmoothedDrift = false` whenever a new baseline is captured.

Also apply outlier rejection: if `hasSmoothedDrift && abs(rawDrift - smoothedDrift) > 40`, discard the frame (likely a Vision detection spike). Do not run outlier rejection on the seed frame.

#### 2f. UI State

```swift
@Observable
class ProbeViewModel {
    var smoothedDrift: Float = 0
    var confidence: ConfidenceBand = .low
    var hasBaseline: Bool = false
    var baselineQuality: Float = 0
}
```

Display:
- Drift %: `String(format: "%.1f%%", smoothedDrift)` in a large monospaced label. Gray if no baseline, white if baseline set.
- Confidence: `"SIGNAL: HIGH"` / `"SIGNAL: MED"` / `"SIGNAL: LOW"` in a smaller label.
- Set Baseline button: disabled when Confidence is Low.

---

### Day 3 - Observation Sessions + Demo Video

**Timebox: if no stable live demo video by end of day, stop. Do not proceed to the menu bar app.**

#### 3a. Observation Protocol

Run three 10-minute sessions with different lighting:

1. **Morning natural light** (window to the side)
2. **Overhead artificial light**  
3. **Backlit / screen-only** (sit with your back to the window)

For each session, record four observations:

| # | Question | Pass | Weak | Fail |
|---|---|---|---|---|
| 1 | Drift stays below 5% when sitting still at baseline | < 3% avg | 3-8% avg | > 8% avg |
| 2 | Drift reacts within ~1 second when visibly slouching | Yes | 1-2s delay | No reaction |
| 3 | Confidence degrades in bad lighting, recovers in good | Yes | Partially | No correlation |
| 4 | Reading feels "obviously posture-like" without trickery | Yes | Partially | No |

Record all values in `probe-findings.md` (create after Day 3).

#### 3b. Tuning Checklist

If jitter is too high when still:
- Lower `alpha` (try 0.10 or 0.08)
- Widen outlier rejection threshold

If reaction is too slow when slouching:
- Raise `alpha` (try 0.20)
- Add a separate fast-path: if confidence is High and raw delta > 15, bypass smoothing for one frame

If confidence does not track lighting changes:
- Tighten the confidence threshold (raise the Low/Medium boundary to 0.6)
- Check whether `VNDetectHumanBodyPoseRequest` is too noisy at desk framing; if so, fall back to `VNDetectFaceLandmarks` + a manually estimated shoulder proxy

#### 3c. Demo Video

Record a 60-90 second screen capture showing:
1. App open, no baseline set, Drift shows "--" or 0.
2. Click Set Baseline. Confirmation visible.
3. Sit still for 5-10 seconds. Drift reads low (< 5%).
4. Visibly slouch forward. Drift climbs to 20-35% within 1-2 seconds.
5. Straighten. Drift drops back near baseline within 2-3 seconds.
6. (Optional) Cover camera or step away. Confidence drops to Low.

Keep it raw. No editing needed for the concept post - the uncut reaction of the signal is the money shot.

---

## 3. Architecture Notes

### Concurrency

Run all Vision and signal processing off the main actor:

```swift
actor CaptureVision {
    private var baseline: BaselineProfile?
    private var smoothedDrift: Float = 0

    func processFrame(_ buffer: CMSampleBuffer) async -> DriftMetrics? { ... }
    func setBaseline(_ landmarks: NormalizedLandmarks) { ... }
}
```

Update UI by pushing to `@MainActor` only after computing `DriftMetrics`:

```swift
await MainActor.run {
    viewModel.smoothedDrift = metrics.drift
    viewModel.confidence = metrics.confidence
}
```

Drop frames rather than queueing: if a Vision request is still running when the next frame arrives, discard the new frame.

### Frame Rate

Sample at 10-15 Hz. Do not process every camera frame (camera outputs 30 fps):

```swift
private var lastProcessedAt: Date = .distantPast
private let minimumInterval: TimeInterval = 1.0 / 12.0  // ~12 Hz

func captureOutput(_ output: AVCaptureOutput, didOutput buffer: CMSampleBuffer, ...) {
    let now = Date()
    guard now.timeIntervalSince(lastProcessedAt) >= minimumInterval else { return }
    lastProcessedAt = now
    Task { await captureVision.processFrame(buffer) }
}
```

### Debug Build Only

The landmark overlay should be wrapped in `#if DEBUG`:

```swift
#if DEBUG
DebugOverlayView(landmarks: viewModel.rawLandmarks)
#endif
```

---

## 4. What to Avoid

- Do not add menus, preferences, or a dock icon.
- Do not persist any data - baseline lives only in memory for the duration of the process.
- Do not add a calibration wizard. One button is enough.
- Do not add ambient feedback, color coding, or warning tiers. A number and a confidence label is everything you need to evaluate the signal.
- Do not write tests yet. This is a probe, not production code.

---

## 5. Success Criteria

Tally "Pass" columns only. "Weak" counts as half a pass when deciding, "Fail" counts as zero.

- 3.0 - 4.0 points = record the demo video and proceed to the concept post.
- 2.0 - 2.5 points = "needs tuning, extend by 2 days", then re-score.
- Below 2.0 points = sensor problem, evaluate whether to retune landmark selection or shelve.

All four pass + concept post traction + 100+ landing signups = start `PRD_RECTO_MVP_Version2.md`.

---

## 6. Files to Produce After Day 3

- `probe-findings.md` - raw observation log (4 questions x 3 lighting conditions = 12 cells, plus any notes)
- Demo video file (screen recording, 60-90s, unedited is fine)
- No code to commit to this repo - the probe lives in a separate Xcode project

---

## 7. Deliberate Non-Goals for This Probe

Everything in the MVP PRD that is not a posed landmark → drift percentage → confidence score is out of scope:

- Menu bar integration
- Status icon states
- Popover UI
- Ambient screen-edge feedback
- Onboarding
- Privacy copy
- App Store metadata
- Code signing and notarization
- Sensor fusion (headphone motion)
- Manual fallback mode
- Session tracking
- Deep Work mode
- Pro tier

None of these are worth a minute of time until the signal passes the self-test.
