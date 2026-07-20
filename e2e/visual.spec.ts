import { expect, test } from "@playwright/test";

const screens = [
  { name: "home", screenId: "home-hub" },
  {
    name: "activities",
    destinationId: "destination-activities",
    screenId: "activities-screen",
  },
  {
    name: "personalization",
    destinationId: "destination-personalization",
    screenId: "personalization-screen",
  },
  {
    name: "profile",
    destinationId: "destination-profile",
    screenId: "profile-screen",
  },
  {
    name: "history",
    destinationId: "destination-history",
    screenId: "history-screen",
  },
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      "seniorease.v1",
      JSON.stringify({
        version: 1,
        settings: {
          locale: "pt",
          fontScale: 1,
          contrastLevel: "standard",
          spacingScale: 1,
          navigationMode: "standard",
          reinforcedFeedback: false,
          extraConfirmations: true,
          tourCompleted: true,
          displayName: "",
          notifications: {
            enabled: false,
            leadTimeMinutes: 30,
            channel: "both",
            quietHours: null,
          },
        },
        activities: [],
      }),
    );
  });
  await page.goto("/");
  await expect(page.getByTestId("home-hub")).toBeVisible();
  await expect(page.getByTestId("destination-history")).toBeVisible();
});

for (const screen of screens) {
  test(`captura ${screen.name}`, async ({ page }) => {
    if ("destinationId" in screen) {
      await page.getByTestId(screen.destinationId).click();
    }

    await expect(page.getByTestId(screen.screenId)).toBeVisible();
    await expect(page).toHaveScreenshot(`${screen.name}.png`, {
      animations: "disabled",
      fullPage: true,
    });
  });
}
