import type { Activity } from "./activity";
import type {
  NotificationChannel,
  NotificationPreferences,
  QuietHours,
} from "./notification-preferences";

/**
 * Logica pura de lembretes. Transforma o vencimento de uma atividade e as
 * preferencias de notificacao em decisoes: o horario do lembrete
 * (`vencimento - antecedencia`), a classificacao em atrasado/chegando/agendado
 * contra um "agora" injetado, a supressao por horas silenciosas para um horario
 * dado (janela que pode cruzar a meia-noite), os baldes de chegando/atrasado
 * para o aviso dentro do app, o plano de lembretes so no futuro e os pequenos
 * predicados que decidem a entrega pelo sistema operacional e o aviso no app.
 *
 * Como o resto do dominio, e totalmente puro: o relogio (`now`) e injetado, nao
 * ha estado global e cada funcao e coberta pelo Vitest. A conversao dependente
 * de fuso (horario de disparo -> "HH:mm" local) fica no reconciliador da store,
 * fora daqui.
 */

/** Status de um vencimento contra o "agora", ja considerando a antecedencia. */
export type ReminderStatus = "overdue" | "upcoming" | "scheduled" | "none";

/**
 * Situacao da permissao do sistema operacional. Vive no dominio (conceito puro)
 * e e reexportada pela porta de notificacoes para compor o contrato do adaptador.
 */
export type NotificationPermissionStatus = "granted" | "denied" | "undetermined";

/** Um lembrete a agendar: sempre com `fireAt` no futuro. */
export interface PlannedReminder {
  activityId: string;
  /** Titulo da atividade; vira o corpo (`body`) da notificacao. */
  title: string;
  /** `vencimento - antecedencia` em epoch ms, sempre > now. */
  fireAt: number;
}

/** Baldes de atividades pendentes para o aviso dentro do app. */
export interface DueBuckets {
  /** Pendentes dentro da janela de antecedencia, ainda nao vencidas. */
  upcoming: Activity[];
  /** Pendentes ja vencidas. */
  overdue: Activity[];
}

const MS_PER_MINUTE = 60000;

/** Converte o vencimento ISO em epoch ms, ou null quando ausente/invalido. */
function parseDue(due: string): number | null {
  if (due === "") {
    return null;
  }
  const parsed = Date.parse(due);
  return Number.isNaN(parsed) ? null : parsed;
}

