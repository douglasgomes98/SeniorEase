import { expect, type Page } from "@playwright/test";

export async function openCleanApp(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("seniorease.v1"));
  await page.reload();
  await expect(page.getByTestId("home-hub")).toBeVisible();
}

export async function openDestination(page: Page, route: string): Promise<void> {
  await page.getByTestId(`destination-${route}`).click();
}

export async function createActivity(
  page: Page,
  title: string,
  steps: string[] = [],
): Promise<void> {
  await page.getByTestId("activity-add-open").click();
  await page.getByTestId("activity-title").fill(title);
  for (const [index, step] of steps.entries()) {
    await page.getByTestId("activity-step-add").click();
    await page.getByTestId(`activity-step-${index}`).fill(step);
  }
  await page.getByTestId("activity-save").click();
}
