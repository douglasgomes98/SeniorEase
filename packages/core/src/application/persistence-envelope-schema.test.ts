import { describe, it, expect } from "vitest";
import { DEFAULT_PREFERENCES, type Preferences } from "../domain/preferences";
import type { Activity } from "../domain/activity";
import {
  PERSISTENCE_ENVELOPE_VERSION,
  parseEnvelope,
  toEnvelope,
} from "./persistence-envelope-schema";

const settings: Preferences = {
  ...DEFAULT_PREFERENCES,
  fontScale: 1.3,
  displayName: "Helena",
};

const activity: Activity = {
  id: "a1",
  title: "Pagar a conta de luz",
  description: "",
  steps: ["Abrir o app do banco"],
  due: "",
  status: "pending",
  createdAt: 1752300000000,
  completedAt: null,
};

describe("persistence-envelope-schema", () => {
  it("uses version 1 as the current envelope version", () => {
    expect(PERSISTENCE_ENVELOPE_VERSION).toBe(1);
  });

  it("splits a well-formed version-1 envelope into its slices", () => {
    const parsed = parseEnvelope({ version: 1, settings, activities: [activity] });
    expect(parsed.settings).toEqual(settings);
    expect(parsed.activities).toEqual([activity]);
  });

  // test_parse_envelope_version_mismatch
  it("rejects a mismatched, missing or non-object version", () => {
    expect(parseEnvelope({ version: 2, settings, activities: [activity] })).toEqual(
      { settings: null, activities: [] },
    );
    expect(parseEnvelope({ settings, activities: [activity] })).toEqual({
      settings: null,
      activities: [],
    });
    expect(parseEnvelope("not an object")).toEqual({
      settings: null,
      activities: [],
    });
    expect(parseEnvelope(null)).toEqual({ settings: null, activities: [] });
  });

  // test_parse_envelope_bad_settings_keeps_activities
  it("rejects a garbage settings slice but keeps valid activities", () => {
    const parsed = parseEnvelope({
      version: 1,
      settings: "garbage",
      activities: [activity],
    });
    // settings null => the loader applies safe defaults downstream
    expect(parsed.settings).toBeNull();
    expect(parsed.activities).toEqual([activity]);
  });

  it("keeps settings while skipping a bad activity record", () => {
    const parsed = parseEnvelope({
      version: 1,
      settings,
      activities: [{ title: "no id" }, activity],
    });
    expect(parsed.settings).toEqual(settings);
    expect(parsed.activities).toEqual([activity]);
  });

  it("builds a version-1 envelope from settings and activities", () => {
    const envelope = toEnvelope(settings, [activity]);
    expect(envelope.version).toBe(1);
    expect(envelope.settings).toEqual(settings);
    expect(envelope.activities).toEqual([activity]);
  });

  it("round-trips through toEnvelope and parseEnvelope", () => {
    const parsed = parseEnvelope(toEnvelope(settings, [activity]));
    expect(parsed.settings).toEqual(settings);
    expect(parsed.activities).toEqual([activity]);
  });
});
