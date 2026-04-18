import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@solidjs/testing-library';
import { Motd } from './Motd';

describe('Motd', () => {
  it('renders the name line', () => {
    const { getByText } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByText(/hoa trinh hai/i)).toBeInTheDocument();
  });

  it('renders the role and location line', () => {
    const { getByText } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByText(/senior software engineer/i)).toBeInTheDocument();
  });

  it('renders help and about as buttons', () => {
    const { getByRole } = render(() => <Motd onSuggestion={() => {}} />);
    expect(getByRole('button', { name: 'help' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'about' })).toBeInTheDocument();
  });

  it('calls onSuggestion with "help" when the help button is clicked', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <Motd onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: 'help' }));
    expect(onSuggestion).toHaveBeenCalledWith('help');
  });

  it('calls onSuggestion with "about" when the about button is clicked', () => {
    const onSuggestion = vi.fn();
    const { getByRole } = render(() => <Motd onSuggestion={onSuggestion} />);
    fireEvent.click(getByRole('button', { name: 'about' }));
    expect(onSuggestion).toHaveBeenCalledWith('about');
  });
});
