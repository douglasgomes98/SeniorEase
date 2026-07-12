import { describe, it, expect } from "vitest";
import type { AppRoute } from "../domain/app-route";
import type { NavigationStorage } from "../application/storage/create-navigation-storage";
import { createNavigationStore } from "./navigation-store";

function makeStorage(
  config: { initial?: AppRoute | null; failSaves?: boolean } = {},
): { storage: NavigationStorage; saved: AppRoute[] } {
  const saved: AppRoute[] = [];
  const storage: NavigationStorage = {
    load: () => Promise.resolve(config.initial ?? null),
    save: (route) => {
      saved.push(route);
      return config.failSaves
        ? Promise.reject(new Error("save failed"))
        : Promise.resolve();
    },
  };
  return { storage, saved };
}

function makeStore(storage: NavigationStorage) {
  return createNavigationStore({ navigationStorage: storage });
}

describe("navigation-store", () => {
  it("starts at the home root", () => {
    const store = makeStore(makeStorage().storage);
    expect(store.getState().current).toBe("home");
    expect(store.getState().canGoBack).toBe(false);
    expect(store.getState().stack).toEqual(["home"]);
    expect(store.getState().lastModule).toBeNull();
  });

  it("navigate pushes and updates the derived state", () => {
    const store = makeStore(makeStorage().storage);
    store.getState().navigate("activities");
    expect(store.getState().current).toBe("activities");
    expect(store.getState().canGoBack).toBe(true);
    expect(store.getState().stack).toEqual(["home", "activities"]);
  });

  it("navigate to a module sets and persists lastModule", () => {
    const { storage, saved } = makeStorage();
    const store = makeStore(storage);
    store.getState().navigate("profile");
    expect(store.getState().lastModule).toBe("profile");
    expect(saved).toEqual(["profile"]);
  });

  it("swallows a persistence failure on navigate (best-effort)", () => {
    const { storage } = makeStorage({ failSaves: true });
    const store = makeStore(storage);
    expect(() => store.getState().navigate("activities")).not.toThrow();
    expect(store.getState().current).toBe("activities");
  });

  it("back pops the stack and is a no-op at the root", () => {
    const store = makeStore(makeStorage().storage);
    store.getState().navigate("activities");
    store.getState().back();
    expect(store.getState().current).toBe("home");
    expect(store.getState().canGoBack).toBe(false);
    // already at root: no-op
    store.getState().back();
    expect(store.getState().stack).toEqual(["home"]);
  });

  it("resetToHome collapses the stack", () => {
    const store = makeStore(makeStorage().storage);
    store.getState().navigate("activities");
    store.getState().navigate("profile");
    store.getState().resetToHome();
    expect(store.getState().stack).toEqual(["home"]);
    expect(store.getState().canGoBack).toBe(false);
  });

  it("hydrate loads the persisted last module", async () => {
    const store = makeStore(makeStorage({ initial: "activities" }).storage);
    await store.getState().hydrate();
    expect(store.getState().lastModule).toBe("activities");
    expect(store.getState().isHydrated).toBe(true);
    // hydration must not auto-navigate away from home
    expect(store.getState().current).toBe("home");
  });

  it("hydrate leaves lastModule null when storage is empty or invalid", async () => {
    const store = makeStore(makeStorage({ initial: null }).storage);
    await store.getState().hydrate();
    expect(store.getState().lastModule).toBeNull();
  });

  it("resume navigates to lastModule and is a no-op when absent", () => {
    const store = makeStore(makeStorage({ initial: "profile" }).storage);
    // no lastModule yet: resume is a no-op
    store.getState().resume();
    expect(store.getState().current).toBe("home");

    store.setState({ lastModule: "profile" });
    store.getState().resume();
    expect(store.getState().current).toBe("profile");
  });
});
