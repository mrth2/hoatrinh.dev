import { EmailCaptureForm } from '@/components/EmailCaptureForm';
import logo from './assets/logo.png';

import styles from './App.module.css';

const differentiators = [
  'Calibration over correction. Set your baseline, and RECTO simply measures your relative drift from it.',
  'Subtle ambient feedback instead of pop-ups, timers, and guilt-driven reminders.',
  'Lives in the menu bar. Built as a technical instrument for people who already buy small, sharp Mac utilities.',
  'Local-only by design. Camera frames are processed in-memory via Apple Vision and discarded immediately.',
];

const concerns = [
  'Does the measurement react quickly enough to feel real?',
  'Does the signal stay calm when you are still, instead of jittering?',
  'Can it surface drift awareness without turning into a nagging machine?',
];

export function App() {
  return (
    <main class={styles.page}>
      <section class={styles.hero}>
        <div class={styles.heroCopy}>
          <p class={styles.kicker}>Validation Preview / macOS Utility</p>
          <div class={styles.heroTitleRow}>
            <img src={logo} alt="RECTO" class={styles.heroLogo} />
            <h1 class={styles.title}>ECTO</h1>
          </div>
          <p class={styles.subtitle}>
            When you drop into focus, ergonomics usually slip in the background. RECTO
            is designed to surface that drift early through subtle visual feedback: enough to notice,
            not enough to break flow.
          </p>
          <p class={styles.lede}>
            A posture drift instrument for macOS: on-device vision, menu bar only, no nagging.
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
        <h2>Calibration over correction</h2>
        <p class={styles.bodyCopy}>
          Most posture apps choose one bad extreme: constant reminders or total silence.
          RECTO aims for the middle. Set your ideal baseline, and RECTO monitors your drift continuously.
          When you move away from baseline, it surfaces a gentle ambient signal—visible enough to catch,
          but restrained enough not to yank you out of your work.
        </p>
        <p class={styles.bodyCopy}>
          Not a coach or a nanny. More like an ambient calibration instrument for long focus sessions.
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
              <div class={styles.menuBarStates}>
                <div class={styles.menuBarPreview}>
                  <span class={styles.menuBarDotStable} />
                  <span>RECTO</span>
                </div>
                <div class={styles.menuBarPreview}>
                  <span class={styles.menuBarDotDrift} />
                  <span>RECTO</span>
                  <span class={styles.menuBarDrift}>18%</span>
                </div>
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
        <h2>Privacy by design</h2>
        <p class={styles.privacy}>On-device Apple Vision. No frames stored. No network.</p>
        <p class={styles.bodyCopy}>
          Camera frames are fed directly to your Mac's Neural Engine to compute baseline drift, then discarded immediately.
          If this ever requires uploading camera data to feel useful, the product has failed its brief.
        </p>
      </section>

      <section class={styles.block}>
        <h2>Get early access</h2>
        <p class={styles.bodyCopy}>
          I'm collecting early signs of interest. If you want a private, low-distraction technical instrument
          for your menu bar that gives you subtle drift awareness, add your email below.
        </p>
        <div class={styles.earlyAccessForm}>
          <EmailCaptureForm />
        </div>
      </section>

      <footer class={styles.footer}>By Hoa Trinh. Built solo.</footer>
    </main>
  );
}
