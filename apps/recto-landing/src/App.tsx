import { EmailCaptureForm } from '@/components/EmailCaptureForm';

import styles from './App.module.css';

const differentiators = [
  'Tracks drift continuously, then surfaces it with subtle visual feedback before it gets too far.',
  'Uses ambient cues and quick checks instead of pop-ups, timers, and guilt-driven reminders.',
  'Lives in the menu bar like a utility, not a habit app.',
  'Built for people who already buy small sharp Mac tools.',
  'Keeps the camera pipeline on-device. No uploads. No feed review.',
];

const concerns = [
  'Does the number react quickly enough to feel real?',
  'Can it stay calm when you are still, instead of jittering?',
  'Can it be useful without turning into a guilt machine?',
];

export function App() {
  return (
    <main class={styles.page}>
      <section class={styles.hero}>
        <div class={styles.heroCopy}>
          <p class={styles.kicker}>Validation Preview / macOS Utility</p>
          <h1 class={styles.title}>RECTO</h1>
          <p class={styles.subtitle}>
            The moment you drop into focus, posture usually slips in the background. RECTO aims to
            surface that drift early with subtle visual feedback: enough to notice, not enough to
            break flow.
          </p>
          <p class={styles.lede}>
            It is a posture drift instrument for macOS: on-device vision, menu bar only, no nagging.
          </p>

          <div class={styles.signalRow}>
            <span>On-device Vision</span>
            <span>Menu bar utility</span>
            <span>No coaching tone</span>
          </div>

          <p class={styles.scrollHint}>
            Scroll for the concept, privacy model, and interface mocks.
          </p>
        </div>

        <div class={styles.heroMock} role="img" aria-label="RECTO popover concept mock">
          <div class={styles.heroMockHeader}>
            <span>RECTO / CONCEPT</span>
            <span>DRIFT MONITOR</span>
          </div>

          <div class={styles.heroMetricRow}>
            <div>
              <p class={styles.metricLabel}>Drift</p>
              <p class={styles.metricValue}>18%</p>
            </div>
            <div>
              <p class={styles.metricLabel}>Confidence</p>
              <p class={styles.metricValue}>HIGH</p>
            </div>
          </div>

          <div class={styles.heroMeter} aria-hidden="true">
            <span class={styles.heroMeterTrack} />
            <span class={styles.heroMeterNeedle} />
          </div>

          <div class={styles.heroMockBody}>
            <p>Baseline locked</p>
            <p>Camera active</p>
            <p>No network activity</p>
          </div>
        </div>
      </section>

      <section class={styles.block}>
        <h2>What RECTO does</h2>
        <p class={styles.bodyCopy}>
          Most posture apps choose one bad extreme: constant reminders or total silence. RECTO is
          aimed at the middle. It should monitor drift continuously, then surface a gentle signal
          when you are moving away from baseline, visible enough to catch and restrained enough not
          to yank you out of work.
        </p>
        <p class={styles.bodyCopy}>
          Not a coach. Not a silent dashboard. More like ambient calibration feedback for long focus
          sessions.
        </p>
      </section>

      <section class={styles.block}>
        <h2>The problem it has to solve</h2>
        <ul class={styles.list}>
          {concerns.map((concern) => (
            <li>{concern}</li>
          ))}
        </ul>
        <p class={styles.note}>The product only works if it lands in that middle zone.</p>
      </section>

      <section class={styles.block}>
        <h2>Why it feels different</h2>
        <ul class={styles.list}>
          {differentiators.map((item) => (
            <li>{item}</li>
          ))}
        </ul>
      </section>

      <section class={styles.block}>
        <div class={styles.sectionHeader}>
          <h2>How it could look</h2>
          <p class={styles.note}>
            Concept-first UI mocks to validate clarity, calmness, and trust before building.
          </p>
        </div>

        <div class={styles.strip}>
          <article class={styles.mockCard}>
            <div class={styles.mockWindow}>
              <div class={styles.mockWindowBar}>
                <span>MENU BAR</span>
                <span>PASSIVE STATE</span>
              </div>
              <div class={styles.menuBarPreview}>
                <span class={styles.menuBarDot} />
                <span>RECTO · STABLE</span>
                <span class={styles.menuBarDrift}>DRIFT 12%</span>
              </div>
            </div>
            <div class={styles.mockCardCopy}>
              <h3>Menu bar signal</h3>
              <p>
                One glance should tell you stable vs drifting, without demanding immediate action.
              </p>
            </div>
          </article>

          <article class={styles.mockCard}>
            <div class={styles.mockWindow}>
              <div class={styles.mockWindowBar}>
                <span>POPOVER</span>
                <span>LIVE READOUT</span>
              </div>
              <div class={styles.popoverPreview}>
                <div class={styles.popoverTopRow}>
                  <span>Drift</span>
                  <strong>18%</strong>
                </div>
                <div class={styles.popoverMeter}>
                  <span class={styles.popoverMeterFill} />
                </div>
                <div class={styles.popoverMeta}>
                  <span>Baseline locked</span>
                  <span>Confidence 94%</span>
                </div>
              </div>
            </div>
            <div class={styles.mockCardCopy}>
              <h3>Quick status popover</h3>
              <p>Open once, read drift and confidence, then get back to work within seconds.</p>
            </div>
          </article>

          <article class={styles.mockCard}>
            <div class={styles.mockWindow}>
              <div class={styles.mockWindowBar}>
                <span>CALIBRATION</span>
                <span>BASELINE</span>
              </div>
              <div class={styles.calibrationPreview}>
                <div class={styles.cameraFrame}>
                  <span class={styles.cameraBox} />
                  <span class={styles.cameraLandmark} />
                </div>
                <p>Hold still for 3s to lock baseline.</p>
              </div>
            </div>
            <div class={styles.mockCardCopy}>
              <h3>Calibration checkpoint</h3>
              <p>Capture baseline in a few seconds so feedback starts from a reliable reference.</p>
            </div>
          </article>
        </div>
      </section>

      <section class={styles.block}>
        <h2>Private by design</h2>
        <p class={styles.privacy}>On-device Apple Vision. No frames stored. No network.</p>
        <p class={styles.bodyCopy}>
          If this ever requires uploading camera data to feel useful, the product has failed the
          brief.
        </p>
      </section>

      <section class={styles.block}>
        <h2>Get early access</h2>
        <p class={styles.bodyCopy}>
          Early access is for people who want a low-distraction Mac utility that nudges awareness
          without turning into another source of interruption.
        </p>
        <div class={styles.earlyAccessForm}>
          <EmailCaptureForm />
        </div>
      </section>

      <footer class={styles.footer}>By Hoa Trinh. Built solo.</footer>
    </main>
  );
}
