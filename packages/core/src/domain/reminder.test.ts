import { describe, it, expect } from "vitest";
import {
  reminderTimeMs,
  dueStatus,
  isWithinQuietHours,
  collectDueBuckets,
  buildReminderPlan,
  shouldDeliverOs,
  shouldSurfaceInApp,
} from "./reminder";
import type { Activity } from "./activity";
import type { NotificationPreferences } from "./notification-preferences";

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);
const MINUTE = 60000;

/** Constroi uma atividade minima para os testes, com sobreposicoes pontuais. */
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

/** Vencimento ISO a `deltaMinutes` do NOW (negativo = passado). */
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

describe("reminder", () => {
  it("reminder time is due minus lead", () => {
    const due = dueAt(60);
    expect(reminderTimeMs(due, 30)).toBe(Date.parse(due) - 30 * MINUTE);
    expect(reminderTimeMs("", 30)).toBeNull();
    expect(reminderTimeMs("not-a-date", 30)).toBeNull();
  });

  it("due status buckets", () => {
    // vencido: uma hora no passado
    expect(dueStatus(dueAt(-60), NOW, 30)).toBe("overdue");
    // chegando: vence em 15 min, dentro da janela de antecedencia de 30
    expect(dueStatus(dueAt(15), NOW, 30)).toBe("upcoming");
    // agendado: vence em 2 horas, ainda fora da janela
    expect(dueStatus(dueAt(120), NOW, 30)).toBe("scheduled");
    // sem vencimento ou invalido
    expect(dueStatus("", NOW, 30)).toBe("none");
    expect(dueStatus("not-a-date", NOW, 30)).toBe("none");
  });

  it("quiet hours accepts and wraps midnight", () => {
    const window = { start: "22:00", end: "07:00" };
    expect(isWithinQuietHours("23:30", window)).toBe(true);
    expect(isWithinQuietHours("06:00", window)).toBe(true);
    expect(isWithinQuietHours("12:00", window)).toBe(false);
    expect(isWithinQuietHours("12:00", null)).toBe(false);
    // janela sem cruzar a meia-noite
    expect(isWithinQuietHours("13:00", { start: "12:00", end: "14:00" })).toBe(
      true,
    );
    expect(isWithinQuietHours("14:00", { start: "12:00", end: "14:00" })).toBe(
      false,
    );
    // janela degenerada nao suprime nada
    expect(isWithinQuietHours("12:00", { start: "12:00", end: "12:00" })).toBe(
      false,
    );
  });

  it("buckets exclude completed and non-due", () => {
    const activities = [
      activity({ id: "upcoming", due: dueAt(15) }),
      activity({ id: "overdue", due: dueAt(-30) }),
      activity({ id: "scheduled", due: dueAt(180) }),
      activity({ id: "no-due", due: "" }),
      activity({ id: "done", due: dueAt(10), status: "completed" }),
    ];
    const buckets = collectDueBuckets(activities, NOW, 30);
    expect(buckets.upcoming.map((a) => a.id)).toEqual(["upcoming"]);
    expect(buckets.overdue.map((a) => a.id)).toEqual(["overdue"]);
  });

  it("plan excludes past-due and non-os", () => {
    const activities = [
      activity({ id: "future", due: dueAt(120) }),
      activity({ id: "past", due: dueAt(-10) }),
      activity({ id: "no-due", due: "" }),
      activity({ id: "done", due: dueAt(120), status: "completed" }),
    ];
    const plan = buildReminderPlan(activities, prefs(), NOW);
    expect(plan).toHaveLength(1);
    const [planned] = plan;
    expect(planned).toEqual({
      activityId: "future",
      title: "Pagar a conta de luz",
      fireAt: Date.parse(dueAt(120)) - 30 * MINUTE,
    });
    expect(planned!.fireAt).toBeGreaterThan(NOW);

    // canal so no app: nada a agendar no sistema
    expect(buildReminderPlan(activities, prefs({ channel: "in-app" }), NOW)).toEqual(
      [],
    );
    // interruptor mestre desligado: nada a agendar
    expect(buildReminderPlan(activities, prefs({ enabled: false }), NOW)).toEqual(
      [],
    );
    // canal so no sistema ainda agenda
    expect(
      buildReminderPlan(activities, prefs({ channel: "os" }), NOW).map(
        (p) => p.activityId,
      ),
    ).toEqual(["future"]);
  });

  it("delivery predicates", () => {
    // OS: so com interruptor ligado, canal os/both e permissao concedida
    expect(shouldDeliverOs(prefs({ channel: "both" }), "granted")).toBe(true);
    expect(shouldDeliverOs(prefs({ channel: "os" }), "granted")).toBe(true);
    expect(shouldDeliverOs(prefs({ channel: "in-app" }), "granted")).toBe(false);
    expect(shouldDeliverOs(prefs({ channel: "both" }), "denied")).toBe(false);
    expect(shouldDeliverOs(prefs({ channel: "both" }), "undetermined")).toBe(
      false,
    );
    expect(shouldDeliverOs(prefs({ enabled: false }), "granted")).toBe(false);

    // In-app: com canal in-app/both, ou sempre que o OS estiver indisponivel
    expect(shouldSurfaceInApp(prefs({ channel: "in-app" }), true)).toBe(true);
    expect(shouldSurfaceInApp(prefs({ channel: "both" }), true)).toBe(true);
    expect(shouldSurfaceInApp(prefs({ channel: "os" }), true)).toBe(false);
    // degradacao: canal os mas sistema indisponivel -> mostra no app
    expect(shouldSurfaceInApp(prefs({ channel: "os" }), false)).toBe(true);
    // desligado: nunca mostra
    expect(shouldSurfaceInApp(prefs({ enabled: false }), false)).toBe(false);
  });
});
