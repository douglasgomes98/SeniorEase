/**
 * Entidade de dominio: atividade persistida.
 * Este modulo concentra apenas a forma persistida e suas invariantes (limites de
 * tamanho, estados validos, guardas). As operacoes de mutacao - criar, concluir,
 * excluir, ordenar - sao funcoes puras em `activity-operations.ts` (id e relogio
 * injetados); o container as executa e persiste o resultado, nunca a UI.
 */
export const ACTIVITY_TITLE_MAX_LENGTH = 80;
export const ACTIVITY_DESCRIPTION_MAX_LENGTH = 280;
export const ACTIVITY_STEP_MAX_LENGTH = 120;
export const ACTIVITY_STEPS_MAX = 20;
/** Teto da colecao: guarda os primeiros 100 registros validos. */
export const ACTIVITIES_MAX = 100;

export const ACTIVITY_STATUSES = ["pending", "completed"] as const;

export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const ACTIVITY_STATUS_DEFAULT: ActivityStatus = "pending";

export interface Activity {
  id: string;
  /** Titulo obrigatorio, limitado a ACTIVITY_TITLE_MAX_LENGTH. */
  title: string;
  /** Descricao opcional, limitada a ACTIVITY_DESCRIPTION_MAX_LENGTH. */
  description: string;
  /** Passos ordenados; no maximo ACTIVITY_STEPS_MAX, cada um limitado. */
  steps: string[];
  /** Data/hora ISO do vencimento, ou "" quando nao ha. */
  due: string;
  status: ActivityStatus;
  /** Momento de criacao em epoch ms. */
  createdAt: number;
  /** Momento de conclusao em epoch ms, ou null enquanto pendente. */
  completedAt: number | null;
}

export function isActivityStatus(value: unknown): value is ActivityStatus {
  return (
    typeof value === "string" &&
    (ACTIVITY_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * Coage qualquer entrada ao conjunto de estados valido: apenas "completed" vira
 * concluido; qualquer outra coisa cai para pendente (fail-safe).
 */
export function normalizeActivityStatus(value: unknown): ActivityStatus {
  return value === "completed" ? "completed" : ACTIVITY_STATUS_DEFAULT;
}

/** Limita o titulo ao tamanho maximo. A regra vive no dominio, nunca na UI. */
export function clampActivityTitle(title: string): string {
  return title.slice(0, ACTIVITY_TITLE_MAX_LENGTH);
}

/** Limita a descricao ao tamanho maximo. */
export function clampActivityDescription(description: string): string {
  return description.slice(0, ACTIVITY_DESCRIPTION_MAX_LENGTH);
}

/**
 * Reduz uma entrada desconhecida a passos validos: mantem apenas strings, limita
 * cada passo ao tamanho maximo e a lista a ACTIVITY_STEPS_MAX (fail-safe).
 */
export function normalizeActivitySteps(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const steps: string[] = [];
  for (const step of value) {
    if (steps.length >= ACTIVITY_STEPS_MAX) {
      break;
    }
    if (typeof step === "string") {
      steps.push(step.slice(0, ACTIVITY_STEP_MAX_LENGTH));
    }
  }
  return steps;
}
