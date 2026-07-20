import { expect, test } from "@playwright/test";

test("abre a pagina inicial", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("home-hub")).toBeVisible();
});
