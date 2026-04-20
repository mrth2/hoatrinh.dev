import { fireEvent, render } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import { Prompt } from './Prompt';

describe('Prompt', () => {
  it('calls onSubmit with the input value', () => {
    const onSubmit = vi.fn();
    const { getByLabelText } = render(() => (
      <Prompt
        value=""
        onInput={() => {}}
        onSubmit={onSubmit}
        onHistory={() => null}
        onTab={() => null}
      />
    ));
    const input = getByLabelText(/terminal prompt/i) as HTMLInputElement;
    input.value = 'about';
    fireEvent.input(input);
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalled();
  });

  it('shows the inline hint when input is empty and focused', () => {
    const { getByLabelText, queryByText } = render(() => (
      <Prompt
        value=""
        onInput={() => {}}
        onSubmit={() => {}}
        onHistory={() => null}
        onTab={() => null}
      />
    ));
    const input = getByLabelText(/terminal prompt/i) as HTMLInputElement;
    fireEvent.focus(input);
    expect(queryByText(/run · .*history · .*complete/i)).not.toBeNull();
  });

  it('hides the inline hint while typing', () => {
    const { getByLabelText, queryByText } = render(() => (
      <Prompt
        value="a"
        onInput={() => {}}
        onSubmit={() => {}}
        onHistory={() => null}
        onTab={() => null}
      />
    ));
    const input = getByLabelText(/terminal prompt/i) as HTMLInputElement;
    fireEvent.focus(input);
    expect(queryByText(/run · .*history · .*complete/i)).toBeNull();
  });

  it('hides the inline hint when input is empty but not focused', () => {
    const { queryByText } = render(() => (
      <Prompt
        value=""
        onInput={() => {}}
        onSubmit={() => {}}
        onHistory={() => null}
        onTab={() => null}
      />
    ));
    expect(queryByText(/run · .*history · .*complete/i)).toBeNull();
  });

  it('applies data-errored when the errored prop is true', () => {
    const { container } = render(() => (
      <Prompt
        value=""
        errored={true}
        onInput={() => {}}
        onSubmit={() => {}}
        onHistory={() => null}
        onTab={() => null}
      />
    ));
    expect(container.querySelector('[data-errored="true"]')).not.toBeNull();
  });

  it('omits data-errored when the errored prop is false or absent', () => {
    const { container } = render(() => (
      <Prompt
        value=""
        onInput={() => {}}
        onSubmit={() => {}}
        onHistory={() => null}
        onTab={() => null}
      />
    ));
    const prompt = container.querySelector('[data-testid="prompt-shell"]');
    expect(prompt?.getAttribute('data-errored')).not.toBe('true');
  });

  it('renders ghost suffix when ghost prop is longer than value', () => {
    const { container } = render(() => (
      <Prompt
        value="ab"
        ghost="about"
        onInput={() => {}}
        onSubmit={() => {}}
        onHistory={() => null}
        onTab={() => null}
      />
    ));
    const suffix =
      container.querySelector('[aria-hidden="true"] + [aria-hidden="true"] span:last-child') ??
      container.querySelector('[aria-hidden="true"] span:last-child');
    expect(suffix?.textContent).toBe('out');
  });

  it('does not render ghost when ghost equals value', () => {
    const { container } = render(() => (
      <Prompt
        value="about"
        ghost="about"
        onInput={() => {}}
        onSubmit={() => {}}
        onHistory={() => null}
        onTab={() => null}
      />
    ));
    const ghosts = container.querySelectorAll('[class*="ghost"]');
    expect(ghosts.length).toBe(0);
  });

  it('accepts ghost on ArrowRight when cursor is at end', () => {
    const onInput = vi.fn();
    const { getByLabelText } = render(() => (
      <Prompt
        value="ab"
        ghost="about"
        onInput={onInput}
        onSubmit={() => {}}
        onHistory={() => null}
        onTab={() => null}
      />
    ));
    const input = getByLabelText(/terminal prompt/i) as HTMLInputElement;
    Object.defineProperty(input, 'selectionStart', { value: 2, configurable: true });
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(onInput).toHaveBeenCalledWith('about');
  });

  it('does not accept ghost on ArrowRight when cursor is not at end', () => {
    const onInput = vi.fn();
    const { getByLabelText } = render(() => (
      <Prompt
        value="ab"
        ghost="about"
        onInput={onInput}
        onSubmit={() => {}}
        onHistory={() => null}
        onTab={() => null}
      />
    ));
    const input = getByLabelText(/terminal prompt/i) as HTMLInputElement;
    Object.defineProperty(input, 'selectionStart', { value: 1, configurable: true });
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(onInput).not.toHaveBeenCalled();
  });
});
