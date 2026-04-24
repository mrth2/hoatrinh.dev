# RECTO - Pre-MVP Validation Spec

Precedes `PRD_RECTO_MVP_Version2.md`. No Swift code for the app itself until the gates in section 6 are cleared.

---

## 1. Purpose

Validate two independent questions cheaply before committing to a full MVP build:

1. **Market signal.** Do indie Mac utility buyers want a posture drift instrument badged as a developer/designer tool, not a wellness app?
2. **Signal credibility.** Does on-device Vision pose estimation produce a drift reading that feels believable to the author under normal desk conditions?

Market validation cannot answer the second. A landing page cannot tell you whether the readout is trustworthy. Both tracks run in parallel.

---

## 2. Positioning (for all artifacts)

- **Archetype target:** indie Mac utility buyers. People who already pay for Rectangle, Raycast, Bartender, Soulver, iA Writer, Things.
- **One-line pitch:** "RECTO is a posture drift instrument for macOS. On-device vision. Menu bar only. No nagging."
- **Forbidden framing:** wellness, health, corrective, ergonomic coaching, "sit up straight." RECTO is an instrument, not a nanny.
- **Aesthetic cues:** monochrome icon, grid lines, coordinates, SF Mono, sharp corners, `#1A1A1A` / `#E0E0E0` / `#FF4500`.

---

## 3. Artifact 1 - Landing Page

### Hosting

Publish at **`recto.hoatrinh.dev`**. Reasoning in section 7.

### Code location

**New Bun workspace inside the existing `hoatrinh.dev` monorepo:**

```
apps/
  web/                    # existing portfolio (untouched)
  recto-landing/          # NEW
    src/
      App.tsx
      components/
      styles/
    functions/
      api/signup.ts       # Cloudflare Pages Function (email capture)
    index.html
    vite.config.ts
    wrangler.toml
    package.json
```

Rationale: isolated deploy, separate Pages Function namespace (no collision with `/api/ask`), delete-the-folder cleanup if RECTO is shelved, clean lift-out to a standalone `recto.app` repo if validated. Reuses the monorepo's Bun/Vite/Biome/TypeScript tooling; does NOT inherit portfolio visual tokens.

### Hosting setup

1. Create a **second Cloudflare Pages project** named `recto-landing` connected to the same GitHub repo.
2. Build command: `bun run --cwd apps/recto-landing build`. Output: `apps/recto-landing/dist`.
3. Deploy: `wrangler pages deploy apps/recto-landing/dist --functions=apps/recto-landing/functions --project-name=recto-landing`.
4. Custom domain: attach `recto.hoatrinh.dev` to the Pages project. Cloudflare provisions the CNAME and TLS automatically.
5. Environment: email provider API key lives in Pages project env vars, never committed.

### Content (single page)

- Hero: product name, one-line pitch, hero shot of the menu bar popover mock.
- Short "what it is" block. 3-4 bullets.
- Screenshot strip: menu bar icon, popover, calibration window. Mocks are fine, label as mocks if needed.
- Privacy line: "On-device Apple Vision. No frames stored. No network."
- CTA: email capture. Copy: "I want this on my Mac." Submit -> simple confirmation + optional $5 refundable deposit link.
- Footer: "By Hoa Trinh. Built solo."

### Visual identity

Use **RECTO's own palette**, not `hoatrinh.dev`'s:

- Background `#1A1A1A`, text `#E0E0E0`, accent `#FF4500`
- SF Mono primary, JetBrains Mono optional
- Sharp corners, grid lines, instrument-style meter marks

Reuse from the monorepo: tech stack (SolidJS, Vite, Cloudflare Pages, Bun workspaces, Biome) and typographic conventions (monospace, dense layout). Do NOT import portfolio components or color tokens. The `hoatrinh-design-system` skill does not apply inside `apps/recto-landing`; RECTO is a separate product with its own system.

### Email capture

- Primary pick: **Resend** audiences API via the `/api/signup` Pages Function (20 lines; POST email, call Resend SDK, return 200).
- Alternative: **Buttondown** if a newsletter angle is wanted later.
- Skip Mailchimp. Skip building a DB.

### $5 deposit (optional)

- **Stripe Payment Link** generated in the Stripe dashboard, pasted into the landing page. No backend.
- Mark it refundable in the copy. Do not treat deposits as revenue until gates pass.

### Build constraints

- No blog, no docs, no pricing page, no auth, no CMS. One page.
- No portfolio design-system imports.

### Target ship: 1-2 evenings.

---

## 4. Artifact 2 - Concept Post

### Venues (in order)

1. **r/macapps** - primary. Post a mock + 60-90s screen recording of the technical probe running on the author's face. Link landing page in comments only if asked, or in a non-promotional way.
2. **Hacker News Show HN** - only after the probe works and landing page is up. Title: "Show HN: RECTO - posture drift instrument for macOS (on-device Vision)".
3. **Indie Mac Twitter / Mastodon / Bluesky** - one thread with the recording.
4. **Sidebar, One Thing Well, Tiny Improvements** - submit if traction on any of the above.

### Post content

- One paragraph of pitch in the instrument framing.
- Looping video of the drift number reacting in real time to the author slouching and straightening. This is the money shot.
- Link to landing page.
- Explicit ask: "Would you run this? Reply with what would stop you from installing it."

### What to watch

- Comment sentiment: "take my money" vs "why not Stretchly" vs crickets.
- Specific objections. Privacy, camera-on-always, menu bar slot, skepticism of the signal. Catalog them verbatim.
- Ratio of signups to post views, where views are measurable.

