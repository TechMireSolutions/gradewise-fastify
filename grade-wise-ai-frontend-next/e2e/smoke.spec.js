import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Gradewise AI/i);
});

test("login page loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText(/Sign in to your Gradewise AI account/i)).toBeVisible();
});
