import { describe, it, expect } from "vitest";
import type { StoragePort } from "../ports/storage-port";
import { toPersistedNavigation } from "../navigation-schema";
import {
  createNavigationStorage,
  NAVIGATION_STORAGE_KEY,
} from "./create-navigation-storage";

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

describe("createNavigationStorage", () => {
  it("returns null when nothing is stored", async () => {
    const storage = createNavigationStorage(inMemoryStorage());
    expect(await storage.load()).toBeNull();
  });

  it("validates the stored payload on load", async () => {
    const invalid = inMemoryStorage({
      [NAVIGATION_STORAGE_KEY]: JSON.stringify({ schemaVersion: 1, lastRoute: "home" }),
    });
    expect(await createNavigationStorage(invalid).load()).toBeNull();

    const corruptJson = inMemoryStorage({
      [NAVIGATION_STORAGE_KEY]: "{ not json",
    });
    expect(await createNavigationStorage(corruptJson).load()).toBeNull();
  });

  it("round-trips a saved module", async () => {
    const port = inMemoryStorage();
    const storage = createNavigationStorage(port);
    await storage.save("activities");
    expect(await storage.load()).toBe("activities");
    expect(await port.getItem(NAVIGATION_STORAGE_KEY)).toBe(
      JSON.stringify(toPersistedNavigation("activities")),
    );
  });

  it("propagates a save failure so the caller can observe it", async () => {
    const failing: StoragePort = {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.reject(new Error("quota exceeded")),
      removeItem: () => Promise.resolve(),
    };
    const storage = createNavigationStorage(failing);
    await expect(storage.save("profile")).rejects.toThrow("quota exceeded");
  });

  it("degrades to null when the raw read throws", async () => {
    const failingRead: StoragePort = {
      getItem: () => Promise.reject(new Error("unavailable")),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
    expect(await createNavigationStorage(failingRead).load()).toBeNull();
  });
});
