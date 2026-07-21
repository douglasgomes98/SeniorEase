import { expect, test } from "@playwright/test";
import { openCleanApp, openDestination } from "./helpers";

test("atualiza nome, idioma e preferencias de notificacao", async ({ page }) => {
  await openCleanApp(page);
  await openDestination(page, "profile");
  await page.getByTestId("profile-name").fill("Ana");
  await expect(page.getByText("Ola, Ana! Que bom te ver por aqui.")).toBeVisible();
  await page.getByTestId("profile-notifications-enabled").click();
  await page.getByTestId("profile-lead-time-60").click();
  await page.getByTestId("profile-channel-os").click();
  await page.getByTestId("profile-language-en").click();
  await expect(
    page.getByTestId("profile-screen").getByRole("heading", { name: "Profile" }),
  ).toBeVisible();
  await expect(page.getByTestId("profile-language-en")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("profile-lead-time-60")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("profile-channel-os")).toHaveAttribute("aria-checked", "true");
});

test("encerra o tour, o mantem encerrado e o reinicia", async ({ page }) => {
  await openCleanApp(page);
  await openDestination(page, "personalization");
  await expect(page.getByText("Bem-vindo", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Pular tour" }).click();
  await page.reload();
  await expect(page.getByText("Bem-vindo", { exact: true })).toHaveCount(0);
  await openDestination(page, "personalization");
  await page.getByTestId("restart-tour").click();
  await expect(page.getByText("Bem-vindo", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Pular tour" }).click();
});