---

## 5. Artifact 3 - Technical Probe

### Scope (what to build)

A single-window macOS SwiftUI app. That is it.

- AVFoundation front-camera capture.
- `VNDetectHumanBodyPoseRequest` (or face + shoulder pose if body pose is noisy at desk framing).
- One button: **Set Baseline**.
- One label: live **Drift %** updating from the smoothed signal.
- One label: **Confidence** (high/med/low).
- Debug-only: small overlay drawing detected landmarks for sanity checking.

### Deliberately omitted

- Menu bar, popover, status icon, ambient screen-edge UI, onboarding, settings, sensor mode selector, manual fallback, headphone mode, session tracking, persistence beyond process lifetime, code signing, notarization, installer.

### Pipeline targets

- Capture -> Vision inference -> normalized landmarks -> drift math -> EMA smoothing -> label text.
- Run inference off the main actor. Drop frames rather than queueing.
- 10-15 Hz inference at 640x480 is plenty.

### Success criteria (author self-test, not users)

Sit at the desk for 30 minutes across three lighting conditions (morning, overhead, backlit). Record observations:

- Does the drift number stay reasonably stable when you are still?
- Does it react within ~1 second when you visibly slouch, then recover when you straighten?
- Does confidence drop sensibly in bad lighting and recover when lighting improves?
- Is the reading "obviously posture-like" to the author without calibration trickery?

If two of four answers are weak, the thesis has a sensor problem. Decide whether to retune (more smoothing, different landmarks, face-only mode) or shelve.

### Timebox: 3 working days.

Day 1: capture pipeline, Vision request, landmarks on screen.
Day 2: baseline capture, drift math, smoothing.
Day 3: observation sessions, write up findings, record the demo video for the concept post.

If day 3 ends without a stable live demo video, stop. Do not build the menu bar app.

---

## 6. Go / No-Go Gates

Run both tracks in parallel. Evaluate 14 days after the concept post.

| Gate | Green | Yellow | Red |
|---|---|---|---|
| Landing signups | 100+ | 30-99 | <30 |
| Pre-order deposits at $5 | 10+ | 3-9 | 0-2 |
| Probe self-test | 3-4 of 4 pass | 2 of 4 pass | <2 pass |
| Concept post sentiment | "when can I buy" appears | mixed curiosity | dismissive or silent |

**Green across the board:** start the MVP scoped to `PRD_RECTO_MVP_Version2.md`. Positioning locked as instrument-for-indie-Mac-utility-buyers.

**Mixed:** do not build. Extend validation by two weeks. Address the weakest gate specifically (better demo video, better landing copy, smarter posting venue, retune signal).

**Red on landing + concept:** shelve or reposition. Consider the broader drift instrument pivot (posture + focus + typing rhythm as one signal bundle) before abandoning.

**Red on probe:** the thesis is broken at the sensor layer. No amount of marketing fixes this. Shelve.

---

## 7. Hosting Decision

**Publish at `recto.hoatrinh.dev`.** Reasons:

1. **Brand separation.** KeepGoing is a commercial product with paying users and its own positioning. Hanging an unrelated utility off `recto.keepgoing.dev` muddies that story for the 95% of visitors who do not care about RECTO. If RECTO dies, KeepGoing takes zero brand hit.
2. **Aesthetic match.** `hoatrinh.dev` is already terminal-styled. RECTO's instrument language (grid, mono, sharp corners) lives natively in that design system. Reusing it costs nothing and reinforces the pitch.
3. **Lower stakes.** This is a validation test, not a launch. The personal site is the right venue for experiments. A failed subdomain on a portfolio is invisible noise. A failed subdomain on a revenue-generating product is a drag.
4. **Migration path.** If the gates go green, buy `recto.app` (or similar) and 301 from `recto.hoatrinh.dev`. Standalone domain is the right endgame for a product, but paying for it before validation is premature.

**Do not use `recto.keepgoing.dev`** unless the product pivots into something KeepGoing-adjacent (e.g., a drift-signal bundle for developer focus that becomes a KeepGoing add-on). That is a different product and a different spec.

**Soft-mention on KeepGoing** is fine once there is something to link to. A one-line "I also made this" on the KeepGoing about page or changelog reaches the right audience without contaminating the main site.

---

## 8. Deliverables Checklist

- [ ] `apps/recto-landing` workspace scaffolded in the `hoatrinh.dev` repo
- [ ] Cloudflare Pages project `recto-landing` created and wired to the repo
- [ ] `recto.hoatrinh.dev` custom domain attached to the Pages project
- [ ] Landing page live with RECTO palette (NOT portfolio tokens)
- [ ] `/api/signup` Pages Function posting to Resend or Buttondown
- [ ] Optional Stripe Payment Link for the $5 refundable deposit
- [ ] Technical probe repo with running app on author's machine
- [ ] 60-90s demo video recorded from the probe
- [ ] Concept post drafted and posted to r/macapps
- [ ] Gate evaluation written up 14 days after post

---

## 9. Out of Scope for This Phase

Everything in the MVP PRD that is not in section 5 above. Specifically: menu bar integration, popover UI, ambient feedback, settings, onboarding, privacy copy polish, App Store submission, code signing, Pro tier features, session tracking, Deep Work, sensor fusion, headphone mode, manual fallback. These are MVP concerns. They are wasted effort until the gates clear.
