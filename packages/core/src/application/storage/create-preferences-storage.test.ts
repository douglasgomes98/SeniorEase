import { describe, it, expect, vi } from "vitest";
import { DEFAULT_PREFERENCES } from "../../domain/preferences";
import type { StoragePort } from "../ports/storage-port";
import { toPersisted } from "../preferences-schema";
import {
  createPreferencesStorage,
  PREFERENCES_STORAGE_KEY,
} from "./create-preferences-storage";

function inMemoryStorage(initial: Record<string, string> = {}): StoragePort {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key) => Promise.resolve(map.get(key) ?? null),
    setItem: (key, value) => {
      map.set(key, value);
      return Promise.resolve();
    },
    removeItem: (key) => {
      map.delete(key);
      return Promise.resolve();
    },
  };
}

describe("createPreferencesStorage", () => {
  // test_storage_load_validates
  it("returns null when nothing is stored", async () => {
    const storage = createPreferencesStorage(inMemoryStorage());
    expect(await storage.load()).toBeNull();
  });

  it("validates the raw payload on load", async () => {
    const invalid = inMemoryStorage({
      [PREFERENCES_STORAGE_KEY]: JSON.stringify({ schemaVersion: 2 }),
    });
    expect(await createPreferencesStorage(invalid).load()).toBeNull();

    const corruptJson = inMemoryStorage({
      [PREFERENCES_STORAGE_KEY]: "{ not json",
    });
    expect(await createPreferencesStorage(corruptJson).load()).toBeNull();
  });

  it("round-trips a saved preferences record", async () => {
    const port = inMemoryStorage();
    const storage = createPreferencesStorage(port);
    await storage.save(DEFAULT_PREFERENCES);
    expect(await storage.load()).toEqual(DEFAULT_PREFERENCES);
    expect(await port.getItem(PREFERENCES_STORAGE_KEY)).toBe(
      JSON.stringify(toPersisted(DEFAULT_PREFERENCES)),
    );
  });

  // test_storage_save_rejects_on_failure
  it("propagates a save failure so the caller can observe it", async () => {
    const failing: StoragePort = {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.reject(new Error("quota exceeded")),
      removeItem: () => Promise.resolve(),
    };
    const storage = createPreferencesStorage(failing);
    await expect(storage.save(DEFAULT_PREFERENCES)).rejects.toThrow(
      "quota exceeded",
    );
  });

  it("degrades to null when the raw read throws", async () => {
    const failingRead: StoragePort = {
      getItem: () => Promise.reject(new Error("unavailable")),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
    const storage = createPreferencesStorage(failingRead);
    expect(await storage.load()).toBeNull();
  });

  it("reads and writes through the injected key", async () => {
    const port = inMemoryStorage();
    const setItem = vi.spyOn(port, "setItem");
    const storage = createPreferencesStorage(port);
    await storage.save(DEFAULT_PREFERENCES);
    expect(setItem).toHaveBeenCalledWith(
      PREFERENCES_STORAGE_KEY,
      expect.any(String),
    );
  });
});
