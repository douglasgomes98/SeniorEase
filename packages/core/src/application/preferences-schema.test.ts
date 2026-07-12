import { describe, it, expect } from "vitest";
import { DEFAULT_PREFERENCES, type Preferences } from "../domain/preferences";
import { parseSettings, toPersistedSettings } from "./preferences-schema";

const validSettings: Preferences = {
  locale: "en",
  fontScale: 1.3,
  contrastLevel: "high",
  spacingScale: 1.25,
  navigationMode: "standard",
  reinforcedFeedback: true,
  extraConfirmations: false,
  tourCompleted: true,
  displayName: "Helena",
  notifications: {
    enabled: true,
    leadTimeMinutes: 30,
    channel: "os",
    quietHours: { start: "22:00", end: "07:00" },
  },
};

describe("preferences-schema (settings)", () => {
  it("parses a well-formed settings slice unchanged", () => {
    expect(parseSettings(validSettings)).toEqual(validSettings);
  });

  it("returns null when the slice is not an object", () => {
    expect(parseSettings(null)).toBeNull();
    expect(parseSettings("not an object")).toBeNull();
    expect(parseSettings(42)).toBeNull();
    expect(parseSettings([1, 2, 3])).toBeNull();
  });

  it("coerces an empty object to all defaults (never rejected)", () => {
    expect(parseSettings({})).toEqual(DEFAULT_PREFERENCES);
  });

  // test_parse_settings_coerces_bad_field
  it("coerces a single invalid field to its default, preserving the rest", () => {
    const parsed = parseSettings({ ...validSettings, spacingScale: 3 });
    expect(parsed?.spacingScale).toBe(DEFAULT_PREFERENCES.spacingScale);
    // other valid fields survive
    expect(parsed?.locale).toBe("en");
    expect(parsed?.fontScale).toBe(1.3);
    expect(parsed?.contrastLevel).toBe("high");
    expect(parsed?.navigationMode).toBe("standard");
  });

  // test_parse_settings_clamps_font_scale
  it("clamps and rounds the font scale", () => {
    expect(parseSettings({ fontScale: 0.4 })?.fontScale).toBe(1.0);
    expect(parseSettings({ fontScale: 9 })?.fontScale).toBe(2.0);
    expect(parseSettings({ fontScale: 1.333 })?.fontScale).toBe(1.33);
    expect(parseSettings({ fontScale: "big" })?.fontScale).toBe(
      DEFAULT_PREFERENCES.fontScale,
    );
  });

  // cross-feature: a malformed/unsupported locale falls back to the default
  it("coerces an unsupported locale to the default language", () => {
    const parsed = parseSettings({ ...validSettings, locale: "de" });
    expect(parsed?.locale).toBe(DEFAULT_PREFERENCES.locale);
    // the rest of the settings survive the bad locale
    expect(parsed?.contrastLevel).toBe("high");
    expect(parsed?.displayName).toBe("Helena");
  });

  it("trims and clamps the display name and coerces a non-string to empty", () => {
    expect(parseSettings({ displayName: `  ${"a".repeat(60)}  ` })?.displayName)
      .toBe("a".repeat(40));
    expect(parseSettings({ displayName: 123 })?.displayName).toBe("");
  });

  it("coerces the notifications group field-by-field", () => {
    const parsed = parseSettings({
      notifications: {
        enabled: "yes",
        leadTimeMinutes: 45,
        channel: "carrier-pigeon",
        quietHours: { start: "9am", end: "07:00" },
      },
    });
    expect(parsed?.notifications).toEqual(DEFAULT_PREFERENCES.notifications);
    // the default delivery channel is "both"
    expect(parsed?.notifications.channel).toBe("both");
  });

  it("keeps a valid quiet-hours window and drops a half-invalid one", () => {
    expect(
      parseSettings({
        notifications: { quietHours: { start: "23:00", end: "06:30" } },
      })?.notifications.quietHours,
    ).toEqual({ start: "23:00", end: "06:30" });
    expect(
      parseSettings({
        notifications: { quietHours: { start: "23:00", end: "bad" } },
      })?.notifications.quietHours,
    ).toBeNull();
  });

  it("round-trips through toPersistedSettings and parseSettings", () => {
    const persisted = toPersistedSettings(DEFAULT_PREFERENCES);
    expect(persisted).not.toHaveProperty("schemaVersion");
    expect(parseSettings(persisted)).toEqual(DEFAULT_PREFERENCES);
  });
});
