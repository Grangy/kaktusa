import { test, expect } from "@playwright/test";

test.describe("Admin", () => {
  test("unauthenticated redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login page has form", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByLabel(/пароль/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /войти/i })).toBeVisible();
  });

  test("wrong password shows error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/пароль/i).fill("wrong");
    await page.getByRole("button", { name: /войти/i }).click();
    await expect(page.getByText(/неверный пароль/i)).toBeVisible({ timeout: 5000 });
  });

  test("correct password enters admin and navigates", async ({ page }) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    test.skip(!adminPassword, "ADMIN_PASSWORD not set");

    await page.goto("/admin/login");
    await page.getByLabel(/пароль/i).fill(adminPassword);
    await page.getByRole("button", { name: /войти/i }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("link", { name: /мероприятия/i })).toBeVisible();

    await page.getByRole("link", { name: /мероприятия/i }).click();
    await expect(page).toHaveURL(/\/admin\/events/);

    await page.getByRole("link", { name: /главная страница/i }).first().click();
    await expect(page).toHaveURL(/\/admin\/main/);

    await page.getByRole("link", { name: /метатеги/i }).click();
    await expect(page).toHaveURL(/\/admin\/meta/);

    await page.getByRole("link", { name: /главная/i }).first().click();
    await expect(page).toHaveURL(/\/admin$/);
  });
});
