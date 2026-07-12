/**
 * Value object: preferencias de lembretes/notificacoes.
 * Concentra o grupo de configuracao mostrado na tela de perfil e usado pelos
 * lembretes. As invariantes (conjunto de antecedencias, canais, formato de
 * horas silenciosas) vivem aqui - nunca na UI.
 */
export const NOTIFICATION_LEAD_TIMES = [5, 15, 30, 60, 1440] as const;

export type NotificationLeadTime = (typeof NOTIFICATION_LEAD_TIMES)[number];

export const NOTIFICATION_CHANNELS = ["in-app", "os", "both"] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export interface QuietHours {
  /** Inicio no formato "HH:mm" 24h. */
  start: string;
  /** Fim no formato "HH:mm" 24h. */
  end: string;
}

export interface NotificationPreferences {
  /** Interruptor mestre - desligado ate o usuario optar por ativar. */
  enabled: boolean;
  leadTimeMinutes: NotificationLeadTime;
  channel: NotificationChannel;
  quietHours: QuietHours | null;
}

export const NOTIFICATION_LEAD_TIME_DEFAULT: NotificationLeadTime = 30;

/**
 * Canal padrao "both": entrega no app e no sistema operacional. A entrega pelo
 * sistema so acontece de fato depois que o usuario liga as notificacoes e concede
 * a permissao (fluxo dos lembretes) - ate la nada e enviado por fora do app.
 */
export const NOTIFICATION_CHANNEL_DEFAULT: NotificationChannel = "both";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: false,
  leadTimeMinutes: NOTIFICATION_LEAD_TIME_DEFAULT,
  channel: NOTIFICATION_CHANNEL_DEFAULT,
  quietHours: null,
};

const QUIET_HOURS_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isNotificationLeadTime(
  value: unknown,
): value is NotificationLeadTime {
  return (
    typeof value === "number" &&
    (NOTIFICATION_LEAD_TIMES as readonly number[]).includes(value)
  );
}

export function isNotificationChannel(
  value: unknown,
): value is NotificationChannel {
  return (
    typeof value === "string" &&
    (NOTIFICATION_CHANNELS as readonly string[]).includes(value)
  );
}

export function isQuietHoursTime(value: unknown): value is string {
  return typeof value === "string" && QUIET_HOURS_TIME_PATTERN.test(value);
}
