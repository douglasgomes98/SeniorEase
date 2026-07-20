import { expect, test } from "@playwright/test";
import { openCleanApp, openDestination } from "./helpers";

test("persiste personalizacao e aplica o modo simples na home", async ({ page }) => {
  await openCleanApp(page);
  await openDestination(page, "personalization");
  await page.getByRole("button", { name: "Pular tour" }).click();
  await page.getByTestId("increase-font").click();
  await page.getByTestId("contrast-high").click();
  await page.getByTestId("spacing-1.5").click();
  await page.getByTestId("navigation-mode-simple").click();
  await page.getByTestId("app-header-back").click();
  await expect(page.getByTestId("destination-history")).toHaveCount(0);
  await page.getByTestId("destination-personalization").click();
  await page.reload();
  await expect(page.getByText("Tamanho da fonte: 115%", { exact: true })).toBeVisible();
  await expect(page.getByTestId("contrast-high")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("spacing-1.5")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("navigation-mode-simple")).toHaveAttribute("aria-checked", "true");
});
