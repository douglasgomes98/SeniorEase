import { describe, it, expect, vi } from "vitest";
import { DEFAULT_PREFERENCES } from "../../domain/preferences";
import type { EnvelopeStorage } from "./create-envelope-storage";
import { createPreferencesStorage } from "./create-preferences-storage";

function fakeEnvelope(overrides: Partial<EnvelopeStorage> = {}): EnvelopeStorage {
  return {
    loadSettings: () => Promise.resolve(null),
    saveSettings: () => Promise.resolve(),
    loadActivities: () => Promise.resolve([]),
    saveActivities: () => Promise.resolve(),
    ...overrides,
  };
}

describe("createPreferencesStorage", () => {
  it("delegates load to the envelope's settings slice", async () => {
    const loadSettings = vi.fn(() => Promise.resolve(DEFAULT_PREFERENCES));
    const storage = createPreferencesStorage(fakeEnvelope({ loadSettings }));
    expect(await storage.load()).toEqual(DEFAULT_PREFERENCES);
    expect(loadSettings).toHaveBeenCalledOnce();
  });

  it("delegates save to the envelope's settings slice", async () => {
    const saveSettings = vi.fn(() => Promise.resolve());
    const storage = createPreferencesStorage(fakeEnvelope({ saveSettings }));
    await storage.save(DEFAULT_PREFERENCES);
    expect(saveSettings).toHaveBeenCalledWith(DEFAULT_PREFERENCES);
  });

  it("propagates a save failure from the envelope", async () => {
    const storage = createPreferencesStorage(
      fakeEnvelope({ saveSettings: () => Promise.reject(new Error("quota")) }),
    );
    await expect(storage.save(DEFAULT_PREFERENCES)).rejects.toThrow("quota");
  });
});
