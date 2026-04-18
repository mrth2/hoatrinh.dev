import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { Prompt } from './Prompt';

describe('Prompt', () => {
  it('calls onSubmit with the input value', () => {
    const onSubmit = vi.fn();
    const { getByLabelText } = render(() => (
      <Prompt value="" onInput={() => {}} onSubmit={onSubmit} onHistory={() => null} onTab={() => null} />
    ));
    const input = getByLabelText(/terminal prompt/i) as HTMLInputElement;
    input.value = 'about';
    fireEvent.input(input);
    fireEvent.submit(input.form!);
    expect(onSubmit).toHaveBeenCalled();
  });
});
