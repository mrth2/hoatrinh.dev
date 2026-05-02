import { expect, test } from '@playwright/test';

const firstPostSlug = 'ai-made-learning-fun-again';
const firstPostPath = `/post/${firstPostSlug}`;
const firstPostTitle = 'AI made learning fun again';
const firstPostDate = '2026-05-01';
const firstPostDescription =
  'I did not get smarter overnight. AI just removed enough friction that I stopped quitting so early.';

test('/blog shows cadence + next by + first post row link', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByText(/cadence:/i)).toBeVisible();
  await expect(page.getByText(/next by:/i)).toBeVisible();
  const firstRow = page.locator('ul li').first();
  const firstRowLink = firstRow.getByRole('link', { name: /AI made learning fun again/i });
  await expect(firstRowLink).toBeVisible();
  await expect(firstRowLink).toHaveAttribute('href', firstPostPath);
});

test('clicking row goes to /post/ai-made-learning-fun-again and shows H1', async ({ page }) => {
  await page.goto('/blog');
  const firstRow = page.locator('ul li').first();
  const firstRowLink = firstRow.getByRole('link', { name: /AI made learning fun again/i });
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
  expect(body).toContain('ai-made-learning-fun-again');
});

test('serves root AI discovery files with blog-first guidance', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  const robotsBody = await robots.text();
  expect(robotsBody).toContain('Sitemap: https://hoatrinh.dev/sitemap.xml');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).toContain('https://hoatrinh.dev/blog');
  expect(sitemapBody).toContain(`https://hoatrinh.dev${firstPostPath}`);
  expect(sitemapBody).toContain(`<lastmod>${firstPostDate}</lastmod>`);

  const llms = await request.get('/llms.txt');
  expect(llms.status()).toBe(200);
  const llmsBody = await llms.text();
  expect(llmsBody).toContain('Best content to fetch first:');
  expect(llmsBody).toContain('Prefer /blog and individual /post/ pages');
});

test('post HTML exposes article metadata and semantic article markup', async ({ request }) => {
  const res = await request.get(firstPostPath);
  expect(res.status()).toBe(200);
  const body = await res.text();

  expect(body).toContain(`<link rel="canonical" href="https://hoatrinh.dev${firstPostPath}" />`);
  expect(body).toContain(`<meta name="description" content="${firstPostDescription}" />`);
  expect(body).toContain('<meta property="og:type" content="article" />');
  expect(body).toContain(`<meta property="article:published_time" content="${firstPostDate}" />`);
  expect(body).toContain('"@type":"BlogPosting"');
  expect(body).toContain('<article');
  expect(body).toContain('<header>');
  expect(body).toContain('<footer');
  expect(body).toContain(`<time datetime="${firstPostDate}">${firstPostDate}</time>`);
});
