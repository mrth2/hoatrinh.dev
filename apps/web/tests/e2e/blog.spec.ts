import { expect, test } from '@playwright/test';

test('/blog shows cadence + next by + first post row link', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByText(/cadence:/i)).toBeVisible();
  await expect(page.getByText(/next by:/i)).toBeVisible();
  const firstRow = page.locator('ul li').first();
  const firstRowLink = firstRow.getByRole('link');
  await expect(firstRowLink).toBeVisible();
  await expect(firstRowLink).toHaveAttribute('href', /\/post\/.+/);
});

test('clicking first row goes to its post and shows matching H1', async ({ page }) => {
  await page.goto('/blog');
  const firstRow = page.locator('ul li').first();
  const firstRowLink = firstRow.getByRole('link');
  const rowTitle = (await firstRowLink.textContent())?.trim();
  await expect(firstRowLink).toHaveAttribute('href', /\/post\/.+/);
  expect(rowTitle).toBeTruthy();
  const rowHref = await firstRowLink.getAttribute('href');
  await firstRowLink.click();
  await expect(page).toHaveURL(new RegExp(`${rowHref}$`));
  await expect(page.getByRole('heading', { level: 1, name: rowTitle ?? '' })).toBeVisible();
});

test('post page renders statically with js disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/blog');
  const firstRowLink = page.locator('ul li').first().getByRole('link');
  const rowHref = await firstRowLink.getAttribute('href');
  expect(rowHref).toBeTruthy();
  await page.goto(rowHref ?? '');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await context.close();
});

test('back link returns to /blog', async ({ page }) => {
  await page.goto('/blog');
  const firstRowLink = page.locator('ul li').first().getByRole('link');
  const rowHref = await firstRowLink.getAttribute('href');
  await page.goto(rowHref ?? '');
  const backLink = page.getByRole('link', { name: /back to \/blog/i });
  await expect(backLink).toHaveAttribute('href', '/blog');
  await backLink.click();
  await expect(page).toHaveURL(/\/blog$/);
});

test('serves /rss.xml with valid XML and at least one post slug', async ({ request }) => {
  const res = await request.get('/rss.xml');
  expect(res.status()).toBe(200);
  const ct = res.headers()['content-type'] ?? '';
  expect(ct).toMatch(/xml/);
  const body = await res.text();
  expect(body.startsWith('<?xml')).toBe(true);
  expect(body).toContain('<rss version="2.0"');
  expect(body).toMatch(/<link>https:\/\/hoatrinh\.dev\/post\/.+<\/link>/);
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
  expect(sitemapBody).toMatch(/https:\/\/hoatrinh\.dev\/post\/.+/);

  const llms = await request.get('/llms.txt');
  expect(llms.status()).toBe(200);
  const llmsBody = await llms.text();
  expect(llmsBody).toContain('Best content to fetch first:');
  expect(llmsBody).toContain('Prefer /blog and individual /post/ pages');
});

test('post HTML exposes article metadata and semantic article markup', async ({
  page,
  request,
}) => {
  await page.goto('/blog');
  const firstRowLink = page.locator('ul li').first().getByRole('link');
  const rowHref = await firstRowLink.getAttribute('href');
  expect(rowHref).toBeTruthy();

  const res = await request.get(rowHref ?? '');
  expect(res.status()).toBe(200);
  const body = await res.text();

  expect(body).toContain(`<link rel="canonical" href="https://hoatrinh.dev${rowHref}" />`);
  expect(body).toContain('<meta name="description"');
  expect(body).toContain('<meta property="og:type" content="article" />');
  expect(body).toContain('<meta property="article:published_time"');
  expect(body).toContain('"@type":"BlogPosting"');
  expect(body).toContain('<article');
  expect(body).toContain('<header>');
  expect(body).toContain('<footer');
  expect(body).toMatch(/<time datetime="\d{4}-\d{2}-\d{2}">/);
});
