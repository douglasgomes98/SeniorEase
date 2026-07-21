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

const largeTextScreens = [
  {
    name: "personalization",
    destinationId: "destination-personalization",
    screenId: "personalization-screen",
    focusId: "spacing",
  },
  {
    name: "profile",
    destinationId: "destination-profile",
    screenId: "profile-screen",
    focusId: "profile-language",
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

for (const screen of largeTextScreens) {
  test(`captura ${screen.name} com texto ampliado`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.endsWith("-desktop"), "somente viewport de 390px");

    await page.addInitScript(() => {
      const raw = window.localStorage.getItem("seniorease.v1");
      if (!raw) throw new Error("Preferências iniciais ausentes.");
      const persisted = JSON.parse(raw) as {
        settings: { fontScale: number; spacingScale: number };
      };
      persisted.settings.fontScale = 2;
      persisted.settings.spacingScale = 1.5;
      window.localStorage.setItem("seniorease.v1", JSON.stringify(persisted));
    });
    await page.goto("/");
    await page.getByTestId(screen.destinationId).click();
    await expect(page.getByTestId(screen.screenId)).toBeVisible();
    await page.evaluate((focusId) => {
      const element = document.querySelector(`[data-testid="${focusId}"]`);
      if (!element) throw new Error(`Elemento ${focusId} ausente.`);
      element.scrollIntoView({ block: "center" });
    }, screen.focusId);
    await expect(page).toHaveScreenshot(`${screen.name}-large-text.png`, {
      animations: "disabled",
      fullPage: true,
    });
  });
}
