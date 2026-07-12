import { describe, it, expect } from "vitest";
import {
  NAVIGATION_SCHEMA_VERSION,
  parseNavigation,
  toPersistedNavigation,
} from "./navigation-schema";

describe("navigation-schema", () => {
  it("uses version 1 as the current schema version", () => {
    expect(NAVIGATION_SCHEMA_VERSION).toBe(1);
  });

  it("parses a well-formed record into the module route", () => {
    expect(parseNavigation({ schemaVersion: 1, lastRoute: "activities" })).toBe(
      "activities",
    );
  });

  it("rejects an unknown schema version", () => {
    expect(parseNavigation({ schemaVersion: 2, lastRoute: "activities" })).toBeNull();
    expect(parseNavigation({ schemaVersion: 0, lastRoute: "activities" })).toBeNull();
  });

  it("rejects home, unknown routes and malformed payloads", () => {
    expect(parseNavigation({ schemaVersion: 1, lastRoute: "home" })).toBeNull();
    expect(parseNavigation({ schemaVersion: 1, lastRoute: "nope" })).toBeNull();
    expect(parseNavigation({ schemaVersion: 1 })).toBeNull();
    expect(parseNavigation(null)).toBeNull();
    expect(parseNavigation("not an object")).toBeNull();
  });

  it("round-trips through toPersistedNavigation and parseNavigation", () => {
    const persisted = toPersistedNavigation("profile");
    expect(persisted).toEqual({ schemaVersion: 1, lastRoute: "profile" });
    expect(parseNavigation(persisted)).toBe("profile");
  });
});
