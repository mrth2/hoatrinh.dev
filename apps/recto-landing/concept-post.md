# RECTO - Concept Post

Ready-to-publish copy per venue. Adapt lightly, do not change the instrument framing.
Post only after the technical probe produces a stable live demo video.

---

## r/macapps (Primary)

**Title:**
> I built a posture drift instrument for macOS. On-device Apple Vision, menu bar only, no nagging. Looking for honest feedback.

**Body:**

I've been thinking about posture apps for a while, but every one I tried made the same trade-off: either full silence or a constant torrent of reminders. Neither felt like a tool I'd actually keep running.

So I'm building RECTO - a posture drift *instrument* for macOS. Not a coach, not a wellness app. The idea is simple: you sit in a good position, click **Set Baseline**, and RECTO uses on-device Apple Vision to continuously measure how far you've drifted from that position. When you've moved past a threshold, it surfaces a subtle ambient signal - a gentle visual nudge, not a notification - then goes quiet again.

Key points:
- Runs entirely on-device via Apple Vision (Core ML). No stream goes off your Mac.
- Camera frames are processed in-memory and discarded immediately. Nothing is stored.
- Menu bar only. No dock icon, no full-screen dashboards.
- The reading is *relative*. It tells you "you've drifted 23% from your saved baseline" - not "you have bad posture."

[embed looping video: drift number reacting as I slouch and straighten]

This is still a validation build. Landing page is live at recto.hoatrinh.dev if you want to follow along.

**Honest question:** Would you run this? And more useful - what would actually stop you from installing it?

Specific concerns I'm curious about: the camera permissions, keeping a menu bar slot, whether the reading feels trustworthy, or something else entirely.

---

**Comment strategy:**
- Link to landing page only if directly asked, or if the post has genuine traction (20+ upvotes, positive sentiment). Do not front-load the link.
- Catalog every objection verbatim in the gates log (see `RECTO_PRE_MVP_VALIDATION.md` section 6).
- Watch for: "take my money", "why not just Stretchly", camera concern objections, menu bar slot pushback, drift signal skepticism.

---

## Hacker News - Show HN

Post this only after r/macapps traction is confirmed and the probe is solid.

**Title:**
> Show HN: RECTO - posture drift instrument for macOS (on-device Vision)

**Comment (top of thread):**

I wanted an ambient signal that tells me when I've drifted from a saved ergonomic baseline - not a posture coach, not a habit app, just a measurement instrument.

RECTO uses Apple's Vision framework to run pose estimation locally on your Mac (M-series Neural Engine). You set a baseline, and it computes relative drift as a percentage. A subtle ambient indicator updates continuously. Camera frames are never stored or transmitted - everything is in-memory.

This is a validation build to test whether the signal is trustworthy enough to be useful. Video of the live drift reading in the Show HN post. Landing page for early interest at recto.hoatrinh.dev.

Technical stack: Swift 6, SwiftUI, AVFoundation, VNDetectHumanBodyPoseRequest.

Happy to go deep on the Vision pipeline, signal smoothing, or the EMA approach to stabilising the reading.

---

## Twitter / Mastodon / Bluesky

**Thread (post 1 of 3):**

I'm building RECTO - a posture drift instrument for macOS.

Not a wellness app. Not a reminder system.

You set a baseline. It measures your drift from it using Apple Vision, locally, on your Mac. Subtle ambient signal when you move too far. Then it goes quiet.

[embed video]

---

**Thread (post 2 of 3):**

Technical facts about how it works:

- Apple Vision pose estimation, running on the Neural Engine
- No frames stored. No network. Everything in-memory.
- Menu bar only. One popover. No dock icon.
- Reading is relative to *your* baseline, not a generic "good posture" standard.

---

**Thread (post 3 of 3):**

Still in validation. Testing whether the signal is actually trustworthy before building the menu bar app.

Early interest list at recto.hoatrinh.dev

What would stop you from running something like this?

---

## Submission blurbs (Sidebar / One Thing Well / Tiny Improvements)

Submit these after traction on r/macapps or HN.

**One-liner:**
> RECTO is a posture drift instrument for macOS. On-device Apple Vision, menu bar only, no nagging. Measures relative drift from a user-set baseline.

**Short description (50-80 words):**
> RECTO is a macOS menu bar utility that uses Apple Vision to monitor posture drift from a baseline you set. It's not a wellness or reminder app - it's a calibration instrument. Camera frames are processed on-device and discarded immediately. When you drift past a threshold, a subtle ambient cue appears. No notifications, no coaching, no data leaving your machine.

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
