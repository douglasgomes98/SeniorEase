import { describe, it, expect } from "vitest";
import {
  APP_ROUTES,
  isAppRoute,
  visibleRoutes,
  type DestinationDescriptor,
} from "./app-route";

const catalog: DestinationDescriptor[] = [
  { route: "activities", advanced: false },
  { route: "personalization", advanced: false },
  { route: "profile", advanced: false },
];

describe("app-route", () => {
  it("accepts known routes and rejects anything else", () => {
    for (const route of APP_ROUTES) {
      expect(isAppRoute(route)).toBe(true);
    }
    expect(isAppRoute("x")).toBe(false);
    expect(isAppRoute(null)).toBe(false);
    expect(isAppRoute(2)).toBe(false);
    expect(isAppRoute(undefined)).toBe(false);
  });

  it("hides advanced entries and caps at 4 in simple mode", () => {
    const withAdvanced: DestinationDescriptor[] = [
      ...catalog,
      { route: "home", advanced: true },
      { route: "profile", advanced: true },
    ];
    const result = visibleRoutes("simple", withAdvanced);

    expect(result).not.toContain("home");
    expect(result.length).toBeLessThanOrEqual(4);
    expect(result).toEqual(["activities", "personalization", "profile"]);
  });

  it("returns the full set in standard mode", () => {
    expect(visibleRoutes("standard", catalog)).toEqual([
      "activities",
      "personalization",
      "profile",
    ]);
  });

  it("keeps the relative order identical across modes (Web/Mobile parity)", () => {
    const simple = visibleRoutes("simple", catalog);
    const standard = visibleRoutes("standard", catalog);
    // shared routes appear in the same relative order in both modes
    expect(standard.filter((route) => simple.includes(route))).toEqual(simple);
  });
});