/** Converte "HH:mm" em minutos desde a meia-noite, ou null quando invalido. */
function toMinutesOfDay(timeHHmm: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeHHmm);
  if (!match) {
    return null;
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Verdadeiro quando o canal contempla a entrega pelo sistema operacional. */
function channelIncludesOs(channel: NotificationChannel): boolean {
  return channel === "os" || channel === "both";
}

/** Verdadeiro quando o canal contempla o aviso dentro do app. */
function channelIncludesInApp(channel: NotificationChannel): boolean {
  return channel === "in-app" || channel === "both";
}

/**
 * Horario do lembrete: `vencimento - antecedencia` em epoch ms. Devolve null
 * quando nao ha vencimento ou ele e invalido - nada a lembrar.
 */
export function reminderTimeMs(
  due: string,
  leadTimeMinutes: number,
): number | null {
  const dueMs = parseDue(due);
  if (dueMs === null) {
    return null;
  }
  return dueMs - leadTimeMinutes * MS_PER_MINUTE;
}

/**
 * Classifica um vencimento contra o "agora": `none` sem vencimento/invalido,
 * `overdue` quando ja passou, `upcoming` quando esta dentro da janela de
 * antecedencia (ja da para lembrar) e `scheduled` quando ainda esta distante.
 */
export function dueStatus(
  due: string,
  now: number,
  leadTimeMinutes: number,
): ReminderStatus {
  const dueMs = parseDue(due);
  if (dueMs === null) {
    return "none";
  }
  if (now >= dueMs) {
    return "overdue";
  }
  const reminderAt = dueMs - leadTimeMinutes * MS_PER_MINUTE;
  return now >= reminderAt ? "upcoming" : "scheduled";
}

/**
 * Verdadeiro quando o horario "HH:mm" cai dentro das horas silenciosas. Sem
 * janela (`null`) nada e suprimido. A janela pode cruzar a meia-noite
 * (ex.: 22:00-07:00): nesse caso vale de `start` ate 23:59 e de 00:00 ate `end`.
 * Uma janela degenerada (`start === end`) nao suprime nada. Predicado puro sobre
 * strings, independente de fuso.
 */
export function isWithinQuietHours(
  timeHHmm: string,
  quietHours: QuietHours | null,
): boolean {
  if (quietHours === null) {
    return false;
  }
  const time = toMinutesOfDay(timeHHmm);
  const start = toMinutesOfDay(quietHours.start);
  const end = toMinutesOfDay(quietHours.end);
  if (time === null || start === null || end === null || start === end) {
    return false;
  }
  if (start < end) {
    return time >= start && time < end;
  }
  return time >= start || time < end;
}

/**
 * Separa as atividades pendentes com vencimento em chegando (dentro da janela
 * de antecedencia) e atrasadas (ja vencidas), preservando a ordem de entrada.
 * Concluidas e sem vencimento ficam de fora - o balde alimenta o aviso no app.
 */
export function collectDueBuckets(
  activities: Activity[],
  now: number,
  leadTimeMinutes: number,
): DueBuckets {
  const upcoming: Activity[] = [];
  const overdue: Activity[] = [];
  for (const activity of activities) {
    if (activity.status !== "pending") {
      continue;
    }
    const status = dueStatus(activity.due, now, leadTimeMinutes);
    if (status === "overdue") {
      overdue.push(activity);
    } else if (status === "upcoming") {
      upcoming.push(activity);
    }
  }
  return { upcoming, overdue };
}

/**
 * Monta o plano de lembretes do sistema operacional: apenas atividades
 * pendentes, com vencimento, cujo horario de disparo (`vencimento - antecedencia`)
 * esta no futuro, e desde que o interruptor mestre esteja ligado e o canal
 * contemple o sistema operacional. Atrasadas nao entram (viram aviso no app).
 * A supressao por horas silenciosas e aplicada depois, no reconciliador.
 */
export function buildReminderPlan(
  activities: Activity[],
  prefs: NotificationPreferences,
  now: number,
): PlannedReminder[] {
  if (!prefs.enabled || !channelIncludesOs(prefs.channel)) {
    return [];
  }
  const plan: PlannedReminder[] = [];
  for (const activity of activities) {
    if (activity.status !== "pending") {
      continue;
    }
    const fireAt = reminderTimeMs(activity.due, prefs.leadTimeMinutes);
    if (fireAt !== null && fireAt > now) {
      plan.push({ activityId: activity.id, title: activity.title, fireAt });
    }
  }
  return plan;
}

/**
 * Verdadeiro quando um lembrete deve ser entregue pelo sistema operacional:
 * interruptor ligado, canal contemplando o sistema e permissao concedida.
 */
export function shouldDeliverOs(
  prefs: NotificationPreferences,
  permission: NotificationPermissionStatus,
): boolean {
  return (
    prefs.enabled &&
    channelIncludesOs(prefs.channel) &&
    permission === "granted"
  );
}

/**
 * Verdadeiro quando os lembretes devem aparecer dentro do app: interruptor
 * ligado e canal contemplando o app OU, como degradacao gentil, sempre que a
 * entrega pelo sistema estiver indisponivel (permissao negada, falha, sem
 * suporte) - garantindo que abrir o app sempre mostre o que esta chegando/atrasado.
 */
export function shouldSurfaceInApp(
  prefs: NotificationPreferences,
  osAvailable: boolean,
): boolean {
  return prefs.enabled && (channelIncludesInApp(prefs.channel) || !osAvailable);
}
