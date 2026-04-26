import { expect, test } from '@playwright/test';

const firstPostSlug = 'the-small-habits-i-keep-on-rails';
const firstPostPath = `/post/${firstPostSlug}`;
const firstPostTitle = 'The small habits I keep on rails';

test('/blog shows cadence + next by + first post row link', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByText(/cadence:/i)).toBeVisible();
  await expect(page.getByText(/next by:/i)).toBeVisible();
  const firstRow = page.locator('ul li').first();
  const firstRowLink = firstRow.getByRole('link', { name: /The small habits I keep on rails/i });
  await expect(firstRowLink).toBeVisible();
  await expect(firstRowLink).toHaveAttribute('href', firstPostPath);
});

test('clicking row goes to /post/the-small-habits-i-keep-on-rails and shows H1', async ({
  page,
}) => {
  await page.goto('/blog');
  const firstRow = page.locator('ul li').first();
  const firstRowLink = firstRow.getByRole('link', { name: /The small habits I keep on rails/i });
  await expect(firstRowLink).toHaveAttribute('href', firstPostPath);
  await firstRowLink.click();
  await expect(page).toHaveURL(new RegExp(`${firstPostPath}$`));
  await expect(page.getByRole('heading', { level: 1, name: firstPostTitle })).toBeVisible();
});

test('post page renders statically with js disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(firstPostPath);
  await expect(page.getByRole('heading', { level: 1, name: firstPostTitle })).toBeVisible();
  await context.close();
});

test('back link returns to /blog', async ({ page }) => {
  await page.goto(firstPostPath);
  const backLink = page.getByRole('link', { name: /back to \/blog/i });
  await expect(backLink).toHaveAttribute('href', '/blog');
  await backLink.click();
  await expect(page).toHaveURL(/\/blog$/);
});

test('serves /rss.xml with the latest post slug', async ({ request }) => {
  const res = await request.get('/rss.xml');
  expect(res.status()).toBe(200);
  const ct = res.headers()['content-type'] ?? '';
  expect(ct).toMatch(/xml/);
  const body = await res.text();
  expect(body.startsWith('<?xml')).toBe(true);
  expect(body).toContain('<rss version="2.0"');
  expect(body).toContain('the-small-habits-i-keep-on-rails');
});
