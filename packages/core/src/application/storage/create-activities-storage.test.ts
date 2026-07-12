import { describe, it, expect, vi } from "vitest";
import type { Activity } from "../../domain/activity";
import type { EnvelopeStorage } from "./create-envelope-storage";
import { createActivitiesStorage } from "./create-activities-storage";

function fakeEnvelope(overrides: Partial<EnvelopeStorage> = {}): EnvelopeStorage {
  return {
    loadSettings: () => Promise.resolve(null),
    saveSettings: () => Promise.resolve(),
    loadActivities: () => Promise.resolve([]),
    saveActivities: () => Promise.resolve(),
    ...overrides,
  };
}

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

describe("createActivitiesStorage", () => {
  it("delegates load to the envelope's activities slice", async () => {
    const loadActivities = vi.fn(() => Promise.resolve([activity]));
    const storage = createActivitiesStorage(fakeEnvelope({ loadActivities }));
    expect(await storage.load()).toEqual([activity]);
    expect(loadActivities).toHaveBeenCalledOnce();
  });

  it("delegates save to the envelope's activities slice", async () => {
    const saveActivities = vi.fn(() => Promise.resolve());
    const storage = createActivitiesStorage(fakeEnvelope({ saveActivities }));
    await storage.save([activity]);
    expect(saveActivities).toHaveBeenCalledWith([activity]);
  });

  it("propagates a save failure from the envelope", async () => {
    const storage = createActivitiesStorage(
      fakeEnvelope({ saveActivities: () => Promise.reject(new Error("quota")) }),
    );
    await expect(storage.save([activity])).rejects.toThrow("quota");
  });
});
