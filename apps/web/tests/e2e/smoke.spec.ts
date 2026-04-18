import { expect, test } from '@playwright/test';

test('cold load runs about', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#terminal-input')).toBeFocused();
});

test('projects command updates URL', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#terminal-input');
  await input.fill('projects');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/projects$/);
});

test('deep link renders statically (js disabled)', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/project/keepgoing');
  await expect(page.getByRole('heading', { level: 1, name: 'KeepGoing' })).toBeVisible();
  await context.close();
});

test('unknown command shows error with suggestion', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#terminal-input');
  await input.fill('abot');
  await input.press('Enter');
  await expect(page.getByRole('button', { name: 'about' })).toBeVisible();
});

test('up arrow recalls previous command', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#terminal-input');
  await input.fill('projects');
  await input.press('Enter');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('projects');
});

test('clear empties the entry list', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#terminal-input');
  await input.fill('clear');
  await input.press('Enter');
  await expect(page.locator('[data-kind]')).toHaveCount(0);
});
