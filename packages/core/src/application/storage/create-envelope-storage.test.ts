import { describe, it, expect } from "vitest";
import { DEFAULT_PREFERENCES, type Preferences } from "../../domain/preferences";
import type { Activity } from "../../domain/activity";
import type { StoragePort } from "../ports/storage-port";
import {
  createEnvelopeStorage,
  PERSISTENCE_STORAGE_KEY,
} from "./create-envelope-storage";

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

const settings: Preferences = {
  ...DEFAULT_PREFERENCES,
  fontScale: 1.6,
  displayName: "Ana",
};

const activity: Activity = {
  id: "a1",
  title: "Comprar pao",
  description: "",
  steps: [],
  due: "",
  status: "pending",
  createdAt: 1752300000000,
  completedAt: null,
};

describe("createEnvelopeStorage", () => {
  it("loads null settings and an empty activity list when nothing is stored", async () => {
    const envelope = createEnvelopeStorage(inMemoryStorage());
    expect(await envelope.loadSettings()).toBeNull();
    expect(await envelope.loadActivities()).toEqual([]);
  });

  it("degrades to defaults when the stored JSON is corrupt", async () => {
    const envelope = createEnvelopeStorage(
      inMemoryStorage({ [PERSISTENCE_STORAGE_KEY]: "{ not json" }),
    );
    expect(await envelope.loadSettings()).toBeNull();
    expect(await envelope.loadActivities()).toEqual([]);
  });

  it("round-trips settings and activities under the single key", async () => {
    const port = inMemoryStorage();
    const envelope = createEnvelopeStorage(port);
    await envelope.saveSettings(settings);
    await envelope.saveActivities([activity]);

    expect(await envelope.loadSettings()).toEqual(settings);
    expect(await envelope.loadActivities()).toEqual([activity]);

    const raw = await port.getItem(PERSISTENCE_STORAGE_KEY);
    expect(JSON.parse(raw ?? "{}")).toMatchObject({ version: 1 });
  });

  // test_envelope_save_settings_preserves_activities
  it("saveSettings preserves previously stored activities", async () => {
    const envelope = createEnvelopeStorage(inMemoryStorage());
    await envelope.saveActivities([activity]);
    await envelope.saveSettings(settings);

    expect(await envelope.loadActivities()).toEqual([activity]);
    expect(await envelope.loadSettings()).toEqual(settings);
  });

  // test_envelope_save_activities_preserves_settings
  it("saveActivities preserves previously stored settings", async () => {
    const envelope = createEnvelopeStorage(inMemoryStorage());
    await envelope.saveSettings(settings);
    await envelope.saveActivities([activity]);

    expect(await envelope.loadSettings()).toEqual(settings);
    expect(await envelope.loadActivities()).toEqual([activity]);
  });

  // test_envelope_save_rejects_on_failure
  it("propagates a save failure so the caller can observe it", async () => {
    const failing: StoragePort = {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.reject(new Error("quota exceeded")),
      removeItem: () => Promise.resolve(),
    };
    const envelope = createEnvelopeStorage(failing);
    await expect(envelope.saveSettings(settings)).rejects.toThrow(
      "quota exceeded",
    );
    await expect(envelope.saveActivities([activity])).rejects.toThrow(
      "quota exceeded",
    );
  });
});
