import { describe, it, expect } from "vitest";
import type { Activity } from "../domain/activity";
import type { NotificationPreferences } from "../domain/notification-preferences";
import type { NotificationPermissionStatus } from "../domain/reminder";
import type {
  NotificationSchedulerPort,
  ScheduledReminder,
} from "../application/ports/notification-scheduler-port";
import { createReminderStore } from "./reminder-store";

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);
const MINUTE = 60000;
const HEADING = "Lembrete";

interface MockPort {
  port: NotificationSchedulerPort;
  scheduled: ScheduledReminder[];
  cancelled: string[];
  cancelAllCount: number;
  requestCount: number;
}

function makePort(
  config: {
    supported?: boolean;
    permission?: NotificationPermissionStatus;
    requestResult?: NotificationPermissionStatus;
    failSchedule?: boolean;
  } = {},
): MockPort {
  const supported = config.supported ?? true;
  const permission = config.permission ?? "granted";
  const record: MockPort = {
    scheduled: [],
    cancelled: [],
    cancelAllCount: 0,
    requestCount: 0,
    port: {
      isSupported: () => supported,
      getPermission: () => Promise.resolve(permission),
      requestPermission: () => {
        record.requestCount += 1;
        return Promise.resolve(config.requestResult ?? permission);
      },
      schedule: (reminder: ScheduledReminder) => {
        if (config.failSchedule) {
          return Promise.reject(new Error("schedule failed"));
        }
        record.scheduled.push(reminder);
        return Promise.resolve();
      },
      cancel: (activityId: string) => {
        record.cancelled.push(activityId);
        return Promise.resolve();
      },
      cancelAll: () => {
        record.cancelAllCount += 1;
        return Promise.resolve();
      },
    },
  };
  return record;
}

function activity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "a1",
    title: "Pagar a conta de luz",
    description: "",
    steps: [],
    due: "",
    status: "pending",
    createdAt: NOW,
    completedAt: null,
    ...overrides,
  };
}

function dueAt(deltaMinutes: number): string {
  return new Date(NOW + deltaMinutes * MINUTE).toISOString();
}

function prefs(
  overrides: Partial<NotificationPreferences> = {},
): NotificationPreferences {
  return {
    enabled: true,
    leadTimeMinutes: 30,
    channel: "both",
    quietHours: null,
    ...overrides,
  };
}

/** Janela de horas silenciosas de 1 minuto que contem o "HH:mm" local de `ms`. */
function quietWindowAround(ms: number): { start: string; end: string } {
  const date = new Date(ms);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const fmt = (m: number): string => {
    const wrapped = ((m % 1440) + 1440) % 1440;
    const hh = String(Math.floor(wrapped / 60)).padStart(2, "0");
    const mm = String(wrapped % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };
  return { start: fmt(minutes), end: fmt(minutes + 1) };
}

function makeStore(port: NotificationSchedulerPort) {
  return createReminderStore({ scheduler: port, now: () => NOW });
}

describe("reminder-store", () => {
  it("schedules future os reminders", async () => {
    const mock = makePort();
    const store = makeStore(mock.port);
    await store.getState().hydratePermission();

    await store
      .getState()
      .syncReminders([activity({ due: dueAt(120) })], prefs(), HEADING);

    expect(mock.scheduled).toHaveLength(1);
    expect(mock.scheduled[0]).toEqual({
      activityId: "a1",
      heading: HEADING,
      body: "Pagar a conta de luz",
      fireAt: Date.parse(dueAt(120)) - 30 * MINUTE,
    });
  });

  it("skips past-due", async () => {
    const mock = makePort();
    const store = makeStore(mock.port);
    await store.getState().hydratePermission();

    await store
      .getState()
      .syncReminders([activity({ due: dueAt(-10) })], prefs(), HEADING);

    expect(mock.scheduled).toHaveLength(0);
  });

  it("cancels removed and completed", async () => {
    const mock = makePort();
    const store = makeStore(mock.port);
    await store.getState().hydratePermission();

    const kept = activity({ id: "kept", due: dueAt(120) });
    const gone = activity({ id: "gone", due: dueAt(90) });
    await store.getState().syncReminders([kept, gone], prefs(), HEADING);
    expect(mock.scheduled.map((r) => r.activityId).sort()).toEqual([
      "gone",
      "kept",
    ]);

    // segunda sincronizacao: "gone" foi concluida, "kept" permanece
    await store
      .getState()
      .syncReminders(
        [kept, { ...gone, status: "completed" }],
        prefs(),
        HEADING,
      );

    expect(mock.cancelled).toEqual(["gone"]);
    // "kept" nao e reagendada (mesmo horario)
    expect(mock.scheduled).toHaveLength(2);
  });

  it("master off cancels all", async () => {
    const mock = makePort();
    const store = makeStore(mock.port);
    await store.getState().hydratePermission();

    await store
      .getState()
      .syncReminders([activity({ due: dueAt(120) })], prefs({ enabled: false }), HEADING);
    expect(mock.cancelAllCount).toBe(1);

    // canal so no app tambem cancela tudo do sistema
    await store
      .getState()
      .syncReminders([activity({ due: dueAt(120) })], prefs({ channel: "in-app" }), HEADING);
    expect(mock.cancelAllCount).toBe(2);
    expect(mock.scheduled).toHaveLength(0);
  });

  it("permission not granted cancels all", async () => {
    const mock = makePort({ permission: "denied" });
    const store = makeStore(mock.port);
    await store.getState().hydratePermission();

    await store
      .getState()
      .syncReminders([activity({ due: dueAt(120) })], prefs(), HEADING);

    expect(mock.cancelAllCount).toBe(1);
    expect(mock.scheduled).toHaveLength(0);
  });

  it("quiet hours suppress", async () => {
    const mock = makePort();
    const store = makeStore(mock.port);
    await store.getState().hydratePermission();

    const fireAt = Date.parse(dueAt(120)) - 30 * MINUTE;
    await store
      .getState()
      .syncReminders(
        [activity({ due: dueAt(120) })],
        prefs({ quietHours: quietWindowAround(fireAt) }),
        HEADING,
      );

    expect(mock.scheduled).toHaveLength(0);
  });

  it("schedule failure flags unavailable", async () => {
    const mock = makePort({ failSchedule: true });
    const store = makeStore(mock.port);
    await store.getState().hydratePermission();

    await store
      .getState()
      .syncReminders([activity({ due: dueAt(120) })], prefs(), HEADING);

    expect(store.getState().osUnavailable).toBe(true);
    expect(store.getState().permission).toBe("granted");
  });

  it("request permission records outcome", async () => {
    const mock = makePort({
      permission: "undetermined",
      requestResult: "granted",
    });
    const store = makeStore(mock.port);
    await store.getState().hydratePermission();

    const result = await store.getState().requestOsPermission();

    expect(result).toBe("granted");
    expect(store.getState().permission).toBe("granted");
    expect(mock.requestCount).toBe(1);
  });

  it("hydrate flags unavailable when unsupported", async () => {
    const mock = makePort({ supported: false });
    const store = makeStore(mock.port);
    await store.getState().hydratePermission();

    expect(store.getState().supported).toBe(false);
    expect(store.getState().osUnavailable).toBe(true);
  });
});
