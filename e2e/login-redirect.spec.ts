import { expect, test } from '@playwright/test';

test('redirects protected pages to login', async ({ page }) => {
    await page.goto('/support');
    await expect(page.getByText(/redirecting to login/i)).toBeVisible();
});
