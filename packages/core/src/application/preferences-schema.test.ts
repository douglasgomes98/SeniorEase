import { describe, it, expect } from "vitest";
import { DEFAULT_PREFERENCES } from "../domain/preferences";
import {
  PREFERENCES_SCHEMA_VERSION,
  parsePreferences,
  toPersisted,
  type PersistedPreferences,
} from "./preferences-schema";

const validV2: PersistedPreferences = {
  schemaVersion: 2,
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
    channel: "in-app",
    quietHours: { start: "22:00", end: "07:00" },
  },
};

describe("preferences-schema", () => {
  it("uses version 2 as the current schema version", () => {
    expect(PREFERENCES_SCHEMA_VERSION).toBe(2);
  });

  // test_parse_valid_v2
  it("parses a well-formed v2 payload", () => {
    const parsed = parsePreferences(validV2);
    expect(parsed).toEqual({
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
        channel: "in-app",
        quietHours: { start: "22:00", end: "07:00" },
      },
    });
  });

  // test_parse_corrupt_returns_null
  it("returns null for corrupt or incomplete data", () => {
    expect(parsePreferences(null)).toBeNull();
    expect(parsePreferences("not an object")).toBeNull();
    expect(parsePreferences({ schemaVersion: 2 })).toBeNull();
    expect(
      parsePreferences({ ...validV2, spacingScale: 2.0 }),
    ).toBeNull();
    expect(
      parsePreferences({ ...validV2, locale: "de" }),
    ).toBeNull();
    expect(
      parsePreferences({
        ...validV2,
        notifications: { ...validV2.notifications, leadTimeMinutes: 45 },
      }),
    ).toBeNull();
  });

  // test_parse_version_above_current_returns_null
  it("returns null for a version newer than the app supports", () => {
    expect(parsePreferences({ ...validV2, schemaVersion: 3 })).toBeNull();
  });

  // test_migrate_v1_to_v2_preserves_values
  it("migrates a legacy v1 record, preserving values and back-filling new fields", () => {
    const legacyV1 = {
      schemaVersion: 1,
      locale: "es",
      fontScale: 1.6,
      contrastLevel: "high",
      navigationMode: "standard",
      extraConfirmations: false,
      tourCompleted: true,
    };

    const parsed = parsePreferences(legacyV1);
    expect(parsed).not.toBeNull();
    // preserved legacy values
    expect(parsed?.locale).toBe("es");
    expect(parsed?.fontScale).toBe(1.6);
    expect(parsed?.contrastLevel).toBe("high");
    expect(parsed?.navigationMode).toBe("standard");
    expect(parsed?.extraConfirmations).toBe(false);
    expect(parsed?.tourCompleted).toBe(true);
    // back-filled new defaults
    expect(parsed?.spacingScale).toBe(DEFAULT_PREFERENCES.spacingScale);
    expect(parsed?.reinforcedFeedback).toBe(
      DEFAULT_PREFERENCES.reinforcedFeedback,
    );
    expect(parsed?.displayName).toBe(DEFAULT_PREFERENCES.displayName);
    expect(parsed?.notifications).toEqual(DEFAULT_PREFERENCES.notifications);
  });

  it("round-trips through toPersisted and parsePreferences", () => {
    const persisted = toPersisted(DEFAULT_PREFERENCES);
    expect(persisted.schemaVersion).toBe(2);
    expect(parsePreferences(persisted)).toEqual(DEFAULT_PREFERENCES);
  });
});
