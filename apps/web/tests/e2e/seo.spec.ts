import { expect, test } from '@playwright/test';

test('prerendered page head carries the full social card metadata', async ({ page }) => {
  const response = await page.goto('/experience');
  expect(response?.status()).toBe(200);

  const ogImage = page.locator('meta[property="og:image"]');
  await expect(ogImage).toHaveAttribute('content', /\/og\/experience\.png$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    'content',
    'hoatrinh.dev',
  );

  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description?.length ?? 0).toBeGreaterThan(60);
});

test('og card images are served and are real PNGs', async ({ request }) => {
  for (const path of ['/og/index.png', '/og/experience.png']) {
    const response = await request.get(path);
    expect(response.status(), `${path} should be served`).toBe(200);
    const body = await response.body();
    // PNG magic number.
    expect(body.subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  }
});

test('help is marked noindex and stays out of the sitemap', async ({ page, request }) => {
  await page.goto('/help');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');

  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/help');
  expect(sitemap).toContain('/experience');
});

test('blog post exposes BlogPosting structured data with an author', async ({ page }) => {
  await page.goto('/post/the-editor-i-cant-quit');

  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const parsed = blocks.map((block) => JSON.parse(block));
  const posting = parsed.find((node) => node['@type'] === 'BlogPosting');

  expect(posting).toBeTruthy();
  expect(posting.author.name).toBeTruthy();
  expect(posting.image).toMatch(/\/og\/post\/the-editor-i-cant-quit\.png$/);

  const breadcrumb = parsed.find((node) => node['@type'] === 'BreadcrumbList');
  expect(breadcrumb.itemListElement).toHaveLength(3);
});
