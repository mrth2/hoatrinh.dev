import { createMemo, createSignal, For, Show } from 'solid-js';
import styles from './Avatar.module.css';
import { FRAME_IDLE } from './avatar-frames';
import { useArtFit } from './useArtFit';

export function Avatar() {
  const [container, setContainer] = createSignal<HTMLDivElement | undefined>();
  const fit = useArtFit({ container });

  const fontSizeStyle = createMemo(() => {
    const f = fit();
    return f.fontSize ? { '--art-font-size': `${f.fontSize}px` } : {};
  });

  return (
    <Show when={!fit().hidden}>
      <div
        class={styles.artSlot}
        ref={setContainer}
        data-testid="avatar"
        style={fontSizeStyle()}
      >
        <span class="sr-only">Avatar of Hoa</span>
        <pre class={styles.art} aria-hidden="true">
          <For each={FRAME_IDLE}>
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
