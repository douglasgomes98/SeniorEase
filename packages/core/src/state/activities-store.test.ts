import { describe, it, expect, vi } from "vitest";
import type { Activity } from "../domain/activity";
import type { ActivitiesStoragePort } from "../application/ports/activities-storage-port";
import { LoadActivities } from "../application/use-cases/load-activities";
import { SaveActivities } from "../application/use-cases/save-activities";
import { createActivitiesStore } from "./activities-store";

interface FakePortState {
  stored: Activity[];
  failSaves: boolean;
  saveCount: number;
}

function makePort(
  config: { initial?: Activity[]; failSaves?: boolean } = {},
): { port: ActivitiesStoragePort; state: FakePortState } {
  const state: FakePortState = {
    stored: config.initial ?? [],
    failSaves: config.failSaves ?? false,
    saveCount: 0,
  };
  const port: ActivitiesStoragePort = {
    load: () => Promise.resolve(state.stored),
    save: (activities: Activity[]) => {
      state.saveCount += 1;
      if (state.failSaves) {
        return Promise.reject(new Error("save failed"));
      }
      state.stored = activities;
      return Promise.resolve();
    },
  };
  return { port, state };
}

function makeStore(port: ActivitiesStoragePort) {
  return createActivitiesStore({
    loadActivities: new LoadActivities(port),
    saveActivities: new SaveActivities(port),
  });
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

describe("activities-store", () => {
  it("hydrates to an empty list when storage is empty", async () => {
    const store = makeStore(makePort().port);
    await store.getState().hydrate();

    expect(store.getState().isHydrated).toBe(true);
    expect(store.getState().persistenceError).toBe(false);
    expect(store.getState().activities).toEqual([]);
  });

  it("hydrates to the stored activities when present", async () => {
    const store = makeStore(makePort({ initial: [activity] }).port);
    await store.getState().hydrate();
    expect(store.getState().activities).toEqual([activity]);
  });

  // test_activities_store_replace_persists
  it("replaces the list in memory and persists the new list", async () => {
    const { port, state } = makePort();
    const store = makeStore(port);

    store.getState().replaceActivities([activity]);
    expect(store.getState().activities).toEqual([activity]);

    await vi.waitFor(() => expect(state.saveCount).toBe(1));
    expect(state.stored).toEqual([activity]);
  });

  it("captures a save failure, keeps the change, and clears on next success", async () => {
    const { port, state } = makePort({ failSaves: true });
    const store = makeStore(port);

    store.getState().replaceActivities([activity]);
    expect(store.getState().activities).toEqual([activity]);
    await vi.waitFor(() =>
      expect(store.getState().persistenceError).toBe(true),
    );

    state.failSaves = false;
    store.getState().replaceActivities([]);
    await vi.waitFor(() =>
      expect(store.getState().persistenceError).toBe(false),
    );
    expect(store.getState().activities).toEqual([]);
  });
});
