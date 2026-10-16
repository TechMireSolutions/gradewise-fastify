import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Gradewise AI/i);
});

test("login page loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText(/Sign in to your Gradewise AI account/i)).toBeVisible();
});

test("signup page loads", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByText(/Create Account/i).first()).toBeVisible();
  await expect(page.locator('input[id="name"]')).toBeVisible();
});

test("forgot password page loads", async ({ page }) => {
  await page.goto("/forgot-password");
  await expect(page.getByRole("heading", { name: /Forgot Password/i })).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
});

test("verify email page loads with token prompt", async ({ page }) => {
  await page.goto("/verify-email");
  await expect(page.getByText(/Invalid verification link/i)).toBeVisible();
});

test("unauthenticated access to protected route redirects to login", async ({ page }) => {
  await page.goto("/instructor/dashboard");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(/Sign in to your Gradewise AI account/i)).toBeVisible();
});

test("theme toggle switches theme mode", async ({ page }) => {
  await page.goto("/");
  const toggleBtn = page.getByRole("button", { name: /Switch to (light|dark) mode/i }).first();
  await expect(toggleBtn).toBeVisible();
  const html = page.locator("html");
  const hadDark = (await html.getAttribute("class"))?.includes("dark") ?? false;
  await toggleBtn.click();
  const hasDarkNow = (await html.getAttribute("class"))?.includes("dark") ?? false;
  expect(hasDarkNow).toBe(!hadDark);
});
