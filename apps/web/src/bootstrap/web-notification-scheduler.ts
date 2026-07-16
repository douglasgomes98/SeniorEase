import type {
  NotificationPermissionStatus,
  NotificationSchedulerPort,
  ScheduledReminder,
} from "@senior-ease/core";

/** Teto de um setTimeout (2^31-1 ms ~ 24,8 dias); acima disso, re-arma. */
const MAX_TIMEOUT_MS = 2_147_483_647;

/** Mapeia Notification.permission do navegador para o contrato da porta. */
function mapPermission(
  permission: NotificationPermission,
): NotificationPermissionStatus {
  if (permission === "granted") {
    return "granted";
  }
  if (permission === "denied") {
    return "denied";
  }
  return "undetermined";
}

/**
 * Adaptador da Web: implementa a porta de notificacoes sobre a API Notification
 * do navegador + timers em pagina. Agenda um timer por atividade, chaveado pelo
 * id, que dispara `new Notification(heading, { body })` no horario. Limitacao
 * conhecida e documentada: sem Service Worker (fora de escopo), os timers so
 * disparam enquanto a aba/pagina esta viva - a entrega com o app fechado e
 * garantida apenas no Mobile; na Web o aviso dentro do app e a camada sempre
 * presente. Zero regra de negocio: o `heading` chega traduzido e o `fireAt` ja
 * calculado pelo core.
 */
export class WebNotificationScheduler implements NotificationSchedulerPort {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  getPermission(): Promise<NotificationPermissionStatus> {
    if (!this.isSupported()) {
      return Promise.resolve("denied");
    }
    return Promise.resolve(mapPermission(Notification.permission));
  }

  async requestPermission(): Promise<NotificationPermissionStatus> {
    if (!this.isSupported()) {
      return "denied";
    }
    const result = await Notification.requestPermission();
    return mapPermission(result);
  }

  schedule(reminder: ScheduledReminder): Promise<void> {
    if (!this.isSupported()) {
      // Rejeita para o core marcar osUnavailable e degradar para o aviso no app.
      return Promise.reject(new Error("Notifications are not supported."));
    }
    this.clearTimer(reminder.activityId); // idempotente por activityId
    this.arm(reminder);
    return Promise.resolve();
  }

  cancel(activityId: string): Promise<void> {
    this.clearTimer(activityId);
    return Promise.resolve();
  }

  cancelAll(): Promise<void> {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    return Promise.resolve();
  }

  /**
   * Arma o timer para o horario do lembrete. Delays acima do teto de um
   * setTimeout sao re-armados ao se aproximarem, evitando o disparo imediato
   * (bug do overflow de 32 bits).
   */
  private arm(reminder: ScheduledReminder): void {
    const delay = reminder.fireAt - Date.now();
    if (delay <= MAX_TIMEOUT_MS) {
      const timer = setTimeout(() => {
        this.timers.delete(reminder.activityId);
        this.fire(reminder);
      }, Math.max(0, delay));
      this.timers.set(reminder.activityId, timer);
      return;
    }
    const timer = setTimeout(() => this.arm(reminder), MAX_TIMEOUT_MS);
    this.timers.set(reminder.activityId, timer);
  }

  private fire(reminder: ScheduledReminder): void {
    try {
      new Notification(reminder.heading, { body: reminder.body });
    } catch {
      // Se o disparo falhar, o aviso dentro do app segue cobrindo o lembrete.
    }
  }

  private clearTimer(activityId: string): void {
    const timer = this.timers.get(activityId);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(activityId);
    }
  }
}
