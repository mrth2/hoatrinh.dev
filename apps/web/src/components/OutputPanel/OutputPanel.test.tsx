import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import { OutputPanel } from './OutputPanel';

describe('OutputPanel', () => {
  it('renders the input echo', () => {
    const { getByText } = render(() => (
      <OutputPanel input="about" variant="plain">
        <p>body</p>
      </OutputPanel>
    ));
    expect(getByText('about')).toBeInTheDocument();
  });

  it('renders children as body', () => {
    const { getByText } = render(() => (
      <OutputPanel input="about" variant="plain">
        <p>hello body</p>
      </OutputPanel>
    ));
    expect(getByText('hello body')).toBeInTheDocument();
  });

  it('applies plain variant data attribute', () => {
    const { container } = render(() => (
      <OutputPanel input="help" variant="plain">
        <p>body</p>
      </OutputPanel>
    ));
    expect(container.querySelector('[data-variant="plain"]')).not.toBeNull();
  });

  it('applies frame variant data attribute', () => {
    const { container } = render(() => (
      <OutputPanel input="skills" variant="frame">
        <p>body</p>
      </OutputPanel>
    ));
    expect(container.querySelector('[data-variant="frame"]')).not.toBeNull();
  });

  it('applies titled variant data attribute', () => {
    const { container } = render(() => (
      <OutputPanel input="projects" variant="titled" meta="3 projects">
        <p>body</p>
      </OutputPanel>
    ));
    expect(container.querySelector('[data-variant="titled"]')).not.toBeNull();
  });

  it('renders meta only when provided (titled)', () => {
    const { queryByText } = render(() => (
      <OutputPanel input="projects" variant="titled" meta="3 projects">
        <p>body</p>
      </OutputPanel>
    ));
    expect(queryByText('3 projects')).not.toBeNull();
  });

  it('omits meta element when not provided (titled)', () => {
    const { container } = render(() => (
      <OutputPanel input="profile" variant="titled">
        <p>body</p>
      </OutputPanel>
    ));
    expect(container.querySelector('[data-meta]')).toBeNull();
  });

  it('exposes an sr-only label derived from input', () => {
    const { getByText } = render(() => (
      <OutputPanel input="about" variant="plain">
        <p>body</p>
      </OutputPanel>
    ));
    const label = getByText(/Output of: about/i);
    expect(label).toBeInTheDocument();
  });

  it('uses "(empty)" in the sr-only label when input is blank', () => {
    const { getByText } = render(() => (
      <OutputPanel input="" variant="plain">
        <p>body</p>
      </OutputPanel>
    ));
    expect(getByText(/Output of: \(empty\)/i)).toBeInTheDocument();
  });
});
