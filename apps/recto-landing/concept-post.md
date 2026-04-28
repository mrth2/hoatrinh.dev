# RECTO - Concept Post

Ready-to-publish copy per venue. Adapt lightly, do not change the instrument framing.
Post only after the technical probe produces a stable live demo video.

These posts describe a **validation probe**, not a shipped product. The embedded video shows a plain window with a live Drift % and Confidence readout. Do not claim a menu bar app, ambient UI, or any feature the probe does not demonstrate. The menu bar surface is the planned MVP, gated on this post earning 100+ signups and ~3 of 4 success-criteria passes.

---

## r/macapps (Primary)

**Title:**
> Validating a posture-drift signal on macOS with on-device Apple Vision. Looking for honest feedback before I build the app around it.

**Body:**

I have been thinking about posture apps for a while, but every one I tried made the same trade-off: either full silence or a constant torrent of reminders. Neither felt like a tool I would actually keep running.

So before I build anything, I am testing whether the underlying signal is even trustworthy. The idea I want to validate is a posture drift *instrument*: you sit in a good position, click **Set Baseline**, and the app uses on-device Apple Vision to continuously measure how far you have drifted from that position, as a single relative percentage.

What you are about to see in the video is the validation probe, not a finished app. It is a single window that shows:

- A live Drift % readout
- A Confidence label (High / Medium / Low)
- A camera preview with pose landmarks drawn on top

If the signal holds up, the shipped app becomes a menu bar utility with a subtle ambient cue when you drift past a threshold. That part does not exist yet.

Key intentions either way:

- Runs entirely on-device via Apple Vision. No stream leaves your Mac.
- Camera frames are processed in-memory and discarded immediately. Nothing stored, nothing sent.
- The reading is *relative*. It tells you "you have drifted 23% from your saved baseline," not "you have bad posture."

[embed looping video: drift number reacting as I slouch and straighten]

Landing page at recto.hoatrinh.dev if you want to follow the build and hear when the menu bar version is testable. No spam, just a note when there is something to try.

**Honest question:** does this drift reading look trustworthy to you, and would you want the signal running in your menu bar once the app exists?

Specific things I am curious about: whether you believe the number, whether you would trade a camera permission for this kind of readout, and what would make the signal feel untrustworthy.

---

**Comment strategy:**
- Link to landing page only if directly asked, or if the post has genuine traction (20+ upvotes, positive sentiment). Do not front-load the link.
- Catalog every objection verbatim in the gates log (see `RECTO_PRE_MVP_VALIDATION.md` section 6).
- Watch for: "take my money", "why not just Stretchly", camera concern objections, menu bar slot pushback, drift signal skepticism.
- If asked what Vision API this uses, say "Apple Vision pose estimation, tuned for desk framing." Do not name `VNDetectHumanBodyPoseRequest` publicly until the probe confirms body pose is the final choice (the probe reserves the right to fall back to face landmarks with a shoulder proxy).

---

## Hacker News - Show HN

Post this only after r/macapps traction is confirmed and the probe is solid.

**Title:**
> Show HN: RECTO - validating a posture-drift signal on macOS (on-device Vision)

**Comment (top of thread):**

I wanted an ambient signal that tells me when I have drifted from a saved ergonomic baseline, not a posture coach, not a habit app, just a measurement instrument. Before committing to a menu bar app, I am validating that the underlying signal is actually stable and reactive enough to be useful.

The video is the validation probe: a single window showing a live drift percentage and a confidence band. You set a baseline, and it computes relative drift using Apple Vision pose estimation running locally on an M-series Mac. Subtle EMA smoothing plus outlier rejection on top of the raw pose landmarks. Camera frames are never stored or transmitted, everything is in-memory, and the reading is relative to your baseline rather than a generic "good posture" standard.

If the signal passes self-testing in three lighting conditions and the concept earns interest here, the next step is a menu bar utility with a single ambient cue when drift crosses a threshold. That part is not built yet and I do not want to build it until I trust the reading.

Landing page for early interest at recto.hoatrinh.dev.

Technical stack: Swift 6, SwiftUI, AVFoundation, Apple Vision pose estimation on the Neural Engine. Happy to go deep on the Vision pipeline, the shoulder-anchored normalization, EMA smoothing, or why I am resisting the temptation to add features before the signal is proven.

---

## Twitter / Mastodon / Bluesky

**Thread (post 1 of 3):**

I am validating a posture drift instrument for macOS before I build the app around it.

Not a wellness app. Not a reminder system.

You set a baseline. It measures your drift from it using Apple Vision, locally, on your Mac. The video is the probe, showing the raw signal reacting.

[embed video]

---

**Thread (post 2 of 3):**

Technical intentions:

- Apple Vision pose estimation, running on the Neural Engine
- No frames stored. No network. Everything in-memory.
- Reading is relative to *your* baseline, not a generic "good posture" standard.
- If the signal holds up, the shipped app is menu bar only with a single ambient cue. Not built yet.

---

**Thread (post 3 of 3):**

Still validating. Testing whether the signal is actually trustworthy in three lighting conditions before committing to the menu bar app.

Early interest list at recto.hoatrinh.dev. I will only email when there is something to try.

Does the drift reading in the video look trustworthy to you?

---

## Submission blurbs (Sidebar / One Thing Well / Tiny Improvements)

Submit these after traction on r/macapps or HN, and only if the menu bar MVP is actually being built. These blurbs describe the intended shipped product, so do not submit them during the probe-only phase.

**One-liner:**
> RECTO is a posture drift instrument for macOS. On-device Apple Vision, menu bar only, no nagging. Measures relative drift from a user-set baseline.

**Short description (50-80 words):**
> RECTO is a macOS menu bar utility that uses Apple Vision to monitor posture drift from a baseline you set. It is not a wellness or reminder app, it is a calibration instrument. Camera frames are processed on-device and discarded immediately. When you drift past a threshold, a subtle ambient cue appears. No notifications, no coaching, no data leaving your machine.

---

## What to log after posting

For each venue, record:
- Post date + time
- Total views / impressions (if measurable)
- Upvotes / engagement count
- Comment sentiment: positive / neutral / negative / objection
- Verbatim objections (privacy, camera, menu bar slot, signal credibility, price, other)
- Signups attributed (check Resend audience count before and after)
- Go/no-go gate assessment (see validation spec section 6)
