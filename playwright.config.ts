import { defineConfig } from "@playwright/test";

const endpoints = [
  {
    name: "web",
    baseURL: process.env.VISUAL_WEB_URL ?? "http://127.0.0.1:3000",
  },
  {
    name: "mobile-web",
    baseURL: process.env.VISUAL_MOBILE_WEB_URL ?? "http://127.0.0.1:8081",
  },
] as const;

const viewports = [
  { name: "mobile", viewport: { width: 390, height: 844 } },
  { name: "desktop", viewport: { width: 1440, height: 900 } },
] as const;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "test-results",
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    colorScheme: "light",
    locale: "pt-BR",
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: endpoints.flatMap((endpoint) =>
    viewports.map((viewport) => ({
      name: `${endpoint.name}-${viewport.name}`,
      use: { baseURL: endpoint.baseURL, viewport: viewport.viewport },
    })),
  ),
});
