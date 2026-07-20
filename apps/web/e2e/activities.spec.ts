import { expect, test } from "@playwright/test";
import { createActivity, openCleanApp, openDestination } from "./helpers";

test.beforeEach(async ({ page }) => openCleanApp(page));

test("cria atividade com passos", async ({ page }) => {
  await openDestination(page, "activities");
  await createActivity(page, "Pagar conta", ["Abrir banco", "Confirmar pagamento"]);
  await expect(page.getByText("Pagar conta", { exact: true })).toBeVisible();
  await expect(page.getByText("2 passos", { exact: true })).toBeVisible();
});

test("mantem atividade criada apos recarregar", async ({ page }) => {
  await openDestination(page, "activities");
  await createActivity(page, "Ligar para Maria");
  await page.reload();
  await openDestination(page, "activities");
  await expect(page.getByText("Ligar para Maria", { exact: true })).toBeVisible();
});

test("executa os passos e conclui atividade", async ({ page }) => {
  await openDestination(page, "activities");
  await createActivity(page, "Enviar documento", ["Separar", "Enviar"]);
  await page.getByRole("button", { name: "Iniciar Enviar documento" }).click();
  await expect(page.getByTestId("activity-runner")).toContainText("Separar");
  await page.getByTestId("activity-runner-next").click();
  await expect(page.getByTestId("activity-runner")).toContainText("Enviar");
  await page.getByTestId("activity-runner-next").click();
  await expect(page.getByText("Enviar documento", { exact: true })).toHaveCount(0);
});
