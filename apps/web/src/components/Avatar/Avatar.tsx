import { createMemo, createSignal, For, onCleanup, Show } from 'solid-js';
import styles from './Avatar.module.css';
import { FRAME_IDLE, type FrameSegment, LOOKAROUND_FRAME_MS, LOOKAROUND_SEQUENCE } from './avatar-frames';
import { useArtFit } from './useArtFit';

export function Avatar() {
  const reducedMotionMql =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;

  const [container, setContainer] = createSignal<HTMLDivElement | undefined>();
  const [frame, setFrame] = createSignal<FrameSegment[]>(FRAME_IDLE);
  const [playing, setPlaying] = createSignal(false);
  const fit = useArtFit({ container });

  let timer: ReturnType<typeof setTimeout> | undefined;
  const clearTimer = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
  };

  function playLookAround(times = 1) {
    if (playing()) return;
    if (reducedMotionMql?.matches) return;
    if (fit().hidden) return;
    setPlaying(true);
    const seq: FrameSegment[][] = [];
    for (let t = 0; t < times; t++) seq.push(...LOOKAROUND_SEQUENCE);
    let i = 0;
    const tick = () => {
      const next = seq[i];
      if (next === undefined) {
        setFrame(FRAME_IDLE);
        setPlaying(false);
        timer = undefined;
        return;
      }
      setFrame(next);
      i++;
      if (i >= seq.length) {
        setPlaying(false);
        timer = undefined;
      } else {
        timer = setTimeout(tick, LOOKAROUND_FRAME_MS);
      }
    };
    timer = setTimeout(tick, LOOKAROUND_FRAME_MS);
  }

  onCleanup(() => clearTimer());

  const fontSizeStyle = createMemo(() => {
    const f = fit();
    return f.fontSize ? { '--art-font-size': `${f.fontSize}px` } : {};
  });

  return (
    <Show when={!fit().hidden}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative avatar; no keyboard affordance needed */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: decorative; no keyboard affordance required */}
      <div
        class={styles.artSlot}
        ref={setContainer}
        data-testid="avatar"
        onClick={() => playLookAround()}
        onMouseEnter={() => playLookAround()}
        style={fontSizeStyle()}
      >
        <span class="sr-only">Avatar of Hoa</span>
        <pre class={styles.art} aria-hidden="true">
          <For each={frame()}>
            {(seg) => (
              <Show when={seg.kind === 'glow'} fallback={<span>{seg.text}</span>}>
                <span class={styles.glow}>{seg.text}</span>
              </Show>
            )}
          </For>
        </pre>
      </div>
    </Show>
  );
}
