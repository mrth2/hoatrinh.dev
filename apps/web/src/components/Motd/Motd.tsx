import { pickBootSet, pickCompact } from '@hoatrinh/content';
import { createSignal, onCleanup, onMount, Show } from 'solid-js';
import { Avatar } from '@/components/Avatar/Avatar';
import { CommandIndex } from '@/components/CommandIndex/CommandIndex';
import buildData from '@/generated/motd-build.json';
import { hasBooted, markBooted, shouldAnimateBoot } from '@/lib/motd/boot-state';
import { streamChars } from '@/lib/motd/char-streamer';
import styles from './Motd.module.css';

function relativeToSentence(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function uaHashShort(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'node';
  let h = 0;
  for (let i = 0; i < ua.length; i++) h = ((h << 5) - h + ua.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).slice(0, 6);
}

// SSR renders compact. On mount, if this is a fresh tab, upgrade to boot.
type MotdMode = 'compact' | 'boot-static' | 'boot-animated';

export function Motd(props: { onSuggestion: (cmd: string) => void }) {
  const bootSet = pickBootSet(Date.now(), buildData);
  const compactLine = pickCompact(Date.now(), buildData);
  // SSR always starts in compact (sessionStorage unavailable = hasBooted() -> true)
  const [mode, setMode] = createSignal<MotdMode>('compact');

  onMount(() => {
    // After hydration, decide whether to switch to boot
    if (!hasBooted()) {
      if (shouldAnimateBoot()) {
        setMode('boot-animated');
      } else {
        markBooted();
        setMode('boot-static');
      }
    }
  });

  return (
    <Show
      when={mode() === 'compact'}
      fallback={
        <Show
          when={mode() === 'boot-static'}
          fallback={
            <BootAnimated
              bootSet={bootSet}
              relative={relativeToSentence(buildData.buildTimeIso)}
              uaHash={uaHashShort()}
              compactLine={compactLine}
              onSuggestion={props.onSuggestion}
            />
          }
        >
          <BootStatic
            bootSet={bootSet}
            relative={relativeToSentence(buildData.buildTimeIso)}
            uaHash={uaHashShort()}
            compactLine={compactLine}
            onSuggestion={props.onSuggestion}
          />
        </Show>
      }
    >
      <CompactMotd compactLine={compactLine} onSuggestion={props.onSuggestion} />
    </Show>
  );
}

// -------------------- Compact --------------------

function CompactMotd(props: { compactLine: string; onSuggestion: (cmd: string) => void }) {
  return (
    <section class={styles.motd} aria-label="Welcome message" data-motd-compact>
      <p class={styles.name}>hoa trinh hai</p>
      <p class={styles.role}>senior software engineer · vietnam</p>
      <div class={styles.motdSpacer}>
        <Avatar />
      </div>
      <CommandIndex onSuggestion={props.onSuggestion} />
      <p class={styles.compactLine}>
        <span class={styles.dot} aria-hidden="true">
          ●
        </span>
        <span class={styles.ready}>ready</span>
        <span class={styles.subline}>{props.compactLine}</span>
      </p>
    </section>
  );
}

// -------------------- Boot (static, reduced-motion) --------------------

function BootStatic(props: {
  bootSet: ReturnType<typeof pickBootSet>;
  relative: string;
  uaHash: string;
  compactLine: string;
  onSuggestion: (cmd: string) => void;
}) {
  return (
    <section class={styles.motd} aria-label="Welcome message" data-motd-boot>
      <p class={styles.bootLine}>initializing session...</p>
      <p class={styles.bootLine}>{props.bootSet.greeting}</p>
      <p class={styles.bootLine}>
        last login: {props.relative} from {props.uaHash}
      </p>
      <p class={styles.bootLine}>{props.bootSet.tip}</p>
      <p class={styles.name}>hoa trinh hai</p>
      <p class={styles.role}>senior software engineer · vietnam</p>
      <div class={styles.motdSpacer}>
        <Avatar />
      </div>
      <CommandIndex onSuggestion={props.onSuggestion} />
      <p class={styles.compactLine}>
        <span class={styles.dot} aria-hidden="true">
          ●
        </span>
        <span class={styles.ready}>ready</span>
        <span class={styles.subline}>{props.compactLine}</span>
      </p>
    </section>
  );
}

// -------------------- Boot (animated) --------------------

function BootAnimated(props: {
  bootSet: ReturnType<typeof pickBootSet>;
  relative: string;
  uaHash: string;
  compactLine: string;
  onSuggestion: (cmd: string) => void;
}) {
  const lines = [
    'initializing session...',
    props.bootSet.greeting,
    `last login: ${props.relative} from ${props.uaHash}`,
    props.bootSet.tip,
  ];
  const [rendered, setRendered] = createSignal<string[]>(['']);
  const [done, setDone] = createSignal(false);
  const ctrl = new AbortController();
  let maxBootTimer: number | undefined;

  async function run() {
    for (let i = 0; i < lines.length; i++) {
      setRendered((prev) =>
        prev.map((l, idx) => (idx === i ? '' : l)).concat(i === prev.length - 1 ? [] : []),
      );
      await streamChars(lines[i] as string, {
        perCharMin: 10,
        perCharMax: 30,
        onChar: (c) =>
          setRendered((prev) => {
            const copy = [...prev];
            copy[i] = (copy[i] ?? '') + c;
            return copy;
          }),
        signal: ctrl.signal,
      });
      if (ctrl.signal.aborted) break;
      // push a new empty slot for the next line (except on the last)
      if (i < lines.length - 1) setRendered((prev) => [...prev, '']);
    }
    markBooted();
    setDone(true);
  }

  function skip() {
    if (done()) return;
    ctrl.abort();
    setRendered(lines as string[]);
    markBooted();
    setDone(true);
  }

  onMount(() => {
    maxBootTimer = window.setTimeout(skip, 1_500);
    window.addEventListener('keydown', skip, { once: true });
    void run();
  });
  onCleanup(() => {
    if (maxBootTimer !== undefined) window.clearTimeout(maxBootTimer);
    ctrl.abort();
    window.removeEventListener('keydown', skip);
  });

  return (
    <section class={styles.motd} aria-label="Welcome message" data-motd-boot>
      {rendered().map((line) => (
        <p class={styles.bootLine}>
          {line}
          <Show when={!done() && line === rendered()[rendered().length - 1]}>
            <span class={styles.caret} aria-hidden="true">
              █
            </span>
          </Show>
        </p>
      ))}
      <Show when={done()}>
        <p class={styles.name}>hoa trinh hai</p>
        <p class={styles.role}>senior software engineer · vietnam</p>
        <div class={styles.motdSpacer}>
          <Avatar />
        </div>
        <CommandIndex onSuggestion={props.onSuggestion} />
        <p class={styles.compactLine}>
          <span class={styles.dot} aria-hidden="true">
            ●
          </span>
          <span class={styles.ready}>ready</span>
          <span class={styles.subline}>{props.compactLine}</span>
        </p>
      </Show>
    </section>
  );
}
