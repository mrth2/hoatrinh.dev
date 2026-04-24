import { createSignal, Show } from 'solid-js';

import styles from './EmailCaptureForm.module.css';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const DEPOSIT_LINK = 'https://buy.stripe.com/replace-with-recto-deposit-link';

export function EmailCaptureForm() {
  const [email, setEmail] = createSignal('');
  const [state, setState] = createSignal<SubmitState>('idle');
  const [message, setMessage] = createSignal('');

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setState('submitting');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email: email().trim() }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setState('error');
        setMessage(payload.message ?? 'Unable to sign up right now.');
        return;
      }

      setState('success');
      setMessage(payload.message ?? 'You are on the list.');
      setEmail('');
    } catch (error) {
      const fallback = 'Unable to sign up right now.';
      setState('error');
      setMessage(error instanceof Error ? error.message : fallback);
    }
  };

  return (
    <form class={styles.form} onSubmit={onSubmit}>
      <label class={styles.label} for="email">
        I want this on my Mac.
      </label>
      <p class={styles.helper}>
        Leave your email for first access, concept updates, and the first working demo.
      </p>
      <div class={styles.row}>
        <input
          class={styles.input}
          id="email"
          type="email"
          autocomplete="email"
          placeholder="your@email.com"
          value={email()}
          onInput={(event) => setEmail(event.currentTarget.value)}
          required
        />
        <button class={styles.button} type="submit" disabled={state() === 'submitting'}>
          {state() === 'submitting' ? 'Submitting...' : 'Get early access'}
        </button>
      </div>

      <Show when={message() !== ''}>
        <p class={state() === 'error' ? styles.error : styles.confirmation}>{message()}</p>
      </Show>

      <p class={styles.deposit}>
        Optional: leave a{' '}
        <a href={DEPOSIT_LINK} target="_blank" rel="noreferrer">
          refundable $5 deposit
        </a>
        .
      </p>
    </form>
  );
}
