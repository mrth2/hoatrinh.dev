import { expect, test } from '@playwright/test';

test('cold load shows motd and focuses prompt', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/hoa trinh hai/i)).toBeVisible();
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
  await page.goto('/about');
  const input = page.locator('#terminal-input');
  await input.fill('clear');
  await input.press('Enter');
  await expect(page.locator('[data-variant]')).toHaveCount(0);
});

test('boot sequence renders on fresh tab, compact on reload', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  // boot lines visible (one of them)
  await expect(page.getByText(/initializing session/i)).toBeVisible();

  // reload within same tab/context -> compact (no initializing line)
  await page.reload();
  await expect(page.getByText(/initializing session/i)).toHaveCount(0);

  // But the hero is still there
  await expect(page.getByText(/hoa trinh hai/i)).toBeVisible();
  await context.close();
});

test('boot sequence is skippable by keypress', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  await page.keyboard.press('Escape');
  // After skipping, the ready line appears
  await expect(page.getByText(/ready/i)).toBeVisible({ timeout: 2000 });
  await context.close();
});
