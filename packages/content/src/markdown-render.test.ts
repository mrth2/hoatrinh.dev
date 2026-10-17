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

  it('lazy-loads every image after the first', async () => {
    const html = await renderMarkdown('![one](/a.png)\n\n![two "x"](/b.png "Two")');
    const [first, second] = html.match(/<img [^>]*>/g) ?? [];
    expect(first).toBe('<img src="/a.png" alt="one" decoding="async">');
    expect(second).toBe(
      '<img src="/b.png" alt="two &quot;x&quot;" title="Two" decoding="async" loading="lazy">',
    );
  });

  it('resets the first-image allowance per document', async () => {
    await renderMarkdown('![a](/a.png)');
    const html = await renderMarkdown('![b](/b.png)');
    expect(html).not.toContain('loading="lazy"');
  });

  it('does not pass through raw HTML', async () => {
    const html = await renderMarkdown('<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
  });
});
