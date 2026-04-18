import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown-render';

describe('renderMarkdown', () => {
  it('renders paragraphs', async () => {
    const html = await renderMarkdown('Hello **world**.');
    expect(html).toContain('<p>');
    expect(html).toContain('<strong>world</strong>');
  });

  it('renders links', async () => {
    const html = await renderMarkdown('[site](https://example.com)');
    expect(html).toContain('<a href="https://example.com"');
  });

  it('does not pass through raw HTML', async () => {
    const html = await renderMarkdown('<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
  });
});
