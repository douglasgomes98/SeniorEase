import type { NotificationPermissionStatus } from "../../domain/reminder";

/**
 * Porta de agendamento de notificacoes locais. Abstrai a capacidade de
 * notificacao da plataforma atras de pedir permissao, agendar, cancelar e
 * cancelar tudo - chaveado pelo id da atividade. Segue o mesmo idioma do
 * `StoragePort`: o core nunca referencia uma API concreta; cada app injeta seu
 * adaptador no composition root (`expo-notifications` no Mobile, a API
 * `Notification` do navegador + timers na Web).
 */

export type { NotificationPermissionStatus };

/**
 * Um lembrete ja resolvido para agendamento. Carrega o minimo (menor
 * privilegio): um `heading` estatico localizado (cromo do app) e o `body` igual
 * ao titulo da atividade - nunca descricao, passos ou detalhe do vencimento.
 */
export interface ScheduledReminder {
  /** Chave estavel; tambem o identificador da notificacao na plataforma. */
  activityId: string;
  /** Cromo estatico localizado, ex.: "Lembrete" - nao e dado do usuario. */
  heading: string;
  /** Apenas o titulo da atividade (menor privilegio). */
  body: string;
  /** Epoch ms; ja calculado como `vencimento - antecedencia` (sempre futuro). */
  fireAt: number;
}

export interface NotificationSchedulerPort {
  /** Capacidade da plataforma (sincrono). */
  isSupported(): boolean;
  /** Situacao atual da permissao, sem abrir o prompt. */
  getPermission(): Promise<NotificationPermissionStatus>;
  /** Abre o prompt uma vez; resolve com o resultado. */
  requestPermission(): Promise<NotificationPermissionStatus>;
  /** Idempotente por activityId; rejeita em caso de falha da plataforma. */
  schedule(reminder: ScheduledReminder): Promise<void>;
  /** Remove um lembrete agendado. */
  cancel(activityId: string): Promise<void>;
  /** Remove todos os lembretes agendados. */
  cancelAll(): Promise<void>;
}
