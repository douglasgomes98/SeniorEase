import { create, type StoreApi, type UseBoundStore } from "zustand";
import type { Activity } from "../domain/activity";
import type { NotificationPreferences } from "../domain/notification-preferences";
import {
  buildReminderPlan,
  isWithinQuietHours,
  shouldDeliverOs,
  type NotificationPermissionStatus,
} from "../domain/reminder";
import type { NotificationSchedulerPort } from "../application/ports/notification-scheduler-port";

export interface ReminderState {
  /** Situacao da permissao; semeada por hydratePermission, efemera. */
  permission: NotificationPermissionStatus;
  /** Verdadeiro apos um schedule() rejeitar ou quando a plataforma nao suporta. */
  osUnavailable: boolean;
  /** Capacidade da plataforma (scheduler.isSupported()). */
  supported: boolean;
  /** Semeia supported + permission, sem abrir prompt. */
  hydratePermission: () => Promise<void>;
  /** Abre o prompt uma vez e registra o resultado. */
  requestOsPermission: () => Promise<NotificationPermissionStatus>;
  /**
   * Reconciliador: com a entrega pelo sistema desligada, cancela tudo e limpa o
   * conjunto agendado; ligada, monta o plano, descarta os suprimidos por horas
   * silenciosas, cancela os que sairam do plano, agenda os novos (ou os que
   * mudaram de horario) e liga osUnavailable se um schedule rejeitar.
   */
  syncReminders: (
    activities: Activity[],
    prefs: NotificationPreferences,
    heading: string,
  ) => Promise<void>;
  /** Cancela todos os lembretes agendados. */
  cancelAll: () => Promise<void>;
}

export interface ReminderStoreDeps {
  scheduler: NotificationSchedulerPort;
  /** Relogio injetado para determinismo nos testes; padrao Date.now. */
  now?: () => number;
}

export type ReminderStore = UseBoundStore<StoreApi<ReminderState>>;

/** Converte um epoch ms no "HH:mm" local do dispositivo (seam dependente de fuso). */
function toLocalHHmm(ms: number): string {
  const date = new Date(ms);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Fabrica da store de lembretes. Recebe a porta de notificacoes por injecao
 * (composition root). A store e um adaptador fino: mantem o estado efemero de
 * permissao/disponibilidade e o conjunto do que esta agendado, e delega a
 * decisao pura ao dominio de lembretes. O mapa activityId -> fireAt permite
 * diferenciar barato: reagenda so quando o horario muda (ex.: mudou a
 * antecedencia) e cancela apenas o que saiu do plano.
 */
export function createReminderStore(deps: ReminderStoreDeps): ReminderStore {
  const clock = deps.now ?? ((): number => Date.now());
  const scheduled = new Map<string, number>();

  return create<ReminderState>((set, get) => ({
    permission: "undetermined",
    osUnavailable: false,
    supported: false,
    hydratePermission: async (): Promise<void> => {
      const supported = deps.scheduler.isSupported();
      if (!supported) {
        set({ supported: false, osUnavailable: true });
        return;
      }
      const permission = await deps.scheduler.getPermission();
      set({ supported: true, permission, osUnavailable: false });
    },
    requestOsPermission: async (): Promise<NotificationPermissionStatus> => {
      const permission = await deps.scheduler.requestPermission();
      set({ permission });
      return permission;
    },
    syncReminders: async (
      activities: Activity[],
      prefs: NotificationPreferences,
      heading: string,
    ): Promise<void> => {
      const deliver =
        get().supported && shouldDeliverOs(prefs, get().permission);

      if (!deliver) {
        await deps.scheduler.cancelAll();
        scheduled.clear();
        return;
      }

      const plan = buildReminderPlan(activities, prefs, clock()).filter(
        (reminder) =>
          !isWithinQuietHours(toLocalHHmm(reminder.fireAt), prefs.quietHours),
      );
      const plannedIds = new Set(plan.map((reminder) => reminder.activityId));

      // Cancela o que saiu do plano (concluido, excluido, suprimido ou vencido).
      for (const activityId of [...scheduled.keys()]) {
        if (!plannedIds.has(activityId)) {
          await deps.scheduler.cancel(activityId);
          scheduled.delete(activityId);
        }
      }

      // Agenda os novos e reagenda os que mudaram de horario.
      let failed = false;
      for (const reminder of plan) {
        if (scheduled.get(reminder.activityId) === reminder.fireAt) {
          continue;
        }
        try {
          await deps.scheduler.schedule({
            activityId: reminder.activityId,
            heading,
            body: reminder.title,
            fireAt: reminder.fireAt,
          });
          scheduled.set(reminder.activityId, reminder.fireAt);
        } catch {
          failed = true;
          break;
        }
      }

      if (get().osUnavailable !== failed) {
        set({ osUnavailable: failed });
      }
    },
    cancelAll: async (): Promise<void> => {
      await deps.scheduler.cancelAll();
      scheduled.clear();
    },
  }));
}
