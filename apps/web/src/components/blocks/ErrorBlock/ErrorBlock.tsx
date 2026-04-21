import { For, Show } from 'solid-js';
import styles from './ErrorBlock.module.css';

export function ErrorBlock(props: {
  message: string;
  suggestions: string[];
  contactLink?: { label: string; href: string };
  onSuggestion?: ((s: string) => void) | undefined;
}) {
  return (
    <div class={styles.root}>
      <p class={styles.message}>
        <span aria-hidden="true">×</span> {props.message}
      </p>
      <Show when={props.contactLink}>
        {(link) => (
          <p class={styles.contactLine}>
            Feel free to{' '}
            <a class={styles.link} href={link().href}>
              {link().label}
            </a>
            .
          </p>
        )}
      </Show>
      {props.suggestions.length > 0 && (
        <p class={styles.suggestLine}>
          Try:{' '}
          <For each={props.suggestions}>
            {(s, i) => (
              <>
                {i() > 0 && ', '}
                <button class={styles.chip} type="button" onClick={() => props.onSuggestion?.(s)}>
                  {s}
                </button>
              </>
            )}
          </For>
        </p>
      )}
    </div>
  );
}
