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

  it('shows the inline hint when input is empty and focused', () => {
    const { getByLabelText, queryByText } = render(() => (
      <Prompt value="" onInput={() => {}} onSubmit={() => {}} onHistory={() => null} onTab={() => null} />
    ));
    const input = getByLabelText(/terminal prompt/i) as HTMLInputElement;
    fireEvent.focus(input);
    expect(queryByText(/run · .*history · .*complete/i)).not.toBeNull();
  });

  it('hides the inline hint while typing', () => {
    const { getByLabelText, queryByText } = render(() => (
      <Prompt value="a" onInput={() => {}} onSubmit={() => {}} onHistory={() => null} onTab={() => null} />
    ));
    const input = getByLabelText(/terminal prompt/i) as HTMLInputElement;
    fireEvent.focus(input);
    expect(queryByText(/run · .*history · .*complete/i)).toBeNull();
  });

  it('hides the inline hint when input is empty but not focused', () => {
    const { queryByText } = render(() => (
      <Prompt value="" onInput={() => {}} onSubmit={() => {}} onHistory={() => null} onTab={() => null} />
    ));
    expect(queryByText(/run · .*history · .*complete/i)).toBeNull();
  });
});
