import { expect, test } from '@playwright/test';

const firstPostSlug = 'the-small-habits-i-keep-on-rails';
const firstPostPath = `/post/${firstPostSlug}`;
const firstPostTitle = 'The small habits I keep on rails';

test('/blog shows cadence + next by + first post row link', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.getByText('cadence:', { exact: true })).toBeVisible();
  await expect(page.getByText('next by:', { exact: true })).toBeVisible();
  await expect(page.locator(`a[href="${firstPostPath}"]`).first()).toBeVisible();
});

test('clicking row goes to /post/the-small-habits-i-keep-on-rails and shows H1', async ({
  page,
}) => {
  await page.goto('/blog');
  await page.locator(`a[href="${firstPostPath}"]`).first().click();
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
  await page.getByRole('link', { name: '← back to /blog' }).click();
  await expect(page).toHaveURL(/\/blog$/);
});
