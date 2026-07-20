import {
  completeActivity,
  createActivity,
  advanceStep,
  isAtLastStep,
  listHistory,
  startStepProgress,
  type NotificationSchedulerPort,
  type ScheduledReminder,
  type StoragePort,
} from "@senior-ease/core";
import { describe, expect, it, vi } from "vitest";
import { createAppStores } from "./create-app-stores";

function makeStorage(): { port: StoragePort; values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    port: {
      getItem: async (key) => values.get(key) ?? null,
      setItem: async (key, value) => void values.set(key, value),
      removeItem: async (key) => void values.delete(key),
    },
  };
}

function makeScheduler(): {
  port: NotificationSchedulerPort;
  scheduled: ScheduledReminder[];
} {
  const scheduled: ScheduledReminder[] = [];
  return {
    scheduled,
    port: {
      isSupported: () => true,
      getPermission: async () => "granted",
      requestPermission: async () => "granted",
      schedule: async (reminder) => void scheduled.push(reminder),
      cancel: async () => undefined,
      cancelAll: async () => undefined,
    },
  };
}

describe("createAppStores", () => {
  it("persists preferences through a new composition root", async () => {
    const storage = makeStorage();
    const first = createAppStores(storage.port, makeScheduler().port);
    first.preferences.getState().setSpacingScale(1.5);
    await vi.waitFor(() => expect(storage.values.get("seniorease.v1")).toBeDefined());

    const second = createAppStores(storage.port, makeScheduler().port);
    await second.preferences.getState().hydrate();
    expect(second.preferences.getState().spacingScale).toBe(1.5);
  });

  it("moves a stepped activity into history", async () => {
    const stores = createAppStores(makeStorage().port, makeScheduler().port);
    const created = createActivity(
      {
        title: "Tomar remedio",
        description: "",
        steps: ["Separar agua", "Tomar remedio", "Guardar a caixa"],
        due: "",
      },
      "a1",
      1,
    );
    stores.activities.getState().replaceActivities([created]);
    await vi.waitFor(() => expect(stores.activities.getState().activities).toHaveLength(1));

    const firstStep = startStepProgress(created.steps.length);
    const secondStep = advanceStep(firstStep);
    const lastStep = advanceStep(secondStep);
    expect(secondStep.currentIndex).toBe(1);
    expect(isAtLastStep(secondStep)).toBe(false);
    expect(isAtLastStep(lastStep)).toBe(true);

    stores.activities.getState().replaceActivities([completeActivity(created, 2)]);
    await vi.waitFor(() =>
      expect(listHistory(stores.activities.getState().activities)).toHaveLength(1),
    );
    expect(listHistory(stores.activities.getState().activities)[0]?.title).toBe("Tomar remedio");
  });

  it("resolves cancelled and confirmed requests", async () => {
    const stores = createAppStores(makeStorage().port, makeScheduler().port);
    const request = {
      title: "Excluir atividade",
      message: "Esta acao nao pode ser desfeita.",
      confirmLabel: "Excluir",
      cancelLabel: "Cancelar",
      tone: "danger" as const,
    };

    const cancelled = stores.confirmation.getState().request(request);
    stores.confirmation.getState().cancel();
    await expect(cancelled).resolves.toBe(false);

    const confirmed = stores.confirmation.getState().request(request);
    stores.confirmation.getState().confirm();
    await expect(confirmed).resolves.toBe(true);
  });

  it("hydrates permission and schedules a future pending activity", async () => {
    const scheduler = makeScheduler();
    const stores = createAppStores(makeStorage().port, scheduler.port);
    const activity = createActivity(
      {
        title: "Tomar remedio",
        description: "",
        steps: [],
        due: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
      "a1",
      1,
    );

    await stores.reminders.getState().hydratePermission();
    stores.preferences.getState().setNotifications({ enabled: true });
    await stores.reminders
      .getState()
      .syncReminders([activity], stores.preferences.getState().notifications, "Lembrete");

    expect(scheduler.scheduled).toHaveLength(1);
  });
});
