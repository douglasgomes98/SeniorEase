import { describe, it, expect, vi } from "vitest";
import { DEFAULT_PREFERENCES, type Preferences } from "../domain/preferences";
import type { PreferencesStoragePort } from "../application/ports/preferences-storage-port";
import { LoadPreferences } from "../application/use-cases/load-preferences";
import { SavePreferences } from "../application/use-cases/save-preferences";
import { createPreferencesStore } from "./preferences-store";

interface FakePortState {
  stored: Preferences | null;
  failSaves: boolean;
  saveCount: number;
}

function makePort(
  config: { initial?: Preferences | null; failSaves?: boolean } = {},
): { port: PreferencesStoragePort; state: FakePortState } {
  const state: FakePortState = {
    stored: config.initial ?? null,
    failSaves: config.failSaves ?? false,
    saveCount: 0,
  };
  const port: PreferencesStoragePort = {
    load: () => Promise.resolve(state.stored),
    save: (preferences: Preferences) => {
      state.saveCount += 1;
      if (state.failSaves) {
        return Promise.reject(new Error("save failed"));
      }
      state.stored = preferences;
      return Promise.resolve();
    },
  };
  return { port, state };
}

function makeStore(port: PreferencesStoragePort) {
  return createPreferencesStore({
    loadPreferences: new LoadPreferences(port),
    savePreferences: new SavePreferences(port),
  });
}

describe("preferences-store", () => {
  // test_store_hydrate_applies_defaults_when_absent
  it("hydrates to safe defaults when storage is empty", async () => {
    const { port } = makePort({ initial: null });
    const store = makeStore(port);
    await store.getState().hydrate();

    expect(store.getState().isHydrated).toBe(true);
    expect(store.getState().persistenceError).toBe(false);
    expect(store.getState()).toMatchObject(DEFAULT_PREFERENCES);
  });

  it("hydrates to the stored values when present", async () => {
    const stored: Preferences = {
      ...DEFAULT_PREFERENCES,
      fontScale: 1.6,
      displayName: "Ana",
      spacingScale: 1.5,
    };
    const store = makeStore(makePort({ initial: stored }).port);
    await store.getState().hydrate();

    expect(store.getState().fontScale).toBe(1.6);
    expect(store.getState().displayName).toBe("Ana");
    expect(store.getState().spacingScale).toBe(1.5);
  });

  // test_store_setter_persists
  it("applies each new setter and persists the updated snapshot", async () => {
    const { port, state } = makePort();
    const store = makeStore(port);

    store.getState().setSpacingScale(1.5);
    store.getState().setNavigationMode("standard");
    store.getState().setReinforcedFeedback(true);
    store.getState().setExtraConfirmations(false);
    store.getState().setNotifications({ enabled: true, leadTimeMinutes: 60 });

    expect(store.getState().spacingScale).toBe(1.5);
    expect(store.getState().navigationMode).toBe("standard");
    expect(store.getState().reinforcedFeedback).toBe(true);
    expect(store.getState().extraConfirmations).toBe(false);

    await vi.waitFor(() => expect(state.saveCount).toBeGreaterThanOrEqual(5));
    expect(state.stored?.spacingScale).toBe(1.5);
    expect(state.stored?.notifications).toEqual({
      enabled: true,
      leadTimeMinutes: 60,
      channel: "both",
      quietHours: null,
    });
  });

  it("trims and clamps the display name", () => {
    const store = makeStore(makePort().port);
    store.getState().setDisplayName(`  ${"a".repeat(50)}  `);
    expect(store.getState().displayName).toBe("a".repeat(40));
  });

  it("resets every preference to its safe default", async () => {
    const { port } = makePort();
    const store = makeStore(port);

    store.getState().setDisplayName("Ana");
    store.getState().setReinforcedFeedback(true);
    store.getState().setSpacingScale(1.5);
    store.getState().setNotifications({ enabled: true });

    store.getState().resetToDefaults();

    expect(store.getState().displayName).toBe("");
    expect(store.getState().reinforcedFeedback).toBe(false);
    expect(store.getState().spacingScale).toBe(DEFAULT_PREFERENCES.spacingScale);
    expect(store.getState().notifications).toEqual(
      DEFAULT_PREFERENCES.notifications,
    );
  });

  // test_store_persistence_error_on_save_failure
  it("captures a save failure, keeps the change, and clears on next success", async () => {
    const { port, state } = makePort({ failSaves: true });
    const store = makeStore(port);

    store.getState().setReinforcedFeedback(true);
    // the in-memory change survives even though the save fails
    expect(store.getState().reinforcedFeedback).toBe(true);
    await vi.waitFor(() =>
      expect(store.getState().persistenceError).toBe(true),
    );

    // a subsequent successful save clears the transient error
    state.failSaves = false;
    store.getState().setReinforcedFeedback(false);
    await vi.waitFor(() =>
      expect(store.getState().persistenceError).toBe(false),
    );
    expect(store.getState().reinforcedFeedback).toBe(false);
  });
});
