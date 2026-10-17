import { createUniqueId, type JSX } from 'solid-js';
import styles from './OutputPanel.module.css';

export type OutputPanelVariant = 'plain' | 'frame' | 'titled';

export function OutputPanel(props: {
  input: string;
  variant: OutputPanelVariant;
  meta?: string;
  children: JSX.Element;
}) {
  const labelId = `panel-${createUniqueId()}-label`;
  const displayInput = () => (props.input === '' ? '(empty)' : props.input);

  return (
    <article class={styles.panel} data-variant={props.variant} aria-labelledby={labelId}>
      {/* Not a heading: it would precede each page's real h1 in the document outline. */}
      <span id={labelId} class="sr-only">
        Output of: {displayInput()}
      </span>

      {props.variant === 'titled' ? (
        <div class={styles.header}>
          <Echo input={props.input} />
          {props.meta !== undefined ? (
            <span class={styles.meta} data-meta>
              {props.meta}
            </span>
          ) : null}
        </div>
      ) : (
        <Echo input={props.input} />
      )}

      <div class={styles.body}>{props.children}</div>
    </article>
  );
}

function Echo(props: { input: string }) {
  return (
    <div class={styles.echo}>
      <span class={styles.echoSigil} aria-hidden="true">
        &gt;
      </span>
      <span class={styles.echoText}>{props.input}</span>
    </div>
  );
}
